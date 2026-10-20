/* closing deck · part 1 — slides 14–34
   القسم الثاني · إعادة بناء مقومات التنمية (14–16) · القسم الثالث (17) · التحرك الأول · التعمير (18–34).
   Every text and number is the client's, word for word (txt/NNN.txt). */
(function(){
/* a photo card that must stay on its own part of the picture (no slow drift across it) */
const st=document.createElement('style');
st.textContent='.bc.photo.nopan img{animation:none!important}'+
  /* s5 s5-i: the client's five-panel picture (image48 / image49) — the card shows panel i only (0 = left panel) */
  '.bc.photo.s5 figure{overflow:hidden}.bc.photo.s5 img{inset:0 auto 0 0!important;width:500%!important;max-width:none;animation:none!important}'+
  [0,1,2,3,4].map(i=>`.bc.photo.s5-${i} img{left:-${i*100}%!important}`).join('');
document.head.appendChild(st);

/* 14 — section two cover */
cover(14,{no:'02',k:'القسم الثاني',t:'إعادة بناء مقومات التنمية',s:'مشروع وطني متكامل للتنمية',img:'image48',pos:'50% 50%',ic:'layers',
  words:['مشروع','وطني','متكامل'],cur:1});

/* 15 — what development is */
say(15,HS2,{t:'التنمية ليست معدل نمو،<br>[[ولا مجموعة مشروعات متفرقة]]',
  s:'بل قدرة الدولة والمجتمع على تحويل الموارد والإمكانات إلى فرص اقتصادية وحياة أفضل للمواطنين.',img:'image49',pos:'70% 50%',fs:52,sfs:26});

/* 16 — the five moves, each with its panel of the client's picture */
S({n:16,...HS2,cards:[
  ['title',[10,0,2,6],{bg:'dark',wm:'layers',t:'التنمية هي عملية تحول شاملة ومنظمة',fs:40}],
  ...[['التعمير','building-2','توسيع الرقعة المعمورة، وتطوير العمران القائم، والسكن اللائق','image48',4],
      ['الربط','route','طرق ونقل وسكك حديدية وموانئ ومراكز لوجستية','image48',3],
      ['التمكين','zap','بنية أساسية وخدمات تتيح النشاط الاقتصادي والاجتماعي','image48',2],
      ['الإنتاج والتشغيل','factory','قدرات صناعية وزراعية وطاقية ورقمية، وبيئة جاذبة للاستثمار','image48',0],
      ['بناء الانسان','graduation-cap','تعليم وصحة وخدمات أساسية وشبكات حماية اجتماعية','image49',3]]
    .flatMap(([h,ic,t,img,k],i)=>{const c=8-2*i;return [
      ['photo',[c,0,2,3],{img:P(img),cls:'s5 s5-'+k}],
      ['title',[c,3,2,3],{bg:['grad','dark2','vio','dark2','mint'][i],wm:ic,t:h,fs:32,s:t,ss:19,pz:0}]]}),
]});

/* 17 — section three cover */
cover(17,{no:'03',k:'القسم الثالث',t:'ماذا بنينا .. ؟<br>مصر التي تغيرت',s:'خمس قدرات جديدة تمتلكها الدولة (2014-2026)',img:'image59',pos:'50% 60%',ic:'landmark',
  words:['خمس','قدرات','جديدة'],cur:1});
SLIDES[17].cards.forEach(cd=>{if(cd[0]==='title')cd[2].pz=0});

/* 18 — move one cover · التعمير */
move(18,{no:'01',k:'التحرك الأول',t:'التعمير',s:'مصر اتسعت لتستوعب سكانها',img:'image52',pos:'45% 75%',ic:'building-2',
  words:['مصر','اتسعت','لتستوعب','سكانها'],cur:1});

/* 19 — before 2014 / 2026 */
vs(19,HM1,{t:'مصر اتسعت لتستوعب سكانها',img:'image54',pos:'38% 60%',
  a:{t:'عدم القدرة على ملاحقة الزيادة السكانية وظهور المناطق غير المخططة وغير الآمنة',k:[
    {v:7,u:'%',l:'الرقعة المعمورة<br>استمرت القضية لعقود تواجه الدولة'},
    {v:22,u:'مدينة جديدة',l:'تم إنشائهم في أربعين عاما<br>من بداية السبعينيات'}]},
  b:{t:'مضاعفة نسبة الأراضي المعمورة والمستغلة من إجمالي مساحة مصر',k:[
    {v:14,u:'%',l:'الرقعة المعمورة<br>بالاعتماد على المخطط الاستراتيجية للتنمية'},
    {v:61,u:'مدينة جديدة',l:'تم إنشاء 39 مدينة جديدة في 12 عام'}]}});

/* 20 — the new cities on the client's map */
S({n:20,...HM1,cards:[
  ['photo',[0,0,8,6],{img:P('image55'),cls:'fit'}],
  ['title',[8,0,4,2],{bg:'dark',ki:'map',t:'توزيع المدن الجديدة',fs:40}],
  ['kpi',[8,2,4,4],{bg:'grad',ic:'building-2',l:'',pre:'تم وجاري إنشاء',v:39,u:'مدينة جديدة',sub:'عام 2026',fs:150}],
]});

/* 21 — the new cities, all twenty (client order: right to left, row by row) */
{const C=[['image73','العاصمة الجديدة'],['image72','العلمين الجديدة'],['image68','الجلالة'],['image74','المنصورة الجديدة'],['image71','سفنكس الجديدة'],
  ['image69','الإسماعيلية الجديدة'],['image70','العبور الجديدة'],['image67','أكتوبر الجديدة'],['image66','حدائق اكتوبر'],['image56','سوهاج الجديدة'],
  ['image75','المنيا الجديدة'],['image61','ناصر (غرب أسيوط)','58% 55%'],['image65','غرب قنا'],['image64','توشكى الجديدة'],['image57','بني سويف الجديدة'],
  ['image62','أسوان الجديدة'],['image59','أسيوط الجديدة'],['image63','ملوي الجديدة'],['image58','قنا الجديدة'],['image60','رفح الجديدة']];
 const G=[[8,0],[6,0],[4,0],[2,0],[0,0],[10,2],[8,2],[6,2],[4,2],[2,2],[0,2],[10,4],[8,4],[6,4],[4,4],[2,4],[0,4]];
 /* 17 cells: the last three show two cities each, in turn */
 const cells=G.map((g,i)=>i<14?[C[i]]:[C[i],C[i+3]]);
 S({n:21,...HM1,cards:[
  ['title',[10,0,2,2],{bg:'grad',k:'زيادة الرقعة المعمورة',ki:'expand',t:'المدن الجديدة',fs:34}],
  ...cells.map((cs,i)=>['photo',[G[i][0],G[i][1],2,2],cs.length===1?{img:P(cs[0][0]),cap:cs[0][1],pos:cs[0][2]}:
    {imgs:cs.map(x=>({img:P(x[0]),cap:x[1],pos:x[2]})),every:3200}]),
 ]});}

})();
