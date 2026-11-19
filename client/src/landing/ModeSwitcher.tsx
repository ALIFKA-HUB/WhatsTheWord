import React, { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { DeviceMobile, Globe } from '@phosphor-icons/react';
import { MODES } from './content';

export interface ModeSwitcherProps {
  onPlayLocal: () => void;
  onPlayOnline: () => void;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ onPlayLocal, onPlayOnline }) => {
  const [activeTab, setActiveTab] = useState<'local' | 'online'>('local');
  const localTabRef = useRef<HTMLButtonElement>(null);
  const onlineTabRef = useRef<HTMLButtonElement>(null);
  const shouldReduce = useReducedMotion();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const nextTab = activeTab === 'local' ? 'online' : 'local';
      setActiveTab(nextTab);
      if (nextTab === 'local') {
        localTabRef.current?.focus();
      } else {
        onlineTabRef.current?.focus();
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveTab('local');
      localTabRef.current?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveTab('online');
      onlineTabRef.current?.focus();
    }
  };

  const isLocal = activeTab === 'local';
  const currentTab = MODES.tabs[isLocal ? 0 : 1]!;
  const pillTransition = shouldReduce
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 320, damping: 30 };

  return (
    <section
      id="mode"
      data-landing-section
      className="lp-screen lp-mode"
      aria-label="Mode permainan"
    >
      <div className="lp-container">
        <div className="max-w-2xl mb-8 sm:mb-10">
          <h2 className="lp-head text-ink mb-3">
            {MODES.head}
          </h2>
          <p className="text-base sm:text-lg text-ink-muted max-w-[60ch]">
            Main bareng di meja yang sama atau dari jarak jauh lewat room online.
          </p>
        </div>

        {/* Sliding Segmented Control (inspired by Jiro.build) */}
        <div
          role="tablist"
          aria-label="Pilih mode permainan"
          className="inline-flex p-1.5 rounded-full bg-paper-muted border border-rule mb-8 gap-1"
        >
          <button
            ref={localTabRef}
            id="tab-local"
            role="tab"
            type="button"
            aria-selected={isLocal}
            aria-controls="panel-mode"
            tabIndex={isLocal ? 0 : -1}
            onClick={() => setActiveTab('local')}
            onKeyDown={handleKeyDown}
            className={`relative px-5 py-2.5 rounded-full text-sm font-bold transition-colors cursor-pointer inline-flex items-center gap-2 ${
              isLocal ? 'text-cardstock' : 'text-ink'
            }`}
          >
            {isLocal && (
              <motion.span
                layoutId="mode-tab-pill"
                transition={pillTransition}
                className="absolute inset-0 rounded-full bg-teal-dark shadow-push-teal"
                aria-hidden="true"
              />
            )}
            <DeviceMobile size={16} weight="bold" className="relative z-10" aria-hidden="true" />
            <span className="relative z-10">{MODES.tabs[0]!.title}</span>
          </button>

          <button
            ref={onlineTabRef}
            id="tab-online"
            role="tab"
            type="button"
            aria-selected={!isLocal}
            aria-controls="panel-mode"
            tabIndex={!isLocal ? 0 : -1}
            onClick={() => setActiveTab('online')}
            onKeyDown={handleKeyDown}
            className={`relative px-5 py-2.5 rounded-full text-sm font-bold transition-colors cursor-pointer inline-flex items-center gap-2 ${
              !isLocal ? 'text-ink' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {!isLocal && (
              <motion.span
                layoutId="mode-tab-pill"
                transition={pillTransition}
                className="absolute inset-0 rounded-full bg-sun border border-sun-dark"
                aria-hidden="true"
              />
            )}
            <Globe size={16} weight="bold" className="relative z-10" aria-hidden="true" />
            <span className="relative z-10">{MODES.tabs[1]!.title}</span>
          </button>
        </div>

        {/* Tabpanel */}
        <div
          id="panel-mode"
          role="tabpanel"
          aria-labelledby={isLocal ? 'tab-local' : 'tab-online'}
          className="lp-plate p-6 sm:p-10"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-6 flex flex-col items-start">
              <div className="mb-4">
                <span className={isLocal ? 'lp-badge-mint' : 'lp-badge-sun'}>
                  {currentTab.badge}
                </span>
              </div>

              <h3 className="font-display font-bold text-2xl sm:text-3xl text-ink mb-6">
                {currentTab.title}
              </h3>

              <ul className="space-y-4 mb-8 w-full">
                {currentTab.points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-3 text-base sm:text-lg text-ink">
                    <span
                      className={`w-6 h-6 rounded-full text-xs font-bold lp-code flex items-center justify-center shrink-0 mt-0.5 ${
                        isLocal ? 'bg-teal-light text-teal-dark' : 'bg-sun-light text-sun-dark'
                      }`}
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={isLocal ? onPlayLocal : onPlayOnline}
                className={`lp-btn w-full sm:w-auto ${isLocal ? 'lp-btn--primary' : 'lp-btn--sun'}`}
              >
                {currentTab.action}
              </button>
            </div>

            <div className="lg:col-span-6 flex justify-center">
              <div className="p-3 bg-paper-muted border border-rule rounded-3xl max-w-[300px] sm:max-w-[320px] w-full">
                <div className="relative h-[400px] sm:h-[430px] w-full overflow-hidden rounded-2xl border border-rule bg-paper">
                  <img
                    src="/landing/screens/setup.png"
                    alt="Tampilan pengaturan Pass & Play satu HP"
                    width={780}
                    height={1688}
                    aria-hidden={!isLocal}
                    className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-200 ${
                      isLocal ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  />
                  <img
                    src="/landing/screens/lobby.png"
                    alt="Tampilan lobi room online"
                    width={780}
                    height={1688}
                    aria-hidden={isLocal}
                    className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-200 ${
                      !isLocal ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModeSwitcher;
