# What's The Word - Master DESIGN.md

> **Hallmark Redesign (2026-11-02): Theme "Hum" (`playful` / `light/rounded-sans/chromatic-yellow`).**
> Built for visual comfort, low eye strain, and calm tabletop readability.

## Design Language: Hallmark Hum (Warm Paper & Card Stock)

Mobile-first social deduction party game set on warm cream paper and tinted ivory card stock, with soft blue-black ink, calm sage-teal primary controls, warm pear-ochre highlights, and terracotta accents reserved strictly for Impostor/elimination states.

## Core Visual Tokens (`client/src/tokens.css` & `client/tailwind.config.js`)

- **Palette (OKLCH custom properties at `:root`)**:
  - Page background: `--color-paper: oklch(96.8% 0.011 95)` (`paper`), `--color-paper-2: oklch(94.2% 0.016 95)` (`paper-muted`), `--color-paper-3: oklch(90.8% 0.02 95)` (`paper-dark`)
  - Card surfaces: `--color-card: oklch(98.6% 0.006 95)` (`cardstock`, warm ivory with zero `#FFFFFF` glare)
  - Text: `--color-ink: oklch(21% 0.016 255)` (`ink`), `--color-muted: oklch(46% 0.015 255)` (`ink-muted`), `--color-ink-faint: oklch(58% 0.014 255)` (`ink-faint`)
  - Hairlines: `--color-rule: oklch(87.5% 0.015 95)` (`rule`, 1px warm border)
  - Primary / Civilian / Selection (`teal`): `--color-mint: oklch(76% 0.115 166)`, deep `oklch(41% 0.095 166)`, soft `oklch(94.2% 0.026 166)`
  - Impostor / Danger (`stamp`): `--color-accent-3: oklch(64% 0.165 25)`, deep `oklch(43% 0.145 25)`, soft `oklch(94.5% 0.025 25)`
  - Host / Highlight / Mr. White (`sun`): `--color-accent: oklch(85% 0.145 92)`, deep `oklch(52% 0.12 85)`, soft `oklch(95% 0.035 95)`
- **Typography**:
  - Display & Body (`--font-display` / `--font-body`): `Chillax`, `Nunito Variable`, rounded sans-serif.
  - Labels, badges, and buttons: sentence case in the body face, untracked (never tracked uppercase `font-mono` eyebrows).
  - Monospace (`--font-outlier`): `JetBrains Mono` reserved strictly for 4-letter room codes and tabular timers/counts.
- **Surfaces & Controls**:
  - Cards: `rounded-3xl bg-cardstock border border-rule shadow-print` (straight alignment, no tilted cards, no heavy 2px dark borders).
  - Buttons: pill (`rounded-full`), tactile card-stock push edges (`shadow-push-teal`, `shadow-push-card`, `shadow-push-coral`).
  - Motion: explicit property transitions (`transition-colors`, `transition-transform`, `transition-opacity`), never `transition-all` or layout-thrashing width animations.
