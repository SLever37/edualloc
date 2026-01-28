
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
    onLogout();
  };

  const handleBack = () => {
    window.history.back();
  };

  const isDashboard = activeView === 'dashboard';

  return (
    // h-[100dvh] corrige problemas de barra de endereço em mobile (Dynamic Viewport Height)
    <div className="h-[100dvh] w-full flex flex-col md:flex-row bg-slate-50 overflow-hidden relative">
      
      {/* Header Mobile Otimizado */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shrink-0 z-40 shadow-md safe-area-top">
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
            <h1 className="text-lg font-black flex items-center gap-2 tracking-tighter select-none">
            <span className="bg-indigo-600 text-white px-2 py-0.5 rounded italic">Edu</span>
            Alloc
            </h1>
        </div>
        
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition active:bg-slate-700"
          aria-label="Menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
      </div>

      {/* Backdrop Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/80 z-40 md:hidden backdrop-blur-sm animate-in fade-in duration-200" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* Sidebar Responsiva */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 md:w-64 bg-slate-900 text-white flex flex-col 
        transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1)
        md:relative md:translate-x-0 h-full shadow-2xl md:shadow-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 border-b border-slate-800 hidden md:block shrink-0">
          <h1 className="text-2xl font-black flex items-center gap-2 tracking-tighter select-none">
            <span className="bg-indigo-600 text-white px-2 py-0.5 rounded italic">Edu</span>
            Alloc
          </h1>
          <p className="text-slate-500 text-[10px] font-black mt-2 uppercase tracking-widest italic">
              {user.perfil === Perfil.SUPER_ADMIN ? 'Central SAC' : 'Recursos Humanos'}
          </p>
        </div>

        {/* Header do Menu Mobile dentro do Drawer */}
        <div className="md:hidden p-4 flex justify-between items-center border-b border-slate-800">
           <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Navegação</span>
           <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
           </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-2 overflow-y-auto custom-scrollbar">
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
              <div className="my-4 border-t border-slate-800/50"></div>
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

        <div className="p-4 border-t border-slate-800 bg-slate-900/50 shrink-0 space-y-2 safe-area-bottom">
          <button 
             onClick={() => handleNavigation('profile')}
             className={`flex items-center gap-3 w-full p-2 rounded-xl transition ${activeView === 'profile' ? 'bg-slate-800' : 'hover:bg-slate-800'}`}
          >
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20 shrink-0">
              {user.nome.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden text-left min-w-0">
              <p className="text-sm font-black truncate leading-tight uppercase tracking-tighter" title={user.nome}>{user.nome.split(' ')[0]}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">Editar Perfil</p>
            </div>
          </button>
          
          <button 
            type="button"
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 p-3 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </div>
            <span className="font-bold text-sm uppercase tracking-wide">Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 relative w-full h-full custom-scrollbar bg-slate-50 scroll-smooth">
        <div className="max-w-7xl mx-auto pb-10">
            {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
