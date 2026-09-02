import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { HelpCircle, Send, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
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
      onClose={() => {}} // modal cannot be dismissed by clicking outside during emergency guess
      closeOnOutsideClick={false}
      closeOnEscape={false}
      showCloseButton={false}
      size="md"
      className="border-purple-500/40 shadow-2xl shadow-purple-950/60"
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
            <HelpCircle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black font-display bg-gradient-to-r from-purple-400 to-rose-400 bg-clip-text text-transparent">
              {isMrWhite ? 'TEBAK KATA RAHASIA WARGA!' : 'MR. WHITE TERTANGKAP!'}
            </h3>
            <p className="text-[11px] text-purple-300/80 font-mono uppercase tracking-wider">
              Kesempatan Darurat Butakata
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Countdown Timer */}
        <div className="flex justify-center">
          <CountdownTimer
            totalSeconds={initialSeconds}
            remainingSeconds={remainingSeconds}
            variant="compact"
            label="Waktu Menebak"
          />
        </div>

        {isMrWhite ? (
          /* Mr White Interface */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-center space-y-1">
              <p className="text-sm font-bold text-purple-200 font-display">
                Kamu Terpilih Tereliminasi!
              </p>
              <p className="text-xs text-purple-300/80 leading-relaxed font-sans">
                Namun, kamu tetap bisa <strong className="text-white">MENANG</strong> secara instan jika berhasil menebak <span className="text-cyan-300 font-bold">Kata Rahasia Warga</span>!
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Tuliskan Kata Rahasia Warga (Fuzzy Tolerance Aktif):
              </label>
              <input
                type="text"
                autoFocus
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value)}
                placeholder="Ketik tebakan kata di sini..."
                maxLength={30}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-purple-500/40 text-purple-100 placeholder:text-slate-600 text-base font-bold focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 tracking-wide text-center"
              />
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="accent"
              size="lg"
              fullWidth
              disabled={!guessInput.trim() || remainingSeconds === 0}
              isLoading={isSubmitting}
              leftIcon={<Send className="w-4 h-4" />}
              className="mt-2"
            >
              Kirim Tebakan Sekarang
            </Button>
          </form>
        ) : (
          /* Spectator / Other Players Interface */
          <div className="text-center space-y-4 py-2">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/15 border-2 border-purple-500/40 flex items-center justify-center text-3xl shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)]"
            >
              {mrWhitePlayer?.avatar || '🕵️'}
            </motion.div>

            <div className="space-y-1">
              <p className="text-base font-bold text-slate-100 font-display">
                <span className="text-purple-300 font-bold">{mrWhitePlayer?.name || 'Mr. White'}</span> sedang menebak kata rahasia!
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Jika tebakannya benar, Mr. White mencuri kemenangan! Jika salah, warga atau undercover yang bertahan akan menang.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-center gap-2 text-xs text-purple-300 font-mono">
              <span className="inline-block w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span>Menunggu input Mr. White...</span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default MrWhiteModal;
