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

describe('PassPlayVotingView and MrWhiteModal contracts', () => {
  it('activates handover privacy shield for the first voter in individual secret voting', () => {
    const src = fs.readFileSync(path.join(srcDir, 'components/game/PassPlayVotingView.tsx'), 'utf-8');
    expect(src).toContain('setIsHandingOverSecretVote(true)');
    expect(src).not.toContain('(3x = Impostor menang)');
    expect(src).toContain('${maxTies}x = Impostor menang');
    expect(src).toContain('<MrWhiteModal');
  });

  it('supports optional handover privacy shield and give-up action in MrWhiteModal', () => {
    const src = fs.readFileSync(path.join(srcDir, 'components/game/MrWhiteModal.tsx'), 'utf-8');
    expect(src).toContain('requireHandoverShield');
    expect(src).toContain('onGiveUp');
  });
});

describe('PassPlaySetupPage and PassPlayGamePage UI hygiene', () => {
  it('uses zero native browser alert() or confirm() dialogs and includes min-w-0 on flex player input', () => {
    const setupSrc = fs.readFileSync(path.join(srcDir, 'pages/PassPlaySetupPage.tsx'), 'utf-8');
    const gameSrc = fs.readFileSync(path.join(srcDir, 'pages/PassPlayGamePage.tsx'), 'utf-8');

    expect(setupSrc).not.toMatch(/\balert\(/);
    expect(setupSrc).toContain('flex-1 min-w-0');
    expect(setupSrc).toContain('<AvatarPicker');
    expect(gameSrc).not.toMatch(/\bconfirm\(/);
    expect(gameSrc).toContain('<Modal');
  });
});
