import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Eye, ListChecks, PaperPlaneRight, Users, Warning } from '@phosphor-icons/react';
import { PlayerToken } from './PlayerToken';
import { SecretCard } from './SecretCard';
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
  const [selectedTargetForVoter, setSelectedTargetForVoter] = useState<string | null>(null);
  const [isHandingOverSecretVote, setIsHandingOverSecretVote] = useState(false);

  // Re-peek word state (Party QoL)
  const [rePeekPlayer, setRePeekPlayer] = useState<Player | null>(null);

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

  // Handle Secret Individual Vote Selection
  const handleSelectIndividualCandidate = (targetId: string) => {
    setSelectedTargetForVoter(targetId);
  };

  const handleConfirmIndividualVote = () => {
    if (!currentVoterId || !selectedTargetForVoter) return;
    try {
      playVoteBuzzer();
    } catch {
      // ignore
    }
    castVote(currentVoterId, selectedTargetForVoter);

    // Find next alive voter
    const currentIdx = alivePlayers.findIndex((p) => p.id === currentVoterId);
    if (currentIdx < alivePlayers.length - 1) {
      setCurrentVoterId(alivePlayers[currentIdx + 1].id);
      setSelectedTargetForVoter(null);
      setIsHandingOverSecretVote(true);
    } else {
      setCurrentVoterId(null);
      setSelectedTargetForVoter(null);
      setIsHandingOverSecretVote(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-paper-muted border border-rule">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cardstock-warm border border-rule flex items-center justify-center font-mono font-bold text-base text-ink">
            R{round}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-ink">
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
            <p className="text-xs text-ink-muted">
              {alivePlayers.length} Pemain Bertahan · Kategori: {settings.category}
            </p>
          </div>
        </div>

        {/* Ties Tracker Badge */}
        {consecutiveTies > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stamp-light border border-amber-900/40 text-stamp-dark text-xs font-mono">
            <Warning className="w-3.5 h-3.5 text-stamp-dark" />
            <span>Seri: {consecutiveTies}/{maxTies} (3x = Impostor Menang)</span>
          </div>
        )}
      </div>

      {/* 2. INSTANT TIE BANNER (IF PREVIOUS ROUND TIED) */}
      {isTieLastRound && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-stamp-light border border-stamp text-stamp-dark text-xs flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Warning className="w-4 h-4 text-stamp-dark shrink-0" />
            <div>
              <p className="font-semibold text-stamp-dark">Suara Seri Terjadi!</p>
              <p className="text-ink-muted">{tieMessage || 'Tidak ada pemain yang gugur. Lanjut ronde berikutnya.'}</p>
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-stamp-dark">
            {consecutiveTies}/{maxTies}
          </span>
        </motion.div>
      )}

      {/* 3. DISCUSSION & TABLE ORDER PHASE */}
      {phase === 'TURN_CLUE' && (
        <div className="space-y-4">
          {/* Table Turn Guide */}
          <Card padding="md" className="space-y-3.5 border-ink bg-cardstock">
            <div className="flex items-center justify-between border-b border-ink pb-3">
              <span className="text-xs font-semibold text-ink uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-ink-muted" />
                Urutan Bicara di Meja
              </span>
              <span className="text-xs text-ink-muted font-mono">
                Bicara 1 kata/frasa berurutan
              </span>
            </div>

            {/* Speaking Order List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {orderedAlivePlayers.map((player, idx) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-paper border border-rule hover:border-rule transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-xl bg-cardstock-warm text-ink-muted font-mono text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <PlayerToken avatar={player.avatar} name={player.name} size="sm" showCode={false} />
                    <span className="text-sm font-semibold text-ink">{player.name}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setRePeekPlayer(player)}
                    title="Lupa kata? Klik untuk intip rahasia"
                    className="p-1.5 px-2 rounded-lg border border-rule bg-cardstock hover:bg-cardstock-warm text-ink-muted hover:text-ink text-xs flex items-center gap-1 active:scale-95 transition-all shadow-print-sm"
                  >
                    <Eye className="w-3.5 h-3.5" weight="bold" />
                    <span className="text-[11px] font-mono font-bold">Intip</span>
                  </button>
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
                rightIcon={<ListChecks className="w-4 h-4" />}
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
          <div className="grid grid-cols-2 p-1 rounded-xl bg-paper border border-rule text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setVotingMode('consensus');
                clearVotes();
                setCurrentVoterId(null);
              }}
              className={cn(
                'py-1.5 rounded-2xl transition-all',
                votingMode === 'consensus'
                  ? 'bg-cardstock-warm text-ink font-semibold'
                  : 'text-ink-muted hover:text-ink'
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
                'py-1.5 rounded-2xl transition-all',
                votingMode === 'individual'
                  ? 'bg-cardstock-warm text-ink font-semibold'
                  : 'text-ink-muted hover:text-ink'
              )}
            >
              Voting Rahasia (Oper HP)
            </button>
          </div>

          {/* Consensus Mode */}
          {votingMode === 'consensus' && (
            <Card padding="md" className="space-y-3.5 border-ink bg-cardstock">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-ink">
                  Pilih Pemain yang Dicurigai
                </h3>
                <p className="text-xs text-ink-muted">
                  Diskusikan di dunia nyata. Klik avatar pemain yang disepakati untuk dieliminasi:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {alivePlayers.map((player) => (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => handleOpenConfirmModal(player.id)}
                    className="flex items-center justify-between p-3 rounded-xl bg-paper border border-rule hover:border-stamp hover:bg-cardstock-warm transition-all text-left group active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-2.5">
                      <PlayerToken avatar={player.avatar} name={player.name} size="md" showCode={false} />
                      <div>
                        <p className="text-sm font-semibold text-ink">{player.name}</p>
                        <p className="text-[11px] text-ink-muted">Klik untuk eliminasi</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-stamp-dark opacity-0 group-hover:opacity-100 transition-opacity">
                      Eliminasi →
                    </span>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Individual Secret Voting Mode */}
          {votingMode === 'individual' && currentVoterPlayer && isHandingOverSecretVote && (
            <Card padding="md" className="space-y-4 border-ink bg-cardstock text-center py-8 px-6">
              <PlayerToken avatar={currentVoterPlayer.avatar} name={currentVoterPlayer.name} size="xl" className="mx-auto" />
              <div className="space-y-1">
                <span className="rubber-stamp-red -rotate-2 text-xs">Giliran Pemilih</span>
                <h3 className="text-xl sm:text-2xl font-bold text-ink pt-1">
                  Oper HP ke {currentVoterPlayer.name}
                </h3>
                <p className="text-xs text-ink-muted max-w-[280px] mx-auto">
                  Pemain lain dilarang mengintip! Tekan tombol di bawah saat HP sudah di tangan <strong>{currentVoterPlayer.name}</strong>.
                </p>
              </div>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => setIsHandingOverSecretVote(false)}
                rightIcon={<ArrowRight className="w-4 h-4" weight="bold" />}
              >
                Saya {currentVoterPlayer.name}, Siap Memilih
              </Button>
            </Card>
          )}

          {votingMode === 'individual' && currentVoterPlayer && !isHandingOverSecretVote && (
            <Card padding="md" className="space-y-4 border-ink bg-cardstock">
              <div className="space-y-1 border-b border-ink pb-3">
                <span className="text-[11px] font-mono uppercase text-ink-muted font-semibold">
                  Oper HP ke:
                </span>
                <div className="flex items-center gap-2.5 pt-1">
                  <PlayerToken avatar={currentVoterPlayer.avatar} name={currentVoterPlayer.name} size="sm" showCode={false} />
                  <h3 className="text-lg font-bold text-ink">{currentVoterPlayer.name}</h3>
                </div>
                <p className="text-xs text-ink-muted">
                  Pilih secara rahasia siapa yang menurutmu adalah Impostor:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {alivePlayers
                  .filter((p) => p.id !== currentVoterPlayer.id)
                  .map((candidate) => {
                    const isSelected = selectedTargetForVoter === candidate.id;
                    return (
                      <button
                        key={candidate.id}
                        type="button"
                        onClick={() => handleSelectIndividualCandidate(candidate.id)}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-xl border transition-all text-left active:scale-95',
                          isSelected
                            ? 'bg-stamp-light border-stamp text-stamp-dark ring-2 ring-stamp shadow-print-sm'
                            : 'bg-paper border-rule hover:border-stamp hover:bg-cardstock-warm text-ink'
                        )}
                      >
                        <PlayerToken avatar={candidate.avatar} name={candidate.name} size="sm" showCode={false} />
                        <span className="text-sm font-semibold">{candidate.name}</span>
                      </button>
                    );
                  })}
              </div>

              <div className="pt-2">
                <Button
                  variant="danger"
                  size="lg"
                  fullWidth
                  disabled={!selectedTargetForVoter}
                  onClick={handleConfirmIndividualVote}
                  rightIcon={<ArrowRight className="w-4 h-4" weight="bold" />}
                >
                  {selectedTargetForVoter
                    ? `Kunci Pilihan: ${alivePlayers.find((p) => p.id === selectedTargetForVoter)?.name}`
                    : 'Pilih Satu Pemain di Atas'}
                </Button>
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
          <div className="py-2 flex justify-center">
            <PlayerToken
              avatar={players.find((p) => p.id === selectedSuspectId)?.avatar}
              name={players.find((p) => p.id === selectedSuspectId)?.name}
              size="lg"
              className="mx-auto"
            />
          </div>

          <div className="space-y-1">
            <h4 className="text-lg font-bold text-ink">
              Eliminasi {players.find((p) => p.id === selectedSuspectId)?.name}?
            </h4>
            <p className="text-xs text-ink-muted">
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
          <div className="p-3 rounded-xl bg-paper-muted border border-dashed border-ink text-ink-muted space-y-1">
            <p className="font-semibold text-ink-muted">
              {pendingEliminatedPlayer?.name} adalah Mr. White!
            </p>
            <p className="text-ink-muted/80">
              Tebak kata rahasia yang dimiliki Warga! Jika benar, kamu <strong>langsung menang seketika</strong>!
            </p>
          </div>

          <form onSubmit={handleMrWhiteSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink uppercase tracking-wider block">
                Tebakan Kata Warga (Sisa {mrWhiteTimerSeconds}s):
              </label>
              <input
                type="text"
                autoFocus
                value={mrWhiteGuessInput}
                onChange={(e) => setMrWhiteGuessInput(e.target.value)}
                placeholder="Ketik kata warga di sini..."
                className="w-full px-4 py-2.5 rounded-xl bg-paper border border-rule focus:border-teal focus:ring-2 focus:ring-teal/30 text-ink text-sm outline-none placeholder:text-ink-faint"
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
                rightIcon={<PaperPlaneRight className="w-4 h-4" />}
              >
                Kirim Tebakan 🎯
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* 7. PARTY RE-PEEK WORD MODAL */}
      <Modal
        isOpen={rePeekPlayer !== null}
        onClose={() => setRePeekPlayer(null)}
        title={`Intip Rahasia: ${rePeekPlayer?.name || 'Pemain'}`}
        size="sm"
      >
        <div className="space-y-4 p-2 text-center">
          <p className="text-xs text-ink-muted">
            Pastikan hanya <strong className="text-ink">{rePeekPlayer?.name}</strong> yang melihat layar saat kartu ditahan.
          </p>
          {rePeekPlayer && (
            <SecretCard
              word={rePeekPlayer.word}
              role={rePeekPlayer.role}
              category={settings.category === 'Semua Kategori' ? undefined : settings.category}
            />
          )}
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={() => setRePeekPlayer(null)}
          >
            Tutup &amp; Kembali ke Meja
          </Button>
        </div>
      </Modal>
    </div>
  );
};
