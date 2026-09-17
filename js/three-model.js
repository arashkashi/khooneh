/* 3D drawings built from the same schematic plans (content/plans-*.json → KHOONEH.plans) and level data.
   Modular: KHOONEH.render3D(host, spec) where spec = { plans: [plan ids bottom→top], elev: {id: m}, clear: {id: m}, mode?: 'floor' }.
   mode 'floor' → one floor as a roofless "dollhouse": walls from the union of room edges, floor plates by kind, stairs/lift/etc.
   otherwise  → the whole building as stacked massing with an explode toggle.
   Plan units are metres, north up: plan x → x, plan y → z, up = +y.
   Three.js is loaded as an ES module via the import map in the page head (needs http(s); on file:// the host shows a short note). */
const K = window.KHOONEH;
const fa = (document.documentElement.lang || 'en').startsWith('fa');
const KIND = { living: 0xCFE0D8, kitchen: 0xF0DDB4, dining: 0xF0DDB4, bedroom: 0xD9D4EA, bath: 0xC5E1EC, study: 0xE6DEC4, storage: 0xDADAD3, service: 0xD3CCC3,
  circulation: 0xE9E9E5, outdoor: 0xD6E4C9, void: 0xBFE3E0, parking: 0xE0E1DC, water: 0x2FA39C, green: 0x9FC58F, caretaker: 0xE6D3BC, hall: 0xEFEFEA };
const OPEN_KINDS = new Set(['outdoor', 'green', 'parking', 'water']);   // rooms that stand open: a plate, no walls
const WALL_T = 0.15, WALL_H = 2.6, SLAB = 0.3, DOOR_H = 2.1, SILL = 0.9;

let THREE, OrbitControls, mergeGeometries, RoundedBoxGeometry;
async function lib() {
  if (THREE) return;
  THREE = await import('three');                                       // resolved by the import map in base.html
  ({ OrbitControls } = await import('three/addons/controls/OrbitControls.js'));
  ({ mergeGeometries } = await import('three/addons/utils/BufferGeometryUtils.js'));
  ({ RoundedBoxGeometry } = await import('three/addons/geometries/RoundedBoxGeometry.js'));
}

// ---------- small geometry helpers (plan x,z → world x,z; shapes are built in the XZ plane, normal up) ----------
const rectPts = m => [[m[0], m[1]], [m[2], m[1]], [m[2], m[3]], [m[0], m[3]]];
const shapeOf = pts => new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
const flatGeom = (pts, holes = []) => { const s = shapeOf(pts); holes.forEach(h => s.holes.push(new THREE.Path(h.map(([x, z]) => new THREE.Vector2(x, -z))))); return new THREE.ShapeGeometry(s).rotateX(-Math.PI / 2); };
const slabGeom = (pts, holes, depth) => { const s = shapeOf(pts); holes.forEach(h => s.holes.push(new THREE.Path(h.map(([x, z]) => new THREE.Vector2(x, -z))))); return new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false }).rotateX(-Math.PI / 2).translate(0, -depth, 0); };
const boxAt = (x0, y0, z0, x1, y1, z1) => new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
const lineSegs = (segs, color, opacity = 1) => { // segs: flat array of [x,y,z, x,y,z, ...]
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(segs, 3));
  return new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity }));
};
const ringSegs = (pts, y) => { const out = []; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; out.push(a[0], y, a[1], b[0], y, b[1]); } return out; };
const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.92, metalness: 0, ...extra });
const mesh = (geom, mat, cast = true, receive = true) => { const m = new THREE.Mesh(geom, mat); m.castShadow = cast; m.receiveShadow = receive; return m; };
const rectIntersect = (a, b) => { const r = [Math.max(a[0], b[0]), Math.max(a[1], b[1]), Math.min(a[2], b[2]), Math.min(a[3], b[3])]; return r[2] - r[0] > 0.05 && r[3] - r[1] > 0.05 ? r : null; };
const pointInPoly = (pts, x, z) => { let inside = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, zi] = pts[i], [xj, zj] = pts[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) inside = !inside; } return inside; };
const pointInRoom = (r, x, z) => Array.isArray(r.poly) && r.poly.length >= 3 ? pointInPoly(r.poly, x, z) : (Array.isArray(r.m) && x >= r.m[0] && x <= r.m[2] && z >= r.m[1] && z <= r.m[3]);
const rectInside = (inner, outer, tol) => inner[0] >= outer[0] - tol && inner[1] >= outer[1] - tol && inner[2] <= outer[2] + tol && inner[3] <= outer[3] + tol;

// interval union along one line; joins gaps ≤ gap. ivs: [[a0,a1],...] → sorted, merged
function unionIntervals(ivs, gap = 0.12) {
  const s = ivs.map(i => i[0] <= i[1] ? [i[0], i[1]] : [i[1], i[0]]).sort((a, b) => a[0] - b[0]); const out = [];
  for (const iv of s) { const last = out[out.length - 1]; if (last && iv[0] <= last[1] + gap) last[1] = Math.max(last[1], iv[1]); else out.push([iv[0], iv[1]]); }
  return out;
}
const subtractInterval = (ivs, cut) => { const out = []; for (const [a, b] of ivs) { if (cut[1] <= a || cut[0] >= b) { out.push([a, b]); continue; } if (cut[0] > a) out.push([a, cut[0]]); if (cut[1] < b) out.push([cut[1], b]); } return out; };
// snap near-coincident coordinates (room edges 0.1 m apart are the same wall): value → cluster centre
function snapper(values, tol = 0.22, spread = 0.3) {
  const v = [...new Set(values.map(x => +x.toFixed(3)))].sort((a, b) => a - b); const map = new Map(); let group = [];
  const flush = () => { if (!group.length) return; const c = group.reduce((s, x) => s + x, 0) / group.length; group.forEach(x => map.set(x, +c.toFixed(3))); group = []; };
  for (const x of v) { if (group.length && (x - group[group.length - 1] > tol || x - group[0] > spread)) flush(); group.push(x); }
  flush(); return x => map.get(+x.toFixed(3)) ?? x;
}

// ---------- walls ----------
// A wall run: { axis:'h'|'v', c (line coordinate), ht (half thickness), A0, A1 (extent along the line), f0, f1 (free ends → cross line on top),
//   notch: {neg:[], pos:[]} (where a crossing wall joins, the side line of the top outline is interrupted), pieces:[{a0,a1,y0,y1,glass}] }
// Explicit `walls` (centreline segments with thickness; they already leave gaps at doors and windows) are used when the plan has them;
// otherwise the union of the interior room edges gives one wall per shared edge.
const wallRec = (axis, c, ht, A0, A1) => ({ axis, c: +c.toFixed(3), ht, A0, A1, f0: true, f1: true, notch: { neg: [], pos: [] }, pieces: null });
function collectWalls(plan, wallH) {
  const hs = [], vs = [], diag = [], explicit = (plan.walls || []).filter(w => Array.isArray(w) && w.length >= 4 && [w[0], w[1], w[2], w[3]].every(Number.isFinite));
  const groups = new Map();
  const add = (axis, c, ht, a0, a1) => { const k = axis + ':' + c.toFixed(2) + ':' + ht.toFixed(3); if (!groups.has(k)) groups.set(k, { axis, c, ht, ivs: [] }); groups.get(k).ivs.push([a0, a1]); };
  let joinGap = 0.12;
  if (explicit.length) {
    joinGap = 0.01;
    explicit.forEach(([x1, z1, x2, z2, t]) => {
      const ht = Math.min(0.2, Math.max(0.025, (Number.isFinite(t) ? t : WALL_T) / 2));
      if (Math.abs(z1 - z2) < 0.01) add('h', (z1 + z2) / 2, ht, x1, x2); else if (Math.abs(x1 - x2) < 0.01) add('v', (x1 + x2) / 2, ht, z1, z2); else diag.push([x1, z1, x2, z2, ht * 2]);
    });
  } else {
    const snapX = snapper((plan.rooms || []).flatMap(r => r.poly ? r.poly.map(q => q[0]) : [r.m[0], r.m[2]]));
    const snapZ = snapper((plan.rooms || []).flatMap(r => r.poly ? r.poly.map(q => q[1]) : [r.m[1], r.m[3]]));
    (plan.rooms || []).forEach(r => {
      if (r.kind === 'void' || OPEN_KINDS.has(r.kind)) return;
      const pts = (r.poly || rectPts(r.m)).map(([x, z]) => [snapX(x), snapZ(z)]);
      for (let i = 0; i < pts.length; i++) {
        const [x1, z1] = pts[i], [x2, z2] = pts[(i + 1) % pts.length];
        if (Math.abs(z1 - z2) < 1e-6) add('h', z1, WALL_T / 2, x1, x2); else if (Math.abs(x1 - x2) < 1e-6) add('v', x1, WALL_T / 2, z1, z2); else diag.push([x1, z1, x2, z2, WALL_T]);
      }
    });
  }
  const ext = explicit.length ? 0 : WALL_T / 2; // room-edge walls: stretch the horizontal runs so corners are filled
  for (const { axis, c, ht, ivs } of groups.values()) unionIntervals(ivs, joinGap).forEach(([a0, a1]) => {
    if (a1 - a0 < 0.04) return;
    const w = wallRec(axis, c, ht, axis === 'h' ? a0 - ext : a0, axis === 'h' ? a1 + ext : a1);
    w.pieces = [{ a0: w.A0, a1: w.A1, y0: 0, y1: wallH }]; (axis === 'h' ? hs : vs).push(w);
  });
  return { hs, vs, diag, explicit: explicit.length > 0 };
}

// openings. doors:[[x,y,width,swing]] (hinge point at the end of a wall, leaf width, swing n|s|e|w), windows:[[x1,y1,x2,y2]], elements {type:'door'}.
// The opening span is bridged into the wall run as pieces (lintel over doors, sill + glass + lintel for windows) so the top outline stays continuous.
function applyOpenings(hs, vs, plan, wallH) {
  const doors = [], DIR = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
  const along = (w, x, z) => w.axis === 'h' ? x : z, across = (w, x, z) => w.axis === 'h' ? z : x;
  const onLine = (list, c, tol) => list.filter(w => Math.abs(w.c - c) <= tol);
  const bridge = (list, axis, c, ht, o0, o1, mk) => { // merge the opening span into the run(s) of this line touching it, or make a new run
    const on = list.filter(w => Math.abs(w.c - c) <= 0.01);
    const L = on.find(w => Math.abs(w.A1 - o0) <= 0.12 && w.A0 < o0), R = on.find(w => w !== L && Math.abs(w.A0 - o1) <= 0.12 && w.A1 > o1);
    const inside = on.find(w => w.A0 < o0 + 0.02 && w.A1 > o1 - 0.02);
    if (inside) { // a door or window cut into a continuous run
      const out = []; inside.pieces.forEach(p => { if (o1 <= p.a0 || o0 >= p.a1 || p.y1 - p.y0 < wallH - 1e-3) { out.push(p); return; } if (o0 > p.a0) out.push({ ...p, a1: o0 }); out.push(...mk(o0, o1)); if (o1 < p.a1) out.push({ ...p, a0: o1 }); }); inside.pieces = out; return inside;
    }
    let w;
    if (L) { w = L; w.pieces.push(...mk(L.A1, o1)); w.A1 = o1; }
    else if (R) { w = R; w.pieces.unshift(...mk(o0, R.A0)); w.A0 = o0; }
    else { w = wallRec(axis, c, ht, o0, o1); w.pieces = mk(o0, o1); list.push(w); return w; }
    if (L && R) { w.pieces.push(...R.pieces); w.A1 = R.A1; w.f1 = R.f1; list.splice(list.indexOf(R), 1); }
    return w;
  };
  const doorPieces = (a0, a1) => a1 - a0 < 0.05 ? [] : [{ a0, a1, y0: DOOR_H, y1: wallH }];
  const winPieces = (a0, a1) => { const top = Math.min(DOOR_H, wallH - 0.2); return a1 - a0 < 0.05 ? [] : [{ a0, a1, y0: 0, y1: SILL }, { a0, a1, y0: SILL, y1: top, glass: true }, { a0, a1, y0: top, y1: wallH }]; };
  // doors
  const ops = (plan.doors || []).map(([x, z, w, sw]) => ({ x, z, w: w || 0.9, sw: DIR[sw] || null }));
  (plan.elements || []).forEach(el => { if (el.type === 'door' && el.m) { const m = el.m; ops.push({ x: m[2] - m[0] >= m[3] - m[1] ? m[0] : (m[0] + m[2]) / 2, z: m[2] - m[0] >= m[3] - m[1] ? (m[1] + m[3]) / 2 : m[1], w: Math.max(m[2] - m[0], m[3] - m[1]), sw: null, s: 1 }); } });
  ops.forEach(op => {
    // candidate walls: the hinge sits on the wall line, at (or near) one end of a run — the leaf fills the gap beyond that end
    const cands = [];
    [...hs, ...vs].forEach(w => {
      const d = Math.abs(across(w, op.x, op.z) - w.c), a = along(w, op.x, op.z); if (d > Math.max(0.2, w.ht + 0.05)) return;
      if (Math.abs(w.A1 - a) <= 0.15) cands.push({ w, s: 1, score: 3 - d });
      if (Math.abs(w.A0 - a) <= 0.15) cands.push({ w, s: -1, score: 3 - d });
      if (a > w.A0 + 0.15 && a < w.A1 - 0.15) cands.push({ w, s: 0, score: 1 - d });
    });
    if (!cands.length) return;
    cands.forEach(cd => { const par = op.sw && (cd.w.axis === 'h' ? op.sw[0] : op.sw[1]); if (par && cd.s === par) cd.score += 0.5; const list = cd.w.axis === 'h' ? hs : vs; const a = along(cd.w, op.x, op.z), sp = cd.s >= 0 ? [a, a + op.w] : [a - op.w, a]; if (cd.s !== 0 && list.some(o => o !== cd.w && o.A0 < sp[1] - 0.05 && o.A1 > sp[0] + 0.05)) cd.score -= 2; });
    cands.sort((a, b) => b.score - a.score);
    const { w, s } = cands[0], list = w.axis === 'h' ? hs : vs, a = along(w, op.x, op.z);
    let sgn = s || op.s || (op.sw ? (w.axis === 'h' ? op.sw[0] : op.sw[1]) : 0) || 1;
    let o0 = sgn > 0 ? a : a - op.w, o1 = sgn > 0 ? a + op.w : a; if (s === 0) { o0 = Math.max(w.A0 + 0.05, sgn > 0 ? a : a - op.w); o1 = Math.min(w.A1 - 0.05, o0 + op.w); }
    if (o1 - o0 < 0.3) return;
    bridge(list, w.axis, w.c, w.ht, o0, o1, doorPieces);
    // which way the leaf opens: the swing letter when it is across the wall; otherwise away from a hall / stair
    let side = op.sw && ((w.axis === 'h' && op.sw[1]) || (w.axis === 'v' && op.sw[0])) || 0;
    if (!side) { const px = w.axis === 'h' ? (o0 + o1) / 2 : w.c + 0.3, pz = w.axis === 'h' ? w.c + 0.3 : (o0 + o1) / 2; side = (plan.rooms || []).some(r => (r.kind === 'hall' || r.kind === 'circulation') && pointInRoom(r, px, pz)) ? -1 : 1; }
    doors.push({ axis: w.axis, c: w.c, hinge: sgn > 0 ? o0 : o1, sgn, side, w: o1 - o0 });
  });
  // windows
  (plan.windows || []).forEach(([x1, z1, x2, z2]) => {
    if (![x1, z1, x2, z2].every(Number.isFinite)) return;
    const horizontal = Math.abs(z1 - z2) <= Math.abs(x1 - x2), list = horizontal ? hs : vs, c = horizontal ? (z1 + z2) / 2 : (x1 + x2) / 2;
    const o0 = horizontal ? Math.min(x1, x2) : Math.min(z1, z2), o1 = horizontal ? Math.max(x1, x2) : Math.max(z1, z2); if (o1 - o0 < 0.2) return;
    const near = onLine(list, c, 0.2).sort((p, q) => Math.abs(p.c - c) - Math.abs(q.c - c)), ref = near.find(w => Math.abs(w.A1 - o0) <= 0.12 || Math.abs(w.A0 - o1) <= 0.12 || (w.A0 < o0 + 0.02 && w.A1 > o1 - 0.02)) || near[0];
    bridge(list, horizontal ? 'h' : 'v', ref ? ref.c : c, ref ? ref.ht : WALL_T / 2, o0, o1, winPieces);
  });
  return doors;
}

// crossings: the horizontal runs keep their length; vertical runs lose the thickness of every horizontal run they meet (no doubled slabs,
// no z-fighting), and each junction interrupts the horizontal run's side line so the top outline is the outline of the union
function trimWalls(hs, vs, snapTol) {
  const out = [...hs];
  vs.forEach(v => {
    const x = v.c, cross = hs.filter(h => h.A0 - 1e-3 <= x && x <= h.A1 + 1e-3);
    let z0 = v.A0, z1 = v.A1;
    // ends that sit on a horizontal run's centreline (or abut its face) are junctions: pull them onto the centreline so the trim takes over
    cross.forEach(h => { if (Math.abs(z0 - h.c) <= snapTol || Math.abs(z0 - (h.c + h.ht)) <= 0.02) z0 = h.c; if (Math.abs(z1 - h.c) <= snapTol || Math.abs(z1 - (h.c - h.ht)) <= 0.02) z1 = h.c; });
    let runs = [{ A0: z0, A1: z1, f0: v.f0, f1: v.f1 }];
    cross.filter(h => h.c + h.ht > z0 + 1e-6 && h.c - h.ht < z1 - 1e-6).sort((a, b) => a.c - b.c).forEach(h => {
      const next = [];
      runs.forEach(r => {
        if (h.c + h.ht <= r.A0 + 1e-6 || h.c - h.ht >= r.A1 - 1e-6) { next.push(r); return; }
        if (h.c - h.ht > r.A0 + 0.01) { next.push({ A0: r.A0, A1: h.c - h.ht, f0: r.f0, f1: false }); h.notch.neg.push([x - v.ht, x + v.ht]); }
        if (h.c + h.ht < r.A1 - 0.01) { next.push({ A0: h.c + h.ht, A1: r.A1, f0: false, f1: r.f1 }); h.notch.pos.push([x - v.ht, x + v.ht]); }
      });
      runs = next;
    });
    runs.forEach(r => {
      const w = wallRec('v', x, v.ht, r.A0, r.A1); w.f0 = r.f0; w.f1 = r.f1;
      w.pieces = v.pieces.map(p => ({ ...p, a0: Math.max(p.a0, r.A0), a1: Math.min(p.a1, r.A1) })).filter(p => p.a1 - p.a0 > 0.01);
      if (!w.pieces.length) return;
      // horizontal runs that end against this run's face (T-junction): no cross line there, and the face line is interrupted
      hs.forEach(h => {
        if (h.c < r.A0 - 1e-3 || h.c > r.A1 + 1e-3) return;
        if (Math.abs(h.A1 - (x - v.ht)) <= 0.02) { h.f1 = false; w.notch.neg.push([h.c - h.ht, h.c + h.ht]); }
        if (Math.abs(h.A0 - (x + v.ht)) <= 0.02) { h.f0 = false; w.notch.pos.push([h.c - h.ht, h.c + h.ht]); }
      });
      out.push(w);
    });
  });
  return out;
}

// wall meshes + the top outline (side lines minus junction notches, cross lines at free ends)
function wallGroup(walls, diag, wallH, y, mats) {
  const g = new THREE.Group(), solid = [], glass = [], lines = [];
  walls.forEach(w => {
    const ht = w.ht;
    w.pieces.forEach(p => {
      if (p.a1 - p.a0 < 0.01 || p.y1 - p.y0 < 0.01) return;
      const gt = p.glass ? Math.min(0.02, ht) : ht;
      const geo = w.axis === 'h' ? boxAt(p.a0, y + p.y0, w.c - gt, p.a1, y + p.y1, w.c + gt) : boxAt(w.c - gt, y + p.y0, p.a0, w.c + gt, y + p.y1, p.a1);
      (p.glass ? glass : solid).push(geo);
    });
    const yl = y + wallH + 0.004, side = (off, notches) => unionIntervals(notches, 0).reduce((ivs, n) => subtractInterval(ivs, n), [[w.A0, w.A1]]).forEach(([a0, a1]) => {
      if (a1 - a0 < 0.01) return; if (w.axis === 'h') lines.push(a0, yl, w.c + off, a1, yl, w.c + off); else lines.push(w.c + off, yl, a0, w.c + off, yl, a1);
    });
    side(-ht, w.notch.neg); side(ht, w.notch.pos);
    [[w.f0, w.A0], [w.f1, w.A1]].forEach(([free, a]) => { if (!free) return; if (w.axis === 'h') lines.push(a, yl, w.c - ht, a, yl, w.c + ht); else lines.push(w.c - ht, yl, a, w.c + ht, yl, a); });
  });
  diag.forEach(([x1, z1, x2, z2, t]) => { // non-axis walls: a plain slab each
    const len = Math.hypot(x2 - x1, z2 - z1); if (len < 0.05) return;
    const geo = new THREE.BoxGeometry(len, wallH, t || WALL_T); geo.rotateY(-Math.atan2(z2 - z1, x2 - x1)); geo.translate((x1 + x2) / 2, y + wallH / 2, (z1 + z2) / 2); solid.push(geo);
  });
  if (solid.length) g.add(mesh(mergeGeometries(solid, false), mats.wall));
  if (glass.length) g.add(mesh(mergeGeometries(glass, false), mats.glass, false, false));
  if (lines.length) g.add(lineSegs(lines, 0x3f4745, 0.55));
  return g;
}

// door leaves standing open (with the swing arc on the floor, as in the plan) so the openings read as doors from above
function doorGroup(doors, y, mats) {
  const g = new THREE.Group(), leaves = [], arcs = [], open = THREE.MathUtils.degToRad(78);
  doors.forEach(d => {
    const hx = d.axis === 'h' ? d.hinge : d.c, hz = d.axis === 'h' ? d.c : d.hinge;
    const cl = d.axis === 'h' ? [d.sgn, 0] : [0, d.sgn], pp = d.axis === 'h' ? [0, d.side] : [d.side, 0];
    const dir = [cl[0] * Math.cos(open) + pp[0] * Math.sin(open), cl[1] * Math.cos(open) + pp[1] * Math.sin(open)];
    const leaf = new THREE.BoxGeometry(d.w - 0.04, DOOR_H - 0.05, 0.04).translate((d.w - 0.04) / 2 + 0.02, (DOOR_H - 0.05) / 2, 0).rotateY(Math.atan2(-dir[1], dir[0])).translate(hx, y + 0.02, hz);
    leaves.push(leaf);
    const n = 10; for (let i = 0; i < n; i++) { const t0 = open * i / n, t1 = open * (i + 1) / n; const P = t => [hx + d.w * (cl[0] * Math.cos(t) + pp[0] * Math.sin(t)), hz + d.w * (cl[1] * Math.cos(t) + pp[1] * Math.sin(t))]; const p0 = P(t0), p1 = P(t1); arcs.push(p0[0], y + 0.03, p0[1], p1[0], y + 0.03, p1[1]); }
  });
  if (leaves.length) g.add(mesh(mergeGeometries(leaves, false), mats.door));
  if (arcs.length) g.add(lineSegs(arcs, 0x3f4745, 0.5));
  return g;
}

// ---------- elements ----------
function stairGroup(m, h, mats) {
  const g = new THREE.Group(), w = m[2] - m[0], d = m[3] - m[1], along = d >= w ? 'z' : 'x', len = Math.max(w, d), wid = Math.min(w, d), treads = [], nos = [];
  // a tread block from a (start along the run) to b, across [c0,c1], top at ytop (solid from the floor: a sawtooth mass reads as a stair)
  const block = (a, b, c0, c1, ytop) => { if (ytop <= 0.01) return; treads.push(along === 'z' ? boxAt(m[0] + c0, 0, m[1] + a, m[0] + c1, ytop, m[1] + b) : boxAt(m[0] + a, 0, m[1] + c0, m[0] + b, ytop, m[1] + c1)); nos.push(along === 'z' ? [m[0] + c0, ytop + 0.003, m[1] + b, m[0] + c1, ytop + 0.003, m[1] + b] : [m[0] + b, ytop + 0.003, m[1] + c0, m[0] + b, ytop + 0.003, m[1] + c1]); };
  if (Math.abs(w - d) < 0.35 && len < 2.6) {                                         // spiral: wedges around a pole
    const n = 12, r = len / 2 - 0.02, cx = (m[0] + m[2]) / 2, cz = (m[1] + m[3]) / 2, rise = Math.min(0.2, h / n);
    for (let i = 0; i < n; i++) { const geo = new THREE.CylinderGeometry(r, r, 0.05, 6, 1, false, i * Math.PI * 2 / n, Math.PI * 2 / n); geo.translate(cx, (i + 1) * rise, cz); treads.push(geo); }
    treads.push(new THREE.CylinderGeometry(0.06, 0.06, h, 10).translate(cx, h / 2, cz));
  } else if (wid >= 2.0 && len >= 2.0) {                                                // dog-leg: two flights and a landing at the far end
    const landing = Math.min(1.3, wid / 2), run = len - landing, n = Math.max(3, Math.round(run / 0.28)), td = run / n, rise = Math.min(0.19, h / (2 * n + 1)), half = wid / 2 - 0.05;
    for (let i = 0; i < n; i++) block(i * td, (i + 1) * td, 0, half, (i + 1) * rise);
    block(run, len, 0, wid, (n + 1) * rise);
    for (let i = 0; i < n; i++) block(run - (i + 1) * td, run - i * td, wid - half, wid, (n + 2 + i) * rise);
  } else {                                                                              // straight run, rising away from the start
    const n = Math.max(3, Math.round(len / 0.27)), td = len / n, rise = Math.min(0.19, h / n);
    for (let i = 0; i < n; i++) block(i * td, (i + 1) * td, 0, wid, (i + 1) * rise);
  }
  g.add(mesh(mergeGeometries(treads, false), mats.stair));
  if (nos.length) g.add(lineSegs(nos.flat(), 0x3f4745, 0.35));
  return g;
}
function liftGroup(m, h, enclosed, mats) {
  const g = new THREE.Group(), x0 = m[0], z0 = m[1], x1 = m[2], z1 = m[3];
  g.add(lineSegs([x0 + 0.05, 0.03, z0 + 0.05, x1 - 0.05, 0.03, z1 - 0.05, x1 - 0.05, 0.03, z0 + 0.05, x0 + 0.05, 0.03, z1 - 0.05], 0x3f4745, 0.7));
  if (!enclosed) { const s = 0.08, geos = [boxAt(x0, 0, z0, x1, h, z0 + s), boxAt(x0, 0, z1 - s, x1, h, z1), boxAt(x0, 0, z0, x0 + s, h, z1), boxAt(x1 - s, 0, z0, x1, h, z1)]; g.add(mesh(mergeGeometries(geos, false), mats.shaft)); }
  return g;
}
function carGroup(m, y) {
  const g = new THREE.Group(), w = m[2] - m[0], d = m[3] - m[1], along = d >= w ? 'z' : 'x', L = Math.min(4.3, Math.max(w, d) - 0.3), W = Math.min(1.75, Math.min(w, d) - 0.25), cx = (m[0] + m[2]) / 2, cz = (m[1] + m[3]) / 2;
  const body = mesh(new RoundedBoxGeometry(along === 'z' ? W : L, 0.55, along === 'z' ? L : W, 3, 0.12), std(0xEDECE8, { roughness: 0.6 })); body.position.set(cx, y + 0.3, cz); g.add(body);
  const cabL = L * 0.52, cab = mesh(new RoundedBoxGeometry(along === 'z' ? W * 0.86 : cabL, 0.5, along === 'z' ? cabL : W * 0.86, 3, 0.18), std(0xC9D3D2, { roughness: 0.4 }));
  cab.position.set(along === 'z' ? cx : cx - L * 0.04, y + 0.8, along === 'z' ? cz - L * 0.04 : cz); g.add(cab);
  return g;
}
function treeGroup(m, y) {
  const g = new THREE.Group(), r = Math.max(0.8, Math.min(m[2] - m[0], m[3] - m[1]) / 2), cx = (m[0] + m[2]) / 2, cz = (m[1] + m[3]) / 2;
  const trunk = mesh(new THREE.CylinderGeometry(0.11, 0.17, 3.2, 8), std(0x9C6B3C)); trunk.position.set(cx, y + 1.6, cz); g.add(trunk);
  const leaf = std(0x6A9A5E, { roughness: 1 });
  const c1 = mesh(new THREE.SphereGeometry(r * 0.95, 18, 14), leaf); c1.position.set(cx, y + 3.2 + r * 0.7, cz); g.add(c1);
  const c2 = mesh(new THREE.SphereGeometry(r * 0.6, 14, 10), leaf); c2.position.set(cx + r * 0.45, y + 3.2 + r * 1.2, cz - r * 0.3); g.add(c2);
  return g;
}

// ---------- a label sprite (Persian/English) that always faces the camera ----------
let labelFont;
function labelSprite(text) {
  if (!labelFont) { const cs = getComputedStyle(document.documentElement); labelFont = ((fa ? cs.getPropertyValue('--fa') : cs.getPropertyValue('--en')) || 'sans-serif').trim(); }
  const c = document.createElement('canvas'), ctx = c.getContext('2d'), px = 44, font = `500 ${px}px ${labelFont}`;
  ctx.font = font; const tw = Math.ceil(ctx.measureText(text).width);
  c.width = tw + 36; c.height = px + 26;
  ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,255,255,0.82)'; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(1, 1, c.width - 2, c.height - 2, c.height / 2); else ctx.rect(1, 1, c.width - 2, c.height - 2); ctx.fill();
  ctx.fillStyle = '#2b3230'; ctx.fillText(text, c.width / 2, c.height / 2 + 2);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.minFilter = THREE.LinearFilter;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false }));
  s.renderOrder = 20; const hh = 0.62; s.scale.set(hh * c.width / c.height, hh, 1); return s;
}

// ---------- one roofless floor (dollhouse) ----------
const polyArea = pts => Math.abs(pts.reduce((a, [x, z], i) => { const [x2, z2] = pts[(i + 1) % pts.length]; return a + x * z2 - x2 * z; }, 0)) / 2;
const polyCentroid = pts => { let a = 0, cx = 0, cz = 0; for (let i = 0; i < pts.length; i++) { const [x, z] = pts[i], [x2, z2] = pts[(i + 1) % pts.length], f = x * z2 - x2 * z; a += f; cx += (x + x2) * f; cz += (z + z2) * f; } return Math.abs(a) < 1e-9 ? [pts[0][0], pts[0][1]] : [cx / (3 * a), cz / (3 * a)]; };
function dollhouseFloor(p, y, clear, mats, withLabels) {
  const g = new THREE.Group(), wallH = Math.min(WALL_H, clear || WALL_H);
  const rooms = (p.rooms || []).filter(r => Array.isArray(r.m) && r.m.length === 4 && r.m.every(Number.isFinite)), els = p.elements || [], fps = (p.footprint || []).filter(f => Array.isArray(f) && f.length === 4 && f.every(Number.isFinite));
  const { hs, vs, diag, explicit } = collectWalls(p, wallH);
  // with explicit walls the rooms are exact; without, snap the room edges onto the wall lines so plates meet the walls
  const snapX = explicit ? x => x : snapper(rooms.flatMap(r => r.poly ? r.poly.map(q => q[0]) : [r.m[0], r.m[2]]));
  const snapZ = explicit ? z => z : snapper(rooms.flatMap(r => r.poly ? r.poly.map(q => q[1]) : [r.m[1], r.m[3]]));
  const ptsOf = r => (Array.isArray(r.poly) && r.poly.length >= 3 ? r.poly : rectPts(r.m)).map(([x, z]) => [snapX(x), snapZ(z)]);
  const voids = rooms.filter(r => r.kind === 'void');
  // slab under the footprint, with the voids cut out
  fps.forEach(fp => {
    const inner = [fp[0] + 0.02, fp[1] + 0.02, fp[2] - 0.02, fp[3] - 0.02]; // holes must stay clear of the outer contour
    const holes = voids.map(v => v.poly ? (rectInside(v.m, inner, 0) ? v.poly : null) : (rectIntersect(v.m, inner) && rectPts(rectIntersect(v.m, inner)))).filter(Boolean);
    g.add(mesh(slabGeom(rectPts(fp), holes, SLAB), mats.slab).translateY(y));
    g.add(lineSegs(ringSegs(rectPts(fp), y + 0.002), 0x5a6664, 0.5));
    g.add(lineSegs(ringSegs(rectPts(fp), y - SLAB), 0x5a6664, 0.35));
  });
  // floor plates by kind: larger rooms lower, so overlapping strips (a console over a room) never fight
  const byArea = rooms.filter(r => r.kind !== 'void').map(r => ({ r, pts: ptsOf(r) })).map(o => ({ ...o, a: polyArea(o.pts) })).sort((a, b) => b.a - a.a);
  byArea.forEach(({ r, pts }, i) => {
    const py = y + 0.012 + i * 0.0015;
    g.add(mesh(flatGeom(pts), std(KIND[r.kind] ?? 0xEDEDE8, { roughness: 1 }), false, true).translateY(py));
    g.add(lineSegs(ringSegs(pts, py + 0.002), 0x5a6664, 0.28));
  });
  voids.forEach(v => g.add(lineSegs(ringSegs(ptsOf(v), y + 0.004), 0x1D8F8A, 0.8)));
  // walls (explicit or from room edges), openings, door leaves
  const doors = applyOpenings(hs, vs, p, wallH);
  const walls = trimWalls(hs, vs, explicit ? 0.03 : 0.2);
  g.add(wallGroup(walls, diag, wallH, y, mats));
  if (doors.length) g.add(doorGroup(doors, y, mats));
  // elements
  const outsideFootprint = (x, z) => !fps.some(f => x >= f[0] && x <= f[2] && z >= f[1] && z <= f[3]);
  els.forEach(el => {
    const m = el.m; if (!Array.isArray(m) || m.length !== 4 || !m.every(Number.isFinite) || m[2] - m[0] < 0.05 || m[3] - m[1] < 0.05) return;
    const enclosed = rooms.some(r => r.kind === 'circulation' && rectInside(m, r.m, 0.12));
    if (el.type === 'stair') { const s = stairGroup(m, wallH, mats); s.position.y = y + 0.02; g.add(s); }
    else if (el.type === 'lift') { const l = liftGroup(m, wallH, enclosed, mats); l.position.y = y + 0.02; g.add(l); }
    else if (el.type === 'car') g.add(carGroup(m, y + 0.02));
    else if (el.type === 'tree') g.add(treeGroup(m, y));
    else if (el.type === 'water') g.add(mesh(boxAt(m[0], y + 0.005, m[1], m[2], y + 0.16, m[3]), mats.water, false, true));
    else if (el.type === 'green') g.add(mesh(boxAt(m[0], y, m[1], m[2], y + 0.32, m[3]), mats.green));
    else if (el.type === 'balcony') { // a slab, railed on the sides that face out of the building; inside the footprint only its outline
      const s = 0.04, cx = (m[0] + m[2]) / 2, cz = (m[1] + m[3]) / 2, rails = [];
      if (!outsideFootprint(cx, cz) && !outsideFootprint(cx, m[1] - 0.2) && !outsideFootprint(cx, m[3] + 0.2) && !outsideFootprint(m[0] - 0.2, cz) && !outsideFootprint(m[2] + 0.2, cz)) { g.add(lineSegs(ringSegs(rectPts(m), y + 0.06), 0x5a6664, 0.6)); return; }
      g.add(mesh(boxAt(m[0], y - 0.15, m[1], m[2], y + 0.02, m[3]), mats.slab));
      if (outsideFootprint(cx, m[1] - 0.2)) rails.push(boxAt(m[0], y, m[1], m[2], y + 1.0, m[1] + s));
      if (outsideFootprint(cx, m[3] + 0.2)) rails.push(boxAt(m[0], y, m[3] - s, m[2], y + 1.0, m[3]));
      if (outsideFootprint(m[0] - 0.2, cz)) rails.push(boxAt(m[0], y, m[1], m[0] + s, y + 1.0, m[3]));
      if (outsideFootprint(m[2] + 0.2, cz)) rails.push(boxAt(m[2] - s, y, m[1], m[2], y + 1.0, m[3]));
      if (rails.length) g.add(mesh(mergeGeometries(rails, false), mats.glass, false, false));
    }
    else if (el.type === 'void') { const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([...rectPts(m), rectPts(m)[0]].map(([x, z]) => new THREE.Vector3(x, y + 0.05, z))), new THREE.LineDashedMaterial({ color: 0x1D8F8A, dashSize: 0.3, gapSize: 0.18 })); l.computeLineDistances(); g.add(l); }
  });
  // labels
  // labels: largest rooms first; a label that would sit on top of one already placed is dropped (they are billboards of fixed world size)
  if (withLabels) (document.fonts?.ready || Promise.resolve()).then(() => {
    const placed = [];
    byArea.forEach(({ r, pts }) => {
      if (r.kind === 'void') return; const w = r.m[2] - r.m[0], d = r.m[3] - r.m[1];
      if (polyArea(pts) < 2.5 || Math.min(w, d) < 0.9) return;
      let text = fa ? (r.name_fa || r.name_en) : (r.name_en || r.name_fa); if (!text) return;
      const parts = text.split(/\s+[—–-]\s+/); text = parts[parts.length - 1].trim() || text;   // "duplex A — bedroom" → "bedroom"
      const [cx, cz] = polyCentroid(pts), s = labelSprite(text), sw = s.scale.x;
      if (placed.some(q => Math.abs(q.x - cx) < (q.w + sw) / 2 + 0.2 && Math.abs(q.z - cz) < 0.8)) return;
      placed.push({ x: cx, z: cz, w: sw }); s.position.set(cx, y + (OPEN_KINDS.has(r.kind) ? 0.5 : 1.25), cz); g.add(s);
    });
  });
  return g;
}

K.render3D = async function (host, spec) {
  if (!host || !spec || !spec.plans) return;
  if (location.protocol === 'file:') { host.innerHTML = `<p class="muted small">${fa ? 'مدل سه‌بعدی وقتی صفحه از یک سرور باز شود نمایش داده می‌شود.' : 'The 3D model shows when the page is served over http.'}</p>`; return; }
  try { await lib(); } catch (e) { host.innerHTML = ''; return; }
  const plans = spec.plans.map(id => K.plans[id]).filter(Boolean);
  if (!plans.length) return;
  const floorMode = spec.mode === 'floor';
  const aspect = floorMode ? 0.72 : 0.66;
  const W = host.clientWidth || 640, H = Math.round(W * aspect);
  host.innerHTML = '';
  const bar = document.createElement('div'); bar.className = 'm3-bar';
  bar.innerHTML = floorMode
    ? `<button type="button" data-a="top">${fa ? 'از بالا' : 'Top view'}</button><button type="button" data-a="reset">${fa ? 'نمای مایل' : 'Oblique'}</button><button type="button" data-a="rotate" aria-pressed="true">${fa ? 'چرخش' : 'Rotate'}</button><span class="m3-hint">${fa ? 'طبقه بی‌سقف: از بالا به درون فضاها نگاه کنید · کشیدن: چرخاندن · چرخ ماوس: نزدیک و دور' : 'The floor without its roof · drag to orbit · wheel to zoom'}</span>`
    : `<button type="button" data-a="explode">${fa ? 'باز کردن طبقات' : 'Explode floors'}</button><button type="button" data-a="rotate" aria-pressed="true">${fa ? 'چرخش' : 'Rotate'}</button><button type="button" data-a="reset">${fa ? 'نمای اول' : 'Reset view'}</button><span class="m3-hint">${fa ? 'کشیدن: چرخاندن · چرخ ماوس: نزدیک و دور' : 'Drag to orbit · wheel to zoom'}</span>`;
  const stage = document.createElement('div'); stage.className = 'm3-stage';
  host.append(bar, stage);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setSize(W, H);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  stage.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 500);
  const w = plans[0].plot.w, d = plans[0].plot.d;
  const cx = w / 2, cz = d / 2;
  const elevs = plans.map(p => floorMode ? 0 : (spec.elev?.[p.id] ?? p.elev ?? 0));
  const clears = plans.map(p => spec.clear?.[p.id] ?? 3.0);
  const top = Math.max(...elevs.map((e, i) => e + clears[i]));
  const bottom = Math.min(...elevs);
  // content bounds (footprint ∪ rooms ∪ elements) so the camera and the shadow box fit the drawing, not the plot
  const bb = [Infinity, Infinity, -Infinity, -Infinity];
  const grow = m => { if (!m) return; bb[0] = Math.min(bb[0], m[0]); bb[1] = Math.min(bb[1], m[1]); bb[2] = Math.max(bb[2], m[2]); bb[3] = Math.max(bb[3], m[3]); };
  plans.forEach(p => { (p.footprint || []).forEach(grow); (p.rooms || []).forEach(r => grow(r.m)); (p.elements || []).forEach(e => grow(e.m)); });
  if (!floorMode || !isFinite(bb[0])) { bb[0] = 0; bb[1] = 0; bb[2] = w; bb[3] = d; }
  const bx = (bb[0] + bb[2]) / 2, bz = (bb[1] + bb[3]) / 2, bw = bb[2] - bb[0], bd = bb[3] - bb[1];
  const fit = Math.hypot(bw, bd) / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const homeTarget = floorMode ? new THREE.Vector3(bx, 0.6, bz) : new THREE.Vector3(cx, (top + bottom) / 2, cz);
  const view = (az, el, dist) => new THREE.Vector3(homeTarget.x + dist * Math.sin(az) * Math.cos(el), homeTarget.y + dist * Math.sin(el), homeTarget.z + dist * Math.cos(az) * Math.cos(el));
  const home = floorMode ? view(THREE.MathUtils.degToRad(24), THREE.MathUtils.degToRad(52), fit * 1.12) : new THREE.Vector3(cx + 26, top + 14, cz + 30);
  const topView = new THREE.Vector3(bx, fit * 1.0, bz + 0.01);
  camera.position.copy(home);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(homeTarget); controls.enableDamping = true; controls.dampingFactor = 0.08; controls.maxPolarAngle = Math.PI * 0.49; controls.autoRotate = true; controls.autoRotateSpeed = floorMode ? 0.35 : 0.6;
  controls.minDistance = 4; controls.maxDistance = fit * 3;

  // soft sky fill plus one sun on the viewer's side (front-lit faces, shadows falling away behind the walls)
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd9d2c5, floorMode ? 1.5 : 1.15));
  if (floorMode) scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const sun = new THREE.DirectionalLight(0xffffff, floorMode ? 1.5 : 1.6);
  if (floorMode) sun.position.copy(view(THREE.MathUtils.degToRad(62), THREE.MathUtils.degToRad(60), 45)); else sun.position.set(bx - 16, top + 28, bz - 9);
  sun.target.position.set(bx, 0, bz); scene.add(sun.target); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 4;
  const sc = sun.shadow.camera, sr = floorMode ? Math.max(bw, bd) * 0.8 + 6 : 30; sc.left = -sr; sc.right = sr; sc.top = sr; sc.bottom = -sr; sc.near = 1; sc.far = 140; sc.updateProjectionMatrix();
  scene.add(sun);

  const mats = {
    wall: std(0xF3EFE7, { roughness: 0.95 }), slab: std(0xD9D5CC), stair: std(0xE4DFD5), shaft: std(0xCFCCC4), door: std(0xC9B99A, { roughness: 0.8 }),
    glass: new THREE.MeshStandardMaterial({ color: 0xBFE0EC, transparent: true, opacity: 0.45, roughness: 0.2, depthWrite: false }),
    water: new THREE.MeshStandardMaterial({ color: 0x2FA39C, transparent: true, opacity: 0.85, roughness: 0.3 }), green: std(0x9FC58F, { roughness: 1 }),
  };

  // ground: a light plane under everything, the yard, and the plot outline
  const groundY = floorMode ? -SLAB - 0.005 : Math.min(bottom, 0);
  const ground = mesh(new THREE.PlaneGeometry(w + 160, d + 160).rotateX(-Math.PI / 2), std(floorMode ? 0xF0EEE7 : 0xE8E4DA, { roughness: 1 }), false, true);
  ground.position.set(cx, groundY, cz); scene.add(ground);
  if (!floorMode && bottom < 0) { // excavation: cut visible as a lighter box top below ground level
    const pit = new THREE.Mesh(new THREE.BoxGeometry(w, -bottom + 0.02, d), std(0xF6F5F0));
    pit.position.set(cx, bottom / 2, cz); scene.add(pit);
  }
  if (floorMode) (plans[0].yard || []).forEach(yd => { scene.add(mesh(flatGeom(rectPts(yd)), std(0xE6E8DE, { roughness: 1 }), false, true).translateY(groundY + 0.004)); });
  scene.add(lineSegs(ringSegs([[0, 0], [w, 0], [w, d], [0, d]], floorMode ? groundY + 0.008 : 0.02), 0x8f9894, 0.9));

  const floors = [];
  const box = (r, y0, h, color, opacity = 1, inset = 0.06) => {
    const bw2 = Math.max(0.05, (r[2] - r[0]) - 2 * inset), bd2 = Math.max(0.05, (r[3] - r[1]) - 2 * inset);
    const m = new THREE.Mesh(new THREE.BoxGeometry(bw2, h, bd2), new THREE.MeshStandardMaterial({ color, transparent: opacity < 1, opacity, roughness: 0.9 }));
    m.position.set((r[0] + r[2]) / 2, y0 + h / 2, (r[1] + r[3]) / 2); m.castShadow = opacity >= 1; m.receiveShadow = true;
    return m;
  };
  plans.forEach((p, i) => {
    const y = elevs[i], h = clears[i];
    if (floorMode) { // a bad plan record must not blank the stage: build what can be built
      const g = new THREE.Group(); g.userData.index = i;
      try { g.add(dollhouseFloor(p, y, h, mats, true)); } catch (e) { console.warn('3D floor', p.id, e); }
      scene.add(g); floors.push(g); return;
    }
    // stacked massing: slab per footprint, a block per room, simple elements
    const g = new THREE.Group(); g.userData.base = 0; g.userData.index = i;
    (p.footprint || []).forEach(r => { const s = box(r, y - 0.3, 0.3, 0x2b3230, 1, 0); g.add(s); g.add(new THREE.LineSegments(new THREE.EdgesGeometry(s.geometry), new THREE.LineBasicMaterial({ color: 0x1a201e })).translateX(s.position.x).translateY(s.position.y).translateZ(s.position.z)); });
    (p.rooms || []).forEach(r => {
      if (r.kind === 'void') return;
      const outdoor = r.kind === 'outdoor' || r.kind === 'green' || r.kind === 'parking' && p.id.endsWith('ground') && r.id === 'yard';
      const tall = (r.tags || []).includes('c-double-height-loft') && r.kind === 'living';
      const rh = outdoor ? 0.12 : r.kind === 'water' ? 0.5 : tall ? 5.5 : h - 0.32;
      const m = box(r.m, y, rh, KIND[r.kind] ?? 0xEDEDE8, outdoor ? 1 : 0.92);
      m.userData.room = r; g.add(m);
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), new THREE.LineBasicMaterial({ color: 0x5a6664, transparent: true, opacity: 0.5 }));
      e.position.copy(m.position); g.add(e);
    });
    (p.elements || []).forEach(el => {
      const m = el.m; if (!Array.isArray(m) || m.length !== 4 || m[2] - m[0] < 0.05 || m[3] - m[1] < 0.05) return;
      if (el.type === 'tree') g.add(treeGroup(m, y));
      else if (el.type === 'car') g.add(carGroup(m, y + 0.02));
      else if (el.type === 'water') g.add(box(m, y + 0.02, 0.3, 0x2FA39C, 0.9, 0));
    });
    scene.add(g); floors.push(g);
  });

  // explode animation (eased), auto-rotate toggle, reset / top
  let exploded = false, t = 0, target = 0, kPrev = 0;
  const lift = floorMode ? 0 : (floors.length - 1) * 3.2 / 2;
  const rotateBtn = bar.querySelector('[data-a="rotate"]');
  const setRotate = on => { controls.autoRotate = on; rotateBtn?.setAttribute('aria-pressed', on); };
  bar.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.a === 'explode') { exploded = !exploded; target = exploded ? 1 : 0; b.textContent = exploded ? (fa ? 'بستن طبقات' : 'Stack floors') : (fa ? 'باز کردن طبقات' : 'Explode floors'); }
    if (b.dataset.a === 'rotate') setRotate(!controls.autoRotate);
    if (b.dataset.a === 'reset') { // the first view, kept consistent with how far the floors are spread right now
      const off = home.clone().sub(homeTarget).multiplyScalar(1 + 0.55 * kPrev);
      controls.target.copy(homeTarget); controls.target.y += kPrev * lift; camera.position.copy(controls.target).add(off);
    }
    if (b.dataset.a === 'top') { setRotate(false); camera.position.copy(topView); controls.target.set(bx, 0, bz); }
  });
  const ease = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  let last = performance.now();
  const tick = () => {
    const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now;
    t += (target - t) * (1 - Math.exp(-dt * 5));                       // time-based, so the explode looks the same at any frame rate
    const k = ease(Math.max(0, Math.min(1, t)));
    if (!floorMode && k !== kPrev) { // spread the floors, and follow them: lift the orbit target and back the camera off by the same measure
      floors.forEach((g, i) => { g.position.y = k * i * 3.2; });
      const off = camera.position.clone().sub(controls.target);
      controls.target.y += (k - kPrev) * lift; camera.position.copy(controls.target).add(off.multiplyScalar((1 + 0.55 * k) / (1 + 0.55 * kPrev)));
      kPrev = k;
    }
    controls.update(); renderer.render(scene, camera); requestAnimationFrame(tick);
  };
  tick();
  const ro = new ResizeObserver(() => { const w2 = host.clientWidth; if (!w2) return; const h2 = Math.round(w2 * aspect); renderer.setSize(w2, h2); camera.aspect = w2 / h2; camera.updateProjectionMatrix(); });
  ro.observe(host);
};

document.querySelectorAll('[data-model3d]').forEach(h => {
  let spec = null; try { spec = JSON.parse(h.dataset.model3d); } catch (e) { return; }
  K.render3D(h, spec).catch(e => console.warn('3D model', e));
});
