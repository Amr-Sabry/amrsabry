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
/* lengths measured headlessly (18 Oct) for every map scenario, so the bar is right on the first showing */
var DUR0_EXACT=false;
var DUR0=(W.RC_DUR0||{"v3":{"4:2":2812,"11:2":5810,"13:0":9535,"21:2":5844,"25:3":2830,"32:0":3793,"33:5":6206,"40:2":2920,"42:2":3418,"47:2":6067,"57:5":5503,"58:3":2523,"60:5":6712,"72:2":5544,"77:5":5714,"101:4":3942,"102:7":7479,"102:8":5433,"103:3":5389,"108:2":6657,"118:4":3552,"128:2":2504,"132:4":4229,"136:5":3577,"140:5":4780,"153:7":5843,"154:4":3006,"159:4":4176,"175:2":2883,"179:4":8749,"206:4":7553,"207:2":6854,"217:4":3572,"229:4":11869,"234:4":3768,"235:5":2358},"axes":{"1010:0":23890,"1011:0":37712,"11:2":3026,"21:2":2609,"22:0":24534,"1020:0":31738,"32:0":2676,"33:5":2565,"34:0":15789,"35:2":16606,"39:0":30796,"40:0":31663,"40:2":3117,"41:2":16160,"42:0":6944,"42:2":2782,"43:2":4594,"44:2":5190,"45:2":4858,"47:0":17586,"47:2":4729,"48:0":75632,"49:0":43244,"50:0":82763,"51:2":17568,"52:2":19235,"57:5":2245,"58:0":25031,"58:3":2741,"60:0":5099,"60:5":2273,"64:0":34129,"68:0":31952,"1030:0":22530,"88:0":37331,"93:2":4918,"94:4":5140,"101:4":2404,"102:7":3213,"102:8":3048,"103:0":28218,"103:3":3039,"105:2":4794,"108:0":4972,"108:2":2559,"76:0":27956,"77:0":4926,"77:5":2852,"79:2":4713,"153:7":2750,"154:0":18247,"154:4":2306,"159:0":4838,"159:4":2567,"118:4":2729,"120:0":14927,"1040:0":15019,"7:0":25676,"8:0":28984,"13:0":3046,"14:0":23099,"25:0":5110,"25:3":2588,"1050:0":15398,"179:4":4485,"181:0":32416,"192:0":26861,"201:0":33442,"206:4":2931,"1060:0":23666,"132:4":2939,"134:0":23532,"136:0":5554,"136:5":2646,"140:0":4954,"140:5":2660,"146:0":21744,"169:0":17865,"214:0":34381,"217:0":4622,"217:4":2358,"220:2":4708,"229:4":3203,"232:0":33578,"234:2":4864,"234:4":2276,"235:0":5161,"235:5":2394,"1070:0":29652,"1080:0":28616}})[DECK]||{};
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
