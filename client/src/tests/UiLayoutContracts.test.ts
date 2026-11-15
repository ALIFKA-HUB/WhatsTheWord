import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const srcDir = path.resolve(__dirname, '..');

describe('SecretCard layout and pointer contract', () => {
  it('opens enough window above the 210px pocket flap and top-aligns secret content without my-auto occlusion', () => {
    const src = fs.readFileSync(path.join(srcDir, 'components/game/SecretCard.tsx'), 'utf-8');
    expect(src).toContain('h-[400px]');
    expect(src).toContain('h-[210px]');
    expect(src).not.toContain('my-auto');
    expect(src).toContain('onPointerDown=');
    expect(src).toContain('onPointerUp={endHold}');
  });
});
