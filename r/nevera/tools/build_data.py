import json, datetime
g = json.load(open('geo_s.json'))
LV = 1.4
# category content: description + role in the film (from the brief and the master plan)
INFO = {
 'mc': ('مكاتب شركات الإنتاج والإعلام حوالين الاستوديوهات. ده قلب صناعة الإعلام في المدينة.', 'المحرك الإبداعي، وهو ذروة الفيلم حسب البريف. حركة كاميرا من الـ sound stage للمشهد النهائي.'),
 'mb': ('مواقع تصوير خارجية مفتوحة مرتبطة بالاستوديوهات.', 'جسر بصري من الـ sound stages للـ exterior sets (البريف، سلايد 13).'),
 'mh': ('فنادق المدينة الإعلامية لفرق الإنتاج والزوار.', 'جزء من المحرك الإبداعي. إقامة لصناع الأفلام جنب مكان التصوير.'),
 'tp': ('وجهة ترفيهية بتجمع الألعاب والعروض والتجارب الغامرة من النهار لبالليل.', 'التجارب: سبب يخلي الزائر يطوّل إقامته.'),
 'ed': ('منظومة تعليمية بتربط المواهب بصناعة الإعلام وتحوّل المعرفة لتجربة إنتاج حقيقية.', 'تعليم الفنون والإعلام ضمن المحرك الإبداعي.'),
 'ip': ('مجمع للابتكار وريادة الأعمال جنب المدينة الإعلامية.', 'المحرك الإبداعي: الابتكار والتكنولوجيا.'),
 'in': ('أراضي مؤسسية.', ''),
 'cd': ('مركز حضري بيجمع الأعمال والتجارة والترفيه. ده القلب النابض للمشروع.', 'كشف المخطط وتجربة المدينة: شوارع حية تتمشى فيها.'),
 'me': ('محور الوصول اللي بيربط محطة القطار السريع بالمدينة الإعلامية.', 'الوصول: من القطار السريع لقلب المدينة.'),
 'rt': ('تجاري ومحلات.', 'تجربة المدينة: خدمات يومية.'),
 'hl': ('فنادق ومنتجعات فاخرة على حافة الصحرا.', 'التجارب: إقامة فاخرة بروح مصرية أصيلة.'),
 'hu': ('فنادق متميزة.', 'التجارب: إقامة.'),
 'hb': ('فنادق مع سكن فندقي بعلامات تجارية.', 'التجارب: إقامة فاخرة.'),
 'rl': ('مجتمع سكني فاخر وسط الجولف والبحيرات والمساحات الخضراء.', 'ختام الفيلم: مدينة آمنة وخاصة ومستدامة.'),
 'rp': ('سكني متوسط الكثافة مطل على الحدائق.', 'تجربة المدينة: مدينة تتمشى فيها.'),
 'rm': ('سكني متوسط وعالي الكثافة، ومعاه استخدامات تانية في الدور الأرضي.', 'تجربة المدينة: حياة يومية.'),
 'rh': ('عمارات سكنية عالية الكثافة.', 'تجربة المدينة.'),
 'gf': ('ملعب الجولف، وجزء من الحزام الأخضر (Green Necklace).', 'الحي السكني: رفاهية وسط الطبيعة.'),
 'gl': ('بحيرات ملعب الجولف.', 'الحي السكني: رفاهية وسط الطبيعة.'),
 'pk': ('شبكة الحدائق والمساحات الخضراء (Green Necklace).', 'الاستدامة: مدينة خضرا تتمشى فيها.'),
 'cf': ('خدمات اجتماعية للسكان.', ''),
 'ut': ('مرافق وبنية تحتية.', 'مش ظاهرة في الفيلم.'),
 'dc': ('مراكز بيانات ومستودعات.', 'مش ظاهرة في الفيلم.'),
 'pz': ('منطقة خاصة. تفاصيلها داخلية.', 'تتلمّح بالسرعة والدقة وخطوط الضوء، من غير أي اسم أو شعار (ملاحظة الإنتاج الداخلية).'),
 'wh': ('حدود موقع التراث العالمي (اليونسكو) جنب المشروع.', 'الافتتاحية: خلفية الجيزة التراثية، والأنشطة البيئية داخل منطقة اليونسكو.'),
}
ORDER = ['mc','mb','mh','tp','ed','ip','in','me','cd','rt','hl','hu','hb','rl','rp','rm','rh','gf','gl','pk','cf','ut','dc','pz','wh']
cats = {}
for k in ORDER:
    c = g['cats'][k]; d, f = INFO[k]
    cats[k] = {'ar': c['ar'], 'en': c['en'], 'color': c['color'], 'desc': d, 'film': f}
    if k in ('pk','gf','gl','cf'): cats[k]['flat'] = 0
    if k == 'wh': cats[k]['overlay'] = 1
# priorities for labels: the creative core first
for k, p in {'mc':4,'mb':3,'tp':3,'ed':2,'mh':2,'ip':2,'me':2,'cd':1,'gf':1,'wh':2}.items(): cats[k]['pri'] = p
zones = []
for z in g['zones']:
    c = cats[z['cat']]
    o = {'id': z['id'], 'cat': z['cat'], 'ar': c['ar'], 'en': c['en'], 'polys': z['polys'], 'area': z['area'], 'h': z['h'], 'label_group': z['g'],
         'desc': c['desc'], 'film': c['film']}
    facts = []
    if z.get('pid'): facts.append({'k': 'رقم القطعة', 'v': z['pid']}); o['pid'] = z['pid']
    if z.get('far') is not None: facts.append({'k': 'معامل البناء FAR', 'v': '%.2f' % z['far']})
    if z.get('lv'): facts.append({'k': 'أقصى ارتفاع', 'v': '%d أدوار' % z['lv'] if z['lv'] > 2 else ('دور واحد' if z['lv'] == 1 else 'دورين')})
    if z.get('far') is not None: facts.append({'k': 'مسطحات البناء التقريبية', 'v': '%s م²' % format(round(z['area'] * z['far']), ',')})
    o['facts'] = facts
    zones.append(o)
now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=3))).replace(microsecond=0).isoformat()
# --- features traced or derived (not land-use parcels) ---
def is_rail(r): return r['w'] == 20 and len(r['p']) == 23 and r['p'][0] == [5994, -2932]
rail = next((r['p'] for r in g['roads'] if is_rail(r)), None)
roads = [r for r in g['roads'] if not is_rail(r)]
for z in zones:
    if z['cat'] == 'pz': z['h'] = 0.35          # the circuit sits flat on its parcel
extras = {
 'rail': {'ar': 'خط القطار السريع', 'en': 'High-Speed Rail', 'p': rail,
          'desc': 'خط القطار الكهربائي السريع بيعدّي جنب المشروع، ومحطته المركزية جوه المدينة. الخط في الملف على طبقة ROW 20 CL.',
          'film': 'Masterplan reveal: خطوط القطر للساحل والأقصر وأسوان، والوصول بالقطار السريع.'},
 'station': {'ar': 'محطة حدائق أكتوبر التبادلية', 'en': 'October Gardens HSR Interchange', 'h': 5.6, 'link': 'station.html',
             'poly': [[-35, 334], [102, 515], [-707, 1308], [-723, 1306], [-878, 1152]],
             'desc': 'المحطة المركزية للقطار السريع في الماستر بلان، والأغلب إنها محطة حدائق أكتوبر: نقطة الالتقاء بين الخط الأول (السخنة–مطروح، سطحي) والخط الثاني (أكتوبر–أسوان، علوي). فيها مبنيين حجر على جانبي القضبان و5 كباري مشاة و4 أرصفة. الموديل معمول بالكود من صور الدرون (يناير 2025)، ومتحطّ على خط القطار جنب قطعتها.',
             'film': 'الوصول: أول لقطة جوه المدينة، ومن هنا يبدأ محور الوصول للمدينة الإعلامية.'},
 'depot': {'ar': 'ورش القطار السريع', 'en': 'HSR Depot & Workshops',
           'poly': [[403, 1833], [1502, 1954], [2210, -1229], [1636, -1367], [1622, -1309], [1266, -115], [866, 130], [529, 1394]],
           'desc': 'أرض ورش القطار السريع (رقم 7 في سلايد المخطط العام المطوّر). مستثناة من استعمالات الأراضي في الملف.',
           'film': 'مش ظاهرة في الفيلم.'},
 'circuit': {'ar': 'حلبة السباق', 'en': 'Race Circuit', 'img': 'circuit.jpg', **json.load(open('circuit.json')),
             'desc': 'مكان الحلبة جوه منطقة الأداء العالي. الرسم مأخوذ من سلايد المخطط العام المطوّر (رقم 6) ومركّب على حدود القطعة في الأوتوكاد، فمكانه تقريبي.',
             'film': 'تتلمّح بس: سرعة ودقة وخطوط ضوء كاينتك، من غير اسم أو عربيات أو شعارات (ملاحظة الإنتاج الداخلية).'},
}
# --- pyramids and landmarks around the site (WGS84 -> UTM 36N, the drawing's own grid) ---
from pyproj import Transformer
_t = Transformer.from_crs('EPSG:4326', 'EPSG:32636', always_xy=True)
def _loc(lat, lon): x, y = _t.transform(lon, lat); return [round(x - 318595), round(y - 3305622)]
PYR = [  # ar, en, site, lat, lon, base m, height m, shape, colour
 ('هرم خوفو · الهرم الأكبر', 'Pyramid of Khufu', 'الجيزة', 29.9792, 31.1342, 230, 146, 'std', '#dcc79c'),
 ('هرم خفرع', 'Pyramid of Khafre', 'الجيزة', 29.9761, 31.1308, 215, 143, 'std', '#d8c296'),
 ('هرم منقرع', 'Pyramid of Menkaure', 'الجيزة', 29.9725, 31.1281, 103, 65, 'std', '#d3ba8c'),
 ('الهرم الطبقي', 'Layer Pyramid', 'زاوية العريان', 29.9339, 31.1617, 84, 20, 'std', '#c9b38a'),
 ('هرم ساحورع', 'Pyramid of Sahure', 'أبوصير', 29.8975, 31.2036, 79, 47, 'std', '#cdb68c'),
 ('هرم نفر إر كا رع', 'Pyramid of Neferirkare', 'أبوصير', 29.8950, 31.2022, 105, 72, 'std', '#cdb68c'),
 ('هرم ني أوسر رع', 'Pyramid of Niuserre', 'أبوصير', 29.8961, 31.2044, 79, 51, 'std', '#cdb68c'),
 ('هرم زوسر المدرج', 'Step Pyramid of Djoser', 'سقارة', 29.8713, 31.2165, 121, 62, 'step', '#d6bf92'),
 ('هرم أوسركاف', 'Pyramid of Userkaf', 'سقارة', 29.8729, 31.2186, 73, 49, 'std', '#cbb48a'),
 ('هرم أوناس', 'Pyramid of Unas', 'سقارة', 29.8682, 31.2147, 58, 43, 'std', '#cbb48a'),
 ('هرم تتي', 'Pyramid of Teti', 'سقارة', 29.8752, 31.2214, 79, 52, 'std', '#cbb48a'),
 ('هرم ببي الثاني', 'Pyramid of Pepi II', 'سقارة الجنوبية', 29.8400, 31.2133, 79, 52, 'std', '#cbb48a'),
 ('الهرم الأحمر', 'Red Pyramid', 'دهشور', 29.8086, 31.2061, 220, 105, 'std', '#c4906a'),
 ('الهرم المنحني', 'Bent Pyramid', 'دهشور', 29.7903, 31.2094, 189, 101, 'bent', '#d2b98d'),
 ('الهرم الأبيض', 'White Pyramid', 'دهشور', 29.8033, 31.2228, 50, 20, 'std', '#e3d6bd'),
 ('الهرم الأسود', 'Black Pyramid', 'دهشور', 29.7917, 31.2236, 105, 75, 'std', '#6f6052'),
]
pyramids = [{'ar': a, 'en': e, 'site': st, 'lat': la, 'lon': lo, 'p': _loc(la, lo), 'base': bs, 'h': ht, 'shape': sh, 'color': c} for a, e, st, la, lo, bs, ht, sh, c in PYR]
landmarks = [{'ar': 'المتحف المصري الكبير', 'en': 'Grand Egyptian Museum', 'lat': 29.99315, 'lon': 31.11965, 'p': _loc(29.99315, 31.11965)}]
for pyr in pyramids:
    d = (pyr['p'][0] ** 2 + pyr['p'][1] ** 2) ** .5 / 1000
    pyr['desc'] = '%s. القاعدة حوالي %d م والارتفاع الأصلي حوالي %d م، وعلى بعد حوالي %.1f كم من وسط المشروع. مرسوم بمقاس قاعدته الحقيقي، والارتفاع مكبّر مرتين زي باقي الخريطة.' % (pyr['site'], pyr['base'], pyr['h'], d)
GIZA_BASE = {'Pyramid of Khufu': 60, 'Pyramid of Khafre': 70, 'Pyramid of Menkaure': 73}   # base levels a.s.l. used by the plateau model
for pyr in pyramids:
    if pyr['en'] in GIZA_BASE: pyr['giza'] = True; pyr['asl'] = GIZA_BASE[pyr['en']]
extras['pyramids'] = pyramids; extras['landmarks'] = landmarks
extras['terrain'] = json.load(open('terrain.json')); extras['terrain']['file'] = 'terrain.bin'; extras['terrain']['img'] = 'sat.jpg'; extras['terrain']['vex'] = 2
data = {
 'meta': {'title': 'Nevera · 3D Masterplan', 'source': 'Media City_Landuse Update_MP&Phase 01_20261023_Bind.dwg', 'source_short': 'Landuse Update · 23 Oct 2026',
          'source_date': '23 أكتوبر 2026', 'updated': now, 'total_area': 34870160, 'units': 'm, local origin = DWG (318595, 3305622)',
          'geo_src': 'التضاريس: SRTM 30 م (AWS Terrain Tiles). صورة القمر الصناعي: Sentinel-2 cloudless 2016 من EOX (CC BY 4.0). الأهرامات التلاتة والمتحف المصري الكبير منقولين من موديلات خريطة «مسيرة التنمية» (OpenStreetMap + SRTM).',
          'facts': [{'k': 'م² مساحة التطوير', 'v': '25.33M'}, {'k': 'وحدة سكنية', 'v': '76,945'}, {'k': 'مفتاح فندقي', 'v': '5,714'}, {'k': 'قطعة أرض في الملف', 'v': str(len(zones))}],
          'height_note': 'المباني بلوكات رمزية متولّدة بالكود: الارتفاع = أقصى عدد أدوار من بطاقة القطعة × 4 م، مكبّر مرتين زي التضاريس، والمساحة المبنية من معامل البناء ÷ عدد الأدوار. ترتيب المباني جوه القطعة للعرض بس، ومش تصميم معماري.'},
 'cats': cats, 'zones': zones, 'roads': roads, 'boundary': g['boundary'], 'phase': g['phase'], 'extras': extras}
json.dump(data, open('map/zones.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print('ok', len(zones), now)
