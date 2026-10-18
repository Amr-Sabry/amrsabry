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
['keydown','pointerdown'].forEach(function(t){W.addEventListener(t,function(){if(paused)resume()},true)});

/* ---------------------------------------------------------------- map scenarios: start / end / learned length */
var LSK='fctl-dur-'+DECK, DUR={};
try{DUR=JSON.parse(localStorage.getItem(LSK)||'{}')||{}}catch(e){}
/* lengths measured headlessly at real speed (18 Oct) for every map scenario, so the bar is close on the first showing;
   the length learned on this machine replaces it after the first run */
var DUR0_EXACT=false;
var DUR0=(W.RC_DUR0||{"v3":{"4:2":2448,"11:2":2289,"13:0":2373,"21:2":2417,"25:3":2362,"32:0":2441,"33:5":2203,"40:2":2335,"42:2":2236,"47:2":2277,"57:5":2229,"58:3":2404,"60:5":2269,"72:2":2308,"77:5":2247,"101:4":2602,"102:7":2389,"102:8":2325,"103:3":2264,"108:2":2309,"118:4":2490,"128:2":2412,"132:4":2308,"136:5":2288,"140:5":2337,"153:7":2224,"154:4":2312,"159:4":2258,"175:2":2242,"179:4":2430,"206:4":2230,"207:2":2495,"217:4":2275,"229:4":2293,"234:4":2359,"235:5":2200},"axes":{"1010:0":22165,"1020:0":31656,"34:0":14231,"40:0":30950,"40:2":4053,"43:2":4563,"47:0":17418,"47:2":2742,"50:0":38869,"57:5":2347,"64:0":32420,"94:4":5017,"103:0":27180,"103:3":2376,"76:0":22187,"153:7":2911,"118:4":2844,"13:0":2941,"192:0":26011,"1060:0":20839,"134:0":20147,"146:0":20364,"217:0":4502,"217:4":2237,"232:0":31864,"1070:0":26698,"1011:0":37545,"21:2":2580,"32:0":2483,"35:2":12549,"41:2":11781,"44:2":5224,"48:0":48729,"51:2":14401,"58:0":24847,"58:3":2385,"68:0":31970,"88:0":32704,"101:4":3080,"105:2":4583,"77:0":4876,"77:5":2332,"154:0":16991,"154:4":2541,"120:0":15356,"7:0":25238,"14:0":22277,"25:0":4961,"25:3":2223,"179:4":3082,"201:0":31093,"136:0":4987,"136:5":2247,"169:0":16471,"220:2":4705,"234:2":4862,"234:4":2283,"1080:0":27484,"11:2":2357,"22:0":23279,"33:5":2660,"39:0":30294,"42:0":4868,"42:2":2353,"45:2":5121,"49:0":29045,"52:2":12301,"60:0":4978,"60:5":2373,"1030:0":26246,"93:2":4658,"102:7":2409,"102:8":2438,"108:0":4821,"108:2":2687,"79:2":4645,"159:0":4691,"159:4":2242,"1040:0":14260,"8:0":28276,"1050:0":16974,"181:0":28922,"206:4":2840,"132:4":2527,"140:0":4930,"140:5":2275,"214:0":32388,"229:4":3283,"235:0":4963,"235:5":2326}})[DECK]||{};
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
    hook:function(){['show','setStep'].forEach(function(f){var o=W[f];if(typeof o!=='function')return;W[f]=function(){var r=o.apply(this,arguments);push(1);return r}})}
  }}
function centerAdapter(){
  var msOf=function(i){return (SL[i].cur||[]).length>4?2600:2200};
  var mapEl=function(){return D.querySelector('.mapc')||D.getElementById('stage')};
  var startAnim=function(i){var el=mapEl(),ms=msOf(i)+450;ANIM.start(el,ms,1);setTimeout(function(){ANIM.end(el)},ms)};
  return {
    slides:function(){return SL.map(function(s,i){return {i:i,n:i+1,t:txt(s.hd[0]),s:txt(s.hd[1]),ax:'',steps:[''],map:true}})},
    cur:function(){return {i:step,k:0,max:0}},
    id:function(){return String(step)},
    go:function(i){go(i)},next:function(){go(step+1)},prev:function(){go(step-1)},
    replay:function(){var i=step;drawK=0;draw();var el=mapEl();ANIM.start(el,msOf(i)+450,1);
      setTimeout(function(){drawIn(msOf(i));setTimeout(function(){ANIM.end(el)},msOf(i))},450)},
    hasMap:function(){return true},
    hook:function(){var o=W.go;W.go=function(i){var s=step,r=o.apply(this,arguments);if(step!==s)startAnim(step);push(1);return r}}
  }}
function curId(){try{return A?A.id():'?'}catch(e){return '?'}}

/* ---------------------------------------------------------------- black screen */
var blk=null;
function black(on){if(!blk){blk=D.createElement('div');blk.style.cssText='position:fixed;inset:0;background:#000;z-index:2147483646;opacity:0;pointer-events:none;transition:opacity .6s ease';D.body.appendChild(blk)}
  var v=on==null?blk.style.opacity!=='1':!!on;blk.style.opacity=v?'1':'0';blk.style.pointerEvents=v?'auto':'none';push(1)}

/* ---------------------------------------------------------------- talking to the control window */
var SID=Math.random().toString(36).slice(2,9), bc=null, peer=null, seen=[], lastSent='', sentSlides=false;
try{bc=new BroadcastChannel('forum-ctl')}catch(e){}
function post(m){m.ns='fctl';m.from='show';m.deck=DECK;m.sid=SID;m.title=D.title;
  try{bc&&bc.postMessage(m)}catch(e){}
  var to=[];if(peer)to.push(peer);try{if(W.opener&&!W.opener.closed&&to.indexOf(W.opener)<0)to.push(W.opener)}catch(e){}
  to.forEach(function(w){try{w.postMessage(m,'*')}catch(e){}})}
function state(){if(!A)return null;var c={};try{c=A.cur()}catch(e){}
  return {t:'state',cur:c,paused:paused,black:!!(blk&&blk.style.opacity==='1'),anim:animState(),map:(function(){try{return A.hasMap()}catch(e){return false}})()}}
function push(force){var s=state();if(!s)return;var j=JSON.stringify(s);if(!force&&j===lastSent&&!s.anim)return;lastSent=j;post(s)}
function hello(){if(!A)return;var sl=[];try{sl=A.slides()}catch(e){console.error(e)}post({t:'hello',slides:sl});sentSlides=true;push(1)}
function handle(m){if(!m||m.ns!=='fctl'||m.from!=='ctl')return;if(m.deck&&m.deck!==DECK&&m.deck!=='*')return;
  if(m.mid){if(seen.indexOf(m.mid)>=0)return;seen.push(m.mid);if(seen.length>60)seen.shift()}
  if(!A){return}
  var c=m.c;
  if(c==='hello'){hello();return}
  if(c==='pause'){pause();return} if(c==='resume'){resume();return} if(c==='toggle'){paused?resume():pause();return}
  if(c==='black'){black(m.on);return}
  if(paused&&/^(go|next|prev|replay)$/.test(c))resume();
  try{if(c==='go')A.go(m.i,m.k);else if(c==='next')A.next();else if(c==='prev')A.prev();else if(c==='replay')A.replay()}catch(e){console.error(e)}
  push(1)}
W.addEventListener('message',function(e){var m=e.data;if(m&&m.ns==='fctl'&&m.from==='ctl'){if(e.source)peer=e.source;handle(m)}});
if(bc)bc.onmessage=function(e){handle(e.data)};
/* heartbeat on the real clock: every 250 ms while a scenario runs or the deck is paused, else every 1.5 s */
var beat=0;(function tick(){beat++;var s=state();if(s&&(s.anim||s.paused||beat%6===0))push(1);rST(tick,250)})();

function boot(){
  try{if(typeof SLIDES!=='undefined'&&typeof ORDER!=='undefined'&&typeof show==='function')A=forumAdapter();
      else if(typeof SL!=='undefined'&&typeof go==='function')A=centerAdapter()}catch(e){console.error(e)}
  if(!A)return;A.hook();hello()}
if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',function(){rST(boot,0)});else rST(boot,0);
W.RC={pause:pause,resume:resume,isPaused:function(){return paused},now:vnow,deck:DECK,state:state,black:black};
})();
