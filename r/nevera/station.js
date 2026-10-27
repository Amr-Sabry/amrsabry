// October Gardens high-speed rail interchange (محطة حدائق أكتوبر التبادلية), modelled in code from the January 2025 drone photos.
// Units are metres. x runs along the tracks, z across them (z < 0 = west building), y is up. Origin = centre of the track corridor.
// buildStation(THREE, {detail}) returns {group, anchors}: anchors are named points for labels.
// Dimensions are read off the photos and are approximate.

export function buildStation(THREE, opts = {}) {
  const detail = opts.detail !== false;
  const G = new THREE.Group();
  const anchors = [];
  const box = (w, h, d, mat, x, y, z, cast = true) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y + h / 2, z); m.castShadow = cast; m.receiveShadow = true; G.add(m); return m;
  };

  // ---------- materials ----------
  const stone = new THREE.MeshStandardMaterial({ color: 0xe5d9c3, roughness: .85 });
  const stoneTop = new THREE.MeshStandardMaterial({ color: 0xf1e8d6, roughness: .8 });
  const concrete = new THREE.MeshStandardMaterial({ color: 0xcfc7b8, roughness: .9 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x41535c, roughness: .3, metalness: .25 });
  const mullion = new THREE.MeshStandardMaterial({ color: 0x8c8a84, roughness: .5, metalness: .3 });
  const roofDark = new THREE.MeshStandardMaterial({ color: 0x2a2d30, roughness: .7 });
  const canopy = new THREE.MeshStandardMaterial({ color: 0xf3f0ea, roughness: .6 });
  const ballast = new THREE.MeshStandardMaterial({ color: 0x6d655c, roughness: 1 });
  const rail = new THREE.MeshStandardMaterial({ color: 0xa7a59f, roughness: .4, metalness: .6 });
  const paving = new THREE.MeshStandardMaterial({ color: 0xd9cdb6, roughness: 1 });
  const edge = new THREE.MeshStandardMaterial({ color: 0xe8c547, roughness: .7 });

  // window slots: dark vertical slits in a 6 m x 4.5 m bay, drawn once and repeated over each facade
  let winTex = null;
  if (detail && typeof document !== 'undefined') {
    const c = document.createElement('canvas'); c.width = 128; c.height = 96; const g = c.getContext('2d');
    g.clearRect(0, 0, 128, 96); g.fillStyle = '#262b2e'; g.fillRect(52, 14, 24, 68);
    g.fillStyle = 'rgba(255,255,255,.10)'; g.fillRect(54, 16, 4, 64);
    winTex = new THREE.CanvasTexture(c); winTex.wrapS = winTex.wrapT = THREE.RepeatWrapping; winTex.colorSpace = THREE.SRGBColorSpace;
  }
  const facade = (w, h, x, y, z, rotY, from = 0) => {           // window plane on one face of a block, floors start at `from`
    if (!winTex) return;
    const t = winTex.clone(); t.needsUpdate = true; t.repeat.set(Math.max(1, Math.round(w / 6)), Math.max(1, Math.round((h - from) / 4.5)));
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w - 4, h - from - 3), new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: .5, roughness: .4 }));
    m.position.set(x, y + from + (h - from) / 2, z); m.rotation.y = rotY; G.add(m);
  };
  // stone block with cornice and windows on its four faces
  const block = (x0, x1, z0, z1, h, opt = {}) => {
    const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    box(w, h, d, stone, cx, 0, cz);
    box(w + 1.2, 1.1, d + 1.2, stoneTop, cx, h - .2, cz, false);             // cornice
    box(w - 1.5, 1.4, d - 1.5, concrete, cx, h + .9, cz, false);              // parapet / roof plant
    const f = opt.from ?? 2;
    if (!opt.noN) facade(w, h, cx, 0, z1 + .06, 0, f);
    if (!opt.noS) facade(w, h, cx, 0, z0 - .06, Math.PI, f);
    if (!opt.noE) facade(d, h, x1 + .06, 0, cz, Math.PI / 2, f);
    if (!opt.noW) facade(d, h, x0 - .06, 0, cz, -Math.PI / 2, f);
  };

  // ---------- ground ----------
  if (detail) box(760, .4, 300, paving, 0, -.4, 0, false);

  // ---------- tracks: 8 tracks, 4 island platforms ----------
  const tracks = [-39, -24, -18, -3, 3, 18, 24, 39];
  for (const z of tracks) {
    box(720, .35, 3.6, ballast, 0, 0, z, false);
    if (detail) for (const o of [-.75, .75]) box(720, .18, .12, rail, 0, .35, z + o, false);
  }
  const platforms = [-31.5, -10.5, 10.5, 31.5];
  for (const z of platforms) {
    box(400, 1.1, 9, concrete, 0, 0, z);
    if (detail) for (const s of [-1, 1]) box(400, .04, .5, edge, 0, 1.1, z + s * 4.1, false);
    // canopy over the part of the platform near the stairs
    box(150, .5, 10, canopy, 15, 7, z);
    for (let x = -55; x <= 85; x += 14) box(.6, 6, .6, concrete, x, 1.1, z, true);
  }
  anchors.push({ key: 'platforms', ar: 'الأرصفة (4 أرصفة جزيرة)', en: 'Island platforms', p: [-130, 3, 10.5] });
  anchors.push({ key: 'canopy', ar: 'مظلات الأرصفة', en: 'Platform canopies', p: [60, 9, -31.5] });
  // corridor retaining walls
  for (const s of [-1, 1]) box(720, 1.6, .8, concrete, 0, 0, s * 46.5, false);

  // ---------- the two station buildings (mirror images) ----------
  for (const s of [-1, 1]) {
    const Z = (a, b) => s > 0 ? [a, b] : [-b, -a];
    // track-side hall along the corridor, 5 floors
    block(-75, 75, ...Z(48, 78), 24);
    // taller central mass, set back
    block(-45, 45, ...Z(62, 104), 33, { from: 6 });
    // outer front: two stone masses either side of the entrance
    block(-75, -15, ...Z(78, 122), 28);
    block(15, 75, ...Z(78, 122), 28);
    // entrance: tall dark recess between the stone masses
    const [ez0, ez1] = Z(82, 116);
    box(30, 27, ez1 - ez0, glass, 0, 0, (ez0 + ez1) / 2);
    if (detail) { const fz = s > 0 ? ez1 + .1 : ez0 - .1;
      for (let x = -12; x <= 12; x += 4) box(.35, 27, .3, mullion, x, 0, fz, false);
      for (let y = 4.5; y < 27; y += 4.5) box(30, .3, .3, mullion, 0, y, fz, false);
      box(34, 1.2, 8, stoneTop, 0, 6, s > 0 ? ez1 + 4 : ez0 - 4); }
    box(32, 2.2, ez1 - ez0 + 2, stoneTop, 0, 27, (ez0 + ez1) / 2, false);
    // stepped low wings at both ends
    block(-98, -75, ...Z(52, 100), 15, { from: 3 });
    block(75, 98, ...Z(52, 100), 15, { from: 3 });
    anchors.push({ key: s < 0 ? 'west' : 'east', ar: s < 0 ? 'مبنى المحطة الغربي' : 'مبنى المحطة الشرقي', en: s < 0 ? 'West station building' : 'East station building', p: [-40, 36, s * 90] });
    anchors.push({ key: s < 0 ? 'entryW' : 'entryE', ar: 'المدخل الرئيسي', en: 'Main entrance', p: [0, 30, s * 124] });
  }

  // ---------- main concourse bridge over the tracks ----------
  box(36, 2.2, 96, concrete, 0, 9, 0);                       // deck
  box(36, 5.2, 96, glass, 0, 11.2, 0);                        // glazed hall
  box(38, .9, 98, roofDark, 0, 16.4, 0, false);               // roof
  for (const z of platforms) for (const x of [-14, 14]) box(1.4, 9, 1.4, concrete, x, 1.1, z);
  // stairs from the concourse down to every platform, both directions
  const stair = (x0, x1, z, y0, y1, w = 3.6) => {
    const L = Math.hypot(x1 - x0, y1 - y0), m = new THREE.Mesh(new THREE.BoxGeometry(L, .6, w), concrete);
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, z); m.rotation.z = Math.atan2(y1 - y0, x1 - x0); m.castShadow = true; m.receiveShadow = true; G.add(m);
    if (detail) for (const o of [-1, 1]) { const r = m.clone(); r.geometry = new THREE.BoxGeometry(L, 1.1, .2); r.position.z = z + o * w / 2; r.position.y += .6; G.add(r); }
  };
  for (const z of platforms) { stair(18, 46, z - 2, 9, 1.1); stair(-18, -46, z + 2, 9, 1.1); }
  anchors.push({ key: 'concourse', ar: 'كوبري الصالة الرئيسي', en: 'Main concourse bridge', p: [0, 20, 0] });

  // ---------- four footbridges (with the concourse: the 5 pedestrian bridges) ----------
  for (const x of [-150, -88, 88, 150]) {
    box(6, 1.4, 94, concrete, x, 8, 0);
    if (detail) for (const s of [-1, 1]) box(.25, 1.2, 94, concrete, x + s * 2.9, 9.4, 0, false);
    for (const z of platforms) { box(1, 8, 1, concrete, x, 1.1, z); stair(x - Math.sign(x) * 3, x - Math.sign(x) * 26, z, 8, 1.1, 3); }
  }
  anchors.push({ key: 'footbridges', ar: 'كباري المشاة', en: 'Footbridges', p: [150, 12, 20] });

  // ---------- Line 2 arriving on a viaduct (surface Line 1 runs through) ----------
  const deckY = 10;
  for (let x = 245; x <= 360; x += 23) box(2.2, deckY, 2.2, concrete, x, 0, 0);
  box(130, 1.6, 12, concrete, 305, deckY, 0);                                   // deck
  const ramp = new THREE.Mesh(new THREE.BoxGeometry(Math.hypot(60, deckY), 1.6, 12), concrete);
  ramp.position.set(210, deckY / 2 + .8, 0); ramp.rotation.z = Math.atan2(deckY, 60); ramp.castShadow = true; G.add(ramp);
  anchors.push({ key: 'line2', ar: 'الخط الثاني (علوي)', en: 'Line 2 · elevated', p: [320, deckY + 4, 0] });
  anchors.push({ key: 'line1', ar: 'الخط الأول (سطحي)', en: 'Line 1 · at grade', p: [-300, 2, -24] });

  return { group: G, anchors };
}
