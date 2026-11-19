import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const dir = path.resolve(__dirname, '../landing');
const read = (f: string) => fs.readFileSync(path.join(dir, f), 'utf-8');

describe('landing tokens (Hum unified)', () => {
  it('never redeclares :root (app Hum tokens stay intact)', () => {
    expect(read('tokens.css')).not.toMatch(/:root\s*\{/);
    expect(read('base.css')).not.toMatch(/:root\s*\{/);
  });

  it('inherits Hum palette and typography without Terrazzo overrides', () => {
    const tokens = read('tokens.css');
    const page = read('LandingPage.tsx');
    expect(tokens).toContain('.lp-root');
    expect(tokens).toContain('--color-card');
    expect(tokens).not.toContain('--color-paper:');
    expect(tokens).not.toContain('--font-display:');
    expect(page).not.toContain('@fontsource/syne');
    expect(page).not.toContain('@fontsource-variable/onest');
  });

  it('opens landing.css with the Hallmark stamp and preserves single light theme', () => {
    const css = read('landing.css');
    const first = css.split('\n').find((l) => l.trim().length > 0)!;
    expect(first).toMatch(/^\/\* Hallmark/);
    expect(css).not.toContain('.lp-band--ink');
    expect(css).toContain('lp-marquee-scroll');
  });
});
