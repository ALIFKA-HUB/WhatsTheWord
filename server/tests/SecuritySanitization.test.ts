import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import http from 'http';
import { Server } from 'socket.io';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { RoomManager } from '../src/managers/RoomManager.js';
import { registerRoomHandlers } from '../src/handlers/roomHandler.js';
import { registerGameHandlers } from '../src/handlers/gameHandler.js';
import { registerVoteHandlers } from '../src/handlers/voteHandler.js';
import { sanitizeRoomForPlayer } from '../src/utils/sanitize.js';
import { assignRoles, checkWinCondition, generateSpeakingOrder } from '../src/engine/GameEngine.js';
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
    roomManager.destroy();
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

    it('clamps 2v2 Undercover configuration for 4 players down to 1 Undercover', () => {
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

      const result = assignRoles(players, settings, mockWordPair);
      expect(result.players.filter((p) => p.role === 'UNDERCOVER')).toHaveLength(1);
      expect(result.players.filter((p) => p.role === 'CIVILIAN')).toHaveLength(3);
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

  describe('Cluster A Security, Integrity & Deadlock Fixes', () => {
    it('H1: strips votedTargetId from other players during VOTING while preserving own vote', () => {
      const room: RoomState = {
        roomId: 'VOTE',
        phase: 'VOTING',
        round: 1,
        players: [
          {
            id: 'p1',
            name: 'P1',
            avatar: '1',
            isHost: true,
            isAlive: true,
            hasVoted: true,
            votedTargetId: 'p2',
            role: 'CIVILIAN',
            word: 'Apel',
          },
          {
            id: 'p2',
            name: 'P2',
            avatar: '2',
            isHost: false,
            isAlive: true,
            hasVoted: true,
            votedTargetId: 'p3',
            role: 'UNDERCOVER',
            word: 'Pir',
          },
          {
            id: 'p3',
            name: 'P3',
            avatar: '3',
            isHost: false,
            isAlive: true,
            hasVoted: false,
            role: 'CIVILIAN',
            word: 'Apel',
          },
        ],
        speakingOrder: ['p1', 'p2', 'p3'],
        currentSpeakerIndex: 0,
        activeTurnRemainingSeconds: 45,
        settings: {
          category: 'Buah',
          civilianCount: 2,
          undercoverCount: 1,
          mrWhiteCount: 0,
          turnDurationSeconds: 45,
          enableMrWhite: false,
        },
      };

      const sanitizedForP1 = sanitizeRoomForPlayer(room, 'p1');
      const p1 = sanitizedForP1.players.find((p) => p.id === 'p1');
      const p2 = sanitizedForP1.players.find((p) => p.id === 'p2');
      const p3 = sanitizedForP1.players.find((p) => p.id === 'p3');

      expect(p1?.votedTargetId).toBe('p2');
      expect(p2?.hasVoted).toBe(true);
      expect(p2?.votedTargetId).toBeUndefined();
      expect(p3?.votedTargetId).toBeUndefined();
    });

    it('C2: blocks non-Mr. White player from hijacking mrwhite:guess over socket', async () => {
      const hostSocket: ClientSocket = Client(`http://localhost:${serverPort}`);
      const p2Socket: ClientSocket = Client(`http://localhost:${serverPort}`);
      const p3Socket: ClientSocket = Client(`http://localhost:${serverPort}`);
      const p4Socket: ClientSocket = Client(`http://localhost:${serverPort}`);

      let roomId = '';
      let p2Id = '';
      let p3Id = '';
      let p4Id = '';

      await new Promise<void>((resolve) => {
        hostSocket.emit('room:create', { playerName: 'Host', avatar: '👑' }, (res: any) => {
          roomId = res.roomId;
          resolve();
        });
      });
      await new Promise<void>((resolve) => {
        p2Socket.emit('room:join', { roomId, playerName: 'P2', avatar: '🦊' }, (res: any) => {
          p2Id = res.player.id;
          resolve();
        });
      });
      await new Promise<void>((resolve) => {
        p3Socket.emit('room:join', { roomId, playerName: 'P3', avatar: '🤖' }, (res: any) => {
          p3Id = res.player.id;
          resolve();
        });
      });
      await new Promise<void>((resolve) => {
        p4Socket.emit('room:join', { roomId, playerName: 'P4', avatar: '⚡' }, (res: any) => {
          p4Id = res.player.id;
          resolve();
        });
      });

      await new Promise<void>((resolve) => {
        hostSocket.emit(
          'game:start',
          {
            settings: {
              category: 'Buah',
              civilianCount: 2,
              undercoverCount: 1,
              mrWhiteCount: 1,
              enableMrWhite: true,
              turnDurationSeconds: 45,
            },
            customWordPair: {
              category: 'Buah',
              civilianWord: 'Mangga',
              undercoverWord: 'Jambu',
            },
          },
          () => resolve()
        );
      });

      const room = roomManager.getRoom(roomId)!;
      const hostId = room.players[0].id;
      room.players[0].role = 'CIVILIAN';
      room.players[1].role = 'CIVILIAN';
      room.players[2].role = 'UNDERCOVER';
      room.players[3].role = 'MR_WHITE';
      room.players[3].isAlive = false;
      room.eliminatedPlayer = room.players[3];
      room.phase = 'MR_WHITE_GUESS';

      // Non-Mr. White civilian (p2) tries to hijack mrwhite:guess with correct word
      const hijackRes = await new Promise<any>((resolve) => {
        p2Socket.emit('mrwhite:guess', { guess: 'Mangga' }, (res: any) => resolve(res));
      });
      expect(hijackRes.success).toBe(false);
      expect(room.phase).toBe('MR_WHITE_GUESS');

      // Host also cannot submit a non-empty guess
      const hostHijackRes = await new Promise<any>((resolve) => {
        hostSocket.emit('mrwhite:guess', { guess: 'Mangga' }, (res: any) => resolve(res));
      });
      expect(hostHijackRes.success).toBe(false);
      expect(room.phase).toBe('MR_WHITE_GUESS');

      // Eliminated Mr. White (p4) CAN submit guess
      expect(p4Id).toBe(room.eliminatedPlayer.id);
      const validGuessRes = await new Promise<any>((resolve) => {
        p4Socket.emit('mrwhite:guess', { guess: 'Mangga' }, (res: any) => resolve(res));
      });
      expect(validGuessRes.success).toBe(true);
      expect(validGuessRes.isCorrect).toBe(true);
      expect(room.phase).toBe('GAME_OVER');

      expect(hostId).toBeDefined();
      expect(p2Id).toBeDefined();
      expect(p3Id).toBeDefined();

      hostSocket.disconnect();
      p2Socket.disconnect();
      p3Socket.disconnect();
      p4Socket.disconnect();
    });

    it('C3: blocks non-speaker/non-host from turn:end and turn:timer_tick', async () => {
      const hostSocket: ClientSocket = Client(`http://localhost:${serverPort}`);
      const p2Socket: ClientSocket = Client(`http://localhost:${serverPort}`);
      const p3Socket: ClientSocket = Client(`http://localhost:${serverPort}`);

      let roomId = '';
      let p2Id = '';
      let p3Id = '';

      await new Promise<void>((resolve) => {
        hostSocket.emit('room:create', { playerName: 'Host', avatar: '👑' }, (res: any) => {
          roomId = res.roomId;
          resolve();
        });
      });
      await new Promise<void>((resolve) => {
        p2Socket.emit('room:join', { roomId, playerName: 'P2', avatar: '🦊' }, (res: any) => {
          p2Id = res.player.id;
          resolve();
        });
      });
      await new Promise<void>((resolve) => {
        p3Socket.emit('room:join', { roomId, playerName: 'P3', avatar: '🤖' }, (res: any) => {
          p3Id = res.player.id;
          resolve();
        });
      });

      await new Promise<void>((resolve) => {
        hostSocket.emit('game:start', {}, () => resolve());
      });

      const room = roomManager.getRoom(roomId)!;
      // Put room into TURN_PHASE with p2 as active speaker (index 1)
      room.speakingOrder = [room.players[0].id, p2Id, p3Id];
      room.phase = 'TURN_PHASE';
      room.currentSpeakerIndex = 1;
      room.activeTurnRemainingSeconds = 40;

      // Non-speaker p3 cannot emit turn:timer_tick
      p3Socket.emit('turn:timer_tick', { remainingSeconds: 5 });
      await new Promise((r) => setTimeout(r, 40));
      expect(room.activeTurnRemainingSeconds).toBe(40);

      // Non-speaker p3 cannot call turn:end
      const endByOther = await new Promise<any>((resolve) => {
        p3Socket.emit('turn:end', (res: any) => resolve(res));
      });
      expect(endByOther.success).toBe(false);
      expect(room.currentSpeakerIndex).toBe(1);

      // Active speaker p2 CAN update timer (clamped) and end turn
      p2Socket.emit('turn:timer_tick', { remainingSeconds: 999 });
      await new Promise((r) => setTimeout(r, 40));
      expect(room.activeTurnRemainingSeconds).toBe(300);

      const endBySpeaker = await new Promise<any>((resolve) => {
        p2Socket.emit('turn:end', (res: any) => resolve(res));
      });
      expect(endBySpeaker.success).toBe(true);
      expect(room.currentSpeakerIndex).toBe(2);

      hostSocket.disconnect();
      p2Socket.disconnect();
      p3Socket.disconnect();
    });

    it('C4: rejects self-vote and double-vote in castVote', () => {
      const { roomId, player: host } = roomManager.createRoom('Host', '1');
      const { player: p2 } = roomManager.joinRoom(roomId, 'P2', '2');
      const { player: p3 } = roomManager.joinRoom(roomId, 'P3', '3');

      roomManager.startGame(roomId);
      roomManager.advanceTurn(roomId); // ROLE_REVEAL -> TURN_PHASE (0)
      roomManager.advanceTurn(roomId); // 1
      roomManager.advanceTurn(roomId); // 2
      roomManager.advanceTurn(roomId); // -> VOTING

      // Self-vote rejected
      expect(() => {
        roomManager.castVote(roomId, host.id, host.id);
      }).toThrow(/Tidak bisa memilih diri sendiri/);

      // Valid vote
      roomManager.castVote(roomId, host.id, p2.id);

      // Double-vote rejected
      expect(() => {
        roomManager.castVote(roomId, host.id, p3.id);
      }).toThrow(/Kamu sudah memberikan suara/);
    });

    it('H7: leaving last unvoted player during VOTING auto-resolves voting instead of deadlocking', () => {
      const { roomId, player: p1 } = roomManager.createRoom('P1', '1');
      const { player: p2 } = roomManager.joinRoom(roomId, 'P2', '2');
      const { player: p3 } = roomManager.joinRoom(roomId, 'P3', '3');
      const { player: p4 } = roomManager.joinRoom(roomId, 'P4', '4');

      const room = roomManager.startGame(roomId);
      room.players[0].role = 'CIVILIAN';
      room.players[1].role = 'CIVILIAN';
      room.players[2].role = 'CIVILIAN';
      room.players[3].role = 'UNDERCOVER';
      room.phase = 'VOTING';

      // p1 and p2 vote for p4 (Undercover); p4 votes for p1; p3 (Civilian) has NOT voted yet
      roomManager.castVote(roomId, p1.id, p4.id);
      roomManager.castVote(roomId, p2.id, p4.id);
      roomManager.castVote(roomId, p4.id, p1.id);

      // p3 disconnects/leaves -> remaining living players have all voted -> resolves immediately
      const updated = roomManager.leaveRoom(roomId, p3.id)!;
      expect(updated.phase).toBe('GAME_OVER');
      expect(updated.winningRole).toBe('CIVILIAN');
      expect(updated.eliminatedPlayer?.id).toBe(p4.id);
    });

    it('H7: leaving eliminated Mr. White during MR_WHITE_GUESS auto-resolves instead of deadlocking', () => {
      const { roomId, player: p1 } = roomManager.createRoom('P1', '1');
      const { player: p2 } = roomManager.joinRoom(roomId, 'P2', '2');
      const { player: p3 } = roomManager.joinRoom(roomId, 'P3', '3');
      const { player: p4 } = roomManager.joinRoom(roomId, 'P4', '4');

      const room = roomManager.startGame(roomId);
      room.players[0].role = 'CIVILIAN';
      room.players[1].role = 'CIVILIAN';
      room.players[2].role = 'UNDERCOVER';
      room.players[3].role = 'MR_WHITE';
      room.players[3].isAlive = false;
      room.eliminatedPlayer = room.players[3];
      room.phase = 'MR_WHITE_GUESS';

      const updated = roomManager.leaveRoom(roomId, p4.id)!;
      expect(updated.phase).toBe('TURN_PHASE');
      expect(updated.round).toBe(2);
      expect(updated.eliminatedPlayer).toBeUndefined();
      expect(updated.speakingOrder).toHaveLength(3);
      expect([p1.id, p2.id, p3.id]).toContain(updated.speakingOrder[0]);
    });

    it('M3 & H5: Mr. White never speaks 1st and checkWinCondition prioritizes Undercover over Mr. White', () => {
      const players: Player[] = [
        { id: '1', name: 'P1', avatar: '1', isHost: true, isAlive: true, hasVoted: false, role: 'MR_WHITE' },
        { id: '2', name: 'P2', avatar: '2', isHost: false, isAlive: true, hasVoted: false, role: 'CIVILIAN' },
        { id: '3', name: 'P3', avatar: '3', isHost: false, isAlive: true, hasVoted: false, role: 'UNDERCOVER' },
        { id: '4', name: 'P4', avatar: '4', isHost: false, isAlive: true, hasVoted: false, role: 'CIVILIAN' },
      ];

      for (let i = 0; i < 20; i++) {
        const order = generateSpeakingOrder(players);
        expect(order[0]).not.toBe('1');
      }

      // 1 UC + 1 MW remaining -> UNDERCOVER wins (not MR_WHITE)
      expect(
        checkWinCondition([
          { id: '1', name: 'P1', avatar: '1', isHost: true, isAlive: false, hasVoted: false, role: 'CIVILIAN' },
          { id: '2', name: 'P2', avatar: '2', isHost: false, isAlive: false, hasVoted: false, role: 'CIVILIAN' },
          { id: '3', name: 'P3', avatar: '3', isHost: false, isAlive: true, hasVoted: false, role: 'UNDERCOVER' },
          { id: '4', name: 'P4', avatar: '4', isHost: false, isAlive: true, hasVoted: false, role: 'MR_WHITE' },
        ])
      ).toBe('UNDERCOVER');

      // 1 Civ + 1 UC + 1 MW remaining -> game continues (null)
      expect(
        checkWinCondition([
          { id: '1', name: 'P1', avatar: '1', isHost: true, isAlive: true, hasVoted: false, role: 'CIVILIAN' },
          { id: '2', name: 'P2', avatar: '2', isHost: false, isAlive: false, hasVoted: false, role: 'CIVILIAN' },
          { id: '3', name: 'P3', avatar: '3', isHost: false, isAlive: true, hasVoted: false, role: 'UNDERCOVER' },
          { id: '4', name: 'P4', avatar: '4', isHost: false, isAlive: true, hasVoted: false, role: 'MR_WHITE' },
        ])
      ).toBeNull();
    });

    it('H6 & M4 & L2: startGame rejects invalid customWordPair and non-LOBBY phase, and default room disables Mr. White', () => {
      const { roomId, room } = roomManager.createRoom('Host', '1');
      expect(room.settings.enableMrWhite).toBe(false);
      expect(room.settings.mrWhiteCount).toBe(0);

      roomManager.joinRoom(roomId, 'P2', '2');
      roomManager.joinRoom(roomId, 'P3', '3');

      expect(() => {
        roomManager.startGame(roomId, undefined, {
          category: 'Kustom',
          civilianWord: 'Kopi',
          undercoverWord: ' kopi ',
        });
      }).toThrow(/Pasangan kata kustom tidak valid atau identik/);

      roomManager.startGame(roomId);
      expect(() => {
        roomManager.startGame(roomId);
      }).toThrow(/Permainan sudah berlangsung/);
    });
  });
});
