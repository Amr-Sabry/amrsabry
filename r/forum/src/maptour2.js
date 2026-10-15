/* camera tours for point maps with detail cards, governorate maps and locator maps (registers into MTOUR) */
/* The maps that still stood still get a camera scenario in the manner of the route maps:
   - point maps with a detail card: up to 8 places are visited one by one in their number order (the slide's card follows
     the camera); more places are visited region by region (north coast, Delta, Canal, Sinai, Red Sea, Upper Egypt …);
   - governorate bubbles: the camera visits the governorates with the highest values (with their own pins and list where
     the slide has them);
   - the share-by-governorate map: class by class, then a closer look at the crowded Lower Egypt;
   - small locator maps: Egypt first, a frame marks the place, the camera flies in and stays there (the route maps' engine). */
(function(){
  if(typeof MAPCARD!=='function'||!window.MTOUR) return;
  const {reg:REG,MINT}=window.MTOUR;
  const NS='http://www.w3.org/2000/svg';
  const GN=n=>n.replace(/^محافظة /,'');
  const big=r=>r.w>=380&&r.h>=360;
  const fm=v=>typeof fmt==='function'?fmt(v):String(v);
  const num=(v,cv=1)=>`<b class="num${cv?' cv':''}" data-v="${v}">${fm(v)}</b>`;
  const cnt=(n,f)=>n===1?f[0]:(n===2?f[1]:(n<=10?f[2]:f[3]));
  const GOVW=['محافظة','محافظتان','محافظات','محافظة'];
  const slideOf=el=>el.closest('.slide');
  /* map units per km near Cairo */
  const kmU=P=>{const a=P([31,30]),b=P([32,30]);return Math.hypot(b[0]-a[0],b[1]-a[1])/96.4};
  /* the free box the engine flies into (same rule as the engine) */
  const boxOf=(el,r)=>{const tp=el.querySelector('.mtitle'), top=tp?tp.offsetTop+tp.offsetHeight+10:20;return [22,top,r.w-22,r.h-22]};
  /* a view that fits the points above the data chip in the lower corner: [x, y, width] in map units */
  const fitUp=(A,pts,pad,minW,CH)=>{const bx=boxOf(A.el,A.r), bw=bx[2]-bx[0], bh=bx[3]-bx[1]-CH;
    const xs=pts.map(p=>p[0]), ys=pts.map(p=>p[1]), x0=Math.min(...xs), x1=Math.max(...xs), y0=Math.min(...ys), y1=Math.max(...ys);
    let k=Math.min(bw/Math.max(1e-6,(x1-x0)*(1+pad)), bh/Math.max(1e-6,(y1-y0)*(1+pad)), bw/minW); k=Math.max(1,k);
    return [(x0+x1)/2,(y0+y1)/2+CH/2/k,bw/k]};
  /* while the camera is close: the route maps' quiet context (towns, roads, railways) and the governorates' names */
  function dress(A,stops,o={}){
    const {el,r,sv,P}=A, bx=boxOf(el,r), bw=bx[2]-bx[0], bh=bx[3]-bx[1];
    if(o.ctx!==false&&typeof ctxLayers==='function'&&typeof CTXG!=='undefined'){try{const g=ctxLayers(A.ctx);g.classed('mt2-ctx',true);const ch=g.node().children;if(ch[3])ch[3].remove()}catch(e){}}
    const al={}, areaLab=g=>al[g.n]||(al[g.n]=A.addLab(P(g.c),GN(g.n),'mt2-ar'));
    const zs=stops.filter(s=>s.view);
    zs.forEach(s=>{const V=s.view(), k=bw/V[2], en=s.enter;
      if(k<1.8){s.enter=()=>{sv.classList.remove('mt2-z');en&&en()};return}
      s.enter=()=>{sv.classList.add('mt2-z');en&&en()};
      if(o.area===false)return;
      const hw=V[2]/2*.92, hh=bh/k/2*.92, have=new Set((s.labs||[]).map(x=>x.d.textContent.trim()));s.labs=s.labs||[];
      GEO.gov.forEach(g=>{const p=P(g.c);if(Math.abs(p[0]-V[0])<hw&&Math.abs(p[1]-V[1])<hh&&!have.has(GN(g.n)))s.labs.push(areaLab(g))})});
    const last=zs[zs.length-1];if(last){const lv=last.leave;last.leave=f=>{lv&&lv(f);sv.classList.remove('mt2-z')}}
    return ()=>sv.classList.remove('mt2-z')}
  /* a frame marks where the camera is going, then fades as it flies in */
  const frameStop=(A,V)=>{let fr=null;return {chip:'',hold:800,
    enter:()=>{const bx=boxOf(A.el,A.r), v=V(), k=(bx[2]-bx[0])/v[2], fw=v[2], fh=(bx[3]-bx[1])/k;
      fr=A.ctx.world.append('rect').attr('class','mt2-fr').attr('x',v[0]-fw/2).attr('y',v[1]-fh/2).attr('width',fw).attr('height',fh)},
    leave:()=>{if(!fr)return;const f=fr;fr=null;f.classed('out',true);setTimeout(()=>f.remove(),700)}}};

  /* ---------------------------------------------------------------- where a place is: regions for grouping */
  const RG={north:['الإسكندرية والساحل الشمالي','الساحل الشمالي'],med:['حقول البحر المتوسط','البحر المتوسط'],delta:['الدلتا','الدلتا'],
    canal:['إقليم قناة السويس','القناة'],sinai:['سيناء','سيناء'],red:['ساحل البحر الأحمر','البحر الأحمر'],ups:['جنوب الصعيد','جنوب الصعيد'],
    toshka:['أقصى الجنوب','أقصى الجنوب'],west:['الوادي الجديد والصحراء الغربية','الوادي الجديد'],upn:['شمال ووسط الصعيد','الصعيد'],cairo:['القاهرة الكبرى','القاهرة الكبرى']};
  /* the order the camera travels: around the country, ending in the middle */
  const RORD=['north','med','delta','canal','sinai','red','ups','toshka','west','upn','cairo'];
  /* the mid-line of the Gulf of Suez (lat, lon): east of it is Sinai */
  const GULF=[[29.9,32.56],[29.6,32.55],[29.1,32.85],[28.6,33.2],[28.2,33.5],[27.75,33.85]];
  const gulf=lat=>{for(let i=0;i<GULF.length-1;i++){const [a,x]=GULF[i],[b,y]=GULF[i+1];if(lat<=a&&lat>=b)return x+(a-lat)/(a-b)*(y-x)}return lat>29.9?32.56:33.85};
  const region=(lon,lat,name)=>{
    if(/حقل|حقول/.test(name||'')&&lat>=31.3) return 'med';
    if(lon>=31.95&&lon<32.75&&lat>=29.3&&lat<31.7) return 'canal';
    if(lat>=27.7&&lon>32.6&&lon>gulf(lat)) return 'sinai';
    if((lat>=27.4&&lat<29.5&&lon>=32.6)||(lat<27.4&&lon>=33.4)) return 'red';
    if(lat<23.7&&lon<32.6) return 'toshka';
    if(lat>=30.6&&lon<30.2) return 'north';
    if(lon<30.2||(lat<26.8&&lon<30.9)) return 'west';
    if(lat>=30.35) return 'delta';
    if(lat>=29.7) return 'cairo';
    if(lat>=26.3) return 'upn';
    return 'ups'};

  /* what the map counts, by its title: icon and the four Arabic number forms (1, 2, 3–10, 11+) */
  const PRJ=['مشروع','مشروعان','مشروعات','مشروعًا'];
  const KINDS=[[/الجوية|مطار/,'plane',['مطار','مطاران','مطارات','مطارًا']],[/البرية والجافة/,'container',['موقع','موقعان','مواقع','موقعًا']],
    [/الموانئ|ميناء/,'anchor',['ميناء','ميناءان','موانئ','ميناءً']],[/الكهرباء/,'zap',['محطة','محطتان','محطات','محطة']],
    [/المعالجة/,'droplets',['محطة','محطتان','محطات','محطة']],[/البترول/,'fuel',PRJ],[/المستشفيات|مستشفى/,'stethoscope',['مستشفى','مستشفيان','مستشفيات','مستشفى']],
    [/الجامعات|جامعة/,'graduation-cap',['جامعة','جامعتان','جامعات','جامعة']],[/الصناعية|الصناعي/,'factory',['موقع','موقعان','مواقع','موقعًا']],
    [/الاستصلاح/,'sprout',PRJ],[/السمكي/,'fish',PRJ],[/السياحية/,'landmark',PRJ]];
  const kindOf=c=>KINDS.find(k=>k[0].test(c.title||''))||[null,'map-pin',PRJ];
  /* a word shared by most names (e.g. «جامعة») is left out of the map labels */
  const shortOf=names=>{const f={};names.forEach(n=>{const w=n.split(' ')[0];f[w]=(f[w]||0)+1});
    const t=Object.entries(f).sort((a,b)=>b[1]-a[1])[0], s=t&&t[1]>=3&&t[1]>=names.length*.6?t[0]+' ':null;
    return n=>s&&n.startsWith(s)&&n.length>s.length+3?n.slice(s.length):n};
  /* the one figure from the slide's own detail that best tells the place (a number if there is one) */
  const figOf=(c,n)=>{const it=(c.info&&c.info[n])||[];
    const rest=it.filter((x,i)=>!(i===0&&it.length>1)&&!/نهو/.test(x[1]));
    const f=rest.find(x=>/(^|\s)\d/.test(x[1]))||rest.find(x=>x[1]!==n&&x[1].length<60);
    if(!f) return '';
    const t=f[1].replace(/(^|\s)(\d[\d.,]*)(?=\s|$)/,(m,a,b)=>`${a}<b class="num">${b}</b>`);
    return `<div class="s">${ICON(f[0],18)}<span>${t}</span></div>`};
  const legName=(c,k)=>{const col=c.colors&&c.colors[k];const L=(c.legend||[]).find(x=>x[0]===col);return L&&!/^اضغط|^حجم/.test(L[1])?L[1]:null};

  /* ---------------------------------------------------------------- point maps with a detail card */
  function infoTour(A){
    const {el,c,sv,P,r}=A, L=slideOf(el); if(!c.pts||!c.pts.length||!c.info) return null;
    const K=kindOf(c), sn=shortOf(c.pts.map(q=>q[0])), km=kmU(P);
    const isHi=k=>Array.isArray(c.hiK)?c.hiK.includes(k):k===c.hiK;
    const pins=[...sv.querySelectorAll('g.pin[data-n]')], dots=[...sv.querySelectorAll('.world circle[cx]')].filter(e=>!e.closest('g.pin'));
    const pts=c.pts.map(q=>{const d={n:q[0],ll:[q[1],q[2]],k:q[3],r:q[4],p:P([q[1],q[2]]),no:c._no&&c._no[q[0]]};
      d.el=pins.find(g=>g.dataset.n===d.n)||dots.find(e=>Math.abs(+e.getAttribute('cx')-d.p[0])<.05&&Math.abs(+e.getAttribute('cy')-d.p[1])<.05);
      d.R=d.no?Math.max(11,d.r||0):(d.r||(isHi(d.k)?6.5:4.5));return d});
    const inf=pts.filter(d=>d.no).sort((a,b)=>a.no-b.no); if(!inf.length) return null;
    /* the engine sets every pin to full size at once; let them pop in as drawn */
    setTimeout(()=>pins.forEach(g=>{if(g.dataset.x!=null&&g.isConnected)g.setAttribute('transform',`translate(${g.dataset.x},${g.dataset.y}) scale(0)`)}),70);
    const svgLabs=[...sv.querySelectorAll('.world text[x]')].filter(t=>!t.closest('g.pin')&&!t.closest('.ni'));
    const lab=(d,cls,col)=>{const o=A.addLab(d.p,sn(d.n),cls,col);o.d.firstChild.style.bottom=(d.R+6)+'px';return o};
    const dim=set=>pts.forEach(d=>d.el&&d.el.classList.toggle('mt2-dim',!set.has(d)));
    const undim=()=>pts.forEach(d=>d.el&&d.el.classList.remove('mt2-dim'));
    const bx=boxOf(el,r), bw=bx[2]-bx[0], bh=bx[3]-bx[1];
    const stops=[];
    if(inf.length<=8){
      /* each place in its number order: the camera flies to it and the slide's card shows it */
      const W=220*km;
      inf.forEach((d,i)=>{const V=fitUp(A,[d.p],0,W,110), k=bw/V[2], hw=V[2]/2, hh=bh/k/2;
        const near=pts.filter(e=>e!==d&&Math.abs(e.p[0]-V[0])<hw*.92&&Math.abs(e.p[1]-V[1])<hh*.92);
        const col=(c.colors&&c.colors[d.k])||MINT, labs=[lab(d,'mt2-m',col),...near.map(e=>lab(e,'',col))];
        stops.push({col:MINT,dur:i?(inf.length>5?1150:1300):1700,hold:inf.length>5?1900:2400,labs,view:()=>V,
          chip:`<div class="k">${K[2][0]} ${i+1} من ${inf.length}</div><div class="t"><span class="nb2">${d.no}</span>${d.n}</div>${figOf(c,d.n)}`,
          enter:()=>pickPt(L,c,d.n)})});
    } else {
      /* many places: region by region, with how many there are and which carry a detail card */
      const by={};pts.forEach(d=>{const g=region(d.ll[0],d.ll[1],d.n);(by[g]=by[g]||[]).push(d)});
      let G=RORD.filter(k=>by[k]).map(k=>({k,n:RG[k][0],s:RG[k][1],items:by[k]}));
      const cen=g=>[g.items.reduce((a,d)=>a+d.ll[0],0)/g.items.length,g.items.reduce((a,d)=>a+d.ll[1],0)/g.items.length];
      while(G.length>7){let si=0;G.forEach((g,i)=>{if(g.items.length<G[si].items.length)si=i});
        const sm=G[si], cs=cen(sm), nb=[G[si-1],G[si+1]].filter(Boolean).sort((a,b)=>{const ca=cen(a),cb=cen(b);return Math.hypot(ca[0]-cs[0],ca[1]-cs[1])-Math.hypot(cb[0]-cs[0],cb[1]-cs[1])})[0];
        nb.items=nb.items.concat(sm.items);nb.n=`${nb.n} و${sm.s}`;G.splice(si,1)}
      const cats=[...new Set(pts.map(d=>d.k))].filter(k=>legName(c,k));
      G.forEach((g,gi)=>{
        const items=g.items.slice().sort((a,b)=>(a.no||999)-(b.no||999)||b.ll[1]-a.ll[1]), first=items.find(d=>d.no), set=new Set(items);
        const labs=items.map(d=>lab(d,d===first?'mt2-m':'',(c.colors&&c.colors[d.k])||MINT));
        const V=fitUp(A,items.map(d=>d.p),.4,150*km,150), N=items.length;
        let pl='';
        if(cats.length>1){const m={};items.forEach(d=>{m[d.k]=(m[d.k]||0)+1});
          pl=`<div class="pl">${cats.filter(k=>m[k]).map(k=>`<span><i class="sw2" style="background:${c.colors[k]}"></i><b>${m[k]}</b>${legName(c,k)}</span>`).join('')}</div>`}
        else{const nb=items.filter(d=>d.no);if(nb.length)pl=`<div class="pl">${nb.slice(0,3).map(d=>`<span><i class="nb2">${d.no}</i>${sn(d.n)}</span>`).join('')}${nb.length>3?`<span>+${nb.length-3}</span>`:''}</div>`}
        stops.push({col:MINT,dur:gi?1300:1700,hold:2100,labs,view:()=>V,
          chip:`<div class="k">المنطقة ${gi+1} من ${G.length}</div><div class="t"><span class="ic">${ICON(K[1],22)}</span>${g.n}</div><div class="s">${num(N)} ${cnt(N,K[2])}</div>${pl}`,
          enter:()=>{dim(set);if(first)pickPt(L,c,first.n)},leave:()=>undim()})});
    }
    const unz=dress(A,stops);
    stops.unshift(frameStop(A,stops[0].view));
    return {stops,delay:Math.max(1500,450+pts.length*22+650),summary:'',
      start:()=>{el.classList.add('mt2');svgLabs.forEach(t=>t.classList.add('mt-hide'))},
      end:()=>{el.classList.add('mt2');undim();unz();svgLabs.forEach(t=>t.classList.remove('mt-hide'));if(c.pick&&c.info[c.pick])pickPt(L,c,c.pick)}};
  }

  /* ---------------------------------------------------------------- governorate bubbles */
  function govTour(A){
    const {el,c,sv,P,r,ctx}=A, L=slideOf(el); if(!c.data) return null;
    const ov=ctx.ov.node(), og=[...ov.children];
    const bubs=[...ov.querySelectorAll(':scope > g > g[data-n]')]; if(!bubs.length) return null;
    const gt=og.find(g=>g.children.length&&[...g.children].every(t=>t.tagName==='text'));
    og.forEach(g=>g.classList.add('mt2-ov'));
    /* bubbles keep their size while the map zooms */
    const B={};bubs.forEach(g=>{const m=/translate\(([-\d.e]+),\s*([-\d.e]+)\)/.exec(g.getAttribute('transform')||''), ci=g.querySelector('circle');
      const ni=document.createElementNS(NS,'g');ni.setAttribute('class','ni');while(g.firstChild)ni.appendChild(g.firstChild);g.appendChild(ni);
      B[g.dataset.n]={g,p:m?[+m[1],+m[2]]:null,R:ci?+ci.getAttribute('r'):10}});
    const items=Object.entries(c.data).map(([n,v])=>({n,v})).filter(d=>B[d.n]&&B[d.n].p).sort((a,b)=>b.v-a.v);
    let N=Math.min(5,items.length);while(N>3&&items[N]&&items[N].v===items[N-1].v)N--;
    const top=items.slice(0,N); if(!top.length) return null;
    const geo=!!(c.geo&&c.list&&el._zoomGov), bx=boxOf(el,r), bw=bx[2]-bx[0], km=kmU(P);
    const U=c.unitW||(c.list?['مشروع','مشروعات']:null), legW=((c.legend||[])[0]||[])[1]||'', lw=(/\d+\s+(\S+)/.exec(legW)||[])[1]||'';
    const unit=v=>U?(v>2&&v<11?U[1]:U[0]):lw;
    const valLine=(n,v)=>{const h=c.headN&&c.headN[n], m=h&&/^([\d.,]+)\s*(.*)$/.exec(h);return m?`${num(+m[1].replace(/,/g,''))} ${m[2]}`:`${num(v)} ${unit(v)}`};
    const hiG=ctx.world.insert('g',()=>ov).attr('class','mt2-hi').node();
    const GV=n=>GEO.gov.find(d=>GN(d.n)===n);
    const stops=[];
    let touring=false, orig=null;
    if(geo){
      /* the slide's own zoom becomes visual only during the tour (outline and numbered pins), the tour's camera does the flying */
      orig=el._zoomGov;
      const ghi=sv.querySelector('g.ghi'), gp=sv.querySelector('g.gpins');
      const draw=(n,k)=>{if(ghi)ghi.innerHTML='';if(gp)gp.innerHTML='';if(!n)return;
        const f=GV(n);if(f&&ghi){const p=document.createElementNS(NS,'path');p.setAttribute('d',ctx.path(f.g));p.setAttribute('class','gsel');ghi.appendChild(p)}
        const seen={};(c.geo[n]||[]).map(q=>P(q)).forEach((p,i)=>{const key=p.map(v=>v.toFixed(1)).join(','), m=seen[key]=(seen[key]||0)+1, a=m*2.1, off=m>1?14/k:0;
          const x=p[0]+Math.cos(a)*off, y=p[1]+Math.sin(a)*off, g=document.createElementNS(NS,'g');
          g.setAttribute('class','gp mt2-pin');g.dataset.i=i;g.dataset.x=x;g.dataset.y=y;g.setAttribute('transform',`translate(${x},${y})`);g.style.animationDelay=(500+i*45)+'ms';
          g.innerHTML=`<g class="ni" transform="scale(${(1/k).toFixed(4)})"><circle class="gpr" r="16"></circle><circle r="11"></circle><text text-anchor="middle" dy=".36em">${i+1}</text></g>`;gp&&gp.appendChild(g)})};
      el._zoomGov=n=>{if(touring)draw(n,el._mt2k||1)};
      el._mt2draw=draw;
    }
    top.forEach((d,i)=>{const b=B[d.n], f=GV(d.n), pp=[b.p];
      if(f){const q=ctx.path.bounds(f.g);pp.push(q[0],q[1])}
      let V;
      if(geo){const gpts=(c.geo[d.n]||[]).map(q=>P(q)), fb=f?ctx.path.bounds(f.g):null;V=fitUp(A,[...gpts,...(fb?[fb[0],fb[1]]:[])],.25,bw/12,120)}
      else V=fitUp(A,pp,.3,bw/3.2,120);
      const k=bw/V[2];
      const lb=geo?(f?A.addLab([(ctx.path.bounds(f.g)[0][0]+ctx.path.bounds(f.g)[1][0])/2,ctx.path.bounds(f.g)[0][1]],d.n,'zt',MINT):null):A.addLab(b.p,d.n,'mt2-m',MINT);
      if(lb&&!geo)lb.d.firstChild.style.bottom=(b.R+6)+'px';
      let hp=null;
      stops.push({col:MINT,dur:i?1400:1800,hold:2300,labs:lb?[lb]:[],view:()=>V,
        chip:`<div class="k">الأعلى · ${i+1} من ${top.length}</div><div class="t"><span class="ic">${ICON(c.lic||'map-pin',22)}</span>${d.n}</div><div class="s">${valLine(d.n,d.v)}</div>`,
        enter:()=>{
          if(geo){el._mt2k=k;sv.classList.add('mt2-hb');pickGov(L,c,d.n)}
          else{
            if(f){hp=document.createElementNS(NS,'path');hp.setAttribute('d',ctx.path(f.g));hiG.appendChild(hp);requestAnimationFrame(()=>requestAnimationFrame(()=>hp&&hp.classList.add('on')))}
            Object.values(B).forEach(o=>o.g.classList.toggle('mt2-dim',o!==b));
            if(c.list)pickGov(L,c,d.n);else b.g.classList.add('sel')}},
        leave:fin=>{if(hp){const h=hp;hp=null;h.classList.remove('on');setTimeout(()=>h.remove(),600)}if(!c.list)b.g.classList.remove('sel')}})});
    const unz=dress(A,stops);
    stops.unshift(frameStop(A,stops[0].view));
    return {stops,delay:geo?1900:Math.max(1500,500+items.length*45+500),summary:'',
      start:()=>{touring=true;el.classList.add('mt2');if(geo)el.classList.add('mt2g');if(gt)gt.classList.add('mt2-off')},
      end:()=>{touring=false;unz();el.classList.add('mt2');if(geo)el.classList.add('mt2g');if(gt)gt.classList.remove('mt2-off');sv.classList.remove('mt2-hb');
        Object.values(B).forEach(o=>o.g.classList.remove('mt2-dim'));
        if(geo){el._zoomGov=orig;if(el._mt2draw)el._mt2draw(null)}
        if(c.list&&c.pick)pickGov(L,c,c.pick)}};
  }

  /* ---------------------------------------------------------------- share by governorate (classes) */
  function choroTour(A){
    const {c,sv,ctx,P,el,r}=A; if(!c.cls||!c.colors) return null;
    const G=GEO.gov, cg=[...sv.querySelectorAll('.world g')].find(x=>x.childElementCount===G.length&&[...x.children].every(p=>p.tagName==='path'));
    if(!cg) return null; cg.classList.add('mt2-cho');
    const paths=[...cg.children], govs=G.map((d,i)=>({n:GN(d.n),el:paths[i],k:c.cls[GN(d.n)],b:ctx.path.bounds(d.g),p:P(d.c),ll:d.c}));
    const keyOf=col=>{const e=Object.entries(c.colors).find(([k,v])=>v===col);return e?e[0]:null};
    const cls=(c.legend||[]).map(x=>({col:x[0],name:x[1],k:keyOf(x[0])})).filter(x=>x.k!=null&&govs.some(d=>String(d.k)===x.k));
    if(!cls.length) return null;
    const bx=boxOf(el,r), bw=bx[2]-bx[0];
    const lite=col=>{const h=col.replace('#',''), v=parseInt(h.length===3?h.replace(/./g,'$&$&'):h,16), l=(.2126*(v>>16&255)+.7152*(v>>8&255)+.0722*(v&255))/255;return l<.25?'#8f8ef7':col};
    const dim=set=>govs.forEach(d=>d.el.classList.toggle('mt2-dim',!set.has(d)));
    const undim=()=>govs.forEach(d=>d.el.classList.remove('mt2-dim'));
    const lower=d=>d.ll[0]>29.6&&d.ll[0]<32.65&&d.ll[1]>29.7&&d.ll[1]<31.75;
    const stops=[];
    cls.forEach((x,i)=>{const its=govs.filter(d=>String(d.k)===x.k), set=new Set(its), N=its.length, col=lite(x.col);
      const head=`<div class="t"><i class="sw" style="background:${x.col}"></i>${x.name}</div>`;
      const labs=its.map(d=>A.addLab(d.p,d.n,'mt2-c',col));
      stops.push({col,dur:i?1300:1500,hold:2300,labs,view:()=>A.fitV(its.flatMap(d=>[d.b[0],d.b[1]]),.08,bw/2),
        chip:`<div class="k">الفئة ${i+1} من ${cls.length}</div>${head}<div class="s">${num(N)} ${cnt(N,GOVW)}</div>`,enter:()=>dim(set),leave:()=>undim()});
      const lo=its.filter(lower);
      if(lo.length>=2&&lo.length<N){const ll=lo.map(d=>A.addLab(d.p,d.n,'mt2-c',col)), V=A.fitV(lo.flatMap(d=>[d.b[0],d.b[1]]),.2,bw/4.2);
        stops.push({col,dur:1300,hold:2300,labs:ll,view:()=>[V[0],V[1]+30*V[2]/bw,V[2]],
          chip:`<div class="k">نظرة أقرب · الوجه البحري</div>${head}<div class="s">${num(lo.length)} ${cnt(lo.length,GOVW)} من ${num(N,0)}</div>`,enter:()=>dim(set),leave:()=>undim()})}});
    return {stops,delay:Math.max(1600,400+G.length*28+800),summary:'',start:()=>el.classList.add('mt2'),end:()=>{el.classList.add('mt2');undim()}};
  }

  REG.push({test:(c,r)=>c.mode==='pts'&&!!c.info&&!c.zoom&&big(r)&&(c.pts||[]).length>0,build:infoTour});
  REG.push({test:(c,r)=>c.mode==='gov'&&!!c.data&&big(r),build:govTour});
  REG.push({test:(c,r)=>c.mode==='choro'&&!!c.cls&&big(r),build:choroTour});

  /* ---------------------------------------------------------------- small locator maps */
  /* drawn by the route maps' engine: Egypt, a frame on the place, the camera flies in, rings and the name, and it stays there */
  let LASTX=null;
  if(typeof baseMap==='function'){const _bm=baseMap;baseMap=function(){const x=_bm.apply(this,arguments);LASTX=x;return x}}
  const _mc=MAPCARD;
  MAPCARD=function(el,r,c,live){
    if(c&&c.loc&&c.mode==='pts'&&!c.noTour&&typeof routeMap==='function'&&(c.pts||[]).length){
      const hk=[].concat(c.hiK), T=c.pts.filter(q=>hk.includes(q[3]));
      if(T.length&&T.length<=3){
        const lc=c._lc||(c._lc={mode:'route',loc:1,title:c.title,tic:c.tic,pad:c.pad,panel:0,
          site:T.map(q=>({p:[q[1],q[2]],n:q[0]})),zw:c.zw||(T.every(q=>!d3.geoContains(EGY,[q[1],q[2]]))?280:170)});
        LASTX=null;const out=_mc.call(this,el,r,lc,live), ctx=LASTX;
        try{locExtras(el,r,c,ctx,T)}catch(e){console.error(e)}
        return out}}
    return _mc.apply(this,arguments)};
  function locExtras(el,r,c,ctx,T){
    el.classList.add('mt2-loc');el.style.setProperty('--mm',Math.round(Math.max(54,Math.min(78,r.w*.19)))+'px');
    const ms=el.querySelector('.rmini svg');if(ms)ms.setAttribute('viewBox','0 0 96 96');
    if(!ctx) return;
    const P=ctx.proj, sv=ctx.svg.node();
    /* the other places of the same kind (e.g. the Nile axes) stay as quiet dots that keep their size */
    const gS=sv.querySelector('g.rst'), hk=[].concat(c.hiK);
    if(gS) c.pts.filter(q=>!hk.includes(q[3])).forEach((q,i)=>{const p=P([q[1],q[2]]), g=document.createElementNS(NS,'g');
      g.__x=p[0];g.__y=p[1];g.setAttribute('class','mt2-ax');g.setAttribute('transform',`translate(${p[0]},${p[1]})`);g.style.animationDelay=(300+i*12)+'ms';
      g.innerHTML=`<circle r="3.6" fill="${(c.colors&&c.colors[q[3]])||'#4b4a8f'}"></circle><title>${q[0]}</title>`;gS.insertBefore(g,gS.firstChild)});
    /* the lit governorate follows the card's own title when it names one */
    const m=/^محافظة\s+(.+)$/.exec(c.title||''), hi=sv.querySelector('g.rhi');
    if(m&&hi){const f=GEO.gov.find(d=>GN(d.n)===m[1].trim());if(f){let p=hi.querySelector('path.rgov');
      if(!p){p=document.createElementNS(NS,'path');p.setAttribute('class','rgov');hi.appendChild(p)}p.setAttribute('d',ctx.path(f.g))}}
  }

  /* ---------------------------------------------------------------- styles */
  const st=document.createElement('style');st.textContent=`
  .mtour line{vector-effect:non-scaling-stroke}
  .mtour g.pin,.mtour g[data-n],.mtour .world circle[cx]{transition:opacity .6s cubic-bezier(.16,1,.3,1)}
  .mtour .mt2-dim{opacity:.2!important}
  .mtour .mt2-cho path{transition:opacity .6s cubic-bezier(.16,1,.3,1)}
  .mtour .mt2-cho path.mt2-dim{opacity:.13!important}
  .mtour .mt2-off{opacity:0!important;transition:opacity .4s}
  .mtour.mt2-hb .mt2-ov{opacity:0!important;transition:opacity .45s}
  .mtour .mt2-fr{fill:rgba(182,242,220,.06);stroke:#b6f2dc;stroke-width:1.6;vector-effect:non-scaling-stroke;animation:mt2in .7s cubic-bezier(.16,1,.3,1) both;transition:opacity .5s}
  .mtour .mt2-fr.out{opacity:0}
  .mtour .mt2-hi path{fill:rgba(182,242,220,.13);stroke:#b6f2dc;stroke-width:2;opacity:0;transition:opacity .6s cubic-bezier(.16,1,.3,1)}
  .mtour .mt2-hi path.on{opacity:1}
  .mapc .gpins .mt2-pin{animation:mt2in .5s cubic-bezier(.16,1,.3,1) both}
  .mt2-ax{animation:mt2in .6s cubic-bezier(.16,1,.3,1) both}.mt2-ax circle{stroke:#0c0c13;stroke-width:1}
  @keyframes mt2in{from{opacity:0}}
  .mtour .mt2-ctx{opacity:0;transition:opacity .9s cubic-bezier(.16,1,.3,1);pointer-events:none}
  .mtour.mt2-z .mt2-ctx{opacity:1}
  .mtour .mt2-ctx .ru{fill:#1a1934;opacity:.55}
  .mtour .mt2-ctx .rr{fill:none;stroke:#2c2b4e;stroke-width:1}
  .mtour .mt2-ctx .rw{fill:none;stroke:#34335c;stroke-width:1;stroke-dasharray:3 3}
  .mt-l.mt2-ar>span{bottom:auto;top:0;transform:translate(-50%,-50%);background:none;border:none;color:#8c8eb0;font-size:14px;font-weight:500;letter-spacing:.02em;text-shadow:0 0 6px #0c0c13,0 0 2px #0c0c13;clip-path:none;transition:opacity .9s cubic-bezier(.16,1,.3,1)}
  .mt-l.mt2-m>span{font-size:15px;font-weight:700;color:#0d0d14;background:var(--c,#b6f2dc);border:none;padding:3px 12px 4px}
  .mt-l.mt2-c>span{bottom:auto;top:0;transform:translate(-50%,-50%);font-size:12.5px;padding:1px 8px 2px;border-color:var(--c)}
  .mt-chip .t .nb2{display:inline-grid;place-items:center;min-width:32px;height:32px;padding:0 8px;border-radius:16px;background:var(--c,#b6f2dc);color:#0d0d14;font-size:17px;font-weight:700;flex:none;font-variant-numeric:tabular-nums}
  .mt-chip .s b.num:not(.cv){font-size:22px}
  .mt-chip .pl i.nb2{font-style:normal;display:inline-grid;place-items:center;min-width:19px;height:19px;padding:0 5px;border-radius:10px;background:var(--c,#b6f2dc);color:#0d0d14;font-size:11.5px;font-weight:700}
  .mt-chip .pl i.sw2{width:10px;height:10px;border-radius:3px;flex:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.2)}
  .mapc.mt2.mt-done .mt-re,.mapc.mt2.mt-done .mleg~.mt-re{display:flex;top:16px;left:16px;bottom:auto}
  .mapc.mt2g.mt-done .mt-re,.mapc.mt2g.mt-done .mleg~.mt-re{top:58px}
  .mapc.mt2g .mback:not(.mt-re){transition:opacity .5s}
  .mapc.mt2g:not(.mt-done) .mback:not(.mt-re){opacity:0;pointer-events:none}
  .mt2-loc .rmini{width:var(--mm,66px);height:var(--mm,66px);left:10px;top:10px;border-radius:11px}
  .mt2-loc .rmini svg{width:100%;height:100%}
  .mt2-loc .rre{top:auto;bottom:10px;left:10px;padding:7px;gap:0;font-size:0}
  .mt2-loc .rl.t.pin>span{font-size:13.5px;bottom:22px;padding:3px 10px 4px}
  .mt2-loc .rl.ar>span{font-size:12px}`;
  document.head.appendChild(st);
})();
