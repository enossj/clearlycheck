# Dark Mode + Related-Tool Widget — Design

**Date:** 2026-07-14
**Status:** Approved for planning
**Repo:** clearlycheck (static HTML/CSS/JS, no build step for deploy, `main` = production)

## Goal

Two site-wide UX features across all 31 tool pages + homepage + hub pages:

1. **Dark mode** — user-toggleable, OS-aware, no flash-of-wrong-theme (FOUC), persisted in `localStorage`.
2. **Related-tool widget** — a "Related tools" card section on each tool page, driven by a hand-curated cross-category relation map, to strengthen tool-level internal linking (hubs already handle category-level).

Both ship via idempotent build scripts in `scripts/` following the existing `wire-breadcrumbs.cjs` / `build-hubs.cjs` pattern.

## Constraints

- No backend, no deploy build step. Everything must work as static files served as-is.
- Reuse the existing CSS-variable system in `assets/css/base.css` (`:root { --bg, --text, --bg-card, --border, --accent, ... }`) and `calculator.css`.
- Every page links `base.css` + `calculator.css`, but each tool also has a per-page inline `<style>` block. Some inline blocks hardcode accent tints (e.g. `#fbebe9`, `#e8f5ef`) rather than referencing vars.
- Must stay AdSense-safe: no layout that buries content, no fake ad boxes.
- Mobile-verify at 375px before commit (repo convention).

---

## Component 1: Dark palette (CSS)

Add a `[data-theme="dark"]` override block to **both** `assets/css/base.css` and `assets/css/calculator.css`, redefining the CSS variables already consumed sitewide:

```css
[data-theme="dark"] {
  --bg: #0f0f0e;
  --bg-card: #1a1a18;
  --text: #f0f0ef;
  --text-muted: #a8a7a2;
  --text-light: #7a7975;
  --border: #2a2a27;
  /* --accent stays; add --accent-light dark variant if contrast needs it */
}
```

Because the variables are already the single source of truth for the shared stylesheets, no shared-CSS rule bodies change — only the variable values under the `[data-theme="dark"]` scope.

**Per-page inline-style audit (required):** grep every tool page's inline `<style>` for hardcoded hex colors that should be variables. Two classes of finding:

- **Structural colors** (`--bg`, `--text`, `--border` equivalents hardcoded) → must be converted to `var(--...)` or they break dark mode.
- **Decorative accent tints** (soft result-box backgrounds like `#e8f5ef`) → judgement call per case; acceptable to leave if legible on dark, otherwise add a `[data-theme="dark"]` inline override or a shared token.

This audit is the largest source of manual work and the main correctness risk. It is a first-class task, not a cleanup afterthought.

## Component 2: Dark-mode injector — `scripts/add-dark-mode.cjs`

Idempotent (marker-comment guarded). Injects two things into every page:

**(a) FOUC-safe init script** — placed in `<head>` **before** the CSS `<link>` tags so `data-theme` is set synchronously before first paint:

```html
<!-- theme-init:start -->
<script>
  (function () {
    try {
      var saved = localStorage.getItem('theme');
      var dark = saved ? saved === 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (dark) document.documentElement.setAttribute('data-theme', 'dark');
    } catch (e) {}
  })();
</script>
<!-- theme-init:end -->
```

**(b) Toggle button** — injected into `.nav-inner` (currently `<a class="logo">` + `<a class="back-link">`). A sun/moon button with `aria-label` + `aria-pressed`, click handler flips `data-theme` and writes `localStorage.theme`. Handler logic lives in a shared `assets/js/theme.js` (one file, linked once) so the injector only inserts the button markup + one `<script src>`, not duplicated logic across 31 pages.

**OS-follow behavior:** if the user has never explicitly toggled (no `localStorage.theme`), a `matchMedia('(prefers-color-scheme: dark)')` change listener live-updates the theme. Once the user toggles manually, their choice is written to `localStorage` and wins permanently (listener no longer overrides).

## Component 3: Related-tool map — `scripts/related-tools-map.json`

Hand-curated. Slug → array of 2–3 related tool slugs. Cross-category allowed where it serves the user (e.g. `bmi-calculator` ↔ `calorie-calculator` ↔ `age-calculator`; `calorie-calculator` ↔ `pet-food-calculator`). Each entry stores enough to render a card: the injector reads the related slug, then pulls that tool's display title + category tag from `index.html` (the existing single source of tool metadata) rather than duplicating titles in the JSON.

## Component 4: Related-tool injector — `scripts/add-related-tools.cjs`

Idempotent (marker-comment guarded). For each tool page:

- Inserts a `<!-- related:start -->…<!-- related:end -->` section **immediately before `<footer>`** (after the FAQ / `</article>`).
- Renders 2–3 cards reusing the existing homepage/hub `.tool-card` markup + CSS for visual consistency (no new card styles).
- **Warns loudly** (non-zero exit or explicit console warning listing offending slugs) if a tool page has no entry in `related-tools-map.json`, so curation debt surfaces instead of silently producing empty widgets.
- Re-runnable: regenerates the section in place on every run.

---

## Data flow

```
related-tools-map.json ─┐
index.html (titles/tags)─┼─> add-related-tools.cjs ─> injects <!-- related --> section per page
                         │
base.css/calculator.css [data-theme=dark]  <── consumed at runtime by ──┐
add-dark-mode.cjs ─> injects theme-init + nav toggle + theme.js <script> ┘
assets/js/theme.js ─> runtime toggle handler + OS-follow listener
```

## Idempotency & maintenance

All injectors are marker-comment guarded and safe to re-run. Update the CLAUDE.md "recurring bug: nav/count sync" checklist to add, for every new tool:

- Add the new slug (and its related slugs) to `related-tools-map.json`, then re-run `add-related-tools.cjs`.
- Re-run `add-dark-mode.cjs` on the new page (or run sitewide; idempotent).

`add-dark-mode.cjs` is effectively one-time for existing pages but must run on any newly added page — same lifecycle as `optimize-fonts.cjs`.

## Error handling / edge cases

- **FOUC:** mitigated by synchronous pre-CSS init script. Verify under throttled network + hard refresh.
- **localStorage disabled / private mode:** `try/catch` around all storage access; falls back to OS preference, never throws.
- **OS theme change mid-session:** respected only until first manual toggle.
- **Missing related-map entry:** injector warns; page ships without the section rather than an empty box.
- **Hardcoded inline colors:** caught by the audit pass; structural ones converted, decorative ones overridden or accepted per legibility.
- **Legacy tools** (bmi, age, debt, salary, timezone) share JS modules but the same CSS/nav/footer structure — same injection applies; extra attention in the color audit since they are older.

## Testing / verification

- `npm test` (vitest) — must still pass; no calculator-logic changes expected.
- Manual dark/light toggle on a representative set at 375px **and** desktop:
  - 1 recent self-contained tool (e.g. `pet-food-calculator.html`)
  - 1 legacy shared-JS tool (e.g. `bmi-calculator.html`)
  - `index.html` (homepage)
  - 1 hub page (e.g. `finance-calculators.html`)
- FOUC check: hard refresh with cache disabled, dark saved — no white flash.
- Related-widget: verify every one of the 31 pages renders 2–3 valid, non-404 related links.
- a11y: toggle reachable by keyboard, `aria-pressed` reflects state, contrast meets WCAG AA in dark.

## Out of scope (YAGNI)

- Per-tool theme customization, multiple themes beyond light/dark.
- Auto-generated / algorithmic relations (explicitly chose curated map).
- Animated theme transitions beyond a simple CSS `transition` if trivial.
- Any backend, analytics, or personalization storage beyond the single `theme` key.
