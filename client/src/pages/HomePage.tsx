import React, { useState, useEffect } from 'react';

import {
  Smartphone,
  Wifi,
  PlusCircle,
  LogIn,
  BookOpen,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { AvatarPicker, PRESET_AVATARS } from '../components/game/AvatarPicker';
import { CustomWordPackModal } from '../components/lobby/CustomWordPackModal';
import { useSocket } from '../hooks/useSocket';
import { STORAGE_KEYS } from '../context/SocketContext';
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
      return localStorage.getItem(STORAGE_KEYS.SAVED_NAME) || 'Agent_' + Math.floor(10 + Math.random() * 90);
    }
    return 'Agent_47';
  });
  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.SAVED_AVATAR) || PRESET_AVATARS[0].emoji;
    }
    return PRESET_AVATARS[0].emoji;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPackModalOpen, setIsPackModalOpen] = useState(false);

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
      setFormError('Masukkan 4 karakter kode room yang valid');
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
        setFormError(res.error || 'Gagal bergabung ke room');
      }
    } catch (err: any) {
      setFormError(err?.message || 'Gagal bergabung ke room');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#09090b] text-zinc-100 flex flex-col selection:bg-zinc-700 selection:text-white font-sans">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center space-y-10">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center p-2.5 shadow-sm">
              <img src="/logo.svg" alt="What's The Word Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-100 font-sans">
              WHAT'S THE WORD
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
              Permainan deduksi kata sosial. Temukan penyusup di antara warga sipil dengan satu kata rahasia yang mirip dan Mr. White yang menyamar tanpa kata.
            </p>
          </div>

          {/* Minimalist Role Tags */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-xs">
            <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium">
              Warga <span className="text-zinc-500 font-normal">· Kata Sama</span>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-rose-950/30 border border-rose-900/40 text-rose-300 font-medium">
              Impostor <span className="text-rose-400/60 font-normal">· Kata Mirip</span>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-purple-950/30 border border-purple-900/40 text-purple-300 font-medium">
              Mr. White <span className="text-purple-400/60 font-normal">· Tanpa Kata</span>
            </span>
          </div>
        </div>

        {/* Mode Selector Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
          {/* 1. Offline Pass & Play Card */}
          <Card
            padding="lg"
            className="h-full flex flex-col justify-between border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/70 hover:border-zinc-700 transition-all group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200">
                  <Smartphone className="w-5 h-5" />
                </div>
                <Badge variant="slate" size="sm">
                  1 HP Offline
                </Badge>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-zinc-100">
                  Pass &amp; Play
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Main bersama dalam 1 perangkat tanpa koneksi internet. Oper HP bergantian untuk intip kata rahasia dan mulai diskusi langsung.
                </p>
              </div>

              <div className="pt-2 text-xs text-zinc-500 space-y-1 font-mono">
                <div>• 3 - 20 Pemain</div>
                <div>• Sensor tap/hold intip rahasia</div>
                <div>• 64+ Pasang kata bahasa Indonesia</div>
              </div>
            </div>

            <div className="pt-6">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={onStartPassPlay}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Mulai Mode 1 HP
              </Button>
            </div>
          </Card>

          {/* 2. Online Multi-Device Room Card */}
          <Card
            padding="lg"
            className="h-full flex flex-col justify-between border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 transition-all"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200">
                  <Wifi className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full',
                      isConnected ? 'bg-emerald-400' : isConnecting ? 'bg-amber-400 animate-pulse' : 'bg-rose-400'
                    )}
                  />
                  <span className="text-[11px] font-mono text-zinc-400">
                    {isConnected ? 'Online' : isConnecting ? 'Menghubungkan...' : 'Offline'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-zinc-100">
                  Multi-Device Online
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Setiap pemain menggunakan smartphone masing-masing secara realtime dengan sinkronisasi voting &amp; timer.
                </p>
              </div>

              {/* Minimal Tabs */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => {
                    setOnlineTab('HOST');
                    setFormError(null);
                    clearError();
                  }}
                  className={cn(
                    'py-1.5 rounded-lg transition-all',
                    onlineTab === 'HOST'
                      ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-300'
                  )}
                >
                  Buat Room
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOnlineTab('JOIN');
                    setFormError(null);
                    clearError();
                  }}
                  className={cn(
                    'py-1.5 rounded-lg transition-all',
                    onlineTab === 'JOIN'
                      ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-300'
                  )}
                >
                  Gabung Room
                </button>
              </div>

              {/* Minimal Form */}
              <div className="space-y-3 pt-1">
                {/* Name & Avatar Row */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
                    Nama &amp; Avatar Agen
                  </label>
                  <div className="flex items-center gap-2">
                    <AvatarPicker
                      selectedAvatar={selectedAvatar}
                      onSelectAvatar={setSelectedAvatar}
                      showNicknameInput={false}
                    />
                    <input
                      type="text"
                      maxLength={18}
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Nama kamu..."
                      className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 text-zinc-100 text-sm outline-none transition-all placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                {/* Join Code Input */}
                {onlineTab === 'JOIN' && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
                      Kode Room (4 Huruf)
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={roomCodeInput}
                      onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                      placeholder="MISAL: KOP1"
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 text-zinc-100 text-sm font-mono tracking-widest text-center uppercase outline-none transition-all placeholder:text-zinc-600"
                    />
                  </div>
                )}

                {/* Error Banner */}
                {(formError || error) && (
                  <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/50 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError || error}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-5">
              {onlineTab === 'HOST' ? (
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onClick={handleCreateRoom}
                  isLoading={isSubmitting}
                  loadingText="Membuat Room..."
                  leftIcon={<PlusCircle className="w-4 h-4" />}
                >
                  Buat Room Baru
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onClick={handleJoinRoom}
                  isLoading={isSubmitting}
                  loadingText="Bergabung..."
                  leftIcon={<LogIn className="w-4 h-4" />}
                >
                  Gabung ke Room
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-800/60 text-xs text-zinc-500">
          <button
            type="button"
            onClick={() => setIsPackModalOpen(true)}
            className="flex items-center gap-2 hover:text-zinc-300 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>Paket Kata Kustom / Komunitas</span>
          </button>

          <div className="font-mono text-[11px] text-zinc-600">
            What's The Word · v1.0.0
          </div>
        </div>
      </main>

      {/* Custom Word Pack Modal */}
      <CustomWordPackModal
        isOpen={isPackModalOpen}
        onClose={() => setIsPackModalOpen(false)}
      />
    </div>
  );
};
