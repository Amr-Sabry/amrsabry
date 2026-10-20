/* closing deck · part 1 — slides 14–34
   القسم الثاني · إعادة بناء مقومات التنمية (14–16) · القسم الثالث (17) · التحرك الأول · التعمير (18–34).
   Every text and number is the client's, word for word (txt/NNN.txt). */
(function(){
/* a photo card that must stay on its own part of the picture (no slow drift across it) */
const st=document.createElement('style');
st.textContent='.bc.photo.nopan img{animation:none!important}'+
  /* s5 s5-i: the client's five-panel picture (image48 / image49) — the card shows panel i only (0 = left panel) */
  '.bc.photo.s5 figure{overflow:hidden}.bc.photo.s5 img{inset:0 auto 0 0!important;width:500%!important;max-width:none;animation:none!important}'+
  [0,1,2,3,4].map(i=>`.bc.photo.s5-${i} img{left:-${i*100}%!important}`).join('')+
  /* bas: before/after names (not years) set smaller so a long place name stays inside its half */
  '.bc.photo.bas .bax .yr.w b{font-size:clamp(26px,7cqh,46px)}';
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
      ['title',[c,3,2,3],{bg:['grad','dark2','vio','dark2','mint'][i],wm:ic,t:h,fs:32,s:t,ss:19,pz:0,top:1}]]}),
]});

/* 17 — section three cover */
cover(17,{no:'03',k:'القسم الثالث',t:'ماذا بنينا .. ؟<br>مصر التي تغيرت',s:'خمس قدرات جديدة تمتلكها الدولة (2014-2026)',img:'image59',pos:'50% 60%',ic:'landmark',
  words:['خمس','قدرات','جديدة'],cur:1});
SLIDES[17].cards.forEach(cd=>{if(cd[0]==='title')cd[2].pz=0});

/* 18 — move one cover · التعمير */
move(18,{no:'01',k:'التحرك الأول',t:'التعمير',s:'مصر اتسعت لتستوعب سكانها',img:'image52',pos:'45% 75%',ic:'building-2',
  words:['مصر','اتسعت','لتستوعب','سكانها'],cur:1});

/* 19 — before 2014 / 2026 */
vs(19,HM1,{t:'مصر اتسعت لتستوعب سكانها',img:'image54',pos:'38% 60%',cmp:1,
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

/* 22 — the forum's question */
ask(22,{t:'هل جاء إنشاء المدن الجديدة على حساب تطوير المدن القائمة',img:'image76',fs:56});
SLIDES[22].cards.forEach(cd=>{if(cd[0]==='photo')cd[2].pos='62% 38%'});

/* 23 — the President's words (May 2017) */
S({n:23,...HM1,cards:[
  ['photo',[0,0,6,6],{img:P('image78'),pos:'88% 30%',cls:'nopan'}],
  ['text',[6,0,6,2],{bg:'grad',ic:'landmark',t:'ليأتي توجيه القيادة السياسية منذ اللحظة الأولى بالتدخل الفوري للقضاء على المناطق غير الآمنة',fs:22,pie:0}],
  ['quote',[6,2,6,4],{bg:'dark',t:'والله ما هسيب الناس كده أبدًا طول ما أنا موجود مكاني هنا<br>[[مش هنسيب أطفالنا يطلعوا كده]]',by:'السيد رئيس الجمهورية – مايو 2017',fs:40}],
]});

/* 24 — film */
vid(24,{src:'c5_24.mp4',poster:'c5/image80'});

/* 25 — developing the existing city: before 2014 / 2026 */
vs(25,HM1,{t:'تطوير العمران القائم',img:'image81',
  a:{t:'عجز في الوحدات السكنية يقدر بنحو 3 مليون وحدة سكنية ساهم في انتشار واسع للمناطق غير الآمنة وغير المخططة',fs:17,k:[
    {v:357,u:'منطقة غير آمنة',l:'يقطنها نحو 1.2 مليون نسمة'},
    {v:152,u:'ألف فدان',l:'مناطق غير مخططة<br>أكثر من ثلث مساحة العمران المصري'}]},
  b:{t:'القضاء على المناطق غير الآمنة وتطوير شامل للمناطق غير المخططة والقائمة',fs:17,k:[
    {v:246,u:'ألف وحدة سكنية',l:'القضاء على المناطق غير الآمنة بتنفيذ'},
    {v:16.5,u:'ألف فدان',l:'تطوير مناطق غير مخططة<br>بإجمالي 8 مليون نسمة'}]}});
/* the client's picture shown whole, and the 2026 note beside the 2026 figures */
SLIDES[25].cards.forEach(cd=>{if(cd[0]==='photo'){cd[1]=[0,0,3,3];cd[2].cls='fit'}});
SLIDES[25].cards.push(['text',[0,3,3,3],{bg:'dark2',ic:'house',t:'بالإضافة إلى تنفيذ حوالي [[2 مليون وحدة]] ضمن مشروعات سكن لكل المصريين وتطوير عواصم المحافظات وتطوير القاهرة التاريخية',fs:21,pz:0,pie:0}]);

/* 26 — the projects on the client's map */
S({n:26,...HM1,cards:[
  ['photo',[0,0,8,6],{img:P('image82'),cls:'fit'}],
  ['title',[8,0,4,2],{bg:'dark',ki:'map',t:'توزيع عدد مشروعات تطوير المناطق غير الآمنة',fs:30}],
  ['kpi',[8,2,4,3],{bg:'vio',ic:'house',l:'',pre:'تنفيذ',v:45,u:'مشروع تطوير',sub:'عام 2026',fs:140}],
  ['text',[8,5,4,1],{bg:'grad',t:'للقضاء على المناطق غير الآمنة',fs:24,pz:0,pie:0}],
]});

/* 27 — Maspero triangle: after, and before */
S({n:27,...HM1,cards:[
  ['photo',[0,0,8,6],{img:P('image83'),pos:'50% 40%'}],
  ['title',[8,0,4,2],{bg:'grad',ki:'building-2',t:'مثلث ماسبيرو',fs:48}],
  ['photo',[8,2,4,2],{img:P('image85'),pos:'50% 50%',cap:'مثلث ماسبيرو (قبل التطوير)'}],
  ['photo',[8,4,4,2],{img:P('image84'),pos:'50% 50%'}],
]});

/* 28 — Asmarat, with the two areas before */
S({n:28,...HM1,cards:[
  ['photo',[0,0,8,6],{img:P('image88'),pos:'60% 50%'}],
  ['photo',[8,0,4,2],{img:P('image87'),pos:'50% 45%',cap:'بطن البقرة'}],
  ['photo',[8,2,4,2],{img:P('image86'),pos:'50% 50%',cap:'منشأة ناصر'}],
  ['title',[8,4,4,2],{bg:'grad',ki:'building-2',t:'الأسمرات 1-2',fs:48}],
]});

/* 29 — Mahrousa, with the two areas before */
S({n:29,...HM1,cards:[
  ['photo',[0,0,8,4],{img:P('image90'),pos:'50% 55%'}],
  ['photo',[4,4,4,2],{img:P('image40'),pos:'50% 50%',cap:'سيدي فرج - روض الفرج'}],
  ['photo',[0,4,4,2],{img:P('image89'),pos:'50% 50%',cap:'حكر السكاكيني الجديد - الشرابية'}],
  ['title',[8,0,4,6],{bg:'dark',ki:'building-2',t:'المحروسة 1 – 2',fs:60}],
]});

/* 30 — Rawdet El-Sayeda: Tal El-Aqareb before, and after (drag to compare) */
S({n:30,...HM1,cards:[
  /* one place, two names (Amr 14:47: «وضح ان الاسم كان سابقا»): تل العقارب is what روضة السيدة was called before the works */
  ['photo',[0,0,8,6],{ba:['c5/image92','c5/image91'],sa:'قبل التطوير · كان اسمها',la:'تل العقارب',sb:'بعد التطوير · أصبحت',lb:'روضة السيدة',cls:'bas'}],
  ['title',[8,0,4,3],{bg:'grad',ki:'building-2',t:'روضة السيدة',s:'تل العقارب سابقًا',fs:52,ss:24}],
  ['photo',[8,3,4,3],{img:P('image93'),pos:'50% 50%',cap:'روضة السيدة قبل التطوير · تل العقارب سابقًا'}],
]});

/* 31 — historic Cairo: Fustat gardens (the site plan carries a label, so it is shown whole) */
S({n:31,...HM1,cards:[
  ['photo',[0,0,8,6],{img:P('image94'),cls:'fit'}],
  ['title',[8,0,4,2],{bg:'grad',k:'تطوير القاهرة التاريخية',ki:'landmark',t:'حدائق القسطاط',fs:48}],
  ['photo',[8,2,4,4],{img:P('image95'),pos:'50% 50%'}],
]});

/* 32 — historic / Islamic Cairo */
grid(32,HM1,{k:'تطوير القاهرة التاريخية',ic:'landmark',t:'تطوير القاهرة الإسلامية',fs:46,
  items:[['image96','','50% 40%'],['image97','','50% 22%'],['image98'],['image99'],['image100']]});

/* 33 — international testimonies */
who(33,HM1,{t:'التوسع العمراني وتطوير العمران القائم',img:'image101',pos:'50% 88%',items:[
  {org:'صندوق النقد الدولي',t:'إن الاحتفال العالمي بيوم المدن مثّل فرصة جديدة لإبراز التزام مصر [[بالتنمية الحضرية المستدامة]]، ونشيد بالشراكة المستمرة بين الحكومة المصرية ومنظومة الأمم المتحدة في تنفيذ أهداف التنمية المستدامة والأجندة الحضرية الجديدة.',fs:25},
  {org:'البنك الدولي',t:'الاستراتيجية الوطنية للمدن الذكية هي محطة مهمة في تطوير العمران في مصر، [[والمدن الذكية ليست مجرد تقنية رقمية، بل تقوم على تحسين خدمات الحياة اليومية]] مثل التنقل والطاقة وكفاءة المباني، بما يرفع جودة الحياة للمواطنين',fs:25}]});

/* 34 — from building to connecting */
S({n:34,...HM1,cards:[
  ['quote',[4,0,8,3],{bg:'dark',t:'من التعمير إلى الربط..<br>[[من إتاحة المكان إلى صناعة الفرص]]',fs:44}],
  ['text',[4,3,8,3],{bg:'grad',ic:'route',t:'كان التعمير خطوة أولى لإعادة رسم خريطة التنمية في مصر. فبناء المدن والمناطق العمرانية الجديدة لا يحقق كامل قيمته دون ربطها بمراكز الإنتاج والأسواق والخدمات. ومن هنا، [[جاء الربط باعتباره الحلقة التي تحول العمران من مساحات جديدة إلى فرص اقتصادية وتنموية متكاملة]]، وتربط أجزاء الوطن في شبكة واحدة للحياة والعمل والإنتاج.',fs:28,pz:0,pie:0}],
  ['photo',[0,0,4,6],{img:P('image48'),cls:'s5 s5-3'}],
]});

})();
