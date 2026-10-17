/* Camera tours for the maps that were still static, in the manner of the route maps:
   Egypt whole first, then the camera flies from stop to stop; at each stop the place lights up, its names appear and a
   data chip tells what is there; a small map in the corner shows where the camera is; at the end the camera returns to
   the whole of Egypt with everything lit, and a button replays the tour.
   - layer maps: the 2014 valley, the growth zones one by one, each layer's networks / stations / cities in groups,
     and the seven layers building up one after another;
   - point maps: category by category (e.g. new cities by generation), with a closer look where points crowd. */
(function(){
  if(typeof MAPCARD!=='function'||typeof baseMap!=='function') return;
  const RMx=typeof RM!=='undefined'?RM:matchMedia('(max-width:1px)').matches;
  let LAST=null; const _bm=baseMap; baseMap=function(){const x=_bm.apply(this,arguments);LAST=x;return x};
  const _mc=MAPCARD;
  /* tours are registered by map kind: {test(c,r), build(api)}; the first that fits the card runs */
  const REG=[];
  MAPCARD=function(el,r,c,live){LAST=null;const out=_mc.apply(this,arguments);const ctx=LAST;
    try{if(ctx&&!c.loc&&!c.pip&&!c.noTour&&c.mode!=='route'){const t=REG.find(x=>x.test(c,r));if(t)TOUR(el,r,c,live,ctx,t.build)}}catch(e){console.error(e)}
    return out};

  const LN=['الأرض','الربط','الطاقة والمرافق','المجتمعات','الإنسان','الإنتاج','المواطن'];
  const LI=['map','route','zap','building-2','graduation-cap','factory','users-round'];
  const MINT='#b6f2dc', VIO='#7b7af4';
  const inPoly=(g,p)=>{try{return d3.geoContains(g,p)}catch(e){return false}};
  const cnt=(n,one,few,many)=>n===1?one:(n===2?few[0]:(n<=10?few[1]:many));

  /* ---------------------------------------------------------------- the tour engine */
  function TOUR(el,r,c,live,ctx,build){
    const svg=ctx.svg, sv=svg.node(), WG=ctx.world;
    const played=typeof B!=='undefined'&&B?(B._mtp||(B._mtp=new Set())):null, fast=RMx||(played&&played.has(c));
    let dead=false; live.push(()=>{dead=true});
    sv.classList.add('mtour');
    /* labels that follow the camera */
    const lay=document.createElement('div');lay.className='mt-lay';el.appendChild(lay);
    const labs=[];
    const addLab=(p,html,cls,col)=>{const d=document.createElement('div');d.className='mt-l '+(cls||'');d.innerHTML=`<span>${html}</span>`;if(col)d.style.setProperty('--c',col);lay.appendChild(d);const o={d,x:p[0],y:p[1]};labs.push(o);return o};
    /* the corner map */
    const mini=document.createElement('div');mini.className='mt-mini';
    const MP=d3.geoMercator().fitExtent([[6,6],[84,84]],EGY), mp=d3.geoPath(MP);
    mini.innerHTML=`<svg width="90" height="90"><path class="me" d="${mp(EGY)}"/><rect class="mr" rx="2"/></svg>`;el.appendChild(mini);const mr=mini.querySelector('.mr');
    /* the data chip */
    const chip=document.createElement('div');chip.className='mt-chip';el.appendChild(chip);
    const leg=el.querySelector('.mleg');
    /* camera: a view is [x, y, width] in the map's own units; the box is the free part of the card */
    const tp=el.querySelector('.mtitle'), top=tp?tp.offsetTop+tp.offsetHeight+10:20;
    const BX=[22,top,r.w-22,r.h-22];
    let T={k:1,x:0,y:0}, V0=null;
    const zt=[...sv.querySelectorAll('text.lb')].map(t=>({t,x:+t.getAttribute('x'),y:+t.getAttribute('y')}));
    const anch=[]; /* overlay marks that keep their size while the map zooms */
    sv.querySelectorAll('.world circle[cx], .world text[x]').forEach(e=>{if(e.closest('.ni')||e.classList.contains('lb'))return;anch.push({e,x:+e.getAttribute('cx')||+e.getAttribute('x')||0,y:+e.getAttribute('cy')||+e.getAttribute('y')||0})});
    const pins=[...sv.querySelectorAll('g.pin[data-x]')].map(g=>({g,x:+g.dataset.x,y:+g.dataset.y}));
    const vT=v=>{const k=(BX[2]-BX[0])/v[2];return {k,x:(BX[0]+BX[2])/2-v[0]*k,y:(BX[1]+BX[3])/2-v[1]*k}};
    const tV=t=>[((BX[0]+BX[2])/2-t.x)/t.k,((BX[1]+BX[3])/2-t.y)/t.k,(BX[2]-BX[0])/t.k];
    const fitV=(pts,pad=.25,minW=60)=>{if(!pts.length)return tV({k:1,x:0,y:0});const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
      const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),aw=BX[2]-BX[0],ah=BX[3]-BX[1];
      let w=Math.max(minW,Math.max(x1-x0,(y1-y0)*aw/ah)*(1+pad));w=Math.min(w,tV({k:1,x:0,y:0})[2]);return [(x0+x1)/2,(y0+y1)/2,w]};
    const apply=t=>{T=t;WG.attr('transform',`translate(${t.x.toFixed(2)},${t.y.toFixed(2)}) scale(${t.k.toFixed(4)})`);
      const s=(1/t.k).toFixed(4);sv.querySelectorAll('.ni').forEach(n=>n.setAttribute('transform',`scale(${s})`));
      zt.forEach(o=>o.t.setAttribute('transform',`translate(${o.x},${o.y}) scale(${s}) translate(${-o.x},${-o.y})`));
      anch.forEach(o=>o.e.setAttribute('transform',`translate(${o.x},${o.y}) scale(${s}) translate(${-o.x},${-o.y})`));
      pins.forEach(o=>o.g.setAttribute('transform',`translate(${o.x},${o.y}) scale(${s})`));
      labs.forEach(o=>{o.d.style.transform=`translate(${(o.x*t.k+t.x).toFixed(1)}px,${(o.y*t.k+t.y).toFixed(1)}px)`});
      ctx.k=t.k;ctx.tx=t.x;ctx.ty=t.y;
      mini.classList.toggle('on',t.k>1.35);
      const a=ctx.proj.invert([(0-t.x)/t.k,(0-t.y)/t.k]),b=ctx.proj.invert([(r.w-t.x)/t.k,(r.h-t.y)/t.k]),pa=MP(a),pb=MP(b);
      mr.setAttribute('x',Math.min(pa[0],pb[0]));mr.setAttribute('y',Math.min(pa[1],pb[1]));mr.setAttribute('width',Math.max(3,Math.abs(pb[0]-pa[0])));mr.setAttribute('height',Math.max(3,Math.abs(pb[1]-pa[1])))};
    const fly=(v1,dur)=>new Promise(res=>{const I=d3.interpolateZoom(tV(T),v1),D=dur||Math.max(1100,Math.min(2400,I.duration*.75)),t0=performance.now();
      const f=now=>{if(dead)return;const u=Math.min(1,(now-t0)/D);apply(vT(I(d3.easeCubicInOut(u))));if(u<1)requestAnimationFrame(f);else res()};requestAnimationFrame(f)});
    const wait=ms=>new Promise(res=>setTimeout(()=>{if(!dead)res()},ms));
    /* names that would sit on top of each other: keep the earlier (more important) one */
    const declutter=()=>{const kept=[];labs.forEach(o=>{if(!o.d.classList.contains('on'))return;o.d.classList.remove('hid');const b=o.d.firstChild.getBoundingClientRect();if(!b.width)return;
      const er=el.getBoundingClientRect();if(b.left<er.left+4||b.right>er.right-4||b.top<er.top+4||b.bottom>er.bottom-4){o.d.classList.add('hid');return}
      if(kept.some(k=>!(b.right<k.left-4||b.left>k.right+4||b.bottom<k.top-2||b.top>k.bottom+2)))o.d.classList.add('hid');else kept.push(b)})};
    const setChip=(h,col)=>{chip.classList.remove('on');setTimeout(()=>{if(dead)return;chip.innerHTML=h;chip.style.setProperty('--c',col||MINT);chip.classList.add('on');
      chip.querySelectorAll('.cv').forEach(sp=>{if(typeof countUp==='function')countUp(sp,80)})},h?220:0)};
    const api={el,r,c,ctx,svg,sv,fitV,addLab,labs,setChip,declutter,P:ctx.proj};
    const plan=build(api); if(!plan||!plan.stops||!plan.stops.length){lay.remove();mini.remove();chip.remove();return}
    const replay=document.createElement('button');replay.type='button';replay.className='mback mt-re';replay.setAttribute('data-int','');replay.innerHTML=`${ICON('rotate-ccw',15)}إعادة الجولة`;
    replay.onclick=ev=>{ev.stopPropagation();const cc=typeof B!=='undefined'&&B&&B.cards.find(x=>x.el===el);if(!cc)return;played&&played.delete(c);paint(cc,cc.pr)};el.appendChild(replay);
    const finish=()=>{plan.stops.forEach(s=>s.leave&&s.leave(1));plan.end&&plan.end();labs.forEach(o=>o.d.classList.remove('on'));setChip(plan.summary||'');
      if(leg)leg.classList.remove('mt-off');el.classList.add('mt-done');apply({k:1,x:0,y:0})};
    setTimeout(async()=>{if(dead)return;
      apply({k:1,x:0,y:0});
      if(fast){finish();return}
      setTimeout(()=>played&&played.add(c),1500);
      await wait(plan.delay??1500);
      if(leg)leg.classList.add('mt-off');
      plan.start&&plan.start();
      for(const [i,s] of plan.stops.entries()){if(dead)return;
        s.enter&&s.enter();setChip(s.chip,s.col);
        if(s.view) await fly(s.view(),s.dur);
        s.after&&s.after();
        labs.forEach(o=>o.d.classList.toggle('on',!!(s.labs&&s.labs.includes(o))));declutter();
        await wait(s.hold||2300);
        s.leave&&s.leave(0);
        labs.forEach(o=>o.d.classList.remove('on'))}
      if(dead)return;
      await fly(tV({k:1,x:0,y:0}),1500);finish()},60);
  }

  /* ---------------------------------------------------------------- layer maps */
  const ZONE_ORDER=['الساحل الشمالي الغربي','غرب الدلتا','شرق القاهرة والعاصمة','إقليم قناة السويس','سيناء','ساحل البحر الأحمر','المثلث الذهبي','الظهير الصحراوي للصعيد','توشكى وجنوب الوادي'];
  const GROUPS={
    2:[{n:'القطار السريع',ln:['hsr'],nd:['hsrst'],ic:'train-front'},{n:'الطرق والمحاور',ln:['road'],ic:'route'},{n:'الموانئ البحرية والجافة والبرية',nd:['port','dry','land'],ic:'ship'},
       {n:'المطارات',nd:['airport'],ic:'plane'},{n:'قناة السويس والأنفاق',ln:['canal'],nd:['tunnel'],ic:'waves'},{n:'المونوريل والقطار الكهربائي الخفيف',ln:['lrt','mono'],ic:'tram-front'},{n:'محاور على النيل',nd:['nileaxis'],ic:'git-commit-horizontal'}],
    3:[{n:'محطات الكهرباء',nd:['power'],ic:'zap'},{n:'محطات المياه والصرف',nd:['water'],ic:'droplets'},{n:'محطات التحلية',nd:['desal'],ic:'waves'},{n:'البترول والغاز',nd:['oil'],ic:'fuel'},{n:'الكابلات ومراكز البيانات',ln:['digital'],nd:['digital'],ic:'cable'}],
    4:[{n:'المدن الجديدة',nd:['city'],ic:'building-2'},{n:'تطوير المدن القائمة',nd:['cityold'],ic:'building'},{n:'تطوير المناطق غير الآمنة',nd:['slum'],ic:'house'}],
    5:[{n:'الجامعات',nd:['uni'],ic:'graduation-cap'},{n:'المستشفيات',nd:['hosp'],ic:'stethoscope'},{n:'المدارس',nd:['school'],ic:'school'}],
    6:[{n:'المناطق الصناعية',nd:['ind'],ic:'factory'},{n:'الاستصلاح الزراعي',zn:['agri'],ic:'sprout'},{n:'الصوامع',nd:['silo'],ic:'warehouse'},{n:'الاستزراع السمكي',nd:['fish'],ic:'fish'},{n:'السياحة',nd:['tour'],ic:'landmark'}]};
  function layerStops(A){
    const {c,sv,P,ctx}=A, s=c.s??1, stops=[];
    const sel=(q)=>[...sv.querySelectorAll(q)];
    const focus=ids=>{sv.classList.add('focus');sel('.nd,.ln,.zn,.lb').forEach(e=>e.classList.toggle('fc',ids.has(e.dataset.id)))};
    const unfocus=()=>{sv.classList.remove('focus');sel('.fc').forEach(e=>e.classList.remove('fc'))};
    const nodeLab=(d,cls,col)=>A.addLab(P(d.p),d.n,cls,col);
    if(s===1){
      const Z=ZONES.filter(z=>z.t==='grow').sort((a,b)=>{const ia=ZONE_ORDER.indexOf(a.n),ib=ZONE_ORDER.indexOf(b.n);return (ia<0?99:ia)-(ib<0?99:ib)});
      Z.forEach((z,i)=>{const b=ctx.path.bounds(z.g), inside=NODES.filter(d=>d.L>=2&&d.L<=6&&d.t!=='school'&&d.t!=='nileaxis'&&inPoly(z.g,d.p));
        const cities=inside.filter(d=>d.t==='city'), byL={};inside.forEach(d=>{byL[d.L]=(byL[d.L]||0)+1});
        const zEl=sv.querySelector(`.zn[data-id="${z.id}"]`), nm=A.addLab([(b[0][0]+b[1][0])/2,b[0][1]],z.n,'zt',MINT);
        const cl=cities.map(d=>nodeLab(d,'ct',MINT));
        stops.push({col:MINT,
          chip:`<div class="k">منطقة توسع · ${i+1} من ${Z.length}</div><div class="t">${z.n}</div>${cities.length?`<div class="s">${ICON('building-2',15)}${cities.slice(0,4).map(d=>d.n).join('، ')}</div>`:''}
            ${Object.keys(byL).length?`<div class="pl"><em>على الخريطة داخل المنطقة</em>${Object.entries(byL).map(([l,n])=>`<span>${ICON(LI[l-1],14)}<b>${n}</b>${LN[l-1]}</span>`).join('')}</div>`:''}`,
          view:()=>A.fitV([b[0],b[1]],.9,140),labs:[nm,...cl],
          enter:()=>{zEl&&zEl.classList.add('zcur','zon');focus(new Set([z.id,...cities.map(d=>d.id)]))},
          leave:(fin)=>{zEl&&zEl.classList.remove('zcur');unfocus()}})});
      return {stops,end:()=>{sel('.zn.z-grow').forEach(e=>e.classList.add('zon'))},
        summary:`<div class="k">الطبقة 1 · الأرض</div><div class="t"><b class="num">${Z.length}</b> مناطق توسع خارج الوادي والدلتا</div>`};
    }
    if(s===0){
      const nile=(GEO.nile||[]).map(n=>n.g).filter(Boolean);
      const reg=[['أسوان',[32.9,24.09]],['الأقصر وقنا',[32.65,25.9]],['أسيوط والمنيا',[31.0,27.6]],['القاهرة الكبرى',[31.24,30.05]],['الدلتا',[31.1,30.85]]];
      reg.forEach(([n,ll],i)=>{const p=P(ll), L=A.addLab(p,n,'zt',VIO);
        stops.push({col:VIO,chip:`<div class="k">الوادي والدلتا · ${i+1} من ${reg.length}</div><div class="t">${n}</div><div class="s">الشريط الضيق حول النيل حيث تركّز العمران حتى 2014</div>`,
          view:()=>A.fitV([[p[0]-60,p[1]-60],[p[0]+60,p[1]+60]],0,120),labs:[L],hold:1700,dur:1500})});
      return {stops,summary:`<div class="k">مصر 2014</div><div class="t"><b class="num">7</b>% فقط من المساحة مأهولة</div>`};
    }
    if(s>=2&&s<=6){
      (GROUPS[s]||[]).forEach((g,i)=>{
        const nd=NODES.filter(d=>d.L===s&&(g.nd||[]).includes(d.t)), ln=LINES.filter(l=>(g.ln||[]).includes(l.t)), zn=ZONES.filter(z=>(g.zn||[]).includes(z.t));
        if(!nd.length&&!ln.length&&!zn.length)return;
        const pts=[...nd.map(d=>P(d.p)),...ln.flatMap(l=>l.pts.map(P)),...zn.flatMap(z=>{const b=ctx.path.bounds(z.g);return [b[0],b[1]]})];
        const named=nd.filter(d=>d.t!=='nileaxis'), labs=(named.filter(d=>d.hub).concat(named.filter(d=>!d.hub))).slice(0,14).map(d=>nodeLab(d,'',MINT));
        ln.filter(l=>l.n).forEach(l=>{const q=l.pts[Math.floor(l.pts.length/2)];labs.push(A.addLab(P(q),l.n,'ln',MINT))});
        zn.forEach(z=>{const b=ctx.path.bounds(z.g);labs.push(A.addLab([(b[0][0]+b[1][0])/2,(b[0][1]+b[1][1])/2],z.n,'zt',MINT))});
        const n=nd.length||ln.length||zn.length, unit=nd.length?'موقعًا':(ln.length?'مسارًا':'منطقة');
        stops.push({col:MINT,
          chip:`<div class="k">${LN[s-1]} · ${i+1} من ${(GROUPS[s]||[]).length}</div><div class="t"><span class="ic">${ICON(g.ic,22)}</span>${g.n}</div><div class="s"><b class="num cv" data-v="${n}">${n}</b> ${unit} على الخريطة${named.length?' · '+named.slice(0,3).map(d=>d.n).join('، '):''}</div>`,
          view:()=>A.fitV(pts,.2,140),labs,
          enter:()=>focus(new Set([...nd.map(d=>d.id),...ln.map(l=>l.id),...zn.map(z=>z.id)])),leave:()=>unfocus()})});
      return {stops,summary:''};
    }
    if(s===8||s===7){
      /* the layers come in one after another over the whole country, then the camera visits the places where they meet */
      for(let l=1;l<=7;l++) stops.push({col:l===7?MINT:VIO,chip:`<div class="k">الطبقة ${l} من 7</div><div class="t"><span class="ic">${ICON(LI[l-1],22)}</span>${LN[l-1]}</div>`,
        enter:()=>ctx.step(l===7?(s===8?8:7):l),hold:l===7?1600:1200});
      (CL||[]).slice(0,4).forEach((cl,i)=>{const ids=new Set(Object.values(cl.steps||{}).flat()), nd=NODES.filter(d=>ids.has(d.id)), byL={};nd.forEach(d=>{byL[d.L]=(byL[d.L]||0)+1});
        const labs=nd.filter(d=>d.hub||d.L===4).slice(0,8).map(d=>nodeLab(d,'',MINT));
        stops.push({col:MINT,chip:`<div class="k">حيث تلتقي الطبقات · ${i+1} من 4</div><div class="t">${cl.n}</div><div class="pl">${Object.entries(byL).map(([l,n])=>`<span>${ICON(LI[l-1],14)}<b>${n}</b>${LN[l-1]}</span>`).join('')}</div>`,
          view:()=>{const p=P(cl.c);const w=(A.r.w-44)/(cl.z||4);return [p[0],p[1],w]},labs,
          enter:()=>focus(ids),leave:()=>unfocus()})});
      return {stops,delay:900,start:()=>ctx.step(0),end:()=>ctx.step(s)};
    }
    return null;
  }

  /* ---------------------------------------------------------------- point maps */
  function ptStops(A){
    const {c,sv,P}=A; if(!c.pts||c.pts.length<2) return null;
    const pts=c.pts.map(q=>({n:q[0],ll:[q[1],q[2]],k:q[3],p:P([q[1],q[2]])}));
    const dots=[...sv.querySelectorAll('.world circle[cx]')].filter(e=>!e.closest('.ni'));
    const dotOf=d=>dots.find(e=>Math.abs(+e.getAttribute('cx')-d.p[0])<.05&&Math.abs(+e.getAttribute('cy')-d.p[1])<.05);
    pts.forEach(d=>{d.el=dotOf(d)});
    const svgLabs=[...sv.querySelectorAll('.world text[x]')].filter(e=>!e.closest('.ni')&&!e.classList.contains('lb'));
    const legName=k=>{const col=c.colors&&c.colors[k];const L=(c.legend||[]).find(x=>x[0]===col);return L?L[1]:null};
    const keys=[...new Set(pts.map(d=>d.k))].sort((a,b)=>a-b);
    const stops=[], kmpx=(()=>{const a=P([31,30]),b=P([31.5,30]);return Math.hypot(b[0]-a[0],b[1]-a[1])/48})();
    const dim=on=>pts.forEach(d=>d.el&&d.el.classList.toggle('mt-dim',!on.has(d)));
    const undim=()=>pts.forEach(d=>d.el&&d.el.classList.remove('mt-dim'));
    const unitOf=n=>c.tourU?(n>=3&&n<=10?c.tourU[0]:c.tourU[1]):'موقعًا';
    const groups=keys.length>1&&keys.length<=6?keys.map(k=>({k,n:legName(k)||'',items:pts.filter(d=>d.k===k)})):[{k:null,n:'',items:pts}];
    groups.forEach((g,gi)=>{const col=(c.colors&&c.colors[g.k])||MINT, labs=g.items.map(d=>A.addLab(d.p,d.n,'',col)), set=new Set(g.items), N=(c.tourN&&c.tourN[g.k])??g.items.length;
      stops.push({col,chip:`<div class="k">${groups.length>1?`${gi+1} من ${groups.length}`:'المواقع على الخريطة'}</div><div class="t"><i class="sw"></i>${g.n||c.tourT||''}</div><div class="s"><b class="num cv" data-v="${N}">${N}</b> ${unitOf(N)}</div>`,
        view:()=>A.fitV(g.items.map(d=>d.p),.3,160),labs,enter:()=>dim(set),leave:()=>undim()});
      /* where the points crowd, a closer look */
      let best=null;g.items.forEach(d=>{const nb=g.items.filter(e=>Math.hypot(e.p[0]-d.p[0],e.p[1]-d.p[1])<60*kmpx);if(!best||nb.length>best.length)best=nb});
      const span=Math.max(...g.items.map(d=>d.p[0]))-Math.min(...g.items.map(d=>d.p[0]));
      if(best&&best.length>=4&&span>250*kmpx){const cx=best.reduce((a,d)=>a+d.ll[0],0)/best.length, cy=best.reduce((a,d)=>a+d.ll[1],0)/best.length;
        const near=(typeof GEO!=='undefined'?GEO.gov:[]).find(gv=>inPoly(gv.g,[cx,cy]));
        stops.push({col,chip:`<div class="k">نظرة أقرب</div><div class="t"><i class="sw"></i>${g.n?g.n+' · ':''}${near?near.n.replace(/^محافظة /,''):'تجمّع'}</div><div class="s"><b class="num cv" data-v="${best.length}">${best.length}</b> ${unitOf(best.length)} متقاربة</div>`,
          view:()=>A.fitV(best.map(d=>d.p),.5,90),labs:best.map(d=>labs[g.items.indexOf(d)]),enter:()=>dim(new Set(best)),leave:()=>undim()})}});
    return {stops,delay:Math.min(2600,700+pts.length*24),start:()=>svgLabs.forEach(t=>t.classList.add('mt-hide')),end:()=>svgLabs.forEach(t=>t.classList.remove('mt-hide'))};
  }

  const big=r=>r.w>=380&&r.h>=360;
  REG.push({test:(c,r)=>c.mode==='layers'&&c.cl==null&&big(r),build:layerStops});
  REG.push({test:(c,r)=>c.mode==='pts'&&!c.info&&!c.zoom&&big(r)&&(c.pts||[]).length>1,build:ptStops});
  window.MTOUR={reg:REG,TOUR,inPoly,LN,LI,MINT,VIO};

  /* ---------------------------------------------------------------- new cities by generation (slide 22) */
  /* the map tours generation by generation with the deck's own numbers, and the «previous generations» list becomes bars
     in the map's own colours, the fourth generation beside them */
  const GEN=[[1,'الجيل الأول',7,'#3e3d8c'],[2,'الجيل الثاني',6,'#5352c4'],[3,'الجيل الثالث',9,'#8f8ef7'],[4,'الجيل الرابع',38,'#b6f2dc']];
  if(typeof CARD!=='undefined') CARD.gens=function(c,r){const mx=Math.max(...GEN.map(g=>g[2])), fs=Math.max(13,Math.min(17,r.h/14));
    return `<div class="hdr">${ICON('history',24)}<span class="lab">${c.h||'أجيال المدن الجديدة'}</span></div>
      <div class="gens" style="font-size:${fs}px">${GEN.map((g,i)=>`<div class="gr${g[0]===4?' g4':''}"><span class="gl">${g[1]}</span><span class="gb"><i style="--w:${(g[2]/mx*100).toFixed(1)}%;--c:${g[3]};--d:${(.35+i*.14).toFixed(2)}s"></i></span><b class="gv" style="font-size:${Math.round(fs*(g[0]===4?1.9:1.5))}px">${g[2]}</b></div>`).join('')}</div>
      <div class="gu">عدد المدن في كل جيل</div>`};
  if(typeof SLIDES!=='undefined'&&SLIDES[22]){const sp=SLIDES[22];(sp.cards||[]).forEach((cd,i)=>{
    if(cd[0]==='map'&&cd[2].mode==='pts'){cd[2].tourN={1:7,2:6,3:9,4:38};cd[2].tourU=['مدن','مدينة']}
    if(cd[0]==='list'&&/الأجيال/.test(cd[2].h||''))sp.cards[i]=['gens',cd[1],{bg:'dark2',h:'أجيال المدن الجديدة'}]})}

  /* ---------------------------------------------------------------- styles */
  const st=document.createElement('style');st.textContent=`
  .mtour .zn{vector-effect:non-scaling-stroke}
  .mtour .zn.z-grow{transition:fill-opacity .9s cubic-bezier(.16,1,.3,1),stroke-width .6s}
  .mtour .zn.z-grow.zon{fill-opacity:.2}
  .mtour .zn.z-grow.zcur{fill-opacity:.24;stroke-dasharray:none;stroke-width:2.4;filter:drop-shadow(0 0 6px rgba(182,242,220,.55))}
  .mtour.focus .zn.zon:not(.fc){opacity:.55!important}
  .mtour .mt-dim{opacity:.12;transition:opacity .6s}
  .mtour circle{transition:opacity .6s}
  .mtour text.mt-hide{opacity:0!important;transition:opacity .4s}
  .map.mtour.focus .lb.fc,.map.mtour .lb.fc{opacity:0!important}
  .mt-lay{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:2}
  .mt-l{position:absolute;left:0;top:0;width:0;height:0;font-family:var(--f-display)}
  .mt-l>span{position:absolute;left:0;bottom:9px;transform:translateX(-50%);white-space:nowrap;font-size:13px;font-weight:500;color:#e9eaf5;background:rgba(12,12,19,.86);border:1px solid #2e2e48;border-radius:999px;padding:2px 10px 3px;
    opacity:0;clip-path:inset(0 0 0 100% round 999px);transition:opacity .4s cubic-bezier(.16,1,.3,1),clip-path .55s cubic-bezier(.6,0,.2,1)}
  .mt-l.on>span{opacity:1;clip-path:inset(0 round 999px)}
  .mt-l.hid>span{opacity:0!important}
  .mt-l.zt>span{font-size:16px;font-weight:700;color:#0d0d14;background:var(--c);border:none;padding:3px 13px 4px;bottom:auto;top:-30px}
  .mt-l.ct>span{border-color:var(--c)}
  .mt-l.ln>span{color:var(--c);border-color:var(--c);font-weight:600}
  .mt-mini{position:absolute;left:16px;top:16px;width:90px;height:90px;z-index:3;border-radius:14px;background:rgba(12,12,19,.86);border:1px solid #2c2c44;opacity:0;transition:opacity .6s cubic-bezier(.16,1,.3,1)}
  .mt-mini.on{opacity:1}
  .mt-mini .me{fill:#1d1c33;stroke:#4a4980;stroke-width:1}.mt-mini .mr{fill:rgba(182,242,220,.25);stroke:#b6f2dc;stroke-width:1.4}
  .mt-chip{position:absolute;left:16px;bottom:16px;z-index:4;max-width:min(78%,520px);display:flex;flex-direction:column;gap:6px;padding:13px 18px 14px 16px;border-radius:16px;
    background:rgba(12,12,19,.92);border:1px solid #2e2e48;border-inline-start:4px solid var(--c,#b6f2dc);font-family:var(--f-display);color:#fff;
    opacity:0;transform:translateY(6px);transition:opacity .45s cubic-bezier(.16,1,.3,1),transform .45s cubic-bezier(.16,1,.3,1);pointer-events:none}
  .mt-chip.on{opacity:1;transform:none}
  .mt-chip:empty{display:none}
  .mt-chip .k{font-size:12.5px;font-weight:600;color:var(--c,#b6f2dc);letter-spacing:.01em}
  .mt-chip .t{display:flex;align-items:center;gap:9px;font-size:24px;font-weight:700;line-height:1.25}
  .mt-chip .t .ic{display:grid;color:var(--c)}.mt-chip .t .sw{width:14px;height:14px;border-radius:4px;background:var(--c);flex:none}
  .mt-chip .t b{font-size:30px;color:var(--c);margin-inline-end:4px}
  .mt-chip .s{display:flex;align-items:center;gap:7px;font-size:15px;font-weight:500;color:#c9cbe0;line-height:1.45}
  .mt-chip .s b{font-size:26px;font-weight:700;color:#fff;line-height:1}
  .mt-chip .s svg{color:var(--c);flex:none}
  .mt-chip .pl{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:2px;font-size:12.5px;color:#d5d7ea}
  .mt-chip .pl em{font-style:normal;color:#8c8eb0;margin-inline-end:2px}
  .mt-chip .pl span{display:flex;align-items:center;gap:5px;background:#16162a;border:1px solid #2e2e48;border-radius:999px;padding:3px 9px 4px}
  .mt-chip .pl span svg{color:#a9a8ff}.mt-chip .pl b{color:#fff;font-weight:700}
  .mleg{transition:opacity .5s}.mleg.mt-off{opacity:0}
  .mt-re{top:16px;left:118px;opacity:0;transition:opacity .5s}
  .mapc.mt-done .mt-re{opacity:1}
  .mapc.mt-done .mt-chip{bottom:auto;top:16px;left:16px}
  .mapc.mt-done .mt-re{left:16px;top:auto;bottom:16px}
  .mapc.mt-done .mleg~.mt-re{display:none}
  .gens{display:flex;flex-direction:column;gap:.5em;margin-top:auto;font-family:var(--f-display)}
  .gens .gr{display:grid;grid-template-columns:1fr auto;grid-template-areas:"l n" "b b";align-items:end;column-gap:.6em;row-gap:.3em}
  .gens .gl{grid-area:l;font-weight:500;font-size:.92em;color:#c9cbe0;white-space:nowrap}
  .gens .gr b{grid-area:n}
  .gens .gb{grid-area:b;height:.5em;border-radius:99px;background:rgba(255,255,255,.07);overflow:hidden;direction:rtl}
  .gens .gb i{display:block;height:100%;width:var(--w);border-radius:99px;background:var(--c);transform-origin:right;transform:scaleX(0);animation:gbar .9s cubic-bezier(.6,0,.2,1) var(--d) forwards}
  .gens .gr b{font-weight:600;color:#fff;text-align:left;line-height:1;font-variant-numeric:tabular-nums;letter-spacing:-.02em}
  .gens .g4 .gl{color:#b6f2dc}.gens .g4 b{color:#b6f2dc}
  .gu{margin-top:.7em;font:500 12.5px var(--f-body);color:#8c8eb0}
  @keyframes gbar{to{transform:scaleX(1)}}
  @media (max-width:1px){.gens .gb i{animation:none;transform:none}}`;
  document.head.appendChild(st);
})();
