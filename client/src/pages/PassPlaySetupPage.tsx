import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Shield,
  EyeOff,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Dices,
  Vote,
  Clock,
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
import { cn } from '../utils/cn';

const TURN_DURATION_OPTIONS = [
  { label: '30s', value: 30, desc: 'Cepat & Intens' },
  { label: '45s', value: 45, desc: 'Standar' },
  { label: '60s', value: 60, desc: 'Santai' },
  { label: 'Bebas', value: 0, desc: 'Tanpa Timer' },
];

const RANDOM_NAMES = [
  'Agent Cyber', 'Neon Fox', 'Shadow Byte', 'Phantom V', 'Holo Viper',
  'Specter 7', 'Cyborg Zero', 'Matrix Ghost', 'Alpha Wolf', 'Quantum Cat',
  'Vector Blade', 'Nova Spark', 'Echo Pulse', 'Stealth Hawk', 'Apex Sentinel'
];

interface SmoothPlayerSliderProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

const SmoothPlayerSlider: React.FC<SmoothPlayerSliderProps> = ({
  value,
  min = 3,
  max = 20,
  onChange,
}) => {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const calculateValueFromPointer = React.useCallback(
    (clientX: number) => {
      if (!trackRef.current) return value;
      const rect = trackRef.current.getBoundingClientRect();
      const clampedX = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const percentage = clampedX / rect.width;
      const rawVal = min + percentage * (max - min);
      return Math.max(min, Math.min(max, Math.round(rawVal)));
    },
    [min, max, value]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    const newVal = calculateValueFromPointer(e.clientX);
    if (newVal !== value) {
      onChange(newVal);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const newVal = calculateValueFromPointer(e.clientX);
    if (newVal !== value) {
      onChange(newVal);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return (
    <div className="space-y-3 select-none">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-zinc-400">
          Geser Jumlah Pemain:
        </span>
        <span className="text-zinc-200 font-semibold px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700">
          {value} Pemain
        </span>
      </div>

      {/* Interactive Drag Track */}
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative h-9 flex items-center cursor-pointer touch-none group"
      >
        {/* Background Track */}
        <div className="w-full h-2 rounded-full bg-zinc-800 border border-zinc-700/50 relative overflow-hidden">
          {/* Active Fill */}
          <div
            className="h-full bg-white transition-all duration-75"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Draggable Thumb Knob */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-transform duration-75"
          style={{ left: `${percentage}%` }}
        >
          <div
            className={`w-6 h-6 rounded-full bg-white border-2 border-zinc-950 shadow-md flex items-center justify-center transition-all ${
              isDragging ? 'scale-125' : 'group-hover:scale-110'
            }`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />
          </div>
        </div>
      </div>

      {/* Discrete Scale Markers */}
      <div className="flex justify-between text-[11px] font-mono text-zinc-500 px-0.5">
        <span className={value === 3 ? 'text-zinc-100 font-bold' : ''}>3 Min</span>
        <span className={value === 5 ? 'text-zinc-100 font-bold' : ''}>5</span>
        <span className={value === 10 ? 'text-zinc-100 font-bold' : ''}>10</span>
        <span className={value === 15 ? 'text-zinc-100 font-bold' : ''}>15</span>
        <span className={value === 20 ? 'text-zinc-100 font-bold' : ''}>20 Maks</span>
      </div>
    </div>
  );
};

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
    const clamped = Math.max(3, Math.min(20, newCount));
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
    const mrWhite = settings.enableMrWhite && clamped >= 3 ? 1 : 0;
    const maxUndercover = clamped === 2 ? 1 : Math.max(1, Math.floor((clamped - mrWhite - 1) / 2));
    const nextUndercover = Math.min(Math.max(1, settings.undercoverCount || 1), maxUndercover);
    const nextCivilian = Math.max(1, clamped - nextUndercover - mrWhite);

    updateSettings({
      undercoverCount: nextUndercover,
      civilianCount: nextCivilian,
      enableMrWhite: mrWhite > 0,
      mrWhiteCount: mrWhite,
    });
  };

  // Role constraints
  const mrWhiteCount = settings.enableMrWhite && totalPlayerCount >= 3 ? 1 : 0;
  const maxUndercover = totalPlayerCount === 2 ? 1 : Math.max(1, Math.floor((totalPlayerCount - mrWhiteCount - 1) / 2));
  const currentUndercover = Math.min(Math.max(1, settings.undercoverCount || 1), maxUndercover);
  const currentCivilian = Math.max(1, totalPlayerCount - currentUndercover - mrWhiteCount);

  const handleUndercoverChange = (delta: number) => {
    const next = Math.max(1, Math.min(maxUndercover, currentUndercover + delta));
    updateSettings({
      undercoverCount: next,
      civilianCount: Math.max(1, totalPlayerCount - next - mrWhiteCount),
    });
  };

  const handleToggleMrWhite = () => {
    if (totalPlayerCount < 3) return; // Mr White requires at least 3 players
    const nextEnable = !settings.enableMrWhite;
    const nextMrWhite = nextEnable ? 1 : 0;
    const nextMaxUndercover = Math.max(1, Math.floor((totalPlayerCount - nextMrWhite - 1) / 2));
    const nextUndercover = Math.min(currentUndercover, nextMaxUndercover);
    const nextCivilian = Math.max(1, totalPlayerCount - nextUndercover - nextMrWhite);

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
      alert('Minimal 3 pemain untuk memulai permainan!');
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
    <div className="min-h-[100dvh] flex flex-col bg-[#09090b] text-zinc-100 font-sans">
      <Header
        onBack={currentStep === 1 ? onBack : () => setCurrentStep((prev) => (prev - 1) as any)}
        backLabel={currentStep === 1 ? 'Menu Utama' : 'Langkah ' + (currentStep - 1)}
        className="border-b border-zinc-800/80"
      />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Step Progress Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Pass &amp; Play · Mode 1 HP
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
              Langkah {currentStep} dari 3
            </span>
          </div>

          {/* Progress Indicators */}
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
                className={cn(
                  'h-1 rounded-full transition-all duration-300 cursor-pointer',
                  currentStep >= st.step ? 'bg-zinc-200' : 'bg-zinc-800'
                )}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: JUMLAH PEMAIN & KOMPOSISI PERAN */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            {/* Total Players Card */}
            <Card padding="md" className="space-y-4 border-zinc-800 bg-zinc-900/40">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-zinc-100">Jumlah Pemain (3 - 20 Orang)</h3>
                    <p className="text-xs text-zinc-400">Geser bar di kiri atau gunakan tombol +/- di kanan</p>
                  </div>
                </div>
              </div>

              {/* Side-by-Side: Left Scroll Bar & Right Stepper */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                {/* Left Side: Scroll Bar Track */}
                <div className="flex-1 bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800">
                  <SmoothPlayerSlider
                    value={totalPlayerCount}
                    min={3}
                    max={20}
                    onChange={adjustPlayerCount}
                  />
                </div>

                {/* Right Side: Stepper [-] [N] [+] */}
                <div className="flex items-center justify-center gap-2 shrink-0 bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => adjustPlayerCount(totalPlayerCount - 1)}
                    disabled={totalPlayerCount <= 3}
                    className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 font-bold hover:bg-zinc-800 disabled:opacity-30 flex items-center justify-center text-xl active:scale-95 transition-all"
                  >
                    -
                  </button>

                  <div className="px-3.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-center min-w-[64px]">
                    <span className="text-2xl font-mono font-bold text-zinc-100">
                      {totalPlayerCount}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-400 block -mt-1 font-semibold uppercase">Pemain</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => adjustPlayerCount(totalPlayerCount + 1)}
                    disabled={totalPlayerCount >= 20}
                    className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 font-bold hover:bg-zinc-800 disabled:opacity-30 flex items-center justify-center text-xl active:scale-95 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
            </Card>

            {/* Role Breakdown Card */}
            <Card padding="md" className="space-y-3.5 border-zinc-800 bg-zinc-900/40">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-zinc-400" />
                  Komposisi Peran
                </span>
                <span className="text-xs font-mono font-medium text-zinc-400">
                  {currentCivilian} Warga vs {currentUndercover} Impostor {mrWhiteCount > 0 ? '+ 1 Mr. White' : ''}
                </span>
              </div>

              {/* Civilian Row */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 text-zinc-300 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">Warga (Civilian)</p>
                    <p className="text-[11px] text-zinc-500">Mendapatkan kata rahasia mayoritas</p>
                  </div>
                </div>
                <span className="text-base font-mono font-bold text-zinc-200 px-3 py-0.5 rounded-md bg-zinc-900 border border-zinc-800">
                  {currentCivilian}
                </span>
              </div>

              {/* Undercover Stepper */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-950/30 text-rose-400 flex items-center justify-center">
                    <EyeOff className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-rose-300">Impostor (Undercover)</p>
                    <p className="text-[11px] text-zinc-500">Kata mirip, tidak tahu dirinya impostor</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleUndercoverChange(-1)}
                    disabled={currentUndercover <= 1}
                    className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 flex items-center justify-center font-bold active:scale-95"
                  >
                    -
                  </button>
                  <span className="text-base font-mono font-bold text-rose-300 min-w-[26px] text-center">
                    {currentUndercover}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUndercoverChange(1)}
                    disabled={currentUndercover >= maxUndercover}
                    className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 flex items-center justify-center font-bold active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Mr. White Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-950/30 text-purple-400 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-purple-300">Mr. White (Buta Kata)</p>
                    <p className="text-[11px] text-zinc-500">Tanpa kata sama sekali (muncul ???)</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleMrWhite}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all border',
                    settings.enableMrWhite
                      ? 'bg-purple-950/40 border-purple-800 text-purple-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                  )}
                >
                  {settings.enableMrWhite ? 'AKTIF (1)' : 'NONAKTIF'}
                </button>
              </div>
            </Card>

            {/* Next Button */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => setCurrentStep(2)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Lanjut: Pilih Kategori &amp; Aturan
            </Button>
          </motion.div>
        )}

        {/* STEP 2: PILIH KATEGORI & ATURAN RONDE */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            {/* Category Grid Selection */}
            <Card padding="md" className="space-y-4 border-zinc-800 bg-zinc-900/40">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <Dices className="w-4 h-4 text-zinc-400" />
                  Pilih Kategori Kata
                </span>
                <span className="text-xs font-mono text-zinc-400">
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
                      className={cn(
                        'p-3.5 rounded-xl border cursor-pointer transition-all',
                        isSelected
                          ? 'bg-zinc-800 border-zinc-400 text-white'
                          : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/80'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{cat.icon}</span>
                        <div>
                          <p className="text-sm font-semibold">{cat.title}</p>
                          <p className="text-[11px] text-zinc-500 leading-tight mt-0.5">{cat.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Custom Packs */}
                {customPacks.map((cp) => {
                  const isSelected = settings.category === cp.title || settings.category === cp.id;

                  return (
                    <div
                      key={cp.id}
                      onClick={() => updateSettings({ category: cp.title })}
                      className={cn(
                        'p-3.5 rounded-xl border cursor-pointer transition-all',
                        isSelected
                          ? 'bg-zinc-800 border-zinc-400 text-white'
                          : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/80'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">📦</span>
                        <div>
                          <p className="text-sm font-semibold">{cp.title}</p>
                          <p className="text-[11px] text-zinc-500 mt-0.5">{cp.wordPairs.length} pasang kata kustom</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Voting & Duration Settings */}
            <Card padding="md" className="space-y-4 border-zinc-800 bg-zinc-900/40">
              {/* Voting Start Round Setting */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                    <Vote className="w-4 h-4 text-zinc-400" />
                    Voting Eliminasi Dimulai Pada
                  </label>
                  <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
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
                        className={cn(
                          'p-2.5 rounded-xl text-center border transition-all',
                          isSelected
                            ? 'bg-zinc-800 border-zinc-500 text-white font-semibold shadow-sm'
                            : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        )}
                      >
                        <span className="text-xs sm:text-sm font-semibold block">{opt.label}</span>
                        <span className="text-[10px] text-zinc-500 block mt-0.5">{opt.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Turn Duration Settings */}
              <div className="space-y-2 pt-3 border-t border-zinc-800/80">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-400" />
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
                        className={cn(
                          'p-2 rounded-xl text-center border transition-all',
                          isSelected
                            ? 'bg-zinc-800 border-zinc-500 text-white font-semibold shadow-sm'
                            : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        )}
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
                variant="secondary"
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
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-2/3"
              >
                Lanjut: Roster Pemain
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: PENGISIAN NAMA & AVATAR PEMAIN */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            {/* Header with Quick Randomize */}
            <Card padding="md" className="space-y-4 border-zinc-800 bg-zinc-900/40">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-100">Daftar {totalPlayerCount} Pemain</h3>
                  <p className="text-xs text-zinc-400">Ketik nama pemain atau pilih avatar favorit</p>
                </div>

                <Button
                  variant="secondary"
                  size="xs"
                  onClick={handleRandomizeAll}
                  leftIcon={<Shuffle className="w-3.5 h-3.5" />}
                >
                  Acak Semua
                </Button>
              </div>

              {/* Player Inputs List */}
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {players.map((player, idx) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-950/80 border border-zinc-800 focus-within:border-zinc-600 transition-all"
                  >
                    {/* Index Badge */}
                    <span className="w-6 h-6 rounded-md bg-zinc-900 text-zinc-400 font-mono font-semibold text-[11px] flex items-center justify-center shrink-0 border border-zinc-800">
                      {idx + 1}
                    </span>

                    {/* Avatar Button */}
                    <button
                      type="button"
                      onClick={() => setAvatarPickerPlayerIndex(idx)}
                      title="Klik untuk ganti avatar"
                      className="w-9 h-9 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xl flex items-center justify-center shrink-0 transition-transform active:scale-95"
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
                      className="flex-1 bg-transparent px-2.5 py-1 text-sm font-medium text-zinc-100 placeholder-zinc-600 focus:outline-none"
                    />

                    {/* Randomize Single Player */}
                    <button
                      type="button"
                      onClick={() => handleRandomizeSingleName(idx)}
                      title="Acak nama & avatar"
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
                    >
                      <Dices className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setCurrentStep(2)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                className="w-1/3"
              >
                Kembali
              </Button>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleStartGame}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-2/3"
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
        title="Pilih Avatar Pemain"
        size="sm"
      >
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-2 max-h-[60vh] overflow-y-auto">
          {PRESET_AVATARS.map((av) => (
            <button
              key={av.id}
              onClick={() => avatarPickerPlayerIndex !== null && handleSelectAvatar(avatarPickerPlayerIndex, av.emoji)}
              className="p-3 text-3xl rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 transition-all flex items-center justify-center active:scale-95"
              title={av.name}
            >
              {av.emoji}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
};
