import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Vote,
  CheckCircle2,
  AlertTriangle,
  Skull,
  UserCheck,
  Lock,
  Flame,
} from 'lucide-react';
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
            className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-300 shadow-[0_0_25px_-5px_rgba(245,158,11,0.4)] flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5 animate-bounce" />
            <div className="space-y-1">
              <h4 className="text-sm font-black font-display text-amber-300 uppercase tracking-wide">
                Instant Skip &mdash; Hasil Imbang!
              </h4>
              <p className="text-xs text-amber-200/90 leading-relaxed font-sans">
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
            <Vote className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm sm:text-base font-bold text-slate-100 font-display">
              Fase Pemilihan Impostor
            </h3>
          </div>
          <p className="text-xs text-slate-400">
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
            variant={totalVotesCount === livingPlayers.length ? 'emerald' : 'cyan'}
            size="sm"
            className="font-mono"
          >
            {totalVotesCount}/{livingPlayers.length} Memilih
          </Badge>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5">Ronde {roundNumber}</span>
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
                'relative p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3',
                !isPlayerAlive
                  ? 'bg-slate-950/40 border-white/5 opacity-50 cursor-not-allowed'
                  : isTargetSelected
                  ? 'bg-rose-500/20 border-rose-500 shadow-[0_0_20px_-3px_rgba(244,63,94,0.45)] ring-1 ring-rose-400 cursor-pointer'
                  : canVoteThis
                  ? 'bg-slate-900/80 border-white/10 hover:border-cyan-400/50 hover:bg-slate-800/80 cursor-pointer'
                  : 'bg-slate-900/60 border-white/10 cursor-default'
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Avatar */}
                <div
                  className={cn(
                    'w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 border relative',
                    !isPlayerAlive
                      ? 'bg-slate-900 border-slate-700 text-slate-600'
                      : isTargetSelected
                      ? 'bg-rose-500/20 border-rose-400 shadow-md'
                      : 'bg-cyan-500/10 border-cyan-500/30'
                  )}
                >
                  {player.avatar}
                  {!isPlayerAlive && (
                    <span className="absolute -bottom-1 -right-1 p-0.5 rounded bg-slate-900 border border-slate-700">
                      <Skull className="w-3 h-3 text-rose-500" />
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
                          ? 'line-through text-slate-500'
                          : isTargetSelected
                          ? 'text-rose-300'
                          : 'text-slate-100'
                      )}
                    >
                      {player.name}
                    </span>
                    {isMe && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-slate-300">
                        Kamu
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mt-0.5">
                    {!isPlayerAlive ? (
                      <span className="text-[10px] text-rose-400 font-mono">Tereliminasi</span>
                    ) : player.hasVoted ? (
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Sudah memilih
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">Sedang berpikir...</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Selection Indicator */}
              <div className="shrink-0">
                {isTargetSelected && (
                  <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md animate-pulse">
                    <Flame className="w-3.5 h-3.5" />
                  </span>
                )}
                {!isTargetSelected && player.hasVoted && isPlayerAlive && (
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                    <UserCheck className="w-3 h-3" />
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Error display */}
      {errorMessage && (
        <p className="text-xs text-rose-400 text-center font-medium">{errorMessage}</p>
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
            leftIcon={<Vote className="w-5 h-5" />}
          >
            {selectedTargetId
              ? `Kunci Pilihan: ${players.find((p) => p.id === selectedTargetId)?.name}`
              : 'Pilih Satu Pemain di Atas'}
          </Button>
        </div>
      )}

      {hasVoted && (
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-emerald-500/30 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-bold font-sans">
            <Lock className="w-3.5 h-3.5" />
            <span>Pilihan Terkunci &mdash; Menunggu Hasil Rekapitulasi</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Hasil eliminasi atau tie-break akan otomatis ditampilkan begitu semua pemain selesai memilih.
          </p>
        </div>
      )}
    </div>
  );
};

export default VotingGrid;
