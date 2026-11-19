import React, { useState } from 'react';
import { ROUND_STEPS } from './content';
import { MiniRoundWidget } from './MiniRoundWidget';

const SCREEN_IMAGES: Record<string, { src: string; alt: string }> = {
  reveal: {
    src: '/landing/screens/reveal.png',
    alt: 'Layar tahan kartu untuk intip kata rahasia',
  },
  describe: {
    src: '/landing/screens/describe.png',
    alt: 'Layar giliran memberi petunjuk',
  },
  voting: {
    src: '/landing/screens/voting.png',
    alt: 'Layar voting mencari penyamar',
  },
  mrwhite: {
    src: '/landing/screens/mrwhite.png',
    alt: 'Layar tebakan kata oleh Mr. White',
  },
};

export const RoundPinned: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const currentStep = ROUND_STEPS[activeStep] ?? ROUND_STEPS[0]!;
  const currentImg = SCREEN_IMAGES[currentStep.screen] ?? SCREEN_IMAGES.reveal!;

  return (
    <section
      id="ronde"
      data-landing-section
      className="lp-screen lp-screen--band lp-round"
      aria-label="Alur satu ronde permainan"
    >
      <div className="lp-container">
        <div className="max-w-2xl mb-8 sm:mb-10">
          <h2 className="lp-head text-ink mb-3">
            Empat langkah tiap ronde.
          </h2>
          <p className="text-base sm:text-lg text-ink-muted max-w-[58ch]">
            Coba tebak penyamarnya lewat simulasi singkat di bawah, lalu jelajahi 4 tahapan ronde aslinya.
          </p>
        </div>

        {/* Playable 10-second Detective Mini-Round */}
        <MiniRoundWidget />

        {/* Balanced 2-Column Interactive Step & Screen Showcase Plate */}
        <div className="lp-plate p-5 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: 4 Interactive Steps (6 cols) */}
            <div className="lg:col-span-6 flex flex-col gap-3">
              {ROUND_STEPS.map((item, idx) => {
                const isActive = activeStep === idx;
                return (
                  <button
                    key={item.step}
                    type="button"
                    data-step-index={idx}
                    onClick={() => setActiveStep(idx)}
                    aria-current={isActive ? 'step' : undefined}
                    className={`lp-round-step text-left cursor-pointer transition-colors duration-200 p-4 sm:p-5 rounded-2xl border ${
                      isActive
                        ? 'bg-teal-light/40 border-teal-dark shadow-print-sm'
                        : 'bg-paper border-rule hover:border-ink-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`lp-code text-xs px-2.5 py-0.5 rounded-full font-bold ${
                            isActive ? 'bg-teal-dark text-cardstock' : 'bg-cardstock text-ink-muted border border-rule'
                          }`}
                        >
                          {item.step}
                        </span>
                        <h3 className="font-display font-bold text-base sm:text-lg text-ink">
                          {item.title}
                        </h3>
                      </div>
                      {isActive && (
                        <span className="text-xs font-bold text-teal-dark">Aktif</span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-ink-muted leading-relaxed pl-9">
                      {item.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Proportioned App Screen Preview (6 cols) */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="p-3 sm:p-4 bg-paper-muted border border-rule rounded-3xl max-w-[300px] sm:max-w-[320px] w-full">
                <div className="flex items-center justify-between text-xs text-ink-muted mb-2.5 px-1">
                  <span className="lp-code font-bold text-ink">Tahap {currentStep.step}/04</span>
                  <span>{currentStep.title}</span>
                </div>

                <div className="relative h-[420px] sm:h-[460px] w-full overflow-hidden rounded-2xl border border-rule bg-paper">
                  {ROUND_STEPS.map((item, idx) => {
                    const img = SCREEN_IMAGES[item.screen] ?? currentImg;
                    const visible = activeStep === idx;
                    return (
                      <img
                        key={item.screen}
                        src={img.src}
                        alt={img.alt}
                        width={780}
                        height={1688}
                        loading={idx === 0 ? 'eager' : 'lazy'}
                        aria-hidden={!visible}
                        className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-200 ${
                          visible ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoundPinned;
