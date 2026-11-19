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
  const effectivePlayers = Math.max(3, totalPlayers);
  const settings = room?.settings || {
    category: 'Semua Kategori',
    civilianCount: 3,
    undercoverCount: 1,
    mrWhiteCount: 1,
    turnDurationSeconds: 45,
    enableMrWhite: true,
  };
  const isMrWhiteAllowed = totalPlayers > 3;
  const activeMrWhite = totalPlayers === 3 || totalPlayers < 3 ? 0 : (settings.enableMrWhite ? 1 : 0);
  const maxUndercover = Math.max(1, Math.floor((effectivePlayers - activeMrWhite - 1) / 2));
  const displayedUndercover = Math.min(Math.max(1, settings.undercoverCount), maxUndercover);
  const displayedCivilian = Math.max(1, effectivePlayers - displayedUndercover - activeMrWhite);

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
    const mrWhite = totalPlayers > 3 && enableMrWhite ? 1 : 0;
    const nextMaxUndercover = Math.max(1, Math.floor((effectivePlayers - mrWhite - 1) / 2));
    const clampedUndercover = Math.min(Math.max(1, undercover), nextMaxUndercover);
    const civilian = Math.max(1, effectivePlayers - clampedUndercover - mrWhite);

    updateSettings({
      undercoverCount: clampedUndercover,
      enableMrWhite: totalPlayers === 3 ? false : enableMrWhite,
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
    } else {
      setSelectedCustomWordPair(null);
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
        {/* Perforated Tabletop Room Ticket Bar */}
        <div className="rounded-3xl bg-cardstock border border-rule shadow-print overflow-hidden">
          <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* 4-Char Ticket Code Tiles */}
              <button
                type="button"
                onClick={handleCopyCode}
                title="Ketuk untuk menyalin kode meja"
                className="inline-flex items-center gap-1.5 p-2 rounded-2xl bg-paper border border-dashed border-rule hover:border-teal-dark transition-colors cursor-pointer self-start"
              >
                {(room?.roomId || '----').split('').map((ch, idx) => (
                  <span
                    key={idx}
                    className="w-10 h-11 sm:w-11 sm:h-12 rounded-xl bg-cardstock border border-rule font-mono text-xl sm:text-2xl font-extrabold text-ink flex items-center justify-center shadow-print-sm"
                  >
                    {ch}
                  </span>
                ))}
              </button>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-ink">
                    Tiket Meja Online
                  </span>
                  <Badge variant="amber" size="sm" pulse>
                    Menunggu Pemain
                  </Badge>
                </div>
                <p className="text-xs text-ink-muted max-w-[38ch]">
                  Ketuk kode 4 huruf di samping atau bagikan tautan untuk mengundang teman ke meja ini.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-dashed border-rule">
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

          {/* Visual Seat Fill Bar */}
          <div className="px-5 sm:px-6 py-2.5 bg-paper-muted border-t border-rule flex items-center justify-between gap-4 text-xs">
            <span className="font-semibold text-ink-muted">
              Kapasitas Kursi: <strong className="text-ink">{totalPlayers}/20 terisi</strong>
            </span>
            <div className="w-32 sm:w-48 h-2 rounded-full bg-paper border border-rule overflow-hidden">
              <div
                className="h-full bg-teal-dark origin-left transition-transform duration-200"
                style={{ transform: `scaleX(${Math.min(1, Math.max(0.08, totalPlayers / 20))})` }}
              />
            </div>
          </div>
        </div>

        {/* Two Columns Grid: Players List vs Game Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Connected Players (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-teal-light border border-teal text-teal-dark flex items-center justify-center">
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
                        ? 'bg-teal-light border-teal shadow-print-sm'
                        : 'bg-cardstock border-rule shadow-print-sm'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="shrink-0">
                        <PlayerToken avatar={player.avatar} name={player.name} size="md" showCode={false} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-sm font-bold text-ink truncate block min-w-0">
                            {player.name}
                          </span>
                          {isMe && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-cardstock border border-rule text-teal-dark font-semibold shrink-0">
                              Kamu
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                          {player.isHost ? (
                            <span className="text-xs text-sun-dark font-semibold flex items-center gap-1 shrink-0">
                              <Crown className="w-3.5 h-3.5 text-sun-dark" weight="bold" /> Pemilik Meja
                            </span>
                          ) : (
                            <span className="text-xs text-ink-muted flex items-center gap-1 shrink-0">
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
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-semibold text-ink">Komposisi Peran</label>
                  <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                    <span>Total: {totalPlayers} pemain</span>
                    {totalPlayers < 3 && (
                      <span className="px-2 py-0.5 rounded-full bg-paper-muted border border-rule text-[11px] font-medium text-ink-muted">
                        Simulasi min. 3 pemain
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {/* Civilian info */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-paper border border-rule text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-ink">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-dark" weight="bold" /> Warga (Civilian)
                    </span>
                    <span className="font-semibold text-ink px-2.5 py-0.5 rounded-full bg-paper-muted border border-rule">
                      {displayedCivilian} orang
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
                          onClick={() => handleUpdateRoles(displayedUndercover - 1, settings.enableMrWhite)}
                          disabled={displayedUndercover <= 1}
                          className="min-w-[44px] min-h-[44px] sm:min-w-[32px] sm:min-h-[32px] rounded-xl bg-cardstock border border-rule text-ink hover:bg-paper-muted flex items-center justify-center font-bold disabled:opacity-40 shadow-print-sm active:translate-y-[1px] transition-colors"
                          aria-label="Kurangi Impostor"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-stamp-dark min-w-[28px] text-center text-sm">
                          {displayedUndercover}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateRoles(displayedUndercover + 1, settings.enableMrWhite)}
                          disabled={displayedUndercover >= maxUndercover}
                          className="min-w-[44px] min-h-[44px] sm:min-w-[32px] sm:min-h-[32px] rounded-xl bg-cardstock border border-rule text-ink hover:bg-paper-muted flex items-center justify-center font-bold disabled:opacity-40 shadow-print-sm active:translate-y-[1px] transition-colors"
                          aria-label="Tambah Impostor"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <span className="font-semibold text-stamp-dark px-2.5 py-0.5 rounded-full bg-stamp-light border border-stamp">
                        {displayedUndercover} orang
                      </span>
                    )}
                  </div>

                  {/* Mr White toggle */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-paper border border-rule text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-ink-muted">
                      <Question className="w-3.5 h-3.5" weight="bold" /> Mr. White (Tanpa Kata)
                    </span>
                    {isHost ? (
                      <label className={cn("flex items-center gap-2", isMrWhiteAllowed ? "cursor-pointer" : "cursor-not-allowed opacity-60")}>
                        <input
                          type="checkbox"
                          checked={activeMrWhite === 1}
                          disabled={!isMrWhiteAllowed}
                          onChange={(e) => handleUpdateRoles(displayedUndercover, e.target.checked)}
                          className="rounded border-rule text-teal-dark focus:ring-teal disabled:cursor-not-allowed"
                        />
                        <span className={cn("text-xs font-semibold px-2.5 py-0.5 rounded-full border", activeMrWhite === 1 ? "bg-sun-light border-sun text-sun-dark" : "bg-paper-muted border-rule text-ink-muted")}>
                          {!isMrWhiteAllowed ? 'Min. 4 pemain' : activeMrWhite === 1 ? 'Aktif (1)' : 'Nonaktif'}
                        </span>
                      </label>
                    ) : (
                      <span className="font-semibold text-ink-muted px-2.5 py-0.5 rounded-full bg-paper-muted border border-rule">
                        {activeMrWhite === 1 ? '1 orang' : 'Tidak ada'}
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
                      <Timer className="w-4 h-4 text-teal-dark" weight="bold" />
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
