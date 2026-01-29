
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
          donoId: perfilData.dono_id || usuarioBase.donoId,
          escolaId: perfilData.escola_id || usuarioBase.escolaId
        };
      }
    } catch (err) {
      console.error("Erro na sincronização de perfil:", err);
    }

    return usuarioBase;
  },

  async loginEscola(codigoGestor: string, codigoAcesso: string) {
    if (this.isDemoMode()) {
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

    const { data: escola, error } = await supabase
      .from('escolas')
      .select('*')
      .eq('codigo_gestor', codigoGestor)
      .eq('codigo_acesso', codigoAcesso)
      .single();

    if (error || !escola) {
      throw new Error("Credenciais da unidade inválidas ou não encontradas.");
    }

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
        options: { 
          data: { 
            full_name: email.split('@')[0], 
            perfil: Perfil.ADMINISTRADOR,
            dono_id: null 
          } 
        }
      });
      if (error) {
          if (error.message.includes("Invalid login credentials")) {
              throw new Error("Credenciais de login inválidas.");
          }
          throw error;
      }
      return { success: true, user: data.user };
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) {
          if (error.message.includes("Invalid login credentials")) {
              throw new Error("Credenciais de login inválidas.");
          }
          throw error;
      }
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
    try {
      if (isSupabaseConfigured()) {
          await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn("Erro ao deslogar:", e);
    }
  }
};
