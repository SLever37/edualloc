
import React, { useState, useEffect, useMemo } from 'react';
import { Funcionario, Escola, Perfil } from './types.ts';
import { useAuth } from './hooks/useAuth.ts';
import { useAppData } from './hooks/useAppData.ts';
import { checkDatabaseConnection } from './services/supabase.ts';

// Views & Components
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import SchoolPortal from './components/SchoolPortal.tsx';
import EmployeeModal from './components/EmployeeModal.tsx';
import SchoolModal from './components/SchoolModal.tsx';
import PessoalView from './views/PessoalView.tsx';
import EscolasView from './views/EscolasView.tsx';
import ConfiguracoesView from './views/ConfiguracoesView.tsx';
import SchoolDirectLoginView from './views/SchoolDirectLoginView.tsx';
import MainLoginView from './views/MainLoginView.tsx';
import UsuariosView from './views/UsuariosView.tsx';
import PerfilView from './views/PerfilView.tsx';
import AuthCallbackView from './views/AuthCallbackView.tsx';

const App: React.FC = () => {
  const { 
    usuario, loadingSession, authError, setAuthError, 
    loginAdmin, loginEscola, logout 
  } = useAuth();

  const [visaoAtiva, setVisaoAtiva] = useState<string>('dashboard');
  const [idEscolaSelecionada, setIdEscolaSelecionada] = useState<string | null>(null);
  const [isRestrictedPortal, setIsRestrictedPortal] = useState(false);
  const [portalCodeFromUrl, setPortalCodeFromUrl] = useState('');
  const [dbStatus, setDbStatus] = useState<{ok: boolean, message: string} | null>(null);
  
  const isOAuthCallback = useMemo(() => {
    const hash = window.location.hash;
    return hash.includes('access_token=') || hash.includes('type=recovery');
  }, []);

  const [funcionarioEmEdicao, setFuncionarioEmEdicao] = useState<Funcionario | undefined>();
  const [escolaEmEdicao, setEscolaEmEdicao] = useState<Escola | undefined>();
  const [isModalFuncionarioAberto, setIsModalFuncionarioAberto] = useState(false);
  const [isModalEscolaAberto, setIsModalEscolaAberto] = useState(false);
  const [loadingAuthAction, setLoadingAuthAction] = useState(false);

  const {
    funcionarios, escolas, setores, funcoes, contatosRhGlobais,
    salvarFuncionario, removerFuncionario, salvarEscola, removerEscola, salvarContatosGlobais, alternarPresenca, importarEmLote,
    adicionarSetor, editarSetor, removerSetor, 
    adicionarFuncao, editarFuncao, removerFuncao
  } = useAppData(usuario?.id, usuario?.donoId, usuario?.perfil);

  useEffect(() => {
    checkDatabaseConnection().then(setDbStatus);
    const params = new URLSearchParams(window.location.search);
    const portalCode = params.get('portal');
    if (portalCode) {
      setPortalCodeFromUrl(portalCode);
      setIsRestrictedPortal(true);
    }
  }, []);

  // Monitora login do gestor para redirecionar ao portal correto
  useEffect(() => {
      if(usuario?.perfil === Perfil.GESTOR_ESCOLAR && usuario.escolaId) {
          setIdEscolaSelecionada(usuario.escolaId);
          setVisaoAtiva('portal-escola');
      }
  }, [usuario]);

  const navegarPara = (view: string, escolaId?: string) => {
    setVisaoAtiva(view);
    if (escolaId) setIdEscolaSelecionada(escolaId);
    // Remove o parâmetro de portal da URL ao navegar no admin
    if (view !== 'portal-escola' && !isRestrictedPortal) {
      window.history.pushState({}, '', window.location.pathname);
    }
  };

  const handleSchoolLogin = async (code: string, pass: string) => {
    setLoadingAuthAction(true);
    try {
      await loginEscola(code, pass);
    } catch (e) {
      // Erro tratado pelo hook useAuth
    } finally {
      setLoadingAuthAction(false);
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

  // Se não houver usuário logado
  if (!usuario) {
    // Se a URL contém um código de portal, mostra o login específico da escola
    if (isRestrictedPortal) {
      return (
        <SchoolDirectLoginView 
          schoolCode={portalCodeFromUrl} 
          onLogin={handleSchoolLogin} 
          onExit={() => {
            setIsRestrictedPortal(false);
            window.history.pushState({}, '', window.location.pathname);
          }} 
          loading={loadingAuthAction} 
          error={authError} 
        />
      );
    }
    // Caso contrário, mostra o login padrão do RH
    return (
      <MainLoginView 
        onAdminLogin={loginAdmin} 
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
        <UsuariosView currentUser={usuario} onRegisterTeamMember={async (e,p,n) => {}} />
      )}
      {visaoAtiva === 'profile' && (
          <PerfilView 
            user={usuario} 
            onUpdateProfile={async () => {}} 
            globalContacts={contatosRhGlobais}
            onUpdateGlobalContacts={salvarContatosGlobais}
          />
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
          onUpdateSchoolNotes={(notes) => salvarEscola({ id: idEscolaSelecionada, notasUnidade: notes })}
          onUpdateLogo={(file) => salvarEscola({ id: idEscolaSelecionada }, file)}
          rhContacts={contatosRhGlobais}
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
