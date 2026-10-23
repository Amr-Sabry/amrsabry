/* C6 · «الجلسة الختامية V6» — the layer renderer shared by the show, the control, the editor and the presenter screen.
   The deck (src/c6/deck.js → window.C6_DECK) is the client's V6.pptx converted shape by shape (conv.py, 22 Oct 2026):
   every shape is a layer {id,t,x,y,w,h,...} on a 1920×1080 stage. Edits (src/c6/edits.js + localStorage) replace whole
   slides, so the original stays untouched and «رجوع للأصل» is one click. */
(function () {
'use strict';
const C6 = window.C6 = window.C6 || {};
C6.W = 1920; C6.H = 1080;
C6.base = C6.base || '';

/* ───────────── fonts: the client's faces → web fonts with the client's line metrics (PowerPoint/Windows win metrics) */
const AR = 'U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0897-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC';
const LA = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const GLYPH = { // family -> weights available
  Cairo: [200, 300, 400, 500, 600, 700, 800, 900], Tajawal: [200, 300, 400, 500, 700, 800, 900], Noto: [400, 500, 600, 700], Open: [300, 400, 600, 700]
};
/* PowerPoint's single line = 1.212 × the size for every face (measured on the deck's auto-fit boxes); the face's own
   ascent : descent ratio only decides where the baseline sits inside that line */
const LH = 1.212;
const M = { cairo: [1.312, .571], taj3: [.972, .375], taj4: [1.016, .375], taj7: [1.065, .411], segoe: [1.079, .251], arial: [.905, .212], times: [.891, .216], calibri: [.952, .269], open: [1.124, .318] };
function faceOf(name, bold) {
  const k = (name || '').trim().toLowerCase();
  let fam = 'Cairo', w = 500, m = 'cairo';
  const W = { black: 900, extrabold: 800, bold: 700, semibold: 600, medium: 500, light: 300, extralight: 200, thin: 200, regular: 400 };
  const wt = s => { for (const x in W) if (s.endsWith(' ' + x)) return W[x]; return null; };
  if (k.startsWith('cairo')) { fam = 'Cairo'; w = wt(k) || 400; }
  else if (k.startsWith('tajawal')) { fam = 'Tajawal'; w = wt(k) || 400; m = w <= 300 ? 'taj3' : w < 700 ? 'taj4' : 'taj7'; }
  /* until the client's own files arrive: Tajawal stands in for 29LT Adir and beIN — the same geometric build, and its figures
     are ~9% narrower than Cairo's, closer to Adir's, so the big numbers keep to their boxes */
  else if (k.startsWith('29lt adir')) { fam = 'Tajawal'; w = wt(k) || 500; m = w < 700 ? 'taj4' : 'taj7'; }
  else if (k.startsWith('bein')) { fam = 'Tajawal'; w = 900; m = 'taj7'; }
  else if (k.startsWith('segoe ui')) { fam = 'Cairo'; w = wt(k) || 400; m = 'segoe'; }
  else if (k.startsWith('hacen')) { fam = 'Tajawal'; w = 700; m = 'taj7'; }
  else if (k.startsWith('open sans')) { fam = 'Open'; w = wt(k) || 400; m = 'open'; }
  else if (k.startsWith('arial')) { fam = 'Noto'; w = 400; m = 'arial'; }
  else if (k.startsWith('times')) { fam = 'Noto'; w = 400; m = 'times'; }
  else if (k.startsWith('calibri')) { fam = 'Open'; w = k.includes('light') ? 300 : 400; m = 'calibri'; }
  else if (k.startsWith('montserrat')) { fam = 'Cairo'; w = wt(k) || 600; }
  if (bold) w = Math.max(w, 700);
  const av = GLYPH[fam]; w = av.reduce((a, b) => Math.abs(b - w) < Math.abs(a - w) ? b : a, av[0]);
  return { fam, w, m, key: fam + w + m, lh: LH };
}
const faceDone = new Set(); let faceCss = null;
/* Amr's own font files (22 Oct, 03:11) come first: Cairo v2.010 (+ Medium v3.130) and Tajawal 1.700 as installed for the deck */
const OWN = { Cairo: [200, 300, 400, 500, 600, 700, 900], Tajawal: [200, 300, 400, 800, 900], Almarai: [300, 400, 700, 800] };
function faceSrc(fam, w, sub) {
  const b = C6.base + 'fonts/c6/';
  if (OWN[fam] && OWN[fam].includes(w)) return `url(${b}u/${fam.toLowerCase()}-${w}.woff2)`;
  if (fam === 'Cairo') return `url(${b}cairo-${sub}-${w}.woff2)`;
  if (fam === 'Tajawal') return `url(${b}tajawal-${sub}-${w}.woff2)`;
  if (fam === 'Noto') return sub === 'ar' ? `url(${b}noto-ar-${w}.woff2)` : `local('Arial'),local('ArialMT'),url(${b}opensans-la-${w >= 600 ? 700 : 400}.woff2)`;
  if (fam === 'Open') return sub === 'la' ? `url(${b}opensans-la-${w}.woff2)` : `url(${b}cairo-ar-${Math.min(900, Math.max(400, w))}.woff2)`;
}
function ensureFace(f) {
  if (faceDone.has(f.key)) return;
  faceDone.add(f.key);
  if (!faceCss) { faceCss = document.createElement('style'); faceCss.id = 'c6-faces'; document.head.appendChild(faceCss); }
  const [a0, d0] = M[f.m]; const a = LH * a0 / (a0 + d0), d = LH * d0 / (a0 + d0);
  const ov = `ascent-override:${(a * 100).toFixed(1)}%;descent-override:${(d * 100).toFixed(1)}%;line-gap-override:0%;font-display:block`;
  const rules = [
    `@font-face{font-family:"c6-${f.key}";src:${faceSrc(f.fam, f.w, 'ar')};unicode-range:${AR};${ov}}`,
    `@font-face{font-family:"c6-${f.key}";src:${faceSrc(f.fam, f.w, 'la')};unicode-range:${LA};${ov}}`,
    `@font-face{font-family:"c6a-${f.key}";src:${faceSrc(f.fam, f.w, 'ar')};unicode-range:${AR};${ov}}`];
  faceCss.textContent += rules.join('\n') + '\n';
}
C6.faceOf = faceOf;
const AR_RE = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/;

/* ───────────── small helpers */
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const r2 = v => Math.round(v * 100) / 100;
function cssFill(f, w, h) {
  if (!f || f === 'none') return 'transparent';
  if (f.c) return f.c;
  if (f.g === 'lin') return `linear-gradient(${r2((f.ang || 0) + 90)}deg,${f.stops.map(s => s[1] + ' ' + s[0] + '%').join(',')})`;
  if (f.g === 'rad') return `radial-gradient(${f.path === 'rect' ? 'farthest-side' : 'farthest-corner'} at 50% 50%,${f.stops.map(s => s[1] + ' ' + s[0] + '%').join(',')})`;
  return 'transparent';
}
C6.cssFill = cssFill;
let gradN = 0;
function svgPaint(f, defs) {
  if (!f || f === 'none') return 'none';
  if (f.c) return f.c;
  if (f.stops) {
    const id = 'c6g' + (++gradN);
    if (f.g === 'lin') {
      const a = (f.ang || 0) * Math.PI / 180, x = Math.cos(a), y = Math.sin(a);
      defs.push(`<linearGradient id="${id}" x1="${r2(.5 - x / 2)}" y1="${r2(.5 - y / 2)}" x2="${r2(.5 + x / 2)}" y2="${r2(.5 + y / 2)}">${f.stops.map(s => `<stop offset="${s[0]}%" stop-color="${s[1]}"/>`).join('')}</linearGradient>`);
    } else defs.push(`<radialGradient id="${id}">${f.stops.map(s => `<stop offset="${s[0]}%" stop-color="${s[1]}"/>`).join('')}</radialGradient>`);
    return `url(#${id})`;
  }
  return 'none';
}
const DASH = { dash: [4, 3], sysDash: [3, 1], dot: [1, 1], sysDot: [1, 1], lgDash: [8, 3], dashDot: [4, 3, 1, 3], lgDashDot: [8, 3, 1, 3], lgDashDotDot: [8, 3, 1, 3, 1, 3], sysDashDot: [3, 1, 1, 1], sysDashDotDot: [3, 1, 1, 1, 1, 1] };
const dashOf = (ln) => ln.dash && DASH[ln.dash] ? DASH[ln.dash].map(v => r2(v * Math.max(1, ln.w))).join(' ') : '';

/* ───────────── preset geometry → SVG path (so a resized shape keeps its true form) */
function A(adj, k, d) { return adj && adj[k] != null ? adj[k] : d; }
function preset(p, w, h, adj) {
  const m = Math.min(w, h), R = (x, y) => r2(x) + ' ' + r2(y);
  switch (p) {
    case 'roundRect': { const r = Math.min(m / 2, m * A(adj, 'adj', 16667) / 1e5); return `M${R(r, 0)}H${r2(w - r)}A${r2(r)} ${r2(r)} 0 0 1 ${R(w, r)}V${r2(h - r)}A${r2(r)} ${r2(r)} 0 0 1 ${R(w - r, h)}H${r2(r)}A${r2(r)} ${r2(r)} 0 0 1 ${R(0, h - r)}V${r2(r)}A${r2(r)} ${r2(r)} 0 0 1 ${R(r, 0)}Z`; }
    case 'round2SameRect': { const a = Math.min(m / 2, m * A(adj, 'adj1', 16667) / 1e5), b = Math.min(m / 2, m * A(adj, 'adj2', 0) / 1e5); return `M${R(a, 0)}H${r2(w - a)}A${a} ${a} 0 0 1 ${R(w, a)}V${r2(h - b)}A${b} ${b} 0 0 1 ${R(w - b, h)}H${r2(b)}A${b} ${b} 0 0 1 ${R(0, h - b)}V${r2(a)}A${a} ${a} 0 0 1 ${R(a, 0)}Z`; }
    case 'round1Rect': { const a = Math.min(m / 2, m * A(adj, 'adj', 16667) / 1e5); return `M0 0H${r2(w - a)}A${a} ${a} 0 0 1 ${R(w, a)}V${r2(h)}H0Z`; }
    case 'snip1Rect': { const a = m * A(adj, 'adj', 16667) / 1e5; return `M0 0H${r2(w - a)}L${R(w, a)}V${r2(h)}H0Z`; }
    case 'ellipse': return `M0 ${r2(h / 2)}A${r2(w / 2)} ${r2(h / 2)} 0 1 1 ${R(w, h / 2)}A${r2(w / 2)} ${r2(h / 2)} 0 1 1 0 ${r2(h / 2)}Z`;
    case 'triangle': { const x = w * A(adj, 'adj', 50000) / 1e5; return `M${R(x, 0)}L${R(w, h)}L${R(0, h)}Z`; }
    case 'rtTriangle': return `M0 0L${R(w, h)}L0 ${r2(h)}Z`;
    case 'diamond': return `M${R(w / 2, 0)}L${R(w, h / 2)}L${R(w / 2, h)}L${R(0, h / 2)}Z`;
    case 'parallelogram': { const x = m * A(adj, 'adj', 25000) / 1e5; return `M${R(x, 0)}L${R(w, 0)}L${R(w - x, h)}L${R(0, h)}Z`; }
    case 'trapezoid': { const x = m * A(adj, 'adj', 25000) / 1e5; return `M${R(x, 0)}L${R(w - x, 0)}L${R(w, h)}L${R(0, h)}Z`; }
    case 'hexagon': { const x = m * A(adj, 'adj', 25000) / 1e5; return `M0 ${r2(h / 2)}L${R(x, 0)}L${R(w - x, 0)}L${R(w, h / 2)}L${R(w - x, h)}L${R(x, h)}Z`; }
    case 'octagon': { const x = m * A(adj, 'adj', 29289) / 1e5; return `M${R(x, 0)}L${R(w - x, 0)}L${R(w, x)}L${R(w, h - x)}L${R(w - x, h)}L${R(x, h)}L${R(0, h - x)}L${R(0, x)}Z`; }
    case 'chevron': { const x = m * A(adj, 'adj', 50000) / 1e5; return `M0 0L${R(w - x, 0)}L${R(w, h / 2)}L${R(w - x, h)}L${R(0, h)}L${R(x, h / 2)}Z`; }
    case 'homePlate': { const x = m * A(adj, 'adj', 50000) / 1e5; return `M0 0L${R(w - x, 0)}L${R(w, h / 2)}L${R(w - x, h)}L${R(0, h)}Z`; }
    case 'rightArrow': { const a1 = A(adj, 'adj1', 50000) / 1e5, a2 = m * A(adj, 'adj2', 50000) / 1e5, y1 = h / 2 - h * a1 / 2, y2 = h / 2 + h * a1 / 2; return `M0 ${r2(y1)}L${R(w - a2, y1)}L${R(w - a2, 0)}L${R(w, h / 2)}L${R(w - a2, h)}L${R(w - a2, y2)}L0 ${r2(y2)}Z`; }
    case 'leftArrow': { const a1 = A(adj, 'adj1', 50000) / 1e5, a2 = m * A(adj, 'adj2', 50000) / 1e5, y1 = h / 2 - h * a1 / 2, y2 = h / 2 + h * a1 / 2; return `M${R(w, y1)}L${R(a2, y1)}L${R(a2, 0)}L0 ${r2(h / 2)}L${R(a2, h)}L${R(a2, y2)}L${R(w, y2)}Z`; }
    case 'downArrow': { const a1 = A(adj, 'adj1', 50000) / 1e5, a2 = m * A(adj, 'adj2', 50000) / 1e5, x1 = w / 2 - w * a1 / 2, x2 = w / 2 + w * a1 / 2; return `M${R(x1, 0)}L${R(x2, 0)}L${R(x2, h - a2)}L${R(w, h - a2)}L${R(w / 2, h)}L${R(0, h - a2)}L${R(x1, h - a2)}Z`; }
    case 'upArrow': { const a1 = A(adj, 'adj1', 50000) / 1e5, a2 = m * A(adj, 'adj2', 50000) / 1e5, x1 = w / 2 - w * a1 / 2, x2 = w / 2 + w * a1 / 2; return `M${R(x1, h)}L${R(x2, h)}L${R(x2, a2)}L${R(w, a2)}L${R(w / 2, 0)}L${R(0, a2)}L${R(x1, a2)}Z`; }
    case 'leftBracket': { const y = m * A(adj, 'adj', 8333) / 1e5; return `M${R(w, 0)}Q0 0 0 ${r2(y)}V${r2(h - y)}Q0 ${r2(h)} ${R(w, h)}`; }
    case 'rightBracket': { const y = m * A(adj, 'adj', 8333) / 1e5; return `M0 0Q${R(w, 0)} ${R(w, y)}V${r2(h - y)}Q${R(w, h)} 0 ${r2(h)}`; }
    case 'leftBrace': return `M${R(w, 0)}Q${R(w / 2, 0)} ${R(w / 2, h / 4)}Q${R(w / 2, h / 2)} 0 ${r2(h / 2)}Q${R(w / 2, h / 2)} ${R(w / 2, 3 * h / 4)}Q${R(w / 2, h)} ${R(w, h)}`;
    case 'pie': case 'arc': case 'blockArc': case 'chord': {
      const s = A(adj, 'adj1', p === 'pie' ? 0 : 16200000) / 60000 * Math.PI / 180, e = A(adj, 'adj2', p === 'pie' ? 16200000 : 0) / 60000 * Math.PI / 180;
      const rx = w / 2, ry = h / 2, cx = rx, cy = ry; let sw = e - s; if (sw <= 0) sw += 2 * Math.PI;
      const x1 = cx + rx * Math.cos(s), y1 = cy + ry * Math.sin(s), x2 = cx + rx * Math.cos(s + sw), y2 = cy + ry * Math.sin(s + sw);
      const arc = `A${r2(rx)} ${r2(ry)} 0 ${sw > Math.PI ? 1 : 0} 1 ${R(x2, y2)}`;
      if (p === 'pie') return `M${R(cx, cy)}L${R(x1, y1)}${arc}Z`;
      if (p === 'chord') return `M${R(x1, y1)}${arc}Z`;
      return `M${R(x1, y1)}${arc}`;
    }
    case 'star4': case 'star5': case 'star6': case 'star7': case 'star8': case 'star10': case 'star12': case 'star16': case 'star24': case 'star32': {
      const n = +p.slice(4), ri = A(adj, 'adj', { 4: 12500, 5: 19098, 6: 28868, 7: 34601, 8: 37500, 10: 42533, 12: 37500 }[n] || 38250) / 50000;
      let d = ''; for (let i = 0; i < 2 * n; i++) { const a = -Math.PI / 2 + i * Math.PI / n, r = i % 2 ? ri : 1; d += (i ? 'L' : 'M') + R(w / 2 + w / 2 * r * Math.cos(a), h / 2 + h / 2 * r * Math.sin(a)); } return d + 'Z';
    }
    case 'halfFrame': { const t1 = m * A(adj, 'adj1', 33333) / 1e5, t2 = m * A(adj, 'adj2', 33333) / 1e5; return `M0 0H${r2(w)}L${R(w - t1, t1)}H${r2(t2)}V${r2(h - t2)}L0 ${r2(h)}Z`; }
    case 'plus': { const x = m * A(adj, 'adj', 25000) / 1e5; return `M${R(x, 0)}H${r2(w - x)}V${r2(x)}H${r2(w)}V${r2(h - x)}H${r2(w - x)}V${r2(h)}H${r2(x)}V${r2(h - x)}H0V${r2(x)}H${r2(x)}Z`; }
    case 'flowChartTerminator': { const r = h / 2; return `M${R(r, 0)}H${r2(w - r)}A${r2(r)} ${r2(r)} 0 0 1 ${R(w - r, h)}H${r2(r)}A${r2(r)} ${r2(r)} 0 0 1 ${R(r, 0)}Z`; }
    default: return `M0 0H${r2(w)}V${r2(h)}H0Z`;
  }
}
C6.preset = preset;
const OPEN = new Set(['arc', 'leftBracket', 'rightBracket', 'leftBrace']);

/* ───────────── text */
function spanCss(r, para) {
  const ar = AR_RE.test(r.t);
  const fc = faceOf(r.fc, r.b), fl = faceOf(r.fl, r.b);
  ensureFace(fc); ensureFace(fl);
  const main = ar ? fc : fl;
  let s = `font-family:"c6a-${fc.key}","c6-${fl.key}","c6-${fc.key}",sans-serif;font-size:${r.sz}px;`;
  if (para.lhpt) s += `line-height:${para.lhpt}px;`; else s += `line-height:${r2((para.lh || 1) * main.lh * 1.0)};`;
  if (r.i) s += 'font-style:italic;';
  if (r.c && !r.grad) s += `color:${r.c};`;
  if (r.grad) s += `background:${cssFill(r.grad)};-webkit-background-clip:text;background-clip:text;color:transparent;`;
  if (r.nofill) s += 'color:transparent;';
  if (r.patt) { const [p, fg, bg] = r.patt; const k = /horz|Brick/i.test(p) ? '0deg' : /vert/i.test(p) ? '90deg' : '45deg';
    s += `background:repeating-linear-gradient(${k},${fg} 0 3px,${bg} 3px 5px);-webkit-background-clip:text;background-clip:text;color:transparent;`; }
  const dec = [r.u ? 'underline' : '', r.s ? 'line-through' : ''].filter(Boolean).join(' ');
  if (dec) s += `text-decoration:${dec};`;
  if (r.cap) s += 'text-transform:uppercase;';
  if (r.spc && !ar) s += `letter-spacing:${r.spc}px;`;
  if (r.bl) s += `vertical-align:${r2(r.bl / 100)}em;font-size:${r2(r.sz * (Math.abs(r.bl) >= 25 ? .66 : 1))}px;`;
  if (r.hl) s += `background-color:${r.hl};`;
  if (r.ol) s += `-webkit-text-stroke:${r.ol[0]}px ${r.ol[1]};paint-order:stroke fill;`;
  const sh = [];
  if (r.tsh) sh.push(`${r.tsh[0]}px ${r.tsh[1]}px ${r.tsh[2]}px ${r.tsh[3]}`);
  if (r.tglow) sh.push(`0 0 ${r.tglow[0]}px ${r.tglow[1]}`, `0 0 ${r2(r.tglow[0] / 2)}px ${r.tglow[1]}`);
  if (sh.length) s += `text-shadow:${sh.join(',')};`;
  return { s, lh: main.lh };
}
function textEl(T, L, ctx) {
  const box = document.createElement('div'); box.className = 'c6t';
  const ins = T.ins || [14.4, 7.2, 14.4, 7.2];
  let st = `padding:${ins[1]}px ${ins[2]}px ${ins[3]}px ${ins[0]}px;justify-content:${T.anchor === 'ctr' ? 'center' : T.anchor === 'b' ? 'flex-end' : 'flex-start'};`;
  if (T.cols) st += `display:block;column-count:${T.cols};column-gap:${T.colgap || 0}px;`;
  if (T.vert) st += (T.vert === 'vert270' ? 'writing-mode:vertical-rl;transform:rotate(180deg);' : 'writing-mode:vertical-rl;');
  box.style.cssText = st;
  const paras = T.paras || []; let num = {};
  paras.forEach((P, pi) => {
    const p = document.createElement('div'); p.className = 'c6p'; p.dataset.pi = pi;
    const rtl = !!P.rtl;
    p.dir = rtl ? 'rtl' : 'ltr';
    /* Arabic «justify» (Amr 22 Oct 15:07): PowerPoint justifies Arabic with kashida, the browser only widens the spaces, which leaves
       broken gaps in the words' line. An RTL justified paragraph is set flush right instead: natural spacing, same line breaks. */
    const al = (P.al === 'justify' || P.al === 'dist') && rtl ? 'right' : P.al;
    let ps = `text-align:${al || (rtl ? 'right' : 'left')};`;
    const first = P.runs.find(r => r.t && r.t !== '\n') || P.runs[0] || { sz: 36 };
    const fsz = first.sz || 36; const fface = faceOf(AR_RE.test(first.t || '') ? first.fc : first.fl, first.b);
    const lineH = P.lhpt || (P.lh || 1) * fface.lh * fsz;
    const sp = (v) => !v ? 0 : v[0] === 'pt' ? v[1] : v[1] * fface.lh * fsz;
    if (P.sb && pi > 0) ps += `margin-top:${r2(sp(P.sb))}px;`;
    if (P.sa) ps += `margin-bottom:${r2(sp(P.sa))}px;`;
    if (P.ml) ps += `padding-${rtl ? 'right' : 'left'}:${P.ml}px;`;
    if (P.mr) ps += `padding-${rtl ? 'left' : 'right'}:${P.mr}px;`;
    if (P.ind) ps += `text-indent:${P.ind}px;`;
    /* a paragraph with no letters at all («35%+», «15- 20») takes the paragraph's own direction as PowerPoint does — plaintext would make it LTR */
    if (rtl && !/[A-Za-z\u0600-\u06FF]/.test(P.runs.map(r => r.t || '').join(''))) ps += 'unicode-bidi:normal;';
    if (T.nowrap) ps += `white-space:pre;width:max-content;align-self:${(P.al === 'center') ? 'center' : ((P.al === 'right') ? 'flex-end' : 'flex-start')};`;
    p.style.cssText = ps;
    // bullet
    if (P.bu && P.runs.some(r => r.t && r.t.trim())) {
      const b = document.createElement('span'); b.className = 'c6bu';
      let ch = P.bu.ch;
      if (P.bu.num) { const k = P.bu.num; num[k] = (num[k] || (P.bu.at || 1) - 1) + 1; ch = k.startsWith('arabic') ? num[k] + (k.includes('Period') ? '.' : k.includes('ParenR') ? ')' : '.') : num[k] + '.'; }
      const bf = /wingdings/i.test(P.bu.f || '') ? { '§': '■', 'Ø': '➢', 'ü': '✓', 'q': '❑', 'v': '❖', 'n': '■', 'l': '●', 'ð': '➔' }[ch] || '•' : ch;
      const css = spanCss({ ...first, t: '' }, P);
      b.textContent = bf || '•';
      b.style.cssText = css.s + (P.bu.c ? `color:${P.bu.c};` : '') + (P.bu.sz ? `font-size:${r2(first.sz * P.bu.sz)}px;` : '') + `display:inline-block;min-width:${Math.max(0, -(P.ind || 0))}px;text-indent:0;`;
      p.appendChild(b);
    } else num = {};
    P.runs.forEach((r, ri) => {
      if (r.t === '\n') { p.appendChild(document.createElement('br')); return; }
      const s = document.createElement('span'); s.dataset.ri = ri;
      let t = r.t;
      if (r.fld === 'slidenum') t = String(ctx.num || '');
      const css = spanCss(r, P); s.style.cssText = css.s;
      if (!t) { s.textContent = '​'; s.className = 'c6e'; }
      else s.textContent = t;
      p.appendChild(s);
    });
    box.appendChild(p);
  });
  return box;
}

/* ───────────── charts (the client's bar / column charts, drawn from their own numbers) */
function fmtNum(v, f) {
  if (v == null) return '';
  if (f && f.includes('%')) { const d = (f.split('.')[1] || '').replace(/[^0]/g, '').length; return (v * 100).toFixed(d) + '%'; }
  const d = f && f.includes('.') ? (f.split('.')[1] || '').replace(/[^0#]/g, '').length : (Math.abs(v) < 10 && v % 1 ? 1 : 0);
  return (+v).toFixed(Math.min(2, d));
}
function chartEl(L) {
  const ch = L.chart; const w = L.w, h = L.h;
  const wrap = document.createElement('div'); wrap.className = 'c6chart';
  if (!ch || !ch.plots || !ch.plots.length) return wrap;
  const pl = ch.plots[0]; const ser = pl.series; const cats = (ser[0] && ser[0].cats) || [];
  const n = Math.max(...ser.map(s => s.vals.length), cats.length, 1);
  const horiz = pl.dir === 'bar'; const stacked = pl.grp === 'stacked' || pl.grp === 'percentStacked';
  const cax = (ch.axes || []).find(a => a.t === 'catAx') || {}; const vax = (ch.axes || []).find(a => a.t === 'valAx') || {};
  const lsz = (ser[0] && ser[0].lsz) || 18, asz = cax.sz || 16;
  /* category labels that do not fit their column («2026/2027» under four narrow columns) go on two lines, split at «/» — PowerPoint turns them instead */
  const two = !horiz && !cax.del && cats.some(c => String(c || '').includes('/')) && Math.max(...cats.map(c => String(c || '').length)) * asz * .56 > w / n * .95;
  const padCat = cax.del ? 4 : asz * (two ? 2.9 : 1.9);
  const totals = []; for (let i = 0; i < n; i++) totals.push(stacked ? ser.reduce((a, s) => a + (s.vals[i] || 0), 0) : Math.max(...ser.map(s => s.vals[i] || 0)));
  const vmax = vax.max != null ? vax.max : Math.max(...totals, 0) * (stacked ? 1 : 1.18) || 1;
  const vmin = vax.min != null ? vax.min : 0;
  const defs = []; let body = '';
  const g = (pl.gap || 150) / 100;
  const rev = cax.rev;
  if (!horiz) {
    const ph = h - padCat - lsz * 1.4, pw = w; const slot = pw / n, bw = stacked ? slot / (1 + g) : slot / (1 + g) / ser.length;
    for (let i = 0; i < n; i++) {
      const ii = rev ? n - 1 - i : i; let acc = 0; const x0 = ii * slot + (slot - (stacked ? bw : bw * ser.length)) / 2;
      ser.forEach((s, si) => {
        const v = s.vals[i] || 0; const bh = Math.max(0, (v - (stacked ? 0 : vmin)) / (vmax - vmin) * ph);
        const x = stacked ? x0 : x0 + si * bw; const y = lsz * 1.4 + ph - bh - (stacked ? acc : 0);
        const col = (s.pts && s.pts[i]) || (s.grad ? svgPaint(s.grad, defs) : s.c) || '#888';
        body += `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(bw)}" height="${r2(bh)}" fill="${col}"/>`;
        if (s.lbl) {
          const ly = stacked ? y + bh / 2 + lsz * .35 : y - lsz * .35;
          body += `<text x="${r2(x + bw / 2)}" y="${r2(ly)}" text-anchor="middle" font-size="${lsz}" fill="${s.lc || '#333'}" font-weight="${s.lb ? 800 : 600}">${esc(fmtNum(v, s.fmt))}</text>`;
        }
        acc += bh;
      });
      if (!cax.del) { const cx = r2(ii * slot + slot / 2), lab = String(cats[i] || '');
        if (two && lab.includes('/')) { const [l1, l2] = [lab.slice(0, lab.indexOf('/') + 1), lab.slice(lab.indexOf('/') + 1)];
          body += `<text x="${cx}" y="${r2(h - asz * 1.55)}" text-anchor="middle" font-size="${asz}" fill="${cax.c || '#555'}"><tspan x="${cx}">${esc(l1)}</tspan><tspan x="${cx}" dy="${r2(asz * 1.1)}">${esc(l2)}</tspan></text>`; }
        else body += `<text x="${cx}" y="${r2(h - asz * .5)}" text-anchor="middle" font-size="${asz}" fill="${cax.c || '#555'}">${esc(lab)}</text>`; }
    }
  } else {
    const pw = w - (cax.del ? 4 : asz * 6) - lsz * 3.5, ph = h; const slot = ph / n, bh = stacked ? slot / (1 + g) : slot / (1 + g) / ser.length;
    const xs = cax.del ? 4 : asz * 6;
    for (let i = 0; i < n; i++) {
      const ii = rev ? i : n - 1 - i; let acc = 0; const y0 = ii * slot + (slot - (stacked ? bh : bh * ser.length)) / 2;
      ser.forEach((s, si) => {
        const v = s.vals[i] || 0; const bw = Math.max(0, (v - (stacked ? 0 : vmin)) / (vmax - vmin) * pw);
        const y = stacked ? y0 : y0 + si * bh; const x = xs + (stacked ? acc : 0);
        const col = (s.pts && s.pts[i]) || (s.grad ? svgPaint(s.grad, defs) : s.c) || '#888';
        body += `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(bw)}" height="${r2(bh)}" fill="${col}"/>`;
        if (s.lbl) body += `<text x="${r2(x + bw + lsz * .3)}" y="${r2(y + bh / 2 + lsz * .35)}" font-size="${lsz}" fill="${s.lc || '#333'}" font-weight="${s.lb ? 800 : 600}">${esc(fmtNum(v, s.fmt))}</text>`;
        acc += bw;
      });
      if (!cax.del) body += `<text x="${r2(xs - asz * .4)}" y="${r2(ii * slot + slot / 2 + asz * .35)}" text-anchor="end" font-size="${asz}" fill="${cax.c || '#555'}">${esc(cats[i] || '')}</text>`;
    }
  }
  const f = faceOf('Cairo SemiBold'); ensureFace(f);
  wrap.innerHTML = `<svg viewBox="0 0 ${r2(w)} ${r2(h)}" width="100%" height="100%" style="overflow:visible;font-family:'c6-${f.key}'"><defs>${defs.join('')}</defs>${body}</svg>`;
  return wrap;
}

/* ───────────── a target figure in the keynote's own language (Amr 03:36: the client's white box in the middle of the keynote
   slide «كيف نزيد رقعتنا الزراعية» overlapped it): no white card — the keynote's ground, a dashed gold frame (a target is
   not yet reached, so its frame is drawn, not filled), the label, the figure counting up in the keynote's figures, its unit and
   the year chip. It comes in after the keynote has revealed its bars (delay, s). */
function targetEl(L, ctx) {
  const w = L.w, h = L.h, d = L.delay == null ? 3.4 : L.delay;
  const box = document.createElement('div'); box.className = 'c6tg' + (ctx.live ? ' play' : '');
  box.style.setProperty('--d', d + 's');
  const fl = faceOf('Cairo Bold'), fb = faceOf('Cairo Black'); ensureFace(fl); ensureFace(fb);
  box.innerHTML = `<svg class="c6tg-f" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="28" pathLength="100"/></svg>
    <div class="c6tg-k" style="font-family:'c6-${fl.key}'"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>${esc(L.label || 'المستهدف')}</div>
    <div class="c6tg-v" data-v="${esc(L.v || '')}">${esc(L.v || '')}</div>
    <div class="c6tg-u" style="font-family:'c6-${fl.key}'">${esc(L.u || '')}</div>
    ${L.yr ? `<div class="c6tg-y">${esc(L.yr)}</div>` : ''}`;
  return box;
}
C6.play = function (root) {   /* live parts of a slide that move on their own: target figures count up */
  root.querySelectorAll('.c6tg.play .c6tg-v').forEach(n => {
    const t = n.dataset.v, m = /^([\d.,]+)(.*)$/.exec(t); if (!m) return;
    const end = parseFloat(m[1].replace(/,/g, '')), dec = (m[1].split('.')[1] || '').length, d = parseFloat(getComputedStyle(n.closest('.c6tg')).getPropertyValue('--d')) || 0;
    n.textContent = (0).toFixed(dec) + m[2];
    setTimeout(() => { const t0 = performance.now(), D = 1100; const f = now => { const k = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - k, 3); n.textContent = (end * e).toFixed(dec) + m[2]; if (k < 1 && n.isConnected) requestAnimationFrame(f); }; requestAnimationFrame(f); }, (d + .25) * 1000);
  });
};

/* ───────────── one layer */
function imgPath(src, ctx) {
  if (!src) return '';
  if (/^(data:|blob:|https?:)/.test(src)) return src;
  if (ctx.thumb && /^img\/c6\/[^/]+\.webp$/.test(src)) return C6.base + src.replace('img/c6/', 'img/c6/t/');
  return C6.base + src;
}
C6.imgPath = imgPath;
function cropImg(img, crop, w, h) {
  const [l, t, r, b] = crop || [0, 0, 0, 0];
  const fw = w / Math.max(.0001, 1 - l - r), fh = h / Math.max(.0001, 1 - t - b);
  img.style.cssText += `position:absolute;right:auto;bottom:auto;left:${r2(-l * fw)}px;top:${r2(-t * fh)}px;width:${r2(fw)}px;height:${r2(fh)}px;max-width:none;`;
}
function shadowCss(L, rectish) {
  if (!L.sh) return '';
  const [dx, dy, b, c] = L.sh;
  return rectish ? `box-shadow:${dx}px ${dy}px ${b}px ${c};` : `filter:drop-shadow(${dx}px ${dy}px ${r2(b / 2)}px ${c});`;
}
function flipT(L) { return (L.fh || L.fv) ? `transform:scale(${L.fh ? -1 : 1},${L.fv ? -1 : 1});` : ''; }
function geomClip(L) {
  const g = L.geom; if (!g || g.p === 'rect') return '';
  if (g.p === 'ellipse') return 'border-radius:50%;';
  if (g.p === 'roundRect') { const r = Math.min(L.w, L.h) * A(g.adj, 'adj', 16667) / 1e5; return `border-radius:${r2(r)}px;`; }
  if (g.p === 'path') return `clip-path:path('${g.paths.map(p => p.d).join(' ')}');`;
  return `clip-path:path('${preset(g.p, L.w, L.h, g.adj)}');`;
}

function layerEl(L, ctx) {
  const el = document.createElement('div');
  el.className = 'c6l c6-' + L.t; el.dataset.id = L.id;
  let st = `left:${L.x}px;top:${L.y}px;width:${Math.max(L.w, .01)}px;height:${Math.max(L.h, .01)}px;`;
  if (L.rot) st += `transform:rotate(${L.rot}deg);`;
  if (L.op != null && L.t !== 'pic') st += `opacity:${L.op};`;
  if (L.hid) st += 'display:none;';
  const g = L.geom || { p: 'rect' };
  if (L.t === 'pic' || (L.t === 'video' && !(L.embed && !L.useVideo) && !((ctx.live && (L.kn || L.map) && !L.useVideo) || (ctx.liveMaps && L.map)) && (L.poster || (ctx.live && L.src)))) {
    const inner = document.createElement('div'); inner.className = 'c6clip';
    const rectish = !g.p || g.p === 'rect' || g.p === 'roundRect' || g.p === 'ellipse';
    let is = geomClip(L) + flipT(L);
    if (L.ln && rectish) is += `outline:${L.ln.w}px solid ${L.ln.c};outline-offset:-${r2(L.ln.w / 2)}px;`;
    inner.style.cssText = is;
    let fx = [];
    if (L.gray) fx.push('grayscale(1)');
    if (L.duo) fx.push('grayscale(1)');
    if (L.bright) fx.push(`brightness(${r2(1 + L.bright)})`);
    if (L.contrast) fx.push(`contrast(${r2(1 + L.contrast)})`);
    /* a hidden or zero-size video (the pptx keeps a 0×0 copy of some films) never plays — it would double the sound */
    if (L.t === 'video' && ctx.live && !L.hid && L.w > 2 && L.h > 2) {
      const v = document.createElement('video');
      v.muted = !!ctx.mute || !!L.mute; v.playsInline = true; v.preload = 'none';
      if (L.loop) v.loop = true;
      if (L.poster) v.poster = imgPath(L.poster, ctx);
      v.dataset.src = C6.base + (L.src || '');
      if (L.vol != null) v.dataset.vol = L.vol;
      cropImg(v, L.crop, L.w, L.h); v.style.objectFit = L.fit || 'fill';
      if (fx.length) v.style.filter = fx.join(' ');
      inner.appendChild(v);
    } else {
      const im = document.createElement('img'); im.decoding = 'async'; im.draggable = false; im.alt = '';
      if (ctx.lazy) im.loading = 'lazy';
      const src = L.t === 'video' ? L.poster : L.src;
      if (src) im.src = imgPath(src, ctx);
      cropImg(im, L.crop, L.w, L.h); if (L.fit) im.style.objectFit = L.fit;
      if (L.op != null) im.style.opacity = L.op;
      if (fx.length) im.style.filter = fx.join(' ');
      inner.appendChild(im);
      if (L.t === 'video') { const b = document.createElement('div'); b.className = 'c6vbadge'; b.textContent = L.kn ? 'كي نوت' : L.map ? 'خريطة' : '▶'; el.appendChild(b); }
    }
    st += shadowCss(L, rectish);
    el.style.cssText = st; el.appendChild(inner); return el;
  }
  if (L.embed && !L.useVideo) {   /* a page built as code (the opener «قبل البداية 2011–2014»), shown whole in its frame */
    el.style.cssText = st + geomClip(L) + 'overflow:hidden;background:#000;';
    if (L.poster) { const im = document.createElement('img'); im.src = imgPath(L.poster, ctx); im.className = 'c6embposter'; el.appendChild(im); }
    if (L.crop) { const p = el.querySelector('.c6embposter'); if (p) cropImg(p, L.crop, L.w, L.h); }
    if (ctx.live) { const f = document.createElement('iframe'); f.className = 'c6embed'; f.setAttribute('frameborder', '0'); f.allow = 'autoplay; fullscreen'; f.dataset.src = C6.base + L.embed; if (L.crop) cropImg(f, L.crop, L.w, L.h); el.appendChild(f); }
    else if (ctx.thumb) { const b = document.createElement('div'); b.className = 'c6vbadge'; b.textContent = 'كود'; el.appendChild(b); }
    return el;
  }
  const liveEmbed = (ctx.live && (L.kn || L.map) && !L.useVideo) || (ctx.liveMaps && L.map);
  if (L.t === 'video' && !liveEmbed && !L.poster && !(ctx.live && L.src)) {
    el.style.cssText = st + geomClip(L) + 'overflow:hidden;background:linear-gradient(135deg,#1b2a44,#38526b);display:grid;place-items:center;';
    el.innerHTML = `<div style="font:700 ${Math.max(14, Math.min(L.w, L.h) / 9)}px system-ui;color:#e8d6b8;text-align:center">${L.map ? '🗺️ خريطة' : L.kn ? 'سؤال كي نوت ' + L.kn : '▶ فيديو'}</div>`;
    return el;
  }
  if (L.t === 'video' && liveEmbed) {
    const f = document.createElement('iframe'); f.className = 'c6embed'; f.setAttribute('frameborder', '0'); f.allow = 'autoplay';
    f.dataset.src = C6.base + (L.kn ? `keynote.html?embed=1#${L.kn}` : C6.mapUrl(L.map));
    if (ctx.liveMaps && !ctx.live) { f.src = f.dataset.src; f.style.pointerEvents = 'none'; }
    if (L.crop) { cropImg(f, L.crop, L.w, L.h); const p = el.querySelector('.c6embposter'); if (p) cropImg(p, L.crop, L.w, L.h); }
    if (L.poster) { const im = document.createElement('img'); im.src = imgPath(L.poster, ctx); im.className = 'c6embposter'; el.appendChild(im); }
    el.style.cssText = st + geomClip(L) + 'overflow:hidden;'; el.appendChild(f); return el;
  }
  if (L.t === 'svg') {
    const sv = (C6.deck.svgs || {})[L.svg] || { w: L.w, h: L.h, body: '' };
    el.style.cssText = st;
    el.innerHTML = `<svg viewBox="0 0 ${sv.w} ${sv.h}" width="100%" height="100%" preserveAspectRatio="none" style="overflow:visible;display:block;${flipT(L)}">${sv.body}</svg>`;
    return el;
  }
  if (L.t === 'chart') { el.style.cssText = st; el.appendChild(chartEl(L)); return el; }
  if (L.t === 'target') { el.style.cssText = st; el.appendChild(targetEl(L, ctx)); return el; }
  if (L.t === 'line') {
    const ln = L.ln || { w: 1, c: '#000' };
    let [x1, y1, x2, y2] = [0, 0, L.w, L.h]; if (L.fh) [x1, x2] = [x2, x1]; if (L.fv) [y1, y2] = [y2, y1];
    const defs = []; let mk = '';
    ['h', 't'].forEach(k => {
      if (!ln[k]) return; const id = 'c6m' + (++gradN); const s = Math.max(3, ln.w * 3);
      defs.push(`<marker id="${id}" viewBox="0 0 10 10" refX="${k === 'h' ? 2 : 8}" refY="5" markerWidth="${s / ln.w}" markerHeight="${s / ln.w}" orient="auto-start-reverse"><path d="${ln[k] === 'oval' ? 'M5 1A4 4 0 1 1 5 9A4 4 0 1 1 5 1' : 'M0 0L10 5L0 10Z'}" fill="${ln.c}"/></marker>`);
      mk += k === 'h' ? ` marker-start="url(#${id})"` : ` marker-end="url(#${id})"`;
    });
    el.style.cssText = st + shadowCss(L, false);
    el.innerHTML = `<svg width="${Math.max(1, L.w)}" height="${Math.max(1, L.h)}" style="overflow:visible;display:block;position:absolute;left:0;top:0"><defs>${defs.join('')}</defs><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${ln.c}" stroke-width="${ln.w}" stroke-dasharray="${dashOf(ln)}" stroke-linecap="${ln.cap === 'rnd' ? 'round' : ln.cap === 'sq' ? 'square' : 'butt'}"${mk}/></svg>`;
    return el;
  }
  // shape
  const f = L.fill; const ln = L.ln;
  const simple = (g.p === 'rect' || g.p === 'roundRect' || g.p === 'ellipse') && !(f && f.img && f.crop);
  if (simple) {
    let vs = '';
    if (f && f.img) vs += `background:url("${imgPath(f.img, ctx)}") center/${f.tile ? 'auto' : '100% 100%'} ${f.tile ? 'repeat' : 'no-repeat'};${f.op != null ? 'opacity:' + f.op + ';' : ''}`;
    else if (f) vs += `background:${cssFill(f)};`;
    if (ln && ln.w) vs += `border:${ln.w}px ${ln.dash ? (ln.dash.includes('ot') ? 'dotted' : 'dashed') : 'solid'} ${ln.c};`;
    vs += geomClip(L);
    const bg = document.createElement('div'); bg.className = 'c6bg';
    bg.style.cssText = vs + (ln && ln.w ? `margin:-${r2(ln.w / 2)}px;` : '') + shadowCss(L, true) + (L.soft ? `filter:blur(${r2(L.soft / 3)}px);` : '') + (L.glow ? `box-shadow:0 0 ${L.glow[0]}px ${L.glow[1]};` : '');
    el.appendChild(bg);
  } else {
    const defs = []; let paths;
    if (g.p === 'path') paths = g.paths; else paths = [{ d: preset(g.p, L.w, L.h, g.adj), fill: !OPEN.has(g.p), stroke: true }];
    let fill = 'none';
    if (f && f.img) {
      const id = 'c6p' + (++gradN);
      defs.push(`<pattern id="${id}" patternUnits="userSpaceOnUse" width="${L.w}" height="${L.h}"><image href="${esc(imgPath(f.img, ctx))}" width="${L.w}" height="${L.h}" preserveAspectRatio="none"/></pattern>`);
      fill = `url(#${id})`;
    } else fill = svgPaint(f, defs);
    const vw = g.vw || L.w, vh = g.vh || L.h;
    const stroke = ln && ln.w ? `stroke="${ln.c}" stroke-width="${ln.w}" stroke-dasharray="${dashOf(ln)}" vector-effect="non-scaling-stroke"${ln.join === 'rnd' ? ' stroke-linejoin="round"' : ''}${ln.cap === 'rnd' ? ' stroke-linecap="round"' : ''}` : 'stroke="none"';
    const body = paths.map(p => `<path d="${p.d}" fill="${p.fill ? fill : 'none'}" ${p.stroke ? stroke : 'stroke="none"'}/>`).join('');
    const bg = document.createElement('div'); bg.className = 'c6bg';
    bg.style.cssText = shadowCss(L, false) + (L.glow ? `filter:drop-shadow(0 0 ${r2(L.glow[0] / 2)}px ${L.glow[1]});` : '');
    bg.innerHTML = `<svg viewBox="0 0 ${r2(vw)} ${r2(vh)}" width="100%" height="100%" preserveAspectRatio="none" style="overflow:visible;display:block;${flipT(L)}"><defs>${defs.join('')}</defs>${body}</svg>`;
    el.appendChild(bg);
  }
  if (L.text) {
    el.appendChild(textEl(L.text, L, ctx));
    const rs = L.text.paras.flatMap(p => p.runs.filter(r => r.t && r.t.trim()));
    if (rs.some(r => SUBST.test(AR_RE.test(r.t) ? r.fc : r.fl))) el.dataset.sub = 1;
    el.dataset.fs = Math.max(0, ...rs.map(r => r.sz || 0));
  }
  el.style.cssText = st;
  return el;
}
C6.layerEl = layerEl;
C6.mapUrl = m => `kmap.html?s=${m.s}${m.c != null ? '&c=' + m.c : ''}&ui=0${m.hide && m.hide.length ? '&hide=' + encodeURIComponent(m.hide.join('|')) : ''}${m.zf && m.zf !== 1 ? '&zf=' + m.zf : ''}${m.bg ? '&bg=' + m.bg : ''}`;

/* ───────────── a whole slide */
function slideBg(S) {
  const lay = (C6.deck.layouts || {})[S.layout] || {};
  return S.bg || lay.bg || { c: '#ffffff' };
}
C6.slideBg = slideBg;
C6.renderSlide = function (S, ctx) {
  ctx = ctx || {};
  const st = document.createElement('div'); st.className = 'c6s'; st.dataset.sid = S.id;
  const bg = slideBg(S);
  if (bg.img) st.style.background = `url("${imgPath(bg.img, ctx)}") center/100% 100% no-repeat`;
  else st.style.background = cssFill(bg);
  const lay = (C6.deck.layouts || {})[S.layout];
  if (lay && !S.nomaster && !S.nolayout) {
    const lw = document.createElement('div'); lw.className = 'c6lay';
    lay.layers.forEach(L => { if (S.hideLay && S.hideLay.includes(L.id)) return; lw.appendChild(layerEl(L, ctx)); });
    st.appendChild(lw);
  }
  (S.layers || []).forEach(L => st.appendChild(layerEl(L, ctx)));
  return st;
};

/* ───────────── deck + edits (edits replace whole slides; order / hidden / new slides live in the edits too) */
C6.mergeEdits = function (deck, E) {
  E = E || {};
  const base = deck.slides.map(s => s.id);
  const byId = {}; deck.slides.forEach(s => byId[s.id] = s);
  Object.keys(E.slides || {}).forEach(id => { byId[id] = E.slides[id]; });
  let order = (E.order && E.order.length) ? E.order.filter(id => byId[id]) : base.slice();
  Object.keys(E.slides || {}).forEach(id => { if (!order.includes(id) && !(E.del || []).includes(id)) order.push(id); });
  order = order.filter(id => !(E.del || []).includes(id));
  const hide = E.hide || {};
  return order.map(id => { const s = byId[id]; const h = id in hide ? !!hide[id] : !!s.hidden; return Object.assign({}, s, { hidden: h }); });
};
C6.CSS = `
.c6s{position:relative;width:1920px;height:1080px;overflow:hidden;direction:ltr;transform-origin:0 0;contain:layout paint}
.c6lay{position:absolute;inset:0;pointer-events:none}
.c6l{position:absolute;box-sizing:border-box;transform-origin:50% 50%}
.c6bg{position:absolute;inset:0;box-sizing:border-box}
.c6clip{position:absolute;inset:0;overflow:hidden}
.c6t{position:absolute;inset:0;display:flex;flex-direction:column;box-sizing:border-box;overflow:visible;font-kerning:normal;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
.c6p{margin:0;overflow-wrap:normal;word-break:normal;white-space:pre-wrap;unicode-bidi:plaintext;font-synthesis:none}
.c6p span{font-synthesis:none}
.c6chart{position:absolute;inset:0}
@font-face{font-family:'C6Num';src:url(fonts/montserrat-800.woff2) format('woff2');font-weight:100 1000;font-display:block}
.c6tg{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;direction:rtl;background:#f3f1ed;border-radius:28px}
.c6tg-f{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.c6tg-f rect{fill:none;stroke:#bc8d55;stroke-width:3;stroke-dasharray:2.2 1.6;vector-effect:non-scaling-stroke;opacity:.85}
.c6tg-k{display:flex;align-items:center;gap:10px;font-size:30px;color:#38526b;font-weight:normal;line-height:1.3}
.c6tg-k svg{width:30px;height:30px;fill:none;stroke:#bc8d55;stroke-width:2;color:#bc8d55}
.c6tg-v{font:800 124px/1.05 'C6Num',sans-serif;color:#b48a5a;letter-spacing:-2px;font-variant-numeric:tabular-nums;direction:ltr}
.c6tg-u{font-size:40px;line-height:1.2;color:#b48a5a}
.c6tg-y{margin-top:8px;padding:2px 16px;border-radius:12px;background:#ede3d3;font:700 34px/1.3 'C6Num',sans-serif;color:#a07a4c}
.c6tg.play{animation:c6tgIn .7s cubic-bezier(.2,.8,.2,1) var(--d) both}
.c6tg.play .c6tg-f rect{stroke-dasharray:100;stroke-dashoffset:100;animation:c6tgDraw 1.1s ease var(--d) forwards}
.c6tg.play>div{animation:c6tgUp .6s cubic-bezier(.2,.8,.2,1) both}
.c6tg.play .c6tg-k{animation-delay:calc(var(--d) + .15s)}.c6tg.play .c6tg-v{animation-delay:calc(var(--d) + .25s)}.c6tg.play .c6tg-u{animation-delay:calc(var(--d) + .4s)}.c6tg.play .c6tg-y{animation-delay:calc(var(--d) + .5s)}
@keyframes c6tgIn{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:none}}
@keyframes c6tgUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes c6tgDraw{0%{stroke-dashoffset:100}99%{stroke-dasharray:100}100%{stroke-dashoffset:0;stroke-dasharray:2.2 1.6}}
.c6embed{position:absolute;inset:0;width:100%;height:100%;border:0;background:transparent}
.c6embposter{position:absolute;inset:0;width:100%;height:100%;object-fit:fill}
.c6vbadge{position:absolute;left:8px;top:8px;z-index:2;font:700 22px system-ui;color:#fff;background:rgba(20,30,60,.65);border-radius:8px;padding:2px 10px;display:none}
.c6thumb .c6vbadge{display:block}
`;
/* a word that no longer fits its box (a substitute face is wider than the client's) shrinks to fit instead of breaking:
   «39» stays one number. Run after the slide is in the page and its fonts are in. */
C6.fitText = function (root) {
  root.querySelectorAll('.c6p').forEach(p => {
    p.style.zoom = '';
    const w = p.clientWidth; if (!w) return;
    const sw = p.scrollWidth;
    if (sw > w + 1) p.style.zoom = Math.max(.5, (w - 1) / sw).toFixed(4);
  });
  if (root.classList && root.classList.contains('c6s')) C6.fixOverlaps(root);
};
/* until the client's own 29LT Adir / beIN / Hacen / Segoe / GE files are in, their stand-ins are a little wider, so two texts
   that sat side by side on the client's slide can touch here. Where they do, the stand-in text is eased smaller (to 70% at most)
   until they part — the client's own faces never are. */
const SUBST = /29lt adir|bein|hacen|segoe|ge mb|ge ss/i;
C6.fixOverlaps = function (root) {
  const k = root.getBoundingClientRect().width / 1920 || 1; const o = root.getBoundingClientRect();
  const items = [];
  root.querySelectorAll(':scope > .c6l').forEach(el => {
    const L = (C6._layerOf && C6._layerOf(root, el.dataset.id)) || null;
    const ps = [...el.querySelectorAll('.c6p')]; if (!ps.length) return;
    const sub = !!el.dataset.sub; if (el.style.transform && /rotate/.test(el.style.transform)) return;
    items.push({ el, ps, sub, fs: +el.dataset.fs || 0 });
  });
  const ink = it => { const r = []; it.el.querySelectorAll('.c6p span').forEach(sp => { const t = sp.textContent; if (!t || t === '\u200b' || !t.trim()) return; const f = parseFloat(sp.style.fontSize) || 20; for (const c of sp.getClientRects()) { if (c.width < 1) continue; const z = (parseFloat(sp.closest('.c6p').style.zoom) || 1); const trim = .2 * f * z * k; r.push([c.left - o.left, c.top - o.top + trim, c.right - o.left, c.bottom - o.top - trim]); } }); return r; };
  const hit = (A, B) => A.some(a => B.some(b => Math.min(a[2], b[2]) - Math.max(a[0], b[0]) > 2 * k && Math.min(a[3], b[3]) - Math.max(a[1], b[1]) > 2 * k));
  for (let pass = 0; pass < 8; pass++) {
    let moved = false; const R = items.map(ink);
    for (let a = 0; a < items.length; a++) for (let b = a + 1; b < items.length; b++) {
      const A = items[a], B = items[b]; if (!(A.sub || B.sub)) continue;
      if (A.el.textContent.trim() === B.el.textContent.trim()) continue;   /* a text and its own shadow copy */
      if (!hit(R[a], R[b])) continue;
      const T = (A.sub && B.sub) ? (A.fs >= B.fs ? A : B) : (A.sub ? A : B);
      T.ps.forEach(p => { const z = parseFloat(p.style.zoom) || 1; if (z > .7) { p.style.zoom = Math.max(.7, z - .05).toFixed(3); moved = true; } });
    }
    if (!moved) break;
  }
};
C6.injectCss = function () { if (document.getElementById('c6-css')) return; const s = document.createElement('style'); s.id = 'c6-css'; s.textContent = C6.CSS; document.head.appendChild(s); };
C6.facesUsed = function (slides) {
  const out = new Set();
  const walk = L => { if (L.text) L.text.paras.forEach(P => P.runs.forEach(r => { out.add(faceOf(r.fc, r.b)); out.add(faceOf(r.fl, r.b)); })); };
  slides.forEach(S => (S.layers || []).forEach(walk));
  Object.values(C6.deck.layouts || {}).forEach(l => l.layers.forEach(walk));
  const keys = new Map(); out.forEach(f => keys.set(f.key, f)); return [...keys.values()];
};
C6.loadFonts = function (slides) {
  const fs = C6.facesUsed(slides); fs.forEach(ensureFace);
  return Promise.all(fs.map(f => Promise.all([document.fonts.load(`20px "c6-${f.key}"`, 'abc 123'), document.fonts.load(`20px "c6-${f.key}"`, 'مصر')]).catch(() => 0)));
};
})();
/* a slide drawn small: a box of the given width with the 1920×1080 stage scaled inside it */
(function () {
  const C6 = window.C6;
  C6.mini = function (S, w, ctx) {
    const box = document.createElement('div'); box.className = 'c6mini';
    box.style.cssText = `position:relative;width:${w}px;height:${Math.round(w * 9 / 16)}px;overflow:hidden;`;
    const st = C6.renderSlide(S, Object.assign({ thumb: w <= 480, lazy: true }, ctx || {}));
    st.style.transform = `scale(${w / 1920})`; st.style.position = 'absolute'; st.style.left = '0'; st.style.top = '0';
    box.appendChild(st); return box;
  };
  /* the slide's name for lists: its largest text */
  C6.titleOf = function (S) {
    let best = null;
    (S.layers || []).forEach(L => {
      if (!L.text || L.hid) return;
      const t = L.text.paras.map(p => p.runs.map(r => r.t).join('')).join(' ').replace(/\s+/g, ' ').trim();
      if (!t || t.length < 2) return;
      const sz = Math.max(...L.text.paras.flatMap(p => p.runs.map(r => r.sz || 0)));
      if (!best || sz > best.sz || (sz === best.sz && L.y < best.y)) best = { t, sz, y: L.y };
    });
    if (best) return best.t.slice(0, 90);
    const v = (S.layers || []).find(L => L.t === 'video');
    if (v) return v.nm && !/^Picture|^Video|^media/i.test(v.nm) ? v.nm : (v.kn ? 'سؤال · كي نوت ' + v.kn : v.map ? 'خريطة' : 'فيديو');
    return 'سلايد صور';
  };
  C6.kinds = function (S) {
    const k = new Set();
    (S.layers || []).forEach(L => { if (L.t === 'video') k.add(L.kn ? 'kn' : L.map ? 'map' : 'vid'); if (L.t === 'chart') k.add('chart'); });
    return [...k];
  };
})();
