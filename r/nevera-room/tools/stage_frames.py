import asyncio,os,sys,json,subprocess,time,base64
from playwright.async_api import async_playwright
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));OUT=R+'/site/stage';os.makedirs(OUT,exist_ok=True)
srv=subprocess.Popen(['python3',R+'/tools/rangeserve.py','8797',R+'/site'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(.5)
open(R+'/site/_ms.html','w').write(open(R+'/tools/mpsheet.html').read().replace('r.setSize(512,288)','r.setSize(960,540)').replace("toDataURL('image/jpeg',.82)","toDataURL('image/jpeg',.8)"))
P=json.load(open(R+'/tools/mp_presets.json'))
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(proxy={'server':os.environ.get('HTTPS_PROXY','http://127.0.0.1:39821'),'bypass':'localhost,127.0.0.1'},args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl'])
        pg=await (await b.new_context(viewport={'width':1000,'height':600})).new_page()
        pg.on('pageerror',lambda e:print('ERR',str(e)[:300],flush=True))
        await pg.goto('http://127.0.0.1:8797/_ms.html',wait_until='load',timeout=60000)
        for i in range(90):
            await asyncio.sleep(1)
            if await pg.evaluate('!!window.ready'): break
        await asyncio.sleep(4);t0=time.time()
        await pg.evaluate("p=>window.shot(p)",list(P.values())[0]);await asyncio.sleep(3)
        for n,(sid,pr) in enumerate(P.items()):
            d=await pg.evaluate("p=>window.shot(p)",pr);open(f'{OUT}/{sid}.jpg','wb').write(base64.b64decode(d.split(',')[1]))
            if n%20==0: print(n,round(time.time()-t0),flush=True)
        await b.close();print('done',round(time.time()-t0),flush=True)
try: asyncio.run(main())
finally:
    srv.terminate()
    try: os.remove(R+'/site/_ms.html')
    except: pass
