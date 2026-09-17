/* Schematic floor plans, drawn from measured rooms (metres, north up). Same visual language as the section diagram.
   KHOONEH.renderPlan(host, plan, { focus: [ids/tags], caption, legend }) — focus highlights matching rooms/elements and zooms to them. */
(function () {
  const K = window.KHOONEH;
  const NS = 'http://www.w3.org/2000/svg';
  const T = (o, k) => K.T(o, k);
  const fa = K.lang === 'fa';
  const KIND_FA = { living: 'نشیمن', kitchen: 'آشپزخانه', dining: 'ناهارخوری', bedroom: 'خواب', bath: 'سرویس / حمام', study: 'کار', storage: 'انباری', service: 'تأسیسات', circulation: 'پله و آسانسور', outdoor: 'فضای باز', void: 'ووید', parking: 'پارکینگ', water: 'آب', green: 'سبز', caretaker: 'سرایدار', hall: 'هال' };
  const KIND_EN = { living: 'living', kitchen: 'kitchen', dining: 'dining', bedroom: 'bedroom', bath: 'bath', study: 'study', storage: 'storage', service: 'plant', circulation: 'stair & lift', outdoor: 'outdoor', void: 'void', parking: 'parking', water: 'water', green: 'green', caretaker: 'caretaker', hall: 'hall' };
  const faDigits = s => fa ? String(s).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]) : String(s);

  K.renderPlan = function (host, plan, opts = {}) {
    if (!host || !plan) return;
    const S = 24, M = 26, MR = 26, MT = 56, MB = 30;
    const w = plan.plot.w, d = plan.plot.d;
    const W = M + w * S + MR, H = MT + d * S + MB;
    const X = m => M + m * S, Y = m => MT + m * S;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'plan'); svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', (T(plan, 'name') || '') + (opts.focus ? ' — ' + (fa ? 'با تأکید بر بخش انتخاب‌شده' : 'with the selected part highlighted') : ''));
    host.innerHTML = ''; host.appendChild(svg);
    const el = (tag, attrs = {}, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); (parent || svg).appendChild(n); return n; };
    const rect = (r, attrs, parent) => el('rect', Object.assign({ x: X(r[0]), y: Y(r[1]), width: (r[2] - r[0]) * S, height: (r[3] - r[1]) * S }, attrs), parent);
    const text = (x, y, s, attrs, parent) => { const t = el('text', Object.assign({ x: X(x), y: Y(y) }, attrs), parent); t.textContent = s; return t; };
    const focus = new Set(opts.focus || []);
    const matches = o => focus.size && (focus.has(o.id) || (o.tags || []).some(t => focus.has(t)));

    // plot and yard
    rect([0, 0, w, d], { class: 'plot' });
    (plan.yard || []).forEach(r => rect(r, { class: 'yard' }));
    // footprint (walls)
    (plan.footprint || []).forEach(r => rect(r, { class: 'body' }));
    // rooms
    const focusBoxes = [];
    const rooms = el('g', { class: 'rooms' });
    (plan.rooms || []).forEach(r => {
      const g = el('g', { class: 'room kind-' + r.kind + (matches(r) ? ' is-focus' : focus.size ? ' is-dim' : ''), tabindex: 0, role: 'button' }, rooms);
      rect(r.m, { class: 'room-fill' }, g);
      const rw = (r.m[2] - r.m[0]), rh = (r.m[3] - r.m[1]);
      const area = (rw * rh).toFixed(1);
      const name = T(r, 'name') || KIND_FA[r.kind];
      const estW = name.length * 5.4 + 6;   // rough text width at 10.5px
      if (rw * S > estW && rh * S > 16) {
        text((r.m[0] + r.m[2]) / 2, (r.m[1] + r.m[3]) / 2 + 0.15, name, { class: 'room-label', 'text-anchor': 'middle' }, g);
        if (rw * S > 70 && rh * S > 34) text((r.m[0] + r.m[2]) / 2, (r.m[1] + r.m[3]) / 2 + 0.7, faDigits(area) + ' m²', { class: 'room-area', 'text-anchor': 'middle' }, g);
      } else if (rw * S > 26 && rh * S > 14 && r.short_fa) {
        text((r.m[0] + r.m[2]) / 2, (r.m[1] + r.m[3]) / 2 + 0.15, r.short_fa, { class: 'room-label', 'text-anchor': 'middle' }, g);
      }
      g.setAttribute('aria-label', `${name}, ${area} m²`);
      const on = () => { if (opts.caption) opts.caption.innerHTML = `<strong>${name}</strong> <span>${faDigits(area)} m² · ${faDigits(rw.toFixed(1))} × ${faDigits(rh.toFixed(1))}</span>${r.note ? '<br>' + (T(r, 'note') || '') : ''}`; };
      g.addEventListener('mouseenter', on); g.addEventListener('focus', on); g.addEventListener('click', on);
      if (matches(r)) focusBoxes.push(r.m);
    });
    // elements
    const els = el('g', { class: 'elements' });
    (plan.elements || []).forEach(e => {
      const m = e.m; const g = el('g', { class: 'elem elem-' + e.type + (matches(e) ? ' is-focus' : focus.size ? ' is-dim' : '') }, els);
      const cx = (m[0] + m[2]) / 2, cy = (m[1] + m[3]) / 2, ew = m[2] - m[0], eh = m[3] - m[1];
      if (e.type === 'stair') {
        rect(m, { class: 'stair' }, g);
        const n = Math.max(3, Math.round(Math.max(ew, eh) / 0.28));
        for (let i = 1; i < n; i++) {
          if (ew >= eh) el('line', { x1: X(m[0] + ew * i / n), y1: Y(m[1]), x2: X(m[0] + ew * i / n), y2: Y(m[3]), class: 'tread' }, g);
          else el('line', { x1: X(m[0]), y1: Y(m[1] + eh * i / n), x2: X(m[2]), y2: Y(m[1] + eh * i / n), class: 'tread' }, g);
        }
      } else if (e.type === 'lift') {
        rect(m, { class: 'lift' }, g);
        el('line', { x1: X(m[0]), y1: Y(m[1]), x2: X(m[2]), y2: Y(m[3]), class: 'tread' }, g); el('line', { x1: X(m[2]), y1: Y(m[1]), x2: X(m[0]), y2: Y(m[3]), class: 'tread' }, g);
      } else if (e.type === 'car') {
        el('rect', { x: X(m[0]) + 2, y: Y(m[1]) + 2, width: ew * S - 4, height: eh * S - 4, rx: 9, class: 'car-top' }, g);
        el('rect', { x: X(m[0]) + ew * S * 0.22, y: Y(m[1]) + eh * S * 0.18, width: ew * S * 0.56, height: eh * S * 0.64, rx: 6, class: 'car-roof' }, g);
      } else if (e.type === 'tree') {
        const r = Math.max(ew, eh) / 2;
        [[0, 0, r], [-r * 0.45, -r * 0.35, r * 0.62], [r * 0.5, -r * 0.2, r * 0.6], [0.1 * r, r * 0.45, r * 0.55]].forEach(([dx, dy, rr]) => el('circle', { cx: X(cx + dx), cy: Y(cy + dy), r: rr * S, class: 'canopy' }, g));
        el('circle', { cx: X(cx), cy: Y(cy), r: 0.12 * S, class: 'trunk-dot' }, g);
      } else if (e.type === 'void') rect(m, { class: 'void' }, g);
      else if (e.type === 'water') rect(m, { class: 'water' }, g);
      else if (e.type === 'green') rect(m, { class: 'green-bed' }, g);
      else if (e.type === 'balcony') rect(m, { class: 'balcony' }, g);
      else if (e.type === 'door') rect(m, { class: 'door' }, g);
      if (e.label_fa || e.label) {
        const lab = T(e, 'label');
        if (ew * S > 40) text(cx, cy + 0.15, lab, { class: 'elem-label', 'text-anchor': 'middle' }, g);
      }
      if (matches(e)) focusBoxes.push(m);
    });
    // north arrow, street / yard tags, scale bar
    const na = el('g', { class: 'north', transform: `translate(${X(w) + 14} ${Y(0) + 10})` });
    el('path', { d: 'M0 -9 L5 6 L0 3 L-5 6 Z', class: 'north-arrow' }, na);
    const nt = el('text', { x: 0, y: 18, class: 'tag', 'text-anchor': 'middle' }, na); nt.textContent = fa ? 'شمال' : 'N';
    const minY = Math.min(0, ...(plan.elements || []).map(e => e.m[1]), ...(plan.rooms || []).map(r => r.m[1]));
    text(w / 2, minY - 0.45, T(plan, 'street') || (fa ? 'کوچه (شمال)' : 'street (north)'), { class: 'tag', 'text-anchor': 'middle' });
    text(w / 2, d - 0.5, T(plan, 'yardLabel') || (fa ? 'حیاط (جنوب)' : 'yard (south)'), { class: 'tag', 'text-anchor': 'middle' });
    const sb = el('g', { class: 'scale', transform: `translate(${X(0)} ${Y(d) + 18})` });
    el('line', { x1: 0, y1: 0, x2: 5 * S, y2: 0, class: 'scale-line' }, sb);
    for (let i = 0; i <= 5; i++) el('line', { x1: i * S, y1: -3, x2: i * S, y2: 3, class: 'scale-line' }, sb);
    const st = el('text', { x: 5 * S + 6, y: 4, class: 'tag' }, sb); st.textContent = faDigits(5) + ' m';

    // viewBox: whole plan, or zoom to the focus
    let full = [0, 0, W, H];
    let vb = full;
    if (focusBoxes.length) {
      const x0 = Math.min(...focusBoxes.map(b => b[0])), y0 = Math.min(...focusBoxes.map(b => b[1]));
      const x1 = Math.max(...focusBoxes.map(b => b[2])), y1 = Math.max(...focusBoxes.map(b => b[3]));
      const pad = 1.6, bw = Math.max(x1 - x0 + 2 * pad, 6), bh = Math.max(y1 - y0 + 2 * pad, 5);
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      vb = [X(cx - bw / 2), Y(cy - bh / 2), bw * S, bh * S];
    }
    svg.setAttribute('viewBox', vb.join(' '));
    if (opts.toggle && focusBoxes.length) {
      let zoomed = true;
      opts.toggle.textContent = fa ? 'کل طبقه' : 'Whole floor';
      opts.toggle.hidden = false;
      opts.toggle.onclick = () => { zoomed = !zoomed; svg.setAttribute('viewBox', (zoomed ? vb : full).join(' ')); opts.toggle.textContent = zoomed ? (fa ? 'کل طبقه' : 'Whole floor') : (fa ? 'بخش انتخاب‌شده' : 'Selected part'); };
    }
    if (opts.caption && !opts.caption.innerHTML) {
      opts.caption.innerHTML = `<strong>${T(plan, 'name') || ''}</strong>${plan.elev != null ? ` <span>${(plan.elev > 0 ? '+' : plan.elev === 0 ? '±' : '−') + Math.abs(plan.elev).toFixed(2)}</span>` : ''}<br>${fa ? 'روی هر فضا بروید تا نام و متراژش دیده شود.' : 'Hover a room for its name and area.'}`;
    }
    if (opts.legend) {
      const kinds = [...new Set((plan.rooms || []).map(r => r.kind))];
      opts.legend.innerHTML = kinds.map(k => `<li><i class="kind-${k}"></i>${fa ? KIND_FA[k] : KIND_EN[k]}</li>`).join('');
    }
  };

  // auto-init: [data-plan] hosts, optional data-focus (comma list), data-caption, data-toggle, data-legend
  document.querySelectorAll('[data-plan]').forEach(h => {
    const plans = K.plans || {}; const plan = plans[h.dataset.plan]; if (!plan) return;
    const focus = h.dataset.focus ? h.dataset.focus.split(',').map(s => s.trim()).filter(Boolean) : null;
    K.renderPlan(h, plan, { focus, caption: document.getElementById(h.dataset.caption), toggle: document.getElementById(h.dataset.toggle), legend: document.getElementById(h.dataset.legend) });
  });
  // plan browser: tabs over several plans
  document.querySelectorAll('.plan-browser').forEach(b => {
    const ids = (b.dataset.plans || '').split(',').map(s => s.trim()).filter(id => (K.plans || {})[id]);
    if (!ids.length) return;
    const tabs = document.createElement('div'); tabs.className = 'plan-tabs'; tabs.setAttribute('role', 'tablist');
    const host = document.createElement('div'); host.className = 'plan-host';
    const cap = document.createElement('p'); cap.className = 'fig-note'; cap.setAttribute('aria-live', 'polite');
    const legend = document.createElement('ul'); legend.className = 'legend plan-legend';
    b.append(tabs, host, legend, cap);
    const show = id => {
      tabs.querySelectorAll('button').forEach(x => x.setAttribute('aria-selected', x.dataset.id === id));
      cap.innerHTML = ''; K.renderPlan(host, K.plans[id], { caption: cap, legend });
    };
    ids.forEach((id, i) => { const t = document.createElement('button'); t.type = 'button'; t.dataset.id = id; t.setAttribute('role', 'tab'); t.textContent = T(K.plans[id], 'name'); t.addEventListener('click', () => show(id)); tabs.appendChild(t); });
    show(ids[Math.min(ids.length - 1, b.dataset.start ? ids.indexOf(b.dataset.start) : ids.length > 2 ? 2 : 0)]);
  });
})();
