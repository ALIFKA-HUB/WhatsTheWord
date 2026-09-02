import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { soundSynthesizer } from '../utils/soundSynthesizer';

const STORAGE_KEY = 'whatstheword_muted';

export interface AudioContextType {
  isMuted: boolean;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
  playTick: () => void;
  playUrgentTick: () => void;
  playRoleReveal: () => void;
  playVoteBuzzer: () => void;
  playElimination: () => void;
  playVictory: () => void;
  playDefeat: () => void;
  playButtonTap: () => void;
}

export const AudioContext = createContext<AudioContextType | null>(null);

export interface AudioProviderProps {
  children: React.ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [isMuted, setIsMutedState] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored !== null ? JSON.parse(stored) : false;
      }
      return false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    soundSynthesizer.setMuted(isMuted);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(isMuted));
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMutedState((prev) => !prev);
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    setIsMutedState(muted);
  }, []);

  const playTick = useCallback(() => soundSynthesizer.playTick(), []);
  const playUrgentTick = useCallback(() => soundSynthesizer.playUrgentTick(), []);
  const playRoleReveal = useCallback(() => soundSynthesizer.playRoleReveal(), []);
  const playVoteBuzzer = useCallback(() => soundSynthesizer.playVoteBuzzer(), []);
  const playElimination = useCallback(() => soundSynthesizer.playElimination(), []);
  const playVictory = useCallback(() => soundSynthesizer.playVictory(), []);
  const playDefeat = useCallback(() => soundSynthesizer.playDefeat(), []);
  const playButtonTap = useCallback(() => soundSynthesizer.playButtonTap(), []);

  const value = useMemo<AudioContextType>(
    () => ({
      isMuted,
      toggleMute,
      setMuted,
      playTick,
      playUrgentTick,
      playRoleReveal,
      playVoteBuzzer,
      playElimination,
      playVictory,
      playDefeat,
      playButtonTap,
    }),
    [
      isMuted,
      toggleMute,
      setMuted,
      playTick,
      playUrgentTick,
      playRoleReveal,
      playVoteBuzzer,
      playElimination,
      playVictory,
      playDefeat,
      playButtonTap,
    ]
  );

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};

export const useAudioContext = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
};
