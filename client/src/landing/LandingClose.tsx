import React from 'react';

export interface LandingCloseProps {
  onPlayLocal: () => void;
  onPlayOnline: () => void;
}

export const LandingClose: React.FC<LandingCloseProps> = ({ onPlayLocal, onPlayOnline }) => {
  return (
    <section className="lp-screen lp-band--ink py-16 sm:py-24" aria-label="Penutup">
      <div className="lp-container">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-12 lg:gap-16 items-center">
          {/* Left Column: Head, Sentence, Actions */}
          <div className="flex flex-col items-start">
            <h2 className="lp-head text-paper text-3xl sm:text-4xl md:text-5xl mb-6">
              Kumpulkan teman. Satu HP cukup.
            </h2>
            <p className="text-paper text-base sm:text-lg opacity-90 max-w-[46ch] mb-8 leading-relaxed">
              Tebak penyamar bersama teman kapan saja tanpa perlu unduh aplikasi atau registrasi akun.
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <button
                type="button"
                onClick={onPlayLocal}
                className="lp-btn lp-btn--primary"
              >
                Main di satu HP
              </button>
              <button
                type="button"
                onClick={onPlayOnline}
                className="lp-btn lp-btn--secondary"
              >
                Buat room online
              </button>
            </div>
          </div>

          {/* Right Column: Home screenshot */}
          <div className="flex justify-center">
            <div className="lp-plate p-4 bg-paper-2 border-2 border-paper max-w-[340px] w-full shadow-card">
              <div className="relative aspect-[780/1688] w-full overflow-hidden bg-paper">
                <img
                  src="/landing/screens/home.png"
                  alt="Tampilan beranda permainan What's The Word di HP"
                  width={780}
                  height={2564}
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingClose;
