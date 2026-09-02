import React, { useState } from 'react';
import { Volume2, VolumeX, ArrowLeft, Copy, Check } from 'lucide-react';
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
  subtitle = 'SOCIAL DEDUCTION',
  roomCode,
  onBack,
  backLabel = 'Kembali',
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
        'w-full z-40 px-4 py-3.5 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/60 transition-all duration-200',
        sticky && 'sticky top-0',
        className
      )}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Left Section: Back button or Brand */}
        <div className="flex items-center gap-3">
          {(showBack || onBack) && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onBack}
              leftIcon={<ArrowLeft className="w-4 h-4 text-zinc-400" />}
              className="text-xs font-medium"
              aria-label={backLabel}
            >
              <span className="hidden sm:inline">{backLabel}</span>
            </Button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 shrink-0">
              <img src="/logo.svg" alt="What's The Word Logo" className="w-5 h-5 object-contain" />
            </div>

            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-bold tracking-tight text-zinc-100 font-sans leading-tight">
                {title}
              </span>
              <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-medium">
                {subtitle}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Room Code Badge (if active) */}
        {roomCode && (
          <button
            onClick={handleCopyRoomCode}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer text-left active:scale-95"
            title="Klik untuk salin kode room"
          >
            <span className="text-[10px] text-zinc-500 font-mono uppercase">KODE:</span>
            <span className="font-mono font-bold text-sm tracking-widest text-zinc-100">
              {roomCode}
            </span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 ml-1" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-zinc-500 ml-1" />
            )}
          </button>
        )}

        {/* Right Section: Sound Toggle & Custom Actions */}
        <div className="flex items-center gap-2">
          {rightElement}

          {/* Sound Mute/Unmute Button */}
          <button
            onClick={toggleMute}
            className={cn(
              'p-2 rounded-lg border transition-all text-zinc-400 hover:text-zinc-200 active:scale-95',
              isMuted
                ? 'bg-zinc-900/60 border-zinc-800 text-zinc-600'
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'
            )}
            title={isMuted ? 'Aktifkan Suara' : 'Bisukan Suara'}
            aria-label={isMuted ? 'Aktifkan Suara' : 'Bisukan Suara'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
