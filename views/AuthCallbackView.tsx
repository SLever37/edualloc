
import React, { useEffect } from 'react';

const AuthCallbackView: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
      <div className="relative">
          <div className="w-20 h-20 border-4 border-indigo-500/20 rounded-[2.5rem] absolute inset-0"></div>
          <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-[2.5rem] animate-spin"></div>
      </div>
      <div className="mt-10 text-center">
          <h2 className="text-white font-black text-xl tracking-tight mb-2">Finalizando seu acesso</h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] animate-pulse">Autenticando na rede EduAlloc...</p>
      </div>
      
      {/* Decoração de fundo idêntica ao login */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-[-1] pointer-events-none opacity-20">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-600 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
};

export default AuthCallbackView;
