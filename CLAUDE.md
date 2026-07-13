# CLAUDE.md — ClearlyCheck

Guidance for Claude Code when working in this repo.

## What this is

Static site of free browser-only calculators/tools. **No backend, no build step for deploy** — plain HTML/CSS/JS served as-is. Live at [clearlycheck.com](https://clearlycheck.com). Repo: `github.com/enossj/clearlycheck`. Default branch: `main` (deploys directly — treat `main` as production).

Currently **31 tools** (Finance 11, Productivity 5, Utility 6, Health 4, Pet 3, Education 2). AdSense context: site was rejected once for "low value content"; Phase 1 fixed E-E-A-T/compliance gaps, Phase 2 grew the tool count. Keep every new page AdSense-safe (see Conventions).

## Stack & layout

- Each tool is a **self-contained `*.html`** at repo root: inline `<style>`, inline `<script>`, three JSON-LD blocks. New tools do NOT use the shared `assets/js/calculators/` modules.
- Legacy tools (debt, salary, timezone, bmi, age) DO import from `assets/js/calculators/*.js` and are the only ones covered by Vitest tests.
- Shared: `assets/css/base.css`, `assets/css/calculator.css`, `assets/js/faq.js`, `assets/js/contact*.js`, `assets/favicon.svg`.
- Non-tool pages: `index.html` (homepage + tool grid), `about.html`, `contact.html`, `privacy-policy.html`, `terms-of-use.html`, `sitemap.html`, `sitemap.xml`, `robots.txt`, `ads.txt`.

## Commands

```bash
npx serve .        # preview locally
npm install        # once, for tests
npm test           # vitest run — covers legacy calculator modules only
```

## THE recurring bug: nav/count sync

Adding or renaming a tool means updating **all** of these together, or the site goes inconsistent:

1. `index.html` — tool grid card (correct category tag) **and** every count reference: stat bar, FAQ list, prose, meta description.
2. `sitemap.html` — human sitemap entry under the right category.
3. `sitemap.xml` — `<url>` block (run `node scripts/update-sitemap.js` note: its `urlMap` is stale/partial — verify manually).
4. Any "N tools" text anywhere else.

Always grep for the old count (e.g. `grep -rn "31 tools\|31 free" *.html`) before/after.

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

Finance · Health · Productivity · Utility · Pet · Education. Six categories, used **identically** in the homepage grid tags (`tag-<category>`) and sitemap.html sections — keep them in sync when adding/moving a tool. Utility is the catch-all (age, password, percentage, unit, bra-size, shoe-size); there is no separate "Other" bucket. Bra-size lives under Utility, not Health.

## Conventions

- Mobile-verify at 375px width before committing.
- Commit each tool individually. Conventional Commits: `feat: add X calculator (Nth tool)`. Attribution disabled globally — no Co-Authored-By trailer.
- Match the existing page's style/idiom; keep pages self-contained.

## Style

Caveman mode is active in this environment (terse replies). Does NOT apply to file contents, code, or commit messages — write those normally.
