#!/usr/bin/env python3
"""Render the forum control promo (https://aromahub.studio/r/forum/promo.html) to an MP4, frame by frame, from its code.

The page runs the real control panel and slide editor; render(t) poses every frame, so the video is the same on any machine.
Faster machines just finish sooner: use --workers to render parts of the minute in parallel, and --gpu on a native Windows / Mac
shell with a graphics card.

  pip install playwright imageio-ffmpeg
  python -m playwright install chromium
  python render-promo.py --workers auto

--music: a path or URL to the track (default: promo-music.mp3 next to the promo on the hub, an original AI track made for it with
         Artlist, no copyright, no watermark). It is laid from 0:00, padded or trimmed to the minute, faded and levelled.
Output: promo.mp4 (1920x1080, 25 fps by default, H.264 + AAC)."""
import argparse, asyncio, os, subprocess, sys, tempfile, time

ap = argparse.ArgumentParser()
ap.add_argument('--url', default='https://aromahub.studio/r/forum/promo.html')
ap.add_argument('--fps', type=int, default=25)
ap.add_argument('--out', default='promo.mp4')
ap.add_argument('--music', default='https://aromahub.studio/r/forum/promo-music.mp3', help="path or URL; '' for none")
ap.add_argument('--workers', default='auto', help='1, 2 or 4 (parts split at shot cuts), or auto')
ap.add_argument('--gpu', action='store_true', help='use the graphics card (native Windows / Mac shell)')
ap.add_argument('--headed', action='store_true', help='visible browser window (GPU on any desktop)')
ap.add_argument('--start', type=float, default=0.0)
ap.add_argument('--end', type=float, default=60.0)
A = ap.parse_args()

try:
    import imageio_ffmpeg
    FF = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:
    FF = 'ffmpeg'
from playwright.async_api import async_playwright

CUTS = [0.0, 14.6, 28.6, 45.0, 60.0]           # shot cuts: a part starts where the picture changes anyway


def parts(n):
    if n >= 4: c = CUTS
    elif n >= 2: c = [0.0, 28.6, 60.0]
    else: c = [0.0, 60.0]
    out = []
    for a, b in zip(c, c[1:]):
        a, b = max(a, A.start), min(b, A.end)
        if b > a: out.append((a, b))
    return out


def launch_args():
    if A.gpu or A.headed:
        return ['--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--disable-background-timer-throttling',
                '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows']
    return ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-background-timer-throttling',
            '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows']


async def part(p, k, a, b, tmp, log):
    br = await p.chromium.launch(headless=not A.headed, args=launch_args())
    ctx = await br.new_context(viewport={'width': 1920, 'height': 1080}, device_scale_factor=1)
    pg = await ctx.new_page()
    url = A.url + ('&' if '?' in A.url else '?') + 'render=1'
    await pg.goto(url)
    for _ in range(120):
        if await pg.evaluate('window.__ready&&window.__ready()'): break
        await pg.wait_for_timeout(500)
    await pg.evaluate('__openEditor()'); await pg.wait_for_timeout(9000)
    # bring the panel to where this part starts: every earlier action, one at a time, with its own wait
    for T in await pg.evaluate('EV.map(function(e){return e[0]})'):
        if T >= a: break
        w = await pg.evaluate(f'render({T})')
        if w: await pg.wait_for_timeout(w)
    f0, f1 = round(a * A.fps), round(b * A.fps)
    seg = os.path.join(tmp, f'part{k}.mp4')
    ff = subprocess.Popen([FF, '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(A.fps), '-c:v', 'mjpeg', '-i', '-',
                           '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', '-preset', 'medium', '-r', str(A.fps), seg], stdin=subprocess.PIPE)
    t0 = time.time()
    for f in range(f0, f1):
        t = f / A.fps
        w = await pg.evaluate(f'render({t})')
        if w: await pg.wait_for_timeout(w); await pg.evaluate(f'render({t})')
        ff.stdin.write(await pg.screenshot(type='jpeg', quality=93))
        if (f - f0) % 100 == 0: log(f'part {k}: {t:5.1f}s  ({time.time() - t0:.0f}s)')
    ff.stdin.close(); ff.wait(); await br.close()
    log(f'part {k} done in {time.time() - t0:.0f}s')
    return seg


def music_edit(src, out):
    if src.startswith('http'):
        import urllib.request
        local = out + '.src'
        urllib.request.urlretrieve(src, local); src = local
    fc = '[0:a]apad,atrim=0:60,afade=t=out:st=58.6:d=1.4,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[o]'
    subprocess.run([FF, '-y', '-loglevel', 'error', '-i', src, '-filter_complex', fc, '-map', '[o]', '-t', '60', out], check=True)


async def main():
    n = A.workers
    n = max(1, min(4, (os.cpu_count() or 2) // 2)) if n == 'auto' else int(n)
    ps = parts(n)
    print(f'{len(ps)} part(s) in parallel, {A.fps} fps, ffmpeg: {FF}', flush=True)
    T0 = time.time()
    with tempfile.TemporaryDirectory() as tmp:
        async with async_playwright() as p:
            segs = await asyncio.gather(*[part(p, k, a, b, tmp, lambda s: print(s, flush=True)) for k, (a, b) in enumerate(ps)])
        lst = os.path.join(tmp, 'list.txt')
        with open(lst, 'w') as fh:
            fh.write(''.join(f"file '{s}'\n" for s in segs))
        video = os.path.join(tmp, 'video.mp4')
        subprocess.run([FF, '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', video], check=True)
        if A.music:
            mus = os.path.join(tmp, 'music.wav'); music_edit(A.music, mus)
            subprocess.run([FF, '-y', '-loglevel', 'error', '-i', video, '-i', mus, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac',
                            '-b:a', '256k', '-shortest', '-movflags', '+faststart', A.out], check=True)
        else:
            subprocess.run([FF, '-y', '-loglevel', 'error', '-i', video, '-c', 'copy', '-movflags', '+faststart', A.out], check=True)
    print(f'done: {A.out} in {time.time() - T0:.0f}s', flush=True)

asyncio.run(main())
