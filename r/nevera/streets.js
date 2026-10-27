// Nevera: streets and traffic. Every DWG road centreline (cleaned by road_clean.py: no duplicated stretches, short
// gaps closed) gets a cross-section by its right-of-way width: asphalt carriageways, green median and dashed lane lines,
// with the median and the lines cut where another road crosses. Cars drive on the right in lanes: each car keeps a safe
// gap to the one ahead, and every junction has traffic lights that alternate between the two roads, so cars queue at a
// red light instead of driving through each other. Cars fade in and out at the ends of a road.
// buildStreets(THREE, data, {S, mobile}) works in the map's shape space (x east, y north, z up) and returns
// {group, update(t), stats, junctions}.

export function buildStreets(THREE, data, opt = {}) {
  const S = opt.S ?? 0.1, MOB = !!opt.mobile, roads = (data.roads || []).filter(r => (r.p || []).length > 1);
  const group = new THREE.Group(); group.name = 'streets';

  // cross-sections (metres from the centreline, + = left of the drawing direction)
  const PRO = {
    100: { asphalt: [[10, 24], [-24, -10], [30, 37], [-37, -30]], median: [[-10, 10]], dash: [14.7, 19.3, -14.7, -19.3], lanes: [-12.3, -17, -21.7, -33.5], spacing: 34, v: 18, edge: 37 },
    60: { asphalt: [[4, 15], [-15, -4]], median: [[-4, 4]], dash: [9.5, -9.5], lanes: [-6.7, -12.2], spacing: 42, v: 14, edge: 15 },
    30: { asphalt: [[-7, 7]], median: [], dash: [0], lanes: [-3.5], spacing: 70, v: 11, edge: 7 },
    20: { asphalt: [[-4.5, 4.5]], median: [], dash: [0], lanes: [-2.2], spacing: 110, v: 8, edge: 4.5 },
  };
  const proOf = w => PRO[w] || (w >= 80 ? PRO[100] : w >= 45 ? PRO[60] : w >= 25 ? PRO[30] : PRO[20]);

  // ---------- polylines (metres) ----------
  function prepLine(p) {
    const L = [0]; for (let i = 1; i < p.length; i++) L.push(L[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]));
    const N = p.map((q, i) => { const a = p[Math.max(0, i - 1)], c = p[Math.min(p.length - 1, i + 1)]; const dx = c[0] - a[0], dy = c[1] - a[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; });
    return { p, L, N, total: L[L.length - 1] };
  }
  function at(line, s) {                                         // point, normal and heading at arc length s
    const L = line.L; s = Math.max(0, Math.min(line.total, s)); let lo = 0, hi = L.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (L[m] <= s) lo = m; else hi = m; }
    const a = line.p[lo], b = line.p[hi], t = (s - L[lo]) / Math.max(1e-6, L[hi] - L[lo]), na = line.N[lo], nb = line.N[hi];
    let nx = na[0] + (nb[0] - na[0]) * t, ny = na[1] + (nb[1] - na[1]) * t; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
    return { x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, nx, ny, ang: Math.atan2(b[1] - a[1], b[0] - a[0]) };
  }
  const lines = roads.map(r => ({ r, line: prepLine(r.p), pro: proOf(r.w || 20), cuts: [] }));

  // ---------- junctions: where two centrelines cross or one ends on the other ----------
  const junctions = [];
  {
    const segX = (p1, p2, p3, p4) => { const d = (p2[0] - p1[0]) * (p4[1] - p3[1]) - (p2[1] - p1[1]) * (p4[0] - p3[0]); if (Math.abs(d) < 1e-9) return null;
      const t = ((p3[0] - p1[0]) * (p4[1] - p3[1]) - (p3[1] - p1[1]) * (p4[0] - p3[0])) / d, u = ((p3[0] - p1[0]) * (p2[1] - p1[1]) - (p3[1] - p1[1]) * (p2[0] - p1[0])) / d;
      return t >= -1e-3 && t <= 1 + 1e-3 && u >= -1e-3 && u <= 1 + 1e-3 ? [t, u] : null; };
    for (let i = 0; i < lines.length; i++) for (let j = i + 1; j < lines.length; j++) {
      const A = lines[i].line, B = lines[j].line;
      for (let a = 1; a < A.p.length; a++) for (let b = 1; b < B.p.length; b++) {
        const X = segX(A.p[a - 1], A.p[a], B.p[b - 1], B.p[b]); if (!X) continue;
        const sa = A.L[a - 1] + (A.L[a] - A.L[a - 1]) * X[0], sb = B.L[b - 1] + (B.L[b] - B.L[b - 1]) * X[1];
        if (junctions.some(J => J.i === i && J.j === j && Math.abs(J.si - sa) < 25)) continue;
        junctions.push({ i, j, si: sa, sj: sb });
      }
    }
    // junctions closer than 40 m are one intersection (three or more roads meeting): one signal controller each,
    // giving every road its own green slot, widest road first
    const par = junctions.map((_, k) => k), find = k => par[k] === k ? k : (par[k] = find(par[k])), join = (a, b) => { par[find(a)] = find(b); };
    junctions.forEach((J, k) => { J.k = k; const q = at(lines[J.i].line, J.si); J.x = q.x; J.y = q.y; });
    for (let a = 0; a < junctions.length; a++) for (let b = a + 1; b < junctions.length; b++) if (Math.hypot(junctions[a].x - junctions[b].x, junctions[a].y - junctions[b].y) < 40) join(a, b);
    lines.forEach((L, li) => { const cs = junctions.filter(J => J.i === li || J.j === li).map(J => ({ J, s: J.i === li ? J.si : J.sj, hw: (lines[J.i === li ? J.j : J.i].r.w || 20) / 2 + 2 })).sort((a, b) => a.s - b.s);
      for (let k = 1; k < cs.length; k++) if (cs[k].s - cs[k].hw <= cs[k - 1].s + cs[k - 1].hw + 12) join(cs[k - 1].J.k, cs[k].J.k); });
    const byRoot = new Map(), nodes = [];
    for (const J of junctions) { const r = find(J.k); let nd = byRoot.get(r); if (!nd) { nd = { x: J.x, y: J.y, roads: [], js: [] }; byRoot.set(r, nd); nodes.push(nd); }
      nd.js.push(J); for (const li of [J.i, J.j]) if (!nd.roads.includes(li)) nd.roads.push(li); J.node = nd; }
    nodes.forEach((nd, k) => { nd.roads.sort((a, b) => (lines[b].r.w || 20) - (lines[a].r.w || 20)); nd.off = (k * 7.37) % (nd.roads.length * 16); });
    for (const J of junctions) {
      const wi = lines[J.i].r.w || 20, wj = lines[J.j].r.w || 20, nd = J.node;
      lines[J.i].cuts.push({ s: J.si, hw: wj / 2 + 2, J, nd, slot: nd.roads.indexOf(J.i) });
      lines[J.j].cuts.push({ s: J.sj, hw: wi / 2 + 2, J, nd, slot: nd.roads.indexOf(J.j) });
    }
    junctions.nodes = nodes;
  }
  // the parts of a road that are not inside a junction
  function openRanges(L) {
    const T = L.line.total, ex = L.cuts.map(c => [c.s - c.hw, c.s + c.hw]).sort((a, b) => a[0] - b[0]), out = []; let s = 0;
    for (const [a, b] of ex) { if (a > s + 2) out.push([s, Math.min(a, T)]); s = Math.max(s, b); }
    if (T > s + 2) out.push([s, T]); return out;
  }

  // ---------- road surfaces ----------
  function strip(line, s0, s1, o0, o1, z, G, uScale = 1, vMetric = false) {
    const ss = [s0]; for (const L of line.L) if (L > s0 && L < s1) ss.push(L); ss.push(s1);
    const base = G.pos.length / 3;
    ss.forEach((s, i) => { const q = at(line, s);
      G.pos.push((q.x + q.nx * o0) * S, (q.y + q.ny * o0) * S, z, (q.x + q.nx * o1) * S, (q.y + q.ny * o1) * S, z); G.uv.push(s / uScale, vMetric ? o0 / 2 : 0, s / uScale, vMetric ? o1 / 2 : 1);
      if (i) { const k = base + (i - 1) * 2; G.idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); } });
  }
  const A = { pos: [], uv: [], idx: [] }, Md = { pos: [], uv: [], idx: [] }, D = { pos: [], uv: [], idx: [] }, X = { pos: [], uv: [], idx: [] };
  for (const L of lines) {
    const { line, pro } = L;
    for (const [a, b] of pro.asphalt) strip(line, 0, line.total, a, b, .16, A);
    for (const [s0, s1] of openRanges(L)) {
      for (const [a, b] of pro.median) strip(line, s0, s1, a, b, .17, Md);
      for (const o of pro.dash) strip(line, s0 + 3, s1 - 3, o - .18, o + .18, .165, D, 7);   // 3.5 m dash, 3.5 m gap
    }
    // a zebra crossing and a stop line before every junction, on both sides
    for (const c of L.cuts) for (const sd of [-1, 1]) { const s = c.s + sd * (c.hw + 1.5); if (s < 2 || s > line.total - 2) continue;
      strip(line, s - 1.5, s + 1.5, -pro.edge, pro.edge, .166, X, 1, true); }
  }
  const geo = G => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(G.pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(G.uv, 2)); g.setIndex(G.idx); g.computeVertexNormals(); return g; };
  const off = (m, f) => { m.polygonOffset = true; m.polygonOffsetFactor = f; m.polygonOffsetUnits = f; return m; };
  const asphalt = new THREE.Mesh(geo(A), off(new THREE.MeshStandardMaterial({ color: 0x34322f, roughness: .95 }), -1));
  const median = new THREE.Mesh(geo(Md), off(new THREE.MeshStandardMaterial({ color: 0x6f8a4a, roughness: 1 }), -2));
  const canvasTex = draw => { const c = document.createElement('canvas'); draw(c, c.getContext('2d')); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t; };
  const dashTex = canvasTex((c, g) => { c.width = 32; c.height = 4; g.fillStyle = '#fff'; g.fillRect(0, 0, 16, 4); });
  const zebraTex = canvasTex((c, g) => { c.width = 4; c.height = 8; g.fillStyle = '#fff'; g.fillRect(0, 0, 4, 4); });   // 1 m bar, 1 m gap across the road
  const dashes = new THREE.Mesh(geo(D), off(new THREE.MeshBasicMaterial({ color: 0xe9e3d6, map: dashTex, alphaTest: .5 }), -3));
  const zebra = new THREE.Mesh(geo(X), off(new THREE.MeshBasicMaterial({ color: 0xe9e3d6, map: zebraTex, alphaTest: .5 }), -3));
  asphalt.receiveShadow = median.receiveShadow = true;
  group.add(asphalt, median, dashes, zebra);

  // traffic lights: a pole with a light that shows the state of each junction approach
  const sigGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2).translate(0, 0, .6), sigPole = new THREE.CylinderGeometry(.18, .18, 1, 5).rotateX(Math.PI / 2).translate(0, 0, .5);
  const sigs = [];
  for (const L of lines) for (const c of L.cuts) for (const sd of [-1, 1]) {
    const s = c.s + sd * (c.hw + 3); if (s < 2 || s > L.line.total - 2) continue;
    const q = at(L.line, s), side = -sd;                              // on the right of the approaching traffic
    const x = q.x + q.nx * side * (L.pro.edge + 2), y = q.y + q.ny * side * (L.pro.edge + 2);
    if (sigs.some(o => Math.hypot(o.x - x, o.y - y) < 10)) continue;   // one pole is enough where approaches overlap
    // no pole inside another road's carriageway (short links between close junctions)
    if (lines.some((O, oi) => O !== L && O.line.p.some((pp, k) => k && (() => { const a = O.line.p[k - 1], dx = pp[0] - a[0], dy = pp[1] - a[1], L2 = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / L2)); return Math.hypot(x - a[0] - dx * t, y - a[1] - dy * t) < O.pro.edge + 1; })()))) continue;
    sigs.push({ x, y, c });
  }
  const poleMesh = new THREE.InstancedMesh(sigPole, new THREE.MeshStandardMaterial({ color: 0x2a2b2d, roughness: .6 }), Math.max(1, sigs.length));
  const lampMesh = new THREE.InstancedMesh(sigGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), Math.max(1, sigs.length));
  { const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
    sigs.forEach((g, i) => { poleMesh.setMatrixAt(i, m4.compose(new THREE.Vector3(g.x * S, g.y * S, .16), q, new THREE.Vector3(S, S, 6 * S * 1.5)));
      lampMesh.setMatrixAt(i, m4.compose(new THREE.Vector3(g.x * S, g.y * S, .16 + 6 * S * 1.5), q, new THREE.Vector3(S, S, S * 1.5))); });
    poleMesh.count = lampMesh.count = sigs.length; }
  group.add(poleMesh, lampMesh);

  // ---------- traffic ----------
  function carGeo() {
    const parts = [], col = [];
    const box = (w, d, h, x, z, c) => { const g = new THREE.BoxGeometry(w, d, h).translate(x, 0, z); const n = g.attributes.position.count; for (let i = 0; i < n; i++) col.push(...c); parts.push(g); };
    box(4.4, 1.8, .8, 0, .55, [1, 1, 1]);                     // body
    box(2.3, 1.62, .62, -.25, 1.24, [.13, .15, .17]);          // glass cabin
    box(.08, 1.4, .18, 2.2, .7, [1.6, 1.5, 1.25]);             // headlights
    box(.08, 1.4, .16, -2.2, .78, [.9, .08, .06]);             // tail lights
    box(4.0, 1.7, .3, 0, .2, [.08, .08, .08]);                 // wheels / underside
    const pos = [], idx = []; let b = 0;
    for (const g of parts) { const P = g.attributes.position, I = g.index; for (let i = 0; i < P.count; i++) pos.push(P.getX(i), P.getY(i), P.getZ(i)); for (let i = 0; i < I.count; i++) idx.push(I.getX(i) + b); b += P.count; g.dispose(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
  }
  function busGeo() {
    const g = new THREE.BoxGeometry(12, 2.5, 2.9).translate(0, 0, 1.75), n = g.attributes.position.count, col = [];
    for (let i = 0; i < n; i++) col.push(1, 1, 1);
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); return g;
  }
  let seed = 1234567; const R = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const PAINT = [0xf2f2f0, 0xf2f2f0, 0xf2f2f0, 0xc9ccd0, 0xc9ccd0, 0x8a8e93, 0x1b1d20, 0x1b1d20, 0x2b3c5c, 0x8c2a2a, 0xd8cdb5, 0x4a5a48];
  const lanes = [], cars = [], buses = [], dens = MOB ? .45 : 1;
  lines.forEach((L, li) => {
    const { line, pro } = L, T = line.total; if (T < 60) return;
    for (const off0 of pro.lanes) for (const dir of [1, -1]) {
      // stop lines in this lane's travel coordinate d (d grows in the direction of travel)
      // junction boxes in this lane's travel coordinate d (d grows in the direction of travel), overlapping boxes merged
      const boxes = L.cuts.map(c => { const a = dir > 0 ? c.s - c.hw : T - (c.s + c.hw), b = dir > 0 ? c.s + c.hw : T - (c.s - c.hw); return { a, b, c }; }).sort((x, y) => x.a - y.a);
      const mb = []; for (const bx of boxes) { const m = mb[mb.length - 1]; if (m && bx.a <= m.b + 12) m.b = Math.max(m.b, bx.b); else mb.push({ ...bx }); }
      let hideA = 0, hideB = T;
      for (const m of mb) { if (m.a < 6) hideA = Math.max(hideA, m.b + 4); if (m.b > T - 6) hideB = Math.min(hideB, m.a - 4); }
      const stops = mb.filter(m => m.a > 6 && m.b < T - 6).map(m => ({ d: m.a - 1, hw: (m.b - m.a) / 2, c: m.c }));
      const lane = { li, o: off0 * dir, dir, T, v0: pro.v * (.9 + R() * .2) * (off0 === -33.5 ? .7 : 1), stops, hideA, hideB, cars: [] };
      const n = Math.max(1, Math.floor(T / pro.spacing * dens * (.75 + R() * .5))), step = T / n;
      for (let k = 0; k < n; k++) {
        const bus = pro === PRO[100] && off0 !== -12.3 && R() < .06, car = { d: k * step + R() * step * .4, v: lane.v0, len: bus ? 12 : 4.6, c: bus ? 0xe8ebee : PAINT[(R() * PAINT.length) | 0], bus };
        car.idx = bus ? buses.length : cars.length; (bus ? buses : cars).push(car); lane.cars.push(car);
      }
      lanes.push(lane);
    }
  });
  const carMat = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: .35, metalness: .35 });
  const mkInst = (g, list) => { const m = new THREE.InstancedMesh(g, carMat, Math.max(1, list.length)); m.count = list.length; m.frustumCulled = false; m.castShadow = false; m.receiveShadow = true;
    const c = new THREE.Color(); list.forEach((it, i) => m.setColorAt(i, c.setHex(it.c))); if (m.instanceColor) m.instanceColor.needsUpdate = true; group.add(m); return m; };
  const carMesh = mkInst(carGeo(), cars), busMesh = mkInst(busGeo(), buses);

  // signals: every road at an intersection gets a 16 s slot: green 10 s, amber 2 s, then 4 s all red so even a 100 m wide
  // junction clears before the next road moves. Cars stop on amber when they can.
  const slotPh = (c, t) => { const C = c.nd.roads.length * 16, ph = ((t + c.nd.off) % C + C) % C; return ph - c.slot * 16; };
  const green = (c, t) => { const p = slotPh(c, t); return p >= 0 && p < 10; };
  const amber = (c, t) => { const p = slotPh(c, t); return p >= 10 && p < 12; };
  const RED = new THREE.Color(0xff3b2f), GRN = new THREE.Color(0x3cff7a), AMB = new THREE.Color(0xffb02e);

  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), Z = new THREE.Vector3(0, 0, 1), pv = new THREE.Vector3(), sc = new THREE.Vector3();
  let last = null, time = 0, sigTick = -1;
  function update(t) {
    const dt = last === null ? 0 : Math.min(.1, Math.max(0, t - last)); last = t; time = t;
    for (const lane of lanes) {
      const n = lane.cars.length, line = lines[lane.li].line, T = lane.T;
      for (let i = 0; i < n; i++) {
        const car = lane.cars[i], lead = lane.cars[(i + 1) % n];
        let gap = n > 1 ? ((lead.d - car.d) % T + T) % T - (lead.len + car.len) / 2 : 1e9;
        // the next stop line ahead: stop for red unless already too close to stop
        for (const st of lane.stops) { const ds = st.d - car.d - car.len / 2; if (ds < -1) continue; if (ds > 70) break;
          const canStop = ds > car.v * car.v / 16 - .5;
          // red, or green with the queue beyond the junction not yet moving (don't block the box)
          const blocked = n > 1 && lead.v < 2 && ((lead.d - st.d) % T + T) % T < 2 * st.hw + 4 + car.len + lead.len / 2;
          if (canStop && (!green(st.c, t) || blocked)) gap = Math.min(gap, ds);
          break; }
        const target = lane.v0 * Math.max(0, Math.min(1, (gap - 3) / 22));
        car.v += Math.max(-9 * dt, Math.min(2.8 * dt, target - car.v)); if (gap < .5) car.v = 0; if (car.v < 0) car.v = 0;
        car.d += car.v * dt; if (car.d >= T) car.d -= T;
        const s = lane.dir > 0 ? car.d : T - car.d, p = at(line, s), fade = Math.max(0, Math.min(1, (car.d - lane.hideA) / 10, (lane.hideB - car.d) / 10));
        pv.set((p.x + p.nx * lane.o) * S, (p.y + p.ny * lane.o) * S, .17); q.setFromAxisAngle(Z, p.ang + (lane.dir < 0 ? Math.PI : 0));
        sc.set(S * fade, S * fade, S * 1.5 * fade); (car.bus ? busMesh : carMesh).setMatrixAt(car.idx, m4.compose(pv, q, sc));
      }
    }
    carMesh.instanceMatrix.needsUpdate = true; busMesh.instanceMatrix.needsUpdate = true;
    const tick = Math.floor(t * 2); if (tick !== sigTick) { sigTick = tick;            // lamps twice a second is enough
      sigs.forEach((g, i) => lampMesh.setColorAt(i, green(g.c, t) ? GRN : amber(g.c, t) ? AMB : RED)); if (lampMesh.instanceColor) lampMesh.instanceColor.needsUpdate = true; }
  }
  update(0);
  return { group, update, junctions, lanes, stats: { cars: cars.length, buses: buses.length, roads: lines.length, junctions: junctions.length, intersections: junctions.nodes.length, signals: sigs.length } };
}
