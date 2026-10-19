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
/* ns mode v1: ?ns=<name> keeps this window's storage and messages apart (the promo's live copy) */
var NS=(new URLSearchParams(location.search).get('ns')||'').replace(/[^a-z0-9_-]/gi,''), KD=DECK+(NS?'~'+NS:'');
var rNow=P.now.bind(P), rRAF=W.requestAnimationFrame.bind(W), rCAF=W.cancelAnimationFrame.bind(W),
    rST=W.setTimeout.bind(W), rCT=W.clearTimeout.bind(W);
var RATE=+(new URLSearchParams(location.search).get('rcspeed'))||1;
/* pv mode v1: ?preview=1 = a silent copy inside the control window (see «preview» near the end) */
var PV=/[?&]preview=1(&|$)/.test(location.search);
/* ed mode v1: ?edit=1 = the slide editor's canvas (see «the editor's canvas») */
var ED=/[?&]edit=1(&|$)/.test(location.search);

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
var LSK='fctl-dur-'+KD, DUR={};
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
    DUR[a.k]=Math.round(vnow()-a.t0);if(!PV)try{localStorage.setItem(LSK,JSON.stringify(DUR))}catch(e){}
    active=active.filter(function(x){return x!==a});push(1)},
  list:function(){return active},dur:function(){return DUR}};
function animState(){active=active.filter(function(a){return a.c.isConnected});
  if(!active.length)return null;
  var now=vnow(),best=null;
  active.forEach(function(a){var t=now-a.t0,rem=a.est?Math.max(0,a.est-t):-1;if(!best||rem>best.rem)best={t:t,dur:a.est,rem:rem,known:a.known}});
  return best}

/* ---------------------------------------------------------------- hidden slides (slide hide v1): Next / Back skip them, a direct jump still opens one */
var HK='fctl-hide-'+KD, HIDE={}, force=0;
function hload(){try{HIDE=JSON.parse(localStorage.getItem(HK)||'{}')||{}}catch(e){HIDE={}}}
hload();W.addEventListener('storage',function(e){if(e.key===HK){hload();push(1)}});
function hid(n){return !!HIDE[String(n)]}

/* ---------------------------------------------------------------- text edit (text edit v1, Amr 19 Oct: «امكانية الايديت على اي نص في السلايد من خلال زر ايديت»)
   The «تعديل النص» button (control window, the deck's bar or the E key) puts the show in edit mode: hover marks a text, a click makes
   it editable, Enter keeps it, Esc puts it back. Each change is kept per slide (original text, its occurrence on the slide → new text)
   in localStorage «fctl-edit-<deck>» and laid over the slide whenever it is drawn again, so it survives rebuilds, reloads and replays. */
var EK='fctl-edit-'+KD, EDT={}, editing=false, ORIG=new WeakMap(), RPL=[], eAct=null, eSnap=null, eHov=null, applying=false, eQ=0;
function eload(){try{EDT=JSON.parse(localStorage.getItem(EK)||'{}')||{}}catch(e){EDT={}}}
eload();W.addEventListener('storage',function(e){if(e.key===EK){eload();eSoon()}});
function esave(){try{localStorage.setItem(EK,JSON.stringify(EDT))}catch(e){}}
var SKIP='.out,.gone,.bye,.old,.old2,script,style,noscript,svg,#rc-edbar,#ui,button,input,textarea,select';
function dead(n){var p=n.parentElement;return !p||!!p.closest(SKIP)}
function tnodes(root){var out=[],w=D.createTreeWalker(root||D.body,NodeFilter.SHOW_TEXT,null),n;while((n=w.nextNode())){if(n.nodeValue.trim()&&!dead(n))out.push(n)}return out}
function origOf(n){if(ORIG.has(n))return ORIG.get(n);var t=n.nodeValue.trim();return nOrig(n,t)}
/* ---------------------------------------------------------------- number edits drive the charts (num edit v1, Amr 19 Oct:
   «لما بغير في النسب المفروض يغير في ال pichart او اي رسوم بيانية ولو فيه ايقونات بتعبر عن عدد … تتغير معانا»)
   A number edited in a forum deck card is written into the card's data (not laid over the text) and the card is drawn again, so the
   counter counts to it and its pie, ring, bars, columns and icon rows follow. Per slide in localStorage «fctl-num-<deck>»:
   {slide id: [[card index, path, original value, new value]]}; the original is kept, so ↺ puts it back. */
var NK='fctl-num-'+KD, NUM={}, NF=new WeakSet(), NRX=/\d[\d,]*(?:\.\d+)?/g;
function nload(){try{NUM=JSON.parse(localStorage.getItem(NK)||'{}')||{}}catch(e){NUM={}}}
nload();W.addEventListener('storage',function(e){if(e.key===NK)nload()});
function nsave(){try{localStorage.setItem(NK,JSON.stringify(NUM))}catch(e){}}
function nNorm(s){return String(s==null?'':s).replace(/[٠-٩]/g,function(d){return d.charCodeAt(0)-1632}).replace(/[۰-۹]/g,function(d){return d.charCodeAt(0)-1776}).replace(/٫/g,'.').replace(/٬/g,',')}
function nTok(s){return String(s).match(NRX)||[]}
function nVal(t){var v=+String(t).replace(/,/g,'');return isFinite(v)?v:null}
function nFmt(v,like){return (String(like).indexOf(',')>=0||Math.abs(v)>=10000)?Number(v).toLocaleString('en-US',{maximumFractionDigits:6}):String(v)}
function nOn(){return typeof SLIDES!=='undefined'&&typeof B!=='undefined'&&!!B&&typeof W.paint==='function'&&typeof W.prep==='function'}
/* one number changed and nothing else (spaces and % aside) */
function nDiff(o,t){o=nNorm(o);t=nNorm(t);var a=nTok(o),b=nTok(t);if(!a.length||a.length!==b.length)return null;
  var sk=function(s){return s.replace(NRX,'#').replace(/[%\s]/g,'')};if(sk(o)!==sk(t))return null;
  var k=-1;for(var i=0;i<a.length;i++)if(nVal(a[i])!==nVal(b[i])){if(k>=0)return null;k=i}
  return k<0?null:{from:nVal(a[k]),to:nVal(b[k])}}
function nCard(n){if(!nOn())return null;var p=n.parentElement,el=p&&p.closest('.bc');if(!el)return null;
  for(var i=0;i<B.cards.length;i++)if(B.cards[i].el===el)return B.cards[i];return null}
/* the text a node was drawn with (before any text laid over it) */
function dataTxt(n){if(!ORIG.has(n))return n.nodeValue.trim();for(var i=RPL.length-1;i>=0;i--)if(RPL[i][0]===n)return String(RPL[i][1]).trim();return ORIG.get(n)}
function nWalk(o,p,fn){if(o==null||typeof o!=='object')return;
  (Array.isArray(o)?o.map(function(_,i){return i}):Object.keys(o)).forEach(function(k){if(typeof k==='string'&&k[0]==='_')return;var v=o[k],q=p.concat([k]);
    if(typeof v==='number')fn('n',q,v);else if(typeof v==='string')fn('s',q,v);else nWalk(v,q,fn)})}
/* which value of the card's data the number on screen came from: a value (v, n) first, else a number written in its text */
function nTarget(n,d){var cc=nCard(n);if(!cc||!cc.c||/^(map|model|photo|kin)$/.test(cc.type))return null;
  var nums=[],strs=[];nWalk(cc.c,[],function(ty,q,v){var key=q[q.length-1];
    if(ty==='n'&&(key==='v'||key==='n')&&v===d.from)nums.push(q);
    else if(ty==='s'&&/^(t|sub|l|s|pre|k|h|lab)$/.test(key))nTok(v).forEach(function(x,i){if(nVal(x)===d.from)strs.push(q.concat(['#'+i]))})});
  var cand=nums.length?nums:strs;if(!cand.length)return null;
  var idx=0,ns=tnodes(cc.el);for(var i=0;i<ns.length&&ns[i]!==n;i++)if(nTok(nNorm(dataTxt(ns[i]))).map(nVal).indexOf(d.from)>=0)idx++;
  return {cc:cc,p:cand[Math.min(idx,cand.length-1)]}}
function nPut(c,p,v){var o=c;for(var i=0;i<p.length-1;i++){var k=p[i],nx=p[i+1];
    if(typeof nx==='string'&&nx[0]==='#'){var ti=+nx.slice(1),j=-1;o[k]=String(o[k]).replace(NRX,function(m){j++;return j===ti?nFmt(v,m):m});return}
    o=o[k];if(o==null)return}
  o[p[p.length-1]]=v}
function nRepaint(cc){var r=cc.r||cc.pr||cc.r0;if(!r)return;var on=!cc.el.classList.contains('wait');
  try{W.paint(cc,r,on?1:0);if(on)W.post(cc.el,60,false)}catch(e){console.error(e)}}
/* shown = the text the node was drawn with, t = the new text → true when the change went into the data */
function nEdit(n,shown,t){if(!nOn())return false;var d=nDiff(shown,t);if(!d)return false;var tg=nTarget(n,d);if(!tg)return false;
  var id=curId(),L=NUM[id]||[],key=JSON.stringify([tg.cc.i,tg.p]),r=null;
  for(var i=0;i<L.length;i++)if(JSON.stringify([L[i][0],L[i][1]])===key){r=L[i];break}
  if(!r){r=[tg.cc.i,tg.p,d.from,d.to];L.push(r)}else r[3]=d.to;
  if(r[3]===r[2])L.splice(L.indexOf(r),1);
  if(L.length)NUM[id]=L;else delete NUM[id];nsave();
  nPut(tg.cc.c,tg.p,d.to);nRepaint(tg.cc);return true}
/* before a slide is drawn its saved numbers go into its cards */
function nApply(n){var L=NUM[String(n)];if(!L||!L.length||typeof SLIDES==='undefined'||!SLIDES[n])return;var sp=W.prep(SLIDES[n]);
  L.forEach(function(r){var cd=(sp.cards||[])[r[0]];if(cd&&cd[2])try{nPut(cd[2],r[1],r[3])}catch(e){}})}
function nReset(id){var L=NUM[id];if(!L)return;delete NUM[id];nsave();if(!nOn()||String(cur)!==String(id))return;
  L.forEach(function(r){var cc=B.cards[r[0]];if(cc&&cc.c){nPut(cc.c,r[1],r[2]);nRepaint(cc)}})}
function nBoot(){if(!nOn())return;var k=String(cur);if(NUM[k]||SPEC[k])reShow()}

/* ---------------------------------------------------------------- slide layout and texts from the editor (ed mode v1, Amr 19 Oct:
   «لما اضغط edit على سلايد يفتح السلايد في صفحة كانفا تقدر تضغط فيه على اي لاير وتغيره»)
   localStorage «fctl-spec-<deck>»: {slide n: {card | 'hdr': {g:[col,row,cols,rows], f:{'path': value}}}}; numbers stay in «fctl-num-<deck>».
   Before a slide is drawn the originals are put back, then the editor's changes and the numbers are laid over them. */
var SK='fctl-spec-'+KD, SPEC={}, NAP={};
function sload(){try{SPEC=JSON.parse(localStorage.getItem(SK)||'{}')||{}}catch(e){SPEC={}}}
sload();
function pget(o,p){for(var i=0;i<p.length;i++){if(o==null||typeof o!=='object')return undefined;o=o[p[i]]}return o}
function pset(o,p,v){for(var i=0;i<p.length-1;i++){if(o==null||typeof o!=='object')return false;o=o[p[i]]}if(o==null||typeof o!=='object')return false;
  if(v===undefined)delete o[p[p.length-1]];else o[p[p.length-1]]=v;return true}
function npath(p){return (p.length&&typeof p[p.length-1]==='string'&&p[p.length-1][0]==='#')?p.slice(0,-1):p}
function layApply(n){if(typeof SLIDES==='undefined'||!SLIDES[n]||typeof W.prep!=='function')return;var sp=W.prep(SLIDES[n]),cs=sp.cards||[],key=String(n);
  (NAP[key]||[]).slice().reverse().forEach(function(x){var cd=cs[x[0]];if(cd&&cd[2])pset(cd[2],x[1],x[2])});NAP[key]=[];
  var P=sp._sPris||(sp._sPris={});
  Object.keys(P).forEach(function(j){var q=P[j],o=j==='hdr'?sp:(cs[j]&&cs[j][2]);if(!o)return;if(q.g&&cs[j])cs[j][1]=q.g.slice();
    Object.keys(q.f||{}).forEach(function(k){pset(o,k.split('.'),q.f[k])})});
  var O=SPEC[key]||{};
  Object.keys(O).forEach(function(j){var o=O[j]||{},tg=j==='hdr'?sp:(cs[j]&&cs[j][2]);if(!tg)return;var q=P[j]||(P[j]={f:{}});
    if(o.g&&j!=='hdr'&&Array.isArray(cs[j][1])){if(!q.g)q.g=cs[j][1].slice();cs[j][1]=o.g.slice()}
    Object.keys(o.f||{}).forEach(function(k){var p=k.split('.');if(!(k in q.f))q.f[k]=pget(tg,p);pset(tg,p,o.f[k])})});
  (NUM[key]||[]).forEach(function(r){var cd=cs[r[0]];if(!cd||!cd[2])return;var fp=npath(r[1]);NAP[key].push([r[0],fp,pget(cd[2],fp)]);try{nPut(cd[2],r[1],r[3])}catch(e){}});
  delete sp._plan}
/* draw the slide on screen again, on the same card, without the push */
function reShow(){if(!nOn())return;var k=B?B.step:0,n=cur;force=1;
  try{if(curLayer){curLayer.remove();curLayer=null}W.show(n);if(B&&k)W.setStep(Math.min(B.max,k))}catch(e){console.error(e)}finally{force=0}}
W.addEventListener('storage',function(e){if(e.key!==SK&&e.key!==NK)return;if(e.key===SK)sload();else nload();if(ED||!nOn())return;
  var k=String(cur),hit=true;try{var a=JSON.parse(e.oldValue||'{}')||{},b=JSON.parse(e.newValue||'{}')||{};hit=JSON.stringify(a[k]||null)!==JSON.stringify(b[k]||null)}catch(x){}
  if(!hit)return;if(PV){if(paused)resume();reShow();rCT(pvT);pvT=rST(function(){pause()},3200)}else{if(paused)resume();reShow()}});

/* ---------------------------------------------------------------- the editor's canvas (?edit=1) */
var EDI=-1, edSel=null, edHov=null, drg=null;
var EDX={bg:1,ic:1,icc:1,ki:1,wm:1,img:1,pos:1,cls:1,mode:1,id:1,lic:1,icon:1,col:1,lid:1,alt:1,alta:1,altb:1,src:1,href:1,url:1,ya:0};
var EDS={list:1,geo:1,info:1,opt:1,places:1,ba:1,lays:1,seq:1,ids:1,words:1};
function edPost(m){m.ns='fctl-ed';m.from='deck';try{W.parent.postMessage(m,'*')}catch(e){}}
/* the texts and numbers a card shows, with the path to each in its data */
function edFields(c){var out=[];
  (function walk(o,p){if(o==null||typeof o!=='object')return;
    if(Array.isArray(o)){o.forEach(function(x,i){var q=p.concat([i]);if(typeof x==='string'){if(!/^[a-z0-9-]+$/.test(x))out.push({p:q.join('.'),v:x,num:0,key:String(p[p.length-1]||'')})}else if(typeof x==='number'){}else walk(x,q)});return}
    Object.keys(o).forEach(function(k){if(k[0]==='_'||EDX[k]||EDS[k])return;var v=o[k],q=p.concat([k]);
      if(typeof v==='string'){if(/[؀-ۿ\d]/.test(v)||/^(t|k|s|l|h|sub|pre|u|cap|by|lab|name|chip|foot|y|la|lb)$/.test(k))out.push({p:q.join('.'),v:v,num:0,key:k})}
      else if(typeof v==='number'){if(k==='v'||k==='n'||k==='y')out.push({p:q.join('.'),v:v,num:k==='y'?0:1,key:k})}
      else walk(v,q)})})(c,[]);
  return out.filter(function(f){return !/^(fs|ss|mi|cols|gap|every|vis|pie|pz|top|hero|withHero|k2|no|vfs|nf|sz)$/.test(f.key)||f.num})}
function edCardLab(cc){var c=cc.c||{};return txt(c.t||c.k||c.l||c.h||c.cap||c.name||(c.items&&c.items[0]&&(c.items[0].l||c.items[0].k||c.items[0].t))||'')}
function edG(j){var sp=SLIDES[cur],cd=sp&&sp.cards&&sp.cards[j];return cd&&Array.isArray(cd[1])?cd[1]:null}
function edRectG(g){return W.R(g[0],g[1],g[2],g[3],SLIDES[cur].full)}
function edStageRect(el){var st=D.getElementById('stage'),a=st.getBoundingClientRect(),b=el.getBoundingClientRect(),s=W.curScale();return {x:(b.left-a.left)/s,y:(b.top-a.top)/s,w:b.width/s,h:b.height/s}}
function edRect(j){if(j==null)return null;if(j==='hdr'){var h=D.getElementById('hdx');return h&&!h.classList.contains('off')?edStageRect(h.firstElementChild||h):null}
  if(drg&&drg.j===j)return edRectG(drg.g);var cc=B&&B.cards[j];return cc?(cc.r||cc.r0):null}
function edLayers(){var sp=SLIDES[cur],Pl=W.plan(sp),P=sp._sPris||{},key=String(cur),nap=NAP[key]||[];
  var orig=function(j,p){var q=P[j];if(q&&q.f&&(p in q.f))return q.f[p];var pa=p.split('.').map(function(x){return /^\d+$/.test(x)?+x:x}).join('.');
    for(var i=0;i<nap.length;i++)if(nap[i][0]===j&&nap[i][1].join('.')===pa)return nap[i][2];return undefined};
  var cards=B.cards.map(function(cc){var cd=sp.cards[cc.i],fs=edFields(cc.c);fs.forEach(function(f){var o=orig(cc.i,f.p);if(o!==undefined&&o!==f.v)f.o=o});
    var o={},q=P[cc.i];['bg','ic','img'].forEach(function(k){if(q&&q.f&&(k in q.f))o[k]=q.f[k]==null?'':q.f[k]});
    return {j:cc.i,type:cc.type,g:Array.isArray(cd[1])?cd[1].slice():null,g0:P[cc.i]&&P[cc.i].g?P[cc.i].g.slice():null,st:Pl.st[cc.i],bg:cc.c.bg||'',ic:cc.c.ic||'',img:cc.c.img||'',o:o,label:edCardLab(cc),fields:fs}});
  var hf=['h','hs','ax'].filter(function(k){return typeof sp[k]==='string'&&sp[k]}).map(function(k){var f={p:k,v:sp[k],num:0,key:k},o=orig('hdr',k);if(o!==undefined&&o!==f.v)f.o=o;return f});
  return {t:'layers',i:ORDER.indexOf(cur),n:cur,total:ORDER.length,title:txt(((sp.cards||[]).find(function(cd){return cd[0]==='title'})||[0,0,{}])[2].t||sp.h||''),full:!!sp.full,cards:cards,hdr:hf.length?{j:'hdr',type:'hdr',label:txt(sp.h||''),fields:hf}:null}}
function edOpen(i){var n=ORDER[i];if(n==null)return;EDI=i;force=1;
  try{if(curLayer){curLayer.remove();curLayer=null}W.show(n);if(B)W.setStep(B.max)}catch(e){console.error(e)}finally{force=0}
  rST(function(){edBoxes();edPost(edLayers())},150);rST(edBoxes,1300)}
/* what was clicked: a card (or the header) and the text under the pointer */
function edPick(t){var el=t&&t.nodeType===1?t:t&&t.parentElement;if(!el||!el.closest)return null;
  if(el.closest('#hdx'))return {j:'hdr',p:edMatch(el,'hdr')};
  var card=el.closest('.bc');if(!card||!B)return null;var cc=null;for(var i=0;i<B.cards.length;i++)if(B.cards[i].el===card){cc=B.cards[i];break}
  return cc?{j:cc.i,p:edMatch(el,cc)}:null}
function edMatch(el,cc){var t=(el.textContent||'').replace(/\s+/g,' ').trim();if(!t)return null;var sp=SLIDES[cur];
  var fs=cc==='hdr'?['h','hs','ax'].filter(function(k){return typeof sp[k]==='string'}).map(function(k){return {p:k,v:sp[k],num:0}}):edFields(cc.c),best=null,bs=0;
  fs.forEach(function(f){var d=f.num?String(typeof fmt==='function'?fmt(f.v):f.v):txt(String(f.v)),s=0;
    if(d===t)s=3;else if(d&&t.indexOf(d)>=0)s=2+d.length/1e4;else if(d&&d.indexOf(t)>=0)s=1+t.length/1e4;if(s>bs){bs=s;best=f.p}});
  return best}
function edOv(){var st=D.getElementById('stage'),o=D.getElementById('ed-ov');if(!o&&st){o=D.createElement('div');o.id='ed-ov';st.appendChild(o)}return o}
function edBox(cls,r){return '<div class="'+cls+'" style="left:'+r.x+'px;top:'+r.y+'px;width:'+r.w+'px;height:'+r.h+'px"></div>'}
function edBoxes(){var o=edOv();if(!o||!B)return;var h='';
  if(drg){for(var c=0;c<12;c++)for(var r=0;r<6;r++)h+=edBox('gc',edRectG([c,r,1,1]))}
  if(edHov!=null&&edHov!==edSel){var rh=edRect(edHov);if(rh)h+=edBox('bx hv',rh)}
  if(edSel!=null){var rs=edRect(edSel);if(rs){h+=edBox('bx sl',rs);
    if(edSel!=='hdr'&&edG(edSel))['nw','n','ne','e','se','s','sw','w'].forEach(function(k){var x=rs.x+(/w/.test(k)?0:/e/.test(k)?rs.w:rs.w/2),y=rs.y+(/n/.test(k)?0:/s/.test(k)?rs.h:rs.h/2);
      h+='<i class="h" data-h="'+k+'" style="left:'+x+'px;top:'+y+'px;cursor:'+k+'-resize"></i>'})}}
  o.innerHTML=h}
function edXY(e){var st=D.getElementById('stage'),a=st.getBoundingClientRect(),s=W.curScale();return {x:(e.clientX-a.left)/s,y:(e.clientY-a.top)/s}}
function edUnit(){var a=edRectG([0,0,1,1]),b=edRectG([1,1,1,1]);return {u:b.x-a.x,v:b.y-a.y}}
function edDragTo(xy){var d=drg,U=edUnit(),dc=Math.round((xy.x-d.x0)/U.u),dr=Math.round((xy.y-d.y0)/U.v),g=d.g0.slice(),h=d.h,cl=function(v,a,b){return Math.max(a,Math.min(b,v))};
  if(h==='m'){g[0]=cl(d.g0[0]+dc,0,12-g[2]);g[1]=cl(d.g0[1]+dr,0,6-g[3])}
  else{if(/e/.test(h))g[2]=cl(d.g0[2]+dc,1,12-d.g0[0]);
    if(/w/.test(h)){var c0=cl(d.g0[0]+dc,0,d.g0[0]+d.g0[2]-1);g[2]=d.g0[2]-(c0-d.g0[0]);g[0]=c0}
    if(/s/.test(h))g[3]=cl(d.g0[3]+dr,1,6-d.g0[1]);
    if(/n/.test(h)){var r0=cl(d.g0[1]+dr,0,d.g0[1]+d.g0[3]-1);g[3]=d.g0[3]-(r0-d.g0[1]);g[1]=r0}}
  if(g.join()!==d.g.join()){d.g=g;var cc=B.cards[d.j];if(cc)W.place(cc.el,edRectG(g))}edBoxes()}
function edMsg(m){
  if(!nOn()){edPost({t:'unsupported'});return}
  if(m.c==='open'){sload();nload();edSel=null;edOpen(m.i);return}
  if(m.c==='redraw'){sload();nload();edOpen(EDI<0?0:EDI);return}
  if(m.c==='sel'){edSel=m.j;edBoxes();return}
  if(m.c==='hover'){edHov=m.j;edBoxes();return}
  if(m.c==='slides'){var sl=[];try{sl=A.slides()}catch(e){}edPost({t:'slides',list:sl});return}
  if(m.c==='icons'){var q=String(m.q||'').trim().toLowerCase(),names=m.names||[];
    if(q&&W.lucide&&lucide.icons)names=Object.keys(lucide.icons).map(function(k){return k.replace(/([a-z0-9])([A-Z])/g,'$1-$2').replace(/([a-zA-Z])(\d)/g,'$1-$2').toLowerCase()}).filter(function(n){return n.indexOf(q)>=0}).slice(0,72);
    edPost({t:'icons',q:q,list:names.map(function(n){var s='';try{s=typeof ICON==='function'?ICON(n,24):''}catch(e){}return [n,s]}).filter(function(x){return x[1]})});return}
  if(m.c==='swatches'){var out=[];['dark','dark2','vio','mint','grad','light'].forEach(function(k){var el=D.createElement('div');el.className='bc '+k;el.style.cssText='position:absolute;left:-9999px;top:0;width:60px;height:40px';
      (D.getElementById('stage')||D.body).appendChild(el);var cs=getComputedStyle(el);out.push([k,cs.backgroundImage,cs.backgroundColor,cs.color]);el.remove()});edPost({t:'swatches',list:out});return}
  if(m.c==='images'){var set={};ORDER.forEach(function(n){var s='';try{s=JSON.stringify(SLIDES[n].cards||[])}catch(e){}(s.match(/"img":"([^"]+)"/g)||[]).forEach(function(x){set[x.slice(7,-1)]=1});
      (s.match(/\bp\d+_[a-z0-9_]+/g)||[]).forEach(function(x){set[x]=1})});
    edPost({t:'images',base:(function(){try{return new URL('img/',D.baseURI).href}catch(e){return 'img/'}})(),list:Object.keys(set).sort()});return}
}
if(ED){(function(){var s=D.createElement('style');s.textContent=
  '#ui,#prog,#rc-edbar,#aroma-mascot,.aroma-notes{display:none!important}'+
  'html.rc-ed *,html.rc-ed *::before,html.rc-ed *::after{transition-duration:0s!important;transition-delay:0s!important;animation-duration:.001s!important;animation-delay:0s!important}'+
  '#ed-ov{position:absolute;left:0;top:0;width:1600px;height:900px;z-index:2147483000;pointer-events:none}#ed-ov .bx{position:absolute;box-sizing:border-box;border-radius:22px}'+
  '#ed-ov .hv{outline:2px dashed rgba(20,20,20,.75);outline-offset:3px}'+
  '#ed-ov .sl{outline:3px solid #111;outline-offset:3px;box-shadow:0 0 0 6px rgba(255,255,255,.85)}'+
  '#ed-ov .h{position:absolute;width:16px;height:16px;margin:-8px 0 0 -8px;background:#fff;border:2.5px solid #111;border-radius:5px;pointer-events:auto;box-shadow:0 2px 6px rgba(0,0,0,.3)}'+
  '#ed-ov .gc{position:absolute;box-sizing:border-box;border:1.5px dashed rgba(20,20,20,.28);border-radius:18px}'+
  'html.rc-ed,html.rc-ed *{cursor:default!important;user-select:none!important}html.rc-ed .bc,html.rc-ed #hdx{cursor:pointer!important}html.rc-ed #ed-ov .h{cursor:inherit}';
  (D.head||D.documentElement).appendChild(s);D.documentElement.classList.add('rc-ed')})();
  W.addEventListener('message',function(e){var m=e.data;if(m&&m.ns==='fctl-ed'&&m.from==='editor'&&e.source===W.parent)edMsg(m)});
  ['mousedown','mouseup','click','dblclick','contextmenu','touchstart','wheel','keydown'].forEach(function(t){W.addEventListener(t,function(e){e.stopPropagation();if(t!=='wheel')e.preventDefault();
    if(t==='keydown')edPost({t:'key',k:e.key,m:!!(e.metaKey||e.ctrlKey),s:!!e.shiftKey})},{capture:true,passive:false})});
  W.addEventListener('pointerdown',function(e){e.stopPropagation();e.preventDefault();if(!nOn())return;var t=e.target,xy=edXY(e),hd=t&&t.closest&&t.closest('#ed-ov .h');
    if(hd&&edSel!=null&&edG(edSel)){drg={j:edSel,h:hd.dataset.h,x0:xy.x,y0:xy.y,g0:edG(edSel).slice(),g:edG(edSel).slice()};edBoxes();return}
    var pk=edPick(t);edSel=pk?pk.j:null;edPost({t:'pick',j:edSel,p:pk&&pk.p});
    if(pk&&pk.j!=='hdr'&&edG(pk.j))drg={j:pk.j,h:'m',x0:xy.x,y0:xy.y,g0:edG(pk.j).slice(),g:edG(pk.j).slice(),idle:1};edBoxes()},true);
  W.addEventListener('pointermove',function(e){e.stopPropagation();if(!nOn())return;var xy=edXY(e);
    if(drg){if(drg.idle&&Math.hypot(xy.x-drg.x0,xy.y-drg.y0)<6)return;drg.idle=0;edDragTo(xy);return}
    var pk=edPick(e.target),hj=pk?pk.j:null;if(hj!==edHov){edHov=hj;edBoxes();edPost({t:'hover',j:hj})}},true);
  W.addEventListener('pointerup',function(e){e.stopPropagation();if(!drg)return;var d=drg;drg=null;
    if(!d.idle&&d.g.join()!==d.g0.join())edPost({t:'rect',j:d.j,g:d.g});else{var cc=B&&B.cards[d.j];if(cc&&!d.idle)W.place(cc.el,edRectG(d.g0))}edBoxes()},true);
  W.addEventListener('resize',function(){rST(edBoxes,60)})}

/* a number drawn from edited data still answers to its original text in the panel and the saved text edits */
function nOrig(n,t){var L=NUM[curId()];if(!L||!L.length||!/\d/.test(t))return t;var cc=nCard(n);if(!cc)return t;
  for(var i=0;i<L.length;i++){var r=L[i];if(r[0]!==cc.i)continue;var hit=false,out=t.replace(NRX,function(m){if(!hit&&nVal(m)===r[3]){hit=true;return nFmt(r[2],m)}return m});if(hit)return out}
  return t}

function occOf(node){var o=origOf(node),c=0,all=tnodes();for(var i=0;i<all.length;i++){if(all[i]===node)return c;if(origOf(all[i])===o)c++}return 0}
function setTxt(n,o,t){if(!ORIG.has(n)){ORIG.set(n,o);RPL.push([n,n.nodeValue])}var v=n.nodeValue,a=v.match(/^\s*/)[0],b=v.match(/\s*$/)[0];if(v!==a+t+b)n.nodeValue=a+t+b}
function eApply(){var L=EDT[curId()];if(!L||!L.length)return;applying=true;var mv=[];
  try{var cnt={};tnodes().forEach(function(n){var o=origOf(n),c=cnt[o]||0;cnt[o]=c+1;if(n.parentElement&&n.parentElement.isContentEditable)return;
    for(var i=0;i<L.length;i++){var e=L[i];if(e[0]===o&&e[2]===c){if(!NF.has(n)&&nDiff(o,e[1])&&nCard(n)){mv.push([n,e]);break}if(n.nodeValue.trim()!==e[1])setTxt(n,o,e[1]);break}}})}catch(e){console.error(e)}
  applying=false;
  if(mv.length){var id=curId(),ch=false;mv.forEach(function(x){var n=x[0],e=x[1];if(!n.isConnected)return;
      if(nEdit(n,e[0],e[1])){EDT[id]=(EDT[id]||[]).filter(function(y){return y!==e});ch=true}else{NF.add(n);applying=true;try{setTxt(n,e[0],e[1])}finally{applying=false}}});
    if(ch){if(EDT[id]&&!EDT[id].length)delete EDT[id];esave();push(1)}}}
function eSoon(){if(eQ)return;eQ=rRAF(function(){eQ=0;eApply()})}
try{new MutationObserver(function(){if(!applying)eSoon()}).observe(D.documentElement,{childList:true,subtree:true,characterData:true})}catch(e){}
function eReset(){var id=curId();delete EDT[id];esave();nReset(id);RPL=RPL.filter(function(p){var n=p[0];if(n.isConnected){n.nodeValue=p[1];ORIG.delete(n);return false}return false});push(1)}
function txEl(t){var el=t&&t.nodeType===1?t:t&&t.parentElement;while(el&&el!==D.body){if(el.closest(SKIP))return null;
    for(var c=el.firstChild;c;c=c.nextSibling)if(c.nodeType===3&&c.nodeValue.trim())return el;el=el.parentElement}return null}
function blockOf(el){while(el&&el.parentElement&&el.parentElement!==D.body&&getComputedStyle(el).display==='inline'&&!el.parentElement.closest(SKIP))el=el.parentElement;return el}
function pickAt(e){var els=[];try{els=D.elementsFromPoint(e.clientX,e.clientY)}catch(x){els=[e.target]}for(var i=0;i<els.length;i++){var el=txEl(els[i]);if(el)return blockOf(el)}return null}
function eBegin(el){eCommit();var ns=tnodes(el);if(!ns.length)return;eAct=el;eSnap=ns.map(function(n){return {n:n,o:origOf(n),c:occOf(n),v:n.nodeValue}});
  el.contentEditable='true';el.spellcheck=false;el.focus();try{var r=D.createRange();r.selectNodeContents(el);var s=W.getSelection();s.removeAllRanges();s.addRange(r)}catch(e){}}
function eCommit(cancel){if(!eAct)return;var el=eAct,sn=eSnap;eAct=null;eSnap=null;el.contentEditable='false';el.removeAttribute('contenteditable');
  if(cancel){sn.forEach(function(s){if(s.n.isConnected)s.n.nodeValue=s.v});return}
  var now=tnodes(el),id=curId(),L=EDT[id]||(EDT[id]=[]),put=function(o,c,t){L=L.filter(function(e){return !(e[0]===o&&e[2]===c)});if(t!==o)L.push([o,t,c]);EDT[id]=L};
  if(now.length===sn.length&&now.every(function(n,i){return n===sn[i].n}))sn.forEach(function(s){var t=s.n.nodeValue.trim();if(t!==s.v.trim()&&nEdit(s.n,ORIG.has(s.n)?dataTxt(s.n):s.v.trim(),t)){put(s.o,s.c,s.o);return}if(t!==s.v.trim()||ORIG.has(s.n))put(s.o,s.c,t);if(!ORIG.has(s.n)&&t!==s.o){ORIG.set(s.n,s.o);RPL.push([s.n,s.v])}});
  else{var t=(el.textContent||'').replace(/\s+/g,' ').trim();sn.forEach(function(s,i){put(s.o,s.c,i?'':t)});}
  if(!EDT[id].length)delete EDT[id];esave();eApply();push(1)}
/* text edit v2: the control window edits the slide's text (list, set, outline) */
function eList(){var all=tnodes(),cnt={},cards=[],L=EDT[curId()]||[],out=[];
  all.forEach(function(n){var o=origOf(n),c=cnt[o]||0;cnt[o]=c+1;var p=n.parentElement,card=p.closest('.bc'),k=-1;
    if(card){k=cards.indexOf(card);if(k<0){cards.push(card);k=cards.length-1}}
    var e=L.find(function(x){return x[0]===o&&x[2]===c});out.push({o:o,c:c,v:e?e[1]:n.nodeValue.trim(),k:k,w:!!(card&&card.classList.contains('wait'))})});
  return out}
/* the list waits until the slide's text stops moving (numbers counting up), at most 4 s */
var eLast=0;try{new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var t=ms[i].target,el=t.nodeType===1?t:t.parentElement;if(el&&!el.closest('svg')){eLast=rNow();break}}}).observe(D.documentElement,{childList:true,subtree:true,characterData:true})}catch(e){}
function eTexts(){var t0=rNow();(function w(){if(rNow()-eLast>450||rNow()-t0>4000)post({t:'texts',id:curId(),items:eList()});else rST(w,120)})()}
function eSet(o,c,t){var id=curId();t=String(t==null?'':t).replace(/\s+/g,' ').trim();
  var cn={},hn=null;tnodes().forEach(function(n){var oo=origOf(n),k=cn[oo]||0;cn[oo]=k+1;if(!hn&&oo===o&&k===c)hn=n});
  if(hn&&nEdit(hn,dataTxt(hn),t)){var L0=(EDT[id]||[]).filter(function(e){return !(e[0]===o&&e[2]===c)});if(L0.length)EDT[id]=L0;else delete EDT[id];esave();push(1);return}
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
        while(j>=0&&j<ORDER.length&&hid(ORDER[j]))j+=d;if(j<0||j>=ORDER.length||ORDER[j]===cur)return;arguments[0]=ORDER[j]}try{layApply(arguments[0])}catch(e){console.error(e)}return os.apply(this,arguments)};
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
try{bc=new BroadcastChannel('forum-ctl'+(NS?'~'+NS:''))}catch(e){}
var sigN=0;
function post(m){if(PV||ED)return;m.ns='fctl';m.from='show';m.deck=DECK;m.sid=SID;m.title=D.title;if(m.t==='sig')m.n=++sigN;
  try{bc&&bc.postMessage(m)}catch(e){}
  var to=[];if(peer)to.push(peer);try{if(W.opener&&!W.opener.closed&&to.indexOf(W.opener)<0)to.push(W.opener)}catch(e){}
  to.forEach(function(w){try{w.postMessage(m,'*')}catch(e){}})}
function state(){if(!A)return null;var c={};try{c=A.cur()}catch(e){}
  return {t:'state',edit:editing,edits:(EDT[curId()]||[]).length,hide:HIDE,cur:c,paused:paused,black:!!(blk&&blk.style.opacity==='1'),anim:animState(),map:(function(){try{return A.hasMap()}catch(e){return false}})()}}
function push(force){var s=state();if(!s)return;var j=JSON.stringify(s);if(!force&&j===lastSent&&!s.anim)return;lastSent=j;post(s)}
function hello(){if(!A)return;var sl=[];try{sl=A.slides()}catch(e){console.error(e)}post({t:'hello',slides:sl,hide:HIDE});sentSlides=true;push(1)}
function handle(m){if(PV||ED||!m||m.ns!=='fctl'||m.from!=='ctl')return;if(m.deck&&m.deck!==DECK&&m.deck!=='*')return;
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
function doAct(a,s){if(PV||ED)return;post({t:'sig',sig:s,act:a});if(learning||!A)return;
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
function media(){if(PV||ED||!('mediaSession' in navigator))return;
  try{if(!aud){aud=new Audio(silentWav(10));aud.loop=true}var p=aud.play();if(p&&p.catch)p.catch(function(){})}catch(e){}
  try{navigator.mediaSession.metadata=new MediaMetadata({title:D.title||'منتدى مصر 2026',artist:'الريموت'})}catch(e){}
  ['play','pause','previoustrack','nexttrack','seekbackward','seekforward','stop'].forEach(function(n){try{navigator.mediaSession.setActionHandler(n,function(){var s='m:'+n,a=ract(s);
    if(learning||!a)post({t:'sig',sig:s,act:a});else playPress(a,s);try{aud.play().catch(function(){});navigator.mediaSession.playbackState='playing'}catch(e){}})}catch(e){}});
  try{navigator.mediaSession.playbackState='playing'}catch(e){}}
['pointerdown','keydown'].forEach(function(t){W.addEventListener(t,function(){media()},{capture:true,once:true})});

/* ---------------------------------------------------------------- preview (pv mode v1, Amr 19 Oct: «مهم يكون فيه preview»)
   Inside the control window's frames: shows the slide / card the control asks for, then stops its clock once the slide has settled. */
var pvQ=null, pvT=0;
if(PV){(function(){var s=D.createElement('style');s.textContent='#ui,#prog,#rc-edbar,#aroma-mascot,.aroma-notes{display:none!important}*{cursor:default!important}';(D.head||D.documentElement).appendChild(s)})();
  W.addEventListener('message',function(e){var m=e.data;if(m&&m.ns==='fctl-pv'&&e.source===W.parent)pvGo(m)})}
/* pv calm v1 (Amr 19 Oct 12:20: «الحركة لما تضغط على التالي باظت»): the previews share one main thread with the show, so they keep
   still while it moves: the control sends «hold» the moment the show moves (the clock stops where it is), and the new slide only
   once the show has settled. (Running the clock faster to settle sooner was tried and dropped: d3 drops the time of a late frame,
   so under load a sped-up slide could stop half built.) */
function pvRest(){rCT(pvT);if(!paused)pause()}
function pvGo(m){if(m.hold){pvQ=null;pvRest();return}
  if(!A){pvQ=m;return}pvQ=null;rCT(pvT);if(paused)resume();
  try{force=1;try{A.go(m.i,m.k)}finally{force=0}}catch(e){console.error(e)}
  var ms=m.settle||((function(){try{return A.hasMap()}catch(e){return false}})()?6500:3200);pvT=rST(pvRest,ms)}
function boot(){
  try{if(typeof SLIDES!=='undefined'&&typeof ORDER!=='undefined'&&typeof show==='function')A=forumAdapter();
      else if(typeof SL!=='undefined'&&typeof go==='function')A=centerAdapter()}catch(e){console.error(e)}
  if(!A)return;A.hook();if(ED){try{W.countUp=function(){}}catch(e){}rST(function(){edPost({t:'ready',ok:nOn()})},0)}if(PV&&pvQ)rST(function(){pvQ&&pvGo(pvQ)},0);try{nBoot()}catch(e){console.error(e)}try{eUI()}catch(e){console.error(e)}hello()}
if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',function(){rST(boot,0)});else rST(boot,0);
W.RC={pause:pause,resume:resume,isPaused:function(){return paused},now:vnow,deck:DECK,state:state,black:black};
})();
