// Nevera: detailed architecture kit, after the Nevera profile renders (V2). Real proportions (3.6 m floors, 5 m ground
// floor), real relief: stone piers and floor bands stand proud of a recessed glass skin, ground floors are colonnades with
// glazed shopfronts set back, balconies have glass railings and planters spilling over, roofs have a cornice, a set-back
// top floor and timber pergolas. Stepped terrace blocks, cubic villas with timber louvres and pools, glass towers with
// bronze fins and a stone frame.
// buildDetail(THREE, list, opts) -> {group, stats}. Each item: {type: 'mid'|'terrace'|'villa'|'tower', x, y, a (rad), w, d,
// fl (floors), z (ground, metres), col (stone hex), seed}. Coordinates are metres in a z-up frame (the map's shape space);
// the caller scales the group by S.

let MAT = null;
function materials(THREE) {
  if (MAT) return MAT;
  // stone: coursing joints and slow weathering in the shader, from world position (metres via uS)
  const stone = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .82, vertexColors: true });
  stone.onBeforeCompile = sh => {
    sh.uniforms.uS = { value: 1 };
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vSP;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvSP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vSP; uniform float uS;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        { vec3 m = vSP / uS; float j = fract(m.y / .62), fw = fwidth(m.y / .62);
          float joint = (1.0 - smoothstep(0.0, max(fw * 1.5, .04), j)) * clamp(1.0 - fw * 3.0, 0., 1.);
          float n = sin(m.x * .9 + m.z * .7) * sin(m.z * 1.3 - m.x * .4 + m.y * .2) * .5 + sin(m.y * .35 + m.x * .21) * .5;
          diffuseColor.rgb *= (1.0 - .07 * joint) * (1.0 + .035 * n); }`);
    stone.userData.sh = sh;
  };
  const glass = new THREE.MeshStandardMaterial({ color: 0x55666f, roughness: .06, metalness: .9, envMapIntensity: 1.25 });
  // lit rooms behind the glass: warm, per 3.6 m bay and floor, about a quarter of them
  glass.onBeforeCompile = sh => {
    sh.uniforms.uS = { value: 1 }; sh.uniforms.uLit = { value: .9 };
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vSP; varying vec3 vSN;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvSP = (modelMatrix * vec4(transformed, 1.0)).xyz; vSN = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vSP; varying vec3 vSN; uniform float uS, uLit;')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        { vec3 m = vSP / uS; vec2 t2 = normalize(vec2(-vSN.z, vSN.x) + 1e-4); float hc = dot(m.xz, t2) / 3.6, vc = m.y / 3.6;
          float h = fract(sin(dot(floor(vec2(hc, vc)), vec2(12.9898, 78.233))) * 43758.5453);
          float wall = 1.0 - smoothstep(.4, .7, abs(vSN.y)), fx = fract(hc), fy = fract(vc);
          float room = step(.82, h) * wall * smoothstep(.0, .1, fy) * smoothstep(1.0, .88, fy);
          totalEmissiveRadiance += vec3(1.0, .62, .32) * room * uLit * .35 * (.5 + .5 * fract(h * 13.0)); }`);
  };
  MAT = {
    stone, glass,
    stoneDark: new THREE.MeshStandardMaterial({ color: 0xb59a74, roughness: .9 }),
    bronze: new THREE.MeshStandardMaterial({ color: 0x6e5233, roughness: .32, metalness: .85 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x9a6b42, roughness: .7 }),
    green: new THREE.MeshStandardMaterial({ color: 0x4f6b31, roughness: .95 }),
    green2: new THREE.MeshStandardMaterial({ color: 0x6a8a3e, roughness: .95 }),
    white: new THREE.MeshStandardMaterial({ color: 0xf1ece2, roughness: .6 }),
    rail: new THREE.MeshStandardMaterial({ color: 0xbfd4da, roughness: .05, metalness: .2, transparent: true, opacity: .28, depthWrite: false }),
    water: new THREE.MeshStandardMaterial({ color: 0x2f9bb5, roughness: .04, metalness: .2, emissive: 0x08323d }),
    deck: new THREE.MeshStandardMaterial({ color: 0xb88a5c, roughness: .75 }),
    canvas: new THREE.MeshStandardMaterial({ color: 0xeee6d6, roughness: .8 }),
    shop: new THREE.MeshStandardMaterial({ color: 0x6f6a62, roughness: .08, metalness: .85, emissive: 0xffbf86, emissiveIntensity: .22, envMapIntensity: 1.2 }),
    planter: new THREE.MeshStandardMaterial({ color: 0x8c7a62, roughness: .9 }),
  };
  return MAT;
}

export function buildDetail(THREE, list, opts = {}) {
  const M = materials(THREE), S = opts.S ?? 1;
  M.stone.userData.uS = S;
  for (const m of [M.stone, M.glass]) { const prev = m.onBeforeCompile; if (!m.userData.wrapped) { m.userData.wrapped = true; m.onBeforeCompile = sh => { prev(sh); sh.uniforms.uS.value = S; }; m.customProgramCacheKey = () => 'nvd-' + (m === M.glass ? 'g' : 's') + S; } }
  const acc = {};                                   // material key -> {p, n, c, i}
  const A = k => (acc[k] ||= { p: [], n: [], c: [], i: [] });
  let boxes = 0;
  const bushes = [];                                 // [x, y, z, r, shade]
  let BR = Math.random;                              // seeded per building, so a rebuilt building keeps its planting
  function bush(T, cx, cy, z0, sx, sy, h, n = 0) {   // a clump of leafy balls filling (sx, sy, h), drooping over the edge a little
    const ca = Math.cos(T.a), sa = Math.sin(T.a), k = n || Math.max(2, Math.round(sx * sy / 1.1));
    for (let i = 0; i < k; i++) { const u = cx + (BR() - .5) * sx, v = cy + (BR() - .5) * sy, r = .35 + BR() * .45 * Math.min(1.6, h);
      bushes.push([T.x + u * ca - v * sa, T.y + u * sa + v * ca, T.z + z0 + BR() * h * .6, r, BR()]); } }
  // one box in the frame of building T (x, y, a, z): centre (cx, cy) in the building frame, from z0 up sz, size sx x sy
  function box(k, T, cx, cy, z0, sx, sy, sz, col, rot = 0) {
    if (sx <= 0 || sy <= 0 || sz <= 0) return;
    const G = A(k), ca = Math.cos(T.a), sa = Math.sin(T.a), c = Math.cos(T.a + rot), s = Math.sin(T.a + rot);
    const wx = T.x + cx * ca - cy * sa, wy = T.y + cx * sa + cy * ca, Z0 = T.z + z0, Z1 = Z0 + sz, hx = sx / 2, hy = sy / 2;
    const P = (u, v, z) => [wx + u * c - v * s, wy + u * s + v * c, z];
    const cc = col ? new THREE.Color(col) : null, r = cc ? cc.r : 1, g = cc ? cc.g : 1, b = cc ? cc.b : 1;
    const quad = (q, nrm) => { const base = G.p.length / 3; for (const v of q) { G.p.push(v[0], v[1], v[2]); G.n.push(nrm[0], nrm[1], nrm[2]); G.c.push(r, g, b); } G.i.push(base, base + 1, base + 2, base, base + 2, base + 3); };
    quad([P(hx, -hy, Z0), P(hx, hy, Z0), P(hx, hy, Z1), P(hx, -hy, Z1)], [c, s, 0]);
    quad([P(-hx, hy, Z0), P(-hx, -hy, Z0), P(-hx, -hy, Z1), P(-hx, hy, Z1)], [-c, -s, 0]);
    quad([P(hx, hy, Z0), P(-hx, hy, Z0), P(-hx, hy, Z1), P(hx, hy, Z1)], [-s, c, 0]);
    quad([P(-hx, -hy, Z0), P(hx, -hy, Z0), P(hx, -hy, Z1), P(-hx, -hy, Z1)], [s, -c, 0]);
    quad([P(-hx, -hy, Z1), P(hx, -hy, Z1), P(hx, hy, Z1), P(-hx, hy, Z1)], [0, 0, 1]);
    boxes++;
  }
  const rng = seed => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const shade = (col, f) => { const r = Math.min(255, ((col >> 16) & 255) * f), g = Math.min(255, ((col >> 8) & 255) * f), b = Math.min(255, (col & 255) * f); return (r << 16) | (g << 8) | b; };

  // ---------- a stone facade on one face: piers, floor bands, recessed glass, balconies ----------
  // face runs along u from -L/2..L/2 at v = vf (outward normal +v when sgn = 1), floors from zb (ground floor top) up n floors
  function facade(T, R, L, vf, sgn, zb, n, col, o) {
    const bay = o.bay || 3.1, nb = Math.max(1, Math.round(L / bay)), bw = L / nb, FH = 3.6;
    const V = (dv) => vf + sgn * dv;                                  // offset outward from the facade line
    // piers: full height, proud of the glass by .55 m
    for (let k = 0; k <= nb; k++) { const u = -L / 2 + k * bw, wd = (k === 0 || k === nb) ? 1.5 : 1.05;
      box('stone', T, u, V(-.2), zb, wd, .9, n * FH, col); }
    // bronze window frames set in the reveal (head, jambs) and a pale stone sill on each floor
    for (let f = 0; f < n; f++) for (let k = 0; k < nb; k++) { const u = -L / 2 + (k + .5) * bw, z = zb + f * FH, ww = bw - 1.05;
      box('bronze', T, u, V(-.5), z + FH - .62, ww, .14, .1, 0); for (const sd of [-1, 1]) box('bronze', T, u + sd * (ww / 2 - .05), V(-.5), z + .45, .1, .14, FH - 1.07, 0);
      box('stone', T, u, V(.05), z + .42, ww + .2, .35, .08, shade(col, 1.08)); }
    // floor bands (spandrels) with a sill; every floor
    for (let f = 0; f <= n; f++) { const z = zb + f * FH; box('stone', T, 0, V(-.15), z - .45, L, .8, .9, shade(col, 1.03)); }
    for (let f = 0; f <= n; f += 2) { const z = zb + f * FH; box('stone', T, 0, V(.05), z - .52, L + .2, .3, .14, shade(col, .92)); }   // a fine shadow line every other floor
    // bronze mullion in each bay
    for (let k = 0; k < nb; k++) { const u = -L / 2 + (k + .5) * bw; box('bronze', T, u, V(-.55), zb, .09, .12, n * FH); }
    // balconies on a pattern: slab, glass rail, planter spilling over
    if (o.balc) for (let f = 1; f < n; f++) for (let k = 0; k < nb; k++) {
      if (((k + f * o.balcShift) % o.balc) !== 0) continue; const u = -L / 2 + (k + .5) * bw, z = zb + f * FH;
      box('white', T, u, V(.65), z - .25, bw - .6, 1.5, .25, 0);
      box('rail', T, u, V(1.35), z, bw - .7, .05, 1.05, 0);
      box('planter', T, u, V(1.15), z, bw - 1, .5, .5, 0); bush(T, u, V(1.25), z + .4, bw - 1.2, .6, .7); bush(T, u + (R() - .5) * bw * .3, V(1.45), z - .7, bw * .3, .3, .8, 3);
    }
  }
  function core(T, w, d, z0, h, inset) { box('glass', T, 0, 0, z0, w - 2 * inset, d - 2 * inset, h, 0); }
  function roof(T, R, w, d, z, col, o = {}) {
    box('stone', T, 0, 0, z, w + .6, d + .6, .7, shade(col, 1.05));                        // cornice
    for (const s of [-1, 1]) { box('stone', T, 0, s * (d / 2 - .1), z + .7, w, .2, .9, col); box('stone', T, s * (w / 2 - .1), 0, z + .7, .2, d, .9, col); }   // parapet
    if (o.pergola !== false && w > 12 && d > 9) {                                            // set-back pavilion with pergola and planting
      const pw = Math.min(w * .45, 16), pd = Math.min(d * .5, 9), px = (R() - .5) * (w - pw) * .6;
      box('stone', T, px - pw * .55, 0, z + .7, pw * .5, pd, 3.2, col); box('glass', T, px - pw * .55, 0, z + .7, pw * .5 + .1, pd - 1.2, 2.9, 0);
      for (let k = 0; k * .55 < pw * .6; k++) box('wood', T, px + k * .55 - pw * .05, 0, z + 3.6, .14, pd, .22, 0);   // slats
      for (const [i, j] of [[0, -1], [0, 1]]) box('wood', T, px + pw * .25, j * (pd / 2 - .2), z + .7, pw * .6, .25, .3, 0);
      for (const j of [-1, 1]) box('wood', T, px + pw * .55, j * (pd / 2 - .2), z + .7, .3, .3, 2.9, 0);
      box('planter', T, px + pw * .25, -(pd / 2 + .8), z + .7, pw * .7, 1, .6, 0); bush(T, px + pw * .25, -(pd / 2 + .8), z + 1.2, pw * .7, 1, .8);
      box('deck', T, px + pw * .25, 0, z + .7, pw * .6, pd - .5, .08, 0);
    }
    if (o.plant) for (let k = 0; k < 3; k++) bush(T, (R() - .5) * w * .6, d / 2 - 1.2, z + .9, 2.5, 1.2, 1.2);
  }

  // ---------- building types ----------
  function mid(T, R, w, d, fl, col) {                 // colonnade + shops, stone grid facades, balconies, cornice, roof pavilion
    const GF = 5, FH = 3.6, up = Math.max(1, fl - 1), top = GF + up * FH;
    box('shop', T, 0, 0, 0, w - 5, d - 5, GF - .4, 0);                                       // shopfronts set back 2.5 m
    for (let x = -w / 2 + 2.5; x <= w / 2 - 2.5; x += 2) for (const s of [-1, 1]) box('bronze', T, x, s * (d / 2 - 2.45), 0, .1, .12, GF - .4, 0);
    for (const s of [-1, 1]) box('bronze', T, 0, s * (d / 2 - 2.45), GF - 1.6, w - 5, .12, .1, 0);
    box('stone', T, 0, 0, GF - .6, w, d, .9, shade(col, 1.04));                              // beam over the colonnade
    const nc = Math.max(2, Math.round(w / 4.5)); for (let k = 0; k <= nc; k++) for (const s of [-1, 1]) box('stone', T, -w / 2 + .5 + k * (w - 1) / nc, s * (d / 2 - .5), 0, .9, .9, GF - .6, col);   // columns
    const nd = Math.max(1, Math.round(d / 4.5)); for (let k = 0; k <= nd; k++) for (const s of [-1, 1]) box('stone', T, s * (w / 2 - .5), -d / 2 + .5 + k * (d - 1) / nd, 0, .9, .9, GF - .6, col);
    for (const s of [-1, 1]) box('canvas', T, 0, s * (d / 2 + 1.2), GF - 1.6, w * .9, 2.2, .12, 0);   // awnings
    core(T, w, d, GF + .3, up * FH - .3, .75);
    const balc = R() < .7 ? 2 + ((R() * 2) | 0) : 0, shift = 1 + ((R() * 2) | 0);
    for (const s of [-1, 1]) facade(T, R, w, s * d / 2, s, GF + .3, up, col, { balc, balcShift: shift });
    // side faces: same grid, rotated frame
    const Ts = { ...T, a: T.a + Math.PI / 2 };
    for (const s of [-1, 1]) facade(Ts, R, d, s * w / 2, s, GF + .3, up, col, { balc: 0 });
    roof(T, R, w, d, top, col);
  }
  function terrace(T, R, w, d, fl, col) {             // each floor steps back on the street side, terraces full of planting
    const FH = 3.6, GF = 4.5, st = Math.min(3.2, d / (fl + 2));
    box('shop', T, 0, 0, 0, w - 3, d - 3, GF - .4, 0); box('stone', T, 0, 0, GF - .6, w, d, .9, col);
    for (let k = 0; k <= Math.round(w / 4.5); k++) box('stone', T, -w / 2 + .5 + k * (w - 1) / Math.round(w / 4.5), d / 2 - .5, 0, .9, .9, GF - .6, col);
    for (let f = 0; f < fl - 1; f++) {
      const dd = d - f * st, cy = f * st / 2, z = GF + .3 + f * FH;
      box('glass', T, 0, cy, z, w - 1.6, dd - 1.6, FH - .3, 0);
      const Tf = { ...T, x: T.x - cy * Math.sin(T.a), y: T.y + cy * Math.cos(T.a) };
      for (const s of [-1, 1]) facade(Tf, R, w, s * dd / 2, s, z, 1, col, { balc: 0 });
      const Ts = { ...Tf, a: T.a + Math.PI / 2 }; for (const s of [-1, 1]) facade(Ts, R, dd, s * w / 2, s, z, 1, col, { balc: 0 });
      // the terrace in front of the next floor up: deck, rail, planter boxes with spilling greenery, a small tree
      const ty = cy - dd / 2 + st / 2;
      box('deck', T, 0, ty, z + FH - .1, w - 1, st - .4, .1, 0); box('rail', T, 0, cy - dd / 2 - .02, z + FH, w, .05, 1.05, 0);
      box('planter', T, 0, cy - dd / 2 + .4, z + FH, w - 1, .7, .6, 0); bush(T, 0, cy - dd / 2 + .3, z + FH + .5, w - 1.2, .8, .9); bush(T, (R() - .5) * w * .5, cy - dd / 2 - .4, z + FH - 1.2, w * .4, .4, 1.4);
      for (let q = 0; q < 2; q++) if (R() < .7) { const tx = (R() - .5) * (w - 4); box('wood', T, tx, ty, z + FH, .22, .22, 1.8, 0); bush(T, tx, ty, z + FH + 1.6, 2.2, 2.2, 1.4, 6); }
    }
    const dd = d - (fl - 1) * st, cy = (fl - 1) * st / 2;
    roof({ ...T, x: T.x - cy * Math.sin(T.a), y: T.y + cy * Math.cos(T.a) }, R, w, dd, GF + .3 + (fl - 1) * FH, col, { plant: true });
  }
  function villa(T, R, w, d, col) {                   // two stacked cubic volumes, recessed openings, timber louvres, pergola, pool
    const H = 3.8, sg = R() < .5 ? -1 : 1;
    const vol = (cx, cy, z, vw, vd, lou) => {
      box('glass', T, cx, cy, z, vw - 1.2, vd - 1.2, H - .2, 0);                             // recessed glass skin
      // stone frame: corner piers, head and base bands, deep reveals
      for (const [i, j] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) box('stone', T, cx + i * (vw / 2 - .6), cy + j * (vd / 2 - .6), z, 1.2, 1.2, H, col);
      for (const s of [-1, 1]) { box('stone', T, cx, cy + s * (vd / 2 - .35), z + H - .7, vw, .7, .7, col); box('stone', T, cx + s * (vw / 2 - .35), cy, z + H - .7, .7, vd, .7, col);
        box('stone', T, cx, cy + s * (vd / 2 - .35), z, vw, .7, .3, col); }
      box('stone', T, cx, cy, z + H, vw + .3, vd + .3, .35, shade(col, 1.05));               // roof slab edge
      // timber louvres over part of the front opening
      const lw = (vw - 2.4) * lou, l0 = cx - (vw - 2.4) / 2; for (let x = 0; x < lw; x += .22) box('wood', T, l0 + x + .05, cy + vd / 2 - .5, z + .3, .08, .16, H - 1.1, 0);
    };
    vol(0, 0, 0, w, d, .5);
    const uw = w * .62, ud = d * .78, ux = sg * w * .19, uy = -d * .08; vol(ux, uy, H + .35, uw, ud, .35);
    // roof terrace on the lower volume beside the upper one: deck, rail, pergola with slats
    const tx = -sg * (uw / 2 + .2) + ux / 3, tw = w - uw - .6;
    box('deck', T, -sg * (w / 2 - tw / 2 - .3), 0, H + .35, tw, d - .8, .08, 0); box('rail', T, -sg * (w / 2 - tw / 2 - .3), d / 2 - .3, H + .43, tw, .04, 1.0, 0);
    for (let k = 0; k * .5 < d - 1.5; k++) box('wood', T, -sg * (w / 2 - tw / 2 - .3), -d / 2 + .9 + k * .5, H + 3.3, tw, .12, .2, 0);
    for (const j of [-1, 1]) box('wood', T, -sg * (w / 2 - .5), j * (d / 2 - .6), H + .43, .25, .25, 2.9, 0);
    // garden: deck, pool, loungers, planting
    box('deck', T, -sg * w * .1, d / 2 + 4, 0, w * .9, 6.5, .08, 0); box('water', T, -sg * w * .12, d / 2 + 4.6, .05, w * .55, 3.6, .1, 0);
    for (let k = 0; k < 3; k++) box('white', T, -sg * w * .12 - w * .2 + k * 2.2, d / 2 + 1.6, .08, .8, 2, .35, 0);
    for (let k = 0; k < 5; k++) bush(T, (R() - .5) * w, d / 2 + 8 + R() * 2, .3, 2 + R(), 2 + R(), 1.4, 7);
  }
  function tower(T, R, w, d, fl, col) {               // glass tower: bronze fins, floor lines, stone frame and crown, stone podium
    const FH = 3.6, PH = 9, H = PH + fl * FH;
    box('shop', T, 0, 0, 0, w + 6, d + 6, PH - .5, 0); box('stone', T, 0, 0, PH - .8, w + 10, d + 10, 1.2, col);
    for (let k = 0; k <= 6; k++) for (const s of [-1, 1]) box('stone', T, -(w + 9) / 2 + k * (w + 9) / 6, s * ((d + 9) / 2), 0, 1.2, 1.2, PH - .8, col);
    core(T, w, d, PH + .4, fl * FH, .2);
    for (const s of [-1, 1]) for (let x = -w / 2 + 1.5; x < w / 2 - 1; x += 1.5) { box('bronze', T, x, s * (d / 2 + .1), PH + .4, .12, .5, fl * FH, 0); }
    for (const s of [-1, 1]) for (let y = -d / 2 + 1.5; y < d / 2 - 1; y += 1.5) { box('bronze', T, s * (w / 2 + .1), y, PH + .4, .5, .12, fl * FH, 0); }
    for (let f = 1; f < fl; f += 1) { box('bronze', T, 0, 0, PH + .4 + f * FH - .12, w + .3, d + .3, .24, 0); }
    for (const [i, j] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) box('stone', T, i * (w / 2 - .4), j * (d / 2 - .4), PH, 2.6, 2.6, fl * FH + 3, col);
    for (const s of [-1, 1]) { box('stone', T, 0, s * (d / 2 - .4), H + .4, w + 1.4, 1.4, 2.8, col); box('stone', T, s * (w / 2 - .4), 0, H + .4, 1.4, d + 1.4, 2.8, col); }
    bush(T, 0, 0, H + .6, w - 4, d - 4, .5);
  }

  for (const it of list) {
    const R = rng((it.seed || 1) * 7919 % 2147483646 + 1), T = { x: it.x, y: it.y, a: it.a || 0, z: it.z || 0 }, col = it.col || 0xd8c2a0; BR = rng((it.seed || 1) * 104729 % 2147483646 + 7);
    if (it.type === 'villa') villa(T, R, it.w, it.d, col);
    else if (it.type === 'tower') tower(T, R, it.w, it.d, it.fl, col);
    else if (it.type === 'terrace') terrace(T, R, it.w, it.d, it.fl, col);
    else mid(T, R, it.w, it.d, it.fl, col);
  }

  const group = new THREE.Group(); group.name = 'detail';
  for (const [k, G] of Object.entries(acc)) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(G.p, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(G.n, 3));
    if (k === 'stone') g.setAttribute('color', new THREE.Float32BufferAttribute(G.c, 3));
    g.setIndex(G.p.length / 3 > 65535 ? new THREE.Uint32BufferAttribute(G.i, 1) : new THREE.Uint16BufferAttribute(G.i, 1));
    g.computeBoundingSphere();
    const m = new THREE.Mesh(g, M[k]); m.castShadow = !['rail', 'water', 'deck'].includes(k); m.receiveShadow = true; group.add(m);
  }
  if (bushes.length) {
    const g = new THREE.IcosahedronGeometry(1, 1), P = g.attributes.position;
    for (let i = 0; i < P.count; i++) { const f = 1 + .14 * Math.sin(P.getX(i) * 7.1 + P.getY(i) * 5.3) * Math.cos(P.getZ(i) * 6.7); P.setXYZ(i, P.getX(i) * f, P.getY(i) * f, P.getZ(i) * f * .85); }
    g.computeVertexNormals();
    const im = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .95 }), bushes.length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
    const tones = [0x4a6a2c, 0x5a7a34, 0x6b8a3c, 0x3f5c27, 0x7b9446];
    bushes.forEach(([x, y, z, r, t], i) => { im.setMatrixAt(i, m4.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(r, r, r))); im.setColorAt(i, c.setHex(tones[(t * tones.length) | 0])); });
    im.castShadow = true; im.receiveShadow = true; group.add(im);
  }
  return { group, stats: { boxes, bushes: bushes.length, tris: boxes * 10 + bushes.length * 80 } };
}
