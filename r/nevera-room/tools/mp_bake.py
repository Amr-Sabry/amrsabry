#!/usr/bin/env python3
"""Masterplan export -> viewer scene: world-space metres, merged by tag and colour, instances kept as instances."""
import numpy as np,json,os,gzip,base64,hashlib,shutil,sys
R_=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));X=R_+'/mpbake';OUT=R_+'/site/mp';REPO='/home/claude/amrsabry/r/nevera'
os.makedirs(OUT+'/tex',exist_ok=True)
res=json.load(open(X+'/meta.json'));meta=res['meta'];types=res['types']
def A(i):
    t=types[i];return np.fromfile(f'{X}/a{i}.bin',dtype={'Float32Array':np.float32,'Uint32Array':np.uint32}[t])
GEO={g['id']:g for g in meta['geos']};MAT={m['id']:m for m in meta['mats']}
def lin2s(c):
    c=np.clip(np.array(c,float),0,1);return np.where(c<=.0031308,c*12.92,1.055*np.power(c,1/2.4)-.055)
def q8(c,step=6):
    v=np.round(lin2s(c)*255/step)*step;return tuple(int(x) for x in np.clip(v,0,255))
# materials
ML=[];MK={};tex_n=0;TEXK={}
def tex(mapinfo):
    global tex_n
    if not mapinfo: return None
    k=mapinfo.get('src') or hashlib.md5(mapinfo['data'].encode()).hexdigest()
    if k in TEXK: return TEXK[k]
    if mapinfo.get('src'):
        src=mapinfo['src'];rel=src.split('/r/nevera/')[-1];ext=os.path.splitext(rel)[1] or '.jpg';name=f't{tex_n}{ext}'
        shutil.copy(f'{REPO}/{rel}',f'{OUT}/tex/{name}')
    else:
        name=f't{tex_n}.jpg';open(f'{OUT}/tex/{name}','wb').write(base64.b64decode(mapinfo['data'].split(',')[1]))
    tex_n+=1;TEXK[k]='tex/'+name;return TEXK[k]
def mat_index(m,col):
    mp=None
    try: mp=tex(m['map'])
    except Exception as e: print('tex fail',str(e)[:80])
    em=None
    if m['em'] and m['emI'] and max(m['em'])>0: em=tuple(int(x) for x in np.round(lin2s(m['em'])*255))
    op=round(float(m['opacity']),2)
    metal=m['metal']>.45
    key=(col,mp,op,em,round(m['emI'],1) if em else 0,metal)
    if key in MK: return MK[key]
    name=(m['name'] or 'Material')[:24]
    d=dict(name=('Metal ' if metal else '')+name+f' {len(ML)}',color=list(col),opacity=op)
    if mp: d['map']=mp;d['color']=[255,255,255];d['alphaTex']=m['alpha']>0
    if em: d['emissive']=list(em);d['emissiveI']=float(m['emI'])
    ML.append(d);MK[key]=len(ML)-1;return MK[key]
blob=bytearray();meshes=[];groups=[];cats={}
def align():
    blob.extend(b'\0'*((-len(blob))%4))
def write_geo(v,n,f,uv,mi):
    lo=v.min(0);ext=np.maximum(v.max(0)-lo,1e-4);q=np.round((v-lo)/ext*65535).astype(np.uint16)
    align();p0=len(blob);blob.extend(q.tobytes());align();n0=len(blob)
    nn=np.nan_to_num(n);nn=nn/np.maximum(np.linalg.norm(nn,axis=1,keepdims=True),1e-9)
    blob.extend(np.c_[np.round(nn*127).astype(np.int8),np.zeros(len(nn),np.int8)].astype(np.int8).tobytes());align();rec=dict(m=mi,nv=len(v),ni=int(f.size),bmin=[round(float(x),4) for x in lo],ext=[round(float(x),4) for x in ext],p=p0,n=n0)
    if uv is not None: rec['uv']=len(blob);blob.extend(uv.astype(np.float32).tobytes());align()
    i32=len(v)>65535;rec['i']=len(blob);rec['i32']=int(i32);blob.extend(f.astype(np.uint32 if i32 else np.uint16).tobytes());align()
    meshes.append(rec);return len(meshes)-1
def splits(g,matids):
    """-> list of (mat, tri_index_array faces, colorkey or None); splits by material group and vertex colour"""
    P=A(g['p']).reshape(-1,3);I=A(g['i']).astype(np.int64) if g['i']>=0 else np.arange(len(P),dtype=np.int64)
    F=I.reshape(-1,3);C=A(g['c']).reshape(-1,3) if g['c']>=0 else None
    parts=[]
    if len(matids)>1 and g['groups']:
        for gr in g['groups']:
            s=gr['start']//3;e=s+gr['count']//3;mid=matids[min(gr.get('materialIndex',0),len(matids)-1)];parts.append((mid,F[s:e]))
    else: parts=[(matids[0],F)]
    out=[]
    for mid,ff in parts:
        m=MAT[mid]
        if not m.get('visible',True) or not len(ff): continue
        mc=np.array(m['color'],float)
        if m['vc'] and C is not None:
            tc=C[ff[:,0]]*mc;s=lin2s(tc);qc=np.round(s*255/10)*10;key=(qc[:,0].astype(np.int64)<<16)+(qc[:,1].astype(np.int64)<<8)+qc[:,2].astype(np.int64)
            for k in np.unique(key):
                col=(int(k>>16)&255,int(k>>8)&255,int(k)&255);out.append((m,ff[key==k],tuple(min(255,c) for c in col)))
        else: out.append((m,ff,q8(mc,4)))
    return out
BUCK={};INST=[]
ntri=0
for it in meta['items']:
    it['tag']=it['tag'].replace('Buildings: _road','Road furniture').replace('Buildings: _depot','Rail depot')
    g=GEO[it['geo']];tag=it['tag']
    if 'inst' in it: INST.append(it);continue
    M=np.array(it['m'],float).reshape(4,4).T;P=A(g['p']).reshape(-1,3).astype(np.float64);N=A(g['n']).reshape(-1,3).astype(np.float64) if g['n']>=0 else np.zeros_like(P)
    W=(P@M[:3,:3].T+M[:3,3])*10;L=np.linalg.inv(M[:3,:3]).T;WN=N@L.T
    UV=A(g['uv']).reshape(-1,2).astype(np.float64) if g['uv']>=0 else None
    for m,ff,col in splits(g,it['mats']):
        mi=mat_index(m,col);hasuv=m['map'] is not None and UV is not None;key=(tag,mi)
        u,inv=np.unique(ff.ravel(),return_inverse=True);f2=inv.reshape(-1,3)
        uv2=None
        if hasuv:
            uv2=UV[u].copy();mp=m['map'];uv2=uv2*np.array(mp['rep'])+np.array(mp['off'])
        BUCK.setdefault(key,[]).append((W[u],WN[u],f2,uv2));ntri+=len(ff)
print('merged buckets',len(BUCK),'tris',ntri)
GT=[];BOX=[]
for (tag,mi),L in BUCK.items():
    for v,n,f,uv in L:
        if tag.startswith(('Plan','Plots')):
            GT.append(v[f]) 
        if tag.startswith('Buildings') or tag.startswith('Performance') or tag=='Rail depot':
            lo=v.min(0);hi=v.max(0)
            if hi[1]-lo[1]>1.5 and max(hi[0]-lo[0],hi[2]-lo[2])<400: BOX.append((lo[0],lo[2],hi[0],hi[2],hi[1]))
np.save(X+'/ground.npy',np.vstack(GT).astype(np.float32))
for (tag,mi),L in BUCK.items():
    # split huge buckets for culling: by a coarse grid of 2.5 km
    V=[];Nn=[];FF=[];UU=[];o=0;has=L[0][3] is not None
    for v,n,f,uv in L:
        V.append(v);Nn.append(n);FF.append(f+o);o+=len(v)
        if has: UU.append(uv if uv is not None else np.zeros((len(v),2)))
    V=np.vstack(V);Nn=np.vstack(Nn);FF=np.vstack(FF);UU=np.vstack(UU) if has else None
    c=V[FF].mean(1);cell=np.floor(c[:,[0,2]]/2500).astype(int);ck=(cell[:,0]+1000)*10000+(cell[:,1]+1000)
    for k in np.unique(ck):
        fk=FF[ck==k];u,inv=np.unique(fk.ravel(),return_inverse=True)
        mid=write_geo(V[u],Nn[u],inv.reshape(-1,3),UU[u] if has else None,mi);groups.append(dict(meshes=[mid],cat=tag));cats[tag]=cats.get(tag,0)+len(fk)
# instances
GEOCACHE={};ni=0;nit=0
for it in INST:
    g=GEO[it['geo']];tag=it['tag'];n=it['count']
    if it['geo'] not in GEOCACHE:
        P=A(g['p']).reshape(-1,3);N=A(g['n']).reshape(-1,3) if g['n']>=0 else np.zeros_like(P);UV=A(g['uv']).reshape(-1,2) if g['uv']>=0 else None;recs=[]
        for m,ff,col in splits(g,it['mats']):
            u,inv=np.unique(ff.ravel(),return_inverse=True)
            mid=write_geo(P[u].astype(np.float64),N[u].astype(np.float64),inv.reshape(-1,3),(UV[u] if (UV is not None and m['map'] is not None) else None),mat_index(m,col))
            recs.append((mid,m,col))
        GEOCACHE[it['geo']]=recs
    recs=GEOCACHE[it['geo']]
    M=A(it['inst']).reshape(-1,12).astype(np.float64)*10
    if it['tag'].startswith('Buildings') or it['tag'].startswith('Performance') or it['tag']=='Rail depot':
        Pl=A(g['p']).reshape(-1,3).astype(np.float64);l0=Pl.min(0);l1=Pl.max(0);corners=np.array([[a,b,c] for a in (l0[0],l1[0]) for b in (l0[1],l1[1]) for c in (l0[2],l1[2])])
        L3=M[:,:9].reshape(-1,3,3).transpose(0,2,1) if False else None
        for r in M[:: max(1,len(M)//4000)]:
            mm=np.array([[r[0],r[3],r[6]],[r[1],r[4],r[7]],[r[2],r[5],r[8]]]);w=corners@mm.T+r[9:12];lo=w.min(0);hi=w.max(0)
            if hi[1]-lo[1]>1.2 and max(hi[0]-lo[0],hi[2]-lo[2])<400: BOX.append((lo[0],lo[2],hi[0],hi[2],hi[1]))
    det=np.linalg.det(M[:,:9].reshape(-1,3,3));mir=det<0
    icol=A(it['icol']).reshape(-1,3) if 'icol' in it else None
    if icol is not None:
        s=lin2s(icol);qc=np.round(s*255/16)*16;ck=(qc[:,0].astype(np.int64)<<16)+(qc[:,1].astype(np.int64)<<8)+qc[:,2].astype(np.int64)
    else: ck=np.zeros(n,np.int64)
    for k in np.unique(ck):
        for mr in (False,True):
            sel=(ck==k)&(mir==mr)
            if not sel.any(): continue
            ms=[]
            for mid,m,col in recs:
                if icol is not None:
                    ic=np.array([(k>>16)&255,(k>>8)&255,k&255],float)/255;c2=tuple(int(x) for x in np.clip(np.round(np.array(col)*ic/4)*4,0,255))
                    nm=dict(meshes[mid]);nm['m']=mat_index(m,c2);meshes.append(nm);ms.append(len(meshes)-1)
                else: ms.append(mid)
            align();off=len(blob);blob.extend(M[sel].astype(np.float32).tobytes());align()
            groups.append(dict(meshes=ms,inst=off,count=int(sel.sum()),mirror=bool(mr),name=tag,cat=tag))
            tr=sum(meshes[x]['ni']//3 for x in ms)*int(sel.sum());cats[tag]=cats.get(tag,0)+tr;ni+=int(sel.sum());nit+=tr
print('meshes',len(meshes),'groups',len(groups),'mats',len(ML),'instances',ni,'inst tris',nit,'world tris',ntri)
for k,v in sorted(cats.items(),key=lambda x:-x[1])[:40]: print('  ',k,v)
np.save(X+'/boxes.npy',np.array(BOX,dtype=np.float32));print('boxes',len(BOX))
# the cast, standing in their places
rigs=[]
if os.path.exists(R_+'/tools/mp_cast.json') and '--nocast' not in sys.argv:
    sys.path.insert(0,R_+'/tools')
    import figures as FG
    specs={s['id']:s for grp in FG.CAST for s in grp[1]}
    FM={}
    def figmat(name):
        if name in FM: return FM[name]
        col=dict(FG.MATS)[name];ML.append(dict(name=name,color=list(col),opacity=1.0));FM[name]=len(ML)-1;return FM[name]
    pos=json.load(open(R_+'/tools/mp_cast.json'))['pos'];ZN=json.load(open(REPO+'/zones.json'))
    nf=0
    for key,xyz in pos.items():
        ref,fid=key.split('|');spec=specs[fid];fig=FG.make_figure(spec);B=fig['B'];ymin=min(g.v[:,1].min() for g in B.values())
        off=np.array([xyz[0],xyz[1]-ymin,xyz[2]])
        if spec.get('on') and f"{ref}|{spec['on']}" in pos:
            fo=pos[f"{ref}|{spec['on']}"];hipy=(fig['W']['turn']@np.r_[0,.505*fig['H'],0,1])[1];off=np.array([fo[0],fo[1]+.845*1.78+.02-hipy,fo[2]-.03])
        cat='Cast: '+spec['label'];seg={};T_=FG.M4(None,off)
        for (j,mat),g in B.items():
            g2=g.t(T_);v=g2.v;f=g2.f;n=np.zeros_like(v);a,b,c=v[f[:,0]],v[f[:,1]],v[f[:,2]];fn=np.cross(b-a,c-a)
            for k in range(3): np.add.at(n,f[:,k],fn)
            mid=write_geo(v,n,f,None,figmat(mat));groups.append(dict(meshes=[mid],cat=cat));cats[cat]=cats.get(cat,0)+len(f);seg.setdefault(FG.JN.index(j)+1,[]).append(mid)
        J=[]
        for j in FG.JN:
            p_=(fig['W'][j]@np.r_[fig['PIV'][j],1])[:3]+off;par=fig['W'][FG.PARENT[j]] if FG.PARENT[j] else np.eye(4);ax=par[:3,:3]@np.array(FG.AX[j],float)
            J.append(dict(id=j,label=FG.JLABEL[j],pivot=[round(float(x),3) for x in p_],axis=[round(float(x),4) for x in ax],min=FG.LIM[j][0],max=FG.LIM[j][1],parent=(FG.JN.index(FG.PARENT[j])+1 if FG.PARENT[j] else 0)))
        q=ZONES.get(ref) if False else None
        rigs.append(dict(id=f'{fid}_{ref}'.replace(':','_'),label=f"{spec['label']} · {ref}",tag=cat,joints=J,segments={str(a):b for a,b in seg.items()}));nf+=1
    print('placed figures',nf)
raw=bytes(blob);print('raw MB',len(raw)/1e6)
gz=gzip.compress(raw,6);b64=base64.b64encode(gz);print('b64 MB',len(b64)/1e6)
PART=14_000_000;parts=[]
for f in os.listdir(OUT):
    if f.startswith('geo') and f.endswith('.txt'): os.remove(f'{OUT}/{f}')
# each part must decode alone: cut on a 4-char base64 boundary
for i in range(0,len(b64),PART):
    n=f'geo{len(parts)}.txt';open(f'{OUT}/{n}','wb').write(b64[i:i+PART]);parts.append(n)
scene=dict(parts=parts,partsBytes=len(b64),rawSize=len(raw),materials=ML,meshes=meshes,groups=groups,camera=dict(eye=[1500,1800,3500],target=[0,0,0],up=[0,1,0],fov=38),bounds=dict(lo=[-14100,0,-20800],hi=[19700,400,17000]),stats=dict(world_tris=ntri,inst_tris=nit,instances=ni,meshes=len(meshes),groups=len(groups)),categories=[[k,v,False] for k,v in sorted(cats.items(),key=lambda x:-x[1])],**({'rigs':rigs} if rigs else {}))
json.dump(scene,open(OUT+'/scene.json','w'),separators=(',',':'))
print('scene KB',os.path.getsize(OUT+'/scene.json')/1e3,'parts',parts,'tex',tex_n,sum(os.path.getsize(f'{OUT}/tex/{f}') for f in os.listdir(OUT+'/tex'))/1e6)
