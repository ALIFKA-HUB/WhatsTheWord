import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  UserPlus,
  Trash2,
  Play,
  Layers,
  Clock,
  Shield,
  EyeOff,
  HelpCircle,
  Plus,
  Sparkles,
  Edit2,
  Check,
} from 'lucide-react';
import { usePassPlay } from '../context/PassPlayContext';
import { Button } from '../components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { AvatarPicker, PRESET_AVATARS } from '../components/game/AvatarPicker';
import { CATEGORIES } from '../data/defaultWordPacks';
import { getLocalCustomPacks } from '../services/wordPackService';
import { CustomWordPack } from '../types/game.types';
import { Header } from '../components/common/Header';

const TURN_DURATION_OPTIONS = [
  { label: '30s', value: 30, desc: 'Cepat & Intensif' },
  { label: '45s', value: 45, desc: 'Standar Turn' },
  { label: '60s', value: 60, desc: 'Santai & Leluasa' },
  { label: 'Bebas', value: 0, desc: 'Tanpa Batasan Waktu' },
];

export interface PassPlaySetupPageProps {
  onBack?: () => void;
}

export const PassPlaySetupPage: React.FC<PassPlaySetupPageProps> = ({ onBack }) => {
  const {
    players,
    settings,
    addPlayer,
    removePlayer,
    updatePlayer,
    updateSettings,
    startPassPlayGame,
  } = usePassPlay();

  // Add/Edit Player Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [modalName, setModalName] = useState('');
  const [modalAvatar, setModalAvatar] = useState('🕵️');
  const [customPacks, setCustomPacks] = useState<CustomWordPack[]>([]);

  // Load custom packs from localStorage
  useEffect(() => {
    try {
      const packs = getLocalCustomPacks();
      setCustomPacks(packs);
    } catch {
      // ignore
    }
  }, []);

  const handleOpenAddModal = () => {
    setEditingPlayerId(null);
    // Pick random avatar not yet chosen if possible
    const usedAvatars = new Set(players.map((p) => p.avatar));
    const available = PRESET_AVATARS.filter((a) => !usedAvatars.has(a.emoji));
    const defaultAvatar = available.length > 0 ? available[0].emoji : PRESET_AVATARS[0].emoji;

    setModalAvatar(defaultAvatar);
    setModalName(`Pemain ${players.length + 1}`);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (playerId: string) => {
    const target = players.find((p) => p.id === playerId);
    if (!target) return;
    setEditingPlayerId(playerId);
    setModalName(target.name);
    setModalAvatar(target.avatar);
    setIsAddModalOpen(true);
  };

  const handleSaveModalPlayer = () => {
    if (!modalName.trim()) return;

    if (editingPlayerId) {
      updatePlayer(editingPlayerId, {
        name: modalName.trim(),
        avatar: modalAvatar,
      });
    } else {
      addPlayer(modalName.trim(), modalAvatar);
    }
    setIsAddModalOpen(false);
  };

  const handleQuickAdd = () => {
    const usedAvatars = new Set(players.map((p) => p.avatar));
    const available = PRESET_AVATARS.filter((a) => !usedAvatars.has(a.emoji));
    const avatar = available.length > 0
      ? available[Math.floor(Math.random() * available.length)].emoji
      : PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)].emoji;

    addPlayer(`Pemain ${players.length + 1}`, avatar);
  };

  // Role configuration constraints
  const totalPlayers = players.length;
  const mrWhiteCount = settings.enableMrWhite ? 1 : 0;
  const maxUndercover = Math.max(1, Math.floor((totalPlayers - mrWhiteCount - 1) / 2));
  const currentUndercover = Math.min(Math.max(1, settings.undercoverCount), maxUndercover);
  const currentCivilian = Math.max(1, totalPlayers - currentUndercover - mrWhiteCount);

  const handleUndercoverChange = (delta: number) => {
    const next = Math.max(1, Math.min(maxUndercover, currentUndercover + delta));
    updateSettings({
      undercoverCount: next,
      civilianCount: totalPlayers - next - mrWhiteCount,
    });
  };

  const handleToggleMrWhite = () => {
    const nextEnable = !settings.enableMrWhite;
    const nextMrWhite = nextEnable ? 1 : 0;
    const nextMaxUndercover = Math.max(1, Math.floor((totalPlayers - nextMrWhite - 1) / 2));
    const nextUndercover = Math.min(currentUndercover, nextMaxUndercover);
    const nextCivilian = totalPlayers - nextUndercover - nextMrWhite;

    updateSettings({
      enableMrWhite: nextEnable,
      mrWhiteCount: nextMrWhite,
      undercoverCount: nextUndercover,
      civilianCount: nextCivilian,
    });
  };

  const handleStartGame = () => {
    const success = startPassPlayGame();
    if (!success) {
      alert('Minimal 3 pemain untuk memulai permainan!');
    }
  };

  return (
    <div className="min-h-screen bg-[#080c16] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <Header
        title="PASS & PLAY"
        subtitle="1 HP OFFLINE MODE"
        onBack={onBack}
        showBack={!!onBack}
        backLabel="Menu Utama"
      />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Mode 1 Perangkat Tanpa Kuota / Sinyal
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-display tracking-tight bg-gradient-to-r from-cyan-300 via-white to-violet-300 bg-clip-text text-transparent">
            Pengaturan Game Pass & Play
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto font-sans">
            Kumpulkan teman-temanmu dalam 1 ruangan, oper HP secara bergiliran untuk melihat kata rahasia, lalu temukan siapa impostornya!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Player Roster (7 Cols) */}
          <div className="md:col-span-7 space-y-6">
            <Card glow="cyan" className="p-4 sm:p-6">
              <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between border-b border-white/10">
                <div className="space-y-1">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-400" />
                    Daftar Pemain ({players.length}/20)
                  </CardTitle>
                  <p className="text-xs text-slate-400">Minimal 3 pemain untuk bermain</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={handleQuickAdd}
                    disabled={players.length >= 20}
                    className="border-dashed hover:border-cyan-400 text-xs"
                    title="Tambah Cepat"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Cepat</span>
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleOpenAddModal}
                    disabled={players.length >= 20}
                    leftIcon={<UserPlus className="w-4 h-4" />}
                  >
                    Tambah
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-0 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                  <AnimatePresence initial={false}>
                    {players.map((p, index) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="group flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-950/60 border border-white/10 hover:border-cyan-500/40 hover:bg-slate-900/80 transition-all"
                      >
                        <div
                          onClick={() => handleOpenEditModal(p.id)}
                          className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                          title="Klik untuk ubah nama & avatar"
                        >
                          <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform">
                            {p.avatar}
                          </span>
                          <div className="min-w-0 flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold text-slate-200 truncate font-sans group-hover:text-cyan-300">
                                {p.name}
                              </span>
                              {p.isHost && (
                                <Badge variant="amber" size="sm">
                                  P1
                                </Badge>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-slate-500">
                              Urutan #{index + 1}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(p.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-all"
                            title="Edit Pemain"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {players.length > 3 && (
                            <button
                              type="button"
                              onClick={() => removePlayer(p.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                              title="Hapus Pemain"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Roles & Game Settings (5 Cols) */}
          <div className="md:col-span-5 space-y-6">
            {/* Category Selector */}
            <Card className="p-4 sm:p-5">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    Kategori Kata
                  </span>
                  {customPacks.length > 0 && (
                    <span className="text-[10px] font-mono text-cyan-400">
                      +{customPacks.length} Pack Kustom
                    </span>
                  )}
                </label>

                <select
                  value={settings.category}
                  onChange={(e) => updateSettings({ category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-slate-100 text-sm font-medium focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                >
                  <optgroup label="Kategori Resmi">
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </optgroup>

                  {customPacks.length > 0 && (
                    <optgroup label="Paket Kustom Saya">
                      {customPacks.map((cp) => (
                        <option key={cp.id} value={cp.title}>
                          📦 {cp.title} ({cp.wordPairs.length} kata)
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
            </Card>

            {/* Role Distribution Sliders / Steppers */}
            <Card className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  Komposisi Peran
                </span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  Total: {totalPlayers} Pemain
                </span>
              </div>

              {/* Civilian Row */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-cyan-500/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-cyan-300">Warga (Civilian)</p>
                    <p className="text-[10px] text-slate-400">Mengetahui kata rahasia asli</p>
                  </div>
                </div>
                <span className="text-base font-mono font-black text-cyan-400 px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                  {currentCivilian}
                </span>
              </div>

              {/* Undercover Stepper */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-rose-500/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                    <EyeOff className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-rose-300">Impostor (Undercover)</p>
                    <p className="text-[10px] text-slate-400">Kata mirip, berbeda sedikit</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUndercoverChange(-1)}
                    disabled={currentUndercover <= 1}
                    className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <span className="text-base font-mono font-black text-rose-400 min-w-[24px] text-center">
                    {currentUndercover}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUndercoverChange(1)}
                    disabled={currentUndercover >= maxUndercover}
                    className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Mr. White Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-purple-500/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-purple-300">Buta Kata (Mr. White)</p>
                    <p className="text-[10px] text-slate-400">Tanpa kata, harus menebak</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleMrWhite}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                    settings.enableMrWhite
                      ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_15px_-3px_rgba(168,85,247,0.4)]'
                      : 'bg-slate-800/80 border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {settings.enableMrWhite ? 'AKTIF (1)' : 'NONAKTIF'}
                </button>
              </div>
            </Card>

            {/* Turn Duration Settings */}
            <Card className="p-4 sm:p-5 space-y-3">
              <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                Durasi Clue per Pemain
              </label>

              <div className="grid grid-cols-4 gap-2">
                {TURN_DURATION_OPTIONS.map((opt) => {
                  const isSelected = settings.turnDurationSeconds === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateSettings({ turnDurationSeconds: opt.value })}
                      className={`p-2 rounded-xl text-center border transition-all ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)] font-bold'
                          : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                      }`}
                      title={opt.desc}
                    >
                      <span className="text-xs sm:text-sm font-mono block">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Start Game Button */}
            <Button
              variant="primary"
              size="xl"
              fullWidth
              onClick={handleStartGame}
              disabled={players.length < 3}
              leftIcon={<Play className="w-5 h-5 fill-current" />}
              className="shadow-xl shadow-cyan-500/30"
            >
              Mulai Permainan ({players.length} Pemain)
            </Button>
          </div>
        </div>
      </main>

      {/* Add / Edit Player Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingPlayerId ? 'Ubah Profil Pemain' : 'Tambah Pemain Baru'}
        subtitle="Pilih avatar unik dan masukkan nama pemain"
        size="md"
        footer={
          <div className="flex items-center gap-2 w-full justify-end">
            <Button variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveModalPlayer}
              disabled={!modalName.trim()}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Simpan Pemain
            </Button>
          </div>
        }
      >
        <div className="space-y-4 pt-1">
          <AvatarPicker
            selectedAvatar={modalAvatar}
            onSelectAvatar={(av) => setModalAvatar(av)}
            nickname={modalName}
            onNicknameChange={(name) => setModalName(name)}
            showNicknameInput
          />
        </div>
      </Modal>
    </div>
  );
};

export default PassPlaySetupPage;
