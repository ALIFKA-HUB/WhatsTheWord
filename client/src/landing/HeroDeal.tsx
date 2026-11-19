import React, { useCallback, useEffect, useRef, useState } from 'react';
import { animate, type AnimationSequence } from 'motion/react';
import {
  ArrowsClockwise,
  Eye,
  EyeSlash,
  Shuffle,
  UserPlus,
  ShieldCheck,
  Detective,
  Question,
  LockKey,
} from '@phosphor-icons/react';
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
  category: string;
}

const PRESETS: WordPairPreset[] = [
  { civilian: 'Kopi', undercover: 'Teh', code: 'mkn-01', category: 'Minuman' },
  { civilian: 'Dokter', undercover: 'Bidan', code: 'prf-04', category: 'Profesi' },
  { civilian: 'Matahari', undercover: 'Bulan', code: 'alm-02', category: 'Alam' },
  { civilian: 'Laptop', undercover: 'Tablet', code: 'obj-07', category: 'Benda' },
  { civilian: 'Pantai', undercover: 'Gunung', code: 'alm-09', category: 'Tempat' },
];

const SEAT_HOLDERS = ['Raka', 'Sinta', 'Bima', 'Dina'] as const;

interface CardScatterPose {
  rot: number;
  x: number;
  y: number;
}

const SCATTER_LAYOUTS: readonly (readonly [
  CardScatterPose,
  CardScatterPose,
  CardScatterPose,
  CardScatterPose,
])[] = [
  [
    { rot: -3.4, x: 2, y: 8 },
    { rot: 2.2, x: 0, y: -7 },
    { rot: -2.6, x: -1, y: 6 },
    { rot: 3.6, x: -2, y: -4 },
  ],
  [
    { rot: 2.9, x: 2, y: -5 },
    { rot: -3.6, x: 1, y: 8 },
    { rot: 2.5, x: -1, y: -6 },
    { rot: -3.1, x: -2, y: 7 },
  ],
  [
    { rot: -3.8, x: 2, y: 7 },
    { rot: -1.8, x: 1, y: -6 },
    { rot: 3.2, x: -1, y: 6 },
    { rot: -2.7, x: -2, y: -6 },
  ],
  [
    { rot: 2.6, x: 2, y: 6 },
    { rot: -3.3, x: 0, y: -7 },
    { rot: -2.1, x: 1, y: 8 },
    { rot: 3.7, x: -2, y: -5 },
  ],
];

const SEAT_ORDER_PERMUTATIONS: readonly (readonly [number, number, number, number])[] = [
  [2, 0, 1, 3],
  [0, 3, 2, 1],
  [1, 2, 0, 3],
  [3, 1, 2, 0],
];

const SNAP_EASE: readonly [number, number, number, number] = [0.22, 1, 0.36, 1];

export const HeroDeal: React.FC<HeroDealProps> = ({ onPlayLocal, onPlayOnline }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [peekedCards, setPeekedCards] = useState<Record<number, boolean>>({ 0: true, 2: true });
  const [presetIndex, setPresetIndex] = useState(0);
  const [scatterIndex, setScatterIndex] = useState(0);
  const [dealNonce, setDealNonce] = useState(0);
  const lastReplayedNonceRef = useRef(0);
  const [includeMrWhite, setIncludeMrWhite] = useState(false);

  const activePreset = PRESETS[presetIndex]!;
  const activeScatter = SCATTER_LAYOUTS[scatterIndex % SCATTER_LAYOUTS.length]!;
  const rolePerm = SEAT_ORDER_PERMUTATIONS[scatterIndex % SEAT_ORDER_PERMUTATIONS.length]!;

  const baseDeck = [
    {
      word: activePreset.civilian,
      role: 'warga' as const,
      roleText: 'Warga',
      hint: 'Kata sama',
    },
    {
      word: activePreset.civilian,
      role: 'warga' as const,
      roleText: 'Warga',
      hint: 'Kata sama',
    },
    {
      word: activePreset.undercover,
      role: 'penyamar' as const,
      roleText: 'Penyamar',
      hint: 'Kata mirip',
    },
    {
      word: includeMrWhite ? 'Tanpa kata' : activePreset.civilian,
      role: includeMrWhite ? ('mrwhite' as const) : ('warga' as const),
      roleText: includeMrWhite ? 'Mr. White' : 'Warga',
      hint: includeMrWhite ? 'Tebak kata' : 'Kata sama',
    },
  ];

  const cards = SEAT_HOLDERS.map((seat, i) => {
    const roleSlot = baseDeck[rolePerm[i]!]!;
    return {
      id: `card-${i}`,
      seat,
      word: roleSlot.word,
      role: roleSlot.role,
      roleText: roleSlot.roleText,
      hint: roleSlot.hint,
      pose: activeScatter[i]!,
      label: `Kartu ${i + 1} (${seat}): ${roleSlot.word} (${roleSlot.roleText})`,
    };
  });

  const allPeeked = cards.every((_, i) => Boolean(peekedCards[i]));

  const buildTimeline = useCallback(
    (scope: HTMLElement): AnimationSequence => {
      const card0 = scope.querySelector('[data-card="0"]');
      const card1 = scope.querySelector('[data-card="1"]');
      const card2 = scope.querySelector('[data-card="2"]');
      const card3 = scope.querySelector('[data-card="3"]');
      const cover = scope.querySelector('[data-cover]');

      if (!card0 || !card1 || !card2 || !card3 || !cover) {
        return [];
      }

      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

      return [
        ...[0, 1, 2, 3].map((i) => {
          const pose = activeScatter[i]!;
          const targetRot = isMobile ? pose.rot * 0.45 : pose.rot;
          const targetX = isMobile ? 0 : pose.x;
          const targetY = isMobile ? pose.y * 0.35 : pose.y;
          return [
            scope.querySelector(`[data-card="${i}"]`) as Element,
            {
              opacity: [0.9, 1],
              x: [targetX - 12 + i * 5, targetX],
              y: [targetY - 10, targetY],
              rotate: [targetRot - 3, targetRot],
            },
            { duration: 0.34, ease: SNAP_EASE, at: i * 0.055 },
          ] as const;
        }),
        [cover as Element, { opacity: [0.1, 0] }, { duration: 0.16, at: 0.4 }],
      ] as AnimationSequence;
    },
    [activeScatter]
  );

  const { isStatic, replay } = useCardTimeline(containerRef, buildTimeline);

  useEffect(() => {
    if (dealNonce === 0 || lastReplayedNonceRef.current === dealNonce) return;
    lastReplayedNonceRef.current = dealNonce;
    replay();
  }, [dealNonce, replay]);

  const animateCardPose = (i: number, raised: boolean) => {
    const scope = containerRef.current;
    if (!scope) return;
    const el = scope.querySelector(`[data-card="${i}"]`);
    if (!el) return;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const pose = activeScatter[i]!;
    const targetRot = isMobile ? pose.rot * 0.45 : pose.rot;
    const targetX = isMobile ? 0 : pose.x;
    const targetY = (isMobile ? pose.y * 0.35 : pose.y) + (raised ? -6 : 0);
    const dur = isStatic ? 0 : 0.22;
    animate(
      el,
      {
        x: targetX,
        y: targetY,
        rotate: raised ? targetRot * 0.55 : targetRot,
      },
      { duration: dur, ease: SNAP_EASE }
    );
  };

  const handleCardToggle = (i: number) => {
    const nextVal = !peekedCards[i];
    setPeekedCards((prev) => ({ ...prev, [i]: nextVal }));
    animateCardPose(i, nextVal);
  };

  const handleDealAgain = () => {
    const nextScatter = (scatterIndex + 1) % SCATTER_LAYOUTS.length;
    const nextPerm = SEAT_ORDER_PERMUTATIONS[nextScatter]!;
    const undercoverSeat = nextPerm.findIndex((idx) => idx === 2);
    const citizenSeat = nextPerm.findIndex((idx) => idx === 0);
    setScatterIndex(nextScatter);
    setPeekedCards({
      [citizenSeat >= 0 ? citizenSeat : 0]: true,
      [undercoverSeat >= 0 ? undercoverSeat : 2]: true,
    });
    setDealNonce((n) => n + 1);
  };

  const handleToggleAllPeek = () => {
    const nextState = !allPeeked;
    setPeekedCards({ 0: nextState, 1: nextState, 2: nextState, 3: nextState });
    cards.forEach((_, i) => animateCardPose(i, nextState));
  };

  const handleNextPreset = () => {
    const nextScatter = (scatterIndex + 1) % SCATTER_LAYOUTS.length;
    const nextPerm = SEAT_ORDER_PERMUTATIONS[nextScatter]!;
    const undercoverSeat = nextPerm.findIndex((idx) => idx === 2);
    const citizenSeat = nextPerm.findIndex((idx) => idx === 0);
    setPresetIndex((prev) => (prev + 1) % PRESETS.length);
    setScatterIndex(nextScatter);
    setPeekedCards({
      [citizenSeat >= 0 ? citizenSeat : 0]: true,
      [undercoverSeat >= 0 ? undercoverSeat : 2]: true,
    });
    setDealNonce((n) => n + 1);
  };

  const handleToggleMrWhite = () => {
    const mrWhiteSeat = rolePerm.findIndex((idx) => idx === 3);
    const seatIdx = mrWhiteSeat >= 0 ? mrWhiteSeat : 3;
    setIncludeMrWhite((prev) => !prev);
    setPeekedCards((prev) => ({ ...prev, [seatIdx]: true }));
    animateCardPose(seatIdx, true);
  };

  return (
    <section className="lp-screen lp-hero" aria-label="Hero">
      <div className="lp-container w-full">
        <div className="lp-hero-grid">
          {/* Left Column: Commanding Display Copy & Equal-Height CTAs */}
          <div className="flex flex-col items-start min-w-0">
            <h1 className="lp-head lp-hero-head text-ink mb-5">
              Satu kata beda.{' '}
              <span className="block">Siapa penyamarnya?</span>
            </h1>
            <p className="lp-lead mb-8 max-w-[38ch]">
              {HERO.sentence}
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 items-stretch sm:items-center w-full sm:w-auto">
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
          </div>

          {/* Right Column: Interactive Tabletop Stage + Floating Control Dock */}
          <div className="flex flex-col items-center w-full min-w-0">
            <div className="lp-tabletop-mat p-4 sm:p-6 w-full max-w-[780px]">
              <div className="flex items-center justify-between gap-2 pb-3 mb-2 border-b border-rule text-xs text-ink-muted">
                <span className="font-bold text-ink">Meja Kartu Rahasia</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="bg-cardstock px-2.5 py-0.5 rounded-full border border-rule font-semibold text-ink">
                    {activePreset.category}
                  </span>
                  <span className="lp-code bg-paper px-2 py-0.5 rounded-full border border-rule text-ink-muted">
                    {activePreset.code}
                  </span>
                </div>
              </div>

              <div className="lp-deal-table">
                <div ref={containerRef} className="lp-deal-fan">
                  {cards.map((card, i) => {
                    const isPeeked = Boolean(peekedCards[i]);
                    const stateClass = !isPeeked
                      ? 'lp-deal-card--closed'
                      : card.role === 'penyamar'
                        ? 'lp-deal-card--penyamar'
                        : card.role === 'mrwhite'
                          ? 'lp-deal-card--mrwhite'
                          : 'lp-deal-card--warga';

                    const RoleIcon =
                      card.role === 'penyamar'
                        ? Detective
                        : card.role === 'mrwhite'
                          ? Question
                          : ShieldCheck;

                    return (
                      <button
                        key={card.id}
                        type="button"
                        data-card={i}
                        aria-pressed={isPeeked}
                        aria-label={card.label}
                        onClick={() => handleCardToggle(i)}
                        className={`lp-deal-card ${stateClass}`}
                        style={{
                          zIndex: isPeeked ? 15 + i : i + 1,
                          ['--fan-rot' as string]: `${card.pose.rot}deg`,
                          ['--fan-x' as string]: `${card.pose.x}px`,
                          ['--fan-y' as string]: `${card.pose.y}px`,
                          ['--lift-y' as string]: isPeeked ? '-6px' : '0px',
                        }}
                      >
                        {!isPeeked && (
                          <span
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-2 rounded-b-full bg-paper-muted border-x border-b border-rule pointer-events-none"
                            aria-hidden="true"
                          />
                        )}

                        {isPeeked ? (
                          <>
                            {/* Top Index & Semantic Role Pill */}
                            <div className="flex items-center justify-between gap-1 w-full min-w-0">
                              <span className="lp-code text-[10.5px] sm:text-[11px] font-bold text-ink-muted shrink-0">
                                0{i + 1}
                              </span>
                              <span
                                className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[10.5px] font-bold inline-flex items-center gap-1 whitespace-nowrap shrink-0 ${
                                  card.role === 'penyamar'
                                    ? 'bg-stamp text-cardstock'
                                    : card.role === 'mrwhite'
                                      ? 'bg-sun text-ink border border-sun-dark'
                                      : 'bg-teal-dark text-cardstock'
                                }`}
                              >
                                <RoleIcon size={11} weight="bold" aria-hidden="true" />
                                <span>{card.roleText}</span>
                              </span>
                            </div>

                            {/* Center Secret Word Band (Single-Layer, Zero Nested Border Box) */}
                            <div className="my-auto py-1 text-center space-y-1.5 w-full">
                              <div
                                className={`py-3 sm:py-3.5 px-2 rounded-xl ${
                                  card.role === 'penyamar'
                                    ? 'bg-cardstock'
                                    : card.role === 'mrwhite'
                                      ? 'bg-cardstock border border-dashed border-sun-dark'
                                      : 'bg-teal-light/45'
                                }`}
                              >
                                <span
                                  className={`font-display font-bold block leading-tight tracking-tight ${
                                    card.word.length > 8
                                      ? 'text-sm sm:text-base'
                                      : 'text-lg sm:text-xl'
                                  } ${
                                    card.role === 'penyamar'
                                      ? 'text-stamp-dark'
                                      : 'text-ink'
                                  }`}
                                >
                                  {card.word}
                                </span>
                              </div>

                              <span className="text-[11px] font-semibold text-ink-muted block">
                                {card.hint}
                              </span>
                            </div>

                            {/* Bottom Hairline Seat Row */}
                            <div className="flex items-center justify-between w-full pt-2 border-t border-rule/80 text-[11px] font-bold text-ink">
                              <span className="truncate">{card.seat}</span>
                              <span className="text-ink-muted font-semibold shrink-0">Tutup</span>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Closed Envelope Card Back */}
                            <div className="flex items-center justify-between gap-1 w-full min-w-0 pt-1">
                              <span className="lp-code text-[10.5px] sm:text-[11px] font-bold text-ink-muted shrink-0">
                                0{i + 1}
                              </span>
                              <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-cardstock border border-rule text-[10px] sm:text-[10.5px] font-bold text-ink-muted whitespace-nowrap shrink-0">
                                <LockKey size={10} weight="bold" aria-hidden="true" />
                                <span>Rahasia</span>
                              </span>
                            </div>

                            <div className="my-auto text-center py-2 space-y-2 w-full">
                              <LockKey
                                size={22}
                                weight="duotone"
                                className="mx-auto text-teal-dark"
                                aria-hidden="true"
                              />
                              <span className="inline-block px-2.5 py-1 rounded-full bg-cardstock border border-rule text-[11px] font-bold text-ink shadow-print-sm">
                                Kartu {card.seat}
                              </span>
                            </div>

                            <div className="flex items-center justify-between w-full pt-2 border-t border-rule/80 text-[11px] font-bold text-teal-dark">
                              <span>Ketuk intip</span>
                              <Eye size={13} weight="bold" aria-hidden="true" />
                            </div>
                          </>
                        )}
                      </button>
                    );
                  })}
                  <div data-cover className="lp-deal-cover" aria-hidden="true" />
                </div>

                <p className="text-xs text-ink-muted text-center mt-3" aria-live="polite">
                  {includeMrWhite
                    ? `2 Warga (${activePreset.civilian}), 1 Penyamar (${activePreset.undercover}), 1 Mr. White. Ketuk kartu untuk intip.`
                    : `3 Warga (${activePreset.civilian}), 1 Penyamar (${activePreset.undercover}). Ketuk kartu untuk intip.`}
                </p>
              </div>
            </div>

            {/* Responsive Floating Control Dock */}
            <div
              className="lp-hero-dock mt-4"
              role="group"
              aria-label="Kontrol meja kartu hero"
            >
              <button
                type="button"
                onClick={handleDealAgain}
                className="lp-dock-btn text-ink hover:bg-paper-muted"
              >
                <ArrowsClockwise size={15} weight="bold" aria-hidden="true" />
                <span>Bagikan ulang</span>
              </button>
              <button
                type="button"
                onClick={handleToggleAllPeek}
                aria-pressed={allPeeked}
                className={`lp-dock-btn ${
                  allPeeked
                    ? 'bg-teal-dark text-cardstock'
                    : 'text-ink hover:bg-paper-muted'
                }`}
              >
                {allPeeked ? (
                  <EyeSlash size={15} weight="bold" aria-hidden="true" />
                ) : (
                  <Eye size={15} weight="bold" aria-hidden="true" />
                )}
                <span>{allPeeked ? 'Tutup semua' : 'Intip semua'}</span>
              </button>
              <button
                type="button"
                onClick={handleNextPreset}
                className="lp-dock-btn text-ink hover:bg-paper-muted"
              >
                <Shuffle size={15} weight="bold" aria-hidden="true" />
                <span>Ganti kata</span>
              </button>
              <button
                type="button"
                onClick={handleToggleMrWhite}
                aria-pressed={includeMrWhite}
                className={`lp-dock-btn ${
                  includeMrWhite
                    ? 'bg-sun text-ink border border-sun-dark'
                    : 'text-ink hover:bg-paper-muted'
                }`}
              >
                <UserPlus size={15} weight="bold" aria-hidden="true" />
                <span>Mr. White</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroDeal;
