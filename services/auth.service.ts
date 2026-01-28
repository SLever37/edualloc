import { supabase, isSupabaseConfigured } from './supabase';
import { Perfil, Usuario } from '../types';
import { Session } from '@supabase/supabase-js';

const FALLBACK_KEY = 'edualloc_fallback_user';
const FORCE_DEMO_KEY = 'edualloc_force_demo';

export const authService = {
  isDemoMode(): boolean {
    return localStorage.getItem(FORCE_DEMO_KEY) === 'true' || !isSupabaseConfigured();
  },

  // Fix: Corrected localStorage.setItem to accept two arguments and removed invalid comparison.
  setDemoMode(active: boolean) {
    if (active) localStorage.setItem(FORCE_DEMO_KEY, 'true');
    else localStorage.removeItem(FORCE_DEMO_KEY);
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
           dono_id: meta.dono_id || session.user.id
         };

         const { data: created, error: createError } = await supabase
            .from('perfis')
            .upsert(novoPerfil)
            .select()
            .single();
         
         if (!createError) {
             perfilData = created;
         } else {
             return {
                id: session.user.id,
                nome: novoPerfil.nome,
                email: novoPerfil.email,
                perfil: novoPerfil.perfil,
                donoId: novoPerfil.dono_id
             };
         }
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

    try {
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
          if (error) throw error;
          
          if (data.user) {
            await supabase.from('perfis').upsert({
              id: data.user.id,
              nome: email.split('@')[0],
              email: email,
              perfil: Perfil.ADMINISTRADOR,
              dono_id: data.user.id
            });
          }
          return { success: true, user: data.user };
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
          if (error) throw error;
          return { success: true, user: data.user };
        }
    } catch (e: any) {
        const msg = e.message || '';
        
        if (msg.includes('Email logins are disabled')) {
            throw new Error("Login por e-mail desativado no Supabase. Ative em 'Authentication > Providers' ou use o Modo Demo.");
        }
        
        if (msg.includes('Email not confirmed')) {
            throw new Error("E-mail ainda não confirmado. Verifique sua caixa de entrada ou desative a confirmação obrigatória nas configurações de 'Auth' do Supabase.");
        }

        if (msg.includes('Invalid login credentials')) {
            throw new Error("E-mail ou senha incorretos.");
        }

        throw e;
    }
  },

  async loginWithGoogle() {
    if (this.isDemoMode()) return null;
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