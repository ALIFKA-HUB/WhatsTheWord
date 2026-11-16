import React, { useState } from 'react';
import { SAMPLE_PAIRS, PAIR_COUNT, CATEGORY_COUNT } from './content';

export interface WordPackTableProps {
  onPlayOnline: () => void;
}

export const WordPackTable: React.FC<WordPackTableProps> = ({ onPlayOnline }) => {
  const [hideUndercover, setHideUndercover] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const categories = ['Semua', ...Array.from(new Set(SAMPLE_PAIRS.map((p) => p.category)))];

  const filteredPairs = selectedCategory === 'Semua'
    ? SAMPLE_PAIRS
    : SAMPLE_PAIRS.filter((p) => p.category === selectedCategory);

  return (
    <section className="lp-screen lp-word-pack" aria-label="Paket kata bawaan">
      <div className="lp-container">
        {/* Ink band banner with big number */}
        <div className="lp-band--ink p-6 sm:p-12 mb-8 rounded-2xl border-2 border-ink flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 shadow-card">
          <div className="flex items-baseline gap-3">
            <span className="font-display font-bold text-5xl sm:text-6xl md:text-7xl text-paper leading-none">
              {PAIR_COUNT}
            </span>
            <span className="font-display font-bold text-xl sm:text-2xl text-paper">
              pasangan kata bawaan
            </span>
          </div>
          <div className="text-sm sm:text-base text-paper opacity-90 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-mint" />
            <span>Tersebar di {CATEGORY_COUNT} kategori pilihan bahasa Indonesia</span>
          </div>
        </div>

        {/* Interactive Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          {/* Category filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-ink text-paper'
                    : 'bg-paper-2 text-ink border border-rule hover:border-ink'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Spoiler toggle pill */}
          <button
            type="button"
            onClick={() => setHideUndercover((prev) => !prev)}
            className="lp-btn lp-btn--secondary py-1.5 px-3 text-xs min-h-[36px] flex items-center gap-2 shrink-0"
          >
            <span className={`w-2 h-2 rounded-full ${hideUndercover ? 'bg-accent' : 'bg-mint'}`} />
            <span>{hideUndercover ? 'Buka kata penyamar' : 'Sembunyikan kata penyamar'}</span>
          </button>
        </div>

        {/* Spec table */}
        <div className="lp-tabletop-mat p-2 sm:p-4 border-2 border-ink overflow-x-auto shadow-card">
          <table className="lp-spec-table" aria-label="Contoh pasangan kata">
            <thead>
              <tr>
                <th scope="col">Kode</th>
                <th scope="col">Kata warga</th>
                <th scope="col">
                  <span className="flex items-center gap-2">
                    Kata penyamar
                    {hideUndercover && (
                      <span className="text-[10px] lp-badge-accent px-1.5 py-0">tertutup</span>
                    )}
                  </span>
                </th>
                <th scope="col">Kategori</th>
              </tr>
            </thead>
            <tbody>
              {filteredPairs.map((pair) => (
                <tr key={pair.id}>
                  <td className="lp-code text-xs text-ink-muted">{pair.id}</td>
                  <td className="font-semibold text-ink">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-mint" />
                      {pair.civilianWord}
                    </span>
                  </td>
                  <td className="text-ink-2 font-medium">
                    {hideUndercover ? (
                      <span className="lp-code text-ink-muted select-none">••••••••</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                        {pair.undercoverWord}
                      </span>
                    )}
                  </td>
                  <td className="text-ink-muted text-sm">{pair.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Callout below table */}
        <div className="mt-8 text-left">
          <a
            href="#mode"
            onClick={(e) => {
              e.preventDefault();
              onPlayOnline();
            }}
            className="text-sm sm:text-base font-semibold text-ink underline underline-offset-4 hover:text-ink-2 transition-colors inline-block"
          >
            Punya kata sendiri? Buat paket kustom dan bagikan kodenya.
          </a>
        </div>
      </div>
    </section>
  );
};

export default WordPackTable;
