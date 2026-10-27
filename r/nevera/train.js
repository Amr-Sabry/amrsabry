// Egypt high-speed train (Siemens Velaro for Egypt: 8 cars, ~200 m, 250 km/h, 481 seats), modelled in code from the
// InnoTrans 2024 photographs. Livery: pearl-white body, dark window band, red stripe under the windows that widens toward
// the cab with black and gold lines below it (Egyptian flag colours), silver apron, dark wraparound windscreen.
// Metres. The train runs toward +x, y is up, z across. buildTrain(THREE) returns {group, cars, carLen, gap, length}.
// Each car's origin is its centre at rail level, so a path follower can place the cars one by one.

export function buildTrain(THREE, opts = {}) {
  const N = opts.cars || 8, CAR = opts.carLen || 25, GAP = 0.6, W = 2.95, H = 3.75, FLOOR = 0.95, NOSE = 12.5, SEG = 32;
  const L2 = CAR / 2;

  // cross-section: superellipse, a little narrower at the roof
  const section = [];
  for (let i = 0; i < SEG; i++) {
    const a = (i / SEG) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), ex = 0.42;
    let x = Math.sign(c) * Math.pow(Math.abs(c), ex) * W / 2, y = Math.sign(s) * Math.pow(Math.abs(s), ex) * H / 2;
    if (y > 0) x *= 1 - 0.12 * (y / (H / 2));
    section.push([x, y + H / 2]);
  }

  // livery painted on a canvas: u = metres from the cab tip along the car, v = height / H
  function liveryTex(isCab) {
    const cw = 1024, ch = 256, c = document.createElement('canvas'); c.width = cw; c.height = ch; const g = c.getContext('2d');
    const U = x => x / CAR * cw, V = r => (1 - r) * ch;
    const band = (r0, r1, u0, u1, col) => { g.fillStyle = col; g.fillRect(U(u0), V(r1), U(u1) - U(u0), V(r0) - V(r1)); };
    const poly = (pts, col) => { g.fillStyle = col; g.beginPath(); pts.forEach(([u, r], i) => i ? g.lineTo(U(u), V(r)) : g.moveTo(U(u), V(r))); g.closePath(); g.fill(); };
    g.fillStyle = '#f1eee8'; g.fillRect(0, 0, cw, ch);
    band(0, 0.13, 0, CAR, '#a9adb1');                                          // silver apron
    band(0.205, 0.232, isCab ? NOSE + 2 : 0, CAR, '#15171a');                  // low black line
    const w0 = isCab ? NOSE + 2.5 : 0.8;
    band(0.545, 0.70, w0, CAR - 0.6, '#3a454d');                               // tinted band
    for (let x = w0; x < CAR - 1.2; x += 2.35) band(0.555, 0.69, x, Math.min(x + 2.0, CAR - 1.2), '#1c242b');   // windows
    if (isCab) {
      poly([[NOSE - 1, 0.52], [CAR, 0.485], [CAR, 0.455], [NOSE - 1, 0.40]], '#c8202f');   // red, widening to the cab
      poly([[NOSE - 1, 0.40], [NOSE + 12, 0.43], [NOSE + 12, 0.407], [NOSE - 1, 0.35]], '#15171a');
      poly([[NOSE - 1, 0.35], [NOSE + 7, 0.385], [NOSE + 7, 0.37], [NOSE - 1, 0.32]], '#d8a93a');
      g.fillStyle = '#0f1418'; g.beginPath(); g.moveTo(0, V(0.5)); g.quadraticCurveTo(U(NOSE * 0.55), V(0.47), U(NOSE * 0.74), V(1)); g.lineTo(0, 0); g.closePath(); g.fill();
      band(0.27, 0.34, NOSE * 0.08, NOSE * 0.22, '#e6e2da');                 // headlight housing
    } else band(0.455, 0.482, 0, CAR, '#c8202f');
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  }

  // loft through stations {x, sw, sh, u}; UV = (u / CAR, height / H)
  function loft(stations) {
    const pos = [], uv = [], idx = [], R = SEG + 1;
    stations.forEach((st, si) => {
      for (let i = 0; i <= SEG; i++) {
        const [bx, by] = section[i % SEG], y = by * st.sh;
        pos.push(st.x, y + FLOOR, bx * st.sw); uv.push(st.u / CAR, Math.min(1, Math.max(0, y / H)));
      }
      if (si) for (let i = 0; i < SEG; i++) { const a = (si - 1) * R + i, b = a + 1, c = si * R + i, d = c + 1; idx.push(a, c, b, b, c, d); }
    });
    const cap = (si, flip) => { const st = stations[si], k = pos.length / 3; pos.push(st.x, FLOOR + H * st.sh / 2, 0); uv.push(si ? st.u / CAR : 0.5 / CAR, si ? 0.95 : 0.3);
      for (let i = 0; i < SEG; i++) { const a = si * R + i, b = a + 1; flip ? idx.push(k, b, a) : idx.push(k, a, b); } };
    cap(0, false); cap(stations.length - 1, true);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals(); return g;
  }
  const mid = [];
  for (let k = 0; k <= 12; k++) mid.push({ x: -L2 + k * CAR / 12, sw: 1, sh: 1, u: k * CAR / 12 });
  const cab = [];                                                              // tip at -x, u = 0
  for (let k = 0; k <= 26; k++) { const t = k / 26, f = 1 - Math.pow(1 - t, 2.4);
    cab.push({ x: -L2 + t * NOSE, sw: 0.22 + 0.78 * Math.pow(f, 0.5), sh: 0.2 + 0.8 * Math.pow(f, 1.15), u: t * NOSE }); }
  for (let k = 1; k <= 10; k++) { const d = k * (CAR - NOSE) / 10; cab.push({ x: -L2 + NOSE + d, sw: 1, sh: 1, u: NOSE + d }); }
  const geoMid = loft(mid), geoCab = loft(cab);

  const paint = typeof document !== 'undefined';
  const matMid = new THREE.MeshStandardMaterial({ map: paint ? liveryTex(false) : null, color: paint ? 0xffffff : 0xf1eee8, roughness: 0.35, metalness: 0.2 });
  const matCab = new THREE.MeshStandardMaterial({ map: paint ? liveryTex(true) : null, color: paint ? 0xffffff : 0xf1eee8, roughness: 0.32, metalness: 0.2 });
  const under = new THREE.MeshStandardMaterial({ color: 0x3a3d42, roughness: 0.8, metalness: 0.3 });
  const bogieGeo = new THREE.BoxGeometry(3.0, 0.8, 2.2).translate(0, 0.4, 0);
  const skirtGeo = new THREE.BoxGeometry(CAR - 9, 0.5, W * 0.86).translate(0, 0.6, 0);
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xfff3d6 }), lightGeo = new THREE.SphereGeometry(0.17, 8, 6);

  const group = new THREE.Group(), cars = [];
  for (let i = 0; i < N; i++) {
    const car = new THREE.Group(), isFront = i === 0, isBack = i === N - 1;
    const body = new THREE.Mesh(isFront || isBack ? geoCab : geoMid, isFront || isBack ? matCab : matMid);
    if (isFront) body.rotation.y = Math.PI;                                   // front cab tip toward +x
    body.castShadow = true; car.add(body);
    car.add(new THREE.Mesh(skirtGeo, under));
    for (const bx of [-L2 + 5.5, L2 - 5.5]) { const b = new THREE.Mesh(bogieGeo, under); b.position.x = bx; car.add(b); }
    if (isFront || isBack) { const s = isFront ? 1 : -1;
      for (const z of [-0.8, 0.8]) { const l = new THREE.Mesh(lightGeo, lightMat); l.position.set(s * (L2 - 1.9), FLOOR + 1.15, z); car.add(l); } }
    car.userData.offset = CAR / 2 + i * (CAR + GAP);                          // front tip to this car's centre
    group.add(car); cars.push(car);
  }
  return { group, cars, carLen: CAR, gap: GAP, length: N * CAR + (N - 1) * GAP };
}

// Arc-length path over a polyline [[x, y], ...]: at(s) -> {x, y, ang}
export function makePath(points) {
  const P = points.map(p => ({ x: p[0], y: p[1] })), L = [0];
  for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y));
  const total = L[L.length - 1];
  function at(s) {
    s = Math.max(0, Math.min(total, s));
    let lo = 0, hi = L.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (L[m] <= s) lo = m; else hi = m; }
    const a = P[lo], b = P[hi], t = (s - L[lo]) / Math.max(1e-6, L[hi] - L[lo]);
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, ang: Math.atan2(b.y - a.y, b.x - a.x) };
  }
  return { total, at };
}

// Timetable loop: a train enters, slows to a stop at `stopAt` (metres along the path), dwells, accelerates out, repeats.
// Returns the front-tip arc length for time t (seconds). dir = 1 runs with the path, -1 against it.
export function schedule({ total, stopAt, length, vmax = 40, acc = 1.2, dwell = 14, dir = 1, phase = 0 }) {
  const start = -length - 50, end = total + length + 50;
  const dIn = stopAt - start, dOut = end - stopAt, brake = vmax * vmax / (2 * acc);
  const tCruiseIn = Math.max(0, (dIn - brake) / vmax), tBrake = vmax / acc;
  const tAcc = vmax / acc, tCruiseOut = Math.max(0, (dOut - brake) / vmax);
  const T = tCruiseIn + tBrake + dwell + tAcc + tCruiseOut + 6;
  const fn = function (t) {
    let k = ((t + phase) % T + T) % T, s;
    if (k < tCruiseIn) s = start + vmax * k;
    else if ((k -= tCruiseIn) < tBrake) s = stopAt - brake + vmax * k - acc * k * k / 2;
    else if ((k -= tBrake) < dwell) s = stopAt;
    else if ((k -= dwell) < tAcc) s = stopAt + acc * k * k / 2;
    else s = stopAt + brake + vmax * (k - tAcc);
    s = Math.min(s, end);
    return dir > 0 ? s : total - s;
  };
  fn.tStop = tCruiseIn + tBrake; fn.period = T;      // seconds from the loop start until the train stands at the platform
  return fn;
}

// Place every car of a train built by buildTrain at front-tip arc length s on `path` (makePath).
// toLocal(x, y) -> [X, Y, Z] in the train's parent frame (Y up); angSign = 1 when path y maps to +Z, -1 when it maps to -Z.
export function placeTrain(train, path, s, toLocal, angSign = 1) {
  let any = false;
  for (const car of train.cars) {
    const d = s - car.userData.offset;
    if (d < 0 || d > path.total) { car.visible = false; continue; }
    const p = path.at(d), q = toLocal(p.x, p.y);
    car.position.set(q[0], q[1], q[2]); car.rotation.y = -angSign * p.ang; car.visible = true; any = true;
  }
  return any;
}
