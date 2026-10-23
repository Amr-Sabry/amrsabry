/* V6 slide «خريطة السكك الحديدية» (pptx 85; it was the video media20.mp4) — Amr 22 Oct 12:39:
   «نضيف الخط الرابع عبارة ٢٥٠ كم مساره : بورسعيد - دمياط - الاسكندرية وكمان عاوز نوضح طول الخط على كل مسار
    ويبقى واضح ان مجموع الخطوط للقطار السريع وصل ٢٢٥٠ كم».
   A live map of its own (kmap.html?s=247&c=0): the whole of Egypt, still (no camera flight), no governorate names; the four
   high-speed lines each in its own calm colour with a pill on its route (name · from – to · length); the LRT and the two
   monorails stay, drawn as one quiet group at Cairo; a card in the Western Desert carries the total (2250 km, the client's figure).
   Colours keep clear of hue 213–242 (the client palette turns those blues gold) and stay muted, as Amr asked on the roads map. */
(function(){if(!(typeof RTS!=='undefined'&&RTS.rail&&typeof SLIDES!=='undefined'&&SLIDES[38]&&typeof S==='function'))return;
  const COL={h1:'#e6b65e',h2:'#d98663',h3:'#97c28a',h4:'#6fc0c2',c:'#bda3dc'};
  const src=Object.fromEntries(RTS.rail.routes.map(x=>[x.id,x]));
  const h4={id:'h4',n:'الخط الرابع',sub:'بورسعيد – دمياط – الإسكندرية',km:250,
    pts:[[32.300,31.255],[32.06,31.325],[31.81,31.412],[31.53,31.462],[31.16,31.525],[30.82,31.468],[30.42,31.398],[30.11,31.300],[29.92,31.200]],
    st:[[32.300,31.255],[31.81,31.412],[29.92,31.200]]};
  const pill=x=>`<span class="h4r"><i class="h4d"></i><b class="h4n">${x.n}</b><b class="h4v num">${x.km}</b><span class="h4u">كم</span></span><span class="h4s">${x.sub}</span>`;
  const hs=['h1','h2','h3'].map(id=>src[id]).concat([h4]).map(x=>Object.assign({},x,{
      col:COL[x.id],grp:'h',nl:1,html:1,n:pill(x),nm0:x.n,st:(x.st||[]).map(q=>[q[0],q[1]])}));
  /* the four lines draw together (one group, as on the client's map), then their pills take their places at once;
     where along each line its pill is tied (0…1 of the drawn line) */
  const AP={h1:.86,h2:.5,h3:.55,h4:.06}; hs.forEach(x=>x.ap=AP[x.id]);
  /* every pill has its own place (share of the 1080×1080 frame V6 shows): the first over the Western Desert under the coast,
     the fourth over north Sinai by Port Said, the second west of the Nile, the third over the Red Sea; the total card under them */
  const LP={h1:[.22,.41],h4:[.80,.335],h2:[.25,.535],h3:[.835,.705]}; hs.forEach(x=>{if(LP[x.id])x.lp=LP[x.id]});
  const cx=['lrt','me','mw'].map(id=>src[id]).filter(Boolean).map(x=>Object.assign({},x,{col:COL.c,grp:'c',fdim:1,nl:0,
      st:[],branch:x.branch?{pts:x.branch.pts,st:[]}:undefined}));
  RTS.hsr4={title:'السكك الحديدية والجر الكهربائي',panel:0,follow:0,still:1,noAreas:1,k31:1,topSafe:92,routes:[...hs,...cx],
    marks:[{p:[27.16,24.25],cls:'h4tot',t:`<span class="h4k">إجمالي القطار الكهربائي السريع</span><span class="h4b"><b class="num">2250</b><i>كم</i></span>
      <span class="h4l">للخطوط الأربعة فقط</span><span class="h4x">${[['القطار الكهربائي الخفيف LRT','حوالي','70','السلام – العاشر – العاصمة'],['مونوريل شرق النيل','','56.5','القاهرة – العاصمة'],['مونوريل غرب النيل','','43.8','الجيزة – 6 أكتوبر']].map(([n,pre,v,r])=>`<span class="h4i"><em></em><span class="h4in">${n}</span><span class="h4iv">${pre?`<small>${pre}</small>`:''}<b class="num">${v}</b> كم</span><span class="h4is">${r}</span></span>`).join('')}</span>`}]};
  /* a scene of its own, framed like the roads map (SLIDES[38], card 0), so both V6 maps sit the same */
  const base=SLIDES[38], card=base.cards[0];
  S({n:247,ax:base.ax,h:base.h,hs:base.hs,cards:[['map',card[1],{mode:'route',net:'hsr4',view:'egypt',title:'السكك الحديدية والجر الكهربائي',tic:'train-front',noTour:1,still:1,tags:0}]]});
  /* the styles apply to this scene only (the roads map, s=38, keeps its own one-line pills) */
  if(new URLSearchParams(location.search).get('s')!=='247')return;
  const st=document.createElement('style');st.id='hsr4';st.textContent=`
#stage .rl.k31>span{direction:rtl;flex-direction:column;align-items:flex-start;gap:1px!important;padding:6px 14px 7px!important;border-radius:14px!important;clip-path:none!important}
#stage .rl.k31>span::before{display:none!important}
#stage .rl.k31>span .h4r{display:flex;align-items:center;gap:8px}
#stage .rl.k31>span .h4d{width:12px;height:12px;border-radius:50%;background:var(--c);flex:none}
#stage .rl.k31>span .h4n{font-weight:800}
#stage .rl.k31>span .h4s{font-weight:500;font-size:15.5px;opacity:.86;padding-inline-start:20px}
#stage .rl.k31>span .h4v{font-size:25px;font-weight:800;color:var(--c);margin-inline-start:6px;line-height:1}
#stage .rl.k31>span .h4u{font-size:16px;font-weight:700;color:var(--c);margin-inline-start:-3px}
#stage .rl.mk.h4tot>span{display:flex;flex-direction:column;align-items:center;gap:2px;padding:16px 26px 16px!important;border-radius:20px!important;width:auto!important;height:auto!important;
  background:rgba(14,32,54,.94)!important;border:1.5px solid #c9a35f!important;color:#fff!important;font-size:19px!important;white-space:nowrap;text-align:center}
#stage .rl.mk.h4tot.on>span{clip-path:inset(0 0 0 0 round 20px)!important}
#stage .rl.mk.h4tot .h4k{font-size:19px;font-weight:700;color:#e9dcc2}
#stage .rl.mk.h4tot .h4b{display:flex;align-items:baseline;gap:10px;line-height:1}
#stage .rl.mk.h4tot .h4b b{font-size:64px;font-weight:800;color:#e6b65e}
#stage .rl.mk.h4tot .h4b i{font-style:normal;font-size:24px;font-weight:700;color:#e6b65e}
#stage .rl.mk.h4tot .h4l{font-size:16px;font-weight:600;opacity:.85;margin-bottom:8px}
#stage .rl.mk.h4tot .h4x{display:flex;flex-direction:column;gap:5px;align-self:stretch;font-size:15.5px;font-weight:600;line-height:1.2;border-top:1px solid rgba(201,163,95,.45);padding-top:8px;text-align:right}
#stage .rl.mk.h4tot .h4i{display:grid;grid-template-columns:auto 1fr auto;column-gap:8px;row-gap:1px;align-items:center}
#stage .rl.mk.h4tot .h4in{font-weight:700}
#stage .rl.mk.h4tot .h4iv{white-space:nowrap}
#stage .rl.mk.h4tot .h4iv small{font-size:12.5px;font-weight:600;opacity:.8;margin-inline-end:4px}
#stage .rl.mk.h4tot .h4iv b{font-size:19px}
#stage .rl.mk.h4tot .h4is{grid-column:2/4;font-size:13px;font-weight:500;opacity:.72}
#stage .rl.mk.h4tot .h4x em{display:inline-block;width:18px;height:4px;border-radius:2px;background:${COL.c};margin-inline-end:8px;vertical-align:middle}
#stage .rl.mk.h4tot .h4x b{font-weight:800;color:${COL.c}}`;
  document.head.appendChild(st);
})();
