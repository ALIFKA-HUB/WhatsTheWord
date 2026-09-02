import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Player, GameSettings, WordPair } from '../types/game.types';
import { assignRoles, calculateVotes, checkWinCondition, shuffleArray } from '../utils/gameEngine';
import { getRandomWordPair } from '../data/defaultWordPacks';
import { isFuzzyMatch } from '../utils/fuzzyMatcher';
import { getLocalCustomPacks } from '../services/wordPackService';

export type PassPlayPhase =
  | 'SETUP'
  | 'REVEAL_PASS'
  | 'TURN_CLUE'
  | 'VOTING'
  | 'MR_WHITE_GUESS'
  | 'GAME_OVER';

export interface PassPlayContextType {
  // State
  players: Player[];
  phase: PassPlayPhase;
  currentRevealIndex: number;
  speakingOrder: string[];
  currentSpeakerIndex: number;
  activeSpeakerId: string | null;
  round: number;
  wordPair: WordPair | null;
  settings: GameSettings;
  winningRole: 'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE' | null;
  eliminatedPlayer: Player | null;
  pendingEliminatedPlayer: Player | null;
  votes: Record<string, string>;
  isTieLastRound: boolean;
  consecutiveTies: number;
  tieMessage: string | null;
  mrWhiteGuessResult: { guessed: string; isCorrect: boolean } | null;

  // Actions
  addPlayer: (name: string, avatar: string) => boolean;
  removePlayer: (playerId: string) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  startPassPlayGame: (customPair?: WordPair) => boolean;
  nextRevealPlayer: () => void;
  finishRevealPhase: () => void;
  nextSpeaker: () => void;
  startVotingPhase: () => void;
  castVote: (voterId: string, targetId: string) => void;
  clearVotes: () => void;
  processElimination: (targetPlayerId?: string) => {
    isTie: boolean;
    eliminatedPlayer: Player | null;
    needsMrWhiteGuess: boolean;
    winningRole: 'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE' | null;
  };
  submitMrWhiteGuess: (guessedWord: string) => {
    isCorrect: boolean;
    winningRole: 'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE' | null;
  };
  skipMrWhiteGuess: () => void;
  rematch: () => void;
  resetToSetup: () => void;
}

const DEFAULT_SETTINGS: GameSettings = {
  category: 'Makanan & Minuman',
  civilianCount: 3,
  undercoverCount: 1,
  mrWhiteCount: 0,
  turnDurationSeconds: 45,
  enableMrWhite: false,
};

const DEFAULT_INITIAL_PLAYERS: Player[] = [
  { id: 'p1', name: 'Agent Cyber', avatar: '🕵️', isHost: true, isAlive: true, hasVoted: false },
  { id: 'p2', name: 'Neon Fox', avatar: '🦊', isHost: false, isAlive: true, hasVoted: false },
  { id: 'p3', name: 'Shadow Byte', avatar: '🤖', isHost: false, isAlive: true, hasVoted: false },
  { id: 'p4', name: 'Phantom V', avatar: '⚡', isHost: false, isAlive: true, hasVoted: false },
];

export const PassPlayContext = createContext<PassPlayContextType | null>(null);

export interface PassPlayProviderProps {
  children: React.ReactNode;
}

export const PassPlayProvider: React.FC<PassPlayProviderProps> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem('whatstheword_passplay_roster');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length >= 3) {
            return parsed.map((p: Partial<Player>, idx: number) => ({
              id: p.id || `p_${Date.now()}_${idx}`,
              name: p.name || `Pemain ${idx + 1}`,
              avatar: p.avatar || '🕵️',
              isHost: idx === 0,
              isAlive: true,
              hasVoted: false,
            }));
          }
        }
      }
    } catch {
      // ignore storage error
    }
    return DEFAULT_INITIAL_PLAYERS;
  });

  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem('whatstheword_passplay_settings');
        if (stored) {
          const parsed = JSON.parse(stored);
          return { ...DEFAULT_SETTINGS, ...parsed };
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  const [phase, setPhase] = useState<PassPlayPhase>('SETUP');
  const [currentRevealIndex, setCurrentRevealIndex] = useState<number>(0);
  const [speakingOrder, setSpeakingOrder] = useState<string[]>([]);
  const [currentSpeakerIndex, setCurrentSpeakerIndex] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [wordPair, setWordPair] = useState<WordPair | null>(null);
  const [winningRole, setWinningRole] = useState<'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE' | null>(null);
  const [eliminatedPlayer, setEliminatedPlayer] = useState<Player | null>(null);
  const [pendingEliminatedPlayer, setPendingEliminatedPlayer] = useState<Player | null>(null);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [isTieLastRound, setIsTieLastRound] = useState<boolean>(false);
  const [consecutiveTies, setConsecutiveTies] = useState<number>(0);
  const [tieMessage, setTieMessage] = useState<string | null>(null);
  const [mrWhiteGuessResult, setMrWhiteGuessResult] = useState<{ guessed: string; isCorrect: boolean } | null>(null);

  // Sync roster and settings to localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const sanitizedRoster = players.map(({ id, name, avatar, isHost }) => ({
          id,
          name,
          avatar,
          isHost,
        }));
        localStorage.setItem('whatstheword_passplay_roster', JSON.stringify(sanitizedRoster));
      }
    } catch {
      // ignore
    }
  }, [players]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('whatstheword_passplay_settings', JSON.stringify(settings));
      }
    } catch {
      // ignore
    }
  }, [settings]);

  // Keep role counts in sync with player count in setup
  useEffect(() => {
    if (phase !== 'SETUP') return;

    const total = players.length;
    const mrWhite = settings.enableMrWhite ? Math.min(settings.mrWhiteCount, 1) : 0;
    // max undercovers should not exceed total - 2
    const maxUndercover = Math.max(1, Math.floor((total - mrWhite - 1) / 2));
    const safeUndercover = Math.min(Math.max(1, settings.undercoverCount), maxUndercover);
    const civilian = total - safeUndercover - mrWhite;

    if (
      settings.undercoverCount !== safeUndercover ||
      settings.mrWhiteCount !== mrWhite ||
      settings.civilianCount !== civilian
    ) {
      setSettings((prev) => ({
        ...prev,
        mrWhiteCount: mrWhite,
        undercoverCount: safeUndercover,
        civilianCount: Math.max(1, civilian),
      }));
    }
  }, [players.length, settings.enableMrWhite, settings.undercoverCount, settings.mrWhiteCount, phase]);

  const addPlayer = useCallback((name: string, avatar: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed) return false;

    setPlayers((prev) => {
      if (prev.length >= 20) return prev;
      const newPlayer: Player = {
        id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: trimmed,
        avatar: avatar || '🕵️',
        isHost: prev.length === 0,
        isAlive: true,
        hasVoted: false,
      };
      return [...prev, newPlayer];
    });
    return true;
  }, []);

  const removePlayer = useCallback((playerId: string) => {
    setPlayers((prev) => {
      if (prev.length <= 2) return prev; // Min 2 players
      const filtered = prev.filter((p) => p.id !== playerId);
      if (filtered.length > 0 && !filtered.some((p) => p.isHost)) {
        filtered[0].isHost = true;
      }
      return filtered;
    });
  }, []);

  const updatePlayer = useCallback((playerId: string, updates: Partial<Player>) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, ...updates } : p))
    );
  }, []);

  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // Choose a random or custom word pair based on current settings
  const pickWordPair = useCallback((customPair?: WordPair): WordPair => {
    if (customPair) return customPair;
    if (settings.customWordPair) return settings.customWordPair;

    // Check if category matches a local custom pack
    const customPacks = getLocalCustomPacks();
    const matchingCustomPack = customPacks.find((cp) => cp.title === settings.category || cp.id === settings.category);
    if (matchingCustomPack && matchingCustomPack.wordPairs && matchingCustomPack.wordPairs.length > 0) {
      const idx = Math.floor(Math.random() * matchingCustomPack.wordPairs.length);
      return matchingCustomPack.wordPairs[idx];
    }

    if (settings.category === '🎲 Acak / Misteri' || settings.category === 'Acak') {
      const randomPair = getRandomWordPair();
      return {
        ...randomPair,
        category: '🎲 Acak / Misteri',
      };
    }

    return getRandomWordPair(settings.category);
  }, [settings.category, settings.customWordPair]);

  // Start Pass & Play Game
  const startPassPlayGame = useCallback((customPair?: WordPair): boolean => {
    if (players.length < 2) return false;

    const selectedWordPair = pickWordPair(customPair);
    setWordPair(selectedWordPair);

    // Calculate verified role counts
    const total = players.length;
    const mrWhite = settings.enableMrWhite && total >= 3 ? Math.min(settings.mrWhiteCount, 1) : 0;
    const maxUndercover = total === 2 ? 1 : Math.max(1, Math.floor((total - mrWhite - 1) / 2));
    const undercover = Math.min(Math.max(1, settings.undercoverCount || 1), maxUndercover);
    const civilian = Math.max(1, total - undercover - mrWhite);

    const validSettings: GameSettings = {
      ...settings,
      civilianCount: civilian,
      undercoverCount: undercover,
      mrWhiteCount: mrWhite,
    };

    try {
      const { players: assignedPlayers, speakingOrder: order } = assignRoles(
        players,
        validSettings,
        selectedWordPair
      );

      setPlayers(assignedPlayers);
      setSpeakingOrder(order);
      setCurrentRevealIndex(0);
      setCurrentSpeakerIndex(0);
      setRound(1);
      setWinningRole(null);
      setEliminatedPlayer(null);
      setPendingEliminatedPlayer(null);
      setVotes({});
      setIsTieLastRound(false);
      setConsecutiveTies(0);
      setConsecutiveTies(0);
      setTieMessage(null);
      setMrWhiteGuessResult(null);
      setPhase('REVEAL_PASS');
      return true;
    } catch (err) {
      console.error('Failed to start pass and play game:', err);
      return false;
    }
  }, [players, settings, pickWordPair]);

  const nextRevealPlayer = useCallback(() => {
    setCurrentRevealIndex((prev) => {
      const next = prev + 1;
      return next;
    });
  }, []);

  const finishRevealPhase = useCallback(() => {
    // Alive speaking order
    const aliveSpeakerIds = speakingOrder.filter(
      (id) => players.find((p) => p.id === id)?.isAlive !== false
    );
    setSpeakingOrder(aliveSpeakerIds.length > 0 ? aliveSpeakerIds : players.map((p) => p.id));
    setCurrentSpeakerIndex(0);
    setPhase('TURN_CLUE');
  }, [speakingOrder, players]);

  const activeSpeakerId = useMemo(() => {
    if (phase !== 'TURN_CLUE') return null;
    const aliveSpeakers = speakingOrder.filter(
      (id) => players.find((p) => p.id === id)?.isAlive !== false
    );
    if (aliveSpeakers.length === 0) return null;
    return aliveSpeakers[currentSpeakerIndex % aliveSpeakers.length] || null;
  }, [phase, speakingOrder, players, currentSpeakerIndex]);

  const nextSpeaker = useCallback(() => {
    const aliveSpeakers = speakingOrder.filter(
      (id) => players.find((p) => p.id === id)?.isAlive !== false
    );

    if (currentSpeakerIndex + 1 >= aliveSpeakers.length) {
      // Everyone gave their clue -> Transition to Voting
      setPhase('VOTING');
      setCurrentSpeakerIndex(0);
      setVotes({});
    } else {
      setCurrentSpeakerIndex((prev) => prev + 1);
    }
  }, [speakingOrder, players, currentSpeakerIndex]);

  const startVotingPhase = useCallback(() => {
    setPhase('VOTING');
    setVotes({});
  }, []);

  const castVote = useCallback((voterId: string, targetId: string) => {
    setVotes((prev) => ({
      ...prev,
      [voterId]: targetId,
    }));
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === voterId ? { ...p, hasVoted: true, votedTargetId: targetId } : p
      )
    );
  }, []);

  const clearVotes = useCallback(() => {
    setVotes({});
    setPlayers((prev) =>
      prev.map((p) => ({ ...p, hasVoted: false, votedTargetId: undefined }))
    );
  }, []);

  // Process elimination from vote tally OR direct selection
  const processElimination = useCallback(
    (targetPlayerId?: string): {
      isTie: boolean;
      eliminatedPlayer: Player | null;
      needsMrWhiteGuess: boolean;
      winningRole: 'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE' | null;
    } => {
      let eliminatedId: string | null = null;
      let isTie = false;

      if (targetPlayerId) {
        eliminatedId = targetPlayerId;
      } else {
        const result = calculateVotes(votes, players);
        isTie = result.isTie;
        eliminatedId = result.eliminatedPlayerId;
      }

      // Handle Tie
      if (isTie || !eliminatedId) {
        setIsTieLastRound(true);
        setTieMessage('Hasil voting seri (Tie)! Tidak ada pemain yang tereliminasi pada ronde ini.');
        // Next round
        setRound((prev) => prev + 1);
        setSpeakingOrder((prev) => shuffleArray(prev));
        setCurrentSpeakerIndex(0);
        clearVotes();
        setPhase('TURN_CLUE');

        return {
          isTie: true,
          eliminatedPlayer: null,
          needsMrWhiteGuess: false,
          winningRole: null,
        };
      }

      setIsTieLastRound(false);
      setTieMessage(null);

      const targetPlayer = players.find((p) => p.id === eliminatedId);
      if (!targetPlayer) {
        return {
          isTie: false,
          eliminatedPlayer: null,
          needsMrWhiteGuess: false,
          winningRole: null,
        };
      }

      // Check if target is Mr. White -> Trigger Guess Intercept
      if (targetPlayer.role === 'MR_WHITE') {
        setPendingEliminatedPlayer(targetPlayer);
        setPhase('MR_WHITE_GUESS');
        return {
          isTie: false,
          eliminatedPlayer: targetPlayer,
          needsMrWhiteGuess: true,
          winningRole: null,
        };
      }

      // Mark player eliminated
      const updatedPlayers = players.map((p) =>
        p.id === eliminatedId ? { ...p, isAlive: false } : p
      );
      setPlayers(updatedPlayers);
      setEliminatedPlayer(targetPlayer);

      // Check victory condition
      const winner = checkWinCondition(updatedPlayers);
      if (winner) {
        setWinningRole(winner);
        setPhase('GAME_OVER');
        return {
          isTie: false,
          eliminatedPlayer: targetPlayer,
          needsMrWhiteGuess: false,
          winningRole: winner,
        };
      }

      // Game continues to next round
      setRound((prev) => prev + 1);
      const remainingAliveIds = updatedPlayers.filter((p) => p.isAlive).map((p) => p.id);
      setSpeakingOrder(shuffleArray(remainingAliveIds));
      setCurrentSpeakerIndex(0);
      clearVotes();
      setPhase('TURN_CLUE');

      return {
        isTie: false,
        eliminatedPlayer: targetPlayer,
        needsMrWhiteGuess: false,
        winningRole: null,
      };
    },
    [players, votes, clearVotes]
  );

  // Mr. White Guess submission
  const submitMrWhiteGuess = useCallback(
    (guessedWord: string): {
      isCorrect: boolean;
      winningRole: 'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE' | null;
    } => {
      if (!wordPair || !pendingEliminatedPlayer) {
        return { isCorrect: false, winningRole: null };
      }

      const isCorrect = isFuzzyMatch(guessedWord, wordPair.civilianWord);
      setMrWhiteGuessResult({ guessed: guessedWord, isCorrect });

      if (isCorrect) {
        // Mr. White Wins Immediately!
        setWinningRole('MR_WHITE');
        setPhase('GAME_OVER');
        return { isCorrect: true, winningRole: 'MR_WHITE' };
      }

      // Wrong Guess -> Mr. White is eliminated
      const updatedPlayers = players.map((p) =>
        p.id === pendingEliminatedPlayer.id ? { ...p, isAlive: false } : p
      );
      setPlayers(updatedPlayers);
      setEliminatedPlayer(pendingEliminatedPlayer);
      setPendingEliminatedPlayer(null);

      // Check if another team wins now
      const winner = checkWinCondition(updatedPlayers);
      if (winner) {
        setWinningRole(winner);
        setPhase('GAME_OVER');
        return { isCorrect: false, winningRole: winner };
      }

      // Otherwise game continues
      setRound((prev) => prev + 1);
      const remainingAliveIds = updatedPlayers.filter((p) => p.isAlive).map((p) => p.id);
      setSpeakingOrder(shuffleArray(remainingAliveIds));
      setCurrentSpeakerIndex(0);
      clearVotes();
      setPhase('TURN_CLUE');

      return { isCorrect: false, winningRole: null };
    },
    [wordPair, pendingEliminatedPlayer, players, clearVotes]
  );

  const skipMrWhiteGuess = useCallback(() => {
    if (!pendingEliminatedPlayer) return;

    // Eliminate Mr. White
    const updatedPlayers = players.map((p) =>
      p.id === pendingEliminatedPlayer.id ? { ...p, isAlive: false } : p
    );
    setPlayers(updatedPlayers);
    setEliminatedPlayer(pendingEliminatedPlayer);
    setPendingEliminatedPlayer(null);

    const winner = checkWinCondition(updatedPlayers);
    if (winner) {
      setWinningRole(winner);
      setPhase('GAME_OVER');
      return;
    }

    setRound((prev) => prev + 1);
    const remainingAliveIds = updatedPlayers.filter((p) => p.isAlive).map((p) => p.id);
    setSpeakingOrder(shuffleArray(remainingAliveIds));
    setCurrentSpeakerIndex(0);
    clearVotes();
    setPhase('TURN_CLUE');
  }, [pendingEliminatedPlayer, players, clearVotes]);

  // Rematch with same players roster
  const rematch = useCallback(() => {
    const newPair = pickWordPair();
    setWordPair(newPair);

    // Reset players alive status and roles
    const total = players.length;
    const mrWhite = settings.enableMrWhite ? Math.min(settings.mrWhiteCount, 1) : 0;
    const undercover = Math.min(Math.max(1, settings.undercoverCount), Math.floor((total - mrWhite - 1) / 2));
    const civilian = total - undercover - mrWhite;

    const validSettings: GameSettings = {
      ...settings,
      civilianCount: civilian,
      undercoverCount: undercover,
      mrWhiteCount: mrWhite,
    };

    const resetRoster = players.map((p) => ({
      ...p,
      isAlive: true,
      hasVoted: false,
      votedTargetId: undefined,
      isSpeaking: false,
    }));

    try {
      const { players: assignedPlayers, speakingOrder: order } = assignRoles(
        resetRoster,
        validSettings,
        newPair
      );

      setPlayers(assignedPlayers);
      setSpeakingOrder(order);
      setCurrentRevealIndex(0);
      setCurrentSpeakerIndex(0);
      setRound(1);
      setWinningRole(null);
      setEliminatedPlayer(null);
      setPendingEliminatedPlayer(null);
      setVotes({});
      setIsTieLastRound(false);
      setTieMessage(null);
      setMrWhiteGuessResult(null);
      setPhase('REVEAL_PASS');
    } catch (err) {
      console.error('Failed to restart match:', err);
    }
  }, [players, settings, pickWordPair]);

  // Reset back to Setup
  const resetToSetup = useCallback(() => {
    setPhase('SETUP');
    setWinningRole(null);
    setEliminatedPlayer(null);
    setPendingEliminatedPlayer(null);
    setVotes({});
    setIsTieLastRound(false);
    setTieMessage(null);
    setMrWhiteGuessResult(null);
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        isAlive: true,
        hasVoted: false,
        votedTargetId: undefined,
        role: undefined,
        word: undefined,
      }))
    );
  }, []);

  const value = useMemo<PassPlayContextType>(
    () => ({
      players,
      phase,
      currentRevealIndex,
      speakingOrder,
      currentSpeakerIndex,
      activeSpeakerId,
      round,
      wordPair,
      settings,
      winningRole,
      eliminatedPlayer,
      pendingEliminatedPlayer,
      votes,
      isTieLastRound,
      consecutiveTies,
      tieMessage,
      mrWhiteGuessResult,
      addPlayer,
      removePlayer,
      updatePlayer,
      setPlayers,
      updateSettings,
      startPassPlayGame,
      nextRevealPlayer,
      finishRevealPhase,
      nextSpeaker,
      startVotingPhase,
      castVote,
      clearVotes,
      processElimination,
      submitMrWhiteGuess,
      skipMrWhiteGuess,
      rematch,
      resetToSetup,
    }),
    [
      players,
      phase,
      currentRevealIndex,
      speakingOrder,
      currentSpeakerIndex,
      activeSpeakerId,
      round,
      wordPair,
      settings,
      winningRole,
      eliminatedPlayer,
      pendingEliminatedPlayer,
      votes,
      isTieLastRound,
      consecutiveTies,
      tieMessage,
      mrWhiteGuessResult,
      addPlayer,
      removePlayer,
      updatePlayer,
      updateSettings,
      startPassPlayGame,
      nextRevealPlayer,
      finishRevealPhase,
      nextSpeaker,
      startVotingPhase,
      castVote,
      clearVotes,
      processElimination,
      submitMrWhiteGuess,
      skipMrWhiteGuess,
      rematch,
      resetToSetup,
    ]
  );

  return <PassPlayContext.Provider value={value}>{children}</PassPlayContext.Provider>;
};

export const usePassPlay = (): PassPlayContextType => {
  const context = useContext(PassPlayContext);
  if (!context) {
    throw new Error('usePassPlay must be used within a PassPlayProvider');
  }
  return context;
};

export default PassPlayContext;
