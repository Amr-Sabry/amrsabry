# Nevera: turn extract.json (from extract.mjs) into geo.json: one polygon set per land-use parcel, matched to its parcel tag
# (ID, area, FAR, max height), grouped into same-use clusters for labelling, plus road centrelines and the site / Phase 1A outlines.
# Coordinates are metres relative to the DWG point (318595, 3305622), x east, y north.   Run: python3 build_zones.py
import json, re, math
d = json.load(open('extract.json'))
OX, OY = 318595.0, 3305622.0
LV = 1.4   # scene units per storey: 4 m x 3.5 exaggeration x 0.1
def clean(s):
    s = re.sub(r'\\f[^;]*;', '', s or ''); s = re.sub(r'\\H[^;]*;', '', s); s = s.replace('\\~', ' ').replace('\\P', '|'); return re.sub(r'[{}]', '', s)
def area(r): return abs(sum(r[i-1][0]*r[i][1] - r[i][0]*r[i-1][1] for i in range(len(r)))) / 2
def sarea(r): return sum(r[i-1][0]*r[i][1] - r[i][0]*r[i-1][1] for i in range(len(r))) / 2
def pip(p, r):
    x, y, c = p[0], p[1], False
    for i in range(len(r)):
        x1, y1 = r[i-1]; x2, y2 = r[i]
        if (y1 > y) != (y2 > y) and x < (x2-x1)*(y-y1)/(y2-y1) + x1: c = not c
    return c
def dp(pts, eps):
    if len(pts) < 4: return pts
    a, b = pts[0], pts[-1]; dx, dy = b[0]-a[0], b[1]-a[1]; L = math.hypot(dx, dy)
    imax, dmax = 0, 0
    for i in range(1, len(pts)-1):
        dd = abs(dy*pts[i][0] - dx*pts[i][1] + b[0]*a[1] - b[1]*a[0]) / L if L > 1e-9 else math.hypot(pts[i][0]-a[0], pts[i][1]-a[1])
        if dd > dmax: imax, dmax = i, dd
    if dmax > eps: return dp(pts[:imax+1], eps)[:-1] + dp(pts[imax:], eps)
    return [a, b]
def simp(r, eps=0.8):
    r = [p for i, p in enumerate(r) if i == 0 or math.hypot(p[0]-r[i-1][0], p[1]-r[i-1][1]) > 0.05]
    if len(r) > 2 and math.hypot(r[0][0]-r[-1][0], r[0][1]-r[-1][1]) < 0.05: r = r[:-1]
    if len(r) < 4: return r
    k = max(range(len(r)), key=lambda i: (r[i][0], r[i][1]))
    o = dp(r[k:] + r[:k] + [r[k]], eps)[:-1]
    return o if len(o) >= 3 else r
def dd(r):
    o = []
    for p in r:
        if not o or p != o[-1]: o.append(p)
    return o
loc = lambda p: [round(p[0]-OX), round(p[1]-OY)]

CATS = {  # DWG layer: key, Arabic, English, colour   (tag codes: MC MB MH TP ED IP IN CD ME RT HL HU HB RL RP RM RH GF GL PK UT DC FO)
 'LUP_MU_Media City Core': ('mc', 'قلب المدينة الإعلامية', 'Media City Core', '#e0873a'),
 'LUP_Media City Backlot': ('mb', 'مواقع التصوير المفتوحة', 'Media City Backlots', '#c2652c'),
 'LUP_MU_Media City Hotel': ('mh', 'فنادق المدينة الإعلامية', 'Media City Hotels', '#dba36a'),
 'LUP_Theme Park': ('tp', 'المدينة الترفيهية', 'Theme Park', '#c55b7b'),
 'LUP_Education': ('ed', 'التعليم العالي', 'Higher Education', '#5f87ae'),
 'LUP_Innovation Park': ('ip', 'مجمع الابتكار', 'Innovation Park', '#8073b8'),
 'LUP_Institution': ('in', 'مؤسسات', 'Institution', '#8d9db3'),
 'LUP_MU_DISTRICT CORE': ('cd', 'قلب المنطقة · استخدامات مختلطة', 'District Core · Mixed Use', '#b4513a'),
 'LUP_MU_Entry District': ('me', 'منطقة المدخل', 'Entry District', '#d47a43'),
 'LUP_Retail': ('rt', 'تجاري', 'Retail', '#e2b04a'),
 'LUP_Hospitality_Luxury': ('hl', 'فنادق فاخرة', 'Luxury Hospitality', '#8b5a3c'),
 'LUP_Hospitality_Upscale': ('hu', 'فنادق متميزة', 'Upscale Hospitality', '#a9724b'),
 'LUP_Hospitality_w Branded Resi': ('hb', 'فنادق وسكن فندقي', 'Hospitality & Branded Residences', '#bb8b5f'),
 'LUP_RESI LD_LUXURY': ('rl', 'سكني فاخر', 'Luxury Residential', '#f0ddb9'),
 'LUP_Resi MD_Park': ('rp', 'سكني على الحدائق', 'Park Residences · Mid Density', '#e3c99f'),
 'LUP_Resi MHD_Mixed': ('rm', 'سكني متعدد الاستخدام', 'Mixed Residential · Mid–High Density', '#d6b487'),
 'LUP_Resi HD_Apt': ('rh', 'سكني عالي الكثافة', 'High-Density Apartments', '#c69f72'),
 'LUP_Golf': ('gf', 'ملعب الجولف', 'Golf Course', '#97b464'),
 'MP_Golf_lake': ('gl', 'بحيرات الجولف', 'Golf Lakes', '#4f90a9'),
 'LUP_Park': ('pk', 'الحدائق', 'Parks', '#7c9a5a'),
 'LUP_Community Facilities': ('cf', 'خدمات اجتماعية', 'Community Facilities', '#a6b298'),
 'LUP_Utilities': ('ut', 'مرافق', 'Utilities', '#8a857f'),
 'LUP_Data Center': ('dc', 'مراكز البيانات', 'Data Centers', '#6c7079'),
 'LUP_F1': ('pz', 'منطقة الأداء العالي', 'Performance Zone', '#7a3c34'),   # never shown under its DWG name (production note)
 'LU_WHS': ('wh', 'موقع التراث العالمي · اليونسكو', 'UNESCO World Heritage Site', '#f3e9d6'),
}
tags = []
for t in d['texts']:
    s = clean(t['s']); m = re.match(r'\s*([A-Z]{1,3})\s*-\s*(\d+)', s)
    if not m: continue
    g = lambda k: (re.search(k + r':\s*([^|]*)', s) or [None, None])[1]
    a = g('Area'); far = g('FAR'); mh = g('MH')
    tags.append({'code': m.group(1), 'id': int(m.group(2)), 'p': t['p'], 'area': float(a.replace(',', '')) if a else None,
                 'far': float(far) if far else None, 'lv': int(re.match(r'\d+', mh).group()) if mh and re.match(r'\d+', mh) else None})
zones, used = [], set()
for i, h in enumerate(d['hatches']):
    if h['l'] not in CATS: continue
    key = CATS[h['l']][0]
    loops = sorted([l for l in h['loops'] if len(l) >= 3], key=area, reverse=True)
    if not loops: continue
    outer = loops[0]
    polys = [[outer] + [l for l in loops[1:] if pip(l[0], outer)]] + [[o] for o in loops[1:] if not pip(o[0], outer)]
    a_geo = sum(area(p[0]) - sum(area(q) for q in p[1:]) for p in polys)
    j = next((j for j, t in enumerate(tags) if j not in used and any(pip(t['p'], p[0]) for p in polys)), None)
    tg = tags[j] if j is not None else None
    if tg: used.add(j)
    def fix(r, is_outer):
        r = simp(r); s = sarea(r)
        return dd([loc(p) for p in (r if (s > 0) == is_outer else r[::-1])])
    z = {'id': 'p%d' % i, 'cat': key, 'polys': [[fix(p[0], True)] + [fix(q, False) for q in p[1:]] for p in polys],
         'area': round(tg['area'] if tg and tg['area'] else a_geo)}
    if tg:
        z['pid'] = '%s-%d' % (tg['code'], tg['id']) if key != 'pz' else 'P-%d' % tg['id']
        if tg['far'] is not None: z['far'] = tg['far']
        if tg['lv']: z['lv'] = tg['lv']
    lv = z.get('lv')
    z['h'] = 0.4 if key in ('pk', 'gf', 'cf') and not lv else 0.12 if key == 'gl' else 0.3 if key == 'wh' else round((lv or 2) * LV, 2)
    zones.append(z)
# label clusters: same use, touching or across a road (<= 45 m apart)
def bbox(z): xs = [p[0] for pl in z['polys'] for p in pl[0]]; ys = [p[1] for pl in z['polys'] for p in pl[0]]; return (min(xs), min(ys), max(xs), max(ys))
B = [bbox(z) for z in zones]; par = list(range(len(zones)))
def find(i):
    while par[i] != i: par[i] = par[par[i]]; i = par[i]
    return i
def near(a, b, g=45):
    pa = [p for pl in a['polys'] for p in pl[0]]; pb = [p for pl in b['polys'] for p in pl[0]]
    pa = pa[::max(1, len(pa)//60)]; pb = pb[::max(1, len(pb)//60)]
    return min(math.hypot(p[0]-q[0], p[1]-q[1]) for p in pa for q in pb) <= g
for i in range(len(zones)):
    for j in range(i+1, len(zones)):
        if zones[i]['cat'] != zones[j]['cat'] or zones[i]['cat'] == 'pk': continue
        a, b = B[i], B[j]
        if a[0]-60 > b[2] or b[0]-60 > a[2] or a[1]-60 > b[3] or b[1]-60 > a[3]: continue
        if near(zones[i], zones[j]): par[find(i)] = find(j)
for i, z in enumerate(zones): z['g'] = 'g%d' % find(i)
roads = []
for l in d['lines']:
    m = re.match(r'ROW (\d+)\s+CL', l['l'])
    if m and len(l['p']) >= 2: roads.append({'w': int(m.group(1)), 'p': dd([loc(p) for p in (simp(l['p'], 0.5) or l['p'])])})
seen, bounds = set(), []
for b in d['bounds']:
    if b['l'] != 'Final_approved_boundaries' or len(b['p']) < 3: continue
    pts = dd([loc(p) for p in simp(b['p'], 0.5)]); k = tuple(map(tuple, pts[:3]))
    if k not in seen: seen.add(k); bounds.append(pts)
phase = [dd([loc(p) for p in simp(b['p'], 0.5)]) for b in d['bounds'] if b['l'] == 'PHASE 01A' and len(b['p']) > 2]
cats = {v[0]: {'ar': v[1], 'en': v[2], 'color': v[3], 'layer': k} for k, v in CATS.items()}
json.dump({'cats': cats, 'zones': zones, 'roads': roads, 'boundary': bounds, 'phase': phase}, open('geo.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print('zones', len(zones), 'tagged', sum(1 for z in zones if 'pid' in z), 'clusters', len(set(z['g'] for z in zones)), 'roads', len(roads))
