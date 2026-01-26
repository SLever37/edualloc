
import { createClient } from '@supabase/supabase-js';

// Configuração do Cliente
const SUPABASE_URL = 'https://bucutqjribdrqkvwmxbb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JXeJmxr7EvzfG-PxF4x16w_96eVzKOT';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fetcher Genérico com Proteção de Tenancy
export async function fetchData<T>(table: string, donoId?: string): Promise<T[]> {
  if (!donoId) return [];
  
  let query = supabase.from(table).select('*');
  
  // Se não for Super Admin, filtra pelo dono_id
  if (donoId !== 'SUPER') {
    query = query.eq('dono_id', donoId);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error(`Erro ao buscar ${table}:`, error);
    return [];
  }
  return data as T[];
}

// Upload Genérico
export async function uploadFile(bucket: string, path: string, file: File): Promise<string | null> {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true
  });
  
  if (error) {
    console.warn('Upload rejeitado pelo servidor (RLS/Permissão):', error.message);
    throw error;
  }
  
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrl;
}
