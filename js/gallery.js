/* Sheet galleries + one shared lightbox (native <dialog>). */
(function () {
  const dlg = document.getElementById('lightbox');
  if (!dlg) return;
  const img = dlg.querySelector('img'), ttl = dlg.querySelector('.lb-title'), meta = dlg.querySelector('.lb-meta'), pdf = dlg.querySelector('.lb-pdf');
  let list = [], idx = 0;

  const show = i => {
    idx = (i + list.length) % list.length;
    const a = list[idx];
    img.src = a.dataset.full; img.alt = a.dataset.title;
    ttl.textContent = a.dataset.title; meta.textContent = a.dataset.meta; pdf.href = a.dataset.pdf;
    dlg.querySelector('.lb-count').textContent = `${idx + 1} / ${list.length}`;
  };
  document.querySelectorAll('.sheets').forEach(gal => {
    const items = [...gal.querySelectorAll('a.sheet')];
    items.forEach((a, i) => a.addEventListener('click', e => {
      e.preventDefault(); list = items; show(i);
      if (!dlg.open) dlg.showModal();
    }));
  });
  dlg.querySelector('.lb-prev').addEventListener('click', () => show(idx - 1));
  dlg.querySelector('.lb-next').addEventListener('click', () => show(idx + 1));
  dlg.querySelector('.lb-close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') show(idx + 1);
    if (e.key === 'ArrowLeft') show(idx - 1);
  });
  dlg.addEventListener('close', () => { img.src = ''; });
})();

/* Brief: language toggle (fa / en / both) remembered per viewer. */
(function () {
  const brief = document.getElementById('brief-list');
  const bar = document.getElementById('brief-lang');
  if (!brief || !bar) return;
  const apply = v => {
    brief.dataset.show = v;
    bar.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === v));
    try { localStorage.setItem('khooneh.brief', v); } catch (_) {}
  };
  bar.addEventListener('click', e => { const b = e.target.closest('button'); if (b) apply(b.dataset.v); });
  let v = 'both'; try { v = localStorage.getItem('khooneh.brief') || v; } catch (_) {}
  apply(v);
})();
