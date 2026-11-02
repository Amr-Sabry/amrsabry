#!/usr/bin/env python3
import json,os,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from build_viewer import build,R
Z=json.load(open('/home/claude/amrsabry/r/nevera/zones.json'))
def v(name,x,y,dx,h,dz,focal,th=3): return dict(name=name,pos=[x+dx,h,-y+dz],target=[x,th,-y],focal=focal)
views=[dict(name='The whole plan',pos=[2500,7200,8200],target=[0,0,0],focal=30),
 v('Central station',-400,800,160,70,220,28),v('Entry axis',-3600,650,120,30,200,28),v('Luxury hotels',2764,818,200,90,260,28),v('Grand plaza',499,254,90,28,130,28),v('Media City core',-3002,600,180,80,260,28),v('Backlots',-3281,995,120,50,180,28),v('Higher education',-2206,1400,160,60,220,28),v('Theme park',-3458,328,190,80,240,28),v('Innovation park',-1211,367,120,50,180,28),v('Performance Zone',2718,-1103,420,220,560,28),v('Heritage zone',-312,2847,200,50,300,28),
 dict(name='Pyramids of Giza',pos=[3000,240,-8200],target=[1200,-30,-12100],focal=50),dict(name='Top',pos=[0,12000,10],target=[0,0,0],focal=35)]
cfg=dict(name='Nevera Masterplan',key='mp',slug='nevera-masterplan',place='Our 3D masterplan, from the client AutoCAD file',lat=29.9,lon=31.1,tz=2,groundY=0,cluster=[0,0,0],foot=dict(x0=-4500,x1=4500,z0=-3500,z1=3500),focusR=4500,focusY=20,shadowR=6000,groundOn=False,scale=30,noBuild=True,fogK=.05,views=views)
print(build(R+'/site/mp',cfg,json.load(open(R+'/tools/mp_presets.json')) if os.path.exists(R+'/tools/mp_presets.json') else {}))
