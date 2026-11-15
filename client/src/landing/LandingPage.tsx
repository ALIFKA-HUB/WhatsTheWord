import React from 'react';
import '@fontsource/syne/700.css';
import '@fontsource-variable/onest';
import '@fontsource/jetbrains-mono/500.css';
import './landing.css';
import { LandingNav } from './LandingNav';
import { HeroDeal } from './HeroDeal';
import { BeforeAfter } from './BeforeAfter';
import { RoundPinned } from './RoundPinned';
import { ModeSwitcher } from './ModeSwitcher';
import { WordPackTable } from './WordPackTable';
import { LandingClose } from './LandingClose';
import { LandingFooter } from './LandingFooter';

export interface LandingPageProps {
  onPlayLocal: () => void;
  onPlayOnline: () => void;
  onOpenCustomPacks?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onPlayLocal,
  onPlayOnline,
  onOpenCustomPacks,
}) => {
  return (
    <div className="lp-root">
      <LandingNav onPlayLocal={onPlayLocal} onPlayOnline={onPlayOnline} />
      <main>
        <HeroDeal onPlayLocal={onPlayLocal} onPlayOnline={onPlayOnline} />
        <BeforeAfter />
        <RoundPinned />
        <ModeSwitcher onPlayLocal={onPlayLocal} onPlayOnline={onPlayOnline} />
        <WordPackTable onPlayOnline={onPlayOnline} onOpenCustomPacks={onOpenCustomPacks} />
        <LandingClose onPlayLocal={onPlayLocal} onPlayOnline={onPlayOnline} />
      </main>
      <LandingFooter onPlayLocal={onPlayLocal} />
    </div>
  );
};

export default LandingPage;
