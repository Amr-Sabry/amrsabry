/* «الجلسة الختامية» · منتدى مصر 2026 — the closing-session deck (171 slides, the client's «الجلسة الختامية V5.pptx»),
   redesigned on the V3 Update engine (Amr, 20 Oct 12:12: «نعيد تصميمه بنفس طريقة update v3»).
   S({n, full?, ax, h, hs, cards:[[type, [col,row,cols,rows], {...}], ...]}) — 12 x 6 grid, columns count from the left
   (RTL readers start at the right). Pictures: img/c5/<media name>.webp (the deck's own media, full quality, max 1920 px).
   Every text and number below is the client's, word for word.

   Templates (use these for the repeating page types so the deck reads as one):
     P('image12')                      → 'c5/image12'
     cover(n,{no,k,t,s,img,words})     section cover (القسم ...)
     move(n,{no,k,t,s,img,words})      move cover (التحرك ...)
     grid(n,H,{k,t,s,ic,items:[[img,cap],...],side})   project photos + a title column (side = an extra card under the title)
     stat(n,H,{k,t,v,u,l,pre,sub,txt,imgs:[[img,cap],...]})   one big number + its text + photos
     vs(n,H,{t,s,img,a:{t,k:[{v,u,l}]},b:{t,k:[...]}})       قبل 2014 ← 2026 (التحدي / نتائج التحرك)
     say(n,H,{t,s,img})                a sentence that carries the story between pages
     ask(n,{t})                        «أهم الأسئلة التي يجيب عنها المنتدى»
     who(n,H,{t,items:[{org,t}],img})  international testimony
     vid(n,{src,cap})                  a full-screen film
*/
const P=k=>'c5/'+k;
/* section headers */
const HS1={ax:'01',h:'لماذا لم يكن الاستمرار ممكنا؟',hs:'تحديات تراكمت عبر عقود لم تكن تحتمل التأجيل'};
const HS2={ax:'02',h:'إعادة بناء مقومات التنمية',hs:'مشروع وطني متكامل للتنمية'};
const HS3={ax:'03',h:'ماذا بنينا .. ؟ مصر التي تغيرت',hs:'خمس قدرات جديدة تمتلكها الدولة (2014-2026)'};
const HM1={ax:'03',h:'التحرك الأول · التعمير',hs:'مصر اتسعت لتستوعب سكانها'};
const HM2={ax:'03',h:'التحرك الثاني · الربط',hs:'مصر أصبحت أكثر اتصالا وترابطا'};
const HM3={ax:'03',h:'التحرك الثالث · التمكين',hs:'من سد العجز إلى القدرة على تلبية الاحتياجات'};
const HM4={ax:'03',h:'التحرك الرابع · الإنتاج والتشغيل',hs:'مقومات إنتاج قابلة لأن تصبح مزايا تنافسية'};
const HM5={ax:'03',h:'التحرك الخامس · بناء الإنسان',hs:'توسعت الإتاحة، والجودة هي المعركة التالية'};
const HS4={ax:'04',h:'ماذا لو لم تتدخل الدولة',hs:'واستمر الوضع القائم قبل 2014'};
const HS5={ax:'05',h:'مصر التي نريدها',hs:'من بناء القدرات إلى تعظيم العائد'};

/* ---------- a film card (the deck's own videos; offline: video/c5_*.mp4) ---------- */
CARD.video=function(c,r){return `<video class="c5v" src="video/${c.src}" ${c.poster?`poster="${IMG(c.poster)}"`:''} playsinline autoplay preload="auto"></video>${c.cap?`<div class="tag">${c.cap}</div>`:''}`};
(function(){const st=document.createElement('style');st.textContent=
  '.bc.vcard{padding:0!important;background:#000!important}.bc.vcard>.in{inset:0!important;top:0!important;right:0!important;width:100%!important;height:100%!important;zoom:1!important}'+
  '.bc.vcard video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit}'+
  /* cls:'fit' on a photo shows the whole picture (maps, charts, infographics): nothing cropped */
  '.bc.photo.fit{background:rgba(255,255,255,.62)}.bc.photo.fit img{object-fit:contain!important;transform:none!important;padding:10px;box-sizing:border-box}'+
  '.bc.photo.fit.dk{background:#0e1430}';
  document.head.appendChild(st);
  /* a film plays with sound once the show has been touched; if the browser refuses, it plays muted */
  new MutationObserver(()=>{document.querySelectorAll('video.c5v:not([data-go])').forEach(v=>{v.dataset.go=1;const p=v.play();if(p&&p.catch)p.catch(()=>{v.muted=true;v.play().catch(()=>{})})})})
    .observe(document.documentElement,{childList:true,subtree:true});
  /* leaving the slide stops its film */
  document.addEventListener('visibilitychange',()=>{if(document.hidden)document.querySelectorAll('video.c5v').forEach(v=>v.pause())});
})();
function vid(n,o){S({n,full:1,cards:[['video',[0,0,12,6],Object.assign({cls:'vcard'},o)]]})}

/* ---------- covers ---------- */
function cover(n,o){S({n,full:1,cards:[
  ['photo',[0,0,7,6],{img:P(o.img),pos:o.pos||'50% 50%'}],
  ['axis',[7,0,2,2],{n:o.no,ic:o.ic||'layers',t:'',s:'',bg:'vio'}],
  ['kin',[9,0,3,2],{words:o.words,cur:o.cur??1}],
  ['title',[7,2,5,3],{bg:'dark',k:o.k,ki:o.ic||'layers',t:o.t,fs:o.fs||56}],
  ['title',[7,5,5,1],{bg:'grad',t:o.s,fs:24}],
]})}
function move(n,o){S({n,full:1,cards:[
  ['photo',[0,0,8,6],{img:P(o.img),pos:o.pos||'50% 50%'}],
  ['axis',[8,0,2,2],{n:o.no,ic:o.ic||'compass',t:'',s:'',bg:'mint'}],
  ['kin',[10,0,2,2],{words:o.words,cur:o.cur??1}],
  ['title',[8,2,4,3],{bg:'dark',k:o.k,ki:o.ic||'compass',t:o.t,fs:o.fs||72}],
  ['title',[8,5,4,1],{bg:'grad',t:o.s,fs:24}],
]})}

/* ---------- project photos with a title column ---------- */
const GRID={1:[[0,0,8,6]],2:[[4,0,4,6],[0,0,4,6]],3:[[0,0,8,3],[4,3,4,3],[0,3,4,3]],4:[[4,0,4,3],[0,0,4,3],[4,3,4,3],[0,3,4,3]],
  5:[[4,0,4,3],[0,0,4,3],[5,3,3,3],[2,3,3,3],[0,3,2,3]],6:[[5,0,3,3],[2,0,3,3],[0,0,2,3],[5,3,3,3],[2,3,3,3],[0,3,2,3]],
  7:[[4,0,4,3],[2,0,2,3],[0,0,2,3],[6,3,2,3],[4,3,2,3],[2,3,2,3],[0,3,2,3]],8:[[6,0,2,3],[4,0,2,3],[2,0,2,3],[0,0,2,3],[6,3,2,3],[4,3,2,3],[2,3,2,3],[0,3,2,3]]};
/* photos fill the left 8 columns; more than 8 take turns in the last cells */
function photoCards(items,area){const it=items.map(x=>typeof x==='string'?[x,'']:x);
  const n=Math.min(8,it.length), G=(area&&area[n])||GRID[n], extra=it.slice(n);
  return G.map((g,i)=>{const x=it[i];
    if(extra.length&&i===n-1) return ['photo',g.slice(),{imgs:[x].concat(extra).map(y=>({img:P(y[0]),cap:y[1]||undefined,pos:y[2]})),every:3600}];
    return ['photo',g.slice(),{img:P(x[0]),cap:x[1]||undefined,pos:x[2]}]})}
function grid(n,H,o){const cards=[['title',[8,0,4,o.side?2:(o.s?4:6)],{bg:o.bg||'dark',k:o.k,ki:o.ic||'images',t:o.t,fs:o.fs||(o.side?38:46)}]];
  if(o.s&&!o.side)cards.push(['text',[8,4,4,2],{bg:'grad',t:o.s,fs:o.sfs||22}]);
  if(o.side)cards.push(o.side);
  S(Object.assign({n},H,{cards:cards.concat(photoCards(o.items))}))}

/* ---------- a big number with its text and photos ---------- */
function stat(n,H,o){const cards=[
  ['kpi',[8,0,4,3],{bg:o.bg||'grad',ic:o.ic||'hash',l:o.l,pre:o.pre,v:o.v,u:o.u,sub:o.sub,fs:o.fs}],
  ['title',[8,3,4,o.txt?1:3],{bg:'dark',k:o.k,ki:o.ki||'sparkles',t:o.t,fs:o.tfs||(o.txt?26:34)}]];
  if(o.txt)cards.push(['text',[8,4,4,2],{bg:'dark2',t:o.txt,fs:o.xfs||17}]);
  S(Object.assign({n},H,{cards:cards.concat(photoCards(o.imgs))}))}

/* ---------- قبل 2014 ← 2026 ---------- */
function vs(n,H,o){const K=x=>x.map(k=>Object.assign({},k));S(Object.assign({n},H,{cards:[
  ['title',[8,0,4,2],{bg:'dark',k:o.k||'قبل 2014 ← 2026',ki:'git-compare-arrows',t:o.t,s:o.s,fs:o.fs||36,ss:17}],
  ['text',[8,2,4,2],{bg:'dark2',h:'التحدي · قبل 2014',ic:'history',t:o.a.t,fs:o.a.fs||18}],
  ['text',[8,4,4,2],{bg:'grad',h:'نتائج التحرك · 2026',ic:'sparkles',t:o.b.t,fs:o.b.fs||18}],
  ['kpi2',[3,0,5,3],{bg:'dark2',ic:'history',h:'قبل 2014',items:K(o.a.k),fs:o.a.nfs}],
  ['kpi2',[3,3,5,3],{bg:'mint',ic:'trending-up',h:'2026',items:K(o.b.k),fs:o.b.nfs}],
  ['photo',[0,0,3,6],{img:P(o.img),pos:o.pos}],
]}))}

/* ---------- a sentence between pages ---------- */
function say(n,H,o){S(Object.assign({n},H,{cards:[
  ['quote',[4,0,8,4],{bg:o.bg||'dark',t:o.t,fs:o.fs||40}],
  ['text',[4,4,8,2],{bg:'grad',t:o.s,fs:o.sfs||22,pie:0}],
  ['photo',[0,0,4,6],{img:P(o.img||'image43'),pos:o.pos}],
].filter(c=>c[0]!=='text'||o.s)}))}

/* ---------- the forum's questions ---------- */
function ask(n,o){S({n,full:1,cards:[
  ['title',[4,0,8,4],{bg:'dark',k:'أهم الأسئلة التي يجيب عنها المنتدى',ki:'circle-help',t:o.t,fs:o.fs||58}],
  ['kin',[0,0,4,2],{words:['السؤال','المنتدى','الإجابة'],cur:0}],
  ['logo',[0,2,4,2],{img:'logo',alt:'منتدى مصر 2026',bg:'dark2',k:.8}],
  ['photo',[0,4,12,2],{img:P(o.img||'image43'),pos:'50% 60%'}],
]})}

/* ---------- international testimony ---------- */
function who(n,H,o){S(Object.assign({n},H,{cards:[
  ['title',[8,0,4,2],{bg:'dark',k:'شهادات دولية',ki:'globe',t:o.t,fs:o.fs||34}],
  ...o.items.map((x,i)=>['quote',[i?0:4,0,4,4],{bg:i?'dark2':'grad',t:x.t,by:x.org,fs:x.fs||22}]),
  ['photo',[0,4,12,2],{img:P(o.img),pos:o.pos||'50% 60%'}],
  ...(o.items.length===1?[]:[]),
]}))}

/* =====================================================================================================
   القسم الأول · لماذا لم يكن الاستمرار ممكنا؟ (1–13)
   ===================================================================================================== */
/* 1 — cover */
S({n:1,full:1,cards:[
  ['title',[4,0,8,4],{bg:'dark',k:'منتدى مصر 2026 · الجلسة الختامية',ki:'sparkles',t:'مصر [[2014–2026]]',s:'من بناء مقومات التنمية .. إلى صناعة المستقبل',fs:118,ss:34}],
  ['date',[0,0,4,4],{t:'أكتوبر 2026',bg:'vio'}],
  ['photo',[0,4,8,2],{img:P('image6'),pos:'50% 70%'}],
  ['logo',[8,4,2,2],{img:'logo',alt:'منتدى مصر 2026',bg:'dark2',k:.86}],
  ['logo',[10,4,2,2],{img:'emblem',alt:'شعار الجمهورية',bg:'dark2',k:.8}],
]});
/* 2, 3 — films */
vid(2,{src:'c5_2.mp4'});
vid(3,{src:'c5_3.mp4',cap:'مصر قبل عام 2014'});
/* 4 — section one */
cover(4,{no:'01',k:'القسم الأول',t:'لماذا لم يكن الاستمرار ممكنا؟',s:'تحديات تراكمت عبر عقود لم تكن تحتمل التأجيل',img:'image10',pos:'50% 40%',ic:'triangle-alert',words:['الأمن','السكان','البنية','الجغرافيا'],cur:1});
/* 5 — four structural challenges */
S({n:5,...HS1,cards:[
  ['photo',[0,0,8,6],{img:P('image11'),pos:'40% 50%'}],
  ['kpi',[8,0,4,4],{bg:'grad',ic:'cog',l:'تحديات هيكلية',v:4,u:'تحديات',fs:180}],
  ['title',[8,4,4,2],{bg:'dark',t:'قيدت من عملية التنمية',fs:40}],
]});
/* 6 — security */
grid(6,HS1,{k:'مصر قبل 2014 · التحدي الأول',ic:'shield-alert',t:'الاضطرابات الأمنية والعمليات الإرهابية',fs:46,
  items:[['image19'],['image16'],['image15'],['image18'],['image17'],['image14'],['image12'],['image13']]});
/* 7 — 2011–2023 */
S({n:7,...HS1,cards:[
  ['photo',[0,0,8,6],{img:P('image20'),pos:'50% 45%'}],
  ['title',[8,0,4,4],{bg:'dark',k:'خلال الفترة (2011- 2023)',ki:'flame',t:'تفاقمت الاضطرابات الامنية والعمليات الإرهابية',fs:46}],
  ['title',[8,4,4,2],{bg:'grad',t:'2011 – 2023',fs:64,pz:0}],
]});
/* 8 — population and urban */
S({n:8,...HS1,cards:[
  ['title',[8,0,4,2],{bg:'dark',k:'مصر قبل 2014 · تحدي سكاني وعمراني',ki:'users',t:'بالإضافة إلى تحديات اقتصادية واجتماعية عانت منها الدولة المصرية لعقود',fs:26}],
  ['kpi',[8,2,4,4],{bg:'grad',ic:'map',l:'زيادة سكانية متسارعة مع تركزها في نطاق جغرافي محدود .. لا يتجاوز',v:7,u:'%',egy:1,wm:0,sub:'من إجمالي المساحة'}],
  ...photoCards([['image29'],['image25'],['image24'],['image28'],['image26'],['image23'],['image21'],['image22']]),
]});
/* 9 — infrastructure and services */
grid(9,HS1,{k:'مصر قبل 2014 · البنية الأساسية والخدمات',ic:'construction',t:'تهالك كامل للبنية التحتية لا تواكب النمو، وتقييد من الحركة والاستثمار',fs:30,
  items:[['image37'],['image34'],['image33'],['image36'],['image35'],['image32'],['image30'],['image31']]});
/* 10 — geography */
S({n:10,...HS1,cards:[
  ['title',[8,0,4,2],{bg:'dark',k:'مصر قبل 2014',ki:'map-pinned',t:'تحدي جغرافي',fs:48}],
  ['text',[8,2,4,2],{bg:'dark2',t:'تركز الأنشطة الاقتصادية والفرص في عدد محدد من المحافظات، ومناطق لم تستفيد من إمكانيتها',fs:22,pie:0}],
  ['kpi',[4,0,4,3],{bg:'grad',ic:'building-2',l:'من الاستثمار الخاص المحلي متركز في القاهرة والجيزة (1972 – 2020)',v:64,u:'%'}],
  ['kpi',[4,3,4,3],{bg:'dark2',ic:'globe',pre:'أكثر من',l:'من تدفقات الاستثمار الأجنبي المباشر في المشروعات الجديدة توجهت إلى القاهرة والجيزة (1972 – 2020)',v:70,u:'%'}],
  ['kpi',[8,4,4,2],{bg:'mint',ic:'map',l:'من 26 محافظة لديها مقومات كافية من الاستثمار الخاص المحلي',v:9,u:'%'}],
  ['photo',[0,0,4,6],{img:P('image38'),pos:'60% 50%'}],
]});
/* 11 — the vicious circle */
S({n:11,...HS1,cards:[
  ['title',[8,0,4,2],{bg:'dark',k:'رسمت ملامح الاقتصاد المصري قبل 2014',ki:'refresh-ccw',t:'تحديات هيكلية متداخلة تغذي كلها واحدة الأخرى',fs:30}],
  ['cq',[8,2,4,4],{bg:'vio',h:'حلقة مفرغة عانى منها الاقتصاد المصري لعقود',ic:'refresh-ccw',items:[
    {ic:'users',k:'زيادة سكانية متسارعة'},{ic:'gauge',k:'ضغط على الموارد المتاحة'},{ic:'factory',k:'عدم الاستغلال الأمثل للموارد (إنتاجية محدودة)'}]}],
  ['cq',[4,2,4,4],{bg:'dark2',ic:'triangle-alert',items:[
    {ic:'lock',k:'قيود على النشاط الاستثماري'},{ic:'map-pin',k:'تركز التنمية في بعض المدن دون غيرها'},{ic:'shield-alert',k:'تحديات أمنية وسياسية'}]}],
  ['photo',[0,0,4,6],{img:P('image41'),pos:'50% 50%'}],
  ['kin',[4,0,4,2],{words:['السكان','الموارد','الإنتاجية','الاستثمار'],cur:1}],
]});
/* 12 — the economy before 2014 */
S({n:12,...HS1,cards:[
  ['title',[8,0,4,2],{bg:'dark',k:'مصر قبل عام 2014',ki:'trending-down',t:'وقد أفضت هذه التحديات إلى تدهور حاد في الأوضاع الاقتصادية',fs:30}],
  ['text',[8,2,4,2],{bg:'dark2',t:'تجسد في ركود النشاط الإنتاجي، وتفاقم البطالة، وانسحاب الاستثمارات الخاصة، بما أضعف قدرة الاقتصاد على النمو وتوفير فرص العمل.',fs:18,pie:0}],
  ['ft',[4,0,4,2],{bg:'grad',ic:'landmark',l:'احتياطي نقدي (مليار دولار)',a:{v:36,u:''},b:{v:17,u:''}}],
  ['ft',[0,0,4,2],{bg:'dark2',ic:'globe',l:'استثمار أجنبي مباشر (مليار دولار)',a:{v:6.7,u:''},b:{v:3.8,u:''}}],
  ['ft',[4,2,4,2],{bg:'dark2',ic:'trending-down',l:'معدل النمو',a:{v:5.2,u:'%'},b:{v:2.2,u:'%'},pie:0}],
  ['ft',[0,2,4,2],{bg:'vio',ic:'users',l:'معدل البطالة',a:{v:9,u:'%'},b:{v:13.2,u:'%'},pie:0}],
  ['ft',[4,4,4,2],{bg:'mint',ic:'receipt',l:'عجز الموازنة للناتج',a:{v:8.1,u:'%'},b:{v:12,u:'%'},pie:0}],
  ['photo',[8,4,4,2],{img:P('image42'),pos:'50% 50%'}],
  ['photo',[0,4,4,2],{img:P('image41'),pos:'50% 30%'}],
]});
/* 13 — the question */
S({n:13,...HS1,cards:[
  ['title',[2,0,10,4],{bg:'dark',k:'السؤال',ki:'circle-help',t:'كيف يمكن لدولة بهذا الحجم من التحديات أن [[تصنع مستقبلًا مختلفًا]] دون إعادة بناء مقومات التنمية؟',fs:54,pz:0}],
  ['kin',[0,0,2,4],{words:['تحديات','مقومات','مستقبل'],cur:1}],
  ['photo',[0,4,12,2],{img:P('image43'),pos:'50% 50%'}],
]});
