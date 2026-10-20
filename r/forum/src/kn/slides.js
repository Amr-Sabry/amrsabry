/* «الجلسة الختامية» — keynote edition: the slides in order. Figures and sentences are the client's; the questions (q) are
   ours, asked so the figures answer them (Amr 22:14: «كأنها سؤال والمعلومات إجابة … بأسلوب رسمي مختصر ومؤثر»).
   No maps (22:15: only maps whose information is certain). One header on every slide: icon + question (+ one client line).
   types: cover · strike (what was ended, crossed out; who lived there and what was built under it) · col (one measure as two columns) · rows (2–3 measures as bar pairs) · share (a share of Egypt's area) · gaps (the Nile's crossings)
   a = before 2014, b = 2026; add / adds = the part of b added since; call = {pre,v,u} beside the added part; ic = outline icon */
const KN=[
 {type:'cover',k:'منتدى مصر 2026 · الجلسة الختامية',y0:'2014',y1:'2026',s0:'من بناء مقومات التنمية',s1:'إلى صناعة المستقبل',moves:[
  {n:'التحرك الأول',t:'التعمير',ic:'building-2'},
  {n:'التحرك الثاني',t:'الربط',ic:'route'},
  {n:'التحرك الثالث',t:'التمكين',ic:'plug-zap'},
  {n:'التحرك الرابع',t:'الإنتاج والتشغيل',ic:'factory'},
  {n:'التحرك الخامس',t:'بناء الإنسان',ic:'users'}]},

 /* التحرك الأول · التعمير */
 {type:'share',ic:'land-plot',q:'كم من أرض مصر أصبح معمورًا؟',k:'مضاعفة نسبة الأراضي المعمورة والمستغلة من إجمالي مساحة مصر',
  a:{v:'7%'},b:{v:'14%'},whole:'إجمالي مساحة مصر'},

 {type:'col',ic:'building-2',q:'كم مدينة جديدة لدى مصر؟',
  a:{v:'22',u:'مدينة جديدة',n:'في أربعين عاما من بداية السبعينيات'},b:{v:'61',u:'مدينة جديدة'},add:39,
  call:{pre:'تم إنشاء',v:'39',u:'مدينة جديدة في 12 عام'}},

 {type:'strike',ic:'house',q:'ماذا تبقى من المناطق غير الآمنة؟',
  a:{v:'357',u:'منطقة غير آمنة'},a2:{ic:'users',pre:'يقطنها نحو',v:'1.2',u:'مليون نسمة'},
  b:{ic:'shield-check',t:'القضاء على المناطق غير الآمنة'},b2:{ic:'building-2',pre:'بتنفيذ',v:'246',u:'ألف وحدة سكنية'}},

 /* التحرك الثاني · الربط */
 {type:'col',ic:'route',q:'كم كيلومترًا من الطرق تربط مصر؟',k:'من شبكة محدودة حول وادي النيل إلى شبكة قومية أكثر اتساعًا وترابطًا',
  a:{v:'23.5',u:'ألف كم'},b:{v:'41',u:'ألف كم',n:'بالإضافة إلى رفع كفاءة 23.5 آلاف كم كانت تعاني من تهالك كامل'},
  adds:[{v:'7.5',u:'آلاف كم طرق رئيسية'},{v:'10',u:'آلاف كم بالمدن الجديدة'}]},

 {type:'gaps',ic:'waves',q:'كل كم كيلومترًا يُعبَر النيل؟',
  a:{v:'100',u:'كم',n:'المسافة بين محاور النيل'},b:{v:'25',u:'كم',n:'مستهدف'},
  done:{v:'19',u:'محور منفذ'},of:{v:'35',u:'محور على النيل'}},

 {type:'rows',ic:'ship',q:'هل تستقبل موانئنا السفن العملاقة؟',rows:[
  {ic:'anchor',nm:'عدد الموانئ البحرية والتجارية',a:'14',b:'19',u:'ميناء تجاري وبحري'},
  {ic:'ruler',nm:'أطوال الأرصفة',a:'37',b:'100',pb:'تتخطى',u:'كم'},
  {ic:'arrow-down-to-line',nm:'العمق',a:'11 : 15',an:15,b:'25',pb:'تصل إلى',u:'متر'}]},

 {type:'rows',ic:'container',q:'كم تستوعب موانئ مصر البحرية؟',rows:[
  {ic:'package',nm:'مليون طن سنويا',a:'185',b:'400'},
  {ic:'container',nm:'مليون حاوية سنويا',a:'12',b:'40'}]},

 {type:'rows',ic:'warehouse',q:'كم ميناءً بريًا وجافًا لدى مصر؟',rows:[
  {ic:'truck',nm:'عدد الموانئ البرية',a:'7',b:'9',u:'ميناء بري'},
  {ic:'warehouse',nm:'ميناء جاف ومنطقة لوجيستية',a:null,b:'33',pb:'إنشاء لأول مرة'}]},

 {type:'rows',ic:'plane',q:'كم تستوعب مطارات مصر؟',rows:[
  {ic:'plane',nm:'عدد المطارات',a:'19',b:'23',u:'ميناء جوي',nb:'منهم 4 مطارات إنشاء جديد'},
  {ic:'users',nm:'الطاقة الاستيعابية',a:'53',b:'73',u:'مليون راكب سنويا'},
  {ic:'luggage',nm:'السائحون المنقولون جوا',a:'9',b:'18',u:'مليون سائح'}]},

 /* التحرك الثالث · التمكين */
 {type:'col',ic:'zap',q:'هل تكفي الكهرباء احتياجات مصر؟',k:'من سد العجز إلى القدرة على تلبية الاحتياجات',
  a:{v:'29',u:'ألف ميجاوات'},b:{v:'64',u:'ألف ميجاوات'},add:35,
  call:{pre:'من خلال إضافة قدرات جديدة',v:'35',u:'ألف ميجاوات'}},
];
