/* 23 Oct 14:56 Amr «محتاج منك بسرعة تخلي الريموت بتاع ابل يشتغل يقلب السلايدات»: an Apple remote (and any presenter clicker that sends
   media keys) turns the slides. A remote's buttons reach a web page in one of two ways — as media keys (MediaTrackNext / Previous /
   PlayPause) or, on a Mac, through the system's «Now Playing» (the page's media session). Both go to next / previous here. The media
   session only exists while the page plays sound, so after the first touch or key a silent, looping sound keeps it alive.
   right / forward / play-pause → next · left / back → previous. Clickers that send arrows or PageUp/PageDown already worked. */
window.svRemote = function (next, prev) {
  let last = 0;
  const fire = f => { const t = Date.now(); if (t - last < 280) return; last = t; f(); };
  const NX = ['MediaTrackNext', 'MediaFastForward', 'MediaPlayPause', 'MediaPlay', 'MediaPause', 'BrowserForward'];
  const PV = ['MediaTrackPrevious', 'MediaRewind', 'BrowserBack'];
  addEventListener('keydown', e => {
    if (NX.includes(e.key)) { e.preventDefault(); fire(next); } else if (PV.includes(e.key)) { e.preventDefault(); fire(prev); }
  }, true);
  if (!('mediaSession' in navigator)) return;
  let au = null;
  const silent = () => {
    const sr = 8000, n = sr * 30, b = new ArrayBuffer(44 + n), v = new DataView(b), w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); v.setUint32(4, 36 + n, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true); w(36, 'data'); v.setUint32(40, n, true);
    new Uint8Array(b, 44).fill(128);
    return URL.createObjectURL(new Blob([b], { type: 'audio/wav' }));
  };
  const keep = () => { if (au && au.paused) au.play().catch(() => {}); try { navigator.mediaSession.playbackState = 'playing'; } catch (_) {} };
  const arm = () => {
    if (au) return keep();
    au = new Audio(silent()); au.loop = true; au.volume = 0.05; au.setAttribute('playsinline', '');
    au.play().catch(() => {});
    try { navigator.mediaSession.metadata = new MediaMetadata({ title: 'منتدى مصر 2026', artist: 'العرض' }); } catch (_) {}
    const h = (a, f) => { try { navigator.mediaSession.setActionHandler(a, () => { fire(f); keep(); }); } catch (_) {} };
    h('nexttrack', next); h('previoustrack', prev); h('play', next); h('pause', next); h('seekforward', next); h('seekbackward', prev);
    keep();
  };
  ['pointerdown', 'keydown', 'touchend'].forEach(ev => addEventListener(ev, arm, true));
};
