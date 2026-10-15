/* Forum brand layer, shared by the sector deck and the seven-layer deck:
   1. the «منتدى مصر» symbol redrawn as an outline in the deck's colours, drawn in once then turning slowly (one turn a minute);
      it shows whole, inside the card, on the cover and the closing card only;
   2. the date card names the venue (Al Masa Conference Centre, New Administrative Capital); the date itself stays small;
   3. no pig (piggy bank) and no cross as a health or hospital symbol, in icons and map symbols; plain plus and x signs are fine;
   4. the word «النهو» is never shown: it reads «الانتهاء». */
(function(){
  /* ---------- 3. banned shapes: swap them for neutral icons before anything is drawn ---------- */
  /* only the pig (piggy bank for savings) and the cross used as a symbol for health or hospitals; ordinary plus and x signs stay */
  const SWAP={Hospital:'Stethoscope',PiggyBank:'Wallet',Cross:'Diamond',HeartPlus:'Heart',Ambulance:'Truck',BriefcaseMedical:'Briefcase',Church:'Landmark'};
  if(window.lucide&&lucide.icons) Object.entries(SWAP).forEach(([a,b])=>{if(lucide.icons[b]) lucide.icons[a]=lucide.icons[b]});
  if(typeof SYM!=='undefined'){SYM.hosp='diamond';SYM.digital='square'}

  /* ---------- 1. the symbol as an outline ---------- */
  /* measured from the logo: four tapered ribbons in a pinwheel round a square, each the previous one turned a quarter clockwise,
     and four dots between them (centre of the mark at the origin) */
  const A=[[-189,-202],[59,-108],[71,-62],[-231,-75]];
  /* each ribbon runs on under the next one (woven pinwheel): the full strip goes past the square, and the next strip hides that part */
  const ext=(a,b,d)=>{const L=Math.hypot(b[0]-a[0],b[1]-a[1]);return [b[0]+(b[0]-a[0])/L*d,b[1]+(b[1]-a[1])/L*d]};
  const FULL=[A[0],ext(A[0],A[1],70),ext(A[3],A[2],70),A[3]];
  function rounded(P,R){let d='';const n=P.length;
    for(let i=0;i<n;i++){const p=P[i],a=P[(i+n-1)%n],b=P[(i+1)%n],r=R[i];
      const ua=[a[0]-p[0],a[1]-p[1]],ub=[b[0]-p[0],b[1]-p[1]],la=Math.hypot(...ua),lb=Math.hypot(...ub);
      const p1=[p[0]+ua[0]/la*r,p[1]+ua[1]/la*r],p2=[p[0]+ub[0]/lb*r,p[1]+ub[1]/lb*r];
      d+=(i?'L':'M')+p1.map(v=>v.toFixed(1)).join(',')+'Q'+p.map(v=>v.toFixed(1)).join(',')+' '+p2.map(v=>v.toFixed(1)).join(',')}
    return d+'Z'}
  const RIB=rounded(FULL,[16,4,4,16]);
  const lerp=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
  const FOLD=(()=>{const f=lerp(A[3],A[2],.42),g=lerp(A[0],A[1],.8);return `M${f[0].toFixed(1)},${f[1].toFixed(1)}L${g[0].toFixed(1)},${g[1].toFixed(1)}`})();
  const SQ='M71,-62L62,71L-71,62L-62,-71Z', DOT=[-21,-225];
  /* ribbons: 1st and 4th were bronze in the logo (mint here), 2nd and 3rd dark (periwinkle); dots: top and right bronze, bottom and left dark */
  const RC=['a','b','b','a'], DC=['a','a','b','b'];
  let LN=0;
  window.FLOGO=function(o={}){
    const id='flm'+(++LN);
    const mask=`<mask id="${id}" maskUnits="userSpaceOnUse" x="-400" y="-400" width="800" height="800"><rect x="-400" y="-400" width="800" height="800" fill="#fff"/><path d="${RIB}" transform="rotate(90)" style="fill:#000;stroke:#000;stroke-width:9px"/></mask>`;
    const rib=[0,1,2,3].map(k=>`<g transform="rotate(${90*k})" class="k${k} c${RC[k]}"><g mask="url(#${id})"><path class="rb" pathLength="1" d="${RIB}"/><path class="fd" d="${FOLD}"/></g></g>`).join('');
    const dots=[0,1,2,3].map(k=>`<g transform="rotate(${90*k})"><circle class="dt d${k} c${DC[k]}" cx="${DOT[0]}" cy="${DOT[1]}" r="43"/></g>`).join('');
    return `<svg class="flogo${o.cls?' '+o.cls:''}" viewBox="-292 -292 584 584" aria-hidden="true"><defs>${mask}</defs><path class="sq" d="${SQ}"/>${rib}${dots}</svg>`};

  /* the cover and the closing card only (inside the deck it was distracting): the whole symbol fills the card's height at its
     far (left) side and runs partly behind the words; it turns about its own centre, and stays whole inside the card */
  const _wm=wmark;
  wmark=function(type,c,r){
    if(type==='title'&&c.logo==='cover'){
      /* the drawing fills 95% of its box, so a box up to 1.03 x the card's height still keeps every line inside the card */
      const cover=c.logo==='cover';
      const s=Math.round(cover?Math.min(r.h*1.03,r.w*.8):Math.min(r.h*1.0,r.w*.55,460));
      if(s<120) return _wm(type,c,r);
      const cx=Math.max(r.w*(cover?.33:.2),s*.48+6);
      return `<div class="wm wlogo${cover?' cov':''}" style="width:${s}px;height:${s}px;left:${Math.round(cx-s/2)}px;top:${Math.round((r.h-s)/2)}px">${FLOGO()}</div>`}
    return _wm(type,c,r)};

  /* ---------- 2. date and venue ---------- */
  const VENUE={n:'مركز مؤتمرات الماسة',c:'العاصمة الإدارية الجديدة'};
  CARD.date=function(c,r){
    const parts=String(c.t||'').split(' '), y=parts.length>1?parts[1]:parts[0], m=parts.length>1?parts[0]:'أكتوبر';
    const when=`<div class="dwhen">${ICON('calendar-days',r.h>300?20:16)}<span>${m}</span><span class="num">${y}</span></div>`;
    if(r.h>300)
      return `<div class="hdr dhd"><span class="lab">موعد ومكان المنتدى</span></div>
        <div class="dbl"><div class="mstrip dms">${Array.from({length:12},(_,i)=>`<i class="${i===(c.mi??9)?'on':''}" style="--i:${i}"></i>`).join('')}</div>${when}<div class="vtx"><span class="vk">مكان الانعقاد</span><b>${VENUE.n}</b><i>${ICON('map-pin',18)}${VENUE.c}</i></div></div>`;
    return `<div class="dbl sm">${when}<div class="vtx sm"><b>${VENUE.n}</b><i>${ICON('map-pin',15)}${VENUE.c}</i></div></div>`};

  /* ---------- 4. wording: «الانتهاء», never «النهو» (in the slide data, and in anything drawn later) ---------- */
  const fixW=t=>t.replace(/النهو/g,'الانتهاء');
  const walk=(o,seen=new Set())=>{if(!o||typeof o!=='object'||seen.has(o))return;seen.add(o);
    for(const k of Object.keys(o)){const v=o[k];if(typeof v==='string'){if(v.includes('النهو'))o[k]=fixW(v)}else walk(v,seen)}};
  try{if(typeof SLIDES!=='undefined')walk(SLIDES)}catch(e){}
  try{if(typeof HOSPI!=='undefined')walk(HOSPI)}catch(e){}
  try{if(typeof UNI!=='undefined')walk(UNI)}catch(e){}
  try{if(typeof DATA!=='undefined')walk(DATA)}catch(e){}
  const fixNode=n=>{const it=document.createTreeWalker(n,NodeFilter.SHOW_TEXT);let x;while((x=it.nextNode()))if(x.nodeValue.includes('النهو'))x.nodeValue=fixW(x.nodeValue)};
  new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)fixNode(n);else if(n.nodeType===3&&n.nodeValue.includes('النهو'))n.nodeValue=fixW(n.nodeValue)}))).observe(document.body,{childList:true,subtree:true});

  /* the cover and the closing card carry the symbol large */
  [1,249].forEach(n=>{const sp=typeof SLIDES!=='undefined'&&SLIDES[n];if(sp)(sp.cards||[]).forEach(cd=>{if(cd[0]==='title')cd[2].logo='cover'})});

  /* ---------- styles ---------- */
  const st=document.createElement('style');st.textContent=`
  .bc>.wm.wlogo{right:auto;bottom:auto;opacity:1;color:inherit;line-height:0;z-index:0}
  .flogo{width:100%;height:100%;overflow:visible;--c1:#b6f2dc;--c2:#a9a8ff;opacity:.42;transform-origin:50% 50%;animation:flSpin 64s linear infinite}
  .wlogo.cov .flogo{opacity:.62}
  .bc.mint .flogo,.bc.grad .flogo{--c1:#0d0d14;--c2:#2c2b8c;opacity:.26}
  .bc.vio .flogo{--c1:#ffffff;--c2:#1a1950;opacity:.38}
  .flogo path,.flogo circle{fill:none;vector-effect:non-scaling-stroke;stroke-linejoin:round;stroke-linecap:round}
  .flogo .ca .rb,.flogo .ca .fd,.flogo .dt.ca{stroke:var(--c1)} .flogo .cb .rb,.flogo .cb .fd,.flogo .dt.cb{stroke:var(--c2)}
  .flogo .rb{stroke-width:1.6;stroke-dasharray:1;stroke-dashoffset:1;animation:flDraw 1.25s cubic-bezier(.6,0,.2,1) forwards}
  .flogo .k1 .rb{animation-delay:.16s}.flogo .k2 .rb{animation-delay:.32s}.flogo .k3 .rb{animation-delay:.48s}
  .flogo .fd{stroke-width:1;opacity:0;animation:flSet .8s cubic-bezier(.16,1,.3,1) 1.25s forwards}
  .flogo .sq{stroke:var(--c1);stroke-width:1;opacity:0;animation:flSet .9s cubic-bezier(.16,1,.3,1) 1.4s forwards}
  .flogo .dt{stroke-width:1.6;opacity:0;transform-box:fill-box;transform-origin:center;transform:scale(.94);animation:flSet .8s cubic-bezier(.16,1,.3,1) forwards}
  .flogo .d0{animation-delay:1s}.flogo .d1{animation-delay:1.1s}.flogo .d2{animation-delay:1.2s}.flogo .d3{animation-delay:1.3s}
  @keyframes flDraw{to{stroke-dashoffset:0}}
  @keyframes flSet{to{opacity:1;transform:none}}
  @keyframes flFade{to{opacity:1}}
  @keyframes flSpin{to{transform:rotate(360deg)}}
  .dhd{color:#fff}.dhd .lab{color:#fff;opacity:.9}
  .dbl{margin-top:auto;display:flex;flex-direction:column;gap:16px;color:#fff}
  .dbl.sm{height:100%;justify-content:space-between;gap:8px;margin:0}
  .mstrip.dms{height:26px;gap:4px;margin-bottom:-4px}.mstrip.dms i{border-radius:3px}.mstrip.dms i.on{box-shadow:none}
  .dwhen{display:flex;align-items:center;gap:8px;font:600 22px/1.2 var(--f-display);opacity:.92}
  .dwhen .num{font-size:22px;letter-spacing:0}
  .dbl.sm .dwhen{font-size:17px}.dbl.sm .dwhen .num{font-size:17px}
  .vtx{display:flex;flex-direction:column;gap:6px;padding-top:16px;border-top:1px solid rgba(255,255,255,.24)}
  .vtx .vk{font:600 14px var(--f-body);opacity:.78}
  .vtx b{font:700 30px/1.2 var(--f-display)}
  .vtx i{display:flex;align-items:center;gap:7px;font:500 18px/1.35 var(--f-body);font-style:normal;opacity:.9}
  .vtx.sm{padding-top:10px;gap:3px}.vtx.sm b{font-size:19px}.vtx.sm i{font-size:14px}
  @media (prefers-reduced-motion: reduce){.flogo{animation:none!important}.flogo path,.flogo circle{animation:none!important;opacity:1!important;stroke-dashoffset:0!important}.flogo .dt{transform:none!important}}`;
  document.head.appendChild(st);
})();
