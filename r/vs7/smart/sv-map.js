/* Smart Visual · the story map (Amr 05:09: «خريطة بتشرح المشاكل و التحديات و تظهر الحلول اللي تمت بطريقة علمية وبصرية»).
   One map of Egypt that comes back through the session. Each visit is a scene of steps; a step moves the camera, switches
   layers on and off, and changes the explanation panel on the right. A problem is drawn in red, its answer in the chapter's
   colour; what earlier chapters built stays on the map, quieter (base). Geometry: sv-geo.js (hub map engine). Figures: V6.
   scene: { type:'map', title, base:[layers], st:[{ cam, on:[], off:[], hot:[], k, h, v, a, u, p, tone:'bad'|'good',
            waffle:[from,to], prog:[done,of], leg:[[layer,label]], notes:[{at:[lon,lat], t, d:'l'|'r', c:'bad'|'good'}] }] } */
(function () {
  const SV = window.SV, { esc, S } = SV.h;
  const G = window.SVGEO;
  if (!G) return;
  /* projection: equirectangular at 27°N, 100 px per degree of latitude */
  const K = 100, CO = 0.891, LON0 = 24.4, LAT0 = 31.9, CX = 620, CY = 545;
  const P = p => [(p[0] - LON0) * K * CO, (LAT0 - p[1]) * K];
  const f1 = v => Math.round(v * 10) / 10;
  const pt = p => { const q = P(p); return f1(q[0]) + ' ' + f1(q[1]); };
  const ring = r => 'M' + r.map(pt).join('L') + 'Z';
  const poly = (t, c) => (t === 'Polygon' ? [c] : c).map(pl => pl.map(ring).join('')).join('');
  const line = ps => 'M' + ps.map(pt).join('L');
  const lines = (t, c) => t === 'LineString' ? line(c) : c.map(line).join('');
  const CAM = {
    eg: { c: [30.6, 26.8], z: 0.93 }, egr: { c: [30.2, 26.8], z: 0.93 },
    delta: { c: [31.05, 30.45], z: 3.0 }, cairo: { c: [31.3, 30.04], z: 6.6 }, cairo2: { c: [31.25, 30.1], z: 5.2 },
    upper: { c: [31.02, 27.55], z: 3.7 }, nile: { c: [31.4, 27.0], z: 1.9 },
    canal: { c: [32.42, 30.55], z: 5.6 }, sinai: { c: [33.4, 29.8], z: 2.5 },
    north: { c: [30.0, 30.6], z: 2.4 }, med: { c: [31.0, 30.9], z: 2.2 }, south: { c: [31.4, 23.9], z: 2.2 }, coast: { c: [31.0, 29.3], z: 1.45 }
  };
  const cam = c => typeof c === 'string' ? (CAM[c] || CAM.eg) : (c || CAM.eg);
  const CANAL = [[32.305, 31.265], [32.31, 31.09], [32.32, 30.86], [32.31, 30.72], [32.33, 30.61], [32.36, 30.5], [32.41, 30.42], [32.46, 30.32], [32.5, 30.22], [32.555, 30.12], [32.57, 29.95]];
  const zones = (k) => G.zones.filter(z => z.id === k || z.t === k);
  const govs = names => G.geo.gov.filter(g => names.includes(g.n));
  const nodes = t => G.nodes.filter(n => n.t === t);
  const lns = t => G.lines.filter(l => [].concat(t).includes(l.t));
  /* village dots: an illustrative spread inside the 2014 inhabited land (each dot ≈ 5 villages) */
  let VIL = null, UID = 0;
  function villages() {
    if (VIL) return VIL;
    const z = zones('valley')[0], pl = (z.g === 'Polygon' ? [z.c] : z.c).map(p => p[0]);
    const inside = (x, y) => pl.some(r => { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; });
    let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const out = []; let n = 0;
    while (out.length < 917 && n < 200000) { n++; const x = 29.4 + rnd() * 3.6, y = 22.0 + rnd() * 9.6; if (inside(x, y)) out.push([x, y]); }
    return (VIL = out);
  }
  /* layer catalogue: path layers live in the camera group (they scale); pin layers live above it (they keep their size) */
  const LY = {
    valley: { k: 'p', d: () => zones('valley').map(z => poly(z.g, z.c)).join('') },
    erode: { k: 'p', d: () => zones('valley').map(z => poly(z.g, z.c)).join('') },
    grow: { k: 'p', d: () => zones('grow').map(z => poly(z.g, z.c)).join('') },
    agri: { k: 'p', d: () => zones('agri').map(z => poly(z.g, z.c)).join('') },
    cairo: { k: 'p', d: () => govs(['القاهرة', 'الجيزة']).map(g => poly(g.t, g.c)).join('') },
    sinai: { k: 'p', d: () => govs(['شمال سيناء', 'جنوب سيناء']).map(g => poly(g.t, g.c)).join('') },
    dark: { k: 'p', d: () => poly('MultiPolygon', G.geo.egypt) },
    lit: { k: 'p', d: () => poly('MultiPolygon', G.geo.egypt) },
    canal: { k: 'l', d: () => line(CANAL) }, canalok: { k: 'l', d: () => line(CANAL) },
    roads: { k: 'l', d: () => lns('road').map(l => line(l.p)).join(''), draw: 1 },
    hsr: { k: 'l', d: () => lns('hsr').map(l => line(l.p)).join(''), draw: 1 },
    urban: { k: 'l', d: () => lns(['lrt', 'mono']).map(l => line(l.p)).join(''), draw: 1 },
    cables: { k: 'l', d: () => lns('digital').map(l => line(l.p)).join(''), draw: 1 },
    vill: { k: 'v' },
    cities: { t: 'city', sh: 'c', r: 8 }, old: { t: 'cityold', sh: 'o', r: 6 },
    slum: { t: 'slum', sh: 'c', r: 8 }, slumok: { t: 'slum', sh: 'k', r: 9 },
    x100: { t: 'nileaxis', sh: 'b', r: 9, pick: (n, i) => i % 4 === 0 }, axes: { t: 'nileaxis', sh: 'b', r: 8 },
    tunnels: { t: 'tunnel', sh: 'B', r: 13 }, ports: { t: 'port', sh: 'd', r: 8 }, dry: { t: 'dry', sh: 's', r: 7 }, land: { t: 'land', sh: 's', r: 6 },
    air: { t: 'airport', sh: 't', r: 8 }, st: { t: 'hsrst', sh: 'o', r: 5 },
    /* 16:56 the infrastructure before 2014: the 19 airports that existed (the 4 opened since — the Capital, Sphinx, Berenice and
       El Bardawil — left out) and the main commercial ports */
    air14: { t: 'airport', sh: 't', r: 8, pick: n => !['مطار العاصمة الدولي', 'مطار سفنكس', 'مطار برنيس', 'مطار البردويل'].includes(n.n) },
    airnew: { t: 'airport', sh: 't', r: 10, pick: n => ['مطار العاصمة الدولي', 'مطار سفنكس', 'مطار برنيس', 'مطار البردويل'].includes(n.n) },
    port0: { t: 'port', sh: 'd', r: 9, pick: n => ['ميناء الإسكندرية', 'ميناء الدخيلة', 'ميناء دمياط', 'ميناء شرق بورسعيد', 'ميناء غرب بورسعيد', 'ميناء العين السخنة', 'ميناء الأدبية', 'ميناء سفاجا'].includes(n.n) },
    power: { t: 'power', sh: 'c', r: 8 }, water: { t: 'water', sh: 'c', r: 7 }, desal: { t: 'desal', sh: 'd', r: 8 }, oil: { t: 'oil', sh: 'd', r: 8 }, cablep: { t: 'digital', sh: 'o', r: 6 },
    ind: { t: 'ind', sh: 's', r: 7 }, silo: { t: 'silo', sh: 'c', r: 5 }, fish: { t: 'fish', sh: 'c', r: 6 }, tour: { t: 'tour', sh: 't', r: 8 },
    uni: { t: 'uni', sh: 'c', r: 6 }, hosp: { t: 'hosp', sh: 'x', r: 7 }, school: { t: 'school', sh: 's', r: 5 }
  };
  const shape = (sh, r) => {
    switch (sh) {
      case 'c': return `<circle r="${r}" class="dot"/>`;
      case 'o': return `<circle r="${r}" class="dot rg"/>`;
      case 'k': return `<circle r="${r}" class="dot"/><path d="M${-r * .45} 0l${r * .3} ${r * .32}l${r * .55} ${-r * .6}" class="chk"/>`;
      case 'd': return `<path d="M0 ${-r}L${r} 0L0 ${r}L${-r} 0Z" class="dot"/>`;
      case 's': return `<rect x="${-r * .85}" y="${-r * .85}" width="${r * 1.7}" height="${r * 1.7}" rx="2" class="dot"/>`;
      case 't': return `<path d="M0 ${-r}L${r * .95} ${r * .75}L${-r * .95} ${r * .75}Z" class="dot"/>`;
      case 'x': return `<path d="M${-r * .32} ${-r}h${r * .64}v${r * .68}h${r * .68}v${r * .64}h${-r * .68}v${r * .68}h${-r * .64}v${-r * .68}h${-r * .68}v${-r * .64}h${r * .68}z" class="dot"/>`;
      case 'b': return `<rect x="${-r * 1.5}" y="-2.5" width="${r * 3}" height="5" rx="2.5" class="dot"/>`;
      case 'B': return `<rect x="${-r * 1.4}" y="-4" width="${r * 2.8}" height="8" rx="4" class="dot"/>`;
    }
    return '';
  };
  const legSw = k => { const L = LY[k]; if (!L) return ''; if (!L.t) return `<svg viewBox="-12 -12 24 24" class="sw ly-${k}"><rect x="-10" y="-6" width="20" height="12" rx="3" class="dot"/></svg>`; return `<svg viewBox="-14 -14 28 28" class="sw ly-${k}">${shape(L.sh, Math.min(10, L.r + 1))}</svg>`; };

  /* a note can sit on [lon,lat], on a named site («بنبان الشمسي»), or on a zone («z0») */
  function where(a) {
    if (Array.isArray(a)) return a;
    const z = G.zones.find(x => x.id === a);
    if (z) { const r = (z.g === 'Polygon' ? z.c[0] : z.c[0][0]); const s = r.reduce((m, p) => [m[0] + p[0], m[1] + p[1]], [0, 0]); return [s[0] / r.length, s[1] / r.length]; }
    const n = G.nodes.find(x => x.n === a); return n ? n.p : [30.75, 26.75];
  }
  function build(sc, o) {
    const g = G.geo;
    let cam = `<g class="grat">`;
    for (let lo = 24; lo <= 38; lo += 2) cam += `<path d="${line([[lo, 20.5], [lo, 33.5]])}"/>`;
    for (let la = 22; la <= 32; la += 2) cam += `<path d="${line([[22.5, la], [38.5, la]])}"/>`;
    cam += `</g><path class="nb" d="${g.nb.map(n => poly(n.t, n.c)).join('')}"/><path class="eg" d="${poly('MultiPolygon', g.egypt)}"/>`;
    cam += `<path class="gov" d="${g.gov.map(x => poly(x.t, x.c)).join('')}"/>`;
    const cid = 'svcv' + (++UID);
    cam += `<clipPath id="${cid}"><path d="${LY.valley.d()}"/></clipPath>`;
    ['valley', 'erode', 'grow', 'agri', 'cairo', 'sinai'].forEach(k => cam += `<g class="ly ly-${k}" data-ly="${k}"${k === 'cairo' ? ` clip-path="url(#${cid})"` : ''}><path d="${LY[k].d()}"/></g>`);
    { const q = P([31.24, 30.04]); cam += `<g class="ly ly-cairo halo" data-ly="cairo"><circle cx="${f1(q[0])}" cy="${f1(q[1])}" r="38"/></g>`; }
    cam += `<g class="ly ly-vill" data-ly="vill">${villages().map(p => { const q = P(p); return `<circle cx="${f1(q[0])}" cy="${f1(q[1])}" r="2.1"/>`; }).join('')}</g>`;
    cam += `<g class="water"><path class="lake" d="${g.lakes.map(l => poly(l.t, l.c)).join('')}"/><path class="nile0" d="${g.nile.map(n => lines(n.t, n.c)).join('')}"/><path class="nile" d="${g.nile.map(n => lines(n.t, n.c)).join('')}"/></g>`;
    ['canal', 'canalok', 'roads', 'hsr', 'urban', 'cables'].forEach(k => cam += `<g class="ly ly-${k}${LY[k].draw ? ' draw' : ''}" data-ly="${k}"><path d="${LY[k].d()}"${LY[k].draw ? ' pathLength="1"' : ''}/></g>`);
    cam += `<g class="ly ly-dark" data-ly="dark"><path d="${LY.dark.d()}"/></g>`;
    cam += `<path class="egl" d="${poly('MultiPolygon', g.egypt)}"/>`;
    /* the Nile-crossing rulers (Upper Egypt, between crossings 21 and 25) */
    const ax = nodes('nileaxis'), seg = ax.slice(20, 25).map(n => [n.p[0] + 0.3, n.p[1]]);
    const tick = p => { const q = P(p); return `M${f1(q[0] - 9)} ${f1(q[1])}h18`; };
    cam += `<g class="ly ly-r100 ruler" data-ly="r100"><path d="${line(seg)}${tick(seg[0])}${tick(seg[4])}"/></g>`;
    cam += `<g class="ly ly-r25 ruler" data-ly="r25"><path d="${line(seg)}${seg.map(tick).join('')}"/></g>`;
    let pins = '';
    Object.keys(LY).forEach(k => {
      const L = LY[k]; if (!L.t) return;
      const list = nodes(L.t).filter((n, i) => !L.pick || L.pick(n, i));
      const st = Math.min(.035, 1.4 / Math.max(1, list.length));
      pins += `<g class="ly ly-${k} pl" data-ly="${k}">${list.map((n, i) => { const q = P(n.p); return `<g class="pin" data-x="${f1(q[0])}" data-y="${f1(q[1])}"><g class="pop" style="transition-delay:${(i * st).toFixed(3)}s">${shape(L.sh, L.r)}</g></g>`; }).join('')}</g>`;
    });
    const notes = sc.st.map((s, k) => (s.notes || []).map(n => { const q = P(where(n.at)); return `<div class="mn ${n.d === 'l' ? 'l' : 'r'} ${n.c || ''}" data-st="${k}" data-x="${f1(q[0])}" data-y="${f1(q[1])}"><i></i><span>${esc(n.t)}</span></div>`; }).join('')).join('');
    /* 16:04 Amr «اسماء ال ٣٩ ينزلوا بطريقة متتالية», 16:20 «عاوزها على الخريطة»: a step's labels:[[name, left, top, pinX, pinY]]
       (stage px, laid out once for that step's camera, clear of each other, of the pins and of the big notes) put every place's name
       on the map next to its pin — a hairline to the pin when the name had to move away — dropping in one after another */
    const labels = sc.st.map((s, k) => { if (!s.labels && !s.grp) return ''; let ln = '';
      const tags = (s.labels || []).map(([t, x, y, px, py, ax, ay], i) => { const dl = (.6 + i * .12).toFixed(2);
        if (ax != null) ln += `<line x1="${px}" y1="${py}" x2="${ax}" y2="${ay}" style="transition-delay:${dl}s"/>`;
        return `<span style="left:${x}px;top:${y}px;transition-delay:${dl}s">${esc(t)}</span>`; }).join('');
      /* 16:27 the new cities packed around Cairo: one box of names, tied by one line to a ring around them */
      let gb = '';
      if (s.grp) { const g = s.grp, gx = Math.min(Math.max(g.px, g.x), g.x + g.w), gy = Math.min(Math.max(g.py, g.y), g.y + g.h);
        const ang = Math.atan2(gy - g.py, gx - g.px), ex = g.px + Math.cos(ang) * g.r, ey = g.py + Math.sin(ang) * g.r;
        ln += `<circle class="gr" cx="${g.px}" cy="${g.py}" r="${g.r}" style="transition-delay:.4s"/><line x1="${ex.toFixed(1)}" y1="${ey.toFixed(1)}" x2="${gx}" y2="${gy}" style="transition-delay:.5s"/>`;
        gb = `<div class="mgrp" style="left:${g.x}px;top:${g.y}px;transition-delay:.5s"><b>${esc(g.t)}</b><div class="gl">${g.n.map((t, i) => `<span style="transition-delay:${(.8 + i * .12).toFixed(2)}s">${esc(t)}</span>`).join('')}</div></div>`; }
      return `<div class="mlabels" data-st="${k}"><svg viewBox="0 0 1920 1080" width="1920" height="1080">${ln}</svg>${tags}${gb}</div>`; }).join('');
    const seas = [[[24.95, 32.0], 'البحر المتوسط'], [[37.05, 23.05], 'البحر الأحمر']].map(([p, t]) => { const q = P(p); return `<div class="mn sea" data-x="${f1(q[0])}" data-y="${f1(q[1])}"><span>${t}</span></div>`; }).join('');
    const svg = `<svg class="msv" viewBox="0 0 1920 1080" width="1920" height="1080"><rect class="sea" width="1920" height="1080"/>
      <g class="cam">${cam}</g><g class="pins">${pins}</g></svg>`;
    return `<div class="mapw">${svg}<div class="mnotes">${seas}${notes}</div>${labels}<div class="scale"><i></i><span></span></div><div class="mshade"></div></div>`;
  }
  const waffle = (a, b) => `<div class="waf">${Array.from({ length: 100 }, (_, i) => `<i class="${i < a ? 'w0' : i < b ? 'w1' : ''}" style="transition-delay:${i < a ? 0 : ((i - a) * .03).toFixed(2)}s"></i>`).join('')}</div>`;
  function panel(sc, d) {
    return `<div class="mpanel">${sc.st.map((s, k) => `<div class="mp ${s.tone || ''}" data-st="${k}">
      ${s.k ? `<div class="mk">${esc(s.k)}</div>` : ''}${s.h ? `<h3>${esc(s.h)}</h3>` : ''}
      ${s.v != null ? `<div class="mv">${s.a != null ? `<s class="num">${esc(s.a)}</s><i>←</i>` : ''}${SV.h.num(s.v, s.a != null && s.from ? s.a : null, s.tone === 'bad' ? 'bad' : 'gold')}${s.u ? `<u>${esc(s.u)}</u>` : ''}</div>` : ''}
      ${s.p ? `<p>${esc(s.p)}</p>` : ''}
      ${s.waffle ? waffle(s.waffle[0], s.waffle[1]) + `<div class="wcap">${esc(s.wcap || 'كل مربع = 1% من مساحة مصر')}</div>` : ''}
      ${s.prog ? `<div class="prog"><div class="pg">${Array.from({ length: s.prog[1] }, (_, i) => `<i class="${i < s.prog[0] ? 'd' : ''}"></i>`).join('')}</div><div class="pc"><b class="num">${s.prog[0]}</b> منفذ من <b class="num">${s.prog[1]}</b></div></div>` : ''}
      ${s.leg ? `<div class="leg">${s.leg.map(x => `<span>${legSw(x[0])}${esc(x[1])}</span>`).join('')}</div>` : ''}
      ${s.chips ? `<div class="mchips">${s.chips.map((c, i) => `<span class="chip glass" style="transition-delay:${(.2 + i * .12).toFixed(2)}s">${esc(c)}</span>`).join('')}</div>` : ''}
      ${s.foot ? `<div class="mfoot">${esc(s.foot)}</div>` : ''}</div>`).join('')}
      <div class="mdots">${sc.st.map((s, k) => `<i data-st="${k}"></i>`).join('')}</div></div>`;
  }
  SV.R.map = (sc, d, o) => build(sc, o) + panel(sc, d);

  function stateAt(sc, k) {
    const on = new Set(), hot = new Set(); let c = 'eg';
    for (let i = 0; i <= k && i < sc.st.length; i++) {
      const s = sc.st[i];
      (s.off || []).forEach(x => on.delete(x));
      if (i === k) (s.on || []).concat(s.hot || []).forEach(x => hot.add(x));
      (s.on || []).forEach(x => on.add(x));
      if (s.cam) c = s.cam;
    }
    return { on, hot, cam: cam(c) };
  }
  SV.after.map = (el, sc, d, o) => {
    const svg = el.querySelector('.msv'), cg = el.querySelector('.cam'), wrap = el.querySelector('.mapw');
    const pins = [...el.querySelectorAll('.pin')], notes = [...el.querySelectorAll('.mn')];
    const nlist = [...el.querySelectorAll('.mlabels')];
    const ly = [...el.querySelectorAll('.ly')], panels = [...el.querySelectorAll('.mp')], dots = [...el.querySelectorAll('.mdots i')];
    const base = new Set(sc.base || []);
    const sbar = el.querySelector('.scale i'), slab = el.querySelector('.scale span');
    let last = -1, camNow = null, raf = 0;
    /* 22 Oct 14:52 Amr «فيه فليكر بيحصل لما الخريطة بتتحرك زووم»: the camera, the line widths and every pin/note used to run on their own
       CSS transitions — the SVG on the main thread, the pins on the compositor — so during a zoom they drifted apart and shimmered.
       Now one frame loop moves them all together, frame by frame, on the same eased value (the old 1.9 s, cubic-bezier(.65,0,.35,1)). */
    const bez = (x1, y1, x2, y2) => t => { let a = 0, b = 1, m = t; for (let i = 0; i < 22; i++) { m = (a + b) / 2; const u = 1 - m, x = 3 * u * u * m * x1 + 3 * u * m * m * x2 + m * m * m; if (x < t) a = m; else b = m; } const u = 1 - m; return 3 * u * u * m * y1 + 3 * u * m * m * y2 + m * m * m; };
    const ease = bez(.65, 0, .35, 1), DUR = 1900;
    const put = (tx, ty, z) => {
      cg.style.transform = `translate(${tx.toFixed(2)}px,${ty.toFixed(2)}px) scale(${z.toFixed(5)})`;
      svg.style.setProperty('--z', z.toFixed(5));
      pins.forEach(p => { p.style.transform = `translate(${(tx + z * p.dataset.x).toFixed(2)}px,${(ty + z * p.dataset.y).toFixed(2)}px)`; });
      notes.forEach(n => { n.style.transform = `translate(${(tx + z * n.dataset.x).toFixed(2)}px,${(ty + z * n.dataset.y).toFixed(2)}px)`; });
      camNow = { tx, ty, z };
    };
    wrap.classList.add('jscam');
    el._onstep = (k, instant) => {
      const S0 = stateAt(sc, k), c = S0.cam, q = P(c.c), z = c.z, tx = CX - z * q[0], ty = CY - z * q[1];
      if (instant || last < 0) { wrap.classList.add('still'); }
      cancelAnimationFrame(raf);
      if (instant || last < 0 || !camNow || (Math.abs(camNow.z - z) < 1e-4 && Math.abs(camNow.tx - tx) < .1 && Math.abs(camNow.ty - ty) < .1)) put(tx, ty, z);
      else {
        /* zoom in log space, so the speed of the zoom feels even; the point under the screen's centre moves on the same eased path */
        const A = camNow, lz0 = Math.log(A.z), lz1 = Math.log(z), cx0 = (CX - A.tx) / A.z, cy0 = (CY - A.ty) / A.z, cx1 = (CX - tx) / z, cy1 = (CY - ty) / z, t0 = performance.now();
        const tick = now => { const e = ease(Math.min(1, (now - t0) / DUR)), zz = Math.exp(lz0 + (lz1 - lz0) * e), cx = cx0 + (cx1 - cx0) * e, cy = cy0 + (cy1 - cy0) * e;
          put(CX - zz * cx, CY - zz * cy, zz); if (e < 1) raf = requestAnimationFrame(tick); };
        raf = requestAnimationFrame(tick);
      }
      notes.forEach(n => n.classList.toggle('cur', n.dataset.st == null || +n.dataset.st === k));
      nlist.forEach(n => n.classList.toggle('cur', +n.dataset.st === k));
      ly.forEach(g => { const id = g.dataset.ly; const on = S0.on.has(id); g.classList.toggle('on', on); g.classList.toggle('hot', S0.hot.has(id)); g.classList.toggle('past', !on && base.has(id)); });
      el.classList.toggle('m-dark', S0.on.has('dark')); el.classList.toggle('m-lit', S0.on.has('lit'));
      panels.forEach(p => { const cur = +p.dataset.st === k; if (cur && !p.classList.contains('cur')) { p.classList.add('cur'); if (instant) SV.finish(p); else SV.count(p); } else if (!cur) p.classList.remove('cur'); });
      dots.forEach(x => x.classList.toggle('on', +x.dataset.st <= k));
      /* scale bar: pick a round distance that draws between 70 and 240 px */
      const pxkm = z * K / 111.2; const km = [25, 50, 100, 200, 300, 500].find(v => v * pxkm >= 70) || 500;
      sbar.style.width = f1(km * pxkm) + 'px'; slab.textContent = km + ' كم';
      if (instant || last < 0) { void wrap.offsetWidth; requestAnimationFrame(() => wrap.classList.remove('still')); }
      last = k;
    };
  };
})();
