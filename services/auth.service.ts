
import { supabase, isSupabaseConfigured } from './supabase.ts';
import { Perfil, Usuario } from '../types.ts';
import { Session } from '@supabase/supabase-js';

const FALLBACK_KEY = 'edualloc_fallback_user';
const FORCE_DEMO_KEY = 'edualloc_force_demo';

export const authService = {
  isDemoMode(): boolean {
    return localStorage.getItem(FORCE_DEMO_KEY) === 'true' || !isSupabaseConfigured();
  },

  async getSessionUser(currentSession?: Session | null): Promise<Usuario | null> {
    if (this.isDemoMode()) {
        const fallbackData = localStorage.getItem(FALLBACK_KEY);
        return fallbackData ? JSON.parse(fallbackData) : null;
    }

    let session = currentSession;
    try {
        if (!session) {
            const { data } = await supabase.auth.getSession();
            session = data.session;
        }
    } catch (e) {
        console.error("Erro ao buscar sessão ativa:", e);
    }

    if (!session?.user) return null;

    const authUser = session.user;
    const meta = authUser.user_metadata || {};

    const usuarioBase: Usuario = {
      id: authUser.id,
      nome: meta.full_name || meta.name || authUser.email?.split('@')[0] || 'Usuário',
      email: authUser.email || '',
      perfil: (meta.perfil as Perfil) || Perfil.ADMINISTRADOR,
      donoId: meta.dono_id || authUser.id,
      escolaId: meta.escola_id || null
    };

    try {
      const { data: perfilData, error: readError } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (readError) {
          console.warn("Aviso: Falha ao ler perfil, usando metadados base.");
          return usuarioBase;
      }

      if (!perfilData) {
        const novoPerfil = {
          id: authUser.id,
          nome: usuarioBase.nome,
          email: usuarioBase.email,
          perfil: usuarioBase.perfil,
          dono_id: usuarioBase.donoId,
          escola_id: usuarioBase.escolaId,
          updated_at: new Date().toISOString()
        };

        const { data: created } = await supabase
          .from('perfis')
          .insert([novoPerfil])
          .select()
          .single();
        
        if (created) return {
          ...usuarioBase,
          nome: created.nome,
          perfil: created.perfil as Perfil,
          donoId: created.dono_id,
          escolaId: created.escola_id
        };
      } else {
        // Atualiza apenas se houver sessão para não falhar em modo offline
        if (session) {
            supabase
              .from('perfis')
              .update({ last_active_at: new Date().toISOString(), updated_at: new Date().toISOString() })
              .eq('id', authUser.id)
              .then(({error}) => error && console.warn("Falha ao atualizar timestamp"));
        }

        return {
          id: authUser.id,
          nome: perfilData.nome || usuarioBase.nome,
          email: perfilData.email || usuarioBase.email,
          perfil: (perfilData.perfil as Perfil) || usuarioBase.perfil,
