import { createClient, SupabaseClient } from '@supabase/supabase-js';

const FALLBACK_SUPABASE_URL = 'https://rmsvxhoblwdhhdjpgjdn.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'sb_publishable_2Mli4l2s2k_On3ZkRz5VhQ_RewKXkfK';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL).trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY).trim();

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));
};

let clientInstance: SupabaseClient;

try {
  clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
} catch (error) {
  console.warn('[Supabase] Failed to initialize client, initializing dummy fallback:', error);
  // Fallback creation with fallback constants if initial configuration failed
  clientInstance = createClient(FALLBACK_SUPABASE_URL, FALLBACK_SUPABASE_ANON_KEY);
}

export const supabase = clientInstance;
