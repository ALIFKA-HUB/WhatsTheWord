import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  ArrowRight,
  Vote,
  Skull,
  AlertTriangle,
  HelpCircle,
  Clock,
  Send,
  Users,
} from 'lucide-react';
import { usePassPlay } from '../../context/PassPlayContext';
import { useGameSound } from '../../hooks/useGameSound';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge, RoleBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { CountdownTimer } from './CountdownTimer';
import { Player } from '../../types/game.types';

export const PassPlayVotingView: React.FC = () => {
  const {
    players,
    phase,
    speakingOrder,
    currentSpeakerIndex,
    activeSpeakerId,
    round,
    settings,
    votes,
    isTieLastRound,
    tieMessage,
    pendingEliminatedPlayer,
    nextSpeaker,
    startVotingPhase,
    castVote,
    clearVotes,
    processElimination,
    submitMrWhiteGuess,
    skipMrWhiteGuess,
  } = usePassPlay();

  const { playVoteBuzzer, playElimination, playVictory, playDefeat } = useGameSound();

  // Local turn timer for the active speaker
  const [turnTimerSeconds, setTurnTimerSeconds] = useState<number>(settings.turnDurationSeconds || 45);

  // Voting Selection State
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [votingMode, setVotingMode] = useState<'consensus' | 'individual'>('consensus');
  const [currentVoterId, setCurrentVoterId] = useState<string | null>(null);

  // Mr White Guess Modal State
  const [mrWhiteGuessInput, setMrWhiteGuessInput] = useState('');
  const [mrWhiteTimerSeconds, setMrWhiteTimerSeconds] = useState(45);

  const alivePlayers = players.filter((p) => p.isAlive);
  const activeSpeaker = players.find((p) => p.id === activeSpeakerId) || alivePlayers[0];
  const isLastSpeaker = currentSpeakerIndex >= speakingOrder.filter(id => players.find(p => p.id === id)?.isAlive).length - 1;

  // Reset speaker timer on speaker change
  useEffect(() => {
    if (phase === 'TURN_CLUE') {
      setTurnTimerSeconds(settings.turnDurationSeconds || 45);
    }
  }, [activeSpeakerId, phase, settings.turnDurationSeconds]);

  // Turn Clue Countdown ticker
  useEffect(() => {
    if (phase !== 'TURN_CLUE' || settings.turnDurationSeconds === 0) return;

    const interval = setInterval(() => {
      setTurnTimerSeconds((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, settings.turnDurationSeconds, activeSpeakerId]);

  // Mr White 45s countdown timer ticker
  useEffect(() => {
    if (phase !== 'MR_WHITE_GUESS') return;

    setMrWhiteTimerSeconds(45);
    setMrWhiteGuessInput('');

    const interval = setInterval(() => {
      setMrWhiteTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  // Mr White time out auto submit/skip
  useEffect(() => {
    if (phase === 'MR_WHITE_GUESS' && mrWhiteTimerSeconds === 0) {
      if (mrWhiteGuessInput.trim()) {
        handleSubmitMrWhite();
      } else {
        skipMrWhiteGuess();
      }
    }
  }, [mrWhiteTimerSeconds, phase]);

  const handleNextSpeakerClick = () => {
    nextSpeaker();
  };

  const handleSelectSuspect = (playerId: string) => {
    if (votingMode === 'consensus') {
      setSelectedSuspectId(playerId);
      setIsConfirmModalOpen(true);
    } else if (votingMode === 'individual') {
      if (currentVoterId) {
        castVote(currentVoterId, playerId);
        playVoteBuzzer();
        // Advance to next voter
        const nextVoter = alivePlayers.find((p) => p.id !== currentVoterId && !votes[p.id]);
        setCurrentVoterId(nextVoter ? nextVoter.id : null);
      }
    }
  };

  const handleConfirmConsensusElimination = () => {
    if (!selectedSuspectId) return;
    setIsConfirmModalOpen(false);

    try {
      playElimination();
    } catch {
      // ignore
    }

    processElimination(selectedSuspectId);
    setSelectedSuspectId(null);
  };

  const handleCalculateTallyElimination = () => {
    try {
      playElimination();
    } catch {
      // ignore
    }
    processElimination();
  };

  const handleSubmitMrWhite = () => {
    if (!mrWhiteGuessInput.trim()) return;
    const result = submitMrWhiteGuess(mrWhiteGuessInput.trim());
    if (result.isCorrect) {
      try {
        playVictory();
      } catch {
        // ignore
      }
    } else {
      try {
        playDefeat();
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Tie Breaker Banner (Instant Skip) */}
      <AnimatePresence>
        {isTieLastRound && tieMessage && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 flex items-center gap-3 shadow-lg shadow-amber-950/30"
          >
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold font-display uppercase tracking-wider text-amber-300">
                Aturan Instant Skip Aktif!
              </h4>
              <p className="text-xs text-amber-200/90">{tieMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PHASE 1: TURN CLUE (DISCUSSION) */}
      {phase === 'TURN_CLUE' && (
        <div className="space-y-6">
          {/* Header Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="cyan" size="md" pulse>
                Ronde {round}
              </Badge>
              <span className="text-xs font-mono text-slate-400">
                Fase Pemberian Petunjuk (Clue)
              </span>
            </div>

            <Button
              variant="outline"
              size="xs"
              onClick={startVotingPhase}
              rightIcon={<Vote className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Langsung ke Voting
            </Button>
          </div>

          {/* Active Speaker Spotlight Card */}
          <Card glow="cyan" className="p-6 sm:p-8 text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <span className="text-xs font-mono text-slate-500">
                {currentSpeakerIndex + 1} / {speakingOrder.filter(id => players.find(p => p.id === id)?.isAlive).length} Pembicara
              </span>
            </div>

            {/* Avatar Spotlight */}
            <div className="flex flex-col items-center space-y-3">
              <div className="relative">
                <motion.div
                  key={activeSpeaker?.id}
                  initial={{ scale: 0.8, rotate: -5 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-cyan-500/10 border-2 border-cyan-400 flex items-center justify-center text-5xl sm:text-6xl shadow-[0_0_35px_-5px_rgba(6,182,212,0.5)]"
                >
                  {activeSpeaker?.avatar}
                </motion.div>
                <span className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-cyan-400 text-slate-950 shadow-md">
                  <Mic className="w-4 h-4 animate-pulse" />
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
                  GILIRAN BICARA SEKARANG:
                </span>
                <h2 className="text-2xl sm:text-3xl font-black font-display text-white">
                  {activeSpeaker?.name}
                </h2>
                <p className="text-xs text-slate-400 font-sans max-w-sm mx-auto">
                  Berikan 1 kata atau kalimat petunjuk yang mendeskripsikan kata rahasiamu!
                </p>
              </div>
            </div>

            {/* Countdown Timer (if enabled) */}
            {settings.turnDurationSeconds > 0 ? (
              <div className="py-2">
                <CountdownTimer
                  totalSeconds={settings.turnDurationSeconds}
                  remainingSeconds={turnTimerSeconds}
                  size={100}
                  strokeWidth={7}
                  soundEnabled
                  variant="circular"
                />
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                Waktu Giliran Bebas
              </div>
            )}

            {/* Next Speaker CTA */}
            <div className="pt-2 max-w-sm mx-auto">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleNextSpeakerClick}
                rightIcon={isLastSpeaker ? <Vote className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                className="shadow-xl shadow-cyan-500/30 text-base py-3.5"
              >
                {isLastSpeaker ? 'Selesai & Mulai Voting' : 'Lanjut ke Pembicara Berikutnya'}
              </Button>
            </div>
          </Card>

          {/* Speaking Order List */}
          <div className="space-y-2">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
              Urutan Bicara Ronde {round}:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {speakingOrder
                .map((id) => players.find((p) => p.id === id))
                .filter((p): p is Player => !!p && p.isAlive)
                .map((p, idx) => {
                  const isCurrent = idx === currentSpeakerIndex;
                  const isPast = idx < currentSpeakerIndex;

                  return (
                    <div
                      key={p.id}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shrink-0 transition-all ${
                        isCurrent
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md ring-1 ring-cyan-400 font-bold'
                          : isPast
                          ? 'bg-slate-900/40 border-white/5 text-slate-500'
                          : 'bg-slate-900/80 border-white/10 text-slate-300'
                      }`}
                    >
                      <span className="text-sm">{p.avatar}</span>
                      <span className="text-xs truncate max-w-[100px]">{p.name}</span>
                      {isCurrent && <Mic className="w-3 h-3 text-cyan-400 animate-pulse ml-1" />}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* PHASE 2: VOTING & ELIMINATION */}
      {phase === 'VOTING' && (
        <div className="space-y-6">
          {/* Voting Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="crimson" size="md" pulse>
                  FASE VOTING
                </Badge>
                <span className="text-xs font-mono text-slate-400">
                  Ronde {round} • {alivePlayers.length} Pemain Hidup
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                Pilih Pemain Yang Dicurigai
              </h2>
            </div>

            {/* Voting Mode Switcher */}
            <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setVotingMode('consensus');
                  clearVotes();
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  votingMode === 'consensus'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Konsensus Langsung
              </button>
              <button
                type="button"
                onClick={() => {
                  setVotingMode('individual');
                  setCurrentVoterId(alivePlayers[0]?.id || null);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  votingMode === 'individual'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tally 1 per 1
              </button>
            </div>
          </div>

          {/* Mode Instructions */}
          {votingMode === 'individual' && (
            <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-300">
                  Giliran memilih:{' '}
                  <strong className="text-cyan-300">
                    {alivePlayers.find((p) => p.id === currentVoterId)?.name || 'Semua Selesai'}
                  </strong>
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {Object.keys(votes).length}/{alivePlayers.length} Suara
              </span>
            </div>
          )}

          {/* Interactive Suspect Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {alivePlayers.map((p) => {
              const voteCount = Object.values(votes).filter((targetId) => targetId === p.id).length;

              return (
                <motion.button
                  key={p.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectSuspect(p.id)}
                  className="group relative flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-rose-500/50 hover:bg-slate-900/95 transition-all text-left shadow-lg hover:shadow-rose-950/40"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl group-hover:scale-110 transition-transform">
                      {p.avatar}
                    </span>
                    <div>
                      <h4 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
                        {p.name}
                      </h4>
                      <span className="text-[11px] font-mono text-slate-400">
                        {votingMode === 'consensus' ? 'Klik untuk eliminasi' : 'Pilih sebagai target'}
                      </span>
                    </div>
                  </div>

                  {/* Vote Count Indicator for Individual Mode */}
                  {votingMode === 'individual' && voteCount > 0 && (
                    <span className="px-2.5 py-1 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold">
                      {voteCount} Vote
                    </span>
                  )}

                  {/* Red Skull icon indicator */}
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5 text-slate-500 group-hover:text-rose-400 group-hover:border-rose-500/30 transition-all">
                    <Skull className="w-4 h-4" />
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Individual Mode Finalize Action */}
          {votingMode === 'individual' && (
            <div className="pt-3 flex items-center justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={clearVotes}>
                Reset Suara
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleCalculateTallyElimination}
                disabled={Object.keys(votes).length === 0}
                leftIcon={<Skull className="w-4 h-4" />}
              >
                Hitung & Eliminasi Hasil Tally
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal for Consensus Elimination */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Konfirmasi Eliminasi Pemain"
        subtitle="Pemain yang tereliminasi akan diungkap atau Mr. White diberi kesempatan tebak kata."
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={() => setIsConfirmModalOpen(false)}>
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmConsensusElimination}
              leftIcon={<Skull className="w-4 h-4" />}
            >
              Ya, Eliminasi Sekarang
            </Button>
          </div>
        }
      >
        {selectedSuspectId && (
          <div className="flex flex-col items-center text-center space-y-3 py-3">
            <div className="text-5xl">
              {players.find((p) => p.id === selectedSuspectId)?.avatar}
            </div>
            <div>
              <p className="text-lg font-bold text-white">
                {players.find((p) => p.id === selectedSuspectId)?.name}
              </p>
              <p className="text-xs text-rose-300/80">
                Apakah semua pemain sepakat mengeliminasi pemain ini?
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* MR. WHITE 45s GUESS MODAL */}
      <Modal
        isOpen={phase === 'MR_WHITE_GUESS'}
        onClose={() => {}} // Block outside close during high-tension moment
        closeOnOutsideClick={false}
        closeOnEscape={false}
        showCloseButton={false}
        title={
          <div className="flex items-center gap-2 text-purple-400">
            <HelpCircle className="w-5 h-5 animate-pulse" />
            <span>MR. WHITE INTERCEPT!</span>
          </div>
        }
        subtitle="Pemain Buta Kata (Mr. White) terpilih untuk dieliminasi!"
        size="md"
      >
        <div className="space-y-5 py-2">
          {/* Mr. White Profile Header */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30">
            <span className="text-4xl">{pendingEliminatedPlayer?.avatar}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white">
                  {pendingEliminatedPlayer?.name}
                </span>
                <RoleBadge role="MR_WHITE" size="sm" />
              </div>
              <p className="text-xs text-purple-200/80">
                Kamu memiliki kesempatan terakhir! Tebak kata rahasia milik Warga untuk memenangkan game seketika!
              </p>
            </div>
          </div>

          {/* 45s Countdown */}
          <div className="flex justify-center">
            <CountdownTimer
              totalSeconds={45}
              remainingSeconds={mrWhiteTimerSeconds}
              size={90}
              strokeWidth={7}
              soundEnabled
              variant="compact"
            />
          </div>

          {/* Word Guess Input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Ketik Kata Rahasia Warga:
            </label>
            <div className="relative">
              <input
                type="text"
                value={mrWhiteGuessInput}
                onChange={(e) => setMrWhiteGuessInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmitMrWhite();
                }}
                placeholder="Contoh: Kopi, Martabak, Laptop..."
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-purple-500/40 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 text-base font-bold"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 gap-3">
            <Button variant="ghost" size="sm" onClick={skipMrWhiteGuess}>
              Menyerah (Skip)
            </Button>
            <Button
              variant="accent"
              size="md"
              onClick={handleSubmitMrWhite}
              disabled={!mrWhiteGuessInput.trim()}
              rightIcon={<Send className="w-4 h-4" />}
              className="font-bold shadow-lg shadow-purple-500/30"
            >
              Kirim Tebakan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PassPlayVotingView;
