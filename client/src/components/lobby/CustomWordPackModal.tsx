import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash, Check, WarningCircle } from '@phosphor-icons/react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
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
        <div className="flex items-center gap-2.5">
          <span className="font-condensed text-xl text-ink">
            Paket Kata Kustom
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-teal-light text-teal-dark border border-teal text-xs font-bold">
            Koleksi
          </span>
        </div>
      }
      subtitle="Kelola kata rahasia buatanmu, bagikan kode 6 karakter, atau gunakan paket komunitas"
    >
      <div className="space-y-5">
        {/* Navigation Tabs - Clean Segmented Switcher */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-paper-muted rounded-xl border border-rule">
          <button
            type="button"
            onClick={() => {
              setActiveTab('CREATE');
              setSaveSuccessPack(null);
            }}
            className={cn(
              'py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-colors text-center',
              activeTab === 'CREATE'
                ? 'bg-cardstock text-ink border border-rule shadow-print-sm font-bold'
                : 'text-ink-muted hover:text-ink'
            )}
          >
            Buat Paket
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('IMPORT')}
            className={cn(
              'py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-colors text-center',
              activeTab === 'IMPORT'
                ? 'bg-cardstock text-ink border border-rule shadow-print-sm font-bold'
                : 'text-ink-muted hover:text-ink'
            )}
          >
            Impor Kode
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SAVED')}
            className={cn(
              'py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-colors text-center',
              activeTab === 'SAVED'
                ? 'bg-cardstock text-ink border border-rule shadow-print-sm font-bold'
                : 'text-ink-muted hover:text-ink'
            )}
          >
            Koleksi ({savedPacks.length})
          </button>
        </div>

        {/* Tab 1: CREATE PACK */}
        {activeTab === 'CREATE' && (
          <div className="space-y-4">
            {saveSuccessPack ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl bg-cardstock border border-rule text-center space-y-4 shadow-print"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-light text-teal-dark border border-teal text-xs font-bold">
                  <Check className="w-3.5 h-3.5 stroke-[3]" /> Paket Siap Dimainkan
                </div>

                <div>
                  <h3 className="text-lg font-bold text-ink font-display">
                    {saveSuccessPack.title}
                  </h3>
                  <p className="text-xs text-ink-muted mt-1">
                    Bagikan kode 6 karakter berikut ke temanmu:
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 p-4 bg-paper rounded-xl border border-rule max-w-sm mx-auto">
                  <span className="font-mono text-2xl font-black text-ink tracking-[0.25em]">
                    {saveSuccessPack.shareCode}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopyCode(saveSuccessPack.shareCode)}
                  >
                    {copiedCode === saveSuccessPack.shareCode ? 'Tersalin' : 'Salin Kode'}
                  </Button>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => handleSelectAndClose(saveSuccessPack)}
                  >
                    Gunakan Paket Ini Sekarang
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
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
                    <label className="text-xs font-semibold text-ink">Judul Paket</label>
                    <input
                      type="text"
                      placeholder="Contoh: Kantor & Rekan Kerja"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={30}
                      className="w-full px-3.5 py-2 rounded-xl bg-cardstock border border-rule text-ink placeholder:text-ink-faint text-sm focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink">Nama Pembuat</label>
                    <input
                      type="text"
                      placeholder="Contoh: DetektifKucing"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      maxLength={20}
                      className="w-full px-3.5 py-2 rounded-xl bg-cardstock border border-rule text-ink placeholder:text-ink-faint text-sm focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">Kategori</label>
                  <input
                    type="text"
                    placeholder="Contoh: Makanan, Kantor, Film"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    maxLength={20}
                    className="w-full px-3.5 py-2 rounded-xl bg-cardstock border border-rule text-ink placeholder:text-ink-faint text-sm focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal"
                  />
                </div>

                {/* Word Pairs Ruled Ledger */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-rule">
                    <span className="text-xs font-semibold text-ink">
                      Daftar Pasangan Kata ({pairs.length} pasang)
                    </span>
                    <span className="text-xs text-ink-muted">
                      Warga vs Penyamar (mirip tapi beda)
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {pairs.map((pair, index) => (
                      <div
                        key={index}
                        className="p-2 sm:p-2.5 rounded-xl bg-paper border border-rule space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-2.5"
                      >
                        <div className="flex items-center justify-between sm:justify-start gap-2">
                          <span className="text-xs font-mono font-bold text-ink-muted w-6 text-center shrink-0">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          {pairs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePair(index)}
                              className="sm:hidden p-1.5 text-ink-muted hover:text-stamp-dark rounded-lg hover:bg-stamp-light transition-colors shrink-0 touch-manipulation"
                              title="Hapus baris ini"
                              aria-label={`Hapus pasangan kata ${index + 1}`}
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 min-w-0">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-semibold text-ink-muted sm:hidden">Kata Warga</span>
                            <input
                              type="text"
                              placeholder="Kata Warga (mis. Kopi)"
                              value={pair.civilian}
                              onChange={(e) => handlePairChange(index, 'civilian', e.target.value)}
                              maxLength={25}
                              className="w-full px-3 py-2 sm:py-1.5 rounded-lg bg-cardstock border border-rule text-ink placeholder:text-ink-faint text-xs focus:outline-none focus:border-teal"
                            />
                          </div>

                          <div className="space-y-0.5">
                            <span className="text-[10px] font-semibold text-stamp-dark sm:hidden">Kata Penyamar</span>
                            <input
                              type="text"
                              placeholder="Kata Penyamar (mis. Teh)"
                              value={pair.undercover}
                              onChange={(e) => handlePairChange(index, 'undercover', e.target.value)}
                              maxLength={25}
                              className="w-full px-3 py-2 sm:py-1.5 rounded-lg bg-cardstock border border-rule text-stamp-dark placeholder:text-ink-faint text-xs focus:outline-none focus:border-stamp"
                            />
                          </div>
                        </div>

                        {pairs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePair(index)}
                            className="hidden sm:inline-flex p-1.5 text-ink-muted hover:text-stamp-dark rounded-lg hover:bg-stamp-light transition-colors shrink-0 touch-manipulation"
                            title="Hapus baris ini"
                            aria-label={`Hapus pasangan kata ${index + 1}`}
                          >
                            <Trash className="w-4 h-4" />
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
                    className="w-full text-xs font-semibold py-2"
                  >
                    Tambah Pasangan Kata
                  </Button>
                </div>

                {validationError && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stamp-light border border-stamp text-stamp-dark text-xs">
                    <WarningCircle className="w-4 h-4 shrink-0 text-stamp-dark" />
                    <span>{validationError}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-rule">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-ink-muted select-none">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="w-4 h-4 rounded border-rule accent-teal-dark cursor-pointer"
                    />
                    <span>Dapat dicari orang lain melalui kode share</span>
                  </label>

                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    isLoading={isSaving}
                    onClick={handleSavePack}
                  >
                    Simpan dan Buat Kode
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
              <label className="text-xs font-semibold text-ink">
                Masukkan Kode Share (6 Karakter)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="MISAL: 8K29PX"
                  value={importCode}
                  onChange={(e) => setImportCode(e.target.value.toUpperCase())}
                  maxLength={10}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-cardstock border border-rule text-ink font-mono text-base tracking-widest placeholder:text-ink-faint focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal"
                />
                <Button
                  variant="primary"
                  size="md"
                  isLoading={isSearching}
                  onClick={handleImportPack}
                >
                  Cari Paket
                </Button>
              </div>
            </div>

            {importError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-stamp-light border border-stamp text-stamp-dark text-xs">
                <WarningCircle className="w-4 h-4 shrink-0 text-stamp-dark" />
                <span>{importError}</span>
              </div>
            )}

            {importedPack && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-cardstock border border-rule space-y-3 shadow-print-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-bold text-ink font-display">
                      {importedPack.title}
                    </h4>
                    <p className="text-xs text-ink-muted mt-0.5">
                      Pembuat: <span className="text-ink font-medium">{importedPack.authorName}</span>, kode{' '}
                      <span className="font-mono text-teal-dark font-bold">{importedPack.shareCode}</span>
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-light text-teal-dark border border-teal text-xs font-bold shrink-0">
                    {importedPack.wordPairs.length} Pasang
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-paper border border-rule space-y-2">
                  <span className="text-xs font-semibold text-ink-muted block">
                    Contoh pasangan kata:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {importedPack.wordPairs.slice(0, 4).map((p, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-full bg-cardstock border border-rule text-ink font-medium"
                      >
                        {p.civilianWord} / {p.undercoverWord}
                      </span>
                    ))}
                    {importedPack.wordPairs.length > 4 && (
                      <span className="text-xs text-ink-muted self-center font-medium">
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
              <div className="text-center py-8 text-ink-muted text-xs animate-pulse">
                Memuat koleksi paket kata…
              </div>
            ) : savedPacks.length === 0 ? (
              <div className="text-center py-8 text-ink-muted space-y-3">
                <p className="text-xs">Belum ada paket kustom yang tersimpan.</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveTab('CREATE')}
                >
                  Buat Paket Pertamamu
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {savedPacks.map((pack) => (
                  <div
                    key={pack.id || pack.shareCode}
                    className="p-3.5 rounded-2xl bg-cardstock border border-rule hover:border-teal transition-colors shadow-print-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-ink truncate">
                          {pack.title}
                        </span>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-teal-light text-teal-dark border border-teal shrink-0">
                          {pack.shareCode}
                        </span>
                      </div>
                      <p className="text-xs text-ink-muted truncate">
                        {pack.authorName} &bull; {pack.wordPairs.length} pasangan kata
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0 border-t border-rule sm:border-t-0">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSelectAndClose(pack)}
                        className="flex-1 sm:flex-initial"
                      >
                        Pilih
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyCode(pack.shareCode);
                        }}
                        title="Salin Kode Share"
                        className="flex-1 sm:flex-initial"
                      >
                        {copiedCode === pack.shareCode ? 'Tersalin' : 'Salin'}
                      </Button>
                      <button
                        type="button"
                        onClick={(e) => handleDeletePack(e, pack.id)}
                        className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center text-ink-muted hover:text-stamp-dark rounded-full hover:bg-stamp-light border border-rule transition-colors shrink-0 touch-manipulation"
                        title="Hapus dari penyimpanan"
                        aria-label={`Hapus paket ${pack.title}`}
                      >
                        <Trash className="w-4 h-4" />
                      </button>
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
