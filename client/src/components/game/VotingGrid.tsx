import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Flame, ListChecks, Lock, Skull, UserCheck, Warning } from '@phosphor-icons/react';
import { PlayerToken } from './PlayerToken';
import { Player } from '../../types/game.types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useGameSound } from '../../hooks/useGameSound';
import { cn } from '../../utils/cn';


export interface VotingGridProps {
  players: Player[];
  currentPlayer: Player | null;
  onCastVote: (targetId: string) => Promise<{ success: boolean; error?: string }>;
  isTie?: boolean;
  tieMessage?: string;
  roundNumber?: number;
  className?: string;
}

export const VotingGrid: React.FC<VotingGridProps> = ({
  players,
  currentPlayer,
  onCastVote,
  isTie = false,
  tieMessage = 'Hasil Voting Imbang! Sistem menerapkan Instant Skip. Tidak ada yang tereliminasi.',
  roundNumber = 1,
  className,
}) => {
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { playVoteBuzzer, playButtonTap } = useGameSound();

  const isAlive = currentPlayer?.isAlive ?? true;
  const hasVoted = currentPlayer?.hasVoted ?? false;

  const livingPlayers = players.filter((p) => p.isAlive);
  const totalVotesCount = livingPlayers.filter((p) => p.hasVoted).length;

  const handleSelect = (playerId: string) => {
    if (!isAlive || hasVoted || playerId === currentPlayer?.id) return;
    try {
      playButtonTap();
    } catch {
      // ignore audio
    }
    setSelectedTargetId(playerId);
    setErrorMessage(null);
  };

  const handleConfirmVote = async () => {
    if (!selectedTargetId || hasVoted || !isAlive) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await onCastVote(selectedTargetId);
      if (res.success) {
        try {
          playVoteBuzzer();
        } catch {
          // ignore
        }
      } else {
        setErrorMessage(res.error || 'Gagal mengirim pilihan');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal mengirim pilihan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn('w-full max-w-xl mx-auto space-y-5 select-none', className)}>
      {/* Tie Break Alert Banner */}
      <AnimatePresence>
        {isTie && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 rounded-2xl bg-stamp-light border border-stamp text-stamp-dark shadow-print flex items-start gap-3"
          >
            <Warning className="w-5 h-5 shrink-0 text-stamp-dark mt-0.5 animate-bounce" weight="bold" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold font-display text-stamp-dark uppercase tracking-wide">
                Instant Skip: Hasil Imbang!
              </h4>
              <p className="text-xs text-stamp-dark leading-relaxed font-sans">
                {tieMessage}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Info */}
      <div className="flex items-center justify-between px-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-stamp-dark" weight="bold" />
            <h3 className="text-sm sm:text-base font-bold text-ink font-display">
              Fase Pemilihan Impostor
            </h3>
          </div>
          <p className="text-xs text-ink-muted">
            {hasVoted
              ? 'Pilihanmu telah dikunci. Menunggu pemain lain...'
              : isAlive
              ? 'Pilih satu pemain yang paling mencurigakan:'
              : 'Kamu telah tereliminasi (Spectator)'}
          </p>
        </div>

        {/* Live Vote Progress Counter */}
        <div className="flex flex-col items-end">
          <Badge
            variant={totalVotesCount === livingPlayers.length ? 'emerald' : 'slate'}
            size="sm"
            className="font-mono"
          >
            {totalVotesCount}/{livingPlayers.length} Memilih
          </Badge>
          <span className="text-[11px] text-ink-muted font-mono mt-0.5">Ronde {roundNumber}</span>
        </div>
      </div>

      {/* Player Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {players.map((player) => {
          const isMe = player.id === currentPlayer?.id;
          const isTargetSelected = selectedTargetId === player.id;
          const isPlayerAlive = player.isAlive;
          const canVoteThis = isAlive && !hasVoted && !isMe && isPlayerAlive;

          return (
            <motion.div
              key={player.id}
              whileHover={canVoteThis ? { scale: 1.02 } : undefined}
              whileTap={canVoteThis ? { scale: 0.98 } : undefined}
              onClick={() => canVoteThis && handleSelect(player.id)}
              className={cn(
                'relative p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 shadow-print-sm',
                !isPlayerAlive
                  ? 'bg-paper-muted border-rule opacity-50 cursor-not-allowed'
                  : isTargetSelected
                  ? 'bg-stamp-light border-stamp ring-2 ring-stamp cursor-pointer'
                  : canVoteThis
                  ? 'bg-cardstock border-rule hover:border-stamp hover:bg-cardstock-warm/80 cursor-pointer'
                  : 'bg-paper-muted border-rule cursor-default'
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <PlayerToken
                    avatar={player.avatar}
                    name={player.name}
                    size="sm"
                    showCode={false}
                    eliminated={!isPlayerAlive}
                    selected={isTargetSelected}
                  />
                  {!isPlayerAlive && (
                    <span className="absolute -bottom-1 -right-1 p-0.5 rounded bg-cardstock-warm border border-rule">
                      <Skull className="w-3 h-3 text-stamp-dark" weight="bold" />
                    </span>
                  )}
                </div>

                {/* Player details */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        'text-sm font-bold truncate',
                        !isPlayerAlive
                          ? 'line-through text-ink-muted'
                          : isTargetSelected
                          ? 'text-stamp-dark'
                          : 'text-ink'
                      )}
                    >
                      {player.name}
                    </span>
                    {isMe && (
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-cardstock-warm border border-rule text-ink font-bold">
                        Kamu
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mt-0.5">
                    {!isPlayerAlive ? (
                      <span className="text-[11px] text-stamp-dark font-mono font-bold">Tereliminasi</span>
                    ) : player.hasVoted ? (
                      <span className="text-[11px] text-teal-dark font-mono flex items-center gap-1 font-bold">
                        <CheckCircle className="w-3.5 h-3.5 text-teal" weight="bold" /> Sudah memilih
                      </span>
                    ) : (
                      <span className="text-[11px] text-ink-muted font-mono">Sedang berpikir...</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Selection Indicator */}
              <div className="shrink-0">
                {isTargetSelected && (
                  <span className="w-6 h-6 rounded-full bg-stamp text-ink flex items-center justify-center shadow-md animate-pulse">
                    <Flame className="w-3.5 h-3.5" weight="bold" />
                  </span>
                )}
                {!isTargetSelected && player.hasVoted && isPlayerAlive && (
                  <span className="w-5 h-5 rounded-full bg-cardstock-warm text-ink border border-rule flex items-center justify-center">
                    <UserCheck className="w-3 h-3 text-ink" weight="bold" />
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Error display */}
      {errorMessage && (
        <p className="text-xs text-stamp-dark text-center font-medium">{errorMessage}</p>
      )}

      {/* Action Footer Button */}
      {isAlive && !hasVoted && (
        <div className="pt-2">
          <Button
            variant="danger"
            size="lg"
            fullWidth
            disabled={!selectedTargetId}
            isLoading={isSubmitting}
            onClick={handleConfirmVote}
            leftIcon={<ListChecks className="w-5 h-5" />}
          >
            {selectedTargetId
              ? `Kunci Pilihan: ${players.find((p) => p.id === selectedTargetId)?.name}`
              : 'Pilih Satu Pemain di Atas'}
          </Button>
        </div>
      )}

      {hasVoted && (
        <div className="p-3.5 rounded-2xl bg-paper border border-rule text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-ink text-xs font-bold font-sans">
            <Lock className="w-3.5 h-3.5" />
            <span>Pilihan Terkunci: Menunggu Hasil Rekapitulasi</span>
          </div>
          <p className="text-[11px] text-ink-muted">
            Hasil eliminasi atau tie-break akan otomatis ditampilkan begitu semua pemain selesai memilih.
          </p>
        </div>
      )}
    </div>
  );
};

export default VotingGrid;
