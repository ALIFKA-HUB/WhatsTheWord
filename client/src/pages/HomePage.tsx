import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Smartphone,
  Wifi,
  Sparkles,
  PlusCircle,
  LogIn,
  BookOpen,
  Shield,
  EyeOff,
  HelpCircle,
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
import { useGameSound } from '../hooks/useGameSound';
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
  const { playButtonTap } = useGameSound();

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
    <div className="min-h-[100dvh] bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 font-sans">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:py-10 flex flex-col justify-center space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]"
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Cyber Social Word Deduction Game</span>
          </motion.div>

          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight bg-gradient-to-r from-cyan-300 via-white to-rose-400 bg-clip-text text-transparent leading-tight">
            WHAT'S THE WORD
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
            Temukan penyusup di antara warga sipil! Satu kata rahasia yang mirip, perdebatan sengit, dan satu Butakata (Mr. White) yang menyamar tanpa tahu apa-apa.
          </p>

          {/* Quick Roles Overview */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <Badge variant="cyan" size="sm" icon={<Shield className="w-3 h-3" />}>
              Warga (Satu Kata)
            </Badge>
            <Badge variant="crimson" size="sm" icon={<EyeOff className="w-3 h-3" />}>
              Impostor (Kata Mirip)
            </Badge>
            <Badge variant="violet" size="sm" icon={<HelpCircle className="w-3 h-3" />}>
              Mr. White (Tanpa Kata)
            </Badge>
          </div>
        </div>

        {/* Mode Selector Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* 1. Offline Pass & Play Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="h-full"
          >
            <Card
              glow="cyan"
              padding="lg"
              className="h-full flex flex-col justify-between border-cyan-500/30 hover:border-cyan-400/50 bg-gradient-to-b from-slate-900/90 to-slate-950/90 group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_-3px_rgba(6,182,212,0.3)] group-hover:scale-110 transition-transform">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <Badge variant="cyan" size="sm">
                    1 HP Offline
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold font-display text-slate-100 group-hover:text-cyan-300 transition-colors">
                    Pass &amp; Play (Offline)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Main bersama teman dalam satu lingkaran hanya dengan <strong>1 smartphone</strong>. Ganti-gantian intip kata rahasia tanpa butuh internet!
                  </p>
                </div>

                <ul className="text-xs text-slate-400 space-y-1.5 pt-1">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    3 - 20 Pemain Offline
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Sensor intip layar &amp; suara buzzer
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Bank kata ratusan pasang Indonesia
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={onStartPassPlay}
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Mulai Mode 1 HP
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* 2. Online Multi-Device Room Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="h-full"
          >
            <Card
              glow="violet"
              padding="lg"
              className="h-full flex flex-col justify-between border-purple-500/30 hover:border-purple-400/50 bg-gradient-to-b from-slate-900/90 to-slate-950/90"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_20px_-3px_rgba(168,85,247,0.3)]">
                    <Wifi className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full',
                        isConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'
                      )}
                    />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      {isConnecting
                        ? 'Menghubungkan...'
                        : isConnected
                        ? 'Online Room'
                        : 'Server Offline'}
                    </span>
                  </div>
                </div>

                {/* Tab switcher: Host vs Join */}
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950/80 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setOnlineTab('HOST');
                      setFormError(null);
                      try {
                        playButtonTap();
                      } catch {}
                    }}
                    className={cn(
                      'flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all',
                      onlineTab === 'HOST'
                        ? 'bg-purple-500/25 text-purple-200 border border-purple-400/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    )}
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Buat Room (Host)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOnlineTab('JOIN');
                      setFormError(null);
                      try {
                        playButtonTap();
                      } catch {}
                    }}
                    className={cn(
                      'flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all',
                      onlineTab === 'JOIN'
                        ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    )}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Gabung Room
                  </button>
                </div>

                {/* Nickname & Avatar Picker */}
                <AvatarPicker
                  nickname={playerName}
                  onNicknameChange={setPlayerName}
                  selectedAvatar={selectedAvatar}
                  onSelectAvatar={setSelectedAvatar}
                  className="space-y-3"
                />

                {/* Join Tab Specific: Room Code Input */}
                {onlineTab === 'JOIN' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Kode Room (4 Karakter)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 7K9X"
                      value={roomCodeInput}
                      onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                      maxLength={4}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 text-cyan-300 font-mono text-center font-bold text-lg tracking-widest uppercase placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                )}

                {/* Error Banner */}
                {(formError || error) && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{formError || error}</span>
                  </div>
                )}
              </div>

              <div className="pt-5">
                {onlineTab === 'HOST' ? (
                  <Button
                    variant="accent"
                    size="lg"
                    fullWidth
                    isLoading={isSubmitting}
                    onClick={handleCreateRoom}
                    leftIcon={<PlusCircle className="w-5 h-5" />}
                  >
                    Buat Room Baru
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={isSubmitting}
                    onClick={handleJoinRoom}
                    leftIcon={<LogIn className="w-5 h-5" />}
                  >
                    Gabung Room Sekarang
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Custom Word Pack Feature Button */}
        <div className="flex items-center justify-center pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsPackModalOpen(true)}
            leftIcon={<BookOpen className="w-4 h-4 text-cyan-400" />}
            className="text-xs font-semibold border-cyan-500/20 hover:border-cyan-400/40"
          >
            Buka Pembuat Paket Kata Kustom
          </Button>
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

export default HomePage;
