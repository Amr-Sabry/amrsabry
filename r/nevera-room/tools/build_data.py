#!/usr/bin/env python3
"""Nevera Cutting Room data: shots, film text, thumbnail sprite, audio mix and peaks. All from the v5 animatic."""
import json,subprocess,sys,os,shutil
import numpy as np
from PIL import Image
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC=R+'/src'; OUT=R+'/site'
S=json.load(open(os.path.join(R,'..','nevera_S.json')))
FPS=25; VER='v5-1029'; TOTAL=S[-1]['e']
snap=lambda t: round(round(t*FPS)/FPS,3)
# what each shot is made from, and where it stands on our masterplan
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from places_map import PLACE
from prompts_data import P as PROMPTS,MOVE,MOTION
import math
CAST_L={i['id']:i for i in json.load(open(os.path.dirname(os.path.abspath(__file__))+'/cast_views.json'))['info']}
ZD=json.load(open('/home/claude/amrsabry/r/nevera/zones.json'))
ZONES={q['id']:q for q in ZD['zones']}
def zc(q):
    pts=[p for poly in q['polys'] for p in poly[0]]
    return [round(sum(p[0] for p in pts)/len(pts)),round(sum(p[1] for p in pts)/len(pts))]
def resolve(pl):
    r=pl['ref']; o=dict(ref=r,sure=pl['sure'],note=pl['note'])
    if r in ZONES:
        q=ZONES[r]; c=ZD['cats'][q['cat']]
        o.update(cat=q['cat'],pid=q.get('pid') or '',ar=c['ar'],en=c['en'],xy=zc(q))
    elif r.startswith('py:'):
        q=[x for x in ZD['extras']['pyramids'] if x['ar']==r[3:]][0]; o.update(cat='py',pid='',ar=q['ar']+' · '+q['site'],en=q['en'],xy=q['p'])
    elif r=='gem':
        q=ZD['extras']['landmarks'][0]; o.update(cat='lm',pid='',ar=q['ar'],en=q['en'],xy=q['p'])
    elif r=='station':
        q=ZD['extras']['station']; pts=q['poly']; o.update(cat='st',pid='',ar=q['ar'],en=q['en'],xy=[round(sum(p[0] for p in pts)/len(pts)),round(sum(p[1] for p in pts)/len(pts))])
    elif r=='rail':
        q=ZD['extras']['rail']; o.update(cat='rail',pid='',ar=q['ar'],en=q['en'],xy=[0,0])
    elif r=='all':
        o.update(cat='all',pid='',ar='المخطط كاملًا',en='The whole plan',xy=[0,0])
    else:
        o.update(cat='',pid='',ar='',en='',xy=None)
    o['label']=(o['ar']+(' · '+o['pid'] if o['pid'] else '')) if o['ar'] else ''
    return o
MP=set(['new_04-a.jpg', 'new_04-b.jpg', 'new_04-c.jpg', 'new_04-d.jpg', 'new_05-a.jpg', 'new_05-b.jpg', 'new_08-a.jpg', 'new_08-b.jpg', 'new_08-c.jpg', 'new_09-a.jpg', 'new_11-a.jpg', 'new_12-a.jpg', 'shot_03-4.jpg', 'shot_03-5.jpg', 'shot_04-1.jpg', 'shot_04-2.jpg', 'shot_04-3.jpg', 'shot_04-4.jpg', 'shot_04-6.jpg', 'shot_05-1.jpg', 'shot_06-1.jpg', 'shot_06-2.jpg', 'shot_06-4.jpg', 'shot_07-1.jpg', 'shot_07-6.jpg', 'shot_08-6.jpg', 'shot_09-3.jpg', 'shot_09-5.jpg', 'shot_10-1.jpg', 'shot_10-7.jpg', 'shot_18-6.jpg', 'shot_19-3.jpg'])
GFX={'shot_18-5.jpg','shot_19-1.jpg'}
# wording the brief does not allow on any sheet we hand out
FIX={'متفرّج جالس في المدرجات يتابع سيارة الفورميلا وهي تمرّ كالبرق.':'متفرّج جالس في المدرجات يتابع خط الضوء وهو يمرّ كالبرق.'}
flat=[]
for s in S:
    for k,sh in enumerate(s['shots']):
        fr=sh.get('sb') or f"shot_{s['n']:02d}-{k+1}.jpg"
        flat.append((sh['t'],s,k,sh,fr))
flat.sort(key=lambda x:x[0])
assert set(MP)<=set(f[4] for f in flat), set(MP)-set(f[4] for f in flat)
assert set(PLACE)==set(f[4] for f in flat), set(f[4] for f in flat)^set(PLACE)
assert set(PROMPTS)==set(f[4] for f in flat), set(f[4] for f in flat)^set(PROMPTS)
for v in PROMPTS.values(): assert all(c in CAST_L for c in v[0]),v[0]
shots=[]
for i,(t,s,k,sh,fr) in enumerate(flat):
    tin=snap(t); tout=snap(flat[i+1][0]) if i+1<len(flat) else snap(TOTAL)
    desc=FIX.get(sh['text'],sh['text'])
    pl=resolve(PLACE[fr]); cs,act,mv,mm,lt=PROMPTS[fr]
    names=', '.join(CAST_L[c]['label'] for c in cs)
    loc=pl['en']+(f" ({pl['pid']})" if pl['pid'] else '')
    prompt=f"{act}\nLocation: {loc or 'no fixed place'}, from the Nevera masterplan.\nCamera: {MOVE[mv]}, {mm}mm, dynamic handheld feel.\nLight: {lt}.\nReferences to feed: "+(f"characters ({names}), " if names else '')+f"location render ({loc or 'none'}), storyboard keyframe ({fr}). Let the model generate the shot: do not animate the keyframe as a start frame.\nPhotoreal, cinematic teal and orange grade, dense composition. No text, no logos, no brand names."
    shots.append(dict(id=f'sh{i+1:03d}',order=(i+1)*10,tin=tin,tout=tout,label=pl['label'],place=pl,desc=desc,type=sh.get('type',''),
        source='mp' if fr in MP else 'gfx' if fr in GFX else 'ai',stage='cut',prompt=prompt,notes='',take=None,cast=cs,move=mv,lens=mm,frame=fr,th=i,sc=s['n'],code=f"{s['n']:02d}-{k+1:02d}",ver=VER))
assert all(a['tout']==b['tin'] for a,b in zip(shots,shots[1:]))
assert all(x['tout']>x['tin'] for x in shots)
# motion.json: the camera move each shot asks for (the viewers' Auto stage reads it)
rng=np.random.default_rng(7)
mo={}
for s in shots:
    d=round(s['tout']-s['tin'],3); y,p_,r_,z=MOTION[s['move']]; n=max(3,int(d*25/3)); smp=[]
    ph=rng.uniform(0,6.28,3)
    for k in range(n+1):
        u=k/n; e=u*u*(3-2*u); t_=round(u*d,3); w=[.5*math.sin(ph[0]+u*d*1.9),.35*math.sin(ph[1]+u*d*2.3),.25*math.sin(ph[2]+u*d*1.4)] if s['move']!='static' else [0,0,0]
        smp.append([t_,round(y*e+w[0],3),round(p_*e+w[1],3),round(r_*e+w[2],3),round(1+(z-1)*e,4),1.0])
    mo[s['id']]=dict(dur=d,samples=smp,summary=MOVE[s['move']],confidence=1.0,total=dict(pan=y,tilt=p_,roll=r_,zoom=z))
os.makedirs(OUT+'/cut',exist_ok=True); json.dump(dict(fps=25,hfov=40,shots=mo),open(OUT+'/cut/motion.json','w'),separators=(',',':'))
os.makedirs(OUT+'/cut/audio',exist_ok=True); os.makedirs(OUT+'/sb',exist_ok=True)
json.dump(dict(ver=VER,shots=shots),open(OUT+'/cut/shots_auto.json','w'),ensure_ascii=False,indent=0)
scenes=[{k:s.get(k) for k in('n','s','e','title','mv','mv_en','mus','person','tempo','shot','inst_ar','inst_en')} for s in S]
for x in scenes:
    pass
vo=[];sup=[]
for s in S:
    if s.get('vo'): vo.append(dict(id=s['vo'],t=s['vo_t'],dur=s['vo_dur'],en=s['vo_en'],ar=s['vo_ar']))
    for x in s.get('vx') or []: vo.append(dict(id=x['vo'],t=x['t'],dur=x['dur'],en=x['en'],ar=x['ar']))
    for x in s.get('sup') or []: sup.append(dict(t=x['t'],e=x['e'],big=x['big'],ar=x['ar'],en=x['en']))
vo.sort(key=lambda v:v['t']); sup.sort(key=lambda v:v['t'])
plots=sorted({(ZD['cats'][q['cat']]['ar'],q.get('pid') or '') for q in ZD['zones'] if q.get('pid')},key=lambda x:(x[0],x[1]))
json.dump(dict(total=TOTAL,scenes=scenes,vo=vo,sup=sup,plots=[a+' · '+b for a,b in plots],cast={k:dict(label=v['label'],ar=v['ar']) for k,v in CAST_L.items()}),open(OUT+'/cut/film.json','w'),ensure_ascii=False,indent=0)
# sprite: one 192x108 cell per shot, in shot order
CW,CH,COLS=192,108,16; rows=(len(flat)+COLS-1)//COLS
sp=Image.new('RGB',(CW*COLS,CH*rows),(0,0,0))
for i,(t,s,k,sh,fr) in enumerate(flat):
    im=Image.open(f'{SRC}/sb/{fr}').convert('RGB'); im=im.resize((CW,CH),Image.LANCZOS)
    sp.paste(im,((i%COLS)*CW,(i//COLS)*CH))
    shutil.copy(f'{SRC}/sb/{fr}',f'{OUT}/sb/{fr}')
sp.save(OUT+'/cut/sprite.jpg',quality=72,optimize=True)
# audio: the same mix the animatic does live (voice dips the score, soft hall on the voice)
SR=44100
def dec(p):
    d=subprocess.run(['ffmpeg','-v','error','-i',p,'-f','f32le','-ac','2','-ar',str(SR),'-'],capture_output=True).stdout
    return np.frombuffer(d,dtype=np.float32).reshape(-1,2).astype(np.float64)
score=dec(SRC+'/score.mp3'); N=int(round(TOTAL*SR))
score=score[:N] if len(score)>=N else np.vstack([score,np.zeros((N-len(score),2))])
voc=np.zeros((N,2)); spans=[]
for v in vo:
    a=dec(f"{SRC}/vo/{v['id']}.mp3"); i=int(v['t']*SR); j=min(N,i+len(a)); voc[i:j]+=a[:j-i]
    spans.append((v['t'],v['t']+len(a)/SR))
# envelope: target 0.6 from 0.6 s before a line to its end, eased like the page does
hop=SR//100; tgt=np.ones(N//hop+1)
for a,b in spans: tgt[max(0,int((a-0.6)*100)):int(b*100)]=0.6
env=np.empty_like(tgt); g=1.0
for i,x in enumerate(tgt):
    tau=0.22 if x<g else 0.7; g+= (x-g)*(1-np.exp(-0.01/tau)); env[i]=g
gain=np.interp(np.arange(N),np.arange(len(env))*hop,env)[:,None]
try:
    from scipy.signal import fftconvolve
    rng=np.random.default_rng(11); n=int(SR*2.2); ir=rng.standard_normal(n)*np.exp(-6.9*np.arange(n)/n)
    wet=np.stack([fftconvolve(voc[:,c],ir)[:N] for c in range(2)],1); wet*=0.16*np.sqrt((voc**2).sum())/max(1e-9,np.sqrt((wet**2).sum()))
except Exception as e:
    print('no reverb',e); wet=0
mix=score*gain+voc+wet
peak=np.abs(mix).max(); mix=mix/max(1.0,peak/0.98)
raw=OUT+'/cut/audio/_mix.f32'; mix.astype(np.float32).tofile(raw)
subprocess.run(['ffmpeg','-y','-v','error','-f','f32le','-ac','2','-ar',str(SR),'-i',raw,'-af','alimiter=limit=0.95:attack=10:release=120','-c:a','libmp3lame','-b:a','128k',OUT+'/cut/audio/mix.mp3'],check=True)
os.remove(raw)
# peaks at 20 per second
mono=np.abs(mix).max(1); step=SR//20; pk=[float(mono[i:i+step].max()) for i in range(0,N,step)]; m=max(pk) or 1
json.dump(dict(rate=20,peaks=[round(p/m,2) for p in pk]),open(OUT+'/cut/audio/peaks.json','w'),separators=(',',':'))
from collections import Counter
print(Counter(x['source'] for x in shots),len(shots),'vo',len(vo),'sup',len(sup),'tot',TOTAL)
print(os.path.getsize(OUT+'/cut/audio/mix.mp3')/1e6,'MB mix',os.path.getsize(OUT+'/cut/sprite.jpg')/1e6,'MB sprite')
