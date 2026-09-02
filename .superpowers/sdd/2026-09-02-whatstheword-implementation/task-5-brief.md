# Task 5 Brief: Supabase Cloud Word Pack Service & Community Packs

## Goal
Implement Supabase integration for cloud word packs, community sharing, and offline fallback:

1. `supabase/schema.sql`:
   - SQL schema definitions for:
     - `word_packs` table (id uuid, category text, civilian_word text, undercover_word text, is_official boolean, created_at timestamp)
     - `custom_packs` table (id uuid, title text, author_name text, share_code text unique, word_pairs jsonb, is_public boolean, created_at timestamp)
     - Row Level Security (RLS) policies allowing public anonymous read for word_packs and public custom_packs, and public anonymous insert for custom_packs.
     - Optional seed script inserting standard Indonesian categories into `word_packs`.

2. `client/src/services/supabaseClient.ts`:
   - Initialize and export `supabase` client using `@supabase/supabase-js`
   - Read `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`
   - Fallback constants if env variables are missing:
     - URL: `https://rmsvxhoblwdhhdjpgjdn.supabase.co`
     - Anon Key: `sb_publishable_2Mli4l2s2k_On3ZkRz5VhQ_RewKXkfK`
   - Export `isSupabaseConfigured(): boolean`

3. `client/src/services/wordPackService.ts`:
   - Methods:
     - `getOfficialWordPairs(category?: string): Promise<WordPair[]>` (Tries Supabase first; if offline or empty, falls back seamlessly to `defaultWordPacks.ts`)
     - `getCommunityPacks(): Promise<CustomWordPack[]>` (Fetches public packs from Supabase + reads local storage packs)
     - `getPackByShareCode(shareCode: string): Promise<CustomWordPack | null>`
     - `saveCustomPack(title: string, authorName: string, pairs: WordPair[], isPublic?: boolean): Promise<{ success: boolean; pack: CustomWordPack; shareCode: string }>`
     - Local storage syncing for custom packs created by the user (`localStorage.getItem('whatstheword_custom_packs')`).

4. Verification:
   - Typecheck and build verification across `client/`.

## Report Contract
Write report to: `C:\Users\ASUS\Documents\ALIFKA\PROJECT\whatstheword\.superpowers\sdd\2026-09-02-whatstheword-implementation\task-5-report.md`
Return: status (DONE / BLOCKED), commits, one-line test summary.
