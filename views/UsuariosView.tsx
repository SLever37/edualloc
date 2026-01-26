
import React, { useState } from 'react';
import { Usuario, Perfil } from '../types';

interface UsuariosViewProps {
  currentUser: Usuario;
  onRegisterTeamMember: (email: string, pass: string, nome: string) => Promise<void>;
}

const UsuariosView: React.FC<UsuariosViewProps> = ({ currentUser, onRegisterTeamMember }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const isSuperAdmin = currentUser.perfil === Perfil.SUPER_ADMIN;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      await onRegisterTeamMember(email, password, nome);
      setMsg({ type: 'success', text: 'Usuário cadastrado com sucesso! Ele já pode acessar o sistema.' });
      setNome('');
      setEmail('');
      setPassword('');
    } catch (error: any) {
      setMsg({ type: 'error', text: error.message || 'Erro ao cadastrar membro.' });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full h-12 px-4 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl font-bold text-slate-800 placeholder:text-slate-400 outline-none transition-all shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";
  const labelClass = "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1";

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            {isSuperAdmin ? 'Central SAC - Todos os Usuários' : 'Gestão de Acessos RH'}
        </h2>
        <p className="text-slate-500 font-medium">
            {isSuperAdmin 
                ? 'Visualização global de administradores e gestão de sistema.' 
                : 'Cadastre novos membros para sua equipe de RH. Eles acessarão os mesmos dados desta conta.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Formulário de Criação */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 mb-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                </div>
                <div>
                    <h3 className="text-sm font-black text-indigo-900">Novo Acesso RH</h3>
                    <p className="text-xs text-indigo-700 font-medium">Vinculado à organização: <span className="font-black">{currentUser.donoId}</span></p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className={labelClass}>Nome do Colaborador</label>
                    <input type="text" required placeholder="Nome completo" className={inputClass} value={nome} onChange={e => setNome(e.target.value)} />
                </div>
                <div>
                    <label className={labelClass}>Email de Login</label>
                    <input type="email" required placeholder="colaborador@escola.com" className={inputClass} value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div>
                    <label className={labelClass}>Senha Inicial</label>
                    <input type="password" required placeholder="Mínimo 6 caracteres" className={inputClass} value={password} onChange={e => setPassword(e.target.value)} />
                </div>

                {msg && (
                    <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 border ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                        {msg.text}
                    </div>
                )}

                <button type="submit" disabled={loading} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50 mt-4">
                    {loading ? 'Processando...' : 'Cadastrar Membro'}
                </button>
            </form>
          </div>

          {/* Lista Visual de Membros */}
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
             <h3 className="text-lg font-black text-slate-800 mb-4">Membros da Organização</h3>
             <div className="space-y-3">
                 {/* O próprio usuário */}
                 <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
                     <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-xs">EU</div>
                     <div>
                         <p className="text-sm font-bold text-slate-800">{currentUser.nome} (Você)</p>
                         <p className="text-xs text-slate-400">Admin da Conta</p>
                     </div>
                 </div>
                 
                 <div className="p-6 text-center border-2 border-dashed border-slate-300 rounded-xl">
                     <p className="text-xs text-slate-500 font-medium">
                        Os usuários cadastrados aparecerão aqui. <br/>
                        <span className="font-bold text-slate-400">Eles terão acesso imediato usando o email e senha cadastrados.</span>
                     </p>
                 </div>

                 {isSuperAdmin && (
                     <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-100">
                         <h4 className="text-xs font-black text-amber-800 uppercase mb-2">Painel SAC (Super Admin)</h4>
                         <p className="text-xs text-amber-700 leading-relaxed">
                             Modo de Super Administrador Ativo. Você visualiza todos os dados sem restrição de organização.
                         </p>
                     </div>
                 )}
             </div>
          </div>
      </div>
    </div>
  );
};

export default UsuariosView;
