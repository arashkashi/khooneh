/* Sun and shade at Qazvin's latitude (36.3° N): a south window under the 1.20 m console of the floor above.
   Section, drawn to scale; sun altitudes at solar noon: summer solstice 90−36.3+23.44 ≈ 77°, equinox ≈ 54°, winter ≈ 30°. */
(function () {
  const fa = document.documentElement.lang === 'fa';
  const LAT = 36.3, ALT = { summer: 90 - LAT + 23.44, equinox: 90 - LAT, winter: 90 - LAT - 23.44 };
  const fd = s => fa ? String(s).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]).replace('.', '٫') : String(s);
  document.querySelectorAll('[data-shade]').forEach(host => {
    const S = 58;                       // px per metre
    const W = 9.2, H = 4.6;             // metres shown: 6 m of room + 3.2 m outside; 0.3 below floor to 4.3 above
    const OUT = 3.2;                    // metres of yard shown left of the façade
    const X = x => (x + OUT) * S, Y = y => (H - 0.3 - y) * S;   // x from the façade line inward (yard to the left, room to the right); y from the floor
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${W * S} ${H * S}`); svg.setAttribute('style', 'width:100%;height:auto;display:block;background:#fff;font-family:inherit;direction:ltr');
    const el = (t, a, p = svg) => { const n = document.createElementNS('http://www.w3.org/2000/svg', t); for (const k in a) n.setAttribute(k, a[k]); p.appendChild(n); return n; };
    const line = (x1, y1, x2, y2, a) => el('line', Object.assign({ x1: X(x1), y1: Y(y1), x2: X(x2), y2: Y(y2) }, a));
    const rect = (x0, y0, x1, y1, a) => el('rect', Object.assign({ x: Math.min(X(x0), X(x1)), y: Y(y1), width: Math.abs(X(x1) - X(x0)), height: (y1 - y0) * S }, a));
    const text = (x, y, s, a) => { const t = el('text', Object.assign({ x: X(x), y: Y(y), 'font-size': '11px', fill: '#161C1B' }, a)); t.textContent = s; return t; };
    // geometry (metres): façade at x = 0, room toward +x, outside toward −x
    const sill = 0.3, top = 2.7, slab = 3.2, consoleDepth = 1.2, consoleTh = 0.3;
    rect(0, -0.3, 6.0, 0, { fill: '#161C1B' });                       // floor slab
    rect(0, slab - consoleTh, 6.0, slab, { fill: '#161C1B' });        // slab above (room)
    rect(-consoleDepth, slab - consoleTh, 0, slab, { fill: '#161C1B' }); // the console of the floor above
    rect(0, sill, 0.12, top, { fill: '#1D8F8A' });                     // the window
    rect(0, 0, 0.25, sill, { fill: '#9C9C94' }); rect(0, top, 0.25, slab - consoleTh, { fill: '#9C9C94' });
    text(5.4, slab - 0.55, fa ? 'اتاق' : 'room', { 'text-anchor': 'middle', fill: '#5A6664' });
    text(-1.9, 0.25, fa ? 'حیاط' : 'yard', { 'text-anchor': 'middle', fill: '#5A6664' });
    text(-0.6, slab + 0.25, fa ? 'کنسول ۱٫۲۰' : 'console 1.20', { 'text-anchor': 'middle', fill: '#5A6664', 'font-size': '10px' });
    // sun rays through the console tip
    const tip = [-consoleDepth, slab - consoleTh];
    const rays = [['summer', '#C9772E', fa ? 'ظهر تیر' : 'summer noon'], ['equinox', '#9C6B3C', fa ? 'اعتدال' : 'equinox'], ['winter', '#4F7D4A', fa ? 'ظهر دی' : 'winter noon']];
    rays.forEach(([k, col, label], i) => {
      const a = ALT[k] * Math.PI / 180, t = Math.tan(a);
      const dxDown = tip[1] / t;                      // horizontal run from the tip to the floor
      const xFloor = Math.min(tip[0] + dxDown, 6.0);
      const yAtWall = tip[1] - (0 - tip[0]) * t;      // height where the ray crosses the façade plane
      const dx0 = Math.min(1.9, (H - 0.6 - tip[1]) / t); const x0 = tip[0] - dx0, y0 = tip[1] + dx0 * t;
      line(x0, y0, xFloor, Math.max(0, tip[1] - (xFloor - tip[0]) * t), { stroke: col, 'stroke-width': 1.6, 'stroke-dasharray': k === 'summer' ? '' : '5 4' });
      const lit0 = sill, lit1 = Math.max(sill, Math.min(top, yAtWall));
      if (lit1 > lit0) rect(0.12, lit0, 0.42, lit1, { fill: col, opacity: .28 });
      const pct = Math.round(100 * (top - lit1) / (top - sill));
      // legend line + result, stacked inside the room so nothing collides
      const ly = 2.35 - i * 0.42;
      line(fa ? 5.4 : 3.3, ly, fa ? 6.0 : 3.9, ly, { stroke: col, 'stroke-width': 1.6, 'stroke-dasharray': k === 'summer' ? '' : '5 4' });
      const into = xFloor > 0 ? (fa ? ` · آفتاب تا ${fd(xFloor.toFixed(1))} م درون اتاق` : ` · sun ${xFloor.toFixed(1)} m into the room`) : (fa ? ' · آفتاب به پنجره نمی‌رسد' : ' · no sun on the window');
      text(fa ? 5.3 : 4.0, ly + 0.12, `${label} ${fd(Math.round(ALT[k]))}° — ${fa ? 'پنجره ' + fd(pct) + '٪ در سایه' : 'window ' + pct + '% shaded'}${into}`, { fill: col, 'font-size': '10px', 'text-anchor': fa ? 'end' : 'start' });
    });
    // scale
    line(0, -0.55, 2, -0.55, { stroke: '#5A6664' }); [0, 1, 2].forEach(i => line(i, -0.62, i, -0.48, { stroke: '#5A6664' }));
    text(2.15, -0.5, fd(2) + ' m', { fill: '#5A6664', 'font-size': '10px', 'text-anchor': 'start' });
    text(3.4, H - 0.75, fa ? 'عرض جغرافیایی ۳۶٫۳° شمالی؛ زاویه‌های ظهر خورشیدی' : 'latitude 36.3° N; solar-noon altitudes', { fill: '#5A6664', 'font-size': '9.5px', 'text-anchor': 'middle' });
    host.appendChild(svg);
  });
})();
