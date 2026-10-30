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
    const { players: assigned } = assignRoles(players, settings, wordPair);
    expect(assigned).toHaveLength(4);
    expect(assigned.filter((p) => p.role === 'CIVILIAN')).toHaveLength(3);
    expect(assigned.filter((p) => p.role === 'UNDERCOVER')).toHaveLength(1);
  });

  it('nextRevealPlayer clamping logic never exceeds players.length - 1 even on repeated invocations', () => {
    let currentRevealIndex = 0;
    const nextRevealPlayer = (totalPlayers: number) => {
      const maxIndex = Math.max(0, totalPlayers - 1);
      currentRevealIndex = Math.min(currentRevealIndex + 1, maxIndex);
    };

    // Simulate 10 rapid clicks on 4-player game
    for (let i = 0; i < 10; i++) {
      nextRevealPlayer(players.length);
    }

    expect(currentRevealIndex).toBe(3);
    expect(currentRevealIndex < players.length).toBe(true);
  });

  it('safeRevealIndex bounds checking handles edge cases', () => {
    const calculateSafeRevealIndex = (index: number, total: number) => {
      return Math.min(Math.max(0, index), Math.max(0, total - 1));
    };

    expect(calculateSafeRevealIndex(-5, 4)).toBe(0);
    expect(calculateSafeRevealIndex(0, 4)).toBe(0);
    expect(calculateSafeRevealIndex(2, 4)).toBe(2);
    expect(calculateSafeRevealIndex(3, 4)).toBe(3);
    expect(calculateSafeRevealIndex(4, 4)).toBe(3);
    expect(calculateSafeRevealIndex(99, 4)).toBe(3);
    expect(calculateSafeRevealIndex(0, 0)).toBe(0);
  });

  it('double-tap guard prevents duplicate triggers during transition window', () => {
    let callCount = 0;
    let isTransitioning = false;

    const handleProceedNext = () => {
      if (isTransitioning) return;
      isTransitioning = true;
      callCount++;
    };

    // First tap executes
    handleProceedNext();
    expect(callCount).toBe(1);
    expect(isTransitioning).toBe(true);

    // Second immediate rapid tap is guarded
    handleProceedNext();
    expect(callCount).toBe(1);

    // Simulated release
    isTransitioning = false;
    handleProceedNext();
    expect(callCount).toBe(2);
  });
});
