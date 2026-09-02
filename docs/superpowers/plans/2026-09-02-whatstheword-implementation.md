# What's The Word Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready, fullstack What's The Word (Undercover) word deduction game supporting both Multi-Device (realtime Socket.io rooms) and Single-Device Pass & Play (1 HP) modes with Supabase cloud word bank, Indonesian default categories, Web Audio API sound effects, and Sleek Dark Cyber UI ready for Vercel deployment.

**Architecture:** Monorepo in `C:\Users\ASUS\Documents\ALIFKA\PROJECT\whatstheword` containing a React 18 + Vite + TypeScript + Tailwind CSS frontend (`client/`) and a Node.js + Express + Socket.io backend (`server/`). Includes Supabase client for cloud word packs and community sharing, deterministic Game Engine with Levenshtein fuzzy matching, and Web Audio API synthesizer.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Motion (`motion/react`), Socket.io & Socket.io-client, Supabase JS Client (`@supabase/supabase-js`), Node.js, Express, Vitest.

## Global Constraints
- Target root directory: `C:\Users\ASUS\Documents\ALIFKA\PROJECT\whatstheword`
- Isolated from any other repository (standalone repo: `https://github.com/ALIFKA-HUB/WhatsTheWord.git`).
- Supabase Project URL: `https://rmsvxhoblwdhhdjpgjdn.supabase.co`
- Zero placeholders: All types, state models, audio synthesizers, and handlers are fully implemented without stubs.
- Mobile-first responsive layout strictly adhering to `min-h-[100dvh]` and Sleek Dark Cyber theme (`#080c16`, `#06b6d4`, `#f43f5e`, `#a855f7`).
- Offline fallback guarantee: Pass & Play must operate 100% smoothly offline without internet connection.

---

### Task 1: Monorepo Root, Workspace Tooling, Shared Types & Env Configuration

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `client/package.json`
- Create: `client/tsconfig.json`
- Create: `client/vite.config.ts`
- Create: `client/index.html`
- Create: `client/src/index.css`
- Create: `client/src/types/game.types.ts`
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `server/src/types/game.types.ts`

**Interfaces:**
- Produces: `PlayerRole` (`"CIVILIAN" | "UNDERCOVER" | "MR_WHITE"`), `GamePhase` (`"LOBBY" | "ROLE_REVEAL" | "TURN_PHASE" | "VOTING" | "MR_WHITE_GUESS" | "GAME_OVER"`), `Player`, `WordPair`, `RoomState`, `GameSettings`.

- [ ] **Step 1: Create root package.json and npm scripts**
Configure root orchestrator to run client and server concurrently with `npm run dev`.
- [ ] **Step 2: Setup client and server package.json & tsconfig.json**
Configure dependencies: React 18, Vite, Tailwind CSS, Lucide React, motion, @supabase/supabase-js, socket.io-client on client; express, socket.io, cors, dotenv, vitest on server.
- [ ] **Step 3: Define complete TypeScript shared types in `game.types.ts`**
Create definitions for `Player`, `Role`, `GamePhase`, `RoomState`, `VoteRecord`, and `WordPack`.
- [ ] **Step 4: Configure Tailwind CSS and Vite index.html**
Setup font imports, dark theme base classes, and responsive meta tags.
- [ ] **Step 5: Verify build & commit workspace setup**
Run typecheck to verify 0 errors, then commit:
`git add . && git commit -m "chore: setup monorepo workspace tooling and types"`

---

### Task 2: Core Domain Logic - Game Engine, Indonesian Word Bank & Fuzzy Matcher

**Files:**
- Create: `server/src/data/defaultWordPacks.ts`
- Create: `server/src/engine/FuzzyMatcher.ts`
- Create: `server/src/engine/GameEngine.ts`
- Create: `server/tests/FuzzyMatcher.test.ts`
- Create: `server/tests/GameEngine.test.ts`
- Create: `client/src/data/defaultWordPacks.ts`
- Create: `client/src/utils/fuzzyMatcher.ts`

**Interfaces:**
- Produces: `GameEngine.assignRoles(players, settings, wordPair)`, `GameEngine.calculateVotes(votes, activePlayers)`, `GameEngine.checkWinCondition(activePlayers)`, `FuzzyMatcher.isMatch(guessed, target)`.

- [ ] **Step 1: Write unit tests for FuzzyMatcher**
Test case-insensitivity, trim whitespace, typo tolerance (Levenshtein distance <= 1-2 for strings >= 4 chars).
- [ ] **Step 2: Write unit tests for GameEngine**
Test role allocation distributions (3-12 players), instant skip tie-breaker voting resolution, and win condition checks.
- [ ] **Step 3: Implement curated Indonesian Word Bank**
Provide 50+ balanced word pairs across 5 categories (Makanan & Minuman, Hewan, Benda & Gadget, Tempat & Hiburan, Profesi).
- [ ] **Step 4: Implement FuzzyMatcher and GameEngine classes**
Write pure TypeScript implementation fulfilling all test requirements.
- [ ] **Step 5: Run tests and verify 100% pass, then commit**
Run: `npm test` in server directory, then commit:
`git add . && git commit -m "feat(engine): implement game engine, word bank, and fuzzy matcher"`

---

### Task 3: Web Audio API Synthesizer & Audio Hook

**Files:**
- Create: `client/src/utils/soundSynthesizer.ts`
- Create: `client/src/context/AudioContext.tsx`
- Create: `client/src/hooks/useGameSound.ts`

**Interfaces:**
- Produces: `useGameSound()` (`playTick()`, `playUrgentTick()`, `playRoleReveal()`, `playVoteBuzzer()`, `playVictory()`, `playDefeat()`, `playButtonTap()`, `isMuted`, `toggleMute()`).

- [ ] **Step 1: Implement Web Audio Synthesizer class**
Build pure Web Audio API oscillator tone generator with ADSR envelope filters (no external mp3 files required).
- [ ] **Step 2: Implement AudioContext & useGameSound hook**
Provide global audio state, user gesture audio context initialization, and localStorage persistence for mute preference.
- [ ] **Step 3: Test synthesizer in browser context and commit**
Commit: `git add client/src/utils/soundSynthesizer.ts client/src/context/AudioContext.tsx client/src/hooks/useGameSound.ts && git commit -m "feat(audio): implement Web Audio API sound synthesizer"`

---

### Task 4: Realtime Backend Server (Express + Socket.io + Room Manager)

**Files:**
- Create: `server/src/managers/RoomManager.ts`
- Create: `server/src/handlers/roomHandler.ts`
- Create: `server/src/handlers/gameHandler.ts`
- Create: `server/src/handlers/voteHandler.ts`
- Create: `server/src/server.ts`
- Create: `server/tests/RoomManager.test.ts`

**Interfaces:**
- Produces: REST `/health` endpoint, Socket.io event listeners for `room:create`, `room:join`, `game:start`, `turn:end`, `vote:cast`, `mrwhite:guess`, `player:reconnect`.

- [ ] **Step 1: Write unit tests for RoomManager**
Test 4-letter room code generation, player joining/leaving, host migration, and session reconnect tokens.
- [ ] **Step 2: Implement RoomManager state store**
Manage active rooms in-memory with automatic cleanup for inactive rooms (> 2 hours).
- [ ] **Step 3: Implement Socket.io modular handlers**
Create `roomHandler.ts`, `gameHandler.ts`, and `voteHandler.ts` handling all game loop events.
- [ ] **Step 4: Bootstrap Express server with CORS and Socket.io server**
Configure port listener (`PORT=3001` or dynamic), static health route, and graceful shutdown.
- [ ] **Step 5: Run RoomManager tests, verify server starts, and commit**
Run: `npm test` in server directory, then commit:
`git add server/ && git commit -m "feat(server): implement Express and Socket.io realtime game server"`

---

### Task 5: Supabase Cloud Word Pack Service & Community Packs

**Files:**
- Create: `client/src/services/supabaseClient.ts`
- Create: `client/src/services/wordPackService.ts`
- Create: `supabase/schema.sql`

**Interfaces:**
- Produces: `wordPackService.getOfficialPacks()`, `wordPackService.getCommunityPacks()`, `wordPackService.saveCustomPack(pack)`, `wordPackService.getPackByShareCode(code)`.

- [ ] **Step 1: Create Supabase SQL Schema (`supabase/schema.sql`)**
Define `word_packs` and `custom_packs` tables with public read RLS policies and share codes.
- [ ] **Step 2: Implement Supabase Client in `supabaseClient.ts`**
Initialize Supabase client with project URL `https://rmsvxhoblwdhhdjpgjdn.supabase.co` and publishable key.
- [ ] **Step 3: Implement WordPackService with offline fallback**
Implement fetching cloud packs with automatic fallback to `defaultWordPacks.ts` when offline or on network error.
- [ ] **Step 4: Verify Supabase connection and commit**
Commit: `git add client/src/services/ supabase/ && git commit -m "feat(db): implement Supabase cloud word pack integration"`

---

### Task 6: UI Design System & Atomic Game Components

**Files:**
- Create: `client/src/components/common/Header.tsx`
- Create: `client/src/components/common/Button.tsx`
- Create: `client/src/components/common/Card.tsx`
- Create: `client/src/components/common/Badge.tsx`
- Create: `client/src/components/common/Modal.tsx`
- Create: `client/src/components/game/AvatarPicker.tsx`
- Create: `client/src/components/game/SecretCard.tsx`
- Create: `client/src/components/game/CountdownTimer.tsx`

**Interfaces:**
- Produces: Tactile Sleek Dark Cyber UI widgets with spring physics motion and accessible touch handlers.

- [ ] **Step 1: Implement base atomic components (`Header`, `Button`, `Card`, `Badge`, `Modal`)**
Style with Deep Void Navy `#080c16`, Cyan `#06b6d4`, Crimson `#f43f5e`, and Violet `#a855f7`.
- [ ] **Step 2: Build `AvatarPicker` component**
Provide 12 curated Cyber Agent avatars and vibrant role accent rings.
- [ ] **Step 3: Build `SecretCard` component**
Implement touch/press-and-hold reveal mechanics with blur unmasking and instant re-mask on release.
- [ ] **Step 4: Build `CountdownTimer` component**
Build animated circular/linear countdown with dynamic color stages (Cyan -> Amber -> Crimson) and tick audio integration.
- [ ] **Step 5: Verify components compile & commit**
Commit: `git add client/src/components/ && git commit -m "feat(ui): implement Sleek Dark Cyber design system and game components"`

---

### Task 7: Offline Pass & Play (Single-Device 1 HP) Mode

**Files:**
- Create: `client/src/context/PassPlayContext.tsx`
- Create: `client/src/pages/PassPlaySetupPage.tsx`
- Create: `client/src/pages/PassPlayGamePage.tsx`
- Create: `client/src/components/game/PassPlaySecretView.tsx`
- Create: `client/src/components/game/PassPlayVotingView.tsx`

**Interfaces:**
- Produces: Complete offline 1-device multiplayer game loop for 3-20 players.

- [ ] **Step 1: Implement `PassPlayContext` state machine**
Manage local players list, role assignment, turn speaking order, voting tally, and round progress.
- [ ] **Step 2: Build Pass & Play Setup Page**
Allow adding player names with avatars, category selection, and role sliders (Civilian, Undercover, Mr. White).
- [ ] **Step 3: Build Secret Passing Sequence (`PassPlaySecretView`)**
Display *"Oper HP ke [Nama Pemain]"* -> *"Tahan untuk Intip Kata"* -> *"Selesai & Oper ke Pemain Berikutnya"*.
- [ ] **Step 4: Build Turn Clue & Instant Skip Voting View (`PassPlayVotingView`)**
Provide active speaker spotlight with timer, interactive ballot list, instant skip on tie, and Mr. White fuzzy guess modal.
- [ ] **Step 5: Build Game Over & Rematch view and commit**
Commit: `git add client/src/pages/PassPlay* client/src/context/PassPlayContext.tsx && git commit -m "feat(pass-play): implement 1-device offline pass and play mode"`

---

### Task 8: Online Multi-Device (Socket.io Rooms) Mode

**Files:**
- Create: `client/src/context/SocketContext.tsx`
- Create: `client/src/hooks/useSocket.ts`
- Create: `client/src/pages/HomePage.tsx`
- Create: `client/src/pages/LobbyPage.tsx`
- Create: `client/src/pages/RoomGamePage.tsx`
- Create: `client/src/components/game/VotingGrid.tsx`
- Create: `client/src/components/game/MrWhiteModal.tsx`
- Create: `client/src/components/lobby/CustomWordPackModal.tsx`
- Modify: `client/src/App.tsx`

**Interfaces:**
- Produces: Complete realtime online room multiplayer game loop synchronized across mobile/desktop browsers.

- [ ] **Step 1: Implement `SocketContext` and `useSocket`**
Manage connection state, auto-reconnect with player token from `localStorage`, and event dispatchers.
- [ ] **Step 2: Build `HomePage` and Mode Selection**
Landing screen with tabbed "Main 1 HP (Offline)" vs "Main Bareng Teman (Online Room)" with Create / Join room modal.
- [ ] **Step 3: Build `LobbyPage`**
Display 4-digit room code with 1-click shareable link, connected player roster, category picker, and host role sliders.
- [ ] **Step 4: Build `RoomGamePage` with Realtime Secret Voting Grid**
Synchronize role reveal, speaking turns indicator, secret voting grid, and tie-breaker skip.
- [ ] **Step 5: Build `MrWhiteModal` and Synchronized Game Over screen**
Pop-up emergency tebak kata on Mr. White's screen, suspense overlay on other players, and rematch reset to lobby.
- [ ] **Step 6: Build `CustomWordPackModal`**
Allow host to create, preview, and save custom packs directly to Supabase with share code.
- [ ] **Step 7: Wire routes in `App.tsx` and commit**
Commit: `git add client/ && git commit -m "feat(online): implement multi-device Socket.io online gameplay"`

---

### Task 9: Vercel Deployment Config, Testing & Verification

**Files:**
- Create: `vercel.json`
- Create: `README.md`
- Test: Full build, typecheck, and end-to-end multi-room simulation

- [ ] **Step 1: Create `vercel.json` configuration**
Configure client SPA rewrite rules for client routing and server deployment instructions.
- [ ] **Step 2: Create comprehensive `README.md`**
Include setup guide, rules of the game, Supabase setup instructions, and deployment guide.
- [ ] **Step 3: Run full TypeScript compile and tests**
Execute `npm run build` and `npm test` across client and server.
- [ ] **Step 4: Commit and push initial complete release to GitHub**
Run: `git add . && git commit -m "feat: complete What's The Word game implementation" && git push -u origin main`
