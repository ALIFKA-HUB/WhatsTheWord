# Task 8 Review Package

## Commits
835d8ea feat(online): implement multi-device Socket.io online gameplay


## Diff Stat
 .../progress.md                                    |     1 +
 .../task-7-report.md                               |    27 +
 .../task-7-review-pkg.md                           | 14787 +++++++++++++++++++
 .../task-8-brief.md                                |    42 +
 .../task-8-report.md                               |    53 +
 client/src/App.tsx                                 |    73 +-
 client/src/components/game/MrWhiteModal.tsx        |   182 +
 client/src/components/game/VotingGrid.tsx          |   276 +
 client/src/components/game/index.ts                |     3 +
 .../src/components/lobby/CustomWordPackModal.tsx   |   641 +
 client/src/context/SocketContext.tsx               |   499 +
 client/src/hooks/useSocket.ts                      |    15 +
 client/src/pages/HomePage.tsx                      |   394 +
 client/src/pages/LobbyPage.tsx                     |   504 +
 client/src/pages/RoomGamePage.tsx                  |   569 +
 15 files changed, 18057 insertions(+), 9 deletions(-)


## Diff
```diff
diff --git a/.superpowers/sdd/2026-09-02-whatstheword-implementation/progress.md b/.superpowers/sdd/2026-09-02-whatstheword-implementation/progress.md
index 9825b2e..abd6740 100644
--- a/.superpowers/sdd/2026-09-02-whatstheword-implementation/progress.md
+++ b/.superpowers/sdd/2026-09-02-whatstheword-implementation/progress.md
@@ -4,5 +4,6 @@ Task 2: complete (commits c0735b0..35028bd, review clean)
 Task 3: complete (commits 35028bd..ef9eca5, review clean)
 Task 4: complete (commit 47531ae, all 49 tests passing)
 Task 4: complete (commits ef9eca5..47531ae, review clean)
 Task 5: complete (commits 47531ae..fe1e597, review clean)
 Task 6: complete (commits fe1e597..7d7006c, review clean)
+Task 7: complete (commits 7d7006c..f9faa7f, review clean)
diff --git a/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-7-report.md b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-7-report.md
new file mode 100644
index 0000000..7a22f0f
--- /dev/null
+++ b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-7-report.md
@@ -0,0 +1,27 @@
+# Task 7 Implementation Report: Offline Pass & Play (Single-Device 1 HP) Mode
+
+- **Status:** DONE
+- **Commit:** `f9faa7f feat(pass-play): implement 1-device offline pass and play mode`
+- **Report Path:** `C:\Users\ASUS\Documents\ALIFKA\PROJECT\whatstheword\.superpowers\sdd\2026-09-02-whatstheword-implementation\task-7-report.md`
+
+### Implemented Deliverables:
+1. **`client/src/context/PassPlayContext.tsx`**:
+   - Standalone offline state machine with full actions: `addPlayer`, `removePlayer`, `updatePlayer`, `updateSettings`, `startPassPlayGame`, `nextRevealPlayer`, `finishRevealPhase`, `nextSpeaker`, `startVotingPhase`, `castVote`, `submitMrWhiteGuess`, `rematch`, `resetToSetup`.
+   - Automatic integration with `GameEngine`, `FuzzyMatcher`, `defaultWordPacks`, and `wordPackService`.
+2. **`client/src/pages/PassPlaySetupPage.tsx`**:
+   - Player roster manager (add/remove 3-20 players with preset Cyber Agent avatars and random name generator).
+   - Category selector with official 5 categories + custom packs.
+   - Role count sliders with auto-balance and validation.
+   - Turn duration options (30s, 45s, 60s, Unlimited).
+3. **`client/src/components/game/PassPlaySecretView.tsx`**:
+   - Privacy-shielded passing sequence: *"Oper HP ke [Nama Pemain]"* -> *"Tahan untuk Intip Kata"* -> *"Selesai & Oper ke Pemain Berikutnya"*.
+4. **`client/src/components/game/PassPlayVotingView.tsx`**:
+   - Active speaker spotlight with synchronized countdown timer.
+   - Voting ballot grid with instant skip tie-breaker banner.
+   - Mr. White 45s fuzzy guess modal.
+5. **`client/src/pages/PassPlayGamePage.tsx`**:
+   - Seamless view orchestrator + Game Over screen with victory fanfare, role reveal cards, and Rematch button.
+6. **Verification**:
+   - `npm run typecheck`: 0 errors.
+   - `npm test`: 49/49 unit tests passed.
+   - `npm run build:client`: Vite build succeeded.
diff --git a/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-7-review-pkg.md b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-7-review-pkg.md
new file mode 100644
index 0000000..545d4e7
--- /dev/null
+++ b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-7-review-pkg.md
@@ -0,0 +1,14787 @@
+# Task 7 Review Package
+
+## Commits
+f9faa7f feat(pass-play): implement 1-device offline pass and play mode
+
+
+## Diff Stat
+ .../progress.md                                    |     1 +
+ .../task-6-report.md                               |    96 +
+ .../task-6-review-pkg.md                           | 12222 +++++++++++++++++++
+ .../task-7-brief.md                                |    37 +
+ client/src/App.tsx                                 |    35 +-
+ client/src/components/game/PassPlaySecretView.tsx  |   217 +
+ client/src/components/game/PassPlayVotingView.tsx  |   594 +
+ client/src/components/game/index.ts                |     2 +
+ client/src/context/PassPlayContext.tsx             |   691 ++
+ client/src/pages/PassPlayGamePage.tsx              |   295 +
+ client/src/pages/PassPlaySetupPage.tsx             |   493 +
+ 11 files changed, 14664 insertions(+), 19 deletions(-)
+
+
+## Diff
+```diff
+diff --git a/.superpowers/sdd/2026-09-02-whatstheword-implementation/progress.md b/.superpowers/sdd/2026-09-02-whatstheword-implementation/progress.md
+index bea17f9..9825b2e 100644
+--- a/.superpowers/sdd/2026-09-02-whatstheword-implementation/progress.md
++++ b/.superpowers/sdd/2026-09-02-whatstheword-implementation/progress.md
+@@ -3,5 +3,6 @@ Task 1: complete (commits 42efb7b..c0735b0, review clean)
+ Task 2: complete (commits c0735b0..35028bd, review clean)
+ Task 3: complete (commits 35028bd..ef9eca5, review clean)
+ Task 4: complete (commit 47531ae, all 49 tests passing)
+ Task 4: complete (commits ef9eca5..47531ae, review clean)
+ Task 5: complete (commits 47531ae..fe1e597, review clean)
++Task 6: complete (commits fe1e597..7d7006c, review clean)
+diff --git a/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-6-report.md b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-6-report.md
+new file mode 100644
+index 0000000..153ed35
+--- /dev/null
++++ b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-6-report.md
+@@ -0,0 +1,96 @@
++# Task 6 Implementation Report: UI Design System & Atomic Game Components
++
++**Status:** DONE  
++**Timestamp:** 2026-09-02  
++**Commit:** `7d7006c` - `feat(ui): implement Sleek Dark Cyber design system and game components`
++
++---
++
++## 1. Summary of Implemented Components
++
++All atomic UI components were implemented adhering strictly to the **Sleek Dark Cyber** aesthetic (`#080c16`, `#06b6d4`, `#f43f5e`, `#a855f7`) with spring physics animations and tactile audio synthesis integration:
++
++### A. Common Design System Components
++1. **`client/src/components/common/Header.tsx`**
++   - Brand logo and gradient text *"WHAT'S THE WORD"* with cyber subtext.
++   - Interactive Room Code badge with 1-click clipboard copy and feedback indicator.
++   - Global audio sound toggle button directly wired to `useGameSound` (`toggleMute()`, glowing active state, dynamic `Volume2`/`VolumeX` icon).
++   - Clean back/exit button with customizable labels and navigation handlers.
++   - Fixed/sticky glass bar with safe padding and backdrop blur.
++
++2. **`client/src/components/common/Button.tsx`**
++   - 6 Variants: `primary` (Cyan glow), `danger` (Crimson neon), `accent` (Violet electric), `secondary` (Glass surface), `outline` (Cyber cyan border), `ghost`.
++   - 6 Sizes: `xs`, `sm`, `md`, `lg`, `xl`, `icon`.
++   - Tactile active spring push (`active:scale-[0.97]`).
++   - Integrated button tap sound effect on click (`playButtonTap()` from `useGameSound`).
++   - Loading spinner state (`Loader2`) and disabled state management.
++
++3. **`client/src/components/common/Card.tsx`**
++   - Glassmorphism dark surface (`bg-slate-900/80`, `backdrop-blur-md`, `border border-white/10`, `shadow-xl`).
++   - Configurable cyber glow borders: `cyan`, `crimson`, `violet`, `amber`, `none`.
++   - Modular subcomponents: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
++
++4. **`client/src/components/common/Badge.tsx`**
++   - Role badges (`RoleBadge`): `CIVILIAN` (Cyan with Shield), `UNDERCOVER` (Crimson with EyeOff), `MR_WHITE` (Violet with HelpCircle).
++   - Status badges (`StatusBadge`): `active` (Emerald), `speaking` (Cyan with pulsing ring & mic icon), `eliminated` (Dimmed slate skull), `voted` (Amber checkmark), `host` (Crown).
++   - Generic badge variants with custom pulse dot and size support.
++
++5. **`client/src/components/common/Modal.tsx`**
++   - Backdrop overlay with blur (`bg-slate-950/80 backdrop-blur-md`).
++   - Spring physics pop/slide animation powered by `motion/react` (`AnimatePresence`).
++   - ESC key and outside-click dismissal with body scroll lock.
++   - Accessible dialog markup with title, close button, body, and footer slots.
++
++---
++
++### B. Specialized Game Components
++6. **`client/src/components/game/AvatarPicker.tsx`**
++   - 12 Cyber Agent preset avatars with emojis and codenames (🕵️ Cyber Agent, 🤖 Cyborg, 🦊 Shadow Fox, 🦅 Neon Eagle, 🐺 Cyber Wolf, 🐱 Stealth Cat, 🐉 Holo Dragon, ⚡ Phantom, 🔮 Oracle, 🕶️ Specter, 🎭 Infiltrator, 👑 Commander).
++   - Interactive selection grid with active cyan glow ring and check badge.
++   - Nickname input with 15-character limit, live counter, and random cyber codename generator button.
++   - Audio feedback on tap.
++
++7. **`client/src/components/game/SecretCard.tsx`**
++   - Interactive *Press & Hold* ("Tahan untuk Intip Kata") target with mobile touch support (`onTouchStart`/`onTouchEnd`/`onTouchCancel`/`onMouseDown`/`onMouseUp`/`onMouseLeave`).
++   - Mobile context-menu prevention on long press (`onContextMenu={(e) => e.preventDefault()}`).
++   - Spring physics unmask blur (`filter: blur(16px)` -> `filter: blur(0px)`).
++   - Triggers suspense audio `playRoleReveal()` on reveal.
++   - Privacy shield notice and automatic re-mask on touch release.
++   - Handles `CIVILIAN`, `UNDERCOVER`, and `MR_WHITE` special secret states.
++
++8. **`client/src/components/game/CountdownTimer.tsx`**
++   - High-contrast animated circular and linear countdown progress.
++   - Color state transitions: $\ge 15$s Cyan (`#06b6d4`), $6-14$s Amber (`#f59e0b`), $\le 5$s Crimson (`#f43f5e`).
++   - Synchronized audio ticking: `playTick()` each second and `playUrgentTick()` when $\le 5$s.
++   - Formatted countdown display and speaker indicator badge.
++
++9. **Exports & Utilities**
++   - `client/src/utils/cn.ts` (Tailwind class merging helper).
++   - `client/src/components/common/index.ts`
++   - `client/src/components/game/index.ts`
++   - `client/src/components/index.ts`
++
++---
++
++## 2. Verification Results
++
++- **Typecheck:** `npm run typecheck` across both `client` and `server` workspaces passed with **0 errors**.
++- **Vite Production Build:** `npm run build:client` built successfully in 11.25s producing optimized assets.
++- **Server Tests:** `npm test` verified all 4 test suites (49 tests) passing.
++
++---
++
++## 3. Deliverables
++
++| File | Status | Description |
++|---|---|---|
++| `client/src/utils/cn.ts` | Created | Class merge helper |
++| `client/src/components/common/Header.tsx` | Created | Top navigation bar with mute toggle & room code |
++| `client/src/components/common/Button.tsx` | Created | 6-variant cyber button with sound & active push |
++| `client/src/components/common/Card.tsx` | Created | Glassmorphic cyber card container |
++| `client/src/components/common/Badge.tsx` | Created | Role and player status badges |
++| `client/src/components/common/Modal.tsx` | Created | Spring animated dialog modal |
++| `client/src/components/game/AvatarPicker.tsx` | Created | 12-agent avatar grid & nickname picker |
++| `client/src/components/game/SecretCard.tsx` | Created | Press-and-hold unmask blur secret card |
++| `client/src/components/game/CountdownTimer.tsx` | Created | Circular/linear timer with audio ticks |
++| `client/src/components/index.ts` | Created | Barrel export |
+diff --git a/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-6-review-pkg.md b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-6-review-pkg.md
+new file mode 100644
+index 0000000..1fde59c
+--- /dev/null
++++ b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-6-review-pkg.md
+@@ -0,0 +1,12222 @@
++# Task 6 Review Package
++
++## Commits
++7d7006c feat(ui): implement Sleek Dark Cyber design system and game components
++
++
++## Diff Stat
++ .../progress.md                                    |     1 +
++ .../task-5-review-pkg.md                           | 10728 +++++++++++++++++++
++ .../task-6-brief.md                                |    50 +
++ client/src/components/common/Badge.tsx             |   200 +
++ client/src/components/common/Button.tsx            |   114 +
++ client/src/components/common/Card.tsx              |   102 +
++ client/src/components/common/Header.tsx            |   129 +
++ client/src/components/common/Modal.tsx             |   148 +
++ client/src/components/common/index.ts              |     5 +
++ client/src/components/game/AvatarPicker.tsx        |   183 +
++ client/src/components/game/CountdownTimer.tsx      |   241 +
++ client/src/components/game/SecretCard.tsx          |   187 +
++ client/src/components/game/index.ts                |     3 +
++ client/src/components/index.ts                     |     2 +
++ client/src/utils/cn.ts                             |     6 +
++ 15 files changed, 12099 insertions(+)
++
++
++## Diff
++```diff
++diff --git a/.superpowers/sdd/2026-09-02-whatstheword-implementation/progress.md b/.superpowers/sdd/2026-09-02-whatstheword-implementation/progress.md
++index f89eeab..bea17f9 100644
++--- a/.superpowers/sdd/2026-09-02-whatstheword-implementation/progress.md
+++++ b/.superpowers/sdd/2026-09-02-whatstheword-implementation/progress.md
++@@ -2,5 +2,6 @@
++ Task 1: complete (commits 42efb7b..c0735b0, review clean)
++ Task 2: complete (commits c0735b0..35028bd, review clean)
++ Task 3: complete (commits 35028bd..ef9eca5, review clean)
++ Task 4: complete (commit 47531ae, all 49 tests passing)
++ Task 4: complete (commits ef9eca5..47531ae, review clean)
+++Task 5: complete (commits 47531ae..fe1e597, review clean)
++diff --git a/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-5-review-pkg.md b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-5-review-pkg.md
++new file mode 100644
++index 0000000..9d0aae3
++--- /dev/null
+++++ b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-5-review-pkg.md
++@@ -0,0 +1,10728 @@
+++# Task 5 Review Package
+++
+++## Commits
+++fe1e597 docs: add task 5 report
+++b1fb308 feat(db): implement Supabase cloud word pack integration and community sharing
+++
+++
+++## Diff Stat
+++ .../progress.md                                    |     4 +-
+++ .../task-4-report.md                               |    45 +
+++ .../task-4-review-pkg.md                           | 10021 +++++++++++++++++++
+++ .../task-5-brief.md                                |    34 +
+++ .../task-5-report.md                               |    40 +
+++ client/src/services/supabaseClient.ts              |    28 +
+++ client/src/services/wordPackService.ts             |   287 +
+++ client/src/types/game.types.ts                     |    11 +
+++ server/src/types/game.types.ts                     |    11 +
+++ supabase/schema.sql                                |   152 +
+++ 10 files changed, 10632 insertions(+), 1 deletion(-)
+++
+++
+++## Diff
+++```diff
+++diff --git a/.superpowers/sdd/2026-09-02-whatstheword-implementation/progress.md b/.superpowers/sdd/2026-09-02-whatstheword-implementation/progress.md
+++index 228c6b9..f89eeab 100644
+++--- a/.superpowers/sdd/2026-09-02-whatstheword-implementation/progress.md
++++++ b/.superpowers/sdd/2026-09-02-whatstheword-implementation/progress.md
+++@@ -1,4 +1,6 @@
+++-﻿# SDD ledger — plan: docs/superpowers/plans/2026-09-02-whatstheword-implementation.md
++++# SDD ledger — plan: docs/superpowers/plans/2026-09-02-whatstheword-implementation.md
+++ Task 1: complete (commits 42efb7b..c0735b0, review clean)
+++ Task 2: complete (commits c0735b0..35028bd, review clean)
+++ Task 3: complete (commits 35028bd..ef9eca5, review clean)
++++Task 4: complete (commit 47531ae, all 49 tests passing)
++++Task 4: complete (commits ef9eca5..47531ae, review clean)
+++diff --git a/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-4-report.md b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-4-report.md
+++new file mode 100644
+++index 0000000..48b2801
+++--- /dev/null
++++++ b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-4-report.md
+++@@ -0,0 +1,45 @@
++++# Task 4 Implementation Report: Realtime Backend Server (Express + Socket.io + Room Manager)
++++
++++## Summary
++++- **Status:** DONE
++++- **Commit:** `47531ae feat(server): implement Express and Socket.io realtime game server`
++++- **One-line Test Summary:** 4 test suites, 49 tests passed (100% pass rate in Vitest).
++++
++++## Implemented Components & Features
++++
++++1. **`server/src/managers/RoomManager.ts`**:
++++   - In-memory state store for rooms (`Map<string, RoomState>`) and session recovery tokens (`Map<string, RoomSession>`).
++++   - Generates unique 4-character alphanumeric uppercase room codes (e.g., `ABCD`, `KOP1`).
++++   - Complete room lifecycle methods:
++++     - `createRoom(hostName, avatar)`: creates room, allocates host player, registers session token.
++++     - `joinRoom(roomId, playerName, avatar, existingToken)`: joins or recovers player session, verifies room existence and lobby phase.
++++     - `leaveRoom(roomId, playerId)`: removes player, migrates host to next player if host leaves, deletes empty room.
++++     - `updateSettings(roomId, settings)`: updates settings during lobby phase.
++++     - `startGame(roomId, settings?, customWordPair?)`: assigns roles, distributes words, randomizes speaking order, sets turn timers.
++++     - `advanceTurn(roomId)`: advances speaker index or transitions to `VOTING` once all alive players finish speaking.
++++     - `castVote(roomId, voterId, targetId)`: tallies secret votes, executes Instant Skip on tie, triggers `MR_WHITE_GUESS` intercept or checks win condition on player elimination.
++++     - `handleMrWhiteGuess(roomId, guess)`: executes fuzzy string matching for Mr. White emergency guess, triggers immediate victory on match or continues/ends game on failure.
++++     - `reconnectPlayer(playerToken)`: recovers player and room state across network drops or reloads.
++++     - `rematch(roomId)`: resets room back to `LOBBY` phase preserving connected players and host status.
++++     - `cleanupIdleRooms(maxIdleMs)`: automatic garbage collection for rooms idle for > 2 hours.
++++
++++2. **Socket.io Handlers (`server/src/handlers/`)**:
++++   - `roomHandler.ts`: handles `room:create`, `room:join`, `room:leave`, `room:update_settings`, `player:reconnect`.
++++   - `gameHandler.ts`: handles `game:start`, `turn:end`, `turn:timer_tick`, `game:rematch`.
++++   - `voteHandler.ts`: handles `vote:cast`, `mrwhite:guess`.
++++
++++3. **Server Bootstrap (`server/src/server.ts`)**:
++++   - Configured Express with wildcard CORS and JSON parsing.
++++   - Endpoint `GET /health` returning `{ status: 'ok', activeRooms: number, uptime: number, timestamp, service }`.
++++   - Attached modular socket handlers on client connection.
++++   - Exported `app`, `server`, `io`, `roomManager`.
++++
++++4. **Automated Unit & Integration Tests**:
++++   - `server/tests/RoomManager.test.ts`: 19 tests verifying room creation, joins, host migration, settings, role assignment, turn advancement, instant skip voting ties, Mr. White guess intercept, session recovery, rematch, and idle room cleanup.
++++   - `server/tests/Server.test.ts`: 2 tests verifying server exports and handler registration.
++++   - `server/tests/FuzzyMatcher.test.ts`: 14 tests passing.
++++   - `server/tests/GameEngine.test.ts`: 14 tests passing.
++++
++++## Verification & Typecheck
++++- `npm test` in `server/`: 4 test suites, 49 tests passing.
++++- `npm run typecheck` across root (`client` & `server`): 0 TypeScript errors.
+++diff --git a/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-4-review-pkg.md b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-4-review-pkg.md
+++new file mode 100644
+++index 0000000..20277e2
+++--- /dev/null
++++++ b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-4-review-pkg.md
+++@@ -0,0 +1,10021 @@
++++# Task 4 Review Package
++++
++++## Commits
++++47531ae feat(server): implement Express and Socket.io realtime game server
++++
++++
++++## Diff Stat
++++ .../progress.md                                    |    1 +
++++ .../task-3-review-pkg.md                           | 8460 ++++++++++++++++++++
++++ .../task-4-brief.md                                |   37 +
++++ server/src/handlers/gameHandler.ts                 |   99 +
++++ server/src/handlers/roomHandler.ts                 |  184 +
++++ server/src/handlers/voteHandler.ts                 |   78 +
++++ server/src/managers/RoomManager.ts                 |  579 ++
++++ server/src/server.ts                               |   25 +-
++++ server/tests/RoomManager.test.ts                   |  397 +
++++ server/tests/Server.test.ts                        |   34 +
++++ 10 files changed, 9889 insertions(+), 5 deletions(-)
++++
++++
++++## Diff
++++```diff
++++diff --git a/.superpowers/sdd/2026-09-02-whatstheword-implementation/progress.md b/.superpowers/sdd/2026-09-02-whatstheword-implementation/progress.md
++++index f0e539a..228c6b9 100644
++++--- a/.superpowers/sdd/2026-09-02-whatstheword-implementation/progress.md
+++++++ b/.superpowers/sdd/2026-09-02-whatstheword-implementation/progress.md
++++@@ -1,3 +1,4 @@
++++ ﻿# SDD ledger — plan: docs/superpowers/plans/2026-09-02-whatstheword-implementation.md
++++ Task 1: complete (commits 42efb7b..c0735b0, review clean)
++++ Task 2: complete (commits c0735b0..35028bd, review clean)
+++++Task 3: complete (commits 35028bd..ef9eca5, review clean)
++++diff --git a/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-3-review-pkg.md b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-3-review-pkg.md
++++new file mode 100644
++++index 0000000..b57f890
++++--- /dev/null
+++++++ b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-3-review-pkg.md
++++@@ -0,0 +1,8460 @@
+++++# Task 3 Review Package
+++++
+++++## Commits
+++++ef9eca5 feat(audio): implement Web Audio API sound synthesizer and hooks
+++++
+++++
+++++## Diff Stat
+++++ .../progress.md                                    |    1 +
+++++ .../task-2-report.md                               |   70 +
+++++ .../task-2-review-pkg.md                           | 7670 ++++++++++++++++++++
+++++ .../task-3-brief.md                                |   32 +
+++++ .../task-3-report.md                               |   63 +
+++++ client/src/context/AudioContext.tsx                |  105 +
+++++ client/src/hooks/useGameSound.ts                   |   32 +
+++++ client/src/main.tsx                                |    5 +-
+++++ client/src/utils/soundSynthesizer.ts               |  393 +
+++++ 9 files changed, 8370 insertions(+), 1 deletion(-)
+++++
+++++
+++++## Diff
+++++```diff
+++++diff --git a/.superpowers/sdd/2026-09-02-whatstheword-implementation/progress.md b/.superpowers/sdd/2026-09-02-whatstheword-implementation/progress.md
+++++index 95a5492..f0e539a 100644
+++++--- a/.superpowers/sdd/2026-09-02-whatstheword-implementation/progress.md
++++++++ b/.superpowers/sdd/2026-09-02-whatstheword-implementation/progress.md
+++++@@ -1,2 +1,3 @@
+++++ ﻿# SDD ledger — plan: docs/superpowers/plans/2026-09-02-whatstheword-implementation.md
+++++ Task 1: complete (commits 42efb7b..c0735b0, review clean)
++++++Task 2: complete (commits c0735b0..35028bd, review clean)
+++++diff --git a/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-2-report.md b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-2-report.md
+++++new file mode 100644
+++++index 0000000..16fad58
+++++--- /dev/null
++++++++ b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-2-report.md
+++++@@ -0,0 +1,70 @@
++++++# Task 2 Report: Core Domain Logic - Game Engine, Indonesian Word Bank & Fuzzy Matcher
++++++
++++++## Execution Summary
++++++
++++++- **Status:** DONE
++++++- **Commit:** `35028bd` (`feat(engine): implement game engine, word bank, and fuzzy matcher`)
++++++- **Test Summary:** 2 test suites passed, 28 tests passed (100%), 0 failed in 996ms.
++++++
++++++---
++++++
++++++## Implemented Deliverables
++++++
++++++### 1. Indonesian Word Bank (`server/src/data/defaultWordPacks.ts` & `client/src/data/defaultWordPacks.ts`)
++++++- **64 curated, balanced Indonesian word pairs** categorized across 5 official categories:
++++++  - `Makanan & Minuman` (14 pairs: Kopi/Teh, Bakso/Mie Ayam, Rendang/Gulai, Martabak Manis/Terang Bulan, Nasi Padang/Nasi Uduk, etc.)
++++++  - `Hewan` (13 pairs: Kucing/Harimau, Bebek/Ayam, Paus/Lumba-lumba, Elang/Burung Hantu, Kelinci/Hamster, etc.)
++++++  - `Benda & Gadget` (13 pairs: Laptop/Komputer, Smartphone/Tablet, Headphone/Earphone, Kipas Angin/AC, Jam Tangan/Jam Dinding, etc.)
++++++  - `Tempat & Hiburan` (12 pairs: Bioskop/Teater, Pantai/Danau, Supermarket/Pasar Tradisional, Museum/Perpustakaan, Hotel/Villa, etc.)
++++++  - `Profesi` (12 pairs: Dokter/Perawat, Pilot/Masinis, Polisi/Tentara, Koki/Barista, Guru/Dosen, etc.)
++++++- Exported helper functions: `getRandomWordPair(category?)`, `getWordPairsByCategory(category?)`, `DEFAULT_WORD_PACKS`, `DEFAULT_WORD_PAIRS`, and `CATEGORIES`.
++++++
++++++### 2. Levenshtein Fuzzy Matcher (`server/src/engine/FuzzyMatcher.ts` & `client/src/utils/fuzzyMatcher.ts`)
++++++- **Indonesian Normalization (`normalizeText`)**:
++++++  - Lowercase conversion.
++++++  - Punctuation and symbol stripping (e.g. `lumba-lumba` -> `lumbalumba`, `teh, botol.` -> `teh botol`).
++++++  - Whitespace trimming and multiple spaces collapse.
++++++- **Dynamic Programming Levenshtein Distance (`levenshteinDistance`)**:
++++++  - Optimal Wagner-Fischer 2D array matrix comparison.
++++++- **Adaptive Length Tolerance Matching (`isFuzzyMatch`)**:
++++++  - Length < 4: Exact match only (`tolerance = 0`).
++++++  - Length 4 - 7: Max 1 typo allowed (`tolerance = 1`).
++++++  - Length > 7: Max 2 typos allowed (`tolerance = 2`).
++++++  - Custom override via `options.maxDistance`.
++++++- Provided static class wrapper `FuzzyMatcher.isMatch()`, `FuzzyMatcher.distance()`, and `FuzzyMatcher.normalize()`.
++++++
++++++### 3. Game Engine (`server/src/engine/GameEngine.ts` & `client/src/utils/gameEngine.ts`)
++++++- **Role Assignment (`assignRoles`)**:
++++++  - Distributes `CIVILIAN`, `UNDERCOVER`, and `MR_WHITE` based on `GameSettings`.
++++++  - Assigns civilian words, undercover words, and blank word (`''`) for Mr. White.
++++++  - Shuffles roles using Fisher-Yates shuffle algorithm.
++++++  - Generates randomized speaking order (`speakingOrder: string[]`).
++++++- **Vote Tally with Instant Skip Elimination (`calculateVotes`)**:
++++++  - Aggregates secret votes cast by active players.
++++++  - Handles clear majority elimination (`isTie: false, eliminatedPlayerId: winnerId`).
++++++  - **Instant Skip Rule**: Returns `isTie: true, eliminatedPlayerId: null` whenever 2 or more candidates share the highest vote count or when no votes are cast.
++++++- **Win Condition Checking (`checkWinCondition`)**:
++++++  - `CIVILIAN`: When all Undercovers and Mr. Whites are eliminated.
++++++  - `UNDERCOVER`: When alive Undercovers >= alive Civilians.
++++++  - `MR_WHITE`: When Mr. White survives into the final 2 players.
++++++  - `null`: When game is actively ongoing.
++++++
++++++---
++++++
++++++## Test Execution Results
++++++
++++++```
++++++ RUN  v3.2.7 server/
++++++
++++++ ✓ tests/FuzzyMatcher.test.ts (14 tests) 12ms
++++++ ✓ tests/GameEngine.test.ts (14 tests) 19ms
++++++
++++++ Test Files  2 passed (2)
++++++      Tests  28 passed (28)
++++++   Start at  10:39:24
++++++   Duration  996ms
++++++```
++++++
++++++### TypeScript Validation
++++++- `server`: `npm run typecheck` passed with 0 errors.
++++++- `client`: `npm run typecheck` passed with 0 errors.
+++++diff --git a/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-2-review-pkg.md b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-2-review-pkg.md
+++++new file mode 100644
+++++index 0000000..9a435b3
+++++--- /dev/null
++++++++ b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-2-review-pkg.md
+++++@@ -0,0 +1,7670 @@
++++++# Task 2 Review Package
++++++
++++++## Commits
++++++35028bd feat(engine): implement game engine, word bank, and fuzzy matcher
++++++
++++++
++++++## Diff Stat
++++++ .../progress.md                                    |    1 +
++++++ .../task-1-review-pkg.md                           | 6260 ++++++++++++++++++++
++++++ .../task-2-brief.md                                |   27 +
++++++ client/src/data/defaultWordPacks.ts                |  145 +
++++++ client/src/utils/fuzzyMatcher.ts                   |  114 +
++++++ client/src/utils/gameEngine.ts                     |  207 +
++++++ server/src/data/defaultWordPacks.ts                |  145 +
++++++ server/src/engine/FuzzyMatcher.ts                  |  115 +
++++++ server/src/engine/GameEngine.ts                    |  207 +
++++++ server/tests/FuzzyMatcher.test.ts                  |  102 +
++++++ server/tests/GameEngine.test.ts                    |  256 +
++++++ 11 files changed, 7579 insertions(+)
++++++
++++++
++++++## Diff
++++++```diff
++++++diff --git a/.superpowers/sdd/2026-09-02-whatstheword-implementation/progress.md b/.superpowers/sdd/2026-09-02-whatstheword-implementation/progress.md
++++++index ddfc1c9..95a5492 100644
++++++--- a/.superpowers/sdd/2026-09-02-whatstheword-implementation/progress.md
+++++++++ b/.superpowers/sdd/2026-09-02-whatstheword-implementation/progress.md
++++++@@ -1 +1,2 @@
++++++ ﻿# SDD ledger — plan: docs/superpowers/plans/2026-09-02-whatstheword-implementation.md
+++++++Task 1: complete (commits 42efb7b..c0735b0, review clean)
++++++diff --git a/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-1-review-pkg.md b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-1-review-pkg.md
++++++new file mode 100644
++++++index 0000000..e199914
++++++--- /dev/null
+++++++++ b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-1-review-pkg.md
++++++@@ -0,0 +1,6260 @@
+++++++# Task 1 Review Package
+++++++
+++++++## Commits
+++++++c0735b0 docs: add task 1 completion report
+++++++2a57ee3 chore: setup monorepo workspace tooling and types
+++++++
+++++++
+++++++## Diff Stat
+++++++ .env.example                                       |    6 +
+++++++ .../progress.md                                    |    1 +
+++++++ .../task-1-brief.md                                |   73 +
+++++++ .../task-1-report.md                               |   27 +
+++++++ client/index.html                                  |   17 +
+++++++ client/package.json                                |   33 +
+++++++ client/postcss.config.js                           |    6 +
+++++++ client/src/App.tsx                                 |   27 +
+++++++ client/src/index.css                               |   55 +
+++++++ client/src/main.tsx                                |   13 +
+++++++ client/src/types/game.types.ts                     |   68 +
+++++++ client/src/vite-env.d.ts                           |   10 +
+++++++ client/tailwind.config.js                          |   37 +
+++++++ client/tsconfig.json                               |   25 +
+++++++ client/tsconfig.node.json                          |   10 +
+++++++ client/vite.config.ts                              |   25 +
+++++++ package-lock.json                                  | 5445 ++++++++++++++++++++
+++++++ package.json                                       |   24 +
+++++++ server/package.json                                |   28 +
+++++++ server/src/server.ts                               |   51 +
+++++++ server/src/types/game.types.ts                     |   68 +
+++++++ server/tsconfig.json                               |   21 +
+++++++ server/vitest.config.ts                            |   14 +
+++++++ 23 files changed, 6084 insertions(+)
+++++++
+++++++
+++++++## Diff
+++++++```diff
+++++++diff --git a/.env.example b/.env.example
+++++++new file mode 100644
+++++++index 0000000..763ad8c
+++++++--- /dev/null
++++++++++ b/.env.example
+++++++@@ -0,0 +1,6 @@
++++++++# Supabase Configuration
++++++++VITE_SUPABASE_URL=https://rmsvxhoblwdhhdjpgjdn.supabase.co
++++++++VITE_SUPABASE_ANON_KEY=sb_publishable_2Mli4l2s2k_On3ZkRz5VhQ_RewKXkfK
++++++++
++++++++# Server Configuration
++++++++PORT=3001
+++++++diff --git a/.superpowers/sdd/2026-09-02-whatstheword-implementation/progress.md b/.superpowers/sdd/2026-09-02-whatstheword-implementation/progress.md
+++++++new file mode 100644
+++++++index 0000000..ddfc1c9
+++++++--- /dev/null
++++++++++ b/.superpowers/sdd/2026-09-02-whatstheword-implementation/progress.md
+++++++@@ -0,0 +1 @@
++++++++﻿# SDD ledger — plan: docs/superpowers/plans/2026-09-02-whatstheword-implementation.md
+++++++diff --git a/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-1-brief.md b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-1-brief.md
+++++++new file mode 100644
+++++++index 0000000..383f759
+++++++--- /dev/null
++++++++++ b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-1-brief.md
+++++++@@ -0,0 +1,73 @@
++++++++﻿# Task 1 Brief: Monorepo Root, Workspace Tooling, Shared Types & Env Configuration
++++++++
++++++++## Goal
++++++++Setup the monorepo workspace for What's The Word in C:\Users\ASUS\Documents\ALIFKA\PROJECT\whatstheword:
++++++++- Root package.json with concurrently to run client and server
++++++++- client/ setup: React 18, Vite, TypeScript, Tailwind CSS, Lucide React, motion, @supabase/supabase-js, socket.io-client
++++++++- client/src/index.css with dark cyber styling & Outfit/Cabinet Grotesk/JetBrains Mono fonts
++++++++- client/src/types/game.types.ts
++++++++- server/ setup: Node.js, Express, Socket.io, TypeScript, Vitest, cors, dotenv
++++++++- server/src/types/game.types.ts
++++++++- .env.example & .env with Supabase URL and keys
++++++++- Verify build & typecheck passes.
++++++++
++++++++## Exact Types Specification (game.types.ts in client and server):
++++++++`	ypescript
++++++++export type PlayerRole = 'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE';
++++++++
++++++++export type GamePhase =
++++++++  | 'LOBBY'
++++++++  | 'ROLE_REVEAL'
++++++++  | 'TURN_PHASE'
++++++++  | 'VOTING'
++++++++  | 'MR_WHITE_GUESS'
++++++++  | 'GAME_OVER';
++++++++
++++++++export interface Player {
++++++++  id: string;
++++++++  name: string;
++++++++  avatar: string;
++++++++  isHost: boolean;
++++++++  role?: PlayerRole;
++++++++  word?: string;
++++++++  isAlive: boolean;
++++++++  hasVoted: boolean;
++++++++  votedTargetId?: string;
++++++++  isSpeaking?: boolean;
++++++++}
++++++++
++++++++export interface WordPair {
++++++++  id?: string;
++++++++  category: string;
++++++++  civilianWord: string;
++++++++  undercoverWord: string;
++++++++}
++++++++
++++++++export interface GameSettings {
++++++++  category: string;
++++++++  civilianCount: number;
++++++++  undercoverCount: number;
++++++++  mrWhiteCount: number;
++++++++  turnDurationSeconds: number;
++++++++  enableMrWhite: boolean;
++++++++  customWordPair?: WordPair;
++++++++}
++++++++
++++++++export interface RoomState {
++++++++  roomId: string;
++++++++  phase: GamePhase;
++++++++  round: number;
++++++++  players: Player[];
++++++++  speakingOrder: string[];
++++++++  currentSpeakerIndex: number;
++++++++  activeTurnRemainingSeconds: number;
++++++++  settings: GameSettings;
++++++++  winningRole?: 'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE';
++++++++  eliminatedPlayer?: Player;
++++++++  wordPair?: WordPair;
++++++++}
++++++++`
++++++++
++++++++## Report Contract
++++++++Write report to: .superpowers/sdd/2026-09-02-whatstheword-implementation/task-1-report.md
++++++++Return: status (DONE / BLOCKED), commits, one-line test summary.
+++++++diff --git a/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-1-report.md b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-1-report.md
+++++++new file mode 100644
+++++++index 0000000..95a37d2
+++++++--- /dev/null
++++++++++ b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-1-report.md
+++++++@@ -0,0 +1,27 @@
++++++++# Task 1 Report: Monorepo Root, Workspace Tooling, Shared Types & Env Configuration
++++++++
++++++++## Status
++++++++DONE
++++++++
++++++++## Summary
++++++++Successfully configured the monorepo workspace for What's The Word (Undercover) game:
++++++++- **Root**: `package.json` with npm workspaces (`client`, `server`) and concurrent orchestration scripts (`dev`, `build`, `test`, `typecheck`).
++++++++- **Environment**: `.env.example` and `.env` configured with Supabase project endpoint (`https://rmsvxhoblwdhhdjpgjdn.supabase.co`), publishable key, and default backend port (`3001`).
++++++++- **Client (`client/`)**:
++++++++  - React 18, Vite 6, TypeScript 5, Tailwind CSS 3, Motion (`motion`), Lucide React, Supabase Client, Socket.io Client.
++++++++  - Dark cyber design tokens & styling in `index.css` and `tailwind.config.js` (`#080c16`, `#06b6d4`, `#f43f5e`, `#a855f7`, `#f59e0b`).
++++++++  - Google Fonts configured for `Outfit` and `JetBrains Mono`.
++++++++  - Initial `App.tsx` and `main.tsx` entrypoint.
++++++++  - Complete shared types in `client/src/types/game.types.ts`.
++++++++- **Server (`server/`)**:
++++++++  - Node.js, Express, Socket.io, Vitest, TypeScript, CORS, Dotenv.
++++++++  - `server/src/server.ts` with HTTP server, Socket.io connection handlers, CORS, and `/health` REST endpoint.
++++++++  - Complete shared types in `server/src/types/game.types.ts`.
++++++++  - `vitest.config.ts` setup for unit tests.
++++++++
++++++++## Verification
++++++++- `npm run typecheck`: Passed with 0 errors across client and server workspaces.
++++++++- `npm run build`: Vite production bundle and TypeScript server compilation succeeded with 0 errors.
++++++++
++++++++## Git Commit
++++++++- `2a57ee3`: `chore: setup monorepo workspace tooling and types`
+++++++diff --git a/client/index.html b/client/index.html
+++++++new file mode 100644
+++++++index 0000000..3143db3
+++++++--- /dev/null
++++++++++ b/client/index.html
+++++++@@ -0,0 +1,17 @@
++++++++<!doctype html>
++++++++<html lang="id" class="dark">
++++++++  <head>
++++++++    <meta charset="UTF-8" />
++++++++    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
++++++++    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
++++++++    <meta name="theme-color" content="#080c16" />
++++++++    <title>What's The Word - Undercover Deduction Game</title>
++++++++    <link rel="preconnect" href="https://fonts.googleapis.com">
++++++++    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
++++++++    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
++++++++  </head>
++++++++  <body class="bg-[#080c16] text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200 min-h-[100dvh]">
++++++++    <div id="root" class="min-h-[100dvh] flex flex-col"></div>
++++++++    <script type="module" src="/src/main.tsx"></script>
++++++++  </body>
++++++++</html>
+++++++diff --git a/client/package.json b/client/package.json
+++++++new file mode 100644
+++++++index 0000000..8900956
+++++++--- /dev/null
++++++++++ b/client/package.json
+++++++@@ -0,0 +1,33 @@
++++++++{
++++++++  "name": "whatstheword-client",
++++++++  "private": true,
++++++++  "version": "1.0.0",
++++++++  "type": "module",
++++++++  "scripts": {
++++++++    "dev": "vite",
++++++++    "build": "tsc && vite build",
++++++++    "preview": "vite preview",
++++++++    "typecheck": "tsc --noEmit"
++++++++  },
++++++++  "dependencies": {
++++++++    "@supabase/supabase-js": "^2.49.1",
++++++++    "clsx": "^2.1.1",
++++++++    "lucide-react": "^1.16.0",
++++++++    "motion": "^12.4.10",
++++++++    "react": "^18.3.1",
++++++++    "react-dom": "^18.3.1",
++++++++    "socket.io-client": "^4.8.1",
++++++++    "tailwind-merge": "^3.0.2"
++++++++  },
++++++++  "devDependencies": {
++++++++    "@types/node": "^22.13.9",
++++++++    "@types/react": "^18.3.18",
++++++++    "@types/react-dom": "^18.3.5",
++++++++    "@vitejs/plugin-react": "^4.3.4",
++++++++    "autoprefixer": "^10.4.20",
++++++++    "postcss": "^8.5.3",
++++++++    "tailwindcss": "^3.4.17",
++++++++    "typescript": "^5.7.3",
++++++++    "vite": "^6.2.0"
++++++++  }
++++++++}
+++++++diff --git a/client/postcss.config.js b/client/postcss.config.js
+++++++new file mode 100644
+++++++index 0000000..2e7af2b
+++++++--- /dev/null
++++++++++ b/client/postcss.config.js
+++++++@@ -0,0 +1,6 @@
++++++++export default {
++++++++  plugins: {
++++++++    tailwindcss: {},
++++++++    autoprefixer: {},
++++++++  },
++++++++}
+++++++diff --git a/client/src/App.tsx b/client/src/App.tsx
+++++++new file mode 100644
+++++++index 0000000..28f7840
+++++++--- /dev/null
++++++++++ b/client/src/App.tsx
+++++++@@ -0,0 +1,27 @@
++++++++import React from 'react';
++++++++
++++++++export const App: React.FC = () => {
++++++++  return (
++++++++    <main className="min-h-[100dvh] flex flex-col items-center justify-center p-4 bg-[#080c16] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
++++++++      <div className="w-full max-w-md p-6 rounded-2xl glass-panel shadow-2xl text-center space-y-4">
++++++++        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-2">
++++++++          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
++++++++            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
++++++++          </svg>
++++++++        </div>
++++++++        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-violet-400 to-rose-400 bg-clip-text text-transparent font-display">
++++++++          What's The Word
++++++++        </h1>
++++++++        <p className="text-sm text-slate-400 font-sans">
++++++++          Undercover Word Deduction Game Monorepo Initialized.
++++++++        </p>
++++++++        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
++++++++          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
++++++++          Ready for Task 2
++++++++        </div>
++++++++      </div>
++++++++    </main>
++++++++  );
++++++++};
++++++++
++++++++export default App;
+++++++diff --git a/client/src/index.css b/client/src/index.css
+++++++new file mode 100644
+++++++index 0000000..d62f43d
+++++++--- /dev/null
++++++++++ b/client/src/index.css
+++++++@@ -0,0 +1,55 @@
++++++++@tailwind base;
++++++++@tailwind components;
++++++++@tailwind utilities;
++++++++
++++++++@layer base {
++++++++  :root {
++++++++    color-scheme: dark;
++++++++  }
++++++++  
++++++++  html, body {
++++++++    margin: 0;
++++++++    padding: 0;
++++++++    background-color: #080c16;
++++++++    color: #f8fafc;
++++++++    font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
++++++++    min-height: 100dvh;
++++++++    overflow-x: hidden;
++++++++    -webkit-font-smoothing: antialiased;
++++++++    -moz-osx-font-smoothing: grayscale;
++++++++  }
++++++++}
++++++++
++++++++/* Glassmorphism utility helpers */
++++++++.glass-panel {
++++++++  background: rgba(15, 23, 42, 0.82);
++++++++  backdrop-filter: blur(12px);
++++++++  -webkit-backdrop-filter: blur(12px);
++++++++  border: 1px solid rgba(255, 255, 255, 0.08);
++++++++}
++++++++
++++++++.glass-card {
++++++++  background: rgba(30, 41, 59, 0.7);
++++++++  backdrop-filter: blur(8px);
++++++++  -webkit-backdrop-filter: blur(8px);
++++++++  border: 1px solid rgba(255, 255, 255, 0.06);
++++++++}
++++++++
++++++++/* Custom scrollbar */
++++++++::-webkit-scrollbar {
++++++++  width: 6px;
++++++++  height: 6px;
++++++++}
++++++++
++++++++::-webkit-scrollbar-track {
++++++++  background: rgba(15, 23, 42, 0.6);
++++++++}
++++++++
++++++++::-webkit-scrollbar-thumb {
++++++++  background: rgba(255, 255, 255, 0.15);
++++++++  border-radius: 9999px;
++++++++}
++++++++
++++++++::-webkit-scrollbar-thumb:hover {
++++++++  background: rgba(255, 255, 255, 0.25);
++++++++}
+++++++diff --git a/client/src/main.tsx b/client/src/main.tsx
+++++++new file mode 100644
+++++++index 0000000..5d0d6ca
+++++++--- /dev/null
++++++++++ b/client/src/main.tsx
+++++++@@ -0,0 +1,13 @@
++++++++import React from 'react';
++++++++import ReactDOM from 'react-dom/client';
++++++++import App from './App';
++++++++import './index.css';
++++++++
++++++++const rootElement = document.getElementById('root');
++++++++if (rootElement) {
++++++++  ReactDOM.createRoot(rootElement).render(
++++++++    <React.StrictMode>
++++++++      <App />
++++++++    </React.StrictMode>
++++++++  );
++++++++}
+++++++diff --git a/client/src/types/game.types.ts b/client/src/types/game.types.ts
+++++++new file mode 100644
+++++++index 0000000..b000cc6
+++++++--- /dev/null
++++++++++ b/client/src/types/game.types.ts
+++++++@@ -0,0 +1,68 @@
++++++++export type PlayerRole = 'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE';
++++++++
++++++++export type GamePhase =
++++++++  | 'LOBBY'
++++++++  | 'ROLE_REVEAL'
++++++++  | 'TURN_PHASE'
++++++++  | 'VOTING'
++++++++  | 'MR_WHITE_GUESS'
++++++++  | 'GAME_OVER';
++++++++
++++++++export interface Player {
++++++++  id: string;
++++++++  name: string;
++++++++  avatar: string;
++++++++  isHost: boolean;
++++++++  role?: PlayerRole;
++++++++  word?: string;
++++++++  isAlive: boolean;
++++++++  hasVoted: boolean;
++++++++  votedTargetId?: string;
++++++++  isSpeaking?: boolean;
++++++++}
++++++++
++++++++export interface WordPair {
++++++++  id?: string;
++++++++  category: string;
++++++++  civilianWord: string;
++++++++  undercoverWord: string;
++++++++}
++++++++
++++++++export interface GameSettings {
++++++++  category: string;
++++++++  civilianCount: number;
++++++++  undercoverCount: number;
++++++++  mrWhiteCount: number;
++++++++  turnDurationSeconds: number;
++++++++  enableMrWhite: boolean;
++++++++  customWordPair?: WordPair;
++++++++}
++++++++
++++++++export interface RoomState {
++++++++  roomId: string;
++++++++  phase: GamePhase;
++++++++  round: number;
++++++++  players: Player[];
++++++++  speakingOrder: string[];
++++++++  currentSpeakerIndex: number;
++++++++  activeTurnRemainingSeconds: number;
++++++++  settings: GameSettings;
++++++++  winningRole?: 'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE';
++++++++  eliminatedPlayer?: Player;
++++++++  wordPair?: WordPair;
++++++++}
++++++++
++++++++export interface VoteRecord {
++++++++  voterId: string;
++++++++  targetId: string;
++++++++}
++++++++
++++++++export interface WordPack {
++++++++  id: string;
++++++++  name: string;
++++++++  category: string;
++++++++  description?: string;
++++++++  isOfficial: boolean;
++++++++  wordPairs: WordPair[];
++++++++  createdAt?: string;
++++++++}
+++++++diff --git a/client/src/vite-env.d.ts b/client/src/vite-env.d.ts
+++++++new file mode 100644
+++++++index 0000000..4a7a149
+++++++--- /dev/null
++++++++++ b/client/src/vite-env.d.ts
+++++++@@ -0,0 +1,10 @@
++++++++/// <reference types="vite/client" />
++++++++
++++++++interface ImportMetaEnv {
++++++++  readonly VITE_SUPABASE_URL: string;
++++++++  readonly VITE_SUPABASE_ANON_KEY: string;
++++++++}
++++++++
++++++++interface ImportMeta {
++++++++  readonly env: ImportMetaEnv;
++++++++}
+++++++diff --git a/client/tailwind.config.js b/client/tailwind.config.js
+++++++new file mode 100644
+++++++index 0000000..471d5fe
+++++++--- /dev/null
++++++++++ b/client/tailwind.config.js
+++++++@@ -0,0 +1,37 @@
++++++++/** @type {import('tailwindcss').Config} */
++++++++export default {
++++++++  content: [
++++++++    "./index.html",
++++++++    "./src/**/*.{js,ts,jsx,tsx}",
++++++++  ],
++++++++  darkMode: 'class',
++++++++  theme: {
++++++++    extend: {
++++++++      colors: {
++++++++        void: '#080c16',
++++++++        surface: {
++++++++          DEFAULT: 'rgba(15, 23, 42, 0.82)',
++++++++          glass: 'rgba(15, 23, 42, 0.82)',
++++++++          border: 'rgba(255, 255, 255, 0.08)',
++++++++        },
++++++++        cyber: {
++++++++          cyan: '#06b6d4',
++++++++          crimson: '#f43f5e',
++++++++          violet: '#a855f7',
++++++++          amber: '#f59e0b',
++++++++        },
++++++++      },
++++++++      fontFamily: {
++++++++        sans: ['Outfit', 'Cabinet Grotesk', 'Inter', 'sans-serif'],
++++++++        mono: ['JetBrains Mono', 'Geist Mono', 'monospace'],
++++++++        display: ['Outfit', 'Cabinet Grotesk', 'sans-serif'],
++++++++      },
++++++++      boxShadow: {
++++++++        'glow-cyan': '0 0 20px -5px rgba(6, 182, 212, 0.5)',
++++++++        'glow-crimson': '0 0 20px -5px rgba(244, 63, 94, 0.5)',
++++++++        'glow-violet': '0 0 20px -5px rgba(168, 85, 247, 0.5)',
++++++++      },
++++++++    },
++++++++  },
++++++++  plugins: [],
++++++++}
+++++++diff --git a/client/tsconfig.json b/client/tsconfig.json
+++++++new file mode 100644
+++++++index 0000000..b377ea7
+++++++--- /dev/null
++++++++++ b/client/tsconfig.json
+++++++@@ -0,0 +1,25 @@
++++++++{
++++++++  "compilerOptions": {
++++++++    "target": "ES2020",
++++++++    "useDefineForClassFields": true,
++++++++    "lib": ["ES2020", "DOM", "DOM.Iterable"],
++++++++    "module": "ESNext",
++++++++    "skipLibCheck": true,
++++++++    "moduleResolution": "bundler",
++++++++    "allowImportingTsExtensions": false,
++++++++    "resolveJsonModule": true,
++++++++    "isolatedModules": true,
++++++++    "noEmit": true,
++++++++    "jsx": "react-jsx",
++++++++    "strict": true,
++++++++    "noUnusedLocals": true,
++++++++    "noUnusedParameters": true,
++++++++    "noFallthroughCasesInSwitch": true,
++++++++    "baseUrl": ".",
++++++++    "paths": {
++++++++      "@/*": ["src/*"]
++++++++    }
++++++++  },
++++++++  "include": ["src"],
++++++++  "references": [{ "path": "./tsconfig.node.json" }]
++++++++}
+++++++diff --git a/client/tsconfig.node.json b/client/tsconfig.node.json
+++++++new file mode 100644
+++++++index 0000000..e8a6a45
+++++++--- /dev/null
++++++++++ b/client/tsconfig.node.json
+++++++@@ -0,0 +1,10 @@
++++++++{
++++++++  "compilerOptions": {
++++++++    "composite": true,
++++++++    "skipLibCheck": true,
++++++++    "module": "ESNext",
++++++++    "moduleResolution": "bundler",
++++++++    "allowSyntheticDefaultImports": true
++++++++  },
++++++++  "include": ["vite.config.ts", "tailwind.config.js", "postcss.config.js"]
++++++++}
+++++++diff --git a/client/vite.config.ts b/client/vite.config.ts
+++++++new file mode 100644
+++++++index 0000000..467bed1
+++++++--- /dev/null
++++++++++ b/client/vite.config.ts
+++++++@@ -0,0 +1,25 @@
++++++++import { defineConfig } from 'vite';
++++++++import react from '@vitejs/plugin-react';
++++++++import path from 'path';
++++++++
++++++++// https://vitejs.dev/config/
++++++++export default defineConfig({
++++++++  plugins: [react()],
++++++++  resolve: {
++++++++    alias: {
++++++++      '@': path.resolve(__dirname, './src'),
++++++++    },
++++++++  },
++++++++  server: {
++++++++    port: 5173,
++++++++    proxy: {
++++++++      '/socket.io': {
++++++++        target: 'http://localhost:3001',
++++++++        ws: true,
++++++++      },
++++++++      '/api': {
++++++++        target: 'http://localhost:3001',
++++++++      },
++++++++    },
++++++++  },
++++++++});
+++++++diff --git a/package-lock.json b/package-lock.json
+++++++new file mode 100644
+++++++index 0000000..88cfbef
+++++++--- /dev/null
++++++++++ b/package-lock.json
+++++++@@ -0,0 +1,5445 @@
++++++++{
++++++++  "name": "whatstheword-monorepo",
++++++++  "version": "1.0.0",
++++++++  "lockfileVersion": 3,
++++++++  "requires": true,
++++++++  "packages": {
++++++++    "": {
++++++++      "name": "whatstheword-monorepo",
++++++++      "version": "1.0.0",
++++++++      "workspaces": [
++++++++        "client",
++++++++        "server"
++++++++      ],
++++++++      "devDependencies": {
++++++++        "concurrently": "^9.1.2"
++++++++      }
++++++++    },
++++++++    "client": {
++++++++      "name": "whatstheword-client",
++++++++      "version": "1.0.0",
++++++++      "dependencies": {
++++++++        "@supabase/supabase-js": "^2.49.1",
++++++++        "clsx": "^2.1.1",
++++++++        "lucide-react": "^1.16.0",
++++++++        "motion": "^12.4.10",
++++++++        "react": "^18.3.1",
++++++++        "react-dom": "^18.3.1",
++++++++        "socket.io-client": "^4.8.1",
++++++++        "tailwind-merge": "^3.0.2"
++++++++      },
++++++++      "devDependencies": {
++++++++        "@types/node": "^22.13.9",
++++++++        "@types/react": "^18.3.18",
++++++++        "@types/react-dom": "^18.3.5",
++++++++        "@vitejs/plugin-react": "^4.3.4",
++++++++        "autoprefixer": "^10.4.20",
++++++++        "postcss": "^8.5.3",
++++++++        "tailwindcss": "^3.4.17",
++++++++        "typescript": "^5.7.3",
++++++++        "vite": "^6.2.0"
++++++++      }
++++++++    },
++++++++    "node_modules/@alloc/quick-lru": {
++++++++      "version": "5.3.0",
++++++++      "resolved": "https://registry.npmjs.org/@alloc/quick-lru/-/quick-lru-5.3.0.tgz",
++++++++      "integrity": "sha512-U4+70Pc5ZS9osnCBCE5Jha/ciHM+Yp+CNMNC/7HvYbNRk1Ldd+f7qO65W5qfhu/TCv+/ozljlXXe9Nj8419DMA==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=10"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://github.com/sponsors/sindresorhus"
++++++++      }
++++++++    },
++++++++    "node_modules/@babel/code-frame": {
++++++++      "version": "7.29.7",
++++++++      "resolved": "https://registry.npmjs.org/@babel/code-frame/-/code-frame-7.29.7.tgz",
++++++++      "integrity": "sha512-Aup7aUOfpbAUg2ROOJN6Iw5f9DMBlzu0mIkm/malLQFN/YQgO48wCj0Kxa3sEHJvPVFg7siR+qRInwXd2qhQKw==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@babel/helper-validator-identifier": "^7.29.7",
++++++++        "js-tokens": "^4.0.0",
++++++++        "picocolors": "^1.1.1"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=6.9.0"
++++++++      }
++++++++    },
++++++++    "node_modules/@babel/compat-data": {
++++++++      "version": "7.29.7",
++++++++      "resolved": "https://registry.npmjs.org/@babel/compat-data/-/compat-data-7.29.7.tgz",
++++++++      "integrity": "sha512-locTkQyKvwIEgBzVrn8693ebc97F2U8ZHjbXwDXJ5Fn2TCpNwTlKcaKLkdHop5c/icOFE7qt7Q9JC5hnKNa6Gg==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=6.9.0"
++++++++      }
++++++++    },
++++++++    "node_modules/@babel/core": {
++++++++      "version": "7.29.7",
++++++++      "resolved": "https://registry.npmjs.org/@babel/core/-/core-7.29.7.tgz",
++++++++      "integrity": "sha512-RgHBCvtjbOK2gXSNBNIkNoEc9qoVEtau3hj8gEqKQuL3HZAibKarWFEI3Lfm6EYKkLalOh8eSrj9b+ch9H/VBA==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@babel/code-frame": "^7.29.7",
++++++++        "@babel/generator": "^7.29.7",
++++++++        "@babel/helper-compilation-targets": "^7.29.7",
++++++++        "@babel/helper-module-transforms": "^7.29.7",
++++++++        "@babel/helpers": "^7.29.7",
++++++++        "@babel/parser": "^7.29.7",
++++++++        "@babel/template": "^7.29.7",
++++++++        "@babel/traverse": "^7.29.7",
++++++++        "@babel/types": "^7.29.7",
++++++++        "@jridgewell/remapping": "^2.3.5",
++++++++        "convert-source-map": "^2.0.0",
++++++++        "debug": "^4.1.0",
++++++++        "gensync": "^1.0.0-beta.2",
++++++++        "json5": "^2.2.3",
++++++++        "semver": "^6.3.1"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=6.9.0"
++++++++      },
++++++++      "funding": {
++++++++        "type": "opencollective",
++++++++        "url": "https://opencollective.com/babel"
++++++++      }
++++++++    },
++++++++    "node_modules/@babel/generator": {
++++++++      "version": "7.29.8",
++++++++      "resolved": "https://registry.npmjs.org/@babel/generator/-/generator-7.29.8.tgz",
++++++++      "integrity": "sha512-gZbepsdh3WDtgZKWL+vTPh71LSBrm/Y4/QDZBVCcYfmeTEEuoOYwlSy+G1StfJg+/Zy550u/3TATbm7qDbbMtg==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@babel/parser": "^7.29.8",
++++++++        "@babel/types": "^7.29.8",
++++++++        "@jridgewell/gen-mapping": "^0.3.12",
++++++++        "@jridgewell/trace-mapping": "^0.3.28",
++++++++        "jsesc": "^3.0.2"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=6.9.0"
++++++++      }
++++++++    },
++++++++    "node_modules/@babel/helper-compilation-targets": {
++++++++      "version": "7.29.7",
++++++++      "resolved": "https://registry.npmjs.org/@babel/helper-compilation-targets/-/helper-compilation-targets-7.29.7.tgz",
++++++++      "integrity": "sha512-wem6WaBj4NaVYVdNhLPPVacES6ZJ+KBBfSkTMD3YZxbP3rm3Di85tJU5ljaUNhaOynt+Aj0xruhYuzQBt8n71g==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@babel/compat-data": "^7.29.7",
++++++++        "@babel/helper-validator-option": "^7.29.7",
++++++++        "browserslist": "^4.24.0",
++++++++        "lru-cache": "^5.1.1",
++++++++        "semver": "^6.3.1"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=6.9.0"
++++++++      }
++++++++    },
++++++++    "node_modules/@babel/helper-globals": {
++++++++      "version": "7.29.7",
++++++++      "resolved": "https://registry.npmjs.org/@babel/helper-globals/-/helper-globals-7.29.7.tgz",
++++++++      "integrity": "sha512-3nQVUAtvkKH9zahfWgw96Jc/uFOmjACE1kQz82E2lqWmHBgjzbNlsC22nuQTfahmWeQtTq5nQ/4Nnd2A1wj4zA==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=6.9.0"
++++++++      }
++++++++    },
++++++++    "node_modules/@babel/helper-module-imports": {
++++++++      "version": "7.29.7",
++++++++      "resolved": "https://registry.npmjs.org/@babel/helper-module-imports/-/helper-module-imports-7.29.7.tgz",
++++++++      "integrity": "sha512-ejHwrQQYcm9xnTivShn2IDOlIzInN34AXskvq9QicvCtEzq1Vzclu/tKF8Jq1Cg8JG2GL6/EmjgsCT7lXepE3g==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@babel/traverse": "^7.29.7",
++++++++        "@babel/types": "^7.29.7"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=6.9.0"
++++++++      }
++++++++    },
++++++++    "node_modules/@babel/helper-module-transforms": {
++++++++      "version": "7.29.7",
++++++++      "resolved": "https://registry.npmjs.org/@babel/helper-module-transforms/-/helper-module-transforms-7.29.7.tgz",
++++++++      "integrity": "sha512-UPUVSyXbOh627KiCIGQSgwWzGeBKLkaJ9PJEdrngIwMSzxLR4jS4+f1f1jb7VzBbg8nFLaYotvVPFCTqdrmTAg==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@babel/helper-module-imports": "^7.29.7",
++++++++        "@babel/helper-validator-identifier": "^7.29.7",
++++++++        "@babel/traverse": "^7.29.7"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=6.9.0"
++++++++      },
++++++++      "peerDependencies": {
++++++++        "@babel/core": "^7.0.0"
++++++++      }
++++++++    },
++++++++    "node_modules/@babel/helper-plugin-utils": {
++++++++      "version": "7.29.7",
++++++++      "resolved": "https://registry.npmjs.org/@babel/helper-plugin-utils/-/helper-plugin-utils-7.29.7.tgz",
++++++++      "integrity": "sha512-G7sHYigPY17oO5SYWnfD/0MTBwVR781S/JI643e/JhUYgVgWE/61SoW3NH9KWUKyKq5LVh3npif99Wkt6j86Jw==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=6.9.0"
++++++++      }
++++++++    },
++++++++    "node_modules/@babel/helper-string-parser": {
++++++++      "version": "7.29.7",
++++++++      "resolved": "https://registry.npmjs.org/@babel/helper-string-parser/-/helper-string-parser-7.29.7.tgz",
++++++++      "integrity": "sha512-Pb5ijPrZ89GDH8223L4UP8i6QApWxs04RbPQJTeWDV0/keR2E36MeKnyr6LYmUUvqRRI+Iv87SuF1W6ErINzYw==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=6.9.0"
++++++++      }
++++++++    },
++++++++    "node_modules/@babel/helper-validator-identifier": {
++++++++      "version": "7.29.7",
++++++++      "resolved": "https://registry.npmjs.org/@babel/helper-validator-identifier/-/helper-validator-identifier-7.29.7.tgz",
++++++++      "integrity": "sha512-qehxGkRj55h/ff8EMaJ+cYhyaKlHIxqYDn682wQD7RNp9UujOQsHog2uS0r2vzr4pW+sXf90NeeayjcNaX3fFg==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=6.9.0"
++++++++      }
++++++++    },
++++++++    "node_modules/@babel/helper-validator-option": {
++++++++      "version": "7.29.7",
++++++++      "resolved": "https://registry.npmjs.org/@babel/helper-validator-option/-/helper-validator-option-7.29.7.tgz",
++++++++      "integrity": "sha512-N9ZErrD+yW5geCDtBqnOoxmR8+tNKiGuxKlDpuJxfsqpa2dFcexaziGAE/qoHLiDDreVNMupxGmSoNlyvsA3gw==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=6.9.0"
++++++++      }
++++++++    },
++++++++    "node_modules/@babel/helpers": {
++++++++      "version": "7.29.7",
++++++++      "resolved": "https://registry.npmjs.org/@babel/helpers/-/helpers-7.29.7.tgz",
++++++++      "integrity": "sha512-1k2lAGRMfHTcwuNYcCNUmaUffmQv8KWMfh2iJUUeRlwlwH4FdNG7mfPI10NPfLHJFThE4Tyr4mv7kTNZOiPuBg==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@babel/template": "^7.29.7",
++++++++        "@babel/types": "^7.29.7"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=6.9.0"
++++++++      }
++++++++    },
++++++++    "node_modules/@babel/parser": {
++++++++      "version": "7.29.8",
++++++++      "resolved": "https://registry.npmjs.org/@babel/parser/-/parser-7.29.8.tgz",
++++++++      "integrity": "sha512-E8lTAYNB1KW+FH+VGJuZM1ioAx2E6oVlvQFRrf5P8ZZmsiJXYAD9vTFV7yyEURNzgh1dFqMZuO6tUwcARbqFCA==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@babel/types": "^7.29.8"
++++++++      },
++++++++      "bin": {
++++++++        "parser": "bin/babel-parser.js"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=6.0.0"
++++++++      }
++++++++    },
++++++++    "node_modules/@babel/plugin-transform-react-jsx-self": {
++++++++      "version": "7.29.7",
++++++++      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-react-jsx-self/-/plugin-transform-react-jsx-self-7.29.7.tgz",
++++++++      "integrity": "sha512-TL0hMc9xzy86VD31nUiwzd5otRAcyEPcsegCxolO0PvcXuH1v0kECe/UIznYFihpkvU5wg/jk4v0TTEFfm53fw==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@babel/helper-plugin-utils": "^7.29.7"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=6.9.0"
++++++++      },
++++++++      "peerDependencies": {
++++++++        "@babel/core": "^7.0.0-0"
++++++++      }
++++++++    },
++++++++    "node_modules/@babel/plugin-transform-react-jsx-source": {
++++++++      "version": "7.29.7",
++++++++      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-react-jsx-source/-/plugin-transform-react-jsx-source-7.29.7.tgz",
++++++++      "integrity": "sha512-06IyK09H3wi4cGbhDBwp5gUGo0IKtnYa8tyTiephirPCK6fbobVGiXMMI5zLQ4aKEYP3wZ3ArU44o+8KMrSG/Q==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@babel/helper-plugin-utils": "^7.29.7"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=6.9.0"
++++++++      },
++++++++      "peerDependencies": {
++++++++        "@babel/core": "^7.0.0-0"
++++++++      }
++++++++    },
++++++++    "node_modules/@babel/template": {
++++++++      "version": "7.29.7",
++++++++      "resolved": "https://registry.npmjs.org/@babel/template/-/template-7.29.7.tgz",
++++++++      "integrity": "sha512-puq+Gf35oI24FeN11LkoUQFqv9uwNeWpxXZi/Ji3rRIoKAzKnxRaZ+Gkj0vKS9ZCiTESfng1N9LyOyXvo+m+Gg==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@babel/code-frame": "^7.29.7",
++++++++        "@babel/parser": "^7.29.7",
++++++++        "@babel/types": "^7.29.7"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=6.9.0"
++++++++      }
++++++++    },
++++++++    "node_modules/@babel/traverse": {
++++++++      "version": "7.29.8",
++++++++      "resolved": "https://registry.npmjs.org/@babel/traverse/-/traverse-7.29.8.tgz",
++++++++      "integrity": "sha512-I5z7H3bf/41ktsNVLtpN0wAa336HkqIHQ5BuPLEhTkt1jVSyZpeNKIzTgEWmlxjdg81R0IgUCcaE+Ok3NvrfZg==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@babel/code-frame": "^7.29.7",
++++++++        "@babel/generator": "^7.29.8",
++++++++        "@babel/helper-globals": "^7.29.7",
++++++++        "@babel/parser": "^7.29.8",
++++++++        "@babel/template": "^7.29.7",
++++++++        "@babel/types": "^7.29.8",
++++++++        "debug": "^4.3.1"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=6.9.0"
++++++++      }
++++++++    },
++++++++    "node_modules/@babel/types": {
++++++++      "version": "7.29.8",
++++++++      "resolved": "https://registry.npmjs.org/@babel/types/-/types-7.29.8.tgz",
++++++++      "integrity": "sha512-Vj1jF3cPfxg7OAfoI7QnVKLoILlm2JF9pnVHrX8qx7AHMiYWT+NDAA7jChlNgRS4WTLc/fD1lXLmPixluj+3Gg==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@babel/helper-string-parser": "^7.29.7",
++++++++        "@babel/helper-validator-identifier": "^7.29.7"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=6.9.0"
++++++++      }
++++++++    },
++++++++    "node_modules/@esbuild/aix-ppc64": {
++++++++      "version": "0.28.2",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.28.2.tgz",
++++++++      "integrity": "sha512-XExcO+dvLKvVtNTibSTBej1NCAbaGhWn9Ww1ZPx80qsahhPFe/8jgWP0IchNe0F3HwkU7n8ejhH8bjonqht8mQ==",
++++++++      "cpu": [
++++++++        "ppc64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "aix"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/@esbuild/android-arm": {
++++++++      "version": "0.28.2",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.28.2.tgz",
++++++++      "integrity": "sha512-kXXoiPVVGQcnIYGOeaovwOURpniDBpSq4A03qkQ+BMQqtGG6HYap3xne9C1O1yo4TR3qxlCX5IqqmX6fFo2Lqg==",
++++++++      "cpu": [
++++++++        "arm"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "android"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/@esbuild/android-arm64": {
++++++++      "version": "0.28.2",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.28.2.tgz",
++++++++      "integrity": "sha512-5YfKeeI8qWfBZIX+u2xZC3Zlb3Os/gLS2sbEKM+I4ZOcsWmHS2WLysCcQZDAFRslDUU5Oiq44gf6PYN1vGwG5A==",
++++++++      "cpu": [
++++++++        "arm64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "android"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/@esbuild/android-x64": {
++++++++      "version": "0.28.2",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.28.2.tgz",
++++++++      "integrity": "sha512-O387ite7SzUyCcy3JQX4P4bLtEA7bLLkx+esve5JHnyYfNTxcVpXZo9jhdB0lTKN44gztELTdU7nS8Nr16Fs1Q==",
++++++++      "cpu": [
++++++++        "x64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "android"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/@esbuild/darwin-arm64": {
++++++++      "version": "0.28.2",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.28.2.tgz",
++++++++      "integrity": "sha512-n4KqkOQrraxHJcgjM1RvwbigfQKIKJVpM7xp+KsxiyUSrRdIXnt73VhrPAx0fV44hgfmIVKjxMN9J1t5jySVkw==",
++++++++      "cpu": [
++++++++        "arm64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "darwin"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/@esbuild/darwin-x64": {
++++++++      "version": "0.28.2",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.28.2.tgz",
++++++++      "integrity": "sha512-uq6suIWYP37qzGddBKPw5QEQPi6HiLGsO7UmkpfyaYNQ3D+rN6w6WfwH+nuqcGXWvawGwxOEroO4YGnFh95azw==",
++++++++      "cpu": [
++++++++        "x64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "darwin"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/@esbuild/freebsd-arm64": {
++++++++      "version": "0.28.2",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.28.2.tgz",
++++++++      "integrity": "sha512-n+I0BTSRIoy+d6RPKnEVwql5UwBJolytvY4mAOIEJorKlqgPII8ix6slVVrfZ5Tnj7glIZvloylbB/EJPMWEXw==",
++++++++      "cpu": [
++++++++        "arm64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "freebsd"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/@esbuild/freebsd-x64": {
++++++++      "version": "0.28.2",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.28.2.tgz",
++++++++      "integrity": "sha512-78XJTJkvPs0kz2w61301PJjXl4g7q3JqiYMZ/M/yVI73EHBrCRTgkhu9oqG7vPqq+a/yadEW8aD+agKlk5xrmg==",
++++++++      "cpu": [
++++++++        "x64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "freebsd"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/@esbuild/linux-arm": {
++++++++      "version": "0.28.2",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.28.2.tgz",
++++++++      "integrity": "sha512-XlDnu2q5yoqems+xay6wSAcg9DDD7K9RLKZEBOMZm3ckNpJBvOX20tSfby8KfrrhINDyv9V2YVZKY/SpoGJI8w==",
++++++++      "cpu": [
++++++++        "arm"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "linux"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/@esbuild/linux-arm64": {
++++++++      "version": "0.28.2",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.28.2.tgz",
++++++++      "integrity": "sha512-pW4AC0P3it8c7do9MVM4p51FzHzdM/TZrerurgRcHJ2WTa1VQ1CIq18xncfpBJw4ojkiZZrKW2yIBWBP92j6Ug==",
++++++++      "cpu": [
++++++++        "arm64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "linux"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/@esbuild/linux-ia32": {
++++++++      "version": "0.28.2",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.28.2.tgz",
++++++++      "integrity": "sha512-CYbnj78HsIeA+DhgUKgFCfvNsTHFhMMrinUrMZpDXJXKN8T3XViTZ/+wtHeVxEWY8ewSzTFN+nRmSwO2tZaLUQ==",
++++++++      "cpu": [
++++++++        "ia32"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "linux"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/@esbuild/linux-loong64": {
++++++++      "version": "0.28.2",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.28.2.tgz",
++++++++      "integrity": "sha512-buwkd8nsph4R+ajRvw0qM5Hja/TXQow3ptzWO2EbG/cqcIkHloRrdlBtQlshyYGTNFvfkfJ5tpPLVkY4DtsPfQ==",
++++++++      "cpu": [
++++++++        "loong64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "linux"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/@esbuild/linux-mips64el": {
++++++++      "version": "0.28.2",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.28.2.tgz",
++++++++      "integrity": "sha512-ZVykbDyk7519VwiNb9Lcj9m8XM6v5V9uKPvrEMkkEedVewf+0itkhahp4HDpgERXhwLRpWFypsGbG/J8s0QjJA==",
++++++++      "cpu": [
++++++++        "mips64el"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "linux"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/@esbuild/linux-ppc64": {
++++++++      "version": "0.28.2",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.28.2.tgz",
++++++++      "integrity": "sha512-CAXl+Dtd9UUuJd8pKKdwh6MLm3MUMiqMPmhZ3tTSXPqfyQ3vDl6R5hZdZ/kYojK4ofXtdfSv1tFq8XzWx3heNQ==",
++++++++      "cpu": [
++++++++        "ppc64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "linux"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/@esbuild/linux-riscv64": {
++++++++      "version": "0.28.2",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.28.2.tgz",
++++++++      "integrity": "sha512-GeXCej4IQtU1B+QlDV8W/RRvbzI3O/Stss+/bCXv4lZls5WGRtu2a+3JkA3i4qIUlMXpcHebWpF8AkJhATowuA==",
++++++++      "cpu": [
++++++++        "riscv64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "linux"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/@esbuild/linux-s390x": {
++++++++      "version": "0.28.2",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.28.2.tgz",
++++++++      "integrity": "sha512-3H1weTYZPxt/WOhByszQZybS9w5lKzUn1FDMsgEChbHWQwHYQQRfBxgCcZvPhjHfKyJjIievvMmEUawJrdY9Dg==",
++++++++      "cpu": [
++++++++        "s390x"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "linux"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/@esbuild/linux-x64": {
++++++++      "version": "0.28.2",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.28.2.tgz",
++++++++      "integrity": "sha512-4xTZr1FUmSoQW4XIWmit3tzQrUTZM+N3P0XV8xROKYF50XfI7xeO90+1bZvNwxIufQ9hDQVRJH5YhgPVF8A/HQ==",
++++++++      "cpu": [
++++++++        "x64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "linux"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/@esbuild/netbsd-arm64": {
++++++++      "version": "0.28.2",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-arm64/-/netbsd-arm64-0.28.2.tgz",
++++++++      "integrity": "sha512-sSATRjPeDBg3pdgHoQfoYBob11Kk1FGa9lui5RIHZCoCkJa9QKlvl3/vKz2usCmYYjs7ymJR/2Nnsqe+Hjt5nw==",
++++++++      "cpu": [
++++++++        "arm64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "netbsd"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/@esbuild/netbsd-x64": {
++++++++      "version": "0.28.2",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.28.2.tgz",
++++++++      "integrity": "sha512-lqnzCV+mM0gIADaKihiCg6ifgfU2L3h5E33rNQBN1Y4MaVGnzryzmvvf7UHxprpQdE8hpqLolJ9Rl+SkIRDpyw==",
++++++++      "cpu": [
++++++++        "x64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "netbsd"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/@esbuild/openbsd-arm64": {
++++++++      "version": "0.28.2",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-arm64/-/openbsd-arm64-0.28.2.tgz",
++++++++      "integrity": "sha512-AL2qJILH7lNjrDmCQDvdxMfAUIv8KMNZOvrwAQ8i8//ntL9FflhOyMJ8OZSMBb8/AWXe3/5v5S20y3zCoZWKoQ==",
++++++++      "cpu": [
++++++++        "arm64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "openbsd"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/@esbuild/openbsd-x64": {
++++++++      "version": "0.28.2",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.28.2.tgz",
++++++++      "integrity": "sha512-QtiuPytchRyC4rwUKhexJdQKvDuZ6hWloi3igqPQNUJCS1/v9EiO3UTOXR6A3FoMo4fnAKbWJdqaIwhOzh8qEw==",
++++++++      "cpu": [
++++++++        "x64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "openbsd"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/@esbuild/openharmony-arm64": {
++++++++      "version": "0.28.2",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/openharmony-arm64/-/openharmony-arm64-0.28.2.tgz",
++++++++      "integrity": "sha512-WkhYDmpTjLvGlScA1rwjRUmhl4k8oXR3cIbtqWmELgU/dFeHHlEllxDvdWcNJV9rbzCexB5vz8gtNewWLgCT7Q==",
++++++++      "cpu": [
++++++++        "arm64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "openharmony"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/@esbuild/sunos-x64": {
++++++++      "version": "0.28.2",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.28.2.tgz",
++++++++      "integrity": "sha512-GPMSkTOtMnv2U2F8gxe4Io6qmVs+YKyp832Etqqxr0hFngmXQ3rzwytelm3GIn7T4VviRUlf3sOgBOiTdvaf7g==",
++++++++      "cpu": [
++++++++        "x64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "sunos"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/@esbuild/win32-arm64": {
++++++++      "version": "0.28.2",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.28.2.tgz",
++++++++      "integrity": "sha512-PIhhEkE9uPBleRBrQEJpUn7MBnibZzbGzYWPmY3x+YoVg/95zbjB4CxPPOQ8l5tYYM4mMaCthF8/1DIfBQQyWQ==",
++++++++      "cpu": [
++++++++        "arm64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "win32"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/@esbuild/win32-ia32": {
++++++++      "version": "0.28.2",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.28.2.tgz",
++++++++      "integrity": "sha512-YmJbfTlvU7Sdn9BB+4PRES4oB6pxgS37MAONj+hBr/cpXS1aBPKXxNnDbu+QCWPj0o9dgyxeq79g6c5P8KeuYA==",
++++++++      "cpu": [
++++++++        "ia32"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "win32"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/@esbuild/win32-x64": {
++++++++      "version": "0.28.2",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.28.2.tgz",
++++++++      "integrity": "sha512-5ebpxr3nWMzrL/rnUI755Jkuee0bHL/Gq0WTF9lvcpv73wAp5eu8MfBUgWK9bhWvZjj7yX8etf/8tI8Ney695g==",
++++++++      "cpu": [
++++++++        "x64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "win32"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/@jridgewell/gen-mapping": {
++++++++      "version": "0.3.13",
++++++++      "resolved": "https://registry.npmjs.org/@jridgewell/gen-mapping/-/gen-mapping-0.3.13.tgz",
++++++++      "integrity": "sha512-2kkt/7niJ6MgEPxF0bYdQ6etZaA+fQvDcLKckhy1yIQOzaoKjBBjSj63/aLVjYE3qhRt5dvM+uUyfCg6UKCBbA==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@jridgewell/sourcemap-codec": "^1.5.0",
++++++++        "@jridgewell/trace-mapping": "^0.3.24"
++++++++      }
++++++++    },
++++++++    "node_modules/@jridgewell/remapping": {
++++++++      "version": "2.3.5",
++++++++      "resolved": "https://registry.npmjs.org/@jridgewell/remapping/-/remapping-2.3.5.tgz",
++++++++      "integrity": "sha512-LI9u/+laYG4Ds1TDKSJW2YPrIlcVYOwi2fUC6xB43lueCjgxV4lffOCZCtYFiH6TNOX+tQKXx97T4IKHbhyHEQ==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@jridgewell/gen-mapping": "^0.3.5",
++++++++        "@jridgewell/trace-mapping": "^0.3.24"
++++++++      }
++++++++    },
++++++++    "node_modules/@jridgewell/resolve-uri": {
++++++++      "version": "3.1.2",
++++++++      "resolved": "https://registry.npmjs.org/@jridgewell/resolve-uri/-/resolve-uri-3.1.2.tgz",
++++++++      "integrity": "sha512-bRISgCIjP20/tbWSPWMEi54QVPRZExkuD9lJL+UIxUKtwVJA8wW1Trb1jMs1RFXo1CBTNZ/5hpC9QvmKWdopKw==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=6.0.0"
++++++++      }
++++++++    },
++++++++    "node_modules/@jridgewell/sourcemap-codec": {
++++++++      "version": "1.6.0",
++++++++      "resolved": "https://registry.npmjs.org/@jridgewell/sourcemap-codec/-/sourcemap-codec-1.6.0.tgz",
++++++++      "integrity": "sha512-T7jf+5zgsZHwNJ4lvQ7/aezbyk0nNX+zJVWpmHA7VYsEx7a7qr5Rg5IbtJFqkgze5Y2sruq1RUY8Q837Od7iFw==",
++++++++      "dev": true,
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/@jridgewell/trace-mapping": {
++++++++      "version": "0.3.31",
++++++++      "resolved": "https://registry.npmjs.org/@jridgewell/trace-mapping/-/trace-mapping-0.3.31.tgz",
++++++++      "integrity": "sha512-zzNR+SdQSDJzc8joaeP8QQoCQr8NuYx2dIIytl1QeBEZHJ9uW6hebsrYgbz8hJwUQao3TWCMtmfV8Nu1twOLAw==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@jridgewell/resolve-uri": "^3.1.0",
++++++++        "@jridgewell/sourcemap-codec": "^1.4.14"
++++++++      }
++++++++    },
++++++++    "node_modules/@napi-rs/lzma-linux-x64-gnu": {
++++++++      "version": "1.5.1",
++++++++      "resolved": "https://registry.npmjs.org/@napi-rs/lzma-linux-x64-gnu/-/lzma-linux-x64-gnu-1.5.1.tgz",
++++++++      "integrity": "sha512-oTXEIha4SsuXdTA4Iyskj0kpdx2yVXdhd75c2v3xGrHFfVMsbhTPZU/nMPL4sWKo4pBHm3aucLaqGlF696dTyQ==",
++++++++      "cpu": [
++++++++        "x64"
++++++++      ],
++++++++      "dev": true,
++++++++      "libc": [
++++++++        "glibc"
++++++++      ],
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "linux"
++++++++      ],
++++++++      "engines": {
++++++++        "node": "^22.20 || ^24.12 || >=25"
++++++++      }
++++++++    },
++++++++    "node_modules/@nodelib/fs.scandir": {
++++++++      "version": "2.1.5",
++++++++      "resolved": "https://registry.npmjs.org/@nodelib/fs.scandir/-/fs.scandir-2.1.5.tgz",
++++++++      "integrity": "sha512-vq24Bq3ym5HEQm2NKCr3yXDwjc7vTsEThRDnkp2DK9p1uqLR+DHurm/NOTo0KG7HYHU7eppKZj3MyqYuMBf62g==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@nodelib/fs.stat": "2.0.5",
++++++++        "run-parallel": "^1.1.9"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 8"
++++++++      }
++++++++    },
++++++++    "node_modules/@nodelib/fs.stat": {
++++++++      "version": "2.0.5",
++++++++      "resolved": "https://registry.npmjs.org/@nodelib/fs.stat/-/fs.stat-2.0.5.tgz",
++++++++      "integrity": "sha512-RkhPPp2zrqDAQA/2jNhnztcPAlv64XdhIp7a7454A5ovI7Bukxgt7MX7udwAu3zg1DcpPU0rz3VV1SeaqvY4+A==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 8"
++++++++      }
++++++++    },
++++++++    "node_modules/@nodelib/fs.walk": {
++++++++      "version": "1.2.8",
++++++++      "resolved": "https://registry.npmjs.org/@nodelib/fs.walk/-/fs.walk-1.2.8.tgz",
++++++++      "integrity": "sha512-oGB+UxlgWcgQkgwo8GcEGwemoTFt3FIO9ababBmaGwXIoBKZ+GTy0pP185beGg7Llih/NSHSV2XAs1lnznocSg==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@nodelib/fs.scandir": "2.1.5",
++++++++        "fastq": "^1.6.0"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 8"
++++++++      }
++++++++    },
++++++++    "node_modules/@rolldown/pluginutils": {
++++++++      "version": "1.0.0-beta.27",
++++++++      "resolved": "https://registry.npmjs.org/@rolldown/pluginutils/-/pluginutils-1.0.0-beta.27.tgz",
++++++++      "integrity": "sha512-+d0F4MKMCbeVUJwG96uQ4SgAznZNSq93I3V+9NHA4OpvqG8mRCpGdKmK8l/dl02h2CCDHwW2FqilnTyDcAnqjA==",
++++++++      "dev": true,
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/@rollup/rollup-android-arm-eabi": {
++++++++      "version": "4.63.1",
++++++++      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm-eabi/-/rollup-android-arm-eabi-4.63.1.tgz",
++++++++      "integrity": "sha512-UZ8sUxPTiHWYX9QNdJedb1kDZSpS1t/VPWBWGSgqHNi9w3Cu6IXvu2mzbhiTiPvtrqgTQJ+zqiAq2iPIPilpaQ==",
++++++++      "cpu": [
++++++++        "arm"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "android"
++++++++      ]
++++++++    },
++++++++    "node_modules/@rollup/rollup-android-arm64": {
++++++++      "version": "4.63.1",
++++++++      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm64/-/rollup-android-arm64-4.63.1.tgz",
++++++++      "integrity": "sha512-cQ4nFQABN5cDvDpbvJ7bMStCpnaVxynZrRMfUJYgxcIk9Sh54FIO1vtfkg0B69REjER77ioZ/ov+eAApx/KmLQ==",
++++++++      "cpu": [
++++++++        "arm64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "android"
++++++++      ]
++++++++    },
++++++++    "node_modules/@rollup/rollup-darwin-arm64": {
++++++++      "version": "4.63.1",
++++++++      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-arm64/-/rollup-darwin-arm64-4.63.1.tgz",
++++++++      "integrity": "sha512-FQNqd1lRy/0QhDk3xeRIkSBiCpXCiDnZO3YLVdcDKN1UBiKToNftCzcXYNLshmPDUMlu2TdeS8tGcsU6f3YF1Q==",
++++++++      "cpu": [
++++++++        "arm64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "darwin"
++++++++      ]
++++++++    },
++++++++    "node_modules/@rollup/rollup-darwin-x64": {
++++++++      "version": "4.63.1",
++++++++      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-x64/-/rollup-darwin-x64-4.63.1.tgz",
++++++++      "integrity": "sha512-pvD16V939D3CloK0+qikpGaxiPrDUXTe7Y5cWOMkMSy7m1cawa8EGy/kXYi/G/cKAC4HDAbSnzCIk1WmsoOKXg==",
++++++++      "cpu": [
++++++++        "x64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "darwin"
++++++++      ]
++++++++    },
++++++++    "node_modules/@rollup/rollup-freebsd-arm64": {
++++++++      "version": "4.63.1",
++++++++      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-arm64/-/rollup-freebsd-arm64-4.63.1.tgz",
++++++++      "integrity": "sha512-pcFGeL2345VwdTnJhA6zLbew+YgWB0qBG2+dMtXjCicf6+rm6kO6cOoh5VnTe0ZMrMRgRyuHmCJxZWrIdzYuOw==",
++++++++      "cpu": [
++++++++        "arm64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "freebsd"
++++++++      ]
++++++++    },
++++++++    "node_modules/@rollup/rollup-freebsd-x64": {
++++++++      "version": "4.63.1",
++++++++      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-x64/-/rollup-freebsd-x64-4.63.1.tgz",
++++++++      "integrity": "sha512-mRJlqSRulVzcKq/LKA6ICSIc3K/l4fzlVn/gePn2nXIHy8seRi5z/eeRE0d/XMBxcMldiXtQTSpRj0tkkC3g8Q==",
++++++++      "cpu": [
++++++++        "x64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "freebsd"
++++++++      ]
++++++++    },
++++++++    "node_modules/@rollup/rollup-linux-arm-gnueabihf": {
++++++++      "version": "4.63.1",
++++++++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-gnueabihf/-/rollup-linux-arm-gnueabihf-4.63.1.tgz",
++++++++      "integrity": "sha512-YDUNvVM85TI3g/1OpnqKP1h4NeW/j64DfWMf+G3M809xNk1bJSnpFp4sh83NpmVE5DXnkh8ULor4LTVZKoYLHw==",
++++++++      "cpu": [
++++++++        "arm"
++++++++      ],
++++++++      "dev": true,
++++++++      "libc": [
++++++++        "glibc"
++++++++      ],
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "linux"
++++++++      ]
++++++++    },
++++++++    "node_modules/@rollup/rollup-linux-arm-musleabihf": {
++++++++      "version": "4.63.1",
++++++++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-musleabihf/-/rollup-linux-arm-musleabihf-4.63.1.tgz",
++++++++      "integrity": "sha512-7Mcn71p9ZuQFAj+h+dhQXy/yeLePRS2yKRnmW1DijA9thKO5qap0GNOIQK4yQ6iP3SU0Mrb/yWo8h8vgRba8lw==",
++++++++      "cpu": [
++++++++        "arm"
++++++++      ],
++++++++      "dev": true,
++++++++      "libc": [
++++++++        "musl"
++++++++      ],
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "linux"
++++++++      ]
++++++++    },
++++++++    "node_modules/@rollup/rollup-linux-arm64-gnu": {
++++++++      "version": "4.63.1",
++++++++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-gnu/-/rollup-linux-arm64-gnu-4.63.1.tgz",
++++++++      "integrity": "sha512-4YiLQTX6U4CSl0L9cluep9A9W6UmTfqBDc2/CH6wlu54pl4E7Jn3cOD8oxzvBDEGk/JMKgJ47C8g+radF7mwvg==",
++++++++      "cpu": [
++++++++        "arm64"
++++++++      ],
++++++++      "dev": true,
++++++++      "libc": [
++++++++        "glibc"
++++++++      ],
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "linux"
++++++++      ]
++++++++    },
++++++++    "node_modules/@rollup/rollup-linux-arm64-musl": {
++++++++      "version": "4.63.1",
++++++++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-musl/-/rollup-linux-arm64-musl-4.63.1.tgz",
++++++++      "integrity": "sha512-2ra8F7w8OquwZN9z2/fKFnli69wa8PLwaVzRMIPGb13ByMJwC28Fbp8YcVGoUhlYMTt7j5j9bNgpysrN2UM+vw==",
++++++++      "cpu": [
++++++++        "arm64"
++++++++      ],
++++++++      "dev": true,
++++++++      "libc": [
++++++++        "musl"
++++++++      ],
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "linux"
++++++++      ]
++++++++    },
++++++++    "node_modules/@rollup/rollup-linux-loong64-gnu": {
++++++++      "version": "4.63.1",
++++++++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-gnu/-/rollup-linux-loong64-gnu-4.63.1.tgz",
++++++++      "integrity": "sha512-Sy20ncyhjmBP0Ml+UvQbimjlk6VFgjW5uNP+qqwHB00mTE8Bl2C1TuHTlRwK2YoXeZbee5lP2XevBWVkAQAtSQ==",
++++++++      "cpu": [
++++++++        "loong64"
++++++++      ],
++++++++      "dev": true,
++++++++      "libc": [
++++++++        "glibc"
++++++++      ],
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "linux"
++++++++      ]
++++++++    },
++++++++    "node_modules/@rollup/rollup-linux-loong64-musl": {
++++++++      "version": "4.63.1",
++++++++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-musl/-/rollup-linux-loong64-musl-4.63.1.tgz",
++++++++      "integrity": "sha512-noITLp8oNjYliPnGWmLyelIHwULGqbHloQHGw1rtxbWhTuWooRpnZarZQJ1y9EUC4szuCusCc+HEpUtxpIwYvA==",
++++++++      "cpu": [
++++++++        "loong64"
++++++++      ],
++++++++      "dev": true,
++++++++      "libc": [
++++++++        "musl"
++++++++      ],
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "linux"
++++++++      ]
++++++++    },
++++++++    "node_modules/@rollup/rollup-linux-ppc64-gnu": {
++++++++      "version": "4.63.1",
++++++++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-gnu/-/rollup-linux-ppc64-gnu-4.63.1.tgz",
++++++++      "integrity": "sha512-hlxxXd+F1mWiAcaFR7Sv9ZQT6m6UfI8+Vy/kFJzztq2pDMU/0wZ9sish0iszNZvsQDo8Gc0i5yuFEOz5dDf6fA==",
++++++++      "cpu": [
++++++++        "ppc64"
++++++++      ],
++++++++      "dev": true,
++++++++      "libc": [
++++++++        "glibc"
++++++++      ],
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "linux"
++++++++      ]
++++++++    },
++++++++    "node_modules/@rollup/rollup-linux-ppc64-musl": {
++++++++      "version": "4.63.1",
++++++++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-musl/-/rollup-linux-ppc64-musl-4.63.1.tgz",
++++++++      "integrity": "sha512-EF7OpqQTQ/BvGqLzUi4rEHuagCV9MugAUXSHemwPW5vxZ75RR+jxO/2j95Ph2dalMpFHSVECjRoioHZgA9zOYA==",
++++++++      "cpu": [
++++++++        "ppc64"
++++++++      ],
++++++++      "dev": true,
++++++++      "libc": [
++++++++        "musl"
++++++++      ],
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "linux"
++++++++      ]
++++++++    },
++++++++    "node_modules/@rollup/rollup-linux-riscv64-gnu": {
++++++++      "version": "4.63.1",
++++++++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-gnu/-/rollup-linux-riscv64-gnu-4.63.1.tgz",
++++++++      "integrity": "sha512-wQO3JesW9PRkwlabQ27y7sPfVOOTLRG73I4F2UYHG5PXun3J9U3y+b7ezVKSYbsvSKGQ1k1cq8Qlun4C9kLt3w==",
++++++++      "cpu": [
++++++++        "riscv64"
++++++++      ],
++++++++      "dev": true,
++++++++      "libc": [
++++++++        "glibc"
++++++++      ],
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "linux"
++++++++      ]
++++++++    },
++++++++    "node_modules/@rollup/rollup-linux-riscv64-musl": {
++++++++      "version": "4.63.1",
++++++++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-musl/-/rollup-linux-riscv64-musl-4.63.1.tgz",
++++++++      "integrity": "sha512-ouAGwhO6wHRXdnOVCOsB0tRFkA7nhNB2Nwax6oECXN0YiN8EYUTBAOudADOB1PI+yDL61TeNx/u7MVCzksNbkQ==",
++++++++      "cpu": [
++++++++        "riscv64"
++++++++      ],
++++++++      "dev": true,
++++++++      "libc": [
++++++++        "musl"
++++++++      ],
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "linux"
++++++++      ]
++++++++    },
++++++++    "node_modules/@rollup/rollup-linux-s390x-gnu": {
++++++++      "version": "4.63.1",
++++++++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-s390x-gnu/-/rollup-linux-s390x-gnu-4.63.1.tgz",
++++++++      "integrity": "sha512-q2R38Sn+1J8RxhfJ+T54wSWmyKXWec+9jgDfqO2AtArEqHO5R2aeayp5H5OYLr5UYDVGsVaZPEFUooMhYCdz5A==",
++++++++      "cpu": [
++++++++        "s390x"
++++++++      ],
++++++++      "dev": true,
++++++++      "libc": [
++++++++        "glibc"
++++++++      ],
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "linux"
++++++++      ]
++++++++    },
++++++++    "node_modules/@rollup/rollup-linux-x64-gnu": {
++++++++      "version": "4.63.1",
++++++++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-gnu/-/rollup-linux-x64-gnu-4.63.1.tgz",
++++++++      "integrity": "sha512-gfI5T24WLLuFfSKw7Go/zDXjAAV0fny0swTaDv+WjK7vqcw4cRhFfdsyKL1n+ukI+ooBxn3bVQnyrn06WpI50w==",
++++++++      "cpu": [
++++++++        "x64"
++++++++      ],
++++++++      "dev": true,
++++++++      "libc": [
++++++++        "glibc"
++++++++      ],
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "linux"
++++++++      ]
++++++++    },
++++++++    "node_modules/@rollup/rollup-linux-x64-musl": {
++++++++      "version": "4.63.1",
++++++++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-musl/-/rollup-linux-x64-musl-4.63.1.tgz",
++++++++      "integrity": "sha512-4h6XqthmB4Hspji84wvgk+ElodTsGj+dbZqHJHHtKxj4mYq0ANSEEPX9ys3moJueqsRjwpaJYH7874Itwnj2ow==",
++++++++      "cpu": [
++++++++        "x64"
++++++++      ],
++++++++      "dev": true,
++++++++      "libc": [
++++++++        "musl"
++++++++      ],
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "linux"
++++++++      ]
++++++++    },
++++++++    "node_modules/@rollup/rollup-openbsd-x64": {
++++++++      "version": "4.63.1",
++++++++      "resolved": "https://registry.npmjs.org/@rollup/rollup-openbsd-x64/-/rollup-openbsd-x64-4.63.1.tgz",
++++++++      "integrity": "sha512-dlfCOa87o1VAYegLQ9EKilx2JCeRofiyPGhTCmqnuXZ6bMPiycO1rq1+sKoulAp7pGLIsTIw+1x5R+zgh5LhhA==",
++++++++      "cpu": [
++++++++        "x64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "openbsd"
++++++++      ]
++++++++    },
++++++++    "node_modules/@rollup/rollup-openharmony-arm64": {
++++++++      "version": "4.63.1",
++++++++      "resolved": "https://registry.npmjs.org/@rollup/rollup-openharmony-arm64/-/rollup-openharmony-arm64-4.63.1.tgz",
++++++++      "integrity": "sha512-cjkLbOlfcm3QGhMM1J5zaZjsw1GggbN6rw9UTSSRrPrR1KkcXnN7Uq9rPw34xImQ9VOY9GN+6u2Zj80B9ptkcw==",
++++++++      "cpu": [
++++++++        "arm64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "openharmony"
++++++++      ]
++++++++    },
++++++++    "node_modules/@rollup/rollup-win32-arm64-msvc": {
++++++++      "version": "4.63.1",
++++++++      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-arm64-msvc/-/rollup-win32-arm64-msvc-4.63.1.tgz",
++++++++      "integrity": "sha512-Li1KdUnWGE4N3e1F/B4RTB1ms+nG4WBgjByO46pkeBVX/2UBsY53xf5vK9WygVmnH3RwncIST7lkSdLSY6P9lg==",
++++++++      "cpu": [
++++++++        "arm64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "win32"
++++++++      ]
++++++++    },
++++++++    "node_modules/@rollup/rollup-win32-ia32-msvc": {
++++++++      "version": "4.63.1",
++++++++      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-ia32-msvc/-/rollup-win32-ia32-msvc-4.63.1.tgz",
++++++++      "integrity": "sha512-t4ZYOSoLTgwhuFMrmTMLx/+i1DQVK7HYqMc6kY46EApwi8X0nIVphzdNoThU3xt6n+N5urG1/gxBdCaKDLavfg==",
++++++++      "cpu": [
++++++++        "ia32"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "win32"
++++++++      ]
++++++++    },
++++++++    "node_modules/@rollup/rollup-win32-x64-gnu": {
++++++++      "version": "4.63.1",
++++++++      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-gnu/-/rollup-win32-x64-gnu-4.63.1.tgz",
++++++++      "integrity": "sha512-RgroPfMmKlD1RzSDxvwgcPiy2HNQKoYV7OmwIXDsk73uKW5t6B/V8KIy27SMv/FNXFo/oSBtWc9J0X7t91ezZg==",
++++++++      "cpu": [
++++++++        "x64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "win32"
++++++++      ]
++++++++    },
++++++++    "node_modules/@rollup/rollup-win32-x64-msvc": {
++++++++      "version": "4.63.1",
++++++++      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-msvc/-/rollup-win32-x64-msvc-4.63.1.tgz",
++++++++      "integrity": "sha512-at8QVep6S3h5Y6gSbdGU06bRY5WJkf6WUduM9YtvYMbYhB1MOFfUgc6kehitQXzOtMSaT70q7f9ydPhpqu821w==",
++++++++      "cpu": [
++++++++        "x64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "win32"
++++++++      ]
++++++++    },
++++++++    "node_modules/@socket.io/component-emitter": {
++++++++      "version": "3.1.2",
++++++++      "resolved": "https://registry.npmjs.org/@socket.io/component-emitter/-/component-emitter-3.1.2.tgz",
++++++++      "integrity": "sha512-9BCxFwvbGg/RsZK9tjXd8s4UcwR0MWeFQ1XEKIQVVvAGJyINdrqKMcTRyLoK8Rse1GjzLV9cwjWV1olXRWEXVA==",
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/@supabase/auth-js": {
++++++++      "version": "2.112.4",
++++++++      "resolved": "https://registry.npmjs.org/@supabase/auth-js/-/auth-js-2.112.4.tgz",
++++++++      "integrity": "sha512-z8DesgwLzKM5PiT0yNmJU8VJyh1zAhYi+20Z7drdJQLXg/wWW4yGt/un+He5ERYUo94Vz66t5aeyr1DIDemI5A==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "tslib": "2.8.1"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=22.0.0"
++++++++      }
++++++++    },
++++++++    "node_modules/@supabase/functions-js": {
++++++++      "version": "2.112.4",
++++++++      "resolved": "https://registry.npmjs.org/@supabase/functions-js/-/functions-js-2.112.4.tgz",
++++++++      "integrity": "sha512-DQ0aVH8wSQAccVqNoEkec62qCu2QRNyoGN53RqsVZ1k6F1zq4/v8scrlR6LNT2RJmT97apiTmORijPVhErCS2g==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "tslib": "2.8.1"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=22.0.0"
++++++++      }
++++++++    },
++++++++    "node_modules/@supabase/phoenix": {
++++++++      "version": "0.4.5",
++++++++      "resolved": "https://registry.npmjs.org/@supabase/phoenix/-/phoenix-0.4.5.tgz",
++++++++      "integrity": "sha512-aAn9H9ovVyeApKy11OWOrrOGq8DV68yWeH4ud2lN9fzn4aO8Zb5GLL9m1pUg9nLqIcT+ZDfAcsZe0E/nqdv2lw==",
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/@supabase/postgrest-js": {
++++++++      "version": "2.112.4",
++++++++      "resolved": "https://registry.npmjs.org/@supabase/postgrest-js/-/postgrest-js-2.112.4.tgz",
++++++++      "integrity": "sha512-uaubtPSeg2TR4wrtfQoQWgkTAe+a0qWX2KhmwvTfNl5mGN9+U7owiJt6abk3o/V6O899PSRD1yzxs5RlF4xTug==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "tslib": "2.8.1"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=22.0.0"
++++++++      }
++++++++    },
++++++++    "node_modules/@supabase/realtime-js": {
++++++++      "version": "2.112.4",
++++++++      "resolved": "https://registry.npmjs.org/@supabase/realtime-js/-/realtime-js-2.112.4.tgz",
++++++++      "integrity": "sha512-vZ+j079SKrM0Xiq7MJCvQKLDpaH2kfKfLY68xuQE1sqsCsMmx1CyrDBJHsxZ3cX01VOs5SI9igmoZAF3BmdZxw==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@supabase/phoenix": "0.4.5",
++++++++        "tslib": "2.8.1"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=22.0.0"
++++++++      }
++++++++    },
++++++++    "node_modules/@supabase/storage-js": {
++++++++      "version": "2.112.4",
++++++++      "resolved": "https://registry.npmjs.org/@supabase/storage-js/-/storage-js-2.112.4.tgz",
++++++++      "integrity": "sha512-lQ0JemuTlMIXVKgSci1qez8yPnM5hyDngeAfEBjZS2Om4D+Cus0EE5BE6glFobrxdyii1OF4UzWfF0zcQgDq5A==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "iceberg-js": "^0.8.1",
++++++++        "tslib": "2.8.1"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=22.0.0"
++++++++      }
++++++++    },
++++++++    "node_modules/@supabase/supabase-js": {
++++++++      "version": "2.112.4",
++++++++      "resolved": "https://registry.npmjs.org/@supabase/supabase-js/-/supabase-js-2.112.4.tgz",
++++++++      "integrity": "sha512-UiCX1udlFY1fQQrO7Z3GU7obQsju0w5Vk9mOOwalfo/+Gy+tahWVenSSuu5E/GTy/q//HxvGv2IrCdW66/61kw==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@supabase/auth-js": "2.112.4",
++++++++        "@supabase/functions-js": "2.112.4",
++++++++        "@supabase/postgrest-js": "2.112.4",
++++++++        "@supabase/realtime-js": "2.112.4",
++++++++        "@supabase/storage-js": "2.112.4"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=22.0.0"
++++++++      },
++++++++      "peerDependencies": {
++++++++        "@opentelemetry/api": ">=1.0.0"
++++++++      },
++++++++      "peerDependenciesMeta": {
++++++++        "@opentelemetry/api": {
++++++++          "optional": true
++++++++        }
++++++++      }
++++++++    },
++++++++    "node_modules/@types/babel__core": {
++++++++      "version": "7.20.5",
++++++++      "resolved": "https://registry.npmjs.org/@types/babel__core/-/babel__core-7.20.5.tgz",
++++++++      "integrity": "sha512-qoQprZvz5wQFJwMDqeseRXWv3rqMvhgpbXFfVyWhbx9X47POIA6i/+dXefEmZKoAgOaTdaIgNSMqMIU61yRyzA==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@babel/parser": "^7.20.7",
++++++++        "@babel/types": "^7.20.7",
++++++++        "@types/babel__generator": "*",
++++++++        "@types/babel__template": "*",
++++++++        "@types/babel__traverse": "*"
++++++++      }
++++++++    },
++++++++    "node_modules/@types/babel__generator": {
++++++++      "version": "7.27.0",
++++++++      "resolved": "https://registry.npmjs.org/@types/babel__generator/-/babel__generator-7.27.0.tgz",
++++++++      "integrity": "sha512-ufFd2Xi92OAVPYsy+P4n7/U7e68fex0+Ee8gSG9KX7eo084CWiQ4sdxktvdl0bOPupXtVJPY19zk6EwWqUQ8lg==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@babel/types": "^7.0.0"
++++++++      }
++++++++    },
++++++++    "node_modules/@types/babel__template": {
++++++++      "version": "7.4.4",
++++++++      "resolved": "https://registry.npmjs.org/@types/babel__template/-/babel__template-7.4.4.tgz",
++++++++      "integrity": "sha512-h/NUaSyG5EyxBIp8YRxo4RMe2/qQgvyowRwVMzhYhBCONbW8PUsg4lkFMrhgZhUe5z3L3MiLDuvyJ/CaPa2A8A==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@babel/parser": "^7.1.0",
++++++++        "@babel/types": "^7.0.0"
++++++++      }
++++++++    },
++++++++    "node_modules/@types/babel__traverse": {
++++++++      "version": "7.28.0",
++++++++      "resolved": "https://registry.npmjs.org/@types/babel__traverse/-/babel__traverse-7.28.0.tgz",
++++++++      "integrity": "sha512-8PvcXf70gTDZBgt9ptxJ8elBeBjcLOAcOtoO/mPJjtji1+CdGbHgm77om1GrsPxsiE+uXIpNSK64UYaIwQXd4Q==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@babel/types": "^7.28.2"
++++++++      }
++++++++    },
++++++++    "node_modules/@types/body-parser": {
++++++++      "version": "1.19.6",
++++++++      "resolved": "https://registry.npmjs.org/@types/body-parser/-/body-parser-1.19.6.tgz",
++++++++      "integrity": "sha512-HLFeCYgz89uk22N5Qg3dvGvsv46B8GLvKKo1zKG4NybA8U2DiEO3w9lqGg29t/tfLRJpJ6iQxnVw4OnB7MoM9g==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@types/connect": "*",
++++++++        "@types/node": "*"
++++++++      }
++++++++    },
++++++++    "node_modules/@types/chai": {
++++++++      "version": "5.2.3",
++++++++      "resolved": "https://registry.npmjs.org/@types/chai/-/chai-5.2.3.tgz",
++++++++      "integrity": "sha512-Mw558oeA9fFbv65/y4mHtXDs9bPnFMZAL/jxdPFUpOHHIXX91mcgEHbS5Lahr+pwZFR8A7GQleRWeI6cGFC2UA==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@types/deep-eql": "*",
++++++++        "assertion-error": "^2.0.1"
++++++++      }
++++++++    },
++++++++    "node_modules/@types/connect": {
++++++++      "version": "3.4.38",
++++++++      "resolved": "https://registry.npmjs.org/@types/connect/-/connect-3.4.38.tgz",
++++++++      "integrity": "sha512-K6uROf1LD88uDQqJCktA4yzL1YYAK6NgfsI0v/mTgyPKWsX1CnJ0XPSDhViejru1GcRkLWb8RlzFYJRqGUbaug==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@types/node": "*"
++++++++      }
++++++++    },
++++++++    "node_modules/@types/cors": {
++++++++      "version": "2.8.19",
++++++++      "resolved": "https://registry.npmjs.org/@types/cors/-/cors-2.8.19.tgz",
++++++++      "integrity": "sha512-mFNylyeyqN93lfe/9CSxOGREz8cpzAhH+E93xJ4xWQf62V8sQ/24reV2nyzUWM6H6Xji+GGHpkbLe7pVoUEskg==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@types/node": "*"
++++++++      }
++++++++    },
++++++++    "node_modules/@types/deep-eql": {
++++++++      "version": "4.0.2",
++++++++      "resolved": "https://registry.npmjs.org/@types/deep-eql/-/deep-eql-4.0.2.tgz",
++++++++      "integrity": "sha512-c9h9dVVMigMPc4bwTvC5dxqtqJZwQPePsWjPlpSOnojbor6pGqdk541lfA7AqFQr5pB1BRdq0juY9db81BwyFw==",
++++++++      "dev": true,
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/@types/estree": {
++++++++      "version": "1.0.9",
++++++++      "resolved": "https://registry.npmjs.org/@types/estree/-/estree-1.0.9.tgz",
++++++++      "integrity": "sha512-GhdPgy1el4/ImP05X05Uw4cw2/M93BCUmnEvWZNStlCzEKME4Fkk+YpoA5OiHNQmoS7Cafb8Xa3Pya8m1Qrzeg==",
++++++++      "dev": true,
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/@types/express": {
++++++++      "version": "5.0.6",
++++++++      "resolved": "https://registry.npmjs.org/@types/express/-/express-5.0.6.tgz",
++++++++      "integrity": "sha512-sKYVuV7Sv9fbPIt/442koC7+IIwK5olP1KWeD88e/idgoJqDm3JV/YUiPwkoKK92ylff2MGxSz1CSjsXelx0YA==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@types/body-parser": "*",
++++++++        "@types/express-serve-static-core": "^5.0.0",
++++++++        "@types/serve-static": "^2"
++++++++      }
++++++++    },
++++++++    "node_modules/@types/express-serve-static-core": {
++++++++      "version": "5.1.3",
++++++++      "resolved": "https://registry.npmjs.org/@types/express-serve-static-core/-/express-serve-static-core-5.1.3.tgz",
++++++++      "integrity": "sha512-dPfW8NFiOF4wOHc7+N/QSxlY9cfSsenewGbAz8C8U/MULPd/YZ27LvJUIlzaXie7e6Ove9YunJGgC9tbHD2cKw==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@types/node": "*",
++++++++        "@types/qs": "*",
++++++++        "@types/range-parser": "*",
++++++++        "@types/send": "*"
++++++++      }
++++++++    },
++++++++    "node_modules/@types/http-errors": {
++++++++      "version": "2.0.5",
++++++++      "resolved": "https://registry.npmjs.org/@types/http-errors/-/http-errors-2.0.5.tgz",
++++++++      "integrity": "sha512-r8Tayk8HJnX0FztbZN7oVqGccWgw98T/0neJphO91KkmOzug1KkofZURD4UaD5uH8AqcFLfdPErnBod0u71/qg==",
++++++++      "dev": true,
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/@types/node": {
++++++++      "version": "22.20.1",
++++++++      "resolved": "https://registry.npmjs.org/@types/node/-/node-22.20.1.tgz",
++++++++      "integrity": "sha512-EANqOCF9QFyra+4pfxUcX9STKJpCLjMbObVzljIJomAWSnuSIEAvyzEU53GaajbXJEgdh0iEcPL+DGvpUd4k1Q==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "undici-types": "~6.21.0"
++++++++      }
++++++++    },
++++++++    "node_modules/@types/prop-types": {
++++++++      "version": "15.7.15",
++++++++      "resolved": "https://registry.npmjs.org/@types/prop-types/-/prop-types-15.7.15.tgz",
++++++++      "integrity": "sha512-F6bEyamV9jKGAFBEmlQnesRPGOQqS2+Uwi0Em15xenOxHaf2hv6L8YCVn3rPdPJOiJfPiCnLIRyvwVaqMY3MIw==",
++++++++      "dev": true,
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/@types/qs": {
++++++++      "version": "6.15.1",
++++++++      "resolved": "https://registry.npmjs.org/@types/qs/-/qs-6.15.1.tgz",
++++++++      "integrity": "sha512-GZHUBZR9hckSUhrxmp1nG6NwdpM9fCunJwyThLW1X3AyHgd9IlHb6VANpQQqDr2o/qQp6McZ3y/IA2rVzKzSbw==",
++++++++      "dev": true,
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/@types/range-parser": {
++++++++      "version": "1.2.7",
++++++++      "resolved": "https://registry.npmjs.org/@types/range-parser/-/range-parser-1.2.7.tgz",
++++++++      "integrity": "sha512-hKormJbkJqzQGhziax5PItDUTMAM9uE2XXQmM37dyd4hVM+5aVl7oVxMVUiVQn2oCQFN/LKCZdvSM0pFRqbSmQ==",
++++++++      "dev": true,
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/@types/react": {
++++++++      "version": "18.3.31",
++++++++      "resolved": "https://registry.npmjs.org/@types/react/-/react-18.3.31.tgz",
++++++++      "integrity": "sha512-vfEqpXTvwT91yhmwdfouStN2hSKwTvyRs8qpLfADyrq/kxDw0hZM7Wk9Ug1FELj8hIby+S/+kQCSRFF32nv2Qw==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@types/prop-types": "*",
++++++++        "csstype": "^3.2.2"
++++++++      }
++++++++    },
++++++++    "node_modules/@types/react-dom": {
++++++++      "version": "18.3.7",
++++++++      "resolved": "https://registry.npmjs.org/@types/react-dom/-/react-dom-18.3.7.tgz",
++++++++      "integrity": "sha512-MEe3UeoENYVFXzoXEWsvcpg6ZvlrFNlOQ7EOsvhI3CfAXwzPfO8Qwuxd40nepsYKqyyVQnTdEfv68q91yLcKrQ==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "peerDependencies": {
++++++++        "@types/react": "^18.0.0"
++++++++      }
++++++++    },
++++++++    "node_modules/@types/send": {
++++++++      "version": "1.2.1",
++++++++      "resolved": "https://registry.npmjs.org/@types/send/-/send-1.2.1.tgz",
++++++++      "integrity": "sha512-arsCikDvlU99zl1g69TcAB3mzZPpxgw0UQnaHeC1Nwb015xp8bknZv5rIfri9xTOcMuaVgvabfIRA7PSZVuZIQ==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@types/node": "*"
++++++++      }
++++++++    },
++++++++    "node_modules/@types/serve-static": {
++++++++      "version": "2.2.0",
++++++++      "resolved": "https://registry.npmjs.org/@types/serve-static/-/serve-static-2.2.0.tgz",
++++++++      "integrity": "sha512-8mam4H1NHLtu7nmtalF7eyBH14QyOASmcxHhSfEoRyr0nP/YdoesEtU+uSRvMe96TW/HPTtkoKqQLl53N7UXMQ==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@types/http-errors": "*",
++++++++        "@types/node": "*"
++++++++      }
++++++++    },
++++++++    "node_modules/@types/ws": {
++++++++      "version": "8.18.1",
++++++++      "resolved": "https://registry.npmjs.org/@types/ws/-/ws-8.18.1.tgz",
++++++++      "integrity": "sha512-ThVF6DCVhA8kUGy+aazFQ4kXQ7E1Ty7A3ypFOe0IcJV8O/M511G99AW24irKrW56Wt44yG9+ij8FaqoBGkuBXg==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@types/node": "*"
++++++++      }
++++++++    },
++++++++    "node_modules/@vitejs/plugin-react": {
++++++++      "version": "4.7.0",
++++++++      "resolved": "https://registry.npmjs.org/@vitejs/plugin-react/-/plugin-react-4.7.0.tgz",
++++++++      "integrity": "sha512-gUu9hwfWvvEDBBmgtAowQCojwZmJ5mcLn3aufeCsitijs3+f2NsrPtlAWIR6OPiqljl96GVCUbLe0HyqIpVaoA==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@babel/core": "^7.28.0",
++++++++        "@babel/plugin-transform-react-jsx-self": "^7.27.1",
++++++++        "@babel/plugin-transform-react-jsx-source": "^7.27.1",
++++++++        "@rolldown/pluginutils": "1.0.0-beta.27",
++++++++        "@types/babel__core": "^7.20.5",
++++++++        "react-refresh": "^0.17.0"
++++++++      },
++++++++      "engines": {
++++++++        "node": "^14.18.0 || >=16.0.0"
++++++++      },
++++++++      "peerDependencies": {
++++++++        "vite": "^4.2.0 || ^5.0.0 || ^6.0.0 || ^7.0.0"
++++++++      }
++++++++    },
++++++++    "node_modules/@vitest/expect": {
++++++++      "version": "3.2.7",
++++++++      "resolved": "https://registry.npmjs.org/@vitest/expect/-/expect-3.2.7.tgz",
++++++++      "integrity": "sha512-E8eBXaKibuvH2pSZErOjdVb5vF4PbKYcrnluBTYxEk1l/VhhwZg1kZQsdtjq+CsF5CFydf2Rdkz7jDHKSisi3w==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@types/chai": "^5.2.2",
++++++++        "@vitest/spy": "3.2.7",
++++++++        "@vitest/utils": "3.2.7",
++++++++        "chai": "^5.2.0",
++++++++        "tinyrainbow": "^2.0.0"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://opencollective.com/vitest"
++++++++      }
++++++++    },
++++++++    "node_modules/@vitest/mocker": {
++++++++      "version": "3.2.7",
++++++++      "resolved": "https://registry.npmjs.org/@vitest/mocker/-/mocker-3.2.7.tgz",
++++++++      "integrity": "sha512-Trr0hYO9CM3Wj6ksWHRhK9IZpIY6wTMO5u/MqXurMxT57sWBaOPEtP3Oq60ihZuh5JsiagKfz95OcxdEP6dBrA==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@vitest/spy": "3.2.7",
++++++++        "estree-walker": "^3.0.3",
++++++++        "magic-string": "^0.30.17"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://opencollective.com/vitest"
++++++++      },
++++++++      "peerDependencies": {
++++++++        "msw": "^2.4.9",
++++++++        "vite": "^5.0.0 || ^6.0.0 || ^7.0.0-0"
++++++++      },
++++++++      "peerDependenciesMeta": {
++++++++        "msw": {
++++++++          "optional": true
++++++++        },
++++++++        "vite": {
++++++++          "optional": true
++++++++        }
++++++++      }
++++++++    },
++++++++    "node_modules/@vitest/pretty-format": {
++++++++      "version": "3.2.7",
++++++++      "resolved": "https://registry.npmjs.org/@vitest/pretty-format/-/pretty-format-3.2.7.tgz",
++++++++      "integrity": "sha512-KUHlwqVu0sRlhCdyPdQ/wBoTfRahjUky1MubOmYw9fWfIZy1gNoHpuaaQBPAaMaVYdQYHJLurzj8ECCj5OwTqA==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "tinyrainbow": "^2.0.0"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://opencollective.com/vitest"
++++++++      }
++++++++    },
++++++++    "node_modules/@vitest/runner": {
++++++++      "version": "3.2.7",
++++++++      "resolved": "https://registry.npmjs.org/@vitest/runner/-/runner-3.2.7.tgz",
++++++++      "integrity": "sha512-sB9y4ovltoQP+WaUPwmSxO9WIg9Ig694Di5PalVPsYHklAdE027mehpWF2SQSVq+k6sFgaivbTjTJwZLSHbedA==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@vitest/utils": "3.2.7",
++++++++        "pathe": "^2.0.3",
++++++++        "strip-literal": "^3.0.0"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://opencollective.com/vitest"
++++++++      }
++++++++    },
++++++++    "node_modules/@vitest/snapshot": {
++++++++      "version": "3.2.7",
++++++++      "resolved": "https://registry.npmjs.org/@vitest/snapshot/-/snapshot-3.2.7.tgz",
++++++++      "integrity": "sha512-7C+MwShwtBSI5Buwoyg3s/iY1eHL9PKAf+O1wVh/TdnjXUtkoL/9YQtre90i4MtNXM6edP1wJ2zOBpfCyhIS7g==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@vitest/pretty-format": "3.2.7",
++++++++        "magic-string": "^0.30.17",
++++++++        "pathe": "^2.0.3"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://opencollective.com/vitest"
++++++++      }
++++++++    },
++++++++    "node_modules/@vitest/spy": {
++++++++      "version": "3.2.7",
++++++++      "resolved": "https://registry.npmjs.org/@vitest/spy/-/spy-3.2.7.tgz",
++++++++      "integrity": "sha512-Q2eQGI6d2L/hBtZ0qNuKcAGid68XK6cv1xsoaIma6PaJhHPoqcEJhYpXZ/5myCMqkNgtP6UKuBhbc0nHKnrkuQ==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "tinyspy": "^4.0.3"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://opencollective.com/vitest"
++++++++      }
++++++++    },
++++++++    "node_modules/@vitest/utils": {
++++++++      "version": "3.2.7",
++++++++      "resolved": "https://registry.npmjs.org/@vitest/utils/-/utils-3.2.7.tgz",
++++++++      "integrity": "sha512-x6BDOd7dyo3PFLY3I9/HJ25X/6OurhGXk2/B9gOZNPF7XDVjeBK4k01lQE5uvDpbuheErh91qYuE1E2OEjK3Rw==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@vitest/pretty-format": "3.2.7",
++++++++        "loupe": "^3.1.4",
++++++++        "tinyrainbow": "^2.0.0"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://opencollective.com/vitest"
++++++++      }
++++++++    },
++++++++    "node_modules/accepts": {
++++++++      "version": "1.3.8",
++++++++      "resolved": "https://registry.npmjs.org/accepts/-/accepts-1.3.8.tgz",
++++++++      "integrity": "sha512-PYAthTa2m2VKxuvSD3DPC/Gy+U+sOA1LAuT8mkmRuvw+NACSaeXEQ+NHcVF7rONl6qcaxV3Uuemwawk+7+SJLw==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "mime-types": "~2.1.34",
++++++++        "negotiator": "0.6.3"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 0.6"
++++++++      }
++++++++    },
++++++++    "node_modules/ansi-regex": {
++++++++      "version": "5.0.1",
++++++++      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-5.0.1.tgz",
++++++++      "integrity": "sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=8"
++++++++      }
++++++++    },
++++++++    "node_modules/ansi-styles": {
++++++++      "version": "4.3.0",
++++++++      "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-4.3.0.tgz",
++++++++      "integrity": "sha512-zbB9rCJAT1rbjiVDb2hqKFHNYLxgtk8NURxZ3IZwD3F6NtxbXZQCnnSi1Lkx+IDohdPlFp222wVALIheZJQSEg==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "color-convert": "^2.0.1"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=8"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://github.com/chalk/ansi-styles?sponsor=1"
++++++++      }
++++++++    },
++++++++    "node_modules/any-promise": {
++++++++      "version": "1.3.0",
++++++++      "resolved": "https://registry.npmjs.org/any-promise/-/any-promise-1.3.0.tgz",
++++++++      "integrity": "sha512-7UvmKalWRt1wgjL1RrGxoSJW/0QZFIegpeGvZG9kjp8vrRu55XTHbwnqq2GpXm9uLbcuhxm3IqX9OB4MZR1b2A==",
++++++++      "dev": true,
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/anymatch": {
++++++++      "version": "3.1.3",
++++++++      "resolved": "https://registry.npmjs.org/anymatch/-/anymatch-3.1.3.tgz",
++++++++      "integrity": "sha512-KMReFUr0B4t+D+OBkjR3KYqvocp2XaSzO55UcB6mgQMd3KbcE+mWTyvVV7D/zsdEbNnV6acZUutkiHQXvTr1Rw==",
++++++++      "dev": true,
++++++++      "license": "ISC",
++++++++      "dependencies": {
++++++++        "normalize-path": "^3.0.0",
++++++++        "picomatch": "^2.0.4"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 8"
++++++++      }
++++++++    },
++++++++    "node_modules/arg": {
++++++++      "version": "5.0.2",
++++++++      "resolved": "https://registry.npmjs.org/arg/-/arg-5.0.2.tgz",
++++++++      "integrity": "sha512-PYjyFOLKQ9y57JvQ6QLo8dAgNqswh8M1RMJYdQduT6xbWSgK36P/Z/v+p888pM69jMMfS8Xd8F6I1kQ/I9HUGg==",
++++++++      "dev": true,
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/array-flatten": {
++++++++      "version": "1.1.1",
++++++++      "resolved": "https://registry.npmjs.org/array-flatten/-/array-flatten-1.1.1.tgz",
++++++++      "integrity": "sha512-PCVAQswWemu6UdxsDFFX/+gVeYqKAod3D3UVm91jHwynguOwAvYPhx8nNlM++NqRcK6CxxpUafjmhIdKiHibqg==",
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/assertion-error": {
++++++++      "version": "2.0.1",
++++++++      "resolved": "https://registry.npmjs.org/assertion-error/-/assertion-error-2.0.1.tgz",
++++++++      "integrity": "sha512-Izi8RQcffqCeNVgFigKli1ssklIbpHnCYc6AknXGYoB6grJqyeby7jv12JUQgmTAnIDnbck1uxksT4dzN3PWBA==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=12"
++++++++      }
++++++++    },
++++++++    "node_modules/autoprefixer": {
++++++++      "version": "10.5.4",
++++++++      "resolved": "https://registry.npmjs.org/autoprefixer/-/autoprefixer-10.5.4.tgz",
++++++++      "integrity": "sha512-MaU0U/za7N3r6brxD4YB/l4NSrFzLPlANv6wEuQVaIPlD3L4W9rFcQPbL/EilY9BHhHvhfcz3gInDLrEtWT4EA==",
++++++++      "dev": true,
++++++++      "funding": [
++++++++        {
++++++++          "type": "opencollective",
++++++++          "url": "https://opencollective.com/postcss/"
++++++++        },
++++++++        {
++++++++          "type": "tidelift",
++++++++          "url": "https://tidelift.com/funding/github/npm/autoprefixer"
++++++++        },
++++++++        {
++++++++          "type": "github",
++++++++          "url": "https://github.com/sponsors/ai"
++++++++        }
++++++++      ],
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "browserslist": "^4.28.6",
++++++++        "caniuse-lite": "^1.0.30001806",
++++++++        "fraction.js": "^5.3.4",
++++++++        "picocolors": "^1.1.1",
++++++++        "postcss-value-parser": "^4.2.0"
++++++++      },
++++++++      "bin": {
++++++++        "autoprefixer": "bin/autoprefixer"
++++++++      },
++++++++      "engines": {
++++++++        "node": "^10 || ^12 || >=14"
++++++++      },
++++++++      "peerDependencies": {
++++++++        "postcss": "^8.1.0"
++++++++      }
++++++++    },
++++++++    "node_modules/base64id": {
++++++++      "version": "2.0.0",
++++++++      "resolved": "https://registry.npmjs.org/base64id/-/base64id-2.0.0.tgz",
++++++++      "integrity": "sha512-lGe34o6EHj9y3Kts9R4ZYs/Gr+6N7MCaMlIFA3F1R2O5/m7K06AxfSeO5530PEERE6/WyEg3lsuyw4GHlPZHog==",
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": "^4.5.0 || >= 5.9"
++++++++      }
++++++++    },
++++++++    "node_modules/baseline-browser-mapping": {
++++++++      "version": "2.11.20",
++++++++      "resolved": "https://registry.npmjs.org/baseline-browser-mapping/-/baseline-browser-mapping-2.11.20.tgz",
++++++++      "integrity": "sha512-H0ulySigv6icDJ1F7SjtdCD6PrhTpdYCmP0CactWy1+ekh0AFd0o1Wn5T8b+hnTmdBx19u9yhL6wvCylXMY7zw==",
++++++++      "dev": true,
++++++++      "license": "Apache-2.0",
++++++++      "bin": {
++++++++        "baseline-browser-mapping": "dist/cli.cjs"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=6.0.0"
++++++++      }
++++++++    },
++++++++    "node_modules/binary-extensions": {
++++++++      "version": "2.3.0",
++++++++      "resolved": "https://registry.npmjs.org/binary-extensions/-/binary-extensions-2.3.0.tgz",
++++++++      "integrity": "sha512-Ceh+7ox5qe7LJuLHoY0feh3pHuUDHAcRUeyL2VYghZwfpkNIy/+8Ocg0a3UuSoYzavmylwuLWQOf3hl0jjMMIw==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=8"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://github.com/sponsors/sindresorhus"
++++++++      }
++++++++    },
++++++++    "node_modules/body-parser": {
++++++++      "version": "1.20.6",
++++++++      "resolved": "https://registry.npmjs.org/body-parser/-/body-parser-1.20.6.tgz",
++++++++      "integrity": "sha512-p5tAzS57i5MV9fZFDj9LeIiTZEufbSe2eDozP+ElheSUq1m74CRq1jI4mYNDdVs9vQztXFLuk/Gd6BWTdwRJ5g==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "bytes": "~3.1.2",
++++++++        "content-type": "~1.0.5",
++++++++        "debug": "2.6.9",
++++++++        "depd": "2.0.0",
++++++++        "destroy": "~1.2.0",
++++++++        "http-errors": "~2.0.1",
++++++++        "iconv-lite": "~0.4.24",
++++++++        "on-finished": "~2.4.1",
++++++++        "qs": "~6.15.1",
++++++++        "raw-body": "~2.5.3",
++++++++        "type-is": "~1.6.18",
++++++++        "unpipe": "~1.0.0"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 0.8",
++++++++        "npm": "1.2.8000 || >= 1.4.16"
++++++++      }
++++++++    },
++++++++    "node_modules/body-parser/node_modules/debug": {
++++++++      "version": "2.6.9",
++++++++      "resolved": "https://registry.npmjs.org/debug/-/debug-2.6.9.tgz",
++++++++      "integrity": "sha512-bC7ElrdJaJnPbAP+1EotYvqZsb3ecl5wi6Bfi6BJTUcNowp6cvspg0jXznRTKDjm/E7AdgFBVeAPVMNcKGsHMA==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "ms": "2.0.0"
++++++++      }
++++++++    },
++++++++    "node_modules/body-parser/node_modules/ms": {
++++++++      "version": "2.0.0",
++++++++      "resolved": "https://registry.npmjs.org/ms/-/ms-2.0.0.tgz",
++++++++      "integrity": "sha512-Tpp60P6IUJDTuOq/5Z8cdskzJujfwqfOTkrwIwj7IRISpnkJnT6SyJ4PCPnGMoFjC9ddhal5KVIYtAt97ix05A==",
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/braces": {
++++++++      "version": "3.0.3",
++++++++      "resolved": "https://registry.npmjs.org/braces/-/braces-3.0.3.tgz",
++++++++      "integrity": "sha512-yQbXgO/OSZVD2IsiLlro+7Hf6Q18EJrKSEsdoMzKePKXct3gvD8oLcOQdIzGupr5Fj+EDe8gO/lxc1BzfMpxvA==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "fill-range": "^7.1.1"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=8"
++++++++      }
++++++++    },
++++++++    "node_modules/browserslist": {
++++++++      "version": "4.28.8",
++++++++      "resolved": "https://registry.npmjs.org/browserslist/-/browserslist-4.28.8.tgz",
++++++++      "integrity": "sha512-V2NpofLblG64mfOtSgDhOJESZEGogzDMBv/q+W6oc4LXWP/q75eOXoOaaOu1EOadB9U4Bwx/e0yzbvwKH8zalA==",
++++++++      "dev": true,
++++++++      "funding": [
++++++++        {
++++++++          "type": "opencollective",
++++++++          "url": "https://opencollective.com/browserslist"
++++++++        },
++++++++        {
++++++++          "type": "tidelift",
++++++++          "url": "https://tidelift.com/funding/github/npm/browserslist"
++++++++        },
++++++++        {
++++++++          "type": "github",
++++++++          "url": "https://github.com/sponsors/ai"
++++++++        }
++++++++      ],
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "baseline-browser-mapping": "^2.11.12",
++++++++        "caniuse-lite": "^1.0.30001809",
++++++++        "electron-to-chromium": "^1.5.402",
++++++++        "node-releases": "^2.0.53",
++++++++        "update-browserslist-db": "^1.3.0"
++++++++      },
++++++++      "bin": {
++++++++        "browserslist": "cli.js"
++++++++      },
++++++++      "engines": {
++++++++        "node": "^6 || ^7 || ^8 || ^9 || ^10 || ^11 || ^12 || >=13.7"
++++++++      }
++++++++    },
++++++++    "node_modules/bytes": {
++++++++      "version": "3.1.2",
++++++++      "resolved": "https://registry.npmjs.org/bytes/-/bytes-3.1.2.tgz",
++++++++      "integrity": "sha512-/Nf7TyzTx6S3yRJObOAV7956r8cr2+Oj8AC5dt8wSP3BQAoeX58NoHyCU8P8zGkNXStjTSi6fzO6F0pBdcYbEg==",
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 0.8"
++++++++      }
++++++++    },
++++++++    "node_modules/cac": {
++++++++      "version": "6.7.14",
++++++++      "resolved": "https://registry.npmjs.org/cac/-/cac-6.7.14.tgz",
++++++++      "integrity": "sha512-b6Ilus+c3RrdDk+JhLKUAQfzzgLEPy6wcXqS7f/xe1EETvsDP6GORG7SFuOs6cID5YkqchW/LXZbX5bc8j7ZcQ==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=8"
++++++++      }
++++++++    },
++++++++    "node_modules/call-bind-apply-helpers": {
++++++++      "version": "1.0.2",
++++++++      "resolved": "https://registry.npmjs.org/call-bind-apply-helpers/-/call-bind-apply-helpers-1.0.2.tgz",
++++++++      "integrity": "sha512-Sp1ablJ0ivDkSzjcaJdxEunN5/XvksFJ2sMBFfq6x0ryhQV/2b/KwFe21cMpmHtPOSij8K99/wSfoEuTObmuMQ==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "es-errors": "^1.3.0",
++++++++        "function-bind": "^1.1.2"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 0.4"
++++++++      }
++++++++    },
++++++++    "node_modules/call-bound": {
++++++++      "version": "1.0.4",
++++++++      "resolved": "https://registry.npmjs.org/call-bound/-/call-bound-1.0.4.tgz",
++++++++      "integrity": "sha512-+ys997U96po4Kx/ABpBCqhA9EuxJaQWDQg7295H4hBphv3IZg0boBKuwYpt4YXp6MZ5AmZQnU/tyMTlRpaSejg==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "call-bind-apply-helpers": "^1.0.2",
++++++++        "get-intrinsic": "^1.3.0"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 0.4"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://github.com/sponsors/ljharb"
++++++++      }
++++++++    },
++++++++    "node_modules/camelcase-css": {
++++++++      "version": "2.0.1",
++++++++      "resolved": "https://registry.npmjs.org/camelcase-css/-/camelcase-css-2.0.1.tgz",
++++++++      "integrity": "sha512-QOSvevhslijgYwRx6Rv7zKdMF8lbRmx+uQGx2+vDc+KI/eBnsy9kit5aj23AgGu3pa4t9AgwbnXWqS+iOY+2aA==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 6"
++++++++      }
++++++++    },
++++++++    "node_modules/caniuse-lite": {
++++++++      "version": "1.0.30001810",
++++++++      "resolved": "https://registry.npmjs.org/caniuse-lite/-/caniuse-lite-1.0.30001810.tgz",
++++++++      "integrity": "sha512-TITQPUkaz+aVk5GL6NhOdwk1aEaNTSDPsGFWrTuhKGtjTF70jL/Oht2W4c6rXUe5fu7Ie19VIahAXHIIiWWNeg==",
++++++++      "dev": true,
++++++++      "funding": [
++++++++        {
++++++++          "type": "opencollective",
++++++++          "url": "https://opencollective.com/browserslist"
++++++++        },
++++++++        {
++++++++          "type": "tidelift",
++++++++          "url": "https://tidelift.com/funding/github/npm/caniuse-lite"
++++++++        },
++++++++        {
++++++++          "type": "github",
++++++++          "url": "https://github.com/sponsors/ai"
++++++++        }
++++++++      ],
++++++++      "license": "CC-BY-4.0"
++++++++    },
++++++++    "node_modules/chai": {
++++++++      "version": "5.3.3",
++++++++      "resolved": "https://registry.npmjs.org/chai/-/chai-5.3.3.tgz",
++++++++      "integrity": "sha512-4zNhdJD/iOjSH0A05ea+Ke6MU5mmpQcbQsSOkgdaUMJ9zTlDTD/GYlwohmIE2u0gaxHYiVHEn1Fw9mZ/ktJWgw==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "assertion-error": "^2.0.1",
++++++++        "check-error": "^2.1.1",
++++++++        "deep-eql": "^5.0.1",
++++++++        "loupe": "^3.1.0",
++++++++        "pathval": "^2.0.0"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/chalk": {
++++++++      "version": "4.1.2",
++++++++      "resolved": "https://registry.npmjs.org/chalk/-/chalk-4.1.2.tgz",
++++++++      "integrity": "sha512-oKnbhFyRIXpUuez8iBMmyEa4nbj4IOQyuhc/wy9kY7/WVPcwIO9VA668Pu8RkO7+0G76SLROeyw9CpQ061i4mA==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "ansi-styles": "^4.1.0",
++++++++        "supports-color": "^7.1.0"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=10"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://github.com/chalk/chalk?sponsor=1"
++++++++      }
++++++++    },
++++++++    "node_modules/chalk/node_modules/supports-color": {
++++++++      "version": "7.2.0",
++++++++      "resolved": "https://registry.npmjs.org/supports-color/-/supports-color-7.2.0.tgz",
++++++++      "integrity": "sha512-qpCAvRl9stuOHveKsn7HncJRvv501qIacKzQlO/+Lwxc9+0q2wLyv4Dfvt80/DPn2pqOBsJdDiogXGR9+OvwRw==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "has-flag": "^4.0.0"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=8"
++++++++      }
++++++++    },
++++++++    "node_modules/check-error": {
++++++++      "version": "2.1.3",
++++++++      "resolved": "https://registry.npmjs.org/check-error/-/check-error-2.1.3.tgz",
++++++++      "integrity": "sha512-PAJdDJusoxnwm1VwW07VWwUN1sl7smmC3OKggvndJFadxxDRyFJBX/ggnu/KE4kQAB7a3Dp8f/YXC1FlUprWmA==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 16"
++++++++      }
++++++++    },
++++++++    "node_modules/chokidar": {
++++++++      "version": "3.6.0",
++++++++      "resolved": "https://registry.npmjs.org/chokidar/-/chokidar-3.6.0.tgz",
++++++++      "integrity": "sha512-7VT13fmjotKpGipCW9JEQAusEPE+Ei8nl6/g4FBAmIm0GOOLMua9NDDo/DWp0ZAxCr3cPq5ZpBqmPAQgDda2Pw==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "anymatch": "~3.1.2",
++++++++        "braces": "~3.0.2",
++++++++        "glob-parent": "~5.1.2",
++++++++        "is-binary-path": "~2.1.0",
++++++++        "is-glob": "~4.0.1",
++++++++        "normalize-path": "~3.0.0",
++++++++        "readdirp": "~3.6.0"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 8.10.0"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://paulmillr.com/funding/"
++++++++      },
++++++++      "optionalDependencies": {
++++++++        "fsevents": "~2.3.2"
++++++++      }
++++++++    },
++++++++    "node_modules/chokidar/node_modules/glob-parent": {
++++++++      "version": "5.1.2",
++++++++      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-5.1.2.tgz",
++++++++      "integrity": "sha512-AOIgSQCepiJYwP3ARnGx+5VnTu2HBYdzbGP45eLw1vr3zB3vZLeyed1sC9hnbcOc9/SrMyM5RPQrkGz4aS9Zow==",
++++++++      "dev": true,
++++++++      "license": "ISC",
++++++++      "dependencies": {
++++++++        "is-glob": "^4.0.1"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 6"
++++++++      }
++++++++    },
++++++++    "node_modules/cliui": {
++++++++      "version": "8.0.1",
++++++++      "resolved": "https://registry.npmjs.org/cliui/-/cliui-8.0.1.tgz",
++++++++      "integrity": "sha512-BSeNnyus75C4//NQ9gQt1/csTXyo/8Sb+afLAkzAptFuMsod9HFokGNudZpi/oQV73hnVK+sR+5PVRMd+Dr7YQ==",
++++++++      "dev": true,
++++++++      "license": "ISC",
++++++++      "dependencies": {
++++++++        "string-width": "^4.2.0",
++++++++        "strip-ansi": "^6.0.1",
++++++++        "wrap-ansi": "^7.0.0"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=12"
++++++++      }
++++++++    },
++++++++    "node_modules/clsx": {
++++++++      "version": "2.1.1",
++++++++      "resolved": "https://registry.npmjs.org/clsx/-/clsx-2.1.1.tgz",
++++++++      "integrity": "sha512-eYm0QWBtUrBWZWG0d386OGAw16Z995PiOVo2B7bjWSbHedGl5e0ZWaq65kOGgUSNesEIDkB9ISbTg/JK9dhCZA==",
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=6"
++++++++      }
++++++++    },
++++++++    "node_modules/color-convert": {
++++++++      "version": "2.0.1",
++++++++      "resolved": "https://registry.npmjs.org/color-convert/-/color-convert-2.0.1.tgz",
++++++++      "integrity": "sha512-RRECPsj7iu/xb5oKYcsFHSppFNnsj/52OVTRKb4zP5onXwVF3zVmmToNcOfGC+CRDpfK/U584fMg38ZHCaElKQ==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "color-name": "~1.1.4"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=7.0.0"
++++++++      }
++++++++    },
++++++++    "node_modules/color-name": {
++++++++      "version": "1.1.4",
++++++++      "resolved": "https://registry.npmjs.org/color-name/-/color-name-1.1.4.tgz",
++++++++      "integrity": "sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA==",
++++++++      "dev": true,
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/commander": {
++++++++      "version": "4.1.1",
++++++++      "resolved": "https://registry.npmjs.org/commander/-/commander-4.1.1.tgz",
++++++++      "integrity": "sha512-NOKm8xhkzAjzFx8B2v5OAHT+u5pRQc2UCa2Vq9jYL/31o2wi9mxBA7LIFs3sV5VSC49z6pEhfbMULvShKj26WA==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 6"
++++++++      }
++++++++    },
++++++++    "node_modules/concurrently": {
++++++++      "version": "9.2.4",
++++++++      "resolved": "https://registry.npmjs.org/concurrently/-/concurrently-9.2.4.tgz",
++++++++      "integrity": "sha512-TZ0CEhyzvFjgtAvHTusDMgj7wNdihCh7LLLrzdUOXIhdlnL2JBBGA9eJxR24rtqgmdjh3OA3hrN1rCHj6HM8qA==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "chalk": "4.1.2",
++++++++        "rxjs": "7.8.2",
++++++++        "shell-quote": "1.9.0",
++++++++        "supports-color": "8.1.1",
++++++++        "tree-kill": "1.2.2",
++++++++        "yargs": "17.7.2"
++++++++      },
++++++++      "bin": {
++++++++        "conc": "dist/bin/concurrently.js",
++++++++        "concurrently": "dist/bin/concurrently.js"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://github.com/open-cli-tools/concurrently?sponsor=1"
++++++++      }
++++++++    },
++++++++    "node_modules/content-disposition": {
++++++++      "version": "0.5.4",
++++++++      "resolved": "https://registry.npmjs.org/content-disposition/-/content-disposition-0.5.4.tgz",
++++++++      "integrity": "sha512-FveZTNuGw04cxlAiWbzi6zTAL/lhehaWbTtgluJh4/E95DqMwTmha3KZN1aAWA8cFIhHzMZUvLevkw5Rqk+tSQ==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "safe-buffer": "5.2.1"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 0.6"
++++++++      }
++++++++    },
++++++++    "node_modules/content-type": {
++++++++      "version": "1.0.5",
++++++++      "resolved": "https://registry.npmjs.org/content-type/-/content-type-1.0.5.tgz",
++++++++      "integrity": "sha512-nTjqfcBFEipKdXCv4YDQWCfmcLZKm81ldF0pAopTvyrFGVbcR6P/VAAd5G7N+0tTr8QqiU0tFadD6FK4NtJwOA==",
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 0.6"
++++++++      }
++++++++    },
++++++++    "node_modules/convert-source-map": {
++++++++      "version": "2.0.0",
++++++++      "resolved": "https://registry.npmjs.org/convert-source-map/-/convert-source-map-2.0.0.tgz",
++++++++      "integrity": "sha512-Kvp459HrV2FEJ1CAsi1Ku+MY3kasH19TFykTz2xWmMeq6bk2NU3XXvfJ+Q61m0xktWwt+1HSYf3JZsTms3aRJg==",
++++++++      "dev": true,
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/cookie": {
++++++++      "version": "0.7.2",
++++++++      "resolved": "https://registry.npmjs.org/cookie/-/cookie-0.7.2.tgz",
++++++++      "integrity": "sha512-yki5XnKuf750l50uGTllt6kKILY4nQ1eNIQatoXEByZ5dWgnKqbnqmTrBE5B4N7lrMJKQ2ytWMiTO2o0v6Ew/w==",
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 0.6"
++++++++      }
++++++++    },
++++++++    "node_modules/cookie-signature": {
++++++++      "version": "1.0.7",
++++++++      "resolved": "https://registry.npmjs.org/cookie-signature/-/cookie-signature-1.0.7.tgz",
++++++++      "integrity": "sha512-NXdYc3dLr47pBkpUCHtKSwIOQXLVn8dZEuywboCOJY/osA0wFSLlSawr3KN8qXJEyX66FcONTH8EIlVuK0yyFA==",
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/cors": {
++++++++      "version": "2.8.6",
++++++++      "resolved": "https://registry.npmjs.org/cors/-/cors-2.8.6.tgz",
++++++++      "integrity": "sha512-tJtZBBHA6vjIAaF6EnIaq6laBBP9aq/Y3ouVJjEfoHbRBcHBAHYcMh/w8LDrk2PvIMMq8gmopa5D4V8RmbrxGw==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "object-assign": "^4",
++++++++        "vary": "^1"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 0.10"
++++++++      },
++++++++      "funding": {
++++++++        "type": "opencollective",
++++++++        "url": "https://opencollective.com/express"
++++++++      }
++++++++    },
++++++++    "node_modules/cssesc": {
++++++++      "version": "3.0.0",
++++++++      "resolved": "https://registry.npmjs.org/cssesc/-/cssesc-3.0.0.tgz",
++++++++      "integrity": "sha512-/Tb/JcjK111nNScGob5MNtsntNM1aCNUDipB/TkwZFhyDrrE47SOx/18wF2bbjgc3ZzCSKW1T5nt5EbFoAz/Vg==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "bin": {
++++++++        "cssesc": "bin/cssesc"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=4"
++++++++      }
++++++++    },
++++++++    "node_modules/csstype": {
++++++++      "version": "3.2.3",
++++++++      "resolved": "https://registry.npmjs.org/csstype/-/csstype-3.2.3.tgz",
++++++++      "integrity": "sha512-z1HGKcYy2xA8AGQfwrn0PAy+PB7X/GSj3UVJW9qKyn43xWa+gl5nXmU4qqLMRzWVLFC8KusUX8T/0kCiOYpAIQ==",
++++++++      "dev": true,
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/debug": {
++++++++      "version": "4.4.3",
++++++++      "resolved": "https://registry.npmjs.org/debug/-/debug-4.4.3.tgz",
++++++++      "integrity": "sha512-RGwwWnwQvkVfavKVt22FGLw+xYSdzARwm0ru6DhTVA3umU5hZc28V3kO4stgYryrTlLpuvgI9GiijltAjNbcqA==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "ms": "^2.1.3"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=6.0"
++++++++      },
++++++++      "peerDependenciesMeta": {
++++++++        "supports-color": {
++++++++          "optional": true
++++++++        }
++++++++      }
++++++++    },
++++++++    "node_modules/deep-eql": {
++++++++      "version": "5.0.2",
++++++++      "resolved": "https://registry.npmjs.org/deep-eql/-/deep-eql-5.0.2.tgz",
++++++++      "integrity": "sha512-h5k/5U50IJJFpzfL6nO9jaaumfjO/f2NjK/oYB2Djzm4p9L+3T9qWpZqZ2hAbLPuuYq9wrU08WQyBTL5GbPk5Q==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=6"
++++++++      }
++++++++    },
++++++++    "node_modules/depd": {
++++++++      "version": "2.0.0",
++++++++      "resolved": "https://registry.npmjs.org/depd/-/depd-2.0.0.tgz",
++++++++      "integrity": "sha512-g7nH6P6dyDioJogAAGprGpCtVImJhpPk/roCzdb3fIh61/s/nPsfR6onyMwkCAR/OlC3yBC0lESvUoQEAssIrw==",
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 0.8"
++++++++      }
++++++++    },
++++++++    "node_modules/destroy": {
++++++++      "version": "1.2.0",
++++++++      "resolved": "https://registry.npmjs.org/destroy/-/destroy-1.2.0.tgz",
++++++++      "integrity": "sha512-2sJGJTaXIIaR1w4iJSNoN0hnMY7Gpc/n8D4qSCJw8QqFWXf7cuAgnEHxBpweaVcPevC2l3KpjYCx3NypQQgaJg==",
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 0.8",
++++++++        "npm": "1.2.8000 || >= 1.4.16"
++++++++      }
++++++++    },
++++++++    "node_modules/didyoumean": {
++++++++      "version": "1.2.2",
++++++++      "resolved": "https://registry.npmjs.org/didyoumean/-/didyoumean-1.2.2.tgz",
++++++++      "integrity": "sha512-gxtyfqMg7GKyhQmb056K7M3xszy/myH8w+B4RT+QXBQsvAOdc3XymqDDPHx1BgPgsdAA5SIifona89YtRATDzw==",
++++++++      "dev": true,
++++++++      "license": "Apache-2.0"
++++++++    },
++++++++    "node_modules/dlv": {
++++++++      "version": "1.1.3",
++++++++      "resolved": "https://registry.npmjs.org/dlv/-/dlv-1.1.3.tgz",
++++++++      "integrity": "sha512-+HlytyjlPKnIG8XuRG8WvmBP8xs8P71y+SKKS6ZXWoEgLuePxtDoUEiH7WkdePWrQ5JBpE6aoVqfZfJUQkjXwA==",
++++++++      "dev": true,
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/dotenv": {
++++++++      "version": "16.6.1",
++++++++      "resolved": "https://registry.npmjs.org/dotenv/-/dotenv-16.6.1.tgz",
++++++++      "integrity": "sha512-uBq4egWHTcTt33a72vpSG0z3HnPuIl6NqYcTrKEg2azoEyl2hpW0zqlxysq2pK9HlDIHyHyakeYaYnSAwd8bow==",
++++++++      "license": "BSD-2-Clause",
++++++++      "engines": {
++++++++        "node": ">=12"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://dotenvx.com"
++++++++      }
++++++++    },
++++++++    "node_modules/dunder-proto": {
++++++++      "version": "1.0.1",
++++++++      "resolved": "https://registry.npmjs.org/dunder-proto/-/dunder-proto-1.0.1.tgz",
++++++++      "integrity": "sha512-KIN/nDJBQRcXw0MLVhZE9iQHmG68qAVIBg9CqmUYjmQIhgij9U5MFvrqkUL5FbtyyzZuOeOt0zdeRe4UY7ct+A==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "call-bind-apply-helpers": "^1.0.1",
++++++++        "es-errors": "^1.3.0",
++++++++        "gopd": "^1.2.0"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 0.4"
++++++++      }
++++++++    },
++++++++    "node_modules/ee-first": {
++++++++      "version": "1.1.1",
++++++++      "resolved": "https://registry.npmjs.org/ee-first/-/ee-first-1.1.1.tgz",
++++++++      "integrity": "sha512-WMwm9LhRUo+WUaRN+vRuETqG89IgZphVSNkdFgeb6sS/E4OrDIN7t48CAewSHXc6C8lefD8KKfr5vY61brQlow==",
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/electron-to-chromium": {
++++++++      "version": "1.5.420",
++++++++      "resolved": "https://registry.npmjs.org/electron-to-chromium/-/electron-to-chromium-1.5.420.tgz",
++++++++      "integrity": "sha512-2yD6XreGusOfNV+dUcvipJEXc3n/n7fgr7996aszTG+YY5E4mqM4tOq/3uhP129cazL9YHbVWSpc79ePotWtPA==",
++++++++      "dev": true,
++++++++      "license": "ISC"
++++++++    },
++++++++    "node_modules/emoji-regex": {
++++++++      "version": "8.0.0",
++++++++      "resolved": "https://registry.npmjs.org/emoji-regex/-/emoji-regex-8.0.0.tgz",
++++++++      "integrity": "sha512-MSjYzcWNOA0ewAHpz0MxpYFvwg6yjy1NG3xteoqz644VCo/RPgnr1/GGt+ic3iJTzQ8Eu3TdM14SawnVUmGE6A==",
++++++++      "dev": true,
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/encodeurl": {
++++++++      "version": "2.0.0",
++++++++      "resolved": "https://registry.npmjs.org/encodeurl/-/encodeurl-2.0.0.tgz",
++++++++      "integrity": "sha512-Q0n9HRi4m6JuGIV1eFlmvJB7ZEVxu93IrMyiMsGC0lrMJMWzRgx6WGquyfQgZVb31vhGgXnfmPNNXmxnOkRBrg==",
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 0.8"
++++++++      }
++++++++    },
++++++++    "node_modules/engine.io": {
++++++++      "version": "6.6.9",
++++++++      "resolved": "https://registry.npmjs.org/engine.io/-/engine.io-6.6.9.tgz",
++++++++      "integrity": "sha512-clKkw4C7nJ22mGgoVcCg6V/W/TxdNyIOTr89k2ONZu81qqkddPFDF0LXcbAwhzPD8DjkiRCjzuiO6Y+fkpD4vg==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@types/cors": "^2.8.12",
++++++++        "@types/node": ">=10.0.0",
++++++++        "@types/ws": "^8.5.12",
++++++++        "accepts": "~1.3.4",
++++++++        "base64id": "2.0.0",
++++++++        "cookie": "~0.7.2",
++++++++        "cors": "~2.8.5",
++++++++        "debug": "~4.4.1",
++++++++        "engine.io-parser": "~5.2.1",
++++++++        "ws": "~8.21.0"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=10.2.0"
++++++++      }
++++++++    },
++++++++    "node_modules/engine.io-client": {
++++++++      "version": "6.6.6",
++++++++      "resolved": "https://registry.npmjs.org/engine.io-client/-/engine.io-client-6.6.6.tgz",
++++++++      "integrity": "sha512-iY6QdftLQ9pyiPoX082bpf/u1UewnOaJrtJIF9T0++QB34lZrj0uP+Q/bj8AlUsAxqhnkTV2BS8SBZSxOmoV5Q==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@socket.io/component-emitter": "~3.1.0",
++++++++        "debug": "~4.4.1",
++++++++        "engine.io-parser": "~5.2.1",
++++++++        "ws": "~8.21.0",
++++++++        "xmlhttprequest-ssl": "~2.1.1"
++++++++      }
++++++++    },
++++++++    "node_modules/engine.io-parser": {
++++++++      "version": "5.2.3",
++++++++      "resolved": "https://registry.npmjs.org/engine.io-parser/-/engine.io-parser-5.2.3.tgz",
++++++++      "integrity": "sha512-HqD3yTBfnBxIrbnM1DoD6Pcq8NECnh8d4As1Qgh0z5Gg3jRRIqijury0CL3ghu/edArpUYiYqQiDUQBIs4np3Q==",
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=10.0.0"
++++++++      }
++++++++    },
++++++++    "node_modules/es-define-property": {
++++++++      "version": "1.0.1",
++++++++      "resolved": "https://registry.npmjs.org/es-define-property/-/es-define-property-1.0.1.tgz",
++++++++      "integrity": "sha512-e3nRfgfUZ4rNGL232gUgX06QNyyez04KdjFrF+LTRoOXmrOgFKDg4BCdsjW8EnT69eqdYGmRpJwiPVYNrCaW3g==",
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 0.4"
++++++++      }
++++++++    },
++++++++    "node_modules/es-errors": {
++++++++      "version": "1.3.0",
++++++++      "resolved": "https://registry.npmjs.org/es-errors/-/es-errors-1.3.0.tgz",
++++++++      "integrity": "sha512-Zf5H2Kxt2xjTvbJvP2ZWLEICxA6j+hAmMzIlypy4xcBg1vKVnx89Wy0GbS+kf5cwCVFFzdCFh2XSCFNULS6csw==",
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 0.4"
++++++++      }
++++++++    },
++++++++    "node_modules/es-module-lexer": {
++++++++      "version": "1.7.0",
++++++++      "resolved": "https://registry.npmjs.org/es-module-lexer/-/es-module-lexer-1.7.0.tgz",
++++++++      "integrity": "sha512-jEQoCwk8hyb2AZziIOLhDqpm5+2ww5uIE6lkO/6jcOCusfk6LhMHpXXfBLXTZ7Ydyt0j4VoUQv6uGNYbdW+kBA==",
++++++++      "dev": true,
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/es-object-atoms": {
++++++++      "version": "1.1.2",
++++++++      "resolved": "https://registry.npmjs.org/es-object-atoms/-/es-object-atoms-1.1.2.tgz",
++++++++      "integrity": "sha512-HWcBoN6NileqtSydK2FqHbS/LoDd2pqrnQHLyJzBj4kOp/ky2MWMN694xOfkK8/SnUsW2DH7EfyVlydKCsm1Zw==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "es-errors": "^1.3.0"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 0.4"
++++++++      }
++++++++    },
++++++++    "node_modules/esbuild": {
++++++++      "version": "0.28.2",
++++++++      "resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.28.2.tgz",
++++++++      "integrity": "sha512-HKVLS8dvII+xoKW9kmqxbRKrnWEXfJJr/FZhhJmiqIB0e053QNYFqOBouTMO/k5sID4MvCiUCvv8b9M4h32wIA==",
++++++++      "dev": true,
++++++++      "hasInstallScript": true,
++++++++      "license": "MIT",
++++++++      "bin": {
++++++++        "esbuild": "bin/esbuild"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      },
++++++++      "optionalDependencies": {
++++++++        "@esbuild/aix-ppc64": "0.28.2",
++++++++        "@esbuild/android-arm": "0.28.2",
++++++++        "@esbuild/android-arm64": "0.28.2",
++++++++        "@esbuild/android-x64": "0.28.2",
++++++++        "@esbuild/darwin-arm64": "0.28.2",
++++++++        "@esbuild/darwin-x64": "0.28.2",
++++++++        "@esbuild/freebsd-arm64": "0.28.2",
++++++++        "@esbuild/freebsd-x64": "0.28.2",
++++++++        "@esbuild/linux-arm": "0.28.2",
++++++++        "@esbuild/linux-arm64": "0.28.2",
++++++++        "@esbuild/linux-ia32": "0.28.2",
++++++++        "@esbuild/linux-loong64": "0.28.2",
++++++++        "@esbuild/linux-mips64el": "0.28.2",
++++++++        "@esbuild/linux-ppc64": "0.28.2",
++++++++        "@esbuild/linux-riscv64": "0.28.2",
++++++++        "@esbuild/linux-s390x": "0.28.2",
++++++++        "@esbuild/linux-x64": "0.28.2",
++++++++        "@esbuild/netbsd-arm64": "0.28.2",
++++++++        "@esbuild/netbsd-x64": "0.28.2",
++++++++        "@esbuild/openbsd-arm64": "0.28.2",
++++++++        "@esbuild/openbsd-x64": "0.28.2",
++++++++        "@esbuild/openharmony-arm64": "0.28.2",
++++++++        "@esbuild/sunos-x64": "0.28.2",
++++++++        "@esbuild/win32-arm64": "0.28.2",
++++++++        "@esbuild/win32-ia32": "0.28.2",
++++++++        "@esbuild/win32-x64": "0.28.2"
++++++++      }
++++++++    },
++++++++    "node_modules/escalade": {
++++++++      "version": "3.2.0",
++++++++      "resolved": "https://registry.npmjs.org/escalade/-/escalade-3.2.0.tgz",
++++++++      "integrity": "sha512-WUj2qlxaQtO4g6Pq5c29GTcWGDyd8itL8zTlipgECz3JesAiiOKotd8JU6otB3PACgG6xkJUyVhboMS+bje/jA==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=6"
++++++++      }
++++++++    },
++++++++    "node_modules/escape-html": {
++++++++      "version": "1.0.3",
++++++++      "resolved": "https://registry.npmjs.org/escape-html/-/escape-html-1.0.3.tgz",
++++++++      "integrity": "sha512-NiSupZ4OeuGwr68lGIeym/ksIZMJodUGOSCZ/FSnTxcrekbvqrgdUxlJOMpijaKZVjAJrWrGs/6Jy8OMuyj9ow==",
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/estree-walker": {
++++++++      "version": "3.0.3",
++++++++      "resolved": "https://registry.npmjs.org/estree-walker/-/estree-walker-3.0.3.tgz",
++++++++      "integrity": "sha512-7RUKfXgSMMkzt6ZuXmqapOurLGPPfgj6l9uRZ7lRGolvk0y2yocc35LdcxKC5PQZdn2DMqioAQ2NoWcrTKmm6g==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@types/estree": "^1.0.0"
++++++++      }
++++++++    },
++++++++    "node_modules/etag": {
++++++++      "version": "1.8.1",
++++++++      "resolved": "https://registry.npmjs.org/etag/-/etag-1.8.1.tgz",
++++++++      "integrity": "sha512-aIL5Fx7mawVa300al2BnEE4iNvo1qETxLrPI/o05L7z6go7fCw1J6EQmbK4FmJ2AS7kgVF/KEZWufBfdClMcPg==",
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 0.6"
++++++++      }
++++++++    },
++++++++    "node_modules/expect-type": {
++++++++      "version": "1.4.0",
++++++++      "resolved": "https://registry.npmjs.org/expect-type/-/expect-type-1.4.0.tgz",
++++++++      "integrity": "sha512-KfYbmpRm0VbLjEvVa9yGwCi9GI34xvi7A/HXYWQO65CSD2u3MczUJSuwXKFIxlGsgBQizV9q5J9NHj4VG0n+pA==",
++++++++      "dev": true,
++++++++      "license": "Apache-2.0",
++++++++      "engines": {
++++++++        "node": ">=12.0.0"
++++++++      }
++++++++    },
++++++++    "node_modules/express": {
++++++++      "version": "4.22.2",
++++++++      "resolved": "https://registry.npmjs.org/express/-/express-4.22.2.tgz",
++++++++      "integrity": "sha512-IuL+Elrou2ZvCFHs18/CIzy2Nzvo25nZ1/D2eIZlz7c+QUayAcYoiM2BthCjs+EBHVpjYjcuLDAiCWgeIX3X1Q==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "accepts": "~1.3.8",
++++++++        "array-flatten": "1.1.1",
++++++++        "body-parser": "~1.20.5",
++++++++        "content-disposition": "~0.5.4",
++++++++        "content-type": "~1.0.4",
++++++++        "cookie": "~0.7.1",
++++++++        "cookie-signature": "~1.0.6",
++++++++        "debug": "2.6.9",
++++++++        "depd": "2.0.0",
++++++++        "encodeurl": "~2.0.0",
++++++++        "escape-html": "~1.0.3",
++++++++        "etag": "~1.8.1",
++++++++        "finalhandler": "~1.3.1",
++++++++        "fresh": "~0.5.2",
++++++++        "http-errors": "~2.0.0",
++++++++        "merge-descriptors": "1.0.3",
++++++++        "methods": "~1.1.2",
++++++++        "on-finished": "~2.4.1",
++++++++        "parseurl": "~1.3.3",
++++++++        "path-to-regexp": "~0.1.12",
++++++++        "proxy-addr": "~2.0.7",
++++++++        "qs": "~6.15.1",
++++++++        "range-parser": "~1.2.1",
++++++++        "safe-buffer": "5.2.1",
++++++++        "send": "~0.19.0",
++++++++        "serve-static": "~1.16.2",
++++++++        "setprototypeof": "1.2.0",
++++++++        "statuses": "~2.0.1",
++++++++        "type-is": "~1.6.18",
++++++++        "utils-merge": "1.0.1",
++++++++        "vary": "~1.1.2"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 0.10.0"
++++++++      },
++++++++      "funding": {
++++++++        "type": "opencollective",
++++++++        "url": "https://opencollective.com/express"
++++++++      }
++++++++    },
++++++++    "node_modules/express/node_modules/debug": {
++++++++      "version": "2.6.9",
++++++++      "resolved": "https://registry.npmjs.org/debug/-/debug-2.6.9.tgz",
++++++++      "integrity": "sha512-bC7ElrdJaJnPbAP+1EotYvqZsb3ecl5wi6Bfi6BJTUcNowp6cvspg0jXznRTKDjm/E7AdgFBVeAPVMNcKGsHMA==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "ms": "2.0.0"
++++++++      }
++++++++    },
++++++++    "node_modules/express/node_modules/ms": {
++++++++      "version": "2.0.0",
++++++++      "resolved": "https://registry.npmjs.org/ms/-/ms-2.0.0.tgz",
++++++++      "integrity": "sha512-Tpp60P6IUJDTuOq/5Z8cdskzJujfwqfOTkrwIwj7IRISpnkJnT6SyJ4PCPnGMoFjC9ddhal5KVIYtAt97ix05A==",
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/fast-glob": {
++++++++      "version": "3.3.3",
++++++++      "resolved": "https://registry.npmjs.org/fast-glob/-/fast-glob-3.3.3.tgz",
++++++++      "integrity": "sha512-7MptL8U0cqcFdzIzwOTHoilX9x5BrNqye7Z/LuC7kCMRio1EMSyqRK3BEAUD7sXRq4iT4AzTVuZdhgQ2TCvYLg==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@nodelib/fs.stat": "^2.0.2",
++++++++        "@nodelib/fs.walk": "^1.2.3",
++++++++        "glob-parent": "^5.1.2",
++++++++        "merge2": "^1.3.0",
++++++++        "micromatch": "^4.0.8"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=8.6.0"
++++++++      }
++++++++    },
++++++++    "node_modules/fast-glob/node_modules/glob-parent": {
++++++++      "version": "5.1.2",
++++++++      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-5.1.2.tgz",
++++++++      "integrity": "sha512-AOIgSQCepiJYwP3ARnGx+5VnTu2HBYdzbGP45eLw1vr3zB3vZLeyed1sC9hnbcOc9/SrMyM5RPQrkGz4aS9Zow==",
++++++++      "dev": true,
++++++++      "license": "ISC",
++++++++      "dependencies": {
++++++++        "is-glob": "^4.0.1"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 6"
++++++++      }
++++++++    },
++++++++    "node_modules/fastq": {
++++++++      "version": "1.20.3",
++++++++      "resolved": "https://registry.npmjs.org/fastq/-/fastq-1.20.3.tgz",
++++++++      "integrity": "sha512-XKv5nnLs6nLF71NgiKJLIZFLkPyIEuOselLG7ujZnGrRfQK8HpvY+WqKhAJUAdLomwVHErVS4LfxFlPq0/FTAw==",
++++++++      "dev": true,
++++++++      "license": "ISC",
++++++++      "dependencies": {
++++++++        "reusify": "^1.0.4"
++++++++      }
++++++++    },
++++++++    "node_modules/fill-range": {
++++++++      "version": "7.1.1",
++++++++      "resolved": "https://registry.npmjs.org/fill-range/-/fill-range-7.1.1.tgz",
++++++++      "integrity": "sha512-YsGpe3WHLK8ZYi4tWDg2Jy3ebRz2rXowDxnld4bkQB00cc/1Zw9AWnC0i9ztDJitivtQvaI9KaLyKrc+hBW0yg==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "to-regex-range": "^5.0.1"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=8"
++++++++      }
++++++++    },
++++++++    "node_modules/finalhandler": {
++++++++      "version": "1.3.2",
++++++++      "resolved": "https://registry.npmjs.org/finalhandler/-/finalhandler-1.3.2.tgz",
++++++++      "integrity": "sha512-aA4RyPcd3badbdABGDuTXCMTtOneUCAYH/gxoYRTZlIJdF0YPWuGqiAsIrhNnnqdXGswYk6dGujem4w80UJFhg==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "debug": "2.6.9",
++++++++        "encodeurl": "~2.0.0",
++++++++        "escape-html": "~1.0.3",
++++++++        "on-finished": "~2.4.1",
++++++++        "parseurl": "~1.3.3",
++++++++        "statuses": "~2.0.2",
++++++++        "unpipe": "~1.0.0"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 0.8"
++++++++      }
++++++++    },
++++++++    "node_modules/finalhandler/node_modules/debug": {
++++++++      "version": "2.6.9",
++++++++      "resolved": "https://registry.npmjs.org/debug/-/debug-2.6.9.tgz",
++++++++      "integrity": "sha512-bC7ElrdJaJnPbAP+1EotYvqZsb3ecl5wi6Bfi6BJTUcNowp6cvspg0jXznRTKDjm/E7AdgFBVeAPVMNcKGsHMA==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "ms": "2.0.0"
++++++++      }
++++++++    },
++++++++    "node_modules/finalhandler/node_modules/ms": {
++++++++      "version": "2.0.0",
++++++++      "resolved": "https://registry.npmjs.org/ms/-/ms-2.0.0.tgz",
++++++++      "integrity": "sha512-Tpp60P6IUJDTuOq/5Z8cdskzJujfwqfOTkrwIwj7IRISpnkJnT6SyJ4PCPnGMoFjC9ddhal5KVIYtAt97ix05A==",
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/forwarded": {
++++++++      "version": "0.2.0",
++++++++      "resolved": "https://registry.npmjs.org/forwarded/-/forwarded-0.2.0.tgz",
++++++++      "integrity": "sha512-buRG0fpBtRHSTCOASe6hD258tEubFoRLb4ZNA6NxMVHNw2gOcwHo9wyablzMzOA5z9xA9L1KNjk/Nt6MT9aYow==",
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 0.6"
++++++++      }
++++++++    },
++++++++    "node_modules/fraction.js": {
++++++++      "version": "5.3.4",
++++++++      "resolved": "https://registry.npmjs.org/fraction.js/-/fraction.js-5.3.4.tgz",
++++++++      "integrity": "sha512-1X1NTtiJphryn/uLQz3whtY6jK3fTqoE3ohKs0tT+Ujr1W59oopxmoEh7Lu5p6vBaPbgoM0bzveAW4Qi5RyWDQ==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": "*"
++++++++      },
++++++++      "funding": {
++++++++        "type": "github",
++++++++        "url": "https://github.com/sponsors/rawify"
++++++++      }
++++++++    },
++++++++    "node_modules/framer-motion": {
++++++++      "version": "12.43.0",
++++++++      "resolved": "https://registry.npmjs.org/framer-motion/-/framer-motion-12.43.0.tgz",
++++++++      "integrity": "sha512-1eaL3RvR/kAlbG7UYcpMptEyzPoENO0c6w7ZnB3/hh2vSAz/6uGAFn6fdoqTBguNstf3MsFhJHsD/0DHiclG+g==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "motion-dom": "^12.43.0",
++++++++        "motion-utils": "^12.39.0",
++++++++        "tslib": "^2.4.0"
++++++++      },
++++++++      "peerDependencies": {
++++++++        "@emotion/is-prop-valid": "*",
++++++++        "react": "^18.0.0 || ^19.0.0",
++++++++        "react-dom": "^18.0.0 || ^19.0.0"
++++++++      },
++++++++      "peerDependenciesMeta": {
++++++++        "@emotion/is-prop-valid": {
++++++++          "optional": true
++++++++        },
++++++++        "react": {
++++++++          "optional": true
++++++++        },
++++++++        "react-dom": {
++++++++          "optional": true
++++++++        }
++++++++      }
++++++++    },
++++++++    "node_modules/fresh": {
++++++++      "version": "0.5.2",
++++++++      "resolved": "https://registry.npmjs.org/fresh/-/fresh-0.5.2.tgz",
++++++++      "integrity": "sha512-zJ2mQYM18rEFOudeV4GShTGIQ7RbzA7ozbU9I/XBpm7kqgMywgmylMwXHxZJmkVoYkna9d2pVXVXPdYTP9ej8Q==",
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 0.6"
++++++++      }
++++++++    },
++++++++    "node_modules/fsevents": {
++++++++      "version": "2.3.3",
++++++++      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
++++++++      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
++++++++      "dev": true,
++++++++      "hasInstallScript": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "darwin"
++++++++      ],
++++++++      "engines": {
++++++++        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
++++++++      }
++++++++    },
++++++++    "node_modules/function-bind": {
++++++++      "version": "1.1.2",
++++++++      "resolved": "https://registry.npmjs.org/function-bind/-/function-bind-1.1.2.tgz",
++++++++      "integrity": "sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==",
++++++++      "license": "MIT",
++++++++      "funding": {
++++++++        "url": "https://github.com/sponsors/ljharb"
++++++++      }
++++++++    },
++++++++    "node_modules/gensync": {
++++++++      "version": "1.0.0-beta.2",
++++++++      "resolved": "https://registry.npmjs.org/gensync/-/gensync-1.0.0-beta.2.tgz",
++++++++      "integrity": "sha512-3hN7NaskYvMDLQY55gnW3NQ+mesEAepTqlg+VEbj7zzqEMBVNhzcGYYeqFo/TlYz6eQiFcp1HcsCZO+nGgS8zg==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=6.9.0"
++++++++      }
++++++++    },
++++++++    "node_modules/get-caller-file": {
++++++++      "version": "2.0.5",
++++++++      "resolved": "https://registry.npmjs.org/get-caller-file/-/get-caller-file-2.0.5.tgz",
++++++++      "integrity": "sha512-DyFP3BM/3YHTQOCUL/w0OZHR0lpKeGrxotcHWcqNEdnltqFwXVfhEBQ94eIo34AfQpo0rGki4cyIiftY06h2Fg==",
++++++++      "dev": true,
++++++++      "license": "ISC",
++++++++      "engines": {
++++++++        "node": "6.* || 8.* || >= 10.*"
++++++++      }
++++++++    },
++++++++    "node_modules/get-intrinsic": {
++++++++      "version": "1.3.0",
++++++++      "resolved": "https://registry.npmjs.org/get-intrinsic/-/get-intrinsic-1.3.0.tgz",
++++++++      "integrity": "sha512-9fSjSaos/fRIVIp+xSJlE6lfwhES7LNtKaCBIamHsjr2na1BiABJPo0mOjjz8GJDURarmCPGqaiVg5mfjb98CQ==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "call-bind-apply-helpers": "^1.0.2",
++++++++        "es-define-property": "^1.0.1",
++++++++        "es-errors": "^1.3.0",
++++++++        "es-object-atoms": "^1.1.1",
++++++++        "function-bind": "^1.1.2",
++++++++        "get-proto": "^1.0.1",
++++++++        "gopd": "^1.2.0",
++++++++        "has-symbols": "^1.1.0",
++++++++        "hasown": "^2.0.2",
++++++++        "math-intrinsics": "^1.1.0"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 0.4"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://github.com/sponsors/ljharb"
++++++++      }
++++++++    },
++++++++    "node_modules/get-proto": {
++++++++      "version": "1.0.1",
++++++++      "resolved": "https://registry.npmjs.org/get-proto/-/get-proto-1.0.1.tgz",
++++++++      "integrity": "sha512-sTSfBjoXBp89JvIKIefqw7U2CCebsc74kiY6awiGogKtoSGbgjYE/G/+l9sF3MWFPNc9IcoOC4ODfKHfxFmp0g==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "dunder-proto": "^1.0.1",
++++++++        "es-object-atoms": "^1.0.0"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 0.4"
++++++++      }
++++++++    },
++++++++    "node_modules/glob-parent": {
++++++++      "version": "6.0.2",
++++++++      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-6.0.2.tgz",
++++++++      "integrity": "sha512-XxwI8EOhVQgWp6iDL+3b0r86f4d6AX6zSU55HfB4ydCEuXLXc5FcYeOu+nnGftS4TEju/11rt4KJPTMgbfmv4A==",
++++++++      "dev": true,
++++++++      "license": "ISC",
++++++++      "dependencies": {
++++++++        "is-glob": "^4.0.3"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=10.13.0"
++++++++      }
++++++++    },
++++++++    "node_modules/gopd": {
++++++++      "version": "1.2.0",
++++++++      "resolved": "https://registry.npmjs.org/gopd/-/gopd-1.2.0.tgz",
++++++++      "integrity": "sha512-ZUKRh6/kUFoAiTAtTYPZJ3hw9wNxx+BIBOijnlG9PnrJsCcSjs1wyyD6vJpaYtgnzDrKYRSqf3OO6Rfa93xsRg==",
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 0.4"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://github.com/sponsors/ljharb"
++++++++      }
++++++++    },
++++++++    "node_modules/has-flag": {
++++++++      "version": "4.0.0",
++++++++      "resolved": "https://registry.npmjs.org/has-flag/-/has-flag-4.0.0.tgz",
++++++++      "integrity": "sha512-EykJT/Q1KjTWctppgIAgfSO0tKVuZUjhgMr17kqTumMl6Afv3EISleU7qZUzoXDFTAHTDC4NOoG/ZxU3EvlMPQ==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=8"
++++++++      }
++++++++    },
++++++++    "node_modules/has-symbols": {
++++++++      "version": "1.1.0",
++++++++      "resolved": "https://registry.npmjs.org/has-symbols/-/has-symbols-1.1.0.tgz",
++++++++      "integrity": "sha512-1cDNdwJ2Jaohmb3sg4OmKaMBwuC48sYni5HUw2DvsC8LjGTLK9h+eb1X6RyuOHe4hT0ULCW68iomhjUoKUqlPQ==",
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 0.4"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://github.com/sponsors/ljharb"
++++++++      }
++++++++    },
++++++++    "node_modules/hasown": {
++++++++      "version": "2.0.4",
++++++++      "resolved": "https://registry.npmjs.org/hasown/-/hasown-2.0.4.tgz",
++++++++      "integrity": "sha512-T2UbfbBEF32wiepXIsMlTW9+dDYC6wMh/t/vYA4tuOMKqWz/n3vr1NFSxQiyP+zk2mXsoMA/i/7qV6LKut1t1A==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "function-bind": "^1.1.2"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 0.4"
++++++++      }
++++++++    },
++++++++    "node_modules/http-errors": {
++++++++      "version": "2.0.1",
++++++++      "resolved": "https://registry.npmjs.org/http-errors/-/http-errors-2.0.1.tgz",
++++++++      "integrity": "sha512-4FbRdAX+bSdmo4AUFuS0WNiPz8NgFt+r8ThgNWmlrjQjt1Q7ZR9+zTlce2859x4KSXrwIsaeTqDoKQmtP8pLmQ==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "depd": "~2.0.0",
++++++++        "inherits": "~2.0.4",
++++++++        "setprototypeof": "~1.2.0",
++++++++        "statuses": "~2.0.2",
++++++++        "toidentifier": "~1.0.1"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 0.8"
++++++++      },
++++++++      "funding": {
++++++++        "type": "opencollective",
++++++++        "url": "https://opencollective.com/express"
++++++++      }
++++++++    },
++++++++    "node_modules/iceberg-js": {
++++++++      "version": "0.8.1",
++++++++      "resolved": "https://registry.npmjs.org/iceberg-js/-/iceberg-js-0.8.1.tgz",
++++++++      "integrity": "sha512-1dhVQZXhcHje7798IVM+xoo/1ZdVfzOMIc8/rgVSijRK38EDqOJoGula9N/8ZI5RD8QTxNQtK/Gozpr+qUqRRA==",
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=20.0.0"
++++++++      }
++++++++    },
++++++++    "node_modules/iconv-lite": {
++++++++      "version": "0.4.24",
++++++++      "resolved": "https://registry.npmjs.org/iconv-lite/-/iconv-lite-0.4.24.tgz",
++++++++      "integrity": "sha512-v3MXnZAcvnywkTUEZomIActle7RXXeedOR31wwl7VlyoXO4Qi9arvSenNQWne1TcRwhCL1HwLI21bEqdpj8/rA==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "safer-buffer": ">= 2.1.2 < 3"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=0.10.0"
++++++++      }
++++++++    },
++++++++    "node_modules/inherits": {
++++++++      "version": "2.0.4",
++++++++      "resolved": "https://registry.npmjs.org/inherits/-/inherits-2.0.4.tgz",
++++++++      "integrity": "sha512-k/vGaX4/Yla3WzyMCvTQOXYeIHvqOKtnqBduzTHpzpQZzAskKMhZ2K+EnBiSM9zGSoIFeMpXKxa4dYeZIQqewQ==",
++++++++      "license": "ISC"
++++++++    },
++++++++    "node_modules/ipaddr.js": {
++++++++      "version": "1.9.1",
++++++++      "resolved": "https://registry.npmjs.org/ipaddr.js/-/ipaddr.js-1.9.1.tgz",
++++++++      "integrity": "sha512-0KI/607xoxSToH7GjN1FfSbLoU0+btTicjsQSWQlh/hZykN8KpmMf7uYwPW3R+akZ6R/w18ZlXSHBYXiYUPO3g==",
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 0.10"
++++++++      }
++++++++    },
++++++++    "node_modules/is-binary-path": {
++++++++      "version": "2.1.0",
++++++++      "resolved": "https://registry.npmjs.org/is-binary-path/-/is-binary-path-2.1.0.tgz",
++++++++      "integrity": "sha512-ZMERYes6pDydyuGidse7OsHxtbI7WVeUEozgR/g7rd0xUimYNlvZRE/K2MgZTjWy725IfelLeVcEM97mmtRGXw==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "binary-extensions": "^2.0.0"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=8"
++++++++      }
++++++++    },
++++++++    "node_modules/is-core-module": {
++++++++      "version": "2.16.2",
++++++++      "resolved": "https://registry.npmjs.org/is-core-module/-/is-core-module-2.16.2.tgz",
++++++++      "integrity": "sha512-evOr8xfXKxE6qSR0hSXL2r3sd7ALj8+7jQEUvPYcm5sgZFdJ+AYzT6yNmJenvIYQBgIGwfwz08sL8zoL7yq2BA==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "hasown": "^2.0.3"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 0.4"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://github.com/sponsors/ljharb"
++++++++      }
++++++++    },
++++++++    "node_modules/is-extglob": {
++++++++      "version": "2.1.1",
++++++++      "resolved": "https://registry.npmjs.org/is-extglob/-/is-extglob-2.1.1.tgz",
++++++++      "integrity": "sha512-SbKbANkN603Vi4jEZv49LeVJMn4yGwsbzZworEoyEiutsN3nJYdbO36zfhGJ6QEDpOZIFkDtnq5JRxmvl3jsoQ==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=0.10.0"
++++++++      }
++++++++    },
++++++++    "node_modules/is-fullwidth-code-point": {
++++++++      "version": "3.0.0",
++++++++      "resolved": "https://registry.npmjs.org/is-fullwidth-code-point/-/is-fullwidth-code-point-3.0.0.tgz",
++++++++      "integrity": "sha512-zymm5+u+sCsSWyD9qNaejV3DFvhCKclKdizYaJUuHA83RLjb7nSuGnddCHGv0hk+KY7BMAlsWeK4Ueg6EV6XQg==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=8"
++++++++      }
++++++++    },
++++++++    "node_modules/is-glob": {
++++++++      "version": "4.0.3",
++++++++      "resolved": "https://registry.npmjs.org/is-glob/-/is-glob-4.0.3.tgz",
++++++++      "integrity": "sha512-xelSayHH36ZgE7ZWhli7pW34hNbNl8Ojv5KVmkJD4hBdD3th8Tfk9vYasLM+mXWOZhFkgZfxhLSnrwRr4elSSg==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "is-extglob": "^2.1.1"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=0.10.0"
++++++++      }
++++++++    },
++++++++    "node_modules/is-number": {
++++++++      "version": "7.0.0",
++++++++      "resolved": "https://registry.npmjs.org/is-number/-/is-number-7.0.0.tgz",
++++++++      "integrity": "sha512-41Cifkg6e8TylSpdtTpeLVMqvSBEVzTttHvERD741+pnZ8ANv0004MRL43QKPDlK9cGvNp6NZWZUBlbGXYxxng==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=0.12.0"
++++++++      }
++++++++    },
++++++++    "node_modules/jiti": {
++++++++      "version": "1.21.7",
++++++++      "resolved": "https://registry.npmjs.org/jiti/-/jiti-1.21.7.tgz",
++++++++      "integrity": "sha512-/imKNG4EbWNrVjoNC/1H5/9GFy+tqjGBHCaSsN+P2RnPqjsLmv6UD3Ej+Kj8nBWaRAwyk7kK5ZUc+OEatnTR3A==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "bin": {
++++++++        "jiti": "bin/jiti.js"
++++++++      }
++++++++    },
++++++++    "node_modules/js-tokens": {
++++++++      "version": "4.0.0",
++++++++      "resolved": "https://registry.npmjs.org/js-tokens/-/js-tokens-4.0.0.tgz",
++++++++      "integrity": "sha512-RdJUflcE3cUzKiMqQgsCu06FPu9UdIJO0beYbPhHN4k6apgJtifcoCtT9bcxOpYBtpD2kCM6Sbzg4CausW/PKQ==",
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/jsesc": {
++++++++      "version": "3.1.0",
++++++++      "resolved": "https://registry.npmjs.org/jsesc/-/jsesc-3.1.0.tgz",
++++++++      "integrity": "sha512-/sM3dO2FOzXjKQhJuo0Q173wf2KOo8t4I8vHy6lF9poUp7bKT0/NHE8fPX23PwfhnykfqnC2xRxOnVw5XuGIaA==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "bin": {
++++++++        "jsesc": "bin/jsesc"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=6"
++++++++      }
++++++++    },
++++++++    "node_modules/json5": {
++++++++      "version": "2.2.3",
++++++++      "resolved": "https://registry.npmjs.org/json5/-/json5-2.2.3.tgz",
++++++++      "integrity": "sha512-XmOWe7eyHYH14cLdVPoyg+GOH3rYX++KpzrylJwSW98t3Nk+U8XOl8FWKOgwtzdb8lXGf6zYwDUzeHMWfxasyg==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "bin": {
++++++++        "json5": "lib/cli.js"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=6"
++++++++      }
++++++++    },
++++++++    "node_modules/lilconfig": {
++++++++      "version": "3.1.3",
++++++++      "resolved": "https://registry.npmjs.org/lilconfig/-/lilconfig-3.1.3.tgz",
++++++++      "integrity": "sha512-/vlFKAoH5Cgt3Ie+JLhRbwOsCQePABiU3tJ1egGvyQ+33R/vcwM2Zl2QR/LzjsBeItPt3oSVXapn+m4nQDvpzw==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=14"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://github.com/sponsors/antonk52"
++++++++      }
++++++++    },
++++++++    "node_modules/lines-and-columns": {
++++++++      "version": "1.2.4",
++++++++      "resolved": "https://registry.npmjs.org/lines-and-columns/-/lines-and-columns-1.2.4.tgz",
++++++++      "integrity": "sha512-7ylylesZQ/PV29jhEDl3Ufjo6ZX7gCqJr5F7PKrqc93v7fzSymt1BpwEU8nAUXs8qzzvqhbjhK5QZg6Mt/HkBg==",
++++++++      "dev": true,
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/loose-envify": {
++++++++      "version": "1.4.0",
++++++++      "resolved": "https://registry.npmjs.org/loose-envify/-/loose-envify-1.4.0.tgz",
++++++++      "integrity": "sha512-lyuxPGr/Wfhrlem2CL/UcnUc1zcqKAImBDzukY7Y5F/yQiNdko6+fRLevlw1HgMySw7f611UIY408EtxRSoK3Q==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "js-tokens": "^3.0.0 || ^4.0.0"
++++++++      },
++++++++      "bin": {
++++++++        "loose-envify": "cli.js"
++++++++      }
++++++++    },
++++++++    "node_modules/loupe": {
++++++++      "version": "3.2.1",
++++++++      "resolved": "https://registry.npmjs.org/loupe/-/loupe-3.2.1.tgz",
++++++++      "integrity": "sha512-CdzqowRJCeLU72bHvWqwRBBlLcMEtIvGrlvef74kMnV2AolS9Y8xUv1I0U/MNAWMhBlKIoyuEgoJ0t/bbwHbLQ==",
++++++++      "dev": true,
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/lru-cache": {
++++++++      "version": "5.1.1",
++++++++      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-5.1.1.tgz",
++++++++      "integrity": "sha512-KpNARQA3Iwv+jTA0utUVVbrh+Jlrr1Fv0e56GGzAFOXN7dk/FviaDW8LHmK52DlcH4WP2n6gI8vN1aesBFgo9w==",
++++++++      "dev": true,
++++++++      "license": "ISC",
++++++++      "dependencies": {
++++++++        "yallist": "^3.0.2"
++++++++      }
++++++++    },
++++++++    "node_modules/lucide-react": {
++++++++      "version": "1.39.0",
++++++++      "resolved": "https://registry.npmjs.org/lucide-react/-/lucide-react-1.39.0.tgz",
++++++++      "integrity": "sha512-y8nXoEwvqqIsF927NBWXODa4bfMrcUeEb/9sgpwFqg0gUjgn3j5Hznk+v7STmPgZ2iQ11JKlbQGdFRuTOwvYkA==",
++++++++      "license": "ISC",
++++++++      "peerDependencies": {
++++++++        "react": "^16.5.1 || ^17.0.0 || ^18.0.0 || ^19.0.0"
++++++++      }
++++++++    },
++++++++    "node_modules/magic-string": {
++++++++      "version": "0.30.21",
++++++++      "resolved": "https://registry.npmjs.org/magic-string/-/magic-string-0.30.21.tgz",
++++++++      "integrity": "sha512-vd2F4YUyEXKGcLHoq+TEyCjxueSeHnFxyyjNp80yg0XV4vUhnDer/lvvlqM/arB5bXQN5K2/3oinyCRyx8T2CQ==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@jridgewell/sourcemap-codec": "^1.5.5"
++++++++      }
++++++++    },
++++++++    "node_modules/math-intrinsics": {
++++++++      "version": "1.1.0",
++++++++      "resolved": "https://registry.npmjs.org/math-intrinsics/-/math-intrinsics-1.1.0.tgz",
++++++++      "integrity": "sha512-/IXtbwEk5HTPyEwyKX6hGkYXxM9nbj64B+ilVJnC/R6B0pH5G4V3b0pVbL7DBj4tkhBAppbQUlf6F6Xl9LHu1g==",
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 0.4"
++++++++      }
++++++++    },
++++++++    "node_modules/media-typer": {
++++++++      "version": "0.3.0",
++++++++      "resolved": "https://registry.npmjs.org/media-typer/-/media-typer-0.3.0.tgz",
++++++++      "integrity": "sha512-dq+qelQ9akHpcOl/gUVRTxVIOkAJ1wR3QAvb4RsVjS8oVoFjDGTc679wJYmUmknUF5HwMLOgb5O+a3KxfWapPQ==",
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 0.6"
++++++++      }
++++++++    },
++++++++    "node_modules/merge-descriptors": {
++++++++      "version": "1.0.3",
++++++++      "resolved": "https://registry.npmjs.org/merge-descriptors/-/merge-descriptors-1.0.3.tgz",
++++++++      "integrity": "sha512-gaNvAS7TZ897/rVaZ0nMtAyxNyi/pdbjbAwUpFQpN70GqnVfOiXpeUUMKRBmzXaSQ8DdTX4/0ms62r2K+hE6mQ==",
++++++++      "license": "MIT",
++++++++      "funding": {
++++++++        "url": "https://github.com/sponsors/sindresorhus"
++++++++      }
++++++++    },
++++++++    "node_modules/merge2": {
++++++++      "version": "1.4.1",
++++++++      "resolved": "https://registry.npmjs.org/merge2/-/merge2-1.4.1.tgz",
++++++++      "integrity": "sha512-8q7VEgMJW4J8tcfVPy8g09NcQwZdbwFEqhe/WZkoIzjn/3TGDwtOCYtXGxA3O8tPzpczCCDgv+P2P5y00ZJOOg==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 8"
++++++++      }
++++++++    },
++++++++    "node_modules/methods": {
++++++++      "version": "1.1.2",
++++++++      "resolved": "https://registry.npmjs.org/methods/-/methods-1.1.2.tgz",
++++++++      "integrity": "sha512-iclAHeNqNm68zFtnZ0e+1L2yUIdvzNoauKU4WBA3VvH/vPFieF7qfRlwUZU+DA9P9bPXIS90ulxoUoCH23sV2w==",
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 0.6"
++++++++      }
++++++++    },
++++++++    "node_modules/micromatch": {
++++++++      "version": "4.0.8",
++++++++      "resolved": "https://registry.npmjs.org/micromatch/-/micromatch-4.0.8.tgz",
++++++++      "integrity": "sha512-PXwfBhYu0hBCPw8Dn0E+WDYb7af3dSLVWKi3HGv84IdF4TyFoC0ysxFd0Goxw7nSv4T/PzEJQxsYsEiFCKo2BA==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "braces": "^3.0.3",
++++++++        "picomatch": "^2.3.1"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=8.6"
++++++++      }
++++++++    },
++++++++    "node_modules/mime": {
++++++++      "version": "1.6.0",
++++++++      "resolved": "https://registry.npmjs.org/mime/-/mime-1.6.0.tgz",
++++++++      "integrity": "sha512-x0Vn8spI+wuJ1O6S7gnbaQg8Pxh4NNHb7KSINmEWKiPE4RKOplvijn+NkmYmmRgP68mc70j2EbeTFRsrswaQeg==",
++++++++      "license": "MIT",
++++++++      "bin": {
++++++++        "mime": "cli.js"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=4"
++++++++      }
++++++++    },
++++++++    "node_modules/mime-db": {
++++++++      "version": "1.52.0",
++++++++      "resolved": "https://registry.npmjs.org/mime-db/-/mime-db-1.52.0.tgz",
++++++++      "integrity": "sha512-sPU4uV7dYlvtWJxwwxHD0PuihVNiE7TyAbQ5SWxDCB9mUYvOgroQOwYQQOKPJ8CIbE+1ETVlOoK1UC2nU3gYvg==",
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 0.6"
++++++++      }
++++++++    },
++++++++    "node_modules/mime-types": {
++++++++      "version": "2.1.35",
++++++++      "resolved": "https://registry.npmjs.org/mime-types/-/mime-types-2.1.35.tgz",
++++++++      "integrity": "sha512-ZDY+bPm5zTTF+YpCrAU9nK0UgICYPT0QtT1NZWFv4s++TNkcgVaT0g6+4R2uI4MjQjzysHB1zxuWL50hzaeXiw==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "mime-db": "1.52.0"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 0.6"
++++++++      }
++++++++    },
++++++++    "node_modules/motion": {
++++++++      "version": "12.43.0",
++++++++      "resolved": "https://registry.npmjs.org/motion/-/motion-12.43.0.tgz",
++++++++      "integrity": "sha512-BQgQbSa9Hn3/mtbib0MK53y6JSANa+YKUKlaYnWzAVDH424RYQ5LVpV3pNiWH00BA2z4ojsSdMzqT7g2FQwjuQ==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "framer-motion": "^12.43.0",
++++++++        "tslib": "^2.4.0"
++++++++      },
++++++++      "peerDependencies": {
++++++++        "@emotion/is-prop-valid": "*",
++++++++        "react": "^18.0.0 || ^19.0.0",
++++++++        "react-dom": "^18.0.0 || ^19.0.0"
++++++++      },
++++++++      "peerDependenciesMeta": {
++++++++        "@emotion/is-prop-valid": {
++++++++          "optional": true
++++++++        },
++++++++        "react": {
++++++++          "optional": true
++++++++        },
++++++++        "react-dom": {
++++++++          "optional": true
++++++++        }
++++++++      }
++++++++    },
++++++++    "node_modules/motion-dom": {
++++++++      "version": "12.43.0",
++++++++      "resolved": "https://registry.npmjs.org/motion-dom/-/motion-dom-12.43.0.tgz",
++++++++      "integrity": "sha512-azKON4d9S65PEoFUiQTMTgPheEmzf2QngdRc50AKfJp9Q9mmcBVw22c8eMq9k8kxOFHdL7+WZY7N/5F/lwiDag==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "motion-utils": "^12.39.0"
++++++++      }
++++++++    },
++++++++    "node_modules/motion-utils": {
++++++++      "version": "12.39.0",
++++++++      "resolved": "https://registry.npmjs.org/motion-utils/-/motion-utils-12.39.0.tgz",
++++++++      "integrity": "sha512-8nadJAJjTtqRkmRF36FoJTrywK9nnFmnPwnSMyxaOCU7GDjN9RTMJIxx9De8ErM+vpPhMccr/6fo5WciyQLnMQ==",
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/ms": {
++++++++      "version": "2.1.3",
++++++++      "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",
++++++++      "integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==",
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/mz": {
++++++++      "version": "2.7.0",
++++++++      "resolved": "https://registry.npmjs.org/mz/-/mz-2.7.0.tgz",
++++++++      "integrity": "sha512-z81GNO7nnYMEhrGh9LeymoE4+Yr0Wn5McHIZMK5cfQCl+NDX08sCZgUc9/6MHni9IWuFLm1Z3HTCXu2z9fN62Q==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "any-promise": "^1.0.0",
++++++++        "object-assign": "^4.0.1",
++++++++        "thenify-all": "^1.0.0"
++++++++      }
++++++++    },
++++++++    "node_modules/nanoid": {
++++++++      "version": "3.3.18",
++++++++      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.18.tgz",
++++++++      "integrity": "sha512-DTg4MJbGMWkfi6VZFdNt2/caMbQy4Ou+Op/hJQvGEWcnVfoA1QA+xzRKAzw9jD6+GVOOeYr/mIcuDSdug6F6+w==",
++++++++      "dev": true,
++++++++      "funding": [
++++++++        {
++++++++          "type": "github",
++++++++          "url": "https://github.com/sponsors/ai"
++++++++        }
++++++++      ],
++++++++      "license": "MIT",
++++++++      "bin": {
++++++++        "nanoid": "bin/nanoid.cjs"
++++++++      },
++++++++      "engines": {
++++++++        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
++++++++      }
++++++++    },
++++++++    "node_modules/negotiator": {
++++++++      "version": "0.6.3",
++++++++      "resolved": "https://registry.npmjs.org/negotiator/-/negotiator-0.6.3.tgz",
++++++++      "integrity": "sha512-+EUsqGPLsM+j/zdChZjsnX51g4XrHFOIXwfnCVPGlQk/k5giakcKsuxCObBRu6DSm9opw/O6slWbJdghQM4bBg==",
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 0.6"
++++++++      }
++++++++    },
++++++++    "node_modules/node-releases": {
++++++++      "version": "2.0.54",
++++++++      "resolved": "https://registry.npmjs.org/node-releases/-/node-releases-2.0.54.tgz",
++++++++      "integrity": "sha512-YHs7BmmcsdAI5Ozuf8JZo6PT0mv2GIWC9vMfvUC3dp65M8hn7Ux8CPL+2oBI7juNuj9d0ndhTcznq2ODBps9cQ==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/normalize-path": {
++++++++      "version": "3.0.0",
++++++++      "resolved": "https://registry.npmjs.org/normalize-path/-/normalize-path-3.0.0.tgz",
++++++++      "integrity": "sha512-6eZs5Ls3WtCisHWp9S2GUy8dqkpGi4BVSz3GaqiE6ezub0512ESztXUwUB6C6IKbQkY2Pnb/mD4WYojCRwcwLA==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=0.10.0"
++++++++      }
++++++++    },
++++++++    "node_modules/object-assign": {
++++++++      "version": "4.1.1",
++++++++      "resolved": "https://registry.npmjs.org/object-assign/-/object-assign-4.1.1.tgz",
++++++++      "integrity": "sha512-rJgTQnkUnH1sFw8yT6VSU3zD3sWmu6sZhIseY8VX+GRu3P6F7Fu+JNDoXfklElbLJSnc3FUQHVe4cU5hj+BcUg==",
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=0.10.0"
++++++++      }
++++++++    },
++++++++    "node_modules/object-hash": {
++++++++      "version": "3.0.0",
++++++++      "resolved": "https://registry.npmjs.org/object-hash/-/object-hash-3.0.0.tgz",
++++++++      "integrity": "sha512-RSn9F68PjH9HqtltsSnqYC1XXoWe9Bju5+213R98cNGttag9q9yAOTzdbsqvIa7aNm5WffBZFpWYr2aWrklWAw==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 6"
++++++++      }
++++++++    },
++++++++    "node_modules/object-inspect": {
++++++++      "version": "1.13.4",
++++++++      "resolved": "https://registry.npmjs.org/object-inspect/-/object-inspect-1.13.4.tgz",
++++++++      "integrity": "sha512-W67iLl4J2EXEGTbfeHCffrjDfitvLANg0UlX3wFUUSTx92KXRFegMHUVgSqE+wvhAbi4WqjGg9czysTV2Epbew==",
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 0.4"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://github.com/sponsors/ljharb"
++++++++      }
++++++++    },
++++++++    "node_modules/on-finished": {
++++++++      "version": "2.4.1",
++++++++      "resolved": "https://registry.npmjs.org/on-finished/-/on-finished-2.4.1.tgz",
++++++++      "integrity": "sha512-oVlzkg3ENAhCk2zdv7IJwd/QUD4z2RxRwpkcGY8psCVcCYZNq4wYnVWALHM+brtuJjePWiYF/ClmuDr8Ch5+kg==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "ee-first": "1.1.1"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 0.8"
++++++++      }
++++++++    },
++++++++    "node_modules/parseurl": {
++++++++      "version": "1.3.3",
++++++++      "resolved": "https://registry.npmjs.org/parseurl/-/parseurl-1.3.3.tgz",
++++++++      "integrity": "sha512-CiyeOxFT/JZyN5m0z9PfXw4SCBJ6Sygz1Dpl0wqjlhDEGGBP1GnsUVEL0p63hoG1fcj3fHynXi9NYO4nWOL+qQ==",
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 0.8"
++++++++      }
++++++++    },
++++++++    "node_modules/path-parse": {
++++++++      "version": "1.0.7",
++++++++      "resolved": "https://registry.npmjs.org/path-parse/-/path-parse-1.0.7.tgz",
++++++++      "integrity": "sha512-LDJzPVEEEPR+y48z93A0Ed0yXb8pAByGWo/k5YYdYgpY2/2EsOsksJrq7lOHxryrVOn1ejG6oAp8ahvOIQD8sw==",
++++++++      "dev": true,
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/path-to-regexp": {
++++++++      "version": "0.1.13",
++++++++      "resolved": "https://registry.npmjs.org/path-to-regexp/-/path-to-regexp-0.1.13.tgz",
++++++++      "integrity": "sha512-A/AGNMFN3c8bOlvV9RreMdrv7jsmF9XIfDeCd87+I8RNg6s78BhJxMu69NEMHBSJFxKidViTEdruRwEk/WIKqA==",
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/pathe": {
++++++++      "version": "2.0.3",
++++++++      "resolved": "https://registry.npmjs.org/pathe/-/pathe-2.0.3.tgz",
++++++++      "integrity": "sha512-WUjGcAqP1gQacoQe+OBJsFA7Ld4DyXuUIjZ5cc75cLHvJ7dtNsTugphxIADwspS+AraAUePCKrSVtPLFj/F88w==",
++++++++      "dev": true,
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/pathval": {
++++++++      "version": "2.0.1",
++++++++      "resolved": "https://registry.npmjs.org/pathval/-/pathval-2.0.1.tgz",
++++++++      "integrity": "sha512-//nshmD55c46FuFw26xV/xFAaB5HF9Xdap7HJBBnrKdAd6/GxDBaNA1870O79+9ueg61cZLSVc+OaFlfmObYVQ==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 14.16"
++++++++      }
++++++++    },
++++++++    "node_modules/picocolors": {
++++++++      "version": "1.1.1",
++++++++      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
++++++++      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
++++++++      "dev": true,
++++++++      "license": "ISC"
++++++++    },
++++++++    "node_modules/picomatch": {
++++++++      "version": "2.3.2",
++++++++      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-2.3.2.tgz",
++++++++      "integrity": "sha512-V7+vQEJ06Z+c5tSye8S+nHUfI51xoXIXjHQ99cQtKUkQqqO1kO/KCJUfZXuB47h/YBlDhah2H3hdUGXn8ie0oA==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=8.6"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://github.com/sponsors/jonschlinkert"
++++++++      }
++++++++    },
++++++++    "node_modules/pirates": {
++++++++      "version": "4.0.7",
++++++++      "resolved": "https://registry.npmjs.org/pirates/-/pirates-4.0.7.tgz",
++++++++      "integrity": "sha512-TfySrs/5nm8fQJDcBDuUng3VOUKsd7S+zqvbOTiGXHfxX4wK31ard+hoNuvkicM/2YFzlpDgABOevKSsB4G/FA==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 6"
++++++++      }
++++++++    },
++++++++    "node_modules/postcss": {
++++++++      "version": "8.5.26",
++++++++      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.26.tgz",
++++++++      "integrity": "sha512-u82N74LFzG8ca+dD8puPnplTXoGH4fTPpVGuIbt36G3qvNlkvfD0lEAZSxaly3KX8TS/L1A1gsCEmvKmBcVbkQ==",
++++++++      "dev": true,
++++++++      "funding": [
++++++++        {
++++++++          "type": "opencollective",
++++++++          "url": "https://opencollective.com/postcss/"
++++++++        },
++++++++        {
++++++++          "type": "tidelift",
++++++++          "url": "https://tidelift.com/funding/github/npm/postcss"
++++++++        },
++++++++        {
++++++++          "type": "github",
++++++++          "url": "https://github.com/sponsors/ai"
++++++++        }
++++++++      ],
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "nanoid": "^3.3.17",
++++++++        "picocolors": "^1.1.1",
++++++++        "source-map-js": "^1.2.1"
++++++++      },
++++++++      "engines": {
++++++++        "node": "^10 || ^12 || >=14"
++++++++      }
++++++++    },
++++++++    "node_modules/postcss-import": {
++++++++      "version": "15.1.0",
++++++++      "resolved": "https://registry.npmjs.org/postcss-import/-/postcss-import-15.1.0.tgz",
++++++++      "integrity": "sha512-hpr+J05B2FVYUAXHeK1YyI267J/dDDhMU6B6civm8hSY1jYJnBXxzKDKDswzJmtLHryrjhnDjqqp/49t8FALew==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "postcss-value-parser": "^4.0.0",
++++++++        "read-cache": "^1.0.0",
++++++++        "resolve": "^1.1.7"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=14.0.0"
++++++++      },
++++++++      "peerDependencies": {
++++++++        "postcss": "^8.0.0"
++++++++      }
++++++++    },
++++++++    "node_modules/postcss-js": {
++++++++      "version": "4.1.0",
++++++++      "resolved": "https://registry.npmjs.org/postcss-js/-/postcss-js-4.1.0.tgz",
++++++++      "integrity": "sha512-oIAOTqgIo7q2EOwbhb8UalYePMvYoIeRY2YKntdpFQXNosSu3vLrniGgmH9OKs/qAkfoj5oB3le/7mINW1LCfw==",
++++++++      "dev": true,
++++++++      "funding": [
++++++++        {
++++++++          "type": "opencollective",
++++++++          "url": "https://opencollective.com/postcss/"
++++++++        },
++++++++        {
++++++++          "type": "github",
++++++++          "url": "https://github.com/sponsors/ai"
++++++++        }
++++++++      ],
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "camelcase-css": "^2.0.1"
++++++++      },
++++++++      "engines": {
++++++++        "node": "^12 || ^14 || >= 16"
++++++++      },
++++++++      "peerDependencies": {
++++++++        "postcss": "^8.4.21"
++++++++      }
++++++++    },
++++++++    "node_modules/postcss-load-config": {
++++++++      "version": "6.0.1",
++++++++      "resolved": "https://registry.npmjs.org/postcss-load-config/-/postcss-load-config-6.0.1.tgz",
++++++++      "integrity": "sha512-oPtTM4oerL+UXmx+93ytZVN82RrlY/wPUV8IeDxFrzIjXOLF1pN+EmKPLbubvKHT2HC20xXsCAH2Z+CKV6Oz/g==",
++++++++      "dev": true,
++++++++      "funding": [
++++++++        {
++++++++          "type": "opencollective",
++++++++          "url": "https://opencollective.com/postcss/"
++++++++        },
++++++++        {
++++++++          "type": "github",
++++++++          "url": "https://github.com/sponsors/ai"
++++++++        }
++++++++      ],
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "lilconfig": "^3.1.1"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 18"
++++++++      },
++++++++      "peerDependencies": {
++++++++        "jiti": ">=1.21.0",
++++++++        "postcss": ">=8.0.9",
++++++++        "tsx": "^4.8.1",
++++++++        "yaml": "^2.4.2"
++++++++      },
++++++++      "peerDependenciesMeta": {
++++++++        "jiti": {
++++++++          "optional": true
++++++++        },
++++++++        "postcss": {
++++++++          "optional": true
++++++++        },
++++++++        "tsx": {
++++++++          "optional": true
++++++++        },
++++++++        "yaml": {
++++++++          "optional": true
++++++++        }
++++++++      }
++++++++    },
++++++++    "node_modules/postcss-nested": {
++++++++      "version": "6.2.0",
++++++++      "resolved": "https://registry.npmjs.org/postcss-nested/-/postcss-nested-6.2.0.tgz",
++++++++      "integrity": "sha512-HQbt28KulC5AJzG+cZtj9kvKB93CFCdLvog1WFLf1D+xmMvPGlBstkpTEZfK5+AN9hfJocyBFCNiqyS48bpgzQ==",
++++++++      "dev": true,
++++++++      "funding": [
++++++++        {
++++++++          "type": "opencollective",
++++++++          "url": "https://opencollective.com/postcss/"
++++++++        },
++++++++        {
++++++++          "type": "github",
++++++++          "url": "https://github.com/sponsors/ai"
++++++++        }
++++++++      ],
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "postcss-selector-parser": "^6.1.1"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=12.0"
++++++++      },
++++++++      "peerDependencies": {
++++++++        "postcss": "^8.2.14"
++++++++      }
++++++++    },
++++++++    "node_modules/postcss-selector-parser": {
++++++++      "version": "6.1.4",
++++++++      "resolved": "https://registry.npmjs.org/postcss-selector-parser/-/postcss-selector-parser-6.1.4.tgz",
++++++++      "integrity": "sha512-bIoJLOmjCO1S9XdY/DcnR5hJxvrDir1PbGChrzXG3vw0/FOliy/fA3dmdhQ441kah4gKv+TwckGzex6wNS5cnQ==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "cssesc": "^3.0.0",
++++++++        "util-deprecate": "^1.0.2"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=4"
++++++++      }
++++++++    },
++++++++    "node_modules/postcss-value-parser": {
++++++++      "version": "4.2.0",
++++++++      "resolved": "https://registry.npmjs.org/postcss-value-parser/-/postcss-value-parser-4.2.0.tgz",
++++++++      "integrity": "sha512-1NNCs6uurfkVbeXG4S8JFT9t19m45ICnif8zWLd5oPSZ50QnwMfK+H3jv408d4jw/7Bttv5axS5IiHoLaVNHeQ==",
++++++++      "dev": true,
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/proxy-addr": {
++++++++      "version": "2.0.7",
++++++++      "resolved": "https://registry.npmjs.org/proxy-addr/-/proxy-addr-2.0.7.tgz",
++++++++      "integrity": "sha512-llQsMLSUDUPT44jdrU/O37qlnifitDP+ZwrmmZcoSKyLKvtZxpyV0n2/bD/N4tBAAZ/gJEdZU7KMraoK1+XYAg==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "forwarded": "0.2.0",
++++++++        "ipaddr.js": "1.9.1"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 0.10"
++++++++      }
++++++++    },
++++++++    "node_modules/qs": {
++++++++      "version": "6.15.3",
++++++++      "resolved": "https://registry.npmjs.org/qs/-/qs-6.15.3.tgz",
++++++++      "integrity": "sha512-O9gl3zCl5h5blw1KGUzQKhA5oUXSl8rwUIM5o0S3nCXMliSvy5Dzx7/DJcI+SwgICv+IneSZwhBh1oSyEHA71A==",
++++++++      "license": "BSD-3-Clause",
++++++++      "dependencies": {
++++++++        "es-define-property": "^1.0.1",
++++++++        "side-channel": "^1.1.1"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=0.6"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://github.com/sponsors/ljharb"
++++++++      }
++++++++    },
++++++++    "node_modules/queue-microtask": {
++++++++      "version": "1.2.3",
++++++++      "resolved": "https://registry.npmjs.org/queue-microtask/-/queue-microtask-1.2.3.tgz",
++++++++      "integrity": "sha512-NuaNSa6flKT5JaSYQzJok04JzTL1CA6aGhv5rfLW3PgqA+M2ChpZQnAC8h8i4ZFkBS8X5RqkDBHA7r4hej3K9A==",
++++++++      "dev": true,
++++++++      "funding": [
++++++++        {
++++++++          "type": "github",
++++++++          "url": "https://github.com/sponsors/feross"
++++++++        },
++++++++        {
++++++++          "type": "patreon",
++++++++          "url": "https://www.patreon.com/feross"
++++++++        },
++++++++        {
++++++++          "type": "consulting",
++++++++          "url": "https://feross.org/support"
++++++++        }
++++++++      ],
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/range-parser": {
++++++++      "version": "1.2.1",
++++++++      "resolved": "https://registry.npmjs.org/range-parser/-/range-parser-1.2.1.tgz",
++++++++      "integrity": "sha512-Hrgsx+orqoygnmhFbKaHE6c296J+HTAQXoxEF6gNupROmmGJRoyzfG3ccAveqCBrwr/2yxQ5BVd/GTl5agOwSg==",
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 0.6"
++++++++      }
++++++++    },
++++++++    "node_modules/raw-body": {
++++++++      "version": "2.5.3",
++++++++      "resolved": "https://registry.npmjs.org/raw-body/-/raw-body-2.5.3.tgz",
++++++++      "integrity": "sha512-s4VSOf6yN0rvbRZGxs8Om5CWj6seneMwK3oDb4lWDH0UPhWcxwOWw5+qk24bxq87szX1ydrwylIOp2uG1ojUpA==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "bytes": "~3.1.2",
++++++++        "http-errors": "~2.0.1",
++++++++        "iconv-lite": "~0.4.24",
++++++++        "unpipe": "~1.0.0"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 0.8"
++++++++      }
++++++++    },
++++++++    "node_modules/react": {
++++++++      "version": "18.3.1",
++++++++      "resolved": "https://registry.npmjs.org/react/-/react-18.3.1.tgz",
++++++++      "integrity": "sha512-wS+hAgJShR0KhEvPJArfuPVN1+Hz1t0Y6n5jLrGQbkb4urgPE/0Rve+1kMB1v/oWgHgm4WIcV+i7F2pTVj+2iQ==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "loose-envify": "^1.1.0"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=0.10.0"
++++++++      }
++++++++    },
++++++++    "node_modules/react-dom": {
++++++++      "version": "18.3.1",
++++++++      "resolved": "https://registry.npmjs.org/react-dom/-/react-dom-18.3.1.tgz",
++++++++      "integrity": "sha512-5m4nQKp+rZRb09LNH59GM4BxTh9251/ylbKIbpe7TpGxfJ+9kv6BLkLBXIjjspbgbnIBNqlI23tRnTWT0snUIw==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "loose-envify": "^1.1.0",
++++++++        "scheduler": "^0.23.2"
++++++++      },
++++++++      "peerDependencies": {
++++++++        "react": "^18.3.1"
++++++++      }
++++++++    },
++++++++    "node_modules/react-refresh": {
++++++++      "version": "0.17.0",
++++++++      "resolved": "https://registry.npmjs.org/react-refresh/-/react-refresh-0.17.0.tgz",
++++++++      "integrity": "sha512-z6F7K9bV85EfseRCp2bzrpyQ0Gkw1uLoCel9XBVWPg/TjRj94SkJzUTGfOa4bs7iJvBWtQG0Wq7wnI0syw3EBQ==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=0.10.0"
++++++++      }
++++++++    },
++++++++    "node_modules/read-cache": {
++++++++      "version": "1.0.2",
++++++++      "resolved": "https://registry.npmjs.org/read-cache/-/read-cache-1.0.2.tgz",
++++++++      "integrity": "sha512-/peqiBB/n07gQGLsWaHho3WfvUyRscw0gYTsEFMhrIe/nWLkYaf5SbKYjGYqtRV3aPwykJgF2VEMo1ac4bnsGA==",
++++++++      "dev": true,
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/readdirp": {
++++++++      "version": "3.6.0",
++++++++      "resolved": "https://registry.npmjs.org/readdirp/-/readdirp-3.6.0.tgz",
++++++++      "integrity": "sha512-hOS089on8RduqdbhvQ5Z37A0ESjsqz6qnRcffsMU3495FuTdqSm+7bhJ29JvIOsBDEEnan5DPu9t3To9VRlMzA==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "picomatch": "^2.2.1"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=8.10.0"
++++++++      }
++++++++    },
++++++++    "node_modules/require-directory": {
++++++++      "version": "2.1.1",
++++++++      "resolved": "https://registry.npmjs.org/require-directory/-/require-directory-2.1.1.tgz",
++++++++      "integrity": "sha512-fGxEI7+wsG9xrvdjsrlmL22OMTTiHRwAMroiEeMgq8gzoLC/PQr7RsRDSTLUg/bZAZtF+TVIkHc6/4RIKrui+Q==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=0.10.0"
++++++++      }
++++++++    },
++++++++    "node_modules/resolve": {
++++++++      "version": "1.22.12",
++++++++      "resolved": "https://registry.npmjs.org/resolve/-/resolve-1.22.12.tgz",
++++++++      "integrity": "sha512-TyeJ1zif53BPfHootBGwPRYT1RUt6oGWsaQr8UyZW/eAm9bKoijtvruSDEmZHm92CwS9nj7/fWttqPCgzep8CA==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "es-errors": "^1.3.0",
++++++++        "is-core-module": "^2.16.1",
++++++++        "path-parse": "^1.0.7",
++++++++        "supports-preserve-symlinks-flag": "^1.0.0"
++++++++      },
++++++++      "bin": {
++++++++        "resolve": "bin/resolve"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 0.4"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://github.com/sponsors/ljharb"
++++++++      }
++++++++    },
++++++++    "node_modules/reusify": {
++++++++      "version": "1.1.0",
++++++++      "resolved": "https://registry.npmjs.org/reusify/-/reusify-1.1.0.tgz",
++++++++      "integrity": "sha512-g6QUff04oZpHs0eG5p83rFLhHeV00ug/Yf9nZM6fLeUrPguBTkTQOdpAWWspMh55TZfVQDPaN3NQJfbVRAxdIw==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "iojs": ">=1.0.0",
++++++++        "node": ">=0.10.0"
++++++++      }
++++++++    },
++++++++    "node_modules/rollup": {
++++++++      "version": "4.63.1",
++++++++      "resolved": "https://registry.npmjs.org/rollup/-/rollup-4.63.1.tgz",
++++++++      "integrity": "sha512-3Df9jsstwhccuEfmAMi9l8XUh/GOkVObmFTU7CCVBysEbcOZLl84jCtaAZMcPiMz2EGKsATzQcU+Xr3n/wU6cg==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@types/estree": "1.0.9"
++++++++      },
++++++++      "bin": {
++++++++        "rollup": "dist/bin/rollup"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=18.0.0",
++++++++        "npm": ">=8.0.0"
++++++++      },
++++++++      "optionalDependencies": {
++++++++        "@napi-rs/lzma-linux-x64-gnu": "1.5.1",
++++++++        "@rollup/rollup-android-arm-eabi": "4.63.1",
++++++++        "@rollup/rollup-android-arm64": "4.63.1",
++++++++        "@rollup/rollup-darwin-arm64": "4.63.1",
++++++++        "@rollup/rollup-darwin-x64": "4.63.1",
++++++++        "@rollup/rollup-freebsd-arm64": "4.63.1",
++++++++        "@rollup/rollup-freebsd-x64": "4.63.1",
++++++++        "@rollup/rollup-linux-arm-gnueabihf": "4.63.1",
++++++++        "@rollup/rollup-linux-arm-musleabihf": "4.63.1",
++++++++        "@rollup/rollup-linux-arm64-gnu": "4.63.1",
++++++++        "@rollup/rollup-linux-arm64-musl": "4.63.1",
++++++++        "@rollup/rollup-linux-loong64-gnu": "4.63.1",
++++++++        "@rollup/rollup-linux-loong64-musl": "4.63.1",
++++++++        "@rollup/rollup-linux-ppc64-gnu": "4.63.1",
++++++++        "@rollup/rollup-linux-ppc64-musl": "4.63.1",
++++++++        "@rollup/rollup-linux-riscv64-gnu": "4.63.1",
++++++++        "@rollup/rollup-linux-riscv64-musl": "4.63.1",
++++++++        "@rollup/rollup-linux-s390x-gnu": "4.63.1",
++++++++        "@rollup/rollup-linux-x64-gnu": "4.63.1",
++++++++        "@rollup/rollup-linux-x64-musl": "4.63.1",
++++++++        "@rollup/rollup-openbsd-x64": "4.63.1",
++++++++        "@rollup/rollup-openharmony-arm64": "4.63.1",
++++++++        "@rollup/rollup-win32-arm64-msvc": "4.63.1",
++++++++        "@rollup/rollup-win32-ia32-msvc": "4.63.1",
++++++++        "@rollup/rollup-win32-x64-gnu": "4.63.1",
++++++++        "@rollup/rollup-win32-x64-msvc": "4.63.1",
++++++++        "fsevents": "~2.3.2"
++++++++      }
++++++++    },
++++++++    "node_modules/run-parallel": {
++++++++      "version": "1.2.0",
++++++++      "resolved": "https://registry.npmjs.org/run-parallel/-/run-parallel-1.2.0.tgz",
++++++++      "integrity": "sha512-5l4VyZR86LZ/lDxZTR6jqL8AFE2S0IFLMP26AbjsLVADxHdhB/c0GUsH+y39UfCi3dzz8OlQuPmnaJOMoDHQBA==",
++++++++      "dev": true,
++++++++      "funding": [
++++++++        {
++++++++          "type": "github",
++++++++          "url": "https://github.com/sponsors/feross"
++++++++        },
++++++++        {
++++++++          "type": "patreon",
++++++++          "url": "https://www.patreon.com/feross"
++++++++        },
++++++++        {
++++++++          "type": "consulting",
++++++++          "url": "https://feross.org/support"
++++++++        }
++++++++      ],
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "queue-microtask": "^1.2.2"
++++++++      }
++++++++    },
++++++++    "node_modules/rxjs": {
++++++++      "version": "7.8.2",
++++++++      "resolved": "https://registry.npmjs.org/rxjs/-/rxjs-7.8.2.tgz",
++++++++      "integrity": "sha512-dhKf903U/PQZY6boNNtAGdWbG85WAbjT/1xYoZIC7FAY0yWapOBQVsVrDl58W86//e1VpMNBtRV4MaXfdMySFA==",
++++++++      "dev": true,
++++++++      "license": "Apache-2.0",
++++++++      "dependencies": {
++++++++        "tslib": "^2.1.0"
++++++++      }
++++++++    },
++++++++    "node_modules/safe-buffer": {
++++++++      "version": "5.2.1",
++++++++      "resolved": "https://registry.npmjs.org/safe-buffer/-/safe-buffer-5.2.1.tgz",
++++++++      "integrity": "sha512-rp3So07KcdmmKbGvgaNxQSJr7bGVSVk5S9Eq1F+ppbRo70+YeaDxkw5Dd8NPN+GD6bjnYm2VuPuCXmpuYvmCXQ==",
++++++++      "funding": [
++++++++        {
++++++++          "type": "github",
++++++++          "url": "https://github.com/sponsors/feross"
++++++++        },
++++++++        {
++++++++          "type": "patreon",
++++++++          "url": "https://www.patreon.com/feross"
++++++++        },
++++++++        {
++++++++          "type": "consulting",
++++++++          "url": "https://feross.org/support"
++++++++        }
++++++++      ],
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/safer-buffer": {
++++++++      "version": "2.1.2",
++++++++      "resolved": "https://registry.npmjs.org/safer-buffer/-/safer-buffer-2.1.2.tgz",
++++++++      "integrity": "sha512-YZo3K82SD7Riyi0E1EQPojLz7kpepnSQI9IyPbHHg1XXXevb5dJI7tpyN2ADxGcQbHG7vcyRHk0cbwqcQriUtg==",
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/scheduler": {
++++++++      "version": "0.23.2",
++++++++      "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.23.2.tgz",
++++++++      "integrity": "sha512-UOShsPwz7NrMUqhR6t0hWjFduvOzbtv7toDH1/hIrfRNIDBnnBWd0CwJTGvTpngVlmwGCdP9/Zl/tVrDqcuYzQ==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "loose-envify": "^1.1.0"
++++++++      }
++++++++    },
++++++++    "node_modules/semver": {
++++++++      "version": "6.3.1",
++++++++      "resolved": "https://registry.npmjs.org/semver/-/semver-6.3.1.tgz",
++++++++      "integrity": "sha512-BR7VvDCVHO+q2xBEWskxS6DJE1qRnb7DxzUrogb71CWoSficBxYsiAGd+Kl0mmq/MprG9yArRkyrQxTO6XjMzA==",
++++++++      "dev": true,
++++++++      "license": "ISC",
++++++++      "bin": {
++++++++        "semver": "bin/semver.js"
++++++++      }
++++++++    },
++++++++    "node_modules/send": {
++++++++      "version": "0.19.2",
++++++++      "resolved": "https://registry.npmjs.org/send/-/send-0.19.2.tgz",
++++++++      "integrity": "sha512-VMbMxbDeehAxpOtWJXlcUS5E8iXh6QmN+BkRX1GARS3wRaXEEgzCcB10gTQazO42tpNIya8xIyNx8fll1OFPrg==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "debug": "2.6.9",
++++++++        "depd": "2.0.0",
++++++++        "destroy": "1.2.0",
++++++++        "encodeurl": "~2.0.0",
++++++++        "escape-html": "~1.0.3",
++++++++        "etag": "~1.8.1",
++++++++        "fresh": "~0.5.2",
++++++++        "http-errors": "~2.0.1",
++++++++        "mime": "1.6.0",
++++++++        "ms": "2.1.3",
++++++++        "on-finished": "~2.4.1",
++++++++        "range-parser": "~1.2.1",
++++++++        "statuses": "~2.0.2"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 0.8.0"
++++++++      }
++++++++    },
++++++++    "node_modules/send/node_modules/debug": {
++++++++      "version": "2.6.9",
++++++++      "resolved": "https://registry.npmjs.org/debug/-/debug-2.6.9.tgz",
++++++++      "integrity": "sha512-bC7ElrdJaJnPbAP+1EotYvqZsb3ecl5wi6Bfi6BJTUcNowp6cvspg0jXznRTKDjm/E7AdgFBVeAPVMNcKGsHMA==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "ms": "2.0.0"
++++++++      }
++++++++    },
++++++++    "node_modules/send/node_modules/debug/node_modules/ms": {
++++++++      "version": "2.0.0",
++++++++      "resolved": "https://registry.npmjs.org/ms/-/ms-2.0.0.tgz",
++++++++      "integrity": "sha512-Tpp60P6IUJDTuOq/5Z8cdskzJujfwqfOTkrwIwj7IRISpnkJnT6SyJ4PCPnGMoFjC9ddhal5KVIYtAt97ix05A==",
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/serve-static": {
++++++++      "version": "1.16.3",
++++++++      "resolved": "https://registry.npmjs.org/serve-static/-/serve-static-1.16.3.tgz",
++++++++      "integrity": "sha512-x0RTqQel6g5SY7Lg6ZreMmsOzncHFU7nhnRWkKgWuMTu5NN0DR5oruckMqRvacAN9d5w6ARnRBXl9xhDCgfMeA==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "encodeurl": "~2.0.0",
++++++++        "escape-html": "~1.0.3",
++++++++        "parseurl": "~1.3.3",
++++++++        "send": "~0.19.1"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 0.8.0"
++++++++      }
++++++++    },
++++++++    "node_modules/setprototypeof": {
++++++++      "version": "1.2.0",
++++++++      "resolved": "https://registry.npmjs.org/setprototypeof/-/setprototypeof-1.2.0.tgz",
++++++++      "integrity": "sha512-E5LDX7Wrp85Kil5bhZv46j8jOeboKq5JMmYM3gVGdGH8xFpPWXUMsNrlODCrkoxMEeNi/XZIwuRvY4XNwYMJpw==",
++++++++      "license": "ISC"
++++++++    },
++++++++    "node_modules/shell-quote": {
++++++++      "version": "1.9.0",
++++++++      "resolved": "https://registry.npmjs.org/shell-quote/-/shell-quote-1.9.0.tgz",
++++++++      "integrity": "sha512-Iov+JwFv/2HcTpcwNMKd8+IWNb8tboQJNQTkAY/LLVK7gGH9jy+LGkVqPxfekHl+yMmiqXszdGWXgkfml7hjqA==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 0.4"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://github.com/sponsors/ljharb"
++++++++      }
++++++++    },
++++++++    "node_modules/side-channel": {
++++++++      "version": "1.1.1",
++++++++      "resolved": "https://registry.npmjs.org/side-channel/-/side-channel-1.1.1.tgz",
++++++++      "integrity": "sha512-6x6dK6zJdpTzF4sQeNYxwtvBzf6Eg4GtlesS94HOvTudUeyK2WXAaIfmDgsyslYrRBeFIlsi54AYsFGUuhmvrQ==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "es-errors": "^1.3.0",
++++++++        "object-inspect": "^1.13.4",
++++++++        "side-channel-list": "^1.0.1",
++++++++        "side-channel-map": "^1.0.1",
++++++++        "side-channel-weakmap": "^1.0.2"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 0.4"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://github.com/sponsors/ljharb"
++++++++      }
++++++++    },
++++++++    "node_modules/side-channel-list": {
++++++++      "version": "1.0.1",
++++++++      "resolved": "https://registry.npmjs.org/side-channel-list/-/side-channel-list-1.0.1.tgz",
++++++++      "integrity": "sha512-mjn/0bi/oUURjc5Xl7IaWi/OJJJumuoJFQJfDDyO46+hBWsfaVM65TBHq2eoZBhzl9EchxOijpkbRC8SVBQU0w==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "es-errors": "^1.3.0",
++++++++        "object-inspect": "^1.13.4"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 0.4"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://github.com/sponsors/ljharb"
++++++++      }
++++++++    },
++++++++    "node_modules/side-channel-map": {
++++++++      "version": "1.0.1",
++++++++      "resolved": "https://registry.npmjs.org/side-channel-map/-/side-channel-map-1.0.1.tgz",
++++++++      "integrity": "sha512-VCjCNfgMsby3tTdo02nbjtM/ewra6jPHmpThenkTYh8pG9ucZ/1P8So4u4FGBek/BjpOVsDCMoLA/iuBKIFXRA==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "call-bound": "^1.0.2",
++++++++        "es-errors": "^1.3.0",
++++++++        "get-intrinsic": "^1.2.5",
++++++++        "object-inspect": "^1.13.3"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 0.4"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://github.com/sponsors/ljharb"
++++++++      }
++++++++    },
++++++++    "node_modules/side-channel-weakmap": {
++++++++      "version": "1.0.2",
++++++++      "resolved": "https://registry.npmjs.org/side-channel-weakmap/-/side-channel-weakmap-1.0.2.tgz",
++++++++      "integrity": "sha512-WPS/HvHQTYnHisLo9McqBHOJk2FkHO/tlpvldyrnem4aeQp4hai3gythswg6p01oSoTl58rcpiFAjF2br2Ak2A==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "call-bound": "^1.0.2",
++++++++        "es-errors": "^1.3.0",
++++++++        "get-intrinsic": "^1.2.5",
++++++++        "object-inspect": "^1.13.3",
++++++++        "side-channel-map": "^1.0.1"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 0.4"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://github.com/sponsors/ljharb"
++++++++      }
++++++++    },
++++++++    "node_modules/siginfo": {
++++++++      "version": "2.0.0",
++++++++      "resolved": "https://registry.npmjs.org/siginfo/-/siginfo-2.0.0.tgz",
++++++++      "integrity": "sha512-ybx0WO1/8bSBLEWXZvEd7gMW3Sn3JFlW3TvX1nREbDLRNQNaeNN8WK0meBwPdAaOI7TtRRRJn/Es1zhrrCHu7g==",
++++++++      "dev": true,
++++++++      "license": "ISC"
++++++++    },
++++++++    "node_modules/socket.io": {
++++++++      "version": "4.8.3",
++++++++      "resolved": "https://registry.npmjs.org/socket.io/-/socket.io-4.8.3.tgz",
++++++++      "integrity": "sha512-2Dd78bqzzjE6KPkD5fHZmDAKRNe3J15q+YHDrIsy9WEkqttc7GY+kT9OBLSMaPbQaEd0x1BjcmtMtXkfpc+T5A==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "accepts": "~1.3.4",
++++++++        "base64id": "~2.0.0",
++++++++        "cors": "~2.8.5",
++++++++        "debug": "~4.4.1",
++++++++        "engine.io": "~6.6.0",
++++++++        "socket.io-adapter": "~2.5.2",
++++++++        "socket.io-parser": "~4.2.4"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=10.2.0"
++++++++      }
++++++++    },
++++++++    "node_modules/socket.io-adapter": {
++++++++      "version": "2.5.8",
++++++++      "resolved": "https://registry.npmjs.org/socket.io-adapter/-/socket.io-adapter-2.5.8.tgz",
++++++++      "integrity": "sha512-6Oy52pbg+kvdCVvjcN+FnY7BvxZ7cIHNScbvztT/It5d0vbwoJoVZmF2gjJmnV0/4WlXRfG15zc45ySk9Ah8bw==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "debug": "~4.4.1",
++++++++        "ws": "~8.21.0"
++++++++      }
++++++++    },
++++++++    "node_modules/socket.io-client": {
++++++++      "version": "4.8.3",
++++++++      "resolved": "https://registry.npmjs.org/socket.io-client/-/socket.io-client-4.8.3.tgz",
++++++++      "integrity": "sha512-uP0bpjWrjQmUt5DTHq9RuoCBdFJF10cdX9X+a368j/Ft0wmaVgxlrjvK3kjvgCODOMMOz9lcaRzxmso0bTWZ/g==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@socket.io/component-emitter": "~3.1.0",
++++++++        "debug": "~4.4.1",
++++++++        "engine.io-client": "~6.6.1",
++++++++        "socket.io-parser": "~4.2.4"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=10.0.0"
++++++++      }
++++++++    },
++++++++    "node_modules/socket.io-parser": {
++++++++      "version": "4.2.7",
++++++++      "resolved": "https://registry.npmjs.org/socket.io-parser/-/socket.io-parser-4.2.7.tgz",
++++++++      "integrity": "sha512-IH/iSeO9T6gz1KkFleGDWkG9N3dl4jXVYUtMhIqH10Md0ttMer8nUNWiP1DKuNrybD2xBrixLJdCC9J6ECoYkg==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@socket.io/component-emitter": "~3.1.0",
++++++++        "debug": "~4.4.1"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=10.0.0"
++++++++      }
++++++++    },
++++++++    "node_modules/source-map-js": {
++++++++      "version": "1.2.1",
++++++++      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz",
++++++++      "integrity": "sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==",
++++++++      "dev": true,
++++++++      "license": "BSD-3-Clause",
++++++++      "engines": {
++++++++        "node": ">=0.10.0"
++++++++      }
++++++++    },
++++++++    "node_modules/stackback": {
++++++++      "version": "0.0.2",
++++++++      "resolved": "https://registry.npmjs.org/stackback/-/stackback-0.0.2.tgz",
++++++++      "integrity": "sha512-1XMJE5fQo1jGH6Y/7ebnwPOBEkIEnT4QF32d5R1+VXdXveM0IBMJt8zfaxX1P3QhVwrYe+576+jkANtSS2mBbw==",
++++++++      "dev": true,
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/statuses": {
++++++++      "version": "2.0.2",
++++++++      "resolved": "https://registry.npmjs.org/statuses/-/statuses-2.0.2.tgz",
++++++++      "integrity": "sha512-DvEy55V3DB7uknRo+4iOGT5fP1slR8wQohVdknigZPMpMstaKJQWhwiYBACJE3Ul2pTnATihhBYnRhZQHGBiRw==",
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 0.8"
++++++++      }
++++++++    },
++++++++    "node_modules/std-env": {
++++++++      "version": "3.10.0",
++++++++      "resolved": "https://registry.npmjs.org/std-env/-/std-env-3.10.0.tgz",
++++++++      "integrity": "sha512-5GS12FdOZNliM5mAOxFRg7Ir0pWz8MdpYm6AY6VPkGpbA7ZzmbzNcBJQ0GPvvyWgcY7QAhCgf9Uy89I03faLkg==",
++++++++      "dev": true,
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/string-width": {
++++++++      "version": "4.2.3",
++++++++      "resolved": "https://registry.npmjs.org/string-width/-/string-width-4.2.3.tgz",
++++++++      "integrity": "sha512-wKyQRQpjJ0sIp62ErSZdGsjMJWsap5oRNihHhu6G7JVO/9jIB6UyevL+tXuOqrng8j/cxKTWyWUwvSTriiZz/g==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "emoji-regex": "^8.0.0",
++++++++        "is-fullwidth-code-point": "^3.0.0",
++++++++        "strip-ansi": "^6.0.1"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=8"
++++++++      }
++++++++    },
++++++++    "node_modules/strip-ansi": {
++++++++      "version": "6.0.1",
++++++++      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-6.0.1.tgz",
++++++++      "integrity": "sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "ansi-regex": "^5.0.1"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=8"
++++++++      }
++++++++    },
++++++++    "node_modules/strip-literal": {
++++++++      "version": "3.1.0",
++++++++      "resolved": "https://registry.npmjs.org/strip-literal/-/strip-literal-3.1.0.tgz",
++++++++      "integrity": "sha512-8r3mkIM/2+PpjHoOtiAW8Rg3jJLHaV7xPwG+YRGrv6FP0wwk/toTpATxWYOW0BKdWwl82VT2tFYi5DlROa0Mxg==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "js-tokens": "^9.0.1"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://github.com/sponsors/antfu"
++++++++      }
++++++++    },
++++++++    "node_modules/strip-literal/node_modules/js-tokens": {
++++++++      "version": "9.0.1",
++++++++      "resolved": "https://registry.npmjs.org/js-tokens/-/js-tokens-9.0.1.tgz",
++++++++      "integrity": "sha512-mxa9E9ITFOt0ban3j6L5MpjwegGz6lBQmM1IJkWeBZGcMxto50+eWdjC/52xDbS2vy0k7vIMK0Fe2wfL9OQSpQ==",
++++++++      "dev": true,
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/sucrase": {
++++++++      "version": "3.35.1",
++++++++      "resolved": "https://registry.npmjs.org/sucrase/-/sucrase-3.35.1.tgz",
++++++++      "integrity": "sha512-DhuTmvZWux4H1UOnWMB3sk0sbaCVOoQZjv8u1rDoTV0HTdGem9hkAZtl4JZy8P2z4Bg0nT+YMeOFyVr4zcG5Tw==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@jridgewell/gen-mapping": "^0.3.2",
++++++++        "commander": "^4.0.0",
++++++++        "lines-and-columns": "^1.1.6",
++++++++        "mz": "^2.7.0",
++++++++        "pirates": "^4.0.1",
++++++++        "tinyglobby": "^0.2.11",
++++++++        "ts-interface-checker": "^0.1.9"
++++++++      },
++++++++      "bin": {
++++++++        "sucrase": "bin/sucrase",
++++++++        "sucrase-node": "bin/sucrase-node"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=16 || 14 >=14.17"
++++++++      }
++++++++    },
++++++++    "node_modules/supports-color": {
++++++++      "version": "8.1.1",
++++++++      "resolved": "https://registry.npmjs.org/supports-color/-/supports-color-8.1.1.tgz",
++++++++      "integrity": "sha512-MpUEN2OodtUzxvKQl72cUF7RQ5EiHsGvSsVG0ia9c5RbWGL2CI4C7EpPS8UTBIplnlzZiNuV56w+FuNxy3ty2Q==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "has-flag": "^4.0.0"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=10"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://github.com/chalk/supports-color?sponsor=1"
++++++++      }
++++++++    },
++++++++    "node_modules/supports-preserve-symlinks-flag": {
++++++++      "version": "1.0.0",
++++++++      "resolved": "https://registry.npmjs.org/supports-preserve-symlinks-flag/-/supports-preserve-symlinks-flag-1.0.0.tgz",
++++++++      "integrity": "sha512-ot0WnXS9fgdkgIcePe6RHNk1WA8+muPa6cSjeR3V8K27q9BB1rTE3R1p7Hv0z1ZyAc8s6Vvv8DIyWf681MAt0w==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 0.4"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://github.com/sponsors/ljharb"
++++++++      }
++++++++    },
++++++++    "node_modules/tailwind-merge": {
++++++++      "version": "3.6.0",
++++++++      "resolved": "https://registry.npmjs.org/tailwind-merge/-/tailwind-merge-3.6.0.tgz",
++++++++      "integrity": "sha512-uxL7qAVQriqRQPAyK3pj66VqskWqoZ37PW94jwOTwNfq/z9oyu1V+eqrZqtR2+fCiXdYOZe/Modt8GtvqNzu+w==",
++++++++      "license": "MIT",
++++++++      "funding": {
++++++++        "type": "github",
++++++++        "url": "https://github.com/sponsors/dcastil"
++++++++      }
++++++++    },
++++++++    "node_modules/tailwindcss": {
++++++++      "version": "3.4.19",
++++++++      "resolved": "https://registry.npmjs.org/tailwindcss/-/tailwindcss-3.4.19.tgz",
++++++++      "integrity": "sha512-3ofp+LL8E+pK/JuPLPggVAIaEuhvIz4qNcf3nA1Xn2o/7fb7s/TYpHhwGDv1ZU3PkBluUVaF8PyCHcm48cKLWQ==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@alloc/quick-lru": "^5.2.0",
++++++++        "arg": "^5.0.2",
++++++++        "chokidar": "^3.6.0",
++++++++        "didyoumean": "^1.2.2",
++++++++        "dlv": "^1.1.3",
++++++++        "fast-glob": "^3.3.2",
++++++++        "glob-parent": "^6.0.2",
++++++++        "is-glob": "^4.0.3",
++++++++        "jiti": "^1.21.7",
++++++++        "lilconfig": "^3.1.3",
++++++++        "micromatch": "^4.0.8",
++++++++        "normalize-path": "^3.0.0",
++++++++        "object-hash": "^3.0.0",
++++++++        "picocolors": "^1.1.1",
++++++++        "postcss": "^8.4.47",
++++++++        "postcss-import": "^15.1.0",
++++++++        "postcss-js": "^4.0.1",
++++++++        "postcss-load-config": "^4.0.2 || ^5.0 || ^6.0",
++++++++        "postcss-nested": "^6.2.0",
++++++++        "postcss-selector-parser": "^6.1.2",
++++++++        "resolve": "^1.22.8",
++++++++        "sucrase": "^3.35.0"
++++++++      },
++++++++      "bin": {
++++++++        "tailwind": "lib/cli.js",
++++++++        "tailwindcss": "lib/cli.js"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=14.0.0"
++++++++      }
++++++++    },
++++++++    "node_modules/thenify": {
++++++++      "version": "3.3.1",
++++++++      "resolved": "https://registry.npmjs.org/thenify/-/thenify-3.3.1.tgz",
++++++++      "integrity": "sha512-RVZSIV5IG10Hk3enotrhvz0T9em6cyHBLkH/YAZuKqd8hRkKhSfCGIcP2KUY0EPxndzANBmNllzWPwak+bheSw==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "any-promise": "^1.0.0"
++++++++      }
++++++++    },
++++++++    "node_modules/thenify-all": {
++++++++      "version": "1.6.0",
++++++++      "resolved": "https://registry.npmjs.org/thenify-all/-/thenify-all-1.6.0.tgz",
++++++++      "integrity": "sha512-RNxQH/qI8/t3thXJDwcstUO4zeqo64+Uy/+sNVRBx4Xn2OX+OZ9oP+iJnNFqplFra2ZUVeKCSa2oVWi3T4uVmA==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "thenify": ">= 3.1.0 < 4"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=0.8"
++++++++      }
++++++++    },
++++++++    "node_modules/tinybench": {
++++++++      "version": "2.9.0",
++++++++      "resolved": "https://registry.npmjs.org/tinybench/-/tinybench-2.9.0.tgz",
++++++++      "integrity": "sha512-0+DUvqWMValLmha6lr4kD8iAMK1HzV0/aKnCtWb9v9641TnP/MFb7Pc2bxoxQjTXAErryXVgUOfv2YqNllqGeg==",
++++++++      "dev": true,
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/tinyexec": {
++++++++      "version": "0.3.2",
++++++++      "resolved": "https://registry.npmjs.org/tinyexec/-/tinyexec-0.3.2.tgz",
++++++++      "integrity": "sha512-KQQR9yN7R5+OSwaK0XQoj22pwHoTlgYqmUscPYoknOoWCWfj/5/ABTMRi69FrKU5ffPVh5QcFikpWJI/P1ocHA==",
++++++++      "dev": true,
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/tinyglobby": {
++++++++      "version": "0.2.17",
++++++++      "resolved": "https://registry.npmjs.org/tinyglobby/-/tinyglobby-0.2.17.tgz",
++++++++      "integrity": "sha512-wXR/dYpcqKmfWpEdZjiKJOwCNFndD0DMnrW/cYjVGttEkBfVgcLFHoNrlj47mjOVic9yyNu65alsgF4NQyTa2g==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "fdir": "^6.5.0",
++++++++        "picomatch": "^4.0.4"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=12.0.0"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://github.com/sponsors/SuperchupuDev"
++++++++      }
++++++++    },
++++++++    "node_modules/tinyglobby/node_modules/fdir": {
++++++++      "version": "6.5.0",
++++++++      "resolved": "https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz",
++++++++      "integrity": "sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=12.0.0"
++++++++      },
++++++++      "peerDependencies": {
++++++++        "picomatch": "^3 || ^4"
++++++++      },
++++++++      "peerDependenciesMeta": {
++++++++        "picomatch": {
++++++++          "optional": true
++++++++        }
++++++++      }
++++++++    },
++++++++    "node_modules/tinyglobby/node_modules/picomatch": {
++++++++      "version": "4.0.7",
++++++++      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.7.tgz",
++++++++      "integrity": "sha512-qcJu88Q2IWqJsDD529JKMdwGm/dvInW4HvQnRwiH9JtihJvzGOscDtHE3x1pBKeUOTysQ8kVmLnJ2kJu7yhcGA==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=12"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://github.com/sponsors/jonschlinkert"
++++++++      }
++++++++    },
++++++++    "node_modules/tinypool": {
++++++++      "version": "1.1.1",
++++++++      "resolved": "https://registry.npmjs.org/tinypool/-/tinypool-1.1.1.tgz",
++++++++      "integrity": "sha512-Zba82s87IFq9A9XmjiX5uZA/ARWDrB03OHlq+Vw1fSdt0I+4/Kutwy8BP4Y/y/aORMo61FQ0vIb5j44vSo5Pkg==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": "^18.0.0 || >=20.0.0"
++++++++      }
++++++++    },
++++++++    "node_modules/tinyrainbow": {
++++++++      "version": "2.0.0",
++++++++      "resolved": "https://registry.npmjs.org/tinyrainbow/-/tinyrainbow-2.0.0.tgz",
++++++++      "integrity": "sha512-op4nsTR47R6p0vMUUoYl/a+ljLFVtlfaXkLQmqfLR1qHma1h/ysYk4hEXZ880bf2CYgTskvTa/e196Vd5dDQXw==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=14.0.0"
++++++++      }
++++++++    },
++++++++    "node_modules/tinyspy": {
++++++++      "version": "4.0.4",
++++++++      "resolved": "https://registry.npmjs.org/tinyspy/-/tinyspy-4.0.4.tgz",
++++++++      "integrity": "sha512-azl+t0z7pw/z958Gy9svOTuzqIk6xq+NSheJzn5MMWtWTFywIacg2wUlzKFGtt3cthx0r2SxMK0yzJOR0IES7Q==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=14.0.0"
++++++++      }
++++++++    },
++++++++    "node_modules/to-regex-range": {
++++++++      "version": "5.0.1",
++++++++      "resolved": "https://registry.npmjs.org/to-regex-range/-/to-regex-range-5.0.1.tgz",
++++++++      "integrity": "sha512-65P7iz6X5yEr1cwcgvQxbbIw7Uk3gOy5dIdtZ4rDveLqhrdJP+Li/Hx6tyK0NEb+2GCyneCMJiGqrADCSNk8sQ==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "is-number": "^7.0.0"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=8.0"
++++++++      }
++++++++    },
++++++++    "node_modules/toidentifier": {
++++++++      "version": "1.0.1",
++++++++      "resolved": "https://registry.npmjs.org/toidentifier/-/toidentifier-1.0.1.tgz",
++++++++      "integrity": "sha512-o5sSPKEkg/DIQNmH43V0/uerLrpzVedkUh8tGNvaeXpfpuwjKenlSox/2O/BTlZUtEe+JG7s5YhEz608PlAHRA==",
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=0.6"
++++++++      }
++++++++    },
++++++++    "node_modules/tree-kill": {
++++++++      "version": "1.2.2",
++++++++      "resolved": "https://registry.npmjs.org/tree-kill/-/tree-kill-1.2.2.tgz",
++++++++      "integrity": "sha512-L0Orpi8qGpRG//Nd+H90vFB+3iHnue1zSSGmNOOCh1GLJ7rUKVwV2HvijphGQS2UmhUZewS9VgvxYIdgr+fG1A==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "bin": {
++++++++        "tree-kill": "cli.js"
++++++++      }
++++++++    },
++++++++    "node_modules/ts-interface-checker": {
++++++++      "version": "0.1.13",
++++++++      "resolved": "https://registry.npmjs.org/ts-interface-checker/-/ts-interface-checker-0.1.13.tgz",
++++++++      "integrity": "sha512-Y/arvbn+rrz3JCKl9C4kVNfTfSm2/mEp5FSz5EsZSANGPSlQrpRI5M4PKF+mJnE52jOO90PnPSc3Ur3bTQw0gA==",
++++++++      "dev": true,
++++++++      "license": "Apache-2.0"
++++++++    },
++++++++    "node_modules/tslib": {
++++++++      "version": "2.8.1",
++++++++      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",
++++++++      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",
++++++++      "license": "0BSD"
++++++++    },
++++++++    "node_modules/tsx": {
++++++++      "version": "4.23.13",
++++++++      "resolved": "https://registry.npmjs.org/tsx/-/tsx-4.23.13.tgz",
++++++++      "integrity": "sha512-BL5MGkRln6aDYhb0xbQlEAGw743BaZYWdbWtdJOBriYJboKgUUYCadFp2/FpBBZquBC/ezNBn7wMMPx7FDZUDw==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "esbuild": "~0.28.0"
++++++++      },
++++++++      "bin": {
++++++++        "tsx": "dist/cli.mjs"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=18.0.0"
++++++++      },
++++++++      "optionalDependencies": {
++++++++        "fsevents": "~2.3.3"
++++++++      }
++++++++    },
++++++++    "node_modules/type-is": {
++++++++      "version": "1.6.18",
++++++++      "resolved": "https://registry.npmjs.org/type-is/-/type-is-1.6.18.tgz",
++++++++      "integrity": "sha512-TkRKr9sUTxEH8MdfuCSP7VizJyzRNMjj2J2do2Jr3Kym598JVdEksuzPQCnlFPW4ky9Q+iA+ma9BGm06XQBy8g==",
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "media-typer": "0.3.0",
++++++++        "mime-types": "~2.1.24"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">= 0.6"
++++++++      }
++++++++    },
++++++++    "node_modules/typescript": {
++++++++      "version": "5.9.3",
++++++++      "resolved": "https://registry.npmjs.org/typescript/-/typescript-5.9.3.tgz",
++++++++      "integrity": "sha512-jl1vZzPDinLr9eUt3J/t7V6FgNEw9QjvBPdysz9KfQDD41fQrC2Y4vKQdiaUpFT4bXlb1RHhLpp8wtm6M5TgSw==",
++++++++      "dev": true,
++++++++      "license": "Apache-2.0",
++++++++      "bin": {
++++++++        "tsc": "bin/tsc",
++++++++        "tsserver": "bin/tsserver"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=14.17"
++++++++      }
++++++++    },
++++++++    "node_modules/undici-types": {
++++++++      "version": "6.21.0",
++++++++      "resolved": "https://registry.npmjs.org/undici-types/-/undici-types-6.21.0.tgz",
++++++++      "integrity": "sha512-iwDZqg0QAGrg9Rav5H4n0M64c3mkR59cJ6wQp+7C4nI0gsmExaedaYLNO44eT4AtBBwjbTiGPMlt2Md0T9H9JQ==",
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/unpipe": {
++++++++      "version": "1.0.0",
++++++++      "resolved": "https://registry.npmjs.org/unpipe/-/unpipe-1.0.0.tgz",
++++++++      "integrity": "sha512-pjy2bYhSsufwWlKwPc+l3cN7+wuJlK6uz0YdJEOlQDbl6jo/YlPi4mb8agUkVC8BF7V8NuzeyPNqRksA3hztKQ==",
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 0.8"
++++++++      }
++++++++    },
++++++++    "node_modules/update-browserslist-db": {
++++++++      "version": "1.3.2",
++++++++      "resolved": "https://registry.npmjs.org/update-browserslist-db/-/update-browserslist-db-1.3.2.tgz",
++++++++      "integrity": "sha512-UQ+MSxlhRm1bzjhU+DcuXfjFO1FzNtqhK5+9Yvlp90ItDLk5vT932A0rFu619nf7RVS+Y/VeaUW1jaRDqZ8VJw==",
++++++++      "dev": true,
++++++++      "funding": [
++++++++        {
++++++++          "type": "opencollective",
++++++++          "url": "https://opencollective.com/browserslist"
++++++++        },
++++++++        {
++++++++          "type": "tidelift",
++++++++          "url": "https://tidelift.com/funding/github/npm/browserslist"
++++++++        },
++++++++        {
++++++++          "type": "github",
++++++++          "url": "https://github.com/sponsors/ai"
++++++++        }
++++++++      ],
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "escalade": "^3.2.0",
++++++++        "picocolors": "^1.1.1"
++++++++      },
++++++++      "bin": {
++++++++        "update-browserslist-db": "cli.js"
++++++++      },
++++++++      "peerDependencies": {
++++++++        "browserslist": ">= 4.21.0"
++++++++      }
++++++++    },
++++++++    "node_modules/util-deprecate": {
++++++++      "version": "1.0.2",
++++++++      "resolved": "https://registry.npmjs.org/util-deprecate/-/util-deprecate-1.0.2.tgz",
++++++++      "integrity": "sha512-EPD5q1uXyFxJpCrLnCc1nHnq3gOa6DZBocAIiI2TaSCA7VCJ1UJDMagCzIkXNsUYfD1daK//LTEQ8xiIbrHtcw==",
++++++++      "dev": true,
++++++++      "license": "MIT"
++++++++    },
++++++++    "node_modules/utils-merge": {
++++++++      "version": "1.0.1",
++++++++      "resolved": "https://registry.npmjs.org/utils-merge/-/utils-merge-1.0.1.tgz",
++++++++      "integrity": "sha512-pMZTvIkT1d+TFGvDOqodOclx0QWkkgi6Tdoa8gC8ffGAAqz9pzPTZWAybbsHHoED/ztMtkv/VoYTYyShUn81hA==",
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 0.4.0"
++++++++      }
++++++++    },
++++++++    "node_modules/vary": {
++++++++      "version": "1.1.2",
++++++++      "resolved": "https://registry.npmjs.org/vary/-/vary-1.1.2.tgz",
++++++++      "integrity": "sha512-BNGbWLfd0eUPabhkXUVm0j8uuvREyTh5ovRa/dyow/BqAbZJyC+5fU+IzQOzmAKzYqYRAISoRhdQr3eIZ/PXqg==",
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">= 0.8"
++++++++      }
++++++++    },
++++++++    "node_modules/vite": {
++++++++      "version": "6.4.3",
++++++++      "resolved": "https://registry.npmjs.org/vite/-/vite-6.4.3.tgz",
++++++++      "integrity": "sha512-NTKlcQjlAK7MlQoyb6LgaqHc8sso/pVyUJYWMws3jg21uTJw/LddqIFPcPqP6PzpgbIcZyKI85sFE4HBrQDA8A==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "esbuild": "^0.25.0",
++++++++        "fdir": "^6.4.4",
++++++++        "picomatch": "^4.0.2",
++++++++        "postcss": "^8.5.3",
++++++++        "rollup": "^4.34.9",
++++++++        "tinyglobby": "^0.2.13"
++++++++      },
++++++++      "bin": {
++++++++        "vite": "bin/vite.js"
++++++++      },
++++++++      "engines": {
++++++++        "node": "^18.0.0 || ^20.0.0 || >=22.0.0"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://github.com/vitejs/vite?sponsor=1"
++++++++      },
++++++++      "optionalDependencies": {
++++++++        "fsevents": "~2.3.3"
++++++++      },
++++++++      "peerDependencies": {
++++++++        "@types/node": "^18.0.0 || ^20.0.0 || >=22.0.0",
++++++++        "jiti": ">=1.21.0",
++++++++        "less": "*",
++++++++        "lightningcss": "^1.21.0",
++++++++        "sass": "*",
++++++++        "sass-embedded": "*",
++++++++        "stylus": "*",
++++++++        "sugarss": "*",
++++++++        "terser": "^5.16.0",
++++++++        "tsx": "^4.8.1",
++++++++        "yaml": "^2.4.2"
++++++++      },
++++++++      "peerDependenciesMeta": {
++++++++        "@types/node": {
++++++++          "optional": true
++++++++        },
++++++++        "jiti": {
++++++++          "optional": true
++++++++        },
++++++++        "less": {
++++++++          "optional": true
++++++++        },
++++++++        "lightningcss": {
++++++++          "optional": true
++++++++        },
++++++++        "sass": {
++++++++          "optional": true
++++++++        },
++++++++        "sass-embedded": {
++++++++          "optional": true
++++++++        },
++++++++        "stylus": {
++++++++          "optional": true
++++++++        },
++++++++        "sugarss": {
++++++++          "optional": true
++++++++        },
++++++++        "terser": {
++++++++          "optional": true
++++++++        },
++++++++        "tsx": {
++++++++          "optional": true
++++++++        },
++++++++        "yaml": {
++++++++          "optional": true
++++++++        }
++++++++      }
++++++++    },
++++++++    "node_modules/vite-node": {
++++++++      "version": "3.2.4",
++++++++      "resolved": "https://registry.npmjs.org/vite-node/-/vite-node-3.2.4.tgz",
++++++++      "integrity": "sha512-EbKSKh+bh1E1IFxeO0pg1n4dvoOTt0UDiXMd/qn++r98+jPO1xtJilvXldeuQ8giIB5IkpjCgMleHMNEsGH6pg==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "cac": "^6.7.14",
++++++++        "debug": "^4.4.1",
++++++++        "es-module-lexer": "^1.7.0",
++++++++        "pathe": "^2.0.3",
++++++++        "vite": "^5.0.0 || ^6.0.0 || ^7.0.0-0"
++++++++      },
++++++++      "bin": {
++++++++        "vite-node": "vite-node.mjs"
++++++++      },
++++++++      "engines": {
++++++++        "node": "^18.0.0 || ^20.0.0 || >=22.0.0"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://opencollective.com/vitest"
++++++++      }
++++++++    },
++++++++    "node_modules/vite/node_modules/@esbuild/aix-ppc64": {
++++++++      "version": "0.25.12",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.25.12.tgz",
++++++++      "integrity": "sha512-Hhmwd6CInZ3dwpuGTF8fJG6yoWmsToE+vYgD4nytZVxcu1ulHpUQRAB1UJ8+N1Am3Mz4+xOByoQoSZf4D+CpkA==",
++++++++      "cpu": [
++++++++        "ppc64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "aix"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/vite/node_modules/@esbuild/android-arm": {
++++++++      "version": "0.25.12",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.25.12.tgz",
++++++++      "integrity": "sha512-VJ+sKvNA/GE7Ccacc9Cha7bpS8nyzVv0jdVgwNDaR4gDMC/2TTRc33Ip8qrNYUcpkOHUT5OZ0bUcNNVZQ9RLlg==",
++++++++      "cpu": [
++++++++        "arm"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "android"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/vite/node_modules/@esbuild/android-arm64": {
++++++++      "version": "0.25.12",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.25.12.tgz",
++++++++      "integrity": "sha512-6AAmLG7zwD1Z159jCKPvAxZd4y/VTO0VkprYy+3N2FtJ8+BQWFXU+OxARIwA46c5tdD9SsKGZ/1ocqBS/gAKHg==",
++++++++      "cpu": [
++++++++        "arm64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "android"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/vite/node_modules/@esbuild/android-x64": {
++++++++      "version": "0.25.12",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.25.12.tgz",
++++++++      "integrity": "sha512-5jbb+2hhDHx5phYR2By8GTWEzn6I9UqR11Kwf22iKbNpYrsmRB18aX/9ivc5cabcUiAT/wM+YIZ6SG9QO6a8kg==",
++++++++      "cpu": [
++++++++        "x64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "android"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/vite/node_modules/@esbuild/darwin-arm64": {
++++++++      "version": "0.25.12",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.25.12.tgz",
++++++++      "integrity": "sha512-N3zl+lxHCifgIlcMUP5016ESkeQjLj/959RxxNYIthIg+CQHInujFuXeWbWMgnTo4cp5XVHqFPmpyu9J65C1Yg==",
++++++++      "cpu": [
++++++++        "arm64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "darwin"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/vite/node_modules/@esbuild/darwin-x64": {
++++++++      "version": "0.25.12",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.25.12.tgz",
++++++++      "integrity": "sha512-HQ9ka4Kx21qHXwtlTUVbKJOAnmG1ipXhdWTmNXiPzPfWKpXqASVcWdnf2bnL73wgjNrFXAa3yYvBSd9pzfEIpA==",
++++++++      "cpu": [
++++++++        "x64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "darwin"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/vite/node_modules/@esbuild/freebsd-arm64": {
++++++++      "version": "0.25.12",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.25.12.tgz",
++++++++      "integrity": "sha512-gA0Bx759+7Jve03K1S0vkOu5Lg/85dou3EseOGUes8flVOGxbhDDh/iZaoek11Y8mtyKPGF3vP8XhnkDEAmzeg==",
++++++++      "cpu": [
++++++++        "arm64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "freebsd"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/vite/node_modules/@esbuild/freebsd-x64": {
++++++++      "version": "0.25.12",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.25.12.tgz",
++++++++      "integrity": "sha512-TGbO26Yw2xsHzxtbVFGEXBFH0FRAP7gtcPE7P5yP7wGy7cXK2oO7RyOhL5NLiqTlBh47XhmIUXuGciXEqYFfBQ==",
++++++++      "cpu": [
++++++++        "x64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "freebsd"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/vite/node_modules/@esbuild/linux-arm": {
++++++++      "version": "0.25.12",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.25.12.tgz",
++++++++      "integrity": "sha512-lPDGyC1JPDou8kGcywY0YILzWlhhnRjdof3UlcoqYmS9El818LLfJJc3PXXgZHrHCAKs/Z2SeZtDJr5MrkxtOw==",
++++++++      "cpu": [
++++++++        "arm"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "linux"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/vite/node_modules/@esbuild/linux-arm64": {
++++++++      "version": "0.25.12",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.25.12.tgz",
++++++++      "integrity": "sha512-8bwX7a8FghIgrupcxb4aUmYDLp8pX06rGh5HqDT7bB+8Rdells6mHvrFHHW2JAOPZUbnjUpKTLg6ECyzvas2AQ==",
++++++++      "cpu": [
++++++++        "arm64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "linux"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/vite/node_modules/@esbuild/linux-ia32": {
++++++++      "version": "0.25.12",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.25.12.tgz",
++++++++      "integrity": "sha512-0y9KrdVnbMM2/vG8KfU0byhUN+EFCny9+8g202gYqSSVMonbsCfLjUO+rCci7pM0WBEtz+oK/PIwHkzxkyharA==",
++++++++      "cpu": [
++++++++        "ia32"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "linux"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/vite/node_modules/@esbuild/linux-loong64": {
++++++++      "version": "0.25.12",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.25.12.tgz",
++++++++      "integrity": "sha512-h///Lr5a9rib/v1GGqXVGzjL4TMvVTv+s1DPoxQdz7l/AYv6LDSxdIwzxkrPW438oUXiDtwM10o9PmwS/6Z0Ng==",
++++++++      "cpu": [
++++++++        "loong64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "linux"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/vite/node_modules/@esbuild/linux-mips64el": {
++++++++      "version": "0.25.12",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.25.12.tgz",
++++++++      "integrity": "sha512-iyRrM1Pzy9GFMDLsXn1iHUm18nhKnNMWscjmp4+hpafcZjrr2WbT//d20xaGljXDBYHqRcl8HnxbX6uaA/eGVw==",
++++++++      "cpu": [
++++++++        "mips64el"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "linux"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/vite/node_modules/@esbuild/linux-ppc64": {
++++++++      "version": "0.25.12",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.25.12.tgz",
++++++++      "integrity": "sha512-9meM/lRXxMi5PSUqEXRCtVjEZBGwB7P/D4yT8UG/mwIdze2aV4Vo6U5gD3+RsoHXKkHCfSxZKzmDssVlRj1QQA==",
++++++++      "cpu": [
++++++++        "ppc64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "linux"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/vite/node_modules/@esbuild/linux-riscv64": {
++++++++      "version": "0.25.12",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.25.12.tgz",
++++++++      "integrity": "sha512-Zr7KR4hgKUpWAwb1f3o5ygT04MzqVrGEGXGLnj15YQDJErYu/BGg+wmFlIDOdJp0PmB0lLvxFIOXZgFRrdjR0w==",
++++++++      "cpu": [
++++++++        "riscv64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "linux"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/vite/node_modules/@esbuild/linux-s390x": {
++++++++      "version": "0.25.12",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.25.12.tgz",
++++++++      "integrity": "sha512-MsKncOcgTNvdtiISc/jZs/Zf8d0cl/t3gYWX8J9ubBnVOwlk65UIEEvgBORTiljloIWnBzLs4qhzPkJcitIzIg==",
++++++++      "cpu": [
++++++++        "s390x"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "linux"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/vite/node_modules/@esbuild/linux-x64": {
++++++++      "version": "0.25.12",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.25.12.tgz",
++++++++      "integrity": "sha512-uqZMTLr/zR/ed4jIGnwSLkaHmPjOjJvnm6TVVitAa08SLS9Z0VM8wIRx7gWbJB5/J54YuIMInDquWyYvQLZkgw==",
++++++++      "cpu": [
++++++++        "x64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "linux"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/vite/node_modules/@esbuild/netbsd-arm64": {
++++++++      "version": "0.25.12",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-arm64/-/netbsd-arm64-0.25.12.tgz",
++++++++      "integrity": "sha512-xXwcTq4GhRM7J9A8Gv5boanHhRa/Q9KLVmcyXHCTaM4wKfIpWkdXiMog/KsnxzJ0A1+nD+zoecuzqPmCRyBGjg==",
++++++++      "cpu": [
++++++++        "arm64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "netbsd"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/vite/node_modules/@esbuild/netbsd-x64": {
++++++++      "version": "0.25.12",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.25.12.tgz",
++++++++      "integrity": "sha512-Ld5pTlzPy3YwGec4OuHh1aCVCRvOXdH8DgRjfDy/oumVovmuSzWfnSJg+VtakB9Cm0gxNO9BzWkj6mtO1FMXkQ==",
++++++++      "cpu": [
++++++++        "x64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "netbsd"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/vite/node_modules/@esbuild/openbsd-arm64": {
++++++++      "version": "0.25.12",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-arm64/-/openbsd-arm64-0.25.12.tgz",
++++++++      "integrity": "sha512-fF96T6KsBo/pkQI950FARU9apGNTSlZGsv1jZBAlcLL1MLjLNIWPBkj5NlSz8aAzYKg+eNqknrUJ24QBybeR5A==",
++++++++      "cpu": [
++++++++        "arm64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "openbsd"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/vite/node_modules/@esbuild/openbsd-x64": {
++++++++      "version": "0.25.12",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.25.12.tgz",
++++++++      "integrity": "sha512-MZyXUkZHjQxUvzK7rN8DJ3SRmrVrke8ZyRusHlP+kuwqTcfWLyqMOE3sScPPyeIXN/mDJIfGXvcMqCgYKekoQw==",
++++++++      "cpu": [
++++++++        "x64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "openbsd"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/vite/node_modules/@esbuild/openharmony-arm64": {
++++++++      "version": "0.25.12",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/openharmony-arm64/-/openharmony-arm64-0.25.12.tgz",
++++++++      "integrity": "sha512-rm0YWsqUSRrjncSXGA7Zv78Nbnw4XL6/dzr20cyrQf7ZmRcsovpcRBdhD43Nuk3y7XIoW2OxMVvwuRvk9XdASg==",
++++++++      "cpu": [
++++++++        "arm64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "openharmony"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/vite/node_modules/@esbuild/sunos-x64": {
++++++++      "version": "0.25.12",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.25.12.tgz",
++++++++      "integrity": "sha512-3wGSCDyuTHQUzt0nV7bocDy72r2lI33QL3gkDNGkod22EsYl04sMf0qLb8luNKTOmgF/eDEDP5BFNwoBKH441w==",
++++++++      "cpu": [
++++++++        "x64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "sunos"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/vite/node_modules/@esbuild/win32-arm64": {
++++++++      "version": "0.25.12",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.25.12.tgz",
++++++++      "integrity": "sha512-rMmLrur64A7+DKlnSuwqUdRKyd3UE7oPJZmnljqEptesKM8wx9J8gx5u0+9Pq0fQQW8vqeKebwNXdfOyP+8Bsg==",
++++++++      "cpu": [
++++++++        "arm64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "win32"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/vite/node_modules/@esbuild/win32-ia32": {
++++++++      "version": "0.25.12",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.25.12.tgz",
++++++++      "integrity": "sha512-HkqnmmBoCbCwxUKKNPBixiWDGCpQGVsrQfJoVGYLPT41XWF8lHuE5N6WhVia2n4o5QK5M4tYr21827fNhi4byQ==",
++++++++      "cpu": [
++++++++        "ia32"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "win32"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/vite/node_modules/@esbuild/win32-x64": {
++++++++      "version": "0.25.12",
++++++++      "resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.25.12.tgz",
++++++++      "integrity": "sha512-alJC0uCZpTFrSL0CCDjcgleBXPnCrEAhTBILpeAp7M/OFgoqtAetfBzX0xM00MUsVVPpVjlPuMbREqnZCXaTnA==",
++++++++      "cpu": [
++++++++        "x64"
++++++++      ],
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "optional": true,
++++++++      "os": [
++++++++        "win32"
++++++++      ],
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      }
++++++++    },
++++++++    "node_modules/vite/node_modules/esbuild": {
++++++++      "version": "0.25.12",
++++++++      "resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.25.12.tgz",
++++++++      "integrity": "sha512-bbPBYYrtZbkt6Os6FiTLCTFxvq4tt3JKall1vRwshA3fdVztsLAatFaZobhkBC8/BrPetoa0oksYoKXoG4ryJg==",
++++++++      "dev": true,
++++++++      "hasInstallScript": true,
++++++++      "license": "MIT",
++++++++      "bin": {
++++++++        "esbuild": "bin/esbuild"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=18"
++++++++      },
++++++++      "optionalDependencies": {
++++++++        "@esbuild/aix-ppc64": "0.25.12",
++++++++        "@esbuild/android-arm": "0.25.12",
++++++++        "@esbuild/android-arm64": "0.25.12",
++++++++        "@esbuild/android-x64": "0.25.12",
++++++++        "@esbuild/darwin-arm64": "0.25.12",
++++++++        "@esbuild/darwin-x64": "0.25.12",
++++++++        "@esbuild/freebsd-arm64": "0.25.12",
++++++++        "@esbuild/freebsd-x64": "0.25.12",
++++++++        "@esbuild/linux-arm": "0.25.12",
++++++++        "@esbuild/linux-arm64": "0.25.12",
++++++++        "@esbuild/linux-ia32": "0.25.12",
++++++++        "@esbuild/linux-loong64": "0.25.12",
++++++++        "@esbuild/linux-mips64el": "0.25.12",
++++++++        "@esbuild/linux-ppc64": "0.25.12",
++++++++        "@esbuild/linux-riscv64": "0.25.12",
++++++++        "@esbuild/linux-s390x": "0.25.12",
++++++++        "@esbuild/linux-x64": "0.25.12",
++++++++        "@esbuild/netbsd-arm64": "0.25.12",
++++++++        "@esbuild/netbsd-x64": "0.25.12",
++++++++        "@esbuild/openbsd-arm64": "0.25.12",
++++++++        "@esbuild/openbsd-x64": "0.25.12",
++++++++        "@esbuild/openharmony-arm64": "0.25.12",
++++++++        "@esbuild/sunos-x64": "0.25.12",
++++++++        "@esbuild/win32-arm64": "0.25.12",
++++++++        "@esbuild/win32-ia32": "0.25.12",
++++++++        "@esbuild/win32-x64": "0.25.12"
++++++++      }
++++++++    },
++++++++    "node_modules/vite/node_modules/fdir": {
++++++++      "version": "6.5.0",
++++++++      "resolved": "https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz",
++++++++      "integrity": "sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=12.0.0"
++++++++      },
++++++++      "peerDependencies": {
++++++++        "picomatch": "^3 || ^4"
++++++++      },
++++++++      "peerDependenciesMeta": {
++++++++        "picomatch": {
++++++++          "optional": true
++++++++        }
++++++++      }
++++++++    },
++++++++    "node_modules/vite/node_modules/picomatch": {
++++++++      "version": "4.0.7",
++++++++      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.7.tgz",
++++++++      "integrity": "sha512-qcJu88Q2IWqJsDD529JKMdwGm/dvInW4HvQnRwiH9JtihJvzGOscDtHE3x1pBKeUOTysQ8kVmLnJ2kJu7yhcGA==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=12"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://github.com/sponsors/jonschlinkert"
++++++++      }
++++++++    },
++++++++    "node_modules/vitest": {
++++++++      "version": "3.2.7",
++++++++      "resolved": "https://registry.npmjs.org/vitest/-/vitest-3.2.7.tgz",
++++++++      "integrity": "sha512-KrxIJ62Fd89gfysR4WotlgZABiz2dqFPgqGzX7s+CwsqLFomRH7777ZcrOD6+WVAh7khPQP41A+BKbpcJFrdEg==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "@types/chai": "^5.2.2",
++++++++        "@vitest/expect": "3.2.7",
++++++++        "@vitest/mocker": "3.2.7",
++++++++        "@vitest/pretty-format": "^3.2.7",
++++++++        "@vitest/runner": "3.2.7",
++++++++        "@vitest/snapshot": "3.2.7",
++++++++        "@vitest/spy": "3.2.7",
++++++++        "@vitest/utils": "3.2.7",
++++++++        "chai": "^5.2.0",
++++++++        "debug": "^4.4.1",
++++++++        "expect-type": "^1.2.1",
++++++++        "magic-string": "^0.30.17",
++++++++        "pathe": "^2.0.3",
++++++++        "picomatch": "^4.0.2",
++++++++        "std-env": "^3.9.0",
++++++++        "tinybench": "^2.9.0",
++++++++        "tinyexec": "^0.3.2",
++++++++        "tinyglobby": "^0.2.14",
++++++++        "tinypool": "^1.1.1",
++++++++        "tinyrainbow": "^2.0.0",
++++++++        "vite": "^5.0.0 || ^6.0.0 || ^7.0.0-0",
++++++++        "vite-node": "3.2.4",
++++++++        "why-is-node-running": "^2.3.0"
++++++++      },
++++++++      "bin": {
++++++++        "vitest": "vitest.mjs"
++++++++      },
++++++++      "engines": {
++++++++        "node": "^18.0.0 || ^20.0.0 || >=22.0.0"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://opencollective.com/vitest"
++++++++      },
++++++++      "peerDependencies": {
++++++++        "@edge-runtime/vm": "*",
++++++++        "@types/debug": "^4.1.12",
++++++++        "@types/node": "^18.0.0 || ^20.0.0 || >=22.0.0",
++++++++        "@vitest/browser": "3.2.7",
++++++++        "@vitest/ui": "3.2.7",
++++++++        "happy-dom": "*",
++++++++        "jsdom": "*"
++++++++      },
++++++++      "peerDependenciesMeta": {
++++++++        "@edge-runtime/vm": {
++++++++          "optional": true
++++++++        },
++++++++        "@types/debug": {
++++++++          "optional": true
++++++++        },
++++++++        "@types/node": {
++++++++          "optional": true
++++++++        },
++++++++        "@vitest/browser": {
++++++++          "optional": true
++++++++        },
++++++++        "@vitest/ui": {
++++++++          "optional": true
++++++++        },
++++++++        "happy-dom": {
++++++++          "optional": true
++++++++        },
++++++++        "jsdom": {
++++++++          "optional": true
++++++++        }
++++++++      }
++++++++    },
++++++++    "node_modules/vitest/node_modules/picomatch": {
++++++++      "version": "4.0.7",
++++++++      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.7.tgz",
++++++++      "integrity": "sha512-qcJu88Q2IWqJsDD529JKMdwGm/dvInW4HvQnRwiH9JtihJvzGOscDtHE3x1pBKeUOTysQ8kVmLnJ2kJu7yhcGA==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=12"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://github.com/sponsors/jonschlinkert"
++++++++      }
++++++++    },
++++++++    "node_modules/whatstheword-client": {
++++++++      "resolved": "client",
++++++++      "link": true
++++++++    },
++++++++    "node_modules/whatstheword-server": {
++++++++      "resolved": "server",
++++++++      "link": true
++++++++    },
++++++++    "node_modules/why-is-node-running": {
++++++++      "version": "2.3.0",
++++++++      "resolved": "https://registry.npmjs.org/why-is-node-running/-/why-is-node-running-2.3.0.tgz",
++++++++      "integrity": "sha512-hUrmaWBdVDcxvYqnyh09zunKzROWjbZTiNy8dBEjkS7ehEDQibXJ7XvlmtbwuTclUiIyN+CyXQD4Vmko8fNm8w==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "siginfo": "^2.0.0",
++++++++        "stackback": "0.0.2"
++++++++      },
++++++++      "bin": {
++++++++        "why-is-node-running": "cli.js"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=8"
++++++++      }
++++++++    },
++++++++    "node_modules/wrap-ansi": {
++++++++      "version": "7.0.0",
++++++++      "resolved": "https://registry.npmjs.org/wrap-ansi/-/wrap-ansi-7.0.0.tgz",
++++++++      "integrity": "sha512-YVGIj2kamLSTxw6NsZjoBxfSwsn0ycdesmc4p+Q21c5zPuZ1pl+NfxVdxPtdHvmNVOQ6XSYG4AUtyt/Fi7D16Q==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "ansi-styles": "^4.0.0",
++++++++        "string-width": "^4.1.0",
++++++++        "strip-ansi": "^6.0.0"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=10"
++++++++      },
++++++++      "funding": {
++++++++        "url": "https://github.com/chalk/wrap-ansi?sponsor=1"
++++++++      }
++++++++    },
++++++++    "node_modules/ws": {
++++++++      "version": "8.21.3",
++++++++      "resolved": "https://registry.npmjs.org/ws/-/ws-8.21.3.tgz",
++++++++      "integrity": "sha512-201TZ/kPWxoPr/OKWjquZR1SWKXcvxdH+e1xrx89b3YbmzLMFCLfnaG1HFIgWzJOEWZ7MvpK++odZufgYR50Rw==",
++++++++      "license": "MIT",
++++++++      "engines": {
++++++++        "node": ">=10.0.0"
++++++++      },
++++++++      "peerDependencies": {
++++++++        "bufferutil": "^4.0.1",
++++++++        "utf-8-validate": ">=5.0.2"
++++++++      },
++++++++      "peerDependenciesMeta": {
++++++++        "bufferutil": {
++++++++          "optional": true
++++++++        },
++++++++        "utf-8-validate": {
++++++++          "optional": true
++++++++        }
++++++++      }
++++++++    },
++++++++    "node_modules/xmlhttprequest-ssl": {
++++++++      "version": "2.1.2",
++++++++      "resolved": "https://registry.npmjs.org/xmlhttprequest-ssl/-/xmlhttprequest-ssl-2.1.2.tgz",
++++++++      "integrity": "sha512-TEU+nJVUUnA4CYJFLvK5X9AOeH4KvDvhIfm0vV1GaQRtchnG0hgK5p8hw/xjv8cunWYCsiPCSDzObPyhEwq3KQ==",
++++++++      "engines": {
++++++++        "node": ">=0.4.0"
++++++++      }
++++++++    },
++++++++    "node_modules/y18n": {
++++++++      "version": "5.0.8",
++++++++      "resolved": "https://registry.npmjs.org/y18n/-/y18n-5.0.8.tgz",
++++++++      "integrity": "sha512-0pfFzegeDWJHJIAmTLRP2DwHjdF5s7jo9tuztdQxAhINCdvS+3nGINqPd00AphqJR/0LhANUS6/+7SCb98YOfA==",
++++++++      "dev": true,
++++++++      "license": "ISC",
++++++++      "engines": {
++++++++        "node": ">=10"
++++++++      }
++++++++    },
++++++++    "node_modules/yallist": {
++++++++      "version": "3.1.1",
++++++++      "resolved": "https://registry.npmjs.org/yallist/-/yallist-3.1.1.tgz",
++++++++      "integrity": "sha512-a4UGQaWPH59mOXUYnAG2ewncQS4i4F43Tv3JoAM+s2VDAmS9NsK8GpDMLrCHPksFT7h3K6TOoUNn2pb7RoXx4g==",
++++++++      "dev": true,
++++++++      "license": "ISC"
++++++++    },
++++++++    "node_modules/yargs": {
++++++++      "version": "17.7.2",
++++++++      "resolved": "https://registry.npmjs.org/yargs/-/yargs-17.7.2.tgz",
++++++++      "integrity": "sha512-7dSzzRQ++CKnNI/krKnYRV7JKKPUXMEh61soaHKg9mrWEhzFWhFnxPxGl+69cD1Ou63C13NUPCnmIcrvqCuM6w==",
++++++++      "dev": true,
++++++++      "license": "MIT",
++++++++      "dependencies": {
++++++++        "cliui": "^8.0.1",
++++++++        "escalade": "^3.1.1",
++++++++        "get-caller-file": "^2.0.5",
++++++++        "require-directory": "^2.1.1",
++++++++        "string-width": "^4.2.3",
++++++++        "y18n": "^5.0.5",
++++++++        "yargs-parser": "^21.1.1"
++++++++      },
++++++++      "engines": {
++++++++        "node": ">=12"
++++++++      }
++++++++    },
++++++++    "node_modules/yargs-parser": {
++++++++      "version": "21.1.1",
++++++++      "resolved": "https://registry.npmjs.org/yargs-parser/-/yargs-parser-21.1.1.tgz",
++++++++      "integrity": "sha512-tVpsJW7DdjecAiFpbIB1e3qxIQsE6NoPc5/eTdrbbIC4h0LVsWhnoa3g+m2HclBIujHzsxZ4VJVA+GUuc2/LBw==",
++++++++      "dev": true,
++++++++      "license": "ISC",
++++++++      "engines": {
++++++++        "node": ">=12"
++++++++      }
++++++++    },
++++++++    "server": {
++++++++      "name": "whatstheword-server",
++++++++      "version": "1.0.0",
++++++++      "dependencies": {
++++++++        "cors": "^2.8.5",
++++++++        "dotenv": "^16.4.7",
++++++++        "express": "^4.21.2",
++++++++        "socket.io": "^4.8.1"
++++++++      },
++++++++      "devDependencies": {
++++++++        "@types/cors": "^2.8.17",
++++++++        "@types/express": "^5.0.0",
++++++++        "@types/node": "^22.13.9",
++++++++        "tsx": "^4.19.3",
++++++++        "typescript": "^5.7.3",
++++++++        "vitest": "^3.0.7"
++++++++      }
++++++++    }
++++++++  }
++++++++}
+++++++diff --git a/package.json b/package.json
+++++++new file mode 100644
+++++++index 0000000..17887bd
+++++++--- /dev/null
++++++++++ b/package.json
+++++++@@ -0,0 +1,24 @@
++++++++{
++++++++  "name": "whatstheword-monorepo",
++++++++  "version": "1.0.0",
++++++++  "private": true,
++++++++  "description": "What's The Word - Fullstack Undercover Word Deduction Game",
++++++++  "workspaces": [
++++++++    "client",
++++++++    "server"
++++++++  ],
++++++++  "scripts": {
++++++++    "dev": "concurrently \"npm run dev --workspace=server\" \"npm run dev --workspace=client\"",
++++++++    "dev:client": "npm run dev --workspace=client",
++++++++    "dev:server": "npm run dev --workspace=server",
++++++++    "build": "npm run build --workspace=client && npm run build --workspace=server",
++++++++    "build:client": "npm run build --workspace=client",
++++++++    "build:server": "npm run build --workspace=server",
++++++++    "test": "npm run test --workspace=server",
++++++++    "typecheck": "npm run typecheck --workspace=client && npm run typecheck --workspace=server",
++++++++    "install:all": "npm install"
++++++++  },
++++++++  "devDependencies": {
++++++++    "concurrently": "^9.1.2"
++++++++  }
++++++++}
+++++++diff --git a/server/package.json b/server/package.json
+++++++new file mode 100644
+++++++index 0000000..3964094
+++++++--- /dev/null
++++++++++ b/server/package.json
+++++++@@ -0,0 +1,28 @@
++++++++{
++++++++  "name": "whatstheword-server",
++++++++  "private": true,
++++++++  "version": "1.0.0",
++++++++  "type": "module",
++++++++  "scripts": {
++++++++    "dev": "tsx watch src/server.ts",
++++++++    "build": "tsc",
++++++++    "start": "node dist/server.js",
++++++++    "test": "vitest run",
++++++++    "test:watch": "vitest",
++++++++    "typecheck": "tsc --noEmit"
++++++++  },
++++++++  "dependencies": {
++++++++    "cors": "^2.8.5",
++++++++    "dotenv": "^16.4.7",
++++++++    "express": "^4.21.2",
++++++++    "socket.io": "^4.8.1"
++++++++  },
++++++++  "devDependencies": {
++++++++    "@types/cors": "^2.8.17",
++++++++    "@types/express": "^5.0.0",
++++++++    "@types/node": "^22.13.9",
++++++++    "tsx": "^4.19.3",
++++++++    "typescript": "^5.7.3",
++++++++    "vitest": "^3.0.7"
++++++++  }
++++++++}
+++++++diff --git a/server/src/server.ts b/server/src/server.ts
+++++++new file mode 100644
+++++++index 0000000..99a8a27
+++++++--- /dev/null
++++++++++ b/server/src/server.ts
+++++++@@ -0,0 +1,51 @@
++++++++import express, { Request, Response } from 'express';
++++++++import http from 'http';
++++++++import { Server } from 'socket.io';
++++++++import cors from 'cors';
++++++++import dotenv from 'dotenv';
++++++++
++++++++dotenv.config({ path: '../.env' });
++++++++dotenv.config();
++++++++
++++++++const app = express();
++++++++const server = http.createServer(app);
++++++++
++++++++const PORT = process.env.PORT || 3001;
++++++++
++++++++app.use(cors({
++++++++  origin: '*',
++++++++  methods: ['GET', 'POST'],
++++++++}));
++++++++
++++++++app.use(express.json());
++++++++
++++++++app.get('/health', (_req: Request, res: Response) => {
++++++++  res.status(200).json({
++++++++    status: 'ok',
++++++++    timestamp: new Date().toISOString(),
++++++++    service: 'whatstheword-server',
++++++++  });
++++++++});
++++++++
++++++++const io = new Server(server, {
++++++++  cors: {
++++++++    origin: '*',
++++++++    methods: ['GET', 'POST'],
++++++++  },
++++++++});
++++++++
++++++++io.on('connection', (socket) => {
++++++++  console.log(`[Socket.io] Client connected: ${socket.id}`);
++++++++
++++++++  socket.on('disconnect', () => {
++++++++    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
++++++++  });
++++++++});
++++++++
++++++++if (process.env.NODE_ENV !== 'test') {
++++++++  server.listen(PORT, () => {
++++++++    console.log(`[Server] What's The Word server running on port ${PORT}`);
++++++++  });
++++++++}
++++++++
++++++++export { app, server, io };
+++++++diff --git a/server/src/types/game.types.ts b/server/src/types/game.types.ts
+++++++new file mode 100644
+++++++index 0000000..b000cc6
+++++++--- /dev/null
++++++++++ b/server/src/types/game.types.ts
+++++++@@ -0,0 +1,68 @@
++++++++export type PlayerRole = 'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE';
++++++++
++++++++export type GamePhase =
++++++++  | 'LOBBY'
++++++++  | 'ROLE_REVEAL'
++++++++  | 'TURN_PHASE'
++++++++  | 'VOTING'
++++++++  | 'MR_WHITE_GUESS'
++++++++  | 'GAME_OVER';
++++++++
++++++++export interface Player {
++++++++  id: string;
++++++++  name: string;
++++++++  avatar: string;
++++++++  isHost: boolean;
++++++++  role?: PlayerRole;
++++++++  word?: string;
++++++++  isAlive: boolean;
++++++++  hasVoted: boolean;
++++++++  votedTargetId?: string;
++++++++  isSpeaking?: boolean;
++++++++}
++++++++
++++++++export interface WordPair {
++++++++  id?: string;
++++++++  category: string;
++++++++  civilianWord: string;
++++++++  undercoverWord: string;
++++++++}
++++++++
++++++++export interface GameSettings {
++++++++  category: string;
++++++++  civilianCount: number;
++++++++  undercoverCount: number;
++++++++  mrWhiteCount: number;
++++++++  turnDurationSeconds: number;
++++++++  enableMrWhite: boolean;
++++++++  customWordPair?: WordPair;
++++++++}
++++++++
++++++++export interface RoomState {
++++++++  roomId: string;
++++++++  phase: GamePhase;
++++++++  round: number;
++++++++  players: Player[];
++++++++  speakingOrder: string[];
++++++++  currentSpeakerIndex: number;
++++++++  activeTurnRemainingSeconds: number;
++++++++  settings: GameSettings;
++++++++  winningRole?: 'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE';
++++++++  eliminatedPlayer?: Player;
++++++++  wordPair?: WordPair;
++++++++}
++++++++
++++++++export interface VoteRecord {
++++++++  voterId: string;
++++++++  targetId: string;
++++++++}
++++++++
++++++++export interface WordPack {
++++++++  id: string;
++++++++  name: string;
++++++++  category: string;
++++++++  description?: string;
++++++++  isOfficial: boolean;
++++++++  wordPairs: WordPair[];
++++++++  createdAt?: string;
++++++++}
+++++++diff --git a/server/tsconfig.json b/server/tsconfig.json
+++++++new file mode 100644
+++++++index 0000000..51ae7f1
+++++++--- /dev/null
++++++++++ b/server/tsconfig.json
+++++++@@ -0,0 +1,21 @@
++++++++{
++++++++  "compilerOptions": {
++++++++    "target": "ES2022",
++++++++    "module": "NodeNext",
++++++++    "moduleResolution": "NodeNext",
++++++++    "lib": ["ES2022"],
++++++++    "outDir": "dist",
++++++++    "rootDir": "src",
++++++++    "strict": true,
++++++++    "esModuleInterop": true,
++++++++    "skipLibCheck": true,
++++++++    "forceConsistentCasingInFileNames": true,
++++++++    "resolveJsonModule": true,
++++++++    "baseUrl": ".",
++++++++    "paths": {
++++++++      "@/*": ["src/*"]
++++++++    }
++++++++  },
++++++++  "include": ["src/**/*"],
++++++++  "exclude": ["node_modules", "dist", "**/*.test.ts"]
++++++++}
+++++++diff --git a/server/vitest.config.ts b/server/vitest.config.ts
+++++++new file mode 100644
+++++++index 0000000..ca1f51a
+++++++--- /dev/null
++++++++++ b/server/vitest.config.ts
+++++++@@ -0,0 +1,14 @@
++++++++import { defineConfig } from 'vitest/config';
++++++++import path from 'path';
++++++++
++++++++export default defineConfig({
++++++++  test: {
++++++++    globals: true,
++++++++    environment: 'node',
++++++++  },
++++++++  resolve: {
++++++++    alias: {
++++++++      '@': path.resolve(__dirname, './src'),
++++++++    },
++++++++  },
++++++++});
+++++++
+++++++```
++++++diff --git a/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-2-brief.md b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-2-brief.md
++++++new file mode 100644
++++++index 0000000..0b90bc6
++++++--- /dev/null
+++++++++ b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-2-brief.md
++++++@@ -0,0 +1,27 @@
+++++++# Task 2 Brief: Core Domain Logic - Game Engine, Indonesian Word Bank & Fuzzy Matcher
+++++++
+++++++## Goal
+++++++Implement the core pure domain logic and Indonesian word bank with unit tests:
+++++++1. `server/src/data/defaultWordPacks.ts` & `client/src/data/defaultWordPacks.ts`:
+++++++   - 50+ balanced word pairs across 5 Indonesian categories:
+++++++     - `Makanan & Minuman` (e.g. Kopi/Teh, Bakso/Mie Ayam, Rendang/Gulai, Martabak Manis/Terang Bulan, Nasi Padang/Nasi Uduk, etc.)
+++++++     - `Hewan` (e.g. Kucing/Harimau, Bebek/Ayam, Paus/Lumba-lumba, Elang/Burung Hantu, Kelinci/Hamster, etc.)
+++++++     - `Benda & Gadget` (e.g. Laptop/Komputer, Smartphone/Tablet, Headphone/Earphone, Kipas Angin/AC, Jam Tangan/Jam Dinding, etc.)
+++++++     - `Tempat & Hiburan` (e.g. Bioskop/Teater, Pantai/Danau, Supermarket/Pasar Tradisional, Museum/Perpustakaan, Hotel/Villa, etc.)
+++++++     - `Profesi` (e.g. Dokter/Perawat, Pilot/Masinis, Polisi/Tentara, Koki/Barista, Guru/Dosen, etc.)
+++++++2. `server/src/engine/FuzzyMatcher.ts` & `client/src/utils/fuzzyMatcher.ts`:
+++++++   - `isFuzzyMatch(guessed: string, target: string, options?: { maxDistance?: number }): boolean`
+++++++   - Levenshtein distance algorithm: case-insensitive, trims whitespace, removes punctuation.
+++++++   - For string length < 4: exact match required. For length 4-7: tolerance <= 1. For length > 7: tolerance <= 2.
+++++++3. `server/src/engine/GameEngine.ts`:
+++++++   - `assignRoles(players: Player[], settings: GameSettings, wordPair: WordPair): { players: Player[]; speakingOrder: string[] }`
+++++++   - `calculateVotes(votes: Record<string, string>, activePlayers: Player[]): { isTie: boolean; eliminatedPlayerId: string | null; voteCounts: Record<string, number> }`
+++++++     * Note: Instant Skip Elimination rule! If 2 or more candidates tie for highest votes, `isTie: true` and `eliminatedPlayerId: null`.
+++++++   - `checkWinCondition(players: Player[]): 'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE' | null`
+++++++4. Vitest Tests:
+++++++   - `server/tests/FuzzyMatcher.test.ts` (test exact, casing, small typo, big typo, whitespace)
+++++++   - `server/tests/GameEngine.test.ts` (test role distributions, tie-breaker instant skip, win conditions for Civilian, Undercover, Mr. White)
+++++++
+++++++## Report Contract
+++++++Write report to: `C:\Users\ASUS\Documents\ALIFKA\PROJECT\whatstheword\.superpowers\sdd\2026-09-02-whatstheword-implementation\task-2-report.md`
+++++++Return: status (DONE / BLOCKED), commits, one-line test summary.
++++++diff --git a/client/src/data/defaultWordPacks.ts b/client/src/data/defaultWordPacks.ts
++++++new file mode 100644
++++++index 0000000..2b5ff0c
++++++--- /dev/null
+++++++++ b/client/src/data/defaultWordPacks.ts
++++++@@ -0,0 +1,145 @@
+++++++import { WordPair, WordPack } from '../types/game.types';
+++++++
+++++++export const CATEGORIES = [
+++++++  'Semua Kategori',
+++++++  'Makanan & Minuman',
+++++++  'Hewan',
+++++++  'Benda & Gadget',
+++++++  'Tempat & Hiburan',
+++++++  'Profesi',
+++++++] as const;
+++++++
+++++++export type WordCategory = (typeof CATEGORIES)[number];
+++++++
+++++++export const DEFAULT_WORD_PAIRS: WordPair[] = [
+++++++  // 1. Makanan & Minuman (14 pairs)
+++++++  { id: 'mkn-01', category: 'Makanan & Minuman', civilianWord: 'Kopi', undercoverWord: 'Teh' },
+++++++  { id: 'mkn-02', category: 'Makanan & Minuman', civilianWord: 'Bakso', undercoverWord: 'Mie Ayam' },
+++++++  { id: 'mkn-03', category: 'Makanan & Minuman', civilianWord: 'Rendang', undercoverWord: 'Gulai' },
+++++++  { id: 'mkn-04', category: 'Makanan & Minuman', civilianWord: 'Martabak Manis', undercoverWord: 'Terang Bulan' },
+++++++  { id: 'mkn-05', category: 'Makanan & Minuman', civilianWord: 'Nasi Padang', undercoverWord: 'Nasi Uduk' },
+++++++  { id: 'mkn-06', category: 'Makanan & Minuman', civilianWord: 'Nasi Goreng', undercoverWord: 'Mie Goreng' },
+++++++  { id: 'mkn-07', category: 'Makanan & Minuman', civilianWord: 'Es Kelapa', undercoverWord: 'Es Cendol' },
+++++++  { id: 'mkn-08', category: 'Makanan & Minuman', civilianWord: 'Sate Ayam', undercoverWord: 'Sate Kambing' },
+++++++  { id: 'mkn-09', category: 'Makanan & Minuman', civilianWord: 'Pempek', undercoverWord: 'Siomay' },
+++++++  { id: 'mkn-10', category: 'Makanan & Minuman', civilianWord: 'Roti Bakar', undercoverWord: 'Pisang Bakar' },
+++++++  { id: 'mkn-11', category: 'Makanan & Minuman', civilianWord: 'Soto Ayam', undercoverWord: 'Rawon' },
+++++++  { id: 'mkn-12', category: 'Makanan & Minuman', civilianWord: 'Jus Alpukat', undercoverWord: 'Jus Mangga' },
+++++++  { id: 'mkn-13', category: 'Makanan & Minuman', civilianWord: 'Kerupuk', undercoverWord: 'Keripik' },
+++++++  { id: 'mkn-14', category: 'Makanan & Minuman', civilianWord: 'Sambal Terasi', undercoverWord: 'Sambal Matah' },
+++++++
+++++++  // 2. Hewan (13 pairs)
+++++++  { id: 'hwn-01', category: 'Hewan', civilianWord: 'Kucing', undercoverWord: 'Harimau' },
+++++++  { id: 'hwn-02', category: 'Hewan', civilianWord: 'Bebek', undercoverWord: 'Ayam' },
+++++++  { id: 'hwn-03', category: 'Hewan', civilianWord: 'Paus', undercoverWord: 'Lumba-lumba' },
+++++++  { id: 'hwn-04', category: 'Hewan', civilianWord: 'Elang', undercoverWord: 'Burung Hantu' },
+++++++  { id: 'hwn-05', category: 'Hewan', civilianWord: 'Kelinci', undercoverWord: 'Hamster' },
+++++++  { id: 'hwn-06', category: 'Hewan', civilianWord: 'Singa', undercoverWord: 'Macan Tutul' },
+++++++  { id: 'hwn-07', category: 'Hewan', civilianWord: 'Gajah', undercoverWord: 'Badak' },
+++++++  { id: 'hwn-08', category: 'Hewan', civilianWord: 'Buaya', undercoverWord: 'Alligator' },
+++++++  { id: 'hwn-09', category: 'Hewan', civilianWord: 'Kuda', undercoverWord: 'Keledai' },
+++++++  { id: 'hwn-10', category: 'Hewan', civilianWord: 'Kupu-kupu', undercoverWord: 'Capung' },
+++++++  { id: 'hwn-11', category: 'Hewan', civilianWord: 'Lebah', undercoverWord: 'Tawon' },
+++++++  { id: 'hwn-12', category: 'Hewan', civilianWord: 'Hiu', undercoverWord: 'Ikan Pari' },
+++++++  { id: 'hwn-13', category: 'Hewan', civilianWord: 'Beruang', undercoverWord: 'Panda' },
+++++++
+++++++  // 3. Benda & Gadget (13 pairs)
+++++++  { id: 'bnd-01', category: 'Benda & Gadget', civilianWord: 'Laptop', undercoverWord: 'Komputer' },
+++++++  { id: 'bnd-02', category: 'Benda & Gadget', civilianWord: 'Smartphone', undercoverWord: 'Tablet' },
+++++++  { id: 'bnd-03', category: 'Benda & Gadget', civilianWord: 'Headphone', undercoverWord: 'Earphone' },
+++++++  { id: 'bnd-04', category: 'Benda & Gadget', civilianWord: 'Kipas Angin', undercoverWord: 'AC' },
+++++++  { id: 'bnd-05', category: 'Benda & Gadget', civilianWord: 'Jam Tangan', undercoverWord: 'Jam Dinding' },
+++++++  { id: 'bnd-06', category: 'Benda & Gadget', civilianWord: 'Televisi', undercoverWord: 'Proyektor' },
+++++++  { id: 'bnd-07', category: 'Benda & Gadget', civilianWord: 'Sepeda', undercoverWord: 'Motor' },
+++++++  { id: 'bnd-08', category: 'Benda & Gadget', civilianWord: 'Kacamata', undercoverWord: 'Lensa Kontak' },
+++++++  { id: 'bnd-09', category: 'Benda & Gadget', civilianWord: 'Dompet', undercoverWord: 'Tas' },
+++++++  { id: 'bnd-10', category: 'Benda & Gadget', civilianWord: 'Pulpen', undercoverWord: 'Pensil' },
+++++++  { id: 'bnd-11', category: 'Benda & Gadget', civilianWord: 'Payung', undercoverWord: 'Jas Hujan' },
+++++++  { id: 'bnd-12', category: 'Benda & Gadget', civilianWord: 'Senter', undercoverWord: 'Lilin' },
+++++++  { id: 'bnd-13', category: 'Benda & Gadget', civilianWord: 'Pintu', undercoverWord: 'Jendela' },
+++++++
+++++++  // 4. Tempat & Hiburan (12 pairs)
+++++++  { id: 'tmp-01', category: 'Tempat & Hiburan', civilianWord: 'Bioskop', undercoverWord: 'Teater' },
+++++++  { id: 'tmp-02', category: 'Tempat & Hiburan', civilianWord: 'Pantai', undercoverWord: 'Danau' },
+++++++  { id: 'tmp-03', category: 'Tempat & Hiburan', civilianWord: 'Supermarket', undercoverWord: 'Pasar Tradisional' },
+++++++  { id: 'tmp-04', category: 'Tempat & Hiburan', civilianWord: 'Museum', undercoverWord: 'Perpustakaan' },
+++++++  { id: 'tmp-05', category: 'Tempat & Hiburan', civilianWord: 'Hotel', undercoverWord: 'Villa' },
+++++++  { id: 'tmp-06', category: 'Tempat & Hiburan', civilianWord: 'Taman Hiburan', undercoverWord: 'Kebun Binatang' },
+++++++  { id: 'tmp-07', category: 'Tempat & Hiburan', civilianWord: 'Restoran', undercoverWord: 'Kafe' },
+++++++  { id: 'tmp-08', category: 'Tempat & Hiburan', civilianWord: 'Rumah Sakit', undercoverWord: 'Puskesmas' },
+++++++  { id: 'tmp-09', category: 'Tempat & Hiburan', civilianWord: 'Bandara', undercoverWord: 'Stasiun Kereta' },
+++++++  { id: 'tmp-10', category: 'Tempat & Hiburan', civilianWord: 'Kolam Renang', undercoverWord: 'Waterpark' },
+++++++  { id: 'tmp-11', category: 'Tempat & Hiburan', civilianWord: 'Gunung', undercoverWord: 'Bukit' },
+++++++  { id: 'tmp-12', category: 'Tempat & Hiburan', civilianWord: 'Mall', undercoverWord: 'Pasar Malam' },
+++++++
+++++++  // 5. Profesi (12 pairs)
+++++++  { id: 'prf-01', category: 'Profesi', civilianWord: 'Dokter', undercoverWord: 'Perawat' },
+++++++  { id: 'prf-02', category: 'Profesi', civilianWord: 'Pilot', undercoverWord: 'Masinis' },
+++++++  { id: 'prf-03', category: 'Profesi', civilianWord: 'Polisi', undercoverWord: 'Tentara' },
+++++++  { id: 'prf-04', category: 'Profesi', civilianWord: 'Koki', undercoverWord: 'Barista' },
+++++++  { id: 'prf-05', category: 'Profesi', civilianWord: 'Guru', undercoverWord: 'Dosen' },
+++++++  { id: 'prf-06', category: 'Profesi', civilianWord: 'Pemadam Kebakaran', undercoverWord: 'Tim SAR' },
+++++++  { id: 'prf-07', category: 'Profesi', civilianWord: 'Arsitek', undercoverWord: 'Insinyur' },
+++++++  { id: 'prf-08', category: 'Profesi', civilianWord: 'Hakim', undercoverWord: 'Pengacara' },
+++++++  { id: 'prf-09', category: 'Profesi', civilianWord: 'Wartawan', undercoverWord: 'Fotografer' },
+++++++  { id: 'prf-10', category: 'Profesi', civilianWord: 'Pramugari', undercoverWord: 'Resepsionis' },
+++++++  { id: 'prf-11', category: 'Profesi', civilianWord: 'Sopir Bus', undercoverWord: 'Supir Taksi' },
+++++++  { id: 'prf-12', category: 'Profesi', civilianWord: 'Aktor', undercoverWord: 'Penyanyi' },
+++++++];
+++++++
+++++++export const DEFAULT_WORD_PACKS: WordPack[] = [
+++++++  {
+++++++    id: 'pack-makanan',
+++++++    name: 'Makanan & Minuman Indonesia',
+++++++    category: 'Makanan & Minuman',
+++++++    description: 'Kuliner populer, jajanan pasar, dan minuman khas Indonesia',
+++++++    isOfficial: true,
+++++++    wordPairs: DEFAULT_WORD_PAIRS.filter((wp) => wp.category === 'Makanan & Minuman'),
+++++++  },
+++++++  {
+++++++    id: 'pack-hewan',
+++++++    name: 'Dunia Hewan',
+++++++    category: 'Hewan',
+++++++    description: 'Fauna darat, air, udara, dan hewan peliharaan',
+++++++    isOfficial: true,
+++++++    wordPairs: DEFAULT_WORD_PAIRS.filter((wp) => wp.category === 'Hewan'),
+++++++  },
+++++++  {
+++++++    id: 'pack-gadget',
+++++++    name: 'Benda & Gadget',
+++++++    category: 'Benda & Gadget',
+++++++    description: 'Peralatan elektronik, perabotan rumah tangga, dan teknologi',
+++++++    isOfficial: true,
+++++++    wordPairs: DEFAULT_WORD_PAIRS.filter((wp) => wp.category === 'Benda & Gadget'),
+++++++  },
+++++++  {
+++++++    id: 'pack-tempat',
+++++++    name: 'Tempat & Hiburan',
+++++++    category: 'Tempat & Hiburan',
+++++++    description: 'Destinasi wisata, fasilitas publik, dan tempat rekreasi',
+++++++    isOfficial: true,
+++++++    wordPairs: DEFAULT_WORD_PAIRS.filter((wp) => wp.category === 'Tempat & Hiburan'),
+++++++  },
+++++++  {
+++++++    id: 'pack-profesi',
+++++++    name: 'Profesi & Pekerjaan',
+++++++    category: 'Profesi',
+++++++    description: 'Karier, pekerjaan umum, dan tenaga profesional',
+++++++    isOfficial: true,
+++++++    wordPairs: DEFAULT_WORD_PAIRS.filter((wp) => wp.category === 'Profesi'),
+++++++  },
+++++++];
+++++++
+++++++export function getWordPairsByCategory(category?: string): WordPair[] {
+++++++  if (!category || category === 'Semua Kategori') {
+++++++    return DEFAULT_WORD_PAIRS;
+++++++  }
+++++++  const filtered = DEFAULT_WORD_PAIRS.filter((wp) => wp.category.toLowerCase() === category.toLowerCase());
+++++++  return filtered.length > 0 ? filtered : DEFAULT_WORD_PAIRS;
+++++++}
+++++++
+++++++export function getRandomWordPair(category?: string): WordPair {
+++++++  const pool = getWordPairsByCategory(category);
+++++++  const randomIndex = Math.floor(Math.random() * pool.length);
+++++++  return pool[randomIndex];
+++++++}
++++++diff --git a/client/src/utils/fuzzyMatcher.ts b/client/src/utils/fuzzyMatcher.ts
++++++new file mode 100644
++++++index 0000000..11b6acf
++++++--- /dev/null
+++++++++ b/client/src/utils/fuzzyMatcher.ts
++++++@@ -0,0 +1,114 @@
+++++++export interface FuzzyMatchOptions {
+++++++  maxDistance?: number;
+++++++}
+++++++
+++++++/**
+++++++ * Normalizes text for Indonesian language matching:
+++++++ * - Converts to lowercase
+++++++ * - Strips punctuation and special characters
+++++++ * - Normalizes whitespace
+++++++ */
+++++++export function normalizeText(text: string): string {
+++++++  if (!text) return '';
+++++++  return text
+++++++    .toLowerCase()
+++++++    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'<>@+\\|[\]]/g, '')
+++++++    .replace(/\s+/g, ' ')
+++++++    .trim();
+++++++}
+++++++
+++++++/**
+++++++ * Calculates the Levenshtein distance between two strings.
+++++++ */
+++++++export function levenshteinDistance(a: string, b: string): number {
+++++++  const m = a.length;
+++++++  const n = b.length;
+++++++
+++++++  if (m === 0) return n;
+++++++  if (n === 0) return m;
+++++++
+++++++  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
+++++++
+++++++  for (let i = 0; i <= m; i++) {
+++++++    dp[i][0] = i;
+++++++  }
+++++++  for (let j = 0; j <= n; j++) {
+++++++    dp[0][j] = j;
+++++++  }
+++++++
+++++++  for (let i = 1; i <= m; i++) {
+++++++    for (let j = 1; j <= n; j++) {
+++++++      if (a[i - 1] === b[j - 1]) {
+++++++        dp[i][j] = dp[i - 1][j - 1];
+++++++      } else {
+++++++        dp[i][j] = Math.min(
+++++++          dp[i - 1][j] + 1,     // deletion
+++++++          dp[i][j - 1] + 1,     // insertion
+++++++          dp[i - 1][j - 1] + 1  // substitution
+++++++        );
+++++++      }
+++++++    }
+++++++  }
+++++++
+++++++  return dp[m][n];
+++++++}
+++++++
+++++++/**
+++++++ * Determines whether guessed string is a fuzzy match for target string.
+++++++ * Default rule:
+++++++ * - Length < 4: exact match (tolerance 0)
+++++++ * - Length 4-7: tolerance <= 1
+++++++ * - Length > 7: tolerance <= 2
+++++++ */
+++++++export function isFuzzyMatch(
+++++++  guessed: string,
+++++++  target: string,
+++++++  options?: FuzzyMatchOptions
+++++++): boolean {
+++++++  const normalizedGuessed = normalizeText(guessed);
+++++++  const normalizedTarget = normalizeText(target);
+++++++
+++++++  if (normalizedGuessed === normalizedTarget) {
+++++++    return true;
+++++++  }
+++++++
+++++++  if (!normalizedGuessed || !normalizedTarget) {
+++++++    return false;
+++++++  }
+++++++
+++++++  const lenGuessed = normalizedGuessed.length;
+++++++  const lenTarget = normalizedTarget.length;
+++++++  let tolerance = 0;
+++++++
+++++++  if (options && options.maxDistance !== undefined) {
+++++++    tolerance = options.maxDistance;
+++++++  } else {
+++++++    const minLength = Math.min(lenGuessed, lenTarget);
+++++++    const maxLength = Math.max(lenGuessed, lenTarget);
+++++++
+++++++    if (minLength < 4) {
+++++++      tolerance = 0;
+++++++    } else if (maxLength <= 7) {
+++++++      tolerance = 1;
+++++++    } else {
+++++++      tolerance = 2;
+++++++    }
+++++++  }
+++++++
+++++++  const distance = levenshteinDistance(normalizedGuessed, normalizedTarget);
+++++++  return distance <= tolerance;
+++++++}
+++++++
+++++++export class FuzzyMatcher {
+++++++  static isMatch(guessed: string, target: string, options?: FuzzyMatchOptions): boolean {
+++++++    return isFuzzyMatch(guessed, target, options);
+++++++  }
+++++++
+++++++  static distance(a: string, b: string): number {
+++++++    return levenshteinDistance(normalizeText(a), normalizeText(b));
+++++++  }
+++++++
+++++++  static normalize(text: string): string {
+++++++    return normalizeText(text);
+++++++  }
+++++++}
++++++diff --git a/client/src/utils/gameEngine.ts b/client/src/utils/gameEngine.ts
++++++new file mode 100644
++++++index 0000000..94bd3d0
++++++--- /dev/null
+++++++++ b/client/src/utils/gameEngine.ts
++++++@@ -0,0 +1,207 @@
+++++++import { Player, GameSettings, WordPair, PlayerRole } from '../types/game.types';
+++++++
+++++++export interface RoleAssignmentResult {
+++++++  players: Player[];
+++++++  speakingOrder: string[];
+++++++}
+++++++
+++++++export interface VoteCalculationResult {
+++++++  isTie: boolean;
+++++++  eliminatedPlayerId: string | null;
+++++++  voteCounts: Record<string, number>;
+++++++}
+++++++
+++++++/**
+++++++ * Shuffles an array in-place using Fisher-Yates algorithm and returns a new shuffled array.
+++++++ */
+++++++export function shuffleArray<T>(array: readonly T[]): T[] {
+++++++  const result = [...array];
+++++++  for (let i = result.length - 1; i > 0; i--) {
+++++++    const j = Math.floor(Math.random() * (i + 1));
+++++++    [result[i], result[j]] = [result[j], result[i]];
+++++++  }
+++++++  return result;
+++++++}
+++++++
+++++++/**
+++++++ * Assigns roles and words to all players according to room settings and selected word pair.
+++++++ */
+++++++export function assignRoles(
+++++++  players: Player[],
+++++++  settings: GameSettings,
+++++++  wordPair: WordPair
+++++++): RoleAssignmentResult {
+++++++  const totalPlayers = players.length;
+++++++  const undercoverCount = settings.undercoverCount || 0;
+++++++  const mrWhiteCount = settings.enableMrWhite ? (settings.mrWhiteCount || 0) : 0;
+++++++  const civilianCount = totalPlayers - undercoverCount - mrWhiteCount;
+++++++
+++++++  if (civilianCount < 1 || undercoverCount < 1 || totalPlayers < (undercoverCount + mrWhiteCount + 1)) {
+++++++    throw new Error(
+++++++      `Invalid role configuration: ${totalPlayers} players is insufficient for ${civilianCount} Civilians, ${undercoverCount} Undercovers, and ${mrWhiteCount} Mr. White.`
+++++++    );
+++++++  }
+++++++
+++++++  const rolePool: PlayerRole[] = [
+++++++    ...Array(undercoverCount).fill('UNDERCOVER' as PlayerRole),
+++++++    ...Array(mrWhiteCount).fill('MR_WHITE' as PlayerRole),
+++++++    ...Array(civilianCount).fill('CIVILIAN' as PlayerRole),
+++++++  ];
+++++++
+++++++  const shuffledRoles = shuffleArray(rolePool);
+++++++
+++++++  const assignedPlayers: Player[] = players.map((player, index) => {
+++++++    const role = shuffledRoles[index];
+++++++    let word = '';
+++++++
+++++++    if (role === 'CIVILIAN') {
+++++++      word = wordPair.civilianWord;
+++++++    } else if (role === 'UNDERCOVER') {
+++++++      word = wordPair.undercoverWord;
+++++++    } else if (role === 'MR_WHITE') {
+++++++      word = '';
+++++++    }
+++++++
+++++++    return {
+++++++      ...player,
+++++++      role,
+++++++      word,
+++++++      isAlive: true,
+++++++      hasVoted: false,
+++++++      votedTargetId: undefined,
+++++++      isSpeaking: false,
+++++++    };
+++++++  });
+++++++
+++++++  const speakingOrder = shuffleArray(assignedPlayers.map((p) => p.id));
+++++++
+++++++  return {
+++++++    players: assignedPlayers,
+++++++    speakingOrder,
+++++++  };
+++++++}
+++++++
+++++++/**
+++++++ * Calculates the tally of votes for active players.
+++++++ * If 2 or more candidates have the same highest votes, returns isTie = true (Instant Skip rule).
+++++++ */
+++++++export function calculateVotes(
+++++++  votes: Record<string, string>,
+++++++  activePlayers: Player[]
+++++++): VoteCalculationResult {
+++++++  const alivePlayers = activePlayers.filter((p) => p.isAlive);
+++++++  const aliveIds = new Set(alivePlayers.map((p) => p.id));
+++++++
+++++++  const voteCounts: Record<string, number> = {};
+++++++  alivePlayers.forEach((p) => {
+++++++    voteCounts[p.id] = 0;
+++++++  });
+++++++
+++++++  Object.entries(votes).forEach(([voterId, targetId]) => {
+++++++    if (aliveIds.has(voterId) && aliveIds.has(targetId)) {
+++++++      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
+++++++    }
+++++++  });
+++++++
+++++++  const totalVotesCast = Object.values(voteCounts).reduce((sum, count) => sum + count, 0);
+++++++
+++++++  if (totalVotesCast === 0) {
+++++++    return {
+++++++      isTie: true,
+++++++      eliminatedPlayerId: null,
+++++++      voteCounts,
+++++++    };
+++++++  }
+++++++
+++++++  const maxVotes = Math.max(...Object.values(voteCounts));
+++++++
+++++++  if (maxVotes === 0) {
+++++++    return {
+++++++      isTie: true,
+++++++      eliminatedPlayerId: null,
+++++++      voteCounts,
+++++++    };
+++++++  }
+++++++
+++++++  const topCandidates = Object.keys(voteCounts).filter(
+++++++    (playerId) => voteCounts[playerId] === maxVotes
+++++++  );
+++++++
+++++++  if (topCandidates.length === 1) {
+++++++    return {
+++++++      isTie: false,
+++++++      eliminatedPlayerId: topCandidates[0],
+++++++      voteCounts,
+++++++    };
+++++++  }
+++++++
+++++++  // Instant Skip on Tie
+++++++  return {
+++++++    isTie: true,
+++++++    eliminatedPlayerId: null,
+++++++    voteCounts,
+++++++  };
+++++++}
+++++++
+++++++/**
+++++++ * Checks whether any team has achieved victory.
+++++++ * Returns: 'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE' | null
+++++++ */
+++++++export function checkWinCondition(players: Player[]): 'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE' | null {
+++++++  const alive = players.filter((p) => p.isAlive);
+++++++  const aliveCivilians = alive.filter((p) => p.role === 'CIVILIAN').length;
+++++++  const aliveUndercovers = alive.filter((p) => p.role === 'UNDERCOVER').length;
+++++++  const aliveMrWhites = alive.filter((p) => p.role === 'MR_WHITE').length;
+++++++  const totalAlive = alive.length;
+++++++
+++++++  // 1. Civilian Victory: All Undercovers and Mr. Whites are eliminated
+++++++  if (aliveCivilians > 0 && aliveUndercovers === 0 && aliveMrWhites === 0) {
+++++++    return 'CIVILIAN';
+++++++  }
+++++++
+++++++  // 2. Mr. White Victory: Survives to the final 2 players
+++++++  if (aliveMrWhites > 0 && totalAlive <= 2) {
+++++++    return 'MR_WHITE';
+++++++  }
+++++++
+++++++  // 3. Undercover Victory: Alive Undercovers >= Alive Civilians
+++++++  if (aliveUndercovers > 0 && aliveUndercovers >= aliveCivilians) {
+++++++    return 'UNDERCOVER';
+++++++  }
+++++++
+++++++  // 4. All civilians eliminated fallback
+++++++  if (aliveCivilians === 0) {
+++++++    if (aliveUndercovers > 0) return 'UNDERCOVER';
+++++++    if (aliveMrWhites > 0) return 'MR_WHITE';
+++++++  }
+++++++
+++++++  // Game continues
+++++++  return null;
+++++++}
+++++++
+++++++export class GameEngine {
+++++++  static assignRoles(
+++++++    players: Player[],
+++++++    settings: GameSettings,
+++++++    wordPair: WordPair
+++++++  ): RoleAssignmentResult {
+++++++    return assignRoles(players, settings, wordPair);
+++++++  }
+++++++
+++++++  static calculateVotes(
+++++++    votes: Record<string, string>,
+++++++    activePlayers: Player[]
+++++++  ): VoteCalculationResult {
+++++++    return calculateVotes(votes, activePlayers);
+++++++  }
+++++++
+++++++  static checkWinCondition(
+++++++    players: Player[]
+++++++  ): 'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE' | null {
+++++++    return checkWinCondition(players);
+++++++  }
+++++++
+++++++  static shuffle<T>(array: readonly T[]): T[] {
+++++++    return shuffleArray(array);
+++++++  }
+++++++}
++++++diff --git a/server/src/data/defaultWordPacks.ts b/server/src/data/defaultWordPacks.ts
++++++new file mode 100644
++++++index 0000000..7489c80
++++++--- /dev/null
+++++++++ b/server/src/data/defaultWordPacks.ts
++++++@@ -0,0 +1,145 @@
+++++++import { WordPair, WordPack } from '../types/game.types.js';
+++++++
+++++++export const CATEGORIES = [
+++++++  'Semua Kategori',
+++++++  'Makanan & Minuman',
+++++++  'Hewan',
+++++++  'Benda & Gadget',
+++++++  'Tempat & Hiburan',
+++++++  'Profesi',
+++++++] as const;
+++++++
+++++++export type WordCategory = (typeof CATEGORIES)[number];
+++++++
+++++++export const DEFAULT_WORD_PAIRS: WordPair[] = [
+++++++  // 1. Makanan & Minuman (14 pairs)
+++++++  { id: 'mkn-01', category: 'Makanan & Minuman', civilianWord: 'Kopi', undercoverWord: 'Teh' },
+++++++  { id: 'mkn-02', category: 'Makanan & Minuman', civilianWord: 'Bakso', undercoverWord: 'Mie Ayam' },
+++++++  { id: 'mkn-03', category: 'Makanan & Minuman', civilianWord: 'Rendang', undercoverWord: 'Gulai' },
+++++++  { id: 'mkn-04', category: 'Makanan & Minuman', civilianWord: 'Martabak Manis', undercoverWord: 'Terang Bulan' },
+++++++  { id: 'mkn-05', category: 'Makanan & Minuman', civilianWord: 'Nasi Padang', undercoverWord: 'Nasi Uduk' },
+++++++  { id: 'mkn-06', category: 'Makanan & Minuman', civilianWord: 'Nasi Goreng', undercoverWord: 'Mie Goreng' },
+++++++  { id: 'mkn-07', category: 'Makanan & Minuman', civilianWord: 'Es Kelapa', undercoverWord: 'Es Cendol' },
+++++++  { id: 'mkn-08', category: 'Makanan & Minuman', civilianWord: 'Sate Ayam', undercoverWord: 'Sate Kambing' },
+++++++  { id: 'mkn-09', category: 'Makanan & Minuman', civilianWord: 'Pempek', undercoverWord: 'Siomay' },
+++++++  { id: 'mkn-10', category: 'Makanan & Minuman', civilianWord: 'Roti Bakar', undercoverWord: 'Pisang Bakar' },
+++++++  { id: 'mkn-11', category: 'Makanan & Minuman', civilianWord: 'Soto Ayam', undercoverWord: 'Rawon' },
+++++++  { id: 'mkn-12', category: 'Makanan & Minuman', civilianWord: 'Jus Alpukat', undercoverWord: 'Jus Mangga' },
+++++++  { id: 'mkn-13', category: 'Makanan & Minuman', civilianWord: 'Kerupuk', undercoverWord: 'Keripik' },
+++++++  { id: 'mkn-14', category: 'Makanan & Minuman', civilianWord: 'Sambal Terasi', undercoverWord: 'Sambal Matah' },
+++++++
+++++++  // 2. Hewan (13 pairs)
+++++++  { id: 'hwn-01', category: 'Hewan', civilianWord: 'Kucing', undercoverWord: 'Harimau' },
+++++++  { id: 'hwn-02', category: 'Hewan', civilianWord: 'Bebek', undercoverWord: 'Ayam' },
+++++++  { id: 'hwn-03', category: 'Hewan', civilianWord: 'Paus', undercoverWord: 'Lumba-lumba' },
+++++++  { id: 'hwn-04', category: 'Hewan', civilianWord: 'Elang', undercoverWord: 'Burung Hantu' },
+++++++  { id: 'hwn-05', category: 'Hewan', civilianWord: 'Kelinci', undercoverWord: 'Hamster' },
+++++++  { id: 'hwn-06', category: 'Hewan', civilianWord: 'Singa', undercoverWord: 'Macan Tutul' },
+++++++  { id: 'hwn-07', category: 'Hewan', civilianWord: 'Gajah', undercoverWord: 'Badak' },
+++++++  { id: 'hwn-08', category: 'Hewan', civilianWord: 'Buaya', undercoverWord: 'Alligator' },
+++++++  { id: 'hwn-09', category: 'Hewan', civilianWord: 'Kuda', undercoverWord: 'Keledai' },
+++++++  { id: 'hwn-10', category: 'Hewan', civilianWord: 'Kupu-kupu', undercoverWord: 'Capung' },
+++++++  { id: 'hwn-11', category: 'Hewan', civilianWord: 'Lebah', undercoverWord: 'Tawon' },
+++++++  { id: 'hwn-12', category: 'Hewan', civilianWord: 'Hiu', undercoverWord: 'Ikan Pari' },
+++++++  { id: 'hwn-13', category: 'Hewan', civilianWord: 'Beruang', undercoverWord: 'Panda' },
+++++++
+++++++  // 3. Benda & Gadget (13 pairs)
+++++++  { id: 'bnd-01', category: 'Benda & Gadget', civilianWord: 'Laptop', undercoverWord: 'Komputer' },
+++++++  { id: 'bnd-02', category: 'Benda & Gadget', civilianWord: 'Smartphone', undercoverWord: 'Tablet' },
+++++++  { id: 'bnd-03', category: 'Benda & Gadget', civilianWord: 'Headphone', undercoverWord: 'Earphone' },
+++++++  { id: 'bnd-04', category: 'Benda & Gadget', civilianWord: 'Kipas Angin', undercoverWord: 'AC' },
+++++++  { id: 'bnd-05', category: 'Benda & Gadget', civilianWord: 'Jam Tangan', undercoverWord: 'Jam Dinding' },
+++++++  { id: 'bnd-06', category: 'Benda & Gadget', civilianWord: 'Televisi', undercoverWord: 'Proyektor' },
+++++++  { id: 'bnd-07', category: 'Benda & Gadget', civilianWord: 'Sepeda', undercoverWord: 'Motor' },
+++++++  { id: 'bnd-08', category: 'Benda & Gadget', civilianWord: 'Kacamata', undercoverWord: 'Lensa Kontak' },
+++++++  { id: 'bnd-09', category: 'Benda & Gadget', civilianWord: 'Dompet', undercoverWord: 'Tas' },
+++++++  { id: 'bnd-10', category: 'Benda & Gadget', civilianWord: 'Pulpen', undercoverWord: 'Pensil' },
+++++++  { id: 'bnd-11', category: 'Benda & Gadget', civilianWord: 'Payung', undercoverWord: 'Jas Hujan' },
+++++++  { id: 'bnd-12', category: 'Benda & Gadget', civilianWord: 'Senter', undercoverWord: 'Lilin' },
+++++++  { id: 'bnd-13', category: 'Benda & Gadget', civilianWord: 'Pintu', undercoverWord: 'Jendela' },
+++++++
+++++++  // 4. Tempat & Hiburan (12 pairs)
+++++++  { id: 'tmp-01', category: 'Tempat & Hiburan', civilianWord: 'Bioskop', undercoverWord: 'Teater' },
+++++++  { id: 'tmp-02', category: 'Tempat & Hiburan', civilianWord: 'Pantai', undercoverWord: 'Danau' },
+++++++  { id: 'tmp-03', category: 'Tempat & Hiburan', civilianWord: 'Supermarket', undercoverWord: 'Pasar Tradisional' },
+++++++  { id: 'tmp-04', category: 'Tempat & Hiburan', civilianWord: 'Museum', undercoverWord: 'Perpustakaan' },
+++++++  { id: 'tmp-05', category: 'Tempat & Hiburan', civilianWord: 'Hotel', undercoverWord: 'Villa' },
+++++++  { id: 'tmp-06', category: 'Tempat & Hiburan', civilianWord: 'Taman Hiburan', undercoverWord: 'Kebun Binatang' },
+++++++  { id: 'tmp-07', category: 'Tempat & Hiburan', civilianWord: 'Restoran', undercoverWord: 'Kafe' },
+++++++  { id: 'tmp-08', category: 'Tempat & Hiburan', civilianWord: 'Rumah Sakit', undercoverWord: 'Puskesmas' },
+++++++  { id: 'tmp-09', category: 'Tempat & Hiburan', civilianWord: 'Bandara', undercoverWord: 'Stasiun Kereta' },
+++++++  { id: 'tmp-10', category: 'Tempat & Hiburan', civilianWord: 'Kolam Renang', undercoverWord: 'Waterpark' },
+++++++  { id: 'tmp-11', category: 'Tempat & Hiburan', civilianWord: 'Gunung', undercoverWord: 'Bukit' },
+++++++  { id: 'tmp-12', category: 'Tempat & Hiburan', civilianWord: 'Mall', undercoverWord: 'Pasar Malam' },
+++++++
+++++++  // 5. Profesi (12 pairs)
+++++++  { id: 'prf-01', category: 'Profesi', civilianWord: 'Dokter', undercoverWord: 'Perawat' },
+++++++  { id: 'prf-02', category: 'Profesi', civilianWord: 'Pilot', undercoverWord: 'Masinis' },
+++++++  { id: 'prf-03', category: 'Profesi', civilianWord: 'Polisi', undercoverWord: 'Tentara' },
+++++++  { id: 'prf-04', category: 'Profesi', civilianWord: 'Koki', undercoverWord: 'Barista' },
+++++++  { id: 'prf-05', category: 'Profesi', civilianWord: 'Guru', undercoverWord: 'Dosen' },
+++++++  { id: 'prf-06', category: 'Profesi', civilianWord: 'Pemadam Kebakaran', undercoverWord: 'Tim SAR' },
+++++++  { id: 'prf-07', category: 'Profesi', civilianWord: 'Arsitek', undercoverWord: 'Insinyur' },
+++++++  { id: 'prf-08', category: 'Profesi', civilianWord: 'Hakim', undercoverWord: 'Pengacara' },
+++++++  { id: 'prf-09', category: 'Profesi', civilianWord: 'Wartawan', undercoverWord: 'Fotografer' },
+++++++  { id: 'prf-10', category: 'Profesi', civilianWord: 'Pramugari', undercoverWord: 'Resepsionis' },
+++++++  { id: 'prf-11', category: 'Profesi', civilianWord: 'Sopir Bus', undercoverWord: 'Supir Taksi' },
+++++++  { id: 'prf-12', category: 'Profesi', civilianWord: 'Aktor', undercoverWord: 'Penyanyi' },
+++++++];
+++++++
+++++++export const DEFAULT_WORD_PACKS: WordPack[] = [
+++++++  {
+++++++    id: 'pack-makanan',
+++++++    name: 'Makanan & Minuman Indonesia',
+++++++    category: 'Makanan & Minuman',
+++++++    description: 'Kuliner populer, jajanan pasar, dan minuman khas Indonesia',
+++++++    isOfficial: true,
+++++++    wordPairs: DEFAULT_WORD_PAIRS.filter((wp) => wp.category === 'Makanan & Minuman'),
+++++++  },
+++++++  {
+++++++    id: 'pack-hewan',
+++++++    name: 'Dunia Hewan',
+++++++    category: 'Hewan',
+++++++    description: 'Fauna darat, air, udara, dan hewan peliharaan',
+++++++    isOfficial: true,
+++++++    wordPairs: DEFAULT_WORD_PAIRS.filter((wp) => wp.category === 'Hewan'),
+++++++  },
+++++++  {
+++++++    id: 'pack-gadget',
+++++++    name: 'Benda & Gadget',
+++++++    category: 'Benda & Gadget',
+++++++    description: 'Peralatan elektronik, perabotan rumah tangga, dan teknologi',
+++++++    isOfficial: true,
+++++++    wordPairs: DEFAULT_WORD_PAIRS.filter((wp) => wp.category === 'Benda & Gadget'),
+++++++  },
+++++++  {
+++++++    id: 'pack-tempat',
+++++++    name: 'Tempat & Hiburan',
+++++++    category: 'Tempat & Hiburan',
+++++++    description: 'Destinasi wisata, fasilitas publik, dan tempat rekreasi',
+++++++    isOfficial: true,
+++++++    wordPairs: DEFAULT_WORD_PAIRS.filter((wp) => wp.category === 'Tempat & Hiburan'),
+++++++  },
+++++++  {
+++++++    id: 'pack-profesi',
+++++++    name: 'Profesi & Pekerjaan',
+++++++    category: 'Profesi',
+++++++    description: 'Karier, pekerjaan umum, dan tenaga profesional',
+++++++    isOfficial: true,
+++++++    wordPairs: DEFAULT_WORD_PAIRS.filter((wp) => wp.category === 'Profesi'),
+++++++  },
+++++++];
+++++++
+++++++export function getWordPairsByCategory(category?: string): WordPair[] {
+++++++  if (!category || category === 'Semua Kategori') {
+++++++    return DEFAULT_WORD_PAIRS;
+++++++  }
+++++++  const filtered = DEFAULT_WORD_PAIRS.filter((wp) => wp.category.toLowerCase() === category.toLowerCase());
+++++++  return filtered.length > 0 ? filtered : DEFAULT_WORD_PAIRS;
+++++++}
+++++++
+++++++export function getRandomWordPair(category?: string): WordPair {
+++++++  const pool = getWordPairsByCategory(category);
+++++++  const randomIndex = Math.floor(Math.random() * pool.length);
+++++++  return pool[randomIndex];
+++++++}
++++++diff --git a/server/src/engine/FuzzyMatcher.ts b/server/src/engine/FuzzyMatcher.ts
++++++new file mode 100644
++++++index 0000000..da97441
++++++--- /dev/null
+++++++++ b/server/src/engine/FuzzyMatcher.ts
++++++@@ -0,0 +1,115 @@
+++++++export interface FuzzyMatchOptions {
+++++++  maxDistance?: number;
+++++++}
+++++++
+++++++/**
+++++++ * Normalizes text for Indonesian language matching:
+++++++ * - Converts to lowercase
+++++++ * - Strips punctuation and special characters
+++++++ * - Normalizes whitespace
+++++++ */
+++++++export function normalizeText(text: string): string {
+++++++  if (!text) return '';
+++++++  return text
+++++++    .toLowerCase()
+++++++    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'<>@+\\|[\]]/g, '')
+++++++    .replace(/\s+/g, ' ')
+++++++    .trim();
+++++++}
+++++++
+++++++/**
+++++++ * Calculates the Levenshtein distance between two strings.
+++++++ */
+++++++export function levenshteinDistance(a: string, b: string): number {
+++++++  const m = a.length;
+++++++  const n = b.length;
+++++++
+++++++  if (m === 0) return n;
+++++++  if (n === 0) return m;
+++++++
+++++++  // Single or double row optimization for memory efficiency
+++++++  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
+++++++
+++++++  for (let i = 0; i <= m; i++) {
+++++++    dp[i][0] = i;
+++++++  }
+++++++  for (let j = 0; j <= n; j++) {
+++++++    dp[0][j] = j;
+++++++  }
+++++++
+++++++  for (let i = 1; i <= m; i++) {
+++++++    for (let j = 1; j <= n; j++) {
+++++++      if (a[i - 1] === b[j - 1]) {
+++++++        dp[i][j] = dp[i - 1][j - 1];
+++++++      } else {
+++++++        dp[i][j] = Math.min(
+++++++          dp[i - 1][j] + 1,     // deletion
+++++++          dp[i][j - 1] + 1,     // insertion
+++++++          dp[i - 1][j - 1] + 1  // substitution
+++++++        );
+++++++      }
+++++++    }
+++++++  }
+++++++
+++++++  return dp[m][n];
+++++++}
+++++++
+++++++/**
+++++++ * Determines whether guessed string is a fuzzy match for target string.
+++++++ * Default rule:
+++++++ * - Length < 4: exact match (tolerance 0)
+++++++ * - Length 4-7: tolerance <= 1
+++++++ * - Length > 7: tolerance <= 2
+++++++ */
+++++++export function isFuzzyMatch(
+++++++  guessed: string,
+++++++  target: string,
+++++++  options?: FuzzyMatchOptions
+++++++): boolean {
+++++++  const normalizedGuessed = normalizeText(guessed);
+++++++  const normalizedTarget = normalizeText(target);
+++++++
+++++++  if (normalizedGuessed === normalizedTarget) {
+++++++    return true;
+++++++  }
+++++++
+++++++  if (!normalizedGuessed || !normalizedTarget) {
+++++++    return false;
+++++++  }
+++++++
+++++++  const lenGuessed = normalizedGuessed.length;
+++++++  const lenTarget = normalizedTarget.length;
+++++++  let tolerance = 0;
+++++++
+++++++  if (options && options.maxDistance !== undefined) {
+++++++    tolerance = options.maxDistance;
+++++++  } else {
+++++++    const minLength = Math.min(lenGuessed, lenTarget);
+++++++    const maxLength = Math.max(lenGuessed, lenTarget);
+++++++
+++++++    if (minLength < 4) {
+++++++      tolerance = 0;
+++++++    } else if (maxLength <= 7) {
+++++++      tolerance = 1;
+++++++    } else {
+++++++      tolerance = 2;
+++++++    }
+++++++  }
+++++++
+++++++  const distance = levenshteinDistance(normalizedGuessed, normalizedTarget);
+++++++  return distance <= tolerance;
+++++++}
+++++++
+++++++export class FuzzyMatcher {
+++++++  static isMatch(guessed: string, target: string, options?: FuzzyMatchOptions): boolean {
+++++++    return isFuzzyMatch(guessed, target, options);
+++++++  }
+++++++
+++++++  static distance(a: string, b: string): number {
+++++++    return levenshteinDistance(normalizeText(a), normalizeText(b));
+++++++  }
+++++++
+++++++  static normalize(text: string): string {
+++++++    return normalizeText(text);
+++++++  }
+++++++}
++++++diff --git a/server/src/engine/GameEngine.ts b/server/src/engine/GameEngine.ts
++++++new file mode 100644
++++++index 0000000..3ca95a4
++++++--- /dev/null
+++++++++ b/server/src/engine/GameEngine.ts
++++++@@ -0,0 +1,207 @@
+++++++import { Player, GameSettings, WordPair, PlayerRole } from '../types/game.types.js';
+++++++
+++++++export interface RoleAssignmentResult {
+++++++  players: Player[];
+++++++  speakingOrder: string[];
+++++++}
+++++++
+++++++export interface VoteCalculationResult {
+++++++  isTie: boolean;
+++++++  eliminatedPlayerId: string | null;
+++++++  voteCounts: Record<string, number>;
+++++++}
+++++++
+++++++/**
+++++++ * Shuffles an array in-place using Fisher-Yates algorithm and returns a new shuffled array.
+++++++ */
+++++++export function shuffleArray<T>(array: readonly T[]): T[] {
+++++++  const result = [...array];
+++++++  for (let i = result.length - 1; i > 0; i--) {
+++++++    const j = Math.floor(Math.random() * (i + 1));
+++++++    [result[i], result[j]] = [result[j], result[i]];
+++++++  }
+++++++  return result;
+++++++}
+++++++
+++++++/**
+++++++ * Assigns roles and words to all players according to room settings and selected word pair.
+++++++ */
+++++++export function assignRoles(
+++++++  players: Player[],
+++++++  settings: GameSettings,
+++++++  wordPair: WordPair
+++++++): RoleAssignmentResult {
+++++++  const totalPlayers = players.length;
+++++++  const undercoverCount = settings.undercoverCount || 0;
+++++++  const mrWhiteCount = settings.enableMrWhite ? (settings.mrWhiteCount || 0) : 0;
+++++++  const civilianCount = totalPlayers - undercoverCount - mrWhiteCount;
+++++++
+++++++  if (civilianCount < 1 || undercoverCount < 1 || totalPlayers < (undercoverCount + mrWhiteCount + 1)) {
+++++++    throw new Error(
+++++++      `Invalid role configuration: ${totalPlayers} players is insufficient for ${civilianCount} Civilians, ${undercoverCount} Undercovers, and ${mrWhiteCount} Mr. White.`
+++++++    );
+++++++  }
+++++++
+++++++  const rolePool: PlayerRole[] = [
+++++++    ...Array(undercoverCount).fill('UNDERCOVER' as PlayerRole),
+++++++    ...Array(mrWhiteCount).fill('MR_WHITE' as PlayerRole),
+++++++    ...Array(civilianCount).fill('CIVILIAN' as PlayerRole),
+++++++  ];
+++++++
+++++++  const shuffledRoles = shuffleArray(rolePool);
+++++++
+++++++  const assignedPlayers: Player[] = players.map((player, index) => {
+++++++    const role = shuffledRoles[index];
+++++++    let word = '';
+++++++
+++++++    if (role === 'CIVILIAN') {
+++++++      word = wordPair.civilianWord;
+++++++    } else if (role === 'UNDERCOVER') {
+++++++      word = wordPair.undercoverWord;
+++++++    } else if (role === 'MR_WHITE') {
+++++++      word = '';
+++++++    }
+++++++
+++++++    return {
+++++++      ...player,
+++++++      role,
+++++++      word,
+++++++      isAlive: true,
+++++++      hasVoted: false,
+++++++      votedTargetId: undefined,
+++++++      isSpeaking: false,
+++++++    };
+++++++  });
+++++++
+++++++  const speakingOrder = shuffleArray(assignedPlayers.map((p) => p.id));
+++++++
+++++++  return {
+++++++    players: assignedPlayers,
+++++++    speakingOrder,
+++++++  };
+++++++}
+++++++
+++++++/**
+++++++ * Calculates the tally of votes for active players.
+++++++ * If 2 or more candidates have the same highest votes, returns isTie = true (Instant Skip rule).
+++++++ */
+++++++export function calculateVotes(
+++++++  votes: Record<string, string>,
+++++++  activePlayers: Player[]
+++++++): VoteCalculationResult {
+++++++  const alivePlayers = activePlayers.filter((p) => p.isAlive);
+++++++  const aliveIds = new Set(alivePlayers.map((p) => p.id));
+++++++
+++++++  const voteCounts: Record<string, number> = {};
+++++++  alivePlayers.forEach((p) => {
+++++++    voteCounts[p.id] = 0;
+++++++  });
+++++++
+++++++  Object.entries(votes).forEach(([voterId, targetId]) => {
+++++++    if (aliveIds.has(voterId) && aliveIds.has(targetId)) {
+++++++      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
+++++++    }
+++++++  });
+++++++
+++++++  const totalVotesCast = Object.values(voteCounts).reduce((sum, count) => sum + count, 0);
+++++++
+++++++  if (totalVotesCast === 0) {
+++++++    return {
+++++++      isTie: true,
+++++++      eliminatedPlayerId: null,
+++++++      voteCounts,
+++++++    };
+++++++  }
+++++++
+++++++  const maxVotes = Math.max(...Object.values(voteCounts));
+++++++
+++++++  if (maxVotes === 0) {
+++++++    return {
+++++++      isTie: true,
+++++++      eliminatedPlayerId: null,
+++++++      voteCounts,
+++++++    };
+++++++  }
+++++++
+++++++  const topCandidates = Object.keys(voteCounts).filter(
+++++++    (playerId) => voteCounts[playerId] === maxVotes
+++++++  );
+++++++
+++++++  if (topCandidates.length === 1) {
+++++++    return {
+++++++      isTie: false,
+++++++      eliminatedPlayerId: topCandidates[0],
+++++++      voteCounts,
+++++++    };
+++++++  }
+++++++
+++++++  // Instant Skip on Tie
+++++++  return {
+++++++    isTie: true,
+++++++    eliminatedPlayerId: null,
+++++++    voteCounts,
+++++++  };
+++++++}
+++++++
+++++++/**
+++++++ * Checks whether any team has achieved victory.
+++++++ * Returns: 'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE' | null
+++++++ */
+++++++export function checkWinCondition(players: Player[]): 'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE' | null {
+++++++  const alive = players.filter((p) => p.isAlive);
+++++++  const aliveCivilians = alive.filter((p) => p.role === 'CIVILIAN').length;
+++++++  const aliveUndercovers = alive.filter((p) => p.role === 'UNDERCOVER').length;
+++++++  const aliveMrWhites = alive.filter((p) => p.role === 'MR_WHITE').length;
+++++++  const totalAlive = alive.length;
+++++++
+++++++  // 1. Civilian Victory: All Undercovers and Mr. Whites are eliminated
+++++++  if (aliveCivilians > 0 && aliveUndercovers === 0 && aliveMrWhites === 0) {
+++++++    return 'CIVILIAN';
+++++++  }
+++++++
+++++++  // 2. Mr. White Victory: Survives to the final 2 players
+++++++  if (aliveMrWhites > 0 && totalAlive <= 2) {
+++++++    return 'MR_WHITE';
+++++++  }
+++++++
+++++++  // 3. Undercover Victory: Alive Undercovers >= Alive Civilians
+++++++  if (aliveUndercovers > 0 && aliveUndercovers >= aliveCivilians) {
+++++++    return 'UNDERCOVER';
+++++++  }
+++++++
+++++++  // 4. All civilians eliminated fallback
+++++++  if (aliveCivilians === 0) {
+++++++    if (aliveUndercovers > 0) return 'UNDERCOVER';
+++++++    if (aliveMrWhites > 0) return 'MR_WHITE';
+++++++  }
+++++++
+++++++  // Game continues
+++++++  return null;
+++++++}
+++++++
+++++++export class GameEngine {
+++++++  static assignRoles(
+++++++    players: Player[],
+++++++    settings: GameSettings,
+++++++    wordPair: WordPair
+++++++  ): RoleAssignmentResult {
+++++++    return assignRoles(players, settings, wordPair);
+++++++  }
+++++++
+++++++  static calculateVotes(
+++++++    votes: Record<string, string>,
+++++++    activePlayers: Player[]
+++++++  ): VoteCalculationResult {
+++++++    return calculateVotes(votes, activePlayers);
+++++++  }
+++++++
+++++++  static checkWinCondition(
+++++++    players: Player[]
+++++++  ): 'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE' | null {
+++++++    return checkWinCondition(players);
+++++++  }
+++++++
+++++++  static shuffle<T>(array: readonly T[]): T[] {
+++++++    return shuffleArray(array);
+++++++  }
+++++++}
++++++diff --git a/server/tests/FuzzyMatcher.test.ts b/server/tests/FuzzyMatcher.test.ts
++++++new file mode 100644
++++++index 0000000..ed664e8
++++++--- /dev/null
+++++++++ b/server/tests/FuzzyMatcher.test.ts
++++++@@ -0,0 +1,102 @@
+++++++import { describe, it, expect } from 'vitest';
+++++++import { FuzzyMatcher, isFuzzyMatch, levenshteinDistance, normalizeText } from '../src/engine/FuzzyMatcher.js';
+++++++
+++++++describe('FuzzyMatcher', () => {
+++++++  describe('normalizeText', () => {
+++++++    it('should convert text to lowercase and trim spaces', () => {
+++++++      expect(normalizeText('  Kopi  ')).toBe('kopi');
+++++++      expect(normalizeText('MIE AYAM')).toBe('mie ayam');
+++++++    });
+++++++
+++++++    it('should remove punctuation and special characters', () => {
+++++++      expect(normalizeText('kucing!')).toBe('kucing');
+++++++      expect(normalizeText('lumba-lumba')).toBe('lumbalumba');
+++++++      expect(normalizeText('teh, botol.')).toBe('teh botol');
+++++++    });
+++++++
+++++++    it('should collapse multiple spaces into a single space', () => {
+++++++      expect(normalizeText('mie   goreng   spesial')).toBe('mie goreng spesial');
+++++++    });
+++++++  });
+++++++
+++++++  describe('levenshteinDistance', () => {
+++++++    it('should calculate distance 0 for identical strings', () => {
+++++++      expect(levenshteinDistance('kopi', 'kopi')).toBe(0);
+++++++      expect(levenshteinDistance('', '')).toBe(0);
+++++++    });
+++++++
+++++++    it('should calculate distance for single edit operations', () => {
+++++++      expect(levenshteinDistance('kopi', 'topi')).toBe(1); // substitution
+++++++      expect(levenshteinDistance('kopi', 'kpi')).toBe(1);  // deletion
+++++++      expect(levenshteinDistance('kopi', 'kopis')).toBe(1); // insertion
+++++++    });
+++++++
+++++++    it('should calculate distance for complex differences', () => {
+++++++      expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
+++++++      expect(levenshteinDistance('martabak', 'terangbulan')).toBe(8);
+++++++    });
+++++++  });
+++++++
+++++++  describe('isFuzzyMatch', () => {
+++++++    describe('Short strings (length < 4): exact match only', () => {
+++++++      it('should match exact strings regardless of casing and whitespace', () => {
+++++++        expect(isFuzzyMatch('Teh', 'teh')).toBe(true);
+++++++        expect(isFuzzyMatch('  AIR  ', 'air')).toBe(true);
+++++++        expect(isFuzzyMatch('CAT', 'cat')).toBe(true);
+++++++      });
+++++++
+++++++      it('should reject typos for words with length < 4', () => {
+++++++        expect(isFuzzyMatch('Teh', 'Tek')).toBe(false);
+++++++        expect(isFuzzyMatch('Air', 'Ait')).toBe(false);
+++++++        expect(isFuzzyMatch('Bus', 'Bua')).toBe(false);
+++++++      });
+++++++    });
+++++++
+++++++    describe('Medium strings (length 4 - 7): tolerance <= 1', () => {
+++++++      it('should match exact and 1-typo words', () => {
+++++++        expect(isFuzzyMatch('Dokter', 'Dokter')).toBe(true);
+++++++        expect(isFuzzyMatch('Dokter', 'Doktr')).toBe(true); // 1 deletion
+++++++        expect(isFuzzyMatch('Dokter', 'Dotter')).toBe(true); // 1 substitution
+++++++        expect(isFuzzyMatch('Kucing', 'Kucikg')).toBe(true); // 1 substitution
+++++++        expect(isFuzzyMatch('Kucing', 'Kucingg')).toBe(true); // 1 insertion
+++++++      });
+++++++
+++++++      it('should reject words with 2 or more typos', () => {
+++++++        expect(isFuzzyMatch('Dokter', 'Dottxr')).toBe(false); // 2 edits
+++++++        expect(isFuzzyMatch('Kucing', 'Kudang')).toBe(false); // 2 edits
+++++++      });
+++++++    });
+++++++
+++++++    describe('Long strings (length > 7): tolerance <= 2', () => {
+++++++      it('should match exact and up to 2-typo words', () => {
+++++++        expect(isFuzzyMatch('Perpustakaan', 'Perpustakaan')).toBe(true);
+++++++        expect(isFuzzyMatch('Perpustakaan', 'Perpustkaan')).toBe(true); // 1 deletion
+++++++        expect(isFuzzyMatch('Perpustakaan', 'Perpustkan')).toBe(true);  // 2 deletions
+++++++        expect(isFuzzyMatch('Komputer', 'Komputr')).toBe(true);         // 1 deletion
+++++++        expect(isFuzzyMatch('Komputer', 'Komputre')).toBe(true);        // 2 edits
+++++++        expect(isFuzzyMatch('Komputer', 'Komptr')).toBe(true);          // 2 deletions
+++++++        expect(isFuzzyMatch('Supermarket', 'Supermarkit')).toBe(true);  // 1 substitution
+++++++      });
+++++++
+++++++      it('should reject words with 3 or more typos', () => {
+++++++        expect(isFuzzyMatch('Perpustakaan', 'Perpus')).toBe(false); // > 2 edits
+++++++        expect(isFuzzyMatch('Supermarket', 'Superminimart')).toBe(false);
+++++++      });
+++++++    });
+++++++
+++++++    describe('Custom maxDistance option', () => {
+++++++      it('should respect custom maxDistance when provided', () => {
+++++++        expect(isFuzzyMatch('Teh', 'Tek', { maxDistance: 1 })).toBe(true);
+++++++        expect(isFuzzyMatch('Perpustakaan', 'Perpustkaan', { maxDistance: 0 })).toBe(false);
+++++++      });
+++++++    });
+++++++
+++++++    describe('FuzzyMatcher static class wrapper', () => {
+++++++      it('should expose isMatch method identically', () => {
+++++++        expect(FuzzyMatcher.isMatch('Bakso', 'Bakso')).toBe(true);
+++++++        expect(FuzzyMatcher.isMatch('Bakso', 'Bakzo')).toBe(true);
+++++++        expect(FuzzyMatcher.isMatch('Bakso', 'Gorengan')).toBe(false);
+++++++      });
+++++++    });
+++++++  });
+++++++});
++++++diff --git a/server/tests/GameEngine.test.ts b/server/tests/GameEngine.test.ts
++++++new file mode 100644
++++++index 0000000..31ffd8d
++++++--- /dev/null
+++++++++ b/server/tests/GameEngine.test.ts
++++++@@ -0,0 +1,256 @@
+++++++import { describe, it, expect } from 'vitest';
+++++++import { GameEngine, assignRoles, calculateVotes, checkWinCondition } from '../src/engine/GameEngine.js';
+++++++import { Player, GameSettings, WordPair } from '../src/types/game.types.js';
+++++++
+++++++describe('GameEngine', () => {
+++++++  const sampleWordPair: WordPair = {
+++++++    id: 'wp-1',
+++++++    category: 'Makanan & Minuman',
+++++++    civilianWord: 'Kopi',
+++++++    undercoverWord: 'Teh',
+++++++  };
+++++++
+++++++  const createMockPlayers = (count: number): Player[] => {
+++++++    return Array.from({ length: count }, (_, i) => ({
+++++++      id: `p-${i + 1}`,
+++++++      name: `Player ${i + 1}`,
+++++++      avatar: `avatar-${i + 1}`,
+++++++      isHost: i === 0,
+++++++      isAlive: true,
+++++++      hasVoted: false,
+++++++    }));
+++++++  };
+++++++
+++++++  describe('assignRoles', () => {
+++++++    it('should correctly assign roles and words for 4 players (1 Undercover, 0 Mr. White)', () => {
+++++++      const players = createMockPlayers(4);
+++++++      const settings: GameSettings = {
+++++++        category: 'Makanan & Minuman',
+++++++        civilianCount: 3,
+++++++        undercoverCount: 1,
+++++++        mrWhiteCount: 0,
+++++++        turnDurationSeconds: 30,
+++++++        enableMrWhite: false,
+++++++      };
+++++++
+++++++      const result = assignRoles(players, settings, sampleWordPair);
+++++++
+++++++      expect(result.players).toHaveLength(4);
+++++++      expect(result.speakingOrder).toHaveLength(4);
+++++++
+++++++      const undercovers = result.players.filter((p) => p.role === 'UNDERCOVER');
+++++++      const civilians = result.players.filter((p) => p.role === 'CIVILIAN');
+++++++      const mrWhites = result.players.filter((p) => p.role === 'MR_WHITE');
+++++++
+++++++      expect(undercovers).toHaveLength(1);
+++++++      expect(civilians).toHaveLength(3);
+++++++      expect(mrWhites).toHaveLength(0);
+++++++
+++++++      expect(undercovers[0].word).toBe('Teh');
+++++++      civilians.forEach((civ) => {
+++++++        expect(civ.word).toBe('Kopi');
+++++++        expect(civ.isAlive).toBe(true);
+++++++        expect(civ.hasVoted).toBe(false);
+++++++      });
+++++++
+++++++      // speakingOrder should contain all player IDs
+++++++      const playerIds = players.map((p) => p.id);
+++++++      expect(new Set(result.speakingOrder)).toEqual(new Set(playerIds));
+++++++    });
+++++++
+++++++    it('should assign Mr. White with empty word when enabled', () => {
+++++++      const players = createMockPlayers(6);
+++++++      const settings: GameSettings = {
+++++++        category: 'Makanan & Minuman',
+++++++        civilianCount: 4,
+++++++        undercoverCount: 1,
+++++++        mrWhiteCount: 1,
+++++++        turnDurationSeconds: 30,
+++++++        enableMrWhite: true,
+++++++      };
+++++++
+++++++      const result = assignRoles(players, settings, sampleWordPair);
+++++++
+++++++      const mrWhites = result.players.filter((p) => p.role === 'MR_WHITE');
+++++++      expect(mrWhites).toHaveLength(1);
+++++++      expect(mrWhites[0].word).toBe('');
+++++++
+++++++      const undercovers = result.players.filter((p) => p.role === 'UNDERCOVER');
+++++++      expect(undercovers).toHaveLength(1);
+++++++      expect(undercovers[0].word).toBe('Teh');
+++++++
+++++++      const civilians = result.players.filter((p) => p.role === 'CIVILIAN');
+++++++      expect(civilians).toHaveLength(4);
+++++++      civilians.forEach((c) => expect(c.word).toBe('Kopi'));
+++++++    });
+++++++
+++++++    it('should throw error if player count is insufficient for roles', () => {
+++++++      const players = createMockPlayers(2);
+++++++      const settings: GameSettings = {
+++++++        category: 'Makanan & Minuman',
+++++++        civilianCount: 2,
+++++++        undercoverCount: 1,
+++++++        mrWhiteCount: 1,
+++++++        turnDurationSeconds: 30,
+++++++        enableMrWhite: true,
+++++++      };
+++++++
+++++++      expect(() => assignRoles(players, settings, sampleWordPair)).toThrow();
+++++++    });
+++++++  });
+++++++
+++++++  describe('calculateVotes', () => {
+++++++    it('should eliminate the player with clear highest votes', () => {
+++++++      const activePlayers = createMockPlayers(4);
+++++++      const votes: Record<string, string> = {
+++++++        'p-1': 'p-2',
+++++++        'p-3': 'p-2',
+++++++        'p-4': 'p-2',
+++++++        'p-2': 'p-1',
+++++++      };
+++++++
+++++++      const result = calculateVotes(votes, activePlayers);
+++++++
+++++++      expect(result.isTie).toBe(false);
+++++++      expect(result.eliminatedPlayerId).toBe('p-2');
+++++++      expect(result.voteCounts['p-2']).toBe(3);
+++++++      expect(result.voteCounts['p-1']).toBe(1);
+++++++    });
+++++++
+++++++    it('should return instant skip tie when 2 players have identical highest votes', () => {
+++++++      const activePlayers = createMockPlayers(4);
+++++++      const votes: Record<string, string> = {
+++++++        'p-1': 'p-2',
+++++++        'p-3': 'p-2',
+++++++        'p-2': 'p-4',
+++++++        'p-4': 'p-4',
+++++++      };
+++++++
+++++++      const result = calculateVotes(votes, activePlayers);
+++++++
+++++++      expect(result.isTie).toBe(true);
+++++++      expect(result.eliminatedPlayerId).toBeNull();
+++++++      expect(result.voteCounts['p-2']).toBe(2);
+++++++      expect(result.voteCounts['p-4']).toBe(2);
+++++++    });
+++++++
+++++++    it('should return tie when 3 players have identical highest votes', () => {
+++++++      const activePlayers = createMockPlayers(6);
+++++++      const votes: Record<string, string> = {
+++++++        'p-1': 'p-2',
+++++++        'p-2': 'p-3',
+++++++        'p-3': 'p-4',
+++++++        'p-4': 'p-2',
+++++++        'p-5': 'p-3',
+++++++        'p-6': 'p-4',
+++++++      };
+++++++
+++++++      const result = calculateVotes(votes, activePlayers);
+++++++
+++++++      expect(result.isTie).toBe(true);
+++++++      expect(result.eliminatedPlayerId).toBeNull();
+++++++    });
+++++++
+++++++    it('should not treat tie for second place as a tie for highest', () => {
+++++++      const activePlayers = createMockPlayers(5);
+++++++      const votes: Record<string, string> = {
+++++++        'p-1': 'p-5',
+++++++        'p-2': 'p-5',
+++++++        'p-3': 'p-5',
+++++++        'p-4': 'p-1',
+++++++        'p-5': 'p-2',
+++++++      };
+++++++
+++++++      const result = calculateVotes(votes, activePlayers);
+++++++
+++++++      expect(result.isTie).toBe(false);
+++++++      expect(result.eliminatedPlayerId).toBe('p-5');
+++++++    });
+++++++
+++++++    it('should return tie and no elimination if no votes are cast', () => {
+++++++      const activePlayers = createMockPlayers(4);
+++++++      const votes: Record<string, string> = {};
+++++++
+++++++      const result = calculateVotes(votes, activePlayers);
+++++++
+++++++      expect(result.isTie).toBe(true);
+++++++      expect(result.eliminatedPlayerId).toBeNull();
+++++++    });
+++++++  });
+++++++
+++++++  describe('checkWinCondition', () => {
+++++++    it('should declare CIVILIAN win when all Undercover and Mr. White are eliminated', () => {
+++++++      const players: Player[] = [
+++++++        { id: '1', name: 'P1', avatar: 'a1', isHost: true, role: 'CIVILIAN', isAlive: true, hasVoted: false },
+++++++        { id: '2', name: 'P2', avatar: 'a2', isHost: false, role: 'CIVILIAN', isAlive: true, hasVoted: false },
+++++++        { id: '3', name: 'P3', avatar: 'a3', isHost: false, role: 'UNDERCOVER', isAlive: false, hasVoted: false },
+++++++        { id: '4', name: 'P4', avatar: 'a4', isHost: false, role: 'MR_WHITE', isAlive: false, hasVoted: false },
+++++++      ];
+++++++
+++++++      expect(checkWinCondition(players)).toBe('CIVILIAN');
+++++++    });
+++++++
+++++++    it('should declare UNDERCOVER win when alive Undercovers >= alive Civilians', () => {
+++++++      // 2 Undercovers vs 2 Civilians
+++++++      const players: Player[] = [
+++++++        { id: '1', name: 'P1', avatar: 'a1', isHost: true, role: 'CIVILIAN', isAlive: true, hasVoted: false },
+++++++        { id: '2', name: 'P2', avatar: 'a2', isHost: false, role: 'CIVILIAN', isAlive: true, hasVoted: false },
+++++++        { id: '3', name: 'P3', avatar: 'a3', isHost: false, role: 'UNDERCOVER', isAlive: true, hasVoted: false },
+++++++        { id: '4', name: 'P4', avatar: 'a4', isHost: false, role: 'UNDERCOVER', isAlive: true, hasVoted: false },
+++++++        { id: '5', name: 'P5', avatar: 'a5', isHost: false, role: 'MR_WHITE', isAlive: false, hasVoted: false },
+++++++      ];
+++++++
+++++++      expect(checkWinCondition(players)).toBe('UNDERCOVER');
+++++++    });
+++++++
+++++++    it('should declare UNDERCOVER win when 1 Undercover vs 1 Civilian remain', () => {
+++++++      const players: Player[] = [
+++++++        { id: '1', name: 'P1', avatar: 'a1', isHost: true, role: 'CIVILIAN', isAlive: true, hasVoted: false },
+++++++        { id: '2', name: 'P2', avatar: 'a2', isHost: false, role: 'CIVILIAN', isAlive: false, hasVoted: false },
+++++++        { id: '3', name: 'P3', avatar: 'a3', isHost: false, role: 'UNDERCOVER', isAlive: true, hasVoted: false },
+++++++      ];
+++++++
+++++++      expect(checkWinCondition(players)).toBe('UNDERCOVER');
+++++++    });
+++++++
+++++++    it('should declare MR_WHITE win when Mr. White survives to the final 2 players', () => {
+++++++      const players: Player[] = [
+++++++        { id: '1', name: 'P1', avatar: 'a1', isHost: true, role: 'CIVILIAN', isAlive: true, hasVoted: false },
+++++++        { id: '2', name: 'P2', avatar: 'a2', isHost: false, role: 'CIVILIAN', isAlive: false, hasVoted: false },
+++++++        { id: '3', name: 'P3', avatar: 'a3', isHost: false, role: 'UNDERCOVER', isAlive: false, hasVoted: false },
+++++++        { id: '4', name: 'P4', avatar: 'a4', isHost: false, role: 'MR_WHITE', isAlive: true, hasVoted: false },
+++++++      ];
+++++++
+++++++      expect(checkWinCondition(players)).toBe('MR_WHITE');
+++++++    });
+++++++
+++++++    it('should return null if game is still active without a winner', () => {
+++++++      const players: Player[] = [
+++++++        { id: '1', name: 'P1', avatar: 'a1', isHost: true, role: 'CIVILIAN', isAlive: true, hasVoted: false },
+++++++        { id: '2', name: 'P2', avatar: 'a2', isHost: false, role: 'CIVILIAN', isAlive: true, hasVoted: false },
+++++++        { id: '3', name: 'P3', avatar: 'a3', isHost: false, role: 'CIVILIAN', isAlive: true, hasVoted: false },
+++++++        { id: '4', name: 'P4', avatar: 'a4', isHost: false, role: 'UNDERCOVER', isAlive: true, hasVoted: false },
+++++++        { id: '5', name: 'P5', avatar: 'a5', isHost: false, role: 'MR_WHITE', isAlive: true, hasVoted: false },
+++++++      ];
+++++++
+++++++      expect(checkWinCondition(players)).toBeNull();
+++++++    });
+++++++  });
+++++++
+++++++  describe('GameEngine class wrapper', () => {
+++++++    it('should expose static methods identically', () => {
+++++++      const players = createMockPlayers(4);
+++++++      const settings: GameSettings = {
+++++++        category: 'Makanan & Minuman',
+++++++        civilianCount: 3,
+++++++        undercoverCount: 1,
+++++++        mrWhiteCount: 0,
+++++++        turnDurationSeconds: 30,
+++++++        enableMrWhite: false,
+++++++      };
+++++++
+++++++      const result = GameEngine.assignRoles(players, settings, sampleWordPair);
+++++++      expect(result.players).toHaveLength(4);
+++++++    });
+++++++  });
+++++++});
++++++
++++++```
+++++diff --git a/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-3-brief.md b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-3-brief.md
+++++new file mode 100644
+++++index 0000000..97c25aa
+++++--- /dev/null
++++++++ b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-3-brief.md
+++++@@ -0,0 +1,32 @@
++++++# Task 3 Brief: Web Audio API Synthesizer & Audio Hook
++++++
++++++## Goal
++++++Implement a complete, zero-external-asset audio engine using standard Web Audio API in `client/`:
++++++
++++++1. `client/src/utils/soundSynthesizer.ts`:
++++++   - Class `SoundSynthesizer` with lazy AudioContext initialization (handling browser autoplay policies on first user interaction).
++++++   - Methods:
++++++     - `playTick()`: Clean, soft countdown clock tick (gentle 880Hz ping, duration ~0.04s)
++++++     - `playUrgentTick()`: Urgent high-tension countdown pulse (1200Hz tone, fast decay ~0.06s)
++++++     - `playRoleReveal()`: Suspenseful futuristic synth chord (rich oscillators + filter sweep)
++++++     - `playVoteBuzzer()`: Tactile vote lock-in confirmation tone
++++++     - `playElimination()`: Dramatic low pitch transition
++++++     - `playVictory()`: Uplifting victory arpeggio
++++++     - `playDefeat()`: Somber defeat chord
++++++     - `playButtonTap()`: Subtle tactile UI tap/click sound
++++++     - Volume control and mute state handling
++++++
++++++2. `client/src/context/AudioContext.tsx`:
++++++   - React Context `AudioContext` and `AudioProvider`
++++++   - Global `isMuted` state stored and loaded from `localStorage` (`key: 'whatstheword_muted'`)
++++++   - Exposes: `playTick`, `playUrgentTick`, `playRoleReveal`, `playVoteBuzzer`, `playElimination`, `playVictory`, `playDefeat`, `playButtonTap`, `isMuted`, `toggleMute`
++++++
++++++3. `client/src/hooks/useGameSound.ts`:
++++++   - Clean custom hook to consume AudioContext easily in any component.
++++++
++++++4. Client typecheck & build verification:
++++++   - Ensure clean compilation with `npm run typecheck` and `npm run build` in client.
++++++
++++++## Report Contract
++++++Write report to: `C:\Users\ASUS\Documents\ALIFKA\PROJECT\whatstheword\.superpowers\sdd\2026-09-02-whatstheword-implementation\task-3-report.md`
++++++Return: status (DONE / BLOCKED), commits, one-line test summary.
+++++diff --git a/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-3-report.md b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-3-report.md
+++++new file mode 100644
+++++index 0000000..14c39ae
+++++--- /dev/null
++++++++ b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-3-report.md
+++++@@ -0,0 +1,63 @@
++++++# Task 3 Report: Web Audio API Synthesizer & Audio Hook
++++++
++++++## Execution Summary
++++++
++++++- **Status:** DONE
++++++- **Commit:** `c3e70b4` (`feat(audio): implement Web Audio API sound synthesizer and hooks`)
++++++- **Client Validation:** `npm run typecheck` & `npm run build` passed cleanly with 0 errors/warnings.
++++++- **Server Test Summary:** 2 test suites passed, 28 tests passed (100%), 0 failed.
++++++
++++++---
++++++
++++++## Implemented Deliverables
++++++
++++++### 1. Web Audio API Sound Synthesizer (`client/src/utils/soundSynthesizer.ts`)
++++++- **Zero External Assets**: Pure procedural synthesis using browser-native Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`, `BiquadFilterNode`).
++++++- **Autoplay Compliance & Lazy Initialization**: Context created and resumed on demand (`ensureContext()`), handling modern browser audio autoplay policies gracefully.
++++++- **Procedural Sound Effects**:
++++++  - `playTick()`: Clean, soft 880Hz sine ping with quick decay (~0.04s) for standard countdown timer.
++++++  - `playUrgentTick()`: High-tension 1200Hz->850Hz triangle pitch pulse (~0.06s) for urgent countdown warnings.
++++++  - `playRoleReveal()`: Multi-oscillator futuristic chord (D3, A3, D4, F#4, A4) with lowpass dynamic resonant filter sweep (~1.1s).
++++++  - `playVoteBuzzer()`: Tactile dual-tone affirmation chime (C5 & G5 harmonic progression) for vote lock-in confirmation.
++++++  - `playElimination()`: Dramatic descending low-frequency sweep (160Hz/80Hz down to 45Hz/35Hz) with resonant filter envelope (~0.85s).
++++++  - `playVictory()`: Uplifting 5-note ascending major arpeggio (C5, E5, G5, C6, E6) with bell decay (~0.87s).
++++++  - `playDefeat()`: Somber descending minor harmony (C4, Eb4, G4, C3) with lowpass filter damping (~0.95s).
++++++  - `playButtonTap()`: Subtle tactile UI blip (1400Hz to 400Hz exponential ramp, ~0.025s).
++++++- **Audio State Controls**:
++++++  - `setMuted(muted: boolean)` / `isMuted(): boolean`
++++++  - `setMasterVolume(vol: number)` / `getMasterVolume(): number`
++++++  - Exported `SoundSynthesizer` class and default singleton instance `soundSynthesizer`.
++++++
++++++### 2. React Audio Context & Provider (`client/src/context/AudioContext.tsx`)
++++++- `AudioContext` and `AudioProvider` component.
++++++- Persistent mute preference synced with `localStorage` (key: `whatstheword_muted`).
++++++- Memoized audio methods preventing unnecessary React re-renders.
++++++- Exported `useAudioContext` hook for deep context access.
++++++
++++++### 3. Audio Hook (`client/src/hooks/useGameSound.ts`)
++++++- Convenient `useGameSound()` hook exposing all sound triggers and mute toggling.
++++++- Built-in graceful fallback to the `soundSynthesizer` singleton if used outside the provider tree.
++++++
++++++### 4. Client Integration (`client/src/main.tsx`)
++++++- Wrapped top-level React root with `<AudioProvider>`.
++++++
++++++---
++++++
++++++## Build & Verification Results
++++++
++++++### TypeScript & Vite Build
++++++```
++++++> whatstheword-client@1.0.0 typecheck
++++++> tsc --noEmit
++++++(0 errors)
++++++
++++++> whatstheword-client@1.0.0 build
++++++> tsc && vite build
++++++
++++++vite v6.4.3 building for production...
++++++✓ 29 modules transformed.
++++++dist/index.html                   1.06 kB │ gzip:  0.57 kB
++++++dist/assets/index-BnjgFhPM.css    9.45 kB │ gzip:  2.66 kB
++++++dist/assets/index-BGamo-K0.js   151.81 kB │ gzip: 48.33 kB
++++++✓ built in 3.31s
++++++```
+++++diff --git a/client/src/context/AudioContext.tsx b/client/src/context/AudioContext.tsx
+++++new file mode 100644
+++++index 0000000..ae6c010
+++++--- /dev/null
++++++++ b/client/src/context/AudioContext.tsx
+++++@@ -0,0 +1,105 @@
++++++import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
++++++import { soundSynthesizer } from '../utils/soundSynthesizer';
++++++
++++++const STORAGE_KEY = 'whatstheword_muted';
++++++
++++++export interface AudioContextType {
++++++  isMuted: boolean;
++++++  toggleMute: () => void;
++++++  setMuted: (muted: boolean) => void;
++++++  playTick: () => void;
++++++  playUrgentTick: () => void;
++++++  playRoleReveal: () => void;
++++++  playVoteBuzzer: () => void;
++++++  playElimination: () => void;
++++++  playVictory: () => void;
++++++  playDefeat: () => void;
++++++  playButtonTap: () => void;
++++++}
++++++
++++++export const AudioContext = createContext<AudioContextType | null>(null);
++++++
++++++export interface AudioProviderProps {
++++++  children: React.ReactNode;
++++++}
++++++
++++++export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
++++++  const [isMuted, setIsMutedState] = useState<boolean>(() => {
++++++    try {
++++++      if (typeof window !== 'undefined' && window.localStorage) {
++++++        const stored = localStorage.getItem(STORAGE_KEY);
++++++        return stored !== null ? JSON.parse(stored) : false;
++++++      }
++++++      return false;
++++++    } catch {
++++++      return false;
++++++    }
++++++  });
++++++
++++++  useEffect(() => {
++++++    soundSynthesizer.setMuted(isMuted);
++++++    try {
++++++      if (typeof window !== 'undefined' && window.localStorage) {
++++++        localStorage.setItem(STORAGE_KEY, JSON.stringify(isMuted));
++++++      }
++++++    } catch {
++++++      // Ignore storage errors in restricted contexts
++++++    }
++++++  }, [isMuted]);
++++++
++++++  const toggleMute = useCallback(() => {
++++++    setIsMutedState((prev) => !prev);
++++++  }, []);
++++++
++++++  const setMuted = useCallback((muted: boolean) => {
++++++    setIsMutedState(muted);
++++++  }, []);
++++++
++++++  const playTick = useCallback(() => soundSynthesizer.playTick(), []);
++++++  const playUrgentTick = useCallback(() => soundSynthesizer.playUrgentTick(), []);
++++++  const playRoleReveal = useCallback(() => soundSynthesizer.playRoleReveal(), []);
++++++  const playVoteBuzzer = useCallback(() => soundSynthesizer.playVoteBuzzer(), []);
++++++  const playElimination = useCallback(() => soundSynthesizer.playElimination(), []);
++++++  const playVictory = useCallback(() => soundSynthesizer.playVictory(), []);
++++++  const playDefeat = useCallback(() => soundSynthesizer.playDefeat(), []);
++++++  const playButtonTap = useCallback(() => soundSynthesizer.playButtonTap(), []);
++++++
++++++  const value = useMemo<AudioContextType>(
++++++    () => ({
++++++      isMuted,
++++++      toggleMute,
++++++      setMuted,
++++++      playTick,
++++++      playUrgentTick,
++++++      playRoleReveal,
++++++      playVoteBuzzer,
++++++      playElimination,
++++++      playVictory,
++++++      playDefeat,
++++++      playButtonTap,
++++++    }),
++++++    [
++++++      isMuted,
++++++      toggleMute,
++++++      setMuted,
++++++      playTick,
++++++      playUrgentTick,
++++++      playRoleReveal,
++++++      playVoteBuzzer,
++++++      playElimination,
++++++      playVictory,
++++++      playDefeat,
++++++      playButtonTap,
++++++    ]
++++++  );
++++++
++++++  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
++++++};
++++++
++++++export const useAudioContext = (): AudioContextType => {
++++++  const context = useContext(AudioContext);
++++++  if (!context) {
++++++    throw new Error('useAudioContext must be used within an AudioProvider');
++++++  }
++++++  return context;
++++++};
+++++diff --git a/client/src/hooks/useGameSound.ts b/client/src/hooks/useGameSound.ts
+++++new file mode 100644
+++++index 0000000..c9a8cea
+++++--- /dev/null
++++++++ b/client/src/hooks/useGameSound.ts
+++++@@ -0,0 +1,32 @@
++++++import { useContext } from 'react';
++++++import { AudioContext, AudioContextType } from '../context/AudioContext';
++++++import { soundSynthesizer } from '../utils/soundSynthesizer';
++++++
++++++/**
++++++ * Custom hook to easily trigger synthesized sound effects and manage mute state.
++++++ * Works seamlessly within AudioProvider, and provides a safe fallback to the singleton synthesizer.
++++++ */
++++++export const useGameSound = (): AudioContextType => {
++++++  const context = useContext(AudioContext);
++++++
++++++  if (context) {
++++++    return context;
++++++  }
++++++
++++++  // Fallback if invoked outside of AudioProvider tree
++++++  return {
++++++    isMuted: soundSynthesizer.isMuted(),
++++++    toggleMute: () => soundSynthesizer.setMuted(!soundSynthesizer.isMuted()),
++++++    setMuted: (muted: boolean) => soundSynthesizer.setMuted(muted),
++++++    playTick: () => soundSynthesizer.playTick(),
++++++    playUrgentTick: () => soundSynthesizer.playUrgentTick(),
++++++    playRoleReveal: () => soundSynthesizer.playRoleReveal(),
++++++    playVoteBuzzer: () => soundSynthesizer.playVoteBuzzer(),
++++++    playElimination: () => soundSynthesizer.playElimination(),
++++++    playVictory: () => soundSynthesizer.playVictory(),
++++++    playDefeat: () => soundSynthesizer.playDefeat(),
++++++    playButtonTap: () => soundSynthesizer.playButtonTap(),
++++++  };
++++++};
++++++
++++++export default useGameSound;
+++++diff --git a/client/src/main.tsx b/client/src/main.tsx
+++++index 5d0d6ca..c0d5ff8 100644
+++++--- a/client/src/main.tsx
++++++++ b/client/src/main.tsx
+++++@@ -1,13 +1,16 @@
+++++ import React from 'react';
+++++ import ReactDOM from 'react-dom/client';
+++++ import App from './App';
++++++import { AudioProvider } from './context/AudioContext';
+++++ import './index.css';
+++++ 
+++++ const rootElement = document.getElementById('root');
+++++ if (rootElement) {
+++++   ReactDOM.createRoot(rootElement).render(
+++++     <React.StrictMode>
+++++-      <App />
++++++      <AudioProvider>
++++++        <App />
++++++      </AudioProvider>
+++++     </React.StrictMode>
+++++   );
+++++ }
+++++diff --git a/client/src/utils/soundSynthesizer.ts b/client/src/utils/soundSynthesizer.ts
+++++new file mode 100644
+++++index 0000000..2c392df
+++++--- /dev/null
++++++++ b/client/src/utils/soundSynthesizer.ts
+++++@@ -0,0 +1,393 @@
++++++/**
++++++ * SoundSynthesizer
++++++ * Pure Web Audio API procedural sound engine with zero external asset dependencies.
++++++ * Handles lazy context initialization, browser autoplay unlocking, and audio effects.
++++++ */
++++++
++++++export class SoundSynthesizer {
++++++  private ctx: AudioContext | null = null;
++++++  private muted: boolean = false;
++++++  private masterVolume: number = 0.7;
++++++
++++++  constructor(initialMuted: boolean = false) {
++++++    this.muted = initialMuted;
++++++  }
++++++
++++++  /**
++++++   * Lazily initialize or resume AudioContext upon user gesture.
++++++   */
++++++  public ensureContext(): AudioContext | null {
++++++    if (typeof window === 'undefined') return null;
++++++
++++++    if (!this.ctx) {
++++++      const AudioCtx =
++++++        window.AudioContext ||
++++++        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
++++++
++++++      if (AudioCtx) {
++++++        this.ctx = new AudioCtx();
++++++      }
++++++    }
++++++
++++++    if (this.ctx && this.ctx.state === 'suspended') {
++++++      this.ctx.resume().catch(() => {
++++++        // Autoplay policy may reject until next user gesture
++++++      });
++++++    }
++++++
++++++    return this.ctx;
++++++  }
++++++
++++++  public setMuted(muted: boolean): void {
++++++    this.muted = muted;
++++++  }
++++++
++++++  public isMuted(): boolean {
++++++    return this.muted;
++++++  }
++++++
++++++  public setMasterVolume(vol: number): void {
++++++    this.masterVolume = Math.max(0, Math.min(1, vol));
++++++  }
++++++
++++++  public getMasterVolume(): number {
++++++    return this.masterVolume;
++++++  }
++++++
++++++  /**
++++++   * 1. Clean, soft countdown clock tick (gentle 880Hz ping, duration ~0.04s)
++++++   */
++++++  public playTick(): void {
++++++    if (this.muted) return;
++++++    const ctx = this.ensureContext();
++++++    if (!ctx) return;
++++++
++++++    try {
++++++      const t = ctx.currentTime;
++++++      const duration = 0.04;
++++++
++++++      const osc = ctx.createOscillator();
++++++      const gain = ctx.createGain();
++++++
++++++      osc.type = 'sine';
++++++      osc.frequency.setValueAtTime(880, t);
++++++
++++++      gain.gain.setValueAtTime(0.001, t);
++++++      gain.gain.linearRampToValueAtTime(0.12 * this.masterVolume, t + 0.003);
++++++      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
++++++      gain.gain.setValueAtTime(0, t + duration + 0.001);
++++++
++++++      osc.connect(gain);
++++++      gain.connect(ctx.destination);
++++++
++++++      osc.start(t);
++++++      osc.stop(t + duration + 0.01);
++++++    } catch {
++++++      // Audio playback fails gracefully if context is blocked
++++++    }
++++++  }
++++++
++++++  /**
++++++   * 2. Urgent high-tension countdown pulse (1200Hz tone, fast decay ~0.06s)
++++++   */
++++++  public playUrgentTick(): void {
++++++    if (this.muted) return;
++++++    const ctx = this.ensureContext();
++++++    if (!ctx) return;
++++++
++++++    try {
++++++      const t = ctx.currentTime;
++++++      const duration = 0.06;
++++++
++++++      const osc = ctx.createOscillator();
++++++      const gain = ctx.createGain();
++++++
++++++      osc.type = 'triangle';
++++++      osc.frequency.setValueAtTime(1200, t);
++++++      osc.frequency.exponentialRampToValueAtTime(850, t + duration);
++++++
++++++      gain.gain.setValueAtTime(0.001, t);
++++++      gain.gain.linearRampToValueAtTime(0.22 * this.masterVolume, t + 0.003);
++++++      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
++++++      gain.gain.setValueAtTime(0, t + duration + 0.001);
++++++
++++++      osc.connect(gain);
++++++      gain.connect(ctx.destination);
++++++
++++++      osc.start(t);
++++++      osc.stop(t + duration + 0.01);
++++++    } catch {
++++++      // Audio playback fails gracefully
++++++    }
++++++  }
++++++
++++++  /**
++++++   * 3. Suspenseful futuristic synth chord (rich oscillators + filter sweep)
++++++   */
++++++  public playRoleReveal(): void {
++++++    if (this.muted) return;
++++++    const ctx = this.ensureContext();
++++++    if (!ctx) return;
++++++
++++++    try {
++++++      const t = ctx.currentTime;
++++++      const duration = 1.1;
++++++
++++++      // Chord frequencies: D3, A3, D4, F#4, A4
++++++      const freqs = [146.83, 220.0, 293.66, 369.99, 440.0];
++++++
++++++      const masterGain = ctx.createGain();
++++++      masterGain.gain.setValueAtTime(0.001, t);
++++++      masterGain.gain.linearRampToValueAtTime(0.25 * this.masterVolume, t + 0.08);
++++++      masterGain.gain.setValueAtTime(0.25 * this.masterVolume, t + 0.5);
++++++      masterGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
++++++      masterGain.gain.setValueAtTime(0, t + duration + 0.01);
++++++
++++++      const filter = ctx.createBiquadFilter();
++++++      filter.type = 'lowpass';
++++++      filter.Q.setValueAtTime(3.5, t);
++++++      filter.frequency.setValueAtTime(250, t);
++++++      filter.frequency.exponentialRampToValueAtTime(3200, t + 0.45);
++++++      filter.frequency.exponentialRampToValueAtTime(800, t + duration);
++++++
++++++      masterGain.connect(filter);
++++++      filter.connect(ctx.destination);
++++++
++++++      freqs.forEach((freq, idx) => {
++++++        const osc = ctx.createOscillator();
++++++        osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
++++++        osc.frequency.setValueAtTime(freq, t);
++++++        // Subtle detune for shimmer
++++++        osc.detune.setValueAtTime((idx - 2) * 6, t);
++++++
++++++        const oscGain = ctx.createGain();
++++++        oscGain.gain.setValueAtTime(0.2, t);
++++++
++++++        osc.connect(oscGain);
++++++        oscGain.connect(masterGain);
++++++
++++++        osc.start(t);
++++++        osc.stop(t + duration + 0.02);
++++++      });
++++++    } catch {
++++++      // Audio playback fails gracefully
++++++    }
++++++  }
++++++
++++++  /**
++++++   * 4. Tactile vote lock-in confirmation tone
++++++   */
++++++  public playVoteBuzzer(): void {
++++++    if (this.muted) return;
++++++    const ctx = this.ensureContext();
++++++    if (!ctx) return;
++++++
++++++    try {
++++++      const t = ctx.currentTime;
++++++
++++++      // Two quick affirmative harmonic pings
++++++      const notes = [
++++++        { freq: 523.25, start: 0, dur: 0.07, vol: 0.18 }, // C5
++++++        { freq: 783.99, start: 0.06, dur: 0.12, vol: 0.22 }, // G5
++++++      ];
++++++
++++++      notes.forEach(({ freq, start, dur, vol }) => {
++++++        const noteStart = t + start;
++++++        const osc = ctx.createOscillator();
++++++        const gain = ctx.createGain();
++++++
++++++        osc.type = 'sine';
++++++        osc.frequency.setValueAtTime(freq, noteStart);
++++++
++++++        gain.gain.setValueAtTime(0.001, noteStart);
++++++        gain.gain.linearRampToValueAtTime(vol * this.masterVolume, noteStart + 0.005);
++++++        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + dur);
++++++        gain.gain.setValueAtTime(0, noteStart + dur + 0.001);
++++++
++++++        osc.connect(gain);
++++++        gain.connect(ctx.destination);
++++++
++++++        osc.start(noteStart);
++++++        osc.stop(noteStart + dur + 0.01);
++++++      });
++++++    } catch {
++++++      // Audio playback fails gracefully
++++++    }
++++++  }
++++++
++++++  /**
++++++   * 5. Dramatic low pitch elimination transition
++++++   */
++++++  public playElimination(): void {
++++++    if (this.muted) return;
++++++    const ctx = this.ensureContext();
++++++    if (!ctx) return;
++++++
++++++    try {
++++++      const t = ctx.currentTime;
++++++      const duration = 0.85;
++++++
++++++      const masterGain = ctx.createGain();
++++++      masterGain.gain.setValueAtTime(0.001, t);
++++++      masterGain.gain.linearRampToValueAtTime(0.3 * this.masterVolume, t + 0.04);
++++++      masterGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
++++++      masterGain.gain.setValueAtTime(0, t + duration + 0.01);
++++++
++++++      const filter = ctx.createBiquadFilter();
++++++      filter.type = 'lowpass';
++++++      filter.Q.setValueAtTime(4.0, t);
++++++      filter.frequency.setValueAtTime(900, t);
++++++      filter.frequency.exponentialRampToValueAtTime(80, t + duration);
++++++
++++++      masterGain.connect(filter);
++++++      filter.connect(ctx.destination);
++++++
++++++      // Low saw oscillator + sub sine
++++++      const osc1 = ctx.createOscillator();
++++++      osc1.type = 'sawtooth';
++++++      osc1.frequency.setValueAtTime(160, t);
++++++      osc1.frequency.exponentialRampToValueAtTime(45, t + duration);
++++++
++++++      const osc2 = ctx.createOscillator();
++++++      osc2.type = 'sine';
++++++      osc2.frequency.setValueAtTime(80, t);
++++++      osc2.frequency.exponentialRampToValueAtTime(35, t + duration);
++++++
++++++      osc1.connect(masterGain);
++++++      osc2.connect(masterGain);
++++++
++++++      osc1.start(t);
++++++      osc2.start(t);
++++++
++++++      osc1.stop(t + duration + 0.02);
++++++      osc2.stop(t + duration + 0.02);
++++++    } catch {
++++++      // Audio playback fails gracefully
++++++    }
++++++  }
++++++
++++++  /**
++++++   * 6. Uplifting victory arpeggio
++++++   */
++++++  public playVictory(): void {
++++++    if (this.muted) return;
++++++    const ctx = this.ensureContext();
++++++    if (!ctx) return;
++++++
++++++    try {
++++++      const t = ctx.currentTime;
++++++
++++++      // Ascending major arpeggio: C5, E5, G5, C6, E6
++++++      const notes = [
++++++        { freq: 523.25, start: 0.0, dur: 0.12, vol: 0.18 },
++++++        { freq: 659.25, start: 0.09, dur: 0.12, vol: 0.18 },
++++++        { freq: 783.99, start: 0.18, dur: 0.14, vol: 0.2 },
++++++        { freq: 1046.5, start: 0.28, dur: 0.2, vol: 0.24 },
++++++        { freq: 1318.51, start: 0.42, dur: 0.45, vol: 0.25 },
++++++      ];
++++++
++++++      notes.forEach(({ freq, start, dur, vol }) => {
++++++        const noteStart = t + start;
++++++        const osc = ctx.createOscillator();
++++++        const gain = ctx.createGain();
++++++
++++++        osc.type = 'triangle';
++++++        osc.frequency.setValueAtTime(freq, noteStart);
++++++
++++++        gain.gain.setValueAtTime(0.001, noteStart);
++++++        gain.gain.linearRampToValueAtTime(vol * this.masterVolume, noteStart + 0.008);
++++++        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + dur);
++++++        gain.gain.setValueAtTime(0, noteStart + dur + 0.001);
++++++
++++++        osc.connect(gain);
++++++        gain.connect(ctx.destination);
++++++
++++++        osc.start(noteStart);
++++++        osc.stop(noteStart + dur + 0.02);
++++++      });
++++++    } catch {
++++++      // Audio playback fails gracefully
++++++    }
++++++  }
++++++
++++++  /**
++++++   * 7. Somber defeat chord / descending progression
++++++   */
++++++  public playDefeat(): void {
++++++    if (this.muted) return;
++++++    const ctx = this.ensureContext();
++++++    if (!ctx) return;
++++++
++++++    try {
++++++      const t = ctx.currentTime;
++++++      const duration = 0.95;
++++++
++++++      // Minor sombre chord: C4, Eb4, G4 + lower C3
++++++      const freqs = [130.81, 261.63, 311.13, 392.0];
++++++
++++++      const masterGain = ctx.createGain();
++++++      masterGain.gain.setValueAtTime(0.001, t);
++++++      masterGain.gain.linearRampToValueAtTime(0.24 * this.masterVolume, t + 0.05);
++++++      masterGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
++++++      masterGain.gain.setValueAtTime(0, t + duration + 0.01);
++++++
++++++      const filter = ctx.createBiquadFilter();
++++++      filter.type = 'lowpass';
++++++      filter.frequency.setValueAtTime(600, t);
++++++      filter.frequency.linearRampToValueAtTime(250, t + duration);
++++++
++++++      masterGain.connect(filter);
++++++      filter.connect(ctx.destination);
++++++
++++++      freqs.forEach((freq) => {
++++++        const osc = ctx.createOscillator();
++++++        osc.type = 'sine';
++++++        osc.frequency.setValueAtTime(freq, t);
++++++        osc.frequency.linearRampToValueAtTime(freq * 0.96, t + duration); // subtle pitch droop
++++++
++++++        osc.connect(masterGain);
++++++        osc.start(t);
++++++        osc.stop(t + duration + 0.02);
++++++      });
++++++    } catch {
++++++      // Audio playback fails gracefully
++++++    }
++++++  }
++++++
++++++  /**
++++++   * 8. Subtle tactile UI button tap sound
++++++   */
++++++  public playButtonTap(): void {
++++++    if (this.muted) return;
++++++    const ctx = this.ensureContext();
++++++    if (!ctx) return;
++++++
++++++    try {
++++++      const t = ctx.currentTime;
++++++      const duration = 0.025;
++++++
++++++      const osc = ctx.createOscillator();
++++++      const gain = ctx.createGain();
++++++
++++++      osc.type = 'sine';
++++++      osc.frequency.setValueAtTime(1400, t);
++++++      osc.frequency.exponentialRampToValueAtTime(400, t + duration);
++++++
++++++      gain.gain.setValueAtTime(0.001, t);
++++++      gain.gain.linearRampToValueAtTime(0.1 * this.masterVolume, t + 0.002);
++++++      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
++++++      gain.gain.setValueAtTime(0, t + duration + 0.001);
++++++
++++++      osc.connect(gain);
++++++      gain.connect(ctx.destination);
++++++
++++++      osc.start(t);
++++++      osc.stop(t + duration + 0.01);
++++++    } catch {
++++++      // Audio playback fails gracefully
++++++    }
++++++  }
++++++}
++++++
++++++// Global default singleton instance
++++++export const soundSynthesizer = new SoundSynthesizer();
+++++
+++++```
++++diff --git a/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-4-brief.md b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-4-brief.md
++++new file mode 100644
++++index 0000000..d0a8bc3
++++--- /dev/null
+++++++ b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-4-brief.md
++++@@ -0,0 +1,37 @@
+++++# Task 4 Brief: Realtime Backend Server (Express + Socket.io + Room Manager)
+++++
+++++## Goal
+++++Implement a complete, production-ready realtime Socket.io backend server with RoomManager, session recovery, and modular event handlers:
+++++
+++++1. `server/src/managers/RoomManager.ts`:
+++++   - In-memory store for active game rooms (`Map<string, RoomState>` and player sessions `Map<string, { roomId: string, playerId: string }>`).
+++++   - Generates unique 4-character room codes (alphanumeric, e.g. "ABCD", "KOP1").
+++++   - Methods:
+++++     - `createRoom(hostName: string, avatar: string): { roomId: string; playerToken: string; player: Player; room: RoomState }`
+++++     - `joinRoom(roomId: string, playerName: string, avatar: string, existingToken?: string): { playerToken: string; player: Player; room: RoomState }`
+++++     - `leaveRoom(roomId: string, playerId: string): RoomState | null` (migrates host to next player if host leaves; removes room if empty)
+++++     - `updateSettings(roomId: string, settings: Partial<GameSettings>): RoomState`
+++++     - `startGame(roomId: string, settings?: GameSettings, customWordPair?: WordPair): RoomState`
+++++     - `advanceTurn(roomId: string): RoomState`
+++++     - `castVote(roomId: string, voterId: string, targetId: string): { room: RoomState; isComplete: boolean; isTie?: boolean; eliminatedPlayer?: Player; winner?: PlayerRole }`
+++++     - `handleMrWhiteGuess(roomId: string, guess: string): { room: RoomState; isCorrect: boolean; winner: PlayerRole }`
+++++     - `reconnectPlayer(playerToken: string): { player: Player; room: RoomState } | null`
+++++     - `rematch(roomId: string): RoomState`
+++++     - Automatic garbage collection of idle rooms (> 2 hours).
+++++
+++++2. Socket.io Event Handlers in `server/src/handlers/`:
+++++   - `roomHandler.ts`: `room:create`, `room:join`, `room:leave`, `room:update_settings`, `player:reconnect`
+++++   - `gameHandler.ts`: `game:start`, `turn:end`, `turn:timer_tick`, `game:rematch`
+++++   - `voteHandler.ts`: `vote:cast`, `mrwhite:guess`
+++++
+++++3. Server Bootstrap in `server/src/server.ts`:
+++++   - Setup Express, CORS with wildcard/env origins, HTTP server, Socket.io server.
+++++   - Endpoint `GET /health` returning `{ status: 'ok', activeRooms: number, uptime: number }`.
+++++   - Export `app`, `server`, `io`, `roomManager`.
+++++
+++++4. Automated Vitest Tests:
+++++   - `server/tests/RoomManager.test.ts`: test room creation, joining, role distribution on start, instant skip voting tie, Mr. White guess intercept, session reconnect, and rematch.
+++++
+++++## Report Contract
+++++Write report to: `C:\Users\ASUS\Documents\ALIFKA\PROJECT\whatstheword\.superpowers\sdd\2026-09-02-whatstheword-implementation\task-4-report.md`
+++++Return: status (DONE / BLOCKED), commits, one-line test summary.
++++diff --git a/server/src/handlers/gameHandler.ts b/server/src/handlers/gameHandler.ts
++++new file mode 100644
++++index 0000000..7b67a45
++++--- /dev/null
+++++++ b/server/src/handlers/gameHandler.ts
++++@@ -0,0 +1,99 @@
+++++import { Server, Socket } from 'socket.io';
+++++import { RoomManager } from '../managers/RoomManager.js';
+++++import { GameSettings, WordPair } from '../types/game.types.js';
+++++
+++++export function registerGameHandlers(
+++++  io: Server,
+++++  socket: Socket,
+++++  roomManager: RoomManager
+++++): void {
+++++  // Start Game
+++++  socket.on(
+++++    'game:start',
+++++    (
+++++      payload?: { settings?: GameSettings; customWordPair?: WordPair },
+++++      callback?: (res: any) => void
+++++    ) => {
+++++      try {
+++++        const roomId = socket.data.roomId;
+++++        if (!roomId) {
+++++          throw new Error('Not connected to a room');
+++++        }
+++++
+++++        const room = roomManager.startGame(
+++++          roomId,
+++++          payload?.settings,
+++++          payload?.customWordPair
+++++        );
+++++
+++++        io.to(roomId).emit('room:updated', room);
+++++        io.to(roomId).emit('game:started', room);
+++++
+++++        if (callback) {
+++++          callback({ success: true, room });
+++++        }
+++++      } catch (err: any) {
+++++        if (callback) {
+++++          callback({ success: false, error: err.message });
+++++        }
+++++      }
+++++    }
+++++  );
+++++
+++++  // Advance / End Turn
+++++  socket.on('turn:end', (callback?: (res: any) => void) => {
+++++    try {
+++++      const roomId = socket.data.roomId;
+++++      if (!roomId) {
+++++        throw new Error('Not connected to a room');
+++++      }
+++++
+++++      const room = roomManager.advanceTurn(roomId);
+++++      io.to(roomId).emit('room:updated', room);
+++++
+++++      if (callback) {
+++++        callback({ success: true, room });
+++++      }
+++++    } catch (err: any) {
+++++      if (callback) {
+++++        callback({ success: false, error: err.message });
+++++      }
+++++    }
+++++  });
+++++
+++++  // Turn Timer Tick Sync
+++++  socket.on('turn:timer_tick', (payload: { remainingSeconds: number }) => {
+++++    const roomId = socket.data.roomId;
+++++    if (roomId) {
+++++      const room = roomManager.getRoom(roomId);
+++++      if (room) {
+++++        room.activeTurnRemainingSeconds = payload.remainingSeconds;
+++++        io.to(roomId).emit('turn:timer_sync', {
+++++          remainingSeconds: payload.remainingSeconds,
+++++        });
+++++      }
+++++    }
+++++  });
+++++
+++++  // Rematch
+++++  socket.on('game:rematch', (callback?: (res: any) => void) => {
+++++    try {
+++++      const roomId = socket.data.roomId;
+++++      if (!roomId) {
+++++        throw new Error('Not connected to a room');
+++++      }
+++++
+++++      const room = roomManager.rematch(roomId);
+++++      io.to(roomId).emit('room:updated', room);
+++++      io.to(roomId).emit('game:rematch_started', room);
+++++
+++++      if (callback) {
+++++        callback({ success: true, room });
+++++      }
+++++    } catch (err: any) {
+++++      if (callback) {
+++++        callback({ success: false, error: err.message });
+++++      }
+++++    }
+++++  });
+++++}
++++diff --git a/server/src/handlers/roomHandler.ts b/server/src/handlers/roomHandler.ts
++++new file mode 100644
++++index 0000000..5c49126
++++--- /dev/null
+++++++ b/server/src/handlers/roomHandler.ts
++++@@ -0,0 +1,184 @@
+++++import { Server, Socket } from 'socket.io';
+++++import { RoomManager } from '../managers/RoomManager.js';
+++++import { GameSettings } from '../types/game.types.js';
+++++
+++++export function registerRoomHandlers(
+++++  io: Server,
+++++  socket: Socket,
+++++  roomManager: RoomManager
+++++): void {
+++++  // Create Room
+++++  socket.on(
+++++    'room:create',
+++++    (
+++++      payload: { playerName: string; avatar: string },
+++++      callback?: (res: any) => void
+++++    ) => {
+++++      try {
+++++        const { roomId, playerToken, player, room } = roomManager.createRoom(
+++++          payload.playerName,
+++++          payload.avatar
+++++        );
+++++
+++++        socket.join(roomId);
+++++        socket.data.roomId = roomId;
+++++        socket.data.playerId = player.id;
+++++        socket.data.playerToken = playerToken;
+++++
+++++        io.to(roomId).emit('room:updated', room);
+++++
+++++        if (callback) {
+++++          callback({
+++++            success: true,
+++++            roomId,
+++++            playerToken,
+++++            player,
+++++            room,
+++++          });
+++++        }
+++++      } catch (err: any) {
+++++        if (callback) {
+++++          callback({ success: false, error: err.message || 'Failed to create room' });
+++++        }
+++++      }
+++++    }
+++++  );
+++++
+++++  // Join Room
+++++  socket.on(
+++++    'room:join',
+++++    (
+++++      payload: {
+++++        roomId: string;
+++++        playerName: string;
+++++        avatar: string;
+++++        playerToken?: string;
+++++      },
+++++      callback?: (res: any) => void
+++++    ) => {
+++++      try {
+++++        const { playerToken, player, room } = roomManager.joinRoom(
+++++          payload.roomId,
+++++          payload.playerName,
+++++          payload.avatar,
+++++          payload.playerToken
+++++        );
+++++
+++++        const normalizedRoomId = room.roomId;
+++++        socket.join(normalizedRoomId);
+++++        socket.data.roomId = normalizedRoomId;
+++++        socket.data.playerId = player.id;
+++++        socket.data.playerToken = playerToken;
+++++
+++++        io.to(normalizedRoomId).emit('room:updated', room);
+++++
+++++        if (callback) {
+++++          callback({
+++++            success: true,
+++++            playerToken,
+++++            player,
+++++            room,
+++++          });
+++++        }
+++++      } catch (err: any) {
+++++        if (callback) {
+++++          callback({ success: false, error: err.message || 'Failed to join room' });
+++++        }
+++++      }
+++++    }
+++++  );
+++++
+++++  // Leave Room
+++++  socket.on('room:leave', (callback?: (res: any) => void) => {
+++++    try {
+++++      const roomId = socket.data.roomId;
+++++      const playerId = socket.data.playerId;
+++++
+++++      if (roomId && playerId) {
+++++        socket.leave(roomId);
+++++        const room = roomManager.leaveRoom(roomId, playerId);
+++++        if (room) {
+++++          io.to(roomId).emit('room:updated', room);
+++++        }
+++++      }
+++++
+++++      socket.data.roomId = undefined;
+++++      socket.data.playerId = undefined;
+++++      socket.data.playerToken = undefined;
+++++
+++++      if (callback) {
+++++        callback({ success: true });
+++++      }
+++++    } catch (err: any) {
+++++      if (callback) {
+++++        callback({ success: false, error: err.message });
+++++      }
+++++    }
+++++  });
+++++
+++++  // Update Settings
+++++  socket.on(
+++++    'room:update_settings',
+++++    (
+++++      payload: { settings: Partial<GameSettings> },
+++++      callback?: (res: any) => void
+++++    ) => {
+++++      try {
+++++        const roomId = socket.data.roomId;
+++++        if (!roomId) {
+++++          throw new Error('Not connected to a room');
+++++        }
+++++
+++++        const room = roomManager.updateSettings(roomId, payload.settings);
+++++        io.to(roomId).emit('room:updated', room);
+++++
+++++        if (callback) {
+++++          callback({ success: true, room });
+++++        }
+++++      } catch (err: any) {
+++++        if (callback) {
+++++          callback({ success: false, error: err.message });
+++++        }
+++++      }
+++++    }
+++++  );
+++++
+++++  // Player Reconnect
+++++  socket.on(
+++++    'player:reconnect',
+++++    (payload: { playerToken: string }, callback?: (res: any) => void) => {
+++++      try {
+++++        const result = roomManager.reconnectPlayer(payload.playerToken);
+++++        if (!result) {
+++++          if (callback) {
+++++            callback({
+++++              success: false,
+++++              error: 'Session expired or room not found',
+++++            });
+++++          }
+++++          return;
+++++        }
+++++
+++++        const { player, room } = result;
+++++        socket.join(room.roomId);
+++++        socket.data.roomId = room.roomId;
+++++        socket.data.playerId = player.id;
+++++        socket.data.playerToken = payload.playerToken;
+++++
+++++        io.to(room.roomId).emit('room:updated', room);
+++++
+++++        if (callback) {
+++++          callback({
+++++            success: true,
+++++            player,
+++++            room,
+++++          });
+++++        }
+++++      } catch (err: any) {
+++++        if (callback) {
+++++          callback({ success: false, error: err.message });
+++++        }
+++++      }
+++++    }
+++++  );
+++++}
++++diff --git a/server/src/handlers/voteHandler.ts b/server/src/handlers/voteHandler.ts
++++new file mode 100644
++++index 0000000..a5ca39c
++++--- /dev/null
+++++++ b/server/src/handlers/voteHandler.ts
++++@@ -0,0 +1,78 @@
+++++import { Server, Socket } from 'socket.io';
+++++import { RoomManager } from '../managers/RoomManager.js';
+++++
+++++export function registerVoteHandlers(
+++++  io: Server,
+++++  socket: Socket,
+++++  roomManager: RoomManager
+++++): void {
+++++  // Cast Vote
+++++  socket.on(
+++++    'vote:cast',
+++++    (payload: { targetId: string }, callback?: (res: any) => void) => {
+++++      try {
+++++        const roomId = socket.data.roomId;
+++++        const voterId = socket.data.playerId;
+++++
+++++        if (!roomId || !voterId) {
+++++          throw new Error('Not connected to a room as active player');
+++++        }
+++++
+++++        const result = roomManager.castVote(roomId, voterId, payload.targetId);
+++++        io.to(roomId).emit('room:updated', result.room);
+++++
+++++        if (result.isComplete) {
+++++          io.to(roomId).emit('vote:completed', {
+++++            room: result.room,
+++++            isTie: result.isTie,
+++++            eliminatedPlayer: result.eliminatedPlayer,
+++++            winner: result.winner,
+++++          });
+++++        }
+++++
+++++        if (callback) {
+++++          callback({
+++++            success: true,
+++++            ...result,
+++++          });
+++++        }
+++++      } catch (err: any) {
+++++        if (callback) {
+++++          callback({ success: false, error: err.message });
+++++        }
+++++      }
+++++    }
+++++  );
+++++
+++++  // Mr. White Guess
+++++  socket.on(
+++++    'mrwhite:guess',
+++++    (payload: { guess: string }, callback?: (res: any) => void) => {
+++++      try {
+++++        const roomId = socket.data.roomId;
+++++        if (!roomId) {
+++++          throw new Error('Not connected to a room');
+++++        }
+++++
+++++        const result = roomManager.handleMrWhiteGuess(roomId, payload.guess);
+++++        io.to(roomId).emit('room:updated', result.room);
+++++        io.to(roomId).emit('mrwhite:result', {
+++++          isCorrect: result.isCorrect,
+++++          winner: result.winner,
+++++          room: result.room,
+++++        });
+++++
+++++        if (callback) {
+++++          callback({
+++++            success: true,
+++++            ...result,
+++++          });
+++++        }
+++++      } catch (err: any) {
+++++        if (callback) {
+++++          callback({ success: false, error: err.message });
+++++        }
+++++      }
+++++    }
+++++  );
+++++}
++++diff --git a/server/src/managers/RoomManager.ts b/server/src/managers/RoomManager.ts
++++new file mode 100644
++++index 0000000..b48f948
++++--- /dev/null
+++++++ b/server/src/managers/RoomManager.ts
++++@@ -0,0 +1,579 @@
+++++import { randomUUID } from 'crypto';
+++++import { Player, RoomState, GameSettings, WordPair, PlayerRole } from '../types/game.types.js';
+++++import { GameEngine } from '../engine/GameEngine.js';
+++++import { getRandomWordPair } from '../data/defaultWordPacks.js';
+++++import { FuzzyMatcher } from '../engine/FuzzyMatcher.js';
+++++
+++++export interface RoomSession {
+++++  roomId: string;
+++++  playerId: string;
+++++}
+++++
+++++export interface CreateRoomResult {
+++++  roomId: string;
+++++  playerToken: string;
+++++  player: Player;
+++++  room: RoomState;
+++++}
+++++
+++++export interface JoinRoomResult {
+++++  playerToken: string;
+++++  player: Player;
+++++  room: RoomState;
+++++}
+++++
+++++export interface CastVoteResult {
+++++  room: RoomState;
+++++  isComplete: boolean;
+++++  isTie?: boolean;
+++++  eliminatedPlayer?: Player;
+++++  winner?: PlayerRole;
+++++}
+++++
+++++export interface MrWhiteGuessResult {
+++++  room: RoomState;
+++++  isCorrect: boolean;
+++++  winner?: PlayerRole;
+++++}
+++++
+++++export class RoomManager {
+++++  private rooms: Map<string, RoomState> = new Map();
+++++  private sessions: Map<string, RoomSession> = new Map();
+++++  private roomLastActivity: Map<string, number> = new Map();
+++++  private cleanupInterval: NodeJS.Timeout | null = null;
+++++
+++++  constructor() {
+++++    // Schedule periodic idle room cleanup every 15 minutes
+++++    this.cleanupInterval = setInterval(() => {
+++++      this.cleanupIdleRooms();
+++++    }, 15 * 60 * 1000);
+++++  }
+++++
+++++  /**
+++++   * Generates a unique 4-character alphanumeric uppercase room code.
+++++   */
+++++  private generateRoomCode(): string {
+++++    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
+++++    let code = '';
+++++    let attempts = 0;
+++++
+++++    do {
+++++      code = '';
+++++      for (let i = 0; i < 4; i++) {
+++++        const randomIndex = Math.floor(Math.random() * chars.length);
+++++        code += chars[randomIndex];
+++++      }
+++++      attempts++;
+++++      if (attempts > 1000) {
+++++        throw new Error('Unable to allocate unique room code');
+++++      }
+++++    } while (this.rooms.has(code));
+++++
+++++    return code;
+++++  }
+++++
+++++  /**
+++++   * Creates a new game room with the given host player.
+++++   */
+++++  public createRoom(hostName: string, avatar: string): CreateRoomResult {
+++++    const roomId = this.generateRoomCode();
+++++    const playerId = randomUUID();
+++++    const playerToken = randomUUID();
+++++
+++++    const hostPlayer: Player = {
+++++      id: playerId,
+++++      name: hostName.trim() || 'Host',
+++++      avatar: avatar || 'avatar_1',
+++++      isHost: true,
+++++      isAlive: true,
+++++      hasVoted: false,
+++++    };
+++++
+++++    const defaultSettings: GameSettings = {
+++++      category: 'Semua Kategori',
+++++      civilianCount: 3,
+++++      undercoverCount: 1,
+++++      mrWhiteCount: 1,
+++++      turnDurationSeconds: 45,
+++++      enableMrWhite: true,
+++++    };
+++++
+++++    const room: RoomState = {
+++++      roomId,
+++++      phase: 'LOBBY',
+++++      round: 1,
+++++      players: [hostPlayer],
+++++      speakingOrder: [],
+++++      currentSpeakerIndex: 0,
+++++      activeTurnRemainingSeconds: defaultSettings.turnDurationSeconds,
+++++      settings: defaultSettings,
+++++    };
+++++
+++++    this.rooms.set(roomId, room);
+++++    this.sessions.set(playerToken, { roomId, playerId });
+++++    this.roomLastActivity.set(roomId, Date.now());
+++++
+++++    return {
+++++      roomId,
+++++      playerToken,
+++++      player: hostPlayer,
+++++      room,
+++++    };
+++++  }
+++++
+++++  /**
+++++   * Joins an existing room or reconnects if token matches existing player.
+++++   */
+++++  public joinRoom(
+++++    roomId: string,
+++++    playerName: string,
+++++    avatar: string,
+++++    existingToken?: string
+++++  ): JoinRoomResult {
+++++    const normalizedRoomId = roomId.trim().toUpperCase();
+++++    const room = this.rooms.get(normalizedRoomId);
+++++
+++++    if (!room) {
+++++      throw new Error(`Room not found: ${normalizedRoomId}`);
+++++    }
+++++
+++++    if (existingToken) {
+++++      const session = this.sessions.get(existingToken);
+++++      if (session && session.roomId === normalizedRoomId) {
+++++        const existingPlayer = room.players.find((p) => p.id === session.playerId);
+++++        if (existingPlayer) {
+++++          this.roomLastActivity.set(normalizedRoomId, Date.now());
+++++          return {
+++++            playerToken: existingToken,
+++++            player: existingPlayer,
+++++            room,
+++++          };
+++++        }
+++++      }
+++++    }
+++++
+++++    if (room.phase !== 'LOBBY') {
+++++      throw new Error('Cannot join room while game is in progress');
+++++    }
+++++
+++++    const playerId = randomUUID();
+++++    const playerToken = randomUUID();
+++++
+++++    const newPlayer: Player = {
+++++      id: playerId,
+++++      name: playerName.trim() || `Player ${room.players.length + 1}`,
+++++      avatar: avatar || 'avatar_1',
+++++      isHost: room.players.length === 0,
+++++      isAlive: true,
+++++      hasVoted: false,
+++++    };
+++++
+++++    room.players.push(newPlayer);
+++++    this.sessions.set(playerToken, { roomId: normalizedRoomId, playerId });
+++++    this.roomLastActivity.set(normalizedRoomId, Date.now());
+++++
+++++    return {
+++++      playerToken,
+++++      player: newPlayer,
+++++      room,
+++++    };
+++++  }
+++++
+++++  /**
+++++   * Removes a player from the room. Migrates host if needed or deletes empty room.
+++++   */
+++++  public leaveRoom(roomId: string, playerId: string): RoomState | null {
+++++    const normalizedRoomId = roomId.trim().toUpperCase();
+++++    const room = this.rooms.get(normalizedRoomId);
+++++
+++++    if (!room) return null;
+++++
+++++    const playerIndex = room.players.findIndex((p) => p.id === playerId);
+++++    if (playerIndex === -1) return room;
+++++
+++++    const wasHost = room.players[playerIndex].isHost;
+++++    room.players.splice(playerIndex, 1);
+++++
+++++    if (room.players.length === 0) {
+++++      this.rooms.delete(normalizedRoomId);
+++++      this.roomLastActivity.delete(normalizedRoomId);
+++++      for (const [token, session] of this.sessions.entries()) {
+++++        if (session.roomId === normalizedRoomId) {
+++++          this.sessions.delete(token);
+++++        }
+++++      }
+++++      return null;
+++++    }
+++++
+++++    if (wasHost && room.players.length > 0) {
+++++      room.players[0].isHost = true;
+++++    }
+++++
+++++    if (room.speakingOrder.includes(playerId)) {
+++++      room.speakingOrder = room.speakingOrder.filter((id) => id !== playerId);
+++++      if (room.currentSpeakerIndex >= room.speakingOrder.length) {
+++++        room.currentSpeakerIndex = Math.max(0, room.speakingOrder.length - 1);
+++++      }
+++++    }
+++++
+++++    this.roomLastActivity.set(normalizedRoomId, Date.now());
+++++    return room;
+++++  }
+++++
+++++  /**
+++++   * Updates game settings during LOBBY phase.
+++++   */
+++++  public updateSettings(roomId: string, settings: Partial<GameSettings>): RoomState {
+++++    const normalizedRoomId = roomId.trim().toUpperCase();
+++++    const room = this.rooms.get(normalizedRoomId);
+++++
+++++    if (!room) {
+++++      throw new Error(`Room not found: ${normalizedRoomId}`);
+++++    }
+++++
+++++    if (room.phase !== 'LOBBY') {
+++++      throw new Error('Cannot update settings while game is in progress');
+++++    }
+++++
+++++    room.settings = {
+++++      ...room.settings,
+++++      ...settings,
+++++    };
+++++
+++++    if (settings.turnDurationSeconds) {
+++++      room.activeTurnRemainingSeconds = settings.turnDurationSeconds;
+++++    }
+++++
+++++    this.roomLastActivity.set(normalizedRoomId, Date.now());
+++++    return room;
+++++  }
+++++
+++++  /**
+++++   * Starts game by assigning roles, generating speaking order, and selecting word pair.
+++++   */
+++++  public startGame(
+++++    roomId: string,
+++++    settings?: GameSettings,
+++++    customWordPair?: WordPair
+++++  ): RoomState {
+++++    const normalizedRoomId = roomId.trim().toUpperCase();
+++++    const room = this.rooms.get(normalizedRoomId);
+++++
+++++    if (!room) {
+++++      throw new Error(`Room not found: ${normalizedRoomId}`);
+++++    }
+++++
+++++    if (settings) {
+++++      room.settings = { ...room.settings, ...settings };
+++++    }
+++++
+++++    const wordPair = customWordPair || getRandomWordPair(room.settings.category);
+++++    const { players: assignedPlayers, speakingOrder } = GameEngine.assignRoles(
+++++      room.players,
+++++      room.settings,
+++++      wordPair
+++++    );
+++++
+++++    room.phase = 'ROLE_REVEAL';
+++++    room.round = 1;
+++++    room.players = assignedPlayers;
+++++    room.speakingOrder = speakingOrder;
+++++    room.currentSpeakerIndex = 0;
+++++    room.activeTurnRemainingSeconds = room.settings.turnDurationSeconds || 45;
+++++    room.wordPair = wordPair;
+++++    room.winningRole = undefined;
+++++    room.eliminatedPlayer = undefined;
+++++
+++++    const firstSpeakerId = speakingOrder[0];
+++++    room.players.forEach((p) => {
+++++      p.isSpeaking = p.id === firstSpeakerId;
+++++    });
+++++
+++++    this.roomLastActivity.set(normalizedRoomId, Date.now());
+++++    return room;
+++++  }
+++++
+++++  /**
+++++   * Advances the speaker turn, or transitions to VOTING when all speakers finish.
+++++   */
+++++  public advanceTurn(roomId: string): RoomState {
+++++    const normalizedRoomId = roomId.trim().toUpperCase();
+++++    const room = this.rooms.get(normalizedRoomId);
+++++
+++++    if (!room) {
+++++      throw new Error(`Room not found: ${normalizedRoomId}`);
+++++    }
+++++
+++++    const livingSpeakerIds = room.speakingOrder.filter((id) =>
+++++      room.players.find((p) => p.id === id)?.isAlive
+++++    );
+++++
+++++    if (room.currentSpeakerIndex >= livingSpeakerIds.length - 1) {
+++++      // Transition to VOTING
+++++      room.phase = 'VOTING';
+++++      room.players.forEach((p) => {
+++++        p.hasVoted = false;
+++++        p.votedTargetId = undefined;
+++++        p.isSpeaking = false;
+++++      });
+++++    } else {
+++++      room.phase = 'TURN_PHASE';
+++++      room.currentSpeakerIndex++;
+++++      room.activeTurnRemainingSeconds = room.settings.turnDurationSeconds || 45;
+++++      const curSpeakerId = livingSpeakerIds[room.currentSpeakerIndex];
+++++      room.players.forEach((p) => {
+++++        p.isSpeaking = p.id === curSpeakerId;
+++++      });
+++++    }
+++++
+++++    this.roomLastActivity.set(normalizedRoomId, Date.now());
+++++    return room;
+++++  }
+++++
+++++  /**
+++++   * Casts a vote from an active player for another player.
+++++   * If all active players have voted, calculates outcome: Instant Skip on tie, Mr. White Guess, or Elimination.
+++++   */
+++++  public castVote(roomId: string, voterId: string, targetId: string): CastVoteResult {
+++++    const normalizedRoomId = roomId.trim().toUpperCase();
+++++    const room = this.rooms.get(normalizedRoomId);
+++++
+++++    if (!room) {
+++++      throw new Error(`Room not found: ${normalizedRoomId}`);
+++++    }
+++++
+++++    if (room.phase !== 'VOTING') {
+++++      throw new Error('Voting is not currently active');
+++++    }
+++++
+++++    const voter = room.players.find((p) => p.id === voterId);
+++++    const target = room.players.find((p) => p.id === targetId);
+++++
+++++    if (!voter || !voter.isAlive) {
+++++      throw new Error('Voter is not active in this game');
+++++    }
+++++
+++++    if (!target || !target.isAlive) {
+++++      throw new Error('Target is not active in this game');
+++++    }
+++++
+++++    voter.hasVoted = true;
+++++    voter.votedTargetId = targetId;
+++++
+++++    const livingPlayers = room.players.filter((p) => p.isAlive);
+++++    const allVoted = livingPlayers.every((p) => p.hasVoted);
+++++
+++++    if (!allVoted) {
+++++      this.roomLastActivity.set(normalizedRoomId, Date.now());
+++++      return { room, isComplete: false };
+++++    }
+++++
+++++    // All living players have voted -> calculate votes
+++++    const votes: Record<string, string> = {};
+++++    livingPlayers.forEach((p) => {
+++++      if (p.votedTargetId) votes[p.id] = p.votedTargetId;
+++++    });
+++++
+++++    const calcResult = GameEngine.calculateVotes(votes, room.players);
+++++
+++++    if (calcResult.isTie) {
+++++      // Instant Skip on Tie Rule
+++++      room.round++;
+++++      room.phase = 'TURN_PHASE';
+++++      room.currentSpeakerIndex = 0;
+++++      room.activeTurnRemainingSeconds = room.settings.turnDurationSeconds || 45;
+++++      const livingSpeakerIds = room.speakingOrder.filter((id) =>
+++++        room.players.find((x) => x.id === id)?.isAlive
+++++      );
+++++      room.players.forEach((p) => {
+++++        p.hasVoted = false;
+++++        p.votedTargetId = undefined;
+++++        p.isSpeaking = p.id === livingSpeakerIds[0];
+++++      });
+++++
+++++      this.roomLastActivity.set(normalizedRoomId, Date.now());
+++++      return { room, isComplete: true, isTie: true };
+++++    }
+++++
+++++    // Elimination
+++++    const eliminated = room.players.find((p) => p.id === calcResult.eliminatedPlayerId);
+++++    if (eliminated) {
+++++      eliminated.isAlive = false;
+++++      room.eliminatedPlayer = eliminated;
+++++    }
+++++
+++++    if (eliminated?.role === 'MR_WHITE') {
+++++      room.phase = 'MR_WHITE_GUESS';
+++++      this.roomLastActivity.set(normalizedRoomId, Date.now());
+++++      return { room, isComplete: true, isTie: false, eliminatedPlayer: eliminated };
+++++    }
+++++
+++++    const winner = GameEngine.checkWinCondition(room.players);
+++++    if (winner) {
+++++      room.phase = 'GAME_OVER';
+++++      room.winningRole = winner;
+++++      this.roomLastActivity.set(normalizedRoomId, Date.now());
+++++      return { room, isComplete: true, isTie: false, eliminatedPlayer: eliminated, winner };
+++++    }
+++++
+++++    // Advance to next round
+++++    room.round++;
+++++    room.phase = 'TURN_PHASE';
+++++    room.currentSpeakerIndex = 0;
+++++    room.activeTurnRemainingSeconds = room.settings.turnDurationSeconds || 45;
+++++    const livingSpeakerIds = room.speakingOrder.filter((id) =>
+++++      room.players.find((x) => x.id === id)?.isAlive
+++++    );
+++++    room.players.forEach((p) => {
+++++      p.hasVoted = false;
+++++      p.votedTargetId = undefined;
+++++      p.isSpeaking = p.id === livingSpeakerIds[0];
+++++    });
+++++
+++++    this.roomLastActivity.set(normalizedRoomId, Date.now());
+++++    return { room, isComplete: true, isTie: false, eliminatedPlayer: eliminated };
+++++  }
+++++
+++++  /**
+++++   * Handles Mr. White's emergency guess using fuzzy text matching.
+++++   */
+++++  public handleMrWhiteGuess(roomId: string, guess: string): MrWhiteGuessResult {
+++++    const normalizedRoomId = roomId.trim().toUpperCase();
+++++    const room = this.rooms.get(normalizedRoomId);
+++++
+++++    if (!room) {
+++++      throw new Error(`Room not found: ${normalizedRoomId}`);
+++++    }
+++++
+++++    if (room.phase !== 'MR_WHITE_GUESS') {
+++++      throw new Error('Mr. White guess phase is not active');
+++++    }
+++++
+++++    const civilianWord = room.wordPair?.civilianWord || '';
+++++    const isCorrect = FuzzyMatcher.isMatch(guess, civilianWord);
+++++
+++++    if (isCorrect) {
+++++      room.phase = 'GAME_OVER';
+++++      room.winningRole = 'MR_WHITE';
+++++      this.roomLastActivity.set(normalizedRoomId, Date.now());
+++++      return { room, isCorrect: true, winner: 'MR_WHITE' };
+++++    }
+++++
+++++    // Mr. White guessed incorrectly; check standard win condition
+++++    const winner = GameEngine.checkWinCondition(room.players);
+++++    if (winner) {
+++++      room.phase = 'GAME_OVER';
+++++      room.winningRole = winner;
+++++      this.roomLastActivity.set(normalizedRoomId, Date.now());
+++++      return { room, isCorrect: false, winner };
+++++    }
+++++
+++++    room.round++;
+++++    room.phase = 'TURN_PHASE';
+++++    room.currentSpeakerIndex = 0;
+++++    room.activeTurnRemainingSeconds = room.settings.turnDurationSeconds || 45;
+++++    const livingSpeakerIds = room.speakingOrder.filter((id) =>
+++++      room.players.find((x) => x.id === id)?.isAlive
+++++    );
+++++    room.players.forEach((p) => {
+++++      p.hasVoted = false;
+++++      p.votedTargetId = undefined;
+++++      p.isSpeaking = p.id === livingSpeakerIds[0];
+++++    });
+++++
+++++    this.roomLastActivity.set(normalizedRoomId, Date.now());
+++++    return { room, isCorrect: false };
+++++  }
+++++
+++++  /**
+++++   * Reconnects a player session by their unique playerToken.
+++++   */
+++++  public reconnectPlayer(playerToken: string): { player: Player; room: RoomState } | null {
+++++    const session = this.sessions.get(playerToken);
+++++    if (!session) return null;
+++++
+++++    const room = this.rooms.get(session.roomId);
+++++    if (!room) return null;
+++++
+++++    const player = room.players.find((p) => p.id === session.playerId);
+++++    if (!player) return null;
+++++
+++++    this.roomLastActivity.set(session.roomId, Date.now());
+++++    return { player, room };
+++++  }
+++++
+++++  /**
+++++   * Resets room back to LOBBY for a rematch while retaining connected players.
+++++   */
+++++  public rematch(roomId: string): RoomState {
+++++    const normalizedRoomId = roomId.trim().toUpperCase();
+++++    const room = this.rooms.get(normalizedRoomId);
+++++
+++++    if (!room) {
+++++      throw new Error(`Room not found: ${normalizedRoomId}`);
+++++    }
+++++
+++++    room.phase = 'LOBBY';
+++++    room.round = 1;
+++++    room.speakingOrder = [];
+++++    room.currentSpeakerIndex = 0;
+++++    room.activeTurnRemainingSeconds = room.settings.turnDurationSeconds || 45;
+++++    room.winningRole = undefined;
+++++    room.eliminatedPlayer = undefined;
+++++    room.wordPair = undefined;
+++++
+++++    room.players.forEach((p) => {
+++++      p.role = undefined;
+++++      p.word = undefined;
+++++      p.isAlive = true;
+++++      p.hasVoted = false;
+++++      p.votedTargetId = undefined;
+++++      p.isSpeaking = false;
+++++    });
+++++
+++++    this.roomLastActivity.set(normalizedRoomId, Date.now());
+++++    return room;
+++++  }
+++++
+++++  /**
+++++   * Retrieves room by roomId.
+++++   */
+++++  public getRoom(roomId: string): RoomState | undefined {
+++++    return this.rooms.get(roomId.trim().toUpperCase());
+++++  }
+++++
+++++  /**
+++++   * Returns active room count.
+++++   */
+++++  public getActiveRoomsCount(): number {
+++++    return this.rooms.size;
+++++  }
+++++
+++++  /**
+++++   * Garbage collector for inactive rooms (> maxIdleMs, default 2 hours).
+++++   */
+++++  public cleanupIdleRooms(maxIdleMs = 2 * 60 * 60 * 1000): void {
+++++    const now = Date.now();
+++++    for (const [roomId, lastActive] of this.roomLastActivity.entries()) {
+++++      if (now - lastActive > maxIdleMs) {
+++++        this.rooms.delete(roomId);
+++++        this.roomLastActivity.delete(roomId);
+++++        for (const [token, session] of this.sessions.entries()) {
+++++          if (session.roomId === roomId) {
+++++            this.sessions.delete(token);
+++++          }
+++++        }
+++++      }
+++++    }
+++++  }
+++++
+++++  /**
+++++   * Destroys timer instance (used in tests and shutdown).
+++++   */
+++++  public destroy(): void {
+++++    if (this.cleanupInterval) {
+++++      clearInterval(this.cleanupInterval);
+++++      this.cleanupInterval = null;
+++++    }
+++++  }
+++++}
++++diff --git a/server/src/server.ts b/server/src/server.ts
++++index 99a8a27..6e76ed9 100644
++++--- a/server/src/server.ts
+++++++ b/server/src/server.ts
++++@@ -1,29 +1,40 @@
++++ import express, { Request, Response } from 'express';
++++ import http from 'http';
++++ import { Server } from 'socket.io';
++++ import cors from 'cors';
++++ import dotenv from 'dotenv';
+++++import { RoomManager } from './managers/RoomManager.js';
+++++import { registerRoomHandlers } from './handlers/roomHandler.js';
+++++import { registerGameHandlers } from './handlers/gameHandler.js';
+++++import { registerVoteHandlers } from './handlers/voteHandler.js';
++++ 
++++ dotenv.config({ path: '../.env' });
++++ dotenv.config();
++++ 
++++ const app = express();
++++ const server = http.createServer(app);
++++ 
++++ const PORT = process.env.PORT || 3001;
++++ 
++++-app.use(cors({
++++-  origin: '*',
++++-  methods: ['GET', 'POST'],
++++-}));
+++++app.use(
+++++  cors({
+++++    origin: '*',
+++++    methods: ['GET', 'POST'],
+++++  })
+++++);
++++ 
++++ app.use(express.json());
++++ 
+++++const roomManager = new RoomManager();
+++++const startTime = Date.now();
+++++
++++ app.get('/health', (_req: Request, res: Response) => {
++++   res.status(200).json({
++++     status: 'ok',
+++++    activeRooms: roomManager.getActiveRoomsCount(),
+++++    uptime: Math.floor((Date.now() - startTime) / 1000),
++++     timestamp: new Date().toISOString(),
++++     service: 'whatstheword-server',
++++   });
++++ });
++++ 
++++@@ -35,10 +46,14 @@ const io = new Server(server, {
++++ });
++++ 
++++ io.on('connection', (socket) => {
++++   console.log(`[Socket.io] Client connected: ${socket.id}`);
++++ 
+++++  registerRoomHandlers(io, socket, roomManager);
+++++  registerGameHandlers(io, socket, roomManager);
+++++  registerVoteHandlers(io, socket, roomManager);
+++++
++++   socket.on('disconnect', () => {
++++     console.log(`[Socket.io] Client disconnected: ${socket.id}`);
++++   });
++++ });
++++ 
++++@@ -46,6 +61,6 @@ if (process.env.NODE_ENV !== 'test') {
++++   server.listen(PORT, () => {
++++     console.log(`[Server] What's The Word server running on port ${PORT}`);
++++   });
++++ }
++++ 
++++-export { app, server, io };
+++++export { app, server, io, roomManager };
++++diff --git a/server/tests/RoomManager.test.ts b/server/tests/RoomManager.test.ts
++++new file mode 100644
++++index 0000000..d9ae576
++++--- /dev/null
+++++++ b/server/tests/RoomManager.test.ts
++++@@ -0,0 +1,397 @@
+++++import { describe, it, expect, beforeEach, afterEach } from 'vitest';
+++++import { RoomManager } from '../src/managers/RoomManager.js';
+++++import { GameSettings, WordPair } from '../src/types/game.types.js';
+++++
+++++describe('RoomManager', () => {
+++++  let roomManager: RoomManager;
+++++
+++++  beforeEach(() => {
+++++    roomManager = new RoomManager();
+++++  });
+++++
+++++  afterEach(() => {
+++++    roomManager.destroy();
+++++  });
+++++
+++++  describe('createRoom', () => {
+++++    it('should create a room with a 4-character code and host player', () => {
+++++      const result = roomManager.createRoom('Alice', 'avatar_1');
+++++      expect(result.roomId).toBeDefined();
+++++      expect(result.roomId.length).toBe(4);
+++++      expect(result.roomId).toMatch(/^[A-Z0-9]{4}$/);
+++++      expect(result.playerToken).toBeDefined();
+++++      expect(result.player).toMatchObject({
+++++        name: 'Alice',
+++++        avatar: 'avatar_1',
+++++        isHost: true,
+++++        isAlive: true,
+++++        hasVoted: false,
+++++      });
+++++      expect(result.room.roomId).toBe(result.roomId);
+++++      expect(result.room.phase).toBe('LOBBY');
+++++      expect(result.room.players).toHaveLength(1);
+++++      expect(result.room.players[0].id).toBe(result.player.id);
+++++    });
+++++  });
+++++
+++++  describe('joinRoom', () => {
+++++    it('should allow multiple players to join a room', () => {
+++++      const { roomId } = roomManager.createRoom('Host', 'avatar_host');
+++++      const p2 = roomManager.joinRoom(roomId, 'Bob', 'avatar_2');
+++++      const p3 = roomManager.joinRoom(roomId, 'Charlie', 'avatar_3');
+++++
+++++      const room = roomManager.getRoom(roomId);
+++++      expect(room).toBeDefined();
+++++      expect(room?.players).toHaveLength(3);
+++++      expect(p2.player.isHost).toBe(false);
+++++      expect(p3.player.isHost).toBe(false);
+++++      expect(p2.playerToken).not.toBe(p3.playerToken);
+++++    });
+++++
+++++    it('should throw error when joining non-existent room', () => {
+++++      expect(() => {
+++++        roomManager.joinRoom('ZZZZ', 'Bob', 'avatar_2');
+++++      }).toThrow(/Room not found/i);
+++++    });
+++++
+++++    it('should reconnect existing player if existingToken is provided and valid', () => {
+++++      const { roomId, playerToken: hostToken, player: hostPlayer } = roomManager.createRoom('Host', 'avatar_host');
+++++      const joinResult = roomManager.joinRoom(roomId, 'Host', 'avatar_host', hostToken);
+++++      expect(joinResult.player.id).toBe(hostPlayer.id);
+++++      expect(joinResult.playerToken).toBe(hostToken);
+++++      expect(roomManager.getRoom(roomId)?.players).toHaveLength(1);
+++++    });
+++++  });
+++++
+++++  describe('leaveRoom and host migration', () => {
+++++    it('should migrate host role to the next player when host leaves', () => {
+++++      const { roomId, player: host } = roomManager.createRoom('Host', 'avatar_1');
+++++      const { player: bob } = roomManager.joinRoom(roomId, 'Bob', 'avatar_2');
+++++      const { player: charlie } = roomManager.joinRoom(roomId, 'Charlie', 'avatar_3');
+++++
+++++      const updatedRoom = roomManager.leaveRoom(roomId, host.id);
+++++      expect(updatedRoom).not.toBeNull();
+++++      expect(updatedRoom?.players).toHaveLength(2);
+++++      expect(updatedRoom?.players[0].id).toBe(bob.id);
+++++      expect(updatedRoom?.players[0].isHost).toBe(true);
+++++      expect(updatedRoom?.players[1].id).toBe(charlie.id);
+++++      expect(updatedRoom?.players[1].isHost).toBe(false);
+++++    });
+++++
+++++    it('should remove room when all players leave', () => {
+++++      const { roomId, player: host } = roomManager.createRoom('Host', 'avatar_1');
+++++      const updatedRoom = roomManager.leaveRoom(roomId, host.id);
+++++      expect(updatedRoom).toBeNull();
+++++      expect(roomManager.getRoom(roomId)).toBeUndefined();
+++++    });
+++++  });
+++++
+++++  describe('updateSettings', () => {
+++++    it('should update room settings in LOBBY phase', () => {
+++++      const { roomId } = roomManager.createRoom('Host', 'avatar_1');
+++++      const newSettings: Partial<GameSettings> = {
+++++        category: 'Hewan',
+++++        civilianCount: 4,
+++++        undercoverCount: 2,
+++++        mrWhiteCount: 1,
+++++        turnDurationSeconds: 60,
+++++      };
+++++
+++++      const updatedRoom = roomManager.updateSettings(roomId, newSettings);
+++++      expect(updatedRoom.settings.category).toBe('Hewan');
+++++      expect(updatedRoom.settings.civilianCount).toBe(4);
+++++      expect(updatedRoom.settings.undercoverCount).toBe(2);
+++++      expect(updatedRoom.settings.turnDurationSeconds).toBe(60);
+++++    });
+++++
+++++    it('should throw error when updating settings after game started', () => {
+++++      const { roomId } = roomManager.createRoom('Host', 'avatar_1');
+++++      roomManager.joinRoom(roomId, 'Bob', 'avatar_2');
+++++      roomManager.joinRoom(roomId, 'Charlie', 'avatar_3');
+++++      roomManager.joinRoom(roomId, 'Dave', 'avatar_4');
+++++
+++++      roomManager.startGame(roomId, {
+++++        category: 'Makanan & Minuman',
+++++        civilianCount: 2,
+++++        undercoverCount: 1,
+++++        mrWhiteCount: 1,
+++++        turnDurationSeconds: 30,
+++++        enableMrWhite: true,
+++++      });
+++++
+++++      expect(() => {
+++++        roomManager.updateSettings(roomId, { civilianCount: 3 });
+++++      }).toThrow(/Cannot update settings while game is in progress/i);
+++++    });
+++++  });
+++++
+++++  describe('reconnectPlayer', () => {
+++++    it('should retrieve player and room using valid playerToken', () => {
+++++      const { roomId, playerToken, player } = roomManager.createRoom('Host', 'avatar_1');
+++++      const reconnectData = roomManager.reconnectPlayer(playerToken);
+++++      expect(reconnectData).not.toBeNull();
+++++      expect(reconnectData?.player.id).toBe(player.id);
+++++      expect(reconnectData?.room.roomId).toBe(roomId);
+++++    });
+++++
+++++    it('should return null for invalid or expired token', () => {
+++++      const reconnectData = roomManager.reconnectPlayer('invalid-token-1234');
+++++      expect(reconnectData).toBeNull();
+++++    });
+++++  });
+++++
+++++  describe('startGame and role distribution', () => {
+++++    it('should initialize role assignments, speaking order, and wordPair', () => {
+++++      const { roomId } = roomManager.createRoom('Player1', 'av1');
+++++      roomManager.joinRoom(roomId, 'Player2', 'av2');
+++++      roomManager.joinRoom(roomId, 'Player3', 'av3');
+++++      roomManager.joinRoom(roomId, 'Player4', 'av4');
+++++
+++++      const customPair: WordPair = {
+++++        category: 'Makanan & Minuman',
+++++        civilianWord: 'Kopi',
+++++        undercoverWord: 'Teh',
+++++      };
+++++
+++++      const settings: GameSettings = {
+++++        category: 'Makanan & Minuman',
+++++        civilianCount: 2,
+++++        undercoverCount: 1,
+++++        mrWhiteCount: 1,
+++++        turnDurationSeconds: 45,
+++++        enableMrWhite: true,
+++++      };
+++++
+++++      const room = roomManager.startGame(roomId, settings, customPair);
+++++      expect(room.phase).toBe('ROLE_REVEAL');
+++++      expect(room.round).toBe(1);
+++++      expect(room.speakingOrder).toHaveLength(4);
+++++      expect(room.currentSpeakerIndex).toBe(0);
+++++      expect(room.wordPair).toEqual(customPair);
+++++
+++++      const civs = room.players.filter((p) => p.role === 'CIVILIAN');
+++++      const undercovers = room.players.filter((p) => p.role === 'UNDERCOVER');
+++++      const mrWhites = room.players.filter((p) => p.role === 'MR_WHITE');
+++++
+++++      expect(civs).toHaveLength(2);
+++++      expect(undercovers).toHaveLength(1);
+++++      expect(mrWhites).toHaveLength(1);
+++++
+++++      civs.forEach((p) => expect(p.word).toBe('Kopi'));
+++++      undercovers.forEach((p) => expect(p.word).toBe('Teh'));
+++++      mrWhites.forEach((p) => expect(p.word).toBe(''));
+++++    });
+++++  });
+++++
+++++  describe('advanceTurn', () => {
+++++    it('should cycle through speaking order and transition to VOTING when all speakers finish', () => {
+++++      const { roomId } = roomManager.createRoom('P1', 'av1');
+++++      roomManager.joinRoom(roomId, 'P2', 'av2');
+++++      roomManager.joinRoom(roomId, 'P3', 'av3');
+++++
+++++      roomManager.startGame(roomId, {
+++++        category: 'Makanan & Minuman',
+++++        civilianCount: 2,
+++++        undercoverCount: 1,
+++++        mrWhiteCount: 0,
+++++        turnDurationSeconds: 45,
+++++        enableMrWhite: false,
+++++      });
+++++
+++++      // Speaker 0 -> Speaker 1
+++++      let room = roomManager.advanceTurn(roomId);
+++++      expect(room.phase).toBe('TURN_PHASE');
+++++      expect(room.currentSpeakerIndex).toBe(1);
+++++
+++++      // Speaker 1 -> Speaker 2
+++++      room = roomManager.advanceTurn(roomId);
+++++      expect(room.phase).toBe('TURN_PHASE');
+++++      expect(room.currentSpeakerIndex).toBe(2);
+++++
+++++      // Speaker 2 (last) -> VOTING
+++++      room = roomManager.advanceTurn(roomId);
+++++      expect(room.phase).toBe('VOTING');
+++++    });
+++++  });
+++++
+++++  describe('castVote', () => {
+++++    let roomId: string;
+++++    let p1Id: string;
+++++    let p2Id: string;
+++++    let p3Id: string;
+++++    let p4Id: string;
+++++
+++++    beforeEach(() => {
+++++      const p1 = roomManager.createRoom('P1', 'av1');
+++++      const p2 = roomManager.joinRoom(p1.roomId, 'P2', 'av2');
+++++      const p3 = roomManager.joinRoom(p1.roomId, 'P3', 'av3');
+++++      const p4 = roomManager.joinRoom(p1.roomId, 'P4', 'av4');
+++++
+++++      roomId = p1.roomId;
+++++      p1Id = p1.player.id;
+++++      p2Id = p2.player.id;
+++++      p3Id = p3.player.id;
+++++      p4Id = p4.player.id;
+++++
+++++      roomManager.startGame(roomId, {
+++++        category: 'Makanan & Minuman',
+++++        civilianCount: 2,
+++++        undercoverCount: 1,
+++++        mrWhiteCount: 1,
+++++        turnDurationSeconds: 45,
+++++        enableMrWhite: true,
+++++      }, {
+++++        category: 'Makanan & Minuman',
+++++        civilianWord: 'Kopi',
+++++        undercoverWord: 'Teh',
+++++      });
+++++
+++++      // Advance through turn phase to voting
+++++      roomManager.advanceTurn(roomId); // 1
+++++      roomManager.advanceTurn(roomId); // 2
+++++      roomManager.advanceTurn(roomId); // 3
+++++      roomManager.advanceTurn(roomId); // -> VOTING
+++++    });
+++++
+++++    it('should record partial votes until all living players have voted', () => {
+++++      const res1 = roomManager.castVote(roomId, p1Id, p2Id);
+++++      expect(res1.isComplete).toBe(false);
+++++      expect(res1.room.players.find((p) => p.id === p1Id)?.hasVoted).toBe(true);
+++++
+++++      const res2 = roomManager.castVote(roomId, p2Id, p1Id);
+++++      expect(res2.isComplete).toBe(false);
+++++    });
+++++
+++++    it('should trigger Instant Skip on voting tie and proceed to next round without elimination', () => {
+++++      // 2 votes for P1, 2 votes for P2
+++++      roomManager.castVote(roomId, p1Id, p2Id);
+++++      roomManager.castVote(roomId, p3Id, p2Id);
+++++      roomManager.castVote(roomId, p2Id, p1Id);
+++++      const res = roomManager.castVote(roomId, p4Id, p1Id);
+++++
+++++      expect(res.isComplete).toBe(true);
+++++      expect(res.isTie).toBe(true);
+++++      expect(res.eliminatedPlayer).toBeUndefined();
+++++      expect(res.room.phase).toBe('TURN_PHASE');
+++++      expect(res.room.round).toBe(2);
+++++      expect(res.room.players.every((p) => p.isAlive)).toBe(true);
+++++    });
+++++
+++++    it('should transition to MR_WHITE_GUESS when Mr. White is eliminated', () => {
+++++      const mrWhite = roomManager.getRoom(roomId)!.players.find((p) => p.role === 'MR_WHITE')!;
+++++      const otherPlayers = roomManager.getRoom(roomId)!.players.filter((p) => p.id !== mrWhite.id);
+++++
+++++      // Everyone votes for Mr. White
+++++      otherPlayers.forEach((p) => {
+++++        roomManager.castVote(roomId, p.id, mrWhite.id);
+++++      });
+++++      const res = roomManager.castVote(roomId, mrWhite.id, otherPlayers[0].id);
+++++
+++++      expect(res.isComplete).toBe(true);
+++++      expect(res.isTie).toBe(false);
+++++      expect(res.eliminatedPlayer?.id).toBe(mrWhite.id);
+++++      expect(res.room.phase).toBe('MR_WHITE_GUESS');
+++++    });
+++++  });
+++++
+++++  describe('handleMrWhiteGuess', () => {
+++++    it('should award victory to MR_WHITE on correct guess', () => {
+++++      const { roomId } = roomManager.createRoom('Host', 'av1');
+++++      roomManager.joinRoom(roomId, 'Bob', 'av2');
+++++      roomManager.joinRoom(roomId, 'Charlie', 'av3');
+++++      roomManager.joinRoom(roomId, 'Dave', 'av4');
+++++
+++++      roomManager.startGame(roomId, {
+++++        category: 'Makanan & Minuman',
+++++        civilianCount: 2,
+++++        undercoverCount: 1,
+++++        mrWhiteCount: 1,
+++++        turnDurationSeconds: 45,
+++++        enableMrWhite: true,
+++++      }, {
+++++        category: 'Makanan & Minuman',
+++++        civilianWord: 'Nasi Padang',
+++++        undercoverWord: 'Nasi Uduk',
+++++      });
+++++
+++++      const room = roomManager.getRoom(roomId)!;
+++++      room.phase = 'MR_WHITE_GUESS';
+++++
+++++      const guessRes = roomManager.handleMrWhiteGuess(roomId, 'nasi padang');
+++++      expect(guessRes.isCorrect).toBe(true);
+++++      expect(guessRes.winner).toBe('MR_WHITE');
+++++      expect(guessRes.room.phase).toBe('GAME_OVER');
+++++      expect(guessRes.room.winningRole).toBe('MR_WHITE');
+++++    });
+++++
+++++    it('should eliminate Mr. White and check win condition on incorrect guess', () => {
+++++      const { roomId } = roomManager.createRoom('Host', 'av1');
+++++      roomManager.joinRoom(roomId, 'Bob', 'av2');
+++++      roomManager.joinRoom(roomId, 'Charlie', 'av3');
+++++      roomManager.joinRoom(roomId, 'Dave', 'av4');
+++++
+++++      roomManager.startGame(roomId, {
+++++        category: 'Makanan & Minuman',
+++++        civilianCount: 2,
+++++        undercoverCount: 1,
+++++        mrWhiteCount: 1,
+++++        turnDurationSeconds: 45,
+++++        enableMrWhite: true,
+++++      }, {
+++++        category: 'Makanan & Minuman',
+++++        civilianWord: 'Nasi Padang',
+++++        undercoverWord: 'Nasi Uduk',
+++++      });
+++++
+++++      const room = roomManager.getRoom(roomId)!;
+++++      const mrWhite = room.players.find((p) => p.role === 'MR_WHITE')!;
+++++      mrWhite.isAlive = false;
+++++      room.phase = 'MR_WHITE_GUESS';
+++++
+++++      const guessRes = roomManager.handleMrWhiteGuess(roomId, 'Bakso Sapi');
+++++      expect(guessRes.isCorrect).toBe(false);
+++++      // Undercover + 2 Civilians alive -> game continues to next round
+++++      expect(guessRes.winner).toBeUndefined();
+++++      expect(guessRes.room.phase).toBe('TURN_PHASE');
+++++      expect(guessRes.room.round).toBe(2);
+++++    });
+++++  });
+++++
+++++  describe('rematch', () => {
+++++    it('should reset room back to LOBBY phase preserving players and host', () => {
+++++      const { roomId } = roomManager.createRoom('Host', 'av1');
+++++      roomManager.joinRoom(roomId, 'Bob', 'av2');
+++++      roomManager.joinRoom(roomId, 'Charlie', 'av3');
+++++
+++++      roomManager.startGame(roomId);
+++++      const room = roomManager.rematch(roomId);
+++++
+++++      expect(room.phase).toBe('LOBBY');
+++++      expect(room.round).toBe(1);
+++++      expect(room.winningRole).toBeUndefined();
+++++      expect(room.eliminatedPlayer).toBeUndefined();
+++++      expect(room.players).toHaveLength(3);
+++++      expect(room.players.every((p) => p.isAlive && !p.role && !p.word && !p.hasVoted)).toBe(true);
+++++      expect(room.players[0].isHost).toBe(true);
+++++    });
+++++  });
+++++
+++++  describe('cleanup and garbage collection', () => {
+++++    it('should clean up idle rooms older than 2 hours', () => {
+++++      const { roomId } = roomManager.createRoom('Host', 'av1');
+++++      expect(roomManager.getRoom(roomId)).toBeDefined();
+++++
+++++      // Mock Date.now to 3 hours in the future
+++++      const realDateNow = Date.now;
+++++      try {
+++++        const threeHoursLater = Date.now() + 3 * 60 * 60 * 1000;
+++++        Date.now = () => threeHoursLater;
+++++
+++++        roomManager.cleanupIdleRooms();
+++++        expect(roomManager.getRoom(roomId)).toBeUndefined();
+++++      } finally {
+++++        Date.now = realDateNow;
+++++      }
+++++    });
+++++  });
+++++});
++++diff --git a/server/tests/Server.test.ts b/server/tests/Server.test.ts
++++new file mode 100644
++++index 0000000..051fa40
++++--- /dev/null
+++++++ b/server/tests/Server.test.ts
++++@@ -0,0 +1,34 @@
+++++import { describe, it, expect, afterAll } from 'vitest';
+++++import { app, roomManager, io, server } from '../src/server.js';
+++++import { registerRoomHandlers } from '../src/handlers/roomHandler.js';
+++++import { registerGameHandlers } from '../src/handlers/gameHandler.js';
+++++import { registerVoteHandlers } from '../src/handlers/voteHandler.js';
+++++
+++++describe('Server and Handlers Integration', () => {
+++++  afterAll(() => {
+++++    roomManager.destroy();
+++++  });
+++++
+++++  it('should export app, server, io, and roomManager instances', () => {
+++++    expect(app).toBeDefined();
+++++    expect(server).toBeDefined();
+++++    expect(io).toBeDefined();
+++++    expect(roomManager).toBeDefined();
+++++  });
+++++
+++++  it('should register socket handlers without throwing errors', () => {
+++++    const mockSocket: any = {
+++++      id: 'test-socket-1',
+++++      data: {},
+++++      join: () => {},
+++++      leave: () => {},
+++++      on: () => {},
+++++    };
+++++
+++++    expect(() => {
+++++      registerRoomHandlers(io, mockSocket, roomManager);
+++++      registerGameHandlers(io, mockSocket, roomManager);
+++++      registerVoteHandlers(io, mockSocket, roomManager);
+++++    }).not.toThrow();
+++++  });
+++++});
++++
++++```
+++diff --git a/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-5-brief.md b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-5-brief.md
+++new file mode 100644
+++index 0000000..75697cb
+++--- /dev/null
++++++ b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-5-brief.md
+++@@ -0,0 +1,34 @@
++++# Task 5 Brief: Supabase Cloud Word Pack Service & Community Packs
++++
++++## Goal
++++Implement Supabase integration for cloud word packs, community sharing, and offline fallback:
++++
++++1. `supabase/schema.sql`:
++++   - SQL schema definitions for:
++++     - `word_packs` table (id uuid, category text, civilian_word text, undercover_word text, is_official boolean, created_at timestamp)
++++     - `custom_packs` table (id uuid, title text, author_name text, share_code text unique, word_pairs jsonb, is_public boolean, created_at timestamp)
++++     - Row Level Security (RLS) policies allowing public anonymous read for word_packs and public custom_packs, and public anonymous insert for custom_packs.
++++     - Optional seed script inserting standard Indonesian categories into `word_packs`.
++++
++++2. `client/src/services/supabaseClient.ts`:
++++   - Initialize and export `supabase` client using `@supabase/supabase-js`
++++   - Read `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`
++++   - Fallback constants if env variables are missing:
++++     - URL: `https://rmsvxhoblwdhhdjpgjdn.supabase.co`
++++     - Anon Key: `sb_publishable_2Mli4l2s2k_On3ZkRz5VhQ_RewKXkfK`
++++   - Export `isSupabaseConfigured(): boolean`
++++
++++3. `client/src/services/wordPackService.ts`:
++++   - Methods:
++++     - `getOfficialWordPairs(category?: string): Promise<WordPair[]>` (Tries Supabase first; if offline or empty, falls back seamlessly to `defaultWordPacks.ts`)
++++     - `getCommunityPacks(): Promise<CustomWordPack[]>` (Fetches public packs from Supabase + reads local storage packs)
++++     - `getPackByShareCode(shareCode: string): Promise<CustomWordPack | null>`
++++     - `saveCustomPack(title: string, authorName: string, pairs: WordPair[], isPublic?: boolean): Promise<{ success: boolean; pack: CustomWordPack; shareCode: string }>`
++++     - Local storage syncing for custom packs created by the user (`localStorage.getItem('whatstheword_custom_packs')`).
++++
++++4. Verification:
++++   - Typecheck and build verification across `client/`.
++++
++++## Report Contract
++++Write report to: `C:\Users\ASUS\Documents\ALIFKA\PROJECT\whatstheword\.superpowers\sdd\2026-09-02-whatstheword-implementation\task-5-report.md`
++++Return: status (DONE / BLOCKED), commits, one-line test summary.
+++diff --git a/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-5-report.md b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-5-report.md
+++new file mode 100644
+++index 0000000..d881b65
+++--- /dev/null
++++++ b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-5-report.md
+++@@ -0,0 +1,40 @@
++++# Task 5 Report: Supabase Cloud Word Pack Service & Community Packs
++++
++++## Status
++++- **Status:** DONE
++++- **Commit:** `b1fb308` (`feat(db): implement Supabase cloud word pack integration and community sharing`)
++++- **Verification:** `npm run typecheck` passed (0 errors across `client` and `server`), `npm run build:client` succeeded (Vite production bundle built cleanly in 2.82s), `npm test` passed (49/49 unit tests passed).
++++
++++---
++++
++++## Changes Implemented
++++
++++### 1. Database Schema & Seed Data (`supabase/schema.sql`)
++++- Created `word_packs` table with UUID primary key, category, civilian_word, undercover_word, is_official flag, created_at, and unique constraint.
++++- Created `custom_packs` table with UUID primary key, title, author_name, unique share_code, JSONB word_pairs, is_public flag, and created_at.
++++- Added performance indexes for fast category queries, share code lookups, and creation timestamps.
++++- Enabled Row Level Security (RLS) with policies allowing anonymous & authenticated read on `word_packs` and `custom_packs`, and anonymous insert on `custom_packs`.
++++- Included complete Indonesian seed dataset for all 5 official categories (Makanan & Minuman, Hewan, Benda & Gadget, Tempat & Hiburan, Profesi).
++++
++++### 2. Supabase Client (`client/src/services/supabaseClient.ts`)
++++- Initialized Supabase client using `@supabase/supabase-js`.
++++- Configured environment variable reading via `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`.
++++- Added resilient fallback constants targeting project `https://rmsvxhoblwdhhdjpgjdn.supabase.co`.
++++- Exported `isSupabaseConfigured(): boolean` helper.
++++
++++### 3. Word Pack Service & Offline Fallbacks (`client/src/services/wordPackService.ts`)
++++- Implemented `getOfficialWordPairs(category?: string)`: Queries Supabase cloud database for official pairs with automatic, zero-latency fallback to `defaultWordPacks.ts` when offline or on network failure.
++++- Implemented `getCommunityPacks()`: Fetches public community packs from Supabase and merges them with locally created custom packs from `localStorage`.
++++- Implemented `getPackByShareCode(shareCode: string)`: Resolves 6-character share codes by checking `localStorage` first, then querying Supabase.
++++- Implemented `saveCustomPack(title, authorName, pairs, isPublic)`: Generates 6-character share codes, persists instantly to `localStorage`, and uploads to Supabase cloud if online.
++++- Added `getLocalCustomPacks()`, `saveLocalCustomPack()`, `deleteLocalCustomPack()`, and `generateShareCode()` helpers.
++++
++++### 4. Shared Types Update (`client/src/types/game.types.ts` & `server/src/types/game.types.ts`)
++++- Added `CustomWordPack` interface to both client and server type definitions.
++++
++++---
++++
++++## Verification Results
++++- **Typecheck:** `npm run typecheck` across client & server -> 0 errors.
++++- **Client Build:** `npm run build:client` -> Built in 2.82s (`dist/assets/index-BGamo-K0.js` 151.81 kB).
++++- **Engine Tests:** `npm test` -> 4 test suites passed (49 tests passing).
+++diff --git a/client/src/services/supabaseClient.ts b/client/src/services/supabaseClient.ts
+++new file mode 100644
+++index 0000000..351926b
+++--- /dev/null
++++++ b/client/src/services/supabaseClient.ts
+++@@ -0,0 +1,28 @@
++++import { createClient, SupabaseClient } from '@supabase/supabase-js';
++++
++++const FALLBACK_SUPABASE_URL = 'https://rmsvxhoblwdhhdjpgjdn.supabase.co';
++++const FALLBACK_SUPABASE_ANON_KEY = 'sb_publishable_2Mli4l2s2k_On3ZkRz5VhQ_RewKXkfK';
++++
++++const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL).trim();
++++const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY).trim();
++++
++++export const isSupabaseConfigured = (): boolean => {
++++  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));
++++};
++++
++++let clientInstance: SupabaseClient;
++++
++++try {
++++  clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
++++    auth: {
++++      persistSession: true,
++++      autoRefreshToken: true,
++++    },
++++  });
++++} catch (error) {
++++  console.warn('[Supabase] Failed to initialize client, initializing dummy fallback:', error);
++++  // Fallback creation with fallback constants if initial configuration failed
++++  clientInstance = createClient(FALLBACK_SUPABASE_URL, FALLBACK_SUPABASE_ANON_KEY);
++++}
++++
++++export const supabase = clientInstance;
+++diff --git a/client/src/services/wordPackService.ts b/client/src/services/wordPackService.ts
+++new file mode 100644
+++index 0000000..1a88d3a
+++--- /dev/null
++++++ b/client/src/services/wordPackService.ts
+++@@ -0,0 +1,287 @@
++++import { supabase, isSupabaseConfigured } from './supabaseClient';
++++import { WordPair, CustomWordPack } from '../types/game.types';
++++import { getWordPairsByCategory } from '../data/defaultWordPacks';
++++
++++
++++export const LOCAL_STORAGE_CUSTOM_PACKS_KEY = 'whatstheword_custom_packs';
++++
++++/**
++++ * Generate a clean, human-readable 6-character alphanumeric share code.
++++ * (e.g., 'WTW-8K29' or '8K29PX')
++++ */
++++export function generateShareCode(): string {
++++  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
++++  let result = '';
++++  for (let i = 0; i < 6; i++) {
++++    result += chars.charAt(Math.floor(Math.random() * chars.length));
++++  }
++++  return result;
++++}
++++
++++/**
++++ * Generate a client-side UUID v4 fallback.
++++ */
++++export function generateUUID(): string {
++++  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
++++    return crypto.randomUUID();
++++  }
++++  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
++++    const r = (Math.random() * 16) | 0;
++++    const v = c === 'x' ? r : (r & 0x3) | 0x8;
++++    return v.toString(16);
++++  });
++++}
++++
++++/**
++++ * Reads custom packs saved in browser localStorage.
++++ */
++++export function getLocalCustomPacks(): CustomWordPack[] {
++++  if (typeof window === 'undefined' || !window.localStorage) {
++++    return [];
++++  }
++++  try {
++++    const raw = localStorage.getItem(LOCAL_STORAGE_CUSTOM_PACKS_KEY);
++++    if (!raw) return [];
++++    const parsed = JSON.parse(raw);
++++    return Array.isArray(parsed) ? parsed : [];
++++  } catch (error) {
++++    console.warn('[WordPackService] Failed to parse local custom packs:', error);
++++    return [];
++++  }
++++}
++++
++++/**
++++ * Saves or updates a custom pack in localStorage.
++++ */
++++export function saveLocalCustomPack(pack: CustomWordPack): void {
++++  if (typeof window === 'undefined' || !window.localStorage) {
++++    return;
++++  }
++++  try {
++++    const existing = getLocalCustomPacks();
++++    const index = existing.findIndex((p) => p.id === pack.id || p.shareCode === pack.shareCode);
++++    let updated: CustomWordPack[];
++++    if (index >= 0) {
++++      updated = [...existing];
++++      updated[index] = pack;
++++    } else {
++++      updated = [pack, ...existing];
++++    }
++++    localStorage.setItem(LOCAL_STORAGE_CUSTOM_PACKS_KEY, JSON.stringify(updated));
++++  } catch (error) {
++++    console.warn('[WordPackService] Failed to save local custom pack:', error);
++++  }
++++}
++++
++++/**
++++ * Deletes a custom pack from localStorage.
++++ */
++++export function deleteLocalCustomPack(packId: string): void {
++++  if (typeof window === 'undefined' || !window.localStorage) {
++++    return;
++++  }
++++  try {
++++    const existing = getLocalCustomPacks();
++++    const filtered = existing.filter((p) => p.id !== packId);
++++    localStorage.setItem(LOCAL_STORAGE_CUSTOM_PACKS_KEY, JSON.stringify(filtered));
++++  } catch (error) {
++++    console.warn('[WordPackService] Failed to delete local custom pack:', error);
++++  }
++++}
++++
++++/**
++++ * Fetches official word pairs from Supabase cloud database with seamless offline fallback.
++++ */
++++export async function getOfficialWordPairs(category?: string): Promise<WordPair[]> {
++++  try {
++++    if (isSupabaseConfigured()) {
++++      let query = supabase
++++        .from('word_packs')
++++        .select('id, category, civilian_word, undercover_word')
++++        .eq('is_official', true);
++++
++++      if (category && category !== 'Semua Kategori') {
++++        query = query.eq('category', category);
++++      }
++++
++++      const { data, error } = await query;
++++
++++      if (!error && data && data.length > 0) {
++++        return data.map((row) => ({
++++          id: row.id,
++++          category: row.category,
++++          civilianWord: row.civilian_word,
++++          undercoverWord: row.undercover_word,
++++        }));
++++      }
++++    }
++++  } catch (err) {
++++    console.warn('[WordPackService] Supabase query failed, falling back to local word bank:', err);
++++  }
++++
++++  // Seamless offline fallback
++++  return getWordPairsByCategory(category);
++++}
++++
++++/**
++++ * Fetches community word packs from Supabase and merges them with locally created packs.
++++ */
++++export async function getCommunityPacks(): Promise<CustomWordPack[]> {
++++  const localPacks = getLocalCustomPacks();
++++  const remotePacks: CustomWordPack[] = [];
++++
++++  try {
++++    if (isSupabaseConfigured()) {
++++      const { data, error } = await supabase
++++        .from('custom_packs')
++++        .select('*')
++++        .eq('is_public', true)
++++        .order('created_at', { ascending: false });
++++
++++      if (!error && data) {
++++        for (const row of data) {
++++          remotePacks.push({
++++            id: row.id,
++++            title: row.title,
++++            authorName: row.author_name || 'Komunitas',
++++            shareCode: row.share_code,
++++            wordPairs: Array.isArray(row.word_pairs) ? row.word_pairs : [],
++++            isPublic: row.is_public,
++++            createdAt: row.created_at,
++++          });
++++        }
++++      }
++++    }
++++  } catch (err) {
++++    console.warn('[WordPackService] Failed to fetch remote community packs, using local only:', err);
++++  }
++++
++++  // Deduplicate and merge (local packs take priority if share_code matches)
++++  const map = new Map<string, CustomWordPack>();
++++
++++  for (const pack of remotePacks) {
++++    if (pack.shareCode) {
++++      map.set(pack.shareCode.toUpperCase(), pack);
++++    }
++++  }
++++
++++  for (const pack of localPacks) {
++++    if (pack.shareCode) {
++++      map.set(pack.shareCode.toUpperCase(), pack);
++++    }
++++  }
++++
++++  return Array.from(map.values());
++++}
++++
++++/**
++++ * Fetches a custom pack by its unique share code (checks local storage first, then cloud).
++++ */
++++export async function getPackByShareCode(shareCode: string): Promise<CustomWordPack | null> {
++++  const cleanCode = (shareCode || '').trim().toUpperCase();
++++  if (!cleanCode) return null;
++++
++++  // 1. Check local storage first
++++  const localPacks = getLocalCustomPacks();
++++  const foundLocal = localPacks.find((p) => p.shareCode.toUpperCase() === cleanCode);
++++  if (foundLocal) {
++++    return foundLocal;
++++  }
++++
++++  // 2. Query Supabase
++++  try {
++++    if (isSupabaseConfigured()) {
++++      const { data, error } = await supabase
++++        .from('custom_packs')
++++        .select('*')
++++        .ilike('share_code', cleanCode)
++++        .maybeSingle();
++++
++++      if (!error && data) {
++++        const pack: CustomWordPack = {
++++          id: data.id,
++++          title: data.title,
++++          authorName: data.author_name || 'Anonim',
++++          shareCode: data.share_code,
++++          wordPairs: Array.isArray(data.word_pairs) ? data.word_pairs : [],
++++          isPublic: data.is_public,
++++          createdAt: data.created_at,
++++        };
++++        // Cache to local storage
++++        saveLocalCustomPack(pack);
++++        return pack;
++++      }
++++    }
++++  } catch (err) {
++++    console.warn(`[WordPackService] Failed to query share code "${cleanCode}" from Supabase:`, err);
++++  }
++++
++++  return null;
++++}
++++
++++/**
++++ * Creates and saves a new custom word pack.
++++ * Persists to localStorage immediately and syncs with Supabase if online.
++++ */
++++export async function saveCustomPack(
++++  title: string,
++++  authorName: string,
++++  pairs: WordPair[],
++++  isPublic: boolean = true
++++): Promise<{ success: boolean; pack: CustomWordPack; shareCode: string }> {
++++  const code = generateShareCode();
++++  const id = generateUUID();
++++
++++  const newPack: CustomWordPack = {
++++    id,
++++    title: title.trim() || 'Paket Kustom',
++++    authorName: authorName.trim() || 'Anonim',
++++    shareCode: code,
++++    wordPairs: pairs,
++++    isPublic,
++++    createdAt: new Date().toISOString(),
++++  };
++++
++++  // 1. Save to local storage for immediate offline reliability
++++  saveLocalCustomPack(newPack);
++++
++++  // 2. Upload to Supabase cloud if configured
++++  try {
++++    if (isSupabaseConfigured()) {
++++      const { error } = await supabase.from('custom_packs').insert({
++++        id: newPack.id,
++++        title: newPack.title,
++++        author_name: newPack.authorName,
++++        share_code: newPack.shareCode,
++++        word_pairs: newPack.wordPairs,
++++        is_public: newPack.isPublic,
++++        created_at: newPack.createdAt,
++++      });
++++
++++      if (error) {
++++        console.warn('[WordPackService] Supabase cloud sync failed, pack saved locally:', error.message);
++++      }
++++    }
++++  } catch (err) {
++++    console.warn('[WordPackService] Supabase upload failed, pack saved locally:', err);
++++  }
++++
++++  return {
++++    success: true,
++++    pack: newPack,
++++    shareCode: newPack.shareCode,
++++  };
++++}
++++
++++export const wordPackService = {
++++  getOfficialWordPairs,
++++  getCommunityPacks,
++++  getPackByShareCode,
++++  saveCustomPack,
++++  getLocalCustomPacks,
++++  saveLocalCustomPack,
++++  deleteLocalCustomPack,
++++  generateShareCode,
++++};
++++
++++export default wordPackService;
+++diff --git a/client/src/types/game.types.ts b/client/src/types/game.types.ts
+++index b000cc6..1001ea6 100644
+++--- a/client/src/types/game.types.ts
++++++ b/client/src/types/game.types.ts
+++@@ -64,5 +64,16 @@ export interface WordPack {
+++   description?: string;
+++   isOfficial: boolean;
+++   wordPairs: WordPair[];
+++   createdAt?: string;
+++ }
++++
++++export interface CustomWordPack {
++++  id: string;
++++  title: string;
++++  authorName: string;
++++  shareCode: string;
++++  wordPairs: WordPair[];
++++  isPublic?: boolean;
++++  createdAt?: string;
++++}
++++
+++diff --git a/server/src/types/game.types.ts b/server/src/types/game.types.ts
+++index b000cc6..1001ea6 100644
+++--- a/server/src/types/game.types.ts
++++++ b/server/src/types/game.types.ts
+++@@ -64,5 +64,16 @@ export interface WordPack {
+++   description?: string;
+++   isOfficial: boolean;
+++   wordPairs: WordPair[];
+++   createdAt?: string;
+++ }
++++
++++export interface CustomWordPack {
++++  id: string;
++++  title: string;
++++  authorName: string;
++++  shareCode: string;
++++  wordPairs: WordPair[];
++++  isPublic?: boolean;
++++  createdAt?: string;
++++}
++++
+++diff --git a/supabase/schema.sql b/supabase/schema.sql
+++new file mode 100644
+++index 0000000..1ec25ce
+++--- /dev/null
++++++ b/supabase/schema.sql
+++@@ -0,0 +1,152 @@
++++-- ==============================================================================
++++-- What's The Word - Supabase Database Schema & Seed Data
++++-- ==============================================================================
++++
++++-- Enable UUID extension if needed
++++CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
++++
++++-- ------------------------------------------------------------------------------
++++-- 1. Table: word_packs (Official & Curated Word Pairs)
++++-- ------------------------------------------------------------------------------
++++CREATE TABLE IF NOT EXISTS word_packs (
++++  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
++++  category TEXT NOT NULL,
++++  civilian_word TEXT NOT NULL,
++++  undercover_word TEXT NOT NULL,
++++  is_official BOOLEAN NOT NULL DEFAULT true,
++++  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
++++  CONSTRAINT uq_word_pack_entry UNIQUE (category, civilian_word, undercover_word)
++++);
++++
++++-- ------------------------------------------------------------------------------
++++-- 2. Table: custom_packs (Community-Created & Shareable Word Packs)
++++-- ------------------------------------------------------------------------------
++++CREATE TABLE IF NOT EXISTS custom_packs (
++++  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
++++  title TEXT NOT NULL,
++++  author_name TEXT NOT NULL,
++++  share_code TEXT UNIQUE NOT NULL,
++++  word_pairs JSONB NOT NULL DEFAULT '[]'::jsonb,
++++  is_public BOOLEAN NOT NULL DEFAULT true,
++++  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
++++);
++++
++++-- ------------------------------------------------------------------------------
++++-- 3. Indexes for High Performance Queries
++++-- ------------------------------------------------------------------------------
++++CREATE INDEX IF NOT EXISTS idx_word_packs_category ON word_packs(category);
++++CREATE INDEX IF NOT EXISTS idx_word_packs_is_official ON word_packs(is_official);
++++CREATE INDEX IF NOT EXISTS idx_custom_packs_share_code ON custom_packs(share_code);
++++CREATE INDEX IF NOT EXISTS idx_custom_packs_is_public ON custom_packs(is_public);
++++CREATE INDEX IF NOT EXISTS idx_custom_packs_created_at ON custom_packs(created_at DESC);
++++
++++-- ------------------------------------------------------------------------------
++++-- 4. Row Level Security (RLS) Policies
++++-- ------------------------------------------------------------------------------
++++ALTER TABLE word_packs ENABLE ROW LEVEL SECURITY;
++++ALTER TABLE custom_packs ENABLE ROW LEVEL SECURITY;
++++
++++-- Drop existing policies if script is re-run
++++DROP POLICY IF EXISTS "Allow public read on word_packs" ON word_packs;
++++DROP POLICY IF EXISTS "Allow public read on custom_packs" ON custom_packs;
++++DROP POLICY IF EXISTS "Allow public insert on custom_packs" ON custom_packs;
++++
++++-- word_packs: Public anonymous read access
++++CREATE POLICY "Allow public read on word_packs"
++++  ON word_packs
++++  FOR SELECT
++++  TO anon, authenticated
++++  USING (true);
++++
++++-- custom_packs: Public read access for all community packs & share-code lookups
++++CREATE POLICY "Allow public read on custom_packs"
++++  ON custom_packs
++++  FOR SELECT
++++  TO anon, authenticated
++++  USING (true);
++++
++++-- custom_packs: Public anonymous insert access so anyone can publish packs
++++CREATE POLICY "Allow public insert on custom_packs"
++++  ON custom_packs
++++  FOR INSERT
++++  TO anon, authenticated
++++  WITH CHECK (true);
++++
++++-- ------------------------------------------------------------------------------
++++-- 5. Indonesian Word Bank Seed Statements (Official Packs)
++++-- ------------------------------------------------------------------------------
++++INSERT INTO word_packs (category, civilian_word, undercover_word, is_official) VALUES
++++  -- Makanan & Minuman
++++  ('Makanan & Minuman', 'Kopi', 'Teh', true),
++++  ('Makanan & Minuman', 'Bakso', 'Mie Ayam', true),
++++  ('Makanan & Minuman', 'Rendang', 'Gulai', true),
++++  ('Makanan & Minuman', 'Martabak Manis', 'Terang Bulan', true),
++++  ('Makanan & Minuman', 'Nasi Padang', 'Nasi Uduk', true),
++++  ('Makanan & Minuman', 'Nasi Goreng', 'Mie Goreng', true),
++++  ('Makanan & Minuman', 'Es Kelapa', 'Es Cendol', true),
++++  ('Makanan & Minuman', 'Sate Ayam', 'Sate Kambing', true),
++++  ('Makanan & Minuman', 'Pempek', 'Siomay', true),
++++  ('Makanan & Minuman', 'Roti Bakar', 'Pisang Bakar', true),
++++  ('Makanan & Minuman', 'Soto Ayam', 'Rawon', true),
++++  ('Makanan & Minuman', 'Jus Alpukat', 'Jus Mangga', true),
++++  ('Makanan & Minuman', 'Kerupuk', 'Keripik', true),
++++  ('Makanan & Minuman', 'Sambal Terasi', 'Sambal Matah', true),
++++
++++  -- Hewan
++++  ('Hewan', 'Kucing', 'Harimau', true),
++++  ('Hewan', 'Bebek', 'Ayam', true),
++++  ('Hewan', 'Paus', 'Lumba-lumba', true),
++++  ('Hewan', 'Elang', 'Burung Hantu', true),
++++  ('Hewan', 'Kelinci', 'Hamster', true),
++++  ('Hewan', 'Singa', 'Macan Tutul', true),
++++  ('Hewan', 'Gajah', 'Badak', true),
++++  ('Hewan', 'Buaya', 'Alligator', true),
++++  ('Hewan', 'Kuda', 'Keledai', true),
++++  ('Hewan', 'Kupu-kupu', 'Capung', true),
++++  ('Hewan', 'Lebah', 'Tawon', true),
++++  ('Hewan', 'Hiu', 'Ikan Pari', true),
++++  ('Hewan', 'Beruang', 'Panda', true),
++++
++++  -- Benda & Gadget
++++  ('Benda & Gadget', 'Laptop', 'Komputer', true),
++++  ('Benda & Gadget', 'Smartphone', 'Tablet', true),
++++  ('Benda & Gadget', 'Headphone', 'Earphone', true),
++++  ('Benda & Gadget', 'Kipas Angin', 'AC', true),
++++  ('Benda & Gadget', 'Jam Tangan', 'Jam Dinding', true),
++++  ('Benda & Gadget', 'Televisi', 'Proyektor', true),
++++  ('Benda & Gadget', 'Sepeda', 'Motor', true),
++++  ('Benda & Gadget', 'Kacamata', 'Lensa Kontak', true),
++++  ('Benda & Gadget', 'Dompet', 'Tas', true),
++++  ('Benda & Gadget', 'Pulpen', 'Pensil', true),
++++  ('Benda & Gadget', 'Payung', 'Jas Hujan', true),
++++  ('Benda & Gadget', 'Senter', 'Lilin', true),
++++  ('Benda & Gadget', 'Pintu', 'Jendela', true),
++++
++++  -- Tempat & Hiburan
++++  ('Tempat & Hiburan', 'Bioskop', 'Teater', true),
++++  ('Tempat & Hiburan', 'Pantai', 'Danau', true),
++++  ('Tempat & Hiburan', 'Supermarket', 'Pasar Tradisional', true),
++++  ('Tempat & Hiburan', 'Museum', 'Perpustakaan', true),
++++  ('Tempat & Hiburan', 'Hotel', 'Villa', true),
++++  ('Tempat & Hiburan', 'Taman Hiburan', 'Kebun Binatang', true),
++++  ('Tempat & Hiburan', 'Restoran', 'Kafe', true),
++++  ('Tempat & Hiburan', 'Rumah Sakit', 'Puskesmas', true),
++++  ('Tempat & Hiburan', 'Bandara', 'Stasiun Kereta', true),
++++  ('Tempat & Hiburan', 'Kolam Renang', 'Waterpark', true),
++++  ('Tempat & Hiburan', 'Gunung', 'Bukit', true),
++++  ('Tempat & Hiburan', 'Mall', 'Pasar Malam', true),
++++
++++  -- Profesi
++++  ('Profesi', 'Dokter', 'Perawat', true),
++++  ('Profesi', 'Pilot', 'Masinis', true),
++++  ('Profesi', 'Polisi', 'Tentara', true),
++++  ('Profesi', 'Koki', 'Barista', true),
++++  ('Profesi', 'Guru', 'Dosen', true),
++++  ('Profesi', 'Pemadam Kebakaran', 'Tim SAR', true),
++++  ('Profesi', 'Arsitek', 'Insinyur', true),
++++  ('Profesi', 'Hakim', 'Pengacara', true),
++++  ('Profesi', 'Wartawan', 'Fotografer', true),
++++  ('Profesi', 'Pramugari', 'Resepsionis', true),
++++  ('Profesi', 'Sopir Bus', 'Supir Taksi', true),
++++  ('Profesi', 'Aktor', 'Penyanyi', true)
++++ON CONFLICT (category, civilian_word, undercover_word) DO NOTHING;
+++
+++```
++diff --git a/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-6-brief.md b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-6-brief.md
++new file mode 100644
++index 0000000..9062853
++--- /dev/null
+++++ b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-6-brief.md
++@@ -0,0 +1,50 @@
+++# Task 6 Brief: UI Design System & Atomic Game Components
+++
+++## Goal
+++Build reusable UI components adhering strictly to the Sleek Dark Cyber aesthetic (#080c16, #06b6d4, #f43f5e, #a855f7) and spring physics interactions in `client/src/components/`:
+++
+++1. `client/src/components/common/Header.tsx`:
+++   - Logo title "WHAT'S THE WORD" with glowing cyan/purple subtext.
+++   - Global sound mute toggle button (triggers `toggleMute()` from `useGameSound`).
+++   - Clean back/exit button if in room/game.
+++   - Fixed or sticky top bar with safe padding.
+++
+++2. `client/src/components/common/Button.tsx`:
+++   - Variants: `primary` (Cyan glow), `danger` (Crimson neon), `accent` (Violet electric), `secondary` (Glass surface), `outline`, `ghost`.
+++   - Tactile active push: `active:scale-[0.97]` and optional button tap sound effect on click.
+++   - Disabled and loading state with spinner.
+++
+++3. `client/src/components/common/Card.tsx`:
+++   - Dark glass surface (`bg-slate-900/80`, `backdrop-blur-md`, `border border-white/10`, `shadow-xl`).
+++   - Optional glow borders (`cyan`, `crimson`, `violet`, `amber`).
+++
+++4. `client/src/components/common/Badge.tsx`:
+++   - Role badges (`CIVILIAN` / Warga: cyan; `UNDERCOVER` / Impostor: crimson; `MR_WHITE` / Buta Kata: violet).
+++   - Status badges: Active, Speaking (animated cyan pulse ring), Eliminated (dimmed skull/cross).
+++
+++5. `client/src/components/common/Modal.tsx`:
+++   - Motion animated dialog overlay with backdrop blur (`backdrop-blur-md bg-black/70`).
+++   - Clean slide-in / pop spring animation (`scale`, `opacity`).
+++   - Close on escape or outside tap.
+++
+++6. `client/src/components/game/AvatarPicker.tsx`:
+++   - 12 unique preset Cyber Agent avatars / emojis (e.g. 🕵️ Cyber Agent, 🤖 Cyborg, 🦊 Shadow Fox, 🦅 Neon Eagle, 🐺 Cyber Wolf, 🐱 Stealth Cat, 🐉 Holo Dragon, ⚡ Phantom, 🔮 Oracle, 🕶️ Specter, 🎭 Infiltrator, 👑 Commander).
+++   - Interactive selection grid with active glow ring and nickname input field.
+++
+++7. `client/src/components/game/SecretCard.tsx`:
+++   - Touch & hold / mouse press & hold interaction target: *"Tahan untuk Intip Kata"* (Press & Hold).
+++   - Spring physics reveal: blur mask clears on hold, reveals player role badge and secret word.
+++   - On release: immediately re-masks the word to protect privacy from neighboring players.
+++   - Triggers suspense audio (`playRoleReveal()`) on first reveal.
+++
+++8. `client/src/components/game/CountdownTimer.tsx`:
+++   - High-contrast animated circular / linear countdown progress.
+++   - Color transitions: $ge 15$s Cyan (`#06b6d4`), $6-14$s Amber (`#f59e0b`), $le 5$s Crimson (`#f43f5e`).
+++   - Synchronized audio ticking (`playTick()` each second, `playUrgentTick()` when $le 5$s).
+++
+++9. Verification:
+++   - Typecheck and build verification in `client/`.
+++
+++## Report Contract
+++Write report to: `C:\Users\ASUS\Documents\ALIFKA\PROJECT\whatstheword\.superpowers\sdd\2026-09-02-whatstheword-implementation\task-6-report.md`
+++Return: status (DONE / BLOCKED), commits, one-line test summary.
++diff --git a/client/src/components/common/Badge.tsx b/client/src/components/common/Badge.tsx
++new file mode 100644
++index 0000000..5d28694
++--- /dev/null
+++++ b/client/src/components/common/Badge.tsx
++@@ -0,0 +1,200 @@
+++import React from 'react';
+++import { PlayerRole } from '../../types/game.types';
+++import { cn } from '../../utils/cn';
+++import { Shield, EyeOff, HelpCircle, Mic, Skull, CheckCircle2, Crown, Wifi } from 'lucide-react';
+++
+++export type BadgeVariant =
+++  | 'cyan'
+++  | 'crimson'
+++  | 'violet'
+++  | 'amber'
+++  | 'emerald'
+++  | 'slate'
+++  | 'outline';
+++
+++export type BadgeSize = 'sm' | 'md' | 'lg';
+++
+++export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
+++  variant?: BadgeVariant;
+++  size?: BadgeSize;
+++  pulse?: boolean;
+++  icon?: React.ReactNode;
+++}
+++
+++const variantStyles: Record<BadgeVariant, string> = {
+++  cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 shadow-[0_0_12px_-3px_rgba(6,182,212,0.3)]',
+++  crimson: 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-[0_0_12px_-3px_rgba(244,63,94,0.3)]',
+++  violet: 'bg-purple-500/15 text-purple-300 border-purple-500/30 shadow-[0_0_12px_-3px_rgba(168,85,247,0.3)]',
+++  amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[0_0_12px_-3px_rgba(245,158,11,0.3)]',
+++  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_12px_-3px_rgba(16,185,129,0.3)]',
+++  slate: 'bg-slate-800/60 text-slate-400 border-white/10',
+++  outline: 'bg-transparent text-slate-300 border-white/20',
+++};
+++
+++const sizeStyles: Record<BadgeSize, string> = {
+++  sm: 'text-[10px] px-2 py-0.5 rounded-md gap-1 font-medium',
+++  md: 'text-xs px-2.5 py-1 rounded-lg gap-1.5 font-semibold',
+++  lg: 'text-sm px-3.5 py-1.5 rounded-xl gap-2 font-bold tracking-wide',
+++};
+++
+++export const Badge: React.FC<BadgeProps> = ({
+++  className,
+++  variant = 'cyan',
+++  size = 'md',
+++  pulse = false,
+++  icon,
+++  children,
+++  ...props
+++}) => {
+++  return (
+++    <span
+++      className={cn(
+++        'inline-flex items-center select-none border backdrop-blur-sm transition-all',
+++        variantStyles[variant],
+++        sizeStyles[size],
+++        className
+++      )}
+++      {...props}
+++    >
+++      {pulse && (
+++        <span className="relative flex h-2 w-2 shrink-0">
+++          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
+++          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
+++        </span>
+++      )}
+++      {icon && <span className="inline-flex shrink-0 items-center justify-center">{icon}</span>}
+++      <span>{children}</span>
+++    </span>
+++  );
+++};
+++
+++export interface RoleBadgeProps {
+++  role: PlayerRole;
+++  size?: BadgeSize;
+++  showIcon?: boolean;
+++  className?: string;
+++  indonesian?: boolean;
+++}
+++
+++export const RoleBadge: React.FC<RoleBadgeProps> = ({
+++  role,
+++  size = 'md',
+++  showIcon = true,
+++  className,
+++  indonesian = true,
+++}) => {
+++  switch (role) {
+++    case 'CIVILIAN':
+++      return (
+++        <Badge
+++          variant="cyan"
+++          size={size}
+++          icon={showIcon ? <Shield className="w-3.5 h-3.5" /> : undefined}
+++          className={className}
+++        >
+++          {indonesian ? 'Warga (Civilian)' : 'Civilian'}
+++        </Badge>
+++      );
+++    case 'UNDERCOVER':
+++      return (
+++        <Badge
+++          variant="crimson"
+++          size={size}
+++          icon={showIcon ? <EyeOff className="w-3.5 h-3.5" /> : undefined}
+++          className={className}
+++        >
+++          {indonesian ? 'Impostor (Undercover)' : 'Undercover'}
+++        </Badge>
+++      );
+++    case 'MR_WHITE':
+++      return (
+++        <Badge
+++          variant="violet"
+++          size={size}
+++          icon={showIcon ? <HelpCircle className="w-3.5 h-3.5" /> : undefined}
+++          className={className}
+++        >
+++          {indonesian ? 'Buta Kata (Mr. White)' : 'Mr. White'}
+++        </Badge>
+++      );
+++    default:
+++      return null;
+++  }
+++};
+++
+++export type PlayerStatus = 'active' | 'speaking' | 'eliminated' | 'voted' | 'host';
+++
+++export interface StatusBadgeProps {
+++  status: PlayerStatus;
+++  size?: BadgeSize;
+++  className?: string;
+++}
+++
+++export const StatusBadge: React.FC<StatusBadgeProps> = ({
+++  status,
+++  size = 'md',
+++  className,
+++}) => {
+++  switch (status) {
+++    case 'speaking':
+++      return (
+++        <Badge
+++          variant="cyan"
+++          size={size}
+++          pulse
+++          icon={<Mic className="w-3 h-3 text-cyan-300 animate-pulse" />}
+++          className={cn('border-cyan-400 animate-pulse', className)}
+++        >
+++          Bicara
+++        </Badge>
+++      );
+++    case 'active':
+++      return (
+++        <Badge
+++          variant="emerald"
+++          size={size}
+++          icon={<Wifi className="w-3 h-3 text-emerald-400" />}
+++          className={className}
+++        >
+++          Aktif
+++        </Badge>
+++      );
+++    case 'eliminated':
+++      return (
+++        <Badge
+++          variant="slate"
+++          size={size}
+++          icon={<Skull className="w-3 h-3 text-rose-400" />}
+++          className={cn('line-through opacity-70 border-rose-900/40 text-rose-400', className)}
+++        >
+++          Tereliminasi
+++        </Badge>
+++      );
+++    case 'voted':
+++      return (
+++        <Badge
+++          variant="amber"
+++          size={size}
+++          icon={<CheckCircle2 className="w-3 h-3 text-amber-400" />}
+++          className={className}
+++        >
+++          Memilih
+++        </Badge>
+++      );
+++    case 'host':
+++      return (
+++        <Badge
+++          variant="amber"
+++          size={size}
+++          icon={<Crown className="w-3 h-3 text-amber-400" />}
+++          className={className}
+++        >
+++          Host
+++        </Badge>
+++      );
+++    default:
+++      return null;
+++  }
+++};
+++
+++export default Badge;
++diff --git a/client/src/components/common/Button.tsx b/client/src/components/common/Button.tsx
++new file mode 100644
++index 0000000..4bd0032
++--- /dev/null
+++++ b/client/src/components/common/Button.tsx
++@@ -0,0 +1,114 @@
+++import React, { forwardRef } from 'react';
+++import { Loader2 } from 'lucide-react';
+++import { cn } from '../../utils/cn';
+++import { useGameSound } from '../../hooks/useGameSound';
+++
+++export type ButtonVariant = 'primary' | 'danger' | 'accent' | 'secondary' | 'outline' | 'ghost';
+++export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon';
+++
+++export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
+++  variant?: ButtonVariant;
+++  size?: ButtonSize;
+++  isLoading?: boolean;
+++  loadingText?: string;
+++  leftIcon?: React.ReactNode;
+++  rightIcon?: React.ReactNode;
+++  fullWidth?: boolean;
+++  playSoundOnTap?: boolean;
+++}
+++
+++const variantStyles: Record<ButtonVariant, string> = {
+++  primary:
+++    'bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-bold shadow-lg shadow-cyan-500/25 border border-cyan-300/40 hover:shadow-cyan-400/40',
+++  danger:
+++    'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold shadow-lg shadow-rose-600/30 border border-rose-400/40 hover:shadow-rose-500/50',
+++  accent:
+++    'bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-500 hover:to-violet-400 text-white font-bold shadow-lg shadow-purple-600/30 border border-purple-400/40 hover:shadow-purple-500/50',
+++  secondary:
+++    'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-white/10 hover:border-white/20 backdrop-blur-sm shadow-md',
+++  outline:
+++    'bg-transparent border-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 active:bg-cyan-500/20 shadow-sm',
+++  ghost:
+++    'bg-transparent text-slate-400 hover:text-slate-100 hover:bg-white/5 active:bg-white/10 border border-transparent',
+++};
+++
+++const sizeStyles: Record<ButtonSize, string> = {
+++  xs: 'px-2.5 py-1 text-xs rounded-lg gap-1.5',
+++  sm: 'px-3 py-1.5 text-xs sm:text-sm rounded-xl gap-2',
+++  md: 'px-4 py-2 text-sm sm:text-base rounded-xl gap-2',
+++  lg: 'px-6 py-3 text-base sm:text-lg rounded-2xl gap-2.5 font-semibold',
+++  xl: 'px-8 py-4 text-lg sm:text-xl rounded-2xl gap-3 font-bold tracking-wide',
+++  icon: 'p-2.5 rounded-xl aspect-square flex items-center justify-center',
+++};
+++
+++export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
+++  (
+++    {
+++      className,
+++      variant = 'primary',
+++      size = 'md',
+++      isLoading = false,
+++      loadingText,
+++      leftIcon,
+++      rightIcon,
+++      fullWidth = false,
+++      playSoundOnTap = true,
+++      disabled,
+++      children,
+++      onClick,
+++      ...props
+++    },
+++    ref
+++  ) => {
+++    const { playButtonTap } = useGameSound();
+++    const isDisabled = disabled || isLoading;
+++
+++    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
+++      if (isDisabled) {
+++        e.preventDefault();
+++        return;
+++      }
+++      if (playSoundOnTap) {
+++        try {
+++          playButtonTap();
+++        } catch {
+++          // ignore audio failure
+++        }
+++      }
+++      onClick?.(e);
+++    };
+++
+++    return (
+++      <button
+++        ref={ref}
+++        disabled={isDisabled}
+++        onClick={handleClick}
+++        className={cn(
+++          'relative inline-flex items-center justify-center select-none font-sans transition-all duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
+++          'active:scale-[0.97] hover:brightness-110 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 disabled:hover:brightness-100',
+++          variantStyles[variant],
+++          sizeStyles[size],
+++          fullWidth && 'w-full',
+++          className
+++        )}
+++        {...props}
+++      >
+++        {isLoading ? (
+++          <>
+++            <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
+++            {loadingText ? <span>{loadingText}</span> : children ? <span>{children}</span> : null}
+++          </>
+++        ) : (
+++          <>
+++            {leftIcon && <span className="inline-flex shrink-0 items-center justify-center">{leftIcon}</span>}
+++            {children && <span>{children}</span>}
+++            {rightIcon && <span className="inline-flex shrink-0 items-center justify-center">{rightIcon}</span>}
+++          </>
+++        )}
+++      </button>
+++    );
+++  }
+++);
+++
+++Button.displayName = 'Button';
+++export default Button;
++diff --git a/client/src/components/common/Card.tsx b/client/src/components/common/Card.tsx
++new file mode 100644
++index 0000000..7b4db2e
++--- /dev/null
+++++ b/client/src/components/common/Card.tsx
++@@ -0,0 +1,102 @@
+++import React, { forwardRef } from 'react';
+++import { cn } from '../../utils/cn';
+++
+++export type CardGlow = 'none' | 'cyan' | 'crimson' | 'violet' | 'amber';
+++export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
+++
+++export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
+++  glow?: CardGlow;
+++  padding?: CardPadding;
+++  hoverable?: boolean;
+++  interactive?: boolean;
+++}
+++
+++const glowStyles: Record<CardGlow, string> = {
+++  none: 'border-white/10 hover:border-white/20',
+++  cyan: 'border-cyan-500/30 shadow-[0_0_25px_-5px_rgba(6,182,212,0.25)] hover:border-cyan-400/60 hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.4)]',
+++  crimson: 'border-rose-500/30 shadow-[0_0_25px_-5px_rgba(244,63,94,0.25)] hover:border-rose-400/60 hover:shadow-[0_0_30px_-5px_rgba(244,63,94,0.4)]',
+++  violet: 'border-purple-500/30 shadow-[0_0_25px_-5px_rgba(168,85,247,0.25)] hover:border-purple-400/60 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)]',
+++  amber: 'border-amber-500/30 shadow-[0_0_25px_-5px_rgba(245,158,11,0.25)] hover:border-amber-400/60 hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.4)]',
+++};
+++
+++const paddingStyles: Record<CardPadding, string> = {
+++  none: 'p-0',
+++  sm: 'p-3 sm:p-4',
+++  md: 'p-5 sm:p-6',
+++  lg: 'p-6 sm:p-8',
+++};
+++
+++export const Card = forwardRef<HTMLDivElement, CardProps>(
+++  (
+++    {
+++      className,
+++      glow = 'none',
+++      padding = 'md',
+++      hoverable = false,
+++      interactive = false,
+++      children,
+++      ...props
+++    },
+++    ref
+++  ) => {
+++    return (
+++      <div
+++        ref={ref}
+++        className={cn(
+++          'relative rounded-2xl bg-slate-900/80 backdrop-blur-md border shadow-xl transition-all duration-200 text-slate-100 overflow-hidden',
+++          glowStyles[glow],
+++          paddingStyles[padding],
+++          hoverable && 'hover:scale-[1.01] hover:bg-slate-900/90',
+++          interactive && 'cursor-pointer active:scale-[0.99]',
+++          className
+++        )}
+++        {...props}
+++      >
+++        {children}
+++      </div>
+++    );
+++  }
+++);
+++
+++Card.displayName = 'Card';
+++
+++export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
+++  ({ className, ...props }, ref) => (
+++    <div ref={ref} className={cn('flex flex-col space-y-1.5 pb-4', className)} {...props} />
+++  )
+++);
+++CardHeader.displayName = 'CardHeader';
+++
+++export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
+++  ({ className, ...props }, ref) => (
+++    <h3
+++      ref={ref}
+++      className={cn('text-lg sm:text-xl font-bold tracking-tight text-slate-100 font-display', className)}
+++      {...props}
+++    />
+++  )
+++);
+++CardTitle.displayName = 'CardTitle';
+++
+++export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
+++  ({ className, ...props }, ref) => (
+++    <p ref={ref} className={cn('text-xs sm:text-sm text-slate-400 font-sans', className)} {...props} />
+++  )
+++);
+++CardDescription.displayName = 'CardDescription';
+++
+++export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
+++  ({ className, ...props }, ref) => (
+++    <div ref={ref} className={cn('pt-0', className)} {...props} />
+++  )
+++);
+++CardContent.displayName = 'CardContent';
+++
+++export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
+++  ({ className, ...props }, ref) => (
+++    <div ref={ref} className={cn('flex items-center pt-4 border-t border-white/5', className)} {...props} />
+++  )
+++);
+++CardFooter.displayName = 'CardFooter';
+++
+++export default Card;
++diff --git a/client/src/components/common/Header.tsx b/client/src/components/common/Header.tsx
++new file mode 100644
++index 0000000..942a5e2
++--- /dev/null
+++++ b/client/src/components/common/Header.tsx
++@@ -0,0 +1,129 @@
+++import React, { useState } from 'react';
+++import { Volume2, VolumeX, ArrowLeft, Copy, Check, Sparkles } from 'lucide-react';
+++import { useGameSound } from '../../hooks/useGameSound';
+++import { Button } from './Button';
+++import { cn } from '../../utils/cn';
+++
+++export interface HeaderProps {
+++  title?: string;
+++  subtitle?: string;
+++  roomCode?: string;
+++  onBack?: () => void;
+++  backLabel?: string;
+++  showBack?: boolean;
+++  rightElement?: React.ReactNode;
+++  sticky?: boolean;
+++  className?: string;
+++}
+++
+++export const Header: React.FC<HeaderProps> = ({
+++  title = "WHAT'S THE WORD",
+++  subtitle = 'CYBER DECEPTION',
+++  roomCode,
+++  onBack,
+++  backLabel = 'Keluar',
+++  showBack = false,
+++  rightElement,
+++  sticky = true,
+++  className,
+++}) => {
+++  const { isMuted, toggleMute } = useGameSound();
+++  const [copied, setCopied] = useState(false);
+++
+++  const handleCopyRoomCode = async () => {
+++    if (!roomCode) return;
+++    try {
+++      await navigator.clipboard.writeText(roomCode);
+++      setCopied(true);
+++      setTimeout(() => setCopied(false), 2000);
+++    } catch {
+++      // ignore clipboard error
+++    }
+++  };
+++
+++  return (
+++    <header
+++      className={cn(
+++        'w-full z-40 px-4 py-3 bg-slate-950/85 backdrop-blur-md border-b border-white/10 transition-all duration-200',
+++        sticky && 'sticky top-0',
+++        className
+++      )}
+++    >
+++      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
+++        {/* Left Section: Back button or Brand */}
+++        <div className="flex items-center gap-3">
+++          {(showBack || onBack) && (
+++            <Button
+++              variant="secondary"
+++              size="sm"
+++              onClick={onBack}
+++              leftIcon={<ArrowLeft className="w-4 h-4 text-cyan-400" />}
+++              className="text-xs sm:text-sm font-medium hover:border-cyan-500/40"
+++              aria-label={backLabel}
+++            >
+++              <span className="hidden sm:inline">{backLabel}</span>
+++            </Button>
+++          )}
+++
+++          <div className="flex items-center gap-2.5">
+++            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)]">
+++              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
+++              <div className="absolute -inset-0.5 rounded-xl bg-cyan-500/20 blur-sm -z-10" />
+++            </div>
+++
+++            <div className="flex flex-col">
+++              <span className="text-base sm:text-lg font-black tracking-wider bg-gradient-to-r from-cyan-400 via-violet-400 to-rose-400 bg-clip-text text-transparent font-display leading-tight">
+++                {title}
+++              </span>
+++              <span className="text-[10px] sm:text-xs font-mono tracking-widest text-cyan-400/80 uppercase font-semibold">
+++                {subtitle}
+++              </span>
+++            </div>
+++          </div>
+++        </div>
+++
+++        {/* Center: Room Code Badge (if active) */}
+++        {roomCode && (
+++          <button
+++            onClick={handleCopyRoomCode}
+++            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/90 border border-cyan-500/40 hover:border-cyan-400 hover:bg-slate-800/90 transition-all shadow-sm group cursor-pointer text-left"
+++            title="Klik untuk salin kode room"
+++          >
+++            <span className="text-[10px] uppercase font-mono text-slate-400">ROOM:</span>
+++            <span className="text-xs sm:text-sm font-mono font-bold text-cyan-300 tracking-wider">
+++              {roomCode}
+++            </span>
+++            {copied ? (
+++              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-0.5" />
+++            ) : (
+++              <Copy className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0 ml-0.5 transition-colors" />
+++            )}
+++          </button>
+++        )}
+++
+++        {/* Right Section: Sound Mute Toggle & Custom Actions */}
+++        <div className="flex items-center gap-2">
+++          {rightElement}
+++
+++          <Button
+++            variant="ghost"
+++            size="icon"
+++            onClick={toggleMute}
+++            className={cn(
+++              'border rounded-xl transition-all',
+++              isMuted
+++                ? 'border-rose-500/30 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20'
+++                : 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 shadow-[0_0_10px_-2px_rgba(6,182,212,0.3)]'
+++            )}
+++            title={isMuted ? 'Nyalakan Suara (Unmute)' : 'Matikan Suara (Mute)'}
+++            aria-label={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
+++          >
+++            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
+++          </Button>
+++        </div>
+++      </div>
+++    </header>
+++  );
+++};
+++
+++export default Header;
++diff --git a/client/src/components/common/Modal.tsx b/client/src/components/common/Modal.tsx
++new file mode 100644
++index 0000000..f88e034
++--- /dev/null
+++++ b/client/src/components/common/Modal.tsx
++@@ -0,0 +1,148 @@
+++import React, { useEffect, useCallback } from 'react';
+++import { motion, AnimatePresence } from 'motion/react';
+++import { X } from 'lucide-react';
+++import { cn } from '../../utils/cn';
+++import { Button } from './Button';
+++
+++export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
+++
+++export interface ModalProps {
+++  isOpen: boolean;
+++  onClose: () => void;
+++  title?: React.ReactNode;
+++  subtitle?: React.ReactNode;
+++  children: React.ReactNode;
+++  footer?: React.ReactNode;
+++  size?: ModalSize;
+++  closeOnOutsideClick?: boolean;
+++  closeOnEscape?: boolean;
+++  showCloseButton?: boolean;
+++  className?: string;
+++}
+++
+++const sizeStyles: Record<ModalSize, string> = {
+++  sm: 'max-w-sm',
+++  md: 'max-w-md',
+++  lg: 'max-w-lg',
+++  xl: 'max-w-2xl',
+++  full: 'max-w-4xl w-full',
+++};
+++
+++export const Modal: React.FC<ModalProps> = ({
+++  isOpen,
+++  onClose,
+++  title,
+++  subtitle,
+++  children,
+++  footer,
+++  size = 'md',
+++  closeOnOutsideClick = true,
+++  closeOnEscape = true,
+++  showCloseButton = true,
+++  className,
+++}) => {
+++  const handleKeyDown = useCallback(
+++    (e: KeyboardEvent) => {
+++      if (closeOnEscape && e.key === 'Escape') {
+++        onClose();
+++      }
+++    },
+++    [closeOnEscape, onClose]
+++  );
+++
+++  useEffect(() => {
+++    if (isOpen) {
+++      document.addEventListener('keydown', handleKeyDown);
+++      document.body.style.overflow = 'hidden';
+++    } else {
+++      document.body.style.overflow = '';
+++    }
+++    return () => {
+++      document.removeEventListener('keydown', handleKeyDown);
+++      document.body.style.overflow = '';
+++    };
+++  }, [isOpen, handleKeyDown]);
+++
+++  return (
+++    <AnimatePresence>
+++      {isOpen && (
+++        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
+++          {/* Backdrop overlay */}
+++          <motion.div
+++            initial={{ opacity: 0 }}
+++            animate={{ opacity: 1 }}
+++            exit={{ opacity: 0 }}
+++            transition={{ duration: 0.2 }}
+++            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md -z-10"
+++            onClick={() => closeOnOutsideClick && onClose()}
+++            aria-hidden="true"
+++          />
+++
+++          {/* Modal Dialog Content */}
+++          <motion.div
+++            role="dialog"
+++            aria-modal="true"
+++            initial={{ opacity: 0, scale: 0.92, y: 12 }}
+++            animate={{ opacity: 1, scale: 1, y: 0 }}
+++            exit={{ opacity: 0, scale: 0.95, y: 8 }}
+++            transition={{
+++              type: 'spring',
+++              damping: 25,
+++              stiffness: 320,
+++            }}
+++            className={cn(
+++              'relative w-full rounded-2xl bg-slate-900/95 border border-white/10 shadow-2xl shadow-cyan-950/40 text-slate-100 flex flex-col max-h-[90dvh] overflow-hidden my-auto',
+++              sizeStyles[size],
+++              className
+++            )}
+++            onClick={(e) => e.stopPropagation()}
+++          >
+++            {/* Header */}
+++            {(title || showCloseButton) && (
+++              <div className="flex items-start justify-between px-6 py-4 border-b border-white/10 shrink-0 gap-4">
+++                <div className="flex flex-col space-y-1">
+++                  {typeof title === 'string' ? (
+++                    <h2 className="text-lg sm:text-xl font-bold font-display text-slate-100">
+++                      {title}
+++                    </h2>
+++                  ) : (
+++                    title
+++                  )}
+++                  {subtitle && (
+++                    <p className="text-xs sm:text-sm text-slate-400 font-sans">{subtitle}</p>
+++                  )}
+++                </div>
+++
+++                {showCloseButton && (
+++                  <Button
+++                    variant="ghost"
+++                    size="icon"
+++                    onClick={onClose}
+++                    className="text-slate-400 hover:text-slate-100 -mr-2 -mt-1 h-8 w-8 rounded-lg"
+++                    aria-label="Tutup Dialog"
+++                  >
+++                    <X className="w-4 h-4" />
+++                  </Button>
+++                )}
+++              </div>
+++            )}
+++
+++            {/* Scrollable Body */}
+++            <div className="px-6 py-5 overflow-y-auto flex-1 text-slate-200 text-sm leading-relaxed">
+++              {children}
+++            </div>
+++
+++            {/* Footer */}
+++            {footer && (
+++              <div className="px-6 py-4 bg-slate-950/40 border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
+++                {footer}
+++              </div>
+++            )}
+++          </motion.div>
+++        </div>
+++      )}
+++    </AnimatePresence>
+++  );
+++};
+++
+++export default Modal;
++diff --git a/client/src/components/common/index.ts b/client/src/components/common/index.ts
++new file mode 100644
++index 0000000..ca86f4e
++--- /dev/null
+++++ b/client/src/components/common/index.ts
++@@ -0,0 +1,5 @@
+++export * from './Header';
+++export * from './Button';
+++export * from './Card';
+++export * from './Badge';
+++export * from './Modal';
++diff --git a/client/src/components/game/AvatarPicker.tsx b/client/src/components/game/AvatarPicker.tsx
++new file mode 100644
++index 0000000..6176935
++--- /dev/null
+++++ b/client/src/components/game/AvatarPicker.tsx
++@@ -0,0 +1,183 @@
+++import React from 'react';
+++import { motion } from 'motion/react';
+++import { Dices, Check, User } from 'lucide-react';
+++import { cn } from '../../utils/cn';
+++import { useGameSound } from '../../hooks/useGameSound';
+++
+++export interface AvatarOption {
+++  id: string;
+++  emoji: string;
+++  name: string;
+++  description: string;
+++}
+++
+++export const PRESET_AVATARS: AvatarOption[] = [
+++  { id: 'cyber-agent', emoji: '🕵️', name: 'Cyber Agent', description: 'Master investigator' },
+++  { id: 'cyborg', emoji: '🤖', name: 'Cyborg', description: 'Synthetic intellect' },
+++  { id: 'shadow-fox', emoji: '🦊', name: 'Shadow Fox', description: 'Stealth strategist' },
+++  { id: 'neon-eagle', emoji: '🦅', name: 'Neon Eagle', description: 'High-altitude scout' },
+++  { id: 'cyber-wolf', emoji: '🐺', name: 'Cyber Wolf', description: 'Pack tracker' },
+++  { id: 'stealth-cat', emoji: '🐱', name: 'Stealth Cat', description: 'Silent intruder' },
+++  { id: 'holo-dragon', emoji: '🐉', name: 'Holo Dragon', description: 'Mythic firewall' },
+++  { id: 'phantom', emoji: '⚡', name: 'Phantom', description: 'High-speed spark' },
+++  { id: 'oracle', emoji: '🔮', name: 'Oracle', description: 'Predictive matrix' },
+++  { id: 'specter', emoji: '🕶️', name: 'Specter', description: 'Hidden operative' },
+++  { id: 'infiltrator', emoji: '🎭', name: 'Infiltrator', description: 'Deception expert' },
+++  { id: 'commander', emoji: '👑', name: 'Commander', description: 'Network leader' },
+++];
+++
+++const RANDOM_NICKNAMES = [
+++  'NeonGhost',
+++  'CyberViper',
+++  'PhantomX',
+++  'EchoNine',
+++  'CipherZero',
+++  'QuantumFox',
+++  'ShadowHawk',
+++  'ByteHunter',
+++  'NovaAgent',
+++  'VortexPulse',
+++  'AeroStrike',
+++  'SilentGlitch',
+++];
+++
+++export interface AvatarPickerProps {
+++  selectedAvatar: string;
+++  onSelectAvatar: (avatar: string) => void;
+++  nickname?: string;
+++  onNicknameChange?: (nickname: string) => void;
+++  showNicknameInput?: boolean;
+++  disabled?: boolean;
+++  className?: string;
+++}
+++
+++export const AvatarPicker: React.FC<AvatarPickerProps> = ({
+++  selectedAvatar,
+++  onSelectAvatar,
+++  nickname = '',
+++  onNicknameChange,
+++  showNicknameInput = true,
+++  disabled = false,
+++  className,
+++}) => {
+++  const { playButtonTap } = useGameSound();
+++
+++  const handleAvatarClick = (avatarEmoji: string) => {
+++    if (disabled) return;
+++    try {
+++      playButtonTap();
+++    } catch {
+++      // ignore sound error
+++    }
+++    onSelectAvatar(avatarEmoji);
+++  };
+++
+++  const handleRandomizeNickname = () => {
+++    if (disabled || !onNicknameChange) return;
+++    try {
+++      playButtonTap();
+++    } catch {
+++      // ignore sound error
+++    }
+++    const randomName = RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)];
+++    const randomSuffix = Math.floor(10 + Math.random() * 90);
+++    onNicknameChange(`${randomName}_${randomSuffix}`);
+++  };
+++
+++  return (
+++    <div className={cn('space-y-5', className)}>
+++      {/* Nickname Input Section */}
+++      {showNicknameInput && onNicknameChange && (
+++        <div className="space-y-2">
+++          <label className="flex items-center justify-between text-xs font-semibold text-slate-300">
+++            <span className="flex items-center gap-1.5 font-sans">
+++              <User className="w-3.5 h-3.5 text-cyan-400" />
+++              Nama Agen / Nickname
+++            </span>
+++            <span className="text-[10px] font-mono text-slate-500">
+++              {nickname.length}/15 Karakter
+++            </span>
+++          </label>
+++
+++          <div className="relative flex items-center">
+++            <input
+++              type="text"
+++              value={nickname}
+++              onChange={(e) => onNicknameChange(e.target.value.slice(0, 15))}
+++              placeholder="Masukkan codename agen..."
+++              disabled={disabled}
+++              maxLength={15}
+++              className="w-full pl-4 pr-11 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-sm font-medium transition-all"
+++            />
+++            <button
+++              type="button"
+++              onClick={handleRandomizeNickname}
+++              disabled={disabled}
+++              className="absolute right-2 p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/5 active:scale-95 transition-all"
+++              title="Acak Codename"
+++              aria-label="Acak Codename"
+++            >
+++              <Dices className="w-4 h-4" />
+++            </button>
+++          </div>
+++        </div>
+++      )}
+++
+++      {/* Avatar Grid Selection */}
+++      <div className="space-y-2">
+++        <label className="block text-xs font-semibold text-slate-300 font-sans">
+++          Pilih Avatar Agen ({PRESET_AVATARS.length} Karakter)
+++        </label>
+++
+++        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
+++          {PRESET_AVATARS.map((item) => {
+++            const isSelected = selectedAvatar === item.emoji || selectedAvatar === item.id;
+++
+++            return (
+++              <motion.button
+++                key={item.id}
+++                type="button"
+++                whileHover={{ scale: disabled ? 1 : 1.05 }}
+++                whileTap={{ scale: disabled ? 1 : 0.95 }}
+++                onClick={() => handleAvatarClick(item.emoji)}
+++                disabled={disabled}
+++                className={cn(
+++                  'relative group flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all duration-150 select-none text-center',
+++                  isSelected
+++                    ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_-3px_rgba(6,182,212,0.45)] ring-1 ring-cyan-400'
+++                    : 'bg-slate-900/70 border-white/10 hover:border-white/20 hover:bg-slate-800/80',
+++                  disabled && 'opacity-50 cursor-not-allowed'
+++                )}
+++                title={`${item.name} - ${item.description}`}
+++              >
+++                {/* Active Check Indicator */}
+++                {isSelected && (
+++                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-md">
+++                    <Check className="w-2.5 h-2.5 stroke-[3]" />
+++                  </span>
+++                )}
+++
+++                {/* Avatar Icon */}
+++                <span className="text-2xl sm:text-3xl filter drop-shadow-md mb-1 transition-transform group-hover:scale-110">
+++                  {item.emoji}
+++                </span>
+++
+++                {/* Avatar Name */}
+++                <span
+++                  className={cn(
+++                    'text-[10px] sm:text-xs font-semibold truncate w-full tracking-tight',
+++                    isSelected ? 'text-cyan-300 font-bold' : 'text-slate-400 group-hover:text-slate-200'
+++                  )}
+++                >
+++                  {item.name}
+++                </span>
+++              </motion.button>
+++            );
+++          })}
+++        </div>
+++      </div>
+++    </div>
+++  );
+++};
+++
+++export default AvatarPicker;
++diff --git a/client/src/components/game/CountdownTimer.tsx b/client/src/components/game/CountdownTimer.tsx
++new file mode 100644
++index 0000000..ba0c7c8
++--- /dev/null
+++++ b/client/src/components/game/CountdownTimer.tsx
++@@ -0,0 +1,241 @@
+++import React, { useEffect, useRef } from 'react';
+++import { motion } from 'motion/react';
+++import { Timer, AlertTriangle, Mic } from 'lucide-react';
+++import { useGameSound } from '../../hooks/useGameSound';
+++import { cn } from '../../utils/cn';
+++
+++export type TimerVariant = 'circular' | 'linear' | 'compact';
+++
+++export interface CountdownTimerProps {
+++  totalSeconds: number;
+++  remainingSeconds: number;
+++  variant?: TimerVariant;
+++  size?: number;
+++  strokeWidth?: number;
+++  soundEnabled?: boolean;
+++  speakerName?: string;
+++  label?: string;
+++  className?: string;
+++}
+++
+++export const CountdownTimer: React.FC<CountdownTimerProps> = ({
+++  totalSeconds,
+++  remainingSeconds,
+++  variant = 'circular',
+++  size = 120,
+++  strokeWidth = 8,
+++  soundEnabled = true,
+++  speakerName,
+++  label,
+++  className,
+++}) => {
+++  const { playTick, playUrgentTick, isMuted } = useGameSound();
+++  const lastTickedSecondRef = useRef<number | null>(null);
+++
+++  const safeTotal = Math.max(1, totalSeconds);
+++  const clampedRemaining = Math.max(0, Math.min(remainingSeconds, safeTotal));
+++  const progressRatio = clampedRemaining / safeTotal;
+++
+++  // Color logic based on remaining seconds
+++  const isUrgent = clampedRemaining <= 5 && clampedRemaining > 0;
+++  const isWarning = clampedRemaining > 5 && clampedRemaining < 15;
+++  const isSafe = clampedRemaining >= 15;
+++
+++  const colorConfig = isUrgent
+++    ? {
+++        color: '#f43f5e',
+++        textClass: 'text-rose-400',
+++        strokeClass: 'stroke-rose-500',
+++        bgClass: 'bg-rose-500/10 border-rose-500/30',
+++        glowClass: 'shadow-[0_0_20px_-3px_rgba(244,63,94,0.5)]',
+++      }
+++    : isWarning
+++    ? {
+++        color: '#f59e0b',
+++        textClass: 'text-amber-400',
+++        strokeClass: 'stroke-amber-500',
+++        bgClass: 'bg-amber-500/10 border-amber-500/30',
+++        glowClass: 'shadow-[0_0_20px_-3px_rgba(245,158,11,0.4)]',
+++      }
+++    : {
+++        color: '#06b6d4',
+++        textClass: 'text-cyan-400',
+++        strokeClass: 'stroke-cyan-400',
+++        bgClass: 'bg-cyan-500/10 border-cyan-500/30',
+++        glowClass: 'shadow-[0_0_20px_-3px_rgba(6,182,212,0.4)]',
+++      };
+++
+++  // Synchronized Audio Ticks
+++  useEffect(() => {
+++    if (!soundEnabled || isMuted) return;
+++
+++    // Trigger tick when seconds value changes
+++    if (
+++      lastTickedSecondRef.current !== clampedRemaining &&
+++      clampedRemaining >= 0 &&
+++      clampedRemaining <= totalSeconds
+++    ) {
+++      lastTickedSecondRef.current = clampedRemaining;
+++
+++      if (clampedRemaining <= 5 && clampedRemaining > 0) {
+++        try {
+++          playUrgentTick();
+++        } catch {
+++          // ignore sound error
+++        }
+++      } else if (clampedRemaining > 5) {
+++        try {
+++          playTick();
+++        } catch {
+++          // ignore sound error
+++        }
+++      }
+++    }
+++  }, [clampedRemaining, totalSeconds, soundEnabled, isMuted, playTick, playUrgentTick]);
+++
+++  // Format seconds to mm:ss
+++  const formatTime = (secs: number) => {
+++    const m = Math.floor(secs / 60);
+++    const s = secs % 60;
+++    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
+++  };
+++
+++  // Circular SVG Math
+++  const radius = (size - strokeWidth) / 2;
+++  const circumference = 2 * Math.PI * radius;
+++  const strokeDashoffset = circumference - progressRatio * circumference;
+++
+++  if (variant === 'linear') {
+++    return (
+++      <div className={cn('w-full space-y-2', className)}>
+++        <div className="flex items-center justify-between text-xs font-mono">
+++          <span className="text-slate-400 flex items-center gap-1.5">
+++            {speakerName ? (
+++              <>
+++                <Mic className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
+++                <span className="text-slate-200 font-semibold">{speakerName}</span>
+++              </>
+++            ) : (
+++              label || 'Waktu Tersisa'
+++            )}
+++          </span>
+++          <span className={cn('font-bold text-sm tracking-wider', colorConfig.textClass)}>
+++            {formatTime(clampedRemaining)}
+++          </span>
+++        </div>
+++
+++        {/* Linear Progress Bar */}
+++        <div className="w-full h-2.5 rounded-full bg-slate-950/80 border border-white/10 overflow-hidden p-0.5">
+++          <motion.div
+++            initial={false}
+++            animate={{ width: `${progressRatio * 100}%` }}
+++            transition={{ duration: 0.3, ease: 'easeOut' }}
+++            className={cn('h-full rounded-full transition-colors duration-300', {
+++              'bg-gradient-to-r from-rose-600 to-rose-400': isUrgent,
+++              'bg-gradient-to-r from-amber-600 to-amber-400': isWarning,
+++              'bg-gradient-to-r from-cyan-600 to-cyan-400': isSafe,
+++            })}
+++          />
+++        </div>
+++      </div>
+++    );
+++  }
+++
+++  if (variant === 'compact') {
+++    return (
+++      <div
+++        className={cn(
+++          'inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md transition-all',
+++          colorConfig.bgClass,
+++          isUrgent && 'animate-pulse',
+++          className
+++        )}
+++      >
+++        {isUrgent ? (
+++          <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
+++        ) : (
+++          <Timer className={cn('w-4 h-4', colorConfig.textClass)} />
+++        )}
+++        <span className={cn('text-sm font-mono font-bold tracking-wide', colorConfig.textClass)}>
+++          {clampedRemaining}s
+++        </span>
+++      </div>
+++    );
+++  }
+++
+++  // Circular Default Variant
+++  return (
+++    <div className={cn('flex flex-col items-center justify-center select-none', className)}>
+++      <div
+++        className="relative flex items-center justify-center"
+++        style={{ width: size, height: size }}
+++      >
+++        <svg width={size} height={size} className="transform -rotate-90">
+++          {/* Background Track Circle */}
+++          <circle
+++            cx={size / 2}
+++            cy={size / 2}
+++            r={radius}
+++            stroke="currentColor"
+++            strokeWidth={strokeWidth}
+++            fill="transparent"
+++            className="text-slate-800/80"
+++          />
+++
+++          {/* Progress Indicator Circle */}
+++          <motion.circle
+++            cx={size / 2}
+++            cy={size / 2}
+++            r={radius}
+++            stroke={colorConfig.color}
+++            strokeWidth={strokeWidth}
+++            strokeDasharray={circumference}
+++            initial={false}
+++            animate={{ strokeDashoffset }}
+++            transition={{ duration: 0.3, ease: 'linear' }}
+++            strokeLinecap="round"
+++            fill="transparent"
+++            className="transition-colors duration-300"
+++          />
+++        </svg>
+++
+++        {/* Center Content */}
+++        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
+++          <motion.span
+++            key={clampedRemaining}
+++            initial={{ scale: isUrgent ? 1.2 : 1 }}
+++            animate={{ scale: 1 }}
+++            transition={{ type: 'spring', damping: 15, stiffness: 400 }}
+++            className={cn(
+++              'text-2xl sm:text-3xl font-black font-mono tracking-tight leading-none',
+++              colorConfig.textClass
+++            )}
+++          >
+++            {clampedRemaining}
+++          </motion.span>
+++          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mt-0.5">
+++            detik
+++          </span>
+++        </div>
+++      </div>
+++
+++      {/* Speaker or Custom Label Below */}
+++      {(speakerName || label) && (
+++        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-300 font-sans">
+++          {speakerName ? (
+++            <>
+++              <Mic className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
+++              <span>
+++                Giliran: <strong className="text-cyan-300">{speakerName}</strong>
+++              </span>
+++            </>
+++          ) : (
+++            <span>{label}</span>
+++          )}
+++        </div>
+++      )}
+++    </div>
+++  );
+++};
+++
+++export default CountdownTimer;
++diff --git a/client/src/components/game/SecretCard.tsx b/client/src/components/game/SecretCard.tsx
++new file mode 100644
++index 0000000..621777f
++--- /dev/null
+++++ b/client/src/components/game/SecretCard.tsx
++@@ -0,0 +1,187 @@
+++import React, { useState, useRef, useEffect, useCallback } from 'react';
+++import { motion } from 'motion/react';
+++import { Eye, EyeOff, ShieldAlert, Lock, KeyRound } from 'lucide-react';
+++import { PlayerRole } from '../../types/game.types';
+++import { RoleBadge } from '../common/Badge';
+++import { useGameSound } from '../../hooks/useGameSound';
+++import { cn } from '../../utils/cn';
+++
+++export interface SecretCardProps {
+++  role?: PlayerRole;
+++  word?: string;
+++  category?: string;
+++  onRevealed?: () => void;
+++  className?: string;
+++}
+++
+++export const SecretCard: React.FC<SecretCardProps> = ({
+++  role = 'CIVILIAN',
+++  word,
+++  category,
+++  onRevealed,
+++  className,
+++}) => {
+++  const [isHolding, setIsHolding] = useState(false);
+++  const [hasTriggeredAudio, setHasTriggeredAudio] = useState(false);
+++  const { playRoleReveal } = useGameSound();
+++  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
+++
+++  const startHold = useCallback(() => {
+++    setIsHolding(true);
+++    if (!hasTriggeredAudio) {
+++      try {
+++        playRoleReveal();
+++      } catch {
+++        // ignore audio failure
+++      }
+++      setHasTriggeredAudio(true);
+++      onRevealed?.();
+++    }
+++  }, [hasTriggeredAudio, onRevealed, playRoleReveal]);
+++
+++  const endHold = useCallback(() => {
+++    setIsHolding(false);
+++    if (holdTimeoutRef.current) {
+++      clearTimeout(holdTimeoutRef.current);
+++      holdTimeoutRef.current = null;
+++    }
+++  }, []);
+++
+++  useEffect(() => {
+++    return () => {
+++      if (holdTimeoutRef.current) {
+++        clearTimeout(holdTimeoutRef.current);
+++      }
+++    };
+++  }, []);
+++
+++  const isMrWhite = role === 'MR_WHITE';
+++
+++  return (
+++    <div className={cn('w-full max-w-sm mx-auto select-none', className)}>
+++      {/* Interactive Press & Hold Container */}
+++      <div
+++        onMouseDown={startHold}
+++        onMouseUp={endHold}
+++        onMouseLeave={endHold}
+++        onTouchStart={startHold}
+++        onTouchEnd={endHold}
+++        onTouchCancel={endHold}
+++        onContextMenu={(e) => e.preventDefault()}
+++        className={cn(
+++          'relative overflow-hidden rounded-3xl p-6 sm:p-8 cursor-pointer transition-all duration-300 transform',
+++          'bg-gradient-to-b from-slate-900/90 to-slate-950/95 border backdrop-blur-xl shadow-2xl',
+++          isHolding
+++            ? isMrWhite
+++              ? 'border-purple-500 shadow-[0_0_35px_-5px_rgba(168,85,247,0.5)] scale-[1.02]'
+++              : role === 'UNDERCOVER'
+++              ? 'border-rose-500 shadow-[0_0_35px_-5px_rgba(244,63,94,0.5)] scale-[1.02]'
+++              : 'border-cyan-400 shadow-[0_0_35px_-5px_rgba(6,182,212,0.5)] scale-[1.02]'
+++            : 'border-white/10 hover:border-white/20 active:scale-[0.99]'
+++        )}
+++      >
+++        {/* Subtle Cyber Grid Background */}
+++        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
+++
+++        {/* Content Box */}
+++        <div className="relative z-10 flex flex-col items-center text-center space-y-5">
+++          {/* Top Status Header */}
+++          <div className="flex items-center justify-between w-full">
+++            <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400 flex items-center gap-1">
+++              <Lock className="w-3 h-3 text-cyan-400" />
+++              CONFIDENTIAL DATA
+++            </span>
+++            {category && (
+++              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
+++                {category}
+++              </span>
+++            )}
+++          </div>
+++
+++          {/* Secret Word & Role Mask Container */}
+++          <div className="relative w-full min-h-[140px] flex flex-col items-center justify-center p-4 rounded-2xl bg-black/40 border border-white/5 overflow-hidden">
+++            {/* Unmasked Content (Visible when holding) */}
+++            <motion.div
+++              initial={false}
+++              animate={{
+++                filter: isHolding ? 'blur(0px)' : 'blur(16px)',
+++                opacity: isHolding ? 1 : 0,
+++                scale: isHolding ? 1 : 0.9,
+++              }}
+++              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
+++              className="flex flex-col items-center justify-center space-y-3 pointer-events-none"
+++            >
+++              <RoleBadge role={role} size="lg" />
+++
+++              {isMrWhite ? (
+++                <div className="text-center space-y-1">
+++                  <p className="text-xl sm:text-2xl font-black font-display text-purple-300 tracking-wide">
+++                    BUTAKATA (MR. WHITE)
+++                  </p>
+++                  <p className="text-xs text-purple-200/80 max-w-[220px] font-sans">
+++                    Kamu tidak memiliki kata rahasia! Simak petunjuk warga dan tebak katanya.
+++                  </p>
+++                </div>
+++              ) : (
+++                <div className="text-center space-y-1">
+++                  <p className="text-2xl sm:text-3xl font-black font-display text-transparent bg-gradient-to-r from-cyan-200 via-white to-cyan-300 bg-clip-text tracking-wider uppercase">
+++                    {word || 'Kata Rahasia'}
+++                  </p>
+++                  <p className="text-[11px] text-slate-400 font-sans">
+++                    Jelaskan kata ini tanpa ketahuan impostor/butakata!
+++                  </p>
+++                </div>
+++              )}
+++            </motion.div>
+++
+++            {/* Masked Prompt (Visible when NOT holding) */}
+++            <motion.div
+++              initial={false}
+++              animate={{
+++                opacity: isHolding ? 0 : 1,
+++                scale: isHolding ? 0.9 : 1,
+++              }}
+++              transition={{ duration: 0.15 }}
+++              className={cn(
+++                'absolute inset-0 flex flex-col items-center justify-center space-y-2 p-4 text-center pointer-events-none'
+++              )}
+++            >
+++              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
+++                <KeyRound className="w-6 h-6 animate-pulse" />
+++              </div>
+++              <p className="text-sm font-bold text-slate-200 font-display">
+++                Tahan untuk Intip Kata
+++              </p>
+++              <p className="text-[11px] text-slate-400">
+++                Tekan dan tahan layar untuk membaca
+++              </p>
+++            </motion.div>
+++          </div>
+++
+++          {/* Hold Feedback Indicator */}
+++          <div className="w-full flex items-center justify-center gap-2">
+++            {isHolding ? (
+++              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 animate-pulse">
+++                <Eye className="w-3.5 h-3.5" />
+++                Melepas akan langsung menutup kata
+++              </span>
+++            ) : (
+++              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
+++                <EyeOff className="w-3.5 h-3.5" />
+++                Kata tersembunyi dengan aman
+++              </span>
+++            )}
+++          </div>
+++
+++          {/* Privacy Notice */}
+++          <div className="w-full pt-3 border-t border-white/5 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
+++            <ShieldAlert className="w-3.5 h-3.5 text-amber-500/80 shrink-0" />
+++            <span>Pastikan layar tidak diintip pemain di sebelahmu!</span>
+++          </div>
+++        </div>
+++      </div>
+++    </div>
+++  );
+++};
+++
+++export default SecretCard;
++diff --git a/client/src/components/game/index.ts b/client/src/components/game/index.ts
++new file mode 100644
++index 0000000..53e6444
++--- /dev/null
+++++ b/client/src/components/game/index.ts
++@@ -0,0 +1,3 @@
+++export * from './AvatarPicker';
+++export * from './SecretCard';
+++export * from './CountdownTimer';
++diff --git a/client/src/components/index.ts b/client/src/components/index.ts
++new file mode 100644
++index 0000000..94b605a
++--- /dev/null
+++++ b/client/src/components/index.ts
++@@ -0,0 +1,2 @@
+++export * from './common';
+++export * from './game';
++diff --git a/client/src/utils/cn.ts b/client/src/utils/cn.ts
++new file mode 100644
++index 0000000..a7c2663
++--- /dev/null
+++++ b/client/src/utils/cn.ts
++@@ -0,0 +1,6 @@
+++import { clsx, type ClassValue } from 'clsx';
+++import { twMerge } from 'tailwind-merge';
+++
+++export function cn(...inputs: ClassValue[]): string {
+++  return twMerge(clsx(inputs));
+++}
++
++```
+diff --git a/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-7-brief.md b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-7-brief.md
+new file mode 100644
+index 0000000..a966fd1
+--- /dev/null
++++ b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-7-brief.md
+@@ -0,0 +1,37 @@
++# Task 7 Brief: Offline Pass & Play (Single-Device 1 HP) Mode
++
++## Goal
++Implement the complete offline single-device Pass & Play game mode in `client/`:
++
++1. `client/src/context/PassPlayContext.tsx`:
++   - Standalone offline state machine running 100% locally in React context (works without server or internet).
++   - Manages: `players`, `phase` ('SETUP' | 'REVEAL_PASS' | 'TURN_CLUE' | 'VOTING' | 'MR_WHITE_GUESS' | 'GAME_OVER'), `currentRevealIndex`, `speakingOrder`, `currentSpeakerIndex`, `round`, `wordPair`, `settings`, `winningRole`, `eliminatedPlayer`.
++   - Actions: `addPlayer`, `removePlayer`, `updateSettings`, `startPassPlayGame`, `nextRevealPlayer`, `finishRevealPhase`, `nextSpeaker`, `startVotingPhase`, `castVote`, `submitMrWhiteGuess`, `rematch`, `resetToSetup`.
++
++2. `client/src/pages/PassPlaySetupPage.tsx`:
++   - Player roster manager (add 3-20 player names with avatar picker, minimum 3 players to start).
++   - Category selector (Makanan & Minuman, Hewan, Benda & Gadget, Tempat & Hiburan, Profesi, or Custom Pack).
++   - Role sliders: Civilian, Undercover, Mr. White (with automatic validation ensuring total roles == total players).
++   - Turn duration setting (30s / 45s / 60s / Unlimited).
++   - "Mulai Permainan" button.
++
++3. `client/src/components/game/PassPlaySecretView.tsx`:
++   - Screen 1: *"Oper HP ke [Nama Pemain]"* with big avatar and "Saya Sudah Siap" button.
++   - Screen 2: `<SecretCard>` with press-and-hold reveal mechanism.
++   - Screen 3: "Selesai & Oper ke Pemain Berikutnya" button or "Mulai Beri Clue" for last player.
++
++4. `client/src/components/game/PassPlayVotingView.tsx`:
++   - Discussion / Turn Clue guide: spotlights active speaker with countdown timer and "Lanjut ke Pembicara Berikutnya" / "Mulai Voting".
++   - Interactive Voting Grid: tap player to select, confirm elimination.
++   - Instant Skip Tie-Breaker handling: if votes tie, shows clear banner & sound, skips elimination, and starts next round.
++   - Mr. White Intercept Modal: 45s timer for Mr. White to guess Civilian word with `isFuzzyMatch`. Correct -> instant Mr. White win; wrong -> Mr. White eliminated.
++
++5. `client/src/pages/PassPlayGamePage.tsx`:
++   - Orchestrates the game loop views: Secret Passing -> Turn Clues -> Voting & Elimination -> Game Over summary screen (reveals all player roles and secret words, plays victory/defeat fanfare, and 1-click Rematch button).
++
++6. Verification:
++   - Client typecheck & build passing with zero errors.
++
++## Report Contract
++Write report to: `C:\Users\ASUS\Documents\ALIFKA\PROJECT\whatstheword\.superpowers\sdd\2026-09-02-whatstheword-implementation\task-7-report.md`
++Return: status (DONE / BLOCKED), commits, one-line test summary.
+diff --git a/client/src/App.tsx b/client/src/App.tsx
+index 28f7840..696f126 100644
+--- a/client/src/App.tsx
++++ b/client/src/App.tsx
+@@ -1,27 +1,24 @@
+ import React from 'react';
++import { PassPlayProvider, usePassPlay } from './context/PassPlayContext';
++import { PassPlaySetupPage } from './pages/PassPlaySetupPage';
++import { PassPlayGamePage } from './pages/PassPlayGamePage';
++
++const PassPlayRouter: React.FC = () => {
++  const { phase } = usePassPlay();
++
++  if (phase === 'SETUP') {
++    return <PassPlaySetupPage />;
++  }
++
++  return <PassPlayGamePage />;
++};
+ 
+ export const App: React.FC = () => {
+   return (
+-    <main className="min-h-[100dvh] flex flex-col items-center justify-center p-4 bg-[#080c16] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
+-      <div className="w-full max-w-md p-6 rounded-2xl glass-panel shadow-2xl text-center space-y-4">
+-        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-2">
+-          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
+-            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
+-          </svg>
+-        </div>
+-        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-violet-400 to-rose-400 bg-clip-text text-transparent font-display">
+-          What's The Word
+-        </h1>
+-        <p className="text-sm text-slate-400 font-sans">
+-          Undercover Word Deduction Game Monorepo Initialized.
+-        </p>
+-        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
+-          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
+-          Ready for Task 2
+-        </div>
+-      </div>
+-    </main>
++    <PassPlayProvider>
++      <PassPlayRouter />
++    </PassPlayProvider>
+   );
+ };
+ 
+ export default App;
+diff --git a/client/src/components/game/PassPlaySecretView.tsx b/client/src/components/game/PassPlaySecretView.tsx
+new file mode 100644
+index 0000000..628eadf
+--- /dev/null
++++ b/client/src/components/game/PassPlaySecretView.tsx
+@@ -0,0 +1,217 @@
++import React, { useState, useEffect } from 'react';
++import { motion, AnimatePresence } from 'motion/react';
++import { Smartphone, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
++import { usePassPlay } from '../../context/PassPlayContext';
++import { SecretCard } from './SecretCard';
++import { Button } from '../common/Button';
++import { Badge } from '../common/Badge';
++
++type SecretPassSubScreen = 'PASS_PROMPT' | 'REVEAL_CARD' | 'DONE_PROMPT';
++
++export interface PassPlaySecretViewProps {
++  onAllRevealed?: () => void;
++}
++
++export const PassPlaySecretView: React.FC<PassPlaySecretViewProps> = ({ onAllRevealed }) => {
++  const {
++    players,
++    currentRevealIndex,
++    settings,
++    nextRevealPlayer,
++    finishRevealPhase,
++  } = usePassPlay();
++
++  const [subScreen, setSubScreen] = useState<SecretPassSubScreen>('PASS_PROMPT');
++
++  const currentPlayer = players[currentRevealIndex] || players[0];
++  const isLastPlayer = currentRevealIndex >= players.length - 1;
++  const totalPlayers = players.length;
++
++  // Reset sub-screen when reveal index changes
++  useEffect(() => {
++    setSubScreen('PASS_PROMPT');
++  }, [currentRevealIndex]);
++
++  const handleReadyToPeek = () => {
++    setSubScreen('REVEAL_CARD');
++  };
++
++  const handleFinishPeeking = () => {
++    setSubScreen('DONE_PROMPT');
++  };
++
++  const handleProceedNext = () => {
++    if (isLastPlayer) {
++      finishRevealPhase();
++      onAllRevealed?.();
++    } else {
++      nextRevealPlayer();
++    }
++  };
++
++  return (
++    <div className="w-full max-w-lg mx-auto min-h-[500px] flex flex-col justify-center items-center px-4 py-6">
++      {/* Top Pass Progress Stepper */}
++      <div className="w-full flex items-center justify-between mb-6 px-2">
++        <div className="flex items-center gap-2">
++          <Badge variant="cyan" size="sm" pulse>
++            FASE INTI KATA
++          </Badge>
++          <span className="text-xs font-mono text-slate-400">
++            Pemain {currentRevealIndex + 1} dari {totalPlayers}
++          </span>
++        </div>
++
++        {/* Progress Dots */}
++        <div className="flex items-center gap-1">
++          {players.map((_, idx) => (
++            <span
++              key={idx}
++              className={`h-1.5 rounded-full transition-all duration-300 ${
++                idx === currentRevealIndex
++                  ? 'w-6 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
++                  : idx < currentRevealIndex
++                  ? 'w-2 bg-emerald-400'
++                  : 'w-2 bg-slate-800'
++              }`}
++            />
++          ))}
++        </div>
++      </div>
++
++      {/* Main Animated Flow Container */}
++      <AnimatePresence mode="wait">
++        {/* SUB-SCREEN 1: Pass Phone Prompt */}
++        {subScreen === 'PASS_PROMPT' && (
++          <motion.div
++            key="pass-prompt"
++            initial={{ opacity: 0, scale: 0.92, y: 15 }}
++            animate={{ opacity: 1, scale: 1, y: 0 }}
++            exit={{ opacity: 0, scale: 0.95, y: -15 }}
++            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
++            className="w-full flex flex-col items-center text-center space-y-6 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-white/10 shadow-2xl backdrop-blur-xl"
++          >
++            <div className="relative">
++              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-cyan-500/20 via-violet-500/10 to-transparent border border-cyan-500/30 flex items-center justify-center text-5xl sm:text-6xl shadow-inner animate-pulse">
++                {currentPlayer.avatar}
++              </div>
++              <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-slate-950 border border-cyan-400/40 text-cyan-400 shadow-md">
++                <Smartphone className="w-4 h-4" />
++              </div>
++            </div>
++
++            <div className="space-y-2 max-w-sm">
++              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
++                OPER PERANGKAT KE:
++              </span>
++              <h2 className="text-2xl sm:text-3xl font-black font-display text-white tracking-wide">
++                {currentPlayer.name}
++              </h2>
++              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
++                Berikan smartphone ini kepada <strong>{currentPlayer.name}</strong>. Jangan biarkan pemain lain melihat layar!
++              </p>
++            </div>
++
++            <div className="w-full pt-2">
++              <Button
++                variant="primary"
++                size="lg"
++                fullWidth
++                onClick={handleReadyToPeek}
++                rightIcon={<ArrowRight className="w-5 h-5" />}
++                className="shadow-lg shadow-cyan-500/25 py-3.5 text-base"
++              >
++                Saya {currentPlayer.name}, Saya Sudah Siap!
++              </Button>
++            </div>
++          </motion.div>
++        )}
++
++        {/* SUB-SCREEN 2: Secret Card Reveal (Press & Hold) */}
++        {subScreen === 'REVEAL_CARD' && (
++          <motion.div
++            key="reveal-card"
++            initial={{ opacity: 0, scale: 0.94, y: 15 }}
++            animate={{ opacity: 1, scale: 1, y: 0 }}
++            exit={{ opacity: 0, scale: 0.95, y: -15 }}
++            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
++            className="w-full flex flex-col items-center space-y-6"
++          >
++            {/* Player Target Badge */}
++            <div className="flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-slate-900/80 border border-white/10 shadow-sm">
++              <span className="text-xl">{currentPlayer.avatar}</span>
++              <span className="text-sm font-bold text-slate-200">{currentPlayer.name}</span>
++            </div>
++
++            {/* Reusable Secret Card */}
++            <SecretCard
++              role={currentPlayer.role}
++              word={currentPlayer.word}
++              category={settings.category}
++              className="shadow-2xl"
++            />
++
++            {/* Confirm Finished Button */}
++            <div className="w-full max-w-sm">
++              <Button
++                variant="secondary"
++                size="md"
++                fullWidth
++                onClick={handleFinishPeeking}
++                leftIcon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
++                className="hover:border-emerald-500/40 hover:text-white"
++              >
++                Sudah Hafal Kata & Peran
++              </Button>
++            </div>
++          </motion.div>
++        )}
++
++        {/* SUB-SCREEN 3: Done & Pass to Next Player */}
++        {subScreen === 'DONE_PROMPT' && (
++          <motion.div
++            key="done-prompt"
++            initial={{ opacity: 0, scale: 0.92, y: 15 }}
++            animate={{ opacity: 1, scale: 1, y: 0 }}
++            exit={{ opacity: 0, scale: 0.95, y: -15 }}
++            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
++            className="w-full flex flex-col items-center text-center space-y-6 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-white/10 shadow-2xl backdrop-blur-xl"
++          >
++            <div className="w-20 h-20 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
++              <CheckCircle className="w-10 h-10 animate-bounce" />
++            </div>
++
++            <div className="space-y-2 max-w-sm">
++              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
++                KATA BERHASIL DITERIMA
++              </span>
++              <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
++                {currentPlayer.name} Telah Mengintip
++              </h2>
++              <p className="text-xs sm:text-sm text-slate-400 font-sans">
++                {isLastPlayer
++                  ? 'Semua pemain telah selesai melihat peran masing-masing! Siap untuk memulai putaran diskusi dan clue?'
++                  : 'Sembunyikan layar dan oper smartphone ke pemain berikutnya.'}
++              </p>
++            </div>
++
++            <div className="w-full pt-2">
++              <Button
++                variant={isLastPlayer ? 'primary' : 'secondary'}
++                size="lg"
++                fullWidth
++                onClick={handleProceedNext}
++                rightIcon={<ArrowRight className="w-5 h-5" />}
++                className={isLastPlayer ? 'shadow-lg shadow-cyan-500/30 font-bold' : ''}
++              >
++                {isLastPlayer ? 'Mulai Beri Clue (Diskusi)' : 'Oper ke Pemain Berikutnya'}
++              </Button>
++            </div>
++          </motion.div>
++        )}
++      </AnimatePresence>
++    </div>
++  );
++};
++
++export default PassPlaySecretView;
+diff --git a/client/src/components/game/PassPlayVotingView.tsx b/client/src/components/game/PassPlayVotingView.tsx
+new file mode 100644
+index 0000000..131a03e
+--- /dev/null
++++ b/client/src/components/game/PassPlayVotingView.tsx
+@@ -0,0 +1,594 @@
++import React, { useState, useEffect } from 'react';
++import { motion, AnimatePresence } from 'motion/react';
++import {
++  Mic,
++  ArrowRight,
++  Vote,
++  Skull,
++  AlertTriangle,
++  HelpCircle,
++  Clock,
++  Send,
++  Users,
++} from 'lucide-react';
++import { usePassPlay } from '../../context/PassPlayContext';
++import { useGameSound } from '../../hooks/useGameSound';
++import { Button } from '../common/Button';
++import { Card } from '../common/Card';
++import { Badge, RoleBadge } from '../common/Badge';
++import { Modal } from '../common/Modal';
++import { CountdownTimer } from './CountdownTimer';
++import { Player } from '../../types/game.types';
++
++export const PassPlayVotingView: React.FC = () => {
++  const {
++    players,
++    phase,
++    speakingOrder,
++    currentSpeakerIndex,
++    activeSpeakerId,
++    round,
++    settings,
++    votes,
++    isTieLastRound,
++    tieMessage,
++    pendingEliminatedPlayer,
++    nextSpeaker,
++    startVotingPhase,
++    castVote,
++    clearVotes,
++    processElimination,
++    submitMrWhiteGuess,
++    skipMrWhiteGuess,
++  } = usePassPlay();
++
++  const { playVoteBuzzer, playElimination, playVictory, playDefeat } = useGameSound();
++
++  // Local turn timer for the active speaker
++  const [turnTimerSeconds, setTurnTimerSeconds] = useState<number>(settings.turnDurationSeconds || 45);
++
++  // Voting Selection State
++  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
++  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
++  const [votingMode, setVotingMode] = useState<'consensus' | 'individual'>('consensus');
++  const [currentVoterId, setCurrentVoterId] = useState<string | null>(null);
++
++  // Mr White Guess Modal State
++  const [mrWhiteGuessInput, setMrWhiteGuessInput] = useState('');
++  const [mrWhiteTimerSeconds, setMrWhiteTimerSeconds] = useState(45);
++
++  const alivePlayers = players.filter((p) => p.isAlive);
++  const activeSpeaker = players.find((p) => p.id === activeSpeakerId) || alivePlayers[0];
++  const isLastSpeaker = currentSpeakerIndex >= speakingOrder.filter(id => players.find(p => p.id === id)?.isAlive).length - 1;
++
++  // Reset speaker timer on speaker change
++  useEffect(() => {
++    if (phase === 'TURN_CLUE') {
++      setTurnTimerSeconds(settings.turnDurationSeconds || 45);
++    }
++  }, [activeSpeakerId, phase, settings.turnDurationSeconds]);
++
++  // Turn Clue Countdown ticker
++  useEffect(() => {
++    if (phase !== 'TURN_CLUE' || settings.turnDurationSeconds === 0) return;
++
++    const interval = setInterval(() => {
++      setTurnTimerSeconds((prev) => {
++        if (prev <= 1) {
++          return 0;
++        }
++        return prev - 1;
++      });
++    }, 1000);
++
++    return () => clearInterval(interval);
++  }, [phase, settings.turnDurationSeconds, activeSpeakerId]);
++
++  // Mr White 45s countdown timer ticker
++  useEffect(() => {
++    if (phase !== 'MR_WHITE_GUESS') return;
++
++    setMrWhiteTimerSeconds(45);
++    setMrWhiteGuessInput('');
++
++    const interval = setInterval(() => {
++      setMrWhiteTimerSeconds((prev) => {
++        if (prev <= 1) {
++          clearInterval(interval);
++          return 0;
++        }
++        return prev - 1;
++      });
++    }, 1000);
++
++    return () => clearInterval(interval);
++  }, [phase]);
++
++  // Mr White time out auto submit/skip
++  useEffect(() => {
++    if (phase === 'MR_WHITE_GUESS' && mrWhiteTimerSeconds === 0) {
++      if (mrWhiteGuessInput.trim()) {
++        handleSubmitMrWhite();
++      } else {
++        skipMrWhiteGuess();
++      }
++    }
++  }, [mrWhiteTimerSeconds, phase]);
++
++  const handleNextSpeakerClick = () => {
++    nextSpeaker();
++  };
++
++  const handleSelectSuspect = (playerId: string) => {
++    if (votingMode === 'consensus') {
++      setSelectedSuspectId(playerId);
++      setIsConfirmModalOpen(true);
++    } else if (votingMode === 'individual') {
++      if (currentVoterId) {
++        castVote(currentVoterId, playerId);
++        playVoteBuzzer();
++        // Advance to next voter
++        const nextVoter = alivePlayers.find((p) => p.id !== currentVoterId && !votes[p.id]);
++        setCurrentVoterId(nextVoter ? nextVoter.id : null);
++      }
++    }
++  };
++
++  const handleConfirmConsensusElimination = () => {
++    if (!selectedSuspectId) return;
++    setIsConfirmModalOpen(false);
++
++    try {
++      playElimination();
++    } catch {
++      // ignore
++    }
++
++    processElimination(selectedSuspectId);
++    setSelectedSuspectId(null);
++  };
++
++  const handleCalculateTallyElimination = () => {
++    try {
++      playElimination();
++    } catch {
++      // ignore
++    }
++    processElimination();
++  };
++
++  const handleSubmitMrWhite = () => {
++    if (!mrWhiteGuessInput.trim()) return;
++    const result = submitMrWhiteGuess(mrWhiteGuessInput.trim());
++    if (result.isCorrect) {
++      try {
++        playVictory();
++      } catch {
++        // ignore
++      }
++    } else {
++      try {
++        playDefeat();
++      } catch {
++        // ignore
++      }
++    }
++  };
++
++  return (
++    <div className="w-full max-w-3xl mx-auto space-y-6">
++      {/* Tie Breaker Banner (Instant Skip) */}
++      <AnimatePresence>
++        {isTieLastRound && tieMessage && (
++          <motion.div
++            initial={{ opacity: 0, y: -15, scale: 0.95 }}
++            animate={{ opacity: 1, y: 0, scale: 1 }}
++            exit={{ opacity: 0, scale: 0.9 }}
++            className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 flex items-center gap-3 shadow-lg shadow-amber-950/30"
++          >
++            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
++              <AlertTriangle className="w-5 h-5 animate-bounce" />
++            </div>
++            <div className="flex-1">
++              <h4 className="text-sm font-bold font-display uppercase tracking-wider text-amber-300">
++                Aturan Instant Skip Aktif!
++              </h4>
++              <p className="text-xs text-amber-200/90">{tieMessage}</p>
++            </div>
++          </motion.div>
++        )}
++      </AnimatePresence>
++
++      {/* PHASE 1: TURN CLUE (DISCUSSION) */}
++      {phase === 'TURN_CLUE' && (
++        <div className="space-y-6">
++          {/* Header Status */}
++          <div className="flex items-center justify-between">
++            <div className="flex items-center gap-2">
++              <Badge variant="cyan" size="md" pulse>
++                Ronde {round}
++              </Badge>
++              <span className="text-xs font-mono text-slate-400">
++                Fase Pemberian Petunjuk (Clue)
++              </span>
++            </div>
++
++            <Button
++              variant="outline"
++              size="xs"
++              onClick={startVotingPhase}
++              rightIcon={<Vote className="w-3.5 h-3.5" />}
++              className="text-xs"
++            >
++              Langsung ke Voting
++            </Button>
++          </div>
++
++          {/* Active Speaker Spotlight Card */}
++          <Card glow="cyan" className="p-6 sm:p-8 text-center space-y-6 relative overflow-hidden">
++            <div className="absolute top-3 right-3">
++              <span className="text-xs font-mono text-slate-500">
++                {currentSpeakerIndex + 1} / {speakingOrder.filter(id => players.find(p => p.id === id)?.isAlive).length} Pembicara
++              </span>
++            </div>
++
++            {/* Avatar Spotlight */}
++            <div className="flex flex-col items-center space-y-3">
++              <div className="relative">
++                <motion.div
++                  key={activeSpeaker?.id}
++                  initial={{ scale: 0.8, rotate: -5 }}
++                  animate={{ scale: 1, rotate: 0 }}
++                  transition={{ type: 'spring', damping: 15 }}
++                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-cyan-500/10 border-2 border-cyan-400 flex items-center justify-center text-5xl sm:text-6xl shadow-[0_0_35px_-5px_rgba(6,182,212,0.5)]"
++                >
++                  {activeSpeaker?.avatar}
++                </motion.div>
++                <span className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-cyan-400 text-slate-950 shadow-md">
++                  <Mic className="w-4 h-4 animate-pulse" />
++                </span>
++              </div>
++
++              <div className="space-y-1">
++                <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
++                  GILIRAN BICARA SEKARANG:
++                </span>
++                <h2 className="text-2xl sm:text-3xl font-black font-display text-white">
++                  {activeSpeaker?.name}
++                </h2>
++                <p className="text-xs text-slate-400 font-sans max-w-sm mx-auto">
++                  Berikan 1 kata atau kalimat petunjuk yang mendeskripsikan kata rahasiamu!
++                </p>
++              </div>
++            </div>
++
++            {/* Countdown Timer (if enabled) */}
++            {settings.turnDurationSeconds > 0 ? (
++              <div className="py-2">
++                <CountdownTimer
++                  totalSeconds={settings.turnDurationSeconds}
++                  remainingSeconds={turnTimerSeconds}
++                  size={100}
++                  strokeWidth={7}
++                  soundEnabled
++                  variant="circular"
++                />
++              </div>
++            ) : (
++              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-400">
++                <Clock className="w-3.5 h-3.5" />
++                Waktu Giliran Bebas
++              </div>
++            )}
++
++            {/* Next Speaker CTA */}
++            <div className="pt-2 max-w-sm mx-auto">
++              <Button
++                variant="primary"
++                size="lg"
++                fullWidth
++                onClick={handleNextSpeakerClick}
++                rightIcon={isLastSpeaker ? <Vote className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
++                className="shadow-xl shadow-cyan-500/30 text-base py-3.5"
++              >
++                {isLastSpeaker ? 'Selesai & Mulai Voting' : 'Lanjut ke Pembicara Berikutnya'}
++              </Button>
++            </div>
++          </Card>
++
++          {/* Speaking Order List */}
++          <div className="space-y-2">
++            <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
++              Urutan Bicara Ronde {round}:
++            </span>
++            <div className="flex items-center gap-2 overflow-x-auto pb-2">
++              {speakingOrder
++                .map((id) => players.find((p) => p.id === id))
++                .filter((p): p is Player => !!p && p.isAlive)
++                .map((p, idx) => {
++                  const isCurrent = idx === currentSpeakerIndex;
++                  const isPast = idx < currentSpeakerIndex;
++
++                  return (
++                    <div
++                      key={p.id}
++                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shrink-0 transition-all ${
++                        isCurrent
++                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md ring-1 ring-cyan-400 font-bold'
++                          : isPast
++                          ? 'bg-slate-900/40 border-white/5 text-slate-500'
++                          : 'bg-slate-900/80 border-white/10 text-slate-300'
++                      }`}
++                    >
++                      <span className="text-sm">{p.avatar}</span>
++                      <span className="text-xs truncate max-w-[100px]">{p.name}</span>
++                      {isCurrent && <Mic className="w-3 h-3 text-cyan-400 animate-pulse ml-1" />}
++                    </div>
++                  );
++                })}
++            </div>
++          </div>
++        </div>
++      )}
++
++      {/* PHASE 2: VOTING & ELIMINATION */}
++      {phase === 'VOTING' && (
++        <div className="space-y-6">
++          {/* Voting Header */}
++          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
++            <div className="space-y-1">
++              <div className="flex items-center gap-2">
++                <Badge variant="crimson" size="md" pulse>
++                  FASE VOTING
++                </Badge>
++                <span className="text-xs font-mono text-slate-400">
++                  Ronde {round} • {alivePlayers.length} Pemain Hidup
++                </span>
++              </div>
++              <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
++                Pilih Pemain Yang Dicurigai
++              </h2>
++            </div>
++
++            {/* Voting Mode Switcher */}
++            <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-white/10 shrink-0">
++              <button
++                type="button"
++                onClick={() => {
++                  setVotingMode('consensus');
++                  clearVotes();
++                }}
++                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
++                  votingMode === 'consensus'
++                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
++                    : 'text-slate-400 hover:text-slate-200'
++                }`}
++              >
++                Konsensus Langsung
++              </button>
++              <button
++                type="button"
++                onClick={() => {
++                  setVotingMode('individual');
++                  setCurrentVoterId(alivePlayers[0]?.id || null);
++                }}
++                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
++                  votingMode === 'individual'
++                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
++                    : 'text-slate-400 hover:text-slate-200'
++                }`}
++              >
++                Tally 1 per 1
++              </button>
++            </div>
++          </div>
++
++          {/* Mode Instructions */}
++          {votingMode === 'individual' && (
++            <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between gap-2">
++              <div className="flex items-center gap-2">
++                <Users className="w-4 h-4 text-cyan-400" />
++                <span className="text-xs text-slate-300">
++                  Giliran memilih:{' '}
++                  <strong className="text-cyan-300">
++                    {alivePlayers.find((p) => p.id === currentVoterId)?.name || 'Semua Selesai'}
++                  </strong>
++                </span>
++              </div>
++              <span className="text-[10px] font-mono text-slate-400">
++                {Object.keys(votes).length}/{alivePlayers.length} Suara
++              </span>
++            </div>
++          )}
++
++          {/* Interactive Suspect Grid */}
++          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
++            {alivePlayers.map((p) => {
++              const voteCount = Object.values(votes).filter((targetId) => targetId === p.id).length;
++
++              return (
++                <motion.button
++                  key={p.id}
++                  whileHover={{ scale: 1.02 }}
++                  whileTap={{ scale: 0.98 }}
++                  onClick={() => handleSelectSuspect(p.id)}
++                  className="group relative flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-rose-500/50 hover:bg-slate-900/95 transition-all text-left shadow-lg hover:shadow-rose-950/40"
++                >
++                  <div className="flex items-center gap-3">
++                    <span className="text-3xl group-hover:scale-110 transition-transform">
++                      {p.avatar}
++                    </span>
++                    <div>
++                      <h4 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
++                        {p.name}
++                      </h4>
++                      <span className="text-[11px] font-mono text-slate-400">
++                        {votingMode === 'consensus' ? 'Klik untuk eliminasi' : 'Pilih sebagai target'}
++                      </span>
++                    </div>
++                  </div>
++
++                  {/* Vote Count Indicator for Individual Mode */}
++                  {votingMode === 'individual' && voteCount > 0 && (
++                    <span className="px-2.5 py-1 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold">
++                      {voteCount} Vote
++                    </span>
++                  )}
++
++                  {/* Red Skull icon indicator */}
++                  <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5 text-slate-500 group-hover:text-rose-400 group-hover:border-rose-500/30 transition-all">
++                    <Skull className="w-4 h-4" />
++                  </div>
++                </motion.button>
++              );
++            })}
++          </div>
++
++          {/* Individual Mode Finalize Action */}
++          {votingMode === 'individual' && (
++            <div className="pt-3 flex items-center justify-end gap-3">
++              <Button variant="ghost" size="sm" onClick={clearVotes}>
++                Reset Suara
++              </Button>
++              <Button
++                variant="danger"
++                size="md"
++                onClick={handleCalculateTallyElimination}
++                disabled={Object.keys(votes).length === 0}
++                leftIcon={<Skull className="w-4 h-4" />}
++              >
++                Hitung & Eliminasi Hasil Tally
++              </Button>
++            </div>
++          )}
++        </div>
++      )}
++
++      {/* Confirmation Modal for Consensus Elimination */}
++      <Modal
++        isOpen={isConfirmModalOpen}
++        onClose={() => setIsConfirmModalOpen(false)}
++        title="Konfirmasi Eliminasi Pemain"
++        subtitle="Pemain yang tereliminasi akan diungkap atau Mr. White diberi kesempatan tebak kata."
++        size="sm"
++        footer={
++          <div className="flex items-center justify-end gap-2 w-full">
++            <Button variant="ghost" size="sm" onClick={() => setIsConfirmModalOpen(false)}>
++              Batal
++            </Button>
++            <Button
++              variant="danger"
++              size="sm"
++              onClick={handleConfirmConsensusElimination}
++              leftIcon={<Skull className="w-4 h-4" />}
++            >
++              Ya, Eliminasi Sekarang
++            </Button>
++          </div>
++        }
++      >
++        {selectedSuspectId && (
++          <div className="flex flex-col items-center text-center space-y-3 py-3">
++            <div className="text-5xl">
++              {players.find((p) => p.id === selectedSuspectId)?.avatar}
++            </div>
++            <div>
++              <p className="text-lg font-bold text-white">
++                {players.find((p) => p.id === selectedSuspectId)?.name}
++              </p>
++              <p className="text-xs text-rose-300/80">
++                Apakah semua pemain sepakat mengeliminasi pemain ini?
++              </p>
++            </div>
++          </div>
++        )}
++      </Modal>
++
++      {/* MR. WHITE 45s GUESS MODAL */}
++      <Modal
++        isOpen={phase === 'MR_WHITE_GUESS'}
++        onClose={() => {}} // Block outside close during high-tension moment
++        closeOnOutsideClick={false}
++        closeOnEscape={false}
++        showCloseButton={false}
++        title={
++          <div className="flex items-center gap-2 text-purple-400">
++            <HelpCircle className="w-5 h-5 animate-pulse" />
++            <span>MR. WHITE INTERCEPT!</span>
++          </div>
++        }
++        subtitle="Pemain Buta Kata (Mr. White) terpilih untuk dieliminasi!"
++        size="md"
++      >
++        <div className="space-y-5 py-2">
++          {/* Mr. White Profile Header */}
++          <div className="flex items-center gap-3 p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30">
++            <span className="text-4xl">{pendingEliminatedPlayer?.avatar}</span>
++            <div>
++              <div className="flex items-center gap-2">
++                <span className="text-base font-bold text-white">
++                  {pendingEliminatedPlayer?.name}
++                </span>
++                <RoleBadge role="MR_WHITE" size="sm" />
++              </div>
++              <p className="text-xs text-purple-200/80">
++                Kamu memiliki kesempatan terakhir! Tebak kata rahasia milik Warga untuk memenangkan game seketika!
++              </p>
++            </div>
++          </div>
++
++          {/* 45s Countdown */}
++          <div className="flex justify-center">
++            <CountdownTimer
++              totalSeconds={45}
++              remainingSeconds={mrWhiteTimerSeconds}
++              size={90}
++              strokeWidth={7}
++              soundEnabled
++              variant="compact"
++            />
++          </div>
++
++          {/* Word Guess Input */}
++          <div className="space-y-2">
++            <label className="block text-xs font-semibold text-slate-300">
++              Ketik Kata Rahasia Warga:
++            </label>
++            <div className="relative">
++              <input
++                type="text"
++                value={mrWhiteGuessInput}
++                onChange={(e) => setMrWhiteGuessInput(e.target.value)}
++                onKeyDown={(e) => {
++                  if (e.key === 'Enter') handleSubmitMrWhite();
++                }}
++                placeholder="Contoh: Kopi, Martabak, Laptop..."
++                autoFocus
++                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-purple-500/40 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 text-base font-bold"
++              />
++            </div>
++          </div>
++
++          {/* Actions */}
++          <div className="flex items-center justify-between pt-2 gap-3">
++            <Button variant="ghost" size="sm" onClick={skipMrWhiteGuess}>
++              Menyerah (Skip)
++            </Button>
++            <Button
++              variant="accent"
++              size="md"
++              onClick={handleSubmitMrWhite}
++              disabled={!mrWhiteGuessInput.trim()}
++              rightIcon={<Send className="w-4 h-4" />}
++              className="font-bold shadow-lg shadow-purple-500/30"
++            >
++              Kirim Tebakan
++            </Button>
++          </div>
++        </div>
++      </Modal>
++    </div>
++  );
++};
++
++export default PassPlayVotingView;
+diff --git a/client/src/components/game/index.ts b/client/src/components/game/index.ts
+index 53e6444..17a573a 100644
+--- a/client/src/components/game/index.ts
++++ b/client/src/components/game/index.ts
+@@ -1,3 +1,5 @@
+ export * from './AvatarPicker';
+ export * from './SecretCard';
+ export * from './CountdownTimer';
++export * from './PassPlaySecretView';
++export * from './PassPlayVotingView';
+diff --git a/client/src/context/PassPlayContext.tsx b/client/src/context/PassPlayContext.tsx
+new file mode 100644
+index 0000000..b6700a2
+--- /dev/null
++++ b/client/src/context/PassPlayContext.tsx
+@@ -0,0 +1,691 @@
++import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
++import { Player, GameSettings, WordPair } from '../types/game.types';
++import { assignRoles, calculateVotes, checkWinCondition, shuffleArray } from '../utils/gameEngine';
++import { getRandomWordPair } from '../data/defaultWordPacks';
++import { isFuzzyMatch } from '../utils/fuzzyMatcher';
++import { getLocalCustomPacks } from '../services/wordPackService';
++
++export type PassPlayPhase =
++  | 'SETUP'
++  | 'REVEAL_PASS'
++  | 'TURN_CLUE'
++  | 'VOTING'
++  | 'MR_WHITE_GUESS'
++  | 'GAME_OVER';
++
++export interface PassPlayContextType {
++  // State
++  players: Player[];
++  phase: PassPlayPhase;
++  currentRevealIndex: number;
++  speakingOrder: string[];
++  currentSpeakerIndex: number;
++  activeSpeakerId: string | null;
++  round: number;
++  wordPair: WordPair | null;
++  settings: GameSettings;
++  winningRole: 'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE' | null;
++  eliminatedPlayer: Player | null;
++  pendingEliminatedPlayer: Player | null;
++  votes: Record<string, string>;
++  isTieLastRound: boolean;
++  tieMessage: string | null;
++  mrWhiteGuessResult: { guessed: string; isCorrect: boolean } | null;
++
++  // Actions
++  addPlayer: (name: string, avatar: string) => boolean;
++  removePlayer: (playerId: string) => void;
++  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
++  setPlayers: (players: Player[]) => void;
++  updateSettings: (newSettings: Partial<GameSettings>) => void;
++  startPassPlayGame: (customPair?: WordPair) => boolean;
++  nextRevealPlayer: () => void;
++  finishRevealPhase: () => void;
++  nextSpeaker: () => void;
++  startVotingPhase: () => void;
++  castVote: (voterId: string, targetId: string) => void;
++  clearVotes: () => void;
++  processElimination: (targetPlayerId?: string) => {
++    isTie: boolean;
++    eliminatedPlayer: Player | null;
++    needsMrWhiteGuess: boolean;
++    winningRole: 'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE' | null;
++  };
++  submitMrWhiteGuess: (guessedWord: string) => {
++    isCorrect: boolean;
++    winningRole: 'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE' | null;
++  };
++  skipMrWhiteGuess: () => void;
++  rematch: () => void;
++  resetToSetup: () => void;
++}
++
++const DEFAULT_SETTINGS: GameSettings = {
++  category: 'Makanan & Minuman',
++  civilianCount: 3,
++  undercoverCount: 1,
++  mrWhiteCount: 0,
++  turnDurationSeconds: 45,
++  enableMrWhite: false,
++};
++
++const DEFAULT_INITIAL_PLAYERS: Player[] = [
++  { id: 'p1', name: 'Agent Cyber', avatar: '🕵️', isHost: true, isAlive: true, hasVoted: false },
++  { id: 'p2', name: 'Neon Fox', avatar: '🦊', isHost: false, isAlive: true, hasVoted: false },
++  { id: 'p3', name: 'Shadow Byte', avatar: '🤖', isHost: false, isAlive: true, hasVoted: false },
++  { id: 'p4', name: 'Phantom V', avatar: '⚡', isHost: false, isAlive: true, hasVoted: false },
++];
++
++export const PassPlayContext = createContext<PassPlayContextType | null>(null);
++
++export interface PassPlayProviderProps {
++  children: React.ReactNode;
++}
++
++export const PassPlayProvider: React.FC<PassPlayProviderProps> = ({ children }) => {
++  const [players, setPlayers] = useState<Player[]>(() => {
++    try {
++      if (typeof window !== 'undefined' && window.localStorage) {
++        const stored = localStorage.getItem('whatstheword_passplay_roster');
++        if (stored) {
++          const parsed = JSON.parse(stored);
++          if (Array.isArray(parsed) && parsed.length >= 3) {
++            return parsed.map((p: Partial<Player>, idx: number) => ({
++              id: p.id || `p_${Date.now()}_${idx}`,
++              name: p.name || `Pemain ${idx + 1}`,
++              avatar: p.avatar || '🕵️',
++              isHost: idx === 0,
++              isAlive: true,
++              hasVoted: false,
++            }));
++          }
++        }
++      }
++    } catch {
++      // ignore storage error
++    }
++    return DEFAULT_INITIAL_PLAYERS;
++  });
++
++  const [settings, setSettings] = useState<GameSettings>(() => {
++    try {
++      if (typeof window !== 'undefined' && window.localStorage) {
++        const stored = localStorage.getItem('whatstheword_passplay_settings');
++        if (stored) {
++          const parsed = JSON.parse(stored);
++          return { ...DEFAULT_SETTINGS, ...parsed };
++        }
++      }
++    } catch {
++      // ignore
++    }
++    return DEFAULT_SETTINGS;
++  });
++
++  const [phase, setPhase] = useState<PassPlayPhase>('SETUP');
++  const [currentRevealIndex, setCurrentRevealIndex] = useState<number>(0);
++  const [speakingOrder, setSpeakingOrder] = useState<string[]>([]);
++  const [currentSpeakerIndex, setCurrentSpeakerIndex] = useState<number>(0);
++  const [round, setRound] = useState<number>(1);
++  const [wordPair, setWordPair] = useState<WordPair | null>(null);
++  const [winningRole, setWinningRole] = useState<'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE' | null>(null);
++  const [eliminatedPlayer, setEliminatedPlayer] = useState<Player | null>(null);
++  const [pendingEliminatedPlayer, setPendingEliminatedPlayer] = useState<Player | null>(null);
++  const [votes, setVotes] = useState<Record<string, string>>({});
++  const [isTieLastRound, setIsTieLastRound] = useState<boolean>(false);
++  const [tieMessage, setTieMessage] = useState<string | null>(null);
++  const [mrWhiteGuessResult, setMrWhiteGuessResult] = useState<{ guessed: string; isCorrect: boolean } | null>(null);
++
++  // Sync roster and settings to localStorage
++  useEffect(() => {
++    try {
++      if (typeof window !== 'undefined' && window.localStorage) {
++        const sanitizedRoster = players.map(({ id, name, avatar, isHost }) => ({
++          id,
++          name,
++          avatar,
++          isHost,
++        }));
++        localStorage.setItem('whatstheword_passplay_roster', JSON.stringify(sanitizedRoster));
++      }
++    } catch {
++      // ignore
++    }
++  }, [players]);
++
++  useEffect(() => {
++    try {
++      if (typeof window !== 'undefined' && window.localStorage) {
++        localStorage.setItem('whatstheword_passplay_settings', JSON.stringify(settings));
++      }
++    } catch {
++      // ignore
++    }
++  }, [settings]);
++
++  // Keep role counts in sync with player count in setup
++  useEffect(() => {
++    if (phase !== 'SETUP') return;
++
++    const total = players.length;
++    const mrWhite = settings.enableMrWhite ? Math.min(settings.mrWhiteCount, 1) : 0;
++    // max undercovers should not exceed total - 2
++    const maxUndercover = Math.max(1, Math.floor((total - mrWhite - 1) / 2));
++    const safeUndercover = Math.min(Math.max(1, settings.undercoverCount), maxUndercover);
++    const civilian = total - safeUndercover - mrWhite;
++
++    if (
++      settings.undercoverCount !== safeUndercover ||
++      settings.mrWhiteCount !== mrWhite ||
++      settings.civilianCount !== civilian
++    ) {
++      setSettings((prev) => ({
++        ...prev,
++        mrWhiteCount: mrWhite,
++        undercoverCount: safeUndercover,
++        civilianCount: Math.max(1, civilian),
++      }));
++    }
++  }, [players.length, settings.enableMrWhite, settings.undercoverCount, settings.mrWhiteCount, phase]);
++
++  const addPlayer = useCallback((name: string, avatar: string): boolean => {
++    const trimmed = name.trim();
++    if (!trimmed) return false;
++
++    setPlayers((prev) => {
++      if (prev.length >= 20) return prev;
++      const newPlayer: Player = {
++        id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
++        name: trimmed,
++        avatar: avatar || '🕵️',
++        isHost: prev.length === 0,
++        isAlive: true,
++        hasVoted: false,
++      };
++      return [...prev, newPlayer];
++    });
++    return true;
++  }, []);
++
++  const removePlayer = useCallback((playerId: string) => {
++    setPlayers((prev) => {
++      if (prev.length <= 3) return prev; // Min 3 players
++      const filtered = prev.filter((p) => p.id !== playerId);
++      if (filtered.length > 0 && !filtered.some((p) => p.isHost)) {
++        filtered[0].isHost = true;
++      }
++      return filtered;
++    });
++  }, []);
++
++  const updatePlayer = useCallback((playerId: string, updates: Partial<Player>) => {
++    setPlayers((prev) =>
++      prev.map((p) => (p.id === playerId ? { ...p, ...updates } : p))
++    );
++  }, []);
++
++  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
++    setSettings((prev) => ({ ...prev, ...newSettings }));
++  }, []);
++
++  // Choose a random or custom word pair based on current settings
++  const pickWordPair = useCallback((customPair?: WordPair): WordPair => {
++    if (customPair) return customPair;
++    if (settings.customWordPair) return settings.customWordPair;
++
++    // Check if category matches a local custom pack
++    const customPacks = getLocalCustomPacks();
++    const matchingCustomPack = customPacks.find((cp) => cp.title === settings.category || cp.id === settings.category);
++    if (matchingCustomPack && matchingCustomPack.wordPairs && matchingCustomPack.wordPairs.length > 0) {
++      const idx = Math.floor(Math.random() * matchingCustomPack.wordPairs.length);
++      return matchingCustomPack.wordPairs[idx];
++    }
++
++    return getRandomWordPair(settings.category);
++  }, [settings.category, settings.customWordPair]);
++
++  // Start Pass & Play Game
++  const startPassPlayGame = useCallback((customPair?: WordPair): boolean => {
++    if (players.length < 3) return false;
++
++    const selectedWordPair = pickWordPair(customPair);
++    setWordPair(selectedWordPair);
++
++    // Calculate verified role counts
++    const total = players.length;
++    const mrWhite = settings.enableMrWhite ? Math.min(settings.mrWhiteCount, 1) : 0;
++    const undercover = Math.min(Math.max(1, settings.undercoverCount), Math.floor((total - mrWhite - 1) / 2));
++    const civilian = total - undercover - mrWhite;
++
++    const validSettings: GameSettings = {
++      ...settings,
++      civilianCount: civilian,
++      undercoverCount: undercover,
++      mrWhiteCount: mrWhite,
++    };
++
++    try {
++      const { players: assignedPlayers, speakingOrder: order } = assignRoles(
++        players,
++        validSettings,
++        selectedWordPair
++      );
++
++      setPlayers(assignedPlayers);
++      setSpeakingOrder(order);
++      setCurrentRevealIndex(0);
++      setCurrentSpeakerIndex(0);
++      setRound(1);
++      setWinningRole(null);
++      setEliminatedPlayer(null);
++      setPendingEliminatedPlayer(null);
++      setVotes({});
++      setIsTieLastRound(false);
++      setTieMessage(null);
++      setMrWhiteGuessResult(null);
++      setPhase('REVEAL_PASS');
++      return true;
++    } catch (err) {
++      console.error('Failed to start pass and play game:', err);
++      return false;
++    }
++  }, [players, settings, pickWordPair]);
++
++  const nextRevealPlayer = useCallback(() => {
++    setCurrentRevealIndex((prev) => {
++      const next = prev + 1;
++      return next;
++    });
++  }, []);
++
++  const finishRevealPhase = useCallback(() => {
++    // Alive speaking order
++    const aliveSpeakerIds = speakingOrder.filter(
++      (id) => players.find((p) => p.id === id)?.isAlive !== false
++    );
++    setSpeakingOrder(aliveSpeakerIds.length > 0 ? aliveSpeakerIds : players.map((p) => p.id));
++    setCurrentSpeakerIndex(0);
++    setPhase('TURN_CLUE');
++  }, [speakingOrder, players]);
++
++  const activeSpeakerId = useMemo(() => {
++    if (phase !== 'TURN_CLUE') return null;
++    const aliveSpeakers = speakingOrder.filter(
++      (id) => players.find((p) => p.id === id)?.isAlive !== false
++    );
++    if (aliveSpeakers.length === 0) return null;
++    return aliveSpeakers[currentSpeakerIndex % aliveSpeakers.length] || null;
++  }, [phase, speakingOrder, players, currentSpeakerIndex]);
++
++  const nextSpeaker = useCallback(() => {
++    const aliveSpeakers = speakingOrder.filter(
++      (id) => players.find((p) => p.id === id)?.isAlive !== false
++    );
++
++    if (currentSpeakerIndex + 1 >= aliveSpeakers.length) {
++      // Everyone gave their clue -> Transition to Voting
++      setPhase('VOTING');
++      setCurrentSpeakerIndex(0);
++      setVotes({});
++    } else {
++      setCurrentSpeakerIndex((prev) => prev + 1);
++    }
++  }, [speakingOrder, players, currentSpeakerIndex]);
++
++  const startVotingPhase = useCallback(() => {
++    setPhase('VOTING');
++    setVotes({});
++  }, []);
++
++  const castVote = useCallback((voterId: string, targetId: string) => {
++    setVotes((prev) => ({
++      ...prev,
++      [voterId]: targetId,
++    }));
++    setPlayers((prev) =>
++      prev.map((p) =>
++        p.id === voterId ? { ...p, hasVoted: true, votedTargetId: targetId } : p
++      )
++    );
++  }, []);
++
++  const clearVotes = useCallback(() => {
++    setVotes({});
++    setPlayers((prev) =>
++      prev.map((p) => ({ ...p, hasVoted: false, votedTargetId: undefined }))
++    );
++  }, []);
++
++  // Process elimination from vote tally OR direct selection
++  const processElimination = useCallback(
++    (targetPlayerId?: string): {
++      isTie: boolean;
++      eliminatedPlayer: Player | null;
++      needsMrWhiteGuess: boolean;
++      winningRole: 'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE' | null;
++    } => {
++      let eliminatedId: string | null = null;
++      let isTie = false;
++
++      if (targetPlayerId) {
++        eliminatedId = targetPlayerId;
++      } else {
++        const result = calculateVotes(votes, players);
++        isTie = result.isTie;
++        eliminatedId = result.eliminatedPlayerId;
++      }
++
++      // Handle Tie
++      if (isTie || !eliminatedId) {
++        setIsTieLastRound(true);
++        setTieMessage('Hasil voting seri (Tie)! Tidak ada pemain yang tereliminasi pada ronde ini.');
++        // Next round
++        setRound((prev) => prev + 1);
++        setSpeakingOrder((prev) => shuffleArray(prev));
++        setCurrentSpeakerIndex(0);
++        clearVotes();
++        setPhase('TURN_CLUE');
++
++        return {
++          isTie: true,
++          eliminatedPlayer: null,
++          needsMrWhiteGuess: false,
++          winningRole: null,
++        };
++      }
++
++      setIsTieLastRound(false);
++      setTieMessage(null);
++
++      const targetPlayer = players.find((p) => p.id === eliminatedId);
++      if (!targetPlayer) {
++        return {
++          isTie: false,
++          eliminatedPlayer: null,
++          needsMrWhiteGuess: false,
++          winningRole: null,
++        };
++      }
++
++      // Check if target is Mr. White -> Trigger Guess Intercept
++      if (targetPlayer.role === 'MR_WHITE') {
++        setPendingEliminatedPlayer(targetPlayer);
++        setPhase('MR_WHITE_GUESS');
++        return {
++          isTie: false,
++          eliminatedPlayer: targetPlayer,
++          needsMrWhiteGuess: true,
++          winningRole: null,
++        };
++      }
++
++      // Mark player eliminated
++      const updatedPlayers = players.map((p) =>
++        p.id === eliminatedId ? { ...p, isAlive: false } : p
++      );
++      setPlayers(updatedPlayers);
++      setEliminatedPlayer(targetPlayer);
++
++      // Check victory condition
++      const winner = checkWinCondition(updatedPlayers);
++      if (winner) {
++        setWinningRole(winner);
++        setPhase('GAME_OVER');
++        return {
++          isTie: false,
++          eliminatedPlayer: targetPlayer,
++          needsMrWhiteGuess: false,
++          winningRole: winner,
++        };
++      }
++
++      // Game continues to next round
++      setRound((prev) => prev + 1);
++      const remainingAliveIds = updatedPlayers.filter((p) => p.isAlive).map((p) => p.id);
++      setSpeakingOrder(shuffleArray(remainingAliveIds));
++      setCurrentSpeakerIndex(0);
++      clearVotes();
++      setPhase('TURN_CLUE');
++
++      return {
++        isTie: false,
++        eliminatedPlayer: targetPlayer,
++        needsMrWhiteGuess: false,
++        winningRole: null,
++      };
++    },
++    [players, votes, clearVotes]
++  );
++
++  // Mr. White Guess submission
++  const submitMrWhiteGuess = useCallback(
++    (guessedWord: string): {
++      isCorrect: boolean;
++      winningRole: 'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE' | null;
++    } => {
++      if (!wordPair || !pendingEliminatedPlayer) {
++        return { isCorrect: false, winningRole: null };
++      }
++
++      const isCorrect = isFuzzyMatch(guessedWord, wordPair.civilianWord);
++      setMrWhiteGuessResult({ guessed: guessedWord, isCorrect });
++
++      if (isCorrect) {
++        // Mr. White Wins Immediately!
++        setWinningRole('MR_WHITE');
++        setPhase('GAME_OVER');
++        return { isCorrect: true, winningRole: 'MR_WHITE' };
++      }
++
++      // Wrong Guess -> Mr. White is eliminated
++      const updatedPlayers = players.map((p) =>
++        p.id === pendingEliminatedPlayer.id ? { ...p, isAlive: false } : p
++      );
++      setPlayers(updatedPlayers);
++      setEliminatedPlayer(pendingEliminatedPlayer);
++      setPendingEliminatedPlayer(null);
++
++      // Check if another team wins now
++      const winner = checkWinCondition(updatedPlayers);
++      if (winner) {
++        setWinningRole(winner);
++        setPhase('GAME_OVER');
++        return { isCorrect: false, winningRole: winner };
++      }
++
++      // Otherwise game continues
++      setRound((prev) => prev + 1);
++      const remainingAliveIds = updatedPlayers.filter((p) => p.isAlive).map((p) => p.id);
++      setSpeakingOrder(shuffleArray(remainingAliveIds));
++      setCurrentSpeakerIndex(0);
++      clearVotes();
++      setPhase('TURN_CLUE');
++
++      return { isCorrect: false, winningRole: null };
++    },
++    [wordPair, pendingEliminatedPlayer, players, clearVotes]
++  );
++
++  const skipMrWhiteGuess = useCallback(() => {
++    if (!pendingEliminatedPlayer) return;
++
++    // Eliminate Mr. White
++    const updatedPlayers = players.map((p) =>
++      p.id === pendingEliminatedPlayer.id ? { ...p, isAlive: false } : p
++    );
++    setPlayers(updatedPlayers);
++    setEliminatedPlayer(pendingEliminatedPlayer);
++    setPendingEliminatedPlayer(null);
++
++    const winner = checkWinCondition(updatedPlayers);
++    if (winner) {
++      setWinningRole(winner);
++      setPhase('GAME_OVER');
++      return;
++    }
++
++    setRound((prev) => prev + 1);
++    const remainingAliveIds = updatedPlayers.filter((p) => p.isAlive).map((p) => p.id);
++    setSpeakingOrder(shuffleArray(remainingAliveIds));
++    setCurrentSpeakerIndex(0);
++    clearVotes();
++    setPhase('TURN_CLUE');
++  }, [pendingEliminatedPlayer, players, clearVotes]);
++
++  // Rematch with same players roster
++  const rematch = useCallback(() => {
++    const newPair = pickWordPair();
++    setWordPair(newPair);
++
++    // Reset players alive status and roles
++    const total = players.length;
++    const mrWhite = settings.enableMrWhite ? Math.min(settings.mrWhiteCount, 1) : 0;
++    const undercover = Math.min(Math.max(1, settings.undercoverCount), Math.floor((total - mrWhite - 1) / 2));
++    const civilian = total - undercover - mrWhite;
++
++    const validSettings: GameSettings = {
++      ...settings,
++      civilianCount: civilian,
++      undercoverCount: undercover,
++      mrWhiteCount: mrWhite,
++    };
++
++    const resetRoster = players.map((p) => ({
++      ...p,
++      isAlive: true,
++      hasVoted: false,
++      votedTargetId: undefined,
++      isSpeaking: false,
++    }));
++
++    try {
++      const { players: assignedPlayers, speakingOrder: order } = assignRoles(
++        resetRoster,
++        validSettings,
++        newPair
++      );
++
++      setPlayers(assignedPlayers);
++      setSpeakingOrder(order);
++      setCurrentRevealIndex(0);
++      setCurrentSpeakerIndex(0);
++      setRound(1);
++      setWinningRole(null);
++      setEliminatedPlayer(null);
++      setPendingEliminatedPlayer(null);
++      setVotes({});
++      setIsTieLastRound(false);
++      setTieMessage(null);
++      setMrWhiteGuessResult(null);
++      setPhase('REVEAL_PASS');
++    } catch (err) {
++      console.error('Failed to restart match:', err);
++    }
++  }, [players, settings, pickWordPair]);
++
++  // Reset back to Setup
++  const resetToSetup = useCallback(() => {
++    setPhase('SETUP');
++    setWinningRole(null);
++    setEliminatedPlayer(null);
++    setPendingEliminatedPlayer(null);
++    setVotes({});
++    setIsTieLastRound(false);
++    setTieMessage(null);
++    setMrWhiteGuessResult(null);
++    setPlayers((prev) =>
++      prev.map((p) => ({
++        ...p,
++        isAlive: true,
++        hasVoted: false,
++        votedTargetId: undefined,
++        role: undefined,
++        word: undefined,
++      }))
++    );
++  }, []);
++
++  const value = useMemo<PassPlayContextType>(
++    () => ({
++      players,
++      phase,
++      currentRevealIndex,
++      speakingOrder,
++      currentSpeakerIndex,
++      activeSpeakerId,
++      round,
++      wordPair,
++      settings,
++      winningRole,
++      eliminatedPlayer,
++      pendingEliminatedPlayer,
++      votes,
++      isTieLastRound,
++      tieMessage,
++      mrWhiteGuessResult,
++      addPlayer,
++      removePlayer,
++      updatePlayer,
++      setPlayers,
++      updateSettings,
++      startPassPlayGame,
++      nextRevealPlayer,
++      finishRevealPhase,
++      nextSpeaker,
++      startVotingPhase,
++      castVote,
++      clearVotes,
++      processElimination,
++      submitMrWhiteGuess,
++      skipMrWhiteGuess,
++      rematch,
++      resetToSetup,
++    }),
++    [
++      players,
++      phase,
++      currentRevealIndex,
++      speakingOrder,
++      currentSpeakerIndex,
++      activeSpeakerId,
++      round,
++      wordPair,
++      settings,
++      winningRole,
++      eliminatedPlayer,
++      pendingEliminatedPlayer,
++      votes,
++      isTieLastRound,
++      tieMessage,
++      mrWhiteGuessResult,
++      addPlayer,
++      removePlayer,
++      updatePlayer,
++      updateSettings,
++      startPassPlayGame,
++      nextRevealPlayer,
++      finishRevealPhase,
++      nextSpeaker,
++      startVotingPhase,
++      castVote,
++      clearVotes,
++      processElimination,
++      submitMrWhiteGuess,
++      skipMrWhiteGuess,
++      rematch,
++      resetToSetup,
++    ]
++  );
++
++  return <PassPlayContext.Provider value={value}>{children}</PassPlayContext.Provider>;
++};
++
++export const usePassPlay = (): PassPlayContextType => {
++  const context = useContext(PassPlayContext);
++  if (!context) {
++    throw new Error('usePassPlay must be used within a PassPlayProvider');
++  }
++  return context;
++};
++
++export default PassPlayContext;
+diff --git a/client/src/pages/PassPlayGamePage.tsx b/client/src/pages/PassPlayGamePage.tsx
+new file mode 100644
+index 0000000..829f93d
+--- /dev/null
++++ b/client/src/pages/PassPlayGamePage.tsx
+@@ -0,0 +1,295 @@
++import React, { useEffect } from 'react';
++import { motion, AnimatePresence } from 'motion/react';
++import {
++  Trophy,
++  RotateCcw,
++  Settings,
++  Crown,
++  KeyRound,
++  Users,
++} from 'lucide-react';
++import { usePassPlay } from '../context/PassPlayContext';
++import { useGameSound } from '../hooks/useGameSound';
++import { Header } from '../components/common/Header';
++import { Button } from '../components/common/Button';
++import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
++import { Badge, RoleBadge } from '../components/common/Badge';
++import { PassPlaySecretView } from '../components/game/PassPlaySecretView';
++import { PassPlayVotingView } from '../components/game/PassPlayVotingView';
++
++export interface PassPlayGamePageProps {
++  onBackToHome?: () => void;
++}
++
++export const PassPlayGamePage: React.FC<PassPlayGamePageProps> = ({ onBackToHome }) => {
++  const {
++    phase,
++    players,
++    wordPair,
++    winningRole,
++    settings,
++    round,
++    rematch,
++    resetToSetup,
++  } = usePassPlay();
++
++  const { playVictory } = useGameSound();
++
++  // Play fanfare sound upon entering GAME_OVER
++  useEffect(() => {
++    if (phase === 'GAME_OVER') {
++      try {
++        playVictory();
++      } catch {
++        // ignore
++      }
++    }
++  }, [phase, playVictory]);
++
++  const handleBack = () => {
++    if (confirm('Apakah kamu yakin ingin keluar ke menu pengaturan?')) {
++      resetToSetup();
++      onBackToHome?.();
++    }
++  };
++
++  return (
++    <div className="min-h-screen bg-[#080c16] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
++      {/* Header */}
++      <Header
++        title="PASS & PLAY"
++        subtitle={`KATEGORI: ${settings.category}`}
++        onBack={handleBack}
++        showBack
++        backLabel="Keluar"
++        rightElement={
++          phase !== 'SETUP' && (
++            <Badge variant="cyan" size="sm" className="hidden sm:inline-flex font-mono">
++              Ronde {round}
++            </Badge>
++          )
++        }
++      />
++
++      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
++        <AnimatePresence mode="wait">
++          {/* 1. REVEAL PASS PHASE */}
++          {phase === 'REVEAL_PASS' && (
++            <motion.div
++              key="reveal-phase"
++              initial={{ opacity: 0, y: 12 }}
++              animate={{ opacity: 1, y: 0 }}
++              exit={{ opacity: 0, y: -12 }}
++              transition={{ duration: 0.2 }}
++              className="w-full"
++            >
++              <PassPlaySecretView />
++            </motion.div>
++          )}
++
++          {/* 2. TURN CLUE / VOTING / MR WHITE INTERCEPT PHASE */}
++          {(phase === 'TURN_CLUE' || phase === 'VOTING' || phase === 'MR_WHITE_GUESS') && (
++            <motion.div
++              key="voting-phase"
++              initial={{ opacity: 0, y: 12 }}
++              animate={{ opacity: 1, y: 0 }}
++              exit={{ opacity: 0, y: -12 }}
++              transition={{ duration: 0.2 }}
++              className="w-full py-4"
++            >
++              <PassPlayVotingView />
++            </motion.div>
++          )}
++
++          {/* 3. GAME OVER SUMMARY SCREEN */}
++          {phase === 'GAME_OVER' && (
++            <motion.div
++              key="gameover-phase"
++              initial={{ opacity: 0, scale: 0.92, y: 20 }}
++              animate={{ opacity: 1, scale: 1, y: 0 }}
++              exit={{ opacity: 0, scale: 0.95 }}
++              transition={{ type: 'spring', damping: 20, stiffness: 280 }}
++              className="w-full space-y-6 py-4"
++            >
++              {/* Victory Celebration Banner */}
++              <div className="text-center space-y-4 p-8 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-white/10 shadow-2xl relative overflow-hidden">
++                {/* Glow aura */}
++                <div
++                  className={`absolute inset-0 bg-radial-gradient pointer-events-none opacity-20 ${
++                    winningRole === 'CIVILIAN'
++                      ? 'bg-cyan-500'
++                      : winningRole === 'UNDERCOVER'
++                      ? 'bg-rose-500'
++                      : 'bg-purple-500'
++                  }`}
++                />
++
++                <div className="relative z-10 flex flex-col items-center space-y-3">
++                  <div
++                    className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-xl animate-bounce ${
++                      winningRole === 'CIVILIAN'
++                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 shadow-cyan-500/30'
++                        : winningRole === 'UNDERCOVER'
++                        ? 'bg-rose-500/20 text-rose-400 border border-rose-400/40 shadow-rose-500/30'
++                        : 'bg-purple-500/20 text-purple-400 border border-purple-400/40 shadow-purple-500/30'
++                    }`}
++                  >
++                    <Trophy className="w-10 h-10" />
++                  </div>
++
++                  <div className="space-y-1">
++                    <span className="text-xs font-mono tracking-widest uppercase font-bold text-slate-400">
++                      PERMAINAN SELESAI
++                    </span>
++                    <h1
++                      className={`text-3xl sm:text-5xl font-black font-display tracking-tight uppercase ${
++                        winningRole === 'CIVILIAN'
++                          ? 'text-transparent bg-gradient-to-r from-cyan-300 via-white to-cyan-400 bg-clip-text'
++                          : winningRole === 'UNDERCOVER'
++                          ? 'text-transparent bg-gradient-to-r from-rose-300 via-white to-rose-400 bg-clip-text'
++                          : 'text-transparent bg-gradient-to-r from-purple-300 via-white to-purple-400 bg-clip-text'
++                      }`}
++                    >
++                      {winningRole === 'CIVILIAN'
++                        ? 'Kemenangan Warga!'
++                        : winningRole === 'UNDERCOVER'
++                        ? 'Kemenangan Impostor!'
++                        : 'Kemenangan Buta Kata!'}
++                    </h1>
++                    <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
++                      {winningRole === 'CIVILIAN'
++                        ? 'Warga berhasil mengeliminasi seluruh Impostor dan Buta Kata!'
++                        : winningRole === 'UNDERCOVER'
++                        ? 'Impostor berhasil menyamarkan diri dan menguasai permainan!'
++                        : 'Buta Kata (Mr. White) berhasil bertahan atau menebak kata rahasia Warga!'}
++                    </p>
++                  </div>
++                </div>
++              </div>
++
++              {/* Secret Words Summary Card */}
++              {wordPair && (
++                <Card glow="cyan" className="p-4 sm:p-6">
++                  <CardHeader className="p-0 pb-3 border-b border-white/10">
++                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
++                      <KeyRound className="w-5 h-5 text-cyan-400" />
++                      Pengungkapan Kata Rahasia
++                    </CardTitle>
++                  </CardHeader>
++                  <CardContent className="p-0 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
++                    <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-center space-y-1">
++                      <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
++                        KATA WARGA (CIVILIAN)
++                      </span>
++                      <p className="text-2xl font-black font-display text-white tracking-wide">
++                        {wordPair.civilianWord}
++                      </p>
++                    </div>
++
++                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-1">
++                      <span className="text-[11px] font-mono text-rose-400 font-bold uppercase tracking-wider">
++                        KATA IMPOSTOR (UNDERCOVER)
++                      </span>
++                      <p className="text-2xl font-black font-display text-white tracking-wide">
++                        {wordPair.undercoverWord}
++                      </p>
++                    </div>
++                  </CardContent>
++                </Card>
++              )}
++
++              {/* All Players Role Reveal List */}
++              <Card className="p-4 sm:p-6 space-y-4">
++                <CardHeader className="p-0 pb-3 border-b border-white/10 flex flex-row items-center justify-between">
++                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
++                    <Users className="w-5 h-5 text-cyan-400" />
++                    Daftar Lengkap Peran Pemain
++                  </CardTitle>
++                  <span className="text-xs font-mono text-slate-400">
++                    {players.length} Pemain Total
++                  </span>
++                </CardHeader>
++
++                <CardContent className="p-0 space-y-2.5">
++                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
++                    {players.map((p) => {
++                      const isWinner =
++                        p.role === winningRole ||
++                        (winningRole === 'CIVILIAN' && p.role === 'CIVILIAN') ||
++                        (winningRole === 'UNDERCOVER' && p.role === 'UNDERCOVER') ||
++                        (winningRole === 'MR_WHITE' && p.role === 'MR_WHITE');
++
++                      return (
++                        <div
++                          key={p.id}
++                          className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
++                            isWinner
++                              ? 'bg-slate-900/90 border-cyan-500/40 shadow-sm'
++                              : 'bg-slate-950/60 border-white/5 opacity-75'
++                          }`}
++                        >
++                          <div className="flex items-center gap-3">
++                            <span className="text-3xl">{p.avatar}</span>
++                            <div>
++                              <div className="flex items-center gap-2">
++                                <span className="text-sm font-bold text-white">
++                                  {p.name}
++                                </span>
++                                {isWinner && (
++                                  <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
++                                )}
++                              </div>
++                              <span className="text-xs text-slate-400">
++                                Kata: <strong className="text-slate-200">{p.word || '(Tanpa Kata)'}</strong>
++                              </span>
++                            </div>
++                          </div>
++
++                          <div className="flex flex-col items-end gap-1">
++                            {p.role && <RoleBadge role={p.role} size="sm" />}
++                            <span
++                              className={`text-[10px] font-mono font-semibold ${
++                                p.isAlive ? 'text-emerald-400' : 'text-rose-400 line-through'
++                              }`}
++                            >
++                              {p.isAlive ? 'Selamat (Alive)' : 'Tereliminasi'}
++                            </span>
++                          </div>
++                        </div>
++                      );
++                    })}
++                  </div>
++                </CardContent>
++              </Card>
++
++              {/* Action Buttons: Rematch & Back to Setup */}
++              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
++                <Button
++                  variant="secondary"
++                  size="lg"
++                  onClick={resetToSetup}
++                  leftIcon={<Settings className="w-5 h-5" />}
++                  className="py-4 text-base"
++                >
++                  Ubah Pengaturan (Setup)
++                </Button>
++
++                <Button
++                  variant="primary"
++                  size="lg"
++                  onClick={rematch}
++                  leftIcon={<RotateCcw className="w-5 h-5" />}
++                  className="shadow-xl shadow-cyan-500/30 py-4 text-base font-bold"
++                >
++                  Main Lagi (Rematch)
++                </Button>
++              </div>
++            </motion.div>
++          )}
++        </AnimatePresence>
++      </main>
++    </div>
++  );
++};
++
++export default PassPlayGamePage;
+diff --git a/client/src/pages/PassPlaySetupPage.tsx b/client/src/pages/PassPlaySetupPage.tsx
+new file mode 100644
+index 0000000..10d280d
+--- /dev/null
++++ b/client/src/pages/PassPlaySetupPage.tsx
+@@ -0,0 +1,493 @@
++import React, { useState, useEffect } from 'react';
++import { motion, AnimatePresence } from 'motion/react';
++import {
++  Users,
++  UserPlus,
++  Trash2,
++  Play,
++  Layers,
++  Clock,
++  Shield,
++  EyeOff,
++  HelpCircle,
++  Plus,
++  Sparkles,
++  Edit2,
++  Check,
++} from 'lucide-react';
++import { usePassPlay } from '../context/PassPlayContext';
++import { Button } from '../components/common/Button';
++import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
++import { Badge } from '../components/common/Badge';
++import { Modal } from '../components/common/Modal';
++import { AvatarPicker, PRESET_AVATARS } from '../components/game/AvatarPicker';
++import { CATEGORIES } from '../data/defaultWordPacks';
++import { getLocalCustomPacks } from '../services/wordPackService';
++import { CustomWordPack } from '../types/game.types';
++import { Header } from '../components/common/Header';
++
++const TURN_DURATION_OPTIONS = [
++  { label: '30s', value: 30, desc: 'Cepat & Intensif' },
++  { label: '45s', value: 45, desc: 'Standar Turn' },
++  { label: '60s', value: 60, desc: 'Santai & Leluasa' },
++  { label: 'Bebas', value: 0, desc: 'Tanpa Batasan Waktu' },
++];
++
++export interface PassPlaySetupPageProps {
++  onBack?: () => void;
++}
++
++export const PassPlaySetupPage: React.FC<PassPlaySetupPageProps> = ({ onBack }) => {
++  const {
++    players,
++    settings,
++    addPlayer,
++    removePlayer,
++    updatePlayer,
++    updateSettings,
++    startPassPlayGame,
++  } = usePassPlay();
++
++  // Add/Edit Player Modal State
++  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
++  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
++  const [modalName, setModalName] = useState('');
++  const [modalAvatar, setModalAvatar] = useState('🕵️');
++  const [customPacks, setCustomPacks] = useState<CustomWordPack[]>([]);
++
++  // Load custom packs from localStorage
++  useEffect(() => {
++    try {
++      const packs = getLocalCustomPacks();
++      setCustomPacks(packs);
++    } catch {
++      // ignore
++    }
++  }, []);
++
++  const handleOpenAddModal = () => {
++    setEditingPlayerId(null);
++    // Pick random avatar not yet chosen if possible
++    const usedAvatars = new Set(players.map((p) => p.avatar));
++    const available = PRESET_AVATARS.filter((a) => !usedAvatars.has(a.emoji));
++    const defaultAvatar = available.length > 0 ? available[0].emoji : PRESET_AVATARS[0].emoji;
++
++    setModalAvatar(defaultAvatar);
++    setModalName(`Pemain ${players.length + 1}`);
++    setIsAddModalOpen(true);
++  };
++
++  const handleOpenEditModal = (playerId: string) => {
++    const target = players.find((p) => p.id === playerId);
++    if (!target) return;
++    setEditingPlayerId(playerId);
++    setModalName(target.name);
++    setModalAvatar(target.avatar);
++    setIsAddModalOpen(true);
++  };
++
++  const handleSaveModalPlayer = () => {
++    if (!modalName.trim()) return;
++
++    if (editingPlayerId) {
++      updatePlayer(editingPlayerId, {
++        name: modalName.trim(),
++        avatar: modalAvatar,
++      });
++    } else {
++      addPlayer(modalName.trim(), modalAvatar);
++    }
++    setIsAddModalOpen(false);
++  };
++
++  const handleQuickAdd = () => {
++    const usedAvatars = new Set(players.map((p) => p.avatar));
++    const available = PRESET_AVATARS.filter((a) => !usedAvatars.has(a.emoji));
++    const avatar = available.length > 0
++      ? available[Math.floor(Math.random() * available.length)].emoji
++      : PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)].emoji;
++
++    addPlayer(`Pemain ${players.length + 1}`, avatar);
++  };
++
++  // Role configuration constraints
++  const totalPlayers = players.length;
++  const mrWhiteCount = settings.enableMrWhite ? 1 : 0;
++  const maxUndercover = Math.max(1, Math.floor((totalPlayers - mrWhiteCount - 1) / 2));
++  const currentUndercover = Math.min(Math.max(1, settings.undercoverCount), maxUndercover);
++  const currentCivilian = Math.max(1, totalPlayers - currentUndercover - mrWhiteCount);
++
++  const handleUndercoverChange = (delta: number) => {
++    const next = Math.max(1, Math.min(maxUndercover, currentUndercover + delta));
++    updateSettings({
++      undercoverCount: next,
++      civilianCount: totalPlayers - next - mrWhiteCount,
++    });
++  };
++
++  const handleToggleMrWhite = () => {
++    const nextEnable = !settings.enableMrWhite;
++    const nextMrWhite = nextEnable ? 1 : 0;
++    const nextMaxUndercover = Math.max(1, Math.floor((totalPlayers - nextMrWhite - 1) / 2));
++    const nextUndercover = Math.min(currentUndercover, nextMaxUndercover);
++    const nextCivilian = totalPlayers - nextUndercover - nextMrWhite;
++
++    updateSettings({
++      enableMrWhite: nextEnable,
++      mrWhiteCount: nextMrWhite,
++      undercoverCount: nextUndercover,
++      civilianCount: nextCivilian,
++    });
++  };
++
++  const handleStartGame = () => {
++    const success = startPassPlayGame();
++    if (!success) {
++      alert('Minimal 3 pemain untuk memulai permainan!');
++    }
++  };
++
++  return (
++    <div className="min-h-screen bg-[#080c16] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
++      <Header
++        title="PASS & PLAY"
++        subtitle="1 HP OFFLINE MODE"
++        onBack={onBack}
++        showBack={!!onBack}
++        backLabel="Menu Utama"
++      />
++
++      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
++        {/* Banner Title */}
++        <div className="text-center space-y-2">
++          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase tracking-wider">
++            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
++            Mode 1 Perangkat Tanpa Kuota / Sinyal
++          </div>
++          <h1 className="text-2xl sm:text-4xl font-black font-display tracking-tight bg-gradient-to-r from-cyan-300 via-white to-violet-300 bg-clip-text text-transparent">
++            Pengaturan Game Pass & Play
++          </h1>
++          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto font-sans">
++            Kumpulkan teman-temanmu dalam 1 ruangan, oper HP secara bergiliran untuk melihat kata rahasia, lalu temukan siapa impostornya!
++          </p>
++        </div>
++
++        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
++          {/* Left Column: Player Roster (7 Cols) */}
++          <div className="md:col-span-7 space-y-6">
++            <Card glow="cyan" className="p-4 sm:p-6">
++              <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between border-b border-white/10">
++                <div className="space-y-1">
++                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
++                    <Users className="w-5 h-5 text-cyan-400" />
++                    Daftar Pemain ({players.length}/20)
++                  </CardTitle>
++                  <p className="text-xs text-slate-400">Minimal 3 pemain untuk bermain</p>
++                </div>
++
++                <div className="flex items-center gap-2">
++                  <Button
++                    variant="outline"
++                    size="xs"
++                    onClick={handleQuickAdd}
++                    disabled={players.length >= 20}
++                    className="border-dashed hover:border-cyan-400 text-xs"
++                    title="Tambah Cepat"
++                  >
++                    <Plus className="w-3.5 h-3.5" />
++                    <span className="hidden sm:inline">Cepat</span>
++                  </Button>
++                  <Button
++                    variant="primary"
++                    size="sm"
++                    onClick={handleOpenAddModal}
++                    disabled={players.length >= 20}
++                    leftIcon={<UserPlus className="w-4 h-4" />}
++                  >
++                    Tambah
++                  </Button>
++                </div>
++              </CardHeader>
++
++              <CardContent className="p-0 pt-4">
++                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
++                  <AnimatePresence initial={false}>
++                    {players.map((p, index) => (
++                      <motion.div
++                        key={p.id}
++                        initial={{ opacity: 0, scale: 0.9 }}
++                        animate={{ opacity: 1, scale: 1 }}
++                        exit={{ opacity: 0, scale: 0.8 }}
++                        transition={{ duration: 0.2 }}
++                        className="group flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-950/60 border border-white/10 hover:border-cyan-500/40 hover:bg-slate-900/80 transition-all"
++                      >
++                        <div
++                          onClick={() => handleOpenEditModal(p.id)}
++                          className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
++                          title="Klik untuk ubah nama & avatar"
++                        >
++                          <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform">
++                            {p.avatar}
++                          </span>
++                          <div className="min-w-0 flex flex-col">
++                            <div className="flex items-center gap-1.5">
++                              <span className="text-sm font-semibold text-slate-200 truncate font-sans group-hover:text-cyan-300">
++                                {p.name}
++                              </span>
++                              {p.isHost && (
++                                <Badge variant="amber" size="sm">
++                                  P1
++                                </Badge>
++                              )}
++                            </div>
++                            <span className="text-[10px] font-mono text-slate-500">
++                              Urutan #{index + 1}
++                            </span>
++                          </div>
++                        </div>
++
++                        <div className="flex items-center gap-1">
++                          <button
++                            type="button"
++                            onClick={() => handleOpenEditModal(p.id)}
++                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-all"
++                            title="Edit Pemain"
++                          >
++                            <Edit2 className="w-3.5 h-3.5" />
++                          </button>
++
++                          {players.length > 3 && (
++                            <button
++                              type="button"
++                              onClick={() => removePlayer(p.id)}
++                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
++                              title="Hapus Pemain"
++                            >
++                              <Trash2 className="w-3.5 h-3.5" />
++                            </button>
++                          )}
++                        </div>
++                      </motion.div>
++                    ))}
++                  </AnimatePresence>
++                </div>
++              </CardContent>
++            </Card>
++          </div>
++
++          {/* Right Column: Roles & Game Settings (5 Cols) */}
++          <div className="md:col-span-5 space-y-6">
++            {/* Category Selector */}
++            <Card className="p-4 sm:p-5">
++              <div className="space-y-3">
++                <label className="text-sm font-bold text-slate-200 flex items-center justify-between">
++                  <span className="flex items-center gap-2">
++                    <Layers className="w-4 h-4 text-cyan-400" />
++                    Kategori Kata
++                  </span>
++                  {customPacks.length > 0 && (
++                    <span className="text-[10px] font-mono text-cyan-400">
++                      +{customPacks.length} Pack Kustom
++                    </span>
++                  )}
++                </label>
++
++                <select
++                  value={settings.category}
++                  onChange={(e) => updateSettings({ category: e.target.value })}
++                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-slate-100 text-sm font-medium focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
++                >
++                  <optgroup label="Kategori Resmi">
++                    {CATEGORIES.map((cat) => (
++                      <option key={cat} value={cat}>
++                        {cat}
++                      </option>
++                    ))}
++                  </optgroup>
++
++                  {customPacks.length > 0 && (
++                    <optgroup label="Paket Kustom Saya">
++                      {customPacks.map((cp) => (
++                        <option key={cp.id} value={cp.title}>
++                          📦 {cp.title} ({cp.wordPairs.length} kata)
++                        </option>
++                      ))}
++                    </optgroup>
++                  )}
++                </select>
++              </div>
++            </Card>
++
++            {/* Role Distribution Sliders / Steppers */}
++            <Card className="p-4 sm:p-5 space-y-4">
++              <div className="flex items-center justify-between border-b border-white/10 pb-3">
++                <span className="text-sm font-bold text-slate-200 flex items-center gap-2">
++                  <Shield className="w-4 h-4 text-cyan-400" />
++                  Komposisi Peran
++                </span>
++                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
++                  Total: {totalPlayers} Pemain
++                </span>
++              </div>
++
++              {/* Civilian Row */}
++              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-cyan-500/20">
++                <div className="flex items-center gap-2.5">
++                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
++                    <Shield className="w-4 h-4" />
++                  </div>
++                  <div>
++                    <p className="text-xs font-bold text-cyan-300">Warga (Civilian)</p>
++                    <p className="text-[10px] text-slate-400">Mengetahui kata rahasia asli</p>
++                  </div>
++                </div>
++                <span className="text-base font-mono font-black text-cyan-400 px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
++                  {currentCivilian}
++                </span>
++              </div>
++
++              {/* Undercover Stepper */}
++              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-rose-500/20">
++                <div className="flex items-center gap-2.5">
++                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
++                    <EyeOff className="w-4 h-4" />
++                  </div>
++                  <div>
++                    <p className="text-xs font-bold text-rose-300">Impostor (Undercover)</p>
++                    <p className="text-[10px] text-slate-400">Kata mirip, berbeda sedikit</p>
++                  </div>
++                </div>
++
++                <div className="flex items-center gap-2">
++                  <button
++                    type="button"
++                    onClick={() => handleUndercoverChange(-1)}
++                    disabled={currentUndercover <= 1}
++                    className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 flex items-center justify-center font-bold"
++                  >
++                    -
++                  </button>
++                  <span className="text-base font-mono font-black text-rose-400 min-w-[24px] text-center">
++                    {currentUndercover}
++                  </span>
++                  <button
++                    type="button"
++                    onClick={() => handleUndercoverChange(1)}
++                    disabled={currentUndercover >= maxUndercover}
++                    className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 flex items-center justify-center font-bold"
++                  >
++                    +
++                  </button>
++                </div>
++              </div>
++
++              {/* Mr. White Toggle */}
++              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-purple-500/20">
++                <div className="flex items-center gap-2.5">
++                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
++                    <HelpCircle className="w-4 h-4" />
++                  </div>
++                  <div>
++                    <p className="text-xs font-bold text-purple-300">Buta Kata (Mr. White)</p>
++                    <p className="text-[10px] text-slate-400">Tanpa kata, harus menebak</p>
++                  </div>
++                </div>
++
++                <button
++                  type="button"
++                  onClick={handleToggleMrWhite}
++                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
++                    settings.enableMrWhite
++                      ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_15px_-3px_rgba(168,85,247,0.4)]'
++                      : 'bg-slate-800/80 border-white/10 text-slate-400 hover:text-slate-200'
++                  }`}
++                >
++                  {settings.enableMrWhite ? 'AKTIF (1)' : 'NONAKTIF'}
++                </button>
++              </div>
++            </Card>
++
++            {/* Turn Duration Settings */}
++            <Card className="p-4 sm:p-5 space-y-3">
++              <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
++                <Clock className="w-4 h-4 text-cyan-400" />
++                Durasi Clue per Pemain
++              </label>
++
++              <div className="grid grid-cols-4 gap-2">
++                {TURN_DURATION_OPTIONS.map((opt) => {
++                  const isSelected = settings.turnDurationSeconds === opt.value;
++                  return (
++                    <button
++                      key={opt.value}
++                      type="button"
++                      onClick={() => updateSettings({ turnDurationSeconds: opt.value })}
++                      className={`p-2 rounded-xl text-center border transition-all ${
++                        isSelected
++                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)] font-bold'
++                          : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
++                      }`}
++                      title={opt.desc}
++                    >
++                      <span className="text-xs sm:text-sm font-mono block">{opt.label}</span>
++                    </button>
++                  );
++                })}
++              </div>
++            </Card>
++
++            {/* Start Game Button */}
++            <Button
++              variant="primary"
++              size="xl"
++              fullWidth
++              onClick={handleStartGame}
++              disabled={players.length < 3}
++              leftIcon={<Play className="w-5 h-5 fill-current" />}
++              className="shadow-xl shadow-cyan-500/30"
++            >
++              Mulai Permainan ({players.length} Pemain)
++            </Button>
++          </div>
++        </div>
++      </main>
++
++      {/* Add / Edit Player Modal */}
++      <Modal
++        isOpen={isAddModalOpen}
++        onClose={() => setIsAddModalOpen(false)}
++        title={editingPlayerId ? 'Ubah Profil Pemain' : 'Tambah Pemain Baru'}
++        subtitle="Pilih avatar unik dan masukkan nama pemain"
++        size="md"
++        footer={
++          <div className="flex items-center gap-2 w-full justify-end">
++            <Button variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>
++              Batal
++            </Button>
++            <Button
++              variant="primary"
++              size="sm"
++              onClick={handleSaveModalPlayer}
++              disabled={!modalName.trim()}
++              leftIcon={<Check className="w-4 h-4" />}
++            >
++              Simpan Pemain
++            </Button>
++          </div>
++        }
++      >
++        <div className="space-y-4 pt-1">
++          <AvatarPicker
++            selectedAvatar={modalAvatar}
++            onSelectAvatar={(av) => setModalAvatar(av)}
++            nickname={modalName}
++            onNicknameChange={(name) => setModalName(name)}
++            showNicknameInput
++          />
++        </div>
++      </Modal>
++    </div>
++  );
++};
++
++export default PassPlaySetupPage;
+
+```
diff --git a/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-8-brief.md b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-8-brief.md
new file mode 100644
index 0000000..aec44c2
--- /dev/null
+++ b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-8-brief.md
@@ -0,0 +1,42 @@
+# Task 8 Brief: Online Multi-Device (Socket.io Rooms) Mode
+
+## Goal
+Implement fullstack online multi-device gameplay synchronized via Socket.io in `client/`:
+
+1. `client/src/context/SocketContext.tsx` & `client/src/hooks/useSocket.ts`:
+   - Connects to Socket.io server with auto-reconnection using `localStorage` token.
+   - Dispatches and listens to all server events (`room:created`, `room:updated`, `game:started`, `turn:advanced`, `vote:completed`, `mrwhite:result`, `game:over`, etc.).
+   - Actions: `createRoom`, `joinRoom`, `leaveRoom`, `updateSettings`, `startGame`, `advanceTurn`, `castVote`, `submitMrWhiteGuess`, `rematch`.
+
+2. `client/src/pages/HomePage.tsx`:
+   - Dual-mode landing screen:
+     - Pass & Play card (1 HP Offline).
+     - Online Room card with "Buat Room" (Host setup) and "Gabung Room" (4-digit code + avatar setup) tabs.
+     - Custom Word Pack Creator modal button.
+     - Auto-fill room code from URL query param `?room=XXXX`.
+
+3. `client/src/pages/LobbyPage.tsx`:
+   - Large copyable 4-digit room code and 1-click share URL.
+   - Connected player cards with live animations and host badges.
+   - Host settings: Category selection, role sliders (Civilian, Undercover, Mr. White), turn timer slider, Start Game button (validation $ge 3$ players).
+   - Non-host live synchronized settings preview.
+
+4. `client/src/pages/RoomGamePage.tsx`:
+   - Synchronized Multi-Device game loop:
+     - `ROLE_REVEAL`: Personal secret card for each connected player.
+     - `TURN_PHASE`: Synchronized turn indicator & countdown timer showing who is speaking.
+     - `VOTING`: `<VotingGrid>` with secret ballot selection, live vote submission indicator, instant skip tie handling.
+     - `MR_WHITE_GUESS`: `<MrWhiteModal>` on Mr. White's device with 45s input, suspense screen on other players.
+     - `GAME_OVER`: Synchronized winner announcement, role reveals for all connected players, and Rematch reset back to lobby.
+
+5. `client/src/components/game/VotingGrid.tsx`, `client/src/components/game/MrWhiteModal.tsx`, `client/src/components/lobby/CustomWordPackModal.tsx`.
+
+6. `client/src/App.tsx`:
+   - Router integrating HomePage, PassPlay pages, LobbyPage, and RoomGamePage.
+
+7. Verification:
+   - `npm run typecheck`, `npm test`, and `npm run build:client` passing with zero errors.
+
+## Report Contract
+Write report to: `C:\Users\ASUS\Documents\ALIFKA\PROJECT\whatstheword\.superpowers\sdd\2026-09-02-whatstheword-implementation\task-8-report.md`
+Return: status (DONE / BLOCKED), commits, one-line test summary.
diff --git a/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-8-report.md b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-8-report.md
new file mode 100644
index 0000000..9094c82
--- /dev/null
+++ b/.superpowers/sdd/2026-09-02-whatstheword-implementation/task-8-report.md
@@ -0,0 +1,53 @@
+# Task 8 Report: Online Multi-Device Socket.io Mode Implementation
+
+## Status
+DONE
+
+## Summary of Accomplishments
+Implemented fullstack realtime multi-device gameplay mode synchronized with Socket.io in `client/`:
+
+1. **`client/src/context/SocketContext.tsx` & `client/src/hooks/useSocket.ts`**:
+   - Integrated Socket.io client with auto-reconnection capability using `localStorage` token (`whatstheword_player_token`).
+   - Listeners for all server events: `room:updated`, `game:started`, `turn:timer_sync`, `vote:completed`, `mrwhite:result`, `game:rematch_started`.
+   - Complete set of actions: `createRoom`, `joinRoom`, `leaveRoom`, `updateSettings`, `startGame`, `advanceTurn`, `syncTimerTick`, `castVote`, `submitMrWhiteGuess`, `rematch`.
+
+2. **`client/src/components/lobby/CustomWordPackModal.tsx`**:
+   - 3-tab modal dialog:
+     - "Buat Baru": title, author, category, dynamic pair builder (civilian vs undercover), public/private toggle, and share code generator.
+     - "Impor Kode": 6-character share code lookup with sample word preview and instant selection.
+     - "Koleksi": saved local and community custom word packs list with deletion and 1-click clipboard copy.
+
+3. **`client/src/pages/HomePage.tsx`**:
+   - Dual-mode cyber landing page:
+     - Mode 1: Pass & Play (1 HP Offline).
+     - Mode 2: Online Room with "Buat Room" (Host) and "Gabung Room" (Join with 4-digit code) tabs.
+     - Auto-filling room code from URL query parameter `?room=XXXX` or `?code=XXXX`.
+     - Avatar and nickname selection with persistent localStorage caching.
+     - Custom word pack modal entry point.
+
+4. **`client/src/pages/LobbyPage.tsx`**:
+   - Room code display with 1-click share URL copying.
+   - Connected players list with host badges, status indicators, and animations.
+   - Host settings panel: Category dropdown (official + custom packs), live role distribution sliders, and turn duration slider.
+   - Non-host synchronized read-only preview with waiting indicator.
+   - Minimum 3 player validation for game start.
+
+5. **`client/src/components/game/VotingGrid.tsx` & `client/src/components/game/MrWhiteModal.tsx`**:
+   - `<VotingGrid>`: Secret ballot voting cards with live progress counter, vote lock-in confirmation tone, and Instant Skip tie-breaker alert banner.
+   - `<MrWhiteModal>`: Emergency fuzzy word guessing dialog for Mr. White with 45s countdown timer and spectator suspense screen for other players.
+
+6. **`client/src/pages/RoomGamePage.tsx`**:
+   - Multi-phase synchronized game loop matching `room.phase`:
+     - `ROLE_REVEAL`: Press & hold secret identity card.
+     - `TURN_PHASE`: Active speaker spotlight, circular countdown timer, speaker order ribbon, and turn advance controls.
+     - `VOTING`: Secret voting grid with instant skip banner and elimination sound effects.
+     - `MR_WHITE_GUESS`: Emergency guess modal.
+     - `GAME_OVER`: Winner announcement, full role/word reveal, and host rematch triggers.
+
+7. **`client/src/App.tsx`**:
+   - Top-level routing connecting `HomePage`, `PassPlay` flow, and `Online` multi-device flow within `AudioProvider`, `SocketProvider`, and `PassPlayProvider`.
+
+## Verification Results
+- `npm run typecheck`: Passed with 0 errors across client & server.
+- `npm test`: Passed (4 test files, 49/49 tests passing).
+- `npm run build:client`: Vite production build passed cleanly.
diff --git a/client/src/App.tsx b/client/src/App.tsx
index 696f126..e0820e9 100644
--- a/client/src/App.tsx
+++ b/client/src/App.tsx
@@ -1,24 +1,79 @@
-import React from 'react';
+import React, { useState, useEffect } from 'react';
+import { AudioProvider } from './context/AudioContext';
 import { PassPlayProvider, usePassPlay } from './context/PassPlayContext';
+import { SocketProvider } from './context/SocketContext';
+import { useSocket } from './hooks/useSocket';
+import { HomePage } from './pages/HomePage';
 import { PassPlaySetupPage } from './pages/PassPlaySetupPage';
 import { PassPlayGamePage } from './pages/PassPlayGamePage';
+import { LobbyPage } from './pages/LobbyPage';
+import { RoomGamePage } from './pages/RoomGamePage';
 
-const PassPlayRouter: React.FC = () => {
-  const { phase } = usePassPlay();
 
-  if (phase === 'SETUP') {
-    return <PassPlaySetupPage />;
+type AppView = 'HOME' | 'PASS_PLAY' | 'ONLINE';
+
+const AppRouter: React.FC = () => {
+  const [currentView, setCurrentView] = useState<AppView>('HOME');
+  const { phase: passPlayPhase, resetToSetup } = usePassPlay();
+  const { room } = useSocket();
+
+  // If a room is active, switch to ONLINE view
+  useEffect(() => {
+    if (room && currentView === 'HOME') {
+      setCurrentView('ONLINE');
+    }
+  }, [room, currentView]);
+
+  if (currentView === 'PASS_PLAY') {
+    if (passPlayPhase === 'SETUP') {
+      return <PassPlaySetupPage onBack={() => setCurrentView('HOME')} />;
+    }
+    return (
+      <PassPlayGamePage
+        onBackToHome={() => {
+          resetToSetup();
+          setCurrentView('HOME');
+        }}
+      />
+    );
+  }
+
+  if (currentView === 'ONLINE') {
+    if (!room || room.phase === 'LOBBY') {
+      return (
+        <LobbyPage
+          onLeaveRoom={() => setCurrentView('HOME')}
+          onGameStarted={() => {}}
+        />
+      );
+    }
+    return (
+      <RoomGamePage
+        onReturnToLobby={() => {}}
+        onExitRoom={() => setCurrentView('HOME')}
+      />
+    );
   }
 
-  return <PassPlayGamePage />;
+  return (
+    <HomePage
+      onStartPassPlay={() => setCurrentView('PASS_PLAY')}
+      onEnterOnlineLobby={() => setCurrentView('ONLINE')}
+    />
+  );
 };
 
 export const App: React.FC = () => {
   return (
-    <PassPlayProvider>
-      <PassPlayRouter />
-    </PassPlayProvider>
+    <AudioProvider>
+      <SocketProvider>
+        <PassPlayProvider>
+          <AppRouter />
+        </PassPlayProvider>
+      </SocketProvider>
+    </AudioProvider>
   );
 };
 
 export default App;
+
diff --git a/client/src/components/game/MrWhiteModal.tsx b/client/src/components/game/MrWhiteModal.tsx
new file mode 100644
index 0000000..b25f76c
--- /dev/null
+++ b/client/src/components/game/MrWhiteModal.tsx
@@ -0,0 +1,182 @@
+import React, { useState, useEffect } from 'react';
+import { motion } from 'motion/react';
+import { HelpCircle, Send, AlertCircle } from 'lucide-react';
+import { Modal } from '../common/Modal';
+import { Button } from '../common/Button';
+import { CountdownTimer } from './CountdownTimer';
+import { Player, PlayerRole } from '../../types/game.types';
+
+export interface MrWhiteModalProps {
+  isOpen: boolean;
+  isMrWhite: boolean;
+  mrWhitePlayer?: Player;
+  onSubmitGuess: (guess: string) => Promise<{ success: boolean; isCorrect?: boolean; winner?: PlayerRole; error?: string }>;
+  initialSeconds?: number;
+}
+
+export const MrWhiteModal: React.FC<MrWhiteModalProps> = ({
+  isOpen,
+  isMrWhite,
+  mrWhitePlayer,
+  onSubmitGuess,
+  initialSeconds = 45,
+}) => {
+  const [guessInput, setGuessInput] = useState('');
+  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
+  const [isSubmitting, setIsSubmitting] = useState(false);
+  const [errorMsg, setErrorMsg] = useState<string | null>(null);
+
+
+  useEffect(() => {
+    if (!isOpen) return;
+
+    setRemainingSeconds(initialSeconds);
+    setGuessInput('');
+    setErrorMsg(null);
+
+    const timer = setInterval(() => {
+      setRemainingSeconds((prev) => {
+        if (prev <= 1) {
+          clearInterval(timer);
+          return 0;
+        }
+        return prev - 1;
+      });
+    }, 1000);
+
+    return () => clearInterval(timer);
+  }, [isOpen, initialSeconds]);
+
+  const handleSubmit = async (e?: React.FormEvent) => {
+    if (e) e.preventDefault();
+    if (!guessInput.trim() || !isMrWhite) return;
+
+    setIsSubmitting(true);
+    setErrorMsg(null);
+    try {
+      const res = await onSubmitGuess(guessInput.trim());
+      if (!res.success) {
+        setErrorMsg(res.error || 'Gagal mengirim tebakan');
+      }
+    } catch (err: any) {
+      setErrorMsg(err?.message || 'Gagal mengirim tebakan');
+    } finally {
+      setIsSubmitting(false);
+    }
+  };
+
+  return (
+    <Modal
+      isOpen={isOpen}
+      onClose={() => {}} // modal cannot be dismissed by clicking outside during emergency guess
+      closeOnOutsideClick={false}
+      closeOnEscape={false}
+      showCloseButton={false}
+      size="md"
+      className="border-purple-500/40 shadow-2xl shadow-purple-950/60"
+      title={
+        <div className="flex items-center gap-2">
+          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
+            <HelpCircle className="w-5 h-5 animate-pulse" />
+          </div>
+          <div>
+            <h3 className="text-base sm:text-lg font-black font-display bg-gradient-to-r from-purple-400 to-rose-400 bg-clip-text text-transparent">
+              {isMrWhite ? 'TEBAK KATA RAHASIA WARGA!' : 'MR. WHITE TERTANGKAP!'}
+            </h3>
+            <p className="text-[11px] text-purple-300/80 font-mono uppercase tracking-wider">
+              Kesempatan Darurat Butakata
+            </p>
+          </div>
+        </div>
+      }
+    >
+      <div className="space-y-5">
+        {/* Countdown Timer */}
+        <div className="flex justify-center">
+          <CountdownTimer
+            totalSeconds={initialSeconds}
+            remainingSeconds={remainingSeconds}
+            variant="compact"
+            label="Waktu Menebak"
+          />
+        </div>
+
+        {isMrWhite ? (
+          /* Mr White Interface */
+          <form onSubmit={handleSubmit} className="space-y-4">
+            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-center space-y-1">
+              <p className="text-sm font-bold text-purple-200 font-display">
+                Kamu Terpilih Tereliminasi!
+              </p>
+              <p className="text-xs text-purple-300/80 leading-relaxed font-sans">
+                Namun, kamu tetap bisa <strong className="text-white">MENANG</strong> secara instan jika berhasil menebak <span className="text-cyan-300 font-bold">Kata Rahasia Warga</span>!
+              </p>
+            </div>
+
+            <div className="space-y-1.5">
+              <label className="text-xs font-semibold text-slate-300">
+                Tuliskan Kata Rahasia Warga (Fuzzy Tolerance Aktif):
+              </label>
+              <input
+                type="text"
+                autoFocus
+                value={guessInput}
+                onChange={(e) => setGuessInput(e.target.value)}
+                placeholder="Ketik tebakan kata di sini..."
+                maxLength={30}
+                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-purple-500/40 text-purple-100 placeholder:text-slate-600 text-base font-bold focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 tracking-wide text-center"
+              />
+            </div>
+
+            {errorMsg && (
+              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
+                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
+                <span>{errorMsg}</span>
+              </div>
+            )}
+
+            <Button
+              type="submit"
+              variant="accent"
+              size="lg"
+              fullWidth
+              disabled={!guessInput.trim() || remainingSeconds === 0}
+              isLoading={isSubmitting}
+              leftIcon={<Send className="w-4 h-4" />}
+              className="mt-2"
+            >
+              Kirim Tebakan Sekarang
+            </Button>
+          </form>
+        ) : (
+          /* Spectator / Other Players Interface */
+          <div className="text-center space-y-4 py-2">
+            <motion.div
+              animate={{ scale: [1, 1.05, 1] }}
+              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
+              className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/15 border-2 border-purple-500/40 flex items-center justify-center text-3xl shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)]"
+            >
+              {mrWhitePlayer?.avatar || '🕵️'}
+            </motion.div>
+
+            <div className="space-y-1">
+              <p className="text-base font-bold text-slate-100 font-display">
+                <span className="text-purple-300 font-bold">{mrWhitePlayer?.name || 'Mr. White'}</span> sedang menebak kata rahasia!
+              </p>
+              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
+                Jika tebakannya benar, Mr. White mencuri kemenangan! Jika salah, warga atau undercover yang bertahan akan menang.
+              </p>
+            </div>
+
+            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-center gap-2 text-xs text-purple-300 font-mono">
+              <span className="inline-block w-2 h-2 rounded-full bg-purple-400 animate-ping" />
+              <span>Menunggu input Mr. White...</span>
+            </div>
+          </div>
+        )}
+      </div>
+    </Modal>
+  );
+};
+
+export default MrWhiteModal;
diff --git a/client/src/components/game/VotingGrid.tsx b/client/src/components/game/VotingGrid.tsx
new file mode 100644
index 0000000..3410463
--- /dev/null
+++ b/client/src/components/game/VotingGrid.tsx
@@ -0,0 +1,276 @@
+import React, { useState } from 'react';
+import { motion, AnimatePresence } from 'motion/react';
+import {
+  Vote,
+  CheckCircle2,
+  AlertTriangle,
+  Skull,
+  UserCheck,
+  Lock,
+  Flame,
+} from 'lucide-react';
+import { Player } from '../../types/game.types';
+import { Button } from '../common/Button';
+import { Badge } from '../common/Badge';
+import { useGameSound } from '../../hooks/useGameSound';
+import { cn } from '../../utils/cn';
+
+
+export interface VotingGridProps {
+  players: Player[];
+  currentPlayer: Player | null;
+  onCastVote: (targetId: string) => Promise<{ success: boolean; error?: string }>;
+  isTie?: boolean;
+  tieMessage?: string;
+  roundNumber?: number;
+  className?: string;
+}
+
+export const VotingGrid: React.FC<VotingGridProps> = ({
+  players,
+  currentPlayer,
+  onCastVote,
+  isTie = false,
+  tieMessage = 'Hasil Voting Imbang! Sistem menerapkan Instant Skip. Tidak ada yang tereliminasi.',
+  roundNumber = 1,
+  className,
+}) => {
+  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
+  const [isSubmitting, setIsSubmitting] = useState(false);
+  const [errorMessage, setErrorMessage] = useState<string | null>(null);
+  const { playVoteBuzzer, playButtonTap } = useGameSound();
+
+  const isAlive = currentPlayer?.isAlive ?? true;
+  const hasVoted = currentPlayer?.hasVoted ?? false;
+
+  const livingPlayers = players.filter((p) => p.isAlive);
+  const totalVotesCount = livingPlayers.filter((p) => p.hasVoted).length;
+
+  const handleSelect = (playerId: string) => {
+    if (!isAlive || hasVoted || playerId === currentPlayer?.id) return;
+    try {
+      playButtonTap();
+    } catch {
+      // ignore audio
+    }
+    setSelectedTargetId(playerId);
+    setErrorMessage(null);
+  };
+
+  const handleConfirmVote = async () => {
+    if (!selectedTargetId || hasVoted || !isAlive) return;
+
+    setIsSubmitting(true);
+    setErrorMessage(null);
+    try {
+      const res = await onCastVote(selectedTargetId);
+      if (res.success) {
+        try {
+          playVoteBuzzer();
+        } catch {
+          // ignore
+        }
+      } else {
+        setErrorMessage(res.error || 'Gagal mengirim pilihan');
+      }
+    } catch (err: any) {
+      setErrorMessage(err?.message || 'Gagal mengirim pilihan');
+    } finally {
+      setIsSubmitting(false);
+    }
+  };
+
+  return (
+    <div className={cn('w-full max-w-xl mx-auto space-y-5 select-none', className)}>
+      {/* Tie Break Alert Banner */}
+      <AnimatePresence>
+        {isTie && (
+          <motion.div
+            initial={{ opacity: 0, scale: 0.95, y: -10 }}
+            animate={{ opacity: 1, scale: 1, y: 0 }}
+            exit={{ opacity: 0, scale: 0.95 }}
+            className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-300 shadow-[0_0_25px_-5px_rgba(245,158,11,0.4)] flex items-start gap-3"
+          >
+            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5 animate-bounce" />
+            <div className="space-y-1">
+              <h4 className="text-sm font-black font-display text-amber-300 uppercase tracking-wide">
+                Instant Skip &mdash; Hasil Imbang!
+              </h4>
+              <p className="text-xs text-amber-200/90 leading-relaxed font-sans">
+                {tieMessage}
+              </p>
+            </div>
+          </motion.div>
+        )}
+      </AnimatePresence>
+
+      {/* Header Info */}
+      <div className="flex items-center justify-between px-2">
+        <div className="space-y-0.5">
+          <div className="flex items-center gap-2">
+            <Vote className="w-4 h-4 text-cyan-400" />
+            <h3 className="text-sm sm:text-base font-bold text-slate-100 font-display">
+              Fase Pemilihan Impostor
+            </h3>
+          </div>
+          <p className="text-xs text-slate-400">
+            {hasVoted
+              ? 'Pilihanmu telah dikunci. Menunggu pemain lain...'
+              : isAlive
+              ? 'Pilih satu pemain yang paling mencurigakan:'
+              : 'Kamu telah tereliminasi (Spectator)'}
+          </p>
+        </div>
+
+        {/* Live Vote Progress Counter */}
+        <div className="flex flex-col items-end">
+          <Badge
+            variant={totalVotesCount === livingPlayers.length ? 'emerald' : 'cyan'}
+            size="sm"
+            className="font-mono"
+          >
+            {totalVotesCount}/{livingPlayers.length} Memilih
+          </Badge>
+          <span className="text-[10px] text-slate-500 font-mono mt-0.5">Ronde {roundNumber}</span>
+        </div>
+      </div>
+
+      {/* Player Grid Cards */}
+      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
+        {players.map((player) => {
+          const isMe = player.id === currentPlayer?.id;
+          const isTargetSelected = selectedTargetId === player.id;
+          const isPlayerAlive = player.isAlive;
+          const canVoteThis = isAlive && !hasVoted && !isMe && isPlayerAlive;
+
+          return (
+            <motion.div
+              key={player.id}
+              whileHover={canVoteThis ? { scale: 1.02 } : undefined}
+              whileTap={canVoteThis ? { scale: 0.98 } : undefined}
+              onClick={() => canVoteThis && handleSelect(player.id)}
+              className={cn(
+                'relative p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3',
+                !isPlayerAlive
+                  ? 'bg-slate-950/40 border-white/5 opacity-50 cursor-not-allowed'
+                  : isTargetSelected
+                  ? 'bg-rose-500/20 border-rose-500 shadow-[0_0_20px_-3px_rgba(244,63,94,0.45)] ring-1 ring-rose-400 cursor-pointer'
+                  : canVoteThis
+                  ? 'bg-slate-900/80 border-white/10 hover:border-cyan-400/50 hover:bg-slate-800/80 cursor-pointer'
+                  : 'bg-slate-900/60 border-white/10 cursor-default'
+              )}
+            >
+              <div className="flex items-center gap-3 min-w-0">
+                {/* Avatar */}
+                <div
+                  className={cn(
+                    'w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 border relative',
+                    !isPlayerAlive
+                      ? 'bg-slate-900 border-slate-700 text-slate-600'
+                      : isTargetSelected
+                      ? 'bg-rose-500/20 border-rose-400 shadow-md'
+                      : 'bg-cyan-500/10 border-cyan-500/30'
+                  )}
+                >
+                  {player.avatar}
+                  {!isPlayerAlive && (
+                    <span className="absolute -bottom-1 -right-1 p-0.5 rounded bg-slate-900 border border-slate-700">
+                      <Skull className="w-3 h-3 text-rose-500" />
+                    </span>
+                  )}
+                </div>
+
+                {/* Player details */}
+                <div className="min-w-0">
+                  <div className="flex items-center gap-1.5">
+                    <span
+                      className={cn(
+                        'text-sm font-bold truncate',
+                        !isPlayerAlive
+                          ? 'line-through text-slate-500'
+                          : isTargetSelected
+                          ? 'text-rose-300'
+                          : 'text-slate-100'
+                      )}
+                    >
+                      {player.name}
+                    </span>
+                    {isMe && (
+                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-slate-300">
+                        Kamu
+                      </span>
+                    )}
+                  </div>
+
+                  <div className="flex items-center gap-1.5 mt-0.5">
+                    {!isPlayerAlive ? (
+                      <span className="text-[10px] text-rose-400 font-mono">Tereliminasi</span>
+                    ) : player.hasVoted ? (
+                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
+                        <CheckCircle2 className="w-3 h-3" /> Sudah memilih
+                      </span>
+                    ) : (
+                      <span className="text-[10px] text-slate-500 font-mono">Sedang berpikir...</span>
+                    )}
+                  </div>
+                </div>
+              </div>
+
+              {/* Right Selection Indicator */}
+              <div className="shrink-0">
+                {isTargetSelected && (
+                  <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md animate-pulse">
+                    <Flame className="w-3.5 h-3.5" />
+                  </span>
+                )}
+                {!isTargetSelected && player.hasVoted && isPlayerAlive && (
+                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
+                    <UserCheck className="w-3 h-3" />
+                  </span>
+                )}
+              </div>
+            </motion.div>
+          );
+        })}
+      </div>
+
+      {/* Error display */}
+      {errorMessage && (
+        <p className="text-xs text-rose-400 text-center font-medium">{errorMessage}</p>
+      )}
+
+      {/* Action Footer Button */}
+      {isAlive && !hasVoted && (
+        <div className="pt-2">
+          <Button
+            variant="danger"
+            size="lg"
+            fullWidth
+            disabled={!selectedTargetId}
+            isLoading={isSubmitting}
+            onClick={handleConfirmVote}
+            leftIcon={<Vote className="w-5 h-5" />}
+          >
+            {selectedTargetId
+              ? `Kunci Pilihan: ${players.find((p) => p.id === selectedTargetId)?.name}`
+              : 'Pilih Satu Pemain di Atas'}
+          </Button>
+        </div>
+      )}
+
+      {hasVoted && (
+        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-emerald-500/30 text-center space-y-1">
+          <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-bold font-sans">
+            <Lock className="w-3.5 h-3.5" />
+            <span>Pilihan Terkunci &mdash; Menunggu Hasil Rekapitulasi</span>
+          </div>
+          <p className="text-[11px] text-slate-400">
+            Hasil eliminasi atau tie-break akan otomatis ditampilkan begitu semua pemain selesai memilih.
+          </p>
+        </div>
+      )}
+    </div>
+  );
+};
+
+export default VotingGrid;
diff --git a/client/src/components/game/index.ts b/client/src/components/game/index.ts
index 17a573a..e621329 100644
--- a/client/src/components/game/index.ts
+++ b/client/src/components/game/index.ts
@@ -1,5 +1,8 @@
 export * from './AvatarPicker';
 export * from './SecretCard';
 export * from './CountdownTimer';
 export * from './PassPlaySecretView';
 export * from './PassPlayVotingView';
+export * from './VotingGrid';
+export * from './MrWhiteModal';
+
diff --git a/client/src/components/lobby/CustomWordPackModal.tsx b/client/src/components/lobby/CustomWordPackModal.tsx
new file mode 100644
index 0000000..89825eb
--- /dev/null
+++ b/client/src/components/lobby/CustomWordPackModal.tsx
@@ -0,0 +1,641 @@
+import React, { useState, useEffect, useCallback } from 'react';
+import { motion } from 'motion/react';
+import {
+  Plus,
+  Trash2,
+  Share2,
+  Copy,
+  Check,
+  Search,
+  BookOpen,
+  Sparkles,
+  Save,
+  FolderOpen,
+  AlertCircle,
+} from 'lucide-react';
+import { Modal } from '../common/Modal';
+import { Button } from '../common/Button';
+import { Badge } from '../common/Badge';
+import { WordPair, CustomWordPack } from '../../types/game.types';
+import { wordPackService } from '../../services/wordPackService';
+import { cn } from '../../utils/cn';
+
+
+export interface CustomWordPackModalProps {
+  isOpen: boolean;
+  onClose: () => void;
+  onSelectPack?: (pack: CustomWordPack) => void;
+  onSelectWordPair?: (pair: WordPair) => void;
+}
+
+type TabType = 'CREATE' | 'IMPORT' | 'SAVED';
+
+export const CustomWordPackModal: React.FC<CustomWordPackModalProps> = ({
+  isOpen,
+  onClose,
+  onSelectPack,
+  onSelectWordPair,
+}) => {
+  const [activeTab, setActiveTab] = useState<TabType>('CREATE');
+
+  // Create Pack State
+  const [title, setTitle] = useState('');
+  const [authorName, setAuthorName] = useState('');
+  const [category, setCategory] = useState('Kustom');
+  const [pairs, setPairs] = useState<Array<{ civilian: string; undercover: string }>>([
+    { civilian: '', undercover: '' },
+    { civilian: '', undercover: '' },
+    { civilian: '', undercover: '' },
+  ]);
+  const [isPublic, setIsPublic] = useState(true);
+  const [isSaving, setIsSaving] = useState(false);
+  const [saveSuccessPack, setSaveSuccessPack] = useState<CustomWordPack | null>(null);
+
+  // Import State
+  const [importCode, setImportCode] = useState('');
+  const [isSearching, setIsSearching] = useState(false);
+  const [importedPack, setImportedPack] = useState<CustomWordPack | null>(null);
+  const [importError, setImportError] = useState<string | null>(null);
+
+  // Saved / Community Packs State
+  const [savedPacks, setSavedPacks] = useState<CustomWordPack[]>([]);
+  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
+
+  // Feedback State
+  const [copiedCode, setCopiedCode] = useState<string | null>(null);
+  const [validationError, setValidationError] = useState<string | null>(null);
+
+  const loadSavedPacks = useCallback(async () => {
+    setIsLoadingSaved(true);
+    try {
+      const packs = await wordPackService.getCommunityPacks();
+      setSavedPacks(packs);
+    } catch (err) {
+      console.warn('Failed to load saved packs:', err);
+    } finally {
+      setIsLoadingSaved(false);
+    }
+  }, []);
+
+  useEffect(() => {
+    if (isOpen) {
+      loadSavedPacks();
+      setValidationError(null);
+      setImportError(null);
+    }
+  }, [isOpen, loadSavedPacks]);
+
+  // Handle Copy
+  const handleCopyCode = async (code: string) => {
+    try {
+      await navigator.clipboard.writeText(code);
+      setCopiedCode(code);
+      setTimeout(() => setCopiedCode(null), 2500);
+    } catch {
+      // ignore clipboard error
+    }
+  };
+
+  // Pair builder helpers
+  const handleAddPair = () => {
+    setPairs((prev) => [...prev, { civilian: '', undercover: '' }]);
+  };
+
+  const handleRemovePair = (index: number) => {
+    if (pairs.length <= 1) return;
+    setPairs((prev) => prev.filter((_, i) => i !== index));
+  };
+
+  const handlePairChange = (index: number, field: 'civilian' | 'undercover', value: string) => {
+    setPairs((prev) => {
+      const updated = [...prev];
+      updated[index] = { ...updated[index], [field]: value };
+      return updated;
+    });
+  };
+
+  // Save Custom Pack
+  const handleSavePack = async () => {
+    setValidationError(null);
+    if (!title.trim()) {
+      setValidationError('Judul paket kata tidak boleh kosong');
+      return;
+    }
+
+    const validPairs: WordPair[] = pairs
+      .map((p) => ({
+        category: category.trim() || 'Kustom',
+        civilianWord: p.civilian.trim(),
+        undercoverWord: p.undercover.trim(),
+      }))
+      .filter((p) => p.civilianWord.length > 0 && p.undercoverWord.length > 0);
+
+    if (validPairs.length === 0) {
+      setValidationError('Tambahkan minimal 1 pasangan kata rahasia yang valid');
+      return;
+    }
+
+    setIsSaving(true);
+    try {
+      const result = await wordPackService.saveCustomPack(
+        title.trim(),
+        authorName.trim() || 'Anonim',
+        validPairs,
+        isPublic
+      );
+
+      if (result.success) {
+        setSaveSuccessPack(result.pack);
+        loadSavedPacks();
+      }
+    } catch (err: any) {
+      setValidationError(err?.message || 'Gagal menyimpan paket kata');
+    } finally {
+      setIsSaving(false);
+    }
+  };
+
+  // Import Pack by Share Code
+  const handleImportPack = async () => {
+    setImportError(null);
+    setImportedPack(null);
+
+    const clean = importCode.trim().toUpperCase();
+    if (!clean || clean.length < 4) {
+      setImportError('Masukkan kode share yang valid (minimal 4 karakter)');
+      return;
+    }
+
+    setIsSearching(true);
+    try {
+      const pack = await wordPackService.getPackByShareCode(clean);
+      if (pack) {
+        setImportedPack(pack);
+        loadSavedPacks();
+      } else {
+        setImportError(`Paket dengan kode "${clean}" tidak ditemukan.`);
+      }
+    } catch (err: any) {
+      setImportError(err?.message || 'Gagal mencari paket');
+    } finally {
+      setIsSearching(false);
+    }
+  };
+
+  // Delete Pack
+  const handleDeletePack = (e: React.MouseEvent, packId: string) => {
+    e.stopPropagation();
+    wordPackService.deleteLocalCustomPack(packId);
+    setSavedPacks((prev) => prev.filter((p) => p.id !== packId));
+  };
+
+  const handleSelectAndClose = (pack: CustomWordPack) => {
+    if (onSelectPack) {
+      onSelectPack(pack);
+    } else if (onSelectWordPair && pack.wordPairs.length > 0) {
+      const randomPair = pack.wordPairs[Math.floor(Math.random() * pack.wordPairs.length)];
+      onSelectWordPair(randomPair);
+    }
+    onClose();
+  };
+
+  return (
+    <Modal
+      isOpen={isOpen}
+      onClose={onClose}
+      size="xl"
+      title={
+        <div className="flex items-center gap-2">
+          <Sparkles className="w-5 h-5 text-cyan-400" />
+          <span className="font-black text-lg sm:text-xl font-display bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
+            Paket Kata Kustom
+          </span>
+        </div>
+      }
+      subtitle="Buat, bagikan, dan impor kata rahasia unik bersama temanmu"
+    >
+      <div className="space-y-5">
+        {/* Navigation Tabs */}
+        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-white/10">
+          <button
+            type="button"
+            onClick={() => {
+              setActiveTab('CREATE');
+              setSaveSuccessPack(null);
+            }}
+            className={cn(
+              'flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all',
+              activeTab === 'CREATE'
+                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
+                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
+            )}
+          >
+            <Plus className="w-3.5 h-3.5" />
+            <span className="truncate">Buat Baru</span>
+          </button>
+
+          <button
+            type="button"
+            onClick={() => setActiveTab('IMPORT')}
+            className={cn(
+              'flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all',
+              activeTab === 'IMPORT'
+                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
+                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
+            )}
+          >
+            <Share2 className="w-3.5 h-3.5" />
+            <span className="truncate">Impor Kode</span>
+          </button>
+
+          <button
+            type="button"
+            onClick={() => setActiveTab('SAVED')}
+            className={cn(
+              'flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all',
+              activeTab === 'SAVED'
+                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
+                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
+            )}
+          >
+            <FolderOpen className="w-3.5 h-3.5" />
+            <span className="truncate">Koleksi ({savedPacks.length})</span>
+          </button>
+        </div>
+
+        {/* Tab 1: CREATE PACK */}
+        {activeTab === 'CREATE' && (
+          <div className="space-y-4">
+            {saveSuccessPack ? (
+              <motion.div
+                initial={{ opacity: 0, scale: 0.95 }}
+                animate={{ opacity: 1, scale: 1 }}
+                className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4"
+              >
+                <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
+                  <Check className="w-6 h-6 stroke-[3]" />
+                </div>
+                <div>
+                  <h3 className="text-base font-bold text-emerald-300 font-display">
+                    Paket Berhasil Dibuat & Disimpan!
+                  </h3>
+                  <p className="text-xs text-slate-300 mt-1">
+                    Bagikan kode share berikut ke temanmu untuk memainkan paket kata ini:
+                  </p>
+                </div>
+
+                <div className="flex items-center justify-center gap-2 p-3 bg-slate-950/80 rounded-xl border border-white/10 max-w-xs mx-auto">
+                  <span className="font-mono text-xl font-black text-cyan-300 tracking-widest">
+                    {saveSuccessPack.shareCode}
+                  </span>
+                  <Button
+                    variant="outline"
+                    size="sm"
+                    onClick={() => handleCopyCode(saveSuccessPack.shareCode)}
+                    leftIcon={
+                      copiedCode === saveSuccessPack.shareCode ? (
+                        <Check className="w-3.5 h-3.5 text-emerald-400" />
+                      ) : (
+                        <Copy className="w-3.5 h-3.5" />
+                      )
+                    }
+                  >
+                    {copiedCode === saveSuccessPack.shareCode ? 'Tersalin' : 'Salin'}
+                  </Button>
+                </div>
+
+                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
+                  <Button
+                    variant="primary"
+                    size="sm"
+                    onClick={() => handleSelectAndClose(saveSuccessPack)}
+                  >
+                    Gunakan Paket Ini Sekarang
+                  </Button>
+                  <Button
+                    variant="secondary"
+                    size="sm"
+                    onClick={() => {
+                      setSaveSuccessPack(null);
+                      setTitle('');
+                      setPairs([
+                        { civilian: '', undercover: '' },
+                        { civilian: '', undercover: '' },
+                        { civilian: '', undercover: '' },
+                      ]);
+                    }}
+                  >
+                    Buat Paket Lain
+                  </Button>
+                </div>
+              </motion.div>
+            ) : (
+              <>
+                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
+                  <div className="space-y-1.5">
+                    <label className="text-xs font-semibold text-slate-300">Judul Paket</label>
+                    <input
+                      type="text"
+                      placeholder="e.g. Kantor & Rekan Kerja"
+                      value={title}
+                      onChange={(e) => setTitle(e.target.value)}
+                      maxLength={30}
+                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-white/10 text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
+                    />
+                  </div>
+
+                  <div className="space-y-1.5">
+                    <label className="text-xs font-semibold text-slate-300">Nama Pembuat / Author</label>
+                    <input
+                      type="text"
+                      placeholder="e.g. Agent007"
+                      value={authorName}
+                      onChange={(e) => setAuthorName(e.target.value)}
+                      maxLength={20}
+                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-white/10 text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
+                    />
+                  </div>
+                </div>
+
+                <div className="space-y-1.5">
+                  <label className="text-xs font-semibold text-slate-300">Label Kategori</label>
+                  <input
+                    type="text"
+                    placeholder="e.g. Keseharian, Film, Teknologi"
+                    value={category}
+                    onChange={(e) => setCategory(e.target.value)}
+                    maxLength={20}
+                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-white/10 text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
+                  />
+                </div>
+
+                {/* Word Pairs Builder */}
+                <div className="space-y-2">
+                  <div className="flex items-center justify-between">
+                    <label className="text-xs font-semibold text-slate-300">
+                      Pasangan Kata Rahasia ({pairs.length} pasang)
+                    </label>
+                    <span className="text-[11px] text-slate-500">
+                      Warga vs Undercover (Mirip tapi beda)
+                    </span>
+                  </div>
+
+                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
+                    {pairs.map((pair, index) => (
+                      <div
+                        key={index}
+                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/50 border border-white/5"
+                      >
+                        <span className="text-[11px] font-mono font-bold text-slate-500 w-5 text-center">
+                          #{index + 1}
+                        </span>
+                        <input
+                          type="text"
+                          placeholder="Kata Warga (e.g. Kopi)"
+                          value={pair.civilian}
+                          onChange={(e) => handlePairChange(index, 'civilian', e.target.value)}
+                          maxLength={25}
+                          className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/20 text-cyan-200 placeholder:text-slate-600 text-xs focus:outline-none focus:border-cyan-400"
+                        />
+                        <span className="text-slate-600 text-xs font-bold">vs</span>
+                        <input
+                          type="text"
+                          placeholder="Kata Undercover (e.g. Teh)"
+                          value={pair.undercover}
+                          onChange={(e) => handlePairChange(index, 'undercover', e.target.value)}
+                          maxLength={25}
+                          className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-rose-500/20 text-rose-200 placeholder:text-slate-600 text-xs focus:outline-none focus:border-rose-400"
+                        />
+                        {pairs.length > 1 && (
+                          <button
+                            type="button"
+                            onClick={() => handleRemovePair(index)}
+                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
+                            title="Hapus baris ini"
+                          >
+                            <Trash2 className="w-3.5 h-3.5" />
+                          </button>
+                        )}
+                      </div>
+                    ))}
+                  </div>
+
+                  <Button
+                    type="button"
+                    variant="secondary"
+                    size="sm"
+                    onClick={handleAddPair}
+                    leftIcon={<Plus className="w-3.5 h-3.5" />}
+                    className="w-full text-xs font-semibold py-2 border-dashed border-white/20"
+                  >
+                    Tambah Pasangan Kata
+                  </Button>
+                </div>
+
+                {validationError && (
+                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
+                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
+                    <span>{validationError}</span>
+                  </div>
+                )}
+
+                <div className="flex items-center justify-between pt-2 border-t border-white/10">
+                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
+                    <input
+                      type="checkbox"
+                      checked={isPublic}
+                      onChange={(e) => setIsPublic(e.target.checked)}
+                      className="rounded border-white/20 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
+                    />
+                    <span>Bisa dicari oleh publik via Share Code</span>
+                  </label>
+
+                  <Button
+                    type="button"
+                    variant="primary"
+                    size="md"
+                    isLoading={isSaving}
+                    onClick={handleSavePack}
+                    leftIcon={<Save className="w-4 h-4" />}
+                  >
+                    Simpan & Dapatkan Kode
+                  </Button>
+                </div>
+              </>
+            )}
+          </div>
+        )}
+
+        {/* Tab 2: IMPORT BY SHARE CODE */}
+        {activeTab === 'IMPORT' && (
+          <div className="space-y-4">
+            <div className="space-y-2">
+              <label className="text-xs font-semibold text-slate-300">
+                Masukkan Kode Share (6 Karakter)
+              </label>
+              <div className="flex gap-2">
+                <input
+                  type="text"
+                  placeholder="e.g. 8K29PX"
+                  value={importCode}
+                  onChange={(e) => setImportCode(e.target.value.toUpperCase())}
+                  maxLength={10}
+                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-cyan-300 font-mono text-base tracking-widest placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
+                />
+                <Button
+                  variant="primary"
+                  size="md"
+                  isLoading={isSearching}
+                  onClick={handleImportPack}
+                  leftIcon={<Search className="w-4 h-4" />}
+                >
+                  Cari
+                </Button>
+              </div>
+            </div>
+
+            {importError && (
+              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
+                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
+                <span>{importError}</span>
+              </div>
+            )}
+
+            {importedPack && (
+              <motion.div
+                initial={{ opacity: 0, y: 10 }}
+                animate={{ opacity: 1, y: 0 }}
+                className="p-4 rounded-2xl bg-slate-950/60 border border-cyan-500/30 space-y-3"
+              >
+                <div className="flex items-start justify-between">
+                  <div>
+                    <h4 className="text-base font-bold text-cyan-300 font-display">
+                      {importedPack.title}
+                    </h4>
+                    <p className="text-xs text-slate-400">
+                      Oleh: <span className="text-slate-200">{importedPack.authorName}</span> &bull;{' '}
+                      <span className="font-mono text-cyan-400">{importedPack.shareCode}</span>
+                    </p>
+                  </div>
+                  <Badge variant="cyan" size="sm">
+                    {importedPack.wordPairs.length} Kata
+                  </Badge>
+                </div>
+
+                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1.5">
+                  <span className="text-[10px] uppercase font-mono text-slate-500 block">
+                    Contoh Pasangan Kata:
+                  </span>
+                  <div className="flex flex-wrap gap-1.5">
+                    {importedPack.wordPairs.slice(0, 4).map((p, idx) => (
+                      <span
+                        key={idx}
+                        className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-slate-300 font-mono"
+                      >
+                        {p.civilianWord} / {p.undercoverWord}
+                      </span>
+                    ))}
+                    {importedPack.wordPairs.length > 4 && (
+                      <span className="text-xs text-slate-500 self-center">
+                        +{importedPack.wordPairs.length - 4} lainnya
+                      </span>
+                    )}
+                  </div>
+                </div>
+
+                <div className="flex justify-end pt-1">
+                  <Button
+                    variant="primary"
+                    size="sm"
+                    onClick={() => handleSelectAndClose(importedPack)}
+                  >
+                    Gunakan Paket Ini
+                  </Button>
+                </div>
+              </motion.div>
+            )}
+          </div>
+        )}
+
+        {/* Tab 3: SAVED PACKS */}
+        {activeTab === 'SAVED' && (
+          <div className="space-y-3">
+            {isLoadingSaved ? (
+              <div className="text-center py-8 text-slate-500 text-xs animate-pulse">
+                Memuat koleksi paket kata...
+              </div>
+            ) : savedPacks.length === 0 ? (
+              <div className="text-center py-8 text-slate-500 space-y-2">
+                <BookOpen className="w-8 h-8 mx-auto text-slate-600" />
+                <p className="text-xs">Belum ada paket kustom yang tersimpan.</p>
+                <Button
+                  variant="secondary"
+                  size="sm"
+                  onClick={() => setActiveTab('CREATE')}
+                  leftIcon={<Plus className="w-3.5 h-3.5" />}
+                >
+                  Buat Paket Pertamamu
+                </Button>
+              </div>
+            ) : (
+              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
+                {savedPacks.map((pack) => (
+                  <div
+                    key={pack.id || pack.shareCode}
+                    onClick={() => handleSelectAndClose(pack)}
+                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/10 hover:border-cyan-500/40 hover:bg-slate-900/80 transition-all cursor-pointer group"
+                  >
+                    <div className="space-y-0.5">
+                      <div className="flex items-center gap-2">
+                        <span className="text-sm font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
+                          {pack.title}
+                        </span>
+                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
+                          {pack.shareCode}
+                        </span>
+                      </div>
+                      <p className="text-[11px] text-slate-400">
+                        Oleh: {pack.authorName} &bull; {pack.wordPairs.length} pasangan kata
+                      </p>
+                    </div>
+
+                    <div className="flex items-center gap-1.5">
+                      <Button
+                        variant="ghost"
+                        size="icon"
+                        onClick={(e) => {
+                          e.stopPropagation();
+                          handleCopyCode(pack.shareCode);
+                        }}
+                        className="h-7 w-7 text-slate-400 hover:text-cyan-400"
+                        title="Salin Kode Share"
+                      >
+                        {copiedCode === pack.shareCode ? (
+                          <Check className="w-3.5 h-3.5 text-emerald-400" />
+                        ) : (
+                          <Copy className="w-3.5 h-3.5" />
+                        )}
+                      </Button>
+
+                      <Button
+                        variant="ghost"
+                        size="icon"
+                        onClick={(e) => handleDeletePack(e, pack.id)}
+                        className="h-7 w-7 text-slate-500 hover:text-rose-400"
+                        title="Hapus dari lokal"
+                      >
+                        <Trash2 className="w-3.5 h-3.5" />
+                      </Button>
+                    </div>
+                  </div>
+                ))}
+              </div>
+            )}
+          </div>
+        )}
+      </div>
+    </Modal>
+  );
+};
+
+export default CustomWordPackModal;
diff --git a/client/src/context/SocketContext.tsx b/client/src/context/SocketContext.tsx
new file mode 100644
index 0000000..45bd98e
--- /dev/null
+++ b/client/src/context/SocketContext.tsx
@@ -0,0 +1,499 @@
+import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
+import { io, Socket } from 'socket.io-client';
+import { Player, RoomState, GameSettings, WordPair, PlayerRole } from '../types/game.types';
+
+export const STORAGE_KEYS = {
+  PLAYER_TOKEN: 'whatstheword_player_token',
+  ROOM_ID: 'whatstheword_room_id',
+  SAVED_NAME: 'whatstheword_saved_name',
+  SAVED_AVATAR: 'whatstheword_saved_avatar',
+};
+
+export interface VoteResultPayload {
+  room: RoomState;
+  isTie?: boolean;
+  eliminatedPlayer?: Player;
+  winner?: PlayerRole;
+}
+
+export interface MrWhiteResultPayload {
+  isCorrect: boolean;
+  winner?: PlayerRole;
+  room: RoomState;
+}
+
+export interface SocketContextType {
+  socket: Socket | null;
+  isConnected: boolean;
+  isConnecting: boolean;
+  error: string | null;
+  room: RoomState | null;
+  currentPlayer: Player | null;
+  playerToken: string | null;
+  lastVoteResult: VoteResultPayload | null;
+  lastMrWhiteResult: MrWhiteResultPayload | null;
+  tieNotification: boolean;
+  createRoom: (playerName: string, avatar: string) => Promise<{ success: boolean; roomId?: string; error?: string }>;
+  joinRoom: (roomId: string, playerName: string, avatar: string) => Promise<{ success: boolean; error?: string }>;
+  leaveRoom: () => Promise<void>;
+  updateSettings: (settings: Partial<GameSettings>) => Promise<{ success: boolean; error?: string }>;
+  startGame: (customWordPair?: WordPair) => Promise<{ success: boolean; error?: string }>;
+  advanceTurn: () => Promise<{ success: boolean; error?: string }>;
+  syncTimerTick: (remainingSeconds: number) => void;
+  castVote: (targetId: string) => Promise<{ success: boolean; error?: string }>;
+  submitMrWhiteGuess: (guess: string) => Promise<{ success: boolean; isCorrect?: boolean; winner?: PlayerRole; error?: string }>;
+  rematch: () => Promise<{ success: boolean; error?: string }>;
+  clearTieNotification: () => void;
+  clearError: () => void;
+}
+
+export const SocketContext = createContext<SocketContextType | null>(null);
+
+const getSocketUrl = (): string => {
+  if (typeof window === 'undefined') return 'http://localhost:3001';
+  if (import.meta.env.VITE_SOCKET_URL) {
+    return import.meta.env.VITE_SOCKET_URL;
+  }
+  // If running in development with Vite proxy or standard dev setup
+  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
+    return 'http://localhost:3001';
+  }
+  return window.location.origin;
+};
+
+export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
+  const [socket, setSocket] = useState<Socket | null>(null);
+  const [isConnected, setIsConnected] = useState(false);
+  const [isConnecting, setIsConnecting] = useState(true);
+  const [error, setError] = useState<string | null>(null);
+  const [room, setRoom] = useState<RoomState | null>(null);
+  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
+  const [playerToken, setPlayerToken] = useState<string | null>(() => {
+    if (typeof window !== 'undefined') {
+      return localStorage.getItem(STORAGE_KEYS.PLAYER_TOKEN);
+    }
+    return null;
+  });
+  const [lastVoteResult, setLastVoteResult] = useState<VoteResultPayload | null>(null);
+  const [lastMrWhiteResult, setLastMrWhiteResult] = useState<MrWhiteResultPayload | null>(null);
+  const [tieNotification, setTieNotification] = useState<boolean>(false);
+
+  const socketRef = useRef<Socket | null>(null);
+  const currentPlayerIdRef = useRef<string | null>(null);
+
+  useEffect(() => {
+    currentPlayerIdRef.current = currentPlayer?.id || null;
+  }, [currentPlayer]);
+
+  // Establish socket connection on mount
+  useEffect(() => {
+    const socketUrl = getSocketUrl();
+    const newSocket = io(socketUrl, {
+      transports: ['websocket', 'polling'],
+      reconnection: true,
+      reconnectionAttempts: 10,
+      reconnectionDelay: 1000,
+      timeout: 10000,
+    });
+
+    socketRef.current = newSocket;
+    setSocket(newSocket);
+
+    newSocket.on('connect', () => {
+      setIsConnected(true);
+      setIsConnecting(false);
+      setError(null);
+
+      // Attempt session restoration if token exists
+      const savedToken = localStorage.getItem(STORAGE_KEYS.PLAYER_TOKEN);
+      if (savedToken) {
+        newSocket.emit('player:reconnect', { playerToken: savedToken }, (res: any) => {
+          if (res?.success && res?.room && res?.player) {
+            setRoom(res.room);
+            setCurrentPlayer(res.player);
+            setPlayerToken(savedToken);
+            currentPlayerIdRef.current = res.player.id;
+          } else {
+            // Expired session
+            localStorage.removeItem(STORAGE_KEYS.PLAYER_TOKEN);
+            localStorage.removeItem(STORAGE_KEYS.ROOM_ID);
+            setPlayerToken(null);
+            setRoom(null);
+            setCurrentPlayer(null);
+          }
+        });
+      }
+    });
+
+    newSocket.on('disconnect', () => {
+      setIsConnected(false);
+    });
+
+    newSocket.on('connect_error', (err) => {
+      setIsConnecting(false);
+      setError(`Gagal terhubung ke server: ${err.message}`);
+    });
+
+    // Realtime Game Events
+    newSocket.on('room:updated', (updatedRoom: RoomState) => {
+      setRoom(updatedRoom);
+      if (currentPlayerIdRef.current) {
+        const me = updatedRoom.players.find((p) => p.id === currentPlayerIdRef.current);
+        if (me) {
+          setCurrentPlayer(me);
+        }
+      }
+    });
+
+    newSocket.on('game:started', (startedRoom: RoomState) => {
+      setRoom(startedRoom);
+      setLastVoteResult(null);
+      setLastMrWhiteResult(null);
+      setTieNotification(false);
+      if (currentPlayerIdRef.current) {
+        const me = startedRoom.players.find((p) => p.id === currentPlayerIdRef.current);
+        if (me) {
+          setCurrentPlayer(me);
+        }
+      }
+    });
+
+    newSocket.on('turn:timer_sync', (payload: { remainingSeconds: number }) => {
+      setRoom((prev) => {
+        if (!prev) return prev;
+        return {
+          ...prev,
+          activeTurnRemainingSeconds: payload.remainingSeconds,
+        };
+      });
+    });
+
+    newSocket.on('vote:completed', (payload: VoteResultPayload) => {
+      setLastVoteResult(payload);
+      setRoom(payload.room);
+
+      if (payload.isTie) {
+        setTieNotification(true);
+      }
+
+      if (currentPlayerIdRef.current) {
+        const me = payload.room.players.find((p) => p.id === currentPlayerIdRef.current);
+        if (me) {
+          setCurrentPlayer(me);
+        }
+      }
+    });
+
+    newSocket.on('mrwhite:result', (payload: MrWhiteResultPayload) => {
+      setLastMrWhiteResult(payload);
+      setRoom(payload.room);
+      if (currentPlayerIdRef.current) {
+        const me = payload.room.players.find((p) => p.id === currentPlayerIdRef.current);
+        if (me) {
+          setCurrentPlayer(me);
+        }
+      }
+    });
+
+    newSocket.on('game:rematch_started', (rematchRoom: RoomState) => {
+      setRoom(rematchRoom);
+      setLastVoteResult(null);
+      setLastMrWhiteResult(null);
+      setTieNotification(false);
+      if (currentPlayerIdRef.current) {
+        const me = rematchRoom.players.find((p) => p.id === currentPlayerIdRef.current);
+        if (me) {
+          setCurrentPlayer(me);
+        }
+      }
+    });
+
+    return () => {
+      newSocket.removeAllListeners();
+      newSocket.disconnect();
+    };
+  }, []);
+
+  const clearTieNotification = useCallback(() => {
+    setTieNotification(false);
+  }, []);
+
+  const clearError = useCallback(() => {
+    setError(null);
+  }, []);
+
+  // Create Room
+  const createRoom = useCallback(
+    async (playerName: string, avatar: string): Promise<{ success: boolean; roomId?: string; error?: string }> => {
+      if (!socketRef.current || !socketRef.current.connected) {
+        return { success: false, error: 'Belum terhubung ke server game' };
+      }
+
+      return new Promise((resolve) => {
+        socketRef.current!.emit(
+          'room:create',
+          { playerName, avatar },
+          (res: any) => {
+            if (res?.success && res.room && res.player && res.playerToken) {
+              setRoom(res.room);
+              setCurrentPlayer(res.player);
+              setPlayerToken(res.playerToken);
+              currentPlayerIdRef.current = res.player.id;
+              localStorage.setItem(STORAGE_KEYS.PLAYER_TOKEN, res.playerToken);
+              localStorage.setItem(STORAGE_KEYS.ROOM_ID, res.roomId);
+              localStorage.setItem(STORAGE_KEYS.SAVED_NAME, playerName);
+              localStorage.setItem(STORAGE_KEYS.SAVED_AVATAR, avatar);
+              resolve({ success: true, roomId: res.roomId });
+            } else {
+              const errMsg = res?.error || 'Gagal membuat room';
+              setError(errMsg);
+              resolve({ success: false, error: errMsg });
+            }
+          }
+        );
+      });
+    },
+    []
+  );
+
+  // Join Room
+  const joinRoom = useCallback(
+    async (
+      roomId: string,
+      playerName: string,
+      avatar: string
+    ): Promise<{ success: boolean; error?: string }> => {
+      if (!socketRef.current || !socketRef.current.connected) {
+        return { success: false, error: 'Belum terhubung ke server game' };
+      }
+
+      const existingToken = localStorage.getItem(STORAGE_KEYS.PLAYER_TOKEN) || undefined;
+
+      return new Promise((resolve) => {
+        socketRef.current!.emit(
+          'room:join',
+          {
+            roomId: roomId.trim().toUpperCase(),
+            playerName,
+            avatar,
+            playerToken: existingToken,
+          },
+          (res: any) => {
+            if (res?.success && res.room && res.player && res.playerToken) {
+              setRoom(res.room);
+              setCurrentPlayer(res.player);
+              setPlayerToken(res.playerToken);
+              currentPlayerIdRef.current = res.player.id;
+              localStorage.setItem(STORAGE_KEYS.PLAYER_TOKEN, res.playerToken);
+              localStorage.setItem(STORAGE_KEYS.ROOM_ID, res.room.roomId);
+              localStorage.setItem(STORAGE_KEYS.SAVED_NAME, playerName);
+              localStorage.setItem(STORAGE_KEYS.SAVED_AVATAR, avatar);
+              resolve({ success: true });
+            } else {
+              const errMsg = res?.error || 'Gagal bergabung ke room';
+              setError(errMsg);
+              resolve({ success: false, error: errMsg });
+            }
+          }
+        );
+      });
+    },
+    []
+  );
+
+  // Leave Room
+  const leaveRoom = useCallback(async (): Promise<void> => {
+    if (socketRef.current && socketRef.current.connected) {
+      socketRef.current.emit('room:leave');
+    }
+    localStorage.removeItem(STORAGE_KEYS.PLAYER_TOKEN);
+    localStorage.removeItem(STORAGE_KEYS.ROOM_ID);
+    setRoom(null);
+    setCurrentPlayer(null);
+    setPlayerToken(null);
+    setLastVoteResult(null);
+    setLastMrWhiteResult(null);
+    setTieNotification(false);
+  }, []);
+
+  // Update Settings
+  const updateSettings = useCallback(
+    async (settings: Partial<GameSettings>): Promise<{ success: boolean; error?: string }> => {
+      if (!socketRef.current || !socketRef.current.connected) {
+        return { success: false, error: 'Tidak terhubung ke server' };
+      }
+
+      return new Promise((resolve) => {
+        socketRef.current!.emit(
+          'room:update_settings',
+          { settings },
+          (res: any) => {
+            if (res?.success && res.room) {
+              setRoom(res.room);
+              resolve({ success: true });
+            } else {
+              resolve({ success: false, error: res?.error || 'Gagal memperbarui pengaturan' });
+            }
+          }
+        );
+      });
+    },
+    []
+  );
+
+  // Start Game
+  const startGame = useCallback(
+    async (customWordPair?: WordPair): Promise<{ success: boolean; error?: string }> => {
+      if (!socketRef.current || !socketRef.current.connected) {
+        return { success: false, error: 'Tidak terhubung ke server' };
+      }
+
+      return new Promise((resolve) => {
+        socketRef.current!.emit(
+          'game:start',
+          { customWordPair },
+          (res: any) => {
+            if (res?.success && res.room) {
+              setRoom(res.room);
+              resolve({ success: true });
+            } else {
+              const errMsg = res?.error || 'Gagal memulai game';
+              setError(errMsg);
+              resolve({ success: false, error: errMsg });
+            }
+          }
+        );
+      });
+    },
+    []
+  );
+
+  // Advance Turn
+  const advanceTurn = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
+    if (!socketRef.current || !socketRef.current.connected) {
+      return { success: false, error: 'Tidak terhubung ke server' };
+    }
+
+    return new Promise((resolve) => {
+      socketRef.current!.emit('turn:end', (res: any) => {
+        if (res?.success && res.room) {
+          setRoom(res.room);
+          resolve({ success: true });
+        } else {
+          resolve({ success: false, error: res?.error || 'Gagal mengakhiri giliran' });
+        }
+      });
+    });
+  }, []);
+
+  // Sync Timer Tick
+  const syncTimerTick = useCallback((remainingSeconds: number) => {
+    if (socketRef.current && socketRef.current.connected) {
+      socketRef.current.emit('turn:timer_tick', { remainingSeconds });
+    }
+  }, []);
+
+  // Cast Vote
+  const castVote = useCallback(
+    async (targetId: string): Promise<{ success: boolean; error?: string }> => {
+      if (!socketRef.current || !socketRef.current.connected) {
+        return { success: false, error: 'Tidak terhubung ke server' };
+      }
+
+      return new Promise((resolve) => {
+        socketRef.current!.emit('vote:cast', { targetId }, (res: any) => {
+          if (res?.success && res.room) {
+            setRoom(res.room);
+            resolve({ success: true });
+          } else {
+            const errMsg = res?.error || 'Gagal memilih target';
+            setError(errMsg);
+            resolve({ success: false, error: errMsg });
+          }
+        });
+      });
+    },
+    []
+  );
+
+  // Submit Mr White Guess
+  const submitMrWhiteGuess = useCallback(
+    async (
+      guess: string
+    ): Promise<{ success: boolean; isCorrect?: boolean; winner?: PlayerRole; error?: string }> => {
+      if (!socketRef.current || !socketRef.current.connected) {
+        return { success: false, error: 'Tidak terhubung ke server' };
+      }
+
+      return new Promise((resolve) => {
+        socketRef.current!.emit('mrwhite:guess', { guess }, (res: any) => {
+          if (res?.success && res.room) {
+            setRoom(res.room);
+            resolve({
+              success: true,
+              isCorrect: res.isCorrect,
+              winner: res.winner,
+            });
+          } else {
+            const errMsg = res?.error || 'Gagal mengirim tebakan';
+            setError(errMsg);
+            resolve({ success: false, error: errMsg });
+          }
+        });
+      });
+    },
+    []
+  );
+
+  // Rematch
+  const rematch = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
+    if (!socketRef.current || !socketRef.current.connected) {
+      return { success: false, error: 'Tidak terhubung ke server' };
+    }
+
+    return new Promise((resolve) => {
+      socketRef.current!.emit('game:rematch', (res: any) => {
+        if (res?.success && res.room) {
+          setRoom(res.room);
+          setLastVoteResult(null);
+          setLastMrWhiteResult(null);
+          setTieNotification(false);
+          resolve({ success: true });
+        } else {
+          const errMsg = res?.error || 'Gagal melakukan rematch';
+          setError(errMsg);
+          resolve({ success: false, error: errMsg });
+        }
+      });
+    });
+  }, []);
+
+  const value: SocketContextType = {
+    socket,
+    isConnected,
+    isConnecting,
+    error,
+    room,
+    currentPlayer,
+    playerToken,
+    lastVoteResult,
+    lastMrWhiteResult,
+    tieNotification,
+    createRoom,
+    joinRoom,
+    leaveRoom,
+    updateSettings,
+    startGame,
+    advanceTurn,
+    syncTimerTick,
+    castVote,
+    submitMrWhiteGuess,
+    rematch,
+    clearTieNotification,
+    clearError,
+  };
+
+  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
+};
+
+export default SocketContext;
diff --git a/client/src/hooks/useSocket.ts b/client/src/hooks/useSocket.ts
new file mode 100644
index 0000000..94a7ba0
--- /dev/null
+++ b/client/src/hooks/useSocket.ts
@@ -0,0 +1,15 @@
+import { useContext } from 'react';
+import { SocketContext, SocketContextType } from '../context/SocketContext';
+
+/**
+ * Custom hook to interact with the Socket.io room and game context.
+ */
+export const useSocket = (): SocketContextType => {
+  const context = useContext(SocketContext);
+  if (!context) {
+    throw new Error('useSocket must be used within a SocketProvider');
+  }
+  return context;
+};
+
+export default useSocket;
diff --git a/client/src/pages/HomePage.tsx b/client/src/pages/HomePage.tsx
new file mode 100644
index 0000000..9479081
--- /dev/null
+++ b/client/src/pages/HomePage.tsx
@@ -0,0 +1,394 @@
+import React, { useState, useEffect } from 'react';
+import { motion } from 'motion/react';
+import {
+  Smartphone,
+  Wifi,
+  Sparkles,
+  PlusCircle,
+  LogIn,
+  BookOpen,
+  Shield,
+  EyeOff,
+  HelpCircle,
+  ArrowRight,
+  AlertCircle,
+} from 'lucide-react';
+
+import { Header } from '../components/common/Header';
+import { Button } from '../components/common/Button';
+import { Card } from '../components/common/Card';
+import { Badge } from '../components/common/Badge';
+import { AvatarPicker, PRESET_AVATARS } from '../components/game/AvatarPicker';
+import { CustomWordPackModal } from '../components/lobby/CustomWordPackModal';
+import { useSocket } from '../hooks/useSocket';
+import { useGameSound } from '../hooks/useGameSound';
+import { STORAGE_KEYS } from '../context/SocketContext';
+import { cn } from '../utils/cn';
+
+export interface HomePageProps {
+  onStartPassPlay: () => void;
+  onEnterOnlineLobby: () => void;
+}
+
+type OnlineTab = 'HOST' | 'JOIN';
+
+export const HomePage: React.FC<HomePageProps> = ({
+  onStartPassPlay,
+  onEnterOnlineLobby,
+}) => {
+  const { isConnected, isConnecting, createRoom, joinRoom, error, clearError } = useSocket();
+  const { playButtonTap } = useGameSound();
+
+  const [onlineTab, setOnlineTab] = useState<OnlineTab>('HOST');
+  const [roomCodeInput, setRoomCodeInput] = useState('');
+  const [playerName, setPlayerName] = useState(() => {
+    if (typeof window !== 'undefined') {
+      return localStorage.getItem(STORAGE_KEYS.SAVED_NAME) || 'Agent_' + Math.floor(10 + Math.random() * 90);
+    }
+    return 'Agent_47';
+  });
+  const [selectedAvatar, setSelectedAvatar] = useState(() => {
+    if (typeof window !== 'undefined') {
+      return localStorage.getItem(STORAGE_KEYS.SAVED_AVATAR) || PRESET_AVATARS[0].emoji;
+    }
+    return PRESET_AVATARS[0].emoji;
+  });
+
+  const [isSubmitting, setIsSubmitting] = useState(false);
+  const [formError, setFormError] = useState<string | null>(null);
+  const [isPackModalOpen, setIsPackModalOpen] = useState(false);
+
+  // Auto-detect room code from URL query param ?room=XXXX or ?code=XXXX
+  useEffect(() => {
+    if (typeof window !== 'undefined') {
+      const params = new URLSearchParams(window.location.search);
+      const roomParam = params.get('room') || params.get('code');
+      if (roomParam) {
+        setRoomCodeInput(roomParam.trim().toUpperCase());
+        setOnlineTab('JOIN');
+      }
+    }
+  }, []);
+
+  const handleCreateRoom = async (e: React.FormEvent) => {
+    e.preventDefault();
+    setFormError(null);
+    clearError();
+
+    if (!playerName.trim()) {
+      setFormError('Masukkan nama agen terlebih dahulu');
+      return;
+    }
+
+    setIsSubmitting(true);
+    try {
+      const res = await createRoom(playerName.trim(), selectedAvatar);
+      if (res.success) {
+        onEnterOnlineLobby();
+      } else {
+        setFormError(res.error || 'Gagal membuat room');
+      }
+    } catch (err: any) {
+      setFormError(err?.message || 'Gagal membuat room');
+    } finally {
+      setIsSubmitting(false);
+    }
+  };
+
+  const handleJoinRoom = async (e: React.FormEvent) => {
+    e.preventDefault();
+    setFormError(null);
+    clearError();
+
+    const cleanCode = roomCodeInput.trim().toUpperCase();
+    if (!cleanCode || cleanCode.length !== 4) {
+      setFormError('Masukkan 4 karakter kode room yang valid');
+      return;
+    }
+
+    if (!playerName.trim()) {
+      setFormError('Masukkan nama agen terlebih dahulu');
+      return;
+    }
+
+    setIsSubmitting(true);
+    try {
+      const res = await joinRoom(cleanCode, playerName.trim(), selectedAvatar);
+      if (res.success) {
+        onEnterOnlineLobby();
+      } else {
+        setFormError(res.error || 'Gagal bergabung ke room');
+      }
+    } catch (err: any) {
+      setFormError(err?.message || 'Gagal bergabung ke room');
+    } finally {
+      setIsSubmitting(false);
+    }
+  };
+
+  return (
+    <div className="min-h-[100dvh] bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 font-sans">
+      <Header />
+
+      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:py-10 flex flex-col justify-center space-y-8">
+        {/* Hero Section */}
+        <div className="text-center space-y-3 max-w-2xl mx-auto">
+          <motion.div
+            initial={{ opacity: 0, y: -12 }}
+            animate={{ opacity: 1, y: 0 }}
+            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]"
+          >
+            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
+            <span>Cyber Social Word Deduction Game</span>
+          </motion.div>
+
+          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight bg-gradient-to-r from-cyan-300 via-white to-rose-400 bg-clip-text text-transparent leading-tight">
+            WHAT'S THE WORD
+          </h1>
+
+          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
+            Temukan penyusup di antara warga sipil! Satu kata rahasia yang mirip, perdebatan sengit, dan satu Butakata (Mr. White) yang menyamar tanpa tahu apa-apa.
+          </p>
+
+          {/* Quick Roles Overview */}
+          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
+            <Badge variant="cyan" size="sm" icon={<Shield className="w-3 h-3" />}>
+              Warga (Satu Kata)
+            </Badge>
+            <Badge variant="crimson" size="sm" icon={<EyeOff className="w-3 h-3" />}>
+              Impostor (Kata Mirip)
+            </Badge>
+            <Badge variant="violet" size="sm" icon={<HelpCircle className="w-3 h-3" />}>
+              Mr. White (Tanpa Kata)
+            </Badge>
+          </div>
+        </div>
+
+        {/* Mode Selector Cards Grid */}
+        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
+          {/* 1. Offline Pass & Play Card */}
+          <motion.div
+            initial={{ opacity: 0, x: -20 }}
+            animate={{ opacity: 1, x: 0 }}
+            transition={{ delay: 0.1 }}
+            className="h-full"
+          >
+            <Card
+              glow="cyan"
+              padding="lg"
+              className="h-full flex flex-col justify-between border-cyan-500/30 hover:border-cyan-400/50 bg-gradient-to-b from-slate-900/90 to-slate-950/90 group"
+            >
+              <div className="space-y-4">
+                <div className="flex items-center justify-between">
+                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_-3px_rgba(6,182,212,0.3)] group-hover:scale-110 transition-transform">
+                    <Smartphone className="w-6 h-6" />
+                  </div>
+                  <Badge variant="cyan" size="sm">
+                    1 HP Offline
+                  </Badge>
+                </div>
+
+                <div className="space-y-2">
+                  <h3 className="text-xl font-bold font-display text-slate-100 group-hover:text-cyan-300 transition-colors">
+                    Pass &amp; Play (Offline)
+                  </h3>
+                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
+                    Main bersama teman dalam satu lingkaran hanya dengan <strong>1 smartphone</strong>. Ganti-gantian intip kata rahasia tanpa butuh internet!
+                  </p>
+                </div>
+
+                <ul className="text-xs text-slate-400 space-y-1.5 pt-1">
+                  <li className="flex items-center gap-2">
+                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
+                    3 - 20 Pemain Offline
+                  </li>
+                  <li className="flex items-center gap-2">
+                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
+                    Sensor intip layar &amp; suara buzzer
+                  </li>
+                  <li className="flex items-center gap-2">
+                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
+                    Bank kata ratusan pasang Indonesia
+                  </li>
+                </ul>
+              </div>
+
+              <div className="pt-6">
+                <Button
+                  variant="primary"
+                  size="lg"
+                  fullWidth
+                  onClick={onStartPassPlay}
+                  rightIcon={<ArrowRight className="w-5 h-5" />}
+                >
+                  Mulai Mode 1 HP
+                </Button>
+              </div>
+            </Card>
+          </motion.div>
+
+          {/* 2. Online Multi-Device Room Card */}
+          <motion.div
+            initial={{ opacity: 0, x: 20 }}
+            animate={{ opacity: 1, x: 0 }}
+            transition={{ delay: 0.15 }}
+            className="h-full"
+          >
+            <Card
+              glow="violet"
+              padding="lg"
+              className="h-full flex flex-col justify-between border-purple-500/30 hover:border-purple-400/50 bg-gradient-to-b from-slate-900/90 to-slate-950/90"
+            >
+              <div className="space-y-4">
+                <div className="flex items-center justify-between">
+                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_20px_-3px_rgba(168,85,247,0.3)]">
+                    <Wifi className="w-6 h-6 animate-pulse" />
+                  </div>
+                  <div className="flex items-center gap-1.5">
+                    <span
+                      className={cn(
+                        'w-2 h-2 rounded-full',
+                        isConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'
+                      )}
+                    />
+                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
+                      {isConnecting
+                        ? 'Menghubungkan...'
+                        : isConnected
+                        ? 'Online Room'
+                        : 'Server Offline'}
+                    </span>
+                  </div>
+                </div>
+
+                {/* Tab switcher: Host vs Join */}
+                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950/80 rounded-xl border border-white/10">
+                  <button
+                    type="button"
+                    onClick={() => {
+                      setOnlineTab('HOST');
+                      setFormError(null);
+                      try {
+                        playButtonTap();
+                      } catch {}
+                    }}
+                    className={cn(
+                      'flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all',
+                      onlineTab === 'HOST'
+                        ? 'bg-purple-500/25 text-purple-200 border border-purple-400/40 shadow-sm'
+                        : 'text-slate-400 hover:text-slate-200'
+                    )}
+                  >
+                    <PlusCircle className="w-3.5 h-3.5" />
+                    Buat Room (Host)
+                  </button>
+
+                  <button
+                    type="button"
+                    onClick={() => {
+                      setOnlineTab('JOIN');
+                      setFormError(null);
+                      try {
+                        playButtonTap();
+                      } catch {}
+                    }}
+                    className={cn(
+                      'flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all',
+                      onlineTab === 'JOIN'
+                        ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 shadow-sm'
+                        : 'text-slate-400 hover:text-slate-200'
+                    )}
+                  >
+                    <LogIn className="w-3.5 h-3.5" />
+                    Gabung Room
+                  </button>
+                </div>
+
+                {/* Nickname & Avatar Picker */}
+                <AvatarPicker
+                  nickname={playerName}
+                  onNicknameChange={setPlayerName}
+                  selectedAvatar={selectedAvatar}
+                  onSelectAvatar={setSelectedAvatar}
+                  className="space-y-3"
+                />
+
+                {/* Join Tab Specific: Room Code Input */}
+                {onlineTab === 'JOIN' && (
+                  <div className="space-y-1.5">
+                    <label className="text-xs font-semibold text-slate-300">
+                      Kode Room (4 Karakter)
+                    </label>
+                    <input
+                      type="text"
+                      placeholder="e.g. 7K9X"
+                      value={roomCodeInput}
+                      onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
+                      maxLength={4}
+                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 text-cyan-300 font-mono text-center font-bold text-lg tracking-widest uppercase placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
+                    />
+                  </div>
+                )}
+
+                {/* Error Banner */}
+                {(formError || error) && (
+                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
+                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
+                    <span>{formError || error}</span>
+                  </div>
+                )}
+              </div>
+
+              <div className="pt-5">
+                {onlineTab === 'HOST' ? (
+                  <Button
+                    variant="accent"
+                    size="lg"
+                    fullWidth
+                    isLoading={isSubmitting}
+                    onClick={handleCreateRoom}
+                    leftIcon={<PlusCircle className="w-5 h-5" />}
+                  >
+                    Buat Room Baru
+                  </Button>
+                ) : (
+                  <Button
+                    variant="primary"
+                    size="lg"
+                    fullWidth
+                    isLoading={isSubmitting}
+                    onClick={handleJoinRoom}
+                    leftIcon={<LogIn className="w-5 h-5" />}
+                  >
+                    Gabung Room Sekarang
+                  </Button>
+                )}
+              </div>
+            </Card>
+          </motion.div>
+        </div>
+
+        {/* Custom Word Pack Feature Button */}
+        <div className="flex items-center justify-center pt-2">
+          <Button
+            variant="secondary"
+            size="sm"
+            onClick={() => setIsPackModalOpen(true)}
+            leftIcon={<BookOpen className="w-4 h-4 text-cyan-400" />}
+            className="text-xs font-semibold border-cyan-500/20 hover:border-cyan-400/40"
+          >
+            Buka Pembuat Paket Kata Kustom
+          </Button>
+        </div>
+      </main>
+
+      {/* Custom Word Pack Modal */}
+      <CustomWordPackModal
+        isOpen={isPackModalOpen}
+        onClose={() => setIsPackModalOpen(false)}
+      />
+    </div>
+  );
+};
+
+export default HomePage;
diff --git a/client/src/pages/LobbyPage.tsx b/client/src/pages/LobbyPage.tsx
new file mode 100644
index 0000000..797eb4b
--- /dev/null
+++ b/client/src/pages/LobbyPage.tsx
@@ -0,0 +1,504 @@
+import React, { useState, useEffect } from 'react';
+import { motion } from 'motion/react';
+import {
+  Users,
+  Crown,
+  Play,
+  Share2,
+  Copy,
+  Check,
+  Settings2,
+  Timer,
+  Shield,
+  EyeOff,
+  HelpCircle,
+  BookOpen,
+  AlertCircle,
+  Wifi,
+} from 'lucide-react';
+import { Header } from '../components/common/Header';
+import { Button } from '../components/common/Button';
+import { Card } from '../components/common/Card';
+import { Badge, StatusBadge } from '../components/common/Badge';
+import { CustomWordPackModal } from '../components/lobby/CustomWordPackModal';
+import { useSocket } from '../hooks/useSocket';
+import { useGameSound } from '../hooks/useGameSound';
+import { CATEGORIES } from '../data/defaultWordPacks';
+import { CustomWordPack, WordPair } from '../types/game.types';
+import { cn } from '../utils/cn';
+
+export interface LobbyPageProps {
+  onLeaveRoom: () => void;
+  onGameStarted: () => void;
+}
+
+export const LobbyPage: React.FC<LobbyPageProps> = ({
+  onLeaveRoom,
+  onGameStarted,
+}) => {
+  const {
+    room,
+    currentPlayer,
+    updateSettings,
+    startGame,
+    leaveRoom,
+  } = useSocket();
+  const { playButtonTap } = useGameSound();
+
+
+  const [copiedCode, setCopiedCode] = useState(false);
+  const [copiedLink, setCopiedLink] = useState(false);
+  const [isStarting, setIsStarting] = useState(false);
+  const [isPackModalOpen, setIsPackModalOpen] = useState(false);
+  const [selectedCustomPack, setSelectedCustomPack] = useState<CustomWordPack | null>(null);
+  const [selectedCustomWordPair, setSelectedCustomWordPair] = useState<WordPair | null>(null);
+
+  const isHost = currentPlayer?.isHost ?? false;
+  const players = room?.players || [];
+  const totalPlayers = players.length;
+  const settings = room?.settings || {
+    category: 'Semua Kategori',
+    civilianCount: 3,
+    undercoverCount: 1,
+    mrWhiteCount: 1,
+    turnDurationSeconds: 45,
+    enableMrWhite: true,
+  };
+
+  // If room transitions out of LOBBY, trigger game start callback
+  useEffect(() => {
+    if (room && room.phase !== 'LOBBY') {
+      onGameStarted();
+    }
+  }, [room, onGameStarted]);
+
+  // Handle Copy Room Code
+  const handleCopyCode = async () => {
+    if (!room?.roomId) return;
+    try {
+      await navigator.clipboard.writeText(room.roomId);
+      setCopiedCode(true);
+      setTimeout(() => setCopiedCode(false), 2000);
+    } catch {}
+  };
+
+  // Handle Copy Share URL
+  const handleCopyShareLink = async () => {
+    if (!room?.roomId || typeof window === 'undefined') return;
+    const url = `${window.location.origin}?room=${room.roomId}`;
+    try {
+      await navigator.clipboard.writeText(url);
+      setCopiedLink(true);
+      setTimeout(() => setCopiedLink(false), 2000);
+    } catch {}
+  };
+
+  // Host Role Adjustments
+  const handleUpdateRoles = (undercover: number, enableMrWhite: boolean) => {
+    if (!isHost) return;
+    const mrWhite = enableMrWhite ? 1 : 0;
+    const maxUndercover = Math.max(1, Math.floor((totalPlayers - mrWhite) / 2));
+    const clampedUndercover = Math.min(Math.max(1, undercover), maxUndercover);
+    const civilian = Math.max(1, totalPlayers - clampedUndercover - mrWhite);
+
+    updateSettings({
+      undercoverCount: clampedUndercover,
+      enableMrWhite,
+      mrWhiteCount: mrWhite,
+      civilianCount: civilian,
+    });
+  };
+
+  // Host Category Change
+  const handleCategoryChange = (category: string) => {
+    if (!isHost) return;
+    setSelectedCustomPack(null);
+    setSelectedCustomWordPair(null);
+    updateSettings({ category });
+  };
+
+  // Host Custom Pack Selection
+  const handleSelectCustomPack = (pack: CustomWordPack) => {
+    if (!isHost) return;
+    setSelectedCustomPack(pack);
+    if (pack.wordPairs.length > 0) {
+      const randomPair = pack.wordPairs[Math.floor(Math.random() * pack.wordPairs.length)];
+      setSelectedCustomWordPair(randomPair);
+    }
+    updateSettings({ category: `Kustom: ${pack.title}` });
+  };
+
+  // Host Start Game
+  const handleStartGame = async () => {
+    if (!isHost || totalPlayers < 3) return;
+    setIsStarting(true);
+    try {
+      const res = await startGame(selectedCustomWordPair || undefined);
+      if (res.success) {
+        onGameStarted();
+      }
+    } catch (err) {
+      console.error(err);
+    } finally {
+      setIsStarting(false);
+    }
+  };
+
+  // Handle Leave
+  const handleLeave = async () => {
+    try {
+      playButtonTap();
+    } catch {}
+    await leaveRoom();
+    onLeaveRoom();
+  };
+
+  return (
+    <div className="min-h-[100dvh] bg-slate-950 text-slate-100 flex flex-col font-sans">
+      <Header
+        roomCode={room?.roomId}
+        showBack
+        onBack={handleLeave}
+        backLabel="Keluar Room"
+      />
+
+      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
+        {/* Room Header & Share Bar */}
+        <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/30 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
+          <div className="text-center sm:text-left space-y-1">
+            <div className="flex items-center justify-center sm:justify-start gap-2">
+              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
+                Lobby Permainan Online
+              </span>
+              <Badge variant="cyan" size="sm" pulse>
+                Menunggu Pemain
+              </Badge>
+            </div>
+            <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-slate-100 flex items-center justify-center sm:justify-start gap-2">
+              ROOM:{' '}
+              <span className="text-transparent bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text">
+                {room?.roomId || '----'}
+              </span>
+            </h2>
+            <p className="text-xs text-slate-400">
+              Bagikan kode atau link untuk mengundang teman ke room ini.
+            </p>
+          </div>
+
+          <div className="flex flex-wrap items-center justify-center gap-2">
+            <Button
+              variant="outline"
+              size="sm"
+              onClick={handleCopyCode}
+              leftIcon={copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
+            >
+              {copiedCode ? 'Kode Tersalin!' : 'Salin Kode'}
+            </Button>
+
+            <Button
+              variant="primary"
+              size="sm"
+              onClick={handleCopyShareLink}
+              leftIcon={copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
+            >
+              {copiedLink ? 'Link Tersalin!' : 'Bagikan Link'}
+            </Button>
+          </div>
+        </div>
+
+        {/* Two Columns Grid: Players List vs Game Settings */}
+        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
+          {/* Left: Connected Players (7 cols) */}
+          <div className="lg:col-span-7 space-y-4">
+            <div className="flex items-center justify-between px-1">
+              <div className="flex items-center gap-2">
+                <Users className="w-4 h-4 text-cyan-400" />
+                <h3 className="text-base font-bold text-slate-100 font-display">
+                  Pemain Terhubung ({totalPlayers}/20)
+                </h3>
+              </div>
+              <span className="text-xs font-mono text-slate-400">
+                Min. 3 Pemain
+              </span>
+            </div>
+
+            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
+              {players.map((player) => {
+                const isMe = player.id === currentPlayer?.id;
+
+                return (
+                  <motion.div
+                    key={player.id}
+                    initial={{ opacity: 0, scale: 0.95 }}
+                    animate={{ opacity: 1, scale: 1 }}
+                    className={cn(
+                      'p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3',
+                      isMe
+                        ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_15px_-3px_rgba(6,182,212,0.25)]'
+                        : 'bg-slate-900/70 border-white/10'
+                    )}
+                  >
+                    <div className="flex items-center gap-3 min-w-0">
+                      <div className="w-11 h-11 rounded-xl bg-slate-950/80 border border-white/10 flex items-center justify-center text-2xl shrink-0 shadow-inner">
+                        {player.avatar}
+                      </div>
+
+                      <div className="min-w-0">
+                        <div className="flex items-center gap-1.5">
+                          <span className="text-sm font-bold text-slate-100 truncate">
+                            {player.name}
+                          </span>
+                          {isMe && (
+                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 font-semibold">
+                              Kamu
+                            </span>
+                          )}
+                        </div>
+
+                        <div className="flex items-center gap-1.5 mt-0.5">
+                          {player.isHost ? (
+                            <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
+                              <Crown className="w-3 h-3 text-amber-400" /> Room Host
+                            </span>
+                          ) : (
+                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
+                              <Wifi className="w-3 h-3 text-emerald-400" /> Siap
+                            </span>
+                          )}
+                        </div>
+                      </div>
+                    </div>
+
+                    <div className="shrink-0">
+                      {player.isHost && (
+                        <StatusBadge status="host" size="sm" />
+                      )}
+                    </div>
+                  </motion.div>
+                );
+              })}
+            </div>
+
+            {totalPlayers < 3 && (
+              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
+                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
+                <span>Membutuhkan minimal 3 pemain untuk memulai game.</span>
+              </div>
+            )}
+          </div>
+
+          {/* Right: Room Settings (5 cols) */}
+          <div className="lg:col-span-5 space-y-4">
+            <Card
+              glow={isHost ? 'cyan' : 'none'}
+              padding="md"
+              className="space-y-4 bg-slate-900/90 border-white/10"
+            >
+              <div className="flex items-center justify-between border-b border-white/10 pb-3">
+                <div className="flex items-center gap-2">
+                  <Settings2 className="w-4 h-4 text-cyan-400" />
+                  <h3 className="text-sm sm:text-base font-bold text-slate-100 font-display">
+                    {isHost ? 'Pengaturan Game (Host)' : 'Pengaturan Game'}
+                  </h3>
+                </div>
+                {!isHost && (
+                  <Badge variant="slate" size="sm">
+                    Read-Only
+                  </Badge>
+                )}
+              </div>
+
+              {/* Category Selector */}
+              <div className="space-y-1.5">
+                <label className="text-xs font-semibold text-slate-300">Kategori Kata</label>
+                {isHost ? (
+                  <div className="space-y-2">
+                    <select
+                      value={selectedCustomPack ? `Kustom: ${selectedCustomPack.title}` : settings.category}
+                      onChange={(e) => handleCategoryChange(e.target.value)}
+                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-slate-100 text-xs sm:text-sm font-medium focus:outline-none focus:border-cyan-400 cursor-pointer"
+                    >
+                      {CATEGORIES.map((cat) => (
+                        <option key={cat} value={cat} className="bg-slate-900 text-slate-100">
+                          {cat}
+                        </option>
+                      ))}
+                      {selectedCustomPack && (
+                        <option
+                          value={`Kustom: ${selectedCustomPack.title}`}
+                          className="bg-slate-900 text-cyan-300 font-bold"
+                        >
+                          Kustom: {selectedCustomPack.title}
+                        </option>
+                      )}
+                    </select>
+
+                    <Button
+                      type="button"
+                      variant="secondary"
+                      size="sm"
+                      onClick={() => setIsPackModalOpen(true)}
+                      leftIcon={<BookOpen className="w-3.5 h-3.5 text-cyan-400" />}
+                      className="w-full text-xs"
+                    >
+                      {selectedCustomPack ? `Ganti Paket Kustom (${selectedCustomPack.title})` : 'Pilih / Buat Paket Kustom'}
+                    </Button>
+                  </div>
+                ) : (
+                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 text-xs font-bold text-cyan-300 font-mono">
+                    {settings.category}
+                  </div>
+                )}
+              </div>
+
+              {/* Role Distribution */}
+              <div className="space-y-2 pt-1">
+                <div className="flex items-center justify-between">
+                  <label className="text-xs font-semibold text-slate-300">Distribusi Peran</label>
+                  <span className="text-[11px] font-mono text-slate-400">
+                    Total: {totalPlayers} Pemain
+                  </span>
+                </div>
+
+                <div className="space-y-2">
+                  {/* Civilian info */}
+                  <div className="flex items-center justify-between p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs">
+                    <span className="flex items-center gap-1.5 font-semibold text-cyan-300">
+                      <Shield className="w-3.5 h-3.5" /> Warga (Civilian)
+                    </span>
+                    <span className="font-mono font-bold text-cyan-200">
+                      {Math.max(1, totalPlayers - settings.undercoverCount - (settings.enableMrWhite ? 1 : 0))} Orang
+                    </span>
+                  </div>
+
+                  {/* Undercover slider/controls */}
+                  <div className="flex items-center justify-between p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs">
+                    <span className="flex items-center gap-1.5 font-semibold text-rose-300">
+                      <EyeOff className="w-3.5 h-3.5" /> Impostor (Undercover)
+                    </span>
+                    {isHost ? (
+                      <div className="flex items-center gap-2">
+                        <button
+                          type="button"
+                          onClick={() => handleUpdateRoles(settings.undercoverCount - 1, settings.enableMrWhite)}
+                          disabled={settings.undercoverCount <= 1}
+                          className="w-6 h-6 rounded bg-slate-900 border border-rose-500/30 text-rose-300 flex items-center justify-center font-bold disabled:opacity-40"
+                        >
+                          -
+                        </button>
+                        <span className="font-mono font-bold text-rose-200 w-4 text-center">
+                          {settings.undercoverCount}
+                        </span>
+                        <button
+                          type="button"
+                          onClick={() => handleUpdateRoles(settings.undercoverCount + 1, settings.enableMrWhite)}
+                          disabled={
+                            settings.undercoverCount >=
+                            Math.max(1, Math.floor((totalPlayers - (settings.enableMrWhite ? 1 : 0)) / 2))
+                          }
+                          className="w-6 h-6 rounded bg-slate-900 border border-rose-500/30 text-rose-300 flex items-center justify-center font-bold disabled:opacity-40"
+                        >
+                          +
+                        </button>
+                      </div>
+                    ) : (
+                      <span className="font-mono font-bold text-rose-200">
+                        {settings.undercoverCount} Orang
+                      </span>
+                    )}
+                  </div>
+
+                  {/* Mr White toggle */}
+                  <div className="flex items-center justify-between p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs">
+                    <span className="flex items-center gap-1.5 font-semibold text-purple-300">
+                      <HelpCircle className="w-3.5 h-3.5" /> Mr. White (Buta Kata)
+                    </span>
+                    {isHost ? (
+                      <label className="flex items-center gap-1.5 cursor-pointer">
+                        <input
+                          type="checkbox"
+                          checked={settings.enableMrWhite}
+                          onChange={(e) => handleUpdateRoles(settings.undercoverCount, e.target.checked)}
+                          className="rounded border-white/20 bg-slate-900 text-purple-500 focus:ring-purple-500"
+                        />
+                        <span className="font-mono text-xs text-purple-200">
+                          {settings.enableMrWhite ? 'Aktif (1)' : 'Nonaktif (0)'}
+                        </span>
+                      </label>
+                    ) : (
+                      <span className="font-mono font-bold text-purple-200">
+                        {settings.enableMrWhite ? '1 Orang' : 'Tidak Ada'}
+                      </span>
+                    )}
+                  </div>
+                </div>
+              </div>
+
+              {/* Turn Duration Slider */}
+              <div className="space-y-1.5 pt-1">
+                <div className="flex items-center justify-between text-xs">
+                  <span className="font-semibold text-slate-300 flex items-center gap-1">
+                    <Timer className="w-3.5 h-3.5 text-cyan-400" />
+                    Durasi Bicara
+                  </span>
+                  <span className="font-mono font-bold text-cyan-300">
+                    {settings.turnDurationSeconds} Detik
+                  </span>
+                </div>
+                {isHost && (
+                  <input
+                    type="range"
+                    min={15}
+                    max={90}
+                    step={5}
+                    value={settings.turnDurationSeconds}
+                    onChange={(e) => updateSettings({ turnDurationSeconds: Number(e.target.value) })}
+                    className="w-full accent-cyan-400 cursor-pointer"
+                  />
+                )}
+              </div>
+
+              {/* Start Game Action (Host) or Status Note (Non-Host) */}
+              <div className="pt-3 border-t border-white/10">
+                {isHost ? (
+                  <Button
+                    variant="primary"
+                    size="lg"
+                    fullWidth
+                    disabled={totalPlayers < 3}
+                    isLoading={isStarting}
+                    onClick={handleStartGame}
+                    leftIcon={<Play className="w-5 h-5 fill-current" />}
+                  >
+                    {totalPlayers < 3
+                      ? `Menunggu Pemain (${totalPlayers}/3)`
+                      : 'Mulai Permainan Sekarang'}
+                  </Button>
+                ) : (
+                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/5 text-center space-y-1">
+                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-200">
+                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
+                      <span>Menunggu Host Memulai Permainan...</span>
+                    </div>
+                    <p className="text-[11px] text-slate-400">
+                      Permainan akan otomatis dimulai di layarmu begitu Host menekan tombol mulai.
+                    </p>
+                  </div>
+                )}
+              </div>
+            </Card>
+          </div>
+        </div>
+      </main>
+
+      {/* Custom Word Pack Selector Modal */}
+      <CustomWordPackModal
+        isOpen={isPackModalOpen}
+        onClose={() => setIsPackModalOpen(false)}
+        onSelectPack={handleSelectCustomPack}
+      />
+    </div>
+  );
+};
+
+export default LobbyPage;
diff --git a/client/src/pages/RoomGamePage.tsx b/client/src/pages/RoomGamePage.tsx
new file mode 100644
index 0000000..d27bbf1
--- /dev/null
+++ b/client/src/pages/RoomGamePage.tsx
@@ -0,0 +1,569 @@
+import React, { useState, useEffect, useRef } from 'react';
+import { motion } from 'motion/react';
+import {
+  Mic,
+  Trophy,
+  RotateCcw,
+  LogOut,
+  CheckCircle2,
+  Skull,
+  Clock,
+  ArrowRight,
+} from 'lucide-react';
+import { Header } from '../components/common/Header';
+import { Button } from '../components/common/Button';
+import { Card } from '../components/common/Card';
+import { Badge, RoleBadge } from '../components/common/Badge';
+import { SecretCard } from '../components/game/SecretCard';
+import { CountdownTimer } from '../components/game/CountdownTimer';
+import { VotingGrid } from '../components/game/VotingGrid';
+import { MrWhiteModal } from '../components/game/MrWhiteModal';
+import { useSocket } from '../hooks/useSocket';
+import { useGameSound } from '../hooks/useGameSound';
+import { cn } from '../utils/cn';
+
+export interface RoomGamePageProps {
+  onReturnToLobby: () => void;
+  onExitRoom: () => void;
+}
+
+export const RoomGamePage: React.FC<RoomGamePageProps> = ({
+  onReturnToLobby,
+  onExitRoom,
+}) => {
+  const {
+    room,
+    currentPlayer,
+    advanceTurn,
+    syncTimerTick,
+    castVote,
+    submitMrWhiteGuess,
+    rematch,
+    leaveRoom,
+    tieNotification,
+  } = useSocket();
+
+  const {
+    playElimination,
+    playVictory,
+    playDefeat,
+    playButtonTap,
+  } = useGameSound();
+
+  const [localSecondsRemaining, setLocalSecondsRemaining] = useState<number>(45);
+  const [isAdvancing, setIsAdvancing] = useState(false);
+  const [isRematching, setIsRematching] = useState(false);
+  const soundPlayedForGameOverRef = useRef(false);
+
+
+  const phase = room?.phase || 'LOBBY';
+  const players = room?.players || [];
+  const isHost = currentPlayer?.isHost ?? false;
+  const isAlive = currentPlayer?.isAlive ?? true;
+
+  // Speaker tracking
+  const livingSpeakers = (room?.speakingOrder || []).filter((id) =>
+    players.find((p) => p.id === id)?.isAlive
+  );
+  const currentSpeakerId = livingSpeakers[room?.currentSpeakerIndex ?? 0];
+  const currentSpeaker = players.find((p) => p.id === currentSpeakerId);
+  const isCurrentSpeakerMe = currentSpeaker?.id === currentPlayer?.id;
+
+  // Turn timer countdown effect
+  useEffect(() => {
+    if (phase !== 'TURN_PHASE') return;
+
+    setLocalSecondsRemaining(room?.activeTurnRemainingSeconds ?? 45);
+
+    const timer = setInterval(() => {
+      setLocalSecondsRemaining((prev) => {
+        if (prev <= 1) {
+          clearInterval(timer);
+          // If speaker or host, advance turn automatically when timer runs out
+          if (isCurrentSpeakerMe || isHost) {
+            advanceTurn();
+          }
+          return 0;
+        }
+        const nextSec = prev - 1;
+        if (isHost && nextSec % 5 === 0) {
+          syncTimerTick(nextSec);
+        }
+        return nextSec;
+      });
+    }, 1000);
+
+    return () => clearInterval(timer);
+  }, [phase, room?.currentSpeakerIndex, isCurrentSpeakerMe, isHost, advanceTurn, syncTimerTick, room?.activeTurnRemainingSeconds]);
+
+  // Sync turn remaining seconds from socket state if changed externally
+  useEffect(() => {
+    if (room?.activeTurnRemainingSeconds !== undefined) {
+      setLocalSecondsRemaining(room.activeTurnRemainingSeconds);
+    }
+  }, [room?.activeTurnRemainingSeconds]);
+
+  // Phase transition handlers
+  useEffect(() => {
+    if (phase === 'LOBBY') {
+      onReturnToLobby();
+    }
+  }, [phase, onReturnToLobby]);
+
+  // Sound effects on Game Over
+  useEffect(() => {
+    if (phase === 'GAME_OVER' && !soundPlayedForGameOverRef.current) {
+      soundPlayedForGameOverRef.current = true;
+      const winner = room?.winningRole;
+      const isMyWin =
+        (winner === 'CIVILIAN' && currentPlayer?.role === 'CIVILIAN') ||
+        (winner === 'UNDERCOVER' && currentPlayer?.role === 'UNDERCOVER') ||
+        (winner === 'MR_WHITE' && currentPlayer?.role === 'MR_WHITE');
+
+      if (isMyWin) {
+        try {
+          playVictory();
+        } catch {}
+      } else {
+        try {
+          playDefeat();
+        } catch {}
+      }
+    } else if (phase !== 'GAME_OVER') {
+      soundPlayedForGameOverRef.current = false;
+    }
+  }, [phase, room?.winningRole, currentPlayer?.role, playVictory, playDefeat]);
+
+  // Sound effects on Elimination
+  useEffect(() => {
+    if (room?.eliminatedPlayer) {
+      try {
+        playElimination();
+      } catch {}
+    }
+  }, [room?.eliminatedPlayer, playElimination]);
+
+  // Handle Advance Turn Action
+  const handleAdvanceTurn = async () => {
+    if (isAdvancing) return;
+    setIsAdvancing(true);
+    try {
+      playButtonTap();
+    } catch {}
+    try {
+      await advanceTurn();
+    } catch (err) {
+      console.error('Failed to advance turn:', err);
+    } finally {
+      setIsAdvancing(false);
+    }
+  };
+
+  // Handle Rematch
+  const handleRematch = async () => {
+    if (!isHost || isRematching) return;
+    setIsRematching(true);
+    try {
+      const res = await rematch();
+      if (res.success) {
+        onReturnToLobby();
+      }
+    } catch (err) {
+      console.error('Failed to rematch:', err);
+    } finally {
+      setIsRematching(false);
+    }
+  };
+
+  // Handle Exit
+  const handleExit = async () => {
+    try {
+      playButtonTap();
+    } catch {}
+    await leaveRoom();
+    onExitRoom();
+  };
+
+  return (
+    <div className="min-h-[100dvh] bg-slate-950 text-slate-100 flex flex-col font-sans">
+      <Header
+        roomCode={room?.roomId}
+        showBack
+        onBack={handleExit}
+        backLabel="Keluar"
+      />
+
+      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8 flex flex-col justify-center space-y-6">
+        {/* Top Game Stage Header */}
+        <div className="flex items-center justify-between px-2">
+          <div className="flex items-center gap-2">
+            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
+              Ronde {room?.round || 1}
+            </span>
+            <span className="text-slate-600">&bull;</span>
+            <span className="text-xs font-semibold text-slate-300">
+              {phase === 'ROLE_REVEAL'
+                ? 'Pembagian Peran Rahasia'
+                : phase === 'TURN_PHASE'
+                ? 'Putaran Diskusi & Penjelasan'
+                : phase === 'VOTING'
+                ? 'Pemungutan Suara (Voting)'
+                : phase === 'MR_WHITE_GUESS'
+                ? 'Tebakan Darurat Mr. White'
+                : 'Permainan Selesai'}
+            </span>
+          </div>
+
+          <div className="flex items-center gap-2">
+            {currentPlayer?.role && (
+              <RoleBadge role={currentPlayer.role} size="sm" />
+            )}
+            {!isAlive && (
+              <Badge variant="slate" size="sm" icon={<Skull className="w-3 h-3 text-rose-400" />}>
+                Eliminasi
+              </Badge>
+            )}
+          </div>
+        </div>
+
+        {/* PHASE 1: ROLE_REVEAL */}
+        {phase === 'ROLE_REVEAL' && (
+          <motion.div
+            initial={{ opacity: 0, scale: 0.95 }}
+            animate={{ opacity: 1, scale: 1 }}
+            className="space-y-6"
+          >
+            <div className="text-center space-y-2">
+              <h2 className="text-xl sm:text-2xl font-black font-display text-slate-100">
+                Kartu Identitas Rahasiamu
+              </h2>
+              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
+                Tahan tombol kartu di bawah untuk melihat peran dan kata rahasiamu. Jangan biarkan pemain lain melihat!
+              </p>
+            </div>
+
+            <SecretCard
+              role={currentPlayer?.role}
+              word={currentPlayer?.word}
+              category={room?.settings.category}
+            />
+
+
+            <div className="flex flex-col items-center justify-center space-y-3 pt-2">
+              {isHost ? (
+                <Button
+                  variant="primary"
+                  size="lg"
+                  className="max-w-xs w-full shadow-lg shadow-cyan-500/30"
+                  isLoading={isAdvancing}
+                  onClick={handleAdvanceTurn}
+                  rightIcon={<ArrowRight className="w-5 h-5" />}
+                >
+                  Mulai Putaran Bicara (Host)
+                </Button>
+              ) : (
+                <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 text-center text-xs text-slate-300 flex items-center gap-2">
+                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
+                  <span>Menunggu Host memulai putaran diskusi...</span>
+                </div>
+              )}
+            </div>
+          </motion.div>
+        )}
+
+        {/* PHASE 2: TURN_PHASE (Speaking Round) */}
+        {phase === 'TURN_PHASE' && (
+          <motion.div
+            initial={{ opacity: 0, y: 15 }}
+            animate={{ opacity: 1, y: 0 }}
+            className="space-y-6"
+          >
+            {/* Active Speaker Spotlight Card */}
+            <Card
+              glow={isCurrentSpeakerMe ? 'cyan' : 'none'}
+              padding="lg"
+              className={cn(
+                'text-center space-y-5 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border transition-all duration-300',
+                isCurrentSpeakerMe
+                  ? 'border-cyan-400 shadow-[0_0_35px_-5px_rgba(6,182,212,0.4)]'
+                  : 'border-white/10'
+              )}
+            >
+              {/* Turn indicator count */}
+              <div className="flex items-center justify-between border-b border-white/10 pb-3">
+                <span className="text-xs font-mono text-slate-400">
+                  Pembicara {(room?.currentSpeakerIndex ?? 0) + 1} dari {livingSpeakers.length}
+                </span>
+                {isCurrentSpeakerMe ? (
+                  <Badge variant="cyan" size="sm" pulse icon={<Mic className="w-3.5 h-3.5" />}>
+                    Giliranmu Bicara!
+                  </Badge>
+                ) : (
+                  <Badge variant="slate" size="sm">
+                    Mendengarkan
+                  </Badge>
+                )}
+              </div>
+
+              {/* Speaker Avatar & Name */}
+              <div className="flex flex-col items-center space-y-2">
+                <motion.div
+                  animate={isCurrentSpeakerMe ? { scale: [1, 1.08, 1] } : {}}
+                  transition={{ repeat: Infinity, duration: 1.8 }}
+                  className={cn(
+                    'w-20 h-20 rounded-3xl flex items-center justify-center text-4xl border relative shadow-xl',
+                    isCurrentSpeakerMe
+                      ? 'bg-cyan-500/20 border-cyan-400 shadow-cyan-500/30'
+                      : 'bg-slate-900 border-white/10'
+                  )}
+                >
+                  {currentSpeaker?.avatar || '🕵️'}
+                  <span className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-slate-950 border border-cyan-500/40 text-cyan-400">
+                    <Mic className="w-4 h-4 animate-pulse" />
+                  </span>
+                </motion.div>
+
+                <div>
+                  <h3 className="text-xl sm:text-2xl font-black font-display text-slate-100">
+                    {currentSpeaker?.name || 'Pemain'}
+                  </h3>
+                  <p className="text-xs text-slate-400">
+                    {isCurrentSpeakerMe
+                      ? 'Berikan 1 petunjuk kata rahasiamu tanpa membuatnya terlalu jelas!'
+                      : 'Simak petunjuk yang diberikan dan perhatikan kejanggalannya.'}
+                  </p>
+                </div>
+              </div>
+
+              {/* Countdown Timer */}
+              <div className="py-2 flex justify-center">
+                <CountdownTimer
+                  totalSeconds={room?.settings.turnDurationSeconds || 45}
+                  remainingSeconds={localSecondsRemaining}
+                  variant="circular"
+                  size={120}
+                />
+              </div>
+
+              {/* Speaker / Host Action Buttons */}
+              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
+                {isCurrentSpeakerMe ? (
+                  <Button
+                    variant="primary"
+                    size="lg"
+                    isLoading={isAdvancing}
+                    onClick={handleAdvanceTurn}
+                    rightIcon={<ArrowRight className="w-5 h-5" />}
+                    className="w-full sm:w-auto shadow-lg shadow-cyan-500/30 font-bold"
+                  >
+                    Selesai Bicara (Serahkan Giliran)
+                  </Button>
+                ) : isHost ? (
+                  <Button
+                    variant="secondary"
+                    size="sm"
+                    isLoading={isAdvancing}
+                    onClick={handleAdvanceTurn}
+                    leftIcon={<Clock className="w-4 h-4" />}
+                    className="text-xs text-slate-400 hover:text-slate-200"
+                  >
+                    Lewati / Lanjut Giliran (Host Control)
+                  </Button>
+                ) : null}
+              </div>
+            </Card>
+
+            {/* Speaking Queue Horizontal List */}
+            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
+              <span className="text-[11px] font-mono uppercase text-slate-500 block">
+                Urutan Berbicara Ronde Ini:
+              </span>
+              <div className="flex items-center gap-2 overflow-x-auto pb-1">
+                {livingSpeakers.map((id, index) => {
+                  const spk = players.find((p) => p.id === id);
+                  const isCur = id === currentSpeakerId;
+                  const isDone = index < (room?.currentSpeakerIndex ?? 0);
+
+                  return (
+                    <div
+                      key={id}
+                      className={cn(
+                        'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap shrink-0 transition-all',
+                        isCur
+                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm ring-1 ring-cyan-400'
+                          : isDone
+                          ? 'bg-slate-950/40 border-white/5 text-slate-600 line-through'
+                          : 'bg-slate-900/70 border-white/10 text-slate-300'
+                      )}
+                    >
+                      <span>{spk?.avatar}</span>
+                      <span>{spk?.name}</span>
+                      {isDone && <CheckCircle2 className="w-3 h-3 text-slate-600" />}
+                    </div>
+                  );
+                })}
+              </div>
+            </div>
+          </motion.div>
+        )}
+
+        {/* PHASE 3: VOTING */}
+        {phase === 'VOTING' && (
+          <VotingGrid
+            players={players}
+            currentPlayer={currentPlayer}
+            onCastVote={castVote}
+            isTie={tieNotification}
+            roundNumber={room?.round || 1}
+          />
+        )}
+
+        {/* PHASE 4: MR_WHITE_GUESS (Modal Overlay) */}
+        <MrWhiteModal
+          isOpen={phase === 'MR_WHITE_GUESS'}
+          isMrWhite={currentPlayer?.role === 'MR_WHITE'}
+          mrWhitePlayer={room?.eliminatedPlayer || players.find((p) => p.role === 'MR_WHITE')}
+          onSubmitGuess={submitMrWhiteGuess}
+        />
+
+        {/* PHASE 5: GAME_OVER */}
+        {phase === 'GAME_OVER' && (
+          <motion.div
+            initial={{ opacity: 0, scale: 0.95 }}
+            animate={{ opacity: 1, scale: 1 }}
+            className="space-y-6"
+          >
+            {/* Victory / Defeat Big Banner */}
+            <div
+              className={cn(
+                'p-6 sm:p-8 rounded-3xl border text-center space-y-4 shadow-2xl relative overflow-hidden',
+                room?.winningRole === 'CIVILIAN'
+                  ? 'bg-cyan-950/40 border-cyan-500/50 shadow-cyan-950/50'
+                  : room?.winningRole === 'UNDERCOVER'
+                  ? 'bg-rose-950/40 border-rose-500/50 shadow-rose-950/50'
+                  : 'bg-purple-950/40 border-purple-500/50 shadow-purple-950/50'
+              )}
+            >
+              <div className="w-16 h-16 mx-auto rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl shadow-inner">
+                <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
+              </div>
+
+              <div className="space-y-1">
+                <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">
+                  HASIL PERTANDINGAN
+                </span>
+                <h2 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white">
+                  {room?.winningRole === 'CIVILIAN'
+                    ? 'WARGA SIPIL MENANG!'
+                    : room?.winningRole === 'UNDERCOVER'
+                    ? 'IMPOSTOR (UNDERCOVER) MENANG!'
+                    : 'MR. WHITE BERHASIL MENEBAK & MENANG!'}
+                </h2>
+                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
+                  {room?.winningRole === 'CIVILIAN'
+                    ? 'Semua impostor & Mr. White telah berhasil dieliminasi dari kelompok!'
+                    : room?.winningRole === 'UNDERCOVER'
+                    ? 'Impostor berhasil menyamarkan diri dan mengelabui warga sipil!'
+                    : 'Mr. White berhasil menebak kata rahasia warga dengan tepat!'}
+                </p>
+              </div>
+
+              {/* Word Pair Summary Reveal */}
+              {room?.wordPair && (
+                <div className="flex flex-wrap items-center justify-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/10 max-w-lg mx-auto">
+                  <div className="text-center">
+                    <span className="text-[10px] uppercase font-mono text-cyan-400 block font-bold">
+                      Kata Warga
+                    </span>
+                    <span className="text-base sm:text-lg font-black text-white font-mono uppercase">
+                      {room.wordPair.civilianWord}
+                    </span>
+                  </div>
+                  <span className="text-slate-600 font-bold text-lg">vs</span>
+                  <div className="text-center">
+                    <span className="text-[10px] uppercase font-mono text-rose-400 block font-bold">
+                      Kata Undercover
+                    </span>
+                    <span className="text-base sm:text-lg font-black text-white font-mono uppercase">
+                      {room.wordPair.undercoverWord}
+                    </span>
+                  </div>
+                </div>
+              )}
+            </div>
+
+            {/* All Players Identity Reveal Table */}
+            <div className="space-y-3">
+              <h3 className="text-sm font-bold text-slate-200 font-display px-1">
+                Bongkar Identitas Semua Agen
+              </h3>
+
+              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
+                {players.map((player) => (
+                  <div
+                    key={player.id}
+                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-between gap-3"
+                  >
+                    <div className="flex items-center gap-3">
+                      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center text-xl shrink-0">
+                        {player.avatar}
+                      </div>
+                      <div>
+                        <div className="flex items-center gap-1.5">
+                          <span className="text-sm font-bold text-slate-100">{player.name}</span>
+                          {player.id === currentPlayer?.id && (
+                            <span className="text-[10px] font-mono text-cyan-400">(Kamu)</span>
+                          )}
+                        </div>
+                        <span className="text-xs font-mono text-slate-400">
+                          Kata: {player.word || 'Tidak Ada'}
+                        </span>
+                      </div>
+                    </div>
+
+                    <div className="shrink-0">
+                      {player.role && <RoleBadge role={player.role} size="sm" />}
+                    </div>
+                  </div>
+                ))}
+              </div>
+            </div>
+
+            {/* Rematch & Home Navigation Actions */}
+            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
+              {isHost ? (
+                <Button
+                  variant="primary"
+                  size="lg"
+                  isLoading={isRematching}
+                  onClick={handleRematch}
+                  leftIcon={<RotateCcw className="w-5 h-5" />}
+                  className="w-full sm:w-auto shadow-lg shadow-cyan-500/30"
+                >
+                  Main Lagi (Rematch Lobby)
+                </Button>
+              ) : (
+                <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 text-xs text-slate-300 flex items-center gap-2">
+                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
+                  <span>Menunggu Host memulai rematch...</span>
+                </div>
+              )}
+
+              <Button
+                variant="secondary"
+                size="lg"
+                onClick={handleExit}
+                leftIcon={<LogOut className="w-5 h-5" />}
+                className="w-full sm:w-auto"
+              >
+                Keluar ke Menu Utama
+              </Button>
+            </div>
+          </motion.div>
+        )}
+      </main>
+    </div>
+  );
+};
+
+export default RoomGamePage;

```
