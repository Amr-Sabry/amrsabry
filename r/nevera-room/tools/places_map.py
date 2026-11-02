# Each storyboard frame -> its place on our masterplan (zones.json). sure=False: the plan names no plot for it, so this is the nearest plot and the team should confirm it.
Z=lambda ref,sure=True,note='':dict(ref=ref,sure=sure,note=note)
SAQ=Z('py:هرم زوسر المدرج');WH=Z('p38');ST=Z('station');ALL=Z('all');HL=Z('p58');BIG=Z('p158',False,'أكبر ساحة هرم زجاج في قلب المنطقة، مفيش قطعة باسم الساحة الكبرى')
PK=Z('p153',False,'أكبر حديقة، مفيش قطعة باسم الملاعب');RES=Z('p163');CTRL=Z('p121',False,'مجمع الابتكار، مفيش قطعة باسم غرفة التحكم')
MC=Z('p50');MB=Z('p152');ED=Z('p198');PZ=Z('p172');MUS=Z('p212',False,'أراضي مؤسسية، مفيش قطعة باسم المتاحف');RED=Z('p65',False,'قلب المدينة الإعلامية، مفيش قطعة للسجادة الحمراء')
PLACE={
'shot_01-1.jpg':SAQ,'shot_01-2.jpg':SAQ,'shot_02-1.jpg':SAQ,'shot_02-2.jpg':WH,'shot_02-3.jpg':WH,'shot_02-4.jpg':WH,'shot_02-5.jpg':WH,
'shot_03-1.jpg':WH,'shot_03-2.jpg':ST,'shot_03-3.jpg':HL,'shot_03-4.jpg':BIG,'shot_03-5.jpg':ALL,
'shot_04-1.jpg':ALL,'shot_04-2.jpg':ALL,'shot_04-3.jpg':Z('rail'),'new_04-a.jpg':Z('py:هرم خوفو · الهرم الأكبر'),'new_04-b.jpg':Z('gem'),'new_04-c.jpg':Z('all',False,'مطار سفنكس مش في الموديل: 40 كم برّه المخطط'),
'shot_04-4.jpg':ST,'new_04-d.jpg':ST,'shot_04-5.jpg':ST,'shot_04-6.jpg':Z('p16'),
'shot_05-1.jpg':HL,'shot_05-2.jpg':HL,'shot_05-3.jpg':HL,'new_05-a.jpg':HL,'new_05-b.jpg':Z('p6'),'shot_05-4.jpg':HL,'shot_05-5.jpg':HL,
'shot_06-1.jpg':Z('p88'),'shot_06-2.jpg':Z('p146'),'shot_06-3.jpg':Z('p120'),'shot_06-4.jpg':PK,'shot_06-5.jpg':PK,
'shot_07-1.jpg':WH,'shot_07-2.jpg':WH,'shot_07-3.jpg':WH,'shot_07-4.jpg':WH,'shot_07-5.jpg':WH,'shot_07-6.jpg':WH,
'shot_08-1.jpg':RES,'new_08-a.jpg':Z('p17'),'new_08-b.jpg':Z('p206',False,'خدمات اجتماعية، مفيش قطعة باسم المستشفى'),'shot_08-2.jpg':RES,'shot_08-3.jpg':Z('p35'),'shot_08-6.jpg':Z('p35'),
'shot_08-4.jpg':CTRL,'shot_08-5.jpg':CTRL,'new_08-c.jpg':Z('p193'),'shot_08-7.jpg':CTRL,
'shot_09-1.jpg':BIG,'shot_09-2.jpg':BIG,'shot_09-3.jpg':BIG,'shot_09-4.jpg':BIG,'shot_09-5.jpg':Z('p86'),'shot_09-6.jpg':Z('p86'),'new_09-a.jpg':Z('p211',False,'أراضي مؤسسية، مفيش قطعة باسم قاعة المؤتمرات'),
'shot_10-1.jpg':PZ,'shot_10-2.jpg':PZ,'shot_10-3.jpg':PZ,'shot_10-4.jpg':PZ,'shot_10-5.jpg':PZ,'shot_10-6.jpg':PZ,'shot_10-7.jpg':PZ,'shot_10-8.jpg':PZ,
'shot_11-1.jpg':MC,'shot_11-2.jpg':MC,'shot_11-3.jpg':MC,'shot_12-1.jpg':MC,'shot_12-2.jpg':MC,'new_11-a.jpg':MC,'shot_12-3.jpg':MB,'shot_12-4.jpg':MB,'shot_12-5.jpg':MC,
'shot_13-1.jpg':MB,'shot_13-2.jpg':MB,'shot_13-5.jpg':MB,'shot_13-6.jpg':MB,'shot_14-1.jpg':Z('p108'),'shot_14-2.jpg':Z('p108'),'shot_14-3.jpg':Z('p108'),'shot_14-4.jpg':Z('p108'),'shot_14-5.jpg':Z('p108'),
'new_12-a.jpg':ED,'new_12-b.jpg':ED,'new_12-c.jpg':ED,'new_12-d.jpg':ED,'new_12-e.jpg':ED,'new_12-f.jpg':ED,'new_12-g.jpg':ED,'new_12-h.jpg':ED,
'shot_16-1.jpg':MUS,'shot_16-2.jpg':MUS,'shot_16-3.jpg':MUS,'shot_16-4.jpg':MUS,
'shot_17-1.jpg':MUS,'shot_17-2.jpg':RED,'shot_17-3.jpg':RED,'shot_17-4.jpg':RED,'shot_17-5.jpg':RED,'shot_17-6.jpg':RED,
'shot_18-1.jpg':CTRL,'shot_18-2.jpg':HL,'shot_18-3.jpg':PK,'shot_18-4.jpg':WH,'shot_18-5.jpg':ALL,'shot_18-6.jpg':ALL,'shot_18-7.jpg':MC,'shot_18-8.jpg':CTRL,
'shot_19-1.jpg':Z('none'),'shot_19-2.jpg':SAQ,'shot_19-3.jpg':ALL}
