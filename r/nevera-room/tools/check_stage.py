import asyncio,os,sys,json,subprocess,time
from playwright.async_api import async_playwright
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));OUT=R+'/shots'
srv=subprocess.Popen(['python3',R+'/tools/rangeserve.py','8799',R+'/site'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(.6)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(proxy={'server':os.environ.get('HTTPS_PROXY','http://127.0.0.1:39821'),'bypass':'localhost,127.0.0.1'},args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl'])
        pg=await (await b.new_context(viewport={'width':1280,'height':720})).new_page();e=[]
        pg.on('pageerror',lambda x:e.append('ERR '+str(x)[:300]));pg.on('console',lambda m:e.append('CON '+m.text[:220]) if m.type=='error' else None);pg.on('response',lambda r:e.append(f'{r.status} '+r.url[:120]) if r.status>=400 else None)
        await pg.goto('http://127.0.0.1:8799/mp/index.html#shot-sh019&stage&dir&from=cut',wait_until='load',timeout=60000);t0=time.time()
        for i in range(70):
            await asyncio.sleep(3)
            if await pg.evaluate('!!window.__ready'): break
        print('ready',round(time.time()-t0),flush=True)
        await asyncio.sleep(45)
        print(await pg.evaluate("""()=>{const d=window.__dbg;return {shots:d.SHOTS.length,hud:document.querySelector('#camhud')?.innerText?.slice(0,80),sel:document.querySelector('#shotsel').value,info:document.querySelector('#stage-info')?.textContent?.slice(0,120)}}"""),flush=True)
        await pg.screenshot(path=OUT+'/mp_stage.png',timeout=240000)
        print('errs',e[:8],flush=True);await b.close()
try: asyncio.run(main())
finally: srv.terminate()
