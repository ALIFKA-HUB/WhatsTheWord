import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RoomManager } from '../src/managers/RoomManager.js';
import { GameSettings, WordPair } from '../src/types/game.types.js';

describe('RoomManager', () => {
  let roomManager: RoomManager;

  beforeEach(() => {
    roomManager = new RoomManager();
  });

  afterEach(() => {
    roomManager.destroy();
  });

  describe('createRoom', () => {
    it('should create a room with a 4-character code and host player', () => {
      const result = roomManager.createRoom('Alice', 'avatar_1');
      expect(result.roomId).toBeDefined();
      expect(result.roomId.length).toBe(4);
      expect(result.roomId).toMatch(/^[A-Z0-9]{4}$/);
      expect(result.playerToken).toBeDefined();
      expect(result.player).toMatchObject({
        name: 'Alice',
        avatar: 'avatar_1',
        isHost: true,
        isAlive: true,
        hasVoted: false,
      });
      expect(result.room.roomId).toBe(result.roomId);
      expect(result.room.phase).toBe('LOBBY');
      expect(result.room.players).toHaveLength(1);
      expect(result.room.players[0].id).toBe(result.player.id);
    });
  });

  describe('joinRoom', () => {
    it('should allow multiple players to join a room', () => {
      const { roomId } = roomManager.createRoom('Host', 'avatar_host');
      const p2 = roomManager.joinRoom(roomId, 'Bob', 'avatar_2');
      const p3 = roomManager.joinRoom(roomId, 'Charlie', 'avatar_3');

      const room = roomManager.getRoom(roomId);
      expect(room).toBeDefined();
      expect(room?.players).toHaveLength(3);
      expect(p2.player.isHost).toBe(false);
      expect(p3.player.isHost).toBe(false);
      expect(p2.playerToken).not.toBe(p3.playerToken);
    });

    it('should throw error when joining non-existent room', () => {
      expect(() => {
        roomManager.joinRoom('ZZZZ', 'Bob', 'avatar_2');
      }).toThrow(/Room not found/i);
    });

    it('should reconnect existing player if existingToken is provided and valid', () => {
      const { roomId, playerToken: hostToken, player: hostPlayer } = roomManager.createRoom('Host', 'avatar_host');
      const joinResult = roomManager.joinRoom(roomId, 'Host', 'avatar_host', hostToken);
      expect(joinResult.player.id).toBe(hostPlayer.id);
      expect(joinResult.playerToken).toBe(hostToken);
      expect(roomManager.getRoom(roomId)?.players).toHaveLength(1);
    });
  });

  describe('leaveRoom and host migration', () => {
    it('should migrate host role to the next player when host leaves', () => {
      const { roomId, player: host } = roomManager.createRoom('Host', 'avatar_1');
      const { player: bob } = roomManager.joinRoom(roomId, 'Bob', 'avatar_2');
      const { player: charlie } = roomManager.joinRoom(roomId, 'Charlie', 'avatar_3');

      const updatedRoom = roomManager.leaveRoom(roomId, host.id);
      expect(updatedRoom).not.toBeNull();
      expect(updatedRoom?.players).toHaveLength(2);
      expect(updatedRoom?.players[0].id).toBe(bob.id);
      expect(updatedRoom?.players[0].isHost).toBe(true);
      expect(updatedRoom?.players[1].id).toBe(charlie.id);
      expect(updatedRoom?.players[1].isHost).toBe(false);
    });

    it('should remove room when all players leave', () => {
      const { roomId, player: host } = roomManager.createRoom('Host', 'avatar_1');
      const updatedRoom = roomManager.leaveRoom(roomId, host.id);
      expect(updatedRoom).toBeNull();
      expect(roomManager.getRoom(roomId)).toBeUndefined();
    });
  });

  describe('updateSettings', () => {
    it('should update room settings in LOBBY phase', () => {
      const { roomId } = roomManager.createRoom('Host', 'avatar_1');
      const newSettings: Partial<GameSettings> = {
        category: 'Hewan',
        civilianCount: 4,
        undercoverCount: 2,
        mrWhiteCount: 1,
        turnDurationSeconds: 60,
      };

      const updatedRoom = roomManager.updateSettings(roomId, newSettings);
      expect(updatedRoom.settings.category).toBe('Hewan');
      expect(updatedRoom.settings.civilianCount).toBe(4);
      expect(updatedRoom.settings.undercoverCount).toBe(2);
      expect(updatedRoom.settings.turnDurationSeconds).toBe(60);
    });

    it('should throw error when updating settings after game started', () => {
      const { roomId } = roomManager.createRoom('Host', 'avatar_1');
      roomManager.joinRoom(roomId, 'Bob', 'avatar_2');
      roomManager.joinRoom(roomId, 'Charlie', 'avatar_3');
      roomManager.joinRoom(roomId, 'Dave', 'avatar_4');

      roomManager.startGame(roomId, {
        category: 'Makanan & Minuman',
        civilianCount: 2,
        undercoverCount: 1,
        mrWhiteCount: 1,
        turnDurationSeconds: 30,
        enableMrWhite: true,
      });

      expect(() => {
        roomManager.updateSettings(roomId, { civilianCount: 3 });
      }).toThrow(/Cannot update settings while game is in progress/i);
    });
  });

  describe('reconnectPlayer', () => {
    it('should retrieve player and room using valid playerToken', () => {
      const { roomId, playerToken, player } = roomManager.createRoom('Host', 'avatar_1');
      const reconnectData = roomManager.reconnectPlayer(playerToken);
      expect(reconnectData).not.toBeNull();
      expect(reconnectData?.player.id).toBe(player.id);
      expect(reconnectData?.room.roomId).toBe(roomId);
    });

    it('should return null for invalid or expired token', () => {
      const reconnectData = roomManager.reconnectPlayer('invalid-token-1234');
      expect(reconnectData).toBeNull();
    });
  });

  describe('startGame and role distribution', () => {
    it('should initialize role assignments, speaking order, and wordPair', () => {
      const { roomId } = roomManager.createRoom('Player1', 'av1');
      roomManager.joinRoom(roomId, 'Player2', 'av2');
      roomManager.joinRoom(roomId, 'Player3', 'av3');
      roomManager.joinRoom(roomId, 'Player4', 'av4');

      const customPair: WordPair = {
        category: 'Makanan & Minuman',
        civilianWord: 'Kopi',
        undercoverWord: 'Teh',
      };

      const settings: GameSettings = {
        category: 'Makanan & Minuman',
        civilianCount: 2,
        undercoverCount: 1,
        mrWhiteCount: 1,
        turnDurationSeconds: 45,
        enableMrWhite: true,
      };

      const room = roomManager.startGame(roomId, settings, customPair);
      expect(room.phase).toBe('ROLE_REVEAL');
      expect(room.round).toBe(1);
      expect(room.speakingOrder).toHaveLength(4);
      expect(room.currentSpeakerIndex).toBe(0);
      expect(room.wordPair).toEqual(customPair);

      const civs = room.players.filter((p) => p.role === 'CIVILIAN');
      const undercovers = room.players.filter((p) => p.role === 'UNDERCOVER');
      const mrWhites = room.players.filter((p) => p.role === 'MR_WHITE');

      expect(civs).toHaveLength(2);
      expect(undercovers).toHaveLength(1);
      expect(mrWhites).toHaveLength(1);

      civs.forEach((p) => expect(p.word).toBe('Kopi'));
      undercovers.forEach((p) => expect(p.word).toBe('Teh'));
      mrWhites.forEach((p) => expect(p.word).toBe(''));
    });
  });

  describe('advanceTurn', () => {
    it('should cycle through speaking order and transition to VOTING when all speakers finish', () => {
      const { roomId } = roomManager.createRoom('P1', 'av1');
      roomManager.joinRoom(roomId, 'P2', 'av2');
      roomManager.joinRoom(roomId, 'P3', 'av3');

      roomManager.startGame(roomId, {
        category: 'Makanan & Minuman',
        civilianCount: 2,
        undercoverCount: 1,
        mrWhiteCount: 0,
        turnDurationSeconds: 45,
        enableMrWhite: false,
      });

      // Speaker 0 -> Speaker 1
      let room = roomManager.advanceTurn(roomId);
      expect(room.phase).toBe('TURN_PHASE');
      expect(room.currentSpeakerIndex).toBe(1);

      // Speaker 1 -> Speaker 2
      room = roomManager.advanceTurn(roomId);
      expect(room.phase).toBe('TURN_PHASE');
      expect(room.currentSpeakerIndex).toBe(2);

      // Speaker 2 (last) -> VOTING
      room = roomManager.advanceTurn(roomId);
      expect(room.phase).toBe('VOTING');
    });
  });

  describe('castVote', () => {
    let roomId: string;
    let p1Id: string;
    let p2Id: string;
    let p3Id: string;
    let p4Id: string;

    beforeEach(() => {
      const p1 = roomManager.createRoom('P1', 'av1');
      const p2 = roomManager.joinRoom(p1.roomId, 'P2', 'av2');
      const p3 = roomManager.joinRoom(p1.roomId, 'P3', 'av3');
      const p4 = roomManager.joinRoom(p1.roomId, 'P4', 'av4');

      roomId = p1.roomId;
      p1Id = p1.player.id;
      p2Id = p2.player.id;
      p3Id = p3.player.id;
      p4Id = p4.player.id;

      roomManager.startGame(roomId, {
        category: 'Makanan & Minuman',
        civilianCount: 2,
        undercoverCount: 1,
        mrWhiteCount: 1,
        turnDurationSeconds: 45,
        enableMrWhite: true,
      }, {
        category: 'Makanan & Minuman',
        civilianWord: 'Kopi',
        undercoverWord: 'Teh',
      });

      // Advance through turn phase to voting
      roomManager.advanceTurn(roomId); // 1
      roomManager.advanceTurn(roomId); // 2
      roomManager.advanceTurn(roomId); // 3
      roomManager.advanceTurn(roomId); // -> VOTING
    });

    it('should record partial votes until all living players have voted', () => {
      const res1 = roomManager.castVote(roomId, p1Id, p2Id);
      expect(res1.isComplete).toBe(false);
      expect(res1.room.players.find((p) => p.id === p1Id)?.hasVoted).toBe(true);

      const res2 = roomManager.castVote(roomId, p2Id, p1Id);
      expect(res2.isComplete).toBe(false);
    });

    it('should trigger Instant Skip on voting tie and proceed to next round without elimination', () => {
      // 2 votes for P1, 2 votes for P2
      roomManager.castVote(roomId, p1Id, p2Id);
      roomManager.castVote(roomId, p3Id, p2Id);
      roomManager.castVote(roomId, p2Id, p1Id);
      const res = roomManager.castVote(roomId, p4Id, p1Id);

      expect(res.isComplete).toBe(true);
      expect(res.isTie).toBe(true);
      expect(res.eliminatedPlayer).toBeUndefined();
      expect(res.room.phase).toBe('TURN_PHASE');
      expect(res.room.round).toBe(2);
      expect(res.room.players.every((p) => p.isAlive)).toBe(true);
    });

    it('should transition to MR_WHITE_GUESS when Mr. White is eliminated', () => {
      const mrWhite = roomManager.getRoom(roomId)!.players.find((p) => p.role === 'MR_WHITE')!;
      const otherPlayers = roomManager.getRoom(roomId)!.players.filter((p) => p.id !== mrWhite.id);

      // Everyone votes for Mr. White
      otherPlayers.forEach((p) => {
        roomManager.castVote(roomId, p.id, mrWhite.id);
      });
      const res = roomManager.castVote(roomId, mrWhite.id, otherPlayers[0].id);

      expect(res.isComplete).toBe(true);
      expect(res.isTie).toBe(false);
      expect(res.eliminatedPlayer?.id).toBe(mrWhite.id);
      expect(res.room.phase).toBe('MR_WHITE_GUESS');
    });
  });

  describe('handleMrWhiteGuess', () => {
    it('should award victory to MR_WHITE on correct guess', () => {
      const { roomId } = roomManager.createRoom('Host', 'av1');
      roomManager.joinRoom(roomId, 'Bob', 'av2');
      roomManager.joinRoom(roomId, 'Charlie', 'av3');
      roomManager.joinRoom(roomId, 'Dave', 'av4');

      roomManager.startGame(roomId, {
        category: 'Makanan & Minuman',
        civilianCount: 2,
        undercoverCount: 1,
        mrWhiteCount: 1,
        turnDurationSeconds: 45,
        enableMrWhite: true,
      }, {
        category: 'Makanan & Minuman',
        civilianWord: 'Nasi Padang',
        undercoverWord: 'Nasi Uduk',
      });

      const room = roomManager.getRoom(roomId)!;
      room.phase = 'MR_WHITE_GUESS';

      const guessRes = roomManager.handleMrWhiteGuess(roomId, 'nasi padang');
      expect(guessRes.isCorrect).toBe(true);
      expect(guessRes.winner).toBe('MR_WHITE');
      expect(guessRes.room.phase).toBe('GAME_OVER');
      expect(guessRes.room.winningRole).toBe('MR_WHITE');
    });

    it('should eliminate Mr. White and check win condition on incorrect guess', () => {
      const { roomId } = roomManager.createRoom('Host', 'av1');
      roomManager.joinRoom(roomId, 'Bob', 'av2');
      roomManager.joinRoom(roomId, 'Charlie', 'av3');
      roomManager.joinRoom(roomId, 'Dave', 'av4');

      roomManager.startGame(roomId, {
        category: 'Makanan & Minuman',
        civilianCount: 2,
        undercoverCount: 1,
        mrWhiteCount: 1,
        turnDurationSeconds: 45,
        enableMrWhite: true,
      }, {
        category: 'Makanan & Minuman',
        civilianWord: 'Nasi Padang',
        undercoverWord: 'Nasi Uduk',
      });

      const room = roomManager.getRoom(roomId)!;
      const mrWhite = room.players.find((p) => p.role === 'MR_WHITE')!;
      mrWhite.isAlive = false;
      room.phase = 'MR_WHITE_GUESS';

      const guessRes = roomManager.handleMrWhiteGuess(roomId, 'Bakso Sapi');
      expect(guessRes.isCorrect).toBe(false);
      // Undercover + 2 Civilians alive -> game continues to next round
      expect(guessRes.winner).toBeUndefined();
      expect(guessRes.room.phase).toBe('TURN_PHASE');
      expect(guessRes.room.round).toBe(2);
    });
  });

  describe('rematch', () => {
    it('should reset room back to LOBBY phase preserving players and host', () => {
      const { roomId } = roomManager.createRoom('Host', 'av1');
      roomManager.joinRoom(roomId, 'Bob', 'av2');
      roomManager.joinRoom(roomId, 'Charlie', 'av3');

      roomManager.startGame(roomId);
      const room = roomManager.rematch(roomId);

      expect(room.phase).toBe('LOBBY');
      expect(room.round).toBe(1);
      expect(room.winningRole).toBeUndefined();
      expect(room.eliminatedPlayer).toBeUndefined();
      expect(room.players).toHaveLength(3);
      expect(room.players.every((p) => p.isAlive && !p.role && !p.word && !p.hasVoted)).toBe(true);
      expect(room.players[0].isHost).toBe(true);
    });
  });

  describe('cleanup and garbage collection', () => {
    it('should clean up idle rooms older than 2 hours', () => {
      const { roomId } = roomManager.createRoom('Host', 'av1');
      expect(roomManager.getRoom(roomId)).toBeDefined();

      // Mock Date.now to 3 hours in the future
      const realDateNow = Date.now;
      try {
        const threeHoursLater = Date.now() + 3 * 60 * 60 * 1000;
        Date.now = () => threeHoursLater;

        roomManager.cleanupIdleRooms();
        expect(roomManager.getRoom(roomId)).toBeUndefined();
      } finally {
        Date.now = realDateNow;
      }
    });
  });
});
