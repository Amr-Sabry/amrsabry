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

/* conference fonts (Amr 14:12, from the client: «عروض المؤتمر — العناوين: Cairo black · الفرعي: Cairo medium»): one family; titles
   and quotes stay Cairo Black, body Cairo Medium, and since 18:05 the weights in between carry the emphasis inside a sentence */
(function(){const st=document.createElement('style');st.textContent=
  /* Amr 18:05 «اوزان الفونت محتاجة تكون متنوعة»: the real Cairo weights in between, so a line can mix Medium connectors,
     SemiBold labels, Bold phrases and ExtraBold titles (600–800 as Arabic + Latin subsets) */
  "@font-face{font-family:'Cairo26';src:url(fonts/cairo-medium.woff2) format('woff2');font-weight:100 549;font-display:block;ascent-override:102%;descent-override:36%;line-gap-override:0%}"+
  [600,700,800].map(w=>['ar','la'].map(k=>`@font-face{font-family:'Cairo26';src:url(fonts/cairo-${k}-${w}.woff2) format('woff2');font-weight:${w-50} ${w+49};font-display:block;ascent-override:102%;descent-override:36%;line-gap-override:0%;unicode-range:${k==='ar'?'U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0898-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC':'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'}}`).join('')).join('')+
  "@font-face{font-family:'Cairo26';src:url(fonts/cairo-black.woff2) format('woff2');font-weight:850 1000;font-display:block;ascent-override:102%;descent-override:36%;line-gap-override:0%}"+
  /* Amr 17:54: numbers in Montserrat across the deck — a face that holds only the figures and their signs, set before Cairo */
  ["500 100 549","600 550 649","700 650 749","800 750 1000"].map(x=>{const [f,a,b]=x.split(' ');return `@font-face{font-family:'C5Num';src:url(fonts/montserrat-${f}.woff2) format('woff2');font-weight:${a} ${b};font-display:block;unicode-range:U+0025,U+002B-002E,U+0030-0039,U+2013}`}).join('')+
  ":root{--f-display:'C5Num','Cairo26','Readex Pro',system-ui,sans-serif!important;--f-body:'C5Num','Cairo26','IBM Plex Sans Arabic',system-ui,sans-serif!important}"+
  "body,.hd,#ui,svg text{font-family:var(--f-display)}";
  document.head.appendChild(st);
  try{[600,700,800].forEach(w=>document.fonts.load(w+" 30px Cairo26","أبجد"));document.fonts.load("900 40px Cairo26","أبجد 2026");document.fonts.load("500 20px Cairo26","أبجد 2026");document.fonts.load("800 40px C5Num","2026");document.fonts.load("500 20px C5Num","2026")}catch(e){}})();

/* ---------- a film card (the deck's own videos; offline: video/c5_*.mp4) ---------- */
/* the control's two preview frames show a film's first frame, silent and still (they share the show's main thread) */
const C5PV=/[?&]preview=1/.test(location.search);
CARD.video=function(c,r){return `<video class="c5v" src="video/${c.src}" ${c.poster?`poster="${IMG(c.poster)}"`:''} playsinline ${C5PV?'muted preload="metadata" data-go="1"':'autoplay preload="auto"'}></video>${c.cap?`<div class="tag">${c.cap}</div>`:''}`+(C5PV?'':LOADER('جاري تحميل الفيديو'))};
/* loader v1 (Amr 15:08: «لو فيه فيديو بيتعرض … لازم يكون فيه لودر بيبين»): a video or a page shown over the stage carries a loader —
   a ring with how much has come in — until it actually plays (and again whenever it stops to wait for data); if the file cannot be
   read, the loader says so instead of spinning on */
function LOADER(t){return `<div class="c5ld on" aria-live="polite"><i class="c5sp"></i><span>${t}</span><b class="c5pc"></b></div>`}
(function(){const st=document.createElement('style');st.textContent=
  '.bc .c5ld{position:absolute;inset:0;z-index:8;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:rgba(14,18,40,.38);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);color:#fff;font:600 20px/1.3 var(--f-body);opacity:0;pointer-events:none;transition:opacity .35s ease}'+
  '.bc .c5ld.on{opacity:1}.bc .c5ld .c5sp{width:64px;height:64px;border-radius:50%;border:5px solid rgba(255,255,255,.25);border-top-color:#fff;animation:c5sp 1s linear infinite}'+
  '.bc .c5ld .c5pc{font:700 16px/1 var(--f-display);opacity:.85;min-height:16px}.bc .c5ld.err .c5sp{animation:none;border-color:rgba(255,255,255,.35)}'+
  '@keyframes c5sp{to{transform:rotate(360deg)}}';document.head.appendChild(st);
  const ld=v=>{const b=v.closest('.bc');return b&&b.querySelector('.c5ld')};
  const pct=v=>{try{const d=v.duration,b=v.buffered;if(!d||!isFinite(d)||!b.length)return '';let e=0;for(let i=0;i<b.length;i++)if(b.start(i)<=v.currentTime+.5)e=Math.max(e,b.end(i));return Math.min(100,Math.round(e/d*100))+'%'}catch(e){return ''}};
  const on=(v,x)=>{const l=ld(v);if(!l)return;l.classList.toggle('on',x);if(x){const p=l.querySelector('.c5pc');if(p)p.textContent=pct(v)}};
  ['playing','canplaythrough'].forEach(ev=>document.addEventListener(ev,e=>{if(e.target.matches&&e.target.matches('video.c5v'))on(e.target,false)},true));
  ['waiting','stalled','loadstart'].forEach(ev=>document.addEventListener(ev,e=>{const v=e.target;if(v.matches&&v.matches('video.c5v')&&!v.ended)on(v,true)},true));
  document.addEventListener('progress',e=>{const v=e.target;if(!(v.matches&&v.matches('video.c5v')))return;const l=ld(v);if(l&&l.classList.contains('on')){const p=l.querySelector('.c5pc');if(p)p.textContent=pct(v)}},true);
  document.addEventListener('error',e=>{const v=e.target;if(!(v.matches&&v.matches('video.c5v')))return;const l=ld(v);if(!l)return;l.classList.add('on','err');l.querySelector('span').textContent='تعذر تحميل الفيديو';l.querySelector('.c5pc').textContent=''},true);
  /* a video already playing from the cache never says «waiting»: check once it is on the slide */
  new MutationObserver(()=>{document.querySelectorAll('video.c5v:not([data-ld])').forEach(v=>{v.dataset.ld=1;if(v.readyState>=3&&!v.paused)on(v,false)})}).observe(document.body,{subtree:true,childList:true});
})();
/* a page shown whole over the stage (slide 2: the interactive opener «قبل البداية 2011–2014», opening/index.html, built by
   mkopening.py from aromahub.studio/opening-2011-2014); previews get its still picture */
CARD.frame=function(c,r){if(C5PV&&c.poster)return `<img class="c5f" src="${IMG(c.poster)}" alt="">`;
  return `<iframe class="c5f" src="${c.src}" allow="autoplay; fullscreen" title="${c.title||''}" onload="var l=this.parentNode.querySelector('.c5ld');if(l)setTimeout(function(){l.classList.remove('on')},250)"></iframe>`+LOADER('جاري التحميل')};
addEventListener('message',e=>{const m=e.data||{};if(m.c5key){document.dispatchEvent(new KeyboardEvent('keydown',{key:m.c5key,code:m.code||'',bubbles:true,cancelable:true}))}});
/* autoplay rules: a film that had to start silent gets its sound at the first touch or key on the show */
['pointerdown','keydown'].forEach(ev=>addEventListener(ev,()=>{if(C5PV)return;document.querySelectorAll('video.c5v').forEach(v=>{if(v.muted&&v.dataset.go){v.muted=false}});
  document.querySelectorAll('iframe.c5f').forEach(f=>{try{f.contentWindow.postMessage({c5film:'sound'},'*')}catch(e){}})},true));
(function(){const st=document.createElement('style');st.textContent=
  '.bc.vcard{padding:0!important;background:#000!important}.bc.vcard>.in{inset:0!important;top:0!important;right:0!important;width:100%!important;height:100%!important;zoom:1!important}'+
  '.bc.vcard video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit}'+
  /* cls:'fit' on a photo shows the whole picture (maps, charts, infographics): nothing cropped */
  '.bc.photo.fit{background:rgba(255,255,255,.62)}.bc.photo.fit img{object-fit:contain!important;transform:none!important;padding:10px;box-sizing:border-box}'+
  '.bc.photo.fit.dk{background:#0e1430}'+
  '.bc.fcard{left:0!important;top:0!important;width:1600px!important;height:900px!important;border-radius:0!important;padding:0!important;background:#e9edf6!important;box-shadow:none!important;border:0!important}'+
  '.bc.fcard>.in{inset:0!important;top:0!important;right:0!important;width:100%!important;height:100%!important;zoom:1!important}.bc.fcard .c5f{position:absolute;inset:0;width:100%;height:100%;border:0;display:block;object-fit:cover}';
  document.head.appendChild(st);
  /* a film plays with sound once the show has been touched; if the browser refuses, it plays muted */
  new MutationObserver(()=>{document.querySelectorAll('video.c5v:not([data-go])').forEach(v=>{v.dataset.go=1;const p=v.play();if(p&&p.catch)p.catch(()=>{v.muted=true;v.play().catch(()=>{})})})})
    .observe(document.documentElement,{childList:true,subtree:true});
  /* leaving the slide stops its film */
  document.addEventListener('visibilitychange',()=>{if(document.hidden)document.querySelectorAll('video.c5v').forEach(v=>v.pause())});
})();
function vid(n,o){S({n,full:1,cards:[['video',[0,0,12,6],Object.assign({cls:'vcard'},o)]]})}

/* year odometer v1 (Amr 17:55, his reference «2025 → 2026»: «من سنة كذا لسنة كذا يكون عدادات بالطريقة دي … في اي حاجة بنحكي فيها عن
   سنين»): a year is a row of digit wheels; when it changes, only the wheels whose digit changes turn, one year at a time, and while a
   wheel turns the digits before and after it show above and below, fading out. odoHTML(y) draws a year at rest; odoRun(el,a,b) turns
   it from a to b. Any element .odo-in with data-from / data-to turns once its card is on screen. */
const ODOC=['#2a3b86','#34499f','#3d5cc0','#ee9873'];
function odoHTML(y){const t=String(y);return t.split('').map((d,i)=>`<span class="odc" style="--oc:${ODOC[Math.min(ODOC.length-1,i+ODOC.length-t.length)]}"><span class="ods"><span>${d}</span></span></span>`).join('')}
function odoRun(el,a,b,o={}){a=+a;b=+b;if(!el||a===b){if(el)el.innerHTML=odoHTML(b);return}
  const dir=b>a?1:-1,n=Math.abs(b-a),t=String(Math.max(a,b)),L=t.length,step=o.step||Math.max(170,Math.min(320,(o.dur||2900)/n));
  el.classList.add('odo');el.innerHTML='';const cols=[];
  for(let k=L-1;k>=0;k--){const p=10**k,seq=[];for(let v=a;dir>0?v<=b:v>=b;v+=dir){const c=Math.floor(v/p);if(seq[seq.length-1]!==c)seq.push(c)}
    const col=document.createElement('span');col.className='odc';col.style.setProperty('--oc',ODOC[Math.min(ODOC.length-1,L-1-k+ODOC.length-L)]);
    const st=document.createElement('span');st.className='ods';[seq[0]-dir,...seq,seq[seq.length-1]+dir].forEach(c=>{const d=document.createElement('span');d.textContent=((c%10)+10)%10;st.appendChild(d)});
    st.style.transition='none';st.style.transform='translateY(-1em)';col.appendChild(st);el.appendChild(col);cols.push({p,seq,st,col})}
  let v=a;el.dataset.y=a;
  const tick=()=>{if(!el.isConnected)return;v+=dir;el.dataset.y=v;
    cols.forEach(c=>{const i=c.seq.indexOf(Math.floor(v/c.p))+1,cur=+c.st.dataset.i||1;if(i!==cur){c.st.dataset.i=i;c.col.classList.add('roll');c.st.style.transition=`transform ${step*.92}ms cubic-bezier(.3,.7,.2,1)`;c.st.style.transform=`translateY(-${i}em)`;
      clearTimeout(c.tm);c.tm=setTimeout(()=>c.col.classList.remove('roll'),step*1.6)}});
    o.onYear&&o.onYear(v);if(v!==b)setTimeout(tick,step);else o.done&&o.done()};
  setTimeout(tick,o.delay??500)}
(function(){const st=document.createElement('style');st.textContent=
  '.odo,.e2y{direction:ltr;unicode-bidi:isolate}'+
  '.odc{box-sizing:content-box;display:inline-block;vertical-align:top;height:1em;line-height:1em;padding:.6em 0;margin:-.6em 0;overflow:hidden;color:var(--oc);'+
  '-webkit-mask-image:linear-gradient(transparent 27.3%,#000 27.3%,#000 72.7%,transparent 72.7%);mask-image:linear-gradient(transparent 27.3%,#000 27.3%,#000 72.7%,transparent 72.7%)}'+
  '.odc.roll{-webkit-mask-image:linear-gradient(transparent 0,rgba(0,0,0,.5) 16%,#000 28%,#000 72%,rgba(0,0,0,.5) 84%,transparent 100%);mask-image:linear-gradient(transparent 0,rgba(0,0,0,.5) 16%,#000 28%,#000 72%,rgba(0,0,0,.5) 84%,transparent 100%)}'+
  '.odc .ods{display:flex;flex-direction:column;will-change:transform}.odc .ods>span{display:block;height:1em;line-height:1em;text-align:center}'+
  '.bc .e2y.odo,.bc .e2y:has(.odc){background:none!important;color:inherit!important;-webkit-text-fill-color:currentColor}';document.head.appendChild(st);
  setInterval(()=>{if(typeof curLayer==='undefined'||!curLayer)return;curLayer.querySelectorAll('.bc:not(.wait) .odo-in:not([data-go])').forEach(e=>{if(e.closest('.slide.enter'))return;e.dataset.go=1;odoRun(e,e.dataset.from,e.dataset.to,{delay:+e.dataset.delay||600})})},100);
})();
/* era infographic v1 (Amr 17:37: «عبر عن مصر قبل ٢٠١٤ بطريقة انفوجرافيك مش نصية»; 17:39: «faded roll للتاريخ بيزيد من ٢٠١٤ … لحد ٢٠٢٣
   واحنا بنكتب التايتل … تدي شعور بالتوالي»): Egypt's outline, the year set large, and a time bar 2011 → 2026 whose marked stretch is
   the period the slide talks about. With from: the year rolls up to y, one year at a time, fading, while the bar's mark slides along.
   cfg: k (the words over the year), y, from, stay (the same card on the next slide stays and glides) */
CARD.era2=function(c,r){const Y0=2011,Y1=2026,y0=c.from||c.y,pos=y=>((y-Y0)/(Y1-Y0)*100).toFixed(2);
  /* Amr 17:59: «مصر تبقى outline والكتابة مش بالأهمية دي … محتاجه انفوجرافيك اكتر من انه تايتل»: Egypt drawn as an outline with
     the Nile, Cairo marked; the words small; the year a wheel counter; the time bar under it */
  let pa='',nl='',cx=0,cy=0,vb='0 0 100 100';
  try{const P=d3.geoMercator().fitSize([100,100],EGY),g=d3.geoPath(P),b=g.bounds(EGY),ln=d3.line();pa=g(EGY);
    nl=(typeof CTXG!=='undefined'&&CTXG.riv?CTXG.riv:[]).map(L=>ln(L.map(P))).join('');const q=P([31.24,30.05]);cx=q[0];cy=q[1];
    vb=`${(b[0][0]-2).toFixed(1)} ${(b[0][1]-2).toFixed(1)} ${(b[1][0]-b[0][0]+4).toFixed(1)} ${(b[1][1]-b[0][1]+4).toFixed(1)}`}catch(e){}
  return `<div class="e2w"><div class="e2row"><div class="e2t"><span class="e2l">${c.k||''}</span><b class="num e2y" data-y="${y0}" data-to="${c.y}"${c.from?` data-from="${c.from}"`:''}>${odoHTML(y0)}</b></div>`+
    `<svg class="e2m" viewBox="${vb}" preserveAspectRatio="xMidYMid meet"><defs><linearGradient id="e2g${c.y}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3d5cc0"/><stop offset=".6" stop-color="#6e7fd6"/><stop offset="1" stop-color="#ee9873"/></linearGradient></defs>`+
    `<path class="e2o" d="${pa}" stroke="url(#e2g${c.y})"/><path class="e2n" d="${nl}"/><circle class="e2c" cx="${cx}" cy="${cy}" r="2.2"/><circle class="e2p" cx="${cx}" cy="${cy}" r="2.2"/></svg></div>`+
    `<div class="e2b" style="--p:${pos(y0)}%;--a:${pos(c.a||Y0)}%"><i class="e2r"></i><i class="e2s"></i><i class="e2d"></i>${Array.from({length:Y1-Y0+1},(_,i)=>`<i class="e2k" style="right:${pos(Y0+i)}%"></i>`).join('')}</div></div>`};
(function(){const st=document.createElement('style');st.textContent=
  /* fluid: the content box follows the card while it glides or resizes, and every size is a share of it */
  '.bc>.in:has(>.e2w){container-type:size;inset:24px 26px!important;width:auto!important;height:auto!important;zoom:1!important}'+
  '.bc .e2w{position:absolute;inset:0;display:flex;flex-direction:column;gap:min(5cqh,14px)}'+
  '.bc .e2row{flex:1 1 auto;min-height:0;display:flex;align-items:center;gap:4cqw}'+
  '.bc .e2t{flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:max(3cqh,.18em)}'+
  '.bc .e2m{flex:0 0 56%;width:56%;min-width:0;height:100%;min-height:0;overflow:visible}'+
  '.bc .e2m .e2o{fill:rgba(61,92,192,.06);stroke-width:1.4;vector-effect:non-scaling-stroke;stroke-linejoin:round}'+
  '.bc .e2m .e2n{fill:none;stroke:#5aa7d6;stroke-width:1.6;vector-effect:non-scaling-stroke;stroke-linecap:round;opacity:.9}'+
  '.bc .e2m .e2c{fill:#ee9873}.bc .e2m .e2p{fill:none;stroke:#ee9873;stroke-width:1.2;vector-effect:non-scaling-stroke;transform-box:fill-box;transform-origin:center;animation:e2p 2.4s ease-out infinite}'+
  '@keyframes e2p{from{transform:scale(1);opacity:.9}to{transform:scale(5);opacity:0}}'+
  '.bc .e2l{font:600 min(10cqh,6.5cqw)/1.1 var(--f-display);color:var(--ink);opacity:.8;transition:opacity .4s;white-space:nowrap}'+
  '.bc .e2y{font-size:min(34cqh,15cqw)!important;font-weight:800;line-height:.9;background:linear-gradient(100deg,#2a3b86 0%,#3d5cc0 45%,#ee9873 100%);-webkit-background-clip:text;background-clip:text;color:transparent;display:inline-block;transition:opacity .16s ease,transform .16s ease}'+
  '.bc .e2y.out{opacity:0;transform:translateY(-28%)}.bc .e2y.pre{opacity:0;transform:translateY(28%);transition:none}'+
  '.bc .e2b{position:relative;flex:none;height:14px}'+
  '.bc .e2b .e2r{position:absolute;left:0;right:0;top:6px;height:2px;background:rgba(28,37,71,.18);border-radius:2px}'+
  '.bc .e2b .e2s{position:absolute;top:4px;height:6px;border-radius:6px;right:var(--a);width:calc(var(--p) - var(--a));background:linear-gradient(90deg,#ee9873,#3d5cc0);transition:width .28s ease}'+
  '.bc .e2b .e2d{position:absolute;top:0;width:14px;height:14px;border-radius:50%;background:#fff;box-shadow:0 0 0 3px #3d5cc0,0 4px 10px -3px rgba(28,37,71,.5);right:calc(var(--p) - 7px);transition:right .28s ease}'+
  '.bc .e2b .e2k{position:absolute;top:3px;width:1px;height:8px;background:rgba(28,37,71,.25)}';document.head.appendChild(st);
  /* the roll: starts once the card is on screen, one year about every 270 ms, the bar's mark keeping pace */
  const roll=b=>{b.dataset.go=1;const to=+b.dataset.to,y=+(b.dataset.from||b.dataset.prev);if(!y||y===to)return;const bar=b.closest('.bc').querySelector('.e2b');
    if(bar)bar.style.setProperty('--p',((y-2011)/15*100).toFixed(2)+'%');
    odoRun(b,y,to,{delay:500,dur:2900,onYear:v=>{if(bar)bar.style.setProperty('--p',((v-2011)/15*100).toFixed(2)+'%')}})};
  /* while a staying card glides in, note the year it showed on the slide before (its old content rides along in .opold) */
  setInterval(()=>{if(typeof curLayer==='undefined'||!curLayer)return;
    curLayer.querySelectorAll('.bc .opold .e2y').forEach(o=>{const n=o.closest('.bc').querySelector(':scope>.in .e2y');if(n&&!n.dataset.prev&&!n.dataset.go)n.dataset.prev=o.dataset.y||o.textContent.trim()});
    curLayer.querySelectorAll('.bc:not(.wait) .e2y:not([data-go])').forEach(b=>{if(!b.closest('.slide.enter')&&(b.dataset.from||b.dataset.prev))roll(b)})},100);
})();
/* infographic pieces (Amr 17:41: «الكلام الشرح يكون بطريقة انفوجرافيك بنتوجريد كارت»): the challenge's sentence cut, in its own
   words and order, into pieces — each piece a small card with an icon (ibox), or one card of icon chips (ilist) */
CARD.ibox=function(c,r){const W=r.w-52,H=r.h-48,is=Math.round(Math.min(64,H*.36,W*.2)),f=c.fs||Math.round(Math.min(38,Math.max(20,Math.sqrt(W*(H-is-14)/Math.max(8,String(c.t).replace(/<[^>]+>/g,'').length))*.62)));
  return `<span class="ibi" style="width:${is}px;height:${is}px">${ICON(c.ic||'circle',Math.round(is*.52))}</span><div class="ibt" style="font-size:${f}px">${hl(c.t)}</div>`};
CARD.ilist=function(c,r){return (c.h?`<div class="kick">${c.ki?ICON(c.ki,20):''}${hl(c.h)}</div>`:'')+`<div class="ilw">`+c.items.map(([ic,t])=>`<div class="ili"><span class="ibi">${ICON(ic,24)}</span><b>${hl(t)}</b></div>`).join('')+`</div>`+(c.foot?`<div class="ilf">${ICON('arrow-left',18)}<span>${hl(c.foot)}</span></div>`:'')};
(function(){const st=document.createElement('style');st.textContent=
  '.bc .ibi{display:grid;place-items:center;border-radius:50%;background:rgba(61,92,192,.12);box-shadow:inset 0 0 0 1.5px rgba(61,92,192,.35);color:#3d5cc0;flex:none}'+
  '.bc.grad .ibi,.bc.mint .ibi,.bc.vio .ibi{background:rgba(255,255,255,.18);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.5);color:#fff}'+
  '.bc .ibt{margin-top:auto;font-family:var(--f-display);font-weight:700;line-height:1.3;color:var(--ink)}.bc.grad .ibt,.bc.mint .ibt,.bc.vio .ibt{color:#fff}'+
  '.bc .ilw{flex:1 1 auto;display:flex;flex-direction:column;justify-content:center;gap:10px;margin:8px 0}'+
  '.bc .ili{display:flex;align-items:center;gap:12px}.bc .ili .ibi{width:44px;height:44px}.bc .ili b{font:700 21px/1.3 var(--f-display);color:var(--ink)}'+
  '.bc .ilf{display:flex;align-items:flex-start;gap:8px;font:600 17px/1.45 var(--f-body);color:var(--ink);opacity:.9}.bc .ilf svg{flex:none;margin-top:3px;color:#ee9873}';document.head.appendChild(st)})();
/* figure + sentence, the sentence set large as pills (Amr 17:47, slide 9 of the show: «سرد الكلام اللي في الكروت فيها النسب ضعيف … يكبر
   ويبان للعين … الهاي لايت على الارقام كانها تاجز ودخول الايقونات المعبرة عن الكلام واظهار الكلمات المهمة»): numbers become tags,
   an icon pill stands beside the words it is about, [[…]] marks the key words */
CARD.kpip=function(c,r){const W=r.w-52,H=r.h-48,wide=W>540,fs=c.fs||Math.round(wide?Math.min(H*.46,W*.15,110):Math.min(H*.34,W*.22,90)),lf=c.lfs||Math.round(wide?Math.max(21,Math.min(27,H*.13)):Math.max(19,Math.min(24,H*.11)));
  const fig=`<div class="kpf">${c.pre?`<div class="kpre">${hl(c.pre)}</div>`:''}${c.u==='%'?`<div class="k2p">${pieSVG(c.v,fs*.95)}${bigNum(c.v,c.u,fs)}</div>`:bigNum(c.v,c.u,fs)}</div>`;
  const txt=`<div class="kps pz" style="font-size:${lf}px">${pill(c.l,{maxI:c.maxI??2,noArrow:1})}</div>`;
  return `<div class="hdr">${ICON(c.ic||'hash',26)}</div><div class="kpw${wide?' wide':''}">${fig}${txt}</div>`};
(function(){const st=document.createElement('style');st.textContent=
  '.bc .kpw{flex:1 1 auto;display:flex;flex-direction:column;justify-content:flex-end;gap:10px;min-height:0}'+
  '.bc .kpw.wide{flex-direction:row;align-items:center;gap:22px}.bc .kpw.wide .kpf{flex:none}.bc .kpw.wide .kps{flex:1 1 auto}'+
  '.bc .kps{font-family:var(--f-display);font-weight:600;line-height:1.55;color:var(--ink)}.bc.grad .kps,.bc.mint .kps,.bc.vio .kps{color:#fff}'+
  '.bc .kpf .kpre{font:700 20px/1.2 var(--f-display);margin-bottom:4px}';document.head.appendChild(st)})();
/* collage pieces (Amr 17:34, slide 3: «الاجابة تايب رايت مع الصورة وبيحصل هاي لايت على كل قطعة فيه بشكل عشوائي»): the Egypt collage
   shown whole; one of its pieces at a time, picked at random, lifts and lights up while the rest dims (pieces cut by cutpieces in
   the scratchpad: img/c5/p10/N.webp, rects in % of the picture) */
const P10=[[6.479, 3.086, 56.707, 26.939], [58.232, 5.922, 34.604, 47.373], [6.326, 26.272, 64.787, 18.682], [5.183, 40.867, 29.268, 21.852], [32.088, 42.619, 24.771, 20.434], [55.488, 42.702, 26.296, 20.434], [4.421, 59.133, 84.985, 20.684], [1.677, 72.227, 32.088, 25.855], [64.482, 74.562, 34.375, 24.02], [32.851, 76.063, 33.765, 22.519]];
CARD.pieces=function(c,r){const W=r.w-8,H=r.h-12,ar=c.ar||1312/1199,bw=Math.min(W,H*ar),bh=bw/ar;
  return `<div class="pcs" style="width:${bw.toFixed(1)}px;height:${bh.toFixed(1)}px"><img class="pcb" src="${IMG(c.img)}" alt="">`+
    c.parts.map((q,i)=>`<img class="pcp" src="img/${c.dir}/${i}.webp" alt="" style="left:${q[0]}%;top:${q[1]}%;width:${q[2]}%;height:${q[3]}%">`).join('')+`</div>`};
(function(){const st=document.createElement('style');st.textContent=
  '.bc .pcs{position:relative;margin:auto}.bc .pcs img{position:absolute;display:block}.bc .pcs .pcb{inset:0;width:100%;height:100%;transition:filter .7s ease}'+
  '.bc .pcs.hl .pcb{filter:brightness(.42) saturate(.55) blur(.6px)}'+
  '.bc .pcs .pcp{opacity:0;transform:scale(1);transition:opacity .55s ease,transform .7s cubic-bezier(.16,1,.3,1),filter .7s ease;filter:drop-shadow(0 0 0 rgba(255,255,255,0))}'+
  '.bc .pcs .pcp.on{opacity:1;transform:scale(1.07);filter:brightness(1.08) saturate(1.1) drop-shadow(0 0 1.5px #fff) drop-shadow(0 0 1.5px #fff) drop-shadow(0 16px 30px rgba(14,18,40,.55))}';document.head.appendChild(st);
  setInterval(()=>{if(typeof curLayer==='undefined'||!curLayer)return;curLayer.querySelectorAll('.bc:not(.wait) .pcs').forEach(w=>{
    const ps=[...w.querySelectorAll('.pcp')];if(!ps.length)return;let j;do{j=Math.floor(Math.random()*ps.length)}while(ps.length>1&&j===w._last);w._last=j;
    w.classList.add('hl');ps.forEach((p,k)=>p.classList.toggle('on',k===j))})},1700);
})();
/* builds on a full slide (cfg seq): the slide still has no header, but its cards come in steps like any other */
(function(){const P0=plan;window.plan=function(sp){if(sp&&sp.full&&sp.seq&&!sp._plan){const f=sp.full;sp.full=0;try{return P0(sp)}finally{sp.full=f}}return P0(sp)}})();
/* infographic cards v2 (Amr 18:01: «تقرا الكلام وتشوف الكارت ممكن يتعبر عنه ازاي … حلول انفوجرافيك بصريا مبهرة»): each card draws what
   its sentence says; the words stay, small, as the caption. All sizes are shares of the card (container units), so a card that glides
   or resizes keeps its drawing whole. */
const cqIn=c=>`.bc>.in:has(>.${c}){container-type:size;inset:24px 26px!important;width:auto!important;height:auto!important;zoom:1!important}`;
/* «زيادة سكانية متسارعة»: rows of people filling in, faster and faster */
CARD.popx=function(c,r){const N=c.n||40,T=c.dur||2600;
  return `<div class="pxw"><div class="pxg">`+Array.from({length:N},(_,i)=>`<span style="--d:${Math.round(T*Math.sqrt(i/N))}ms">${ICON('user-round',20)}</span>`).join('')+
    `</div><div class="pxa">${ICON('trending-up',22)}</div><div class="pxc">${hl(c.t)}</div></div>`};
/* «تركزها في نطاق جغرافي محدود .. لا يتجاوز 7% من إجمالي المساحة»: Egypt as an outline, only the Nile valley and delta lit; the share as a split bar */
CARD.share=function(c,r){let pa='',zs='',vb='0 0 100 100';
  try{const P=d3.geoMercator().fitSize([100,100],EGY),g=d3.geoPath(P),b=g.bounds(EGY);pa=g(EGY);zs=ZONES.filter(z=>z.t==='valley').map(z=>g(z.g)).join('');
    vb=`${(b[0][0]-2).toFixed(1)} ${(b[0][1]-2).toFixed(1)} ${(b[1][0]-b[0][0]+4).toFixed(1)} ${(b[1][1]-b[0][1]+4).toFixed(1)}`}catch(e){}
  return `<div class="shw"><div class="shl">${hl(c.l)}</div><div class="shrow">`+
    `<svg class="shm" viewBox="${vb}" preserveAspectRatio="xMidYMid meet"><defs><pattern id="shh" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="3" stroke="rgba(255,255,255,.18)" stroke-width="1"/></pattern>`+
    `<linearGradient id="shv" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffd7bd"/><stop offset="1" stop-color="#ffffff"/></linearGradient><clipPath id="shc"><rect class="shr" x="-10" y="-10" width="140" height="140"/></clipPath></defs>`+
    `<path d="${pa}" fill="url(#shh)" stroke="rgba(255,255,255,.75)" stroke-width="1.2" vector-effect="non-scaling-stroke"/><g clip-path="url(#shc)"><path class="shz" d="${zs}" fill="url(#shv)"/></g></svg>`+
    `<div class="shn">${bigNum(c.v,c.u,10)}<div class="shs">${hl(c.sub||'')}</div><div class="shb"><i style="width:${c.v}%"></i></div></div></div></div>`};
/* «تحديات اقتصادية واجتماعية عانت منها الدولة المصرية لعقود»: two layers piling up over the decades */
CARD.accum=function(c,r){const L=c.layers||[],n=8,W=100,H=40;
  const band=(lo,hi)=>{const top=[],bot=[];for(let i=0;i<=n;i++){const x=W-i*W/n,t=i/n;top.push([x,H-(lo+(hi-lo)*Math.pow(t,1.35))*H]);bot.push([x,H-lo*H*Math.pow(t,1.35)])}
    return 'M'+top.map(p=>p.map(v=>v.toFixed(1)).join(' ')).join('L')+'L'+bot.reverse().map(p=>p.map(v=>v.toFixed(1)).join(' ')).join('L')+'Z'};
  return `<div class="acw"><svg class="acs" viewBox="0 -2 100 44" preserveAspectRatio="none"><defs><clipPath id="acc"><rect class="acr" x="0" y="-5" width="100" height="50"/></clipPath></defs><g clip-path="url(#acc)">`+
    `<path d="${band(0,.42)}" class="ac1"/><path d="${band(.42,.86)}" class="ac2"/></g>`+Array.from({length:n+1},(_,i)=>`<line x1="${100-i*100/n}" x2="${100-i*100/n}" y1="40" y2="42" class="act"/>`).join('')+`<line x1="0" x2="100" y1="40" y2="40" class="act"/></svg>`+
    `<div class="acl">${L.map((t,i)=>`<span class="ac${i+1}t">${hl(t)}</span>`).join('')}</div><div class="acc">${hl(c.t)}</div></div>`};
(function(){const st=document.createElement('style');st.textContent=cqIn('pxw')+cqIn('shw')+cqIn('acw')+
  /* people */
  '.bc .pxw{position:absolute;inset:0;display:grid;grid-template-rows:1fr auto;grid-template-columns:1fr auto;gap:2cqh 3cqw}'+
  '.bc .pxg{grid-column:1/-1;display:grid;grid-template-columns:repeat(10,1fr);align-content:center;gap:2.4cqh 1cqw;color:#3d5cc0}'+
  '.bc .pxg span{display:grid;place-items:center;opacity:0;transform:translateY(30%) scale(.6);transition:opacity .35s ease var(--d),transform .5s cubic-bezier(.2,1.4,.4,1) var(--d)}.bc .pxg svg{width:min(14cqh,7.5cqw);height:min(14cqh,7.5cqw);stroke-width:2.2}'+
  '.bc.go .pxg span{opacity:1;transform:none}.bc .pxg span:nth-child(n+21){color:#ee9873}'+
  '.bc .pxc{font:700 min(15cqh,7.5cqw)/1.25 var(--f-display);color:var(--ink);align-self:end}.bc .pxa{align-self:end;color:#ee9873}.bc .pxa svg{width:min(16cqh,9cqw);height:min(16cqh,9cqw)}'+
  /* share map */
  '.bc .shw{position:absolute;inset:0;display:flex;flex-direction:column;gap:2cqh;color:#fff}'+
  '.bc .shl{font:600 min(5.2cqh,4.4cqw)/1.4 var(--f-body);opacity:.95}'+
  '.bc .shrow{flex:1 1 0;min-height:0;display:flex;align-items:center;gap:3cqw}'+
  '.bc .shm{flex:0 0 58%;width:58%;min-width:0;height:100%;filter:drop-shadow(0 8px 18px rgba(14,18,40,.25))}'+
  '.bc .shm .shz{filter:drop-shadow(0 0 2px #fff)}.bc .shm .shr{transform:translateY(140px);transition:transform 2.2s cubic-bezier(.16,1,.3,1) .3s}.bc.go .shm .shr{transform:none}'+
  '.bc .shn{flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:1.4cqh}.bc .shn .num{font-size:min(30cqh,22cqw)!important;color:#fff;line-height:.9}'+
  '.bc .shs{font:600 min(5.4cqh,4.6cqw)/1.3 var(--f-body);opacity:.95}'+
  '.bc .shb{height:min(3.4cqh,12px);border-radius:99px;background:rgba(255,255,255,.22);overflow:hidden;display:flex;justify-content:flex-start}'+
  '.bc .shb i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#ffffff,#ffd7bd);transform-origin:right;transform:scaleX(0);transition:transform 1.4s cubic-bezier(.16,1,.3,1) 1.2s}.bc.go .shb i{transform:none}'+
  /* decades piling up */
  '.bc .acw{position:absolute;inset:0;display:grid;grid-template-rows:minmax(0,1fr) auto auto;gap:1.6cqh}'+
  '.bc .acs{width:100%;height:100%;min-height:0;overflow:visible}.bc .acs .ac1{fill:#3d5cc0;opacity:.85}.bc .acs .ac2{fill:#ee9873;opacity:.85}.bc .acs .act{stroke:rgba(28,37,71,.3);stroke-width:1;vector-effect:non-scaling-stroke}'+
  '.bc .acs .acr{transform-box:fill-box;transform-origin:right;transform:scaleX(0);transition:transform 2.4s cubic-bezier(.4,0,.2,1) .3s}.bc.go .acs .acr{transform:none}'+
  '.bc .acl{display:flex;gap:3cqw;font:700 min(8cqh,5cqw)/1 var(--f-display)}.bc .acl span{display:inline-flex;align-items:center;gap:.4em}.bc .acl span::before{content:"";width:.7em;height:.7em;border-radius:3px;background:currentColor}'+
  '.bc .acl .ac1t{color:#3d5cc0}.bc .acl .ac2t{color:#ee9873}'+
  '.bc .acc{font:600 min(6.6cqh,4.2cqw)/1.4 var(--f-body);color:var(--ink)}';document.head.appendChild(st)})();
/* typewriter for a title (tw:1): its words write in, as on the quote cards */
(function(){const T=CARD.title;CARD.title=function(c,r){const h=T(c,r);return c.tw?h.replace('class="ttl1','class="qt ttl1'):h}})();
/* «مصر قبل 2014» set large and in colour at the top of a title card (Amr 13:06, slide 6: «محتاجه تكبر وتكون ملفتة بصريا»):
   title cfg era:['مصر قبل','2014'] */
(function(){const T=CARD.title;CARD.title=function(c,r){if(!c.era)return T(c,r);
  const f=Math.round(r.h>420?150:Math.min(104,r.h*.4));
  return `<div class="era" style="--ef:${f}px"><span>${c.era[0]}</span><b class="num">${c.era[1]}</b></div>`+T(c,r).replace('margin-top:auto','margin-top:auto')};
  const st=document.createElement('style');st.textContent=
   '.era{display:flex;align-items:baseline;gap:.22em;flex-wrap:nowrap;margin:2px 0 6px}'+
   '.era span{font:600 calc(var(--ef)*.36)/1 var(--f-display);color:var(--ink);white-space:nowrap}'+
   '.era b.num{font-size:var(--ef);font-weight:700;line-height:.86;background:linear-gradient(100deg,#2a3b86 0%,#3d5cc0 45%,#ee9873 100%);-webkit-background-clip:text;background-clip:text;color:transparent;padding-bottom:.04em}'+
   '.era+.kick{font-size:24px;font-weight:600;color:var(--ink);margin-top:4px}.era+.kick svg{width:24px;height:24px}'+
   '.bc.grad .era span,.bc.vio .era span{color:#fff}.bc.grad .era b.num{background:linear-gradient(100deg,#ffffff,#fbd5bb);-webkit-background-clip:text;background-clip:text}';
  document.head.appendChild(st)})();

/* a cycle: the items sit on a ring around the centre sentence, joined by arrows that keep turning (slide 11) */
/* photo pan v1 (Amr 14:47: «اي صورة جوة كارت اعمل ليها انيمشن يمين وشمال او فوق وتحت … لووب عشان ما يبقاش ال crop ماثر»): a photo
   cropped by its card glides slowly from one edge of the picture to the other and back, along the side that is cut, so in time all
   of it is seen; the speed follows how much is hidden; photos shown whole («fit») stay still */
(function(){const st=document.createElement('style');st.textContent=
  '@keyframes panx{from{object-position:0% var(--py,50%)}to{object-position:100% var(--py,50%)}}'+
  '@keyframes pany{from{object-position:var(--px,50%) 0%}to{object-position:var(--px,50%) 100%}}'+
  '.bc.photo img.panx,.bc.photo img.pany{animation-duration:var(--pd,18s)!important;animation-timing-function:ease-in-out!important;animation-iteration-count:infinite!important;animation-direction:alternate!important}';
  document.head.appendChild(st);
  window.panFit=function(el){el.querySelectorAll('figure img').forEach(img=>{if(img.closest('.bax')||el.classList.contains('mapimg'))return;
    const go=()=>{const iw=img.naturalWidth,ih=img.naturalHeight,cw=img.clientWidth,ch=img.clientHeight;if(!iw||!cw||!ch)return;
      img.classList.remove('panx','pany');if(getComputedStyle(img).objectFit==='contain'||RM)return;
      const ri=iw/ih,rc=cw/ch,pos=(img.style.objectPosition||'50% 50%').split(' ').map(v=>parseFloat(v));
      if(ri>rc*1.04){const hid=ch*ri-cw,D=Math.max(9,Math.min(28,hid/26));img.style.setProperty('--pd',D+'s');img.style.setProperty('--py',(pos[1]??50)+'%');img.style.animationDelay=(-(pos[0]??50)/100*D)+'s';img.classList.add('panx')}
      else if(ri<rc/1.04){const hid=cw/ri-ch,D=Math.max(9,Math.min(28,hid/26));img.style.setProperty('--pd',D+'s');img.style.setProperty('--px',(pos[0]??50)+'%');img.style.animationDelay=(-(pos[1]??50)/100*D)+'s';img.classList.add('pany')}};
    img.complete?go():img.addEventListener('load',go,{once:true})})};
})();
/* hall contrast (QA): the small labels on the teal and gradient cards were pale white at 16px; full white, a touch heavier */
(function(){const st=document.createElement('style');st.textContent='.bc.mint .lab,.bc.mint .sub,.bc.mint .para,.bc.grad .lab,.bc.grad .sub,.bc.grad .para,.bc.grad .pre,.bc.grad .cu{opacity:.96!important;font-weight:500}';document.head.appendChild(st)})();
/* logo hd v1 (Amr 17:31: «الكواليتي بتاع اللوجو وحش قوي … تشيل منه التاريخ»): the forum's logo cards use a clean redraw without
   the «2026» line — the words traced to vector, the symbol rebuilt at 3x with smooth edges (img/logo-hd.svg) */
(function(){const L0=CARD.logo;CARD.logo=function(c,r){const h=L0.call(this,c,r);return c.img==='logo'?h.replace(/src="[^"]*"/,'src="img/logo-hd.svg"'):h}})();
(function(){const st=document.createElement('style');st.textContent='#stage .bc:has(>.in img[src$="img/logo-hd.svg"]),#stage .bc:has(>img[src$="img/logo-hd.svg"]){background:var(--g-cobalt);color:#fff}';document.head.appendChild(st)})();
/* map names stay on their map while its card resizes (Amr 14:53): the route map's names sit in an html layer measured from the
   card's left edge, but in this right-to-left page the map picture itself hung from the right edge, so on every resize the two
   drifted apart until the map was redrawn; both now hang from the left edge */
(function(){const st=document.createElement('style');st.textContent='.bc.mapc svg.rtm{left:0!important;right:auto!important}';document.head.appendChild(st)})();
/* one measure, before and after, side by side in one card (Amr 14:34: «المقارنة تكون كل حاجة جمب بعضها على حسب البند … خلي دايما
   ده اسلوبك»): قبل 2014 on the right, 2026 on the left in its own colour, an arrow between; the measure's name once on top when
   both sides share it (the rest of each label stays under its own figure); several measures in one card stack as rows */
CARD.cmp=function(c,r){const rows=c.rows||[{a:c.a,b:c.b}],n=rows.length;
  const sp=l=>String(l||'').split(/<br\s*\/?>/i), one=n===1;
  const E={v:'',u:'',l:''};
  const R=rows.map(x0=>{const x={a:x0.a||null,b:x0.b||null,name:x0.name},A=sp((x.a||E).l),B=sp((x.b||E).l),sh=x.a&&x.b&&A.length>1&&B.length>1&&A[0].trim()===B[0].trim()||(A.length===1&&B.length===1&&A[0].trim()===B[0].trim()&&A[0].trim()!=='');
    return {a:x.a,b:x.b,name:sh?A[0].trim():(x.name||''),na:(sh?A.slice(1):A).join('<br>'),nb:(sh?B.slice(1):B).join('<br>')}});      /* a side the client gives no figure for stays out: the other spans the row */
  const head=c.h||(one&&R[0].name)||'', aw=(r.w-52-56)/2, ah=(r.h-48-(head?52:0)-(one?0:n*30))/n;
  const fs=c.fs||Math.round(Math.min(ah*(one?.36:.42),aw*.3,one?120:84));
  const fig=(x,note,cls)=>`<div class="cmpc ${cls}"><span class="cmpk">${ICON(cls==='a'?'history':'trending-up',17)}${cls==='a'?(c.ya||'قبل 2014'):(c.yb||'2026')}</span>`+
    `<div class="cmpv">${x.u==='%'?`<div class="k2p">${pieSVG(x.v,fs*.95,cls==='a'?'then':'')}${bigNum(x.v,x.u,fs)}</div>`:bigNum(x.v,x.u,fs)}</div>`+
    (note?`<div class="sub cmps">${hl(note)}</div>`:'')+`</div>`;
  return (head?`<div class="hdr cmph">${ICON(c.ic||'git-compare-arrows',27)}<span class="lab">${hl(head)}</span></div>`:'')+
    `<div class="cmpw">`+R.map(x=>(!one&&x.name?`<div class="cmpn">${hl(x.name)}</div>`:'')+
      `<div class="cmpr${x.a&&x.b?'':' one'}">${x.a?fig(x.a,x.na,'a'):''}${x.a&&x.b?`<span class="cmpx">${ICON('arrow-left',30)}</span>`:''}${x.b?fig(x.b,x.nb,'b'):''}</div>`).join('')+`</div>`+
    (c.foot?`<div class="sub cmpf">${hl(c.foot)}</div>`:'')};
(function(){const st=document.createElement('style');st.textContent=
  '.bc .cmpw{flex:1 1 auto;display:flex;flex-direction:column;justify-content:center;gap:12px;min-height:0}'+
  '.bc .cmpn{font:700 19px/1.3 var(--f-display);color:var(--ink);margin-bottom:-4px}'+
  '.bc .cmpr{flex:1 1 0;min-height:0;display:grid;grid-template-columns:1fr auto 1fr;align-items:stretch;gap:12px}'+
  '.bc .cmpc{display:flex;flex-direction:column;justify-content:center;gap:6px;padding:14px 18px;border-radius:18px;min-width:0}'+
  '.bc .cmpc.a{background:rgba(28,37,71,.05);box-shadow:inset 0 0 0 1px rgba(28,37,71,.08)}'+
  '.bc .cmpc.b{background:linear-gradient(150deg,#2b7890 0%,#3f93aa 55%,#6cb1c4 100%);color:#fff;box-shadow:0 18px 34px -22px rgba(31,104,128,.85)}'+
  '.bc .cmpc.b .num,.bc .cmpc.b .sub,.bc .cmpc.b .cmpk{color:#fff}.bc .cmpc.b .sub{opacity:.9}.bc .cmpc.b .pie .pt{fill:rgba(255,255,255,.18)}.bc .cmpc.b .pie .pr{stroke:rgba(255,255,255,.5)}.bc .cmpc.b .pie .ps{stroke:#fff}'+
  '.bc .cmpc.a .num{color:var(--ink)}'+
  '.bc .cmpk{display:inline-flex;align-items:center;gap:6px;font:600 15px/1 var(--f-body);color:var(--mute)}'+
  '.bc .cmpx{align-self:center;color:#3f93aa;display:grid;place-items:center}'+
  '.bc .cmps{font-size:15.5px;line-height:1.45}.bc .cmph .lab{font:700 24px/1.25 var(--f-display);color:var(--ink);opacity:1}'+
  '.bc .cmpr.one{grid-template-columns:1fr}.bc .cmpf{margin-top:10px;font-size:16px;line-height:1.45}';
  document.head.appendChild(st)})();
CARD.cycle=function(c,r){const W=r.w-52,H=r.h-48,n=c.items.length,cx=W/2,cy=H/2,rx=W*.37,ry=H*.36;
  const P=c.items.map((it,i)=>{const a=-Math.PI/2-i*2*Math.PI/n;return {x:cx+rx*Math.cos(a),y:cy+ry*Math.sin(a),ic:it[0],t:it[1]}});
  const arc=(a0,a1)=>{const p=t=>[cx+rx*Math.cos(t),cy+ry*Math.sin(t)],[x0,y0]=p(a0),[x1,y1]=p(a1);return `M${x0.toFixed(1)} ${y0.toFixed(1)}A${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 0 ${x1.toFixed(1)} ${y1.toFixed(1)}`};
  const step=2*Math.PI/n, gap=step*.3;
  const arcs=P.map((_,i)=>{const a=-Math.PI/2-i*step;return `<path class="cya" d="${arc(a-gap,a-step+gap)}" marker-end="url(#cyh)"/>`}).join('');
  const bw=Math.min(240,W*.27);
  return `<svg class="cys" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><marker id="cyh" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#3d5cc0"/></marker></defs>${arcs}</svg>`+
    `<div class="cyc" style="left:${cx}px;top:${cy}px;width:${rx*1.05}px">${ICON('refresh-ccw',34)}<b>${hl(c.c)}</b></div>`+
    P.map((p,i)=>`<div class="cyi" style="left:${p.x.toFixed(1)}px;top:${p.y.toFixed(1)}px;width:${bw}px;--i:${i}"><span class="cyr">${ICON(p.ic,24)}</span><span class="cyt">${p.t}</span></div>`).join('')};
(function(){const st=document.createElement('style');st.textContent=
  '.bc .cys{position:absolute;inset:0;overflow:visible}.bc .cya{fill:none;stroke:#3d5cc0;stroke-width:3;stroke-dasharray:7 7;animation:cyd 1.6s linear infinite;opacity:.75}'+
  '@keyframes cyd{to{stroke-dashoffset:-28}}'+
  '.bc .cyc{position:absolute;transform:translate(-50%,-50%);text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px;color:var(--ink)}'+
  '.bc .cyc svg{color:#3d5cc0;animation:cyr 9s linear infinite}@keyframes cyr{to{transform:rotate(-360deg)}}'+
  '.bc .cyc b{font:700 25px/1.35 var(--f-display)}'+
  '.bc .cyi{position:absolute;transform:translate(-50%,-50%);display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:18px;background:rgba(255,255,255,.86);box-shadow:inset 0 1px 0 #fff,0 14px 30px -18px rgba(28,37,71,.5);direction:rtl}'+
  '.bc .cyr{flex:none;width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(150deg,#2840a5,#6a82e0);color:#fff}'+
  '.bc .cyr svg{width:22px;height:22px}.bc .cyt{font:600 18px/1.3 var(--f-display);color:var(--ink)}'+
  '.bc.photo.fit.clear{background:transparent!important;box-shadow:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}.bc.photo.fit.clear img{padding:0}';
  document.head.appendChild(st)})();

/* sound relay v1 (Amr 13:23: «سلايد اتنين الصوت لازم يشتغل اوتوماتيك»): browsers keep a page silent until it has been clicked.
   The film reports its clock here; this window passes it to the control window, which has been clicked and so may play sound,
   and the control plays the score in step with the film. If the film can play its own sound, the control stays quiet. */
if(!C5PV)(function(){let bc=null;const ns=(new URLSearchParams(location.search).get('ns')||'').replace(/[^a-z0-9_-]/gi,'');
  try{bc=new BroadcastChannel('c5-film'+(ns?'~'+ns:''))}catch(e){}if(!bc)return;
  const src=new URL('opening/score.mp3',document.baseURI).href;let last=0;
  bc.onmessage=e=>{const m=e.data||{};if(m.c5ctl==='relaying')document.querySelectorAll('iframe.c5f').forEach(f=>{try{f.contentWindow.postMessage({c5film:'relay',on:!!m.on},'*')}catch(_){}})};
  addEventListener('message',e=>{const m=e.data||{};if(m.c5film!=='state')return;last=Date.now();
    bc.postMessage({c5film:1,t:m.t,playing:m.playing,own:m.own,muted:m.muted,at:Date.now(),src})});
  setInterval(()=>{if(last&&(Date.now()-last>700||!document.querySelector('.slide:not(.out) iframe.c5f'))){last=0;bc.postMessage({c5film:1,playing:false,gone:true,at:Date.now(),src})}},300);
})();

/* jump v1 on the show (Amr 13:15: «امكانيه ادخال رقم السلايد او زرار من البداية»): type a slide number and Enter, as in PowerPoint,
   or use «من البداية» / the box in the bar at the bottom (it shows with the mouse); Home also goes to the first slide */
if(!C5PV)addEventListener('DOMContentLoaded',()=>{const ui=document.getElementById('ui');if(!ui)return;
  const st=document.createElement('style');st.textContent='#ui .jf{all:unset;cursor:pointer;font:600 13.5px var(--f-display);color:var(--ink);padding:0 12px;height:38px;display:flex;align-items:center;gap:6px;border-radius:999px;white-space:nowrap}#ui .jf:hover{background:rgba(255,255,255,.72)}#ui .jf svg{width:16px;height:16px}'+
    '#ui .jn{all:unset;width:58px;height:30px;border-radius:999px;background:rgba(28,37,71,.07);box-shadow:inset 0 0 0 1px rgba(28,37,71,.14);text-align:center;font:600 15px var(--f-display);color:var(--ink);font-variant-numeric:tabular-nums;margin:0 4px}#ui .jn::placeholder{color:rgba(28,37,71,.42);font-size:12.5px}#ui .jn:focus{box-shadow:inset 0 0 0 2px var(--cobalt,#3d5cc0)}';
  document.head.appendChild(st);
  const b=document.createElement('button');b.type='button';b.className='jf';b.title='من أول سلايد (Home)';b.innerHTML=ICON('rotate-ccw',16)+'من البداية';
  const inp=document.createElement('input');inp.className='jn';inp.type='text';inp.inputMode='numeric';inp.placeholder='رقم';inp.setAttribute('aria-label','رقم السلايد');
  ui.insertBefore(inp,ui.firstChild);ui.insertBefore(b,ui.firstChild);
  const wk=()=>{try{wake()}catch(e){}};
  const jump=v=>{const k=parseInt(String(v).replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c)),10),n=ORDER[k-1];inp.value='';inp.blur();if(n!=null&&n!==cur)show(n,n>cur?1:-1)};      /* by its place in the show, as the counter shows it */
  b.onclick=e=>{e.stopPropagation();show(ORDER[0],-1)};
  inp.addEventListener('click',e=>e.stopPropagation());
  inp.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();jump(inp.value)}else if(e.key==='Escape'){inp.value='';inp.blur()}});
  /* digits typed anywhere on the show go into the box */
  addEventListener('keydown',e=>{if(e.target===inp||e.metaKey||e.ctrlKey||e.altKey)return;if(/^[0-9٠-٩]$/.test(e.key)){e.preventDefault();e.stopImmediatePropagation();wk();inp.focus();inp.value=(inp.value+e.key).slice(-3)}},true);
});

/* live build (Amr, 20 Oct 12:41: «الابديت يكون لايف قدامي»): while the deck is being built, the page looks at src/c5/live.js
   every 3 s and, when a newer version has landed, reloads itself on the slide it is showing. A script tag, not fetch, so it
   works from file:// too. Switch off for the event: C5_LIVE=false. */
const C5_LIVE=true;
if(C5_LIVE)(function(){let v0=null;
  function ping(){const s=document.createElement('script');s.src='src/c5/live.js?t='+Date.now();
    s.onload=()=>{const v=window.C5LIVE;s.remove();if(v0===null){v0=v;return}
      if(v!==v0){try{history.replaceState(null,'','#'+(typeof cur!=='undefined'&&cur||''))}catch(e){};location.reload()}};
    s.onerror=()=>s.remove();document.head.appendChild(s)}
  setInterval(ping,3000);setTimeout(ping,500)})();

/* ---------- covers ---------- */
function cover(n,o){S({n,full:1,seq:o.seq,lays:o.lays,cards:[
  o.pieces?['pieces',[0,0,7,6],{img:P(o.img),dir:o.pieces[0],parts:o.pieces[1],bg:'clear',cls:'clear'}]:['photo',[0,0,7,6],{img:P(o.img),pos:o.pos||'50% 50%'}],
  /* Amr 13:04: no rolling words on the section covers; the number and «القسم ...» share one chip */
  /* Amr 15:14: the answer is what matters — it gets the room, the section chip gives it up */
  ['axis',[7,0,5,1],{n:o.no,ic:o.ic||'layers',t:o.k,s:'',bg:'vio'}],
  ['title',[7,1,5,2],{bg:'dark',ic:o.ic||'layers',t:o.t,fs:o.fs||46}],
  ['title',[7,3,5,3],{bg:'grad',t:o.s,fs:o.sfs||62,tw:o.tw,pz:o.tw?0:undefined}],
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
function grid(n,H,o){const cards=[['title',[8,0,4,o.side?2:(o.s?4:6)],{bg:o.bg||'dark',era:o.era,k:o.k,ki:o.k?(o.ic||'images'):undefined,ic:o.era?o.ic:undefined,t:o.t,fs:o.fs||(o.side?38:46)}]];
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
function vs(n,H,o){const K=x=>x.map(k=>Object.assign({},k));
  /* cmp:1 — one card per measure, قبل 2014 and 2026 side by side (Amr 14:34: «خلي دايما ده اسلوبك»); slides move to it one by one */
  let figs;if(o.cmp){const A=o.a.k,Bk=o.b.k,m=Math.max(A.length,Bk.length);
    figs=Array.from({length:m},(_,i)=>['cmp',[3,i*6/m,5,6/m],{bg:'dark2',rows:[{a:Object.assign({},A[i]||{v:'',u:'',l:''}),b:Object.assign({},Bk[i]||{v:'',u:'',l:''})}],fs:o.nfs}])}
  else figs=[['kpi2',[3,0,5,3],{bg:'dark2',ic:'history',h:'قبل 2014',items:K(o.a.k),fs:o.a.nfs}],
    ['kpi2',[3,3,5,3],{bg:'mint',ic:'trending-up',h:'2026',items:K(o.b.k),fs:o.b.nfs}]];
  S(Object.assign({n},H,{cards:[
  ['title',[8,0,4,2],{bg:'dark',k:o.k||'قبل 2014 ← 2026',ki:'git-compare-arrows',t:o.t,s:o.s,fs:o.fs||36,ss:17}],
  ['text',[8,2,4,2],{bg:'dark2',h:'التحدي · قبل 2014',ic:'history',t:o.a.t,fs:o.a.fs||18}],
  ['text',[8,4,4,2],{bg:'grad',h:'نتائج التحرك · 2026',ic:'sparkles',t:o.b.t,fs:o.b.fs||18}],
  ...figs,
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
  /* no decorative word stack: its words were not the client's, and the third one was cut at the card's edge (QA) */
  ['logo',[0,0,4,4],{img:'logo',alt:'منتدى مصر 2026',bg:'dark2',k:.8}],
  ['photo',[0,4,12,2],{img:P(o.img||'image43'),pos:'50% 60%'}],
]})}

/* ---------- international testimony ---------- */
function who(n,H,o){S(Object.assign({n},H,{cards:[
  ['title',[8,0,4,2],{bg:'dark',k:o.k,ki:o.k?'globe':undefined,t:o.t,fs:o.fs||34}],   /* no kicker of our own: only the client's words */
  ...o.items.map((x,i)=>['quote',[i?0:4,0,4,4],{bg:i?'dark2':'grad',t:x.t,by:x.org,fs:x.fs||22}]),
  ['photo',[0,4,12,2],{img:P(o.img),pos:o.pos||'50% 60%'}],
  ...(o.items.length===1?[]:[]),
]}))}

/* =====================================================================================================
   القسم الأول · لماذا لم يكن الاستمرار ممكنا؟ (1–13)
   ===================================================================================================== */
/* 1 — cover */
/* Amr 16:56: no photo; the eagle on top with the cabinet's official title under it, and the forum's logo on top too */
S({n:1,full:1,cards:[
  ['logo',[8,0,4,3],{img:'emblem',alt:'شعار الجمهورية',bg:'dark2',k:.9,cls:'c5gov',cap:'<b>جمهورية مصر العربية</b><span>رئاسة مجلس الوزراء</span>'}],
  ['date',[4,0,4,3],{t:'أكتوبر 2026',bg:'vio'}],
  ['logo',[0,0,4,3],{img:'logo',alt:'منتدى مصر 2026',bg:'dark2',k:.86}],
  ['title',[0,3,12,3],{bg:'dark',k:'منتدى مصر 2026 · الجلسة الختامية',ki:'sparkles',t:'مصر [[2014–2026]]',s:'من بناء مقومات التنمية .. إلى صناعة المستقبل',fs:118,ss:34}],
]});
(function(){const st=document.createElement('style');st.textContent=
  '.bc.c5gov .cap{display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center;margin-top:8px;line-height:1.25}'+
  '.bc.c5gov .cap b{font:700 24px/1.25 var(--f-display);color:var(--ink)}.bc.c5gov .cap span{font:600 20px/1.25 var(--f-body);color:var(--ink);opacity:.85}'+
  /* Amr 18:07: the turning forum symbol sits at the card's far left, clear of the words */
  '.bc>.wm.wlogo.cov{left:18px!important;top:50%!important;width:auto!important;height:90%!important;aspect-ratio:1/1;translate:0 -50%}';document.head.appendChild(st)})();
/* 2, 3 — films */
S({n:2,full:1,cards:[['frame',[0,0,12,6],{cls:'fcard',src:'opening/index.html?embed=1',poster:'c5/opening',title:'قبل البداية 2011–2014'}]]});   /* Amr 12:58: slide 2 = the opener */
/* 3 — the film «مصر قبل عام 2014» now plays inside slide 2 (Amr 14:55: «احذف سلايد ٣»). The show counts by place (170 slides),
   so from here on the number Amr sees is the internal n minus one (his «سلايد 16» is n:17) */
/* vid(3,{src:'c5_3.mp4',cap:'مصر قبل عام 2014'}); */
/* 4 — section one */
cover(4,{no:'01',k:'القسم الأول',t:'لماذا لم يكن الاستمرار ممكنا؟',s:'تحديات تراكمت عبر عقود لم تكن تحتمل التأجيل',img:'image10',pos:'50% 40%',ic:'triangle-alert',words:['الأمن','السكان','البنية','الجغرافيا'],cur:1,
  /* Amr 17:34: two steps — the section and the question, then the answer typing in with the collage */
  seq:[[1,2],[0,3]],tw:1,pieces:['c5/p10',P10]      /* step 1 fills the slide with its two cards, they make room on the click (Amr 17:56) */});
/* 5 — four structural challenges */
S({n:5,...HS1,cards:[
  ['photo',[0,0,8,6],{img:P('image11'),pos:'40% 50%'}],
  ['kpi',[8,0,4,4],{bg:'grad',ic:'cog',l:'تحديات هيكلية',v:4,u:'تحديات',fs:180}],
  ['title',[8,4,4,2],{bg:'dark',t:'قيدت من عملية التنمية',fs:40}],
]});
/* eight pictures in four cards (two each, in turn), so the challenge cards get the room */
const ph4=(items,area)=>{const it=items.map(x=>typeof x==='string'?[x]:x),A=area||[[2,0,2,3],[0,0,2,3],[2,3,2,3],[0,3,2,3]];
  return A.map((g,i)=>['photo',g,{imgs:[it[i],it[i+4]].filter(Boolean).map(y=>({img:P(y[0]),pos:y[1]})),every:3800}])};
/* 6 — security */
/* Amr 17:37: «مصر قبل 2014» as an infographic, and the security sentence in a card of its own */
S({n:6,...HS1,cards:[
  ['era2',[8,0,4,3],{bg:'dark2',k:'مصر قبل',y:2014,stay:'era',a:2011}],
  ['title',[8,3,4,3],{bg:'dark',ic:'shield-alert',t:'الاضطرابات الأمنية والعمليات الإرهابية',fs:46,pz:0,withHero:1}],
  ...photoCards([['image19'],['image16'],['image15'],['image18'],['image17'],['image14'],['image12'],['image13']])]});
/* 7 — 2011–2023 */
/* Amr 18:10: the year card and its title come in together, so the counter reads with its words at once (every era slide) */
S({n:7,...HS1,cards:[
  ['photo',[0,0,8,6],{img:P('image20'),pos:'50% 45%'}],
  /* Amr 17:39: no date card; the year of the card before rolls on from 2014 to 2023 while the title writes itself in */
  ['era2',[8,0,4,3],{bg:'dark2',k:'<span dir="ltr">2011 –</span>',y:2023,from:2014,stay:'era',a:2011}],
  ['title',[8,3,4,3],{bg:'dark',k:'خلال الفترة (2011- 2023)',ki:'flame',t:'تفاقمت الاضطرابات الامنية والعمليات الإرهابية',fs:44,tw:1,pz:0,withHero:1}],
]});
/* 8 — population and urban */
/* Amr 17:41: the challenge's name first, its sentence as infographic pieces, «مصر قبل 2014» a card of its own (all the challenge slides) */
S({n:8,...HS1,cards:[
  ['era2',[8,0,4,2],{bg:'dark2',k:'مصر قبل',y:2014,stay:'era',a:2011}],
  ['title',[8,2,4,1.5],{bg:'dark',ic:'users',t:'تحدي سكاني وعمراني',fs:46,pz:0,withHero:1}],
  ['accum',[8,3.5,4,2.5],{bg:'dark2',layers:['اقتصادية','اجتماعية'],t:'بالإضافة إلى تحديات اقتصادية واجتماعية عانت منها الدولة المصرية لعقود'}],
  ['popx',[4,0,4,2],{bg:'dark2',t:'زيادة سكانية متسارعة'}],
  ['share',[4,2,4,4],{bg:'grad',l:'مع تركزها في نطاق جغرافي محدود .. لا يتجاوز',v:7,u:'%',sub:'من إجمالي المساحة'}],
  ...ph4([['image29'],['image25'],['image24'],['image28'],['image26'],['image23'],['image21'],['image22']]),
]});
/* 9 — infrastructure and services */
S({n:9,...HS1,cards:[
  ['era2',[8,0,4,2],{bg:'dark2',k:'مصر قبل',y:2014,stay:'era',a:2011}],
  ['title',[8,2,4,4],{bg:'dark',ic:'construction',t:'البنية الأساسية والخدمات',fs:58,pz:0,withHero:1}],
  ['wear',[4,0,4,2],{bg:'dark2',t:'تهالك كامل للبنية التحتية',k:'تهالك كامل'}],
  ['lag',[4,2,4,2],{bg:'grad',t:'لا تواكب النمو،',g:'النمو'}],
  ['block',[4,4,4,2],{bg:'dark2',t:'وتقييد من الحركة والاستثمار',k:'وتقييد'}],
  ...ph4([['image37'],['image34'],['image33'],['image36'],['image35'],['image32'],['image30'],['image31']]),
]});
/* 10 — geography */
S({n:10,...HS1,cards:[
  ['era2',[8,0,4,2],{bg:'dark2',k:'مصر قبل',y:2014,stay:'era',a:2011}],
  ['title',[8,2,4,2],{bg:'dark',ic:'map-pinned',t:'تحدي جغرافي',fs:58,pz:0,withHero:1}],
  ['ibox',[8,4,4,2],{bg:'dark2',ic:'map-pin',t:'تركز الأنشطة الاقتصادية والفرص في عدد محدد من المحافظات،',fs:22}],
  ['kpip',[3,0,5,2],{bg:'grad',ic:'building-2',l:'من [[الاستثمار الخاص المحلي]] متركز في القاهرة والجيزة [[1972–2020]]',v:64,u:'%'}],
  ['kpip',[3,2,5,2],{bg:'dark2',ic:'globe',pre:'أكثر من',lfs:22,l:'من تدفقات [[الاستثمار الأجنبي المباشر]] في المشروعات الجديدة توجهت إلى القاهرة والجيزة [[1972–2020]]',v:70,u:'%'}],
  ['kpip',[3,4,5,2],{bg:'mint',ic:'map',l:'من 26 محافظة لديها [[مقومات كافية]] من الاستثمار الخاص المحلي',v:9,u:'%'}],
  ['photo',[0,0,3,4],{img:P('image38'),pos:'60% 50%'}],
  ['ibox',[0,4,3,2],{bg:'dark2',ic:'unplug',t:'ومناطق لم تستفيد من إمكانيتها'}],
]});
/* 11 — the vicious circle (Amr 13:13: redistributed; the Egypt collage shown whole, never cropped) */
S({n:11,...HS1,cards:[
  ['title',[5,0,7,2],{bg:'dark',k:'رسمت ملامح الاقتصاد المصري قبل 2014',ki:'refresh-ccw',t:'تحديات هيكلية متداخلة تغذي كلها واحدة الأخرى',fs:40,hero:1}],
  ['cycle',[5,2,7,4],{bg:'dark2',c:'حلقة مفرغة عانى منها الاقتصاد المصري لعقود',items:[
    ['users','زيادة سكانية متسارعة'],['gauge','ضغط على الموارد المتاحة'],['factory','عدم الاستغلال الأمثل للموارد (إنتاجية محدودة)'],
    ['lock','قيود على النشاط الاستثماري'],['map-pin','تركز التنمية في بعض المدن دون غيرها'],['shield-alert','تحديات أمنية وسياسية']]}],
  ['photo',[0,0,5,6],{img:P('image41t'),cls:'fit clear'}],
]});
/* 12 — the economy before 2014 */
S({n:12,...HS1,cards:[
  ['era2',[8,0,4,1.5],{bg:'dark2',k:'مصر قبل عام',y:2014,stay:'era',a:2011}],
  ['title',[8,1.5,4,1.5],{bg:'dark',ic:'trending-down',t:'وقد أفضت هذه التحديات إلى تدهور حاد في الأوضاع الاقتصادية',fs:30,pz:0,withHero:1}],
  ['ilist',[8,3,4,3],{bg:'dark2',h:'تجسد في',items:[['factory','ركود النشاط الإنتاجي،'],['users','وتفاقم البطالة،'],['banknote','وانسحاب الاستثمارات الخاصة،']],foot:'بما أضعف قدرة الاقتصاد على النمو وتوفير فرص العمل.'}],
  ['ft',[4,0,4,2],{bg:'grad',ic:'landmark',l:'احتياطي نقدي (مليار دولار)',a:{v:36,u:''},b:{v:17,u:''}}],
  ['ft',[0,0,4,2],{bg:'dark2',ic:'globe',l:'استثمار أجنبي مباشر (مليار دولار)',a:{v:6.7,u:''},b:{v:3.8,u:''}}],
  ['ft',[4,2,4,2],{bg:'dark2',ic:'trending-down',l:'معدل النمو',a:{v:5.2,u:'%'},b:{v:2.2,u:'%'},pie:0}],
  ['ft',[0,2,4,2],{bg:'vio',ic:'users',l:'معدل البطالة',a:{v:9,u:'%'},b:{v:13.2,u:'%'},pie:0}],
  ['ft',[4,4,4,2],{bg:'mint',ic:'receipt',l:'عجز الموازنة للناتج',a:{v:8.1,u:'%'},b:{v:12,u:'%'},pie:0}],
  ['photo',[0,4,4,2],{img:P('image42'),pos:'50% 50%'}],
]});
/* 13 — the question */
S({n:13,...HS1,cards:[
  ['title',[0,0,12,4],{bg:'dark',k:'السؤال',ki:'circle-help',t:'كيف يمكن لدولة بهذا الحجم من التحديات أن [[تصنع مستقبلًا مختلفًا]] دون إعادة بناء مقومات التنمية؟',fs:58,pz:0}],
  ['photo',[0,4,12,2],{img:P('image43'),pos:'50% 50%'}],
]});

/* type v2 (Amr 18:05 «فيه مشاكل في الكشيدة واوزان الفونت محتاجة تكون متنوعة والمقاسات بحيث احس بجودة التصميم»):
   - no tracking on Arabic: any letter-spacing pulls the joined letters apart or onto each other; only pure figures keep theirs
   - a touch more word space for the heavy weights, so «متركز في» never reads as one word
   - titles and quotes in Cairo Black (the client's rule), the key phrase of a sentence ExtraBold and a little larger, the words
     around it Medium; labels SemiBold */
(function(){const st=document.createElement('style');st.textContent=
  '.ttl1,.kick,.wk,.rl.ar>span,.pz .pp,.para,.sub,.lab,.kps{letter-spacing:0!important}'+
  '.ttl1,.qt,.qt.wqt,.cqk,.kin .wd div{font-weight:900}'+
  '.ttl1,.qt,.kps,.para,.lab.pz,.e2l{word-spacing:.06em}'+
  '.bc .kps{font-weight:500;line-height:1.5}'+
  '.bc .kps .pp{font-weight:800;font-size:1.05em}'+
  '.bc .kps .pp.n b{font-weight:700}.bc .kps .pp.n i{font-weight:500}'+
  '.bc .kpf .kpre{font-weight:600;opacity:.82}'+
  '.para.pz .pp,.lab.pz .pp{font-weight:800}.para{font-weight:500}'+
  '.ttl1.pz .pp{font-weight:900}';
  document.head.appendChild(st)})();

/* cycle v2 (Amr 18:06 «التصميم محتاج يكون مودرن وبروفيشنال اكتر», on «حلقة مفرغة»): a true ring, no boxes. The six causes sit on
   the ring as lit nodes with their words outside it; a bright comet runs round the ring for ever (the circle that feeds itself),
   lighting each cause as it passes; small chevrons on the ring give the direction; the ring's name in the middle in Cairo Black */
CARD.cycle=function(c,r){const W=r.w-52,H=r.h-48,n=c.items.length,cx=W/2,cy=H/2,R=Math.min(H*.4,W*.27),NR=Math.round(Math.min(31,R*.17)),T=9;
  const st=2*Math.PI/n,a0=-Math.PI/3,C=2*Math.PI*R;
  const P=c.items.map((it,i)=>{const a=a0-i*st;return {a,x:cx+R*Math.cos(a),y:cy+R*Math.sin(a),ic:it[0],t:it[1]}});
  /* the comet's head leaves angle 0 and runs anticlockwise: it reaches angle a after ((-a) mod 2π)/2π of the loop */
  const when=a=>{let k=(-a)%(2*Math.PI);if(k<0)k+=2*Math.PI;return k/(2*Math.PI)*T};
  const chev=P.map(p=>{const m=p.a-st/2,x=cx+R*Math.cos(m),y=cy+R*Math.sin(m),ang=Math.atan2(-Math.cos(m),Math.sin(m))*180/Math.PI;
    return `<path class="cy2v" d="M-4 -7L4 0L-4 7" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)})"/>`}).join('');
  const words=String(c.c||'').split(' '),head=words.slice(0,2).join(' '),rest=words.slice(2).join(' ');
  const lw=p=>{const dx=p.x-cx;return dx>1?W-(p.x+NR+14)-2:p.x-NR-14-2};
  const lab=(p,i)=>{const right=p.x>cx+1,w=Math.round(lw(p));
    return `<div class="cy2l${right?' r':' l'}" style="top:${p.y.toFixed(1)}px;${right?`left:${(p.x+NR+14).toFixed(1)}px`:`right:${(W-p.x+NR+14).toFixed(1)}px`};width:${w}px;--d:${(when(p.a)-T).toFixed(2)}s">${p.t}</div>`};
  return `<div class="cy2" style="--T:${T}s">`+
    `<svg class="cy2s" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="cy2g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3d5cc0"/><stop offset="1" stop-color="#ee9873"/></linearGradient></defs>`+
      `<circle class="cy2t" cx="${cx}" cy="${cy}" r="${R}"/>`+
      `<circle class="cy2c" cx="${cx}" cy="${cy}" r="${R}" style="stroke-dasharray:${(C*.16).toFixed(1)} ${(C*.84).toFixed(1)};--C:${C.toFixed(1)}"/>`+
      `<circle class="cy2i" cx="${cx}" cy="${cy}" r="${(R-NR-16).toFixed(1)}"/>${chev}</svg>`+
    `<div class="cy2m" style="left:${cx}px;top:${cy}px;width:${Math.round(2*(R-NR-26))}px"><b>${head}</b>${rest?`<span>${rest}</span>`:''}</div>`+
    P.map((p,i)=>`<span class="cy2n" style="left:${p.x.toFixed(1)}px;top:${p.y.toFixed(1)}px;width:${2*NR}px;height:${2*NR}px;--d:${(when(p.a)-T).toFixed(2)}s">${ICON(p.ic,Math.round(NR*.95))}</span>`).join('')+
    P.map(lab).join('')+`</div>`};
(function(){const st=document.createElement('style');st.textContent=
  '.bc .cy2{position:absolute;inset:0}.bc .cy2s{position:absolute;inset:0;overflow:visible}'+
  '.bc .cy2t{fill:none;stroke:rgba(61,92,192,.13);stroke-width:14}'+
  '.bc .cy2i{fill:rgba(255,255,255,.5);stroke:rgba(61,92,192,.16);stroke-width:1;stroke-dasharray:2 6}'+
  '.bc .cy2c{fill:none;stroke:url(#cy2g);stroke-width:14;stroke-linecap:round;animation:cy2run var(--T) linear infinite;filter:drop-shadow(0 0 6px rgba(61,92,192,.35))}'+
  '@keyframes cy2run{from{stroke-dashoffset:0}to{stroke-dashoffset:var(--C)}}'+
  '.bc .cy2v{fill:none;stroke:#3d5cc0;stroke-width:2.8;stroke-linecap:round;stroke-linejoin:round;opacity:.8}'+
  '.bc .cy2n{position:absolute;transform:translate(-50%,-50%);border-radius:50%;display:grid;place-items:center;color:#fff;background:linear-gradient(150deg,#22348a,#4d6ad6);box-shadow:0 0 0 5px rgba(255,255,255,.92),0 10px 24px -10px rgba(28,37,71,.6);animation:cy2p var(--T) linear infinite;animation-delay:var(--d)}'+
  '.bc .cy2n svg{stroke-width:1.7}'+
  '@keyframes cy2p{0%{transform:translate(-50%,-50%) scale(1.16);background:linear-gradient(150deg,#e8845e,#f2a988);box-shadow:0 0 0 5px rgba(255,255,255,.95),0 0 0 14px rgba(238,152,115,.22),0 12px 28px -10px rgba(238,152,115,.7)}14%{transform:translate(-50%,-50%) scale(1)}14.1%,100%{background:linear-gradient(150deg,#22348a,#4d6ad6)}}'+
  '.bc .cy2l{position:absolute;transform:translateY(-50%);font:700 19px/1.32 var(--f-display);color:var(--ink);word-spacing:.05em;text-wrap:balance;animation:cy2w var(--T) linear infinite;animation-delay:var(--d)}'+
  '.bc .cy2l{direction:rtl}.bc .cy2l.r{text-align:left}.bc .cy2l.l{text-align:right}'+
  '@keyframes cy2w{0%{color:#c4643e}16%,100%{color:var(--ink)}}'+
  '.bc .cy2m{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center}'+
  '.bc .cy2m b{font:900 42px/1.12 var(--f-display);background:linear-gradient(120deg,#22348a,#3d5cc0 55%,#e8845e);-webkit-background-clip:text;background-clip:text;color:transparent;padding-bottom:.06em}'+
  '.bc .cy2m span{font:500 19px/1.4 var(--f-body);color:var(--ink);opacity:.82;text-wrap:balance}';
  document.head.appendChild(st)})();

/* popx v2 (Amr 18:01 «هل انت راضي عن الايقونات…»: no stock icons): «زيادة سكانية متسارعة» as a pictogram — columns of people
   that grow taller from the oldest (right) to the newest (left), each column arriving sooner than the last (the speeding-up),
   and the growth curve drawn over their heads ending in an arrow */
CARD.popx=function(c,r){const H=[1,1,2,2,3,3,4,5,6,8],n=H.length,VW=230,VH=86,T=c.dur||2200,dx=VW/(n),ph=9.4;
  const col=k=>d3.interpolateRgb('#a9b7ec','#22348a')(k/(n-1));
  let g='',pts=[];
  H.forEach((h,k)=>{const x=VW-dx*(k+.5),t0=T*Math.sqrt(k/n);
    for(let j=0;j<h;j++){const y=VH-1-j*ph,last=k>=n-2&&j===h-1;
      g+=`<g class="pg" style="--d:${Math.round(t0+j*70)}ms" fill="${last?'#ee9873':col(k)}"><circle cx="${x.toFixed(1)}" cy="${(y-7.2).toFixed(1)}" r="2.5"/><path d="M${(x-4).toFixed(1)} ${y.toFixed(1)}v-1.6a4 4 0 0 1 8 0v1.6z"/></g>`}
    pts.push([x,VH-1-(h-1)*ph-13])});
  /* one clean exponential over the heads, from the first column's top to the last one's: growth that speeds up */
  const [xa,ya]=pts[0],[xb,yb]=pts[n-1],K=2.2,E=t=>(Math.exp(K*t)-1)/(Math.exp(K)-1);
  const cv='M'+Array.from({length:25},(_,i)=>{const t=i/24;return (xa+(xb-xa)*t).toFixed(1)+' '+(ya-4+(yb-ya)*E(t)).toFixed(1)}).join('L');
  return `<div class="px2"><div class="px2c">${hl(c.t)}</div><svg class="px2s" viewBox="0 -6 ${VW} ${VH+6}" preserveAspectRatio="xMidYMax meet">`+
    `<defs><linearGradient id="px2l" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#3d5cc0"/><stop offset="1" stop-color="#ee9873"/></linearGradient>`+
    `<marker id="px2h" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto-start-reverse"><path d="M0 1L9 5L0 9z" fill="#ee9873"/></marker></defs>`+
    `<line x1="0" y1="${VH}" x2="${VW}" y2="${VH}" stroke="rgba(28,37,71,.16)" stroke-width=".6"/>${g}`+
    `<path class="px2v" d="${cv}" pathLength="1" fill="none" stroke="url(#px2l)" stroke-width="1.6" stroke-linecap="round" marker-end="url(#px2h)" style="--d:${T+250}ms"/></svg></div>`};
(function(){const st=document.createElement('style');st.textContent=
  '.bc>.in:has(>.px2){container-type:size;inset:24px 26px!important;width:auto!important;height:auto!important;zoom:1!important}'+
  '.bc .px2{position:absolute;inset:0;display:grid;grid-template-rows:auto minmax(0,1fr);gap:2cqh}'+
  '.bc .px2c{font:800 min(15cqh,8cqw)/1.2 var(--f-display);color:var(--ink);text-align:right}'+
  '.bc .px2s{width:100%;height:100%;overflow:visible}'+
  '.bc .px2 .pg{opacity:0;transform:translateY(5px);transform-box:fill-box;transition:opacity .3s ease var(--d),transform .45s cubic-bezier(.2,1.5,.4,1) var(--d)}.bc.go .px2 .pg{opacity:1;transform:none}'+
  '.bc .px2v{stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset 1.1s cubic-bezier(.5,0,.2,1) var(--d)}.bc.go .px2v{stroke-dashoffset:0}';
  document.head.appendChild(st)})();

/* accum v2 (Amr 18:01/18:06): «بالإضافة إلى تحديات اقتصادية واجتماعية عانت منها الدولة المصرية لعقود» — the sentence on top, its two
   kinds of challenge set in their own colours so the sentence is the legend; under it the decades pile up as stacked bars, each one
   taller than the one before (from the oldest, right, to the newest, left) */
CARD.accum=function(c,r){const L=c.layers||[],n=7,col=['#3d5cc0','#e8845e'];
  let t=hl(c.t||'');L.forEach((w,i)=>{t=t.replace(w,`<b class="acw${i+1}">${w}</b>`)});
  const bars=Array.from({length:n},(_,k)=>{const h=.26+.74*Math.pow(k/(n-1),1.5),a=h*.56;
    return `<span class="acb" style="--h:${(h*100).toFixed(1)}%;--d:${Math.round(180+k*150)}ms"><i style="height:${(100-a/h*100).toFixed(1)}%"></i><i style="height:${(a/h*100).toFixed(1)}%"></i></span>`}).join('');
  return `<div class="ac2"><div class="ac2t">${t}</div><div class="ac2b">${bars}</div></div>`};
(function(){const st=document.createElement('style');st.textContent=
  '.bc>.in:has(>.ac2){container-type:size;inset:24px 26px!important;width:auto!important;height:auto!important;zoom:1!important}'+
  '.bc .ac2{position:absolute;inset:0;display:grid;grid-template-rows:auto minmax(0,1fr);gap:4cqh}'+
  '.bc .ac2t{font:500 min(7.4cqh,4.7cqw)/1.5 var(--f-body);color:var(--ink);text-align:right;text-wrap:balance}'+
  '.bc .ac2t b{font-weight:800}.bc .ac2t .acw1{color:#3d5cc0}.bc .ac2t .acw2{color:#d9703f}'+
  '.bc .ac2b{display:flex;align-items:flex-end;gap:2.4cqw;border-bottom:1px solid rgba(28,37,71,.16);padding:0 1cqw}'+
  '.bc .acb{flex:1 1 0;height:var(--h);display:flex;flex-direction:column;gap:3px;transform-origin:bottom;transform:scaleY(0);transition:transform .9s cubic-bezier(.2,1,.3,1) var(--d)}.bc.go .acb{transform:none}'+
  '.bc .acb i{display:block;border-radius:7px}.bc .acb i:first-child{background:linear-gradient(180deg,#f2a988,#e8845e)}.bc .acb i:last-child{background:linear-gradient(180deg,#5b78dd,#2c45b0)}';
  document.head.appendChild(st)})();

/* ---------- the infrastructure challenge as pictures (Amr 18:01: «تقرا الكلام وتشوف الكارت ممكن يتعبر عنه ازاي») ----------
   «تهالك كامل للبنية التحتية»: a condition gauge whose segments wear out one after another until every one is cracked;
   «لا تواكب النمو»: the growth line climbing away from a near-flat line, the gap between them opening;
   «وتقييد من الحركة والاستثمار»: a stream that piles up at a barrier, a trickle getting through.
   The sentence sits on top in two weights: its key words ExtraBold, the rest Medium (c.k = the key words, client text only) */
const ixT=c=>{const t=c.t||'',k=c.k||'';return k&&t.includes(k)?t.replace(k,`<b>${k}</b>`):`<b>${t}</b>`};
CARD.wear=function(c,r){const n=c.n||10;
  const seg=Array.from({length:n},(_,i)=>`<i style="--d:${Math.round(500+i*190)}ms"><svg viewBox="0 0 20 40" preserveAspectRatio="none"><path d="M11 0L7 13L13 21L8 31L11 40"/></svg></i>`).join('');
  return `<div class="ix"><div class="ixt">${ixT(c)}</div><div class="wr"><div class="wrs">${seg}</div></div></div>`};
CARD.lag=function(c,r){const VW=200,VH=90,N=40,pg=[],pi=[];
  for(let i=0;i<=N;i++){const t=i/N,x=VW-t*VW;pg.push([x,VH-6-(VH-14)*(Math.exp(2.3*t)-1)/(Math.exp(2.3)-1)]);pi.push([x,VH-6-(VH-14)*.2*t])}
  const L=a=>'M'+a.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join('L'),gap=L(pg)+'L'+pi.slice().reverse().map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join('L')+'Z';
  return `<div class="ix"><div class="ixt">${ixT(c)}</div><div class="lgw"><svg class="lgs" viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="none">`+
    `<defs><pattern id="lgh" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="4" stroke="rgba(255,255,255,.28)" stroke-width="1.2"/></pattern>`+
    `<clipPath id="lgc"><rect class="lgr" x="-12" y="-12" width="${VW+12}" height="${VH+12}"/></clipPath><marker id="lga" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse" markerUnits="strokeWidth"><path d="M0 1L9 5L0 9z" fill="#fff"/></marker></defs>`+
    `<line x1="0" y1="${VH-6}" x2="${VW}" y2="${VH-6}" stroke="rgba(255,255,255,.3)" stroke-width="1" vector-effect="non-scaling-stroke"/>`+
    `<g clip-path="url(#lgc)"><path d="${gap}" fill="url(#lgh)"/><path class="lgi" d="${L(pi)}"/><path class="lgg" d="${L(pg)}" marker-end="url(#lga)"/></g></svg>`+
    (c.g?`<span class="lgl">${c.g}</span>`:'')+`</div></div>`};
CARD.block=function(c,r){const lanes=3,per=6;let dots='';
  /* each lane's stream arrives and queues up behind the barrier (once, as the card opens); one dot in a while slips through */
  for(let l=0;l<lanes;l++){for(let j=0;j<per;j++)dots+=`<i class="bkd" style="--y:${(22+l*28)}%;--x:${(53+j*7.6).toFixed(1)}%;--d:${(300+j*260+l*90)}ms"></i>`;
    dots+=`<i class="bkd thru" style="--y:${(22+l*28)}%;--d:${(-(l*1.5)).toFixed(2)}s"></i>`}
  return `<div class="ix"><div class="ixt">${ixT(c)}</div><div class="bk"><div class="bkl"></div>${dots}<div class="bkb"></div></div></div>`};
(function(){const st=document.createElement('style');st.textContent=cqIn('ix')+
  '.bc .ix{position:absolute;inset:0;display:grid;grid-template-rows:auto minmax(0,1fr);gap:4cqh}'+
  '.bc .ixt{font:500 min(10cqh,6cqw)/1.35 var(--f-body);color:var(--ink);text-align:right;word-spacing:.06em}.bc .ixt b{font:800 min(13cqh,7.6cqw)/1.25 var(--f-display)}'+
  '.bc.grad .ixt,.bc.mint .ixt,.bc.vio .ixt{color:#fff}'+
  /* wear */
  '.bc .wr{display:flex;align-items:center}.bc .wrs{width:100%;height:min(46cqh,100%);display:flex;gap:1.6cqw;direction:rtl}'+
  '.bc .wrs i{flex:1 1 0;position:relative;border-radius:8px;background:linear-gradient(180deg,#5b78dd,#2c45b0);box-shadow:inset 0 1px 0 rgba(255,255,255,.35);transition:background .5s ease var(--d),box-shadow .5s ease var(--d),transform .5s ease var(--d)}'+
  '.bc .wrs i svg{position:absolute;inset:8% 18%;width:64%;height:84%;opacity:0;transition:opacity .3s ease var(--d)}.bc .wrs i path{fill:none;stroke:#fff;stroke-width:2.2;stroke-linejoin:round;vector-effect:non-scaling-stroke}'+
  '.bc.go .wrs i{background:linear-gradient(180deg,#f3b293,#e07a52);box-shadow:inset 0 0 0 1px rgba(255,255,255,.4);transform:translateY(4%)}.bc.go .wrs i svg{opacity:1}'+
  /* lag */
  '.bc .lgw{position:relative}.bc .lgs{position:absolute;inset:0;width:100%;height:100%;overflow:visible}'+
  '.bc .lgg{fill:none;stroke:#fff;stroke-width:3;stroke-linecap:round;vector-effect:non-scaling-stroke}.bc .lgi{fill:none;stroke:rgba(255,255,255,.62);stroke-width:2.4;stroke-dasharray:6 6;vector-effect:non-scaling-stroke}'+
  '.bc .lgr{transform-box:fill-box;transform-origin:right;transform:scaleX(0);transition:transform 2.2s cubic-bezier(.45,0,.2,1) .4s}.bc.go .lgr{transform:none}'+
  '.bc .lgl{position:absolute;left:4%;top:-2%;font:700 min(8cqh,4.8cqw)/1 var(--f-display);color:#1c2547;background:#fff;border-radius:99px;padding:.3em .7em;opacity:0;transition:opacity .4s ease 2.4s}.bc.go .lgl{opacity:1}'+
  /* block */
  '.bc .bk{position:relative;overflow:hidden;border-radius:14px}.bc .bkl{position:absolute;inset:0;--ln:linear-gradient(rgba(28,37,71,.1),rgba(28,37,71,.1));background:var(--ln) 0 22%/100% 2px no-repeat,var(--ln) 0 50%/100% 2px no-repeat,var(--ln) 0 78%/100% 2px no-repeat}'+
  '.bc .bkb{position:absolute;top:4%;bottom:4%;left:44%;width:4.2%;border-radius:8px;background:repeating-linear-gradient(-45deg,#e07a52 0 8px,#fff 8px 16px);box-shadow:0 6px 16px -6px rgba(224,122,82,.7)}'+
  '.bc .bkd{position:absolute;top:var(--y);left:calc(100% + 10px);width:min(10cqh,5.4cqw);aspect-ratio:1;border-radius:50%;background:linear-gradient(150deg,#5b78dd,#2c45b0);transform:translate(0,-50%);box-shadow:0 4px 10px -4px rgba(28,37,71,.5);transition:left 1.1s cubic-bezier(.2,.9,.3,1) var(--d)}'+
  '.bc.go .bkd:not(.thru){left:var(--x)}'+
  '.bc .bkd.thru{left:auto;right:52%;background:#a9b7ec;box-shadow:none;transition:none;animation:bkt 4.5s linear infinite;animation-delay:var(--d)}'+
  '@keyframes bkt{0%{right:52%;opacity:0}15%{opacity:1}85%{opacity:1}100%{right:104%;opacity:0}}';
  document.head.appendChild(st)})();
