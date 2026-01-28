import React, { useState, useEffect } from 'react';
import { Funcionario, Escola, Perfil } from './types';
import { useAuth } from './hooks/useAuth';
import { useAppData } from './hooks/useAppData';
// Removida importação de verificação estrita para permitir modo offline
// import { isSupabaseConfigured } from './services/supabase';

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

const App: React.FC = () => {
  const { 
    usuario, loadingSession, authError, setAuthError, 
    loginAdmin, logout 
  } = useAuth();

  const [visaoAtiva, setVisaoAtiva] = useState<string>('dashboard');
  const [idEscolaSelecionada, setIdEscolaSelecionada] = useState<string | null>(null);
  const [isRestrictedPortal, setIsRestrictedPortal] = useState(false);
  const [portalCodeFromUrl, setPortalCodeFromUrl] = useState('');
  
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
    const params = new URLSearchParams(window.location.search);
    const portalCode = params.get('portal');
    if (portalCode) {
      setPortalCodeFromUrl(portalCode);
      setIsRestrictedPortal(true);
    }
  }, []);

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
          navegarPara('portal-escola', usuario.escolaId);
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

  const adicionarMembroEquipe = async (email: string, pass: string, nome: string) => {
      if(!usuario?.donoId) return;
      const confirm = window.confirm("Criar este usuário desconectará você atual. Continuar?");
      if(!confirm) return;
      // Nota: Em produção real, usaria uma Edge Function. Aqui simulamos logando e deslogando.
      alert("Para criar novo usuário, o sistema precisará fazer login com ele brevemente.");
      await logout(); 
  };

  // Trava removida para permitir demonstração offline
  // if (!isSupabaseConfigured()) return <div className="p-10 text-center font-bold text-slate-600">Configure Supabase em services/supabase.ts</div>;
  
  if (loadingSession) {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-[2rem] animate-spin mb-8"></div>
            <p className="text-slate-400 font-black text-xs uppercase tracking-[0.4em] animate-pulse">Sincronizando Rede...</p>
        </div>
    );
  }

  // LOGIN SCREEN
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

  // MAIN APP
  return (
    <Layout user={usuario} onLogout={logout} onNavigate={(view) => navegarPara(view)} activeView={visaoAtiva}>
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