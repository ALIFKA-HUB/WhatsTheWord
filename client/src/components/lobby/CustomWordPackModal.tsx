import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Plus,
  Trash2,
  Share2,
  Copy,
  Check,
  Search,
  BookOpen,
  Sparkles,
  Save,
  FolderOpen,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { WordPair, CustomWordPack } from '../../types/game.types';
import { wordPackService } from '../../services/wordPackService';
import { cn } from '../../utils/cn';


export interface CustomWordPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPack?: (pack: CustomWordPack) => void;
  onSelectWordPair?: (pair: WordPair) => void;
}

type TabType = 'CREATE' | 'IMPORT' | 'SAVED';

export const CustomWordPackModal: React.FC<CustomWordPackModalProps> = ({
  isOpen,
  onClose,
  onSelectPack,
  onSelectWordPair,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('CREATE');

  // Create Pack State
  const [title, setTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [category, setCategory] = useState('Kustom');
  const [pairs, setPairs] = useState<Array<{ civilian: string; undercover: string }>>([
    { civilian: '', undercover: '' },
    { civilian: '', undercover: '' },
    { civilian: '', undercover: '' },
  ]);
  const [isPublic, setIsPublic] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessPack, setSaveSuccessPack] = useState<CustomWordPack | null>(null);

  // Import State
  const [importCode, setImportCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [importedPack, setImportedPack] = useState<CustomWordPack | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Saved / Community Packs State
  const [savedPacks, setSavedPacks] = useState<CustomWordPack[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);

  // Feedback State
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const loadSavedPacks = useCallback(async () => {
    setIsLoadingSaved(true);
    try {
      const packs = await wordPackService.getCommunityPacks();
      setSavedPacks(packs);
    } catch (err) {
      console.warn('Failed to load saved packs:', err);
    } finally {
      setIsLoadingSaved(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadSavedPacks();
      setValidationError(null);
      setImportError(null);
    }
  }, [isOpen, loadSavedPacks]);

  // Handle Copy
  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    } catch {
      // ignore clipboard error
    }
  };

  // Pair builder helpers
  const handleAddPair = () => {
    setPairs((prev) => [...prev, { civilian: '', undercover: '' }]);
  };

  const handleRemovePair = (index: number) => {
    if (pairs.length <= 1) return;
    setPairs((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePairChange = (index: number, field: 'civilian' | 'undercover', value: string) => {
    setPairs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Save Custom Pack
  const handleSavePack = async () => {
    setValidationError(null);
    if (!title.trim()) {
      setValidationError('Judul paket kata tidak boleh kosong');
      return;
    }

    const validPairs: WordPair[] = pairs
      .map((p) => ({
        category: category.trim() || 'Kustom',
        civilianWord: p.civilian.trim(),
        undercoverWord: p.undercover.trim(),
      }))
      .filter((p) => p.civilianWord.length > 0 && p.undercoverWord.length > 0);

    if (validPairs.length === 0) {
      setValidationError('Tambahkan minimal 1 pasangan kata rahasia yang valid');
      return;
    }

    setIsSaving(true);
    try {
      const result = await wordPackService.saveCustomPack(
        title.trim(),
        authorName.trim() || 'Anonim',
        validPairs,
        isPublic
      );

      if (result.success) {
        setSaveSuccessPack(result.pack);
        loadSavedPacks();
      }
    } catch (err: any) {
      setValidationError(err?.message || 'Gagal menyimpan paket kata');
    } finally {
      setIsSaving(false);
    }
  };

  // Import Pack by Share Code
  const handleImportPack = async () => {
    setImportError(null);
    setImportedPack(null);

    const clean = importCode.trim().toUpperCase();
    if (!clean || clean.length < 4) {
      setImportError('Masukkan kode share yang valid (minimal 4 karakter)');
      return;
    }

    setIsSearching(true);
    try {
      const pack = await wordPackService.getPackByShareCode(clean);
      if (pack) {
        setImportedPack(pack);
        loadSavedPacks();
      } else {
        setImportError(`Paket dengan kode "${clean}" tidak ditemukan.`);
      }
    } catch (err: any) {
      setImportError(err?.message || 'Gagal mencari paket');
    } finally {
      setIsSearching(false);
    }
  };

  // Delete Pack
  const handleDeletePack = (e: React.MouseEvent, packId: string) => {
    e.stopPropagation();
    wordPackService.deleteLocalCustomPack(packId);
    setSavedPacks((prev) => prev.filter((p) => p.id !== packId));
  };

  const handleSelectAndClose = (pack: CustomWordPack) => {
    if (onSelectPack) {
      onSelectPack(pack);
    } else if (onSelectWordPair && pack.wordPairs.length > 0) {
      const randomPair = pack.wordPairs[Math.floor(Math.random() * pack.wordPairs.length)];
      onSelectWordPair(randomPair);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span className="font-black text-lg sm:text-xl font-display bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
            Paket Kata Kustom
          </span>
        </div>
      }
      subtitle="Buat, bagikan, dan impor kata rahasia unik bersama temanmu"
    >
      <div className="space-y-5">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => {
              setActiveTab('CREATE');
              setSaveSuccessPack(null);
            }}
            className={cn(
              'flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all',
              activeTab === 'CREATE'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            )}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="truncate">Buat Baru</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('IMPORT')}
            className={cn(
              'flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all',
              activeTab === 'IMPORT'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            )}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="truncate">Impor Kode</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SAVED')}
            className={cn(
              'flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all',
              activeTab === 'SAVED'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            )}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="truncate">Koleksi ({savedPacks.length})</span>
          </button>
        </div>

        {/* Tab 1: CREATE PACK */}
        {activeTab === 'CREATE' && (
          <div className="space-y-4">
            {saveSuccessPack ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4"
              >
                <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-emerald-300 font-display">
                    Paket Berhasil Dibuat & Disimpan!
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Bagikan kode share berikut ke temanmu untuk memainkan paket kata ini:
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 p-3 bg-slate-950/80 rounded-xl border border-white/10 max-w-xs mx-auto">
                  <span className="font-mono text-xl font-black text-cyan-300 tracking-widest">
                    {saveSuccessPack.shareCode}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyCode(saveSuccessPack.shareCode)}
                    leftIcon={
                      copiedCode === saveSuccessPack.shareCode ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )
                    }
                  >
                    {copiedCode === saveSuccessPack.shareCode ? 'Tersalin' : 'Salin'}
                  </Button>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSelectAndClose(saveSuccessPack)}
                  >
                    Gunakan Paket Ini Sekarang
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSaveSuccessPack(null);
                      setTitle('');
                      setPairs([
                        { civilian: '', undercover: '' },
                        { civilian: '', undercover: '' },
                        { civilian: '', undercover: '' },
                      ]);
                    }}
                  >
                    Buat Paket Lain
                  </Button>
                </div>
              </motion.div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Judul Paket</label>
                    <input
                      type="text"
                      placeholder="e.g. Kantor & Rekan Kerja"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={30}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-white/10 text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Nama Pembuat / Author</label>
                    <input
                      type="text"
                      placeholder="e.g. Agent007"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      maxLength={20}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-white/10 text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Label Kategori</label>
                  <input
                    type="text"
                    placeholder="e.g. Keseharian, Film, Teknologi"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    maxLength={20}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-white/10 text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  />
                </div>

                {/* Word Pairs Builder */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      Pasangan Kata Rahasia ({pairs.length} pasang)
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Warga vs Undercover (Mirip tapi beda)
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {pairs.map((pair, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/50 border border-white/5"
                      >
                        <span className="text-[11px] font-mono font-bold text-slate-500 w-5 text-center">
                          #{index + 1}
                        </span>
                        <input
                          type="text"
                          placeholder="Kata Warga (e.g. Kopi)"
                          value={pair.civilian}
                          onChange={(e) => handlePairChange(index, 'civilian', e.target.value)}
                          maxLength={25}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/20 text-cyan-200 placeholder:text-slate-600 text-xs focus:outline-none focus:border-cyan-400"
                        />
                        <span className="text-slate-600 text-xs font-bold">vs</span>
                        <input
                          type="text"
                          placeholder="Kata Undercover (e.g. Teh)"
                          value={pair.undercover}
                          onChange={(e) => handlePairChange(index, 'undercover', e.target.value)}
                          maxLength={25}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-rose-500/20 text-rose-200 placeholder:text-slate-600 text-xs focus:outline-none focus:border-rose-400"
                        />
                        {pairs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePair(index)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                            title="Hapus baris ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddPair}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    className="w-full text-xs font-semibold py-2 border-dashed border-white/20"
                  >
                    Tambah Pasangan Kata
                  </Button>
                </div>

                {validationError && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{validationError}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="rounded border-white/20 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span>Bisa dicari oleh publik via Share Code</span>
                  </label>

                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    isLoading={isSaving}
                    onClick={handleSavePack}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Simpan & Dapatkan Kode
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 2: IMPORT BY SHARE CODE */}
        {activeTab === 'IMPORT' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Masukkan Kode Share (6 Karakter)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 8K29PX"
                  value={importCode}
                  onChange={(e) => setImportCode(e.target.value.toUpperCase())}
                  maxLength={10}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-cyan-300 font-mono text-base tracking-widest placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
                <Button
                  variant="primary"
                  size="md"
                  isLoading={isSearching}
                  onClick={handleImportPack}
                  leftIcon={<Search className="w-4 h-4" />}
                >
                  Cari
                </Button>
              </div>
            </div>

            {importError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{importError}</span>
              </div>
            )}

            {importedPack && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-slate-950/60 border border-cyan-500/30 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-bold text-cyan-300 font-display">
                      {importedPack.title}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Oleh: <span className="text-slate-200">{importedPack.authorName}</span> &bull;{' '}
                      <span className="font-mono text-cyan-400">{importedPack.shareCode}</span>
                    </p>
                  </div>
                  <Badge variant="cyan" size="sm">
                    {importedPack.wordPairs.length} Kata
                  </Badge>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1.5">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">
                    Contoh Pasangan Kata:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {importedPack.wordPairs.slice(0, 4).map((p, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-slate-300 font-mono"
                      >
                        {p.civilianWord} / {p.undercoverWord}
                      </span>
                    ))}
                    {importedPack.wordPairs.length > 4 && (
                      <span className="text-xs text-slate-500 self-center">
                        +{importedPack.wordPairs.length - 4} lainnya
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSelectAndClose(importedPack)}
                  >
                    Gunakan Paket Ini
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Tab 3: SAVED PACKS */}
        {activeTab === 'SAVED' && (
          <div className="space-y-3">
            {isLoadingSaved ? (
              <div className="text-center py-8 text-slate-500 text-xs animate-pulse">
                Memuat koleksi paket kata...
              </div>
            ) : savedPacks.length === 0 ? (
              <div className="text-center py-8 text-slate-500 space-y-2">
                <BookOpen className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs">Belum ada paket kustom yang tersimpan.</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveTab('CREATE')}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Buat Paket Pertamamu
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {savedPacks.map((pack) => (
                  <div
                    key={pack.id || pack.shareCode}
                    onClick={() => handleSelectAndClose(pack)}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/10 hover:border-cyan-500/40 hover:bg-slate-900/80 transition-all cursor-pointer group"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                          {pack.title}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {pack.shareCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Oleh: {pack.authorName} &bull; {pack.wordPairs.length} pasangan kata
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyCode(pack.shareCode);
                        }}
                        className="h-7 w-7 text-slate-400 hover:text-cyan-400"
                        title="Salin Kode Share"
                      >
                        {copiedCode === pack.shareCode ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDeletePack(e, pack.id)}
                        className="h-7 w-7 text-slate-500 hover:text-rose-400"
                        title="Hapus dari lokal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CustomWordPackModal;
