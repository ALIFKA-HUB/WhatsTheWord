/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Hallmark Hum comfortable paper & card-stock palette (wired to :root tokens) */
        paper: {
          DEFAULT: 'var(--color-paper)',
          muted: 'var(--color-paper-2)',
          dark: 'var(--color-paper-3)',
        },
        cardstock: {
          DEFAULT: 'var(--color-card)',
          warm: 'var(--color-paper-2)',
        },
        ink: {
          DEFAULT: 'var(--color-ink)',
          muted: 'var(--color-muted)',
          faint: 'var(--color-ink-faint)',
        },
        rule: 'var(--color-rule)',
        stamp: {
          DEFAULT: 'var(--color-accent-3)',
          dark: 'var(--color-stamp-deep)',
          light: 'var(--color-stamp-soft)',
        },
        teal: {
          DEFAULT: 'var(--color-mint)',
          dark: 'var(--color-mint-deep)',
          light: 'var(--color-mint-soft)',
        },
        sun: {
          DEFAULT: 'var(--color-accent)',
          dark: 'var(--color-accent-deep)',
          light: 'var(--color-sun-soft)',
        },
      },
      fontFamily: {
        sans: ['var(--font-body)'],
        display: ['var(--font-display)'],
        mono: ['var(--font-outlier)'],
      },
      boxShadow: {
        'print-sm': 'var(--shadow-sm)',
        'print': 'var(--shadow-card)',
        'print-lg': 'var(--shadow-lg)',
        'print-red': 'var(--shadow-coral)',
        'print-teal': 'var(--shadow-teal)',
        'print-inset': 'var(--shadow-inset-teal)',
        'flap': 'var(--shadow-flap)',
        'push-teal': 'var(--shadow-push-teal)',
        'push-coral': 'var(--shadow-push-coral)',
        'push-navy': 'var(--shadow-push-navy)',
        'push-sun': 'var(--shadow-push-sun)',
        'push-card': 'var(--shadow-push-card)',
      },
    },
  },
  plugins: [],
};
