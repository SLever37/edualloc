
import React, { useState } from 'react';

interface SchoolDirectLoginViewProps {
  schoolCode: string;
  onLogin: (code: string, accessCode: string) => void;
  onExit: () => void;
  loading: boolean;
  error: string;
}

const SchoolDirectLoginView: React.FC<SchoolDirectLoginViewProps> = ({ 
  schoolCode, 
  onLogin, 
  onExit, 
  loading, 
  error 
}) => {
  const [accessCode, setAccessCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(schoolCode, accessCode);
  };

  return (
    <div className="min-h-screen bg-emerald-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-500 relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
        
        <div className="p-10 text-center pb-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">Acesso à Unidade</h1>
          <p className="text-slate-400 text-sm font-medium mt-1">Portal exclusivo para Gestores Escolares</p>
        </div>

        <div className="px-10 pb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Código da Unidade</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={schoolCode} 
                  readOnly 
                  className="w-full h-14 pl-4 pr-12 bg-emerald-50 border-2 border-emerald-100 rounded-2xl font-black text-emerald-800 text-lg outline-none uppercase cursor-not-allowed" 
                />
                <div className="absolute right-4 top-4 text-emerald-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
              <input 
                type="password" 
                value={accessCode} 
                onChange={e => setAccessCode(e.target.value)} 
                className="w-full h-14 px-4 bg-slate-50 hover:bg-white border border-slate-200 focus:border-emerald-500 rounded-2xl font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm" 
                placeholder="Digite a senha da escola" 
                required 
                autoFocus
              />
            </div>

            {error && (
                <div className="text-rose-600 text-xs font-bold bg-rose-50 p-4 rounded-2xl text-center border border-rose-100">
                    <p>{error}</p>
                    <p className="text-[10px] font-normal mt-1 opacity-80">Se é seu primeiro acesso, solicite o cadastro do Usuário da Escola ao RH (gestor_{schoolCode}@edualloc.app).</p>
                </div>
            )}

            <button type="submit" disabled={loading} className="w-full h-14 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-wide hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 disabled:opacity-50 mt-2">
              {loading ? 'Validando Acesso...' : 'Entrar no Portal'}
            </button>
            
            <div className="text-center pt-2">
               <button type="button" onClick={onExit} className="text-[10px] font-bold text-slate-400 hover:text-emerald-600 uppercase tracking-widest p-2">
                 Não é gestor desta unidade? Sair
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SchoolDirectLoginView;
