# Khooneh — خونه

Static site: the story of a family's search for a next-generation house on a 200 m² plot in Qazvin, the brief, two sets of drawings, open questions, and an invitation to architects.

Deployed at https://arashkashi.github.io/khooneh — GitHub Pages, branch `main`, folder `/` (root). No build step.

- `index.html`, `css/`, `js/` — the page. All paths are relative (the site lives under `/khooneh/`).
- `js/data.js` — dimensions read from the drawing sheets (mirror of `../private/geometry.json`).
- `drawings/` — drawing sheets as WebP (from `../tools/build_site_assets.py`) and the original PDFs.

The corpus, extractions and notes live in `../private/` and are excluded by `.gitignore`. Never move them here.

## Deploy
```
git add -A && git commit -m "…" && git push origin main
```
then in the GitHub repo: Settings → Pages → Source: Deploy from a branch → `main` / `/ (root)`.
