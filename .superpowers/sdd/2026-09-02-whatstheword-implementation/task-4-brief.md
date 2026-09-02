# Task 4 Brief: Realtime Backend Server (Express + Socket.io + Room Manager)

## Goal
Implement a complete, production-ready realtime Socket.io backend server with RoomManager, session recovery, and modular event handlers:

1. `server/src/managers/RoomManager.ts`:
   - In-memory store for active game rooms (`Map<string, RoomState>` and player sessions `Map<string, { roomId: string, playerId: string }>`).
   - Generates unique 4-character room codes (alphanumeric, e.g. "ABCD", "KOP1").
   - Methods:
     - `createRoom(hostName: string, avatar: string): { roomId: string; playerToken: string; player: Player; room: RoomState }`
     - `joinRoom(roomId: string, playerName: string, avatar: string, existingToken?: string): { playerToken: string; player: Player; room: RoomState }`
     - `leaveRoom(roomId: string, playerId: string): RoomState | null` (migrates host to next player if host leaves; removes room if empty)
     - `updateSettings(roomId: string, settings: Partial<GameSettings>): RoomState`
     - `startGame(roomId: string, settings?: GameSettings, customWordPair?: WordPair): RoomState`
     - `advanceTurn(roomId: string): RoomState`
     - `castVote(roomId: string, voterId: string, targetId: string): { room: RoomState; isComplete: boolean; isTie?: boolean; eliminatedPlayer?: Player; winner?: PlayerRole }`
     - `handleMrWhiteGuess(roomId: string, guess: string): { room: RoomState; isCorrect: boolean; winner: PlayerRole }`
     - `reconnectPlayer(playerToken: string): { player: Player; room: RoomState } | null`
     - `rematch(roomId: string): RoomState`
     - Automatic garbage collection of idle rooms (> 2 hours).

2. Socket.io Event Handlers in `server/src/handlers/`:
   - `roomHandler.ts`: `room:create`, `room:join`, `room:leave`, `room:update_settings`, `player:reconnect`
   - `gameHandler.ts`: `game:start`, `turn:end`, `turn:timer_tick`, `game:rematch`
   - `voteHandler.ts`: `vote:cast`, `mrwhite:guess`

3. Server Bootstrap in `server/src/server.ts`:
   - Setup Express, CORS with wildcard/env origins, HTTP server, Socket.io server.
   - Endpoint `GET /health` returning `{ status: 'ok', activeRooms: number, uptime: number }`.
   - Export `app`, `server`, `io`, `roomManager`.

4. Automated Vitest Tests:
   - `server/tests/RoomManager.test.ts`: test room creation, joining, role distribution on start, instant skip voting tie, Mr. White guess intercept, session reconnect, and rematch.

## Report Contract
Write report to: `C:\Users\ASUS\Documents\ALIFKA\PROJECT\whatstheword\.superpowers\sdd\2026-09-02-whatstheword-implementation\task-4-report.md`
Return: status (DONE / BLOCKED), commits, one-line test summary.
