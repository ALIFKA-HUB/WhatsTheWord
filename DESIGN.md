# What's The Word - Master DESIGN.md

> **Design direction chosen by user (2026-11-01): "B - Playful Pop".** Neo-brutalism and dark-SaaS aesthetics are both explicitly rejected. See `docs/superpowers/plans/2026-10-30-tactile-boardgame-ui-redesign.md` for history.

## Design Language: Playful Pop

Mobile-first party deduction game with a friendly, energetic candy palette (Headspace / Jackbox / Duolingo family). Dials: `DESIGN_VARIANCE: 6`, `MOTION_INTENSITY: 6` (spring physics), `VISUAL_DENSITY: 4`.

## Core Visual Tokens (`client/tailwind.config.js`)

- **Palette (strict)**:
  - Page background: `#FFF8EE` warm cream (`paper`), muted `#F3ECE0`
  - Card surfaces: `#FFFFFF` (`cardstock`), warm `#FFF4E3`
  - Text: `#243348` deep friendly navy (`ink`), muted `#7C8AA0`, faint `#A8B2C1`
  - Hairlines: `#EAE4D8` (`rule`) - cards are defined by soft shadows, NOT heavy borders
  - Coral `#FF6B6B` (`stamp`) - impostor / danger / attention
  - Teal `#4ECDC4` (`teal`) - primary actions, selection
  - Yellow `#FFC94A` (`sun`) - host / mr. white accents
- **Typography**: `Nunito Variable` (self-hosted, 400-900) everywhere; headings use `.font-condensed` (900 weight, tight, NOT uppercase-condensed); `JetBrains Mono` only for codes/labels.
- **Shadows**: soft spread (`0 6px 18px rgba(36,51,72,.10)`) for cards; pill buttons use playful push-bottom (`shadow-push-teal/coral/navy`, `active:translate-y-[3px] active:shadow-none`).
- **Shape**: generous radii (`rounded-2xl`/`rounded-3xl` cards, `rounded-full` pills).

## Identity

- **Logo "Kartu Bicara"** (`client/public/logo.svg` = favicon): white card + coral speech bubble, navy ink, teal halftone dots. Appears ONLY in Header + favicon; the HomePage masthead is typographic.

## Component Rules

- Cards: `bg-cardstock border border-rule shadow-print` (no glassmorphism, no hard offsets, no thick borders).
- Buttons: pill, extrabold, colored push-bottom; selection state = teal.
- Avatars: `PlayerToken` (12 geometric shapes, codes 01-12, initials, soft dots); legacy emoji maps via `resolveTokenAvatar`.
- Icons: `@phosphor-icons/react` (weight `bold`), zero `lucide-react`.
- Illustrations: 2-color flat SVGs in navy + coral/teal (`client/public/assets/*.svg`).
- Viewport: `min-h-[100dvh]`, mobile-first; honor `prefers-reduced-motion`.
- Zero em-dashes in visible strings. Eyebrow restraint: max 1 mono uppercase label per 3 sections.
- Regression guard: `client/src/tests/AntiSlopPreFlight.test.ts` fails on lucide imports, em-dashes, dark neon classes, `backdrop-blur-md`.
