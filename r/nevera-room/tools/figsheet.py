import asyncio,os,sys,json,subprocess,time,base64,io
from playwright.async_api import async_playwright
from PIL import Image,ImageDraw
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
srv=subprocess.Popen(['python3',R+'/tools/rangeserve.py','8794',R+'/site'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(.5)
PAGE='''<!doctype html><script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js"}}</script><script type="module">
import * as THREE from 'three';
const meta=await (await fetch('/cast/scene.json')).json();
const b64=await (await fetch('/cast/geo0.txt')).text();const bin=atob(b64);const u8=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);
const raw=await new Response(new Blob([u8]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
const scene=new THREE.Scene();scene.background=new THREE.Color(0x2a2b2e);
const mats=meta.materials.map(m=>new THREE.MeshStandardMaterial({color:new THREE.Color().setRGB(m.color[0]/255,m.color[1]/255,m.color[2]/255,THREE.SRGBColorSpace),roughness:.8,side:THREE.DoubleSide}));
for(const m of meta.meshes){const qp=new Uint16Array(raw,m.p,m.nv*3);const pos=new Float32Array(m.nv*3);for(let i=0;i<m.nv;i++){for(let k=0;k<3;k++)pos[i*3+k]=m.bmin[k]+qp[i*3+k]/65535*m.ext[k];}
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.InterleavedBufferAttribute(new THREE.InterleavedBuffer(new Int8Array(raw,m.n,m.nv*4),4),3,0,true));g.setIndex(new THREE.BufferAttribute(m.i32?new Uint32Array(raw,m.i,m.ni):new Uint16Array(raw,m.i,m.ni),1));scene.add(new THREE.Mesh(g,mats[m.m]));}
scene.add(new THREE.HemisphereLight(0xffffff,0x444444,1.3));const d=new THREE.DirectionalLight(0xffeedd,2.4);d.position.set(4,8,6);scene.add(d);
const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setSize(520,520);document.body.appendChild(r.domElement);r.outputColorSpace=THREE.SRGBColorSpace;
const cam=new THREE.PerspectiveCamera(32,1,.05,500);
window.shot=(x,z,h)=>{cam.position.set(x+1.6,h*.8,z+3.6);cam.lookAt(x,h*.48,z+.25);r.render(scene,cam);return r.domElement.toDataURL('image/jpeg',.86)};
window.ready=true;
</script>'''
open(R+'/site/_fs.html','w').write(PAGE)
info=json.load(open(R+'/tools/cast_views.json'))['info']
want=sys.argv[2].split(',') if len(sys.argv)>2 and sys.argv[2] else [i['id'] for i in info]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(proxy={'server':os.environ.get('HTTPS_PROXY','http://127.0.0.1:39821'),'bypass':'localhost,127.0.0.1'},args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl'])
        pg=await (await b.new_context(viewport={'width':600,'height':600})).new_page()
        pg.on('pageerror',lambda e:print('ERR',str(e)[:200]))
        await pg.goto('http://127.0.0.1:8794/_fs.html',wait_until='load',timeout=60000)
        for i in range(40):
            await asyncio.sleep(1)
            if await pg.evaluate('!!window.ready'): break
        ims=[]
        for f in info:
            if f['id'] not in want: continue
            d=await pg.evaluate("a=>window.shot(a[0],a[1],a[2])",[f['xz'][0],f['xz'][1],1.9])
            im=Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).convert('RGB');ImageDraw.Draw(im).text((8,8),f['label'],fill=(255,240,200));ims.append(im)
        await b.close()
    cols=int(sys.argv[3]) if len(sys.argv)>3 else 6;c=330;rows=(len(ims)+cols-1)//cols
    S=Image.new('RGB',(c*cols,c*rows))
    for i,im in enumerate(ims): S.paste(im.resize((c,c)),((i%cols)*c,(i//cols)*c))
    S.save(sys.argv[1],quality=86);print(S.size,len(ims))
try: asyncio.run(main())
finally:
    srv.terminate()
    try: os.remove(R+'/site/_fs.html')
    except: pass
