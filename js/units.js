/* Unit-interlock diagram: which unit occupies which part of each floor. Reusable: KHOONEH.renderUnits(host, legend, caption, dataset). */
(function () {
  const K = window.KHOONEH;
  const NS = 'http://www.w3.org/2000/svg';
  const T = (o, k) => K.T(o, k);

  K.renderUnits = function (host, legend, cap, D) {
    if (!host || !D) return;
    const W = 560, rowH = 44, gap = 6, labelW = 118, plateW = W - labelW - 10;
    const H = D.floors.length * (rowH + gap) + 30;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('class', 'units'); svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', T(D, 'aria') || '');
    host.innerHTML = ''; host.appendChild(svg);
    const mk = (t, a, p) => { const n = document.createElementNS(NS, t); for (const k in a) n.setAttribute(k, a[k]); (p || svg).appendChild(n); return n; };
    const ax = D.axis || {};
    const n = mk('text', { x: labelW + 4, y: 14, class: 'axis' }); n.textContent = T(ax, 'north') || '';
    const s = mk('text', { x: W - 10, y: 14, class: 'axis', 'text-anchor': 'end' }); s.textContent = T(ax, 'south') || '';
    D.floors.forEach((f, i) => {
      const y = 22 + i * (rowH + gap);
      const t = mk('text', { x: labelW - 8, y: y + rowH / 2 + 5, class: 'row-label', 'text-anchor': 'end' }); t.textContent = T(f, 'name');
      let x = labelW;
      f.segs.forEach(seg => {
        const [u, share, what, what_fa] = seg;
        const w = plateW * share; const U = D.units[u];
        const desc = K.lang === 'fa' && what_fa ? what_fa : what;
        const g = mk('g', { class: 'seg', 'data-u': u, tabindex: 0, role: 'button', 'aria-label': `${T(f, 'name')}, ${T(U, 'name')}: ${desc}` });
        mk('rect', { x, y, width: w - 2, height: rowH, fill: U.color }, g);
        if (w > 76) { const l = mk('text', { x: x + 8, y: y + rowH / 2 + 5, class: 'seg-label' }, g); l.textContent = T(U, 'name'); }
        const on = () => {
          svg.querySelectorAll('.seg').forEach(q => q.classList.toggle('dim', q.dataset.u !== u));
          if (cap) cap.innerHTML = `<strong>${T(U, 'name')}</strong>${U.area ? ` <span>${U.area} m²</span>` : ''} — ${T(f, 'name')}: ${desc}`;
        };
        g.addEventListener('mouseenter', on); g.addEventListener('focus', on); g.addEventListener('click', on);
        x += w;
      });
    });
    svg.addEventListener('mouseleave', () => svg.querySelectorAll('.seg').forEach(q => q.classList.remove('dim')));
    if (legend) legend.innerHTML = Object.entries(D.units).filter(([k, u]) => u.area).map(([k, u]) =>
      `<li><i style="background:${u.color}"></i>${T(u, 'name')} <span>${u.area} m²</span></li>`).join('');
    if (cap) cap.innerHTML = T(D, 'caption') || '';
  };

  document.querySelectorAll('[data-units]').forEach(h => {
    K.renderUnits(h, document.getElementById(h.dataset.legend), document.getElementById(h.dataset.caption), K[h.dataset.units]);
  });
  const h = document.getElementById('units-diagram');
  if (h && !h.dataset.units) K.renderUnits(h, document.getElementById('units-legend'), document.getElementById('units-caption'), K.attempt3);
})();
