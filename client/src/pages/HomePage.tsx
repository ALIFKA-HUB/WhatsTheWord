import React, { useState, useEffect } from 'react';

import { WifiHigh, WifiSlash, PlusCircle, SignIn, BookOpen, ArrowRight, DeviceMobile, CheckCircle } from '@phosphor-icons/react';

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

  const [onlineTab, setOnlineTab] = useState<OnlineTab>('HOST');
  const [roomCodeInput, setRoomCodeInput] = useState('');
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
        setRoomCodeInput(roomParam.trim().toUpperCase());
        setOnlineTab('JOIN');
      }
    }
  }, []);

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

    const cleanCode = roomCodeInput.trim().toUpperCase();
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

  return (
    <div className="min-h-[100dvh] text-ink flex flex-col font-sans">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 sm:py-9 space-y-6">
        {/* Welcoming Hero / Intro Card */}
        <section className="rounded-3xl border border-rule bg-cardstock shadow-print p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-paper-muted border border-rule text-xs font-semibold text-ink-muted">
                  3 sampai 20 pemain
                </span>
                <span className="px-3 py-1 rounded-full bg-paper-muted border border-rule text-xs font-semibold text-ink-muted">
                  Sekitar 10 menit
                </span>
                <span className="px-3 py-1 rounded-full bg-paper-muted border border-rule text-xs font-semibold text-ink-muted">
                  64+ pasang kata
                </span>
              </div>
              <h1 className="font-condensed text-3xl sm:text-5xl text-ink pt-1">
                What’s The Word
              </h1>
              <p className="max-w-[52ch] text-sm sm:text-base text-ink-muted leading-relaxed">
                Permainan deduksi kata bersama teman. Berikan satu petunjuk setiap putaran dan temukan siapa yang memegang kata berbeda di meja.
              </p>
            </div>
          </div>

          {/* Calm 3-role guide - clean docket columns without nested box borders */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-rule text-xs">
            <div className="flex items-start gap-2.5">
              <span className="w-2 h-2 rounded-full bg-teal-dark shrink-0 mt-1" />
              <div>
                <span className="font-bold text-ink block">Warga</span>
                <span className="text-ink-muted leading-tight">Menerima kata rahasia yang sama</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-2 h-2 rounded-full bg-stamp shrink-0 mt-1" />
              <div>
                <span className="font-bold text-ink block">Impostor</span>
                <span className="text-ink-muted leading-tight">Menerima kata yang mirip</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-2 h-2 rounded-full bg-sun-dark shrink-0 mt-1" />
              <div>
                <span className="font-bold text-ink block">Mr. White</span>
                <span className="text-ink-muted leading-tight">Tanpa kata, menebak kata warga</span>
              </div>
            </div>
          </div>
        </section>

        {/* Two Balanced Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Card 1: Pass & Play */}
          <section className="rounded-3xl border border-rule bg-cardstock shadow-print p-5 sm:p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-2xl bg-teal-light border border-teal text-teal-dark flex items-center justify-center shrink-0 shadow-print-sm">
                    <DeviceMobile className="w-6 h-6" weight="bold" />
                  </span>
                  <div>
                    <h2 className="font-condensed text-xl sm:text-2xl text-ink">
                      Main Satu HP
                    </h2>
                    <p className="text-xs text-ink-muted font-medium">
                      Pass &amp; Play di satu meja
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-paper-muted border border-rule text-xs font-semibold text-ink-muted">
                  Tanpa internet
                </span>
              </div>

              <p className="text-sm text-ink-muted leading-relaxed">
                Cocok saat berkumpul langsung. Oper satu HP secara bergiliran untuk mengintip kata rahasia, lalu berdiskusi dan memilih di meja.
              </p>

              <ul className="space-y-2 text-xs sm:text-sm text-ink font-medium pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-dark shrink-0" weight="bold" />
                  <span>3 sampai 20 pemain dalam satu perangkat</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-dark shrink-0" weight="bold" />
                  <span>Kartu amplop aman dari intipan sebelah</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-dark shrink-0" weight="bold" />
                  <span>Mendukung konsensus meja maupun voting rahasia</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-rule">
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

              {/* Profile Selector Bar - Clean Hairline Row */}
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="w-full flex items-center gap-3 py-2.5 px-1 border-y border-rule hover:bg-paper-muted/60 active:translate-y-[1px] transition-colors text-left"
                aria-label="Ubah profil pemain: nama dan pion"
              >
                <PlayerToken avatar={selectedAvatar} name={playerName} size="sm" showCode={false} />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-bold text-ink truncate">{playerName}</span>
                  <span className="block text-xs text-ink-muted">Pion: {token.name}</span>
                </span>
                <span className="text-xs font-semibold text-teal-dark bg-teal-light px-2.5 py-1 rounded-full border border-teal">
                  Ubah Profil
                </span>
              </button>

              {/* Pill Tab Switcher */}
              <div className="grid grid-cols-2 p-1 bg-paper-muted border border-rule rounded-full">
                <button
                  type="button"
                  onClick={() => {
                    setOnlineTab('HOST');
                    setFormError(null);
                    clearError();
                  }}
                  className={cn(
                    'py-1.5 text-xs font-semibold rounded-full transition-colors',
                    onlineTab === 'HOST'
                      ? 'bg-cardstock text-ink shadow-print-sm font-bold'
                      : 'text-ink-muted hover:text-ink'
                  )}
                >
                  Buat Meja Baru
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOnlineTab('JOIN');
                    setFormError(null);
                    clearError();
                  }}
                  className={cn(
                    'py-1.5 text-xs font-semibold rounded-full transition-colors',
                    onlineTab === 'JOIN'
                      ? 'bg-cardstock text-ink shadow-print-sm font-bold'
                      : 'text-ink-muted hover:text-ink'
                  )}
                >
                  Masuk dengan Kode
                </button>
              </div>

              {/* Tab Content */}
              {onlineTab === 'JOIN' ? (
                <div className="space-y-1.5">
                  <label htmlFor="room-code" className="text-xs font-semibold text-ink-muted block">
                    Kode meja (4 huruf)
                  </label>
                  <input
                    id="room-code"
                    type="text"
                    maxLength={4}
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                    placeholder="KOP1"
                    className="w-full px-3 py-2.5 rounded-2xl bg-paper border border-rule font-mono text-xl font-bold text-center text-ink placeholder:text-ink-faint/50 focus:outline-none focus:border-teal-dark focus:ring-2 focus:ring-teal transition-colors"
                  />
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-paper border border-rule text-xs text-ink-muted space-y-1">
                  <p className="font-bold text-ink flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-teal-dark" weight="bold" /> Buat Meja Permainan
                  </p>
                  <p className="leading-relaxed">
                    Sistem akan membuatkan kode meja 4 huruf untuk dibagikan ke teman-temanmu.
                  </p>
                </div>
              )}

              {(formError || error) && (
                <div className="p-3 rounded-2xl bg-stamp-light border border-stamp text-stamp-dark text-xs font-semibold flex items-center gap-2">
                  {formError || error}
                </div>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-rule">
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

        {/* Footer Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 pb-4">
          <p className="text-xs text-ink-muted">
            Ingin bermain dengan daftar kata buatan sendiri?
          </p>
          <button
            type="button"
            onClick={() => setIsPackModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-rule bg-cardstock shadow-print-sm hover:bg-paper-muted active:translate-y-[1px] transition-colors text-xs font-bold text-ink"
          >
            <BookOpen className="w-4 h-4 text-teal-dark" weight="bold" />
            Kelola Paket Kata Kustom
          </button>
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
