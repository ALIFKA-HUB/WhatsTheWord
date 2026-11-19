import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { UsersThree } from '@phosphor-icons/react';
import { ROLE_GUIDES } from './content';
import { RoleDispenserFigure } from './anatomy/RoleDispenserFigure';
import { DEFAULT_PLAYERS, PLAYER_PRESETS, roleBreakdownFor } from './anatomy/model';

export const SetupMechanismSection: React.FC = () => {
  const [players, setPlayers] = useState<number>(DEFAULT_PLAYERS);
  const [withMrWhite, setWithMrWhite] = useState<boolean>(true);
  const [activeRoleId, setActiveRoleId] = useState<'civilian' | 'undercover' | 'mrwhite'>('civilian');
  const shouldReduce = useReducedMotion();

  const breakdown = roleBreakdownFor(players, withMrWhite);
  const activeRole = ROLE_GUIDES.find((r) => r.id === activeRoleId) ?? ROLE_GUIDES[0]!;

  const barTransition = shouldReduce
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 260, damping: 28 };

  const bars = [
    {
      key: 'civilians',
      label: 'Warga Sipil',
      count: breakdown.civilians,
      ratio: breakdown.civilians / players,
      fillClass: 'bg-teal-dark',
      textClass: 'text-teal-dark',
    },
    {
      key: 'undercover',
      label: 'Penyamar',
      count: breakdown.undercover,
      ratio: breakdown.undercover / players,
      fillClass: 'bg-stamp',
      textClass: 'text-stamp-dark',
    },
    {
      key: 'mrwhite',
      label: 'Mr. White',
      count: breakdown.mrWhite,
      ratio: breakdown.mrWhite / players,
      fillClass: 'bg-sun-dark',
      textClass: 'text-sun-dark',
    },
  ];

  return (
    <section
      id="mekanisme"
      data-landing-section
      className="lp-screen"
      aria-label="Mekanisme pembagian peran"
    >
      <div className="lp-container">
        <div className="max-w-2xl mb-8 sm:mb-10">
          <h2 className="lp-head text-ink mb-3">
            Atur meja, jaga keadilan peran.
          </h2>
          <p className="text-base sm:text-lg text-ink-muted max-w-[58ch]">
            Pilih jumlah pemain dan lihat bagaimana mesin membagi komposisi Warga, Penyamar, dan Mr. White secara seimbang.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Left Column: Unified Setup Simulator & Role Dossier Card (5 cols) */}
          <div className="lg:col-span-5 flex">
            <div className="lp-plate p-5 sm:p-6 w-full flex flex-col justify-between divide-y divide-rule gap-5">
              {/* Top: Player Count Presets */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 font-display font-bold text-base text-ink">
                    <UsersThree size={18} weight="bold" className="text-teal-dark" aria-hidden="true" />
                    <span>Jumlah pemain di meja</span>
                  </span>
                  <span className="lp-code text-xs font-bold px-2.5 py-0.5 rounded-full bg-paper-muted border border-rule text-ink">
                    {players} pemain
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Pilih jumlah pemain di meja">
                  {PLAYER_PRESETS.map((count) => {
                    const selected = players === count;
                    return (
                      <button
                        key={count}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setPlayers(count)}
                        className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold lp-code cursor-pointer transition-colors ${
                          selected
                            ? 'bg-teal-dark text-cardstock shadow-push-teal'
                            : 'bg-paper-muted text-ink border border-rule hover:border-ink'
                        }`}
                      >
                        {count}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    aria-pressed={withMrWhite}
                    onClick={() => setWithMrWhite((prev) => !prev)}
                    className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold cursor-pointer transition-colors ${
                      withMrWhite
                        ? 'bg-sun text-ink border border-sun-dark'
                        : 'bg-paper-muted text-ink-muted border border-rule hover:text-ink'
                    }`}
                  >
                    {withMrWhite ? 'Mr. White aktif' : '+ Mr. White'}
                  </button>
                </div>
              </div>

              {/* Middle: Animated scaleX Ratio Bars */}
              <div className="space-y-3 pt-4" aria-live="polite">
                {bars.map((bar) => (
                  <div key={bar.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-semibold text-ink">{bar.label}</span>
                      <span className={`lp-code font-bold ${bar.textClass}`}>
                        {bar.count} orang
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-paper-muted overflow-hidden border border-rule">
                      <motion.div
                        className={`h-full w-full rounded-full origin-left ${bar.fillClass}`}
                        initial={false}
                        animate={{ scaleX: bar.count === 0 ? 0 : Math.max(0.04, bar.ratio) }}
                        transition={barTransition}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom: Interactive Role Guide Tabs */}
              <div className="pt-4 space-y-3.5">
                <div
                  role="tablist"
                  aria-label="Penjelasan peran"
                  className="grid grid-cols-3 gap-1 p-1 rounded-full bg-paper-muted border border-rule"
                >
                  {ROLE_GUIDES.map((role) => {
                    const isActive = role.id === activeRoleId;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveRoleId(role.id)}
                        className={`relative px-2 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                          isActive ? 'text-ink' : 'text-ink-muted hover:text-ink'
                        }`}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="role-tab-pill"
                            transition={barTransition}
                            className="absolute inset-0 rounded-full bg-cardstock border border-rule shadow-print-sm"
                            aria-hidden="true"
                          />
                        )}
                        <span className="relative z-10">{role.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div role="tabpanel" className="p-3.5 rounded-2xl bg-paper border border-rule space-y-1.5">
                  <p className="text-xs sm:text-sm text-ink font-semibold leading-relaxed">
                    {activeRole.goal}
                  </p>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    Tips meja: {activeRole.clueTip}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live /anatomy Isometric Machine (7 cols) */}
          <div className="lg:col-span-7 flex justify-center w-full">
            <RoleDispenserFigure
              controlledPlayers={players}
              onPlayersChange={setPlayers}
              hidePresetButtons
              withMrWhite={withMrWhite}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SetupMechanismSection;
