import { supabase, isSupabaseConfigured } from './supabase';
import { Perfil, Usuario } from '../types';
import { Session } from '@supabase/supabase-js';

const FALLBACK_KEY = 'edualloc_fallback_user';

export const authService = {
  // Recupera o usuário atual validando o token real do Supabase ou Fallback
  async getSessionUser(currentSession?: Session | null): Promise<Usuario | null> {
    
    // GUARDA: Se não tiver configurado, vai direto para o modo offline (evita erro de rede)
    if (!isSupabaseConfigured()) {
        const fallbackData = localStorage.getItem(FALLBACK_KEY);
        return fallbackData ? JSON.parse(fallbackData) : null;
    }

    let session = currentSession;

    // Se não veio sessão explicita, tenta buscar do cliente
    try {
        if (!session) {
            const { data, error } = await supabase.auth.getSession();
            if (!error) session = data.session;
        }
    } catch (e) {
        // Ignora erro de conexão
    }

    if (session?.user) {
      // Busca dados do perfil público
      const { data: perfilData, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error || !perfilData) {
         const meta = session.user.user_metadata || {};
         return {
           id: session.user.id,
           nome: meta.full_name || meta.name || 'Usuário',
           email: session.user.email || '',
           perfil: (meta.perfil as Perfil) || Perfil.ADMINISTRADOR,
           donoId: meta.dono_id || session.user.id
         };
      }

      return {
        id: session.user.id,
        nome: perfilData.nome,
        email: perfilData.email,
        perfil: perfilData.perfil as Perfil,
        donoId: perfilData.dono_id,
        escolaId: perfilData.escola_id
      };
    }

    // Fallback LocalStorage (mesmo com Supabase configurado, se não tiver sessão)
    const fallbackData = localStorage.getItem(FALLBACK_KEY);
    if (fallbackData) {
        return JSON.parse(fallbackData);
    }

    return null;
  },

  async loginWithGoogle() {
    // MODO OFFLINE / DEMO: Simula login com Google se não houver backend
    if (!isSupabaseConfigured()) {
        const fallbackUser: Usuario = {
            id: 'google-demo-' + Date.now(),
            nome: 'Visitante Google (Demo)',
            email: 'visitante@gmail.com',
            perfil: Perfil.ADMINISTRADOR,
            donoId: 'demo-org-google'
        };
        localStorage.setItem(FALLBACK_KEY, JSON.stringify(fallbackUser));
        // Simula delay de rede e retorna o usuário mockado
        await new Promise(r => setTimeout(r, 1000));
        return { user: fallbackUser };
    }

    const currentOrigin = window.location.origin;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: currentOrigin,
        queryParams: { prompt: 'select_account', access_type: 'offline' }
      }
    });
    
    if (error) throw error;
    return data;
  },

  async loginAdmin(email: string, pass: string, isSignUp: boolean) {
    // MODO OFFLINE DIRETO se não houver config
    if (!isSupabaseConfigured()) {
        const fallbackUser: Usuario = {
            id: 'demo-admin-' + Date.now(),
            nome: (email.split('@')[0] || 'Gestor RH') + ' (Demo)',
            email: email,
            perfil: Perfil.ADMINISTRADOR,
            donoId: 'demo-org-' + (email.split('@')[0] || 'local')
        };
        localStorage.setItem(FALLBACK_KEY, JSON.stringify(fallbackUser));
        // Simula delay de rede
        await new Promise(r => setTimeout(r, 800));
        return { success: true, user: fallbackUser };
    }

    try {
        if (isSignUp) {
          const { data, error } = await supabase.auth.signUp({
            email, password: pass,
            options: { data: { full_name: email.split('@')[0], perfil: Perfil.ADMINISTRADOR } }
          });
          
          if (error) throw error;
          
          if (data.user) {
            try {
                await supabase.from('perfis').upsert({
                    id: data.user.id,
                    nome: email.split('@')[0],
                    email: email,
                    perfil: Perfil.ADMINISTRADOR,
                    dono_id: data.user.id
                });
            } catch (e) {}
          }
          return { success: true, user: data.user };
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
          if (error) throw error;
          return { success: true, user: data.user };
        }
    } catch (e: any) {
        console.warn("Auth falhou, ativando fallback local.");
        // Se falhar a rede mesmo configurado, permite entrar como demo
        const fallbackUser: Usuario = {
            id: 'demo-admin-' + Date.now(),
            nome: (email.split('@')[0] || 'Gestor RH') + ' (Demo)',
            email: email,
            perfil: Perfil.ADMINISTRADOR,
            donoId: 'demo-org-' + (email.split('@')[0] || 'local')
        };
        localStorage.setItem(FALLBACK_KEY, JSON.stringify(fallbackUser));
        return { success: true, user: fallbackUser };
    }
  },

  async logout() {
    localStorage.removeItem(FALLBACK_KEY);
    if (isSupabaseConfigured()) {
        try { await supabase.auth.signOut(); } catch (e) {}
    }
  }
};