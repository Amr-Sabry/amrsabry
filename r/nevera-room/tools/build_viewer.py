#!/usr/bin/env python3
"""Turn the HRID viewer into a Nevera viewer: storyboard stills as the reference, the v5 shots, a tree of joints for the figures. build(out_dir, cfg, presets)"""
import re,json,os
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC=os.path.join(R,'..','artifact-files','4464d52a-26fe-4ddf-b417-1b3c0fafdc1a','studio','index.html')
def build(out,cfg,presets=None,back='&larr; Film room'):
    t=open(SRC,encoding='utf-8').read()
    def rep(a,b,n=1):
        nonlocal t
        c=t.count(a); assert c==n,(c,a[:80]); t=t.replace(a,b)
    t,c=re.subn(r'<title>.*?</title>',f"<title>{cfg['name']}</title>",t,count=1); assert c==1
    t,c=re.subn(r'window\.__CFG = \{.*?\};?</script>',lambda m:'window.__CFG = '+json.dumps(cfg,ensure_ascii=False)+';</script>',t,count=1,flags=re.S); assert c==1
    i=t.index('const STAGE_PRESETS = ');j=t.index('\n',i)
    t=t[:i]+'const STAGE_PRESETS = '+json.dumps(presets or {},ensure_ascii=False)+';'+t[j:]
    rep("'ref-1031'","'v5-1029'",4)
    rep('<a class="back" href="../index.html">&larr; Models</a>',f'<a class="back" href="../index.html">{back}</a>')
    rep('open this page from the HRID link','open this page from the Claude link')
    rep("REF_VIDEO = '../cut/video/ref_2026-10-31.mp4'","REF_VIDEO = ''")
    rep('<video id="refov" muted playsinline preload="auto" hidden></video>','<img id="refov" alt="" hidden>')
    t,c=re.subn(r'<video id="refpip"[^>]*></video>','<img id="refpip" alt="Storyboard frame">',t); assert c==1,c
    rep("""if (!curShot || !refOn) { if (!refv.hidden) { refv.hidden = true; refv.pause(); } return; }
  if (!refv.src) refv.src = REF_VIDEO;""","""if (!curShot || !refOn) { if (!refv.hidden) refv.hidden = true; return; }
  { const u = '../sb/' + curShot.frame; if (refv.getAttribute('src') !== u) refv.src = u; }""")
    rep("""const t = clamp(curShot.tin - SHOT_HANDLE + T.time, 0, 60);
  if (Math.abs(refv.currentTime - t) > (T.playing ? 0.15 : 0.02)) { try { refv.currentTime = t; } catch {} }
  if (T.playing && refv.paused) refv.play().catch(() => {}); if (!T.playing && !refv.paused) refv.pause();
""","")
    rep("""if (!show) { if (!pv.paused) pv.pause(); return; }
  if (!pv.getAttribute('src')) pv.src = REF_VIDEO;
  const t = clamp(curShot.tin - SHOT_HANDLE + T.time, 0, 60);
  if (Math.abs(pv.currentTime - t) > (T.playing ? 0.15 : 0.02)) { try { pv.currentTime = t; } catch {} }
  if (T.playing && pv.paused) pv.play().catch(() => {}); if (!T.playing && !pv.paused) pv.pause();
""","""if (!show) return;
  { const u = '../sb/' + curShot.frame; if (pv.getAttribute('src') !== u) pv.src = u; }
""")
    # the frames lane under a shot: its own storyboard frame from the sheet
    a=t.index("const x0 = i * tw, t = clamp(curShot.tin - SHOT_HANDLE + (x0 + tw / 2) / W * d, 0, 59.9)");b=t.index("lane.appendChild(el);",a)
    t=t[:a]+"const x0 = i * tw, k = curShot.th ?? 0;\n    const el = document.createElement('i');\n    el.style.cssText = `left:${x0}px;width:${tw}px;background-image:url(../cut/sprite.jpg);background-size:${16 * tw}px ${7 * H}px;background-position:-${(k % 16) * tw}px -${Math.floor(k / 16) * H}px`;\n    "+t[b:]
    rep("rl.title = 'The animatic under this shot. Click a frame to go there.'","rl.title = 'The storyboard frame of this shot.'")
    rep("fetch('../cut/video/ref_peaks.json')","fetch('../cut/audio/peaks.json')")
    rep("const ia = Math.floor((t0 + x / w * d) * 100), ib = Math.max(ia, Math.floor((t0 + (x + 1) / w * d) * 100));","const ia = Math.floor((t0 + x / w * d) * 20), ib = Math.max(ia, Math.floor((t0 + (x + 1) / w * d) * 20));")
    rep("const shotLabel = (s) => `SH${String(SHOTS.indexOf(s) + 1).padStart(2, '0')} ${s.","const shotLabel = (s) => `SH${String(SHOTS.indexOf(s) + 1).padStart(3, '0')} ${s.")
    t=t.replace("'hrid.","'nevera.")
    # figures: joints form a tree (arms and legs hang from the body)
    a=t.index("function applyRigs() {");b=t.index("APPLY.rigs = applyRigs;")
    t=t[:a]+"""function applyRigs() {
  for (const r of RIGS) {
    const accs = [];
    for (let k = 1; k <= r.joints.length; k++) {
      const j = r.joints[k - 1], p = j.pivot, pa = j.parent === undefined ? k - 1 : j.parent;
      const acc = pa > 0 ? accs[pa - 1].clone() : new THREE.Matrix4();
      const v = RIGV[`rig:${r.id}.${j.id}`] || 0;
      if (v) { _rt.makeTranslation(p[0], p[1] - GROUND_Y, p[2]); _rr.makeRotationAxis(_ax.set(...j.axis).normalize(), THREE.MathUtils.degToRad(v)); _rb.makeTranslation(-p[0], -(p[1] - GROUND_Y), -p[2]); acc.multiply(_rt).multiply(_rr).multiply(_rb); }
      accs.push(acc);
      for (const mi of r.segments[String(k)] || []) { const m = MESHOBJ[mi]; if (!m) continue; m.matrix.copy(acc); m.matrixWorldNeedsUpdate = true; }
    }
  }
  shadowDirty = true; invalidate();
}
"""+t[b:]
    rep("fog.density = S.haze * S.haze * 0.004;","fog.density = S.haze * S.haze * 0.004 * (CFG.fogK ?? 1);")
    rep("#refpipbox video{width:100%;height:100%;object-fit:fill;display:block}","#refpipbox :is(video,img){width:100%;height:100%;object-fit:cover;display:block}")
    rep("try { MFRAMES = await (await fetch('../cut/motion_frames.json')).json(); } catch { MFRAMES = null; }","MFRAMES = null;")
    t=t.replace('The reference move of this shot, measured from the animatic.','The camera move this shot asks for, from its type on the storyboard.').replace('Reference move:','Camera move:').replace('No measured move for this shot yet.','This shot has no camera move yet.')
    rep('<h1>Studio stage</h1>',f"<h1>{cfg['name']}</h1>")
    rep("window.__dbg = { renderer,","window.__dbg = { setView, renderer,")
    os.makedirs(out,exist_ok=True)
    assert 'REF_VIDEO;' not in t.replace("REF_VIDEO = '';",'')
    open(out+'/index.html','w',encoding='utf-8').write(t)
    return len(t)
if __name__=='__main__':
    v=json.load(open(R+'/tools/cast_views.json'))
    cfg=dict(name='Nevera Cast',key='cast',slug='nevera-cast',place='The film\'s cast as rigged mannequins',lat=29.9,lon=31.1,tz=2,groundY=0,cluster=[0,0,0],foot=dict(x0=-40,x1=40,z0=-16,z1=12),focusR=22,focusY=1,shadowR=70,groundOn=False,scale=0.08,nearMin=0.004,noBuild=True,views=v['views'],
      lamps=[dict(id='key',label='Key',pos=[12,14,22],target=[0,1,0],h=36,s=.3,v=0,angle=60,pen=.7,shadow=False),dict(id='rim',label='Rim',pos=[-14,10,-24],target=[0,1,0],h=196,s=.4,v=0,angle=60,pen=.7)])
    print(build(R+'/site/cast',cfg))
