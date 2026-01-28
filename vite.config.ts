import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente. Usa '.' para evitar erro de tipagem no process.cwd()
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      // Define process.env como um objeto JSON stringificado.
      // Isso substitui referências globais de process.env pelo objeto literal no bundle.
      // Usa || "" para garantir que a chave exista no objeto final, mesmo se undefined.
      'process.env': JSON.stringify({
        API_KEY: env.API_KEY || env.VITE_GEMINI_API_KEY || "",
        VITE_SUPABASE_URL: env.VITE_SUPABASE_URL || "",
        VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY || "",
        NODE_ENV: mode
      })
    },
    build: {
      outDir: 'dist',
    }
  };
});