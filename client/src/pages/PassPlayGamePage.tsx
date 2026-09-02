import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  RotateCcw,
  Settings,
  Crown,
  KeyRound,
  Users,
} from 'lucide-react';
import { usePassPlay } from '../context/PassPlayContext';
import { useGameSound } from '../hooks/useGameSound';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge, RoleBadge } from '../components/common/Badge';
import { PassPlaySecretView } from '../components/game/PassPlaySecretView';
import { PassPlayVotingView } from '../components/game/PassPlayVotingView';

export interface PassPlayGamePageProps {
  onBackToHome?: () => void;
}

export const PassPlayGamePage: React.FC<PassPlayGamePageProps> = ({ onBackToHome }) => {
  const {
    phase,
    players,
    wordPair,
    winningRole,
    settings,
    round,
    rematch,
    resetToSetup,
  } = usePassPlay();

  const { playVictory } = useGameSound();

  // Play fanfare sound upon entering GAME_OVER
  useEffect(() => {
    if (phase === 'GAME_OVER') {
      try {
        playVictory();
      } catch {
        // ignore
      }
    }
  }, [phase, playVictory]);

  const handleBack = () => {
    if (confirm('Apakah kamu yakin ingin keluar ke menu pengaturan?')) {
      resetToSetup();
      onBackToHome?.();
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-zinc-700 selection:text-white">
      {/* Header */}
      <Header
        title="PASS & PLAY"
        subtitle={`KATEGORI: ${settings.category}`}
        onBack={handleBack}
        showBack
        backLabel="Keluar"
        rightElement={
          phase !== 'SETUP' && (
            <Badge variant="slate" size="sm" className="hidden sm:inline-flex font-mono">
              Ronde {round}
            </Badge>
          )
        }
      />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* 1. REVEAL PASS PHASE */}
          {phase === 'REVEAL_PASS' && (
            <motion.div
              key="reveal-phase"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="w-full"
            >
              <PassPlaySecretView />
            </motion.div>
          )}

          {/* 2. TURN CLUE / VOTING / MR WHITE INTERCEPT PHASE */}
          {(phase === 'TURN_CLUE' || phase === 'VOTING' || phase === 'MR_WHITE_GUESS') && (
            <motion.div
              key="voting-phase"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="w-full py-4"
            >
              <PassPlayVotingView />
            </motion.div>
          )}

          {/* 3. GAME OVER SUMMARY SCREEN */}
          {phase === 'GAME_OVER' && (
            <motion.div
              key="gameover-phase"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full space-y-6 py-4"
            >
              {/* Victory Celebration Banner */}
              <div className="text-center space-y-4 p-6 sm:p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 shadow-sm relative overflow-hidden">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400">
                    <Trophy className="w-7 h-7" />
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono tracking-wider uppercase font-semibold text-zinc-500">
                      PERMAINAN SELESAI
                    </span>
                    <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight uppercase text-white font-sans">
                      {winningRole === 'CIVILIAN'
                        ? 'Kemenangan Warga!'
                        : winningRole === 'UNDERCOVER'
                        ? 'Kemenangan Impostor!'
                        : 'Kemenangan Mr. White!'}
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                      {winningRole === 'CIVILIAN'
                        ? 'Warga berhasil mengeliminasi seluruh Impostor dan Buta Kata!'
                        : winningRole === 'UNDERCOVER'
                        ? 'Impostor berhasil menyamarkan diri dan menguasai permainan!'
                        : 'Mr. White (Buta Kata) berhasil bertahan atau menebak kata rahasia Warga!'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Secret Words Summary Card */}
              {wordPair && (
                <Card padding="md" className="border-zinc-800 bg-zinc-900/40 space-y-3">
                  <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
                    <KeyRound className="w-4 h-4 text-zinc-400" />
                    <h3 className="text-sm font-semibold text-zinc-200">
                      Pengungkapan Kata Rahasia
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 text-center space-y-1">
                      <span className="text-[10px] font-mono text-zinc-400 font-semibold uppercase tracking-wider">
                        KATA WARGA (CIVILIAN)
                      </span>
                      <p className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                        {wordPair.civilianWord}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 text-center space-y-1">
                      <span className="text-[10px] font-mono text-rose-400 font-semibold uppercase tracking-wider">
                        KATA IMPOSTOR (UNDERCOVER)
                      </span>
                      <p className="text-xl sm:text-2xl font-bold text-rose-200 tracking-wide">
                        {wordPair.undercoverWord}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* All Players Role Reveal List */}
              <Card padding="md" className="border-zinc-800 bg-zinc-900/40 space-y-3.5">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-zinc-400" />
                    <h3 className="text-sm font-semibold text-zinc-200">
                      Daftar Lengkap Peran Pemain
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-zinc-500">
                    {players.length} Pemain Total
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {players.map((p) => {
                    const isWinner =
                      p.role === winningRole ||
                      (winningRole === 'CIVILIAN' && p.role === 'CIVILIAN') ||
                      (winningRole === 'UNDERCOVER' && p.role === 'UNDERCOVER') ||
                      (winningRole === 'MR_WHITE' && p.role === 'MR_WHITE');

                    return (
                      <div
                        key={p.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          isWinner
                            ? 'bg-zinc-950/90 border-zinc-700'
                            : 'bg-zinc-950/50 border-zinc-800/60 opacity-70'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{p.avatar}</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold text-white">
                                {p.name}
                              </span>
                              {isWinner && (
                                <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              )}
                            </div>
                            <span className="text-xs text-zinc-400">
                              Kata: <strong className="text-zinc-200">{p.word || '(Tanpa Kata)'}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          {p.role && <RoleBadge role={p.role} size="sm" />}
                          <span
                            className={`text-[10px] font-mono font-medium ${
                              p.isAlive ? 'text-emerald-400' : 'text-zinc-500 line-through'
                            }`}
                          >
                            {p.isAlive ? 'Selamat (Alive)' : 'Tereliminasi'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Action Buttons: Rematch & Back to Setup */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={resetToSetup}
                  leftIcon={<Settings className="w-4 h-4" />}
                >
                  Ubah Pengaturan (Setup)
                </Button>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={rematch}
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                >
                  Main Lagi (Rematch)
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default PassPlayGamePage;
