import asyncio,os,sys,json,subprocess,time
from playwright.async_api import async_playwright
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));OUT=R+'/shots';os.makedirs(OUT,exist_ok=True)
srv=subprocess.Popen(['python3',R+'/tools/rangeserve.py','8792',R+'/site'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(.6)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(proxy={'server':os.environ.get('HTTPS_PROXY','http://127.0.0.1:39821'),'bypass':'localhost,127.0.0.1'},args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl'])
        ctx=await b.new_context(viewport={'width':1600,'height':900})
        pg=await ctx.new_page(); errs=[]
        pg.on('pageerror',lambda e:errs.append('ERR '+str(e)[:300])); pg.on('console',lambda m:errs.append('CON '+m.text[:220]) if m.type=='error' else None)
        pg.on('response',lambda r:errs.append(f'{r.status} '+r.url[:120]) if r.status>=400 else None)
        await pg.goto('http://127.0.0.1:8792/cast/index.html#embedless',wait_until='load',timeout=60000)
        for i in range(30):
            await asyncio.sleep(2)
            if await pg.evaluate('!!window.__ready'): break
        print('ready',await pg.evaluate('!!window.__ready'),errs[:6])
        print(await pg.evaluate("()=>Object.keys(window).filter(k=>k.startsWith('__')).slice(0,30)"))
        print(await pg.evaluate("()=>({btns:[...document.querySelectorAll('#quickviews button, #views button, [data-view]')].length,tab:!!document.querySelector('#tab-rig'),rigs:document.querySelectorAll('#rigbox details').length})"))
        print(await pg.evaluate('''()=>{const s=window.__studio,r=s.RIGS.find(x=>x.id==='maestro');const mi=r.segments['8'][0];const before=JSON.stringify(window.__studio.RIGV['rig:maestro.le']||0);s.RIGV['rig:maestro.lsF']=30;s.RIGV['rig:maestro.le']=40;s.applyRigs();return {rigs:s.RIGS.length,joints:r.joints.length,parent8:r.joints[7].parent,changed:s.RIGV['rig:maestro.le']}}'''))
        await pg.screenshot(path=OUT+'/cast_a.png',timeout=120000)
        print('errs',errs[:10])
        await b.close()
try: asyncio.run(main())
finally: srv.terminate()
