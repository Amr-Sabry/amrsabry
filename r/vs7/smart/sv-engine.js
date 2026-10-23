/* Smart Visual engine — renders a keynote scene (data in sv1-data.js) on a 1920×1080 stage, with builds (steps) and motion.
   SV.render(deck, i, {static, thumb, base}) → element ; SV.step(el, k) shows builds ≤ k ; SV.enter(el) starts the motion. */
(function () {
  const SV = window.SV = {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const IMG = (n, base) => (base || '') + '../img/c6/image' + n + '.webp';
  const ICON = {   /* lucide outlines, inlined so the stage needs nothing else */
    build: '<path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01"/>',
    link: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
    zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
    factory: '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1M12 18h1M7 18h1"/>',
    people: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    briefcase: '<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    'heart-pulse': '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
    'graduation-cap': '<path d="M21.42 10.92a1 1 0 0 0-.02-1.84L12.83 5.2a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.83l8.57 3.91a2 2 0 0 0 1.66 0z"/><path d="M22 10v6M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    sprout: '<path d="M7 20h10M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>'
  };
  const icon = (k, cls) => `<svg class="${cls || ''}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">${ICON[k] || ''}</svg>`;
  const CH_ICON = ['build', 'link', 'zap', 'factory', 'people'];
  /* a number that counts: «23.5», «64», «5.2%»; anything else («15–20») just appears */
  const num = (v, from, cls) => `<span class="num ${cls || ''}" data-to="${esc(v)}"${from != null ? ` data-from="${esc(from)}"` : ''}>${esc(v)}</span>`;
  const S = (k, cls) => ` data-s="${k}"${cls ? ` class="${cls}"` : ''}`;
  function bg(sc, base, cls) {
    if (sc.bg == null) return '';
    return `<div class="bg ${sc.gray ? 'gray ' : ''}${cls || ''}"><img src="${IMG(sc.bg, base)}" alt="" decoding="async"></div>`;
  }
  function ring(deck, ch) {
    if (!ch) return '';
    const n = 5, R = 19, C = 2 * Math.PI * R, seg = C / n, gap = 4;
    let arcs = '';
    for (let i = 0; i < n; i++) {
      const col = i + 1 === ch ? deck.acc['c' + ch] : i + 1 < ch ? 'rgba(233,188,108,.55)' : 'rgba(255,255,255,.16)';
      arcs += `<circle cx="23" cy="23" r="${R}" fill="none" stroke="${col}" stroke-width="5" stroke-dasharray="${(seg - gap).toFixed(2)} ${(C - seg + gap).toFixed(2)}" stroke-dashoffset="${(-i * seg).toFixed(2)}" transform="rotate(-90 23 23)"/>`;
    }
    return `<div class="ring"><svg viewBox="0 0 46 46">${arcs}</svg><span><b>${esc(deck.chapters[ch - 1])}</b> · ${ch} / 5</span></div>`;
  }
  const mark = base => `<img class="mark" src="${IMG(4, base)}" alt="">`;

  const R = {};
  /* 15:45 Amr «من الكوفر شيل صورة قناة السويس عاوزها ديزاين بس»: no photo — Egypt drawn in fine gold line work (the outline,
     the Nile, the new roads and rail, the new cities), drawing itself in as the cover comes up. Geodata: sv-geo.js (SVGEO) */
  function coverArt() {
    const W = window.SVGEO, G = W && W.geo; if (!G) return '';
    const X0 = 24.6, Y0 = 31.75, C = Math.cos(27 * Math.PI / 180), K = 80, OX = 120, OY = 160;
    const xy = ([lo, la]) => [OX + (lo - X0) * C * K, OY + (Y0 - la) * K];
    const P = q => xy(q).map(v => v.toFixed(1)).join(',');
    const line = (pts, cls) => `<path class="${cls}" pathLength="1" d="M${pts.map(P).join('L')}"/>`;
    let s = '';
    (G.egypt || []).forEach(poly => { s += `<path class="eg" pathLength="1" d="M${poly[0].map(P).join('L')}Z"/>`; });
    const zs = (W.zones || []).filter(z => z.t === 'valley');   /* the inhabited valley and delta, a soft wash under the lines */
    zs.forEach(z => (z.g === 'Polygon' ? [z.c] : z.c).forEach(pg => { s += `<path class="vl" d="M${pg[0].map(P).join('L')}Z"/>`; }));
    (G.nile || []).forEach(l => ((l.t === 'MultiLineString') ? l.c : [l.c || l]).forEach(c => { s += line(c, 'nl'); }));
    (W.lines || []).forEach(l => { if (l.t !== 'digital' && l.p) s += line(l.p, 'ln ' + l.t); });
    Object.values(W.nodes || {}).filter(n => n.t === 'city').forEach((n, i) => { const [x, y] = xy(n.p);
      s += `<circle class="dt" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" style="transition-delay:${(1.7 + i * .05).toFixed(2)}s"/>`; });
    return `<svg class="art" viewBox="0 0 1920 1080" aria-hidden="true">${s}</svg>`;
  }
  /* 22 Oct 15:33 Amr: the cover carries the Cabinet's seal and the forum's logo, top right (sc.logos: IMG numbers, right to left) */
  R.cover = (sc, d, o) => `${bg(sc, o.base, 'full')}${sc.art ? `<div class="artw"${S(0)}>${coverArt()}</div>` : ''}${sc.logos ? `<div class="logos"${S(0, 'fade')}>${sc.logos.map((n, i) => `${i ? '<i></i>' : ''}<img src="${IMG(n, o.base)}" alt="">`).join('')}</div>` : ''}<div class="pad">
    <div class="kick"${S(0)}>${esc(sc.kicker)}</div>
    <h1 class="h1 gold mask"${S(0)}><span>${esc(sc.title[0])}</span></h1>
    <div class="yr"${S(0)}>${esc(sc.title[1]).replace('←', '<i>←</i>')}</div>
    <div class="p"${S(0)}>${esc(sc.sub)}</div></div>`;
  /* 15:34 Amr: «صورة سيادة الرئيس… بنفس الاسلوب»: sc.img = V6 slide 2's photo of the President (image7, not cut out:
     15:43 «ما تفصلهاش»), on the right, facing the questions, melting into the stage like the quote's photo */
  R.questions = (sc, d, o) => `${sc.img ? `<div class="por"${S(0, 'fade')}><img src="${IMG(sc.img, o.base)}" alt=""></div>` : ''}<div class="pad"><div class="lead"${S(0)}>${esc(sc.lead)}</div><ol>${sc.qs.map((q, i) =>
    `<li${S(i)}><span class="n num">${i + 1}</span><span class="${i === sc.qs.length - 1 ? 'gold' : ''}">${esc(q)}</span></li>`).join('')}</ol></div>`;
  R.act = (sc) => `<div class="pad"><div class="kq"${S(0)}><i></i><span>${esc(sc.k || '')}</span><i></i></div>
    <h1 class="h1 mask ${sc.red ? '' : 'gold'}"${S(0)} style="${sc.red ? 'color:#ff8a7a' : ''}"><span>${esc(sc.q)}</span></h1><div class="p"${S(0)}>${esc(sc.sub)}</div></div>`;
  R.statement = (sc, d, o) => `${bg(sc, o.base)}<div class="pad">${sc.lines.map(l => `<div class="ln ${l.c || ''}${l.c === 'hero' ? ' gold' : ''}"${S(l.s)}>${esc(l.t)}</div>`).join('')}
    ${sc.foot ? `<div class="foot"${S(sc.steps - 1)}><span class="chip glass">${esc(sc.foot)}</span></div>` : ''}</div>`;
  R.crisis = (sc) => `<div class="pad"><h2 class="h2"${S(0)}>${esc(sc.title)}</h2><div class="note"${S(0)}>${esc(sc.note)}</div>
    <div class="rows">${sc.rows.map((r, i) => {
      const a = parseFloat(r.a), b = parseFloat(r.b), k = r.up ? Math.min(1, a / b) : Math.min(1, b / a);
      return `<div class="r glass"${S(i)} data-k="${k.toFixed(3)}"${r.up ? ' data-up="1"' : ''}><div class="l">${esc(r.l)}</div><div class="bar"><i style="transform:${r.up ? `scaleX(${k.toFixed(3)})` : 'none'}"></i></div>
        <div class="v"><s class="num">${esc(r.a)}</s><i>←</i><b class="num">${esc(r.b)}</b>${r.u ? `<em>${esc(r.u)}</em>` : ''}</div></div>`;
    }).join('')}</div></div>`;
  R.pressures = (sc, d, o) => `<div class="pad"><h2 class="h2"${S(0)}>${esc(sc.title)}</h2><div class="grid">${sc.items.map((t, i) =>
    `<div class="tile"${S(i, 'zoom')}><img src="${IMG(sc.bgs[i % sc.bgs.length], o.base)}" alt=""><b class="num">0${i + 1}</b><span>${esc(t)}</span></div>`).join('')}</div></div>`;
  R.generations = (sc) => {
    const all = [...sc.rows, sc.eg], max = 30;
    const row = (r, eg, i) => `<div class="row${eg ? ' eg' : ''}"${S(0)} style="transition-delay:${(i * .18).toFixed(2)}s"><div class="c">${esc(r.c)}<small>منذ <span class="num">${r.y0}</span></small></div>
      <div class="track"><i style="right:0;width:${(r.y / max * 100).toFixed(1)}%;transition-delay:${(.4 + i * .18).toFixed(2)}s"></i>
      <em style="right:calc(${(r.y / max * 100).toFixed(1)}% + 22px)"><span class="num">${esc(r.yt || r.y)}</span> ${eg ? 'عامًا حتى اليوم' : 'عامًا'}</em></div></div>`;
    return `<div class="pad"><h2 class="h2"${S(0)}>${esc(sc.title)}</h2><div class="tl">${sc.rows.map((r, i) => row(r, 0, i)).join('')}${row(sc.eg, 1, sc.rows.length)}</div></div>`;
  };
  R.split = (sc) => `<div class="pad"><h2 class="h2"${S(0)}>${esc(sc.title)}</h2><div class="two">
    <div class="card glass a"${S(0)}><h3>${esc(sc.a.h)}</h3><p>${esc(sc.a.p)}</p></div>
    <div class="card glass b"${S(1)}><h3>${esc(sc.b.h)}</h3><p>${esc(sc.b.p)}</p></div></div>
    <div class="end gold"${S(2)}>${esc(sc.end)}</div></div>`;
  R.system = (sc, d) => `<div class="pad"><h2 class="h2"${S(0)}>${esc(sc.title)}</h2><div class="chain">${sc.items.map((it, i) =>
    `<div class="node glass" style="--c:${d.acc['c' + (i + 1)]}"${S(i)}><div class="i">${icon(CH_ICON[i])}</div><div class="k num">0${i + 1}</div><h3>${esc(it.n)}</h3><p>${esc(it.p)}</p></div>`).join('')}</div></div>`;
  R.chapter = (sc, d, o) => `${bg(sc, o.base)}<div class="pad"><div class="idx"${S(0)}><span class="num">0${sc.ch}</span></div>
    <h1 class="h1 mask"${S(0)}><span>${esc(sc.name)}</span></h1><div class="p"${S(0)}>${esc(sc.line)}</div></div>`;
  const still = (v, cls) => `<span class="num ${cls || ''}">${esc(v)}</span>`;
  const val = (x, from, cls, st) => x.u === '%' ? (st ? still(x.v + '%', cls) : num(x.v + '%', from ? from.v + '%' : null, cls)) : (st ? still(x.v, cls) : num(x.v, from ? from.v : null, cls)) + (x.u ? `<u>${esc(x.u)}</u>` : '');
  R.compare = (sc, d, o) => {
    const late = sc.steps >= 3 ? 2 : 1;
    const arrow = `<svg class="arrow" viewBox="0 0 150 60"${S(1)}><path d="M146 30H8M30 8 8 30l22 22"/></svg>`;
    return `${bg(sc, o.base)}<div class="pad"><div class="lab"${S(0)}>${esc(sc.label)}</div>
      <div class="vs"><div class="side a"${S(0)}><div class="y">${esc(sc.a.y)}</div><div class="v">${val(sc.a, null, '', 1)}</div></div>
      ${arrow}
      <div class="side b"${S(1)}><div class="y">${esc(sc.b.y)}</div><div class="v">${val(sc.b, sc.down ? null : sc.a, 'gold')}</div></div></div>
      <div class="delta"${S(1)}>${esc(sc.delta)}</div>${sc.note ? `<div class="note"${S(late)}>${esc(sc.note)}</div>` : ''}</div>`;
  };
  R.race = (sc) => {
    const mx = Math.max(sc.a.v, sc.b.v);
    const lane = (x, k, c) => `<div class="lane ${c}"${S(k)}><div class="v">${num(String(x.v), null, c === 'b' ? 'gold' : '')}<u>${esc(x.t)}<br>${esc(x.p)}</u></div>
      <div class="bar"><i style="width:${(x.v / mx * 100).toFixed(1)}%"></i><span>${esc(x.s)}</span></div></div>`;
    return `<div class="pad"><div class="lab"${S(0)}>${esc(sc.label)}</div><div class="lanes">${lane(sc.a, 0, 'a')}${lane(sc.b, 1, 'b')}</div><div class="note"${S(1)}>${esc(sc.note)}</div></div>`;
  };
  /* items (22 Oct 14:25 Amr «لو اتكلمنا عن مدن جديدة لازم كل المدن تكون داخلة معاها»): every name as a chip under the title */
  R.photo = (sc, d, o) => `${bg(sc, o.base, 'soft')}<div class="pad"><h1 class="h1 mask"${S(0)}><span>${esc(sc.h)}</span></h1>${sc.p ? `<div class="p"${S(0)}>${esc(sc.p)}</div>` : ''}${sc.items ? `<div class="chips2"${S(0)}>${sc.items.map(x => `<span>${esc(x)}</span>`).join('')}</div>` : ''}</div>`;
  R.quote = (sc, d, o) => `<div class="por"${S(0, 'fade')}><img src="${IMG(sc.img, o.base)}" alt=""></div><div class="pad"><div class="qm"${S(0)}>«</div>
    <blockquote${S(0)}>${esc(sc.q)}</blockquote><div class="q2"${S(0)}>${esc(sc.q2)}</div><cite${S(0)}>${esc(sc.by)}</cite></div>`;
  R.stat = (sc, d, o) => `${bg(sc, o.base)}<div class="pad"><div class="kick"${S(0)}>${esc(sc.kicker)}</div>
    <div class="v"${S(0)}>${num(sc.v, null, 'gold')}<u>${esc(sc.u)}</u></div><div class="p"${S(0)}>${esc(sc.p)}</div>
    ${sc.chips && sc.chips.length ? `<div class="chips">${sc.chips.map((c, i) => `<span class="chip glass"${S(Math.min(sc.steps - 1, 1))} style="transition-delay:${(i * .12).toFixed(2)}s">${esc(c)}</span>`).join('')}</div>` : ''}</div>`;
  const card = (it, k, big) => `<div class="card glass"${S(k)}>${it.l ? `<div class="l">${esc(it.l)}</div>` : ''}
    ${it.a != null ? `<div class="from"><s>${esc(it.a)}</s> ←</div>` : ''}<div class="v">${num(it.v != null ? it.v : it.b, it.a, 'gold')}<u>${esc(it.u)}</u></div>${it.p ? `<p>${esc(it.p)}</p>` : ''}</div>`;
  R.duo = (sc, d, o) => `${bg(sc, o.base)}<div class="pad"><h2 class="h2"${S(0)}>${esc(sc.title)}</h2><div class="cards">${sc.items.map((it, i) => card(it, Math.min(i, sc.steps - 1))).join('')}</div>${sc.note ? `<div class="note"${S(sc.steps - 1)}>${esc(sc.note)}</div>` : ''}</div>`;
  R.trio = (sc, d, o) => `${bg(sc, o.base)}<div class="pad"><h2 class="h2"${S(0)}>${esc(sc.title)}</h2><div class="cards">${sc.items.map((it, i) => card(it, Math.min(i, sc.steps - 1))).join('')}</div>${sc.note ? `<div class="note"${S(sc.steps - 1)}>${esc(sc.note)}</div>` : ''}</div>`;
  R.whatif = (sc) => `<div class="pad"><h2 class="h2"${S(0)} style="color:#ffb3a8">${esc(sc.title)}</h2>
    <div class="head"${S(0)}><div class="w">لو لم نتدخل</div><div class="h">ما حدث بالفعل</div></div>
    <div class="rows">${sc.rows.map((r, i) => `<div class="r"${S(i)}><div class="w">${esc(r.w)}</div><div class="h">${esc(r.h)}</div></div>`).join('')}</div></div>`;
  R.shocks = (sc) => `<div class="pad"><h2 class="h2"${S(0)}>${esc(sc.title)}</h2><div class="line"${S(0, 'fade')}></div>
    <div class="evs">${sc.ev.map((e, i) => `<div class="ev"${S(0)} style="transition-delay:${(.25 + i * .22).toFixed(2)}s"><b class="num">${e.y}</b><span>${esc(e.t)}</span></div>`).join('')}</div>
    <div class="end gold"${S(1)}>${esc(sc.end)}</div></div>`;
  R.voices = (sc) => `<div class="pad"><h2 class="h2"${S(0)}>${esc(sc.title)}</h2><div class="cards">${sc.items.map((v, i) =>
    `<div class="card glass"${S(i)}><q>${esc(v.q)}</q><div class="s">${esc(v.s)}</div></div>`).join('')}</div></div>`;
  R.targets = (sc) => `<div class="pad"><h2 class="h2"${S(0)}>${esc(sc.title)}</h2><div class="grid">${sc.items.map((t, i) =>
    `<div class="card glass"${S(0)} style="transition-delay:${(i * .15).toFixed(2)}s">${num(t.v, null, 'gold')}<span>${esc(t.l)}</span></div>`).join('')}</div></div>`;
  R.citizen = (sc) => `<div class="pad"><h2 class="h2 gold"${S(0)}>${esc(sc.title)}</h2><div class="grid">${sc.items.map((t, i) =>
    `<div class="card glass"${S(0)} style="transition-delay:${(i * .14).toFixed(2)}s">${icon(t.i)}<span>${esc(t.l)}</span></div>`).join('')}</div></div>`;
  R.close = (sc, d, o) => `${bg(sc, o.base)}<div class="pad"><div class="a"${S(0)}>${esc(sc.a)}</div><div class="b gold"${S(0)} style="transition-delay:.5s">${esc(sc.b)}</div><div class="c"${S(1)}>${esc(sc.c)}</div></div>`;
  /* 16:35 Amr «استخدم اللوجو ده»: sc.logo = the forum's full logo (imageF1: his symbol file + the wordmark), crisp at any size */
  R.end = (sc, d, o) => `<div class="pad"><img class="logo"${S(0, 'fade')} src="${IMG(sc.logo || 4, o.base)}" alt=""><h2 class="h2 gold"${S(0)}>${esc(sc.line)}</h2></div>`;
  R.film = (sc, d, o) => {
    const live = !o.static && !o.thumb;
    let m = `<img class="poster" src="${o.base || ''}${esc(sc.poster)}" alt="">`;
    if (live) m += sc.embed ? `<iframe class="svembed" allow="autoplay; fullscreen" data-src="${o.base || ''}${esc(sc.embed)}"></iframe>`
      : `<video playsinline preload="auto" data-src="${o.base || ''}${esc(sc.src)}"></video>`;
    return m + (o.thumb || o.static ? `<div class="flab">▶ ${esc(sc.label)}</div>` : '');
  };

  SV.render = function (deck, i, o) {
    o = o || {}; const sc0 = deck.scenes[i];
    /* «builds» (Amr 22 Oct 15:22): a one-click scene keeps its builds; they play by themselves, one after another (SV.step) */
    const sc = sc0.builds ? Object.assign({}, sc0, { steps: sc0.builds }) : sc0;
    const el = document.createElement('div');
    el.className = 'sv t-' + sc.type + (o.static || o.thumb ? ' static' : '');
    el.dataset.i = i; el.dataset.id = sc.id;
    const acc = sc.ch ? deck.acc['c' + sc.ch] : (sc.red ? deck.acc.what : deck.acc.base);
    el.style.setProperty('--acc', acc);
    const body = (R[sc.type] || (() => `<div class="pad"><h2 class="h2">${esc(sc.id)}</h2></div>`))(sc, deck, o);
    el.innerHTML = (sc.type !== 'film' ? `<div class="glow"></div>` : '') + body + (sc.type !== 'film' ? ring(deck, sc.ch) + (sc.type === 'end' || sc.type === 'cover' ? '' : mark(o.base)) + '<div class="grain"></div>' : '');
    el._steps = sc.steps || 1; el._auto = !!sc0.builds;
    if (SV.after[sc.type]) SV.after[sc.type](el, sc, deck, o);
    if (o.static || o.thumb) { SV.step(el, el._steps - 1, true); el.classList.add('on'); }
    return el;
  };
  SV.steps = (deck, i) => deck.scenes[i].steps || 1;
  /* a one-click scene (Amr 15:41 «كليك واحدة اول ما ندخل السلايد يبانو بالتوالي بتايم مختلف»): the one click that brings the
     scene in plays ALL its builds by themselves, one after another, GAP apart (each with its own motion and count-up);
     a still (instant) shows them finished */
  const GAP = 800;
  SV.step = function (el, k, instant) {
    if (el._auto) {
      if (instant) { (el._tm || []).forEach(clearTimeout); el._tm = []; el._played = 1; return build(el, el._steps - 1, true); }
      if (el._played) return; el._played = 1; el._tm = [];
      build(el, 0);
      /* a typed title (kq) holds the rest until it has finished typing: el._lead (sv-kq.js) */
      const sp = SV.speed || 1;   /* 23 Oct 10:59 a deck may run its builds faster (SV.speed < 1) */
      const lead = Math.max(GAP * sp, el._lead || 0);
      const G = (el._gap || GAP) * sp;
      for (let b = 1; b < el._steps; b++) el._tm.push(setTimeout(() => { if (el.isConnected) build(el, b); }, lead + (b - 1) * G));
      return;
    }
    build(el, k, instant);
  };
  function build(el, k, instant) {
    el._k = k;
    el.querySelectorAll('[data-s]').forEach(n => {
      const on = +n.dataset.s <= k;
      if (on && !n.classList.contains('in')) { n.classList.add('in'); if (!instant) countIn(n); else finishNums(n); }
      if (!on) n.classList.remove('in');
    });
    /* compare: when the new value lands, the old one steps back */
    if (el.classList.contains('t-compare')) { const sa = el.querySelector('.side.a'); if (sa) sa.classList.toggle('dimmed', k >= 1); }
    if (el._onstep) el._onstep(k, instant);
    if (el.classList.contains('t-crisis')) el.querySelectorAll('.r').forEach(r => { const i = r.querySelector('.bar i'), k = r.dataset.k, up = r.dataset.up, on = r.classList.contains('in'); if (i) i.style.transform = up ? (on ? 'none' : `scaleX(${k})`) : (on ? `scaleX(${k})` : 'none'); });
  }
  SV.enter = function (el) { requestAnimationFrame(() => requestAnimationFrame(() => { el.classList.add('on'); if (el._onenter) el._onenter(); SV.step(el, el._k || 0); })); };
  function fmt(v, dec) { return dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US').replace(/,/g, ','); }
  function parse(s) { const m = /^(-?[\d.]+)(%?)$/.exec(String(s).trim()); if (!m) return null; return { v: parseFloat(m[1]), pct: m[2], dec: (m[1].split('.')[1] || '').length }; }
  function finishNums(n) { (n.matches('.num') ? [n] : [...n.querySelectorAll('.num[data-to]')]).forEach(x => { if (x.dataset.to) x.textContent = x.dataset.to; }); }
  function countIn(n) {
    const list = n.matches && n.matches('.num[data-to]') ? [n] : [...n.querySelectorAll('.num[data-to]')];
    list.forEach(x => {
      const to = parse(x.dataset.to); if (!to) return;
      const fr = x.dataset.from != null ? parse(x.dataset.from) : { v: 0 };
      const f0 = fr ? fr.v : 0, sp = SV.speed || 1, D = 1500 * sp, t0 = performance.now() + 250 * sp;
      const tick = now => {
        const k = Math.max(0, Math.min(1, (now - t0) / D)), e = 1 - Math.pow(1 - k, 4);
        x.textContent = fmt(f0 + (to.v - f0) * e, to.dec) + to.pct;
        if (k < 1) requestAnimationFrame(tick); else x.textContent = x.dataset.to;
      };
      x.textContent = fmt(f0, to.dec) + to.pct; requestAnimationFrame(tick);
    });
  }
  /* for the plug-ins (sv-kq.js, sv-map.js) */
  SV.R = R; SV.after = {}; SV.count = countIn; SV.finish = finishNums;
  SV.h = { esc, num, still, S, icon, IMG, ring, mark };
  SV.timeOf = deck => deck.scenes.reduce((a, s) => a + (s.t || 0), 0);
  SV.title = s => (s.type === 'map' && s.title) || ({ cover: 'الغلاف · مصر 2014 ← 2026', questions: 'الأسئلة الثلاثة', close: 'القفلة · إعادة بناء مقومات التنمية', end: 'المواطن شريك أساسي للتنمية' }[s.type]) || s.title || s.label || s.q || s.name || s.h || s.kicker || (s.lines && s.lines[0].t) || (s.a && s.a.h) || s.line || s.id;
})();
