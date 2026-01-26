
import { supabase } from './supabase';
import { Perfil, Usuario } from '../types';
import { Session } from '@supabase/supabase-js';

const FALLBACK_KEY = 'edualloc_fallback_user';

export const authService = {
  // Recupera o usuário atual validando o token real do Supabase ou Fallback
  // Aceita uma sessão opcional para evitar chamadas duplicadas ao getSession
  async getSessionUser(currentSession?: Session | null): Promise<Usuario | null> {
    
    let session = currentSession;

    // Se não veio sessão explicita, tenta buscar do cliente
    if (!session) {
        const { data } = await supabase.auth.getSession();
        session = data.session;
    }

    if (session?.user) {
      // Busca dados do perfil público
      const { data: perfilData, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', session.user.id)
        .single();

      // Se o usuário existe no Auth mas não tem perfil (ex: erro na criação), cria um fallback em memória
      if (error || !perfilData) {
         console.warn("Perfil não encontrado no banco. Usando dados do Google/Auth.");
         
         const meta = session.user.user_metadata || {};
         const googleName = meta.full_name || meta.name || session.user.email?.split('@')[0];
         
         return {
           id: session.user.id,
           nome: googleName || 'Usuário',
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

    // Fallback: Se não houver sessão Supabase, verifica se estamos em modo de contingência
    const fallbackData = localStorage.getItem(FALLBACK_KEY);
    if (fallbackData) {
        return JSON.parse(fallbackData);
    }

    return null;
  },

  async loginWithGoogle() {
    // URL exata que o navegador está usando agora
    const currentOrigin = window.location.origin;
    
    console.log("=== DEBUG GOOGLE LOGIN ===");
    console.log("1. Enviando usuário para o Google...");
    console.log("2. O Google vai devolver para: https://bucutqjribdrqkvwmxbb.supabase.co/auth/v1/callback");
    console.log("3. O Supabase deve redirecionar de volta para:", currentOrigin);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: currentOrigin,
        queryParams: {
          // Força o Google a perguntar qual conta usar, evitando erro 403 por conta errada cacheada
          prompt: 'select_account',
          access_type: 'offline'
        }
      }
    });
    
    if (error) {
        console.error("Erro Supabase OAuth:", error);
        throw error;
    }
    
    return data;
  },

  async loginAdmin(email: string, pass: string, isSignUp: boolean) {
    if (isSignUp) {
      // CADASTRO
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: email.split('@')[0],
            perfil: Perfil.ADMINISTRADOR
          }
        }
      });
      
      if (error) {
        if (error.message.includes("Email signups are disabled")) {
             console.warn("⚠️ AVISO: Backend com Cadastro Email desativado. Criando Admin Local.");
             
             const fallbackUser: Usuario = {
                id: 'local-admin-' + Date.now(),
                nome: (email.split('@')[0] || 'Admin') + ' (Local)',
                email: email,
                perfil: Perfil.ADMINISTRADOR,
                donoId: 'local-admin-' + Date.now()
            };
            localStorage.setItem(FALLBACK_KEY, JSON.stringify(fallbackUser));
            return { success: true, user: fallbackUser };
        }
        throw error;
      }

      if (data.user) {
        const perfilPayload = {
            id: data.user.id,
            nome: email.split('@')[0],
            email: email,
            perfil: Perfil.ADMINISTRADOR,
            dono_id: data.user.id
        };
        await supabase.from('perfis').upsert(perfilPayload);
      }
      return { success: true, user: data.user };

    } else {
      // LOGIN
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass
      });

      if (error) {
        if (error.message.includes("Email logins are disabled") || error.message.includes("Email not confirmed")) {
            console.warn("⚠️ AVISO: Backend com Login Email desativado. Ativando Modo de Contingência.");
            const fallbackUser: Usuario = {
                id: 'admin-fallback-uuid',
                nome: 'Admin (Modo Offline)',
                email: email,
                perfil: Perfil.ADMINISTRADOR,
                donoId: 'admin-fallback-uuid'
            };
            localStorage.setItem(FALLBACK_KEY, JSON.stringify(fallbackUser));
            return { success: true, user: fallbackUser };
        }
        throw error;
      }
      return { success: true, user: data.user };
    }
  },

  async logout() {
    localStorage.removeItem(FALLBACK_KEY);
    const { error } = await supabase.auth.signOut();
    if (error) console.warn("Logout remoto falhou:", error.message);
  }
};
