import React, { useCallback, useRef, useState } from 'react';
import { animate, type AnimationSequence } from 'motion/react';
import { HERO } from './content';
import { useCardTimeline } from './useCardTimeline';

export interface HeroDealProps {
  onPlayLocal: () => void;
  onPlayOnline: () => void;
}

interface WordPairPreset {
  civilian: string;
  undercover: string;
  code: string;
}

const PRESETS: WordPairPreset[] = [
  { civilian: 'Kopi', undercover: 'Teh', code: 'mkn-01' },
  { civilian: 'Dokter', undercover: 'Bidan', code: 'prf-04' },
  { civilian: 'Matahari', undercover: 'Bulan', code: 'alm-02' },
  { civilian: 'Laptop', undercover: 'Tablet', code: 'obj-07' },
  { civilian: 'Pantai', undercover: 'Gunung', code: 'alm-09' },
];

export const HeroDeal: React.FC<HeroDealProps> = ({ onPlayLocal, onPlayOnline }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [peekedCard, setPeekedCard] = useState<number | null>(null);
  const [presetIndex, setPresetIndex] = useState(0);

  const activePreset = PRESETS[presetIndex];

  const cards = [
    { id: 'card-0', word: activePreset.civilian, isUndercover: false, label: `Kartu 1: ${activePreset.civilian} (Warga)` },
    { id: 'card-1', word: activePreset.civilian, isUndercover: false, label: `Kartu 2: ${activePreset.civilian} (Warga)` },
    { id: 'card-2', word: activePreset.undercover, isUndercover: true, label: `Kartu 3: ${activePreset.undercover} (Penyamar)` },
    { id: 'card-3', word: activePreset.civilian, isUndercover: false, label: `Kartu 4: ${activePreset.civilian} (Warga)` },
  ];

  const buildTimeline = useCallback((scope: HTMLElement): AnimationSequence => {
    const card0 = scope.querySelector('[data-card="0"]');
    const card1 = scope.querySelector('[data-card="1"]');
    const card2 = scope.querySelector('[data-card="2"]');
    const card3 = scope.querySelector('[data-card="3"]');
    const cover = scope.querySelector('[data-cover]');
    const stamp = scope.querySelector('[data-stamp]');

    if (!card0 || !card1 || !card2 || !card3 || !cover || !stamp) {
      return [];
    }

    return [
      ...[0, 1, 2, 3].map((i) => [
        scope.querySelector(`[data-card="${i}"]`) as Element,
        { opacity: [0, 1], x: [-180 + i * 36, 0], y: [-50, 0], rotate: [-12, (i - 1.5) * 6] },
        { duration: 0.52, ease: [0.34, 1.56, 0.64, 1], at: i * 0.11 },
      ] as const),
      [cover as Element, { opacity: [1, 0] }, { duration: 0.22, at: 0.95 }],
      [card2 as Element, { y: [0, -18, 0] }, { duration: 0.45, at: 1.3 }],
      [stamp as Element, { opacity: [0, 1], scale: [1.35, 1], rotate: [-16, -8] }, { duration: 0.3, ease: [0.22, 1, 0.36, 1], at: 1.65 }],
    ] as AnimationSequence;
  }, []);

  const { isStatic, replay } = useCardTimeline(containerRef, buildTimeline);

  const handleCardClick = (i: number) => {
    const next = peekedCard === i ? null : i;
    setPeekedCard(next);

    const scope = containerRef.current;
    if (!scope) return;

    const springEase: [number, number, number, number] = [0.34, 1.56, 0.64, 1];
    const dur = isStatic ? 0 : 0.32;

    const clickedEl = scope.querySelector(`[data-card="${i}"]`);
    if (clickedEl) {
      animate(clickedEl, { y: next === i ? -24 : 0 }, { duration: dur, ease: springEase });
    }

    if (peekedCard !== null && peekedCard !== i) {
      const prevEl = scope.querySelector(`[data-card="${peekedCard}"]`);
      if (prevEl) {
        animate(prevEl, { y: 0 }, { duration: dur, ease: springEase });
      }
    }
  };

  const handleShuffle = () => {
    setPresetIndex((prev) => (prev + 1) % PRESETS.length);
    setPeekedCard(null);
    replay();
  };

  return (
    <section className="lp-screen lp-hero" aria-label="Hero">
      <div className="lp-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column (5 cols on desktop) */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-paper-2 border border-rule rounded-full text-xs font-medium text-ink-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-mint" />
              <span>Permainan kartu deduksi kata</span>
            </div>
            <h1 className="lp-head lp-hero-head text-ink mb-6">
              {HERO.title}
            </h1>
            <p className="lp-lead mb-8 max-w-[44ch]">
              {HERO.sentence}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center w-full sm:w-auto">
              <button
                type="button"
                onClick={onPlayLocal}
                className="lp-btn lp-btn--primary w-full sm:w-auto"
              >
                {HERO.primary}
              </button>
              <button
                type="button"
                onClick={onPlayOnline}
                className="lp-btn lp-btn--secondary w-full sm:w-auto"
              >
                {HERO.secondary}
              </button>
            </div>
            <div className="mt-8 flex flex-row flex-wrap gap-4 text-xs text-ink-muted lp-code">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-ink-2" />
                {HERO.fact1}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-ink-2" />
                {HERO.fact2}
              </span>
            </div>
          </div>

          {/* Right Column: The Tabletop Deal Stage (7 cols on desktop) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <div className="lp-tabletop-mat p-4 sm:p-8 w-full max-w-[560px]">
              {/* Tabletop Playmat Header Markers */}
              <div className="flex items-center justify-between pb-4 mb-2 border-b border-rule text-xs text-ink-muted lp-code">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 border border-ink-muted" />
                  meja pembagian kartu
                </span>
                <span>ronde 01 · 4 pemain</span>
              </div>

              {/* The Fan */}
              <div className="lp-deal-table">
                <div
                  ref={containerRef}
                  className="lp-deal-fan"
                >
                  {cards.map((card, i) => (
                    <button
                      key={card.id}
                      type="button"
                      data-card={i}
                      aria-pressed={peekedCard === i}
                      aria-label={card.label}
                      onClick={() => handleCardClick(i)}
                      className="lp-plate lp-deal-card"
                      style={{
                        zIndex: peekedCard === i ? 20 : i + 1,
                        transform: `rotate(${(i - 1.5) * 6}deg)`,
                      }}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="lp-code text-[11px] sm:text-xs text-ink-muted">{activePreset.code}</span>
                        {!card.isUndercover && (
                          <span className="lp-badge-mint text-[10px] px-1.5 py-0.5">
                            warga
                          </span>
                        )}
                        {card.isUndercover && (
                          <span className="lp-badge-accent text-[10px] px-1.5 py-0.5">
                            target
                          </span>
                        )}
                      </div>
                      <div className="my-auto text-center py-2 sm:py-4">
                        <span className="font-display font-bold text-base sm:text-2xl text-ink">
                          {card.word}
                        </span>
                      </div>
                      <div className="h-6 w-full relative flex items-center justify-end">
                        {card.isUndercover && (
                          <span data-stamp className="lp-stamp text-[10px] sm:text-xs">
                            Penyamar
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                  <div data-cover className="lp-deal-cover" aria-hidden="true" />
                </div>

                {/* Interactive Controls & Caption */}
                <div className="mt-4 pt-4 border-t border-rule flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                  <p className="text-xs text-ink-muted lp-code" aria-live="polite">
                    Tiga kartu {activePreset.civilian}, satu kartu {activePreset.undercover}. Sentuh kartu untuk intip.
                  </p>
                  <button
                    type="button"
                    onClick={handleShuffle}
                    className="lp-btn lp-btn--secondary py-1.5 px-3 text-xs min-h-[36px] shrink-0"
                    title="Coba pasang kata lain"
                  >
                    Acak pasang kata
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroDeal;
