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
      // Race condition check: Supabase .getSession sometimes hangs on bad network/config
      // We force a resolution after 2000ms to prevent the "Launch Screen" from sticking
      const userPromise = authService.getSessionUser();
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000));
      
      const user = await Promise.race([userPromise, timeoutPromise]);
      setUsuario(user);
    } catch (e) {
      console.error("Erro ao carregar sessão inicial:", e);
      setUsuario(null);
    } finally {
      // CRITICAL: Always release the loading state
      setLoadingSession(false);
    }
  };

  useEffect(() => {
    // 1. Inicia carga
    carregarSessao();

    // 2. Failsafe: Se por algum motivo bizarro o carregarSessao travar, 
    // força a liberação da tela após 3 segundos absolutos.
    const safetyTimer = setTimeout(() => {
        setLoadingSession(prev => {
            if (prev) {
                console.warn("Safety Timer: Forçando liberação da tela de loading.");
                return false;
            }
            return prev;
        });
    }, 3000);

    // 3. Listener do Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Mudança de Auth detectada:", event);
      
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
        clearTimeout(safetyTimer);
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
      console.error(e);
      setAuthError(e.message || "Erro de autenticação");
      return { success: false };
    }
  };
  
  const loginGoogle = async () => {
    setAuthError('');
    try {
        const result: any = await authService.loginWithGoogle();
        
        // Verifica se é um login simulado (Offline Mode)
        // No modo real, o supabase redireciona a página, então esse código nem roda.
        // No modo demo, retornamos { user: ... } diretamente.
        if (result && result.user) {
            setUsuario(result.user as Usuario);
        }
    } catch (e: any) {
        console.error(e);
        setAuthError(e.message || "Erro ao conectar com Google");
        // Não relançamos o erro para não quebrar a UI, apenas exibimos a mensagem
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