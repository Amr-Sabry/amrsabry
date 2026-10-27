// Nevera: read the land-use DWG and write extract.json (land-use hatches, road lines, site and phase boundaries, parcel tags).
// Setup:  npm init -y && npm install @mlightcad/libredwg-web
// Run:    node extract.mjs "Media City_Landuse Update_MP&Phase 01_20261023_Bind.dwg"
// The land-use polygons live in the bound block "LU_Hatch Block" (layers LUP_*), the roads in "Road Network",
// and the parcel tags ("RH - 102 / Area / FAR / MH") are MTEXT in model space. "Waste Water Tanks" is detail drawing and is skipped.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Dwg_File_Type, LibreDwg } from '@mlightcad/libredwg-web';
const pkgDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'node_modules/@mlightcad/libredwg-web');
const lib = await LibreDwg.create(path.join(pkgDir, 'wasm') + '/');
const buf = readFileSync(process.argv[2] || 'mp.dwg');
const dwg = lib.dwg_read_data(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), Dwg_File_Type.DWG);
const db = lib.convert(dwg);
const blocks = {}; for (const b of (db.tables?.BLOCK_RECORD?.entries || [])) blocks[b.name] = b;
const r = v => Math.round(v * 100) / 100;
const I = [1,0,0,1,0,0];
const mul = (m, n) => [m[0]*n[0]+m[2]*n[1], m[1]*n[0]+m[3]*n[1], m[0]*n[2]+m[2]*n[3], m[1]*n[2]+m[3]*n[3], m[0]*n[4]+m[2]*n[5]+m[4], m[1]*n[4]+m[3]*n[5]+m[5]];
const insM = (e, blk) => { const sx=e.xScale||1, sy=e.yScale||1, a=e.rotation||0, c=Math.cos(a), s=Math.sin(a), bp=(blk&&blk.basePoint)||{x:0,y:0};
  return mul([c*sx, s*sx, -s*sy, c*sy, e.insertionPoint.x, e.insertionPoint.y], [1,0,0,1,-bp.x,-bp.y]); };
const ap = (m, p) => [r(m[0]*p.x + m[2]*p.y + m[4]), r(m[1]*p.x + m[3]*p.y + m[5])];
const apA = (m, q) => [r(m[0]*q[0] + m[2]*q[1] + m[4]), r(m[1]*q[0] + m[3]*q[1] + m[5])];
function bulgePts(a, b, bulge, segs=8){ if(!bulge) return []; const th=4*Math.atan(bulge), dx=b[0]-a[0], dy=b[1]-a[1], c=Math.hypot(dx,dy); if(!c) return [];
  const rad=c/(2*Math.sin(th/2)), mx=(a[0]+b[0])/2, my=(a[1]+b[1])/2, h=rad*Math.cos(th/2), nx=-dy/c, ny=dx/c, cx=mx+nx*h, cy=my+ny*h, a0=Math.atan2(a[1]-cy,a[0]-cx), R=Math.hypot(a[0]-cx,a[1]-cy);
  const o=[]; for(let i=1;i<segs;i++){ const t=a0+th*i/segs; o.push([cx+R*Math.cos(t), cy+R*Math.sin(t)]); } return o; }
function verts(vs, closed){ const o=[]; for(let i=0;i<vs.length;i++){ const a=[vs[i].x,vs[i].y]; o.push(a); if(vs[i].bulge && (closed||i<vs.length-1)){ const n=vs[(i+1)%vs.length]; o.push(...bulgePts(a,[n.x,n.y],vs[i].bulge)); } } return o; }
function hatchLoops(e){ const loops=[];
  for(const bp of (e.boundaryPaths||[])){
    if(bp.vertices && bp.vertices.length) loops.push(verts(bp.vertices, true));
    else if(bp.edges){ const pts=[]; for(const ed of bp.edges){
      if(ed.start && ed.end) pts.push([ed.start.x, ed.start.y]);
      else if(ed.center && ed.radius!=null){ let s=ed.startAngle||0, en=ed.endAngle||0; if(ed.isCCW===false || ed.ccw===false){ s=-s; en=-en; } if(en<s) en+=2*Math.PI; const n=Math.max(4,Math.ceil((en-s)/(Math.PI/16))); for(let i=0;i<=n;i++){ const a=s+(en-s)*i/n; pts.push([ed.center.x+ed.radius*Math.cos(a), ed.center.y+ed.radius*Math.sin(a)]); } }
      else if(ed.fitDatum || ed.controlPoints){ for(const c of (ed.fitDatum||ed.controlPoints)) pts.push([c.x,c.y]); }
    } if(pts.length>2) loops.push(pts); }
  } return loops; }
const out = { hatches: [], lines: [], texts: [], bounds: [], legend: [] };
function walk(ents, M, depth, tag){
  for(const e of ents){
    const L = e.layer;
    if(e.type==='INSERT'){ const b=blocks[e.name]; if(!b||depth>4||e.name==='Waste Water Tanks') continue; walk(b.entities||[], mul(M, insM(e,b)), depth+1, tag||e.name); continue; }
    if(e.type==='HATCH'){ const loops=hatchLoops(e).map(l=>l.map(q=>apA(M,q))); if(loops.length) out.hatches.push({l:L, blk:tag||'', loops}); }
    else if(e.type==='LWPOLYLINE' || e.type==='POLYLINE2D'){ const closed=!!(e.flag&1)||!!e.closed; const p=verts(e.vertices||[], closed).map(q=>apA(M,q));
      if(tag==='Road Network' || /ROW|Road|Kerb/i.test(L)) out.lines.push({l:L, c:closed?1:0, p});
      else if(!tag && /bound|PHASE/i.test(L)) out.bounds.push({l:L, c:closed?1:0, p}); }
    else if(e.type==='LINE' && tag==='Road Network'){ out.lines.push({l:L, p:[ap(M,e.startPoint), ap(M,e.endPoint)]}); }
    else if(e.type==='MTEXT' || e.type==='TEXT'){ const p=e.insertionPoint||e.startPoint; if(!tag && p) out.texts.push({l:L, s:e.text, p:ap(M,p)}); }
  }
}
walk(db.entities||[], I, 0, '');
for(const e of (blocks['LU_Tabel']?.entities||[])) if(e.type==='HATCH') out.legend.push(e.layer);
writeFileSync('extract.json', JSON.stringify(out));
const cnt = o => o.reduce((m,x)=>(m[x.l]=(m[x.l]||0)+1,m),{});
console.log(JSON.stringify({hatches:out.hatches.length, hl:cnt(out.hatches), lines:out.lines.length, texts:out.texts.length, bounds:cnt(out.bounds)}));
