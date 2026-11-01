import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Microphone, Timer, Warning } from '@phosphor-icons/react';
import { useGameSound } from '../../hooks/useGameSound';
import { cn } from '../../utils/cn';

export type TimerVariant = 'circular' | 'linear' | 'compact';

export interface CountdownTimerProps {
  totalSeconds: number;
  remainingSeconds: number;
  variant?: TimerVariant;
  size?: number;
  strokeWidth?: number;
  soundEnabled?: boolean;
  speakerName?: string;
  label?: string;
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  totalSeconds,
  remainingSeconds,
  variant = 'circular',
  size = 120,
  strokeWidth = 8,
  soundEnabled = true,
  speakerName,
  label,
  className,
}) => {
  const { playTick, playUrgentTick, isMuted } = useGameSound();
  const lastTickedSecondRef = useRef<number | null>(null);

  const safeTotal = Math.max(1, totalSeconds);
  const clampedRemaining = Math.max(0, Math.min(remainingSeconds, safeTotal));
  const progressRatio = clampedRemaining / safeTotal;

  // Color logic based on remaining seconds
  const isUrgent = clampedRemaining <= 5 && clampedRemaining > 0;
  const isWarning = clampedRemaining > 5 && clampedRemaining < 15;
  const isSafe = clampedRemaining >= 15;

  const colorConfig = isUrgent
    ? {
        color: '#f43f5e',
        textClass: 'text-stamp-dark',
        strokeClass: 'stroke-stamp',
        bgClass: 'bg-stamp/10 border-stamp/30',
        glowClass: 'shadow-[0_0_20px_-3px_rgba(244,63,94,0.5)]',
      }
    : isWarning
    ? {
        color: '#f59e0b',
        textClass: 'text-stamp-dark',
        strokeClass: 'stroke-ink',
        bgClass: 'bg-amber-500/10 border-amber-500/30',
        glowClass: 'shadow-[0_0_20px_-3px_rgba(245,158,11,0.4)]',
      }
    : {
        color: '#06b6d4',
        textClass: 'text-stamp-dark',
        strokeClass: 'stroke-cyan-400',
        bgClass: 'bg-paper-muted border-ink',
        glowClass: 'shadow-[0_0_20px_-3px_rgba(6,182,212,0.4)]',
      };

  // Synchronized Audio Ticks
  useEffect(() => {
    if (!soundEnabled || isMuted) return;

    // Trigger tick when seconds value changes
    if (
      lastTickedSecondRef.current !== clampedRemaining &&
      clampedRemaining >= 0 &&
      clampedRemaining <= totalSeconds
    ) {
      lastTickedSecondRef.current = clampedRemaining;

      if (clampedRemaining <= 5 && clampedRemaining > 0) {
        try {
          playUrgentTick();
        } catch {
          // ignore sound error
        }
      } else if (clampedRemaining > 5) {
        try {
          playTick();
        } catch {
          // ignore sound error
        }
      }
    }
  }, [clampedRemaining, totalSeconds, soundEnabled, isMuted, playTick, playUrgentTick]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Circular SVG Math
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  if (variant === 'linear') {
    return (
      <div className={cn('w-full space-y-2', className)}>
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-ink-muted flex items-center gap-1.5">
            {speakerName ? (
              <>
                <Microphone className="w-3.5 h-3.5 text-stamp-dark animate-pulse" />
                <span className="text-ink font-semibold">{speakerName}</span>
              </>
            ) : (
              label || 'Waktu Tersisa'
            )}
          </span>
          <span className={cn('font-bold text-sm tracking-wider', colorConfig.textClass)}>
            {formatTime(clampedRemaining)}
          </span>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-paper border border-rule overflow-hidden p-0.5">
          <motion.div
            initial={false}
            animate={{ width: `${progressRatio * 100}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={cn('h-full rounded-full transition-colors duration-300', {
              'bg-gradient-to-r from-rose-600 to-rose-400': isUrgent,
              'bg-gradient-to-r from-amber-600 to-amber-400': isWarning,
              'bg-gradient-to-r from-cyan-600 to-cyan-400': isSafe,
            })}
          />
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border  transition-all',
          colorConfig.bgClass,
          isUrgent && 'animate-pulse',
          className
        )}
      >
        {isUrgent ? (
          <Warning className="w-4 h-4 text-stamp-dark animate-bounce" />
        ) : (
          <Timer className={cn('w-4 h-4', colorConfig.textClass)} />
        )}
        <span className={cn('text-sm font-mono font-bold tracking-wide', colorConfig.textClass)}>
          {clampedRemaining}s
        </span>
      </div>
    );
  }

  // Circular Default Variant
  return (
    <div className={cn('flex flex-col items-center justify-center select-none', className)}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-ink/20"
          />

          {/* Progress Indicator Circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colorConfig.color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={false}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.3, ease: 'linear' }}
            strokeLinecap="round"
            fill="transparent"
            className="transition-colors duration-300"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span
            key={clampedRemaining}
            initial={{ scale: isUrgent ? 1.2 : 1 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 400 }}
            className={cn(
              'text-2xl sm:text-3xl font-black font-mono tracking-tight leading-none',
              colorConfig.textClass
            )}
          >
            {clampedRemaining}
          </motion.span>
          <span className="text-[11px] font-mono uppercase tracking-widest text-ink-muted mt-0.5">
            detik
          </span>
        </div>
      </div>

      {/* Speaker or Custom Label Below */}
      {(speakerName || label) && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-ink font-sans">
          {speakerName ? (
            <>
              <Microphone className="w-3.5 h-3.5 text-stamp-dark animate-pulse" />
              <span>
                Giliran: <strong className="text-stamp-dark">{speakerName}</strong>
              </span>
            </>
          ) : (
            <span>{label}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default CountdownTimer;
