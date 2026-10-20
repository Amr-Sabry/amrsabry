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

})();
