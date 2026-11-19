import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { MINI_ROUNDS, ROUND_STEPS, MODES, SAMPLE_PAIRS, PAIR_COUNT, CATEGORY_COUNT, ROLE_GUIDES } from '../landing/content';

const dir = path.resolve(__dirname, '../landing');
const read = (f: string) => fs.readFileSync(path.join(dir, f), 'utf-8');

describe('Landing Sections (Unified Hum + Interactive Playgrounds)', () => {
  it('HeroDeal includes interactive control dock, flattened cards, and clean Hum markup', () => {
    const src = read('HeroDeal.tsx');
    const navSrc = read('LandingNav.tsx');
    const cssSrc = read('landing.css');
    const contentSrc = read('content.ts');

    expect(src).toContain('Bagikan ulang');
    expect(src).toContain('Ganti kata');
    expect(src).toContain('Mr. White');
    expect(src).not.toContain('w-2 h-2 rounded-full');
    expect(src).not.toContain('CardBackCrest');
    expect(src).not.toContain('HERO.facts');
    expect(src).not.toContain('lp-deal-card-inner');
    expect(src).not.toContain('\u00b7');
    expect(src).not.toContain("whiteSpace: 'nowrap'");
    expect(contentSrc).not.toContain('facts:');
    expect(navSrc).toContain('lp-btn--nav');
    expect(navSrc).not.toContain('lp-btn--primary');
    expect(cssSrc).toContain('.lp-btn--nav');
    expect(cssSrc).toContain('100dvh');
  });

  it('LandingMarquee renders a single marquee strip without middle dots', () => {
    const src = read('LandingMarquee.tsx');
    expect(src).toContain('lp-marquee-track');
    expect(src).not.toContain('\u00b7');
  });

  it('SetupMechanismSection connects RoleDispenserFigure, role tabs, and scaleX bars', () => {
    const src = read('SetupMechanismSection.tsx');
    expect(src).toContain('id="mekanisme"');
    expect(src).toContain('RoleDispenserFigure');
    expect(src).toContain('scaleX');
    expect(src).toContain('roleBreakdownFor');
    expect(ROLE_GUIDES).toHaveLength(3);
  });

  it('MiniRoundWidget provides playable voting cases', () => {
    const src = read('MiniRoundWidget.tsx');
    expect(src).toContain('MINI_ROUNDS');
    expect(src).toContain('Tebak siapa penyamarnya');
    expect(MINI_ROUNDS.length).toBeGreaterThanOrEqual(3);
  });

  it('RoundPinned contains #ronde, MiniRoundWidget, and references all 4 screenshots', () => {
    const src = read('RoundPinned.tsx');
    expect(src).toContain('id="ronde"');
    expect(src).toContain('data-landing-section');
    expect(src).toContain('MiniRoundWidget');
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

  it('WordPackShowcase renders filterable card grid without row-dump table', () => {
    const src = read('WordPackShowcase.tsx');
    expect(src).toContain('id="paket"');
    expect(src).toContain('PAIR_COUNT');
    expect(src).toContain('CATEGORY_COUNT');
    expect(src).toContain('SAMPLE_PAIRS');
    expect(src).not.toContain('lp-spec-table');
    expect(src).not.toContain('<table');
    expect(PAIR_COUNT).toBeGreaterThan(50);
    expect(CATEGORY_COUNT).toBeGreaterThanOrEqual(5);
    expect(SAMPLE_PAIRS.length).toBe(8);
  });

  it('LandingClose renders light Hum card, consistent CTAs, and home screen', () => {
    const src = read('LandingClose.tsx');
    expect(src).not.toContain('lp-band--ink');
    expect(src).toContain('Kumpulkan teman. Satu HP cukup.');
    expect(src).toContain('Main di satu HP');
    expect(src).toContain('Buat room online');
    expect(src).toContain('/landing/screens/home.png');
  });

  it('LandingFooter renders signed letter close and navigation links', () => {
    const src = read('LandingFooter.tsx');
    expect(src).toContain('Tim What’s The Word');
    expect(src).toContain('Dibuat untuk malam main bareng teman');
    expect(src).toContain('href="#mekanisme"');
    expect(src).toContain('href="#ronde"');
    expect(src).toContain('href="#mode"');
    expect(src).toContain('href="#paket"');
  });

  it('LandingPage assembles all sections in correct order', () => {
    const src = read('LandingPage.tsx');
    const order = [
      'LandingNav',
      'HeroDeal',
      'LandingMarquee',
      'SetupMechanismSection',
      'RoundPinned',
      'ModeSwitcher',
      'WordPackShowcase',
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
