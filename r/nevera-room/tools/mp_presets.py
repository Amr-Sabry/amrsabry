#!/usr/bin/env python3
"""A starting frame for every located shot: place from the masterplan, framing from the shot type and lens, light from the scene. Also finds open ground for the cast."""
import json,math,os,sys
import numpy as np
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));X=R+'/mpbake'
sys.path.insert(0,R+'/tools')
from prompts_data import P as PR,DAWN,RISE,DAY,GOLD,DUSK,NIGHT,INT,STAGE,MAP
GT=np.load(X+'/ground.npy');BOX=np.load(X+'/boxes.npy')
gx=GT[:,:,0];gz=GT[:,:,2];gy=GT[:,:,1];gxmin,gxmax,gzmin,gzmax=gx.min(1),gx.max(1),gz.min(1),gz.max(1)
def ground(x,z):
    s=np.where((gxmin<=x)&(gxmax>=x)&(gzmin<=z)&(gzmax>=z))[0]
    best=None
    for i in s:
        a,b,c=GT[i];v0=c-a;v1=b-a;v2=np.array([x,0,z])-a
        d=v0[0]*v1[2]-v1[0]*v0[2]
        if abs(d)<1e-9: continue
        u=(v2[0]*v1[2]-v1[0]*v2[2])/d;w=(v0[0]*v2[2]-v2[0]*v0[2])/d
        if u>=-1e-4 and w>=-1e-4 and u+w<=1.0001:
            y=a[1]+u*(c[1]-a[1])+w*(b[1]-a[1])
            if best is None or y>best: best=y
    return float(best) if best is not None else 3.0
def isfree(x,z,r):
    return not np.any((BOX[:,0]-r<x)&(BOX[:,2]+r>x)&(BOX[:,1]-r<z)&(BOX[:,3]+r>z))
def freespot(x,z,r=10,maxd=500):
    if isfree(x,z,r): return x,z
    for d in range(10,maxd,10):
        for k in range(16):
            a=2*math.pi*k/16;xx,zz=x+d*math.cos(a),z+d*math.sin(a)
            if isfree(xx,zz,r): return xx,zz
    return x,z
LIGHT={DAWN:dict(hour=5.9,haze=.5),RISE:dict(hour=6.2,haze=.4),DAY:dict(hour=9,haze=.25),GOLD:dict(hour=16.5,haze=.5),DUSK:dict(hour=17.3,haze=.5,glow=.9),NIGHT:dict(hour=19.6,haze=.3,glow=1.2,expo=.6),INT:dict(hour=11,haze=.2),STAGE:dict(hour=11,haze=.2),MAP:dict(hour=15,haze=.1),'black':dict(hour=19.6)}
TRAIN=np.array([-563.,7.,-590.]);D=np.array([-.707,0,-.707]);N=np.array([.707,0,-.707])
PF=3.5   # platform level
PLAT=np.array([TRAIN[0],PF,TRAIN[2]])-N*9-D*62
# the longest tall structure in the Performance Zone: the stands
_z=BOX[(BOX[:,0]>1400)&(BOX[:,2]<4200)&(BOX[:,1]>-200)&(BOX[:,3]<2600)&(BOX[:,4]>9)]
_i=int(np.argmax(np.maximum(_z[:,2]-_z[:,0],_z[:,3]-_z[:,1])));STAND=np.array([(_z[_i,0]+_z[_i,2])/2,(_z[_i,4]),(_z[_i,1]+_z[_i,3])/2]);print('stand',STAND,_z[_i])
def r3(v): return [round(float(x),2) for x in v]
O={ # frame -> (pos, target, focal, note)
'shot_03-5.jpg':((1800,900,4200),(500,60,-6000),24,'the whole city, the pyramids behind'),
'shot_04-1.jpg':((1500,9000,9000),(0,0,0),35,'the whole plan from high above'),
'shot_04-2.jpg':((2000,22000,16000),(3000,0,-5000),30,'the plan and its region'),
'shot_04-3.jpg':((-6000,14000,12000),(-800,0,0),30,'the rail line through the region'),
'new_04-a.jpg':((-3500,6500,4000),(4000,0,-5500),30,'site, Giza and Saqqara in one frame'),
'new_04-b.jpg':((-1500,5500,0),(0,0,-9000),30,'site and the Grand Egyptian Museum'),
'new_04-c.jpg':((4000,9000,9000),(-1000,0,-1500),28,'the wide plan, the airport is off the model'),
'shot_04-4.jpg':(tuple(np.array([TRAIN[0],PF+.55,TRAIN[2]])-N*6-D*70),tuple(np.array([TRAIN[0],PF+1.7,TRAIN[2]])+D*10-N*4),28,'knee height on the platform, the train on the right'),
'shot_03-4.jpg':((659,380,36),(499,3,-224),28,'the grand plaza and the district from above'),
'shot_06-4.jpg':((1041,30,1537),(1041,3,1417),35,'the open fields around the lake'),
'shot_10-1.jpg':((3012,14,1833),(2791,8,1499),35,'the lit stands'),
'new_04-d.jpg':(tuple(TRAIN+np.array([300,240,360])),tuple(TRAIN),28,'the station from above'),
'shot_04-5.jpg':(tuple(PLAT+N*1.5+np.array([0,1.5,0])-D*7),tuple(PLAT+np.array([0,1.2,0])),40,'the traveller on the platform'),
'shot_04-6.jpg':((-800,5,-120),(-1100,8,-380),28,'along the entry axis'),
'new_05-a.jpg':((3114,300,-318),(2764,10,-1118),28,'hotels on the desert edge'),
'shot_08-6.jpg':((-1398,170,-1940),(-1398,3,-1951),28,'canopies from above'),
'shot_09-5.jpg':((-3218,130,-48),(-3458,8,-328),28,'the theme park at sunset'),
'new_11-a.jpg':((-2682,210,-99),(-3002,8,-439),28,'the studio complex'),
'new_08-a.jpg':((2083,190,-945),(1823,8,-1265),28,'retail and business districts'),
'shot_10-7.jpg':((2718,1800,1103),(2718,0,1103),35,'the zone from above, lines of light'),
'shot_18-6.jpg':((2600,1500,5200),(0,0,0),24,'the whole city at night'),
'shot_19-3.jpg':((3000,2600,6400),(0,0,-400),35,'the last wide of the city'),
'shot_07-6.jpg':((-312,8,-2807),(-312,5,-2847),24,'crane from the fire to the stars'),
}
d=json.load(open(R+'/site/cut/shots_auto.json'))['shots']
KIND={'ماكرو':'close','قريبة':'close','قريبة جدًا':'close','متوسطة':'mid','متابعة':'mid','كاميرا محمولة':'mid','حركة بطيئة':'mid','انزلاق ناعم':'mid','ضبابية حركة':'wide','حركة سريعة':'wide','واسعة':'wide','واسعة ثابتة':'wide','كرين':'wide','شاشة مقسّمة':'wide','جوية':'air','واسعة جوية':'air','درون سريع':'air','من المدار':'air','علوية':'top','خريطة حيّة':'air','سواد':'wide'}
SPOT={}
def spot_for(pl):
    r=pl['ref']
    if r in SPOT: return SPOT[r]
    if r=='station': p=PLAT
    else:
        xy=pl.get('xy') or [0,0];x,z=xy[0],-xy[1]
        if r in('all','rail'): x,z=0,0
        x,z=freespot(x,z,12);p=np.array([x,ground(x,z),z])
    SPOT[r]=p;return p
# where each figure stands: one copy per place it appears in, the first at the centre of the spot
PAIRS={}
for s in d:
    pl=s['place']
    if not pl.get('ar') or pl['ref'] in('all','rail') or pl['ref'].startswith('py:') or pl['ref']=='gem': continue
    for c in s['cast']:
        L=PAIRS.setdefault(pl['ref'],[])
        if c not in L: L.append(c)
CASTPOS={}
for s in d:
    if s['place'].get('ar') and s['place']['ref'] in PAIRS: spot_for(s['place'])
for ref,L in PAIRS.items():
    c=SPOT[ref]
    for k,fid in enumerate(L):
        if k==0: x,z=c[0],c[2]
        else:
            ring=1+(k-1)//6;a=2*math.pi*((k-1)%6)/6+.5*ring;rad=3.2*ring;x,z=c[0]+rad*math.cos(a),c[2]+rad*math.sin(a)
        y=float(c[1]) if ref=='station' else ground(x,z)
        CASTPOS[f'{ref}|{fid}']=[round(float(x),2),round(y,2),round(float(z),2)]
out={}
for i,s in enumerate(d):
    pl=s['place']
    if not pl.get('ar'): continue
    fr=s['frame'];lt=LIGHT.get(PR[fr][4],{}) ;mm=PR[fr][3]
    note=f"{pl['label']} · {s['type']}"
    if fr in O:
        p,t,f,n=O[fr];note=n
    else:
        c=spot_for(pl)
        if s['cast'] and f"{pl['ref']}|{s['cast'][0]}" in CASTPOS: c=np.array(CASTPOS[f"{pl['ref']}|{s['cast'][0]}"])
        k=KIND.get(s['type'],'mid');az=math.radians([0,28,-24,40,-36,12,-12][i%7]);ca,sa=math.sin(az),math.cos(az)
        dist,h,th={'close':(3.2,1.3,1.25),'mid':(8,1.6,1.3),'wide':(60,12,6),'air':(340,190,10),'top':(5,42,0)}[k]
        if fr=='shot_07-1.jpg': p=(c[0],c[1]+2,c[2]);t=(9155,40,-238);f=85
        elif pl['ref'].startswith('py:') or pl['ref']=='gem': p=(c[0]+ca*160,c[1]+24,c[2]+sa*160);t=(c[0],c[1]+30,c[2]);f=mm
        else: p=(c[0]+ca*dist,c[1]+h,c[2]+sa*dist);t=(c[0],c[1]+th,c[2]);f=mm
    out[s['id']]=dict(note=note,pos=r3(p),target=r3(t),focal=mm if fr not in O else f,light=lt)
json.dump(out,open(R+'/tools/mp_presets.json','w'),ensure_ascii=False)
json.dump({k:[round(float(x),2) for x in v] for k,v in SPOT.items()},open(R+'/tools/mp_spots.json','w'))
json.dump(dict(pos=CASTPOS),open(R+'/tools/mp_cast.json','w'))
print(len(out),'presets',len(SPOT),'spots',len(CASTPOS),'placed figures',{k:len(v) for k,v in PAIRS.items()})
for k,v in list(SPOT.items())[:40]: print(k,[round(float(x)) for x in v])
