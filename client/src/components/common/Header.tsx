import React, { useState } from 'react';
import { Volume2, VolumeX, ArrowLeft, Copy, Check, Sparkles } from 'lucide-react';
import { useGameSound } from '../../hooks/useGameSound';
import { Button } from './Button';
import { cn } from '../../utils/cn';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  roomCode?: string;
  onBack?: () => void;
  backLabel?: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
  sticky?: boolean;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title = "WHAT'S THE WORD",
  subtitle = 'CYBER DECEPTION',
  roomCode,
  onBack,
  backLabel = 'Keluar',
  showBack = false,
  rightElement,
  sticky = true,
  className,
}) => {
  const { isMuted, toggleMute } = useGameSound();
  const [copied, setCopied] = useState(false);

  const handleCopyRoomCode = async () => {
    if (!roomCode) return;
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard error
    }
  };

  return (
    <header
      className={cn(
        'w-full z-40 px-4 py-3 bg-slate-950/85 backdrop-blur-md border-b border-white/10 transition-all duration-200',
        sticky && 'sticky top-0',
        className
      )}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Left Section: Back button or Brand */}
        <div className="flex items-center gap-3">
          {(showBack || onBack) && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onBack}
              leftIcon={<ArrowLeft className="w-4 h-4 text-cyan-400" />}
              className="text-xs sm:text-sm font-medium hover:border-cyan-500/40"
              aria-label={backLabel}
            >
              <span className="hidden sm:inline">{backLabel}</span>
            </Button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)]">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              <div className="absolute -inset-0.5 rounded-xl bg-cyan-500/20 blur-sm -z-10" />
            </div>

            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black tracking-wider bg-gradient-to-r from-cyan-400 via-violet-400 to-rose-400 bg-clip-text text-transparent font-display leading-tight">
                {title}
              </span>
              <span className="text-[10px] sm:text-xs font-mono tracking-widest text-cyan-400/80 uppercase font-semibold">
                {subtitle}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Room Code Badge (if active) */}
        {roomCode && (
          <button
            onClick={handleCopyRoomCode}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/90 border border-cyan-500/40 hover:border-cyan-400 hover:bg-slate-800/90 transition-all shadow-sm group cursor-pointer text-left"
            title="Klik untuk salin kode room"
          >
            <span className="text-[10px] uppercase font-mono text-slate-400">ROOM:</span>
            <span className="text-xs sm:text-sm font-mono font-bold text-cyan-300 tracking-wider">
              {roomCode}
            </span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-0.5" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0 ml-0.5 transition-colors" />
            )}
          </button>
        )}

        {/* Right Section: Sound Mute Toggle & Custom Actions */}
        <div className="flex items-center gap-2">
          {rightElement}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className={cn(
              'border rounded-xl transition-all',
              isMuted
                ? 'border-rose-500/30 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20'
                : 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 shadow-[0_0_10px_-2px_rgba(6,182,212,0.3)]'
            )}
            title={isMuted ? 'Nyalakan Suara (Unmute)' : 'Matikan Suara (Mute)'}
            aria-label={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
