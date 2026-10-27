"""Clean the DWG road centrelines for the map: drop stretches that run inside another (wider or longer) road's
right-of-way (duplicated polylines, a 30 m street drawn inside a 60 m road), then close the short gaps where a road
stops just before the road it meets. Used by build_data.py."""
import math

def _dseg(x, y, a, b):
    dx, dy = b[0] - a[0], b[1] - a[1]; L2 = dx * dx + dy * dy or 1
    t = max(0.0, min(1.0, ((x - a[0]) * dx + (y - a[1]) * dy) / L2)); return math.hypot(x - a[0] - dx * t, y - a[1] - dy * t), (a[0] + dx * t, a[1] + dy * t)

def _cum(p):
    L = [0.0]
    for i in range(1, len(p)): L.append(L[-1] + math.dist(p[i - 1], p[i]))
    return L

def _at(p, L, s):
    for i in range(1, len(p)):
        if L[i] >= s:
            t = (s - L[i - 1]) / max(1e-9, L[i] - L[i - 1]); return (p[i - 1][0] + (p[i][0] - p[i - 1][0]) * t, p[i - 1][1] + (p[i][1] - p[i - 1][1]) * t)
    return tuple(p[-1])

def _sub(p, L, s0, s1):
    out = [_at(p, L, s0)] + [tuple(p[i]) for i in range(len(p)) if s0 < L[i] < s1] + [_at(p, L, s1)]
    return [[round(x, 1), round(y, 1)] for x, y in out]

def _near(x, y, road):
    best = (1e18, None)
    for i in range(1, len(road['p'])):
        d, q = _dseg(x, y, road['p'][i - 1], road['p'][i])
        if d < best[0]: best = (d, q)
    return best

def clean_roads(roads, step=5.0, min_piece=40.0):
    roads = [r for r in roads if len(r.get('p', [])) > 1]
    order = sorted(range(len(roads)), key=lambda i: (-(roads[i].get('w') or 20), -_cum(roads[i]['p'])[-1]))
    kept, log = [], []
    for i in order:
        r = roads[i]; p = r['p']; L = _cum(p); T = L[-1]
        n = max(2, int(T // step) + 1); ss = [T * k / (n - 1) for k in range(n)]
        inside = []   # per sample: (kept road it runs inside, direction of that road there) or None
        for s in ss:
            x, y = _at(p, L, s); hit = None
            for k in kept:
                best = (1e18, None)
                for j in range(1, len(k['p'])):
                    d, _ = _dseg(x, y, k['p'][j - 1], k['p'][j])
                    if d < best[0]: best = (d, j)
                if best[0] < (k.get('w') or 20) / 2 - 1:
                    a2, b2 = k['p'][best[1] - 1], k['p'][best[1]]; hit = (k, math.atan2(b2[1] - a2[1], b2[0] - a2[0])); break
            inside.append(hit)
        # runs of samples inside another road; short runs are just crossings and stay
        cuts, k = [], 0
        while k < n:
            if inside[k]:
                j = k
                while j + 1 < n and inside[j + 1]: j += 1
                # cut only a stretch that runs along the other road (parallel), not a crossing of a wide road
                sm = (ss[k] + ss[j]) / 2; xa, ya = _at(p, L, max(0, sm - 3)); xb, yb = _at(p, L, min(T, sm + 3))
                road_k, ang_k = inside[(k + j) // 2] or inside[k]
                par = abs(math.cos(math.atan2(yb - ya, xb - xa) - ang_k)) > .85
                if par and ss[j] - ss[k] > max(60, 1.2 * (road_k.get('w') or 20)): cuts.append((ss[k], ss[j]))
                k = j + 1
            else: k += 1
        pieces, s0 = [], 0.0
        for a, b in cuts:
            if a - s0 >= min_piece: pieces.append((s0, a))
            s0 = b
        if T - s0 >= min_piece: pieces.append((s0, T))
        if cuts: log.append(f"road w{r.get('w')} {T:.0f} m: dropped {sum(b - a for a, b in cuts):.0f} m inside other roads, {len(pieces)} piece(s) kept")
        for a, b in pieces: kept.append({**r, 'p': _sub(p, L, a, b)})
    # close short gaps: a road end 3-45 m from another road is extended to meet it
    snapped = 0
    for idx, r in enumerate(kept):
        for end in (0, -1):
            x, y = r['p'][end]; best = (1e18, None)
            for j, o in enumerate(kept):
                if j == idx: continue
                d, q = _near(x, y, o)
                if d < best[0]: best = (d, q)
            if 3 <= best[0] <= 45:
                q = [round(best[1][0], 1), round(best[1][1], 1)]
                if end == 0: r['p'].insert(0, q)
                else: r['p'].append(q)
                snapped += 1
    log.append(f'{len(roads)} roads in, {len(kept)} out, {snapped} ends extended to meet a road')
    return kept, log

if __name__ == '__main__':
    import json, sys
    d = json.load(open(sys.argv[1])); out, log = clean_roads(d['roads']); print('\n'.join(log))
