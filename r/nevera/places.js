// Nevera: places and life on the map, from the client's renders in the master-plan PDF.
// - gates: twin pylons with a bronze portal where every main road (60 m and 100 m) crosses the project boundary
// - heritage seating (UNESCO buffer, facing the pyramids): stepped stone bowl round a fire, tensile shade sails,
//   white tents with carpets, a sail-covered walkway from the city edge, lanterns, desert planting
// - plaza decor: shade sails, a golden cone, fountains and benches around the district-core glass pyramids
// - people: sitters in the seating areas, walkers on the plazas, the walkway and the boulevard pavements
// buildPlaces(THREE, data, {S, VEX, ground(xm, ym) -> scene z, plazas: [{x, y, a, b}], mobile}) -> {group, update(t), stats}

export function buildPlaces(THREE, data, opt = {}) {
  const S = opt.S ?? 0.1, VEX = opt.VEX ?? 2, MOB = !!opt.mobile, ground = opt.ground || (() => 0.25);
  const group = new THREE.Group(); group.name = 'places';
  let seed = 424242; const R = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const pick = a => a[(R() * a.length) | 0];

  /* ---------- materials ---------- */
  const M = {
    stone: new THREE.MeshStandardMaterial({ color: 0xd8c3a0, roughness: .9 }),
    stoneDark: new THREE.MeshStandardMaterial({ color: 0xb79d77, roughness: .95 }),
    pylon: new THREE.MeshStandardMaterial({ color: 0xe1cba6, roughness: .8 }),
    bronze: new THREE.MeshStandardMaterial({ color: 0x8a6a3e, roughness: .35, metalness: .7, emissive: 0x2a1a08 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xf0c25a, roughness: .3, metalness: .6, emissive: 0x6a4410 }),
    sail: new THREE.MeshStandardMaterial({ color: 0xf6f1e7, roughness: .85, side: THREE.DoubleSide, emissive: 0x1d1810 }),
    pole: new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: .7 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x9a7048, roughness: .85 }),
    carpet: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 }),
    pave: new THREE.MeshStandardMaterial({ color: 0xe6d8bf, roughness: .95 }),
    water: new THREE.MeshStandardMaterial({ color: 0x3f93ad, roughness: .15, metalness: .1, emissive: 0x0c2c35 }),
    jet: new THREE.MeshBasicMaterial({ color: 0xeaf6fb, transparent: true, opacity: .75 }),
    fire: new THREE.MeshBasicMaterial({ color: 0xffa24a }),
    lamp: new THREE.MeshBasicMaterial({ color: 0xffd79a }),
    shrub: new THREE.MeshStandardMaterial({ color: 0x6b7a45, roughness: 1, flatShading: true }),
  };
  // a holder in metres (z exaggerated like the buildings) at a ground point
  const holder = (x, y, a = 0) => { const h = new THREE.Group(); h.position.set(x * S, y * S, ground(x, y)); h.rotation.z = a; const i = new THREE.Group(); i.scale.set(S, S, S * VEX); h.add(i); group.add(h); return i; };
  const mesh = (g, m, parent, x = 0, y = 0, z = 0, cast = true) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = cast; o.receiveShadow = true; parent.add(o); return o; };
  const box = (w, d, h) => new THREE.BoxGeometry(w, d, h).translate(0, 0, h / 2);
  const cyl = (r1, r2, h, n = 12) => new THREE.CylinderGeometry(r2, r1, h, n).rotateX(Math.PI / 2).translate(0, 0, h / 2);
  function frustum(w, d, h, k) {                              // tapered pylon: top is k times the base
    const g = box(w, d, h), P = g.attributes.position;
    for (let i = 0; i < P.count; i++) if (P.getZ(i) > h / 2) { P.setX(i, P.getX(i) * k); P.setY(i, P.getY(i) * k); }
    g.computeVertexNormals(); return g;
  }
  function sails(tris, parent) {                              // tensile sails: one merged mesh of triangles, slightly sagging
    const pos = [];
    for (const [a, b, c] of tris) {
      const m = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3 - .6];
      pos.push(...a, ...b, ...m, ...b, ...c, ...m, ...c, ...a, ...m);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
    return mesh(g, M.sail, parent);
  }
  function poles(pts, parent, r = .18) { for (const p of pts) mesh(cyl(r, r * .8, p[2], 6), M.pole, parent, p[0], p[1], 0); }

  /* ---------- people ---------- */
  const people = [];   // {x, y, z, a, walk: {x0, y0, x1, y1, v, t} | null, c}
  const CLOTH = [0xf4f1ea, 0xe9e1d2, 0x2a2b2e, 0x1f2a44, 0xb5623f, 0x6b6f4c, 0xd8c39d, 0x8c2a2a, 0x3d5a78, 0xc9b28e];
  const sitter = (x, y, z) => people.push({ x, y, z, a: R() * 6.28, sit: true, walk: null, c: pick(CLOTH) });
  const walker = (x0, y0, x1, y1, z) => people.push({ x: x0, y: y0, z, a: 0, walk: { x0, y0, x1, y1, v: 1.1 + R() * .5, t: R() }, c: pick(CLOTH) });

  /* ---------- gates on the main roads at the project boundary ---------- */
  const gates = [];
  const segX = (p1, p2, p3, p4) => { const d = (p2[0] - p1[0]) * (p4[1] - p3[1]) - (p2[1] - p1[1]) * (p4[0] - p3[0]); if (Math.abs(d) < 1e-9) return null;
    const t = ((p3[0] - p1[0]) * (p4[1] - p3[1]) - (p3[1] - p1[1]) * (p4[0] - p3[0])) / d, u = ((p3[0] - p1[0]) * (p2[1] - p1[1]) - (p3[1] - p1[1]) * (p2[0] - p1[0])) / d;
    return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? [p1[0] + (p2[0] - p1[0]) * t, p1[1] + (p2[1] - p1[1]) * t] : null; };
  for (const r of data.roads || []) {
    if (!(r.w >= 60)) continue;
    for (let i = 1; i < r.p.length; i++) for (const ring of data.boundary || []) for (let j = 0; j < ring.length; j++) {
      const X = segX(r.p[i - 1], r.p[i], ring[j], ring[(j + 1) % ring.length]); if (!X) continue;
      if (gates.some(g => Math.hypot(g.x - X[0], g.y - X[1]) < 400)) continue;
      gates.push({ x: X[0], y: X[1], a: Math.atan2(r.p[i][1] - r.p[i - 1][1], r.p[i][0] - r.p[i - 1][0]), w: r.w });
    }
  }
  for (const G of gates) {
    const P = holder(G.x, G.y, G.a), half = G.w / 2 + 9;
    for (const s of [-1, 1]) {
      mesh(frustum(9, 16, 24, .78), M.pylon, P, 0, s * half, 0);
      mesh(box(9.6, 16.6, .8), M.bronze, P, 0, s * half, 24).scale.set(.78, .78, 1);
      mesh(new THREE.ConeGeometry(2.2, 4, 4).rotateY(Math.PI / 4).rotateX(Math.PI / 2).translate(0, 0, 2), M.gold, P, 0, s * half, 24.8);
      mesh(box(1.2, 10, 14), M.bronze, P, 4.7, s * half, 4);                  // recessed bronze panel on the face
      for (const k of [-1, 1]) mesh(cyl(.25, .2, 9, 6), M.pole, P, k * 9, s * (half + 6), 0, false);
    }
    mesh(box(4, 2 * half - 8, 2.4), M.bronze, P, 0, 0, 19);                 // portal beam over the road
    mesh(box(4.2, 2 * half - 8, .35), M.gold, P, 0, 0, 21.4, false);
    for (const s of [-1, 1]) mesh(box(40, 3, .15), M.water, P, s * 26, 0, 0, false);
  }

  /* ---------- heritage seating (UNESCO buffer) ---------- */
  const wh = (data.zones || []).find(z => z.cat === 'wh');
  let heritage = null;
  if (wh) {
    const ring = wh.polys[0][0]; let x0 = 1e9, x1 = -1e9, y0 = 1e9; for (const p of ring) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); }
    // the band's southern edge runs along the city; sit 260 m in from it, at the band's middle
    const cx = 200, cy = 2700 + 260;
    heritage = { x: cx, y: cy };
    const H = holder(cx, cy, 0);
    // stepped stone bowl round a fire
    const prof = [[0, -.1], [5, -.1], [5, .35], [8.5, .35], [8.5, .75], [12, .75], [12, 1.15], [15.5, 1.15], [15.5, 1.55], [19, 1.55], [21, .2], [22, 0]].map(([r, z]) => new THREE.Vector2(r, z));
    const bowl = new THREE.LatheGeometry(prof, 48); bowl.rotateX(Math.PI / 2); mesh(bowl, M.stone, H);
    mesh(cyl(2.4, 2.2, .6, 16), M.stoneDark, H, 0, 0, -.1);
    const flame = mesh(new THREE.ConeGeometry(1.3, 2.6, 7).rotateX(Math.PI / 2).translate(0, 0, 1.3), M.fire, H, 0, 0, .4, false);
    // cushions on the steps and people sitting there
    for (const [r, z] of [[6.8, .35], [10.3, .75], [13.8, 1.15], [17.3, 1.55]]) {
      const n = Math.round(r * 2.2);
      for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + R() * .1; if (R() < .25) continue;
        const cu = mesh(box(1.6, .8, .25), M.carpet, H, Math.cos(a) * r, Math.sin(a) * r, z, false); cu.rotation.z = a; cu.material = M.carpet.clone(); cu.material.color.setHex(pick([0xb5623f, 0xd9b48a, 0x8c2a2a, 0xe8dcc4]));
        if (R() < .7) sitter(cx + Math.cos(a) * r, cy + Math.sin(a) * r, ground(cx, cy) + z * VEX * S); }
    }
    // shade sails round the bowl
    const tris = [], polePts = [];
    for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2, b = a + Math.PI / 3, rr = 26, h1 = 7 + (k % 2) * 3, h2 = 10 - (k % 2) * 3;
      const p1 = [Math.cos(a) * rr, Math.sin(a) * rr, h1], p2 = [Math.cos(b) * rr, Math.sin(b) * rr, h2], p3 = [Math.cos((a + b) / 2) * 15, Math.sin((a + b) / 2) * 15, 4.5];
      tris.push([p1, p2, p3]); polePts.push(p1, p2); }
    sails(tris, H); poles(polePts, H);
    // tents with carpets and low seating, in an arc on the pyramids side (north-east)
    for (let k = 0; k < 5; k++) {
      const a = .35 + k * .32, rr = 52 + (k % 2) * 8, tx = Math.cos(a) * rr, ty = Math.sin(a) * rr;
      const deck = mesh(box(14, 12, .35), M.wood, H, tx, ty, 0, false); deck.rotation.z = a;
      const cp = mesh(box(11, 9, .05), M.carpet.clone(), H, tx, ty, .35, false); cp.rotation.z = a; cp.material.color.setHex(pick([0x9c3b2c, 0xb5623f, 0x7a2f2a]));
      const t3 = [], pp = [];
      const c4 = [[-7, -6, 3.2], [7, -6, 4.6], [7, 6, 3.2], [-7, 6, 4.6]].map(([u, v, z]) => [tx + u * Math.cos(a) - v * Math.sin(a), ty + u * Math.sin(a) + v * Math.cos(a), z]);
      const top = [tx, ty, 6.2]; for (let i = 0; i < 4; i++) t3.push([c4[i], c4[(i + 1) % 4], top]); pp.push(...c4);
      sails(t3, H); poles(pp, H, .15);
      for (let i = 0; i < 7; i++) sitter(cx + tx + (R() - .5) * 9, cy + ty + (R() - .5) * 7, ground(cx, cy) + .4 * VEX * S);
    }
    // the sail-covered walkway from the city edge to the bowl
    const wl = 230, wx = 0, wy0 = -wl - 22;
    mesh(box(6, wl, .12), M.pave, H, wx, wy0 + wl / 2, 0, false);
    const wt = [], wp = [];
    for (let s = 0; s < wl; s += 14) for (const side of [-1, 1]) {
      const y1 = wy0 + s, y2 = y1 + 14, xo = side * 3.6;
      wp.push([xo, y1, 5.5 + (s / 14 % 2) * .8]);
      wt.push([[xo, y1, 5.5], [xo, y2, 6.3], [xo * .1, y1 + 7, 3.8]]);
      mesh(box(.35, .35, .5), M.lamp, H, side * 3.2, y1 + 7, .12, false);
    }
    sails(wt, H); poles(wp, H, .14);
    for (let i = 0; i < 26; i++) { const y1 = wy0 + R() * wl; walker(cx + (R() - .5) * 3, cy + y1, cx + (R() - .5) * 3, cy + (R() < .5 ? wy0 : wy0 + wl), ground(cx, cy) + .12 * VEX * S); }
    // lanterns and desert planting around
    for (let k = 0; k < 40; k++) { const a = R() * 6.28, rr = 30 + R() * 70; mesh(new THREE.IcosahedronGeometry(1.2 + R() * 1.4, 0).translate(0, 0, .8), M.shrub, H, Math.cos(a) * rr, Math.sin(a) * rr, 0, false); }
    for (let k = 0; k < 24; k++) { const a = k / 24 * 6.28; mesh(box(.4, .4, .6), M.lamp, H, Math.cos(a) * 24, Math.sin(a) * 24, 0, false); }
    // a low stone viewing terrace towards the pyramids
    const tr = mesh(box(46, 10, 1.1), M.stoneDark, H, 86, 52, 0); tr.rotation.z = .55;
    heritage.flame = flame;
  }

  /* ---------- plaza decor round the glass pyramids ---------- */
  for (const pl of opt.plazas || []) {
    const P = holder(pl.x, pl.y, pl.a), b = pl.b;
    mesh(new THREE.ConeGeometry(3.2, 26, 24).rotateX(Math.PI / 2).translate(0, 0, 13), M.gold, P, b * .95, -b * .7, 0);   // golden cone
    // shade sails over the plaza edge
    const tris = [], pp = [];
    for (let k = 0; k < 4; k++) { const ox = -b * 1.05 + k * 12, oy = b * .95;
      const p1 = [ox - 6, oy - 5, 6], p2 = [ox + 6, oy - 4, 8.5], p3 = [ox, oy + 6, 5]; tris.push([p1, p2, p3]); pp.push(p1, p2, p3); }
    sails(tris, P); poles(pp, P, .14);
    // fountains: a water strip with jets
    mesh(box(b * 1.6, 5, .1), M.water, P, 0, -b * 1.05, 0, false);
    for (let k = -3; k <= 3; k++) mesh(cyl(.25, .05, 3.5, 5), M.jet, P, k * b * .2, -b * 1.05, .1, false);
    // benches + people
    for (let k = 0; k < 8; k++) mesh(box(3, .9, .5), M.wood, P, -b + k * b * .28, b * .55, 0, false);
    for (let i = 0; i < 26; i++) { const a = R() * 6.28, r0 = b * (.8 + R() * .3), a2 = a + (R() - .5) * 1.5;
      const [sx, sy] = [Math.cos(a) * r0, Math.sin(a) * r0], [ex, ey] = [Math.cos(a2) * r0 * 1.1, Math.sin(a2) * r0 * 1.1];
      const ca = Math.cos(pl.a), sa = Math.sin(pl.a), W = (u, v) => [pl.x + u * ca - v * sa, pl.y + u * sa + v * ca];
      const [x0, y0] = W(sx, sy), [x1, y1] = W(ex, ey); walker(x0, y0, x1, y1, ground(pl.x, pl.y) + .03); }
    for (let i = 0; i < 10; i++) { const ca = Math.cos(pl.a), sa = Math.sin(pl.a), u = -b + i * b * .22, v = b * .55; sitter(pl.x + u * ca - v * sa, pl.y + u * sa + v * ca, ground(pl.x, pl.y) + .5 * VEX * S); }
  }

  /* ---------- walkers on the boulevard pavements ---------- */
  for (const r of data.roads || []) {
    if (!(r.w >= 60) || (MOB && r.w < 100)) continue;
    const p = r.p, o = r.w / 2 - 2.5;
    for (let i = 1; i < p.length; i++) { const a = p[i - 1], b = p[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 20) continue;
      const nx = -(b[1] - a[1]) / L, ny = (b[0] - a[0]) / L;
      for (let s = R() * 60; s < L; s += 55) for (const side of [-1, 1]) { if (R() < .35) continue;
        const t = s / L, x = a[0] + (b[0] - a[0]) * t + nx * o * side, y = a[1] + (b[1] - a[1]) * t + ny * o * side, len = 20 + R() * 30, dx = (b[0] - a[0]) / L * len, dy = (b[1] - a[1]) / L * len;
        walker(x, y, x + dx, y + dy, .16); } }
  }

  /* ---------- people mesh (instanced, walkers updated each frame) ---------- */
  const pg = (() => { const body = new THREE.CylinderGeometry(.2, .26, 1.3, 6).rotateX(Math.PI / 2).translate(0, 0, .65), head = new THREE.SphereGeometry(.15, 6, 4).translate(0, 0, 1.52);
    const col = [], pos = [], idx = []; let b = 0;
    for (const [g, c] of [[body, [1, 1, 1]], [head, [.62, .47, .36]]]) { const P = g.attributes.position, I = g.index; for (let i = 0; i < P.count; i++) { pos.push(P.getX(i), P.getY(i), P.getZ(i)); col.push(...c); } for (let i = 0; i < I.count; i++) idx.push(I.getX(i) + b); b += P.count; g.dispose(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals(); return g; })();
  const pm = new THREE.InstancedMesh(pg, new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: .8 }), Math.max(1, people.length));
  pm.count = people.length; pm.frustumCulled = false;
  { const c = new THREE.Color(); people.forEach((p, i) => pm.setColorAt(i, c.setHex(p.c))); if (pm.instanceColor) pm.instanceColor.needsUpdate = true; }
  group.add(pm);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), Zx = new THREE.Vector3(0, 0, 1), pv = new THREE.Vector3(), scW = new THREE.Vector3(S * 1.2, S * 1.2, S * 1.5), scS = new THREE.Vector3(S * 1.2, S * 1.2, S * .9);
  let last = null;
  function update(t) {
    const dt = last === null ? 0 : Math.min(.1, Math.max(0, t - last)); last = t;
    for (let i = 0; i < people.length; i++) {
      const p = people[i], w = p.walk; let x = p.x, y = p.y, a = p.a;
      if (w) { const L = Math.hypot(w.x1 - w.x0, w.y1 - w.y0) || 1; w.t = (w.t + w.v * dt / L) % 2; const f = w.t < 1 ? w.t : 2 - w.t;
        x = w.x0 + (w.x1 - w.x0) * f; y = w.y0 + (w.y1 - w.y0) * f; a = Math.atan2(w.y1 - w.y0, w.x1 - w.x0) + (w.t < 1 ? 0 : Math.PI); }
      pv.set(x * S, y * S, p.z); q.setFromAxisAngle(Zx, a); pm.setMatrixAt(i, m4.compose(pv, q, p.sit ? scS : scW));
    }
    pm.instanceMatrix.needsUpdate = true;
    if (heritage && heritage.flame) { heritage.flame.scale.set(1 + .08 * Math.sin(t * 9), 1 + .08 * Math.cos(t * 7), 1 + .15 * Math.sin(t * 11)); }
  }
  update(0);
  return { group, update, heritage, gates, stats: { gates: gates.length, people: people.length, plazas: (opt.plazas || []).length } };
}
