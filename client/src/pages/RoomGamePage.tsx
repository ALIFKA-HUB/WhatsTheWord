import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowCounterClockwise, ArrowRight, CheckCircle, Clock, Crown, Eye, Microphone, SignOut, Skull, Trophy } from '@phosphor-icons/react';
import { PlayerToken } from '../components/game/PlayerToken';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { Badge, RoleBadge } from '../components/common/Badge';
import { SecretCard } from '../components/game/SecretCard';
import { CountdownTimer } from '../components/game/CountdownTimer';
import { VotingGrid } from '../components/game/VotingGrid';
import { MrWhiteModal } from '../components/game/MrWhiteModal';
import { useSocket } from '../hooks/useSocket';
import { useGameSound } from '../hooks/useGameSound';
import { cn } from '../utils/cn';

export interface RoomGamePageProps {
  onReturnToLobby: () => void;
  onExitRoom: () => void;
}

export const RoomGamePage: React.FC<RoomGamePageProps> = ({
  onReturnToLobby,
  onExitRoom,
}) => {
  const {
    room,
    currentPlayer,
    advanceTurn,
    syncTimerTick,
    castVote,
    submitMrWhiteGuess,
    rematch,
    leaveRoom,
    tieNotification,
  } = useSocket();

  const {
    playElimination,
    playVictory,
    playDefeat,
    playButtonTap,
  } = useGameSound();

  const [localSecondsRemaining, setLocalSecondsRemaining] = useState<number>(45);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isRematching, setIsRematching] = useState(false);
  const [isRePeekOpen, setIsRePeekOpen] = useState(false);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
  const soundPlayedForGameOverRef = useRef(false);

  const phase = room?.phase || 'LOBBY';
  const players = room?.players || [];
  const isHost = currentPlayer?.isHost ?? false;
  const isAlive = currentPlayer?.isAlive ?? true;

  const livingSpeakers = (room?.speakingOrder || []).filter((id) =>
    players.find((p) => p.id === id)?.isAlive
  );
  const currentSpeakerId = livingSpeakers[room?.currentSpeakerIndex ?? 0];
  const currentSpeaker = players.find((p) => p.id === currentSpeakerId);
  const isCurrentSpeakerMe = currentSpeaker?.id === currentPlayer?.id;

  useEffect(() => {
    if (phase !== 'TURN_PHASE') return;

    setLocalSecondsRemaining(room?.activeTurnRemainingSeconds ?? 45);

    const timer = setInterval(() => {
      setLocalSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (isCurrentSpeakerMe || isHost) {
            advanceTurn();
          }
          return 0;
        }
        const nextSec = prev - 1;
        if (isHost && nextSec % 5 === 0) {
          syncTimerTick(nextSec);
        }
        return nextSec;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, room?.currentSpeakerIndex, isCurrentSpeakerMe, isHost, advanceTurn, syncTimerTick, room?.activeTurnRemainingSeconds]);

  useEffect(() => {
    if (room?.activeTurnRemainingSeconds !== undefined) {
      setLocalSecondsRemaining(room.activeTurnRemainingSeconds);
    }
  }, [room?.activeTurnRemainingSeconds]);

  useEffect(() => {
    if (phase === 'LOBBY') {
      onReturnToLobby();
    }
  }, [phase, onReturnToLobby]);

  useEffect(() => {
    if (phase !== 'TURN_PHASE' && phase !== 'VOTING') {
      setIsRePeekOpen(false);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'GAME_OVER' && !soundPlayedForGameOverRef.current) {
      soundPlayedForGameOverRef.current = true;
      const winner = room?.winningRole;
      const isMyWin =
        (winner === 'CIVILIAN' && currentPlayer?.role === 'CIVILIAN') ||
        (winner === 'UNDERCOVER' && currentPlayer?.role === 'UNDERCOVER') ||
        (winner === 'MR_WHITE' && currentPlayer?.role === 'MR_WHITE');

      if (isMyWin) {
        try {
          playVictory();
        } catch {}
      } else {
        try {
          playDefeat();
        } catch {}
      }
    } else if (phase !== 'GAME_OVER') {
      soundPlayedForGameOverRef.current = false;
    }
  }, [phase, room?.winningRole, currentPlayer?.role, playVictory, playDefeat]);

  useEffect(() => {
    if (room?.eliminatedPlayer) {
      try {
        playElimination();
      } catch {}
    }
  }, [room?.eliminatedPlayer, playElimination]);

  const handleAdvanceTurn = async () => {
    if (isAdvancing) return;
    setIsAdvancing(true);
    try {
      playButtonTap();
    } catch {}
    try {
      await advanceTurn();
    } catch (err) {
      console.error('Failed to advance turn:', err);
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleRematch = async () => {
    if (!isHost || isRematching) return;
    setIsRematching(true);
    try {
      const res = await rematch();
      if (res.success) {
        onReturnToLobby();
      }
    } catch (err) {
      console.error('Failed to rematch:', err);
    } finally {
      setIsRematching(false);
    }
  };

  const handleExit = async () => {
    try {
      playButtonTap();
    } catch {}
    if (phase === 'GAME_OVER') {
      setIsExitConfirmOpen(false);
      await leaveRoom();
      onExitRoom();
      return;
    }
    setIsExitConfirmOpen(true);
  };

  const confirmExit = async () => {
    setIsExitConfirmOpen(false);
    await leaveRoom();
    onExitRoom();
  };

  return (
    <div className="min-h-[100dvh] text-ink flex flex-col font-sans">
      <Header
        roomCode={room?.roomId}
        showBack
        onBack={handleExit}
        backLabel="Keluar"
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8 flex flex-col justify-center space-y-6">
        {/* Top Game Stage Header */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5">
            <span className="rubber-stamp">
              Ronde {room?.round || 1}
            </span>
            <span className="text-xs font-semibold text-ink">
              {phase === 'ROLE_REVEAL'
                ? 'Pembagian Kata Rahasia'
                : phase === 'TURN_PHASE'
                ? 'Putaran Diskusi & Petunjuk'
                : phase === 'VOTING'
                ? 'Pemungutan Suara (Voting)'
                : phase === 'MR_WHITE_GUESS'
                ? 'Tebakan Kata Mr. White'
                : 'Permainan Selesai'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {(phase === 'TURN_PHASE' || phase === 'VOTING') && currentPlayer?.role && (
              <button
                type="button"
                onClick={() => setIsRePeekOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-rule bg-cardstock hover:bg-paper-muted text-xs font-semibold text-ink shadow-print-sm active:translate-y-[1px] transition-colors"
                title="Intip kembali kata rahasiamu"
              >
                <Eye className="w-3.5 h-3.5 text-teal-dark" weight="bold" />
                <span>Kata</span>
              </button>
            )}
            {currentPlayer?.role && (
              <RoleBadge role={currentPlayer.role} size="sm" />
            )}
            {!isAlive && (
              <Badge variant="slate" size="sm" icon={<Skull className="w-3 h-3 text-stamp-dark" />}>
                Gugur
              </Badge>
            )}
          </div>
        </div>

        {/* PHASE 1: ROLE_REVEAL */}
        {phase === 'ROLE_REVEAL' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold font-display text-ink">
                Kartu Kata Rahasiamu
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted max-w-md mx-auto">
                Sentuh dan tahan kartu di bawah untuk melihat kata rahasiamu. Jangan biarkan pemain lain melihat!
              </p>
            </div>

            <SecretCard
              role={currentPlayer?.role}
              word={currentPlayer?.word}
              category={room?.settings.category}
            />

            <div className="flex flex-col items-center justify-center space-y-3 pt-2">
              {isHost ? (
                <Button
                  variant="primary"
                  size="lg"
                  className="max-w-xs w-full"
                  isLoading={isAdvancing}
                  onClick={handleAdvanceTurn}
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Mulai Putaran Bicara (Host)
                </Button>
              ) : (
                <div className="p-3 rounded-2xl bg-cardstock border border-rule text-center text-xs text-ink flex items-center gap-2 shadow-print-sm">
                  <span className="w-2 h-2 rounded-full bg-teal-dark" />
                  <span>Menunggu Host memulai putaran diskusi…</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* PHASE 2: TURN_PHASE (Speaking Round) */}
        {phase === 'TURN_PHASE' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Active Speaker Spotlight Card */}
            <Card
              padding="lg"
              className={cn(
                'text-center space-y-5 bg-cardstock border transition-colors duration-200',
                isCurrentSpeakerMe
                  ? 'border-teal-dark shadow-print-teal ring-1 ring-teal'
                  : 'border-rule shadow-print'
              )}
            >
              <div className="flex items-center justify-between border-b border-rule pb-3">
                <span className="text-xs font-medium text-ink-muted">
                  Pembicara {(room?.currentSpeakerIndex ?? 0) + 1} dari {livingSpeakers.length}
                </span>
                {isCurrentSpeakerMe ? (
                  <Badge variant="emerald" size="sm" pulse icon={<Microphone className="w-3.5 h-3.5" weight="bold" />}>
                    Giliranmu Bicara!
                  </Badge>
                ) : (
                  <Badge variant="slate" size="sm">
                    Mendengarkan
                  </Badge>
                )}
              </div>

              <div className="flex flex-col items-center space-y-2">
                <div className="relative">
                  <PlayerToken
                    avatar={currentSpeaker?.avatar}
                    name={currentSpeaker?.name}
                    size="xl"
                    className="mx-auto"
                  />
                  {isCurrentSpeakerMe && (
                    <span className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-teal-dark text-cardstock shadow-print-sm border-2 border-cardstock">
                      <Microphone className="w-4 h-4" weight="bold" />
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-ink">
                    {currentSpeaker?.name || 'Pemain'}
                  </h3>
                  <p className="text-xs text-ink-muted">
                    {isCurrentSpeakerMe
                      ? 'Berikan 1 petunjuk kata rahasiamu tanpa membuatnya terlalu jelas!'
                      : 'Simak petunjuk yang diberikan dan perhatikan kejanggalannya.'}
                  </p>
                </div>
              </div>

              <div className="py-2 flex justify-center">
                <CountdownTimer
                  totalSeconds={room?.settings.turnDurationSeconds || 45}
                  remainingSeconds={localSecondsRemaining}
                  variant="circular"
                  size={120}
                />
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                {isCurrentSpeakerMe ? (
                  <Button
                    variant="primary"
                    size="lg"
                    isLoading={isAdvancing}
                    onClick={handleAdvanceTurn}
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                    className="w-full sm:w-auto"
                  >
                    Selesai Bicara (Serahkan Giliran)
                  </Button>
                ) : isHost ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    isLoading={isAdvancing}
                    onClick={handleAdvanceTurn}
                    leftIcon={<Clock className="w-4 h-4" />}
                    className="text-xs text-ink-muted hover:text-ink"
                  >
                    Lewati / Lanjut Giliran (Host)
                  </Button>
                ) : null}
              </div>
            </Card>

            {/* Speaking Queue Horizontal List */}
            <div className="p-3.5 rounded-2xl bg-cardstock border border-rule space-y-2 shadow-print-sm">
              <span className="text-xs font-semibold text-ink-muted block">
                Urutan berbicara putaran ini:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {livingSpeakers.map((id, index) => {
                  const spk = players.find((p) => p.id === id);
                  const isCur = id === currentSpeakerId;
                  const isDone = index < (room?.currentSpeakerIndex ?? 0);

                  return (
                    <div
                      key={id}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap shrink-0 transition-colors',
                        isCur
                          ? 'bg-teal-light border-teal-dark text-teal-dark shadow-print-sm'
                          : isDone
                          ? 'bg-paper-muted border-rule text-ink-faint line-through'
                          : 'bg-paper border-rule text-ink'
                      )}
                    >
                      <PlayerToken avatar={spk?.avatar} name={spk?.name} size="xs" showCode={false} />
                      <span>{spk?.name}</span>
                      {isDone && <CheckCircle className="w-3 h-3 text-ink-faint" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* PHASE 3: VOTING */}
        {phase === 'VOTING' && (
          <VotingGrid
            players={players}
            currentPlayer={currentPlayer}
            onCastVote={castVote}
            isTie={tieNotification}
            roundNumber={room?.round || 1}
          />
        )}

        {/* PHASE 4: MR_WHITE_GUESS (Modal Overlay) */}
        <MrWhiteModal
          isOpen={phase === 'MR_WHITE_GUESS'}
          isMrWhite={currentPlayer?.role === 'MR_WHITE'}
          mrWhitePlayer={room?.eliminatedPlayer || players.find((p) => p.role === 'MR_WHITE')}
          onSubmitGuess={submitMrWhiteGuess}
        />

        {/* PHASE 5: GAME_OVER */}
        {phase === 'GAME_OVER' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="p-6 sm:p-8 rounded-3xl border border-rule bg-cardstock text-center space-y-4 shadow-print relative overflow-hidden">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-sun-light border border-sun flex items-center justify-center text-sun-dark shadow-print-sm">
                <Trophy className="w-7 h-7" weight="bold" />
              </div>

              <div className="space-y-2">
                <span className="rubber-stamp">
                  Hasil Pertandingan
                </span>
                <img
                  src="/assets/gameover-art.svg"
                  alt="Ilustrasi akhir permainan dengan kartu kata terbuka"
                  className="w-full max-w-md mx-auto border border-rule shadow-print-sm rounded-2xl"
                />
                <h2 className="text-2xl sm:text-4xl font-bold font-condensed tracking-tight text-ink pt-1">
                  {room?.winningRole === 'CIVILIAN'
                    ? 'Warga Sipil Menang!'
                    : room?.winningRole === 'UNDERCOVER'
                    ? 'Impostor (Undercover) Menang!'
                    : 'Mr. White Berhasil Menebak & Menang!'}
                </h2>
                <p className="text-xs sm:text-sm text-ink-muted max-w-md mx-auto">
                  {room?.winningRole === 'CIVILIAN'
                    ? 'Semua impostor dan Mr. White telah berhasil dieliminasi dari kelompok!'
                    : room?.winningRole === 'UNDERCOVER'
                    ? 'Impostor berhasil menyamarkan diri dan mengelabui warga sipil!'
                    : 'Mr. White berhasil menebak kata rahasia warga dengan tepat!'}
                </p>
              </div>

              {room?.wordPair && (
                <div className="flex flex-wrap items-center justify-center gap-6 p-4 rounded-2xl bg-paper border border-rule max-w-lg mx-auto shadow-print-sm">
                  <div className="text-center">
                    <span className="text-xs font-semibold text-ink-muted block">
                      Kata Warga
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-ink font-condensed">
                      {room.wordPair.civilianWord}
                    </span>
                  </div>
                  <span className="text-ink-muted font-bold text-sm">vs</span>
                  <div className="text-center">
                    <span className="text-xs font-semibold text-stamp-dark block">
                      Kata Impostor
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-stamp-dark font-condensed">
                      {room.wordPair.undercoverWord}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-ink font-display px-1">
                Daftar Peran Semua Pemain
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {players.map((player) => {
                  const isWinner = player.role === room?.winningRole;

                  return (
                    <div
                      key={player.id}
                      className={cn(
                        'p-3.5 rounded-2xl border flex items-center justify-between gap-3 shadow-print-sm transition-colors',
                        isWinner
                          ? 'bg-teal-light border-teal'
                          : 'bg-cardstock border-rule opacity-85'
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="shrink-0">
                          <PlayerToken avatar={player.avatar} name={player.name} size="sm" showCode={false} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-ink truncate">{player.name}</span>
                            {isWinner && (
                              <Crown className="w-3.5 h-3.5 text-sun-dark shrink-0" weight="bold" />
                            )}
                            {player.id === currentPlayer?.id && (
                              <span className="text-xs text-teal-dark font-semibold shrink-0">(Kamu)</span>
                            )}
                          </div>
                          <span className="text-xs text-ink-muted">
                            Kata: <strong className="text-ink">{player.word || 'Tidak ada'}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-1">
                        {player.role && <RoleBadge role={player.role} size="sm" />}
                        <span
                          className={cn(
                            'text-xs font-medium',
                            player.isAlive ? 'text-teal-dark' : 'text-ink-muted line-through'
                          )}
                        >
                          {player.isAlive ? 'Bertahan' : 'Tereliminasi'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              {isHost ? (
                <Button
                  variant="primary"
                  size="lg"
                  isLoading={isRematching}
                  onClick={handleRematch}
                  leftIcon={<ArrowCounterClockwise className="w-5 h-5" />}
                  className="w-full sm:w-auto"
                >
                  Main Lagi (Rematch Lobby)
                </Button>
              ) : (
                <div className="p-3 rounded-2xl bg-cardstock border border-rule text-xs text-ink flex items-center gap-2 shadow-print-sm">
                  <span className="w-2 h-2 rounded-full bg-teal-dark" />
                  <span>Menunggu Host memulai rematch…</span>
                </div>
              )}

              <Button
                variant="secondary"
                size="lg"
                onClick={handleExit}
                leftIcon={<SignOut className="w-5 h-5" />}
                className="w-full sm:w-auto"
              >
                Keluar ke Menu Utama
              </Button>
            </div>
          </motion.div>
        )}
      </main>

      <Modal
        isOpen={isRePeekOpen}
        onClose={() => setIsRePeekOpen(false)}
        title="Intip Kata Rahasiamu"
        subtitle={currentPlayer?.name ? `Pemain: ${currentPlayer.name}` : undefined}
        size="md"
      >
        <SecretCard
          role={currentPlayer?.role}
          word={currentPlayer?.word}
          category={room?.settings.category}
        />
      </Modal>

      <Modal
        isOpen={isExitConfirmOpen}
        onClose={() => setIsExitConfirmOpen(false)}
        title="Keluar dari Meja Permainan?"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
            Kamu akan meninggalkan meja online yang sedang berlangsung.
          </p>
          <div className="flex items-center gap-2.5 pt-1">
            <Button
              variant="secondary"
              size="md"
              className="flex-1"
              onClick={() => setIsExitConfirmOpen(false)}
            >
              Lanjut Main
            </Button>
            <Button
              variant="danger"
              size="md"
              className="flex-1"
              onClick={confirmExit}
            >
              Ya, Keluar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RoomGamePage;
