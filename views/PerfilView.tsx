
import React, { useState } from 'react';
import { Usuario } from '../types';

interface PerfilViewProps {
  user: Usuario;
  onUpdateProfile: (nome: string, email: string, senha?: string) => Promise<void>;
}

const PerfilView: React.FC<PerfilViewProps> = ({ user, onUpdateProfile }) => {
  const [nome, setNome] = useState(user.nome);
  const [email, setEmail] = useState(user.email);
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdateProfile(nome, email, senha || undefined);
      setSenha(''); // Limpa senha após salvar
    } catch (error: any) {
      alert("Erro ao atualizar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full h-12 px-4 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";
  const labelClass = "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1";

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in">
      <div className="text-center">
        <div className="w-24 h-24 bg-indigo-600 text-white text-3xl font-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200">
          {nome.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Editar Perfil</h2>
        <p className="text-slate-500 font-medium">Gerencie suas credenciais de acesso.</p>
      </div>

      <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={labelClass}>Nome de Exibição</label>
            <input type="text" required className={inputClass} value={nome} onChange={e => setNome(e.target.value)} />
          </div>

          <div>
            <label className={labelClass}>Email de Acesso</label>
            <input type="email" required className={inputClass} value={email} onChange={e => setEmail(e.target.value)} />
            <p className="text-[10px] text-amber-600 mt-2 font-bold flex items-center gap-1">
              ⚠️ Alterar o email exigirá nova confirmação.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <label className={labelClass}>Nova Senha (Opcional)</label>
            <input 
                type="password" 
                placeholder="Deixe em branco para manter a atual" 
                className={inputClass} 
                value={senha} 
                onChange={e => setSenha(e.target.value)} 
            />
          </div>

          <div className="pt-4 flex justify-end">
             <button type="submit" disabled={loading} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50">
               {loading ? 'Salvando...' : 'Salvar Alterações'}
             </button>
          </div>
        </form>
      </div>
      
      <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">ID do Usuário / Organização</p>
          <code className="text-xs bg-white px-2 py-1 rounded border border-slate-200 text-slate-600 select-all">{user.donoId}</code>
      </div>
    </div>
  );
};

export default PerfilView;
