import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Play,
  Clock,
  Shield,
  EyeOff,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Dices,
  Vote,
  Shuffle,
} from 'lucide-react';
import { usePassPlay } from '../context/PassPlayContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { PRESET_AVATARS } from '../components/game/AvatarPicker';
import { getLocalCustomPacks } from '../services/wordPackService';
import { CustomWordPack } from '../types/game.types';
import { Header } from '../components/common/Header';

const TURN_DURATION_OPTIONS = [
  { label: '30s', value: 30, desc: 'Cepat & Intens' },
  { label: '45s', value: 45, desc: 'Standar' },
  { label: '60s', value: 60, desc: 'Santai' },
  { label: 'Bebas', value: 0, desc: 'Tanpa Timer' },
];

const ALL_PLAYER_COUNTS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

const RANDOM_NAMES = [
  'Agent Cyber', 'Neon Fox', 'Shadow Byte', 'Phantom V', 'Holo Viper',
  'Specter 7', 'Cyborg Zero', 'Matrix Ghost', 'Alpha Wolf', 'Quantum Cat',
  'Vector Blade', 'Nova Spark', 'Echo Pulse', 'Stealth Hawk', 'Apex Sentinel'
];

export interface PassPlaySetupPageProps {
  onBack?: () => void;
}

export const PassPlaySetupPage: React.FC<PassPlaySetupPageProps> = ({ onBack }) => {
  const {
    players,
    settings,
    setPlayers,
    updateSettings,
    startPassPlayGame,
  } = usePassPlay();

  // Step Wizard state: 1 = Roles & Count, 2 = Category & Rules, 3 = Player Names & Avatars
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [totalPlayerCount, setTotalPlayerCount] = useState<number>(players.length || 4);
  const [customPacks, setCustomPacks] = useState<CustomWordPack[]>([]);

  // Avatar picker popup for specific player index
  const [avatarPickerPlayerIndex, setAvatarPickerPlayerIndex] = useState<number | null>(null);

  // Smooth Drag & Auto-Center Scroll for Player Count Carousel
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  // Auto-scroll selected number to center
  const scrollToActiveNumber = useCallback((count: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const targetElement = container.querySelector(`[data-player-count="${count}"]`) as HTMLElement;
    if (targetElement) {
      const containerWidth = container.offsetWidth;
      const targetLeft = targetElement.offsetLeft;
      const targetWidth = targetElement.offsetWidth;
      container.scrollTo({
        left: targetLeft - containerWidth / 2 + targetWidth / 2,
        behavior: 'smooth',
      });
    }
  }, []);

  useEffect(() => {
    scrollToActiveNumber(totalPlayerCount);
  }, [totalPlayerCount, scrollToActiveNumber]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX - (scrollContainerRef.current?.offsetLeft || 0);
    scrollLeftRef.current = scrollContainerRef.current?.scrollLeft || 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollContainerRef.current.offsetLeft || 0);
    const walk = (x - startXRef.current) * 1.5; // Drag sensitivity
    if (Math.abs(walk) > 4) hasMovedRef.current = true;
    scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  // Load custom packs from localStorage
  useEffect(() => {
    try {
      const packs = getLocalCustomPacks();
      setCustomPacks(packs);
    } catch {
      // ignore
    }
  }, []);

  // Sync player count with players array
  const adjustPlayerCount = (newCount: number) => {
    const clamped = Math.max(2, Math.min(20, newCount));
    setTotalPlayerCount(clamped);

    setPlayers((prev) => {
      if (prev.length === clamped) return prev;
      if (prev.length < clamped) {
        const added: typeof prev = [];
        for (let i = prev.length; i < clamped; i++) {
          const avatar = PRESET_AVATARS[i % PRESET_AVATARS.length].emoji;
          added.push({
            id: 'p_' + Date.now() + '_' + i,
            name: 'Pemain ' + (i + 1),
            avatar,
            isHost: i === 0,
            isAlive: true,
            hasVoted: false,
          });
        }
        return [...prev, ...added];
      } else {
        return prev.slice(0, clamped);
      }
    });

    // Auto-balance roles when total changes
    const mrWhite = settings.enableMrWhite ? 1 : 0;
    const maxUndercover = Math.max(1, Math.floor((clamped - mrWhite - 1) / 2));
    const nextUndercover = Math.min(Math.max(1, settings.undercoverCount || 1), maxUndercover);
    const nextCivilian = clamped - nextUndercover - mrWhite;

    updateSettings({
      undercoverCount: nextUndercover,
      civilianCount: nextCivilian,
    });
  };

  // Role constraints
  const mrWhiteCount = settings.enableMrWhite ? 1 : 0;
  const maxUndercover = Math.max(1, Math.floor((totalPlayerCount - mrWhiteCount - 1) / 2));
  const currentUndercover = Math.min(Math.max(1, settings.undercoverCount), maxUndercover);
  const currentCivilian = Math.max(1, totalPlayerCount - currentUndercover - mrWhiteCount);

  const handleUndercoverChange = (delta: number) => {
    const next = Math.max(1, Math.min(maxUndercover, currentUndercover + delta));
    updateSettings({
      undercoverCount: next,
      civilianCount: totalPlayerCount - next - mrWhiteCount,
    });
  };

  const handleToggleMrWhite = () => {
    const nextEnable = !settings.enableMrWhite;
    const nextMrWhite = nextEnable ? 1 : 0;
    const nextMaxUndercover = Math.max(1, Math.floor((totalPlayerCount - nextMrWhite - 1) / 2));
    const nextUndercover = Math.min(currentUndercover, nextMaxUndercover);
    const nextCivilian = totalPlayerCount - nextUndercover - nextMrWhite;

    updateSettings({
      enableMrWhite: nextEnable,
      mrWhiteCount: nextMrWhite,
      undercoverCount: nextUndercover,
      civilianCount: nextCivilian,
    });
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    setPlayers((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], name };
      }
      return updated;
    });
  };

  const handleSelectAvatar = (index: number, avatar: string) => {
    setPlayers((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], avatar };
      }
      return updated;
    });
    setAvatarPickerPlayerIndex(null);
  };

  const handleRandomizeSingleName = (index: number) => {
    const randomName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    const randomAvatar = PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)].emoji;
    setPlayers((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], name: randomName, avatar: randomAvatar };
      }
      return updated;
    });
  };

  const handleRandomizeAll = () => {
    const shuffledNames = [...RANDOM_NAMES].sort(() => Math.random() - 0.5);
    const shuffledAvatars = [...PRESET_AVATARS].sort(() => Math.random() - 0.5);

    setPlayers((prev) =>
      prev.map((p, idx) => ({
        ...p,
        name: shuffledNames[idx % shuffledNames.length] || 'Pemain ' + (idx + 1),
        avatar: shuffledAvatars[idx % shuffledAvatars.length]?.emoji || '🕵️',
      }))
    );
  };

  const handleStartGame = () => {
    // Fill empty names if any
    setPlayers((prev) =>
      prev.map((p, idx) => ({
        ...p,
        name: p.name.trim() || 'Pemain ' + (idx + 1),
      }))
    );

    const success = startPassPlayGame();
    if (!success) {
      alert('Minimal 2 pemain untuk memulai permainan!');
    }
  };

  const ALL_CATEGORY_OPTIONS = [
    { id: '🎲 Acak / Misteri', title: 'Acak / Misteri', icon: '🎲', desc: 'Paling seru! Kategori dirahasiakan & dipilih acak' },
    { id: 'Makanan & Minuman', title: 'Makanan & Minuman', icon: '🍔', desc: 'Kuliner, jajanan, dan minuman populer' },
    { id: 'Hewan', title: 'Hewan & Satwa', icon: '🐾', desc: 'Binatang darat, laut, dan udara' },
    { id: 'Benda & Gadget', title: 'Benda & Gadget', icon: '📱', desc: 'Peralatan sehari-hari dan teknologi' },
    { id: 'Tempat & Hiburan', title: 'Tempat & Hiburan', icon: '🏖️', desc: 'Destinasi wisata, kota, dan rekreasi' },
    { id: 'Profesi', title: 'Profesi & Karier', icon: '💼', desc: 'Pekerjaan umum dan keahlian' },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-slate-950 text-slate-100">
      <Header
        onBack={currentStep === 1 ? onBack : () => setCurrentStep((prev) => (prev - 1) as any)}
        backLabel={currentStep === 1 ? 'Menu Utama' : 'Kembali ke Langkah ' + (currentStep - 1)}
        className="border-b border-white/10"
      />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Step Progress Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              Setup Permainan Offline (1 HP)
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
              Langkah {currentStep} dari 3
            </span>
          </div>

          {/* Progress Pills */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { step: 1, label: '1. Peran & Jumlah' },
              { step: 2, label: '2. Kategori & Ronde' },
              { step: 3, label: '3. Roster Pemain' },
            ].map((st) => (
              <div
                key={st.step}
                onClick={() => {
                  if (st.step < currentStep) setCurrentStep(st.step as any);
                }}
                className={'h-1.5 rounded-full transition-all duration-300 ' + (currentStep >= st.step ? 'bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-slate-800')}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: JUMLAH PEMAIN & KOMPOSISI PERAN */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
                        {/* Total Players Count Stepper & Ultra-Smooth Scroll Wheel */}
            <Card glow="cyan" className="p-5 sm:p-6 space-y-5 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shadow-inner">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Jumlah Pemain</h3>
                    <p className="text-xs text-slate-400">Geser atau ketuk angka untuk memilih (2 - 20)</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => adjustPlayerCount(totalPlayerCount - 1)}
                    disabled={totalPlayerCount <= 2}
                    className="w-9 h-9 rounded-xl bg-slate-900 border border-white/10 text-white font-bold hover:bg-slate-800 disabled:opacity-40 flex items-center justify-center text-lg active:scale-95 transition-all shadow-sm"
                  >
                    -
                  </button>
                  <div className="px-3.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center min-w-[60px]">
                    <span className="text-2xl font-mono font-black text-cyan-300">
                      {totalPlayerCount}
                    </span>
                    <span className="text-[9px] font-mono text-cyan-400 block -mt-1 font-bold">ORANG</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => adjustPlayerCount(totalPlayerCount + 1)}
                    disabled={totalPlayerCount >= 20}
                    className="w-9 h-9 rounded-xl bg-slate-900 border border-white/10 text-white font-bold hover:bg-slate-800 disabled:opacity-40 flex items-center justify-center text-lg active:scale-95 transition-all shadow-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Ultra Smooth Drag & Touch Scroll Wheel */}
              <div className="relative pt-1 pb-1">
                {/* Subtle Edge Fade Gradients */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900/90 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900/90 to-transparent z-10 pointer-events-none" />

                <div
                  ref={scrollContainerRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUpOrLeave}
                  onMouseLeave={handleMouseUpOrLeave}
                  className="flex items-center gap-2.5 overflow-x-auto py-2 px-6 scroll-smooth select-none cursor-grab active:cursor-grabbing [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                  {ALL_PLAYER_COUNTS.map((cnt) => {
                    const isSelected = totalPlayerCount === cnt;

                    return (
                      <button
                        key={cnt}
                        type="button"
                        data-player-count={cnt}
                        onClick={() => {
                          if (!hasMovedRef.current) {
                            adjustPlayerCount(cnt);
                          }
                        }}
                        className={'shrink-0 w-14 h-16 rounded-2xl border flex flex-col items-center justify-center transition-all duration-300 ' + (isSelected ? 'bg-gradient-to-b from-cyan-400 to-cyan-500 text-slate-950 font-black shadow-[0_0_25px_-3px_rgba(6,182,212,0.6)] scale-110 border-white ring-2 ring-cyan-400/50 z-20' : 'bg-slate-950/80 border-white/10 text-slate-400 hover:text-slate-200 hover:border-cyan-500/30 hover:bg-slate-900/80 opacity-70 hover:opacity-100')}
                      >
                        <span className="text-lg font-mono font-black">{cnt}</span>
                        <span className={'text-[9px] font-mono uppercase tracking-tight ' + (isSelected ? 'text-slate-950 font-black' : 'text-slate-500')}>Pemain</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Role Breakdown */}
            <Card className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  Komposisi Peran
                </span>
                <span className="text-xs font-mono font-semibold text-cyan-300">
                  {currentCivilian} Warga vs {currentUndercover} Impostor {mrWhiteCount > 0 ? '+ 1 Butakata' : ''}
                </span>
              </div>

              {/* Civilian Row */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-cyan-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-cyan-300">Warga (Civilian)</p>
                    <p className="text-[11px] text-slate-400">Mendapatkan kata rahasia mayoritas</p>
                  </div>
                </div>
                <span className="text-lg font-mono font-black text-cyan-400 px-3.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                  {currentCivilian}
                </span>
              </div>

              {/* Undercover Stepper */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-rose-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
                    <EyeOff className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-rose-300">Impostor (Undercover)</p>
                    <p className="text-[11px] text-slate-400">Kata mirip, tidak tahu dirinya impostor</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUndercoverChange(-1)}
                    disabled={currentUndercover <= 1}
                    className="w-8 h-8 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:bg-slate-800 disabled:opacity-40 flex items-center justify-center font-bold active:scale-95"
                  >
                    -
                  </button>
                  <span className="text-lg font-mono font-black text-rose-400 min-w-[28px] text-center">
                    {currentUndercover}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUndercoverChange(1)}
                    disabled={currentUndercover >= maxUndercover}
                    className="w-8 h-8 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:bg-slate-800 disabled:opacity-40 flex items-center justify-center font-bold active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Mr. White Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-purple-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-purple-300">Buta Kata (Mr. White)</p>
                    <p className="text-[11px] text-slate-400">Tanpa kata sama sekali (muncul ???)</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleMrWhite}
                  className={'px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ' + (settings.enableMrWhite ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_15px_-3px_rgba(168,85,247,0.4)]' : 'bg-slate-900 border-white/10 text-slate-500 hover:text-slate-300')}
                >
                  {settings.enableMrWhite ? 'AKTIF (1)' : 'NONAKTIF'}
                </button>
              </div>
            </Card>

            {/* Next Button */}
            <Button
              variant="primary"
              size="xl"
              fullWidth
              onClick={() => setCurrentStep(2)}
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="shadow-xl shadow-cyan-500/30 text-base py-4"
            >
              Lanjut: Pilih Kategori & Aturan Ronde
            </Button>
          </motion.div>
        )}

        {/* STEP 2: PILIH KATEGORI & ATURAN RONDE */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Category Grid Selection */}
            <Card glow="cyan" className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Dices className="w-4 h-4 text-cyan-400" />
                  Pilih Kategori Kata
                </span>
                <span className="text-xs font-mono text-cyan-300 font-semibold">
                  {settings.category || '🎲 Acak / Misteri'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ALL_CATEGORY_OPTIONS.map((cat) => {
                  const isSelected = (settings.category || '🎲 Acak / Misteri') === cat.id;

                  return (
                    <div
                      key={cat.id}
                      onClick={() => updateSettings({ category: cat.id })}
                      className={'p-3.5 rounded-2xl border cursor-pointer transition-all ' + (isSelected ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_-3px_rgba(6,182,212,0.4)] text-white' : 'bg-slate-950/60 border-white/10 text-slate-300 hover:border-cyan-500/30 hover:bg-slate-900/80')}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{cat.icon}</span>
                        <div>
                          <p className="text-sm font-bold">{cat.title}</p>
                          <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{cat.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Custom Packs if available */}
                {customPacks.map((cp) => {
                  const isSelected = settings.category === cp.title || settings.category === cp.id;

                  return (
                    <div
                      key={cp.id}
                      onClick={() => updateSettings({ category: cp.title })}
                      className={'p-3.5 rounded-2xl border cursor-pointer transition-all ' + (isSelected ? 'bg-purple-500/20 border-purple-400 shadow-[0_0_20px_-3px_rgba(168,85,247,0.4)] text-white' : 'bg-slate-950/60 border-white/10 text-slate-300 hover:border-purple-500/30 hover:bg-slate-900/80')}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">📦</span>
                        <div>
                          <p className="text-sm font-bold">{cp.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{cp.wordPairs.length} pasangan kata buatanmu</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Voting Start Round & Durasi Settings */}
            <Card className="p-5 sm:p-6 space-y-4">
              {/* Voting Start Round Setting */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Vote className="w-4 h-4 text-cyan-400" />
                    Voting Eliminasi Dimulai Pada
                  </label>
                  <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                    Ronde {settings.votingStartRound || 2}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { round: 1, label: 'Ronde 1', desc: 'Langsung Voting' },
                    { round: 2, label: 'Ronde 2', desc: 'Pemanasan 1 Ronde (Disarankan)' },
                    { round: 3, label: 'Ronde 3', desc: 'Pemanasan 2 Ronde' },
                  ].map((opt) => {
                    const isSelected = (settings.votingStartRound || 2) === opt.round;
                    return (
                      <button
                        key={opt.round}
                        type="button"
                        onClick={() => updateSettings({ votingStartRound: opt.round })}
                        className={'p-2.5 rounded-2xl text-center border transition-all ' + (isSelected ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md font-bold' : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-slate-200')}
                      >
                        <span className="text-xs sm:text-sm font-bold block">{opt.label}</span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">{opt.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Turn Duration Settings */}
              <div className="space-y-2 pt-3 border-t border-white/10">
                <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Durasi Diskusi Putaran
                </label>

                <div className="grid grid-cols-4 gap-2 pt-1">
                  {TURN_DURATION_OPTIONS.map((opt) => {
                    const isSelected = settings.turnDurationSeconds === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateSettings({ turnDurationSeconds: opt.value })}
                        className={'p-2 rounded-xl text-center border transition-all ' + (isSelected ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md font-bold' : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-slate-200')}
                        title={opt.desc}
                      >
                        <span className="text-xs sm:text-sm font-mono block">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setCurrentStep(1)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                className="w-1/3"
              >
                Kembali
              </Button>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => setCurrentStep(3)}
                rightIcon={<ArrowRight className="w-5 h-5" />}
                className="w-2/3 shadow-xl shadow-cyan-500/30 text-base py-3.5"
              >
                Lanjut: Isi Nama & Avatar
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: PENGISIAN NAMA & AVATAR PEMAIN */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Header with Quick Randomize */}
            <Card glow="cyan" className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">Daftar {totalPlayerCount} Pemain</h3>
                  <p className="text-xs text-slate-400">Ketik nama teman atau gunakan avatar favorit</p>
                </div>

                <Button
                  variant="outline"
                  size="xs"
                  onClick={handleRandomizeAll}
                  leftIcon={<Shuffle className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  Acak Semua
                </Button>
              </div>

              {/* Player Inputs List */}
              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {players.map((player, idx) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-950/70 border border-white/10 focus-within:border-cyan-400/50 transition-all"
                  >
                    {/* Index Badge */}
                    <span className="w-7 h-7 rounded-xl bg-slate-900 text-slate-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-white/5">
                      #{idx + 1}
                    </span>

                    {/* Avatar Button */}
                    <button
                      type="button"
                      onClick={() => setAvatarPickerPlayerIndex(idx)}
                      title="Klik untuk ganti avatar"
                      className="w-10 h-10 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-2xl flex items-center justify-center shrink-0 transition-transform active:scale-90"
                    >
                      {player.avatar}
                    </button>

                    {/* Name Input */}
                    <input
                      type="text"
                      value={player.name}
                      onChange={(e) => handlePlayerNameChange(idx, e.target.value)}
                      placeholder={'Pemain ' + (idx + 1)}
                      maxLength={20}
                      className="flex-1 bg-transparent px-3 py-1.5 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none"
                    />

                    {/* Randomize Single Player */}
                    <button
                      type="button"
                      onClick={() => handleRandomizeSingleName(idx)}
                      title="Acak nama & avatar"
                      className="p-2 rounded-xl text-slate-500 hover:text-cyan-400 hover:bg-slate-900 transition-colors"
                    >
                      <Dices className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Navigation & Start Game */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="xl"
                onClick={() => setCurrentStep(2)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                className="w-1/3"
              >
                Kembali
              </Button>

              <Button
                variant="primary"
                size="xl"
                fullWidth
                onClick={handleStartGame}
                leftIcon={<Play className="w-5 h-5 fill-current" />}
                className="w-2/3 shadow-xl shadow-cyan-500/30 text-base py-4 font-black"
              >
                Mulai Permainan 🚀
              </Button>
            </div>
          </motion.div>
        )}
      </main>

      {/* Avatar Picker Modal */}
      <Modal
        isOpen={avatarPickerPlayerIndex !== null}
        onClose={() => setAvatarPickerPlayerIndex(null)}
        title="Pilih Avatar Cyber Agent"
        size="md"
      >
        <div className="p-2 space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {PRESET_AVATARS.map((av) => (
              <button
                key={av.emoji}
                type="button"
                onClick={() => {
                  if (avatarPickerPlayerIndex !== null) {
                    handleSelectAvatar(avatarPickerPlayerIndex, av.emoji);
                  }
                }}
                className="p-3 rounded-2xl bg-slate-950 border border-white/10 hover:border-cyan-400 hover:bg-cyan-500/10 flex flex-col items-center gap-1.5 transition-all active:scale-95 group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{av.emoji}</span>
                <span className="text-[10px] font-mono text-slate-400 truncate max-w-full">{av.name}</span>
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
