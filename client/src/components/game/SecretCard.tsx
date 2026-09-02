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
    <div className={cn('w-full max-w-sm mx-auto select-none', className)}>
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
          'relative overflow-hidden rounded-3xl p-6 sm:p-8 cursor-pointer transition-all duration-300 transform',
          'bg-gradient-to-b from-slate-900/90 to-slate-950/95 border backdrop-blur-xl shadow-2xl',
          isHolding
            ? isMrWhite
              ? 'border-purple-500 shadow-[0_0_35px_-5px_rgba(168,85,247,0.5)] scale-[1.02]'
              : 'border-cyan-400 shadow-[0_0_35px_-5px_rgba(6,182,212,0.5)] scale-[1.02]'
            : 'border-white/10 hover:border-white/20 active:scale-[0.99]'
        )}
      >
        {/* Subtle Cyber Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/5 via-transparent to-transparent pointer-events-none" />

        {/* Content Box */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-5">
          {/* Top Status Header */}
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400 flex items-center gap-1">
              <Lock className="w-3 h-3 text-cyan-400" />
              CONFIDENTIAL DATA
            </span>
            {category && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                {category}
              </span>
            )}
          </div>

          {/* Secret Word & Role Mask Container */}
          <div className="relative w-full min-h-[140px] flex flex-col items-center justify-center p-4 rounded-2xl bg-black/40 border border-white/5 overflow-hidden">
            {/* Unmasked Content (Visible when holding) */}
            <motion.div
              initial={false}
              animate={{
                filter: isHolding ? 'blur(0px)' : 'blur(16px)',
                opacity: isHolding ? 1 : 0,
                scale: isHolding ? 1 : 0.9,
              }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="flex flex-col items-center justify-center space-y-3 pointer-events-none"
            >
              {isMrWhite ? (
                <>
                  <RoleBadge role="MR_WHITE" size="lg" />
                  <div className="text-center space-y-1">
                    <p className="text-3xl sm:text-4xl font-black font-mono text-purple-300 tracking-widest">
                      ???
                    </p>
                    <p className="text-xs text-purple-200/90 max-w-[240px] font-sans leading-relaxed">
                      Kamu adalah <span className="font-semibold text-purple-300">Mr. White (Buta Kata)</span>! Kamu tidak memiliki kata. Simak petunjuk pemain lain dan tebak kata warga!
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-2 py-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                    Kata Rahasia Kamu
                  </span>
                  <p className="text-3xl sm:text-4xl font-black font-display text-transparent bg-gradient-to-r from-cyan-200 via-white to-cyan-300 bg-clip-text tracking-wider uppercase">
                    {word || 'Kata Rahasia'}
                  </p>
                  <p className="text-xs text-slate-400 font-sans max-w-[240px]">
                    Ingat kata ini dan berikan 1 petunjuk tanpa dicurigai pemain lain!
                  </p>
                </div>
              )}
            </motion.div>

            {/* Masked Prompt (Visible when NOT holding) */}
            <motion.div
              initial={false}
              animate={{
                opacity: isHolding ? 0 : 1,
                scale: isHolding ? 0.9 : 1,
              }}
              transition={{ duration: 0.15 }}
              className={cn(
                'absolute inset-0 flex flex-col items-center justify-center space-y-2 p-4 text-center pointer-events-none'
              )}
            >
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
                <KeyRound className="w-6 h-6 animate-pulse" />
              </div>
              <p className="text-sm font-bold text-slate-200 font-display">
                Tahan untuk Intip Kata
              </p>
              <p className="text-[11px] text-slate-400">
                Tekan dan tahan layar untuk membaca
              </p>
            </motion.div>
          </div>

          {/* Hold Feedback Indicator */}
          <div className="w-full flex items-center justify-center gap-2">
            {isHolding ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 animate-pulse">
                <Eye className="w-3.5 h-3.5" />
                Melepas akan langsung menutup kata
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <EyeOff className="w-3.5 h-3.5" />
                Kata tersembunyi dengan aman
              </span>
            )}
          </div>

          {/* Privacy Notice */}
          <div className="w-full pt-3 border-t border-white/5 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500/80 shrink-0" />
            <span>Pastikan layar tidak diintip pemain di sebelahmu!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecretCard;
