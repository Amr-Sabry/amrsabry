#!/usr/bin/env python3
"""Nevera cast: rigged mannequins with their instruments and props, written in the viewer's scene format (scene.json + geo0.txt)."""
import numpy as np,math,json,gzip,base64,os,sys
R_=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# ---------- geometry ----------
def rot(ax,deg):
    ax=np.array(ax,float); ax/=np.linalg.norm(ax); a=math.radians(deg); c,s=math.cos(a),math.sin(a); x,y,z=ax
    return np.array([[c+x*x*(1-c),x*y*(1-c)-z*s,x*z*(1-c)+y*s],[y*x*(1-c)+z*s,c+y*y*(1-c),y*z*(1-c)-x*s],[z*x*(1-c)-y*s,z*y*(1-c)+x*s,c+z*z*(1-c)]])
def M4(R=None,t=None):
    m=np.eye(4)
    if R is not None: m[:3,:3]=R
    if t is not None: m[:3,3]=t
    return m
def xf(m,v): return (np.c_[v,np.ones(len(v))]@m.T)[:,:3]
class G:
    def __init__(s,v=None,f=None,flat=False): s.v=np.zeros((0,3)) if v is None else np.array(v,float); s.f=np.zeros((0,3),int) if f is None else np.array(f,int); s.flat=flat
    def __add__(s,o):
        return G(np.vstack([s.v,o.v]),np.vstack([s.f,o.f+len(s.v)]))
    def t(s,m): return G(xf(m,s.v),s.f)
def orient(g):
    if not len(g.f): return g
    a,b,c=g.v[g.f[:,0]],g.v[g.f[:,1]],g.v[g.f[:,2]]
    if np.einsum('ij,ij->i',a,np.cross(b,c)).sum()<0: g.f=g.f[:,[0,2,1]]
    return g
def loft(sec,n=14,caps=True):
    """sec: (cx,y,cz,rx,rz) rings along Y"""
    V=[];F=[];m=len(sec)
    for (cx,y,cz,rx,rz) in sec:
        for k in range(n):
            a=2*math.pi*k/n; V.append((cx+rx*math.cos(a),y,cz+rz*math.sin(a)))
    for i in range(m-1):
        for k in range(n):
            a=i*n+k;b=i*n+(k+1)%n;c=a+n;d=b+n; F+= [(a,c,b),(b,c,d)]
    if caps:
        i0=len(V);V.append((sec[0][0],sec[0][1],sec[0][2]));i1=len(V);V.append((sec[-1][0],sec[-1][1],sec[-1][2]))
        for k in range(n):
            F.append((i0,k,(k+1)%n)); F.append((i1,(m-1)*n+(k+1)%n,(m-1)*n+k))
    return orient(G(V,F))
def frame(d):
    d=np.array(d,float); d/=np.linalg.norm(d); u=np.array([0,0,1.]) if abs(d[2])<.9 else np.array([1.,0,0]); x=np.cross(u,d); x/=np.linalg.norm(x); z=np.cross(x,d); return np.c_[x,d,z]
def tube(a,b,ra,rb=None,n=8):
    a=np.array(a,float);b=np.array(b,float);rb=ra if rb is None else rb;L=np.linalg.norm(b-a)
    g=loft([(0,0,0,ra,ra),(0,L,0,rb,rb)],n); return g.t(M4(frame(b-a),a))
def poly(pts,r,n=6):
    g=G()
    for a,b in zip(pts,pts[1:]): g=g+tube(a,b,r,r,n)
    return g
def ell(c,rx,ry,rz,nu=14,nv=10):
    V=[];F=[]
    for i in range(nv+1):
        p=math.pi*i/nv
        for k in range(nu):
            a=2*math.pi*k/nu; V.append((c[0]+rx*math.sin(p)*math.cos(a),c[1]+ry*math.cos(p),c[2]+rz*math.sin(p)*math.sin(a)))
    for i in range(nv):
        for k in range(nu):
            a=i*nu+k;b=i*nu+(k+1)%nu;c2=a+nu;d=b+nu;F+=[(a,b,c2),(b,d,c2)]
    return orient(G(V,F))
def box(c,sx,sy,sz,R=None):
    x,y,z=sx/2,sy/2,sz/2; base=np.array([[-x,-y,-z],[x,-y,-z],[x,y,-z],[-x,y,-z],[-x,-y,z],[x,-y,z],[x,y,z],[-x,y,z]])
    faces=[(0,3,2,1),(4,5,6,7),(0,1,5,4),(2,3,7,6),(1,2,6,5),(0,4,7,3)];V=[];F=[]
    for q in faces:
        i=len(V);V+= [base[k] for k in q];F+=[(i,i+1,i+2),(i,i+2,i+3)]
    g=G(V,F);g.flat=True
    return g.t(M4(R if R is not None else np.eye(3),c))
def lathe(pr,n=20):
    return loft([(0,y,0,r,r) for r,y in pr],n)
def ext(outline,y0,y1):
    o=np.array(outline,float);n=len(o);V=[];F=[]
    for y in (y0,y1):
        V+=[(p[0],y,p[1]) for p in o]
    c=o.mean(0);V+=[(c[0],y0,c[1]),(c[0],y1,c[1])]
    for k in range(n):
        j=(k+1)%n;F+=[(k,j,k+n),(j,j+n,k+n),(2*n,j,k),(2*n+1,k+n,j+n)]
    return orient(G(V,F))
def at(g,o,x,y):
    """Place local geometry: local Y along y, local X toward x."""
    y=np.array(y,float);y/=np.linalg.norm(y);x=np.array(x,float);x=x-y*x.dot(y);x/=np.linalg.norm(x);z=np.cross(x,y)
    return g.t(M4(np.c_[x,y,z],o))
# ---------- instruments and props (local space; G pieces per material) ----------
def fiddle(L,thick,neck,bow=True,pin=False):
    """Body centred at origin, neck up +Y, top faces +Z. Returns dict material->G"""
    w=L*0.30
    s=[(0,-.5*L,0,.04*L,thick*.25),(0,-.44*L,0,w*.85,thick*.45),(0,-.28*L,0,w,thick*.5),(0,-.13*L,0,w*.82,thick*.5),(0,-.02*L,0,w*.5,thick*.5),(0,.1*L,0,w*.62,thick*.5),(0,.27*L,0,w*.74,thick*.5),(0,.42*L,0,w*.58,thick*.42),(0,.5*L,0,.05*L,thick*.25)]
    wood=loft(s,18)
    tb=box((0,.5*L+neck*.45,thick*.32),.035*L,neck,.012*L); 
    dark=tb+box((0,-.34*L,thick*.55),.09*L,.2*L,.008*L)+box((0,.28*L,thick*.55),.05*L,.28*L,.006*L)
    wood=wood+tube((0,.5*L,thick*.2),(0,.5*L+neck,thick*.2),.018*L)+ell((0,.5*L+neck+.03*L,thick*.2),.03*L,.04*L,.025*L)
    st=G()
    for k in (-1.5,-.5,.5,1.5): st=st+tube((k*.012*L,-.24*L,thick*.62),(k*.009*L,.5*L+neck*.9,thick*.42),.0022 if L>.5 else .0012,n=4)
    d={'Wood, instruments':wood,'Black, fittings':dark+box((0,-.12*L,thick*.6),.1*L,.012*L,.05*L),'Steel strings':st}
    if pin: d['Black, fittings']=d['Black, fittings']+tube((0,-.5*L,0),(0,-.5*L-.22*L,0),.008)
    return d
def bowstick(L):
    return {'Wood, dark':tube((0,0,0),(0,L,0),.004,.0025,5),'Steel strings':tube((.012,.02,0),(.012,L-.01,0),.003,n=4)}
def harp():
    # soundbox from the base rising forward, neck curving back to the pillar
    d={};base=np.array((0,.08,0));top=np.array((0,1.72,-.36));pil=np.array((0,1.76,.42))
    sb=tube(base,top,.13,.045,12)
    nk=[top,top+(0,.13,.16),top+(0,.14,.42),pil+(0,.1,-.14),pil]
    d['Wood, gilded brass']=sb+poly(nk,.03,8)+tube((0,.08,.42),pil,.03,.036,10)+box((0,.05,.2),.26,.1,.7)
    st=G()
    for i in range(1,20):
        u=i/20;a=base+(top-base)*u;tb=nk[0]+(nk[3]-nk[0])*u;st=st+tube(a,tb,.0016,n=3)
    d['Steel strings']=st
    return d
def trumpet():
    return {'Brass':tube((0,0,0),(0,.3,0),.009,.009,8)+loft([(0,.3,0,.012,.012),(0,.36,0,.024,.024),(0,.4,0,.058,.058)],14,False)+tube((.03,.05,0),(.03,.24,0),.008)+box((0.015,.14,0),.05,.05,.03)}
def trombone():
    return {'Brass':tube((0,0,0),(0,.75,0),.007)+tube((.09,0,0),(.09,.75,0),.007)+tube((0,.75,0),(.09,.75,0),.007)+tube((.17,-.14,0),(.17,.38,0),.009)+loft([(.17,.38,0,.015,.015),(.17,.5,0,.05,.05),(.17,.56,0,.1,.1)],16,False)}
def tuba():
    return {'Brass':lathe([(.03,0),(.1,.12),(.15,.3),(.12,.5),(.1,.6),(.2,.82),(.26,.88)],20)+tube((.08,.3,.1),(.08,.5,.2),.012)}
def kettle():
    d={'Brass':lathe([(.01,.26),(.22,.32),(.32,.46),(.36,.62),(.36,.72)],24)}
    d['Shirt, white']=lathe([(.36,.72),(.36,.725),(.001,.73)],24)
    d['Steel strings']=tube((.3,.56,0),(.28,0,0),.012)+tube((-.15,.56,.26),(-.14,0,.24),.012)+tube((-.15,.56,-.26),(-.14,0,-.24),.012)
    return d
def snare():
    return {'Steel strings':tube((.0,.56,0),(.18,0,.1),.009)+tube((.0,.56,0),(-.18,0,.1),.009)+tube((.0,.56,0),(0,0,-.2),.009),'Brass':lathe([(.18,.58),(.18,.7)],20),'Shirt, white':lathe([(.18,.7),(.18,.704),(.001,.706)],20)}
def qanun():
    tr=[(-.48,-.2),(.48,-.2),(.48,-.02),(-.2,.2),(-.48,.2)]
    st=G()
    for i in range(20):
        z=-.17+i*.018; st=st+tube((-.44,.066,z),(.44 if z<-.02 else .44-(z+.02)*3,.066,z),.0012,n=3)
    return {'Wood, instruments':ext(tr,0,.055),'Steel strings':st,'Black, fittings':box((-.4,.062,0),.06,.012,.36)}
def piano():
    pts=[(-.75,-.7),(.75,-.7),(.75,.1)]
    for i in range(9):
        a=i/8; pts.append((.75-a*.55,.1+a*a*.9))
    pts+=[(-.2,1.25),(-.75,1.3)]
    leg=lambda x,z:tube((x,0,z),(x,.62,z),.035,.05,8)
    lid=ext(pts,0,.02).t(M4(rot((0,0,1),-28),(-.73,.95,0)))
    return {'Black, piano':ext(pts,.62,.92)+leg(-.62,-.58)+leg(.62,-.58)+leg(-.45,1.05)+lid+tube((.65,.92,.3),(.65,1.3,.3),.008),'Shirt, white':box((0,.72,-.82),1.3,.03,.22),'Black, fittings':box((0,.74,-.76),1.3,.012,.1),'Wood, dark':box((0,.46,-1.32),.9,.05,.34)+tube((-.38,0,-1.2),(-.38,.44,-1.2),.02)+tube((.38,0,-1.2),(.38,.44,-1.2),.02)+tube((-.38,0,-1.44),(-.38,.44,-1.44),.02)+tube((.38,0,-1.44),(.38,.44,-1.44),.02)}
def marimba():
    wood=G();brass=G()
    for i in range(26):
        x=-1.0+i*.08;L=.46-.26*i/25; wood=wood+box((x,.9,0),.066,.025,L); brass=brass+tube((x,.86,0),(x,.86-.5*L-.05,0),.024,n=8)
    return {'Wood, instruments':wood,'Brass':brass,'Black, fittings':box((0,.84,.22),2.2,.03,.03)+box((0,.84,-.22),2.2,.03,.03)+tube((-1.05,0,0),(-1.05,.84,0),.02)+tube((1.05,0,0),(1.05,.84,0),.02)+box((0,.18,0),2.1,.03,.03)}
def chair(h):
    return {'Black, fittings':box((0,h-.02,0),.42,.04,.42)+box((0,h+.26,-.2),.4,.42,.03)+sum((tube((x,0,z),(x,h,z),.014) for x in(-.18,.18) for z in(-.18,.18)),G())}
def tripodcam():
    return {'Black, fittings':box((0,1.42,0),.16,.2,.36)+tube((0,1.46,.18),(0,1.46,.42),.06,.075,12)+box((0,1.56,-.06),.1,.05,.26)+tube((0,1.28,0),(.34,0,.2),.012)+tube((0,1.28,0),(-.34,0,.2),.012)+tube((0,1.28,0),(0,0,-.38),.012)+tube((0,1.3,0),(0,1.3,-.5),.01)}
def presscam():
    return {'Black, fittings':box((0,0,0),.14,.1,.07)+tube((0,0,.03),(0,0,.17),.038,.042,10)+box((0,.09,0),.07,.07,.05)}
def suitcase():
    return {'Black, fittings':box((0,.34,0),.38,.56,.2)+tube((-.1,.62,-.08),(-.12,.98,-.08),.006)+tube((.1,.62,-.08),(.12,.98,-.08),.006)+tube((-.12,.98,-.08),(.12,.98,-.08),.008)}
# ---------- materials ----------
MATS=[('Mannequin',(201,182,156)),('Suit, black',(30,31,35)),('Shirt, white',(232,228,220)),('Trousers',(52,54,60)),('Gown, gold',(190,152,92)),('Gown, deep red',(120,38,42)),('Robe, pale',(214,204,190)),('Linen',(188,172,146)),('Jacket, blue',(62,84,106)),('Jacket, rust',(150,92,58)),('Jacket, olive',(98,102,68)),('Hair, dark',(36,28,24)),('Hair, grey',(150,148,144)),('Wood, instruments',(142,84,42)),('Wood, dark',(70,44,28)),('Wood, gilded brass',(186,146,70)),('Brass',(196,156,72)),('Steel strings',(214,212,204)),('Black, fittings',(24,24,26)),('Black, piano',(14,14,16)),('Plinth, stone',(120,112,100)),('Stage floor',(58,55,50))]
MI={n:i for i,(n,c) in enumerate(MATS)}
# ---------- the body ----------
JN=['turn','lean','leanS','headT','headN','lsF','lsO','le','rsF','rsO','re','lhF','lhO','lk','rhF','rhO','rk']
JLABEL=dict(turn='Turn',lean='Lean forward',leanS='Lean sideways',headT='Head turn',headN='Head nod',lsF='Left arm forward',lsO='Left arm out',le='Left elbow',rsF='Right arm forward',rsO='Right arm out',re='Right elbow',lhF='Left leg forward',lhO='Left leg out',lk='Left knee',rhF='Right leg forward',rhO='Right leg out',rk='Right knee')
PARENT=dict(turn=None,lean='turn',leanS='lean',headT='leanS',headN='headT',lsF='leanS',lsO='lsF',le='lsO',rsF='leanS',rsO='rsF',re='rsO',lhF='turn',lhO='lhF',lk='lhO',rhF='turn',rhO='rhF',rk='rhO')
LIM=dict(turn=(-180,180),lean=(-40,70),leanS=(-40,40),headT=(-80,80),headN=(-45,50),lsF=(-70,180),lsO=(-40,170),le=(0,150),rsF=(-70,180),rsO=(-40,170),re=(0,150),lhF=(-45,120),lhO=(-30,70),lk=(0,150),rhF=(-45,120),rhO=(-30,70),rk=(0,150))
def body(build,H):
    k=dict(m=(.135,.09,1.0),f=(.118,.098,.86),c=(.145,.1,1.08)).get(build)
    sw,hw,w=k
    P=dict(root=(0,0,0),waist=(0,.585,0),neck=(0,.84,0),ls=(sw,.815,0),rs=(-sw,.815,0),lh=(hw,.505,0),rh=(-hw,.505,0))
    P['lel']=(sw,.625,0);P['rel']=(-sw,.625,0);P['lwr']=(sw,.465,0);P['rwr']=(-sw,.465,0);P['lkn']=(hw,.27,0);P['rkn']=(-hw,.27,0);P['lan']=(hw,.04,0);P['ran']=(-hw,.04,0)
    return {n:np.array(v)*H for n,v in P.items()},w,sw,hw
AX=dict(turn=(0,1,0),lean=(1,0,0),leanS=(0,0,1),headT=(0,1,0),headN=(1,0,0),lsF=(-1,0,0),lsO=(0,0,1),le=(-1,0,0),rsF=(-1,0,0),rsO=(0,0,-1),re=(-1,0,0),lhF=(-1,0,0),lhO=(0,0,1),lk=(1,0,0),rhF=(-1,0,0),rhO=(0,0,-1),rk=(1,0,0))
WEAR={'suit':dict(top='Suit, black',arm='Suit, black',leg='Suit, black',shirt=True,tie=True),'tail':dict(top='Suit, black',arm='Suit, black',leg='Suit, black',shirt=True,tails=True),
'gold':dict(top='Gown, gold',arm='Mannequin',leg='Mannequin',skirt='Gown, gold'),'red':dict(top='Gown, deep red',arm='Mannequin',leg='Mannequin',skirt='Gown, deep red'),'black':dict(top='Suit, black',arm='Suit, black',leg='Mannequin',skirt='Suit, black'),'robe':dict(top='Robe, pale',arm='Robe, pale',leg='Mannequin',skirt='Robe, pale'),
'linen':dict(top='Linen',arm='Linen',leg='Trousers'),'blue':dict(top='Jacket, blue',arm='Jacket, blue',leg='Trousers'),'rust':dict(top='Jacket, rust',arm='Jacket, rust',leg='Trousers'),'olive':dict(top='Jacket, olive',arm='Jacket, olive',leg='Trousers')}
def make_figure(spec):
    H=spec.get('H',{'m':1.78,'f':1.66,'c':1.2}[spec['build']]);P,w,sw,hw=body(spec['build'],H);wear=dict(WEAR[spec['wear']]);pose=spec.get('pose',{})
    if spec.get('seated') and 'skirt' in wear: wear['leg']=wear.pop('skirt')
    PIV=dict(turn=P['root'],lean=P['waist'],leanS=P['waist'],headT=P['neck'],headN=P['neck'],lsF=P['ls'],lsO=P['ls'],le=P['lel'],rsF=P['rs'],rsO=P['rs'],re=P['rel'],lhF=P['lh'],lhO=P['lh'],lk=P['lkn'],rhF=P['rh'],rhO=P['rh'],rk=P['rkn'])
    W={}
    for j in JN:
        par=W[PARENT[j]] if PARENT[j] else np.eye(4);p=PIV[j];W[j]=par@M4(None,p)@M4(rot(AX[j],pose.get(j,0)))@M4(None,-p)
    B={}
    def add(j,mat,g):
        if not len(g.f): return
        B[(j,mat)]=B.get((j,mat),G())+g.t(W[j])
    def addw(j,mat,g):  # already in world space
        if not len(g.f): return
        B[(j,mat)]=B.get((j,mat),G())+g
    y=lambda v:v*H
    # pelvis
    add('turn',wear['leg'] if 'skirt' not in wear else wear['skirt'],loft([(0,y(.47),0,hw*H+.035*w,y(.062)),(0,y(.505),0,hw*H+.05*w,y(.075)),(0,y(.555),0,hw*H+.012,y(.064)),(0,y(.60),0,hw*H*.9,y(.05))],18))
    # torso
    chest=.078 if spec['build']!='f' else .082
    add('leanS',wear['top'],loft([(0,y(.585),0,(hw*H)*.98,y(.058)),(0,y(.66),.002,sw*H*.84,y(.066)),(0,y(.73),.006,sw*H*.98,y(chest)),(0,y(.80),0,sw*H*1.02,y(.06)),(0,y(.828),0,sw*H*.72,y(.042)),(0,y(.848),0,y(.026),y(.026))],18))
    if wear.get('shirt'):
        add('leanS','Shirt, white',loft([(0,y(.71),y(.066),y(.012),y(.012)),(0,y(.77),y(.068),y(.034),y(.014)),(0,y(.815),y(.05),y(.03),y(.012))],10))
    if wear.get('tie'):
        add('leanS','Black, fittings',box((0,y(.76),y(.08)),y(.013),y(.09),.006))
    if wear.get('tails'):
        add('turn','Suit, black',loft([(0,y(.58),-y(.045),hw*H*.9,y(.03)),(0,y(.42),-y(.075),hw*H*.8,y(.02)),(0,y(.27),-y(.075),hw*H*.55,y(.012))],12))
    # skirt
    if 'skirt' in wear:
        fl=.012;add('turn',wear['skirt'],loft([(0,y(.5),0,hw*H+.05*w,y(.076)),(0,y(.34),y(.005),hw*H+.075,y(.1)),(0,y(.16),y(.01),hw*H+.115,y(.135)),(0,y(fl),y(.012),hw*H+.17,y(.18))],20,True))
    # neck and head
    add('headN','Mannequin',tube((0,y(.82),0),(0,y(.88),y(.004)),y(.024),y(.022),10))
    add('headN','Mannequin',ell((0,y(.935),y(.006)),y(.052),y(.069),y(.062),16,12))
    hair=spec.get('hair','short');hc='Hair, grey' if spec.get('grey') else 'Hair, dark'
    if hair=='short': add('headN',hc,ell((0,y(.955),-y(.012)),y(.056),y(.058),y(.062),22,14))
    if hair=='long':
        add('headN',hc,ell((0,y(.95),-y(.008)),y(.058),y(.06),y(.066),16,10)+loft([(0,y(.93),-y(.03),y(.056),y(.04)),(0,y(.86),-y(.046),y(.06),y(.036)),(0,y(.79),-y(.05),y(.05),y(.02))],12))
    if hair=='bun':
        add('headN',hc,ell((0,y(.95),-y(.006)),y(.056),y(.058),y(.064),16,10)+ell((0,y(.97),-y(.07)),y(.028),y(.028),y(.028),10,8))
    # limbs
    for s,sg in (('l',1),('r',-1)):
        sh,el,wr=P[s+'s'],P[s+'el'],P[s+'wr']
        add(s+'sO',wear['arm'],ell(sh,y(.03),y(.032),y(.03),10,8)+tube(sh,el,y(.03),y(.024),10))
        add(s+'e',wear['arm'],ell(el,y(.024),y(.024),y(.024),8,6)+tube(el,wr,y(.024),y(.017),10))
        add(s+'e','Mannequin',ell(wr+np.array([0,-y(.03),y(.002)]),y(.012),y(.032),y(.02),10,8))
        hp,kn,an=P[s+'h'],P[s+'kn'],P[s+'an']
        if 'skirt' not in wear:
            add(s+'hO',wear['leg'],tube(hp,kn,y(.052),y(.032),12))
            add(s+'k',wear['leg'],ell(kn,y(.032),y(.032),y(.032),8,6)+tube(kn,an,y(.032),y(.018),12))
        sh_m='Black, fittings' if spec['wear'] in('suit','tail','blue','rust','olive','linen') else 'Mannequin'
        if 'skirt' not in wear: add(s+'k',sh_m,loft([(an[0],y(.0),y(.03),y(.024),y(.07)),(an[0],y(.03),y(.03),y(.024),y(.066)),(an[0],y(.06),y(.002),y(.02),y(.024))],12))
    L=dict(lhand=(W['le']@np.r_[P['lwr']+[0,-y(.05),0],1])[:3],rhand=(W['re']@np.r_[P['rwr']+[0,-y(.05),0],1])[:3],lelb=(W['lsO']@np.r_[P['lel'],1])[:3],relb=(W['rsO']@np.r_[P['rel'],1])[:3],ls=(W['leanS']@np.r_[P['ls'],1])[:3],rs=(W['leanS']@np.r_[P['rs'],1])[:3],chin=(W['headN']@np.r_[0,y(.885),y(.05),1])[:3],mouth=(W['headN']@np.r_[0,y(.905),y(.066),1])[:3],chest=(W['leanS']@np.r_[0,y(.74),y(.09),1])[:3],lap=(W['lean']@np.r_[0,y(.58),y(.1),1])[:3],hip=(W['turn']@np.r_[0,y(.5),0,1])[:3],eye=(W['headN']@np.r_[0,y(.94),y(.07),1])[:3])
    fig=dict(B=B,W=W,PIV=PIV,L=L,H=H,addw=addw)
    for it in spec.get('items',[]): place_item(fig,it)
    return fig
def put(fig,j,parts,o,x,yy):
    for mat,g in parts.items(): fig['addw'](j,mat,at(g,o,x,yy))
def place_item(fig,it):
    L=fig['L'];n=it
    if n=='baton':
        f=L['rhand']-fig['W']['re'][:3,:3]@np.array([0,.0,0]);d=L['rhand']-L['relb'];d/=np.linalg.norm(d)
        fig['addw']('re','Shirt, white',tube(L['rhand'],L['rhand']+d*.42,.004,.0015,6))
    elif n=='violin':
        o=(L['chin']+L['lhand'])/2+np.array([0,-.03,0]);d=L['lhand']-L['chin'];put(fig,'leanS',fiddle(.36,.05,.14),L['chin']+d*.32+np.array([0,-.05,-.01]),(0,0,1),d)
        bs=bowstick(.72);put(fig,'re',bs,L['rhand'],(0,0,1),(L['chin']+d*.5-L['rhand'])*np.array([1,.3,1])+np.array([.2,0,0]))
    elif n=='cello':
        o=np.array([0,.62,.3]);put(fig,'turn',fiddle(.76,.2,.34,pin=True),o,(1,0,0),(.0,1,-.26))
        put(fig,'re',bowstick(.72),L['rhand'],(0,0,1),(.9,.12,.1))
    elif n=='ecello':
        g=fiddle(.5,.04,.42,pin=True);put(fig,'turn',g,np.array([.05,.82,.2]),(1,0,0),(0,1,-.2))
        put(fig,'re',bowstick(.72),L['rhand'],(0,0,1),(.9,.12,.1))
    elif n=='bass':
        put(fig,'turn',fiddle(1.12,.3,.62,pin=True),np.array([.1,.72,.32]),(1,0,0),(-.04,1,-.2))
        put(fig,'re',bowstick(.72),L['rhand'],(0,0,1),(.9,.1,.1))
    elif n=='harp':
        put(fig,'turn',harp(),np.array([.0,0,.42]),(1,0,0),(0,1,0))
    elif n=='flute':
        a=L['mouth']+np.array([.0,-.01,.02]);d=L['rhand']-L['mouth'];d=d/np.linalg.norm(d);fig['addw']('leanS','Steel strings',tube(a-d*.08,a+d*.56,.0095,n=8))
    elif n=='trumpet': put(fig,'leanS',trumpet(),L['mouth']+np.array([0,-.01,.02]),(1,0,0),(0,-.1,1))
    elif n=='trombone': put(fig,'leanS',trombone(),L['mouth']+np.array([-.04,-.01,.02]),(1,0,0),(0,-.12,1))
    elif n=='tuba': put(fig,'leanS',tuba(),L['chest']+np.array([.0,-.62,.12]),(1,0,0),(0,1,0))
    elif n=='timpani':
        for x in(-.42,.42): put(fig,'turn',kettle(),np.array([x,0,.62]),(1,0,0),(0,1,0))
        for h,el,j in((L['lhand'],L['lelb'],'le'),(L['rhand'],L['relb'],'re')):
            d=h-el;d/=np.linalg.norm(d);fig['addw'](j,'Wood, dark',tube(h,h+d*.36,.006));fig['addw'](j,'Shirt, white',ell(h+d*.38,.024,.024,.024,8,6))
    elif n=='sticks':
        for h,el,j in((L['lhand'],L['lelb'],'le'),(L['rhand'],L['relb'],'re')):
            d=h-el;d/=np.linalg.norm(d);fig['addw'](j,'Wood, dark',tube(h,h+d*.34,.007,.004,6))
    elif n=='snare': put(fig,'turn',snare(),np.array([0,0,.42]),(1,0,0),(0,1,0))
    elif n=='qanun': put(fig,'turn',qanun(),np.array([0,L['hip'][1]-.1,L['hip'][2]+.36]),(1,0,0),(0,1,0))
    elif n=='piano': put(fig,'turn',piano(),np.array([0,0,1.28]),(1,0,0),(0,1,0))
    elif n=='marimba':
        put(fig,'turn',marimba(),np.array([0,0,.5]),(1,0,0),(0,1,0))
        for h,el,j in((L['lhand'],L['lelb'],'le'),(L['rhand'],L['relb'],'re')):
            d=h-el;d/=np.linalg.norm(d);fig['addw'](j,'Wood, dark',tube(h,h+d*.34,.004));fig['addw'](j,'Shirt, white',ell(h+d*.36,.02,.02,.02,8,6))
    elif n.startswith('chair'):
        put(fig,'turn',chair(float(n[5:] or .46)),np.array([0,0,-.02]),(1,0,0),(0,1,0))
    elif n=='cushion': fig['addw']('turn','Linen',ell((L['hip'][0],L['hip'][1]-.12,L['hip'][2]),.34,.09,.3,16,8))
    elif n=='suitcase': put(fig,'turn',suitcase(),L['rhand']*np.array([1,0,1])+np.array([-.16,0,-.32]),(1,0,0),(0,1,0))
    elif n=='tripodcam': put(fig,'turn',tripodcam(),np.array([-.25,0,.62]),(1,0,0),(0,1,0))
    elif n=='presscam': put(fig,'re',presscam(),(L['lhand']+L['rhand'])/2+np.array([0,.03,.05]),(1,0,0),(0,1,0))
    elif n=='phone': fig['addw']('re','Black, fittings',box(L['rhand']+np.array([0,.06,.03]),.07,.14,.008))
    elif n=='folder': fig['addw']('le','Black, fittings',box((L['lhand']+L['rhand'])/2+np.array([0,.06,.02]),.32,.24,.012,rot((1,0,0),-25)))
    elif n=='book': fig['addw']('le','Jacket, rust',box(L['lhand']+np.array([.02,.03,.03]),.18,.24,.03))
# ---------- the cast ----------
ARMS_UP=dict(lsF=70,lsO=40,le=30,rsF=80,rsO=35,re=25)
SEAT=dict(lhF=88,lk=88,rhF=88,rk=88)
BOW=dict(rsF=38,rsO=10,re=58)
CAST=[
 ('Orchestra',[
  dict(id='maestro',label='Maestro',ar='المايسترو',build='m',wear='tail',hair='short',grey=True,pose=dict(rsF=115,rsO=30,re=30,lsF=95,lsO=35,le=30,headN=-6),items=['baton']),
  dict(id='harpist',label='Harpist',ar='عازفة الهارب',build='f',wear='gold',hair='long',seated=True,pose={**SEAT,'lean':8,'lsF':46,'lsO':6,'le':52,'rsF':46,'rsO':6,'re':52,'headN':10,'lhO':14,'rhO':14},items=['chair.5','harp']),
  dict(id='bassist',label='Double bass',ar='عازف الكونترباص',build='m',wear='suit',hair='short',pose=dict(lsF=42,lsO=8,le=82,rsF=26,rsO=26,re=46,lean=6,headN=14,headT=14),items=['bass']),
  dict(id='cellist',label='Cello',ar='عازف التشيلو',build='m',wear='suit',hair='short',pose={**SEAT,'lhO':18,'rhO':18,'lsF':36,'lsO':10,'le':88,'rsF':28,'rsO':26,'re':48,'lean':8,'headN':10,'headT':16},items=['chair.5','cello']),
  dict(id='violin1',label='Violin, first',ar='عازفة الكمان',build='f',wear='black',hair='bun',pose=dict(lsF=56,lsO=26,le=34,rsF=40,rsO=32,re=72,headN=14,headT=20),items=['violin']),
  dict(id='violin2',label='Violin, second',ar='عازف الكمان',build='m',wear='suit',hair='short',pose=dict(lsF=56,lsO=26,le=34,rsF=40,rsO=32,re=72,headN=14,headT=20),items=['violin']),
  dict(id='flutist',label='Flute',ar='عازفة الفلوت',build='f',wear='red',hair='long',pose=dict(lsF=30,lsO=-4,le=84,rsF=44,rsO=40,re=78,headT=-16,headN=4),items=['flute']),
  dict(id='qanun',label='Qanun',ar='عازف القانون',build='m',wear='linen',hair='short',pose=dict(lhF=78,lhO=48,lk=142,rhF=78,rhO=48,rk=142,lsF=34,lsO=10,le=44,rsF=34,rsO=10,re=44,lean=14,headN=18),items=['qanun']),
  dict(id='marimba',label='Marimba',ar='عازف الماريمبا',build='m',wear='olive',hair='short',pose=dict(lsF=44,lsO=8,le=56,rsF=44,rsO=8,re=56,lean=8,headN=14),items=['marimba']),
  dict(id='trumpet',label='Trumpet',ar='عازف الترومبيت',build='m',wear='suit',hair='short',pose=dict(lsF=40,lsO=8,le=72,rsF=40,rsO=8,re=72,headN=-4),items=['trumpet']),
  dict(id='trombone',label='Trombone',ar='عازفة الترومبون',build='f',wear='black',hair='bun',pose=dict(lsF=38,lsO=4,le=78,rsF=50,rsO=6,re=30),items=['trombone']),
  dict(id='tuba',label='Tuba',ar='عازف التوبا',build='m',wear='suit',hair='short',pose=dict(lsF=26,lsO=22,le=72,rsF=26,rsO=22,re=72),items=['tuba']),
  dict(id='timpani',label='Timpani',ar='عازف التيمباني',build='m',wear='suit',hair='short',pose=dict(lsF=46,lsO=20,le=26,rsF=46,rsO=20,re=26,lean=10,headN=14),items=['timpani']),
  dict(id='ecello',label='Electric cello',ar='عازفة التشيلو الكهربائي',build='f',wear='black',hair='long',pose={**BOW,'lsF':54,'lsO':14,'le':100,'headN':12,'headT':14},items=['ecello']),
  dict(id='drummer',label='Drummer',ar='الطبّال',build='m',wear='rust',hair='short',pose=dict(lsF=34,lsO=16,le=44,rsF=34,rsO=16,re=44,lean=8,headN=12),items=['snare','sticks']),
  dict(id='pianist',label='Pianist',ar='عازف البيانو',build='m',wear='suit',hair='short',grey=True,pose={**SEAT,'lsF':46,'lsO':6,'le':62,'rsF':46,'rsO':6,'re':62,'lean':8,'headN':10},items=['piano']),
  dict(id='choir1',label='Choir, woman',ar='الكورال (سيدة)',build='f',wear='black',hair='bun',pose=dict(lsF=28,le=72,rsF=28,re=72),items=['folder']),
  dict(id='choir2',label='Choir, man',ar='الكورال (رجل)',build='m',wear='suit',hair='short',pose=dict(lsF=28,le=72,rsF=28,re=72),items=['folder']),
 ]),
 ('City',[
  dict(id='traveler',label='Traveller',ar='المسافرة',build='f',wear='blue',hair='long',pose=dict(lhF=20,lk=8,rhF=-14,rk=22,lsF=-14,rsF=8,re=22,headT=-8),items=['suitcase']),
  dict(id='guest',label='Hotel guest',ar='الضيفة',build='f',wear='robe',hair='long',pose=dict(lsF=12,le=24,rsF=30,re=88,headT=-10)),
  dict(id='butler',label='Butler',ar='الخادم الشخصي',build='m',wear='tail',hair='short',pose=dict(lsF=-6,rsF=72,rsO=30,re=18,headT=10)),
  dict(id='grandfather',label='Grandfather',ar='الجد',build='m',wear='linen',hair='short',grey=True,pose=dict(lhF=10,rhF=-8,rk=10,lsF=6,lsO=10,rsF=4,lean=4)),
  dict(id='grandson',label='Grandson',ar='الحفيد',build='c',wear='rust',hair='short',pose=dict(lsF=62,lsO=-4,le=22,rsF=36,re=30,lhF=26,lk=30,rhF=-10)),
  dict(id='mother',label='Mother',ar='الأم',build='f',wear='olive',hair='long',pose=dict(rsF=40,re=100,headT=12)),
  dict(id='father',label='Father',ar='الأب',build='m',wear='blue',hair='short',pose=dict(lsF=128,lsO=22,le=62,rsF=128,rsO=22,re=62)),
  dict(id='child',on='father',label='Child on the shoulders',ar='الطفل',build='c',wear='olive',hair='short',pose={'lhF':70,'lhO':30,'lk':88,'rhF':70,'rhO':30,'rk':88,'lsF':150,'lsO':20,'rsF':150,'rsO':20}),
  dict(id='host',label='Evening host',ar='صاحب السمر',build='m',wear='linen',hair='short',pose=dict(lhF=72,lhO=36,lk=130,rhF=72,rhO=36,rk=130,lsF=30,le=70,rsF=56,rsO=20,re=70,headT=14),items=['cushion']),
  dict(id='tourist1',label='Tourist, woman',ar='سائحة',build='f',wear='rust',hair='long',pose=dict(lhF=74,lhO=30,lk=132,rhF=74,rhO=30,rk=132,lsF=24,le=60,rsF=24,re=60,headT=-18),items=['cushion']),
  dict(id='tourist2',label='Tourist, man',ar='سائح',build='m',wear='olive',hair='short',grey=True,pose=dict(lhF=74,lhO=30,lk=132,rhF=74,rhO=30,rk=132,lsF=24,le=60,rsF=24,re=60,headT=-22),items=['cushion']),
  dict(id='childpoint',label='Child pointing',ar='الطفل يشير للشهاب',build='c',wear='blue',hair='short',pose=dict(rsF=132,rsO=14,re=6,headN=-26,lean=-4)),
  dict(id='spectator',label='Spectator',ar='المتفرّجة',build='f',wear='rust',hair='long',pose={**SEAT,'lean':18,'lsF':58,'le':52,'rsF':58,'re':52,'headT':-40},items=['chair.5']),
 ]),
 ('Studios and campus',[
  dict(id='actress',label='Actress',ar='الممثلة',build='f',wear='red',hair='long',pose=dict(lsF=48,lsO=26,le=70,rsF=20,rsO=14,re=34,headT=18,headN=-4)),
  dict(id='stunt',label='Stunt performer',ar='مؤدّي المشاهد الخطرة',build='m',wear='rust',hair='short',pose=dict(lean=24,lhF=72,lk=68,rhF=-30,rk=58,lsF=120,lsO=36,le=18,rsF=-10,rsO=46,re=20)),
  dict(id='director',label='Director',ar='المخرج',build='m',wear='blue',hair='short',pose=dict(rsF=78,rsO=18,re=88,lsF=6)),
  dict(id='operator',label='Camera operator',ar='المصوّر',build='m',wear='olive',hair='short',pose=dict(lsF=52,le=68,rsF=46,re=62,lean=14,headN=10),items=['tripodcam']),
  dict(id='producer',label='Producer',ar='المنتجة',build='f',wear='black',hair='bun',pose=dict(lsF=52,lsO=-8,le=104,rsF=34,re=100,headN=20)),
  dict(id='student1',label='Student, woman',ar='طالبة',build='f',wear='blue',hair='long',pose=dict(lsF=22,le=88,rsF=8),items=['book']),
  dict(id='student2',label='Student, man',ar='طالب',build='m',wear='rust',hair='short',pose=dict(lsF=14,rsF=14,headT=20)),
  dict(id='professor',label='Professor',ar='الأستاذ',build='m',wear='suit',hair='short',grey=True,pose=dict(rsF=62,rsO=20,re=70,headT=-12)),
  dict(id='oldman',label='Man at the poster',ar='الرجل المسن',build='m',wear='suit',hair='short',grey=True,pose=dict(lsF=86,lsO=8,le=30,lean=8,headN=6)),
  dict(id='star',label='Star',ar='النجمة',build='f',wear='gold',hair='long',pose=dict(turn=0,leanS=-4,headT=-46,lsF=8,lsO=14,rsF=8,rsO=14,re=22)),
  dict(id='press1',label='Press photographer',ar='مصوّر صحفي',build='m',wear='suit',hair='short',pose=dict(lsF=44,lsO=4,le=88,rsF=44,rsO=4,re=88,headN=2),items=['presscam']),
  dict(id='press2',label='Press, phone',ar='صحفية بالموبايل',build='f',wear='blue',hair='long',pose=dict(rsF=118,rsO=8,re=48,lsF=6),items=['phone']),
 ])]
# ---------- write the scene ----------
def main():
    out=R_+'/site/cast';os.makedirs(out,exist_ok=True)
    meshes=[];groups=[];rigs=[];blob=bytearray();cats={};views=[]
    def write_mesh(g,mat,cat):
        g2=g
        v=g2.v;f=g2.f
        # smooth normals (flat box pieces are split already)
        n=np.zeros_like(v);a,b,c=v[f[:,0]],v[f[:,1]],v[f[:,2]];fn=np.cross(b-a,c-a)
        for k in range(3): np.add.at(n,f[:,k],fn)
        n/=np.maximum(np.linalg.norm(n,axis=1,keepdims=True),1e-9)
        lo=v.min(0);ext=np.maximum(v.max(0)-lo,1e-5);q=np.round((v-lo)/ext*65535).astype(np.uint16)
        p0=len(blob);blob.extend(q.tobytes());blob.extend(b'\0'*((-len(blob))%4));n0=len(blob)
        ni=np.c_[np.round(n*127).astype(np.int8),np.zeros(len(n),np.int8)];blob.extend(ni.astype(np.int8).tobytes());blob.extend(b'\0'*((-len(blob))%4));i0=len(blob)
        i32=len(v)>65535;blob.extend(f.astype(np.uint32 if i32 else np.uint16).tobytes());blob.extend(b'\0'*((-len(blob))%4))
        meshes.append(dict(m=MI[mat],nv=len(v),ni=int(f.size),bmin=[round(float(x),5) for x in lo],ext=[round(float(x),5) for x in ext],p=p0,n=n0,i=i0,i32=int(i32)))
        groups.append(dict(meshes=[len(meshes)-1],cat=cat));cats[cat]=cats.get(cat,0)+len(f)
        return len(meshes)-1
    # stage
    gs=box((0,-.03,0),160,.06,90); write_mesh(gs,'Stage floor','Stage')
    z0=8.0;sp=3.6;rows=[];placed={}
    info=[]
    for gi,(gname,figs) in enumerate(CAST):
        cols=len(figs);x0=-(cols-1)*sp/2;zz=z0-gi*8
        for k,spec in enumerate(figs):
            fig=make_figure(spec);B=fig['B']
            # stand on the floor
            ymin=min(g.v[:,1].min() for (j,m),g in B.items())
            off=np.array([x0+k*sp,-ymin,zz])
            if spec.get('on'):
                fo,fH=placed[spec['on']];hipy=(fig['W']['turn']@np.r_[0,.505*fig['H'],0,1])[1]
                off=np.array([fo[0],fo[1]+.845*fH+.02-hipy,fo[2]-.03])
            placed[spec['id']]=(off,fig['H'])
            T_=M4(None,off)
            seg={}
            cat=spec['label']
            for (j,mat),g in B.items():
                mi=write_mesh(g.t(T_),mat,cat);seg.setdefault(JN.index(j)+1,[]).append(mi)
            if not spec.get('on'):
                plinth=lathe([(.9,0),(.9,.012),(.001,.014)],28).t(M4(None,(off[0],-.0,off[2])));write_mesh(plinth,'Plinth, stone','Plinths')
            J=[]
            for j in JN:
                p=(fig['W'][j]@np.r_[fig['PIV'][j],1])[:3]+off
                par=fig['W'][PARENT[j]] if PARENT[j] else np.eye(4);ax=par[:3,:3]@np.array(AX[j],float)
                J.append(dict(id=j,label=JLABEL[j],pivot=[round(float(x),4) for x in p],axis=[round(float(x),4) for x in ax],min=LIM[j][0],max=LIM[j][1],parent=(JN.index(PARENT[j])+1 if PARENT[j] else 0)))
            rigs.append(dict(id=spec['id'],label=f"{spec['label']} · {spec['ar']}",tag=cat,joints=J,segments={str(a):b for a,b in seg.items()}))
            H=fig['H'];views.append(dict(name=spec['label'],pos=[round(off[0]+1.5,2),round(off[1]+H*.95+.25,2),round(off[2]+4.2,2)],target=[round(off[0],2),round(H*.56,2),round(off[2]+.2,2)],focal=40))
            info.append(dict(id=spec['id'],label=spec['label'],ar=spec['ar'],group=gname,items=spec.get('items',[]),xz=[round(float(off[0]),2),round(float(off[2]),2)]))
    raw=bytes(blob);gz=gzip.compress(raw,6);b64=base64.b64encode(gz)
    open(out+'/geo0.txt','wb').write(b64)
    tris=sum(c for c in cats.values())
    bx=[np.array(m['bmin'])for m in meshes]
    scene=dict(parts=['geo0.txt'],partsBytes=len(b64),rawSize=len(raw),materials=[dict(name=n,color=list(c),opacity=1.0,**({'static':True} if n in('Stage floor',) else {})) for n,c in MATS],meshes=meshes,groups=groups,
      camera=dict(eye=[0,6,30],target=[0,1,-2],up=[0,1,0],fov=40),bounds=dict(lo=[-80,0,-45],hi=[80,12,45]),stats=dict(world_tris=tris,inst_tris=0,instances=0,meshes=len(meshes),groups=len(groups)),
      categories=[[k,v,False] for k,v in sorted(cats.items(),key=lambda x:-x[1])],rigs=rigs)
    json.dump(scene,open(out+'/scene.json','w'),separators=(',',':'))
    allv=[dict(name='The whole cast',pos=[0,7,36],target=[0,1,-2],focal=35),dict(name='Orchestra',pos=[0,3.2,22],target=[0,1,8],focal=30),dict(name='City people',pos=[0,3.0,14],target=[0,1,0],focal=30),dict(name='Studios and campus',pos=[0,3.0,6],target=[0,1,-8],focal=30)]+views
    json.dump(dict(views=allv,info=info),open(R_+'/tools/cast_views.json','w'),ensure_ascii=False)
    print('figures',len(info),'meshes',len(meshes),'tris',tris,'raw MB',round(len(raw)/1e6,2),'b64 MB',round(len(b64)/1e6,2),'scene KB',round(os.path.getsize(out+'/scene.json')/1e3))
if __name__=='__main__': main()
