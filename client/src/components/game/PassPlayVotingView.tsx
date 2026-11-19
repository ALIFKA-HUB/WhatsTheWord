import React, { useState, useEffect, useRef } from 'react';
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
    advanceWarmupRound,
    startVotingPhase,
    castVote,
    clearVotes,
    processElimination,
    submitMrWhiteGuess,
    skipMrWhiteGuess,
  } = usePassPlay();

  const { playVoteBuzzer, playElimination } = useGameSound();

  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [votingMode, setVotingMode] = useState<'consensus' | 'individual'>('consensus');
  const [currentVoterId, setCurrentVoterId] = useState<string | null>(null);
  const [selectedTargetForVoter, setSelectedTargetForVoter] = useState<string | null>(null);
  const [isHandingOverSecretVote, setIsHandingOverSecretVote] = useState(false);

  const [rePeekPlayer, setRePeekPlayer] = useState<Player | null>(null);

  const [mrWhiteGuessInput, setMrWhiteGuessInput] = useState('');
  const [mrWhiteTimerSeconds, setMrWhiteTimerSeconds] = useState(45);

  const isProcessingActionRef = useRef(false);

  const alivePlayers = players.filter((p) => p.isAlive);
  const orderedAlivePlayers = speakingOrder
    .map((id) => players.find((p) => p.id === id))
    .filter((p): p is Player => !!p && p.isAlive);

  const votingStartRound = settings.votingStartRound || 2;
  const isWarmingUpRound = round < votingStartRound;
  const maxTies = settings.maxConsecutiveTies || 3;

  useEffect(() => {
    isProcessingActionRef.current = false;
  }, [round, phase]);

  useEffect(() => {
    if (phase !== 'VOTING') return;

    setSelectedTargetForVoter(null);
    setSelectedSuspectId(null);
    setIsConfirmModalOpen(false);

    if (votingMode === 'individual') {
      const currentAlive = players.filter((p) => p.isAlive);
      setCurrentVoterId(currentAlive[0]?.id ?? null);
      setIsHandingOverSecretVote(true);
    } else {
      setCurrentVoterId(null);
      setIsHandingOverSecretVote(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, round]);

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

  useEffect(() => {
    if (phase === 'MR_WHITE_GUESS' && mrWhiteTimerSeconds === 0) {
      skipMrWhiteGuess();
    }
  }, [phase, mrWhiteTimerSeconds, skipMrWhiteGuess]);

  const handleOpenConfirmModal = (playerId: string) => {
    setSelectedSuspectId(playerId);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmElimination = () => {
    if (isProcessingActionRef.current || !selectedSuspectId) return;
    isProcessingActionRef.current = true;
    try {
      playElimination();
    } catch {
      // ignore
    }
    processElimination(selectedSuspectId);
    setIsConfirmModalOpen(false);
    setSelectedSuspectId(null);
  };

  const handleRevealIndividualVotingResult = () => {
    if (isProcessingActionRef.current) return;
    isProcessingActionRef.current = true;
    processElimination();
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-cardstock border border-rule shadow-print-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-light border border-teal flex items-center justify-center font-mono font-bold text-base text-teal-dark">
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
              {alivePlayers.length} pemain bertahan, kategori {settings.category}
            </p>
          </div>
        </div>

        {/* Ties Tracker Badge */}
        {consecutiveTies > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stamp-light border border-stamp text-stamp-dark text-xs font-semibold">
            <Warning className="w-3.5 h-3.5 text-stamp-dark" />
            <span>Seri: {consecutiveTies}/{maxTies} (3x = Impostor menang)</span>
          </div>
        )}
      </div>

      {/* 2. INSTANT TIE BANNER (IF PREVIOUS ROUND TIED) */}
      {isTieLastRound && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-stamp-light border border-stamp text-stamp-dark text-xs flex items-center justify-between"
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
          {/* First Speaker Spotlight Strip */}
          {orderedAlivePlayers[0] && (
            <div className="p-4 rounded-3xl bg-cardstock border border-teal-dark shadow-print flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <PlayerToken
                  avatar={orderedAlivePlayers[0].avatar}
                  name={orderedAlivePlayers[0].name}
                  size="md"
                  showCode={false}
                />
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-teal-dark bg-teal-light px-2.5 py-0.5 rounded-full border border-teal inline-block mb-0.5">
                    Pembicara Pertama (#1)
                  </span>
                  <h3 className="text-base font-bold text-ink truncate">
                    {orderedAlivePlayers[0].name}
                  </h3>
                  <p className="text-xs text-ink-muted">Mulai beri petunjuk pertama</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRePeekPlayer(orderedAlivePlayers[0]!)}
                className="px-3 py-1.5 rounded-full border border-rule bg-paper hover:bg-paper-muted text-xs font-bold text-ink flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-teal-dark" weight="bold" />
                <span>Intip</span>
              </button>
            </div>
          )}

          <Card padding="md" className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <span className="text-sm font-bold text-ink flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-dark" weight="bold" />
                Urutan Bicara di Meja
              </span>
              <span className="text-xs text-ink-muted">
                Sebutkan 1 petunjuk secara berurutan
              </span>
            </div>

            {/* Speaking Order List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {orderedAlivePlayers.map((player, idx) => (
                <div
                  key={player.id}
                  className={cn(
                    'flex items-center justify-between p-2.5 rounded-2xl border transition-colors',
                    idx === 0 ? 'bg-teal-light/35 border-teal' : 'bg-paper border-rule'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={cn(
                        'w-6 h-6 rounded-xl font-mono text-xs font-bold flex items-center justify-center shrink-0',
                        idx === 0 ? 'bg-teal-dark text-cardstock' : 'bg-paper-muted text-ink-muted'
                      )}
                    >
                      {idx + 1}
                    </span>
                    <PlayerToken avatar={player.avatar} name={player.name} size="sm" showCode={false} />
                    <span className="text-sm font-semibold text-ink truncate">{player.name}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setRePeekPlayer(player)}
                    title="Lupa kata? Klik untuk intip rahasia"
                    className="p-1.5 px-2.5 rounded-full border border-rule bg-cardstock hover:bg-paper-muted text-ink-muted hover:text-ink text-xs flex items-center gap-1 active:translate-y-[1px] transition-colors shadow-print-sm shrink-0 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" weight="bold" />
                    <span className="text-xs font-semibold">Intip</span>
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <div className="pt-2">
            {isWarmingUpRound ? (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => advanceWarmupRound()}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Selesai Pemanasan, Lanjut ke Ronde {round + 1}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => startVotingPhase()}
                rightIcon={<ListChecks className="w-4 h-4" />}
              >
                Semua Sudah Bicara, Mulai Voting Eliminasi
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 4. VOTING PHASE */}
      {phase === 'VOTING' && (
        <div className="space-y-4">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-full bg-paper-muted border border-rule text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                if (votingMode === 'consensus') return;
                clearVotes();
                setVotingMode('consensus');
                setCurrentVoterId(null);
                setSelectedTargetForVoter(null);
                setIsHandingOverSecretVote(false);
              }}
              className={cn(
                'py-2 px-2.5 sm:px-3 rounded-full transition-colors text-center',
                votingMode === 'consensus'
                  ? 'bg-cardstock text-ink font-bold shadow-print-sm'
                  : 'text-ink-muted hover:text-ink'
              )}
            >
              Konsensus Meja
            </button>
            <button
              type="button"
              onClick={() => {
                if (votingMode === 'individual') return;
                clearVotes();
                setVotingMode('individual');
                setCurrentVoterId(alivePlayers[0]?.id ?? null);
                setSelectedTargetForVoter(null);
                setIsHandingOverSecretVote(true);
              }}
              className={cn(
                'py-2 px-2.5 sm:px-3 rounded-full transition-colors text-center',
                votingMode === 'individual'
                  ? 'bg-cardstock text-ink font-bold shadow-print-sm'
                  : 'text-ink-muted hover:text-ink'
              )}
            >
              <span>Voting Rahasia</span>
              <span className="hidden sm:inline text-xs text-ink-muted font-normal ml-1">(Oper HP)</span>
            </button>
          </div>

          {/* Consensus Mode (2-Col Suspect Dossier Grid) */}
          {votingMode === 'consensus' && (
            <Card padding="md" className="space-y-3.5">
              <div className="space-y-1 border-b border-rule pb-3">
                <h3 className="text-sm font-bold text-ink">
                  Papan Tersangka Meja
                </h3>
                <p className="text-xs text-ink-muted">
                  Diskusikan bersama, lalu ketuk kartu pemain yang disepakati untuk dieliminasi:
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {alivePlayers.map((player, idx) => (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => handleOpenConfirmModal(player.id)}
                    className="flex flex-col justify-between p-3.5 rounded-2xl bg-paper border border-rule hover:border-stamp hover:bg-stamp-light transition-colors text-left group active:translate-y-[1px] gap-2.5 cursor-pointer"
                  >
                    <div className="flex items-start justify-between w-full gap-1.5">
                      <PlayerToken avatar={player.avatar} name={player.name} size="md" showCode={false} />
                      <span className="text-[11px] font-mono font-bold text-ink-muted bg-cardstock px-2 py-0.5 rounded-full border border-rule">
                        #0{idx + 1}
                      </span>
                    </div>
                    <div className="w-full pt-2 border-t border-rule space-y-1.5">
                      <p className="text-sm font-bold text-ink truncate">{player.name}</p>
                      <span className="inline-block text-[11px] font-bold text-stamp-dark bg-stamp-light px-2.5 py-0.5 rounded-full border border-stamp -rotate-1 group-hover:rotate-0 transition-transform">
                        Eliminasi
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Individual Secret Voting Mode */}
          {votingMode === 'individual' && currentVoterPlayer && isHandingOverSecretVote && (
            <Card padding="md" className="space-y-4 text-center py-8 px-6">
              <PlayerToken avatar={currentVoterPlayer.avatar} name={currentVoterPlayer.name} size="xl" className="mx-auto" />
              <div className="space-y-1.5">
                <span className="rubber-stamp text-xs">Giliran Memilih</span>
                <h3 className="text-xl sm:text-2xl font-bold text-ink pt-1">
                  Oper HP ke {currentVoterPlayer.name}
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted max-w-[280px] mx-auto">
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
            <Card padding="md" className="space-y-4">
              <div className="space-y-1 border-b border-rule pb-3">
                <span className="text-xs text-ink-muted font-semibold">
                  Pemilih saat ini:
                </span>
                <div className="flex items-center gap-2.5 pt-1">
                  <PlayerToken avatar={currentVoterPlayer.avatar} name={currentVoterPlayer.name} size="sm" showCode={false} />
                  <h3 className="text-lg font-bold text-ink">{currentVoterPlayer.name}</h3>
                </div>
                <p className="text-xs text-ink-muted">
                  Pilih secara rahasia siapa yang menurutmu adalah Impostor:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                          'flex items-center gap-3 p-3 rounded-2xl border transition-colors text-left active:translate-y-[1px]',
                          isSelected
                            ? 'bg-stamp-light border-stamp text-stamp-dark ring-1 ring-stamp shadow-print-sm'
                            : 'bg-paper border-rule hover:border-stamp hover:bg-paper-muted text-ink'
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

          {/* All Votes In Summary Ballot Box */}
          {votingMode === 'individual' && allVoted && (
            <Card padding="md" className="space-y-4 text-center py-6 px-4 bg-cardstock border border-rule shadow-print">
              <div className="w-12 h-12 rounded-2xl bg-teal-light border border-teal text-teal-dark flex items-center justify-center mx-auto shadow-print-sm">
                <ListChecks className="w-6 h-6" weight="bold" />
              </div>
              <div className="space-y-1">
                <span className="rubber-stamp text-xs">Kotak Suara Tersegel</span>
                <h3 className="text-lg sm:text-xl font-bold text-ink pt-1">
                  Semua Suara Telah Terkumpul!
                </h3>
                <p className="text-xs text-ink-muted max-w-sm mx-auto leading-relaxed">
                  Seluruh {alivePlayers.length} pemain telah mengunci pilihan masing-masing. Buka rekapitulasi untuk mengumumkan hasil eliminasi putaran ini.
                </p>
              </div>
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleRevealIndividualVotingResult}
                  rightIcon={<ArrowRight className="w-4 h-4" weight="bold" />}
                >
                  Buka Hasil Rekapitulasi Voting
                </Button>
              </div>
            </Card>
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
        title="Kesempatan Tebak Kata (Mr. White)"
        size="md"
      >
        <div className="space-y-4 p-2 font-sans">
          <div className="p-3.5 rounded-2xl bg-paper-muted border border-dashed border-rule text-ink-muted space-y-1">
            <p className="font-semibold text-ink">
              {pendingEliminatedPlayer?.name} adalah Mr. White!
            </p>
            <p className="text-xs text-ink-muted">
              Tebak kata rahasia yang dimiliki Warga! Jika benar, kamu <strong>langsung menang seketika</strong>!
            </p>
          </div>

          <form onSubmit={handleMrWhiteSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink block">
                Tebakan Kata Warga (sisa {mrWhiteTimerSeconds} detik):
              </label>
              <input
                type="text"
                autoFocus
                value={mrWhiteGuessInput}
                onChange={(e) => setMrWhiteGuessInput(e.target.value)}
                placeholder="Ketik kata warga di sini…"
                className="w-full px-4 py-2.5 rounded-xl bg-paper border border-rule focus:border-teal-dark focus:ring-2 focus:ring-teal text-ink text-sm outline-none placeholder:text-ink-faint"
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
                Kirim Tebakan
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* 7. PARTY RE-PEEK WORD MODAL */}
      <Modal
        isOpen={rePeekPlayer !== null}
        onClose={() => setRePeekPlayer(null)}
        title={`Intip Kata: ${rePeekPlayer?.name || 'Pemain'}`}
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
