import React, { useState, useEffect } from 'react';
import { PaperPlaneRight, Question, WarningCircle } from '@phosphor-icons/react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { PlayerToken } from './PlayerToken';
import { CountdownTimer } from './CountdownTimer';
import { Player, PlayerRole } from '../../types/game.types';

export interface MrWhiteModalProps {
  isOpen: boolean;
  isMrWhite: boolean;
  mrWhitePlayer?: Player;
  onSubmitGuess: (guess: string) => Promise<{ success: boolean; isCorrect?: boolean; winner?: PlayerRole; error?: string }>;
  initialSeconds?: number;
}

export const MrWhiteModal: React.FC<MrWhiteModalProps> = ({
  isOpen,
  isMrWhite,
  mrWhitePlayer,
  onSubmitGuess,
  initialSeconds = 45,
}) => {
  const [guessInput, setGuessInput] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setRemainingSeconds(initialSeconds);
    setGuessInput('');
    setErrorMsg(null);

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, initialSeconds]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!guessInput.trim() || !isMrWhite) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await onSubmitGuess(guessInput.trim());
      if (!res.success) {
        setErrorMsg(res.error || 'Gagal mengirim tebakan');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal mengirim tebakan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      closeOnOutsideClick={false}
      closeOnEscape={false}
      showCloseButton={false}
      size="md"
      className="border border-rule shadow-print-lg"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sun-light border border-sun/50 flex items-center justify-center text-sun-dark shadow-print-sm">
            <Question className="w-5 h-5" weight="bold" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold font-display text-ink">
              {isMrWhite ? 'Tebak Kata Rahasia Warga!' : 'Mr. White Tertangkap!'}
            </h3>
            <p className="text-xs text-ink-muted font-normal">
              Kesempatan menebak kata rahasia
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex justify-center">
          <CountdownTimer
            totalSeconds={initialSeconds}
            remainingSeconds={remainingSeconds}
            variant="compact"
            label="Waktu Menebak"
          />
        </div>

        {isMrWhite ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 rounded-2xl bg-stamp-light border border-stamp/40 text-center space-y-1">
              <p className="text-sm font-bold text-stamp-dark font-display">
                Kamu Terpilih untuk Dieliminasi!
              </p>
              <p className="text-xs text-ink-muted leading-relaxed font-sans">
                Namun, kamu tetap bisa <strong className="text-ink">menang seketika</strong> jika berhasil menebak <span className="text-stamp-dark font-bold">kata rahasia Warga</span>!
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink">
                Tuliskan Kata Rahasia Warga:
              </label>
              <input
                type="text"
                autoFocus
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value)}
                placeholder="Ketik tebakan kata di sini…"
                maxLength={30}
                className="w-full px-4 py-3 rounded-xl bg-paper border border-rule text-ink placeholder:text-ink-faint text-base font-bold focus:outline-none focus:border-teal-dark focus:ring-2 focus:ring-teal/30 text-center"
              />
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stamp-light border border-stamp/50 text-stamp-dark text-xs">
                <WarningCircle className="w-4 h-4 shrink-0 text-stamp-dark" weight="bold" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={!guessInput.trim() || remainingSeconds === 0}
              isLoading={isSubmitting}
              leftIcon={<PaperPlaneRight className="w-4 h-4" weight="bold" />}
              className="mt-2"
            >
              Kirim Tebakan Sekarang
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-4 py-2">
            <PlayerToken
              avatar={mrWhitePlayer?.avatar}
              name={mrWhitePlayer?.name}
              size="lg"
              className="mx-auto"
            />

            <div className="space-y-1">
              <p className="text-base font-bold text-ink font-display">
                <span className="text-stamp-dark font-bold">{mrWhitePlayer?.name || 'Mr. White'}</span> sedang menebak kata rahasia!
              </p>
              <p className="text-xs text-ink-muted max-w-xs mx-auto leading-relaxed">
                Jika tebakannya benar, Mr. White mencuri kemenangan! Jika salah, warga atau impostor yang bertahan akan menang.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-paper border border-rule flex items-center justify-center gap-2 text-xs text-ink-muted font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-sun-dark" />
              <span>Menunggu tebakan Mr. White…</span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default MrWhiteModal;
