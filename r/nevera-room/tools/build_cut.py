#!/usr/bin/env python3
"""Nevera Cutting Room: the HRID cutting room with storyboard stills on V1, the mixed audio as the clock, and the film's scenes, VO and figures on the timeline."""
import re,os,sys
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC=os.path.join(R,'..','artifact-files','4464d52a-26fe-4ddf-b417-1b3c0fafdc1a','cut','index.html')
t=open(SRC,encoding='utf-8').read()
def rep(a,b,n=1):
    global t
    c=t.count(a); assert c==n,(c,a[:90]); t=t.replace(a,b)
def sub(pat,b,n=1):
    global t
    t,c=re.subn(pat,lambda m:b,t,flags=re.S); assert c==n,(c,pat[:90])
FUI='"IBM Plex Sans","IBM Plex Sans Arabic",sans-serif'
# ---------- head ----------
rep('<title>HRID Cutting Room</title>','<title>Nevera Cutting Room</title>')
rep('family=IBM+Plex+Sans:wght@400;500;600&family=','family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600&family=')
rep('with V2 model takes, V1 reference animatic and A1 audio.','with the scenes, Auto stage, V2 takes, V1 storyboard, VO, A1 mix and the on-screen figures.')
rep('--head:#ece6da;                       /* ivory: playhead, selection */','--head:#d7c2a4;                       /* Nevera sand: playhead, selection */')
sub(r'--s-dts:#9fbf8a;.*?--s-studio:#8fd0c4;','--s-mp:#d9a95b; --s-ai:#8fb7c4; --s-gfx:#b7a6d6; --s-stage:#9fbf8a; --ok:#9fbf8a;')
rep('--f-ui:"IBM Plex Sans","Helvetica Neue",Arial,sans-serif;','--f-ui:"IBM Plex Sans","IBM Plex Sans Arabic","Helvetica Neue",Arial,sans-serif;')
rep('--tl-h:266px;','--tl-h:298px;')
rep('#sync.ok::before{content:"";display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--s-dts);','#sync.ok::before{content:"";display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--ok);')
rep('#t-live[aria-pressed="true"]{border-color:var(--s-dts);color:var(--s-dts)}','#t-live[aria-pressed="true"]{border-color:var(--ok);color:var(--ok)}')
rep('#frame video{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#000}','#frame video,#f1{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#000}\n#f1wrap{position:absolute;inset:0;overflow:hidden;background:#000}\n#f1{transform-origin:50% 50%;filter:contrast(1.04)}')
rep('#frame.cm-split #v1{width:50%}','#frame.cm-split #f1wrap{width:50%}')
rep('#frame.cm-auto #v1{opacity:0}','#frame.cm-auto #f1wrap{opacity:0}')
rep('@media (max-width:1500px){#cmpmode .lbl{display:none}}','''@media (max-width:1500px){#cmpmode .lbl{display:none}}
#f-scene{flex:1 1 100%;background:var(--panel-2);border:1px solid var(--line);border-radius:5px;padding:4px 6px;font-size:12px;min-width:0}
#prog{display:flex;flex-direction:column;gap:5px;padding:8px 10px;border-bottom:1px solid var(--line)}
#prog .bar{display:flex;height:6px;border-radius:3px;overflow:hidden;background:var(--panel-2)}
#prog .bar i{display:block;height:100%}
#prog .leg{display:flex;flex-wrap:wrap;gap:3px 10px;font:500 11px/1.2 var(--f-mono);color:var(--muted)}
#prog .leg b{font-weight:500;color:var(--text)}
.sc-h{position:sticky;top:0;z-index:2;display:flex;align-items:baseline;justify-content:space-between;gap:8px;padding:7px 10px 5px;background:var(--panel);border-bottom:1px solid var(--line);cursor:pointer}
.sc-h b{font:500 12.5px/1.25 var(--f-ui);min-width:0}
.sc-h small{font:500 10.5px/1 var(--f-mono);color:var(--faint);white-space:nowrap}
.shot .lb{white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;line-height:1.3}
.shot .no{font-size:11px}
.scene-box{display:flex;flex-direction:column;gap:3px;background:var(--panel-2);border:1px solid var(--line);border-radius:5px;padding:8px 10px}
.scene-box small{font:500 10.5px/1.2 var(--f-mono);color:var(--muted);letter-spacing:.04em}
.scene-box b{font:500 14px/1.3 var(--f-ui)}
.scene-box span{color:var(--muted);font-size:12px;line-height:1.4}
.vo-line{display:flex;flex-direction:column;gap:2px;border-inline-start:2px solid var(--s-ai);padding-inline-start:8px;font-size:12px;line-height:1.4}
.vo-line em{font-style:normal;color:var(--muted)}
.figs{display:flex;flex-wrap:wrap;gap:4px}
.fig{background:var(--panel-2);border:1px solid var(--line);border-radius:4px;padding:3px 7px;font-size:11.5px;line-height:1.3}
.fig b{font-weight:600;font-family:var(--f-mono);margin-inline-end:5px}
#caps{position:absolute;left:6%;right:6%;bottom:5%;display:flex;flex-direction:column;align-items:center;gap:6px;pointer-events:none;z-index:2;text-align:center}
#caps .cap-vo{background:rgba(0,0,0,.62);padding:5px 12px;border-radius:3px;font-size:clamp(12px,1.5cqw,17px);line-height:1.45;max-width:100%}
#caps .cap-fig{display:flex;flex-wrap:wrap;justify-content:center;gap:4px 12px;font-size:clamp(11px,1.15cqw,14px);background:rgba(0,0,0,.5);padding:4px 10px;border-radius:3px}
#caps .cap-fig b{font-family:var(--f-mono);font-weight:500;color:var(--head);margin-inline-end:5px}
#frame:is(.cm-split,.cm-pip,.cm-auto) #caps{display:none}
input[type=file].up{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
.pair input[dir]{font-family:var(--f-ui);font-size:12.5px}
#b-lab{font-family:var(--f-ui)}
.lb,.scene-box b{unicode-bidi:plaintext}''')
# ---------- markup ----------
rep('<a class="back" href="../index.html">&larr; Models</a>','<a class="back" href="../index.html">&larr; Film room</a>')
rep('<span class="seq">HRID &ldquo;One Line&rdquo; &middot; reference animatic, 31 Oct &middot; 60 s &middot; 25 fps</span>','<span class="seq">Nevera &middot; storyboard animatic v5, 29 Oct &middot; 5:25 &middot; 16 scenes &middot; 25 fps</span>')
rep('title="Download frames, prompt and timing for each shot, ready for Seedance"','title="Download the frame, prompt and timing of each shot in the list, ready for Seedance"')
rep('<div id="filters" role="group" aria-label="Filter shots"></div>','<div id="prog" aria-label="Where the shots stand"></div>\n    <div id="filters" role="group" aria-label="Filter shots"></div>')
rep('<video id="v1" src="video/ref_2026-10-31.mp4" preload="auto" playsinline></video>','<div id="f1wrap"><img id="f1" alt="Storyboard frame of the current shot"></div>\n        <audio id="v1" src="audio/mix.mp3" preload="auto"></audio>')
rep('<div id="tcbig">00:00:00:00</div>','<div id="tcbig">00:00:00:00</div>\n        <div id="caps"></div>')
rep('<div id="livebox" hidden></div>','<img id="stillb" alt="3D frame of this shot" hidden>\n        <div id="livebox" hidden></div>')
t=t.replace(':is(#livebox,#v2)',':is(#livebox,#v2,#stillb)')
rep('#frame video,#f1{position:absolute;','#stillb{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none}\n#frame video,#f1{position:absolute;')
rep('<span id="b-no">SH01</span>','<span id="b-no">SH001</span>')
rep('<span>REFERENCE</span>','<span>STORYBOARD</span>')
rep('title="Show model takes over the reference (V)"','title="Show the takes over the storyboard"')
rep('<span class="lbl">V2 takes</span>','<span class="lbl">Takes</span>')
rep('title="Lower it to see the reference through the take"','title="Lower it to see the storyboard through the take"')
rep('aria-label="Compare the reference with the Auto stage"','aria-label="Compare the storyboard with the 3D or the take"')
rep('title="Reference only (1)"','title="Storyboard only (1)"')
rep('title="The Auto stage over the reference, with the opacity slider (2)"','title="The take or the 3D over the storyboard, with the opacity slider (2)"')
rep('title="Side by side: reference left, Auto stage right (3, S)"','title="Side by side: storyboard left, take or 3D right (3, S)"')
rep('title="One frame, a line you drag between the reference and the Auto stage (4)"','title="One frame, a line you drag between the storyboard and the take or 3D (4)"')
rep('title="The Auto stage small in the corner of the reference (5)"','title="The take or 3D small in the corner of the storyboard (5)"')
rep('title="The Auto stage only (7)"','title="The take or 3D only (7)"')
rep('<input type="range" id="zoom" min="8" max="400" step="1" value="24"','<input type="range" id="zoom" min="2" max="200" step="1" value="4"')
HINT='Click a scene to jump to it. Drag a cut point to trim. Numbers 1 to 7 change the compare view.'
rep('>Click an AS clip to open its Auto stage page. Drag a cut point to trim. S splits the screen.</span>','>'+HINT+'</span>')
rep('<div id="toast" hidden></div>','<datalist id="plots"></datalist>\n  <div id="toast" hidden></div>')
# ---------- constants ----------
rep("const FPS = 25, VER = 'ref-1031';","const FPS = 25, VER = 'v5-1029';\nconst F_UI = '"+FUI+"';")
sub(r"const SOURCES = \{.*?const stageSrc = \(s\) => SOURCES\[stageKey\(s\)\] \|\| SOURCES\.cast;",'''const SOURCES = {
  mp: { name: 'Masterplan 3D', kind: '3D model', page: '../mp/index.html', c: '--s-mp' },
  ai: { name: 'Seedance', kind: 'Seedance', page: null, c: '--s-ai' },
  gfx: { name: 'Edit and graphics', kind: 'graphics', page: null, c: '--s-gfx' },
};
const stageKey = (s) => (s.place && s.place.ar ? 'mp' : s.source);   // every shot with a place opens on the masterplan
const stageSrc = (s) => SOURCES[stageKey(s)] || SOURCES.ai;''')
rep("const STAGES = { cut: { name: 'Cut', c: '--st-cut' }","const STAGES = { cut: { name: 'Storyboard', c: '--st-cut' }")
rep("const v1 = $('#v1'), v2 = $('#v2');","const v1 = $('#v1'), v2 = $('#v2'), f1 = $('#f1');\nconst SHEET = { cols: 16, rows: 7, w: 192, h: 108 };\nlet FILM = { scenes: [], vo: [], sup: [] }, sceneFilter = 'all', needSeed = false;")
rep("let DUR = 60.08;","let DUR = 324.906;")
rep("const shotNo = (s) => 'SH' + String(shots.indexOf(s) + 1).padStart(2, '0');","const shotNo = (s) => 'SH' + String(shots.indexOf(s) + 1).padStart(3, '0');")
# ---------- data: an empty store seeds itself on the first edit ----------
rep("renderList(); renderInspector(); drawTL(); updateBadge();\n}\nasync function writeShot","renderList(); renderInspector(); drawTL(); updateClock();\n}\nasync function writeShot")
rep("async function writeShot(s, fields) {\n  if (!db || !canWrite) return;","async function seedIfNeeded() { if (!needSeed || !db || !canWrite) return; needSeed = false; seeding = true; try { for (const x of shots) { const { id, ...body } = x; await db.doc('shots/' + id).set(body); } } finally { seeding = false; } setSync(); }\nasync function writeShot(s, fields) {\n  if (!db || !canWrite) return;\n  await seedIfNeeded();")
rep("async function setShotDoc(s) { if (!db || !canWrite) return; const { id, ...body } = s;","async function setShotDoc(s) { if (!db || !canWrite) return; await seedIfNeeded(); const { id, ...body } = s;")
rep("async function deleteShotDoc(id) { if (!db || !canWrite) return; await","async function deleteShotDoc(id) { if (!db || !canWrite) return; await seedIfNeeded(); await")
rep("if (!db) { el.textContent = 'Read-only: shots from the automatic cut'; el.className = 'ro'; }","if (!db) { el.textContent = 'Read-only copy: the team edits on the Claude link'; el.className = 'ro'; }")
rep("fallback().then(() => { setSync('No saved shots yet: showing the automatic cut'); });","fallback().then(() => { needSeed = true; setSync('The v5 cut: your first edit saves it for the team'); });")
rep("    if (list.length) setShots(list);","    if (seeding || (list.length && list.length < shots.length - 5)) return;   // the first save writes the shots one by one\n    if (list.length) setShots(list);")
rep("let db = null, assets = null, dl = null, canWrite = false;","let db = null, assets = null, dl = null, canWrite = false, seeding = false;")
rep("toast('Read-only here: the shots come from the automatic cut and cannot be saved.')","toast('This copy is read-only. Edit on the Claude link and it saves for the team.')")
rep("setShots(j.shots.map(s => ({ ...s })));","setShots(j.shots.map(s => ({ ...s })));")
# ---------- bin ----------
sub(r"function renderFilters\(\) \{.*?\n\}\nfunction thumbStyle\(t\) \{.*?\n\}\nfunction renderList\(\) \{.*?\n  markLive\(\);\n\}",'''function renderFilters() {
  const f = [['all', 'All'], ['mp', 'Masterplan 3D'], ['ai', 'Seedance'], ['gfx', 'Graphics']];
  $('#filters').innerHTML = f.map(([k, n]) => `<button class="chip" data-f="${k}" aria-pressed="${k === filter}">${n}</button>`).join('') +
    `<select id="f-scene" aria-label="Show one scene"><option value="all">All 16 scenes</option>${FILM.scenes.map(c => `<option value="${c.n}" ${String(c.n) === sceneFilter ? 'selected' : ''}>${c.n} · ${esc(c.title)}</option>`).join('')}</select>`;
  $$('#filters [data-f]').forEach(b => b.onclick = () => { filter = b.dataset.f; renderFilters(); renderList(); });
  $('#f-scene').onchange = (e) => { sceneFilter = e.target.value; renderList(); if (sceneFilter !== 'all') { const c = FILM.scenes.find(x => String(x.n) === sceneFilter); if (c) seekTo(c.s); } };
}
const inFilter = (s) => (filter === 'all' || s.source === filter) && (sceneFilter === 'all' || String(s.sc) === sceneFilter);
function thumbStyle(s) {
  if (!sprite) return '';
  const k = s.th ?? 0, cw = 72, ch = 40.5;
  return `background-image:url(sprite.jpg);background-size:${SHEET.cols * cw}px ${SHEET.rows * ch}px;background-position:-${(k % SHEET.cols) * cw}px -${Math.floor(k / SHEET.cols) * ch}px`;
}
function renderProgress() {
  const n = Object.fromEntries(Object.keys(STAGES).map(k => [k, 0])); for (const s of shots) n[STAGES[s.stage] ? s.stage : 'cut']++;
  const tot = shots.length || 1;
  $('#prog').innerHTML = `<div class="bar">${Object.entries(STAGES).map(([k, v]) => `<i style="width:${n[k] / tot * 100}%;background:var(${v.c})"></i>`).join('')}</div><div class="leg">${Object.entries(STAGES).map(([k, v]) => `<span>${v.name} <b>${n[k]}</b></span>`).join('')}</div>`;
}
function renderList() {
  const box = $('#list');
  const vis = shots.filter(inFilter);
  $('#count').textContent = `${vis.length} of ${shots.length}`;
  renderProgress();
  let cur = null, html = '';
  for (const s of vis) {
    if (s.sc !== cur) { cur = s.sc; const c = FILM.scenes.find(x => x.n === cur); if (c) html += `<div class="sc-h" data-sc="${c.n}" role="button" tabindex="0" title="Go to this scene"><b dir="auto">${c.n} · ${esc(c.title)}</b><small>${tc(c.s).slice(3, 8)}</small></div>`; }
    const src = SOURCES[s.source] || SOURCES.ai, st = STAGES[s.stage] || STAGES.cut;
    const hasTake = s.take && takes[s.take];
    html += `<div class="shot${s.id === selId ? ' sel' : ''}" data-id="${s.id}" role="button" tabindex="0" aria-label="${shotNo(s)} ${esc(s.desc)}">
      <div class="no">${String(shots.indexOf(s) + 1).padStart(3, '0')}</div>
      <div class="th" style="${thumbStyle(s)}">${hasTake ? '<i title="Has a take"></i>' : ''}</div>
      <div class="meta"><div class="lb" dir="auto">${esc(s.desc)}</div>
      <div class="sub"><span class="tag" style="--c:var(${src.c})">${src.name}</span><span>${(s.tout - s.tin).toFixed(2)} s</span></div>
      <div class="sub"><span class="stage" style="--c:var(${st.c})">${st.name}</span></div></div></div>`;
  }
  box.innerHTML = html || '<p class="empty">No shots in this filter.</p>';
  $$('#list .shot').forEach(el => { el.onclick = () => selectShot(el.dataset.id, true); el.onkeydown = (e) => { if (e.key === 'Enter') selectShot(el.dataset.id, true); }; });
  $$('#list .sc-h').forEach(el => { const go = () => { const c = FILM.scenes.find(x => String(x.n) === el.dataset.sc); if (c) seekTo(c.s); }; el.onclick = go; el.onkeydown = (e) => { if (e.key === 'Enter') go(); }; });
  markLive();
}''')
# ---------- inspector ----------
rep('''<div class="field"><label for="f-label">On-screen label</label><input id="f-label" data-f="label" value="${esc(s.label)}" placeholder="e.g. D.T. SLEMANI" ${ro}></div>
    <div class="field"><label for="f-desc">What happens</label><input id="f-desc" data-f="desc" value="${esc(s.desc)}" ${ro}></div>''','''${sceneBox(s)}
    <div class="field"><label for="f-desc">What happens</label><textarea id="f-desc" data-f="desc" dir="auto" ${ro}>${esc(s.desc)}</textarea></div>
    <div class="pair" style="grid-template-columns:1fr 1fr">
      <div class="field"><label for="f-type">Shot type</label><input id="f-type" data-f="type" dir="auto" value="${esc(s.type)}" ${ro}></div>
      <div class="field"><label for="f-label">Place on the masterplan</label><input id="f-label" data-f="label" dir="auto" list="plots" value="${esc(s.label)}" placeholder="No place yet" ${ro}></div>
    </div>
    ${s.place && !s.place.sure ? `<p class="hint" dir="auto">محتاج تأكيد: ${esc(s.place.note)}</p>` : ''}
    ${s.cast?.length ? `<div class="field"><span class="fl">Cast</span><div class="figs">${s.cast.map(c => `<a class="fig" style="text-decoration:none;color:inherit" href="../cast/index.html" dir="auto" title="${esc(FILM.cast?.[c]?.label || c)}">${esc(FILM.cast?.[c]?.ar || c)}</a>`).join('')}</div></div>` : ''}
    ${timedText(s)}''')
sub(r"\$\{src\.kind === '3D model' \? \(\(\) => \{ const at = autoTakeOf\(s\), m = MOTION.*?</p></div>`; \}\)\(\) : ''\}",'''${src.kind === '3D model' ? (() => { const at = autoTakeOf(s); return `<div class="field"><span class="fl">Auto stage</span><div class="autocard"><div dir="auto">Camera from the board: ${esc(s.type || 'not set')}</div><small>${at ? `Staged, ${esc((at.createdAt || '').slice(0, 16).replace('T', ' '))}` : src.page ? 'Not rendered yet' : 'The masterplan viewer is being built'}</small></div>
      <div class="row">${src.page ? `<a class="btn primary" href="${stageUrl(s)}" style="text-decoration:none">Open Auto stage page</a>` : ''}<button class="btn" id="i-split">${splitOn ? 'Single view' : 'Compare side by side'}</button></div></div>`; })() : ''}''')
rep('''<span class="fl">Model takes on V2</span>''','''<span class="fl">Takes on V2</span>''')
rep('''aria-label="Use take from ${esc(t.model)}" ${ro}><div><div>${esc(SOURCES[t.model]?.name || t.model)}</div>''','''aria-label="Use take from ${esc(t.model)}" ${ro}><div><div dir="auto">${esc(t.name || SOURCES[t.model]?.name || t.model)}</div>''')
rep('''<p class="hint">No takes yet.</p>'}</div></div>''','''<p class="hint">No takes yet.</p>'}</div>${assets && db && canWrite ? `<div class="row"><label class="btn" for="i-up"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /> <polyline points="17 8 12 3 7 8" /> <line x1="12" x2="12" y1="3" y2="15" /></svg>Upload a take</label><input class="up" id="i-up" type="file" accept="video/mp4,video/quicktime,video/webm"></div>` : ''}</div>''')
rep('''<textarea id="f-prompt" data-f="prompt" placeholder="Camera move, light, what changes, references to use" ${ro}>''','''<textarea id="f-prompt" data-f="prompt" dir="auto" placeholder="Camera move, light, what changes, references to use" ${ro}>''')
rep('''<textarea id="f-notes" data-f="notes" ${ro}>''','''<textarea id="f-notes" data-f="notes" dir="auto" ${ro}>''')
sub(r'''<div class="row"><button class="btn" id="i-frames">.*?Save frames \(in, middle, out\)</button></div>`;''','''<div class="row"><button class="btn" id="i-frames"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 22H4a2 2 0 0 1-2-2V6" /> <path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18" /> <circle cx="12" cy="8" r="2" /> <rect width="16" height="16" x="6" y="2" rx="2" /></svg>Save the frame</button></div>`;''')
rep("if (k === 'source' || k === 'stage' || k === 'label') { renderList(); drawTL(); updateBadge(); if (k === 'source') renderInspector(); }","if (k === 'source' || k === 'stage' || k === 'label' || k === 'desc') { renderList(); drawTL(); updateBadge(); if (k === 'source') { renderInspector(); syncV2(true); } }")
rep("$('#i-frames').onclick = () => saveFrames(s);","$('#i-frames').onclick = () => saveFrames(s);\n  const up = $('#i-up'); if (up) up.onchange = (e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) uploadTake(s, f); };")
rep("function updateInspectorTimes() {",'''function sceneBox(s) {
  const c = FILM.scenes.find(x => x.n === s.sc); if (!c) return '';
  return `<div class="scene-box"><small>SCENE ${c.n} · ${esc(c.mv_en || '')}</small><b dir="auto">${esc(c.title)}</b>${c.mus ? `<span dir="auto">${esc(c.mus)}</span>` : ''}</div>`;
}
function timedText(s) {
  const v = FILM.vo.filter(x => x.t < s.tout && x.t + x.dur > s.tin), f = FILM.sup.filter(x => x.t < s.tout && x.e > s.tin);
  if (!v.length && !f.length) return '';
  return `<div class="field"><span class="fl">VO and figures over this shot</span>${v.map(x => `<div class="vo-line"><span dir="ltr">${esc(x.en)}</span><em dir="rtl">${esc(x.ar)}</em></div>`).join('')}${f.length ? `<div class="figs">${f.map(x => `<span class="fig" dir="auto"><b>${esc(x.big)}</b>${esc(x.ar)}</span>`).join('')}</div>` : ''}</div>`;
}
function probeVideo(file) {
  return new Promise((res) => { const u = URL.createObjectURL(file), el = document.createElement('video'); el.preload = 'metadata'; el.muted = true;
    const done = (m) => { URL.revokeObjectURL(u); res(m); };
    el.onloadedmetadata = () => done({ dur: el.duration || 0, w: el.videoWidth || 0, h: el.videoHeight || 0 }); el.onerror = () => done({ dur: 0, w: 0, h: 0 }); setTimeout(() => done({ dur: 0, w: 0, h: 0 }), 8000); el.src = u; });
}
async function uploadTake(s, file) {
  if (!assets || !db || !canWrite) { toast('Uploading a take needs edit access on the Claude link.', 4000); return; }
  if (file.size > 20 * 1024 * 1024) { toast('This file is over 20 MB. Export the take smaller, then upload it.', 5000); return; }
  busy(true, `${shotNo(s)} take`, file.name, 0.2);
  try {
    const m = await probeVideo(file); busy(true, undefined, 'Uploading', 0.5);
    const a = await assets.upload(file);
    const id = 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    await db.doc('takes/' + id).set({ shot: s.id, model: s.source, asset: a.id, dur: m.dur, w: m.w, h: m.h, via: 'upload', name: file.name, handle: 0, createdAt: new Date().toISOString() });
    s.take = id; const f = { take: id }; if (s.stage === 'cut' || !s.stage) { s.stage = s.source === 'ai' ? 'seed' : 'anim'; f.stage = s.stage; }
    await writeShot(s, f); seekTo(s.tin); if (MODE === 'ref') setMode('over', true); $('#opac').value = 1;
    renderList(); renderInspector(); drawTL(); syncV2(true); toast(`${shotNo(s)}: the take is on V2`);
  } catch (e) { toast(`The take was not uploaded (${e?.code || e?.message || 'error'}).`, 5000); }
  busy(false);
}
function updateInspectorTimes() {''')
# ---------- playback ----------
rep("let splitOn = false, MOTION = null, MODE = 'pip', liveOn = true, SCENES = {};","let splitOn = false, MODE = 'over', liveOn = false, SCENES = {};")
rep("localStorage.getItem('hrid.cut.mode')","localStorage.getItem('nevera.cut.mode')")
rep("localStorage.getItem('hrid.cut.live')","localStorage.getItem('nevera.cut.live')")
rep("localStorage.setItem('hrid.cut.mode', m)","localStorage.setItem('nevera.cut.mode', m)")
rep("localStorage.setItem('hrid.cut.live', on ? '1' : '0')","localStorage.setItem('nevera.cut.live', on ? '1' : '0')")
rep("localStorage.setItem('hrid.cut.hide', JSON.stringify(HIDE))","localStorage.setItem('nevera.cut.hide', JSON.stringify(HIDE))",3)
rep("localStorage.getItem('hrid.cut.hide')","localStorage.getItem('nevera.cut.hide')")
rep("  if (!live && ['split', 'wipe', 'pip'].includes(MODE) && !a) { const s = shotAt(t);","  { const s0 = shotAt(t), sb = $('#stillb'), wantS = !live && !a && !['ref', 'over'].includes(MODE) && !!s0?.place?.ar; sb.hidden = !wantS; if (wantS) { const u = `../stage/${s0.id}.jpg`; if (sb.getAttribute('src') !== u) sb.src = u; $('#lab-b').textContent = '3D FRAME · MASTERPLAN'; } else if (!live) labelB(); if (wantS) { $('#split-empty').hidden = true; $('#onion').hidden = true; if (!v2.hidden) { v2.hidden = true; v2.pause(); } return; } }\n  if (!live && ['split', 'wipe', 'pip'].includes(MODE) && !a) { const s = shotAt(t);")
rep("toast(`${src.name} is still being converted. Its Auto stage page opens when the model is ready.`, 4000)","toast(`${src.name} is being built. Its Auto stage page opens when it is ready.`, 4000)")
rep("""se.innerHTML = !s ? '' : src.kind === '3D model' ? `<div><b>${shotNo(s)} is not staged yet</b>${src.page ? 'Turn on Live 3D to see it now, or click its clip on the Auto stage layer (AS) to build and send it.' : esc(src.name) + ' is still being converted.'}</div>` : `<div><b>${shotNo(s)} is ${esc(src.name)}</b>Not made from a model.</div>`; }""","""se.innerHTML = !s ? '' : src.kind === '3D model' ? `<div><b>${shotNo(s)} is not staged yet</b>${src.page ? 'Turn on Live 3D to see it now, or click its clip on the Auto stage layer (AS).' : esc(src.name) + ' is being built.'}</div>` : `<div><b>${shotNo(s)}: ${esc(src.name)}</b>No take yet. Upload one in the shot panel.</div>`; }""")
rep("""$('#onion').textContent = `V2 take: ${SOURCES[a.take.model]?.name || a.take.model}`;""","""$('#onion').textContent = `V2 take: ${a.take.name || SOURCES[a.take.model]?.name || a.take.model}`;""")
rep("$('#b-lab').textContent = s.label || ''; $('#b-src').textContent = (SOURCES[s.source] || SOURCES.cast).name;","$('#b-lab').textContent = s.type || ''; $('#b-src').textContent = (SOURCES[s.source] || SOURCES.ai).name;")
rep("function updateClock() { const t = now(); $('#tc').textContent = tc(t); $('#tcbig').textContent = tc(t); updateBadge(); }",'''const frameCache = {};
function preload(s) { if (!s?.frame || frameCache[s.frame]) return; const im = new Image(); im.src = '../sb/' + s.frame; frameCache[s.frame] = im; }
let f1Src = '', capKey = '';
function showFrame(t) {
  const s = shotAt(t); if (!s) return;
  const u = '../sb/' + s.frame;
  if (f1Src !== u) { f1Src = u; f1.src = u; const i = shots.indexOf(s); for (let k = 1; k <= 4; k++) preload(shots[i + k]); }
  // the animatic's slow push on each frame; compare views keep the frame still so it can be matched
  const kb = (MODE === 'ref' || (MODE === 'over' && !liveUsed)) && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 + Math.min(0.07, (t - s.tin) * 0.01) : 1;
  f1.style.transform = kb > 1 ? `scale(${kb.toFixed(4)})` : '';
  const v = HIDE.vo ? null : FILM.vo.find(x => t >= x.t && t < x.t + x.dur), fs = HIDE.tx ? [] : FILM.sup.filter(x => t >= x.t && t < x.e);
  const key = (v ? v.id : '') + '|' + fs.map(x => x.big).join(',');
  if (key !== capKey) { capKey = key; $('#caps').innerHTML = (fs.length ? `<div class="cap-fig" dir="rtl">${fs.map(x => `<span><b>${esc(x.big)}</b>${esc(x.ar)}</span>`).join('')}</div>` : '') + (v ? `<div class="cap-vo" dir="rtl">${esc(v.ar)}</div>` : ''); }
}
function updateClock() { const t = now(); $('#tc').textContent = tc(t); $('#tcbig').textContent = tc(t); showFrame(t); updateBadge(); }''')
rep("function seekTo(t) { t = clamp(t, 0, DUR - 1 / FPS); PT = t; try { v1.currentTime = t; } catch {} syncV2(true); drawTL(); updateClock(); }","function seekTo(t) { t = clamp(t, 0, DUR - 1 / FPS); PT = t; try { v1.currentTime = t; } catch {} syncV2(true); drawTL(); updateClock(); const l = shotAt(t); if (l !== lastLive) { lastLive = l; markLive(); } }")
rep("v1.addEventListener('loadedmetadata', () => { DUR = v1.duration || DUR; fitZoom(); drawTL(); });","v1.addEventListener('loadedmetadata', () => { fitZoom(); drawTL(); });")
# the source re-ran setMode on every frame from inside tick(); once at boot is enough
rep("  requestAnimationFrame(tick);\nsetTimeout(() => { setMode(MODE, true); applyLanes(); }, 60);\n","  requestAnimationFrame(tick);\n")
rep("let lastLive = null;\nfunction tick() {","function tick() {")
rep("let loopShot = false;","let loopShot = false, lastLive = null;")
# ---------- timeline ----------
rep("const HEAD = 104, RULER = 24, TR = { as: [RULER + 4, 30], v2: [RULER + 38, 30], v1: [RULER + 72, 64], a1: [RULER + 140, 36] };","const HEAD = 104, RULER = 24, TR = { sc: [RULER, 18], as: [RULER + 20, 24], v2: [RULER + 46, 24], v1: [RULER + 72, 58], vo: [RULER + 132, 22], a1: [RULER + 156, 30], tx: [RULER + 188, 20] };")
rep("let pps = 24, scrollT = 0, dpr = 1;","let pps = 4, scrollT = 0, dpr = 1;")
rep("function fitZoom() { pps = clamp(tlW() / DUR, 4, 400);","function fitZoom() { pps = clamp(tlW() / DUR, 2, 200);")
rep("const LANES = ['as', 'v2', 'v1', 'a1'];","const LANES = ['as', 'v2', 'v1', 'vo', 'a1', 'tx'];")
rep("const LANE_NAME = { as: 'Auto stage (AS)', v2: 'Model takes (V2)', v1: 'Reference (V1)', a1: 'Audio (A1)' };","const LANE_NAME = { as: 'Auto stage (AS)', v2: 'Takes (V2)', v1: 'Storyboard (V1)', vo: 'VO text', a1: 'Audio (A1)', tx: 'On-screen figures' };")
rep("let HIDE = { as: false, v2: false, v1: false, a1: false };","let HIDE = { as: false, v2: false, v1: false, vo: false, a1: false, tx: false };")
rep("v1.style.opacity = HIDE.v1 ? '0' : '';","$('#f1wrap').style.opacity = HIDE.v1 ? '0' : '';")
rep("applyLanes(); syncV2(true); drawTL();\n  toast(","capKey = '?'; applyLanes(); syncV2(true); updateClock(); drawTL();\n  toast(")
rep("const steps = [1 / FPS, 0.2, 0.5, 1, 2, 5, 10, 20]; const step = steps.find(s => s * pps >= 9) || 20; const major = steps.find(s => s * pps >= 70) || 20;","const steps = [1 / FPS, 0.2, 0.5, 1, 2, 5, 10, 20, 30, 60]; const step = steps.find(s => s * pps >= 9) || 60; const major = steps.find(s => s * pps >= 70) || 60;")
rep("""ctx.font = '600 11px "IBM Plex Sans", sans-serif'; ctx.fillText(name, 10, y + h / 2); };""","""ctx.font = `600 11px ${F_UI}`; ctx.fillText(name, 10, y + h / 2); };""")
rep("lane('as', 'AS  Auto'); lane('v2', 'V2  Model'); lane('v1', 'V1  Ref'); lane('a1', 'A1  Audio');","lane('as', 'AS  Auto'); lane('v2', 'V2  Takes'); lane('v1', 'V1  Board'); lane('vo', 'VO  Text'); lane('a1', 'A1  Mix'); lane('tx', 'TX  Figures');")
rep("for (const k of LANES) drawEye(k);\n  ctx.save(); ctx.beginPath(); ctx.rect(HEAD, 0, W - HEAD, H); ctx.clip();","""for (const k of LANES) drawEye(k);
  { const [y, h] = TR.sc; ctx.fillStyle = css('--panel-2'); ctx.fillRect(0, y, HEAD - 2, h); ctx.fillStyle = css('--muted'); ctx.font = `600 11px ${F_UI}`; ctx.fillText('Scenes', 10, y + h / 2); }
  ctx.save(); ctx.beginPath(); ctx.rect(HEAD, 0, W - HEAD, H); ctx.clip();
  // scene band
  { const [y, h] = TR.sc; FILM.scenes.forEach((c, i) => { if (c.e < t0 || c.s > t1) return; const xa = t2x(c.s), w = t2x(c.e) - xa; const on = sel()?.sc === c.n;
      ctx.fillStyle = on ? css('--head') : (i % 2 ? '#26272c' : '#1f2024'); ctx.fillRect(xa, y, w, h); ctx.fillStyle = on ? '#121315' : css('--muted'); ctx.font = `500 10.5px ${F_UI}`;
      if (w > 22) { ctx.save(); ctx.beginPath(); ctx.rect(xa, y, w - 2, h); ctx.clip(); ctx.fillText(w > 90 ? `${c.n}  ${c.title}` : String(c.n), xa + 4, y + h / 2); ctx.restore(); } }); }
  // VO lines and figures
  { const [y, h] = TR.vo; for (const v of FILM.vo) { const a = v.t, b = v.t + v.dur; if (b < t0 || a > t1) continue; const xa = t2x(a), w = (b - a) * pps; ctx.fillStyle = '#2d3b40'; ctx.fillRect(xa, y + 2, w, h - 4); ctx.fillStyle = css('--text'); ctx.font = `500 10.5px ${F_UI}`; if (w > 24) { ctx.save(); ctx.beginPath(); ctx.rect(xa + 2, y, w - 4, h); ctx.clip(); ctx.fillText(v.en, xa + 4, y + h / 2); ctx.restore(); } } }
  { const [y, h] = TR.tx; FILM.sup.forEach((f, i) => { if (f.e < t0 || f.t > t1) return; const nx = FILM.sup[i + 1], end = nx && nx.t < f.e ? nx.t : f.e; const xa = t2x(f.t), w = (end - f.t) * pps; ctx.fillStyle = '#3a3528'; ctx.fillRect(xa, y + 2, Math.max(2, w - 1), h - 4); ctx.fillStyle = css('--head'); ctx.font = `500 10px ${F_UI}`; if (w > 26) { ctx.save(); ctx.beginPath(); ctx.rect(xa + 2, y, w - 4, h); ctx.clip(); ctx.fillText(f.big, xa + 4, y + h / 2); ctx.restore(); } }); }""")
rep("const t = clamp((x - HEAD) / pps + scrollT + tw / pps / 2, s.tin, s.tout - 0.01); const k = clamp(Math.floor(t * 4), 0, 239); ctx.drawImage(sprite, (k % 20) * 192, Math.floor(k / 20) * 108, 192, 108, x, ty, tw, th); }","const k = s.th ?? 0; ctx.drawImage(sprite, (k % SHEET.cols) * SHEET.w, Math.floor(k / SHEET.cols) * SHEET.h, SHEET.w, SHEET.h, x, ty, tw, th); }")
rep("const col = css((SOURCES[s.source] || SOURCES.cast).c);","const col = css((SOURCES[s.source] || SOURCES.ai).c);")
rep("""ctx.fillStyle = '#121315'; ctx.font = '600 10.5px "IBM Plex Mono", monospace';
    if (w > 26) { ctx.save(); ctx.beginPath(); ctx.rect(xa, y1, w - 2, 15); ctx.clip(); ctx.fillText(`${shotNo(s).slice(2)}  ${s.label || s.desc || ''}`, xa + 4, y1 + 8); ctx.restore(); }""","""ctx.fillStyle = '#121315'; ctx.font = `600 10.5px ${F_UI}`;
    if (w > 22) { ctx.save(); ctx.beginPath(); ctx.rect(xa, y1, w - 2, 15); ctx.clip(); ctx.fillText(w > 120 ? `${shotNo(s).slice(2)}  ${s.desc || ''}` : shotNo(s).slice(2), xa + 3, y1 + 8); ctx.restore(); }""")
rep("""const [ya, ha] = TR.as; const at = autoTakeOf(s); const m = MOTION?.shots?.[s.id];""","""const [ya, ha] = TR.as; const at = autoTakeOf(s);""")
rep("""ctx.font = '600 10.5px "IBM Plex Sans", sans-serif';
      if (w > 30) ctx.fillText(at ? `${shotNo(s).slice(2)} rendered` : src.page ? `${shotNo(s).slice(2)} live 3D${m ? ' · ' + m.summary : ''}` : `${shotNo(s).slice(2)} waiting for model`, xa + 6, ya + ha / 2);""","""ctx.font = `600 10.5px ${F_UI}`;
      if (w > 60) ctx.fillText(at ? `${shotNo(s).slice(2)} rendered` : src.page ? `${shotNo(s).slice(2)} live 3D` : `${shotNo(s).slice(2)} waiting`, xa + 6, ya + ha / 2);""")
rep("""ctx.fillStyle = col; ctx.fillRect(xa + 1, y2 + 4, w - 2, h2 - 8); ctx.fillStyle = '#121315'; ctx.font = '600 10.5px "IBM Plex Sans", sans-serif';""","""ctx.fillStyle = col; ctx.fillRect(xa + 1, y2 + 4, w - 2, h2 - 8); ctx.fillStyle = '#121315'; ctx.font = `600 10.5px ${F_UI}`;""")
rep("""const step2 = Math.max(1, Math.floor(100 / pps));
    for (let x = HEAD; x < W; x++) { const t = x2t(x); const i = Math.floor(t * 100);""","""const step2 = Math.max(1, Math.floor(20 / pps));
    for (let x = HEAD; x < W; x++) { const t = x2t(x); const i = Math.floor(t * 20);""")
rep("ctx.moveTo(hoverX + 0.5, TR.as[0]); ctx.lineTo(hoverX + 0.5, TR.a1[0] + TR.a1[1]);","ctx.moveTo(hoverX + 0.5, TR.as[0]); ctx.lineTo(hoverX + 0.5, TR.v1[0] + TR.v1[1]);")
rep("if (e.ctrlKey || e.metaKey) { const tm = x2t(x); pps = clamp(pps * Math.exp(-e.deltaY * 0.002), 4, 400);","if (e.ctrlKey || e.metaKey) { const tm = x2t(x); pps = clamp(pps * Math.exp(-e.deltaY * 0.002), 2, 200);")
rep("if (y < RULER) { drag = { kind: 'scrub' }; play(false); seekTo(x2t(x)); return; }","if (y < RULER) { drag = { kind: 'scrub' }; play(false); seekTo(x2t(x)); return; }\n  if (y < TR.sc[0] + TR.sc[1]) { const c = FILM.scenes.find(c => { const q = x2t(x); return q >= c.s && q < c.e; }); if (c) { play(false); seekTo(c.s); const s = shotAt(c.s); if (s) selectShot(s.id, false); } return; }")
rep("if (y < TR.as[0] || y > TR.v1[0] + TR.v1[1]) return null;","if (y < TR.as[0] || y > TR.v1[0] + TR.v1[1]) return null;")
rep("$('#tl-hint').textContent = t === 'razor' ? 'Razor: click a shot to cut it at that frame. Press V for Select.' : 'Click an AS clip to open its Auto stage page. Drag a cut point to trim. S splits the screen.';","$('#tl-hint').textContent = t === 'razor' ? 'Razor: click a shot to cut it at that frame. Press V for Select.' : '"+HINT+"';")
# ---------- exports: frames are files here ----------
sub(r"const grabV = document\.createElement\('video'\);.*?async function ready\(video\) \{.*?\n\}?\n(?=async function save)","const frameBlob = async (s) => (await fetch('../sb/' + s.frame)).blob();\n",1) if False else None
i=t.index("const grabV = document.createElement('video');"); j=t.index("async function save(filename, blob) {")
t=t[:i]+"const frameBlob = async (s) => { const r = await fetch('../sb/' + s.frame); if (!r.ok) throw new Error('frame not found'); return r.blob(); };\n"+t[j:]
i=t.index("async function framesFor(s) {"); j=t.index("function shotRow(s) {")
t=t[:i]+'''async function saveFrames(s) {
  try { await save(`Nevera_${shotNo(s)}_frame.jpg`, await frameBlob(s)); } catch (e) { toast(`The frame was not saved (${e.message}).`); }
}
'''+t[j:]
rep("function shotRow(s) { const src = SOURCES[s.source] || SOURCES.cast; return { shot: shotNo(s), in: tc(s.tin),","function shotRow(s) { const src = SOURCES[s.source] || SOURCES.ai; const c = FILM.scenes.find(x => x.n === s.sc); return { shot: shotNo(s), code: s.code || '', scene: c ? `${c.n} ${c.title}` : '', type: s.type || '', in: tc(s.tin),")
rep("label: s.label || '', what: s.desc || '',","cast: (s.cast || []).map(c => FILM.cast?.[c]?.label || c).join('; '), lens_mm: s.lens || '', place: s.label || '', place_confirmed: s.place ? (s.place.sure ? 'yes' : 'no') : '', what: s.desc || '', frame: s.frame || '',")
rep("save('HRID_shot_list.csv',","save('Nevera_shot_list.csv',")
rep("const list = filter === 'all' ? shots : shots.filter(s => filter === '3d' ? ['dts', 'kurdonia', 'bridge', 'slemani'].includes(s.source) : s.source === filter);","const list = shots.filter(inFilter);")
sub(r"zip\.file\('README\.txt', `HRID.*?`\);","zip.file('README.txt', `Nevera film - Seedance pack\\nStoryboard animatic v5, 25 fps\\nEach folder: the storyboard keyframe, a 3D frame of the place from our masterplan with the cast standing in it, the take if there is one, shot.json with timing, place, cast, VO and notes, and prompt.txt.\\nFeed the characters, the location and the keyframe as references and let the model generate the shot. Do not animate the still as a start frame. Keep the camera dynamic.\\n`);")
rep("const dir = zip.folder(`${shotNo(s)}_${(s.label || s.desc || '').replace(/[^a-z0-9]+/gi, '-').slice(0, 30)}`);\n      for (const [n, b] of await framesFor(s)) dir.file(`ref_${n}.png`, b);","const dir = zip.folder(`${shotNo(s)}_${s.code || ''}`);\n      dir.file('ref_keyframe.jpg', await frameBlob(s));\n      if (s.place?.ar) { try { const r3 = await fetch(`../stage/${s.id}.jpg`); if (r3.ok) dir.file('ref_location_3d.jpg', await r3.blob()); } catch {} }")
rep("save(`HRID_Seedance_pack_${filter}.zip`,","save(`Nevera_Seedance_pack_${filter}${sceneFilter === 'all' ? '' : '_scene' + sceneFilter}.zip`,")
# ---------- boot ----------
i=t.index("renderFilters();\nconst img = new Image();"); j=t.index("if (window.innerWidth <= 860) { $('#i-close').hidden = false;")
t=t[:i]+'''renderFilters();
const img = new Image(); img.onload = () => { sprite = img; renderList(); drawTL(); }; img.src = 'sprite.jpg';
fetch('film.json').then(r => r.json()).then(j => { FILM = j; DUR = j.total || DUR; $('#plots').innerHTML = (j.plots || []).map(p => `<option value="${esc(p)}"></option>`).join(''); renderFilters(); renderList(); renderInspector(); fitZoom(); capKey = '?'; updateClock(); }).catch(() => {});
fetch('audio/peaks.json').then(r => r.json()).then(j => { peaks = j.peaks; drawTL(); }).catch(() => {});
$('#t-live').setAttribute('aria-pressed', liveOn);
setTimeout(() => { setMode(MODE, true); applyLanes(); updateClock(); }, 60);
'''+t[j:]
for bad in ['HRID','hrid.cut','SOURCES.cast','MOTION','grabV','framesFor','s-dts','Slemani','dts']:
    n=t.count(bad)
    if n: print('left',bad,n,[t[m.start()-30:m.start()+30] for m in re.finditer(bad,t)][:3])
open(os.path.join(R,'site','cut','index.html'),'w',encoding='utf-8').write(t)
print('ok',len(t))
