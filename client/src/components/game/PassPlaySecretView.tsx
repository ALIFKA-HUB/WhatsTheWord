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
    <div className="w-full max-w-lg mx-auto min-h-[500px] flex flex-col justify-center items-center px-4 py-6">
      {/* Top Pass Progress Stepper */}
      <div className="w-full flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-2">
          <Badge variant="cyan" size="sm" pulse>
            FASE INTI KATA
          </Badge>
          <span className="text-xs font-mono text-slate-400">
            Pemain {currentRevealIndex + 1} dari {totalPlayers}
          </span>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center gap-1">
          {players.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentRevealIndex
                  ? 'w-6 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                  : idx < currentRevealIndex
                  ? 'w-2 bg-emerald-400'
                  : 'w-2 bg-slate-800'
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
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="w-full flex flex-col items-center text-center space-y-6 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-white/10 shadow-2xl backdrop-blur-xl"
          >
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-cyan-500/20 via-violet-500/10 to-transparent border border-cyan-500/30 flex items-center justify-center text-5xl sm:text-6xl shadow-inner animate-pulse">
                {currentPlayer.avatar}
              </div>
              <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-slate-950 border border-cyan-400/40 text-cyan-400 shadow-md">
                <Smartphone className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-2 max-w-sm">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                OPER PERANGKAT KE:
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-white tracking-wide">
                {currentPlayer.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                Berikan smartphone ini kepada <strong>{currentPlayer.name}</strong>. Jangan biarkan pemain lain melihat layar!
              </p>
            </div>

            <div className="w-full pt-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleReadyToPeek}
                rightIcon={<ArrowRight className="w-5 h-5" />}
                className="shadow-lg shadow-cyan-500/25 py-3.5 text-base"
              >
                Saya {currentPlayer.name}, Saya Sudah Siap!
              </Button>
            </div>
          </motion.div>
        )}

        {/* SUB-SCREEN 2: Secret Card Reveal (Press & Hold) */}
        {subScreen === 'REVEAL_CARD' && (
          <motion.div
            key="reveal-card"
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="w-full flex flex-col items-center space-y-6"
          >
            {/* Player Target Badge */}
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-slate-900/80 border border-white/10 shadow-sm">
              <span className="text-xl">{currentPlayer.avatar}</span>
              <span className="text-sm font-bold text-slate-200">{currentPlayer.name}</span>
            </div>

            {/* Reusable Secret Card */}
            <SecretCard
              role={currentPlayer.role}
              word={currentPlayer.word}
              category={settings.category}
              className="shadow-2xl"
            />

            {/* Confirm Finished Button */}
            <div className="w-full max-w-sm">
              <Button
                variant="secondary"
                size="md"
                fullWidth
                onClick={handleFinishPeeking}
                leftIcon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
                className="hover:border-emerald-500/40 hover:text-white"
              >
                Sudah Hafal Kata & Peran
              </Button>
            </div>
          </motion.div>
        )}

        {/* SUB-SCREEN 3: Done & Pass to Next Player */}
        {subScreen === 'DONE_PROMPT' && (
          <motion.div
            key="done-prompt"
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="w-full flex flex-col items-center text-center space-y-6 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-white/10 shadow-2xl backdrop-blur-xl"
          >
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <CheckCircle className="w-10 h-10 animate-bounce" />
            </div>

            <div className="space-y-2 max-w-sm">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                KATA BERHASIL DITERIMA
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                {currentPlayer.name} Telah Mengintip
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-sans">
                {isLastPlayer
                  ? 'Semua pemain telah selesai melihat peran masing-masing! Siap untuk memulai putaran diskusi dan clue?'
                  : 'Sembunyikan layar dan oper smartphone ke pemain berikutnya.'}
              </p>
            </div>

            <div className="w-full pt-2">
              <Button
                variant={isLastPlayer ? 'primary' : 'secondary'}
                size="lg"
                fullWidth
                onClick={handleProceedNext}
                rightIcon={<ArrowRight className="w-5 h-5" />}
                className={isLastPlayer ? 'shadow-lg shadow-cyan-500/30 font-bold' : ''}
              >
                {isLastPlayer ? 'Mulai Beri Clue (Diskusi)' : 'Oper ke Pemain Berikutnya'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PassPlaySecretView;
