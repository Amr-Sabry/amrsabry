/* Forum 2026 decks · remote control, presentation side.
   Load it first in <head> (right after <base>), before d3 and the deck scripts:
     <script src="remote-show.js" data-deck="v3|axes|center"></script>
   1) A pausable clock: performance.now, requestAnimationFrame, setTimeout / setInterval and the CSS / Web animations
      all stand still while paused, so a map scenario freezes mid-flight and carries on from the same frame.
   2) ANIM: the map scenarios report when they start and end; the length of each one is learned the first time it plays
      (and kept), so the control window can say when it will finish.
   3) Talks to the control window (control.html) by postMessage (the window that opened us, or the last one that wrote)
      and by BroadcastChannel, so it also works when the two windows were opened separately. No network needed. */
(function(){
'use strict';
var W=window, D=document, P=W.performance;
var me=D.currentScript, DECK=(me&&me.dataset.deck)||'deck';
var rNow=P.now.bind(P), rRAF=W.requestAnimationFrame.bind(W), rCAF=W.cancelAnimationFrame.bind(W),
    rST=W.setTimeout.bind(W), rCT=W.clearTimeout.bind(W);
var RATE=+(new URLSearchParams(location.search).get('rcspeed'))||1;

/* ---------------------------------------------------------------- the pausable clock */
var paused=false, base=0, r0=rNow(), held=[];
function vnow(){return paused?base:base+(rNow()-r0)*RATE}
try{Object.defineProperty(P,'now',{value:vnow,configurable:true,writable:true})}catch(e){}
var rafN=0, rafs=new Map();
function rfire(id){var o=rafs.get(id);if(!o)return;o.r=0;if(paused)return;rafs.delete(id);try{o.cb(vnow())}catch(e){console.error(e)}}
W.requestAnimationFrame=function(cb){var id=++rafN,o={cb:cb,r:0};rafs.set(id,o);if(!paused)o.r=rRAF(function(){rfire(id)});return id};
W.cancelAnimationFrame=function(id){var o=rafs.get(id);if(o){if(o.r)rCAF(o.r);rafs.delete(id)}};
var tN=0, tms=new Map();
function arm(id,o){o.r=rST(function(){tfire(id)},Math.max(0,(o.due-vnow())/RATE))}
function tfire(id){var o=tms.get(id);if(!o)return;o.r=0;if(paused)return;
  if(o.due-vnow()>1){arm(id,o);return}
  if(o.iv!=null){o.due=Math.max(o.due+o.iv,vnow());arm(id,o)}else tms.delete(id);
  try{if(typeof o.fn==='function')o.fn.apply(W,o.a);else (new Function(String(o.fn)))()}catch(e){console.error(e)}}
W.setTimeout=function(fn,ms){var id=++tN,o={fn:fn,a:[].slice.call(arguments,2),due:vnow()+(+ms||0),iv:null,r:0};tms.set(id,o);if(!paused)arm(id,o);return id};
W.setInterval=function(fn,ms){ms=Math.max(+ms||0,4);var id=++tN,o={fn:fn,a:[].slice.call(arguments,2),due:vnow()+ms,iv:ms,r:0};tms.set(id,o);if(!paused)arm(id,o);return id};
W.clearTimeout=W.clearInterval=function(id){var o=tms.get(id);if(o){if(o.r)rCT(o.r);tms.delete(id)}};
function pause(){if(paused)return;base=vnow();paused=true;
  tms.forEach(function(o){if(o.r){rCT(o.r);o.r=0}});rafs.forEach(function(o){if(o.r){rCAF(o.r);o.r=0}});
  try{held=D.getAnimations().filter(function(a){return a.playState==='running'});held.forEach(function(a){try{a.pause()}catch(e){}})}catch(e){held=[]}
  D.documentElement.classList.add('rc-paused');push(1)}
function resume(){if(!paused)return;r0=rNow();paused=false;
  tms.forEach(function(o,id){if(!o.r)arm(id,o)});rafs.forEach(function(o,id){if(!o.r)o.r=rRAF(function(){rfire(id)})});
  held.forEach(function(a){try{a.play()}catch(e){}});held=[];
  D.documentElement.classList.remove('rc-paused');push(1)}
/* any key or click on the presentation itself carries on first (a frozen slide would swallow the next build) */
W.addEventListener('pointerdown',function(){if(paused)resume()},true);      /* keys: see «the remote» below */

/* ---------------------------------------------------------------- map scenarios: start / end / learned length */
var LSK='fctl-dur-'+DECK, DUR={};
try{DUR=JSON.parse(localStorage.getItem(LSK)||'{}')||{}}catch(e){}
/* lengths measured headlessly at real speed (18 Oct) for every map scenario, so the bar is close on the first showing;
   the length learned on this machine replaces it after the first run */
var DUR0_EXACT=false;
var DUR0=(W.RC_DUR0||{"v3":{"4:2":2785,"11:2":2796,"21:2":3590,"32:0":3042,"35:2":14434,"41:2":11173,"48:0":56499,"51:2":15974,"58:3":2224,"77:0":5206,"77:5":2367,"102:7":3107,"102:8":2718,"108:0":5222,"108:2":2366,"128:2":2760,"136:0":5355,"136:5":2601,"153:7":3239,"206:4":2880,"217:0":4537,"217:4":2320,"33:5":3229,"39:0":30960,"42:0":5169,"42:2":2253,"49:0":23129,"52:2":15827,"60:0":5162,"60:5":2499,"72:2":3613,"103:3":2276,"118:4":3185,"132:4":2404,"140:0":5067,"140:5":2236,"154:4":2651,"175:2":2899,"207:2":2278,"234:2":4971,"234:4":2819,"13:0":3306,"25:0":5207,"25:3":2370,"34:0":15494,"40:0":31100,"40:2":2769,"47:0":17335,"47:2":2341,"50:0":41266,"57:5":2880,"101:4":2397,"159:0":5015,"159:4":2249,"179:4":3913,"229:4":2480,"235:0":5081,"235:5":2356},"axes":{"1010:0":22165,"1020:0":31656,"34:0":14231,"40:0":30950,"40:2":4053,"43:2":4563,"47:0":17418,"47:2":2742,"50:0":38869,"57:5":2347,"64:0":32420,"94:4":5017,"103:0":27180,"103:3":2376,"76:0":22187,"153:7":2911,"118:4":2844,"13:0":2941,"192:0":26011,"1060:0":20839,"134:0":20147,"146:0":20364,"217:0":4502,"217:4":2237,"232:0":31864,"1070:0":26698,"1011:0":37545,"21:2":2580,"32:0":2483,"35:2":12549,"41:2":11781,"44:2":5224,"48:0":48729,"51:2":14401,"58:0":24847,"58:3":2385,"68:0":31970,"88:0":32704,"101:4":3080,"105:2":4583,"77:0":4876,"77:5":2332,"154:0":16991,"154:4":2541,"120:0":15356,"7:0":25238,"14:0":22277,"25:0":4961,"25:3":2223,"179:4":3082,"201:0":31093,"136:0":4987,"136:5":2247,"169:0":16471,"220:2":4705,"234:2":4862,"234:4":2283,"1080:0":27484,"11:2":2357,"22:0":23279,"33:5":2660,"39:0":30294,"42:0":4868,"42:2":2353,"45:2":5121,"49:0":29045,"52:2":12301,"60:0":4978,"60:5":2373,"1030:0":26246,"93:2":4658,"102:7":2409,"102:8":2438,"108:0":4821,"108:2":2687,"79:2":4645,"159:0":4691,"159:4":2242,"1040:0":14260,"8:0":28276,"1050:0":16974,"181:0":28922,"206:4":2840,"132:4":2527,"140:0":4930,"140:5":2275,"214:0":32388,"229:4":3283,"235:0":4963,"235:5":2326}})[DECK]||{};
var active=[];
function cardOf(el){return (el&&el.closest&&el.closest('.bc'))||el}
function keyOf(el){var c=cardOf(el),i=-1;
  try{if(typeof B!=='undefined'&&B&&B.cards)i=B.cards.findIndex(function(cc){return cc.el===c})}catch(e){}
  return curId()+':'+i}
var ANIM=W.ANIM={
  start:function(el,est,exact){var c=cardOf(el);active=active.filter(function(a){return a.c!==c&&a.c.isConnected});
    var k=keyOf(c),kn=exact?0:(DUR[k]||DUR0[k]);active.push({c:c,k:k,t0:vnow(),est:kn||est||0,known:!!DUR[k]||!!exact||(!!kn&&DUR0_EXACT)});push(1)},
  end:function(el){var c=cardOf(el),a=active.find(function(x){return x.c===c});if(!a)return;
    DUR[a.k]=Math.round(vnow()-a.t0);try{localStorage.setItem(LSK,JSON.stringify(DUR))}catch(e){}
    active=active.filter(function(x){return x!==a});push(1)},
  list:function(){return active},dur:function(){return DUR}};
function animState(){active=active.filter(function(a){return a.c.isConnected});
  if(!active.length)return null;
  var now=vnow(),best=null;
  active.forEach(function(a){var t=now-a.t0,rem=a.est?Math.max(0,a.est-t):-1;if(!best||rem>best.rem)best={t:t,dur:a.est,rem:rem,known:a.known}});
  return best}

/* ---------------------------------------------------------------- hidden slides (slide hide v1): Next / Back skip them, a direct jump still opens one */
var HK='fctl-hide-'+DECK, HIDE={}, force=0;
function hload(){try{HIDE=JSON.parse(localStorage.getItem(HK)||'{}')||{}}catch(e){HIDE={}}}
hload();W.addEventListener('storage',function(e){if(e.key===HK){hload();push(1)}});
function hid(n){return !!HIDE[String(n)]}

/* ---------------------------------------------------------------- text edit (text edit v1, Amr 19 Oct: «امكانية الايديت على اي نص في السلايد من خلال زر ايديت»)
   The «تعديل النص» button (control window, the deck's bar or the E key) puts the show in edit mode: hover marks a text, a click makes
   it editable, Enter keeps it, Esc puts it back. Each change is kept per slide (original text, its occurrence on the slide → new text)
   in localStorage «fctl-edit-<deck>» and laid over the slide whenever it is drawn again, so it survives rebuilds, reloads and replays. */
var EK='fctl-edit-'+DECK, EDT={}, editing=false, ORIG=new WeakMap(), RPL=[], eAct=null, eSnap=null, eHov=null, applying=false, eQ=0;
function eload(){try{EDT=JSON.parse(localStorage.getItem(EK)||'{}')||{}}catch(e){EDT={}}}
eload();W.addEventListener('storage',function(e){if(e.key===EK){eload();eSoon()}});
function esave(){try{localStorage.setItem(EK,JSON.stringify(EDT))}catch(e){}}
var SKIP='.out,.gone,.bye,.old,.old2,script,style,noscript,svg,#rc-edbar,#ui,button,input,textarea,select';
function dead(n){var p=n.parentElement;return !p||!!p.closest(SKIP)}
function tnodes(root){var out=[],w=D.createTreeWalker(root||D.body,NodeFilter.SHOW_TEXT,null),n;while((n=w.nextNode())){if(n.nodeValue.trim()&&!dead(n))out.push(n)}return out}
function origOf(n){return ORIG.has(n)?ORIG.get(n):n.nodeValue.trim()}
function occOf(node){var o=origOf(node),c=0,all=tnodes();for(var i=0;i<all.length;i++){if(all[i]===node)return c;if(origOf(all[i])===o)c++}return 0}
function setTxt(n,o,t){if(!ORIG.has(n)){ORIG.set(n,o);RPL.push([n,n.nodeValue])}var v=n.nodeValue,a=v.match(/^\s*/)[0],b=v.match(/\s*$/)[0];if(v!==a+t+b)n.nodeValue=a+t+b}
function eApply(){var L=EDT[curId()];if(!L||!L.length)return;applying=true;
  try{var cnt={};tnodes().forEach(function(n){var o=origOf(n),c=cnt[o]||0;cnt[o]=c+1;if(n.parentElement&&n.parentElement.isContentEditable)return;
    for(var i=0;i<L.length;i++){var e=L[i];if(e[0]===o&&e[2]===c){if(n.nodeValue.trim()!==e[1])setTxt(n,o,e[1]);break}}})}catch(e){console.error(e)}
  applying=false}
function eSoon(){if(eQ)return;eQ=rRAF(function(){eQ=0;eApply()})}
try{new MutationObserver(function(){if(!applying)eSoon()}).observe(D.documentElement,{childList:true,subtree:true,characterData:true})}catch(e){}
function eReset(){var id=curId();delete EDT[id];esave();RPL=RPL.filter(function(p){var n=p[0];if(n.isConnected){n.nodeValue=p[1];ORIG.delete(n);return false}return false});push(1)}
function txEl(t){var el=t&&t.nodeType===1?t:t&&t.parentElement;while(el&&el!==D.body){if(el.closest(SKIP))return null;
    for(var c=el.firstChild;c;c=c.nextSibling)if(c.nodeType===3&&c.nodeValue.trim())return el;el=el.parentElement}return null}
function blockOf(el){while(el&&el.parentElement&&el.parentElement!==D.body&&getComputedStyle(el).display==='inline'&&!el.parentElement.closest(SKIP))el=el.parentElement;return el}
function pickAt(e){var els=[];try{els=D.elementsFromPoint(e.clientX,e.clientY)}catch(x){els=[e.target]}for(var i=0;i<els.length;i++){var el=txEl(els[i]);if(el)return blockOf(el)}return null}
function eBegin(el){eCommit();var ns=tnodes(el);if(!ns.length)return;eAct=el;eSnap=ns.map(function(n){return {n:n,o:origOf(n),c:occOf(n),v:n.nodeValue}});
  el.contentEditable='true';el.spellcheck=false;el.focus();try{var r=D.createRange();r.selectNodeContents(el);var s=W.getSelection();s.removeAllRanges();s.addRange(r)}catch(e){}}
function eCommit(cancel){if(!eAct)return;var el=eAct,sn=eSnap;eAct=null;eSnap=null;el.contentEditable='false';el.removeAttribute('contenteditable');
  if(cancel){sn.forEach(function(s){if(s.n.isConnected)s.n.nodeValue=s.v});return}
  var now=tnodes(el),id=curId(),L=EDT[id]||(EDT[id]=[]),put=function(o,c,t){L=L.filter(function(e){return !(e[0]===o&&e[2]===c)});if(t!==o)L.push([o,t,c]);EDT[id]=L};
  if(now.length===sn.length&&now.every(function(n,i){return n===sn[i].n}))sn.forEach(function(s){var t=s.n.nodeValue.trim();if(t!==s.v.trim()||ORIG.has(s.n))put(s.o,s.c,t);if(!ORIG.has(s.n)&&t!==s.o){ORIG.set(s.n,s.o);RPL.push([s.n,s.v])}});
  else{var t=(el.textContent||'').replace(/\s+/g,' ').trim();sn.forEach(function(s,i){put(s.o,s.c,i?'':t)});}
  if(!EDT[id].length)delete EDT[id];esave();eApply();push(1)}
/* text edit v2: the control window edits the slide's text (list, set, outline) */
function eList(){var all=tnodes(),cnt={},cards=[],L=EDT[curId()]||[],out=[];
  all.forEach(function(n){var o=origOf(n),c=cnt[o]||0;cnt[o]=c+1;var p=n.parentElement,card=p.closest('.bc'),k=-1;
    if(card){k=cards.indexOf(card);if(k<0){cards.push(card);k=cards.length-1}}
    var e=L.find(function(x){return x[0]===o&&x[2]===c});out.push({o:o,c:c,v:e?e[1]:o,k:k,w:!!(card&&card.classList.contains('wait'))})});
  return out}
/* the list waits until the slide's text stops moving (numbers counting up), at most 4 s */
var eLast=0;try{new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var t=ms[i].target,el=t.nodeType===1?t:t.parentElement;if(el&&!el.closest('svg')){eLast=rNow();break}}}).observe(D.documentElement,{childList:true,subtree:true,characterData:true})}catch(e){}
function eTexts(){var t0=rNow();(function w(){if(rNow()-eLast>450||rNow()-t0>4000)post({t:'texts',id:curId(),items:eList()});else rST(w,120)})()}
function eSet(o,c,t){var id=curId();t=String(t==null?'':t).replace(/\s+/g,' ').trim();
  var L=(EDT[id]||[]).filter(function(e){return !(e[0]===o&&e[2]===c)});if(t!==o)L.push([o,t,c]);if(L.length)EDT[id]=L;else delete EDT[id];esave();
  var cnt={};tnodes().forEach(function(n){var oo=origOf(n),cc=cnt[oo]||0;cnt[oo]=cc+1;if(oo===o&&cc===c){if(t===o){if(ORIG.has(n))setTxt(n,o,o)}else setTxt(n,o,t)}});
  push(1)}
function eHl(o,c){var cnt={},hit=null;tnodes().forEach(function(n){var oo=origOf(n),cc=cnt[oo]||0;cnt[oo]=cc+1;if(!hit&&oo===o&&cc===c)hit=n.parentElement});
  if(!hit)return;hit.classList.remove('rce-hl');void hit.offsetWidth;hit.classList.add('rce-hl');clearTimeout(hit._hlT);hit._hlT=rST(function(){hit.classList.remove('rce-hl')},1700)}
(function(){var st=D.createElement('style');st.textContent='@keyframes rcehl{0%,100%{outline-color:rgba(255,210,63,0)}20%,70%{outline-color:rgba(255,210,63,1)}}.rce-hl{outline:3px solid rgba(255,210,63,0)!important;outline-offset:4px;border-radius:4px;animation:rcehl 1.6s ease}';(D.head||D.documentElement).appendChild(st)})();
function editMode(on){editing=on==null?!editing:!!on;if(!editing)eCommit();D.documentElement.classList.toggle('rc-edit',editing);
  if(eHov){eHov.classList.remove('rce-h');eHov=null}push(1)}
(function(){var st=D.createElement('style');st.textContent=
  'html.rc-edit .rce-h{outline:1.5px dashed rgba(255,200,40,.95)!important;outline-offset:2px;cursor:text!important}'+
  'html.rc-edit [contenteditable="true"]{outline:2px solid #ffd23f!important;outline-offset:3px;background:rgba(255,210,63,.16)!important;cursor:text!important;caret-color:#ff7a38;-webkit-user-select:text;user-select:text}'+
  '#rc-edbar{position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:2147483645;display:none;align-items:center;gap:10px;font:600 13px/1.2 "Readex Pro",system-ui,sans-serif;direction:rtl;background:#ffd23f;color:#1c2547;padding:8px 16px;border-radius:999px;box-shadow:0 10px 26px -10px rgba(0,0,0,.55)}'+
  'html.rc-edit #rc-edbar{display:flex}#rc-edbar small{font-weight:500;opacity:.75}'+
  '#rc-edb svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}html.rc-edit #rc-edb{background:#ffd23f!important;color:#1c2547!important}';
  (D.head||D.documentElement).appendChild(st)})();
function eUI(){if(!D.getElementById('rc-edbar')){var b=D.createElement('div');b.id='rc-edbar';b.innerHTML='✎ وضع تعديل النص <small>اضغط على أي نص · Enter حفظ · Esc تراجع · E خروج</small>';D.body.appendChild(b)}
  var ui=null;if(ui&&!D.getElementById('rc-edb')){var k=ui.querySelector('button'),x=D.createElement('button');x.id='rc-edb';x.type='button';x.title='تعديل النص (E)';if(k)x.className=k.className;
    x.innerHTML='<svg viewBox="0 0 24 24"><path d="M21.17 6.81a1 1 0 0 0-3.98-3.98L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z"/><path d="m15 5 4 4"/></svg>';
    x.addEventListener('click',function(e){e.stopPropagation();editMode()});ui.appendChild(x)}}
W.addEventListener('mousemove',function(e){if(!editing)return;var el=pickAt(e);if(el===eHov)return;if(eHov)eHov.classList.remove('rce-h');eHov=el&&el!==eAct?el:null;if(eHov)eHov.classList.add('rce-h')},true);
['pointerdown','mousedown','mouseup','click','dblclick'].forEach(function(t){W.addEventListener(t,function(e){if(!editing)return;var tg=e.target;
  if(tg&&tg.closest&&tg.closest('#rc-edb,#ui,#rc-edbar'))return;
  if(eAct&&(eAct.contains(tg)||(function(){var p=pickAt(e);return p&&(p===eAct||eAct.contains(p))})())){e.stopPropagation();if(!eAct.contains(tg)&&t==='click'){try{var r=D.caretRangeFromPoint(e.clientX,e.clientY);if(r){var s=W.getSelection();s.removeAllRanges();s.addRange(r)}}catch(x){}}return}
  e.stopPropagation();e.preventDefault();if(t!=='click')return;var el=pickAt(e);if(el){if(eHov===el){el.classList.remove('rce-h');eHov=null}eBegin(el)}else eCommit()},true)});

/* ---------------------------------------------------------------- deck adapters */
var A=null;
function txt(h){var d=D.createElement('div');d.innerHTML=String(h||'').replace(/\[\[|\]\]/g,'').replace(/<br\s*\/?>/gi,' ');return (d.textContent||'').replace(/\s+/g,' ').trim()}
function forumAdapter(){
  var hasMap=function(sp){return (sp.cards||[]).some(function(cd){return cd[0]==='map'||cd[0]==='model'})};
  var cardLab=function(cd){var c=cd[2]||{};return txt(c.t||c.k||c.l||c.h||c.title||c.name||c.cap||c.n||'')||cd[0]};
  /* the slide's own title card names it best (many slides share one header); the header goes under it */
  var titleOf=function(sp){var tc=(sp.cards||[]).find(function(cd){return cd[0]==='title'||cd[0]==='wq'}),t=tc?txt((tc[2]||{}).t||''):'';return t||txt(sp.h||'')||((sp.cards||[])[0]?cardLab(sp.cards[0]):'')};
  var subOf=function(sp,t){var h=txt(sp.h||'');return h&&h!==t?h:txt(sp.hs||'')};
  return {
    slides:function(){return ORDER.map(function(n,i){var sp=prep(SLIDES[n]),Pl=plan(sp),steps=[];
      for(var k=0;k<=Pl.max;k++){var cs=(sp.cards||[]).filter(function(cd,j){return Pl.st[j]===k});steps.push(cs.length?cardLab(cs[0]):'')}
      var t=titleOf(sp);return {i:i,n:n,t:t,s:subOf(sp,t),ax:txt(sp.ax||''),steps:steps,map:hasMap(sp)}})},
    cur:function(){return {i:ORDER.indexOf(cur),k:B?B.step:0,max:B?B.max:0}},
    id:function(){return String(cur)},
    go:function(i,k){var n=ORDER[i];if(n==null)return;var ix=ORDER.indexOf(cur);
      if(n!==cur)show(n,i>=ix?1:-1);if(k!=null&&B&&k!==B.step)setStep(Math.max(0,Math.min(B.max,k)))},
    next:function(){go(1)},prev:function(){go(-1)},
    replay:function(){if(!B)return;if(B._mtp)B._mtp.clear();if(B._rtp)B._rtp.clear();var any=false;
      B.cards.forEach(function(cc){if(cc.el.classList.contains('wait')||!cc.pr)return;
        if(cc.type==='model'&&W.MAPCAM){W.MAPCAM(cc,cc.pr);any=true}else if(cc.type==='map'){paint(cc,cc.pr);any=true}});
      if(!any){var n=cur,k=B.step;curLayer&&curLayer.remove();curLayer=null;show(n);if(k)setStep(k)}},
    hasMap:function(){return !!(B&&B.cards.some(function(cc){return (cc.type==='map'||cc.type==='model')&&!cc.el.classList.contains('wait')}))},
    hook:function(){var os=W.show;if(typeof os==='function')W.show=function(n,dir){if(!force&&hid(n)){var d=dir<0?-1:1,j=ORDER.indexOf(n);
        while(j>=0&&j<ORDER.length&&hid(ORDER[j]))j+=d;if(j<0||j>=ORDER.length||ORDER[j]===cur)return;arguments[0]=ORDER[j]}return os.apply(this,arguments)};
      ['show','setStep'].forEach(function(f){var o=W[f];if(typeof o!=='function')return;W[f]=function(){var r=o.apply(this,arguments);push(1);return r}})}
  }}
function centerAdapter(){
  var dms=function(i){return (SL[i].cur||[]).length>4?2600:2200};   /* mapdur v1 */
  var msOf=function(i){try{if(typeof W.MAPDUR==='function')return W.MAPDUR(i)}catch(e){}return dms(i)};
  var mapEl=function(){return D.querySelector('.mapc')||D.getElementById('stage')};
  var startAnim=function(i){var el=mapEl(),ms=msOf(i)+450;ANIM.start(el,ms,1);setTimeout(function(){ANIM.end(el)},ms)};
  return {
    slides:function(){return SL.map(function(s,i){return {i:i,n:i+1,t:txt(s.hd[0]),s:txt(s.hd[1]),ax:'',steps:[''],map:true}})},
    cur:function(){return {i:step,k:0,max:0}},
    id:function(){return String(step)},
    go:function(i){go(i)},next:function(){go(step+1)},prev:function(){go(step-1)},
    replay:function(){var i=step;drawK=0;draw();var el=mapEl();ANIM.start(el,msOf(i)+450,1);
      setTimeout(function(){drawIn(dms(i));setTimeout(function(){ANIM.end(el)},msOf(i))},450)},
    hasMap:function(){return true},
    hook:function(){var o=W.go;W.go=function(i){if(!force&&typeof i==='number'&&i!==step&&hid(i+1)){var d=i>=step?1:-1,j=i;while(j>=0&&j<SL.length&&hid(j+1))j+=d;
        if(j<0||j>=SL.length||j===step)return;i=j}var s=step,r=o.call(this,i);if(step!==s)startAnim(step);push(1);return r}}
  }}
function curId(){try{return A?A.id():'?'}catch(e){return '?'}}

/* ---------------------------------------------------------------- black screen */
var blk=null;
function black(on){if(!blk){blk=D.createElement('div');blk.style.cssText='position:fixed;inset:0;background:#000;z-index:2147483646;opacity:0;pointer-events:none;transition:opacity .6s ease';D.body.appendChild(blk)}
  var v=on==null?blk.style.opacity!=='1':!!on;blk.style.opacity=v?'1':'0';blk.style.pointerEvents=v?'auto':'none';push(1)}

/* ---------------------------------------------------------------- talking to the control window */
var SID=Math.random().toString(36).slice(2,9), bc=null, peer=null, seen=[], lastSent='', sentSlides=false;
try{bc=new BroadcastChannel('forum-ctl')}catch(e){}
var sigN=0;
function post(m){m.ns='fctl';m.from='show';m.deck=DECK;m.sid=SID;m.title=D.title;if(m.t==='sig')m.n=++sigN;
  try{bc&&bc.postMessage(m)}catch(e){}
  var to=[];if(peer)to.push(peer);try{if(W.opener&&!W.opener.closed&&to.indexOf(W.opener)<0)to.push(W.opener)}catch(e){}
  to.forEach(function(w){try{w.postMessage(m,'*')}catch(e){}})}
function state(){if(!A)return null;var c={};try{c=A.cur()}catch(e){}
  return {t:'state',edit:editing,edits:(EDT[curId()]||[]).length,hide:HIDE,cur:c,paused:paused,black:!!(blk&&blk.style.opacity==='1'),anim:animState(),map:(function(){try{return A.hasMap()}catch(e){return false}})()}}
function push(force){var s=state();if(!s)return;var j=JSON.stringify(s);if(!force&&j===lastSent&&!s.anim)return;lastSent=j;post(s)}
function hello(){if(!A)return;var sl=[];try{sl=A.slides()}catch(e){console.error(e)}post({t:'hello',slides:sl,hide:HIDE});sentSlides=true;push(1)}
function handle(m){if(!m||m.ns!=='fctl'||m.from!=='ctl')return;if(m.deck&&m.deck!==DECK&&m.deck!=='*')return;
  if(m.mid){if(seen.indexOf(m.mid)>=0)return;seen.push(m.mid);if(seen.length>60)seen.shift()}
  if(m.c==='learn'){learning=!!m.on;return}
  if(m.c==='cfg'){if(m.cfg&&m.cfg.map){RCFG=m.cfg;try{localStorage.setItem(RK,JSON.stringify(RCFG))}catch(e){}}return}
  if(!A){return}
  var c=m.c;
  if(c==='hello'){hello();return}
  if(c==='pause'){pause();return} if(c==='resume'){resume();return} if(c==='toggle'){paused?resume():pause();return}
  if(c==='black'){black(m.on);return}
  if(c==='edit'){editMode(m.on);return} if(c==='editreset'){eReset();eTexts();return}
  if(c==='texts'){eTexts();return} if(c==='settext'){eSet(m.o,m.oc,m.v);return} if(c==='hl'){eHl(m.o,m.oc);return}
  if(c==='hide'){HIDE=m.hide||{};try{localStorage.setItem(HK,JSON.stringify(HIDE))}catch(e){}push(1);return}
  if(paused&&/^(go|next|prev|replay)$/.test(c))resume();
  try{if(c==='go'){force=1;try{A.go(m.i,m.k)}finally{force=0}}else if(c==='next')A.next();else if(c==='prev')A.prev();else if(c==='replay')A.replay()}catch(e){console.error(e)}
  push(1)}
W.addEventListener('message',function(e){var m=e.data;if(m&&m.ns==='fctl'&&m.from==='ctl'){if(e.source)peer=e.source;handle(m)}});
if(bc)bc.onmessage=function(e){handle(e.data)};
/* heartbeat on the real clock: every 250 ms while a scenario runs or the deck is paused, else every 1.5 s */
var beat=0;(function tick(){beat++;var s=state();if(s&&(s.anim||s.paused||beat%6===0))push(1);rST(tick,250)})();

/* ---------------------------------------------------------------- the remote (Amr, 18 Oct: «ريموت أبل يقلب»)
   Every key or media button that reaches this window goes through one map: the Siri Remote (through SiriMote / Remote Buddy:
   media next / previous / play-pause, or arrows and Enter), presenter clickers (Page Down / Up), the keyboard. The control window can
   teach it any other button («علّم الريموت»); the map is kept in localStorage (shared with the control window) and sent over. */
var RK='fctl-remote', RCFG={map:{},swap:false}, learning=false, aud=null;
function rload(){try{var c=JSON.parse(localStorage.getItem(RK)||'null');if(c&&c.map)RCFG=c}catch(e){}}
rload();W.addEventListener('storage',function(e){if(e.key===RK)rload()});
var RDEF={'k:ArrowLeft':'next','k:ArrowDown':'next','k:PageDown':'next','k:Space':'next','k:Enter':'next','k:NumpadEnter':'next','m:nexttrack':'next','m:seekforward':'next',
  'k:ArrowRight':'prev','k:ArrowUp':'prev','k:PageUp':'prev','k:Backspace':'prev','m:previoustrack':'prev','m:seekbackward':'prev',
  'm:play':'next','m:pause':'next','m:playpause':'next','m:stop':'pause','k:KeyP':'pause','k:KeyB':'black','k:Period':'black','k:KeyR':'replay','k:KeyE':'edit'};
function ract(s){var a=RCFG.map[s];if(a)return a==='none'?null:a;if(RCFG.swap){if(s==='k:ArrowLeft')return 'prev';if(s==='k:ArrowRight')return 'next'}return RDEF[s]||null}
function ksig(e){var k=e.key||'';if(k==='MediaTrackNext')return 'm:nexttrack';if(k==='MediaTrackPrevious')return 'm:previoustrack';if(k==='MediaPlayPause')return 'm:playpause';if(k==='MediaStop')return 'm:stop';return 'k:'+(e.code||k)}
function doAct(a,s){post({t:'sig',sig:s,act:a});if(learning||!A)return;
  if(a==='pause'){paused?resume():pause();return} if(a==='black'){black();return} if(a==='edit'){editMode();return}
  if(paused)resume();try{if(a==='next')A.next();else if(a==='prev')A.prev();else if(a==='replay')A.replay()}catch(e){console.error(e)}push(1)}
W.addEventListener('keydown',function(e){var t=e.target;
  if(t&&t.isContentEditable){if(e.key==='Enter'){e.preventDefault();eCommit()}else if(e.key==='Escape'){e.preventDefault();eCommit(true)}e.stopImmediatePropagation();return}
  if(editing&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();editMode(false);return}
  if(t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName||'')))return;
  var s=ksig(e),a=ract(s);
  if(learning){e.preventDefault();e.stopImmediatePropagation();post({t:'sig',sig:s,act:a});return}
  if(!a){if(paused)resume();return}      /* other keys carry on to the deck (f = full screen, Home, End) */
  e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;playPress(a,s)},true);
/* Amr (18 Oct 10:54): the Mac only hears Play and the volume from the remote. Play = next; two quick presses = back.
   (The volume keys never reach a web page; see «remote-mac» in the offline folder for turning them into Page Down / Up.) */
var pp=null;function playPress(a,s){if(!/^m:(play|pause|playpause)$/.test(s)||a!=='next'){doAct(a,s);return}
  if(pp){rCT(pp);pp=null;doAct('prev',s);return} pp=rST(function(){pp=null;doAct('next',s)},380)}
/* media buttons reach a page only while it plays something: a silent loop starts with the first touch or key */
function silentWav(sec){var sr=8000,n=sr*sec,b=new ArrayBuffer(44+n),v=new DataView(b),w=function(o,s){for(var i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};
  w(0,'RIFF');v.setUint32(4,36+n,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr,true);v.setUint16(32,1,true);v.setUint16(34,8,true);w(36,'data');v.setUint32(40,n,true);
  for(var i=0;i<n;i++)v.setUint8(44+i,128);return URL.createObjectURL(new Blob([b],{type:'audio/wav'}))}
function media(){if(!('mediaSession' in navigator))return;
  try{if(!aud){aud=new Audio(silentWav(10));aud.loop=true}var p=aud.play();if(p&&p.catch)p.catch(function(){})}catch(e){}
  try{navigator.mediaSession.metadata=new MediaMetadata({title:D.title||'منتدى مصر 2026',artist:'الريموت'})}catch(e){}
  ['play','pause','previoustrack','nexttrack','seekbackward','seekforward','stop'].forEach(function(n){try{navigator.mediaSession.setActionHandler(n,function(){var s='m:'+n,a=ract(s);
    if(learning||!a)post({t:'sig',sig:s,act:a});else playPress(a,s);try{aud.play().catch(function(){});navigator.mediaSession.playbackState='playing'}catch(e){}})}catch(e){}});
  try{navigator.mediaSession.playbackState='playing'}catch(e){}}
['pointerdown','keydown'].forEach(function(t){W.addEventListener(t,function(){media()},{capture:true,once:true})});

function boot(){
  try{if(typeof SLIDES!=='undefined'&&typeof ORDER!=='undefined'&&typeof show==='function')A=forumAdapter();
      else if(typeof SL!=='undefined'&&typeof go==='function')A=centerAdapter()}catch(e){console.error(e)}
  if(!A)return;A.hook();try{eUI()}catch(e){console.error(e)}hello()}
if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',function(){rST(boot,0)});else rST(boot,0);
W.RC={pause:pause,resume:resume,isPaused:function(){return paused},now:vnow,deck:DECK,state:state,black:black};
})();
