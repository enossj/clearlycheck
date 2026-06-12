# ClearlyCheck

Free online calculators and tools for personal finance, productivity, and health. All calculations run entirely in the browser — no signup, no backend.

**Live site:** [clearlycheck.com](https://clearlycheck.com)

## Stack

- Static HTML/CSS/JavaScript (no build step required for deployment)
- Shared assets in `assets/css/` and `assets/js/`
- Vitest for calculator unit tests (dev only)

## Local development

```bash
# Preview the site
npx serve .

# Run tests
npm install
npm test
```

## Project structure

```
clearlycheck/
├── assets/
│   ├── css/          # Shared styles (base, calculator)
│   ├── js/           # Shared scripts (faq, contact, calculators)
│   └── favicon.svg
├── tests/            # Vitest unit tests
├── scripts/          # Maintenance scripts
├── index.html        # Homepage
├── *-calculator.html # Tool pages
└── sitemap.xml
```

## Configuration

### Contact form (Formspree)

1. Create a free form at [formspree.io](https://formspree.io)
2. Set your form ID in `assets/js/contact-config.js`:

```js
window.CLEARLYCHECK_FORMSPREE_ID = 'your_form_id_here';
```

### Google AdSense (optional)

AdSense scripts are currently **deferred** until ad units are configured. To enable:

1. Create ad units in your AdSense dashboard
2. Add the AdSense script and `<ins class="adsbygoogle">` placements to pages
3. Update `privacy-policy.html` to reflect active advertising

Publisher ID: `ca-pub-1937179969817973`

## Adding a new tool

Use this checklist:

- [ ] Create `your-tool.html` using shared CSS (`assets/css/base.css`, `assets/css/calculator.css`)
- [ ] Add tool card to `index.html` tools grid
- [ ] Add entry to `sitemap.xml` with current `lastmod` date
- [ ] Add Schema.org `WebApplication` and `FAQPage` JSON-LD
- [ ] Add `og:image` and favicon links in `<head>`
- [ ] Extract pure calculation logic to `assets/js/calculators/` with Vitest coverage
- [ ] Include informational disclaimer and FAQ section
- [ ] Run `npm test` before committing

## Deployment

Push to GitHub. The site is static — deploy to any static host (GitHub Pages, Cloudflare Pages, Vercel, Netlify).

## License

All rights reserved unless otherwise specified.
