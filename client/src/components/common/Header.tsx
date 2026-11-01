import React, { useState } from 'react';
import { SpeakerHigh, SpeakerSlash, ArrowLeft, Copy, Check } from '@phosphor-icons/react';
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
  subtitle = 'DEDUKSI KATA',
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
        'w-full z-40 px-4 py-3 bg-cardstock border-b border-rule transition-all duration-200',
        sticky && 'sticky top-0',
        className
      )}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Left: back button or brand */}
        <div className="flex items-center gap-3 min-w-0">
          {(showBack || onBack) && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onBack}
              leftIcon={<ArrowLeft className="w-4 h-4" weight="bold" />}
              className="text-xs"
              aria-label={backLabel}
            >
              <span className="hidden sm:inline">{backLabel}</span>
            </Button>
          )}

          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <img src="/logo.svg" alt="What's The Word" className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="font-condensed text-sm sm:text-lg text-ink leading-none truncate">
                {title}
              </span>
              <span className="hidden sm:inline text-[11px] font-mono tracking-[0.2em] text-ink-muted uppercase font-medium mt-0.5">
                {subtitle}
              </span>
            </div>
          </div>
        </div>

        {/* Center: room code ticket */}
        {roomCode && (
          <button
            onClick={handleCopyRoomCode}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-teal text-ink shadow-print-sm hover:brightness-105 transition-all cursor-pointer text-left active:translate-x-[1px] active:translate-y-[1px] active:shadow-none shrink-0"
            title="Klik untuk salin kode meja"
          >
            <span className="text-[10px] sm:text-[11px] font-mono uppercase font-bold opacity-80">MEJA</span>
            <span className="font-mono font-bold text-xs sm:text-sm tracking-[0.2em]">
              {roomCode}
            </span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-ink ml-0.5" weight="bold" />
            ) : (
              <Copy className="w-3.5 h-3.5 opacity-80 ml-0.5" weight="bold" />
            )}
          </button>
        )}

        {/* Right: sound toggle & custom actions */}
        <div className="flex items-center gap-2">
          {rightElement}

          <button
            onClick={toggleMute}
            className={cn(
              'p-2 rounded-lg border-2 transition-all active:translate-x-[1px] active:translate-y-[1px]',
              isMuted
                ? 'bg-paper-muted border-rule text-ink-faint'
                : 'bg-cardstock border-ink text-ink shadow-print-sm active:shadow-none'
            )}
            title={isMuted ? 'Aktifkan Suara' : 'Bisukan Suara'}
            aria-label={isMuted ? 'Aktifkan Suara' : 'Bisukan Suara'}
          >
            {isMuted ? <SpeakerSlash className="w-4 h-4" weight="bold" /> : <SpeakerHigh className="w-4 h-4" weight="bold" />}
          </button>
        </div>
      </div>
    </header>
  );
};
