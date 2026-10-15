const RMV=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* outline model viewer: draws EGM model edges on a 2D canvas, slow orbit, rises from the ground on appear */
function mvDecode(m){
  if(m._u) return m;
  const b=atob(m.d), u=new Uint16Array(b.length>>1); for(let i=0;i<u.length;i++) u[i]=b.charCodeAt(2*i)|(b.charCodeAt(2*i+1)<<8);
  const kb=atob(m.k), k=new Uint8Array(kb.length); for(let i=0;i<k.length;i++) k[i]=kb.charCodeAt(i);
  // per segment: lowest height (for the rise-in), length, and footprint radius
  const n=u.length/6, lo=new Float32Array(n), gr=new Uint8Array(n), gH=m.box[1]*4095*.012+3;
  const cx=m.box[0]*2047.5, cz=m.box[2]*2047.5; let R=1;
  for(let i=0;i<n;i++){const o=i*6;lo[i]=Math.min(u[o+1],u[o+4]);gr[i]=Math.max(u[o+1],u[o+4])<gH?1:0;for(const j of [0,3]){const dx=u[o+j]-cx,dz=u[o+j+2]-cz;const r=Math.hypot(dx,dz);if(r>R)R=r}}
  return Object.assign(m,{_u:u,_k:k,_lo:lo,_g:gr,_n:n,_cx:cx,_cz:cz,_R:R,_H:m.box[1]*4095});
}
/* cinematic outline viewer: the model is drawn in line by line like a hand-drafted plan (ground plan first, then the
   structure rising floor by floor, a bright pen at each line's growing end), then the camera works through a loop of
   shots: a wide orbit, a slow push-in at a low angle onto the tallest part, a top-down plan view, and back out */
function mvPrep(m){
  if(m._q) return m; const u=m._u,n=m._n,Hm=m._H||1; let x0=1e9,x1=-1e9,best=-1,bh=-1;
  for(let i=0;i<n;i++){const o=i*6;x0=Math.min(x0,u[o],u[o+3]);x1=Math.max(x1,u[o],u[o+3]);const h=Math.max(u[o+1],u[o+4]);if(h>bh){bh=h;best=i}}
  const q=new Float32Array(n), xr=Math.max(1,x1-x0);
  for(let i=0;i<n;i++){const o=i*6, xs=((u[o]+u[o+3])/2-x0)/xr;
    q[i]=m._g[i]?xs*.22:.2+.68*(m._lo[i]/Hm)+xs*.08}
  const o=best*6; m._fx=(u[o]+u[o+3])/2; m._fz=(u[o+2]+u[o+5])/2; m._q=q; return m}
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
function mvCreate(canvas,m,o={}){
  m=mvPrep(mvDecode(m));
  const ctx=canvas.getContext('2d');
  const az0=o.az??0.7, el0=o.el??0.42, z0=o.zoom||1.3, DRAW=RMV?0:(o.draw??4200), T=o.loopT??20;
  const K=[[0,0,el0,1,0],[6,.55,el0,1,0],[10,.95,el0*.62,1.85,1],[14,1.55,1.22,1.08,.35],[18,2.15,el0*.9,1.2,.15],[T,2.6,el0,1,0]];
  const st={t0:performance.now(),raf:0,alive:true,col:o.col||['182,242,220','143,142,247']};
  const cam=t=>{if(RMV) return [az0,el0,z0,0]; const cyc=Math.floor(t/T), tt=t-cyc*T; let j=0; while(j<K.length-2&&tt>K[j+1][0]) j++;
    const A=K[j],B=K[j+1], e=ease(Math.min(1,(tt-A[0])/(B[0]-A[0]))), L=(i)=>A[i]+(B[i]-A[i])*e;
    return [az0+cyc*2.6+L(1), L(2), z0*L(3), L(4)]};
  function frame(now){
    if(!st.alive) return;
    const dpr=Math.min(3,(window.devicePixelRatio||1)*(o.scale?Math.max(1,o.scale()):1)), W=canvas.clientWidth, H=canvas.clientHeight;
    if(!W||!H){st.raf=requestAnimationFrame(frame);return}
    if(canvas.width!==Math.round(W*dpr)||canvas.height!==Math.round(H*dpr)){canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr)}
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    const ms=now-st.t0, t=ms/1000, [az,el,zm,foc]=cam(Math.max(0,t-DRAW/1000*.6)), ca=Math.cos(az), sa=Math.sin(az), ce=Math.cos(el), se=Math.sin(el);
    const R=m._R, Hm=m._H, pb=o.padB||0, HH=H-pb;
    const sc=Math.min(W*.44/R, HH*.62/(R*se*1.1+Hm*ce+1))*zm;
    const D=R*5.5, cy=HH*.5+(Hm*ce*sc)*.42-R*se*sc*.08;
    const ox=m._cx+(m._fx-m._cx)*foc, oz=m._cz+(m._fz-m._cz)*foc;
    const P=(x,y,z)=>{x-=ox;z-=oz;const xr=x*ca-z*sa, zr=x*sa+z*ca;const y2=y*ce-zr*se, z2=y*se+zr*ce;const f=D/Math.max(D*.2,D+z2);return [W/2+xr*f*sc, cy-y2*f*sc, z2]};
    // podium rings
    ctx.lineWidth=1;
    for(const [rr,al] of [[1.12,.5],[1.22,.16]]){ctx.beginPath();for(let i=0;i<=72;i++){const a=i/72*Math.PI*2;const p=P(m._cx+Math.cos(a)*R*rr,0,m._cz+Math.sin(a)*R*rr);i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])}ctx.strokeStyle=`rgba(${st.col[0]},${al})`;ctx.stroke()}
    const f=DRAW?Math.min(1.12,ms/DRAW*1.12):2, WD=.05;
    const u=m._u,k=m._k,q=m._q,g=m._g,n=m._n;
    const B=[[],[],[],[],[],[],[],[],[]], pen=[];
    for(let i=0;i<n;i++){const pr=(f-q[i])/WD; if(pr<=0) continue; const o2=i*6;const a=P(u[o2],u[o2+1],u[o2+2]); let b=P(u[o2+3],u[o2+4],u[o2+5]);
      if(pr<1){b=[a[0]+(b[0]-a[0])*pr,a[1]+(b[1]-a[1])*pr,b[2]];pen.push(a[0],a[1],b[0],b[1])}
      const z=(a[2]+b[2])/2/R; const d=z<-.35?0:(z<.35?1:2); B[(g[i]?2:k[i])*3+d].push(a[0],a[1],b[0],b[1])}
    const AL=[.95,.62,.3];
    for(let kk=0;kk<3;kk++)for(let d=0;d<3;d++){const L=B[kk*3+d];if(!L.length)continue;ctx.beginPath();for(let i=0;i<L.length;i+=4){ctx.moveTo(L[i],L[i+1]);ctx.lineTo(L[i+2],L[i+3])}
      ctx.strokeStyle=`rgba(${st.col[kk===2?0:kk]},${AL[d]*(kk===2?.32:(kk?0.9:1))})`;ctx.lineWidth=d===0?1.1:.8;ctx.stroke()}
    if(pen.length){ctx.save();ctx.shadowColor='rgba(255,255,255,.9)';ctx.shadowBlur=6;ctx.beginPath();for(let i=0;i<pen.length;i+=4){ctx.moveTo(pen[i],pen[i+1]);ctx.lineTo(pen[i+2],pen[i+3])}
      ctx.strokeStyle='rgba(255,255,255,.95)';ctx.lineWidth=1.3;ctx.stroke();ctx.restore()}
    st.raf=requestAnimationFrame(frame);
  }
  st.raf=requestAnimationFrame(frame);
  return {stop(){st.alive=false;cancelAnimationFrame(st.raf)},restart(){st.t0=performance.now()}};
}
/* where each model stands (lon, lat); approximate places are at city level */
const MLOC={5:[31.0156,30.0299],17:[28.95,30.82],18:[31.717,30.019],21:[31.10,30.06],23:[31.3828,30.2013],30:[33.9578,28.5677],40:[31.3405,29.9945],
  55:[31.2995,30.1375],56:[29.82,31.08],58:[31.78,31.4635],59:[29.78,31.10],60:[32.3617,29.6357],62:[32.36,29.63],81:[31.4212,30.1464],85:[31.7166,29.8821],
  88:[31.2235,30.388],90:[31.10,29.07],96:[32.3575,31.2085],98:[32.34,29.64],175:[30.81089,27.55977],176:[30.0,30.45],178:[31.369,22.826],181:[31.47,22.95],
  183:[32.3219,31.011],184:[31.189,27.2065],185:[32.3219,31.011],186:[31.1194,29.9946],359:[31.7068,30.0221]};
function mlocSVG(id,S){const ll=MLOC[id]; if(!ll||typeof d3==='undefined') return '';
  const P=d3.geoMercator().fitExtent([[5,5],[S-5,S-5]],EGY), pa=d3.geoPath(P), [x,y]=P(ll);
  return `<svg class="mlocs" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}"><path d="${pa(EGY)}"/><g class="nile">${GEO.nile.map(n=>`<path d="${pa(n.g)}"/>`).join('')}</g><circle class="pul" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4"/><circle class="dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4"/></svg>`}
/* models load on demand from models/<id>.json */
const MODELS={};
function loadModel(id){if(MODELS[id])return Promise.resolve(MODELS[id]);return fetch(`models/${id}.json`).then(r=>r.json()).then(m=>(MODELS[id]=m))}
