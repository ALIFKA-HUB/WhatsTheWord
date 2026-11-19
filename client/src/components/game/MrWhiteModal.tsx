import React, { useState, useEffect, useRef } from 'react';
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
  const [validationError, setValidationError] = useState<string | null>(null);
  const hasAutoSubmittedTimeoutRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    hasAutoSubmittedTimeoutRef.current = false;
    setRemainingSeconds(initialSeconds);
    setGuessInput('');
    setErrorMsg(null);
    setValidationError(null);

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

  useEffect(() => {
    if (isOpen && remainingSeconds === 0 && !hasAutoSubmittedTimeoutRef.current) {
      hasAutoSubmittedTimeoutRef.current = true;
      if (isMrWhite) {
        void onSubmitGuess('');
      }
    }
  }, [isOpen, remainingSeconds, isMrWhite, onSubmitGuess]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isMrWhite) return;
    if (!guessInput.trim()) {
      setValidationError('Masukkan tebakan kata terlebih dahulu!');
      return;
    }

    setValidationError(null);
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
          <div className="w-8 h-8 rounded-xl bg-stamp-light border border-stamp flex items-center justify-center text-stamp-dark shadow-print-sm shrink-0">
            <Question className="w-5 h-5" weight="bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rubber-stamp text-[10px]">Interogasi Darurat</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold font-display text-ink leading-tight">
              {isMrWhite ? 'Kesempatan Terakhir Mr. White!' : 'Mr. White Sedang Menebak!'}
            </h3>
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
            label="Sisa Waktu Interogasi"
          />
        </div>

        {isMrWhite ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 rounded-2xl bg-stamp-light border border-stamp text-center space-y-1 shadow-print-sm">
              <p className="text-sm font-bold text-stamp-dark font-display">
                Kamu Tereliminasi di Meja!
              </p>
              <p className="text-xs text-ink-muted leading-relaxed font-sans">
                Namun sebagai Mr. White, kamu bisa <strong className="text-ink">mencuri kemenangan seketika</strong> jika berhasil menebak <span className="text-stamp-dark font-bold">kata rahasia Warga</span>!
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink block">
                Ketik Kata Rahasia Warga:
              </label>
              <input
                type="text"
                autoFocus
                value={guessInput}
                onChange={(e) => {
                  setGuessInput(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Contoh: Kopi"
                maxLength={30}
                className="w-full px-4 py-3 rounded-xl bg-paper border-2 border-rule text-ink placeholder:text-ink-faint font-mono text-lg sm:text-xl font-bold focus:outline-none focus:border-stamp focus:ring-2 focus:ring-stamp text-center transition-colors"
              />
              {validationError && (
                <p className="text-xs font-semibold text-stamp-dark pt-1">{validationError}</p>
              )}
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stamp-light border border-stamp text-stamp-dark text-xs font-semibold">
                <WarningCircle className="w-4 h-4 shrink-0 text-stamp-dark" weight="bold" />
                <span>{errorMsg}</span>
              </div>
            )}

            {remainingSeconds === 0 ? (
              <Button
                type="button"
                variant="secondary"
                size="lg"
                fullWidth
                isLoading={isSubmitting}
                onClick={() => void onSubmitGuess('')}
                className="mt-2"
              >
                Waktu Habis, Lanjutkan Permainan
              </Button>
            ) : (
              <Button
                type="submit"
                variant="danger"
                size="lg"
                fullWidth
                disabled={isSubmitting}
                isLoading={isSubmitting}
                leftIcon={<PaperPlaneRight className="w-4 h-4" weight="bold" />}
                className="mt-2"
              >
                Kirim Tebakan
              </Button>
            )}
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
                Jika tebakannya tepat, Mr. White mencuri kemenangan seketika! Jika salah, kelompok yang bertahan akan memenangkan permainan.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-paper border border-rule flex items-center justify-center gap-2 text-xs text-ink-muted font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-sun-dark animate-pulse" />
              <span>Menyimak tebakan Mr. White di meja…</span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default MrWhiteModal;
