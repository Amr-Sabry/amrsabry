// Nevera: the race circuit in the Performance Zone, built in 3D instead of the slide image.
// A closed spline laid out in the parcel's own frame, inspired by the developed master plan slide (long main straight
// beside the pits on the west, a hairpin at the north, a long back straight along the desert edge, twisty esses in the
// south). Track 14 m wide with white edge lines, red-white kerbs on the corners, run-off, pit lane and pit building,
// paddock, grandstands with canopies, a control tower and a start gantry. Instead of cars, kinetic light lines run the
// lap (film note: speed, precision, light lines; no cars, no names).
// buildCircuit(THREE, data, {S, VEX, z}) works in the map's shape space (x east, y north, z up) and returns
// {group, update(t), stats, centre}.

export function buildCircuit(THREE, data, opt = {}) {
  const S = opt.S ?? 0.1, VEX = opt.VEX ?? 2, Z0 = opt.z ?? .32;
  const group = new THREE.Group(); group.name = 'circuit';
  const zone = (data.zones || []).find(z => z.cat === 'pz'); if (!zone) return { group, update() {}, stats: {} };
  const ring = zone.polys[0][0];
  const inRing = (x, y) => { let c = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const a = ring[i], b = ring[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
  const dEdge = (x, y) => { let d = 1e9; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const a = ring[j], b = ring[i], dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / L2)); d = Math.min(d, Math.hypot(x - a[0] - dx * t, y - a[1] - dy * t)); } return d; };

  // parcel frame: u along the longest edge, v across
  let best = 0, ang = 0; for (let i = 0; i < ring.length; i++) { const a = ring[i], b = ring[(i + 1) % ring.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L > best) { best = L; ang = Math.atan2(b[1] - a[1], b[0] - a[0]); } }
  const ca = Math.cos(ang), sa = Math.sin(ang); let cx = 0, cy = 0; ring.forEach(p => { cx += p[0]; cy += p[1]; }); cx /= ring.length; cy /= ring.length;
  let u0 = 1e9, u1 = -1e9, v0 = 1e9, v1 = -1e9;
  for (const p of ring) { const u = (p[0] - cx) * ca + (p[1] - cy) * sa, v = -(p[0] - cx) * sa + (p[1] - cy) * ca; u0 = Math.min(u0, u); u1 = Math.max(u1, u); v0 = Math.min(v0, v); v1 = Math.max(v1, v); }
  const W = (u, v) => [cx + u * ca - v * sa, cy + u * sa + v * ca];

  // layout in normalised parcel coordinates, fitted to the parcel's shape: a runs along the long edge (u), b across it
  // between the parcel's own edges at that u (0 = the desert edge, 1 = the city edge). Main straight with the pits along
  // the city side (as in the slide), a hairpin complex at the far end, the back straight along the desert edge, sweepers
  // round the narrow end, and esses through the infield back to the start.
  const vRange = u => { const vs = []; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const A = ring[j], B = ring[i];
      const ua = (A[0] - cx) * ca + (A[1] - cy) * sa, ub = (B[0] - cx) * ca + (B[1] - cy) * sa; if ((ua > u) === (ub > u)) continue;
      const t = (u - ua) / (ub - ua), va = -(A[0] - cx) * sa + (A[1] - cy) * ca, vb = -(B[0] - cx) * sa + (B[1] - cy) * ca; vs.push(va + (vb - va) * t); }
    return vs.length >= 2 ? [Math.min(...vs), Math.max(...vs)] : null; };
  const CP = [[.36, .80], [.50, .81], [.62, .80], [.68, .76], [.70, .66], [.66, .58], [.70, .50], [.76, .56], [.82, .66], [.88, .70],
    [.95, .60], [.95, .42], [.90, .34], [.84, .24], [.74, .16], [.62, .14], [.56, .20], [.50, .14], [.36, .12], [.24, .12], [.14, .18],
    [.10, .30], [.16, .40], [.26, .36], [.36, .30], [.46, .34], [.52, .44], [.46, .54], [.36, .52], [.28, .58], [.22, .68], [.26, .78]];
  const MG = 75, ua0 = u0 + MG, ua1 = u1 - MG;
  const pts = CP.map(([a, b]) => { const u = ua0 + (ua1 - ua0) * a, r = vRange(u) || [v0, v1]; return W(u, r[0] + MG + (r[1] - r[0] - 2 * MG) * b); });
  const k = 1;
  const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p[0], p[1], 0)), true, 'centripetal');
  const LEN = curve.getLength(), N = Math.ceil(LEN / 4);
  const C = [], T = [], Nn = [], K = [];
  for (let i = 0; i <= N; i++) { const t = i / N, p = curve.getPointAt(t % 1), d = curve.getTangentAt(t % 1); C.push([p.x, p.y]); T.push([d.x, d.y]); Nn.push([-d.y, d.x]); }
  for (let i = 0; i <= N; i++) { const a = T[(i - 1 + N) % N], b = T[(i + 1) % N]; K.push((a[0] * b[1] - a[1] * b[0]) / 8); }   // signed curvature, 1/m

  // ---------- ribbons along the lap ----------
  const mats = {};
  const mat = (key, m) => (mats[key] ||= m);
  function ribbon(o0, o1, z, material, opts = {}) {             // o0/o1: offsets from the centreline (+ = left)
    const pos = [], uv = [], idx = []; let run = 0;
    const keep = opts.keep || (() => true);
    let open = false;
    for (let i = 0; i <= N; i++) {
      if (!keep(i)) { open = false; continue; }
      const [x, y] = C[i], [nx, ny] = Nn[i], oo0 = typeof o0 === 'function' ? o0(i) : o0, oo1 = typeof o1 === 'function' ? o1(i) : o1;
      const b = pos.length / 3; pos.push((x + nx * oo0) * S, (y + ny * oo0) * S, z, (x + nx * oo1) * S, (y + ny * oo1) * S, z); uv.push(i * 4 / (opts.uLen || 1), 0, i * 4 / (opts.uLen || 1), 1);
      if (open) idx.push(b - 2, b, b - 1, b - 1, b, b + 1); open = true;
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, material); m.receiveShadow = true; group.add(m); return m;
  }
  const off = (m, f) => { m.polygonOffset = true; m.polygonOffsetFactor = f; m.polygonOffsetUnits = f; return m; };
  const tex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const HW = 7.5;                                                   // half track width
  const corner = i => Math.abs(K[i]) > 1 / 260;
  // grass infield over the whole parcel
  { const sh = new THREE.Shape(ring.map(p => new THREE.Vector2(p[0] * S, p[1] * S))); const g = new THREE.ShapeGeometry(sh);
    const m = new THREE.Mesh(g, off(new THREE.MeshStandardMaterial({ color: 0x6f8a4a, roughness: 1 }), -1)); m.position.z = Z0 - .03; m.receiveShadow = true; group.add(m); }
  // run-off: wide on the outside of corners, narrow on straights
  const outer = i => Math.sign(K[i]) || 1;
  const ro = i => 16 + (corner(i) ? 34 * Math.min(1, Math.abs(K[i]) * 260 - 1 + .4) : 0);
  ribbon(i => outer(i) < 0 ? -(HW + ro(i)) : -(HW + 14), i => outer(i) > 0 ? HW + ro(i) : HW + 14, Z0 - .02, off(new THREE.MeshStandardMaterial({ color: 0xcdbb98, roughness: 1 }), -2));
  ribbon(-(HW + 3), HW + 3, Z0 - .012, off(new THREE.MeshStandardMaterial({ color: 0x8e8c88, roughness: .95 }), -3));       // paved shoulders
  ribbon(-HW, HW, Z0, off(new THREE.MeshStandardMaterial({ color: 0x2b2a29, roughness: .9 }), -4));                       // track
  const white = off(new THREE.MeshBasicMaterial({ color: 0xf2efe8 }), -5);
  for (const s of [-1, 1]) ribbon(s * (HW - .6), s * (HW - .2), Z0 + .002, white);                                         // edge lines
  // kerbs: red-white 2 m blocks on both sides through the corners
  const kerbTex = tex(32, 4, (g, w, h) => { g.fillStyle = '#c8202f'; g.fillRect(0, 0, w / 2, h); g.fillStyle = '#f4f1ea'; g.fillRect(w / 2, 0, w / 2, h); });
  const kerbMat = off(new THREE.MeshBasicMaterial({ map: kerbTex }), -5);
  for (const s of [-1, 1]) ribbon(s * HW, s * (HW + 1.6), Z0 + .003, kerbMat, { keep: corner, uLen: 4 });
  // start/finish line and grid boxes on the main straight
  const sf = Math.round(N * .06), gridI = []; for (let k2 = 1; k2 <= 10; k2++) gridI.push(sf - k2 * 2);
  { const chk = tex(64, 8, (g, w, h) => { for (let x = 0; x < 16; x++) for (let y = 0; y < 2; y++) { g.fillStyle = (x + y) % 2 ? '#111' : '#f4f1ea'; g.fillRect(x * 4, y * 4, 4, 4); } });
    const [x, y] = C[sf], a = Math.atan2(T[sf][1], T[sf][0]), m = new THREE.Mesh(new THREE.PlaneGeometry(2 * S, 2 * HW * S), off(new THREE.MeshBasicMaterial({ map: chk }), -6));
    m.position.set(x * S, y * S, Z0 + .004); m.rotation.z = a; group.add(m); }

  // ---------- buildings: pits, paddock, stands, tower, gantry ----------
  const box = (w, d, h) => new THREE.BoxGeometry(w, d, h).translate(0, 0, h / 2);
  const M = {
    white: new THREE.MeshStandardMaterial({ color: 0xf1eee8, roughness: .6 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x5f7684, roughness: .15, metalness: .5 }),
    steel: new THREE.MeshStandardMaterial({ color: 0x3a3d41, roughness: .5, metalness: .6 }),
    seat: new THREE.MeshStandardMaterial({ color: 0x9aa6ad, roughness: .8 }),
    canopy: new THREE.MeshStandardMaterial({ color: 0xf6f3ec, roughness: .5, side: THREE.DoubleSide }),
    pit: new THREE.MeshStandardMaterial({ color: 0x3a3937, roughness: .9 }),
    tent: new THREE.MeshStandardMaterial({ color: 0xe9e6df, roughness: .7 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xd9a944, roughness: .3, metalness: .7, emissive: 0x3a2604 }),
  };
  const place = (geo, material, i, side, dist, along = 0, cast = true) => {     // at lap index i, `dist` m to the side, `along` m forward
    const j = (i + Math.round(along / 4) + N) % N, [x, y] = C[j], [nx, ny] = Nn[j], a = Math.atan2(T[j][1], T[j][0]);
    const m = new THREE.Mesh(geo, material); m.position.set((x + nx * side * dist) * S, (y + ny * side * dist) * S, Z0); m.rotation.z = a; m.scale.set(S, S, S * VEX);
    m.castShadow = cast; m.receiveShadow = true; group.add(m); return m; };
  // the pits sit on the outside (west) of the main straight
  const mid = Math.round(N * .02), pitSide = Math.sign(Nn[mid][0] * (C[mid][0] - cx) + Nn[mid][1] * (C[mid][1] - cy)) || 1;   // pits on the city side, stands in the infield
  ribbon(pitSide > 0 ? HW + 14 : -(HW + 30), pitSide > 0 ? HW + 30 : -(HW + 14), Z0 + .001, off(new THREE.MeshStandardMaterial({ color: 0x3a3937, roughness: .9 }), -4), { keep: i => i < N * .045 || i > N * .985 });   // pit lane
  place(box(380, 26, 9), M.white, mid, pitSide, HW + 45);                                    // pit building
  place(box(381, 26.4, 3.2), M.glass, mid, pitSide, HW + 45).position.z += 5 * S * VEX;       // glazed upper band
  for (let g2 = -180; g2 <= 180; g2 += 15) place(box(1, 12, 6), M.steel, mid, pitSide, HW + 31.5, g2, false);   // garage doors line
  place(box(400, 40, .6), M.canopy, mid, pitSide, HW + 40).position.z += 9.2 * S * VEX;       // roof canopy
  // paddock behind the pits: hospitality units and team trucks
  for (let r = 0; r < 3; r++) for (let g2 = -170; g2 <= 170; g2 += 34) place(box(26, 12, r ? 4 : 7), r ? M.tent : M.white, mid, pitSide, HW + 80 + r * 20, g2);
  // control tower at the start line, start gantry over the track
  { const t = place(box(18, 18, 30), M.white, sf, pitSide, HW + 72); place(box(22, 22, 6), M.glass, sf, pitSide, HW + 72).position.z += 30 * S * VEX;
    place(new THREE.ConeGeometry(4, 6, 4).rotateY(Math.PI / 4).rotateX(Math.PI / 2).translate(0, 0, 3), M.gold, sf, pitSide, HW + 72).position.z += 36 * S * VEX; }
  for (const s of [-1, 1]) place(box(1.2, 1.2, 9), M.steel, sf, s, HW + 2);
  place(box(2, 2 * HW + 6, 2), M.steel, sf, 0, 0).position.z += 8 * S * VEX;
  // grandstands: stepped seating with a white canopy, facing the track
  function stand(i, side, len) {
    const g = new THREE.Group(), j = i, [x, y] = C[j], [nx, ny] = Nn[j], a = Math.atan2(T[j][1], T[j][0]);
    g.position.set((x + nx * side * (HW + 26)) * S, (y + ny * side * (HW + 26)) * S, Z0); g.rotation.z = a; g.scale.set(S, S, S * VEX); group.add(g);
    const rows = 10; for (let r = 0; r < rows; r++) { const m = new THREE.Mesh(box(len, 2.2, 1.2 + r * 1.1), M.seat); m.position.y = side * (r * 2.2); m.castShadow = true; m.receiveShadow = true; g.add(m); }
    const cnp = new THREE.Mesh(box(len + 4, 26, .5), M.canopy); cnp.position.set(0, side * 10, 15); cnp.castShadow = true; g.add(cnp);
    for (let p = -len / 2; p <= len / 2; p += 20) { const c2 = new THREE.Mesh(box(.8, .8, 15), M.steel); c2.position.set(p, side * 22, 0); g.add(c2); }
  }
  const standSide = -pitSide;
  stand(Math.round(N * .985) % N, standSide, 150); stand(Math.round(N * .04), standSide, 150);
  // stands at the slowest corners
  const corners = []; for (let i = 0; i < N; i++) if (Math.abs(K[i]) > 1 / 70 && Math.abs(K[i]) >= Math.abs(K[(i - 1 + N) % N]) && Math.abs(K[i]) >= Math.abs(K[(i + 1) % N])) corners.push(i);
  corners.filter((c, n, A) => !n || c - A[n - 1] > 40).slice(0, 5).forEach(i => stand(i, -outer(i), 90));

  // ---------- landscape: a tree belt along the parcel edge, parking lots with cars on free land ----------
  const dTrack = (x, y) => { let d = 1e9; for (let i = 0; i < N; i += 3) d = Math.min(d, Math.hypot(C[i][0] - x, C[i][1] - y)); return d; };
  { const trunk = new THREE.CylinderGeometry(.35, .5, 1, 5, 1, true).rotateX(Math.PI / 2).translate(0, 0, .5), crown = new THREE.IcosahedronGeometry(.5, 0).translate(0, 0, .5);
    const TP = [], PK = [];
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const A = ring[j], B = ring[i], L = Math.hypot(B[0] - A[0], B[1] - A[1]);
      for (let s2 = 0; s2 < L; s2 += 16) { const t = s2 / L, x = A[0] + (B[0] - A[0]) * t, y = A[1] + (B[1] - A[1]) * t, nx = -(B[1] - A[1]) / L, ny = (B[0] - A[0]) / L;
        for (const o of [18, 30]) { const px = x + nx * o, py = y + ny * o, qx = x - nx * o, qy = y - ny * o; const [X, Y] = inRing(px, py) ? [px, py] : [qx, qy]; if (inRing(X, Y) && dTrack(X, Y) > 40) TP.push([X + (Math.sin(s2) * 3), Y]); } } }
    // parking: 150 x 90 m lots on a grid, kept clear of the track
    const lots = [];
    for (let u = u0 + 160; u < u1 - 160; u += 175) { const r = vRange(u); if (!r) continue; for (let v = r[0] + 120; v < r[1] - 120; v += 115) { const [x, y] = W(u, v);
      if (dTrack(x, y) > 110 && dEdge(x, y) > 90 && lots.length < 4 && Math.hypot(x - C[mid][0], y - C[mid][1]) < 700) lots.push([x, y]); } }
    const lotMat = off(new THREE.MeshStandardMaterial({ color: 0x55534f, roughness: .95 }), -2);
    for (const [x, y] of lots) { const m = new THREE.Mesh(new THREE.PlaneGeometry(150 * S, 90 * S), lotMat); m.position.set(x * S, y * S, Z0 - .01); m.rotation.z = ang; m.receiveShadow = true; group.add(m);
      for (let r2 = -3; r2 <= 3; r2++) for (let c2 = -26; c2 <= 26; c2++) { if (r2 === 0 || Math.sin(c2 * 12.9 + r2 * 7.1 + x) > .55) continue; const uu = c2 * 2.7, vv = r2 * 12;
        PK.push([x + uu * ca - vv * sa, y + uu * sa + vv * ca]); } }
    const inst = (geo, material, list, f) => { const im = new THREE.InstancedMesh(geo, material, Math.max(1, list.length)); list.forEach((p, i) => im.setMatrixAt(i, f(p, i))); im.count = list.length; im.castShadow = true; im.receiveShadow = true; im.computeBoundingSphere(); group.add(im); return im; };
    const q2 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), ang + Math.PI / 2), q0 = new THREE.Quaternion(), mm = new THREE.Matrix4();
    inst(trunk, new THREE.MeshStandardMaterial({ color: 0x6b5640, roughness: 1 }), TP, ([x, y]) => mm.compose(new THREE.Vector3(x * S, y * S, Z0 - .02), q0, new THREE.Vector3(S, S, 4 * S * VEX)));
    inst(crown, new THREE.MeshStandardMaterial({ color: 0x5f7f3f, roughness: 1, flatShading: true }), TP, ([x, y], i) => { const r3 = 6 + (i * 7 % 5); return mm.compose(new THREE.Vector3(x * S, y * S, Z0 + 3 * S * VEX), q0, new THREE.Vector3(r3 * S, r3 * S, r3 * .8 * S * VEX)); });
    const carCols = [0xf2f2f0, 0xc9ccd0, 0x1b1d20, 0x8a8e93, 0x2b3c5c, 0x8c2a2a], cm = inst(new THREE.BoxGeometry(1, 1, 1).translate(0, 0, .5), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .4, metalness: .3 }), PK,
      ([x, y]) => mm.compose(new THREE.Vector3(x * S, y * S, Z0 - .005), q2, new THREE.Vector3(4.4 * S, 1.8 * S, 1.4 * S * VEX)));
    const ccl = new THREE.Color(); PK.forEach((p, i) => cm.setColorAt(i, ccl.setHex(carCols[i * 7 % 6]))); if (cm.instanceColor) cm.instanceColor.needsUpdate = true;
  }

  // ---------- kinetic light lines running the lap ----------
  const LINES = 7, SEGS = 26, glow = [0x7fe8ff, 0xffd27a, 0xffffff, 0x7fe8ff, 0xffb347, 0xc9f7ff, 0xffd27a];
  const lg = new THREE.BoxGeometry(1, 1, 1);
  const lm = new THREE.InstancedMesh(lg, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .9, toneMapped: false, depthWrite: false }), LINES * SEGS);
  const lines = []; for (let l = 0; l < LINES; l++) lines.push({ s: l / LINES * LEN, v: 70 + (l % 3) * 8, lane: (l % 3 - 1) * 3.2, c: new THREE.Color(glow[l]) });
  { const cc = new THREE.Color(); lines.forEach((L, l) => { for (let k2 = 0; k2 < SEGS; k2++) lm.setColorAt(l * SEGS + k2, cc.copy(L.c).multiplyScalar(1 - k2 / SEGS * .85)); }); lm.instanceColor.needsUpdate = true; }
  lm.frustumCulled = false; group.add(lm);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), Zv = new THREE.Vector3(0, 0, 1), pv = new THREE.Vector3(), sv = new THREE.Vector3();
  let last = null;
  function update(t) {
    const dt = last === null ? 0 : Math.min(.1, Math.max(0, t - last)); last = t;
    lines.forEach((L, l) => { L.s = (L.s + L.v * dt) % LEN;
      for (let k2 = 0; k2 < SEGS; k2++) { const s = ((L.s - k2 * 7) % LEN + LEN) % LEN, i = Math.floor(s / LEN * N) % N, [x, y] = C[i], [nx, ny] = Nn[i];
        pv.set((x + nx * L.lane) * S, (y + ny * L.lane) * S, Z0 + .06); q.setFromAxisAngle(Zv, Math.atan2(T[i][1], T[i][0])); sv.set(9 * S, (2.6 - k2 / SEGS * 1.8) * S, .35 * S);
        lm.setMatrixAt(l * SEGS + k2, m4.compose(pv, q, sv)); } });
    lm.instanceMatrix.needsUpdate = true;
  }
  update(0);
  const [mx, my] = C[mid];
  return { group, update, stats: { lapKm: +(LEN / 1000).toFixed(2), scale: +k.toFixed(2), corners: corners.length }, centre: [cx, cy], pits: [mx, my] };
}
