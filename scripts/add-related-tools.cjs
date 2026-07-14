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
