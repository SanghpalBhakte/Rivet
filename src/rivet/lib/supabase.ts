/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Environment variable retrieval
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.info(
    '[Rivet CRM] Supabase credentials not found in VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Operating in standalone persistent local state mode.'
  );
}

// Only create a real Supabase client when credentials are present.
// Previously this fell back to a 'placeholder' URL which fired real HTTP requests
// and failed silently on every SDK call when Supabase was not configured.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as unknown as ReturnType<typeof createClient>);
