/* closing deck · part 3 — slides 69–100 (التحرك الثالث · التمكين 69–88, التحرك الرابع · الإنتاج والتشغيل 89–100) */
(function(){
/* 69 — move three */
move(69,{no:'03',k:'التحرك الثالث',t:'التمكين',s:'من سد العجز إلى القدرة على تلبية الاحتياجات',img:'image197',pos:'50% 100%',ic:'zap',
  words:['العجز','القدرة','التمكين'],cur:1});
/* 70 — the sentence that carries the three moves */
S({n:70,...HM3,cards:[
  ['quote',[4,0,8,4],{bg:'dark',t:'التعمير يخلق المكان، والربط يتيح الوصول إليه، [[والتمكين يمنحه القدرة على الحياة والإنتاج]]',fs:48}],
  ['kin',[8,4,4,2],{words:['التعمير','الربط','التمكين'],cur:2}],
  ['photo',[4,4,4,2],{img:P('image222'),pos:'50% 60%'}],
  ['photo',[0,0,4,6],{img:P('image218'),pos:'45% 50%'}],
]});
/* before / after with several figures a side (the client's 71, 76, 80, 84, 91, 98): the vs grammar — title, «التحدي» and
   «نتائج التحرك» on the right — with the figures in two rows (قبل 2014 above, 2026 below), one or two cards a row, photos under them */
function vsx(n,H,o){const K=x=>x.map(k=>Object.assign({},k)), row=(gs,y,bg,ic,h)=>gs.length===1?[['kpi2',[0,y,8,2],{bg,ic,h,items:K(gs[0]),fs:o.nfs||68}]]
    :[['kpi2',[4,y,4,2],{bg,ic,h,items:K(gs[0]),fs:o.nfs||68}],['kpi2',[0,y,4,2],{bg,ic,h,items:K(gs[1]),fs:o.nfs||68}]];
  const ph=(o.imgs||[]).map((x,i,a)=>['photo',a.length===1?[0,4,8,2]:[i?0:4,4,4,2],{img:P(x[0]),pos:x[1],cls:x[2]}]);
  S(Object.assign({n},H,{cards:[
  ['title',[8,0,4,2],{bg:'dark',k:o.k||'قبل 2014 ← 2026',ki:'git-compare-arrows',t:o.t,s:o.s,fs:o.fs||36,ss:17}],
  ['text',[8,2,4,2],{bg:'dark2',h:'التحدي · قبل 2014',ic:'history',t:o.a.t,fs:o.a.fs||18,pie:0}],
  ['text',[8,4,4,2],{bg:'grad',h:'نتائج التحرك · 2026',ic:'sparkles',t:o.b.t,fs:o.b.fs||18,pie:0}],
  ...row(o.a.g,0,'dark2','history','قبل 2014'),
  ...row(o.b.g,2,'mint','trending-up','2026'),
  ...ph]}))}
/* 71 — sanitation, before / after */
vsx(71,HM3,{t:'الصرف الصحي',s:'من سد العجز إلى القدرة على تلبية الاحتياجات',imgs:[['image203','50% 50%']],
  a:{t:'انخفاض كبير في نسب تغطية الصرف الصحي على مستوى الجمهورية',g:[
    [{v:12,u:'%',l:'تغطية الصرف الصحي بالريف'},{v:50,u:'%',l:'متوسط الجمهورية'}],
    [{v:10,u:'مليون م3/ يوم',l:'طاقة المعالجة الكلية'},{v:385,u:'',l:'محطة معالجة'}]]},
  b:{t:'رفع نسب التغطية والاستخدام الأمثل للموارد المائية المتاحة',g:[
    [{v:60,u:'%',l:'تغطية الصرف الصحي بالريف'},{v:70,u:'%',l:'متوسط الجمهورية'}],
    [{v:19,u:'مليون م3/ يوم',l:'طاقة المعالجة الكلية'},{v:622,u:'',l:'محطة معالجة'}]]}});
/* 72 — the treatment plants on the map (the client's map, shown whole) */
S({n:72,...HM3,cards:[
  ['title',[8,0,4,2],{bg:'dark',ki:'map-pinned',t:'محطات معالجة الصرف الصحي (الثنائية والثلاثية) طاقات 20 ألف ألف م3/ يوم فأكثر',fs:24}],
  ['kpi',[8,2,4,2],{bg:'grad',ic:'factory',pre:'تنفيذ',v:237,u:'محطة معالجة',l:'حتى عام 2026'}],
  ['kpi',[8,4,4,2],{bg:'mint',ic:'droplets',l:'لتصل طاقات المعالجة الكلية',v:19,u:'مليون م3/ يوم'}],
  ['photo',[0,0,8,6],{img:P('image200'),cls:'fit'}],
]});
/* 73 — Gabal el Asfar, phase two */
S({n:73,...HM3,cards:[
  ['photo',[0,0,8,6],{img:P('image202'),pos:'50% 55%'}],
  ['title',[8,0,4,2],{bg:'dark',k:'الجزء الثاني',ki:'droplets',t:'المرحلة الثانية لمحطة معالجة الجبل الأصفر',fs:30}],
  ['kpi',[8,2,4,2],{bg:'grad',ic:'gauge',l:'لتصل الطاقة الإجمالية',v:2.5,u:'مليون م3/ يوم'}],
  ['text',[8,4,4,2],{bg:'dark2',ic:'banknote',t:'توسعات بطاقة 500 ألف/م3يوم بتكلفة [[1.5 مليار جنيه]].',fs:18}],
]});
/* 74 — Abu Rawash expansions */
S({n:74,...HM3,cards:[
  ['photo',[0,0,12,4],{img:P('image203'),pos:'50% 55%'}],
  ['title',[9,4,3,2],{bg:'dark',ki:'droplets',t:'توسعات محطة معالجة أبو رواش',fs:32}],
  ['kpi',[6,4,3,2],{bg:'grad',ic:'gauge',l:'الطاقة الإجمالية',v:1.6,u:'مليون م3/ يوم'}],
  ['text',[0,4,6,2],{bg:'dark2',ic:'banknote',t:'توسعات بطاقة 400 ألف/م3يوم بتكلفة [[6.11 مليار جنيه]]، ورفع مستوي المعالجة من ابتدائية الي ثنائية لكامل طاقة المحطة',fs:17}],
]});
/* 75 — the eastern plant in Alexandria, Abu Rawash before / after */
S({n:75,...HM3,cards:[
  ['photo',[8,0,4,6],{img:P('image204'),cls:'fit dk',cap:'محطة التنقية الشرقية | لمعالجة مياه الصرف الصحي بالاسكندرية'}],
  ['photo',[4,0,4,6],{img:P('image206'),cls:'fit',cap:'توسعات محطة معالجة أبو رواش'}],
  ['photo',[0,0,4,6],{img:P('image205'),pos:'62% 60%'}],
]});
})();
