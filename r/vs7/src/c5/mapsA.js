/* closing deck · live maps part A (V3 style): slides 20 (new cities), 26 (unsafe areas), 151 (حياة كريمة phase one) */
(function(){
'use strict';
if(typeof SLIDES==='undefined') return;

/* ---------- V3 Update's callout labels (src/lt/match.js): every place named in a glass chip with a leader line ---------- */
window.callouts=window.callouts||function(ov,pts,c,r,top,bot,P){
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


/* a legend line that is a note, not a colour (the client's footnote): no swatch */
try{const st=document.createElement('style');st.textContent='#stage .mleg i[style*="transparent"]{visibility:hidden}';document.head.appendChild(st)}catch(e){}

/* swap the client's map picture on slide n for a live map card; other cards keep their text, optionally re-placed */
const swap=(n,img,card,re)=>{const sp=SLIDES[n];if(!sp)return;
  const i=(sp.cards||[]).findIndex(cd=>cd[0]==='photo'&&String(cd[2].img||'').endsWith(img));if(i<0)return;
  sp.cards[i]=card; if(re) re(sp.cards)};

/* ===== 20 · توزيع المدن الجديدة — the 33 places named on the client's map (image55), V3 CITY positions ===== */
try{
  /* client name ← V3 CITY name; k 5 = the client's «نطاقات واسعة» (hollow marks), k 4 = a new city */
  const AL={'أكتوبر الجديدة':'6 أكتوبر الجديدة','شرق بورسعيد (سلام)':'شرق بورسعيد – سلام','ناصر الجديدة (غرب أسيوط)':'ناصر الجديدة – غرب أسيوط',
    'وادي النطرون الجديدة':'وادي النطرون الجديدة*','غرب كارفور':'غرب كارفور – صواري',
    'القطاع الأول للساحل الشمالي الغربي':'الساحل الشمالي الغربي – القطاع الأول','القطاع الثاني للساحل الشمالي الغربي':'الساحل الشمالي الغربي – القطاع الثاني',
    'القطاع الثالث للساحل الشمالي الغربي':'الساحل الشمالي الغربي – القطاع الثالث'};
  const WIDE=['القرى السياحية','سملا وعلم الروم','القطاع الأول للساحل الشمالي الغربي','القطاع الثاني للساحل الشمالي الغربي','القطاع الثالث للساحل الشمالي الغربي'];
  const P20=CITY.filter(c=>c[3]===4).map(c=>[AL[c[0]]||c[0],c[1],c[2],WIDE.includes(c[0])?5:4]);
  swap(20,'image55',['map',[0,0,8,6],{mode:'pts',pts:P20,hiK:[4,5],colors:{4:'#3d5cc0',5:'#ee9873'},labels:0,callout:{fs:12,layout:'columns'},noTour:1,
    title:'توزيع المدن الجديدة (مواقع تقريبية)',legend:[['#3d5cc0','مدينة جديدة'],['#ee9873','نطاقات واسعة'],['transparent','* وادي النطرون الجديدة: الموقع يحتاج اعتمادا']]}]);
}catch(e){console.warn('mapsA 20',e)}

/* ===== 26 · توزيع عدد مشروعات تطوير المناطق غير الآمنة — the client's 47 labels (image82) = V3 SLUMS' 45 projects by governorate
   (the Kafr El-Sheikh «دريسة» project stands at three places on the client's map; the high-voltage cables project is Cairo's, as on the
   client's map, so V3's Qalyubia duplicate is left out). Positions: V3 GEOL.slums, in the same order as the lists. ===== */
try{
  const L26={
    'القاهرة':['الأسمرات 1، 2، 3','المحروسة 1، 2 – السلام','روضة السيدة','أهالينا 1، 2 – السلام','زهور مايو','ماسبيرو','أرض الإنتاج الحربي – السلام',
      'الخيالة – البساتين','معًا – السلام أول','هضبة الحرفيين – منشأة ناصر','المنيل القديم','كابلات الضغط العالي – 12 منطقة'],
    'الجيزة':['عشش شارع السودان – الدقي','عزبة حرب – بولاق الدكرور','سن العجوز – حدائق أكتوبر'],
    'البحر الأحمر':['حلايب','شلاتين','زرزارة – سفاجا','العشش – رأس غارب','زرزارة – الغردقة'],
    'الإسكندرية':['طلمبات المكس','بشاير الخير 1، 2، 3، 5'],
    'جنوب سيناء':['الترابين – نويبع','الرويسات – شرم الشيخ'],
    'دمياط':['شمال وجنوب الصيادين – رأس البر'],
    'المنيا':['مدينة العمال – المنيا','عشش محفوظ – المنيا'],
    'السويس':['عزبة الصفيح – السويس','اليهودية – السويس'],
    'البحيرة':['الكسارة – رشيد'],
    'الغربية':['الكندالية – طنطا'],
    'الدقهلية':['عزبة الصفيح – المنصورة'],
    'بورسعيد':['زرزارة 1، 2، 3 – بورسعيد','القابوطي 1، 2','عزبة أبو عوف','الهاجوج والإصلاح والجناين','حظائر أبو عوف'],
    'أسوان':['الصحابي 1، 2 – أسوان'],
    'الوادي الجديد':['موط – الداخلة','بلاط – الوادي الجديد'],
    'كفر الشيخ':['منشأة فؤاد – كفر الشيخ','دريسة التحرير – كفر الشيخ، دريسة مطوبس، دريسة دسوق'],
    'قنا':['ترعة الضمرانية – نجع حمادي'],
    'سوهاج':['السماكين – المنشأة','دريسة طما']};
  const G26={};Object.keys(L26).forEach(k=>{G26[k]=(GEOL.slums[k]||[]).slice(0,L26[k].length)});
  swap(26,'image82',['map',[0,0,6,6],{mode:'gov',data:cnt(L26),rk:7,hot:5,list:L26,geo:G26,pick:'القاهرة',noTour:1,
    title:'توزيع عدد مشروعات تطوير المناطق غير الآمنة · اضغط على المحافظة',legend:[['#3d5cc0','5 مشروعات أو أكثر'],['#ee9873','أقل من 5']]}],
    cs=>{/* the map takes six columns; the client's title, figure and line move into the six beside it, with the governorate list under them */
      cs.forEach(cd=>{if(cd[0]==='title'){cd[1]=[9,0,3,2];cd[2].fs=26}else if(cd[0]==='kpi'){cd[1]=[6,0,3,2];cd[2].fs=96}else if(cd[0]==='text'){cd[1]=[6,2,6,1]}});
      cs.push(['plist',[6,3,6,3],{bg:'dark2',ic:'list',h:'القاهرة',lic:'map-pin'}])});
}catch(e){console.warn('mapsA 26',e)}

/* ===== 151 · حياة كريمة — «التوزيع الجغرافي لمحافظات المرحلة الأولى» (client picture image381: a grey map, phase one = the darker
   governorates). Read off the picture governorate by governorate: the twelve dark ones are below (PH1_PIC).
   NB the client's picture does not match the published phase-one list of 20 governorates (PH1_LIST, e.g. الدستور 5116272):
   it darkens مطروح and البحر الأحمر, and leaves light الفيوم، بني سويف، المنوفية، القليوبية، الشرقية، الدقهلية، دمياط، كفر الشيخ،
   الغربية، الإسكندرية. The map follows the client's picture; set USE_LIST=1 to draw the published list instead. ===== */
try{
  const USE_LIST=0;
  const PH1_PIC=['مطروح','البحيرة','الإسماعيلية','الجيزة','المنيا','البحر الأحمر','الوادي الجديد','أسيوط','سوهاج','قنا','الأقصر','أسوان'];
  const PH1_LIST=['أسوان','الوادي الجديد','الأقصر','قنا','سوهاج','أسيوط','المنيا','بني سويف','الفيوم','الجيزة','المنوفية','القليوبية','الإسماعيلية',
    'الشرقية','الدقهلية','دمياط','كفر الشيخ','الغربية','البحيرة','الإسكندرية'];
  const ON=USE_LIST?PH1_LIST:PH1_PIC, CL={};
  (typeof GEO!=='undefined'?GEO.gov:[]).forEach(d=>{const n=GOVN(d.n);CL[n]=ON.includes(n)?1:0});
  swap(151,'image381',['map',[0,0,6,6],{mode:'choro',cls:CL,colors:['rgba(255,255,255,.62)','#3d5cc0'],noTour:1,
    title:'التوزيع الجغرافي لمحافظات المرحلة الأولى',legend:[['#3d5cc0','محافظات المرحلة الأولى'],['rgba(255,255,255,.62)','باقي المحافظات']]}],
    cs=>{/* the map takes six columns; the project list and the client's title and figures sit beside it */
      cs.forEach(cd=>{if(cd[0]==='list'){cd[1]=[6,3,6,3];cd[2].fs=18;cd[2].gap=8}else if(cd[0]==='title'){cd[1]=[6,0,6,1];cd[2].fs=34}
        else if(cd[0]==='kpi'&&cd[2].v===27){cd[1]=[9,1,3,2];cd[2].fs=88}else if(cd[0]==='kpi'&&cd[2].v===18){cd[1]=[6,1,3,2];cd[2].fs=80}})});
}catch(e){console.warn('mapsA 151',e)}

})();
