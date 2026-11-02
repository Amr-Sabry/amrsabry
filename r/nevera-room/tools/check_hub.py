import asyncio,os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(proxy={'server':os.environ.get('HTTPS_PROXY','http://127.0.0.1:39821')})
        pg=await (await b.new_context(viewport={'width':1280,'height':800})).new_page();e=[]
        pg.on('pageerror',lambda x:e.append('ERR '+str(x)[:200]));pg.on('response',lambda r:e.append(f'{r.status} '+r.url[:110]) if r.status>=400 else None)
        await pg.goto('https://aromahub.studio/nevera-room',wait_until='load',timeout=60000);await asyncio.sleep(1.5)
        print('room',await pg.title(),await pg.evaluate("[...document.querySelectorAll('.btn')].map(a=>a.href)"),flush=True)
        await pg.click('a.btn >> nth=0');await pg.wait_for_load_state('load');await asyncio.sleep(4)
        print('cut',pg.url,await pg.evaluate("()=>({n:__cut.shots.length,sync:document.querySelector('#sync').textContent,f1:document.querySelector('#f1').src,d:document.querySelector('#v1').duration})"),flush=True)
        await pg.evaluate("__cut.selectShot('sh019',true)");await asyncio.sleep(.8);await pg.keyboard.press('3');await asyncio.sleep(1.2)
        print('still',await pg.evaluate("document.querySelector('#stillb').complete&&document.querySelector('#stillb').naturalWidth"),flush=True)
        print('errs',e[:8]);await b.close()
asyncio.run(main())
