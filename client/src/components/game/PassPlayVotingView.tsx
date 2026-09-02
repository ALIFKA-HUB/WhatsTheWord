import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Vote,
  AlertTriangle,
  Send,
  Users,
} from 'lucide-react';
import { usePassPlay } from '../../context/PassPlayContext';
import { useGameSound } from '../../hooks/useGameSound';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Player } from '../../types/game.types';
import { cn } from '../../utils/cn';

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

  const { playVoteBuzzer, playElimination } = useGameSound();

  // Voting Selection State
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [votingMode, setVotingMode] = useState<'consensus' | 'individual'>('consensus');
  const [currentVoterId, setCurrentVoterId] = useState<string | null>(null);

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

  // Handle auto-skip when Mr White timer expires
  useEffect(() => {
    if (phase === 'MR_WHITE_GUESS' && mrWhiteTimerSeconds === 0) {
      skipMrWhiteGuess();
    }
  }, [phase, mrWhiteTimerSeconds, skipMrWhiteGuess]);

  // Handle Consensus Quick Eliminate
  const handleOpenConfirmModal = (playerId: string) => {
    setSelectedSuspectId(playerId);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmElimination = () => {
    if (!selectedSuspectId) return;
    try {
      playElimination();
    } catch {
      // ignore
    }
    processElimination(selectedSuspectId);
    setIsConfirmModalOpen(false);
    setSelectedSuspectId(null);
  };

  // Handle Secret Individual Vote Cast
  const handleCastIndividualVote = (targetId: string) => {
    if (!currentVoterId) return;
    try {
      playVoteBuzzer();
    } catch {
      // ignore
    }
    castVote(currentVoterId, targetId);

    // Find next alive voter
    const currentIdx = alivePlayers.findIndex((p) => p.id === currentVoterId);
    if (currentIdx < alivePlayers.length - 1) {
      setCurrentVoterId(alivePlayers[currentIdx + 1].id);
    } else {
      setCurrentVoterId(null);
    }
  };

  const allVoted = alivePlayers.every((p) => votes[p.id]);

  const handleMrWhiteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mrWhiteGuessInput.trim()) return;
    submitMrWhiteGuess(mrWhiteGuessInput.trim());
  };

  const currentVoterPlayer = alivePlayers.find((p) => p.id === currentVoterId);

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 font-sans">
      {/* 1. ROUND & GAME STATUS HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono font-bold text-base text-zinc-100">
            R{round}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-zinc-100">
                {isWarmingUpRound
                  ? 'Pemanasan (Beri 1 Petunjuk)'
                  : phase === 'TURN_CLUE'
                  ? 'Putaran Diskusi Meja'
                  : 'Fase Voting Eliminasi'}
              </span>
              {isWarmingUpRound && (
                <Badge variant="amber" size="sm">
                  Pemanasan
                </Badge>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              {alivePlayers.length} Pemain Bertahan · Kategori: {settings.category}
            </p>
          </div>
        </div>

        {/* Ties Tracker Badge */}
        {consecutiveTies > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/30 border border-amber-900/40 text-amber-300 text-xs font-mono">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Seri: {consecutiveTies}/{maxTies} (3x = Impostor Menang)</span>
          </div>
        )}
      </div>

      {/* 2. INSTANT TIE BANNER (IF PREVIOUS ROUND TIED) */}
      {isTieLastRound && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-amber-950/30 border border-amber-900/50 text-amber-200 text-xs flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="font-semibold text-amber-300">Suara Seri Terjadi!</p>
              <p className="text-amber-200/80">{tieMessage || 'Tidak ada pemain yang gugur. Lanjut ronde berikutnya.'}</p>
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-amber-400">
            {consecutiveTies}/{maxTies}
          </span>
        </motion.div>
      )}

      {/* 3. DISCUSSION & TABLE ORDER PHASE */}
      {phase === 'TURN_CLUE' && (
        <div className="space-y-4">
          {/* Table Turn Guide */}
          <Card padding="md" className="space-y-3.5 border-zinc-800 bg-zinc-900/40">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-zinc-400" />
                Urutan Bicara di Meja
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                Bicara 1 kata/frasa berurutan
              </span>
            </div>

            {/* Speaking Order List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {orderedAlivePlayers.map((player, idx) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-zinc-900 text-zinc-400 font-mono text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-lg">{player.avatar}</span>
                    <span className="text-sm font-semibold text-zinc-200">{player.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Action to proceed to voting or next round */}
          <div className="pt-2">
            {isWarmingUpRound ? (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => startVotingPhase()}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Selesai Pemanasan · Lanjut ke Ronde {round + 1}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => startVotingPhase()}
                rightIcon={<Vote className="w-4 h-4" />}
              >
                Semua Sudah Bicara · Mulai Voting Eliminasi
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 4. VOTING PHASE */}
      {phase === 'VOTING' && (
        <div className="space-y-4">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setVotingMode('consensus');
                clearVotes();
                setCurrentVoterId(null);
              }}
              className={cn(
                'py-1.5 rounded-lg transition-all',
                votingMode === 'consensus'
                  ? 'bg-zinc-800 text-zinc-100 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              Diskusi Terbuka (Konsensus)
            </button>
            <button
              type="button"
              onClick={() => {
                setVotingMode('individual');
                setCurrentVoterId(alivePlayers[0]?.id || null);
              }}
              className={cn(
                'py-1.5 rounded-lg transition-all',
                votingMode === 'individual'
                  ? 'bg-zinc-800 text-zinc-100 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              Voting Rahasia (Oper HP)
            </button>
          </div>

          {/* Consensus Mode */}
          {votingMode === 'consensus' && (
            <Card padding="md" className="space-y-3.5 border-zinc-800 bg-zinc-900/40">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-zinc-200">
                  Pilih Pemain yang Dicurigai
                </h3>
                <p className="text-xs text-zinc-400">
                  Diskusikan di dunia nyata. Klik avatar pemain yang disepakati untuk dieliminasi:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {alivePlayers.map((player) => (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => handleOpenConfirmModal(player.id)}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 hover:border-rose-700/60 hover:bg-zinc-900 transition-all text-left group active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl group-hover:scale-110 transition-transform">
                        {player.avatar}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-zinc-200">{player.name}</p>
                        <p className="text-[10px] text-zinc-500">Klik untuk eliminasi</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Eliminasi →
                    </span>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Individual Secret Voting Mode */}
          {votingMode === 'individual' && currentVoterPlayer && (
            <Card padding="md" className="space-y-4 border-zinc-800 bg-zinc-900/40">
              <div className="space-y-1 border-b border-zinc-800/80 pb-3">
                <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold">
                  Oper HP ke:
                </span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{currentVoterPlayer.avatar}</span>
                  <span>{currentVoterPlayer.name}</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Pilih secara rahasia siapa yang menurutmu adalah Impostor:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {alivePlayers
                  .filter((p) => p.id !== currentVoterPlayer.id)
                  .map((candidate) => (
                    <button
                      key={candidate.id}
                      type="button"
                      onClick={() => handleCastIndividualVote(candidate.id)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-zinc-500 hover:bg-zinc-900 transition-all text-left active:scale-95"
                    >
                      <span className="text-2xl">{candidate.avatar}</span>
                      <span className="text-sm font-semibold text-zinc-200">{candidate.name}</span>
                    </button>
                  ))}
              </div>
            </Card>
          )}

          {/* All Votes In Summary Button */}
          {votingMode === 'individual' && allVoted && (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => processElimination()}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Semua Suara Masuk · Buka Hasil Voting
            </Button>
          )}
        </div>
      )}

      {/* 5. CONFIRMATION MODAL FOR CONSENSUS ELIMINATION */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Konfirmasi Eliminasi"
        size="sm"
      >
        <div className="space-y-4 p-2 text-center">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl mx-auto">
            {players.find((p) => p.id === selectedSuspectId)?.avatar}
          </div>

          <div className="space-y-1">
            <h4 className="text-lg font-bold text-white">
              Eliminasi {players.find((p) => p.id === selectedSuspectId)?.name}?
            </h4>
            <p className="text-xs text-zinc-400">
              Pemain ini akan dikeluarkan dari putaran. Jika dia adalah Mr. White, dia berhak 1x menebak kata warga!
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="secondary"
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
              onClick={handleConfirmElimination}
            >
              Ya, Eliminasi
            </Button>
          </div>
        </div>
      </Modal>

      {/* 6. MR WHITE EMERGENCY GUESS MODAL */}
      <Modal
        isOpen={phase === 'MR_WHITE_GUESS'}
        onClose={() => {}}
        title="Penebusan Mr. White (Buta Kata)"
        size="md"
      >
        <div className="space-y-4 p-2 font-sans">
          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-900/40 text-xs text-purple-200 space-y-1">
            <p className="font-semibold text-purple-300">
              {pendingEliminatedPlayer?.name} adalah Mr. White!
            </p>
            <p className="text-purple-300/80">
              Tebak kata rahasia yang dimiliki Warga! Jika benar, kamu <strong>langsung menang seketika</strong>!
            </p>
          </div>

          <form onSubmit={handleMrWhiteSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                Tebakan Kata Warga (Sisa {mrWhiteTimerSeconds}s):
              </label>
              <input
                type="text"
                autoFocus
                value={mrWhiteGuessInput}
                onChange={(e) => setMrWhiteGuessInput(e.target.value)}
                placeholder="Ketik kata warga di sini..."
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-zinc-100 text-sm outline-none placeholder:text-zinc-600"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={skipMrWhiteGuess}
                className="w-1/3 text-xs"
              >
                Menyerah
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-2/3"
                rightIcon={<Send className="w-4 h-4" />}
              >
                Kirim Tebakan 🎯
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};
