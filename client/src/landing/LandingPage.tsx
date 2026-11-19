import React from 'react';
import './landing.css';
import { LandingNav } from './LandingNav';
import { HeroDeal } from './HeroDeal';
import { LandingMarquee } from './LandingMarquee';
import { SetupMechanismSection } from './SetupMechanismSection';
import { RoundPinned } from './RoundPinned';
import { ModeSwitcher } from './ModeSwitcher';
import { WordPackShowcase } from './WordPackShowcase';
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
        <LandingMarquee />
        <SetupMechanismSection />
        <RoundPinned />
        <ModeSwitcher onPlayLocal={onPlayLocal} onPlayOnline={onPlayOnline} />
        <WordPackShowcase onPlayOnline={onPlayOnline} />
        <LandingClose onPlayLocal={onPlayLocal} onPlayOnline={onPlayOnline} />
      </main>
      <LandingFooter onPlayLocal={onPlayLocal} />
    </div>
  );
};

export default LandingPage;
