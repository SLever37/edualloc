
import React, { useState } from 'react';
import { Perfil, Usuario } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: Usuario;
  onLogout: () => void;
  onNavigate: (view: string) => void;
  activeView: string;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, onNavigate, activeView }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigation = (view: string) => {
    onNavigate(view);
    setIsMobileMenuOpen(false); 
  };

  const handleLogout = () => {
    // Ação direta sem confirmação para garantir resposta imediata
    onLogout();
  };

  const handleBack = () => {
    window.history.back();
  };

  const isDashboard = activeView === 'dashboard';

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-slate-50 overflow-hidden">
      
      {/* Header Mobile Otimizado */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shrink-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
            {!isDashboard && (
                <button 
                  onClick={handleBack}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 transition active:scale-95"
                  aria-label="Voltar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
            )}
            <h1 className="text-lg font-black flex items-center gap-2 tracking-tighter">
            <span className="bg-indigo-600 text-white px-2 py-0.5 rounded italic">Edu</span>
            Alloc
            </h1>
        </div>
        
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/80 z-40 md:hidden backdrop-blur-sm animate-in fade-in" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col 
        transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 h-full
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="p-8 border-b border-slate-800 hidden md:block shrink-0">
          <h1 className="text-2xl font-black flex items-center gap-2 tracking-tighter">
            <span className="bg-indigo-600 text-white px-2 py-0.5 rounded italic">Edu</span>
            Alloc
          </h1>
          <p className="text-slate-500 text-[10px] font-black mt-2 uppercase tracking-widest italic">
              {user.perfil === Perfil.SUPER_ADMIN ? 'Central SAC' : 'Recursos Humanos'}
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
          {(user.perfil === Perfil.ADMINISTRADOR || user.perfil === Perfil.SUPER_ADMIN) ? (
            <>
              <button onClick={() => handleNavigation('dashboard')} className={`w-full text-left p-3 rounded-xl transition font-bold text-sm flex items-center gap-3 ${activeView === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                Painel Principal
              </button>
              <button onClick={() => handleNavigation('employees')} className={`w-full text-left p-3 rounded-xl transition font-bold text-sm flex items-center gap-3 ${activeView === 'employees' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                Pessoal Global
              </button>
              <button onClick={() => handleNavigation('schools')} className={`w-full text-left p-3 rounded-xl transition font-bold text-sm flex items-center gap-3 ${activeView === 'schools' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                Gestão de Escolas
              </button>
              <button onClick={() => handleNavigation('settings')} className={`w-full text-left p-3 rounded-xl transition font-bold text-sm flex items-center gap-3 ${activeView === 'settings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                Configurações
              </button>
              <div className="my-4 border-t border-slate-800"></div>
              <button onClick={() => handleNavigation('users')} className={`w-full text-left p-3 rounded-xl transition font-bold text-sm flex items-center gap-3 ${activeView === 'users' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                {user.perfil === Perfil.SUPER_ADMIN ? 'Admin: Todos Usuários' : 'Gestão de Equipe'}
              </button>
            </>
          ) : (
            <button onClick={() => handleNavigation('portal-escola')} className={`w-full text-left p-3 rounded-xl transition font-bold text-sm flex items-center gap-3 ${activeView === 'portal-escola' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              Minha Unidade
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50 shrink-0 space-y-2">
          <button 
             onClick={() => handleNavigation('profile')}
             className={`flex items-center gap-3 w-full p-2 rounded-xl transition ${activeView === 'profile' ? 'bg-slate-800' : 'hover:bg-slate-800'}`}
          >
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20">
              {user.nome.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden text-left">
              <p className="text-sm font-black truncate leading-tight uppercase tracking-tighter w-32" title={user.nome}>{user.nome.split(' ')[0]}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Editar Perfil</p>
            </div>
          </button>
          
          <button 
            type="button"
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 p-3 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </div>
            <span className="font-bold text-sm uppercase tracking-wide">Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-12 relative w-full h-full custom-scrollbar">
        {children}
      </main>
    </div>
  );
};

export default Layout;
