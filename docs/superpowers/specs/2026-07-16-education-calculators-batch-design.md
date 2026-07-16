# Education Calculators Batch — Design Spec

**Date:** 2026-07-16
**Goal:** Grow the **existing Education category** (currently 2 tools) with 4 new browser-only student calculators, chosen for SEO/AdSense traffic. Takes the site from **35 → 39 tools**. Category count stays **7** (no new category).

## Context

ClearlyCheck is a static site of self-contained calculator pages (see repo `CLAUDE.md`). Education today has two tools:
- `gpa-calculator.html` — 4.0-scale GPA from courses + credits, honors/AP weighting, cumulative.
- `grade-calculator.html` — final-exam score needed for a target grade, **and** overall weighted average across categories.

The 4 new tools were selected to avoid overlap with those two while targeting high-volume student search queries.

## Global constraints (inherit from the site)

- Self-contained `*.html` at repo root; inline `<style>` + inline `<script>`; **three** JSON-LD blocks (`WebApplication`, `FAQPage`, `BreadcrumbList`). `add-article-schema.cjs` adds a 4th (`TechArticle`) afterward.
- No backend, no API keys, no external data fetches. All math client-side, written as a pure JS function that is node-verified before wiring into the page.
- AdSense-safe: real explanatory prose, matching FAQ, **no** "Advertisement" placeholder divs.
- Education is **not YMYL** — **method note only, no finance/medical disclaimer**. Each grading tool (Test Grade, GPA⇄%) carries a short **"grading scales vary by school/instructor"** note instead.
- Byline exactly: `<div class="page-meta">Built &amp; reviewed by <a href="/about.html">Enos</a>, ClearlyCheck · Last updated <DATE></div>`, `<DATE>` = `July 16, 2026`.
- Category **Education** already exists: tag class `tag-education`, colors `--tag-education: #f3e8fd; --tag-education-text: #7c3aed;`, hub `education-tools.html`. **No new category/tag/hub work** — only add tools into it.
- Tool count becomes **39**; category count stays **7**. Every count reference updates together.
- Mobile-verify at 375px before committing each page. Use `minmax(0,1fr)` / `min-width:0` on result grids (prior batches hit overflow from bare `1fr`).
- Commit per tool (Conventional Commits, no Co-Authored-By). `main` is production (Vercel auto-deploy) — do not push until the user asks.

## Canonical grade scale (shared by Test Grade + GPA⇄%)

Standard US 10-point **with +/-**. On-page note: schools vary; mapping table shown.

| Letter | % range | GPA |
|---|---|---|
| A+ | 97–100 | 4.0 |
| A  | 93–96  | 4.0 |
| A- | 90–92  | 3.7 |
| B+ | 87–89  | 3.3 |
| B  | 83–86  | 3.0 |
| B- | 80–82  | 2.7 |
| C+ | 77–79  | 2.3 |
| C  | 73–76  | 2.0 |
| C- | 70–72  | 1.7 |
| D+ | 67–69  | 1.3 |
| D  | 63–66  | 1.0 |
| D- | 60–62  | 0.7 |
| F  | 0–59   | 0.0 |

Representative % for a GPA→% lookup = **midpoint** of the letter's range (A→96 shown as "93–100%", etc.; F shown as "below 60%").

---

## Tool 1 — Test Grade / EasyGrader (`test-grade-calculator.html`)

**Search intent:** "test grade calculator", "easy grader", "grade calculator out of N questions".

**Pure function(s):**
- `computeTestGrade({ mode, total, wrong, earned, possible })` → `{ percent, letter }`.
  - `mode === 'questions'`: `percent = (total - wrong) / total * 100` (guard `total <= 0`; clamp `wrong` to `0..total`).
  - `mode === 'points'`: `percent = earned / possible * 100` (guard `possible <= 0`).
- `letterFor(percent)` → letter from the canonical scale.

**UI:** two-mode toggle (Questions / Points).
- Questions mode: inputs *total questions* + *number wrong* (default 20 / 1). Output the % + letter.
- Points mode: inputs *points earned* + *points possible*. Output % + letter.
- **EasyGrader chart:** a compact table listing `wrong = 0,1,2,…` up to `min(total, 20)` → resulting % + letter, so a teacher can grade a whole stack at a glance. (Points mode hides the chart.)

**Method note:** exact arithmetic for the total/points entered; letter grade uses the standard 10-point +/- scale — **schools and instructors set their own cutoffs**, so confirm against the syllabus.

**Verify:** questions total 20 / wrong 1 → 95.00% A; total 50 / wrong 7 → 86.00% B; points 45/50 → 90.00% A-. 375px overflow 0; JSON-LD 3/3.

---

## Tool 2 — Words to Pages (`words-to-pages-calculator.html`)

**Search intent:** "words to pages", "how many pages is 1000 words", "500 words is how many pages".

**Model:** `wordsPerPage = BASE * fontFactor * sizeFactor * spacingFactor`, `BASE = 500` (Times New Roman, 12pt, single-spaced, 1" margins).
- `fontFactor`: Times New Roman 1.0, Arial 1.0, Calibri 1.05, Courier New 0.75.
- `sizeFactor`: 12pt → 1.0, 11pt → 1.10.
- `spacingFactor`: single 1.0, 1.5 → 0.667, double → 0.5.

**Pure function(s):**
- `wordsPerPage({ font, size, spacing })` → number.
- `wordsToPages({ words, font, size, spacing })` → pages (1-decimal).
- `pagesToWords({ pages, font, size, spacing })` → whole words.

**UI:** direction toggle (Words→Pages / Pages→Words), value input, and three selects: font (Times New Roman / Arial / Calibri / Courier New), size (11 / 12), spacing (single / 1.5 / double). Output the converted value + the words-per-page assumption used.

**Method note:** page counts are estimates from typical typography (e.g. Times New Roman 12pt double-spaced ≈ 250 words/page); real length shifts with margins, paragraph breaks, headings, and figures.

**Verify:** 1000 words, TNR 12 double → 4.0 pages (250 wpp); 500 words TNR 12 single → 1.0 page; 3 pages Arial 12 double → 750 words. 375px overflow 0; JSON-LD 3/3.

---

## Tool 3 — GPA ⇄ Percentage (`gpa-to-percentage-calculator.html`)

**Search intent:** "gpa to percentage", "percentage to gpa", "convert gpa".

**Pure function(s):**
- `gpaToBand(gpa)` → `{ letter, low, high }` — nearest letter whose GPA equals/brackets the input (round GPA to the closest scale value).
- `percentToBand(percent)` → `{ letter, gpa, low, high }`.

**UI:** direction toggle (GPA→% / %→GPA).
- GPA→%: input 4.0-scale GPA (step 0.1) → representative letter, the `low–high%` range, and the note that GPA maps to a range, not a single percent.
- %→GPA: input percentage → letter + GPA point.
- Always show the full mapping table (the canonical scale above).

**Method note:** conversions are approximate — a GPA corresponds to a **percentage band**, and institutions map differently (some use 90=4.0 with no +/-). This tool uses the common US 10-point +/- scale.

**Verify:** GPA 4.0 → A, 93–100% ; GPA 3.7 → A-, 90–92% ; 85% → B, 3.0. 375px overflow 0; JSON-LD 3/3.

---

## Tool 4 — Reading Time (`reading-time-calculator.html`)

**Search intent:** "reading time calculator", "how long to read N words", "speech time calculator".

**Pure function(s):**
- `readingTime({ words, wpm })` → seconds (guard `wpm <= 0`).
- Secondary **speaking time** at a fixed 130 wpm for the "how long to say / speech" queries.
- `fmtDuration(seconds)` → `"Xm Ys"` (or `"Xh Ym"` when ≥ 1h).

**UI:** word-count input + reading-speed control — presets **Slow 150 / Average 230 / Fast 300** plus a custom number. Output: estimated **reading time** headline + a secondary **speaking time** (~130 wpm) line.

**Method note:** average adult silent reading ≈ 200–250 wpm; speaking aloud ≈ 130 wpm. Actual time varies with text difficulty and the reader.

**Verify:** 1000 words @ 230 wpm → ~4m 20s; speaking @130 → ~7m 41s; 500 @ 250 → 2m 0s. 375px overflow 0; JSON-LD 3/3.

---

## Wiring (into the existing Education category)

Lighter than a new-category batch — no tag/hub creation.

1. **`index.html`** — 4 `tool-card` entries with `tag-education`, correct icon/name/desc/`data-name`; bump every count `35 tools`→`39`, `35 free`→`39`, stat bar, homepage FAQ, prose, meta description. Category count stays 7 (no change). Grep `grep -rn "35 tools\|35 free" index.html` → empty after.
2. **`scripts/build-hubs.cjs`** — append the 4 filenames to the `education-tools` entry's `CATS.tools`. Refresh its `metaDesc`/`intro`/`faq` copy to mention the new tools. **Also fix the stale header comment** on line 2 ("6 category hub pages" → "7").
3. **`scripts/wire-breadcrumbs.cjs`** — add the 4 files to the `education-tools` list in the `CAT` map.
4. **`add-article-schema.cjs`** — no change (education hub already excluded; the 4 new tool pages get `TechArticle` from the pipeline run).
5. **Run pipeline:** `node scripts/build-hubs.cjs` → `wire-breadcrumbs.cjs` → `optimize-fonts.cjs` → `add-article-schema.cjs`. Expect `7 pages, 39 tool references`; 4 tool pages gain the Education crumb + TechArticle.
6. **`sitemap.xml`** — 4 new `<url>` blocks; run `node scripts/update-sitemap.js` (verify manually — its `urlMap` is stale).
7. **`sitemap.html`** — add the 4 tools under the Education section; bump the Education `(N)` count and any total.
8. **Verify:** `grep -rn "35 tools\|35 free" *.html` → empty. Serve, 375px: `education-tools.html` shows 6 Education cards, 0px overflow; `index.html` shows the 4 new cards with the purple Education tag.

## Phasing

Build in two phases so Phase 1 ships before Phase 2 is built:

- **Phase 1:** Tool 1 (Test Grade) + Tool 2 (Words to Pages) — highest traffic. Then a wiring pass (35 → 37).
- **Phase 2:** Tool 3 (GPA⇄%) + Tool 4 (Reading Time). Then a second wiring pass (37 → 39).

This means **two wiring passes** (one per phase), each bumping counts incrementally. (Alternative: build all 4, wire once 35→39 — chosen at build time if the user prefers not to ship mid-batch.) Each tool is an independent page + commit; wiring depends on the tools of its phase existing first (build-hubs reads their homepage cards).

## Out of scope / non-overlap notes

- No "final grade needed" or "weighted category average" tool — `grade-calculator.html` already owns both.
- No general "high school GPA" tool — `gpa-calculator.html` already does honors/AP weighting + cumulative.
- No user-editable grade cutoffs (YAGNI for an SEO tool); the scale is fixed with an on-page "scales vary" note.
