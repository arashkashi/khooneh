# Changelog

## v0.6 — 2026-09-18 (evening), the next design in boxes
- New chapter `next/` — the family's imaginative next design, coarse on purpose: the 1399 grid re-fitted to Mollasadra (columns on A / 7.35 / east wall × four depth lines; 7.1 m free span; 0.65 m riser spine; 2.25 m core bay), a mat foundation with the sunken garden outside it, a concrete core tube and two west shear walls, no tall storey (the six-metre living is an omitted slab), two fixed risers, a 2.5 × 3 m light-and-air void with an east skylight, one core stair and a single private stair; parents on the first floor, second household + student on the second, the large family on the third and fourth, caretaker and commons at −1, the roof for all. Every plan carries a watermark and a dashed frame; the 3D uses hatched slabs and a floating «ایدهٔ خانواده — نه نقشه».
- `js/three-model.js` exploded mode: floor spacing slider with a damped ease and a play loop; stairs drawn as connectors that stretch across the gaps (core stair through all floors, private stairs from their floor to the next); columns as continuous rods, risers as turquoise prisms; used on the next page and on the 1403 attempt page.
- `js/stacks.js` stairs kind: core stair, lift and private stairs of all floors on one frame with an area table (1403: 44.2 m² of private stairs, the spiral alone 21.3; 1399: none).
- Concepts: «پلهٔ قیچی و متراژ پله‌ها» (the scissor stair saves width, not area; what actually saves area) and «خنک‌سازی: بعد از کولر آبی» (what is on the market, studied, or not found in Iran as of Sept 2026, with the uncertainty stated; consequences for the design).
- `js/shade.js`: sun-and-console section for 36.3° N (summer noon 77°, equinox 54°, winter 30°; the 1.20 m console fully shades a south window above ≈67°).
- Plan drawings gained grid lines, columns and risers for idea plans; idea plans never stand in for measured plans on other pages.

## v0.5 — 2026-09-18, live on GitHub Pages; option B; the site as seen by an office
- Published at https://arashkashi.github.io/khooneh/ (repo `arashkashi/khooneh`, Pages from `main`); the original sheets go public as they are, by the owner's decision.
- Option B «برش ۱۳۹۹ + یک طبقه» on the proposal page next to option A, with a comparison table, what must be settled first, and a ghost fourth floor drawn on the 1399 section (`attempt1plus` in `js/data.js`); the console now drawn toward the yard.
- Two new open questions: the fourth floor (allowed, not needed; height, soft storey, parking, who lives where) and pipes and risers (`js/stacks.js`: wet rooms of four floors on one frame, the one continuous duct, distances to the nearest duct).
- Unit-mix question: the duplex as a means — the target area decides flat / loft / duplex.
- Six read-only reviews from an architecture office's point of view (ideology, engagement, technical, brief, editorial, drawings; kept in `../private/reviews/2026-09-18/`) folded in: the invite page now states what is fixed and open, a phase-one scope, an eight-field two-day response format, the family's commitments, the ideas position and a data package (JSON plans, brief, SVG sheets); the 19 criteria classified (measurable / value / design idea / ambiguous) with a testable restatement each; technical honesty edits (roof +16.28 with the stair house above it, three floors in a four-floor height, the second-floor loft as an unlevelled inset the section cannot hold, sewer invert and pumps for −2, the tree pit vs −2 collision, parking as independent + shuffled, the 2024 student duplex as the sheets draw it); one name per design; neutral decks; the dispute told once; the neighbours sentence neutral; polygon room areas by the shoelace formula; provenance under every redraw; landing mail link and a line for offices; phone chrome (two-row nav, scrollable tables, pan-y zoomer); series navigation without dead ends; widget hints in the third person.
- Known, not yet fixed: `content/plans-a3.json` tells the student duplex the other way round from the sheets (and has a kitchenette the sheet does not); a small 2.05 × 2.15 "bedroom" in Duplex A; the a3-first NE/NW corner note.

## v0.4 — 2026-09-18 (night), accurate plans, vector sheets, dollhouse 3D
- All twelve plans redrawn from the sheets' own vector lines by two verifying agents (polygons, walls, doors, windows, stairs, lift); side-by-side verification renderer in `../tools/render_plan_png.py`.
- Original sheets as cropped vector SVGs with a pan/zoom viewer (`js/sheet-zoom.js`) on every sheet page.
- 3D: roofless per-floor views (walls with door and window openings, floor plates, stairs, labels, top view) on sheet pages; stacked/explode model on attempt pages (`js/three-model.js`).
- Fact-check pass applied: loft over the south rooms, 1.20 console toward the yard, dates and counts aligned, private details removed; section diagram corrected.
- Sheet pages read as impressions (feeling, matched, gained, missed, open, could improve); dimensions folded under details.
- Interlude on Hossein Amanat; contact set; links work from Finder; «سرایدار» kept by decision.

## v0.3 — 2026-09-17 (evening), plans, 3D, interlude
- Schematic floor plans drawn in JS (`js/plan.js`) from `content/plans.json` — twelve plans, 136 rooms tagged to brief items, questions and concepts; plan browser on attempt pages, plan beside each sheet, focused/zoomed plan on brief, question and concept pages.
- Own PDF scanner (`../tools/scan_plans.py`): plot frames, wall hatch, exact label anchors; plans authored from those anchors (`../tools/author_plans.py`).
- 3D massing model (`js/three-model.js`, Three.js via import map) on attempt pages: floors and rooms as volumes, explode/stack animation, orbit.
- Interlude: a question for Hossein Amanat (voice node, story interlude, aside in both single pages).
- Links carry explicit `index.html` (works from Finder/Safari); contact set to arashkashi@gmail.com; friendlier car and tree in the section.
- Third-person voice throughout, Persian and English; brief before the story.

## v0.2 — 2026-09-17, layered bilingual site
- Persian primary (RTL, Vazirmatn), English single page (Newsreader). Language links in the header.
- Minimal landing (question + section diagram + doors) → chapters: brief → story → طرح ۱۳۹۹ → طرح ۱۴۰۳ → sheets → open questions → proposal → invitation; concepts as a side entrance; "everything on one page" in both languages.
- Content graph in `content/*.json` (brief, story, attempts, sheets, questions, concepts, proposal); pages generated by `_build/build.py`; every page lists related nodes and the other pages that lead to it.
- Proposal («حیاط عمودی»): an owner-side synthesis with its own to-scale section and unit interlock; marked as a starting point, not an architect's design.
- Voice: third person only, humble; brief moved before the story.
- Contact: arashkashi@gmail.com; architect unnamed.

## v0.1 — 2026-09-17, first iteration
- English single page: story, brief (FA/EN), Attempt I (2020) and Attempt III (2024) with sheet galleries and lightbox, two readings, ten open questions, invitation, PDF downloads; hero section diagram; 2024 unit-interlock diagram.

## Next
- English layered pages (translate `_en` fields in the content graph).
- Site photos of the alley; plan-level zoning diagrams from the sheet vectors.
- Decide architect credit and the contact channel; then push and enable Pages.
