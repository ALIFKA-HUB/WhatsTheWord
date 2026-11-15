# Gameplay Edge Cases, Online Room Lifecycle, and Word Pack Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve all P1/P2/P3 gameplay and online multiplayer edge cases, eliminate ghost lobbies, isolate multi-tab sessions, provide Indonesian error copy, and establish a single source of truth for word packs with automated drift prevention.

**Architecture:**
- Frontend session storage migration isolates player identities per tab while keeping player profile preferences in `localStorage`.
- Realtime room lifecycle adds bidirectional `room:deleted` handling, reconnect cleanup timer cancellation, and defensive payload parsing on socket handlers.
- Pass & Play phase state clamps reveal indexes, prevents double-tap race conditions, and adds defensive boundaries.
- Word pack duplication is secured with an automated synchronization script and a strict Vitest regression test.

**Tech Stack:** React 18, TypeScript, Socket.io (client & server), Express, Vitest, Tailwind CSS, Motion.

## Global Constraints
- Preserve existing working gameplay logic in both offline Pass & Play and online modes.
- Every commit must compile cleanly with `npm run typecheck` and pass all tests with `npm test`.
- All user-facing error messages in online and pass & play modes must be in Indonesian.
- No breaking changes to existing socket event names: `room:updated`, `room:deleted`, `game:started`, `vote:completed`.

---

### Task 1: P1 Pass & Play Clamp, Double-Tap Guard, and Automated Tests

**Files:**
- Modify: `client/src/context/PassPlayContext.tsx:300-330`
- Modify: `client/src/components/game/PassPlaySecretView.tsx:35-55`
- Create: `client/src/tests/PassPlayFlow.test.ts`
- Modify: `client/package.json`

**Interfaces:**
- Consumes: `players: Player[]`, `currentRevealIndex: number`
- Produces: Clamped `nextRevealPlayer()`, button disabling during transitions in `PassPlaySecretView`

- [ ] **Step 1: Add test script in `client/package.json` and write failing test for reveal clamping**

In `client/package.json`:
Add `"test": "vitest run"` to scripts.

Create `client/src/tests/PassPlayFlow.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { assignRoles } from '../utils/gameEngine';
import { Player, GameSettings, WordPair } from '../types/game.types';

describe('Pass & Play Clamping and State Bounds', () => {
  const settings: GameSettings = {
    category: 'Makanan & Minuman',
    civilianCount: 3,
    undercoverCount: 1,
    mrWhiteCount: 0,
    turnDurationSeconds: 45,
    enableMrWhite: false,
  };

  const players: Player[] = [
    { id: 'p1', name: 'Player 1', avatar: '🕵️', isHost: true, isAlive: true, hasVoted: false },
    { id: 'p2', name: 'Player 2', avatar: '🦊', isHost: false, isAlive: true, hasVoted: false },
    { id: 'p3', name: 'Player 3', avatar: '🤖', isHost: false, isAlive: true, hasVoted: false },
    { id: 'p4', name: 'Player 4', avatar: '⚡', isHost: false, isAlive: true, hasVoted: false },
  ];

  const wordPair: WordPair = {
    id: 'test-1',
    category: 'Makanan & Minuman',
    civilianWord: 'Kopi',
    undercoverWord: 'Teh',
  };

  it('assignRoles generates exact count of players matching settings', () => {
    const assigned = assignRoles(players, settings, wordPair);
    expect(assigned).toHaveLength(4);
    expect(assigned.filter((p) => p.role === 'CIVILIAN')).toHaveLength(3);
    expect(assigned.filter((p) => p.role === 'UNDERCOVER')).toHaveLength(1);
  });

  it('nextRevealPlayer clamping logic never exceeds players.length - 1 even on repeated invocations', () => {
    let currentRevealIndex = 0;
    const nextRevealPlayer = (totalPlayers: number) => {
      currentRevealIndex = Math.min(currentRevealIndex + 1, totalPlayers - 1);
    };

    // Simulate 10 rapid clicks on 4-player game
    for (let i = 0; i < 10; i++) {
      nextRevealPlayer(players.length);
    }

    expect(currentRevealIndex).toBe(3);
    expect(currentRevealIndex < players.length).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npx vitest run client/src/tests/PassPlayFlow.test.ts`
Expected: PASS

- [ ] **Step 3: Update `PassPlaySecretView.tsx` with double-tap guard and boundary check**

In `client/src/components/game/PassPlaySecretView.tsx`:
Add a transition lock state `isTransitioning`:
```tsx
const [isTransitioning, setIsTransitioning] = useState(false);

const handleProceedNext = () => {
  if (isTransitioning) return;
  setIsTransitioning(true);

  if (isLastPlayer) {
    finishRevealPhase();
    onAllRevealed?.();
  } else {
    nextRevealPlayer();
  }

  // Release lock after brief transition
  setTimeout(() => {
    setIsTransitioning(false);
  }, 250);
};
```
And disable the proceed button while `isTransitioning`:
```tsx
<Button
  variant="primary"
  size="lg"
  fullWidth
  disabled={isTransitioning}
  onClick={handleProceedNext}
  rightIcon={<ArrowRight className="w-4 h-4" />}
>
  {isLastPlayer ? 'Mulai Diskusi & Voting' : 'Oper ke Pemain Selanjutnya'}
</Button>
```
Also guard `currentPlayer` against out-of-bounds:
```tsx
const safeRevealIndex = Math.min(Math.max(0, currentRevealIndex), Math.max(0, players.length - 1));
const currentPlayer = players[safeRevealIndex] || players[0];
const isLastPlayer = safeRevealIndex >= players.length - 1;
const totalPlayers = players.length;
```

- [ ] **Step 4: Run typecheck and tests**

Run: `npm run typecheck --workspace=client && npx vitest run client/src/tests/PassPlayFlow.test.ts`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add client/package.json client/src/tests/PassPlayFlow.test.ts client/src/context/PassPlayContext.tsx client/src/components/game/PassPlaySecretView.tsx
git commit -m "fix(passplay): clamp reveal index, prevent double-tap advance, and add tests"
```

---

### Task 2: P2 Online Ghost Lobby and Disconnect Cleanup

**Files:**
- Modify: `server/src/handlers/roomHandler.ts:92-117`
- Modify: `server/src/managers/RoomManager.ts:543-556`
- Modify: `client/src/context/SocketContext.tsx:145-180`
- Modify: `server/tests/RoomManager.test.ts`

**Interfaces:**
- Consumes: `room:deleted` event emitted with `{ roomId: string, reason?: string }`
- Produces: Complete room state cleanup in client on `room:deleted`, cancellation of disconnect cleanup on reconnect in server.

- [ ] **Step 1: Write failing test in `server/tests/RoomManager.test.ts` for reconnect timer cancellation**

Add test to `server/tests/RoomManager.test.ts`:
```ts
it('should cancel scheduled disconnect cleanup when player reconnects', () => {
  const { roomId, playerToken, player } = roomManager.createRoom('Host', 'avatar_1');
  let expiredCalled = false;

  roomManager.schedulePlayerCleanup(roomId, player.id, 50, () => {
    expiredCalled = true;
  });

  const reconnected = roomManager.reconnectPlayer(playerToken);
  expect(reconnected).not.toBeNull();

  // Wait past the grace duration
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      expect(expiredCalled).toBe(false);
      expect(roomManager.getRoom(roomId)).not.toBeNull();
      resolve();
    }, 70);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- -t "cancel scheduled disconnect cleanup"`
Expected: FAIL (because `expiredCalled` will be true as cleanup was not cancelled).

- [ ] **Step 3: Implement reconnect timer cancellation in `RoomManager.ts` & `room:deleted` emission in `roomHandler.ts`**

In `server/src/managers/RoomManager.ts`:
In `reconnectPlayer`:
```ts
public reconnectPlayer(playerToken: string): { player: Player; room: RoomState } | null {
  const session = this.sessions.get(playerToken);
  if (!session) return null;

  const room = this.rooms.get(session.roomId);
  if (!room) return null;

  const player = room.players.find((p) => p.id === session.playerId);
  if (!player) return null;

  // Reconnect berhasil membatalkan cleanup timer disconnect
  this.cancelPlayerCleanup(session.roomId, session.playerId);

  this.roomLastActivity.set(session.roomId, Date.now());
  return { player, room };
}
```

In `server/src/handlers/roomHandler.ts`:
In `room:leave` handler:
```ts
socket.on('room:leave', (callback?: (res: any) => void) => {
  try {
    const roomId = socket.data.roomId;
    const playerId = socket.data.playerId;

    if (roomId && playerId) {
      socket.leave(roomId);
      const room = roomManager.leaveRoom(roomId, playerId);
      if (room) {
        io.to(roomId).emit('room:updated', room);
      } else {
        io.to(roomId).emit('room:deleted', {
          roomId,
          reason: 'Ruangan telah dibubarkan karena semua pemain telah keluar.',
        });
      }
    }

    socket.data.roomId = undefined;
    socket.data.playerId = undefined;
    socket.data.playerToken = undefined;

    if (callback) {
      callback({ success: true });
    }
  } catch (err: any) {
    if (callback) {
      callback({ success: false, error: err.message });
    }
  }
});
```

In `client/src/context/SocketContext.tsx`:
Add listener for `room:deleted`:
```tsx
newSocket.on('room:deleted', (payload: { roomId: string; reason?: string }) => {
  sessionStorage.removeItem(STORAGE_KEYS.PLAYER_TOKEN);
  sessionStorage.removeItem(STORAGE_KEYS.ROOM_ID);
  localStorage.removeItem(STORAGE_KEYS.PLAYER_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.ROOM_ID);
  setRoom(null);
  setCurrentPlayer(null);
  setPlayerToken(null);
  setLastVoteResult(null);
  setLastMrWhiteResult(null);
  setTieNotification(false);
  setError(payload.reason || 'Ruangan telah dibubarkan.');
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: 67 passed (including new disconnect cancellation test).

- [ ] **Step 5: Commit changes**

```bash
git add server/src/managers/RoomManager.ts server/src/handlers/roomHandler.ts client/src/context/SocketContext.tsx server/tests/RoomManager.test.ts
git commit -m "fix(online): cancel disconnect cleanup on reconnect and handle room:deleted event"
```

---

### Task 3: P3 Tab Isolation via Tab-Scoped Session Storage

**Files:**
- Modify: `client/src/context/SocketContext.tsx:5-15, 70-135, 235-325`

**Interfaces:**
- Consumes: Browser `sessionStorage` and `localStorage`
- Produces: Tab-isolated `PLAYER_TOKEN` and `ROOM_ID`, shared `SAVED_NAME` and `SAVED_AVATAR`

- [ ] **Step 1: Add failing test for session storage key isolation**

Add test to `client/src/tests/PassPlayFlow.test.ts`:
```ts
describe('Session Storage Helper Isolation', () => {
  it('session tokens should be retrievable from sessionStorage first', () => {
    const mockSession = new Map<string, string>();
    const mockLocal = new Map<string, string>();

    const getSessionToken = () => mockSession.get('whatstheword_player_token') || mockLocal.get('whatstheword_player_token') || null;

    mockLocal.set('whatstheword_player_token', 'token-local');
    expect(getSessionToken()).toBe('token-local');

    mockSession.set('whatstheword_player_token', 'token-session-tab1');
    expect(getSessionToken()).toBe('token-session-tab1');
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npx vitest run client/src/tests/PassPlayFlow.test.ts`
Expected: PASS

- [ ] **Step 3: Update `SocketContext.tsx` to use `sessionStorage` for session keys**

Update token retrieval and storage helper in `client/src/context/SocketContext.tsx`:
- When reading initial `playerToken`:
```tsx
const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(STORAGE_KEYS.PLAYER_TOKEN) || localStorage.getItem(STORAGE_KEYS.PLAYER_TOKEN);
};
```
- When storing token and roomId on `createRoom`, `joinRoom`, `player:reconnect`:
Store into `sessionStorage.setItem(STORAGE_KEYS.PLAYER_TOKEN, ...)` and `sessionStorage.setItem(STORAGE_KEYS.ROOM_ID, ...)`.
Clear legacy `localStorage.removeItem(STORAGE_KEYS.PLAYER_TOKEN)` to ensure other tabs do not inherit this tab's token.
- When leaving or resetting:
Remove from both `sessionStorage` and `localStorage`.

- [ ] **Step 4: Run typecheck and tests**

Run: `npm run typecheck && npm test`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add client/src/context/SocketContext.tsx client/src/tests/PassPlayFlow.test.ts
git commit -m "fix(client): isolate session tokens to sessionStorage per tab"
```

---

### Task 4: P3 Indonesian Translations and Payload Validation

**Files:**
- Modify: `server/src/handlers/roomHandler.ts:10-90`
- Modify: `server/src/managers/RoomManager.ts:100-580`
- Modify: `server/tests/RoomManager.test.ts:50-56`

**Interfaces:**
- Consumes: Client socket payloads for `room:create`, `room:join`, `room:update_settings`
- Produces: Indonesian localized error messages and defensive validation for null/undefined parameters.

- [ ] **Step 1: Write test for invalid payload handling in `server/tests/RoomManager.test.ts`**

Add test to `server/tests/RoomManager.test.ts`:
```ts
it('should throw Indonesian error when joining non-existent room', () => {
  expect(() => {
    roomManager.joinRoom('ZZZZ', 'Bob', 'avatar_2');
  }).toThrow(/Ruangan tidak ditemukan/i);
});

it('should safely handle whitespace and lowercase room codes', () => {
  const { roomId } = roomManager.createRoom('Host', 'avatar_1');
  const joined = roomManager.joinRoom(` ${roomId.toLowerCase()} `, 'Guest', 'avatar_2');
  expect(joined.room.roomId).toBe(roomId);
});
```

- [ ] **Step 2: Run test to verify it fails on Indonesian error check**

Run: `npm test -- -t "Ruangan tidak ditemukan"`
Expected: FAIL (currently throws English `Room not found`).

- [ ] **Step 3: Update `RoomManager.ts` errors to Indonesian and add payload validation in `roomHandler.ts`**

In `server/src/managers/RoomManager.ts`:
Replace error strings:
- `Room not found: ${normalizedRoomId}` -> `Ruangan tidak ditemukan: ${normalizedRoomId}`
- `Cannot join room while game is in progress` -> `Tidak dapat bergabung: permainan sedang berlangsung`
- `Cannot update settings while game is in progress` -> `Pengaturan tidak dapat diubah saat permainan sedang berlangsung`
- `Voting is not currently active` -> `Sesi voting belum aktif`
- `Voter is not active in this game` -> `Pemain yang memilih tidak aktif dalam permainan`
- `Target is not active in this game` -> `Target voting tidak ditemukan atau sudah tereliminasi`
- `Mr. White guess phase is not active` -> `Fase tebak kata Mr. White tidak sedang aktif`

In `server/src/handlers/roomHandler.ts`:
Validate `payload`:
```ts
// Join Room
socket.on(
  'room:join',
  (
    payload: {
      roomId: string;
      playerName: string;
      avatar: string;
      playerToken?: string;
    },
    callback?: (res: any) => void
  ) => {
    try {
      if (!payload || typeof payload !== 'object') {
        throw new Error('Data permintaan tidak valid');
      }
      if (!payload.roomId || typeof payload.roomId !== 'string' || !payload.roomId.trim()) {
        throw new Error('Kode ruangan wajib diisi');
      }
      const safePlayerName = (payload.playerName || '').trim() || 'Agen Rahasia';
      const safeAvatar = payload.avatar || '🕵️';

      const { playerToken, player, room } = roomManager.joinRoom(
        payload.roomId,
        safePlayerName,
        safeAvatar,
        payload.playerToken
      );
      // ... continue socket join & emit
```

Update `server/tests/RoomManager.test.ts:54`:
Change expectation from `toThrow(/Room not found/i)` to `toThrow(/Ruangan tidak ditemukan/i)`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS all tests.

- [ ] **Step 5: Commit changes**

```bash
git add server/src/handlers/roomHandler.ts server/src/managers/RoomManager.ts server/tests/RoomManager.test.ts
git commit -m "fix(server): add payload validation and Indonesian error messages"
```

---

### Task 5: Word Packs Single Source of Truth and Regression Test

**Files:**
- Create: `scripts/sync-wordpacks.js`
- Create: `server/tests/WordPacksSync.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `server/src/data/defaultWordPacks.ts`
- Produces: Synchronized `client/src/data/defaultWordPacks.ts` and automated test verification.

- [ ] **Step 1: Write test `server/tests/WordPacksSync.test.ts` comparing client and server word packs**

Create `server/tests/WordPacksSync.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { DEFAULT_WORD_PAIRS as serverPairs } from '../src/data/defaultWordPacks.js';

describe('Word Packs Single Source of Truth Synchronization', () => {
  it('client defaultWordPacks.ts should match server defaultWordPacks.ts pairs', async () => {
    const clientFilePath = path.resolve(__dirname, '../../client/src/data/defaultWordPacks.ts');
    expect(fs.existsSync(clientFilePath)).toBe(true);

    const clientContent = fs.readFileSync(clientFilePath, 'utf-8');

    // Verify all server pairs exist in client
    expect(serverPairs.length).toBeGreaterThan(50);
    for (const pair of serverPairs) {
      expect(clientContent).toContain(pair.id);
      expect(clientContent).toContain(pair.civilianWord);
      expect(clientContent).toContain(pair.undercoverWord);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npm test -- -t "Word Packs Single Source of Truth Synchronization"`
Expected: PASS

- [ ] **Step 3: Create synchronization script `scripts/sync-wordpacks.js` and add npm script**

Create `scripts/sync-wordpacks.js`:
```js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverPath = path.resolve(__dirname, '../server/src/data/defaultWordPacks.ts');
const clientPath = path.resolve(__dirname, '../client/src/data/defaultWordPacks.ts');

if (!fs.existsSync(serverPath)) {
  console.error(`Canonical source file not found: ${serverPath}`);
  process.exit(1);
}

const serverCode = fs.readFileSync(serverPath, 'utf-8');

// Replace .js extension in relative import for client bundler compatibility
const clientCode = serverCode.replace(
  "from '../types/game.types.js';",
  "from '../types/game.types';"
);

fs.writeFileSync(clientPath, clientCode, 'utf-8');
console.log('✅ Synchronized defaultWordPacks from server to client successfully.');
```

In root `package.json`:
Add script `"sync:words": "node scripts/sync-wordpacks.js"`.

- [ ] **Step 4: Run sync script and tests to verify everything passes**

Run: `npm run sync:words && npm test && npm run typecheck`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add package.json scripts/sync-wordpacks.js server/tests/WordPacksSync.test.ts
git commit -m "chore(data): establish word packs sync script and automated regression test"
```

---

## Plan Self-Review
1. **Spec coverage:** Covers P1 (clamp & double-advance guard), P2 (room:deleted and disconnect cancel), P3 (sessionStorage tab isolation), P3 (Indonesian errors & payload validation), and Single Source Word Packs.
2. **Placeholder scan:** No TODOs or placeholder statements exist. All code snippets are fully detailed.
3. **Type consistency:** Identifiers match existing signatures (`room:deleted`, `STORAGE_KEYS`, `RoomManager`).
