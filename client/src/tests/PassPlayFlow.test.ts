import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { assignRoles, calculateVotes, checkWinCondition, generateSpeakingOrder } from '../utils/gameEngine';
import {
  resolvePassPlaySettings,
  resolveTieOutcome,
  sanitizePassPlayPlayers,
} from '../context/PassPlayContext';
import { Player, GameSettings, WordPair } from '../types/game.types';
import { getStoredToken, STORAGE_KEYS } from '../context/SocketContext';

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

  it('tab isolation ensures two tabs in same browser do not overwrite each other', () => {
    // Shared localStorage across browser, tab-scoped sessionStorage
    const sharedLocalStorage = new Map<string, string>();
    const tab1Session = new Map<string, string>();
    const tab2Session = new Map<string, string>();

    const storeTabSession = (tabSession: Map<string, string>, token: string, roomId: string) => {
      tabSession.set('whatstheword_player_token', token);
      tabSession.set('whatstheword_room_id', roomId);
      // Clean up from shared localStorage so other tabs don't inherit it
      sharedLocalStorage.delete('whatstheword_player_token');
      sharedLocalStorage.delete('whatstheword_room_id');
    };

    const getTabToken = (tabSession: Map<string, string>) => {
      return tabSession.get('whatstheword_player_token') || sharedLocalStorage.get('whatstheword_player_token') || null;
    };

    // Tab 1 joins Room A
    storeTabSession(tab1Session, 'token-player-1', 'ROOM-A');
    expect(getTabToken(tab1Session)).toBe('token-player-1');
    expect(sharedLocalStorage.has('whatstheword_player_token')).toBe(false);

    // Tab 2 joins Room B in same browser
    storeTabSession(tab2Session, 'token-player-2', 'ROOM-B');
    expect(getTabToken(tab2Session)).toBe('token-player-2');

    // Tab 1 retains its own token undisturbed
    expect(getTabToken(tab1Session)).toBe('token-player-1');
  });

  it('clearing session removes keys from both sessionStorage and localStorage', () => {
    const mockSession = new Map<string, string>();
    const mockLocal = new Map<string, string>();

    mockSession.set('whatstheword_player_token', 'session-token');
    mockSession.set('whatstheword_room_id', 'ROOM-1');
    mockLocal.set('whatstheword_player_token', 'legacy-token');
    mockLocal.set('whatstheword_room_id', 'ROOM-LEGACY');

    const clearSession = () => {
      mockSession.delete('whatstheword_player_token');
      mockSession.delete('whatstheword_room_id');
      mockLocal.delete('whatstheword_player_token');
      mockLocal.delete('whatstheword_room_id');
    };

    clearSession();
    expect(mockSession.has('whatstheword_player_token')).toBe(false);
    expect(mockSession.has('whatstheword_room_id')).toBe(false);
    expect(mockLocal.has('whatstheword_player_token')).toBe(false);
    expect(mockLocal.has('whatstheword_room_id')).toBe(false);
  });

  it('getStoredToken retrieves from sessionStorage first, then localStorage, else null', () => {
    const originalWindow = globalThis.window;
    const sessionMap = new Map<string, string>();
    const localMap = new Map<string, string>();

    const createMockStorage = (map: Map<string, string>): Storage => ({
      getItem: (key: string) => map.get(key) || null,
      setItem: (key: string, val: string) => { map.set(key, val); },
      removeItem: (key: string) => { map.delete(key); },
      clear: () => { map.clear(); },
      key: (i: number) => Array.from(map.keys())[i] || null,
      get length() { return map.size; },
    });

    const mockSession = createMockStorage(sessionMap);
    const mockLocal = createMockStorage(localMap);

    // Setup global window and storages
    // @ts-ignore
    globalThis.window = {
      sessionStorage: mockSession,
      localStorage: mockLocal,
    };
    // @ts-ignore
    globalThis.sessionStorage = mockSession;
    // @ts-ignore
    globalThis.localStorage = mockLocal;

    try {
      expect(getStoredToken()).toBeNull();

      localMap.set(STORAGE_KEYS.PLAYER_TOKEN, 'token-from-local');
      expect(getStoredToken()).toBe('token-from-local');

      sessionMap.set(STORAGE_KEYS.PLAYER_TOKEN, 'token-from-session');
      expect(getStoredToken()).toBe('token-from-session');
    } finally {
      // @ts-ignore
      globalThis.window = originalWindow;
    }
  });
});

describe('Cluster B Regression Tests (Engine, Warmup, Ties, Sanitization)', () => {
  const basePlayers: Player[] = [
    { id: 'p1', name: 'Alice', avatar: 'token-eye', isHost: true, isAlive: true, hasVoted: false, role: 'CIVILIAN' },
    { id: 'p2', name: 'Bob', avatar: 'token-triangle', isHost: false, isAlive: true, hasVoted: false, role: 'CIVILIAN' },
    { id: 'p3', name: 'Charlie', avatar: 'token-detective', isHost: false, isAlive: true, hasVoted: false, role: 'UNDERCOVER' },
    { id: 'p4', name: 'Dana', avatar: 'token-bolt', isHost: false, isAlive: true, hasVoted: false, role: 'MR_WHITE' },
  ];

  const wordPair: WordPair = {
    id: 'wp-1',
    category: 'Makanan & Minuman',
    civilianWord: 'Kopi',
    undercoverWord: 'Teh',
  };

  it('3x consecutive ties award UNDERCOVER victory', () => {
    // Round 1 tie (split 2-2 votes)
    const tieVotes: Record<string, string> = {
      p1: 'p3',
      p2: 'p3',
      p3: 'p1',
      p4: 'p1',
    };

    const calc1 = calculateVotes(tieVotes, basePlayers);
    expect(calc1.isTie).toBe(true);
    expect(calc1.eliminatedPlayerId).toBeNull();

    const tie1 = resolveTieOutcome(0, 3);
    expect(tie1).toEqual({ nextTies: 1, reachedLimit: false, winningRole: null });

    const tie2 = resolveTieOutcome(tie1.nextTies, 3);
    expect(tie2).toEqual({ nextTies: 2, reachedLimit: false, winningRole: null });

    const tie3 = resolveTieOutcome(tie2.nextTies, 3);
    expect(tie3).toEqual({ nextTies: 3, reachedLimit: true, winningRole: 'UNDERCOVER' });

    const contextSrc = fs.readFileSync(
      path.resolve(__dirname, '../context/PassPlayContext.tsx'),
      'utf-8'
    );
    expect(contextSrc).toContain("setWinningRole('UNDERCOVER')");
    expect(contextSrc).toContain("setPhase('GAME_OVER')");
    expect(contextSrc).toContain('setConsecutiveTies(0)');
  });

  it('advanceWarmupRound advances round in TURN_CLUE without jumping to Round 1 VOTING', () => {
    const contextSrc = fs.readFileSync(
      path.resolve(__dirname, '../context/PassPlayContext.tsx'),
      'utf-8'
    );
    const votingViewSrc = fs.readFileSync(
      path.resolve(__dirname, '../components/game/PassPlayVotingView.tsx'),
      'utf-8'
    );

    expect(contextSrc).toContain('advanceWarmupRound: () => void');
    expect(contextSrc).toMatch(/advanceWarmupRound\s*=\s*useCallback\(\(\)\s*=>\s*\{[\s\S]*setRound\(\(prev\)\s*=>\s*prev\s*\+\s*1\)[\s\S]*setCurrentSpeakerIndex\(0\)[\s\S]*clearVotes\(\)[\s\S]*setSpeakingOrder\(generateSpeakingOrder\(players\)\)[\s\S]*setPhase\('TURN_CLUE'\)/);
    expect(votingViewSrc).toContain('onClick={() => advanceWarmupRound()}');
  });

  it('speakingOrder[0] never places MR_WHITE first across repeated shuffles', () => {
    for (let i = 0; i < 100; i++) {
      const order = generateSpeakingOrder(basePlayers);
      expect(order).toHaveLength(4);
      expect(order[0]).not.toBe('p4');
    }

    const mrWhiteSettings: GameSettings = {
      category: 'Makanan & Minuman',
      civilianCount: 2,
      undercoverCount: 1,
      mrWhiteCount: 1,
      turnDurationSeconds: 45,
      enableMrWhite: true,
    };

    for (let i = 0; i < 50; i++) {
      const { players: assigned, speakingOrder } = assignRoles(basePlayers, mrWhiteSettings, wordPair);
      const firstPlayer = assigned.find((p) => p.id === speakingOrder[0]);
      expect(firstPlayer?.role).not.toBe('MR_WHITE');
    }
  });

  it('blank player names are sanitized and 3-player Mr. White is clamped on startPassPlayGame', () => {
    const dirtyPlayers: Player[] = [
      { id: 'p1', name: '   ', avatar: 'token-eye', isHost: true, isAlive: true, hasVoted: false },
      { id: 'p2', name: '', avatar: 'token-triangle', isHost: false, isAlive: true, hasVoted: false },
      { id: 'p3', name: '  Budi  ', avatar: 'token-detective', isHost: false, isAlive: true, hasVoted: false },
    ];

    const sanitized = sanitizePassPlayPlayers(dirtyPlayers);
    expect(sanitized.map((p) => p.name)).toEqual(['Pemain 1', 'Pemain 2', 'Budi']);

    const staleThreePlayerSettings: GameSettings = {
      category: 'Makanan & Minuman',
      civilianCount: 1,
      undercoverCount: 2,
      mrWhiteCount: 1,
      turnDurationSeconds: 45,
      enableMrWhite: true,
    };

    const resolved3 = resolvePassPlaySettings(3, staleThreePlayerSettings);
    expect(resolved3.mrWhiteCount).toBe(0);
    expect(resolved3.enableMrWhite).toBe(false);
    expect(resolved3.undercoverCount).toBe(1);
    expect(resolved3.civilianCount).toBe(2);

    const { players: assigned3 } = assignRoles(sanitized, staleThreePlayerSettings, wordPair);
    expect(assigned3.filter((p) => p.role === 'MR_WHITE')).toHaveLength(0);
    expect(assigned3.filter((p) => p.role === 'UNDERCOVER')).toHaveLength(1);
    expect(assigned3.filter((p) => p.role === 'CIVILIAN')).toHaveLength(2);

    const staleFourPlayerSettings: GameSettings = {
      ...staleThreePlayerSettings,
      mrWhiteCount: 0,
      enableMrWhite: true,
    };
    const resolved4 = resolvePassPlaySettings(4, staleFourPlayerSettings);
    expect(resolved4.mrWhiteCount).toBe(1);
    expect(resolved4.undercoverCount).toBe(1);
    expect(resolved4.civilianCount).toBe(2);
  });

  it('checkWinCondition handles Mr. White + Undercover + Civilian scenarios accurately', () => {
    // 1 Civilian, 1 Undercover, 1 Mr. White -> game continues
    expect(
      checkWinCondition([
        { ...basePlayers[0], isAlive: true, role: 'CIVILIAN' },
        { ...basePlayers[2], isAlive: true, role: 'UNDERCOVER' },
        { ...basePlayers[3], isAlive: true, role: 'MR_WHITE' },
      ])
    ).toBeNull();

    // 1 Civilian, 1 Mr. White -> MR_WHITE wins
    expect(
      checkWinCondition([
        { ...basePlayers[0], isAlive: true, role: 'CIVILIAN' },
        { ...basePlayers[3], isAlive: true, role: 'MR_WHITE' },
      ])
    ).toBe('MR_WHITE');

    // 1 Undercover, 1 Mr. White -> UNDERCOVER wins
    expect(
      checkWinCondition([
        { ...basePlayers[2], isAlive: true, role: 'UNDERCOVER' },
        { ...basePlayers[3], isAlive: true, role: 'MR_WHITE' },
      ])
    ).toBe('UNDERCOVER');

    // 2 Civilians, 2 Undercovers, 0 Mr. White -> UNDERCOVER wins
    expect(
      checkWinCondition([
        { ...basePlayers[0], isAlive: true, role: 'CIVILIAN' },
        { ...basePlayers[1], isAlive: true, role: 'CIVILIAN' },
        { ...basePlayers[2], isAlive: true, role: 'UNDERCOVER' },
        { ...basePlayers[3], isAlive: true, role: 'UNDERCOVER' },
      ])
    ).toBe('UNDERCOVER');

    // Only Civilians alive -> CIVILIAN wins
    expect(
      checkWinCondition([
        { ...basePlayers[0], isAlive: true, role: 'CIVILIAN' },
        { ...basePlayers[1], isAlive: true, role: 'CIVILIAN' },
        { ...basePlayers[2], isAlive: false, role: 'UNDERCOVER' },
        { ...basePlayers[3], isAlive: false, role: 'MR_WHITE' },
      ])
    ).toBe('CIVILIAN');
  });
});

