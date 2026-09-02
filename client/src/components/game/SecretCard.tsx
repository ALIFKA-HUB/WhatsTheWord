import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, ShieldAlert, Lock, KeyRound } from 'lucide-react';
import { PlayerRole } from '../../types/game.types';
import { RoleBadge } from '../common/Badge';
import { useGameSound } from '../../hooks/useGameSound';
import { cn } from '../../utils/cn';

export interface SecretCardProps {
  role?: PlayerRole;
  word?: string;
  category?: string;
  onRevealed?: () => void;
  className?: string;
}

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
      {/* Interactive Press & Hold Container */}
      <div
        onMouseDown={startHold}
        onMouseUp={endHold}
        onMouseLeave={endHold}
        onTouchStart={startHold}
        onTouchEnd={endHold}
        onTouchCancel={endHold}
        onContextMenu={(e) => e.preventDefault()}
        className={cn(
          'relative overflow-hidden rounded-2xl p-6 sm:p-7 cursor-pointer transition-all duration-200',
          'bg-zinc-900/60 border backdrop-blur-md shadow-sm',
          isHolding
            ? isMrWhite
              ? 'border-purple-600 bg-zinc-900/90 scale-[1.01]'
              : 'border-zinc-400 bg-zinc-900/90 scale-[1.01]'
            : 'border-zinc-800 hover:border-zinc-700 active:scale-[0.99]'
        )}
      >
        {/* Content Box */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          {/* Top Status Header */}
          <div className="flex items-center justify-between w-full text-xs font-mono">
            <span className="text-zinc-500 uppercase flex items-center gap-1.5 font-medium">
              <Lock className="w-3 h-3 text-zinc-400" />
              KARTU RAHASIA
            </span>
            {category && (
              <span className="px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-400 text-[11px]">
                {category}
              </span>
            )}
          </div>

          {/* Secret Word & Role Mask Container */}
          <div className="relative w-full min-h-[140px] flex flex-col items-center justify-center p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 overflow-hidden">
            {/* Unmasked Content (Visible when holding) */}
            <motion.div
              initial={false}
              animate={{
                filter: isHolding ? 'blur(0px)' : 'blur(16px)',
                opacity: isHolding ? 1 : 0,
                scale: isHolding ? 1 : 0.95,
              }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="flex flex-col items-center justify-center space-y-2.5 pointer-events-none"
            >
              {isMrWhite ? (
                <>
                  <RoleBadge role="MR_WHITE" size="md" />
                  <div className="text-center space-y-1">
                    <p className="text-3xl font-mono font-bold text-purple-300 tracking-widest">
                      ???
                    </p>
                    <p className="text-xs text-zinc-400 max-w-[240px] leading-relaxed">
                      Kamu adalah <span className="font-semibold text-purple-300">Mr. White (Buta Kata)</span>. Kamu tidak punya kata. Simak petunjuk pemain lain dan tebak kata warga!
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-2 py-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400">
                    Kata Rahasia Kamu
                  </span>
                  <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
                    {word || 'Kata Rahasia'}
                  </p>
                  <p className="text-xs text-zinc-400 max-w-[240px] leading-relaxed">
                    Ingat kata ini dan berikan 1 petunjuk tanpa dicurigai pemain lain.
                  </p>
                </div>
              )}
            </motion.div>

            {/* Masked Prompt (Visible when NOT holding) */}
            <motion.div
              initial={false}
              animate={{
                opacity: isHolding ? 0 : 1,
                scale: isHolding ? 0.95 : 1,
              }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 flex flex-col items-center justify-center space-y-2 p-4 text-center pointer-events-none"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                <KeyRound className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-zinc-200">
                Tahan untuk Intip Kata
              </p>
              <p className="text-[11px] text-zinc-500">
                Tekan dan tahan layar untuk membaca
              </p>
            </motion.div>
          </div>

          {/* Hold Feedback Indicator */}
          <div className="w-full flex items-center justify-center gap-2">
            {isHolding ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-300">
                <Eye className="w-3.5 h-3.5" />
                Melepas layar akan langsung menutup kata
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
                <EyeOff className="w-3.5 h-3.5" />
                Kata tersembunyi dengan aman
              </span>
            )}
          </div>

          {/* Privacy Notice */}
          <div className="w-full pt-3 border-t border-zinc-800/80 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
            <ShieldAlert className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>Pastikan layar tidak diintip pemain di sebelahmu</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecretCard;
