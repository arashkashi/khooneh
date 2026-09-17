/* Hero: the 2020 section B-B, redrawn to scale from measured levels. */
(function () {
  const D = window.KHOONEH.attempt1;
  const host = document.getElementById('section-diagram');
  const caption = document.getElementById('section-caption');
  if (!host) return;

  const S = 26;                 // px per metre
  const TOP = 19.2, BOT = -7.2; // metres shown
  const ML = 14, MR = 118, MT = 10, MB = 26;
  const W = ML + D.plot.depth * S + MR;
  const H = MT + (TOP - BOT) * S + MB;
  const X = m => ML + m * S;
  const Y = e => MT + (TOP - e) * S;

  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    (parent || svg).appendChild(n);
    return n;
  };
  const rect = (x0, e0, x1, e1, attrs, parent) =>
    el('rect', Object.assign({ x: X(Math.min(x0, x1)), y: Y(Math.max(e0, e1)),
      width: Math.abs(x1 - x0) * S, height: Math.abs(e1 - e0) * S }, attrs), parent);
  const line = (x0, e0, x1, e1, attrs, parent) =>
    el('line', Object.assign({ x1: X(x0), y1: Y(e0), x2: X(x1), y2: Y(e1) }, attrs), parent);
  const text = (x, e, str, attrs, parent) => {
    const t = el('text', Object.assign({ x: X(x), y: Y(e) }, attrs), parent);
    t.textContent = str; return t;
  };

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('class', 'section'); svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Section through the 2020 design: basement with sunken courtyard and tree, parking, a double-height first floor with loft, two further floors and a roof garden. A dashed second basement marks what was never drawn.');
  host.appendChild(svg);

  const yard = D.yardDepth, south = yard, northGF = yard + D.bodyDepth, north = D.plot.depth;
  const slab = 0.3;

  // --- earth
  const earth = el('g', { class: 'earth' });
  rect(0, 0, north, BOT, {}, earth);                      // whole ground mass
  rect(0.3, 0, northGF, -3.12 - slab, { class: 'cut' }, earth); // basement excavation

  // --- ghost level −2 (never drawn)
  const ghost = el('g', { class: 'ghost' });
  rect(0.3, -3.12 - slab, northGF, -6.2 - slab, {}, ghost);
  text((0.3 + northGF) / 2, -4.9, 'level −2 — never drawn', { class: 'ghost-label', 'text-anchor': 'middle' }, ghost);

  // --- courtyard opening in the yard slab + tree
  const court0 = 1.2, court1 = 5.4;
  rect(0, 0, court0, -0.25, { class: 'slab' });
  rect(court1, 0, south, -0.25, { class: 'slab' });
  // green walls of the courtyard
  line(court0, 0, court0, -3.12, { class: 'green' });
  line(court1, 0, court1, -3.12, { class: 'green' });

  const tree = el('g', { class: 'tree' });
  line(3.3, -3.12, 3.3, 2.2, { class: 'trunk' }, tree);
  el('ellipse', { cx: X(3.3), cy: Y(3.6), rx: 2.3 * S, ry: 2.0 * S, class: 'canopy' }, tree);
  line(2.4, -3.12, 3.3, -2.4, { class: 'root' }, tree);
  line(4.2, -3.12, 3.3, -2.4, { class: 'root' }, tree);

  // --- basement: floor, hoz, walls
  rect(0.3, -3.12, northGF, -3.12 - slab, { class: 'slab' });
  rect(7.0, -3.12, 8.75, -2.6, { class: 'water' });
  text(7.9, -2.05, 'hoz', { class: 'tag', 'text-anchor': 'middle' });
  line(0.3, 0, 0.3, -3.12 - slab, { class: 'wall' });

  // --- ground floor slab (body only) + car + shabak
  rect(south, 0, northGF, -slab, { class: 'slab' });
  el('rect', { x: X(9.2), y: Y(1.45), width: 4.3 * S, height: 1.2 * S, rx: 10, class: 'car' });
  el('circle', { cx: X(10.1), cy: Y(0.25), r: 0.3 * S, class: 'car' });
  el('circle', { cx: X(12.6), cy: Y(0.25), r: 0.3 * S, class: 'car' });
  line(south, 0, south, 2.96, { class: 'shabak' });
  text(0.3, 0.55, 'yard', { class: 'tag' });
  text(northGF + 0.25, -0.75, 'street', { class: 'tag' });
  text(south - 0.25, 1.2, 'shabak', { class: 'tag', 'text-anchor': 'end' });

  // --- upper slabs
  rect(south, 2.96, north, 2.96 - slab, { class: 'slab' });
  rect(11.5, 6.08, north, 6.08 - slab, { class: 'slab' });
  rect(south, 8.88, north, 8.88 - slab, { class: 'slab' });
  rect(south, 12.58, north, 12.58 - slab, { class: 'slab' });
  rect(south, 16.28, north, 16.28 - slab, { class: 'slab' });
  rect(15.8, 17.88, 18.4, 17.88 - slab, { class: 'slab' });
  line(15.8, 16.28, 15.8, 17.88, { class: 'wall' });
  line(18.4, 16.28, 18.4, 17.88, { class: 'wall' });

  // walls
  line(south, -3.12, south, 16.28, { class: 'wall' });
  line(northGF, -3.12 - slab, northGF, 2.96, { class: 'wall' });
  line(north, 2.96 - slab, north, 16.28, { class: 'wall' });

  // --- the double-height void
  rect(south, 2.96, 11.5, 8.88 - slab, { class: 'void' });
  line(9.0, 2.96, 9.0, 8.88 - slab, { class: 'dim' });
  text(9.25, 5.9, '5.52', { class: 'dim-label' });

  // roof garden
  for (let x = south + 0.4; x < 15.4; x += 0.9) el('path', { d: `M${X(x)} ${Y(16.28)} q4 -9 8 0`, class: 'green' });

  // --- level ladder
  const ladder = el('g', { class: 'ladder' });
  const lab = e => (e > 0 ? '+' : e === 0 ? '±' : '−') + Math.abs(e).toFixed(2);
  D.levels.forEach(L => {
    line(L.ghost ? 0.3 : south, L.elev, north + 0.6, L.elev, { class: 'lead' + (L.ghost ? ' ghost-lead' : '') }, ladder);
    text(north + 0.8, L.elev + 0.12, L.ghost ? '−2 ?' : lab(L.elev), { class: 'lvl' }, ladder);
    text(north + 0.8, L.elev - 0.5, L.name.toLowerCase(), { class: 'lvl-name' }, ladder);
  });
  line(0, -6.9, north, -6.9, { class: 'dim' });
  text(north / 2, -7.35, `${D.plot.depth.toFixed(2)} m  ·  plot ${D.plot.width} × ${D.plot.depth}`, { class: 'dim-label', 'text-anchor': 'middle' });

  // --- hover / focus bands
  const bands = el('g', { class: 'bands' });
  const setCaption = L => {
    caption.innerHTML = `<strong>${L.name}</strong> <span>${lab(L.elev)}${L.clear ? ` · ${L.clear.toFixed(2)} m clear` : ''}</span><br>${L.note}`;
  };
  D.levels.forEach(L => {
    const top = L.elev + L.clear;
    const x0 = L.ghost ? 0.3 : L.elev < 2.9 ? (L.elev < 0 ? 0.3 : south) : south;
    const x1 = L.elev < 2.9 ? northGF : north;
    const g = el('g', { class: 'band', tabindex: 0, role: 'button', 'aria-label': `${L.name}: ${L.note}` }, bands);
    rect(x0, L.elev, x1, top, {}, g);
    const on = () => { bands.querySelectorAll('.band').forEach(b => b.classList.remove('is-active')); g.classList.add('is-active'); setCaption(L); };
    g.addEventListener('mouseenter', on); g.addEventListener('focus', on); g.addEventListener('click', on);
  });
  setCaption(D.levels[3]);
  bands.querySelectorAll('.band')[3].classList.add('is-active');
})();
