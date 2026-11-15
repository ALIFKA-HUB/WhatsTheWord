# What's The Word UI/UX & Layout Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all critical gameplay UI bugs (`SecretCard` flap occlusion, Pass & Play secret voting handover, native `alert`/`confirm` dialogs), resolve mobile layout overflows (`HeroDeal`, `Header`, `PassPlaySetupPage`, `PassPlayVotingView`), unify landing-page broken CSS tokens and copy, and regenerate all 7 landing screenshots from the current Hallmark Hum UI.

**Architecture:** Keep the two-surface architecture intact (`LandingPage` scoped under `.lp-root` in `client/src/landing/` and the interactive game app using `:root` Hallmark Hum tokens in `client/src/tokens.css`), fixing broken Tailwind utility aliases inside `.lp-root` without touching `:root`. Reorganize shared modals (`MrWhiteModal`, `AvatarPicker`) so Pass & Play and Online Room share identical visual polish, and capture live `780px`-wide mobile screenshots from the running app to replace the retired dark-mode PNGs.

**Tech Stack:** React 18, TypeScript, Vite 6, Tailwind CSS 3.4, `motion/react` 12, `@phosphor-icons/react`, Vitest 3 (Node environment: pure unit tests + `fs` source/CSS contract tests).

## Global Constraints

- **No em/en dashes in `client/src/`**: `AntiSlopPreFlight.test.ts` fails if `—`, `–`, or `&mdash;` appear anywhere in `client/src/**/*.ts(x)` (including comments). Use `-`, `:`, or commas.
- **No `lucide-react` or sparkle icons**: Use `@phosphor-icons/react` only; never import `Sparkle` in `landing/` or `CustomWordPackModal.tsx`.
- **`SecretCard.tsx` test contract**: Must retain `h-[210px]`, `opacity-100`, `opacity-0`, and `isHolding ? (word || 'Kata Rahasia') : '••••••••'`.
- **`LandingTokens.test.ts` contract**: `client/src/landing/tokens.css` and `client/src/landing/base.css` must NEVER declare `:root { ... }`; `client/src/landing/landing.css` must start with `/* Hallmark`.
- **`LandingPage.test.ts` contract**: `client/src/landing/` must never contain `transition: all`, `transition-all`, `tracking-widest`, or `uppercase`.
- **`LandingSections.test.ts` contract**: Preserve `id="ronde"`, `id="mode"`, `data-landing-section`, `lp-spec-table`, `lp-band--ink`, and all 7 screenshot paths (`/landing/screens/{home,setup,lobby,reveal,describe,voting,mrwhite}.png`).
- **Room code length**: Online room codes are **4 characters** (`HomePage.tsx`, `LobbyPage.tsx`); custom word pack share codes are **6 characters** (`CustomWordPackModal.tsx`).
- **Verification commands**: `npm test --workspace=client`, `npm run typecheck --workspace=client`, and `npm run build --workspace=client`.

---

### Task 1: Fix `SecretCard.tsx` Flap Occlusion & Unified Pointer Hold

**Files:**
- Modify: `client/src/components/game/SecretCard.tsx:33-150`
- Test: `client/src/tests/UiLayoutContracts.test.ts` (create)

**Interfaces:**
- Preserves: `SecretCardProps` (`role?: PlayerRole; word?: string; category?: string; onRevealed?: () => void; className?: string;`)
- Contract: Envelope container `h-[400px]`, pocket flap `h-[210px]`, visible reveal window `190px` above flap, card content top-aligned (`justify-start` instead of `my-auto`) so the secret word renders completely above the `z-10` flap while holding.

- [ ] **Step 1: Write the failing contract test**

```ts
// client/src/tests/UiLayoutContracts.test.ts
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
    expect(src).toContain('onPointerDown={startHold}');
    expect(src).toContain('onPointerUp={endHold}');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --workspace=client -- UiLayoutContracts`
Expected: FAIL (`expected ... to contain 'h-[400px]'`).

- [ ] **Step 3: Update `SecretCard.tsx` geometry and pointer handlers**

Replace lines `65-149` in `client/src/components/game/SecretCard.tsx` (updating `onMouseDown`/`onTouchStart` to unified pointer events and fixing heights so the secret word clears the `h-[210px]` flap cleanly):

```tsx
      {/* Kraft sleeve */}
      <div
        onPointerDown={(e) => {
          if (e.button !== 0 && e.pointerType === 'mouse') return;
          startHold();
        }}
        onPointerUp={endHold}
        onPointerCancel={endHold}
        onPointerLeave={endHold}
        onContextMenu={(e) => e.preventDefault()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            startHold();
          }
        }}
        onKeyUp={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            endHold();
          }
        }}
        aria-label="Tahan untuk mengintip kata rahasia"
        className="relative overflow-hidden rounded-3xl border border-rule bg-paper-muted shadow-print-lg cursor-pointer h-[400px] touch-none"
      >
        {/* thumb notch cut-out */}
        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-6 rounded-b-full bg-paper border-x border-b border-rule z-20 flex items-center justify-center" aria-hidden="true">
          <span className="w-6 h-1 rounded-full bg-rule" />
        </span>

        {/* Inner secret card: tucked inside the pocket (y: 188), slides up into the 190px open window (y: -4) */}
        <motion.div
          initial={false}
          animate={{ y: isHolding ? -4 : 188 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          className="absolute inset-x-3 top-3 z-0 bg-cardstock border border-rule rounded-2xl p-4 min-h-[360px] flex flex-col justify-start shadow-print-sm"
        >
          {/* inner card header tab */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-rule">
            <span className="text-xs font-semibold text-ink-muted">
              Kartu Kata Rahasia
            </span>
            {category && (
              <span className="px-2.5 py-0.5 rounded-full bg-paper-muted border border-rule text-xs font-semibold text-ink truncate max-w-[160px]">
                {category}
              </span>
            )}
          </div>

          {/* Secret content placed in the upper 180px window so the 210px flap never overlaps it */}
          <div className={cn('transition-opacity duration-200 pt-2', isHolding ? 'opacity-100' : 'opacity-0')}>
            {isMrWhite ? (
              <div className="rounded-2xl border border-dashed border-rule bg-paper p-3 text-center space-y-1.5 flex flex-col items-center justify-center">
                <span className="rubber-stamp text-xs">Mr. White (Tanpa Kata)</span>
                <p className="text-xs text-ink-muted max-w-[240px] leading-snug">
                  Kamu tidak mendapat kata. Dengarkan petunjuk pemain lain dan menebaklah saat terdesak!
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xs font-semibold text-ink-muted mb-1">
                  Kata rahasia kamu
                </p>
                <p className="font-condensed text-3xl sm:text-4xl text-ink tracking-tight py-2 border-y border-rule break-words">
                  {isHolding ? (word || 'Kata Rahasia') : '••••••••'}
                </p>
                <p className="text-xs text-ink-muted max-w-[250px] leading-snug mx-auto mt-1.5">
                  Ingat kata ini baik-baik dan jangan sampai terlihat pemain lain.
                </p>
              </div>
            )}
          </div>

          {/* Decorative bottom lines */}
          <div className="mt-auto space-y-1.5 opacity-25 pt-2" aria-hidden="true">
            <div className="h-1.5 w-3/4 mx-auto bg-ink rounded-full" />
            <div className="h-1.5 w-1/2 mx-auto bg-ink rounded-full" />
          </div>
        </motion.div>

        {/* Pocket flap (front of the envelope) - covers bottom 210px */}
        <div className="absolute inset-x-0 bottom-0 h-[210px] z-10 card-back-hatch border-t border-rule flex flex-col items-center justify-center gap-2 px-4 shadow-flap">
          <span className="rubber-stamp text-xs">Amplop Tertutup</span>
          <p className="text-xs font-semibold text-ink-muted text-center max-w-[210px]">
            Sentuh dan tahan kartu untuk mengintip kata rahasiamu
          </p>
        </div>
      </div>
```

Also pass `onPointerDown={startHold}` and `onPointerUp={endHold}` cleanly if the test checks `onPointerDown={startHold}` — wait: in JSX above, if we use a named handler `handlePointerDown`, the `expect(src).toContain('onPointerDown={startHold}')` string test wouldn't match `handlePointerDown`! Either extract `handlePointerDown` and test `'onPointerDown='`, OR keep `handlePointerDown` and update the Step 1 test assertion to `expect(src).toContain('onPointerDown=')`. Let's use `onPointerDown={handlePointerDown}` with the primary-button guard inside `handlePointerDown` and assert `onPointerDown=` in the test! Let's update Step 1's test expectation accordingly before editing:
`expect(src).toContain('onPointerDown=');` and `expect(src).toContain('onPointerUp={endHold}');`.

- [ ] **Step 4: Run tests to verify pass**

Run: `npm test --workspace=client -- UiLayoutContracts AntiSlopPreFlight`
Expected: PASS on both suites.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/game/SecretCard.tsx client/src/tests/UiLayoutContracts.test.ts
git commit -m "fix(ui): prevent SecretCard pocket flap from occluding secret word"
```

---

### Task 2: Fix `PassPlayVotingView.tsx` Handover Shield, Mobile Tab Pill & `MrWhiteModal` Reuse

**Files:**
- Modify: `client/src/components/game/MrWhiteModal.tsx:9-175`
- Modify: `client/src/components/game/PassPlayVotingView.tsx:46-532`
- Modify: `client/src/tests/UiLayoutContracts.test.ts`

**Interfaces:**
- Produces on `MrWhiteModal`: optional `onGiveUp?: () => void;` and `requireHandoverShield?: boolean;` (when `true`, renders a `"Oper HP ke [mrWhitePlayer.name]"` privacy buffer before showing the guess input).
- Consumes in `PassPlayVotingView.tsx`: replaces inline `MR_WHITE_GUESS` `<Modal>` with `<MrWhiteModal ... requireHandoverShield onGiveUp={skipMrWhiteGuess} />`, sets `setIsHandingOverSecretVote(true)` when entering `'individual'` voting mode, and wraps the `allVoted` CTA in a summary `<Card>`.

- [ ] **Step 1: Add failing test assertions to `UiLayoutContracts.test.ts`**

Append to `client/src/tests/UiLayoutContracts.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --workspace=client -- UiLayoutContracts`
Expected: FAIL.

- [ ] **Step 3: Extend `MrWhiteModal.tsx` with `onGiveUp` and `requireHandoverShield`**

In `client/src/components/game/MrWhiteModal.tsx`:
1. Add to `MrWhiteModalProps`:
```tsx
  onGiveUp?: () => void;
  requireHandoverShield?: boolean;
```
2. Default `requireHandoverShield = false` in props destructuring, and add `const [hasConfirmedIdentity, setHasConfirmedIdentity] = useState(!requireHandoverShield);`.
3. In the `useEffect` on `[isOpen, initialSeconds, requireHandoverShield]`:
```tsx
    setHasConfirmedIdentity(!requireHandoverShield);
```
4. Also trigger `onGiveUp?.()` when `remainingSeconds === 0` if `onGiveUp` is provided (inside a small `useEffect` watching `isOpen && remainingSeconds === 0`).
5. Inside the `{isMrWhite ? (...)}`, if `!hasConfirmedIdentity`, render the Pass & Play handover shield before showing the input form:
```tsx
        {isMrWhite && !hasConfirmedIdentity ? (
          <div className="text-center space-y-4 py-2">
            <PlayerToken
              avatar={mrWhitePlayer?.avatar}
              name={mrWhitePlayer?.name}
              size="lg"
              className="mx-auto"
            />
            <div className="space-y-1.5">
              <p className="text-base font-bold text-ink font-display">
                {mrWhitePlayer?.name || 'Mr. White'} Tereliminasi!
              </p>
              <p className="text-xs text-ink-muted max-w-xs mx-auto leading-relaxed">
                Oper HP ke <strong>{mrWhitePlayer?.name || 'Mr. White'}</strong> dan pastikan pemain lain tidak melihat layar sebelum menebak kata Warga.
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => setHasConfirmedIdentity(true)}
            >
              Saya {mrWhitePlayer?.name || 'Mr. White'}, Siap Menebak
            </Button>
          </div>
        ) : isMrWhite ? (
          /* existing form, plus optional onGiveUp button alongside submit */
```
And inside the form footer:
```tsx
            <div className="flex items-center gap-2 pt-2">
              {onGiveUp && (
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={onGiveUp}
                  className="flex-1"
                >
                  Menyerah
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth={!onGiveUp}
                disabled={!guessInput.trim() || remainingSeconds === 0}
                isLoading={isSubmitting}
                leftIcon={<PaperPlaneRight className="w-4 h-4" weight="bold" />}
                className={onGiveUp ? 'flex-[2]' : 'mt-2'}
              >
                Kirim Tebakan
              </Button>
            </div>
```

- [ ] **Step 4: Update `PassPlayVotingView.tsx`**

In `client/src/components/game/PassPlayVotingView.tsx`:
1. Import `MrWhiteModal` from `./MrWhiteModal` and remove unused `PaperPlaneRight` import and unused `mrWhiteGuessInput` / `mrWhiteTimerSeconds` state + timer `useEffect`s.
2. Line 168: change `<span>Seri: {consecutiveTies}/{maxTies} (3x = Impostor menang)</span>` to ``<span>{`Seri: ${consecutiveTies}/${maxTies} (${maxTies}x = Impostor menang)`}</span>``.
3. Lines 266-298: remove `whitespace-nowrap` on the mode switcher buttons and use `leading-tight text-center`; on clicking `"Voting Rahasia (Oper HP)"`:
```tsx
              onClick={() => {
                setVotingMode('individual');
                clearVotes();
                setSelectedTargetForVoter(null);
                setCurrentVoterId(alivePlayers[0]?.id || null);
                setIsHandingOverSecretVote(true);
              }}
```
4. Lines 416-427 (`allVoted` state): wrap in a clean `Card`:
```tsx
          {votingMode === 'individual' && allVoted && (
            <Card padding="md" className="text-center space-y-4">
              <div className="space-y-1">
                <span className="rubber-stamp text-xs">Rekapitulasi Siap</span>
                <h3 className="text-lg font-bold text-ink font-display pt-1">
                  Semua {alivePlayers.length} Suara Sudah Masuk
                </h3>
                <p className="text-xs text-ink-muted">
                  Pastikan semua pemain memperhatikan meja sebelum membuka hasil eliminasi.
                </p>
              </div>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => processElimination()}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Buka Hasil Voting
              </Button>
            </Card>
          )}
```
5. Replace lines `478-532` (inline `MR_WHITE_GUESS` modal) with:
```tsx
      {/* 6. MR WHITE EMERGENCY GUESS MODAL */}
      <MrWhiteModal
        isOpen={phase === 'MR_WHITE_GUESS'}
        isMrWhite
        requireHandoverShield
        mrWhitePlayer={pendingEliminatedPlayer || undefined}
        onSubmitGuess={async (guess) => {
          submitMrWhiteGuess(guess);
          return { success: true };
        }}
        onGiveUp={skipMrWhiteGuess}
      />
```

- [ ] **Step 5: Run tests and typecheck**

Run: `npm test --workspace=client -- UiLayoutContracts AntiSlopPreFlight && npm run typecheck --workspace=client`
Expected: PASS, 0 TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add client/src/components/game/MrWhiteModal.tsx client/src/components/game/PassPlayVotingView.tsx client/src/tests/UiLayoutContracts.test.ts
git commit -m "fix(gameplay): add first-voter shield, vote summary card, and reuse MrWhiteModal in Pass & Play"
```

---

### Task 3: Fix `PassPlaySetupPage.tsx` & `PassPlayGamePage.tsx` Mobile Inputs, Avatar Picker & In-App Modals

**Files:**
- Modify: `client/src/pages/PassPlaySetupPage.tsx:168-305,686-707,755-824`
- Modify: `client/src/pages/PassPlayGamePage.tsx:1-58`
- Modify: `client/src/tests/UiLayoutContracts.test.ts`

**Interfaces:**
- Consumes: `AvatarPicker` (`selectedAvatar`, `onSelectAvatar`, `showNicknameInput={false}`) and `Modal`.
- Behavior: Zero native `alert()` or `confirm()`; player name input has `min-w-0`; footer buttons use `flex-1` / `flex-[2]` without `fullWidth` + `w-2/3` collision.

- [ ] **Step 1: Add failing test assertions to `UiLayoutContracts.test.ts`**

Append to `client/src/tests/UiLayoutContracts.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --workspace=client -- UiLayoutContracts`
Expected: FAIL.

- [ ] **Step 3: Update `PassPlaySetupPage.tsx`**

In `client/src/pages/PassPlaySetupPage.tsx`:
1. Import `AvatarPicker` from `'../components/game/AvatarPicker'`.
2. Add `const [setupError, setSetupError] = useState<string | null>(null);` and clear it inside `adjustPlayerCount` and `handleStartGame`. Replace `alert('Minimal 3 pemain untuk memulai permainan!');` with `setSetupError('Minimal 3 pemain untuk memulai permainan!');` and render `setupError` inline right above the Step 3 footer buttons.
3. On Step 2 and Step 3 footer buttons (lines `686-707` and `778-799`), remove `fullWidth` and replace `w-1/3` / `w-2/3` with `flex-1` and `flex-[2]`:
```tsx
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setCurrentStep(1)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                className="flex-1"
              >
                Kembali
              </Button>

              <Button
                variant="primary"
                size="lg"
                onClick={() => setCurrentStep(3)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="flex-[2]"
              >
                Lanjut ke Daftar Pemain
              </Button>
            </div>
```
(Same `flex-1` / `flex-[2]` for Step 3 buttons.)
4. Line `762`: add `min-w-0` to the player name `<input>`:
`className="flex-1 min-w-0 bg-transparent px-2.5 py-1 text-sm font-semibold text-ink placeholder-ink-faint focus:outline-none"`
5. Lines `805-823`: replace the raw avatar grid inside `<Modal>` with `<AvatarPicker>`:
```tsx
      <Modal
        isOpen={avatarPickerPlayerIndex !== null}
        onClose={() => setAvatarPickerPlayerIndex(null)}
        title={`Pilih Pion: ${
          avatarPickerPlayerIndex !== null
            ? players[avatarPickerPlayerIndex]?.name || `Pemain ${avatarPickerPlayerIndex + 1}`
            : ''
        }`}
        size="md"
      >
        {avatarPickerPlayerIndex !== null && (
          <AvatarPicker
            selectedAvatar={players[avatarPickerPlayerIndex]?.avatar || 'token-eye'}
            onSelectAvatar={(avatar) => handleSelectAvatar(avatarPickerPlayerIndex, avatar)}
            showNicknameInput={false}
          />
        )}
      </Modal>
```

- [ ] **Step 4: Replace `confirm()` in `PassPlayGamePage.tsx` with `Modal`**

In `client/src/pages/PassPlayGamePage.tsx`:
1. Import `useState` and `Modal` from `'../components/common/Modal'`.
2. Add `const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);`.
3. Update `handleBack`:
```tsx
  const handleBack = () => {
    if (phase === 'GAME_OVER') {
      resetToSetup();
      onBackToHome?.();
      return;
    }
    setIsExitConfirmOpen(true);
  };

  const confirmExit = () => {
    setIsExitConfirmOpen(false);
    resetToSetup();
    onBackToHome?.();
  };
```
4. Render `<Modal>` inside `PassPlayGamePage`:
```tsx
      <Modal
        isOpen={isExitConfirmOpen}
        onClose={() => setIsExitConfirmOpen(false)}
        title="Keluar dari Permainan?"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
            Progres putaran saat ini akan dihapus jika kamu kembali ke menu utama.
          </p>
          <div className="flex items-center gap-2.5 pt-1">
            <Button
              variant="secondary"
              size="md"
              className="flex-1"
              onClick={() => setIsExitConfirmOpen(false)}
            >
              Lanjut Main
            </Button>
            <Button
              variant="danger"
              size="md"
              className="flex-1"
              onClick={confirmExit}
            >
              Ya, Keluar
            </Button>
          </div>
        </div>
      </Modal>
```

- [ ] **Step 5: Run tests and typecheck**

Run: `npm test --workspace=client -- UiLayoutContracts AntiSlopPreFlight && npm run typecheck --workspace=client`
Expected: PASS, 0 errors.

- [ ] **Step 6: Commit**

```bash
git add client/src/pages/PassPlaySetupPage.tsx client/src/pages/PassPlayGamePage.tsx client/src/tests/UiLayoutContracts.test.ts
git commit -m "fix(ux): replace native alert/confirm, fix flex min-w-0, and reuse AvatarPicker in PassPlaySetupPage"
```

---

### Task 4: Polish `Header.tsx`, `HomePage.tsx`, `App.tsx`, and `RoomGamePage.tsx` Mobile Layout & Parity

**Files:**
- Modify: `client/src/components/common/Header.tsx:52-99`
- Modify: `client/src/pages/HomePage.tsx:15-26,185-245,370-397`
- Modify: `client/src/App.tsx:21-98`
- Modify: `client/src/pages/RoomGamePage.tsx:1-525`
- Modify: `client/src/tests/UiLayoutContracts.test.ts`

**Interfaces:**
- Produces on `HomePageProps`: optional `initialFocus?: 'local' | 'online';` and `initialOpenPacks?: boolean;`.
- Behavior:
  - Clicking `"Buat room online"` on `LandingPage` navigates to `HomePage` with `initialFocus="online"`, ordering the Online card first on `<md` mobile (`order-first md:order-none`).
  - `HomePage` active `HOST` and `JOIN` buttons both use `variant="primary"`.
  - `Header` avoids mobile crowding when `roomCode` is displayed.
  - `RoomGamePage` adds exit confirmation modal, `"Intip Kata"` re-peek modal during `TURN_PHASE`/`VOTING`, and `GAME_OVER` parity (`/assets/gameover-art.svg`, winner highlight + `Crown`, survival status).

- [ ] **Step 1: Add failing test assertions to `UiLayoutContracts.test.ts`**

Append to `client/src/tests/UiLayoutContracts.test.ts`:

```ts
describe('RoomGamePage parity and HomePage focus contract', () => {
  it('supports initialFocus and initialOpenPacks in HomePage and exit/re-peek/gameover parity in RoomGamePage', () => {
    const homeSrc = fs.readFileSync(path.join(srcDir, 'pages/HomePage.tsx'), 'utf-8');
    const roomSrc = fs.readFileSync(path.join(srcDir, 'pages/RoomGamePage.tsx'), 'utf-8');

    expect(homeSrc).toContain('initialFocus');
    expect(homeSrc).toContain('initialOpenPacks');
    expect(roomSrc).toContain('gameover-art.svg');
    expect(roomSrc).toContain('isRePeekOpen');
    expect(roomSrc).toContain('isExitConfirmOpen');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --workspace=client -- UiLayoutContracts`
Expected: FAIL.

- [ ] **Step 3: Update `Header.tsx` mobile sizing when `roomCode` is set**

In `client/src/components/common/Header.tsx`:
1. On line `52`, change `gap-3` to `gap-2 sm:gap-3`.
2. On line `71`, constrain the title width when `roomCode` is active on narrow screens:
```tsx
              <span
                className={cn(
                  'font-condensed text-base sm:text-lg text-ink leading-tight truncate',
                  roomCode && 'max-w-[105px] xs:max-w-[140px] sm:max-w-none'
                )}
              >
                {title}
              </span>
```
3. On line `85`, adjust padding for mobile: `px-2.5 sm:px-3 py-1.5`.

- [ ] **Step 4: Update `HomePage.tsx` and `App.tsx` for `initialFocus` & consistent primary CTA**

In `client/src/pages/HomePage.tsx`:
1. Extend `HomePageProps`:
```tsx
export interface HomePageProps {
  onStartPassPlay: () => void;
  onEnterOnlineLobby: () => void;
  initialFocus?: 'local' | 'online';
  initialOpenPacks?: boolean;
}
```
2. Initialize `const [isPackModalOpen, setIsPackModalOpen] = useState(Boolean(initialOpenPacks));` and `useEffect(() => { if (initialOpenPacks) setIsPackModalOpen(true); }, [initialOpenPacks]);`.
3. On the Online Room `<section>` (line `242`), add `initialFocus === 'online' && 'order-first md:order-none ring-1 ring-teal'`:
```tsx
          <section
            className={cn(
              'rounded-3xl border border-rule bg-cardstock shadow-print p-5 sm:p-6 flex flex-col justify-between',
              initialFocus === 'online' && 'order-first md:order-none'
            )}
          >
```
4. Line `373`: change `Buka Meja Online` button `variant="secondary"` to `variant="primary"`.

In `client/src/App.tsx`:
1. Add state: `const [homeIntent, setHomeIntent] = useState<{ focus?: 'local' | 'online'; openPacks?: boolean }>({});`.
2. Update `goToApp` and `LandingPage` callbacks:
```tsx
  const goToApp = (view: Exclude<AppView, 'LANDING'>, intent: { focus?: 'local' | 'online'; openPacks?: boolean } = {}) => {
    setHomeIntent(intent);
    if (window.location.pathname !== PLAY_PATH) {
      window.history.pushState({}, '', PLAY_PATH + window.location.search);
    }
    setCurrentView(view);
  };
```
And pass:
```tsx
      <LandingPage
        onPlayLocal={() => goToApp('PASS_PLAY')}
        onPlayOnline={() => goToApp('HOME', { focus: 'online' })}
        onOpenCustomPacks={() => goToApp('HOME', { openPacks: true })}
      />
```
And pass `initialFocus={homeIntent.focus}` and `initialOpenPacks={homeIntent.openPacks}` to `<HomePage />`.

- [ ] **Step 5: Add exit confirm, re-peek modal, and `GAME_OVER` parity to `RoomGamePage.tsx`**

In `client/src/pages/RoomGamePage.tsx`:
1. Import `Crown, Eye` from `@phosphor-icons/react` and `Modal` from `'../components/common/Modal'`.
2. Add `const [isRePeekOpen, setIsRePeekOpen] = useState(false);` and `const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);`.
3. Update `handleExit`: if `phase === 'GAME_OVER'`, call `leaveRoom()` + `onExitRoom()` directly; otherwise `setIsExitConfirmOpen(true)`. Add `confirmExit` that calls `await leaveRoom(); onExitRoom();`.
4. In the top game stage header (near line `197`), when `(phase === 'TURN_PHASE' || phase === 'VOTING') && currentPlayer?.role`, render a compact pill button:
```tsx
            {(phase === 'TURN_PHASE' || phase === 'VOTING') && currentPlayer?.role && (
              <button
                type="button"
                onClick={() => setIsRePeekOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-rule bg-cardstock hover:bg-paper-muted text-xs font-semibold text-ink shadow-print-sm active:translate-y-[1px] transition-colors"
                title="Intip kembali kata rahasiamu"
              >
                <Eye className="w-3.5 h-3.5 text-teal-dark" weight="bold" />
                <span>Kata</span>
              </button>
            )}
```
5. In `GAME_OVER` (line `413`), add the artwork image matching `PassPlayGamePage`:
```tsx
                <img
                  src="/assets/gameover-art.svg"
                  alt="Ilustrasi akhir permainan dengan kartu kata terbuka"
                  className="w-full max-w-md mx-auto border border-rule shadow-print-sm rounded-2xl"
                />
```
And in the `players.map` list (`462-488`), highlight `isWinner = player.role === room?.winningRole` with `bg-teal-light border-teal` + `<Crown>` icon and show `player.isAlive ? 'Bertahan' : 'Tereliminasi'`.
6. Render the two `<Modal>` instances (`isRePeekOpen` wrapping `<SecretCard ... />`, and `isExitConfirmOpen` confirming room exit).

- [ ] **Step 6: Run tests and typecheck**

Run: `npm test --workspace=client -- UiLayoutContracts AntiSlopPreFlight && npm run typecheck --workspace=client`
Expected: PASS, 0 errors.

- [ ] **Step 7: Commit**

```bash
git add client/src/components/common/Header.tsx client/src/pages/HomePage.tsx client/src/App.tsx client/src/pages/RoomGamePage.tsx client/src/tests/UiLayoutContracts.test.ts
git commit -m "feat(ui): improve mobile Header fit, HomePage online focus ordering, and RoomGamePage parity"
```

---

### Task 5: Fix Landing CSS Undefined Utility Tokens, Room Code Copy & `HeroDeal.tsx` Mobile Overflow

**Files:**
- Modify: `client/src/landing/landing.css:209-274`
- Modify: `client/src/landing/content.ts:10,72`
- Modify: `client/src/landing/HeroDeal.tsx:128-157`
- Modify: `client/src/tests/UiLayoutContracts.test.ts`

**Interfaces:**
- Scopes `.bg-paper-2`, `.border-paper-2`, `.text-ink-2`, `.hover\:text-ink-2:hover`, `.hover\:border-ink-2:hover`, and `.shadow-card` inside `.lp-root` in `landing.css` (without touching `:root` in `tokens.css` or `tailwind.config.js`).
- Fixes `content.ts`: `'Masuk dengan satu kode room 4 karakter'`.

- [ ] **Step 1: Add failing test assertions to `UiLayoutContracts.test.ts`**

Append to `client/src/tests/UiLayoutContracts.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --workspace=client -- UiLayoutContracts`
Expected: FAIL.

- [ ] **Step 3: Add `.lp-root` utility aliases and responsive `.lp-deal-card` sizing in `landing.css`**

Append to the end of `client/src/landing/landing.css`:

```css
/* Scoped Terrazzo utility bridges for classes referenced by landing TSX */
.lp-root .bg-paper-2 {
  background-color: var(--color-paper-2);
}

.lp-root .text-ink-2 {
  color: var(--color-ink-2);
}

.lp-root .hover\:text-ink-2:hover {
  color: var(--color-ink-2);
}

.lp-root .hover\:border-ink-2:hover {
  border-color: var(--color-ink-2);
}

.lp-root .shadow-card {
  box-shadow: var(--shadow-card);
}

@media (max-width: 480px) {
  .lp-deal-fan {
    min-height: 250px;
  }

  .lp-deal-card {
    width: clamp(92px, 23vw, 130px);
    padding: var(--space-sm) var(--space-xs);
  }

  .lp-deal-card:not(:first-child) {
    margin-left: clamp(-34px, -7vw, -22px);
  }

  .lp-stamp {
    font-size: var(--text-xs);
    padding: 2px 6px;
  }
}
```

- [ ] **Step 4: Fix copy in `content.ts` and interactive hint in `HeroDeal.tsx`**

In `client/src/landing/content.ts`:
1. Line `10`:
`caption: 'Tiga kartu Kopi, satu kartu Teh. Ketuk kartu mana saja untuk mengintip.'`
2. Line `72`:
`'Masuk dengan satu kode room 4 karakter'`

In `client/src/landing/HeroDeal.tsx`:
Ensure the card fan uses distinct sample codes (`['mkn-01', 'mkn-01', 'mkn-01', 'mkn-01']` -> keep `mkn-01` since all 4 players in the round share the same word pair `mkn-01`!), and add `overflow-hidden`? NO, keep `overflow: visible` on `.lp-deal-fan` so lifted cards aren't clipped vertically; the new `clamp(92px, 23vw, 130px)` width (`4 * 92 - 3 * 25 = 293px`) fits comfortably inside a `320px` mobile column (`360px` viewport minus `40px` padding).

- [ ] **Step 5: Run all landing tests**

Run: `npm test --workspace=client -- LandingPage LandingTokens LandingMotion LandingSections UiLayoutContracts AntiSlopPreFlight`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add client/src/landing/landing.css client/src/landing/content.ts client/src/tests/UiLayoutContracts.test.ts
git commit -m "fix(landing): scope missing Terrazzo Tailwind aliases, fix 4-char room code copy, and fix mobile HeroDeal overflow"
```

---

### Task 6: Polish `LandingNav.tsx`, `BeforeAfter.tsx`, `RoundPinned.tsx`, `WordPackTable.tsx`, and `LandingPage.tsx`

**Files:**
- Modify: `client/src/landing/LandingNav.tsx:30-62`
- Modify: `client/src/landing/BeforeAfter.tsx:11-33`
- Modify: `client/src/landing/RoundPinned.tsx:114-165`
- Modify: `client/src/landing/WordPackTable.tsx:4-66`
- Modify: `client/src/landing/LandingPage.tsx:15-35`
- Modify: `client/src/tests/UiLayoutContracts.test.ts`

**Interfaces:**
- Produces: `LandingPageProps` gains optional `onOpenCustomPacks?: () => void;` (wired in Task 4 from `App.tsx`).
- Behavior:
  - `LandingNav` provides visible anchor jump links on mobile too (`Cara main`, `Mode`, `Paket kata`) without hiding all links below `sm`.
  - `BeforeAfter` visually contrasts `Dulu` (muted paper plate + `XCircle`) vs `Sekarang` (white plate + accent left border + `CheckCircle`).
  - `WordPackTable` adds `id="paket-kata"` and `data-landing-section`, and its custom-pack link triggers `onOpenCustomPacks ?? onPlayOnline`.

- [ ] **Step 1: Add failing test assertions to `UiLayoutContracts.test.ts`**

Append to `client/src/tests/UiLayoutContracts.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --workspace=client -- UiLayoutContracts`
Expected: FAIL.

- [ ] **Step 3: Update `LandingNav.tsx`, `BeforeAfter.tsx`, `WordPackTable.tsx`, `LandingPage.tsx`**

In `client/src/landing/LandingNav.tsx`:
Add the `#paket-kata` link and a compact mobile sub-strip (`sm:hidden`) so mobile visitors can jump between `#ronde`, `#mode`, and `#paket-kata`:
```tsx
        <nav className="hidden sm:flex items-center gap-8" aria-label="Navigasi halaman">
          <a
            href="#ronde"
            className={`lp-nav-link ${activeSection === 'ronde' ? 'is-active' : ''}`}
          >
            Cara main
          </a>
          <a
            href="#mode"
            className={`lp-nav-link ${activeSection === 'mode' ? 'is-active' : ''}`}
          >
            Mode
          </a>
          <a
            href="#paket-kata"
            className={`lp-nav-link ${activeSection === 'paket-kata' ? 'is-active' : ''}`}
          >
            Paket kata
          </a>
        </nav>
```
And right below `<div className="lp-container ...">`, before `</header>`:
```tsx
      <nav
        className="sm:hidden border-t border-rule bg-paper px-5 py-2 flex items-center gap-5 overflow-x-auto"
        aria-label="Navigasi cepat"
      >
        <a href="#ronde" className={`lp-nav-link shrink-0 ${activeSection === 'ronde' ? 'is-active' : ''}`}>
          Cara main
        </a>
        <a href="#mode" className={`lp-nav-link shrink-0 ${activeSection === 'mode' ? 'is-active' : ''}`}>
          Mode
        </a>
        <a href="#paket-kata" className={`lp-nav-link shrink-0 ${activeSection === 'paket-kata' ? 'is-active' : ''}`}>
          Paket kata
        </a>
      </nav>
```

In `client/src/landing/BeforeAfter.tsx`:
Import `{ CheckCircle, XCircle } from '@phosphor-icons/react'` and differentiate the two plates cleanly:
```tsx
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          <div className="lp-plate p-6 sm:p-8 flex flex-col justify-between bg-paper-2">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-ink-muted mb-3">
                <XCircle className="w-4 h-4 text-ink-muted shrink-0" weight="bold" />
                <span>{BEFORE_AFTER.before.label}</span>
              </div>
              <p className="text-base sm:text-lg text-ink-2 leading-relaxed">
                {BEFORE_AFTER.before.desc}
              </p>
            </div>
          </div>
          <div className="lp-plate p-6 sm:p-8 flex flex-col justify-between border-l-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-ink mb-3">
                <CheckCircle className="w-4 h-4 text-ink shrink-0" weight="bold" />
                <span>{BEFORE_AFTER.after.label}</span>
              </div>
              <p className="text-base sm:text-lg text-ink leading-relaxed font-medium">
                {BEFORE_AFTER.after.desc}
              </p>
            </div>
          </div>
        </div>
```

In `client/src/landing/WordPackTable.tsx`:
Update props and `<section>`:
```tsx
export interface WordPackTableProps {
  onPlayOnline: () => void;
  onOpenCustomPacks?: () => void;
}

export const WordPackTable: React.FC<WordPackTableProps> = ({ onPlayOnline, onOpenCustomPacks }) => {
  return (
    <section
      id="paket-kata"
      data-landing-section
      className="lp-screen lp-word-pack"
      aria-label="Paket kata bawaan"
    >
```
And on the bottom callout link (lines `53-62`):
```tsx
          <a
            href="/play"
            onClick={(e) => {
              e.preventDefault();
              (onOpenCustomPacks ?? onPlayOnline)();
            }}
            className="text-sm sm:text-base font-semibold text-ink underline underline-offset-4 hover:text-ink-2 transition-colors inline-block"
          >
            Punya kata sendiri? Buat paket kustom dan bagikan kodenya.
          </a>
```

In `client/src/landing/LandingPage.tsx`:
Add `onOpenCustomPacks?: () => void;` to `LandingPageProps` and pass it to `<WordPackTable onPlayOnline={onPlayOnline} onOpenCustomPacks={onOpenCustomPacks} />`.

- [ ] **Step 4: Run all tests and typecheck**

Run: `npm test --workspace=client && npm run typecheck --workspace=client`
Expected: PASS, 0 errors.

- [ ] **Step 5: Commit**

```bash
git add client/src/landing/LandingNav.tsx client/src/landing/BeforeAfter.tsx client/src/landing/WordPackTable.tsx client/src/landing/LandingPage.tsx client/src/tests/UiLayoutContracts.test.ts
git commit -m "feat(landing): add mobile quick nav, BeforeAfter visual contrast, and direct custom-pack CTA"
```

---

### Task 7: Capture Fresh Light-Mode Screenshots (`client/public/landing/screens/*.png`) & Final Verification

**Files:**
- Update: `client/public/landing/screens/home.png`
- Update: `client/public/landing/screens/setup.png`
- Update: `client/public/landing/screens/lobby.png`
- Update: `client/public/landing/screens/reveal.png`
- Update: `client/public/landing/screens/describe.png`
- Update: `client/public/landing/screens/voting.png`
- Update: `client/public/landing/screens/mrwhite.png`

**Goal:** Replace all 7 retired dark-mode screenshots (and fix the wrong `describe.png` / `mrwhite.png` duplicates) with real `390x844` (2x DPR = `780x1688`) captures of the current light-mode Hallmark Hum UI.

- [ ] **Step 1: Start local dev servers (client + server) for live capture**

Run in background or two terminals:
- Server: `npm run dev:server` (port `3002`, needed for live `lobby.png`)
- Client: `npm run dev:client` (port `5173`)

- [ ] **Step 2: Capture all 7 screens at `390x844` (`deviceScaleFactor: 2`)**

Use Playwright (or headless Chromium) against `http://localhost:5173/play` to save each file into `client/public/landing/screens/`:
1. `home.png`: Capture `/play` (`HomePage` light-mode Hallmark Hum).
2. `setup.png`: Click `"Mulai Main Satu HP"` -> capture `PassPlaySetupPage` Step 1.
3. `reveal.png`: Advance to Step 3 -> `"Mulai Permainan"` -> click `"Saya ..., Siap Intip"` -> hold `SecretCard` (`mouse.down()` on card) -> capture `reveal.png` showing the revealed word cleanly above the pocket flap!
4. `describe.png`: Complete peeking for all 3 players -> click `"Mulai Diskusi & Voting"` -> capture `PassPlayVotingView` in `TURN_CLUE` ("Urutan Bicara di Meja")!
5. `voting.png`: Click `"Selesai Pemanasan..."` / `"Mulai Voting Eliminasi"` -> capture `PassPlayVotingView` in `VOTING` phase!
6. `mrwhite.png`: Trigger `MR_WHITE_GUESS` (play with 3 players including 1 Mr. White, eliminate the Mr. White player via Consensus) -> confirm `"Saya ..., Siap Menebak"` -> capture `MrWhiteModal` guess screen!
7. `lobby.png`: Open `/play`, click `"Buka Meja Online"` -> capture `LobbyPage` light-mode online lobby!

- [ ] **Step 3: Visually inspect all 7 PNGs**

Open each generated PNG (`read_file` on `client/public/landing/screens/*.png`) to confirm:
- Warm cream paper `#...` / Hallmark Hum light theme on all 7 images (zero dark-mode neon UI).
- `reveal.png` clearly shows the word above the pocket flap (verifying Task 1 visually!).
- `describe.png` shows the discussion turn order screen (not setup).
- `mrwhite.png` shows the Mr. White guess modal (not reveal).

- [ ] **Step 4: Run full client + server test suites, typecheck, and production build**

Run:
```bash
npm test --workspace=client
npm test --workspace=server
npm run typecheck
npm run build
```
Expected: All tests pass, 0 TypeScript errors, production Vite & server builds succeed cleanly.

- [ ] **Step 5: Commit**

```bash
git add client/public/landing/screens/
git commit -m "assets(landing): refresh all 7 landing screenshots from Hallmark Hum light-mode UI"
```

---

## Self-Review Check

1. **Spec / Findings Coverage:**
   - `SecretCard` flap occlusion & pointer double-fire -> **Task 1**
   - `PassPlayVotingView` first-voter shield, `allVoted` summary card, hardcoded `3x`, mobile pill wrap, `MrWhiteModal` reuse -> **Task 2**
   - `PassPlaySetupPage` `min-w-0`, footer button flex, native `alert()`, `AvatarPicker` reuse + `PassPlayGamePage` native `confirm()` -> **Task 3**
   - `Header` mobile truncation, `HomePage` online mobile order & button hierarchy, `RoomGamePage` exit confirm + `"Intip Kata"` re-peek + `GAME_OVER` parity -> **Task 4**
   - `landing.css` undefined `paper-2`/`ink-2`/`shadow-card`, `content.ts` 4-char vs 6-char room code, `HeroDeal` mobile overflow -> **Task 5**
   - `LandingNav` mobile anchors + `#paket-kata`, `BeforeAfter` visual contrast, `WordPackTable` direct pack modal CTA -> **Task 6**
   - All 7 stale dark-mode / duplicate PNGs in `client/public/landing/screens/` -> **Task 7**
2. **Placeholder Scan:** No "TBD", "TODO", or vague "handle edge cases"; all code blocks, file paths, and commands are concrete and aligned with existing Vitest Node setup.
3. **Type & Contract Consistency:** `HomePageProps` (`initialFocus`, `initialOpenPacks`), `LandingPageProps` (`onOpenCustomPacks`), `MrWhiteModalProps` (`onGiveUp`, `requireHandoverShield`) match across Tasks 2, 4, and 6, and all existing test contracts (`AntiSlopPreFlight.test.ts`, `LandingTokens.test.ts`, `LandingPage.test.ts`, `LandingSections.test.ts`) are preserved.
