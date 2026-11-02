import asyncio,os,sys,json,subprocess,time
from playwright.async_api import async_playwright
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));OUT=R+'/shots'
srv=subprocess.Popen(['python3',R+'/tools/rangeserve.py','8798',R+'/site'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(.6)
def hook(pg,errs):
    pg.on('pageerror',lambda e:errs.append('ERR '+str(e)[:300])); pg.on('console',lambda m:errs.append('CON '+m.text[:220]) if m.type=='error' else None)
    pg.on('response',lambda r:errs.append(f'{r.status} '+r.url[:120]) if r.status>=400 else None)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(proxy={'server':os.environ.get('HTTPS_PROXY','http://127.0.0.1:39821'),'bypass':'localhost,127.0.0.1'},args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl','--autoplay-policy=no-user-gesture-required'])
        ctx=await b.new_context(viewport={'width':1440,'height':900})
        pg=await ctx.new_page();e1=[];hook(pg,e1)
        await pg.goto('http://127.0.0.1:8798/cut/index.html',wait_until='load',timeout=60000);await asyncio.sleep(3)
        await pg.evaluate("__cut.selectShot('sh019',true)");await asyncio.sleep(.6);await pg.keyboard.press('3');await asyncio.sleep(1.5)
        print('cut',await pg.evaluate("()=>({still:document.querySelector('#stillb').getAttribute('src'),hid:document.querySelector('#stillb').hidden,lab:document.querySelector('#lab-b').textContent,live:document.querySelector('#t-live').getAttribute('aria-pressed'),prompt:document.querySelector('#f-prompt').value.slice(0,60),cast:document.querySelector('.figs')?.innerText})"),flush=True)
        await pg.screenshot(path=OUT+'/cut_split.png',timeout=60000)
        await pg.keyboard.press('2');await asyncio.sleep(.4);print('errs cut',e1[:6],flush=True);await pg.close()
        pg=await ctx.new_page();e2=[];hook(pg,e2)
        await pg.add_init_script("try{localStorage.setItem('nevera.dir.on','0')}catch(e){}")
        await pg.set_viewport_size({'width':1280,'height':720})
        await pg.goto('http://127.0.0.1:8798/mp/index.html',wait_until='load',timeout=60000);t0=time.time()
        for i in range(70):
            await asyncio.sleep(3)
            if await pg.evaluate('!!window.__ready'): break
        print('mp ready',await pg.evaluate('!!window.__ready'),round(time.time()-t0),e2[:5],flush=True)
        r=await pg.evaluate("""async()=>{const d=window.__dbg;await new Promise(r=>setTimeout(r,1500));const n=d.SHOTS.length;d.pickShot('sh019');await new Promise(r=>setTimeout(r,1500));return {shots:n,rigs:window.__studio.RIGS.length}}""")
        print('mp',r,flush=True)
        await asyncio.sleep(40)
        await pg.screenshot(path=OUT+'/mp_shot.png',timeout=200000)
        print('errs mp',e2[:8],flush=True)
        await b.close()
try: asyncio.run(main())
finally: srv.terminate()
