// Nevera: streets and traffic. Every DWG road centreline gets a cross-section by its right-of-way width
// (asphalt carriageways, green median, lane markings) and cars that drive on the right, looping along the road.
// buildStreets(THREE, data, {S, mobile}) works in the map's shape space (x east, y north, z up) and returns
// {group, update(t), stats}.

export function buildStreets(THREE, data, opt = {}) {
  const S = opt.S ?? 0.1, MOB = !!opt.mobile, roads = (data.roads || []).filter(r => (r.p || []).length > 1);
  const group = new THREE.Group(); group.name = 'streets';

  // cross-sections (metres from the centreline, + = left of the drawing direction)
  const PRO = {
    100: { asphalt: [[10, 24], [-24, -10], [30, 37], [-37, -30]], median: [[-10, 10]], dash: [14.7, 19.3, -14.7, -19.3], lanes: [-12.3, -17, -21.7, -33.5], spacing: 34, v: [15, 20] },
    60: { asphalt: [[4, 15], [-15, -4]], median: [[-4, 4]], dash: [9.5, -9.5], lanes: [-6.7, -12.2], spacing: 42, v: [12, 16] },
    30: { asphalt: [[-7, 7]], median: [], dash: [0], lanes: [-3.5], spacing: 70, v: [9, 12] },
    20: { asphalt: [[-4.5, 4.5]], median: [], dash: [0], lanes: [-2.2], spacing: 110, v: [7, 9] },
  };
  const proOf = w => PRO[w] || (w >= 80 ? PRO[100] : w >= 45 ? PRO[60] : w >= 25 ? PRO[30] : PRO[20]);

  // polyline helpers (metres)
  function prepLine(p) {
    const L = [0]; for (let i = 1; i < p.length; i++) L.push(L[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]));
    const N = p.map((q, i) => { const a = p[Math.max(0, i - 1)], c = p[Math.min(p.length - 1, i + 1)]; const dx = c[0] - a[0], dy = c[1] - a[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; });
    return { p, L, N, total: L[L.length - 1] };
  }
  function strip(line, o0, o1, z, pos, uv, idx, uScale = 1) {
    const base = pos.length / 3;
    for (let i = 0; i < line.p.length; i++) {
      const [x, y] = line.p[i], [nx, ny] = line.N[i];
      pos.push((x + nx * o0) * S, (y + ny * o0) * S, z, (x + nx * o1) * S, (y + ny * o1) * S, z);
      uv.push(line.L[i] / uScale, 0, line.L[i] / uScale, 1);
      if (i) { const k = base + (i - 1) * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
    }
  }
  const lines = roads.map(r => ({ r, line: prepLine(r.p), pro: proOf(r.w || 20) }));

  // asphalt, medians and dashed lane lines: one merged mesh each
  const A = { pos: [], uv: [], idx: [] }, Md = { pos: [], uv: [], idx: [] }, D = { pos: [], uv: [], idx: [] };
  for (const { line, pro } of lines) {
    for (const [a, b] of pro.asphalt) strip(line, a, b, .16, A.pos, A.uv, A.idx);
    for (const [a, b] of pro.median) strip(line, a, b, .17, Md.pos, Md.uv, Md.idx);
    for (const o of pro.dash) strip(line, o - .18, o + .18, .165, D.pos, D.uv, D.idx, 7);   // 3.5 m dash, 3.5 m gap
  }
  const geo = G => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(G.pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(G.uv, 2)); g.setIndex(G.idx); g.computeVertexNormals(); return g; };
  const off = (m, f) => { m.polygonOffset = true; m.polygonOffsetFactor = f; m.polygonOffsetUnits = f; return m; };
  const asphalt = new THREE.Mesh(geo(A), off(new THREE.MeshStandardMaterial({ color: 0x34322f, roughness: .95 }), -1));
  const median = new THREE.Mesh(geo(Md), off(new THREE.MeshStandardMaterial({ color: 0x6f8a4a, roughness: 1 }), -1));
  const dc = document.createElement('canvas'); dc.width = 32; dc.height = 4; const g2 = dc.getContext('2d'); g2.fillStyle = '#fff'; g2.fillRect(0, 0, 16, 4);
  const dashTex = new THREE.CanvasTexture(dc); dashTex.wrapS = THREE.RepeatWrapping; dashTex.colorSpace = THREE.SRGBColorSpace;
  const dashes = new THREE.Mesh(geo(D), off(new THREE.MeshBasicMaterial({ color: 0xe9e3d6, map: dashTex, alphaTest: .5, transparent: false }), -2));
  asphalt.receiveShadow = median.receiveShadow = true;
  group.add(asphalt, median, dashes);

  // ---------- traffic ----------
  // one car = body + glass cabin + lamps, vertex coloured so the instance colour tints only the paint
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
    for (let i = 0; i < n; i++) { const z = g.attributes.position.getZ(i); col.push(...(z > 2.6 ? [1, 1, 1] : [1, 1, 1])); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); return g;
  }
  let seed = 1234567; const R = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const PAINT = [0xf2f2f0, 0xf2f2f0, 0xf2f2f0, 0xc9ccd0, 0xc9ccd0, 0x8a8e93, 0x1b1d20, 0x1b1d20, 0x2b3c5c, 0x8c2a2a, 0xd8cdb5, 0x4a5a48];
  const cars = [], buses = [];
  const dens = MOB ? .45 : 1;
  for (let ri = 0; ri < lines.length; ri++) {
    const { line, pro } = lines[ri]; if (line.total < 60) continue;
    for (const lane of pro.lanes) for (const dir of [1, -1]) {
      const n = Math.max(1, Math.floor(line.total / pro.spacing * dens * (.7 + R() * .6)));
      for (let k = 0; k < n; k++) {
        const bus = pro === PRO[100] && R() < .05;
        (bus ? buses : cars).push({ ri, o: lane * dir, dir, s: R() * line.total, v: pro.v[0] + R() * (pro.v[1] - pro.v[0]) * (bus ? .7 : 1), c: bus ? 0xe8ebee : PAINT[(R() * PAINT.length) | 0] });
      }
    }
  }
  const carMat = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: .35, metalness: .35 });
  const mkInst = (g, list) => { const m = new THREE.InstancedMesh(g, carMat, Math.max(1, list.length)); m.count = list.length; m.frustumCulled = false; m.castShadow = false; m.receiveShadow = true;
    const c = new THREE.Color(); list.forEach((it, i) => m.setColorAt(i, c.setHex(it.c))); if (m.instanceColor) m.instanceColor.needsUpdate = true; group.add(m); return m; };
  const carMesh = mkInst(carGeo(), cars), busMesh = mkInst(busGeo(), buses);

  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), Z = new THREE.Vector3(0, 0, 1), pv = new THREE.Vector3(), sc = new THREE.Vector3(S, S, S * 1.5);
  function place(mesh, list, dt) {
    for (let i = 0; i < list.length; i++) {
      const it = list[i], line = lines[it.ri].line, T = line.total;
      it.s += it.v * dt * it.dir; if (it.s > T) it.s -= T; else if (it.s < 0) it.s += T;
      const L = line.L; let lo = 0, hi = L.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (L[m] <= it.s) lo = m; else hi = m; }
      const a = line.p[lo], b = line.p[hi], t = (it.s - L[lo]) / Math.max(1e-6, L[hi] - L[lo]);
      const na = line.N[lo], nb = line.N[hi], nx = na[0] + (nb[0] - na[0]) * t, ny = na[1] + (nb[1] - na[1]) * t;
      const x = a[0] + (b[0] - a[0]) * t + nx * it.o, y = a[1] + (b[1] - a[1]) * t + ny * it.o;
      let ang = Math.atan2(b[1] - a[1], b[0] - a[0]); if (it.dir < 0) ang += Math.PI;
      pv.set(x * S, y * S, .17); q.setFromAxisAngle(Z, ang); mesh.setMatrixAt(i, m4.compose(pv, q, sc));
    }
    mesh.instanceMatrix.needsUpdate = true;
  }
  let last = null;
  function update(t) { const dt = last === null ? 0 : Math.min(.1, Math.max(0, t - last)); last = t; place(carMesh, cars, dt); place(busMesh, buses, dt); }
  update(0);
  return { group, update, stats: { cars: cars.length, buses: buses.length, roads: lines.length } };
}
