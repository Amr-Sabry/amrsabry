// Nevera: procedural building blocks for every land-use parcel, styled after the client's renders
// (sandstone mid-rise with stepped roofs and roof gardens, glass pyramids in the district core, white villas on the lakes,
// dark sound stages next to the backlots, a theme park with a ferris wheel, palm boulevards).
// These are massing blocks for the film's map shots, not architecture: footprint, spacing and height come from each
// parcel's tag in the DWG (max floors and FAR), the layout inside the parcel is generated.
//
// buildBlocks(THREE, data, {S, VEX, plate, mobile}) works in the map's shape space (x east, y north, z up; 1 unit = 1/S m)
// and returns {byCat: {cat: THREE.Group}, extra: THREE.Group, update(t), stats}.

export function buildBlocks(THREE, data, opt = {}) {
  const S = opt.S ?? 0.1, VEX = opt.VEX ?? 2, PT = opt.plate ?? 0.25, MOB = !!opt.mobile;
  const F = 4 * VEX * S;                                   // one floor, scene units
  const TD = MOB ? 0.4 : 1;                                // tree density
  const zones = data.zones || [], roads = data.roads || [];

  /* ---------- helpers ---------- */
  const hashStr = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };
  const rngOf = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const pick = (R, a) => a[(R() * a.length) | 0];
  function inRing(x, y, r) { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const a = r[i], b = r[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
  function inP(P, x, y) { if (x < P.x0 || x > P.x1 || y < P.y0 || y > P.y1 || !inRing(x, y, P.outer)) return false; for (const h of P.holes) if (inRing(x, y, h)) return false; return true; }
  function prep(poly) {
    const outer = poly[0], holes = poly.slice(1); let best = 0, ang = 0, x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (let i = 0; i < outer.length; i++) { const a = outer[i], b = outer[(i + 1) % outer.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (L > best) { best = L; ang = Math.atan2(b[1] - a[1], b[0] - a[0]); }
      x0 = Math.min(x0, a[0]); y0 = Math.min(y0, a[1]); x1 = Math.max(x1, a[0]); y1 = Math.max(y1, a[1]); }
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, ca = Math.cos(ang), sa = Math.sin(ang);
    let u0 = 1e9, u1 = -1e9, v0 = 1e9, v1 = -1e9;
    for (const p of outer) { const u = (p[0] - cx) * ca + (p[1] - cy) * sa, v = -(p[0] - cx) * sa + (p[1] - cy) * ca; u0 = Math.min(u0, u); u1 = Math.max(u1, u); v0 = Math.min(v0, v); v1 = Math.max(v1, v); }
    let A = 0; for (let i = 0, j = outer.length - 1; i < outer.length; j = i++) A += outer[j][0] * outer[i][1] - outer[i][0] * outer[j][1];
    return { outer, holes, ang, ca, sa, cx, cy, x0, y0, x1, y1, u0, u1, v0, v1, area: Math.abs(A) / 2,
      w: (u, v) => [cx + u * ca - v * sa, cy + u * sa + v * ca] };
  }
  const off = (x, y, a, du, dv) => [x + du * Math.cos(a) - dv * Math.sin(a), y + du * Math.sin(a) + dv * Math.cos(a)];
  function fits(P, x, y, hw, hd, a) {
    if (!inP(P, x, y)) return false; const c = Math.cos(a), s = Math.sin(a);
    for (const [i, j] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) if (!inP(P, x + i * hw * c - j * hd * s, y + i * hw * s + j * hd * c)) return false;
    return true;
  }
  // regular slots inside a parcel, aligned with its longest edge; fn(x, y, ang, row, col)
  function slots(P, R, w, d, sx, sy, m, fn, stag = 0.5, jit = 0) {
    for (let v = P.v0 + m + d / 2, row = 0; v <= P.v1 - m - d / 2; v += sy, row++) {
      const o = (row % 2) * stag * sx;
      for (let u = P.u0 + m + w / 2 + o, col = 0; u <= P.u1 - m - w / 2; u += sx, col++) {
        const uu = u + (R() - .5) * jit, vv = v + (R() - .5) * jit, [x, y] = P.w(uu, vv);
        if (fits(P, x, y, w / 2 + m, d / 2 + m, P.ang)) fn(x, y, P.ang, row, col);
      }
    }
  }
  function scatter(P, R, step, fn) {
    for (let v = P.v0 + step / 2; v < P.v1; v += step) for (let u = P.u0 + step / 2; u < P.u1; u += step) {
      const [x, y] = P.w(u + (R() - .5) * step * .9, v + (R() - .5) * step * .9); if (inP(P, x, y)) fn(x, y);
    }
  }

  /* ---------- instance bins: one InstancedMesh per (category, geometry, material) ---------- */
  const bins = new Map(), plazas = [];
  function put(cat, g, m, x, y, z0, w, d, h, a, col) {
    const k = cat + '|' + g + '|' + m; let b = bins.get(k); if (!b) { b = { cat, g, m, L: [] }; bins.set(k, b); }
    b.L.push(x, y, z0, w, d, h, a, col);
  }

  /* ---------- palettes (from the renders) ---------- */
  const SAND = [0xf3f1ec, 0xeeebe4, 0xe8e4db, 0xf6f4f0, 0xe4dfd5, 0xf1eee8, 0xddd6c9, 0xd8c8ac];   // mostly white, a light-stone accent
  const CREAM = [0xf7f5f1, 0xf1eee8, 0xece8e0, 0xf4f1ea];
  const WARM = [0xefe8dc, 0xe6dccb, 0xf3eee6, 0xdccdb4];
  const STAGE = [0x6a645c, 0x77706a, 0x5e5a55, 0x837a6e];
  const GREY = [0x9ea3a8, 0xb2b5b8, 0x8f959b];
  const SET = [0xc98b5a, 0xe8dcc4, 0xb77a4f, 0xd9b48a, 0xa8876a, 0xefe6d6, 0x9c6b4b];
  const LEAF = [0x5f7f3f, 0x6d8c45, 0x4f6e36, 0x7b9a4f, 0x587a3c];
  const FROND = [0x4d6b33, 0x5a7a3a, 0x64843f];

  /* ---------- building vocabulary (metres in plan, floors in height, z in scene units) ---------- */
  const slab = (c, x, y, a, w, d, fl, col, z0 = PT, m = 'wall') => { put(c, 'box', m, x, y, z0, w, d, fl * F, a, col); return z0 + fl * F; };
  const roofG = (c, x, y, a, w, d, z) => { if (w > 2 && d > 2) put(c, 'box', 'green', x, y, z, w, d, 0.05, a, 0xffffff); };
  function stepped(c, R, x, y, a, w, d, fl, col) {
    if (fl <= 2 || R() < .3) { const t = slab(c, x, y, a, w, d, fl, col); if (R() < .45) roofG(c, x, y, a, w * .8, d * .7, t); return; }
    const lo = Math.max(1, fl - 1 - ((R() * 2) | 0)), t = slab(c, x, y, a, w, d, lo, col);
    const uw = w * (.5 + R() * .25), ud = d * (.72 + R() * .2), sg = R() < .5 ? -1 : 1, [ux, uy] = off(x, y, a, sg * (w - uw) / 2, 0);
    const t2 = slab(c, ux, uy, a, uw, ud, fl - lo, col, t);
    const [gx, gy] = off(x, y, a, -sg * uw / 2, 0); roofG(c, gx, gy, a, w - uw - 1.5, d * .8, t);
    if (R() < .5) roofG(c, ux, uy, a, uw * .7, ud * .6, t2);
  }
  function lshape(c, R, x, y, a, w, d, fl, col) {
    slab(c, x, y, a, w, d, fl, col); const [x2, y2] = off(x, y, a, (w / 2 - d / 2) * (R() < .5 ? -1 : 1), d * .9);
    slab(c, x2, y2, a, d, d * .9, Math.max(1, fl - (R() < .5 ? 1 : 0)), col);
  }
  function courtyard(c, R, x, y, a, W, D, k, fl, col, open = false) {   // ring (or U) of wings, k = wing depth
    for (const s of [-1, 1]) { const [ax, ay] = off(x, y, a, 0, s * (D - k) / 2); if (!(open && s > 0)) slab(c, ax, ay, a, W, k, fl, col); }
    for (const s of [-1, 1]) { const [ax, ay] = off(x, y, a, s * (W - k) / 2, 0); slab(c, ax, ay, a, k, D - 2 * k, Math.max(1, fl - (R() < .4 ? 1 : 0)), col); }
    const [gx, gy] = off(x, y, a, 0, open ? k / 2 : 0); roofG(c, gx, gy, a, W - 2 * k - 2, D - 2 * k - (open ? 0 : 2), PT);
  }
  function tower(c, R, x, y, a, w, fl, glass = true) {
    const t = slab(c, x, y, a, w * 1.6, w * 1.4, 2, pick(R, SAND));
    slab(c, x, y, a, w, w * (.8 + R() * .3), fl, glass ? 0xffffff : pick(R, CREAM), t, glass ? 'glass' : 'wall');
  }
  function villa(c, R, x, y, a, s = 1, col) {
    col ??= pick(R, CREAM);
    const w = (15 + R() * 5) * s, d = (11 + R() * 3) * s;
    put(c, 'box', 'lawn', ...off(x, y, a, 0, 3 * s), PT, w + 7 * s, d + 13 * s, .03, a, 0xffffff);
    const t = slab(c, x, y, a, w, d, 1, col, PT + .03, 'villa');
    const sg = R() < .5 ? -1 : 1, [ux, uy] = off(x, y, a, sg * w * .18, -d * .08);
    slab(c, ux, uy, a, w * .6, d * .75, 1, col, t, 'villa');
    const [px, py] = off(x, y, a, -sg * w * .12, d / 2 + 4 * s); put(c, 'box', 'water', px, py, PT + .03, 9 * s, 4.5 * s, 0.03, a, 0xffffff);
    if (R() < .8 * TD) { const [tx, ty] = off(x, y, a, sg * (w / 2 + 3), d / 2 + 2); palm(c, R, tx, ty, PT); }
  }
  function tree(c, R, x, y, z0 = PT, big = 1) {
    const H = (6 + R() * 6) * big * VEX * S, D = (6 + R() * 5) * big;
    put(c, 'trunk', 'trunk', x, y, z0, .9, .9, H * .45, 0, 0xffffff);
    put(c, 'ico', 'leaf', x, y, z0 + H * .3, D, D, H * .72, R() * 6.28, pick(R, LEAF));
  }
  function palm(c, R, x, y, z0 = PT) {
    const H = (10 + R() * 6) * VEX * S, D = 7 + R() * 2;
    put(c, 'trunk', 'trunk', x, y, z0, .7, .7, H, 0, 0xffffff);
    put(c, 'crown', 'frond', x, y, z0 + H, D, D, D * S * 1.2, R() * 6.28, pick(R, FROND));
  }
  const glassPyr = (c, x, y, a, b, z0 = PT) => { put(c, 'box', 'pave', x, y, z0, b * 2.2, b * 2.2, 0.03, a, 0xffffff); put(c, 'pyr', 'glass', x, y, z0 + 0.03, b, b, b * .64 * VEX * S, a, 0xffffff); };

  /* ---------- the slide's urban fabric ---------- */
  const ringArea = r => { let A = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) A += r[j][0] * r[i][1] - r[i][0] * r[j][1]; return A / 2; };
  const ccw = r => (ringArea(r) < 0 ? r.slice().reverse() : r);
  function clipConvex(subj, clip) {                         // Sutherland-Hodgman: parcel ring clipped by a convex CCW cell
    let out = subj;
    for (let i = 0; i < clip.length && out.length; i++) {
      const A = clip[i], B = clip[(i + 1) % clip.length], inp = out; out = [];
      const side = p => (B[0] - A[0]) * (p[1] - A[1]) - (B[1] - A[1]) * (p[0] - A[0]);
      for (let k = 0; k < inp.length; k++) {
        const p = inp[k], q = inp[(k + 1) % inp.length], sp = side(p), sq = side(q);
        if (sp >= 0) out.push(p);
        if ((sp >= 0) !== (sq >= 0)) { const t = sp / (sp - sq); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
      }
    }
    return out;
  }
  function simplify(r, tol = .2, minE = 4) {                // merge nearly straight runs so a curve becomes a few long edges
    const pts = r.slice(); let ch = true;
    while (ch && pts.length > 3) { ch = false;
      for (let i = 0; i < pts.length && pts.length > 3; i++) {
        const a = pts[(i - 1 + pts.length) % pts.length], b = pts[i], c = pts[(i + 1) % pts.length];
        const ab = Math.hypot(b[0] - a[0], b[1] - a[1]), bc = Math.hypot(c[0] - b[0], c[1] - b[1]);
        const cr = Math.abs((b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0])) / (ab * bc + 1e-9);
        if (ab < minE || cr < tol) { pts.splice(i, 1); ch = true; i--; }
      }
    }
    return pts;
  }
  // one modern building: white volume, sometimes a recessed top floor, roof garden or plant on top
  function modern(c, R, x, y, a, w, d, fl, col) {
    let t;
    if (fl >= 4 && R() < .5) { t = slab(c, x, y, a, w, d, fl - 1, col); const sh = (R() - .5) * w * .12; const [ux, uy] = off(x, y, a, sh, -d * .06);
      roofG(c, x, y, a, w * .96, d * .9, t); t = slab(c, ux, uy, a, w * .8, d * .72, 1, col, t + .05); }
    else t = slab(c, x, y, a, w, d, fl, col);
    const r = R();
    if (r < .35) roofG(c, x, y, a, w * .7, d * .6, t);
    else if (r < .6) put(c, 'box', 'plain', ...off(x, y, a, (R() - .5) * w * .4, 0), t, Math.min(10, w * .3), Math.min(6, d * .4), .9 * F * .5, a, 0xd5d3ce);
  }
  // buildings along every edge of a block (the perimeter blocks of the slide), courtyard in the middle
  function perimeter(c, R, poly, o) {
    const n = poly.length, dep = o.depth, sb = o.setback ?? 4;
    for (let i = 0; i < n; i++) {
      const a = poly[i], b = poly[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L, nx = -uy, ny = ux, ang = Math.atan2(uy, ux);
      const usable = L - dep * (o.openCorners ? 1.6 : 1);
      if (usable >= (o.minL ?? 12)) {
        const k = Math.max(1, Math.round(usable / o.seg)), gap = k > 1 ? o.gap : 0, bl = (usable - gap * (k - 1)) / k;
        for (let j = 0; j < k; j++) {
          if (R() < (o.porosity ?? 0)) continue;
          const sAl = (L - usable) / 2 + j * (bl + gap) + bl / 2;
          const cx = a[0] + ux * sAl + nx * (dep / 2 + sb), cy = a[1] + uy * sAl + ny * (dep / 2 + sb);
          modern(c, R, cx, cy, ang, bl, dep, Math.max(1, Math.round(o.fl * (.45 + R() * .35))), pick(R, o.pal));
        }
      }
      // corner accent: a square, slightly taller volume where two long edges meet
      const pn = poly[(i + 2) % n], L2 = Math.hypot(pn[0] - b[0], pn[1] - b[1]);
      if (!o.openCorners && L >= 24 && L2 >= 24 && R() < (o.corner ?? .5)) {
        const cx = b[0] - ux * (dep / 2) + nx * (dep / 2 + sb), cy = b[1] - uy * (dep / 2) + ny * (dep / 2 + sb);
        modern(c, R, cx, cy, ang, dep, dep, Math.max(1, Math.round(o.fl * (.75 + R() * .25))), pick(R, o.pal));
      }
    }
  }
  // split a parcel into street blocks aligned with its long edge; edge blocks follow the parcel's curves
  function perimBlocks(c, P, R, o) {
    const outer = ccw(P.outer), cw = o.cw, chh = o.ch, s2 = o.street / 2;
    const u00 = P.u0 - (((P.u1 - P.u0) % cw) / 2), v00 = P.v0 - (((P.v1 - P.v0) % chh) / 2);
    for (let v = v00; v < P.v1; v += chh) for (let u = u00; u < P.u1; u += cw) {
      const q = [[u + s2, v + s2], [u + cw - s2, v + s2], [u + cw - s2, v + chh - s2], [u + s2, v + chh - s2]].map(([a, b]) => P.w(a, b));
      let blk = clipConvex(outer, q); if (blk.length < 3) continue;
      const A = Math.abs(ringArea(blk)); if (A < (o.minA ?? 1200)) continue;
      blk = simplify(ccw(blk), .22, 5); if (blk.length < 3) continue;
      let cx = 0, cy = 0; for (const p of blk) { cx += p[0]; cy += p[1]; } cx /= blk.length; cy /= blk.length;
      if (P.holes.some(h => inRing(cx, cy, h))) continue;
      if (o.special && o.special(cx, cy, blk, A)) continue;
      perimeter(c, R, blk, o);
      // courtyard: green ground and trees inside the ring
      const full = A > (cw - o.street) * (chh - o.street) * .8, inner = Math.min(cw, chh) - o.street - 2 * (o.depth + 2);
      if (full && inner > 10) {
        const [gx, gy] = P.w(u + cw / 2, v + chh / 2); put(c, 'box', 'green', gx, gy, PT, cw - o.street - 2 * o.depth - 6, chh - o.street - 2 * o.depth - 6, .04, P.ang, 0xffffff);
        const nT = Math.round((inner * inner) / 420 * TD * (o.trees ?? 1));
        for (let k = 0; k < nT; k++) { const [tx, ty] = P.w(u + cw / 2 + (R() - .5) * (cw - o.street - 2 * o.depth - 10), v + chh / 2 + (R() - .5) * (chh - o.street - 2 * o.depth - 10)); if (R() < .75) tree(c, R, tx, ty, PT + .04); else palm(c, R, tx, ty, PT + .04); }
      }
      // street trees between the blocks
      if (TD > .5) for (const k of [0, 2]) { const e0 = q[k], e1 = q[(k + 1) % 4], L = Math.hypot(e1[0] - e0[0], e1[1] - e0[1]);
        const nx = -(e1[1] - e0[1]) / L, ny = (e1[0] - e0[0]) / L;
        for (let s = 12; s < L - 6; s += 24) { const tx = e0[0] + (e1[0] - e0[0]) * s / L - nx * (s2 * .5), ty = e0[1] + (e1[1] - e0[1]) * s / L - ny * (s2 * .5); if (inP(P, tx, ty) && R() < .8) tree(c, R, tx, ty, PT, .8); } }
    }
  }
  // villas in rows that follow every edge of the parcel (concentric, so they curve with the streets and the lakes)
  function villaRings(c, P, R, o) {
    const outer = simplify(ccw(P.outer), .08, 6), cell = 24, grid = new Map();
    const near = (x, y, r) => { const gx = Math.floor(x / cell), gy = Math.floor(y / cell);
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) { const L = grid.get((gx + i) + ',' + (gy + j)); if (L) for (const p of L) if (Math.hypot(p[0] - x, p[1] - y) < r) return true; } return false; };
    const add = (x, y) => { const k = Math.floor(x / cell) + ',' + Math.floor(y / cell); let L = grid.get(k); if (!L) grid.set(k, L = []); L.push([x, y]); };
    const half = Math.min(P.u1 - P.u0, P.v1 - P.v0) / 2, pair = 2 * o.step + (o.street ?? 18), rings = Math.max(1, Math.ceil((half - o.first) / pair * 2) + 1);
    const wave = o.wave ?? 14, lam = o.lambda ?? 220, ph = R() * 6.28;
    for (let rg = 0; rg < rings; rg++) {
      const d0 = o.first + Math.floor(rg / 2) * pair + (rg % 2) * o.step; let acc = 0;
      for (let i = 0; i < outer.length; i++) {
        const a = outer[i], b = outer[(i + 1) % outer.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 14) { acc += L; continue; }
        const ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L, nx = -uy, ny = ux, ang = Math.atan2(uy, ux);
        for (let sAl = o.spacing * .7; sAl < L - o.spacing * .4; sAl += o.spacing) {
          const k = (acc + sAl) / lam * 6.283 + ph + rg * .9, dIn = d0 + (rg ? wave * Math.sin(k) : 0), tilt = rg ? Math.atan(wave * 6.283 / lam * Math.cos(k)) : 0;
          const x = a[0] + ux * sAl + nx * dIn, y = a[1] + uy * sAl + ny * dIn, av = ang + tilt + (rg % 2 ? Math.PI : 0);
          if (near(x, y, o.min) || !fits(P, x, y, 11 * o.scale, 9 * o.scale, av)) continue;
          add(x, y); villa(c, R, x, y, av, o.scale, o.pal ? pick(R, o.pal) : undefined);
        }
        acc += L;
      }
    }
    // gardens: trees and palms in what is left
    scatter(P, R, 34 / Math.sqrt(TD), (x, y) => { if (!near(x, y, 14) && R() < .55) (R() < .6 ? tree : palm)(c, R, x, y); });
  }

  /* ---------- one generator per land use ---------- */
  const lv = z => (z.h >= 1.4 ? Math.round(z.h / 1.4) : 0);
  const farOf = z => { const f = (z.facts || []).find(f => /FAR/.test(f.k)); return f ? parseFloat(f.v) : 0; };
  function blocks(c, P, R, fl, cov, w, d, pal, kind = 'mix') {
    const sx = w + 14, sy = Math.max(d + 12, (w * d) / (Math.max(cov, .08) * sx));
    slots(P, R, w, d, sx, sy, 6, (x, y, a) => {
      const r = R(), f = Math.max(2, fl - (R() < .3 ? 1 : 0)), col = pick(R, pal);
      if (kind === 'mix' && r < .25) lshape(c, R, x, y, a, w, d, f, col);
      else if (kind === 'mix' && r < .4) { for (const s of [-1, 1]) { const [px, py] = off(x, y, a, s * w / 4, 0); slab(c, px, py, a, w * .42, d, f, col); } }
      else stepped(c, R, x, y, a, w, d, f, col);
      if (R() < .7 * TD) { const [tx, ty] = off(x, y, a, (R() - .5) * w, d / 2 + Math.min(8, (sy - d) / 2)); tree(c, R, tx, ty); }
    }, .5, 4);
  }
  const GEN = {
    rl(c, P, R) { villaRings(c, P, R, { first: 16, step: 30, street: 18, spacing: 27, min: 23, scale: 1 }); },   // villas along curved streets, lakes and golf
    rp(c, P, R, fl) { perimBlocks(c, P, R, { cw: 118, ch: 92, street: 24, depth: 13, seg: 30, gap: 11, porosity: .12, corner: .2, fl, pal: SAND, trees: 1.3 }); },
    rm(c, P, R, fl) { perimBlocks(c, P, R, { cw: 104, ch: 82, street: 22, depth: 14, seg: 42, gap: 9, porosity: .05, corner: .45, fl, pal: SAND }); },
    rh(c, P, R, fl) { perimBlocks(c, P, R, { cw: 92, ch: 74, street: 20, depth: 14, seg: 58, gap: 6, corner: .6, fl, pal: SAND, vary: 1 }); },
    cd(c, P, R, fl, cov, Z) {                                 // district core: podium + stepped mid-rise, towers, glass pyramid plaza
      let pyr = null;
      if (P.area > 60000) { const [x, y] = P.w((P.u0 + P.u1) / 2, (P.v0 + P.v1) / 2); if (fits(P, x, y, 40, 40, P.ang)) { glassPyr(c, x, y, P.ang, 34); pyr = [x, y]; plazas.push({ x, y, a: P.ang, b: 34 });
        put(c, 'box', 'pave', x, y, PT - .005, 150, 150, .03, P.ang, 0xffffff);
        for (let k = 0; k < 16; k++) { const t = k / 16 * Math.PI * 2; palm(c, R, x + Math.cos(t) * 66, y + Math.sin(t) * 66); } } }
      perimBlocks(c, P, R, { cw: 120, ch: 100, street: 26, depth: 17, seg: 46, gap: 8, corner: .7, fl, pal: SAND,
        special: (x, y, blk, A) => { if (pyr && (Math.hypot(x - pyr[0], y - pyr[1]) < 100 || blk.some(p => Math.hypot(p[0] - pyr[0], p[1] - pyr[1]) < 78))) return true;
          if (fl >= 6 && A > 5000 && R() < .12) { tower(c, R, x, y, P.ang, 22, Math.round(fl * 1.5)); return true; } return false; } });
    },
    me(c, P, R, fl, cov) {                                    // entry district: a long colonnade facing the axis + blocks
      const [x, y] = P.w(P.u0 + (P.u1 - P.u0) * .5, P.v0 + 26);
      if (P.area > 60000 && fits(P, x, y, 70, 14, P.ang)) {
        slab(c, x, y, P.ang, 130, 22, 3, 0xf2ece1);
        for (let k = -60; k <= 60; k += 6) { const [cx, cy] = off(x, y, P.ang, k, -13); put(c, 'cyl', 'plain', cx, cy, PT, 1.6, 1.6, 2.6 * F, 0, 0xf6f1e8); }
        const [wx, wy] = off(x, y, P.ang, 0, -40); put(c, 'box', 'water', wx, wy, PT, 14, 50, .03, P.ang, 0xffffff);
      }
      perimBlocks(c, P, R, { cw: 104, ch: 86, street: 24, depth: 15, seg: 44, gap: 8, corner: .6, fl, pal: WARM,
        special: (x2, y2) => Math.hypot(x2 - x, y2 - y) < 90 && P.area > 60000 });
    },
    mc(c, P, R, fl) {                                         // media city core: sound stages + production offices
      slots(P, R, 62, 42, 78, 60, 8, (x, y, a, row, col) => {
        if ((row + col) % 3 !== 2) { put(c, 'box', 'plain', x, y, PT, 62, 42, 4.5 * F, a, pick(R, STAGE));
          put(c, 'box', 'plain', x, y, PT + 4.5 * F, 63, 43, 0.06, a, 0xa9a397);
          for (let k = -24; k <= 24; k += 12) { const [ux, uy] = off(x, y, a, k, 0); put(c, 'box', 'plain', ux, uy, PT + 4.5 * F + .06, 3, 3, .12, a, 0x8a857c); } }
        else if (R() < .35) tower(c, R, x, y, a, 20, fl + 4);
        else modern(c, R, x, y, a, 58, 22, fl, pick(R, SAND));
      }, 0, 0);
    },
    mb(c, P, R) {                                             // backlots: streets of film-set facades
      slots(P, R, 18, 12, 24, 20, 3, (x, y, a, row, col) => {
        if (row % 4 === 3 || col % 6 === 5) return;          // a street every few rows
        const w = 10 + R() * 12, d = 8 + R() * 6, f = 1 + ((R() * 3) | 0);
        slab(c, x, y, a, w, d, f, pick(R, SET), PT, R() < .7 ? 'wall' : 'plain');
        if (R() < .2 * TD) palm(c, R, ...off(x, y, a, w / 2 + 2, d / 2 + 2));
      }, 0, 3);
    },
    mh(c, P, R, fl) { perimBlocks(c, P, R, { cw: 120, ch: 96, street: 20, depth: 16, seg: 56, gap: 14, porosity: .1, corner: .5, fl, pal: CREAM,
      special: (x, y, blk, A) => { if (A > 6000 && R() < .25) { tower(c, R, x, y, P.ang, 22, fl + 3); put(c, 'box', 'water', ...off(x, y, P.ang, 0, 34), PT, 30, 10, .03, P.ang, 0xffffff); return true; } return false; } }); },
    hl(c, P, R, fl) {                                         // luxury resort: main lodge, pavilions, pools, palms
      const [x, y] = P.w((P.u0 + P.u1) / 2, (P.v0 + P.v1) / 2); if (fits(P, x, y, 40, 18, P.ang)) stepped(c, R, x, y, P.ang, 80, 30, fl + 1, 0xe7d3b3);
      slots(P, R, 18, 14, 32, 30, 6, (x2, y2, a) => { if (Math.hypot(x2 - x, y2 - y) < 60) return; villa(c, R, x2, y2, a, 1.1, pick(R, WARM)); }, .5, 6);
      scatter(P, R, 26 / Math.sqrt(TD), (x2, y2) => { if (R() < .3) palm(c, R, x2, y2); });
    },
    hu(c, P, R, fl) { perimBlocks(c, P, R, { cw: 108, ch: 88, street: 18, depth: 15, seg: 44, gap: 12, porosity: .18, corner: .4, fl, pal: WARM, trees: 1.2 }); },
    hb(c, P, R, fl) {                                         // branded residences: courtyard blocks near the streets, villas behind
      if (P.area > 250000) villaRings(c, P, R, { first: 18, step: 33, street: 18, spacing: 30, min: 26, scale: 1.15, pal: CREAM });
      else perimBlocks(c, P, R, { cw: 100, ch: 80, street: 18, depth: 13, seg: 30, gap: 10, porosity: .2, corner: .3, fl, pal: CREAM, trees: 1.4 });
    },
    ed(c, P, R, fl) { perimBlocks(c, P, R, { cw: 140, ch: 110, street: 22, depth: 16, seg: 52, gap: 18, porosity: .25, openCorners: true, fl, pal: SAND, trees: 1.5 }); },
    ip(c, P, R, fl) { perimBlocks(c, P, R, { cw: 104, ch: 84, street: 18, depth: 18, seg: 40, gap: 12, porosity: .1, corner: .3, fl, pal: SAND }); },
    in(c, P, R, fl) { perimBlocks(c, P, R, { cw: 120, ch: 96, street: 20, depth: 16, seg: 50, gap: 14, porosity: .15, openCorners: true, fl, pal: CREAM, trees: 1.3 }); },
    rt(c, P, R) {                                             // retail: big mall halls with glass-pyramid skylights
      slots(P, R, 120, 70, 150, 110, 10, (x, y, a) => { const t = slab(c, x, y, a, 120, 70, 2, pick(R, SAND), PT, 'plain'); glassPyr(c, x, y, a, 26, t); for (const s of [-1, 1]) palm(c, R, ...off(x, y, a, s * 64, 40)); }, .5, 0);
    },
    dc(c, P, R) {                                             // data centres: long grey halls with rooftop plant
      slots(P, R, 150, 48, 170, 66, 8, (x, y, a) => {
        const t = slab(c, x, y, a, 150, 48, 3.5, pick(R, GREY), PT, 'plain');
        for (let k = -66; k <= 66; k += 12) for (const s of [-1, 1]) put(c, 'box', 'plain', ...off(x, y, a, k, s * 12), t, 7, 6, .25, a, 0x6c7176);
      }, 0, 0);
    },
    ut(c, P, R, fl, cov, Z) {
      if (farOf(Z) > 0 && P.area < 120000) slots(P, R, 34, 34, 46, 46, 6, (x, y, a) => { if (R() < .75) { put(c, 'cyl', 'plain', x, y, PT, 30, 30, 1.6 * F, 0, 0xd8d2c6); put(c, 'cyl', 'plain', x, y, PT + 1.6 * F, 31, 31, .05, 0, 0x9aa0a0); } else slab(c, x, y, a, 30, 18, 2, 0xbdb6aa, PT, 'plain'); }, .5, 0);
      else slots(P, R, 80, 5, 86, 9, 4, (x, y, a) => put(c, 'box', 'solar', x, y, PT + .08, 80, 5, .08, a, 0xffffff), 0, 0);
    },
    pk(c, P, R) { scatter(P, R, 22 / Math.sqrt(TD), (x, y) => { const r = R(); if (r < .45) tree(c, R, x, y, PT + .03); else if (r < .7) palm(c, R, x, y, PT + .03); }); },
    gf(c, P, R) { const [x, y] = P.w((P.u0 + P.u1) / 2, (P.v0 + P.v1) / 2); stepped(c, R, x, y, P.ang, 60, 26, 2, 0xefe6d6); scatter(P, R, 30, (x2, y2) => { if (R() < .35 && Math.hypot(x2 - x, y2 - y) > 45) palm(c, R, x2, y2); }); },
    cf(c, P, R) { perimBlocks(c, P, R, { cw: 70, ch: 60, street: 14, depth: 12, seg: 26, gap: 8, porosity: .2, openCorners: true, fl: 2, pal: CREAM, minA: 500 }); },
    tp(c, P, R) {                                             // theme park: rides, pavilions and lots of palms (wheel/arena/coaster added below)
      slots(P, R, 20, 16, 60, 54, 10, (x, y, a) => { if (R() < .5) slab(c, x, y, a, 16 + R() * 10, 12 + R() * 6, 1 + ((R() * 2) | 0), pick(R, SET)); else { put(c, 'cyl', 'plain', x, y, PT, 18, 18, .3 * F, 0, 0xc55b7b); put(c, 'cyl', 'plain', x, y, PT + .3 * F, 4, 4, 2.2 * F, 0, 0xe8dcc4); } }, .5, 10);
      scatter(P, R, 26 / Math.sqrt(TD), (x, y) => { if (R() < .3) palm(c, R, x, y); });
    },
  };

  const extra = new THREE.Group(); extra.name = 'landmark-rides';
  const spinners = [];
  let stats = {};
  for (const Z of zones) {
    const gen = GEN[Z.cat]; if (!gen) continue;
    const R = rngOf(hashStr(Z.id || Z.pid || Z.ar)), fl = Math.max(1, lv(Z)), far = farOf(Z), cov = far ? far / fl : .2;
    for (const poly of Z.polys) { const P = prep(poly); if (P.area < 800) continue; gen(Z.cat, P, R, fl, cov, Z); }
  }
  // the theme park's signature rides on its biggest parcel
  const tps = zones.filter(z => z.cat === 'tp').sort((a, b) => (b.area || 0) - (a.area || 0));
  if (tps[0]) {
    const P = prep(tps[0].polys[0]), R = rngOf(7), at = (fu, fv) => P.w(P.u0 + (P.u1 - P.u0) * fu, P.v0 + (P.v1 - P.v0) * fv);
    const find = (fu, fv, r) => { for (let k = 0; k < 40; k++) { const [x, y] = at(Math.min(.9, Math.max(.1, fu + (R() - .5) * k * .02)), Math.min(.9, Math.max(.1, fv + (R() - .5) * k * .02))); if (fits(P, x, y, r, r, 0)) return [x, y]; } return null; };
    const w = find(.3, .35, 45), ar = find(.62, .55, 60), co = find(.78, .3, 70);
    if (w) { const g = ferrisWheel(); g.position.set(w[0] * S, w[1] * S, PT); g.rotation.z = P.ang; extra.add(g); }
    if (ar) extra.add(arena(ar[0], ar[1]));
    if (co) extra.add(coaster(co[0], co[1], P.ang));
  }
  // palm boulevards along the 100 m and 60 m roads, the main avenue in every render
  const RR = rngOf(99);
  for (const r of roads) {
    if (r.w === 30 && !MOB) { const p = r.p; for (let i = 1; i < p.length; i++) { const a = p[i - 1], b = p[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (!L) continue;
      const dx = (b[0] - a[0]) / L, dy = (b[1] - a[1]) / L; for (let s2 = 12; s2 < L; s2 += 26) for (const o of [-11, 11]) tree('_road', RR, a[0] + dx * s2 - dy * o, a[1] + dy * s2 + dx * o, 0.15, .85); } continue; }
    if (!(r.w >= 100 || (r.w >= 60 && !MOB))) continue;
    const p = r.p, step = r.w >= 100 ? 28 : 36, offs = r.w >= 100 ? [-(r.w / 2 - 5), 0, r.w / 2 - 5] : [-(r.w / 2 - 4), r.w / 2 - 4];
    let carry = 0;
    for (let i = 1; i < p.length; i++) {
      const a = p[i - 1], b = p[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (!L) continue; const dx = (b[0] - a[0]) / L, dy = (b[1] - a[1]) / L;
      for (let s = carry; s < L; s += step) for (const o of offs) palm('_road', RR, a[0] + dx * s - dy * o, a[1] + dy * s + dx * o, 0.15);
      carry = (carry - L) % step; if (carry < 0) carry += step;
    }
  }

  // train depot (extras.depot): long maintenance sheds and sidings along the plot's long edge
  const dep = data.extras && data.extras.depot;
  if (dep && dep.poly) {
    const P = prep([dep.poly]), R = rngOf(31), DZ = dep.h || 0.3;
    slots(P, R, 260, 36, 300, 120, 20, (x, y, a, row) => { slab('_depot', x, y, a, 260, 36, 3, 0xb9b2a6, DZ, 'plain');
      put('_depot', 'box', 'plain', x, y, DZ + 3 * F, 262, 12, .25, a, 0x8d8a85); });
    for (let v = P.v0 + 30; v < P.v1 - 30; v += 14) { const [x1, y1] = P.w(P.u0 + 40, v), [x2, y2] = P.w(P.u1 - 40, v), [mx, my] = [(x1 + x2) / 2, (y1 + y2) / 2];
      if (inP(P, mx, my)) put('_depot', 'box', 'plain', mx, my, DZ, P.u1 - P.u0 - 80, 3.5, .04, P.ang, 0x4b443d); }
  }

  /* ---------- geometry + materials ---------- */
  const GEO = {
    box: new THREE.BoxGeometry(1, 1, 1).translate(0, 0, .5),
    cyl: new THREE.CylinderGeometry(.5, .5, 1, 18, 1).rotateX(Math.PI / 2).translate(0, 0, .5),
    trunk: new THREE.CylinderGeometry(.32, .5, 1, 4, 1, true).rotateX(Math.PI / 2).translate(0, 0, .5),
    ico: new THREE.IcosahedronGeometry(.5, 0).translate(0, 0, .5),
    pyr: new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4).rotateX(Math.PI / 2).translate(0, 0, .5),
    crown: palmCrownGeo(),
  };
  function palmCrownGeo() {
    const parts = [];
    for (let i = 0; i < 6; i++) { const g = new THREE.ConeGeometry(.08, .5, 3, 1, true); g.rotateZ(-Math.PI / 2); g.translate(.25, 0, 0); g.scale(1, 1, .45);
      g.rotateY(.25 + (i % 2) * .3); g.rotateZ(i / 6 * Math.PI * 2); parts.push(g); }
    const pos = [], idx = []; let base = 0;
    for (const g of parts) { const P = g.attributes.position, I = g.index; for (let k = 0; k < P.count; k++) pos.push(P.getX(k), P.getY(k), P.getZ(k)); for (let k = 0; k < I.count; k++) idx.push(I.getX(k) + base); base += P.count; g.dispose(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
  }
  function windows(mat, glass) {
    mat.customProgramCacheKey = () => glass ? 'nv-glass' : 'nv-wall';
    mat.onBeforeCompile = sh => {
      sh.uniforms.uFloor = { value: F }; sh.uniforms.uBay = { value: (glass ? 3.2 : 4.4) * S }; sh.uniforms.uLit = { value: glass ? .55 : .42 };
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;')
        .replace('#include <project_vertex>', `#include <project_vertex>
          vec4 nvP = vec4(transformed, 1.0); vec3 nvN = objectNormal;
          #ifdef USE_INSTANCING
            nvP = instanceMatrix * nvP; nvN = mat3(instanceMatrix) * nvN;
          #endif
          vWP = (modelMatrix * nvP).xyz; vWN = normalize(mat3(modelMatrix) * nvN);`);
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN; uniform float uFloor, uBay, uLit; float nvLit = 0.0;')
        .replace('#include <color_fragment>', `#include <color_fragment>
          {
            float wall = 1.0 - smoothstep(.35, .65, abs(vWN.y));
            vec2 t2 = normalize(vec2(-vWN.z, vWN.x) + vec2(1e-4));
            float hc = dot(vWP.xz, t2) / uBay, vc = (vWP.y - ${PT.toFixed(3)}) / uFloor;
            float fx = fract(hc), fy = fract(vc);
            ${glass
              ? 'float w = step(.07, fx) * step(fx, .93) * step(.10, fy) * step(fy, .95); float avg = .72;'
              : 'float mf = clamp(2.2 - 3.0 * fwidth(hc), 0., 1.); float w = step(.34, fy) * step(fy, .88) * (1.0 - step(fx, .05) * mf); float avg = .5; if (vc < 1.0) { w = step(.08, fy) * step(fy, .92) * (1.0 - step(fx, .07) * mf); }'}
            float aa = clamp(2.0 - 2.4 * fwidth(vc), 0., 1.);
            float h = fract(sin(dot(floor(vec2(hc, vc)), vec2(12.9898, 78.233))) * 43758.5453);
            nvLit = mix(avg * .32, w * step(.66, h), aa) * wall;
            w = mix(avg, w, aa) * wall;
            vec3 gcol = mix(vec3(.15, .19, .22), vec3(.38, .45, .5), clamp(fy * 1.1 - .2, 0., 1.) * .7);
            ${glass ? '' : 'if (fy < .08 && vc > .9) diffuseColor.rgb = min(diffuseColor.rgb * 1.12, vec3(1.0));'}
            diffuseColor.rgb = mix(diffuseColor.rgb, ${glass ? 'vec3(.20, .27, .31)' : 'gcol'}, w * ${glass ? '.9' : '.82'});
            ${glass ? 'diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.55, .54, .5), (1.0 - w) * wall * .6);' : ''}
            if (vWN.y > .6) diffuseColor.rgb *= 1.05;
          }`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          totalEmissiveRadiance += vec3(1.0, .66, .36) * nvLit * uLit;`);
    };
    return mat;
  }
  const M = {
    wall: windows(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .85 }), false),
    villa: windows(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .8 }), false),
    glass: windows(new THREE.MeshStandardMaterial({ color: 0x9fb4bd, roughness: .25, metalness: .35 }), true),
    plain: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .9 }),
    green: new THREE.MeshStandardMaterial({ color: 0x6f8b48, roughness: 1 }),
    lawn: new THREE.MeshStandardMaterial({ color: 0x7d9a52, roughness: 1 }),
    water: new THREE.MeshStandardMaterial({ color: 0x3f93ad, roughness: .2, metalness: .1, emissive: 0x0b2a33 }),
    pave: new THREE.MeshStandardMaterial({ color: 0xe9dcc4, roughness: .9 }),
    solar: new THREE.MeshStandardMaterial({ color: 0x1f2c3a, roughness: .35, metalness: .45 }),
    trunk: new THREE.MeshStandardMaterial({ color: 0x6b5640, roughness: 1 }),
    leaf: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true }),
    frond: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true, side: THREE.DoubleSide }),
  };

  const byCat = {}, m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), Zax = new THREE.Vector3(0, 0, 1), pv = new THREE.Vector3(), sv = new THREE.Vector3(), col = new THREE.Color();
  let inst = 0;
  for (const b of bins.values()) {
    const n = b.L.length / 8, mesh = new THREE.InstancedMesh(GEO[b.g], M[b.m], n);
    for (let i = 0; i < n; i++) {
      const o = i * 8, L = b.L;
      pv.set(L[o] * S, L[o + 1] * S, L[o + 2]); q.setFromAxisAngle(Zax, L[o + 6]);
      sv.set(Math.max(.01, L[o + 3] * S), Math.max(.01, L[o + 4] * S), Math.max(.005, L[o + 5]));
      mesh.setMatrixAt(i, m4.compose(pv, q, sv)); mesh.setColorAt(i, col.setHex(L[o + 7]));
    }
    mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.castShadow = !['green', 'lawn', 'water', 'pave', 'solar'].includes(b.m) && !(MOB && (b.m === 'leaf' || b.m === 'frond' || b.m === 'trunk'));
    mesh.receiveShadow = true; mesh.computeBoundingSphere(); mesh.frustumCulled = true;
    (byCat[b.cat] ||= new THREE.Group()).add(mesh); inst += n;
    stats[b.cat] = (stats[b.cat] || 0) + n;
  }
  stats.total = inst;
  (byCat.tp ||= new THREE.Group()).add(extra);

  /* ---------- the theme park rides (regular meshes, the wheel turns in the loop) ---------- */
  function ferrisWheel() {
    const g = new THREE.Group(), D = 64, k = S * 1.35, white = new THREE.MeshStandardMaterial({ color: 0xf4efe6, roughness: .5, metalness: .3 });
    const hub = new THREE.Group(); hub.position.z = (D / 2 + 6) * k; g.add(hub);
    const wheel = new THREE.Group(); hub.add(wheel);
    for (const y of [-2.2, 2.2]) { const rim = new THREE.Mesh(new THREE.TorusGeometry(D / 2 * k, .45 * k, 6, 64), white); rim.rotation.x = Math.PI / 2; rim.position.y = y * k; wheel.add(rim); }
    for (let i = 0; i < 16; i++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(D * k, .35 * k, .35 * k), white); sp.rotation.y = i / 16 * Math.PI; wheel.add(sp); }
    const cab = new THREE.MeshStandardMaterial({ color: 0xc55b7b, roughness: .6 }), cg = new THREE.BoxGeometry(2.6 * k, 3 * k, 3 * k);
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, c = new THREE.Mesh(cg, cab); c.position.set(Math.cos(a) * D / 2 * k, 0, Math.sin(a) * D / 2 * k); wheel.add(c); }
    for (const s of [-1, 1]) for (const y of [-4, 4]) { const L = Math.hypot(D / 2 + 6, 14), leg = new THREE.Mesh(new THREE.BoxGeometry(.9 * k, .9 * k, L * k), white);
      leg.position.set(s * 7 * k, y * k, (D / 2 + 6) / 2 * k); leg.rotation.y = s * Math.atan2(14, D / 2 + 6) * -1; g.add(leg); }
    g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    spinners.push(t => { wheel.rotation.y = t * 0.06; for (const c of wheel.children) if (c.geometry === cg) c.rotation.y = -wheel.rotation.y; });
    return g;
  }
  function arena(x, y) {
    const g = new THREE.Group(); g.position.set(x * S, y * S, PT);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(55 * S, 58 * S, 7 * F / 4 * 4, 48, 1).rotateX(Math.PI / 2).translate(0, 0, 7 * F / 2), new THREE.MeshStandardMaterial({ color: 0xeee6da, roughness: .6 }));
    const band = new THREE.Mesh(new THREE.CylinderGeometry(55.6 * S, 55.6 * S, 1.2 * F, 48, 1, true).rotateX(Math.PI / 2).translate(0, 0, 4.6 * F), new THREE.MeshStandardMaterial({ color: 0x2a3138, roughness: .3, metalness: .4, emissive: 0x3a1c2a }));
    const roof = new THREE.Mesh(new THREE.SphereGeometry(52 * S, 40, 10, 0, Math.PI * 2, 0, Math.PI / 2).rotateX(Math.PI / 2).scale(1, 1, .28).translate(0, 0, 7 * F), new THREE.MeshStandardMaterial({ color: 0xf6f2ea, roughness: .5 }));
    g.add(body, band, roof); g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return g;
  }
  function coaster(x, y, a) {
    const pts = []; for (let i = 0; i < 24; i++) { const t = i / 24 * Math.PI * 2, r = 55 + 18 * Math.sin(3 * t);
      pts.push(new THREE.Vector3(Math.cos(t) * r * S, Math.sin(t) * r * .6 * S, PT + (6 + 22 * Math.max(0, Math.sin(2 * t + .6)) + 8 * Math.max(0, Math.cos(5 * t))) * VEX * S)); }
    const curve = new THREE.CatmullRomCurve3(pts, true), g = new THREE.Group(); g.position.set(x * S, y * S, 0); g.rotation.z = a;
    const red = new THREE.MeshStandardMaterial({ color: 0xb8383f, roughness: .45, metalness: .3 }), grey = new THREE.MeshStandardMaterial({ color: 0xd9d4cc, roughness: .7 });
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 240, .9 * S, 6, true), red));
    const pg = new THREE.CylinderGeometry(.3 * S, .3 * S, 1, 4).rotateX(Math.PI / 2).translate(0, 0, .5);
    for (let i = 0; i < 60; i++) { const p = curve.getPointAt(i / 60), h = p.z - PT; if (h < .1) continue; const m = new THREE.Mesh(pg, grey); m.position.set(p.x, p.y, PT); m.scale.set(1, 1, h); g.add(m); }
    g.traverse(m => { if (m.isMesh) { m.castShadow = true; } }); return g;
  }

  return { byCat, extra, stats, plazas, levels: lv, update: t => { for (const f of spinners) f(t); } };
}
