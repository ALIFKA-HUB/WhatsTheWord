import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { CheckCircle, MagnifyingGlass, Shuffle, XCircle } from '@phosphor-icons/react';
import { PlayerToken } from '../components/game/PlayerToken';
import { MINI_ROUNDS } from './content';

const PLAYER_AVATARS = ['token-eye', 'token-key', 'token-detective', 'token-triangle'] as const;

export const MiniRoundWidget: React.FC = () => {
  const [roundIndex, setRoundIndex] = useState(0);
  const [votedId, setVotedId] = useState<string | null>(null);
  const shouldReduce = useReducedMotion();

  const currentCase = MINI_ROUNDS[roundIndex]!;
  const votedPlayer = currentCase.players.find((p) => p.id === votedId) ?? null;
  const isSolved = votedPlayer !== null;
  const caughtImpostor = Boolean(votedPlayer?.isImpostor);

  const handleVote = (playerId: string) => {
    setVotedId(playerId);
  };

  const handleNextRound = () => {
    setRoundIndex((prev) => (prev + 1) % MINI_ROUNDS.length);
    setVotedId(null);
  };

  return (
    <div className="lp-plate p-5 sm:p-8 mb-10 sm:mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-5 border-b border-rule">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-dark mb-1">
            <MagnifyingGlass size={16} weight="bold" aria-hidden="true" />
            <span>Simulasi voting 10 detik</span>
          </div>
          <h3 className="font-display font-bold text-xl sm:text-2xl text-ink">
            Tebak siapa penyamarnya
          </h3>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="lp-code text-xs font-semibold text-ink bg-paper-muted px-3 py-1.5 rounded-full border border-rule">
            Topik: {currentCase.topic}
          </span>
          <button
            type="button"
            onClick={handleNextRound}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-paper-muted text-ink border border-rule hover:border-ink transition-colors cursor-pointer"
          >
            <Shuffle size={14} weight="bold" aria-hidden="true" />
            <span>Ronde lain</span>
          </button>
        </div>
      </div>

      <p className="text-sm text-ink-muted mb-5">
        Empat pemain sudah memberi satu petunjuk lisan. Ketuk kartu pemain yang menurutmu memegang kata berbeda.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {currentCase.players.map((player, idx) => {
          const isPicked = votedId === player.id;
          const avatarId = PLAYER_AVATARS[idx % PLAYER_AVATARS.length];
          let cardStyle = 'bg-paper border-rule hover:border-teal-dark shadow-print-sm';
          if (isSolved) {
            if (player.isImpostor) {
              cardStyle = 'bg-stamp-light border-stamp shadow-print';
            } else if (isPicked) {
              cardStyle = 'bg-sun-light border-sun-dark';
            } else {
              cardStyle = 'bg-paper border-rule opacity-85';
            }
          }

          return (
            <motion.button
              key={player.id}
              type="button"
              onClick={() => handleVote(player.id)}
              whileTap={shouldReduce ? undefined : { scale: 0.98 }}
              aria-pressed={isPicked}
              className={`text-left p-4 rounded-2xl border transition-colors cursor-pointer flex flex-col justify-between gap-3 ${cardStyle}`}
            >
              {/* Top Player Header with Portrait */}
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="flex items-center gap-2.5 min-w-0">
                  <PlayerToken avatar={avatarId} name={player.name} size="xs" showCode={false} />
                  <div className="min-w-0">
                    <span className="font-display font-bold text-base text-ink block truncate">
                      {player.name}
                    </span>
                    <span className="lp-code text-[10px] text-ink-muted block">
                      Kursi 0{idx + 1}
                    </span>
                  </div>
                </div>
                {isSolved ? (
                  <span className={player.isImpostor ? 'lp-badge-stamp' : 'lp-badge-mint'}>
                    {player.word}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-cardstock border border-rule text-[11px] font-bold text-teal-dark">
                    Vote
                  </span>
                )}
              </div>

              {/* Speech Bubble Clue Plaque */}
              <div className="p-3 rounded-xl bg-cardstock border border-rule w-full">
                <p className="text-xs sm:text-sm text-ink font-medium leading-snug">
                  “{player.clue}”
                </p>
              </div>

              {/* Footer Status */}
              {isSolved ? (
                <div className="text-xs font-bold pt-1 flex items-center justify-between w-full">
                  <span className={player.isImpostor ? 'text-stamp-dark' : 'text-teal-dark'}>
                    {player.isImpostor ? 'Penyamar' : 'Warga sipil'}
                  </span>
                  {isPicked && <span className="text-ink-muted">Pilihanmu</span>}
                </div>
              ) : (
                <div className="text-[11px] font-semibold text-ink-muted flex items-center justify-between w-full">
                  <span>Petunjuk #{idx + 1}</span>
                  <span className="text-ink font-bold">Pilih tersangka</span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {isSolved && (
        <motion.div
          initial={shouldReduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`mt-5 p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            caughtImpostor
              ? 'bg-teal-light border-teal'
              : 'bg-stamp-light border-stamp'
          }`}
          aria-live="polite"
        >
          <div className="flex items-start gap-2.5">
            {caughtImpostor ? (
              <CheckCircle size={20} weight="fill" className="text-teal-dark shrink-0 mt-0.5" aria-hidden="true" />
            ) : (
              <XCircle size={20} weight="fill" className="text-stamp-dark shrink-0 mt-0.5" aria-hidden="true" />
            )}
            <div className="text-sm">
              <div className="font-display font-bold text-ink">
                {caughtImpostor
                  ? `Tepat sekali! ${votedPlayer.name} memang penyamarnya.`
                  : `Hampir! ${votedPlayer.name} ternyata Warga (${currentCase.civilianWord}).`}
              </div>
              <p className="text-ink-muted mt-0.5">{currentCase.explanation}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleNextRound}
            className="lp-btn lp-btn--secondary min-h-[38px] px-4 py-1.5 text-xs shrink-0"
          >
            Coba ronde lain
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default MiniRoundWidget;
