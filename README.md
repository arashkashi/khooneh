# Khooneh — خونه

The website of a family's search for a house on a 200 m² plot in Qazvin: the brief, the story, two designs, the drawings, the open questions, a proposal, and an invitation. Persian primary, English single page.

Live: https://arashkashi.github.io/khooneh (GitHub Pages, branch `main`, folder `/`). No build step on GitHub — generated pages are committed.

## Layout
- `content/*.json` — the content graph (see `content/SCHEMA.md`). Edit these, not the generated pages.
- `_templates/` — Jinja2 templates; `_build/build.py` — generator (`python3 _build/build.py` from this folder; needs `pip install jinja2`).
- `_src/all.fa.html`, `_src/all.en.html` — hand-written "everything on one page" versions, post-processed into `all/` and `en/all/`.
- `css/`, `js/` — styles (RTL-first, Vazirmatn + Newsreader) and the two diagrams (`section.js`, `units.js`) driven by `js/data.js`.
- `drawings/` — sheets as WebP + original PDFs (built by `../tools/build_site_assets.py`).
- Generated: `index.html`, `all/`, `brief/`, `story/`, `attempts/`, `sheets/`, `questions/`, `concepts/`, `proposal/`, `invite/`, `en/`.

The corpus and notes live in `../private/` and are excluded by `.gitignore`. Never move them here.

## Deploy
```
python3 _build/build.py && git add -A && git commit -m "…" && git push origin main
```
Then GitHub → Settings → Pages → Deploy from a branch → `main` / `/ (root)`.
