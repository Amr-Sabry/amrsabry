/* C6 editor — «الجلسة الختامية V6». One slide at a time on a canvas; every change replaces that slide in the edits
   (store.js), so the show, the control and the presenter screen redraw it at once, and «رجوع للأصل» is always one click. */
(function () {
'use strict';
C6.deck = window.C6_DECK; C6.injectCss();
const st = C6.store; st.load();
const $ = id => document.getElementById(id);
const Q = new URLSearchParams(location.search);
const clone = o => JSON.parse(JSON.stringify(o));
const r1 = v => Math.round(v * 10) / 10;
let slides = C6.mergeEdits(C6.deck, st.get());
let si = 0, S = null, sel = [], editing = null, k = 0.5, zoomMode = 'fit';
const undo = [], redo = [];
const ORIG = {}; C6.deck.slides.forEach(s => ORIG[s.id] = s);
const toast = (t) => { const e = $('toast'); e.textContent = t; e.classList.add('on'); clearTimeout(e._t); e._t = setTimeout(() => e.classList.remove('on'), 1800); };

/* ───────────── palette & faces from the deck itself */
const PALETTE = (() => {
  const c = {}; const add = v => { if (v && /^#/.test(v)) c[v] = (c[v] || 0) + 1; };
  C6.deck.slides.forEach(s => s.layers.forEach(L => { if (L.fill && L.fill.c) add(L.fill.c); if (L.text) L.text.paras.forEach(p => p.runs.forEach(r => add(r.c))); }));
  const top = Object.entries(c).sort((a, b) => b[1] - a[1]).map(x => x[0]).slice(0, 16);
  ['#ffffff', '#000000'].forEach(x => { if (!top.includes(x)) top.push(x); });
  return top;
})();
const FACES = ['Cairo Black', 'Cairo ExtraBold', 'Cairo Bold', 'Cairo SemiBold', 'Cairo Medium', 'Cairo', 'Cairo Light', 'Tajawal Black', 'Tajawal ExtraBold', 'Tajawal Bold', 'Tajawal Medium', 'Tajawal', 'Tajawal Light', '29LT Adir ExtraBold', '29LT Adir Bold', 'beIN Black', 'Almarai'];

/* ───────────── slide in / out */
function loadSlide(i, keepSel) {
  finishEdit();
  si = Math.max(0, Math.min(slides.length - 1, i));
  S = clone(slides[si]); delete S.hidden;
  if (!keepSel) sel = [];
  undo.length = 0; redo.length = 0;
  drawCanvas(); drawProps(); markStrip(); drawLayers();
  history.replaceState(null, '', '?sid=' + encodeURIComponent(S.id));
  try { localStorage.setItem('c6-edit-sid', S.id); } catch (e) { }
}
function snapshot() { undo.push(JSON.stringify(S)); if (undo.length > 100) undo.shift(); redo.length = 0; updUndo(); }
function updUndo() { $('bUndo').disabled = !undo.length; $('bRedo').disabled = !redo.length; }
let commitT = 0;
function commit(why, now) {
  clearTimeout(commitT);
  const go = () => {
    const E = st.get();
    E.slides = E.slides || {};
    const out = clone(S); delete out.hidden;
    E.slides[S.id] = out;
    if (!E.order || !E.order.length) E.order = slides.map(s => s.id);
    if (!E.order.includes(S.id)) E.order.splice(si + 1, 0, S.id);
    slides[si] = Object.assign({}, out, { hidden: slides[si].hidden });
    st.set(E, why || 'edit');
    refreshThumb(si);
  };
  if (now) go(); else commitT = setTimeout(go, 250);
}
function change(fn, why) { snapshot(); fn(); drawCanvas(); drawProps(); drawLayers(); commit(why); }
$('bUndo').onclick = () => { if (!undo.length) return; redo.push(JSON.stringify(S)); S = JSON.parse(undo.pop()); sel = sel.filter(id => byId(id)); drawCanvas(); drawProps(); drawLayers(); commit('undo'); updUndo(); };
$('bRedo').onclick = () => { if (!redo.length) return; undo.push(JSON.stringify(S)); S = JSON.parse(redo.pop()); drawCanvas(); drawProps(); drawLayers(); commit('redo'); updUndo(); };
const byId = id => (S.layers || []).find(L => L.id === id);
const selL = () => sel.map(byId).filter(Boolean);

/* ───────────── canvas */
const host = $('stageHost'), wrap = $('wrap'), ov = $('ov'), cv = $('canvas');
function fit() {
  const W = cv.clientWidth, H = cv.clientHeight;
  if (zoomMode === 'fit') k = Math.min((W - 60) / 1920, (H - 70) / 1080);
  else k = zoomMode;
  const x = Math.max(30, (W - 1920 * k) / 2), y = Math.max(24, (H - 1080 * k) / 2);
  wrap.style.transform = `translate(${x}px,${y}px) scale(${k})`;
  ov.style.setProperty('--h', (11 / k) + 'px');
  drawSel();
}
addEventListener('resize', fit);
$('zFit').onclick = () => { zoomMode = 'fit'; fit(); }; $('z50').onclick = () => { zoomMode = .5; fit(); }; $('z100').onclick = () => { zoomMode = 1; fit(); };
let slideEl = null;
function drawCanvas() {
  host.innerHTML = '';
  slideEl = C6.renderSlide(S, { edit: true, liveMaps: true, num: placeOf(si) });
  host.appendChild(slideEl); C6.fitText(slideEl);
  slideEl.querySelectorAll(':scope > .c6l').forEach(el => { const L = byId(el.dataset.id); if (L && L.lock) el.style.pointerEvents = 'none'; if (L && L.hid) { el.style.display = ''; el.style.opacity = '.25'; } });
  fit(); updUndo();
}
function redrawLayer(L) {
  const old = slideEl.querySelector(`:scope > .c6l[data-id="${CSS.escape(L.id)}"]`);
  const nu = C6.layerEl(L, { edit: true, liveMaps: true, num: placeOf(si) });
  if (L.hid) { nu.style.display = ''; nu.style.opacity = '.25'; }
  if (old) { old.replaceWith(nu); C6.fitText(nu); } else drawCanvas();
}
const vis = () => slides.map((s, i) => s.hidden ? -1 : i).filter(i => i >= 0);
const placeOf = i => vis().indexOf(i) + 1;
function pt(e) { const r = wrap.getBoundingClientRect(); return { x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k }; }

/* selection overlay */
function bbox(Ls) { const x0 = Math.min(...Ls.map(L => L.x)), y0 = Math.min(...Ls.map(L => L.y)), x1 = Math.max(...Ls.map(L => L.x + L.w)), y1 = Math.max(...Ls.map(L => L.y + L.h)); return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }; }
function drawSel() {
  ov.querySelectorAll('.selb,.hd,.dims').forEach(n => n.remove());
  const Ls = selL(); if (!Ls.length) return;
  Ls.forEach(L => { const b = document.createElement('div'); b.className = 'selb' + (Ls.length > 1 ? ' multi' : ''); b.style.cssText = `left:${L.x}px;top:${L.y}px;width:${Math.max(L.w, 1)}px;height:${Math.max(L.h, 1)}px;outline-width:${2 / k}px;${L.rot ? `transform:rotate(${L.rot}deg)` : ''}`; ov.appendChild(b); });
  if (editing) return;
  const B = Ls.length === 1 ? Ls[0] : bbox(Ls);
  if (Ls.length === 1 && !Ls[0].lock) {
    const H = { nw: [0, 0], n: [.5, 0], ne: [1, 0], e: [1, .5], se: [1, 1], s: [.5, 1], sw: [0, 1], w: [0, .5] };
    Object.entries(H).forEach(([h, [fx, fy]]) => { if (Ls[0].t === 'line' && h.length === 1) return; const d = document.createElement('div'); d.className = 'hd'; d.dataset.h = h; d.style.left = (B.x + B.w * fx) + 'px'; d.style.top = (B.y + B.h * fy) + 'px'; ov.appendChild(d); });
  }
}
function showDims(B) {
  ov.querySelectorAll('.dims').forEach(n => n.remove());
  const d = document.createElement('div'); d.className = 'dims'; d.style.cssText = `left:${B.x + B.w / 2}px;top:${B.y + B.h}px;--fs:${13 / k}px`;
  d.textContent = `${Math.round(B.w)} × ${Math.round(B.h)}  ·  ${Math.round(B.x)}, ${Math.round(B.y)}`; ov.appendChild(d);
}
/* snapping: the slide's edges and centre, and every other layer's edges and centre */
function guides(moving) {
  const xs = [0, 960, 1920], ys = [0, 540, 1080];
  (S.layers || []).forEach(L => { if (moving.includes(L.id) || L.hid || L.w > 1900) return; xs.push(L.x, L.x + L.w / 2, L.x + L.w); ys.push(L.y, L.y + L.h / 2, L.y + L.h); });
  return { xs, ys };
}
function snap(B, G, modes) {
  const tol = 7 / k; let dx = 0, dy = 0, gx = null, gy = null;
  const cx = modes.x || [B.x, B.x + B.w / 2, B.x + B.w], cy = modes.y || [B.y, B.y + B.h / 2, B.y + B.h];
  let best = tol; cx.forEach(v => G.xs.forEach(g => { const d = g - v; if (Math.abs(d) < best) { best = Math.abs(d); dx = d; gx = g; } }));
  best = tol; cy.forEach(v => G.ys.forEach(g => { const d = g - v; if (Math.abs(d) < best) { best = Math.abs(d); dy = d; gy = g; } }));
  ov.querySelectorAll('.guide').forEach(n => n.remove());
  if (gx != null) { const l = document.createElement('div'); l.className = 'guide'; l.style.cssText = `left:${gx}px;top:0;width:${1.5 / k}px;height:1080px`; ov.appendChild(l); }
  if (gy != null) { const l = document.createElement('div'); l.className = 'guide'; l.style.cssText = `top:${gy}px;left:0;height:${1.5 / k}px;width:1920px`; ov.appendChild(l); }
  return { dx, dy };
}
const clearGuides = () => ov.querySelectorAll('.guide,.dims').forEach(n => n.remove());

/* pointer: pick, move, resize, marquee */
let drag = null;
cv.addEventListener('pointerdown', e => {
  if (e.button !== 0) return;
  if (editing && e.target.closest('.c6l.editing')) return;
  finishEdit();
  const p = pt(e);
  const hd = e.target.closest('.hd');
  if (hd) { const L = selL()[0]; snapshot(); drag = { mode: 'rs', h: hd.dataset.h, L, o: { x: L.x, y: L.y, w: L.w, h: L.h }, p, G: guides([L.id]), keep: (L.t === 'pic' || L.t === 'video' || L.t === 'svg') !== e.shiftKey }; cv.setPointerCapture(e.pointerId); e.preventDefault(); return; }
  const el = e.target.closest('.c6s > .c6l');
  if (el) {
    const id = el.dataset.id;
    if (e.shiftKey) { sel = sel.includes(id) ? sel.filter(x => x !== id) : sel.concat(id); }
    else if (!sel.includes(id)) sel = [id];
    drawSel(); drawProps(); drawLayers();
    const Ls = selL().filter(L => !L.lock);
    if (Ls.length) { drag = { mode: 'mv', Ls, o: Ls.map(L => ({ x: L.x, y: L.y })), p, G: guides(Ls.map(L => L.id)), moved: false }; cv.setPointerCapture(e.pointerId); }
    e.preventDefault(); return;
  }
  if (!e.shiftKey) { sel = []; drawSel(); drawProps(); drawLayers(); }
  drag = { mode: 'mq', p }; cv.setPointerCapture(e.pointerId);
});
cv.addEventListener('pointermove', e => {
  if (!drag) { hover(e); return; }
  const p = pt(e), dx0 = p.x - drag.p.x, dy0 = p.y - drag.p.y;
  if (drag.mode === 'mv') {
    if (!drag.moved && Math.hypot(dx0, dy0) < 3 / k) return;
    if (!drag.moved) { snapshot(); drag.moved = true; }
    const B0 = bbox(drag.Ls.map((L, i) => ({ x: drag.o[i].x + dx0, y: drag.o[i].y + dy0, w: L.w, h: L.h })));
    const s = e.altKey ? { dx: 0, dy: 0 } : snap(B0, drag.G, {});
    drag.Ls.forEach((L, i) => { L.x = r1(drag.o[i].x + dx0 + s.dx); L.y = r1(drag.o[i].y + dy0 + s.dy); const el = slideEl.querySelector(`:scope > .c6l[data-id="${CSS.escape(L.id)}"]`); if (el) { el.style.left = L.x + 'px'; el.style.top = L.y + 'px'; } });
    drawSel(); showDims(bbox(drag.Ls));
  } else if (drag.mode === 'rs') {
    const { h, L, o } = drag; let x = o.x, y = o.y, w = o.w, hh = o.h;
    if (h.includes('e')) w = o.w + dx0; if (h.includes('w')) { w = o.w - dx0; x = o.x + dx0; }
    if (h.includes('s')) hh = o.h + dy0; if (h.includes('n')) { hh = o.h - dy0; y = o.y + dy0; }
    if (drag.keep && h.length === 2 && o.w && o.h) { const ar = o.w / o.h; if (Math.abs(w / o.w) > Math.abs(hh / o.h)) { const nh = w / ar; if (h.includes('n')) y = o.y + o.h - nh; hh = nh; } else { const nw = hh * ar; if (h.includes('w')) x = o.x + o.w - nw; w = nw; } }
    if (L.t !== 'line') { if (w < 8) { if (h.includes('w')) x -= 8 - w; w = 8; } if (hh < 8) { if (h.includes('n')) y -= 8 - hh; hh = 8; } }
    const s = e.altKey ? { dx: 0, dy: 0 } : snap({ x, y, w, h: hh }, drag.G, { x: h.includes('e') ? [x + w] : h.includes('w') ? [x] : [], y: h.includes('s') ? [y + hh] : h.includes('n') ? [y] : [] });
    if (h.includes('e')) w += s.dx; if (h.includes('w')) { x += s.dx; w -= s.dx; } if (h.includes('s')) hh += s.dy; if (h.includes('n')) { y += s.dy; hh -= s.dy; }
    scaleTo(L, o, { x, y, w, h: hh });
    redrawLayer(L); drawSel(); showDims(L);
  } else if (drag.mode === 'mq') {
    const m = $('marq'); const x = Math.min(p.x, drag.p.x), y = Math.min(p.y, drag.p.y), w = Math.abs(dx0), hh = Math.abs(dy0);
    if (w + hh < 4 / k) return;
    m.style.cssText = `display:block;left:${x}px;top:${y}px;width:${w}px;height:${hh}px;border-width:${1.5 / k}px`;
    drag.box = { x, y, w, h: hh };
  }
});
cv.addEventListener('pointerup', e => {
  if (!drag) return;
  const d = drag; drag = null; clearGuides(); $('marq').style.display = 'none';
  if (d.mode === 'mv' && d.moved) { drawProps(); commit('move', true); }
  if (d.mode === 'rs') { drawProps(); commit('resize', true); }
  if (d.mode === 'mq' && d.box) { const b = d.box; const hit = (S.layers || []).filter(L => !L.lock && L.x < b.x + b.w && L.x + L.w > b.x && L.y < b.y + b.h && L.y + L.h > b.y && L.w < 1900).map(L => L.id); sel = e.shiftKey ? [...new Set(sel.concat(hit))] : hit; drawSel(); drawProps(); drawLayers(); }
});
/* resizing a text keeps its words, a picture keeps its crop, a map or keynote frame just grows */
function scaleTo(L, o, n) {
  L.x = r1(n.x); L.y = r1(n.y); L.w = r1(n.w); L.h = r1(n.h);
  if (L.geom && L.geom.p === 'path' && L.geom.vw == null) { L.geom.vw = o.w; L.geom.vh = o.h; }
}
let hovEl = null;
function hover(e) {
  const el = e.target.closest && e.target.closest('.c6s > .c6l');
  ov.querySelectorAll('.hov').forEach(n => n.remove());
  if (!el || sel.includes(el.dataset.id)) return;
  const L = byId(el.dataset.id); if (!L) return;
  const b = document.createElement('div'); b.className = 'hov'; b.style.cssText = `left:${L.x}px;top:${L.y}px;width:${Math.max(1, L.w)}px;height:${Math.max(1, L.h)}px;outline-width:${1.5 / k}px`; ov.appendChild(b);
}
cv.addEventListener('pointerleave', () => ov.querySelectorAll('.hov').forEach(n => n.remove()));

/* ───────────── typing in a text (double-click) */
function layerAt(e) { return document.elementsFromPoint(e.clientX, e.clientY).map(n => n.closest && n.closest('#stageHost .c6s > .c6l')).find(Boolean) || null; }
cv.addEventListener('dblclick', e => {
  const el = layerAt(e); if (!el) return;
  const L = byId(el.dataset.id); if (!L || L.lock) return;
  if (!L.text) { if (L.t === 'shape') { change(() => { L.text = newText('', 40); }); return startEdit(byId(L.id), e); } return; }
  startEdit(L, e);
});
function startEdit(L, e) {
  const el = slideEl.querySelector(`:scope > .c6l[data-id="${CSS.escape(L.id)}"]`); if (!el) return;
  const t = el.querySelector('.c6t'); if (!t) return;
  snapshot();
  editing = { L, el, t }; el.classList.add('editing'); t.contentEditable = 'true'; t.spellcheck = false;
  t.focus();
  if (e && document.caretRangeFromPoint) { const r = document.caretRangeFromPoint(e.clientX, e.clientY); if (r) { const s = getSelection(); s.removeAllRanges(); s.addRange(r); } }
  sel = [L.id]; drawSel(); drawProps();
}
document.addEventListener('pointerdown', e => { if (editing && !e.target.closest('.c6l.editing') && !e.target.closest('#canvas')) finishEdit(); }, true);
function finishEdit() {
  if (!editing) return;
  const { L, el, t } = editing; editing = null;
  t.contentEditable = 'false'; el.classList.remove('editing');
  const paras = readText(t, L.text);
  if (JSON.stringify(paras) !== JSON.stringify(L.text.paras)) { L.text.paras = paras; L.text.empty = paras.some(p => p.runs.some(r => r.t.trim())) ? 0 : 1; commit('text', true); }
  else undo.pop();
  redrawLayer(L); drawSel(); drawProps(); drawLayers();
}
function readText(box, T) {
  const out = []; const P0s = T.paras;
  const blocks = [...box.childNodes].filter(n => n.nodeType === 1 || (n.nodeType === 3 && n.nodeValue.trim()));
  let lastP = P0s[0];
  blocks.forEach(b => {
    const pi = b.dataset && b.dataset.pi != null ? +b.dataset.pi : null;
    const P0 = pi != null && P0s[pi] ? P0s[pi] : lastP; lastP = P0;
    const P = Object.assign({}, P0); delete P.runs; P.runs = [];
    let base = P0.runs.find(r => r.t && r.t !== '\n') || P0.runs[0];
    const push = (props, t) => { if (!t) return; const prev = P.runs[P.runs.length - 1]; if (prev && prev._src === props && prev.t !== '\n') prev.t += t; else P.runs.push(Object.assign({}, props, { t, _src: props })); };
    const walk = n => {
      if (n.nodeType === 3) { push(base, n.nodeValue.replace(/​/g, '')); return; }
      if (n.nodeType !== 1) return;
      if (n.classList.contains('c6bu')) return;
      if (n.tagName === 'BR') { P.runs.push(Object.assign({}, base, { t: '\n' })); return; }
      if (n.dataset && n.dataset.ri != null && P0.runs[+n.dataset.ri]) { const keep = base; base = P0.runs[+n.dataset.ri]; [...n.childNodes].forEach(walk); base = keep; return; }
      if (n.tagName === 'DIV' || n.tagName === 'P') { [...n.childNodes].forEach(walk); return; }
      [...n.childNodes].forEach(walk);
    };
    if (b.nodeType === 3) push(base, b.nodeValue); else [...b.childNodes].forEach(walk);
    while (P.runs.length && P.runs[P.runs.length - 1].t === '\n') P.runs.pop();
    if (!P.runs.length) P.runs.push(Object.assign({}, base, { t: '', end: 1 }));
    P.runs.forEach(r => { delete r._src; if (r.t) delete r.end; });
    out.push(P);
  });
  return out.length ? out : [Object.assign({}, P0s[0], { runs: [Object.assign({}, P0s[0].runs[0], { t: '' })] })];
}

/* ───────────── keys */
addEventListener('keydown', e => {
  const mod = e.metaKey || e.ctrlKey;
  if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); saveNow(); return; }
  if (editing) { if (e.key === 'Escape') { e.preventDefault(); finishEdit(); } return; }
  if (e.target.matches('input,textarea,select,[contenteditable=true]')) return;
  if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); (e.shiftKey ? $('bRedo') : $('bUndo')).click(); return; }
  if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); $('bRedo').click(); return; }
  if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); dupSel(); return; }
  if (mod && e.key.toLowerCase() === 'c') { if (sel.length) { try { localStorage.setItem('c6-clip', JSON.stringify(selL())); } catch (x) { } toast('اتنسخ'); } return; }
  if (mod && e.key.toLowerCase() === 'v') { pasteClip(); return; }
  if (mod && e.key.toLowerCase() === 'a') { e.preventDefault(); sel = (S.layers || []).filter(L => !L.lock).map(L => L.id); drawSel(); drawProps(); drawLayers(); return; }
  if ((e.key === 'Delete' || e.key === 'Backspace') && sel.length) { e.preventDefault(); delSel(); return; }
  if (e.key === 'Escape') { sel = []; drawSel(); drawProps(); drawLayers(); return; }
  if (e.key === 'Enter' && sel.length === 1 && byId(sel[0]).text) { e.preventDefault(); startEdit(byId(sel[0])); return; }
  const ar = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
  if (ar && sel.length) { e.preventDefault(); const n = e.shiftKey ? 10 : 1; change(() => selL().forEach(L => { if (!L.lock) { L.x = r1(L.x + ar[0] * n); L.y = r1(L.y + ar[1] * n); } }), 'nudge'); return; }
  if (!sel.length && (e.key === 'PageDown' || (e.key === 'ArrowDown' && mod))) { e.preventDefault(); loadSlide(si + 1); }
  if (!sel.length && (e.key === 'PageUp' || (e.key === 'ArrowUp' && mod))) { e.preventDefault(); loadSlide(si - 1); }
});
let nid = 0;
const newId = () => 'n' + Date.now().toString(36) + (nid++);
function dupSel() { if (!sel.length) return; const add = []; change(() => { selL().forEach(L => { const c = clone(L); c.id = newId(); c.x += 24; c.y += 24; c.nm = (L.nm || '') + ' (نسخة)'; delete c.lock; S.layers.push(c); add.push(c.id); }); sel = add; }, 'dup'); }
function delSel() { const ids = new Set(sel); change(() => { S.layers = S.layers.filter(L => !ids.has(L.id) || L.lock); sel = []; }, 'delete'); }
function pasteClip() { let c = null; try { c = JSON.parse(localStorage.getItem('c6-clip') || 'null'); } catch (e) { } if (!c || !c.length) return; const add = []; change(() => { c.forEach(L => { const n = clone(L); n.id = newId(); if (byId(L.id) || true) { n.x += 20; n.y += 20; } S.layers.push(n); add.push(n.id); }); sel = add; }, 'paste'); toast('اتلزق'); }

/* ───────────── adding things */
function newText(t, szpt) {
  return { ins: [14.4, 7.2, 14.4, 7.2], anchor: 't', paras: [{ al: 'right', rtl: 1, runs: [{ t: t, sz: (szpt || 32) * 2, fl: 'Cairo Bold', fc: 'Cairo Bold', c: '#1f3049' }] }], empty: t ? 0 : 1 };
}
function addLayer(L) { change(() => { S.layers.push(L); sel = [L.id]; }, 'add'); }
$('bText').onclick = () => { const L = { id: newId(), nm: 'نص', t: 'shape', geom: { p: 'rect' }, x: 560, y: 470, w: 800, h: 120, text: newText('اكتب هنا', 40) }; addLayer(L); setTimeout(() => startEdit(byId(L.id)), 50); };
document.querySelectorAll('#ddShape [data-shape]').forEach(b => b.onclick = () => {
  const p = b.dataset.shape; closeMenus();
  if (p === 'line') return addLayer({ id: newId(), nm: 'خط', t: 'line', geom: { p: 'line' }, x: 760, y: 540, w: 400, h: 0, ln: { c: '#bc8d55', w: 6 } });
  addLayer({ id: newId(), nm: { rect: 'مستطيل', roundRect: 'مستطيل دائري', ellipse: 'دائرة' }[p], t: 'shape', geom: p === 'roundRect' ? { p, adj: { adj: 16667 } } : { p }, x: 760, y: 390, w: p === 'ellipse' ? 300 : 400, h: 300, fill: { c: '#38526b' } });
});
$('bImg').onclick = () => pickImage(src => { const im = new Image(); im.onload = () => { const ar = im.naturalWidth / im.naturalHeight || 1.5; const w = Math.min(900, 600 * ar), h = w / ar; addLayer({ id: newId(), nm: 'صورة', t: 'pic', x: r1(960 - w / 2), y: r1(540 - h / 2), w: r1(w), h: r1(h), src }); }; im.onerror = () => addLayer({ id: newId(), nm: 'صورة', t: 'pic', x: 660, y: 340, w: 600, h: 400, src }); im.src = C6.imgPath(src, {}); });
const MAPS = [
  { s: 20, t: 'توزيع المدن الجديدة', p: 'image55' }, { s: 26, t: 'تطوير المناطق غير الآمنة', p: 'image82' }, { s: 38, c: 0, t: 'شبكة الطرق القائمة والجديدة', p: 'image109' },
  { s: 38, c: 1, t: 'محاور النيل', p: 'image108' }, { s: 58, t: 'الموانئ البحرية', p: 'image171' }, { s: 63, t: 'الموانئ الجافة' }, { s: 66, t: 'المطارات' }, { s: 72, c: 4, t: 'محطات المعالجة' }, { s: 86, c: 5, t: 'البترول والغاز' }, { s: 151, c: 4, t: 'حياة كريمة · المرحلة الأولى' }];
$('bMap').onclick = () => {
  modal('ضيف خريطة حية', MAPS.map((m, i) => `<div class="card big" data-i="${i}"><svg class="i" viewBox="0 0 24 24" style="width:34px;height:34px"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/></svg>${m.t}</div>`).join(''), el => {
    const m = MAPS[+el.dataset.i]; closeModal();
    addLayer({ id: newId(), nm: 'خريطة · ' + m.t, t: 'video', map: { s: m.s, c: m.c }, x: 460, y: 140, w: 1000, h: 860 });
  });
};

/* ───────────── new slides */
document.querySelectorAll('#ddSlide [data-new]').forEach(b => b.onclick = () => {
  closeMenus(); const how = b.dataset.new;
  if (how === 'tpl') return chooseTemplate();
  if (how === 'dup') return insertSlide(Object.assign(clone(S), { id: 'u' + Date.now().toString(36) }), 'اتكررت السلايد');
  if (how === 'head') return insertSlide({ id: 'u' + Date.now().toString(36), layout: S.layout, bg: S.bg, layers: [{ id: newId(), nm: 'العنوان', t: 'shape', geom: { p: 'rect' }, x: 210, y: 130, w: 1500, h: 110, text: Object.assign(newText('عنوان السلايد', 56), { paras: [{ al: 'center', rtl: 1, runs: [{ t: 'عنوان السلايد', sz: 112, fl: 'Cairo Black', fc: 'Cairo Black', c: '#38526b' }] }] }) }] }, 'سلايد جديدة بالهيدر');
  if (how === 'blank') return insertSlide({ id: 'u' + Date.now().toString(36), layout: S.layout, nolayout: 1, bg: { c: '#f3f1ee' }, layers: [] }, 'سلايد فاضية');
});
function insertSlide(N, msg) {
  finishEdit();
  N.n = 0; delete N.hidden; delete N.notes;
  const E = st.get(); E.slides = E.slides || {}; E.slides[N.id] = N;
  E.order = (E.order && E.order.length ? E.order : slides.map(s => s.id)).filter(id => id !== N.id);
  const at = E.order.indexOf(S.id); E.order.splice(at + 1, 0, N.id);
  st.set(E, 'new-slide');
  slides = C6.mergeEdits(C6.deck, E); drawStrip(); loadSlide(slides.findIndex(s => s.id === N.id)); toast(msg);
}
function chooseTemplate() {
  const html = slides.map((s, i) => `<div class="card" data-i="${i}"><div class="tm"></div><p>${placeOf(i) || '–'} · ${esc(C6.titleOf(s))}</p></div>`).join('');
  modal('اختار قالب — هتتعمل نسخة منه بعد السلايد الحالية', html, el => { const T = slides[+el.dataset.i]; closeModal(); insertSlide(Object.assign(clone(T), { id: 'u' + Date.now().toString(36) }), 'سلايد جديدة من القالب'); }, (card, i) => card.querySelector('.tm').appendChild(C6.mini(slides[i], 196, { thumb: true })));
}

/* ───────────── strip (slides) + layers list */
let io = null;
function drawStrip() {
  const L = $('slist'); L.innerHTML = '';
  if (io) io.disconnect();
  io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); fillThumb(e.target); } }), { root: L, rootMargin: '400px' });
  const E = st.get();
  slides.forEach((s, i) => {
    const d = document.createElement('div'); d.className = 'st' + (s.hidden ? ' hid' : '') + (E.slides && E.slides[s.id] ? ' ed' : ''); d.dataset.i = i; d.draggable = true;
    d.innerHTML = `<div class="no num">${s.hidden ? '–' : placeOf(i)}</div><div class="tm"></div>`;
    L.appendChild(d); io.observe(d);
  });
  markStrip();
}
function fillThumb(d) { const i = +d.dataset.i; const tm = d.querySelector('.tm'); tm.innerHTML = ''; const w = tm.clientWidth || 180; tm.style.height = Math.round(w * 9 / 16) + 'px'; const m = C6.mini(slides[i], w, { thumb: true, num: placeOf(i) }); m.classList.add('c6thumb'); tm.appendChild(m); }
function refreshThumb(i) { const d = $('slist').querySelector(`.st[data-i="${i}"]`); if (d) { fillThumb(d); d.classList.add('ed'); } }
function markStrip() { document.querySelectorAll('.st.cur').forEach(x => x.classList.remove('cur')); const d = $('slist').querySelector(`.st[data-i="${si}"]`); if (d) { d.classList.add('cur'); d.scrollIntoView({ block: 'nearest' }); } }
$('slist').addEventListener('click', e => { const d = e.target.closest('.st'); if (d) loadSlide(+d.dataset.i); });
/* drag a slide to a new place */
let dragI = null;
$('slist').addEventListener('dragstart', e => { const d = e.target.closest('.st'); if (!d) return; dragI = +d.dataset.i; d.classList.add('drag'); e.dataTransfer.effectAllowed = 'move'; });
$('slist').addEventListener('dragover', e => { const d = e.target.closest('.st'); if (!d || dragI == null) return; e.preventDefault(); document.querySelectorAll('.st.over').forEach(x => x.classList.remove('over')); d.classList.add('over'); });
$('slist').addEventListener('dragend', () => { document.querySelectorAll('.st.drag,.st.over').forEach(x => x.classList.remove('drag', 'over')); dragI = null; });
$('slist').addEventListener('drop', e => {
  const d = e.target.closest('.st'); if (!d || dragI == null) return; e.preventDefault();
  const to = +d.dataset.i, from = dragI; dragI = null; if (to === from) return;
  const ids = slides.map(s => s.id); const [m] = ids.splice(from, 1); ids.splice(to, 0, m);
  const E = st.get(); E.order = ids; st.set(E, 'order');
  const cur = S.id; slides = C6.mergeEdits(C6.deck, E); si = slides.findIndex(s => s.id === cur); drawStrip(); toast('اتغير الترتيب');
});
document.querySelectorAll('#strip .sh button').forEach(b => b.onclick = () => { document.querySelectorAll('#strip .sh button').forEach(x => x.classList.toggle('on', x === b)); $('slist').hidden = b.dataset.tab !== 's'; $('llist').hidden = b.dataset.tab !== 'l'; drawLayers(); });
const KIND = { shape: '▭', pic: '🖼', video: '▶', line: '╱', svg: '✦', chart: '📊' };
function layerName(L) {
  if (L.text && !L.text.empty) return L.text.paras.map(p => p.runs.map(r => r.t).join('')).join(' ').trim().slice(0, 40);
  if (L.map) return L.nm && !/^Picture/.test(L.nm) ? L.nm : 'خريطة';
  if (L.kn) return 'سؤال كي نوت ' + L.kn;
  if (L.embed) return L.nm || 'صفحة كود';
  return L.nm || L.t;
}
function drawLayers() {
  const box = $('llist'); if (box.hidden) return; box.innerHTML = '';
  const Ls = (S.layers || []).slice().reverse();
  Ls.forEach(L => {
    const r = document.createElement('div'); r.className = 'lr' + (sel.includes(L.id) ? ' on' : '') + (L.hid ? ' off' : ''); r.dataset.id = L.id;
    r.innerHTML = `<span class="k">${L.map ? '🗺' : L.kn ? '❓' : L.text ? 'T' : KIND[L.t] || '•'}</span><span class="nm">${esc(layerName(L))}</span>
      <button data-a="up" title="لقدام">▲</button><button data-a="dn" title="لورا">▼</button><button data-a="eye" title="${L.hid ? 'إظهار' : 'إخفاء'}">${L.hid ? '◌' : '👁'}</button><button data-a="lock" title="${L.lock ? 'فك القفل' : 'قفل'}">${L.lock ? '🔒' : '🔓'}</button>`;
    box.appendChild(r);
  });
  if (S.layout && C6.deck.layouts[S.layout] && C6.deck.layouts[S.layout].layers.length) {
    const r = document.createElement('div'); r.className = 'lr' + (S.nolayout || S.nomaster ? ' off' : ''); r.innerHTML = `<span class="k">▤</span><span class="nm">هيدر وخلفية القالب</span><button data-a="lay">${S.nolayout || S.nomaster ? '◌' : '👁'}</button>`; box.appendChild(r);
  }
}
$('llist').addEventListener('click', e => {
  const r = e.target.closest('.lr'); if (!r) return; const a = e.target.closest('button') && e.target.closest('button').dataset.a;
  if (a === 'lay') return change(() => { if (S.nolayout || S.nomaster) { delete S.nolayout; delete S.nomaster; } else S.nolayout = 1; }, 'layout');
  const L = byId(r.dataset.id); if (!L) return;
  if (a === 'eye') return change(() => { L.hid ? delete L.hid : L.hid = 1; }, 'hide-layer');
  if (a === 'lock') return change(() => { L.lock ? delete L.lock : L.lock = 1; }, 'lock');
  if (a === 'up' || a === 'dn') return change(() => { const i = S.layers.indexOf(L); const j = a === 'up' ? i + 1 : i - 1; if (j < 0 || j >= S.layers.length) return; S.layers.splice(i, 1); S.layers.splice(j, 0, L); }, 'order');
  sel = e.shiftKey ? [...new Set(sel.concat(L.id))] : [L.id]; drawSel(); drawProps(); drawLayers();
});

/* ───────────── the properties panel */
const P = $('props');
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function swatches(cur, key, none) {
  return `<div class="sw" data-sw="${key}">${none ? '<button class="none" data-c="none" title="بدون"></button>' : ''}${PALETTE.map(c => `<button data-c="${c}" style="background:${c}" title="${c}"></button>`).join('')}<input type="color" data-cc="${key}" value="${/^#[0-9a-f]{6}$/i.test(cur || '') ? cur : '#38526b'}"></div>`;
}
const ICO = {
  r: '<svg class="i" viewBox="0 0 24 24"><path d="M4 6h16M8 12h12M4 18h16"/></svg>', c: '<svg class="i" viewBox="0 0 24 24"><path d="M4 6h16M7 12h10M4 18h16"/></svg>',
  l: '<svg class="i" viewBox="0 0 24 24"><path d="M4 6h16M4 12h12M4 18h16"/></svg>', j: '<svg class="i" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>'
};
function drawProps() {
  const Ls = selL();
  if (!Ls.length) return drawSlideProps();
  const L = Ls[0], one = Ls.length === 1;
  let h = '';
  h += `<div class="ps"><h3>${one ? `<b>${esc(layerName(L))}</b>` : `<b>${Ls.length} حاجات مختارة</b>`}</h3>
    <div class="fr"><button class="bb" data-act="dup">تكرار</button><button class="bb" data-act="front">لقدام خالص</button><button class="bb" data-act="back">لورا خالص</button><button class="bb warn" data-act="del">مسح</button></div>
    <div class="fr"><button class="bb ${L.hid ? 'on' : ''}" data-act="hid">${L.hid ? 'مخفي — إظهار' : 'إخفاء من العرض'}</button><button class="bb ${L.lock ? 'on' : ''}" data-act="lock">${L.lock ? 'مقفول' : 'قفل'}</button>${one && ORIG[S.id] && isChanged(L) ? '<button class="bb" data-act="revL">رجوع للأصل</button>' : ''}</div></div>`;
  if (one) h += `<div class="ps"><h3>المكان والحجم</h3><div class="g4">${['x', 'y', 'w', 'h'].map(f => `<label>${{ x: 'يمين/شمال', y: 'فوق/تحت', w: 'العرض', h: 'الطول' }[f]}<input type="number" data-f="${f}" value="${Math.round(L[f])}"></label>`).join('')}</div>
    <div class="fr"><label>الدوران</label><input type="number" data-f="rot" value="${Math.round(L.rot || 0)}" step="1"><label>الشفافية</label><input type="range" data-f="op" min="0" max="1" step=".05" value="${L.op == null ? 1 : L.op}" style="flex:1"></div>
    <div class="fr"><button class="bb" data-act="cx">توسيط أفقي</button><button class="bb" data-act="cy">توسيط رأسي</button><button class="bb" data-act="full">ملء السلايد</button></div></div>`;
  // text
  if (Ls.some(x => x.text)) {
    const T = (Ls.find(x => x.text)).text, r0 = T.paras[0] && T.paras[0].runs.find(r => r.t && r.t.trim()) || (T.paras[0] && T.paras[0].runs[0]) || {};
    const face = r0.fc || r0.fl || 'Cairo';
    h += `<div class="ps"><h3>النص</h3>
      ${one ? `<div class="fr"><button class="bb pri" data-act="type" style="flex:1">✎ اكتب في النص (أو دبل كليك)</button></div>` : ''}
      <div class="fr"><label>الخط</label><select data-tx="face" style="flex:1">${FACES.concat(FACES.includes(face) ? [] : [face]).map(f => `<option ${f === face ? 'selected' : ''}>${esc(f)}</option>`).join('')}</select></div>
      <div class="fr"><label>المقاس</label><button class="bb" data-tx="sz-">−</button><input type="number" data-tx="sz" value="${Math.round((r0.sz || 36) / 2)}" style="width:64px"><button class="bb" data-tx="sz+">+</button><span class="note">نقطة</span></div>
      <div class="fr"><label>المحاذاة</label><div class="seg" style="flex:1">${[['right', 'r'], ['center', 'c'], ['left', 'l'], ['justify', 'j']].map(([a, i]) => `<button data-tx="al" data-v="${a}" class="${T.paras[0] && T.paras[0].al === a ? 'on' : ''}">${ICO[i]}</button>`).join('')}</div></div>
      <div class="fr"><label>المكان</label><div class="seg" style="flex:1">${[['t', 'فوق'], ['ctr', 'نص'], ['b', 'تحت']].map(([a, t]) => `<button data-tx="an" data-v="${a}" class="${T.anchor === a ? 'on' : ''}">${t}</button>`).join('')}</div></div>
      <div class="fr"><label>بين السطور</label><input type="range" data-tx="lh" min=".6" max="2" step=".05" value="${(T.paras[0] && T.paras[0].lh) || 1}" style="flex:1"></div>
      <div class="fr"><label>تقيل</label><button class="bb ${r0.b ? 'on' : ''}" data-tx="b">B</button><label style="min-width:auto">مائل</label><button class="bb ${r0.i ? 'on' : ''}" data-tx="i"><i>I</i></button></div>
      <label class="note">لون النص</label>${swatches(r0.c, 'tc')}</div>`;
  }
  if (one && L.t === 'shape') {
    const g = L.geom || { p: 'rect' };
    h += `<div class="ps"><h3>الشكل</h3><label class="note">لون الخلفية</label>${swatches(L.fill && L.fill.c, 'fill', true)}
      ${L.fill && L.fill.stops ? '<div class="note">الخلفية متدرجة من الأصل — اختيار لون هيخليها لون واحد.</div>' : ''}
      <label class="note">لون الإطار</label>${swatches(L.ln && L.ln.c, 'ln', true)}
      <div class="fr"><label>سُمك الإطار</label><input type="range" data-f="lnw" min="0" max="20" step=".5" value="${L.ln ? L.ln.w : 0}" style="flex:1"></div>
      ${g.p === 'rect' || g.p === 'roundRect' ? `<div class="fr"><label>تدوير الحواف</label><input type="range" data-f="rad" min="0" max="50000" step="500" value="${g.p === 'roundRect' ? ((g.adj && g.adj.adj) != null ? g.adj.adj : 16667) : 0}" style="flex:1"></div>` : ''}</div>`;
  }
  if (one && L.t === 'line') h += `<div class="ps"><h3>الخط</h3><label class="note">اللون</label>${swatches(L.ln && L.ln.c, 'ln')}<div class="fr"><label>السُمك</label><input type="range" data-f="lnw" min="1" max="30" step=".5" value="${L.ln ? L.ln.w : 2}" style="flex:1"></div></div>`;
  if (one && L.t === 'pic') {
    h += `<div class="ps"><h3>الصورة</h3><div class="fr"><button class="bb pri" data-act="repl" style="flex:1">تغيير الصورة</button>${L.crop ? '<button class="bb" data-act="uncrop">من غير قص</button>' : ''}</div>
      <div class="fr"><label>تدوير الحواف</label><input type="range" data-f="prad" min="0" max="50000" step="500" value="${L.geom && L.geom.p === 'roundRect' ? ((L.geom.adj && L.geom.adj.adj) || 16667) : 0}" style="flex:1"></div>
      <div class="note">لتكبير الصورة من غير ما تتمط اسحب من الأركان.</div></div>`;
  }
  if (one && L.t === 'video' && L.map) {
    h += `<div class="ps"><h3>الخريطة <b>حية</b></h3>
      <div class="fr"><label>تكبير جوه الإطار</label><input type="range" data-f="zf" min=".6" max="2.6" step=".05" value="${L.map.zf || 1}" style="flex:1"><span class="note num">${Math.round((L.map.zf || 1) * 100)}%</span></div>
      <div class="note">الحجم: اسحب أركان الإطار على السلايد. النقاط: شيل علامة أي مكان عشان يختفي من الخريطة.</div>
      <div class="fr" style="margin-top:8px"><button class="bb" data-act="mall">إظهار الكل</button><button class="bb" data-act="mnone">إخفاء الكل</button><span class="sp"></span><span class="note" id="mcount"></span></div>
      <div id="mitems"><div class="note" style="padding:8px">جاري قراءة نقاط الخريطة…</div></div>
      <div class="fr" style="margin-top:8px"><button class="bb" data-act="usevid">${L.useVideo ? 'شغّل الخريطة الحية' : 'استخدم الفيديو بدل الخريطة الحية'}</button></div></div>`;
    setTimeout(() => loadMapItems(L), 30);
  } else if (one && L.t === 'video' && L.kn) {
    h += `<div class="ps"><h3>سؤال الكي نوت ${L.kn} <b>${L.useVideo ? 'فيديو' : 'حي'}</b></h3><div class="note">الصفحة الحية بتعمل نفس حركة الفيديو (السؤال بيتكتب ثم الأرقام) وأخف وأوضح.</div>
      <div class="fr"><button class="bb" data-act="usevid">${L.useVideo ? 'رجّعها حية' : 'استخدم الفيديو الأصلي'}</button></div></div>`;
  } else if (one && L.t === 'video') {
    h += `<div class="ps"><h3>الفيديو</h3><div class="fr"><button class="bb ${L.loop ? 'on' : ''}" data-act="loop">تكرار</button><button class="bb ${L.mute ? 'on' : ''}" data-act="mute">${L.mute ? 'من غير صوت' : 'بالصوت'}</button>${L.embed ? `<button class="bb" data-act="usevid">${L.useVideo ? 'رجّعه كود' : 'استخدم الفيديو'}</button>` : ''}</div></div>`;
  }
  if (one && L.t === 'chart') h += chartProps(L);
  P.innerHTML = h;
  wireProps();
}
function isChanged(L) { const o = ORIG[S.id]; if (!o) return false; const a = o.layers.find(x => x.id === L.id); return !a || JSON.stringify(a) !== JSON.stringify(L); }
function drawSlideProps() {
  const E = st.get(); const pts = (E.points && E.points[S.id]) || (window.C6_POINTS && window.C6_POINTS[S.id]) || { p: [] };
  const edited = !!(E.slides && E.slides[S.id]); const isNew = !ORIG[S.id];
  const bg = C6.slideBg(S);
  P.innerHTML = `<div class="ps"><h3>السلايد <b>${placeOf(si) || '–'}</b> ${S.n ? `<span class="note">· سلايد ${S.n} في الـpptx</span>` : '<span class="note">· جديدة</span>'}</h3>
    <div class="fr"><button class="bb ${slides[si].hidden ? 'on' : ''}" data-act="shide">${slides[si].hidden ? 'مخفية — إظهار' : 'إخفاء من العرض'}</button>${edited && !isNew ? '<button class="bb" data-act="srev">رجوع للأصل</button>' : ''}${isNew ? '<button class="bb warn" data-act="sdel">مسح السلايد</button>' : ''}</div>
    <div class="note">${edited ? 'السلايد دي متعدلة — الأصل محفوظ ويرجع بضغطة.' : 'السلايد زي الأصل.'}</div></div>
    <div class="ps"><h3>الخلفية</h3>${bg.c ? swatches(bg.c, 'bg') : '<div class="note">الخلفية صورة أو متدرجة من القالب.</div>' + swatches(null, 'bg')}
      <div class="fr"><button class="bb ${S.nolayout || S.nomaster ? '' : 'on'}" data-act="lay">${S.nolayout || S.nomaster ? 'إظهار هيدر القالب' : 'إخفاء هيدر القالب'}</button></div></div>
    <div class="ps"><h3>نقاط الشرح <b>لشاشة المتحدث</b></h3>
      <div class="fr"><label>عنوان قصير</label><input data-pt="t" value="${esc(pts.t || '')}" style="flex:1" placeholder="${esc(C6.titleOf(S))}"></div>
      <div class="fr"><label>الرقم الأهم</label><input data-pt="k" value="${esc(pts.k || '')}" style="flex:1" placeholder="مثلًا: 39 مدينة جديدة"></div>
      <textarea data-pt="p" placeholder="كل نقطة في سطر — اكتب **الرقم** بين نجمتين عشان يظهر بارز">${esc((pts.p || []).join('\n'))}</textarea>
      <div class="fr"><label>الوقت المخطط</label><input type="number" data-pt="sec" value="${pts.sec || ''}" placeholder="ثانية" style="width:90px"><span class="note">ثانية (فاضي = بالتساوي)</span></div></div>
    <div class="ps"><h3>الحفظ</h3><div class="note">كل تعديل بيتحفظ لوحده. لما الفولدر يكون مربوط بيتكتب في <b>forum-v3/src/c6/edits.js</b> جوه فولدر العرض — انقل الفولدر لأي جهاز والتعديلات معاه.</div>
      <div class="fr" style="margin-top:8px"><button class="bb pri" data-act="link">${st.perm === 'granted' && st.dir ? 'الفولدر مربوط ✓' : 'اربط فولدر العرض'}</button><button class="bb" data-act="dl">تنزيل ملف التعديلات</button><button class="bb" data-act="ul">تحميل ملف تعديلات</button></div></div>`;
  wireProps();
}
function setPoints(f, v) {
  const E = st.get(); E.points = E.points || {}; const base = E.points[S.id] || clone((window.C6_POINTS && window.C6_POINTS[S.id]) || { p: [] });
  if (f === 'p') base.p = v.split('\n').map(x => x.trim()).filter(Boolean); else if (f === 'sec') base.sec = +v || 0; else base[f] = v;
  E.points[S.id] = base; st.set(E, 'points');
}
function applyText(fn) { selL().forEach(L => { if (!L.text) return; L.text.paras.forEach(p => fn(p, L)); }); }
function wireProps() {
  P.querySelectorAll('[data-act]').forEach(b => b.onclick = () => act(b.dataset.act));
  P.querySelectorAll('input[data-f]').forEach(inp => {
    const f = inp.dataset.f; const live = inp.type === 'range';
    inp.addEventListener(live ? 'input' : 'change', () => {
      const v = +inp.value; const Ls = selL();
      if (live && !inp._snap) { snapshot(); inp._snap = 1; }
      const fn = () => Ls.forEach(L => {
        if (['x', 'y', 'w', 'h'].includes(f)) L[f] = v;
        else if (f === 'rot') { if (v) L.rot = v; else delete L.rot; }
        else if (f === 'op') { if (v < 1) L.op = v; else delete L.op; }
        else if (f === 'lnw') { if (v > 0) { L.ln = Object.assign({ c: '#38526b' }, L.ln || {}, { w: v }); } else delete L.ln; }
        else if (f === 'rad') { if (v > 0) L.geom = { p: 'roundRect', adj: { adj: v } }; else L.geom = { p: 'rect' }; }
        else if (f === 'prad') { if (v > 0) L.geom = { p: 'roundRect', adj: { adj: v } }; else delete L.geom; }
        else if (f === 'zf') { L.map.zf = v; }
      });
      if (live) { fn(); Ls.forEach(L => f === 'zf' ? null : redrawLayer(L)); drawSel(); commit('prop'); if (f === 'zf') { clearTimeout(inp._zt); inp._zt = setTimeout(() => Ls.forEach(redrawLayer), 350); const n = inp.parentNode.querySelector('.num'); if (n) n.textContent = Math.round(v * 100) + '%'; } }
      else change(fn, 'prop');
    });
    if (live) inp.addEventListener('change', () => { inp._snap = 0; drawProps(); });
  });
  P.querySelectorAll('[data-tx]').forEach(el => {
    const t = el.dataset.tx;
    const ev = el.tagName === 'SELECT' ? 'change' : el.type === 'range' ? 'input' : el.tagName === 'INPUT' ? 'change' : 'click';
    el.addEventListener(ev, () => {
      if (t === 'lh') { if (!el._snap) { snapshot(); el._snap = 1; } applyText(p => { p.lh = +el.value; delete p.lhpt; }); selL().forEach(redrawLayer); drawSel(); commit('text'); return; }
      change(() => {
        if (t === 'face') applyText(p => p.runs.forEach(r => { r.fc = r.fl = el.value; delete r.b; }));
        if (t === 'sz') applyText(p => { const r0 = p.runs.find(r => r.t && r.t.trim()) || p.runs[0]; const f = (+el.value * 2) / (r0.sz || 36); p.runs.forEach(r => r.sz = r1((r.sz || 36) * f)); });
        if (t === 'sz+' || t === 'sz-') applyText(p => p.runs.forEach(r => r.sz = r1(Math.max(8, (r.sz || 36) + (t === 'sz+' ? 4 : -4)))));
        if (t === 'al') applyText(p => { p.al = el.dataset.v; });
        if (t === 'an') selL().forEach(L => { if (L.text) L.text.anchor = el.dataset.v; });
        if (t === 'b') { const on = !el.classList.contains('on'); applyText(p => p.runs.forEach(r => { if (on) r.b = 1; else delete r.b; })); }
        if (t === 'i') { const on = !el.classList.contains('on'); applyText(p => p.runs.forEach(r => { if (on) r.i = 1; else delete r.i; })); }
      }, 'text');
    });
    if (el.type === 'range') el.addEventListener('change', () => { el._snap = 0; });
  });
  P.querySelectorAll('[data-sw]').forEach(sw => {
    const key = sw.dataset.sw;
    const set = c => {
      if (key === 'bg') { change(() => { S.bg = c === 'none' ? { c: '#ffffff' } : { c }; }, 'bg'); return; }
      change(() => selL().forEach(L => {
        if (key === 'tc') { if (L.text) L.text.paras.forEach(p => p.runs.forEach(r => { r.c = c; delete r.grad; delete r.patt; })); }
        if (key === 'fill') { if (c === 'none') delete L.fill; else L.fill = { c }; }
        if (key === 'ln') { if (c === 'none') delete L.ln; else L.ln = Object.assign({ w: L.t === 'line' ? 4 : 3 }, L.ln || {}, { c }); }
      }), 'color');
    };
    sw.querySelectorAll('button').forEach(b => b.onclick = () => set(b.dataset.c));
    const cc = sw.querySelector('input[type=color]'); if (cc) cc.addEventListener('change', () => set(cc.value));
  });
  P.querySelectorAll('[data-pt]').forEach(el => el.addEventListener('change', () => setPoints(el.dataset.pt, el.value)));
  P.querySelectorAll('[data-ch]').forEach(el => el.addEventListener('change', () => { const [si_, vi] = el.dataset.ch.split(',').map(Number); const L = selL()[0]; change(() => { L.chart.plots[0].series[si_].vals[vi] = parseFloat(String(el.value).replace(/[٠-٩]/g, c => '٠١٢٣٤٥٦٧٨٩'.indexOf(c))) || 0; }, 'chart'); }));
}
function act(a) {
  const Ls = selL(), L = Ls[0];
  switch (a) {
    case 'dup': return dupSel();
    case 'del': return delSel();
    case 'front': return change(() => { Ls.forEach(x => { S.layers.splice(S.layers.indexOf(x), 1); S.layers.push(x); }); }, 'order');
    case 'back': return change(() => { Ls.slice().reverse().forEach(x => { S.layers.splice(S.layers.indexOf(x), 1); S.layers.unshift(x); }); }, 'order');
    case 'hid': return change(() => Ls.forEach(x => x.hid ? delete x.hid : x.hid = 1), 'hide-layer');
    case 'lock': return change(() => Ls.forEach(x => x.lock ? delete x.lock : x.lock = 1), 'lock');
    case 'revL': { const o = ORIG[S.id].layers.find(x => x.id === L.id); return change(() => { const i = S.layers.indexOf(L); if (o) S.layers[i] = clone(o); else S.layers.splice(i, 1); }, 'revert-layer'); }
    case 'cx': return change(() => Ls.forEach(x => x.x = r1(960 - x.w / 2)), 'align');
    case 'cy': return change(() => Ls.forEach(x => x.y = r1(540 - x.h / 2)), 'align');
    case 'full': return change(() => Ls.forEach(x => { x.x = 0; x.y = 0; x.w = 1920; x.h = 1080; }), 'align');
    case 'type': return startEdit(L);
    case 'repl': return pickImage(src => change(() => { L.src = src; delete L.crop; }, 'image'));
    case 'uncrop': return change(() => { delete L.crop; }, 'image');
    case 'usevid': return change(() => { L.useVideo ? delete L.useVideo : L.useVideo = 1; }, 'video');
    case 'loop': return change(() => { L.loop ? delete L.loop : L.loop = 1; }, 'video');
    case 'mute': return change(() => { L.mute ? delete L.mute : L.mute = 1; }, 'video');
    case 'mall': return change(() => { L.map.hide = []; }, 'map');
    case 'mnone': return change(() => { L.map.hide = (mapItems[mapKey(L)] || []).map(x => x.k); }, 'map');
    case 'shide': { const E = st.get(); E.hide = E.hide || {}; E.hide[S.id] = !slides[si].hidden; st.set(E, 'hide'); slides[si].hidden = E.hide[S.id]; drawStrip(); drawProps(); return; }
    case 'srev': { if (!confirm('ترجع السلايد دي زي الأصل؟ كل تعديلاتها هتتشال.')) return; const E = st.get(); delete E.slides[S.id]; st.set(E, 'revert'); slides = C6.mergeEdits(C6.deck, E); loadSlide(si); drawStrip(); toast('رجعت زي الأصل'); return; }
    case 'sdel': { if (!confirm('تمسح السلايد الجديدة دي؟')) return; const E = st.get(); delete E.slides[S.id]; E.order = (E.order || []).filter(id => id !== S.id); st.set(E, 'delete-slide'); slides = C6.mergeEdits(C6.deck, E); drawStrip(); loadSlide(Math.max(0, si - 1)); return; }
    case 'lay': return change(() => { if (S.nolayout || S.nomaster) { delete S.nolayout; delete S.nomaster; } else S.nolayout = 1; }, 'layout');
    case 'link': return st.link().then(() => { savePill(); drawProps(); });
    case 'dl': return st.download();
    case 'ul': return $('fEdits').click();
  }
}
$('fEdits').onchange = () => { const f = $('fEdits').files[0]; if (!f) return; f.text().then(t => { try { st.importText(t); slides = C6.mergeEdits(C6.deck, st.get()); drawStrip(); loadSlide(0); toast('اتحملت التعديلات'); } catch (e) { alert('الملف ده مش ملف تعديلات: ' + e.message); } }); $('fEdits').value = ''; };
function chartProps(L) {
  const pl = L.chart.plots[0]; const cats = pl.series[0].cats || [];
  return `<div class="ps"><h3>أرقام الشارت</h3><div style="overflow:auto"><table style="border-collapse:collapse;font-size:12px"><tr><td></td>${pl.series.map(s => `<td style="padding:3px;color:var(--mute)">${esc(s.name || '')}</td>`).join('')}</tr>
    ${cats.map((c, i) => `<tr><td style="padding:3px;color:var(--mute);white-space:nowrap">${esc(c)}</td>${pl.series.map((s, j) => `<td style="padding:2px"><input data-ch="${j},${i}" value="${s.vals[i] == null ? '' : s.vals[i]}" style="width:70px"></td>`).join('')}</tr>`).join('')}</table></div></div>`;
}

/* ───────────── map points: asked from the map itself (kmap.html answers {kmap:'items'}) */
const mapItems = {};
const mapKey = L => L.map.s + ':' + (L.map.c == null ? '' : L.map.c);
function loadMapItems(L) {
  const key = mapKey(L);
  if (mapItems[key]) return drawMapItems(L);
  const f = document.createElement('iframe'); f.style.cssText = 'position:fixed;left:-3000px;top:0;width:800px;height:600px;opacity:0';
  f.src = C6.mapUrl({ s: L.map.s, c: L.map.c });
  const on = e => { const d = e.data; if (d && d.kmap === 'items' && e.source === f.contentWindow) { mapItems[key] = d.items || []; removeEventListener('message', on); f.remove(); drawMapItems(L); } };
  addEventListener('message', on); document.body.appendChild(f);
  setTimeout(() => { if (!mapItems[key]) { try { f.contentWindow.postMessage({ kmap: 'items' }, '*'); } catch (e) { } } }, 2500);
  setTimeout(() => { if (!mapItems[key]) { removeEventListener('message', on); f.remove(); const b = $('mitems'); if (b) b.innerHTML = '<div class="note" style="padding:8px">الخريطة دي مش بتدي قايمة نقاط — تقدر تغيّر حجمها وتكبيرها بس.</div>'; } }, 8000);
}
function drawMapItems(L) {
  const box = $('mitems'); if (!box || selL()[0] !== L) return;
  const items = mapItems[mapKey(L)] || []; const hide = new Set(L.map.hide || []);
  const K = { pt: 'مكان', gov: 'محافظة', route: 'مسار' };
  box.innerHTML = items.length ? items.map((it, i) => `<label class="mi ${hide.has(it.k) ? 'off' : ''}"><input type="checkbox" data-mk="${i}" ${hide.has(it.k) ? '' : 'checked'}><span>${esc(it.k)}</span><span class="note" style="margin-inline-start:auto">${K[it.kind] || ''}</span></label>`).join('') : '<div class="note" style="padding:8px">مفيش نقاط في الخريطة دي.</div>';
  const c = $('mcount'); if (c) c.textContent = `${items.length - hide.size} من ${items.length} ظاهر`;
  box.querySelectorAll('input[data-mk]').forEach(inp => inp.onchange = () => {
    const it = items[+inp.dataset.mk]; snapshot();
    const h = new Set(L.map.hide || []); inp.checked ? h.delete(it.k) : h.add(it.k); L.map.hide = [...h];
    inp.parentNode.classList.toggle('off', !inp.checked);
    const cc = $('mcount'); if (cc) cc.textContent = `${items.length - h.size} من ${items.length} ظاهر`;
    clearTimeout(box._t); box._t = setTimeout(() => { redrawLayer(L); drawSel(); }, 500); commit('map');
  });
}

/* ───────────── image picker: the deck's own pictures, or a file from the computer */
let imgCb = null;
const DECK_IMGS = (() => { const s = new Set(); C6.deck.slides.forEach(x => x.layers.forEach(L => { if (L.t === 'pic' && L.src) s.add(L.src); })); return [...s]; })();
function pickImage(cb) {
  imgCb = cb;
  modal('اختار صورة', `<div class="card big" id="upl"><svg class="i" viewBox="0 0 24 24" style="width:34px;height:34px"><path d="M12 16V4M7 9l5-5 5 5M4 20h16"/></svg>صورة من الجهاز</div>` + DECK_IMGS.map(s => `<div class="card" data-src="${esc(s)}"><img loading="lazy" src="${esc(C6.imgPath(s, { thumb: true }))}" alt=""></div>`).join(''), el => {
    if (el.id === 'upl') { $('fImg').click(); return; }
    closeModal(); cb(el.dataset.src);
  });
}
$('fImg').onchange = async () => { const f = $('fImg').files[0]; if (!f) return; closeModal(); const src = await st.saveImage(f); if (!/^data:/.test(src)) toast('اتحفظت الصورة في فولدر العرض'); else toast('الصورة اتحفظت جوه التعديلات (اربط الفولدر عشان تتحفظ كملف)'); imgCb && imgCb(src); $('fImg').value = ''; };

/* ───────────── modal / menus */
let modalCb = null;
function modal(title, html, onPick, onCard) {
  $('mTitle').textContent = title; $('mBody').innerHTML = html; $('modal').classList.add('on'); modalCb = onPick;
  if (onCard) { const io2 = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io2.unobserve(e.target); onCard(e.target, +e.target.dataset.i); } }), { root: $('mBody'), rootMargin: '300px' }); $('mBody').querySelectorAll('.card[data-i]').forEach(c => io2.observe(c)); }
}
function closeModal() { $('modal').classList.remove('on'); $('mBody').innerHTML = ''; modalCb = null; }
$('mClose').onclick = closeModal; $('modal').onclick = e => { if (e.target === $('modal')) closeModal(); };
$('mBody').addEventListener('click', e => { const c = e.target.closest('.card'); if (c && modalCb) modalCb(c); });
document.querySelectorAll('.dd > .tb').forEach(b => b.onclick = e => { e.stopPropagation(); const d = b.parentNode; const o = d.classList.contains('open'); closeMenus(); if (!o) d.classList.add('open'); });
function closeMenus() { document.querySelectorAll('.dd.open').forEach(d => d.classList.remove('open')); }
addEventListener('click', e => { if (!e.target.closest('.dd')) closeMenus(); });

/* ───────────── top: back, save, play */
$('bBack').onclick = () => { finishEdit(); const w = window.open('c6-control.html', 'c6ctl'); try { w.focus(); } catch (e) { } };
$('bPlay').onclick = () => { finishEdit(); commit('play', true); window.open('c6-show.html?sid=' + encodeURIComponent(S.id), 'c6show', 'popup=yes,width=1280,height=720'); };
function saveNow() { finishEdit(); commit('save', true); if (st.perm === 'granted' && st.dir) st.saveFile().then(ok => toast(ok ? 'اتحفظ في فولدر العرض ✓' : 'ما اتحفظش — جرّب تاني')); else st.link().then(ok => { if (ok) toast('اتربط الفولدر واتحفظ ✓'); savePill(); }); }
$('bSave').onclick = saveNow;
function savePill() {
  const p = $('pSave'), t = p.querySelector('span');
  if (st.perm === 'granted' && st.dir) { p.className = 'pill ' + (st.dirty ? 'warn' : 'ok'); t.textContent = st.dirty ? 'بيحفظ…' : 'محفوظ في فولدر العرض'; }
  else if (st.perm === 'prompt') { p.className = 'pill warn'; t.textContent = 'اضغط لتفعيل الحفظ في الفولدر'; }
  else { p.className = 'pill' + (st.get().savedAt ? ' warn' : ''); t.textContent = st.get().savedAt ? 'محفوظ في المتصفح — اربط الفولدر' : 'مفيش تعديلات'; }
}
$('pSave').onclick = () => st.link().then(savePill);
st.on(w => {
  savePill();
  if (w === 'remote') { const cur = S && S.id; slides = C6.mergeEdits(C6.deck, st.get()); const i = slides.findIndex(s => s.id === cur); if (!editing && !drag) { si = i >= 0 ? i : si; S = clone(slides[si]); delete S.hidden; drawCanvas(); drawProps(); } drawStrip(); }
});
if (C6.bc) C6.bc.addEventListener('message', ev => { const d = ev.data || {}; if (d.type === 'edit-open' && d.sid) { const i = slides.findIndex(s => s.id === d.sid); if (i >= 0 && (!S || S.id !== d.sid)) loadSlide(i); } });
st.restore().then(savePill);

/* ───────────── start */
let start = 0;
const want = Q.get('sid') || (() => { try { return localStorage.getItem('c6-edit-sid'); } catch (e) { return null; } })();
if (want) { const i = slides.findIndex(s => s.id === want); if (i >= 0) start = i; }
C6.loadFonts(slides).then(() => { drawStrip(); loadSlide(start); savePill(); document.body.dataset.ready = 1; });
window.C6ed = { get S() { return S; }, get sel() { return sel; }, loadSlide, select: ids => { sel = ids; drawSel(); drawProps(); } };
})();
