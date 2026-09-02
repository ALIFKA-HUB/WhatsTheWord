# Undercover Web Game - Master DESIGN.md

> **Quick Reference:** See [2026-09-02-undercover-game-ui-design.md](file:///c:/Users/ASUS/Documents/ALIFKA/PROJECT-PKL/skoolia/docs/superpowers/specs/2026-09-02-undercover-game-ui-design.md) for the complete comprehensive specification.

## Core Visual Tokens & Rules

- **Theme Base**: Deep Void Navy (`#080c16`), Surface Glass (`rgba(15, 23, 42, 0.82)`), Hairline Border (`rgba(255, 255, 255, 0.08)`).
- **Role Accents**:
  - Civilian (Warga): `#06b6d4` (Cyan Glow)
  - Undercover (Impostor): `#f43f5e` (Crimson Neon)
  - Mr. White (Blank): `#a855f7` (Violet Glow)
  - Timer / Alert: `#f59e0b` (Amber)
- **Typography**: Display/Headlines in `Outfit` / `Cabinet Grotesk`, Mono for codes/timers in `Geist Mono` / `JetBrains Mono`.
- **Viewport Rule**: `min-h-[100dvh]` on all top containers, mobile-first responsive layout (`max-w-md` mobile, `max-w-2xl` desktop).
- **Motion**: Spring physics (`stiffness: 350, damping: 25`), touch-and-hold secret reveal card, tactile button push (`active:scale-[0.97]`).
