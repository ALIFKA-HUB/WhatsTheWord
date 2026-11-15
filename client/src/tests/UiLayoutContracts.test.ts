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

describe('RoomGamePage parity and HomePage focus contract', () => {
  it('supports initialFocus and initialOpenPacks in HomePage and exit/re-peek/gameover parity in RoomGamePage', () => {
    const homeSrc = fs.readFileSync(path.join(srcDir, 'pages/HomePage.tsx'), 'utf-8');
    const roomSrc = fs.readFileSync(path.join(srcDir, 'pages/RoomGamePage.tsx'), 'utf-8');
    const appSrc = fs.readFileSync(path.join(srcDir, 'App.tsx'), 'utf-8');
    const headerSrc = fs.readFileSync(path.join(srcDir, 'components/common/Header.tsx'), 'utf-8');

    expect(homeSrc).toContain('initialFocus');
    expect(homeSrc).toContain('initialOpenPacks');
    expect(roomSrc).toContain('gameover-art.svg');
    expect(roomSrc).toContain('isRePeekOpen');
    expect(roomSrc).toContain('isExitConfirmOpen');
    expect(roomSrc).toContain("if (phase !== 'TURN_PHASE' && phase !== 'VOTING')");
    expect(roomSrc).toContain('setIsRePeekOpen(false)');
    expect(appSrc).toContain('goToHome');
    expect(appSrc).toContain('setHomeIntent({})');
    expect(appSrc).toContain("goToApp('PASS_PLAY')");
    expect(appSrc).toContain("goToApp('ONLINE')");
    expect(headerSrc).not.toContain('xs:');
    expect(headerSrc).toContain('max-w-[130px] sm:max-w-none');
  });
});

describe('Landing CSS token resolution and copy accuracy', () => {
  it('defines .lp-root aliases for paper-2, ink-2, and shadow-card in landing.css', () => {
    const css = fs.readFileSync(path.join(srcDir, 'landing/landing.css'), 'utf-8');
    expect(css).toContain('.lp-root .bg-paper-2');
    expect(css).toContain('.lp-root .text-ink-2');
    expect(css).toContain('.lp-root .shadow-card');
  });

  it('states 4-character room code accurately in landing content', () => {
    const content = fs.readFileSync(path.join(srcDir, 'landing/content.ts'), 'utf-8');
    expect(content).toContain('4 karakter');
    expect(content).not.toContain('6 karakter');
  });
});

describe('Landing section navigation and visual polish', () => {
  it('exposes paket-kata section anchor in LandingNav and WordPackTable', () => {
    const navSrc = fs.readFileSync(path.join(srcDir, 'landing/LandingNav.tsx'), 'utf-8');
    const tableSrc = fs.readFileSync(path.join(srcDir, 'landing/WordPackTable.tsx'), 'utf-8');
    const beforeAfterSrc = fs.readFileSync(path.join(srcDir, 'landing/BeforeAfter.tsx'), 'utf-8');

    expect(navSrc).toContain('href="#paket-kata"');
    expect(tableSrc).toContain('id="paket-kata"');
    expect(tableSrc).toContain('onOpenCustomPacks');
    expect(beforeAfterSrc).toContain('CheckCircle');
    expect(beforeAfterSrc).toContain('XCircle');
  });
});

