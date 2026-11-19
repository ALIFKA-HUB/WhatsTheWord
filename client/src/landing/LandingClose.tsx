import React from 'react';

export interface LandingCloseProps {
  onPlayLocal: () => void;
  onPlayOnline: () => void;
}

export const LandingClose: React.FC<LandingCloseProps> = ({ onPlayLocal, onPlayOnline }) => {
  return (
    <section className="lp-screen py-16 sm:py-24" aria-label="Penutup">
      <div className="lp-container">
        <div className="lp-plate p-6 sm:p-12 lg:p-14 bg-cardstock">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-10 lg:gap-14 items-center">
            <div className="flex flex-col items-start">
              <h2 className="lp-head text-ink text-3xl sm:text-4xl md:text-5xl mb-5">
                Kumpulkan teman. Satu HP cukup.
              </h2>
              <p className="text-ink-muted text-base sm:text-lg max-w-[44ch] mb-8 leading-relaxed">
                Tebak penyamar bersama teman kapan saja tanpa perlu unduh aplikasi atau daftar akun.
              </p>
              <div className="flex flex-col sm:flex-row gap-3.5 items-stretch sm:items-center w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onPlayLocal}
                  className="lp-btn lp-btn--primary min-h-[48px] w-full sm:w-auto"
                >
                  Main di satu HP
                </button>
                <button
                  type="button"
                  onClick={onPlayOnline}
                  className="lp-btn lp-btn--secondary min-h-[48px] w-full sm:w-auto"
                >
                  Buat room online
                </button>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="p-3 bg-paper-muted border border-rule rounded-3xl max-w-[300px] sm:max-w-[320px] w-full">
                <div className="relative h-[380px] sm:h-[420px] w-full overflow-hidden bg-paper rounded-2xl border border-rule">
                  <img
                    src="/landing/screens/home.png"
                    alt="Tampilan beranda permainan What's The Word di HP"
                    width={780}
                    height={1688}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingClose;
