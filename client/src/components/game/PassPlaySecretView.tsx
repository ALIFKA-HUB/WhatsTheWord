import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HandPalm, CheckCircle, ArrowRight, ArrowRight as Oper } from '@phosphor-icons/react';
import { usePassPlay } from '../../context/PassPlayContext';
import { SecretCard } from './SecretCard';
import { PlayerToken } from './PlayerToken';
import { Button } from '../common/Button';
import { cn } from '../../utils/cn';

type SecretPassSubScreen = 'PASS_PROMPT' | 'REVEAL_CARD';

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
  const nextPlayer = players[safeRevealIndex + 1];
  const isLastPlayer = safeRevealIndex >= players.length - 1;
  const totalPlayers = players.length;

  useEffect(() => {
    setSubScreen('PASS_PROMPT');
    setHasPeeked(false);
  }, [currentRevealIndex]);

  const handleReadyToPeek = () => {
    setSubScreen('REVEAL_CARD');
  };

  const handleProceedNext = () => {
    if (!hasPeeked || isTransitioning) return;
    setIsTransitioning(true);
    setHasPeeked(false);

    if (isLastPlayer) {
      finishRevealPhase();
      onAllRevealed?.();
    } else {
      // Switch to PASS_PROMPT synchronously before advancing index so the next
      // player's SecretCard is never mounted or flashed during phone handoff.
      setSubScreen('PASS_PROMPT');
      nextRevealPlayer();
    }

    setTimeout(() => {
      setIsTransitioning(false);
    }, 220);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col justify-center items-center px-4 py-4 font-sans">
      {/* Top progress stepper */}
      <div className="w-full flex items-center justify-between mb-4 px-1 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="rubber-stamp shrink-0">Bagikan Kata</span>
          <span className="text-xs font-semibold text-ink-muted truncate">
            Pemain {safeRevealIndex + 1} dari {totalPlayers}
          </span>
        </div>

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
              style={{ transform: `scaleX(${(safeRevealIndex + 1) / totalPlayers})` }}
            />
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* SUB-SCREEN 1: Confidential Pass Prompt Cover */}
        {subScreen === 'PASS_PROMPT' && (
          <motion.div
            key="pass-prompt"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="w-full paper-stack"
          >
            <div className="bg-cardstock border border-rule shadow-print rounded-3xl p-6 sm:p-7 text-center space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-paper-muted border border-rule text-xs font-semibold text-ink-muted">
                <span>Amplop Rahasia Kursi #{safeRevealIndex + 1}</span>
              </div>

              <div className="py-1">
                <PlayerToken avatar={currentPlayer?.avatar} name={currentPlayer?.name} size="xl" className="mx-auto" />
              </div>

              <div className="space-y-1.5">
                <h2 className="font-condensed text-2xl sm:text-3xl text-ink leading-tight">
                  Oper HP ke {currentPlayer?.name}
                </h2>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed max-w-[280px] mx-auto">
                  Pemain lain dilarang melihat layar. Tekan tombol di bawah setelah perangkat dipegang oleh{' '}
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

        {/* SUB-SCREEN 2: Reveal card + Direct Handoff CTA */}
        {subScreen === 'REVEAL_CARD' && (
          <motion.div
            key={`reveal-card-${currentPlayer?.id ?? safeRevealIndex}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.05 } }}
            className="w-full"
          >
            <div className="flex items-center justify-between bg-cardstock border border-rule rounded-2xl px-3.5 py-2.5 mb-3 shadow-print-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <PlayerToken avatar={currentPlayer?.avatar} name={currentPlayer?.name} size="xs" showCode={false} />
                <span className="text-xs font-semibold text-ink-muted truncate">
                  Giliran: <strong className="text-ink">{currentPlayer?.name}</strong>
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-teal-dark bg-teal-light px-2 py-0.5 rounded-full border border-teal shrink-0">
                #{safeRevealIndex + 1}/{totalPlayers}
              </span>
            </div>

            <SecretCard
              key={currentPlayer?.id ?? safeRevealIndex}
              word={currentPlayer?.word}
              role={currentPlayer?.role}
              category={settings.category === 'Semua Kategori' ? undefined : settings.category}
              onRevealed={() => setHasPeeked(true)}
            />

            <div className="mt-4">
              <Button
                variant={hasPeeked ? 'primary' : 'outline'}
                size="lg"
                fullWidth
                disabled={!hasPeeked || isTransitioning}
                onClick={handleProceedNext}
                leftIcon={hasPeeked ? <CheckCircle className="w-4 h-4" weight="bold" /> : undefined}
                rightIcon={
                  hasPeeked ? (
                    isLastPlayer ? (
                      <ArrowRight className="w-4 h-4" weight="bold" />
                    ) : (
                      <Oper className="w-4 h-4" weight="bold" />
                    )
                  ) : undefined
                }
              >
                {hasPeeked
                  ? isLastPlayer
                    ? 'Sudah Hafal, Mulai Diskusi & Voting'
                    : `Sudah Hafal, Oper ke ${nextPlayer?.name || 'Berikutnya'}`
                  : 'Tahan Kartu di Atas untuk Mengintip'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PassPlaySecretView;
