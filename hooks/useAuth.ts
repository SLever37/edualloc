import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { authService } from '../services/auth.service';
import { Usuario } from '../types';

const FALLBACK_KEY = 'edualloc_fallback_user';

export const useAuth = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [authError, setAuthError] = useState('');

  const carregarSessao = async () => {
    try {
      const user = await authService.getSessionUser();
      setUsuario(user);
    } catch (e) {
      console.error("Erro ao carregar sessão inicial:", e);
      setUsuario(null);
    } finally {
      setLoadingSession(false);
    }
  };

  useEffect(() => {
    carregarSessao();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const user = await authService.getSessionUser(session);
        setUsuario(user);
        setLoadingSession(false);
      } else if (event === 'SIGNED_OUT') {
        setUsuario(null);
        setLoadingSession(false);
      }
    });

    return () => {
        subscription.unsubscribe();
    };
  }, []);

  const loginAdmin = async (email: string, pass: string, isSignUp: boolean) => {
    setAuthError('');
    try {
      const result = await authService.loginAdmin(email, pass, isSignUp);
      if (result.success) {
          const user = await authService.getSessionUser();
          setUsuario(user);
      }
      return result;
    } catch (e: any) {
      setAuthError(e.message || "Erro de autenticação");
      return { success: false };
    }
  };
  
  const loginGoogle = async () => {
    setAuthError('');
    try {
        const result: any = await authService.loginWithGoogle();
        if (result && result.user) {
            setUsuario(result.user as Usuario);
        }
    } catch (e: any) {
        setAuthError(e.message || "Erro ao conectar com Google");
    }
  };

  const logout = async () => {
    try {
        await authService.logout();
    } catch (e) {
        console.warn("Logout falhou:", e);
    } finally {
        // CORREÇÃO CRÍTICA: Não usar localStorage.clear()
        // Remove apenas as chaves de autenticação, preservando o "banco de dados" local
        localStorage.removeItem(FALLBACK_KEY);
        // Limpa tokens do Supabase (chaves padrão do cliente auth)
        Object.keys(localStorage).forEach(key => {
            if (key.includes('supabase.auth.token')) {
                localStorage.removeItem(key);
            }
        });
        
        setUsuario(null);
        setAuthError('');
        if (window.history.replaceState) {
            window.history.replaceState(null, '');
        }
    }
  };

  return { usuario, setUsuario, loadingSession, authError, setAuthError, loginAdmin, loginGoogle, logout };
};