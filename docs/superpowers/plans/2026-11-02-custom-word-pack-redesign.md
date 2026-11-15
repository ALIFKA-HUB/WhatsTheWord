# Custom Word Pack Modal Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `CustomWordPackModal.tsx` to eliminate AI-slop elements (sparkle icons, cluttered icon buttons, card-in-a-card nesting, generic Tailwind color leaks) and replace them with a tactile, editorial boardgame index-card aesthetic conforming to Hallmark standards.

**Architecture:** Refactor `CustomWordPackModal.tsx` into clean, human-designed sub-layouts (Ruled Word Pair Ledger, Physical Specimen Cards, Perforated Voucher Share Card) while preserving 100% of the existing props, state machine, and service integration (`wordPackService`). Add anti-slop regression tests to `AntiSlopPreFlight.test.ts`.

**Tech Stack:** React 18, TypeScript, Tailwind CSS 3.4 (with semantic design tokens: `paper`, `cardstock`, `ink`, `teal`, `stamp`, `rule`), Framer Motion (`motion/react`), Phosphor Icons (`@phosphor-icons/react` without AI sparkle/gimmick icons), Vitest.

## Global Constraints

- **Zero AI Sparkles / Generic Icons:** Remove all `Sparkle` icons and redundant button/tab icons.
- **Zero Card-Inside-A-Card Nesting:** Replace nested card boxes with clean ruled tables/ledgers conforming to Hallmark Floor Rule 11.
- **Zero Untracked Custom Colors / Leaks:** Remove all stray Tailwind default palette classes (`text-stamp-500`, `focus:ring-cyan-500`, `Badge variant="cyan"`). All surfaces and borders must use declared project tokens (`bg-cardstock`, `bg-paper`, `border-rule`, `text-ink`, `text-stamp-dark`, `text-teal-dark`, `bg-teal-light`, `bg-stamp-light`).
- **Preserve 100% Component API and Event Handlers:** Retain `CustomWordPackModalProps` (`isOpen`, `onClose`, `onSelectPack`, `onSelectWordPair`), `wordPackService` integration, copy-to-clipboard, deletion, public toggle, and pair mutation handlers without regressing a single gameplay flow.
- **Hallmark Floor & Sloplint:** Must score `0 FAIL, 0 REFLEX, 0 WARN` on `sloplint.mjs client/src --genre playful --scope app --kept`.
- **All 16+ Vitest Tests Pass:** All preflight and flow tests must pass.

---

### Task 1: Add Anti-Slop Regression Tests for Custom Word Pack Modal

**Files:**
- Modify: `client/src/tests/AntiSlopPreFlight.test.ts`

**Interfaces:**
- Consumes: `client/src/components/lobby/CustomWordPackModal.tsx`
- Produces: Vitest test assertions ensuring zero `Sparkle` imports, zero `cyan-500`/`stamp-500` leaks, and proper ledger structure.

- [ ] **Step 1: Write the failing tests in `client/src/tests/AntiSlopPreFlight.test.ts`**

Add tests checking that:
1. `CustomWordPackModal.tsx` contains no `Sparkle` imports or usage.
2. `CustomWordPackModal.tsx` contains no `cyan-` or `stamp-500` color leaks.

```ts
  it('guarantees CustomWordPackModal has zero AI sparkle icons and zero color token leaks', () => {
    const modalPath = path.join(srcDir, 'components', 'lobby', 'CustomWordPackModal.tsx');
    const content = fs.readFileSync(modalPath, 'utf-8');
    expect(content).not.toContain('Sparkle');
    expect(content).not.toContain('cyan-');
    expect(content).not.toContain('stamp-500');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --workspace=client -t "CustomWordPackModal"`
Expected: FAIL (contains 'Sparkle', 'cyan-500', 'stamp-500')

- [ ] **Step 3: Commit the failing test baseline**

```bash
git add client/src/tests/AntiSlopPreFlight.test.ts
git commit -m "test: add anti-slop regression test for CustomWordPackModal"
```

---

### Task 2: Redesign Navigation Tabs and Modal Header

**Files:**
- Modify: `client/src/components/lobby/CustomWordPackModal.tsx`

**Interfaces:**
- Consumes: `Modal`, `CustomWordPackModalProps`
- Produces: Clean typographic header ("Paket Kata Kustom" with tactile archival pill) and clean segmented folder tabs without icon clutter.

- [ ] **Step 1: Update icon imports and header layout**

Remove `Sparkle` import from `@phosphor-icons/react`.
Replace modal title with an elegant, non-gimmicky archival title:
```tsx
      title={
        <div className="flex items-center gap-2.5">
          <span className="font-condensed text-xl text-ink">
            Paket Kata Kustom
          </span>
          <span className="px-2 py-0.5 rounded-full bg-teal-light text-teal-dark border border-teal text-xs font-semibold">
            Koleksi
          </span>
        </div>
      }
      subtitle="Kelola kata rahasia buatanmu, bagikan kode 6 digit, atau gunakan paket dari komunitas"
```

- [ ] **Step 2: Redesign segmented tab switcher**

Transform the segmented tabs from icon-cluttered pills to clean, confident typographic folder tabs:
```tsx
        {/* Navigation Tabs */}
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
```

- [ ] **Step 3: Run quick lint/test check**

Run: `node "C:\Users\ASUS\.gemini\config\skills\hallmark\scripts\sloplint.mjs" client/src --genre playful --scope app --kept`
Expected: 0 FAIL

---

### Task 3: Redesign the "Buat Paket" Form (Ruled Ledger & Anti-Slop Form)

**Files:**
- Modify: `client/src/components/lobby/CustomWordPackModal.tsx`

**Interfaces:**
- Consumes: `pairs`, `handleAddPair`, `handleRemovePair`, `handlePairChange`, `handleSavePack`, `isPublic`, `isSaving`
- Produces: Ruled ledger table eliminating nested cards, clean inputs, and custom accessible checkbox without Tailwind color leaks.

- [ ] **Step 1: Clean up metadata inputs (Title, Author, Category)**

Group Title and Author in clean grid with tactile focus states:
```tsx
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
```

- [ ] **Step 2: Replace nested cards with a Ruled Ledger Table**

Eliminate `p-2 rounded-xl bg-paper-muted border border-rule` card-inside-a-card. Instead, build a clean, unified ruled list:
```tsx
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

                  <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                    {pairs.map((pair, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 py-1.5 px-2 rounded-xl bg-paper border border-rule"
                      >
                        <span className="text-xs font-mono font-bold text-ink-muted w-6 text-center shrink-0">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <input
                          type="text"
                          placeholder="Kata Warga (mis. Kopi)"
                          value={pair.civilian}
                          onChange={(e) => handlePairChange(index, 'civilian', e.target.value)}
                          maxLength={25}
                          className="flex-1 min-w-0 px-3 py-1.5 rounded-lg bg-cardstock border border-rule text-ink placeholder:text-ink-faint text-xs focus:outline-none focus:border-teal"
                        />
                        <span className="text-ink-muted text-xs font-bold shrink-0">vs</span>
                        <input
                          type="text"
                          placeholder="Kata Penyamar (mis. Teh)"
                          value={pair.undercover}
                          onChange={(e) => handlePairChange(index, 'undercover', e.target.value)}
                          maxLength={25}
                          className="flex-1 min-w-0 px-3 py-1.5 rounded-lg bg-cardstock border border-rule text-stamp-dark placeholder:text-ink-faint text-xs focus:outline-none focus:border-stamp"
                        />
                        {pairs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePair(index)}
                            className="p-1.5 text-ink-muted hover:text-stamp-dark rounded-lg hover:bg-stamp-light transition-colors shrink-0"
                            title="Hapus baris ini"
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
```

- [ ] **Step 3: Fix public toggle checkbox and actions**

Replace broken Tailwind defaults (`text-stamp-500 focus:ring-cyan-500`):
```tsx
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-rule">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-ink-muted select-none">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="w-4 h-4 rounded border-rule text-teal-dark accent-teal focus:ring-teal"
                    />
                    <span>Dapat dicari orang lain dengan kode share</span>
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
```

- [ ] **Step 4: Redesign Success State as a Perforated Voucher**

Replace generic big green box with a tactile stamped share ticket:
```tsx
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
                    Bagikan kode 6 digit berikut ke temanmu di room:
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
```

---

### Task 4: Redesign "Impor Kode" and "Koleksi" Views

**Files:**
- Modify: `client/src/components/lobby/CustomWordPackModal.tsx`

**Interfaces:**
- Consumes: `importCode`, `importedPack`, `savedPacks`, `handleImportPack`, `handleDeletePack`, `handleSelectAndClose`
- Produces: Polished tactile specimen cards for imported pack and saved collections; removes `Badge variant="cyan"`.

- [ ] **Step 1: Redesign Import Tab**

```tsx
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
```

- [ ] **Step 2: Redesign Saved / Community Packs Tab**

```tsx
        {/* Tab 3: SAVED PACKS */}
        {activeTab === 'SAVED' && (
          <div className="space-y-3">
            {isLoadingSaved ? (
              <div className="text-center py-8 text-ink-muted text-xs animate-pulse">
                Memuat koleksi paket kata...
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
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {savedPacks.map((pack) => (
                  <div
                    key={pack.id || pack.shareCode}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-cardstock border border-rule hover:border-teal transition-colors shadow-print-sm"
                  >
                    <div className="space-y-1 min-w-0 pr-3">
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

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSelectAndClose(pack)}
                      >
                        Pilih
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCopyCode(pack.shareCode)}
                        title="Salin Kode Share"
                      >
                        {copiedCode === pack.shareCode ? 'Tersalin' : 'Salin'}
                      </Button>
                      <button
                        type="button"
                        onClick={(e) => handleDeletePack(e, pack.id)}
                        className="p-2 text-ink-muted hover:text-stamp-dark rounded-lg hover:bg-stamp-light transition-colors"
                        title="Hapus dari penyimpanan"
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
```

---

### Task 5: Verification, Hallmark Sloplint & Commit

**Files:**
- Verify: `client/src/components/lobby/CustomWordPackModal.tsx`
- Verify: `client/src/tests/AntiSlopPreFlight.test.ts`

- [ ] **Step 1: Run sloplint check**

Run: `node "C:\Users\ASUS\.gemini\config\skills\hallmark\scripts\sloplint.mjs" client/src --genre playful --scope app --kept`
Expected: `sloplint: clean. 0 FAIL, 0 REFLEX, 0 WARN`

- [ ] **Step 2: Run all Vitest unit tests**

Run: `npm test --workspace=client`
Expected: 16+ tests pass, including new `CustomWordPackModal` anti-slop regression test.

- [ ] **Step 3: Run TypeScript typecheck**

Run: `npm run typecheck`
Expected: 0 errors.

- [ ] **Step 4: Commit changes**

```bash
git add client/src/components/lobby/CustomWordPackModal.tsx client/src/tests/AntiSlopPreFlight.test.ts docs/superpowers/plans/2026-11-02-custom-word-pack-redesign.md
git commit -m "feat(ui): redesign CustomWordPackModal to eliminate AI slop and adopt tactile boardgame ledger"
```
