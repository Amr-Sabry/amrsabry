// Aroma Hub media: the project photos a room's own settings page edits online, kept in the hub's private store.
//   GET  /api/media?room=<id>              the room's edits: {ok, v, at, packs:{<pk>:{o:[[sha,off,len,w,h,cap,t]...]}}, items:{<project>:[[sha] or [sha,cap]...]}}
//   GET  /api/media?room=<id>&f=<pk>       one pack of photos the settings page uploaded (the room reads each photo out of it)
//   POST /api/media?a=pack&room=<id>       body: the photos of one save, back to back (at most 4 MB)  -> {ok, pk}      (needs the hub key)
//   POST /api/media?a=save&room=<id>       body: {packs, items, drop}: projects whose list changed, and projects back to the originals (needs the hub key)
// A project listed in "items" replaces the room's shipped photos for that project; "drop" removes the edit and the shipped photos come back.
// The hub key is derived in the browser from the admin passphrase, as on the comments page; this function only knows its fingerprint (r/_notes.json).
import { put, get } from '@vercel/blob';
import { createHash, timingSafeEqual, randomBytes } from 'node:crypto';

const SITE = 'https://aromahub.studio';
const HOSTS = ['aromahub.studio', 'www.aromahub.studio'];
const ROOM = /^[a-z0-9][a-z0-9-]{1,40}$/, PK = /^u[a-z0-9]{14}$/, SHA = /^[a-f0-9]{16}$/, PID = /^\d{1,6}$/;
const MAX_PACK = 4 * 1024 * 1024, MAX_BODY = 512 * 1024, MAX_LIST = 300;
const P = { access: 'private' };

const json = (data, status = 200, cache = 'no-store') => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': cache } });
const bad = (status, error) => json({ ok: false, error }, status);
const str = (v, max) => (typeof v === 'string' ? v : v == null ? '' : String(v)).replace(/[\u0000-\u001f]/g, ' ').slice(0, max);
const num = (v, lo, hi) => { const n = Math.floor(Number(v)); return Number.isFinite(n) && n >= lo && n <= hi ? n : null; };
const idx = room => `media/${room}/index.json`;
const pack = (room, pk) => `media/${room}/${pk}.bin`;

let verifier = null, verifierAt = 0;
async function allowed(request) {
  const k = request.headers.get('x-hub-key') || '';
  if (!/^[a-f0-9]{64}$/.test(k)) return false;
  if (!verifier || Date.now() - verifierAt > 300000) {
    try { const r = await fetch(SITE + '/r/_notes.json', { cache: 'no-store' }); if (r.ok) { const j = await r.json(); if (/^[a-f0-9]{64}$/.test(j.h || '')) { verifier = j.h; verifierAt = Date.now(); } } } catch (e) {}
  }
  if (!verifier) return false;
  const a = createHash('sha256').update(Buffer.from(k, 'hex')).digest(), b = Buffer.from(verifier, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}
function fromHub(request) {
  const o = request.headers.get('origin') || request.headers.get('referer') || '';
  try { return HOSTS.includes(new URL(o).hostname); } catch (e) { return false; }
}
async function readIndex(room) {
  try {
    const r = await get(idx(room), { ...P, useCache: false });
    if (!r || r.statusCode !== 200) return null;
    return JSON.parse(await new Response(r.stream).text());
  } catch (e) { return null; }
}
const empty = () => ({ ok: true, v: 0, at: null, packs: {}, items: {} });

function cleanPack(p) {
  const o = Array.isArray(p && p.o) ? p.o.slice(0, 200) : [], out = [];
  for (const e of o) {
    if (!Array.isArray(e) || !SHA.test(e[0] || '')) return null;
    const off = num(e[1], 0, MAX_PACK), len = num(e[2], 1, MAX_PACK), w = num(e[3], 1, 20000), h = num(e[4], 1, 20000);
    if (off == null || len == null || w == null || h == null || off + len > MAX_PACK) return null;
    out.push([e[0], off, len, w, h, str(e[5], 160), e[6] === 'j' ? 'j' : 'w']);
  }
  return out.length ? { o: out } : null;
}
function cleanList(l) {
  if (!Array.isArray(l)) return null;
  const out = [], seen = new Set();
  for (const e of l.slice(0, MAX_LIST)) {
    const sha = Array.isArray(e) ? e[0] : e;
    if (!SHA.test(sha || '') || seen.has(sha)) continue; seen.add(sha);
    out.push(Array.isArray(e) && e.length > 1 && e[1] != null ? [sha, str(e[1], 160)] : [sha]);
  }
  return out;
}

export async function GET(request) {
  try {
    const q = new URL(request.url).searchParams, room = q.get('room') || '';
    if (!ROOM.test(room)) return bad(400, 'room');
    if (q.has('f')) {
      const pk = q.get('f') || '';
      if (!PK.test(pk)) return bad(400, 'pack');
      const r = await get(pack(room, pk), P);
      if (!r || r.statusCode !== 200) return bad(404, 'missing');
      return new Response(r.stream, { headers: { 'content-type': 'application/octet-stream', 'cache-control': 'public, max-age=31536000, immutable' } });
    }
    const ix = (await readIndex(room)) || empty();
    return json(ix, 200, q.has('t') ? 'no-store' : 'public, max-age=0, s-maxage=30, stale-while-revalidate=60');
  } catch (e) { console.error('media GET', e); return bad(500, 'server'); }
}

export async function POST(request) {
  try {
    if (!fromHub(request)) return bad(403, 'origin');
    if (!(await allowed(request))) return bad(401, 'key');
    const q = new URL(request.url).searchParams, room = q.get('room') || '', a = q.get('a');
    if (!ROOM.test(room)) return bad(400, 'room');
    if (a === 'pack') {
      if (Number(request.headers.get('content-length') || 0) > MAX_PACK) return bad(413, 'too large');
      const bytes = new Uint8Array(await request.arrayBuffer());
      if (bytes.length < 100 || bytes.length > MAX_PACK) return bad(413, 'size');
      const pk = 'u' + Date.now().toString(36).slice(-7) + randomBytes(4).toString('hex').slice(0, 7);
      await put(pack(room, pk), Buffer.from(bytes), { ...P, addRandomSuffix: false, contentType: 'application/octet-stream' });
      return json({ ok: true, pk });
    }
    if (a === 'save') {
      if (Number(request.headers.get('content-length') || 0) > MAX_BODY) return bad(413, 'too large');
      let b; try { b = await request.json(); } catch (e) { return bad(400, 'body'); }
      const ix = (await readIndex(room)) || empty();
      const packs = b && b.packs && typeof b.packs === 'object' ? b.packs : {}, items = b && b.items && typeof b.items === 'object' ? b.items : {};
      for (const pk of Object.keys(packs).slice(0, 20)) { if (!PK.test(pk)) return bad(400, 'pack id'); const c = cleanPack(packs[pk]); if (!c) return bad(400, 'pack'); ix.packs[pk] = c; }
      for (const pid of Object.keys(items).slice(0, 50)) { if (!PID.test(pid)) return bad(400, 'project'); const c = cleanList(items[pid]); if (!c) return bad(400, 'list'); ix.items[pid] = c; }
      for (const pid of (Array.isArray(b && b.drop) ? b.drop : []).slice(0, 50)) { if (PID.test(String(pid))) delete ix.items[String(pid)]; }
      ix.ok = true; ix.v = (ix.v | 0) + 1; ix.at = new Date().toISOString();
      await put(idx(room), JSON.stringify(ix), { ...P, addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json' });
      return json(ix);
    }
    return bad(400, 'action');
  } catch (e) { console.error('media POST', e); return bad(500, 'server'); }
}
