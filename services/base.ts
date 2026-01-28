import { supabase } from './supabase';

// Re-exporta supabase para compatibilidade
export { supabase };

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