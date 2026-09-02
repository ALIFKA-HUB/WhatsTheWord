# Task 6 Brief: UI Design System & Atomic Game Components

## Goal
Build reusable UI components adhering strictly to the Sleek Dark Cyber aesthetic (#080c16, #06b6d4, #f43f5e, #a855f7) and spring physics interactions in `client/src/components/`:

1. `client/src/components/common/Header.tsx`:
   - Logo title "WHAT'S THE WORD" with glowing cyan/purple subtext.
   - Global sound mute toggle button (triggers `toggleMute()` from `useGameSound`).
   - Clean back/exit button if in room/game.
   - Fixed or sticky top bar with safe padding.

2. `client/src/components/common/Button.tsx`:
   - Variants: `primary` (Cyan glow), `danger` (Crimson neon), `accent` (Violet electric), `secondary` (Glass surface), `outline`, `ghost`.
   - Tactile active push: `active:scale-[0.97]` and optional button tap sound effect on click.
   - Disabled and loading state with spinner.

3. `client/src/components/common/Card.tsx`:
   - Dark glass surface (`bg-slate-900/80`, `backdrop-blur-md`, `border border-white/10`, `shadow-xl`).
   - Optional glow borders (`cyan`, `crimson`, `violet`, `amber`).

4. `client/src/components/common/Badge.tsx`:
   - Role badges (`CIVILIAN` / Warga: cyan; `UNDERCOVER` / Impostor: crimson; `MR_WHITE` / Buta Kata: violet).
   - Status badges: Active, Speaking (animated cyan pulse ring), Eliminated (dimmed skull/cross).

5. `client/src/components/common/Modal.tsx`:
   - Motion animated dialog overlay with backdrop blur (`backdrop-blur-md bg-black/70`).
   - Clean slide-in / pop spring animation (`scale`, `opacity`).
   - Close on escape or outside tap.

6. `client/src/components/game/AvatarPicker.tsx`:
   - 12 unique preset Cyber Agent avatars / emojis (e.g. 🕵️ Cyber Agent, 🤖 Cyborg, 🦊 Shadow Fox, 🦅 Neon Eagle, 🐺 Cyber Wolf, 🐱 Stealth Cat, 🐉 Holo Dragon, ⚡ Phantom, 🔮 Oracle, 🕶️ Specter, 🎭 Infiltrator, 👑 Commander).
   - Interactive selection grid with active glow ring and nickname input field.

7. `client/src/components/game/SecretCard.tsx`:
   - Touch & hold / mouse press & hold interaction target: *"Tahan untuk Intip Kata"* (Press & Hold).
   - Spring physics reveal: blur mask clears on hold, reveals player role badge and secret word.
   - On release: immediately re-masks the word to protect privacy from neighboring players.
   - Triggers suspense audio (`playRoleReveal()`) on first reveal.

8. `client/src/components/game/CountdownTimer.tsx`:
   - High-contrast animated circular / linear countdown progress.
   - Color transitions: $ge 15$s Cyan (`#06b6d4`), $6-14$s Amber (`#f59e0b`), $le 5$s Crimson (`#f43f5e`).
   - Synchronized audio ticking (`playTick()` each second, `playUrgentTick()` when $le 5$s).

9. Verification:
   - Typecheck and build verification in `client/`.

## Report Contract
Write report to: `C:\Users\ASUS\Documents\ALIFKA\PROJECT\whatstheword\.superpowers\sdd\2026-09-02-whatstheword-implementation\task-6-report.md`
Return: status (DONE / BLOCKED), commits, one-line test summary.
