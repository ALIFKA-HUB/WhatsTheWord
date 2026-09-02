# Task 7 Brief: Offline Pass & Play (Single-Device 1 HP) Mode

## Goal
Implement the complete offline single-device Pass & Play game mode in `client/`:

1. `client/src/context/PassPlayContext.tsx`:
   - Standalone offline state machine running 100% locally in React context (works without server or internet).
   - Manages: `players`, `phase` ('SETUP' | 'REVEAL_PASS' | 'TURN_CLUE' | 'VOTING' | 'MR_WHITE_GUESS' | 'GAME_OVER'), `currentRevealIndex`, `speakingOrder`, `currentSpeakerIndex`, `round`, `wordPair`, `settings`, `winningRole`, `eliminatedPlayer`.
   - Actions: `addPlayer`, `removePlayer`, `updateSettings`, `startPassPlayGame`, `nextRevealPlayer`, `finishRevealPhase`, `nextSpeaker`, `startVotingPhase`, `castVote`, `submitMrWhiteGuess`, `rematch`, `resetToSetup`.

2. `client/src/pages/PassPlaySetupPage.tsx`:
   - Player roster manager (add 3-20 player names with avatar picker, minimum 3 players to start).
   - Category selector (Makanan & Minuman, Hewan, Benda & Gadget, Tempat & Hiburan, Profesi, or Custom Pack).
   - Role sliders: Civilian, Undercover, Mr. White (with automatic validation ensuring total roles == total players).
   - Turn duration setting (30s / 45s / 60s / Unlimited).
   - "Mulai Permainan" button.

3. `client/src/components/game/PassPlaySecretView.tsx`:
   - Screen 1: *"Oper HP ke [Nama Pemain]"* with big avatar and "Saya Sudah Siap" button.
   - Screen 2: `<SecretCard>` with press-and-hold reveal mechanism.
   - Screen 3: "Selesai & Oper ke Pemain Berikutnya" button or "Mulai Beri Clue" for last player.

4. `client/src/components/game/PassPlayVotingView.tsx`:
   - Discussion / Turn Clue guide: spotlights active speaker with countdown timer and "Lanjut ke Pembicara Berikutnya" / "Mulai Voting".
   - Interactive Voting Grid: tap player to select, confirm elimination.
   - Instant Skip Tie-Breaker handling: if votes tie, shows clear banner & sound, skips elimination, and starts next round.
   - Mr. White Intercept Modal: 45s timer for Mr. White to guess Civilian word with `isFuzzyMatch`. Correct -> instant Mr. White win; wrong -> Mr. White eliminated.

5. `client/src/pages/PassPlayGamePage.tsx`:
   - Orchestrates the game loop views: Secret Passing -> Turn Clues -> Voting & Elimination -> Game Over summary screen (reveals all player roles and secret words, plays victory/defeat fanfare, and 1-click Rematch button).

6. Verification:
   - Client typecheck & build passing with zero errors.

## Report Contract
Write report to: `C:\Users\ASUS\Documents\ALIFKA\PROJECT\whatstheword\.superpowers\sdd\2026-09-02-whatstheword-implementation\task-7-report.md`
Return: status (DONE / BLOCKED), commits, one-line test summary.
