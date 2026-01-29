
import React, { useState } from 'react';
import { Funcionario, Escola, Funcao, Setor, StatusFuncionario } from '../types.ts';
import ExcelImportModal from '../components/ExcelImportModal.tsx';

interface PessoalViewProps {
  funcionarios: Funcionario[];
  escolas: Escola[];
  funcoes: Funcao[];
  setores: Setor[];
  aoEditar: (f: Funcionario) => void;
  aoAdicionar: () => void;
  aoRemover: (id: string) => void;
  onImport?: (data: Partial<Funcionario>[]) => Promise<void>;
}

const PessoalView: React.FC<PessoalViewProps> = ({ funcionarios, escolas, funcoes, setores, aoEditar, aoAdicionar, aoRemover, onImport }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEscola, setFilterEscola] = useState('');
  const [showImport, setShowImport] = useState(false);

  const filtered = funcionarios.filter(f => 
    (f.nome.toLowerCase().includes(searchTerm.toLowerCase()) || f.cpf.includes(searchTerm)) &&
    (!filterEscola || f.escolaId === filterEscola)
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tighter">Gestão de Servidores</h2>
          <p className="text-sm text-slate-500 font-medium">Controle unificado da rede municipal de ensino.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={() => setShowImport(true)} className="flex-1 md:px-6 py-3 bg-white border border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm">Importar</button>
          <button onClick={aoAdicionar} className="flex-1 md:px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100">+ Novo Servidor</button>
        </div>
      </div>

      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        <input type="text" placeholder="Nome ou CPF..." className="flex-1 h-12 px-4 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <select className="h-12 px-4 bg-slate-50 rounded-xl font-bold text-sm text-slate-500 md:w-64" value={filterEscola} onChange={e => setFilterEscola(e.target.value)}>
          <option value="">Todas Unidades</option>
          {escolas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
        </select>
      </div>

      <div className="hidden lg:block bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Servidor</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Lotação</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(f => (
              <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 overflow-hidden flex-shrink-0">
                      {f.fotoUrl ? <img src={f.fotoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-indigo-300 font-bold">{f.nome.charAt(0)}</div>}
                    </div>
                    <div><p className="font-black text-slate-800 text-sm leading-none">{f.nome}</p><p className="text-[10px] text-slate-400 font-bold uppercase mt-1">CPF: {f.cpf}</p></div>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <p className="text-sm font-bold text-slate-600">{escolas.find(e => e.id === f.escolaId)?.nome || 'Não alocado'}</p>
                   <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">{funcoes.find(r => r.id === f.funcaoId)?.nome}</p>
                </td>
                <td className="px-6 py-4">
                   <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${f.status === StatusFuncionario.ATIVO ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>{f.status}</span>
                </td>
                <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                        <button onClick={() => aoEditar(f)} className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-lg transition"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg></button>
                        <button onClick={() => aoRemover(f.id)} className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-lg transition"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden space-y-4">
          {filtered.map(f => (
            <div key={f.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 overflow-hidden shrink-0">
                    {f.fotoUrl ? <img src={f.fotoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-indigo-300 font-black text-xl">{f.nome.charAt(0)}</div>}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-slate-800 text-sm truncate leading-none mb-1">{f.nome}</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{funcoes.find(r => r.id === f.funcaoId)?.nome}</p>
                    <div className="mt-2"><span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${f.status === StatusFuncionario.ATIVO ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>{f.status}</span></div>
                  </div>
               </div>
               <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Unidade</p>
                  <p className="text-xs font-bold text-slate-700">{escolas.find(e => e.id === f.escolaId)?.nome || 'Sem lotação'}</p>
               </div>
               <div className="flex gap-2">
                  <button onClick={() => aoEditar(f)} className="flex-1 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest">Editar</button>
                  <button onClick={() => aoRemover(f.id)} className="flex-1 py-3 bg-rose-50 text-rose-600 rounded-xl font-black text-[10px] uppercase tracking-widest">Excluir</button>
               </div>
            </div>
          ))}
      </div>

      {showImport && onImport && <ExcelImportModal escolas={escolas} funcoes={funcoes} setores={setores} onImport={onImport} onClose={() => setShowImport(false)} />}
    </div>
  );
};

export default PessoalView;
