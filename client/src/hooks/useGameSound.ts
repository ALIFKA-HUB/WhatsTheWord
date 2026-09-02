import { useContext } from 'react';
import { AudioContext, AudioContextType } from '../context/AudioContext';
import { soundSynthesizer } from '../utils/soundSynthesizer';

/**
 * Custom hook to easily trigger synthesized sound effects and manage mute state.
 * Works seamlessly within AudioProvider, and provides a safe fallback to the singleton synthesizer.
 */
export const useGameSound = (): AudioContextType => {
  const context = useContext(AudioContext);

  if (context) {
    return context;
  }

  // Fallback if invoked outside of AudioProvider tree
  return {
    isMuted: soundSynthesizer.isMuted(),
    toggleMute: () => soundSynthesizer.setMuted(!soundSynthesizer.isMuted()),
    setMuted: (muted: boolean) => soundSynthesizer.setMuted(muted),
    playTick: () => soundSynthesizer.playTick(),
    playUrgentTick: () => soundSynthesizer.playUrgentTick(),
    playRoleReveal: () => soundSynthesizer.playRoleReveal(),
    playVoteBuzzer: () => soundSynthesizer.playVoteBuzzer(),
    playElimination: () => soundSynthesizer.playElimination(),
    playVictory: () => soundSynthesizer.playVictory(),
    playDefeat: () => soundSynthesizer.playDefeat(),
    playButtonTap: () => soundSynthesizer.playButtonTap(),
  };
};

export default useGameSound;
