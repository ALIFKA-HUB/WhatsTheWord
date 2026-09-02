/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        void: '#080c16',
        surface: {
          DEFAULT: 'rgba(15, 23, 42, 0.82)',
          glass: 'rgba(15, 23, 42, 0.82)',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        cyber: {
          cyan: '#06b6d4',
          crimson: '#f43f5e',
          violet: '#a855f7',
          amber: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Cabinet Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Geist Mono', 'monospace'],
        display: ['Outfit', 'Cabinet Grotesk', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -5px rgba(6, 182, 212, 0.5)',
        'glow-crimson': '0 0 20px -5px rgba(244, 63, 94, 0.5)',
        'glow-violet': '0 0 20px -5px rgba(168, 85, 247, 0.5)',
      },
    },
  },
  plugins: [],
}
