import { supabase, isSupabaseConfigured } from './supabaseClient';
import { WordPair, CustomWordPack } from '../types/game.types';
import { getWordPairsByCategory } from '../data/defaultWordPacks';


export const LOCAL_STORAGE_CUSTOM_PACKS_KEY = 'whatstheword_custom_packs';

/**
 * Generate a clean, human-readable 6-character alphanumeric share code.
 * (e.g., 'WTW-8K29' or '8K29PX')
 */
export function generateShareCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a client-side UUID v4 fallback.
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Reads custom packs saved in browser localStorage.
 */
export function getLocalCustomPacks(): CustomWordPack[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CUSTOM_PACKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('[WordPackService] Failed to parse local custom packs:', error);
    return [];
  }
}

/**
 * Saves or updates a custom pack in localStorage.
 */
export function saveLocalCustomPack(pack: CustomWordPack): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    const existing = getLocalCustomPacks();
    const index = existing.findIndex((p) => p.id === pack.id || p.shareCode === pack.shareCode);
    let updated: CustomWordPack[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = pack;
    } else {
      updated = [pack, ...existing];
    }
    localStorage.setItem(LOCAL_STORAGE_CUSTOM_PACKS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn('[WordPackService] Failed to save local custom pack:', error);
  }
}

/**
 * Deletes a custom pack from localStorage.
 */
export function deleteLocalCustomPack(packId: string): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    const existing = getLocalCustomPacks();
    const filtered = existing.filter((p) => p.id !== packId);
    localStorage.setItem(LOCAL_STORAGE_CUSTOM_PACKS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.warn('[WordPackService] Failed to delete local custom pack:', error);
  }
}

/**
 * Fetches official word pairs from Supabase cloud database with seamless offline fallback.
 */
export async function getOfficialWordPairs(category?: string): Promise<WordPair[]> {
  try {
    if (isSupabaseConfigured()) {
      let query = supabase
        .from('word_packs')
        .select('id, category, civilian_word, undercover_word')
        .eq('is_official', true);

      if (category && category !== 'Semua Kategori') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        return data.map((row) => ({
          id: row.id,
          category: row.category,
          civilianWord: row.civilian_word,
          undercoverWord: row.undercover_word,
        }));
      }
    }
  } catch (err) {
    console.warn('[WordPackService] Supabase query failed, falling back to local word bank:', err);
  }

  // Seamless offline fallback
  return getWordPairsByCategory(category);
}

/**
 * Fetches community word packs from Supabase and merges them with locally created packs.
 */
export async function getCommunityPacks(): Promise<CustomWordPack[]> {
  const localPacks = getLocalCustomPacks();
  const remotePacks: CustomWordPack[] = [];

  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('custom_packs')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        for (const row of data) {
          remotePacks.push({
            id: row.id,
            title: row.title,
            authorName: row.author_name || 'Komunitas',
            shareCode: row.share_code,
            wordPairs: Array.isArray(row.word_pairs) ? row.word_pairs : [],
            isPublic: row.is_public,
            createdAt: row.created_at,
          });
        }
      }
    }
  } catch (err) {
    console.warn('[WordPackService] Failed to fetch remote community packs, using local only:', err);
  }

  // Deduplicate and merge (local packs take priority if share_code matches)
  const map = new Map<string, CustomWordPack>();

  for (const pack of remotePacks) {
    if (pack.shareCode) {
      map.set(pack.shareCode.toUpperCase(), pack);
    }
  }

  for (const pack of localPacks) {
    if (pack.shareCode) {
      map.set(pack.shareCode.toUpperCase(), pack);
    }
  }

  return Array.from(map.values());
}

/**
 * Fetches a custom pack by its unique share code (checks local storage first, then cloud).
 */
export async function getPackByShareCode(shareCode: string): Promise<CustomWordPack | null> {
  const cleanCode = (shareCode || '').trim().toUpperCase();
  if (!cleanCode) return null;

  // 1. Check local storage first
  const localPacks = getLocalCustomPacks();
  const foundLocal = localPacks.find((p) => p.shareCode.toUpperCase() === cleanCode);
  if (foundLocal) {
    return foundLocal;
  }

  // 2. Query Supabase
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('custom_packs')
        .select('*')
        .ilike('share_code', cleanCode)
        .maybeSingle();

      if (!error && data) {
        const pack: CustomWordPack = {
          id: data.id,
          title: data.title,
          authorName: data.author_name || 'Anonim',
          shareCode: data.share_code,
          wordPairs: Array.isArray(data.word_pairs) ? data.word_pairs : [],
          isPublic: data.is_public,
          createdAt: data.created_at,
        };
        // Cache to local storage
        saveLocalCustomPack(pack);
        return pack;
      }
    }
  } catch (err) {
    console.warn(`[WordPackService] Failed to query share code "${cleanCode}" from Supabase:`, err);
  }

  return null;
}

/**
 * Creates and saves a new custom word pack.
 * Persists to localStorage immediately and syncs with Supabase if online.
 */
export async function saveCustomPack(
  title: string,
  authorName: string,
  pairs: WordPair[],
  isPublic: boolean = true
): Promise<{ success: boolean; pack: CustomWordPack; shareCode: string }> {
  const code = generateShareCode();
  const id = generateUUID();

  const newPack: CustomWordPack = {
    id,
    title: title.trim() || 'Paket Kustom',
    authorName: authorName.trim() || 'Anonim',
    shareCode: code,
    wordPairs: pairs,
    isPublic,
    createdAt: new Date().toISOString(),
  };

  // 1. Save to local storage for immediate offline reliability
  saveLocalCustomPack(newPack);

  // 2. Upload to Supabase cloud if configured
  try {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('custom_packs').insert({
        id: newPack.id,
        title: newPack.title,
        author_name: newPack.authorName,
        share_code: newPack.shareCode,
        word_pairs: newPack.wordPairs,
        is_public: newPack.isPublic,
        created_at: newPack.createdAt,
      });

      if (error) {
        console.warn('[WordPackService] Supabase cloud sync failed, pack saved locally:', error.message);
      }
    }
  } catch (err) {
    console.warn('[WordPackService] Supabase upload failed, pack saved locally:', err);
  }

  return {
    success: true,
    pack: newPack,
    shareCode: newPack.shareCode,
  };
}

export const wordPackService = {
  getOfficialWordPairs,
  getCommunityPacks,
  getPackByShareCode,
  saveCustomPack,
  getLocalCustomPacks,
  saveLocalCustomPack,
  deleteLocalCustomPack,
  generateShareCode,
};

export default wordPackService;
