/* closing deck · live maps part B (V3 style): slides 38, 58, 63, 66 */
(function(){
'use strict';
/* V3's callout labels (src/lt/match.js): every point keeps its name in a glass chip with a leader line, nothing culled */
if(!window.callouts)window.callouts=function(ov,pts,c,r,top,bot,P){
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

/* V3's Nile axes traced from the client's map (src/lt/mapdata.js MDATA.nile39), names corrected to the client's spelling */
const NILE38=[[30.4505,31.3228,"رشيد","Y","W"],[30.5387,31.2634,"ادفينا","Y","W"],[30.5375,31.1761,"فوه","Y","W"],[30.6527,31.109,"دسوق المعدية","Y","W"],[30.6599,31.0623,"دسوق","Y","W"],[30.7403,31.0069,"شبرا خيت","C","W"],[30.7894,30.8239,"كفر الزيات","Y","W"],[30.797,30.7661,"دفرة الحر","Y","W"],[30.8137,30.6081,"تلا / طنوب (وسط الدلتا)","M","W"],[30.811,30.4708,"طملاي","Y","W"],[30.8652,30.3249,"الخطاطبة","Y","W"],[30.9352,30.2759,"أبو غالب","M","W"],[30.9681,30.2293,"القطا","M","W"],[31.0001,30.1832,"بديل القناطر","C","W"],[31.809,31.3928,"دمياط","Y","E"],[31.7104,31.3589,"البستان (الدولي الساحلي)","Y","E"],[31.6675,31.292,"فارسكور","Y","E"],[31.559,31.1652,"شربين القديم","Y","E"],[31.4994,31.1471,"شربين الجديد","Y","E"],[31.3919,31.0988,"طلخا الجديد","Y","E"],[31.3507,31.051,"طلخا القديم","Y","E"],[31.3134,30.995,"المنصورة","Y","E"],[31.2675,30.9246,"سمنود الجديد","C","E"],[31.2554,30.8522,"سمنود الملاحي","Y","E"],[31.2661,30.7297,"ميت غمر","Y","E"],[31.2734,30.6746,"زفتى","Y","E"],[31.2669,30.5737,"كفر شكر","C","E"],[31.1838,30.5135,"بنها الإقليمي","Y","E"],[31.1855,30.4691,"بنها الزراعي","Y","E"],[31.1904,30.415,"كفر الجزار","Y","E"],[31.1917,30.1129,"الوراق","Y","N"],[31.1962,30.0424,"تحيا مصر","Y","N"],[31.2052,29.9638,"المنيب","Y","N"],[31.2856,29.852,"حلوان","Y","N"],[31.2952,29.7682,"المرازيق","Y","N"],[31.3051,29.6811,"دهشور","Y","N"],[31.2881,29.5099,"الودي","C","N"],[31.2398,29.3324,"الواسطى","Y","N"],[31.1472,29.1141,"عدلي منصور","Y","N"],[31.088,29.0256,"بني سويف","Y","N"],[30.9353,28.8898,"الفشن","M","N"],[30.8188,28.6585,"مغاغة","C","N"],[30.8282,28.4776,"بني مزار","Y","N"],[30.765,28.278,"سمالوط","Y","N"],[30.786,28.0783,"المنيا","Y","N"],[30.7926,27.8677,"أبو قرقاص","C","N"],[30.8856,27.7067,"ملوي","Y","N"],[30.8132,27.5172,"ديروط","Y","N"],[30.9923,27.3134,"منفلوط","M","N"],[31.2351,27.1782,"أسيوط","Y","N"],[31.3234,27.0559,"أبو تيج","M","N"],[31.4568,26.8721,"طما","Y","N"],[31.5118,26.7466,"المراغة","M","N"],[31.7109,26.5417,"أخميم","Y","N"],[31.7179,26.4754,"سوهاج","Y","N"],[31.9046,26.3378,"جرجا","Y","N"],[32.0973,26.1862,"دار السلام","M","N"],[32.2614,26.0304,"نجع حمادي","Y","N"],[32.5136,26.0847,"دشنا","M","N"],[32.7474,26.1442,"دندرة","Y","N"],[32.8073,25.9515,"قوص","Y","N"],[32.7552,25.7455,"شمال الأقصر","M","N"],[32.6036,25.6275,"الأقصر","Y","N"],[32.513,25.5182,"جنوب أرمنت","C","N"],[32.5988,25.3058,"إسنا","Y","N"],[32.7538,25.1789,"السباعية","C","N"],[32.9424,24.9961,"إدفو","Y","N"],[32.9727,24.5815,"كلابشة","Y","N"],[32.9577,24.4089,"دراو","M","N"],[32.916,24.2073,"أسوان المنجم","Y","N"],[32.9264,24.0586,"بديل خزان أسوان","M","N"],[32.9407,23.9804,"خزان أسوان","Y","N"]];
const SPB=n=>SLIDES[n];
const okB=()=>typeof SLIDES!=='undefined';

/* 38 · «شبكة الطرق القائمة والجديدة» + «محاور النيل»: V3's road network (V3 slide 34) and V3's Nile axes traced from this
   same client map (V3 slide 39 as matched: every axis by name and status, on the Nile and on the Rosetta and Damietta
   branches; names as the client writes them) */
if(okB()&&SPB(38)&&typeof RTS!=='undefined'&&RTS.roads&&RTS.nile){
  const D=NILE38, old=RTS.nile.routes[0], col=k=>k==='Y'?'#2a3b86':k==='M'?'#ee9873':'#3c8ca4';
  const of=b=>D.filter(q=>q[4]===b), st=a=>a.map(q=>[q[0],q[1],q[2],'',col(q[3])]);
  const apex=[31.13,30.19], up=a=>[...a].sort((p,q)=>p[1]-q[1]);
  const Nn=of('N').sort((p,q)=>q[1]-p[1]), W=up(of('W')), E=up(of('E'));
  const R=(id,n,sub,pts,s)=>({id,n,sub,col:'#8e9be6',count:1,ns:s.length,noStart:1,noEnd:1,pts,st:st(s)});
  const routes=[R('nn','النيل','القاهرة – أسوان',[apex,[31.2,30.1],...old.pts,[32.88,23.95]],Nn),
    R('nw','فرع رشيد','',[apex,...W.map(q=>[q[0],q[1]])],[...W].reverse()),
    R('ne','فرع دمياط','',[apex,...E.map(q=>[q[0],q[1]])],[...E].reverse())];
  routes[1].st.reverse(); routes[2].st.reverse();
  const cnt=k=>D.filter(q=>q[3]===k).length;
  /* its own network (the shared RTS.nile stays as it is for the other slides) */
  RTS.nile38={title:'محاور النيل',routes,legend:[['cy',`محاور منفذة · ${cnt('Y')}`],['cm',`محاور جارية · ${cnt('M')}`],['cc',`محاور مستقبلية · ${cnt('C')}`]],allNames:1,anNone:1,panel:1};
  SPB(38).cards=[
    ['map',[6,0,6,6],{mode:'route',net:'roads',view:'egypt',title:'شبكة الطرق القائمة والجديدة',tic:'route',noTour:1}],
    ['map',[0,0,6,6],{mode:'route',net:'nile38',view:'egypt',title:'محاور النيل · اضغط على الفرع لعرض أسماء المحاور',tic:'waypoints',noTour:1}],
  ];
}

/* 58 · «الممرات اللوجيستية»: the client's 18 named sea ports = V3's PORTS (same names, same spelling); the ports with project
   data (V3's PORTI, from the Excel «خريطة الموانئ») are numbered and open their card in the list beside the map */
if(okB()&&SPB(58)&&typeof PORTS!=='undefined'&&typeof PORTI!=='undefined'){
  const sp=SPB(58), C=sp.cards, f=t=>C.find(c=>c[0]===t&&(t!=='plist'||c[2].items));
  const ttl=f('title'), lst=f('plist'), kpi=f('kpi');
  ttl[1]=[6,0,6,1]; lst[1]=[9,1,3,5]; lst[2].fs=18; lst[2].gap=16; kpi[1]=[6,1,3,2];
  sp.cards=[
    ['map',[0,0,6,6],{mode:'pts',pts:PORTS.map(q=>[...q,PORTI[q[0]]?2:1]),hiK:2,colors:{1:'#ee9873',2:'#3d5cc0'},callout:{fs:12},labels:0,lfs:12.5,info:PORTI,pick:'السخنة',noTour:1,
      title:'الموانئ البحرية والتجارية · اضغط على الميناء المرقم لعرض بيانات المشروع',tic:'anchor',legend:[['#3d5cc0','ميناء له بيانات مشروع'],['#ee9873','ميناء']]}],
    ttl,kpi,
    /* the detail list comes before the names list: the map fills the first list heading on the slide */
    ['plist',[6,3,3,3],{bg:'dark2',ic:'ship',fs:16.5}],
    lst,
  ];
}

/* 63 · dry ports and logistic centres: the client's map = V3's DRY (V3 slide 64), names as the client writes them;
   «القنطرة شرق» is the client's added dry port, noted «جاري التحديث» as on the client's page */
if(okB()&&SPB(63)){
  const pts=[['برج العرب',29.64,30.89,1],['دمياط',31.75,31.38,1],['القنطرة شرق',32.33,30.86,1],['العاشر من رمضان',31.73,30.3,3],['السادات',30.55,30.4,1],['السادس من أكتوبر',30.87,29.98,3],
    ['الفيوم الجديدة',30.98,29.33,1],['بنى سويف (كوم ابو راضي)',31.19,28.98,1],['الطور',33.62,28.25,1],['سوهاج الجديدة',31.75,26.43,1],['السلوم',25.15,31.55,2],['ارقين',31.33,22.0,2],['قسطل',31.62,22.02,2]];
  const sp=SPB(63), i=sp.cards.findIndex(c=>c[0]==='photo');
  if(i>=0)sp.cards[i]=['map',[0,0,6,6],{mode:'pts',pts,hiK:[2,3],colors:{1:'#ee9873',2:'#3d5cc0',3:'#ffffff'},callout:{fs:12,alias:{'القنطرة شرق':'القنطرة شرق · جاري التحديث'}},labels:0,lfs:12.5,noTour:1,
    title:'الموانئ الجافة والمراكز اللوجيستية',tic:'warehouse',legend:[['#ee9873','ميناء جاف'],['#3d5cc0','مركز لوجيستي'],['#ffffff','ميناء جاف ومركز لوجيستي']]}];
}

/* 66 · airports: the client's 23 names (its list and its map), positions from V3's AIRP; «اكتوبر» (not in V3) at the
   6th of October airport, V3's «سيوة» left out (not on the client's map).
   Amr 17:54: «الداخلة» removed, «برج العرب» named «الإسكندرية», «الطور» added (El Tor airport, 33.65E 28.21N) */
if(okB()&&SPB(66)){
  const pts=[['الخارجة',30.59,25.47],['اسوان',32.82,23.96],['ابو سمبل',31.61,22.37],['برنيس',35.47,23.99],['مرسى علم',34.58,25.56],['الاقصر',32.71,25.67],
    ['سوهاج',31.74,26.34],['أسيوط',31.01,27.05],['الغردقة',33.8,27.18],['شرم الشيخ',34.39,27.98],['الطور',33.65,28.21],['سانت كاترين',34.06,28.68],['طابا',34.78,29.59],['العريش',33.84,31.07],
    ['بورسعيد',32.24,31.28],['العاصمة',31.84,30.07],['القاهرة',31.41,30.12],['سفنكس',30.89,30.11],['الإسكندرية',29.7,30.92],['العلمين',28.46,30.93],['مرسى مطروح',27.22,31.33],
    ['البردويل',33.25,30.95],['اكتوبر',30.83,29.82]].map(q=>[...q,1]);
  const sp=SPB(66), C=sp.cards, lst=C.find(c=>c[0]==='plist'), i=C.findIndex(c=>c[0]==='photo');
  if(lst){lst[1]=[0,0,3,6];lst[2].fs=18;lst[2].gap=18}
  if(i>=0)C[i]=['map',[3,0,6,6],{mode:'pts',pts,hiK:1,colors:{1:'#3d5cc0'},callout:{fs:12},labels:0,lfs:12.5,noTour:1,
    title:'الموانئ الجوية (المطارات)',tic:'plane',legend:[['#3d5cc0','مطار']]}];
}
})();
