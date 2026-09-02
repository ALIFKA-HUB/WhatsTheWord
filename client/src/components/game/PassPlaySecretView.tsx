import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { usePassPlay } from '../../context/PassPlayContext';
import { SecretCard } from './SecretCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

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

  const currentPlayer = players[currentRevealIndex] || players[0];
  const isLastPlayer = currentRevealIndex >= players.length - 1;
  const totalPlayers = players.length;

  // Reset sub-screen when reveal index changes
  useEffect(() => {
    setSubScreen('PASS_PROMPT');
  }, [currentRevealIndex]);

  const handleReadyToPeek = () => {
    setSubScreen('REVEAL_CARD');
  };

  const handleFinishPeeking = () => {
    setSubScreen('DONE_PROMPT');
  };

  const handleProceedNext = () => {
    if (isLastPlayer) {
      finishRevealPhase();
      onAllRevealed?.();
    } else {
      nextRevealPlayer();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col justify-center items-center px-4 py-6 font-sans">
      {/* Top Pass Progress Stepper */}
      <div className="w-full flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-2">
          <Badge variant="slate" size="sm">
            INTIP KATA
          </Badge>
          <span className="text-xs font-mono text-zinc-400">
            Pemain {currentRevealIndex + 1} dari {totalPlayers}
          </span>
        </div>

        {/* Progress Indicators */}
        <div className="flex items-center gap-1">
          {players.map((_, idx) => (
            <span
              key={idx}
              className={`h-1 rounded-full transition-all duration-200 ${
                idx === currentRevealIndex
                  ? 'w-5 bg-white'
                  : idx < currentRevealIndex
                  ? 'w-2 bg-zinc-600'
                  : 'w-2 bg-zinc-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Animated Flow Container */}
      <AnimatePresence mode="wait">
        {/* SUB-SCREEN 1: Pass Phone Prompt */}
        {subScreen === 'PASS_PROMPT' && (
          <motion.div
            key="pass-prompt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full flex flex-col items-center text-center space-y-6 p-6 sm:p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-md shadow-sm"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-4xl shadow-sm">
                {currentPlayer.avatar}
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-zinc-300">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                Giliran Pemain #{currentRevealIndex + 1}
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
                Oper HP ke {currentPlayer.name}
              </h2>
              <p className="text-xs text-zinc-400 max-w-[280px] leading-relaxed">
                Pemain lain dilarang mengintip! Tekan tombol saat HP sudah di tangan <strong>{currentPlayer.name}</strong>.
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleReadyToPeek}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Saya {currentPlayer.name}, Siap Intip
            </Button>
          </motion.div>
        )}

        {/* SUB-SCREEN 2: Secret Card Reveal (Press & Hold) */}
        {subScreen === 'REVEAL_CARD' && (
          <motion.div
            key="reveal-card"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="w-full flex flex-col items-center space-y-5"
          >
            <div className="text-center space-y-0.5">
              <p className="text-xs font-mono text-zinc-400 font-medium">
                Pemain: <span className="text-zinc-200 font-bold">{currentPlayer.name}</span>
              </p>
            </div>

            {/* Reusable SecretCard Component */}
            <SecretCard
              role={currentPlayer.role}
              word={currentPlayer.word}
              category={settings.category}
            />

            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={handleFinishPeeking}
              leftIcon={<CheckCircle className="w-4 h-4 text-emerald-400" />}
            >
              Sudah Hafal Kata &amp; Tutup Layar
            </Button>
          </motion.div>
        )}

        {/* SUB-SCREEN 3: Done Peeking - Next Player or Start */}
        {subScreen === 'DONE_PROMPT' && (
          <motion.div
            key="done-prompt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full flex flex-col items-center text-center space-y-6 p-6 sm:p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-md shadow-sm"
          >
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                Kata Telah Terkunci
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white">
                {isLastPlayer ? 'Semua Pemain Telah Siap!' : `Lanjut ke Pemain Berikutnya`}
              </h2>
              <p className="text-xs text-zinc-400 max-w-[280px] leading-relaxed">
                {isLastPlayer
                  ? 'Seluruh pemain sudah melihat kata rahasia masing-masing. Saatnya memulai putaran diskusi!'
                  : `Oper HP ke pemain berikutnya tanpa membocorkan kata rahasiamu.`}
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleProceedNext}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isLastPlayer ? 'Mulai Diskusi & Voting' : 'Oper ke Pemain Selanjutnya'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
