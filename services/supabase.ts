import { createClient } from '@supabase/supabase-js';

// Credenciais verificadas
const SUPABASE_URL = 'https://bucutqjribdrqkvwmxbb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JXeJmxr7EvzfG-PxF4x16w_96eVzKOT';

export const isSupabaseConfigured = () => {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('YOUR_');
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

/**
 * Função de diagnóstico profundo para testar se as tabelas existem.
 */
export const checkDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('escolas').select('count', { count: 'exact', head: true });
    if (error) {
      if (error.code === '42P01') {
        return { ok: false, message: "Tabelas não encontradas. Execute o script SQL no painel do Supabase." };
      }
      return { ok: false, message: error.message };
    }
    return { ok: true, message: "Conectado e tabelas verificadas." };
  } catch (e: any) {
    return { ok: false, message: e.message };
  }
};