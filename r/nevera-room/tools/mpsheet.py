import asyncio,os,sys,json,subprocess,time,base64,io
from playwright.async_api import async_playwright
from PIL import Image,ImageDraw
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
srv=subprocess.Popen(['python3',R+'/tools/rangeserve.py','8796',R+'/site'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(.5)
PAGE=open(R+'/tools/mpsheet.html').read()
open(R+'/site/_ms.html','w').write(PAGE)
P=json.load(open(R+'/tools/mp_presets.json'));S=json.load(open(R+'/site/cut/shots_auto.json'))['shots']
ids=sys.argv[2].split(',') if sys.argv[2] not in('mp','') else [s['id'] for s in S if s['source']=='mp']
cols=int(sys.argv[3]) if len(sys.argv)>3 else 6
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(proxy={'server':os.environ.get('HTTPS_PROXY','http://127.0.0.1:39821'),'bypass':'localhost,127.0.0.1'},args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl'])
        pg=await (await b.new_context(viewport={'width':700,'height':400})).new_page()
        pg.on('pageerror',lambda e:print('ERR',str(e)[:300],flush=True))
        await pg.goto('http://127.0.0.1:8796/_ms.html',wait_until='load',timeout=60000)
        for i in range(90):
            await asyncio.sleep(1)
            if await pg.evaluate('!!window.ready'): break
        print('ready',flush=True);ims=[];t0=time.time()
        for sid in ids:
            s=[x for x in S if x['id']==sid][0];pr=P.get(sid)
            if not pr: continue
            d=await pg.evaluate("p=>window.shot(p)",pr)
            im=Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).convert('RGB')
            sb=Image.open(R+'/src/sb/'+s['frame']).convert('RGB').resize((im.width,im.height))
            c=Image.new('RGB',(im.width,im.height*2));c.paste(sb,(0,0));c.paste(im,(0,im.height));ImageDraw.Draw(c).text((6,6),f"{sid} {s['frame'][:12]}",fill=(255,230,120));ims.append(c)
            print(sid,round(time.time()-t0),flush=True)
        await b.close()
    w,h=ims[0].size;rows=(len(ims)+cols-1)//cols;Sh=Image.new('RGB',(w*cols,h*rows))
    for i,im in enumerate(ims): Sh.paste(im,((i%cols)*w,(i//cols)*h))
    Sh.save(sys.argv[1],quality=85);print(Sh.size)
try: asyncio.run(main())
finally:
    srv.terminate()
    try: os.remove(R+'/site/_ms.html')
    except: pass
