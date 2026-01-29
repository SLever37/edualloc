
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface MainLoginViewProps {
  onAdminLogin: (email: string, pass: string, isSignUp: boolean) => Promise<any>;
  loading: boolean;
  error: string;
  onClearMessages: () => void;
}

const MainLoginView: React.FC<MainLoginViewProps> = ({ 
  onAdminLogin, 
  loading, 
  error, 
  onClearMessages
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const { loginGoogle } = useAuth(); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdminLogin(email, password, isSignUp);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    onClearMessages();
    try {
        await loginGoogle();
    } catch (err) {
        setGoogleLoading(false);
    }
  };

  const handleDemoMode = async () => {
    onClearMessages();
    localStorage.removeItem('sb-bucutqjribdrqkvwmxbb-auth-token'); 
    localStorage.setItem('edualloc_force_demo', 'true');
    await onAdminLogin('demo@edualloc.app', 'demo123', false);
    window.location.reload();
  };

  const isLoadingAny = loading || googleLoading;
  // Traduções para detecção de erros comuns do Supabase
  const isEmailNotConfirmed = error.includes('confirmado') || error.includes('not confirmed') || error.includes('Email not confirmed');

  return (
    <div className="h-full w-full bg-slate-950 flex flex-col items-center justify-center p-4 relative font-sans overflow-y-auto custom-scrollbar">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-600 rounded-full opacity-10 blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-emerald-600 rounded-full opacity-10 blur-[150px] animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-50 mb-6 w-full max-w-md animate-in slide-in-from-top-4 duration-700">
          <button 
            onClick={handleDemoMode}
            className="w-full bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 backdrop-blur-md p-3 rounded-2xl flex items-center justify-between group transition-all"
          >
              <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                  </div>
                  <div className="text-left">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Acesso Rápido</p>
                      <p className="text-xs font-bold text-white">Entrar sem configurar banco de dados</p>
                  </div>
              </div>
              <svg className="text-indigo-400 group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
      </div>

      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-500 relative z-50 border border-white/40 my-auto shrink-0">
        
        <div className="p-10 pb-6 text-center">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.4rem] flex items-center justify-center mx-auto mb-4 shadow-xl transform hover:rotate-6 transition-transform duration-500">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">
            Edu<span className="text-indigo-600">Alloc</span>
          </h1>
          <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mt-2 opacity-70">Gestão de Lotação Escolar</p>
        </div>

        <div className="px-10 pb-10">
          <div className="space-y-4">
            
            <button
                type="button"
                disabled={isLoadingAny}
                onClick={handleGoogleLogin}
                className="w-full h-12 bg-white border-2 border-slate-100 hover:border-indigo-100 hover:bg-slate-50 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-sm disabled:opacity-50"
            >
                {googleLoading ? (
                    <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin"></div>
                ) : (
                    <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M23.52 12.29C23.52 11.43 23.44 10.71 23.3 10H12V14.51H18.5C18.25 15.68 17.38 17.5 15.4 18.8L15.37 18.94L18.96 21.7L19.21 21.72C21.43 19.68 22.84 16.48 22.84 12.5C22.84 12.43 23.52 12.29 23.52 12.29Z" fill="#4285F4"/>
                            <path d="M12 24C15.17 24 17.84 22.95 19.79 21.15L16.2 18.37C15.19 19.06 13.82 19.53 12 19.53C8.88 19.53 6.22 17.44 5.27 14.59L5.13 14.61L1.41 17.47L1.36 17.62C3.33 21.53 7.37 24 12 24Z" fill="#34A853"/>
                            <path d="M5.27 14.59C5.02 13.85 4.88 13.06 4.88 12.25C4.88 11.44 5.02 10.65 5.27 9.91L5.26 9.76L1.51 6.86L1.46 6.96C0.53 8.81 0 10.9 0 13C0 15.1 0.53 17.19 1.46 19.04L5.27 14.59Z" fill="#FBBC05"/>
                            <path d="M12 4.96999C14.23 4.96999 15.75 5.92999 16.61 6.72999L19.89 3.51999C17.84 1.61999 15.17 0.469986 12 0.469986C7.37 0.469986 3.33 2.93999 1.36 6.84999L5.17 9.80999C6.16 6.97999 8.85 4.96999 12 4.96999Z" fill="#EA4335"/>
                        </svg>
                        <span className="text-sm">Entrar com Google</span>
                    </>
                )}
            </button>

            <div className="flex items-center gap-4">
                <div className="h-px bg-slate-100 flex-1"></div>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Ou e-mail</span>
                <div className="h-px bg-slate-100 flex-1"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                    <input 
                        type="email" 
                        required 
                        className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-500 transition-all placeholder:text-slate-300"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
                    <input 
                        type="password" 
                        required 
                        className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-500 transition-all placeholder:text-slate-300"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>

                {error && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[11px] font-bold leading-relaxed animate-in slide-in-from-top-2">
                        {error === 'Invalid login credentials' ? 'Credenciais de login inválidas.' : error}
                        {isEmailNotConfirmed && (
                            <div className="mt-3 p-3 bg-white/50 rounded-xl border border-rose-200">
                                <p className="text-[10px] font-black uppercase text-indigo-600 mb-1">Como resolver:</p>
                                <p className="text-[10px] text-slate-500 font-medium mb-3 leading-tight">
                                    O e-mail ainda não foi confirmado ou as credenciais estão incorretas. Verifique sua caixa de entrada.
                                </p>
                                <button 
                                    type="button"
                                    onClick={handleDemoMode}
                                    className="w-full py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 transition shadow-sm"
                                >
                                    Entrar no Modo Demo Agora
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isLoadingAny}
                    className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl transition-all transform active:scale-95 disabled:opacity-50"
                >
                    {loading ? 'Aguarde...' : (isSignUp ? 'Criar Minha Conta' : 'Entrar no Sistema')}
                </button>

                <div className="text-center pt-2">
                    <button 
                        type="button" 
                        onClick={() => { setIsSignUp(!isSignUp); onClearMessages(); }} 
                        className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest p-2 transition-colors"
                    >
                        {isSignUp ? 'Já possui conta? Clique aqui para entrar' : 'Ainda não tem conta? Cadastre-se'}
                    </button>
                </div>
            </form>
          </div>
        </div>
      </div>
      
      <p className="mt-8 text-slate-500 text-[10px] font-bold opacity-40 uppercase tracking-widest">
        EduAlloc RH • v2.0 • Português (Brasil)
      </p>
    </div>
  );
};

export default MainLoginView;
