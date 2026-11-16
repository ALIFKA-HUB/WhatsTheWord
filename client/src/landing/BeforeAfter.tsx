import React from 'react';
import { BEFORE_AFTER } from './content';

export const BeforeAfter: React.FC = () => {
  return (
    <section className="lp-screen lp-before-after" aria-label="Perbandingan cara main">
      <div className="lp-container">
        <div className="max-w-2xl mb-8 sm:mb-12">
          <h2 className="lp-head text-ink text-2xl sm:text-3xl md:text-4xl mb-3">
            {BEFORE_AFTER.head}
          </h2>
          <p className="text-base sm:text-lg text-ink-2">
            Cara lama vs cara baru bermain tebak penyamar bersama teman tongkrongan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* Card 1: Dulu (Kertas Sobekan) */}
          <div className="lp-plate p-6 sm:p-8 flex flex-col justify-between bg-paper-2 border-rule border-dashed">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-ink-muted">
                  {BEFORE_AFTER.before.label}
                </span>
                <span className="text-xs lp-code text-ink-muted px-2 py-0.5 border border-rule rounded">
                  cara lama
                </span>
              </div>
              <p className="text-base sm:text-lg text-ink-2 leading-relaxed mb-6">
                {BEFORE_AFTER.before.desc}
              </p>

              {/* Visual simulated scrap paper notes */}
              <div className="p-4 bg-paper border border-rule rounded-lg space-y-2.5 text-xs sm:text-sm text-ink-muted lp-code">
                <div className="flex items-center gap-2">
                  <span className="text-accent font-bold">✕</span>
                  <span className="line-through">kertas sobek mudah berantakan</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-accent font-bold">✕</span>
                  <span className="line-through">tulisan tangan tembus dari belakang</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-accent font-bold">✕</span>
                  <span className="line-through">1 teman harus mengalah jadi wasit</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-rule text-xs text-ink-muted lp-code">
              butuh pena, gunting, dan tempat khusus
            </div>
          </div>

          {/* Card 2: Sekarang (Satu Meja Digital) */}
          <div className="lp-plate p-6 sm:p-8 flex flex-col justify-between bg-paper-3/20 border-2 border-ink">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-ink">
                  {BEFORE_AFTER.after.label}
                </span>
                <span className="lp-badge-mint">
                  What’s The Word
                </span>
              </div>
              <p className="text-base sm:text-lg text-ink leading-relaxed mb-6">
                {BEFORE_AFTER.after.desc}
              </p>

              {/* Status pills */}
              <div className="p-4 bg-paper-2 border border-ink/20 rounded-lg space-y-2.5 text-xs sm:text-sm text-ink lp-code">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-mint" />
                  <span>semua orang bisa ikut bermain penuh</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-mint" />
                  <span>kata rahasia terenkripsi otomatis di layar</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <span>penyamar diacak sistem tanpa ada yang tahu</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-rule flex items-center justify-between text-xs text-ink-muted lp-code">
              <span>cukup buka browser di satu hp</span>
              <span className="text-ink font-semibold">100% gratis</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BeforeAfter;
