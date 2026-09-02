# Design System & UI/UX Specification: Undercover Web

> **File:** `DESIGN.md`  
> **Topic:** Undercover Word Deduction Game  
> **Aesthetic Family:** Sleek Dark Cyber & Suspenseful Modern  
> **Dials:** `DESIGN_VARIANCE: 8` | `MOTION_INTENSITY: 7` | `VISUAL_DENSITY: 5`  
> **Reference Standard:** `design-taste-frontend` & `stitch-design-taste` Anti-Slop Directives

---

## 1. Visual Theme & Atmosphere

An immersive, high-suspense dark interface tailored for mobile screens and modern desktop viewports. The aesthetic evokes a high-stakes intelligence briefing room: deep midnight tones, precision hairline borders, crisp typography, and high-contrast glowing role identifiers (Civilian Cyan, Undercover Crimson, Mr. White Violet).

The atmosphere is tactile, responsive, and confident—every tap feels immediate, role reveals are protected by physics-based hold-to-reveal interactions, and voting transitions build tension through animated pulse rings and countdown timers.

---

## 2. Color Palette & Roles

| Token Name | Hex / RGBA | Role & Functional Use |
|---|---|---|
| **Deep Void Navy** | `#080c16` | Main background surface (`min-h-[100dvh]`) |
| **Surface Glass** | `rgba(15, 23, 42, 0.82)` | Primary card and modal container backgrounds with backdrop-blur |
| **Surface Highlight** | `rgba(30, 41, 59, 0.60)` | Hovered cards, selected states, button secondary fills |
| **Hairline Border** | `rgba(255, 255, 255, 0.08)` | 1px subtle container borders, separating lines |
| **Active Glow Border** | `rgba(6, 182, 212, 0.40)` | Focus states, active speaker ring, selected vote targets |
| **Civilian Cyan** | `#06b6d4` | Warga identity, safe status, primary positive CTAs |
| **Undercover Crimson** | `#f43f5e` | Impostor identity, danger/elimination alerts, high-tension states |
| **Mr. White Violet** | `#a855f7` | Mystery role identity, emergency guess modal, wildcard tags |
| **Timer Amber** | `#f59e0b` | Countdown timer warnings (< 10 seconds remaining) |
| **Text Pure Primary** | `#f8fafc` | Main titles, secret words, player names, button labels |
| **Text Muted Steel** | `#94a3b8` | Subtext, role hints, category names, metadata |

### Color Integrity Rules:
- **No generic AI purple/blue gradient soup**: Gradients are strictly restrained to subtle radial backdrops behind the active card.
- **No pure black (`#000000`)**: All dark backgrounds use rich deep charcoal/navy tones.
- **Strict WCAG AA contrast**: White text over dark glass surfaces satisfies > 7:1 contrast ratio.

---

## 3. Typography Architecture

- **Display & Headlines**: `Cabinet Grotesk` or `Outfit` (Fallback: `system-ui, sans-serif`)
  - Tight tracking (`tracking-tight`), uppercase labels (`tracking-wider`), weight-driven hierarchy (`font-bold`, `font-extrabold`).
- **Body & Captions**: `Satoshi` or `Geist` (Fallback: `system-ui, sans-serif`)
  - Clean, legible at small sizes on mobile, relaxed line height (`leading-relaxed`), max-width `60ch`.
- **Monospace (Codes, Timers & Numbers)**: `JetBrains Mono` or `Geist Mono`
  - Used for 4-digit Room Codes (`tracking-widest font-mono text-2xl`), countdown timer digits (`tabular-nums`), and player count badges.

### Typography Hierarchy:
```
Hero / Room Code:   text-3xl md:text-5xl font-black tracking-tight
Screen Title:       text-2xl md:text-3xl font-bold tracking-tight text-slate-100
Secret Word:        text-3xl md:text-4xl font-extrabold tracking-wide text-cyan-400
Section Header:     text-sm uppercase tracking-widest font-semibold text-slate-400
Body Copy:          text-base font-normal text-slate-300
Micro Metadata:     text-xs font-mono text-slate-400
```

---

## 4. Component Behaviors & Tactile States

### 4.1 Secret Role Card (`<SecretCard />`)
- **Idle State**: Obscured with a holographic glass pattern and a prominent *"Tahan untuk Intip Kata"* (Press & Hold) interactive touch target.
- **Holding State**: Realtime blur reduction (CSS backdrop-blur de-filters to crisp view), haptic pulse (or audio chime), revealing the role badge and secret word.
- **Release State**: Instantly re-masks the word to prevent snooping from neighboring players.
- **Pass & Play Mode**: Features a prominent *"Lanjut ke Pemain Berikutnya"* button after viewing.

### 4.2 Turn Indicator & Radar (`<TurnIndicator />`)
- Visual spotlight highlighting the currently speaking player with an animated cyan/amber halo ring (`ring-2 ring-cyan-500/50 ring-offset-2 ring-offset-[#080c16]`).
- Clean visual sequence list showing upcoming speakers.

### 4.3 Countdown Timer (`<CountdownTimer />`)
- High-contrast circular progress ring or sleek linear bar.
- Color progression:
  - $\ge 15$s: Cyan `#06b6d4`
  - $6-14$s: Amber `#f59e0b`
  - $\le 5$s: Crimson `#f43f5e` + synchronized rapid audio tick.

### 4.4 Voting Ballot Grid (`<VotingGrid />`)
- Grid of player cards (2-column on mobile, 3-4 column on tablet/desktop).
- Tap on card selects target with a tactile push (`scale-[0.98]`) and a crimson/amber glow border.
- Floating *"Konfirmasi Vote"* button with instant tactile feedback.

### 4.5 Mr. White Emergency Intercept Modal (`<MrWhiteModal />`)
- Dramatic dark modal overlay with violet spotlight glow.
- Large input field with autofocus: *"Tebak Kata Warga..."*.
- Live 45s countdown timer with pulse animation.

---

## 5. Layout & Responsive Architecture

- **Mobile First Constraint**:
  - All screens designed strictly within `min-h-[100dvh]` container to prevent iOS Safari viewport jumping.
  - Safe area inset padding for bottom navigation and top notch.
  - Central interactive cards bounded by `max-w-md mx-auto` on mobile and `max-w-2xl mx-auto` on desktop.
- **No Horizontal Overflow**:
  - Zero `overflow-x-hidden` hacks masking runaway widths; all grids strictly collapse to 1 or 2 columns on mobile viewports (< 640px).

---

## 6. Motion Philosophy & Micro-Interactions

- **Physics Engine**: Motion (`motion/react`) with spring physics:
  - Snappy UI Pop: `{ type: "spring", stiffness: 350, damping: 25 }`
  - Card Flip / Modal Slide: `{ type: "spring", stiffness: 260, damping: 20 }`
- **Tactile Active Push**:
  - Buttons and cards use `active:scale-[0.97]` and `transition-transform duration-100`.
- **Perpetual Micro-Interactions**:
  - Speaking player avatar has a subtle continuous breathing glow (`animate-pulse`).
  - Active turn timer has smooth SVG stroke dashoffset transition.

---

## 7. Anti-Patterns & Banned Clichés (Anti-Slop)

1. ❌ **No AI-Purple Gradient Blobs**: Use structured, layered slate surfaces with intentional single-color accent glows.
2. ❌ **No Plain Generic Typography**: No unstyled default Inter or times serifs.
3. ❌ **No `h-screen` Layouts**: Always use `min-h-[100dvh]` to avoid broken mobile Safari address bar scrolling.
4. ❌ **No Emojis as UI Icons**: Use standard Lucide or Phosphor SVG glyphs with uniform `1.5px` or `2.0px` stroke weight.
5. ❌ **No Static Dead States**: Every action (holding card, casting vote, starting timer, guessing word) provides immediate visual + audio feedback.
6. ❌ **No Unreadable Buttons**: Button text must always have AA contrast ratio (> 4.5:1) against its background.
