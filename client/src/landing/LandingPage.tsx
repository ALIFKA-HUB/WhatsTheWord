import React from 'react';
import '@fontsource/syne/700.css';
import '@fontsource-variable/onest';
import '@fontsource/jetbrains-mono/500.css';
import './landing.css';
import { LandingNav } from './LandingNav';
import { HeroDeal } from './HeroDeal';

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
      </main>
    </div>
  );
};

export default LandingPage;
