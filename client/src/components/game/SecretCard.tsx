import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeClosed, HandTap, Warning } from '@phosphor-icons/react';
import { PlayerRole } from '../../types/game.types';
import { useGameSound } from '../../hooks/useGameSound';
import { cn } from '../../utils/cn';

export interface SecretCardProps {
  role?: PlayerRole;
  word?: string;
  category?: string;
  onRevealed?: () => void;
  className?: string;
}

/**
 * Physical envelope/sleeve secret card.
 * Supports BOTH press-and-hold AND click/tap to reveal so the secret word
 * is clearly visible and unobstructed on both mobile and desktop.
 */
export const SecretCard: React.FC<SecretCardProps> = ({
  role = 'CIVILIAN',
  word,
  category,
  onRevealed,
  className,
}) => {
  const [isHolding, setIsHolding] = useState(false);
  const [isPinnedOpen, setIsPinnedOpen] = useState(false);
  const [hasTriggeredAudio, setHasTriggeredAudio] = useState(false);
  const { playRoleReveal } = useGameSound();
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pressStartRef = useRef<number>(0);
  const lastTouchTimeRef = useRef<number>(0);

  // Reset when player changes
  useEffect(() => {
    setIsHolding(false);
    setIsPinnedOpen(false);
    setHasTriggeredAudio(false);
  }, [word, role]);

  const triggerReveal = useCallback(() => {
    if (!hasTriggeredAudio) {
      try {
        playRoleReveal();
      } catch {
        // ignore audio failure
      }
      setHasTriggeredAudio(true);
    }
    onRevealed?.();
  }, [hasTriggeredAudio, onRevealed, playRoleReveal]);

  const startHold = useCallback(() => {
    pressStartRef.current = Date.now();
    setIsHolding(true);
    triggerReveal();
  }, [triggerReveal]);

  const endHold = useCallback(() => {
    const elapsed = Date.now() - pressStartRef.current;
    // If user did a quick tap/click (< 350ms), toggle pinned-open state so the word stays readable!
    if (elapsed >= 0 && elapsed < 350) {
      const next = !isPinnedOpen;
      setIsPinnedOpen(next);
      setIsHolding(next);
    } else if (!isPinnedOpen) {
      setIsHolding(false);
    }
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
  }, [isPinnedOpen]);

  useEffect(() => {
    return () => {
      if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current);
      }
    };
  }, []);

  const isMrWhite = role === 'MR_WHITE';

  return (
    <div className={cn('w-full max-w-sm mx-auto select-none font-sans', className)}>
      {/* Kraft sleeve */}
      <div
        onMouseDown={() => {
          if (Date.now() - lastTouchTimeRef.current < 500) return;
          startHold();
        }}
        onMouseUp={() => {
          if (Date.now() - lastTouchTimeRef.current < 500) return;
          endHold();
        }}
        onMouseLeave={() => {
          if (Date.now() - lastTouchTimeRef.current < 500) return;
          if (!isPinnedOpen) setIsHolding(false);
        }}
        onTouchStart={() => {
          lastTouchTimeRef.current = Date.now();
          startHold();
        }}
        onTouchEnd={() => {
          lastTouchTimeRef.current = Date.now();
          endHold();
        }}
        onTouchCancel={() => {
          lastTouchTimeRef.current = Date.now();
          if (!isPinnedOpen) setIsHolding(false);
        }}
        onContextMenu={(e) => e.preventDefault()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            const next = !isHolding;
            setIsHolding(next);
            setIsPinnedOpen(next);
            if (next) triggerReveal();
          }
        }}
        aria-pressed={isHolding}
        aria-label="Tahan atau ketuk untuk mengintip kata rahasia"
        className="relative overflow-hidden rounded-3xl border border-rule bg-paper-muted shadow-print-lg cursor-pointer h-[340px]"
      >
        {/* thumb notch cut-out */}
        <span
          className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 rounded-b-full bg-paper border-x border-b border-rule z-20 flex items-center justify-center"
          aria-hidden="true"
        >
          <span className="w-6 h-1 rounded-full bg-rule" />
        </span>

        {/* Inner secret card: slides up when holding, and secret word sits clearly in upper visible region */}
        <motion.div
          initial={false}
          animate={{ y: isHolding ? 0 : 72 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="absolute inset-x-3 top-4 z-10 bg-cardstock border border-rule rounded-2xl p-5 min-h-[260px] flex flex-col justify-between shadow-print"
        >
          {/* inner card header tab: strictly neutral (zero Warga / Impostor / Mr. White role clues) */}
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-rule">
            <span className="text-xs font-bold text-ink-muted">
              Kartu Kata Rahasia
            </span>
            {category && (
              <span className="px-2.5 py-0.5 rounded-full bg-paper-muted border border-rule text-xs font-semibold text-ink">
                {category}
              </span>
            )}
          </div>

          {/* Secret content with opacity transition so zero leak when closed */}
          <div className={cn('transition-opacity duration-200 my-auto py-3', isHolding ? 'opacity-100' : 'opacity-0')}>
            {isMrWhite ? (
              <div className="rounded-2xl border border-dashed border-sun-dark bg-sun-light/50 p-4 text-center space-y-2">
                <span className="rubber-stamp text-xs">
                  {isHolding ? 'Mr. White (Tanpa Kata)' : '••••••••'}
                </span>
                <p className="text-xs sm:text-sm text-ink font-medium max-w-[240px] mx-auto leading-relaxed">
                  {isHolding
                    ? 'Kamu tidak mendapat kata. Dengarkan petunjuk pemain lain dan tebak kata Warga jika terdesak!'
                    : '••••••••'}
                </p>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <p className="text-xs font-bold text-teal-dark">
                  Kata rahasia kamu:
                </p>
                <div className="py-3 px-3 rounded-2xl bg-teal-light/35 border border-teal">
                  <p className="font-condensed text-3xl sm:text-4xl text-ink tracking-tight break-words">
                    {isHolding ? (word || 'Kata Rahasia') : '••••••••'}
                  </p>
                </div>
                <p className="text-xs text-ink-muted max-w-[250px] leading-relaxed mx-auto">
                  Hafalkan kata ini, lalu ketuk kartu lagi untuk menutup amplop.
                </p>
              </div>
            )}
          </div>

          <div className="text-center text-[11px] font-semibold text-ink-muted pt-1 border-t border-rule">
            {isHolding ? 'Ketuk kartu untuk menutup kembali' : 'Tahan atau ketuk untuk membuka'}
          </div>
        </motion.div>

        {/* Pocket flap (front of the envelope) - slides down out of the way when open! */}
        <motion.div
          initial={false}
          animate={{ y: isHolding ? 175 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="absolute inset-x-0 bottom-0 h-[210px] z-20 card-back-hatch border-t-2 border-rule flex flex-col items-center justify-center gap-2.5 px-4 shadow-flap"
        >
          <div className="w-7 h-7 rounded-full bg-cardstock border border-rule flex items-center justify-center shadow-print-sm -mt-2">
            <HandTap className="w-4 h-4 text-teal-dark" weight="bold" />
          </div>
          <span className="rubber-stamp text-xs">
            {isHolding ? 'Amplop Terbuka' : 'Amplop Tertutup'}
          </span>
          <p className="text-xs font-semibold text-ink text-center max-w-[220px] leading-relaxed">
            {isHolding
              ? 'Ketuk amplop ini untuk menutup kata rahasia'
              : 'Ketuk atau tahan kartu untuk melihat kata rahasiamu'}
          </p>
        </motion.div>
      </div>

      {/* Hold / Toggle feedback */}
      <div className="w-full flex items-center justify-center gap-2 mt-3.5">
        {isHolding ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-dark">
            <Eye className="w-4 h-4" weight="bold" />
            Kata terlihat jelas. Ketuk kartu untuk menutup kembali.
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted">
            <EyeClosed className="w-4 h-4" weight="bold" />
            Kata tertutup dengan aman
          </span>
        )}
      </div>

      {/* Privacy notice */}
      <div className="w-full mt-2 pt-2.5 border-t border-rule flex items-center justify-center gap-1.5 text-xs text-ink-muted">
        <Warning className="w-3.5 h-3.5 shrink-0" weight="bold" />
        <span>Pastikan layar tidak terlihat oleh pemain di sebelahmu</span>
      </div>
    </div>
  );
};

export default SecretCard;
