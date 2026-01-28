import { supabase } from './supabase';

export { supabase };

export async function uploadFile(bucket: string, path: string, file: File): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: true,
      cacheControl: '3600'
    });
    
    if (error) {
      console.error('Erro no Storage Supabase:', error.message);
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl;
  } catch (e) {
    console.error('Falha crítica no upload:', e);
    return null;
  }
}