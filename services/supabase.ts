
import { createClient } from '@supabase/supabase-js';

// ⚠️ ATENÇÃO: SUBSTITUA ESTAS VARIÁVEIS PELOS DADOS DO SEU PROJETO SUPABASE
// Você encontra estes dados no painel do Supabase em: Project Settings -> API
const SUPABASE_URL = 'https://bucutqjribdrqkvwmxbb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JXeJmxr7EvzfG-PxF4x16w_96eVzKOT';

// Helper para verificar se o usuário configurou as chaves
export const isSupabaseConfigured = () => {
  return !SUPABASE_URL.includes('seu-projeto') && !SUPABASE_ANON_KEY.includes('sua-chave');
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
