/**
 * Updates lastmod dates in sitemap.xml to today (UTC).
 * Usage: node scripts/update-sitemap.js [file1.html file2.html ...]
 * If no files given, updates all URLs.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const sitemapPath = path.join(root, 'sitemap.xml');
const today = new Date().toISOString().slice(0, 10);

// Derive the filename -> canonical URL map from the html files actually on disk,
// so new pages are covered without hand-editing. Non-indexable files excluded.
// Entries whose <loc> is absent from sitemap.xml simply won't match — harmless.
const SITE = 'https://clearlycheck.com';
const EXCLUDE = new Set(['google1d81c29365628a0c.html']);
const urlMap = Object.fromEntries(
  fs.readdirSync(root)
    .filter(f => f.endsWith('.html') && !EXCLUDE.has(f))
    .map(f => [f, f === 'index.html' ? `${SITE}/` : `${SITE}/${f}`])
);

const args = process.argv.slice(2);
const targets = args.length
  ? new Set(args.map(f => urlMap[f]).filter(Boolean))
  : new Set(Object.values(urlMap));

let xml = fs.readFileSync(sitemapPath, 'utf8');

for (const url of targets) {
  const pattern = new RegExp(
    `(<loc>${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<\\/loc>\\s*<lastmod>)[^<]+(<\\/lastmod>)`,
    'g'
  );
  xml = xml.replace(pattern, `$1${today}$2`);
}

fs.writeFileSync(sitemapPath, xml);
console.log('Updated sitemap lastmod to', today, 'for', targets.size, 'URL(s)');
