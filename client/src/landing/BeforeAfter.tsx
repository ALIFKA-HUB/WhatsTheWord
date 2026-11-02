import React from 'react';
import { BEFORE_AFTER } from './content';

export const BeforeAfter: React.FC = () => {
  return (
    <section className="lp-screen lp-before-after" aria-label="Perbandingan cara main">
      <div className="lp-container">
        <h2 className="lp-head text-ink text-2xl sm:text-3xl md:text-4xl mb-8 sm:mb-12">
          {BEFORE_AFTER.head}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          <div className="lp-plate p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="text-sm font-medium text-ink-muted mb-3">
                {BEFORE_AFTER.before.label}
              </div>
              <p className="text-base sm:text-lg text-ink-2 leading-relaxed">
                {BEFORE_AFTER.before.desc}
              </p>
            </div>
          </div>
          <div className="lp-plate p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="text-sm font-semibold text-ink mb-3">
                {BEFORE_AFTER.after.label}
              </div>
              <p className="text-base sm:text-lg text-ink leading-relaxed">
                {BEFORE_AFTER.after.desc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BeforeAfter;
