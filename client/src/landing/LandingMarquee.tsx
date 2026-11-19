import React from 'react';
import { MARQUEE_ITEMS } from './content';

export const LandingMarquee: React.FC = () => {
  const repeated = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div className="lp-marquee-wrap" aria-label="Ringkasan fitur What's The Word">
      <div className="lp-marquee-track">
        {repeated.map((item, idx) => (
          <React.Fragment key={`${item}-${idx}`}>
            <span className="font-display font-bold text-sm sm:text-base text-ink whitespace-nowrap">
              {item}
            </span>
            <span className="text-ink-faint text-sm select-none" aria-hidden="true">
              /
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default LandingMarquee;
