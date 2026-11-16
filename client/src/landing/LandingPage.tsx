import React from 'react';
import '@fontsource/syne/700.css';
import '@fontsource-variable/onest';
import '@fontsource/jetbrains-mono/500.css';
import './landing.css';
import { LandingNav } from './LandingNav';
import { HeroDeal } from './HeroDeal';
import { BeforeAfter } from './BeforeAfter';
import { RoleDispenserFigure } from './anatomy/RoleDispenserFigure';
import { RoundPinned } from './RoundPinned';
import { ModeSwitcher } from './ModeSwitcher';
import { WordPackTable } from './WordPackTable';
import { LandingClose } from './LandingClose';
import { LandingFooter } from './LandingFooter';

export interface LandingPageProps {
  onPlayLocal: () => void;
  onPlayOnline: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onPlayLocal, onPlayOnline }) => {
  return (
    <div className="lp-root">
      <LandingNav onPlayLocal={onPlayLocal} onPlayOnline={onPlayOnline} />
      <main>
        <HeroDeal onPlayLocal={onPlayLocal} onPlayOnline={onPlayOnline} />
        <BeforeAfter />

        {/* Anatomy Interactive Role Dispenser Machine */}
        <section className="lp-screen lp-screen--band py-12 sm:py-16" aria-label="Mesin pembagi peran isometric">
          <div className="lp-container">
            <div className="max-w-2xl mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-paper border border-rule rounded-full text-xs font-medium text-ink-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-mint" />
                <span>Instrumen interaktif</span>
              </div>
              <h2 className="lp-head text-ink text-2xl sm:text-3xl md:text-4xl mb-3">
                Mekanisme pembagian peran.
              </h2>
              <p className="text-base sm:text-lg text-ink-2">
                Eksplorasi cara kartu peran dibagikan secara acak dan rahasia lewat simulasi instrumen mekanis di bawah ini.
              </p>
            </div>

            <div className="flex justify-center w-full overflow-hidden">
              <RoleDispenserFigure />
            </div>
          </div>
        </section>

        <RoundPinned />
        <ModeSwitcher onPlayLocal={onPlayLocal} onPlayOnline={onPlayOnline} />
        <WordPackTable onPlayOnline={onPlayOnline} />
        <LandingClose onPlayLocal={onPlayLocal} onPlayOnline={onPlayOnline} />
      </main>
      <LandingFooter onPlayLocal={onPlayLocal} />
    </div>
  );
};

export default LandingPage;
