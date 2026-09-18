/* Pan/zoom viewer for the vector sheets (SVG in an <img>): drag to pan, wheel (Ctrl/⌘) or buttons to zoom, double-click to zoom in,
   pinch on touch, fit and full screen. No library; works from file:// too.
   Touch: the stage has touch-action: pan-y (css), so a vertical swipe scrolls the page and a horizontal drag or a pinch reaches the viewer;
   the browser cancels the pointer when it takes a vertical swipe, which the up/cancel handler below clears. Full screen sets touch-action: none,
   and so does the viewer itself once the sheet is zoomed in past fit (then vertical panning of the sheet is what the finger means); «fit» restores it. */
(function () {
  const fa = document.documentElement.lang === 'fa';
  const t = { zin: fa ? 'بزرگ‌نمایی' : 'Zoom in', zout: fa ? 'کوچک‌نمایی' : 'Zoom out', fit: fa ? 'اندازهٔ برگه' : 'Fit', full: fa ? 'تمام‌صفحه' : 'Full screen',
    hint: fa ? 'کشیدن: جابه‌جایی · دوبار کلیک یا Ctrl/⌘ + چرخ ماوس: بزرگ‌نمایی' : 'Drag to pan · double-click or Ctrl/⌘ + wheel to zoom' };
  document.querySelectorAll('.zoomer').forEach(host => {
    const img = host.querySelector('img'); if (!img) return;
    const bar = document.createElement('div'); bar.className = 'pv-bar';
    bar.innerHTML = `<button type="button" data-a="out" aria-label="${t.zout}">−</button><span class="pv-zoom">100%</span><button type="button" data-a="in" aria-label="${t.zin}">+</button><button type="button" data-a="fit">${t.fit}</button><button type="button" data-a="full">${t.full}</button>${host.dataset.pdf ? `<a href="${host.dataset.pdf}" target="_blank" rel="noopener" type="application/pdf">PDF</a>` : ''}<span class="pv-hint">${t.hint}</span>`;
    const stage = document.createElement('div'); stage.className = 'pv-stage zoom-stage'; stage.tabIndex = 0;
    const layer = document.createElement('div'); layer.className = 'zoom-layer';
    img.parentNode.insertBefore(stage, img); layer.appendChild(img); stage.appendChild(layer); host.insertBefore(bar, stage);
    let s = 1, tx = 0, ty = 0, natural = null, fitScale = 1;
    const apply = () => {
      layer.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`; bar.querySelector('.pv-zoom').textContent = Math.round(s * 100) + '%';
      stage.style.touchAction = s > fitScale * 1.05 ? 'none' : '';   // '' = the stylesheet's pan-y (none in full screen)
    };
    const fit = () => {
      const iw = img.naturalWidth || parseFloat(img.getAttribute('width')) || 800, ih = img.naturalHeight || parseFloat(img.getAttribute('height')) || 600;
      natural = [iw, ih];
      const sw = stage.clientWidth, sh = stage.clientHeight || Math.round(sw * 0.75);
      s = fitScale = Math.min(sw / iw, sh / ih); tx = (sw - iw * s) / 2; ty = (sh - ih * s) / 2; apply();
    };
    const zoomAt = (f, cx, cy) => { const ns = Math.max(0.2, Math.min(12, s * f)); tx = cx - (cx - tx) * ns / s; ty = cy - (cy - ty) * ns / s; s = ns; apply(); };
    const centre = () => [stage.clientWidth / 2, stage.clientHeight / 2];
    bar.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.a === 'in') zoomAt(1.3, ...centre());
      if (b.dataset.a === 'out') zoomAt(1 / 1.3, ...centre());
      if (b.dataset.a === 'fit') fit();
      if (b.dataset.a === 'full') { if (document.fullscreenElement) document.exitFullscreen(); else host.requestFullscreen?.(); }
    });
    stage.addEventListener('wheel', e => { if (!(e.ctrlKey || e.metaKey)) return; e.preventDefault(); const r = stage.getBoundingClientRect(); zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
    stage.addEventListener('dblclick', e => { const r = stage.getBoundingClientRect(); zoomAt(1.7, e.clientX - r.left, e.clientY - r.top); });
    const pts = new Map(); let last = null, dist0 = null;
    stage.addEventListener('pointerdown', e => { stage.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); last = [e.clientX, e.clientY]; stage.classList.add('is-dragging'); });
    stage.addEventListener('pointermove', e => {
      if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pts.size === 2) { const [a, b] = [...pts.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (dist0) { const r = stage.getBoundingClientRect(); zoomAt(d / dist0, (a[0] + b[0]) / 2 - r.left, (a[1] + b[1]) / 2 - r.top); } dist0 = d; return; }
      if (last) { tx += e.clientX - last[0]; ty += e.clientY - last[1]; last = [e.clientX, e.clientY]; apply(); }
    });
    const up = e => { pts.delete(e.pointerId); if (pts.size < 2) dist0 = null; if (!pts.size) { last = null; stage.classList.remove('is-dragging'); } };
    stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
    stage.addEventListener('keydown', e => { if (e.key === '+' || e.key === '=') zoomAt(1.3, ...centre()); if (e.key === '-') zoomAt(1 / 1.3, ...centre()); if (e.key === '0') fit(); });
    document.addEventListener('fullscreenchange', () => setTimeout(fit, 50));
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(fit, 150); });
    if (img.complete) fit(); else img.addEventListener('load', fit);
    img.addEventListener('error', () => { if (host.dataset.fallback && img.src.indexOf(host.dataset.fallback) < 0) img.src = host.dataset.fallback; });
  });
})();
