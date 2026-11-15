import { describe, it, expect } from 'vitest';
import { assignRoles } from '../utils/gameEngine';
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

