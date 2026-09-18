/* Section diagram, drawn to scale from measured levels. Reusable: KHOONEH.renderSection(host, caption, dataset).
   Optional dataset fields (defaults reproduce the 2020 drawing): idea (hatched slabs, dashed walls, watermark — an idea, not a drawing),
   basementFrom, courtyard [x0,x1] | false, treeX, stairHouse {span,height}, shaft {span,skylight}, risers [[x0,x1]], hozAt, carX,
   and per level voidClear (the height written in a double-height void when it differs from clear). */
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
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('class', D.idea ? 'section section-idea' : 'section'); svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', T(D, 'aria') || '');
    host.innerHTML = ''; host.appendChild(svg);
    const el = (tag, attrs = {}, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); (parent || svg).appendChild(n); return n; };
    const rect = (x0, e0, x1, e1, a, p) => el('rect', Object.assign({ x: X(Math.min(x0, x1)), y: Y(Math.max(e0, e1)), width: Math.abs(x1 - x0) * S, height: Math.abs(e1 - e0) * S }, a), p);
    const line = (x0, e0, x1, e1, a, p) => el('line', Object.assign({ x1: X(x0), y1: Y(e0), x2: X(x1), y2: Y(e1) }, a), p);
    const text = (x, e, s, a, p) => { const t = el('text', Object.assign({ x: X(x), y: Y(e) }, a), p); t.textContent = s; return t; };
    const tags = D.tags || {};
    const tag = k => T(tags, k) || '';
    const lab = e => (e > 0 ? '+' : e === 0 ? '±' : '−') + Math.abs(e).toFixed(2);
    // hatch patterns, made on first use (ghost idea floors; every slab when the whole dataset is an idea)
    let defs = null; const hatch = {};
    const hatchId = (kind = 'ghost') => {
      if (hatch[kind]) return hatch[kind];
      if (!defs) defs = el('defs');
      const id = 'hatch-' + Math.random().toString(36).slice(2, 8); hatch[kind] = id;
      const pat = el('pattern', { id, patternUnits: 'userSpaceOnUse', width: kind === 'slab' ? 5 : 8, height: kind === 'slab' ? 5 : 8 }, defs);
      if (kind === 'slab') el('path', { d: 'M-1 1 L1 -1 M0 5 L5 0 M4 6 L6 4', style: 'stroke:var(--ink, #161C1B);stroke-width:.9;opacity:.75;fill:none' }, pat);
      else el('path', { d: 'M-2 2 L2 -2 M0 8 L8 0 M6 10 L10 6', style: 'stroke:var(--ink-2, #5A6664);stroke-width:.6;opacity:.55;fill:none' }, pat);
      return id;
    };
    // idea datasets: slabs hatched with a dashed edge, walls dashed — the sketch must not pass for a measured drawing
    const SLAB = D.idea ? { class: 'slab', style: `fill:url(#${hatchId('slab')});stroke:var(--ink, #161C1B);stroke-width:.8;stroke-dasharray:4 3` } : { class: 'slab' };
    const WALL = D.idea ? { class: 'wall', style: 'stroke-dasharray:6 4' } : { class: 'wall' };

    // x runs from the yard end of the plot (0) to the street (plot depth). The upper floors always span south..north;
    // the GF/basement body sits either flush with the yard (console over the street, the default) or set back by the console (consoleSide 'yard').
    const yard = D.yardDepth, south = yard, north = D.plot.depth, slab = 0.3;
    const consoleYard = D.consoleSide === 'yard';
    const southGF = consoleYard ? north - D.bodyDepth : south, northGF = consoleYard ? north : yard + D.bodyDepth;
    const basement = D.levels.filter(l => !l.ghost && l.elev < 0).sort((a, b) => a.elev - b.elev)[0];
    const bElev = basement ? basement.elev : -3.0;
    const ghosts = D.levels.filter(l => l.ghost);
    const upper = D.levels.filter(l => !l.ghost && l.elev > 0 && !l.loft);
    const lofts = D.levels.filter(l => l.loft);
    // ghost levels with upper:true are ideas stacked on the drawn building (dashed, hatched); one of them may be the moved roof (roof:true)
    const ideaFloors = ghosts.filter(l => l.upper && !l.roof).sort((a, b) => a.elev - b.elev);
    const ideaRoof = ghosts.find(l => l.upper && l.roof);
    const roof = ideaRoof ? null : upper[upper.length - 1];                      // the drawn roof; none when an idea sits on top
    const wallTop = roof ? roof.elev : ideaFloors.length ? ideaFloors[0].elev : null;   // top of the solid walls
    const bs0 = D.basementFrom != null ? D.basementFrom : 0.3;                          // yard-side end of the basement (2020: under the whole plot)
    const [c0, c1] = Array.isArray(D.courtyard) ? D.courtyard : [1.2, 5.4];             // the sunken courtyard's span from the yard end
    const tx = D.treeX != null ? D.treeX - 3.3 : Array.isArray(D.courtyard) ? (c0 + c1) / 2 - 3.3 : 0;   // the tree is drawn around x 3.3; shift it with the courtyard
    const sh = D.stairHouse || {}; const sh0 = sh.span ? sh.span[0] : 15.8, sh1 = sh.span ? sh.span[1] : 18.4, shH = sh.height || 1.6;
    const shaft = D.shaft && D.shaft.span;

    // earth + excavation
    const earth = el('g', { class: 'earth' });
    rect(0, 0, north, bot, {}, earth);
    rect(bs0, 0, northGF, bElev - slab, { class: 'cut' }, earth);
    if (D.courtyard !== false && bs0 > c0) rect(c0, 0, c1, bElev, { class: 'cut' }, earth);   // a garden pit with its own walls, outside the basement
    // ghost levels (never drawn): below ground they fill the basement extents; ideas above the roof come after the solid floors
    ghosts.filter(g => !g.upper).forEach(g => {
      const gg = el('g', { class: 'ghost' });
      rect(bs0, g.elev + g.clear + slab, northGF, g.elev - slab, {}, gg);
      text((bs0 + northGF) / 2, g.elev + g.clear / 2 - 0.2, T(g, 'label') || tag('ghost'), { class: 'ghost-label', 'text-anchor': 'middle' }, gg);
    });
    // courtyard opening + tree
    if (D.courtyard !== false) {
      if (bs0 <= c0) { rect(0, 0, c0, -0.25, SLAB); rect(c1, 0, southGF, -0.25, SLAB); }   // yard slab over the basement
      else { for (let x = 0.4; x < southGF - 0.4; x += 0.9) if (x + 0.3 < c0 || x > c1 + 0.1) el('path', { d: `M${X(x)} ${Y(0)} q4 -9 8 0`, class: 'green' }); }   // a garden on the ground
      line(c0, 0, c0, bElev, { class: 'green' }); line(c1, 0, c1, bElev, { class: 'green' });
      const tree = el('g', { class: 'tree' });
      // a slightly leaning trunk with two branches, roots, and a soft three-lobed canopy
      el('path', { d: `M${X(3.3 + tx)} ${Y(bElev)} C ${X(3.35 + tx)} ${Y(bElev + 1.5)}, ${X(3.15 + tx)} ${Y(0.6)}, ${X(3.25 + tx)} ${Y(2.3)}`, class: 'trunk' }, tree);
      el('path', { d: `M${X(3.22 + tx)} ${Y(1.2)} C ${X(2.9 + tx)} ${Y(1.7)}, ${X(2.5 + tx)} ${Y(2.0)}, ${X(2.3 + tx)} ${Y(2.6)}`, class: 'branch' }, tree);
      el('path', { d: `M${X(3.24 + tx)} ${Y(1.7)} C ${X(3.7 + tx)} ${Y(2.2)}, ${X(4.0 + tx)} ${Y(2.4)}, ${X(4.3 + tx)} ${Y(2.9)}`, class: 'branch' }, tree);
      line(2.5 + tx, bElev, 3.3 + tx, bElev + 0.6, { class: 'root' }, tree); line(4.1 + tx, bElev, 3.3 + tx, bElev + 0.6, { class: 'root' }, tree);
      [[3.3, 3.9, 1.9], [2.2, 3.0, 1.25], [4.45, 3.15, 1.35], [3.1, 2.75, 1.2]].forEach(([cx, cy, r]) => el('circle', { cx: X(cx + tx), cy: Y(cy), r: r * S, class: 'canopy' }, tree));
      el('circle', { cx: X(2.9 + tx), cy: Y(4.3), r: 0.7 * S, class: 'canopy-light' }, tree);
    } else { rect(0, 0, southGF, -0.25, SLAB); }
    // basement floor, hoz, walls
    rect(bs0, bElev, northGF, bElev - slab, SLAB);
    if (D.hoz !== false) { const hz = D.hozAt != null ? D.hozAt : 7.0 + (southGF - south); rect(hz, bElev, hz + 1.75, bElev + 0.52, { class: 'water' }); text(hz + 0.9, bElev + 1.07, tag('hoz'), { class: 'tag', 'text-anchor': 'middle' }); }
    line(bs0, 0, bs0, bElev - slab, WALL);
    // ground: slab, car, shabak, tags
    rect(southGF, 0, northGF, -slab, SLAB);
    const car = el('g', { class: 'car' });
    const Xc = m => X(m + (D.carX || 0));   // the car can slide along the depth
    // a small round hatchback: body, cabin, two windows, wheels with hubs, a headlight
    el('path', { d: `M${Xc(9.3)} ${Y(0.42)} L${Xc(9.3)} ${Y(0.95)} Q${Xc(9.3)} ${Y(1.15)} ${Xc(9.55)} ${Y(1.15)} L${Xc(10.35)} ${Y(1.15)} Q${Xc(10.6)} ${Y(1.15)} ${Xc(10.85)} ${Y(1.45)} L${Xc(11.35)} ${Y(1.95)} Q${Xc(11.6)} ${Y(2.15)} ${Xc(11.9)} ${Y(2.15)} L${Xc(12.9)} ${Y(2.15)} Q${Xc(13.35)} ${Y(2.15)} ${Xc(13.55)} ${Y(1.85)} L${Xc(13.85)} ${Y(1.2)} Q${Xc(13.95)} ${Y(0.95)} ${Xc(13.95)} ${Y(0.7)} L${Xc(13.95)} ${Y(0.42)} Z`, class: 'car-body' }, car);
    el('path', { d: `M${Xc(11.0)} ${Y(1.3)} L${Xc(11.45)} ${Y(1.85)} L${Xc(12.25)} ${Y(1.85)} L${Xc(12.25)} ${Y(1.3)} Z`, class: 'car-glass' }, car);
    el('path', { d: `M${Xc(12.5)} ${Y(1.3)} L${Xc(12.5)} ${Y(1.85)} L${Xc(13.0)} ${Y(1.85)} Q${Xc(13.3)} ${Y(1.85)} ${Xc(13.45)} ${Y(1.55)} L${Xc(13.55)} ${Y(1.3)} Z`, class: 'car-glass' }, car);
    el('circle', { cx: Xc(13.85), cy: Y(0.72), r: 0.09 * S, class: 'car-lamp' }, car);
    [10.35, 12.95].forEach(cx => { el('circle', { cx: Xc(cx), cy: Y(0.36), r: 0.36 * S, class: 'car-wheel' }, car); el('circle', { cx: Xc(cx), cy: Y(0.36), r: 0.14 * S, class: 'car-hub' }, car); });
    const f1 = upper[0];
    if (D.shabak !== false) { line(southGF, 0, southGF, f1.elev, { class: 'shabak' }); text(southGF - 0.25, 1.2, tag('shabak'), { class: 'tag', 'text-anchor': 'end' }); }
    text(0.3, 0.55, tag('yard'), { class: 'tag' });
    if (northGF < north - 0.05) text(northGF + 0.25, -0.75, tag('street'), { class: 'tag' });   // on the strip under the street
    else text(north + 0.2, 0.9, tag('street'), { class: 'tag' });                               // street face flush: label the air beyond the wall
    if (D.flowerBox) { rect(north, f1.elev, north + D.flowerBox, f1.elev - slab, SLAB); el('path', { d: `M${X(north + 0.1)} ${Y(f1.elev)} q4 -9 8 0`, class: 'green' }); }
    // upper slabs and walls
    upper.forEach(L => rect(south, L.elev, north, L.elev - slab, SLAB));
    lofts.forEach(L => { const sp = L.span || [11.5, north]; rect(sp[0], L.elev, sp[1], L.elev - slab, SLAB); });
    if (roof) {
      rect(sh0, roof.elev + shH, sh1, roof.elev + shH - slab, SLAB);
      line(sh0, roof.elev, sh0, roof.elev + shH, WALL); line(sh1, roof.elev, sh1, roof.elev + shH, WALL);
      if (tag('stairHouse')) text((sh0 + sh1) / 2, roof.elev + shH / 2 - 0.2, tag('stairHouse'), { class: 'tag', 'text-anchor': 'middle' });
      for (let x = south + 0.4; x < sh0 - 0.4; x += 0.9) if (!shaft || x + 0.3 < shaft[0] || x > shaft[1]) el('path', { d: `M${X(x)} ${Y(roof.elev)} q4 -9 8 0`, class: 'green' });
    }
    if (southGF === south) line(south, bElev, south, wallTop || f1.elev, WALL);
    else { line(southGF, bElev, southGF, f1.elev, WALL); line(south, f1.elev - slab, south, wallTop || f1.elev, WALL); }
    line(northGF, bElev - slab, northGF, f1.elev, WALL);
    line(north, f1.elev - slab, north, wallTop || f1.elev, WALL);
    // idea floors: the existing roof slab becomes their floor (solid); the box above is dashed with a light hatch, and the label sits inside
    if (ideaFloors.length) {
      const pid = hatchId('ghost');
      ideaFloors.forEach((g, i) => {
        rect(south, g.elev, north, g.elev - slab, SLAB);
        const above = ideaFloors[i + 1] || ideaRoof;
        const topE = above ? above.elev - slab : g.elev + g.clear;
        const gg = el('g', { class: 'ghost ghost-idea' });
        rect(south, topE, north, g.elev, { style: `fill:url(#${pid})` }, gg);
        text((south + north) / 2, g.elev + (topE - g.elev) / 2 - 0.2, T(g, 'label') || T(g, 'name'), { class: 'ghost-label', 'text-anchor': 'middle' }, gg);
        if (g.base || g.base_fa) text(south - 0.25, g.elev + 0.15, T(g, 'base'), { class: 'tag', 'text-anchor': 'end' });
      });
      if (ideaRoof) {
        const gg = el('g', { class: 'ghost ghost-idea' });
        rect(south, ideaRoof.elev, north, ideaRoof.elev - slab, {}, gg);
        rect(sh0, ideaRoof.elev + shH, sh1, ideaRoof.elev + shH - slab, {}, gg);
        const dash = { style: 'stroke:var(--ink-2, #5A6664);stroke-width:1;stroke-dasharray:5 5' };
        line(sh0, ideaRoof.elev, sh0, ideaRoof.elev + shH, dash, gg); line(sh1, ideaRoof.elev, sh1, ideaRoof.elev + shH, dash, gg);
        for (let x = south + 0.4; x < sh0 - 0.4; x += 0.9) el('path', { d: `M${X(x)} ${Y(ideaRoof.elev)} q4 -9 8 0`, class: 'green', style: 'stroke-dasharray:2 2;opacity:.7' }, gg);
      }
    }
    // double-height voids
    D.levels.filter(l => l.double).forEach(L => {
      const next = upper.find(u => u.elev > L.elev);
      const vs = L.voidSpan || [south, 11.5];
      rect(vs[0], L.elev, vs[1], next.elev - slab, { class: 'void' });
      const dx = (vs[0] + vs[1]) / 2;
      line(dx, L.elev, dx, next.elev - slab, { class: 'dim' });
      text(dx + 0.25, (L.elev + next.elev) / 2, (L.voidClear || L.clear).toFixed(2), { class: 'dim-label' });
    });
    // idea extras: the shaft (a void behind the cut, dashed, punching every slab, glass floor at ±0.00, skylight on the roof),
    // riser marks where a riser pierces the slabs, and the watermark
    if (shaft) {
      const topE = roof ? roof.elev : (wallTop || f1.elev), skyH = D.shaft.skylight || 0;
      const g = el('g', { class: 'shaft' });
      const dashT = 'stroke:var(--turq, #1D8F8A);stroke-width:1.1;stroke-dasharray:5 4;fill:var(--paper, #F7F7F4)';
      rect(shaft[0], bElev, shaft[1], topE, { style: dashT + ';fill-opacity:.92' }, g);
      if (skyH) { rect(shaft[0], topE, shaft[1], topE + skyH, { style: dashT + ';fill:var(--turq-wash, #DDEFED);fill-opacity:.7' }, g); line(shaft[0] - 0.15, topE + skyH, shaft[1] + 0.15, topE + skyH, { style: 'stroke:var(--turq, #1D8F8A);stroke-width:2.5' }, g); text((shaft[0] + shaft[1]) / 2, topE + skyH + 0.55, tag('skylight'), { class: 'tag', 'text-anchor': 'middle' }, g); }
      el('path', { d: `M${X(shaft[0] + 0.25)} ${Y(bElev)} q4 -9 8 0 M${X(shaft[0] + 1.3)} ${Y(bElev)} q4 -9 8 0 M${X(shaft[1] - 0.6)} ${Y(bElev)} q4 -9 8 0`, class: 'green' }, g);
      line(shaft[0], 0, shaft[1], 0, { style: 'stroke:var(--turq, #1D8F8A);stroke-width:2.5' }, g);
      text((shaft[0] + shaft[1]) / 2, 0.45, tag('glass'), { class: 'tag', 'text-anchor': 'middle', style: 'font-size:9.5px' }, g);
      text((shaft[0] + shaft[1]) / 2, (f1.elev + (upper[1] ? upper[1].elev : f1.elev + 3)) / 2 - 0.1, tag('shaft'), { class: 'tag', 'text-anchor': 'middle', style: 'fill:var(--turq, #1D8F8A)' }, g);
    }
    (D.risers || []).forEach(([r0, r1]) => {
      const g = el('g', { class: 'riser' });
      D.levels.filter(l => !l.ghost && !l.loft).forEach(L => rect(r0, L.elev - slab, r1, L.elev + 0.12, { style: 'fill:var(--turq, #1D8F8A);opacity:.8' }, g));
      line((r0 + r1) / 2, bElev, (r0 + r1) / 2, (roof || upper[upper.length - 1]).elev, { style: 'stroke:var(--turq, #1D8F8A);stroke-width:.8;stroke-dasharray:2 3;opacity:.7' }, g);
      text((r0 + r1) / 2, bElev + 0.55, tag('riser'), { class: 'tag', 'text-anchor': 'middle', style: 'fill:var(--turq, #1D8F8A);font-size:10px' }, g);
    });
    if (D.idea) {
      const wx = X((south + north) / 2), wy = Y(f1.elev + 4.6);   // across the second floor, where nothing else is written
      text(0, 0, tag('idea'), { class: 'idea-mark', x: wx, y: wy, 'text-anchor': 'middle', style: `fill:var(--earth, #9C6B3C);opacity:.32;font-size:${K.lang === 'fa' ? 21 : 18}px;font-weight:700;pointer-events:none`, transform: `rotate(-12 ${wx} ${wy})` });
    }
    // level ladder
    const ladder = el('g', { class: 'ladder' });
    D.levels.forEach(L => {
      line((L.ghost && !L.upper) || L.elev < 0 ? bs0 : south, L.elev, north + 0.6, L.elev, { class: 'lead' }, ladder);
      text(north + 0.8, L.elev + 0.12, L.ghost && !L.upper ? (T(L, 'short') || '?') : lab(L.elev), { class: 'lvl' }, ladder);
      text(north + 0.8, L.elev - 0.5, T(L, 'name'), { class: 'lvl-name' }, ladder);
    });
    line(0, bot + 0.3, north, bot + 0.3, { class: 'dim' });
    text(north / 2, bot - 0.15, `${D.plot.depth.toFixed(2)} m · ${tag('plot')} ${D.plot.width} × ${D.plot.depth}`, { class: 'dim-label', 'text-anchor': 'middle' });
    // hover / focus bands
    const bands = el('g', { class: 'bands' });
    const setCaption = L => { const unk = L.ghost && !L.upper; if (caption) caption.innerHTML = `<strong>${T(L, 'name')}</strong> <span>${unk ? '' : lab(L.elev)}${L.clear && !unk ? ` · ${L.clear.toFixed(2)} ${tag('clear')}` : ''}</span><br>${T(L, 'note') || ''}`; };
    D.levels.forEach((L, i) => {
      const x0 = (L.ghost && !L.upper) || L.elev < 0 ? bs0 : L.elev < f1.elev ? southGF : south, x1 = L.elev < f1.elev ? northGF : north;
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
