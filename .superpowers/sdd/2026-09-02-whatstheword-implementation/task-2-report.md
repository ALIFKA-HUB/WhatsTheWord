# Task 2 Report: Core Domain Logic - Game Engine, Indonesian Word Bank & Fuzzy Matcher

## Execution Summary

- **Status:** DONE
- **Commit:** `35028bd` (`feat(engine): implement game engine, word bank, and fuzzy matcher`)
- **Test Summary:** 2 test suites passed, 28 tests passed (100%), 0 failed in 996ms.

---

## Implemented Deliverables

### 1. Indonesian Word Bank (`server/src/data/defaultWordPacks.ts` & `client/src/data/defaultWordPacks.ts`)
- **64 curated, balanced Indonesian word pairs** categorized across 5 official categories:
  - `Makanan & Minuman` (14 pairs: Kopi/Teh, Bakso/Mie Ayam, Rendang/Gulai, Martabak Manis/Terang Bulan, Nasi Padang/Nasi Uduk, etc.)
  - `Hewan` (13 pairs: Kucing/Harimau, Bebek/Ayam, Paus/Lumba-lumba, Elang/Burung Hantu, Kelinci/Hamster, etc.)
  - `Benda & Gadget` (13 pairs: Laptop/Komputer, Smartphone/Tablet, Headphone/Earphone, Kipas Angin/AC, Jam Tangan/Jam Dinding, etc.)
  - `Tempat & Hiburan` (12 pairs: Bioskop/Teater, Pantai/Danau, Supermarket/Pasar Tradisional, Museum/Perpustakaan, Hotel/Villa, etc.)
  - `Profesi` (12 pairs: Dokter/Perawat, Pilot/Masinis, Polisi/Tentara, Koki/Barista, Guru/Dosen, etc.)
- Exported helper functions: `getRandomWordPair(category?)`, `getWordPairsByCategory(category?)`, `DEFAULT_WORD_PACKS`, `DEFAULT_WORD_PAIRS`, and `CATEGORIES`.

### 2. Levenshtein Fuzzy Matcher (`server/src/engine/FuzzyMatcher.ts` & `client/src/utils/fuzzyMatcher.ts`)
- **Indonesian Normalization (`normalizeText`)**:
  - Lowercase conversion.
  - Punctuation and symbol stripping (e.g. `lumba-lumba` -> `lumbalumba`, `teh, botol.` -> `teh botol`).
  - Whitespace trimming and multiple spaces collapse.
- **Dynamic Programming Levenshtein Distance (`levenshteinDistance`)**:
  - Optimal Wagner-Fischer 2D array matrix comparison.
- **Adaptive Length Tolerance Matching (`isFuzzyMatch`)**:
  - Length < 4: Exact match only (`tolerance = 0`).
  - Length 4 - 7: Max 1 typo allowed (`tolerance = 1`).
  - Length > 7: Max 2 typos allowed (`tolerance = 2`).
  - Custom override via `options.maxDistance`.
- Provided static class wrapper `FuzzyMatcher.isMatch()`, `FuzzyMatcher.distance()`, and `FuzzyMatcher.normalize()`.

### 3. Game Engine (`server/src/engine/GameEngine.ts` & `client/src/utils/gameEngine.ts`)
- **Role Assignment (`assignRoles`)**:
  - Distributes `CIVILIAN`, `UNDERCOVER`, and `MR_WHITE` based on `GameSettings`.
  - Assigns civilian words, undercover words, and blank word (`''`) for Mr. White.
  - Shuffles roles using Fisher-Yates shuffle algorithm.
  - Generates randomized speaking order (`speakingOrder: string[]`).
- **Vote Tally with Instant Skip Elimination (`calculateVotes`)**:
  - Aggregates secret votes cast by active players.
  - Handles clear majority elimination (`isTie: false, eliminatedPlayerId: winnerId`).
  - **Instant Skip Rule**: Returns `isTie: true, eliminatedPlayerId: null` whenever 2 or more candidates share the highest vote count or when no votes are cast.
- **Win Condition Checking (`checkWinCondition`)**:
  - `CIVILIAN`: When all Undercovers and Mr. Whites are eliminated.
  - `UNDERCOVER`: When alive Undercovers >= alive Civilians.
  - `MR_WHITE`: When Mr. White survives into the final 2 players.
  - `null`: When game is actively ongoing.

---

## Test Execution Results

```
 RUN  v3.2.7 server/

 ✓ tests/FuzzyMatcher.test.ts (14 tests) 12ms
 ✓ tests/GameEngine.test.ts (14 tests) 19ms

 Test Files  2 passed (2)
      Tests  28 passed (28)
   Start at  10:39:24
   Duration  996ms
```

### TypeScript Validation
- `server`: `npm run typecheck` passed with 0 errors.
- `client`: `npm run typecheck` passed with 0 errors.
