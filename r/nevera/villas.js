// Nevera · Z17 low-density luxury villas (atlas A/B/C) — detail-level sample.
// Y up, metres. Real PBR textures from Poly Haven (CC0), tinted to the atlas material IDs (M01 limestone, M02 rubble, M05 timber).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { kit } from './kit.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const Q = new URLSearchParams(location.search);
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Q.has('pr') ? +Q.get('pr') : Math.min(devicePixelRatio, 1.5)); renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .8;
document.getElementById('stage').appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, innerWidth / innerHeight, .3, 2500);
const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.maxPolarAngle = Math.PI * .495;

// sky: clear blue to a pale warm horizon (as in the atlas renders); light from a real late-afternoon sky HDRI
{ const c = document.createElement('canvas'); c.width = 2; c.height = 512; const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 512);
  gr.addColorStop(0, '#6f97cf'); gr.addColorStop(.55, '#a9c1e0'); gr.addColorStop(.82, '#dfe3e6'); gr.addColorStop(1, '#efe6da');
  g.fillStyle = gr; g.fillRect(0, 0, 2, 512); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; scene.background = t; }
const pm = new THREE.PMREMGenerator(renderer);
new RGBELoader().load('tex/sky.hdr', h => { scene.environment = pm.fromEquirectangular(h).texture; h.dispose(); });
scene.environmentIntensity = .55;
const sun = new THREE.DirectionalLight(0xffc690, 4.4); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
sun.shadow.bias = -.0003; sun.shadow.normalBias = .03; sun.shadow.radius = 4; scene.add(sun, sun.target);
const SUNDIR = new THREE.Vector3(-.84, .4, .42).normalize();
function fitSun(t) { sun.target.position.copy(t); sun.position.copy(t).addScaledVector(SUNDIR, 90); const c = sun.shadow.camera; c.left = c.bottom = -30; c.right = c.top = 30; c.near = 1; c.far = 200; c.updateProjectionMatrix(); }
scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x9c8466, .22));

const K = kit('tex/');
const SITES = { A: [0, 0], B: [60, 0], C: [125, 0] };
let tris = 0;
for (const kind of K.kinds) { const P = K.build(kind), [sx, sz] = SITES[kind];
  // the prototype is centred on its footprint; the sample keeps the authored origin, so shift back by the centre
  for (const [m, g] of P.parts) { const mesh = new THREE.Mesh(g, m); mesh.position.set(sx + P.c[0], 0, sz + P.c[1]); mesh.castShadow = K.casts(m) && !m.transparent; mesh.receiveShadow = m !== K.M.spot; if (m.transparent) mesh.renderOrder = 2; scene.add(mesh); tris += g.attributes.position.count / 3; } }
{ const g = new THREE.BoxGeometry(530, .02, 310).translate(65, -.01, 5), p = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i), p.getZ(i));
  const gm = new THREE.Mesh(g, K.M.ground); gm.receiveShadow = true; scene.add(gm); }
const bins = { size: 0 };

/* ---------------- post: ambient occlusion (GTAO) + output ---------------- */
const composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scene, camera));
const ao = new GTAOPass(scene, camera, innerWidth, innerHeight); ao.blendIntensity = .9;
ao.updateGtaoMaterial({ radius: .9, distanceExponent: 1.6, thickness: 1.5, scale: 1, samples: 16 }); ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 });
if (!Q.has('noao')) composer.addPass(ao); composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), .2, .5, .92)); composer.addPass(new OutputPass());

// views: the three atlas example angles (hero lens ~30 mm equivalent), plus a walk-around
const V = {
  'A · فيلا الفناء': { site: 'A', p: [-15, 8.5, 41], t: [10.5, 4.2, 8.5], fov: 38 },
  'B · الفيلا الطولية': { site: 'B', p: [9, 3.7, 40], t: [12.5, 4.4, 10], fov: 52 },
  'C · فيلا الباشيو': { site: 'C', p: [-13, 14, 47], t: [12, 2.6, 12], fov: 36 },
  'من فوق': { site: 'A', p: [-50, 70, 90], t: [60, 0, 10], fov: 35 },
};
const vb = document.getElementById('views');
function go(n) { const v = V[n], s = SITES[v.site]; camera.fov = v.fov || 35; camera.updateProjectionMatrix(); camera.position.set(s[0] + v.p[0], v.p[1], s[1] + v.p[2]); controls.target.set(s[0] + v.t[0], v.t[1], s[1] + v.t[2]); controls.update(); fitSun(n === 'من فوق' ? new THREE.Vector3(60, 0, 10) : controls.target); if (n === 'من فوق') { const c = sun.shadow.camera; c.left = c.bottom = -110; c.right = c.top = 110; c.updateProjectionMatrix(); } }
for (const n of Object.keys(V)) { const b = document.createElement('button'); b.textContent = n; b.onclick = () => go(n); vb.appendChild(b); }
go(Object.keys(V)[0]); window.__go = go;
controls.addEventListener('end', () => fitSun(controls.target));
window.__stats = { tris: Math.round(tris) };
console.log('villas', JSON.stringify(window.__stats));
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight); });
renderer.setAnimationLoop(() => { controls.update(); composer.render(); });
