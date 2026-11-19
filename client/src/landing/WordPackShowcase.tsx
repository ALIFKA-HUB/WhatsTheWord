import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Eye, EyeSlash, PlusCircle, ShieldCheck, Detective } from '@phosphor-icons/react';
import { SAMPLE_PAIRS, PAIR_COUNT, CATEGORY_COUNT } from './content';

export interface WordPackShowcaseProps {
  onPlayOnline: () => void;
}

export const WordPackShowcase: React.FC<WordPackShowcaseProps> = ({ onPlayOnline }) => {
  const [hideUndercover, setHideUndercover] = useState<boolean>(false);
  const [peekedIds, setPeekedIds] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const shouldReduce = useReducedMotion();

  const categories = ['Semua', ...Array.from(new Set(SAMPLE_PAIRS.map((p) => p.category)))];

  const filteredPairs =
    selectedCategory === 'Semua'
      ? SAMPLE_PAIRS
      : SAMPLE_PAIRS.filter((p) => p.category === selectedCategory);

  const pillTransition = shouldReduce
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 320, damping: 30 };

  const toggleCardPeek = (id: string) => {
    setPeekedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section
      id="paket"
      data-landing-section
      className="lp-screen lp-screen--band lp-word-pack"
      aria-label="Paket kata bawaan"
    >
      <div className="lp-container">
        <div className="max-w-2xl mb-8">
          <h2 className="lp-head text-ink mb-3">
            {PAIR_COUNT} pasangan kata siap main.
          </h2>
          <p className="text-base sm:text-lg text-ink-muted max-w-[60ch]">
            Tersebar di {CATEGORY_COUNT} kategori bahasa Indonesia, atau susun paket katamu sendiri di lobi.
          </p>
        </div>

        {/* Interactive Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div
            className="flex items-center gap-1.5 p-1 rounded-full bg-cardstock border border-rule overflow-x-auto max-w-full no-scrollbar"
            role="group"
            aria-label="Filter kategori kata"
          >
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedCategory(cat)}
                  className={`relative px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    isSelected ? 'text-cardstock' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="pack-filter-pill"
                      transition={pillTransition}
                      className="absolute inset-0 rounded-full bg-teal-dark"
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative z-10">{cat}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              setHideUndercover((prev) => !prev);
              setPeekedIds({});
            }}
            aria-pressed={hideUndercover}
            className="lp-btn lp-btn--secondary min-h-[40px] px-4 py-1.5 text-xs shrink-0"
          >
            {hideUndercover ? (
              <Eye size={15} weight="bold" aria-hidden="true" />
            ) : (
              <EyeSlash size={15} weight="bold" aria-hidden="true" />
            )}
            <span>{hideUndercover ? 'Buka kata penyamar' : 'Sembunyikan kata penyamar'}</span>
          </button>
        </div>

        {/* Filterable Word Pair Dossier Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredPairs.map((pair) => {
            const pairKey = pair.id ?? pair.civilianWord;
            const isMasked = hideUndercover && !peekedIds[pairKey];
            return (
              <motion.button
                key={pairKey}
                type="button"
                layout={!shouldReduce}
                initial={shouldReduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                onClick={() => hideUndercover && toggleCardPeek(pairKey)}
                className="lp-plate p-4 flex flex-col justify-between gap-3 text-left hover:-translate-y-0.5 transition-transform cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2 w-full pb-2 border-b border-rule">
                  <span className="text-xs font-bold text-ink bg-paper-muted px-2.5 py-0.5 rounded-full border border-rule">
                    {pair.category}
                  </span>
                  <span className="lp-code text-xs font-bold text-ink-faint">{pair.id}</span>
                </div>

                <div className="grid grid-cols-1 gap-2 w-full">
                  <div className="p-2.5 rounded-2xl bg-teal-light/40 border border-teal flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-dark">
                      <ShieldCheck size={14} weight="bold" aria-hidden="true" />
                      <span>Warga</span>
                    </span>
                    <span className="font-display font-bold text-base text-ink">
                      {pair.civilianWord}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-stamp-light border border-stamp flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-stamp-dark">
                      <Detective size={14} weight="bold" aria-hidden="true" />
                      <span>Penyamar</span>
                    </span>
                    {isMasked ? (
                      <span className="lp-code text-xs font-bold text-stamp-dark bg-cardstock px-2 py-0.5 rounded-full border border-stamp select-none">
                        Ketuk intip
                      </span>
                    ) : (
                      <span className="font-display font-bold text-base text-stamp-dark">
                        {pair.undercoverWord}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-cardstock border border-rule">
          <p className="text-sm sm:text-base text-ink">
            Punya lelucon tongkrongan sendiri? Buat paket kata custom langsung sebelum mulai room.
          </p>
          <button
            type="button"
            onClick={onPlayOnline}
            className="lp-btn lp-btn--sun min-h-[44px] px-5 text-sm shrink-0"
          >
            <PlusCircle size={17} weight="bold" aria-hidden="true" />
            <span>Buat room online</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default WordPackShowcase;
