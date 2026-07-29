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

// Initialized Supabase Client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
