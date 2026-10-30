// Nevera architecture kit (atlas Z17 villas A/B/C to start): real PBR textures (Poly Haven CC0, tinted to the atlas
// material IDs), stone panel joints, lit interiors behind recessed glazing, timber pergolas and louvres, glass balustrades,
// olive trees and shrubs from leaf cards, outdoor furniture. Y up, metres. Shared by the villa sample page and the map.
// kit(texBase) -> { M, build(kind) } where build returns { parts: [[material, geometry]], size: [w, d], h } centred on
// the footprint (front faces +z). Prototypes are cached: the map instances them (one InstancedMesh per part).
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

let KIT = null;
export function kit(texBase = 'tex/') {
  if (KIT) return KIT;
  /* ---------------- materials ---------------- */
  const TL = new THREE.TextureLoader();
  const tx = (n, srgb, tile) => { const t = TL.load(texBase + n + '.jpg'); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; t.repeat.set(1 / tile, 1 / tile); if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t; };
  const pbr = (n, tile, o = {}) => new THREE.MeshStandardMaterial({ map: tx(n + '_d', true, tile), normalMap: tx(n + '_n', false, tile), roughnessMap: tx(n + '_r', false, tile),
    color: o.color ?? 0xffffff, roughness: o.rough ?? 1, normalScale: new THREE.Vector2(o.ns ?? 1, o.ns ?? 1) });
  const M = {
    stone: pbr('sandstone_blocks_08', 9, { rough: .95, ns: .6, color: 0xfbf4ea }),                        // M01 warm pale limestone, ~0.6 x 1.2 m panels
    coping: pbr('sandstone_blocks_08', 9, { rough: .9, ns: .4, color: 0xf6efe4 }),          // M01 fine copings / slab edges (larger scale, fewer joints)
    pave: pbr('sandstone_blocks_08', 9, { rough: .95, ns: .45, color: 0xf6efe4 }),         // M09 terrace paving
    rubble: pbr('yellow_stone_wall', 2.4, { rough: 1, ns: 1.4 }),                           // M02 rough desert stone
    timber: pbr('oak_wood_planks', 1.6, { rough: .6, ns: .6, color: 0xc4ae9a }),                             // M05 dark timber
    ground: pbr('dense_sand', 2.4, { rough: 1, ns: 1.3, color: 0xf2eadc }),                                      // M10 compacted desert aggregate
    bronze: new THREE.MeshStandardMaterial({ color: 0x5f4f3f, metalness: .7, roughness: .38 }),   // M03 window caps / mullions
    post: new THREE.MeshStandardMaterial({ color: 0x3b3631, metalness: .5, roughness: .5 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x8a9895, metalness: 0, roughness: .02, transparent: true, opacity: .22, envMapIntensity: 1.8, depthWrite: false }),
    rail: new THREE.MeshPhysicalMaterial({ color: 0xc9d3d0, metalness: 0, roughness: .03, transparent: true, opacity: .16, envMapIntensity: 1.4, depthWrite: false }),
    inWall: new THREE.MeshStandardMaterial({ color: 0xe2c9a6, roughness: .9, emissive: 0xffb86e, emissiveIntensity: .2 }),
    inFloor: new THREE.MeshStandardMaterial({ color: 0x9c7752, roughness: .5, emissive: 0xc07a3a, emissiveIntensity: .1 }),
    inCeil: new THREE.MeshStandardMaterial({ color: 0xead8bc, roughness: .9, emissive: 0xffc17a, emissiveIntensity: .32 }),
    spot: new THREE.MeshBasicMaterial({ color: 0xfff0d2 }),
    curtain: new THREE.MeshStandardMaterial({ color: 0xefe2cc, roughness: .95, transparent: true, opacity: .86, emissive: 0xffcf94, emissiveIntensity: .3, side: THREE.DoubleSide }),
    inSofa: new THREE.MeshStandardMaterial({ color: 0xd9c8ae, roughness: .95, emissive: 0xffbe7a, emissiveIntensity: .14 }),
    inDark: new THREE.MeshStandardMaterial({ color: 0x6b513c, roughness: .6, emissive: 0x6b4a2c, emissiveIntensity: .15 }),
    cushion: new THREE.MeshStandardMaterial({ color: 0xdcd2c2, roughness: .97 }),           // M11 oatmeal upholstery
    rug: new THREE.MeshStandardMaterial({ color: 0xc9bca6, roughness: 1 }),
    soil: new THREE.MeshStandardMaterial({ color: 0x7a6650, roughness: 1 }),
    pot: new THREE.MeshStandardMaterial({ color: 0xd2c4ab, roughness: .9 }),
    bark: new THREE.MeshStandardMaterial({ color: 0x6d6151, roughness: 1 }),
    door: pbr('oak_wood_planks', 1.2, { rough: .55, ns: .5, color: 0xb08a68 }),
    glassLite: new THREE.MeshStandardMaterial({ color: 0x6a6860, metalness: .35, roughness: .1, envMapIntensity: 1.4, emissive: 0x4a2c12, emissiveIntensity: .45 }),
  };

  function panelGrid(m, pw, ph, tile, dark = .3) {      // panel joints + per-panel tone (<8 %) drawn from the metre UVs
    m.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
      { vec2 cell = vMapUv * ${tile.toFixed(2)} / vec2(${pw.toFixed(3)}, ${ph.toFixed(3)}); vec2 id = floor(cell), f = fract(cell), fw = fwidth(cell);
        vec2 jw = vec2(${(0.009 / pw).toFixed(4)}, ${(0.009 / ph).toFixed(4)}) + fw * .6;
        float j = max(1.0 - smoothstep(0.0, jw.x, min(f.x, 1.0 - f.x) * 2.0), 1.0 - smoothstep(0.0, jw.y, min(f.y, 1.0 - f.y) * 2.0));
        float h = fract(sin(dot(id, vec2(12.9898, 78.233))) * 43758.5453);
        diffuseColor.rgb *= (0.955 + h * 0.08) * (1.0 - j * ${dark.toFixed(2)}); }`); }; m.customProgramCacheKey = () => 'grid' + pw + ph; }
  panelGrid(M.stone, 1.2, .6, 9); panelGrid(M.pave, .9, .6, 9, .22);
  { const c = document.createElement('canvas'); c.width = 128; c.height = 256; const g = c.getContext('2d'), gr = g.createLinearGradient(0, 256, 0, 0);
    gr.addColorStop(0, '#8a6544'); gr.addColorStop(.35, '#c99d6c'); gr.addColorStop(.8, '#f2cf9c'); gr.addColorStop(1, '#ffe2b4'); g.fillStyle = gr; g.fillRect(0, 0, 128, 256);
    g.fillStyle = 'rgba(80,55,35,.25)'; g.fillRect(70, 60, 40, 120); g.fillStyle = 'rgba(255,235,200,.35)'; g.fillRect(10, 40, 30, 70);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / 7, 1 / 3.9); t.offset.set(0, -.45 / 3.9);
    M.inWall.map = t; M.inWall.emissiveMap = t; M.inWall.color.set(0xffffff); M.inWall.emissive.set(0xffffff); M.inWall.emissiveIntensity = .34; }

  /* ---------------- geometry bins ---------------- */
  const bins = new Map();
  const add = (m, g) => { g = g.index ? g.toNonIndexed() : g; if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    if (m === M.leaf || m === M.shrub || m === M.lav) { /* keep color */ } else g.deleteAttribute('color');
    (bins.get(m) || bins.set(m, []).get(m)).push(g); };
  function worldUV(g) {            // metre UVs from world position, axis picked by the face normal: panels and joints run continuously across boxes
    const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) { const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
      if (ay >= ax && ay >= az) uv.setXY(i, p.getX(i), p.getZ(i)); else if (ax >= az) uv.setXY(i, p.getZ(i), p.getY(i)); else uv.setXY(i, p.getX(i), p.getY(i)); }
    return g; }
  function box(m, x0, x1, y0, y1, z0, z1) { if (x1 - x0 < 1e-3 || y1 - y0 < 1e-3 || z1 - z0 < 1e-3) return;
    add(m, worldUV(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2))); }
  let SEED = 7; const R = () => (SEED = (SEED * 16807) % 2147483647) / 2147483647;

  // a facade frame: u runs along the facade (left → right seen from outside), d is outward depth from the facade plane
  function F(ox, oz, dir) {
    const U = [[1, 0], [0, -1], [-1, 0], [0, 1]][dir], N = [[0, 1], [1, 0], [0, -1], [-1, 0]][dir];
    const P = (u, d) => [ox + U[0] * u + N[0] * d, oz + U[1] * u + N[1] * d];
    return { P, U, N, b(m, u0, u1, y0, y1, d0, d1) { const a = P(u0, d0), c = P(u1, d1); box(m, Math.min(a[0], c[0]), Math.max(a[0], c[0]), y0, y1, Math.min(a[1], c[1]), Math.max(a[1], c[1])); } };
  }
  // glazed opening: bronze frame and mullions, glass, and a lit room behind it (back wall, floor, ceiling spots, sheer curtains, furniture)
  function win(f, u0, u1, y0, y1, d = -.25, o = {}) {
    const bay = o.bay || 1.5, n = Math.max(1, Math.round((u1 - u0) / bay)), w = (u1 - u0) / n, deep = o.deep || 4.6;
    f.b(LITE ? M.glassLite : M.glass, u0, u1, y0, y1, d - .01, d + .01);
    for (let i = 0; i <= n; i++) { const u = u0 + i * w; f.b(M.bronze, u - .035, u + .035, y0, y1, d - .06, d + .04); }
    f.b(M.bronze, u0, u1, y1 - .07, y1, d - .06, d + .04); f.b(M.bronze, u0, u1, y0, y0 + .06, d - .06, d + .04);
    if (o.transom) f.b(M.bronze, u0, u1, o.transom - .03, o.transom + .03, d - .05, d + .03);
    if (LITE) return;
    // room
    f.b(M.inWall, u0 - .3, u1 + .3, y0 - .05, y1 + .35, d - deep - .1, d - deep);
    f.b(M.inFloor, u0 - .3, u1 + .3, y0 - .1, y0 - .02, d - deep, d - .02);
    f.b(M.inCeil, u0 - .3, u1 + .3, y1 + .3, y1 + .38, d - deep, d - .02);
    for (const s of [u0 - .3, u1 + .2]) f.b(M.inWall, s, s + .1, y0 - .05, y1 + .35, d - deep, d - .02);
    for (let u = u0 + .8; u < u1 - .4; u += 1.6) for (const dd of [-1.4, -3.2]) f.b(M.spot, u - .09, u + .09, y1 + .28, y1 + .3, d + dd - .09, d + dd + .09);
    // sheer curtains gathered at some mullions (folded strips)
    for (let i = 0; i <= n; i++) { if (R() < .45) continue; const uc = u0 + i * w, cw = .5 + R() * .5;
      for (let k = 0; k < 7; k++) { const a = uc - cw / 2 + k * cw / 7; f.b(M.curtain, a, a + cw / 7 + .01, y0 + .02, y1 + .25, d - .32 - (k % 2) * .06, d - .3 - (k % 2) * .06); } }
    // furniture silhouettes in the room
    if (y1 - y0 > 2.2 && !o.empty) for (let u = u0 + 1.2; u < u1 - 1.4; u += 3.4 + R() * 1.5) {
      if (R() < .6) { f.b(M.inSofa, u, u + 2.2, y0, y0 + .42, d - 3.4, d - 2.5); f.b(M.inSofa, u, u + 2.2, y0, y0 + .8, d - 3.6, d - 3.35); f.b(M.inDark, u + .5, u + 1.5, y0, y0 + .38, d - 2.1, d - 1.5); }
      else { f.b(M.inDark, u, u + 1.8, y0 + .72, y0 + .77, d - 3, d - 2); for (const s of [0, 1.6]) f.b(M.inDark, u + s, u + s + .2, y0, y0 + .72, d - 2.8, d - 2.2);
        f.b(M.inSofa, u + .5, u + .95, y0 + .55, y0 + .62, d - 1.3, d - 1.1); }
      if (R() < .5) { f.b(M.inDark, u + 2.6, u + 2.64, y0, y0 + 1.5, d - 4.3, d - 4.26); f.b(M.inCeil, u + 2.4, u + 2.85, y0 + 1.5, y0 + 1.85, d - 4.45, d - 4.1); }
    }
  }
  // vertical timber fins (louvres) across an opening; 40 x 120 mm fins at ~150 mm
  const louvres = (f, u0, u1, y0, y1, d = .05, gap = .17) => { for (let u = u0 + .02; u < u1 - .03; u += gap) f.b(M.timber, u, u + .045, y0, y1, d - .07, d + .07); f.b(M.bronze, u0, u1, y1 - .05, y1, d - .09, d + .09); };
  // glass balustrade with a slim bronze cap
  const rail = (f, u0, u1, y, d) => { f.b(M.rail, u0, u1, y, y + 1.05, d - .012, d + .012); f.b(M.bronze, u0, u1, y + 1.05, y + 1.09, d - .035, d + .035); for (let u = u0; u <= u1 + .01; u += Math.max(1.2, (u1 - u0) / Math.ceil((u1 - u0) / 1.6))) f.b(M.bronze, u - .025, u + .025, y, y + .06, d - .04, d + .04); };
  // timber pergola: beams running out from the facade, slats (40 x 80 mm, ~120 mm gap) running along it, optional posts
  function pergola(f, u0, u1, y, d0, d1, posts = true) {
    for (let u = u0; u <= u1 + .01; u += (u1 - u0) / Math.max(1, Math.round((u1 - u0) / 2.4))) f.b(M.timber, u - .07, u + .07, y - .28, y, d0, d1);
    for (let d = d0 + .1; d < d1 - .05; d += .15) f.b(M.timber, u0 - .1, u1 + .1, y, y + .09, d, d + .045);
    f.b(M.timber, u0 - .1, u1 + .1, y - .28, y, d1 - .14, d1);
    if (posts) for (let u = u0; u <= u1 + .01; u += (u1 - u0) / Math.max(1, Math.round((u1 - u0) / 4.8))) f.b(M.post, u - .06, u + .06, .45, y - .28, d1 - .13, d1 - .01);
  }
  // stone wall run along a facade between u0 and u1
  const wall = (f, u0, u1, y0, y1, m = M.stone, t = .35) => f.b(m, u0, u1, y0, y1, -t, 0);
  // parapet + coping around a rectangular roof
  function roof(x0, x1, z0, z1, y, h = .5) {
    box(M.stone, x0, x1, y - .4, y, z0, z1);
    for (const [a, b, c, d] of [[x0, x1, z0, z0 + .3], [x0, x1, z1 - .3, z1], [x0, x0 + .3, z0, z1], [x1 - .3, x1, z0, z1]]) { box(M.stone, a, b, y, y + h, c, d); box(M.coping, a - .04, b + .04, y + h, y + h + .06, c - .04, d + .04); }
    box(M.ground, x0 + .3, x1 - .3, y, y + .03, z0 + .3, z1 - .3);
  }
  const slabEdge = (x0, x1, z0, z1, y, t = .4) => box(M.coping, x0, x1, y - t, y, z0, z1);

  /* ---------------- planting: real olive / shrub silhouettes from leaf cards ---------------- */
  function leafTex(pal, n, len, wid, dots) {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    g.strokeStyle = 'rgba(90,75,60,.9)'; g.lineWidth = 1.2; for (let i = 0; i < 10; i++) { g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + (Math.random() - .5) * 220, 128 + (Math.random() - .5) * 220); g.stroke(); }
    for (let i = 0; i < n; i++) { const r = Math.sqrt(Math.random()) * 112, a = Math.random() * 6.283, x = 128 + Math.cos(a) * r, y = 128 + Math.sin(a) * r;
      g.fillStyle = pal[(Math.random() * pal.length) | 0]; g.beginPath(); g.ellipse(x, y, len * (.7 + Math.random() * .6), wid, Math.random() * 6.283, 0, 6.283); g.fill(); }
    if (dots) for (let i = 0; i < 70; i++) { const r = Math.sqrt(Math.random()) * 100, a = Math.random() * 6.283; g.fillStyle = dots[(Math.random() * dots.length) | 0]; g.beginPath(); g.ellipse(128 + Math.cos(a) * r, 128 + Math.sin(a) * r * .6 - 20, 2.4, 5, 0, 0, 6.283); g.fill(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  }
  M.leaf = new THREE.MeshStandardMaterial({ map: leafTex(['#7d8763', '#8d9673', '#9ea683', '#6c7655', '#b0b597', '#c2c5ab'], 700, 6.5, 1.7), alphaTest: .5, side: THREE.DoubleSide, roughness: .85, vertexColors: true });
  M.shrub = new THREE.MeshStandardMaterial({ map: leafTex(['#7f8c68', '#909c79', '#a3ad8c', '#6f7b5a', '#b4bb9d'], 1000, 5, 1.5), alphaTest: .5, side: THREE.DoubleSide, roughness: .9, vertexColors: true });
  M.lav = new THREE.MeshStandardMaterial({ map: leafTex(['#7e8b72', '#93a08a', '#a8b09c', '#6d7a63'], 900, 6, 1.6, ['#8f7fae', '#a495c2', '#7a6c99']), alphaTest: .5, side: THREE.DoubleSide, roughness: .9, vertexColors: true });
  function cards(m, cx, cy, cz, rx, ry, rz, n, s) {
    const list = [];
    if (LITE) { n = Math.ceil(n * .4); s *= 1.3; }
    for (let i = 0; i < n; i++) { let x, y, z; do { x = R() * 2 - 1; y = R() * 2 - 1; z = R() * 2 - 1; } while (x * x + y * y + z * z > 1);
      const sz = s * (.7 + R() * .6), g = new THREE.PlaneGeometry(sz, sz); g.rotateX(R() * 6.28); g.rotateY(R() * 6.28); g.rotateZ(R() * 6.28);
      const px = cx + x * rx, py = cy + y * ry, pz = cz + z * rz; g.translate(px, py, pz);
      // normals bent outward from the clump centre: reads as a volume, not as flat cards
      const nv = new THREE.Vector3(x, y * .8 + .35, z).normalize(), nn = g.attributes.normal; for (let k = 0; k < nn.count; k++) nn.setXYZ(k, nv.x, nv.y, nv.z);
      const sh = .72 + .28 * (y * .5 + .5) + (R() - .5) * .12, col = new Float32Array(nn.count * 3).fill(sh); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); list.push(g); }
    for (const g of list) add(m, g);
  }
  function olive(x, z, h = 4.2, y0 = 0) {        // P03 olive: twisted grey trunk splitting into 3-4 limbs, grey-green clumped crown
    const s = h / 4.2, lean = R() * 6.28, base = new THREE.Vector3(x, y0, z);
    const fork = base.clone().add(new THREE.Vector3(Math.cos(lean) * .35 * s, 1.25 * s, Math.sin(lean) * .35 * s));
    add(M.bark, worldUV(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([base, base.clone().add(new THREE.Vector3(.12 * s, .6 * s, -.08 * s)), fork]), 8, .16 * s, 7)));
    const nb = 3 + (R() < .5 ? 1 : 0);
    for (let i = 0; i < nb; i++) { const a = lean + i / nb * 6.28 + R() * .6, rr = (.9 + R() * .7) * s, tip = fork.clone().add(new THREE.Vector3(Math.cos(a) * rr, (1.1 + R() * .9) * s, Math.sin(a) * rr));
      const mid = fork.clone().lerp(tip, .5).add(new THREE.Vector3((R() - .5) * .3, .1, (R() - .5) * .3));
      add(M.bark, worldUV(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([fork, mid, tip]), 6, .07 * s, 6)));
      cards(M.leaf, tip.x, tip.y + .25 * s, tip.z, 1.1 * s, .75 * s, 1.1 * s, 120, .6 * s); }
    cards(M.leaf, fork.x, fork.y + 1.9 * s, fork.z, 1.4 * s, .7 * s, 1.4 * s, 90, .6 * s);
  }
  const shrub = (x, z, r = .45, y0 = .02, lav = false) => cards(lav ? M.lav : M.shrub, x, y0 + r * .55, z, r, r * .6, r, Math.round(16 + r * 30), r * .62);
  function bed(x0, x1, z0, z1, y0 = .02, dens = 1.2) { if (LITE) dens *= .55; for (let x = x0; x < x1; x += .75 / dens) for (let z = z0; z < z1; z += .75 / dens) if (R() < .8) shrub(x + (R() - .5) * .4, z + (R() - .5) * .4, .3 + R() * .3, y0, R() < .3);
  }
  function pot(x, z, y0, tree = true) {      // square stone planter with a small olive / shrub
    add(M.pot, worldUV(new THREE.CylinderGeometry(.42, .34, .75, 16).translate(x, y0 + .375, z))); box(M.soil, x - .3, x + .3, y0 + .7, y0 + .73, z - .3, z + .3);
    if (tree) olive(x, z, 2.1 + R() * .5, y0 + .7); else shrub(x, z, .5, y0 + .7);
  }
  // boulders in the dry beds
  function rocks(x0, x1, z0, z1, n) { if (LITE) return; for (let i = 0; i < n; i++) { const r = .15 + R() * .3, g = new THREE.DodecahedronGeometry(r, 0); g.scale(1, .6, 1).rotateY(R() * 6); g.translate(x0 + R() * (x1 - x0), r * .3, z0 + R() * (z1 - z0)); add(M.pot, worldUV(g)); } }

  /* ---------------- outdoor furniture (atlas F02 lounge, F01 bench, dining) ---------------- */
  const rb = (m, w, h, d, x, y, z, r = .06, ry = 0) => { const g = new RoundedBoxGeometry(w, h, d, 1, r); g.rotateY(ry); g.translate(x, y, z); add(m, g); };
  function sofa(x, z, len, ry, y0) {    // timber frame, oatmeal cushions
    const c = Math.cos(ry), s = Math.sin(ry), at = (u, v) => [x + u * c + v * s, z - u * s + v * c];
    let [a, b] = at(0, 0); rb(M.timber, len, .22, .92, a, y0 + .17, b, .03, ry);
    for (let i = 0; i < Math.round(len / .8); i++) { const u = -len / 2 + (i + .5) * len / Math.round(len / .8); [a, b] = at(u, .06); rb(M.cushion, len / Math.round(len / .8) - .03, .18, .78, a, y0 + .36, b, .07, ry); [a, b] = at(u, -.36); rb(M.cushion, len / Math.round(len / .8) - .04, .5, .2, a, y0 + .62, b, .08, ry); }
    for (const e of [-1, 1]) { [a, b] = at(e * (len / 2 + .07), 0); rb(M.timber, .14, .5, .92, a, y0 + .3, b, .03, ry); }
  }
  function chair(x, z, ry, y0) { const c = Math.cos(ry), s = Math.sin(ry); rb(M.cushion, .78, .16, .76, x, y0 + .36, z, .07, ry); rb(M.cushion, .78, .48, .18, x - .32 * s, y0 + .6, z - .32 * c, .08, ry); rb(M.timber, .86, .26, .86, x, y0 + .15, z, .03, ry); }
  function lounge(x, z, y0, ry = 0) {
    rb(M.rug, 4.6, .02, 3.6, x, y0 + .01, z, .005, ry); sofa(x, z - 1.15, 2.6, ry, y0);
    const c = Math.cos(ry), s = Math.sin(ry); chair(x - 1.6 * c + .3 * s, z + 1.6 * s + .3 * c, ry + 1.2, y0); chair(x + 1.6 * c + .3 * s, z - 1.6 * s + .3 * c, ry - 1.2, y0);
    rb(M.timber, 1.2, .06, .7, x + .1 * s, y0 + .38, z + .1 * c, .02, ry); rb(M.post, 1.1, .34, .6, x + .1 * s, y0 + .18, z + .1 * c, .02, ry);
    add(M.pot, worldUV(new THREE.CylinderGeometry(.09, .07, .16, 10).translate(x + .1 * s, y0 + .49, z + .1 * c)));
  }
  function dining(x, z, y0, ry = 0) {
    const c = Math.cos(ry), s = Math.sin(ry); rb(M.timber, 2.4, .07, 1, x, y0 + .74, z, .02, ry);
    for (const [u, v] of [[-1.05, -.38], [1.05, -.38], [-1.05, .38], [1.05, .38]]) rb(M.post, .07, .72, .07, x + u * c + v * s, y0 + .36, z - u * s + v * c, .01, ry);
    for (const u of [-.75, 0, .75]) for (const e of [-1, 1]) { const v = e * .82, px = x + u * c + v * s, pz = z - u * s + v * c; rb(M.cushion, .5, .08, .5, px, y0 + .46, pz, .03, ry); rb(M.timber, .5, .45, .06, px + e * .25 * s, y0 + .7, pz + e * .25 * c, .02, ry); rb(M.post, .46, .42, .46, px, y0 + .21, pz, .02, ry); }
  }
  function steps(x0, x1, z, y0, n = 3, dz = .38, dir = 1) { for (let i = 0; i < n; i++) { const yt = y0 - i * y0 / n; box(M.pave, x0 - i * .0, x1, 0, yt, Math.min(z + i * dz * dir, z + (i + 1) * dz * dir), Math.max(z + i * dz * dir, z + (i + 1) * dz * dir)); } }

  /* ================== Z17-A · golf courtyard villa: 2-storey L, shaded courtyard, deep timber terrace ================== */
  const YP = .45, G0 = YP, G1 = 3.95, F0 = 4.35, F1 = 7.65;
  function villaA(ox, oz) {
    const X = x => ox + x, Z = z => oz + z;
    box(M.pave, X(-1.5), X(22.5), 0, YP, Z(-.5), Z(17.5));                     // plinth / terrace
    steps(X(-1.5), X(13.5), Z(17.5), YP, 3, .4);
    // ground floor: back wing (x 0-14, z 0-8) + front wing (x 14-22, z 0-17)
    slabEdge(X(0), X(14), Z(0), Z(8), F0); slabEdge(X(14), X(22), Z(0), Z(17), F0);
    let f = F(X(0), Z(8), 0);                                                         // back wing front (into the courtyard)
    wall(f, 0, 3, G0, F0, M.rubble, .4); win(f, 3, 8.6, G0, G1, -.25, { transom: 3.2 }); wall(f, 8.6, 9.2, G0, G1); win(f, 9.2, 13.4, G0, G1, -.25, { transom: 3.2 }); wall(f, 13.4, 14, G0, G1);
    f.b(M.coping, 3, 13.4, G1, F0 - .4, -.35, 0);
    pergola(f, 3, 13.4, 3.75, 0, 2.6);
    f = F(X(0), Z(0), 3);                                                             // left end, ground + first floor
    wall(f, 0, 2, G0, F1, M.rubble, .4); win(f, 2, 6.2, G0, G1, -.25); wall(f, 6.2, 8, G0, G1, M.rubble, .4); f.b(M.stone, 2, 6.2, G1, F1 + .5, -.4, 0);
    win(f, 2.8, 5.4, F0 + .3, F1 - .5, -.25, { empty: true });
    f = F(X(14), Z(17), 3);                                                           // front wing, courtyard side (faces -x)
    wall(f, 0, .8, G0, F1); win(f, .8, 7.6, G0, G1, -.25, { transom: 3.2 }); wall(f, 7.6, 9, G0, F1);
    win(f, .8, 7.6, F0 + .1, F1 - .3, -.6); louvres(f, .8, 4.6, F0 + .1, F1 - .3, -.1); f.b(M.stone, .8, 7.6, F1 - .3, F1, -.35, 0); f.b(M.stone, .8, 7.6, F0 - .4, F0 + .1, -.35, 0);
    f = F(X(14), Z(17), 0);                                                           // front wing, front face
    wall(f, 0, .7, G0, F1 + .5); win(f, .7, 5.4, G0, G1, -.25, { transom: 3.2 }); wall(f, 5.4, 5.9, G0, G1); f.b(M.door, 5.9, 7.4, G0, 3.5, -.5, -.42); f.b(M.stone, 5.9, 7.4, 3.5, G1, -.35, 0); wall(f, 7.4, 8, G0, F1 + .5);
    f.b(M.stone, .7, 7.4, G1, F0 + .2, -.35, .1);                                     // first floor: deep stone frame around a recessed window
    f.b(M.stone, -.05, .9, F0, F1 + .5, -.35, .55); f.b(M.stone, 7.2, 8.05, F0, F1 + .5, -.35, .55); f.b(M.stone, -.05, 8.05, F1, F1 + .5, -.35, .55); f.b(M.stone, -.05, 8.05, F0 - .1, F0 + .15, -.35, .55);
    win(f, .9, 7.2, F0 + .15, F1, -.7); louvres(f, 4.8, 7.2, F0 + .15, F1, -.2);
    // first floor of the back wing, set back to z 6.2 behind a terrace with a glass balustrade and planters
    f = F(X(3), Z(6.2), 0); win(f, .6, 10.4, F0, F1 - .1, -.25); wall(f, 0, .6, F0, F1); wall(f, 10.4, 11, F0, F1); f.b(M.coping, 0, 11, F1 - .1, F1, -.35, 0);
    pergola(F(X(3), Z(6.2), 0), .4, 10.6, F1 - .15, 0, 1.75, false);
    rail(F(X(3), Z(8), 0), 0, 11, F0, -.1); for (const x of [4.2, 9.5, 12.8]) pot(X(x), Z(7.2), F0, R() < .7);
    roof(X(0), X(3), Z(0), Z(8), F1 + 1, .3); box(M.rubble, X(-.02), X(3), G0, F1 + 1, Z(7.6), Z(8.02));
    roof(X(3), X(14), Z(0), Z(6.2), F1, .45); roof(X(14), X(22), Z(0), Z(17), F1 + .5, .45);
    box(M.stone, X(14), X(22), G0, F1 + .5, Z(0), Z(.35)); box(M.stone, X(21.65), X(22), G0, F1 + .5, Z(0), Z(17)); box(M.stone, X(0), X(14), G0, F1, Z(0), Z(.35));
    // courtyard: lounge, dining, olives, planted beds
    lounge(X(6.5), Z(12.8), YP, 0); dining(X(11.6), Z(15.6), YP, Math.PI / 2);
    olive(X(8.8), Z(10.6), 4.4, YP); olive(X(-.3), Z(15.8), 4.8, 0);
    bed(X(-1.3), X(2.2), Z(9), Z(15), YP + .02, 1.1); bed(X(-4), X(-1.5), Z(8), Z(18.5), .02, 1); bed(X(2), X(13), Z(18.8), Z(20), .02, 1.2);
    for (const x of [1.5, 3.8]) pot(X(x), Z(16.6), YP, false);
    rocks(X(-4), X(13), Z(18.6), Z(20.5), 10);
  }

  /* ================== Z17-B · linear terrace villa: projecting upper box, recessed glass, pergola ================== */
  function villaB(ox, oz) {
    const X = x => ox + x, Z = z => oz + z;
    box(M.pave, X(-1.5), X(26.5), 0, YP, Z(-.5), Z(18));
    steps(X(-1.5), X(18), Z(18), YP, 3, .4);
    // ground floor (front at z 12.5)
    let f = F(X(0), Z(12.5), 0);
    wall(f, 0, 1.1, G0, F0); louvres(f, 1.1, 4.4, G0, G1, .05); win(f, 1.1, 17.2, G0, G1, -.3, { transom: 3.25 }); wall(f, 17.2, 18.2, G0, F0);
    f.b(M.stone, 18.2, 23, G0, F0, -.35, .9); f.b(M.door, 19.6, 21.4, G0, 3.55, .9, .98); f.b(M.coping, 19.4, 21.6, 3.55, 3.7, .9, 1.05);   // stone portal, tall timber door
    f.b(M.stone, 18.2, 19.6, G0, 3.55, .9, 1.25); f.b(M.stone, 21.4, 23, G0, 3.55, .9, 1.25); f.b(M.stone, 18.2, 23, 3.55, F0, .9, 1.25);
    wall(f, 23, 26, G0, F0, M.rubble, .4);
    box(M.stone, X(0), X(26), G0, F0, Z(0), Z(.35)); box(M.stone, X(-.0), X(.35), G0, F0, Z(0), Z(12.5)); box(M.stone, X(25.65), X(26), G0, F0, Z(0), Z(12.5));
    // upper box (z 0-16), projecting 3.5 m over the terrace: thick stone frame around a deep recessed balcony
    box(M.coping, X(0), X(26), F0 - .5, F0, Z(0), Z(16)); box(M.stone, X(-.05), X(26.05), F1, F1 + .6, Z(0), Z(16.05));
    f = F(X(0), Z(16), 0);
    f.b(M.stone, -.05, 1, F0 - .5, F1 + .6, -1, .05); f.b(M.stone, 19, 26.05, F0 - .5, F1 + .6, -16, .05);
    win(f, 1, 19, F0, F1, -2.8, { bay: 1.6 }); rail(f, 1, 19, F0, -.2);
    pergola(f, 1, 19, F1 - .1, -2.8, -.05, false);
    for (const u of [2.4, 10.2, 17.6]) pot(X(u), Z(15.3), F0, true);
    f = F(X(0), Z(0), 3); f.b(M.stone, 0, 16, F0 - .5, F1 + .6, -.4, 0); win(f, 6, 9, F0 + .3, F1 - .4, -.25, { empty: true });
    f = F(X(26), Z(16), 1); f.b(M.stone, 0, 16, F0 - .5, F1 + .6, -.4, 0);
    roof(X(0), X(26), Z(0), Z(16), F1 + .6, .35);
    // terrace: lounge + dining under the overhang, olives and dry beds
    lounge(X(6), Z(15.3), YP, 0); dining(X(14), Z(15.4), YP, 0);
    olive(X(-.2), Z(16.6), 4.4, YP); olive(X(23.6), Z(16.2), 3.6, YP);
    for (const x of [2.2, 10.4]) pot(X(x), Z(17.3), YP, false);
    bed(X(-4.2), X(-1.6), Z(9), Z(19.5), .02, 1.1); bed(X(18.6), X(26.5), Z(18.1), Z(19.6), .02, 1.2); bed(X(23.2), X(26.4), Z(13.6), Z(17.8), YP + .02, 1.2);
    rocks(X(-4), X(26), Z(19), Z(20.8), 12);
  }

  /* ================== Z17-C · patio garden villa: one storey around a private court, flat roof, low stone walls ================== */
  function villaC(ox, oz) {
    const X = x => ox + x, Z = z => oz + z, H = 4.0, H2 = 4.9;
    box(M.pave, X(-1), X(25), 0, YP, Z(-1), Z(23.5)); steps(X(4.2), X(11.5), Z(23.5), YP, 3, .45);
    box(M.pave, X(4.2), X(11.5), 0, .02, Z(24.85), Z(29));                            // entry path
    // front face (z 22)
    let f = F(X(0), Z(22), 0);
    wall(f, 0, 4.4, G0, H2, M.rubble, .4); wall(f, 4.4, 5.2, G0, H2); f.b(M.door, 5.2, 6.9, G0, 3.4, -.7, -.62); f.b(M.stone, 5.2, 6.9, 3.4, H2, -.35, 0);
    for (const s of [5.0, 6.9]) f.b(M.stone, s, s + .2, G0, 3.4, -.7, 0);
    wall(f, 6.9, 7.6, G0, H2); win(f, 7.6, 13.6, G0, 3.5, -.3, { transom: 3.0 }); louvres(f, 11.6, 13.6, G0, 3.5, .05); f.b(M.stone, 7.6, 13.6, 3.5, H, -.35, 0);
    wall(f, 13.6, 15.2, G0, H, M.rubble, .4);
    for (let i = 0; i < 4; i++) { const u = 15.2 + i * 2.2; wall(f, u, u + 1.4, G0, H); win(f, u + 1.4, u + 2.2, G0 + .2, 3.6, -.3, { empty: true }); louvres(f, u + 1.4, u + 2.2, G0 + .2, 3.6, -.05, .14); }
    f.b(M.stone, 15.2, 24, 3.6, H, -.35, 0);
    pergola(f, 4.3, 11.2, 3.45, 0, 2.6);
    // left face (x 0)
    f = F(X(0), Z(0), 3); wall(f, 0, 9, G0, H); wall(f, 9, 14.5, G0, H, M.rubble, .4); win(f, 14.5, 18.5, G0, 3.4, -.3); wall(f, 18.5, 22, G0, H2); f.b(M.stone, 14.5, 18.5, 3.4, H2, -.35, 0);
    f = F(X(24), Z(22), 1); wall(f, 0, 22, G0, H);
    f = F(X(24), Z(0), 2); wall(f, 0, 24, G0, H);
    // court (x 8-17, z 5-13): glazed inner faces, pergola walk, olive in a dry garden
    f = F(X(8), Z(13), 2); win(f, .6, 8.4, G0, 3.4, -.3); wall(f, 0, .6, G0, H); wall(f, 8.4, 9, G0, H); f.b(M.stone, 0, 9, 3.4, H, -.35, 0);
    f = F(X(17), Z(5), 0); win(f, .6, 8.4, G0, 3.4, -.3); wall(f, 0, .6, G0, H); wall(f, 8.4, 9, G0, H); f.b(M.stone, 0, 9, 3.4, H, -.35, 0);
    f = F(X(8), Z(5), 1); wall(f, 0, 8, G0, H); f = F(X(17), Z(13), 3); win(f, .6, 7.4, G0, 3.4, -.3); wall(f, 0, .6, G0, H); wall(f, 7.4, 8, G0, H); f.b(M.stone, 0, 8, 3.4, H, -.35, 0);
    pergola(F(X(8), Z(13), 2), .4, 8.6, 3.4, 0, 2.2, true);
    olive(X(12.4), Z(8.4), 4.6, YP); bed(X(9.4), X(15.6), Z(6), Z(7.5), YP + .02, 1.2); for (const x of [9.5, 15.5]) pot(X(x), Z(10), YP, false);
    // roofs: two heights, parapets, a skylight
    roof(X(0), X(9), Z(13), Z(22), H2, .3); roof(X(9), X(24), Z(13), Z(22), H, .45); roof(X(0), X(24), Z(0), Z(5), H, .45); roof(X(0), X(8), Z(5), Z(13), H, .45); roof(X(17), X(24), Z(5), Z(13), H, .45);
    box(M.stone, X(18.5), X(20.5), H, H + .5, Z(1.2), Z(3.2)); box(M.glass, X(18.7), X(20.3), H + .5, H + .52, Z(1.4), Z(3));
    // front garden
    olive(X(-2.4), Z(24.6), 4.2, 0); olive(X(14.8), Z(25.2), 3.2, 0);
    bed(X(-1), X(4.1), Z(23.6), Z(26.5), .02, 1.2); bed(X(11.7), X(24.5), Z(23.6), Z(25.6), .02, 1.1); bed(X(-4), X(-1.2), Z(10), Z(23), .02, 1);
    rocks(X(-4), X(25), Z(25), Z(27.5), 12);
  }


  const BUILD = { A: villaA, B: villaB, C: villaC }, cache = {};
  let LITE = false;
  // lite = the far detail ring: same massing, materials, pergolas and louvres; no interiors, fewer leaf cards
  function build(kind, lite = false) {
    const key = kind + (lite ? 'L' : '');
    if (cache[key]) return cache[key];
    bins.clear(); SEED = { A: 7, B: 11, C: 23 }[kind] || 5; LITE = lite; BUILD[kind](0, 0); LITE = false;
    const parts = []; const bb = new THREE.Box3();
    for (const [m, list] of bins) { const g = mergeGeometries(list, false); if (!g) continue; g.computeBoundingBox(); if (m !== M.leaf && m !== M.shrub && m !== M.lav) bb.union(g.boundingBox); parts.push([m, g]); }
    const c = bb.getCenter(new THREE.Vector3());
    for (const [, g] of parts) { g.translate(-c.x, 0, -c.z); g.computeBoundingSphere(); }
    bins.clear();
    let tris = 0; for (const [, g] of parts) tris += g.attributes.position.count / 3;
    return (cache[key] = { tris: Math.round(tris), parts, size: [bb.max.x - bb.min.x, bb.max.z - bb.min.z], h: bb.max.y, c: [c.x, c.z] });
  }
  // which parts cast shadows: not glass, interiors, lights or curtains
  const noCast = new Set([M.glass, M.rail, M.spot, M.curtain, M.inWall, M.inFloor, M.inCeil, M.inSofa, M.inDark]);
  const casts = m => !noCast.has(m);
  return (KIT = { M, build, casts, kinds: Object.keys(BUILD) });
}
