# Hero Section Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the landing page Hero (`HeroDeal.tsx`), quiet the top navbar CTA (`LandingNav.tsx`), and refine hero layout/card styling (`landing.css`, `content.ts`) so desktop (`1280x800`, `1440x900`) and mobile (`390x844`) pass Hallmark Floor/Reflex/Finish gates and `design-taste-frontend` pre-flight standards with zero card clipping or inverted typography hierarchy.

**Architecture:** Preserve all existing Hum tokens (`client/src/tokens.css`, `DESIGN.md`), `App.tsx` routing (`onPlayLocal`, `onPlayOnline`), and sections below the hero (`LandingMarquee` through `LandingFooter`). Recompose the Hero into an asymmetric `5fr / 7fr` desktop Stage inside `clamp(660px, calc(100dvh - 72px), 808px)`, upscale `<h1>` above `<h2>` (`48-54px` vs `45.6px`), flatten the 4-layer nested cards into single-layer Hum cardstock cards aligned with `SecretCard.tsx`, remove decorative clutter (`HERO.facts` strip, `CardBackCrest` SVG, `F5` icon coins, middle dot), and make the nav CTA secondary to the Hero's sole primary CTA.

**Tech Stack:** React 18, TypeScript, Tailwind CSS v3 (`client/tailwind.config.js`), `motion/react` v12 (`animate`, `useReducedMotion`), `@phosphor-icons/react`, Vitest.

## Design Read, Dials & Hallmark Picks

- **Design Read (`design-taste-frontend`):** Reading this as: Consumer social party-game landing hero for Indonesian friend groups, with a warm tactile Hum tabletop language, leaning toward Hallmark Hum (`DESIGN.md` + `client/src/tokens.css` + Tailwind utilities + `Chillax` / `Nunito Variable` + `motion/react` `--ease-snap` choreography).
- **The Three Dials:**
  - `DESIGN_VARIANCE: 7` (Asymmetric desktop `5fr / 7fr` Stage split collapsing cleanly to single column `< 1024px`; varied card scatter poses)
  - `MOTION_INTENSITY: 6` (Snappy `--ease-snap` deal settle starting from visible opacity, single hover transform/shadow signal per card, tactile press feedback, `prefers-reduced-motion` guarded)
  - `VISUAL_DENSITY: 4` (Airy tabletop spacing, 3 clean text elements in hero copy column, flattened single-layer cardstock geometry)

**Hallmark · v2.0.0**
- **Redesign** · targeted `hero + nav` (`Stage` posture) on `/` (`client/src/landing/HeroDeal.tsx`, `LandingNav.tsx`, `landing.css`, `content.ts`)
- **Before (Measured via Playwright at `1280x800`, `1440x900`, `390x844`):**
  - Inverted hierarchy: `.lp-hero-head` renders at `32px` (`1280px`) / `36px` (`1440px`), smaller than the `45.6px` `<h2>` directly below the marquee.
  - Fold timing failure (Gate `44c`, `79`): at `1440x900`, `.lp-hero` ends at `y=630.86px` (`130px` above the `760-900px` Stage window), slicing Section 2's `<h2>` horizontally across the bottom edge of `1280x800`.
  - Duplicate primary CTA (`F4`): `LandingNav` and `HeroDeal` both render identical filled teal `.lp-btn--primary` pills above the fold; Hero primary (`49.33px`) and secondary (`52.00px`) CTAs also mismatch in height (`39a`, `F12`).
  - Left-column micro-strip (`taste-skill` §4.7, Gate `69`): `HERO.facts` wraps to an orphan second line (`Tanpa perlu akun`) and duplicates `LandingMarquee`.
  - Card defects: 4-layer nested borders (`Floor #4`), `F5` circular icon coins, Gate `80` `72px` hand-rolled `CardBackCrest` SVG, `·` middle dot in `Minuman · mkn-01` (`Floor #10`), **mobile `390x844` `Penyamar` badge right-edge clipping** (`whiteSpace: 'nowrap'` inside `129px` inner width), oversized `rounded-full` dock wrapping on mobile, and overshoot bounce `[0.34, 1.56, 0.64, 1]` on card deals (`hum.md` / Gate `12`).
- **Keeps** · `HeroDealProps` (`onPlayLocal`, `onPlayOnline`), `LandingNavProps`, `HERO` Indonesian copy (`"Satu kata beda. Siapa penyamarnya?"`, `"Game tebak penyamar untuk 3 sampai 20 teman, cukup satu HP."`), all 4 interactive dock actions (`Bagikan ulang`, `Intip semua`/`Tutup semua`, `Ganti kata`, `Mr. White`), `useCardTimeline` contract, and all sections below `.lp-hero`.
- **Files** · edit: `client/src/landing/content.ts`, `client/src/landing/LandingNav.tsx`, `client/src/landing/landing.css`, `client/src/landing/HeroDeal.tsx`, `client/src/tests/LandingSections.test.ts` · create: none · delete: none.
- **Theme** · `Hum` (locked in `DESIGN.md` — warm cream paper `--color-paper`, ivory `--color-card`, blue-black `--color-ink`, sage-teal `--color-mint-deep`, pear-ochre `--color-accent`, terracotta `--color-accent-3`, `Chillax` + `JetBrains Mono`).
- **Hero & Signature** · Asymmetric `5.4fr / 6.6fr` `Stage` fitting inside `1280x800` and landing marquee between `760px-900px` at `1440x900`; single-layer `Meja Kartu Rahasia` cards with `SecretCard`-style top thumb notch + responsive `rounded-2xl sm:rounded-full` control dock.

## Global Constraints

- **No `:root` redeclaration** in `client/src/landing/tokens.css` or `base.css`; all colours and font families must reference existing CSS custom properties or Tailwind theme tokens (`Gate 48`, `LandingTokens.test.ts`).
- **Zero `transition: all` / `transition-all`** and zero animations on `width`, `height`, `top`, `left` (`Floor #2`, `Gate 10a`, `LandingPage.test.ts`).
- **Zero em-dashes (`—`), en-dashes (`–`), eyebrows, `uppercase`, `tracking-widest`, `Sparkle` icons, or middle dots (`·`)** (`Floor #9`, `Floor #10`, `AntiSlopPreFlight.test.ts`, `LandingPage.test.ts`).
- **Hero word & stack budget:** Headline `<= 7` words (`<= 50` chars), subtext `<= 12` words, max 3 text groups in copy column (headline, sentence, 2 equal-height CTAs), `padding-top` `<= 96px` (`pt-24`).
- **Accessibility & reduced motion:** Instant `:focus-visible` ring (`3px solid var(--color-focus)`), `min-h-[44px]` touch targets on mobile dock controls, `prefers-reduced-motion: reduce` disables motion cleanly, cards stay visible at rest (`opacity` never starts at `0` without fallback — `Gate 62`).
- **Verification baseline:** `npm test --workspace=client` (8 files, 42 tests), `npm run typecheck`, `npm run build:client`, and `node C:\Users\ASUS\.gemini\config\skills\hallmark\scripts\sloplint.mjs client\src\landing --genre playful` must all pass cleanly, followed by live browser inspection at `1280x800`, `1440x900`, and `390x844`.

---

### Task 1: Add Failing Structural Tests for the Redesigned Hero & Quiet Nav

**Files:**
- Modify: `client/src/tests/LandingSections.test.ts:10-16`

**Interfaces:**
- Consumes: `client/src/landing/HeroDeal.tsx`, `client/src/landing/LandingNav.tsx`, `client/src/landing/landing.css`, `client/src/landing/content.ts`
- Produces: Structural assertions verifying removal of `HERO.facts`, `CardBackCrest`, `lp-deal-card-inner`, middle dots in hero, nav primary button duplication, and `h1` scale dominance in `landing.css`.

- [ ] **Step 1: Update `LandingSections.test.ts` with the Hero & Nav contract assertions**

Modify lines `10-16` in `client/src/tests/LandingSections.test.ts` to test both the interactive hero features and the redesign fixes:

```ts
  it('HeroDeal includes interactive control dock, flattened cards, and clean Hum markup', () => {
    const src = read('HeroDeal.tsx');
    const navSrc = read('LandingNav.tsx');
    const cssSrc = read('landing.css');
    const contentSrc = read('content.ts');

    expect(src).toContain('Bagikan ulang');
    expect(src).toContain('Ganti kata');
    expect(src).toContain('Mr. White');
    expect(src).not.toContain('w-2 h-2 rounded-full');
    expect(src).not.toContain('CardBackCrest');
    expect(src).not.toContain('HERO.facts');
    expect(src).not.toContain('lp-deal-card-inner');
    expect(src).not.toContain('\u00b7');
    expect(src).not.toContain("whiteSpace: 'nowrap'");
    expect(contentSrc).not.toContain('facts:');
    expect(navSrc).toContain('lp-btn--nav');
    expect(navSrc).not.toContain('lp-btn--primary');
    expect(cssSrc).toContain('.lp-btn--nav');
    expect(cssSrc).toContain('100dvh');
  });
```

- [ ] **Step 2: Run the test suite to verify the new assertions fail**

Run: `npm test --workspace=client -- src/tests/LandingSections.test.ts`
Expected: FAIL on `LandingSections.test.ts` because `HeroDeal.tsx` still contains `CardBackCrest`, `HERO.facts`, `lp-deal-card-inner`, `\u00b7`, and `whiteSpace: 'nowrap'`, `content.ts` still contains `facts:`, `LandingNav.tsx` still uses `lp-btn--primary`, and `landing.css` lacks `.lp-btn--nav` and `100dvh`.

- [ ] **Step 3: Commit the failing test update (optional WIP checkpoint or defer commit until Task 5 green)**

> Note: Wait until Task 5 passes before committing if you prefer atomic green commits; otherwise run:
```bash
git add client/src/tests/LandingSections.test.ts
git commit -m "test(landing): add structural assertions for hero redesign and quiet nav"
```

---

### Task 2: Clean Up `content.ts` and Quiet `LandingNav.tsx`

**Files:**
- Modify: `client/src/landing/content.ts:3-9`
- Modify: `client/src/landing/LandingNav.tsx:74-80`

**Interfaces:**
- Produces:
  - `HERO` object in `client/src/landing/content.ts` exporting `{ title, sentence, primary, secondary }` (without `facts`)
  - `LandingNav` component using `.lp-btn.lp-btn--nav` for the right header button while preserving `onPlayLocal` and label `'Main di satu HP'`.

- [ ] **Step 1: Remove `facts` from `HERO` in `client/src/landing/content.ts`**

Replace lines `3-9` of `client/src/landing/content.ts` with:

```ts
export const HERO = {
  title: 'Satu kata beda. Siapa penyamarnya?',
  sentence: 'Game tebak penyamar untuk 3 sampai 20 teman, cukup satu HP.',
  primary: 'Main di satu HP',
  secondary: 'Buat room online',
};
```

- [ ] **Step 2: Switch `LandingNav.tsx` CTA button to `.lp-btn--nav`**

Replace lines `74-80` of `client/src/landing/LandingNav.tsx` with:

```tsx
        <button
          type="button"
          onClick={onPlayLocal}
          className="lp-btn lp-btn--nav shrink-0"
        >
          Main di satu HP
        </button>
```

- [ ] **Step 3: Verify TypeScript compilation on `content.ts` and `LandingNav.tsx`**

Run: `npm run typecheck`
Expected: Fails only in `HeroDeal.tsx` (due to `HERO.facts` removal, which Task 4 removes) or passes once Task 4 lands; `LandingNav.tsx` and `content.ts` produce zero errors.

---

### Task 3: Redesign Hero Typography, Fold Sizing, Equal-Height CTAs, and Single-Layer Card CSS in `landing.css`

**Files:**
- Modify: `client/src/landing/landing.css:1-3,71-136,272-414`

**Interfaces:**
- Produces CSS classes consumed by `LandingNav.tsx` and `HeroDeal.tsx`:
  - `.lp-btn`, `.lp-btn--primary`, `.lp-btn--secondary`, `.lp-btn--nav`, `.lp-btn--sun` (matched `48px` height on hero CTAs, quiet `40px` card-stock push style on `.lp-btn--nav`)
  - `.lp-hero` (desktop `Stage` sizing via `min-height: clamp(660px, calc(100dvh - 72px), 808px)` with `display: flex; align-items: center;`, capped top padding `<= 56px`, mobile natural collapse `< 1024px`)
  - `.lp-root .lp-hero-head` (`font-size: clamp(2.05rem, 2.75vw + 0.85rem, 3.375rem); line-height: 1.06;` — reaches ~49px at 1280px and ~53-54px at 1440px, dominating the `45.6px` `<h2>` below while keeping `"Siapa penyamarnya?"` on 2 lines)
  - `.lp-hero-grid` (`grid-template-columns: minmax(0, 1fr)` mobile, `minmax(0, 5.4fr) minmax(0, 6.6fr)` at `>= 1024px` with `gap: clamp(2rem, 3.5vw, 3.5rem)`)
  - `.lp-tabletop-mat`, `.lp-deal-fan`, `.lp-deal-card`, `.lp-deal-card--closed`, `.lp-deal-card--warga`, `.lp-deal-card--penyamar`, `.lp-deal-card--mrwhite` (single-layer card surface without `.lp-deal-card-inner` nested border, zero `white-space: nowrap` on `.lp-deal-card`, semantic role push shadows, `aspect-ratio: 3 / 4.15` mobile and `3 / 4.35` desktop)
  - `.lp-hero-dock` and `.lp-dock-btn` (`rounded-2xl` 2x2 grid on mobile `< 640px` with `min-height: 44px` touch targets, `rounded-full` single-row capsule on `>= 640px`).

- [ ] **Step 1: Update the Hallmark stamp header in `client/src/landing/landing.css` (lines 1-3)**

Replace lines `1-3` of `client/src/landing/landing.css` with:

```css
/* Hallmark · shape: Asymmetric Tabletop Stage · genre: playful · theme: Hum (unified with DESIGN.md) · redesign: full · hero: Stage · nav: single-line slab · footer: signed tabletop · signature: interactive card table + control dock · v2.0.0 */
/* Hallmark · pre-emit critique: P9 H9 E9 S9 R9 V9 · weakest: H, upscaled hero h1 past section h2, unified 48px CTA heights, flattened 4-layer cards, and calibrated Stage fold height */
/* Hallmark · answered: lightweight snap motion and CSS marquee guarded behind prefers-reduced-motion and view timeline support; single primary CTA per page (F4) */
```

- [ ] **Step 2: Refine `.lp-btn` variants in `client/src/landing/landing.css` (lines 71-136)**

Replace lines `71-136` of `client/src/landing/landing.css` with:

```css
.lp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  min-height: 48px;
  padding: 0 var(--space-lg);
  font-family: var(--font-body);
  font-weight: 700;
  border-radius: var(--radius-pill);
  border: var(--rule-hair) solid transparent;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  touch-action: manipulation;
  transition: background-color var(--dur-micro) var(--ease-out), color var(--dur-micro) var(--ease-out), border-color var(--dur-micro) var(--ease-out), transform var(--dur-micro) var(--ease-out), box-shadow var(--dur-micro) var(--ease-out);
}

.lp-btn--primary {
  background: var(--color-mint-deep);
  color: var(--color-card);
  border-color: var(--color-mint-deep);
  box-shadow: var(--shadow-push-teal);
}

.lp-btn--primary:hover {
  background: var(--color-mint-deep-hover);
}

.lp-btn--secondary {
  background: var(--color-card);
  color: var(--color-ink);
  border-color: var(--color-rule);
  box-shadow: var(--shadow-push-card);
}

.lp-btn--secondary:hover {
  background: var(--color-paper-2);
  border-color: var(--color-edge);
}

.lp-btn--nav {
  min-height: 40px;
  padding: 0 var(--space-md);
  font-size: var(--text-sm);
  background: var(--color-card);
  color: var(--color-ink);
  border-color: var(--color-rule);
  box-shadow: var(--shadow-push-card);
}

.lp-btn--nav:hover {
  background: var(--color-paper-2);
  border-color: var(--color-edge);
}

.lp-btn--sun {
  background: var(--color-card);
  color: var(--color-ink);
  border-color: var(--color-accent-deep);
  box-shadow: var(--shadow-push-sun);
}

.lp-btn--sun:hover {
  background: var(--color-sun-hover);
}

.lp-btn:active {
  transform: translateY(2px);
  box-shadow: none;
}

.lp-btn:focus-visible,
.lp-root a:focus-visible,
.lp-root button:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 3px;
  transition: none;
}

.lp-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

- [ ] **Step 3: Update `.lp-tabletop-mat` and the Hero + Card Stage rules in `client/src/landing/landing.css`**

Replace lines `63-69` of `client/src/landing/landing.css` with:

```css
.lp-tabletop-mat {
  background-color: var(--color-paper-2);
  border: var(--rule-hair) solid var(--color-rule);
  border-radius: var(--radius-card);
  position: relative;
  box-shadow: inset 0 1px 0 var(--color-fringe);
}
```

And replace lines `272-414` of `client/src/landing/landing.css` with:

```css
/* Hero & Deal Signature (Stage posture) */
.lp-hero {
  padding-top: var(--space-lg);
  padding-bottom: var(--space-xl);
}

.lp-hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-xl);
  align-items: center;
}

@media (min-width: 1024px) {
  .lp-hero {
    min-height: clamp(660px, calc(100dvh - 72px), 808px);
    display: flex;
    align-items: center;
    padding-top: clamp(var(--space-lg), 3.5dvh, 3.25rem);
    padding-bottom: clamp(var(--space-xl), 4dvh, 3.5rem);
  }

  .lp-hero-grid {
    grid-template-columns: minmax(0, 5.4fr) minmax(0, 6.6fr);
    gap: clamp(var(--space-lg), 3.5vw, 3.5rem);
  }
}

.lp-root .lp-hero-head {
  font-size: clamp(2.05rem, 2.75vw + 0.85rem, 3.375rem);
  line-height: 1.06;
  max-width: 18ch;
}

.lp-lead {
  font-size: var(--text-lead);
  line-height: 1.5;
  color: var(--color-muted);
}

.lp-deal-table {
  position: relative;
  width: 100%;
}

.lp-deal-fan {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  position: relative;
  overflow: visible;
  padding-block: var(--space-xs);
  padding-inline: 2px;
}

.lp-deal-card {
  width: 100%;
  aspect-ratio: 3 / 4.15;
  padding: 10px 11px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: left;
  cursor: pointer;
  transform-origin: center bottom;
  position: relative;
  overflow: hidden;
  will-change: transform;
  touch-action: manipulation;
  user-select: none;
  border-radius: 18px;
  background: var(--color-card);
  border: var(--rule-hair) solid var(--color-rule);
  box-shadow: var(--shadow-push-card), var(--shadow-card);
  transform: translate(var(--fan-x, 0px), calc(var(--fan-y, 0px) + var(--lift-y, 0px))) rotate(calc(var(--fan-rot, 0deg) * 0.45));
  transition: translate var(--dur-short) var(--ease-snap), transform var(--dur-short) var(--ease-snap), box-shadow var(--dur-short) var(--ease-snap), border-color var(--dur-micro) var(--ease-out);
}

.lp-deal-card:hover {
  border-color: var(--color-ink);
  box-shadow: 0 5px 0 0 var(--color-edge), var(--shadow-card-hover);
  translate: 0 -4px;
}

.lp-deal-card:active {
  translate: 0 1px;
}

.lp-deal-card--closed {
  background-color: var(--color-card);
  background-image: var(--pattern-hatch);
  border-color: var(--color-rule);
  box-shadow: var(--shadow-push-card), var(--shadow-card);
}

.lp-deal-card--warga {
  background: var(--color-card);
  border-color: var(--color-mint-deep);
  box-shadow: var(--shadow-push-teal), var(--shadow-card);
}

.lp-deal-card--warga:hover {
  border-color: var(--color-mint-deep);
  box-shadow: 0 5px 0 0 var(--color-mint-deep), var(--shadow-card-hover);
}

.lp-deal-card--penyamar {
  background: var(--color-stamp-soft);
  border-color: var(--color-accent-3);
  box-shadow: var(--shadow-push-coral), var(--shadow-card);
}

.lp-deal-card--penyamar:hover {
  border-color: var(--color-stamp-deep);
  box-shadow: 0 5px 0 0 var(--color-stamp-deep), var(--shadow-card-hover);
}

.lp-deal-card--mrwhite {
  background: var(--color-sun-soft);
  border-color: var(--color-accent-deep);
  box-shadow: var(--shadow-push-sun), var(--shadow-card);
}

.lp-deal-card--mrwhite:hover {
  border-color: var(--color-accent-deep);
  box-shadow: 0 5px 0 0 var(--color-accent-deep), var(--shadow-card-hover);
}

@media (min-width: 640px) {
  .lp-deal-fan {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
    align-items: center;
    padding-block: 18px;
    padding-inline: 6px;
  }

  .lp-deal-card {
    aspect-ratio: 3 / 4.35;
    padding: 12px 13px;
    border-radius: 20px;
    transform: translate(var(--fan-x, 0px), calc(var(--fan-y, 0px) + var(--lift-y, 0px))) rotate(var(--fan-rot, 0deg));
  }
}

.lp-hero-dock {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  padding: 6px;
  width: 100%;
  border-radius: var(--radius-stock);
  background: var(--color-card);
  border: var(--rule-hair) solid var(--color-rule);
  box-shadow: var(--shadow-card);
}

.lp-dock-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 44px;
  padding: 0 12px;
  border-radius: 12px;
  border: var(--rule-hair) solid transparent;
  font-size: var(--text-xs);
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color var(--dur-micro) var(--ease-out), color var(--dur-micro) var(--ease-out), border-color var(--dur-micro) var(--ease-out), transform var(--dur-micro) var(--ease-out);
}

.lp-dock-btn:active {
  transform: translateY(1px);
}

@media (min-width: 640px) {
  .lp-hero-dock {
    display: inline-flex;
    flex-wrap: wrap;
    width: auto;
    border-radius: var(--radius-pill);
  }

  .lp-dock-btn {
    min-height: 40px;
    padding: 0 14px;
    border-radius: var(--radius-pill);
  }
}

.lp-deal-cover {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
}
```

- [ ] **Step 4: Inspect CSS syntax with `sloplint.mjs`**

Run: `node C:\Users\ASUS\.gemini\config\skills\hallmark\scripts\sloplint.mjs client\src\landing\landing.css --genre playful`
Expected: `0 FAIL, 0 REFLEX` on `landing.css` (zero literal colours, zero `transition: all`, zero `vh`, zero raw off-scale tokens).

---

### Task 4: Recompose `HeroDeal.tsx` with Flattened Cards, Zero Clipping, Snap Easing, and Clean Hierarchy

**Files:**
- Modify: `client/src/landing/HeroDeal.tsx:1-550`

**Interfaces:**
- Consumes:
  - `HERO` from `./content` (`title`, `sentence`, `primary`, `secondary`)
  - `useCardTimeline` from `./useCardTimeline`
  - CSS classes from `./landing.css` (`.lp-hero`, `.lp-hero-grid`, `.lp-hero-head`, `.lp-lead`, `.lp-btn--primary`, `.lp-btn--secondary`, `.lp-tabletop-mat`, `.lp-deal-fan`, `.lp-deal-card*`, `.lp-hero-dock`, `.lp-dock-btn`)
- Produces:
  - `export const HeroDeal: React.FC<HeroDealProps>` preserving exact `HeroDealProps` (`onPlayLocal`, `onPlayOnline`).

- [ ] **Step 1: Replace `client/src/landing/HeroDeal.tsx` with the redesigned Hero implementation**

Key changes encoded directly in the component below:
1. Remove `CardBackCrest` inline 72px starburst SVG (`Gate 80`) and replace closed card center with a crisp Phosphor `LockKey` emblem + `SecretCard`-style top thumb notch (`w-11 h-2 rounded-b-full`).
2. Remove `HERO.facts` strip (`taste-skill` §4.7, `Gate 69`) and middle dot `·` in the mat header (`Floor #10`, splitting category and code into two clean pills).
3. Flatten 4-layer `.lp-deal-card-inner` + nested bordered word plaque + nested bordered footer into ONE single-layer cardstock card with an unbordered tinted word band and hairline bottom seat divider (`Floor #4`), and remove `F5` icon-in-coloured-coin above the word.
4. Remove `whiteSpace: 'nowrap'` from `.lp-deal-card` and scale mobile badge padding (`px-1.5 py-0.5 text-[10px] sm:px-2 sm:text-[11px]`) so `01` + `Penyamar` fits comfortably inside `153px` cards at `390x844` with zero horizontal clipping.
5. Switch `buildTimeline` & `animateCardPose` to `--ease-snap` (`[0.22, 1, 0.36, 1]`) and start card deal opacity from `0.9` (visible at rest — `Gate 62`, `Gate 12`, `hum.md`).
6. Use `.lp-hero-grid` (`5.4fr / 6.6fr`) and `.lp-hero-dock` + `.lp-dock-btn` for crisp desktop Stage proportions and clean 2×2 mobile tray geometry.

Write the full updated `client/src/landing/HeroDeal.tsx`:

```tsx
import React, { useCallback, useRef, useState } from 'react';
import { animate, type AnimationSequence } from 'motion/react';
import {
  ArrowsClockwise,
  Eye,
  EyeSlash,
  Shuffle,
  UserPlus,
  ShieldCheck,
  Detective,
  Question,
  LockKey,
} from '@phosphor-icons/react';
import { HERO } from './content';
import { useCardTimeline } from './useCardTimeline';

export interface HeroDealProps {
  onPlayLocal: () => void;
  onPlayOnline: () => void;
}

interface WordPairPreset {
  civilian: string;
  undercover: string;
  code: string;
  category: string;
}

const PRESETS: WordPairPreset[] = [
  { civilian: 'Kopi', undercover: 'Teh', code: 'mkn-01', category: 'Minuman' },
  { civilian: 'Dokter', undercover: 'Bidan', code: 'prf-04', category: 'Profesi' },
  { civilian: 'Matahari', undercover: 'Bulan', code: 'alm-02', category: 'Alam' },
  { civilian: 'Laptop', undercover: 'Tablet', code: 'obj-07', category: 'Benda' },
  { civilian: 'Pantai', undercover: 'Gunung', code: 'alm-09', category: 'Tempat' },
];

const SEAT_HOLDERS = ['Raka', 'Sinta', 'Bima', 'Dina'] as const;

interface CardScatterPose {
  rot: number;
  x: number;
  y: number;
}

const SCATTER_LAYOUTS: readonly (readonly [
  CardScatterPose,
  CardScatterPose,
  CardScatterPose,
  CardScatterPose,
])[] = [
  [
    { rot: -3.4, x: 2, y: 8 },
    { rot: 2.2, x: 0, y: -7 },
    { rot: -2.6, x: -1, y: 6 },
    { rot: 3.6, x: -2, y: -4 },
  ],
  [
    { rot: 2.9, x: 2, y: -5 },
    { rot: -3.6, x: 1, y: 8 },
    { rot: 2.5, x: -1, y: -6 },
    { rot: -3.1, x: -2, y: 7 },
  ],
  [
    { rot: -3.8, x: 2, y: 7 },
    { rot: -1.8, x: 1, y: -6 },
    { rot: 3.2, x: -1, y: 6 },
    { rot: -2.7, x: -2, y: -6 },
  ],
  [
    { rot: 2.6, x: 2, y: 6 },
    { rot: -3.3, x: 0, y: -7 },
    { rot: -2.1, x: 1, y: 8 },
    { rot: 3.7, x: -2, y: -5 },
  ],
];

const SEAT_ORDER_PERMUTATIONS: readonly (readonly [number, number, number, number])[] = [
  [2, 0, 1, 3],
  [0, 3, 2, 1],
  [1, 2, 0, 3],
  [3, 1, 2, 0],
];

const SNAP_EASE: readonly [number, number, number, number] = [0.22, 1, 0.36, 1];

export const HeroDeal: React.FC<HeroDealProps> = ({ onPlayLocal, onPlayOnline }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [peekedCards, setPeekedCards] = useState<Record<number, boolean>>({ 0: true, 2: true });
  const [presetIndex, setPresetIndex] = useState(0);
  const [scatterIndex, setScatterIndex] = useState(0);
  const [includeMrWhite, setIncludeMrWhite] = useState(false);

  const activePreset = PRESETS[presetIndex]!;
  const activeScatter = SCATTER_LAYOUTS[scatterIndex % SCATTER_LAYOUTS.length]!;
  const rolePerm = SEAT_ORDER_PERMUTATIONS[scatterIndex % SEAT_ORDER_PERMUTATIONS.length]!;

  const baseDeck = [
    {
      word: activePreset.civilian,
      role: 'warga' as const,
      roleText: 'Warga',
      hint: 'Kata sama',
    },
    {
      word: activePreset.civilian,
      role: 'warga' as const,
      roleText: 'Warga',
      hint: 'Kata sama',
    },
    {
      word: activePreset.undercover,
      role: 'penyamar' as const,
      roleText: 'Penyamar',
      hint: 'Kata mirip',
    },
    {
      word: includeMrWhite ? 'Tanpa kata' : activePreset.civilian,
      role: includeMrWhite ? ('mrwhite' as const) : ('warga' as const),
      roleText: includeMrWhite ? 'Mr. White' : 'Warga',
      hint: includeMrWhite ? 'Tebak kata' : 'Kata sama',
    },
  ];

  const cards = SEAT_HOLDERS.map((seat, i) => {
    const roleSlot = baseDeck[rolePerm[i]!]!;
    return {
      id: `card-${i}`,
      seat,
      word: roleSlot.word,
      role: roleSlot.role,
      roleText: roleSlot.roleText,
      hint: roleSlot.hint,
      pose: activeScatter[i]!,
      label: `Kartu ${i + 1} (${seat}): ${roleSlot.word} (${roleSlot.roleText})`,
    };
  });

  const allPeeked = cards.every((_, i) => Boolean(peekedCards[i]));

  const buildTimeline = useCallback(
    (scope: HTMLElement): AnimationSequence => {
      const card0 = scope.querySelector('[data-card="0"]');
      const card1 = scope.querySelector('[data-card="1"]');
      const card2 = scope.querySelector('[data-card="2"]');
      const card3 = scope.querySelector('[data-card="3"]');
      const cover = scope.querySelector('[data-cover]');

      if (!card0 || !card1 || !card2 || !card3 || !cover) {
        return [];
      }

      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

      return [
        ...[0, 1, 2, 3].map((i) => {
          const pose = activeScatter[i]!;
          const targetRot = isMobile ? pose.rot * 0.45 : pose.rot;
          const targetX = isMobile ? 0 : pose.x;
          const targetY = isMobile ? pose.y * 0.35 : pose.y;
          return [
            scope.querySelector(`[data-card="${i}"]`) as Element,
            {
              opacity: [0.9, 1],
              x: [targetX - 12 + i * 5, targetX],
              y: [targetY - 10, targetY],
              rotate: [targetRot - 3, targetRot],
            },
            { duration: 0.34, ease: SNAP_EASE, at: i * 0.055 },
          ] as const;
        }),
        [cover as Element, { opacity: [0.1, 0] }, { duration: 0.16, at: 0.4 }],
      ] as AnimationSequence;
    },
    [activeScatter]
  );

  const { isStatic, replay } = useCardTimeline(containerRef, buildTimeline);

  const animateCardPose = (i: number, raised: boolean) => {
    const scope = containerRef.current;
    if (!scope) return;
    const el = scope.querySelector(`[data-card="${i}"]`);
    if (!el) return;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const pose = activeScatter[i]!;
    const targetRot = isMobile ? pose.rot * 0.45 : pose.rot;
    const targetX = isMobile ? 0 : pose.x;
    const targetY = (isMobile ? pose.y * 0.35 : pose.y) + (raised ? -6 : 0);
    const dur = isStatic ? 0 : 0.22;
    animate(
      el,
      {
        x: targetX,
        y: targetY,
        rotate: raised ? targetRot * 0.55 : targetRot,
      },
      { duration: dur, ease: SNAP_EASE }
    );
  };

  const handleCardToggle = (i: number) => {
    setPeekedCards((prev) => {
      const nextVal = !prev[i];
      animateCardPose(i, nextVal);
      return { ...prev, [i]: nextVal };
    });
  };

  const handleDealAgain = () => {
    const nextScatter = (scatterIndex + 1) % SCATTER_LAYOUTS.length;
    const nextPerm = SEAT_ORDER_PERMUTATIONS[nextScatter]!;
    const undercoverSeat = nextPerm.findIndex((idx) => idx === 2);
    const citizenSeat = nextPerm.findIndex((idx) => idx === 0);
    setScatterIndex(nextScatter);
    setPeekedCards({
      [citizenSeat >= 0 ? citizenSeat : 0]: true,
      [undercoverSeat >= 0 ? undercoverSeat : 2]: true,
    });
    setTimeout(() => replay(), 0);
  };

  const handleToggleAllPeek = () => {
    const nextState = !allPeeked;
    setPeekedCards({ 0: nextState, 1: nextState, 2: nextState, 3: nextState });
    cards.forEach((_, i) => animateCardPose(i, nextState));
  };

  const handleNextPreset = () => {
    const nextScatter = (scatterIndex + 1) % SCATTER_LAYOUTS.length;
    const nextPerm = SEAT_ORDER_PERMUTATIONS[nextScatter]!;
    const undercoverSeat = nextPerm.findIndex((idx) => idx === 2);
    const citizenSeat = nextPerm.findIndex((idx) => idx === 0);
    setPresetIndex((prev) => (prev + 1) % PRESETS.length);
    setScatterIndex(nextScatter);
    setPeekedCards({
      [citizenSeat >= 0 ? citizenSeat : 0]: true,
      [undercoverSeat >= 0 ? undercoverSeat : 2]: true,
    });
    setTimeout(() => replay(), 0);
  };

  const handleToggleMrWhite = () => {
    const mrWhiteSeat = rolePerm.findIndex((idx) => idx === 3);
    const seatIdx = mrWhiteSeat >= 0 ? mrWhiteSeat : 3;
    setIncludeMrWhite((prev) => !prev);
    setPeekedCards((prev) => ({ ...prev, [seatIdx]: true }));
    animateCardPose(seatIdx, true);
  };

  return (
    <section className="lp-screen lp-hero" aria-label="Hero">
      <div className="lp-container w-full">
        <div className="lp-hero-grid">
          {/* Left Column: Commanding Display Copy & Equal-Height CTAs */}
          <div className="flex flex-col items-start min-w-0">
            <h1 className="lp-head lp-hero-head text-ink mb-5">
              Satu kata beda.{' '}
              <span className="block">Siapa penyamarnya?</span>
            </h1>
            <p className="lp-lead mb-8 max-w-[38ch]">
              {HERO.sentence}
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 items-stretch sm:items-center w-full sm:w-auto">
              <button
                type="button"
                onClick={onPlayLocal}
                className="lp-btn lp-btn--primary w-full sm:w-auto"
              >
                {HERO.primary}
              </button>
              <button
                type="button"
                onClick={onPlayOnline}
                className="lp-btn lp-btn--secondary w-full sm:w-auto"
              >
                {HERO.secondary}
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Tabletop Stage + Floating Control Dock */}
          <div className="flex flex-col items-center w-full min-w-0">
            <div className="lp-tabletop-mat p-4 sm:p-6 w-full max-w-[780px]">
              <div className="flex items-center justify-between gap-2 pb-3 mb-2 border-b border-rule text-xs text-ink-muted">
                <span className="font-bold text-ink">Meja Kartu Rahasia</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="bg-cardstock px-2.5 py-0.5 rounded-full border border-rule font-semibold text-ink">
                    {activePreset.category}
                  </span>
                  <span className="lp-code bg-paper px-2 py-0.5 rounded-full border border-rule text-ink-muted">
                    {activePreset.code}
                  </span>
                </div>
              </div>

              <div className="lp-deal-table">
                <div ref={containerRef} className="lp-deal-fan">
                  {cards.map((card, i) => {
                    const isPeeked = Boolean(peekedCards[i]);
                    const stateClass = !isPeeked
                      ? 'lp-deal-card--closed'
                      : card.role === 'penyamar'
                        ? 'lp-deal-card--penyamar'
                        : card.role === 'mrwhite'
                          ? 'lp-deal-card--mrwhite'
                          : 'lp-deal-card--warga';

                    const RoleIcon =
                      card.role === 'penyamar'
                        ? Detective
                        : card.role === 'mrwhite'
                          ? Question
                          : ShieldCheck;

                    return (
                      <button
                        key={card.id}
                        type="button"
                        data-card={i}
                        aria-pressed={isPeeked}
                        aria-label={card.label}
                        onClick={() => handleCardToggle(i)}
                        className={`lp-deal-card ${stateClass}`}
                        style={{
                          zIndex: isPeeked ? 15 + i : i + 1,
                          transform: `translate(${card.pose.x}px, ${card.pose.y + (isPeeked ? -6 : 0)}px) rotate(${card.pose.rot}deg)`,
                          ['--fan-rot' as string]: `${card.pose.rot}deg`,
                          ['--fan-x' as string]: `${card.pose.x}px`,
                          ['--fan-y' as string]: `${card.pose.y}px`,
                          ['--lift-y' as string]: isPeeked ? '-6px' : '0px',
                        }}
                      >
                        {!isPeeked && (
                          <span
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-2 rounded-b-full bg-paper-muted border-x border-b border-rule pointer-events-none"
                            aria-hidden="true"
                          />
                        )}

                        {isPeeked ? (
                          <>
                            {/* Top Index & Semantic Role Pill */}
                            <div className="flex items-center justify-between gap-1 w-full min-w-0">
                              <span className="lp-code text-[10.5px] sm:text-[11px] font-bold text-ink-muted shrink-0">
                                0{i + 1}
                              </span>
                              <span
                                className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[10.5px] font-bold inline-flex items-center gap-1 whitespace-nowrap shrink-0 ${
                                  card.role === 'penyamar'
                                    ? 'bg-stamp text-cardstock'
                                    : card.role === 'mrwhite'
                                      ? 'bg-sun text-ink border border-sun-dark'
                                      : 'bg-teal-dark text-cardstock'
                                }`}
                              >
                                <RoleIcon size={11} weight="bold" aria-hidden="true" />
                                <span>{card.roleText}</span>
                              </span>
                            </div>

                            {/* Center Secret Word Band (Single-Layer, Zero Nested Border Box) */}
                            <div className="my-auto py-1 text-center space-y-1.5 w-full">
                              <div
                                className={`py-3 sm:py-3.5 px-2 rounded-xl ${
                                  card.role === 'penyamar'
                                    ? 'bg-cardstock'
                                    : card.role === 'mrwhite'
                                      ? 'bg-cardstock border border-dashed border-sun-dark'
                                      : 'bg-teal-light/45'
                                }`}
                              >
                                <span
                                  className={`font-display font-bold block leading-tight tracking-tight ${
                                    card.word.length > 8
                                      ? 'text-sm sm:text-base'
                                      : 'text-lg sm:text-xl'
                                  } ${
                                    card.role === 'penyamar'
                                      ? 'text-stamp-dark'
                                      : 'text-ink'
                                  }`}
                                >
                                  {card.word}
                                </span>
                              </div>

                              <span className="text-[11px] font-semibold text-ink-muted block">
                                {card.hint}
                              </span>
                            </div>

                            {/* Bottom Hairline Seat Row */}
                            <div className="flex items-center justify-between w-full pt-2 border-t border-rule/80 text-[11px] font-bold text-ink">
                              <span className="truncate">{card.seat}</span>
                              <span className="text-ink-muted font-semibold shrink-0">Tutup</span>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Closed Envelope Card Back */}
                            <div className="flex items-center justify-between gap-1 w-full min-w-0 pt-1">
                              <span className="lp-code text-[10.5px] sm:text-[11px] font-bold text-ink-muted shrink-0">
                                0{i + 1}
                              </span>
                              <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-cardstock border border-rule text-[10px] sm:text-[10.5px] font-bold text-ink-muted whitespace-nowrap shrink-0">
                                <LockKey size={10} weight="bold" aria-hidden="true" />
                                <span>Rahasia</span>
                              </span>
                            </div>

                            <div className="my-auto text-center py-2 space-y-2 w-full">
                              <LockKey
                                size={22}
                                weight="duotone"
                                className="mx-auto text-teal-dark"
                                aria-hidden="true"
                              />
                              <span className="inline-block px-2.5 py-1 rounded-full bg-cardstock border border-rule text-[11px] font-bold text-ink shadow-print-sm">
                                Kartu {card.seat}
                              </span>
                            </div>

                            <div className="flex items-center justify-between w-full pt-2 border-t border-rule/80 text-[11px] font-bold text-teal-dark">
                              <span>Ketuk intip</span>
                              <Eye size={13} weight="bold" aria-hidden="true" />
                            </div>
                          </>
                        )}
                      </button>
                    );
                  })}
                  <div data-cover className="lp-deal-cover" aria-hidden="true" />
                </div>

                <p className="text-xs text-ink-muted text-center mt-3" aria-live="polite">
                  {includeMrWhite
                    ? `2 Warga (${activePreset.civilian}), 1 Penyamar (${activePreset.undercover}), 1 Mr. White. Ketuk kartu untuk intip.`
                    : `3 Warga (${activePreset.civilian}), 1 Penyamar (${activePreset.undercover}). Ketuk kartu untuk intip.`}
                </p>
              </div>
            </div>

            {/* Responsive Floating Control Dock */}
            <div
              className="lp-hero-dock mt-4"
              role="group"
              aria-label="Kontrol meja kartu hero"
            >
              <button
                type="button"
                onClick={handleDealAgain}
                className="lp-dock-btn text-ink hover:bg-paper-muted"
              >
                <ArrowsClockwise size={15} weight="bold" aria-hidden="true" />
                <span>Bagikan ulang</span>
              </button>
              <button
                type="button"
                onClick={handleToggleAllPeek}
                aria-pressed={allPeeked}
                className={`lp-dock-btn ${
                  allPeeked
                    ? 'bg-teal-dark text-cardstock'
                    : 'text-ink hover:bg-paper-muted'
                }`}
              >
                {allPeeked ? (
                  <EyeSlash size={15} weight="bold" aria-hidden="true" />
                ) : (
                  <Eye size={15} weight="bold" aria-hidden="true" />
                )}
                <span>{allPeeked ? 'Tutup semua' : 'Intip semua'}</span>
              </button>
              <button
                type="button"
                onClick={handleNextPreset}
                className="lp-dock-btn text-ink hover:bg-paper-muted"
              >
                <Shuffle size={15} weight="bold" aria-hidden="true" />
                <span>Ganti kata</span>
              </button>
              <button
                type="button"
                onClick={handleToggleMrWhite}
                aria-pressed={includeMrWhite}
                className={`lp-dock-btn ${
                  includeMrWhite
                    ? 'bg-sun text-ink border border-sun-dark'
                    : 'text-ink hover:bg-paper-muted'
                }`}
              >
                <UserPlus size={15} weight="bold" aria-hidden="true" />
                <span>Mr. White</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroDeal;
```

- [ ] **Step 2: Run full test suite, typecheck, and Hallmark static linter**

Run:
```bash
npm run typecheck
npm test --workspace=client
npm run build:client
node C:\Users\ASUS\.gemini\config\skills\hallmark\scripts\sloplint.mjs client\src\landing --genre playful
```
Expected:
- `typecheck`: 0 errors
- `vitest`: All 8 test files pass (`42 passed`)
- `build:client`: succeeds cleanly
- `sloplint`: `0 FAIL, 0 REFLEX, 0 WARN`

---

### Task 5: Visual & Interactive Verification Across `1280x800`, `1440x900`, and `390x844` + Hallmark Log Update

**Files:**
- Modify: `.hallmark/log.json` (only if updating the hero redesign entry after clean verification)

- [ ] **Step 1: Verify rendered hero in headless/live browser across all three viewports**

With `npm run dev:client` running on `http://localhost:5173/`, verify:
1. **`1280x800` (`scrollY=0`):**
   - `header` + `.lp-hero` + floating dock all fit completely inside `y <= 800px` (`Floor #12`, `Gate 44b`).
   - `.lp-hero-head` renders larger than Section 2's `h2` (`>= 48px` vs `45.6px`) and spans `2` lines (`"Satu kata beda."` / `"Siapa penyamarnya?"`).
   - Hero primary CTA and secondary CTA render at equal `48px` height, while `LandingNav` CTA renders quieter (`lp-btn--nav`, `40px`).
   - Section 2 `h2` is NOT sliced across the bottom edge of the viewport.
2. **`1440x900` (`scrollY=0`):**
   - `.lp-hero-head` renders at `~53-54px`, dominating `h2` (`45.6px`).
   - `.lp-marquee-wrap` starts between `y=760px` and `y=900px` (`Gate 44c`), and bottom whitespace inside `.lp-hero` stays `< 160px` (`Gate 79`) with balanced `1.0x-1.5x` vertical centering (`Gate 44a`).
3. **`390x844` (`scrollY=0` and scrolled):**
   - Zero horizontal overflow (`document.documentElement.scrollWidth <= window.innerWidth`).
   - `Penyamar`, `Warga`, `Mr. White`, and `Rahasia` pills fit cleanly inside card inner width with zero right-edge text clipping.
   - `.lp-hero-dock` renders as a compact `rounded-2xl` 2x2 button tray with `>= 44px` button heights.
4. **Interactive states:**
   - Click `Bagikan ulang`, `Intip semua` / `Tutup semua`, `Ganti kata`, `Mr. White`, and individual cards to verify scatter permutations, word cycling, and accessible `aria-pressed` state updates.

- [ ] **Step 2: Commit verified changes**

```bash
git add client/src/landing/content.ts client/src/landing/LandingNav.tsx client/src/landing/landing.css client/src/landing/HeroDeal.tsx client/src/tests/LandingSections.test.ts
git commit -m "feat(landing): refine hero hierarchy, Stage fold sizing, and single-layer card tabletop"
```
