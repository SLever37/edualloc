
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase.ts';
import { authService } from '../services/auth.service.ts';
import { Usuario } from '../types.ts';

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
    // Timeout de segurança: se o Supabase não responder em 6s, libera o app
    const timer = setTimeout(() => {
      if (loadingSession) {
        console.warn("Auth timeout atingido. Liberando tela.");
        setLoadingSession(false);
      }
    }, 6000);

    carregarSessao();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.debug("Auth Event:", event);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        try {
          const user = await authService.getSessionUser(session);
          setUsuario(user);
        } finally {
          setLoadingSession(false);
        }
      } else if (event === 'SIGNED_OUT') {
        setUsuario(null);
        setLoadingSession(false);
      }
    });

    return () => {
        clearTimeout(timer);
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

  const loginEscola = async (codigoGestor: string, codigoAcesso: string) => {
    setAuthError('');
    try {
      const result = await authService.loginEscola(codigoGestor, codigoAcesso);
      if (result.success && result.user) {
        setUsuario(result.user as Usuario);
      }
      return result;
    } catch (e: any) {
      setAuthError(e.message || "Credenciais da unidade inválidas");
      return { success: false };
    }
  };
  
  const loginGoogle = async () => {
    setAuthError('');
    try {
        await authService.loginWithGoogle();
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
        localStorage.removeItem(FALLBACK_KEY);
        Object.keys(localStorage).forEach(key => {
            if (key.includes('supabase.auth.token')) {
                localStorage.removeItem(key);
            }
        });
        
        setUsuario(null);
        setAuthError('');
        setLoadingSession(false);
        if (window.history.replaceState) {
            window.history.replaceState(null, '');
        }
    }
  };

  return { usuario, setUsuario, loadingSession, authError, setAuthError, loginAdmin, loginEscola, loginGoogle, logout };
};
