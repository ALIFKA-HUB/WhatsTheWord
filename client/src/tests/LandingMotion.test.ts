import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const src = fs.readFileSync(path.resolve(__dirname, '../landing/useCardTimeline.ts'), 'utf-8');

describe('useCardTimeline contract', () => {
  it('respects reduced motion', () => {
    expect(src).toContain('useReducedMotion');
  });

  it('starts in view, not on scroll listeners', () => {
    expect(src).toContain('useInView');
    expect(src).not.toContain("addEventListener('scroll'");
  });

  it('only animates transform and opacity', () => {
    expect(src).not.toMatch(/\b(width|height|top|left)\s*:/);
  });
});
