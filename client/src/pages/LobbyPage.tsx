import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Check, Copy, Crown, EyeSlash, GearSix, Play, Question, ShareNetwork, ShieldCheck, Timer, Users, WarningCircle, WifiHigh } from '@phosphor-icons/react';
import { PlayerToken } from '../components/game/PlayerToken';
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
    <div className="min-h-[100dvh] text-ink flex flex-col font-sans">
      <Header
        roomCode={room?.roomId}
        showBack
        onBack={handleLeave}
        backLabel="Keluar Room"
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Room Header & Share Bar */}
        <div className="p-4 sm:p-6 rounded-2xl bg-cardstock border-2 border-rule shadow-print flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-stamp-dark font-semibold">
                Lobby Permainan Online
              </span>
              <Badge variant="amber" size="sm" pulse>
                Menunggu Pemain
              </Badge>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink-muted">
                KODE MEJA:
              </span>
              <span className="px-3 py-1 rounded-xl bg-cardstock-warm border-2 border-rule text-ink tracking-[0.2em] font-mono text-2xl sm:text-3xl font-extrabold shadow-print-sm">
                {room?.roomId || '----'}
              </span>
            </div>
            <p className="text-xs text-ink-muted pt-0.5">
              Bagikan kode atau link untuk mengundang teman ke meja ini.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              leftIcon={copiedCode ? <Check className="w-4 h-4 text-ink" /> : <Copy className="w-4 h-4" />}
            >
              {copiedCode ? 'Kode Tersalin!' : 'Salin Kode'}
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleCopyShareLink}
              leftIcon={copiedLink ? <Check className="w-4 h-4 text-ink" /> : <ShareNetwork className="w-4 h-4" />}
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
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-stamp-light text-stamp-dark flex items-center justify-center">
                  <Users className="w-4 h-4" weight="bold" />
                </span>
                <h3 className="text-base font-bold text-ink font-display">
                  Pemain Terhubung ({totalPlayers}/20)
                </h3>
              </div>
              <span className="text-xs font-mono text-ink-muted">
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
                        ? 'bg-cardstock-warm border-stamp shadow-print-sm ring-1 ring-stamp'
                        : 'bg-cardstock border-rule'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="shrink-0">
                        <PlayerToken avatar={player.avatar} name={player.name} size="md" showCode={false} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-ink truncate">
                            {player.name}
                          </span>
                          {isMe && (
                            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-cardstock border border-rule text-stamp-dark font-bold">
                              Kamu
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 mt-0.5">
                          {player.isHost ? (
                            <span className="text-[11px] text-stamp-dark font-bold flex items-center gap-1">
                              <Crown className="w-3.5 h-3.5 text-stamp-dark" weight="bold" /> Room Host
                            </span>
                          ) : (
                            <span className="text-[11px] text-ink-muted flex items-center gap-1">
                              <WifiHigh className="w-3.5 h-3.5 text-teal" weight="bold" /> Siap
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
              <div className="p-3.5 rounded-xl bg-cardstock-warm border border-rule text-ink-muted text-xs flex items-center gap-2">
                <WarningCircle className="w-4 h-4 shrink-0 text-stamp-dark" weight="bold" />
                <span>Membutuhkan minimal 3 pemain untuk memulai game.</span>
              </div>
            )}
          </div>

          {/* Right: Room Settings (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card
              padding="md"
              className="space-y-4 bg-cardstock border-2 border-rule shadow-print"
            >
              <div className="flex items-center justify-between border-b border-rule pb-3">
                <div className="flex items-center gap-2">
                  <GearSix className="w-4 h-4 text-ink-muted" weight="bold" />
                  <h3 className="text-sm sm:text-base font-bold text-ink font-display">
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
                <label className="text-xs font-semibold text-ink">Kategori Kata</label>
                {isHost ? (
                  <div className="space-y-2">
                    <select
                      value={selectedCustomPack ? `Kustom: ${selectedCustomPack.title}` : settings.category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-paper border border-rule text-ink text-xs sm:text-sm font-medium focus:outline-none focus:border-ink cursor-pointer"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className="bg-cardstock text-ink">
                          {cat}
                        </option>
                      ))}
                      {selectedCustomPack && (
                        <option
                          value={`Kustom: ${selectedCustomPack.title}`}
                          className="bg-cardstock text-stamp-dark font-bold"
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
                      leftIcon={<BookOpen className="w-3.5 h-3.5 text-stamp-dark" />}
                      className="w-full text-xs"
                    >
                      {selectedCustomPack ? `Ganti Paket Kustom (${selectedCustomPack.title})` : 'Pilih / Buat Paket Kustom'}
                    </Button>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-paper border border-rule text-xs font-bold text-stamp-dark font-mono">
                    {settings.category}
                  </div>
                )}
              </div>

              {/* Role Distribution */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-ink">Distribusi Peran</label>
                  <span className="text-[11px] font-mono text-ink-muted">
                    Total: {totalPlayers} Pemain
                  </span>
                </div>

                <div className="space-y-2">
                  {/* Civilian info */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-paper border border-rule text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-ink">
                      <ShieldCheck className="w-3.5 h-3.5 text-ink-muted" weight="bold" /> Warga (Civilian)
                    </span>
                    <span className="font-mono font-bold text-ink px-2 py-0.5 rounded bg-cardstock-warm border border-rule">
                      {Math.max(1, totalPlayers - settings.undercoverCount - (settings.enableMrWhite ? 1 : 0))} Orang
                    </span>
                  </div>

                  {/* Undercover slider/controls */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-paper border border-rule text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-stamp-dark">
                      <EyeSlash className="w-3.5 h-3.5" weight="bold" /> Impostor (Undercover)
                    </span>
                    {isHost ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateRoles(settings.undercoverCount - 1, settings.enableMrWhite)}
                          disabled={settings.undercoverCount <= 1}
                          className="w-6 h-6 rounded bg-cardstock border border-rule text-ink hover:bg-paper-muted flex items-center justify-center font-bold disabled:opacity-40"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-stamp-dark w-4 text-center">
                          {settings.undercoverCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateRoles(settings.undercoverCount + 1, settings.enableMrWhite)}
                          disabled={
                            settings.undercoverCount >=
                            Math.max(1, Math.floor((totalPlayers - (settings.enableMrWhite ? 1 : 0)) / 2))
                          }
                          className="w-6 h-6 rounded bg-cardstock border border-rule text-ink hover:bg-paper-muted flex items-center justify-center font-bold disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <span className="font-mono font-bold text-stamp-dark px-2 py-0.5 rounded bg-cardstock-warm border border-rule">
                        {settings.undercoverCount} Orang
                      </span>
                    )}
                  </div>

                  {/* Mr White toggle */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-paper border border-rule text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-ink-muted">
                      <Question className="w-3.5 h-3.5" weight="bold" /> Mr. White (Buta Kata)
                    </span>
                    {isHost ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.enableMrWhite}
                          onChange={(e) => handleUpdateRoles(settings.undercoverCount, e.target.checked)}
                          className="rounded border-rule text-stamp focus:ring-stamp"
                        />
                        <span className={cn("font-mono text-xs font-bold px-2 py-0.5 rounded border", settings.enableMrWhite ? "bg-stamp-light border-stamp text-stamp-dark" : "bg-cardstock-warm border-rule text-ink-muted")}>
                          {settings.enableMrWhite ? 'Aktif (1)' : 'Nonaktif (0)'}
                        </span>
                      </label>
                    ) : (
                      <span className="font-mono font-bold text-ink-muted px-2 py-0.5 rounded bg-cardstock-warm border border-rule">
                        {settings.enableMrWhite ? '1 Orang' : 'Tidak Ada'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Turn Duration Slider */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5 text-ink-muted" weight="bold" />
                    Durasi Bicara
                  </span>
                  <span className="font-mono font-bold text-ink">
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
                    className="w-full accent-teal cursor-pointer"
                  />
                )}
              </div>

              {/* Start Game Action (Host) or Status Note (Non-Host) */}
              <div className="pt-3 border-t border-rule">
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
                  <div className="p-3.5 rounded-2xl bg-paper border border-rule text-center space-y-1">
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-ink">
                      <span className="w-2 h-2 rounded-full bg-stamp animate-ping" />
                      <span>Menunggu Host Memulai Permainan...</span>
                    </div>
                    <p className="text-[11px] text-ink-muted">
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
