# Task 3 Brief: Web Audio API Synthesizer & Audio Hook

## Goal
Implement a complete, zero-external-asset audio engine using standard Web Audio API in `client/`:

1. `client/src/utils/soundSynthesizer.ts`:
   - Class `SoundSynthesizer` with lazy AudioContext initialization (handling browser autoplay policies on first user interaction).
   - Methods:
     - `playTick()`: Clean, soft countdown clock tick (gentle 880Hz ping, duration ~0.04s)
     - `playUrgentTick()`: Urgent high-tension countdown pulse (1200Hz tone, fast decay ~0.06s)
     - `playRoleReveal()`: Suspenseful futuristic synth chord (rich oscillators + filter sweep)
     - `playVoteBuzzer()`: Tactile vote lock-in confirmation tone
     - `playElimination()`: Dramatic low pitch transition
     - `playVictory()`: Uplifting victory arpeggio
     - `playDefeat()`: Somber defeat chord
     - `playButtonTap()`: Subtle tactile UI tap/click sound
     - Volume control and mute state handling

2. `client/src/context/AudioContext.tsx`:
   - React Context `AudioContext` and `AudioProvider`
   - Global `isMuted` state stored and loaded from `localStorage` (`key: 'whatstheword_muted'`)
   - Exposes: `playTick`, `playUrgentTick`, `playRoleReveal`, `playVoteBuzzer`, `playElimination`, `playVictory`, `playDefeat`, `playButtonTap`, `isMuted`, `toggleMute`

3. `client/src/hooks/useGameSound.ts`:
   - Clean custom hook to consume AudioContext easily in any component.

4. Client typecheck & build verification:
   - Ensure clean compilation with `npm run typecheck` and `npm run build` in client.

## Report Contract
Write report to: `C:\Users\ASUS\Documents\ALIFKA\PROJECT\whatstheword\.superpowers\sdd\2026-09-02-whatstheword-implementation\task-3-report.md`
Return: status (DONE / BLOCKED), commits, one-line test summary.
