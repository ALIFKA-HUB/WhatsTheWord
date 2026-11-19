import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  ShieldCheck,
  EyeSlash,
  Question,
  ArrowRight,
  ArrowLeft,
  Shuffle,
  ListChecks,
  Clock,
  BookOpen,
  ForkKnife,
  PawPrint,
  Devices,
  MapPin,
  Briefcase,
  PencilSimple,
} from '@phosphor-icons/react';
import { usePassPlay } from '../context/PassPlayContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { AvatarPicker, PRESET_AVATARS } from '../components/game/AvatarPicker';
import { PlayerToken } from '../components/game/PlayerToken';
import { resolveTokenAvatar } from '../utils/avatarTokens';
import { getLocalCustomPacks } from '../services/wordPackService';
import { CustomWordPack } from '../types/game.types';
import { Header } from '../components/common/Header';
import { cn } from '../utils/cn';

const TURN_DURATION_OPTIONS = [
  { label: '30 dtk', value: 30, desc: 'Cepat & Intens' },
  { label: '45 dtk', value: 45, desc: 'Standar' },
  { label: '60 dtk', value: 60, desc: 'Santai' },
  { label: 'Bebas', value: 0, desc: 'Tanpa Timer' },
];

const QUICK_PLAYER_PRESETS = [4, 6, 8, 10, 12];

const RANDOM_NAMES = [
  'Penjaga Meja', 'Tuan Kertas', 'Nona Tinta', 'Saksi Kunci', 'Juru Tinta',
  'Hakim Garis', 'Kurir Kartu', 'Agen Merah', 'Kapten Dadu', 'Juru Arsip',
  'Penjaga Pos', 'Saudagar Kata', 'Tuan Dadu', 'Nona Skema', 'Saksi Senja',
  'Detektif Kopi', 'Inspektur Pena', 'Nona Sandi', 'Pengamat Sudut', 'Juru Lelang',
  'Komisaris Peta', 'Nona Berkas', 'Tuan Segel', 'Penjaga Laci'
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
    <div className="space-y-2 select-none">
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative h-8 flex items-center cursor-pointer touch-none group"
      >
        <div className="w-full h-2.5 rounded-full bg-paper-muted border border-rule relative overflow-hidden">
          <div
            className="h-full w-full origin-left bg-teal-dark transition-transform duration-75"
            style={{ transform: `scaleX(${percentage / 100})` }}
          />
        </div>

        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none"
          style={{ insetInlineStart: `${percentage}%` }}
        >
          <div
            className={cn(
              'w-6 h-6 rounded-full bg-teal-dark border-2 border-cardstock shadow-print-sm flex items-center justify-center transition-transform',
              isDragging ? 'scale-125' : 'group-hover:scale-110'
            )}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-cardstock" />
          </div>
        </div>
      </div>

      <div className="flex justify-between text-xs text-ink-muted px-0.5">
        <span className={value === 3 ? 'text-ink font-bold' : ''}>3 min</span>
        <span className={value === 6 ? 'text-ink font-bold' : ''}>6</span>
        <span className={value === 10 ? 'text-ink font-bold' : ''}>10</span>
        <span className={value === 15 ? 'text-ink font-bold' : ''}>15</span>
        <span className={value === 20 ? 'text-ink font-bold' : ''}>20 maks</span>
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

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [totalPlayerCount, setTotalPlayerCount] = useState<number>(players.length || 4);
  const [customPacks, setCustomPacks] = useState<CustomWordPack[]>([]);
  const [avatarPickerPlayerIndex, setAvatarPickerPlayerIndex] = useState<number | null>(null);

  useEffect(() => {
    try {
      const packs = getLocalCustomPacks();
      setCustomPacks(packs);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (players.length <= 3 && (settings.enableMrWhite || settings.mrWhiteCount !== 0)) {
      updateSettings({ enableMrWhite: false, mrWhiteCount: 0 });
    }
  }, [players.length, settings.enableMrWhite, settings.mrWhiteCount, updateSettings]);

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

    const mrWhite = settings.enableMrWhite && clamped >= 4 ? 1 : 0;
    const maxUndercover = Math.max(1, Math.floor((clamped - mrWhite - 1) / 2));
    const nextUndercover = clamped === 3 ? 1 : Math.min(Math.max(1, settings.undercoverCount || 1), maxUndercover);
    const nextCivilian = Math.max(1, clamped - nextUndercover - mrWhite);

    updateSettings({
      undercoverCount: nextUndercover,
      civilianCount: nextCivilian,
      enableMrWhite: mrWhite > 0,
      mrWhiteCount: mrWhite,
    });
  };

  const mrWhiteCount = settings.enableMrWhite && totalPlayerCount >= 4 && players.length >= 4 ? 1 : 0;
  const maxUndercover = Math.max(1, Math.floor((totalPlayerCount - mrWhiteCount - 1) / 2));
  const currentUndercover =
    totalPlayerCount === 3 ? 1 : Math.min(Math.max(1, settings.undercoverCount || 1), maxUndercover);
  const currentCivilian = Math.max(1, totalPlayerCount - currentUndercover - mrWhiteCount);

  const handleUndercoverChange = (delta: number) => {
    const next = Math.max(1, Math.min(maxUndercover, currentUndercover + delta));
    updateSettings({
      undercoverCount: next,
      civilianCount: Math.max(1, totalPlayerCount - next - mrWhiteCount),
    });
  };

  const handleToggleMrWhite = () => {
    if (players.length <= 3 || totalPlayerCount < 4) return;
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
        avatar: shuffledAvatars[idx % shuffledAvatars.length]?.emoji || 'token-eye',
      }))
    );
  };

  const handleStartGame = () => {
    const sanitizedPlayers = players.map((p, idx) => ({
      ...p,
      name: p.name.trim() || `Pemain ${idx + 1}`,
    }));
    setPlayers(sanitizedPlayers);

    const success = startPassPlayGame(sanitizedPlayers);
    if (!success) {
      alert('Minimal 3 pemain untuk memulai permainan!');
    }
  };

  const ALL_CATEGORY_OPTIONS = [
    { id: 'Acak / Misteri', title: 'Acak / Misteri', desc: 'Kategori dipilih acak', Icon: Shuffle },
    { id: 'Makanan & Minuman', title: 'Makanan & Minuman', desc: 'Kuliner & jajanan', Icon: ForkKnife },
    { id: 'Hewan', title: 'Hewan', desc: 'Darat, laut, udara', Icon: PawPrint },
    { id: 'Benda & Gadget', title: 'Benda & Gadget', desc: 'Alat & teknologi', Icon: Devices },
    { id: 'Tempat & Hiburan', title: 'Tempat & Hiburan', desc: 'Wisata & kota', Icon: MapPin },
    { id: 'Profesi', title: 'Profesi', desc: 'Pekerjaan & keahlian', Icon: Briefcase },
  ];

  // Build seat preview array
  const seatRoles: Array<'civilian' | 'undercover' | 'mrwhite'> = [
    ...Array(currentCivilian).fill('civilian'),
    ...Array(currentUndercover).fill('undercover'),
    ...Array(mrWhiteCount).fill('mrwhite'),
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-paper text-ink font-sans">
      <Header
        onBack={currentStep === 1 ? onBack : () => setCurrentStep((prev) => (prev - 1) as any)}
        backLabel={currentStep === 1 ? 'Menu Utama' : 'Langkah ' + (currentStep - 1)}
      />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-5 sm:py-7 space-y-5">
        {/* Step Progress Header */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">
              Pass &amp; Play (Mode Satu HP)
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-cardstock border border-rule text-ink shadow-print-sm">
              Langkah {currentStep} dari 3
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { step: 1, label: '1. Peran & Jumlah' },
              { step: 2, label: '2. Kategori & Ronde' },
              { step: 3, label: '3. Daftar Pemain' },
            ].map((st) => (
              <button
                key={st.step}
                type="button"
                onClick={() => {
                  if (st.step < currentStep) setCurrentStep(st.step as any);
                }}
                className="text-left space-y-1.5 group focus:outline-none cursor-pointer"
              >
                <div
                  className={cn(
                    'h-1.5 rounded-full transition-colors duration-200',
                    currentStep >= st.step ? 'bg-teal-dark' : 'bg-paper-dark'
                  )}
                />
                <span
                  className={cn(
                    'block text-xs font-medium truncate',
                    currentStep === st.step ? 'text-ink font-bold' : 'text-ink-muted'
                  )}
                >
                  {st.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* STEP 1: JUMLAH PEMAIN & KOMPOSISI PERAN */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {/* Unified Interactive Seat Dial Card */}
            <Card padding="md" className="space-y-4">
              <div className="flex items-center justify-between gap-3 border-b border-rule pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-teal-light border border-teal text-teal-dark flex items-center justify-center shadow-print-sm shrink-0">
                    <Users className="w-5 h-5" weight="bold" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-ink">Jumlah Pemain di Meja</h3>
                    <p className="text-xs text-ink-muted">Pilih preset cepat atau geser sesuai jumlah teman</p>
                  </div>
                </div>

                {/* Unified Stepper Counter */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => adjustPlayerCount(totalPlayerCount - 1)}
                    disabled={totalPlayerCount <= 3}
                    className="w-9 h-9 rounded-xl bg-paper border border-rule text-ink font-bold hover:bg-paper-muted disabled:opacity-30 flex items-center justify-center text-lg active:translate-y-[1px] transition-colors cursor-pointer"
                    aria-label="Kurangi pemain"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 rounded-xl bg-paper border border-rule font-mono text-xl font-bold text-ink min-w-[48px] text-center">
                    {totalPlayerCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => adjustPlayerCount(totalPlayerCount + 1)}
                    disabled={totalPlayerCount >= 20}
                    className="w-9 h-9 rounded-xl bg-paper border border-rule text-ink font-bold hover:bg-paper-muted disabled:opacity-30 flex items-center justify-center text-lg active:translate-y-[1px] transition-colors cursor-pointer"
                    aria-label="Tambah pemain"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Quick Preset Pills */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-semibold text-ink-muted">Preset meja:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {QUICK_PLAYER_PRESETS.map((preset) => {
                    const active = totalPlayerCount === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => adjustPlayerCount(preset)}
                        className={cn(
                          'px-3 py-1 rounded-full text-xs font-mono font-bold transition-colors cursor-pointer border',
                          active
                            ? 'bg-teal-dark text-cardstock border-teal-dark shadow-print-sm'
                            : 'bg-paper text-ink border-rule hover:bg-paper-muted'
                        )}
                      >
                        {preset}p
                      </button>
                    );
                  })}
                </div>
              </div>

              <SmoothPlayerSlider
                value={totalPlayerCount}
                min={3}
                max={20}
                onChange={adjustPlayerCount}
              />

              {/* Live Visual Seat Distribution Strip */}
              <div className="p-3 rounded-2xl bg-paper border border-rule space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink-muted">Simulasi Kursi Meja</span>
                  <span className="font-semibold text-ink">
                    {currentCivilian} Warga / {currentUndercover} Impostor{mrWhiteCount > 0 ? ' / 1 Mr. White' : ''}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-0.5" aria-hidden="true">
                  {seatRoles.map((role, idx) => (
                    <motion.span
                      key={idx}
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        'h-6 px-2 rounded-lg text-[11px] font-mono font-bold flex items-center justify-center border',
                        role === 'civilian' && 'bg-teal-light border-teal text-teal-dark',
                        role === 'undercover' && 'bg-stamp-light border-stamp text-stamp-dark',
                        role === 'mrwhite' && 'bg-sun-light border-sun text-sun-dark'
                      )}
                    >
                      {role === 'civilian' ? 'W' : role === 'undercover' ? 'I' : 'MW'}
                    </motion.span>
                  ))}
                </div>
              </div>
            </Card>

            {/* Role Breakdown Card */}
            <Card padding="md" className="divide-y divide-rule">
              {/* Civilian Row */}
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-light text-teal-dark flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" weight="bold" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">Warga (Civilian)</p>
                    <p className="text-xs text-ink-muted">Mendapatkan kata rahasia yang sama</p>
                  </div>
                </div>
                <span className="text-base font-mono font-bold text-teal-dark px-3 py-1 rounded-xl bg-teal-light border border-teal">
                  {currentCivilian}
                </span>
              </div>

              {/* Undercover Stepper */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-stamp-light text-stamp-dark flex items-center justify-center shrink-0">
                    <EyeSlash className="w-4 h-4" weight="bold" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stamp-dark">Impostor (Undercover)</p>
                    <p className="text-xs text-ink-muted">Menerima kata mirip, menyamar di meja</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUndercoverChange(-1)}
                    disabled={currentUndercover <= 1}
                    className="w-9 h-9 rounded-xl bg-paper border border-rule text-ink hover:bg-paper-muted disabled:opacity-30 flex items-center justify-center font-bold active:translate-y-[1px] transition-colors cursor-pointer"
                    aria-label="Kurangi Impostor"
                  >
                    -
                  </button>
                  <span className="text-base font-mono font-bold text-stamp-dark min-w-[24px] text-center">
                    {currentUndercover}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUndercoverChange(1)}
                    disabled={currentUndercover >= maxUndercover}
                    className="w-9 h-9 rounded-xl bg-paper border border-rule text-ink hover:bg-paper-muted disabled:opacity-30 flex items-center justify-center font-bold active:translate-y-[1px] transition-colors cursor-pointer"
                    aria-label="Tambah Impostor"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Mr. White Toggle */}
              <div className="flex items-center justify-between pt-3 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sun-light text-sun-dark flex items-center justify-center shrink-0">
                    <Question className="w-4 h-4" weight="bold" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">Mr. White (Tanpa Kata)</p>
                    <p className="text-xs text-ink-muted">
                      {players.length <= 3
                        ? 'Minimal 4 pemain untuk mengaktifkan Mr. White'
                        : 'Menang jika berhasil menebak kata warga'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleMrWhite}
                  disabled={players.length <= 3}
                  className={cn(
                    'min-h-[38px] px-4 py-1.5 rounded-full text-xs font-bold transition-colors border shadow-print-sm flex items-center justify-center active:translate-y-[1px] cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed shrink-0',
                    settings.enableMrWhite && players.length >= 4
                      ? 'bg-sun-light border-sun-dark text-ink'
                      : 'bg-paper border-rule text-ink-muted hover:text-ink'
                  )}
                >
                  {settings.enableMrWhite && players.length >= 4 ? 'Aktif (1)' : 'Nonaktif'}
                </button>
              </div>
            </Card>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => setCurrentStep(2)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Lanjut ke Kategori &amp; Aturan
            </Button>
          </motion.div>
        )}

        {/* STEP 2: PILIH KATEGORI & ATURAN RONDE (Compact 2x3 Deck Grid) */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <Card padding="md" className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-rule pb-2.5">
                <span className="text-sm font-bold text-ink flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-teal-light border border-teal text-teal-dark flex items-center justify-center">
                    <BookOpen className="w-4 h-4" weight="bold" />
                  </span>
                  Pilih Dek Kategori Kata
                </span>
                <span className="text-xs font-semibold text-teal-dark bg-teal-light px-2.5 py-0.5 rounded-full border border-teal">
                  {settings.category || 'Acak / Misteri'}
                </span>
              </div>

              {/* 2x3 Compact Deck Tiles (fits mobile without scroll) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {ALL_CATEGORY_OPTIONS.map((cat) => {
                  const isSelected = (settings.category || 'Acak / Misteri') === cat.id;
                  const CatIcon = cat.Icon;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => updateSettings({ category: cat.id })}
                      className={cn(
                        'p-3 rounded-2xl border text-left cursor-pointer transition-colors flex flex-col justify-between gap-2',
                        isSelected
                          ? 'bg-teal-light border-teal-dark text-ink shadow-print-sm'
                          : 'bg-paper border-rule text-ink hover:border-teal hover:bg-paper-muted'
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={cn(
                            'w-7 h-7 rounded-xl flex items-center justify-center border',
                            isSelected
                              ? 'bg-teal-dark text-cardstock border-teal-dark'
                              : 'bg-cardstock text-ink-muted border-rule'
                          )}
                        >
                          <CatIcon className="w-4 h-4" weight="bold" />
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-teal-dark">Terpilih</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold leading-snug">{cat.title}</p>
                        <p className="text-[11px] text-ink-muted leading-tight mt-0.5">{cat.desc}</p>
                      </div>
                    </button>
                  );
                })}

                {customPacks.map((cp) => {
                  const isSelected = settings.category === cp.title || settings.category === cp.id;

                  return (
                    <button
                      key={cp.id}
                      type="button"
                      onClick={() => updateSettings({ category: cp.title })}
                      className={cn(
                        'p-3 rounded-2xl border text-left cursor-pointer transition-colors flex flex-col justify-between gap-2',
                        isSelected
                          ? 'bg-sun-light border-sun-dark text-ink shadow-print-sm'
                          : 'bg-paper border-rule text-ink hover:border-sun-dark hover:bg-paper-muted'
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="px-2 py-0.5 rounded-full bg-cardstock border border-rule text-[10px] font-bold text-sun-dark">
                          Kustom
                        </span>
                        <span className="text-[10px] font-mono text-ink-muted">
                          {cp.wordPairs.length} pasang
                        </span>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold leading-snug truncate">{cp.title}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Voting & Duration Settings */}
            <Card padding="md" className="space-y-3.5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-ink flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-teal-dark" weight="bold" />
                    Mulai Voting Eliminasi Pada
                  </label>
                  <span className="text-xs font-semibold text-ink-muted bg-paper-muted px-2.5 py-0.5 rounded-full border border-rule">
                    Ronde {settings.votingStartRound || 2}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1.5">
                  {[
                    { round: 1, label: 'Ronde 1', desc: 'Langsung voting' },
                    { round: 2, label: 'Ronde 2', desc: '1x pemanasan', recommended: true },
                    { round: 3, label: 'Ronde 3', desc: '2x pemanasan' },
                  ].map((opt) => {
                    const isSelected = (settings.votingStartRound || 2) === opt.round;
                    return (
                      <button
                        key={opt.round}
                        type="button"
                        onClick={() => updateSettings({ votingStartRound: opt.round })}
                        className={cn(
                          'p-2.5 pt-3.5 rounded-2xl text-center border transition-colors relative cursor-pointer',
                          isSelected
                            ? 'bg-teal-light border-teal-dark text-ink font-bold shadow-print-sm'
                            : 'bg-paper border-rule text-ink-muted hover:text-ink'
                        )}
                      >
                        {opt.recommended && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-sun text-ink text-[10px] font-bold leading-none border border-sun-dark whitespace-nowrap">
                            Ideal
                          </span>
                        )}
                        <span className="text-xs sm:text-sm font-bold block">{opt.label}</span>
                        <span className="text-[11px] text-ink-muted block mt-0.5 leading-tight">{opt.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-rule">
                <label className="text-xs sm:text-sm font-bold text-ink flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-dark" weight="bold" />
                  Durasi Diskusi Putaran
                </label>

                <div className="grid grid-cols-4 gap-2 pt-0.5">
                  {TURN_DURATION_OPTIONS.map((opt) => {
                    const isSelected = settings.turnDurationSeconds === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateSettings({ turnDurationSeconds: opt.value })}
                        className={cn(
                          'p-2 rounded-2xl text-center border transition-colors cursor-pointer',
                          isSelected
                            ? 'bg-teal-light border-teal-dark text-ink font-bold shadow-print-sm'
                            : 'bg-paper border-rule text-ink-muted hover:text-ink'
                        )}
                        title={opt.desc}
                      >
                        <span className="text-xs sm:text-sm font-semibold block">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

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
                Lanjut ke Daftar Pemain
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: PENGISIAN NAMA & AVATAR PEMAIN (2-Col Seat Badges) */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <Card padding="md" className="space-y-4">
              <div className="flex items-center justify-between border-b border-rule pb-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-ink">Daftar Kursi ({totalPlayerCount} Pemain)</h3>
                  <p className="text-xs text-ink-muted">Ketuk foto karakter untuk ganti avatar atau ubah nama di kolom teks</p>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[54vh] overflow-y-auto pr-1">
                {players.map((player, idx) => {
                  const tokenInfo = resolveTokenAvatar(player.avatar, player.name);
                  return (
                    <div
                      key={player.id}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-paper border border-rule hover:border-teal transition-colors"
                    >
                      {/* Clickable Character Portrait with visible 'Ganti' badge */}
                      <button
                        type="button"
                        onClick={() => setAvatarPickerPlayerIndex(idx)}
                        title="Ketuk untuk ganti karakter & profil"
                        className="relative group shrink-0 transition-transform active:scale-95 cursor-pointer"
                      >
                        <PlayerToken avatar={player.avatar} name={player.name} size="md" showCode={false} />
                        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-cardstock border border-rule text-[10px] font-bold text-teal-dark shadow-print-sm group-hover:bg-teal-dark group-hover:text-cardstock transition-colors whitespace-nowrap">
                          Ganti
                        </span>
                      </button>

                      {/* Clearly Editable Name Input + Character Label */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-ink-muted px-0.5">
                          <span>Kursi #{idx + 1} · {tokenInfo.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRandomizeSingleName(idx)}
                            title="Acak nama & karakter"
                            className="inline-flex items-center gap-1 text-teal-dark hover:underline cursor-pointer font-bold"
                          >
                            <Shuffle className="w-3 h-3" weight="bold" />
                            <span>Acak</span>
                          </button>
                        </div>

                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={player.name}
                            onChange={(e) => handlePlayerNameChange(idx, e.target.value)}
                            placeholder={'Nama Pemain ' + (idx + 1)}
                            maxLength={20}
                            aria-label={`Nama pemain kursi ${idx + 1}`}
                            className="w-full bg-cardstock border border-rule hover:border-teal-dark focus:border-teal-dark focus:ring-2 focus:ring-teal rounded-xl pl-3 pr-8 py-1.5 text-sm font-bold text-ink placeholder-ink-faint focus:outline-none transition-colors shadow-print-sm"
                          />
                          <PencilSimple
                            className="w-3.5 h-3.5 text-ink-muted absolute right-2.5 pointer-events-none"
                            weight="bold"
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

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
                Mulai Permainan
              </Button>
            </div>
          </motion.div>
        )}
      </main>

      <Modal
        isOpen={avatarPickerPlayerIndex !== null}
        onClose={() => setAvatarPickerPlayerIndex(null)}
        title={
          avatarPickerPlayerIndex !== null
            ? `Atur Profil Kursi #${avatarPickerPlayerIndex + 1}`
            : 'Pilih Karakter Pemain'
        }
        subtitle="Ubah nama panggilan dan pilih karakter meja."
        size="sm"
      >
        {avatarPickerPlayerIndex !== null && players[avatarPickerPlayerIndex] && (
          <div className="space-y-4">
            <AvatarPicker
              selectedAvatar={players[avatarPickerPlayerIndex].avatar}
              onSelectAvatar={(av) => handleSelectAvatar(avatarPickerPlayerIndex, av)}
              nickname={players[avatarPickerPlayerIndex].name}
              onNicknameChange={(name) => handlePlayerNameChange(avatarPickerPlayerIndex, name)}
              showNicknameInput
            />
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => setAvatarPickerPlayerIndex(null)}
            >
              Selesai
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default PassPlaySetupPage;
