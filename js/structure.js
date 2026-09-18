/* The structural idea of the next design, as one plan (north up, metres, x from the west wall, y from the street southward).
   Geometry from content/plans-next.json: mat foundation under the body, twelve columns on lines A (west wall), B (7.35) and
   D (east wall), the riser spine B–C, a shear core around the stair and lift, two shear-wall segments on the west wall, the void,
   the fourth-floor opening over the living, and the sunken garden with its own retaining wall outside the mat.
   It is the FAMILY'S IDEA, not an engineer's drawing: hatched, dashed and watermarked. Host: [data-structure="next"]. */
(function () {
  const K = window.KHOONEH || {};
  const fa = (document.documentElement.lang || 'en').slice(0, 2) === 'fa';
  const NS = 'http://www.w3.org/2000/svg';
  const fd = s => fa ? String(s).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]).replace('.', '٫') : String(s);
  const INK = '#161C1B', INK2 = '#5A6664', TURQ = '#1D8F8A', EARTH = '#9C6B3C', LEAF = '#4F7D4A', RULE = '#CFD5D2', YARD = '#ECEDE9';
  const S_ = {   // the idea (plans-next.json mirrors these; the plan file wins when it is loaded)
    plot: { w: 10.5, d: 20.14 }, body: [0.25, 0.3, 10.25, 14.0], yard: [0, 14.0, 10.5, 20.14],
    grid: { x: [0.25, 7.35, 10.25], y: [0.3, 4.9, 9.4, 14.0], letters: [['A', 0.25], ['B', 7.35], ['C', 8.0], ['D', 10.25]] },
    columns: [[0.25, 0.3], [0.25, 4.9], [0.25, 9.4], [0.25, 14.0], [7.35, 0.3], [7.35, 4.9], [7.35, 9.4], [7.35, 14.0], [10.25, 0.3], [10.25, 4.9], [10.25, 9.4], [10.25, 14.0]],
    spine: [7.35, 0.3, 8.0, 14.0],
    core: [8.0, 0.3, 10.25, 7.3], coreWall: 0.3,
    shearWest: [[0.25, 0.3, 0.5, 4.9], [0.25, 11.0, 0.5, 14.0]],
    riser2: [0.25, 9.4, 0.9, 11.0],
    voidRect: [0.25, 6.0, 2.75, 9.0],
    living: [0.25, 9.4, 7.35, 15.2],
    garden: [2.25, 14.6, 8.25, 18.6], gardenWall: 0.3,
    column: 0.45, beam: 0.35, mat: -3.5, gap: 8
  };
  const L = fa ? {
    mat: 'رادیه (پی گسترده) ≈ −۳٫۵', core: 'هستهٔ برشی — پله و آسانسور', shear: 'دیوار برشی', riser: 'رایزر', voidL: 'حفره',
    garden: ['دیوار حائل جدا از پی'], shoring: 'سازهٔ نگهبان کنار همسایه', gap: 'درز انقطاع ≥ ۸ سانتی‌متر هر طرف',
    living: 'سوراخ سقف طبقهٔ چهارم ≈ ۴۱ متر', street: 'کوچه (شمال)', yard: 'حیاط (جنوب)', north: 'شمال', idea: 'ایدهٔ خانواده — نه نقشه',
    aria: 'نقشهٔ ایدهٔ سازه: رادیه، دوازده ستون، هستهٔ برشی، رایزرها، حفره و دیوار حائل گودال‌باغچه'
  } : {
    mat: 'raft (mat foundation) ≈ −3.5', core: 'shear core — stair and lift', shear: 'shear wall', riser: 'risers', voidL: 'void',
    garden: ['retaining wall,', 'separate from the mat'], shoring: 'shoring along the neighbour', gap: 'seismic gap ≥ 8 cm each side',
    living: 'opening in the fourth-floor slab ≈ 41 m²', street: 'street (north)', yard: 'yard (south)', north: 'N', idea: 'the family’s idea — not a drawing',
    aria: 'Structural idea plan: raft, twelve columns, shear core, risers, the void and the sunken garden’s retaining wall'
  };

  K.renderStructure = function (host, G = S_) {
    if (!host) return;
    const plan = K.plans && K.plans['next-basement'];
    if (plan) { G = Object.assign({}, G, plan.columns ? { columns: plan.columns } : {}); if (plan.grid && plan.grid.spine) G.spine = [plan.grid.spine[0], G.body[1], plan.grid.spine[1], G.body[3]]; }
    const S = 28, ML = 98, MR = 98, MT = 72, MB = 66;
    const w = G.plot.w, d = G.plot.d;
    const W = ML + w * S + MR, H = MT + d * S + MB;
    const X = m => ML + m * S, Y = m => MT + m * S;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('class', 'structure'); svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', L.aria);
    svg.setAttribute('style', 'width:100%;height:auto;display:block;background:#fff;font-family:inherit;direction:ltr;border:1px solid ' + RULE);
    host.innerHTML = ''; host.appendChild(svg);
    const el = (t, a = {}, p = svg) => { const n = document.createElementNS(NS, t); for (const k in a) n.setAttribute(k, a[k]); p.appendChild(n); return n; };
    const rect = (r, a, p) => el('rect', Object.assign({ x: X(r[0]), y: Y(r[1]), width: (r[2] - r[0]) * S, height: (r[3] - r[1]) * S }, a), p);
    const line = (x0, y0, x1, y1, a, p) => el('line', Object.assign({ x1: X(x0), y1: Y(y0), x2: X(x1), y2: Y(y1) }, a), p);
    const text = (x, y, s, a = {}, p) => { const t = el('text', Object.assign({ x: X(x), y: Y(y), fill: INK2, 'font-size': '10px' }, a), p); t.textContent = s; return t; };
    const vtext = (x, y, s, a = {}) => text(x, y, s, Object.assign({ 'text-anchor': 'middle', transform: `rotate(-90 ${X(x)} ${Y(y)})` }, a));
    const ring = (o, t, a) => el('path', Object.assign({ d: `M${X(o[0])} ${Y(o[1])} H${X(o[2])} V${Y(o[3])} H${X(o[0])} Z M${X(o[0] + t)} ${Y(o[1] + t)} H${X(o[2] - t)} V${Y(o[3] - t)} H${X(o[0] + t)} Z`, 'fill-rule': 'evenodd' }, a));

    // hatch for the foundation and the retaining wall
    const pid = 'st-hatch-' + Math.random().toString(36).slice(2, 8);
    const defs = el('defs'); const pat = el('pattern', { id: pid, patternUnits: 'userSpaceOnUse', width: 8, height: 8 }, defs);
    el('path', { d: 'M-1 1 L1 -1 M0 8 L8 0 M7 9 L9 7', stroke: EARTH, 'stroke-width': .7, opacity: .5, fill: 'none' }, pat);

    // frame: plot, yard, street and yard tags, party walls with the shoring line
    rect([0, 0, w, d], { fill: 'none', stroke: RULE, 'stroke-dasharray': '4 4' });
    rect(G.yard, { fill: YARD });
    text(w / 2, -1.25, L.street, { 'text-anchor': 'middle' });
    text(w / 2, d - 0.55, L.yard, { 'text-anchor': 'middle' });
    [0, w].forEach(x => line(x, G.body[1], x, G.body[3], { stroke: INK2, 'stroke-width': 1.6, 'stroke-dasharray': '7 4' }));
    vtext(-0.42, (G.body[1] + G.body[3]) / 2, L.shoring, { 'font-size': '9.5px' });
    vtext(w + 0.42, (G.body[1] + G.body[3]) / 2, L.shoring, { 'font-size': '9.5px' });
    // the mat, under the whole body
    rect(G.body, { fill: `url(#${pid})`, stroke: EARTH, 'stroke-width': 1.4, 'stroke-dasharray': '9 5' });
    text((G.body[0] + G.grid.x[1]) / 2, G.body[1] + 1.55, L.mat, { 'text-anchor': 'middle', fill: EARTH, 'font-size': '10.5px' });
    // grid letters and beams
    G.grid.letters.forEach(([c, x]) => text(x, -0.35, c, { 'text-anchor': 'middle', fill: EARTH, 'font-size': '9.5px', 'font-weight': '600' }));
    const beams = el('g', { opacity: .45 });
    G.grid.x.forEach(x => line(x, G.body[1], x, G.body[3], { stroke: EARTH, 'stroke-width': G.beam * S, 'stroke-linecap': 'square' }, beams));
    G.grid.y.forEach(y => line(G.body[0], y, G.body[2], y, { stroke: EARTH, 'stroke-width': G.beam * S, 'stroke-linecap': 'square' }, beams));
    // spans: A–B written on bay 1, C–D on the east bay
    const dim = (x0, x1, y, s) => { line(x0, y, x1, y, { stroke: EARTH, 'stroke-width': .8 }); [x0, x1].forEach(x => line(x, y - 0.18, x, y + 0.18, { stroke: EARTH, 'stroke-width': .8 })); text((x0 + x1) / 2, y - 0.22, s, { 'text-anchor': 'middle', fill: EARTH, 'font-size': '10.5px' }); };
    dim(G.grid.x[0], G.grid.x[1], 4.25, fd('7.10'));
    dim(G.spine[2], G.grid.x[2], 12.0, fd('2.25'));
    // the riser spine (B–C), the void, the fourth-floor opening
    rect(G.spine, { fill: TURQ, opacity: .22 });
    if (G.riser2) rect(G.riser2, { fill: TURQ, opacity: .45 });
    vtext((G.spine[0] + G.spine[2]) / 2, 11.7, L.riser, { fill: TURQ, 'font-size': '8.5px' });
    rect(G.voidRect, { fill: '#DDEFED', 'fill-opacity': .6, stroke: TURQ, 'stroke-width': 1.1, 'stroke-dasharray': '5 3' });
    text((G.voidRect[0] + G.voidRect[2]) / 2, (G.voidRect[1] + G.voidRect[3]) / 2 + 0.15, L.voidL, { 'text-anchor': 'middle', fill: TURQ, 'font-size': '10.5px' });
    rect(G.living, { fill: 'none', stroke: INK2, 'stroke-width': 1.1, 'stroke-dasharray': '6 4' });
    text((G.living[0] + G.living[2]) / 2, G.living[1] + 1.35, L.living, { 'text-anchor': 'middle', 'font-size': '9.5px' });
    // shear walls: the core tube and the two west segments
    ring(G.core, G.coreWall, { fill: INK });
    vtext((G.core[0] + G.core[2]) / 2, (G.core[1] + G.core[3]) / 2, L.core, { fill: INK, 'font-size': '9px' });
    G.shearWest.forEach(r => { rect(r, { fill: INK }); const cy = (r[1] + r[3]) / 2; line(-0.5, cy, r[0], cy, { stroke: INK2, 'stroke-width': .7 }); text(-0.6, cy + 0.14, L.shear, { 'text-anchor': 'end', 'font-size': '9.5px' }); });
    // columns
    const c = G.column / 2;
    G.columns.forEach(([x, y]) => rect([x - c, y - c, x + c, y + c], { fill: INK }));
    // the sunken garden: retaining wall as a hatched ring outside the mat, a tree, the label
    const g = G.garden, t = G.gardenWall;
    rect([g[0] + t, g[1] + t, g[2] - t, g[3] - t], { fill: '#CFE3C6' });
    ring(g, t, { fill: `url(#${pid})`, stroke: EARTH, 'stroke-width': 1.2 });
    const tcx = (g[0] + g[2]) / 2, tcy = g[3] - 1.55;
    [[0, 0, 1.05], [-0.5, -0.3, .65], [0.55, -0.2, .6], [0.1, 0.45, .55]].forEach(([dx, dy, r]) => el('circle', { cx: X(tcx + dx), cy: Y(tcy + dy), r: r * S, fill: LEAF, opacity: .36 }));
    el('circle', { cx: X(tcx), cy: Y(tcy), r: 0.12 * S, fill: EARTH });
    L.garden.forEach((s, i) => text(tcx, g[1] + t + 0.55 + i * 0.45, s, { 'text-anchor': 'middle', fill: EARTH, 'font-size': '9.5px' }));
    // corner note, north arrow, scale bar
    text(w, d + 1.55, L.gap, { 'text-anchor': 'end', 'font-size': '9.5px' });
    const na = el('g', { transform: `translate(${X(w) + 16} ${Y(0) + 10})` });
    el('path', { d: 'M0 -9 L5 6 L0 3 L-5 6 Z', fill: INK }, na);
    const nt = el('text', { x: 0, y: 18, 'text-anchor': 'middle', fill: INK2, 'font-size': '10px' }, na); nt.textContent = L.north;
    const sb = el('g', { transform: `translate(${X(0)} ${Y(d) + 18})` });
    el('line', { x1: 0, y1: 0, x2: 5 * S, y2: 0, stroke: INK2 }, sb);
    for (let i = 0; i <= 5; i++) el('line', { x1: i * S, y1: -3, x2: i * S, y2: 3, stroke: INK2 }, sb);
    const st = el('text', { x: 5 * S + 6, y: 4, fill: INK2, 'font-size': '10px' }, sb); st.textContent = fd(5) + ' m';
    // watermark
    const wx = X(5.25), wy = Y(8.6);   // across the middle bay, clear of the core, the columns and the opening's label
    const wm = el('text', { x: wx, y: wy, 'text-anchor': 'middle', fill: EARTH, opacity: .28, 'font-size': fa ? '22px' : '14px', 'font-weight': '700', transform: `rotate(-8 ${wx} ${wy})`, 'pointer-events': 'none' });
    wm.textContent = L.idea;
  };

  document.querySelectorAll('[data-structure]').forEach(h => K.renderStructure(h));
})();
