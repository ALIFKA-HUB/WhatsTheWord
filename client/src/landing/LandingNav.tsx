import React, { useEffect, useState } from 'react';

export interface LandingNavProps {
  onPlayLocal: () => void;
  onPlayOnline?: () => void;
}

export const LandingNav: React.FC<LandingNavProps> = ({ onPlayLocal }) => {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('[data-landing-section]');
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );

    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="lp-nav sticky top-0 z-40 bg-paper/95 backdrop-blur-sm border-b border-rule">
      <div className="lp-container flex items-center justify-between h-14 sm:h-18">
        <a
          href="/"
          className="font-display font-bold text-lg sm:text-2xl text-ink tracking-tight no-underline hover:text-ink-2 flex items-center gap-2"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-mint shrink-0" />
          <span>What’s The Word</span>
        </a>
        <nav className="flex items-center gap-4 sm:gap-8" aria-label="Navigasi halaman">
          <a
            href="#ronde"
            className={`lp-nav-link text-xs sm:text-sm ${activeSection === 'ronde' ? 'is-active' : ''}`}
          >
            Cara main
          </a>
          <a
            href="#mode"
            className={`lp-nav-link text-xs sm:text-sm ${activeSection === 'mode' ? 'is-active' : ''}`}
          >
            Mode
          </a>
        </nav>
        <button
          type="button"
          onClick={onPlayLocal}
          className="lp-btn lp-btn--primary min-h-[38px] sm:min-h-[42px] px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm"
        >
          Main sekarang
        </button>
      </div>
    </header>
  );
};

export default LandingNav;
