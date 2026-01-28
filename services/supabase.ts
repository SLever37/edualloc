import { createClient } from '@supabase/supabase-js';

// Fallback para evitar erro "supabaseUrl is required" se as envs faltarem
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

export const isSupabaseConfigured = () => {
  // Verifica se as variáveis REAIS existem (não os placeholders)
  return (process.env.VITE_SUPABASE_URL?.length ?? 0) > 0 && 
         (process.env.VITE_SUPABASE_ANON_KEY?.length ?? 0) > 0;
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);