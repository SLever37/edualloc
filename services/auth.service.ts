
import { supabase, isSupabaseConfigured } from './supabase';
import { Perfil, Usuario } from '../types';
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
            const { data, error } = await supabase.auth.getSession();
            if (!error) session = data.session;
        }
    } catch (e) {
        console.error("Erro ao verificar sessão:", e);
    }

    if (session?.user) {
      let { data: perfilData, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error || !perfilData) {
         const meta = session.user.user_metadata || {};
         const novoPerfil = {
           id: session.user.id,
           nome: meta.full_name || meta.name || session.user.email?.split('@')[0] || 'Usuário',
           email: session.user.email || '',
           perfil: (meta.perfil as Perfil) || Perfil.ADMINISTRADOR,
           dono_id: meta.dono_id || session.user.id,
           escola_id: meta.escola_id || null
         };

         const { data: created } = await supabase
            .from('perfis')
            .upsert(novoPerfil)
            .select()
            .single();
         
         perfilData = created || novoPerfil;
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

    const fallbackData = localStorage.getItem(FALLBACK_KEY);
    return fallbackData ? JSON.parse(fallbackData) : null;
  },

  async loginEscola(codigoGestor: string, codigoAcesso: string) {
    if (this.isDemoMode()) {
      // Mock para modo demo
      const user: Usuario = {
        id: 'demo-gestor',
        nome: 'Gestor Unidade (Demo)',
        email: `${codigoGestor.toLowerCase()}@edualloc.app`,
        perfil: Perfil.GESTOR_ESCOLAR,
        donoId: 'demo-org-local',
        escolaId: '1'
      };
      localStorage.setItem(FALLBACK_KEY, JSON.stringify(user));
      return { success: true, user };
    }

    // Busca a escola pelos códigos
    const { data: escola, error } = await supabase
      .from('escolas')
      .select('*')
      .eq('codigo_gestor', codigoGestor)
      .eq('codigo_acesso', codigoAcesso)
      .single();

    if (error || !escola) {
      throw new Error("Código de Gestor ou Senha de Acesso inválidos para esta unidade.");
    }

    // Cria um usuário "virtual" para o gestor se não estiver usando Supabase Auth real para eles
    // Ou você pode ter um usuário real com email gestor_ID@edualloc.app
    const gestorUser: Usuario = {
      id: `gestor-${escola.id}`,
      nome: `Gestor ${escola.nome}`,
      email: `${escola.codigo_gestor.toLowerCase()}@edualloc.app`,
      perfil: Perfil.GESTOR_ESCOLAR,
      donoId: escola.dono_id,
      escolaId: escola.id
    };

    localStorage.setItem(FALLBACK_KEY, JSON.stringify(gestorUser));
    return { success: true, user: gestorUser };
  },

  async loginAdmin(email: string, pass: string, isSignUp: boolean) {
    if (this.isDemoMode()) {
        const fallbackUser: Usuario = {
            id: 'demo-admin',
            nome: (email.split('@')[0] || 'Gestor RH') + ' (Demo)',
            email: email,
            perfil: Perfil.ADMINISTRADOR,
            donoId: 'demo-org-local'
        };
        localStorage.setItem(FALLBACK_KEY, JSON.stringify(fallbackUser));
        return { success: true, user: fallbackUser };
    }

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email, 
        password: pass,
        options: { data: { full_name: email.split('@')[0], perfil: Perfil.ADMINISTRADOR } }
      });
      if (error) throw error;
      return { success: true, user: data.user };
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      return { success: true, user: data.user };
    }
  },

  async loginWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) throw error;
    return data;
  },

  async logout() {
    localStorage.removeItem(FALLBACK_KEY);
    localStorage.removeItem(FORCE_DEMO_KEY);
    if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
    }
  }
};
