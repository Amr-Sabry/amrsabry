import asyncio,os,sys,json,subprocess,time
from playwright.async_api import async_playwright
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));OUT=R+'/shots';os.makedirs(OUT,exist_ok=True)
srv=subprocess.Popen(['python3',R+'/tools/rangeserve.py','8791',R+'/site'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(.6)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(proxy={'server':os.environ.get('HTTPS_PROXY','http://127.0.0.1:39821'),'bypass':'localhost,127.0.0.1'},args=['--autoplay-policy=no-user-gesture-required'])
        ctx=await b.new_context(viewport={'width':1440,'height':900})
        pg=await ctx.new_page(); errs=[]
        pg.on('pageerror',lambda e:errs.append('ERR '+str(e)[:300])); pg.on('console',lambda m:errs.append('CON '+m.text[:200]) if m.type=='error' else None)
        pg.on('requestfailed',lambda r:errs.append('FAIL '+r.url[:120]))
        pg.on('response',lambda r:errs.append(f'{r.status} '+r.url[:120]) if r.status>=400 else None)
        await pg.goto('http://127.0.0.1:8791/cut/index.html',wait_until='load',timeout=60000)
        await asyncio.sleep(3)
        print(await pg.evaluate('''()=>({shots:__cut.shots.length,first:__cut.shots[0].id,dur:document.querySelector('#v1').duration,sync:document.querySelector('#sync').textContent,count:document.querySelector('#count').textContent,prog:document.querySelector('#prog').innerText,f1:document.querySelector('#f1').getAttribute('src'),w:document.documentElement.scrollWidth,sh:document.querySelector('#tlc').clientHeight})'''))
        await pg.screenshot(path=OUT+'/a_boot.png',timeout=60000)
        # go to a shot with VO and figures
        await pg.evaluate("__cut.selectShot('sh018',true)"); await asyncio.sleep(1.0)
        print(await pg.evaluate("()=>({f1:document.querySelector('#f1').getAttribute('src'),caps:document.querySelector('#caps').innerText,badge:document.querySelector('#badge').innerText,insp:document.querySelector('#ibody').innerText.slice(0,500)})"))
        await pg.screenshot(path=OUT+'/b_shot.png',timeout=60000)
        # play: clock moves, frame changes
        t0=await pg.evaluate("document.querySelector('#v1').currentTime")
        await pg.keyboard.press('Space'); await asyncio.sleep(4)
        print('playing',await pg.evaluate("()=>({paused:document.querySelector('#v1').paused,t:document.querySelector('#v1').currentTime,tc:document.querySelector('#tc').textContent})"),'from',t0)
        await pg.keyboard.press('Space')
        # cut + undo in read-only local mode
        n0=await pg.evaluate("__cut.shots.length"); await pg.evaluate("__cut.seekTo(98.5)"); await pg.evaluate("__cut.cutAt(98.5)"); await asyncio.sleep(.3)
        n1=await pg.evaluate("__cut.shots.length"); await pg.evaluate("__cut.undo()"); await asyncio.sleep(.3); n2=await pg.evaluate("__cut.shots.length"); print('cut',n0,n1,n2)
        # compare mode empty state + scene filter
        await pg.keyboard.press('3'); await asyncio.sleep(.4); await pg.screenshot(path=OUT+'/c_split.png',timeout=60000)
        await pg.keyboard.press('2'); await asyncio.sleep(.2)
        await pg.select_option('#f-scene','10'); await asyncio.sleep(.5)
        print('scene10',await pg.evaluate("()=>({count:document.querySelector('#count').textContent,first:document.querySelector('#list .shot .lb').textContent,all:[...document.querySelectorAll('#list .lb')].map(e=>e.textContent)})"))
        await pg.evaluate("__cut.selectShot('sh070',true)")
        await pg.screenshot(path=OUT+'/d_scene.png',timeout=60000)
        # phone width
        await pg.set_viewport_size({'width':400,'height':820}); await asyncio.sleep(.8)
        print('phone scrollW',await pg.evaluate("document.documentElement.scrollWidth"))
        await pg.screenshot(path=OUT+'/e_phone.png',timeout=60000)
        print('errs',errs[:12])
        # the landing page
        pg2=await ctx.new_page(); await pg2.set_viewport_size({'width':1280,'height':900}); await pg2.goto('http://127.0.0.1:8791/index.html',wait_until='load',timeout=60000); await asyncio.sleep(1); await pg2.screenshot(path=OUT+'/f_room.png',full_page=True,timeout=60000)
        await b.close()
try: asyncio.run(main())
finally: srv.terminate()
