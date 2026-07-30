# CLAUDE.md — ClearlyCheck

Guidance for Claude Code when working in this repo.

## What this is

Static site of free browser-only calculators/tools. **No backend, no build step for deploy** — plain HTML/CSS/JS served as-is. Live at [clearlycheck.com](https://clearlycheck.com). Repo: `github.com/enossj/clearlycheck`. Default branch: `main` (deploys directly — treat `main` as production).

Currently **39 tools** (Finance 11, Productivity 5, Utility 6, Health 4, Auto 4, Pet 3, Education 6). AdSense context: the site was rejected once for "low value content" and has **not been reapplied** since; the auto-ads script is on every page but no ads serve. Phase 1 fixed E-E-A-T/compliance gaps, Phase 2 grew the tool count. Keep every new page AdSense-safe (see Conventions).

**Traffic reality (Search Console, 3 months to 2026-07-17):** 77 impressions, 2 clicks, average position 31.1. The site is effectively invisible in search. There is **no analytics** installed (no gtag/Plausible/umami) — Search Console is the only data source.

## Stack & layout

- Each tool is a **self-contained `*.html`** at repo root: inline `<style>`, inline `<script>`, three JSON-LD blocks. New tools do NOT use the shared `assets/js/calculators/` modules.
- Legacy tools (debt, salary, timezone, bmi, age) DO import from `assets/js/calculators/*.js` and are the only ones covered by Vitest tests.
- Shared: `assets/css/base.css`, `assets/css/calculator.css`, `assets/js/faq.js`, `assets/js/contact*.js`, `assets/favicon.svg`.
- Non-tool pages: `index.html` (homepage + tool grid), `about.html`, `contact.html`, `privacy-policy.html`, `terms-of-use.html`, `sitemap.html`, `sitemap.xml`, `robots.txt`, `ads.txt`.
- **Category hub pages** (7, one per category): `finance-calculators.html`, `health-calculators.html`, `productivity-tools.html`, `utility-tools.html`, `auto-calculators.html`, `pet-tools.html`, `education-tools.html`. Hub-and-spoke internal linking: each hub lists its category's tool cards (down), links the other 5 hubs + all-tools (mesh); each tool's breadcrumb is **Home › Tools › Category › Tool** linking back to its hub (up); homepage has a "Browse by category" `.cat-hub` row (index→hubs). Hubs are **generated** — never hand-edit them.

## Build scripts (`scripts/`, all `.cjs` — package.json is `type:module`)

- `build-hubs.cjs` — regenerates all 7 hub pages. Pulls tool cards from `index.html`; per-category intro/FAQ copy lives in its `CATS` config. **Re-run after adding a tool or editing a homepage card.**
- `wire-breadcrumbs.cjs` — inserts the category crumb into every tool page's breadcrumb (visible + `BreadcrumbList` JSON-LD). Idempotent; run after adding a tool (add the new file to its category in the script's `CAT` map first).
- `optimize-fonts.cjs` — converts Google Fonts `<link>` to async load + strips unused `opsz` axis. Idempotent; run on any new page.
- `add-article-schema.cjs` — injects `TechArticle` schema per tool (`datePublished` from git first-commit, `dateModified` from the page's "Last updated" date, `author`→Person `@id`, `publisher`→Org `@id`+logo). Idempotent; run on any new tool. Author entity `@id` `#enos` is defined on `about.html`; Organization `@id` `#organization` on `index.html`.
- `add-analytics.cjs` — injects the Cloudflare Web Analytics beacon (cookieless RUM, token `94c2b9e...`) before `</head>` on every root `*.html`. Idempotent (skips pages already carrying the beacon host); run on any new page. Skips `google*.html` verification file (no `<head>`).
- `update-sitemap.js` — `lastmod` bumper; `urlMap` is stale/partial, verify manually.

**Analytics/ads note:** Cloudflare Web Analytics is the traffic instrument (Search Console only counts Google-search clicks; there is no GA). The `meeting-cost-calculator.html` page has its AdSense script **removed** on purpose — it's the link-building landing page and needs a clean "no cookies, no third-party ad tracking" story for Reddit/HN. All other pages keep the auto-ads script. Note the meeting page still loads Google Fonts, so it is not literally "zero third-party requests."

## Commands

```bash
npx serve .        # preview locally
npm install        # once, for tests
npm test           # vitest run — covers legacy calculator modules only
```

## THE recurring bug: nav/count sync

Adding or renaming a tool means updating **all** of these together, or the site goes inconsistent:

1. `index.html` — tool grid card (correct category tag) **and** every count reference: stat bar, FAQ list, prose, meta description.
2. `sitemap.html` — human sitemap entry under the right category (bump the category `(N)` count too).
3. `sitemap.xml` — `<url>` block (run `node scripts/update-sitemap.js` note: its `urlMap` is stale/partial — verify manually).
4. Any "N tools" text anywhere else.
5. Add the new file to its category in `scripts/wire-breadcrumbs.cjs` (`CAT` map) + `scripts/build-hubs.cjs` (`CATS.tools`), then re-run both, plus `optimize-fonts.cjs`.

Always grep for the old count (e.g. `grep -rn "39 tools\|39 free" *.html`) before/after.

## Tool page anatomy (copy an existing recent page, e.g. `pet-food-calculator.html`)

Every tool page must have:
- Unique `<title>` + meta description.
- **Three** JSON-LD scripts: `WebApplication`, `FAQPage`, `BreadcrumbList`.
- Author byline + last-updated date: `<div class="page-meta">Built &amp; reviewed by <a href="/about.html">Enos</a>, ClearlyCheck · Last updated <DATE></div>`.
- The interactive calculator (inline JS — verify the math).
- `<article class="article">` explainer prose.
- FAQ section (matching the FAQPage schema Q&As).
- "Sources & method" citations — **required** for YMYL topics (finance/tax/mortgage/health/medical/pet). Carry a clear "not medical/financial/veterinary advice" disclaimer on those.
- **No fake ad-placeholder boxes** — a rejected-for-ads signal. Never add "Advertisement" placeholder divs.

## Categories

Finance · Health · Productivity · Utility · Auto · Pet · Education. Seven categories, used **identically** in the homepage grid tags (`tag-<category>`) and sitemap.html sections — keep them in sync when adding/moving a tool. Utility is the catch-all (age, password, percentage, unit, bra-size, shoe-size); there is no separate "Other" bucket. Bra-size lives under Utility, not Health. Auto (auto-loan, fuel-cost, mpg, lease-vs-buy) is a finance-adjacent category — the auto-loan and lease-vs-buy pages carry the YMYL finance disclaimer + Sources & method; fuel-cost and mpg get a method note only.

## Conventions

- Mobile-verify at 375px width before committing.
- Commit each tool individually. Conventional Commits: `feat: add X calculator (Nth tool)`. Attribution disabled globally — no Co-Authored-By trailer.
- Match the existing page's style/idiom; keep pages self-contained.

## Style

Caveman mode is active in this environment (terse replies). Does NOT apply to file contents, code, or commit messages — write those normally.
