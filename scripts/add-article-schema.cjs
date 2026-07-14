/**
 * Injects a TechArticle schema into each tool page, formalizing the E-E-A-T
 * signals already shown as the byline and "Last updated" date:
 *   - author  -> Person @id (defined on about.html)
 *   - publisher -> Organization @id with logo
 *   - datePublished -> the file's first git commit (added) date
 *   - dateModified  -> the visible "Last updated <Month D, YYYY>" on the page
 *
 * Sits alongside the existing WebApplication/FAQPage/BreadcrumbList schemas.
 * Idempotent: pages that already contain a TechArticle are skipped.
 *
 * Usage: node scripts/add-article-schema.cjs
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const SITE = 'https://clearlycheck.com';
const PERSON_ID = `${SITE}/#enos`;
const ORG_ID = `${SITE}/#organization`;

const EXCLUDE = new Set([
  'index.html', 'sitemap.html', 'about.html', 'contact.html',
  'privacy-policy.html', 'terms-of-use.html',
  'finance-calculators.html', 'health-calculators.html', 'productivity-tools.html',
  'utility-tools.html', 'pet-tools.html', 'education-tools.html',
  'auto-calculators.html',
  'google1d81c29365628a0c.html',
]);

const MONTHS = { January: '01', February: '02', March: '03', April: '04', May: '05', June: '06', July: '07', August: '08', September: '09', October: '10', November: '11', December: '12' };

function firstCommitDate(file) {
  try {
    const out = execSync(`git log --diff-filter=A --format=%ad --date=short -- "${file}"`, { cwd: root }).toString().trim();
    const lines = out.split('\n').filter(Boolean);
    return lines.length ? lines[lines.length - 1] : null;
  } catch (e) { return null; }
}

function lastUpdatedDate(html) {
  const m = html.match(/Last updated ([A-Z][a-z]+) (\d+), (\d{4})/);
  if (!m) return null;
  const mm = MONTHS[m[1]];
  if (!mm) return null;
  return `${m[3]}-${mm}-${String(m[2]).padStart(2, '0')}`;
}

function firstSchemaOfType(html, type) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  for (const b of blocks) {
    try { const j = JSON.parse(b[1]); if (j['@type'] === type) return j; } catch (e) { /* ignore */ }
  }
  return null;
}

function metaDesc(html) {
  const m = html.match(/<meta name="description" content="([^"]*)"/);
  return m ? m[1] : '';
}

function titleName(html) {
  const m = html.match(/<title>([^<|]+)/);
  return m ? m[1].replace(/&amp;/g, '&').trim() : 'ClearlyCheck Tool';
}

let done = 0, skipped = 0, warned = 0;

for (const file of fs.readdirSync(root)) {
  if (!file.endsWith('.html') || EXCLUDE.has(file)) continue;
  let html = fs.readFileSync(path.join(root, file), 'utf8');

  if (/"@type":\s*"TechArticle"/.test(html) || /"TechArticle"/.test(html)) { skipped++; continue; }

  const webApp = firstSchemaOfType(html, 'WebApplication');
  const name = (webApp && webApp.name) || titleName(html);
  const desc = (webApp && webApp.description) || metaDesc(html);

  const published = firstCommitDate(file);
  const modified = lastUpdatedDate(html) || published;
  if (!published) { console.warn(`  ? ${file}: no git date, skipping`); warned++; continue; }

  const article = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: name,
    description: desc,
    url: `${SITE}/${file}`,
    mainEntityOfPage: `${SITE}/${file}`,
    datePublished: published,
    dateModified: modified,
    author: { '@type': 'Person', '@id': PERSON_ID, name: 'Enos' },
    publisher: {
      '@type': 'Organization', '@id': ORG_ID, name: 'ClearlyCheck', url: SITE,
      logo: { '@type': 'ImageObject', url: `${SITE}/assets/og-image.svg` },
    },
    isPartOf: { '@type': 'WebSite', name: 'ClearlyCheck', url: SITE },
  };
  const block = `<script type="application/ld+json">\n${JSON.stringify(article, null, 2)}\n</script>`;

  // Insert right after the BreadcrumbList schema block; fall back to before </head>.
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  let anchor = null;
  for (const b of blocks) {
    try { if (JSON.parse(b[1])['@type'] === 'BreadcrumbList') anchor = b[0]; } catch (e) { /* ignore */ }
  }
  if (anchor) {
    html = html.replace(anchor, anchor + '\n' + block);
  } else {
    html = html.replace(/<\/head>/, block + '\n</head>');
  }

  fs.writeFileSync(path.join(root, file), html);
  done++;
}

console.log(`TechArticle: ${done} added, ${skipped} skipped, ${warned} warned.`);
