
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface MainLoginViewProps {
  onAdminLogin: (email: string, pass: string, isSignUp: boolean) => Promise<void>;
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
  
  // Instância local do hook apenas para acesso ao método loginGoogle
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
        // Se der certo, redireciona, não precisa setar false
    } catch (error) {
        setGoogleLoading(false);
    }
  };

  const isLoadingAny = loading || googleLoading;

  return (
    <div className="h-full w-full bg-slate-950 flex items-center justify-center p-4 relative font-sans overflow-y-auto custom-scrollbar">
      {/* Background Decorativo */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-600 rounded-full opacity-10 blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-emerald-600 rounded-full opacity-10 blur-[150px] animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-500 relative z-10 border border-white/40 my-auto shrink-0">
        
        {/* Header */}
        <div className="p-12 pb-6 text-center">
          <div className="w-24 h-24 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl transform hover:rotate-6 transition-transform duration-500">
             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">
            Edu<span className="text-indigo-600">Alloc</span>
          </h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-4 opacity-70">Módulo de Gestão RH</p>
        </div>

        {/* Formulário */}
        <div className="p-12 pt-4">
          <div className="space-y-6">
            
            {/* Botão Google */}
            <button
                type="button"
                disabled={isLoadingAny}
                onClick={handleGoogleLogin}
                className="w-full h-14 bg-white border-2 border-slate-100 hover:border-indigo-100 hover:bg-slate-50 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {googleLoading ? (
                    <div className="w-5 h-5 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin"></div>
                ) : (
                    <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M23.52 12.29C23.52 11.43 23.44 10.71 23.3 10H12V14.51H18.5C18.25 15.68 17.38 17.5 15.4 18.8L15.37 18.94L18.96 21.7L19.21 21.72C21.43 19.68 22.84 16.48 22.84 12.5C22.84 12.43 23.52 12.29 23.52 12.29Z" fill="#4285F4"/>
                            <path d="M12 24C15.17 24 17.84 22.95 19.79 21.15L16.2 18.37C15.19 19.06 13.82 19.53 12 19.53C8.88 19.53 6.22 17.44 5.27 14.59L5.13 14.61L1.41 17.47L1.36 17.62C3.33 21.53 7.37 24 12 24Z" fill="#34A853"/>
                            <path d="M5.27 14.59C5.02 13.85 4.88 13.06 4.88 12.25C4.88 11.44 5.02 10.65 5.27 9.91L5.26 9.76L1.51 6.86L1.46 6.96C0.53 8.81 0 10.9 0 13C0 15.1 0.53 17.19 1.46 19.04L5.27 14.59Z" fill="#FBBC05"/>
                            <path d="M12 4.96999C14.23 4.96999 15.75 5.92999 16.61 6.72999L19.89 3.51999C17.84 1.61999 15.17 0.469986 12 0.469986C7.37 0.469986 3.33 2.93999 1.36 6.84999L5.17 9.80999C6.16 6.97999 8.85 4.96999 12 4.96999Z" fill="#EA4335"/>
                        </svg>
                        <span className="text-sm">Continuar com Google</span>
                    </>
                )}
            </button>

            <div className="flex items-center gap-4">
                <div className="h-px bg-slate-100 flex-1"></div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">OU</span>
                <div className="h-px bg-slate-100 flex-1"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                    <input 
                        type="email" 
                        required 
                        className="w-full h-16 px-6 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300"
                        placeholder="ex: rh@municipio.gov.br"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha de Segurança</label>
                    <input 
                        type="password" 
                        required 
                        className="w-full h-16 px-6 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>

                {/* Mensagem de Erro */}
                {error && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-black text-center animate-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isLoadingAny}
                    className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-indigo-200 transition-all transform active:scale-95 disabled:opacity-50"
                >
                    {loading ? 'Autenticando...' : (isSignUp ? 'Criar Acesso Agora' : 'Acessar Central')}
                </button>

                <div className="text-center pt-2">
                    <button 
                        type="button" 
                        onClick={() => { setIsSignUp(!isSignUp); onClearMessages(); }} 
                        className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest p-2 transition-colors"
                    >
                        {isSignUp ? 'Já possui cadastro? Login' : 'Novo por aqui? Criar conta de RH'}
                    </button>
                </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLoginView;
