/**
 * Sitewide font-loading optimization.
 *
 * 1. Converts the render-blocking Google Fonts <link rel="stylesheet"> into the
 *    async pattern (preload + media="print" onload swap + <noscript> fallback),
 *    so fonts no longer block first paint.
 * 2. Strips the variable `opsz` (optical-size) axis from the font URL — it is
 *    invisible at the fixed UI sizes this site uses and only adds payload.
 *
 * Idempotent: pages already converted (detected via `media="print"`) are skipped.
 *
 * Usage: node scripts/optimize-fonts.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const pages = fs.readdirSync(root).filter(f => f.endsWith('.html'));

// Remove the opsz axis (and its positional value in each wght tuple) from a
// Google Fonts css2 URL, preserving the ital and wght axes that are actually used.
function stripOpsz(url) {
  // DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;... -> ital,wght@0,300;0,400;...
  // DM+Sans:opsz,wght@9..40,300;9..40,400;...          -> wght@300;400;...
  return url.replace(/(family=[^:&]+:)([^&]*)/g, (whole, prefix, spec) => {
    const at = spec.indexOf('@');
    if (at === -1) return whole; // no axis tuples (single weight)
    const axes = spec.slice(0, at).split(',');
    const opszIdx = axes.indexOf('opsz');
    if (opszIdx === -1) return whole; // nothing to strip for this family
    const newAxes = axes.filter(a => a !== 'opsz');
    const tuples = spec.slice(at + 1).split(';').map(t => {
      const parts = t.split(',');
      parts.splice(opszIdx, 1); // drop the value at the opsz position
      return parts.join(',');
    });
    return prefix + newAxes.join(',') + '@' + tuples.join(';');
  });
}

let changed = 0;
let skipped = 0;

for (const file of pages) {
  const fp = path.join(root, file);
  let html = fs.readFileSync(fp, 'utf8');

  // Already optimized?
  if (/rel="stylesheet"[^>]*media="print"/.test(html) || /media="print"[^>]*onload/.test(html)) {
    skipped++;
    continue;
  }

  // Match the single font stylesheet link (the css2 path disambiguates it from
  // the preconnect links, which point at the fonts host without /css2).
  const linkRe = /<link\b[^>]*fonts\.googleapis\.com\/css2[^>]*>/i;
  const m = html.match(linkRe);
  if (!m) { skipped++; continue; }

  const hrefMatch = m[0].match(/href="([^"]+)"/i);
  if (!hrefMatch) { skipped++; continue; }

  const url = stripOpsz(hrefMatch[1]);
  const replacement =
    `<link rel="preload" as="style" href="${url}">\n` +
    `<link rel="stylesheet" href="${url}" media="print" onload="this.media='all'">\n` +
    `<noscript><link rel="stylesheet" href="${url}"></noscript>`;

  html = html.replace(linkRe, replacement);
  fs.writeFileSync(fp, html);
  changed++;
}

console.log(`Font optimization: ${changed} pages updated, ${skipped} skipped.`);
