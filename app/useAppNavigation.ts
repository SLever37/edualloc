
import { useState, useEffect } from 'react';
import { Usuario, Perfil } from '../types.ts';

export const useAppNavigation = (
  usuario: Usuario | null,
  logout: () => Promise<void>,
  setAuthError: (err: string) => void
) => {
  const [visaoAtiva, setVisaoAtiva] = useState<string>('dashboard');
  const [idEscolaSelecionada, setIdEscolaSelecionada] = useState<string | null>(null);
  const [isRestrictedPortal, setIsRestrictedPortal] = useState(false);
  const [portalCodeFromUrl, setPortalCodeFromUrl] = useState('');

  // Sincroniza estado inicial e parâmetros da URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const portalCode = params.get('portal');

    if (portalCode) {
      setPortalCodeFromUrl(portalCode);
      setIsRestrictedPortal(true);
    }

    if (!window.history.state) {
      window.history.replaceState({ view: 'dashboard' }, '');
    }

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setVisaoAtiva(event.state.view);
        if (event.state.escolaId) setIdEscolaSelecionada(event.state.escolaId);
      } else {
        setVisaoAtiva('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Guard: Isolamento de Portal
  useEffect(() => {
    const enforcePortalIsolation = async () => {
      if (!isRestrictedPortal || !portalCodeFromUrl || !usuario) return;

      if (usuario.perfil !== Perfil.GESTOR_ESCOLAR) {
        setAuthError('Este link é do Portal da Escola. Faça login como gestor da unidade.');
        await logout();
      }
    };
    enforcePortalIsolation();
  }, [isRestrictedPortal, portalCodeFromUrl, usuario, logout, setAuthError]);

  // Redirecionamento Automático por Perfil
  useEffect(() => {
    if (usuario?.perfil === Perfil.GESTOR_ESCOLAR && usuario.escolaId) {
      setIdEscolaSelecionada(usuario.escolaId);
      setVisaoAtiva('portal-escola');
      window.history.replaceState({ view: 'portal-escola', escolaId: usuario.escolaId }, '');
    }
  }, [usuario]);

  const navegarPara = (view: string, escolaId?: string) => {
    if (view === visaoAtiva && escolaId === idEscolaSelecionada) return;

    setVisaoAtiva(view);
    if (escolaId) setIdEscolaSelecionada(escolaId);
    window.history.pushState({ view, escolaId }, '');
  };

  return {
    visaoAtiva, setVisaoAtiva,
    idEscolaSelecionada, setIdEscolaSelecionada,
    isRestrictedPortal,
    portalCodeFromUrl,
    navegarPara
  };
};
