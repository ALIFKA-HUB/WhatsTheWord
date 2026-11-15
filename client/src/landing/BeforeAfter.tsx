import React from 'react';
import { CheckCircle, XCircle } from '@phosphor-icons/react';
import { BEFORE_AFTER } from './content';

export const BeforeAfter: React.FC = () => {
  return (
    <section className="lp-screen lp-before-after" aria-label="Perbandingan cara main">
      <div className="lp-container">
        <h2 className="lp-head text-ink text-2xl sm:text-3xl md:text-4xl mb-8 sm:mb-12">
          {BEFORE_AFTER.head}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          <div className="lp-plate p-6 sm:p-8 flex flex-col justify-between bg-paper-2">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-ink-muted mb-3">
                <XCircle className="w-4 h-4 text-ink-muted shrink-0" weight="bold" />
                <span>{BEFORE_AFTER.before.label}</span>
              </div>
              <p className="text-base sm:text-lg text-ink-2 leading-relaxed">
                {BEFORE_AFTER.before.desc}
              </p>
            </div>
          </div>
          <div className="lp-plate p-6 sm:p-8 flex flex-col justify-between border-l-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-ink mb-3">
                <CheckCircle className="w-4 h-4 text-ink shrink-0" weight="bold" />
                <span>{BEFORE_AFTER.after.label}</span>
              </div>
              <p className="text-base sm:text-lg text-ink leading-relaxed font-medium">
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
