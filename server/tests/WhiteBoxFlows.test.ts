import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../src/engine/GameEngine';
import { FuzzyMatcher } from '../src/engine/FuzzyMatcher';
import { RoomManager } from '../src/managers/RoomManager';
import { Player, GameSettings, WordPair } from '../src/types/game.types';
import { DEFAULT_WORD_PAIRS, getRandomWordPair } from '../src/data/defaultWordPacks';

describe('White-Box Flow Verification Test Suite', () => {
  let mockWordPair: WordPair;

  beforeEach(() => {
    mockWordPair = {
      id: 'test-01',
      category: 'Makanan & Minuman',
      civilianWord: 'Bakso',
      undercoverWord: 'Mie Ayam',
    };
  });

  // =========================================================================
  // MODULE 1: WIZARD SETUP & ROLE CONSTRAINTS
  // =========================================================================
  describe('Module 1: Setup & Role Constraints (WB-1)', () => {
    it('WB-1.1: Minimum 3 Players Constraint - 2 Civilians vs 1 Undercover', () => {
      const players: Player[] = [
        { id: 'p1', name: 'Agent 1', avatar: '🕵️', isHost: true, isAlive: true, hasVoted: false },
        { id: 'p2', name: 'Agent 2', avatar: '🦊', isHost: false, isAlive: true, hasVoted: false },
        { id: 'p3', name: 'Agent 3', avatar: '🤖', isHost: false, isAlive: true, hasVoted: false },
      ];

      const settings: GameSettings = {
        category: 'Makanan & Minuman',
        civilianCount: 2,
        undercoverCount: 1,
        mrWhiteCount: 0,
        enableMrWhite: false,
        turnDurationSeconds: 45,
      };

      const result = GameEngine.assignRoles(players, settings, mockWordPair);
      expect(result.players).toHaveLength(3);

      const civilians = result.players.filter((p) => p.role === 'CIVILIAN');
      const undercovers = result.players.filter((p) => p.role === 'UNDERCOVER');
      expect(civilians).toHaveLength(2);
      expect(undercovers).toHaveLength(1);
      expect(civilians.every((c) => c.word === 'Bakso')).toBe(true);
      expect(undercovers.every((u) => u.word === 'Mie Ayam')).toBe(true);
    });

    it('WB-1.2: Maximum 20 Players Scaling & Role Distribution', () => {
      const players: Player[] = Array.from({ length: 20 }, (_, i) => ({
        id: `p${i + 1}`,
        name: `Pemain ${i + 1}`,
        avatar: '🕵️',
        isHost: i === 0,
        isAlive: true,
        hasVoted: false,
      }));

      const settings: GameSettings = {
        category: 'Semua Kategori',
        civilianCount: 14,
        undercoverCount: 5,
        mrWhiteCount: 1,
        enableMrWhite: true,
        turnDurationSeconds: 45,
      };

      const result = GameEngine.assignRoles(players, settings, mockWordPair);
      expect(result.players).toHaveLength(20);
      expect(result.players.filter((p) => p.role === 'CIVILIAN')).toHaveLength(14);
      expect(result.players.filter((p) => p.role === 'UNDERCOVER')).toHaveLength(5);
      expect(result.players.filter((p) => p.role === 'MR_WHITE')).toHaveLength(1);
    });

    it('WB-1.4: Mr. White Toggle - 1 Civilian, 1 Undercover, 1 Mr. White for 3 Players', () => {
      const players: Player[] = [
        { id: 'p1', name: 'Alpha', avatar: '🕵️', isHost: true, isAlive: true, hasVoted: false },
        { id: 'p2', name: 'Beta', avatar: '🦊', isHost: false, isAlive: true, hasVoted: false },
        { id: 'p3', name: 'Gamma', avatar: '🤖', isHost: false, isAlive: true, hasVoted: false },
      ];

      const settings: GameSettings = {
        category: 'Makanan & Minuman',
        civilianCount: 1,
        undercoverCount: 1,
        mrWhiteCount: 1,
        enableMrWhite: true,
        turnDurationSeconds: 45,
      };

      const result = GameEngine.assignRoles(players, settings, mockWordPair);
      expect(result.players.filter((p) => p.role === 'CIVILIAN')).toHaveLength(1);
      expect(result.players.filter((p) => p.role === 'UNDERCOVER')).toHaveLength(1);
      const mrWhite = result.players.find((p) => p.role === 'MR_WHITE');
      expect(mrWhite).toBeDefined();
      expect(mrWhite?.word).toBe('');
    });

    it('WB-1.5: Random Mystery Category Generation', () => {
      const pair = getRandomWordPair();
      expect(pair).toBeDefined();
      expect(pair.civilianWord).toBeTruthy();
      expect(pair.undercoverWord).toBeTruthy();
      expect(pair.civilianWord).not.toBe(pair.undercoverWord);
    });
  });

  // =========================================================================
  // MODULE 2: SECRET CARD & BLIND IMPOSTOR DATA INTEGRITY
  // =========================================================================
  describe('Module 2: Blind Impostor Data Integrity (WB-2)', () => {
    it('WB-2.2 & 2.3: Civilian and Undercover receive valid non-empty words', () => {
      const players: Player[] = [
        { id: 'p1', name: 'Agent 1', avatar: '🕵️', isHost: true, isAlive: true, hasVoted: false },
        { id: 'p2', name: 'Agent 2', avatar: '🦊', isHost: false, isAlive: true, hasVoted: false },
        { id: 'p3', name: 'Agent 3', avatar: '🤖', isHost: false, isAlive: true, hasVoted: false },
        { id: 'p4', name: 'Agent 4', avatar: '⚡', isHost: false, isAlive: true, hasVoted: false },
      ];

      const settings: GameSettings = {
        category: 'Makanan & Minuman',
        civilianCount: 3,
        undercoverCount: 1,
        mrWhiteCount: 0,
        enableMrWhite: false,
        turnDurationSeconds: 45,
      };

      const { players: assigned } = GameEngine.assignRoles(players, settings, mockWordPair);
      for (const p of assigned) {
        expect(p.word).toBeDefined();
        expect(p.word?.length).toBeGreaterThan(0);
        // Neither role reveals ??? except Mr. White
        if (p.role !== 'MR_WHITE') {
          expect(p.word).not.toBe('???');
        }
      }
    });

    it('WB-2.4: Mr. White receives empty string / no secret word', () => {
      const players: Player[] = [
        { id: 'p1', name: 'Agent 1', avatar: '🕵️', isHost: true, isAlive: true, hasVoted: false },
        { id: 'p2', name: 'Agent 2', avatar: '🦊', isHost: false, isAlive: true, hasVoted: false },
        { id: 'p3', name: 'Agent 3', avatar: '🤖', isHost: false, isAlive: true, hasVoted: false },
        { id: 'p4', name: 'Agent 4', avatar: '⚡', isHost: false, isAlive: true, hasVoted: false },
      ];

      const settings: GameSettings = {
        category: 'Makanan & Minuman',
        civilianCount: 2,
        undercoverCount: 1,
        mrWhiteCount: 1,
        enableMrWhite: true,
        turnDurationSeconds: 45,
      };

      const { players: assigned } = GameEngine.assignRoles(players, settings, mockWordPair);
      const mrWhite = assigned.find((p) => p.role === 'MR_WHITE');
      expect(mrWhite).toBeDefined();
      expect(mrWhite?.word).toBe('');
    });
  });

  // =========================================================================
  // MODULE 3 & 4: VOTING, INSTANT SKIP TIE, AND 3X TIE LIMIT
  // =========================================================================
  describe('Module 3 & 4: Voting & Consecutive Tie Limit (WB-3 & WB-4)', () => {
    let roomManager: RoomManager;

    beforeEach(() => {
      roomManager = new RoomManager();
    });

    it('WB-3.3 & 3.4: Single Highest Vote Eliminates Suspect', () => {
      const players: Player[] = [
        { id: 'p1', name: 'Agent 1', avatar: '🕵️', isHost: true, isAlive: true, hasVoted: true, role: 'CIVILIAN' },
        { id: 'p2', name: 'Agent 2', avatar: '🦊', isHost: false, isAlive: true, hasVoted: true, role: 'UNDERCOVER' },
        { id: 'p3', name: 'Agent 3', avatar: '🤖', isHost: false, isAlive: true, hasVoted: true, role: 'CIVILIAN' },
      ];

      // p1 votes p2, p3 votes p2, p2 votes p1 -> p2 has 2 votes
      const votes: Record<string, string> = {
        p1: 'p2',
        p3: 'p2',
        p2: 'p1',
      };

      const result = GameEngine.calculateVotes(votes, players);
      expect(result.isTie).toBe(false);
      expect(result.eliminatedPlayerId).toBe('p2');
    });

    it('WB-4.1: Instant Skip on 2-way Vote Tie', () => {
      const players: Player[] = [
        { id: 'p1', name: 'Agent 1', avatar: '🕵️', isHost: true, isAlive: true, hasVoted: true },
        { id: 'p2', name: 'Agent 2', avatar: '🦊', isHost: false, isAlive: true, hasVoted: true },
        { id: 'p3', name: 'Agent 3', avatar: '🤖', isHost: false, isAlive: true, hasVoted: true },
        { id: 'p4', name: 'Agent 4', avatar: '⚡', isHost: false, isAlive: true, hasVoted: true },
      ];

      // p1 & p2 vote p3 (2 votes), p3 & p4 vote p1 (2 votes) -> Tie!
      const votes: Record<string, string> = {
        p1: 'p3',
        p2: 'p3',
        p3: 'p1',
        p4: 'p1',
      };

      const result = GameEngine.calculateVotes(votes, players);
      expect(result.isTie).toBe(true);
      expect(result.eliminatedPlayerId).toBeNull();
    });

    it('WB-4.3: 3x Consecutive Tie Limit triggers Instant Undercover Victory in RoomManager', () => {
      const { room, playerToken: t1 } = roomManager.createRoom('Host', '🕵️');
      const { room: r2, playerToken: t2 } = roomManager.joinRoom(room.roomId, 'P2', '🦊');
      const { room: r3, playerToken: t3 } = roomManager.joinRoom(room.roomId, 'P3', '🤖');
      const { room: r4, playerToken: t4 } = roomManager.joinRoom(room.roomId, 'P4', '⚡');

      // Start game
      roomManager.startGame(room.roomId);
      expect(room.phase).toBe('ROLE_REVEAL');

      // Set roles manually for deterministic testing
      room.players[0].role = 'CIVILIAN';
      room.players[1].role = 'CIVILIAN';
      room.players[2].role = 'CIVILIAN';
      room.players[3].role = 'UNDERCOVER';

      // Transition to VOTING 1
      room.phase = 'VOTING';
      // Tie votes: p1 & p2 vote p3 (2 votes), p3 & p4 vote p1 (2 votes)
      roomManager.castVote(room.roomId, room.players[0].id, room.players[2].id);
      roomManager.castVote(room.roomId, room.players[1].id, room.players[2].id);
      roomManager.castVote(room.roomId, room.players[2].id, room.players[0].id);
      const res1 = roomManager.castVote(room.roomId, room.players[3].id, room.players[0].id);

      expect(res1.isTie).toBe(true);
      expect(room.consecutiveTies).toBe(1);
      expect(room.phase).toBe('TURN_PHASE');

      // Tie 2
      room.phase = 'VOTING';
      roomManager.castVote(room.roomId, room.players[0].id, room.players[2].id);
      roomManager.castVote(room.roomId, room.players[1].id, room.players[2].id);
      roomManager.castVote(room.roomId, room.players[2].id, room.players[0].id);
      const res2 = roomManager.castVote(room.roomId, room.players[3].id, room.players[0].id);

      expect(res2.isTie).toBe(true);
      expect(room.consecutiveTies).toBe(2);
      expect(room.phase).toBe('TURN_PHASE');

      // Tie 3 (Limit Reached!)
      room.phase = 'VOTING';
      roomManager.castVote(room.roomId, room.players[0].id, room.players[2].id);
      roomManager.castVote(room.roomId, room.players[1].id, room.players[2].id);
      roomManager.castVote(room.roomId, room.players[2].id, room.players[0].id);
      const res3 = roomManager.castVote(room.roomId, room.players[3].id, room.players[0].id);

      expect(res3.isTie).toBe(true);
      expect(room.consecutiveTies).toBe(3);
      expect(room.phase).toBe('GAME_OVER');
      expect(room.winningRole).toBe('UNDERCOVER');
      expect(res3.winner).toBe('UNDERCOVER');
    });

    it('WB-4.4: Elimination resets consecutiveTies counter to 0', () => {
      const { room } = roomManager.createRoom('Host', '🕵️');
      roomManager.joinRoom(room.roomId, 'P2', '🦊');
      roomManager.joinRoom(room.roomId, 'P3', '🤖');
      roomManager.joinRoom(room.roomId, 'P4', '⚡');
      roomManager.startGame(room.roomId);

      room.players[0].role = 'CIVILIAN';
      room.players[1].role = 'CIVILIAN';
      room.players[2].role = 'CIVILIAN';
      room.players[3].role = 'UNDERCOVER';

      // 1st Round: Tie
      room.phase = 'VOTING';
      roomManager.castVote(room.roomId, room.players[0].id, room.players[2].id);
      roomManager.castVote(room.roomId, room.players[1].id, room.players[2].id);
      roomManager.castVote(room.roomId, room.players[2].id, room.players[0].id);
      roomManager.castVote(room.roomId, room.players[3].id, room.players[0].id);
      expect(room.consecutiveTies).toBe(1);

      // 2nd Round: Successful elimination of player 0
      room.phase = 'VOTING';
      roomManager.castVote(room.roomId, room.players[0].id, room.players[1].id);
      roomManager.castVote(room.roomId, room.players[1].id, room.players[0].id);
      roomManager.castVote(room.roomId, room.players[2].id, room.players[0].id);
      roomManager.castVote(room.roomId, room.players[3].id, room.players[0].id);

      expect(room.consecutiveTies).toBe(0);
      expect(room.players[0].isAlive).toBe(false);
    });
  });

  // =========================================================================
  // MODULE 5: MR. WHITE INTERCEPT & FUZZY MATCHER
  // =========================================================================
  describe('Module 5: Mr. White Intercept & Fuzzy Matcher (WB-5)', () => {
    it('WB-5.2: Exact Case-Insensitive Match', () => {
      expect(FuzzyMatcher.isMatch('Rendang', 'rendang')).toBe(true);
      expect(FuzzyMatcher.isMatch('Kopi Tubruk', 'KOPI TUBRUK')).toBe(true);
      expect(FuzzyMatcher.isMatch('Nasi Goreng', '  nasi goreng  ')).toBe(true);
    });

    it('WB-5.3: Minor Typo Tolerance (Levenshtein Distance <= 2)', () => {
      // 1-char typo
      expect(FuzzyMatcher.isMatch('Kucing', 'kucng')).toBe(true); // deletion
      expect(FuzzyMatcher.isMatch('Kucing', 'kucingg')).toBe(true); // insertion
      expect(FuzzyMatcher.isMatch('Kucing', 'kucinq')).toBe(true); // substitution

      // 2-char typo for longer words
      expect(FuzzyMatcher.isMatch('Martabak Manis', 'martabk manis')).toBe(true);
      expect(FuzzyMatcher.isMatch('Helikopter', 'helikoptre')).toBe(true);
    });

    it('WB-5.4: Rejection of Incorrect / Far Words', () => {
      expect(FuzzyMatcher.isMatch('Kucing', 'anjing')).toBe(false);
      expect(FuzzyMatcher.isMatch('Bakso', 'Mie Ayam')).toBe(false);
      expect(FuzzyMatcher.isMatch('Rendang', 'Gulai')).toBe(false);
    });

    it('WB-5.1: RoomManager handles correct Mr. White guess -> Instant Mr. White Victory', () => {
      const roomManager = new RoomManager();
      const { room } = roomManager.createRoom('Host', '🕵️');
      roomManager.joinRoom(room.roomId, 'P2', '🦊');
      roomManager.joinRoom(room.roomId, 'P3', '🤖');
      roomManager.startGame(room.roomId);

      room.players[0].role = 'CIVILIAN';
      room.players[1].role = 'UNDERCOVER';
      room.players[2].role = 'MR_WHITE';
      room.wordPair = {
        id: 'w1',
        category: 'Makanan & Minuman',
        civilianWord: 'Bakso',
        undercoverWord: 'Mie Ayam',
      };

      // Eliminate Mr. White
      room.phase = 'VOTING';
      roomManager.castVote(room.roomId, room.players[0].id, room.players[2].id);
      roomManager.castVote(room.roomId, room.players[1].id, room.players[2].id);
      const res = roomManager.castVote(room.roomId, room.players[2].id, room.players[0].id);

      expect(room.phase).toBe('MR_WHITE_GUESS');

      // Mr. White guesses civilian word correctly
      const guessRes = roomManager.handleMrWhiteGuess(room.roomId, 'bakso');
      expect(guessRes.isCorrect).toBe(true);
      expect(guessRes.winner).toBe('MR_WHITE');
      expect(room.phase).toBe('GAME_OVER');
      expect(room.winningRole).toBe('MR_WHITE');
    });
  });

  // =========================================================================
  // MODULE 6: WIN CONDITIONS & REMATCH STATE RESET
  // =========================================================================
  describe('Module 6: Win Condition Matrix & Rematch (WB-6)', () => {
    it('WB-6.1: Civilian Victory when all Undercovers and Mr. Whites are eliminated', () => {
      const players: Player[] = [
        { id: 'p1', name: 'A', avatar: '🕵️', isHost: true, isAlive: true, role: 'CIVILIAN', hasVoted: false },
        { id: 'p2', name: 'B', avatar: '🦊', isHost: false, isAlive: true, role: 'CIVILIAN', hasVoted: false },
        { id: 'p3', name: 'C', avatar: '🤖', isHost: false, isAlive: false, role: 'UNDERCOVER', hasVoted: false },
      ];

      expect(GameEngine.checkWinCondition(players)).toBe('CIVILIAN');
    });

    it('WB-6.2: Undercover Victory when living Undercovers >= living Civilians', () => {
      const players: Player[] = [
        { id: 'p1', name: 'A', avatar: '🕵️', isHost: true, isAlive: true, role: 'CIVILIAN', hasVoted: false },
        { id: 'p2', name: 'B', avatar: '🦊', isHost: false, isAlive: true, role: 'UNDERCOVER', hasVoted: false },
        { id: 'p3', name: 'C', avatar: '🤖', isHost: false, isAlive: false, role: 'CIVILIAN', hasVoted: false },
      ];

      // 1 alive Undercover vs 1 alive Civilian (total 3 original players)
      expect(GameEngine.checkWinCondition(players)).toBe('UNDERCOVER');
    });

    it('WB-6.4: RoomManager Rematch Resets all players to alive, new words, round 1', () => {
      const roomManager = new RoomManager();
      const { room } = roomManager.createRoom('Host', '🕵️');
      roomManager.joinRoom(room.roomId, 'P2', '🦊');
      roomManager.joinRoom(room.roomId, 'P3', '🤖');
      roomManager.startGame(room.roomId);

      // Kill player 0
      room.players[0].isAlive = false;
      room.consecutiveTies = 2;
      room.phase = 'GAME_OVER';
      room.winningRole = 'UNDERCOVER';

      // Rematch
      const restartedRoom = roomManager.rematch(room.roomId);
      expect(restartedRoom.phase).toBe('LOBBY');
      expect(restartedRoom.round).toBe(1);
      expect(restartedRoom.consecutiveTies).toBe(0);
      expect(restartedRoom.winningRole).toBeUndefined();
      expect(restartedRoom.players.every((p) => p.isAlive)).toBe(true);
      expect(restartedRoom.players.every((p) => !p.hasVoted)).toBe(true);
      expect(restartedRoom.wordPair).toBeUndefined();
    });
  });
});
