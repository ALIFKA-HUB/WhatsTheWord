import React from 'react';
import { SAMPLE_PAIRS, PAIR_COUNT, CATEGORY_COUNT } from './content';

export interface WordPackTableProps {
  onPlayOnline: () => void;
}

export const WordPackTable: React.FC<WordPackTableProps> = ({ onPlayOnline }) => {
  return (
    <section className="lp-screen lp-word-pack" aria-label="Paket kata bawaan">
      <div className="lp-container">
        {/* Ink band banner with big number */}
        <div className="lp-band--ink p-8 sm:p-12 mb-10 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <span className="font-display font-bold text-5xl sm:text-6xl md:text-7xl text-paper leading-none">
              {PAIR_COUNT}
            </span>
            <span className="font-display font-bold text-xl sm:text-2xl text-paper">
              pasangan kata bawaan
            </span>
          </div>
          <div className="text-sm sm:text-base text-paper opacity-90">
            Tersebar di {CATEGORY_COUNT} kategori pilihan
          </div>
        </div>

        {/* Spec table */}
        <div className="overflow-x-auto">
          <table className="lp-spec-table" aria-label="Contoh pasangan kata">
            <thead>
              <tr>
                <th scope="col">Kode</th>
                <th scope="col">Kata warga</th>
                <th scope="col">Kata penyamar</th>
                <th scope="col">Kategori</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_PAIRS.map((pair) => (
                <tr key={pair.id}>
                  <td className="lp-code text-xs text-ink-muted">{pair.id}</td>
                  <td className="font-medium text-ink">{pair.civilianWord}</td>
                  <td className="text-ink-2">{pair.undercoverWord}</td>
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
