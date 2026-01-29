
import React, { useState } from 'react';
import { Setor, Funcao } from '../types.ts';

interface ConfiguracoesViewProps {
  setores: Setor[];
  funcoes: Funcao[];
  aoAdicionarSetor: (nome: string) => void;
  aoEditarSetor: (id: string, nome: string) => void;
  aoRemoverSetor: (id: string) => void;
  aoAdicionarFuncao: (nome: string) => void;
  aoEditarFuncao: (id: string, nome: string) => void;
  aoRemoverFuncao: (id: string) => void;
}

const ConfiguracoesView: React.FC<ConfiguracoesViewProps> = ({ 
    setores, funcoes, 
    aoAdicionarSetor, aoEditarSetor, aoRemoverSetor, 
    aoAdicionarFuncao, aoEditarFuncao, aoRemoverFuncao 
}) => {
  const [novoSetor, setNovoSetor] = useState('');
  const [novaFuncao, setNovaFuncao] = useState('');
  const [editSetorId, setEditSetorId] = useState<string | null>(null);
  const [editSetorNome, setEditSetorNome] = useState('');
  const [editFuncaoId, setEditFuncaoId] = useState<string | null>(null);
  const [editFuncaoNome, setEditFuncaoNome] = useState('');

  const inputClass = "flex-1 h-12 px-4 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm";
  const inputClassEmerald = "flex-1 h-12 px-4 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm";

  const startEditSetor = (s: Setor) => { setEditSetorId(s.id); setEditSetorNome(s.nome); };
  const saveSetor = (id: string) => { if(editSetorNome.trim()) aoEditarSetor(id, editSetorNome); setEditSetorId(null); };
  const cancelSetor = () => setEditSetorId(null);

  const startEditFuncao = (f: Funcao) => { setEditFuncaoId(f.id); setEditFuncaoNome(f.nome); };
  const saveFuncao = (id: string) => { if(editFuncaoNome.trim()) aoEditarFuncao(id, editFuncaoNome); setEditFuncaoId(null); };
  const cancelFuncao = () => setEditFuncaoId(null);

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Itens do Sistema</h2>
        <p className="text-slate-500 font-medium">Gerencie as categorias de setores e funções da rede.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
            Setores
          </h3>
          <form onSubmit={(e) => { e.preventDefault(); if(novoSetor.trim()) { aoAdicionarSetor(novoSetor); setNovoSetor(''); } }} className="flex gap-3 mb-6">
            <input type="text" placeholder="Novo setor..." className={inputClass} value={novoSetor} onChange={e => setNovoSetor(e.target.value)} />
            <button type="submit" disabled={!novoSetor.trim()} className="px-6 h-12 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 disabled:opacity-50">Add</button>
          </form>
          <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-2">
            {setores.map(s => (
              <div key={s.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition">
                {editSetorId === s.id ? (
                    <div className="flex flex-1 items-center gap-2">
                        <input autoFocus type="text" className="flex-1 h-8 px-2 bg-white border border-indigo-300 rounded-lg text-sm font-bold text-slate-800 outline-none" value={editSetorNome} onChange={e => setEditSetorNome(e.target.value)} onKeyDown={e => { if(e.key === 'Enter') saveSetor(s.id); if(e.key === 'Escape') cancelSetor(); }} />
                        <button onClick={() => saveSetor(s.id)} className="p-1 text-emerald-500 hover:bg-emerald-50 rounded"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></button>
                        <button onClick={cancelSetor} className="p-1 text-rose-400 hover:bg-rose-50 rounded"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                    </div>
                ) : (
                    <>
                        <span className="font-black text-slate-700 text-sm uppercase truncate pr-2">{s.nome}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                            <button onClick={() => startEditSetor(s)} className="text-indigo-400 hover:text-indigo-600 p-1 hover:bg-indigo-50 rounded-lg"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg></button>
                            <button onClick={() => aoRemoverSetor(s.id)} className="text-rose-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded-lg"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
                        </div>
                    </>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
            Funções
          </h3>
          <form onSubmit={(e) => { e.preventDefault(); if(novaFuncao.trim()) { aoAdicionarFuncao(novaFuncao); setNovaFuncao(''); } }} className="flex gap-3 mb-6">
            <input type="text" placeholder="Nova função..." className={inputClassEmerald} value={novaFuncao} onChange={e => setNovaFuncao(e.target.value)} />
            <button type="submit" disabled={!novaFuncao.trim()} className="px-6 h-12 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 disabled:opacity-50">Add</button>
          </form>
          <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-2">
            {funcoes.map(f => (
              <div key={f.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-emerald-200 transition">
                {editFuncaoId === f.id ? (
                    <div className="flex flex-1 items-center gap-2">
                        <input autoFocus type="text" className="flex-1 h-8 px-2 bg-white border border-emerald-300 rounded-lg text-sm font-bold text-slate-800 outline-none" value={editFuncaoNome} onChange={e => setEditFuncaoNome(e.target.value)} onKeyDown={e => { if(e.key === 'Enter') saveFuncao(f.id); if(e.key === 'Escape') cancelFuncao(); }} />
                        <button onClick={() => saveFuncao(f.id)} className="p-1 text-emerald-500 hover:bg-emerald-50 rounded"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></button>
                        <button onClick={cancelFuncao} className="p-1 text-rose-400 hover:bg-rose-50 rounded"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                    </div>
                ) : (
                    <>
                        <span className="font-black text-slate-700 text-sm uppercase truncate pr-2">{f.nome}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                            <button onClick={() => startEditFuncao(f)} className="text-emerald-400 hover:text-emerald-600 p-1 hover:bg-emerald-50 rounded-lg"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg></button>
                            <button onClick={() => aoRemoverFuncao(f.id)} className="text-rose-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded-lg"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
                        </div>
                    </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracoesView;
