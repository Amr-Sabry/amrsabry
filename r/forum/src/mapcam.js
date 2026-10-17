/* Project cards on the live map (replacing the outline models).
   Each card opens on the whole of Egypt at the slide's layer, then the camera flies in to the project, settles into a slow
   drift (or travels along the line for railways and roads), lights the projects of the earlier layers that sit around it,
   and lays out the project's own facts from the «مسيرة التنمية» record: status, two figures as counters, what it serves. */
(function(){
  const ST={completed:['تم الانتهاء','done'],operating:['في التشغيل','done'],expected:['جاري التنفيذ','run'],partial:['تم جزئيًا · جاري الاستكمال','run']};
  /* figures: [value, unit, label, icon]; t: one line on what it serves; n: display name when the card should name more than the model did */
  const MC={
    17:{ms:'الإسكان والمرافق والمجتمعات العمرانية',st:'partial',dt:'متوقع الانتهاء 12/2026',z:8,f:[[28,'برجًا','أبراج المدينة','building'],[30,'ألف وحدة','وحدات سكنية','house']],t:'مدينة ساحلية متكاملة: أبراج وإسكان وخدمات ومرافق'},
    18:{ms:'الإسكان والمرافق والمجتمعات العمرانية',st:'partial',dt:'متوقع الانتهاء بدءًا من 12/2026',z:10,f:[[20,'برجًا','منطقة الأعمال المركزية','building-2'],[39767,'وحدة','إسكان مميز ومختلط','house']],t:'أحياء سكنية وخدمات ومرافق ومنطقة أعمال مركزية'},
    40:{ms:'صندوق التنمية الحضرية',st:'completed',dt:'يوليو 2020',z:12,f:[[18278,'وحدة','وحدات مجهزة ومفروشة','house'],[191,'فدانًا','مساحة الحي','land-plot']],t:'مجتمع عمراني متكامل لسكان المناطق غير الآمنة'},
    85:{n:'القطار الكهربائي السريع',ms:'النقل',st:'expected',dt:'القطاع الأول ديسمبر 2026',z:2.6,lines:['l0','l1','l2'],path:'l0',f:[[2000,'كم','طول الشبكة','route'],[60,'محطة','على 3 خطوط','train-front']],t:'يربط البحر الأحمر بالمتوسط والصعيد بسرعة 250 كم/س'},
    88:{ms:'النقل',st:'completed',dt:'يناير 2018',z:11,lines:['l14'],path:'l14',f:[[40,'كم','طول الطريق','route'],[35,'دقيقة','زمن الرحلة القاهرة–بنها','clock']],t:'طريق حر يربط 6 طرق رئيسة'},
    90:{ms:'النقل',st:'completed',dt:'ديسمبر 2021',z:12,f:[[7,'كم','طول المحور','route'],[29,'مترًا','عرض المحور','move-horizontal']],t:'يربط شرق النيل وغربه ببني سويف والمناطق الصناعية'},
    184:{ms:'الموارد المائية والري',st:'completed',dt:'2018',z:11,f:[[1.65,'مليون فدان','زمام يُروى','sprout'],[2,'هويس','للملاحة النهرية','ship']],t:'تحسين الري في 5 محافظات وتطوير الملاحة النهرية'},
    81:{ms:'النقل',st:'operating',dt:'2021',z:8,lines:['l3','l4'],path:'l3',f:[[103.3,'كم','طول الخط','route'],[19,'محطة','على المسار','tram-front']],t:'يربط مدن شرق القاهرة والعاشر من رمضان بالعاصمة الإدارية'},
    60:{ms:'البترول والثروة المعدنية',st:'operating',dt:'2020',z:12,f:[[150,'ألف م³','غازات بترولية مسالة','cylinder'],[100,'ألف م³','سعة تخزين السولار','fuel']],t:'يدعم مصر مركزًا إقليميًا لتداول الطاقة'},
    98:{ms:'الهيئة الاقتصادية لقناة السويس',st:'completed',dt:'9/2026',z:11,f:[[19,'مترًا','عمق الميناء','ship']],t:'أعمق ميناء من صنع الإنسان على اليابسة (موسوعة جينيس)'},
    96:{ms:'الهيئة الاقتصادية لقناة السويس',st:'operating',dt:'',z:10,f:[[2.2,'مليون حاوية','تداول سنوي','container'],[3,'عالميًا','مؤشر أداء موانئ الحاويات 2024','trophy']],t:'الأول إقليميًا في أداء موانئ الحاويات'},
    23:{ms:'الإسكان والمرافق والمجتمعات العمرانية',st:'completed',dt:'5/2018',z:11,f:[[500,'ألف م³/يوم','التوسعات','droplets'],[2.5,'مليون م³/يوم','الطاقة الإجمالية','gauge']],t:'أكبر محطات معالجة الصرف الصحي في القاهرة الكبرى'},
    56:{ms:'البترول والثروة المعدنية',st:'operating',dt:'2025',z:11,f:[[60,'%','زيادة الطاقة التكريرية','trending-up'],[160,'ألف برميل','يوميًا','fuel']],t:'منتجات بترولية عالية القيمة: سولار ووقود طائرات وبنزين'},
    58:{ms:'البترول والثروة المعدنية',st:'operating',dt:'2016',z:11,f:[[2,'مليون طن','يوريا سنويًا','factory'],[13.9,'مليون طن','إنتاج إضافي حتى 2026','package']],t:'رفع طاقة إنتاج الأسمدة للسوق المحلية والتصدير'},
    59:{ms:'البترول والثروة المعدنية',st:'operating',dt:'2016',z:11,f:[[500,'ألف طن','بولي إيثيلين سنويًا','factory'],[3.1,'مليون طن','إجمالي الإنتاج حتى 2026','package']],t:'يدعم الصناعات التحويلية بالمواد الخام'},
    55:{ms:'البترول والثروة المعدنية',st:'operating',dt:'2020',z:11,f:[[4.7,'مليون طن','مازوت يُحوَّل سنويًا','fuel'],[29,'مليون طن','منتجات حتى 2026','package']],t:'تحويل المازوت إلى منتجات بترولية عالية القيمة'},
    359:{ms:'الاتصالات وتكنولوجيا المعلومات',st:'operating',dt:'2021',z:11,f:[[2186,'طالبًا','العام الأكاديمي 2025/2026','graduation-cap']],t:'أول جامعة أهلية متخصصة في الاتصالات وتكنولوجيا المعلومات في مصر وأفريقيا'},
    181:{ms:'الموارد المائية والري',st:'expected',dt:'4/2027',z:5,f:[],t:'زيادة الرقعة الزراعية واستصلاح الأراضي الصحراوية لتحقيق الأمن الغذائي'},
    183:{ms:'الموارد المائية والري',st:'expected',dt:'12/2026',z:6,f:[[300,'ألف نسمة','فرص عمل','users-round'],[270,'ألف فدان','استصلاح وزراعة','land-plot']],t:'بنية أساسية لاستصلاح شمال ووسط سيناء'},
    176:{ms:'الموارد المائية والري',st:'expected',dt:'أكتوبر 2026',z:6,f:[],t:'نقل المياه من فرع رشيد ومعالجة الصرف لاستصلاح زمامات الدلتا الجديدة'},
    178:{ms:'الموارد المائية والري',st:'expected',dt:'المرحلة الأولى 1/2027',z:6,f:[[524,'مليون م³/يوم','المرحلة الأولى','waves'],[720,'مليون م³/يوم','المرحلة الثانية','waves']],t:'رفع القدرة التصريفية لخور وقناة مفيض توشكى'},
    185:{ms:'الموارد المائية والري',st:'completed',dt:'2021',z:9,f:[[5.6,'مليون م³/يوم','طاقة المعالجة','droplets'],[475,'ألف فدان','يمكن ريها في سيناء','sprout']],t:'تمنع تلوث بحيرة المنزلة وتوفر مياه الري لسيناء'},
    175:{ms:'الموارد المائية والري',st:'completed',dt:'يونيو 2026',z:11,f:[[7,'قناطر','منظومة توزيع المياه','waves'],[1.5,'مليون فدان','زمام في 5 محافظات','sprout']],t:'تحسين الري وتوزيع المياه في الصعيد'},
    5:{ms:'التعليم العالي والبحث العلمي',st:'expected',dt:'ديسمبر 2026',z:11,f:[],t:'زيادة الطاقة الاستيعابية لعلاج مرضى الأورام ودعم التدريب والبحث'},
    186:{ms:'السياحة والآثار',st:'operating',dt:'افتُتح 7/11/2025',z:11,f:[[56052,'قطعة أثرية','نُقلت إلى المتحف','landmark'],[5.1,'مليون زائر','منذ 2022/2023','users-round']],t:'يحفظ التراث وينشّط السياحة الثقافية'},
    62:{ms:'البترول والثروة المعدنية',st:'operating',dt:'2019',z:12,f:[[105,'ألف م³','صهاريج مازوت','cylinder']],t:'يعزز المخزون الاستراتيجي وأمن إمدادات الوقود'},
    30:{ms:'الإسكان والمرافق والمجتمعات العمرانية',st:'expected',dt:'التشغيل التجريبي أكتوبر 2026',z:9,f:[],t:'مجمع أديان وتنمية السياحة الروحانية والبيئية في سانت كاترين'},
  };
  const LIC=['map','route','zap','building-2','graduation-cap','factory','users-round'], LSN=['الأرض','الربط','الطاقة والمرافق','المجتمعات','الإنسان','الإنتاج','المواطن'];
  const KM=(a,b)=>d3.geoDistance(a,b)*6371;
  const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  const coordTxt=p=>`${p[1].toFixed(2)}° شمالًا · ${p[0].toFixed(2)}° شرقًا`;

  function MAPCAM(cc,r){
    const {el,c}=cc; cc.kill.forEach(f=>f()); cc.kill=[]; el.innerHTML=''; setCls(el,'bc dark mapc mapcam'); el.style.padding='0';
    const id=(c.ids||[c.id])[0], m=MC[id]||{}, ll=m.c||(typeof MLOC!=='undefined'&&MLOC[id]);
    if(!ll){el.innerHTML=`<div class="in" style="padding:24px"><b>${c.name||''}</b></div>`;return}
    const w=Math.round(r.w), h=Math.round(r.h), size=w<330||h<300?'sm':(h>=500&&w>=380?'lg':'md');
    const L0=(typeof B!=='undefined'&&B&&B.sp&&B.sp.L)||6, L=Math.max(1,Math.min(6,L0));
    /* base map, drawn at the card's first size; it scales with the card afterwards */
    const W0=W,H0=H; W=w; H=h; let ctx;
    try{ctx=baseMap(el,MAPTH,{glow:true,box:[w*.06,h*.08,w*.94,h*.92]})} finally {W=W0;H=H0}
    const svg=ctx.svg; svg.classed('duo',true).attr('preserveAspectRatio','xMidYMid slice').style('width','100%').style('height','100%').style('position','absolute').style('inset','0');
    uniqIds(svg.node()); ctx.step(L);
    const P=ctx.proj, gW=ctx.world, ni=ctx.svg.selectAll('.ni');
    /* the project's own line(s), drawn in over the network */
    const gl=gW.append('g').attr('class','mcl');
    const lines=(m.lines||[]).map(k=>DATA.lines.find(x=>x.id===k)).filter(Boolean);
    lines.forEach((l,i)=>{const p=gl.append('path').attr('d',d3.line()(l.pts.map(P))).attr('class','mcln'+(i?' sec':'')).attr('pathLength',1)});
    /* screen-space layer: crosshair, target, links to what sits around it */
    const ov=svg.append('g').attr('class','mcov');
    const lk=ov.append('g'), tg=ov.append('g').attr('class','mctg');
    tg.append('circle').attr('class','r2').attr('r',58); tg.append('circle').attr('class','r1').attr('r',24).attr('pathLength',1); tg.append('circle').attr('class','r0').attr('r',5.5);
    /* camera */
    const F1=[size==='sm'?w*.5:w*.44,size==='sm'?h*.56:h*.47], F0=[w/2,h/2];
    const p1=P(ll), k1=(m.z||8)*(size==='sm'?.8:1);
    const path=m.path&&DATA.lines.find(x=>x.id===m.path), PP=path?path.pts.map(P):null;
    const v0=[w/2,h/2,w], v1=[(PP?PP[0]:p1)[0],(PP?PP[0]:p1)[1],w/k1], zi=d3.interpolateZoom(v0,v1), DUR=Math.max(1700,Math.min(3000,zi.duration*.85));
    let view={c:[w/2,h/2],k:1,f:F0}, raf=0, alive=true, t0=0, lastK=0, frame=0;
    const scr=p=>[p[0]*view.k+view.f[0]-view.c[0]*view.k, p[1]*view.k+view.f[1]-view.c[1]*view.k];
    function apply(){
      const k=view.k, tx=view.f[0]-view.c[0]*k, ty=view.f[1]-view.c[1]*k;
      gW.attr('transform',`translate(${tx.toFixed(2)},${ty.toFixed(2)}) scale(${k.toFixed(4)})`);
      if(Math.abs(k-lastK)/k>.012||frame%6===0){ni.attr('transform',`scale(${(1/k).toFixed(4)})`);lastK=k}
      const s=scr(p1);
      tg.attr('transform',`translate(${s[0].toFixed(1)},${s[1].toFixed(1)})`);
      near.forEach(n=>{const q=scr(n.p); n.pa.attr('d',`M${s[0].toFixed(1)},${s[1].toFixed(1)}Q${((s[0]+q[0])/2+(q[1]-s[1])*.18).toFixed(1)},${((s[1]+q[1])/2-(q[0]-s[0])*.18).toFixed(1)} ${q[0].toFixed(1)},${q[1].toFixed(1)}`);
        n.lb.style.transform=`translate(${(q[0]/w*100).toFixed(2)}cqw,${(q[1]/h*100).toFixed(2)}cqh)`});
      frame++}
    /* projects of the earlier layers within reach of the project: lit and linked */
    const RK=size==='sm'?0:(PP?0:40);
    const cand=RK?NODES.filter(d=>d.t!=='nileaxis'&&d.t!=='school'&&d.L>=2&&d.L<=Math.max(L,3)).map(d=>({d,km:KM(d.p,ll)})).filter(x=>x.km>1.2&&x.km<RK).sort((a,b)=>a.km-b.km):[];
    const seenL={}, pool=[];
    cand.forEach(x=>{if(pool.length>=10)return;if((seenL[x.d.L]||0)>=3)return;if(pool.some(n=>n.d.n===x.d.n))return;seenL[x.d.L]=(seenL[x.d.L]||0)+1;pool.push({d:x.d,p:P(x.d.p),km:x.km})});
    const lay=document.createElement('div');lay.className='mclay';el.appendChild(lay);
    pool.forEach(n=>{const b=document.createElement('div');b.className='mcnl';b.innerHTML=`<span><i>${ICON(LIC[n.d.L-1],14)}</i>${n.d.n}</span>`;lay.appendChild(b);n.lb=b});
    const counts={}; if(!PP&&size!=='sm') NODES.forEach(d=>{if(d.t==='nileaxis'||d.t==='school'||d.L<2||d.L>6)return;if(KM(d.p,ll)<40)counts[d.L]=(counts[d.L]||0)+1});
    /* text overlays */
    const name=m.n||c.name||'', stx=ST[m.st]||null, fig=(m.f||[]).slice(0,size==='sm'?1:2);
    const plate=document.createElement('div');plate.className='mtitle mcp'+(size==='sm'?' sm':'');
    plate.innerHTML=`${size!=='sm'&&m.ms?`<div class="mtk">${m.ms}</div>`:''}<div class="mtt"><span class="mti">${ICON('map-pinned',22)}</span><b>${name}</b></div>${stx?`<div class="mcs ${stx[1]}"><i></i>${stx[0]}${m.dt&&size!=='sm'?` · <span>${m.dt}</span>`:''}</div>`:''}`;
    el.appendChild(plate);
    const foot=document.createElement('div');foot.className='mcft '+size+(size!=='sm'&&w<430&&fig.length>1?' stk':'');
    foot.innerHTML=`${size==='lg'&&m.t?`<div class="mcline">${m.t}</div>`:''}${fig.length?`<div class="mcfg">${fig.map(f=>`<div class="mcf"><span class="ic">${ICON(f[3],size==='sm'?18:22)}</span><span class="tx"><b class="num"><span class="cv" data-v="${f[0]}">${fmt(f[0])}</span>${f[1]==='%'?'<small class="pc">%</small>':` <small>${f[1]}</small>`}</b><i>${f[2]}</i></span></div>`).join('')}</div>`:(size!=='sm'&&m.t&&size!=='lg'?`<div class="mcline">${m.t}</div>`:'')}
      ${size==='lg'&&Object.keys(counts).length?`<div class="mcnc"><em>في نطاق 40 كم</em>${Object.entries(counts).map(([l,n])=>`<span title="${LSN[l-1]}">${ICON(LIC[l-1],15)}<b>${n}</b>${LSN[l-1]}</span>`).join('')}</div>`:''}
      ${size!=='sm'?`<div class="mcco">${ICON('map-pin',13)}${coordTxt(ll)}</div>`:''}`;
    el.appendChild(foot);
    /* keep only the neighbours whose labels, where the camera settles, stay clear of each other, the plate, the figures and the target */
    const near=[], box=(x,y,bw,bh)=>({x0:x,y0:y,x1:x+bw,y1:y+bh}), hit=(a,b)=>a.x0<b.x1+6&&b.x0<a.x1+6&&a.y0<b.y1+6&&b.y0<a.y1+6;
    const block=[box(plate.offsetLeft,plate.offsetTop,plate.offsetWidth,plate.offsetHeight),box(0,h-14-foot.offsetHeight,w,foot.offsetHeight+14),box(F1[0]-34,F1[1]-34,68,68)];
    pool.forEach(n=>{const sp=n.lb.firstChild, bw=sp.offsetWidth, bh=sp.offsetHeight||24;
      const q=[(n.p[0]-p1[0])*k1+F1[0],(n.p[1]-p1[1])*k1+F1[1]], b=box(q[0]-bw/2,q[1]-bh*1.4,bw,bh);
      const ok=near.length<(size==='lg'?5:3)&&b.x0>8&&b.x1<w-8&&b.y0>8&&Math.hypot(q[0]-F1[0],q[1]-F1[1])>40&&!block.some(r=>hit(r,b));
      if(!ok){n.lb.remove();return} block.push(b); near.push(n)});
    near.forEach((n,i)=>{n.pa=lk.append('path').attr('class','mclk').attr('pathLength',1).style('transition-delay',(i*.18)+'s');n.lb.style.transitionDelay=(i*.18+.3)+'s'});
    const tm=[], later=(f,ms)=>tm.push(setTimeout(f,ms));
    function reveal(){el.classList.add('mc-on');foot.querySelectorAll('.cv').forEach(sp=>{if(typeof countUp==='function'&&!RM)countUp(sp,150)});
      lay.classList.add('on');ov.classed('on',true)}
    later(()=>plate.classList.add('on'),250);
    /* fly in, then drift; railways and roads are travelled end to end and back */
    const T1=26000,T2=34000,T3=41000, A=(w/k1)*.035;
    let pathPos=null; if(PP){let acc=[0];for(let i=1;i<PP.length;i++)acc.push(acc[i-1]+Math.hypot(PP[i][0]-PP[i-1][0],PP[i][1]-PP[i-1][1]));pathPos={acc,len:acc[acc.length-1]}}
    const along=u=>{const s=u*pathPos.len,a=pathPos.acc;let i=1;while(i<a.length-1&&a[i]<s)i++;const t=(s-a[i-1])/((a[i]-a[i-1])||1);return [PP[i-1][0]+(PP[i][0]-PP[i-1][0])*t,PP[i-1][1]+(PP[i][1]-PP[i-1][1])*t]};
    function tick(now){
      if(!alive) return; if(!t0) t0=now; const t=now-t0;
      if(t<450){view={c:[w/2,h/2],k:1,f:F0}}
      else if(t<450+DUR){const u=ease((t-450)/DUR), z=zi(u); view={c:[z[0],z[1]],k:w/z[2],f:[F0[0]+(F1[0]-F0[0])*u,F0[1]+(F1[1]-F0[1])*u]}}
      else{const s=t-450-DUR; if(!view.arr){view.arr=1;reveal()}
        if(PP){const per=Math.max(16000,pathPos.len*k1/34*1000), ph=(s/per)%2, u=ease(ph<1?ph:2-ph);view={c:along(u),k:k1,f:F1,arr:1}}
        else view={c:[p1[0]+A*Math.sin(2*Math.PI*s/T1),p1[1]+A*.6*Math.sin(2*Math.PI*s/T2)],k:k1*(1+.045*Math.sin(2*Math.PI*s/T3)),f:F1,arr:1}}
      apply(); raf=requestAnimationFrame(tick)}
    if(RM){view={c:PP?PP[0]:p1,k:k1,f:F1,arr:1};apply();reveal();plate.classList.add('on')}
    else raf=requestAnimationFrame(tick);
    cc.kill.push(()=>{alive=false;cancelAnimationFrame(raf);tm.forEach(clearTimeout)});
  }
  window.MAPCAM=MAPCAM;
  const _paint=paint;
  paint=function(cc,r,again){if(cc.type==='model'){cc.pr=r;if(cc.done)return;cc.done=1;MAPCAM(cc,r);return}return _paint(cc,r,again)};

  const st=document.createElement('style');st.textContent=`
  .bc.mapcam{container-type:size}
  .mapcam .map .lb{display:none}
  .mapcam .mcln{fill:none;stroke:#b6f2dc;stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke;stroke-dasharray:1;stroke-dashoffset:1;animation:mcDraw 2.4s cubic-bezier(.6,0,.2,1) .6s forwards;filter:drop-shadow(0 0 5px rgba(182,242,220,.7))}
  .mapcam .mcln.sec{stroke-width:2.4;opacity:.75}
  .mapcam .mctg .r0{fill:#b6f2dc;stroke:#0c0c13;stroke-width:2}
  .mapcam .mctg .r1{fill:none;stroke:#b6f2dc;stroke-width:1.6;stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset 1.1s cubic-bezier(.6,0,.2,1)}
  .mapcam .mctg .r2{fill:rgba(182,242,220,.05);stroke:rgba(182,242,220,.3);stroke-width:1;stroke-dasharray:3 4;opacity:0;transition:opacity .9s cubic-bezier(.16,1,.3,1) .3s}
  .mapcam .mcov.on .mctg .r1{stroke-dashoffset:0}.mapcam .mcov.on .mctg .r2{opacity:1}
  .mapcam .mclk{fill:none;stroke:#ffffff;stroke-width:1.2;opacity:.7;stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset 1s cubic-bezier(.6,0,.2,1)}
  .mapcam .mcov.on .mclk{stroke-dashoffset:0}
  .mapcam .mcp{opacity:0;transform:translateY(-3.5%);transition:opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1)}
  .mapcam .mcp.on{opacity:1;transform:none}
  .mcs{display:flex;align-items:center;gap:7px;font-size:13.5px;font-weight:600;color:#e9eaf5}
  .mcs i{width:9px;height:9px;border-radius:50%;background:#b6f2dc;flex:none}.mcs.run i{background:none;box-shadow:inset 0 0 0 2px #a9a8ff}
  .mcs span{font-weight:500;color:#a9abc4}
  .mclay{position:absolute;inset:0;pointer-events:none;z-index:2;opacity:0;transition:opacity .8s cubic-bezier(.16,1,.3,1)}
  .mclay.on{opacity:1}
  .mcnl{position:absolute;left:0;top:0;width:0;height:0;opacity:0;transition:opacity .7s cubic-bezier(.16,1,.3,1)}
  .mclay.on .mcnl{opacity:1}
  .mcnl>span{position:absolute;left:0;top:0;transform:translate(-50%,-140%);white-space:nowrap;display:flex;align-items:center;gap:6px;font:500 12.5px var(--f-display);color:#e9eaf5;background:rgba(12,12,19,.86);border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:3px 10px 4px 8px}
  .mcnl i{display:grid;color:#a9a8ff}
  .mcft{position:absolute;left:14px;right:14px;bottom:14px;z-index:3;display:flex;flex-direction:column;gap:8px;opacity:0;transform:translateY(3.5%);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1);pointer-events:none}
  .mapcam.mc-on .mcft{opacity:1;transform:none}
  .mcline{font:600 16px/1.45 var(--f-display);color:#fff;background:rgba(12,12,19,.82);border:1px solid #2e2e48;border-radius:14px;padding:10px 14px;text-wrap:balance}
  .mcfg{display:flex;gap:8px}.mcft.stk .mcfg{flex-direction:column;gap:6px}.mcft.stk .mcf{padding:8px 12px}
  .mcf{flex:1 1 0;min-width:0;display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,rgba(28,28,44,.95),rgba(16,16,26,.92));border:1px solid #2e2e48;border-radius:14px;padding:10px 12px}
  .mcf .ic{flex:none;width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:rgba(182,242,220,.12);box-shadow:inset 0 0 0 1px rgba(182,242,220,.4);color:#b6f2dc}
  .mcf .tx{display:flex;flex-direction:column;gap:3px;min-width:0}
  .mcf .num{font-size:27px;line-height:1;color:#fff;white-space:nowrap}.mcf .num small{display:inline;font-size:13px;margin:0;opacity:.85;font-weight:500;letter-spacing:0}
  .mcf i{font-style:normal;font-size:12.5px;line-height:1.3;color:#a9abc4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .mcft.sm .mcf{padding:7px 10px;gap:8px}.mcft.sm .mcf .ic{width:30px;height:30px}.mcft.sm .mcf .num{font-size:21px}.mcft.sm .mcf i{font-size:11.5px}
  .mcnc{display:flex;flex-wrap:wrap;align-items:center;gap:6px;font:500 12.5px var(--f-display);color:#d5d7ea}
  .mcnc em{font-style:normal;color:#b6f2dc;font-weight:600;margin-inline-end:2px}
  .mcnc span{display:flex;align-items:center;gap:5px;background:rgba(12,12,19,.82);border:1px solid #2e2e48;border-radius:999px;padding:3px 9px 4px}
  .mcnc span svg{color:#a9a8ff}.mcnc b{color:#fff;font-weight:700}
  .mcco{align-self:flex-start;display:flex;align-items:center;gap:6px;font:500 12px var(--f-display);color:#8c8eb0;font-variant-numeric:tabular-nums;direction:rtl}
  .mcco svg{color:#b6f2dc}
  @keyframes mcDraw{to{stroke-dashoffset:0}}
  @media (max-width:1px){.mapcam *{transition:none!important;animation:none!important}}`;
  document.head.appendChild(st);
})();
