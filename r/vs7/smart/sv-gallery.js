/* Smart Visual · «gallery» scenes (Amr 22 Oct 14:25: «بعد كل نقطة بنتكلم عنها يكون فيه سلايد فيه تجميع للصور بدون كروب للصور»).
   A chapter's project photos in justified rows: every photo keeps its own proportions (nothing is cropped), the rows fill the width,
   each photo carries its project's name under it. The row count is the one that gives the photos the most room inside the frame;
   if the rows are taller than the frame, the whole gallery shrinks evenly and stays centred. One tap: the photos come in row by row. */
(function () {
  const SV = window.SV, { esc, S, IMG } = SV.h;
  /* 22 Oct 14:45: «توزيع الصور زي اللي كان موجود في البرزنتيشن… حجمها كبير» — like V6's photo slides: a few big photos filling the frame,
     side by side with thin gaps, each named on a dark bar across its foot; still every photo whole (its own proportions) */
  /* 22 Oct 14:53: «الصور المجمعة تكون بأكبر مقدار ممكن» — the frame now runs edge to edge under the title; the forum mark (bottom-left)
     stays where it is: the layout is tried twice — full width stopping above the mark, and full height starting right of it —
     and the one that gives the photos more room wins */
  const BOXES = [{ x0: 48, x1: 1872, top: 178, bottom: 942 }, { x0: 48, x1: 1706, top: 178, bottom: 1036 }], GAP = 12;
  function perms(a) { if (a.length < 2) return [a]; const o = []; a.forEach((x, i) => perms(a.slice(0, i).concat(a.slice(i + 1))).forEach(p => o.push([x].concat(p)))); return o; }
  function splits(n, r) { if (r === 1) return [[n]]; const o = []; for (let k = 1; k <= n - r + 1; k++) splits(n - k, r - 1).forEach(t => o.push([k].concat(t))); return o; }
  /* x0 is measured from the right edge (RTL), x1 is the left edge: box 2 stops right of the mark (left:64, 132 wide) */
  /* every order of the photos (≤5 → 120) × every way to cut it into 1–3 rows; keep the one whose photos cover the most of the frame */
  function layout(pics) { const c = []; BOXES.forEach(B => { c.push(fit(pics, B, false)); c.push(fit(pics, B, true)); }); return c.sort((a, b) => b.area - a.area)[0].items; }
  /* rows: photos side by side in 1–3 justified rows. cols (14:53): the same idea turned 90° — 1–3 columns, the photos in a column
     stacked at one width — so one big photo can stand beside two smaller ones and the frame fills edge to edge */
  function fit(pics, BOX, cols) {
    const W = BOX.x1 - BOX.x0, H = BOX.bottom - BOX.top, ar = pics.map(p => p.w / p.h), idx = pics.map((p, i) => i);
    const L = cols ? H : W, M = cols ? W : H, len = i => cols ? 1 / ar[i] : ar[i];   /* L: the side a line fills, M: the side lines stack along */
    let best = null;
    perms(idx).forEach(ord => { for (let r = 1; r <= Math.min(3, ord.length); r++) splits(ord.length, r).forEach(cut => {
      let k = 0; const rows = cut.map(c => { const row = ord.slice(k, k + c); k += c; return row; });
      const hs = rows.map(row => (L - GAP * (row.length - 1)) / row.reduce((a, i) => a + len(i), 0));
      const need = hs.reduce((a, b) => a + b, 0) + GAP * (rows.length - 1), s = Math.min(1, M / need);
      const area = s * s * hs.reduce((a, h, ri) => a + h * (L - GAP * (rows[ri].length - 1)), 0);
      if (!best || area > best.area + 1) best = { rows, hs, s, area };
    }); });
    const { rows, hs, s } = best, items = [];
    const used = hs.reduce((a, h) => a + h * s, 0) + GAP * (rows.length - 1);
    let y = (M - used) / 2;
    rows.forEach((row, ri) => {
      const h = hs[ri] * s, ws = row.map(i => len(i) * h), rowW = ws.reduce((a, b) => a + b, 0) + GAP * (row.length - 1);
      let x = (L - rowW) / 2;   /* rows: x runs from the right edge, so the first photo sits on the right (RTL); cols: x runs down */
      row.forEach((i, ci) => {
        items.push(cols ? { i, ri, ci, right: BOX.x0 + y, top: BOX.top + x, w: h, h: ws[ci] } : { i, ri, ci, right: BOX.x0 + x, top: BOX.top + y, w: ws[ci], h });
        x += ws[ci] + GAP; });
      y += h + GAP;
    });
    return { items, area: best.area };
  }
  SV.R.gallery = (sc, d, o) => {
    const items = layout(sc.pics), pg = sc.page && sc.page[1] > 1 ? `<span class="pg">${sc.page[0]} / ${sc.page[1]}</span>` : '';
    return `<div class="gt"${S(0, 'fade')}><span class="k">${esc(sc.kick || '')}</span><b>صور من المشروعات</b>${pg}</div>
      <div class="gal">${items.map(t => { const p = sc.pics[t.i];
        return `<figure class="gi"${S(0)} style="right:${t.right.toFixed(1)}px;top:${t.top.toFixed(1)}px;width:${t.w.toFixed(1)}px;height:${t.h.toFixed(1)}px;transition-delay:${(.12 + t.ri * .2 + t.ci * .06).toFixed(2)}s">
          <img src="${IMG(p.im, o.base)}" alt="" decoding="async" width="${t.w.toFixed(0)}" height="${t.h.toFixed(0)}">
          <figcaption>${esc(p.cap)}</figcaption></figure>`; }).join('')}</div>`;
  };
  const css = `
.sv.t-gallery .gt{position:absolute;right:64px;top:118px;z-index:12;display:flex;align-items:baseline;gap:20px}
.sv.t-gallery .gt .k{font:500 26px/1 var(--fb);color:var(--acc)}
.sv.t-gallery .gt b{font:600 46px/1 var(--fd);color:var(--fg);font-weight:600}
.sv.t-gallery .gt .pg{font:500 24px/1 var(--fb);color:var(--mute);margin-right:6px}
.sv.t-gallery .gal{position:absolute;inset:0;z-index:10}
.sv.t-gallery .gi{position:absolute;margin:0;border-radius:6px;overflow:hidden;box-shadow:0 0 0 1px var(--edge),0 24px 44px -26px rgba(0,0,0,.95);background:var(--ink2)}
.sv.t-gallery .gi img{display:block;width:100%;height:100%;object-fit:fill}
.sv.t-gallery .gi figcaption{position:absolute;right:0;left:0;bottom:0;padding:12px 18px 13px;background:linear-gradient(0deg,rgba(10,16,34,.92),rgba(10,16,34,.78));font:600 25px/1.25 var(--fd);color:#fff;text-align:center;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
`;
  const st = document.createElement('style'); st.id = 'sv-gallery-css'; st.textContent = css; document.head.appendChild(st);
})();
