import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export interface LandingNavProps {
  onPlayLocal: () => void;
  onPlayOnline?: () => void;
}

const NAV_ITEMS = [
  { id: 'mekanisme', label: 'Mekanisme' },
  { id: 'ronde', label: 'Cara main' },
  { id: 'mode', label: 'Mode' },
  { id: 'paket', label: 'Paket kata' },
] as const;

export const LandingNav: React.FC<LandingNavProps> = ({ onPlayLocal }) => {
  const [activeSection, setActiveSection] = useState<string>('');
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>('.lp-hero');
    const sections = document.querySelectorAll<HTMLElement>('[data-landing-section]');
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (entry.target === hero) {
            setActiveSection('');
          } else if (entry.target.id) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );

    if (hero) observer.observe(hero);
    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    setActiveSection(id);
    target.scrollIntoView({
      behavior: shouldReduce ? 'auto' : 'smooth',
      block: 'start',
    });
    window.history.replaceState(null, '', `#${id}`);
  };

  const handleBrandClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      setActiveSection('');
      window.scrollTo({
        top: 0,
        behavior: shouldReduce ? 'auto' : 'smooth',
      });
      if (window.location.hash) {
        window.history.replaceState(null, '', '/');
      }
    }
  };

  const indicatorTransition = shouldReduce
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 420, damping: 32 };

  return (
    <header className="lp-nav">
      <div className="lp-container flex items-center justify-between h-16 sm:h-[72px] gap-4">
        <a
          href="/"
          onClick={handleBrandClick}
          className="font-display font-bold text-lg sm:text-xl text-ink tracking-tight no-underline hover:text-ink-muted flex items-center gap-2.5 shrink-0"
        >
          <img
            src="/favicon.svg"
            alt=""
            width={28}
            height={28}
            className="w-7 h-7 rounded-lg shrink-0"
          />
          <span>What’s The Word</span>
        </a>

        <nav
          className="hidden md:flex items-center gap-1"
          aria-label="Navigasi halaman"
          onMouseLeave={() => setHoveredSection(null)}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            const isHovered = hoveredSection === item.id;

            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                onMouseEnter={() => setHoveredSection(item.id)}
                onFocus={() => setHoveredSection(item.id)}
                onBlur={() => setHoveredSection(null)}
                aria-current={isActive ? 'location' : undefined}
                className={`lp-nav-link ${isActive ? 'is-active' : ''}`}
              >
                {isHovered && (
                  <motion.span
                    layoutId="lp-nav-hover-pill"
                    transition={indicatorTransition}
                    className="lp-nav-hover-pill"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10">{item.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="lp-nav-active-bar"
                    transition={indicatorTransition}
                    className="lp-nav-active-bar"
                    aria-hidden="true"
                  />
                )}
              </a>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={onPlayLocal}
          className="lp-btn lp-btn--nav shrink-0"
        >
          Main di satu HP
        </button>
      </div>
    </header>
  );
};

export default LandingNav;
