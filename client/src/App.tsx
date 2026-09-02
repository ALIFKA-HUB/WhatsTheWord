import React from 'react';

export const App: React.FC = () => {
  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center p-4 bg-[#080c16] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="w-full max-w-md p-6 rounded-2xl glass-panel shadow-2xl text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-violet-400 to-rose-400 bg-clip-text text-transparent font-display">
          What's The Word
        </h1>
        <p className="text-sm text-slate-400 font-sans">
          Undercover Word Deduction Game Monorepo Initialized.
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          Ready for Task 2
        </div>
      </div>
    </main>
  );
};

export default App;
