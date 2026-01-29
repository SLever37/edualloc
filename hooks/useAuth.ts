
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase.ts';
import { authService } from '../services/auth.service.ts';
import { Usuario } from '../types.ts';

const FALLBACK_KEY = 'edualloc_fallback_user';

export const useAuth = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [authError, setAuthError] = useState('');
  const initialized = useRef(false);

  const carregarSessao = async (sessionToUse?: any) => {
    try {
      const user = await authService.getSessionUser(sessionToUse);
      setUsuario(user);
    } catch (e) {
      console.error("Falha ao carregar sessão:", e);
      setUsuario(null);
    } finally {
      setLoadingSession(false);
    }
  };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const timer = setTimeout(() => {
      setLoadingSession(false);
    }, 5000);

    carregarSessao();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        carregarSessao(session);
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
          setTimeout(() => carregarSessao(), 500);
      }
      return result;
    } catch (e: any) {
      let msg = e.message || "Erro de autenticação";
      if (msg.includes("Invalid login credentials")) msg = "Credenciais de login inválidas.";
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const loginEscola = async (codigoGestor: string, codigoAcesso: string) => {
    setAuthError('');
    try {
      const result = await authService.loginEscola(codigoGestor, codigoAcesso);
      if (result.success && result.user) {
        setUsuario(result.user);
      }
      return result;
    } catch (e: any) {
      const msg = e.message || "Credenciais da unidade inválidas.";
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };
  
  const loginGoogle = async () => {
    setAuthError('');
    try {
        await authService.loginWithGoogle();
    } catch (e: any) {
        setAuthError(e.message || "Erro ao conectar com a conta Google.");
    }
  };

  const logout = async () => {
    setLoadingSession(true);
    try {
        await authService.logout();
    } finally {
        setUsuario(null);
        setAuthError('');
        setLoadingSession(false);
        if (window.history.replaceState) {
            window.history.replaceState(null, '', window.location.pathname);
        }
    }
  };

  return { 
    usuario, 
    setUsuario, 
    loadingSession, 
    authError, 
    setAuthError, 
    loginAdmin, 
    loginEscola, 
    loginGoogle, 
    logout 
  };
};
