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

  // Guard: several tool pages redeclare the same custom property names in a
  // page-local `:root { ... }` block (e.g. `--accent: #1a6b4a;`). Naive
  // substitution turns those into `--accent: var(--accent);` — a self
  // reference, which is invalid at computed-value time per the CSS custom
  // properties spec and silently drops the color (e.g. the green logo accent
  // renders as inherited black instead of #1a6b4a). Detect any
  // `--NAME: var(--NAME)` this substitution created and restore the literal
  // hex so the local override still resolves, in both light and dark mode.
  const REVERSE = new Map(MAP.map(([hex, v]) => [v, hex]));
  html = html.replace(/(--([\w-]+)\s*:\s*)(var\(--\2\))/gi, (m, prefix, name, varRef) => {
    const hex = REVERSE.get(varRef.toLowerCase());
    return hex ? prefix + hex : m;
  });

  if (html !== before) { fs.writeFileSync(fp, html); changed++; }
  else skipped++;
}
console.log(`tokenize-inline-colors: ${changed} changed, ${skipped} unchanged`);
