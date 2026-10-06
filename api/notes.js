// Aroma Hub notes: receives the comments visitors leave on a project room and keeps them in the hub's private store.
//   POST /api/notes                 from a room: form with "meta" (JSON) and "image" (JPEG of the frame with its marks)
//   GET  /api/notes?room=<id>       comments page: the saved comments, newest first      (needs the hub key)
//   GET  /api/notes?img=<room>/<id> comments page: one comment's picture                 (needs the hub key)
//   POST /api/notes?a=mark|del      comments page: mark as done / new, or delete         (needs the hub key)
// The hub key is derived in the browser from the admin passphrase; this function only knows its fingerprint (r/_notes.json).
// Optional email notice per comment: set NOTES_MAIL_KEY (Resend API key), NOTES_MAIL_TO and NOTES_MAIL_FROM on the project.
import { put, get, list, del } from '@vercel/blob';
import { createHash, timingSafeEqual, randomBytes } from 'node:crypto';

const SITE = 'https://aromahub.studio';
const HOSTS = ['aromahub.studio', 'www.aromahub.studio'];
const ROOM = /^[a-z0-9][a-z0-9-]{1,40}$/, ID = /^[a-z0-9]{8,12}-[a-f0-9]{8}$/;
const MAX_IMAGE = 4 * 1024 * 1024, MAX_META = 256 * 1024;      // size of one comment, not how many there can be
const P = { access: 'private' };

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const bad = (status, error) => json({ ok: false, error }, status);
const str = (v, max) => (typeof v === 'string' ? v : v == null ? '' : String(v)).replace(/\u0000/g, '').slice(0, max);
const num = (v, lo, hi) => { const n = Number(v); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : lo; };
const key = (room, id, ext) => `notes/${room}/${id}.${ext}`;

async function text(pathname) {
  const r = await get(pathname, { ...P, useCache: false });
  if (!r || r.statusCode !== 200) return null;
  return await new Response(r.stream).text();
}

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

function clean(meta, room) {
  const pins = (Array.isArray(meta.pins) ? meta.pins : []).map((p, i) => ({ n: i + 1, x: num(p && p.x, 0, 1), y: num(p && p.y, 0, 1), text: str(p && p.text, 20000) }));
  const c = meta.context && typeof meta.context === 'object' ? meta.context : null, v = meta.view && typeof meta.view === 'object' ? meta.view : {};
  const ctx = c ? Object.fromEntries(Object.entries(c).slice(0, 12).map(([k, val]) => [str(k, 40), str(val, 300)])) : null;
  return { room, name: str(meta.name, 80), when: str(meta.when, 40), page: str(meta.page, 200), general: str(meta.general, 20000), pins, context: ctx,
    view: { w: num(v.w, 0, 20000), h: num(v.h, 0, 20000), dpr: num(v.dpr, 0, 8), lang: v.lang === 'en' ? 'en' : 'ar' } };
}

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
async function mail(rec, image) {
  const k = process.env.NOTES_MAIL_KEY, to = process.env.NOTES_MAIL_TO, from = process.env.NOTES_MAIL_FROM;
  if (!k || !to || !from) return 'off';
  const rows = rec.pins.filter(p => p.text).map(p => `<tr><td style="padding:6px 10px;vertical-align:top"><b style="display:inline-block;width:24px;height:24px;line-height:24px;border-radius:12px;background:#e2300f;color:#fff;text-align:center">${p.n}</b></td><td style="padding:6px 0">${esc(p.text).replace(/\n/g, '<br>')}</td></tr>`).join('');
  const ctx = rec.context ? Object.values(rec.context).filter(Boolean).map(esc).join(' · ') : '';
  const html = `<div dir="auto" style="font:15px/1.6 system-ui,Segoe UI,Tahoma,sans-serif;color:#1a0903"><p style="margin:0 0 4px"><b>${esc(rec.name)}</b> left a comment on <b>${esc(rec.room)}</b></p>`
    + (ctx ? `<p style="margin:0 0 10px;color:#6b5a50">${ctx}</p>` : '') + (rec.general ? `<p style="margin:0 0 10px">${esc(rec.general).replace(/\n/g, '<br>')}</p>` : '')
    + (rows ? `<table style="border-collapse:collapse;margin:0 0 12px">${rows}</table>` : '') + `<p style="margin:0 0 12px"><a href="${SITE}/comments#${esc(rec.room)}/${esc(rec.id)}">Open in the hub</a></p><img src="cid:frame" alt="" style="max-width:100%;border:1px solid #ddd"></div>`;
  try {
    const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { authorization: 'Bearer ' + k, 'content-type': 'application/json' },
      body: JSON.stringify({ from, to: to.split(',').map(s => s.trim()).filter(Boolean), subject: `Aroma Hub · ${rec.room} · comment from ${rec.name}`, html,
        attachments: [{ filename: 'frame.jpg', content: Buffer.from(image).toString('base64'), content_id: 'frame' }] }) });
    return r.ok ? 'sent' : 'failed ' + r.status;
  } catch (e) { return 'failed'; }
}

async function receive(request) {
  if (!fromHub(request)) return bad(403, 'origin');
  if (Number(request.headers.get('content-length') || 0) > MAX_IMAGE + MAX_META + 4096) return bad(413, 'too large');
  let form; try { form = await request.formData(); } catch (e) { return bad(400, 'form'); }
  const rawMeta = form.get('meta'), image = form.get('image');
  if (typeof rawMeta !== 'string' || rawMeta.length > MAX_META || !image || typeof image === 'string') return bad(400, 'fields');
  if (image.size < 200 || image.size > MAX_IMAGE) return bad(413, 'image size');
  let meta; try { meta = JSON.parse(rawMeta); } catch (e) { return bad(400, 'meta'); }
  const room = str(meta && meta.room, 60);
  if (!ROOM.test(room)) return bad(400, 'room');
  const bytes = new Uint8Array(await image.arrayBuffer());
  if (!(bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)) return bad(400, 'image type');
  const rec = clean(meta, room);
  if (!rec.name || (!rec.general && !rec.pins.some(p => p.text))) return bad(400, 'empty');
  rec.id = Date.now().toString(36).padStart(9, '0') + '-' + randomBytes(4).toString('hex');
  rec.at = new Date().toISOString(); rec.status = 'new'; rec.bytes = bytes.length;
  await put(key(room, rec.id, 'jpg'), Buffer.from(bytes), { ...P, addRandomSuffix: false, contentType: 'image/jpeg' });
  await put(key(room, rec.id, 'json'), JSON.stringify(rec), { ...P, addRandomSuffix: false, contentType: 'application/json' });
  const mailed = await mail(rec, bytes);
  return json({ ok: true, id: rec.id, mail: mailed === 'off' ? undefined : mailed.split(' ')[0] });
}

async function listing(room) {
  const names = []; let cursor;
  do { const r = await list({ prefix: room ? `notes/${room}/` : 'notes/', cursor, limit: 1000 }); r.blobs.forEach(b => { if (b.pathname.endsWith('.json')) names.push(b.pathname); }); cursor = r.hasMore ? r.cursor : undefined; } while (cursor);
  names.sort((a, b) => (a.slice(a.lastIndexOf('/') + 1) < b.slice(b.lastIndexOf('/') + 1) ? 1 : -1));       // ids start with the time: newest first
  return names;
}

export async function GET(request) {
  try {
    if (!(await allowed(request))) return bad(401, 'key');
    const q = new URL(request.url).searchParams;
    if (q.has('img')) {
      const m = /^([a-z0-9-]+)\/([a-z0-9-]+)$/.exec(q.get('img') || '');
      if (!m || !ROOM.test(m[1]) || !ID.test(m[2])) return bad(400, 'img');
      const r = await get(key(m[1], m[2], 'jpg'), P);
      if (!r || r.statusCode !== 200) return bad(404, 'missing');
      return new Response(r.stream, { headers: { 'content-type': 'image/jpeg', 'cache-control': 'private, max-age=86400' } });
    }
    const room = q.get('room') || '';
    if (room && !ROOM.test(room)) return bad(400, 'room');
    const names = await listing(room), from = num(q.get('from'), 0, 1e6) | 0, page = names.slice(from, from + 40), out = [];
    for (let i = 0; i < page.length; i += 10) {
      const part = await Promise.all(page.slice(i, i + 10).map(n => text(n).then(t => { try { return t ? JSON.parse(t) : null; } catch (e) { return null; } }, () => null)));
      part.forEach(r => { if (r) out.push(r); });
    }
    return json({ ok: true, total: names.length, from, notes: out });
  } catch (e) { console.error('notes GET', e); return bad(500, 'server'); }
}

export async function POST(request) {
  try {
    const a = new URL(request.url).searchParams.get('a');
    if (!a) return await receive(request);
    if (!(await allowed(request))) return bad(401, 'key');
    let b; try { b = await request.json(); } catch (e) { return bad(400, 'body'); }
    const room = str(b && b.room, 60), id = str(b && b.id, 40);
    if (!ROOM.test(room) || !ID.test(id)) return bad(400, 'id');
    if (a === 'del') { await del([key(room, id, 'json'), key(room, id, 'jpg')]); return json({ ok: true }); }
    if (a === 'mark') {
      const t = await text(key(room, id, 'json')); if (!t) return bad(404, 'missing');
      const rec = JSON.parse(t); rec.status = b.status === 'done' ? 'done' : 'new'; rec.markedAt = new Date().toISOString();
      await put(key(room, id, 'json'), JSON.stringify(rec), { ...P, addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json' });
      return json({ ok: true, status: rec.status });
    }
    return bad(400, 'action');
  } catch (e) { console.error('notes POST', e); return bad(500, 'server'); }
}
