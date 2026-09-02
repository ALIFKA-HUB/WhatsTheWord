/**
 * SoundSynthesizer
 * Pure Web Audio API procedural sound engine with zero external asset dependencies.
 * Handles lazy context initialization, browser autoplay unlocking, and audio effects.
 */

export class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private masterVolume: number = 0.7;

  constructor(initialMuted: boolean = false) {
    this.muted = initialMuted;
  }

  /**
   * Lazily initialize or resume AudioContext upon user gesture.
   */
  public ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {
        // Autoplay policy may reject until next user gesture
      });
    }

    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMasterVolume(vol: number): void {
    this.masterVolume = Math.max(0, Math.min(1, vol));
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }

  /**
   * 1. Clean, soft countdown clock tick (gentle 880Hz ping, duration ~0.04s)
   */
  public playTick(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      const duration = 0.04;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.12 * this.masterVolume, t + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      gain.gain.setValueAtTime(0, t + duration + 0.001);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + duration + 0.01);
    } catch {
      // Audio playback fails gracefully if context is blocked
    }
  }

  /**
   * 2. Urgent high-tension countdown pulse (1200Hz tone, fast decay ~0.06s)
   */
  public playUrgentTick(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      const duration = 0.06;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.exponentialRampToValueAtTime(850, t + duration);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.22 * this.masterVolume, t + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      gain.gain.setValueAtTime(0, t + duration + 0.001);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + duration + 0.01);
    } catch {
      // Audio playback fails gracefully
    }
  }

  /**
   * 3. Suspenseful futuristic synth chord (rich oscillators + filter sweep)
   */
  public playRoleReveal(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      const duration = 1.1;

      // Chord frequencies: D3, A3, D4, F#4, A4
      const freqs = [146.83, 220.0, 293.66, 369.99, 440.0];

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, t);
      masterGain.gain.linearRampToValueAtTime(0.25 * this.masterVolume, t + 0.08);
      masterGain.gain.setValueAtTime(0.25 * this.masterVolume, t + 0.5);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      masterGain.gain.setValueAtTime(0, t + duration + 0.01);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.setValueAtTime(3.5, t);
      filter.frequency.setValueAtTime(250, t);
      filter.frequency.exponentialRampToValueAtTime(3200, t + 0.45);
      filter.frequency.exponentialRampToValueAtTime(800, t + duration);

      masterGain.connect(filter);
      filter.connect(ctx.destination);

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        // Subtle detune for shimmer
        osc.detune.setValueAtTime((idx - 2) * 6, t);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.2, t);

        osc.connect(oscGain);
        oscGain.connect(masterGain);

        osc.start(t);
        osc.stop(t + duration + 0.02);
      });
    } catch {
      // Audio playback fails gracefully
    }
  }

  /**
   * 4. Tactile vote lock-in confirmation tone
   */
  public playVoteBuzzer(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;

      // Two quick affirmative harmonic pings
      const notes = [
        { freq: 523.25, start: 0, dur: 0.07, vol: 0.18 }, // C5
        { freq: 783.99, start: 0.06, dur: 0.12, vol: 0.22 }, // G5
      ];

      notes.forEach(({ freq, start, dur, vol }) => {
        const noteStart = t + start;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(vol * this.masterVolume, noteStart + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + dur);
        gain.gain.setValueAtTime(0, noteStart + dur + 0.001);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + dur + 0.01);
      });
    } catch {
      // Audio playback fails gracefully
    }
  }

  /**
   * 5. Dramatic low pitch elimination transition
   */
  public playElimination(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      const duration = 0.85;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, t);
      masterGain.gain.linearRampToValueAtTime(0.3 * this.masterVolume, t + 0.04);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      masterGain.gain.setValueAtTime(0, t + duration + 0.01);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.setValueAtTime(4.0, t);
      filter.frequency.setValueAtTime(900, t);
      filter.frequency.exponentialRampToValueAtTime(80, t + duration);

      masterGain.connect(filter);
      filter.connect(ctx.destination);

      // Low saw oscillator + sub sine
      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(160, t);
      osc1.frequency.exponentialRampToValueAtTime(45, t + duration);

      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(80, t);
      osc2.frequency.exponentialRampToValueAtTime(35, t + duration);

      osc1.connect(masterGain);
      osc2.connect(masterGain);

      osc1.start(t);
      osc2.start(t);

      osc1.stop(t + duration + 0.02);
      osc2.stop(t + duration + 0.02);
    } catch {
      // Audio playback fails gracefully
    }
  }

  /**
   * 6. Uplifting victory arpeggio
   */
  public playVictory(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;

      // Ascending major arpeggio: C5, E5, G5, C6, E6
      const notes = [
        { freq: 523.25, start: 0.0, dur: 0.12, vol: 0.18 },
        { freq: 659.25, start: 0.09, dur: 0.12, vol: 0.18 },
        { freq: 783.99, start: 0.18, dur: 0.14, vol: 0.2 },
        { freq: 1046.5, start: 0.28, dur: 0.2, vol: 0.24 },
        { freq: 1318.51, start: 0.42, dur: 0.45, vol: 0.25 },
      ];

      notes.forEach(({ freq, start, dur, vol }) => {
        const noteStart = t + start;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(vol * this.masterVolume, noteStart + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + dur);
        gain.gain.setValueAtTime(0, noteStart + dur + 0.001);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + dur + 0.02);
      });
    } catch {
      // Audio playback fails gracefully
    }
  }

  /**
   * 7. Somber defeat chord / descending progression
   */
  public playDefeat(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      const duration = 0.95;

      // Minor sombre chord: C4, Eb4, G4 + lower C3
      const freqs = [130.81, 261.63, 311.13, 392.0];

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, t);
      masterGain.gain.linearRampToValueAtTime(0.24 * this.masterVolume, t + 0.05);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      masterGain.gain.setValueAtTime(0, t + duration + 0.01);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, t);
      filter.frequency.linearRampToValueAtTime(250, t + duration);

      masterGain.connect(filter);
      filter.connect(ctx.destination);

      freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.linearRampToValueAtTime(freq * 0.96, t + duration); // subtle pitch droop

        osc.connect(masterGain);
        osc.start(t);
        osc.stop(t + duration + 0.02);
      });
    } catch {
      // Audio playback fails gracefully
    }
  }

  /**
   * 8. Subtle tactile UI button tap sound
   */
  public playButtonTap(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      const duration = 0.025;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, t);
      osc.frequency.exponentialRampToValueAtTime(400, t + duration);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.1 * this.masterVolume, t + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      gain.gain.setValueAtTime(0, t + duration + 0.001);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + duration + 0.01);
    } catch {
      // Audio playback fails gracefully
    }
  }
}

// Global default singleton instance
export const soundSynthesizer = new SoundSynthesizer();
