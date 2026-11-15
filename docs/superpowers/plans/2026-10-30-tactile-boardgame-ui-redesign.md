# Tactile Board-Game / Print UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul the entire What's The Word frontend from generic dark-SaaS AI slop into an authentic **Tactile Board-Game / Print** interface (inspired by Codenames, Secret Hitler, Exploding Kittens, and Risograph card decks) while preserving 100% of existing offline Pass & Play and online multiplayer game logic.

**Architecture:**
- **Design Read (`design-taste-frontend`):** *"Reading this as: mobile-first social deduction party game for friends in a room or online lobby, with a tactile board-game / print language, leaning toward archival cardstock + litho black ink + single vermilion stamp red accent, Archivo Variable condensed display typography, and physical envelope/token micro-interactions."*
- **The Three Dials:** `DESIGN_VARIANCE: 7` (tilted mode cards, stamped asymmetric badges, strict single-column mobile collapse), `MOTION_INTENSITY: 6` (spring-physics envelope slide-out card reveal, physical vote token placement, tactile button push down to shadow), `VISUAL_DENSITY: 4` (airy tabletop spacing with clear thumb zones).
- **Color & Role System:** Monochrome + 1 Red Accent (`#EEEDE7` newsprint background, `#FAF8F3` cardstock surface, `#111111` litho ink, `#D92B2B` vermilion stamp red). Roles are differentiated by rubber stamps & typography rather than neon glows: Civilian = black ink stamp `WARGA`, Undercover = vermilion red stamp `IMPOSTOR`, Mr. White = blank dashed card `MR. WHITE - TANPA KATA`.
- **Component & Asset Strategy:** Self-hosted `@fontsource-variable/archivo` + `@fontsource/jetbrains-mono`, `@phosphor-icons/react` (retiring `lucide-react`), geometric halftone `PlayerToken` component (retiring emoji avatars while mapping legacy saved emoji values seamlessly), CSS/SVG noise & halftone textures on a fixed non-scrolling layer, plus 2 generated litho print illustrations (`box-lid-art.png` and `gameover-art.png`).

**Tech Stack:** React 18, TypeScript, Tailwind CSS v3, Motion (`motion/react`), `@phosphor-icons/react`, `@fontsource-variable/archivo`, `@fontsource/jetbrains-mono`, Vitest.

## Global Constraints

- **Zero Logic Regression:** All existing hooks (`usePassPlay`, `useSocket`, `useGameSound`), context providers, and socket events must keep their exact signatures and behavior.
- **Strict Palette Lock:** Only archival newsprint (`#EEEDE7`), cardstock (`#FAF8F3`), muted paper (`#E2DFD5`), litho ink (`#111111`), secondary ink (`#52514E`), and vermilion stamp red (`#D92B2B`). Zero cyan/purple/violet/rose-glow SaaS classes (`bg-zinc-900`, `text-cyan-400`, `border-purple-500`, `backdrop-blur` glassmorphism) in redesigned views.
- **Zero Em-Dashes (`—` or `–`):** Never output `—`, `–`, or `&mdash;` in any visible UI string, comment-visible label, or component. Use regular hyphens (`-`) or periods.
- **Icon Discipline:** Use `@phosphor-icons/react` across all components with consistent weight (`bold` or `duotone`). Remove all `lucide-react` imports.
- **Eyebrow Restraint:** Maximum 1 small uppercase tracking label per 3 sections on any screen. Let bold condensed headlines speak for themselves.
- **Viewport & Performance:** Use `min-h-[100dvh]` (never `h-screen`). Paper grain overlay must be `fixed inset-0 pointer-events-none` so scrolling never triggers GPU repaints. Honor `prefers-reduced-motion`.

---

### Task 1: Foundation Tokens, Self-Hosted Fonts, Phosphor Icons, and Print CSS System

**Files:**
- Modify: `client/package.json`
- Modify: `DESIGN.md`
- Modify: `client/index.html`
- Modify: `client/tailwind.config.js`
- Modify: `client/src/index.css`
- Modify: `client/src/main.tsx`
- Create: `client/src/utils/avatarTokens.ts`
- Create: `client/src/tests/DesignSystemTokens.test.ts`

**Interfaces:**
- Consumes: `PlayerRole` from `client/src/types/game.types.ts`
- Produces:
  - `TOKEN_SHAPES`, `PRESET_TOKEN_AVATARS`, `resolveTokenAvatar(avatarOrId: string, playerName?: string)` in `client/src/utils/avatarTokens.ts`
  - Tailwind classes: `bg-paper`, `bg-cardstock`, `bg-paper-muted`, `text-ink`, `text-ink-muted`, `bg-stamp`, `text-stamp`, `border-ink`, `border-stamp`, `shadow-print`, `shadow-print-sm`, `shadow-print-lg`, `shadow-print-red`, `font-display`, `font-sans`, `font-mono`
  - CSS utility classes: `.paper-grain`, `.halftone-dots`, `.card-back-hatch`, `.rubber-stamp`, `.rubber-stamp-red`

- [ ] **Step 1: Install `@phosphor-icons/react`, `@fontsource-variable/archivo`, and `@fontsource/jetbrains-mono`**

Run in root directory:
```bash
npm install --workspace=client @phosphor-icons/react @fontsource-variable/archivo @fontsource/jetbrains-mono
```

- [ ] **Step 2: Write the failing test in `client/src/tests/DesignSystemTokens.test.ts`**

Create `client/src/tests/DesignSystemTokens.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import {
  PRESET_TOKEN_AVATARS,
  resolveTokenAvatar,
  getPlayerInitials,
} from '../utils/avatarTokens';

describe('Tactile Board-Game Token Avatar System', () => {
  it('provides 12 distinct geometric tabletop token presets without emojis', () => {
    expect(PRESET_TOKEN_AVATARS).toHaveLength(12);
    const ids = new Set(PRESET_TOKEN_AVATARS.map((t) => t.id));
    expect(ids.size).toBe(12);
    for (const token of PRESET_TOKEN_AVATARS) {
      expect(token.id).toMatch(/^token-/);
      expect(token.name.length).toBeGreaterThan(2);
    }
  });

  it('maps legacy emoji avatars deterministically to geometric tokens', () => {
    const spyToken = resolveTokenAvatar('🕵️', 'Budi');
    expect(spyToken.id).toBe('token-eye');
    expect(spyToken.initials).toBe('BU');

    const foxToken = resolveTokenAvatar('🦊', 'Siti Nurhaliza');
    expect(foxToken.id).toBe('token-triangle');
    expect(foxToken.initials).toBe('SN');
  });

  it('extracts clean 2-letter uppercase initials from player names', () => {
    expect(getPlayerInitials('Agen Rahasia')).toBe('AR');
    expect(getPlayerInitials('Budi')).toBe('BU');
    expect(getPlayerInitials('X')).toBe('X');
    expect(getPlayerInitials('')).toBe('AG');
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run client/src/tests/DesignSystemTokens.test.ts`
Expected: FAIL with cannot find module `../utils/avatarTokens`.

- [ ] **Step 4: Create `client/src/utils/avatarTokens.ts` and update `DESIGN.md`, `index.html`, `tailwind.config.js`, `index.css`, and `main.tsx`**

Create `client/src/utils/avatarTokens.ts`:
```ts
export type TokenShape =
  | 'circle'
  | 'square'
  | 'diamond'
  | 'triangle'
  | 'hexagon'
  | 'octagon'
  | 'shield'
  | 'ticket'
  | 'stamp'
  | 'badge'
  | 'crest'
  | 'seal';

export type TokenIconKey =
  | 'eye'
  | 'detective'
  | 'compass'
  | 'key'
  | 'lightning'
  | 'crown'
  | 'skull'
  | 'star'
  | 'Crosshair'
  | 'fingerprint'
  | 'flame'
  | 'spade';

export interface TokenAvatarPreset {
  id: string;
  shape: TokenShape;
  iconKey: TokenIconKey;
  code: string;
  name: string;
  description: string;
  accentInverted?: boolean;
}

export const PRESET_TOKEN_AVATARS: TokenAvatarPreset[] = [
  { id: 'token-eye', shape: 'circle', iconKey: 'eye', code: '01', name: 'Mata Elang', description: 'Pengamat tajam' },
  { id: 'token-detective', shape: 'shield', iconKey: 'detective', code: '02', name: 'Inspektur', description: 'Detektif meja' },
  { id: 'token-triangle', shape: 'triangle', iconKey: 'compass', code: '03', name: 'Penjejak', description: 'Ahli arah' },
  { id: 'token-key', shape: 'square', iconKey: 'key', code: '04', name: 'Juru Kunci', description: 'Pemegang sandi' },
  { id: 'token-bolt', shape: 'diamond', iconKey: 'lightning', code: '05', name: 'Kilat Hitam', description: 'Eksekutor cepat' },
  { id: 'token-crown', shape: 'hexagon', iconKey: 'crown', code: '06', name: 'Komandan', description: 'Pemimpin sidang' },
  { id: 'token-skull', shape: 'octagon', iconKey: 'skull', code: '07', name: 'Bayangan', description: 'Saksi bisu' },
  { id: 'token-star', shape: 'stamp', iconKey: 'star', code: '08', name: 'Bintang', description: 'Kartu truf', accentInverted: true },
  { id: 'token-crosshair', shape: 'ticket', iconKey: 'Crosshair', code: '09', name: 'Penembak', description: 'Tepat sasaran' },
  { id: 'token-print', shape: 'badge', iconKey: 'fingerprint', code: '10', name: 'Sidik Jari', description: 'Bukti forensik' },
  { id: 'token-flame', shape: 'crest', iconKey: 'flame', code: '11', name: 'Api Unggun', description: 'Pemantik debat', accentInverted: true },
  { id: 'token-spade', shape: 'seal', iconKey: 'spade', code: '12', name: 'As Sekop', description: 'Kartu penentu' },
];

const LEGACY_EMOJI_MAP: Record<string, string> = {
  '🕵️': 'token-eye',
  '🤖': 'token-detective',
  '🦊': 'token-triangle',
  '🦅': 'token-crosshair',
  '🐺': 'token-skull',
  '🐱': 'token-key',
  '🐉': 'token-flame',
  '⚡': 'token-bolt',
  '🔮': 'token-star',
  '🕶️': 'token-print',
  '🎭': 'token-spade',
  '👑': 'token-crown',
};

export function getPlayerInitials(name?: string): string {
  const cleaned = (name || '').trim().replace(/[^a-zA-Z0-9\s]/g, ' ');
  if (!cleaned) return 'AG';
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  const single = parts[0];
  return single.slice(0, 2).toUpperCase();
}

export interface ResolvedTokenAvatar extends TokenAvatarPreset {
  initials: string;
}

export function resolveTokenAvatar(avatarOrId?: string, playerName?: string): ResolvedTokenAvatar {
  const initials = getPlayerInitials(playerName);
  const raw = (avatarOrId || '').trim();

  const direct = PRESET_TOKEN_AVATARS.find((t) => t.id === raw);
  if (direct) {
    return { ...direct, initials };
  }

  const mappedId = LEGACY_EMOJI_MAP[raw];
  if (mappedId) {
    const found = PRESET_TOKEN_AVATARS.find((t) => t.id === mappedId);
    if (found) return { ...found, initials };
  }

  // Deterministic fallback hash from name or avatar string
  const seedStr = raw || playerName || 'default';
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash * 31 + seedStr.charCodeAt(i)) >>> 0;
  }
  const preset = PRESET_TOKEN_AVATARS[hash % PRESET_TOKEN_AVATARS.length];
  return { ...preset, initials };
}
```

Update `client/tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#EEEDE7',
          muted: '#E2DFD5',
          dark: '#D5D2C8',
        },
        cardstock: {
          DEFAULT: '#FAF8F3',
          warm: '#F3F0E6',
        },
        ink: {
          DEFAULT: '#111111',
          muted: '#52514E',
          faint: '#85837E',
        },
        rule: '#C8C4B8',
        stamp: {
          DEFAULT: '#D92B2B',
          dark: '#B82020',
          light: '#FBE9E9',
        },
      },
      fontFamily: {
        sans: ['"Archivo Variable"', 'Archivo', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"Archivo Variable"', 'Archivo', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'print-sm': '2px 2px 0px 0px #111111',
        'print': '4px 4px 0px 0px #111111',
        'print-lg': '6px 6px 0px 0px #111111',
        'print-red': '4px 4px 0px 0px #D92B2B',
        'print-inset': 'inset 0 0 0 1px #111111',
      },
    },
  },
  plugins: [],
};
```

Update `client/index.html`:
```html
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <link rel="apple-touch-icon" href="/favicon.svg" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <meta name="theme-color" content="#EEEDE7" />
    <title>What's The Word - Permainan Kartu Deduksi Kata</title>
  </head>
  <body class="bg-paper text-ink antialiased selection:bg-stamp selection:text-cardstock min-h-[100dvh]">
    <div id="root" class="min-h-[100dvh] flex flex-col"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Update `client/src/main.tsx` to import self-hosted fonts:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/archivo';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Update `client/src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    color-scheme: light;
  }

  html, body {
    margin: 0;
    padding: 0;
    background-color: #EEEDE7;
    color: #111111;
    font-family: 'Archivo Variable', 'Archivo', -apple-system, BlinkMacSystemFont, sans-serif;
    min-height: 100dvh;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

/* Display Condensed Heading Utility */
.font-condensed {
  font-family: 'Archivo Variable', 'Archivo', sans-serif;
  font-variation-settings: 'wdth' 75, 'wght' 900;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

/* Fixed non-scrolling SVG paper grain overlay (zero scroll repaint cost) */
.paper-grain {
  background-image: radial-gradient(rgba(17, 17, 17, 0.055) 1px, transparent 0);
  background-size: 16px 16px;
}

/* Halftone dot pattern for board-game tokens and card backs */
.halftone-dots {
  background-image: radial-gradient(#111111 1.15px, transparent 1.15px);
  background-size: 6px 6px;
}

.halftone-dots-red {
  background-image: radial-gradient(#D92B2B 1.15px, transparent 1.15px);
  background-size: 6px 6px;
}

/* Crosshatch pattern for secret card back / envelope interior */
.card-back-hatch {
  background-color: #FAF8F3;
  background-image:
    repeating-linear-gradient(
      45deg,
      rgba(17, 17, 17, 0.08) 0px,
      rgba(17, 17, 17, 0.08) 2px,
      transparent 2px,
      transparent 8px
    ),
    repeating-linear-gradient(
      -45deg,
      rgba(17, 17, 17, 0.08) 0px,
      rgba(17, 17, 17, 0.08) 2px,
      transparent 2px,
      transparent 8px
    );
}

/* Rubber Stamp Treatments */
.rubber-stamp {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 2px solid #111111;
  padding: 0.15rem 0.55rem;
  font-family: 'Archivo Variable', 'Archivo', sans-serif;
  font-variation-settings: 'wdth' 80, 'wght' 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background-color: #FAF8F3;
  color: #111111;
  box-shadow: 2px 2px 0px #111111;
}

.rubber-stamp-red {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 2px solid #D92B2B;
  padding: 0.15rem 0.55rem;
  font-family: 'Archivo Variable', 'Archivo', sans-serif;
  font-variation-settings: 'wdth' 80, 'wght' 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background-color: #FBE9E9;
  color: #D92B2B;
  box-shadow: 2px 2px 0px #D92B2B;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Update `DESIGN.md` with the new Tactile Board-Game / Print specification.

- [ ] **Step 5: Run tests and typecheck, then commit**

Run: `npx vitest run client/src/tests/DesignSystemTokens.test.ts && npm run typecheck --workspace=client`
Expected: PASS

```bash
git add DESIGN.md client/package.json package-lock.json client/index.html client/tailwind.config.js client/src/index.css client/src/main.tsx client/src/utils/avatarTokens.ts client/src/tests/DesignSystemTokens.test.ts
git commit -m "feat(design): establish tactile board-game print tokens, Archivo font, and avatar token system"
```

---

### Task 2: Tactile Board-Game Primitives (`PlayerToken`, `Button`, `Card`, `Badge`, `Header`, `Modal`, `AvatarPicker`)

**Files:**
- Create: `client/src/components/game/PlayerToken.tsx`
- Modify: `client/src/components/game/AvatarPicker.tsx`
- Modify: `client/src/components/common/Button.tsx`
- Modify: `client/src/components/common/Card.tsx`
- Modify: `client/src/components/common/Badge.tsx`
- Modify: `client/src/components/common/Header.tsx`
- Modify: `client/src/components/common/Modal.tsx`
- Modify: `client/src/context/PassPlayContext.tsx:70-80`

**Interfaces:**
- Consumes: `resolveTokenAvatar`, `PRESET_TOKEN_AVATARS` from `client/src/utils/avatarTokens.ts`
- Produces:
  - `<PlayerToken avatar={string} name={string} size?: 'sm' | 'md' | 'lg' | 'xl' eliminated?: boolean selected?: boolean isHost?: boolean />`
  - Print-styled `Button`, `Card`, `Badge`, `RoleBadge`, `StatusBadge`, `Header`, `Modal`, `AvatarPicker` preserving all existing prop types so downstream pages compile without breaking.

- [ ] **Step 1: Add unit test in `client/src/tests/DesignSystemTokens.test.ts` for `PRESET_AVATARS` compatibility**

Append to `client/src/tests/DesignSystemTokens.test.ts`:
```ts
import { PRESET_AVATARS } from '../components/game/AvatarPicker';

describe('AvatarPicker Preset Compatibility', () => {
  it('exports PRESET_AVATARS with token IDs in emoji field for backward compatibility', () => {
    expect(PRESET_AVATARS.length).toBe(12);
    expect(PRESET_AVATARS[0].id).toBe('token-eye');
    expect(PRESET_AVATARS[0].emoji).toBe('token-eye');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run client/src/tests/DesignSystemTokens.test.ts`
Expected: FAIL (`PRESET_AVATARS[0].id` is currently `'cyber-agent'`).

- [ ] **Step 3: Create `PlayerToken.tsx` and overhaul `AvatarPicker.tsx`, `Button.tsx`, `Card.tsx`, `Badge.tsx`, `Header.tsx`, `Modal.tsx`, and `PassPlayContext.tsx` default roster**

Create `client/src/components/game/PlayerToken.tsx`:
- Renders a physical board-game die-cut token with `2px solid #111111`, hard offset shadow `shadow-print-sm`, corner code (`01`..`12`), geometric frame, halftone background accent, player initials in `font-condensed`, and a small Phosphor icon (`Eye`, `Detective`, `Compass`, `Key`, `Lightning`, `Crown`, `Skull`, `Star`, `Crosshair`, `Fingerprint`, `Flame`, `Spade`).
- When `selected` or `accentInverted` is true, renders with vermilion red `#D92B2B` border/fill.
- When `eliminated` is true, renders with muted ink and a red diagonal strike/stamp mark.

Update `client/src/components/game/AvatarPicker.tsx`:
- Export `PRESET_AVATARS` mapped from `PRESET_TOKEN_AVATARS` (setting `emoji: token.id` so existing `PRESET_AVATARS[0].emoji` callers receive `'token-eye'`).
- Replace `RANDOM_NICKNAMES` with Indonesian tabletop names (`Saksi_Meja`, `Bung_Kartu`, `Detektif_Senja`, `Tuan_Tinta`, `Nona_Sandi`, `Hakim_Garis`, `Kurir_Kertas`, `Penjaga_Pos`, `Agen_Merah`, `Juru_Arsip`, `Kapten_Dadu`, `Saudagar_Kata`).
- Render a 3x4 or 4x3 grid of `<PlayerToken />` tiles with cardstock border and red stamp active state.

Update `Button.tsx`:
- `primary`: `bg-stamp text-cardstock border-2 border-ink shadow-print-sm hover:bg-stamp-dark active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-bold uppercase tracking-wider`
- `secondary`: `bg-cardstock text-ink border-2 border-ink shadow-print-sm hover:bg-paper-muted active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-bold`
- `danger`: `bg-stamp-light text-stamp border-2 border-stamp shadow-print-sm hover:bg-stamp hover:text-cardstock active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-bold uppercase`
- `accent`: `bg-ink text-cardstock border-2 border-ink shadow-print-sm hover:bg-ink-muted active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-bold uppercase`
- `outline`: `bg-transparent text-ink border-2 border-ink hover:bg-paper-muted font-semibold`
- `ghost`: `bg-transparent text-ink-muted hover:text-ink hover:bg-paper-muted border-2 border-transparent`
- Replace `Loader2` from `lucide-react` with `SpinnerGap` from `@phosphor-icons/react`.

Update `Card.tsx`:
- Physical cardstock container: `rounded-lg bg-cardstock border-2 border-ink shadow-print text-ink`.
- `glow` prop mapped to print variants: `'crimson'` -> `border-stamp shadow-print-red`, others -> `border-ink shadow-print`.

Update `Badge.tsx`:
- Rubber stamp aesthetic (`rounded-sm border-2 font-mono uppercase tracking-wider font-bold`).
- `RoleBadge`:
  - `CIVILIAN`: black ink stamp (`border-ink bg-cardstock text-ink`) with ` Stamp / ShieldCheck` icon -> `WARGA`
  - `UNDERCOVER`: vermilion red stamp (`border-stamp bg-stamp-light text-stamp`) with `Detective` icon -> `IMPOSTOR`
  - `MR_WHITE`: dashed blank stamp (`border-dashed border-ink bg-paper text-ink-muted`) with `Question` icon -> `MR. WHITE (TANPA KATA)`

Update `Header.tsx`:
- Tabletop header bar (`bg-cardstock border-b-2 border-ink`), printed ticket badge for `KODE MEJA: XXXX` with copy button, and tactile sound toggle button using Phosphor `SpeakerHigh` / `SpeakerSlash` and `ArrowLeft`.

Update `Modal.tsx`:
- Dossier dialog card (`bg-cardstock border-2 border-ink shadow-print-lg rounded-lg text-ink`), ink header bar with corner close button (`X` from `@phosphor-icons/react`).

Update `DEFAULT_INITIAL_PLAYERS` in `client/src/context/PassPlayContext.tsx`:
- Use Indonesian tabletop names (`Penjaga Meja`, `Tuan Kertas`, `Nona Tinta`, `Saksi Kunci`) and token IDs (`token-eye`, `token-triangle`, `token-detective`, `token-bolt`).

- [ ] **Step 4: Run tests and typecheck**

Run: `npx vitest run client/src/tests/DesignSystemTokens.test.ts && npm run typecheck --workspace=client`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add client/src/components/game/PlayerToken.tsx client/src/components/game/AvatarPicker.tsx client/src/components/common/Button.tsx client/src/components/common/Card.tsx client/src/components/common/Badge.tsx client/src/components/common/Header.tsx client/src/components/common/Modal.tsx client/src/context/PassPlayContext.tsx client/src/tests/DesignSystemTokens.test.ts
git commit -m "feat(ui): rebuild core primitives and geometric halftone PlayerToken in print style"
```

---

### Task 3: Illustrated Box-Lid `HomePage` & Tabletop `ProfileModal` + `CustomWordPackModal`

**Files:**
- Create: `client/public/assets/box-lid-art.png` (generated via `image-generator` subagent)
- Create: `client/public/assets/gameover-art.png` (generated via `image-generator` subagent)
- Modify: `client/src/pages/HomePage.tsx`
- Modify: `client/src/components/lobby/ProfileModal.tsx`
- Modify: `client/src/components/lobby/CustomWordPackModal.tsx`

**Interfaces:**
- Consumes: `Header`, `Button`, `Card`, `Badge`, `PlayerToken`, `ProfileModal`, `CustomWordPackModal`, `useSocket`
- Produces: Board-game box-lid `HomePage` with two tilted physical mode cards, player token strip, and Jackbox-style room code entry.

- [ ] **Step 1: Generate the 2 print illustrations (`box-lid-art.png` and `gameover-art.png`)**

Invoke the `image-generator` subagent (or fallback SVG/canvas generator if quota-limited) to save:
1. `client/public/assets/box-lid-art.png`: Vintage 2-color risograph / linocut board-game box lid illustration on `#FAF8F3` cream paper using only solid `#111111` black ink and `#D92B2B` vermilion red ink: a tabletop scene of hands holding secret playing cards, a magnifying glass, and a rubber stamp, flat screenprint aesthetic, no gradients.
2. `client/public/assets/gameover-art.png`: Vintage 2-color risograph / linocut illustration on `#FAF8F3` cream paper using `#111111` black ink and `#D92B2B` vermilion red ink: an opened secret dossier folder on a table with revealed cards and a rubber stamp, flat screenprint aesthetic.

- [ ] **Step 2: Redesign `HomePage.tsx` as a physical Board-Game Box Lid**

In `client/src/pages/HomePage.tsx`:
- Top Box-Lid Masthead:
  - Framed like a printed board-game box cover (`border-2 border-ink bg-cardstock shadow-print p-5 sm:p-7 relative overflow-hidden`).
  - Corner catalog specs in mono (`3-20 PEMAIN`, `DURASI 10 MENIT`, `64+ PASANG KATA`).
  - Giant `font-condensed` headline `WHAT'S THE WORD` with a rotated red rubber stamp `RAHASIA MEJA` (`-rotate-2 rubber-stamp-red`).
  - Box-lid illustration banner (`/assets/box-lid-art.png`) framed with a `2px solid #111111` border and halftone caption strip explaining the 3 roles via physical stamp tags (`WARGA: KATA SAMA`, `IMPOSTOR: KATA MIRIP`, `MR. WHITE: KARTU KOSONG`).
- Two Stacked / Tilted Mode Cards (`grid grid-cols-1 md:grid-cols-2 gap-6`):
  - **Card 01 - MAIN SATU HP (PASS & PLAY):** Slightly tilted on desktop (`md:-rotate-[0.8deg] hover:rotate-0 transition-transform`), numbered die-cut tab `MODE 01`, tactile checklist, and primary button `Buka Meja 1 HP`.
  - **Card 02 - RUANGAN ONLINE (MULTI-HP):** Slightly tilted opposite (`md:rotate-[0.8deg] hover:rotate-0 transition-transform`), numbered die-cut tab `MODE 02`, live connection stamp, player token profile bar (showing `<PlayerToken />` + name + `Ubah Token`), and clean tab switch (`BUAT MEJA` / `MASUK KODE`) with large uppercase 4-character Jackbox-style room code input (`font-mono text-2xl tracking-[0.35em] uppercase bg-paper border-2 border-ink`).
- Bottom Dossier Strip:
  - Button to open `CustomWordPackModal` (`Kelola Paket Kata Kustom`) styled as an index card tab.

- [ ] **Step 3: Restyle `ProfileModal.tsx` and `CustomWordPackModal.tsx` to tactile cardstock & Phosphor icons**

- In `ProfileModal.tsx`: Replace all `lucide-react` icons with `@phosphor-icons/react`, render `<PlayerToken />` preview at top, and use `<AvatarPicker />` token grid.
- In `CustomWordPackModal.tsx`: Replace all `lucide-react` icons with `@phosphor-icons/react`, style word-pair cards as perforated index cards (`bg-paper border-2 border-ink shadow-print-sm`), and replace any em-dashes with regular hyphens.

- [ ] **Step 4: Run typecheck and tests**

Run: `npm run typecheck --workspace=client && npm test --workspace=client`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add client/public/assets/ client/src/pages/HomePage.tsx client/src/components/lobby/ProfileModal.tsx client/src/components/lobby/CustomWordPackModal.tsx
git commit -m "feat(home): redesign HomePage as board-game box lid with print modals"
```

---

### Task 4: Envelope Slide-Out `SecretCard`, `PassPlaySecretView`, and `PassPlaySetupPage`

**Files:**
- Modify: `client/src/components/game/SecretCard.tsx`
- Modify: `client/src/components/game/PassPlaySecretView.tsx`
- Modify: `client/src/pages/PassPlaySetupPage.tsx`

**Interfaces:**
- Consumes: `PlayerRole`, `usePassPlay`, `PlayerToken`, `useGameSound`
- Produces:
  - Physical envelope/sleeve `SecretCard` where pressing & holding (or dragging upward) slides the inner cardstock card out of the sleeve (`translateY`) to reveal the secret word & role stamp, and releasing slides it back inside immediately.
  - Tabletop `PassPlaySecretView` and `PassPlaySetupPage` with zero `lucide-react` imports and zero dark-mode zinc leftovers.

- [ ] **Step 1: Overhaul `SecretCard.tsx` into an Envelope / Sleeve Slide-Out Card**

In `client/src/components/game/SecretCard.tsx`:
- Keep exact `SecretCardProps` (`word`, `role`, `category`, `onRevealed`, `className`).
- Visual structure:
  - Outer container is a physical kraft/cardstock sleeve (`bg-paper-muted border-2 border-ink shadow-print-lg rounded-lg p-5 relative overflow-hidden select-none`) with a semi-circular thumb notch cut out at the top edge and a rotated red rubber stamp `DOKUMEN RAHASIA` on the front pocket.
  - Inside the sleeve sits the **Inner Secret Card** (`bg-cardstock border-2 border-ink shadow-print rounded-md p-5`).
  - When `isHolding` is `false`: the inner card is tucked inside the pocket (`y: 96`, covered by the front pocket flap) showing only its top header tab (`TAHAN KARTU UNTUK GESER & INTIP`) and crosshatch back pattern (`.card-back-hatch`).
  - When `isHolding` is `true`: Motion spring (`stiffness: 320, damping: 26`) slides the inner card upward (`y: 0`) out of the pocket, revealing:
    - Category index stamp at top right
    - For `MR_WHITE`: dashed blank frame + `MR. WHITE - TANPA KATA` stamp + instruction `"Kamu tidak mendapat kata. Dengarkan petunjuk pemain lain dan menebaklah saat terdesak!"`
    - For `CIVILIAN` / `UNDERCOVER`: large condensed secret word (`font-condensed text-4xl sm:text-5xl text-ink tracking-tight py-2 border-y-2 border-ink`) + footer note `"Rahasiakan kata ini. Jangan sampai terlihat pemain lain."`
  - Releasing finger/mouse (`onMouseUp`, `onMouseLeave`, `onTouchEnd`, `onTouchCancel`) immediately sets `isHolding = false`, sliding the card back into the envelope pocket.

- [ ] **Step 2: Redesign `PassPlaySecretView.tsx` and `PassPlaySetupPage.tsx` in Tabletop Print Style**

In `client/src/components/game/PassPlaySecretView.tsx`:
- Keep `isTransitioning` double-tap lock and `safeRevealIndex` bounds from Task 1.
- Replace emoji box with `<PlayerToken avatar={currentPlayer.avatar} name={currentPlayer.name} size="xl" />`.
- Style the 3 sub-screens (`PASS_PROMPT`, `REVEAL_CARD`, `DONE_PROMPT`) as physical instruction cards with stamped step headers (`GILIRAN PEMAIN #X`, `KATA TERKUNCI`), stacked paper edge effect (`after:content-['']`), and Phosphor icons (`HandPalm`, `CheckCircle`, `ArrowRight`, `SealCheck`).

In `client/src/pages/PassPlaySetupPage.tsx`:
- Replace all `lucide-react` icons with `@phosphor-icons/react`.
- Render the player roster as numbered tabletop seat cards with `<PlayerToken />`, inline name editing / removal, and role distribution tickets (`WARGA`, `IMPOSTOR`, `MR. WHITE`) styled as perforated print tickets (`border-2 border-ink bg-cardstock shadow-print-sm`).

- [ ] **Step 3: Run tests and typecheck**

Run: `npm run typecheck --workspace=client && npm test --workspace=client`
Expected: PASS

- [ ] **Step 4: Commit changes**

```bash
git add client/src/components/game/SecretCard.tsx client/src/components/game/PassPlaySecretView.tsx client/src/pages/PassPlaySetupPage.tsx
git commit -m "feat(passplay): implement envelope slide-out SecretCard and print setup screens"
```

---

### Task 5: Vote-Token `VotingGrid`, Strip `CountdownTimer`, Discussion/Voting Views, `LobbyPage`, `RoomGamePage`, `PassPlayGamePage`, and `MrWhiteModal`

**Files:**
- Modify: `client/src/components/game/CountdownTimer.tsx`
- Modify: `client/src/components/game/VotingGrid.tsx`
- Modify: `client/src/components/game/PassPlayVotingView.tsx`
- Modify: `client/src/components/game/MrWhiteModal.tsx`
- Modify: `client/src/pages/LobbyPage.tsx`
- Modify: `client/src/pages/PassPlayGamePage.tsx`
- Modify: `client/src/pages/RoomGamePage.tsx`

**Interfaces:**
- Consumes: `PlayerToken`, `CountdownTimer`, `VotingGrid`, `SecretCard`, `MrWhiteModal`
- Produces: Complete tabletop voting, timer strip, online lobby, active game room, and game-over summary screens.

- [ ] **Step 1: Redesign `CountdownTimer.tsx` as a Shrinking Print Ruler / Fuse Strip**

In `client/src/components/game/CountdownTimer.tsx`:
- Preserve audio tick hooks (`playTick`, `playUrgentTick`) and props (`totalSeconds`, `remainingSeconds`, `variant`, `speakerName`, `label`).
- Style `linear`, `compact`, and `circular` variants in litho ink (`#111111`) + vermilion stamp red (`#D92B2B`) when urgent (`<= 10s`):
  - High-contrast mono数字 readout (`00:45`) inside a stamped ticket box (`border-2 border-ink bg-cardstock shadow-print-sm`).
  - Linear progress bar inside a `border-2 border-ink bg-paper h-4` track with diagonal hatch marks and a solid `#111111` bar that turns `#D92B2B` when `clampedRemaining <= 10`.

- [ ] **Step 2: Redesign `VotingGrid.tsx` and `PassPlayVotingView.tsx` with Physical Vote Tokens and Elimination Stamps**

In `client/src/components/game/VotingGrid.tsx` and `client/src/components/game/PassPlayVotingView.tsx`:
- Player cards are rendered in a 2-column grid of physical dossier cards (`bg-cardstock border-2 border-ink shadow-print-sm p-3.5 relative`) featuring `<PlayerToken />`, player name, and seat index.
- Selecting a suspect animates a circular red **Vote Token** (`w-9 h-9 rounded-full bg-stamp text-cardstock border-2 border-ink shadow-print-sm font-condensed text-[10px] flex items-center justify-center -rotate-12`) onto the card (`SUARA`).
- Eliminated players display a rotated red rubber stamp (`rubber-stamp-red -rotate-6`) reading `TERELIMINASI` across their card.
- Replace all `lucide-react` icons with `@phosphor-icons/react` and remove all `&mdash;` / `—` characters.

- [ ] **Step 3: Redesign `MrWhiteModal.tsx`, `LobbyPage.tsx`, `PassPlayGamePage.tsx`, and `RoomGamePage.tsx`**

- In `MrWhiteModal.tsx`: Style as an urgent `INTEROGASI DARURAT MR. WHITE` dossier modal with red stamp border (`border-2 border-stamp`), typewriter mono prompt, and high-contrast input (`bg-paper border-2 border-ink text-ink`).
- In `LobbyPage.tsx`:
  - Giant stamped room code ticket (`KODE MEJA: XXXX`) with copy & share link buttons.
  - Player seat grid showing connected `<PlayerToken />` cards and empty dashed seat slots (`KURSI KOSONG`).
  - Host control panel styled as a printed rulebook sheet.
- In `PassPlayGamePage.tsx` and `RoomGamePage.tsx`:
  - Paper background (`bg-paper`) with fixed `.paper-grain` overlay.
  - Game Over summary screen features `/assets/gameover-art.png`, a giant `font-condensed` victory headline (`KEMENANGAN WARGA!` / `KEMENANGAN IMPOSTOR!` / `KEMENANGAN MR. WHITE!`), side-by-side secret word comparison tickets (`KATA WARGA` vs `KATA IMPOSTOR`), and the full player dossier ledger showing each player's `<PlayerToken />`, `<RoleBadge />`, secret word, and `BERTAHAN` / `TERELIMINASI` stamp.

- [ ] **Step 4: Run typecheck and tests**

Run: `npm run typecheck && npm test && npm test --workspace=client`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add client/src/components/game/CountdownTimer.tsx client/src/components/game/VotingGrid.tsx client/src/components/game/PassPlayVotingView.tsx client/src/components/game/MrWhiteModal.tsx client/src/pages/LobbyPage.tsx client/src/pages/PassPlayGamePage.tsx client/src/pages/RoomGamePage.tsx
git commit -m "feat(game): redesign voting, timer, lobby, and game-over screens in tactile print style"
```

---

### Task 6: Anti-Slop Pre-Flight Audit, Dependency Cleanup, and Automated Regression Suite

**Files:**
- Modify: `client/package.json` (remove `lucide-react`)
- Create: `client/src/tests/AntiSlopPreFlight.test.ts`

**Interfaces:**
- Consumes: All `.ts` and `.tsx` source files under `client/src`
- Produces: Automated pre-flight verification test suite guaranteeing zero `lucide-react` imports, zero em-dashes (`—` / `–` / `&mdash;`), and zero dark-SaaS neon glow regressions.

- [ ] **Step 1: Write `client/src/tests/AntiSlopPreFlight.test.ts`**

Create `client/src/tests/AntiSlopPreFlight.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

function collectSourceFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'tests' && entry.name !== 'data') {
      files.push(...collectSourceFiles(full));
    } else if (entry.isFile() && /\.(tsx|ts)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

describe('Anti-Slop Pre-Flight Audit (design-taste-frontend)', () => {
  const srcDir = path.resolve(__dirname, '..');
  const files = collectSourceFiles(srcDir);

  it('has zero lucide-react imports remaining in client/src', () => {
    const offenders = files.filter((f) => fs.readFileSync(f, 'utf-8').includes('lucide-react'));
    expect(offenders).toEqual([]);
  });

  it('has zero em-dashes or &mdash; entities in UI components and pages', () => {
    const offenders: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('—') || content.includes('&mdash;')) {
        offenders.push(path.relative(srcDir, file));
      }
    }
    expect(offenders).toEqual([]);
  });

  it('has zero legacy dark-SaaS neon backdrop-blur card classes in pages and components', () => {
    const offenders: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('bg-zinc-900') || content.includes('bg-slate-900') || content.includes('shadow-cyan-950')) {
        offenders.push(path.relative(srcDir, file));
      }
    }
    expect(offenders).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the pre-flight audit test and fix any remaining occurrences, then uninstall `lucide-react`**

Run:
```bash
npm uninstall --workspace=client lucide-react
npx vitest run client/src/tests/AntiSlopPreFlight.test.ts
npm run typecheck
npm run build
```
Expected: All pre-flight checks PASS, `npm run typecheck` and `npm run build` succeed with 0 errors.

- [ ] **Step 3: Commit final audit and cleanup**

```bash
git add client/package.json package-lock.json client/src/
git commit -m "test(ui): add anti-slop pre-flight audit and remove lucide-react"
```
