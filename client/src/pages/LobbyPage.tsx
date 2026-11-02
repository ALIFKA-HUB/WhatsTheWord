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

  useEffect(() => {
    if (room && room.phase !== 'LOBBY') {
      onGameStarted();
    }
  }, [room, onGameStarted]);

  const handleCopyCode = async () => {
    if (!room?.roomId) return;
    try {
      await navigator.clipboard.writeText(room.roomId);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {}
  };

  const handleCopyShareLink = async () => {
    if (!room?.roomId || typeof window === 'undefined') return;
    const url = `${window.location.origin}?room=${room.roomId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {}
  };

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

  const handleCategoryChange = (category: string) => {
    if (!isHost) return;
    setSelectedCustomPack(null);
    setSelectedCustomWordPair(null);
    updateSettings({ category });
  };

  const handleSelectCustomPack = (pack: CustomWordPack) => {
    if (!isHost) return;
    setSelectedCustomPack(pack);
    if (pack.wordPairs.length > 0) {
      const randomPair = pack.wordPairs[Math.floor(Math.random() * pack.wordPairs.length)];
      setSelectedCustomWordPair(randomPair);
    }
    updateSettings({ category: `Kustom: ${pack.title}` });
  };

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
        <div className="p-5 sm:p-6 rounded-3xl bg-cardstock border border-rule shadow-print flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-1.5">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-semibold text-ink-muted">
                Ruang Tunggu Online
              </span>
              <Badge variant="amber" size="sm" pulse>
                Menunggu Pemain
              </Badge>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-1">
              <span className="text-xs font-semibold text-ink-muted">
                Kode meja:
              </span>
              <span className="px-3.5 py-1 rounded-2xl bg-paper border border-rule text-ink font-mono text-2xl sm:text-3xl font-extrabold shadow-print-sm">
                {room?.roomId || '----'}
              </span>
            </div>
            <p className="text-xs text-ink-muted pt-0.5">
              Bagikan kode atau tautan untuk mengundang teman ke meja ini.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyCode}
              leftIcon={copiedCode ? <Check className="w-4 h-4 text-teal-dark" /> : <Copy className="w-4 h-4" />}
            >
              {copiedCode ? 'Kode Tersalin!' : 'Salin Kode'}
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleCopyShareLink}
              leftIcon={copiedLink ? <Check className="w-4 h-4 text-ink" /> : <ShareNetwork className="w-4 h-4" />}
            >
              {copiedLink ? 'Tautan Tersalin!' : 'Bagikan Tautan'}
            </Button>
          </div>
        </div>

        {/* Two Columns Grid: Players List vs Game Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Connected Players (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-teal-light border border-teal/40 text-teal-dark flex items-center justify-center">
                  <Users className="w-4 h-4" weight="bold" />
                </span>
                <h3 className="text-base font-bold text-ink font-display">
                  Pemain Terhubung ({totalPlayers}/20)
                </h3>
              </div>
              <span className="text-xs text-ink-muted font-medium">
                Minimal 3 pemain
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {players.map((player) => {
                const isMe = player.id === currentPlayer?.id;

                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      'p-3.5 rounded-2xl border transition-colors flex items-center justify-between gap-3',
                      isMe
                        ? 'bg-teal-light/40 border-teal/50 shadow-print-sm'
                        : 'bg-cardstock border-rule shadow-print-sm'
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
                            <span className="text-xs px-2 py-0.5 rounded-full bg-cardstock border border-rule text-teal-dark font-semibold">
                              Kamu
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 mt-0.5">
                          {player.isHost ? (
                            <span className="text-xs text-sun-dark font-semibold flex items-center gap-1">
                              <Crown className="w-3.5 h-3.5 text-sun-dark" weight="bold" /> Pemilik Meja
                            </span>
                          ) : (
                            <span className="text-xs text-ink-muted flex items-center gap-1">
                              <WifiHigh className="w-3.5 h-3.5 text-teal-dark" weight="bold" /> Siap bermain
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
              <div className="p-3.5 rounded-2xl bg-paper-muted border border-rule text-ink-muted text-xs flex items-center gap-2">
                <WarningCircle className="w-4 h-4 shrink-0 text-sun-dark" weight="bold" />
                <span>Membutuhkan minimal 3 pemain untuk memulai permainan.</span>
              </div>
            )}
          </div>

          {/* Right: Room Settings (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card padding="md" className="space-y-4">
              <div className="flex items-center justify-between border-b border-rule pb-3">
                <div className="flex items-center gap-2">
                  <GearSix className="w-4 h-4 text-ink-muted" weight="bold" />
                  <h3 className="text-sm sm:text-base font-bold text-ink font-display">
                    {isHost ? 'Pengaturan Permainan (Host)' : 'Pengaturan Permainan'}
                  </h3>
                </div>
                {!isHost && (
                  <Badge variant="slate" size="sm">
                    Hanya Lihat
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-paper border border-rule text-ink text-xs sm:text-sm font-medium focus:outline-none focus:border-teal-dark cursor-pointer"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className="bg-cardstock text-ink">
                          {cat}
                        </option>
                      ))}
                      {selectedCustomPack && (
                        <option
                          value={`Kustom: ${selectedCustomPack.title}`}
                          className="bg-cardstock text-teal-dark font-bold"
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
                      leftIcon={<BookOpen className="w-3.5 h-3.5 text-teal-dark" />}
                      className="w-full text-xs"
                    >
                      {selectedCustomPack ? `Ganti Paket Kustom (${selectedCustomPack.title})` : 'Pilih / Buat Paket Kustom'}
                    </Button>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-paper border border-rule text-xs font-semibold text-ink">
                    {settings.category}
                  </div>
                )}
              </div>

              {/* Role Distribution */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-ink">Komposisi Peran</label>
                  <span className="text-xs text-ink-muted">
                    Total: {totalPlayers} pemain
                  </span>
                </div>

                <div className="space-y-2">
                  {/* Civilian info */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-paper border border-rule text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-ink">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-dark" weight="bold" /> Warga (Civilian)
                    </span>
                    <span className="font-semibold text-ink px-2.5 py-0.5 rounded-full bg-paper-muted border border-rule">
                      {Math.max(1, totalPlayers - settings.undercoverCount - (settings.enableMrWhite ? 1 : 0))} orang
                    </span>
                  </div>

                  {/* Undercover controls */}
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
                          className="w-6 h-6 rounded-lg bg-cardstock border border-rule text-ink hover:bg-paper-muted flex items-center justify-center font-bold disabled:opacity-40"
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
                          className="w-6 h-6 rounded-lg bg-cardstock border border-rule text-ink hover:bg-paper-muted flex items-center justify-center font-bold disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <span className="font-semibold text-stamp-dark px-2.5 py-0.5 rounded-full bg-stamp-light border border-stamp/40">
                        {settings.undercoverCount} orang
                      </span>
                    )}
                  </div>

                  {/* Mr White toggle */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-paper border border-rule text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-ink-muted">
                      <Question className="w-3.5 h-3.5" weight="bold" /> Mr. White (Tanpa Kata)
                    </span>
                    {isHost ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.enableMrWhite}
                          onChange={(e) => handleUpdateRoles(settings.undercoverCount, e.target.checked)}
                          className="rounded border-rule text-teal-dark focus:ring-teal"
                        />
                        <span className={cn("text-xs font-semibold px-2.5 py-0.5 rounded-full border", settings.enableMrWhite ? "bg-sun-light border-sun/50 text-sun-dark" : "bg-paper-muted border-rule text-ink-muted")}>
                          {settings.enableMrWhite ? 'Aktif (1)' : 'Nonaktif'}
                        </span>
                      </label>
                    ) : (
                      <span className="font-semibold text-ink-muted px-2.5 py-0.5 rounded-full bg-paper-muted border border-rule">
                        {settings.enableMrWhite ? '1 orang' : 'Tidak ada'}
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
                  <span className="font-semibold text-ink">
                    {settings.turnDurationSeconds} detik
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
                      <span className="w-2 h-2 rounded-full bg-teal-dark" />
                      <span>Menunggu Host memulai permainan…</span>
                    </div>
                    <p className="text-xs text-ink-muted">
                      Permainan akan otomatis dimulai di layarmu begitu Host menekan tombol mulai.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>

      <CustomWordPackModal
        isOpen={isPackModalOpen}
        onClose={() => setIsPackModalOpen(false)}
        onSelectPack={handleSelectCustomPack}
      />
    </div>
  );
};

export default LobbyPage;
