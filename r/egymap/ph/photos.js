/* Aroma Hub · مسيرة التنمية · project photos (v1, 13 Oct 2026)
   The real photos of every project, in three places:
     1. the showroom («الصور» on the wheel): the photo wall turns round the model with the project's own photos;
     2. the project card: a strip with the count and the first pictures, pressing it opens the showroom;
     3. Settings → «الصور»: add, delete, replace, reorder, caption and choose the cover of any project's photos.
   Base set: ph/index.json beside the program + packs ph/pNN-*.bin; each picture is read on its own with an HTTP Range request.
   Edits from Settings are kept online in the hub's private store (/api/media) and replace the base set project by project,
   so everyone who opens the map sees them. Saving needs the hub's admin passphrase (the same one as the comments page).
   The map hands its internals over through EGPH.init() at the end of the program; the hooks in the program are one line each. */
(function(){
"use strict";
if (window.EGPH) return;
const BASE = (window.EG_BASE || "./") + "ph/", API = "/api/media", ROOM = "egymap";
const ONLINE = /^https?:$/.test(location.protocol) && !!window.EG_HOSTED;
const MAXSR = 40, KEYS = "hub-notes-key", KEYL = "eg-ph-key";
let X = null;
const S = {loaded: false, ready: null, base: {packs: [], items: {}}, on: {v: 0, packs: {}, items: {}}, imgs: new Map(), items: {}, url: new Map(), done: new Map(), fail: new Set(), packBuf: new Map(), ver: 0, key: ""};
const EN = () => !!(X && X.EN);
const L = (ar, en) => EN() ? en : ar;
const E = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"})[c]);
const nf = n => EN() ? String(n) : String(n).replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[d]);
const DARK = (() => { try { const c = document.createElement("canvas"); c.width = 32; c.height = 18; const g = c.getContext("2d"); const b = g.createLinearGradient(0, 0, 32, 18); b.addColorStop(0, "#071a40"); b.addColorStop(1, "#020a1c"); g.fillStyle = b; g.fillRect(0, 0, 32, 18); return c.toDataURL("image/png"); } catch (e) { return ""; } })();
try { S.key = sessionStorage.getItem(KEYS) || localStorage.getItem(KEYL) || ""; } catch (e) {}

/* ---------------- the data ---------------- */
function merge(){
  const imgs = new Map();
  (S.base.packs || []).forEach(pk => { const url = BASE + pk.f; (pk.o || []).forEach(e => imgs.set(e[0], {sha: e[0], url, off: e[1], len: e[2], w: e[3], h: e[4], cap: e[5] || "", t: e[6] === "j" ? "image/jpeg" : "image/webp"})); });
  Object.keys(S.on.packs || {}).forEach(k => { const url = API + "?room=" + ROOM + "&f=" + encodeURIComponent(k); (S.on.packs[k].o || []).forEach(e => imgs.set(e[0], {sha: e[0], url, off: e[1], len: e[2], w: e[3], h: e[4], cap: e[5] || "", t: e[6] === "j" ? "image/jpeg" : "image/webp", whole: true})); });
  const items = {};
  Object.keys(S.base.items || {}).forEach(p => { items[p] = S.base.items[p].map(s => ({sha: s, cap: null})); });
  Object.keys(S.on.items || {}).forEach(p => { items[p] = (S.on.items[p] || []).map(e => Array.isArray(e) ? {sha: e[0], cap: e[1] == null ? null : String(e[1])} : {sha: String(e), cap: null}); });
  Object.keys(items).forEach(p => { items[p] = items[p].filter(e => imgs.has(e.sha)); if (!items[p].length) delete items[p]; });
  S.imgs = imgs; S.items = items; S.ver++;
}
function load(force){
  if (S.ready && !force) return S.ready;
  const base = S.loaded && !force ? Promise.resolve(S.base) : fetch(BASE + "index.json", {cache: "no-cache"}).then(r => r.ok ? r.json() : null).catch(() => null);
  const on = ONLINE ? fetch(API + "?room=" + ROOM + (force ? "&t=" + Date.now() : ""), {cache: force ? "no-store" : "default"}).then(r => r.ok ? r.json() : null).catch(() => null) : Promise.resolve(null);
  S.ready = Promise.all([base, on]).then(([b, o]) => { if (b && b.packs) S.base = b; if (o && o.ok && (o.v | 0) >= (S.on.v | 0)) S.on = o; S.loaded = true; merge(); return S; });
  return S.ready;
}
const count = p => { const l = p && S.items[p.i]; return l ? l.length : 0; };
const capOf = e => { if (e.cap != null) return e.cap; const m = S.imgs.get(e.sha); return m ? m.cap : ""; };

/* one picture: a Range request into its pack (or the whole pack when the server ignores the range), kept as an object URL for the session */
let qN = 0; const qW = [];
function qRun(fn){ return new Promise((res, rej) => { const go = () => { qN++; fn().then(res, rej).finally(() => { qN--; const n = qW.shift(); if (n) n(); }); }; if (qN < 6) go(); else qW.push(go); }); }
function packWhole(url){ let p = S.packBuf.get(url); if (!p) { p = qRun(() => fetch(url).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })); p.catch(() => S.packBuf.delete(url)); S.packBuf.set(url, p); } return p; }
function urlOf(sha){
  let pr = S.url.get(sha); if (pr) return pr;
  const m = S.imgs.get(sha); if (!m) return Promise.reject(new Error("missing"));
  const cut = buf => new Blob([buf.slice(m.off, m.off + m.len)], {type: m.t});
  pr = (m.whole || S.packBuf.has(m.url) ? packWhole(m.url).then(cut)
    : qRun(() => fetch(m.url, {headers: {Range: "bytes=" + m.off + "-" + (m.off + m.len - 1)}}).then(r => {
        if (r.status === 206) return r.arrayBuffer().then(b => new Blob([b], {type: m.t}));
        if (r.ok) return r.arrayBuffer().then(b => { S.packBuf.set(m.url, Promise.resolve(b)); return cut(b); });
        throw new Error(r.status); })))
    .then(b => { const u = URL.createObjectURL(b); S.done.set(sha, u); S.fail.delete(sha); swapDark(sha, u); return u; });
  pr.catch(() => { S.url.delete(sha); S.fail.add(sha); });
  S.url.set(sha, pr); return pr;
}
function prep(p, n){
  return load().then(() => { const l = (p && S.items[p.i]) || []; return Promise.all(l.slice(0, n || MAXSR).map(e => urlOf(e.sha).catch(() => null))); });
}
function ready(p){
  if (!S.loaded || !p) return false;
  const l = S.items[p.i]; if (!l) return true;
  return l.slice(0, MAXSR).every(e => S.done.has(e.sha) || S.fail.has(e.sha));
}
/* for the showroom and the presenter's screens: the photos that have arrived; the rest show a dark frame until they do */
function list(p){
  if (!p || !S.loaded) return null;
  const l = S.items[p.i]; if (!l || !l.length) return null;
  if (!ready(p)) prep(p);
  const ok = l.slice(0, MAXSR).filter(e => !S.fail.has(e.sha)); if (!ok.length) return null;
  return ok.map((e, n) => { const o = {n, cap: capOf(e)}; Object.defineProperty(o, "url", {enumerable: true, get(){ return S.done.get(e.sha) || (DARK + "#ph-" + e.sha); }}); return o; });
}
/* a screen that was drawn before its photo arrived gets the photo as soon as it does */
function swapDark(sha, u){ try { document.querySelectorAll(".ps-im").forEach(el => { if (el.style.backgroundImage.indexOf("#ph-" + sha) >= 0) el.style.backgroundImage = `url("${u}")`; }); } catch (e) {} }

/* ---------------- the showroom: wait for the photos (never long) ---------------- */
let ldEl = null;
function loading(on){
  if (on && !ldEl) { ldEl = document.createElement("div"); ldEl.className = "egph-ld"; ldEl.innerHTML = `<i></i><span>${L("جارٍ تحميل صور المشروع", "Loading the project's photos")}</span>`; document.body.appendChild(ldEl); }
  if (ldEl) ldEl.classList.toggle("on", !!on);
}
/* shOpen asks first: when the photos are not in yet it waits for them (a few seconds at most) and calls back once */
let waited = -1;
function hold(p, go){
  if (!p || ready(p) || waited === p.i) { waited = -1; return false; }
  waited = p.i; openWhenReady(p, go); return true;
}
function openWhenReady(p, open){
  let done = false; const t0 = setTimeout(() => { if (!done) loading(true); }, 350);
  const fin = () => { if (done) return; done = true; clearTimeout(t0); loading(false); open(); };
  prep(p).then(fin, fin); setTimeout(fin, 7000);
}

/* ---------------- the project card ---------------- */
const ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.6"/><path d="M4 17l5-5 4 4 3-3 4 4"/></svg>';
function cardHTML(p){
  if (!p) return "";
  if (S.loaded && !count(p)) return "";
  return `<div class="egph" data-pid="${p.i}"${S.loaded ? "" : " hidden"}></div>`;
}
let lastCard = null;
function cardBind(card, p, open){
  const el = card && card.querySelector('.egph[data-pid="' + p.i + '"]'); if (!el) return;
  lastCard = {card, p, open};
  load().then(() => {
    if (!el.isConnected) return;
    const l = S.items[p.i]; if (!l || !l.length) { el.remove(); return; }
    const n = l.length, th = l.slice(0, 4);
    el.hidden = false;
    el.innerHTML = `<button type="button" class="egph-b" aria-label="${E(L("اعرض صور المشروع", "Show the project's photos"))}">
      <span class="egph-t">${ICON}<b>${L("الصور", "Photos")}</b><em>${nf(n)}</em></span>
      <span class="egph-r">${th.map(() => "<i></i>").join("")}</span>
      <span class="egph-go">${L("اعرض", "Show")}<i>‹</i></span></button>`;
    const is = el.querySelectorAll(".egph-r i");
    th.forEach((e, k) => urlOf(e.sha).then(u => { if (is[k]) { is[k].style.backgroundImage = `url("${u}")`; is[k].classList.add("on"); } }, () => { if (is[k]) is[k].classList.add("x"); }));
    el.querySelector(".egph-b").addEventListener("click", ev => { ev.stopPropagation(); if (X && X.inShow && X.inShow()) return; open(); });
    setTimeout(() => { if (el.isConnected) prep(p); }, 1200);
  });
}
function cardRefresh(pid){
  const c = lastCard; if (!c || !c.card) return;
  const el = c.card.querySelector(".egph"); if (c.p.i !== pid) return;
  if (el) { el.outerHTML = cardHTML(c.p) || ""; }
  else { const h = c.card.querySelector("h2"); if (h && count(c.p)) h.insertAdjacentHTML("afterend", cardHTML(c.p)); }
  cardBind(c.card, c.p, c.open);
}

/* ---------------- the hub key (the admin passphrase never leaves the browser; only a key derived from it travels) ---------------- */
const hex = buf => Array.prototype.map.call(new Uint8Array(buf), b => ("0" + b.toString(16)).slice(-2)).join("");
const unb64 = s => { const b = atob(s), a = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; };
function derive(pass){
  return fetch("/r/_notes.json", {cache: "no-store"}).then(r => { if (!r.ok) throw new Error("setup"); return r.json(); }).then(v =>
    crypto.subtle.importKey("raw", new TextEncoder().encode(pass), "PBKDF2", false, ["deriveBits"])
      .then(k => crypto.subtle.deriveBits({name: "PBKDF2", salt: unb64(v.s), iterations: v.n, hash: "SHA-256"}, k, 256))
      .then(bits => crypto.subtle.digest("SHA-256", bits).then(d => { if (hex(d) !== v.h) throw new Error("wrong"); return hex(bits); })));
}
function setKey(k, remember){ S.key = k || ""; try { if (k) { sessionStorage.setItem(KEYS, k); if (remember) localStorage.setItem(KEYL, k); } else { sessionStorage.removeItem(KEYS); localStorage.removeItem(KEYL); } } catch (e) {} }
function api(q, opt){
  opt = opt || {}; opt.headers = Object.assign({"x-hub-key": S.key}, opt.headers || {}); opt.cache = "no-store";
  return fetch(API + q, opt).then(r => { if (r.status === 401) { setKey(""); const e = new Error("key"); e.key = true; throw e; } if (!r.ok) throw new Error("http " + r.status); return r.json(); });
}

/* ---------------- a new picture: at most 1280 px, WebP (JPEG where the browser cannot write WebP) ---------------- */
function shrink(file){
  return new Promise((res, rej) => { const u = URL.createObjectURL(file), im = new Image();
    im.onload = () => { try {
      const k = Math.min(1, 1280 / Math.max(im.naturalWidth, im.naturalHeight)), w = Math.max(1, Math.round(im.naturalWidth * k)), h = Math.max(1, Math.round(im.naturalHeight * k));
      const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d"); g.fillStyle = "#08142a"; g.fillRect(0, 0, w, h); g.drawImage(im, 0, 0, w, h);
      URL.revokeObjectURL(u);
      c.toBlob(b => { if (b && b.type === "image/webp") return res({blob: b, w, h, t: "image/webp"});
        c.toBlob(j => j ? res({blob: j, w, h, t: "image/jpeg"}) : rej(new Error("encode")), "image/jpeg", .86); }, "image/webp", .76);
    } catch (e) { URL.revokeObjectURL(u); rej(e); } };
    im.onerror = () => { URL.revokeObjectURL(u); rej(new Error("decode")); }; im.src = u; });
}
const shaOf = blob => blob.arrayBuffer().then(b => crypto.subtle.digest("SHA-1", b)).then(d => hex(d).slice(0, 16));

/* ---------------- Settings → «الصور» ---------------- */
const A = {host: null, q: "", ent: "", f: "all", pid: -1, ed: null, busy: false, built: false};
function entities(){ const m = new Map(); X.P.forEach(p => { if (p.mn) m.set(p.mn, (m.get(p.mn) || 0) + 1); }); return [...m.keys()].sort((a, b) => a.localeCompare(b, "ar")); }
const norm = s => String(s || "").toLowerCase().replace(/[ً-ْـ]/g, "").replace(/[إأآا]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه");
function admin(host){
  if (!host || !X) return; A.host = host;
  if (!A.built) {
    A.built = true;
    host.innerHTML = `<div class="adm-col adm-list ph-list">
        <input type="search" id="phQ" placeholder="${E(L("بحث باسم المشروع", "Search by project name"))}" autocomplete="off">
        <select id="phEnt"><option value="">${E(L("كل الوزارات والجهات", "All ministries and bodies"))}</option>${entities().map(n => `<option value="${E(n)}">${E(n)}</option>`).join("")}</select>
        <div class="ph-flt" role="group">${[["all", L("الكل", "All")], ["has", L("لها صور", "With photos")], ["none", L("بدون صور", "No photos")], ["mod", L("معدّلة أونلاين", "Edited online")]].map(([k, t]) => `<button type="button" data-f="${k}" aria-pressed="${k === A.f}">${t}</button>`).join("")}</div>
        <div class="adm-hint" id="phCnt"></div><ul class="adm-scroll" id="phL"></ul></div>
      <div class="adm-col adm-main ph-main" id="phM"></div>`;
    host.querySelector("#phQ").addEventListener("input", e => { A.q = e.target.value; renderList(); });
    host.querySelector("#phEnt").addEventListener("change", e => { A.ent = e.target.value; renderList(); });
    host.querySelectorAll(".ph-flt button").forEach(b => b.addEventListener("click", () => { A.f = b.dataset.f; host.querySelectorAll(".ph-flt button").forEach(x => x.setAttribute("aria-pressed", x === b)); renderList(); }));
    host.querySelector("#phL").addEventListener("click", e => { const li = e.target.closest("li[data-i]"); if (li) pick(+li.dataset.i); });
  }
  host.querySelector("#phCnt").textContent = L("جارٍ التحميل…", "Loading…");
  load(true).then(() => { renderList(); if (A.pid >= 0) renderMain(); else renderIntro(); });
}
function rows(){
  const q = norm(A.q).trim().split(/\s+/).filter(Boolean);
  return X.P.filter(p => {
    if (A.ent && p.mn !== A.ent) return false;
    const n = count(p);
    if (A.f === "has" && !n) return false; if (A.f === "none" && n) return false; if (A.f === "mod" && !(S.on.items && S.on.items[p.i])) return false;
    if (q.length) { const t = norm(p.n + " " + (p.mn || "") + " " + p.i); if (!q.every(w => t.includes(w))) return false; }
    return true; });
}
function renderList(){
  const host = A.host; if (!host) return; const R = rows(), all = X.P.length, withP = X.P.filter(p => count(p)).length, imgs = Object.values(S.items).reduce((a, l) => a + l.length, 0);
  host.querySelector("#phCnt").textContent = L(`${nf(R.length)} مشروع في القائمة · ${nf(withP)} من ${nf(all)} مشروع لها صور · ${nf(imgs)} صورة`, `${R.length} listed · ${withP} of ${all} projects have photos · ${imgs} photos`);
  host.querySelector("#phL").innerHTML = R.map(p => { const n = count(p), mod = S.on.items && S.on.items[p.i]; return `<li data-i="${p.i}" class="${p.i === A.pid ? "on" : ""}" style="--c:${X.SECC[p.sc] || "#46d7cf"}"><i></i><span>${E(p.n)}</span>${mod ? `<em class="ph-mod">${L("أونلاين", "online")}</em>` : ""}<em class="${n ? "" : "ph-0"}">${nf(n)}</em></li>`; }).join("") || `<li class="ph-none">${L("لا توجد مشروعات بهذا البحث", "No projects match")}</li>`;
}
function renderIntro(){
  const m = A.host.querySelector("#phM");
  m.innerHTML = `<h3 class="adm-ttl">${L("صور المشروعات", "Project photos")}</h3>
    <p class="adm-hint">${L("اختر مشروعًا من القائمة لإدارة صوره: إضافة، حذف، استبدال، ترتيب، صورة الغلاف، والتعليق على كل صورة. أول صورة هي اللي بتظهر الأول في الشو روم وفي كارت المشروع.", "Pick a project to manage its photos: add, delete, replace, reorder, choose the cover and caption each photo.")}</p>
    ${keyBox()}`;
  bindKey(m);
}
function keyBox(){
  if (!ONLINE) return `<div class="adm-note">${L("التعديل أونلاين متاح من الخريطة على أروما هب فقط.", "Online editing works from the map on Aroma Hub only.")}</div>`;
  if (S.key) return `<div class="ph-key ok"><i></i><span>${L("متصل بأروما هب: التعديلات بتتحفظ أونلاين ويشوفها كل اللي بيفتح الخريطة.", "Connected to Aroma Hub: edits are saved online for everyone.")}</span><button type="button" data-a="out">${L("خروج", "Sign out")}</button></div>`;
  return `<form class="ph-key" autocomplete="off"><span>${L("للحفظ أونلاين اكتب كلمة سر الإدارة (نفس كلمة سر صفحة التعليقات):", "To save online, enter the admin passphrase (the same as the comments page):")}</span>
    <input type="password" name="p" autocomplete="current-password" aria-label="${E(L("كلمة السر", "Passphrase"))}">
    <label class="ph-rem"><input type="checkbox" name="r"> ${L("تذكّرني على الجهاز ده", "Remember on this device")}</label>
    <button type="submit">${L("دخول", "Sign in")}</button><b class="ph-msg"></b></form>`;
}
function bindKey(root){
  const f = root.querySelector("form.ph-key"), o = root.querySelector('.ph-key [data-a="out"]');
  if (o) o.addEventListener("click", () => { setKey(""); A.pid >= 0 ? renderMain() : renderIntro(); });
  if (!f) return;
  f.addEventListener("submit", e => { e.preventDefault(); const p = f.p.value, msg = f.querySelector(".ph-msg"); if (!p) { msg.textContent = L("اكتب كلمة السر", "Enter the passphrase"); return; }
    msg.textContent = L("جارٍ التحقق…", "Checking…"); f.querySelector('button[type="submit"]').disabled = true;
    derive(p).then(k => { setKey(k, f.r.checked); A.pid >= 0 ? renderMain() : renderIntro(); },
      err => { f.querySelector('button[type="submit"]').disabled = false; msg.textContent = err && err.message === "wrong" ? L("كلمة السر غير صحيحة", "Wrong passphrase") : L("تعذّر التحقق، جرّب تاني", "Could not check, try again"); }); });
}
function pick(pid){
  if (A.ed && A.ed.dirty && A.ed.pid !== pid && !A.ed.warned) { A.ed.warned = true; flash(L("فيه تعديلات لسه ما اتحفظتش. اضغط المشروع تاني لو عايز تسيبها.", "There are unsaved changes. Press the project again to leave them."), true); return; }
  A.pid = pid; A.ed = null; A.host.querySelectorAll("#phL li").forEach(li => li.classList.toggle("on", +li.dataset.i === pid)); renderMain();
}
function startEd(){
  const l = S.items[A.pid] || [];
  A.ed = {pid: A.pid, dirty: false, list: l.map(e => ({sha: e.sha, cap: capOf(e), cap0: capOf(e), url: S.done.get(e.sha) || "", isNew: false}))};
}
function renderMain(){
  const m = A.host.querySelector("#phM"), p = X.P[A.pid]; if (!p) return renderIntro();
  if (!A.ed || A.ed.pid !== A.pid) startEd();
  const ed = A.ed, mod = S.on.items && S.on.items[p.i];
  m.innerHTML = `<div class="ph-hd"><h3 class="adm-ttl">${E(p.n)}${mod ? `<em>${L("معدّلة أونلاين", "edited online")}</em>` : ""}${ed.dirty ? `<em class="dirty">${L("تعديلات لم تُحفظ", "unsaved")}</em>` : ""}</h3>
      <div class="adm-hint">${E(p.mn || "")} · ${L("مشروع رقم", "Project")} ${nf(p.i)} · <b>${nf(ed.list.length)}</b> ${L("صورة", "photos")}</div></div>
    ${keyBox()}
    <div class="ph-grid" id="phG">${ed.list.map((e, k) => tile(e, k, ed.list.length)).join("")}
      <button type="button" class="ph-add" data-a="add"><b>+</b><span>${L("إضافة صور", "Add photos")}</span><small>${L("أو اسحب الصور هنا", "or drop photos here")}</small></button></div>
    <div class="ph-bar"><button type="button" class="ph-save" data-a="save"${ed.dirty && S.key && ONLINE ? "" : " disabled"}>${L("حفظ أونلاين", "Save online")}</button>
      <button type="button" data-a="undo"${ed.dirty ? "" : " disabled"}>${L("إلغاء التعديلات", "Discard changes")}</button>
      ${mod ? `<button type="button" data-a="orig">${L("رجوع للصور الأصلية", "Back to the original photos")}</button>` : ""}
      <button type="button" data-a="view"${ed.list.length ? "" : " disabled"}>${L("افتح الشو روم", "Open the showroom")}</button>
      <span class="ph-st" id="phSt"></span></div>
    <input type="file" id="phF" accept="image/*" multiple hidden>`;
  bindKey(m);
  ed.list.forEach((e, k) => { if (!e.url) urlOf(e.sha).then(u => { e.url = u; const im = m.querySelector(`.ph-t[data-k="${k}"] .im`); if (im && A.ed === ed) { im.style.backgroundImage = `url("${u}")`; im.classList.add("on"); } }, () => {}); });
  const fi = m.querySelector("#phF"); let repK = -1;
  fi.addEventListener("change", () => { const fs = [...fi.files]; fi.value = ""; if (fs.length) addFiles(fs, repK); repK = -1; });
  m.querySelector("#phG").addEventListener("click", e => {
    const b = e.target.closest("button[data-a]"); if (!b) return; const t = b.closest(".ph-t"), k = t ? +t.dataset.k : -1, a = b.dataset.a;
    if (a === "add") { repK = -1; fi.multiple = true; fi.click(); return; }
    if (a === "rep") { repK = k; fi.multiple = false; fi.click(); return; }
    if (a === "l" && k > 0) { swap(k, k - 1); return; }
    if (a === "r" && k < ed.list.length - 1) { swap(k, k + 1); return; }
    if (a === "cv" && k > 0) { const [x] = ed.list.splice(k, 1); ed.list.unshift(x); touch(); return; }
    if (a === "del") { if (!b.classList.contains("arm")) { b.classList.add("arm"); b.textContent = L("تأكيد الحذف", "Confirm"); setTimeout(() => { if (b.isConnected) { b.classList.remove("arm"); b.textContent = L("حذف", "Delete"); } }, 5000); return; }
      ed.list.splice(k, 1); touch(); }
  });
  m.querySelector("#phG").addEventListener("input", e => { const i = e.target.closest("input.ph-cap"); if (!i) return; const k = +i.closest(".ph-t").dataset.k; ed.list[k].cap = i.value.slice(0, 160); ed.dirty = true; syncBar(); });
  const g = m.querySelector("#phG");
  g.addEventListener("dragover", e => { e.preventDefault(); g.classList.add("drop"); });
  g.addEventListener("dragleave", () => g.classList.remove("drop"));
  g.addEventListener("drop", e => { e.preventDefault(); g.classList.remove("drop"); const fs = [...(e.dataTransfer && e.dataTransfer.files || [])].filter(f => /^image\//.test(f.type)); if (fs.length) addFiles(fs, -1); });
  m.querySelector(".ph-bar").addEventListener("click", e => { const b = e.target.closest("button[data-a]"); if (!b || b.disabled) return; const a = b.dataset.a;
    if (a === "save") save();
    if (a === "undo") { startEd(); renderMain(); }
    if (a === "view") { const pp = X.P[A.pid]; if (ed.dirty) { flash(L("الشو روم بيعرض الصور المحفوظة. احفظ الأول عشان تشوف التعديل.", "The showroom shows saved photos. Save first to see the change."), true); return; } X.admClose && X.admClose(); X.shOpen(pp.i); }
    if (a === "orig") { if (!b.classList.contains("arm")) { b.classList.add("arm"); b.textContent = L("تأكيد: رجوع للصور الأصلية", "Confirm: back to the originals"); setTimeout(() => { if (b.isConnected) { b.classList.remove("arm"); b.textContent = L("رجوع للصور الأصلية", "Back to the original photos"); } }, 6000); return; } revert(); }
  });
}
function tile(e, k, n){
  return `<div class="ph-t${e.isNew ? " new" : ""}" data-k="${k}"><div class="im${e.url ? " on" : ""}"${e.url ? ` style="background-image:url('${e.url}')"` : ""}><b>${nf(k + 1)}</b>${k === 0 ? `<span class="cv">${L("الغلاف", "Cover")}</span>` : ""}${e.isNew ? `<span class="nw">${L("جديدة", "New")}</span>` : ""}</div>
    <input type="text" class="ph-cap" value="${E(e.cap || "")}" maxlength="160" placeholder="${E(L("تعليق على الصورة (اختياري)", "Caption (optional)"))}">
    <div class="ac"><button type="button" data-a="l" title="${E(L("قبلها", "Earlier"))}"${k ? "" : " disabled"}>›</button><button type="button" data-a="r" title="${E(L("بعدها", "Later"))}"${k < n - 1 ? "" : " disabled"}>‹</button>
      <button type="button" data-a="cv"${k ? "" : " disabled"}>${L("غلاف", "Cover")}</button><button type="button" data-a="rep">${L("استبدال", "Replace")}</button><button type="button" data-a="del" class="del">${L("حذف", "Delete")}</button></div></div>`;
}
function swap(a, b){ const l = A.ed.list; [l[a], l[b]] = [l[b], l[a]]; touch(); }
function touch(){ A.ed.dirty = true; renderMain(); }
function syncBar(){ const m = A.host.querySelector("#phM"), s = m.querySelector('[data-a="save"]'), u = m.querySelector('[data-a="undo"]'); if (s) s.disabled = !(A.ed.dirty && S.key && ONLINE); if (u) u.disabled = !A.ed.dirty; }
function flash(t, bad){ const s = A.host && A.host.querySelector("#phSt"); if (s) { s.textContent = t; s.classList.toggle("bad", !!bad); } }
function addFiles(fs, repK){
  const ed = A.ed; flash(L("جارٍ تجهيز الصور…", "Preparing the photos…"));
  Promise.all(fs.map(f => shrink(f).then(r => shaOf(r.blob).then(sha => Object.assign(r, {sha, name: f.name})), () => null))).then(rs => {
    if (A.ed !== ed) return; rs = rs.filter(Boolean); if (!rs.length) { flash(L("الملف ده مش صورة مقروءة", "That file is not a readable picture"), true); return; }
    const neu = rs.map(r => ({sha: r.sha, cap: "", cap0: "", url: URL.createObjectURL(r.blob), isNew: true, blob: r.blob, w: r.w, h: r.h, t: r.t}));
    if (repK >= 0) ed.list.splice(repK, 1, neu[0]); else ed.list.push(...neu.filter(x => !ed.list.some(y => y.sha === x.sha)));
    touch(); flash(repK >= 0 ? L("اتبدّلت الصورة. اضغط «حفظ أونلاين» لتثبيت التعديل.", "Replaced. Press «Save online» to keep it.") : L(`اتضافت ${nf(neu.length)} صورة. اضغط «حفظ أونلاين» لتثبيت التعديل.`, `${neu.length} added. Press «Save online» to keep them.`));
  });
}
function save(){
  if (A.busy || !A.ed || !A.ed.dirty) return; if (!S.key) { flash(L("ادخل بكلمة السر الأول", "Sign in first"), true); return; }
  const ed = A.ed, pid = ed.pid; A.busy = true; flash(L("جارٍ الحفظ أونلاين…", "Saving online…"));
  A.host.querySelectorAll(".ph-bar button").forEach(b => b.disabled = true);
  const fresh = ed.list.filter(e => e.isNew && !S.imgs.has(e.sha)), groups = []; let cur = null;
  fresh.forEach(e => { if (!cur || cur.size + e.blob.size > 3600000) { cur = {size: 0, items: []}; groups.push(cur); } cur.items.push(e); cur.size += e.blob.size; });
  const packs = {};
  const upl = groups.reduce((pr, gp) => pr.then(() => { let off = 0; const o = gp.items.map(e => { const r = [e.sha, off, e.blob.size, e.w, e.h, "", e.t === "image/jpeg" ? "j" : "w"]; off += e.blob.size; return r; });
      return api("?a=pack&room=" + ROOM, {method: "POST", headers: {"content-type": "application/octet-stream"}, body: new Blob(gp.items.map(e => e.blob))}).then(j => { packs[j.pk] = {o}; }); }), Promise.resolve());
  upl.then(() => api("?a=save&room=" + ROOM, {method: "POST", headers: {"content-type": "application/json"},
      body: JSON.stringify({packs, items: {[pid]: ed.list.map(e => { const m = S.imgs.get(e.sha), c0 = m ? m.cap : ""; return (e.cap || "") === (c0 || "") && !e.isNew ? [e.sha] : [e.sha, e.cap || ""]; })}})}))
    .then(j => { S.on = j; merge(); ed.list.filter(e => e.isNew).forEach(e => { S.done.set(e.sha, e.url); S.url.set(e.sha, Promise.resolve(e.url)); });
      A.busy = false; startEd(); renderMain(); renderList(); cardRefresh(pid); flash(L("اتحفظ أونلاين ✓ أي حد يفتح الخريطة دلوقتي هيشوف الصور الجديدة.", "Saved online ✓ Everyone who opens the map now sees the new photos.")); })
    .catch(err => { A.busy = false; renderMain(); flash(err && err.key ? L("كلمة السر اتغيّرت أو انتهت. ادخل تاني.", "The passphrase changed or expired. Sign in again.") : L("تعذّر الحفظ أونلاين. التعديلات لسه هنا، جرّب تاني.", "Could not save online. Your changes are still here; try again."), true); });
}
function revert(){
  if (A.busy || !S.key) { if (!S.key) flash(L("ادخل بكلمة السر الأول", "Sign in first"), true); return; }
  const pid = A.pid; A.busy = true; flash(L("جارٍ الرجوع للصور الأصلية…", "Restoring the originals…"));
  api("?a=save&room=" + ROOM, {method: "POST", headers: {"content-type": "application/json"}, body: JSON.stringify({drop: [pid]})})
    .then(j => { S.on = j; merge(); A.busy = false; startEd(); renderMain(); renderList(); cardRefresh(pid); flash(L("رجعت الصور الأصلية ✓", "The original photos are back ✓")); })
    .catch(err => { A.busy = false; renderMain(); flash(err && err.key ? L("ادخل بكلمة السر تاني", "Sign in again") : L("تعذّر الحفظ، جرّب تاني", "Could not save, try again"), true); });
}

/* ---------------- a photo full screen: press a picture on the showroom wall ----------------
   «رجوع» (or Esc, or a press outside the picture) goes back to the showroom; the arrows, the keys and a swipe move through the photos. */
const LB = {el: null, list: [], k: 0, p: null, sx: null};
const CHEV = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
function lbBuild(){
  const el = document.createElement("div"); el.className = "egph-lb"; el.hidden = true; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true");
  el.innerHTML = `<div class="egph-lb-top"><button type="button" class="egph-lb-bk" data-a="x">${CHEV}<span></span></button><div class="egph-lb-t"><b></b><span></span></div></div>
    <div class="egph-lb-st"><img alt="" draggable="false"><p class="egph-lb-cap"></p></div>
    <button type="button" class="egph-lb-nv prev" data-a="prev">${CHEV}</button><button type="button" class="egph-lb-nv next" data-a="next">${CHEV}</button>
    <div class="egph-lb-th"></div>`;
  el.addEventListener("click", e => { const b = e.target.closest("[data-a]"); if (b) { e.stopPropagation(); const a = b.dataset.a; if (a === "x") lbClose(); else if (a === "prev") lbGo(-1); else if (a === "next") lbGo(1); else if (a === "k") lbShow(+b.dataset.k); return; }
    if (!e.target.closest("img,.egph-lb-th,.egph-lb-top,.egph-lb-cap")) lbClose(); });
  el.addEventListener("pointerdown", e => { if (e.target.closest("button")) return; LB.sx = {x: e.clientX, y: e.clientY}; });
  el.addEventListener("pointerup", e => { const s = LB.sx; LB.sx = null; if (!s) return; const dx = e.clientX - s.x, dy = e.clientY - s.y; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) lbGo(dx > 0 ? 1 : -1); });
  document.body.appendChild(el); LB.el = el; return el;
}
function lbOpen(p, list, k){
  const el = LB.el || lbBuild(); LB.list = list.filter(it => !it.ph); LB.p = p; if (!LB.list.length) return;
  el.style.setProperty("--c", (X && X.SECC && X.SECC[p.sc]) || "#46d7cf");
  const app = document.getElementById("app"); el.style.top = app && app.style.marginTop || "";
  el.querySelector(".egph-lb-bk span").textContent = L("رجوع", "Back");
  el.querySelector(".egph-lb-t b").textContent = p.n || "";
  el.querySelector(".egph-lb-nv.prev").setAttribute("aria-label", L("السابقة", "Previous")); el.querySelector(".egph-lb-nv.next").setAttribute("aria-label", L("التالية", "Next"));
  el.querySelector(".egph-lb-th").innerHTML = LB.list.length > 1 ? LB.list.map((it, i) => `<button type="button" data-a="k" data-k="${i}" aria-label="${i + 1}"><i style="background-image:url('${it.url}')"></i></button>`).join("") : "";
  el.hidden = false; void el.offsetWidth; el.classList.add("on"); lbShow(Math.max(0, Math.min(LB.list.length - 1, k)));
}
function lbShow(k){
  const n = LB.list.length; if (!n) return; LB.k = (k + n) % n; const it = LB.list[LB.k], el = LB.el, im = el.querySelector("img");
  im.classList.remove("in"); void im.offsetWidth; im.src = it.url; im.classList.add("in");
  el.querySelector(".egph-lb-t span").textContent = n > 1 ? nf(LB.k + 1) + " / " + nf(n) : "";
  const c = el.querySelector(".egph-lb-cap"); c.textContent = it.cap || ""; c.hidden = !it.cap;
  el.querySelectorAll(".egph-lb-nv").forEach(b => { b.hidden = n < 2; });
  el.querySelectorAll(".egph-lb-th button").forEach((b, i) => { b.classList.toggle("on", i === LB.k); if (i === LB.k) b.scrollIntoView({block: "nearest", inline: "center"}); });
  [1, -1].forEach(d => { const x = LB.list[(LB.k + d + n) % n]; if (x && x.url) { const i2 = new Image(); i2.src = x.url; } });
}
function lbGo(d){ if (LB.list.length > 1) lbShow(LB.k + (EN() ? d : d)); }
function lbClose(){ const el = LB.el; if (!el || el.hidden) return; el.classList.remove("on"); setTimeout(() => { if (!el.classList.contains("on")) el.hidden = true; }, 260); }
const lbOpenNow = () => !!(LB.el && !LB.el.hidden && LB.el.classList.contains("on"));
addEventListener("keydown", e => { if (!lbOpenNow()) return;
  if (e.key === "Escape" || e.key === "Backspace") { e.preventDefault(); e.stopPropagation(); lbClose(); }
  else if (e.key === "ArrowLeft") { e.preventDefault(); e.stopPropagation(); lbGo(EN() ? -1 : 1); }
  else if (e.key === "ArrowRight") { e.preventDefault(); e.stopPropagation(); lbGo(EN() ? 1 : -1); }
  else if (e.key === " " || e.key === "PageDown" || e.key === "PageUp") { e.preventDefault(); e.stopPropagation(); lbGo(e.key === "PageUp" ? -1 : 1); } }, true);
/* a press (not a drag) on a lit picture of the wall */
let pdn = null;
function pvCanvas(){ const V = X && X.PV; return V && V.on && V.sr && V.r && V.r.domElement ? V.r.domElement : null; }
document.addEventListener("pointerdown", e => { const cv = pvCanvas(); if (!cv || e.target !== cv || lbOpenNow()) { pdn = null; return; } pdn = {x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId}; }, true);
document.addEventListener("pointerup", e => { const d = pdn; pdn = null; if (!d || e.pointerId !== d.id) return; if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 10 || performance.now() - d.t > 650) return; wallPick(e); }, true);
function wallPick(e){
  try {
    const V = X.PV, B = V.B, car = B && B.car, cv = pvCanvas(); if (!car || !car.slots || !V.cam || !cv || !window.THREE) return;
    const r = cv.getBoundingClientRect(), v = new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), rc = new THREE.Raycaster();
    rc.setFromCamera(v, V.cam);
    const hit = rc.intersectObjects(car.slots.map(s => s.mesh), false).find(h => h.object.material && h.object.material.opacity > .35); if (!hit) return;
    const map = hit.object.material.map, k = car.list.findIndex(it => car.tex && car.tex[it.n] === map); if (k < 0 || car.list[k].ph) return;
    const p = B.p || (X.P && X.P[V.pi]); if (p) lbOpen(p, car.list, k);
  } catch (err) { console.warn("photos: wall pick", err); }
}

/* ---------------- styles ---------------- */
function css(){
  const st = document.createElement("style"); st.id = "egph-css"; st.textContent = `
.egph{margin:.15rem 0 .75rem}
.egph[hidden]{display:none}
.egph-b{display:flex;align-items:center;gap:.75rem;width:100%;padding:.45rem .55rem;border:1px solid rgba(var(--cs,70,215,207),.38);border-radius:.5rem;background:linear-gradient(90deg,rgba(var(--cs,70,215,207),.13),rgba(var(--cs,70,215,207),.04));color:var(--ink,#f3eee5);cursor:pointer;font:inherit;text-align:start;touch-action:manipulation;transition:border-color .2s,background .2s}
.egph-b:hover{border-color:rgba(var(--cs,70,215,207),.75)}
.egph-t{flex:none;display:grid;justify-items:center;gap:.05rem;min-width:3.4rem}
.egph-t svg{width:1.35rem;height:1.35rem;fill:none;stroke:var(--c,#46d7cf);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.egph-t b{font:600 .74rem var(--f-head,sans-serif);color:var(--dim,#c9c2b6)}
.egph-t em{font:700 1.15rem/1 var(--f-num,var(--f-head,sans-serif));font-style:normal;color:var(--c,#46d7cf)}
.egph-r{flex:1;min-width:0;display:flex;gap:.35rem}
.egph-r i{flex:1 1 0;min-width:0;max-width:6rem;aspect-ratio:16/10;border-radius:.3rem;background:#0b2233 center/cover no-repeat;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);opacity:.35;transition:opacity .6s}
.egph-r i.on{opacity:1}
.egph-go{flex:none;display:flex;align-items:center;gap:.3rem;font:600 .82rem var(--f-head,sans-serif);color:var(--c,#46d7cf)}
.egph-go i{font-style:normal;font-size:1.15rem}
.egph-lb{position:fixed;inset:0;z-index:2147483000;display:grid;grid-template-rows:auto minmax(0,1fr) auto;background:radial-gradient(120% 90% at 50% 40%,rgba(8,24,52,.97),rgba(2,8,20,.985));-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);opacity:0;transition:opacity .25s;direction:rtl;font-family:var(--f-head,sans-serif);color:#fff;touch-action:none;user-select:none;-webkit-user-select:none}
.egph-lb.on{opacity:1}
.egph-lb[hidden]{display:none}
.egph-lb-top{display:flex;align-items:center;gap:1rem;padding:1rem 1.2rem .4rem;direction:ltr}
.egph-lb-bk{flex:none;direction:rtl;display:inline-flex;align-items:center;gap:.45rem;min-height:3rem;padding:0 1.15rem 0 .85rem;border-radius:2rem;border:1px solid rgba(255,255,255,.22);background:rgba(4,16,40,.7);color:#fff;font:600 1.05rem var(--f-head,sans-serif);cursor:pointer;touch-action:manipulation}
.egph-lb-bk:hover{border-color:var(--c)}
.egph-lb-bk svg{width:1.2rem;height:1.2rem;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.egph-lb-t{flex:1;min-width:0;display:flex;align-items:baseline;justify-content:flex-start;gap:.9rem;direction:rtl;text-align:right}
.egph-lb-t b{font-size:clamp(1rem,1.6vw,1.45rem);font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.egph-lb-t span{flex:none;font:700 1rem var(--f-num,var(--f-head,sans-serif));color:color-mix(in srgb,var(--c) 55%,#fff)}
.egph-lb-st{position:relative;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.7rem;padding:.4rem 6.5rem}
.egph-lb-st img{max-width:100%;max-height:calc(100% - 2.6rem);min-height:0;object-fit:contain;border-radius:.4rem;box-shadow:0 18px 60px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.08)}
.egph-lb-st img.in{animation:egphIn .35s cubic-bezier(.2,.9,.25,1)}
@keyframes egphIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}
.egph-lb-cap{margin:0;max-width:60rem;font:500 1rem/1.5 var(--f-body,var(--f-head,sans-serif));color:rgba(255,255,255,.78);text-align:center}
.egph-lb-cap[hidden]{display:none}
.egph-lb-nv{position:absolute;top:50%;width:4rem;height:4rem;margin-top:-2rem;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(4,16,40,.65);color:#fff;cursor:pointer;display:grid;place-items:center;touch-action:manipulation}
.egph-lb-nv:hover{border-color:var(--c);background:rgba(4,16,40,.85)}
.egph-lb-nv svg{width:1.7rem;height:1.7rem;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.egph-lb-nv.prev{right:1.2rem}
.egph-lb-nv.next{left:1.2rem}
.egph-lb-nv.next svg{transform:scaleX(-1)}
.egph-lb-nv[hidden]{display:none}
.egph-lb-th{display:flex;gap:.45rem;justify-content:center;overflow-x:auto;scrollbar-width:none;padding:.5rem 1.2rem 1.1rem}
.egph-lb-th::-webkit-scrollbar{display:none}
.egph-lb-th button{flex:none;width:5.4rem;aspect-ratio:16/10;padding:0;border-radius:.3rem;border:2px solid transparent;background:none;cursor:pointer;opacity:.5;transition:opacity .2s,border-color .2s;touch-action:manipulation}
.egph-lb-th button i{display:block;width:100%;height:100%;border-radius:.2rem;background:#0b2233 center/cover no-repeat}
.egph-lb-th button.on{opacity:1;border-color:var(--c)}
.egph-lb-th button:hover{opacity:.9}
@media (max-width:760px){.egph-lb-st{padding:.4rem .6rem}.egph-lb-nv{width:3rem;height:3rem;margin-top:-1.5rem;top:auto;bottom:5.6rem}}
.egph-ld{position:fixed;left:50%;top:1.2rem;z-index:120;transform:translate(-50%,-.6rem);display:flex;align-items:center;gap:.6rem;padding:.55rem 1rem;border-radius:2rem;background:rgba(4,16,36,.88);border:1px solid rgba(70,215,207,.35);color:#eaf6ff;font:600 .9rem var(--f-head,sans-serif);opacity:0;pointer-events:none;transition:opacity .25s,transform .25s;direction:rtl}
.egph-ld.on{opacity:1;transform:translate(-50%,0)}
.egph-ld i{width:.9rem;height:.9rem;border-radius:50%;border:2px solid rgba(70,215,207,.3);border-top-color:#46d7cf;animation:egphSpin .8s linear infinite}
@keyframes egphSpin{to{transform:rotate(360deg)}}
.adm .ph-flt{display:flex;gap:.3rem;flex-wrap:wrap}
.adm .ph-flt button{flex:1 1 auto;min-height:max(40px,2.5rem);padding:0 .7rem;font-size:.84rem}
.adm .ph-flt button[aria-pressed="true"]{border-color:var(--amber);background:rgba(255,174,87,.14);color:var(--sand)}
.adm .ph-list li>em{min-width:2rem;text-align:center}
.adm .ph-list li>em.ph-0{color:var(--mute);border-color:var(--line)}
.adm .ph-list li>em.ph-mod{color:#7fe0a2;border-color:rgba(127,224,162,.5)}
.adm .ph-list li.ph-none{cursor:default;color:var(--mute)}
.adm .ph-main{display:flex;flex-direction:column;gap:.8rem}
.adm .ph-hd .adm-ttl em.dirty{color:#ffd28a;border-color:rgba(255,210,138,.6)}
.adm .ph-key{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;padding:.6rem .8rem;border:1px solid var(--line-2);border-radius:.35rem;background:rgba(255,174,87,.06);font-size:.88rem;color:var(--sand)}
.adm .ph-key input[type=password]{flex:1 1 12rem;width:auto;min-height:max(44px,2.75rem);padding:.45rem .7rem;border-radius:.35rem;border:1px solid var(--line-2);background:rgba(var(--pd),.6);color:var(--ink);font:inherit}
.adm .ph-key .ph-rem{display:flex;align-items:center;gap:.35rem;font-size:.8rem;color:var(--dim)}
.adm .ph-key .ph-msg{font-weight:500;color:#ffb0b0}
.adm .ph-key.ok{background:rgba(127,224,162,.07);border-color:rgba(127,224,162,.4);color:#bdf0cf}
.adm .ph-key.ok i{width:.6rem;height:.6rem;border-radius:50%;background:#7fe0a2;box-shadow:0 0 10px #7fe0a2}
.adm .ph-key.ok span{flex:1}
.adm .ph-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(14.5rem,1fr));gap:.8rem;align-content:start;padding:.2rem;border-radius:.4rem;transition:background .2s}
.adm .ph-grid.drop{background:rgba(255,174,87,.1);outline:2px dashed var(--amber)}
.adm .ph-t{display:flex;flex-direction:column;gap:.4rem;padding:.45rem;border:1px solid var(--line);border-radius:.4rem;background:rgba(255,255,255,.035)}
.adm .ph-t.new{border-color:rgba(127,224,162,.55)}
.adm .ph-t .im{position:relative;aspect-ratio:16/10;border-radius:.3rem;background:#071a33 center/contain no-repeat;box-shadow:inset 0 0 0 1px rgba(255,255,255,.07)}
.adm .ph-t .im b{position:absolute;top:.35rem;inset-inline-start:.35rem;min-width:1.6rem;height:1.6rem;display:grid;place-items:center;border-radius:1rem;background:rgba(4,16,36,.8);font:700 .8rem var(--f-num);color:#fff}
.adm .ph-t .im .cv,.adm .ph-t .im .nw{position:absolute;bottom:.35rem;inset-inline-start:.35rem;padding:.1rem .5rem;border-radius:1rem;font:600 .72rem var(--f-head);background:var(--amber);color:#2a1503}
.adm .ph-t .im .nw{inset-inline-start:auto;inset-inline-end:.35rem;background:#7fe0a2;color:#06301a}
.adm .ph-t input.ph-cap{min-height:max(40px,2.5rem);font-size:.86rem;padding:.35rem .6rem}
.adm .ph-t .ac{display:flex;gap:.3rem;flex-wrap:wrap}
.adm .ph-t .ac button{flex:1 1 auto;min-height:max(40px,2.5rem);padding:0 .55rem;font-size:.8rem}
.adm .ph-t .ac button[data-a="l"],.adm .ph-t .ac button[data-a="r"]{flex:0 0 2.6rem;font-size:1.1rem}
.adm .ph-t .ac button:disabled{opacity:.35;cursor:default}
.adm .ph-t .ac .del{color:#ffb0b0}
.adm .ph-t .ac .del.arm,.adm .ph-bar button.arm{border-color:#ff7b7b;background:rgba(255,123,123,.16);color:#fff}
.adm .ph-add{min-height:12rem;flex-direction:column;gap:.3rem;border-style:dashed !important;border-color:var(--line-2) !important;background:rgba(255,255,255,.02) !important}
.adm .ph-add b{font:300 2.6rem/1 var(--f-head);color:var(--amber)}
.adm .ph-add small{font-size:.74rem;color:var(--mute)}
.adm .ph-bar{position:sticky;bottom:-.9rem;display:flex;gap:.5rem;flex-wrap:wrap;align-items:center;padding:.7rem 0 .2rem;background:linear-gradient(transparent,rgba(var(--pd),.95) 30%)}
.adm .ph-bar .ph-save{border-color:var(--amber);background:rgba(255,174,87,.2);color:var(--sand);font-weight:600}
.adm .ph-bar button:disabled{opacity:.4;cursor:default}
.adm .ph-st{font-size:.85rem;color:#7fe0a2}
.adm .ph-st.bad{color:#ffb0b0}
`; document.head.appendChild(st);
}

/* ---------------- hand-over from the map ---------------- */
function init(o){
  X = o || {}; if (!document.getElementById("egph-css")) css();
  try {
    if (X.admEl && !X.admEl.querySelector('[data-tab="photos"]')) {
      const tabs = X.admEl.querySelector(".adm-tabs"), tb = document.createElement("button");
      tb.type = "button"; tb.setAttribute("role", "tab"); tb.dataset.tab = "photos"; tb.setAttribute("aria-selected", "false"); tb.textContent = L("الصور", "Photos");
      if (tabs) { tabs.insertBefore(tb, tabs.children[1] || null); tb.addEventListener("click", () => X.admShowTab && X.admShowTab("photos")); }
      const pn = document.createElement("div"); pn.className = "adm-p"; pn.dataset.p = "photos"; pn.hidden = true; const bd = X.admEl.querySelector(".adm-bd"); if (bd) bd.appendChild(pn);
    }
  } catch (e) { console.warn("photos: settings tab", e); }
  /* the comment strip moves the map (#app) down; Settings is outside #app, so it follows the same offset */
  try { const app = document.getElementById("app"), sync = () => { if (X.admEl && app) { const t = app.style.marginTop || ""; if (X.admEl.style.top !== t) X.admEl.style.top = t; } };
    if (app && X.admEl) { new MutationObserver(sync).observe(app, {attributes: true, attributeFilter: ["style"]}); addEventListener("resize", sync); sync(); } } catch (e) {}
  load();
}
/* ---------------- the hooks: added to the map program as the room loads it ----------------
   The room's loader fetches the program (app/app.0.txt + app.1.txt) and appends it as one blob script; this file is loaded before it,
   adds one line at each of these places, then lets the program run. Nothing in the program files themselves needs to change,
   so a new version of the map keeps its photos as long as these lines still exist in it. A place that cannot be found is skipped
   (that part of the photos is then missing, the map runs as before). */
const HOOKS = [
  ["A", 'function srList(p){', 'function srList(p){ { const ph = window.EGPH && window.EGPH.list(p); if (ph && ph.length) return ph; }'],
  ["B", 'function shOpen(pi){ if (pi < 0 || inShow()) return;', 'function shOpen(pi){ if (pi < 0 || inShow()) return; if (window.EGPH && P[pi] && window.EGPH.hold(P[pi], () => shOpen(pi))) return;'],
  ["C", '<h2>${esc(p.n)}</h2>', '<h2>${esc(p.n)}</h2>${window.EGPH ? window.EGPH.cardHTML(p) : ""}'],
  ["D", 'openCard(projectHTML(pi), SECC[p.sc], SECRGB[p.sc]);', 'openCard(projectHTML(pi), SECC[p.sc], SECRGB[p.sc]); if (window.EGPH) window.EGPH.cardBind(card, p, () => shOpen(pi));'],
  ["E", 'else if (k === "logos") lgRender(); else admRenderBak(); }', 'else if (k === "logos") lgRender(); else if (k === "photos") { if (window.EGPH) window.EGPH.admin(admEl.querySelector(\'.adm-p[data-p="photos"]\')); } else admRenderBak(); }'],
  ["F", '\nboot();\n})();', '\ntry { if (window.EGPH) window.EGPH.init({P, EN, SECC, admEl, admShowTab, admClose, shOpen, inShow, openProject, PV}); } catch (e) { console.warn("photos", e); }\nboot();\n})();']];
const hooked = [];
function patchProgram(src){
  if (src.indexOf("window.EGPH") >= 0) { hooked.push("native"); return src; }
  let out = src;
  HOOKS.forEach(([k, a, b]) => { const i = out.indexOf(a); if (i < 0 || out.indexOf(a, i + a.length) >= 0) { console.warn("photos: hook " + k + " not applied"); return; } out = out.slice(0, i) + b + out.slice(i + a.length); hooked.push(k); });
  return out;
}
(function interceptProgram(){
  const ap = Node.prototype.appendChild; let left = 1;
  function ours(node){ return node && node.tagName === "SCRIPT" && /^blob:/.test(node.src || "") && !node.__egph; }
  Node.prototype.appendChild = function(node){
    if (left > 0 && this === document.body && ours(node)) {
      node.__egph = 1; const host = this, src = node.src;
      fetch(src).then(r => r.text()).then(t => (t.length > 1e6 && t.indexOf("function srList(p)") >= 0) ? URL.createObjectURL(new Blob([patchProgram(t)], {type: "text/javascript"})) : null)
        .catch(e => { console.warn("photos: program not patched", e); return null; })
        .then(u => { if (u) { left--; node.src = u; try { URL.revokeObjectURL(src); } catch (e) {} } if (left <= 0 && Node.prototype.appendChild === patched) Node.prototype.appendChild = ap; ap.call(host, node); });
      return node;
    }
    return ap.call(this, node);
  };
  const patched = Node.prototype.appendChild;
  setTimeout(() => { if (Node.prototype.appendChild === patched) Node.prototype.appendChild = ap; }, 120000);
})();

window.EGPH = {init, hooked, load, list, ready, prep, hold, cardHTML, cardBind, admin, count: p => count(p), get state(){ return S; }, get x(){ return X; }};
})();
