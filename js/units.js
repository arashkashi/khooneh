/* 2024: how four units interlock across six levels (areas from the sheets). */
(function () {
  const D = window.KHOONEH.attempt3;
  const host = document.getElementById('units-diagram');
  const legend = document.getElementById('units-legend');
  const cap = document.getElementById('units-caption');
  if (!host) return;
  const NS = 'http://www.w3.org/2000/svg';
  const W = 560, rowH = 44, gap = 6, labelW = 110, plateW = W - labelW - 10;
  const H = D.floors.length * (rowH + gap) + 30;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('class', 'units'); svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Stack of seven levels showing which unit occupies the north and south halves of each floor. Three of the four units span two floors.');
  host.appendChild(svg);
  const mk = (t, a, p) => { const n = document.createElementNS(NS, t); for (const k in a) n.setAttribute(k, a[k]); (p || svg).appendChild(n); return n; };
  const north = mk('text', { x: labelW + 4, y: 14, class: 'axis' }); north.textContent = 'street (north)';
  const south = mk('text', { x: W - 10, y: 14, class: 'axis', 'text-anchor': 'end' }); south.textContent = 'yard (south)';

  const groups = {};
  D.floors.forEach((f, i) => {
    const y = 22 + i * (rowH + gap);
    const t = mk('text', { x: labelW - 8, y: y + rowH / 2 + 5, class: 'row-label', 'text-anchor': 'end' }); t.textContent = f.name;
    let x = labelW;
    f.segs.forEach(([u, share, what]) => {
      const w = plateW * share;
      const g = mk('g', { class: 'seg', 'data-u': u, tabindex: 0, role: 'button', 'aria-label': `${f.name}, ${D.units[u].name}: ${what}` });
      mk('rect', { x, y, width: w - 2, height: rowH, fill: D.units[u].color }, g);
      if (w > 70) { const l = mk('text', { x: x + 8, y: y + rowH / 2 + 5, class: 'seg-label' }, g); l.textContent = D.units[u].name; }
      (groups[u] = groups[u] || []).push(g);
      const on = () => {
        svg.querySelectorAll('.seg').forEach(s => s.classList.toggle('dim', s.dataset.u !== u));
        const U = D.units[u];
        cap.innerHTML = `<strong>${U.name}</strong>${U.area ? ` <span>${U.area} m²</span>` : ''} — ${f.name}: ${what}`;
      };
      g.addEventListener('mouseenter', on); g.addEventListener('focus', on); g.addEventListener('click', on);
      x += w;
    });
  });
  svg.addEventListener('mouseleave', () => svg.querySelectorAll('.seg').forEach(s => s.classList.remove('dim')));
  legend.innerHTML = Object.entries(D.units).filter(([k]) => k !== 'p' && k !== 'c').map(([k, u]) =>
    `<li><i style="background:${u.color}"></i>${u.name}${u.area ? ` <span>${u.area} m²</span>` : ''}</li>`).join('');
  cap.innerHTML = 'Hover or tap a plate. Three of the four units span two floors; the second floor needs no lift access, so the same plans work whether the street is zoned for three floors or four.';
})();
