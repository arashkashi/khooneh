/* Wet-room stacks: the baths and kitchens of several floors laid over one plan frame, the plumbing shafts, and the distance
   from each wet room to the nearest shaft on its own floor. Same visual language as plan.js (metres, north up, self-styled).
   KHOONEH.renderStacks(host, { attempt: 'a1', floors: ['a1-first', …], caption: element }) → { redraw, svg }.
   Auto-init: [data-stacks="a1-first,a1-loft1,…"] with data-caption="<id>" (and optional data-attempt). */
(function () {
  const K = window.KHOONEH; if (!K) return;
  const NS = 'http://www.w3.org/2000/svg';
  const T = (o, k) => K.T(o, k);
  const fa = K.lang === 'fa';
  const digits = s => fa ? String(s).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]).replace(/\./g, '٫') : String(s);
  const name = o => T(o, 'name') || o.name_en || o.name_fa || o.id;
  const shortName = n => n.replace(/\s*(۱۳۹۹|۱۴۰۳|19\d\d|20\d\d)$/, '').replace(/\u0654$/, '');   // «نیم‌طبقهٔ ۱۳۹۹» → «نیم‌طبقه» in lists
  const TINTS = ['#1D8F8A', '#9C6B3C', '#4F7D4A', '#7A4E7E'];             // turquoise, earth, leaf, plum — one per floor
  const INK = '#161C1B', INK2 = '#5A6664', RULE = '#CFD5D2';
  const W = {
    street: fa ? 'کوچه' : 'street', north: fa ? 'شمال' : 'N', yard: fa ? 'حیاط' : 'yard', lift: fa ? 'آسانسور' : 'lift', stair: fa ? 'پله' : 'stair',
    riser: fa ? 'رایزر پیوسته' : 'continuous riser', duct1: fa ? 'داکت یک‌طبقه' : 'one-storey duct', duct2: fa ? 'داکت دوطبقه' : 'two-storey duct',
    onRiser: fa ? 'روی رایزر' : 'on the riser', onDuct: fa ? 'روی داکت یک‌طبقه' : 'on the one-storey duct',
    near: d => fa ? `نزدیک داکت (${d} م)` : `near a duct (${d} m)`,
    far: d => fa ? `${d} متر تا نزدیک‌ترین داکت` : `${d} m to the nearest duct`,
    under: f => fa ? `زیرش (${f})` : `below it (${f})`, nothing: fa ? 'فضایی زیرش نیست' : 'nothing below it',
    on: fa ? 'روی' : 'on', onlyOn: fa ? 'فقط روی' : 'only on', notOn: fa ? 'نه در' : 'not on', m: fa ? 'م' : 'm',
    hint: fa ? 'روی هر فضای تر بروید یا لمسش کنید: فاصله‌اش تا داکت و فضای زیرش دیده می‌شود. طبقه‌ها را می‌توان خاموش کرد تا فضاهای زیرین دیده شوند.'
             : 'Hover or tap a wet room: its distance to a shaft and what lies under it appear here. Floors can be switched off to reach the rooms beneath.',
    summary: (n, m) => fa ? `از ${digits(n)} فضای تر روی این طبقات، ${digits(m)} تا بیش از ۱٫۵ متر از هر داکتی فاصله دارند.`
                          : `Of ${n} wet rooms on these floors, ${m} sit more than 1.5 m from any shaft.`
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

  K.renderStacks = function (host, opts = {}) {
    const plans = K.plans || {};
    const floors = (opts.floors || []).map(id => plans[id]).filter(Boolean);
    if (!host || !floors.length) return;
    const attempt = opts.attempt || floors[0].attempt || floors[0].id.split('-')[0];
    const order = Object.values(plans).filter(p => p.attempt === attempt).sort((a, b) => a.elev - b.elev);   // every floor of the attempt, bottom up
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
      const area = (r.m[2] - r.m[0]) * (r.m[3] - r.m[1]);
      for (let j = order.indexOf(plan) - 1; j >= 0; j--) {
        const hits = (order[j].rooms || []).map(o => ({ o, a: overlap(r.m, o.m) })).filter(h => h.a >= 0.6 && h.a >= 0.1 * area).sort((p, q) => q.a - p.a).slice(0, 3);
        if (hits.length) return { plan: order[j], rooms: hits.map(h => h.o) };
      }
      return null;
    };

    // shell: toggles (doubling as legend), svg, caption
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
      const sw = document.createElement('i');
      sw.setAttribute('style', `display:inline-block;width:.85em;height:.85em;border-radius:2px;background:${TINTS[i % TINTS.length]};opacity:.55;border:1px solid ${TINTS[i % TINTS.length]}`);
      cb.addEventListener('change', () => { cb.checked ? active.add(p.id) : active.delete(p.id); draw(); });
      lab.append(cb, sw, document.createTextNode(name(p)));
      toggles.appendChild(lab);
    });
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'plan stacks-svg'); svg.setAttribute('role', 'img');
    svg.setAttribute('viewBox', `0 0 ${VW} ${VH}`);
    svg.setAttribute('style', 'width:100%;height:auto;display:block;background:#fff;direction:ltr;font-family:inherit');
    svg.setAttribute('aria-label', fa ? 'فضاهای تر طبقات روی هم و فاصله‌شان تا داکت' : 'Wet rooms of the floors stacked, with their distance to the shafts');
    host.append(toggles, svg);

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

    function draw() {
      svg.innerHTML = ''; placed = [];
      const sel = floors.filter(p => active.has(p.id));
      const defs = el('defs');
      const gLabels = el('g', { class: 'labels', style: 'pointer-events:none' });   // re-appended last: labels sit above rooms and shafts
      const pat = el('pattern', { id: id + '-yard', patternUnits: 'userSpaceOnUse', width: 7, height: 7 }, defs);
      el('path', { d: 'M-1 1 L1 -1 M0 7 L7 0 M6 8 L8 6', stroke: RULE, 'stroke-width': .7, fill: 'none' }, pat);

      // frame: plot, yard, street edge, footprint of the lowest selected floor, lift and stair as orientation
      rect([0, 0, w, d], { fill: 'none', stroke: RULE, 'stroke-dasharray': '4 4' });
      (floors[0].yard || []).forEach(r => rect(r, { fill: `url(#${id}-yard)`, stroke: 'none' }));
      const yardR = (floors[0].yard || [])[0];
      if (yardR) text(w / 2, (yardR[1] + yardR[3]) / 2 + 0.15, W.yard, { 'text-anchor': 'middle', fill: INK2, 'font-size': '10.5px' });
      el('line', { x1: X(0), y1: Y(0), x2: X(w), y2: Y(0), stroke: INK2, 'stroke-width': 1.4 });
      text(w / 2, -0.35, W.street, { 'text-anchor': 'middle', fill: INK2, 'font-size': '10.5px' });
      const base = sel[0] || floors[0];
      (base.footprint || []).forEach(r => rect(r, { fill: 'none', stroke: RULE, 'stroke-width': 1.2 }));
      (base.elements || []).filter(e => e.type === 'lift' || e.type === 'stair').forEach(e => {
        rect(e.m, { fill: '#F4F4F1', stroke: RULE, 'stroke-width': .8 });
        text((e.m[0] + e.m[2]) / 2, (e.m[1] + e.m[3]) / 2 + 0.15, W[e.type], { 'text-anchor': 'middle', fill: '#9AA3A0', 'font-size': '8.5px' });
      });
      const na = el('g', { transform: `translate(${X(w) + 16} ${Y(0) + 4})` });
      el('path', { d: 'M0 -9 L5 6 L0 3 L-5 6 Z', fill: INK }, na);
      const nt = el('text', { x: 0, y: 18, 'text-anchor': 'middle', fill: INK2, 'font-size': '10px' }, na); nt.textContent = W.north;

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

      // scale bar
      const sb = el('g', { transform: `translate(${X(0)} ${Y(d) + 9})` });
      el('line', { x1: 0, y1: 0, x2: 5 * S, y2: 0, stroke: INK2 }, sb);
      for (let k = 0; k <= 5; k++) el('line', { x1: k * S, y1: -3, x2: k * S, y2: 3, stroke: INK2 }, sb);
      const st = el('text', { x: 5 * S + 6, y: 3.5, fill: INK2, 'font-size': '9.5px' }, sb); st.textContent = digits(5) + ' m';

      svg.appendChild(gLabels);
      setCaption(`${W.summary(wetAll.length, offCount)}<br><span>${W.hint}</span>`);
    }
    draw();
    return { redraw: draw, svg };
  };

  document.querySelectorAll('[data-stacks]').forEach(h => {
    const floors = h.dataset.stacks.split(',').map(s => s.trim()).filter(Boolean);
    K.renderStacks(h, { attempt: h.dataset.attempt, floors, caption: h.dataset.caption ? document.getElementById(h.dataset.caption) : null });
  });
})();
