/**
 * Generates the 7 category hub pages (finance/health/productivity/utility/pet/education/auto).
 *
 * Each hub links DOWN to every tool in its category (spoke) and ACROSS to the
 * other five hubs (mesh). Tool cards are pulled from index.html so they stay
 * visually and textually identical to the homepage grid. Per-category intro copy
 * and FAQs live in the CATS config below.
 *
 * Re-run any time after adding a tool or editing a card on the homepage.
 * Usage: node scripts/build-hubs.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const SITE = 'https://clearlycheck.com';
const TODAY_ISO = new Date().toISOString().slice(0, 10);
const TODAY = new Date(`${TODAY_ISO}T00:00:00Z`).toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
});

// --- Pull tool card data from the homepage grid -----------------------------
function extractCards() {
  const h = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const re = /<a class="tool-card" href="([a-z0-9-]+\.html)"[^>]*>([\s\S]*?)<\/a>/g;
  const out = {};
  let m;
  while ((m = re.exec(h))) {
    const body = m[2];
    out[m[1]] = {
      href: m[1],
      icon: (body.match(/tool-icon"[^>]*>([^<]+)</) || [])[1]?.trim() || '',
      bg: (body.match(/tool-icon" style="background:([^;"]+)/) || [])[1]?.trim() || '',
      tagClass: (body.match(/tool-tag tag-([a-z]+)"/) || [])[1] || '',
      tagLabel: (body.match(/tool-tag tag-[a-z]+">([^<]+)</) || [])[1] || '',
      name: (body.match(/tool-name">([^<]+)</) || [])[1] || '',
      desc: (body.match(/tool-desc">([^<]+)</) || [])[1] || '',
    };
  }
  return out;
}

// strip HTML entities/tags for use inside JSON-LD / meta text
function plain(s) {
  return s.replace(/&amp;/g, '&').replace(/<[^>]+>/g, '');
}

// --- Category configuration -------------------------------------------------
const CATS = [
  {
    slug: 'finance-calculators', label: 'Finance', pill: '💰 Finance',
    title: 'Finance Calculators — Money, Loans, Tax &amp; Pay',
    h1: 'Finance Calculators',
    metaDesc: 'Free finance calculators for everyday money decisions — debt payoff, net worth, mortgage, income and sales tax, overtime and salary, compound interest, and more. No signup, runs in your browser.',
    intro: `Money questions rarely come with a straight answer, so most people guess. This collection replaces the guessing with numbers. Whether you're figuring out a mortgage payment, working out when you'll finally be debt-free, checking whether a purchase actually fits your income, or seeing how compound interest grows a small monthly deposit into something real, each tool does one job clearly and shows its working. Pay-related tools cover the whole earnings picture — convert a salary to an hourly rate, add up overtime at time-and-a-half, and estimate what's left after income tax. Every calculation happens entirely in your browser, so the figures you type never leave your device. None of these replace a professional for big decisions, but they give you an honest starting point in seconds instead of a spreadsheet you never build.`,
    disclaimer: 'These finance tools give informational estimates, not financial, tax, or legal advice. Confirm important decisions with a qualified professional.',
    faq: [
      { q: 'Are these finance calculators free?', a: 'Yes. Every tool is completely free, needs no signup, and runs entirely in your browser — the numbers you enter never leave your device.' },
      { q: 'How accurate are the results?', a: 'The math follows standard, published formulas (amortization for loans, federal brackets for tax, and so on), so the arithmetic is exact for the inputs you give. Real-world outcomes vary with rates, fees, and your specific situation, so treat results as solid estimates rather than quotes.' },
      { q: 'Which tool should I use to plan a budget?', a: 'Start with the Net Worth Calculator for a snapshot of where you stand, use the Debt Free Calculator to plan payoff, and the Can I Afford This tool to sanity-check big purchases against your income.' },
    ],
    tools: ['debt-free-calculator.html', 'net-worth-calculator.html', 'salary-converter.html', 'can-i-afford-this.html', 'rent-vs-buy.html', 'overtime-pay-calculator.html', 'tip-calculator.html', 'compound-interest-calculator.html', 'income-tax-calculator.html', 'sales-tax-calculator.html', 'mortgage-calculator.html'],
  },
  {
    slug: 'health-calculators', label: 'Health', pill: '🩺 Health',
    title: 'Health Calculators — BMI, Calories, Height &amp; Due Date',
    h1: 'Health Calculators',
    metaDesc: 'Free health calculators: BMI and healthy weight range, daily calorie needs with macros, child adult-height prediction, and pregnancy due date. Private, no signup, runs in your browser.',
    intro: `Understanding your body starts with a few honest numbers. These health calculators turn simple measurements into something meaningful: your Body Mass Index and the weight range that's healthy for your height, the daily calories you need to maintain, lose, or gain weight along with a macro split, a prediction of how tall a child is likely to grow, and an estimated pregnancy due date with a week-by-week timeline. Each uses the same methods clinicians and dietitians rely on — the WHO BMI classification, the Mifflin-St Jeor equation, mid-parental height, and Naegele's rule — and every one runs privately in your browser. They're built to inform, not to diagnose. For anything that matters to your health, use these as a starting point for a conversation with a doctor, not a substitute for one.`,
    disclaimer: 'These health tools are for general information only and are not medical advice, diagnosis, or treatment. Consult a qualified healthcare provider about your health.',
    faq: [
      { q: 'Are these health calculators medical advice?', a: 'No. They provide general information using standard formulas and are not a substitute for professional medical advice, diagnosis, or treatment. Always consult a healthcare provider for health decisions.' },
      { q: 'How is BMI calculated?', a: 'BMI is your weight in kilograms divided by the square of your height in metres. The BMI Calculator does this for you and shows your category and healthy weight range using the World Health Organization classification.' },
      { q: 'Do these tools store my measurements?', a: 'No. Everything runs in your browser and nothing you enter is transmitted or saved on a server.' },
    ],
    tools: ['bmi-calculator.html', 'height-calculator.html', 'calorie-calculator.html', 'due-date-calculator.html'],
  },
  {
    slug: 'productivity-tools', label: 'Productivity', pill: '⏱️ Productivity',
    title: 'Productivity Tools — Time, Hours, Meetings &amp; Dates',
    h1: 'Productivity Tools',
    metaDesc: 'Free productivity tools: timezone meeting planner, weekly time card, meeting cost calculator, date duration, and word count with reading time. No signup, runs in your browser.',
    intro: `Time is the resource everyone runs short on, and these tools help you account for it. Plan a meeting across timezones without the mental arithmetic, total a week of clock-in and clock-out times into paid hours, or put a real dollar figure on that recurring meeting to decide whether it still earns its place on the calendar. The date duration tool counts the days, weeks, and business days between any two dates — handy for deadlines and notice periods — and the word count tool gives writers live totals plus reading and speaking time. None of them need an account, and all of them run instantly in your browser. They're small, sharp utilities for the everyday questions that quietly eat time: how long, how many hours, how much, and when.`,
    disclaimer: null,
    faq: [
      { q: 'Are these productivity tools free to use?', a: 'Yes — all of them are free, require no signup, and run entirely in your browser.' },
      { q: 'Can the time card calculator handle overnight shifts?', a: 'Yes. It correctly totals shifts that run past midnight, subtracts unpaid breaks, and can split regular and overtime hours.' },
      { q: 'How does the meeting cost calculator work?', a: 'It multiplies the number of attendees by their average hourly pay and the meeting length, then can annualize a recurring meeting so you can see its yearly cost.' },
    ],
    tools: ['timezone-planner.html', 'time-card-calculator.html', 'meeting-cost-calculator.html', 'date-duration-calculator.html', 'word-count-reading-time.html'],
  },
  {
    slug: 'utility-tools', label: 'Utility', pill: '🛠️ Utility',
    title: 'Utility Tools — Age, Percentages, Units, Passwords &amp; Sizes',
    h1: 'Utility Tools',
    metaDesc: 'Free everyday utility tools: exact age calculator, percentage calculator, unit converter, strong password generator, and bra and shoe size converters. No signup, runs in your browser.',
    intro: `Some questions don't fit a category — they just need a quick, reliable answer. This is the home for those. Work out your exact age down to the day, handle any percentage (of a number, a change, an increase or decrease), or convert between length, weight, volume, temperature, and more with a single flexible converter. Need a strong password? Generate one with custom length and character sets, entirely in your browser so it's never sent anywhere. Two sizing tools round things out: turn measurements into a bra band and cup size with sister-size options, and convert shoe sizes across US, UK, EU, and centimetres. Every tool here is free, private, and instant — the digital equivalent of the drawer where you keep the things you reach for all the time.`,
    disclaimer: null,
    faq: [
      { q: 'Is the password generator safe?', a: 'Yes. Passwords are generated locally in your browser using the browser\'s secure randomness and are never transmitted or stored anywhere.' },
      { q: 'What can the unit converter handle?', a: 'Length, weight, volume, temperature, area, time, speed, and digital storage — with instant two-way conversion between common units.' },
      { q: 'Are these tools free and private?', a: 'Every utility tool is free, needs no signup, and runs entirely in your browser, so nothing you enter leaves your device.' },
    ],
    tools: ['age-calculator.html', 'password-generator.html', 'percentage-calculator.html', 'unit-converter.html', 'bra-size-calculator.html', 'shoe-size-converter.html'],
  },
  {
    slug: 'pet-tools', label: 'Pet', pill: '🐾 Pet',
    title: 'Pet Tools — Dog &amp; Cat Age, Food, and Cost Calculators',
    h1: 'Pet Tools',
    metaDesc: 'Free pet calculators for dog and cat owners: convert pet age to human years, work out daily food calories and portions, and estimate the yearly and lifetime cost of a pet. No signup.',
    intro: `Looking after a dog or cat means answering questions a vet visit doesn't always cover. These tools help with three of the most common. Convert your pet's age into human years using the modern, size-based method rather than the old times-seven myth. Work out how many calories your dog or cat actually needs each day and how much to feed, using the resting- and maintenance-energy formulas vets use. And before — or after — you bring a pet home, estimate the real cost: the one-time startup expenses, the monthly food and care, and what it all adds up to over a lifetime. Each figure is editable so you can match your own vet quotes and food prices. Everything runs privately in your browser, and none of it replaces your veterinarian — think of it as informed preparation for the conversations you'll have with them.`,
    disclaimer: 'These pet tools give general estimates, not veterinary advice. For your pet\'s diet, health, and budget, consult your veterinarian.',
    faq: [
      { q: 'How do I convert my dog or cat\'s age to human years?', a: 'The Pet Age Calculator uses a size- and species-based method rather than simply multiplying by seven, which reflects how dogs and cats actually age at different life stages.' },
      { q: 'How much should I feed my pet?', a: 'The Pet Food Calculator estimates daily calories from your pet\'s weight and life stage using the vet RER/MER method, then converts that to portions based on your food\'s calorie content.' },
      { q: 'Are these tools a substitute for a vet?', a: 'No. They provide general estimates to help you prepare. For diet, health, and any medical concern, always consult your veterinarian.' },
    ],
    tools: ['pet-age-calculator.html', 'pet-food-calculator.html', 'pet-cost-calculator.html'],
  },
  {
    slug: 'education-tools', label: 'Education', pill: '🎓 Education',
    title: 'Education Tools — GPA and Grade Calculators',
    h1: 'Education Tools',
    metaDesc: 'Free education calculators for students: work out your semester or cumulative GPA on the 4.0 scale, find the exam score you need or your weighted class average, grade a test from questions missed, convert word counts to pages, convert GPA to a percentage, and estimate reading time. No signup, in your browser.',
    intro: `Grades cause more anxiety than they need to, usually because the arithmetic behind them is fiddly. These six tools take that off your plate. The GPA Calculator turns your course grades and credit hours into a semester or cumulative grade point average on the standard 4.0 scale, with support for weighted honors and AP courses. The Grade Calculator answers the question every student asks before a final: what score do I need to hit the grade I want? It also works out your current weighted average from individual assignments and their weights. The Test Grade Calculator takes the number of questions missed, or points earned out of a total, and instantly returns the percentage score and letter grade with a full EasyGrader-style chart. The Words to Pages Calculator converts a word count into an estimated page count — or pages back into words — for whatever font, size, and spacing your assignment requires. The GPA to Percentage Calculator converts a 4.0-scale GPA into its percentage range and letter grade, or a percentage back into GPA, using the standard US 10-point scale. And the Reading Time Calculator estimates how long a piece of writing takes to read at a slow, average, or fast pace — or how long it takes to say aloud. All six run instantly in your browser, keep your work private, and save you from second-guessing a calculator app during exam season. Enter your numbers, see exactly where you stand, and plan the rest of the term with confidence.`,
    disclaimer: null,
    faq: [
      { q: 'How is GPA calculated?', a: 'Each grade is converted to points on the 4.0 scale, multiplied by the course\'s credit hours, summed, and divided by total credits. The GPA Calculator does this automatically and supports weighted honors and AP courses.' },
      { q: 'Can I find the exam score I need for a target grade?', a: 'Yes. The Grade Calculator takes your current grade, the final\'s weight, and your target, and tells you the exact score you need on the final exam.' },
      { q: 'How do I turn missed questions into a grade?', a: 'The Test Grade Calculator takes the number of questions (or points) missed out of the total and returns the percentage score along with its corresponding letter grade.' },
      { q: 'How many pages is my essay?', a: 'The Words to Pages Calculator estimates page count from a word count (or the reverse) based on the font, font size, and line spacing you choose, since those change how much text fits per page.' },
      { q: 'How do I convert my GPA to a percentage?', a: 'The GPA to Percentage Calculator maps your 4.0-scale GPA to a percentage range and letter grade using the standard US 10-point scale, and can also convert a percentage back into GPA. Grading scales vary by school, so treat the result as a close estimate.' },
      { q: 'How long will it take to read my document?', a: 'The Reading Time Calculator divides your word count by a reading speed (slow, average, or fast) to estimate reading time, and by a slower speaking rate to estimate how long it takes to read aloud.' },
      { q: 'Are these tools free?', a: 'All six are free, need no signup, and run entirely in your browser.' },
    ],
    tools: ['gpa-calculator.html', 'grade-calculator.html', 'test-grade-calculator.html', 'words-to-pages-calculator.html', 'gpa-to-percentage-calculator.html', 'reading-time-calculator.html'],
  },
  {
    slug: 'auto-calculators', label: 'Auto', pill: '🚗 Auto',
    title: 'Auto Calculators — Car Loans, Fuel Cost &amp; MPG',
    h1: 'Auto Calculators',
    metaDesc: 'Free car calculators: estimate your auto loan monthly payment, the fuel cost of a trip, your MPG and L/100km, and whether leasing or buying is cheaper. No signup, runs in your browser.',
    intro: `Running a car is a string of number questions, and these tools answer the four that come up most. Work out the monthly payment on an auto loan from the price, your down payment and trade-in, sales tax, the APR and the term — and see the total interest before you sign. Price the fuel for any trip from its distance, your car's economy and the pump price, with round-trip and split-between-passengers options. Check your real MPG from a tank of fuel, and convert freely between MPG, L/100km and km/L. And when a new car tempts you, compare leasing against buying and keeping it, resale value included, over the lease term. Every calculation runs in your browser, so nothing you enter leaves your device. None of these replace a dealer quote or a financial adviser, but they turn the guesswork into numbers in seconds.`,
    disclaimer: 'These auto tools give informational estimates, not financial advice. Confirm loan, lease, and purchase decisions with the lender or a qualified professional.',
    faq: [
      { q: 'Are these car calculators free?', a: 'Yes. Every tool is free, needs no signup, and runs entirely in your browser — the numbers you enter never leave your device.' },
      { q: 'How accurate is the auto loan payment?', a: 'It uses the standard amortization formula lenders use, so the arithmetic is exact for the price, APR, and term you enter. Your actual quote can differ with fees, dealer add-ons, and how sales tax and trade-in credits work in your state.' },
      { q: 'Should I lease or buy?', a: 'The Lease vs Buy Calculator compares the total cost of leasing against financing and keeping the car, crediting the resale value you keep at the end of the lease term net of any loan balance still owed. It is a starting point — it does not include mileage-overage fees, maintenance, or the time value of money.' },
    ],
    tools: ['auto-loan-calculator.html', 'fuel-cost-calculator.html', 'mpg-calculator.html', 'lease-vs-buy-calculator.html'],
  },
];

// --- Rendering --------------------------------------------------------------
function fontLinks() {
  const u = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap';
  return `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="${u}">
<link rel="stylesheet" href="${u}" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="${u}"></noscript>`;
}

function toolCard(t) {
  return `      <a class="tool-card" href="${t.href}">
        <div class="tool-header">
          <div class="tool-icon" style="background:${t.bg};">${t.icon}</div>
          <span class="tool-tag tag-${t.tagClass}">${t.tagLabel}</span>
        </div>
        <div class="tool-name">${t.name}</div>
        <div class="tool-desc">${t.desc}</div>
        <div class="tool-cta">Use tool <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg></div>
      </a>`;
}

function faqAccordion(faq) {
  return faq.map(f =>
`      <div class="faq-item">
        <button class="faq-q">${f.q}<span class="faq-icon">+</span></button>
        <div class="faq-a">${f.a}</div>
      </div>`).join('\n');
}

function otherHubLinks(current) {
  return CATS.filter(c => c.slug !== current.slug).map(c =>
    `<a class="hub-chip" href="${c.slug}.html">${c.pill}</a>`).join('\n      ');
}

function schema(cat, cards) {
  const items = cards.map((t, i) => ({
    '@type': 'ListItem', position: i + 1,
    url: `${SITE}/${t.href}`, name: plain(t.name),
  }));
  const collection = {
    '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: `${cat.h1} — ClearlyCheck`, url: `${SITE}/${cat.slug}.html`,
    description: plain(cat.metaDesc),
    dateModified: TODAY_ISO,
    isPartOf: { '@type': 'WebSite', name: 'ClearlyCheck', url: SITE },
    publisher: {
      '@type': 'Organization', '@id': `${SITE}/#organization`, name: 'ClearlyCheck', url: SITE,
      logo: { '@type': 'ImageObject', url: `${SITE}/assets/og-image.svg` },
    },
    mainEntity: { '@type': 'ItemList', itemListElement: items },
  };
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: `${SITE}/#tools` },
      { '@type': 'ListItem', position: 3, name: cat.label, item: `${SITE}/${cat.slug}.html` },
    ],
  };
  const faqPage = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: cat.faq.map(f => ({
      '@type': 'Question', name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  return [collection, breadcrumb, faqPage]
    .map(o => `<script type="application/ld+json">\n${JSON.stringify(o, null, 2)}\n</script>`).join('\n');
}

function render(cat, allCards) {
  const cards = cat.tools.map(f => allCards[f]);
  const disclaimerBlock = cat.disclaimer
    ? `\n<div style="background:#f0f0ef;border-top:1px solid rgba(15,15,14,0.08);border-bottom:1px solid rgba(15,15,14,0.08);padding:16px 24px;margin-bottom:40px;">
  <div style="max-width:1100px;margin:0 auto;font-size:12px;color:#6b6a66;line-height:1.6;">
    <strong style="color:#0f0f0e;">For informational purposes only.</strong> ${cat.disclaimer} Reviewed by <a href="/about.html" style="color:inherit;">Enos</a> · Last updated ${TODAY}.
  </div>
</div>\n` : '\n';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${cat.title} | ClearlyCheck</title>
<meta name="description" content="${cat.metaDesc}">
<link rel="canonical" href="${SITE}/${cat.slug}.html">
<meta property="og:type" content="website">
<meta property="og:title" content="${cat.title}">
<meta property="og:description" content="${cat.metaDesc}">
<meta property="og:url" content="${SITE}/${cat.slug}.html">
<meta property="og:site_name" content="ClearlyCheck">
<meta name="twitter:card" content="summary">

${schema(cat, cards)}

${fontLinks()}
<link rel="stylesheet" href="assets/css/base.css">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<meta property="og:image" content="${SITE}/assets/og-image.svg">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #f8f7f4; --bg-card: #ffffff; --text: #0f0f0e; --text-muted: #2b2a28; --text-light: #3d3c39;
    --border: rgba(15,15,14,0.10); --border-hover: rgba(15,15,14,0.20);
    --accent: #1a6b4a; --accent-light: #e8f5ef; --accent-dark: #145a3d;
    --tag-finance: #e8f0fe; --tag-finance-text: #1a4fa0;
    --tag-utility: #eceff1; --tag-utility-text: #455a64;
    --tag-health: #e6f4ea; --tag-health-text: #137333;
    --tag-productivity: #fff8e1; --tag-productivity-text: #8a6500;
    --tag-education: #f3e8fd; --tag-education-text: #7c3aed;
    --tag-auto: #e8eef7; --tag-auto-text: #2d5a8a;
    --radius: 16px; --radius-sm: 10px;
    --shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06);
    --shadow-hover: 0 4px 8px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.10);
  }
  html { scroll-behavior: smooth; }
  body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); font-size: 16px; line-height: 1.6; -webkit-font-smoothing: antialiased; }
  nav { position: sticky; top: 0; z-index: 100; background: rgba(248,247,244,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); padding: 0 24px; }
  .nav-inner { max-width: 1100px; margin: 0 auto; height: 64px; display: flex; align-items: center; justify-content: space-between; }
  .logo { font-family: 'Roboto', sans-serif; font-weight: 800; font-size: 20px; color: var(--text); text-decoration: none; letter-spacing: -0.5px; }
  .logo span { color: var(--accent); }
  .back-link { display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 500; color: var(--text-muted); text-decoration: none; transition: color 0.15s; }
  .back-link:hover { color: var(--text); }
  .page-header { max-width: 1100px; margin: 0 auto; padding: 52px 24px 28px; }
  .breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-light); margin-bottom: 20px; flex-wrap: wrap; }
  .breadcrumb a { color: var(--text-light); text-decoration: none; }
  .breadcrumb a:hover { color: var(--accent); }
  .tool-tag-pill { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent); background: var(--accent-light); padding: 5px 12px; border-radius: 100px; margin-bottom: 16px; }
  .page-header h1 { font-family: 'Roboto', sans-serif; font-size: clamp(30px, 5vw, 46px); font-weight: 800; letter-spacing: -1.5px; line-height: 1.1; color: var(--text); margin-bottom: 16px; }
  .page-header .intro { font-size: 16px; color: var(--text-muted); font-weight: 300; max-width: 760px; line-height: 1.8; }
  .tools-wrap { max-width: 1100px; margin: 0 auto; padding: 8px 24px 40px; }
  .tools-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
  .tool-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 28px; box-shadow: var(--shadow); transition: all 0.2s; text-decoration: none; color: inherit; display: flex; flex-direction: column; gap: 14px; position: relative; overflow: hidden; }
  .tool-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--accent); transform: scaleX(0); transform-origin: left; transition: transform 0.25s ease; }
  .tool-card:hover { box-shadow: var(--shadow-hover); transform: translateY(-3px); border-color: var(--border-hover); }
  .tool-card:hover::before { transform: scaleX(1); }
  .tool-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
  .tool-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
  .tool-tag { font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 100px; letter-spacing: 0.04em; text-transform: uppercase; white-space: nowrap; }
  .tag-finance { background: var(--tag-finance); color: var(--tag-finance-text); }
  .tag-utility { background: var(--tag-utility); color: var(--tag-utility-text); }
  .tag-health { background: var(--tag-health); color: var(--tag-health-text); }
  .tag-productivity { background: var(--tag-productivity); color: var(--tag-productivity-text); }
  .tag-education { background: var(--tag-education); color: var(--tag-education-text); }
  .tag-pet { background: #fbe9d8; color: #9a5b1e; }
  .tag-auto { background: var(--tag-auto); color: var(--tag-auto-text); }
  .tool-name { font-family: 'Roboto', sans-serif; font-size: 18px; font-weight: 700; color: var(--text); letter-spacing: -0.3px; line-height: 1.2; }
  .tool-desc { font-size: 14px; color: var(--text-muted); line-height: 1.6; font-weight: 300; }
  .tool-cta { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 500; color: var(--accent); margin-top: auto; transition: gap 0.15s; }
  .tool-card:hover .tool-cta { gap: 10px; }
  .tool-cta svg { width: 16px; height: 16px; }
  .section-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-light); margin-bottom: 14px; }
  .hub-nav { max-width: 1100px; margin: 0 auto; padding: 0 24px 40px; }
  .hub-chips { display: flex; flex-wrap: wrap; gap: 10px; }
  .hub-chip { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: var(--text-muted); background: var(--bg-card); border: 1px solid var(--border); border-radius: 100px; padding: 9px 16px; text-decoration: none; transition: all 0.15s; }
  .hub-chip:hover { border-color: var(--accent); color: var(--accent-dark); box-shadow: var(--shadow); }
  .article-wrap { max-width: 800px; margin: 0 auto; padding: 0 24px 60px; }
  .faq-section { }
  .faq-section > h2 { font-family: 'Roboto', sans-serif; font-size: 24px; font-weight: 700; letter-spacing: -0.4px; color: var(--text); margin-bottom: 8px; }
  .faq-item { border-top: 1px solid var(--border); }
  .faq-q { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; padding: 18px 0; font-family: 'Roboto', sans-serif; font-size: 16px; font-weight: 800; color: var(--text); background: none; border: none; cursor: pointer; text-align: left; transition: color 0.15s; }
  .faq-q:hover { color: var(--accent); }
  .faq-q.open { color: var(--accent); }
  .faq-icon { width: 22px; height: 22px; border-radius: 50%; background: var(--bg); border: 1.5px solid var(--border); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 14px; font-weight: 700; transition: all 0.2s; color: var(--text-muted); }
  .faq-q.open .faq-icon { background: var(--accent-light); border-color: var(--accent); color: var(--accent); transform: rotate(45deg); }
  .faq-a { font-size: 14.5px; color: var(--text-muted); line-height: 1.75; font-weight: 300; padding: 0 0 18px 0; display: none; }
  .faq-a.open { display: block; }
  .page-meta { margin-top: 18px; font-size: 13px; color: var(--text-light); font-weight: 400; }
  .page-meta a { color: var(--accent); text-decoration: none; font-weight: 600; }
  footer { border-top: 1px solid var(--border); padding: 32px 24px; }
  .footer-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
  .footer-logo { font-family: 'Roboto', sans-serif; font-weight: 800; font-size: 17px; color: var(--text); text-decoration: none; }
  .footer-logo span { color: var(--accent); }
  .footer-copy { font-size: 13px; color: var(--text-light); }
  .footer-copy a { white-space: nowrap; }
  @media (max-width: 600px) { .page-header { padding: 32px 20px 20px; } }
</style>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1937179969817973" crossorigin="anonymous"></script>
</head>
<body>

<nav>
  <div class="nav-inner">
    <a class="logo" href="/">Clearly<span>Check</span></a>
    <a class="back-link" href="/">
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18"/></svg>
      All Tools
    </a>
  </div>
</nav>

<div class="page-header">
  <nav aria-label="breadcrumb">
    <div class="breadcrumb">
      <a href="/">Home</a><span>›</span>
      <a href="index.html#tools">Tools</a><span>›</span>
      <span style="color:var(--text-muted);">${cat.label}</span>
    </div>
  </nav>
  <div class="tool-tag-pill">${cat.pill}</div>
  <h1>${cat.h1}</h1>
  <p class="intro">${cat.intro}</p>
  <div class="page-meta">Curated &amp; reviewed by <a href="/about.html">Enos</a>, ClearlyCheck · Last updated ${TODAY}</div>
</div>

<div class="tools-wrap">
  <div class="section-label">${cards.length} tool${cards.length === 1 ? '' : 's'} in ${cat.label}</div>
  <div class="tools-grid">
${cards.map(toolCard).join('\n')}
  </div>
</div>

<div class="hub-nav">
  <div class="section-label">Explore other categories</div>
  <div class="hub-chips">
      ${otherHubLinks(cat)}
      <a class="hub-chip" href="index.html#tools">🧭 All tools</a>
  </div>
</div>

<div class="article-wrap">
  <div class="faq-section">
    <h2>Frequently Asked Questions</h2>
${faqAccordion(cat.faq)}
  </div>
</div>
${disclaimerBlock}
<footer>
  <div class="footer-inner">
    <a class="footer-logo" href="/">Clearly<span>Check</span></a>
    <p class="footer-copy">© 2026 ClearlyCheck · <a href="about.html" style="color:var(--text-light);text-decoration:none;">About</a> · <a href="sitemap.html" style="color:var(--text-light);text-decoration:none;">Sitemap</a> · <a href="contact.html" style="color:var(--text-light);text-decoration:none;">Contact</a> · <a href="terms-of-use.html" style="color:var(--text-light);text-decoration:none;">Terms of Use</a> · <a href="privacy-policy.html" style="color:var(--text-light);text-decoration:none;">Privacy Policy</a></p>
  </div>
</footer>

<script>
document.querySelectorAll('.faq-q').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var answer = btn.nextElementSibling;
    var isOpen = btn.classList.contains('open');
    document.querySelectorAll('.faq-q.open').forEach(function (b) {
      b.classList.remove('open');
      if (b.nextElementSibling) b.nextElementSibling.classList.remove('open');
    });
    if (!isOpen) { btn.classList.add('open'); if (answer) answer.classList.add('open'); }
  });
});
</script>
</body>
</html>
`;
}

// --- Main -------------------------------------------------------------------
const allCards = extractCards();
let total = 0;
for (const cat of CATS) {
  const missing = cat.tools.filter(f => !allCards[f]);
  if (missing.length) { console.error(`  ! ${cat.slug}: missing cards for ${missing.join(', ')}`); continue; }
  fs.writeFileSync(path.join(root, cat.slug + '.html'), render(cat, allCards));
  total += cat.tools.length;
  console.log(`  wrote ${cat.slug}.html (${cat.tools.length} tools)`);
}
console.log(`Hubs built. ${CATS.length} pages, ${total} tool references.`);
