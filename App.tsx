
import React, { useState, useEffect } from 'react';
import { Funcionario, Escola, Perfil } from './types';
import { useAuth } from './hooks/useAuth';
import { useAppData } from './hooks/useAppData';
import { checkDatabaseConnection, supabase } from './services/supabase';

// Views & Components
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import SchoolPortal from './components/SchoolPortal';
import EmployeeModal from './components/EmployeeModal';
import SchoolModal from './components/SchoolModal';
import PessoalView from './views/PessoalView';
import EscolasView from './views/EscolasView';
import ConfiguracoesView from './views/ConfiguracoesView';
import SchoolDirectLoginView from './views/SchoolDirectLoginView';
import MainLoginView from './views/MainLoginView';
import UsuariosView from './views/UsuariosView';
import PerfilView from './views/PerfilView';
import AuthCallbackView from './views/AuthCallbackView';

const App: React.FC = () => {
  const { 
    usuario, loadingSession, authError, setAuthError, 
    loginAdmin, logout 
  } = useAuth();

  const [visaoAtiva, setVisaoAtiva] = useState<string>('dashboard');
  const [idEscolaSelecionada, setIdEscolaSelecionada] = useState<string | null>(null);
  const [isRestrictedPortal, setIsRestrictedPortal] = useState(false);
  const [portalCodeFromUrl, setPortalCodeFromUrl] = useState('');
  const [dbStatus, setDbStatus] = useState<{ok: boolean, message: string} | null>(null);
  const [isOAuthCallback, setIsOAuthCallback] = useState(false);
  
  const [funcionarioEmEdicao, setFuncionarioEmEdicao] = useState<Funcionario | undefined>();
  const [escolaEmEdicao, setEscolaEmEdicao] = useState<Escola | undefined>();
  const [isModalFuncionarioAberto, setIsModalFuncionarioAberto] = useState(false);
  const [isModalEscolaAberto, setIsModalEscolaAberto] = useState(false);
  const [loadingAuthAction, setLoadingAuthAction] = useState(false);

  const {
    funcionarios, escolas, setores, funcoes,
    salvarFuncionario, removerFuncionario, salvarEscola, removerEscola, alternarPresenca, importarEmLote,
    adicionarSetor, editarSetor, removerSetor, 
    adicionarFuncao, editarFuncao, removerFuncao
  } = useAppData(usuario?.id, usuario?.donoId, usuario?.perfil);

  useEffect(() => {
    const checkDb = async () => {
        const status = await checkDatabaseConnection();
        setDbStatus(status);
    };
    checkDb();

    const hash = window.location.hash;
    if (hash.includes('access_token=') || hash.includes('type=recovery') || hash.includes('type=signup')) {
      setIsOAuthCallback(true);
    }

    const params = new URLSearchParams(window.location.search);
    const portalCode = params.get('portal');
    if (portalCode) {
      setPortalCodeFromUrl(portalCode);
      setIsRestrictedPortal(true);
    }
  }, []);

  useEffect(() => {
    if (usuario && isOAuthCallback) {
      setIsOAuthCallback(false);
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [usuario, isOAuthCallback]);

  useEffect(() => {
    if (usuario) {
      window.history.replaceState({ view: 'dashboard' }, '');
      const handlePopState = (event: PopStateEvent) => {
        if (event.state?.view) {
          setVisaoAtiva(event.state.view);
          if (event.state.escolaId) setIdEscolaSelecionada(event.state.escolaId);
        }
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [usuario]);

  useEffect(() => {
      if(usuario?.perfil === Perfil.GESTOR_ESCOLAR && usuario.escolaId) {
          setIdEscolaSelecionada(usuario.escolaId);
          setVisaoAtiva('portal-escola');
      }
  }, [usuario]);

  const navegarPara = (view: string, escolaId?: string) => {
    setVisaoAtiva(view);
    if (escolaId) setIdEscolaSelecionada(escolaId);
    window.history.pushState({ view, escolaId }, '');
  };

  const handleAdminLogin = async (email: string, pass: string, isSignUp: boolean) => {
    setLoadingAuthAction(true);
    await loginAdmin(email, pass, isSignUp);
    setLoadingAuthAction(false);
  };

  const handleUpdateSchoolNotes = async (notes: string) => {
    if (idEscolaSelecionada) {
      await salvarEscola({ id: idEscolaSelecionada, notasUnidade: notes });
    }
  };

  // Fix: added missing adicionarMembroEquipe function to handle team registration within the organization
  const adicionarMembroEquipe = async (email: string, pass: string, nome: string) => {
    if (!usuario) return;
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: nome,
          perfil: Perfil.ADMINISTRADOR,
          dono_id: usuario.donoId
        }
      }
    });
    if (error) throw error;
    if (data.user) {
      await supabase.from('perfis').upsert({
        id: data.user.id,
        nome: nome,
        email: email,
        perfil: Perfil.ADMINISTRADOR,
        dono_id: usuario.donoId
      });
    }
  };

  if (loadingSession || (isOAuthCallback && !usuario)) {
    return isOAuthCallback ? <AuthCallbackView /> : (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-[2rem] animate-spin mb-8"></div>
            <p className="text-slate-400 font-black text-xs uppercase tracking-[0.4em] animate-pulse">Sincronizando Rede...</p>
        </div>
    );
  }

  if (!usuario) {
    if (isRestrictedPortal) {
      return (
        <SchoolDirectLoginView 
          schoolCode={portalCodeFromUrl} 
          onLogin={async () => {}} 
          onExit={() => setIsRestrictedPortal(false)} 
          loading={loadingAuthAction} 
          error={authError} 
        />
      );
    }
    return (
      <MainLoginView 
        onAdminLogin={handleAdminLogin} 
        loading={loadingAuthAction} 
        error={authError} 
        onClearMessages={() => setAuthError('')}
      />
    );
  }

  return (
    <Layout user={usuario} onLogout={logout} onNavigate={(view) => navegarPara(view)} activeView={visaoAtiva}>
      {dbStatus && !dbStatus.ok && visaoAtiva === 'dashboard' && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-4 text-rose-800 animate-in slide-in-from-top-4">
              <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div>
                  <p className="text-sm font-black uppercase">Atenção: Erro de Banco de Dados</p>
                  <p className="text-xs font-medium opacity-80">{dbStatus.message}</p>
              </div>
          </div>
      )}

      {visaoAtiva === 'dashboard' && <Dashboard employees={funcionarios} schools={escolas} roles={funcoes} />}
      {visaoAtiva === 'employees' && (
        <PessoalView 
          funcionarios={funcionarios} escolas={escolas} funcoes={funcoes} setores={setores}
          aoAdicionar={() => { setFuncionarioEmEdicao(undefined); setIsModalFuncionarioAberto(true); }}
          aoEditar={(f) => { setFuncionarioEmEdicao(f); setIsModalFuncionarioAberto(true); }}
          aoRemover={removerFuncionario}
          onImport={importarEmLote}
        />
      )}
      {visaoAtiva === 'schools' && (
        <EscolasView 
          escolas={escolas} funcionarios={funcionarios} funcoes={funcoes}
          aoAdicionar={() => { setEscolaEmEdicao(undefined); setIsModalEscolaAberto(true); }}
          aoEditar={(e) => { setEscolaEmEdicao(e); setIsModalEscolaAberto(true); }}
          aoVisualizar={(id) => { navegarPara('portal-escola', id); }}
          aoRemover={removerEscola}
        />
      )}
      {visaoAtiva === 'settings' && (
        <ConfiguracoesView 
            setores={setores} funcoes={funcoes}
            aoAdicionarSetor={adicionarSetor} aoEditarSetor={editarSetor} aoRemoverSetor={removerSetor}
            aoAdicionarFuncao={adicionarFuncao} aoEditarFuncao={editarFuncao} aoRemoverFuncao={removerFuncao}
        />
      )}
      {visaoAtiva === 'users' && (
        <UsuariosView currentUser={usuario} onRegisterTeamMember={adicionarMembroEquipe} />
      )}
      {visaoAtiva === 'profile' && (
          <PerfilView user={usuario} onUpdateProfile={async () => {}} />
      )}
      {visaoAtiva === 'portal-escola' && idEscolaSelecionada && (
        <SchoolPortal 
          school={escolas.find(e => e.id === idEscolaSelecionada)!} 
          employees={funcionarios.filter(f => f.escolaId === idEscolaSelecionada).map(f => ({
            ...f, 
            roleLabel: funcoes.find(r => r.id === f.funcaoId)?.nome, 
            sectorLabel: setores.find(s => s.id === f.setorId)?.nome
          })) as any} 
          onToggleAttendance={alternarPresenca}
          isAdminView={usuario.perfil === Perfil.ADMINISTRADOR || usuario.perfil === Perfil.SUPER_ADMIN}
          onEditEmployee={(f) => { setFuncionarioEmEdicao(f); setIsModalFuncionarioAberto(true); }}
          onUpdateSchoolNotes={handleUpdateSchoolNotes}
        />
      )}
      {isModalFuncionarioAberto && (
        <EmployeeModal 
            employee={funcionarioEmEdicao} 
            schools={escolas} roles={funcoes} sectors={setores} 
            onSave={(d, foto) => { salvarFuncionario(d, foto); setIsModalFuncionarioAberto(false); }} 
            onClose={() => setIsModalFuncionarioAberto(false)} 
        />
      )}
      {isModalEscolaAberto && (
        <SchoolModal 
            school={escolaEmEdicao} 
            onSave={(d) => { salvarEscola(d); setIsModalEscolaAberto(false); }} 
            onClose={() => setIsModalEscolaAberto(false)} 
        />
      )}
    </Layout>
  );
};

export default App;
