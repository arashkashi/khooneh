/* The layered north façade of the family's next design, in section: brick shabak on the 0.60 m projection line, an air gap,
   the deep window of a bedroom. Sketch, not a detail. Host: [data-facade]. */
(function () {
  const fa = document.documentElement.lang === 'fa';
  const fd = s => fa ? String(s).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]).replace('.', '٫') : String(s);
  document.querySelectorAll('[data-facade]').forEach(host => {
    const S = 64, W = 9.0, H = 4.4, OUT = 2.6;          // metres shown: street (left) 2.6, then the skin and 5.8 m of room
    const X = x => (x + OUT) * S, Y = y => (H - 0.3 - y) * S;   // x from the outer face of the shabak (projection line); y from the floor
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${W * S} ${H * S}`); svg.setAttribute('style', 'width:100%;height:auto;display:block;background:#fff;font-family:inherit;direction:ltr');
    const el = (t, a, p = svg) => { const n = document.createElementNS('http://www.w3.org/2000/svg', t); for (const k in a) n.setAttribute(k, a[k]); p.appendChild(n); return n; };
    const rect = (x0, y0, x1, y1, a) => el('rect', Object.assign({ x: X(x0), y: Y(y1), width: (x1 - x0) * S, height: (y1 - y0) * S }, a));
    const line = (x1, y1, x2, y2, a) => el('line', Object.assign({ x1: X(x1), y1: Y(y1), x2: X(x2), y2: Y(y2) }, a));
    const text = (x, y, s, a) => { const t = el('text', Object.assign({ x: X(x), y: Y(y), 'font-size': '10.5px', fill: '#161C1B' }, a)); t.textContent = s; return t; };
    const defs = el('defs'); const pat = el('pattern', { id: 'fc-hatch', patternUnits: 'userSpaceOnUse', width: 6, height: 6, patternTransform: 'rotate(45)' }, defs);
    el('line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: '#9C6B3C', 'stroke-width': 1, opacity: .5 }, pat);
    const slab = 3.2, gap = 0.6, wall = 0.3;
    // slabs (room floor and the floor above), the console of the slab above stops at the projection line
    rect(gap, -0.3, 6.4, 0, { fill: '#161C1B' }); rect(0, slab - 0.3, 6.4, slab, { fill: '#161C1B' });
    // outer skin: brick shabak (perforated) on the projection line, drawn as a column of bricks with gaps
    for (let y = 0; y < slab - 0.3; y += 0.25) { rect(0, y, 0.12, y + 0.14, { fill: '#9C6B3C', opacity: .85 }); }
    text(0.06, slab + 0.32, fa ? 'مشبک آجری' : 'brick shabak', { 'text-anchor': 'middle', fill: '#9C6B3C', 'font-size': '10px' });
    // air gap
    rect(0.12, 0, gap, slab - 0.3, { fill: 'url(#fc-hatch)', opacity: .6 });
    text(gap / 2 + 0.06, 1.6, fa ? `فاصلهٔ هوا ${fd('0.60')}` : `air gap ${fd('0.60')}`, { 'text-anchor': 'middle', fill: '#9C6B3C', 'font-size': '9.5px', transform: `rotate(-90 ${X(gap / 2 + 0.06)} ${Y(1.6)})` });
    // inner wall with a deep reveal and the window
    rect(gap, 0, gap + wall, 0.9, { fill: '#9C9C94' }); rect(gap, 2.4, gap + wall, slab - 0.3, { fill: '#9C9C94' });
    rect(gap + wall - 0.08, 0.9, gap + wall, 2.4, { fill: '#1D8F8A' });
    text(gap + wall + 0.15, 1.7, fa ? 'پنجرهٔ خواب، در کنج عمیق' : 'bedroom window in a deep reveal', { fill: '#1D8F8A', 'font-size': '10px' });
    // room
    text(4.2, slab - 0.6, fa ? 'اتاق‌خواب — هیچ نشیمنی رو به کوچه نیست' : 'bedroom — no living room faces the street', { 'text-anchor': 'middle', fill: '#5A6664' });
    // street side
    text(-1.3, 0.25, fa ? 'کوچه' : 'street', { 'text-anchor': 'middle', fill: '#5A6664' });
    line(0, -0.3, 0, slab + 0.15, { stroke: '#9C6B3C', 'stroke-width': .8, 'stroke-dasharray': '4 3' });
    text(-0.1, slab + 0.12, fa ? 'خط پیشروی ۰٫۶۰' : 'projection line 0.60', { 'text-anchor': 'end', fill: '#9C6B3C', 'font-size': '9.5px' });
    // what each layer does
    const notes = fa ? ['صدا: مشبک و فاصله، صدای بلوار را می‌شکنند', 'نگاه: از کوچه به درون دیده نمی‌شود، بی‌پرده', 'نور: از میان آجرها، تکه‌تکه و آرام'] : ['sound: the screen and the gap break the boulevard', 'eyes: not seen from the street, no curtains', 'light: through the bricks, broken and calm'];
    notes.forEach((t, i) => text(-2.5, 2.9 - i * 0.42, t, { fill: '#5A6664', 'font-size': '9.5px' }));
    // watermark
    const wm = el('text', { x: X(3.6), y: Y(1.2), 'text-anchor': 'middle', fill: '#9C6B3C', opacity: .22, 'font-size': '18px', 'font-weight': '700', transform: `rotate(-14 ${X(3.6)} ${Y(1.2)})` });
    wm.textContent = fa ? 'ایدهٔ خانواده — نه جزئیات' : 'the family’s idea — not a detail';
    host.appendChild(svg);
  });
})();
