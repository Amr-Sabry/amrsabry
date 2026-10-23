/* isometric layer maps for the method slide (1001)
   Each of the seven layer cards carries a small isometric slab of Egypt with that layer drawn on it
   (zones, lines, upright glyphs standing on the plane), and the title card stacks the seven slabs with their numbers.
   Motion: the slab settles, flat layers settle or draw in, upright glyphs settle one after another (all keyed off .bc.go). */
(function(){
'use strict';
if(typeof CARD==='undefined'||typeof SLIDES==='undefined'||typeof EGY==='undefined'||typeof d3==='undefined') return;

/* ---------- style ---------- */
const css=`
.iso{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:-1}
.iso svg{position:absolute;left:0;top:0;overflow:visible}
.iso .sl{opacity:0;transform:translateY(3.5%);transform-box:fill-box;transition:opacity .7s var(--settle),transform .95s var(--settle);transition-delay:var(--t,0ms)}
.iso .dr{stroke-dasharray:1 1;stroke-dashoffset:1;transition:stroke-dashoffset 1.15s var(--ease);transition-delay:var(--t,0ms)}
.iso .gl{opacity:0;transform:translateY(3.5%) scale(.94);transform-box:fill-box;transform-origin:50% 100%;transition:opacity .55s var(--settle),transform .8s var(--settle);transition-delay:var(--t,0ms)}
.bc.go .iso .sl,.bc.go .iso .gl{opacity:1;transform:none}
.bc.go .iso .dr{stroke-dashoffset:0}
.isostk{position:relative;flex:1 1 0!important;min-height:0;margin:10px 0 14px}
.isostk .iso{z-index:0}
.isostk svg{width:100%;height:100%}
.isostk text{font-family:var(--f-display)}
@media (max-width:1px){.iso .sl,.iso .dr,.iso .gl{transition:none!important}}
`;
const st=document.createElement('style');st.id='isoCss';st.textContent=css;document.head.appendChild(st);

/* ---------- the isometric plane ---------- */
const D2R=Math.PI/180;
const MERC=d3.geoMercator().fitSize([1000,1000],EGY);
const rings=g=>{if(!g)return [];if(g.type==='Feature')return rings(g.geometry);
  if(g.type==='Polygon')return g.coordinates.map(c=>({c,z:1}));
  if(g.type==='MultiPolygon')return g.coordinates.flatMap(p=>p.map(c=>({c,z:1})));
  if(g.type==='LineString')return [{c:g.coordinates}];
  if(g.type==='MultiLineString')return g.coordinates.map(c=>({c}));
  return []};
const EGY_OUT={type:'MultiPolygon',coordinates:EGY.geometry.coordinates.map(p=>[p[0]])};/* outer rings only: the source has two sliver holes near 22N */
const EGY_PTS=rings(EGY_OUT).flatMap(r=>r.c).map(p=>MERC(p));
/* fit Egypt's top face into box [x0,y0,x1,y1]: mercator, rotated by rot degrees and squashed vertically by k */
function plane(box,o={}){
  const a=(o.rot??42)*D2R, k=o.k??.56, c=Math.cos(a), s=Math.sin(a);
  const T=([x,y])=>[x*c-y*s,(x*s+y*c)*k];
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  EGY_PTS.forEach(p=>{const q=T(p);if(q[0]<x0)x0=q[0];if(q[0]>x1)x1=q[0];if(q[1]<y0)y0=q[1];if(q[1]>y1)y1=q[1]});
  const [bx0,by0,bx1,by1]=box, sc=Math.min((bx1-bx0)/(x1-x0),(by1-by0)/(y1-y0));
  const ox=(o.ax??.5)*((bx1-bx0)-(x1-x0)*sc)+bx0-x0*sc, oy=(o.ay??.5)*((by1-by0)-(y1-y0)*sc)+by0-y0*sc;
  const P=ll=>{const q=T(MERC(ll));return [ox+q[0]*sc,oy+q[1]*sc]};
  /* screen direction of one unit east (u) and one unit south (v) on the plane, for footprints that sit square on the map */
  return {P,Q:m=>{const q=T(m);return [ox+q[0]*sc,oy+q[1]*sc]},u:[c,s*k],v:[-s,c*k],k,sc,box:[ox+x0*sc,oy+y0*sc,ox+x1*sc,oy+y1*sc]};
}
const f1=n=>Math.round(n*10)/10;
/* geometry -> path data on the plane, dropping points closer than tol px */
function pd(g,P,tol=.6){
  return rings(g).map(r=>{const out=[];let lx=1e9,ly=1e9;
    r.c.forEach((p,i)=>{const q=P(p);if(i===0||i===r.c.length-1||Math.hypot(q[0]-lx,q[1]-ly)>=tol){out.push(q);lx=q[0];ly=q[1]}});
    if(out.length<2) return '';
    return 'M'+out.map(q=>f1(q[0])+','+f1(q[1])).join('L')+(r.z?'Z':'')}).join('');
}
const curve=d3.line().curve(d3.curveCatmullRom.alpha(.5));
const lpd=(pts,P)=>curve(pts.map(P)).replace(/(\d+\.\d)\d+/g,'$1');
/* a point on the plane at (east, south, up) px from p */
const at=(pl,p,x,y,z=0)=>[p[0]+x*pl.u[0]+y*pl.v[0],p[1]+x*pl.u[1]+y*pl.v[1]-z];
const poly=(pts,fill,stroke,sw)=>`<path d="M${pts.map(q=>f1(q[0])+','+f1(q[1])).join('L')}Z" fill="${fill}"${stroke?` stroke="${stroke}" stroke-width="${sw||.6}" stroke-linejoin="round"`:''}/>`;

/* pick well-spread places: keep a place only if it stands at least min px from every one kept (and from 'taken') */
let KO=[];/* keep-out rects (number, icon, title) of the card being drawn */
function spread(list,P,min,max,taken=[],ext=[6,22]){const out=[];
  for(const n of list){const q=P(n.p);
    if(KO.some(r=>q[0]+ext[0]>r[0]&&q[0]-ext[0]<r[2]&&q[1]+3>r[1]&&q[1]-ext[1]<r[3])) continue;
    if(taken.every(o=>Math.hypot(o.q[0]-q[0],o.q[1]-q[1])>=(o.r||min))&&out.every(o=>Math.hypot(o.q[0]-q[0],o.q[1]-q[1])>=min)){out.push({n,q});if(out.length>=max)break}}
  return out}
const byT=(...ts)=>NODES.filter(n=>ts.includes(n.t)).sort((a,b)=>(b.hub?1:0)-(a.hub?1:0));
const first=(list,re)=>[...list.filter(n=>re.test(n.n)),...list.filter(n=>!re.test(n.n))];

/* ---------- colours ---------- */
const TH={
  dark:{t0:'rgba(169,168,255,.24)',t1:'rgba(123,122,244,.07)',edge:'rgba(169,168,255,.66)',side:'#1d1c44',sideE:'rgba(123,122,244,.55)',nile:'#a9a8ff',lake:'rgba(169,168,255,.38)',
    sh:'rgba(0,0,0,.5)',ink:'#0c0c13',grid:'rgba(169,168,255,.13)',m:'#b6f2dc',w:'#eceefa',v:'#a9a8ff',vd:'#7b7af4'},
  vio:{t0:'rgba(255,255,255,.34)',t1:'rgba(255,255,255,.12)',edge:'rgba(255,255,255,.9)',side:'#4847bd',sideE:'rgba(255,255,255,.55)',nile:'#ffffff',lake:'rgba(255,255,255,.45)',
    sh:'rgba(26,25,110,.42)',ink:'#2c2b8c',grid:'rgba(255,255,255,.16)',m:'#b6f2dc',w:'#ffffff',v:'#2c2b8c',vd:'#2c2b8c'},
  grad:{t0:'rgba(255,255,255,.42)',t1:'rgba(255,255,255,.14)',edge:'#2c2b8c',side:'rgba(44,43,140,.5)',sideE:'#2c2b8c',nile:'rgba(44,43,140,.55)',lake:'rgba(44,43,140,.25)',
    sh:'rgba(26,25,110,.3)',ink:'#0d0d14',grid:'rgba(44,43,140,.14)',m:'#b6f2dc',w:'#ffffff',v:'#2c2b8c',vd:'#2c2b8c'}
};
TH.dark2=TH.dark;TH.mint=TH.grad;
let UID=0;

/* the slab: a stack of offset copies for its thickness, then the top face with the Nile and the lakes */
function slab(pl,th,depth,o={}){
  const id='isoE'+(++UID), g='isoG'+UID, d=pd(EGY_OUT,pl.P,.55), b=pl.box;
  let s=`<defs><path id="${id}" d="${d}"/><linearGradient id="${g}" gradientUnits="userSpaceOnUse" x1="${f1(b[0])}" y1="${f1(b[1])}" x2="${f1(b[2])}" y2="${f1(b[3])}"><stop offset="0" stop-color="${o.t0||th.t0}"/><stop offset="1" stop-color="${o.t1||th.t1}"/></linearGradient>`;
  /* a glass slab shows only its rim below the top face */
  if(o.glass) s+=`<mask id="${id}m" maskUnits="userSpaceOnUse" x="-100" y="-100" width="2000" height="3000"><rect x="-100" y="-100" width="2000" height="3000" fill="#fff"/><use href="#${id}" fill="#000"/></mask>`;
  if(o.grid!==0) s+=`<clipPath id="${id}c"><use href="#${id}"/></clipPath>`;
  s+='</defs>';
  let sd='';for(let y=depth;y>.01;y-=1) sd+=`<use href="#${id}" y="${f1(y)}" fill="${o.side||th.side}" stroke="${y===depth?(o.sideE||th.sideE):(o.side||th.side)}" stroke-width="${y===depth?.7:.9}"/>`;
  s+=o.glass?`<g mask="url(#${id}m)">${sd}</g>`:sd;
  s+=`<use href="#${id}" fill="${o.top||`url(#${g})`}" stroke="${o.edge||th.edge}" stroke-width="${o.ew||.85}" stroke-linejoin="round"/>`;
  /* a faint graticule on the top face makes the plane read as a plane */
  if(o.grid!==0){let gp='';for(let x=26;x<=36;x+=2){const a=pl.P([x,21.5]),c=pl.P([x,32]);gp+=`M${f1(a[0])},${f1(a[1])}L${f1(c[0])},${f1(c[1])}`}
    for(let y=22;y<=32;y+=2){const a=pl.P([24.5,y]),c=pl.P([37.5,y]);gp+=`M${f1(a[0])},${f1(a[1])}L${f1(c[0])},${f1(c[1])}`}
    s+=`<path d="${gp}" clip-path="url(#${id}c)" fill="none" stroke="${o.grid||th.grid}" stroke-width=".6"/>`}
  if(o.base!==0){
    s+=GEO.lakes.filter(l=>/Nasser|Bitter/.test(l.n)).map(l=>`<path d="${pd(l.g,pl.P,.6)}" fill="${o.lake||th.lake}"/>`).join('');
    s+=`<path d="${GEO.nile.map(n=>pd(n.g,pl.P,.6)).join('')}" fill="none" stroke="${o.nile||th.nile}" stroke-width="${o.nw||1.05}" stroke-linejoin="round" stroke-linecap="round" opacity="${o.no??.9}"/>`;
  }
  return s;
}

/* ---------- upright glyphs (base point q, size unit g) ---------- */
const shadow=(pl,q,r,th)=>`<ellipse cx="${f1(q[0])}" cy="${f1(q[1])}" rx="${f1(r)}" ry="${f1(r*pl.k*.9)}" fill="${th.sh}"/>`;
/* a transmission pylon: tapered lattice legs, two cross arms of different widths with hanging insulators, a pointed top */
function pylon(pl,q,g,th,col){
  const [x,y]=q, h=21*g, w=4.4*g, top=y-h, nk=y-h*.8, nkw=.95*g;
  const lx=t=>x-w+(w-nkw)*t, rx=t=>x+w-(w-nkw)*t; /* leg x at fraction t of the way up to the neck */
  const yl=t=>y-h*.8*t;
  let p=`M${f1(lx(0))},${f1(y)}L${f1(lx(1))},${f1(nk)}L${f1(x)},${f1(top)}L${f1(rx(1))},${f1(nk)}L${f1(rx(0))},${f1(y)}`;
  /* lattice */
  const zz=[0,.28,.52,.74,1];let L='';for(let i=0;i<zz.length-1;i++){const a=zz[i],b=zz[i+1];L+=`M${f1(i%2?rx(a):lx(a))},${f1(yl(a))}L${f1(i%2?lx(b):rx(b))},${f1(yl(b))}`}
  const a1=y-h*.6, a2=y-h*.82, A1=5.6*g, A2=3.8*g, ins=1.9*g;
  const arms=`M${f1(x-A1)},${f1(a1)}L${f1(x+A1)},${f1(a1)}M${f1(x-A2)},${f1(a2)}L${f1(x+A2)},${f1(a2)}`;
  const insl=`M${f1(x-A1)},${f1(a1)}l0,${f1(ins)}M${f1(x+A1)},${f1(a1)}l0,${f1(ins)}M${f1(x-A2)},${f1(a2)}l0,${f1(ins)}M${f1(x+A2)},${f1(a2)}l0,${f1(ins)}`;
  return shadow(pl,q,4.6*g,th)+`<path d="${p}${L}" fill="none" stroke="${col}" stroke-width="${f1(.95*g)}" stroke-linejoin="round" stroke-linecap="round"/><path d="${arms}" fill="none" stroke="${col}" stroke-width="${f1(1.25*g)}" stroke-linecap="round"/><path d="${insl}" fill="none" stroke="${col}" stroke-width="${f1(.9*g)}" stroke-linecap="round" opacity=".85"/>`;
}
/* wire anchor points of a pylon (lower arm tips, then upper arm tips) */
const pyTips=(q,g)=>{const h=21*g;return [[q[0]-5.6*g,q[1]-h*.6+1.9*g],[q[0]+5.6*g,q[1]-h*.6+1.9*g],[q[0]-3.8*g,q[1]-h*.82+1.9*g],[q[0]+3.8*g,q[1]-h*.82+1.9*g]]};
/* a cylinder (water tank, silo) */
function cyl(pl,q,r,h,body,top,stroke,dome){
  const [x,y]=q, ry=r*pl.k*.95;
  let s=`<path d="M${f1(x-r)},${f1(y-h)}L${f1(x-r)},${f1(y)}A${f1(r)},${f1(ry)} 0 0 0 ${f1(x+r)},${f1(y)}L${f1(x+r)},${f1(y-h)}Z" fill="${body}"${stroke?` stroke="${stroke}" stroke-width=".55"`:''}/>`;
  s+=dome?`<path d="M${f1(x-r)},${f1(y-h)}A${f1(r)},${f1(ry)} 0 0 0 ${f1(x+r)},${f1(y-h)}Q${f1(x)},${f1(y-h-r*1.15)} ${f1(x-r)},${f1(y-h)}Z" fill="${top}"${stroke?` stroke="${stroke}" stroke-width=".55"`:''}/>`
    :`<ellipse cx="${f1(x)}" cy="${f1(y-h)}" rx="${f1(r)}" ry="${f1(ry)}" fill="${top}"${stroke?` stroke="${stroke}" stroke-width=".55"`:''}/>`;
  return s;
}
/* an isometric box with its footprint square on the map: a (east) x b (south) px, h px tall, centred on q; faces [top,leftish,rightish] */
function box(pl,q,a,b,h,F,stroke){
  const c=[[-a/2,-b/2],[a/2,-b/2],[a/2,b/2],[-a/2,b/2]].map(([x,y])=>at(pl,q,x,y));
  const cx=c.reduce((s,p)=>s+p[0],0)/4, cy=c.reduce((s,p)=>s+p[1],0)/4;
  let s='';
  for(let i=0;i<4;i++){const A=c[i],B=c[(i+1)%4], dx=B[0]-A[0], dy=B[1]-A[1];let nx=dy,ny=-dx;
    if(nx*((A[0]+B[0])/2-cx)+ny*((A[1]+B[1])/2-cy)<0){nx=-nx;ny=-ny}
    if(ny>0) s+=poly([A,B,[B[0],B[1]-h],[A[0],A[1]-h]],nx<0?F[1]:F[2],stroke)}
  s+=poly(c.map(p=>[p[0],p[1]-h]),F[0],stroke);
  return s;
}
/* a factory: walls, a sawtooth roof whose glazed faces look toward the viewer, and a chimney */
function factory(pl,q,g,F,glz,stroke){
  const a=13*g, b=7.5*g, h=4.2*g, t=3.4*g, n=3;
  let s=cyl(pl,at(pl,q,-a*.32,-b*.55),1.05*g,h+t+5*g,F[1],F[0],stroke);
  const cc=[[-a/2,-b/2],[a/2,-b/2],[a/2,b/2],[-a/2,b/2]].map(([x,y])=>at(pl,q,x,y));
  s+=poly([cc[3],cc[2],[cc[2][0],cc[2][1]-h],[cc[3][0],cc[3][1]-h]],F[1],stroke);/* south wall */
  s+=poly([cc[1],cc[2],[cc[2][0],cc[2][1]-h],[cc[1][0],cc[1][1]-h]],F[2],stroke);/* east wall */
  for(let i=0;i<n;i++){const s0=-a/2+a*i/n, s1=-a/2+a*(i+1)/n;
    const P0n=at(pl,q,s0,-b/2,h),P1n=at(pl,q,s1,-b/2,h+t),P0s=at(pl,q,s0,b/2,h),P1s=at(pl,q,s1,b/2,h+t),B1n=at(pl,q,s1,-b/2,h),B1s=at(pl,q,s1,b/2,h);
    s+=poly([P0n,P1n,P1s,P0s],F[0],stroke);           /* the slope */
    s+=poly([P1n,B1n,B1s,P1s],glz,stroke);             /* the glazed upright face */
    s+=poly([P0s,P1s,B1s],F[1],stroke)}                /* the gable end */
  return s;
}
/* a house with a pitched roof (ridge running east-west) */
function house(pl,q,g,wall,wall2,roof,stroke){
  const a=6.4*g,b=5*g,h=3.6*g,r=3*g;
  let s=box(pl,q,a,b,h,[wall,wall,wall2],stroke);
  const R0=at(pl,q,-a/2,0,h+r),R1=at(pl,q,a/2,0,h+r);
  s+=poly([at(pl,q,-a/2,-b/2,h),at(pl,q,a/2,-b/2,h),R1,R0],roof,stroke);
  s+=poly([at(pl,q,a/2,-b/2,h),R1,at(pl,q,a/2,b/2,h)],wall2,stroke);
  s+=poly([R0,R1,at(pl,q,a/2,b/2,h),at(pl,q,-a/2,b/2,h)],roof,stroke);
  return s;
}
/* a person: round head over rounded shoulders */
function person(q,g,fill,stroke){const [x,y]=q, w=2.5*g, hb=5.2*g, hr=1.75*g;
  return `<path d="M${f1(x-w)},${f1(y)}L${f1(x-w)},${f1(y-hb*.5)}Q${f1(x-w)},${f1(y-hb)} ${f1(x)},${f1(y-hb)}Q${f1(x+w)},${f1(y-hb)} ${f1(x+w)},${f1(y-hb*.5)}L${f1(x+w)},${f1(y)}Z" fill="${fill}" stroke="${stroke}" stroke-width=".6"/><circle cx="${f1(x)}" cy="${f1(y-hb-hr-.6*g)}" r="${f1(hr)}" fill="${fill}" stroke="${stroke}" stroke-width=".6"/>`}
/* a slim tower or pin of height h with a head */
function pin(q,g,h,col,head,ink){const [x,y]=q;
  return `<path d="M${f1(x)},${f1(y)}L${f1(x)},${f1(y-h)}" stroke="${col}" stroke-width="${f1(1.2*g)}" stroke-linecap="round"/>`+(head==='ring'
    ?`<circle cx="${f1(x)}" cy="${f1(y-h-1.9*g)}" r="${f1(2.1*g)}" fill="${ink}" stroke="${col}" stroke-width="${f1(1.1*g)}"/>`
    :`<circle cx="${f1(x)}" cy="${f1(y-h-1.6*g)}" r="${f1(1.9*g)}" fill="${col}"/>`)}
/* a university: slim tower capped with a flat square board (a mortarboard seen on the plane) */
function tower(pl,q,g,h,col,cap,stroke){
  let s=box(pl,q,2.6*g,2.6*g,h,[col,col,cap],stroke);
  const t=[q[0],q[1]-h-.6*g], m=6*g;
  s+=poly([at(pl,t,-m/2,-m/2),at(pl,t,m/2,-m/2),at(pl,t,m/2,m/2),at(pl,t,-m/2,m/2)],cap,stroke,.7);
  return s;
}
/* flat markers on the plane */
const flatSq=(pl,q,m,fill,stroke)=>poly([at(pl,q,-m/2,-m/2),at(pl,q,m/2,-m/2),at(pl,q,m/2,m/2),at(pl,q,-m/2,m/2)],fill,stroke,.8);
const flatRing=(pl,q,r,stroke,fill)=>`<ellipse cx="${f1(q[0])}" cy="${f1(q[1])}" rx="${f1(r)}" ry="${f1(r*pl.k)}" fill="${fill||'none'}" stroke="${stroke}" stroke-width="1.1"/>`;

/* wrap pieces with their reveal: settle (sl), draw (dr) or upright glyph (gl); glyphs go back to front */
const gsl=(t,inner)=>`<g class="sl" style="--t:${t}ms">${inner}</g>`;
const gdr=(t,d,stroke,w,extra='')=>`<path class="dr" pathLength="1" style="--t:${t}ms" d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linejoin="round" ${extra}/>`;
function glyphs(list,t0,step){
  return list.sort((a,b)=>a.y-b.y).map((o,i)=>`<g class="gl" style="--t:${Math.round(t0+i*step)}ms">${o.s}</g>`).join('');
}
/* minimum spanning tree over the picked pylons, for the wires */
function mst(pts){const n=pts.length, inT=[0], E=[];if(n<2)return E;
  while(inT.length<n){let best=null;
    inT.forEach(i=>pts.forEach((p,j)=>{if(inT.includes(j))return;const d=Math.hypot(p[0]-pts[i][0],p[1]-pts[i][1]);if(!best||d<best.d)best={i,j,d}}));
    inT.push(best.j);E.push(best)}
  return E}

/* ---------- one card's map: layer L (1..7) ---------- */
function layerSVG(L,bg,W,H,ko,o={}){
  KO=ko||[];
  const th=TH[bg]||TH.dark;
  const pl=plane(o.box||[0,H*.05,W*.7,H*.79],{rot:o.rot??45,k:o.k??.577,ax:o.ax??0,ay:o.ay??.5});
  const g=Math.max(.72,Math.min(1.25,(pl.box[2]-pl.box[0])/240)), G=g*1.32;  /* G: size of the upright glyphs */
  const depth=Math.max(4,Math.round(5*g));
  const P=pl.P, ink='rgba(12,12,19,.38)';
  let base=slab(pl,th,depth), flat='', lines='', gl=[];
  const T0=120;
  if(L===1){
    const v=ZONES.find(z=>z.t==='valley');
    flat+=gsl(T0+180,`<path d="${pd(v.g,P,.5)}" fill="#5352c4" stroke="#7b7af4" stroke-width=".7" stroke-linejoin="round"/>`);
    /* growth zones rise from the plane one after another, each as a thin raised plate */
    const zs=ZONES.filter(z=>z.t==='grow').map(z=>({z,c:P(d3.geoCentroid(z.g))})).sort((a,b)=>a.c[1]-b.c[1]);
    const vm='isoV'+(++UID), vd=pd(v.g,P,.5);
    flat+=`<defs><mask id="${vm}" maskUnits="userSpaceOnUse" x="-50" y="-50" width="${f1(W+100)}" height="${f1(H+100)}"><rect x="-50" y="-50" width="${f1(W+100)}" height="${f1(H+100)}" fill="#fff"/><path d="${vd}" fill="#000" stroke="#000" stroke-width="1.2"/></mask></defs>`;
    zs.forEach((o,i)=>{const d=pd(o.z.g,P,.5), r=2.4*g;
      flat+=`<g mask="url(#${vm})">`+gsl(T0+420+i*95,`<path d="${d}" fill="rgba(182,242,220,.2)" stroke="rgba(182,242,220,.3)" stroke-width=".6"/><path d="${d}" transform="translate(0,${-f1(r)})" fill="rgba(182,242,220,.42)" stroke="#b6f2dc" stroke-width=".9" stroke-linejoin="round"/>`)+'</g>'});
    /* a flag planted on each new region */
    const fl=spread(zs.map(o=>({p:d3.geoCentroid(o.z.g)})),P,24,7,[],[6*G,14*G]);
    fl.forEach(o=>{const q=[o.q[0],o.q[1]-2.4*g];gl.push({y:q[1],s:shadow(pl,q,2.8*G,th)+`<path d="M${f1(q[0])},${f1(q[1])}L${f1(q[0])},${f1(q[1]-11*G)}" stroke="${th.w}" stroke-width="${f1(1.05*G)}" stroke-linecap="round"/><path d="M${f1(q[0])},${f1(q[1]-11*G)}l${f1(5.6*G)},${f1(1.9*G)}l${f1(-5.6*G)},${f1(1.9*G)}Z" fill="${th.m}"/>`})});
  }
  if(L===2){
    const order={road:0,canal:1,lrt:2,mono:2,hsr:3};
    const ls=LINES.filter(l=>l.L===2).sort((a,b)=>order[a.t]-order[b.t]);
    const sty={road:[th.w,1,.75],canal:[th.v,1.9,1],lrt:[th.v,1.5,1],mono:[th.v,1.5,1],hsr:[th.m,2.3,1]};
    ls.forEach((l,i)=>{const [c,w,o]=sty[l.t];lines+=gdr(T0+300+i*55,lpd(l.pts,P),c,f1(w*Math.max(.9,g)),`opacity="${o}" stroke-linecap="round"`)});
    const ports=spread(first(byT('port'),/السخنة|شرق بورسعيد|الإسكندرية|دمياط|سفاجا|العريش/),P,18,7,[],[5*G,4*G]), air=spread(byT('airport'),P,18,6,ports,[5*G,4*G]);
    ports.forEach(o=>gl.push({y:o.q[1],s:flatSq(pl,o.q,6.4*G,th.m,th.ink)}));
    air.forEach(o=>gl.push({y:o.q[1],s:flatRing(pl,o.q,3.4*G,th.w,'rgba(12,12,19,.6)')}));
  }
  if(L===3){
    const pw=spread(first(byT('power'),/الضبعة|بنبان|سيمنز|رياح جبل الزيت|غرب أسيوط/),P,30,7,[],[6*G,22*G]);
    const tips=pw.map(o=>pyTips(o.q,G));
    mst(pw.map(o=>o.q)).forEach((e,k)=>{const A=pw[e.i].q,B=pw[e.j].q, l=A[0]<B[0];
      [[0,1],[2,3]].forEach(([li,ri],w)=>{const a=tips[e.i][l?ri:li], b=tips[e.j][l?li:ri], sag=Math.min(10,e.d*.1);
        lines+=gdr(T0+1000+k*80+w*40,`M${f1(a[0])},${f1(a[1])}Q${f1((a[0]+b[0])/2)},${f1((a[1]+b[1])/2+sag)} ${f1(b[0])},${f1(b[1])}`,th.w,.75,`opacity="${w?.42:.6}"`)})});
    pw.forEach(o=>gl.push({y:o.q[1],s:pylon(pl,o.q,G,th,th.m)}));
    const tk=spread(first(byT('desal','water'),/العلمين|الجلالة|شرم|الغردقة|بورسعيد/),P,22,5,pw,[4*G,9*G]);
    tk.forEach(o=>gl.push({y:o.q[1],s:shadow(pl,o.q,4.4*G,th)+cyl(pl,o.q,3.3*G,6.4*G,th.vd,th.v,th.ink)}));
  }
  if(L===4){
    const old=spread(byT('cityold'),P,9,14,[],[2,2]);
    old.forEach(o=>gl.push({y:o.q[1]-80,s:flatSq(pl,o.q,3.6*G,'rgba(169,168,255,.6)')}));
    const cs=spread(first(byT('city'),/العاصمة الإدارية|العلمين|المنصورة|الجلالة|توشكى|الأقصر|الإسماعيلية/),P,25,8,[],[9*G,16*G]);
    const F=['#e9fff7','#b6f2dc','#6fb9a3'];
    cs.forEach((o,i)=>{const q=o.q, hs=[[0,0,13],[-4.4,3.6,7.5],[4.6,-2.8,9.5],[3.8,4.4,5]].map(([x,y,h])=>({p:at(pl,q,x*G,y*G),h:h*G*(i%3?0.85:1)}));
      let s=shadow(pl,q,7.8*G,th);hs.sort((a,b)=>a.p[1]-b.p[1]).forEach(b=>s+=box(pl,b.p,3.8*G,3.8*G,b.h,F,ink));
      gl.push({y:q[1],s})});
  }
  if(L===5){
    const uni=spread(first(byT('uni'),/الجلالة|العلمين|المنصورة|الملك سلمان|أسوان|أسيوط/),P,21,6,[],[4*G,20*G]);
    const hosp=spread(byT('hosp'),P,21,3,uni,[4*G,16*G]), sch=spread(byT('school'),P,19,4,uni.concat(hosp),[4*G,12*G]);
    uni.forEach((o,i)=>gl.push({y:o.q[1],s:shadow(pl,o.q,3.8*G,th)+tower(pl,o.q,G,(12+(i%3)*3)*G,th.m,'#6fb9a3',ink)}));
    hosp.forEach(o=>gl.push({y:o.q[1],s:shadow(pl,o.q,3*G,th)+pin(o.q,G,10*G,th.w,'ring',th.ink)}));
    sch.forEach(o=>gl.push({y:o.q[1],s:shadow(pl,o.q,2.8*G,th)+pin(o.q,G,6.5*G,th.v,'dot',th.ink)}));
  }
  if(L===6){
    ZONES.filter(z=>z.t==='agri').forEach((z,i)=>flat+=gsl(T0+260+i*90,`<path d="${pd(z.g,P,.5)}" fill="rgba(140,226,170,.42)" stroke="#9fe8bf" stroke-width=".8" stroke-linejoin="round"/>`));
    const ind=spread(first(byT('ind'),/السخنة|شرق بورسعيد|السادات|الروبيكي|قفط|المطاهرة/),P,28,5,[],[10*G,16*G]);
    ind.forEach(o=>gl.push({y:o.q[1],s:shadow(pl,o.q,8.5*G,th)+factory(pl,o.q,G,['#c9c8ff','#a9a8ff','#6a69d8'],th.m,ink)}));
    const silo=spread(byT('silo'),P,22,4,ind,[5*G,13*G]);
    silo.forEach(o=>gl.push({y:o.q[1],s:shadow(pl,o.q,3.8*G,th)+cyl(pl,at(pl,o.q,-1.7*G,0),2*G,8*G,'#dfe1f2','#ffffff',ink,1)+cyl(pl,at(pl,o.q,1.9*G,.6*G),2*G,6.4*G,'#dfe1f2','#ffffff',ink,1)}));
  }
  if(L===7){
    /* the whole country lit softly, with homes on the new cities and people across the inhabited valley */
    const gid='isoL'+(++UID), c0=P([31.3,29.6]);
    flat+=gsl(T0+200,`<defs><radialGradient id="${gid}" gradientUnits="userSpaceOnUse" cx="${f1(c0[0])}" cy="${f1(c0[1])}" r="${f1((pl.box[2]-pl.box[0])*.6)}" gradientTransform="translate(${f1(c0[0])},${f1(c0[1])}) scale(1,${pl.k}) translate(${f1(-c0[0])},${f1(-c0[1])})"><stop offset="0" stop-color="#ffffff" stop-opacity=".6"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs><path d="${pd(EGY_OUT,P,.55)}" fill="url(#${gid})"/><path d="${pd(ZONES.find(z=>z.t==='valley').g,P,.5)}" fill="rgba(255,255,255,.3)"/>`);
    const homes=spread(first(byT('city'),/العاصمة الإدارية|العلمين|المنصورة|الجلالة|توشكى|الأقصر|رفح/),P,22,7,[],[7*G,12*G]);
    const ppl=spread(first(NODES.filter(n=>n.t==='cityold'||n.t==='nileaxis'),/أسوان|الأقصر|أسيوط|المنيا|سوهاج|قنا|بني سويف|طنطا|الزقازيق|الإسكندرية/),P,15,8,homes.map(h=>({q:h.q,r:11})),[6*G,11*G]);
    homes.forEach(o=>gl.push({y:o.q[1],s:shadow(pl,o.q,5.2*G,th)+house(pl,o.q,G,'#ffffff','#d6d6ff','#2c2b8c','rgba(44,43,140,.55)')}));
    /* people in twos (a family) across the valley */
    ppl.forEach((o,i)=>{const q2=at(pl,o.q,3.4*G,2.2*G);gl.push({y:o.q[1],s:shadow(pl,o.q,3.2*G,th)+shadow(pl,q2,2.6*G,th)+person(o.q,G,i%2?'#b6f2dc':'#ffffff','#2c2b8c')+person(q2,G*.78,i%2?'#ffffff':'#b6f2dc','#2c2b8c')})});
  }
  return `<svg width="${f1(W)}" height="${f1(H)}" viewBox="0 0 ${f1(W)} ${f1(H)}">${gsl(0,base)}${flat}${lines}${glyphs(gl,T0+(L===3?650:520),L===4?80:70)}</svg>`;
}

/* ---------- the title card: seven slabs stacked with even spacing, numbered ---------- */
function stackSVG(W,H){
  const th=TH.grad, LW=92, SW=Math.min(W-LW-16,196), k=.577, rot=45;
  const pl0=plane([0,0,SW,2000],{rot,k,ay:0}), sh=pl0.box[3]-pl0.box[1], depth=4;
  const top=8, gap=(H-top-sh-depth-4)/6;
  const pl=plane([0,top,SW,top+sh],{rot,k,ay:0});
  const east=EGY_PTS.reduce((m,p)=>{const q=pl.Q(p);return q[0]>m[0]?q:m},[-1e9,0]);
  const hub=pl.P([31.75,30.02]);
  let s='';
  for(let i=0;i<7;i++){
    const L=i+1, dy=(6-i)*gap, cur=L===7, t=i*130;
    const o=cur?{top:'#b6f2dc',edge:'#0d0d14',side:'#2c2b8c',sideE:'#0d0d14',nile:'rgba(13,13,20,.55)',lake:'rgba(13,13,20,.25)',ew:1,grid:'rgba(13,13,20,.1)'}:{glass:1};
    /* the thread that ties the layers: from this slab's hub up to the next one, drawn before the next slab so that slab sits over it */
    s+=`<g transform="translate(0,${f1(dy)})">${gsl(t,slab(pl,th,depth,o)+`<circle cx="${f1(hub[0])}" cy="${f1(hub[1])}" r="2.6" fill="${cur?'#0d0d14':'#2c2b8c'}"/>`)}</g>`;
    if(i<6) s+=gdr(1050+i*110,`M${f1(hub[0])},${f1(hub[1]+dy)}L${f1(hub[0])},${f1(hub[1]+dy-gap)}`,'#2c2b8c',1.3,'stroke-linecap="butt"');
    /* number and name beside the slab, with a leader from its eastern tip */
    const ly=east[1]+dy, nx=W, lx0=east[0]+5, lx1=W-36;
    s+=`<g class="gl" style="--t:${t+260}ms"><path d="M${f1(lx0)},${f1(ly)}L${f1(lx1)},${f1(ly)}" stroke="#2c2b8c" stroke-width=".9" opacity=".55"/><circle cx="${f1(lx0)}" cy="${f1(ly)}" r="1.8" fill="#2c2b8c"/>`+
      (cur?`<rect x="${f1(W-33)}" y="${f1(ly-14)}" width="33" height="26" rx="13" fill="#0d0d14"/>`:'')+
      `<text x="${f1(cur?W-16.5:nx)}" y="${f1(ly+7.5)}" text-anchor="${cur?'middle':'end'}" font-size="21" font-weight="700" fill="${cur?'#b6f2dc':'#0d0d14'}" style="font-variant-numeric:tabular-nums;letter-spacing:-.02em">${String(L).padStart(2,'0')}</text>`+
      `<text x="${f1(nx)}" y="${f1(ly+29)}" text-anchor="end" font-size="13.5" font-weight="500" fill="#0d0d14" opacity=".78">${LYR[i].s}</text></g>`;
  }
  return `<svg viewBox="0 0 ${f1(W)} ${f1(H)}" preserveAspectRatio="xMaxYMid meet" style="direction:ltr">${s}</svg>`;
}

/* ---------- card types ---------- */
CARD.isoaxis=function(c,r){
  const W=r.w-52, H=r.h-48, big=r.h>300, nf=big?92:64, tf=big?30:24, sf=big?18:16, len=t=>String(t||'').replace(/<[^>]+>/g,'').length;
  const ko=[[W-String(c.n).length*nf*.62-8,0,W,nf*.95],[0,0,big?52:42,big?52:42],[W-len(c.t)*tf*.5-12,H-sf*1.5-10-tf*1.25-4,W,H],[W-len(c.s)*sf*.48-12,H-sf*1.5-4,W,H]];
  return `<div class="iso" aria-hidden="true">${layerSVG(c.L||+c.n,c.bg,W,H,ko,c.iso||{})}</div>`+CARD.axis(c,r);
};
CARD.isotitle=function(c,r){
  const W=r.w-52, H=Math.max(160,Math.round(r.h-48-(c.fs||54)*1.12*2-(c.ss||22)*1.45*2-10-22-24));
  const html=CARD.title(c,r), stk=`<div class="isostk" aria-hidden="true"><div class="iso">${stackSVG(W,H)}</div></div>`;
  return html.replace('<div class="ttl1',stk+'<div class="ttl1');
};

/* ---------- put them on the method slide ---------- */
const sp=SLIDES[1001];
if(sp&&sp.cards) sp.cards.forEach(cd=>{
  if(cd[0]==='axis'){cd[0]='isoaxis';cd[2].L=+cd[2].n}
  else if(cd[0]==='title'&&cd[2].k==='منهج العرض'){cd[0]='isotitle';cd[2].wm=0}
});
})();
