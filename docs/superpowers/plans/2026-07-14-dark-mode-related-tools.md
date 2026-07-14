# Dark Mode + Related-Tool Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persisted, OS-aware dark mode and a curated related-tool widget across all 31 tool pages, homepage, and hub pages of the ClearlyCheck static site.

**Architecture:** Reuse the existing CSS-variable system — dark mode is a `[data-theme="dark"]` variable-override block plus a FOUC-safe head init script, a shared `theme.js` toggle handler, and a nav toggle button injected by an idempotent build script. The related widget is a curated JSON slug map rendered into each page by a second idempotent injector, styled by new CSS in the shared `calculator.css`. No backend, no deploy build step.

**Tech Stack:** Plain HTML/CSS/vanilla JS. Build scripts are CommonJS `.cjs` (package.json is `type:module`). Vitest for the one pure-logic test (map integrity). Node `fs`/`path` for injectors.

## Global Constraints

- No backend, no deploy build step — everything works as static files served as-is.
- All build scripts under `scripts/` MUST be `.cjs` (package.json is `type:module`).
- All injectors MUST be idempotent (marker-comment guarded) and safe to re-run.
- Reuse existing CSS variables from `assets/css/base.css`; do not fork the palette.
- Every tool page links `assets/css/base.css` + `assets/css/calculator.css`; put shared new CSS there, not per-page.
- AdSense-safe: no content-burying layout, no fake ad boxes.
- Mobile-verify at 375px before commit.
- Conventional Commits; attribution disabled globally (no Co-Authored-By trailer).
- Canonical tool metadata (title, category tag, icon) lives in `index.html` tool cards — read from there, never duplicate.
- The 31 tool files are every root `*.html` except: `index.html`, `about.html`, `contact.html`, `privacy-policy.html`, `terms-of-use.html`, `sitemap.html`, the six `*-calculators.html`/`*-tools.html` hub pages, and `google1d81c29365628a0c.html`.

---

## File Structure

**Create:**
- `assets/js/theme.js` — runtime toggle handler + OS-follow listener (linked once per page).
- `scripts/add-dark-mode.cjs` — injects head init script, nav toggle button, and `theme.js` `<script>` into every page.
- `scripts/tokenize-inline-colors.cjs` — replaces known hardcoded hex colors in inline styles with their CSS variables so dark mode works.
- `scripts/related-tools-map.json` — curated slug → related slugs map.
- `scripts/add-related-tools.cjs` — injects the "Related tools" section into each tool page.
- `tests/related-map.test.js` — vitest integrity test for the map.

**Modify:**
- `assets/css/base.css` — add `[data-theme="dark"]` variable overrides + `.theme-toggle` button styles.
- `assets/css/calculator.css` — add `[data-theme="dark"]` safety overrides + `.related-tools` widget styles.
- All 31 tool pages + `index.html` + 6 hub pages — receive injected markup (via scripts, not hand-edits).
- `CLAUDE.md` — extend the recurring-task checklist.

---

### Task 1: Dark palette variables + toggle button CSS

**Files:**
- Modify: `assets/css/base.css` (append)
- Modify: `assets/css/calculator.css` (append)

**Interfaces:**
- Produces: the `[data-theme="dark"]` scope that redefines every variable in `:root` (`--bg`, `--bg-card`, `--bg-dark`, `--text`, `--text-muted`, `--text-light`, `--border`, `--border-hover`, `--accent`, `--accent-light`, `--accent-hover`, `--accent-dark`, tag tints, `--shadow`, `--shadow-hover`). Produces `.theme-toggle` button class + sun/moon icon visibility rules consumed by Task 2's injected markup.

- [ ] **Step 1: Append the dark palette + toggle CSS to `base.css`**

Append to `assets/css/base.css`:

```css
/* ── Dark mode ─────────────────────────────────────────── */
[data-theme="dark"] {
  --bg: #141413;
  --bg-card: #1e1e1c;
  --bg-dark: #0a0a09;
  --text: #ededeb;
  --text-muted: #a8a7a2;
  --text-light: #78776f;
  --border: rgba(255,255,255,0.10);
  --border-hover: rgba(255,255,255,0.22);
  --accent: #3fa77a;
  --accent-light: #16241d;
  --accent-hover: #4fc08e;
  --accent-dark: #2f8560;
  --tag-finance: #16243d;      --tag-finance-text: #7fa8e6;
  --tag-safety: #3a1a16;       --tag-safety-text: #e69a8f;
  --tag-health: #16281c;       --tag-health-text: #7fd39a;
  --tag-productivity: #2e2410; --tag-productivity-text: #e6c766;
  --shadow: 0 1px 3px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.45);
  --shadow-hover: 0 4px 8px rgba(0,0,0,0.5), 0 12px 32px rgba(0,0,0,0.6);
}
html { transition: background-color 0.2s ease, color 0.2s ease; }

/* Theme toggle button (markup injected by add-dark-mode.cjs) */
.theme-toggle {
  display: inline-flex; align-items: center; justify-content: center;
  width: 38px; height: 38px; margin-left: 4px;
  background: none; border: 1.5px solid var(--border); border-radius: 50%;
  color: var(--text-muted); cursor: pointer; transition: color 0.15s, border-color 0.15s;
}
.theme-toggle:hover { color: var(--text); border-color: var(--border-hover); }
.theme-toggle .icon-sun { display: none; }
.theme-toggle .icon-moon { display: block; }
[data-theme="dark"] .theme-toggle .icon-sun { display: block; }
[data-theme="dark"] .theme-toggle .icon-moon { display: none; }
```

- [ ] **Step 2: Append a dark safety net to `calculator.css`**

Append to `assets/css/calculator.css`:

```css
/* ── Dark mode: reduce raw-white surfaces that slip through inline styles ── */
[data-theme="dark"] img { opacity: 0.92; }
[data-theme="dark"] ::selection { background: var(--accent-dark); color: #fff; }
```

- [ ] **Step 3: Visual check in a browser**

Run: `npx serve .` then open `bmi-calculator.html`. In devtools console run `document.documentElement.setAttribute('data-theme','dark')`.
Expected: page background goes dark, body text light, cards dark. (Inline-style result boxes may still look wrong — fixed in Task 3.)

- [ ] **Step 4: Commit**

```bash
git add assets/css/base.css assets/css/calculator.css
git commit -m "feat: add dark-mode CSS variables and theme-toggle styles"
```

---

### Task 2: Theme runtime + dark-mode injector

**Files:**
- Create: `assets/js/theme.js`
- Create: `scripts/add-dark-mode.cjs`
- Test: manual (grep assertions on output)

**Interfaces:**
- Consumes: `.theme-toggle` CSS from Task 1; the `data-theme` attribute contract.
- Produces: a `#theme-toggle` button in every page's `.nav-inner`; a pre-CSS head init script; a `theme.js` include. Sets/reads `localStorage.theme` (`"dark"` | `"light"`).

- [ ] **Step 1: Write `assets/js/theme.js`**

```js
(function () {
  var root = document.documentElement;
  var mq = window.matchMedia('(prefers-color-scheme: dark)');

  function stored() {
    try { return localStorage.getItem('theme'); } catch (e) { return null; }
  }
  function current() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }
  function apply(theme) {
    if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    var btn = document.getElementById('theme-toggle');
    if (btn) btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  }

  document.addEventListener('DOMContentLoaded', function () {
    apply(current());
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var next = current() === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem('theme', next); } catch (e) {}
        apply(next);
      });
    }
  });

  // Follow OS changes only until the user picks explicitly.
  mq.addEventListener('change', function (e) {
    if (!stored()) apply(e.matches ? 'dark' : 'light');
  });
})();
```

- [ ] **Step 2: Write `scripts/add-dark-mode.cjs`**

```js
/**
 * Injects dark-mode plumbing into every page, idempotently:
 *  1. A pre-CSS <head> init script that sets data-theme before first paint (no FOUC).
 *  2. A #theme-toggle button inside .nav-inner.
 *  3. A deferred <script src="/assets/js/theme.js">.
 * All three are marker-guarded; re-running is a no-op on already-processed pages.
 * Usage: node scripts/add-dark-mode.cjs
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const SKIP = new Set(['google1d81c29365628a0c.html']);
const pages = fs.readdirSync(root).filter(f => f.endsWith('.html') && !SKIP.has(f));

const INIT = `<!-- theme-init:start -->
<script>(function(){try{var s=localStorage.getItem('theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.setAttribute('data-theme','dark');}catch(e){}})();</script>
<!-- theme-init:end -->
`;

const TOGGLE = `<!-- theme-toggle:start --><button id="theme-toggle" class="theme-toggle" type="button" aria-label="Toggle dark mode" aria-pressed="false" title="Toggle dark mode"><svg class="icon-moon" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg><svg class="icon-sun" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg></button><!-- theme-toggle:end -->`;

const SCRIPT = `<!-- theme-script:start --><script src="/assets/js/theme.js" defer></script><!-- theme-script:end -->`;

let changed = 0, skipped = 0;

for (const file of pages) {
  const fp = path.join(root, file);
  let html = fs.readFileSync(fp, 'utf8');
  const before = html;

  // 1. Init script — immediately before the first stylesheet <link>.
  if (!html.includes('theme-init:start')) {
    html = html.replace(/(<link[^>]+rel="stylesheet")/, INIT + '$1');
  }

  // 2. Toggle button — before the </div> that closes .nav-inner (first </div></nav>).
  if (!html.includes('theme-toggle:start')) {
    html = html.replace(/(\s*)(<\/div>\s*<\/nav>)/, `$1  ${TOGGLE}$1$2`);
  }

  // 3. theme.js — before </body>.
  if (!html.includes('theme-script:start')) {
    html = html.replace(/(<\/body>)/, SCRIPT + '\n$1');
  }

  if (html !== before) { fs.writeFileSync(fp, html); changed++; }
  else skipped++;
}
console.log(`add-dark-mode: ${changed} changed, ${skipped} already done`);
```

- [ ] **Step 3: Run the injector**

Run: `node scripts/add-dark-mode.cjs`
Expected: `add-dark-mode: 38 changed, 0 already done` (31 tools + index + 6 hubs).

- [ ] **Step 4: Verify injection + idempotency with grep**

Run:
```bash
grep -L "theme-init:start" $(ls *.html | grep -v google1d81c29365628a0c) ; echo "---missing-init-above---"
grep -c "theme-toggle:start" bmi-calculator.html index.html finance-calculators.html
node scripts/add-dark-mode.cjs
```
Expected: no filenames listed before `---missing-init-above---`; each count is `1`; second run prints `0 changed, 38 already done`.

- [ ] **Step 5: Verify toggle works end-to-end**

Run: `npx serve .`, open `bmi-calculator.html`, click the toggle in the nav.
Expected: theme flips light↔dark, moon icon shows in light / sun in dark, choice survives reload. Confirm no white flash on reload with dark saved (hard refresh, cache disabled).

- [ ] **Step 6: Commit**

```bash
git add assets/js/theme.js scripts/add-dark-mode.cjs *.html
git commit -m "feat: add dark-mode toggle, FOUC-safe init, and injector script"
```

---

### Task 3: Tokenize hardcoded inline colors

**Files:**
- Create: `scripts/tokenize-inline-colors.cjs`
- Modify: all tool pages (via script)

**Interfaces:**
- Consumes: the dark palette variables from Task 1.
- Produces: tool pages whose inline-style colors reference variables, so result boxes and text remain legible in dark mode.

**Why:** Inline `<style>`/`style="..."` blocks hardcode structural colors (`#0f0f0e` text) and pale accent tints (`#e8f5ef`, `#e8f0fe`, etc.) used as result-box backgrounds. In dark mode, light text on a pale hardcoded background is unreadable. Mapping each known hex to its variable makes those surfaces theme-aware. Every hex below is only ever used for its mapped role on this site, so exact-string replacement is safe. `#ffffff`/`#fff` is ambiguous (could be a fixed icon fill), so it is replaced only in `background`/`background-color` contexts.

- [ ] **Step 1: Write `scripts/tokenize-inline-colors.cjs`**

```js
/**
 * Replaces known hardcoded hex colors in tool pages with their CSS variables,
 * so inline-styled surfaces respond to [data-theme="dark"]. Idempotent:
 * once a hex is a var(), re-running does nothing. #fff/#ffffff replaced only
 * in a background context to avoid touching fixed icon fills.
 * Usage: node scripts/tokenize-inline-colors.cjs
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const SKIP = new Set([
  'index.html', 'google1d81c29365628a0c.html',
]);
const pages = fs.readdirSync(root).filter(f => f.endsWith('.html') && !SKIP.has(f));

// exact hex (any casing) -> variable. Applied globally within the file.
const MAP = [
  ['#0f0f0e', 'var(--text)'],
  ['#6b6a66', 'var(--text-muted)'],
  ['#9a9994', 'var(--text-light)'],
  ['#f8f7f4', 'var(--bg)'],
  ['#e8f5ef', 'var(--accent-light)'],
  ['#e8f0fe', 'var(--tag-finance)'],
  ['#e6f4ea', 'var(--tag-health)'],
  ['#fff8e1', 'var(--tag-productivity)'],
  ['#fbebe9', 'var(--tag-safety)'],
  ['#fce8e6', 'var(--tag-safety)'],
  ['#1a6b4a', 'var(--accent)'],
  ['#145a3d', 'var(--accent-hover)'],
];

let changed = 0, skipped = 0;
for (const file of pages) {
  const fp = path.join(root, file);
  let html = fs.readFileSync(fp, 'utf8');
  const before = html;

  for (const [hex, v] of MAP) {
    html = html.split(hex).join(v);
    html = html.split(hex.toUpperCase()).join(v);
  }
  // background-context white only
  html = html.replace(/(background(?:-color)?\s*:\s*)#fff(?:fff)?\b/gi, '$1var(--bg-card)');

  if (html !== before) { fs.writeFileSync(fp, html); changed++; }
  else skipped++;
}
console.log(`tokenize-inline-colors: ${changed} changed, ${skipped} unchanged`);
```

- [ ] **Step 2: Run it**

Run: `node scripts/tokenize-inline-colors.cjs`
Expected: `tokenize-inline-colors: N changed, M unchanged` (most tool pages changed).

- [ ] **Step 3: Verify no known structural hex remains + idempotency**

Run:
```bash
grep -rn "#0f0f0e\|#e8f5ef\|#e8f0fe" *.html | grep -v index.html || echo "clean"
node scripts/tokenize-inline-colors.cjs
```
Expected: `clean`; second run prints `0 changed`.

- [ ] **Step 4: Visual regression check, light + dark, at 375px**

Run: `npx serve .`. Check `pet-food-calculator.html`, `bmi-calculator.html`, `compound-interest-calculator.html` in both themes at 375px.
Expected: result boxes and text legible in both themes; no light-on-light or dark-on-dark. Light mode looks unchanged from before (variables resolve to the original hexes).

- [ ] **Step 5: Commit**

```bash
git add scripts/tokenize-inline-colors.cjs *.html
git commit -m "fix: tokenize hardcoded inline colors for dark-mode support"
```

---

### Task 4: Curated related-tools map + integrity test

**Files:**
- Create: `scripts/related-tools-map.json`
- Test: `tests/related-map.test.js`

**Interfaces:**
- Produces: a JSON object, every key a tool slug (filename without `.html`), value an array of 2–3 related slugs. Consumed by Task 5's injector and the test.

- [ ] **Step 1: Write the failing test `tests/related-map.test.js`**

```js
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const map = JSON.parse(readFileSync(join(root, 'scripts/related-tools-map.json'), 'utf8'));

const NON_TOOL = new Set([
  'index', 'about', 'contact', 'privacy-policy', 'terms-of-use', 'sitemap',
  'finance-calculators', 'health-calculators', 'productivity-tools',
  'utility-tools', 'pet-tools', 'education-tools', 'google1d81c29365628a0c',
]);
const tools = readdirSync(root)
  .filter(f => f.endsWith('.html'))
  .map(f => f.replace(/\.html$/, ''))
  .filter(s => !NON_TOOL.has(s));

describe('related-tools-map', () => {
  it('has an entry for every tool page', () => {
    for (const t of tools) expect(map[t], `missing map entry: ${t}`).toBeDefined();
  });
  it('every key is a real tool', () => {
    for (const k of Object.keys(map)) expect(tools, `stale key: ${k}`).toContain(k);
  });
  it('each entry has 2–3 valid, non-self related slugs', () => {
    for (const [k, rel] of Object.entries(map)) {
      expect(rel.length, `${k} count`).toBeGreaterThanOrEqual(2);
      expect(rel.length, `${k} count`).toBeLessThanOrEqual(3);
      expect(new Set(rel).size, `${k} has dupes`).toBe(rel.length);
      for (const r of rel) {
        expect(r, `${k} -> self`).not.toBe(k);
        expect(tools, `${k} -> unknown ${r}`).toContain(r);
      }
    }
  });
});
```

- [ ] **Step 2: Run it, verify it fails**

Run: `npm test -- related-map`
Expected: FAIL — `related-tools-map.json` does not exist (ENOENT).

- [ ] **Step 3: Write `scripts/related-tools-map.json`**

```json
{
  "debt-free-calculator": ["compound-interest-calculator", "can-i-afford-this", "net-worth-calculator"],
  "net-worth-calculator": ["debt-free-calculator", "compound-interest-calculator", "salary-converter"],
  "salary-converter": ["income-tax-calculator", "overtime-pay-calculator", "net-worth-calculator"],
  "can-i-afford-this": ["mortgage-calculator", "rent-vs-buy", "debt-free-calculator"],
  "rent-vs-buy": ["mortgage-calculator", "can-i-afford-this", "compound-interest-calculator"],
  "overtime-pay-calculator": ["salary-converter", "income-tax-calculator", "time-card-calculator"],
  "tip-calculator": ["sales-tax-calculator", "percentage-calculator", "meeting-cost-calculator"],
  "compound-interest-calculator": ["debt-free-calculator", "net-worth-calculator", "mortgage-calculator"],
  "income-tax-calculator": ["salary-converter", "sales-tax-calculator", "overtime-pay-calculator"],
  "sales-tax-calculator": ["tip-calculator", "income-tax-calculator", "percentage-calculator"],
  "mortgage-calculator": ["rent-vs-buy", "can-i-afford-this", "compound-interest-calculator"],
  "bmi-calculator": ["calorie-calculator", "height-calculator", "age-calculator"],
  "height-calculator": ["bmi-calculator", "age-calculator", "shoe-size-converter"],
  "calorie-calculator": ["bmi-calculator", "height-calculator", "pet-food-calculator"],
  "due-date-calculator": ["age-calculator", "date-duration-calculator", "calorie-calculator"],
  "timezone-planner": ["meeting-cost-calculator", "time-card-calculator", "date-duration-calculator"],
  "time-card-calculator": ["overtime-pay-calculator", "meeting-cost-calculator", "salary-converter"],
  "meeting-cost-calculator": ["time-card-calculator", "timezone-planner", "salary-converter"],
  "date-duration-calculator": ["age-calculator", "due-date-calculator", "timezone-planner"],
  "word-count-reading-time": ["grade-calculator", "gpa-calculator", "percentage-calculator"],
  "age-calculator": ["date-duration-calculator", "due-date-calculator", "pet-age-calculator"],
  "password-generator": ["percentage-calculator", "unit-converter", "word-count-reading-time"],
  "percentage-calculator": ["sales-tax-calculator", "tip-calculator", "grade-calculator"],
  "unit-converter": ["percentage-calculator", "height-calculator", "shoe-size-converter"],
  "bra-size-calculator": ["shoe-size-converter", "height-calculator", "bmi-calculator"],
  "shoe-size-converter": ["unit-converter", "bra-size-calculator", "height-calculator"],
  "pet-age-calculator": ["pet-food-calculator", "pet-cost-calculator", "age-calculator"],
  "pet-food-calculator": ["pet-age-calculator", "pet-cost-calculator", "calorie-calculator"],
  "pet-cost-calculator": ["pet-food-calculator", "pet-age-calculator", "can-i-afford-this"],
  "gpa-calculator": ["grade-calculator", "percentage-calculator", "word-count-reading-time"],
  "grade-calculator": ["gpa-calculator", "percentage-calculator", "word-count-reading-time"]
}
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `npm test -- related-map`
Expected: PASS (all 3 tests green). If a slug mismatch fails, fix the map to match actual filenames.

- [ ] **Step 5: Commit**

```bash
git add scripts/related-tools-map.json tests/related-map.test.js
git commit -m "feat: add curated related-tools map with integrity test"
```

---

### Task 5: Related-tools widget CSS + injector

**Files:**
- Modify: `assets/css/calculator.css` (append widget styles)
- Create: `scripts/add-related-tools.cjs`
- Modify: 31 tool pages (via script)

**Interfaces:**
- Consumes: `scripts/related-tools-map.json` (Task 4); tool metadata parsed from `index.html`; dark palette (Task 1).
- Produces: a `<!-- related:start -->…<!-- related:end -->` section before `<footer>` on each tool page.

- [ ] **Step 1: Append widget CSS to `assets/css/calculator.css`**

```css
/* ── Related tools widget ──────────────────────────────── */
.related-tools { max-width: 1100px; margin: 48px auto 0; padding: 0 24px; }
.related-heading { font-family: 'Roboto', sans-serif; font-size: 20px; font-weight: 800; color: var(--text); margin-bottom: 16px; }
.related-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
.related-card { display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-sm); text-decoration: none; transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s; }
.related-card:hover { border-color: var(--border-hover); box-shadow: var(--shadow); transform: translateY(-2px); }
.related-icon { font-size: 22px; line-height: 1; flex-shrink: 0; }
.related-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.related-name { font-family: 'Roboto', sans-serif; font-weight: 700; font-size: 15px; color: var(--text); }
.related-tag { font-size: 12px; color: var(--text-muted); }
@media (max-width: 480px) { .related-tools { padding: 0 16px; } }
```

- [ ] **Step 2: Write `scripts/add-related-tools.cjs`**

```js
/**
 * Injects a "Related tools" section before <footer> on each tool page,
 * driven by scripts/related-tools-map.json. Tool titles/icons are read from
 * index.html (single source of truth). Idempotent: the section is regenerated
 * in place on every run. Warns (and exits non-zero) if any tool page lacks a
 * map entry so curation debt surfaces.
 * Usage: node scripts/add-related-tools.cjs
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const map = JSON.parse(fs.readFileSync(path.join(root, 'scripts/related-tools-map.json'), 'utf8'));

// Parse index.html tool cards -> slug -> { name, icon }
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const meta = {};
const cardRe = /<a class="tool-card" href="([^"]+)\.html"[\s\S]*?<div class="tool-icon"[^>]*>(.*?)<\/div>[\s\S]*?<div class="tool-name">(.*?)<\/div>/g;
let m;
while ((m = cardRe.exec(index)) !== null) {
  meta[m[1]] = { icon: m[2].trim(), name: m[3].trim() };
}

const TOOLS = Object.keys(map);
let changed = 0, missing = [];

for (const slug of TOOLS) {
  const file = `${slug}.html`;
  const fp = path.join(root, file);
  if (!fs.existsSync(fp)) { missing.push(`file not found: ${file}`); continue; }

  const cards = map[slug].map(rel => {
    const info = meta[rel];
    if (!info) { missing.push(`${slug}: no index metadata for ${rel}`); return ''; }
    return `    <a class="related-card" href="${rel}.html"><span class="related-icon">${info.icon}</span><span class="related-text"><span class="related-name">${info.name}</span><span class="related-tag">Related tool</span></span></a>`;
  }).filter(Boolean).join('\n');

  const section =
`<!-- related:start -->
<section class="related-tools" aria-labelledby="related-heading">
  <h2 id="related-heading" class="related-heading">Related tools</h2>
  <div class="related-grid">
${cards}
  </div>
</section>
<!-- related:end -->
`;

  let html = fs.readFileSync(fp, 'utf8');
  const before = html;
  if (html.includes('related:start')) {
    html = html.replace(/<!-- related:start -->[\s\S]*?<!-- related:end -->\n?/, section);
  } else {
    html = html.replace(/(<footer)/, section + '$1');
  }
  if (html !== before) { fs.writeFileSync(fp, html); changed++; }
}

// Warn on any tool page with no map entry.
const NON_TOOL = new Set(['index','about','contact','privacy-policy','terms-of-use','sitemap','finance-calculators','health-calculators','productivity-tools','utility-tools','pet-tools','education-tools','google1d81c29365628a0c']);
const allTools = fs.readdirSync(root).filter(f => f.endsWith('.html')).map(f => f.replace(/\.html$/, '')).filter(s => !NON_TOOL.has(s));
for (const t of allTools) if (!map[t]) missing.push(`no map entry for tool: ${t}`);

console.log(`add-related-tools: ${changed} pages updated`);
if (missing.length) { console.error('WARNINGS:\n' + missing.join('\n')); process.exit(1); }
```

- [ ] **Step 3: Run it**

Run: `node scripts/add-related-tools.cjs`
Expected: `add-related-tools: 31 pages updated`, no WARNINGS, exit 0. If it warns about missing index metadata, the tool card in `index.html` uses different markup — inspect and adjust the `cardRe` regex, do not weaken the warning.

- [ ] **Step 4: Verify injection, links, idempotency**

Run:
```bash
grep -c "related:start" bmi-calculator.html pet-food-calculator.html gpa-calculator.html
node -e "const fs=require('fs');const re=/related-card href=\"([^\"]+)\"/g;let bad=0;for(const f of fs.readdirSync('.').filter(x=>x.endsWith('.html'))){const h=fs.readFileSync(f,'utf8');let m;while((m=/class=\"related-card\" href=\"([^\"]+)\"/g.exec(h))){if(!fs.existsSync(m[1]))console.log(f,'->',m[1],'404'),bad++;}}console.log(bad?'BAD':'all related links resolve');"
node scripts/add-related-tools.cjs
```
Expected: each count `1`; `all related links resolve`; second run reports `31 pages updated` with identical output and no diff (verify `git diff --stat` is empty after).

- [ ] **Step 5: Visual check, light + dark, 375px**

Run: `npx serve .`, open `bmi-calculator.html`, scroll to before footer.
Expected: "Related tools" section with 3 cards (Calorie, Height, Age), styled like homepage cards, legible in both themes, single column at 375px.

- [ ] **Step 6: Commit**

```bash
git add assets/css/calculator.css scripts/add-related-tools.cjs *.html
git commit -m "feat: add related-tools widget and injector across tool pages"
```

---

### Task 6: Docs + full-site verification

**Files:**
- Modify: `CLAUDE.md`
- Test: full manual + automated sweep

**Interfaces:**
- Consumes: everything above.

- [ ] **Step 1: Extend the CLAUDE.md recurring-task checklist**

In `CLAUDE.md`, under "THE recurring bug: nav/count sync", add after the existing list item 5:

```markdown
6. Add the new slug (and 2–3 related slugs) to `scripts/related-tools-map.json`, then re-run `node scripts/add-related-tools.cjs` (warns if any tool lacks an entry).
7. Run `node scripts/add-dark-mode.cjs` and `node scripts/tokenize-inline-colors.cjs` on the new page (both idempotent, safe sitewide).
```

- [ ] **Step 2: Full automated sweep**

Run:
```bash
npm test
node scripts/add-dark-mode.cjs && node scripts/tokenize-inline-colors.cjs && node scripts/add-related-tools.cjs
git status --short
```
Expected: vitest all green; the three injectors report `0 changed` / no new diff (proves idempotency after commits); `git status` clean.

- [ ] **Step 3: Cross-page manual matrix at 375px + desktop**

Verify light AND dark on: `index.html`, `finance-calculators.html` (hub), `bmi-calculator.html` (legacy shared-JS), `pet-food-calculator.html` (recent self-contained), `password-generator.html`.
Expected: toggle present in nav on all; no FOUC on reload with dark saved; related widget only on the 31 tool pages (not homepage/hubs); calculators still compute correctly.

- [ ] **Step 4: a11y spot-check**

In one tool page: Tab to the toggle, activate with Enter/Space, confirm `aria-pressed` flips (devtools). Confirm dark-mode body text vs background meets WCAG AA (devtools contrast check).
Expected: keyboard-operable, `aria-pressed` accurate, contrast ≥ 4.5:1 for body text.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: document dark-mode and related-tools maintenance steps"
```

---

## Self-Review Notes

- **Spec coverage:** dark palette (T1), FOUC init + toggle + OS-follow (T2), inline-color audit (T3), curated cross-category map (T4), widget before footer reusing card style via shared CSS (T5), CLAUDE.md checklist + verification incl. FOUC/no-404/a11y/375px (T6). All spec sections mapped.
- **Naming consistency:** markers `theme-init`, `theme-toggle`, `theme-script`, `related` used identically across injectors and greps; `#theme-toggle` id matches `theme.js` `getElementById`; `related-tools-map.json` path identical in T4 test, T5 injector, T6 docs.
- **Idempotency** asserted by re-run steps in T2/T3/T5 and the T6 sweep.
- **Note for implementer:** if `add-dark-mode.cjs`'s `.nav-inner` regex (`</div>\s*</nav>`) matches the wrong `</div>` on the homepage (which has a richer nav), inspect `index.html`'s nav and tighten the pattern before committing T2 — do not force it.
