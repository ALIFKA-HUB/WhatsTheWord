import React from 'react';

export interface LandingFooterProps {
  onPlayLocal: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ onPlayLocal }) => {
  return (
    <footer className="lp-footer border-t border-rule py-14 sm:py-16" aria-label="Footer">
      <div className="lp-container">
        <div className="max-w-xl">
          <p className="text-base sm:text-lg text-ink-muted leading-relaxed mb-4">
            Dibuat untuk malam main bareng teman. Kalau ada kata yang terlalu gampang, buat paketmu sendiri.
          </p>
          <div className="font-display font-bold text-ink text-base sm:text-lg mb-8">
            Tim What’s The Word
          </div>
          <nav className="flex flex-wrap items-center gap-6 text-sm text-ink-muted" aria-label="Tautan footer">
            <button
              type="button"
              onClick={onPlayLocal}
              className="hover:text-ink text-left transition-colors cursor-pointer underline underline-offset-4"
            >
              Main di satu HP
            </button>
            <a
              href="#mekanisme"
              className="hover:text-ink transition-colors underline underline-offset-4"
            >
              Mekanisme
            </a>
            <a
              href="#ronde"
              className="hover:text-ink transition-colors underline underline-offset-4"
            >
              Cara main
            </a>
            <a
              href="#mode"
              className="hover:text-ink transition-colors underline underline-offset-4"
            >
              Mode
            </a>
            <a
              href="#paket"
              className="hover:text-ink transition-colors underline underline-offset-4"
            >
              Paket kata
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
