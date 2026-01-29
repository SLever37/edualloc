
import { createClient } from '@supabase/supabase-js';

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

export const checkDatabaseConnection = async () => {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Supabase não configurado localmente." };
  }
  try {
    const { data, error } = await supabase.from('escolas').select('count', { count: 'exact', head: true });
    if (error) {
      if (error.code === '42P01') {
        return { ok: false, message: "Banco de dados vazio ou tabelas não criadas." };
      }
      return { ok: false, message: error.message };
    }
    return { ok: true, message: "Conexão ativa." };
  } catch (e: any) {
    return { ok: false, message: "Erro de conexão: " + e.message };
  }
};
