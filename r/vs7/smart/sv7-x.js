/* Smart Visual 7 — «الجلسة الختامية V7» in the Smart Visual look, one scene per V7 slide (22 Oct 2026, Amr: «بنفس الاسلوب البصري
   بتاع سمارت فيجوال بنفس عدد الفريمات ولكن بتوزيع بصري مريح»). The SV engine draws the scenes; this file adds the kinds V7 needs:
   gallery (any number of photos, each whole), proj (a project: its photos whole + one figure), hero, stmt, question, section, oath,
   cards, leaders, stats, cmp (before / after), people — and lets a scene name its pictures by path (src, from the forum-v3 root). */
(function () {
  const SV = window.SV; if (!SV) return;
  const { esc, S } = SV.h;
  const IC = typeof KICONS !== 'undefined' ? KICONS : {};
  const ic = (k, c) => IC[k] ? `<svg class="${c || 'ic'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${IC[k]}</svg>` : '';
  const U = (src, o) => (o && o.base || '') + '../' + src;
  const isN = v => /^-?[\d.]+%?$/.test(String(v == null ? '' : v).trim());
  const N = (v, cls) => isN(v) ? `<span class="num ${cls || ''}" data-to="${esc(v)}">${esc(v)}</span>` : `<span class="num ${cls || ''}">${esc(v)}</span>`;
  const R = SV.R;
  /* 23 Oct 10:59 Amr «مش عاوز تباطئ في الانميشن، احنا عاوزين نكسب وقت» / «خلي الظهور اسرع»: everything that comes in, comes in faster —
     builds, counts, the typed question, each element's wait (×0.55) */
  SV.speed = 0.55;
  /* 23 Oct 10:54 Amr «دي بيانات الخريطة بتاعة المواني عشان انت عامل ١٧ بس مش ١٩» — the client's «خريطة الـ19 ميناء بحري»: these 19 ports
     (14 developed / under development, 5 new: جرجوب، المكس، أبو قير، طابا، برنيس — «new» drawn apart). 10:58 «احنا عدلنا الخريطة دي ولاغينا
     الداخلة وحطينا الطور، وبرج العرب بقى اسكندرية»: the airports without Dakhla, with El Tor */
  if (window.SVGEO && SVGEO.nodes) {
    const PORTS = [{"t": "port", "n": "ميناء جرجوب", "p": [26.58, 31.5], "new": 1}, {"t": "port", "n": "ميناء المكس", "p": [29.835, 31.155], "new": 1}, {"t": "port", "n": "ميناء الإسكندرية", "p": [29.87, 31.18], "new": 0}, {"t": "port", "n": "ميناء الدخيلة", "p": [29.8, 31.13], "new": 0}, {"t": "port", "n": "ميناء أبو قير", "p": [30.07, 31.32], "new": 1}, {"t": "port", "n": "ميناء دمياط", "p": [31.76, 31.47], "new": 0}, {"t": "port", "n": "ميناء غرب بورسعيد", "p": [32.3, 31.25], "new": 0}, {"t": "port", "n": "ميناء شرق بورسعيد", "p": [32.36, 31.21], "new": 0}, {"t": "port", "n": "ميناء العريش", "p": [33.81, 31.14], "new": 0}, {"t": "port", "n": "ميناء بورتوفيق", "p": [32.555, 29.945], "new": 0}, {"t": "port", "n": "ميناء الأدبية", "p": [32.47, 29.87], "new": 0}, {"t": "port", "n": "ميناء العين السخنة", "p": [32.34, 29.64], "new": 0}, {"t": "port", "n": "ميناء الطور", "p": [33.61, 28.24], "new": 0}, {"t": "port", "n": "ميناء طابا", "p": [34.895, 29.49], "new": 1}, {"t": "port", "n": "ميناء نويبع", "p": [34.66, 29.03], "new": 0}, {"t": "port", "n": "ميناء شرم الشيخ", "p": [34.29, 27.86], "new": 0}, {"t": "port", "n": "ميناء الغردقة", "p": [33.84, 27.23], "new": 0}, {"t": "port", "n": "ميناء سفاجا", "p": [33.94, 26.76], "new": 0}, {"t": "port", "n": "ميناء برنيس", "p": [35.48, 23.95], "new": 1}];
    /* 11:06 «التزم بالمطارات دي» — the client's airports map, 23 airports: no Siwa, with 6th of October */
    SVGEO.nodes = SVGEO.nodes.filter(n => n.t !== 'port' && !(n.t === 'airport' && (n.n === 'مطار الداخلة' || n.n === 'مطار سيوة'))).concat(PORTS);
    if (!SVGEO.nodes.some(n => n.t === 'airport' && n.n === 'مطار الطور')) SVGEO.nodes.push({ t: 'airport', n: 'مطار الطور', p: [33.645, 28.209] });
    if (!SVGEO.nodes.some(n => n.t === 'airport' && n.n === 'مطار 6 أكتوبر')) SVGEO.nodes.push({ t: 'airport', n: 'مطار 6 أكتوبر', p: [30.823, 29.812] });
    SV.newPorts = PORTS.map(x => !!x.new);
  }
  /* 19:52 Amr «بلاش علامة صليب في اي ايقون حتى وان كانت مستشفى … وبلاش رمز مثلا خنزير في التوفير»: the icon set lends no cross —
     the hospital is a plain building with a heartbeat, the shield carries a check (the set has no piggy bank) */
  if (typeof KICONS !== 'undefined') {
    KICONS.hospital = '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /> <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /> <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" /> <path d="M8 10h1.5l1-2 1.5 4 1-2H16" /> <path d="M10 22v-4h4v4" />';
    if (KICONS['shield-check']) KICONS['shield-plus'] = KICONS['shield-check'];
    Object.keys(KICONS).forEach(k => { if (/piggy|cross|church/.test(k)) KICONS[k] = KICONS['banknote'] || ''; });
  }

  /* ───────── photo layout: every photo whole (its own proportions), the arrangement that covers most of the box ───────── */
  function perms(a) { if (a.length < 2) return [a]; const o = []; a.forEach((x, i) => perms(a.slice(0, i).concat(a.slice(i + 1))).forEach(p => o.push([x].concat(p)))); return o; }
  function splits(n, r) { if (r === 1) return [[n]]; const o = []; for (let k = 1; k <= n - r + 1; k++) splits(n - k, r - 1).forEach(t => o.push([k].concat(t))); return o; }
  function fit(ar, B, cols, gap, maxRows) {
    const W = B.x1 - B.x0, H = B.bottom - B.top, idx = ar.map((a, i) => i);
    const L = cols ? H : W, M = cols ? W : H, len = i => cols ? 1 / ar[i] : ar[i];
    let best = null;
    const tryRows = rows => {
      const hs = rows.map(row => (L - gap * (row.length - 1)) / row.reduce((a, i) => a + len(i), 0));
      const need = hs.reduce((a, b) => a + b, 0) + gap * (rows.length - 1), s = Math.min(1, M / need);
      const area = s * s * hs.reduce((a, h, ri) => a + h * (L - gap * (rows[ri].length - 1)), 0);
      if (!best || area > best.area + 1) best = { rows, hs, s, area };
    };
    if (ar.length <= 6) {
      perms(idx).forEach(ord => { for (let r = 1; r <= Math.min(maxRows, ord.length); r++) splits(ord.length, r).forEach(cut => {
        let k = 0; tryRows(cut.map(c => { const row = ord.slice(k, k + c); k += c; return row; }));
      }); });
    } else {
      /* many photos: keep their order, cut into 2–6 even rows */
      for (let r = 2; r <= Math.min(6, ar.length); r++) {
        const rows = []; let k = 0;
        for (let j = 0; j < r; j++) { const c = Math.round((ar.length - k) / (r - j)); rows.push(idx.slice(k, k + c)); k += c; }
        tryRows(rows);
      }
    }
    const { rows, hs, s } = best, items = [];
    const used = hs.reduce((a, h) => a + h * s, 0) + gap * (rows.length - 1);
    let y = (M - used) / 2;
    rows.forEach((row, ri) => {
      const h = hs[ri] * s, ws = row.map(i => len(i) * h), rowW = ws.reduce((a, b) => a + b, 0) + gap * (row.length - 1);
      let x = (L - rowW) / 2;
      row.forEach((i, ci) => {
        items.push(cols ? { i, ri, ci, right: B.x0 + y, top: B.top + x, w: h, h: ws[ci] } : { i, ri, ci, right: B.x0 + x, top: B.top + y, w: ws[ci], h });
        x += ws[ci] + gap; });
      y += h + gap;
    });
    return { items, area: best.area };
  }
  /* boxes: right edge distance (x0, RTL) and left edge (x1 = 1920 − left margin) */
  function layout(pics, boxes, gap, maxRows) {
    const ar = pics.map(p => (p.w || 16) / (p.h || 9));
    const c = []; boxes.forEach(B => { c.push(fit(ar, B, false, gap, maxRows)); if (pics.length <= 3) c.push(fit(ar, B, true, gap, maxRows)); });
    return c.sort((a, b) => b.area - a.area)[0].items;
  }
  /* 19:30 «احترم الكروب»: a picture keeps the crop it has on the slide (crop = [left, top, right, bottom] of the source, 0–1) */
  function cropImg(p, o) {
    const c = p.crop; let h;
    if (!c || !(c[0] || c[1] || c[2] || c[3])) h = `<img src="${U(p.src, o)}" alt="" decoding="async">`;
    else { const W = 1 - c[0] - c[2], H = 1 - c[1] - c[3];
      h = `<img class="cr" src="${U(p.src, o)}" alt="" decoding="async" style="width:${(100 / W).toFixed(3)}%;height:${(100 / H).toFixed(3)}%;left:${(-100 * c[0] / W).toFixed(3)}%;top:${(-100 * c[1] / H).toFixed(3)}%">`; }
    /* a picture the slide mirrors stays mirrored (crop already swapped to the mirrored side) */
    return p.fh || p.fv ? `<span class="flp" style="transform:scale(${p.fh ? -1 : 1},${p.fv ? -1 : 1})">${h}</span>` : h;
  }
  function coverFig(p, o, cls, extra) {
    const ar = (p.w || 16) / (p.h || 9); let w, h;
    if (ar > 1920 / 1080) { h = 1080; w = h * ar; } else { w = 1920; h = w / ar; }
    return `<figure class="gi ${cls}"${extra || ''} style="right:${((1920 - w) / 2).toFixed(1)}px;top:${((1080 - h) / 2).toFixed(1)}px;width:${w.toFixed(1)}px;height:${h.toFixed(1)}px">${cropImg(p, o)}</figure>`;
  }
  const tagCls = t => /قبل|2014|2020/.test(t) ? 'old' : 'new';
  function figure(p, t, o, k) {
    const live = !o.static && !o.thumb;
    /* 20:20 Amr «ما تعملش ستريتش»: a film keeps the slide's crop exactly like a picture (cropImg), never stretched to its box */
    const vc = p.crop && (p.crop[0] || p.crop[1] || p.crop[2] || p.crop[3]) ? (() => { const c = p.crop, W = 1 - c[0] - c[2], H = 1 - c[1] - c[3];
      return `position:absolute;max-width:none;width:${(100 / W).toFixed(3)}%;height:${(100 / H).toFixed(3)}%;left:${(-100 * c[0] / W).toFixed(3)}%;top:${(-100 * c[1] / H).toFixed(3)}%`; })() : '';
    const media = p.video
      ? (live ? `<video muted ${p.once ? 'data-nd="1" ' : 'loop '}playsinline autoplay preload="auto"${p.vpos ? ` style="object-fit:cover;object-position:${p.vpos}"` : (vc ? ` style="${vc}"` : '')} data-src="${U(p.video, o)}" poster="${p.poster ? U(p.poster, o) : ''}"></video>` : (vc ? cropImg({ src: p.poster, crop: p.crop }, o) : `<img src="${U(p.poster, o)}" alt=""${p.vpos ? ` data-nd="1" style="object-fit:cover;object-position:${p.vpos}"` : ''}>`))
      : p.html || cropImg(p, o);
    return `<figure class="gi${p.map ? ' mapv' : ''}"${S(0)} style="right:${t.right.toFixed(1)}px;top:${t.top.toFixed(1)}px;width:${t.w.toFixed(1)}px;height:${t.h.toFixed(1)}px;transition-delay:${(.12 + (k != null ? k : t.ri * 2 + t.ci) * .09).toFixed(2)}s">
      ${media}${p.tag ? `<span class="tg ${tagCls(p.tag)}">${esc(p.tag)}</span>` : ''}${p.fig ? figHTML(p.fig, t) : ''}${p.cap ? `<figcaption>${esc(p.cap)}</figcaption>` : ''}</figure>`;
  }
  /* 23 Oct 08:02 Amr «لو فيه داتا في وصف الصورة كأرقام ممكن اضافة الارقام اوفرلاي على الصورة بطريقة الانفوجرافيك اللي احنا عاملينها»
     (110, 111, 131): a photo's figures leave its caption and stand on the photo itself — the deck's figure (gold, large) with its unit and
     the few words that say what it counts; the caption keeps the name */
  function figHTML(f, t) { const L = [].concat(f), sm = t && t.w < 560, xs = t && t.w < 340;
    return `<div class="gfig${sm ? ' sm' : ''}${xs ? ' xs' : ''}">${L.map(x => `<div class="gfx">${x.pre ? `<small>${esc(x.pre)}</small>` : ''}<div class="gv"><b class="num gold">${esc(x.v)}</b><span>${esc(x.u || '')}</span></div></div>`).join('')}</div>`; }

  /* ───────── gallery: the slide's photos, each whole and named; a title of its own ───────── */
  /* 19:30 «احترم الكروب … والصور تاخد العرض كامل»: when the slide's photos tile its frame, they keep the slide's own places and crops;
     a picture the client stretched is shown filling its place at its true proportions (the extra trimmed evenly from its crop) */
  function fillCrop(p, bw, bh) {
    const c = (p.crop || [0, 0, 0, 0]).slice(), ra = (p.w || 16) / (p.h || 9), ba = bw / bh;
    let sw = 1 - c[0] - c[2], sh = 1 - c[1] - c[3];
    if (ra > ba * 1.002) { const n = sw * ba / ra, dd = (sw - n) / 2; c[0] += dd; c[2] += dd; }
    else if (ra < ba / 1.002) { const n = sh * ra / ba, dd = (sh - n) / 2; c[1] += dd; c[3] += dd; }
    return Object.assign({}, p, { crop: c });
  }
  /* 19:58 Amr «احترم المكان اللي مكتوب فيه النص، والصور تكون في المساحة اللي مش فيها النص … وطبق ده على كله»: the title block's real
     height (kick, the title's lines, the sub-line's lines) is the band no picture may enter */
  const wlen = t => (t || '').length + 4 * ((t || '').match(/\d[\d,.]*/g) || []).length;   /* a highlighted figure is wider than its digits */
  /* 23 Oct 00:38–00:39 Amr «في سلايد ٢٩ عاوز تنسيق للجزء اللي فوق وتطبقه على كل السلايدات المشابهه … انا محتاج بشكل عام تيمبلت
     منظم بصريا»: one header for every photo slide — a small part-name (only when the ring top-right doesn't already say it), the title
     alone, then a row of its figures: each pulled out of the title's brackets or the sub-line, its figure big and gold with its unit,
     the figures divided by hairlines. Nothing is dropped: «التحرك الأول · التعمير» is what the ring shows as «التعمير · 1 / 5». */
  const CONN = /\s+(بطاقة(?:\s+إنتاجية)?|بتكلفة(?:\s+تجاوزت)?|باستثمارات(?:\s+تجاوزت)?|بطول|بإجمالي|بتمويل|بقيمة|حوالي|نحو)$/;
  function factOf(t) {
    t = t.trim().replace(/^[\s(–—-]+|[\s)،,.–—-]+$/g, ''); const m = t.match(/\d[\d,.]*/); if (!m) return null;
    if (/^(19|20)\d\d$/.test(m[0]) && !/\d/.test(t.slice(m.index + m[0].length))) return null;   /* a year is not a figure */
    let u = t.slice(m.index + m[0].length).trim(); if ((u.match(/\(/g) || []).length > (u.match(/\)/g) || []).length) u += ')';   /* a bracket the split left open closes */
    return { pre: t.slice(0, m.index).trim(), v: m[0], u };
  }
  function splitFacts(inner) { return inner.split(/\s*[–—]\s*|\s+-\s+/).map(factOf).filter(Boolean); }
  function pullFacts(s, facts) {
    return s.replace(/\s*\(((?:[^()]|\([^()]*\))*)\)/g, (m, inner) => { if (!/\d/.test(inner)) return m; const f = splitFacts(inner); if (!f.length) return m; f._at = 1; facts.push(...f); return ' '; }).replace(/\s{2,}/g, ' ').trim();
  }
  function ghead(sc) {
    if (sc._gh) return sc._gh;
    const CH = (window.SV7 && SV7.chapters) || (window.SV1 && SV1.chapters) || [];
    const chName = sc.ch ? CH[sc.ch - 1] : '';
    const kick = (sc.kick || '').split(/\s*·\s*/).filter(x => x && !/^التحرك/.test(x) && x !== chName).join(' · ');
    let title = sc.title || '', sub = sc.sub || ''; const facts = [];
    if (sc.facts !== false) {
      const n0 = facts.length; title = pullFacts(title, facts);
      const cm = facts.length > n0 && title.match(CONN); if (cm) { facts[n0].pre = (cm[1] + ' ' + facts[n0].pre).trim(); title = title.slice(0, cm.index).trim(); }
      const dash = title.match(/^(.+?)\s+-\s+([^-]*\d[^-]*)$/); if (dash) { const f = splitFacts(dash[2]); if (f.length) { facts.push(...f); title = dash[1].trim(); } }
      if (/\d/.test(sub)) { const n1 = facts.length; sub = pullFacts(sub, facts); const sm = facts.length > n1 && sub.match(CONN); if (sm) { facts[n1].pre = (sm[1] + ' ' + facts[n1].pre).trim(); sub = sub.slice(0, sm.index).trim(); }
        if (/\d/.test(sub) && !/[()]/.test(sub)) { const keep = []; sub.split(/\s*،\s*/).forEach(x => { const f = factOf(x); if (f) facts.push(f); else keep.push(x); }); sub = keep.join('، '); } }
    }
    return (sc._gh = { kick, title, sub, facts });
  }
  /* 11:17 Amr «سلايد ٢٩ والسلايدات اللي زيه اللي فيه الارقام ممكن تستغل الجزء اليسار عشان الارقام تبان بشكل ملفت أكتر»: the figures
     leave the line under the title and stand big in the band's empty left side — one or two: the figure with its unit beside it;
     three or more: each figure over its unit — the title keeps the right side, wrapping if the figures need the room */
  function gheadHTML(sc) {
    const g = ghead(sc); if (!(g.title || g.kick || g.facts.length || g.sub)) return '';
    const u = t => esc(t).replace(/\(([^()]*)\)/g, '<small>$1</small>'), nf = g.facts.length;
    const facts = nf ? `<div class="gfs side${nf > 2 ? ' stk' : ''}">${g.facts.map(f => `<div class="gf">${f.pre ? `<span class="fp">${esc(f.pre)}</span>` : ''}<div class="fv"><span class="num gold"${/^[\d.,]+$/.test(f.v) ? ` data-to="${esc(f.v)}"` : ''}>${esc(f.v)}</span>${f.u ? `<span class="fu">${u(f.u)}</span>` : ''}</div></div>`).join('')}</div>` : '';
    return `<div class="gt gh${g.title.length > 58 ? ' long' : ''}${nf ? ' wf' : ''}"${S(0, 'fade')}><div class="ghl">${g.kick ? `<span class="k">${esc(g.kick)}</span>` : ''}${g.title ? `<b>${esc(g.title)}</b>` : ''}${g.sub ? `<div class="sub">${esc(g.sub)}</div>` : ''}</div>${facts}</div>`;
  }
  const factsW = g => { const stk = g.facts.length > 2;
    return 64 + g.facts.reduce((a, f) => a + 68 + (stk ? Math.max(f.pre.length * 11, f.v.length * 46, Math.min(f.u.length * 13.5, 280)) : Math.max(f.pre.length * 11, f.v.length * 57 + 12 + Math.min(f.u.length * 15, 300))), 0); };
  const band = sc => { const g = ghead(sc); if (!(g.title || g.kick || g.facts.length || g.sub)) return 0;
    const nf = g.facts.length, stk = nf > 2, long = g.title.length > 58, k = Math.max(.3, (1780 - (nf ? factsW(g) + 56 : 0)) / 1780);
    const tl = g.title ? Math.ceil(wlen(g.title) / ((long ? 72 : 64) * k)) : 0;
    const th = (g.kick ? 36 : 0) + tl * (long ? 50 : 58) + (g.sub ? 10 + 40 * Math.ceil(wlen(g.sub) / (90 * k)) : 0);
    const fh = nf ? 40 + (g.facts.some(f => f.pre) ? 30 : 0) + (stk ? 88 + 34 * Math.max(1, ...g.facts.map(f => Math.ceil(f.u.length * 13.5 / 280))) : 112) : 0;
    return Math.round(100 + Math.max(th, fh) + 30); };
  let recBox = null;
  function geoGallery(sc, o) {
    const ps = sc.pics.map((p, i) => Object.assign({ _i: i }, p)).sort((a, b) => (a.z || 0) - (b.z || 0));
    /* 19:45: the title gets its own band — the slide's arrangement moves down under it (the frames keep their widths, the pictures
       their proportions: fillCrop trims the little height they lose evenly) */
    const T = band(sc), B = sc.note ? 980 : 1080, minY = Math.min(...ps.map(p => p.box[1]));
    const ky = (B - T) / (1080 - Math.max(0, minY) - Math.max(0, 1080 - Math.max(...ps.map(p => p.box[1] + p.box[3]))));
    const y0 = Math.max(0, minY);
    /* 08:43 Amr (his 69) «حلوة الفكرة بس ياريت من غير اوفرلاب»: with a record plate the photographs keep their arrangement and their
       proportions, scaled as one block into the left part of the slide; the plate stands in its own column on the right */
    const RB = sc.rec ? { x0: 70, x1: 1290, y0: T + 14, y1: 1040 } : null;
    let rk = 1, rx = 0, ry = 0, bx0 = 0, by0 = 0;
    if (RB) { bx0 = Math.min(...ps.map(p => p.box[0])); by0 = Math.min(...ps.map(p => p.box[1]));
      const bw = Math.max(...ps.map(p => p.box[0] + p.box[2])) - bx0, bh = Math.max(...ps.map(p => p.box[1] + p.box[3])) - by0;
      rk = Math.min((RB.x1 - RB.x0) / bw, (RB.y1 - RB.y0) / bh); rx = RB.x0 + ((RB.x1 - RB.x0) - rk * bw) / 2; ry = RB.y0 + ((RB.y1 - RB.y0) - rk * bh) / 2;
      recBox = { top: Math.round(ry), bottom: Math.round(1080 - ry - rk * bh) }; }
    return ps.map((p, k) => { let [x, y, w, h] = p.box;
      if (RB) { x = rx + (x - bx0) * rk; y = ry + (y - by0) * rk; w *= rk; h *= rk; }
      else if (T || sc.note) { y = T + (y - y0) * ky; h = h * ky; }
      const small = h < 330;
      const t = { right: 1920 - x - w, top: y, w, h, ri: 0, ci: k };
      if (p.rot === 90 || p.rot === 270) {
        /* a picture the slide turns a quarter: the frame is the turned place, the picture inside turns back upright */
        const q = fillCrop(p, h, w), inner = `<div class="rot" style="width:${h}px;height:${w}px;left:${((w - h) / 2).toFixed(1)}px;top:${((h - w) / 2).toFixed(1)}px;transform:rotate(${p.rot}deg)">${cropImg(q, o)}</div>`;
        return figure(Object.assign({}, q, { src: null, html: inner }), t, o, k * .5);
      }
      return figure(fillCrop(p, w, h), t, o, k * .5).replace('class="gi', small ? 'class="gi sm' : 'class="gi'); }).join('');
  }
  /* 23 Oct 07:53 Amr (his 69) «اظهر كتابة موسوعة جينيس والعمق بطريقة مميزة، وان قدرت تحصل على الشهادة كمان من مصدر موثوق ضفها»: the
     record as its own plate over the photographs — the certificate itself (photographed at the port, SCZone, 16 Dec 2025), the record
     in words, and the depth as the figure */
  const recHTML = (r, o) => `<div class="grec"${S(0)}><figure class="gcert"><img src="${U(r.img, o)}" alt=""></figure>
      <div class="gtx"><div class="gk">${esc(r.k)}</div><div class="gt2">${esc(r.t)}</div>${r.s ? `<div class="gs">${esc(r.s)}</div>` : ''}</div>
      <div class="gd"><small>${esc(r.l || 'بعمق')}</small><div><b class="num gold">${esc(r.v)}</b><span>${esc(r.u || 'م')}</span></div></div></div>`;
  R.gallery = (sc, d, o) => {
    const pics = sc.pics || [];
    if (sc.geo) {
      const hasT = !!(sc.title || sc.kick);
      return `<div class="gal geo${sc.rec ? ' wrec' : ''}">${geoGallery(sc, o)}</div>
        ${hasT ? gheadHTML(sc) : ''}
        ${sc.rec ? recHTML(sc.rec, o).replace('class="grec"', `class="grec col" style="top:${recBox ? recBox.top : band(sc) + 14}px;bottom:${recBox ? recBox.bottom : 40}px"`) : sc.note ? `<div class="gnote"${S(0)}><span>${esc(sc.note)}</span></div>` : ''}`;
    }
    if ((sc.title || sc.kick) && !sc.title && sc.im != null) sc = Object.assign({}, sc, { title: 'صور من المشروعات', _gh: null });
    const hasT = !!(sc.title || sc.kick), sub = !!sc.sub, note = !!sc.note;
    const long = (sc.title || '').length > 58, top = band(sc);
    /* 19:30 «الصور تاخد العرض كامل للسلايد»: the photos run edge to edge under the title */
    const boxes = [{ x0: 0, x1: 1920, top, bottom: note ? 990 : 1080 }];
    const items = layout(pics.map(p => p.src && p.src.startsWith('img/') ? p : Object.assign({}, p, { src: 'img/c6/image' + p.im + '.webp' })), boxes, sc.grid ? 6 : 8, sc.grid ? 6 : 3);
    const pg = sc.page && sc.page[1] > 1 ? `<span class="pg">${sc.page[0]} / ${sc.page[1]}</span>` : '';
    return `${hasT ? gheadHTML(sc).replace('</b>', '</b>' + pg) : ''}
      <div class="gal${sc.grid ? ' grid' : ''}${sc.sat ? ' sat' : ''}">${items.map((t, k) => { const p = pics[t.i]; return figure(p.src ? p : Object.assign({}, p, { src: 'img/c6/image' + p.im + '.webp' }), t, o, sc.grid ? k * .35 : null); }).join('')}</div>
      ${note ? `<div class="gnote"${S(0)}><span>${esc(sc.note)}</span></div>` : ''}`;
  };

  /* ───────── proj: one project — its photos (and route map) whole on the left, the figure on the right ───────── */
  /* 23 Oct 07:54 Amr (his 70) «نسق الكلام في الجزء اللي تحت على اليمين بشكل بصري سهل الفهم»: a ranking said in a sentence becomes
     two rank tiles (the place, big, and where), the index under them, and the cost on its own line */
  const ranksHTML = r => `<div class="prk"${S(0)} style="transition-delay:.3s">${r.pre ? `<div class="rpre">${esc(r.pre)}</div>` : ''}
      <div class="rts">${r.items.map(x => `<div class="rt"><small>المركز</small><b class="num gold">${esc(x.n)}</b><span>${esc(x.l)}</span></div>`).join('')}</div>
      ${r.cap ? `<div class="rcap">${esc(r.cap)}</div>` : ''}
      ${r.cost ? `<div class="rcost">${KICONS && KICONS[r.cost.ic || 'banknote'] ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${KICONS[r.cost.ic || 'banknote']}</svg>` : ''}<span>${esc(r.cost.pre)}</span><b class="num gold">${esc(r.cost.v)}</b><span>${esc(r.cost.u)}</span></div>` : ''}</div>`;
  /* 08:04 Amr (his 116) «تنسيق الجزء اللي على اليمين تحت»: counts said inside a sentence stand as figures of their own (7 barrages ·
     5 governorates), and the governorates as names, not a bracket */
  const pfxHTML = f => `<div class="pfx"${S(0)} style="transition-delay:.45s">${f.rows ? `<div class="pfr">${f.rows.map(r => `<div class="pfc">${N(r[0], 'gold')}<span>${esc(r[1])}</span></div>`).join('')}</div>` : ''}
      ${f.chips ? `<div class="pfch">${f.chips.map(c => `<span>${esc(c)}</span>`).join('')}</div>` : ''}</div>`;
  R.proj = (sc, d, o) => {
    let ph = '';
    if (sc.gal) { const pics = sc.gal; ph = layout(pics, [{ x0: 720, x1: 1920, top: 0, bottom: 1080 }], 8, 3).map(t => figure(pics[t.i], t, o)).join(''); }
    else if (sc.main) {
      /* 19:30: the project's photo takes the whole stage (as on the slide); its route map (V3 style) and any second photo ride on the left */
      const m = sc.main;
      /* 19:58 «الصور تكون في المساحة اللي مش فيها النص»: the photo fills the stage left of the panel (never under the text), melting into it */
      ph = figure(fillCrop(m, 1200, 1080), { right: 720, top: 0, w: 1200, h: 1080, ri: 0, ci: 0 }, o, 0).replace('class="gi', 'class="gi pbg2');
      const maps = (sc.ins || []).filter(x => x.map), pics = (sc.ins || []).filter(x => !x.map);
      /* 20:20 Amr «خلي رسم الخريطة اصغر»: every route-map inset the same visual size (≈ 300×300), at its true proportions */
      const put = (x, corner, i) => { const ar = (x.w || 16) / (x.h || 9), iw = x.map ? Math.sqrt(90000 * ar) : Math.min(ar >= 1 ? 460 : 340, 340 * ar), ih = iw / ar;
        const t = { right: 1920 - 60 - iw, top: corner === 'b' ? 1080 - 60 - ih : 60 + i * (ih + 18), w: iw, h: ih, ri: 1, ci: i };
        return figure(x, t, o, 4 + i).replace('class="gi', 'class="gi ins'); };
      maps.forEach((x, i) => { ph += put(x, 'b', i); });
      pics.forEach((x, i) => { ph += put(x, maps.length ? 't' : 'b', i); });
    }
    const st = sc.stats || (sc.stat ? [sc.stat] : []);
    const stat = x => `<div class="pst"${S(0)}>${x.pre ? `<div class="pre">${esc(x.pre)}</div>` : ''}<div class="pv">${N(x.v, 'gold')}${x.u ? `<u>${esc(x.u)}</u>` : ''}</div>${x.p ? `<div class="pp">${esc(x.p)}</div>` : ''}</div>`;
    return `<div class="ppanel">
        ${sc.kick ? `<div class="kick"${S(0)}>${esc(sc.kick)}</div>` : ''}
        <h2 class="ph"${S(0)}>${esc(sc.h)}</h2>${sc.sub ? `<div class="psub"${S(0)}>${esc(sc.sub)}</div>` : ''}
        <div class="psts${st.length > 1 ? ' two' : ''}">${st.map(stat).join('')}</div>
        ${sc.ranks ? ranksHTML(sc.ranks) : sc.p ? `<p class="pd"${S(0)}>${esc(sc.p)}</p>` : ''}${sc.pfx ? pfxHTML(sc.pfx) : ''}</div>
      <div class="gal">${ph}</div>`;
  };

  /* ───────── kpis: a table of targets (23 Oct 10:58 Amr «هنا في جدول بالمستهدفات») ─────────
     the programme's three aims as the title, then each indicator on its own row: now (grey) → 2029/2030 (gold) and the change, its
     arrow up or down — every change here is a gain, so all in the gain's colour */
  R.kpis = (sc, d, o) => {
    const ch = v => { const neg = /^-/.test(v), n = v.replace(/^[+-]/, ''); return `<span class="kc ${neg ? 'dn' : 'up'}"><i>${neg ? '▼' : '▲'}</i><b>\u2066${neg ? '−' : '+'}${esc(n)}\u2069</b></span>`; };
    return `<div class="pad kpw">${sc.k ? `<div class="kick"${S(0)}>${esc(sc.k)}</div>` : ''}<h2 class="h2 kq2"${S(0)}>${esc(sc.q)}</h2>
      <div class="ktab"><div class="kr kh"${S(0)}><span>${esc(sc.cols[0])}</span><span>${esc(sc.cols[1])}</span><span></span><span>${esc(sc.cols[2])}</span><span>${esc(sc.cols[3])}</span></div>
      ${sc.rows.map((r, i) => `<div class="kr glass"${S(0)} style="transition-delay:${(.25 + i * .12).toFixed(2)}s"><span class="kn">${esc(r[0])}</span><span class="ka">${N(r[1].replace('%', '')) }<em>%</em></span><span class="kar">←</span><span class="kb">${N(r[2].replace('%', ''), 'gold')}<em>%</em></span>${ch(r[3])}</div>`).join('')}</div></div>`;
  };

  /* ───────── ndmap: a whole drawn map across the stage (23 Oct 07:59 Amr his 106 — the New Delta map, nothing of it hidden) ─────────
     the vector map (its parcels, letters, areas, owners, sources, legend) fills the stage; the slide's words sit in one card over the
     empty western desert */
  R.ndmap = (sc, d, o) => {
    const st = sc.stat;
    return `<div class="ndw"${S(0, 'fade')}>${sc.svg || ''}</div>
      <div class="ndc glass"${S(0)} style="transition-delay:.5s">${sc.kick ? `<div class="kick">${esc(sc.kick)}</div>` : ''}<h2 class="ph">${esc(sc.h)}</h2>${sc.sub ? `<div class="psub">${esc(sc.sub)}</div>` : ''}
        ${st ? `<div class="pst">${st.pre ? `<div class="pre">${esc(st.pre)}</div>` : ''}<div class="pv">${N(st.v, 'gold')}${st.u ? `<u>${esc(st.u)}</u>` : ''}</div></div>` : ''}
        ${sc.p ? `<p class="pd">${esc(sc.p)}</p>` : ''}</div>`;
  };

  /* ───────── hero: one photo across the stage, its name in the corner; any small extra photo stays whole ───────── */
  R.hero = (sc, d, o) => `<div class="bg hb">${coverFig(sc.img, o, 'hbi')}</div>
    ${(sc.ins || []).map((p, i) => `<figure class="hins"${S(0, 'fade')} style="width:${Math.round(Math.min(560, 330 * p.w / p.h))}px;aspect-ratio:${p.w}/${p.h};transition-delay:${(.6 + i * .2).toFixed(2)}s">${cropImg(p, o)}</figure>`).join('')}
    <div class="pad">${sc.k ? `<div class="kick"${S(0)}>${esc(sc.k)}</div>` : ''}${sc.h ? `<h1 class="h1 mask"${S(0)}><span>${esc(sc.h)}</span></h1>` : ''}${sc.p ? `<div class="p"${S(0)}>${esc(sc.p)}</div>` : ''}</div>`;

  /* ───────── stmt: the deck's text slides, set for reading ───────── */
  /* 23 Oct 07:46 Amr (his 57) «خلي في العنوان في سطر واحد: لا تكتمل بمجرد إنشاء الطرق»: {…} in a line's text = a phrase that is never
     broken (it moves to the next line whole) */
  const keep = t => esc(t).replace(/\{([^}]*)\}/g, '<span class="nw">$1</span>');
  R.stmt = (sc, d, o) => `${sc.bg != null ? `<div class="bg ${sc.gray ? 'gray' : ''}"><img src="${SV.h.IMG(sc.bg, o.base)}" alt=""></div>` : ''}<div class="pad">
    ${sc.quote ? `<div class="qmk"${S(0, 'fade')}>”</div>` : ''}
    ${sc.lines.map((l, i) => `<div class="ln ${l.c || ''}"${S(0)} style="transition-delay:${(i * .45).toFixed(2)}s">${keep(l.t)}</div>`).join('')}
    ${sc.chips ? `<div class="chips">${sc.chips.map((c, i) => `<span class="chip glass"${S(0)} style="transition-delay:${(1 + i * .25).toFixed(2)}s">${esc(c)}</span>`).join('')}</div>` : ''}</div>`;

  /* ───────── question: «أهم الأسئلة التي يجيب عنها المنتدى» ───────── */
  R.question = (sc) => `<div class="qbig"${S(0, 'fade')}>؟</div><div class="pad">
    <div class="qk"${S(0)}><i></i><span>${esc(sc.k)}</span></div><h2 class="qq"${S(0)} style="transition-delay:.35s">${esc(sc.q)}</h2></div>`;

  /* ───────── section: «القسم الأول … الخامس» ───────── */
  /* 23:44 Amr «سلايد ١٤ … تصميم كوفر abstract يعبر عن الكلام»: «إعادة بناء مقومات التنمية» drawn, not photographed — a blueprint
     field and a foundation of gold courses rising from the base line, outwards from the centre, the line of its growth drawn over them */
  const absFound = () => {
    const base = 880, rh = 34, gap = 8, courses = 3, cx = 960; let bricks = '', k = 0;   /* 23:55 «خليها minimal» */
    for (let r = 0; r < courses; r++) {
      const W = 760 - r * 230, y = base - (r + 1) * (rh + gap), bl = 118, off = r % 2 ? bl / 2 : 0;
      const n = Math.ceil((W + off) / bl);
      for (let i = 0; i < n; i++) {
        let xa = cx - W / 2 - off + i * bl, xb = xa + bl - gap; xa = Math.max(xa, cx - W / 2); xb = Math.min(xb, cx + W / 2);
        if (xb - xa < 24) continue;
        const dl = (0.2 + r * 0.32 + Math.abs((xa + xb) / 2 - cx) / 1400 * 0.5).toFixed(2);
        bricks += `<rect class="fb${r === courses - 1 ? ' cap' : ''}" x="${xa.toFixed(1)}" y="${y}" width="${(xb - xa).toFixed(1)}" height="${rh}" rx="4" style="transition-delay:${dl}s"/>`; k++;
      }
    }
    const grid = Array.from({ length: 33 }, (_, i) => `<line x1="${i * 60}" y1="0" x2="${i * 60}" y2="1080"/>`).join('') + Array.from({ length: 19 }, (_, i) => `<line x1="0" y1="${i * 60}" x2="1920" y2="${i * 60}"/>`).join('');
    return `<div class="absf"><svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice"><defs>
      <linearGradient id="fbg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8a5c25" stop-opacity=".18"/><stop offset="1" stop-color="#e9bc6c" stop-opacity=".42"/></linearGradient>
      <linearGradient id="fcp" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#c9944a" stop-opacity=".7"/><stop offset="1" stop-color="#f6dca2" stop-opacity="1"/></linearGradient>
      <radialGradient id="fgl" cx=".5" cy=".82" r=".45"><stop offset="0" stop-color="#e9bc6c" stop-opacity=".14"/><stop offset="1" stop-color="#e9bc6c" stop-opacity="0"/></radialGradient>
      <radialGradient id="fgm" cx=".5" cy=".75" r=".62"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><mask id="fgk"><rect width="1920" height="1080" fill="url(#fgm)"/></mask></defs>
      <rect width="1920" height="1080" fill="url(#fgl)"/>
      <line class="fbase" x1="560" y1="${base}" x2="1360" y2="${base}"/><g>${bricks}</g></svg></div>`;
  };
  /* 00:03 «القسم التاني شيل الخلفية»: the second section, minimal as the first — five gold columns (the five capacities) rising */
  const absPillars = () => { const base = 880, cx = 960, w = 34, gap = 46, hs = [70, 104, 140, 104, 70]; let r = '';
    hs.forEach((h, i) => { const x = cx + (i - 2) * (w + gap) - w / 2; r += `<rect class="fb${i === 2 ? ' cap' : ''}" x="${x}" y="${base - h}" width="${w}" height="${h}" rx="6" style="transition-delay:${(.25 + Math.abs(i - 2) * .22).toFixed(2)}s"/>`; });
    return `<div class="absf"><svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice"><defs>
      <linearGradient id="fcp" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#c9944a" stop-opacity=".7"/><stop offset="1" stop-color="#f6dca2" stop-opacity="1"/></linearGradient>
      <radialGradient id="fgl" cx=".5" cy=".82" r=".45"><stop offset="0" stop-color="#e9bc6c" stop-opacity=".14"/><stop offset="1" stop-color="#e9bc6c" stop-opacity="0"/></radialGradient></defs>
      <rect width="1920" height="1080" fill="url(#fgl)"/><line class="fbase" x1="700" y1="${base}" x2="1220" y2="${base}"/><g>${r}</g></svg></div>`; };
  /* 23 Oct 06:42 Amr «سلايد … كوفر القسم يكون رقم القسم بالطريقة زي الصورة التانية، وبلاش اشكال الطوب والحاجات اللي معمولة —
     يبقى كتابة بس بطريقة احترافية»: a part's cover is its number — huge, cropped by the frame, lit from above and fading into the
     dark — and its words set together in one corner (the part · the title · the line under it). No drawn shapes. */
  const ORD = { 'الأول': 1, 'الثاني': 2, 'الثالث': 3, 'الرابع': 4, 'الخامس': 5, 'السادس': 6 };
  /* 23 Oct 07:25 Amr «في القسم الاول مقومات التنمية في سطر واحد، في القسم التاني مصر التي تغيرت في سطر واحد برده — ركز في ان الجمل
     المهمة ما تتقطعش في النص»: a title is broken between its phrases, never inside one — a question mark closes its line; a phrase of
     up to three words is kept whole; a longer one keeps its last two words together (no word left alone on a line) */
  const phr = t => String(t || '').split(/(?<=[؟?])\s+/).map(q => { const cl = q.split(/(?<=[،,:·])\s+/); return cl.map(p => {
      const w = p.split(/\s+/).filter(Boolean); if (w.length <= (cl.length > 1 ? 4 : 3)) return `<span class="nw">${esc(p)}</span>`;
      return `${esc(w.slice(0, -2).join(' '))} <span class="nw">${esc(w.slice(-2).join(' '))}</span>`; }).join(' '); }).join('<br>');
  SV.phr = phr;
  R.section = (sc, d, o) => {
    const m = /القسم\s+(\S+)/.exec(sc.k || ''), n = m && ORD[m[1]];
    return `${sc.photo ? `<div class="bg sbg${sc.photo.gray ? ' gray' : ''}">${coverFig(sc.photo, o, 'hbi')}</div>` : ''}
      ${n ? `<div class="snum"${S(0, 'fade')}><span>${String(n).padStart(2, '0')}</span></div>` : ''}
      <div class="stx${n ? '' : ' nonum'}"><div class="sk2"${S(0)}><i></i><span>${esc(sc.k)}</span></div>
      ${sc.cards ? `<div class="scards">${sc.cards.map((c, i) => `<div class="scard glass"${S(0)} style="transition-delay:${(.25 + i * .22).toFixed(2)}s">${KICONS && KICONS[c.ic] ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${KICONS[c.ic]}</svg>` : ''}<b>${phr(c.t)}</b></div>`).join('')}</div>`
        : `<h1 class="h1 mask${sc.small ? ' sm' : ''}"${S(0)}><span>${phr(sc.q)}</span></h1>`}${sc.sub ? `<div class="p"${S(0)} style="transition-delay:.4s">${esc(sc.sub)}</div>` : ''}</div>`;
  };

  /* ───────── oath: 2014 · the beginning ───────── */
  /* 00:04 Amr «فيديو … صوت السيسي وهو بيقول القسم والكلام بيطلع مع صوته مع نفس الكلمات اللي مكتوبة»: the real oath (8 June 2014),
     every written word lit the moment he says it (word times by forced alignment) */
  const oathV = (sc, d, o) => { const live = !o.static && !o.thumb && !sc.still;   /* 10:03: the silent twin (sc.still) — no voice, every word lit */
    const words = sc.q.split(/\s+/).map((w, i) => { const tt = sc.times[i] || {}; return `<span class="ow" data-t0="${tt.t0}" data-t1="${tt.t1}">${esc(w)}</span>`; }).join(' ');
    /* 00:13 «الفيديو الكواليتي وحش … استخدم الصوت فقط على الصورة القديمة»: his voice only, over the slide's own photograph */
    const pic = sc.aud ? `<figure class="oimg"${S(0, 'fade')} style="aspect-ratio:${sc.img.w}/${sc.img.h}">${cropImg(sc.img, o)}</figure>${live ? `<video class="oaud" playsinline preload="auto" data-src="${U(sc.aud, o)}"></video>` : ''}`
      : `<figure class="oimg ovid"${S(0, 'fade')}>${live ? `<video playsinline preload="auto" data-src="${U(sc.vid, o)}" poster="${U(sc.poster, o)}"></video>` : `<img src="${U(sc.poster, o)}" alt="">`}</figure>`;
    return `${pic}
    <div class="pad"><div class="oy gold"${S(0)}>${esc(sc.y)}</div><div class="ok"${S(0)}>${esc(sc.k)}</div>
    <blockquote class="okar${live ? '' : ' all'}"${S(0)} style="transition-delay:.4s">«${words}»</blockquote><cite${S(0)} style="transition-delay:.6s">${esc(sc.by)}</cite></div>`; };
  SV.after.oath = (el, sc, d, o) => { if (!(sc.vid || sc.aud) || o.static || o.thumb || sc.still) return;
    const v = el.querySelector('video'), ws = [...el.querySelectorAll('.ow')].map(w => ({ w, a: +w.dataset.t0, b: +w.dataset.t1 }));
    const tick = () => { if (!el.isConnected) return; const t = v ? v.currentTime : 0;
      ws.forEach(x => { x.w.classList.toggle('on', t >= x.a - .03); x.w.classList.toggle('cur', t >= x.a - .03 && t < x.b + .05); }); requestAnimationFrame(tick); };
    requestAnimationFrame(tick); };
  R.oath = (sc, d, o) => (sc.vid || sc.aud) ? oathV(sc, d, o) : `<figure class="oimg"${S(0, 'fade')} style="aspect-ratio:${sc.img.w}/${sc.img.h}">${cropImg(sc.img, o)}</figure>
    <div class="pad"><div class="oy gold"${S(0)}>${esc(sc.y)}</div><div class="ok"${S(0)}>${esc(sc.k)}</div>
    <blockquote${S(0)} style="transition-delay:.4s">«${esc(sc.q)}»</blockquote><cite${S(0)} style="transition-delay:.6s">${esc(sc.by)}</cite></div>`;

  /* ───────── cards: icons · photo · what-if · good ───────── */
  R.cards = (sc, d, o) => {
    const n = sc.items.length, look = sc.look || 'icons';
    const card = (it, i) => {
      const dl = `transition-delay:${(.15 + i * .14).toFixed(2)}s`;
      if (look === 'photo') return `<div class="cd glass ph"${S(0)} style="${dl}"><figure style="aspect-ratio:${it.img.w}/${it.img.h}">${cropImg(it.img, o)}</figure><div class="tx"><h3>${esc(it.h)}</h3><p>${esc(it.p)}</p></div></div>`;
      if (look === 'good') return `<div class="cd glass"${S(0)} style="${dl}">${it.ic ? `<div class="ci">${ic(it.ic)}</div>` : ''}<div><h3>${esc(it.h)}</h3>${it.p ? `<p>${esc(it.p)}</p>` : ''}</div></div>`;
      /* 23:40 Amr «في سلايد ١١ محتاج خلفية لكل كارت تعبر عن المعنى اللي مكتوب»: a card may carry its own photograph */
      if (it.bg) return `<div class="cd glass hasbg"${S(0)} style="${dl}"><figure class="cbgi"><img src="${U(it.bg.src, o)}" alt=""${it.bg.pos ? ` style="object-position:${it.bg.pos}"` : ''}></figure><h3>${esc(it.h)}</h3>${it.p ? `<p>${esc(it.p)}</p>` : ''}</div>`;   /* 23:48 «الايقونه مالهاش لازمة مش عاوز زحمة بصرية» */
      return `<div class="cd glass"${S(0)} style="${dl}">${it.ic ? `<div class="ci">${ic(it.ic)}</div>` : ''}<h3>${esc(it.h)}</h3>${it.p ? `<p>${esc(it.p)}</p>` : ''}</div>`;
    };
    return `${sc.img ? `<div class="bg cbg ${look}"><img src="${U(sc.img.src, o)}" alt=""></div>` : ''}<div class="pad">
      <h2 class="h2 ct"${S(0)}>${esc(sc.title)}</h2>${sc.sub ? `<div class="cs"${S(0)}>${esc(sc.sub)}</div>` : ''}
      <div class="cg ${look} n${n}">${sc.items.map(card).join('')}</div></div>`;
  };

  /* 00:02 Amr (his 16) «اختار من البرزنتيشن صورة كخلفية لكل كارت وخليها عليها جريدانت او تينت من الوان ايقون كل كارت وما تحذفش الايقون» */
  const sys0 = R.system;
  R.system = (sc, d, o) => { let h = sys0(sc, d, o), i = 0;
    if (sc.items.some(x => x.bg)) h = h.replace(/<div class="node glass"([^>]*)>/g, (m, a) => { const it = sc.items[i++]; return it && it.bg ? `<div class="node glass hasbg"${a}><figure class="nbg"><img src="${U(it.bg.src, o)}" alt=""></figure>` : m; });
    return h; };
  /* ───────── spans: 23:42 Amr «سلايد ١٢ … الداتا اللي فيه واضحة بصريا مش مجرد سرد»: each experience as a bar on one time axis
     (start → start + its years), its picture and name at the head of the row, the key fact under the bar ───────── */
  R.spans = (sc, d, o) => {
    /* 06:34 Amr «في سلايد ١٢ احنا ممكن نكبر الصور على حساب التايم لاين»: the photographs grow (216×144 → 300×160), the time axis gives up the room */
    const [Y0, Y1] = sc.axis, X0 = 130, X1 = 1310, px = (X1 - X0) / (Y1 - Y0), X = y => X1 - (y - Y0) * px;
    const top = 296, rh = 170, ticks = []; for (let y = Y0; y <= Y1; y += 10) ticks.push(y);
    const grid = ticks.map(y => `<div class="sg" style="left:${X(y).toFixed(1)}px"></div><div class="sy" style="left:${X(y).toFixed(1)}px">${y}</div>`).join('');
    const rows = sc.items.map((it, i) => { const y = top + i * rh, xa = X(it.a), xb = X(it.b), dl = (.3 + i * .35).toFixed(2);
      return `<div class="sr"${S(0)} style="top:${y}px;transition-delay:${dl}s">
        <figure class="sth">${cropImg(it.img, o)}</figure><b class="sn">${esc(it.h)}</b>
        <div class="sbar" style="left:${xb.toFixed(1)}px;width:${(xa - xb).toFixed(1)}px;transition-delay:${(+dl + .25).toFixed(2)}s"><span>${esc(it.d).replace(/(\d+)/, '<b>$1</b>')}</span></div>
        <i class="sa" style="left:${xa.toFixed(1)}px">${it.a}</i>
        ${it.m ? `<i class="sm" style="left:${X(it.m.y).toFixed(1)}px"><u></u>${esc(it.m.t)}</i>` : ''}
        <div class="sk" style="right:${(1920 - xa).toFixed(1)}px">${esc(it.k)}</div></div>`; }).join('');
    return `<div class="pad"><h2 class="h2 ct"${S(0)}>${esc(sc.title)}</h2>${sc.sub ? `<div class="cs"${S(0)}>${esc(sc.sub)}</div>` : ''}</div>
      <div class="spans"><div class="sgrid"${S(0, 'fade')}>${grid}</div>${rows}</div>`;
  };

  /* ───────── leaders: three voices under their portraits ───────── */
  R.leaders = (sc, d, o) => `<div class="bg lb"><img src="${U(sc.img.src, o)}" alt=""></div><div class="pad"><div class="lg">${sc.items.map((it, i) =>
    `<div class="lc glass"${S(0)} style="transition-delay:${(.2 + i * .25).toFixed(2)}s"><div class="ln2"><b>${esc(it.n)}</b><span>${esc(it.y)}</span></div><q>${esc(it.q)}</q><cite>${esc(it.s)}</cite></div>`).join('')}</div></div>`;

  /* ───────── stats: a title, the big figures, then every figure of the slide as a card ───────── */
  /* 23 Oct 08:04 Amr (his 119) «تنسيقه غير مفهوم وبيلخبط — اوجد حل ذكي بصريًا»: six equal boxes said six unrelated things. Now the
     figures tell one story: the complexes are counted out as dots (built in gold, under way as rings) beside «16 … in 15 governorates»;
     then what they hold, flowing left: units → investment → jobs */
  /* 08:55 Amr «ماتلزقش الكروت تحت كده، خليك فنان، وخلي الكروت التلات ليها ايقونات دلالية بشفافية لسهولة الفهم البصري السريع»: the hub
     and its three results stand side by side in the middle of the slide (nothing pinned to the bottom edge): on the right the 16
     complexes counted out as dots; on the left the three results stacked on a gold thread, each card carrying its sign large and
     translucent (a factory · coins in a hand · a briefcase) so the eye reads it before the words */
  const hubHTML = (sc, d, o) => { const h = sc.hub, dots = Array.from({ length: h.n + (h.wip || 0) }, (_, i) => `<i class="${i < h.n ? 'on' : 'wip'}" style="transition-delay:${(.5 + i * .06).toFixed(2)}s"></i>`).join('');
    const ic = n => IC[n] ? `<svg class="hic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">${IC[n]}</svg>` : '';
    return `<div class="pad hub">${sc.kick ? `<div class="kick"${S(0)}>${esc(sc.kick)}</div>` : ''}<h2 class="h2 st"${S(0)}>${esc(sc.title)}</h2>${sc.sub ? `<div class="ss"${S(0)}>${esc(sc.sub)}</div>` : ''}
      <div class="hubrow">
        <div class="hubA glass"${S(0)} style="transition-delay:.3s">
          <div class="hv"><div class="l1">${esc(h.pre)}</div><div class="l2">${N(h.v, 'gold')}<u>${esc(h.u)}</u></div><div class="l3">${esc(h.in)} ${N(h.gv, 'gold')} ${esc(h.gu)}</div></div>
          <div class="hdots">${dots}</div>
          ${h.wip ? `<div class="l4"><i class="wip"></i>${esc(h.wpre)} ${N(String(h.wip))} ${esc(h.wu)}</div>` : ''}</div>
        <div class="hubB">${h.flow.map((x, i) => `<div class="hf glass"${S(0)} style="transition-delay:${(1.0 + i * .3).toFixed(2)}s">${ic(x.ic)}<div class="pre">${esc(x.pre)}</div><div class="vu"><span class="v">${N(x.v, 'gold')}</span><span class="u">${esc(x.u)}</span></div></div>`).join('')}</div>
      </div></div>`; };
  R.stats = (sc, d, o) => {
    if (sc.hub) return hubHTML(sc, d, o);
    const it = sc.items || [], n = it.length, cols = sc.cols || (n <= 4 ? n : n === 7 ? 4 : 3);
    const big = (x, i) => `<div class="hb2"${S(0)} style="transition-delay:${(.2 + i * .2).toFixed(2)}s">${x.pre ? `<div class="pre">${esc(x.pre)}</div>` : ''}${x.p && !x.pre ? `<div class="pre">${esc(x.p)}</div>` : ''}<div class="v">${N(x.v, 'gold')}<u>${esc(x.u)}</u></div>${x.p && x.pre ? `<div class="pp">${esc(x.p)}</div>` : ''}</div>`;
    const hero = sc.hero ? [sc.hero] : (sc.hero2 || []);
    /* 11:18 Amr «خلي الصورة خلفية السلايد والكروت ليها شفافية»: a stats slide with bgimg wears its photo full-bleed, the cards glass over it */
    const sbg = sc.bgimg ? `<div class="bg sbgp">${coverFig(sc.bgimg, o, 'sbi')}</div>` : '';
    /* 10:56 Amr «الخريطة بس محتاجينها بنفس اسلوب الخرائط اللي ف الاول والمحافظات الغامقة دي 20 محافظة المرحلة الأولى .. تنور باسمائهم»:
       the grey picture gives way to the deck's own map — the 20 governorates light up north to south, each with its name */
    if (sc.msvg) return `<div class="smap"${S(0, 'fade')}>${sc.msvg}</div>` + R.stats(Object.assign({}, sc, { msvg: null, img: null, _wimg: 1 }), d, o);
    return `${sbg}${sc.img && !sc.bgimg ? `<figure class="simg${sc.img.cap ? ' cap' : ''}${sc.dense ? ' dense' : ''}"${S(0, 'fade')} style="aspect-ratio:${sc.img.w}/${sc.img.h}">${cropImg(sc.img, o)}${sc.img.cap ? `<figcaption>${esc(sc.img.cap)}</figcaption>` : ''}</figure>` : ''}
      <div class="pad${sc.img || sc.bgimg || sc._wimg ? ' wimg' : ''}${sc.bgimg ? ' onbg' : ''}${sc.dense ? ' dense' : ''}">${sc.kick ? `<div class="kick"${S(0)}>${esc(sc.kick)}</div>` : ''}<h2 class="h2 st"${S(0)}>${esc(sc.title)}</h2>${sc.sub ? `<div class="ss"${S(0)}>${esc(sc.sub)}</div>` : ''}
      ${hero.length ? `<div class="hrow">${hero.map(big).join('')}</div>` : ''}
      ${n ? `<div class="sg" style="grid-template-columns:repeat(${cols},1fr)">${it.map((x, i) => `<div class="sc glass"${S(0)} style="transition-delay:${(.5 + i * .12).toFixed(2)}s">${x.pre ? `<div class="pre">${esc(x.pre)}</div>` : ''}<div class="v">${N(x.v, 'gold')}</div><div class="u">${esc(x.u)}</div>${x.p ? `<div class="pp">${esc(x.p)}</div>` : ''}</div>`).join('')}</div>` : ''}
      ${sc.p ? `<p class="sp"${S(0)}>${esc(sc.p)}</p>` : ''}</div>`;
  };

  /* ───────── cmp: before 2014 (right) · 2026 (left) ───────── */
  R.cmp = (sc) => {
    const col = (c, k) => {
      let h = `<div class="yt ${k}">${esc(c.y)}</div>`;
      (c.stats || []).forEach(x => { h += `<div class="cst">${x.pre ? `<div class="pre">${esc(x.pre)}</div>` : ''}<div class="v">${N(x.v, k === 'b' ? 'gold' : '')}<u>${esc(x.u)}</u></div>${x.p ? `<div class="pp">${esc(x.p)}</div>` : ''}</div>`; });
      (c.lines || []).forEach(l => { h += `<div class="cl">${esc(l)}</div>`; });
      if (c.flow) h += `<div class="fl">${c.flow.map(x => x.v != null ? `<b class="fv${k === 'b' ? ' gold' : ''}">${N(x.v)}</b>` : `<span>${esc(x.t)}</span>`).join('')}</div>`;
      return `<div class="cc ${k} glass"${S(0)} style="transition-delay:${k === 'a' ? '.2s' : '.6s'}">${h}</div>`;
    };
    return `<div class="pad">${sc.kick ? `<div class="kick"${S(0)}>${esc(sc.kick)}</div>` : ''}<h2 class="h2 mt"${S(0)}>${esc(sc.title)}</h2>${sc.sub ? `<div class="ms"${S(0)}>${esc(sc.sub)}</div>` : ''}
      <div class="two">${col(sc.a, 'a')}<div class="arw"${S(0)} style="transition-delay:.45s">←</div>${col(sc.b, 'b')}</div></div>`;
  };

  /* ───────── people: four citizens, each with the figure that changed his life ───────── */
  R.people = (sc, d, o) => `<div class="pg4">${sc.items.map((it, i) => `<figure class="pp4"${S(0)} style="aspect-ratio:${it.img.w}/${it.img.h};transition-delay:${(.15 + i * .2).toFixed(2)}s">
    ${cropImg(it.img, o)}<figcaption><div class="v">${N(it.v, 'gold')}<u>${esc(it.u)}</u></div><p>${esc(it.p)}</p></figcaption></figure>`).join('')}</div>`;

  /* ───────── close with the people's portrait (V7 slide 223) ───────── */
  const close0 = R.close;
  R.close = (sc, d, o) => sc.por ? `<div class="por"${S(0, 'fade')}><img src="${U(sc.por.src, o)}" alt=""></div><div class="pad">
    <div class="a"${S(0)}>${esc(sc.a)}</div><div class="b gold"${S(0)} style="transition-delay:.6s">${esc(sc.b)}</div><div class="c2"${S(1)}>${esc(sc.c)}</div></div>` : close0(sc, d, o);

  /* chapter: «التحرك الأول» over the number; pressures: a kicker over the title; shocks: the war on terror under the years */
  const chap0 = R.chapter;
  R.chapter = (sc, d, o) => {
    /* 19:40 «fade loop لكذا صورة بشكل سموز وسريع بنفس المعنى»: the chapter's photos cross-fade behind its name */
    let h = chap0(sc.loop ? Object.assign({}, sc, { bg: null }) : sc, d, o);
    if (sc.pre) h = h.replace('<div class="idx"', `<div class="cpre"${S(0)}>${esc(sc.pre)}</div><div class="idx"`);
    if (sc.loop) h = `<div class="bg lp">${sc.loop.map((p, i) => coverFig(p, o, 'lpi' + (i ? '' : ' on'))).join('')}</div>` + h;
    return h;
  };
  SV.after.chapter = (el, sc, d, o) => {
    if (!sc.loop || o.static || o.thumb) return;
    const f = [...el.querySelectorAll('.bg.lp .lpi')]; let k = 0;
    const tm = setInterval(() => { if (!el.isConnected) return clearInterval(tm); f[k].classList.remove('on'); k = (k + 1) % f.length; f[k].classList.add('on'); }, 2300);
  };
  const pres0 = R.pressures;
  R.pressures = (sc, d, o) => { let h = pres0(sc, d, o); if (sc.kicker) h = h.replace('<h2 class="h2"', `<div class="kick pk"${S(0)}>${esc(sc.kicker)}</div><h2 class="h2"`); return h; };
  const sh0 = R.shocks;
  /* 12:30 Amr «الصدمات اللي حصلت على مصر في كتايم لاين … وبالذات موضوع الارهاب برضو يبقى واضح قوي … في نفس التايم لاين مش منفصلين … تايم لاين
     واحد وواضح … والكلام مقروء»: one axis, 2014 on the right to 2025 on the left, every shock on it at its year; the war on terrorism is the
     red stretch of that same axis from 2014 to 2023, named on a band that stands right over it */
  R.shocks = (sc, d, o) => {
    if (!sc.war) return sh0(sc, d, o);
    /* 13:03 «في التايم لاين شيل العنوان اللي فوق وحط الكلام اللي تحت هو اللي فوق»: the question leads the slide, the old title is gone */
    const top = !!sc.endTop;
    const nodes = [{ y: 2014 }].concat(sc.ev || []), n = nodes.length, X0 = 1760, X1 = 160, step = (X0 - X1) / (n - 1), AY = top ? 620 : 468;
    const xs = nodes.map((_, i) => X0 - i * step), wi = Math.max(1, nodes.findIndex(x => x.y === 2023));
    let h = top ? (sc.end ? `<div class="send top gold"${S(0)}>${esc(sc.end)}</div>` : '') + `<div class="shx">` : `<h2 class="h2 shh"${S(0)}>${esc(sc.title)}</h2><div class="shx">`;
    h += `<div class="sax"${S(0, 'fade')} style="left:${X1 - 40}px;width:${X0 - X1 + 80}px;top:${AY}px"></div>`;
    h += `<div class="sax wseg"${S(0, 'fade')} style="left:${xs[wi]}px;width:${xs[0] - xs[wi]}px;top:${AY - 3}px"></div>`;
    h += `<div class="swar"${S(0, 'fade')} style="left:${xs[wi] - 20}px;width:${xs[0] - xs[wi] + 40}px;top:${AY - 118}px"><span>${esc(sc.war)}</span><b class="num">2014 – 2023</b></div>`;
    nodes.forEach((e, i) => { h += `<div class="sev${i ? '' : ' st'}${i <= wi ? ' iw' : ''}"${S(0, 'fade')} style="left:${xs[i].toFixed(1)}px;top:${AY - 14}px;transition-delay:${(.05 + i * .06).toFixed(2)}s"><i></i><b class="num">${e.y}</b>${e.t ? `<span>${esc(e.t)}</span>` : ''}</div>`; });
    h += `</div>${sc.end && !top ? `<div class="send gold"${S(0)} style="transition-delay:.5s">${esc(sc.end)}</div>` : ''}`;
    return h;
  };

  const title0 = SV.title;
  SV.title = s => s.type === 'oath' ? '2014 · البداية' : s.type === 'people' ? 'المواطن · أرقام' : s.type === 'leaders' ? 'التنمية في تجارب قادة العالم' : s.type === 'gallery' && !s.title ? (s.kick ? s.kick + ' · صور' : 'صور') : title0(s);

  /* ───────── 22 Oct 19:30 Amr: one click per scene; the title sits at the top from the start and the data come in softly;
     no forum mark (the photos take the whole width); 19:31 «كل الارقام المهمة في السرد … الفونت اكبر وداخل tag highlight» ───────── */
  const kq0 = SV.after.kq;
  if (kq0) SV.after.kq = (el, sc, d, o) => {
    kq0(el, sc, d, o);
    if (o.static || o.thumb) return;
    const qt = el.querySelector('.qt'); if (qt) qt.textContent = sc.q;
    el._onenter = () => {};            /* no typing: the question is already in place */
    el._lead = 650;
  };

  /* 19:42 Amr «سلايد ١٩ … شيل المربعات دي والخريطة … طريقة ازكي بصريا … تصميم السلايد بيعبر عن المعنى»: «share» — Egypt's whole area
     as one frame, the inhabited share as a square of the same proportion inside it, growing from 7% to 14% (twice the area) */
  /* 19:49 «في سلايد ٧ استخدم الصور اللي في البرزنتيشن»: the four pressures with the slide's own line icons, its strip of 2014 photographs below */
  /* 23:38 Amr «سلايد ٧ … صور تعبر عن كل مربع … تبقى الصورة هي الخلفية للمربع … مستطيل بالطول بحيث الاربعة يكونو جمب بعض»:
     four tall photo cards side by side, the words at the foot of each (no icons, no strip) */
  const pressPhotos = (sc, d, o) => `<div class="pad pp4"><div class="kick pk"${S(0)}>${esc(sc.kicker)}</div><h2 class="h2"${S(0)}>${esc(sc.title)}</h2></div>
    <div class="pc4">${sc.items.map((it, i) => `<div class="pcx"${S(i + 1)}><figure class="pcb"><img src="${U(it.bg.src, o)}" alt="" style="object-position:${it.bg.pos || '50% 50%'}"></figure><span>${esc(it.t)}</span></div>`).join('')}</div>`;
  R.pressures7 = (sc, d, o) => sc.items[0].bg ? pressPhotos(sc, d, o) : `<div class="strip"${S(0, 'fade')} style="height:${Math.round(1920 * sc.strip.h / sc.strip.w)}px"><figure class="gi sti" style="right:0;top:0;width:1920px;height:100%">${cropImg(sc.strip, o)}</figure></div><div class="pad">
    <div class="kick pk"${S(0)}>${esc(sc.kicker)}</div><h2 class="h2"${S(0)}>${esc(sc.title)}</h2>
    <div class="pg">${sc.items.map((it, i) => `<div class="pc glass"${S(i + 1)}><figure class="pi" style="aspect-ratio:${(it.ic.w * (1 - it.ic.crop[0] - it.ic.crop[2])).toFixed(0)}/${(it.ic.h * (1 - it.ic.crop[1] - it.ic.crop[3])).toFixed(0)}">${cropImg(it.ic, o)}</figure><span>${esc(it.t)}</span></div>`).join('')}</div></div>`;
  /* 23 Oct 07:22 Amr «لو رقم بينزل زي كده حط جمبه مثلث بينزل لتحت زي ما عملت في الفيديو الافتتاحي»: a figure that fell (sc.down —
     357 unsafe areas → 0, 152 → 16.5 thousand feddans, 100 → 25 km) carries a small falling triangle beside it, in its own gold
     (the fall is the achievement); it drops in as the count comes down */
  const DARR = '<i class="darr"><svg viewBox="0 0 20 17"><path d="M10 17 0 0h20z"/></svg></i>';
  const darr = (sc, h) => sc.down ? h.replace(/(<div class="(?:db|sb)"[\s\S]*?<span class="num[^"]*"[^>]*>[^<]*<\/span>)/, `$1${DARR}`) : h;
  const kqR0 = R.kq;
  R.kq = (sc, d, o) => {
    let kb = sc.bgimg ? `<div class="bg kbg">${coverFig(sc.bgimg, o, 'kbi')}</div>` : '';
    /* 00:36 Amr (his 31) «زي بتاع المناطق الغير امنه — لما كارت ٢٠١٤ يظهر صورة المنطقة الغير مخططة ابيض واسود، ولما يطلع كارت ٢٠٢٦
       سموز تظهر صورة تدل على التخطيط العمراني … عشان احس بمعنى قبل وبعد»: the two photographs ride with the two cards */
    if (sc.kind === 'duo' && sc.phx) kb = `<div class="phs phx"><img class="pa" src="${U(sc.phx.a, o)}" alt=""><img class="pb" src="${U(sc.phx.b, o)}" alt=""${sc.phx.bp ? ` style="object-position:${sc.phx.bp}"` : ''}></div>`;
    if (sc.kind === 'duo') {
      /* 19:59 «سلايد ٣٣ … وريني التحدي والتحقيق»: each card names itself at its top.
         23 Oct 00:34 «بدل كلمة التحدي وما تحقق تكون السنين وطبقها على السلايدات الشبيهه»: on every two-card slide the top label
         is the card's year (قبل 2014 · 2026); the year chip under the card goes (said once, at the top) */
      let h = kqR0(sc, d, o);
      if (sc.phx) h = h.replace(/(<div class="db") data-s="1"/, '$1 data-s="2"');
      ['a', 'b'].forEach(k => { const re = new RegExp(`(<div class="d${k}"[^>]*>)([\\s\\S]*?)<span class="yt[^"]*">([\\s\\S]*?)<\\/span>`);
        h = h.replace(re, (m, open, mid, yr) => `${open}<span class="dh${k === 'b' ? ' g' : ''}">${yr}</span>${mid}`); });
      /* 00:12 Amr (his 29) «كلمة عجز يقدر بنحو تبقى فوق الرقم … تنفيذ حوالي تبقى فوق ٢ مليون»: a card's lead-in sits over its figure */
      ['a', 'b'].forEach(k => { if (sc[k].pre) h = h.replace(new RegExp(`(<div class="d${k}"[^>]*>[\\s\\S]*?)<div class="v">`), `$1<div class="dpre">${esc(sc[k].pre)}</div><div class="v">`); });
      if (sc.b.l2) h = h.replace(/(<div class="db"[^>]*>[\s\S]*?<\/p>)/, `$1<div class="dl2">${sc.b.l2ic && KICONS[sc.b.l2ic] ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${KICONS[sc.b.l2ic]}</svg>` : ''}<span>${esc(sc.b.l2)}</span></div>`);
      return kb + darr(sc, h);
    }
    /* 23 Oct 08:35 Amr «في سلايد ٣٠ الرقم بتاع ٢٠١٤ هيكون ظاهر من الاول بدون انميشن»: with sc.aNow the struck figure (and its line)
       stand from the first frame, still — no build, no count */
    if (sc.kind === 'strike' && sc.aNow) { let h = kqR0(sc, d, o);
      h = h.replace(/<div class="sa" data-s="\d+">([\s\S]*?)(<div class="sb")/, (m, body, sb) => `<div class="sa now">${body.replace(/ data-(?:to|from)="[^"]*"/g, '')}${sb}`);
      return kb + darr(sc, h); }
    if (sc.kind !== 'share') return kb + darr(sc, kqR0(sc, d, o));
    const IC2 = typeof KICONS !== 'undefined' ? KICONS : {};
    const icn = IC2[sc.ic] ? `<svg class="qic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${IC2[sc.ic]}</svg>` : '';
    const F = 600, a = parseFloat(sc.a.v) / 100, b = parseFloat(sc.b.v) / 100, sa = Math.sqrt(a) * F, sb = Math.sqrt(b) * F;
    return kb + `<div class="qp glass"><span class="qi">${icn}</span><span class="qt">${esc(sc.q)}</span></div>${sc.k ? `<div class="qk"${S(1)}>${esc(sc.k)}</div>` : ''}
      <div class="kbody"><div class="chart k-share${sc.noframe ? ' nf' : ''}">
        ${sc.noframe ? '' : `<div class="frame"${S(1)} style="width:${F}px;height:${F}px"><span class="fl2">${esc(sc.whole || 'إجمالي مساحة مصر')} · 100%</span>
          <i class="sb" style="width:${sb.toFixed(1)}px;height:${sb.toFixed(1)}px"></i><i class="sa" style="width:${sa.toFixed(1)}px;height:${sa.toFixed(1)}px"></i>
</div>`}
        <div class="nums">
          <div class="na"${S(1)}><span class="yt">${esc(sc.a.y || 'قبل 2014')}</span><div class="v">${SV.h.num(sc.a.v)}</div><p>${esc(sc.a.p || '')}</p></div>
          <div class="arr"${S(1)}>←</div>
          <div class="nb2"${S(1)} style="transition-delay:.9s"><span class="yt b">${esc(sc.b.y || '2026')}</span><div class="v">${SV.h.num(sc.b.v, sc.a.v, 'gold')}</div><p>${esc(sc.b.p || '')}</p></div>
          <div class="x2"${S(1)} style="transition-delay:1.6s"><b>×2</b><span>${esc(sc.x2 || 'ضعف المساحة المعمورة والمستغلة')}</span></div>
        </div></div></div>`;
  };
  const MAG = '(?:ألف|آلاف|الف|مليون|ملايين|مليار|مليارات)';
  const UNIT = '(?:جنيه|دولار|كيلومتر|كم|فدان|م3\\s*/\\s*يوم|م3|ميجاوات|ميجابت|مليون\\s+طن|طن|حاوية|سيارة|راكب|زائر|وحدة\\s+سكنية|وحدة|مشروعًا|مشروع|قرية|مواطن|نسمة|أسرة|طالب\\s*/\\s*فصل|طالب|فصل|مدرسة|مستشفى|جامعات|جامعة|محطات|محطة|ميناء|مطار|مدينة|كوبري|أنفاق|نفق|مكتب|مركز|منشأة|منشآه|عمارة|شركة|متخصص|فرصة\\s+عمل|فرصة|ساعة|ساعات|دقيقة|عامًا|عاما|عام|سنويًا|سنويا|سنوات|جهاز|خدمة|كليات|كلية|محافظات|محافظة|مسجل|مستفيد|منزل|حالة|محورًا|محور|قصر|مكتبة|مجمعًا|مجمع|شونة)';
  const NUMP = '(?:%\\s*\\d[\\d.]*|\\d[\\d,.]*\\s*%?\\+?)(?:\\s*[-–]\\s*\\d[\\d,.]*%?)?';
  const RX = new RegExp(`(${NUMP}(?:\\s+${MAG})?(?:\\s*/?\\s*${UNIT})?)(?![\\u0621-\\u064A\\d])`, 'g');
  const NARR = '.ln,.pd,.psub,.pst .pre,.pst .pp,.gt b,.gt .sub,.gnote span,.cd p,.lc q,.ss,.sp,.cl,.hb2 .pp,.sc .pp,.pad>.p,.qq,.c2,.t-close .a,.t-close .b,.t-close .c,.chip,.qk,.mp p,blockquote,.t-split p,.end,.lead,.cpre,.cs,.cst .pp';
  function hlNums(root) {
    root.querySelectorAll(NARR).forEach(box => {
      if (box.closest('.num,.hl,.qp,svg')) return;
      const tw = document.createTreeWalker(box, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement.closest('.num,.hl,svg,.yt,.tg') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
      const nodes = []; while (tw.nextNode()) nodes.push(tw.currentNode);
      nodes.forEach(n => {
        const t = n.nodeValue; if (/\d{4}\s*\/\s*\d{4}/.test(t)) return;   /* 10:55 a school year («دفعة 2025/2026») stays plain text */
        RX.lastIndex = 0; if (!RX.test(t)) return; RX.lastIndex = 0;
        const f = document.createDocumentFragment(); let k = 0, m;
        while ((m = RX.exec(t))) { if (m.index > k) f.appendChild(document.createTextNode(t.slice(k, m.index)));
          const sp = document.createElement('span'); sp.className = 'hl'; sp.textContent = m[1].trim(); f.appendChild(sp);
          if (/\s$/.test(m[1])) f.appendChild(document.createTextNode(' ')); k = m.index + m[0].length; }
        if (k < t.length) f.appendChild(document.createTextNode(t.slice(k)));
        n.parentNode.replaceChild(f, n);
      });
    });
  }
  const render0 = SV.render;
  /* 19:46 «انيمشن خفيف … على كل صورة سموز وعشوائي»: every photo drifts slowly on its own (a soft zoom and pan, its own direction,
     speed and phase), always still covering its frame */
  function drift(el, o) {
    if (o && (o.static || o.thumb)) return;
    el.querySelectorAll('figure img, .gi img, .gi video').forEach(im => {
      if (im.closest('.rot') || im.dataset.nd) return;
      const r = Math.random, s = 1.05 + r() * .05, m = (s - 1) / 2 * 100 * .8;
      im.style.setProperty('--kx', ((r() * 2 - 1) * m).toFixed(2) + '%'); im.style.setProperty('--ky', ((r() * 2 - 1) * m).toFixed(2) + '%');
      im.style.setProperty('--ks', s.toFixed(3)); im.style.transformOrigin = `${(20 + r() * 60).toFixed(0)}% ${(20 + r() * 60).toFixed(0)}%`;
      const d = 11 + r() * 9; im.style.animation = `svdrift ${d.toFixed(1)}s ease-in-out ${(-r() * d).toFixed(1)}s infinite alternate`;
    });
  }
  /* 00:19 Amr «طريقة الكتابة لازم تراعي ان السطور justify وان الكشيدة سليمة بحيث ماتسيبش فراغات»: every multi-line paragraph is set
     justified the Arabic way — each line (but the last) is filled with kashida (ـ) placed where letters really join (never after
     ا د ذ ر ز و ة ى ء, never inside لا, never in the last letter), the longest words first, up to 5 per word in two places; only a sliver is
     left to the word spaces. Headings and figures are left alone. */
  const KJ_SEL = '.p, p, .pd, .sub, blockquote, .qk, .cs, .psub, .pp, .sk, .t, .dl2 span, figcaption';
  const JOIN = new Set('بتثجحخسشصضطظعغفقكلمنهيئ'.split('')), ARL = /[\u0621-\u064A]/, NOJ = new Set('اأإآدذرزوؤةىء'.split(''));
  function kjWords(el) {
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement.closest('.hl,.num,.kw,svg') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
    const ns = []; while (tw.nextNode()) ns.push(tw.currentNode);
    ns.forEach(n => { const parts = n.nodeValue.split(/(\s+)/); if (parts.length < 2 && !ARL.test(n.nodeValue)) return; const f = document.createDocumentFragment();
      parts.forEach(t => { if (!t) return; if (/^\s+$/.test(t)) f.appendChild(document.createTextNode(t)); else { const s = document.createElement('k-w'); s.className = 'kw'; s.textContent = t; f.appendChild(s); } });
      n.parentNode.replaceChild(f, n); });
  }
  function kjSpots(w) {   /* insertion points inside a word: after a joining letter that is followed by a letter (not the لا ligature) */
    const c = [...w], out = [];
    for (let i = 0; i < c.length - 1; i++) if (JOIN.has(c[i]) && ARL.test(c[i + 1]) && c[i + 1] !== 'ء' && !(c[i] === 'ل' && 'اأإآ'.includes(c[i + 1]))) out.push(i + 1);
    return out;
  }
  /* 23 Oct 07:12 Amr «الكشيدة والمحاذاة في كل السلايدات» (his example: a three-line question set ragged): EVERY block of Arabic
     words that runs to two lines or more is set the same way — found on the slide itself, not from a list of classes:
       · its lines are first evened out (a title: balanced lines; a paragraph: no word left alone on its last line);
       · a title (or a block much wider than its words) closes up on its longest line, so nothing is stretched to an empty edge;
       · every line but the last is then filled to that measure with kashida where the letters really join; a sliver is left to
         the spaces. Figures, number chips, typed titles and the big part numerals are left alone. */
  function kjCands(root) {
    const set = new Set(), out = [];
    root.querySelectorAll('*').forEach(e => {
      if (e.closest('.num,.hl,svg,.qt,.snum,.kw,.darr')) return;
      if (![...e.childNodes].some(n => n.nodeType === 3 && ARL.test(n.nodeValue))) return;
      for (let a = e.parentElement; a && a !== root; a = a.parentElement) if (set.has(a)) return;
      set.add(e); out.push(e);
    });
    return out;
  }
  function kjBlock(el) {
    if (el._kj || !el.isConnected || !ARL.test(el.textContent)) return; el._kj = 1;
    let cs = getComputedStyle(el);
    /* a row or grid of items (a chip, a pill, a figure with its unit) is laid out by its items, not by lines of words: left alone */
    if (cs.display === 'none' || /flex|grid/.test(cs.display) || cs.direction !== 'rtl' || /^(nowrap|pre)$/.test(cs.whiteSpace)) return;
    if (el.textContent.trim().split(/\s+/).filter(w => ARL.test(w)).length < 3) return;   /* a figure and its unit is a label, not a text */
    { const r = document.createRange(); r.selectNodeContents(el); const rs = [...r.getClientRects()].filter(x => x.width > 2 && x.height > 2).sort((a, b) => a.top - b.top);
      let n = 0, last = -1e9; rs.forEach(x => { if (x.top - last > x.height * .45) { n++; last = x.top; } }); if (n < 2) return; }   /* one line: nothing to justify */
    el._kjs = { w: el.style.width, mw: el.style.maxWidth, tw: el.style.textWrap, ml: el.style.marginLeft, mr: el.style.marginRight, d: el.style.display };
    if (cs.display === 'inline') {   /* a run of words that is its block's only text becomes a block of its own */
      const par = el.parentElement; if (!par || par.textContent.trim() !== el.textContent.trim()) return;
      el.style.display = 'block'; cs = getComputedStyle(el);
    }
    if (el.clientWidth < 200) return;
    const fs = parseFloat(cs.fontSize), head = fs >= 44 || /^H[1-3]$/.test(el.tagName);
    el.style.textWrap = head ? 'balance' : 'pretty';
    kjWords(el);
    const items = [...el.querySelectorAll('.kw,.hl,.num')].filter(x => !x.parentElement.closest('.hl,.num'));
    if (items.length < 3) return;
    const measure = () => { const ls = []; items.forEach(x => { const t = x.offsetTop; let L = ls.find(l => Math.abs(l.t - t) < 6); if (!L) ls.push(L = { t, xs: [] }); L.xs.push(x); });
      ls.sort((a, b) => a.t - b.t); ls.forEach(L => { L.l = Math.min(...L.xs.map(x => x.offsetLeft)); L.r = Math.max(...L.xs.map(x => x.offsetLeft + x.offsetWidth)); L.w = L.r - L.l; }); return ls; };
    let lines = measure(); if (lines.length < 2) return;
    /* a narrow column of one or two words a line cannot be justified without holes: it keeps its even lines, ragged */
    if (items.length / lines.length < 2.5) { el.style.textWrap = 'balance'; return; }
    const pl = parseFloat(cs.paddingLeft) || 0, pr = parseFloat(cs.paddingRight) || 0, inner = el.clientWidth - pl - pr;
    const lw = Math.max(...lines.map(L => L.w));
    const sig = ls => ls.map(L => L.xs[0]).join ? ls.map(L => items.indexOf(L.xs[0])).join(',') : '';
    if ((head || lw < inner * .9) && !el.querySelector('.num')) {
      const bb = cs.boxSizing === 'border-box' ? pl + pr + (parseFloat(cs.borderLeftWidth) || 0) + (parseFloat(cs.borderRightWidth) || 0) : 0;
      el.style.maxWidth = 'none'; el.style.width = Math.ceil(lw + 2 + bb) + 'px';
      if (cs.textAlign === 'center') { el.style.marginLeft = 'auto'; el.style.marginRight = 'auto'; }
    }
    /* the even lines are found by the browser (balance / pretty); they are then held as plain lines at that measure, because a
       balancing browser would re-break them as soon as the kashidas lengthen a line. If plain breaking would not give the same
       lines back, the block keeps its first, plain setting (no closing up) */
    const want = sig(lines); el.style.textWrap = 'wrap';
    let held = measure();
    if (sig(held) !== want) { el.style.width = el._kjs.w; el.style.maxWidth = el._kjs.mw; el.style.marginLeft = el._kjs.ml; el.style.marginRight = el._kjs.mr; held = measure(); }
    lines = held; if (lines.length < 2 || items.length / lines.length < 2.5) return;
    const probe = document.createElement('k-w'); probe.className = 'kw'; probe.textContent = 'ـــــــــــــــــــ'; el.appendChild(probe); const tw = probe.offsetWidth / 10; probe.remove();
    if (!(tw > 1)) return;
    const W = el.clientWidth - pl - pr, ta0 = el.style.textAlign;
    /* the lines are filled while the block is set flush (not yet justified), so what is measured is the words, not stretched
       spaces; kashidas go in one at a time — longest words first, where they join last (then where they join first) — and each
       line is measured again until it is closed. A line that cannot be closed without holes leaves the block flush (ragged but
       even), never spaced out */
    el.style.textAlign = cs.textAlign === 'center' ? 'center' : 'right';
    const done = []; let open = 0;
    lines.slice(0, -1).forEach(L => {
      const words = L.xs.filter(x => x.classList.contains('kw')).map(x => ({ x, b: [...x.textContent], s: kjSpots(x.textContent), k: 0 })).filter(o => o.s.length)
        .sort((a, b) => b.b.length - a.b.length);
      const ext = () => Math.max(...L.xs.map(x => x.offsetLeft + x.offsetWidth)) - Math.min(...L.xs.map(x => x.offsetLeft));
      if (!words.length) { if (W - ext() > Math.max(3 * tw, W * .06)) open++; return; }
      const MA = head ? (words.length <= 3 ? 9 : 6) : (words.length <= 3 ? 5 : 3), MB = head ? (words.length <= 3 ? 5 : 3) : (words.length <= 3 ? 3 : 2);
      words.forEach(o => { o.u = new Map(); o.p = [o.s[o.s.length - 1]]; if (o.s.length > 1 && o.s[0] < o.s[o.s.length - 1] - 1) o.p.push(o.s[0]); o.x._orig = o.x.textContent; done.push(o); });
      const put = o => { const c = o.b.slice(); [...o.u.keys()].sort((x, y) => y - x).forEach(at => c.splice(at, 0, 'ـ'.repeat(o.u.get(at)))); o.x.textContent = c.join(''); };
      const top0 = L.xs[0].offsetTop; let g = 400;
      while (g-- > 0) {
        if (W - ext() < tw * 1.3) break;
        const can = words.filter(o => (o.u.get(o.p[0]) || 0) < MA || (o.p[1] != null && (o.u.get(o.p[1]) || 0) < MB));
        if (!can.length) break;
        const o = can.reduce((m, x) => x.k < m.k ? x : m, can[0]);
        const a = o.p[0], b = o.p[1], ua = o.u.get(a) || 0, ub = b != null ? (o.u.get(b) || 0) : 99, at = (ua < MA && (ua <= ub || ub >= MB)) ? a : b;
        o.u.set(at, (o.u.get(at) || 0) + 1); o.k++; put(o);
        if (L.xs.some(x => Math.abs(x.offsetTop - top0) > 6)) { o.u.set(at, o.u.get(at) - 1); o.k--; put(o); break; }
      }
      if (W - ext() > Math.max(3 * tw, W * .06)) open++;
    });
    el.style.textAlign = ta0;
    if (open) { done.forEach(o => { if (o.x._orig != null) { o.x.textContent = o.x._orig; o.x._orig = null; } }); return; }
    const ta = cs.textAlign; el.classList.add('kjd'); if (ta === 'center') el.style.textAlignLast = 'center'; else if (ta === 'left') el.style.textAlignLast = 'left';
  }
  function kashida(el) { kjCands(el).forEach(b => { try { kjBlock(b); } catch (e) {} }); }
  /* 23 Oct 06:49 Amr (slide 10) «عاوز العنوان والكروت تظهر مع بعض من الاول، لكن لما يظهر يصغر شوية كارت ادارة التدهور ويكبر شوية كارت
     تحمل تكلفة الاصلاح، والهاي لايت اللي وراه يكون فيه انميشن خفيف سموز يبين ان ده كان اختيارنا»: the title and both cards come in
     together; then the choice is made — the decline steps back and dims, the reform card steps forward with a slow living glow
     behind it; then the closing line */
  R.split = (sc) => `<div class="pad"><h2 class="h2"${S(0)}>${esc(sc.title)}</h2><div class="two">
    <div class="halo"></div>
    <div class="card glass a"${S(0)}><i class="ring"></i><h3>${esc(sc.a.h)}</h3><p>${esc(sc.a.p)}</p></div>
    <div class="card glass b"${S(0)} style="transition-delay:.15s"><h3>${esc(sc.b.h)}</h3><p>${esc(sc.b.p)}</p></div>
    <i class="pick"${S(1)}></i></div>
    <div class="end gold"${S(2)}>${esc(sc.end)}</div></div>`;

  /* 06:42 Amr «عاوز خلفيات الصفحات اللي من غير صور تتنوع خلفياتها بس بألوان العرض بأسلوب زي ده مع مراعاة التباين»: a slide with no
     photograph sits on soft light — amber and deep blue glows over the night base (six arrangements, one per slide in turn), slowly
     breathing; the middle is kept dark so the words read */
  const MEDIA = '.bg img,.bg video,.kbg,.phs,.gal,.pbg2,.poster,iframe,video,.mapw,.por,.lb,.oimg,.sbg,.lp,.hbi,.pg4,.nbg,.pph';
  function mesh(el, sc, i, o) {
    if (!sc || ['film', 'map', 'gallery', 'proj', 'hero', 'chapter', 'leaders', 'people'].includes(sc.type)) return;
    if (el.querySelector(MEDIA)) return;
    const k = sc.type === 'section' ? 2 + (i % 2) * 3 : (i * 5 + 1) % 6;
    const m = document.createElement('div'); m.className = 'mesh m' + k; el.insertBefore(m, el.firstChild); el.classList.add('hasmesh');
  }
  SV.render = function (deck, i, o) { const el = render0.call(this, deck, i, o); if (deck && deck.id === 'sv7') { try { mesh(el, deck.scenes[i], i, o); } catch (e) {} const sc = deck.scenes[i]; if (sc && sc.gap) el._gap = sc.gap; el.querySelectorAll('[style*="transition-delay"]').forEach(n => { const m = /transition-delay:\s*([\d.]+)s/.exec(n.getAttribute('style')); if (m) n.style.transitionDelay = (parseFloat(m[1]) * SV.speed).toFixed(2) + 's'; }); if (sc && sc.lead) el._lead = sc.lead; if (sc && sc.type === 'map' && SV.newPorts) el.querySelectorAll('.ly-ports .pin').forEach((g, i) => { if (SV.newPorts[i]) g.classList.add('newp'); }); if (sc && sc.type === 'map') el.querySelectorAll('.ly-tunnels .pin .pop').forEach((g, i) => {
      /* 10:40 Amr «الخريطة اللي مكتوب عليها نفقا دي معناها رايح جاي نفقين فعبر عنها بخطين، ولو عرفت بالانيمشن تبين ده»: each «نفقا»
         (two tunnels, one each way) is two bars under the canal, a flow running east on one and west on the other; the single tunnel
         (Ahmed Hamdy 2) one bar. The tunnel pins come in the geo order: تحيا مصر · 3 يوليو · أحمد حمدي 2 */
      const W = 30, twin = i < 2, prg = g.querySelector('.prg');
      const bar = (y, dir) => `<rect x="${-W}" y="${y - 3.5}" width="${2 * W}" height="7" rx="3.5" class="dot"/><line class="tfl ${dir}" x1="${-W + 5}" y1="${y}" x2="${W - 5}" y2="${y}"/>` +
        (dir === 'e' ? `<path class="tah" d="M${W + 3},${y - 5} l8,5 l-8,5z"/>` : dir === 'w' ? `<path class="tah" d="M${-W - 3},${y - 5} l-8,5 l8,5z"/>` : '');
      g.innerHTML = (prg ? prg.outerHTML : '') + (twin ? bar(-8, 'e') + bar(8, 'w') : bar(0, 'b')); g.classList.add('tw'); }); if (sc && sc.still) el.classList.add('nomo'); if (sc && sc.same && sc.type === 'map' && el._onstep) { const f = el._onstep;
      /* 08:40: «same» — a map whose later steps only move the camera: the first step's panel and labels stay on, untouched */
      el.querySelectorAll('.mp:not([data-st="0"]),.mn[data-st]:not([data-st="0"]),.mlabels:not([data-st="0"])').forEach(n => n.remove());
      el._onstep = (k, i) => { f(k, i); el.querySelectorAll('.mp[data-st="0"],.mn[data-st="0"],.mlabels[data-st="0"]').forEach(n => n.classList.add('cur')); }; }
      /* 11:57 Amr «في سلايد ٥٠ ما تخفيش الكلام صمم بحيث الكلام يزيد»: «acc» — a later step's words join the first panel under what is
         already said (its paragraph and chips), nothing said before leaves the screen */
      if (sc && sc.acc && sc.type === 'map' && el._onstep) { const f2 = el._onstep, p0 = el.querySelector('.mp[data-st="0"]');
        if (p0) { p0.classList.add('acc');
          el.querySelectorAll('.mp:not([data-st="0"])').forEach(p => { const b = document.createElement('div'); b.className = 'macc'; b.dataset.k = p.dataset.st;
            p.querySelectorAll(':scope > p, :scope > .mchips, :scope > .pace').forEach(x => b.appendChild(x)); p0.insertBefore(b, p0.querySelector(':scope > .mfoot')); p.remove(); });
          el._onstep = (k, i) => { f2(k, i); p0.classList.add('cur'); p0.querySelectorAll('.macc').forEach(b => b.classList.toggle('on', +b.dataset.k <= k)); }; } } try { hlNums(el); } catch (e) {} try { drift(el, o); } catch (e) {}
      if (!(o && o.thumb)) kjRun(el); } return el; };
  /* 00:19 kashida only once the slide is on the page AND its own faces are in: two frames after it is connected the browser has
     asked for the weights it uses; fonts.ready then waits for them — measured with a stand-in font the lines broke elsewhere and
     the kashidas went to the wrong line (slide 28's card). If a face still lands later, every slide on screen is redone. */
  function kjRun(el) {
    const go = () => { if (!el.isConnected) return requestAnimationFrame(go);
      requestAnimationFrame(() => requestAnimationFrame(() => (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => kashida(el)))); };
    go();
  }
  function kjReset(el) { el.querySelectorAll('.kw').forEach(w => { if (w._orig != null) { w.textContent = w._orig; w._orig = null; } });
    el.querySelectorAll('.kjd').forEach(b => { b.classList.remove('kjd'); b.style.textAlignLast = ''; });
    el.querySelectorAll('*').forEach(b => { if (b._kjs) { const k = b._kjs; b.style.width = k.w; b.style.maxWidth = k.mw; b.style.textWrap = k.tw; b.style.marginLeft = k.ml; b.style.marginRight = k.mr; b.style.display = k.d; b._kjs = null; } b._kj = 0; }); }
  if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', () =>
    document.querySelectorAll('.sv:not(.static):not(.leave)').forEach(el => { kjReset(el); kashida(el); }));
  /* 23 Oct 00:21 Amr «لما يكون عندي خريطة خلي النقطة ديناميك لووب»: on a map every place's dot breathes — a ring of its colour
     spreads out from it and fades, over and over, each dot a little out of step with the others so the map ripples, not blinks */
  /* 23 Oct 07:50 Amr (his 62) «عيد تنسيق الخريطة والصور ولو عندك رؤية افضل للخريطة نفذها»: a map may carry the project's own
     photographs (sc.pics), set as two cards in the empty western desert of the map — the network on the map, the work in the photos */
  const mapPics = (sc, o) => `<div class="mpics">${sc.mpics.map((p, i) => `<figure class="mpic"${S(sc.mpicsAt || 0, 'fade')} style="transition-delay:${(.5 + i * .25).toFixed(2)}s">${cropImg(p, o)}${p.cap ? `<figcaption>${esc(p.cap)}</figcaption>` : ''}</figure>`).join('')}</div>`;
  { const _map = R.map; R.map = (sc, d, o) => { let h = _map(sc, d, o); if (sc.mpics) h += mapPics(sc, o); if (o && (o.thumb || o.static)) return h; let n = 0;
      let out = h.replace(/<g class="pop"([^>]*)>(<(?:circle|rect|path)[^>]*?(?: r="([\d.]+)")?[^>]*>)/g, (m, a, sh, r) =>
        `<g class="pop"${a}><circle class="prg" r="${r || 7}" style="animation-delay:${(-((n++ * 0.53) % 2.6)).toFixed(2)}s"/>${sh}`);
      /* 10:40 Amr «الخريطة اللي مكتوب عليها نفقا دي معناها رايح جاي نفقين فعبر عنها بخطين، ولو عرفت بالانيمشن تبين ده»: each «نفقا»
         (two tunnels — one each way) is drawn as two bars under the canal, a flow running east on one and west on the other;
         the single tunnel (Ahmed Hamdy 2) one bar, its flow both ways. Order of the tunnel pins: تحيا مصر · 3 يوليو · أحمد حمدي 2 */
      return mapPace(sc, out); };
    /* 00:20 «في سلايد ٢٠ فيه كلكعة في الكتابة»: a panel's «pace» rows — figure, then what it counts — in place of a long sentence */
    /* 06:09 «سلايد ٢٠ الجزء اليمين زحمة نسقه وراعي المحاذاة»: the total stands alone; one bar splits it in proportion — the old
       cities (grey) and the new (gold) — and under each part, at its own edge, its figure and what it took */
    function splitHTML(parts) {
      const T = parts.reduce((a, x) => a + parseFloat(x.v), 0);
      return `<div class="msplit"><div class="sb">${parts.map((x, i) => `<i class="${x.c}" style="width:${(parseFloat(x.v) / T * 100).toFixed(2)}%;transition-delay:${(.35 + i * .45).toFixed(2)}s"></i>`).join('')}</div>
        <div class="sl">${parts.map((x, i) => `<div class="${x.c}" style="width:${(parseFloat(x.v) / T * 100).toFixed(2)}%;transition-delay:${(.55 + i * .45).toFixed(2)}s"><b class="num${x.c === 'new' ? ' gold' : ''}">${esc(x.v)}</b><span>${esc(x.t)}</span>${x.s ? `<small>${esc(x.s)}</small>` : ''}</div>`).join('')}</div></div>`;
    }
    function mapPace(sc, h) {
      (sc.st || []).forEach((s, k) => { if (!s.pace && !s.split) return;
        const i = h.indexOf(`data-st="${k}">`, h.indexOf('<div class="mpanel">')); if (i < 0) return;
        const ends = ['<div class="leg">', '<div class="mchips">', '<div class="mfoot">', '<div class="mp ', '<div class="mdots">'].map(x => h.indexOf(x, i)).filter(x => x > 0);
        const j = Math.min(...ends);
        const pace = s.split ? splitHTML(s.split) : `<div class="pace">${s.pace.map(r => `<div class="pr ${r[2] || ''}"><b class="num${r[2] === 'g' ? ' gold' : ''}">${esc(r[0])}</b><span>${esc(r[1])}</span></div>`).join('')}</div>`;
        h = h.slice(0, j) + pace + h.slice(j); });
      return h;
    } }
  const css = `
/* 23 Oct 07:03 Amr «استخدم الفونت ده في كل أرقام البرزنتيشن» (Bebas Neue): every figure in the deck — digits, %, + − . , — is set in
   Bebas Neue (fonts/sv/bebas-neue-latin-400.woff2, OFL, offline); the Arabic letters keep their own faces */
@font-face{font-family:SVnum;src:url(../fonts/sv/bebas-neue-latin-400.woff2) format('woff2');font-weight:100 900;font-display:block;size-adjust:108%;unicode-range:U+0025,U+002B-002E,U+0030-0039,U+00B1,U+2013,U+2212}
:root,.sv{--fd:'SVnum','SVd','SVb',system-ui,sans-serif;--fb:'SVnum','SVb','SVd',system-ui,sans-serif}
.sv .num{letter-spacing:.01em}


.sv .flp{position:absolute;inset:0;display:block}
.sv .flp>img:not(.cr){width:100%;height:100%;display:block;object-fit:fill}
/* pressures7 */
.sv.t-pressures7 .strip{position:absolute;left:0;right:0;bottom:0;z-index:1;overflow:hidden}
.sv.t-pressures7 .strip .gi{position:absolute;margin:0;box-shadow:none}
.sv.t-pressures7 .strip::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,#05070c 0%,rgba(5,7,12,.35) 22%,rgba(5,7,12,.05) 55%,rgba(5,7,12,.35) 100%)}
.sv.t-pressures7 .strip .gi img{filter:grayscale(.35) contrast(1.05) brightness(.9)}
.sv.t-pressures7 .pad{justify-content:flex-start;padding-top:110px;text-align:center;align-items:center}
.sv.t-pressures7 .h2{font-size:70px;margin:8px 0 40px}
.sv.t-pressures7 .pg{display:grid;grid-template-columns:repeat(4,1fr);gap:26px;width:100%}
.sv.t-pressures7 .pc{display:flex;flex-direction:column;align-items:center;gap:18px;padding:30px 26px 32px;border-radius:30px;min-height:0;background:linear-gradient(145deg,rgba(14,18,28,.82),rgba(10,13,22,.7))}
.sv.t-pressures7 .pi{position:relative;margin:0;height:104px;overflow:hidden;filter:invert(1) sepia(.5) saturate(2.4) hue-rotate(-12deg) brightness(.95)}
.sv.t-pressures7 .pi img{animation:none!important}
.sv.t-pressures7 .pc span{font:600 34px/1.35 var(--fd)}
/* kq with a photograph behind it */
.sv.t-kq .bg.kbg{z-index:0}
.sv.t-kq .bg.kbg::after{background:radial-gradient(1200px 700px at 50% 55%,rgba(4,6,11,.78),rgba(4,6,11,.6) 70%,rgba(4,6,11,.75)),linear-gradient(0deg,rgba(4,6,11,.85),rgba(4,6,11,.4) 60%,rgba(4,6,11,.85))}
/* 19:47 «سلايد ٣٠ وسطن الكلام … align … الفريم مش فقير»: duo — two glass cards, centred, the arrow between them */
.sv.t-kq .kbody:has(.k-duo){justify-content:center}
.sv.t-kq .chart.k-duo{gap:110px;margin:0;position:relative;align-items:stretch}
.sv.t-kq .k-duo .da,.sv.t-kq .k-duo .db{width:640px;min-height:520px;padding:46px 44px 40px;border-radius:36px;justify-content:center;gap:6px;
  background:linear-gradient(145deg,rgba(255,255,255,.11),rgba(255,255,255,.035) 55%,rgba(255,255,255,.06));border:1px solid var(--edge);-webkit-backdrop-filter:blur(26px);backdrop-filter:blur(26px);box-shadow:0 30px 80px -30px rgba(0,0,0,.65),inset 0 1px 0 rgba(255,255,255,.18)}
.sv.t-kq .k-duo .db{border-color:rgba(233,188,108,.5);box-shadow:0 0 0 1px rgba(233,188,108,.15),0 40px 90px -40px rgba(233,188,108,.4),inset 0 1px 0 rgba(255,255,255,.18)}
.sv.t-kq .k-duo .db .v .num{font-size:200px}.sv.t-kq .k-duo .da .v .num{font-size:170px}
.sv.t-kq .k-duo p{max-width:540px;margin-top:18px}
.sv.t-kq .k-duo .yt{margin-top:22px}
.sv.t-kq .chart.k-duo::after{content:'←';position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font:600 70px/1 var(--fd);color:var(--acc)}
/* 19:46 «سلايد ٢٨ صور الريس يمين والكلام يسار» */
.sv.t-quote .por{left:auto;right:0}
.sv.t-quote .por img{object-position:14% 22%;-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 21%);mask-image:linear-gradient(90deg,transparent 0%,#000 21%)}
.sv.t-quote .por:has(img[src*="image125c"])::before{background:radial-gradient(52% 58% at 38% 34%,rgba(214,176,110,.22),rgba(214,176,110,0) 70%)}
.sv.t-quote .por img[src*="image125c"]{object-position:30% 100%;transform:translateX(-130px);-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 26%);mask-image:linear-gradient(90deg,transparent 0%,#000 26%)}
.sv.t-quote .pad{padding-left:170px;padding-right:960px}
/* 19:57 «يظبط وضعية صورة الرئيس حسب الجولد ريشيو … مش مضرة للعين»: the cut-out stands on the frame's bottom and right edges (its own cut
   edges, so nothing ends mid-frame), sized so the eyes sit on the upper golden line (y 412 = 0.382·1080); the photo holds the right
   61.8%, the words the left 38.2% */
.sv.t-quote .por:has(img[src*="image125c"]){left:auto;right:0;top:auto;bottom:0;width:1129px;height:922px}
.sv.t-quote .por img[src*="image125c"]{object-fit:fill;object-position:0 0;transform:none;-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 15%);mask-image:linear-gradient(90deg,transparent 0%,#000 15%)}
.sv.t-quote .por:has(img[src*="image125c"])::before{background:radial-gradient(38% 44% at 55% 27%,rgba(214,176,110,.2),rgba(214,176,110,0) 70%)}
.sv.t-quote:has(img[src*="image125c"]) .pad{padding-left:130px;padding-right:1140px}
.sv.t-quote:has(img[src*="image125c"]) blockquote{font-size:68px}
.sv.t-quote:has(img[src*="image125c"]) .q2{font-size:42px}
@keyframes svdrift{from{transform:scale(1.015) translate(0,0)}to{transform:scale(var(--ks,1.07)) translate(var(--kx,0),var(--ky,0))}}
.sv .gi,.sv figure{overflow:hidden}
.sv .gi.sm figcaption{font-size:20px;padding:7px 10px 8px}
.sv.t-gallery .gt{top:96px}

/* 19:42 kq «col»: the before/after columns stand on one base line (a caption under a year no longer lifts its column) */
.sv.t-kq .k-col .cc{position:relative}
.sv.t-kq .k-col .cx{position:absolute;top:100%;left:-30px;right:-30px;max-width:none}
.sv.t-kq .kbody:has(.k-col){top:268px;bottom:40px;justify-content:flex-start}
.sv.t-kq .k-col .cc{justify-content:flex-end;height:703px}
/* spans (his 12) */
.sv.t-spans .pad{position:absolute;top:0;left:0;right:0;bottom:auto;display:block;padding:118px 110px 0}.sv.t-spans .ct{font-size:66px;text-align:center}.sv.t-spans .cs{text-align:center;font:500 34px/1.3 var(--fd);color:var(--gold2);margin-top:10px}
.sv.t-spans .spans{position:absolute;inset:0;direction:ltr}
.sv.t-spans .sg{position:absolute;top:270px;height:690px;width:1px;background:rgba(255,255,255,.1)}
.sv.t-spans .sy{position:absolute;top:968px;transform:translateX(-50%);font:600 26px/1 var(--fn,var(--fd));color:var(--mute)}
.sv.t-spans .sr{position:absolute;left:0;right:0;height:150px}
.sv.t-spans .sth{position:absolute;right:240px;top:-8px;width:216px;height:144px;margin:0;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px -10px rgba(0,0,0,.8)}
.sv.t-spans .sn{position:absolute;right:430px;top:30px;width:0;display:none}
.sv.t-spans .sr .sn{display:block;right:60px;top:34px;width:180px;text-align:right;direction:rtl;font:600 38px/1.15 var(--fd);color:var(--fg)}
.sv.t-spans .sbar{position:absolute;top:26px;height:72px;border-radius:14px;background:linear-gradient(90deg,#b47a33,var(--gold2) 70%,#f3d08a);box-shadow:0 0 50px -12px rgba(233,188,108,.7);transform-origin:100% 50%;transform:scaleX(0);transition:transform 1.4s var(--e1);display:flex;align-items:center;justify-content:center}
.sv.t-spans .sr.on .sbar,.sv.t-spans.static .sbar,.sv.t-spans .sr[data-s].in .sbar{transform:none}
.sv.t-spans .sbar span{direction:rtl;font:600 28px/1 var(--fd);color:#1a1206;white-space:nowrap;display:flex;align-items:center;gap:10px}.sv.t-spans .sbar span b{font:800 58px/1 var(--fd)}
.sv.t-spans .sbar{height:84px!important;top:20px!important}
.sv.t-spans .sa{position:absolute;top:-8px;transform:translateX(-50%);font:600 24px/1 var(--fd);font-style:normal;color:var(--gold2)}
.sv.t-spans .sm{position:absolute;top:-14px;transform:translateX(-50%);font:500 22px/1 var(--fb);font-style:normal;color:#e3e6ec;white-space:nowrap;direction:rtl}
.sv.t-spans .sm u{position:absolute;left:50%;top:34px;width:12px;height:12px;margin-left:-6px;border-radius:50%;background:#fff;box-shadow:0 0 0 4px rgba(255,255,255,.18)}
.sv.t-spans .sk{position:absolute;top:110px;direction:rtl;text-align:right;font:500 25px/1.3 var(--fb);color:#c9ced8;white-space:nowrap}
/* abstract cover: foundation (his 14) */
.sv .absf{position:absolute;inset:0;z-index:0;background:radial-gradient(1200px 700px at 50% 38%,#141826,#05060a 72%)}
.sv .absf svg{position:absolute;inset:0;width:100%;height:100%}
.sv .absf .fgrid line{stroke:#e9bc6c;stroke-opacity:.07;stroke-width:1}
.sv .absf .fbase{stroke:#f3d08a;stroke-width:2;stroke-opacity:.8;transform-box:fill-box;transform-origin:50% 50%;transform:scaleX(0);transition:transform 1.4s var(--e1) .1s}
.sv .absf .fb{fill:none;stroke:#e9bc6c;stroke-opacity:.7;stroke-width:1.5;opacity:0;transform-box:fill-box;transform-origin:50% 100%;transform:translateY(-26px);transition:transform .9s cubic-bezier(.2,.8,.2,1),opacity .6s ease}
.sv .absf .fb.cap{fill:url(#fcp);stroke-opacity:.9;filter:drop-shadow(0 0 14px rgba(243,208,138,.55))}
.sv .absf .fcurve{fill:none;stroke:#f3d08a;stroke-width:2.5;stroke-opacity:.9;stroke-dasharray:2400;stroke-dashoffset:2400;transition:stroke-dashoffset 2.2s ease 1.6s;filter:drop-shadow(0 0 8px rgba(243,208,138,.6))}
.sv.on .absf .fbase,.sv.on .absf .fb,.sv.static .absf .fbase,.sv.static .absf .fb{transform:none;opacity:1}
.sv.on .absf .fcurve,.sv.static .absf .fcurve{stroke-dashoffset:0}
.sv.static .absf *{transition:none!important}
.sv.t-section:has(.absf) .pad{justify-content:flex-start;padding-top:260px}
.sv.t-pressures7 .pad.pp4{padding-top:96px}
.sv.t-pressures7 .pc4{position:absolute;left:110px;right:110px;top:300px;bottom:80px;display:grid;grid-template-columns:repeat(4,1fr);gap:28px;direction:rtl}
.sv.t-pressures7 .pcx{position:relative;border-radius:30px;overflow:hidden;background:#0b0d14;border:1px solid rgba(255,255,255,.14);box-shadow:0 40px 80px -40px rgba(0,0,0,.9);display:flex;align-items:flex-end}
.sv.t-pressures7 .pcb{position:absolute;inset:0;margin:0;overflow:hidden}.sv.t-pressures7 .pcb img{width:100%;height:100%;object-fit:cover;display:block}
.sv.t-pressures7 .pcx::before{content:'';position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(4,6,11,0) 35%,rgba(4,6,11,.55) 62%,rgba(4,6,11,.93) 100%)}
.sv.t-pressures7 .pcx span{position:relative;z-index:2;padding:0 30px 36px;font:600 40px/1.35 var(--fd);color:#fff;text-shadow:0 2px 20px rgba(0,0,0,.6)}
.sv.t-system .node.hasbg{position:relative;overflow:hidden;background:#07090f}
.sv.t-system .node .nbg{position:absolute;inset:0;margin:0;z-index:0;overflow:hidden}.sv.t-system .node .nbg img{width:100%;height:100%;object-fit:cover;display:block;filter:saturate(.85)}
.sv.t-system .node.hasbg::before{content:'';position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,color-mix(in srgb,var(--c) 42%,rgba(5,7,12,.35)) 0%,color-mix(in srgb,var(--c) 22%,rgba(5,7,12,.82)) 45%,rgba(5,7,12,.93) 78%)}
.sv.t-system .node.hasbg>:not(.nbg){position:relative;z-index:2}
.sv.t-system .node.hasbg .i{background:color-mix(in srgb,var(--c) 30%,rgba(5,7,12,.55));backdrop-filter:blur(6px)}
.sv.t-system .node.hasbg p{color:#e8ebf0}
/* oath with his voice (slide 6) */
.sv.t-oath .oimg.ovid{aspect-ratio:16/9;background:#000}
.sv.t-oath .oimg.ovid video,.sv.t-oath .oimg.ovid img{width:100%;height:100%;object-fit:cover;display:block;transform:scale(1.24);transform-origin:0% 100%;animation:none!important}
.sv.t-oath .oaud{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
.sv.t-oath .okar{font:600 40px/1.75 var(--fd)}
.sv.t-oath .okar .ow{color:rgba(227,230,236,.32);transition:color .25s ease,text-shadow .25s ease}
.sv.t-oath .okar .ow.on,.sv.t-oath .okar.all .ow{color:#f3d08a}
.sv.t-oath .okar .ow.cur{color:#fff;text-shadow:0 0 24px rgba(243,208,138,.75)}
/* 00:17 Amr «الكلام اللي تحت العنوان لازق فيه … راجعه ودقق عليه في كل السلايدات»: the line under a kq title gets air */
.sv.t-kq .qk{top:246px}
.sv.t-kq .kbody:has(.k-col){top:336px!important}
.sv.t-kq .k-col .cc{height:680px!important}
/* kashida-justified paragraphs: the last line keeps the block's own alignment */
.sv .kjd{text-align:justify;text-align-last:auto}.sv .kjd .kw{white-space:nowrap}
/* duo heads */
.sv.t-kq .k-duo .dpre{font:600 36px/1.2 var(--fd);color:#e3e6ec;margin-bottom:-2px}.sv.t-kq .k-duo .db .dpre{color:var(--gold2)}
.sv.t-kq:has(.k-duo) .qk{top:272px}
.sv.t-kq .k-duo .da:has(.dh),.sv.t-kq .k-duo .db:has(.dh){position:relative;overflow:visible}
.sv.t-kq .k-duo .v u{white-space:nowrap}.sv.t-kq .k-duo:has(.dh) .db .v .num{font-size:180px}
.sv.t-kq .k-duo .dh{position:absolute;top:-25px;left:50%;transform:translateX(-50%);white-space:nowrap;padding:9px 26px;border-radius:999px;font:600 30px/1 var(--fd);color:#d6dae2;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16)}
.sv.t-kq .k-duo .dh.g{color:#1a1206;background:linear-gradient(180deg,#f3d08a,#c9944a);border-color:transparent}
.sv.t-kq .k-duo .dl2{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:16px;font:600 34px/1.3 var(--fd);color:var(--gold2)}
.sv.t-kq .k-duo .dl2 svg{width:38px;height:38px;flex:none}
/* 19:59 his 32: the 357 stays a while over the old place (still, grey, slowly drifting), then the line goes through it and the new
   housing comes up — slowly, the old picture dissolving into the new one */
.sv.t-kq .phs img{transition:opacity 2.4s ease,transform 10s linear}
.sv.t-kq .phs .pb{transform:scale(1.12)}
.sv.t-kq.ans .phs .pa{transform:scale(1.14)}
.sv.t-kq.ans2 .phs .pa,.sv.t-kq.ans2 .phs .pb{transition:opacity 2.6s ease .6s,transform 8s cubic-bezier(.2,.6,.2,1) .6s}
.sv.t-kq.ans2 .phs .pb{transform:scale(1.02)}
/* kq «share» */
.sv.t-kq .k-share.nf .nums{grid-template-columns:auto auto auto;column-gap:90px;row-gap:70px}
.sv.t-kq .k-share.nf .na{grid-column:1;grid-row:1}.sv.t-kq .k-share.nf .arr{grid-column:2;grid-row:1;transform:none;font-size:90px}
.sv.t-kq .k-share.nf .nb2{grid-column:3;grid-row:1}.sv.t-kq .k-share.nf .x2{grid-column:1/4;grid-row:2;justify-self:center}
.sv.t-kq .k-share.nf .x2{flex-direction:row;max-width:none;padding:20px 44px;gap:26px;backdrop-filter:blur(14px);background:rgba(20,16,10,.55)}.sv.t-kq .k-share.nf .x2 b{font-size:84px}
.sv.t-kq .k-share.nf .na .v .num{font-size:150px}.sv.t-kq .k-share.nf .nb2 .v .num{font-size:230px}
.sv.t-kq .chart.k-share{display:flex;align-items:center;justify-content:center;gap:120px;width:100%;height:100%;direction:rtl}
.sv.t-kq .k-share .frame{position:relative;border:2px solid rgba(255,255,255,.28);border-radius:8px;background:repeating-linear-gradient(135deg,rgba(255,255,255,.035) 0 2px,transparent 2px 14px);flex:none}
.sv.t-kq .k-share .fl2{position:absolute;top:-46px;right:0;font:500 26px/1 var(--fb);color:var(--mute)}
.sv.t-kq .k-share .frame i{position:absolute;right:0;bottom:0;display:block;border-radius:6px 0 6px 0}
.sv.t-kq .k-share .frame .sa{background:linear-gradient(180deg,#7a8396,#454c5c);box-shadow:0 0 0 2px rgba(4,6,11,.8)}
.sv.t-kq .k-share .frame .sb{background:linear-gradient(180deg,var(--gold1) -30%,var(--gold2) 45%,#b47a33);box-shadow:0 0 60px -10px rgba(233,188,108,.6);transform-origin:100% 100%;transform:scale(.7071);transition:transform 1.6s var(--e1) 1s}
.sv.t-kq.ans .k-share .frame .sb,.sv.t-kq.static .k-share .frame .sb{transform:none}
.sv.t-kq .k-share .la{position:absolute;right:10px;font:600 28px/1 var(--fd);color:#d6dae2}
.sv.t-kq .k-share .nums{display:grid;grid-template-columns:auto auto;align-items:center;column-gap:50px;row-gap:40px}
.sv.t-kq .k-share .na,.sv.t-kq .k-share .nb2{display:flex;flex-direction:column;align-items:center;gap:12px}
.sv.t-kq .k-share .na{grid-column:1;grid-row:1}.sv.t-kq .k-share .arr{grid-column:1;grid-row:2;justify-self:center;font:600 60px/1 var(--fd);color:var(--acc);transform:rotate(-90deg)}
.sv.t-kq .k-share .nb2{grid-column:1;grid-row:3}
.sv.t-kq .k-share .na .v .num{font-size:110px;color:#c3c9d4}.sv.t-kq .k-share .nb2 .v .num{font-size:190px;line-height:1}
.sv.t-kq .k-share .yt{padding:8px 22px;border-radius:999px;font:600 26px/1 var(--fd);background:rgba(255,255,255,.1)}
.sv.t-kq .k-share .yt.b{background:linear-gradient(180deg,#f3d08a,#c9944a);color:#1a1206}
.sv.t-kq .k-share .x2{grid-column:2;grid-row:1/4;display:flex;flex-direction:column;align-items:center;gap:14px;padding:40px 36px;border-radius:30px;border:1px solid rgba(233,188,108,.45);background:rgba(233,188,108,.08);max-width:300px;text-align:center}
.sv.t-kq .k-share .x2 b{font:700 120px/1 var(--fd);color:var(--gold2)}.sv.t-kq .k-share .x2 span{font:500 30px/1.4 var(--fb);color:#e3e6ec}

.sv .bg .gi{position:absolute;margin:0;box-shadow:none;background:none;border-radius:0}
.sv .bg .gi img.cr{inset:auto;opacity:1;transform:none}
.sv .bg .gi img:not(.cr){position:static;width:100%;height:100%;object-fit:fill;opacity:1;transform:none}
.sv .bg.lp .lpi{opacity:0;transition:opacity 1.1s ease,transform 6s linear;transform:scale(1.03)}
.sv .bg.lp .lpi.on{opacity:1;transform:scale(1.09)}
.sv.static .bg.lp .lpi.on{transform:scale(1.04)}
.sv .bg.lp::after,.sv.t-section .bg.sbg::after{background:linear-gradient(270deg,rgba(4,6,11,.8) 0%,rgba(4,6,11,.4) 45%,rgba(4,6,11,.15) 80%),linear-gradient(0deg,rgba(4,6,11,.9),transparent 55%)}
.sv.t-section .bg.sbg::after{background:radial-gradient(1100px 620px at 50% 50%,rgba(4,6,11,.78),rgba(4,6,11,.5) 70%,rgba(4,6,11,.35)),linear-gradient(0deg,rgba(4,6,11,.6),transparent 40%)}
.sv.t-section .bg.sbg .gi{transform:scale(1.02);transition:transform 20s linear}.sv.t-section.on .bg.sbg .gi{transform:scale(1.08)}
.sv.t-section .bg.sbg.gray .gi{filter:grayscale(1) contrast(1.05) brightness(.8)}
.sv.t-section .pad{justify-content:center;padding:120px 160px}
.sv.t-section .h1{text-shadow:0 4px 40px rgba(0,0,0,.6)}
.sv.t-section .kq{color:#f3d08a}
.sv.t-section .p{color:#e3e6ec}
.sv .gi .rot{position:absolute;overflow:hidden}

.sv.t-gallery .gal.geo .gi{box-shadow:0 0 0 2px rgba(4,6,11,.9)}
.sv.t-gallery .gband{position:absolute;left:0;right:0;top:0;height:300px;z-index:11;pointer-events:none;background:linear-gradient(180deg,rgba(4,6,11,.94) 0%,rgba(4,6,11,.78) 45%,rgba(4,6,11,0) 100%)}
.sv.t-gallery .gband.b{top:auto;bottom:0;height:220px;background:linear-gradient(0deg,rgba(4,6,11,.94) 0%,rgba(4,6,11,.7) 50%,rgba(4,6,11,0) 100%)}
.sv.t-gallery .gal.geo~.gt b{text-shadow:0 2px 18px rgba(0,0,0,.8)}

.sv img.cr{position:absolute;max-width:none;object-fit:fill}
.sv.t-hero .bg.hb .gi{position:absolute;margin:0;box-shadow:none;background:none;border-radius:0}
.sv.t-hero .bg.hb .gi img:not(.cr){width:100%;height:100%;object-fit:fill;position:static;opacity:1;transform:none}
.sv.t-hero .bg.hb .gi img.cr{opacity:1;transform:none;inset:auto}
.sv.t-hero .bg.hb .gi{transform:scale(1.02);transition:transform 24s linear}.sv.t-hero.on .bg.hb .gi{transform:scale(1.08)}.sv.t-hero.static .bg.hb .gi{transform:scale(1.03)}
.sv.t-hero .hins,.sv.t-cards .cg.photo figure,.sv.t-oath .oimg,.sv.t-stats .simg,.sv.t-people .pp4{overflow:hidden}
.sv.t-cards .cg.photo figure{position:relative}
.sv.t-hero .hins{position:absolute}
.sv.t-stats .simg.cap{overflow:visible}

.sv .gi img.cr{position:absolute;max-width:none;object-fit:fill}
.sv .gi{border-radius:0}
.sv.t-proj .gi.pbg{z-index:1;box-shadow:none}
.sv.t-proj .gi.pbg img:not(.cr){object-fit:cover}
.sv.t-proj .gi.pbg::after{content:'';position:absolute;inset:0;background:linear-gradient(270deg,rgba(4,6,11,.95) 0%,rgba(4,6,11,.88) 30%,rgba(4,6,11,.35) 52%,rgba(4,6,11,0) 70%)}
.sv.t-proj .gal{z-index:5}
.sv.t-proj .gi.pbg2{z-index:1;box-shadow:none;border-radius:0;-webkit-mask-image:linear-gradient(270deg,transparent 0,#000 12%);mask-image:linear-gradient(270deg,transparent 0,#000 12%)}
.sv.t-proj .gi.pbg2 figcaption{right:auto;left:24px}
.sv.t-proj .ppanel{z-index:12}
.sv .gi.ins{border-radius:10px}

/* 19:30: one soft build style everywhere (no blur, a short rise); the kq question sits at the top from the start */
.sv [data-s]{transform:translateY(14px);filter:none;transition:opacity 1.2s ease,transform 1.4s var(--e1)}
.sv [data-s].in{transform:none}
.sv .mark{display:none!important}
.sv.t-kq .qp,.sv.t-kq.ans .qp{transform:translate(-50%,86px) scale(.8);transition:none}
.sv.t-kq .qk{transition-duration:1.4s}
/* 19:31 the figures inside the story: bigger, in a highlight tag */
.sv .hl{display:inline-block;unicode-bidi:isolate;font-family:var(--fd);font-weight:700;font-size:1.2em;line-height:1.15;color:#ffe2a8;
  background:linear-gradient(180deg,rgba(233,188,108,.22),rgba(233,188,108,.1));border:1px solid rgba(233,188,108,.5);border-radius:.38em;padding:.04em .32em .1em;margin:0 .1em;box-shadow:0 0 18px -6px rgba(233,188,108,.45)}
.sv .gt b .hl,.sv .qq .hl,.sv .ln.hd .hl{font-size:1.08em}
.sv .gal{position:absolute;inset:0;z-index:10}
.sv .gi{position:absolute;margin:0;border-radius:8px;overflow:hidden;box-shadow:0 0 0 1px var(--edge),0 24px 44px -26px rgba(0,0,0,.95);background:var(--ink2)}
.sv .gi img,.sv .gi video{display:block;width:100%;height:100%;object-fit:fill}
.sv .gi figcaption{position:absolute;right:0;left:0;bottom:0;padding:12px 18px 13px;background:linear-gradient(0deg,rgba(10,16,34,.92),rgba(10,16,34,.78));font:600 25px/1.3 var(--fd);color:#fff;text-align:center;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.sv .gal.grid .gi figcaption{font-size:20px;padding:7px 10px 8px}
.sv .gi .tg{position:absolute;top:16px;right:16px;padding:9px 20px;border-radius:999px;font:600 24px/1 var(--fd);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.sv .gi .tg.old{background:rgba(20,24,34,.78);color:#d6dae2;border:1px solid rgba(255,255,255,.25)}
.sv .gi .tg.new{background:linear-gradient(180deg,#f3d08a,#c9944a);color:#1a1206}
.sv .gi.ins{z-index:3;box-shadow:0 0 0 3px rgba(4,6,11,.85),0 0 0 4px rgba(255,255,255,.35),0 30px 60px -20px rgba(0,0,0,.95)}
.sv .gi.ins figcaption{font-size:20px;padding:7px 10px}
.sv .gi.ins figcaption{-webkit-line-clamp:3}   /* 10:55 a three-line caption shows whole (Knowledge City: the university and its four faculties) */
.sv .gi.mapv{box-shadow:0 0 0 3px rgba(4,6,11,.85),0 0 0 5px rgba(233,188,108,.7),0 30px 60px -20px rgba(0,0,0,.95)}
.sv.t-gallery .gt{position:absolute;right:70px;left:120px;top:112px;z-index:12;display:flex;flex-direction:column;align-items:flex-start;gap:8px}
.sv.t-gallery .gt .k{font:500 24px/1.2 var(--fb);color:var(--acc)}
.sv.t-gallery .gt b{font:600 46px/1.22 var(--fd);color:var(--fg);max-width:1600px}
.sv.t-gallery .gt.long b{font-size:40px}
.sv.t-gallery .gt .sub{font:500 30px/1.3 var(--fb);color:var(--gold2)}
.sv.t-gallery .gt .pg{font:500 24px/1 var(--fb);color:var(--mute)}
.sv.t-gallery .gnote{position:absolute;right:64px;left:64px;bottom:26px;z-index:12;display:flex;justify-content:center}
.sv.t-gallery .gnote span{font:500 29px/1.4 var(--fb);color:#dfe3ea;text-align:center;max-width:1500px}
/* proj */
.sv.t-proj .ppanel{position:absolute;right:70px;top:150px;bottom:110px;width:640px;z-index:12;display:flex;flex-direction:column;justify-content:center}
.sv.t-proj .kick{margin-bottom:22px}
.sv.t-proj .ph{font:600 60px/1.2 var(--fd)}
.sv.t-proj .psub{margin-top:14px;font:500 30px/1.35 var(--fb);color:var(--mute)}
.sv.t-proj .psts{margin:46px 0 34px;display:flex;flex-direction:column;gap:30px;padding:30px 0;border-top:1px solid rgba(255,255,255,.12);border-bottom:1px solid rgba(255,255,255,.12)}
.sv.t-proj .pst .pre{font:500 30px/1.3 var(--fb);color:#c9ced8;margin-bottom:6px}
.sv.t-proj .pst .pv{display:flex;align-items:baseline;gap:20px;flex-wrap:wrap}
.sv.t-proj .pst .pv .num{font-size:150px;line-height:1}
.sv.t-proj .psts.two .pst .pv .num{font-size:110px}
.sv.t-proj .pst .pv u{text-decoration:none;font:500 42px/1.2 var(--fb);color:var(--gold2)}
.sv.t-proj .pst .pp{font:500 30px/1.35 var(--fb);color:#c9ced8;margin-top:4px}
.sv.t-proj .pd{margin:0;font:400 29px/1.6 var(--fb);color:#c9ced8}
/* hero */
.sv.t-hero .bg.hb img{object-fit:cover}
.sv.t-hero .bg.hb::after{background:linear-gradient(270deg,rgba(4,6,11,.72) 0%,rgba(4,6,11,.3) 42%,rgba(4,6,11,0) 70%),linear-gradient(0deg,rgba(4,6,11,.88),rgba(4,6,11,0) 50%)}
.sv.t-hero .pad{justify-content:flex-end;padding-bottom:150px}
.sv.t-hero .h1{font-size:130px;max-width:1500px}
.sv.t-hero .p{margin-top:22px;font-size:40px;color:#e6e9ef;max-width:1300px}
.sv.t-hero .kick{margin-bottom:40px}
.sv.t-hero .hins{position:absolute;left:64px;top:110px;margin:0;z-index:12;border-radius:10px;overflow:hidden;box-shadow:0 0 0 1px rgba(255,255,255,.3),0 30px 60px -20px rgba(0,0,0,.9)}
.sv.t-hero .hins img{width:100%;height:100%;display:block}
/* stmt */
.sv.t-stmt .pad{padding:150px 210px 150px}
.sv.t-stmt .ln{font:600 68px/1.35 var(--fd);max-width:1500px}
.sv.t-stmt .ln.hd{font-size:66px;margin-bottom:40px}
.sv.t-stmt .ln.dim{color:var(--mute);font-weight:500;font-size:56px;margin-bottom:34px}
.sv.t-stmt .ln.hero{font-size:80px;line-height:1.3;background:linear-gradient(180deg,var(--gold1) 0%,var(--gold2) 46%,var(--gold3) 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
.sv.t-stmt .ln.prose{font:400 46px/1.7 var(--fb);color:#d3d8e1}
.sv.t-stmt .ln.prose.gold{color:var(--gold2);font-weight:500}
.sv.t-stmt .ln.gold2{font-size:54px;color:var(--gold2);font-weight:500;line-height:1.5}
.sv.t-stmt .chips{display:flex;flex-wrap:wrap;gap:20px;margin-top:64px}
.sv.t-stmt .chip{font-size:32px;padding:18px 32px}
.sv.t-stmt .qmk{position:absolute;right:120px;top:40px;font:600 300px/1 var(--fd);color:var(--acc);opacity:.35}
/* question */
.sv.t-question .qbig{position:absolute;left:120px;top:50%;transform:translateY(-52%);font:700 760px/1 var(--fd);color:transparent;-webkit-text-stroke:3px rgba(233,188,108,.7);text-shadow:0 0 80px rgba(233,188,108,.25);z-index:5}
.sv.t-question .pad{padding-left:760px}
.sv.t-question .qk{display:flex;align-items:center;gap:22px;font:600 34px/1.2 var(--fd);color:var(--acc);margin-bottom:44px}.sv.t-question .qk i{width:70px;height:2px;background:currentColor;opacity:.6}
.sv.t-question .qq{font:600 84px/1.32 var(--fd)}
/* section */
.sv.t-section .pad{align-items:center;text-align:center}
.sv.t-section .six{font:700 300px/1 var(--fd);color:transparent;-webkit-text-stroke:2px rgba(233,188,108,.45);margin-bottom:-40px}
.sv.t-section .kq{display:flex;align-items:center;gap:26px;font:600 36px/1 var(--fd);color:var(--acc);letter-spacing:.03em;margin-bottom:40px}.sv.t-section .kq i{width:90px;height:2px;background:currentColor;opacity:.55}
.sv.t-section .h1{font-size:128px;max-width:1600px}
.sv.t-section .h1.sm{font-size:84px;line-height:1.3}
.sv.t-section .p{margin-top:30px;color:var(--mute);font-size:42px}
/* oath */
.sv.t-oath .oimg{position:absolute;left:64px;top:250px;width:1000px;margin:0;border-radius:14px;overflow:hidden;box-shadow:0 0 0 1px var(--edge),0 40px 80px -30px rgba(0,0,0,.9);z-index:5}
.sv.t-oath .oimg img{width:100%;height:100%;display:block}
.sv.t-oath .pad{padding-left:1140px;padding-right:100px}
.sv.t-oath .oy{font:700 210px/1 var(--fd)}
.sv.t-oath .ok{font:600 70px/1.2 var(--fd);margin:6px 0 40px}
.sv.t-oath blockquote{margin:0;font:500 36px/1.65 var(--fd);color:#e3e6ec}
.sv.t-oath cite{display:block;margin-top:30px;font:500 30px/1 var(--fb);font-style:normal;color:var(--acc)}
/* cards */
.sv.t-cards .bg.cbg img{filter:grayscale(.6) brightness(.5)}
.sv.t-cards .bg.cbg.what img{filter:grayscale(1) brightness(.4) contrast(1.1)}
.sv.t-cards .pad{padding:130px 110px 120px}
.sv.t-cards .ct{font-size:68px;text-align:center}
.sv.t-cards .cs{text-align:center;font:500 38px/1.3 var(--fd);color:var(--gold2);margin-top:12px}
.sv.t-cards .cg{display:grid;gap:26px;margin-top:56px}
.sv.t-cards .cg.icons{grid-template-columns:repeat(3,1fr)}
.sv.t-cards .cg.icons .cd{padding:46px 40px;min-height:250px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:24px}
.sv.t-cards .cd .ci{width:96px;height:96px;border-radius:26px;display:grid;place-items:center;background:rgba(233,188,108,.14);border:1px solid rgba(233,188,108,.45)}
.sv.t-cards .cd .ci svg{width:52px;height:52px;color:var(--gold2)}
.sv.t-cards .cd h3{font:600 42px/1.3 var(--fd)}
.sv.t-cards .cd p{margin:0;font:400 30px/1.5 var(--fb);color:#c9ced8}
.sv.t-cards .cd.hasbg{position:relative;overflow:hidden;background:#0b0d14;border-color:rgba(255,255,255,.2);justify-content:flex-end!important;min-height:318px!important;padding:30px 30px 34px!important;gap:16px!important}
.sv.t-cards .cd.hasbg .cbgi{position:absolute;inset:0;margin:0;z-index:0;overflow:hidden}
.sv.t-cards .cd.hasbg .cbgi img{width:100%;height:100%;object-fit:cover;display:block}
.sv.t-cards .cd.hasbg::before{content:'';position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(4,6,11,.12) 0%,rgba(4,6,11,.42) 40%,rgba(4,6,11,.9) 100%)}
.sv.t-cards .cd.hasbg>:not(.cbgi){position:relative;z-index:2}
.sv.t-cards .cd.hasbg .ci{width:76px;height:76px;border-radius:22px;background:rgba(10,10,14,.45);backdrop-filter:blur(8px)}.sv.t-cards .cd.hasbg .ci svg{width:42px;height:42px}
.sv.t-cards .cd.hasbg h3{font-size:44px;text-shadow:0 2px 18px rgba(0,0,0,.6)}
.sv.t-cards .cg.photo{grid-template-columns:1fr 1fr;gap:28px;margin-top:44px}
.sv.t-cards .cg.photo .cd{display:flex;gap:30px;padding:26px;align-items:center}
.sv.t-cards .cg.photo figure{margin:0;width:380px;flex:none;border-radius:14px;overflow:hidden}
.sv.t-cards .cg.photo figure img{width:100%;height:100%;display:block}
.sv.t-cards .cg.photo h3{font-size:46px;color:var(--gold2);margin-bottom:12px}
.sv.t-cards .cg.photo p{font-size:27px;line-height:1.55}
.sv.t-cards .cg.what{grid-template-columns:repeat(5,1fr)}
.sv.t-cards .cg.what.n8{grid-template-columns:repeat(4,1fr)}
.sv.t-cards .cg.what .cd,.sv.t-cards .cg.good .cd{padding:36px 32px;display:flex;flex-direction:column;gap:18px;min-height:300px}
.sv.t-cards .cg.what.n8 .cd{min-height:250px}
.sv.t-cards .cg.what.n5 .cd{min-height:400px;padding:44px 34px}.sv.t-cards .cg.what.n5 h3{font-size:40px}.sv.t-cards .cg.what.n5 p{font-size:33px;line-height:1.55}
.sv.t-cards .cg.what .cd{border-color:rgba(229,100,92,.4);background:linear-gradient(160deg,rgba(229,100,92,.16),rgba(255,255,255,.03) 60%)}
.sv.t-cards .cg.what h3{font-size:36px;color:#ff9a8c}
.sv.t-cards .cg.what p,.sv.t-cards .cg.good p{font-size:29px;color:#e3e6ec}
/* 12:31–12:32 Amr («ماذا لو» ×2) «محتاج … موضح الحاجة مش متلخبطة والالاين مظبوط … ماذا لو كلها محتاجة إعادة نظر منك إزاي تكون واضحة»: the figures read
   inside the sentence in bold gold — no boxed pills breaking the lines — every title takes the same height so every text starts on one line */
.sv.t-cards .cg.what .hl{display:inline;font-size:1.12em;line-height:inherit;padding:0;margin:0;background:none;border:0;border-radius:0;box-shadow:none;color:#f3d79f;white-space:nowrap}
.sv.t-cards .cg.what .cd{justify-content:flex-start}
.sv.t-cards .cg.what h3{line-height:1.25;margin:0}
.sv.t-cards .cg.what.n5 h3{min-height:2.5em}
.sv.t-cards .cg.what p{line-height:1.62;margin:0}
.sv.t-cards .cg.what.n8 .cd{min-height:280px;padding:34px 32px}
.sv.t-cards .cg.what{grid-template-columns:repeat(5,minmax(0,1fr))!important}.sv.t-cards .cg.what.n8{grid-template-columns:repeat(4,minmax(0,1fr))!important}
.sv.t-cards .cg.what.n5 .hl{display:block;font-size:1.3em;line-height:1.25;margin-top:.35em;white-space:normal;text-align:right;text-align-last:right}
/* 13:00 Amr «وريني اوبشن بالنسبه لماذا لو»: option — every what-if card wears a real pre-2014 photograph from the deck, black-and-white under a
   red veil; the sector on top of it, the sentence below, its figure big in red */
.sv.t-cards .cg.what .cd.hasbg{min-height:600px!important;justify-content:space-between!important;border-color:rgba(229,100,92,.55);padding:30px 28px 34px!important}
.sv.t-cards .cg.what .cd.hasbg .cbgi img{filter:grayscale(1) contrast(1.12) brightness(.78)}
.sv.t-cards .cg.what .cd.hasbg::before{background:linear-gradient(180deg,rgba(150,30,22,.28) 0%,rgba(40,8,8,.5) 38%,rgba(10,4,6,.94) 72%,rgba(8,4,6,.98) 100%)}
.sv.t-cards .cg.what .cd.hasbg h3{font-size:40px;color:#fff;text-shadow:0 2px 16px rgba(0,0,0,.7);min-height:0}
.sv.t-cards .cg.what .cd.hasbg p{font-size:28px;color:#eef0f4}
.sv.t-cards .cg.what .cd.hasbg .hl{color:#ff8a7a;font-size:1.55em}
/* 12:56 Amr «حرف العين او الحاء، اي حرف بيبقى نازل بيبقى مقطوع من تحت … وراجع على كده في كل الفريمات»: a gold word is a gradient clipped to
   its text box, and Arabic descenders hang below that box — every gold text gets room underneath (padding, given back as a negative margin),
   and a clamped caption keeps its last line's tails */
.sv .gold{padding-bottom:.24em;margin-bottom:-.24em}
.sv .gi figcaption{padding-bottom:16px}
.sv .hl{padding-bottom:.16em}
.sv.t-cards .cg.good{grid-template-columns:repeat(3,1fr)}
.sv.t-cards .cg.good .cd{flex-direction:row;align-items:flex-start;min-height:240px}
.sv.t-cards .cg.good .cd .ci{flex:none;width:80px;height:80px}.sv.t-cards .cg.good .cd .ci svg{width:44px;height:44px}
.sv.t-cards .cg.good .cd h3{font-size:36px;color:var(--gold2);margin-bottom:10px}
.sv.t-cards .cg.good .cd>div{display:flex;flex-direction:column}
/* leaders */
.sv.t-leaders .bg.lb img{object-fit:cover;opacity:1;transform:none}
.sv.t-leaders .bg.lb::after{background:linear-gradient(0deg,rgba(4,6,11,.96) 0%,rgba(4,6,11,.75) 38%,rgba(4,6,11,0) 60%)}
.sv.t-leaders .pad{justify-content:flex-end;padding:0 70px 120px}
.sv.t-leaders .lg{display:grid;grid-template-columns:repeat(3,1fr);gap:30px}
.sv.t-leaders .lc{padding:34px 36px;border-radius:28px}
.sv.t-leaders .ln2{display:flex;align-items:baseline;gap:18px;margin-bottom:18px}
.sv.t-leaders .ln2 b{font:600 46px/1.1 var(--fd);color:var(--gold2)}.sv.t-leaders .ln2 span{font:500 26px/1 var(--fb);color:var(--mute)}
.sv.t-leaders q{display:block;font:500 32px/1.5 var(--fd);color:#eef0f4;quotes:'«' '»'}
.sv.t-leaders cite{display:block;margin-top:16px;font:400 22px/1 var(--fb);font-style:normal;color:var(--mute)}
/* stats */
.sv.t-stats .simg{position:absolute;left:64px;top:50%;transform:translateY(-50%);width:640px;max-height:860px;margin:0;border-radius:16px;overflow:hidden;z-index:5;box-shadow:0 0 0 1px var(--edge),0 40px 80px -30px rgba(0,0,0,.9)}
.sv.t-stats .simg.cap{overflow:visible;box-shadow:none}.sv.t-stats .simg figcaption{margin-top:14px;text-align:center;font:500 26px/1.3 var(--fb);color:var(--mute)}
.sv.t-stats .simg img{width:100%;height:100%;display:block;object-fit:contain}
.sv.t-stats .pad{padding:120px 130px 110px}
.sv.t-stats .pad.wimg{padding-left:780px;padding-right:90px}
.sv.t-stats .st{font-size:70px}
.sv.t-stats .ss{margin-top:16px;font:400 32px/1.55 var(--fb);color:#c9ced8;max-width:1400px}
.sv.t-stats .kick{margin-bottom:14px}
.sv.t-stats .hrow{display:flex;gap:70px;margin-top:40px;flex-wrap:wrap}
.sv.t-stats .hb2 .pre{font:500 30px/1.3 var(--fb);color:#c9ced8}
.sv.t-stats .hb2 .v{display:flex;align-items:baseline;gap:18px}
.sv.t-stats .hb2 .v .num{font-size:140px;line-height:1.05}
.sv.t-stats .hb2 .v u{text-decoration:none;font:500 42px/1.2 var(--fb);color:var(--gold2)}
.sv.t-stats .hb2 .pp{font:500 28px/1.3 var(--fb);color:var(--mute)}
.sv.t-stats .sg{display:grid;gap:22px;margin-top:44px}
.sv.t-stats .sc{padding:28px 30px;border-radius:26px;display:flex;flex-direction:column;gap:6px}
.sv.t-stats .sc .pre{font:500 24px/1.2 var(--fb);color:var(--mute)}
.sv.t-stats .sc .v .num{font-size:78px;line-height:1.05}
.sv.t-stats .sc .u{font:600 29px/1.3 var(--fd);color:#eef0f4}
.sv.t-stats .sc .pp{font:500 24px/1.3 var(--fb);color:var(--gold2)}
.sv.t-stats .pad.dense{padding-top:140px;padding-bottom:90px}
.sv.t-stats .pad.dense .st{font-size:60px}
.sv.t-stats .pad.dense .hrow{margin-top:24px;gap:60px}
.sv.t-stats .pad.dense .hb2 .v .num{font-size:104px}
.sv.t-stats .pad.dense .sg{margin-top:28px;gap:16px}
.sv.t-stats .pad.dense .sc{padding:20px 24px;border-radius:22px}
.sv.t-stats .pad.dense .sc .v .num{font-size:62px}
.sv.t-stats .pad.dense .sc .u{font-size:25px}
.sv.t-stats .simg.dense{width:520px}
.sv.t-kq .k-rows .grp.wtg .cols{gap:34px}
.sv.t-kq .col.t>i{background:repeating-linear-gradient(135deg,rgba(233,188,108,.16) 0 8px,rgba(233,188,108,.04) 8px 16px);border:2px dashed rgba(233,188,108,.8);box-shadow:0 0 60px -18px rgba(233,188,108,.5);transition-delay:1.05s}
.sv.t-kq .col.t .cv{transition-delay:1.5s}
.sv.t-kq .col.t .cv .num{font-size:76px;color:#f3d79f}
.sv.t-kq .col.t .cv u{color:var(--gold2)}
.sv.t-kq .col.t .cv small{font:600 24px/1.2 var(--fb);color:#f3d79f}
.sv.t-kq .yt.t{color:#f3d79f;background:rgba(233,188,108,.08);border:1.5px dashed rgba(233,188,108,.75);padding:6.5px 14.5px}
.sv.t-kq .k-rows.wmid{align-items:flex-start}
.sv.t-kq .kmid{position:relative;align-self:flex-start;margin:150px 34px 0;padding:30px 40px 30px;border-radius:30px;display:flex;flex-direction:column;align-items:center;text-align:center;
  background:linear-gradient(180deg,rgba(233,188,108,.17),rgba(233,188,108,.045));border:1.5px solid rgba(233,188,108,.55);box-shadow:0 30px 70px -30px rgba(0,0,0,.9),0 0 80px -30px rgba(233,188,108,.45)}
.sv.t-kq .kmid small{font:600 30px/1.2 var(--fb);color:#f3d79f}
.sv.t-kq .kmid .mv .num{font-size:118px;line-height:1.05}
.sv.t-kq .kmid u{text-decoration:none;font:600 30px/1.2 var(--fb);color:#eef0f4;margin-top:4px}
.sv.t-kq .kmid .yt{margin-top:18px}
.sv.t-kq .kmid .karr{position:absolute;right:-84px;top:42px;width:80px;height:18px;fill:none;stroke:rgba(233,188,108,.85);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.sv.t-kq .kmid .karr path:first-child{stroke-dasharray:5 6}
.sv.t-stats .smap{position:absolute;left:16px;top:118px;width:760px;height:900px;z-index:4}
.sv.t-stats .smap .hkm .un path{fill:#131a28;stroke:rgba(255,255,255,.12);stroke-width:.8}
.sv.t-stats .smap .hkm .lk path{fill:#173f5a}
.sv.t-stats .smap .hkm .lit{fill:rgba(233,188,108,.42);stroke:#f3d79f;stroke-width:1;stroke-linejoin:round}
.sv.t-stats .smap .hkm .nl0{fill:none;stroke:rgba(79,182,227,.28);stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
.sv.t-stats .smap .hkm .nl{fill:none;stroke:#5cc0ea;stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round}
.sv.t-stats .smap .hkm .eo{fill:none;stroke:rgba(255,255,255,.38);stroke-width:1.2;stroke-linejoin:round}
.sv.t-stats .smap .hkm text{direction:ltr;unicode-bidi:plaintext;font:600 17px var(--fb);fill:#eef0f4;paint-order:stroke;stroke:rgba(6,10,18,.88);stroke-width:4px;stroke-linejoin:round}
.sv.t-stats .smap .hkm text.big{font-size:22px;fill:#fff3d6}
.sv.t-stats .smap .hkm .gq path{fill:none;stroke:rgba(243,215,159,.6);stroke-width:.9}
.sv.t-stats .smap .hkm .gq circle{fill:#f3d79f}
.sv.t-stats .smap .hkm .lg rect{fill:rgba(233,188,108,.42);stroke:#f3d79f;stroke-width:1}
.sv.t-stats .smap .hkm text.rtl{direction:rtl;unicode-bidi:normal}
.sv.t-stats .smap .hkm .lg text{font:600 22px var(--fb);fill:#eef0f4;stroke:none}
.sv.t-stats .smap .hkm .lg text.lgn{font:500 18px var(--fb);fill:#c9ced8}
.sv.t-stats .smap .hkm .lg tspan.g{font-weight:700;fill:#e9bc6c}
.sv.t-stats .smap .hkm .lit,.sv.t-stats .smap .hkm .gq,.sv.t-stats .smap .hkm text.gl{opacity:0}
.sv.t-stats .smap.in .hkm .lit{animation:hklit .55s cubic-bezier(.2,.7,.2,1) both}
.sv.t-stats .smap.in .hkm .gq,.sv.t-stats .smap.in .hkm text.gl{animation:hklb .45s ease both}
@keyframes hklit{0%{opacity:0;fill:rgba(255,236,190,.95)}60%{opacity:1}100%{opacity:1}}
@keyframes hklb{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.sv.nomo .sv.t-stats .smap .hkm .lit,.sv.nomo .sv.t-stats .smap .hkm .gq,.sv.nomo .sv.t-stats .smap .hkm text.gl{opacity:1;animation:none}
.sv.t-stats .bg.sbgp{z-index:0}
.sv.t-stats .bg.sbgp::after{background:linear-gradient(270deg,rgba(4,6,11,.9) 0%,rgba(4,6,11,.74) 42%,rgba(4,6,11,.3) 78%,rgba(4,6,11,.22) 100%),linear-gradient(0deg,rgba(4,6,11,.7),transparent 45%),linear-gradient(180deg,rgba(4,6,11,.55),transparent 30%)}
.sv.t-stats .pad.onbg{position:relative;z-index:2}
.sv.t-stats .pad.onbg .sc.glass{background:linear-gradient(145deg,rgba(255,255,255,.12),rgba(255,255,255,.04) 60%,rgba(255,255,255,.07));-webkit-backdrop-filter:blur(14px) saturate(1.15);backdrop-filter:blur(14px) saturate(1.15);border:1px solid rgba(255,255,255,.16)}
.sv.t-stats .sp{margin:36px 0 0;font:500 34px/1.55 var(--fb);color:#e3e6ec;max-width:1400px}
/* cmp */
.sv.t-cmp .pad{padding:110px 120px 130px}
.sv.t-cmp .mt{font-size:62px;text-align:center}
.sv.t-cmp .ms{text-align:center;font:500 32px/1.4 var(--fb);color:var(--mute);margin-top:10px}
.sv.t-cmp .kick{text-align:center;margin-bottom:12px}
.sv.t-cmp .two{display:grid;grid-template-columns:1fr 90px 1fr;gap:20px;margin-top:50px;align-items:stretch}
.sv.t-cmp .arw{display:grid;place-items:center;font:600 70px/1 var(--fd);color:var(--acc)}
.sv.t-cmp .cc{padding:40px 44px;border-radius:30px;display:flex;flex-direction:column;gap:22px}
.sv.t-cmp .cc.a{border-color:rgba(229,100,92,.35)}
.sv.t-cmp .cc.b{border-color:rgba(233,188,108,.5);box-shadow:0 0 0 1px rgba(233,188,108,.15),0 40px 90px -40px rgba(233,188,108,.35)}
.sv.t-cmp .yt{align-self:flex-start;padding:10px 24px;border-radius:999px;font:600 28px/1 var(--fd);background:rgba(255,255,255,.1)}
.sv.t-cmp .yt.b{background:linear-gradient(180deg,#f3d08a,#c9944a);color:#1a1206}
.sv.t-cmp .cl{font:500 34px/1.45 var(--fd);color:#e6e9ef}
.sv.t-cmp .cst .pre{font:500 28px/1.2 var(--fb);color:var(--mute)}
.sv.t-cmp .cst .v{display:flex;align-items:baseline;gap:16px}.sv.t-cmp .cst .v .num{font-size:84px;line-height:1.05}
.sv.t-cmp .cst .v u{text-decoration:none;font:500 34px/1.2 var(--fb);color:var(--gold2)}
.sv.t-cmp .cst .pp{font:500 29px/1.35 var(--fb);color:#c9ced8}
.sv.t-cmp .fl{display:flex;flex-wrap:wrap;align-items:baseline;gap:10px 18px;font:500 28px/1.4 var(--fb);color:#d6dae2}
.sv.t-cmp .fl .fv{font-size:58px;line-height:1.1}
/* people */
.sv.t-people .pg4{position:absolute;inset:60px 70px 130px;display:flex;justify-content:center;gap:22px;z-index:10}
.sv.t-people .pp4{position:relative;margin:0;height:100%;border-radius:22px;overflow:hidden;box-shadow:0 0 0 1px var(--edge),0 40px 80px -30px rgba(0,0,0,.9)}
.sv.t-people .pp4 img{width:100%;height:100%;display:block}
.sv.t-people .pp4 figcaption{position:absolute;left:0;right:0;bottom:0;padding:120px 26px 30px;background:linear-gradient(0deg,rgba(4,6,11,.95) 20%,rgba(4,6,11,0));text-align:center}
.sv.t-people .pp4 .v{display:flex;justify-content:center;align-items:baseline;gap:12px}.sv.t-people .pp4 .v .num{font-size:96px;line-height:1}
.sv.t-people .pp4 .v u{text-decoration:none;font:500 32px/1.2 var(--fb);color:var(--gold2)}
.sv.t-people .pp4 p{margin:10px 0 0;font:500 28px/1.4 var(--fb);color:#e6e9ef}
/* close with portrait */
.sv.t-close .por{position:absolute;left:0;top:0;bottom:0;width:54%;z-index:1}
.sv.t-close .por img{width:100%;height:100%;object-fit:cover;object-position:30% 50%;-webkit-mask-image:linear-gradient(270deg,transparent 0%,#000 26%);mask-image:linear-gradient(270deg,transparent 0%,#000 26%)}
.sv.t-close .por+.pad{padding-left:1040px;padding-right:120px}
.sv.t-close .por+.pad .a{font-size:46px}
.sv.t-close .por+.pad .b{font-size:64px;line-height:1.35}
.sv.t-close .c2{margin-top:56px;font:600 54px/1.3 var(--fd);color:var(--acc)}
/* chapter / pressures / shocks additions */
.sv.t-chapter .cpre{font:600 40px/1 var(--fd);color:#fff;opacity:.9;margin-bottom:22px}
.sv.t-pressures .pk{margin-bottom:10px}
.sv.t-shocks .evs{grid-template-columns:repeat(6,1fr)!important}
.sv.t-shocks .shh{position:absolute;right:160px;top:110px;margin:0;font-size:68px;line-height:1.2}
.sv.t-shocks .shx{position:absolute;inset:0;pointer-events:none}
.sv.t-shocks .sax{position:absolute;height:3px;border-radius:2px;background:linear-gradient(270deg,rgba(255,255,255,.55),rgba(255,255,255,.18))}
.sv.t-shocks .sax.wseg{height:9px;border-radius:5px;background:linear-gradient(270deg,#e5645c,#c8453e);box-shadow:0 0 30px rgba(229,100,92,.45)}
.sv.t-shocks .swar{position:absolute;height:66px;border-radius:18px;display:flex;align-items:center;justify-content:center;gap:22px;background:linear-gradient(270deg,rgba(229,100,92,.28),rgba(229,100,92,.14));border:1.5px solid rgba(229,100,92,.75);color:#fff;font:600 34px/1 var(--fd)}
.sv.t-shocks .swar b{font-size:40px;color:#ffb3a8;font-weight:400;letter-spacing:.02em}
.sv.t-shocks .swar::before,.sv.t-shocks .swar::after{content:'';position:absolute;top:100%;width:2px;height:52px;background:linear-gradient(180deg,rgba(229,100,92,.9),rgba(229,100,92,.3))}
.sv.t-shocks .swar::before{right:19px}.sv.t-shocks .swar::after{left:19px}
.sv.t-shocks .sev{position:absolute;width:250px;margin-left:-125px;display:flex;flex-direction:column;align-items:center;text-align:center}
.sv.t-shocks .sev i{width:30px;height:30px;border-radius:50%;background:#f3d79f;box-shadow:0 0 0 8px rgba(233,188,108,.16),0 0 24px rgba(233,188,108,.5)}
.sv.t-shocks .sev.iw i{background:#ff8a7a;box-shadow:0 0 0 8px rgba(229,100,92,.2),0 0 24px rgba(229,100,92,.55)}
.sv.t-shocks .sev.st i{background:#fff;width:22px;height:22px;margin:4px 0}
.sv.t-shocks .sev b{margin-top:24px;font-size:64px;line-height:1;color:#fff}
.sv.t-shocks .sev span{margin-top:16px;font:500 29px/1.5 var(--fb);color:#e6e9ef;max-width:236px}
.sv.t-shocks .send{position:absolute;right:160px;top:770px;max-width:1520px;margin:0;font:600 56px/1.4 var(--fd)}
.sv.t-shocks .send.top{top:130px;right:160px;left:160px;max-width:none;font-size:60px;line-height:1.45}
.sv.t-shocks .war{display:flex;align-items:center;gap:20px;margin-top:40px;font:600 32px/1 var(--fd);color:#ffb3a8}
.sv.t-shocks .war i{flex:1;height:10px;border-radius:6px;background:linear-gradient(270deg,#e5645c,rgba(229,100,92,.25))}
/* map dots: a looping pulse */
.sv.t-map .pl .prg{fill:none;stroke:var(--c);stroke-width:2.2;opacity:0;transform-box:fill-box;transform-origin:center;pointer-events:none}
.sv.t-map .pl.on .prg{animation:sv7prg 2.6s cubic-bezier(.22,.61,.36,1) infinite}
@keyframes sv7prg{0%{transform:scale(1);opacity:.9}80%,100%{transform:scale(3.4);opacity:0}}
.sv.t-map .mn>i::after{content:"";position:absolute;inset:0;border-radius:50%;border:2px solid #fff;animation:sv7mni 2.2s cubic-bezier(.22,.61,.36,1) infinite}
@keyframes sv7mni{0%{transform:scale(1);opacity:.85}80%,100%{transform:scale(3);opacity:0}}
.sv.static .prg,.sv.static .mn>i::after{animation:none!important;opacity:0!important}
.sv.t-map .mp.acc{justify-content:flex-start;padding-top:0}
.sv.t-map .mpanel:has(.mp.acc){top:128px;bottom:72px}
.sv.t-map .mp .macc{max-height:0;opacity:0;overflow:hidden;margin-top:0;padding-top:0;border-top:1px solid rgba(255,255,255,0);transition:max-height .9s var(--e1),opacity .6s var(--e1) .15s,margin .9s var(--e1),padding .9s var(--e1),border-color .6s}
.sv.t-map .mp .macc.on{max-height:560px;opacity:1;margin-top:20px;padding-top:18px;border-top-color:rgba(233,188,108,.35)}
.sv.t-map .mp.cur .macc:not(.on) .mchips .chip{opacity:0;transform:translateY(12px)}
.sv.t-map .mp .pace{display:flex;flex-direction:column;gap:12px;margin:22px 0 4px;padding-top:20px;border-top:1px solid rgba(255,255,255,.12)}
.sv.t-map .mp .pr{display:flex;align-items:baseline;gap:18px}
.sv.t-map .mp .pr .num{flex:none;min-width:112px;font-size:58px;line-height:1;color:#8f98a8}
.sv.t-map .mp .pr.g .num{color:var(--gold1,#e9bc6c)}
.sv.t-map .mp .pr span{font:500 30px/1.3 var(--fb);color:#b9c0cc}
.sv.t-map .mp .pr.g span{color:#f1e6cf}
/* photo-slide header template (00:39 «تيمبلت منظم بصريا») */
.sv.t-gallery .gt.gh{top:100px;gap:0;align-items:flex-start;left:70px}
.sv.t-gallery .gt.gh .k{font:500 24px/1.2 var(--fb);color:var(--acc);margin-bottom:10px}
.sv.t-gallery .gt.gh b{font:600 48px/1.2 var(--fd);max-width:1780px}
.sv.t-gallery .gt.gh.long b{font-size:40px;line-height:1.25}
.sv.t-gallery .gt.gh .sub{margin-top:10px;font:500 28px/1.4 var(--fb);color:#c9ced8}
.sv.t-gallery .gt.gh .gfs{display:flex;flex-wrap:wrap;align-items:center;row-gap:10px;margin-top:16px}
.sv.t-gallery .gt.gh .gf{display:flex;align-items:baseline;gap:10px;padding:2px 26px;border-left:1px solid rgba(255,255,255,.18)}
.sv.t-gallery .gt.gh .gf:first-child{padding-right:0}.sv.t-gallery .gt.gh .gf:last-child{border-left:0}
.sv.t-gallery .gt.gh .gf .num{font-size:46px;line-height:1.1}
.sv.t-gallery .gt.gh .gf .fp{font:500 24px/1.2 var(--fb);color:var(--mute)}
.sv.t-gallery .gt.gh .gf .fu{font:500 26px/1.25 var(--fb);color:#e6e9ef}
.sv.t-gallery .gt.gh .gf .fu small{font-size:.8em;color:var(--mute);margin-right:6px}
.sv.t-gallery .gal.geo~.gt.gh .gf{text-shadow:0 2px 14px rgba(0,0,0,.8)}
.sv.t-gallery .gt.gh{flex-direction:row;justify-content:space-between;align-items:center;gap:56px}
.sv.t-gallery .gt.gh .ghl{display:flex;flex-direction:column;align-items:flex-start;min-width:0;flex:0 1 auto}
.sv.t-gallery .gt.gh .gfs.side{flex:0 0 auto;margin-top:0;flex-wrap:nowrap;align-items:stretch;row-gap:0}
.sv.t-gallery .gt.gh .gfs.side .gf{flex-direction:column;align-items:flex-start;justify-content:flex-end;gap:4px;padding:2px 34px}
.sv.t-gallery .gt.gh .gfs.side .gf:first-child{padding-right:0}
.sv.t-gallery .gt.gh .gfs.side .fv{display:flex;align-items:baseline;gap:14px}
.sv.t-gallery .gt.gh .gfs.side .num{font-size:108px;line-height:1}
.sv.t-gallery .gt.gh .gfs.side .fu{font:600 32px/1.25 var(--fb);color:#eef0f4;max-width:300px}
.sv.t-gallery .gt.gh .gfs.side .fp{font:500 25px/1.2 var(--fb);color:#c9ced8}
.sv.t-gallery .gt.gh .gfs.side.stk .fv{flex-direction:column;align-items:flex-start;gap:6px}
.sv.t-gallery .gt.gh .gfs.side.stk .num{font-size:84px}
.sv.t-gallery .gt.gh .gfs.side.stk .fu{font-size:26px;max-width:280px}
/* 11:54 Amr «٢٩ والسلايدات اللي زيها اعمل بوردر لكارت هو اللي يعمل glow»: the figures sit in one bordered card; the card glows, not each figure */
.sv.t-gallery .gt.gh .gfs.side{padding:16px 32px 18px;border-radius:26px;border:1.5px solid rgba(233,188,108,.6);background:linear-gradient(180deg,rgba(233,188,108,.12),rgba(233,188,108,.035));box-shadow:0 0 34px -12px rgba(233,188,108,.45),inset 0 1px 0 rgba(255,255,255,.08)}
.sv.t-gallery .gt.gh .gfs.side .gf:last-child{padding-left:0}
.sv.t-gallery .gt.gh.in .gfs.side .gf{animation:gfpop 1s cubic-bezier(.3,1.4,.5,1) .55s both}
.sv.t-gallery .gt.gh.in .gfs.side{animation:gfcard 2.2s ease 1.1s 1}
@keyframes gfcard{0%,100%{box-shadow:0 0 34px -12px rgba(233,188,108,.45),inset 0 1px 0 rgba(255,255,255,.08);border-color:rgba(233,188,108,.6)}40%{box-shadow:0 0 70px 6px rgba(233,188,108,.6),inset 0 1px 0 rgba(255,255,255,.12);border-color:rgba(243,215,159,1)}}
.sv.nomo .gt.gh .gfs.side,.sv.nomo .gt.gh .gfs.side .gf{animation:none!important}
/* 12:37 Amr (the 367 · 231 · 130 card) «ده مش واضح … نستخدم الالوان اللي كنا بنستخدمها في العادي»: the dark text-shadow the geo header gives its
   figures was painting over the gold (a clipped gradient sits under the shadow) — the figures take the deck's usual bright gold, depth from a drop-shadow */
.sv.t-gallery .gt.gh .gfs.side .gf,.sv.t-gallery .gt.gh .gfs.side .num{text-shadow:none!important}
.sv.t-gallery .gt.gh .gfs.side .fv{filter:drop-shadow(0 3px 10px rgba(0,0,0,.55))}
.sv.t-gallery .gt.gh .gfs.side .num{background-size:100% 100%!important}
.sv.t-gallery .gt.gh .gfs.side .fu{color:#fff}
/* 12:38 Amr «في الانيميشن خلي الكتابة تطلع على طول، اول ما السلايد يبدأ الكتابة تطلع فيد مش بوزيشن وبوب اب … في نفس مكانها وبسرعة»: the photo
   slides' header (title and the figures card) comes in at once — a quick fade where it stands, no blur, no rise, no pop */
.sv.t-gallery .gt.gh[data-s]{filter:none!important;transform:none!important;transition:opacity .3s ease 0s!important}
.sv.t-gallery .gt.gh.in .gf,.sv.t-gallery .gt.gh.in .gfs.side .gf,.sv.t-gallery .gt.gh.in b .hl{animation:none!important}
.sv.t-gallery .gt.gh.in .gfs.side{animation-delay:.35s}
/* 12:41 Amr «كل الحاجات اللي ليها علاقة بظهور الـ charts … الأرقام تطلع بسرعة … علشان اللي بيعرض يشوف الأرقام قدامه وهو بيتكلم»: every chart
   draws in well under a second and its figures are up almost at once */
.sv.t-kq .col>i,.sv.t-kq .cc.a>i{transition:transform .65s var(--e1) .05s!important}
.sv.t-kq .col.b>i{transition-delay:.15s!important}.sv.t-kq .col.t>i{transition-delay:.25s!important}
.sv.t-kq .col>.inl .in{transition:transform .65s var(--e1) .05s!important}.sv.t-kq .col.b>.inl .in{transition-delay:.15s!important}
.sv.t-kq .cv{transition:opacity .25s ease .05s!important}
.sv.t-kq .col.b .cv{transition-delay:.12s!important}.sv.t-kq .col.t .cv{transition-delay:.2s!important}.sv.t-kq .cc .cv{transition-delay:.1s!important}
.sv.t-kq .slope .sl{transition:stroke-dashoffset .7s var(--e2) .1s!important}
.sv.t-kq .slope .pb{transition:opacity .25s ease .5s!important}.sv.t-kq .pv.b{transition:opacity .25s ease .45s!important}.sv.t-kq .pv .darr{transition-delay:.6s!important}
.sv.t-kq .stk .bs{transition:transform .6s var(--e1) .1s!important}
.sv.t-kq .k-strike .x{transition:transform .5s var(--e1) .15s!important}
.sv.t-kq .whole .bar i{transition:transform .8s var(--e1) .1s!important}
.sv.t-kq .pbar .ph i{transition-duration:.6s!important}.sv.t-kq .pbar .p0 i{transition-delay:.1s!important}.sv.t-kq .pbar .p1 i{transition-delay:.3s!important}.sv.t-kq .pbar .p2 i{transition-delay:.5s!important}
.sv.t-kq .k-share .frame .sb{transition:transform .8s var(--e1) .2s!important}
.sv.t-gallery .gt.gh .gfs.side{background:linear-gradient(180deg,rgba(18,16,12,.82),rgba(12,12,14,.74));-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
/* duo before/after photographs (his 31) */
.sv.t-kq .phs.phx img{transition:opacity 2.4s ease,transform 12s linear}
.sv.t-kq .phs.phx .pa{filter:grayscale(1) brightness(.55) contrast(1.12)}
.sv.t-kq.static .phs.phx .pa{opacity:0}.sv.t-kq.static .phs.phx .pb{opacity:1}
.sv.t-kq:has(.phs.phx) .k-duo .db .dh.g{box-shadow:0 0 30px rgba(233,188,108,.45)}
/* 23 Oct 07:22 Amr (his 31) «الصورة اللي في الخلفية مهمة فحاول تقلل شفافية الكارت»: the two cards stop frosting the photograph — a
   light veil and a whisper of blur, the words held by their own shadow — and the photograph's dark wash is thinned */
.sv.t-kq:has(.phs.phx) .k-duo .da,.sv.t-kq:has(.phs.phx) .k-duo .db{background:linear-gradient(145deg,rgba(6,9,16,.46),rgba(6,9,16,.32) 60%,rgba(6,9,16,.42));-webkit-backdrop-filter:blur(4px) saturate(1.05);backdrop-filter:blur(4px) saturate(1.05)}
.sv.t-kq:has(.phs.phx) .k-duo :is(.da,.db) :is(p,u,.dl2,.dpre,span:not(.num)){text-shadow:0 2px 14px rgba(0,0,0,.85),0 0 2px rgba(0,0,0,.6)}
.sv.t-kq:has(.phs.phx) .k-duo :is(.da,.db) .num{filter:drop-shadow(0 6px 22px rgba(0,0,0,.75))}
.sv.t-kq:has(.phs.phx) .k-duo .dh{text-shadow:none}
.sv.t-kq.ans2:has(.phs.phx) .phs::after{background:linear-gradient(0deg,rgba(4,6,11,.82) 0%,rgba(4,6,11,.38) 34%,rgba(4,6,11,.08) 62%,rgba(4,6,11,.6) 100%)}
.sv.t-kq:has(.phs.phx) .chart.k-duo::after{opacity:0;transition:opacity .8s ease .3s}.sv.t-kq.ans2:has(.phs.phx) .chart.k-duo::after,.sv.t-kq.static:has(.phs.phx) .chart.k-duo::after{opacity:1}
/* 00:17 «راجع المسافات تحت العناوين في كل السلايدات»: figure chips on two lines of one paragraph never touch; a column's name
   stands clear of the small lead-in («تتخطى»، «تصل إلى») over its figure */
.sv .hl{margin-top:.1em;margin-bottom:.1em}
.sv.t-kq .k-rows .gh{margin-bottom:16px}
/* slide 20 panel: the total and the bar that splits it */
.sv.t-map .mp .mv:has(+ .msplit){margin-bottom:0}
.sv.t-map .mp .msplit{margin:26px 0 30px;width:100%}
.sv.t-map .mp .msplit .sb{display:flex;height:14px;border-radius:7px;overflow:hidden;background:rgba(255,255,255,.06);gap:3px}
.sv.t-map .mp .msplit .sb i{display:block;height:100%;transform:scaleX(0);transform-origin:right;transition:transform 1.1s var(--e1)}
.sv.t-map .mp .msplit .sb i.old{background:#7c8494}.sv.t-map .mp .msplit .sb i.new{background:linear-gradient(270deg,#f3d08a,#c9944a)}
.sv.t-map .mp.cur .msplit .sb i,.sv.t-map.static .msplit .sb i{transform:none}
.sv.t-map .mp .msplit .sl{display:flex;margin-top:16px}
.sv.t-map .mp .msplit .sl>div{box-sizing:border-box;padding-left:14px;display:flex;flex-direction:column;align-items:flex-start;opacity:0;transform:translateY(10px);transition:opacity .6s var(--e1),transform .7s var(--e1)}
.sv.t-map .mp.cur .msplit .sl>div,.sv.t-map.static .msplit .sl>div{opacity:1;transform:none}
.sv.t-map .mp .msplit .sl b{font-size:64px;line-height:1;color:#9aa2b1}
.sv.t-map .mp .msplit .sl span{margin-top:8px;font:500 26px/1.3 var(--fb);color:#d6dae2}
.sv.t-map .mp .msplit .sl .new span{color:#f1e6cf}
.sv.t-map .mp .msplit .sl .new b{background:none;color:#e9bc6c;-webkit-text-fill-color:#e9bc6c}
.sv.t-map .mp .msplit .sl small{margin-top:4px;font:500 21px/1.3 var(--fb);color:var(--mute)}
/* slide 8 «حجم الأزمة»: wider row, each pair its own card (06:33) */
.sv.t-kq .kbody:has(.k-pairs.cards){left:80px;right:80px}
.sv.t-kq .chart.k-pairs.cards{gap:24px;align-items:stretch}
.sv.t-kq .k-pairs.cards .grp{padding:30px 22px 84px;margin-bottom:6px;border-radius:28px;background:linear-gradient(180deg,rgba(255,255,255,.065),rgba(255,255,255,.02));border:1px solid rgba(255,255,255,.1);box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 30px 60px -30px rgba(0,0,0,.8)}
.sv.t-kq .k-pairs.cards .gh{min-height:96px;justify-content:center;text-align:center}
/* slide 12: bigger photographs */
.sv.t-spans .sth{right:250px!important;top:-12px!important;width:300px!important;height:160px!important;border-radius:18px!important}
.sv.t-spans .sr .sn{right:40px!important;top:44px!important;width:196px!important}
/* ── mesh backgrounds (06:42) ── */
.sv.hasmesh{isolation:isolate;background:#05070d}
.sv.hasmesh>.glow{display:none}
.sv .mesh{position:absolute;inset:-6%;z-index:-1;pointer-events:none;animation:svmesh 26s ease-in-out infinite alternate}
.sv.static .mesh{animation:none}
.sv .mesh::after{content:"";position:absolute;inset:0;background:radial-gradient(62% 58% at 50% 52%,rgba(5,7,13,.62),rgba(5,7,13,.25) 60%,transparent 85%)}
@keyframes svmesh{0%{transform:translate3d(0,0,0) scale(1)}100%{transform:translate3d(-2.2%,1.6%,0) scale(1.05)}}
.sv .mesh.m0{background:radial-gradient(55% 75% at 0% 100%,rgba(232,122,42,.55),transparent 70%),radial-gradient(60% 75% at 100% 100%,rgba(48,108,188,.5),transparent 70%),radial-gradient(40% 40% at 60% 0%,rgba(30,60,120,.35),transparent 70%)}
.sv .mesh.m1{background:radial-gradient(70% 48% at 22% 0%,rgba(240,152,62,.5),transparent 70%),radial-gradient(55% 55% at 98% 8%,rgba(58,120,200,.45),transparent 70%),radial-gradient(50% 40% at 50% 100%,rgba(24,48,98,.4),transparent 70%)}
.sv .mesh.m2{background:radial-gradient(circle at 70% 64%,#05070d 0 31%,rgba(5,7,13,0) 45%),radial-gradient(60% 62% at 30% 22%,rgba(240,150,58,.5),transparent 70%),radial-gradient(52% 60% at 12% 90%,rgba(58,120,200,.45),transparent 70%)}
.sv .mesh.m3{background:radial-gradient(70% 90% at 0% 40%,rgba(52,108,184,.42),transparent 70%),radial-gradient(60% 80% at 100% 30%,rgba(236,150,62,.42),transparent 70%),radial-gradient(40% 50% at 55% 50%,rgba(150,160,170,.12),transparent 70%)}
.sv .mesh.m4{background:radial-gradient(55% 48% at 86% 4%,rgba(58,120,200,.45),transparent 70%),radial-gradient(46% 46% at 64% 82%,rgba(240,162,72,.42),transparent 70%)}
.sv .mesh.m5{background:radial-gradient(circle at 95% 55%,#05070d 0 28%,rgba(5,7,13,0) 44%),radial-gradient(52% 50% at 34% 0%,rgba(232,122,42,.55),transparent 70%),radial-gradient(60% 52% at 40% 100%,rgba(80,140,200,.4),transparent 70%)}
/* ── part cover: the number (06:42) ── */
.sv.t-section .snum{position:absolute;left:-36px;top:-170px;bottom:-170px;width:960px;z-index:2;display:flex;align-items:center;justify-content:flex-start;direction:ltr;pointer-events:none}
.sv.t-section .snum span{font:400 1180px/0.8 SVnum,var(--fd);letter-spacing:.005em;background:radial-gradient(48% 42% at 46% 58%,rgba(5,7,13,.92),rgba(5,7,13,0) 70%),linear-gradient(185deg,rgba(246,215,154,.9) 0%,rgba(233,188,108,.6) 30%,rgba(170,120,60,.22) 62%,rgba(5,7,13,0) 90%);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;filter:drop-shadow(0 0 60px rgba(233,188,108,.12))}
.sv.t-section .snum{opacity:0;transform:translateX(-60px) scale(1.04);transition:opacity 1.6s var(--e1),transform 2.2s var(--e1)}
.sv.t-section .snum.in,.sv.t-section.static .snum,.sv.t-section.on .snum[data-s="0"]{opacity:1;transform:none}
.sv.t-section .stx{position:absolute;right:140px;bottom:150px;width:780px;z-index:5;direction:rtl;text-align:right;display:flex;flex-direction:column;align-items:flex-start}
.sv.t-section .stx.nonum{right:160px;left:160px;width:auto;bottom:auto;top:50%;transform:translateY(-50%);align-items:center;text-align:center}
.sv.t-section .stx .sk2{display:flex;align-items:center;gap:20px;font:600 34px/1 var(--fd);color:var(--gold2,#e9bc6c);letter-spacing:.02em;margin-bottom:34px}
.sv.t-section .stx .sk2 i{width:70px;height:2px;background:linear-gradient(270deg,var(--gold2,#e9bc6c),transparent)}
.sv.t-section .stx.nonum .sk2 i:last-child{display:none}
.sv.t-section .stx .h1{font:700 96px/1.14 var(--fd);color:#fff;margin:0;max-width:780px;text-shadow:0 4px 40px rgba(0,0,0,.55)}
.sv.t-section .stx .h1.sm{font-size:76px;line-height:1.25}
.sv .nw{white-space:nowrap}
/* 08:01 Amr (his 109, 110) «الارقام محتاجة طريقة ظهور تاخد العين»: a title's figures land — they count up, swell past their size and
   settle, and a gold light passes over them once */
@keyframes gfpop{0%{opacity:0;transform:scale(.55)}55%{opacity:1;transform:scale(1.14)}100%{opacity:1;transform:scale(1)}}
@keyframes gfglow{0%,100%{box-shadow:0 0 0 rgba(233,188,108,0)}40%{box-shadow:0 0 46px 6px rgba(233,188,108,.55)}}
.sv.t-gallery .gt.gh .gf{transform-origin:100% 50%}
.sv.t-gallery .gt.gh.in .gf{animation:gfpop 1s cubic-bezier(.3,1.4,.5,1) .55s both,gfglow 2.2s ease 1.2s 1}
.sv.t-gallery .gt.gh .gf .num{display:inline-block;background-size:200% 100%!important}
.sv.t-gallery .gt.gh b .hl{display:inline-block;transform-origin:50% 60%}.sv.t-gallery .gt.gh.in b .hl{animation:gfpop 1s cubic-bezier(.3,1.4,.5,1) .7s both,gfglow 2.2s ease 1.4s 1}
.sv .gi .gfig{position:absolute;left:18px;top:18px;z-index:4;display:flex;flex-direction:column;gap:10px;max-width:62%;direction:rtl;opacity:0;transform:translateY(-10px);transition:opacity .7s ease .9s,transform .9s cubic-bezier(.2,.8,.2,1) .9s}
.sv .gi.in .gfig,.sv.static .gi .gfig{opacity:1;transform:none}
.sv .gi .gfx{padding:12px 18px 14px;border-radius:18px;background:rgba(6,9,16,.78);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border:1px solid rgba(233,188,108,.45);box-shadow:0 18px 40px -16px rgba(0,0,0,.8)}
.sv .gi .gfx small{display:block;font:500 19px/1.3 var(--fb);color:#c9ced8;margin-bottom:2px}
.sv .gi .gfx .gv{display:flex;align-items:baseline;gap:10px}.sv .gi .gfx .gv b{font-size:66px;line-height:1}.sv .gi .gfx .gv span{font:700 26px/1.15 var(--fd);color:#fff}
.sv .gi .gfig.xs{left:10px;top:10px;max-width:calc(100% - 20px)}.sv .gi .gfig.xs .gfx .gv{flex-direction:column;align-items:flex-start;gap:2px}.sv .gi .gfig.xs .gfx .gv b{font-size:44px}.sv .gi .gfig.xs .gfx .gv span{font-size:19px}
.sv .gi .gfig.sm .gfx{padding:9px 14px 10px}.sv .gi .gfig.sm .gfx .gv b{font-size:50px}.sv .gi .gfig.sm .gfx .gv span{font-size:22px}.sv .gi .gfig.sm .gfx small{font-size:17px}
.sv.t-proj .ppanel:has(.pfx) .psts{margin:26px 0 18px;padding:20px 0}
.sv.t-proj .ppanel:has(.pfx) .psts.two{flex-direction:row;gap:24px}.sv.t-proj .ppanel:has(.pfx) .psts.two .pst{flex:1}
.sv.t-proj .ppanel:has(.pfx) .psts.two .pst .pv .num{font-size:92px}
/* 08:55 the hub (right) and its three results (left), side by side in the middle */
.sv.t-stats .pad.hub{justify-content:center;padding-top:96px;padding-bottom:96px}
.sv.t-stats .pad.hub .ss{max-width:1180px;text-wrap:balance}
.sv.t-stats .hubrow{display:flex;flex-direction:row;gap:44px;align-items:stretch;margin-top:54px;direction:rtl}
.sv.t-stats .hubA{flex:0 0 640px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;gap:30px;padding:44px 52px;border-radius:36px}
.sv.t-stats .hv{display:flex;flex-direction:column;gap:6px}
.sv.t-stats .hv .l1{font:500 28px/1.2 var(--fb);color:#c9ced8}
.sv.t-stats .hv .l2{display:flex;align-items:baseline;gap:16px}.sv.t-stats .hv .l2 .num{font-size:150px;line-height:.9}.sv.t-stats .hv .l2 u{text-decoration:none;font:700 46px/1.1 var(--fd);color:#fff}
.sv.t-stats .hv .l3{font:600 36px/1.2 var(--fd);color:#e6e9ef}.sv.t-stats .hv .l3 .num{font-size:54px}
.sv.t-stats .hdots{display:grid;grid-template-columns:repeat(9,40px);gap:14px 15px;direction:rtl}
.sv.t-stats .hdots i{width:40px;height:40px;border-radius:50%;opacity:0;transform:scale(.3);transition:opacity .4s ease,transform .6s cubic-bezier(.22,.8,.3,1)}
.sv.t-stats .hdots i.on{background:radial-gradient(circle at 35% 30%,#f6dca0,#c9944a);box-shadow:0 0 18px rgba(233,188,108,.45)}
.sv.t-stats .hdots i.wip,.sv.t-stats .hubA .l4 i.wip{border:2.5px dashed rgba(233,188,108,.8);box-sizing:border-box}
.sv.t-stats .hubA.in .hdots i,.sv.t-stats.static .hdots i{opacity:1;transform:none}
.sv.t-stats .hubA .l4{display:flex;align-items:center;gap:10px;font:500 26px/1.2 var(--fb);color:#c9ced8}.sv.t-stats .hubA .l4 i{width:24px;height:24px;border-radius:50%}.sv.t-stats .hubA .l4 .num{font-size:34px;color:var(--gold2)}
.sv.t-stats .hubB{flex:1;display:flex;flex-direction:column;justify-content:space-between;gap:22px;position:relative;padding-right:46px}
.sv.t-stats .hubB::before{content:"";position:absolute;right:12px;top:14%;bottom:14%;width:2px;border-radius:2px;background:linear-gradient(180deg,rgba(233,188,108,0),rgba(233,188,108,.7) 18%,rgba(233,188,108,.7) 82%,rgba(233,188,108,0))}
.sv.t-stats .hubB .hf{position:relative;flex:1;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:4px;padding:22px 44px;border-radius:30px;overflow:hidden}
.sv.t-stats .hubB .hf::before{content:"";position:absolute;right:-40px;top:50%;width:14px;height:14px;margin-top:-7px;border-radius:50%;background:#e9bc6c;box-shadow:0 0 14px rgba(233,188,108,.8)}
.sv.t-stats .hubB .hf{overflow:visible}
.sv.t-stats .hubB .hf .hic{position:absolute;left:34px;top:50%;width:150px;height:150px;transform:translateY(-50%) rotate(-6deg);color:#e9bc6c;opacity:.2;pointer-events:none}
.sv.t-stats .hubB .hf .pre{font:500 26px/1.2 var(--fb);color:#aeb5c2}
.sv.t-stats .hubB .hf .vu{display:flex;align-items:baseline;gap:16px}
.sv.t-stats .hubB .hf .v .num{font-size:96px;line-height:.95}.sv.t-stats .hubB .hf .u{font:700 36px/1.2 var(--fd);color:#fff}
.sv.t-proj .pfx{margin-top:22px;display:flex;flex-direction:column;gap:16px}
.sv.t-proj .pfr{display:flex;gap:16px}
.sv.t-proj .pfc{flex:1;display:flex;align-items:baseline;justify-content:center;gap:10px;padding:12px 10px;border-radius:20px;background:rgba(255,255,255,.05);border:1px solid rgba(233,188,108,.32)}
.sv.t-proj .pfc .num{font-size:64px;line-height:1}.sv.t-proj .pfc span{font:700 30px/1.2 var(--fd);color:#fff}
.sv.t-proj .pfch{display:flex;flex-wrap:wrap;gap:10px;justify-content:flex-start}
.sv.t-proj .pfch span{padding:8px 16px;border-radius:999px;background:rgba(233,188,108,.12);border:1px solid rgba(233,188,108,.35);font:600 24px/1 var(--fb);color:#f1e3c4}
.sv.t-gallery .grec{position:absolute;left:50%;bottom:34px;width:1300px;box-sizing:border-box;transform:translateX(-50%) translateY(30px);opacity:0;z-index:14;display:flex;align-items:center;gap:34px;direction:rtl;
  padding:22px 40px 22px 44px;border-radius:30px;background:linear-gradient(150deg,rgba(14,18,28,.94),rgba(8,10,16,.9));border:1px solid rgba(233,188,108,.55);
  box-shadow:0 40px 90px -30px rgba(0,0,0,.9),0 0 60px -20px rgba(233,188,108,.35);transition:opacity .9s ease 1.1s,transform 1.1s cubic-bezier(.2,.8,.2,1) 1.1s}
.sv.t-gallery .grec.in,.sv.t-gallery.static .grec{opacity:1;transform:translateX(-50%)}
/* 08:43 the plate as its own column beside the photographs (no overlap) */
.sv.t-gallery .grec.col{left:auto;right:60px;width:540px;transform:translateY(30px);flex-flow:row wrap;align-items:center;align-content:center;gap:26px 30px;padding:40px 40px 36px;border-radius:34px}
.sv.t-gallery .grec.col.in,.sv.t-gallery.static .grec.col{transform:none}
.sv.t-gallery .grec.col .gtx{display:contents}
.sv.t-gallery .grec.col .gk{order:1;width:100%;font-size:28px;line-height:1.35}
.sv.t-gallery .grec.col .gcert{order:2;margin:0;width:196px;height:263px}
.sv.t-gallery .grec.col .gd{order:3;flex:1;border:0;padding:0}
.sv.t-gallery .grec.col .gd b{font-size:170px}.sv.t-gallery .grec.col .gd span{font-size:56px}.sv.t-gallery .grec.col .gd small{font-size:28px}
.sv.t-gallery .grec.col .gt2{order:4;width:100%;font-size:42px;line-height:1.3;padding-top:22px;border-top:1px solid rgba(233,188,108,.3)}
.sv.t-gallery .grec.col .gs{order:5;width:100%;margin-top:-12px}
.sv.t-gallery .gal.geo.wrec .gi{border-radius:14px;overflow:hidden}
/* the New Delta map, whole */
/* 10:34 the road names on the roads map: small, in the roads' own blue */
.sv[data-id="s50"].t-map .mlabels>span{font-size:15px;font-weight:600;color:#cfe8ff}
.sv[data-id="s50"].t-map .mgrp b{font-size:16px}.sv[data-id="s50"].t-map .mgrp .gl span{font-size:15px;color:#cfe8ff}
/* the targets table */
.sv.t-kpis .pad.kpw{justify-content:flex-start;padding-top:140px;padding-bottom:70px}
.sv.t-kpis .kick{color:var(--gold2,#e9bc6c)}
.sv.t-kpis .h2.kq2{font-size:52px;margin:8px 0 26px}
.sv.t-kpis .ktab{display:flex;flex-direction:column;gap:10px;direction:rtl}
.sv.t-kpis .kr{display:grid;grid-template-columns:1fr 190px 60px 190px 250px;align-items:center;padding:0 30px;height:70px;border-radius:18px}
.sv.t-kpis .kr.kh{height:40px;background:none;border:0;font:600 22px/1 var(--fb);color:#9aa3b2}
.sv.t-kpis .kr.kh span:not(:first-child){text-align:center}
.sv.t-kpis .kn{font:600 28px/1.2 var(--fd);color:#f1f3f7}
.sv.t-kpis .ka,.sv.t-kpis .kb{display:flex;align-items:baseline;justify-content:center;gap:4px;direction:ltr}
.sv.t-kpis .ka .num{font-size:44px;color:#aeb6c4}.sv.t-kpis .kb .num{font-size:52px}
.sv.t-kpis .ka em,.sv.t-kpis .kb em{font:600 26px/1 var(--fd);font-style:normal;color:#8d96a6}.sv.t-kpis .kb em{color:var(--gold2,#e9bc6c)}
.sv.t-kpis .kar{text-align:center;font:600 30px/1 var(--fd);color:var(--acc,#e9bc6c)}
.sv.t-kpis .kc{display:flex;align-items:center;justify-content:center;gap:10px;font:700 34px/1 var(--fd);color:#5fd38d}
.sv.t-kpis .kc i{font-style:normal;font-size:20px}
/* 10:59 faster entrances */
.sv [data-s]{transition:opacity .5s var(--e1),transform .62s var(--e1),filter .5s var(--e1)}
/* 10:54 the ports: the 14 developed in the ports' blue, the 5 new in green */
.sv.t-map .ly-ports .pin.newp .dot{fill:#5fd38d}.sv.t-map .ly-ports .pin.newp .prg{stroke:#5fd38d}
.sv.t-map .pace .pr.pb b{color:#5cc0ea}.sv.t-map .pace .pr.pn b{color:#5fd38d}
.sv.t-map .pace .pr.pb b::before,.sv.t-map .pace .pr.pn b::before{content:"";display:inline-block;width:14px;height:14px;margin-left:12px;transform:rotate(45deg);background:currentColor;vertical-align:middle}
/* 10:40 the tunnels: two bars for each «نفقا», a flow each way */
.sv.t-map .ly-tunnels .tw .dot{fill:#f4c84a;stroke:rgba(6,9,15,.8);stroke-width:1.2}
.sv.t-map .ly-tunnels .tw .tfl{stroke:#0b111c;stroke-width:2;stroke-linecap:round;stroke-dasharray:3 6;animation:tflE 1.1s linear infinite}
.sv.t-map .ly-tunnels .tw .tfl.w{animation-name:tflW}.sv.t-map .ly-tunnels .tw .tfl.b{animation:none;stroke-dasharray:none;opacity:.35}
.sv.t-map .ly-tunnels .tw .tah{fill:#f4c84a;stroke:rgba(6,9,15,.8);stroke-width:1}
@keyframes tflE{to{stroke-dashoffset:-18}}@keyframes tflW{to{stroke-dashoffset:18}}
.sv.t-map[data-id="s62"] .mn.good.r>span,.sv.t-map[data-id="s59"] .mn.good.r>span{left:62px}   /* clear of the tunnel bars and their arrows */
.sv[data-id="s62"].t-map .mpics{top:150px;width:372px}.sv[data-id="s62"].t-map .mpic{width:372px;height:210px}
/* 10:46 Amr (his 91) «اظبط الكلام في نصف الصفحة»: a before/after strike with no photographs sits in the middle of the stage */
.sv.t-kq:not(:has(.phs)) .kbody:has(.k-strike){justify-content:center;padding-bottom:30px}
.sv.t-kq:not(:has(.phs)) .chart.k-strike{margin-bottom:0}
/* 10:03 a «still» slide (sc.still): everything on it from the first frame, nothing moves */
.sv.nomo [data-s]{opacity:1!important;transform:none!important;filter:none!important;transition:none!important}
.sv.nomo *,.sv.nomo *::before,.sv.nomo *::after{animation:none!important;transition:none!important}
.sv.t-ndmap{background:#0a0e17}
.sv.t-ndmap .ndw{position:absolute;inset:0;z-index:1}
.sv.t-ndmap .ndw svg{display:block;width:100%;height:100%}
.sv.t-ndmap .ndc{position:absolute;left:28px;top:232px;width:318px;box-sizing:border-box;z-index:12;padding:26px 28px 24px;border-radius:26px;direction:rtl;text-align:right;display:flex;flex-direction:column;gap:6px}
.sv.t-ndmap .ndc .kick{font:600 18px/1.3 var(--fd);color:var(--acc)}
.sv.t-ndmap .ndc .ph{font:700 44px/1.15 var(--fd);margin:2px 0 0;color:#fff}
.sv.t-ndmap .ndc .psub{font:500 19px/1.4 var(--fb);color:#c9ced8}
.sv.t-ndmap .ndc .pst{margin:12px 0 6px;padding:12px 0;border-top:1px solid rgba(233,188,108,.3);border-bottom:1px solid rgba(233,188,108,.3)}
.sv.t-ndmap .ndc .pre{font:500 20px/1.2 var(--fb);color:#c9ced8}
.sv.t-ndmap .ndc .pv{display:flex;align-items:baseline;gap:10px}.sv.t-ndmap .ndc .pv .num{font-size:96px;line-height:.95}.sv.t-ndmap .ndc .pv u{text-decoration:none;font:700 26px/1.1 var(--fd);color:var(--gold2)}
.sv.t-ndmap .ndc .pd{font:400 19px/1.55 var(--fb);color:#dfe3ea;margin:4px 0 0}
/* 09:23 a map label may carry a second line (n.s) — the route under the line's name */
.sv.t-map .mn>span .ms{display:block;margin-top:8px;font:500 21px/1.15 var(--fb);color:#d5dae3;letter-spacing:0}
.sv.t-gallery .grec .gcert{margin:-90px 0 -10px;width:170px;height:228px;flex:none;border-radius:8px;overflow:hidden;box-shadow:0 24px 50px -14px rgba(0,0,0,.9);transform:rotate(-3deg)}
.sv.t-gallery .grec .gcert img{width:100%;height:100%;object-fit:cover}
.sv.t-gallery .grec .gtx{flex:1;display:flex;flex-direction:column;gap:8px}
.sv.t-gallery .grec .gk{font:700 26px/1.2 var(--fd);color:var(--gold2,#e9bc6c);letter-spacing:.01em}
.sv.t-gallery .grec .gt2{font:700 40px/1.25 var(--fd);color:#fff}
.sv.t-gallery .grec .gs{font:500 22px/1.3 var(--fb);color:#aeb5c2}
.sv.t-gallery .grec .gd{display:flex;flex-direction:column;align-items:center;padding-right:34px;border-right:1px solid rgba(233,188,108,.35)}
.sv.t-gallery .grec .gd small{font:500 24px/1 var(--fb);color:#c9ced8}
.sv.t-gallery .grec .gd div{display:flex;align-items:baseline;gap:8px;direction:ltr}.sv.t-gallery .grec .gd b{font-size:130px;line-height:.95}.sv.t-gallery .grec .gd span{font:700 44px/1 var(--fd);color:var(--gold2,#e9bc6c)}
.sv.t-map .mpics{position:absolute;left:96px;top:430px;width:420px;display:flex;flex-direction:column;gap:22px;z-index:6;pointer-events:none}
.sv.t-map .mpic{position:relative;margin:0;width:420px;height:236px;border-radius:22px;overflow:hidden;border:1px solid rgba(255,255,255,.22);box-shadow:0 30px 70px -26px rgba(0,0,0,.85)}
.sv.t-map .mpic img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.sv.t-map .mpic img.cr{inset:auto;object-fit:cover;direction:ltr}.sv.t-map .mpic{direction:ltr}
.sv.t-map .mpic figcaption{position:absolute;right:0;left:0;bottom:0;padding:24px 16px 10px;font:600 20px/1.2 var(--fb);color:#fff;text-align:right;background:linear-gradient(0deg,rgba(4,6,11,.85),transparent)}
.sv.t-proj .prk{margin-top:22px;display:flex;flex-direction:column;gap:12px}
.sv.t-proj .prk .rpre{font:500 26px/1.3 var(--fb);color:#c9ced8}
.sv.t-proj .prk .rts{display:flex;gap:16px}
.sv.t-proj .prk .rt{flex:1;display:flex;flex-direction:column;align-items:center;gap:0;padding:10px 10px 12px;border-radius:22px;background:linear-gradient(160deg,rgba(233,188,108,.16),rgba(233,188,108,.04));border:1px solid rgba(233,188,108,.38)}
.sv.t-proj .prk .rt small{font:500 20px/1 var(--fb);color:#c9ced8}
.sv.t-proj .prk .rt b{font-size:80px;line-height:.95}
.sv.t-proj .prk .rt span{font:700 30px/1.2 var(--fd);color:#fff}
.sv.t-proj .prk .rcap{font:500 25px/1.35 var(--fb);color:#c9ced8;text-align:center}
.sv.t-proj .prk .rcost{display:flex;align-items:baseline;gap:12px;margin-top:2px;padding-top:12px;border-top:1px solid rgba(255,255,255,.14);font:500 28px/1.2 var(--fb);color:#e6e9ef}
.sv.t-proj .prk .rcost svg{width:30px;height:30px;color:var(--gold2,#e9bc6c);align-self:center}.sv.t-proj .prk .rcost b{font-size:50px;line-height:1}
.sv.t-kq .k-sys .it .nw{font-size:.72em;color:var(--gold2,#e9bc6c)}
.sv.t-kq .k-col .ad span:has(small.u2){display:flex;align-items:center;gap:12px}.sv.t-kq .k-col .ad small.u2{line-height:1.2;text-align:right}
/* 08:35 «بيحصل jump animation»: the triangle slides down and settles — no overshoot */
.sv .darr{display:inline-flex;align-self:center;font-style:normal;opacity:0;transform:translateY(-28px);transition:opacity .6s ease .7s,transform .9s cubic-bezier(.22,.8,.3,1) .7s}
.sv.t-kq .k-strike .sa.now{opacity:1;transform:none;filter:none;transition:opacity .8s ease}
.sv .darr svg{width:100%;height:auto;fill:url(#svgold);fill:#e9bc6c;filter:drop-shadow(0 6px 18px rgba(233,188,108,.45))}
.sv .in .darr,.sv.static .darr{opacity:1;transform:none}
.sv.t-kq .k-strike .sb .darr{width:64px;margin-top:-40px}
.sv.t-kq .k-duo .db .darr{width:50px;margin-top:-20px}
.sv.t-kq .pv .darr{width:22px;margin-inline-start:8px;transform:translateY(-14px);transition-delay:2.4s}
.sv.t-kq .grp.in .pv .darr{opacity:1;transform:none}
.sv.t-kq .pv .darr svg{fill:#ff8a7a;filter:none;position:static!important;width:22px!important;height:19px!important;inset:auto!important}
.sv.t-kq .pv .pvn{display:inline-flex;align-items:center;direction:ltr}
.sv.t-section .stx.nonum .h1{max-width:1400px}
.sv.t-section .stx:has(.scards) .sk2{font-size:40px;margin-bottom:56px}
.sv.t-section .scards{display:flex;gap:34px;justify-content:center;direction:rtl}
.sv.t-section .scard{width:440px;min-height:300px;padding:44px 36px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;text-align:center}
.sv.t-section .scard svg{width:84px;height:84px;color:var(--gold2,#e9bc6c);filter:drop-shadow(0 0 24px rgba(233,188,108,.35))}
.sv.t-section .scard b{font:700 52px/1.25 var(--fd);color:#fff}
.sv.t-section .stx .p{margin-top:28px;font:500 38px/1.35 var(--fb);color:#c9ced8}
.sv.t-section .bg.sbg::after{background:linear-gradient(270deg,rgba(4,6,11,.9) 0%,rgba(4,6,11,.72) 40%,rgba(4,6,11,.55) 100%),linear-gradient(0deg,rgba(4,6,11,.75),transparent 55%)!important}
.sv.t-section .bg.sbg .gi img,.sv.t-section .bg.sbg img{filter:brightness(.62) saturate(.75)}
.sv.t-section .bg.sbg.gray .gi img,.sv.t-section .bg.sbg.gray img{filter:grayscale(1) brightness(.6) contrast(1.05)}
/* slide 10: the choice (06:49) */
.sv.t-split .two{position:relative}
.sv.t-split .two .pick{position:absolute;width:0;height:0}
.sv.t-split .card{position:relative;z-index:2;transition:transform 1.8s cubic-bezier(.34,1.3,.5,1),opacity 1.4s var(--e1),filter 1.4s var(--e1),box-shadow 1.4s var(--e1)}
.sv.t-split .card.a{transform-origin:100% 50%}.sv.t-split .card.b{transform-origin:0% 50%}
.sv.t-split .two:has(.pick.in) .card.a{transform:scale(1.13)!important;box-shadow:0 0 0 1px rgba(233,188,108,.45),0 50px 110px -40px rgba(233,188,108,.55)}
.sv.t-split .two:has(.pick.in) .card.b{transform:scale(.84)!important;opacity:.42;filter:saturate(.5) blur(1px)}
.sv.t-split .halo{position:absolute;z-index:1;top:-34px;bottom:-34px;right:-46px;width:calc(50% + 60px);border-radius:60px;pointer-events:none;opacity:0;transition:opacity 1.6s var(--e1)}
.sv.t-split .halo::before{content:"";position:absolute;inset:0;border-radius:inherit;background:radial-gradient(closest-side,rgba(233,188,108,.55),rgba(233,150,60,.22) 60%,transparent);filter:blur(28px);animation:svhalo2 4.5s ease-in-out infinite}
.sv.t-split .card.a .ring{position:absolute;inset:-1px;border-radius:inherit;padding:2.5px;pointer-events:none;background:conic-gradient(from var(--ha,0deg),rgba(246,215,154,.12) 0 55%,rgba(246,215,154,.95) 70%,rgba(246,215,154,.12) 85% 100%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:0;transition:opacity 1.4s var(--e1);animation:svhaloring 6s linear infinite}
.sv.t-split .two:has(.pick.in) .card.a .ring{opacity:1}
@property --ha{syntax:'<angle>';inherits:false;initial-value:0deg}
@keyframes svhaloring{to{--ha:360deg}}
@keyframes svhalo2{0%,100%{transform:scale(.97);opacity:.7}50%{transform:scale(1.04);opacity:1}}
.sv.t-split .two:has(.pick.in) .halo{opacity:1}
.sv.t-split.static .halo::before,.sv.t-split.static .card.a .ring{animation:none}
.sv.t-kq .k-pairs.cards .px .pxs{display:block;align-self:center;width:100%;text-align:center;font:500 19px/1 var(--fb);color:#c9ced8;margin-bottom:8px;white-space:nowrap}
.sv.t-split .card{text-align:center}.sv.t-split .card h3,.sv.t-split .card p{text-align:center;text-align-last:center}
`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
})();
