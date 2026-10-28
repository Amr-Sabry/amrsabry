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
    white: new THREE.MeshStandardMaterial({ color: 0xf3f1ec, roughness: .7 }),
    glazing: new THREE.MeshStandardMaterial({ color: 0x6a8190, roughness: .15, metalness: .45 }),
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
    // pylons stand on the pavements inside the road's right-of-way, clear of the carriageways and of the buildings
    const P = holder(G.x, G.y, G.a), edge = G.w >= 80 ? 37 : 15, half = edge + 7;
    for (const s of [-1, 1]) {
      mesh(frustum(9, 10, 24, .78), M.pylon, P, 0, s * half, 0);
      mesh(box(9.6, 10.6, .8), M.bronze, P, 0, s * half, 24).scale.set(.78, .78, 1);
      mesh(new THREE.ConeGeometry(2.2, 4, 4).rotateY(Math.PI / 4).rotateX(Math.PI / 2).translate(0, 0, 2), M.gold, P, 0, s * half, 24.8);
      mesh(box(1.2, 6.5, 14), M.bronze, P, 4.7, s * half, 4);                 // recessed bronze panel on the face
      for (const k of [-1, 1]) mesh(cyl(.25, .2, 9, 6), M.pole, P, k * 12, s * half, 0, false);
    }
    mesh(box(4, 2 * half - 8, 2.4), M.bronze, P, 0, 0, 19);                 // portal beam over the road
    mesh(box(4.2, 2 * half - 8, .35), M.gold, P, 0, 0, 21.4, false);
    for (const s of [-1, 1]) mesh(box(40, 3, .15), M.water, P, s * 26, 0, 0, false);
  }

  /* ---------- heritage seating: the whole UNESCO buffer ---------- */
  // The band north of the city becomes one stepped landscape: long wavy terraces rising level by level towards the north,
  // seating pods spread along every terrace (carpets, cushions, low table, with a Bedouin tent, a shade sail or a fire),
  // a lantern-lit path along the back of each terrace, meandering cross paths with steps from the city edge to the top,
  // desert planting, and the stone bowl round a fire with the sail-covered walkway in the middle as the main gathering place.
  const wh = (data.zones || []).find(z => z.cat === 'wh');
  let heritage = null;
  if (wh) {
    const ring = wh.polys[0][0];
    // the southern edge (along the city) as y(x); v = metres north of it
    const south = ring.filter(p => p[1] < 2800).sort((a, b) => a[0] - b[0]).filter((p, i, A) => !i || Math.abs(p[0] - A[i - 1][0]) > 5);
    const ySouth = x => { if (x <= south[0][0]) { const [a, b] = south; return a[1] + (x - a[0]) * (b[1] - a[1]) / (b[0] - a[0]); }
      for (let i = 1; i < south.length; i++) if (x <= south[i][0]) { const a = south[i - 1], b = south[i]; return a[1] + (x - a[0]) * (b[1] - a[1]) / (b[0] - a[0]); }
      return south[south.length - 1][1]; };
    const vRange = x => { const ys = []; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const a = ring[j], b = ring[i]; if ((a[0] > x) !== (b[0] > x)) ys.push(a[1] + (x - a[0]) * (b[1] - a[1]) / (b[0] - a[0])); }
      if (ys.length < 2) return null; const y0 = Math.min(...ys), y1 = Math.max(...ys), ys0 = ySouth(x); return [y0 - ys0 + 6, y1 - ys0 - 6]; };
    let xmin = 1e9, xmax = -1e9; for (const p of ring) { xmin = Math.min(xmin, p[0]); xmax = Math.max(xmax, p[0]); } xmin += 8; xmax -= 8;
    const BW = 82, LH = .9, NL = 13;                                   // terrace depth, level height (m), number of levels
    const bnd = (k, x) => k <= 0 ? -1e9 : k * BW + 14 * Math.sin(x / 170 + k * 1.3) + 6 * Math.sin(x / 61 + k * 2.1);
    const level = (x, v) => { let k = 0; while (k < NL - 1 && v >= bnd(k + 1, x)) k++; return k; };
    const W2 = (x, v) => [x, ySouth(x) + v];
    const zAt = (x, v, k = level(x, v), lift = 0) => { const [X, Y] = W2(x, v); return ground(X, Y) + (k * LH + lift) * VEX * S; };
    const DEN = MOB ? .5 : 1;

    // terrace surfaces, risers and the outer walls, one vertex-coloured mesh
    {
      const pos = [], col = [], idx = [], C = [new THREE.Color(0xd9c29c), new THREE.Color(0xcfb48a), new THREE.Color(0xc4a87e)], cc = new THREE.Color();
      const quad = (p1, p2, p3, p4, c) => { const b = pos.length / 3; for (const q of [p1, p2, p3, p4]) { pos.push(q[0] * S, q[1] * S, q[2]); col.push(c.r, c.g, c.b); } idx.push(b, b + 1, b + 2, b, b + 2, b + 3); };
      const P3 = (x, v, k, lift = 0) => { const [X, Y] = W2(x, v); return [X, Y, ground(X, Y) + (k * LH + lift) * VEX * S]; };
      const P0 = (x, v) => { const [X, Y] = W2(x, v); return [X, Y, ground(X, Y)]; };
      const step = 10, xs = []; for (let x = xmin; x <= xmax; x += step) xs.push(x);
      for (let c = 1; c < xs.length; c++) {
        const xa = xs[c - 1], xb = xs[c], ra = vRange(xa), rb = vRange(xb); if (!ra || !rb || ra[1] <= ra[0] || rb[1] <= rb[0]) continue;
        for (let k = 0; k < NL; k++) {
          const la0 = Math.max(ra[0], bnd(k, xa)), la1 = Math.min(ra[1], bnd(k + 1, xa)), lb0 = Math.max(rb[0], bnd(k, xb)), lb1 = Math.min(rb[1], bnd(k + 1, xb));
          if (la1 <= la0 || lb1 <= lb0) continue;
          cc.copy(C[k % 3]).offsetHSL(0, 0, (R() - .5) * .02);
          quad(P3(xa, la0, k), P3(xb, lb0, k), P3(xb, lb1, k), P3(xa, la1, k), cc);                    // terrace top
          if (k < NL - 1 && bnd(k + 1, xa) < ra[1] && bnd(k + 1, xb) < rb[1])                          // riser to the next level
            quad(P3(xa, la1, k), P3(xb, lb1, k), P3(xb, lb1, k + 1), P3(xa, la1, k + 1), C[2].clone().multiplyScalar(.82));
        }
        // outer walls: north edge, and the western edge where the band does not start at the city
        const ka = level(xa, ra[1]), kb = level(xb, rb[1]);
        if (ka || kb) quad(P0(xa, ra[1]), P3(xa, ra[1], ka), P3(xb, rb[1], kb), P0(xb, rb[1]), C[2].clone().multiplyScalar(.75));
        const ka0 = level(xa, ra[0]), kb0 = level(xb, rb[0]);
        if (ka0 || kb0) quad(P0(xb, rb[0]), P3(xb, rb[0], kb0), P3(xa, ra[0], ka0), P0(xa, ra[0]), C[2].clone().multiplyScalar(.75));
      }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
      const tm = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: .95, side: THREE.DoubleSide })); tm.receiveShadow = true; tm.castShadow = true; group.add(tm);
    }

    // instanced furniture in scene space: (x, y) metres, z0 scene units, sizes metres (height exaggerated like the city)
    const HB = new Map(), hi = (k, geo, mat, x, y, z0, a, sx, sy, sz) => { let b = HB.get(k); if (!b) HB.set(k, b = { geo, mat, L: [] }); b.L.push(x, y, z0, a, sx, sy, sz); };
    const U = { box: box(1, 1, 1), cyl: cyl(.5, .5, 1, 8), cone: new THREE.ConeGeometry(.5, 1, 7).rotateX(Math.PI / 2).translate(0, 0, .5),
      tent: (() => { const t = new THREE.Shape(); t.moveTo(-.5, 0); t.lineTo(.5, 0); t.lineTo(.08, 1); t.lineTo(-.08, 1); t.closePath();
        return new THREE.ExtrudeGeometry(t, { depth: 1, bevelEnabled: false }).translate(0, 0, -.5).rotateX(Math.PI / 2).rotateZ(Math.PI / 2); })(),   // ridge along x, standing on z = 0
      ico: new THREE.IcosahedronGeometry(.5, 0).translate(0, 0, .5), ptrunk: cyl(.5, .36, 1, 5), pcrown: new THREE.ConeGeometry(.5, 1, 6).rotateX(-Math.PI / 2).translate(0, 0, .5) };
    const tentMat = new THREE.MeshStandardMaterial({ color: 0x4a3426, roughness: 1, side: THREE.DoubleSide });
    const sailTris = [];   // in scene units
    const pathPts = [];    // ribbons: arrays of [X, Y, z]

    // the gathering place: the stone bowl in the middle of a terrace, on the walkway from the city
    const bx = 200, kB = 3, bv = (bnd(kB, bx) + bnd(kB + 1, bx)) / 2, [cx, cy] = W2(bx, bv), zB = zAt(bx, bv, kB);
    heritage = { x: cx, y: cy };
    const H = holder(cx, cy, 0); H.parent.position.z = zB;
    const prof = [[0, -.1], [5, -.1], [5, .35], [8.5, .35], [8.5, .75], [12, .75], [12, 1.15], [15.5, 1.15], [15.5, 1.55], [19, 1.55], [21, .2], [22, 0]].map(([r, z]) => new THREE.Vector2(r, z));
    const bowl = new THREE.LatheGeometry(prof, 48); bowl.rotateX(Math.PI / 2); mesh(bowl, M.stone, H);
    mesh(cyl(2.4, 2.2, .6, 16), M.stoneDark, H, 0, 0, -.1);
    const flame = mesh(new THREE.ConeGeometry(1.3, 2.6, 7).rotateX(Math.PI / 2).translate(0, 0, 1.3), M.fire, H, 0, 0, .4, false);
    for (const [r, z] of [[6.8, .35], [10.3, .75], [13.8, 1.15], [17.3, 1.55]]) {
      const n = Math.round(r * 2.2);
      for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + R() * .1; if (R() < .25) continue;
        hi('cushion', U.box, M.carpet, cx + Math.cos(a) * r, cy + Math.sin(a) * r, zB + z * VEX * S, a, 1.6, .8, .25);
        if (R() < .7) sitter(cx + Math.cos(a) * r, cy + Math.sin(a) * r, zB + z * VEX * S); }
    }
    { const tris = [], polePts = [];
      for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2, b = a + Math.PI / 3, rr = 26, h1 = 7 + (k % 2) * 3, h2 = 10 - (k % 2) * 3;
        const p1 = [Math.cos(a) * rr, Math.sin(a) * rr, h1], p2 = [Math.cos(b) * rr, Math.sin(b) * rr, h2], p3 = [Math.cos((a + b) / 2) * 15, Math.sin((a + b) / 2) * 15, 4.5];
        tris.push([p1, p2, p3]); polePts.push(p1, p2); }
      sails(tris, H); poles(polePts, H);
      for (let k = 0; k < 24; k++) { const a = k / 24 * 6.28; hi('lamp', U.box, M.lamp, cx + Math.cos(a) * 24, cy + Math.sin(a) * 24, zB, a, .4, .4, .6); } }
    const nearBowl = (x, v) => Math.hypot(x - bx, v - bv) < 46;
    // the walkway from the city edge up to the bowl, under sails, lanterns both sides
    { const pts = []; for (let v = 4; v <= bv - 24; v += 6) { const [X, Y] = W2(bx, v); pts.push([X, Y, zAt(bx, v) + .012]); } pathPts.push({ pts, w: 6 });
      for (let v = 8; v < bv - 30; v += 14) for (const sd of [-1, 1]) { const [X1, Y1] = W2(bx + sd * 3.6, v), [X2, Y2] = W2(bx + sd * 3.6, v + 14), [Xm, Ym] = W2(bx + sd * .36, v + 7), z1 = zAt(bx, v), z2 = zAt(bx, v + 14);
        sailTris.push([[X1 * S, Y1 * S, z1 + 5.5 * VEX * S], [X2 * S, Y2 * S, z2 + 6.3 * VEX * S], [Xm * S, Ym * S, (z1 + z2) / 2 + 3.8 * VEX * S]]);
        hi('pole', U.cyl, M.pole, X1, Y1, z1, 0, .28, .28, 5.5); const [Lx, Ly] = W2(bx + sd * 3.2, v + 7); hi('lamp', U.box, M.lamp, Lx, Ly, zAt(bx, v + 7), 0, .35, .35, .5); }
      for (let i = 0; i < 26 * DEN; i++) { const v1 = 10 + R() * (bv - 40), [X0, Y0] = W2(bx + (R() - .5) * 3, v1), [X1, Y1] = W2(bx + (R() - .5) * 3, R() < .5 ? 8 : bv - 30); walker(X0, Y0, X1, Y1, zAt(bx, v1) + .02); } }

    // cross paths: meander from the city edge to the top every ~280 m, with lanterns and walkers
    const crossX = []; for (let x = xmin + 140; x < xmax - 60; x += 280) if (Math.abs(x - bx) > 90) crossX.push(x);
    const meander = (x0, v) => x0 + 18 * Math.sin(v / 55 + x0);
    for (const x0 of crossX) {
      const r = vRange(x0); if (!r) continue; const pts = [];
      for (let v = r[0] + 2; v <= r[1] - 2; v += 5) { const x = meander(x0, v), [X, Y] = W2(x, v); pts.push([X, Y, zAt(x, v) + .012]); }
      pathPts.push({ pts, w: 4.5 });
      for (let v = r[0] + 6; v < r[1] - 6; v += 14) for (const sd of [-1, 1]) { const x = meander(x0, v) + sd * 3.2, [X, Y] = W2(x, v); hi('lamp', U.box, M.lamp, X, Y, zAt(x, v), 0, .35, .35, .55); }
      for (let i = 0; i < 6 * DEN; i++) { const v1 = r[0] + R() * (r[1] - r[0]), v2 = Math.min(r[1], v1 + 40), [X0, Y0] = W2(meander(x0, v1), v1), [X1, Y1] = W2(meander(x0, v2), v2); walker(X0, Y0, X1, Y1, zAt(meander(x0, v1), v1) + .02); }
    }
    const nearCross = (x, v) => crossX.some(x0 => Math.abs(x - meander(x0, v)) < 11) || (Math.abs(x - bx) < 9 && v < bv);

    // per terrace: the path along its back edge, then pods spread over the terrace
    let pods = 0;
    for (let k = 0; k < NL; k++) {
      // back-edge path
      let seg = [];
      const flush = () => { if (seg.length > 3) pathPts.push({ pts: seg, w: 4 }); seg = []; };
      for (let x = xmin; x <= xmax; x += 8) { const r = vRange(x), v = bnd(k + 1, x) - 7;
        if (!r || k === NL - 1 || v < r[0] + 3 || v > r[1] - 3 || v < bnd(k, x) + 10) { flush(); continue; }
        const [X, Y] = W2(x, v); seg.push([X, Y, zAt(x, v, k) + .012]);
        if (((x - xmin) / 8 | 0) % 2 === 0) { const [Lx, Ly] = W2(x, v + 3); hi('lamp', U.box, M.lamp, Lx, Ly, zAt(x, v, k), 0, .35, .35, .55); } }
      flush();
      for (let i = 0; i < 10 * DEN; i++) { const x = xmin + R() * (xmax - xmin), v = bnd(k + 1, x) - 7, r = vRange(x); if (!r || v < r[0] + 3 || v > r[1] - 3) continue;
        const x2 = x + (R() - .5) * 80, [X0, Y0] = W2(x, v), [X1, Y1] = W2(x2, bnd(k + 1, x2) - 7); walker(X0, Y0, X1, Y1, zAt(x, v, k) + .02); }
      // pods: two staggered rows on the terrace
      for (const [fr, ph] of [[.3, 0], [.62, .5]]) for (let x = xmin + ph * 34 + R() * 10; x <= xmax; x += 34 / Math.sqrt(DEN)) {
        const r = vRange(x); if (!r) continue;
        const v = bnd(k, x) + (k ? (bnd(k + 1, x) - bnd(k, x)) * fr : 0) + (k ? 0 : 0) + (R() - .5) * 5;
        const vv = k ? v : Math.max(r[0] + 14, bnd(1, x) - BW * (1 - fr) - 7);
        if (vv < r[0] + 8 || vv > r[1] - 8 || level(x, vv) !== k || nearBowl(x, vv) || nearCross(x, vv)) continue;
        const [X, Y] = W2(x, vv), z = zAt(x, vv, k);
        if (R() < .16) { if (R() < .5) { const ph2 = 10 + R() * 3; hi('ptrunk', U.ptrunk, M.pole, X, Y, z, 0, .7, .7, ph2); hi('pcrown', U.pcrown, M.shrub, X, Y, z + (ph2 - 1.4) * VEX * S, R() * 6, 8, 8, 2); }
          else hi('shrub', U.ico, M.shrub, X, Y, z, R() * 6, 3 + R() * 2, 3 + R() * 2, 2); continue; }
        const ang = Math.atan2(ySouth(x + 1) - ySouth(x - 1), 2) + (R() < .5 ? 0 : Math.PI), kind = R(), c = Math.cos(ang), sn = Math.sin(ang);
        const O = (du, dv) => [X + du * c - dv * sn, Y + du * sn + dv * c];
        hi('carpet' + ((R() * 3) | 0), U.box, null, X, Y, z, ang, 8, 5.5, .05);
        for (const [du, dv, w, d] of [[0, 2.5, 8, 1], [0, -2.5, 8, 1], [3.6, 0, 1, 4], [-3.6, 0, 1, 4]]) { if (dv < 0 && kind < .5) continue; const [qx, qy] = O(du, dv); hi('cushion', U.box, M.carpet, qx, qy, z + .05 * VEX * S, ang, w, d, .45); }
        hi('table', U.cyl, M.wood, X, Y, z + .05 * VEX * S, 0, 1.6, 1.6, .4);
        if (kind < .35) hi('tent', U.tent, tentMat, X, Y, z, ang, 12, 9, 3.4);
        else if (kind < .7) { const [s1x, s1y] = O(5, 0), [s2x, s2y] = O(-5, 0), [s3x, s3y] = O(0, 3.5);
          sailTris.push([[s1x * S, s1y * S, z + 4.2 * VEX * S], [s2x * S, s2y * S, z + 5.4 * VEX * S], [s3x * S, s3y * S, z + 3 * VEX * S]]);
          hi('pole', U.cyl, M.pole, s1x, s1y, z, 0, .3, .3, 4.2); hi('pole', U.cyl, M.pole, s2x, s2y, z, 0, .3, .3, 5.4); }
        else { const [fx, fy] = O(0, 5.5); hi('pit', U.cyl, M.stoneDark, fx, fy, z, 0, 2, 2, .35); hi('fire', U.cone, M.fire, fx, fy, z + .3 * VEX * S, R() * 6, 1, 1, 1.4); }
        const n = 2 + ((R() * 3) | 0); for (let i = 0; i < n; i++) { const [px, py] = O((R() - .5) * 6, R() < .5 ? 1.8 : -1.8); sitter(px, py, z + .1 * VEX * S); }
        pods++;
      }
    }
    // desert planting scattered over the whole band
    for (let i = 0; i < 1400 * DEN; i++) { const x = xmin + R() * (xmax - xmin), r = vRange(x); if (!r) continue; const v = r[0] + R() * (r[1] - r[0]);
      if (nearBowl(x, v) || nearCross(x, v)) continue; const [X, Y] = W2(x, v); hi('shrub', U.ico, M.shrub, X, Y, zAt(x, v), R() * 6, 2 + R() * 2.5, 2 + R() * 2.5, 1.4 + R()); }

    // paths: one merged ribbon mesh
    { const pos = [], idx = [];
      for (const { pts, w } of pathPts) { const b0 = pos.length / 3;
        pts.forEach((p, i) => { const a = pts[Math.max(0, i - 1)], c = pts[Math.min(pts.length - 1, i + 1)], dx = c[0] - a[0], dy = c[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l * w / 2, ny = dx / l * w / 2;
          pos.push((p[0] + nx) * S, (p[1] + ny) * S, p[2], (p[0] - nx) * S, (p[1] - ny) * S, p[2]); if (i) { const k = b0 + (i - 1) * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); } }); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
      const pm2 = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0xece0c8, roughness: .95, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })); pm2.receiveShadow = true; group.add(pm2); }
    // sails: one merged mesh in scene space
    { const pos = []; for (const [a, b, c] of sailTris) { const m = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3 - .06]; pos.push(...a, ...b, ...m, ...b, ...c, ...m, ...c, ...a, ...m); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals(); const sm = new THREE.Mesh(g, M.sail); sm.castShadow = true; group.add(sm); }
    // instanced furniture
    const carpetM = [0x9c3b2c, 0xb5623f, 0x7a2f2a].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 1 }));
    { const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), Zz = new THREE.Vector3(0, 0, 1), pv = new THREE.Vector3(), sv = new THREE.Vector3();
      for (const [k, b] of HB) { const n = b.L.length / 7, mat = b.mat || carpetM[+k.slice(-1)], im = new THREE.InstancedMesh(b.geo, mat, n);
        for (let i = 0; i < n; i++) { const o = i * 7, L = b.L; im.setMatrixAt(i, m4.compose(pv.set(L[o] * S, L[o + 1] * S, L[o + 2]), q.setFromAxisAngle(Zz, L[o + 3]), sv.set(L[o + 4] * S, L[o + 5] * S, L[o + 6] * S * VEX))); }
        im.castShadow = !['lamp', 'fire', 'carpet0', 'carpet1', 'carpet2', 'cushion'].includes(k); im.receiveShadow = true; im.computeBoundingSphere(); group.add(im); } }
    heritage.flame = flame; heritage.pods = pods; heritage.levels = NL;
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

  /* ---------- the station district: forecourts with ground art, giant screens, hotels with pools, taxi loop, parking, gardens ---------- */
  const screens = [], parked = [];
  let district = null;
  const stn = opt.station;
  if (stn && typeof document !== 'undefined') {
    const ca = Math.cos(stn.ang), sa = Math.sin(stn.ang), W = (u, v) => [stn.x + u * ca - v * sa, stn.y + u * sa + v * ca];
    const inRing = (x, y, r) => { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const a = r[i], b = r[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
    // free land near the station: no parcel, no road, off the track corridor, inside the project boundary
    const near = (x, y, m) => Math.abs(x - stn.x) < m && Math.abs(y - stn.y) < m;
    const zl = [];
    for (const z of data.zones || []) { if ((data.cats || {})[z.cat]?.overlay) continue;
      for (const poly of z.polys) { const r = poly[0]; let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const p of r) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
        if (x1 < stn.x - 1200 || x0 > stn.x + 1200 || y1 < stn.y - 1200 || y0 > stn.y + 1200) continue; zl.push({ r, x0, x1, y0, y1 }); } }
    const segs = [];
    for (const r of data.roads || []) for (let i = 1; i < r.p.length; i++) { const a = r.p[i - 1], b = r.p[i];
      if (!near(a[0], a[1], 1600) && !near(b[0], b[1], 1600)) continue; segs.push({ a, b, hw: (r.w || 20) / 2 + 4 }); }
    const dSeg = (x, y, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / L2)); return Math.hypot(x - a[0] - dx * t, y - a[1] - dy * t); };
    const inSite = (x, y) => (data.boundary || []).some(r => inRing(x, y, r));
    // (the track corridor is excluded from the approved boundary, so no boundary test here: the window round the station is enough)
    const free = (x, y) => { for (const z of zl) if (x >= z.x0 && x <= z.x1 && y >= z.y0 && y <= z.y1 && inRing(x, y, z.r)) return false;
      for (const sg of segs) if (dSeg(x, y, sg.a, sg.b) < sg.hw) return false; return true; };
    const freeUV = (u, v) => Math.abs(v) > 22 && !(Math.abs(u) < 104 && Math.abs(v) < 128) && !(Math.abs(u) < 420 && Math.abs(v) < 60) && free(...W(u, v));
    const share = (u, v, w, d, st = 8) => { let n = 0, f = 0; for (let a = -w / 2; a <= w / 2 + .1; a += st) for (let b = -d / 2; b <= d / 2 + .1; b += st) { n++; if (freeUV(u + a, v + b)) f++; } return f / n; };
    const used = [];   // rectangles already taken, in (u, v)
    const clash = (u, v, w, d) => used.some(r => Math.abs(r.u - u) < (r.w + w) / 2 && Math.abs(r.v - v) < (r.d + d) / 2);
    const take = (u, v, w, d, min = .92) => { if (clash(u, v, w, d) || share(u, v, w, d) < min) return false; used.push({ u, v, w, d }); return true; };
    const Hd = (u, v, a = 0) => { const [x, y] = W(u, v); return holder(x, y, stn.ang + a); };
    const IB = new Map(), ins = (k, geo, mat, x, y, z, a, sx, sy, sz) => { let b = IB.get(k); if (!b) IB.set(k, b = { geo, mat, L: [] }); b.L.push(x, y, z, a, sx, sy, sz); };
    const G_BOX = box(1, 1, 1), G_TR = cyl(.5, .36, 1, 5), G_CR = new THREE.ConeGeometry(.5, 1, 6).rotateX(-Math.PI / 2).translate(0, 0, .5), G_IC = new THREE.IcosahedronGeometry(.5, 0).translate(0, 0, .5);
    const lawnMat = new THREE.MeshStandardMaterial({ color: 0x7d9a52, roughness: 1 });
    const palmAt = (x, y, z = 0) => { const h = 11 + R() * 3; ins('trunk', G_TR, M.pole, x, y, z, 0, .7, .7, h); ins('crown', G_CR, M.shrub, x, y, z + h - 1.4, R() * 6, 8, 8, 2); };
    const treeAt = (x, y) => { const s2 = 6 + R() * 4; ins('trunk', G_TR, M.pole, x, y, 0, 0, .8, .8, 4); ins('ico', G_IC, M.shrub, x, y, 3, R() * 6, s2, s2, s2 * .8); };

    // ground art for the forecourts: sun disc, lotus rosettes, a meander border, inlaid paths (modern Egyptian, no text)
    function groundArt(w, h, seed2) {
      const c = document.createElement('canvas'); c.width = 2048; c.height = Math.round(2048 * h / w); const g = c.getContext('2d'), Wc = c.width, Hc = c.height;
      g.fillStyle = '#e9ddc7'; g.fillRect(0, 0, Wc, Hc);
      g.strokeStyle = 'rgba(120,90,60,.18)'; g.lineWidth = 2; for (let x = 0; x < Wc; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, Hc); g.stroke(); } for (let y = 0; y < Hc; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(Wc, y); g.stroke(); }
      const cx = Wc / 2, cy = Hc / 2, R0 = Hc * .42;
      const ring = (r, wdt, col) => { g.strokeStyle = col; g.lineWidth = wdt; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke(); };
      g.fillStyle = '#c9a25a'; for (let k = 0; k < 48; k++) { const a = k / 48 * Math.PI * 2, a2 = a + Math.PI / 48; g.beginPath(); g.moveTo(cx + Math.cos(a) * R0 * .38, cy + Math.sin(a) * R0 * .38); g.lineTo(cx + Math.cos(a + .02) * R0, cy + Math.sin(a + .02) * R0); g.lineTo(cx + Math.cos(a2) * R0 * .92, cy + Math.sin(a2) * R0 * .92); g.closePath(); g.fill(); }
      g.fillStyle = '#8a4b2d'; g.beginPath(); g.arc(cx, cy, R0 * .36, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#d9b15e'; g.beginPath(); g.arc(cx, cy, R0 * .22, 0, Math.PI * 2); g.fill();
      ring(R0 * .36, 10, '#3d4a52'); ring(R0 * 1.02, 14, '#3d4a52'); ring(R0 * 1.1, 4, '#8a4b2d');
      // lotus rosettes along the long axis
      const lotus = (x, y, r) => { g.save(); g.translate(x, y); for (let k = 0; k < 8; k++) { g.rotate(Math.PI / 4); g.fillStyle = k % 2 ? '#5f7d8c' : '#b96a42'; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(r * .45, -r * .45, 0, -r); g.quadraticCurveTo(-r * .45, -r * .45, 0, 0); g.fill(); } g.fillStyle = '#d9b15e'; g.beginPath(); g.arc(0, 0, r * .18, 0, Math.PI * 2); g.fill(); g.restore(); };
      for (let k = 1; k <= 3; k++) for (const sgn of [-1, 1]) lotus(cx + sgn * (R0 * 1.3 + k * Hc * .32), cy, Hc * .13);
      // inlaid paths and a meander (Greek-key style) border in bronze
      g.fillStyle = '#c4b08e'; g.fillRect(0, cy - Hc * .03, Wc, Hc * .06);
      g.strokeStyle = '#6e5232'; g.lineWidth = 6; const m = Hc * .06, step = m * 2;
      for (const yb of [m * .8, Hc - m * .8]) { g.beginPath(); for (let x = 0; x < Wc; x += step) { const s = yb < Hc / 2 ? 1 : -1; g.moveTo(x, yb); g.lineTo(x + step * .75, yb); g.lineTo(x + step * .75, yb - s * m * .6); g.lineTo(x + step * .25, yb - s * m * .6); g.lineTo(x + step * .25, yb - s * m * .3); g.lineTo(x + step * .5, yb - s * m * .3); } g.stroke(); }
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
    }
    // LED screen content: four slides stacked in one canvas, scrolled through in the loop
    function screenTex() {
      const c = document.createElement('canvas'); c.width = 512; c.height = 1024; const g = c.getContext('2d');
      const slide = (i, top, bot, draw) => { const y0 = i * 256, gr = g.createLinearGradient(0, y0, 0, y0 + 256); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, y0, 512, 256); draw(y0); };
      slide(0, '#1c2b4a', '#e0874a', y0 => { g.fillStyle = '#2a1d16'; for (const [x, w, h] of [[150, 170, 120], [300, 130, 92], [400, 90, 64]]) { g.beginPath(); g.moveTo(x - w / 2, y0 + 230); g.lineTo(x, y0 + 230 - h); g.lineTo(x + w / 2, y0 + 230); g.fill(); }
        g.fillStyle = '#fff3d6'; g.beginPath(); g.arc(360, y0 + 70, 22, 0, 7); g.fill(); g.fillStyle = '#20150f'; g.fillRect(0, y0 + 230, 512, 26); });
      slide(1, '#0f1418', '#29333a', y0 => { g.fillStyle = '#f3e7cf'; g.font = '700 64px Georgia, serif'; g.textAlign = 'center'; g.fillText('nevera', 256, y0 + 128); g.font = '24px Georgia, serif'; g.fillStyle = '#d9b15e'; g.fillText('WHERE HERITAGE MEETS THE FUTURE', 256, y0 + 178); });
      slide(2, '#3a1b2e', '#c55b7b', y0 => { g.strokeStyle = '#ffd27a'; g.lineWidth = 6; for (let k = 0; k < 7; k++) { g.beginPath(); g.moveTo(0, y0 + 40 + k * 30); g.bezierCurveTo(170, y0 + k * 40, 340, y0 + 220 - k * 20, 512, y0 + 60 + k * 26); g.stroke(); } });
      slide(3, '#10202a', '#3f93ad', y0 => { g.fillStyle = 'rgba(255,255,255,.9)'; for (let k = 0; k < 9; k++) { g.fillRect(28 + k * 54, y0 + 40, 36, 176); } g.fillStyle = '#0f1418'; for (let k = 0; k < 9; k++) { g.fillRect(34 + k * 54, y0 + 52, 24, 14); g.fillRect(34 + k * 54, y0 + 190, 24, 14); } });
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.repeat.set(1, .25); t.offset.set(0, .75); return t;
    }
    const scrMat = () => { const t = screenTex(); const m = new THREE.MeshBasicMaterial({ map: t, toneMapped: false }); screens.push({ t, ph: R() * 4 }); return m; };
    function screen(P, x, y, w, h, z0, legs = true) {             // a framed LED wall in a holder (metres, faces +x)
      mesh(box(1.2, w + 2, h + 2), M.bronze, P, x, y, z0 - 1);
      const sc = new THREE.Mesh(new THREE.PlaneGeometry(w, h), scrMat()); sc.rotation.set(Math.PI / 2, Math.PI / 2, 0); sc.position.set(x + .65, y, z0 + h / 2); P.add(sc);
      if (legs) for (const s of [-1, 1]) mesh(box(1.4, 1.4, z0), M.bronze, P, x, y + s * w * .35, 0);
    }
    const lounger = (P, x, y, a, z = 0) => { const l = mesh(box(2, .8, .35), M.white, P, x, y, z, false); l.rotation.z = a; };

    // 1) forecourts with ground art, both sides of the station, facing the entrances
    district = { forecourts: 0, hotels: 0, screens: 0 };
    for (const sd of [-1, 1]) {
      let done = false;
      for (const u0 of [0, -80, 80, -160, 160, -240, 240]) for (let L = 380; L >= 160 && !done; L -= 40) { const v = sd * (128 + 45); if (take(u0, v, L, 90, 1)) { done = true;
        const P = Hd(u0, v, 0), art = new THREE.Mesh(new THREE.PlaneGeometry(L, 90), new THREE.MeshStandardMaterial({ map: groundArt(L, 90), roughness: .9 }));
        art.position.z = .06; art.receiveShadow = true; P.add(art); district.forecourts++;
        // giant screens on the outer edge of the forecourt, facing the station
        for (const k of (L >= 260 ? [-1, 0, 1] : [0])) { const G2 = new THREE.Group(); G2.position.set(k * L * .33, sd * 38, 0); G2.rotation.z = sd > 0 ? -Math.PI / 2 : Math.PI / 2; P.add(G2); screen(G2, 0, 0, 30, 12, 7); district.screens++; }
        // palms along the long edges, benches, fountain jets on the axis
        for (let k = -L / 2 + 12; k <= L / 2 - 12; k += 24) for (const e of [-1, 1]) palmAt(...W(u0 + k, v + e * 42));
        for (let k = -L / 2 + 30; k < L / 2 - 20; k += 40) { mesh(cyl(.3, .06, 4, 5), M.jet, P, k, 0, .06, false); mesh(box(3, .9, .5), M.wood, P, k + 12, sd * -30, .06, false); }
        for (let i = 0; i < 40; i++) { const [x0, y0] = W(u0 + (R() - .5) * L, v + (R() - .5) * 70), [x1, y1] = W(u0 + (R() - .5) * L, v + (R() - .5) * 70); walker(x0, y0, x1, y1, ground(x0, y0) + .08); }
      } }
    }
    // 2) station hotels with podium pools, loungers, umbrellas and a facade screen
    const hotelAt = (u, v) => {
      const P = Hd(u, v, 0), sd = Math.sign(v), fl = 9 + ((R() * 4) | 0);
      mesh(box(72, 46, 8), M.pylon, P, 0, 0, 0);                                          // podium, 2 floors
      mesh(box(56, 16, fl * 4), M.white, P, 0, sd * 11, 8);                               // white slab tower
      for (let f = 1; f < fl; f++) mesh(box(56.4, 16.4, .5), M.pave, P, 0, sd * 11, 8 + f * 4, false);   // floor slabs
      for (let f = 0; f < fl; f++) mesh(box(56.5, 16.5, 2.2), M.glazing, P, 0, sd * 11, 9.2 + f * 4, false);   // ribbon glazing, every floor
      mesh(box(30, 12, .12), M.water, P, -8, -sd * 12, 8, false);                         // podium pool
      mesh(box(40, 20, .08), M.pave, P, -8, -sd * 12, 8, false);
      for (let k = 0; k < 8; k++) { lounger(P, -26 + k * 5, -sd * 20, 0, 8.08); if (k % 2 === 0) { mesh(cyl(.08, .08, 2.4, 4), M.pole, P, -24 + k * 5, -sd * 21, 8, false); mesh(new THREE.ConeGeometry(1.8, .6, 8).rotateX(Math.PI / 2).translate(0, 0, .3), M.sail, P, -24 + k * 5, -sd * 21, 10.4, false); } }
      const G2 = new THREE.Group(); G2.position.set(28.5, sd * 11, 0); P.add(G2); screen(G2, 0, 0, 12, 16, 8 + fl * 2, false); district.screens++;
      for (let k = 0; k < 6; k++) palmAt(...W(u - 36 + k * 14, v - sd * 26));
      for (let k = 0; k < 4; k++) palmAt(...W(u - 22 + k * 10, v - sd * 21), 8);   // palms on the pool deck
      for (let i = 0; i < 12; i++) { const [x, y] = W(u - 26 + R() * 40, v - sd * (14 + R() * 8)); sitter(x, y, ground(x, y) + 8 * VEX * S); }
      district.hotels++;
    };
    for (const v0 of [250, 320, 380]) for (const u0 of [-480, -330, -170, 0, 170, 330, 480]) for (const sd of [-1, 1]) { if (district.hotels >= 9) break; if (take(u0, sd * v0, 80, 56, 1)) hotelAt(u0, sd * v0); }
    // 3) taxi and bus loop at one end of each forecourt, parking courts further out
    for (const sd of [-1, 1]) for (const u0 of [300, -300, 440, -440]) { const v = sd * 175; if (!take(u0, v, 110, 70, 1)) continue;
      const P = Hd(u0, v, 0); mesh(box(110, 70, .1), new THREE.MeshStandardMaterial({ color: 0x3a3835, roughness: .95 }), P, 0, 0, .02, false);
      mesh(box(80, 30, .2), M.shrub, P, 0, 0, .04, false);
      for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; const [x, y] = W(u0 + Math.cos(a) * 46, v + Math.sin(a) * 26); parked.push({ x, y, a: stn.ang + a + Math.PI / 2, c: k % 3 ? 0xf2f2f0 : 0xd9b23a, bus: k % 7 === 0 }); }
    }
    for (let u0 = -520; u0 <= 520; u0 += 130) for (const sd of [-1, 1]) for (const v0 of [190, 300, 420]) { const v = sd * v0; if (!take(u0, v, 110, 60, 1)) continue;
      const P = Hd(u0, v, 0); mesh(box(110, 60, .1), new THREE.MeshStandardMaterial({ color: 0x454340, roughness: .95 }), P, 0, 0, .02, false);
      for (let r = -2; r <= 2; r++) for (let k = -20; k <= 20; k++) { if (R() < .22 || r === 0) continue; const [x, y] = W(u0 + k * 2.6, v + r * 11); parked.push({ x, y, a: stn.ang + Math.PI / 2, c: [0xf2f2f0, 0xc9ccd0, 0x1b1d20, 0x8a8e93, 0x2b3c5c, 0x8c2a2a][(R() * 6) | 0] }); }
      for (let k = -50; k <= 50; k += 20) for (const e of [-1, 1]) treeAt(...W(u0 + k, v + e * 28));
    }
    // 4) gardens on what is still free: lawns, tree clumps and palm rows, a few strolling people
    const flushIns = () => { const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), Zz = new THREE.Vector3(0, 0, 1);
      for (const [k, b] of IB) { const n = b.L.length / 7, im = new THREE.InstancedMesh(b.geo, b.mat, n);
        for (let i = 0; i < n; i++) { const o = i * 7, L = b.L; im.setMatrixAt(i, m4.compose(new THREE.Vector3(L[o] * S, L[o + 1] * S, ground(L[o], L[o + 1]) + L[o + 2] * S * VEX), q.setFromAxisAngle(Zz, L[o + 3]), new THREE.Vector3(L[o + 4] * S, L[o + 5] * S, L[o + 6] * S * VEX))); }
        im.castShadow = k !== 'lawn'; im.receiveShadow = true; im.computeBoundingSphere(); group.add(im); } };
    for (let u0 = -880; u0 <= 880; u0 += 40) for (let v0 = 40; v0 <= 560; v0 += 40) for (const sd of [-1, 1]) { const v = sd * v0;
      if (v0 < 64 && Math.abs(u0) < 420) continue;                    // the tracks through the station
      if (v0 < 64 ? !(free(...W(u0, v)) && !clash(u0, v, 40, 40)) : !take(u0, v, 40, 40, 1)) continue;
      const [gx, gy] = W(u0, v); ins('lawn', G_BOX, lawnMat, gx, gy, .01, stn.ang, 40.5, 40.5, .04);
      for (let i = 0; i < 2; i++) { if (R() < .3) continue; const [tx, ty] = W(u0 + (R() - .5) * 34, v + (R() - .5) * 34); (R() < .5 ? palmAt : treeAt)(tx, ty); }
      if (R() < .15) { const [x0, y0] = W(u0 - 18, v), [x1, y1] = W(u0 + 18, v + (R() - .5) * 20); walker(x0, y0, x1, y1, ground(x0, y0) + .04); }
    }
    flushIns();
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

  /* ---------- parked cars round the station (static, instanced) ---------- */
  if (parked.length) {
    const body = new THREE.BoxGeometry(4.4, 1.8, 1.3).translate(0, 0, .75), cm = new THREE.InstancedMesh(body, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .4, metalness: .3 }), parked.length);
    const m4p = new THREE.Matrix4(), qp = new THREE.Quaternion(), zp = new THREE.Vector3(0, 0, 1), cc = new THREE.Color();
    parked.forEach((p, i) => { cm.setMatrixAt(i, m4p.compose(new THREE.Vector3(p.x * S, p.y * S, ground(p.x, p.y) + .02), qp.setFromAxisAngle(zp, p.a), new THREE.Vector3(S * (p.bus ? 2.6 : 1), S * (p.bus ? 1.4 : 1), S * 1.5))); cm.setColorAt(i, cc.setHex(p.c)); });
    cm.receiveShadow = true; group.add(cm);
  }

  /* ---------- people mesh (instanced, walkers updated each frame) ---------- */
  const pg = (() => { const body = new THREE.CylinderGeometry(.2, .26, 1.3, 4).rotateX(Math.PI / 2).translate(0, 0, .65), head = new THREE.OctahedronGeometry(.16).translate(0, 0, 1.52);   // low-poly: there are thousands
    const col = [], pos = [], idx = []; let b = 0;
    for (const [g, c] of [[body, [1, 1, 1]], [head, [.62, .47, .36]]]) { const P = g.attributes.position, I = g.index; for (let i = 0; i < P.count; i++) { pos.push(P.getX(i), P.getY(i), P.getZ(i)); col.push(...c); } if (I) for (let i = 0; i < I.count; i++) idx.push(I.getX(i) + b); else for (let i = 0; i < P.count; i++) idx.push(i + b); b += P.count; g.dispose(); }
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
      const p = people[i], w = p.walk; if (!w && p.set) continue; p.set = true; let x = p.x, y = p.y, a = p.a;
      if (w) { const L = Math.hypot(w.x1 - w.x0, w.y1 - w.y0) || 1; w.t = (w.t + w.v * dt / L) % 2; const f = w.t < 1 ? w.t : 2 - w.t;
        x = w.x0 + (w.x1 - w.x0) * f; y = w.y0 + (w.y1 - w.y0) * f; a = Math.atan2(w.y1 - w.y0, w.x1 - w.x0) + (w.t < 1 ? 0 : Math.PI); }
      pv.set(x * S, y * S, p.z); q.setFromAxisAngle(Zx, a); pm.setMatrixAt(i, m4.compose(pv, q, p.sit ? scS : scW));
    }
    pm.instanceMatrix.needsUpdate = true;
    for (const sc of screens) { const k = (t / 5 + sc.ph) % 4, i = Math.floor(k), f = k - i, e = f < .85 ? 0 : (f - .85) / .15; sc.t.offset.y = .75 - ((i + e * e * (3 - 2 * e)) % 4) * .25; }
    if (heritage && heritage.flame) { heritage.flame.scale.set(1 + .08 * Math.sin(t * 9), 1 + .08 * Math.cos(t * 7), 1 + .15 * Math.sin(t * 11)); }
  }
  update(0);
  return { group, update, heritage, gates, district, stats: { gates: gates.length, people: people.length, plazas: (opt.plazas || []).length, district, parked: parked.length, heritagePods: heritage ? heritage.pods : 0 } };
}
