#!/usr/bin/env node
/**
 * add-analytics.cjs — injects the Cloudflare Web Analytics beacon into every
 * root-level *.html page, right before </head>.
 *
 * Idempotent: skips any page that already contains the beacon host. Uses a
 * surgical string insert (no HTML re-serialization) so line endings are left
 * untouched — matches the convention of the other build scripts in this dir.
 *
 * Re-run after adding any new page.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BEACON_HOST = 'static.cloudflareinsights.com';
const BEACON =
  "<!-- Cloudflare Web Analytics --><script type='module' src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{\"token\": \"94c2b9e732bc45deb6ebafa8912d2594\"}'></script><!-- End Cloudflare Web Analytics -->";

const files = fs
  .readdirSync(ROOT)
  .filter((f) => f.endsWith('.html'))
  .sort();

let injected = 0;
let skipped = 0;

for (const file of files) {
  const full = path.join(ROOT, file);
  const html = fs.readFileSync(full, 'utf8');

  if (html.includes(BEACON_HOST)) {
    skipped++;
    continue;
  }

  const idx = html.indexOf('</head>');
  if (idx === -1) {
    console.warn(`  ! no </head> in ${file} — skipped`);
    skipped++;
    continue;
  }

  const next = html.slice(0, idx) + BEACON + '\n' + html.slice(idx);
  fs.writeFileSync(full, next);
  injected++;
  console.log(`  + ${file}`);
}

console.log(`\nCloudflare beacon: injected ${injected}, skipped ${skipped}.`);
