
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { authService } from '../services/auth.service';
import { Usuario } from '../types';

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

    // Escuta mudanças de auth (incluindo o retorno do Google)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Mudança de Auth detectada:", event);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Passamos a 'session' que veio do evento para evitar delay de leitura
        const user = await authService.getSessionUser(session);
        setUsuario(user);
      } else if (event === 'SIGNED_OUT') {
        setUsuario(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginAdmin = async (email: string, pass: string, isSignUp: boolean) => {
    setAuthError('');
    try {
      const result = await authService.loginAdmin(email, pass, isSignUp);
      if (result.success) {
          await carregarSessao();
      }
      return result;
    } catch (e: any) {
      console.error(e);
      setAuthError(e.message || "Erro de autenticação");
      return { success: false };
    }
  };
  
  const loginGoogle = async () => {
    setAuthError('');
    try {
        await authService.loginWithGoogle();
        // Redirecionamento é externo
    } catch (e: any) {
        console.error(e);
        setAuthError(e.message || "Erro ao conectar com Google");
        throw e;
    }
  };

  const logout = async () => {
    try {
        await Promise.race([
            authService.logout(),
            new Promise(resolve => setTimeout(resolve, 500))
        ]);
    } catch (e) {
        console.warn("Logout remoto falhou, limpando local.");
    } finally {
        localStorage.clear();
        sessionStorage.clear();
        setUsuario(null);
        setAuthError('');
        if (window.history.replaceState) {
            window.history.replaceState(null, '');
        }
    }
  };

  return { usuario, setUsuario, loadingSession, authError, setAuthError, loginAdmin, loginGoogle, logout };
};
