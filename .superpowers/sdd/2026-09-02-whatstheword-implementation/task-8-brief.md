# Task 8 Brief: Online Multi-Device (Socket.io Rooms) Mode

## Goal
Implement fullstack online multi-device gameplay synchronized via Socket.io in `client/`:

1. `client/src/context/SocketContext.tsx` & `client/src/hooks/useSocket.ts`:
   - Connects to Socket.io server with auto-reconnection using `localStorage` token.
   - Dispatches and listens to all server events (`room:created`, `room:updated`, `game:started`, `turn:advanced`, `vote:completed`, `mrwhite:result`, `game:over`, etc.).
   - Actions: `createRoom`, `joinRoom`, `leaveRoom`, `updateSettings`, `startGame`, `advanceTurn`, `castVote`, `submitMrWhiteGuess`, `rematch`.

2. `client/src/pages/HomePage.tsx`:
   - Dual-mode landing screen:
     - Pass & Play card (1 HP Offline).
     - Online Room card with "Buat Room" (Host setup) and "Gabung Room" (4-digit code + avatar setup) tabs.
     - Custom Word Pack Creator modal button.
     - Auto-fill room code from URL query param `?room=XXXX`.

3. `client/src/pages/LobbyPage.tsx`:
   - Large copyable 4-digit room code and 1-click share URL.
   - Connected player cards with live animations and host badges.
   - Host settings: Category selection, role sliders (Civilian, Undercover, Mr. White), turn timer slider, Start Game button (validation $ge 3$ players).
   - Non-host live synchronized settings preview.

4. `client/src/pages/RoomGamePage.tsx`:
   - Synchronized Multi-Device game loop:
     - `ROLE_REVEAL`: Personal secret card for each connected player.
     - `TURN_PHASE`: Synchronized turn indicator & countdown timer showing who is speaking.
     - `VOTING`: `<VotingGrid>` with secret ballot selection, live vote submission indicator, instant skip tie handling.
     - `MR_WHITE_GUESS`: `<MrWhiteModal>` on Mr. White's device with 45s input, suspense screen on other players.
     - `GAME_OVER`: Synchronized winner announcement, role reveals for all connected players, and Rematch reset back to lobby.

5. `client/src/components/game/VotingGrid.tsx`, `client/src/components/game/MrWhiteModal.tsx`, `client/src/components/lobby/CustomWordPackModal.tsx`.

6. `client/src/App.tsx`:
   - Router integrating HomePage, PassPlay pages, LobbyPage, and RoomGamePage.

7. Verification:
   - `npm run typecheck`, `npm test`, and `npm run build:client` passing with zero errors.

## Report Contract
Write report to: `C:\Users\ASUS\Documents\ALIFKA\PROJECT\whatstheword\.superpowers\sdd\2026-09-02-whatstheword-implementation\task-8-report.md`
Return: status (DONE / BLOCKED), commits, one-line test summary.
