/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Playful Pop palette */
        paper: {
          DEFAULT: '#FFF8EE',   /* warm cream page background */
          muted: '#F3ECE0',
          dark: '#EAE2D2',
        },
        cardstock: {
          DEFAULT: '#FFFFFF',   /* white card surfaces */
          warm: '#FFF4E3',
        },
        ink: {
          DEFAULT: '#243348',   /* deep friendly navy (text) */
          muted: '#55677E',
          faint: '#8A97A8',
        },
        rule: '#EAE4D8',        /* soft hairlines */
        stamp: {
          DEFAULT: '#FF6B6B',   /* coral - impostor / danger / accent */
          dark: '#C03333',
          light: '#FFE9E9',
        },
        teal: {
          DEFAULT: '#4ECDC4',   /* primary action */
          dark: '#237B74',
          light: '#E0F7F5',
        },
        sun: {
          DEFAULT: '#FFC94A',   /* yellow accent - host / mr. white */
          dark: '#E8AE2E',
          light: '#FFF3D6',
        },
      },
      fontFamily: {
        sans: ['"Nunito Variable"', 'Nunito', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"Nunito Variable"', 'Nunito', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        /* soft colored shadows - no hard offsets */
        'print-sm': '0 2px 8px rgba(36, 51, 72, 0.08)',
        'print': '0 6px 18px rgba(36, 51, 72, 0.10)',
        'print-lg': '0 12px 30px rgba(36, 51, 72, 0.14)',
        'print-red': '0 6px 18px rgba(255, 107, 107, 0.25)',
        'print-teal': '0 6px 18px rgba(78, 205, 196, 0.30)',
        'print-inset': 'inset 0 0 0 2px #4ECDC4',
        /* tactile push bottoms for pill buttons */
        'push-teal': '0 4px 0 0 #3AA9A2',
        'push-coral': '0 4px 0 0 #E55555',
        'push-navy': '0 4px 0 0 #16202F',
        'push-sun': '0 4px 0 0 #E8AE2E',
      },
    },
  },
  plugins: [],
};
