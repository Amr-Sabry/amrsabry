import asyncio,os,sys,json,subprocess,time
from playwright.async_api import async_playwright
from PIL import Image
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));OUT=R+'/shots';os.makedirs(OUT+'/c',exist_ok=True)
srv=subprocess.Popen(['python3',R+'/tools/rangeserve.py','8793',R+'/site'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(.6)
names=sys.argv[2].split('|');outp=sys.argv[1]
V=json.load(open(R+'/tools/cast_views.json'))['views']
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(proxy={'server':os.environ.get('HTTPS_PROXY','http://127.0.0.1:39821'),'bypass':'localhost,127.0.0.1'},args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl'])
        ctx=await b.new_context(viewport={'width':1000,'height':560})
        pg=await ctx.new_page()
        await pg.add_init_script("try{localStorage.setItem('nevera.dir.on','0')}catch(e){}")
        await pg.goto('http://127.0.0.1:8793/cast/index.html',wait_until='load',timeout=60000)
        for i in range(40):
            await asyncio.sleep(1.5)
            if await pg.evaluate('!!window.__ready'): break
        ims=[]
        for n in names:
            v=[x for x in V if x['name']==n][0]
            v2=dict(v);v2['pos']=[v['target'][0]+float(sys.argv[3]) if len(sys.argv)>3 else v['pos'][0],v['pos'][1],v['pos'][2]]
            await pg.evaluate("v=>window.__dbg.setView(v)",v2);await asyncio.sleep(2.2)
            f=f"{OUT}/c/{n.replace(' ','_').replace(',','')}.png"
            await pg.locator('canvas').first.screenshot(path=f,timeout=90000);ims.append(Image.open(f).convert('RGB'))
        await b.close()
    w,h=ims[0].size;s=.62;cw,ch=int(w*s),int(h*s);cols=4;rows=(len(ims)+cols-1)//cols
    S=Image.new('RGB',(cw*cols,ch*rows))
    for i,im in enumerate(ims): S.paste(im.resize((cw,ch)),((i%cols)*cw,(i//cols)*ch))
    S.save(outp,quality=88);print(S.size)
try: asyncio.run(main())
finally: srv.terminate()
