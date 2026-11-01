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

  return (
    <div className={cn('w-full max-w-sm mx-auto select-none font-sans', className)}>
      {/* Kraft sleeve */}
      <div
        onMouseDown={startHold}
        onMouseUp={endHold}
        onMouseLeave={endHold}
        onTouchStart={startHold}
        onTouchEnd={endHold}
        onTouchCancel={endHold}
        onContextMenu={(e) => e.preventDefault()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (e.type === 'keydown') startHold();
          }
        }}
        onKeyUp={endHold}
        aria-label="Tahan untuk mengintip kata rahasia"
        className="relative overflow-hidden rounded-2xl border-2 border-rule bg-paper-muted shadow-print-lg cursor-pointer h-[340px]"
      >
        {/* thumb notch cut-out */}
        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-6 rounded-b-full bg-paper border-x-2 border-b-2 border-rule z-20 flex items-center justify-center" aria-hidden="true">
          <span className="w-6 h-1 rounded-full bg-rule" />
        </span>

        {/* Inner secret card: tucked inside the pocket, slides up when holding */}
        <motion.div
          initial={false}
          animate={{ y: isHolding ? -6 : 148 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          className="absolute inset-x-3 top-3 z-0 bg-cardstock border-2 border-rule rounded-xl p-4 min-h-[320px] flex flex-col"
        >
          {/* inner card header tab */}
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-rule">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-ink-muted">
              Dokumen Agen
            </span>
            {category && (
              <span className="px-2 py-0.5 rounded-lg bg-paper border border-rule font-mono text-[11px] font-bold uppercase tracking-wider text-ink">
                {category}
              </span>
            )}
          </div>

          {/* Secret content with opacity transition so zero leak when closed */}
          <div className={cn("transition-opacity duration-200 my-auto", isHolding ? "opacity-100" : "opacity-0")}>
            {isMrWhite ? (
              <div className="rounded-xl border border-dashed border-rule bg-paper p-4 text-center space-y-2 min-h-[140px] flex flex-col items-center justify-center">
                <span className="rubber-stamp text-xs -rotate-2">Mr. White · Tanpa Kata</span>
                <p className="text-xs text-ink-muted max-w-[240px] leading-relaxed">
                  Kamu tidak mendapat kata. Dengarkan petunjuk pemain lain dan menebaklah saat terdesak!
                </p>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-ink-muted mb-1.5">
                  Kata Rahasia Kamu
                </p>
                <p className="font-condensed text-4xl sm:text-5xl text-ink tracking-tight py-2 border-y-2 border-rule">
                  {word || 'Kata Rahasia'}
                </p>
                <p className="text-[11px] text-ink-muted max-w-[250px] leading-relaxed mx-auto mt-2">
                  Rahasiakan kata ini. Jangan sampai terlihat pemain lain.
                </p>
              </div>
            )}
          </div>

          {/* Decorative bottom lines */}
          <div className="mt-auto space-y-1.5 opacity-30 pt-2" aria-hidden="true">
            <div className="h-1.5 w-3/4 mx-auto bg-ink/20 rounded-full" />
            <div className="h-1.5 w-1/2 mx-auto bg-ink/20 rounded-full" />
          </div>
        </motion.div>

        {/* Pocket flap (front of the envelope) - covers bottom 210px */}
        <div className="absolute inset-x-0 bottom-0 h-[210px] z-10 card-back-hatch border-t-2 border-rule flex flex-col items-center justify-center gap-2 px-4 shadow-[0_-4px_12px_rgba(36,51,72,0.06)]">
          <span className="rubber-stamp-red -rotate-2 text-xs">Dokumen Rahasia</span>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-ink-muted text-center max-w-[200px]">
            Tahan kartu untuk geser &amp; intip
          </p>
        </div>
      </div>

      {/* Hold feedback */}
      <div className="w-full flex items-center justify-center gap-2 mt-4">
        {isHolding ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-stamp-dark font-mono uppercase tracking-wide">
            <Eye className="w-3.5 h-3.5" weight="bold" />
            Melepas menutup kata
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted font-mono uppercase tracking-wide">
            <EyeClosed className="w-3.5 h-3.5" weight="bold" />
            Kata tersembunyi dengan aman
          </span>
        )}
      </div>

      {/* Privacy notice */}
      <div className="w-full mt-2 pt-3 border-t-2 border-rule flex items-center justify-center gap-1.5 text-[11px] text-ink-muted">
        <Warning className="w-3.5 h-3.5 shrink-0" weight="bold" />
        <span>Pastikan layar tidak diintip pemain di sebelahmu</span>
      </div>

    </div>
  );
};

export default SecretCard;
