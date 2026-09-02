import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Vote,
  Skull,
  AlertTriangle,
  HelpCircle,
  Clock,
  Send,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { usePassPlay } from '../../context/PassPlayContext';
import { useGameSound } from '../../hooks/useGameSound';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Player } from '../../types/game.types';

export const PassPlayVotingView: React.FC = () => {
  const {
    players,
    phase,
    speakingOrder,
    round,
    settings,
    votes,
    isTieLastRound,
    tieMessage,
    consecutiveTies,
    pendingEliminatedPlayer,
    startVotingPhase,
    castVote,
    clearVotes,
    processElimination,
    submitMrWhiteGuess,
    skipMrWhiteGuess,
  } = usePassPlay();

  const { playVoteBuzzer, playElimination, playVictory, playDefeat } = useGameSound();

  // Voting Selection State
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [votingMode, setVotingMode] = useState<'consensus' | 'individual'>('consensus');
  const [currentVoterId, setCurrentVoterId] = useState<string | null>(null);

  // Table Discussion timer
  const [discussionSeconds, setDiscussionSeconds] = useState<number>(
    settings.turnDurationSeconds > 0 ? settings.turnDurationSeconds * 2 : 0
  );

  // Mr White Guess Modal State
  const [mrWhiteGuessInput, setMrWhiteGuessInput] = useState('');
  const [mrWhiteTimerSeconds, setMrWhiteTimerSeconds] = useState(45);

  const alivePlayers = players.filter((p) => p.isAlive);
  const orderedAlivePlayers = speakingOrder
    .map((id) => players.find((p) => p.id === id))
    .filter((p): p is Player => !!p && p.isAlive);

  const votingStartRound = settings.votingStartRound || 2;
  const isWarmingUpRound = round < votingStartRound;
  const maxTies = settings.maxConsecutiveTies || 3;

  // Reset timer on phase change
  useEffect(() => {
    if (phase === 'TURN_CLUE') {
      setDiscussionSeconds(settings.turnDurationSeconds > 0 ? settings.turnDurationSeconds * 2 : 0);
    }
  }, [phase, round, settings.turnDurationSeconds]);

  // Discussion Countdown ticker
  useEffect(() => {
    if (phase !== 'TURN_CLUE' || discussionSeconds <= 0) return;

    const interval = setInterval(() => {
      setDiscussionSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, discussionSeconds]);

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

  const handleSelectSuspect = (playerId: string) => {
    if (votingMode === 'consensus') {
      setSelectedSuspectId(playerId);
      setIsConfirmModalOpen(true);
    } else if (votingMode === 'individual') {
      if (currentVoterId) {
        castVote(currentVoterId, playerId);
        playVoteBuzzer();
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
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold font-display uppercase tracking-wider text-amber-300">
                  Suara Seri — Lewati Eliminasi!
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Seri {consecutiveTies}/{maxTies}
                </span>
              </div>
              <p className="text-xs text-amber-200/90 mt-0.5">{tieMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PHASE 1: TURN CLUE (TABLE DISCUSSION) */}
      {phase === 'TURN_CLUE' && (
        <div className="space-y-6">
          {/* Header Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant={isWarmingUpRound ? 'violet' : 'cyan'} size="md" pulse>
                  Ronde {round} {isWarmingUpRound ? '• Pemanasan Clue' : '• Putaran Diskusi'}
                </Badge>
                <span className="text-xs font-mono text-slate-400">
                  {alivePlayers.length} Pemain Aktif
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                {isWarmingUpRound
                  ? 'Pemanasan: Berikan 1 Clue Bergantian'
                  : 'Putaran Clue & Analisis Meja'}
              </h2>
            </div>

            {isWarmingUpRound ? (
              <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/30 self-start sm:self-center">
                Voting dibuka pada Ronde {votingStartRound}
              </span>
            ) : (
              <Button
                variant="outline"
                size="xs"
                onClick={startVotingPhase}
                rightIcon={<Vote className="w-3.5 h-3.5" />}
                className="text-xs self-start sm:self-center"
              >
                Buka Voting Sekarang
              </Button>
            )}
          </div>

          {/* Table Guide Card */}
          <Card glow="cyan" className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-bold font-display uppercase tracking-wider text-slate-200">
                  Urutan Bicara di Meja Nyata
                </span>
              </div>
              {discussionSeconds > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{discussionSeconds}s</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400">
              Silakan bicara berurutan dari nomor 1 sampai selesai secara langsung di meja. Berikan 1 kata/kalimat petunjuk tanpa membocorkan kata rahasiamu!
            </p>

            {/* Speaking Order Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {orderedAlivePlayers.map((p, idx) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-black text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-2xl">{p.avatar}</span>
                    <div>
                      <p className="text-sm font-bold text-slate-200">{p.name}</p>
                      <p className="text-[10px] font-mono text-slate-500">Giliran #{idx + 1}</p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-slate-600" />
                </div>
              ))}
            </div>

            {/* Action CTA */}
            <div className="pt-3 border-t border-white/10">
              {isWarmingUpRound ? (
                <Button
                  variant="primary"
                  size="xl"
                  fullWidth
                  onClick={() => {
                    startVotingPhase();
                  }}
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  className="shadow-xl shadow-purple-500/20 text-base py-4"
                >
                  Semua Sudah Beri Clue → Lanjut ke Ronde {round + 1}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="xl"
                  fullWidth
                  onClick={startVotingPhase}
                  rightIcon={<Vote className="w-5 h-5" />}
                  className="shadow-xl shadow-cyan-500/30 text-base py-4"
                >
                  Semua Sudah Beri Clue → Mulai Voting Eliminasi
                </Button>
              )}
            </div>
          </Card>
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
                  FASE VOTING ELIMINASI
                </Badge>
                <span className="text-xs font-mono text-slate-400">
                  Ronde {round} • {alivePlayers.length} Pemain Hidup
                </span>
                {consecutiveTies > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    Seri: {consecutiveTies}/{maxTies}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                Pilih Pemain Yang Dicurigai
              </h2>
              <p className="text-xs text-slate-400">
                Diskusikan bersama di meja dan pilih pemain yang diduga sebagai Impostor atau Buta Kata.
              </p>
            </div>

            {/* Voting Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-950/80 border border-white/10 self-start sm:self-center">
              <button
                type="button"
                onClick={() => {
                  setVotingMode('consensus');
                  clearVotes();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  votingMode === 'consensus'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Keputusan Bersama
              </button>
              <button
                type="button"
                onClick={() => {
                  setVotingMode('individual');
                  setCurrentVoterId(alivePlayers[0]?.id || null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  votingMode === 'individual'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Voting Rahasia (Tally)
              </button>
            </div>
          </div>

          {/* Individual Voter Guidance Banner (if in Individual mode) */}
          {votingMode === 'individual' && currentVoterId && (
            <Card className="p-4 bg-rose-500/10 border-rose-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{players.find((p) => p.id === currentVoterId)?.avatar}</span>
                <div>
                  <span className="text-xs font-mono text-rose-300 uppercase tracking-wider font-semibold">
                    Giliran Memberi Suara:
                  </span>
                  <p className="text-sm font-bold text-white">
                    {players.find((p) => p.id === currentVoterId)?.name}
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {Object.keys(votes).length} / {alivePlayers.length} Suara Masuk
              </span>
            </Card>
          )}

          {/* Suspect Players Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {alivePlayers.map((player) => {
              const isSelected = selectedSuspectId === player.id;
              const voteCount = Object.values(votes).filter((id) => id === player.id).length;

              return (
                <motion.div
                  key={player.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectSuspect(player.id)}
                  className={`relative p-4 sm:p-5 rounded-2xl border text-center cursor-pointer transition-all duration-200 flex flex-col items-center space-y-3 ${
                    isSelected
                      ? 'bg-rose-500/20 border-rose-400 shadow-[0_0_25px_-3px_rgba(244,63,94,0.5)] ring-2 ring-rose-400'
                      : 'bg-slate-900/80 border-white/10 hover:border-rose-500/40 hover:bg-slate-800/80'
                  }`}
                >
                  {/* Vote Badge if individual mode */}
                  {votingMode === 'individual' && voteCount > 0 && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono font-black text-xs shadow-md">
                      {voteCount} vote
                    </span>
                  )}

                  <span className="text-4xl sm:text-5xl">{player.avatar}</span>

                  <div className="space-y-0.5 w-full">
                    <p className="text-sm sm:text-base font-bold text-white truncate px-1">
                      {player.name}
                    </p>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      {votingMode === 'consensus' ? 'Klik untuk eliminasi' : 'Pilih sebagai sasaran'}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Individual Mode Complete CTA */}
          {votingMode === 'individual' && Object.keys(votes).length >= alivePlayers.length && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 text-center space-y-3">
              <p className="text-sm font-bold text-slate-200">
                Semua pemain telah memberikan suara!
              </p>
              <Button
                variant="danger"
                size="lg"
                onClick={handleCalculateTallyElimination}
                rightIcon={<Skull className="w-5 h-5" />}
                className="shadow-xl shadow-rose-500/30"
              >
                Hitung Hasil & Eliminasi Pemain
              </Button>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Confirm Consensus Elimination */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Konfirmasi Eliminasi"
        size="sm"
      >
        <div className="space-y-5 text-center py-2">
          {selectedSuspectId && (
            <div className="space-y-3">
              <span className="text-6xl block">
                {players.find((p) => p.id === selectedSuspectId)?.avatar}
              </span>
              <div>
                <p className="text-lg font-black font-display text-white">
                  {players.find((p) => p.id === selectedSuspectId)?.name}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Apakah seluruh pemain sepakat untuk mengeliminasi pemain ini?
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={() => setIsConfirmModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="md"
              fullWidth
              onClick={handleConfirmConsensusElimination}
              leftIcon={<Skull className="w-4 h-4" />}
            >
              Ya, Eliminasi!
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: Mr White Emergency Guess Modal */}
      <Modal
        isOpen={phase === 'MR_WHITE_GUESS'}
        onClose={() => {}}
        title="🚨 INTERSEPSI DARURAT: MR. WHITE"
        size="md"
      >
        <div className="space-y-5 text-center py-2">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-400 text-purple-300 flex items-center justify-center mx-auto text-3xl shadow-[0_0_25px_-3px_rgba(168,85,247,0.5)]">
            <HelpCircle className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl font-black font-display text-purple-300">
              {pendingEliminatedPlayer?.name} adalah Buta Kata (Mr. White)!
            </h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              Mr. White tereliminasi, tapi memiliki <span className="text-purple-300 font-bold">1 kesempatan tebak</span> kata rahasia Civilian. Jika tebakan benar, <span className="text-purple-400 font-black">MR. WHITE MENANG SEKETIKA!</span>
            </p>
          </div>

          {/* 45s Countdown */}
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-purple-300 bg-purple-500/10 py-1.5 px-3 rounded-full border border-purple-500/30 max-w-xs mx-auto">
            <Clock className="w-4 h-4 animate-spin text-purple-400" />
            <span>Sisa Waktu Menebak: {mrWhiteTimerSeconds}s</span>
          </div>

          {/* Guess Input */}
          <div className="space-y-3 pt-2">
            <input
              type="text"
              value={mrWhiteGuessInput}
              onChange={(e) => setMrWhiteGuessInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmitMrWhite();
              }}
              placeholder="Ketik tebakan kata Warga di sini..."
              autoFocus
              className="w-full px-4 py-3.5 rounded-2xl bg-slate-950 border border-purple-500/40 text-white placeholder-slate-500 text-center font-display text-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 shadow-inner"
            />

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="md"
                onClick={skipMrWhiteGuess}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Menyerah / Lewati
              </Button>
              <Button
                variant="accent"
                size="lg"
                fullWidth
                disabled={!mrWhiteGuessInput.trim()}
                onClick={handleSubmitMrWhite}
                rightIcon={<Send className="w-4 h-4" />}
                className="shadow-xl shadow-purple-500/30"
              >
                Kirim Tebakan
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
