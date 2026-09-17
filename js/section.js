/* Section diagram, drawn to scale from measured levels. Reusable: KHOONEH.renderSection(host, caption, dataset). */
(function () {
  const K = window.KHOONEH;
  const NS = 'http://www.w3.org/2000/svg';
  const T = (o, k) => K.T(o, k);

  K.renderSection = function (host, caption, D) {
    if (!host || !D) return;
    const S = 26;
    const top = Math.max(...D.levels.map(l => l.elev + (l.clear || 0))) + 1.6;
    const bot = Math.min(...D.levels.map(l => l.elev)) - 1.0;
    const ML = 14, MR = 118, MT = 10, MB = 26;
    const W = ML + D.plot.depth * S + MR, H = MT + (top - bot) * S + MB;
    const X = m => ML + m * S, Y = e => MT + (top - e) * S;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('class', 'section'); svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', T(D, 'aria') || '');
    host.innerHTML = ''; host.appendChild(svg);
    const el = (tag, attrs = {}, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); (parent || svg).appendChild(n); return n; };
    const rect = (x0, e0, x1, e1, a, p) => el('rect', Object.assign({ x: X(Math.min(x0, x1)), y: Y(Math.max(e0, e1)), width: Math.abs(x1 - x0) * S, height: Math.abs(e1 - e0) * S }, a), p);
    const line = (x0, e0, x1, e1, a, p) => el('line', Object.assign({ x1: X(x0), y1: Y(e0), x2: X(x1), y2: Y(e1) }, a), p);
    const text = (x, e, s, a, p) => { const t = el('text', Object.assign({ x: X(x), y: Y(e) }, a), p); t.textContent = s; return t; };
    const tags = D.tags || {};
    const tag = k => T(tags, k) || '';
    const lab = e => (e > 0 ? '+' : e === 0 ? '±' : '−') + Math.abs(e).toFixed(2);

    const yard = D.yardDepth, south = yard, northGF = yard + D.bodyDepth, north = D.plot.depth, slab = 0.3;
    const basement = D.levels.filter(l => !l.ghost && l.elev < 0).sort((a, b) => a.elev - b.elev)[0];
    const bElev = basement ? basement.elev : -3.0;
    const ghosts = D.levels.filter(l => l.ghost);
    const upper = D.levels.filter(l => !l.ghost && l.elev > 0 && !l.loft);
    const lofts = D.levels.filter(l => l.loft);
    const roof = upper[upper.length - 1];

    // earth + excavation
    const earth = el('g', { class: 'earth' });
    rect(0, 0, north, bot, {}, earth);
    rect(0.3, 0, northGF, bElev - slab, { class: 'cut' }, earth);
    // ghost levels (never drawn)
    ghosts.forEach(g => {
      const gg = el('g', { class: 'ghost' });
      rect(0.3, g.elev + g.clear + slab, northGF, g.elev - slab, {}, gg);
      text((0.3 + northGF) / 2, g.elev + g.clear / 2 - 0.2, T(g, 'label') || tag('ghost'), { class: 'ghost-label', 'text-anchor': 'middle' }, gg);
    });
    // courtyard opening + tree
    if (D.courtyard !== false) {
      const c0 = 1.2, c1 = 5.4;
      rect(0, 0, c0, -0.25, { class: 'slab' }); rect(c1, 0, south, -0.25, { class: 'slab' });
      line(c0, 0, c0, bElev, { class: 'green' }); line(c1, 0, c1, bElev, { class: 'green' });
      const tree = el('g', { class: 'tree' });
      line(3.3, bElev, 3.3, 2.2, { class: 'trunk' }, tree);
      el('ellipse', { cx: X(3.3), cy: Y(3.6), rx: 2.3 * S, ry: 2.0 * S, class: 'canopy' }, tree);
      line(2.4, bElev, 3.3, bElev + 0.7, { class: 'root' }, tree); line(4.2, bElev, 3.3, bElev + 0.7, { class: 'root' }, tree);
    } else { rect(0, 0, south, -0.25, { class: 'slab' }); }
    // basement floor, hoz, walls
    rect(0.3, bElev, northGF, bElev - slab, { class: 'slab' });
    if (D.hoz !== false) { rect(7.0, bElev, 8.75, bElev + 0.52, { class: 'water' }); text(7.9, bElev + 1.07, tag('hoz'), { class: 'tag', 'text-anchor': 'middle' }); }
    line(0.3, 0, 0.3, bElev - slab, { class: 'wall' });
    // ground: slab, car, shabak, tags
    rect(south, 0, northGF, -slab, { class: 'slab' });
    el('rect', { x: X(9.2), y: Y(1.45), width: 4.3 * S, height: 1.2 * S, rx: 10, class: 'car' });
    el('circle', { cx: X(10.1), cy: Y(0.25), r: 0.3 * S, class: 'car' }); el('circle', { cx: X(12.6), cy: Y(0.25), r: 0.3 * S, class: 'car' });
    const f1 = upper[0];
    if (D.shabak !== false) { line(south, 0, south, f1.elev, { class: 'shabak' }); text(south - 0.25, 1.2, tag('shabak'), { class: 'tag', 'text-anchor': 'end' }); }
    text(0.3, 0.55, tag('yard'), { class: 'tag' }); text(northGF + 0.25, -0.75, tag('street'), { class: 'tag' });
    // upper slabs and walls
    upper.forEach(L => rect(south, L.elev, north, L.elev - slab, { class: 'slab' }));
    lofts.forEach(L => rect(L.from != null ? L.from : 11.5, L.elev, north, L.elev - slab, { class: 'slab' }));
    if (roof) {
      rect(15.8, roof.elev + 1.6, 18.4, roof.elev + 1.6 - slab, { class: 'slab' });
      line(15.8, roof.elev, 15.8, roof.elev + 1.6, { class: 'wall' }); line(18.4, roof.elev, 18.4, roof.elev + 1.6, { class: 'wall' });
      for (let x = south + 0.4; x < 15.4; x += 0.9) el('path', { d: `M${X(x)} ${Y(roof.elev)} q4 -9 8 0`, class: 'green' });
    }
    line(south, bElev, south, roof ? roof.elev : f1.elev, { class: 'wall' });
    line(northGF, bElev - slab, northGF, f1.elev, { class: 'wall' });
    line(north, f1.elev - slab, north, roof ? roof.elev : f1.elev, { class: 'wall' });
    // double-height voids
    D.levels.filter(l => l.double).forEach(L => {
      const next = upper.find(u => u.elev > L.elev);
      const x1 = L.voidTo != null ? L.voidTo : 11.5;
      rect(south, L.elev, x1, next.elev - slab, { class: 'void' });
      line(9.0, L.elev, 9.0, next.elev - slab, { class: 'dim' });
      text(9.25, (L.elev + next.elev) / 2, L.clear.toFixed(2), { class: 'dim-label' });
    });
    // level ladder
    const ladder = el('g', { class: 'ladder' });
    D.levels.forEach(L => {
      line(L.ghost || L.elev < 0 ? 0.3 : south, L.elev, north + 0.6, L.elev, { class: 'lead' }, ladder);
      text(north + 0.8, L.elev + 0.12, L.ghost ? (T(L, 'short') || '?') : lab(L.elev), { class: 'lvl' }, ladder);
      text(north + 0.8, L.elev - 0.5, T(L, 'name'), { class: 'lvl-name' }, ladder);
    });
    line(0, bot + 0.3, north, bot + 0.3, { class: 'dim' });
    text(north / 2, bot - 0.15, `${D.plot.depth.toFixed(2)} m · ${tag('plot')} ${D.plot.width} × ${D.plot.depth}`, { class: 'dim-label', 'text-anchor': 'middle' });
    // hover / focus bands
    const bands = el('g', { class: 'bands' });
    const setCaption = L => { if (caption) caption.innerHTML = `<strong>${T(L, 'name')}</strong> <span>${L.ghost ? '' : lab(L.elev)}${L.clear && !L.ghost ? ` · ${L.clear.toFixed(2)} ${tag('clear')}` : ''}</span><br>${T(L, 'note') || ''}`; };
    D.levels.forEach((L, i) => {
      const x0 = L.ghost || L.elev < 0 ? 0.3 : south, x1 = L.elev < f1.elev ? northGF : north;
      const g = el('g', { class: 'band', tabindex: 0, role: 'button', 'aria-label': `${T(L, 'name')}: ${T(L, 'note') || ''}` }, bands);
      rect(x0, L.elev, x1, L.elev + (L.clear || 2.8), {}, g);
      const on = () => { bands.querySelectorAll('.band').forEach(b => b.classList.remove('is-active')); g.classList.add('is-active'); setCaption(L); };
      g.addEventListener('mouseenter', on); g.addEventListener('focus', on); g.addEventListener('click', on);
      if (L.default) { g.classList.add('is-active'); setCaption(L); }
    });
    if (!D.levels.some(l => l.default)) { const i = D.levels.findIndex(l => l.double); const L = D.levels[i >= 0 ? i : 0]; bands.querySelectorAll('.band')[i >= 0 ? i : 0].classList.add('is-active'); setCaption(L); }
  };

  // auto-init: any [data-section] host, or the classic ids
  document.querySelectorAll('[data-section]').forEach(h => {
    const D = K[h.dataset.section]; const cap = document.getElementById(h.dataset.caption);
    K.renderSection(h, cap, D);
  });
  const h = document.getElementById('section-diagram');
  if (h && !h.dataset.section) K.renderSection(h, document.getElementById('section-caption'), K.attempt1);
})();
