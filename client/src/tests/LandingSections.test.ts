import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { BEFORE_AFTER, ROUND_STEPS, MODES, SAMPLE_PAIRS, PAIR_COUNT, CATEGORY_COUNT } from '../landing/content';

const dir = path.resolve(__dirname, '../landing');
const read = (f: string) => fs.readFileSync(path.join(dir, f), 'utf-8');

describe('Landing Sections (02-06 and Letter Footer)', () => {
  it('BeforeAfter renders comparison plates without paper/juri', () => {
    const src = read('BeforeAfter.tsx');
    expect(src).toContain('BEFORE_AFTER.head');
    expect(src).toContain('BEFORE_AFTER.before');
    expect(src).toContain('BEFORE_AFTER.after');
    expect(BEFORE_AFTER.head).toBe('Tanpa kertas, tanpa juri.');
  });

  it('RoundPinned contains #ronde, data-landing-section, and references all 4 screenshots', () => {
    const src = read('RoundPinned.tsx');
    expect(src).toContain('id="ronde"');
    expect(src).toContain('data-landing-section');
    expect(src).toContain('/landing/screens/reveal.png');
    expect(src).toContain('/landing/screens/describe.png');
    expect(src).toContain('/landing/screens/voting.png');
    expect(src).toContain('/landing/screens/mrwhite.png');
    expect(ROUND_STEPS).toHaveLength(4);
  });

  it('ModeSwitcher provides tablist with accessible keyboard navigation', () => {
    const src = read('ModeSwitcher.tsx');
    expect(src).toContain('id="mode"');
    expect(src).toContain('data-landing-section');
    expect(src).toContain('role="tablist"');
    expect(src).toContain('role="tab"');
    expect(src).toContain('role="tabpanel"');
    expect(src).toContain('ArrowRight');
    expect(src).toContain('ArrowLeft');
    expect(src).toContain('/landing/screens/setup.png');
    expect(src).toContain('/landing/screens/lobby.png');
    expect(MODES.tabs).toHaveLength(2);
  });

  it('WordPackTable contains spec table and stats banner', () => {
    const src = read('WordPackTable.tsx');
    expect(src).toContain('lp-spec-table');
    expect(src).toContain('PAIR_COUNT');
    expect(src).toContain('CATEGORY_COUNT');
    expect(src).toContain('SAMPLE_PAIRS');
    expect(PAIR_COUNT).toBeGreaterThan(50);
    expect(CATEGORY_COUNT).toBeGreaterThanOrEqual(5);
    expect(SAMPLE_PAIRS.length).toBe(8);
  });

  it('LandingClose renders ink band, two CTAs, and home screen', () => {
    const src = read('LandingClose.tsx');
    expect(src).toContain('lp-band--ink');
    expect(src).toContain('Kumpulkan teman. Satu HP cukup.');
    expect(src).toContain('Main di satu HP');
    expect(src).toContain('Buat room online');
    expect(src).toContain('/landing/screens/home.png');
  });

  it('LandingFooter renders signed letter close and navigation links', () => {
    const src = read('LandingFooter.tsx');
    expect(src).toContain('Tim What’s The Word');
    expect(src).toContain('Dibuat untuk malam main bareng teman');
    expect(src).toContain('href="#ronde"');
    expect(src).toContain('href="#mode"');
  });

  it('LandingPage assembles all sections in correct order', () => {
    const src = read('LandingPage.tsx');
    const order = [
      'LandingNav',
      'HeroDeal',
      'BeforeAfter',
      'RoundPinned',
      'ModeSwitcher',
      'WordPackTable',
      'LandingClose',
      'LandingFooter',
    ];

    let lastIndex = -1;
    for (const comp of order) {
      const idx = src.indexOf(comp);
      expect(idx).toBeGreaterThan(lastIndex);
      lastIndex = idx;
    }
  });
});
