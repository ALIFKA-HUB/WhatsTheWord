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
    <div className="min-h-[100dvh] text-ink flex flex-col font-sans">
      <Header
        title="Pass & Play"
        subtitle={`Kategori: ${settings.category}`}
        onBack={handleBack}
        showBack
        backLabel="Keluar"
        rightElement={
          phase !== 'SETUP' && (
            <Badge variant="slate" size="sm" className="inline-flex">
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
              <div className="text-center space-y-4 p-6 sm:p-8 rounded-3xl bg-cardstock border border-rule shadow-print relative overflow-hidden">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-sun-light border border-sun flex items-center justify-center text-sun-dark">
                    <Trophy className="w-7 h-7" weight="bold" />
                  </div>

                  <div className="space-y-2">
                    <span className="rubber-stamp">
                      Permainan Selesai
                    </span>
                    <img
                      src="/assets/gameover-art.svg"
                      alt="Ilustrasi akhir permainan dengan kartu kata terbuka"
                      className="w-full max-w-md mx-auto border border-rule shadow-print-sm rounded-2xl"
                    />
                    <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-ink font-condensed pt-1">
                      {winningRole === 'CIVILIAN'
                        ? 'Kemenangan Warga!'
                        : winningRole === 'UNDERCOVER'
                        ? 'Kemenangan Impostor!'
                        : 'Kemenangan Mr. White!'}
                    </h1>
                    <p className="text-xs sm:text-sm text-ink-muted max-w-md mx-auto leading-relaxed">
                      {winningRole === 'CIVILIAN'
                        ? 'Warga berhasil mengeliminasi seluruh Impostor dan Mr. White!'
                        : winningRole === 'UNDERCOVER'
                        ? 'Impostor berhasil menyamarkan diri dan menguasai permainan!'
                        : 'Mr. White berhasil bertahan atau menebak kata rahasia Warga!'}
                    </p>
                  </div>
                </div>
              </div>

              {/* The Big Card Reveal: Side-by-Side Tabletop Word Cards */}
              {wordPair && (
                <Card padding="md" className="space-y-3.5">
                  <div className="flex items-center justify-between border-b border-rule pb-3">
                    <span className="flex items-center gap-2 text-sm font-bold text-ink">
                      <Key className="w-4 h-4 text-teal-dark" weight="bold" />
                      Kartu Rahasia Meja Ini
                    </span>
                    <span className="text-xs font-semibold text-ink-muted">
                      {settings.category}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-4 rounded-3xl bg-teal-light/40 border border-teal flex flex-col justify-between min-h-[128px]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-ink-muted">01</span>
                        <span className="px-2 py-0.5 rounded-full bg-teal-light border border-teal text-teal-dark font-bold">
                          Warga
                        </span>
                      </div>
                      <p className="font-condensed text-2xl sm:text-3xl text-ink text-center my-auto py-2">
                        {wordPair.civilianWord}
                      </p>
                      <span className="text-[11px] text-ink-muted text-center block">
                        Dipegang mayoritas meja
                      </span>
                    </div>

                    <div className="p-4 rounded-3xl bg-stamp-light border border-stamp flex flex-col justify-between min-h-[128px]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-stamp-dark">02</span>
                        <span className="px-2 py-0.5 rounded-full bg-cardstock border border-stamp text-stamp-dark font-bold">
                          Impostor
                        </span>
                      </div>
                      <p className="font-condensed text-2xl sm:text-3xl text-stamp-dark text-center my-auto py-2">
                        {wordPair.undercoverWord}
                      </p>
                      <span className="text-[11px] text-stamp-dark text-center block">
                        Kata penyamar
                      </span>
                    </div>
                  </div>
                </Card>
              )}

              {/* All Players Role Reveal List */}
              <Card padding="md" className="space-y-3.5">
                <div className="flex items-center justify-between border-b border-rule pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-teal-dark" weight="bold" />
                    <h3 className="text-sm font-bold text-ink">
                      Daftar Lengkap Peran Pemain
                    </h3>
                  </div>
                  <span className="text-xs text-ink-muted font-medium">
                    {players.length} pemain
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {players.map((p) => {
                    const isWinner = p.role === winningRole;

                    return (
                      <div
                        key={p.id}
                        className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${
                          isWinner
                            ? 'bg-teal-light border-teal'
                            : 'bg-paper border-rule opacity-80'
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
                                <Crown className="w-3.5 h-3.5 text-sun-dark shrink-0" weight="bold" />
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
                            className={`text-xs font-medium ${
                              p.isAlive ? 'text-teal-dark' : 'text-ink-muted line-through'
                            }`}
                          >
                            {p.isAlive ? 'Bertahan' : 'Tereliminasi'}
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
