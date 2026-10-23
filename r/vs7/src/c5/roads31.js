/* V6 slide «شبكة الطرق القومية» (pptx 64, kmap s=38 c=0) — Amr 22 Oct 11:40:
   «الرقم هيبقي ٣١ الف كيلومتر الطرق الرئيسية وهنضيف رسم للطريق الدائري الأوسطي والدائري وبدون زووم على الخريطة
    وميزهم بألوان مختلفة ويتكتب على كل طريق اسمه وبدون اسماء المحافظات».
   Its own network (RTS.roads stays as it is for every other map): the same 13 roads plus the Ring Road and the Middle Ring Road,
   one colour per road, every name on its road (a leader line where the roads crowd around Cairo), the camera fixed on the whole
   of Egypt (still), no governorate names (noAreas). Colours keep clear of hue 213–242: the client palette turns those blues gold. */
if(typeof RTS!=='undefined'&&RTS.roads&&typeof SLIDES!=='undefined'&&SLIDES[38]){
  const COL={l7:'#ff4040',ring:'#ffe14d',mid:'#ff8c1a',l14:'#c77dff',l15:'#00e5ff',l16:'#ff4fd8',l17:'#3ddc84',l9:'#b8ff3d',
    l8:'#ff9ec7',l18:'#00ffb3',l10:'#ffd0a1',l11:'#f2f2f2',l12:'#8fd3ff',l13:'#ff6b6b',l19:'#d4ff00'};
  /* the two Cairo rings, traced from their course: the Ring Road round Greater Cairo (El-Moneeb, Haram, Mariouteya, Bashtil,
     El-Warraq, Shubra El-Kheima, Mostorod, El-Marg, El-Salam, Nasr City, New Cairo, Katameya, Maadi); the Middle Ring Road
     outside it: Belbeis road → Ismailia road → Suez road → Sokhna road → Autostrad → the Nile → Fayoum road → the Dabaa axis */
  const ring={id:'ring',n:'الطريق الدائري',grp:'a',nl:1,st:[],pts:[[31.226,29.982],[31.17,29.986],[31.152,30.028],[31.142,30.058],
    [31.168,30.095],[31.215,30.118],[31.262,30.14],[31.3,30.155],[31.35,30.155],[31.4,30.125],[31.425,30.088],[31.432,30.05],
    [31.418,30.012],[31.37,29.986],[31.31,29.97],[31.265,29.966],[31.226,29.982]]};
  const mid={id:'mid',n:'الطريق الدائري الأوسطي',grp:'a',nl:1,st:[],pts:[[31.52,30.28],[31.57,30.19],[31.61,30.09],[31.62,29.99],
    [31.56,29.9],[31.4,29.85],[31.28,29.835],[31.16,29.87],[31.04,29.93],[30.99,30.02]]};
  const base=RTS.roads.routes.filter(x=>/^l\d+$/.test(x.id));
  const routes=[...base.map(x=>Object.assign({},x,{grp:'a',nl:1})),ring,mid].map(x=>Object.assign(x,{col:COL[x.id]||x.col}));
  /* where along each road its name is tied (0…1 of the drawn line) */
  const AP={l7:.72,ring:.3,mid:.55,l14:.95,l15:.45,l16:.6,l17:.62,l9:.5,l8:.5,l18:.62,l10:.78,l11:.45,l12:.33,l13:.5,l19:.5};
  routes.forEach(x=>x.ap=AP[x.id]??.5);
  /* where the crowded names sit, as a share of the frame (the rest find their own place, clear of everything) */
  const LP={ring:[.5,.262],l14:[.25,.211],l18:[.153,.303],l8:[.215,.375],l15:[.25,.435],l7:[.27,.5],mid:[.30,.56],
    l10:[.80,.243],l17:[.838,.326],l16:[.806,.382],l9:[.797,.437]};
  routes.forEach(x=>{if(LP[x.id])x.lp=LP[x.id]});
  RTS.roads31={title:'شبكة الطرق القائمة والجديدة',panel:0,follow:0,still:1,noAreas:1,k31:1,topSafe:92,routes};
  const cd=(SLIDES[38].cards||[]).find(c=>c[0]==='map'&&c[2].net==='roads');
  if(cd)Object.assign(cd[2],{net:'roads31',still:1});
}
