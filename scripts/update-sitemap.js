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

const urlMap = {
  'index.html': 'https://clearlycheck.com/',
  'debt-free-calculator.html': 'https://clearlycheck.com/debt-free-calculator.html',
  'salary-converter.html': 'https://clearlycheck.com/salary-converter.html',
  'can-i-afford-this.html': 'https://clearlycheck.com/can-i-afford-this.html',
  'rent-vs-buy.html': 'https://clearlycheck.com/rent-vs-buy.html',
  'timezone-planner.html': 'https://clearlycheck.com/timezone-planner.html',
  'bmi-calculator.html': 'https://clearlycheck.com/bmi-calculator.html',
  'age-calculator.html': 'https://clearlycheck.com/age-calculator.html',
  'privacy-policy.html': 'https://clearlycheck.com/privacy-policy.html',
  'terms-of-use.html': 'https://clearlycheck.com/terms-of-use.html',
  'contact.html': 'https://clearlycheck.com/contact.html',
};

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
