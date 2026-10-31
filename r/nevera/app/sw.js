// Nevera app: works offline after the first visit and always takes the newest build from Aroma Hub when online.
// Pages, scripts and data: network first (4 s), cache as the fallback. Heavy static files (terrain, imagery, textures,
// three.js from the CDN, fonts): served from the cache at once and refreshed in the background.
const CACHE = 'nevera-app-v1';
const HEAVY = /\/r\/nevera\/(terrain\.bin|terrain\.b64\.txt|sat\.jpg|circuit\.jpg|tex\/|app\/icon)|cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/;
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(['/nevera?app=1', '/r/nevera/zones.json']).catch(() => {}))); });
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
  await self.clients.claim(); })()));
const put = async (req, res) => { if (res && (res.ok || res.type === 'opaque')) { const c = await caches.open(CACHE); await c.put(req, res.clone()); } return res; };
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.pathname.startsWith('/api/') || /version\.json|live\.json/.test(url.pathname)) return;   // live channel never cached
  if (HEAVY.test(req.url)) {
    e.respondWith((async () => { const hit = await caches.match(req); const net = fetch(req).then(r => put(req, r)).catch(() => null);
      if (hit) { e.waitUntil(net); return hit; } return (await net) || new Response('', { status: 504 }); })());
    return; }
  if (url.origin !== location.origin) return;
  e.respondWith((async () => {
    const net = fetch(req).then(r => put(req, r));
    const slow = new Promise(ok => setTimeout(() => ok('slow'), 4000));
    const first = await Promise.race([net.catch(() => 'off'), slow]);
    if (first !== 'slow' && first !== 'off') return first;
    const hit = await caches.match(req, { ignoreSearch: req.mode === 'navigate' }) || (req.mode === 'navigate' ? await caches.match('/nevera?app=1') : null);
    if (hit) { e.waitUntil(net.catch(() => {})); return hit; }       // slow or offline: the cached copy now, the new one next time
    return net.catch(() => Response.error()); })());
});
