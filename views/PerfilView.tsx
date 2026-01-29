
import React, { useState } from 'react';
import { Usuario, RhContact, Perfil } from '../types';

interface PerfilViewProps {
  user: Usuario;
  onUpdateProfile: (nome: string, email: string, senha?: string) => Promise<void>;
  globalContacts?: RhContact[];
  onUpdateGlobalContacts?: (contacts: RhContact[]) => void;
}

const PerfilView: React.FC<PerfilViewProps> = ({ user, onUpdateProfile, globalContacts = [], onUpdateGlobalContacts }) => {
  const [nome, setNome] = useState(user.nome);
  const [email, setEmail] = useState(user.email);
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditingContacts, setIsEditingContacts] = useState(false);

  const isAdmin = user.perfil === Perfil.ADMINISTRADOR || user.perfil === Perfil.SUPER_ADMIN;

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

  const handleContactChange = (idx: number, field: keyof RhContact, value: string) => {
    const newContacts = [...globalContacts];
    if (newContacts[idx]) {
      (newContacts[idx] as any)[field] = value;
      onUpdateGlobalContacts?.(newContacts);
    }
  };

  const addContact = () => {
    const newContacts = [...globalContacts, { label: 'Novo Contato', value: '', type: 'phone' as const }];
    onUpdateGlobalContacts?.(newContacts);
  };

  const removeContact = (idx: number) => {
    const newContacts = globalContacts.filter((_, i) => i !== idx);
    onUpdateGlobalContacts?.(newContacts);
  };

  const inputClass = "w-full h-12 px-4 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";
  const labelClass = "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1";

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in pb-20">
      <div className="text-center">
        <div className="w-24 h-24 bg-indigo-600 text-white text-3xl font-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200">
          {nome.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Editar Perfil</h2>
        <p className="text-slate-500 font-medium">Gerencie suas credenciais de acesso.</p>
      </div>

      <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2 mb-4">Dados Pessoais</h3>
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

      {isAdmin && (
        <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Contatos de RH da Rede (Todas Escolas)</h3>
            <button 
              onClick={() => setIsEditingContacts(!isEditingContacts)} 
              className="text-[10px] font-black text-indigo-600 uppercase"
            >
              {isEditingContacts ? 'Concluir' : 'Gerenciar'}
            </button>
          </div>

          <div className="space-y-4">
            {globalContacts.map((c, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.type === 'email' ? 'bg-sky-100 text-sky-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {c.type === 'email' ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  )}
                </div>
                <div className="flex-1">
                  {isEditingContacts ? (
                    <div className="grid grid-cols-2 gap-2">
                       <input 
                        className="w-full text-xs font-black bg-white border border-slate-200 rounded px-2 py-1"
                        value={c.label}
                        onChange={e => handleContactChange(idx, 'label', e.target.value)}
                      />
                      <input 
                        className="w-full text-xs font-bold bg-white border border-slate-200 rounded px-2 py-1"
                        value={c.value}
                        onChange={e => handleContactChange(idx, 'value', e.target.value)}
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-[10px] font-black text-slate-800 uppercase">{c.label}</p>
                      <p className="text-xs font-bold text-slate-500">{c.value}</p>
                    </>
                  )}
                </div>
                {isEditingContacts && (
                  <button onClick={() => removeContact(idx)} className="text-rose-400 p-2"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
                )}
              </div>
            ))}
            {isEditingContacts && (
              <button onClick={addContact} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 uppercase hover:border-indigo-400 hover:text-indigo-500 transition">+ Adicionar Contato Geral</button>
            )}
          </div>
          <p className="mt-4 text-[10px] text-slate-400 font-medium">Estes contatos aparecem no portal de todas as unidades escolares.</p>
        </div>
      )}
      
      <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">ID do Usuário / Organização</p>
          <code className="text-xs bg-white px-2 py-1 rounded border border-slate-200 text-slate-600 select-all">{user.donoId} codes</code>
      </div>
    </div>
  );
};

export default PerfilView;
