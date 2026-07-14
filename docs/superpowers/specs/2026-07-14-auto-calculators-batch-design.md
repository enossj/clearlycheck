# Design: Auto Calculators Batch (7th category)

**Date:** 2026-07-14
**Status:** Approved for planning
**Goal:** Grow organic search traffic by adding a high-volume Auto/Vehicle category.

## Summary

Add a new **Auto** category (7th) to ClearlyCheck with four self-contained, browser-only
calculators. Chosen for SEO: auto-loan and fuel-cost are top-tier calculator search terms.
The category is finance-adjacent (not medical YMYL), so it reuses the existing finance
disclaimer pattern and carries lower AdSense risk than Health. All four tools cross-link,
and Auto Loan threads into the existing Finance tools (debt-free, can-i-afford-this,
rent-vs-buy).

Takes the tool count **31 → 35** and categories **6 → 7**.

## Constraints (inherited from CLAUDE.md)

- Self-contained `*.html` at repo root: inline `<style>`, inline `<script>`, three JSON-LD blocks.
- No backend, no build step for deploy, **no API keys** — all logic is client-side math.
- AdSense-safe: real explanatory content, no "Advertisement" placeholder divs.
- YMYL-light (finance): Auto Loan + Lease vs Buy carry an informational disclaimer and a
  "Sources & method" section. Fuel Cost + MPG are non-YMYL (method note only).
- New tools do NOT use `assets/js/calculators/` modules, so they are NOT covered by Vitest.
  Verification is manual (math spot-check + browser).

## Tools

| Tool | File | Tag | Disclaimer |
|------|------|-----|-----------|
| Auto Loan / Car Payment | `auto-loan-calculator.html` | Auto | finance-light + sources |
| Gas / Fuel Cost | `fuel-cost-calculator.html` | Auto | method note only |
| Fuel Economy (MPG) | `mpg-calculator.html` | Auto | method note only |
| Car Lease vs Buy | `lease-vs-buy-calculator.html` | Auto | finance-light + sources |

### 1. Auto Loan / Car Payment — `auto-loan-calculator.html`

**Inputs:** vehicle price, down payment, trade-in value, sales-tax %, APR %, term (months).

**Math:**
- Taxable amount = vehicle price (simplification: tax on full price, not price − trade-in;
  trade-in tax credit is state-dependent and out of scope for v1 — note this in the method
  section so it is an explicit, documented choice, not a hidden bug).
- Amount financed = vehicle price + (price × taxRate) − down payment − trade-in.
- Monthly rate r = APR / 1200. Term n months.
- If r = 0: payment = financed / n. Else: payment = financed × r / (1 − (1 + r)^−n).
- Total paid = payment × n. Total interest = total paid − financed.

**Outputs:** monthly payment, total interest, total loan cost, amount financed.

**Edge cases:** APR = 0 (no-interest promo), down + trade-in ≥ price+tax (financed ≤ 0 →
show "no financing needed"), term = 0 (invalid, block).

### 2. Gas / Fuel Cost — `fuel-cost-calculator.html`

**Inputs:** trip distance, fuel efficiency, fuel price, round-trip toggle, optional split
across N people. Unit-aware: distance mi/km, efficiency MPG or L/100km, price per gal/L.

**Math (US units):** gallons = distance / MPG; cost = gallons × pricePerGal.
**Math (metric):** litres = distance × (L100 / 100); cost = litres × pricePerL.
Round-trip doubles distance. Per-person = cost / N.

**Outputs:** total fuel cost, fuel used (gal or L), per-person share.

**Edge cases:** MPG or L/100km = 0 (block, divide-by-zero), N < 1 (default 1).

### 3. Fuel Economy (MPG) — `mpg-calculator.html`

**Inputs:** miles (or km) driven, fuel used (gallons or litres). Optional fuel price for
cost-per-mile.

**Math:** MPG = miles / gallons. Converter both directions:
- L/100km = 235.215 / MPG(US); MPG(US) = 235.215 / L/100km.
- km/L = MPG(US) × 0.425144.
Cost per mile = pricePerGal / MPG (when price given).

**Outputs:** economy in MPG, L/100km, km/L; optional cost per mile/km.

**Edge cases:** gallons = 0 (block).

### 4. Car Lease vs Buy — `lease-vs-buy-calculator.html`

**Inputs:**
- Lease: monthly lease payment, lease term (months), drive-off/down + fees.
- Buy: vehicle price, APR %, loan term (months), down payment, estimated resale value at
  the end of the lease-term horizon.

**Math (compared over the lease term H months):**
- Lease total = driveOff + monthlyLease × H.
- Buy total over H = downPayment + (loanPayment × min(H, loanTerm)) − resaleValue.
  (loanPayment via the amortization formula from tool 1.) If loanTerm < H, the loan is
  paid off before H; only min(H, loanTerm) payments occur.
- Net difference = buyTotal − leaseTotal. Report the cheaper option and the delta.

**Outputs:** lease total cost, buy net cost over horizon, cheaper option + savings.

**Edge cases:** resale ≥ buy outlay (buy net ≤ 0 → "buying builds equity"), APR = 0.

**Note:** simplified — ignores the time value of money, mileage overage fees, and
maintenance. Documented in the method section. Carries the finance disclaimer.

## Nav / hub integration (the count-sync checklist)

Adding the category means updating ALL of the following together:

1. **`scripts/build-hubs.cjs`** — add an `Auto` entry to `CATS`: `slug: 'auto-calculators'`,
   `label: 'Auto'`, `pill: '🚗 Auto'`, title, h1, metaDesc, intro, `disclaimer` (finance-light
   text), 3 FAQs, `tools: [4 files]`. Add `.tag-auto` CSS to the render template.
2. **New tag color** — `--tag-auto: #e8eef7; --tag-auto-text: #2d5a8a;` (steel blue, distinct
   from finance `#1a4fa0`). Add the `--tag-auto*` vars + `.tag-auto` rule everywhere tags are
   styled: `build-hubs.cjs` render, `index.html`, and each of the 4 new tool pages.
3. **`index.html`** — 4 new `tool-card`s with `tag-auto`; add an `Auto` chip to the
   `.cat-hub` "Browse by category" row (links `auto-calculators.html`); bump every count:
   **31 → 35 tools**, **6 → 7 categories**, stat bar, homepage FAQ, prose, meta description.
4. **`sitemap.html`** — new Auto section with the 4 tool entries + the category `(4)` count.
5. **`sitemap.xml`** — add 4 new `<url>` blocks + the hub `<url>` by hand. The patched
   `scripts/update-sitemap.js` (now derives its map from disk) then bumps lastmod.
6. **`scripts/wire-breadcrumbs.cjs`** — add `auto-calculators` → the 4 files in the `CAT` map.
7. **`scripts/add-article-schema.cjs`** — add `auto-calculators.html` to the `EXCLUDE` set
   (hubs are CollectionPages, not TechArticles; the other 6 hubs are already excluded).
8. **Run order:** `build-hubs.cjs` → `wire-breadcrumbs.cjs` → `optimize-fonts.cjs` →
   `add-article-schema.cjs` (the last three on the 4 new pages).
9. **Grep guard:** `grep -rn "31 tools\|31 free\|6 categories" *.html` before and after to
   confirm no stale counts remain.

## Per-page anatomy (each tool)

Every new tool page must include:
- Unique `<title>` + meta description.
- Three JSON-LD scripts: `WebApplication`, `FAQPage`, `BreadcrumbList`
  (add-article-schema.cjs adds the 4th `TechArticle` afterward).
- Byline + last-updated: `<div class="page-meta">Built &amp; reviewed by
  <a href="/about.html">Enos</a>, ClearlyCheck · Last updated <DATE></div>`.
- The interactive calculator (inline JS — verify the math against the formulas above).
- `<article class="article">` explainer prose.
- FAQ section matching the FAQPage schema Q&As.
- "Sources & method" section (Auto Loan + Lease vs Buy). Finance disclaimer: "informational
  estimates, not financial advice."
- No fake ad-placeholder boxes.

Build by copying a recent finance page (e.g. `mortgage-calculator.html`) for the loan/lease
tools and a lighter utility page for fuel/MPG.

## Verification

1. **Math spot-check** each tool against a hand-worked example (e.g. $30k car, 10% down,
   6% APR, 60 mo → known monthly payment).
2. **375px overflow probe** — the same `scrollWidth − clientWidth` browser check used on the
   hub pages; expect 0px overflow and a single-column grid on the hub.
3. **JSON-LD parse-check** — `JSON.parse` every `application/ld+json` block on each page.
4. **Count-sync grep** — step 8 above.
5. **Hub render** — confirm `build-hubs.cjs` writes `auto-calculators.html` with 4 cards.

## Out of scope (v1)

- Trade-in sales-tax credit (state-dependent).
- Time value of money / NPV in Lease vs Buy.
- Live fuel prices, live interest rates, currency conversion (all require an API + backend
  proxy — would break the browser-only architecture).
- Insurance, depreciation curves, registration fees.

## Sequencing

Four tools, one category. Buildable as a single batch. Suggested commit order (one tool per
commit per CLAUDE.md convention), category wiring last:

1. `feat: add auto loan calculator (32nd tool)`
2. `feat: add fuel cost calculator (33rd tool)`
3. `feat: add MPG / fuel economy calculator (34th tool)`
4. `feat: add car lease vs buy calculator (35th tool)`
5. `feat: add Auto category hub + nav/count sync`
