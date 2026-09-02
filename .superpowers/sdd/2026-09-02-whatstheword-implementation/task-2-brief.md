# Task 2 Brief: Core Domain Logic - Game Engine, Indonesian Word Bank & Fuzzy Matcher

## Goal
Implement the core pure domain logic and Indonesian word bank with unit tests:
1. `server/src/data/defaultWordPacks.ts` & `client/src/data/defaultWordPacks.ts`:
   - 50+ balanced word pairs across 5 Indonesian categories:
     - `Makanan & Minuman` (e.g. Kopi/Teh, Bakso/Mie Ayam, Rendang/Gulai, Martabak Manis/Terang Bulan, Nasi Padang/Nasi Uduk, etc.)
     - `Hewan` (e.g. Kucing/Harimau, Bebek/Ayam, Paus/Lumba-lumba, Elang/Burung Hantu, Kelinci/Hamster, etc.)
     - `Benda & Gadget` (e.g. Laptop/Komputer, Smartphone/Tablet, Headphone/Earphone, Kipas Angin/AC, Jam Tangan/Jam Dinding, etc.)
     - `Tempat & Hiburan` (e.g. Bioskop/Teater, Pantai/Danau, Supermarket/Pasar Tradisional, Museum/Perpustakaan, Hotel/Villa, etc.)
     - `Profesi` (e.g. Dokter/Perawat, Pilot/Masinis, Polisi/Tentara, Koki/Barista, Guru/Dosen, etc.)
2. `server/src/engine/FuzzyMatcher.ts` & `client/src/utils/fuzzyMatcher.ts`:
   - `isFuzzyMatch(guessed: string, target: string, options?: { maxDistance?: number }): boolean`
   - Levenshtein distance algorithm: case-insensitive, trims whitespace, removes punctuation.
   - For string length < 4: exact match required. For length 4-7: tolerance <= 1. For length > 7: tolerance <= 2.
3. `server/src/engine/GameEngine.ts`:
   - `assignRoles(players: Player[], settings: GameSettings, wordPair: WordPair): { players: Player[]; speakingOrder: string[] }`
   - `calculateVotes(votes: Record<string, string>, activePlayers: Player[]): { isTie: boolean; eliminatedPlayerId: string | null; voteCounts: Record<string, number> }`
     * Note: Instant Skip Elimination rule! If 2 or more candidates tie for highest votes, `isTie: true` and `eliminatedPlayerId: null`.
   - `checkWinCondition(players: Player[]): 'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE' | null`
4. Vitest Tests:
   - `server/tests/FuzzyMatcher.test.ts` (test exact, casing, small typo, big typo, whitespace)
   - `server/tests/GameEngine.test.ts` (test role distributions, tie-breaker instant skip, win conditions for Civilian, Undercover, Mr. White)

## Report Contract
Write report to: `C:\Users\ASUS\Documents\ALIFKA\PROJECT\whatstheword\.superpowers\sdd\2026-09-02-whatstheword-implementation\task-2-report.md`
Return: status (DONE / BLOCKED), commits, one-line test summary.
