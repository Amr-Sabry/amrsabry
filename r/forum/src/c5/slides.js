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

/* conference fonts (Amr 14:12, from the client: «عروض المؤتمر — العناوين: Cairo black · الفرعي: Cairo medium»): one family, Cairo
   Medium for every weight below 600 (body, labels, kickers) and Cairo Black from 600 up (titles, numbers, quotes) */
(function(){const st=document.createElement('style');st.textContent=
  "@font-face{font-family:'Cairo26';src:url(fonts/cairo-medium.woff2) format('woff2');font-weight:100 599;font-display:block;ascent-override:102%;descent-override:36%;line-gap-override:0%}"+
  "@font-face{font-family:'Cairo26';src:url(fonts/cairo-black.woff2) format('woff2');font-weight:600 1000;font-display:block;ascent-override:102%;descent-override:36%;line-gap-override:0%}"+
  ":root{--f-display:'Cairo26','Readex Pro',system-ui,sans-serif!important;--f-body:'Cairo26','IBM Plex Sans Arabic',system-ui,sans-serif!important}"+
  "body,.hd,#ui,svg text{font-family:var(--f-display)}";
  document.head.appendChild(st);
  try{document.fonts.load("900 40px Cairo26","أبجد 2026");document.fonts.load("500 20px Cairo26","أبجد 2026")}catch(e){}})();

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
function cover(n,o){S({n,full:1,cards:[
  ['photo',[0,0,7,6],{img:P(o.img),pos:o.pos||'50% 50%'}],
  /* Amr 13:04: no rolling words on the section covers; the number and «القسم ...» share one chip */
  /* Amr 15:14: the answer is what matters — it gets the room, the section chip gives it up */
  ['axis',[7,0,5,1],{n:o.no,ic:o.ic||'layers',t:o.k,s:'',bg:'vio'}],
  ['title',[7,1,5,2],{bg:'dark',ic:o.ic||'layers',t:o.t,fs:o.fs||46}],
  ['title',[7,3,5,3],{bg:'grad',t:o.s,fs:o.sfs||62}],
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
S({n:1,full:1,cards:[
  ['title',[4,0,8,4],{bg:'dark',k:'منتدى مصر 2026 · الجلسة الختامية',ki:'sparkles',t:'مصر [[2014–2026]]',s:'من بناء مقومات التنمية .. إلى صناعة المستقبل',fs:118,ss:34}],
  ['date',[0,0,4,4],{t:'أكتوبر 2026',bg:'vio'}],
  ['photo',[0,4,8,2],{img:P('image6'),pos:'50% 70%'}],
  ['logo',[8,4,2,2],{img:'logo',alt:'منتدى مصر 2026',bg:'dark2',k:.86}],
  ['logo',[10,4,2,2],{img:'emblem',alt:'شعار الجمهورية',bg:'dark2',k:.8}],
]});
/* 2, 3 — films */
S({n:2,full:1,cards:[['frame',[0,0,12,6],{cls:'fcard',src:'opening/index.html?embed=1',poster:'c5/opening',title:'قبل البداية 2011–2014'}]]});   /* Amr 12:58: slide 2 = the opener */
/* 3 — the film «مصر قبل عام 2014» now plays inside slide 2 (Amr 14:55: «احذف سلايد ٣»). The show counts by place (170 slides),
   so from here on the number Amr sees is the internal n minus one (his «سلايد 16» is n:17) */
/* vid(3,{src:'c5_3.mp4',cap:'مصر قبل عام 2014'}); */
/* 4 — section one */
cover(4,{no:'01',k:'القسم الأول',t:'لماذا لم يكن الاستمرار ممكنا؟',s:'تحديات تراكمت عبر عقود لم تكن تحتمل التأجيل',img:'image10',pos:'50% 40%',ic:'triangle-alert',words:['الأمن','السكان','البنية','الجغرافيا'],cur:1});
/* 5 — four structural challenges */
S({n:5,...HS1,cards:[
  ['photo',[0,0,8,6],{img:P('image11'),pos:'40% 50%'}],
  ['kpi',[8,0,4,4],{bg:'grad',ic:'cog',l:'تحديات هيكلية',v:4,u:'تحديات',fs:180}],
  ['title',[8,4,4,2],{bg:'dark',t:'قيدت من عملية التنمية',fs:40}],
]});
/* 6 — security */
grid(6,HS1,{era:['مصر قبل','2014'],ic:'shield-alert',t:'الاضطرابات الأمنية والعمليات الإرهابية',fs:66,
  items:[['image19'],['image16'],['image15'],['image18'],['image17'],['image14'],['image12'],['image13']]});
/* 7 — 2011–2023 */
S({n:7,...HS1,cards:[
  ['photo',[0,0,8,6],{img:P('image20'),pos:'50% 45%'}],
  ['title',[8,0,4,2],{bg:'grad',t:'<span dir="ltr">2011 – 2023</span>',fs:72,pz:0,hero:1}],   /* Amr 13:18: «انا محتاج التاريخ الاول» */
  ['title',[8,2,4,4],{bg:'dark',k:'خلال الفترة (2011- 2023)',ki:'flame',t:'تفاقمت الاضطرابات الامنية والعمليات الإرهابية',fs:50}],
]});
/* 8 — population and urban */
S({n:8,...HS1,cards:[
  ['title',[8,0,4,3],{bg:'dark',era:['مصر قبل','2014'],k:'تحدي سكاني وعمراني',ki:'users',t:'بالإضافة إلى تحديات اقتصادية واجتماعية عانت منها الدولة المصرية لعقود',fs:24}],
  ['kpi',[8,3,4,3],{bg:'grad',ic:'map',l:'زيادة سكانية متسارعة مع تركزها في نطاق جغرافي محدود .. لا يتجاوز',v:7,u:'%',egy:1,wm:0,sub:'من إجمالي المساحة'}],
  ...photoCards([['image29'],['image25'],['image24'],['image28'],['image26'],['image23'],['image21'],['image22']]),
]});
/* 9 — infrastructure and services */
grid(9,HS1,{era:['مصر قبل','2014'],k:'البنية الأساسية والخدمات',ic:'construction',t:'تهالك كامل للبنية التحتية لا تواكب النمو، وتقييد من الحركة والاستثمار',fs:40,
  items:[['image37'],['image34'],['image33'],['image36'],['image35'],['image32'],['image30'],['image31']]});
/* 10 — geography */
S({n:10,...HS1,cards:[
  ['title',[8,0,4,2],{bg:'dark',era:['مصر قبل','2014'],ic:'map-pinned',t:'تحدي جغرافي',fs:44}],
  ['text',[8,2,4,2],{bg:'dark2',t:'تركز الأنشطة الاقتصادية والفرص في عدد محدد من المحافظات، ومناطق لم تستفيد من إمكانيتها',fs:22,pie:0}],
  ['kpi',[4,0,4,3],{bg:'grad',ic:'building-2',l:'من الاستثمار الخاص المحلي متركز في القاهرة والجيزة (1972 – 2020)',v:64,u:'%'}],
  ['kpi',[4,3,4,3],{bg:'dark2',ic:'globe',pre:'أكثر من',l:'من تدفقات الاستثمار الأجنبي المباشر في المشروعات الجديدة توجهت إلى القاهرة والجيزة (1972 – 2020)',v:70,u:'%'}],
  ['kpi',[8,4,4,2],{bg:'mint',ic:'map',l:'من 26 محافظة لديها مقومات كافية من الاستثمار الخاص المحلي',v:9,u:'%'}],
  ['photo',[0,0,4,6],{img:P('image38'),pos:'60% 50%'}],
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
  ['title',[8,0,4,2],{bg:'dark',era:['مصر قبل عام','2014'],ic:'trending-down',t:'وقد أفضت هذه التحديات إلى تدهور حاد في الأوضاع الاقتصادية',fs:26}],
  ['text',[8,2,4,2],{bg:'dark2',t:'تجسد في ركود النشاط الإنتاجي، وتفاقم البطالة، وانسحاب الاستثمارات الخاصة، بما أضعف قدرة الاقتصاد على النمو وتوفير فرص العمل.',fs:18,pie:0}],
  ['ft',[4,0,4,2],{bg:'grad',ic:'landmark',l:'احتياطي نقدي (مليار دولار)',a:{v:36,u:''},b:{v:17,u:''}}],
  ['ft',[0,0,4,2],{bg:'dark2',ic:'globe',l:'استثمار أجنبي مباشر (مليار دولار)',a:{v:6.7,u:''},b:{v:3.8,u:''}}],
  ['ft',[4,2,4,2],{bg:'dark2',ic:'trending-down',l:'معدل النمو',a:{v:5.2,u:'%'},b:{v:2.2,u:'%'},pie:0}],
  ['ft',[0,2,4,2],{bg:'vio',ic:'users',l:'معدل البطالة',a:{v:9,u:'%'},b:{v:13.2,u:'%'},pie:0}],
  ['ft',[0,4,8,2],{bg:'mint',ic:'receipt',l:'عجز الموازنة للناتج',a:{v:8.1,u:'%'},b:{v:12,u:'%'},pie:0}],
  ['photo',[8,4,4,2],{img:P('image42'),pos:'50% 50%'}],
]});
/* 13 — the question */
S({n:13,...HS1,cards:[
  ['title',[0,0,12,4],{bg:'dark',k:'السؤال',ki:'circle-help',t:'كيف يمكن لدولة بهذا الحجم من التحديات أن [[تصنع مستقبلًا مختلفًا]] دون إعادة بناء مقومات التنمية؟',fs:58,pz:0}],
  ['photo',[0,4,12,2],{img:P('image43'),pos:'50% 50%'}],
]});
