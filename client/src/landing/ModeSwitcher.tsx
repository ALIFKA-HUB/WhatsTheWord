import React, { useRef, useState } from 'react';
import { MODES } from './content';

export interface ModeSwitcherProps {
  onPlayLocal: () => void;
  onPlayOnline: () => void;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ onPlayLocal, onPlayOnline }) => {
  const [activeTab, setActiveTab] = useState<'local' | 'online'>('local');
  const localTabRef = useRef<HTMLButtonElement>(null);
  const onlineTabRef = useRef<HTMLButtonElement>(null);

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

  return (
    <section
      id="mode"
      data-landing-section
      className="lp-screen lp-mode lp-screen--band"
      aria-label="Mode permainan"
    >
      <div className="lp-container">
        <div className="max-w-2xl mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-paper border border-rule rounded-full text-xs font-medium text-ink-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-mint" />
            <span>Fleksibilitas perangkat</span>
          </div>
          <h2 className="lp-head text-ink text-2xl sm:text-3xl md:text-4xl mb-4">
            {MODES.head}
          </h2>
          <p className="text-base sm:text-lg text-ink-2">
            Main bareng teman di meja yang sama atau dari jarak jauh lewat room online.
          </p>
        </div>

        {/* Tab list with Tactile Mint / Terracotta accents */}
        <div
          role="tablist"
          aria-label="Pilihan mode main"
          className="inline-flex border-2 border-ink p-1.5 bg-paper rounded-full mb-8 sm:mb-12 shadow-sm"
        >
          <button
            ref={localTabRef}
            id="tab-local"
            role="tab"
            type="button"
            aria-selected={isLocal}
            aria-controls="panel-local"
            tabIndex={isLocal ? 0 : -1}
            onClick={() => setActiveTab('local')}
            onKeyDown={handleKeyDown}
            className={`px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-colors flex items-center gap-2 ${
              isLocal
                ? 'bg-ink text-paper shadow-sm'
                : 'text-ink hover:text-ink-2'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isLocal ? 'bg-mint' : 'bg-rule'}`} />
            <span>Satu HP (Pass & Play)</span>
          </button>
          <button
            ref={onlineTabRef}
            id="tab-online"
            role="tab"
            type="button"
            aria-selected={!isLocal}
            aria-controls="panel-online"
            tabIndex={!isLocal ? 0 : -1}
            onClick={() => setActiveTab('online')}
            onKeyDown={handleKeyDown}
            className={`px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-colors flex items-center gap-2 ${
              !isLocal
                ? 'bg-ink text-paper shadow-sm'
                : 'text-ink hover:text-ink-2'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${!isLocal ? 'bg-accent' : 'bg-rule'}`} />
            <span>Room Online</span>
          </button>
        </div>

        {/* Tab panel: Local (Pass & Play) */}
        <div
          id="panel-local"
          role="tabpanel"
          aria-labelledby="tab-local"
          hidden={!isLocal}
          className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-8 lg:gap-16 items-center"
        >
          <div className="flex flex-col items-start">
            <h3 className="font-display font-bold text-2xl sm:text-3xl text-ink mb-4">
              Satu HP untuk seluruh meja
            </h3>
            <ul className="list-none p-0 m-0 mb-8 space-y-3.5 w-full">
              {MODES.tabs[0].points.map((pt) => (
                <li key={pt} className="flex items-start gap-3 text-base sm:text-lg text-ink-2 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-mint-soft text-mint-deep inline-flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-mint">
                    ✓
                  </span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={onPlayLocal}
              className="lp-btn lp-btn--mint w-full sm:w-auto"
            >
              Mulai Pass & Play
            </button>
          </div>

          <div className="flex justify-center">
            <div className="lp-tabletop-mat p-4 border-2 border-ink max-w-[340px] w-full shadow-card">
              <div className="relative aspect-[780/1832] w-full overflow-hidden bg-paper rounded-xl border border-rule">
                <img
                  src="/landing/screens/setup.png"
                  alt="Tampilan pengaturan ronde permainan Satu HP"
                  width={780}
                  height={1832}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tab panel: Online */}
        <div
          id="panel-online"
          role="tabpanel"
          aria-labelledby="tab-online"
          hidden={isLocal}
          className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-8 lg:gap-16 items-center"
        >
          <div className="flex flex-col items-start">
            <h3 className="font-display font-bold text-2xl sm:text-3xl text-ink mb-4">
              Masing-masing pegang HP
            </h3>
            <ul className="list-none p-0 m-0 mb-8 space-y-3.5 w-full">
              {MODES.tabs[1].points.map((pt) => (
                <li key={pt} className="flex items-start gap-3 text-base sm:text-lg text-ink-2 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-accent-soft text-accent inline-flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-accent">
                    ✓
                  </span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={onPlayOnline}
              className="lp-btn lp-btn--primary w-full sm:w-auto"
            >
              Buka Room Online
            </button>
          </div>

          <div className="flex justify-center">
            <div className="lp-tabletop-mat p-4 border-2 border-ink max-w-[340px] w-full shadow-card">
              <div className="relative aspect-[780/2036] w-full overflow-hidden bg-paper rounded-xl border border-rule">
                <img
                  src="/landing/screens/lobby.png"
                  alt="Tampilan lobi ruang tunggu Room Online"
                  width={780}
                  height={2036}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModeSwitcher;
