import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const map = JSON.parse(readFileSync(join(root, 'scripts/related-tools-map.json'), 'utf8'));

const NON_TOOL = new Set([
  'index', 'about', 'contact', 'privacy-policy', 'terms-of-use', 'sitemap',
  'finance-calculators', 'health-calculators', 'productivity-tools',
  'utility-tools', 'pet-tools', 'education-tools', 'google1d81c29365628a0c',
]);
const tools = readdirSync(root)
  .filter(f => f.endsWith('.html'))
  .map(f => f.replace(/\.html$/, ''))
  .filter(s => !NON_TOOL.has(s));

describe('related-tools-map', () => {
  it('has an entry for every tool page', () => {
    for (const t of tools) expect(map[t], `missing map entry: ${t}`).toBeDefined();
  });
  it('every key is a real tool', () => {
    for (const k of Object.keys(map)) expect(tools, `stale key: ${k}`).toContain(k);
  });
  it('each entry has 2–3 valid, non-self related slugs', () => {
    for (const [k, rel] of Object.entries(map)) {
      expect(rel.length, `${k} count`).toBeGreaterThanOrEqual(2);
      expect(rel.length, `${k} count`).toBeLessThanOrEqual(3);
      expect(new Set(rel).size, `${k} has dupes`).toBe(rel.length);
      for (const r of rel) {
        expect(r, `${k} -> self`).not.toBe(k);
        expect(tools, `${k} -> unknown ${r}`).toContain(r);
      }
    }
  });
});
