/* VS7 · media bar + captions (show window only).
   23 Oct 00:22 Amr «محتاج يكون عندي في كل فيديو فيها بار اعرف اتحكم في اني اوقف الفيديو او اعيده ويبين ليا طول الفيديو
   كمان محتاج تزود كابشن للكلام وهو بيتكتب مع الصوت كانه كابشن — زي سلايد ٢٧ وسلايد ٥».
   · every slide whose main media is a film (a <video>, the oath's voice, or the opening film's iframe) gets a bar:
     play/pause · restart · elapsed / total · a track you can click to jump. It shows when the mouse moves and stays while paused.
     Keys: P = play/pause · R = restart the film · C = captions on/off.
   · captions: window.SV7CAPS[<file name>] = {cues:[{t0,t1,words:[{w,t0,t1}]}]} — each word appears as it is said.
   · the control panel gets the same state and can drive it (BroadcastChannel «sv7-ctl»: {type:'media'} ⇄ {type:'mcmd'}). */
(function () {
  const Q = new URLSearchParams(location.search);
  if (Q.has('thumb') || Q.has('static') || Q.has('preview')) return;
  const stage = document.getElementById('stage'); if (!stage) return;
  const CAPS = window.SV7CAPS || {};
  let ccOn = true; try { ccOn = localStorage.getItem('sv7-cc') !== '0'; } catch (e) {}
  const bc = ('BroadcastChannel' in window) ? new BroadcastChannel('sv7-ctl') : null;

  const box = document.createElement('div'); box.id = 'svm';
  box.innerHTML = `<div class="cap" dir="rtl"><div class="cl"></div></div>
    <div class="mb" dir="ltr"><button class="pp" title="P">${ic('pause')}</button><button class="rs" title="R">${ic('restart')}</button>
    <span class="tm"><b>0:00</b> / <i>0:00</i></span><div class="tr"><div class="bf"></div><div class="pg"></div><div class="kn"></div></div>
    <button class="cc${ccOn ? ' on' : ''}" title="C">CC</button></div>`;
  stage.appendChild(box);
  const capEl = box.querySelector('.cap'), cl = box.querySelector('.cl'), bar = box.querySelector('.mb'), tr = box.querySelector('.tr');
  const bPP = box.querySelector('.pp'), bRS = box.querySelector('.rs'), bCC = box.querySelector('.cc');
  const tEl = box.querySelector('.tm b'), dEl = box.querySelector('.tm i'), pg = box.querySelector('.pg'), kn = box.querySelector('.kn'), bf = box.querySelector('.bf');

  function ic(k) {
    return k === 'play' ? '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg>'
      : k === 'pause' ? '<svg viewBox="0 0 24 24"><rect x="6.5" y="5" width="4" height="14" rx="1"/><rect x="13.5" y="5" width="4" height="14" rx="1"/></svg>'
      : '<svg viewBox="0 0 24 24"><path d="M12 5a7 7 0 1 1-6.6 4.7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M4 4.5v5.5h5.5z"/></svg>';
  }
  const fmt = s => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const base = u => (u || '').split('?')[0].split('/').pop().replace(/\.[a-z0-9]+$/i, '');

  /* the main media of the slide on screen */
  let film = null;   /* the opening film's own reports, relayed by postMessage */
  addEventListener('message', e => { const m = e.data || {}; if (m.c5film === 'state') film = { t: +m.t || 0, dur: +m.dur || 0, playing: !!m.playing, at: Date.now(), src: e.source }; });
  function current() {
    const els = [...stage.querySelectorAll('.sv:not(.leave)')]; const el = els[els.length - 1]; if (!el) return null;
    let v = el.querySelector('video.oaud');
    if (!v && el.classList.contains('t-film')) v = el.querySelector('video');
    if (v && v.src) return { el, v, t: v.currentTime || 0, dur: v.duration || 0, paused: v.paused, key: base(v.dataset.src || v.src), buf: bufEnd(v) };
    const f = el.querySelector('iframe.svembed');
    if (f && film && Date.now() - film.at < 1500) return { el, f, t: film.t, dur: film.dur, paused: !film.playing, key: null, buf: 0 };
    return null;
  }
  function bufEnd(v) { try { const b = v.buffered; return b.length ? b.end(b.length - 1) : 0; } catch (e) { return 0; } }

  function toggle(m) {
    m = m || current(); if (!m) return;
    if (m.v) { if (m.v.paused) { if (m.v.ended) m.v.currentTime = 0; m.v.play().catch(() => {}); } else m.v.pause(); }
    else if (m.f) { try { m.f.contentWindow.postMessage({ c5film: m.paused ? 'play' : 'pause' }, '*'); } catch (e) {} }
    poke();
  }
  function restart(m) {
    m = m || current(); if (!m) return;
    if (m.v) { m.v.currentTime = 0; m.v.play().catch(() => {}); }
    else if (m.f) { const s = m.f.src; m.f.src = 'about:blank'; setTimeout(() => { m.f.src = s; }, 60); film = null; }
    lastCue = -1; poke();
  }
  function seek(t, m) { m = m || current(); if (!m || !m.v || !m.dur) return; m.v.currentTime = Math.max(0, Math.min(m.dur - .05, t)); lastCue = -1; poke(); }
  function setCC(on) { ccOn = on == null ? !ccOn : !!on; bCC.classList.toggle('on', ccOn); try { localStorage.setItem('sv7-cc', ccOn ? '1' : '0'); } catch (e) {} }

  bPP.onclick = e => { e.stopPropagation(); toggle(); };
  bRS.onclick = e => { e.stopPropagation(); restart(); };
  bCC.onclick = e => { e.stopPropagation(); setCC(); };
  tr.addEventListener('pointerdown', e => {
    e.stopPropagation(); const m = current(); if (!m || !m.v || !m.dur) return;
    const at = ev => { const r = tr.getBoundingClientRect(); seek((ev.clientX - r.left) / r.width * m.dur, m); };
    at(e); const mv = ev => at(ev), up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); };
    addEventListener('pointermove', mv); addEventListener('pointerup', up);
  });
  bar.addEventListener('pointerdown', e => e.stopPropagation());
  /* keys by their place on the keyboard (e.code), so they work with the Arabic layout too:
     P / K = play·pause · R = from the start · J = back 5 s · L = on 5 s · C = captions */
  addEventListener('keydown', e => {
    if (e.target && e.target.id === 'nIn') return; const k = e.code;
    if (k === 'KeyP' || k === 'KeyK') { e.preventDefault(); toggle(); } else if (k === 'KeyR') { e.preventDefault(); restart(); }
    else if (k === 'KeyJ' || k === 'KeyL') { e.preventDefault(); const m = current(); if (m && m.v) seek(m.t + (k === 'KeyL' ? 5 : -5), m); }
    else if (k === 'KeyC') { e.preventDefault(); setCC(); }
  });
  /* a click on the film itself plays or pauses it */
  stage.addEventListener('click', e => { if (e.target.closest('#svm .mb')) return; const m = current(); if (m && m.v && e.target.closest('.sv.t-film,.sv.t-oath')) toggle(m); });
  if (bc) bc.addEventListener('message', ev => {
    const d = ev.data || {}; if (d.type !== 'mcmd') return;
    if (d.c === 'toggle') toggle(); else if (d.c === 'restart') restart(); else if (d.c === 'seek') seek(+d.t || 0); else if (d.c === 'cc') setCC(d.on);
    else if (d.c === 'skip') { const m = current(); if (m && m.v) seek(m.t + (+d.d || 0), m); }
  });

  /* the bar is seen when the mouse moves, and while the film is paused */
  let seen = 0, lastMedia = null; const poke = () => { seen = Date.now(); };
  addEventListener('mousemove', poke);

  /* captions: the cue under the play-head; its words come in as they are said */
  let lastKey = null, lastCue = -1, words = [];
  function caption(m) {
    const C = m && m.key && CAPS[m.key];
    fin(m, C);
    if (!C || !C.cues || !ccOn) { capEl.classList.remove('on'); lastKey = null; return; }
    if (m.key !== lastKey) { lastKey = m.key; lastCue = -1; }
    const t = m.t; let k = -1;
    for (let i = 0; i < C.cues.length; i++) { const c = C.cues[i], nx = C.cues[i + 1]; if (t >= c.t0 - .05 && t < Math.min(c.t1 + .9, nx ? nx.t0 - .02 : 1e9)) { k = i; break; } }
    if (k < 0) { capEl.classList.remove('on'); return; }
    if (k !== lastCue) {
      lastCue = k; const c = C.cues[k]; capEl.style.setProperty('--cb', (C.bottom || 64) + 'px');
      /* 00:48 «اتعامل مع كلام الرئيس بذكاء — تتميز بالحجم واللون الكلمات الهامة اللي بتدل على العمل»: a key word (k) is set
         larger and in gold, and lands with a small lift */
      cl.innerHTML = c.words.map(w => `<span${w.k ? ' class="k"' : ''}>${w.w.replace(/[<&]/g, ch => ch === '<' ? '&lt;' : '&amp;')}</span>`).join(' ');
      /* the box grows with the words: laid out once whole to find its width, then anchored at its right edge so the words
         already said never move while the next ones arrive */
      cl.classList.add('meas'); cl.style.maxWidth = ''; capEl.style.width = '1600px'; const W = Math.ceil(cl.offsetWidth) + 2; cl.classList.remove('meas');
      cl.style.maxWidth = W + 'px'; capEl.style.right = Math.round((1920 - W) / 2) + 'px'; capEl.style.width = W + 'px';
      words = [...cl.children].map((s, i) => ({ s, t0: c.words[i].t0 }));
    }
    let any = false; words.forEach(w => { const on = t >= w.t0 - .04; any = any || on; w.s.classList.toggle('on', on); });
    capEl.classList.toggle('on', any);
  }

  /* 23 Oct 07:15 Amr (slide 27) «اخر كلمة في الفيديو لما تطلع على اسود لازم تكبر شوية وتتحرك لفوق»: once the last line has been
     said (C.fin, seconds), the picture goes down to black and that line rises to the middle of the screen, a little larger, off its
     plate — it stays there as the film's last word. Seeking back undoes it. */
  let finEl = null;
  function fin(m, C) {
    const on = !!(m && C && C.fin != null && ccOn && m.t >= C.fin);
    if (finEl && (!on || finEl !== m.el)) { finEl.classList.remove('svfin'); finEl = null; }
    if (on && !finEl) {
      finEl = m.el; finEl.classList.add('svfin');
      const h = capEl.offsetHeight || 90, cb = C.bottom || 64; capEl.style.setProperty('--fy', Math.round(500 - (1080 - cb - h / 2)) + 'px');
    }
    capEl.classList.toggle('fin', on);
  }

  let lastSend = 0, wasM = false;
  function frame() {
    const m = current();
    if (m) {
      tEl.textContent = fmt(m.t); dEl.textContent = m.dur ? fmt(m.dur) : '–:––';
      const p = m.dur ? Math.min(1, m.t / m.dur) : 0; pg.style.width = (p * 100).toFixed(2) + '%'; kn.style.left = (p * 100).toFixed(2) + '%';
      bf.style.width = (m.dur ? Math.min(1, m.buf / m.dur) * 100 : 0).toFixed(1) + '%';
      /* 06:05 «محتاج امكانية اني اوقف الفيديو او احرك التايم لاين»: the button's icon is only redrawn when the state changes —
         redrawn every frame it swallowed the click (the press and the release landed on two different icons) */
      const ps = m.paused ? 'play' : 'pause'; if (bPP.dataset.s !== ps) { bPP.innerHTML = ic(ps); bPP.dataset.s = ps; }
      tr.classList.toggle('noseek', !m.v);
      /* 00:53: the opening film carries its own bar (play · years · sound) — ours stays off it; the control still drives it */
      /* 06:45 Amr «البلاير بتاع الفيديوهات خليه يظهر في الكنترول بس»: the bar never shows on the screen — the control drives the film */
      box.classList.remove('show');
      box.classList.add('has'); const mk = m.v || m.f; if (mk !== lastMedia) { lastMedia = mk; seen = Date.now() + 1400; }
    } else box.classList.remove('has', 'show');
    caption(m);
    box.classList.toggle('lift', box.classList.contains('show') && capEl.classList.contains('on'));
    if (bc && Date.now() - lastSend > 250 && (m || wasM)) {
      lastSend = Date.now(); wasM = !!m;
      bc.postMessage(m ? { type: 'media', has: true, t: m.t, dur: m.dur, paused: m.paused, cc: ccOn, caps: !!(m.key && CAPS[m.key]), seek: !!m.v } : { type: 'media', has: false });
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  const st = document.createElement('style');
  st.textContent = `
#svm{position:absolute;inset:0;z-index:60;pointer-events:none;direction:ltr}
#svm .mb{position:absolute;left:50%;bottom:92px;width:1180px;height:64px;transform:translate(-50%,24px);display:flex;align-items:center;gap:14px;padding:0 20px;
  border-radius:18px;background:rgba(8,12,20,.82);border:1px solid rgba(255,255,255,.12);box-shadow:0 18px 40px -16px rgba(0,0,0,.9);
  -webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);opacity:0;transition:opacity .35s ease,transform .45s cubic-bezier(.2,.8,.2,1);pointer-events:none}
#svm.has.show .mb{opacity:1;transform:translate(-50%,0);pointer-events:auto}
#svm .mb button{flex:none;width:44px;height:44px;border:0;border-radius:12px;background:rgba(255,255,255,.08);color:#f4ecd9;display:grid;place-items:center;cursor:pointer;padding:0}
#svm .mb button:hover{background:rgba(230,189,110,.25)}
#svm .mb button svg{width:24px;height:24px;fill:currentColor}
#svm .mb .pp{background:#e6bd6e;color:#0a0d14}#svm .mb .pp:hover{background:#f1cf8a}
#svm .mb .cc{width:auto;padding:0 10px;font:700 16px/1 system-ui,sans-serif;letter-spacing:.06em;opacity:.55}#svm .mb .cc.on{opacity:1;box-shadow:inset 0 0 0 1.5px #e6bd6e}
#svm .tm{flex:none;min-width:118px;font:600 20px/1 system-ui,sans-serif;color:#cfd4dd;font-variant-numeric:tabular-nums}#svm .tm b{color:#fff;font-weight:700}
#svm .tr{position:relative;flex:1;height:30px;cursor:pointer}
#svm .tr::before,#svm .tr .bf,#svm .tr .pg{content:"";position:absolute;left:0;top:12px;height:6px;border-radius:3px}
#svm .tr::before{right:0;background:rgba(255,255,255,.14)}#svm .tr .bf{background:rgba(255,255,255,.18)}#svm .tr .pg{background:#e6bd6e}
#svm .tr .kn{position:absolute;top:7px;width:16px;height:16px;margin-left:-8px;border-radius:50%;background:#fff;box-shadow:0 0 0 4px rgba(230,189,110,.35)}
#svm .tr.noseek{cursor:default}#svm .tr.noseek .kn{display:none}
#svm .cap{position:absolute;bottom:var(--cb,64px);display:flex;justify-content:flex-end;opacity:0;transition:opacity .25s ease,bottom .45s cubic-bezier(.2,.8,.2,1)}
#svm .cap.on{opacity:1}
#svm .cap{transform-origin:50% 50%;transition:opacity .25s ease,bottom .45s cubic-bezier(.2,.8,.2,1),transform 1.3s cubic-bezier(.25,.8,.25,1) .35s}
#svm .cap.fin{transform:translateY(var(--fy,-300px)) scale(1.32)}
#svm .cl{transition:background .9s ease .35s,box-shadow .9s ease .35s}
#svm .cap.fin .cl{background:rgba(4,6,11,0)}
.sv.svfin video,.sv.svfin .poster,.sv.svfin .oimg{filter:brightness(0);transition:filter 1s ease}#svm.lift .cap{bottom:calc(var(--cb,64px) + 120px)}
#svm .cl{display:inline-block;max-width:1500px;padding:12px 28px 16px;border-radius:14px;background:rgba(4,6,11,.76);text-align:right;direction:rtl;
  font:600 42px/1.5 SVnum,SVb,SVd,system-ui,sans-serif;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.6)}
#svm .cl span{display:none}
#svm .cl.meas span{display:inline-block;visibility:hidden}
#svm .cl span.on{display:inline-block;animation:svmw .3s cubic-bezier(.2,.8,.2,1) both}
@keyframes svmw{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
#svm .cl span.k{font-family:SVnum,SVd,SVb,system-ui,sans-serif;font-weight:700;font-size:1.22em;line-height:1.2;color:#f3cf86;text-shadow:0 0 22px rgba(233,188,108,.45),0 2px 8px rgba(0,0,0,.6)}
#svm .cl span.k.on{animation:svmk .42s cubic-bezier(.2,.9,.25,1.25) both}
@keyframes svmk{from{opacity:0;transform:translateY(10px) scale(.8)}to{opacity:1;transform:none}}
body.nocur #svm .mb{cursor:none}`;
  document.head.appendChild(st);
})();
