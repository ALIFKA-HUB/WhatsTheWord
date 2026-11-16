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
  title = "What’s The Word",
  subtitle = 'Permainan deduksi kata',
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
        'w-full z-40 px-3 sm:px-4 py-2.5 sm:py-3 bg-cardstock border-b border-rule shadow-sm transition-colors duration-200',
        'pt-[max(0.625rem,env(safe-area-inset-top,0px))]',
        sticky && 'sticky top-0',
        className
      )}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2.5 sm:gap-3">
        {/* Left: back button or brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-initial">
          {(showBack || onBack) && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onBack}
              leftIcon={<ArrowLeft className="w-4 h-4" weight="bold" />}
              className="text-xs min-h-[44px] min-w-[44px] px-3 sm:px-4 shrink-0 touch-manipulation"
              aria-label={backLabel}
            >
              <span className="hidden sm:inline">{backLabel}</span>
            </Button>
          )}

          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <img src="/logo.svg" alt="What’s The Word" className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="font-condensed text-base sm:text-lg text-ink leading-tight truncate">
                {title}
              </span>
              <span className="hidden md:inline text-xs text-ink-muted font-medium truncate">
                {subtitle}
              </span>
            </div>
          </div>
        </div>

        {/* Center: room code ticket */}
        {roomCode && (
          <button
            type="button"
            onClick={handleCopyRoomCode}
            className="flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] rounded-full bg-teal-light text-teal-dark border border-teal shadow-print-sm hover:bg-paper-muted transition-colors cursor-pointer text-left active:translate-y-[1px] shrink-0 touch-manipulation focus-visible:ring-2 focus-visible:ring-teal-dark"
            title="Klik untuk salin kode meja"
          >
            <span className="text-xs font-semibold text-ink-muted hidden xs:inline">Meja</span>
            <span className="font-mono font-bold text-xs sm:text-sm text-ink">
              {roomCode}
            </span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-teal-dark ml-0.5" weight="bold" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-ink-muted ml-0.5" weight="bold" />
            )}
          </button>
        )}

        {/* Right: sound toggle & custom actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {rightElement}

          <button
            type="button"
            onClick={toggleMute}
            className={cn(
              'w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border transition-colors active:translate-y-[1px] flex items-center justify-center shrink-0 touch-manipulation focus-visible:ring-2 focus-visible:ring-ink',
              isMuted
                ? 'bg-paper-muted border-rule text-ink-faint'
                : 'bg-cardstock border-rule text-ink shadow-print-sm hover:bg-paper-muted'
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
