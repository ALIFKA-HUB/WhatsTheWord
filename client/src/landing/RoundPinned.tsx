import React, { useEffect, useRef, useState } from 'react';
import { ROUND_STEPS } from './content';

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
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const elements = stepRefs.current.filter((el): el is HTMLDivElement => el !== null);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-step-index'));
            if (!Number.isNaN(index)) {
              setActiveStep(index);
            }
          }
        }
      },
      {
        rootMargin: '-20% 0px -40% 0px',
        threshold: 0.2,
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    const target = stepRefs.current[index];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const currentStep = ROUND_STEPS[activeStep];

  return (
    <section
      id="ronde"
      data-landing-section
      className="lp-screen lp-round"
      aria-label="Satu ronde permainan"
    >
      <div className="lp-container">
        <div className="max-w-2xl mb-8 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-paper-2 border border-rule rounded-full text-xs font-medium text-ink-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-mint" />
            <span>Alur permainan 5 menit</span>
          </div>
          <h2 className="lp-head text-ink text-2xl sm:text-3xl md:text-4xl mb-4">
            Satu ronde permainan.
          </h2>
          <p className="text-base sm:text-lg text-ink-2">
            Empat langkah singkat dari kartu rahasia sampai tebakan terakhir.
          </p>
        </div>

        {/* Mobile & Tablet Interactive Stepper (<lg) */}
        <div className="lg:hidden mb-12">
          {/* Step Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar" role="tablist" aria-label="Langkah permainan">
            {ROUND_STEPS.map((step, idx) => {
              const isSelected = activeStep === idx;
              return (
                <button
                  key={step.step}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveStep(idx)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-ink text-paper'
                      : 'bg-paper-2 text-ink border border-rule hover:border-ink'
                  }`}
                >
                  <span className={isSelected ? 'text-mint' : 'text-ink-muted'}>{step.step}</span>
                  <span>{step.title}</span>
                </button>
              );
            })}
          </div>

          {/* Single Focused Device Preview on Mobile */}
          <div className="lp-tabletop-mat p-4 max-w-[320px] mx-auto mb-6">
            <div className="relative aspect-[780/1688] w-full overflow-hidden bg-paper rounded-xl border border-rule">
              {ROUND_STEPS.map((step, idx) => {
                const img = SCREEN_IMAGES[step.screen];
                const isCurrent = activeStep === idx;
                return (
                  <img
                    key={step.step}
                    src={img.src}
                    alt={img.alt}
                    width={780}
                    height={1688}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${
                      isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                  />
                );
              })}
            </div>
            <div className="mt-3 text-center">
              <span className="lp-code text-[11px] text-ink-muted">
                Langkah {currentStep.step} dari 04 · {currentStep.title}
              </span>
            </div>
          </div>

          {/* Step Detail Card */}
          <div className="lp-plate p-5 bg-paper-2 border-2 border-ink max-w-[420px] mx-auto text-left">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="font-display font-bold text-2xl text-ink leading-none">
                {currentStep.step}
              </span>
              <h3 className="font-display font-bold text-lg text-ink">
                {currentStep.title}
              </h3>
            </div>
            <p className="text-sm text-ink-2 leading-relaxed">
              {currentStep.desc}
            </p>
          </div>
        </div>

        {/* Desktop Layout (lg:) */}
        <div className="hidden lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-16 items-start">
          {/* Left Column: Pinned mockup on desktop */}
          <div className="sticky top-28 self-start">
            <div className="lp-tabletop-mat p-5 border-2 border-ink max-w-[340px] mx-auto shadow-card">
              <div className="relative aspect-[780/1688] w-full overflow-hidden bg-paper rounded-xl border border-rule">
                {ROUND_STEPS.map((step, idx) => {
                  const img = SCREEN_IMAGES[step.screen];
                  const isActive = activeStep === idx;
                  return (
                    <img
                      key={step.step}
                      src={img.src}
                      alt={img.alt}
                      width={780}
                      height={1688}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${
                        isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                      }`}
                      loading={idx === 0 ? 'eager' : 'lazy'}
                    />
                  );
                })}
              </div>
              <div className="mt-4 text-center">
                <span className="lp-code text-xs text-ink-muted">
                  Langkah {ROUND_STEPS[activeStep].step} dari 04: {ROUND_STEPS[activeStep].title}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: 4 numbered steps */}
          <div className="flex flex-col gap-12 sm:gap-16">
            {ROUND_STEPS.map((step, index) => {
              const isActive = activeStep === index;

              return (
                <div
                  key={step.step}
                  ref={(el) => {
                    stepRefs.current[index] = el;
                  }}
                  data-step-index={index}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleStepClick(index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleStepClick(index);
                    }
                  }}
                  className={`lp-round-step text-left cursor-pointer transition-colors p-6 rounded-xl border-l-4 ${
                    isActive
                      ? 'border-ink bg-paper-2 shadow-sm'
                      : 'border-rule hover:border-ink-2 bg-transparent'
                  }`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <div className="flex items-baseline gap-4 mb-2">
                    <span className={`font-display font-bold text-3xl sm:text-4xl leading-none ${isActive ? 'text-ink' : 'text-ink-muted'}`}>
                      {step.step}
                    </span>
                    <h3 className="font-display font-bold text-xl sm:text-2xl text-ink">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-base sm:text-lg text-ink-2 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoundPinned;
