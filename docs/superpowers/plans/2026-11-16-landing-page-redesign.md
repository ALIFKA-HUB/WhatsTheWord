# What's The Word - Landing Page Full Redesign Plan

> **For agentic execution:** Execute phase-by-phase. Keep existing app routing (`client/src/App.tsx`, `client/src/utils/initialView.ts`), `LandingPageProps` (`onPlayLocal`, `onPlayOnline`), and all Hum app screens intact.

## 1. Design Read, References & Hallmark Picks

- **Design Read (`design-taste-frontend`):** Reading this as: Consumer social party-game landing page for Indonesian friend groups, with a warm tactile tabletop language, leaning toward Hallmark Hum (`DESIGN.md` + `client/src/tokens.css` + Tailwind utilities + `Chillax` / `Nunito Variable` + lightweight spring & CSS motion).
- **Reference Synthesis (adapted into light Hum tabletop world):**
  - **From `jiro.build`:** Snappy, lightweight micro-interactions (sliding segmented pill controls, responsive category filter grids, crisp hover elevation) without heavy scroll hijacks or bloated JS animations.
  - **From `webcube.vercel.app`:** Making **every section interactive/playable** rather than passive text:
    1. Hero paired with a floating **control dock** directly below the interactive card stage.
    2. **1x lightweight horizontal marquee strip** below the hero to set pacing.
    3. **Role & setup mechanism section** pairing clickable role/player tabs + animated ratio bars (`scaleX`) with the live **`/anatomy` `RoleDispenserFigure`**.
    4. **Playable Mini-Round ("Tebak Siapa Penyamarnya")** alongside the 4-step round walkthrough so visitors experience the deduction loop in 10 seconds right on the landing page.
- **The Three Dials:**
  - `DESIGN_VARIANCE: 7` (asymmetric hero split, varied layout families across sections, capped container `max-w-[1440px]`)
  - `MOTION_INTENSITY: 6` (lightweight card-stock spring physics via `motion/react` `transform`/`opacity`/`layoutId` + CSS marquee, `useReducedMotion` + `@supports (animation-timeline: view())` guards)
  - `VISUAL_DENSITY: 4` (airy tabletop spacing, ~80 words max per screen, <= 450 visible words total)

**Hallmark · v2.0.0**
- **Redesign** · `full` · 1 page (`/`, `client/src/landing/LandingPage.tsx`)
- **Before** · Dual-system split (`Terrazzo` in `client/src/landing/` vs `Hum` in `DESIGN.md`), decorative status dots (`w-2 h-2 rounded-full bg-mint`), pill eyebrows above sections, plain `<table>` word-pack list (`lp-spec-table`), dark `.lp-band--ink` theme inversion in `LandingClose`, isolated `RoleDispenserFigure`, and Nov 2 screenshots predating the Nov 15 UI/UX polish.
- **Keeps** · `LandingPageProps` (`onPlayLocal`, `onPlayOnline`), `App.tsx` routing & `PLAY_PATH`, `RoleDispenserFigure` isometric Anatomy core (`model.ts`, `geometry.ts`, `art.tsx`, `live.tsx`), Indonesian casual nongkrong voice, `DEFAULT_WORD_PAIRS` / `CATEGORIES` data wiring, and `#ronde` / `#mode` / `#paket` anchor links.
- **Files** ·
  - **Edit:** `client/src/landing/LandingPage.tsx`, `client/src/landing/LandingNav.tsx`, `client/src/landing/HeroDeal.tsx`, `client/src/landing/RoundPinned.tsx`, `client/src/landing/ModeSwitcher.tsx`, `client/src/landing/LandingClose.tsx`, `client/src/landing/LandingFooter.tsx`, `client/src/landing/content.ts`, `client/src/landing/tokens.css`, `client/src/landing/base.css`, `client/src/landing/landing.css`, `client/src/landing/anatomy/RoleDispenserFigure.tsx`, `client/src/landing/anatomy/model.ts`, `client/src/landing/anatomy/live.tsx`, `client/src/landing/anatomy/dispenser.css`, `client/src/components/iso/tokens.css`, `client/src/tests/LandingPage.test.ts`, `client/src/tests/LandingSections.test.ts`, `client/src/tests/LandingTokens.test.ts`
  - **Create:** `client/src/landing/LandingMarquee.tsx`, `client/src/landing/SetupMechanismSection.tsx`, `client/src/landing/MiniRoundWidget.tsx`, `client/src/landing/WordPackShowcase.tsx`
  - **Delete (after user confirmation during execution):** `client/src/landing/BeforeAfter.tsx`, `client/src/landing/WordPackTable.tsx`
  - **Recapture Assets:** `client/public/landing/screens/{home,setup,lobby,reveal,describe,voting,mrwhite}.png`
- **Theme** · `Hum` (locked in `DESIGN.md` — warm cream paper `oklch(96.8% 0.011 95)`, ivory cardstock `oklch(98.6% 0.006 95)`, blue-black ink `oklch(21% 0.016 255)`, sage-teal `mint`, pear-ochre `sun`, terracotta `stamp`, `Chillax` + `Nunito Variable` + `JetBrains Mono`)
- **Shape & Chrome** · Single-line header nav (`LandingNav`, max 72px height, wordmark + anchor links + 1 CTA) · Signed tabletop footer (`LandingFooter`)
- **Hero** · Asymmetric 12-col Stage (`lg:col-span-5` copy + `lg:col-span-7` interactive "Meja Kartu Rahasia" deck + floating control dock), fitting inside `1280x800` without scroll
- **Signature** · Interactive "Meja Kartu Rahasia" with floating control dock (`Bagikan Ulang`, `Intip Kartu`, `Ganti Kata`, `+ Mr. White`)
- **Sections** · `HeroDeal` -> `LandingMarquee` (1x lightweight strip) -> `SetupMechanismSection` (role tabs + `scaleX` ratio bars + `/anatomy` `RoleDispenserFigure`) -> `RoundPinned` + `MiniRoundWidget` (playable "Tebak Siapa Penyamarnya" + 4-step app screen walkthrough) -> `ModeSwitcher` (sliding `layoutId` pill tabs) -> `WordPackShowcase` (filterable card catalog) -> `LandingClose` + `LandingFooter`

---

## 2. Audit & Compliance Gates (Hallmark Floor & `design-taste-frontend`)

1. **System Unification (`Terrazzo` -> `Hum`):**
   - Remove `@fontsource/syne` and `@fontsource-variable/onest` imports from `client/src/landing/LandingPage.tsx`; use `Chillax` + `Nunito Variable` + `JetBrains Mono` from `DESIGN.md`.
   - Remove `.lp-root` Terrazzo color/font overrides in `client/src/landing/tokens.css`; inherit root Hum tokens from `client/src/tokens.css` and scope only landing layout/type-scale tokens to `.lp-root`.
   - Align `client/src/components/iso/tokens.css` (`.iso[data-theme="light"]`) and `client/src/landing/anatomy/dispenser.css` to Hum paper, cardstock, sage-teal, terracotta, and ochre values.
2. **Floor #2 (Lightweight Animation Hygiene):**
   - **Never** `transition: all` / `transition-all`.
   - **Never** animate `width`, `height`, `top`, or `left`. Ratio bars in `SetupMechanismSection.tsx` MUST animate via `transform: scaleX(...)` with `transform-origin: left` (never `width`).
   - All motion wraps in `prefers-reduced-motion` checks (`useReducedMotion` in React, `@media (prefers-reduced-motion: no-preference)` in CSS).
3. **Floor #9 & #10 (Zero Eyebrows, Zero Decorative Dots, Zero Middle-Dot Strings):**
   - Remove all `<span className="w-2 h-2 rounded-full bg-mint" />` and `<span className="w-2.5 h-2.5 rounded-full bg-mint shrink-0" />` decorative status dots across all landing components.
   - Remove all pill eyebrows above headings.
   - Replace `\u00b7` middle-dot-joined text in `client/src/landing/anatomy/model.ts` (`readoutOf`) with clean `/` or spaced tokens, and ensure `LandingMarquee.tsx` uses `/` or spaced chips instead of middle dots.
4. **Page Theme Lock (`taste-skill` §4.11) & No Duplicate CTA Intent (`taste-skill` §4.5):**
   - Replace `.lp-band--ink` dark-mode inversion in `LandingClose.tsx` and `WordPackTable.tsx` with warm `bg-paper-muted` / `bg-cardstock` surfaces.
   - Standardize CTA copy everywhere: local mode = **`Main di satu HP`**, online mode = **`Buat room online`**.
5. **Zero Layout Repetition & Zero Row-Dump Tables (`taste-skill` §4.7 & §4.9):**
   - Remove `BeforeAfter.tsx` and `WordPackTable.tsx` (`lp-spec-table`).
   - Every section uses a distinct layout family (asymmetric deck + dock -> marquee strip -> 2-col role simulator + isometric `/anatomy` -> playable detective mini-round + sticky phone frame -> sliding tab panel -> filterable 4-col card grid -> framed closing card).
   - Zero em-dashes (`—`) or en-dashes (`–`) anywhere (`AntiSlopPreFlight.test.ts` check).

---

## 3. Section-by-Section Redesign Details

### 3.1 `LandingNav.tsx`
- Sticky header `h-16 sm:h-[72px]`, `bg-paper/95 backdrop-blur-sm border-b border-rule`.
- Left: `/favicon.svg` mark + `What's The Word` wordmark in `font-display font-bold` (no decorative dot).
- Center: Single-line nav links (`Mekanisme` -> `#mekanisme`, `Cara main` -> `#ronde`, `Mode` -> `#mode`, `Paket kata` -> `#paket`), sentence case, untracked.
- Right: Single CTA button `Main di satu HP` (`rounded-full`, Hum primary push button, never wraps to 2 lines).

### 3.2 `HeroDeal.tsx` (Signature: Meja Kartu Rahasia + Floating Control Dock)
- Top padding capped (`pt-8 sm:pt-12 pb-10 sm:pb-14`) so headline, sentence, CTAs, interactive card fan, and control dock fit inside `1280x800` above the fold.
- **Left (`lg:col-span-5`):**
  - `<h1>` (`text-4xl sm:text-5xl lg:text-[3.4rem] font-display font-bold leading-[1.06] tracking-tight`): `"Satu kata beda. Siapa penyamarnya?"` (5 words).
  - Subtext (12 words): `"Game tebak penyamar untuk 3 sampai 20 teman, cukup satu HP."`
  - Actions: `"Main di satu HP"` (primary) + `"Buat room online"` (secondary).
  - Compact factual strip underneath (3 plain stat items, no glowing dots): `3-20 Pemain`, `1 HP atau Multi-HP`, `Tanpa perlu akun`.
- **Right (`lg:col-span-7`):**
  - Tabletop mat (`bg-paper-muted border border-rule rounded-3xl p-5 sm:p-7`).
  - 4 Hum-styled interactive secret cards (`rounded-3xl bg-cardstock border border-rule shadow-print`) with spring stagger entrance (`useCardTimeline`, `transform`/`opacity` only). Click or hold-to-peek any card to reveal `Kopi` (`Warga`, `teal`), `Teh` (`Penyamar`, `stamp`), or `Mr. White` (`sun` when enabled).
  - **Floating Control Dock** (`rounded-full bg-cardstock border border-rule shadow-print-sm p-1.5 inline-flex flex-wrap gap-1.5` with Phosphor icons):
    - `Bagikan ulang` (re-deals cards with spring animation)
    - `Intip semua` / `Tutup kartu` (toggles peek reveal)
    - `Ganti kata` (cycles Kopi/Teh, Dokter/Bidan, Matahari/Bulan, Laptop/Tablet, Pantai/Gunung)
    - `+ Mr. White` (toggles 1 slot into a blank Mr. White card)

### 3.3 `LandingMarquee.tsx` (1x Lightweight Pacing Strip)
- Single horizontal CSS marquee (`@keyframes lp-marquee` transforming `translateX(0)` -> `translateX(-50%)`, paused on hover and disabled under `prefers-reduced-motion: reduce`).
- Warm `bg-paper-muted border-y border-rule py-3.5`, listing game highlights separated cleanly without middle dots or glowing circles: `Pass & Play 1 HP` / `Room Online 6 Karakter` / `3 sampai 20 Pemain` / `Peran Mr. White` / `Paket Kata Indonesia` / `Buat Paket Sendiri`.

### 3.4 `SetupMechanismSection.tsx` + Upgraded `/anatomy` `RoleDispenserFigure.tsx`
- Inspired by Section 01 of `webcube.vercel.app`, built in Hum light aesthetics on `#mekanisme`:
- Stacked section header: `<h2>` `"Atur meja, jaga keadilan peran."` + 1-sentence explainer.
- **2-Column Grid (`lg:grid-cols-12`, collapses cleanly `< 1024px`):**
  - **Left (`lg:col-span-5`) — Interactive Role & Player Simulator Card (`rounded-3xl bg-cardstock border border-rule p-6 shadow-print`):**
    - Player count pill selector (`4`, `6`, `8`, `10`, `12` pemain) + optional `Mr. White` toggle.
    - Role tabs (`Warga Sipil`, `Penyamar`, `Mr. White`) with `motion/react` `layoutId` active indicator, showing how that role wins and behaves.
    - **Animated Ratio Telemetry Bars** (`transform: scaleX(...)` transition, `transform-origin: left`, never `width`!) displaying real numbers computed directly from `anatomy/model.ts` (`civilianCountFor`, `impostorCountFor`, `ratioExactFor`).
  - **Right (`lg:col-span-7`) — Controlled `/anatomy` `RoleDispenserFigure`:**
    - Synced bidirectionally with the left simulator! Changing player count (`4..12`) or clicking the isometric plunger/bay immediately animates the SVG carriage, rider, and dial gauge needle (`anatomy/live.tsx` + `art.tsx`).
    - Restyled `.iso[data-theme="light"]` into Hum's warm ivory, sage-teal, terracotta, and ochre tokens.

### 3.5 `RoundPinned.tsx` + `MiniRoundWidget.tsx` (Playable Detective Mini-Round + 4-Step Walkthrough)
- Inspired by Section 03 (WCA Timer) of `webcube.vercel.app` so visitors actively play the deduction loop instead of just reading steps:
- Section `#ronde`: Stacked header `<h2>` `"Empat langkah tiap ronde. Coba tebak sekarang."` + 1 sentence.
- **Top Interactive Block (`MiniRoundWidget.tsx`):**
  - Compact Hum tabletop card (`rounded-3xl bg-cardstock border border-rule shadow-print p-6 sm:p-8`):
    - Shows a sample round theme (e.g. `Petunjuk Ronde: Minuman`, with secret civilian word known or revealed after vote) and **4 clickable player clue cards** (`Raka: "Biasanya diseduh pagi"`, `Sinta: "Enak pakai es atau hangat"`, `Bima: "Dipetik dari pucuk daun"`, `Dina: "Bisa campur susu kental"`).
    - Visitor clicks one player to **Vote**.
    - Instant animated state reveal: marks whether the pick caught the `Penyamar` (`Teh` vs `Kopi`) or missed a `Warga`, displays a concise verdict note + `[Coba ronde lain]` button cycling 3 handcrafted Indonesian mini-rounds.
- **Bottom/Paired 4-Step Screen Walkthrough (`RoundPinned.tsx`):**
  - Interactive 4-step selector (`01 Intip kata`, `02 Jelaskan`, `03 Voting`, `04 Tebakan Mr. White`) synced with the recaptured Hum app screenshots (`/landing/screens/{reveal,describe,voting,mrwhite}.png`) inside a tactile cardstock phone frame.

### 3.6 `ModeSwitcher.tsx` (Dua Cara Main)
- Section `#mode` (`bg-paper-muted border-y border-rule`): stacked header `<h2>` `"Dua cara main."` + `"Main bareng di satu meja atau dari jarak jauh lewat room online."`
- Accessible `role="tablist"` with `motion/react` `layoutId` sliding active pill (`Satu HP` vs `Room online`), keyboard arrow/Home/End support.
- `role="tabpanel"` card (`rounded-3xl bg-cardstock border border-rule shadow-print p-6 sm:p-10`): 3 factual points + consistent CTA (`Main di satu HP` or `Buat room online`) + recaptured `setup.png` / `lobby.png`.

### 3.7 `WordPackShowcase.tsx` (Replaces `WordPackTable.tsx`)
- Section `#paket`: stacked summary header (`"${PAIR_COUNT} pasangan kata siap main."` + `"Tersebar di ${CATEGORY_COUNT} kategori bahasa Indonesia, atau buat paketmu sendiri."`).
- Controls bar (inspired by `jiro.build` filter bar): sliding category filter pills (`Semua` + categories from `SAMPLE_PAIRS`) + spoiler toggle button (`Sembunyikan kata penyamar` / `Buka kata penyamar`, using Phosphor `Eye` / `EyeSlash` icon).
- **2-col (sm) / 4-col (lg) Card Grid** (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`), replacing the old `lp-spec-table`. Cards animate smoothly on filter/toggle using `transform` + `opacity`, showing category + code (`font-mono`), `Warga` word (`teal`), and `Penyamar` word (`stamp` or `••••••••`).

### 3.8 `LandingClose.tsx` & `LandingFooter.tsx`
- `LandingClose.tsx`: Light-theme locked (`bg-paper-muted` section framing a `rounded-3xl bg-cardstock border border-rule shadow-print-lg` invitation card — NO `.lp-band--ink` dark flip). Left: `"Kumpulkan teman. Satu HP cukup."`, 1 sentence, `"Main di satu HP"` + `"Buat room online"`. Right: recaptured `/landing/screens/home.png`.
- `LandingFooter.tsx`: Warm `bg-paper border-t border-rule` signed footer (`"Dibuat untuk malam main bareng teman. Kalau ada kata yang terlalu gampang, buat paketmu sendiri."`, `"Tim What's The Word"`, clean anchor links).

---

## 4. Visual Asset Recapture Plan

Recapture all 7 screens from the live Hum app (`npm run dev:client` + Playwright at `390x844`, `@2x`) into `client/public/landing/screens/`:
1. `home.png` (`HomePage`)
2. `setup.png` (`PassPlaySetupPage`)
3. `reveal.png` (`PassPlaySecretView` / `SecretCard` hold-to-reveal)
4. `describe.png` (`PassPlayGamePage` clue phase)
5. `voting.png` (`PassPlayVotingView` / `VotingGrid`)
6. `mrwhite.png` (`MrWhiteModal`)
7. `lobby.png` (`LobbyPage`)

---

## 5. Implementation & Verification Sequence

### Phase 1: Design Tokens, CSS & `/anatomy` Palette Unification
1. Update `client/src/landing/tokens.css`, `base.css`, and `landing.css` to inherit Hum tokens from `client/src/tokens.css`, remove Terrazzo overrides, add `@keyframes lp-marquee` (guarded by `prefers-reduced-motion: no-preference`), and ensure zero `transition: all` or layout-thrashing animations.
2. Update `client/src/components/iso/tokens.css` and `client/src/landing/anatomy/dispenser.css` to Hum tones (`paper`, `cardstock`, `mint`, `stamp`, `sun`, `Chillax`/`Nunito`).
3. Extend `client/src/landing/anatomy/model.ts`, `live.tsx`, and `RoleDispenserFigure.tsx` so `RoleDispenserFigure` accepts optional controlled `playerCount` / `includeMrWhite` props (while keeping standalone defaults) and removes `\u00b7` middle dots from `readoutOf`.

### Phase 2: Copy, Interactive Sections & Components
1. Update `client/src/landing/content.ts` (remove `BEFORE_AFTER`, add `MINI_ROUNDS`, `ROLE_GUIDES`, `MARQUEE_ITEMS`, keep `HERO` <= 7/12 words, zero em-dashes).
2. Implement `LandingNav.tsx`, `HeroDeal.tsx` (with control dock), `LandingMarquee.tsx`, `SetupMechanismSection.tsx` (tabs + `scaleX` ratio bars + `RoleDispenserFigure`), `MiniRoundWidget.tsx`, `RoundPinned.tsx`, `ModeSwitcher.tsx` (sliding `layoutId` pill), `WordPackShowcase.tsx`, `LandingClose.tsx`, `LandingFooter.tsx`, and assemble in `LandingPage.tsx`.
3. Remove obsolete `BeforeAfter.tsx` and `WordPackTable.tsx` after confirming with the user.

### Phase 3: Screenshot Recapture & Visual Verification
1. Recapture all 7 app screenshots into `client/public/landing/screens/`.
2. Inspect desktop (`1280x800`, `1440x900`) and mobile (`390x844`) renders plus all interactive states (Hero dock, Setup simulator + Anatomy plunger, Mini-Round voting, ModeSwitcher tabs, WordPackShowcase filter & spoiler toggle).

### Phase 4: Tests & Quality Gates
1. Update `client/src/tests/LandingTokens.test.ts` and `client/src/tests/LandingSections.test.ts` for the unified Hum structure (`SetupMechanismSection`, `MiniRoundWidget`, `WordPackShowcase`, `LandingMarquee`, zero decorative dots, zero `BeforeAfter`/`lp-spec-table`).
2. Verify `LandingPage.test.ts`, `LandingMotion.test.ts`, and `AntiSlopPreFlight.test.ts` pass cleanly.
3. Run:
   - `npm run typecheck`
   - `npm test --workspace=client`
   - `npm run build:client`
   - Hallmark `sloplint --genre playful --render --kept` and update `.hallmark/log.json`.
