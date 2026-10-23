/* C6 store — the edits of «الجلسة الختامية V6», kept in three places so nothing is lost:
   1) localStorage («c6-edits»): instant, shared by every window of this browser;
   2) the file src/c6/edits.js inside the presentation folder: survives a restart, a cleared browser, or a copy of the folder
      to another computer (it is loaded by a plain <script>, so it works from file:// with no server);
   3) src/c6/backup/edits-<time>.js: the last 30 saved versions.
   The newest of (1) and (2) wins when a window opens. The folder is linked once (showDirectoryPicker), its handle kept in
   IndexedDB; Chrome asks again only for permission (one click). Without the link, «تنزيل ملف التعديلات» saves the same file. */
(function () {
'use strict';
const C6 = window.C6 = window.C6 || {};
const KEY = 'c6-edits', BC = 'c6-ctl';
const S = C6.store = { E: null, listeners: [], dir: null, perm: 'none', dirty: false, lastFile: 0, status: '' };
const bc = (() => { try { return new BroadcastChannel(BC); } catch (e) { return null; } })();
C6.bc = bc;
function readLocal() { try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
function blank() { return { v: 1, savedAt: 0, slides: {}, order: null, hide: {}, del: [], notes: {}, points: {}, layouts: {} }; }
S.load = function () {
  const f = window.C6_EDITS && typeof window.C6_EDITS === 'object' ? window.C6_EDITS : null;
  const l = readLocal();
  let E;
  if (f && l) E = (f.savedAt || 0) >= (l.savedAt || 0) ? f : l;
  else E = f || l || blank();
  E = Object.assign(blank(), E);
  S.E = E; S.lastFile = f ? (f.savedAt || 0) : 0;
  S.dirty = (E.savedAt || 0) > S.lastFile;
  return E;
};
S.get = () => S.E || S.load();
S.set = function (E, why) {
  E.savedAt = Date.now(); S.E = E;
  try { localStorage.setItem(KEY, JSON.stringify(E)); } catch (e) { console.warn('localStorage full', e); }
  S.dirty = true;
  if (bc) bc.postMessage({ type: 'edits', savedAt: E.savedAt, why: why || '' });
  S.emit('local');
  S.autosave();
};
S.on = fn => S.listeners.push(fn);
S.emit = w => S.listeners.forEach(fn => { try { fn(w); } catch (e) { console.error(e); } });
if (bc) bc.addEventListener('message', ev => { const d = ev.data || {}; if (d.type === 'edits') { const l = readLocal(); if (l && (!S.E || l.savedAt !== S.E.savedAt)) { S.E = Object.assign(blank(), l); S.emit('remote'); } } if (d.type === 'saved') { S.lastFile = d.savedAt; S.dirty = (S.E && S.E.savedAt || 0) > S.lastFile; S.emit('saved'); } });
addEventListener('storage', ev => { if (ev.key === KEY) { const l = readLocal(); if (l && (!S.E || l.savedAt !== S.E.savedAt)) { S.E = Object.assign(blank(), l); S.emit('remote'); } } });

/* ── the folder link (File System Access API) */
const IDB = 'c6-fs';
function idb() { return new Promise((res, rej) => { const r = indexedDB.open(IDB, 1); r.onupgradeneeded = () => r.result.createObjectStore('h'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }
async function idbGet(k) { const db = await idb(); return new Promise(res => { const t = db.transaction('h').objectStore('h').get(k); t.onsuccess = () => res(t.result); t.onerror = () => res(null); }); }
async function idbSet(k, v) { const db = await idb(); return new Promise(res => { const t = db.transaction('h', 'readwrite'); t.objectStore('h').put(v, k); t.oncomplete = () => res(true); t.onerror = () => res(false); }); }
S.fsOk = typeof window.showDirectoryPicker === 'function';
/* find forum-v3/src/c6 from whatever folder was picked */
async function resolveC6(root) {
  const tries = [['src', 'c6'], ['forum-v3', 'src', 'c6'], ['offline forum control', 'forum-v3', 'src', 'c6'], []];
  for (const p of tries) {
    try {
      let d = root;
      for (const k of p) d = await d.getDirectoryHandle(k);
      if (p.length === 0 && root.name !== 'c6') continue;
      await d.getFileHandle('deck.js');
      return d;
    } catch (e) { }
  }
  return null;
}
S.restore = async function () {
  if (!S.fsOk) return;
  try {
    const h = await idbGet('dir'); if (!h) { S.perm = 'none'; S.emit('perm'); return; }
    S.root = h; const p = await h.queryPermission({ mode: 'readwrite' });
    S.perm = p === 'granted' ? 'granted' : 'prompt';
    if (S.perm === 'granted') S.dir = await resolveC6(h);
    S.emit('perm');
    if (S.dir) await S.syncFromFile();
  } catch (e) { console.warn(e); S.perm = 'none'; S.emit('perm'); }
};
S.link = async function () {
  if (!S.fsOk) { alert('المتصفح ده مش بيدعم الحفظ المباشر في الفولدر — استخدم «تنزيل ملف التعديلات».'); return false; }
  try {
    if (S.root && S.perm === 'prompt') {
      const p = await S.root.requestPermission({ mode: 'readwrite' });
      if (p === 'granted') { S.perm = 'granted'; S.dir = await resolveC6(S.root); S.emit('perm'); if (S.dir) { await S.syncFromFile(); await S.saveFile(); } return !!S.dir; }
    }
    const h = await window.showDirectoryPicker({ id: 'c6-folder', mode: 'readwrite' });
    const d = await resolveC6(h);
    if (!d) { alert('اختار فولدر «offline forum control» أو «forum-v3» — الفولدر اللي جواه العرض.'); return false; }
    await idbSet('dir', h); S.root = h; S.dir = d; S.perm = 'granted'; S.emit('perm');
    await S.syncFromFile(); await S.saveFile();
    return true;
  } catch (e) { if (e && e.name !== 'AbortError') alert('ما قدرتش أربط الفولدر: ' + e.message); return false; }
};
/* read edits.js from the folder (another computer may have saved newer edits) */
S.syncFromFile = async function () {
  if (!S.dir) return;
  try {
    const fh = await S.dir.getFileHandle('edits.js'); const t = await (await fh.getFile()).text();
    const m = t.match(/window\.C6_EDITS\s*=\s*([\s\S]*?);\s*$/); if (!m) return;
    const f = JSON.parse(m[1]); S.lastFile = f.savedAt || 0;
    if ((f.savedAt || 0) > (S.E && S.E.savedAt || 0)) { S.E = Object.assign(blank(), f); try { localStorage.setItem(KEY, JSON.stringify(S.E)); } catch (e) { } if (bc) bc.postMessage({ type: 'edits', savedAt: S.E.savedAt }); S.emit('remote'); }
    S.dirty = (S.E.savedAt || 0) > S.lastFile; S.emit('saved');
  } catch (e) { /* no file yet */ }
};
S.fileText = E => '/* «الجلسة الختامية V6» — edits saved by the editor (' + new Date(E.savedAt || Date.now()).toLocaleString('ar-EG') + '). The deck reads this file on open. */\nwindow.C6_EDITS=' + JSON.stringify(E) + ';\n';
let saving = null, again = false;
S.saveFile = async function () {
  if (!S.dir || S.perm !== 'granted') return false;
  if (saving) { again = true; return saving; }
  const E = S.get();
  saving = (async () => {
    try {
      const txt = S.fileText(E);
      const fh = await S.dir.getFileHandle('edits.js', { create: true });
      const w = await fh.createWritable(); await w.write(txt); await w.close();
      // backup
      try {
        const bd = await S.dir.getDirectoryHandle('backup', { create: true });
        const stamp = new Date(E.savedAt || Date.now()).toISOString().replace(/[:T]/g, '-').slice(0, 19);
        const bh = await bd.getFileHandle('edits-' + stamp + '.js', { create: true });
        const bw = await bh.createWritable(); await bw.write(txt); await bw.close();
        const names = []; for await (const [n] of bd.entries()) if (/^edits-.*\.js$/.test(n)) names.push(n);
        names.sort(); while (names.length > 30) { const n = names.shift(); try { await bd.removeEntry(n); } catch (e) { } }
      } catch (e) { }
      S.lastFile = E.savedAt; S.dirty = false; S.status = 'saved';
      if (bc) bc.postMessage({ type: 'saved', savedAt: E.savedAt });
      S.emit('saved'); return true;
    } catch (e) { console.warn('save failed', e); S.status = 'error'; S.emit('saved'); return false; }
    finally { saving = null; if (again) { again = false; setTimeout(S.saveFile, 50); } }
  })();
  return saving;
};
let tmr = 0;
S.autosave = function () { clearTimeout(tmr); tmr = setTimeout(() => S.saveFile(), 700); };
S.download = function () {
  const E = S.get(); const b = new Blob([S.fileText(E)], { type: 'text/javascript' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'edits.js'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
};
S.importText = function (t) {
  const m = t.match(/window\.C6_EDITS\s*=\s*([\s\S]*?);\s*$/); const j = JSON.parse(m ? m[1] : t);
  S.set(Object.assign(blank(), j, { savedAt: Date.now() }), 'import');
};
/* save a picture the editor added: into img/c6/user/ when the folder is linked, else kept inline */
S.saveImage = async function (file) {
  const name = 'u' + Date.now().toString(36) + '-' + file.name.replace(/[^\w.\-]+/g, '_').slice(-40);
  if (S.dir && S.perm === 'granted') {
    try {
      // src/c6 -> ../../img/c6/user
      const root = S.root; let fv = null;
      for (const p of [['img'], ['forum-v3', 'img'], ['offline forum control', 'forum-v3', 'img']]) { try { let d = root; for (const k of p) d = await d.getDirectoryHandle(k); fv = d; break; } catch (e) { } }
      if (fv) {
        const c6 = await fv.getDirectoryHandle('c6', { create: true }); const u = await c6.getDirectoryHandle('user', { create: true });
        const fh = await u.getFileHandle(name, { create: true }); const w = await fh.createWritable(); await w.write(file); await w.close();
        return 'img/c6/user/' + name;
      }
    } catch (e) { console.warn(e); }
  }
  return await new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(file); });
};

/* sound relay player (Amr 03:21 / 03:59 «الصوت يشتغل اوتوماتيك»): the show window posts {type:'snd', items:[{src,ct,at,loop,vol}]}
   for every sound the browser kept it from playing itself; the control and the presenter screen play it here in step.
   Only one window sounds: each one that is playing says so ({type:'sndby',w}) and the lower id keeps it. */
C6.sndRelay = function (onState) {
  const W = Math.random(), A = {}, src = {}; let at = 0, n = 0, ok = null, other = 0, otherW = 1;
  const bc = C6.bc; if (!bc) return;
  const rep = () => onState && onState(n, Date.now() - other < 700 ? true : ok);   /* another window is sounding it: fine */
  function play(items) {
    at = Date.now(); n = items.length;
    const yield_ = Date.now() - other < 700 && otherW < W, keep = new Set();
    items.forEach(it => {
      keep.add(it.src); let a = A[it.src]; if (!a) { a = A[it.src] = new Audio(it.src); a.preload = 'auto'; }
      a.loop = !!it.loop; a.volume = it.vol != null ? Math.max(0, Math.min(1, it.vol)) : 1;
      if (yield_) { if (!a.paused) a.pause(); return; }
      const want = it.ct + (Date.now() - it.at) / 1000;
      if (a.readyState > 0 && Math.abs(a.currentTime - want) > .3) { try { a.currentTime = want; } catch (e) {} }
      if (a.paused) { const p = a.play(); if (p && p.then) p.then(() => { if (ok !== true) console.log('[c6snd] relay plays ' + it.src.split('/').pop()); ok = true; rep(); }, e => { if (ok !== false) console.log('[c6snd] relay blocked ' + (e && e.name)); ok = false; rep(); }); }
    });
    Object.keys(A).forEach(k => { if (!keep.has(k) && !A[k].paused) A[k].pause(); });
    if (!yield_ && Object.values(A).some(a => !a.paused)) bc.postMessage({ type: 'sndby', w: W });
    rep();
  }
  bc.addEventListener('message', ev => { const d = ev.data || {};
    if (d.type === 'snd') { const now = Date.now(); src[d.from || 'c6'] = { items: d.items || [], at: now }; let all = []; Object.values(src).forEach(x => { if (now - x.at < 900) all = all.concat(x.items); }); play(all); }   /* V6 and Smart Visual shows can both be open: merge what each one asks for */
    else if (d.type === 'sndby' && d.w !== W) { other = Date.now(); otherW = d.w; } });
  setInterval(() => { if (Date.now() - at > 1500 && n) { n = 0; Object.values(A).forEach(a => a.pause()); rep(); } }, 500);
  window.C6snd = A;
};
})();
