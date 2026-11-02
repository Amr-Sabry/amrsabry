#!/usr/bin/env python3
"""Pull the live masterplan's scene out of the browser: geometries, materials, meshes and instances, world space, scene units."""
import asyncio,os,sys,json,base64,time
from playwright.async_api import async_playwright
OUT=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),'mpbake')
JS=r'''
async () => {
  const S=window.__nvS, G=window.__nvG(); S.updateMatrixWorld(true);
  const THREEcol=(c)=>c?[c.r,c.g,c.b]:[1,1,1];
  const tags=new Map(); const reg=(o,t)=>{ if(o) tags.set(o,t); };
  const cats=window.__nv.data().cats;
  if(G.BLK) for(const [k,g] of Object.entries(G.BLK.byCat)) reg(g,'Buildings: '+(cats[k]?cats[k].en:k));
  for(const [k,m] of Object.entries(G.catMesh||{})) reg(m,'Plots: '+(cats[k]?cats[k].en:k));
  if(G.STR) reg(G.STR.group,'Streets and cars'); if(G.PLC) reg(G.PLC.group,'Places and people'); if(G.CIR) reg(G.CIR.group,'Performance Zone');
  reg(G.trainLayer,'Trains'); reg(G.pyrGroup,'Pyramids and landmarks');
  const tagOf=(o)=>{ let p=o; while(p){ if(tags.has(p)) return tags.get(p); p=p.parent; } return 'Plan and terrain'; };
  const visible=(o)=>{ let p=o; while(p){ if(!p.visible) return false; p=p.parent; } return true; };
  const geos=new Map(), mats=new Map(), items=[], arrays=[]; const push=(ta)=>{ arrays.push(ta); return arrays.length-1; };
  const geoRec=(g)=>{ if(geos.has(g.uuid)) return g.uuid;
    if(!g.attributes.normal) g.computeVertexNormals();
    const pos=g.attributes.position, nor=g.attributes.normal, col=g.attributes.color, uv=g.attributes.uv;
    const read=(a,n)=>{ if(!a) return null; const out=new Float32Array(a.count*n); for(let i=0;i<a.count;i++){ out[i*n]=a.getX(i); if(n>1) out[i*n+1]=a.getY(i); if(n>2) out[i*n+2]=a.getZ(i);} return out; };
    let idx=null; if(g.index){ idx=new Uint32Array(g.index.count); for(let i=0;i<g.index.count;i++) idx[i]=g.index.getX(i); }
    geos.set(g.uuid,{id:g.uuid,nv:pos.count,p:push(read(pos,3)),n:nor?push(read(nor,3)):-1,c:col?push(read(col,3)):-1,uv:uv?push(read(uv,2)):-1,i:idx?push(idx):-1,groups:g.groups||[]});
    return g.uuid; };
  const texSrc=(t)=>{ if(!t||!t.image) return null; const im=t.image; if(im.src) return {src:im.src,rep:[t.repeat.x,t.repeat.y],off:[t.offset.x,t.offset.y]};
    try{ const c=document.createElement('canvas'); c.width=Math.min(im.width||256,1024); c.height=Math.min(im.height||256,1024); c.getContext('2d').drawImage(im,0,0,c.width,c.height); return {data:c.toDataURL('image/jpeg',.82),rep:[t.repeat.x,t.repeat.y],off:[t.offset.x,t.offset.y]}; }catch(e){ return null; } };
  const matRec=(m)=>{ if(mats.has(m.uuid)) return m.uuid;
    mats.set(m.uuid,{id:m.uuid,type:m.type,name:m.name||'',color:THREEcol(m.color),opacity:m.transparent?m.opacity:1,vc:!!m.vertexColors,map:texSrc(m.map),em:m.emissive?THREEcol(m.emissive):null,emI:m.emissiveIntensity||0,metal:m.metalness||0,rough:m.roughness??1,alpha:m.alphaTest||0,side:m.side,visible:m.visible});
    return m.uuid; };
  let skipped={line:0,sprite:0,other:0};
  S.traverse(o=>{
    if(o.isLine||o.isLineSegments||o.isPoints){skipped.line++;return;} if(o.isSprite){skipped.sprite++;return;} if(!o.isMesh) return; if(!visible(o)) return; if(!o.geometry||!o.geometry.attributes.position){skipped.other++;return;}
    const mlist=Array.isArray(o.material)?o.material:[o.material]; if(mlist.some(m=>m.type==='ShaderMaterial'&&!m.color&&false)) return;
    const rec={geo:geoRec(o.geometry),mats:mlist.map(matRec),tag:tagOf(o),m:Array.from(o.matrixWorld.elements)};
    if(o.isInstancedMesh){ const n=o.count, a=o.instanceMatrix.array, w=o.matrixWorld.elements; const M=new Float32Array(n*12);
      const e=new (o.matrixWorld.constructor)(); const t=new (o.matrixWorld.constructor)();
      for(let i=0;i<n;i++){ t.fromArray(a,i*16); e.multiplyMatrices(o.matrixWorld,t); const q=e.elements; const d=i*12; M[d]=q[0];M[d+1]=q[1];M[d+2]=q[2];M[d+3]=q[4];M[d+4]=q[5];M[d+5]=q[6];M[d+6]=q[8];M[d+7]=q[9];M[d+8]=q[10];M[d+9]=q[12];M[d+10]=q[13];M[d+11]=q[14]; }
      rec.inst=push(M); rec.count=n; if(o.instanceColor){ rec.icol=push(new Float32Array(o.instanceColor.array)); } }
    items.push(rec);
  });
  window.__X={arrays};
  return {meta:{geos:[...geos.values()],mats:[...mats.values()],items,skipped},sizes:arrays.map(a=>a.byteLength),types:arrays.map(a=>a.constructor.name)};
}'''
GET=r'''([i,o,n])=>{ const a=window.__X.arrays[i]; const u=new Uint8Array(a.buffer,a.byteOffset+o,Math.min(n,a.byteLength-o)); let s=''; for(let k=0;k<u.length;k+=32768) s+=String.fromCharCode.apply(null,u.subarray(k,k+32768)); return btoa(s); }'''
async def main():
    t0=time.time()
    async with async_playwright() as p:
        b=await p.chromium.launch(proxy={'server':os.environ.get('HTTPS_PROXY','http://127.0.0.1:39821')},args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl','--js-flags=--max-old-space-size=6000'])
        pg=await (await b.new_context(viewport={'width':320,'height':200})).new_page()
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:200]))
        pg.on('console',lambda m:print('LOG',m.text[:150],flush=True) if m.text.startswith(('blocks','streets','places','circuit')) else None)
        async def h(route):
            r=await route.fetch();t=await r.text()
            assert 'window.__nv = {camera,' in t
            t=t.replace('window.__nv = {camera,',"window.__nvS = scene; window.__nvR = renderer; window.__nvG = () => { const v = {}; try { Object.assign(v, {catMesh, extrasGroup, phaseGroup}); } catch(e){} for (const k of ['BLK','STR','PLC','CIR','trainLayer','pyrGroup','STN']) { try { v[k] = eval(k); } catch(e){} } return v; }; window.__nv = {camera,",1)
            t=t.replace('renderer.shadowMap.enabled = !mobile;','renderer.shadowMap.enabled = false;',1)
            t=t.replace('function loop(now){\n  requestAnimationFrame(loop);','function loop(now){\n  requestAnimationFrame(loop); if(window.__noRender) return;',1)
            t=t.replace('<script type="module">','<script>window.__noRender=true;</script>\n<script type="module">',1)
            await route.fulfill(response=r,body=t)
        await pg.route('**/nevera',h)
        await pg.goto('https://aromahub.studio/nevera',wait_until='domcontentloaded',timeout=90000)
        for i in range(120):
            await asyncio.sleep(3)
            st=await pg.evaluate("()=>{const n=window.__nv||{};const g=window.__nvG?window.__nvG():{};return {blk:!!g.BLK,str:!!g.STR,plc:!!g.PLC,cir:!!g.CIR,tr:!!g.trainLayer,pyr:!!g.pyrGroup,n:window.__nvS?window.__nvS.children.length:0}}")
            if i%5==0: print(i,st,round(time.time()-t0),flush=True)
            if all(st[k] for k in('blk','str','plc','cir','tr','pyr')): break
        await asyncio.sleep(6)
        print('errs',errs[:5],flush=True)
        res=await pg.evaluate(JS)
        print('items',len(res['meta']['items']),'geos',len(res['meta']['geos']),'mats',len(res['meta']['mats']),'skipped',res['meta']['skipped'],'MB',round(sum(res['sizes'])/1e6,1),flush=True)
        json.dump(res,open(OUT+'/meta.json','w'))
        for i,(sz,ty) in enumerate(zip(res['sizes'],res['types'])):
            with open(f'{OUT}/a{i}.bin','wb') as f:
                o=0
                while o<sz:
                    s=await pg.evaluate(GET,[i,o,4_000_000]); d=base64.b64decode(s); f.write(d); o+=len(d)
            if i%400==0: print('arr',i,round(time.time()-t0),flush=True)
        await b.close()
    print('done',round(time.time()-t0),flush=True)
asyncio.run(main())
