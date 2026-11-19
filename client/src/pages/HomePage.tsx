import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  WifiHigh,
  WifiSlash,
  PlusCircle,
  SignIn,
  BookOpen,
  ArrowRight,
  DeviceMobile,
  CheckCircle,
  UserCircleGear,
  ShieldCheck,
  EyeSlash,
  Question,
} from '@phosphor-icons/react';

import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import { PlayerToken } from '../components/game/PlayerToken';
import { CustomWordPackModal } from '../components/lobby/CustomWordPackModal';
import { ProfileModal } from '../components/lobby/ProfileModal';
import { useSocket } from '../hooks/useSocket';
import { STORAGE_KEYS } from '../context/SocketContext';
import { resolveTokenAvatar } from '../utils/avatarTokens';
import { cn } from '../utils/cn';

export interface HomePageProps {
  onStartPassPlay: () => void;
  onEnterOnlineLobby: () => void;
}

type OnlineTab = 'HOST' | 'JOIN';

export const HomePage: React.FC<HomePageProps> = ({
  onStartPassPlay,
  onEnterOnlineLobby,
}) => {
  const { isConnected, isConnecting, createRoom, joinRoom, error, clearError } = useSocket();
  const shouldReduce = useReducedMotion();

  const [onlineTab, setOnlineTab] = useState<OnlineTab>('HOST');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const slotRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null]);

  const [playerName, setPlayerName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.SAVED_NAME) || 'Saksi_Meja';
    }
    return 'Saksi_Meja';
  });
  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.SAVED_AVATAR) || 'token-eye';
    }
    return 'token-eye';
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPackModalOpen, setIsPackModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleSaveProfile = (name: string, avatar: string) => {
    const nextName = name.trim() ? name.trim() : playerName;
    setPlayerName(nextName);
    setSelectedAvatar(avatar);
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_NAME, nextName);
      localStorage.setItem(STORAGE_KEYS.SAVED_AVATAR, avatar);
    } catch {
      // ignore storage errors
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room') || params.get('code');
      if (roomParam) {
        setRoomCodeInput(roomParam.trim().toUpperCase().slice(0, 4));
        setOnlineTab('JOIN');
      }
    }
  }, []);

  const handleSlotChange = (index: number, rawVal: string) => {
    const cleaned = rawVal.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (!cleaned) {
      const chars = roomCodeInput.padEnd(4, ' ').split('');
      chars[index] = ' ';
      setRoomCodeInput(chars.join('').trimEnd());
      return;
    }

    // Handle multi-character paste or typing
    if (cleaned.length > 1) {
      const merged = (roomCodeInput.slice(0, index) + cleaned).slice(0, 4);
      setRoomCodeInput(merged);
      const focusIdx = Math.min(3, merged.length);
      slotRefs.current[focusIdx]?.focus();
      return;
    }

    const chars = roomCodeInput.padEnd(4, ' ').split('');
    chars[index] = cleaned;
    const nextCode = chars.join('').replace(/\s+$/g, '');
    setRoomCodeInput(nextCode);

    if (index < 3) {
      slotRefs.current[index + 1]?.focus();
    }
  };

  const handleSlotKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const currentChar = roomCodeInput[index] || '';
      if (!currentChar && index > 0) {
        e.preventDefault();
        const chars = roomCodeInput.padEnd(4, ' ').split('');
        chars[index - 1] = ' ';
        setRoomCodeInput(chars.join('').replace(/\s+$/g, ''));
        slotRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      slotRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      e.preventDefault();
      slotRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      handleJoinRoom(e);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!playerName.trim()) {
      setFormError('Masukkan nama pemain terlebih dahulu');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createRoom(playerName.trim(), selectedAvatar);
      if (res.success) {
        onEnterOnlineLobby();
      } else {
        setFormError(res.error || 'Gagal membuat meja');
      }
    } catch (err: any) {
      setFormError(err?.message || 'Gagal membuat meja');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    const cleanCode = roomCodeInput.replace(/\s+/g, '').toUpperCase();
    if (!cleanCode || cleanCode.length !== 4) {
      setFormError('Masukkan 4 karakter kode meja yang valid');
      return;
    }

    if (!playerName.trim()) {
      setFormError('Masukkan nama pemain terlebih dahulu');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await joinRoom(cleanCode, playerName.trim(), selectedAvatar);
      if (res.success) {
        onEnterOnlineLobby();
      } else {
        setFormError(res.error || 'Gagal bergabung ke meja');
      }
    } catch (err: any) {
      setFormError(err?.message || 'Gagal bergabung ke meja');
    } finally {
      setIsSubmitting(false);
    }
  };

  const token = resolveTokenAvatar(selectedAvatar, playerName);
  const pillTransition = shouldReduce
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 320, damping: 28 };

  return (
    <div className="min-h-[100dvh] text-ink flex flex-col font-sans">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-4 sm:py-7 space-y-5">
        {/* Compact Player Identity & Quick Actions Ticket Bar */}
        <section
          aria-label="Identitas pemain dan pintasan"
          className="rounded-3xl border border-rule bg-cardstock shadow-print p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <PlayerToken avatar={selectedAvatar} name={playerName} size="md" showCode={false} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-condensed text-lg sm:text-xl text-ink truncate">
                  {playerName}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-paper-muted border border-rule text-xs font-semibold text-ink-muted">
                  Pion {token.name}
                </span>
              </div>
              <p className="text-xs text-ink-muted truncate mt-0.5">
                Siap duduk di meja permainan (3 sampai 20 pemain)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              aria-label="Ubah profil pemain: nama dan pion"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-rule bg-paper hover:bg-paper-muted active:translate-y-[1px] transition-colors text-xs font-bold text-ink cursor-pointer"
            >
              <UserCircleGear className="w-4 h-4 text-teal-dark" weight="bold" />
              <span>Ubah Profil</span>
            </button>
            <button
              type="button"
              onClick={() => setIsPackModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-rule bg-paper hover:bg-paper-muted active:translate-y-[1px] transition-colors text-xs font-bold text-ink cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-sun-dark" weight="bold" />
              <span>Paket Kata Kustom</span>
            </button>
          </div>
        </section>

        {/* Two Balanced Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
          {/* Card 1: Pass & Play */}
          <section className="rounded-3xl border border-rule bg-cardstock shadow-print p-5 sm:p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-2xl bg-teal-light border border-teal text-teal-dark flex items-center justify-center shrink-0 shadow-print-sm">
                    <DeviceMobile className="w-6 h-6" weight="bold" />
                  </span>
                  <div>
                    <h1 className="font-condensed text-xl sm:text-2xl text-ink">
                      Main Satu HP
                    </h1>
                    <p className="text-xs text-ink-muted font-medium">
                      Pass &amp; Play di satu meja
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-teal-light border border-teal text-xs font-bold text-teal-dark">
                  Tanpa internet
                </span>
              </div>

              {/* Tactile Mini Role Strip Preview */}
              <div className="p-3 rounded-2xl bg-paper border border-rule grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-cardstock border border-rule">
                  <ShieldCheck className="w-4 h-4 text-teal-dark mx-auto mb-1" weight="bold" />
                  <span className="text-xs font-bold text-ink block">Warga</span>
                  <span className="text-[11px] text-ink-muted block">Kata sama</span>
                </div>
                <div className="p-2 rounded-xl bg-stamp-light border border-stamp">
                  <EyeSlash className="w-4 h-4 text-stamp-dark mx-auto mb-1" weight="bold" />
                  <span className="text-xs font-bold text-stamp-dark block">Impostor</span>
                  <span className="text-[11px] text-stamp-dark block">Kata mirip</span>
                </div>
                <div className="p-2 rounded-xl bg-sun-light border border-sun">
                  <Question className="w-4 h-4 text-sun-dark mx-auto mb-1" weight="bold" />
                  <span className="text-xs font-bold text-ink block">Mr. White</span>
                  <span className="text-[11px] text-ink-muted block">Tanpa kata</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs sm:text-sm text-ink font-medium pt-0.5">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-dark shrink-0" weight="bold" />
                  <span>3 sampai 20 pemain dalam satu perangkat</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-dark shrink-0" weight="bold" />
                  <span>Amplop kata rahasia aman dari intipan sebelah</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-dark shrink-0" weight="bold" />
                  <span>Konsensus meja atau voting rahasia bergiliran</span>
                </li>
              </ul>
            </div>

            <div className="pt-5 mt-5 border-t border-rule">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={onStartPassPlay}
                rightIcon={<ArrowRight className="w-4 h-4" weight="bold" />}
              >
                Mulai Main Satu HP
              </Button>
            </div>
          </section>

          {/* Card 2: Online Room */}
          <section className="rounded-3xl border border-rule bg-cardstock shadow-print p-5 sm:p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-2xl bg-sun-light border border-sun text-sun-dark flex items-center justify-center shrink-0 shadow-print-sm">
                    <WifiHigh className="w-6 h-6" weight="bold" />
                  </span>
                  <div>
                    <h2 className="font-condensed text-xl sm:text-2xl text-ink">
                      Ruangan Online
                    </h2>
                    <p className="text-xs text-ink-muted font-medium">
                      Masing-masing di HP sendiri
                    </p>
                  </div>
                </div>

                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
                    isConnected
                      ? 'bg-teal-light text-teal-dark border-teal'
                      : isConnecting
                      ? 'bg-paper-muted text-ink-muted border-rule'
                      : 'bg-stamp-light text-stamp-dark border-stamp'
                  )}
                >
                  {isConnected ? (
                    <>
                      <WifiHigh className="w-3.5 h-3.5" weight="bold" /> Terhubung
                    </>
                  ) : isConnecting ? (
                    <span>Menghubungkan…</span>
                  ) : (
                    <>
                      <WifiSlash className="w-3.5 h-3.5" weight="bold" /> Terputus
                    </>
                  )}
                </span>
              </div>

              {/* Sliding Pill Tab Switcher */}
              <div className="grid grid-cols-2 p-1 bg-paper-muted border border-rule rounded-full">
                <button
                  type="button"
                  onClick={() => {
                    setOnlineTab('HOST');
                    setFormError(null);
                    clearError();
                  }}
                  className={cn(
                    'relative py-2 text-xs font-bold rounded-full transition-colors cursor-pointer',
                    onlineTab === 'HOST' ? 'text-ink' : 'text-ink-muted hover:text-ink'
                  )}
                >
                  {onlineTab === 'HOST' && (
                    <motion.span
                      layoutId="home-online-pill"
                      transition={pillTransition}
                      className="absolute inset-0 rounded-full bg-cardstock border border-rule shadow-print-sm"
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative z-10">Buat Meja Baru</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOnlineTab('JOIN');
                    setFormError(null);
                    clearError();
                  }}
                  className={cn(
                    'relative py-2 text-xs font-bold rounded-full transition-colors cursor-pointer',
                    onlineTab === 'JOIN' ? 'text-ink' : 'text-ink-muted hover:text-ink'
                  )}
                >
                  {onlineTab === 'JOIN' && (
                    <motion.span
                      layoutId="home-online-pill"
                      transition={pillTransition}
                      className="absolute inset-0 rounded-full bg-cardstock border border-rule shadow-print-sm"
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative z-10">Masuk dengan Kode</span>
                </button>
              </div>

              {/* Tab Content */}
              {onlineTab === 'JOIN' ? (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="room-code-0" className="text-xs font-semibold text-ink-muted">
                      Masukkan 4 karakter kode meja:
                    </label>
                    {roomCodeInput.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setRoomCodeInput('');
                          slotRefs.current[0]?.focus();
                        }}
                        className="text-xs font-semibold text-ink-muted hover:text-ink underline cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {/* 4-Slot Tactile Ticket Input */}
                  <div className="grid grid-cols-4 gap-2.5">
                    {[0, 1, 2, 3].map((slotIdx) => {
                      const char = (roomCodeInput[slotIdx] || '').trim();
                      return (
                        <input
                          key={slotIdx}
                          id={slotIdx === 0 ? 'room-code-0' : undefined}
                          ref={(el) => {
                            slotRefs.current[slotIdx] = el;
                          }}
                          type="text"
                          inputMode="text"
                          autoCapitalize="characters"
                          autoComplete="off"
                          maxLength={4}
                          value={char}
                          placeholder={['K', 'O', 'P', '1'][slotIdx]}
                          aria-label={`Karakter kode meja ke-${slotIdx + 1}`}
                          onChange={(e) => handleSlotChange(slotIdx, e.target.value)}
                          onKeyDown={(e) => handleSlotKeyDown(slotIdx, e)}
                          className={cn(
                            'w-full h-14 rounded-2xl border font-mono text-2xl font-bold text-center text-ink placeholder:text-ink-faint/40 focus:outline-none focus:border-teal-dark focus:ring-2 focus:ring-teal transition-colors',
                            char ? 'bg-teal-light/40 border-teal-dark' : 'bg-paper border-rule'
                          )}
                        />
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-paper border border-dashed border-rule space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                      <PlusCircle className="w-4 h-4 text-teal-dark" weight="bold" />
                      Tiket Meja Otomatis
                    </span>
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-cardstock border border-rule text-teal-dark">
                      4 Huruf
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    Buka meja baru sebagai Host, lalu bagikan kode 4 huruf atau tautan undangan ke teman-temanmu.
                  </p>
                </div>
              )}

              {(formError || error) && (
                <div className="p-3 rounded-2xl bg-stamp-light border border-stamp text-stamp-dark text-xs font-semibold flex items-center gap-2">
                  {formError || error}
                </div>
              )}
            </div>

            <div className="pt-5 mt-5 border-t border-rule">
              {onlineTab === 'HOST' ? (
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onClick={handleCreateRoom}
                  isLoading={isSubmitting}
                  loadingText="Membuka meja…"
                  leftIcon={<PlusCircle className="w-4 h-4" weight="bold" />}
                >
                  Buka Meja Online
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleJoinRoom}
                  isLoading={isSubmitting}
                  loadingText="Masuk meja…"
                  leftIcon={<SignIn className="w-4 h-4" weight="bold" />}
                >
                  Gabung ke Meja
                </Button>
              )}
            </div>
          </section>
        </div>
      </main>

      <CustomWordPackModal
        isOpen={isPackModalOpen}
        onClose={() => setIsPackModalOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        initialName={playerName}
        initialAvatar={selectedAvatar}
        onSave={handleSaveProfile}
      />
    </div>
  );
};
export default HomePage;
