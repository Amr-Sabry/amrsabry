import asyncio,os,sys,json,subprocess,time
from playwright.async_api import async_playwright
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));OUT=R+'/shots'
srv=subprocess.Popen(['python3',R+'/tools/rangeserve.py','8795',R+'/site'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(.6)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(proxy={'server':os.environ.get('HTTPS_PROXY','http://127.0.0.1:39821'),'bypass':'localhost,127.0.0.1'},args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl'])
        pg=await (await b.new_context(viewport={'width':1400,'height':800})).new_page(); errs=[]
        pg.on('pageerror',lambda e:errs.append('ERR '+str(e)[:300])); pg.on('console',lambda m:errs.append('CON '+m.text[:220]) if m.type=='error' else None)
        pg.on('response',lambda r:errs.append(f'{r.status} '+r.url[:120]) if r.status>=400 else None)
        await pg.goto('http://127.0.0.1:8795/mp/index.html',wait_until='load',timeout=60000)
        t0=time.time()
        for i in range(60):
            await asyncio.sleep(3)
            if await pg.evaluate('!!window.__ready'): break
        print('ready',await pg.evaluate('!!window.__ready'),round(time.time()-t0),errs[:6],flush=True)
        await asyncio.sleep(20)
        await pg.screenshot(path=OUT+'/mp_a.png',timeout=200000)
        print('errs',errs[:10])
        await b.close()
try: asyncio.run(main())
finally: srv.terminate()
