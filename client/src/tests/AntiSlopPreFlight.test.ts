import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

function collectSourceFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'tests' && entry.name !== 'data') {
      files.push(...collectSourceFiles(full));
    } else if (entry.isFile() && /\.(tsx|ts)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

describe('Anti-Slop Pre-Flight Audit (design-taste-frontend)', () => {
  const srcDir = path.resolve(__dirname, '..');
  const files = collectSourceFiles(srcDir);

  it('has zero lucide-react imports remaining in client/src', () => {
    const offenders = files.filter((f) => fs.readFileSync(f, 'utf-8').includes('lucide-react'));
    expect(offenders).toEqual([]);
  });

  it('has zero em-dashes or &mdash; entities in UI components and pages', () => {
    const offenders: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('—') || content.includes('–') || content.includes('&mdash;')) {
        offenders.push(path.relative(srcDir, file));
      }
    }
    expect(offenders).toEqual([]);
  });

  it('has zero legacy dark-SaaS neon card classes in pages and components', () => {
    const offenders: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      if (
        content.includes('bg-zinc-900') ||
        content.includes('bg-slate-900') ||
        content.includes('shadow-cyan-') ||
        content.includes('backdrop-blur-md') ||
        content.includes('bg-black/40') ||
        content.includes('text-purple-200') ||
        content.includes('from-cyan-400') ||
        content.includes('bg-stamp-950')
      ) {
        offenders.push(path.relative(srcDir, file));
      }
    }
    expect(offenders).toEqual([]);
  });

  it('guarantees SecretCard has leak-proof geometry, opacity transition, DOM bullet mask, and zero Warga/Impostor role clues', () => {
    const secretCardPath = path.join(srcDir, 'components', 'game', 'SecretCard.tsx');
    const content = fs.readFileSync(secretCardPath, 'utf-8');
    expect(content).toContain('h-[210px]');
    expect(content).toContain('opacity-100');
    expect(content).toContain('opacity-0');
    expect(content).toContain("isHolding ? (word || 'Kata Rahasia') : '••••••••'");
    expect(content).not.toContain("role === 'UNDERCOVER'");
    expect(content).not.toContain("role === 'CIVILIAN'");
  });

  it('has zero class syntax typos like "-xl" in pages and components', () => {
    const offenders: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes(' -xl ') || content.includes('"-xl ') || content.includes(' -xl"')) {
        offenders.push(path.relative(srcDir, file));
      }
    }
    expect(offenders).toEqual([]);
  });

  it('guarantees CustomWordPackModal has zero AI sparkle icons and zero color token leaks', () => {
    const modalPath = path.join(srcDir, 'components', 'lobby', 'CustomWordPackModal.tsx');
    const content = fs.readFileSync(modalPath, 'utf-8');
    expect(content).not.toContain('Sparkle');
    expect(content).not.toContain('cyan-');
    expect(content).not.toContain('stamp-500');
  });
});
