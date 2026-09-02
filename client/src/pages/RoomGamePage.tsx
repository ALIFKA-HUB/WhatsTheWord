import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Mic,
  Trophy,
  RotateCcw,
  LogOut,
  CheckCircle2,
  Skull,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
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
  const soundPlayedForGameOverRef = useRef(false);


  const phase = room?.phase || 'LOBBY';
  const players = room?.players || [];
  const isHost = currentPlayer?.isHost ?? false;
  const isAlive = currentPlayer?.isAlive ?? true;

  // Speaker tracking
  const livingSpeakers = (room?.speakingOrder || []).filter((id) =>
    players.find((p) => p.id === id)?.isAlive
  );
  const currentSpeakerId = livingSpeakers[room?.currentSpeakerIndex ?? 0];
  const currentSpeaker = players.find((p) => p.id === currentSpeakerId);
  const isCurrentSpeakerMe = currentSpeaker?.id === currentPlayer?.id;

  // Turn timer countdown effect
  useEffect(() => {
    if (phase !== 'TURN_PHASE') return;

    setLocalSecondsRemaining(room?.activeTurnRemainingSeconds ?? 45);

    const timer = setInterval(() => {
      setLocalSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // If speaker or host, advance turn automatically when timer runs out
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

  // Sync turn remaining seconds from socket state if changed externally
  useEffect(() => {
    if (room?.activeTurnRemainingSeconds !== undefined) {
      setLocalSecondsRemaining(room.activeTurnRemainingSeconds);
    }
  }, [room?.activeTurnRemainingSeconds]);

  // Phase transition handlers
  useEffect(() => {
    if (phase === 'LOBBY') {
      onReturnToLobby();
    }
  }, [phase, onReturnToLobby]);

  // Sound effects on Game Over
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

  // Sound effects on Elimination
  useEffect(() => {
    if (room?.eliminatedPlayer) {
      try {
        playElimination();
      } catch {}
    }
  }, [room?.eliminatedPlayer, playElimination]);

  // Handle Advance Turn Action
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

  // Handle Rematch
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

  // Handle Exit
  const handleExit = async () => {
    try {
      playButtonTap();
    } catch {}
    await leaveRoom();
    onExitRoom();
  };

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        roomCode={room?.roomId}
        showBack
        onBack={handleExit}
        backLabel="Keluar"
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8 flex flex-col justify-center space-y-6">
        {/* Top Game Stage Header */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              Ronde {room?.round || 1}
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-xs font-semibold text-slate-300">
              {phase === 'ROLE_REVEAL'
                ? 'Pembagian Peran Rahasia'
                : phase === 'TURN_PHASE'
                ? 'Putaran Diskusi & Penjelasan'
                : phase === 'VOTING'
                ? 'Pemungutan Suara (Voting)'
                : phase === 'MR_WHITE_GUESS'
                ? 'Tebakan Darurat Mr. White'
                : 'Permainan Selesai'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {currentPlayer?.role && (
              <RoleBadge role={currentPlayer.role} size="sm" />
            )}
            {!isAlive && (
              <Badge variant="slate" size="sm" icon={<Skull className="w-3 h-3 text-rose-400" />}>
                Eliminasi
              </Badge>
            )}
          </div>
        </div>

        {/* PHASE 1: ROLE_REVEAL */}
        {phase === 'ROLE_REVEAL' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-xl sm:text-2xl font-black font-display text-slate-100">
                Kartu Identitas Rahasiamu
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Tahan tombol kartu di bawah untuk melihat peran dan kata rahasiamu. Jangan biarkan pemain lain melihat!
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
                  className="max-w-xs w-full shadow-lg shadow-cyan-500/30"
                  isLoading={isAdvancing}
                  onClick={handleAdvanceTurn}
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Mulai Putaran Bicara (Host)
                </Button>
              ) : (
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 text-center text-xs text-slate-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>Menunggu Host memulai putaran diskusi...</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* PHASE 2: TURN_PHASE (Speaking Round) */}
        {phase === 'TURN_PHASE' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Active Speaker Spotlight Card */}
            <Card
              glow={isCurrentSpeakerMe ? 'cyan' : 'none'}
              padding="lg"
              className={cn(
                'text-center space-y-5 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border transition-all duration-300',
                isCurrentSpeakerMe
                  ? 'border-cyan-400 shadow-[0_0_35px_-5px_rgba(6,182,212,0.4)]'
                  : 'border-white/10'
              )}
            >
              {/* Turn indicator count */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-mono text-slate-400">
                  Pembicara {(room?.currentSpeakerIndex ?? 0) + 1} dari {livingSpeakers.length}
                </span>
                {isCurrentSpeakerMe ? (
                  <Badge variant="cyan" size="sm" pulse icon={<Mic className="w-3.5 h-3.5" />}>
                    Giliranmu Bicara!
                  </Badge>
                ) : (
                  <Badge variant="slate" size="sm">
                    Mendengarkan
                  </Badge>
                )}
              </div>

              {/* Speaker Avatar & Name */}
              <div className="flex flex-col items-center space-y-2">
                <motion.div
                  animate={isCurrentSpeakerMe ? { scale: [1, 1.08, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1.8 }}
                  className={cn(
                    'w-20 h-20 rounded-3xl flex items-center justify-center text-4xl border relative shadow-xl',
                    isCurrentSpeakerMe
                      ? 'bg-cyan-500/20 border-cyan-400 shadow-cyan-500/30'
                      : 'bg-slate-900 border-white/10'
                  )}
                >
                  {currentSpeaker?.avatar || '🕵️'}
                  <span className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-slate-950 border border-cyan-500/40 text-cyan-400">
                    <Mic className="w-4 h-4 animate-pulse" />
                  </span>
                </motion.div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black font-display text-slate-100">
                    {currentSpeaker?.name || 'Pemain'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isCurrentSpeakerMe
                      ? 'Berikan 1 petunjuk kata rahasiamu tanpa membuatnya terlalu jelas!'
                      : 'Simak petunjuk yang diberikan dan perhatikan kejanggalannya.'}
                  </p>
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="py-2 flex justify-center">
                <CountdownTimer
                  totalSeconds={room?.settings.turnDurationSeconds || 45}
                  remainingSeconds={localSecondsRemaining}
                  variant="circular"
                  size={120}
                />
              </div>

              {/* Speaker / Host Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                {isCurrentSpeakerMe ? (
                  <Button
                    variant="primary"
                    size="lg"
                    isLoading={isAdvancing}
                    onClick={handleAdvanceTurn}
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                    className="w-full sm:w-auto shadow-lg shadow-cyan-500/30 font-bold"
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
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    Lewati / Lanjut Giliran (Host Control)
                  </Button>
                ) : null}
              </div>
            </Card>

            {/* Speaking Queue Horizontal List */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
              <span className="text-[11px] font-mono uppercase text-slate-500 block">
                Urutan Berbicara Ronde Ini:
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
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap shrink-0 transition-all',
                        isCur
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm ring-1 ring-cyan-400'
                          : isDone
                          ? 'bg-slate-950/40 border-white/5 text-slate-600 line-through'
                          : 'bg-slate-900/70 border-white/10 text-slate-300'
                      )}
                    >
                      <span>{spk?.avatar}</span>
                      <span>{spk?.name}</span>
                      {isDone && <CheckCircle2 className="w-3 h-3 text-slate-600" />}
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Victory / Defeat Big Banner */}
            <div
              className={cn(
                'p-6 sm:p-8 rounded-3xl border text-center space-y-4 shadow-2xl relative overflow-hidden',
                room?.winningRole === 'CIVILIAN'
                  ? 'bg-cyan-950/40 border-cyan-500/50 shadow-cyan-950/50'
                  : room?.winningRole === 'UNDERCOVER'
                  ? 'bg-rose-950/40 border-rose-500/50 shadow-rose-950/50'
                  : 'bg-purple-950/40 border-purple-500/50 shadow-purple-950/50'
              )}
            >
              <div className="w-16 h-16 mx-auto rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl shadow-inner">
                <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">
                  HASIL PERTANDINGAN
                </span>
                <h2 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white">
                  {room?.winningRole === 'CIVILIAN'
                    ? 'WARGA SIPIL MENANG!'
                    : room?.winningRole === 'UNDERCOVER'
                    ? 'IMPOSTOR (UNDERCOVER) MENANG!'
                    : 'MR. WHITE BERHASIL MENEBAK & MENANG!'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                  {room?.winningRole === 'CIVILIAN'
                    ? 'Semua impostor & Mr. White telah berhasil dieliminasi dari kelompok!'
                    : room?.winningRole === 'UNDERCOVER'
                    ? 'Impostor berhasil menyamarkan diri dan mengelabui warga sipil!'
                    : 'Mr. White berhasil menebak kata rahasia warga dengan tepat!'}
                </p>
              </div>

              {/* Word Pair Summary Reveal */}
              {room?.wordPair && (
                <div className="flex flex-wrap items-center justify-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/10 max-w-lg mx-auto">
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-mono text-cyan-400 block font-bold">
                      Kata Warga
                    </span>
                    <span className="text-base sm:text-lg font-black text-white font-mono uppercase">
                      {room.wordPair.civilianWord}
                    </span>
                  </div>
                  <span className="text-slate-600 font-bold text-lg">vs</span>
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-mono text-rose-400 block font-bold">
                      Kata Undercover
                    </span>
                    <span className="text-base sm:text-lg font-black text-white font-mono uppercase">
                      {room.wordPair.undercoverWord}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* All Players Identity Reveal Table */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-200 font-display px-1">
                Bongkar Identitas Semua Agen
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center text-xl shrink-0">
                        {player.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-slate-100">{player.name}</span>
                          {player.id === currentPlayer?.id && (
                            <span className="text-[10px] font-mono text-cyan-400">(Kamu)</span>
                          )}
                        </div>
                        <span className="text-xs font-mono text-slate-400">
                          Kata: {player.word || 'Tidak Ada'}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {player.role && <RoleBadge role={player.role} size="sm" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rematch & Home Navigation Actions */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              {isHost ? (
                <Button
                  variant="primary"
                  size="lg"
                  isLoading={isRematching}
                  onClick={handleRematch}
                  leftIcon={<RotateCcw className="w-5 h-5" />}
                  className="w-full sm:w-auto shadow-lg shadow-cyan-500/30"
                >
                  Main Lagi (Rematch Lobby)
                </Button>
              ) : (
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 text-xs text-slate-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>Menunggu Host memulai rematch...</span>
                </div>
              )}

              <Button
                variant="secondary"
                size="lg"
                onClick={handleExit}
                leftIcon={<LogOut className="w-5 h-5" />}
                className="w-full sm:w-auto"
              >
                Keluar ke Menu Utama
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default RoomGamePage;
