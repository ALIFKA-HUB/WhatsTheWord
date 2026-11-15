import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const dir = path.resolve(__dirname, '../landing');
const read = (f: string) => fs.readFileSync(path.join(dir, f), 'utf-8');

describe('landing tokens', () => {
  it('never redeclares :root (app Hum tokens stay intact)', () => {
    expect(read('tokens.css')).not.toMatch(/:root\s*\{/);
    expect(read('base.css')).not.toMatch(/:root\s*\{/);
  });

  it('scopes Terrazzo to .lp-root', () => {
    expect(read('tokens.css')).toContain('.lp-root');
    expect(read('tokens.css')).toContain('--color-plate');
  });

  it('opens landing.css with the Hallmark stamp', () => {
    const first = read('landing.css').split('\n').find((l) => l.trim().length > 0)!;
    expect(first).toMatch(/^\/\* Hallmark/);
  });
});
