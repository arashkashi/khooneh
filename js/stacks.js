/* Stacks: several floors of one design laid over one plan frame, with per-floor toggles and a caption. Same visual language as
   plan.js (metres, north up, self-styled). Two kinds:
   - 'wet' (default): the baths and kitchens, the plumbing shafts, and the distance from each wet room to the nearest shaft on its own floor.
   - 'stairs': the core stair, the lift and the private duplex stairs, coloured by role (not by floor), plus an area table per floor.
   KHOONEH.renderStacks(host, { attempt: 'a1', floors: ['a1-first', …], caption: element, kind: 'wet' | 'stairs', table: element })
     → { redraw, svg, table, totals }   (table and totals only in 'stairs' mode)
   Auto-init: [data-stacks="a1-first,a1-loft1,…"] with data-caption="<id>" (and optional data-attempt, data-stacks-kind="stairs",
   data-table="<id>" — without it the table is appended to the host). */
(function () {
  const K = window.KHOONEH; if (!K) return;
  const NS = 'http://www.w3.org/2000/svg';
  const T = (o, k) => K.T(o, k);
  const fa = K.lang === 'fa';
  const digits = s => fa ? String(s).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]).replace(/\./g, '٫') : String(s);
  const name = o => T(o, 'name') || o.name_en || o.name_fa || o.id;
  const shortName = n => n.replace(/\s*(۱۳۹۹|۱۴۰۳|19\d\d|20\d\d)$/, '').replace(/\u0654$/, '');   // «نیم‌طبقهٔ ۱۳۹۹» → «نیم‌طبقه» in lists
  const floorTag = p => shortName(name(p)).replace(/\s*(۱۳۹۹|۱۴۰۳|19\d\d|20\d\d)\s*(?=\()/, ' ');   // also «… ۱۴۰۳ (گزینه)» → «… (گزینه)»
  const TINTS = ['#1D8F8A', '#9C6B3C', '#4F7D4A', '#7A4E7E'];             // turquoise, earth, leaf, plum — one per floor (wet mode)
  const ROLE = { core: '#1D8F8A', lift: '#9C6B3C', private: '#7A4E7E', lobby: '#8E9794' };   // stairs mode: one per role
  const INK = '#161C1B', INK2 = '#5A6664', RULE = '#CFD5D2';
  const NUM = fa ? ['صفر', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه', 'ده'] : ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  const word = n => NUM[n] || digits(n);
  const W = {
    street: fa ? 'کوچه' : 'street', north: fa ? 'شمال' : 'N', yard: fa ? 'حیاط' : 'yard', lift: fa ? 'آسانسور' : 'lift', stair: fa ? 'پله' : 'stair',
    riser: fa ? 'رایزر پیوسته' : 'continuous riser', duct1: fa ? 'داکت یک‌طبقه' : 'one-storey duct', duct2: fa ? 'داکت دوطبقه' : 'two-storey duct',
    onRiser: fa ? 'روی رایزر' : 'on the riser', onDuct: fa ? 'روی داکت یک‌طبقه' : 'on the one-storey duct',
    near: d => fa ? `نزدیک داکت (${d} م)` : `near a duct (${d} m)`,
    far: d => fa ? `${d} متر تا نزدیک‌ترین داکت` : `${d} m to the nearest duct`,
    under: f => fa ? `زیرش (${f})` : `below it (${f})`, nothing: fa ? 'فضایی زیرش نیست' : 'nothing below it',
    on: fa ? 'روی' : 'on', onlyOn: fa ? 'فقط روی' : 'only on', notOn: fa ? 'نه در' : 'not on', m: fa ? 'م' : 'm',
    hint: fa ? 'با اشاره به هر فضای تر، فاصله‌اش تا داکت و فضای زیرش دیده می‌شود. طبقه‌ها را می‌توان خاموش کرد تا فضاهای زیرین دیده شوند.'
             : 'Hover or tap a wet room: its distance to a shaft and what lies under it appear here. Floors can be switched off to reach the rooms beneath.',
    summary: (n, m) => fa ? `از ${digits(n)} فضای تر روی این طبقات، ${digits(m)} تا بیش از ۱٫۵ متر از هر داکتی فاصله دارند.`
                          : `Of ${n} wet rooms on these floors, ${m} sit more than 1.5 m from any shaft.`,
    // stairs mode
    core: fa ? 'پلهٔ اصلی' : 'core stair', privates: fa ? 'پله‌های خصوصی' : 'private stairs', lobby: fa ? 'لابی و راهرو' : 'lobby / corridor',
    floor: fa ? 'طبقه' : 'floor', total: fa ? 'جمع' : 'total', areasIn: fa ? 'مساحت‌ها به مترمربع، از روی نقشه‌های بازترسیم‌شده' : 'Areas in m², from the redrawn plans',
    stairsHint: fa ? 'رنگ نقش را نشان می‌دهد، نه طبقه را؛ نام طبقه داخل هر پلهٔ خصوصی نوشته شده. پله و آسانسور مشترک در همهٔ طبقات تکرار می‌شوند و یک بار نام‌گذاری شده‌اند.'
                   : 'Colour marks the role, not the floor; the floor name sits inside each private stair. The shared stair and lift repeat on every floor and are labelled once.',
    stairsSummary: (total, nFloors, nUnits, spiral) => fa
      ? `${digits(total)} مترمربع از صفحه‌های ${word(nFloors)} طبقه صرف پله‌های خصوصی ${word(nUnits)} دوبلکس شده${spiral ? `؛ پلهٔ گرد به‌تنهایی ${digits(spiral)}` : ''}.`
      : `${total} m² of ${word(nFloors)} floor plates go to the private stairs of ${word(nUnits)} duplexes${spiral ? `; the spiral alone ${spiral}` : ''}.`,
    noPrivate: fa ? 'پلهٔ خصوصی‌ای جز پله و آسانسور مشترک در فهرست فضاهای این طبقه‌ها نیست.' : 'No private stair is listed among the rooms of these floors; only the shared stair and lift.'
  };
  let uid = 0;

  // edge-to-edge distance between two boxes [x0,y0,x1,y1], with the closest pair of points
  const nearest = (a, b) => {
    const ax = a[2] < b[0] ? a[2] : a[0] > b[2] ? a[0] : (Math.max(a[0], b[0]) + Math.min(a[2], b[2])) / 2;
    const bx = a[2] < b[0] ? b[0] : a[0] > b[2] ? b[2] : ax;
    const ay = a[3] < b[1] ? a[3] : a[1] > b[3] ? a[1] : (Math.max(a[1], b[1]) + Math.min(a[3], b[3])) / 2;
    const by = a[3] < b[1] ? b[1] : a[1] > b[3] ? b[3] : ay;
    return { ax, ay, bx, by, d: Math.hypot(bx - ax, by - ay) };
  };
  const overlap = (a, b) => Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
  const isWet = r => r.kind === 'bath' || r.kind === 'kitchen';
  const isShaft = r => r.kind === 'service' && /shaft/.test(r.id);
  // stairs mode: the role of a room, or null. 'stair' and 'lift' are the shared core; a-stair, b-stair, s-spiral… are the private duplex stairs;
  // the core's kin outside the plates (stair-yard, stair-house) count nowhere.
  const roleOf = r => /^stair-/.test(r.id) ? null : r.id === 'stair' ? 'core' : r.id === 'lift' ? 'lift' : /stair|spiral/.test(r.id) ? 'private' : r.kind === 'circulation' ? 'lobby' : null;
  // true polygon area (shoelace) when the room has one, else the rectangle
  const area = r => r.poly ? Math.abs(r.poly.reduce((s, [x, y], i, p) => { const [x2, y2] = p[(i + 1) % p.length]; return s + x * y2 - x2 * y; }, 0)) / 2
                           : (r.m[2] - r.m[0]) * (r.m[3] - r.m[1]);
  const round1 = v => Math.round(v * 10) / 10;

  K.renderStacks = function (host, opts = {}) {
    const plans = K.plans || {};
    const floors = (opts.floors || []).map(id => plans[id]).filter(Boolean);
    if (!host || !floors.length) return;
    const kind = opts.kind === 'stairs' ? 'stairs' : 'wet';
    const attempt = opts.attempt || floors[0].attempt || floors[0].id.split('-')[0];
    const order = Object.values(plans).filter(p => p.attempt === attempt).sort((a, b) => (a.elev || 0) - (b.elev || 0));   // every floor of the attempt, bottom up
    const caption = opts.caption || null;
    const plot = floors[0].plot, w = plot.w, d = plot.d;
    const S = 26, ML = 14, MR = 92, MT = 34, MB = 14;
    const VW = ML + w * S + MR, VH = MT + d * S + MB;
    const X = m => ML + m * S, Y = m => MT + m * S;
    const id = 'stacks-' + (++uid);

    // shafts across the whole attempt: which floors each shaft id reaches
    const shaftFloors = {};
    order.forEach(p => (p.rooms || []).filter(isShaft).forEach(s => { (shaftFloors[s.id] = shaftFloors[s.id] || []).push(p); }));
    const shaftKind = sid => { const n = shaftFloors[sid].length; return n >= 3 ? 'riser' : n === 2 ? 'duct2' : 'duct1'; };

    // what lies under a room: the nearest lower floor with rooms overlapping it (≥ 0.6 m² and ≥ 10 % of the room), largest first
    const under = (plan, r) => {
      const ra = (r.m[2] - r.m[0]) * (r.m[3] - r.m[1]);
      for (let j = order.indexOf(plan) - 1; j >= 0; j--) {
        const hits = (order[j].rooms || []).map(o => ({ o, a: overlap(r.m, o.m) })).filter(h => h.a >= 0.6 && h.a >= 0.1 * ra).sort((p, q) => q.a - p.a).slice(0, 3);
        if (hits.length) return { plan: order[j], rooms: hits.map(h => h.o) };
      }
      return null;
    };

    // shell: toggles (doubling as legend in wet mode), svg, caption
    host.innerHTML = '';
    host.classList.add('stacks');
    const toggles = document.createElement('div');
    toggles.className = 'stacks-toggles';
    toggles.setAttribute('style', 'display:flex;flex-wrap:wrap;gap:.35rem 1rem;font-size:.92rem;margin:0 0 .5rem');
    const active = new Set(floors.map(p => p.id));
    floors.forEach((p, i) => {
      const lab = document.createElement('label');
      lab.setAttribute('style', 'display:inline-flex;align-items:center;gap:.4rem;cursor:pointer');
      const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = true; cb.value = p.id;
      cb.addEventListener('change', () => { cb.checked ? active.add(p.id) : active.delete(p.id); draw(); });
      if (kind === 'wet') {
        const sw = document.createElement('i');
        sw.setAttribute('style', `display:inline-block;width:.85em;height:.85em;border-radius:2px;background:${TINTS[i % TINTS.length]};opacity:.55;border:1px solid ${TINTS[i % TINTS.length]}`);
        lab.append(cb, sw, document.createTextNode(name(p)));
      } else lab.append(cb, document.createTextNode(name(p)));
      toggles.appendChild(lab);
    });
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'plan stacks-svg'); svg.setAttribute('role', 'img');
    svg.setAttribute('viewBox', `0 0 ${VW} ${VH}`);
    svg.setAttribute('style', 'width:100%;height:auto;display:block;background:#fff;direction:ltr;font-family:inherit');
    svg.setAttribute('aria-label', kind === 'stairs' ? (fa ? 'پله‌ها و آسانسور طبقات روی هم، به تفکیک نقش' : 'Stairs and lift of the floors stacked, by role')
                                                     : (fa ? 'فضاهای تر طبقات روی هم و فاصله‌شان تا داکت' : 'Wet rooms of the floors stacked, with their distance to the shafts'));
    host.append(toggles, svg);
    // stairs mode: a role legend under the toggles
    if (kind === 'stairs') {
      const leg = document.createElement('div');
      leg.className = 'stacks-legend';
      leg.setAttribute('style', 'display:flex;flex-wrap:wrap;gap:.3rem 1.1rem;font-size:.88rem;color:' + INK2 + ';margin:-.15rem 0 .5rem');
      const item = (label, style) => { const s = document.createElement('span'); s.setAttribute('style', 'display:inline-flex;align-items:center;gap:.4rem'); const i = document.createElement('i'); i.setAttribute('style', 'display:inline-block;width:.85em;height:.85em;border-radius:2px;' + style); s.append(i, document.createTextNode(label)); return s; };
      leg.append(item(W.core, `background:${ROLE.core};opacity:.5;border:1px solid ${ROLE.core}`),
                 item(W.lift, `background:${ROLE.lift};opacity:.5;border:1px solid ${ROLE.lift}`),
                 item(W.privates, `background:repeating-linear-gradient(135deg,${ROLE.private} 0 1px,transparent 1px 4px);border:1px solid ${ROLE.private}`),
                 item(W.lobby, `background:#F4F4F1;border:1px dashed ${ROLE.lobby}`));
      host.insertBefore(leg, svg);
    }

    const el = (tag, attrs = {}, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); (parent || svg).appendChild(n); return n; };
    const rect = (r, attrs, parent) => el('rect', Object.assign({ x: X(r[0]), y: Y(r[1]), width: (r[2] - r[0]) * S, height: (r[3] - r[1]) * S }, attrs), parent);
    const shape = (r, attrs, parent) => r.poly ? el('polygon', Object.assign({ points: r.poly.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ') }, attrs), parent) : rect(r.m, attrs, parent);
    const text = (x, y, s, attrs, parent) => { const t = el('text', Object.assign({ x: X(x), y: Y(y) }, attrs), parent); t.textContent = s; return t; };
    const est = (s, px) => s.length * px * 0.62 + 6;   // rough text width (Persian glyphs are wide)
    const fmt = v => digits(v.toFixed(1));
    const setCaption = html => { if (caption) caption.innerHTML = html; };

    let placed = [];   // label boxes in px, for a greedy anti-overlap pass
    const collide = (b, pad = 1) => placed.some(p => b[0] < p[2] + pad && b[2] > p[0] - pad && b[1] < p[3] + pad && b[3] > p[1] - pad);
    // place a centred label near (x, y) in metres, nudging vertically (then sideways) until it is clear of other labels and inside the plot
    const place = (x, y, s, px, attrs, parent) => {
      const tw = est(s, px), th = px * 1.1;
      const tries = [0, 0.4, -0.4, 0.8, -0.8, 1.2, -1.2, 1.6, -1.6];
      for (const dx of [0, 0.6, -0.6, 1.2, -1.2]) for (const dy of tries) {
        const cx = X(x + dx), cy = Y(y + dy);
        const b = [cx - tw / 2, cy - th * 0.75, cx + tw / 2, cy + th * 0.35];
        if (b[0] < X(0) - 2 || b[2] > X(w) + MR - 4 || b[1] < Y(0) - 4 || b[3] > Y(d) + 2) continue;
        if (collide(b)) continue;
        placed.push(b);
        return text(x + dx, y + dy, s, Object.assign({ 'text-anchor': 'middle' }, attrs), parent);
      }
      placed.push([X(x) - tw / 2, Y(y) - th * 0.75, X(x) + tw / 2, Y(y) + th * 0.35]);
      return text(x, y, s, Object.assign({ 'text-anchor': 'middle' }, attrs), parent);
    };

    // ---- stairs mode: per-floor areas by role, the table and the sentence (over all floors passed, independent of the toggles)
    let table = null, totals = null, rowEls = {}, summary = '';
    if (kind === 'stairs') {
      const rows = floors.map(p => {
        const row = { plan: p, core: 0, lift: 0, private: 0, lobby: 0, spiral: 0, privates: [] };
        (p.rooms || []).forEach(r => { const role = roleOf(r); if (!role) return; const a = area(r); row[role] += a; if (role === 'private') { row.privates.push(r); if (/spiral/.test(r.id)) row.spiral += a; } });
        return row;
      });
      totals = { core: 0, lift: 0, private: 0, lobby: 0, spiral: 0, rows };
      rows.forEach(r => ['core', 'lift', 'private', 'lobby', 'spiral'].forEach(k => { totals[k] += r[k]; }));
      // a private stair takes floor area on the plate it stands on and an opening in the plate above
      const touched = new Set();
      rows.forEach((r, i) => { if (r.privates.length) { touched.add(i); if (i + 1 < rows.length) touched.add(i + 1); } });
      const units = new Set(); rows.forEach(r => r.privates.forEach(s => units.add(s.id)));
      totals.floorsTouched = touched.size; totals.units = units.size;
      summary = totals.private > 0.05 ? W.stairsSummary(round1(totals.private), touched.size, units.size, totals.spiral > 0.05 ? round1(totals.spiral) : 0) : W.noPrivate;

      // the table: rows = floors, columns = roles, a footer of totals
      const cell = v => v > 0.05 ? fmt(v) : '—';
      const wrap = document.createElement('div'); wrap.className = 'table-wrap';
      table = document.createElement('table'); table.className = 'stacks-table';
      table.setAttribute('style', 'font-size:.92rem;margin:.8rem 0 .4rem');
      const cap = document.createElement('caption'); cap.setAttribute('style', 'text-align:start;color:' + INK2 + ';font-size:.88rem;padding:0 0 .35rem'); cap.textContent = W.areasIn;
      const thead = document.createElement('thead'), tbody = document.createElement('tbody'), tfoot = document.createElement('tfoot');
      const tr = (cells, parent, head) => {
        const row = document.createElement('tr');
        cells.forEach((c, i) => { const td = document.createElement(head || i === 0 ? 'th' : 'td'); if (i === 0 && !head) td.setAttribute('scope', 'row'); if (i === 0) td.setAttribute('style', 'color:' + INK2 + ';font-weight:500'); else td.setAttribute('style', 'white-space:nowrap'); td.textContent = c; row.appendChild(td); });
        parent.appendChild(row); return row;
      };
      tr([W.floor, W.core, W.lift, W.privates, W.lobby], thead, true);
      rows.forEach(r => { rowEls[r.plan.id] = tr([floorTag(r.plan), cell(r.core), cell(r.lift), cell(r.private), cell(r.lobby)], tbody); });
      const foot = tr([W.total, cell(totals.core), cell(totals.lift), cell(totals.private), cell(totals.lobby)], tfoot);
      foot.setAttribute('style', 'font-weight:500'); foot.firstChild.setAttribute('style', 'color:' + INK + ';font-weight:500');
      table.append(cap, thead, tbody, tfoot);
      const target = opts.table || (host.dataset && host.dataset.table ? document.getElementById(host.dataset.table) : null);
      if (target) { target.innerHTML = ''; target.appendChild(table); } else { wrap.appendChild(table); host.appendChild(wrap); }
    }

    function draw() {
      svg.innerHTML = ''; placed = [];
      const sel = floors.filter(p => active.has(p.id));
      const defs = el('defs');
      const gLabels = el('g', { class: 'labels', style: 'pointer-events:none' });   // re-appended last: labels sit above rooms and shafts
      const pat = el('pattern', { id: id + '-yard', patternUnits: 'userSpaceOnUse', width: 7, height: 7 }, defs);
      el('path', { d: 'M-1 1 L1 -1 M0 7 L7 0 M6 8 L8 6', stroke: RULE, 'stroke-width': .7, fill: 'none' }, pat);

      // frame: plot, yard, street edge, footprint of the lowest selected floor, lift and stair as orientation (wet mode; in stairs mode they are the subject)
      rect([0, 0, w, d], { fill: 'none', stroke: RULE, 'stroke-dasharray': '4 4' });
      (floors[0].yard || []).forEach(r => rect(r, { fill: `url(#${id}-yard)`, stroke: 'none' }));
      const yardR = (floors[0].yard || [])[0];
      if (yardR) text(w / 2, (yardR[1] + yardR[3]) / 2 + 0.15, W.yard, { 'text-anchor': 'middle', fill: INK2, 'font-size': '10.5px' });
      el('line', { x1: X(0), y1: Y(0), x2: X(w), y2: Y(0), stroke: INK2, 'stroke-width': 1.4 });
      text(w / 2, -0.35, W.street, { 'text-anchor': 'middle', fill: INK2, 'font-size': '10.5px' });
      const base = sel[0] || floors[0];
      (base.footprint || []).forEach(r => rect(r, { fill: 'none', stroke: RULE, 'stroke-width': 1.2 }));
      if (kind === 'wet') (base.elements || []).filter(e => e.type === 'lift' || e.type === 'stair').forEach(e => {
        rect(e.m, { fill: '#F4F4F1', stroke: RULE, 'stroke-width': .8 });
        text((e.m[0] + e.m[2]) / 2, (e.m[1] + e.m[3]) / 2 + 0.15, W[e.type], { 'text-anchor': 'middle', fill: '#9AA3A0', 'font-size': '8.5px' });
      });
      const na = el('g', { transform: `translate(${X(w) + 16} ${Y(0) + 4})` });
      el('path', { d: 'M0 -9 L5 6 L0 3 L-5 6 Z', fill: INK }, na);
      const nt = el('text', { x: 0, y: 18, 'text-anchor': 'middle', fill: INK2, 'font-size': '10px' }, na); nt.textContent = W.north;

      if (kind === 'stairs') drawStairs(sel, defs, gLabels); else drawWet(sel, gLabels);

      // scale bar
      const sb = el('g', { transform: `translate(${X(0)} ${Y(d) + 9})` });
      el('line', { x1: 0, y1: 0, x2: 5 * S, y2: 0, stroke: INK2 }, sb);
      for (let k = 0; k <= 5; k++) el('line', { x1: k * S, y1: -3, x2: k * S, y2: 3, stroke: INK2 }, sb);
      const st = el('text', { x: 5 * S + 6, y: 3.5, fill: INK2, 'font-size': '9.5px' }, sb); st.textContent = digits(5) + ' m';

      svg.appendChild(gLabels);
      if (kind === 'stairs') {
        Object.keys(rowEls).forEach(pid => { rowEls[pid].style.opacity = active.has(pid) ? '' : '.4'; });
        setCaption(`${summary}<br><span>${W.stairsHint}</span>`);
      }
    }

    // ---- wet mode: wet rooms per floor, leaders to the nearest shaft, shaft boxes
    function drawWet(sel, gLabels) {
      // wet rooms per floor (bottom floor first, later floors on top)
      const wetAll = [], leaders = [];
      let offCount = 0;
      const gRooms = el('g', { class: 'wet-rooms' });
      sel.forEach(p => {
        const i = floors.indexOf(p), tint = TINTS[i % TINTS.length];
        const shafts = (p.rooms || []).filter(isShaft);
        (p.rooms || []).filter(isWet).forEach(r => {
          const best = shafts.map(s => Object.assign({ s }, nearest(r.m, s.m))).sort((a, b) => a.d - b.d)[0];
          const g = el('g', { class: 'wet', tabindex: 0, role: 'button', style: 'cursor:pointer' }, gRooms);
          shape(r, { fill: tint, 'fill-opacity': .35, stroke: tint, 'stroke-width': 1 }, g);
          const rw = r.m[2] - r.m[0], rh = r.m[3] - r.m[1], cx = (r.m[0] + r.m[2]) / 2, cy = (r.m[1] + r.m[3]) / 2;
          const full = name(r), short = (fa && r.short_fa) || (full.includes(' — ') ? full.split(' — ').pop() : full);
          const label = rw * S > est(full, 11) ? full : short;
          place(cx, cy + 0.12, label, 11, { fill: tint, 'font-size': '11px', style: 'paint-order:stroke;stroke:#fff;stroke-width:2.5px;stroke-linejoin:round' }, gLabels);
          // caption text
          const u = under(p, r);
          let where;
          if (!best) where = fa ? 'داکتی روی این طبقه نیست' : 'no shaft on this floor';
          else if (best.d <= 0.5) where = shaftKind(best.s.id) === 'riser' ? W.onRiser : shaftKind(best.s.id) === 'duct1' ? W.onDuct : (fa ? 'روی داکت دوطبقه' : 'on the two-storey duct');
          else if (best.d <= 1.5) where = W.near(fmt(best.d));
          else { where = W.far(fmt(best.d)); offCount++; }
          const underTxt = u ? `${W.under(shortName(name(u.plan)))}: ${u.rooms.map(o => name(o)).join(fa ? '، ' : ', ')}` : W.nothing;
          const html = `<strong>${shortName(name(p))} — ${full}</strong> <span>${digits(rw.toFixed(1))} × ${digits(rh.toFixed(1))}</span><br>${where}${fa ? '؛ ' : '; '}${underTxt}`;
          const on = () => setCaption(html);
          g.addEventListener('mouseenter', on); g.addEventListener('focus', on); g.addEventListener('click', on);
          g.setAttribute('aria-label', `${shortName(name(p))} — ${full}: ${where}; ${underTxt}`);
          wetAll.push(r);
          if (best && best.d > 1.5) leaders.push({ best, tint, i });
        });
      });

      // leaders: a thin dashed line from the room edge to the nearest shaft edge, with the distance
      const gLead = el('g', { class: 'leaders' });
      leaders.forEach(({ best, tint, i }) => {
        const n = floors.length, off = 0.12 * (i - (n - 1) / 2);            // a small perpendicular offset so stacked leaders stay readable
        const dx = best.bx - best.ax, dy = best.by - best.ay, len = Math.hypot(dx, dy) || 1;
        const px = -dy / len * off, py = dx / len * off;
        el('line', { x1: X(best.ax + px), y1: Y(best.ay + py), x2: X(best.bx + px), y2: Y(best.by + py), stroke: tint, 'stroke-width': .9, 'stroke-dasharray': '3 3' }, gLead);
        const s = `${fmt(best.d)} ${W.m}`, tw = est(s, 10), th = 11;
        // slide along the leader (then just beside it) until the label is clear; last resort: mid-line, even if crowded — never off its line
        const spots = [];
        for (const side of [-4, 9, -13]) for (const t of [0.5, 0.38, 0.62, 0.26, 0.74, 0.15, 0.85]) spots.push([t, side]);
        spots.push([0.5, -4]);
        for (let k = 0; k < spots.length; k++) {
          const [t, side] = spots[k];
          const cx = X(best.ax + px + dx * t), cy = Y(best.ay + py + dy * t) + side;
          const b = [cx - tw / 2, cy - th * 0.75, cx + tw / 2, cy + th * 0.35];
          if (collide(b) && k < spots.length - 1) continue;
          placed.push(b); el('text', { x: cx, y: cy, 'text-anchor': 'middle', fill: tint, 'font-size': '10px', style: 'paint-order:stroke;stroke:#fff;stroke-width:3px;stroke-linejoin:round' }, gLabels).textContent = s; break;
        }
      });

      // shafts: union box per shaft id over the selected floors; the continuous riser heavy, the dead-end duct dashed
      const gShaft = el('g', { class: 'shafts' });
      const boxes = {};
      sel.forEach(p => (p.rooms || []).filter(isShaft).forEach(s => {
        const b = boxes[s.id] || (boxes[s.id] = [s.m[0], s.m[1], s.m[2], s.m[3]]);
        b[0] = Math.min(b[0], s.m[0]); b[1] = Math.min(b[1], s.m[1]); b[2] = Math.max(b[2], s.m[2]); b[3] = Math.max(b[3], s.m[3]);
      }));
      Object.keys(boxes).forEach(sid => {
        const b = boxes[sid], kind = shaftKind(sid);
        const g = el('g', { class: 'shaft shaft-' + kind, tabindex: 0, role: 'button', style: 'cursor:pointer' }, gShaft);
        if (kind === 'riser') rect(b, { fill: INK, stroke: INK, 'stroke-width': 3 }, g);
        else rect(b, { fill: '#B9BFBC', stroke: INK, 'stroke-width': 1.2, 'stroke-dasharray': '3 2' }, g);
        const label = W[kind];
        const cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2;
        if (b[2] > w - 2.6) {   // near the east edge: label in the margin, with a short lead
          el('line', { x1: X(b[2]), y1: Y(cy), x2: X(w) + 6, y2: Y(cy), stroke: INK, 'stroke-width': .8 }, g);
          const t = el('text', { x: X(w) + 8, y: Y(cy) + 3.5, fill: INK, 'font-size': '10.5px' }, gLabels); t.textContent = label;
          placed.push([X(w) + 8, Y(cy) - 8, X(w) + 8 + est(label, 10.5), Y(cy) + 4]);
        } else {
          place(cx, b[1] - 0.25, label, 10.5, { fill: INK, 'font-size': '10.5px', style: 'paint-order:stroke;stroke:#fff;stroke-width:3px;stroke-linejoin:round' }, gLabels);
        }
        const onF = shaftFloors[sid], off = order.filter(p => !onF.includes(p));
        const list = ps => ps.map(p => shortName(name(p))).join(fa ? '، ' : ', ');
        const reach = off.length > onF.length ? `${W.onlyOn} ${list(onF)}` : `${W.on} ${list(onF)}${off.length ? (fa ? '؛ ' : '; ') + W.notOn + ' ' + list(off) : ''}`;
        const html = `<strong>${label}</strong> <span>${digits((b[2] - b[0]).toFixed(1))} × ${digits((b[3] - b[1]).toFixed(1))}</span><br>${reach}`;
        const on = () => setCaption(html);
        g.addEventListener('mouseenter', on); g.addEventListener('focus', on); g.addEventListener('click', on);
        g.setAttribute('aria-label', `${label}: ${reach}`);
      });

      setCaption(`${sel.length ? W.summary(wetAll.length, offCount) : (fa ? 'هیچ طبقه‌ای انتخاب نشده.' : 'No floor selected.')}<br><span>${W.hint}</span>`);
    }

    // ---- stairs mode: lobbies faint, the core stair and lift as one tint each (repeating on every floor, labelled once),
    //      the private stairs hatched in plum with the floor name and area inside; stairs sharing a slot are inset and dashed so both read
    function drawStairs(sel, defs, gLabels) {
      const hatch = el('pattern', { id: id + '-hatch', patternUnits: 'userSpaceOnUse', width: 6, height: 6 }, defs);
      el('path', { d: 'M-1 1 L1 -1 M0 6 L6 0 M5 7 L7 5', stroke: ROLE.private, 'stroke-width': .9, fill: 'none', opacity: .8 }, hatch);
      const m2 = a => `${fmt(a)} m²`;
      const bbox = r => r.poly ? r.poly.reduce((b, [x, y]) => [Math.min(b[0], x), Math.min(b[1], y), Math.max(b[2], x), Math.max(b[3], y)], [Infinity, Infinity, -Infinity, -Infinity]) : r.m.slice();
      const LBL = { style: 'paint-order:stroke;stroke:#fff;stroke-width:2.5px;stroke-linejoin:round' };
      const hover = (g, html) => { const on = () => setCaption(html); g.addEventListener('mouseenter', on); g.addEventListener('focus', on); g.addEventListener('click', on); };
      // the shape inset by i metres: a rectangle shrinks; a polygon is scaled about its box centre (close enough for these small L-shapes)
      const inset = (r, i, attrs, parent) => {
        if (!r.poly) return rect([r.m[0] + i, r.m[1] + i, r.m[2] - i, r.m[3] - i], attrs, parent);
        const b = bbox(r), cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2, kx = (b[2] - b[0] - 2 * i) / (b[2] - b[0]), ky = (b[3] - b[1] - 2 * i) / (b[3] - b[1]);
        return el('polygon', Object.assign({ points: r.poly.map(([x, y]) => `${X(cx + (x - cx) * kx)},${Y(cy + (y - cy) * ky)}`).join(' ') }, attrs), parent);
      };

      const gLobby = el('g', { class: 'lobbies' }), gCore = el('g', { class: 'core' }), gPriv = el('g', { class: 'private-stairs' });
      const union = { core: null, lift: null }, areas = { core: [], lift: [] };
      const drawnPriv = [];   // { b, depth, a, slot } per private stair on the frame: the inset depth of overlapping ones, and the slot (union box) they share, for the labels
      sel.forEach(p => {
        (p.rooms || []).forEach(r => {
          const role = roleOf(r); if (!role) return;
          const a = area(r);
          if (role === 'lobby') { shape(r, { fill: '#F4F4F1', 'fill-opacity': .8, stroke: ROLE.lobby, 'stroke-width': .7, 'stroke-dasharray': '2 2' }, gLobby); return; }
          if (role === 'core' || role === 'lift') {
            const g = el('g', { class: role, tabindex: 0, role: 'button', style: 'cursor:pointer' }, gCore);
            shape(r, { fill: ROLE[role], 'fill-opacity': .14, stroke: ROLE[role], 'stroke-width': .9 }, g);
            const b = bbox(r), u = union[role];
            union[role] = u ? [Math.min(u[0], b[0]), Math.min(u[1], b[1]), Math.max(u[2], b[2]), Math.max(u[3], b[3])] : b;
            areas[role].push(a);
            hover(g, `<strong>${floorTag(p)} — ${name(r)}</strong> <span>${m2(a)}</span>`);
            g.setAttribute('aria-label', `${floorTag(p)} — ${name(r)}: ${m2(a)}`);
            return;
          }
          // private stair: depth = one more than the deepest stair it overlaps by a third or more of the smaller box; such stairs share a slot
          const b = bbox(r);
          let depth = 0, slot = null;
          drawnPriv.forEach(o => { if (overlap(b, o.b) >= 0.33 * Math.min(o.a, a)) { depth = Math.max(depth, o.depth + 1); slot = slot || o.slot; } });
          if (slot) { slot[0] = Math.min(slot[0], b[0]); slot[1] = Math.min(slot[1], b[1]); slot[2] = Math.max(slot[2], b[2]); slot[3] = Math.max(slot[3], b[3]); } else slot = b.slice();
          drawnPriv.push({ b, depth, a, slot });
          const g = el('g', { class: 'private', tabindex: 0, role: 'button', style: 'cursor:pointer' }, gPriv);
          const i = 0.12 * depth;
          inset(r, i, { fill: `url(#${id}-hatch)`, stroke: ROLE.private, 'stroke-width': depth ? 1 : 1.1, 'stroke-dasharray': depth ? '4 2.5' : 'none' }, g);
          inset(r, i, { fill: ROLE.private, 'fill-opacity': .07, stroke: 'none' }, g);
          hover(g, `<strong>${floorTag(p)} — ${name(r)}</strong> <span>${m2(a)}</span>`);
          g.setAttribute('aria-label', `${floorTag(p)} — ${name(r)}: ${m2(a)}`);
          labelPrivate(slot, floorTag(p), m2(a), gLabels);
        });
      });
      // the core stair and the lift once, at the centre of their union over the selected floors: the name and the area (a range when the floors differ)
      ['core', 'lift'].forEach(role => {
        const u = union[role]; if (!u) return;
        const as = areas[role], lo = Math.min(...as), hi = Math.max(...as);
        const s = hi - lo < 0.05 ? m2(lo) : `${fmt(lo)}–${fmt(hi)} m²`;
        const cx = (u[0] + u[2]) / 2, cy = (u[1] + u[3]) / 2;
        place(cx, cy - 0.12, role === 'core' ? W.core : W.lift, 10.5, Object.assign({ fill: ROLE[role], 'font-size': '10.5px' }, LBL), gLabels);
        place(cx, cy + 0.4, s, 9.5, Object.assign({ fill: ROLE[role], 'font-size': '9.5px' }, LBL), gLabels);
      });
      svg.append(gLobby, gCore, gPriv);

      // the floor name (small) and the area inside a private stair, on one line; a narrow tall stair takes it rotated along its length,
      // and stairs sharing a slot take their lines side by side (b: the slot box in metres)
      function labelPrivate(b, s1, s2, parent) {
        const bw = (b[2] - b[0]) * S, bh = (b[3] - b[1]) * S, cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2;
        const tw = est(s1 + ' — ' + s2, 9.2);
        const attrs = Object.assign({ fill: ROLE.private, 'font-size': '9.5px', 'text-anchor': 'middle', style: LBL.style + (fa ? ';direction:rtl;unicode-bidi:isolate' : '') });
        const fill = t => { const a = el('tspan', { 'font-size': '8.5px' }, t); a.textContent = s1 + ' — '; const c = el('tspan', {}, t); c.textContent = s2; return t; };
        if (tw > bw - 4 && bh > tw + 4) {
          const box = [X(b[0]), Y(b[1]), X(b[2]), Y(b[3])];
          for (const pad of [3, 30]) for (const dy of [0, 14, -14, 28, -28, 42, -42]) for (const dx of [0, 11, -11, 22, -22]) {
            const x0 = X(cx) + dx, y0 = Y(cy) + dy;
            const bb = [x0 - 5.5, y0 - tw / 2 - 2, x0 + 5.5, y0 + tw / 2 + 2];
            if (bb[0] < box[0] - pad || bb[2] > box[2] + pad || bb[1] < box[1] - pad || bb[3] > box[3] + pad) continue;
            if (collide(bb)) continue;
            placed.push(bb);
            fill(el('text', Object.assign({ x: x0, y: y0 + 3.5, transform: `rotate(-90 ${x0} ${y0})` }, attrs), parent));
            return;
          }
        }
        const t = place(cx, cy + 0.12, s1 + ' — ' + s2, 9.2, attrs, parent);   // place() measures the whole line; the tspans then carry it
        t.textContent = ''; fill(t);
      }
    }

    draw();
    return kind === 'stairs' ? { redraw: draw, svg, table, totals } : { redraw: draw, svg };
  };

  document.querySelectorAll('[data-stacks]').forEach(h => {
    const floors = h.dataset.stacks.split(',').map(s => s.trim()).filter(Boolean);
    K.renderStacks(h, { attempt: h.dataset.attempt, floors, kind: h.dataset.stacksKind, caption: h.dataset.caption ? document.getElementById(h.dataset.caption) : null,
                        table: h.dataset.table ? document.getElementById(h.dataset.table) : null });
  });
})();
