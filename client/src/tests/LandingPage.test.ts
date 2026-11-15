import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { HERO } from '../landing/content';

const dir = path.resolve(__dirname, '../landing');
const all = fs
  .readdirSync(dir)
  .filter((f) => /\.(tsx|ts|css)$/.test(f))
  .map((f) => fs.readFileSync(path.join(dir, f), 'utf-8'))
  .join('\n');

describe('landing page floor', () => {
  it('hero headline is 7 words or fewer, sentence 12 or fewer', () => {
    expect(HERO.title.split(/\s+/).length).toBeLessThanOrEqual(7);
    expect(HERO.sentence.split(/\s+/).length).toBeLessThanOrEqual(12);
  });

  it('has no sparkle icons, eyebrows or tracked caps', () => {
    expect(all).not.toContain('Sparkle');
    expect(all).not.toMatch(/tracking-widest|uppercase/);
  });

  it('never uses transition: all or transition-all', () => {
    expect(all).not.toMatch(/transition:\s*all/);
    expect(all).not.toContain('transition-all');
  });

  it('guards scroll choreography behind support and reduced motion', () => {
    expect(all).toContain('@supports (animation-timeline: view())');
    expect(all).toContain('prefers-reduced-motion: no-preference');
  });

  it('invents no testimonial or rating', () => {
    expect(all).not.toMatch(/testimoni|rating|bintang 5|ribuan pemain/i);
  });
});
