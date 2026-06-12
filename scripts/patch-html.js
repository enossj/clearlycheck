const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const calculators = [
  'debt-free-calculator.html',
  'can-i-afford-this.html',
  'rent-vs-buy.html',
  'timezone-planner.html',
];
const allPages = fs.readdirSync(root).filter(f => f.endsWith('.html'));

const assetLinks = `<link rel="stylesheet" href="assets/css/base.css">
<link rel="stylesheet" href="assets/css/calculator.css">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">`;

const initFaqPattern = /<script>\s*\(function\(\)\s*\{\s*function initFAQ\(\)[\s\S]*?\}\)\(\);\s*<\/script>/g;

for (const file of allPages) {
  let html = fs.readFileSync(path.join(root, file), 'utf8');
  let changed = false;

  if (!html.includes('assets/css/base.css')) {
    if (file === 'index.html') {
      html = html.replace(
        /(<link href="https:\/\/fonts\.googleapis\.com[^"]+" rel="stylesheet">)/,
        `$1\n<link rel="stylesheet" href="assets/css/base.css">\n<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">\n<meta property="og:image" content="https://clearlycheck.com/assets/og-image.svg">`
      );
    } else if (calculators.includes(file) || file === 'bmi-calculator.html' || file === 'age-calculator.html') {
      html = html.replace(
        /(<link href="https:\/\/fonts\.googleapis\.com[^"]+" rel="stylesheet">)/,
        `$1\n${assetLinks}\n<meta property="og:image" content="https://clearlycheck.com/assets/og-image.svg">`
      );
    } else if (['contact.html', 'privacy-policy.html', 'terms-of-use.html'].includes(file)) {
      html = html.replace(
        /(<link href="https:\/\/fonts\.googleapis\.com[^"]+" rel="stylesheet">)/,
        `$1\n<link rel="stylesheet" href="assets/css/base.css">\n<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">`
      );
    }
    changed = true;
  }

  if (initFaqPattern.test(html)) {
    html = html.replace(initFaqPattern, '<script src="assets/js/faq.js"></script>');
    changed = true;
  }

  html = html.replace(/href="index\.html"/g, 'href="/"');
  if (html.includes('href="/"')) changed = true;

  if (changed) {
    fs.writeFileSync(path.join(root, file), html);
    console.log('Updated', file);
  }
}
