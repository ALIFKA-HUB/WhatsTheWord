import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowCounterClockwise, Crown, GearSix, Key, Trophy, Users } from '@phosphor-icons/react';
import { PlayerToken } from '../components/game/PlayerToken';
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
    if (confirm('Apakah kamu yakin ingin keluar? Progres permainan ini akan hilang.')) {
      resetToSetup();
      onBackToHome?.();
    }
  };

  return (
    <div className="min-h-[100dvh] text-ink flex flex-col font-sans selection:bg-stamp selection:text-ink">
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
              <div className="text-center space-y-4 p-6 sm:p-8 rounded-2xl bg-paper-muted border border-rule shadow-sm relative overflow-hidden">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-cardstock-warm border border-rule flex items-center justify-center text-stamp-dark">
                    <Trophy className="w-7 h-7" />
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono tracking-wider uppercase font-semibold text-ink-muted">
                      PERMAINAN SELESAI
                    </span>
                    <img
                      src="/assets/gameover-art.svg"
                      alt="Ilustrasi dossier terbuka dengan kartu terungkap"
                      className="w-full max-w-md mx-auto border border-rule shadow-print rounded-2xl"
                    />
                    <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight uppercase text-ink font-sans">
                      {winningRole === 'CIVILIAN'
                        ? 'Kemenangan Warga!'
                        : winningRole === 'UNDERCOVER'
                        ? 'Kemenangan Impostor!'
                        : 'Kemenangan Mr. White!'}
                    </h1>
                    <p className="text-xs sm:text-sm text-ink-muted max-w-md mx-auto leading-relaxed">
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
                <Card padding="md" className="border-ink bg-cardstock space-y-3">
                  <div className="flex items-center gap-2 border-b border-ink pb-3">
                    <Key className="w-4 h-4 text-ink-muted" />
                    <h3 className="text-sm font-semibold text-ink">
                      Pengungkapan Kata Rahasia
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-4 rounded-xl bg-paper border border-rule text-center space-y-1">
                      <span className="text-[11px] font-mono text-ink-muted font-semibold uppercase tracking-wider">
                        KATA WARGA (CIVILIAN)
                      </span>
                      <p className="text-xl sm:text-2xl font-bold text-ink tracking-wide">
                        {wordPair.civilianWord}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-paper border border-rule text-center space-y-1">
                      <span className="text-[11px] font-mono text-stamp-dark font-semibold uppercase tracking-wider">
                        KATA IMPOSTOR (UNDERCOVER)
                      </span>
                      <p className="text-xl sm:text-2xl font-bold text-stamp-dark tracking-wide">
                        {wordPair.undercoverWord}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* All Players Role Reveal List */}
              <Card padding="md" className="border-ink bg-cardstock space-y-3.5">
                <div className="flex items-center justify-between border-b border-ink pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-ink-muted" />
                    <h3 className="text-sm font-semibold text-ink">
                      Daftar Lengkap Peran Pemain
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-ink-muted">
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
                            ? 'bg-paper/90 border-rule'
                            : 'bg-paper border-ink/60 opacity-70'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <PlayerToken avatar={p.avatar} name={p.name} size="md" showCode={false} />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold text-ink">
                                {p.name}
                              </span>
                              {isWinner && (
                                <Crown className="w-3.5 h-3.5 text-stamp-dark shrink-0" />
                              )}
                            </div>
                            <span className="text-xs text-ink-muted">
                              Kata: <strong className="text-ink">{p.word || '(Tanpa Kata)'}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          {p.role && <RoleBadge role={p.role} size="sm" />}
                          <span
                            className={`text-[11px] font-mono font-medium ${
                              p.isAlive ? 'text-ink' : 'text-ink-muted line-through'
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
                  leftIcon={<GearSix className="w-4 h-4" />}
                >
                  Ubah Pengaturan (Setup)
                </Button>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={rematch}
                  leftIcon={<ArrowCounterClockwise className="w-4 h-4" />}
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
