import React, { useCallback, useRef, useState } from 'react';
import { animate, type AnimationSequence } from 'motion/react';
import { HERO } from './content';
import { useCardTimeline } from './useCardTimeline';

export interface HeroDealProps {
  onPlayLocal: () => void;
  onPlayOnline: () => void;
}

interface DealCard {
  id: string;
  word: string;
  isUndercover: boolean;
  label: string;
}

const DEAL_CARDS: DealCard[] = [
  { id: 'card-0', word: 'Kopi', isUndercover: false, label: 'Kartu 1: Kopi (Warga)' },
  { id: 'card-1', word: 'Kopi', isUndercover: false, label: 'Kartu 2: Kopi (Warga)' },
  { id: 'card-2', word: 'Teh', isUndercover: true, label: 'Kartu 3: Teh (Penyamar)' },
  { id: 'card-3', word: 'Kopi', isUndercover: false, label: 'Kartu 4: Kopi (Warga)' },
];

export const HeroDeal: React.FC<HeroDealProps> = ({ onPlayLocal, onPlayOnline }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [peekedCard, setPeekedCard] = useState<number | null>(null);

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
        { opacity: [0, 1], x: [-220 + i * 40, 0], y: [-60, 0], rotate: [-14, (i - 1.5) * 6] },
        { duration: 0.55, ease: [0.34, 1.56, 0.64, 1], at: i * 0.12 },
      ] as const),
      [cover as Element, { opacity: [1, 0] }, { duration: 0.25, at: 1.0 }],
      [card2 as Element, { y: [0, -18, 0] }, { duration: 0.5, at: 1.4 }],
      [stamp as Element, { opacity: [0, 1], scale: [1.4, 1], rotate: [-18, -8] }, { duration: 0.32, ease: [0.22, 1, 0.36, 1], at: 1.8 }],
    ] as AnimationSequence;
  }, []);

  const { isStatic } = useCardTimeline(containerRef, buildTimeline);

  const handleCardClick = (i: number) => {
    const next = peekedCard === i ? null : i;
    setPeekedCard(next);

    const scope = containerRef.current;
    if (!scope) return;

    const springEase: [number, number, number, number] = [0.34, 1.56, 0.64, 1];
    const dur = isStatic ? 0 : 0.35;

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

  return (
    <section className="lp-screen lp-hero" aria-label="Hero">
      <div className="lp-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column (5 cols on desktop) */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <h1 className="lp-head lp-hero-head text-ink mb-6">
              {HERO.title}
            </h1>
            <p className="lp-lead mb-8 max-w-[44ch]">
              {HERO.sentence}
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <button
                type="button"
                onClick={onPlayLocal}
                className="lp-btn lp-btn--primary"
              >
                {HERO.primary}
              </button>
              <button
                type="button"
                onClick={onPlayOnline}
                className="lp-btn lp-btn--secondary"
              >
                {HERO.secondary}
              </button>
            </div>
            <div className="mt-8 flex flex-col gap-1 text-sm text-ink-muted lp-code">
              <span>{HERO.fact1}</span>
              <span>{HERO.fact2}</span>
            </div>
          </div>

          {/* Right Column: The Deal (7 cols on desktop) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <div className="lp-deal-table">
              <div
                ref={containerRef}
                className="lp-deal-fan"
              >
                {DEAL_CARDS.map((card, i) => (
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
                      <span className="lp-code text-xs text-ink-muted">mkn-01</span>
                    </div>
                    <div className="my-auto text-center py-4">
                      <span className="font-display font-bold text-2xl sm:text-3xl text-ink">
                        {card.word}
                      </span>
                    </div>
                    <div className="h-6 w-full relative flex items-center justify-end">
                      {card.isUndercover && (
                        <span data-stamp className="lp-stamp">
                          PENYAMAR
                        </span>
                      )}
                    </div>
                  </button>
                ))}
                <div data-cover className="lp-deal-cover" aria-hidden="true" />
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-ink-muted lp-code" aria-live="polite">
                  {HERO.caption}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroDeal;
