/**
 * Spoke-up wiring: inserts the category hub into each tool page's breadcrumb,
 * turning "Home › Tools › Tool" into "Home › Tools › Category › Tool" in both
 * the visible trail and the BreadcrumbList JSON-LD. This is the link each tool
 * gives back to its hub, completing the hub-and-spoke.
 *
 * Idempotent: a page whose breadcrumb already links its hub is left untouched.
 * Usage: node scripts/wire-breadcrumbs.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const SITE = 'https://clearlycheck.com';

// filename -> { hub slug, short label }
const CAT = {};
const define = (slug, label, files) => files.forEach(f => (CAT[f] = { slug, label }));
define('finance-calculators', 'Finance', ['debt-free-calculator.html', 'net-worth-calculator.html', 'salary-converter.html', 'can-i-afford-this.html', 'rent-vs-buy.html', 'overtime-pay-calculator.html', 'tip-calculator.html', 'compound-interest-calculator.html', 'income-tax-calculator.html', 'sales-tax-calculator.html', 'mortgage-calculator.html']);
define('health-calculators', 'Health', ['bmi-calculator.html', 'height-calculator.html', 'calorie-calculator.html', 'due-date-calculator.html']);
define('productivity-tools', 'Productivity', ['timezone-planner.html', 'time-card-calculator.html', 'meeting-cost-calculator.html', 'date-duration-calculator.html', 'word-count-reading-time.html']);
define('utility-tools', 'Utility', ['age-calculator.html', 'password-generator.html', 'percentage-calculator.html', 'unit-converter.html', 'bra-size-calculator.html', 'shoe-size-converter.html']);
define('pet-tools', 'Pet', ['pet-age-calculator.html', 'pet-food-calculator.html', 'pet-cost-calculator.html']);
define('education-tools', 'Education', ['gpa-calculator.html', 'grade-calculator.html', 'test-grade-calculator.html', 'words-to-pages-calculator.html', 'gpa-to-percentage-calculator.html', 'reading-time-calculator.html']);
define('auto-calculators', 'Auto', ['auto-loan-calculator.html', 'fuel-cost-calculator.html', 'mpg-calculator.html', 'lease-vs-buy-calculator.html']);

let visibleFixed = 0, jsonFixed = 0, skipped = 0, jsonSkipped = 0;

for (const [file, cat] of Object.entries(CAT)) {
  const fp = path.join(root, file);
  let html = fs.readFileSync(fp, 'utf8');
  let touched = false;

  // --- 1. Visible breadcrumb ---
  // Insert the hub crumb between the "Tools" link and the final muted crumb.
  // Handles both inline and multiline separator markup via \s*.
  if (!new RegExp(`href="${cat.slug}\\.html"`).test(html)) {
    // Variant A/B: index.html#tools, plain separators, muted final crumb.
    const reA = /(<a href="index\.html#tools">Tools<\/a>\s*<span>›<\/span>\s*)(<span style="color:var\(--text-muted\);">)/;
    // Variant C: /#tools, aria-hidden separators, unstyled final crumb.
    const reC = /(<a href="\/#tools">Tools<\/a>\s*<span aria-hidden="true">›<\/span>\s*)(<span>)/;
    if (reA.test(html)) {
      html = html.replace(reA, `$1<a href="${cat.slug}.html">${cat.label}</a><span>›</span>\n      $2`);
      touched = true; visibleFixed++;
    } else if (reC.test(html)) {
      html = html.replace(reC, `$1<a href="${cat.slug}.html">${cat.label}</a><span aria-hidden="true">›</span>\n      $2`);
      touched = true; visibleFixed++;
    } else {
      console.warn(`  ? ${file}: visible breadcrumb pattern not found`);
    }
  } else {
    skipped++;
  }

  // --- 2. BreadcrumbList JSON-LD ---
  const blockRe = /<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g;
  let m, replaced = false;
  const blocks = [];
  while ((m = blockRe.exec(html))) blocks.push({ full: m[0], json: m[1] });
  for (const b of blocks) {
    let obj;
    try { obj = JSON.parse(b.json); } catch (e) { continue; }
    if (obj['@type'] !== 'BreadcrumbList' || !Array.isArray(obj.itemListElement)) continue;
    const items = obj.itemListElement;
    // Already has the category crumb (4 items)?
    if (items.length >= 4) { jsonSkipped++; break; }
    if (items.length !== 3) break;
    const toolItem = items[2];
    const catItem = { '@type': 'ListItem', position: 3, name: cat.label, item: `${SITE}/${cat.slug}.html` };
    const newTool = Object.assign({}, toolItem, { position: 4 });
    obj.itemListElement = [items[0], items[1], catItem, newTool];
    const newBlock = `<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n</script>`;
    html = html.replace(b.full, newBlock);
    replaced = true;
    touched = true;
    jsonFixed++;
    break;
  }

  if (touched) fs.writeFileSync(fp, html);
}

console.log(`Breadcrumbs wired: ${visibleFixed} visible updated, ${jsonFixed} JSON-LD updated, ${skipped} already-linked skipped, ${jsonSkipped} JSON already 4-item.`);
