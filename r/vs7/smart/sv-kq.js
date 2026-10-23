/* Smart Visual · «kq» scenes: the keynote's question + chart (Amr 05:09: «الرسوم البيانية اللي احنا كنا عاملنها واسلوب الاسئلة مهم»).
   Step 0: the question types itself in a glass pill at the centre of the stage. Step 1: the pill rises and the answer builds
   (2014 grey on the right, 2026 gold on the left, the year under every column, the unit beside every number).
   kinds: rows · pairs · col · strike · part · duo · phases · sys. The figures are the keynote's (src/kn/slides.js = V6). */
(function () {
  const SV = window.SV, { esc, S, IMG } = SV.h;
  const IC = typeof KICONS !== 'undefined' ? KICONS : {};
  const ic = (k, c) => IC[k] ? `<svg class="${c || 'ic'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${IC[k]}</svg>` : '';
  /* the keynote data carries a little markup (<br>, a gold span) — keep exactly that and escape the rest */
  const rich = t => esc(t).replace(/&lt;br&gt;/g, '<br>').replace(/&lt;span class=&quot;(g|nw)&quot;&gt;/g, (m, c) => `<span class="${c}">`).replace(/&lt;\/span&gt;/g, '</span>');
  const fnum = v => { const m = String(v == null ? '' : v).replace(/,/g, '').match(/-?\d+(\.\d+)?/); return m ? parseFloat(m[0]) : 0; };
  const isNum = v => /^-?[\d.]+%?$/.test(String(v).trim());
  const N = (v, cls, from) => isNum(v) ? `<span class="num ${cls || ''}" data-to="${esc(v)}"${from != null && isNum(from) ? ` data-from="${esc(from)}"` : ''}>${esc(v)}</span>` : `<span class="num ${cls || ''}">${esc(v)}</span>`;
  const YA = 'قبل 2014', YB = '2026';
  const tag = (t, c) => `<span class="yt ${c || ''}">${rich(t)}</span>`;

  const head = sc => `<div class="qp glass"><span class="qi">${ic(sc.ic, 'qic')}</span><span class="qt">${esc(sc.q)}</span></div>
    ${sc.k ? `<div class="qk"${S(1)}>${sc.kx ? '<b>شرح</b>' : ''}${rich(sc.k)}</div>` : ''}`;
  const K = {};

  /* ── rows: 1–5 measures, each a pair of columns on its own scale ── */
  K.rows = sc => {
    const n = sc.rows.length, W = Math.min(600, Math.floor(1620 / n)), H = n > 3 ? 280 : 320;
    /* room above the tallest column: number + unit (+ prefix, + tonnes tag), and below it the year tag */
    const any = f => sc.rows.some(f), ulong = any(r => String(r.ub || r.u || '').length > 16);
    const room = 178 + (any(r => r.pb) ? 30 : 0) + (any(r => r.bx || r.ax) ? 40 : 0) + (ulong ? 30 : 0);
    const two = any(r => String(r.nm).length * 19 > W - 70);
    const CM = sc.common ? Math.max(...sc.rows.map(r => Math.max(fnum(r.a), fnum(r.b)))) : 0;
    const g = sc.rows.map((r, i) => {
      const A = r.an != null ? r.an : (r.a == null ? 0 : fnum(r.a)), B = r.bn != null ? r.bn : fnum(r.b);
      const M = r.pct ? 100 : (r.gp || CM || Math.max(A, B) || 1);
      const h = v => Math.max(v > 0 ? 8 : 3, Math.round(v / M * H));
      const ya = r.ya || sc.ya || YA, yb = r.yb || sc.yb || YB;
      const rng = r.an != null && String(r.a).includes('–') ? fnum(r.a) : null;
      /* a figure inside its column (Amr 22 Oct 15:06): it rides the column top while it grows and counts up with it */
      const inl = (q, hh) => q && hh > 0 ? `<span class="inl" style="height:${hh}px;margin-top:-${hh}px;--h:${hh}px"><span class="in">${N(q.v)}${q.u ? `<small>${rich(q.u)}</small>` : ''}</span></span>` : '';
      const colA = r.a == null
        ? `<div class="col a none"><div class="at">${rich(r.at || '')}</div><i style="height:3px"></i>${tag(ya)}</div>`
        : `<div class="col a"><div class="cv">${N(r.a)}<u>${rich(r.ua || r.u || '')}</u>${r.ax ? `<em>${rich(r.ax)}</em>` : ''}</div>
           <i style="height:${h(A)}px">${rng != null ? `<b style="height:${Math.round((A - rng) / A * 100)}%"></b>` : ''}</i>${inl(r.ia, h(A))}${tag(ya)}</div>`;
      const colB = `<div class="col b${sc.wf ? ' wf' : ''}"><div class="cv">${r.pb ? `<small>${rich(r.pb)}</small>` : ''}${N(r.b, sc.wf ? '' : 'gold')}<u>${rich(r.ub || r.u || '')}</u>${r.bx ? `<em>${rich(r.bx)}</em>` : ''}</div>
           <i style="height:${h(B)}px"></i>${inl(r.ib, h(B))}${tag(yb, 'b')}</div>`;
      return `<div class="grp"${S(1)} style="width:${W}px;transition-delay:${(.1 + i * .34).toFixed(2)}s">
        <div class="gh">${ic(r.ic)}<span>${rich(r.nm)}</span>${r.sub ? `<small>${rich(r.sub)}</small>` : ''}</div>
        <div class="cols" style="height:${H + room}px">${colA}${colB}</div>
        ${r.nb ? `<div class="nb${r.nbt ? ' t' : ''}${r.nbo ? ' o' : ''}">${rich(r.nb)}</div>` : ''}${r.mu ? `<div class="nb">${rich(r.mu)}</div>` : ''}</div>`;
    }).join('');
    return `<div class="chart k-rows n${n}${two ? ' two' : ''}">${g}</div>${sc.foot ? `<div class="kfoot"${S(1)}>${rich(sc.foot)}</div>` : ''}`;
  };

  /* ── pairs: the economy as slopes — before → after, one small chart per measure ── */
  K.pairs = sc => {
    /* 15:50 overlaps: 1460 (not 1620) wide, so the left-most year pill stays clear of the forum mark; dots sit higher, so a
       value printed under its dot never crosses the base line */
    /* VS7 23 Oct 06:33 «نوسع شوية ناحية اليمين واليسار … وممكن تخلي كل واحدة كارت»: sc.pw = the row's full width, sc.pcard = each
       pair in its own card (defaults keep the SV1 slide as it was) */
    const n = sc.rows.length, CARD = !!sc.pcard, GAP = CARD ? 24 : 0, PX = CARD ? 22 : 20,
      W = Math.floor(((sc.pw || 1460) - GAP * (n - 1)) / n), VW = W - 2 * PX, VH = 400;
    const bad = !sc.fut;
    const g = sc.rows.map((r, i) => {
      const A = fnum(r.a), B = fnum(r.b), lo = sc.fut ? Math.min(A, B) * .72 : 0, M = Math.max(A, B) * 1.08;
      const y = v => Math.round(VH - 128 - (v - lo) / (M - lo) * (VH - 240));
      const IN = CARD ? 66 : 70, xa = VW - IN, xb = IN, ya = y(A), yb = y(B), ta = A >= B ? ya - 100 : ya + 26, tb = B > A ? yb - 112 : yb + 28;
      return `<div class="grp"${S(1)} style="width:${W}px;transition-delay:${(.15 + i * .18).toFixed(2)}s">
        <div class="gh">${ic(r.ic)}<span>${rich(r.nm)}</span>${r.sub ? `<small>${rich(r.sub)}</small>` : ''}</div>
        <div class="slope" style="height:${VH}px"><svg viewBox="0 0 ${VW} ${VH}" width="${VW}" height="${VH}">
          <line x1="${xa}" x2="${xa}" y1="${ya}" y2="${VH - 40}" class="st a"/><line x1="${xb}" x2="${xb}" y1="${yb}" y2="${VH - 40}" class="st b"/>
          <line x1="20" x2="${VW - 20}" y1="${VH - 40}" y2="${VH - 40}" class="base"/>
          <path d="M${xa} ${ya}L${xb} ${yb}" class="sl ${bad ? 'bad' : 'good'}" pathLength="1"/>
          <circle cx="${xa}" cy="${ya}" r="11" class="pa"/><circle cx="${xb}" cy="${yb}" r="13" class="pb ${bad ? 'bad' : 'good'}"/></svg>
          <div class="pv a" style="left:${xa - 80}px;top:${ta}px">${N(r.a)}${r.u ? `<u>${rich(r.u)}</u>` : ''}</div>
          <div class="pv b ${bad ? 'bad' : 'good'}" style="left:${xb - 80}px;top:${tb}px">${B < A ? `<span class="pvn">${N(r.b, bad ? '' : 'gold')}<i class="darr"><svg viewBox="0 0 20 17"><path d="M10 17 0 0h20z"/></svg></i></span>` : N(r.b, bad ? '' : 'gold')}${r.u ? `<u>${rich(r.u)}</u>` : ''}</div>
          <div class="px a" style="left:${xa - 80}px">${tag(sc.ya || YA)}</div><div class="px b" style="left:${xb - 80}px">${CARD ? '<small class="pxs">أصبح في</small>' : ''}${tag(sc.yb || YB, bad ? 'r' : 'b')}</div></div></div>`;
    }).join('');
    return `<div class="chart k-pairs n${n}${CARD ? ' cards' : ''}">${g}</div>`;
  };

  /* ── col: one measure, the 2026 column split into what existed and what was added ── */
  K.col = sc => {
    const A = fnum(sc.a.v), B = fnum(sc.b.v), H = 470, h = v => Math.round(v / B * H);
    const adds = sc.adds || [{ v: String(sc.add != null ? sc.add : B - A) }];
    const seg = adds.map((x, i) => `<i class="ad" style="height:${h(fnum(x.v))}px;transition-delay:${(1.0 + i * .35).toFixed(2)}s"><span>+${esc(x.v)}${x.u ? ` <small${x.u2 ? ' class="u2"' : ''}>${esc(x.u)}${x.u2 ? `<br>${esc(x.u2)}` : ''}</small>` : ''}</span></i>`).reverse().join('');
    return `<div class="chart k-col">
      <div class="cc a"${S(1)}><div class="cv">${N(sc.a.v)}<u>${rich(sc.a.u)}</u></div><i style="height:${h(A)}px"></i>${tag(sc.a.y || YA)}${sc.a.x ? `<div class="cx">${rich(sc.a.x)}</div>` : ''}</div>
      <div class="cc b"${S(1)} style="transition-delay:.35s"><div class="cv">${N(sc.b.v, 'gold')}<u>${rich(sc.b.u)}</u></div><div class="stk">${seg}<i class="bs" style="height:${h(B - adds.reduce((a, x) => a + fnum(x.v), 0))}px">${sc.b.base ? `<span class="bsl"><em>${rich(sc.b.base.pre || '')}</em><b>${N(sc.b.base.v, 'gold')} ${rich(sc.b.base.u || '')}</b><em>${rich(sc.b.base.n || '')}</em></span>` : ''}</i></div>${tag(sc.b.y || YB, 'b')}</div>
      ${sc.call ? `<div class="call glass"${S(1)} style="transition-delay:1.2s"><div class="pre">${rich(sc.call.pre)}</div><div class="v">${N(sc.call.v, 'gold')}<u>${rich(sc.call.u)}</u></div>${sc.call.n ? `<p>${rich(sc.call.n)}</p>` : ''}</div>` : ''}
      ${sc.b.n ? `<div class="call glass"${S(1)} style="transition-delay:1.2s"><p>${rich(sc.b.n)}</p></div>` : ''}</div>`;
  };

  /* ── strike: what was (struck through) → what is; optional before/after photographs ── */
  K.strike = sc => {
    const t3 = (sc.steps || 2) >= 3, sa = 1, sb = t3 ? 2 : 1;
    const ln = (x, c) => x ? `<div class="sl2 ${c}">${x.ic ? ic(x.ic) : ''}<span>${rich(x.pre || '')}</span>${x.v ? N(x.v, c === 'b' ? 'gold' : '') : ''}<u>${rich(x.u || '')}</u></div>` : '';
    return `<div class="chart k-strike">
      <div class="sa"${S(sa)}><div class="v">${N(sc.a.v)}<u>${rich(sc.a.u)}</u><s class="x"></s></div>${ln(sc.a2, 'a')}${tag(sc.a.y || YA)}</div>
      <div class="sb"${S(sb)}>${sc.b.v != null ? `<div class="v">${N(sc.b.v, 'gold', sc.bFrom)}<u>${rich(sc.b.u || '')}</u></div>` : ''}${sc.b.t ? `<div class="t gold">${rich(sc.b.t)}</div>` : ''}${ln(sc.b2, 'b')}${tag(sc.b.y || YB, 'b')}</div></div>`;
  };

  /* ── part: a whole and the part of it that was done ── */
  K.part = sc => {
    const A = fnum(sc.a.v), B = fnum(sc.b.v), f = Math.max(.06, B / A);
    return `<div class="chart k-part">
      ${sc.hero ? `<div class="hero"${S(1)}><span>${rich(sc.hero.pre)}</span>${N(sc.hero.v, 'gold')}<u>${rich(sc.hero.u)}</u></div>` : ''}
      <div class="whole"${S(1)}><div class="lab a"><span class="cap">${rich(sc.ya || 'الإجمالي')}</span>${N(sc.a.v)}<u>${rich(sc.a.u)}</u>${sc.a.n ? `<p>${rich(sc.a.n)}</p>` : ''}</div>
        <div class="bar"><i style="width:${(f * 100).toFixed(1)}%"></i></div>
        <div class="lab b" style="width:${Math.max(30, f * 100).toFixed(1)}%"><span class="cap">${rich(sc.yb || 'منها')}</span>${N(sc.b.v, 'gold')}<u>${rich(sc.b.u)}</u>${sc.b.n ? `<p>${rich(sc.b.n)}</p>` : ''}</div></div>
      ${sc.foot ? `<div class="kfoot"${S(1)} style="transition-delay:.9s">${rich(sc.foot)}</div>` : ''}</div>`;
  };

  /* ── duo: a rate and what answered it ── */
  K.duo = sc => {
    const p = fnum(sc.a.v) / 100, C = 2 * Math.PI * 150;
    return `<div class="chart k-duo">
      <div class="da"${S(1)}>${String(sc.a.v).includes('%') ? `<div class="ringc"><svg viewBox="0 0 360 360"><circle cx="180" cy="180" r="150" class="tr"/><circle cx="180" cy="180" r="150" class="fl" stroke-dasharray="${(C * p).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 180 180)"/></svg>${N(sc.a.v)}</div>` : `<div class="v">${N(sc.a.v)}<u>${rich(sc.a.u || '')}</u></div>`}<p>${rich(sc.a.l)}</p>${tag(sc.a.y || YA)}</div>
      <div class="db"${S(1)} style="transition-delay:.5s"><div class="v">${N(sc.b.v, 'gold')}<u>${rich(sc.b.u)}</u></div><p>${rich(sc.b.l)}</p>${tag(sc.b.y || YB, 'b')}</div></div>`;
  };

  /* ── phases: the whole programme as one bar in three phases ── */
  K.phases = sc => {
    const T = sc.parts.reduce((a, x) => a + fnum(x.v), 0);
    return `<div class="chart k-phases"><div class="stats">${sc.stats.map((x, i) => `<div class="st"${S(1)} style="transition-delay:${(i * .2).toFixed(2)}s">${N(x.v, 'gold')}<u>${rich(x.u)}</u><p>${rich(x.l)}</p></div>`).join('')}</div>
      <div class="pbar"${S(1)} style="transition-delay:.5s">${sc.parts.map((x, i) => `<div class="ph p${i}" style="width:${(fnum(x.v) / T * 100).toFixed(2)}%"><i></i><b>${rich(x.n)}</b><span class="pv2">${N(x.v)} ${rich(x.u)}</span><em>${rich(x.s)}</em></div>`).join('')}</div></div>`;
  };

  /* ── sys: from no system to four ── */
  K.sys = sc => `<div class="chart k-sys${sc.items.length > 4 ? ' many' : ''}">
    <div class="ya"${S(1)}>${tag(YA)}<p>${rich(sc.a.cap)}</p>${sc.items[0].a ? `<div class="old">${ic(sc.items[0].ic)}<span>${rich(sc.items[0].ta || sc.items[0].t)} · ${rich(sc.items[0].a)}</span></div>` : ''}</div>
    <div class="yb"${S(1)} style="transition-delay:.4s">${tag(YB, 'b')}<div class="list">${sc.items.map((x, i) => `<div class="it" style="transition-delay:${(.6 + i * .18).toFixed(2)}s">${ic(x.ic)}<span>${rich(x.t)}</span></div>`).join('')}</div><p class="gold">${rich(sc.b.cap)}</p></div></div>`;

  const photos = sc => sc.ph ? `<div class="phs"><img class="pa" src="${IMG(sc.ph.a)}" alt=""><img class="pb" src="${IMG(sc.ph.b)}" alt=""${sc.ph.bp ? ` style="object-position:${sc.ph.bp}"` : ''}></div>` : '';
  SV.R.kq = sc => `${photos(sc)}${head(sc)}<div class="kbody">${(K[sc.kind] || K.rows)(sc)}</div>`;

  /* typing + rise */
  SV.after.kq = (el, sc, d, o) => {
    const qt = el.querySelector('.qt'), full = sc.q;
    const sk = sc.kind === 'strike' ? ((sc.steps || 2) >= 3 ? 2 : 1) : 99;
    el._onstep = k => { el.classList.toggle('ans', k >= 1); el.classList.toggle('ans2', k >= 2); el.classList.toggle('strk', k >= sk); };
    if (o.static || o.thumb) return;
    const seg = (typeof Intl !== 'undefined' && Intl.Segmenter) ? [...new Intl.Segmenter('ar', { granularity: 'grapheme' }).segment(full)].map(s => s.segment) : [...full];
    /* 15:47 Amr «لو فيه كتابه تايب رايت لعنوان خليه يكمل كتابته وبعدين البيانات تبان ورا بعض»: the scene's data wait for the
       question to finish typing (320 ms lead + 34 ms a letter) and a short breath after it (sv-engine.js reads el._lead) */
    el._lead = 320 + seg.length * 34 + 450;
    el._onenter = () => {
      if (el._typed) return; el._typed = 1;
      let i = 0; qt.textContent = ''; el.classList.add('typing');
      const tick = () => { i++; qt.textContent = seg.slice(0, i).join(''); if (i < seg.length) el._tt = setTimeout(tick, 34); else el.classList.remove('typing'); };
      el._tt = setTimeout(tick, 320);
    };
  };
})();
