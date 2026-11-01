import React, { useState, useEffect } from 'react';

import { WifiHigh, WifiSlash, PlusCircle, SignIn, BookOpen, ArrowRight, DeviceMobile } from '@phosphor-icons/react';

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

  // Auto-detect room code from URL query param ?room=XXXX or ?code=XXXX
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
      setFormError('Masukkan nama agen terlebih dahulu');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createRoom(playerName.trim(), selectedAvatar);
      if (res.success) {
        onEnterOnlineLobby();
      } else {
        setFormError(res.error || 'Gagal membuat room');
      }
    } catch (err: any) {
      setFormError(err?.message || 'Gagal membuat room');
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
      setFormError('Masukkan nama agen terlebih dahulu');
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

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 sm:py-10 space-y-7">
        {/* Box-Lid Masthead */}
        <section className="relative rounded-2xl border-2 border-rule bg-cardstock shadow-print p-5 sm:p-7 overflow-hidden">
          <span className="halftone-dots absolute top-0 right-0 w-28 h-20 opacity-25 rounded-bl-3xl pointer-events-none" aria-hidden="true" />
          {/* corner catalog specs */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <span className="font-mono text-[11px] font-bold tracking-[0.14em] text-ink-muted uppercase border border-rule px-3 py-1 bg-white rounded-full">
              3-20 Pemain
            </span>
            <span className="font-mono text-[11px] font-bold tracking-[0.14em] text-ink-muted uppercase border border-rule px-3 py-1 bg-white rounded-full">
              Durasi 10 Menit
            </span>
            <span className="font-mono text-[11px] font-bold tracking-[0.14em] text-ink-muted uppercase border border-rule px-3 py-1 bg-white rounded-full">
              64+ Pasang Kata
            </span>
          </div>

          {/* headline + rotated stamp */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <h1 className="font-condensed text-5xl sm:text-7xl leading-[0.95] text-ink">
                What's
                <br />
                The Word
              </h1>
              <p className="mt-3 max-w-[46ch] text-sm text-ink-muted leading-relaxed">
                Permainan kartu deduksi kata. Temukan penyusup yang menyamar di antara warga sipil.
              </p>
            </div>
            <div className="self-start sm:pt-1">
              <span className="rubber-stamp-red -rotate-2 text-xs sm:text-sm">
                Rahasia Meja
              </span>
            </div>
          </div>

          {/* box-lid illustration banner */}
          <div className="mt-5 rounded-xl border-2 border-rule shadow-print-sm bg-cardstock-warm overflow-hidden">
            <img
              src="/assets/box-lid-art.svg"
              alt="Ilustrasi meja permainan dengan kartu rahasia dan stempel"
              className="w-full block"
            />
            {/* role caption strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 border-t-2 border-rule divide-y sm:divide-y-0 sm:divide-x-2 divide-rule text-[11px] font-mono font-bold uppercase tracking-wider bg-cardstock">
              <span className="px-3 py-2 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-ink inline-block shrink-0 rounded-sm" /> Warga: Kata Sama
              </span>
              <span className="px-3 py-2 flex items-center gap-1.5 text-stamp-dark">
                <span className="w-2.5 h-2.5 bg-stamp inline-block shrink-0 rounded-sm" /> Impostor: Kata Mirip
              </span>
              <span className="px-3 py-2 flex items-center gap-1.5 text-ink-muted">
                <span className="w-2.5 h-2.5 border border-dashed border-rule inline-block shrink-0 rounded-sm" /> Mr. White: Kartu Kosong
              </span>
            </div>
          </div>
        </section>

        {/* Two tilted mode cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 01: Pass & Play */}
          <section className="relative rounded-2xl border-2 border-rule bg-cardstock shadow-print p-5 sm:p-6 flex flex-col md:-rotate-[0.8deg] hover:rotate-0 transition-transform">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-xl bg-teal-light text-teal-dark flex items-center justify-center shrink-0 shadow-print-sm">
                  <DeviceMobile className="w-6 h-6" weight="bold" />
                </span>
                <h2 className="font-condensed text-2xl sm:text-3xl text-ink leading-none">
                  Main Satu HP
                </h2>
              </div>
              <span className="font-condensed text-stamp-dark text-base rounded-lg border border-stamp px-2 py-0.5 -rotate-3 select-none">
                Mode 01
              </span>
            </div>
            <p className="mt-3 text-sm text-ink-muted leading-relaxed">
              Bermain bersama dalam satu perangkat. Oper HP bergantian untuk mengintip kata rahasia, lalu diskusi dan voting di meja.
            </p>

            {/* tactile checklist */}
            <ul className="mt-4 space-y-1.5 text-sm text-ink font-medium">
              <li className="flex items-center gap-2">
                <span className="w-3 h-3 border border-rule bg-stamp shrink-0 rounded-sm" /> 3 sampai 20 pemain
              </li>
              <li className="flex items-center gap-2">
                <span className="w-3 h-3 border border-rule bg-cardstock shrink-0 rounded-sm" /> Tahan kartu untuk mengintip
              </li>
              <li className="flex items-center gap-2">
                <span className="w-3 h-3 border border-rule bg-ink shrink-0 rounded-sm" /> Tanpa internet
              </li>
            </ul>

            <div className="pt-6 mt-auto">
              <Button variant="primary" size="lg" fullWidth onClick={onStartPassPlay} rightIcon={<ArrowRight className="w-4 h-4" weight="bold" />}>
                Buka Meja 1 HP
              </Button>
            </div>
          </section>

          {/* Card 02: Online */}
          <section className="relative rounded-2xl border-2 border-rule bg-cardstock shadow-print p-5 sm:p-6 flex flex-col md:rotate-[0.8deg] hover:rotate-0 transition-transform">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-xl bg-stamp-light text-stamp-dark flex items-center justify-center shrink-0 shadow-print-sm">
                  <WifiHigh className="w-6 h-6" weight="bold" />
                </span>
                <h2 className="font-condensed text-2xl sm:text-3xl text-ink leading-none">
                  Ruangan Online
                </h2>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={cn('rubber-stamp text-[10px]', isConnected ? '' : isConnecting ? '' : 'rubber-stamp-red')}>
                  {isConnected ? (
                    <>
                      <WifiHigh className="w-3 h-3 text-teal" weight="bold" /> Online
                    </>
                  ) : isConnecting ? (
                    <>
                      <span className="animate-pulse w-1.5 h-1.5 bg-ink inline-block" /> Hubung
                    </>
                  ) : (
                    <>
                      <WifiSlash className="w-3 h-3" weight="bold" /> Offline
                    </>
                  )}
                </span>
                <span className="font-condensed text-ink text-base bg-cardstock-warm px-2 py-0.5 rotate-2 select-none border border-rule rounded-lg">
                  Mode 02
                </span>
              </div>
            </div>

            {/* profile token bar */}
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="mt-3.5 w-full flex items-center gap-3 px-3 py-2 rounded-xl border border-rule bg-paper hover:bg-paper-muted active:translate-x-[2px] active:translate-y-[2px] transition-all text-left group"
              aria-label="Ubah profil agen: nama dan token"
            >
              <PlayerToken avatar={selectedAvatar} name={playerName} size="sm" showCode={false} />
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-bold text-ink truncate">{playerName}</span>
                <span className="block text-[11px] text-ink-muted">Token: {token.name}</span>
              </span>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-stamp-dark border border-stamp px-1.5 py-0.5 -rotate-2 rounded">
                Ubah
              </span>
            </button>

            {/* tab switch */}
            <div className="mt-3 grid grid-cols-2 border border-rule rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  setOnlineTab('HOST');
                  setFormError(null);
                  clearError();
                }}
                className={cn(
                  'py-2 text-xs font-bold uppercase tracking-wider font-mono transition-all',
                  onlineTab === 'HOST' ? 'bg-teal text-ink shadow-inner' : 'bg-cardstock text-ink-muted hover:text-ink'
                )}
              >
                Buat Meja
              </button>
              <button
                type="button"
                onClick={() => {
                  setOnlineTab('JOIN');
                  setFormError(null);
                  clearError();
                }}
                className={cn(
                  'py-2 text-xs font-bold uppercase tracking-wider font-mono transition-all',
                  onlineTab === 'JOIN' ? 'bg-teal text-ink shadow-inner' : 'bg-cardstock text-ink-muted hover:text-ink'
                )}
              >
                Masuk Kode
              </button>
            </div>

            {/* form */}
            <div className="mt-3 space-y-3 flex-1 flex flex-col justify-between">
              {onlineTab === 'JOIN' ? (
                <div className="space-y-1.5">
                  <label htmlFor="room-code" className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-ink-muted">
                    Kode Meja (4 Huruf)
                  </label>
                  <input
                    id="room-code"
                    type="text"
                    maxLength={4}
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                    placeholder="KOP1"
                    className="w-full px-3 py-2 rounded-xl bg-paper border border-rule font-mono text-xl tracking-[0.35em] uppercase text-center text-ink placeholder:text-ink-faint/50 focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/30"
                  />
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-paper border border-rule text-xs text-ink-muted space-y-1">
                  <p className="font-bold text-ink flex items-center gap-1.5">
                    <PlusCircle className="w-3.5 h-3.5 text-teal" weight="bold" /> Buka Ruangan Baru
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    Sistem akan membuatkan kode meja 4 huruf unik. Kamu otomatis menjadi Host.
                  </p>
                </div>
              )}

              {(formError || error) && (
                <div className="p-2.5 rounded-lg bg-stamp-light border border-stamp text-stamp-dark text-xs font-bold flex items-center gap-2 font-mono uppercase tracking-wide">
                  {formError || error}
                </div>
              )}

              <div className="pt-2">
                {onlineTab === 'HOST' ? (
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleCreateRoom}
                    isLoading={isSubmitting}
                    loadingText="Membuka meja..."
                    leftIcon={<PlusCircle className="w-4 h-4" weight="bold" />}
                  >
                    Buka Meja Baru
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleJoinRoom}
                    isLoading={isSubmitting}
                    loadingText="Masuk meja..."
                    leftIcon={<SignIn className="w-4 h-4" weight="bold" />}
                  >
                    Masuk ke Meja
                  </Button>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Bottom dossier strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4">
          <button
            type="button"
            onClick={() => setIsPackModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 border border-rule bg-cardstock shadow-print-sm hover:bg-paper-muted active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-xs font-bold uppercase tracking-wider font-mono text-ink"
          >
            <BookOpen className="w-4 h-4" weight="bold" />
            Kelola Paket Kata
          </button>
        </div>
      </main>

      {/* Custom Word Pack Modal */}
      <CustomWordPackModal
        isOpen={isPackModalOpen}
        onClose={() => setIsPackModalOpen(false)}
      />

      {/* Profile Modal */}
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
