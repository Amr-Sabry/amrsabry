/* Client-matched maps: our live maps carry every item the client's maps show (names, values, categories, lines),
   drawn in the colour-idea palette on the day satellite. Loaded after slides.js / routes.js.
   - callouts(): every point gets its name (and value) in a glass chip with a leader line, nothing culled
   - per-slide settings for the maps that used to show the client's own picture */
(function(){
'use strict';

/* ---------- callout labels ---------- */
window.callouts=function(ov,pts,c,r,top,bot,P){
  const cfg=c.callout===true?{}:c.callout, fs=cfg.fs||c.lfs||12.5, padX=9, padY=5, gap=cfg.gap||14, lh=fs*1.2, M=6;
  const g=ov.append('g').attr('class','callouts');
  const midX=cfg.mid!=null?P([cfg.mid,26])[0]:r.w*.5;
  const alias=cfg.alias||{};
  const items=pts.map(d=>({d,name:alias[d.n]||d.n,sub:cfg.sub?cfg.sub(d.n):'',side:(cfg.side&&cfg.side[d.n])||(d.p[0]<midX?'L':'R')}));
  items.forEach(it=>{
    const gg=g.append('g').attr('class','co').style('opacity',0);
    const t=gg.append('text').attr('font-size',fs).attr('font-weight',600).attr('fill','#1c2547').attr('text-anchor','middle').style('font-family','Readex Pro');
    t.append('tspan').attr('x',0).attr('dy',0).text(it.name);
    if(it.sub) t.append('tspan').attr('x',0).attr('dy',lh).attr('font-size',fs*.86).attr('font-weight',500).attr('fill','#3d5cc0').text(it.sub);
    const bb=t.node().getBBox(); it.bb=bb; it.w=bb.width+padX*2; it.h=bb.height+padY*2; it.g=gg; it.t=t;
  });
  if(cfg.layout==='columns'){
    /* infographic columns down both sides of the card, ordered top to bottom so no two leaders cross */
    const xs=items.map(it=>it.d.p[0]).sort((a,b)=>a-b), med=cfg.mid!=null?midX:xs[Math.floor(xs.length/2)];
    const cols={L:items.filter(it=>it.d.p[0]<med),R:items.filter(it=>it.d.p[0]>=med)};
    const bounds={L:[cfg.lTop??70,r.h-(cfg.lBot??150)],R:[top+12,r.h-(cfg.rBot??16)]};
    Object.entries(cols).forEach(([side,list])=>{
      list.sort((a,b)=>a.d.p[1]-b.d.p[1]);
      const [y0,y1]=bounds[side], need=list.reduce((s,it)=>s+it.h+4,0)-4;
      const sp=need>y1-y0?Math.max(1,4-(need-(y1-y0))/Math.max(1,list.length-1)):4;
      let y=y0; list.forEach(it=>{it.y=Math.max(y,Math.min(it.d.p[1]-it.h/2,y1-it.h));y=it.y+it.h+sp});
      for(let i=list.length-1;i>=0;i--){const lim=(i===list.length-1?y1:list[i+1].y-sp)-list[i].h;if(list[i].y>lim)list[i].y=lim}
      for(let i=0;i<list.length;i++){const lim=i===0?y0:list[i-1].y+list[i-1].h+sp;if(list[i].y<lim)list[i].y=lim}
      list.forEach(it=>{const x=side==='R'?r.w-M-it.w:M;it.box={x,y:it.y,w:it.w,h:it.h,side}});
    });
    items.forEach((it,i)=>{const b=it.box;
      it.t.attr('transform',`translate(${b.x+b.w/2},${b.y+padY-it.bb.y})`);
      it.g.insert('rect','text').attr('class','cob').attr('x',b.x).attr('y',b.y).attr('width',b.w).attr('height',b.h).attr('rx',Math.min(9,b.h/2));
      const ex=b.side==='R'?b.x:b.x+b.w, ey=b.y+b.h/2, kx=b.side==='R'?ex-10:ex+10;
      g.insert('path',':first-child').attr('class','col').attr('d',`M${it.d.p[0]},${it.d.p[1]}L${kx},${ey}L${ex},${ey}`).style('opacity',0).transition().delay(900+i*22).duration(400).style('opacity',1);
      it.g.transition().delay(900+i*22).duration(450).style('opacity',1);
    });
    return;
  }
  const hit=(a,b)=>!(a.x+a.w+3<b.x||b.x+b.w+3<a.x||a.y+a.h+3<b.y||b.y+b.h+3<a.y);
  const dots=items.map(it=>({x:it.d.p[0]-6,y:it.d.p[1]-6,w:12,h:12}));
  const placed=[];
  [...items].sort((a,b)=>a.d.p[1]-b.d.p[1]).forEach(it=>{
    const at=(side,dy,dx)=>{let x=side==='R'?it.d.p[0]+gap+dx:it.d.p[0]-gap-dx-it.w; x=Math.max(M,Math.min(r.w-M-it.w,x)); return {x,y:it.d.p[1]-it.h/2+dy,w:it.w,h:it.h,side}};
    let best=null;
    outer: for(let k=0;k<90;k++){
      const dy=(k%2?1:-1)*Math.ceil(k/2)*5, dx=Math.floor(k/30)*22;
      for(const side of [it.side,it.side==='R'?'L':'R']){const b=at(side,dy,dx);
        if(b.y<top-30||b.y+b.h>r.h-bot+20) continue;
        if(placed.some(p=>hit(p,b))||dots.some(p=>hit(p,b))) continue;
        best=b; break outer}}
    it.box=best||at(it.side,0,0); placed.push(it.box);
  });
  items.forEach((it,i)=>{const b=it.box;
    it.t.attr('transform',`translate(${b.x+b.w/2},${b.y+padY-it.bb.y})`);
    it.g.insert('rect','text').attr('class','cob').attr('x',b.x).attr('y',b.y).attr('width',b.w).attr('height',b.h).attr('rx',Math.min(9,b.h/2));
    const ex=b.x+b.w/2<it.d.p[0]?b.x+b.w:b.x, ey=Math.max(b.y+5,Math.min(b.y+b.h-5,it.d.p[1]));
    g.insert('path',':first-child').attr('class','col').attr('d',`M${it.d.p[0]},${it.d.p[1]}L${ex},${ey}`).style('opacity',0).transition().delay(900+i*22).duration(400).style('opacity',1);
    it.g.transition().delay(900+i*22).duration(450).style('opacity',1);
  });
};

/* ---------- the maps that showed the client's picture now draw live, matched item by item ---------- */
const card=(n)=>{const sp=SLIDES[n];return sp&&(sp.cards||[]).find(x=>x[0]==='map'&&!x[2].loc&&!x[2].pip)};
const set=(n,o)=>{const cd=card(n);if(cd)Object.assign(cd[2],o)};

/* 58 · 18 seaports, all named (client: 18 red marks) */
set(58,{callout:{fs:12},labels:0});
/* 64 · 10 dry ports + 5 logistic centres (two both), all named */
set(64,{callout:{fs:12},labels:0});
/* 68 · airports: every airport named; the client's label is «مرسى مطروح» */
set(68,{callout:{fs:12,alias:{'مطروح':'مرسى مطروح'}},labels:0});
/* 88 · 27 power stations, each with its name and capacity as on the client's map */
if(typeof PW!=='undefined'){const mw={};PW.forEach(q=>mw[q[0]]=q[3]);
  set(88,{callout:{fs:10.5,layout:'columns',sub:n=>mw[n]!=null?`${mw[n].toLocaleString('en-US')} ميجاوات`:''},labels:0})}

/* 49 · monorail: client colours (west navy, east orange), every station named as on the client's map,
   Metro Line 3 with its ends, the first high-speed line passing through, and the 100.3 km / 35-station total */
const routeCard=(n,net)=>{const sp=SLIDES[n];return sp&&(sp.cards||[]).find(x=>x[0]==='map'&&x[2].net===net)};
const nm=(rt,names)=>{rt.st=rt.pts.map((p,i)=>[p[0],p[1],names[i]||''])};
if(typeof RTS!=='undefined'&&RTS.mono){const M=RTS.mono, W=M.routes.find(o=>o.id==='mw'), E=M.routes.find(o=>o.id==='me');
  W.col='#2a3b86'; E.col='#ee9873';
  nm(W,['وادي النيل','بشتيل','','الطريق الدائري','المريوطية','','المنصورية','طريق الإسكندرية','مدينة الشيخ زايد','مول مصر','','نقابة المهندسين','','السادات','جامعة الأهرام الكندية','أكتوبر الجديدة','مركز السيطرة والتحكم']);
  nm(E,['الإستاد','هشام بركات','جامعة الأزهر','','الحي السابع','جيهان السادات','المشير أحمد إسماعيل','المشير طنطاوي','','','وان ناينتي','المستشفى الجوي','النرجس','الأندلس','النافورة','','بيت الوطن','مسجد الفتاح العليم','R1','R2','حي المال والأعمال','مدينة الفنون والثقافة','مسجد مصر','مدينة العدالة']);
  M.ctx.forEach(x=>{x.col='#3c8ca4'});
  const south=M.ctx[2]; if(south) south.end=['جامعة القاهرة',south.pts[south.pts.length-1]];
  M.ctx[0].endOn=1; if(south) south.endOn=1;
  M.ctx.push({n:'الخط الأول للقطار السريع (السخنة – مطروح)',col:'#3c8ca4',dash:1,lp:.2,nOn:1,pts:[[31.98,29.78],[31.72,29.88],[31.32,29.95],[30.958,29.996],[30.763,30.136],[30.6,30.3]]});
  M.total={n:'الإجمالي',km:100.3,ns:35}; M.allNames=1}
/* 50 · LRT: client colours per phase (1–2 navy, 4 green→teal, 3 purple→periwinkle, 5 orange→coral), every station named */
if(typeof RTS!=='undefined'&&RTS.lrt){const L=RTS.lrt, col={l12:'#2a3b86',l4:'#3c8ca4',l3:'#8e9be6',l5:'#ee9873'};
  L.routes.forEach(o=>{if(col[o.id])o.col=col[o.id];if(o.id==='l3'||o.id==='l4')o.noStart=1}); L.allNames=1}

/* 48 · high-speed rail: every station on the client's three insets, fast (filled) vs regional (open) as in the client's legend.
   Positions are the real towns; where the client's inset orders towns out of geography the line follows geography. */
if(typeof RTS!=='undefined'&&RTS.hsr){const H=RTS.hsr, F='F', R='R';
  const S=(a)=>a.map(([lo,la,n,k,sd])=>[lo,la,n,sd||'',k]);
  const h1=H.routes.find(o=>o.id==='h1'), h2=H.routes.find(o=>o.id==='h2'), h3=H.routes.find(o=>o.id==='h3');
  /* line 1: Matrouh – Alexandria – 6 October – Capital – Sokhna, with Alexandria, Green Belt and Suez spurs */
  const L1=[[27.24,31.33,'مطروح',F],[27.86,31.19,'رأس الحكمة',F],[28.42,31.03,'الضبعة',F],[28.73,30.97,'سيدي عبد الرحمن',R],[28.93,30.87,'العلمين',F],
    [29.39,30.84,'الحمام',R],[29.6,30.92,'برج العرب',F],[29.82,31.03,'العامرية',R],[29.87,30.94,'الإستاد',F],[30.06,30.76,'النوبارية',R],[30.24,30.6,'',R],
    [30.4,30.46,'وادي النطرون',R],[30.56,30.35,'السادات',F],[30.76,30.15,'سفنكس',R],[30.93,29.99,'6 أكتوبر',F],[31.0,29.88,'حدائق أكتوبر',F],[31.12,29.83,'الجيزة',R],
    [31.35,29.92,'القاهرة',F],[31.62,29.95,'محمد نجيب',F],[31.78,29.88,'العاصمة الإدارية',F],[32.28,29.62,'السخنة',F]];
  h1.pts=L1.map(q=>[q[0],q[1]]); h1.st=S(L1);
  h1.branches=[{pts:[[29.82,31.03],[29.92,31.18]],st:S([[29.92,31.18,'الإسكندرية',F]])},
    {pts:[[31.35,29.92],[31.43,30.13]],st:S([[31.43,30.13,'الحزام الأخضر',F]])},
    {pts:[[32.28,29.62],[32.46,29.83],[32.53,29.98]],st:S([[32.46,29.83,'السويس الجديدة',R],[32.53,29.98,'السويس',F]])}];
  /* line 2: 6 October – Abu Simbel along the western desert, with the Luxor – Qus – Qena spur */
  const W=-.1, L2=[[30.93,29.99,'',F],[31.0+W,29.07,'بني سويف',F],[30.9+W,28.82,'الفشن',R],[30.84+W,28.65,'مغاغة',R],[30.8+W,28.5,'بني مزار',R],[30.71+W,28.31,'سمالوط',R],
    [30.75+W,28.1,'المنيا',F],[30.84+W,27.73,'ملوي',R],[30.81+W,27.56,'ديروط',R],[30.82+W,27.44,'القوصية',R],[30.97+W,27.31,'منفلوط',R],[31.18+W,27.18,'أسيوط',F],
    [31.43+W,26.9,'طما',R],[31.5+W,26.77,'طهطا',R],[31.69+W,26.56,'سوهاج',F],[31.89+W,26.34,'جرجا',R],[32.0+W,26.24,'البلينا',R],[32.24+W,26.05,'نجع حمادي',R],
    [32.64+W,25.69,'الأقصر',F],[32.53+W,25.6,'أرمنت',R],[32.55+W,25.29,'إسنا',R],[32.68+W,25.17,'السباعية',R],[32.87+W,24.98,'إدفو',F],[32.93+W,24.47,'كوم أمبو',F],
    [32.92+W,24.4,'دراو',R],[32.86+W,24.15,'أسوان الجديدة',R],[32.9+W,24.08,'أسوان',F],[32.88+W,23.97,'السد العالي',F],[32.86+W,23.88,'كلابشة',R],
    [31.75,22.85,'توشكى',F],[31.62,22.34,'أبو سمبل',F]];
  h2.pts=L2.map(q=>[q[0],q[1]]); h2.st=S(L2);
  h2.branches=[{pts:[[32.54,25.69],[32.76,25.91],[32.72,26.16]],st:S([[32.76,25.91,'قوص',R],[32.72,26.16,'',F]])}];
  /* line 3: Qena – Safaga, then up the coast to Sahl Hasheesh and Hurghada */
  const L3=[[32.72,26.16,'قنا',F],[33.93,26.74,'سفاجا',F],[33.87,27.01,'سهل حشيش',R],[33.81,27.25,'الغردقة',F]];
  h3.pts=[[32.72,26.16],[33.3,26.5],[33.93,26.74],[33.87,27.01],[33.81,27.25]]; h3.st=S(L3);
  h2.col='#3c8ca4'; h3.col='#ee9873'; H.legend=[['f','محطات سريعة'],['r','محطات إقليمية']]; H.allNames=1; H.anMin=1}

window.__matched=[58,64,68,88,49,50,48];
})();
