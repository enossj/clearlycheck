/**
 * Injects dark-mode plumbing into every page, idempotently:
 *  1. A pre-CSS <head> init script that sets data-theme before first paint (no FOUC).
 *  2. A #theme-toggle button inside .nav-inner.
 *  3. A deferred <script src="/assets/js/theme.js">.
 * All three are marker-guarded; re-running is a no-op on already-processed pages.
 *
 * The toggle is inserted right before .nav-inner's OWN closing </div> (matched
 * non-greedily from the nav-inner opening tag), not before the nearest
 * "</div></nav>". index.html's nav has a second sibling <div class="mobile-nav-panel">
 * between .nav-inner and </nav>, so anchoring on "</div></nav>" would have landed
 * the toggle inside/after the mobile panel instead of inside .nav-inner.
 *
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

// Matches from the .nav-inner opening tag up to its OWN closing </div>,
// non-greedy so it stops at the first </div> — correct as long as nothing
// inside .nav-inner is itself a <div> (true for every page in this repo;
// nav-inner only ever contains <a>, <ul>/<li>, <button>, <svg>).
const NAV_INNER_RE = /(<div class="nav-inner[^"]*"[\s\S]*?)(<\/div>)/;

let changed = 0, skipped = 0;
const warnings = [];

for (const file of pages) {
  const fp = path.join(root, file);
  let html = fs.readFileSync(fp, 'utf8');
  const before = html;

  // 1. Init script — immediately before the first stylesheet <link>.
  if (!html.includes('theme-init:start')) {
    if (/<link[^>]+rel="stylesheet"/.test(html)) {
      html = html.replace(/(<link[^>]+rel="stylesheet")/, INIT + '$1');
    } else {
      warnings.push(`${file}: no <link rel="stylesheet"> found — init script NOT inserted`);
    }
  }

  // 2. Toggle button — inside .nav-inner, right before its own closing </div>.
  if (!html.includes('theme-toggle:start')) {
    if (NAV_INNER_RE.test(html)) {
      html = html.replace(NAV_INNER_RE, (full, open, close) => `${open}  ${TOGGLE}\n  ${close}`);
    } else {
      warnings.push(`${file}: .nav-inner not found — toggle button NOT inserted`);
    }
  }

  // 3. theme.js — before </body>.
  if (!html.includes('theme-script:start')) {
    if (/<\/body>/.test(html)) {
      html = html.replace(/(<\/body>)/, SCRIPT + '\n$1');
    } else {
      warnings.push(`${file}: no </body> found — theme.js script NOT inserted`);
    }
  }

  if (html !== before) { fs.writeFileSync(fp, html); changed++; }
  else skipped++;
}

if (warnings.length) {
  console.warn('Warnings:');
  for (const w of warnings) console.warn(`  ? ${w}`);
}
console.log(`add-dark-mode: ${changed} changed, ${skipped} already done`);
