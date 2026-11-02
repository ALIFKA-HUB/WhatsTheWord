import React from 'react';

export interface LandingPageProps {
  onPlayLocal: () => void;
  onPlayOnline: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onPlayLocal, onPlayOnline }) => {
  return (
    <div className="lp-root p-8 text-center">
      <h1 className="text-2xl font-bold">What's The Word</h1>
      <div className="flex gap-4 justify-center mt-4">
        <button type="button" onClick={onPlayLocal} className="px-4 py-2 bg-neutral-900 text-white rounded">
          Main di satu HP
        </button>
        <button type="button" onClick={onPlayOnline} className="px-4 py-2 border rounded">
          Buat room online
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
