import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HandPalm, CheckCircle, ArrowRight, SealCheck, ArrowRight as Oper } from '@phosphor-icons/react';
import { usePassPlay } from '../../context/PassPlayContext';
import { SecretCard } from './SecretCard';
import { PlayerToken } from './PlayerToken';
import { Button } from '../common/Button';
import { cn } from '../../utils/cn';

type SecretPassSubScreen = 'PASS_PROMPT' | 'REVEAL_CARD' | 'DONE_PROMPT';

export interface PassPlaySecretViewProps {
  onAllRevealed?: () => void;
}

export const PassPlaySecretView: React.FC<PassPlaySecretViewProps> = ({ onAllRevealed }) => {
  const {
    players,
    currentRevealIndex,
    settings,
    nextRevealPlayer,
    finishRevealPhase,
  } = usePassPlay();

  const [subScreen, setSubScreen] = useState<SecretPassSubScreen>('PASS_PROMPT');
  const [hasPeeked, setHasPeeked] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const safeRevealIndex = Math.min(Math.max(0, currentRevealIndex), Math.max(0, players.length - 1));
  const currentPlayer = players[safeRevealIndex] || players[0];
  const isLastPlayer = safeRevealIndex >= players.length - 1;
  const totalPlayers = players.length;

  useEffect(() => {
    setSubScreen('PASS_PROMPT');
    setHasPeeked(false);
  }, [currentRevealIndex]);

  const handleReadyToPeek = () => {
    setSubScreen('REVEAL_CARD');
  };

  const handleFinishPeeking = () => {
    if (!hasPeeked) return;
    if (isLastPlayer) {
      setSubScreen('DONE_PROMPT');
    } else {
      handleProceedNext();
    }
  };

  const handleProceedNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    if (isLastPlayer) {
      finishRevealPhase();
      onAllRevealed?.();
    } else {
      nextRevealPlayer();
    }

    setTimeout(() => {
      setIsTransitioning(false);
    }, 250);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col justify-center items-center px-4 py-6 font-sans">
      {/* Top progress stepper */}
      <div className="w-full flex items-center justify-between mb-5 px-1 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="rubber-stamp shrink-0">Bagikan Kata</span>
          <span className="text-xs font-semibold text-ink-muted truncate">
            Pemain {safeRevealIndex + 1} dari {totalPlayers}
          </span>
        </div>
        {/* seat progress indicators (clean bar on >8 players, chips on <=8) */}
        {totalPlayers <= 8 ? (
          <div className="flex items-center gap-1.5 flex-wrap justify-end shrink-0">
            {players.map((p, idx) => (
              <span
                key={p.id}
                className={cn(
                  'w-2.5 h-2.5 rounded-full border border-rule transition-colors',
                  idx === safeRevealIndex && 'bg-teal-dark border-teal-dark',
                  idx < safeRevealIndex && 'bg-ink-muted border-ink-muted',
                  idx > safeRevealIndex && 'bg-cardstock'
                )}
              />
            ))}
          </div>
        ) : (
          <div className="w-20 sm:w-28 h-2 rounded-full bg-paper-muted border border-rule overflow-hidden shrink-0">
            <div
              className="h-full bg-teal-dark origin-left transition-transform duration-200"
              style={{ transform: `scaleX(${((safeRevealIndex + 1) / totalPlayers)})` }}
            />
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* SUB-SCREEN 1: Confidential Pass Prompt Cover */}
        {subScreen === 'PASS_PROMPT' && (
          <motion.div
            key="pass-prompt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full paper-stack"
          >
            <div className="bg-cardstock border border-rule shadow-print rounded-3xl p-6 sm:p-8 text-center space-y-5">
              {/* Privacy seal banner */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-paper-muted border border-rule text-xs font-semibold text-ink-muted">
                <span>Amplop Rahasia Pemain {safeRevealIndex + 1}</span>
              </div>

              <div className="py-2">
                <PlayerToken avatar={currentPlayer?.avatar} name={currentPlayer?.name} size="xl" className="mx-auto" />
              </div>

              <div className="space-y-1.5">
                <h2 className="font-condensed text-2xl sm:text-3xl text-ink leading-tight">
                  Oper HP ke {currentPlayer?.name}
                </h2>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed max-w-[280px] mx-auto">
                  Pemain lain dilarang melihat layar! Tekan tombol di bawah setelah perangkat berada di tangan{' '}
                  <span className="font-bold text-ink">{currentPlayer?.name}</span>.
                </p>
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleReadyToPeek}
                rightIcon={<HandPalm className="w-4 h-4" weight="bold" />}
              >
                Saya {currentPlayer?.name}, Siap Intip
              </Button>
            </div>
          </motion.div>
        )}

        {/* SUB-SCREEN 2: Reveal card */}
        {subScreen === 'REVEAL_CARD' && (
          <motion.div
            key="reveal-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
          >
            <div className="text-center mb-3">
              <p className="text-xs font-semibold text-ink-muted">
                Giliran: <span className="text-ink font-bold">{currentPlayer?.name}</span>
              </p>
            </div>
            <SecretCard
              word={currentPlayer?.word}
              role={currentPlayer?.role}
              category={settings.category === 'Semua Kategori' ? undefined : settings.category}
              onRevealed={() => setHasPeeked(true)}
            />
            <div className="mt-5">
              <Button
                variant={hasPeeked ? 'primary' : 'outline'}
                size="lg"
                fullWidth
                disabled={!hasPeeked || isTransitioning}
                onClick={handleFinishPeeking}
                leftIcon={hasPeeked ? <CheckCircle className="w-4 h-4" weight="bold" /> : undefined}
                rightIcon={hasPeeked ? (isLastPlayer ? <ArrowRight className="w-4 h-4" weight="bold" /> : <Oper className="w-4 h-4" weight="bold" />) : undefined}
              >
                {hasPeeked
                  ? isLastPlayer
                    ? 'Sudah Hafal, Selesai Mengintip'
                    : 'Sudah Hafal, Oper Berikutnya'
                  : 'Tahan Kartu untuk Mengintip'}
              </Button>
            </div>
          </motion.div>
        )}

        {/* SUB-SCREEN 3: Done peeking */}
        {subScreen === 'DONE_PROMPT' && (
          <motion.div
            key="done-prompt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full paper-stack"
          >
            <div className="bg-cardstock border border-rule shadow-print rounded-3xl p-6 sm:p-8 text-center space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-teal-light border border-teal shadow-print-sm flex items-center justify-center text-teal-dark mx-auto">
                <SealCheck className="w-7 h-7" weight="bold" />
              </div>

              <div className="space-y-1.5">
                <h2 className="font-condensed text-2xl sm:text-3xl text-ink leading-tight">
                  {isLastPlayer ? 'Semua Pemain Telah Siap!' : 'Lanjut ke Pemain Berikutnya'}
                </h2>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed max-w-[280px] mx-auto">
                  {isLastPlayer
                    ? 'Seluruh pemain sudah melihat kata rahasia masing-masing. Saatnya memulai putaran diskusi!'
                    : 'Oper HP ke pemain berikutnya tanpa membocorkan kata rahasiamu.'}
                </p>
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={isTransitioning}
                onClick={handleProceedNext}
                rightIcon={isLastPlayer ? <ArrowRight className="w-4 h-4" weight="bold" /> : <Oper className="w-4 h-4" weight="bold" />}
              >
                {isLastPlayer ? 'Mulai Diskusi & Voting' : 'Oper ke Pemain Selanjutnya'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
