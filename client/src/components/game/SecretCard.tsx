import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeClosed, Warning } from '@phosphor-icons/react';
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
 * Press & hold slides the inner cardstock card out of the kraft pocket;
 * releasing slides it back inside immediately.
 */
export const SecretCard: React.FC<SecretCardProps> = ({
  role = 'CIVILIAN',
  word,
  category,
  onRevealed,
  className,
}) => {
  const [isHolding, setIsHolding] = useState(false);
  const [hasTriggeredAudio, setHasTriggeredAudio] = useState(false);
  const { playRoleReveal } = useGameSound();
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startHold = useCallback(() => {
    setIsHolding(true);
    if (!hasTriggeredAudio) {
      try {
        playRoleReveal();
      } catch {
        // ignore audio failure
      }
      setHasTriggeredAudio(true);
      onRevealed?.();
    }
  }, [hasTriggeredAudio, onRevealed, playRoleReveal]);

  const endHold = useCallback(() => {
    setIsHolding(false);
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current);
      }
    };
  }, []);

  const isMrWhite = role === 'MR_WHITE';

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    startHold();
  }, [startHold]);

  return (
    <div className={cn('w-full max-w-sm mx-auto select-none font-sans', className)}>
      {/* Kraft sleeve */}
      <div
        onPointerDown={handlePointerDown}
        onPointerUp={endHold}
        onPointerCancel={endHold}
        onPointerLeave={endHold}
        onContextMenu={(e) => e.preventDefault()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            startHold();
          }
        }}
        onKeyUp={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            endHold();
          }
        }}
        aria-label="Tahan untuk mengintip kata rahasia"
        className="relative overflow-hidden rounded-3xl border border-rule bg-paper-muted shadow-print-lg cursor-pointer h-[400px] touch-none"
      >
        {/* thumb notch cut-out */}
        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-6 rounded-b-full bg-paper border-x border-b border-rule z-20 flex items-center justify-center" aria-hidden="true">
          <span className="w-6 h-1 rounded-full bg-rule" />
        </span>

        {/* Inner secret card: tucked inside the pocket (y: 188), slides up into the 190px open window (y: -4) */}
        <motion.div
          initial={false}
          animate={{ y: isHolding ? -4 : 188 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          className="absolute inset-x-3 top-3 z-0 bg-cardstock border border-rule rounded-2xl p-4 min-h-[360px] flex flex-col justify-start shadow-print-sm"
        >
          {/* inner card header tab */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-rule">
            <span className="text-xs font-semibold text-ink-muted">
              Kartu Kata Rahasia
            </span>
            {category && (
              <span className="px-2.5 py-0.5 rounded-full bg-paper-muted border border-rule text-xs font-semibold text-ink truncate max-w-[160px]">
                {category}
              </span>
            )}
          </div>

          {/* Secret content placed in the upper 180px window so the 210px flap never overlaps it */}
          <div className={cn('transition-opacity duration-200 pt-2', isHolding ? 'opacity-100' : 'opacity-0')}>
            {isMrWhite ? (
              <div className="rounded-2xl border border-dashed border-rule bg-paper p-3 text-center space-y-1.5 flex flex-col items-center justify-center">
                <span className="rubber-stamp text-xs">Mr. White (Tanpa Kata)</span>
                <p className="text-xs text-ink-muted max-w-[240px] leading-snug">
                  Kamu tidak mendapat kata. Dengarkan petunjuk pemain lain dan menebaklah saat terdesak!
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xs font-semibold text-ink-muted mb-1">
                  Kata rahasia kamu
                </p>
                <p className="font-condensed text-3xl sm:text-4xl text-ink tracking-tight py-2 border-y border-rule break-words">
                  {isHolding ? (word || 'Kata Rahasia') : '••••••••'}
                </p>
                <p className="text-xs text-ink-muted max-w-[250px] leading-snug mx-auto mt-1.5">
                  Ingat kata ini baik-baik dan jangan sampai terlihat pemain lain.
                </p>
              </div>
            )}
          </div>

          {/* Decorative bottom lines */}
          <div className="mt-auto space-y-1.5 opacity-25 pt-2" aria-hidden="true">
            <div className="h-1.5 w-3/4 mx-auto bg-ink rounded-full" />
            <div className="h-1.5 w-1/2 mx-auto bg-ink rounded-full" />
          </div>
        </motion.div>

        {/* Pocket flap (front of the envelope) - covers bottom 210px */}
        <div className="absolute inset-x-0 bottom-0 h-[210px] z-10 card-back-hatch border-t border-rule flex flex-col items-center justify-center gap-2 px-4 shadow-flap">
          <span className="rubber-stamp text-xs">Amplop Tertutup</span>
          <p className="text-xs font-semibold text-ink-muted text-center max-w-[210px]">
            Sentuh dan tahan kartu untuk mengintip kata rahasiamu
          </p>
        </div>
      </div>

      {/* Hold feedback */}
      <div className="w-full flex items-center justify-center gap-2 mt-4">
        {isHolding ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-dark">
            <Eye className="w-4 h-4" weight="bold" />
            Lepaskan sentuhan untuk menutup kembali
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted">
            <EyeClosed className="w-4 h-4" weight="bold" />
            Kata tertutup dengan aman
          </span>
        )}
      </div>

      {/* Privacy notice */}
      <div className="w-full mt-2 pt-3 border-t border-rule flex items-center justify-center gap-1.5 text-xs text-ink-muted">
        <Warning className="w-3.5 h-3.5 shrink-0" weight="bold" />
        <span>Pastikan layar tidak terlihat oleh pemain di sebelahmu</span>
      </div>
    </div>
  );
};

export default SecretCard;
