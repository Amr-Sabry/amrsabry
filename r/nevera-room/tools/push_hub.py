#!/usr/bin/env python3
"""Read-only copy of the room on Aroma Hub: /nevera-room. Frames come from the animatic's folder on the hub. Usage: push_hub.py "<commit message>" """
import os,re,shutil,subprocess,sys,json
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); SITE=R+'/site'; REPO='/home/claude/amrsabry'; D=REPO+'/r/nevera-room'
msg=sys.argv[1]
os.makedirs(D,exist_ok=True)
room=open(SITE+'/index.html',encoding='utf-8').read()
room=room.replace('<meta charset="utf-8">\n','',1)
open(REPO+'/r/nevera-room.html','w',encoding='utf-8').write('<!doctype html>\n<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex"><base href="/r/nevera-room/"></head><body style="margin:0">\n'+room+'\n</body></html>\n')
for sub in ('thumbs','test','stage','cut','cast','mp'):
    src=f'{SITE}/{sub}'
    if not os.path.isdir(src): continue
    for root,_,fs in os.walk(src):
        rel=os.path.relpath(root,SITE); os.makedirs(f'{D}/{rel}',exist_ok=True)
        for f in fs:
            a=f'{root}/{f}'; b=f'{D}/{rel}/{f}'
            if f.endswith('.html'):
                t=open(a,encoding='utf-8').read()
                t=t.replace('<head>',f'<head><base href="/r/nevera-room/{rel}/">',1).replace("'../sb/'","'/r/nevera-film/sb/'").replace('href="../index.html"','href="/nevera-room"').replace('<meta charset="utf-8">','<meta charset="utf-8"><meta name="robots" content="noindex">',1)
                open(b,'w',encoding='utf-8').write(t)
            else: shutil.copy(a,b)
os.makedirs(D+'/tools',exist_ok=True)
for f in os.listdir(R+'/tools'):
    if f.endswith(('.py','.html','.json')): shutil.copy(f'{R}/tools/{f}',f'{D}/tools/{f}')
if os.path.exists(R+'/README.md'): shutil.copy(R+'/README.md',D+'/README.md')
def git(*a,**k): return subprocess.run(['git','-C',REPO,*a],check=True,text=True,capture_output=True,**k).stdout
git('add','r/nevera-room','r/nevera-room.html')
if not subprocess.run(['git','-C',REPO,'diff','--cached','--quiet']).returncode: print('nothing new'); sys.exit(0)
body=msg+"\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01QYkyuYRAvHUBBTXKAj16bz\n"
git('commit','-m',body)
git('fetch','origin','main','--depth=1')
git('rebase','origin/main')
print(git('push','origin','HEAD:main')[-300:]); print(git('log','-1','--format=%h %s').strip())
