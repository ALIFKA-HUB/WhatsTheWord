import { describe, it, expect } from 'vitest';
import { GameEngine, assignRoles, calculateVotes, checkWinCondition } from '../src/engine/GameEngine.js';
import { Player, GameSettings, WordPair } from '../src/types/game.types.js';

describe('GameEngine', () => {
  const sampleWordPair: WordPair = {
    id: 'wp-1',
    category: 'Makanan & Minuman',
    civilianWord: 'Kopi',
    undercoverWord: 'Teh',
  };

  const createMockPlayers = (count: number): Player[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `p-${i + 1}`,
      name: `Player ${i + 1}`,
      avatar: `avatar-${i + 1}`,
      isHost: i === 0,
      isAlive: true,
      hasVoted: false,
    }));
  };

  describe('assignRoles', () => {
    it('should correctly assign roles and words for 4 players (1 Undercover, 0 Mr. White)', () => {
      const players = createMockPlayers(4);
      const settings: GameSettings = {
        category: 'Makanan & Minuman',
        civilianCount: 3,
        undercoverCount: 1,
        mrWhiteCount: 0,
        turnDurationSeconds: 30,
        enableMrWhite: false,
      };

      const result = assignRoles(players, settings, sampleWordPair);

      expect(result.players).toHaveLength(4);
      expect(result.speakingOrder).toHaveLength(4);

      const undercovers = result.players.filter((p) => p.role === 'UNDERCOVER');
      const civilians = result.players.filter((p) => p.role === 'CIVILIAN');
      const mrWhites = result.players.filter((p) => p.role === 'MR_WHITE');

      expect(undercovers).toHaveLength(1);
      expect(civilians).toHaveLength(3);
      expect(mrWhites).toHaveLength(0);

      expect(undercovers[0].word).toBe('Teh');
      civilians.forEach((civ) => {
        expect(civ.word).toBe('Kopi');
        expect(civ.isAlive).toBe(true);
        expect(civ.hasVoted).toBe(false);
      });

      // speakingOrder should contain all player IDs
      const playerIds = players.map((p) => p.id);
      expect(new Set(result.speakingOrder)).toEqual(new Set(playerIds));
    });

    it('should assign Mr. White with empty word when enabled', () => {
      const players = createMockPlayers(6);
      const settings: GameSettings = {
        category: 'Makanan & Minuman',
        civilianCount: 4,
        undercoverCount: 1,
        mrWhiteCount: 1,
        turnDurationSeconds: 30,
        enableMrWhite: true,
      };

      const result = assignRoles(players, settings, sampleWordPair);

      const mrWhites = result.players.filter((p) => p.role === 'MR_WHITE');
      expect(mrWhites).toHaveLength(1);
      expect(mrWhites[0].word).toBe('');

      const undercovers = result.players.filter((p) => p.role === 'UNDERCOVER');
      expect(undercovers).toHaveLength(1);
      expect(undercovers[0].word).toBe('Teh');

      const civilians = result.players.filter((p) => p.role === 'CIVILIAN');
      expect(civilians).toHaveLength(4);
      civilians.forEach((c) => expect(c.word).toBe('Kopi'));
    });

    it('should throw error if player count is insufficient for roles', () => {
      const players = createMockPlayers(2);
      const settings: GameSettings = {
        category: 'Makanan & Minuman',
        civilianCount: 2,
        undercoverCount: 1,
        mrWhiteCount: 1,
        turnDurationSeconds: 30,
        enableMrWhite: true,
      };

      expect(() => assignRoles(players, settings, sampleWordPair)).toThrow();
    });
  });

  describe('calculateVotes', () => {
    it('should eliminate the player with clear highest votes', () => {
      const activePlayers = createMockPlayers(4);
      const votes: Record<string, string> = {
        'p-1': 'p-2',
        'p-3': 'p-2',
        'p-4': 'p-2',
        'p-2': 'p-1',
      };

      const result = calculateVotes(votes, activePlayers);

      expect(result.isTie).toBe(false);
      expect(result.eliminatedPlayerId).toBe('p-2');
      expect(result.voteCounts['p-2']).toBe(3);
      expect(result.voteCounts['p-1']).toBe(1);
    });

    it('should return instant skip tie when 2 players have identical highest votes', () => {
      const activePlayers = createMockPlayers(4);
      const votes: Record<string, string> = {
        'p-1': 'p-2',
        'p-3': 'p-2',
        'p-2': 'p-4',
        'p-4': 'p-4',
      };

      const result = calculateVotes(votes, activePlayers);

      expect(result.isTie).toBe(true);
      expect(result.eliminatedPlayerId).toBeNull();
      expect(result.voteCounts['p-2']).toBe(2);
      expect(result.voteCounts['p-4']).toBe(2);
    });

    it('should return tie when 3 players have identical highest votes', () => {
      const activePlayers = createMockPlayers(6);
      const votes: Record<string, string> = {
        'p-1': 'p-2',
        'p-2': 'p-3',
        'p-3': 'p-4',
        'p-4': 'p-2',
        'p-5': 'p-3',
        'p-6': 'p-4',
      };

      const result = calculateVotes(votes, activePlayers);

      expect(result.isTie).toBe(true);
      expect(result.eliminatedPlayerId).toBeNull();
    });

    it('should not treat tie for second place as a tie for highest', () => {
      const activePlayers = createMockPlayers(5);
      const votes: Record<string, string> = {
        'p-1': 'p-5',
        'p-2': 'p-5',
        'p-3': 'p-5',
        'p-4': 'p-1',
        'p-5': 'p-2',
      };

      const result = calculateVotes(votes, activePlayers);

      expect(result.isTie).toBe(false);
      expect(result.eliminatedPlayerId).toBe('p-5');
    });

    it('should return tie and no elimination if no votes are cast', () => {
      const activePlayers = createMockPlayers(4);
      const votes: Record<string, string> = {};

      const result = calculateVotes(votes, activePlayers);

      expect(result.isTie).toBe(true);
      expect(result.eliminatedPlayerId).toBeNull();
    });
  });

  describe('checkWinCondition', () => {
    it('should declare CIVILIAN win when all Undercover and Mr. White are eliminated', () => {
      const players: Player[] = [
        { id: '1', name: 'P1', avatar: 'a1', isHost: true, role: 'CIVILIAN', isAlive: true, hasVoted: false },
        { id: '2', name: 'P2', avatar: 'a2', isHost: false, role: 'CIVILIAN', isAlive: true, hasVoted: false },
        { id: '3', name: 'P3', avatar: 'a3', isHost: false, role: 'UNDERCOVER', isAlive: false, hasVoted: false },
        { id: '4', name: 'P4', avatar: 'a4', isHost: false, role: 'MR_WHITE', isAlive: false, hasVoted: false },
      ];

      expect(checkWinCondition(players)).toBe('CIVILIAN');
    });

    it('should declare UNDERCOVER win when alive Undercovers >= alive Civilians', () => {
      // 2 Undercovers vs 2 Civilians
      const players: Player[] = [
        { id: '1', name: 'P1', avatar: 'a1', isHost: true, role: 'CIVILIAN', isAlive: true, hasVoted: false },
        { id: '2', name: 'P2', avatar: 'a2', isHost: false, role: 'CIVILIAN', isAlive: true, hasVoted: false },
        { id: '3', name: 'P3', avatar: 'a3', isHost: false, role: 'UNDERCOVER', isAlive: true, hasVoted: false },
        { id: '4', name: 'P4', avatar: 'a4', isHost: false, role: 'UNDERCOVER', isAlive: true, hasVoted: false },
        { id: '5', name: 'P5', avatar: 'a5', isHost: false, role: 'MR_WHITE', isAlive: false, hasVoted: false },
      ];

      expect(checkWinCondition(players)).toBe('UNDERCOVER');
    });

    it('should declare UNDERCOVER win when 1 Undercover vs 1 Civilian remain', () => {
      const players: Player[] = [
        { id: '1', name: 'P1', avatar: 'a1', isHost: true, role: 'CIVILIAN', isAlive: true, hasVoted: false },
        { id: '2', name: 'P2', avatar: 'a2', isHost: false, role: 'CIVILIAN', isAlive: false, hasVoted: false },
        { id: '3', name: 'P3', avatar: 'a3', isHost: false, role: 'UNDERCOVER', isAlive: true, hasVoted: false },
      ];

      expect(checkWinCondition(players)).toBe('UNDERCOVER');
    });

    it('should declare MR_WHITE win when Mr. White survives to the final 2 players', () => {
      const players: Player[] = [
        { id: '1', name: 'P1', avatar: 'a1', isHost: true, role: 'CIVILIAN', isAlive: true, hasVoted: false },
        { id: '2', name: 'P2', avatar: 'a2', isHost: false, role: 'CIVILIAN', isAlive: false, hasVoted: false },
        { id: '3', name: 'P3', avatar: 'a3', isHost: false, role: 'UNDERCOVER', isAlive: false, hasVoted: false },
        { id: '4', name: 'P4', avatar: 'a4', isHost: false, role: 'MR_WHITE', isAlive: true, hasVoted: false },
      ];

      expect(checkWinCondition(players)).toBe('MR_WHITE');
    });

    it('should return null if game is still active without a winner', () => {
      const players: Player[] = [
        { id: '1', name: 'P1', avatar: 'a1', isHost: true, role: 'CIVILIAN', isAlive: true, hasVoted: false },
        { id: '2', name: 'P2', avatar: 'a2', isHost: false, role: 'CIVILIAN', isAlive: true, hasVoted: false },
        { id: '3', name: 'P3', avatar: 'a3', isHost: false, role: 'CIVILIAN', isAlive: true, hasVoted: false },
        { id: '4', name: 'P4', avatar: 'a4', isHost: false, role: 'UNDERCOVER', isAlive: true, hasVoted: false },
        { id: '5', name: 'P5', avatar: 'a5', isHost: false, role: 'MR_WHITE', isAlive: true, hasVoted: false },
      ];

      expect(checkWinCondition(players)).toBeNull();
    });
  });

  describe('GameEngine class wrapper', () => {
    it('should expose static methods identically', () => {
      const players = createMockPlayers(4);
      const settings: GameSettings = {
        category: 'Makanan & Minuman',
        civilianCount: 3,
        undercoverCount: 1,
        mrWhiteCount: 0,
        turnDurationSeconds: 30,
        enableMrWhite: false,
      };

      const result = GameEngine.assignRoles(players, settings, sampleWordPair);
      expect(result.players).toHaveLength(4);
    });
  });
});
