/* Vector sheet viewer: renders the original PDF sheet with PDF.js at screen resolution, with zoom, pan, fit and fullscreen.
   Falls back to the WebP image when PDFs cannot be fetched (file://) or the library fails to load. */
(async function () {
  const hosts = document.querySelectorAll('.pdf-viewer[data-pdf]');
  if (!hosts.length) return;
  const fa = document.documentElement.lang === 'fa';
  const t = { zin: fa ? 'بزرگ‌نمایی' : 'Zoom in', zout: fa ? 'کوچک‌نمایی' : 'Zoom out', fit: fa ? 'اندازهٔ صفحه' : 'Fit', full: fa ? 'تمام‌صفحه' : 'Full screen', pdf: 'PDF', loading: fa ? 'در حال بارگذاری نقشه…' : 'Loading the sheet…', drag: fa ? 'برای جابه‌جایی بکشید · برای بزرگ‌نمایی چرخ ماوس با Ctrl/⌘' : 'Drag to pan · Ctrl/⌘ + wheel to zoom' };

  if (location.protocol === 'file:') return; // keep the image fallback
  let pdfjs;
  try {
    pdfjs = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';
  } catch (e) { return; }

  for (const host of hosts) {
    const url = host.dataset.pdf;
    const fallback = host.querySelector('img');
    host.classList.add('is-vector');
    const bar = document.createElement('div'); bar.className = 'pv-bar';
    bar.innerHTML = `<button type="button" data-a="out" aria-label="${t.zout}">−</button><span class="pv-zoom">100%</span><button type="button" data-a="in" aria-label="${t.zin}">+</button><button type="button" data-a="fit">${t.fit}</button><button type="button" data-a="full">${t.full}</button><a href="${url}" download>${t.pdf}</a><span class="pv-hint">${t.drag}</span>`;
    const stage = document.createElement('div'); stage.className = 'pv-stage'; stage.tabIndex = 0;
    const canvas = document.createElement('canvas'); stage.appendChild(canvas);
    const status = document.createElement('p'); status.className = 'pv-status'; status.textContent = t.loading;
    host.append(bar, stage, status);
    if (fallback) fallback.hidden = true;

    let pdf, page, base = 1, zoom = 1, rendering = null, pending = false;
    try {
      pdf = await pdfjs.getDocument({ url }).promise;
      page = await pdf.getPage(1);
    } catch (e) { status.textContent = ''; host.classList.remove('is-vector'); if (fallback) fallback.hidden = false; bar.remove(); stage.remove(); continue; }
    status.remove();
    const vp1 = page.getViewport({ scale: 1 });
    const fit = () => { base = (stage.clientWidth - 2) / vp1.width; zoom = 1; render(); };
    const render = async () => {
      if (rendering) { pending = true; return; }
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const scale = base * zoom;
      const vp = page.getViewport({ scale: scale * dpr });
      canvas.width = Math.floor(vp.width); canvas.height = Math.floor(vp.height);
      canvas.style.width = Math.floor(vp.width / dpr) + 'px'; canvas.style.height = Math.floor(vp.height / dpr) + 'px';
      bar.querySelector('.pv-zoom').textContent = Math.round(zoom * 100) + '%';
      rendering = page.render({ canvasContext: canvas.getContext('2d'), viewport: vp });
      try { await rendering.promise; } catch (e) {}
      rendering = null;
      if (pending) { pending = false; render(); }
    };
    const setZoom = (z, cx, cy) => {
      const old = zoom; zoom = Math.max(0.5, Math.min(8, z));
      // keep the point under the cursor fixed
      const rx = (stage.scrollLeft + (cx ?? stage.clientWidth / 2)), ry = (stage.scrollTop + (cy ?? stage.clientHeight / 2));
      render().then(() => { stage.scrollLeft = rx * zoom / old - (cx ?? stage.clientWidth / 2); stage.scrollTop = ry * zoom / old - (cy ?? stage.clientHeight / 2); });
    };
    bar.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.a === 'in') setZoom(zoom * 1.25);
      if (b.dataset.a === 'out') setZoom(zoom / 1.25);
      if (b.dataset.a === 'fit') fit();
      if (b.dataset.a === 'full') { if (document.fullscreenElement) document.exitFullscreen(); else host.requestFullscreen?.(); }
    });
    stage.addEventListener('wheel', e => { if (!(e.ctrlKey || e.metaKey)) return; e.preventDefault(); const r = stage.getBoundingClientRect(); setZoom(zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15), e.clientX - r.left, e.clientY - r.top); }, { passive: false });
    stage.addEventListener('dblclick', e => { const r = stage.getBoundingClientRect(); setZoom(zoom * 1.6, e.clientX - r.left, e.clientY - r.top); });
    let drag = null;
    stage.addEventListener('pointerdown', e => { if (e.button !== 0) return; drag = { x: e.clientX, y: e.clientY, l: stage.scrollLeft, t: stage.scrollTop }; stage.setPointerCapture(e.pointerId); stage.classList.add('is-dragging'); });
    stage.addEventListener('pointermove', e => { if (!drag) return; stage.scrollLeft = drag.l - (e.clientX - drag.x); stage.scrollTop = drag.t - (e.clientY - drag.y); });
    const up = () => { drag = null; stage.classList.remove('is-dragging'); };
    stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
    stage.addEventListener('keydown', e => { if (e.key === '+' || e.key === '=') setZoom(zoom * 1.25); if (e.key === '-') setZoom(zoom / 1.25); if (e.key === '0') fit(); });
    document.addEventListener('fullscreenchange', () => setTimeout(fit, 50));
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(fit, 150); });
    fit();
  }
})();
