/* closing deck · live maps part C (V3 style) */
(function(){
/* maps of this part carry a marker in their first legend swatch (--c5c): with the camera kept on the whole of Egypt, the
   other governorates keep their counts while one is picked, and the picked bubble steps back behind its numbered pins */
const MK=';--c5c:1';
{const st=document.createElement('style');st.textContent='.mapc:has(.mleg i[style*="--c5c"]) svg.zoomed g[data-n]:not(.sel) text{opacity:1}'+
  '.mapc:has(.mleg i[style*="--c5c"]) svg.zoomed g[data-n].sel circle{fill-opacity:.28}'+
  /* whole Egypt stays in view, so the picked governorate's pins are drawn small enough to sit side by side */
  '.mapc:has(.mleg i[style*="--c5c"]) .gpins circle:not(.gpr){r:7.5px}.mapc:has(.mleg i[style*="--c5c"]) .gpins circle.gpr{r:11px}'+
  '.mapc:has(.mleg i[style*="--c5c"]) .gpins text{font-size:9.5px}';document.head.appendChild(st)}
/* 72 — sanitation treatment plants (20 thousand m3/day and more): the client's map names 71 plants, the same 71 as V3's
   «محطات المعالجة» Excel (WWTP / GEOL.wwtp, same order). V3's own map for them is a governorate map (slide 76): bubbles with
   the plants per governorate; a click lists that governorate's plants under the client's names, numbered pins at their sites */
{const NM={'القاهرة':['الجبل الأصفر','عرب أبو ساعد','أوراسكواليا','الشروق','توسعات حسن علام'],
  'الجيزة':['أبو رواش','أكتوبر – الغربية، المرحلة 2','حدائق أكتوبر – الجنوبية','الحوامدية'],
  'الإسكندرية':['التنقية الشرقية','برج العرب – الثلاثية','الألماني – العامرية','توسعات الألماني','أبو تلات','الهانوفيل – أرض الهيش','توسعات المعمورة'],
  'القليوبية':['طنان','شبلنجة','توسعات كفر شكر','بلتان – الصبايحة','إمياي','القلزم','أجهور الصغرى','الكوم الأحمر – شبين القناطر'],
  'البحيرة':['كفر الدوار','إدكو','توسعات النوبارية الجديدة','وادي النطرون'],'كفر الشيخ':['بلطيم المصيف'],'الغربية':['كفر الزيات'],
  'المنوفية':['شبين الكوم – الماي','السادات – الميكانيكية','قويسنا الصناعية','توسعات قويسنا','زاوية رازين'],
  'الشرقية':['العاشر من رمضان – الصناعي','توسعات العصلوجي','بلبيس','فاقوس','الصوالح','الصوفية وتلراك','أبو حماد – أبو لطفي'],
  'الدقهلية':['ميت غمر','ميت العامل'],'الإسماعيلية':['توسعات التل الكبير','القصاصين'],'بورسعيد':['جنوب بورسعيد C9'],'البحر الأحمر':['الغردقة'],
  'المنيا':['المنيا – الظهير الصحراوي','سمالوط','المنيا الجديدة – الميكانيكية'],'الوادي الجديد':['توسعات الخارجة'],
  'أسيوط':['أبنوب والفتح','عرب المدابغ الجديدة','دشلوط','منفلوط','ساحل سليم والبداري','صدفا والغنايم – المشايعة','شطب'],
  'سوهاج':['ساقلتة','توسعات طهطا','البلينا','المنشأة'],'قنا':['توسعات الصالحية – الجبلاو','فرشوط','الأشراف'],
  'الأقصر':['الحبيل','أرمنت وتوسعاتها','إسنا','طيبة – رقم 2'],'أسوان':['كيما 1 و2 و3']};
 const cap=(g,i)=>((WWTP[g]&&WWTP[g][i]||'').match(/<small class="lsub">[^<]*<\/small>/)||[''])[0];
 const LS=Object.fromEntries(Object.entries(NM).map(([g,ns])=>[g,ns.map((n,i)=>n+cap(g,i))]));
 const N=Object.fromEntries(Object.entries(NM).map(([g,ns])=>[g,ns.length]));
 const sp=SLIDES[72];
 if(sp){sp._plan=null;sp.cards=[
  ['title',[7,0,5,2],{bg:'dark',ki:'map-pinned',t:'محطات معالجة الصرف الصحي (الثنائية والثلاثية) طاقات 20 ألف ألف م3/ يوم فأكثر',fs:26}],
  ['kpi',[10,2,2,2],{bg:'grad',ic:'factory',pre:'تنفيذ',v:237,u:'محطة معالجة',l:'حتى عام 2026'}],
  ['kpi',[10,4,2,2],{bg:'mint',ic:'droplets',l:'لتصل طاقات المعالجة الكلية',v:19,u:'مليون م3/ يوم'}],
  ['plist',[7,2,3,4],{bg:'dark2',ic:'factory',fs:16,lic:'factory'}],
  ['map',[0,0,7,6],{mode:'gov',data:N,hot:5,rk:5.5,list:LS,geo:GEOL.wwtp,pick:'القاهرة',lic:'factory',unitW:['محطة','محطات'],noTour:1,top:190,
    title:'محطات معالجة الصرف الصحي (الثنائية والثلاثية) · اضغط على المحافظة لعرض محطاتها',
    legend:[['#3d5cc0'+MK,'5 محطات أو أكثر'],['#ee9873','أقل من 5']]}],
 ]}}
/* 86 — petroleum projects since 2014: the client's map labels 15 sites (fields as hollow rings, complexes / facilities as solid
   dots) and lists four projects that span many places. Same 15 as V3's OIL (Excel «خريطة مشروعات البترول»); names as the client
   writes them; offshore fields where the client puts them (Zohr far out at sea), the close clusters (Alexandria, Ain Sokhna)
   fanned out so every numbered pin reads, hence «مواقع تقريبية». Numbers run north to south and match the list beside the map */
{const PT=[['حقل ظهر',32.29,32.95,1],['حقل أتول – المرحلة الأولى',31.86,32.22,1],['حقول غرب دلتا النيل – المرحلة 9 أ',30.62,32.08,1],
  ['حقول شمال الإسكندرية – المراحل الثلاث',30.12,31.86,1],['حقل ريفين',29.62,31.72,1],['حقل نورس',31.12,31.62,1],
  ['مجمع موبكو للأسمدة – دمياط',31.78,31.42,2],['مجمع البنزين عالي الأوكتين – أنربك',29.95,31.14,2],['توسعات معمل تكرير ميدور',29.5,30.98,2],
  ['مجمع إيثيدكو للبتروكيماويات',30.02,30.72,2],['توسعات مجمع غازات الصحراء الغربية – جاسكو',29.48,30.5,2],
  ['مجمع التكسير الهيدروجيني – مسطرد',31.28,30.15,2],['محطة الصب السائل – سونكر',31.95,29.62,2],['تخزين وتداول المازوت – سوميد',32.42,29.52,2],
  ['مجمع البنزين عالي الأوكتين – أسيوط',31.18,27.2,2]];
 const sp=SLIDES[86];
 if(sp){sp._plan=null;const old=sp.cards;sp.cards=[
  ['title',[5,0,7,1],{bg:'dark',ki:'map-pinned',t:'أبرز مشروعات البترول المنفذة منذ 2014 على مستوى مختلف أقاليم الجمهورية',fs:22,pz:0}],
  ['kpi',[5,4,2,2],{bg:'grad',ic:'search',v:686,u:'اكتشاف',l:''}],
  ['plist',[5,1,5,3],{bg:'dark2',ic:'list-ordered',h:'المشروعات على الخريطة',cols:3,gap:7,fs:15,lic:'dot',
    items:PT.map((q,i)=>`<span class="nb" style="background:${q[3]===1?'#ee9873':'#3d5cc0'}">${i+1}</span>${q[0]}`)}],
  ['text',[10,1,2,3],{bg:'mint',ic:'fuel',t:'أضاف نحو 797 مليون برميل زيت ومتكثفات ومخزون غاز بنحو 55 تريليون قدم³.',fs:19}],
  ['plist',[7,4,5,2],{bg:'vio',ic:'map',h:'مشروعات متعددة المواقع',cols:2,gap:6,fs:14,items:[
    'الصهاريج الاستراتيجية لتخزين الخام<small class="lsub">السويس · الواحات · الجيزة · الإسكندرية</small>',
    'توسعات شبكة نقل الغاز الرئيسية<small class="lsub">الإسكندرية · مطروح · بورسعيد · الشرقية · الإسماعيلية · القليوبية · الجيزة · القاهرة</small>',
    'خطوط الخام والمنتجات الجديدة<small class="lsub">السويس · البحر الأحمر · القليوبية · الشرقية · أسيوط · المنيا · جنوب سيناء</small>',
    'توسعات محطات تموين السيارات بالغاز الطبيعي<small class="lsub">على مستوى جميع المحافظات</small>']}],
  ['map',[0,0,5,6],{mode:'pts',pts:PT,nums:PT.map(q=>q[0]),hiK:2,colors:{1:'#ee9873',2:'#3d5cc0'},noTour:1,top:280,
    title:'أبرز مشروعات البترول المنفذة منذ 2014 (مواقع تقريبية)',
    legend:[['#ee9873'+MK,'نطاقات الحقول'],['#3d5cc0','مواقع المجمعات والمنشآت']]}],
 ]}}
})();
