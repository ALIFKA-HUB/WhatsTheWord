# Undercover Web Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, responsive Undercover word deduction web game supporting both Multi-Device (realtime Socket.io rooms) and Single-Device Pass & Play modes with Indonesian word packs, custom pack creation, interactive audio SFX, and sleek dark cyber UI.

**Architecture:** Monorepo in `games/undercover/` containing a React 18 + Vite + TypeScript + Tailwind CSS frontend (`client/`) and a Node.js + Express + Socket.io backend (`server/`). Features a deterministic Game Engine with role allocation, turn-based timer, secret voting, Mr. White fuzzy word matcher, and session auto-recovery.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Motion (`motion/react`), Socket.io / Socket.io-client, Node.js, Express, Vitest.

## Global Constraints
- Target workspace folder: `games/undercover/` (client in `games/undercover/client`, server in `games/undercover/server`)
- Zero placeholders: All types, interfaces, state models, and handlers are fully defined.
- Mobile-first responsive UI with safe viewport height (`min-h-[100dvh]`).
- Clean separation between offline Pass & Play state machine and online Socket.io state machine.

---

### Task 1: Scaffolding & Shared Data Types

**Files:**
- Create: `games/undercover/package.json`
- Create: `games/undercover/server/package.json`
- Create: `games/undercover/server/tsconfig.json`
- Create: `games/undercover/client/package.json`
- Create: `games/undercover/client/tsconfig.json`
- Create: `games/undercover/client/vite.config.ts`
- Create: `games/undercover/client/src/types/game.types.ts`
- Create: `games/undercover/server/src/types/game.types.ts`

**Interfaces:**
- Produces: `Player`, `Role` (`"CIVILIAN" | "UNDERCOVER" | "MR_WHITE"`), `GamePhase` (`"LOBBY" | "ROLE_REVEAL" | "TURN_PHASE" | "VOTING" | "TIE_BREAKER" | "MR_WHITE_GUESS" | "GAME_OVER"`), `WordPair`, `RoomState`, `GameSettings`.

- [ ] **Step 1: Create root and workspace package files**
Create `games/undercover/package.json` with scripts to run client and server concurrently.
- [ ] **Step 2: Define shared TypeScript game types**
Create `game.types.ts` in both client and server containing definitions for `PlayerRole`, `GamePhase`, `RoomState`, `VoteRecord`, and `WordPair`.
- [ ] **Step 3: Setup Client Vite + React + TypeScript configuration**
Setup Vite config with Tailwind CSS and path aliases.
- [ ] **Step 4: Verify workspace setup & build tooling**
Run `npm install` and verify TypeScript compile passes in both client and server.

---

### Task 2: Core Word Bank & Game Engine Domain Logic

**Files:**
- Create: `games/undercover/server/src/data/defaultWordPacks.ts`
- Create: `games/undercover/server/src/engine/GameEngine.ts`
- Create: `games/undercover/server/src/engine/WordMatcher.ts`
- Create: `games/undercover/client/src/data/defaultWordPacks.ts`
- Test: `games/undercover/server/tests/GameEngine.test.ts`
- Test: `games/undercover/server/tests/WordMatcher.test.ts`

**Interfaces:**
- Produces: `GameEngine.assignRoles(players, settings, wordPair)`, `GameEngine.calculateVotes(votes, activePlayers)`, `GameEngine.checkWinCondition(activePlayers)`, `WordMatcher.isMatch(guessed, target)`.

- [ ] **Step 1: Write failing tests for GameEngine role assignment and win condition evaluation**
Test role distributions (3 players = 2 Civilians, 1 Undercover; 6 players = 4 Civilians, 1 Undercover, 1 Mr. White), voting resolution, and win conditions.
- [ ] **Step 2: Write failing tests for WordMatcher**
Test case-insensitive match, trimmed whitespace, and minor fuzzy tolerances (e.g. "kopi" matches "Kopi", "teh manis" matches "Teh").
- [ ] **Step 3: Implement default Indonesian Word Packs**
Provide curated word pairs across 5 categories: Makanan & Minuman, Hewan, Benda & Gadget, Tempat, Profesi.
- [ ] **Step 4: Implement GameEngine and WordMatcher classes**
Implement pure logic for state transitions, tie-breaker handling, and Mr. White win verification.
- [ ] **Step 5: Run tests and verify 100% pass**
Run `npm test` in `games/undercover/server` to confirm all game engine rules pass.

---

### Task 3: Realtime Backend Server & Socket.io Handlers

**Files:**
- Create: `games/undercover/server/src/managers/RoomManager.ts`
- Create: `games/undercover/server/src/handlers/roomHandler.ts`
- Create: `games/undercover/server/src/handlers/gameHandler.ts`
- Create: `games/undercover/server/src/handlers/voteHandler.ts`
- Create: `games/undercover/server/src/server.ts`
- Test: `games/undercover/server/tests/RoomManager.test.ts`

**Interfaces:**
- Produces: Socket event listeners for `room:create`, `room:join`, `room:leave`, `game:start`, `turn:next`, `vote:cast`, `mrwhite:guess`, `player:reconnect`.
- Emits: `room:update`, `game:state`, `turn:active`, `vote:result`, `mrwhite:prompt`, `game:over`.

- [ ] **Step 1: Write unit tests for RoomManager**
Test room creation (generating unique 4-letter room codes), joining players, role allocation on start, handling disconnection, and token recovery.
- [ ] **Step 2: Implement RoomManager state store**
Maintain in-memory room registry with auto-cleanup of idle rooms after 2 hours.
- [ ] **Step 3: Implement Socket.io event handlers**
Separate handlers into `roomHandler.ts`, `gameHandler.ts`, and `voteHandler.ts`.
- [ ] **Step 4: Implement Express + HTTP + Socket.io bootstrap in `server.ts`**
Add CORS configuration, healthcheck endpoint `/health`, and error logging.
- [ ] **Step 5: Test Socket.io server connection and event flow**
Run integration test connecting 4 mock socket clients to play a full game round.

---

### Task 4: Client Audio Engine & Socket Context

**Files:**
- Create: `games/undercover/client/src/utils/soundSynthesizer.ts`
- Create: `games/undercover/client/src/context/AudioContext.tsx`
- Create: `games/undercover/client/src/context/SocketContext.tsx`
- Create: `games/undercover/client/src/hooks/useGameSound.ts`
- Create: `games/undercover/client/src/hooks/useSocket.ts`

**Interfaces:**
- Produces: `useGameSound()` (`playTick()`, `playRoleReveal()`, `playVoteBuzzer()`, `playVictory()`, `playDefeat()`, `toggleMute()`, `isMuted`), `useSocket()` (`socket`, `connected`, `roomId`, `playerToken`, `reconnect()`).

- [ ] **Step 1: Implement Web Audio API Synthesizer (`soundSynthesizer.ts`)**
Build zero-external-asset audio generator for clean, responsive sound effects (Timer tick, Role suspense sting, Vote buzz, Victory arpeggio).
- [ ] **Step 2: Build `AudioContext` and `useGameSound` hook**
Provide global audio state with localStorage mute persistence.
- [ ] **Step 3: Build `SocketContext` and `useSocket` hook**
Manage Socket.io client connection lifecycle, room event dispatching, and session persistence in `localStorage`.

---

### Task 5: UI Design System & Interactive Components

**Files:**
- Create: `games/undercover/client/src/components/common/Header.tsx`
- Create: `games/undercover/client/src/components/common/Button.tsx`
- Create: `games/undercover/client/src/components/common/Card.tsx`
- Create: `games/undercover/client/src/components/common/Badge.tsx`
- Create: `games/undercover/client/src/components/common/Modal.tsx`
- Create: `games/undercover/client/src/components/game/SecretCard.tsx`
- Create: `games/undercover/client/src/components/game/CountdownTimer.tsx`
- Create: `games/undercover/client/src/components/game/AvatarBadge.tsx`

**Interfaces:**
- Produces: Reusable UI widgets following Sleek Dark Cyber aesthetic with neon glow borders, smooth Motion interactions, and accessible keyboard/touch triggers.

- [ ] **Step 1: Implement base atomic components (`Button`, `Card`, `Badge`, `Modal`)**
Style with Tailwind CSS using Cyber Navy `#0a0f1d`, Cyan `#06b6d4`, Crimson `#f43f5e`, and Purple `#a855f7`.
- [ ] **Step 2: Build `SecretCard` component**
Include touch/click-and-hold reveal mechanics with haptic/sound trigger and blur mask animation.
- [ ] **Step 3: Build `CountdownTimer` component**
Render circular/bar progress timer with color changes (Cyan -> Amber -> Crimson) and synchronized tick sound.
- [ ] **Step 4: Build `AvatarBadge` component**
Display player avatar with dynamic status badges: *Active*, *Speaking*, *Voted*, *Eliminated*.

---

### Task 6: Pass & Play (Single-Device) Mode Implementation

**Files:**
- Create: `games/undercover/client/src/pages/PassPlaySetupPage.tsx`
- Create: `games/undercover/client/src/pages/PassPlayGamePage.tsx`
- Create: `games/undercover/client/src/context/PassPlayContext.tsx`

**Interfaces:**
- Produces: Standalone offline game session controller running local state machine for 1-device multiplayer.

- [ ] **Step 1: Build Pass & Play Setup Page**
Allow adding player names (3-20 players), selecting category, configuring role count sliders.
- [ ] **Step 2: Build Secret Card Passing Sequence**
Screen transitions: *"Berikan HP ke [Nama Pemain]"* -> *"Tahan untuk Intip Kata"* -> *"Selesai & Oper ke Pemain Berikutnya"*.
- [ ] **Step 3: Build Turn Clue & Discussion Screen**
Guide the group through speaking order with active turn timer and button to proceed to Voting.
- [ ] **Step 4: Build Pass & Play Voting & Elimination Screen**
Interactive ballot list to select eliminated player, tie-breaker prompt, and Mr. White guess intercept.
- [ ] **Step 5: Build Game Over summary screen**
Display winning team, reveal all roles and secret words, with a 1-click Rematch button.

---

### Task 7: Multi-Device (Online Room) Mode Implementation

**Files:**
- Create: `games/undercover/client/src/pages/HomePage.tsx`
- Create: `games/undercover/client/src/pages/LobbyPage.tsx`
- Create: `games/undercover/client/src/pages/RoomGamePage.tsx`
- Create: `games/undercover/client/src/components/game/VotingGrid.tsx`
- Create: `games/undercover/client/src/components/game/MrWhiteModal.tsx`

**Interfaces:**
- Produces: Online multiplayer gameplay synchronized via SocketContext.

- [ ] **Step 1: Build Home Page**
Mode selector: "Main di HP Masing-Masing (Online Room)" vs "Main 1 HP Gantian (Pass & Play)", with Create Room / Join Room tabs.
- [ ] **Step 2: Build Room Lobby Page**
Display 4-digit Room Code with 1-click Copy Link, live player list, Host settings (Role count, Turn duration, Category picker), and Start Game button.
- [ ] **Step 3: Build Multi-Device Role Reveal & Turn Synchronizer**
Each player's device displays their secret card. Turn phase displays who is currently speaking across all connected devices in realtime.
- [ ] **Step 4: Build Realtime Secret Voting Grid**
Interactive voting cards for each active player. Broadcast live vote counts when all votes are cast.
- [ ] **Step 5: Build Mr. White Emergency Guess Modal**
When Mr. White is voted out, pop up a high-stakes input dialog on Mr. White's screen and a suspense screen on other players' screens.
- [ ] **Step 6: Build Online Game Over & Rematch Sync**
Synchronize game end state, winner animation, role disclosure, and reset to Lobby.

---

### Task 8: Custom Word Pack Creator & Category Selector

**Files:**
- Create: `games/undercover/client/src/components/lobby/CategorySelector.tsx`
- Create: `games/undercover/client/src/components/lobby/CustomWordPackModal.tsx`
- Create: `games/undercover/client/src/utils/customPackStorage.ts`

**Interfaces:**
- Produces: Custom word pair manager supporting local storage persistence and server broadcast to room.

- [ ] **Step 1: Build Category Selector Component**
Multi-select badge pills for built-in categories (Makanan, Hewan, Benda, Tempat, Profesi).
- [ ] **Step 2: Build Custom Word Pack Modal**
Form to input custom word pairs (Kata Warga & Kata Undercover), preview list, and delete/edit items.
- [ ] **Step 3: Hook custom word packs into Host Room Configuration**
Allow Host to mix built-in categories with custom created word packs.

---

### Task 9: Verification, Polish & End-to-End Testing

**Files:**
- Create: `games/undercover/README.md`
- Test: Manual multi-browser tab testing & unit test suite

- [ ] **Step 1: Run all unit and integration tests**
Execute backend and frontend test runners.
- [ ] **Step 2: Test Multi-Device session recovery**
Simulate browser refresh during active round and confirm player reconnects without game disruption.
- [ ] **Step 3: Responsive & Theme Pre-Flight Audit**
Verify UI on mobile viewport (375px) and desktop (1280px), check contrast ratios, ensure audio mute toggle works properly.
- [ ] **Step 4: Create complete documentation in `games/undercover/README.md`**
Document how to start dev server, play modes, rules, and architecture.
