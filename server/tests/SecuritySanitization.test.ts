import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import http from 'http';
import { Server } from 'socket.io';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { RoomManager } from '../src/managers/RoomManager.js';
import { registerRoomHandlers } from '../src/handlers/roomHandler.js';
import { registerGameHandlers } from '../src/handlers/gameHandler.js';
import { registerVoteHandlers } from '../src/handlers/voteHandler.js';
import { sanitizeRoomForPlayer } from '../src/utils/sanitize.js';
import { assignRoles } from '../src/engine/GameEngine.js';
import { RoomState, Player, WordPair, GameSettings } from '../src/types/game.types.js';

describe('Security & Sanitization Audit Fixes (BUG-1 to BUG-5)', () => {
  let server: http.Server;
  let io: Server;
  let roomManager: RoomManager;
  let serverPort: number;

  beforeEach(async () => {
    server = http.createServer();
    io = new Server(server, { cors: { origin: '*' } });
    roomManager = new RoomManager();

    io.on('connection', (socket) => {
      registerRoomHandlers(io, socket, roomManager);
      registerGameHandlers(io, socket, roomManager);
      registerVoteHandlers(io, socket, roomManager);
    });

    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const addr = server.address();
        if (addr && typeof addr !== 'string') {
          serverPort = addr.port;
        }
        resolve();
      });
    });
  });

  afterEach(async () => {
    io.close();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  describe('BUG-1 (P0): Role & Word Secret Sanitization', () => {
    const mockWordPair: WordPair = {
      category: 'Buah',
      civilianWord: 'Apel',
      undercoverWord: 'Pir',
    };

    const mockPlayers: Player[] = [
      { id: 'host-1', name: 'Host Player', avatar: '🕵️', isHost: true, isAlive: true, hasVoted: false, role: 'CIVILIAN', word: 'Apel' },
      { id: 'guest-2', name: 'Guest Player', avatar: '🦊', isHost: false, isAlive: true, hasVoted: false, role: 'UNDERCOVER', word: 'Pir' },
      { id: 'guest-3', name: 'White Player', avatar: '🤖', isHost: false, isAlive: true, hasVoted: false, role: 'MR_WHITE', word: '' },
    ];

    it('sanitizeRoomForPlayer masks roles and words of other players during active game', () => {
      const room: RoomState = {
        roomId: 'TEST',
        phase: 'ROLE_REVEAL',
        round: 1,
        players: mockPlayers,
        speakingOrder: ['host-1', 'guest-2', 'guest-3'],
        currentSpeakerIndex: 0,
        activeTurnRemainingSeconds: 45,
        settings: {
          category: 'Buah',
          civilianCount: 1,
          undercoverCount: 1,
          mrWhiteCount: 1,
          turnDurationSeconds: 45,
          enableMrWhite: true,
          customWordPair: mockWordPair,
        },
        wordPair: mockWordPair,
      };

      const sanitizedForGuest2 = sanitizeRoomForPlayer(room, 'guest-2');

      // Secret word pair must be completely removed
      expect(sanitizedForGuest2.wordPair).toBeUndefined();
      expect(sanitizedForGuest2.settings.customWordPair).toBeUndefined();

      // Guest 2 sees their own role and word
      const me = sanitizedForGuest2.players.find((p) => p.id === 'guest-2');
      expect(me?.role).toBe('UNDERCOVER');
      expect(me?.word).toBe('Pir');

      // Host and Player 3 are masked!
      const host = sanitizedForGuest2.players.find((p) => p.id === 'host-1');
      expect(host?.role).toBeUndefined();
      expect(host?.word).toBeUndefined();

      const white = sanitizedForGuest2.players.find((p) => p.id === 'guest-3');
      expect(white?.role).toBeUndefined();
      expect(white?.word).toBeUndefined();
    });

    it('sanitizeRoomForPlayer reveals all roles and words when phase is GAME_OVER', () => {
      const room: RoomState = {
        roomId: 'OVER',
        phase: 'GAME_OVER',
        round: 3,
        players: mockPlayers,
        speakingOrder: ['host-1', 'guest-2', 'guest-3'],
        currentSpeakerIndex: 0,
        activeTurnRemainingSeconds: 0,
        settings: {
          category: 'Buah',
          civilianCount: 1,
          undercoverCount: 1,
          mrWhiteCount: 1,
          turnDurationSeconds: 45,
          enableMrWhite: true,
        },
        wordPair: mockWordPair,
        winningRole: 'CIVILIAN',
      };

      const result = sanitizeRoomForPlayer(room, 'guest-2');
      expect(result.wordPair).toBeDefined();
      expect(result.players.every((p) => p.role !== undefined)).toBe(true);
    });

    it('socket broadcast delivers sanitized state to guest when game starts', async () => {
      const hostSocket: ClientSocket = Client(`http://localhost:${serverPort}`);
      const guestSocket: ClientSocket = Client(`http://localhost:${serverPort}`);

      let createdRoomId = '';
      let guestId = '';

      await new Promise<void>((resolve) => {
        hostSocket.emit('room:create', { playerName: 'HostBoss', avatar: '👑' }, (res: any) => {
          createdRoomId = res.roomId;
          resolve();
        });
      });

      await new Promise<void>((resolve) => {
        guestSocket.emit('room:join', { roomId: createdRoomId, playerName: 'GuestOne', avatar: '🕵️' }, (res: any) => {
          guestId = res.player.id;
          resolve();
        });
      });

      // Join a 3rd player so min 3 requirement is met
      const guest2Socket: ClientSocket = Client(`http://localhost:${serverPort}`);
      await new Promise<void>((resolve) => {
        guest2Socket.emit('room:join', { roomId: createdRoomId, playerName: 'GuestTwo', avatar: '🤖' }, () => {
          resolve();
        });
      });

      // Guest listens for game:started
      const guestGameStartedPromise = new Promise<RoomState>((resolve) => {
        guestSocket.on('game:started', (startedRoom: RoomState) => {
          resolve(startedRoom);
        });
      });

      // Host starts game
      await new Promise<void>((resolve) => {
        hostSocket.emit(
          'game:start',
          { settings: { undercoverCount: 1, mrWhiteCount: 0, enableMrWhite: false, category: 'Semua Kategori', turnDurationSeconds: 45, civilianCount: 2 } },
          () => resolve()
        );
      });

      const guestReceivedRoom = await guestGameStartedPromise;

      // Guest received room state: check sanitization
      expect(guestReceivedRoom.wordPair).toBeUndefined();

      const guestInPayload = guestReceivedRoom.players.find((p) => p.id === guestId);
      expect(guestInPayload?.role).toBeDefined(); // Guest knows their own role

      const otherPlayersInPayload = guestReceivedRoom.players.filter((p) => p.id !== guestId);
      expect(otherPlayersInPayload).toHaveLength(2);
      otherPlayersInPayload.forEach((other) => {
        expect(other.role).toBeUndefined();
        expect(other.word).toBeUndefined();
      });

      hostSocket.disconnect();
      guestSocket.disconnect();
      guest2Socket.disconnect();
    });
  });

  describe('BUG-2 (P1): Non-Host Permissions Enforcement', () => {
    it('rejects room:update_settings from a guest non-host', async () => {
      const hostSocket: ClientSocket = Client(`http://localhost:${serverPort}`);
      const guestSocket: ClientSocket = Client(`http://localhost:${serverPort}`);

      let roomId = '';
      await new Promise<void>((resolve) => {
        hostSocket.emit('room:create', { playerName: 'Host', avatar: '👑' }, (res: any) => {
          roomId = res.roomId;
          resolve();
        });
      });

      await new Promise<void>((resolve) => {
        guestSocket.emit('room:join', { roomId, playerName: 'HackerGuest', avatar: '🕵️' }, () => {
          resolve();
        });
      });

      const updateResult = await new Promise<any>((resolve) => {
        guestSocket.emit(
          'room:update_settings',
          { settings: { category: 'SABOTASE' } },
          (res: any) => resolve(res)
        );
      });

      expect(updateResult.success).toBe(false);
      expect(updateResult.error).toContain('Hanya host yang dapat mengubah pengaturan ruangan');

      hostSocket.disconnect();
      guestSocket.disconnect();
    });

    it('rejects game:start from a guest non-host', async () => {
      const hostSocket: ClientSocket = Client(`http://localhost:${serverPort}`);
      const guestSocket: ClientSocket = Client(`http://localhost:${serverPort}`);

      let roomId = '';
      await new Promise<void>((resolve) => {
        hostSocket.emit('room:create', { playerName: 'Host', avatar: '👑' }, (res: any) => {
          roomId = res.roomId;
          resolve();
        });
      });

      await new Promise<void>((resolve) => {
        guestSocket.emit('room:join', { roomId, playerName: 'Guest', avatar: '🕵️' }, () => {
          resolve();
        });
      });

      const startResult = await new Promise<any>((resolve) => {
        guestSocket.emit('game:start', {}, (res: any) => resolve(res));
      });

      expect(startResult.success).toBe(false);
      expect(startResult.error).toContain('Hanya host yang dapat memulai permainan');

      hostSocket.disconnect();
      guestSocket.disconnect();
    });
  });

  describe('BUG-3 (P2): Degenerate Role Configuration Validation', () => {
    const mockWordPair: WordPair = {
      category: 'Teknologi',
      civilianWord: 'Laptop',
      undercoverWord: 'Tablet',
    };

    it('rejects 2v2 Undercover configuration for 4 players', () => {
      const players: Player[] = [
        { id: '1', name: 'A', avatar: '1', isHost: true, isAlive: true, hasVoted: false },
        { id: '2', name: 'B', avatar: '2', isHost: false, isAlive: true, hasVoted: false },
        { id: '3', name: 'C', avatar: '3', isHost: false, isAlive: true, hasVoted: false },
        { id: '4', name: 'D', avatar: '4', isHost: false, isAlive: true, hasVoted: false },
      ];

      const settings: GameSettings = {
        category: 'Teknologi',
        civilianCount: 2,
        undercoverCount: 2,
        mrWhiteCount: 0,
        enableMrWhite: false,
        turnDurationSeconds: 45,
      };

      expect(() => assignRoles(players, settings, mockWordPair)).toThrow(
        /Konfigurasi peran tidak valid: Maksimal 1 Undercover untuk 4 pemain/
      );
    });

    it('rejects updateSettings when undercoverCount exceeds max for room players', () => {
      const { roomId } = roomManager.createRoom('Host', '1');
      roomManager.joinRoom(roomId, 'P2', '2');
      roomManager.joinRoom(roomId, 'P3', '3');
      roomManager.joinRoom(roomId, 'P4', '4');

      expect(() => {
        roomManager.updateSettings(roomId, { undercoverCount: 2 });
      }).toThrow(/Konfigurasi peran tidak valid/);
    });
  });

  describe('BUG-4 (P2): Room Max 20 Players Cap', () => {
    it('rejects joining when room already has 20 players', () => {
      const { roomId } = roomManager.createRoom('Host', '1');

      // Join 19 more players (total 20)
      for (let i = 2; i <= 20; i++) {
        roomManager.joinRoom(roomId, `Player ${i}`, `avatar_${i}`);
      }

      const room = roomManager.getRoom(roomId);
      expect(room?.players).toHaveLength(20);

      // Attempt to join player 21
      expect(() => {
        roomManager.joinRoom(roomId, 'Player 21', 'avatar_21');
      }).toThrow(/Ruangan sudah penuh \(maksimal 20 pemain\)/);
    });
  });

  describe('BUG-5 (P3): Duplicate & Whitespace Name Normalization', () => {
    it('rejects player with exact duplicate name', () => {
      const { roomId } = roomManager.createRoom('Budi', '1');

      expect(() => {
        roomManager.joinRoom(roomId, 'Budi', '2');
      }).toThrow(/Nama "Budi" sudah digunakan dalam ruangan ini/);
    });

    it('rejects player with whitespace-variant duplicate name', () => {
      const { roomId } = roomManager.createRoom('Siti', '1');

      expect(() => {
        roomManager.joinRoom(roomId, '  Siti  ', '2');
      }).toThrow(/Nama "Siti" sudah digunakan dalam ruangan ini/);
    });

    it('rejects player with case-insensitive duplicate name', () => {
      const { roomId } = roomManager.createRoom('Andi', '1');

      expect(() => {
        roomManager.joinRoom(roomId, 'andi', '2');
      }).toThrow(/Nama "andi" sudah digunakan dalam ruangan ini/);
    });
  });
});
