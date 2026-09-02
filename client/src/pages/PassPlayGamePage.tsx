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
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
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
    <div className="min-h-screen bg-[#080c16] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Header */}
      <Header
        title="PASS & PLAY"
        subtitle={`KATEGORI: ${settings.category}`}
        onBack={handleBack}
        showBack
        backLabel="Keluar"
        rightElement={
          phase !== 'SETUP' && (
            <Badge variant="cyan" size="sm" className="hidden sm:inline-flex font-mono">
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
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <PassPlaySecretView />
            </motion.div>
          )}

          {/* 2. TURN CLUE / VOTING / MR WHITE INTERCEPT PHASE */}
          {(phase === 'TURN_CLUE' || phase === 'VOTING' || phase === 'MR_WHITE_GUESS') && (
            <motion.div
              key="voting-phase"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="w-full py-4"
            >
              <PassPlayVotingView />
            </motion.div>
          )}

          {/* 3. GAME OVER SUMMARY SCREEN */}
          {phase === 'GAME_OVER' && (
            <motion.div
              key="gameover-phase"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20, stiffness: 280 }}
              className="w-full space-y-6 py-4"
            >
              {/* Victory Celebration Banner */}
              <div className="text-center space-y-4 p-8 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-white/10 shadow-2xl relative overflow-hidden">
                {/* Glow aura */}
                <div
                  className={`absolute inset-0 bg-radial-gradient pointer-events-none opacity-20 ${
                    winningRole === 'CIVILIAN'
                      ? 'bg-cyan-500'
                      : winningRole === 'UNDERCOVER'
                      ? 'bg-rose-500'
                      : 'bg-purple-500'
                  }`}
                />

                <div className="relative z-10 flex flex-col items-center space-y-3">
                  <div
                    className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-xl animate-bounce ${
                      winningRole === 'CIVILIAN'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 shadow-cyan-500/30'
                        : winningRole === 'UNDERCOVER'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-400/40 shadow-rose-500/30'
                        : 'bg-purple-500/20 text-purple-400 border border-purple-400/40 shadow-purple-500/30'
                    }`}
                  >
                    <Trophy className="w-10 h-10" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-mono tracking-widest uppercase font-bold text-slate-400">
                      PERMAINAN SELESAI
                    </span>
                    <h1
                      className={`text-3xl sm:text-5xl font-black font-display tracking-tight uppercase ${
                        winningRole === 'CIVILIAN'
                          ? 'text-transparent bg-gradient-to-r from-cyan-300 via-white to-cyan-400 bg-clip-text'
                          : winningRole === 'UNDERCOVER'
                          ? 'text-transparent bg-gradient-to-r from-rose-300 via-white to-rose-400 bg-clip-text'
                          : 'text-transparent bg-gradient-to-r from-purple-300 via-white to-purple-400 bg-clip-text'
                      }`}
                    >
                      {winningRole === 'CIVILIAN'
                        ? 'Kemenangan Warga!'
                        : winningRole === 'UNDERCOVER'
                        ? 'Kemenangan Impostor!'
                        : 'Kemenangan Buta Kata!'}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                      {winningRole === 'CIVILIAN'
                        ? 'Warga berhasil mengeliminasi seluruh Impostor dan Buta Kata!'
                        : winningRole === 'UNDERCOVER'
                        ? 'Impostor berhasil menyamarkan diri dan menguasai permainan!'
                        : 'Buta Kata (Mr. White) berhasil bertahan atau menebak kata rahasia Warga!'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Secret Words Summary Card */}
              {wordPair && (
                <Card glow="cyan" className="p-4 sm:p-6">
                  <CardHeader className="p-0 pb-3 border-b border-white/10">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <KeyRound className="w-5 h-5 text-cyan-400" />
                      Pengungkapan Kata Rahasia
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-center space-y-1">
                      <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                        KATA WARGA (CIVILIAN)
                      </span>
                      <p className="text-2xl font-black font-display text-white tracking-wide">
                        {wordPair.civilianWord}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-1">
                      <span className="text-[11px] font-mono text-rose-400 font-bold uppercase tracking-wider">
                        KATA IMPOSTOR (UNDERCOVER)
                      </span>
                      <p className="text-2xl font-black font-display text-white tracking-wide">
                        {wordPair.undercoverWord}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* All Players Role Reveal List */}
              <Card className="p-4 sm:p-6 space-y-4">
                <CardHeader className="p-0 pb-3 border-b border-white/10 flex flex-row items-center justify-between">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-400" />
                    Daftar Lengkap Peran Pemain
                  </CardTitle>
                  <span className="text-xs font-mono text-slate-400">
                    {players.length} Pemain Total
                  </span>
                </CardHeader>

                <CardContent className="p-0 space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {players.map((p) => {
                      const isWinner =
                        p.role === winningRole ||
                        (winningRole === 'CIVILIAN' && p.role === 'CIVILIAN') ||
                        (winningRole === 'UNDERCOVER' && p.role === 'UNDERCOVER') ||
                        (winningRole === 'MR_WHITE' && p.role === 'MR_WHITE');

                      return (
                        <div
                          key={p.id}
                          className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                            isWinner
                              ? 'bg-slate-900/90 border-cyan-500/40 shadow-sm'
                              : 'bg-slate-950/60 border-white/5 opacity-75'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{p.avatar}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">
                                  {p.name}
                                </span>
                                {isWinner && (
                                  <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                )}
                              </div>
                              <span className="text-xs text-slate-400">
                                Kata: <strong className="text-slate-200">{p.word || '(Tanpa Kata)'}</strong>
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            {p.role && <RoleBadge role={p.role} size="sm" />}
                            <span
                              className={`text-[10px] font-mono font-semibold ${
                                p.isAlive ? 'text-emerald-400' : 'text-rose-400 line-through'
                              }`}
                            >
                              {p.isAlive ? 'Selamat (Alive)' : 'Tereliminasi'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons: Rematch & Back to Setup */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={resetToSetup}
                  leftIcon={<Settings className="w-5 h-5" />}
                  className="py-4 text-base"
                >
                  Ubah Pengaturan (Setup)
                </Button>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={rematch}
                  leftIcon={<RotateCcw className="w-5 h-5" />}
                  className="shadow-xl shadow-cyan-500/30 py-4 text-base font-bold"
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
