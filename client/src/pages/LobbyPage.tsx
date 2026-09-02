import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Crown,
  Play,
  Share2,
  Copy,
  Check,
  Settings2,
  Timer,
  Shield,
  EyeOff,
  HelpCircle,
  BookOpen,
  AlertCircle,
  Wifi,
} from 'lucide-react';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge, StatusBadge } from '../components/common/Badge';
import { CustomWordPackModal } from '../components/lobby/CustomWordPackModal';
import { useSocket } from '../hooks/useSocket';
import { useGameSound } from '../hooks/useGameSound';
import { CATEGORIES } from '../data/defaultWordPacks';
import { CustomWordPack, WordPair } from '../types/game.types';
import { cn } from '../utils/cn';

export interface LobbyPageProps {
  onLeaveRoom: () => void;
  onGameStarted: () => void;
}

export const LobbyPage: React.FC<LobbyPageProps> = ({
  onLeaveRoom,
  onGameStarted,
}) => {
  const {
    room,
    currentPlayer,
    updateSettings,
    startGame,
    leaveRoom,
  } = useSocket();
  const { playButtonTap } = useGameSound();


  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isPackModalOpen, setIsPackModalOpen] = useState(false);
  const [selectedCustomPack, setSelectedCustomPack] = useState<CustomWordPack | null>(null);
  const [selectedCustomWordPair, setSelectedCustomWordPair] = useState<WordPair | null>(null);

  const isHost = currentPlayer?.isHost ?? false;
  const players = room?.players || [];
  const totalPlayers = players.length;
  const settings = room?.settings || {
    category: 'Semua Kategori',
    civilianCount: 3,
    undercoverCount: 1,
    mrWhiteCount: 1,
    turnDurationSeconds: 45,
    enableMrWhite: true,
  };

  // If room transitions out of LOBBY, trigger game start callback
  useEffect(() => {
    if (room && room.phase !== 'LOBBY') {
      onGameStarted();
    }
  }, [room, onGameStarted]);

  // Handle Copy Room Code
  const handleCopyCode = async () => {
    if (!room?.roomId) return;
    try {
      await navigator.clipboard.writeText(room.roomId);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {}
  };

  // Handle Copy Share URL
  const handleCopyShareLink = async () => {
    if (!room?.roomId || typeof window === 'undefined') return;
    const url = `${window.location.origin}?room=${room.roomId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {}
  };

  // Host Role Adjustments
  const handleUpdateRoles = (undercover: number, enableMrWhite: boolean) => {
    if (!isHost) return;
    const mrWhite = enableMrWhite ? 1 : 0;
    const maxUndercover = Math.max(1, Math.floor((totalPlayers - mrWhite) / 2));
    const clampedUndercover = Math.min(Math.max(1, undercover), maxUndercover);
    const civilian = Math.max(1, totalPlayers - clampedUndercover - mrWhite);

    updateSettings({
      undercoverCount: clampedUndercover,
      enableMrWhite,
      mrWhiteCount: mrWhite,
      civilianCount: civilian,
    });
  };

  // Host Category Change
  const handleCategoryChange = (category: string) => {
    if (!isHost) return;
    setSelectedCustomPack(null);
    setSelectedCustomWordPair(null);
    updateSettings({ category });
  };

  // Host Custom Pack Selection
  const handleSelectCustomPack = (pack: CustomWordPack) => {
    if (!isHost) return;
    setSelectedCustomPack(pack);
    if (pack.wordPairs.length > 0) {
      const randomPair = pack.wordPairs[Math.floor(Math.random() * pack.wordPairs.length)];
      setSelectedCustomWordPair(randomPair);
    }
    updateSettings({ category: `Kustom: ${pack.title}` });
  };

  // Host Start Game
  const handleStartGame = async () => {
    if (!isHost || totalPlayers < 3) return;
    setIsStarting(true);
    try {
      const res = await startGame(selectedCustomWordPair || undefined);
      if (res.success) {
        onGameStarted();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsStarting(false);
    }
  };

  // Handle Leave
  const handleLeave = async () => {
    try {
      playButtonTap();
    } catch {}
    await leaveRoom();
    onLeaveRoom();
  };

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        roomCode={room?.roomId}
        showBack
        onBack={handleLeave}
        backLabel="Keluar Room"
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Room Header & Share Bar */}
        <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/30 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                Lobby Permainan Online
              </span>
              <Badge variant="cyan" size="sm" pulse>
                Menunggu Pemain
              </Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-slate-100 flex items-center justify-center sm:justify-start gap-2">
              ROOM:{' '}
              <span className="text-transparent bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text">
                {room?.roomId || '----'}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Bagikan kode atau link untuk mengundang teman ke room ini.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              leftIcon={copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            >
              {copiedCode ? 'Kode Tersalin!' : 'Salin Kode'}
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleCopyShareLink}
              leftIcon={copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            >
              {copiedLink ? 'Link Tersalin!' : 'Bagikan Link'}
            </Button>
          </div>
        </div>

        {/* Two Columns Grid: Players List vs Game Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Connected Players (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-bold text-slate-100 font-display">
                  Pemain Terhubung ({totalPlayers}/20)
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Min. 3 Pemain
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {players.map((player) => {
                const isMe = player.id === currentPlayer?.id;

                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      'p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3',
                      isMe
                        ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_15px_-3px_rgba(6,182,212,0.25)]'
                        : 'bg-slate-900/70 border-white/10'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-slate-950/80 border border-white/10 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                        {player.avatar}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-slate-100 truncate">
                            {player.name}
                          </span>
                          {isMe && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 font-semibold">
                              Kamu
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 mt-0.5">
                          {player.isHost ? (
                            <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                              <Crown className="w-3 h-3 text-amber-400" /> Room Host
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Wifi className="w-3 h-3 text-emerald-400" /> Siap
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {player.isHost && (
                        <StatusBadge status="host" size="sm" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {totalPlayers < 3 && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Membutuhkan minimal 3 pemain untuk memulai game.</span>
              </div>
            )}
          </div>

          {/* Right: Room Settings (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card
              glow={isHost ? 'cyan' : 'none'}
              padding="md"
              className="space-y-4 bg-slate-900/90 border-white/10"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm sm:text-base font-bold text-slate-100 font-display">
                    {isHost ? 'Pengaturan Game (Host)' : 'Pengaturan Game'}
                  </h3>
                </div>
                {!isHost && (
                  <Badge variant="slate" size="sm">
                    Read-Only
                  </Badge>
                )}
              </div>

              {/* Category Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Kategori Kata</label>
                {isHost ? (
                  <div className="space-y-2">
                    <select
                      value={selectedCustomPack ? `Kustom: ${selectedCustomPack.title}` : settings.category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-slate-100 text-xs sm:text-sm font-medium focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className="bg-slate-900 text-slate-100">
                          {cat}
                        </option>
                      ))}
                      {selectedCustomPack && (
                        <option
                          value={`Kustom: ${selectedCustomPack.title}`}
                          className="bg-slate-900 text-cyan-300 font-bold"
                        >
                          Kustom: {selectedCustomPack.title}
                        </option>
                      )}
                    </select>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsPackModalOpen(true)}
                      leftIcon={<BookOpen className="w-3.5 h-3.5 text-cyan-400" />}
                      className="w-full text-xs"
                    >
                      {selectedCustomPack ? `Ganti Paket Kustom (${selectedCustomPack.title})` : 'Pilih / Buat Paket Kustom'}
                    </Button>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 text-xs font-bold text-cyan-300 font-mono">
                    {settings.category}
                  </div>
                )}
              </div>

              {/* Role Distribution */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Distribusi Peran</label>
                  <span className="text-[11px] font-mono text-slate-400">
                    Total: {totalPlayers} Pemain
                  </span>
                </div>

                <div className="space-y-2">
                  {/* Civilian info */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-cyan-300">
                      <Shield className="w-3.5 h-3.5" /> Warga (Civilian)
                    </span>
                    <span className="font-mono font-bold text-cyan-200">
                      {Math.max(1, totalPlayers - settings.undercoverCount - (settings.enableMrWhite ? 1 : 0))} Orang
                    </span>
                  </div>

                  {/* Undercover slider/controls */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-rose-300">
                      <EyeOff className="w-3.5 h-3.5" /> Impostor (Undercover)
                    </span>
                    {isHost ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateRoles(settings.undercoverCount - 1, settings.enableMrWhite)}
                          disabled={settings.undercoverCount <= 1}
                          className="w-6 h-6 rounded bg-slate-900 border border-rose-500/30 text-rose-300 flex items-center justify-center font-bold disabled:opacity-40"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-rose-200 w-4 text-center">
                          {settings.undercoverCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateRoles(settings.undercoverCount + 1, settings.enableMrWhite)}
                          disabled={
                            settings.undercoverCount >=
                            Math.max(1, Math.floor((totalPlayers - (settings.enableMrWhite ? 1 : 0)) / 2))
                          }
                          className="w-6 h-6 rounded bg-slate-900 border border-rose-500/30 text-rose-300 flex items-center justify-center font-bold disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <span className="font-mono font-bold text-rose-200">
                        {settings.undercoverCount} Orang
                      </span>
                    )}
                  </div>

                  {/* Mr White toggle */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-purple-300">
                      <HelpCircle className="w-3.5 h-3.5" /> Mr. White (Buta Kata)
                    </span>
                    {isHost ? (
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.enableMrWhite}
                          onChange={(e) => handleUpdateRoles(settings.undercoverCount, e.target.checked)}
                          className="rounded border-white/20 bg-slate-900 text-purple-500 focus:ring-purple-500"
                        />
                        <span className="font-mono text-xs text-purple-200">
                          {settings.enableMrWhite ? 'Aktif (1)' : 'Nonaktif (0)'}
                        </span>
                      </label>
                    ) : (
                      <span className="font-mono font-bold text-purple-200">
                        {settings.enableMrWhite ? '1 Orang' : 'Tidak Ada'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Turn Duration Slider */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5 text-cyan-400" />
                    Durasi Bicara
                  </span>
                  <span className="font-mono font-bold text-cyan-300">
                    {settings.turnDurationSeconds} Detik
                  </span>
                </div>
                {isHost && (
                  <input
                    type="range"
                    min={15}
                    max={90}
                    step={5}
                    value={settings.turnDurationSeconds}
                    onChange={(e) => updateSettings({ turnDurationSeconds: Number(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                )}
              </div>

              {/* Start Game Action (Host) or Status Note (Non-Host) */}
              <div className="pt-3 border-t border-white/10">
                {isHost ? (
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={totalPlayers < 3}
                    isLoading={isStarting}
                    onClick={handleStartGame}
                    leftIcon={<Play className="w-5 h-5 fill-current" />}
                  >
                    {totalPlayers < 3
                      ? `Menunggu Pemain (${totalPlayers}/3)`
                      : 'Mulai Permainan Sekarang'}
                  </Button>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/5 text-center space-y-1">
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-200">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span>Menunggu Host Memulai Permainan...</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Permainan akan otomatis dimulai di layarmu begitu Host menekan tombol mulai.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Custom Word Pack Selector Modal */}
      <CustomWordPackModal
        isOpen={isPackModalOpen}
        onClose={() => setIsPackModalOpen(false)}
        onSelectPack={handleSelectCustomPack}
      />
    </div>
  );
};

export default LobbyPage;
