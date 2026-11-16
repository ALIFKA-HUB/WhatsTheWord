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
} from '@phosphor-icons/react';
import { usePassPlay } from '../context/PassPlayContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { PRESET_AVATARS } from '../components/game/AvatarPicker';
import { PlayerToken } from '../components/game/PlayerToken';
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

const RANDOM_NAMES = [
  'Penjaga Meja', 'Tuan Kertas', 'Nona Tinta', 'Saksi Kunci', 'Juru Tinta',
  'Hakim Garis', 'Kurir Kartu', 'Agen Merah', 'Kapten Dadu', 'Juru Arsip',
  'Penjaga Pos', 'Saudagar Kata', 'Tuan Dadu', 'Nona Skema', 'Saksi Senja'
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
      <div className="flex items-center justify-between text-xs">
        <span className="text-ink-muted font-medium">
          Geser jumlah pemain:
        </span>
        <span className="text-ink font-semibold px-2.5 py-0.5 rounded-full bg-paper-muted border border-rule">
          {value} pemain
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
        <div className="w-full h-2.5 rounded-full bg-paper-muted border border-rule relative overflow-hidden">
          <div
            className="h-full w-full origin-left bg-teal-dark transition-transform duration-75"
            style={{ transform: `scaleX(${percentage / 100})` }}
          />
        </div>

        {/* Draggable Thumb Knob */}
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

      {/* Discrete Scale Markers */}
      <div className="flex justify-between text-xs text-ink-muted px-0.5">
        <span className={value === 3 ? 'text-ink font-bold' : ''}>3 min</span>
        <span className={value === 5 ? 'text-ink font-bold' : ''}>5</span>
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
    if (totalPlayerCount < 3) return;
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
        avatar: shuffledAvatars[idx % shuffledAvatars.length]?.emoji || 'token-eye',
      }))
    );
  };

  const handleStartGame = () => {
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
    { id: 'Acak / Misteri', title: 'Acak / Misteri', icon: 'random', desc: 'Paling seru! Kategori dirahasiakan & dipilih acak' },
    { id: 'Makanan & Minuman', title: 'Makanan & Minuman', icon: 'ink', desc: 'Kuliner, jajanan, dan minuman populer' },
    { id: 'Hewan', title: 'Hewan', icon: 'ink', desc: 'Binatang darat, laut, dan udara' },
    { id: 'Benda & Gadget', title: 'Benda & Gadget', icon: 'ink', desc: 'Peralatan sehari-hari dan teknologi' },
    { id: 'Tempat & Hiburan', title: 'Tempat & Hiburan', icon: 'ink', desc: 'Destinasi wisata, kota, dan rekreasi' },
    { id: 'Profesi', title: 'Profesi', icon: 'ink', desc: 'Pekerjaan umum dan keahlian' },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-paper text-ink font-sans">
      <Header
        onBack={currentStep === 1 ? onBack : () => setCurrentStep((prev) => (prev - 1) as any)}
        backLabel={currentStep === 1 ? 'Menu Utama' : 'Langkah ' + (currentStep - 1)}
      />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Step Progress Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">
              Pass &amp; Play (Mode Satu HP)
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-cardstock border border-rule text-ink shadow-print-sm">
              Langkah {currentStep} dari 3
            </span>
          </div>

          {/* Progress Indicators */}
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
                className="text-left space-y-1.5 group focus:outline-none"
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            {/* Total Players Card */}
            <Card padding="md" className="space-y-4">
              <div className="flex items-center justify-between border-b border-rule pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-teal-light border border-teal text-teal-dark flex items-center justify-center shadow-print-sm">
                    <Users className="w-5 h-5" weight="bold" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-ink">Jumlah Pemain (3 sampai 20 Orang)</h3>
                    <p className="text-xs text-ink-muted">Geser bar di kiri atau gunakan tombol di kanan</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                <div className="flex-1 bg-paper p-3.5 rounded-2xl border border-rule">
                  <SmoothPlayerSlider
                    value={totalPlayerCount}
                    min={3}
                    max={20}
                    onChange={adjustPlayerCount}
                  />
                </div>

                <div className="flex items-center justify-center gap-2 shrink-0 bg-paper p-3.5 rounded-2xl border border-rule">
                  <button
                    type="button"
                    onClick={() => adjustPlayerCount(totalPlayerCount - 1)}
                    disabled={totalPlayerCount <= 3}
                    className="min-w-[44px] min-h-[44px] rounded-2xl bg-cardstock border border-rule text-ink font-bold hover:bg-paper-muted disabled:opacity-30 flex items-center justify-center text-xl active:translate-y-[1px] transition-colors shadow-print-sm"
                    aria-label="Kurangi pemain"
                  >
                    -
                  </button>

                  <div className="px-3.5 py-1 rounded-2xl bg-cardstock border border-rule text-center min-w-[68px]">
                    <span className="text-2xl font-mono font-bold text-ink">
                      {totalPlayerCount}
                    </span>
                    <span className="text-xs text-ink-muted block -mt-1 font-medium">pemain</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => adjustPlayerCount(totalPlayerCount + 1)}
                    disabled={totalPlayerCount >= 20}
                    className="min-w-[44px] min-h-[44px] rounded-2xl bg-cardstock border border-rule text-ink font-bold hover:bg-paper-muted disabled:opacity-30 flex items-center justify-center text-xl active:translate-y-[1px] transition-colors shadow-print-sm"
                    aria-label="Tambah pemain"
                  >
                    +
                  </button>
                </div>
              </div>
            </Card>

            {/* Role Breakdown Card - Clean Docket Rows without nested box borders */}
            <Card padding="md" className="space-y-1">
              <div className="flex items-center justify-between border-b border-rule pb-3 mb-1">
                <span className="text-sm font-bold text-ink flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-teal-light border border-teal text-teal-dark flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" weight="bold" />
                  </span>
                  Komposisi Peran
                </span>
                <span className="text-xs font-medium text-ink-muted">
                  {currentCivilian} Warga, {currentUndercover} Impostor{mrWhiteCount > 0 ? ', 1 Mr. White' : ''}
                </span>
              </div>

              {/* Civilian Row */}
              <div className="flex items-center justify-between py-3 border-b border-rule">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-light text-teal-dark flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" weight="bold" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">Warga (Civilian)</p>
                    <p className="text-xs text-ink-muted">Mendapatkan kata rahasia yang sama</p>
                  </div>
                </div>
                <span className="text-base font-mono font-bold text-ink px-3 py-1 rounded-xl bg-paper border border-rule">
                  {currentCivilian}
                </span>
              </div>

              {/* Undercover Stepper */}
              <div className="flex items-center justify-between py-3 border-b border-rule">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-stamp-light text-stamp-dark flex items-center justify-center shrink-0">
                    <EyeSlash className="w-4 h-4" weight="bold" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stamp-dark">Impostor (Undercover)</p>
                    <p className="text-xs text-ink-muted">Menerima kata mirip, menyamar di antara warga</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUndercoverChange(-1)}
                    disabled={currentUndercover <= 1}
                    className="min-w-[44px] min-h-[44px] rounded-xl bg-paper border border-rule text-ink hover:bg-paper-muted disabled:opacity-30 flex items-center justify-center font-bold active:translate-y-[1px] transition-colors shadow-print-sm"
                    aria-label="Kurangi Impostor"
                  >
                    -
                  </button>
                  <span className="text-base font-mono font-bold text-stamp-dark min-w-[28px] text-center">
                    {currentUndercover}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUndercoverChange(1)}
                    disabled={currentUndercover >= maxUndercover}
                    className="min-w-[44px] min-h-[44px] rounded-xl bg-paper border border-rule text-ink hover:bg-paper-muted disabled:opacity-30 flex items-center justify-center font-bold active:translate-y-[1px] transition-colors shadow-print-sm"
                    aria-label="Tambah Impostor"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Mr. White Toggle */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sun-light text-sun-dark flex items-center justify-center shrink-0">
                    <Question className="w-4 h-4" weight="bold" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">Mr. White (Tanpa Kata)</p>
                    <p className="text-xs text-ink-muted">Tidak mendapat kata, menebak kata warga</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleMrWhite}
                  className={cn(
                    'min-h-[44px] px-4 py-2 rounded-full text-xs font-bold transition-colors border shadow-print-sm flex items-center justify-center active:translate-y-[1px]',
                    settings.enableMrWhite
                      ? 'bg-teal-light border-teal text-teal-dark'
                      : 'bg-paper border-rule text-ink-muted hover:text-ink'
                  )}
                >
                  {settings.enableMrWhite ? 'Aktif (1)' : 'Nonaktif'}
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
            <Card padding="md" className="space-y-4">
              <div className="flex items-center justify-between border-b border-rule pb-3">
                <span className="text-sm font-bold text-ink flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-teal-light border border-teal text-teal-dark flex items-center justify-center">
                    <BookOpen className="w-4 h-4" weight="bold" />
                  </span>
                  Pilih Kategori Kata
                </span>
                <span className="text-xs font-semibold text-teal-dark bg-teal-light px-2.5 py-0.5 rounded-full border border-teal">
                  {settings.category || 'Acak / Misteri'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ALL_CATEGORY_OPTIONS.map((cat) => {
                  const isSelected = (settings.category || 'Acak / Misteri') === cat.id;

                  return (
                    <div
                      key={cat.id}
                      onClick={() => updateSettings({ category: cat.id })}
                      className={cn(
                        'p-3.5 rounded-2xl border cursor-pointer transition-colors',
                        isSelected
                          ? 'bg-teal-light border-teal-dark text-ink shadow-print-sm'
                          : 'bg-paper border-rule text-ink hover:border-teal hover:bg-paper-muted'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={cn('w-4 h-4 rounded-full shrink-0 border border-rule', isSelected ? 'bg-teal-dark border-teal-dark' : 'bg-cardstock')} />
                        <div>
                          <p className="text-sm font-semibold">{cat.title}</p>
                          <p className="text-xs text-ink-muted leading-tight mt-0.5">{cat.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {customPacks.map((cp) => {
                  const isSelected = settings.category === cp.title || settings.category === cp.id;

                  return (
                    <div
                      key={cp.id}
                      onClick={() => updateSettings({ category: cp.title })}
                      className={cn(
                        'p-3.5 rounded-2xl border cursor-pointer transition-colors',
                        isSelected
                          ? 'bg-teal-light border-teal-dark text-ink shadow-print-sm'
                          : 'bg-paper border-rule text-ink hover:border-teal hover:bg-paper-muted'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={cn('w-4 h-4 rounded-full shrink-0 border border-rule', isSelected ? 'bg-teal-dark border-teal-dark' : 'bg-cardstock')} />
                        <div>
                          <p className="text-sm font-semibold">{cp.title}</p>
                          <p className="text-xs text-ink-muted mt-0.5">{cp.wordPairs.length} pasang kata kustom</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Voting & Duration Settings */}
            <Card padding="md" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-ink flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-teal-dark" weight="bold" />
                    Mulai Voting Eliminasi Pada
                  </label>
                  <span className="text-xs font-semibold text-ink-muted bg-paper-muted px-2.5 py-0.5 rounded-full border border-rule whitespace-nowrap">
                    Ronde {settings.votingStartRound || 2}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  {[
                    { round: 1, label: 'Ronde 1', desc: 'Langsung voting' },
                    { round: 2, label: 'Ronde 2', desc: 'Pemanasan 1 ronde', recommended: true },
                    { round: 3, label: 'Ronde 3', desc: 'Pemanasan 2 ronde' },
                  ].map((opt) => {
                    const isSelected = (settings.votingStartRound || 2) === opt.round;
                    return (
                      <button
                        key={opt.round}
                        type="button"
                        onClick={() => updateSettings({ votingStartRound: opt.round })}
                        className={cn(
                          'p-2.5 sm:p-3 pt-4 rounded-2xl text-center border transition-colors relative',
                          isSelected
                            ? 'bg-teal-light border-teal-dark text-ink font-bold shadow-print-sm'
                            : 'bg-paper border-rule text-ink-muted hover:text-ink hover:border-teal'
                        )}
                      >
                        {opt.recommended && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-sun text-ink text-xs font-bold leading-none shadow-print-sm whitespace-nowrap">
                            Disarankan
                          </span>
                        )}
                        <span className="text-xs sm:text-sm font-bold block">{opt.label}</span>
                        <span className="text-xs text-ink-muted block mt-0.5 leading-snug">{opt.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Turn Duration Settings */}
              <div className="space-y-2 pt-3 border-t border-rule">
                <label className="text-sm font-bold text-ink flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-dark" weight="bold" />
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
                          'p-2.5 rounded-2xl text-center border transition-colors',
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

        {/* STEP 3: PENGISIAN NAMA & AVATAR PEMAIN */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            <Card padding="md" className="space-y-4">
              <div className="flex items-center justify-between border-b border-rule pb-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-ink">Daftar {totalPlayerCount} Pemain</h3>
                  <p className="text-xs text-ink-muted">Ketik nama pemain atau ketuk pion untuk mengganti simbol</p>
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

              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {players.map((player, idx) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-2.5 p-2 rounded-2xl bg-paper border border-rule focus-within:border-teal-dark transition-colors"
                  >
                    <span className="w-6 h-6 rounded-xl bg-paper-muted text-ink-muted font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-rule">
                      {idx + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() => setAvatarPickerPlayerIndex(idx)}
                      title="Ketuk untuk ganti pion"
                      className="shrink-0 transition-transform active:scale-95"
                    >
                      <PlayerToken avatar={player.avatar} name={player.name} size="sm" showCode={false} />
                    </button>

                    <input
                      type="text"
                      value={player.name}
                      onChange={(e) => handlePlayerNameChange(idx, e.target.value)}
                      placeholder={'Pemain ' + (idx + 1)}
                      maxLength={20}
                      className="flex-1 bg-transparent px-2.5 py-1 text-sm font-semibold text-ink placeholder-ink-faint focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => handleRandomizeSingleName(idx)}
                      title="Acak nama & pion"
                      className="p-2 rounded-full text-ink-muted hover:text-ink hover:bg-paper-muted transition-colors"
                    >
                      <Shuffle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
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

      {/* Avatar Picker Modal */}
      <Modal
        isOpen={avatarPickerPlayerIndex !== null}
        onClose={() => setAvatarPickerPlayerIndex(null)}
        title="Pilih Pion Pemain"
        size="sm"
      >
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 p-2 max-h-[60vh] overflow-y-auto">
          {PRESET_AVATARS.map((av) => (
            <button
              key={av.id}
              onClick={() => avatarPickerPlayerIndex !== null && handleSelectAvatar(avatarPickerPlayerIndex, av.emoji)}
              className="p-2.5 rounded-2xl border border-rule bg-cardstock hover:bg-paper-muted shadow-print-sm transition-colors flex items-center justify-center active:translate-y-[1px]"
              title={av.name}
            >
              <PlayerToken avatar={av.emoji} name={av.name} size="sm" showCode={false} />
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
};
