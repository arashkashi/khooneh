# Khooneh content graph — schema (v0.2)

The site is generated from these JSON files by `tools/build_site.py`. Every node has an `id`, Persian text as primary (`_fa`), optional English (`_en`), and a `related` map of ids so pages can cross-link in both directions. Voice (both languages): THIRD PERSON ONLY — never «من / ما / شما», never “I / we / you”. Say «یک خانواده», «صاحب زمین», «کسی که», «هر کس», “a family”, “the owner”, “someone”, “whoever”. Sentences short and smooth; one idea per sentence; no slogans. The owner's positions are reported (“the owner asked for…”), the architect's likewise («معمار»). Persian digits in prose. Never anything from the private chat (family matter, conflict, names). The architect is «معمار», never named.

Files (one owner each):
- `attempts.json`  — [{id:"a1"|"a3", title_fa, years_fa, deck_fa, intro_fa (2–3 paragraphs, "\n\n" separated), what_it_did_fa:[...], what_happened_fa, plot:{w,d,area}, units_fa:[{name_fa, where_fa, area, character_fa}], related:{sheets:[], brief:[], questions:[], concepts:[]}}]
- `story.json`     — [{id:"e-2019"…, date_fa, date_iso, title_fa, body_fa, related:{attempts:[], sheets:[], brief:[], concepts:[], questions:[]}}]
- `brief.json`     — [{id:"b01"…"b19", n, text_fa (VERBATIM, do not edit), text_en, theme (kitchen|hosting|work|bath|rooms|caretaker|wellness|green|roof|storage|windows|facade|basement|ventilation|cost|stairs|lift), gloss_fa (1–2 sentences: what it really asks, in Arash's voice), in_attempt1_fa (how the 1399 design answered it, or "—"), in_attempt3_fa (how the 1403 design answered it, or "—"), status:"answered"|"partly"|"open"|"contradicted", related:{sheets:[], questions:[], concepts:[]}}]
- `questions.json` — [{id:"q-level-minus-2", title_fa, lead_fa, body_fa (2–4 paragraphs), owner_view_fa, architect_view_fa (neutral summary of what the architect argued, if anything), evidence_fa:[...] (concrete facts from sheets/reports), related:{brief:[], sheets:[], concepts:[], attempts:[]}}]
- `concepts.json`  — [{id:"c-iwan", term_fa, term_en, definition_fa, in_this_project_fa (2–3 paragraphs), related:{brief:[], sheets:[], questions:[], attempts:[]}}]
- `sheets.json`    — [{id:"a1-section", attempt:"a1"|"a3", title_fa, sheet_no, date_jalali, scale:"1:100", src, thumb, pdf, w, h, level_fa, what_to_look_for_fa:[5–9 bullets, each pointing at something visible on the sheet with a dimension or label], rooms_fa:[...], notes_fa (1 paragraph, honest: what is good, what is unresolved, what the title block says), related:{brief:[], questions:[], concepts:[], sheets:[]}}]

Fixed ids
- attempts: a1, a3
- sheets: a1-section, a1-basement, a1-ground, a1-first-loft, a1-second-loft, a1-third, a3-basement, a3-ground, a3-first, a3-second, a3-third, a3-fourth-alt  (files: drawings/2020/{section-b-b,basement,ground,first-loft,second-loft,third}.webp, drawings/2024/{basement,ground,first,second,third,fourth-alt}.webp; thumbs `-thumb.webp`; pdfs drawings/pdf/2020_*.pdf, drawings/pdf/2024_*.pdf as in the current index.html)
- brief: b01…b19
- questions: q-level-minus-2, q-window-paradox, q-breathing, q-both-sides, q-convertible, q-cost-in-quantities, q-tree, q-roof, q-mix, q-facade
- concepts: c-iwan, c-godal-baghcheh, c-shabak, c-hoz, c-nested-floors, c-bahamestan, c-double-skin, c-double-height-loft, c-student-unit, c-caretaker, c-roof-garden, c-tree, c-cross-ventilation, c-parking
- story events: e-1398-list, e-1399-first-design, e-1399-plot-lost, e-1400-second-plot, e-1403-third-attempt, e-1403-reviews, e-1404-paused, e-1405-page

Sources of truth: private/knowledge/*.md, private/geometry.json, private/renders/ (view them), the 19-point brief verbatim in private/knowledge/01-brief.md. Owner-observation PDFs have a broken text layer — paraphrase only.

## plans.json — schematic floor plans (drawn by js/plan.js in the style of the section diagram)
Array of plans, one per plan sheet (not the section): ids a1-basement, a1-ground, a1-first, a1-loft1, a1-second, a1-third, a3-basement, a3-ground, a3-first, a3-second, a3-third, a3-fourth.
Each: {id, attempt:"a1"|"a3", sheet:"<sheet id>", name_fa, elev (m, number or null), north:"up"|"right", mirrored:false,
  plot_px:[x0,y0,x1,y1] — the PLOT boundary rectangle on the sheet image as FRACTIONS of image width/height (x from left, y from top),
  plot_m:{w, d} — plot width and depth in metres (a1: 10.55 × 19.00; a3: 10.50 × 20.14),
  footprint_px:[[x0,y0,x1,y1], …] — rectangles (fractions) that together make the built body on this level (walls drawn around their union),
  rooms:[{id:"kitchen", name_fa, name_en, kind, px:[x0,y0,x1,y1] (fractions), tags:["b01","c-hoz", …]}],
  elements:[{type:"stair"|"lift"|"car"|"tree"|"void"|"water"|"green"|"balcony"|"door", px:[x0,y0,x1,y1], label_fa?}]}
kinds: living, kitchen, dining, bedroom, bath, study, storage, service, circulation, outdoor, void, parking, water, green, caretaker, hall.
tags: ids of brief items (b01–b19), questions (q-*), concepts (c-*) that this room illustrates — used to focus the plan on sub-pages.
Coordinates are fractions of the site WebP image (drawings/2020|2024/*.webp); the build converts them to metres via plot_px/plot_m and `north`.
