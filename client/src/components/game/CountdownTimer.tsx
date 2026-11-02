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

  const isUrgent = clampedRemaining <= 5 && clampedRemaining > 0;
  const isWarning = clampedRemaining > 5 && clampedRemaining < 15;
  const isSafe = clampedRemaining >= 15;

  const colorConfig = isUrgent
    ? {
        strokeColor: 'var(--color-accent-3)',
        textClass: 'text-stamp-dark',
        bgClass: 'bg-stamp-light border-stamp/40',
      }
    : isWarning
    ? {
        strokeColor: 'var(--color-accent-deep)',
        textClass: 'text-sun-dark',
        bgClass: 'bg-sun-light border-sun/50',
      }
    : {
        strokeColor: 'var(--color-mint-deep)',
        textClass: 'text-teal-dark',
        bgClass: 'bg-teal-light border-teal/40',
      };

  useEffect(() => {
    if (!soundEnabled || isMuted) return;

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

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  if (variant === 'linear') {
    return (
      <div className={cn('w-full space-y-2', className)}>
        <div className="flex items-center justify-between text-xs">
          <span className="text-ink-muted flex items-center gap-1.5">
            {speakerName ? (
              <>
                <Microphone className="w-3.5 h-3.5 text-teal-dark" />
                <span className="text-ink font-semibold">{speakerName}</span>
              </>
            ) : (
              label || 'Waktu tersisa'
            )}
          </span>
          <span className={cn('font-mono font-bold text-sm', colorConfig.textClass)}>
            {formatTime(clampedRemaining)}
          </span>
        </div>

        {/* Linear Progress Bar (uses transform scaleX to respect Floor rule against animating width) */}
        <div className="w-full h-2.5 rounded-full bg-paper-muted border border-rule overflow-hidden p-0.5">
          <div
            style={{ transform: `scaleX(${progressRatio})` }}
            className={cn(
              'h-full w-full origin-left rounded-full transition-transform duration-300 ease-out',
              isUrgent && 'bg-stamp',
              isWarning && 'bg-sun',
              isSafe && 'bg-teal'
            )}
          />
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors',
          colorConfig.bgClass,
          className
        )}
      >
        {isUrgent ? (
          <Warning className="w-4 h-4 text-stamp-dark" weight="bold" />
        ) : (
          <Timer className={cn('w-4 h-4', colorConfig.textClass)} weight="bold" />
        )}
        <span className={cn('text-xs font-mono font-bold', colorConfig.textClass)}>
          {clampedRemaining} dtk
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
        <svg width={size} height={size} className="transform -rotate-90" aria-hidden="true">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-rule"
          />

          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colorConfig.strokeColor}
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

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span
            className={cn(
              'text-2xl sm:text-3xl font-black font-mono leading-none',
              colorConfig.textClass
            )}
          >
            {clampedRemaining}
          </span>
          <span className="text-xs text-ink-muted font-medium mt-0.5">
            detik
          </span>
        </div>
      </div>

      {(speakerName || label) && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-ink font-sans">
          {speakerName ? (
            <>
              <Microphone className="w-3.5 h-3.5 text-teal-dark" weight="bold" />
              <span>
                Giliran: <strong className="text-ink">{speakerName}</strong>
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
