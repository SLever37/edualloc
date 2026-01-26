
import React, { useState } from 'react';
import { Funcionario, Escola, Funcao, Setor, StatusFuncionario } from '../types';
import ExcelImportModal from '../components/ExcelImportModal';

interface PessoalViewProps {
  funcionarios: Funcionario[];
  escolas: Escola[];
  funcoes: Funcao[];
  setores: Setor[];
  aoEditar: (f: Funcionario) => void;
  aoAdicionar: () => void;
  aoRemover: (id: string) => void;
  onImport?: (data: Partial<Funcionario>[]) => Promise<void>; // Opcional para manter compatibilidade
}

const PessoalView: React.FC<PessoalViewProps> = ({ funcionarios, escolas, funcoes, setores, aoEditar, aoAdicionar, aoRemover, onImport }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEscola, setFilterEscola] = useState('');
  const [filterFuncao, setFilterFuncao] = useState('');
  const [showImport, setShowImport] = useState(false);
  
  // Estado para controlar qual menu de contato está aberto (pelo ID do funcionário)
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  const handleWhatsApp = (nome: string) => {
    const tel = window.prompt(`WhatsApp para ${nome}\n\nDigite o número (com DDD):`, "55");
    if (tel) {
        const cleanTel = tel.replace(/\D/g, '');
        window.open(`https://wa.me/${cleanTel}?text=Olá ${nome}, mensagem do RH.`, '_blank');
    }
  };

  const handleEmail = (nome: string) => {
    window.open(`mailto:?subject=Aviso RH - ${nome}&body=Prezado(a) ${nome},`, '_blank');
  };

  const handleDelete = (id: string, nome: string) => {
    const confirm = window.confirm(`ATENÇÃO: Deseja excluir permanentemente o funcionário ${nome}?`);
    if(confirm) aoRemover(id);
  };

  const filteredFuncionarios = funcionarios.filter(f => {
    const matchesSearch = f.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          f.matricula.includes(searchTerm) ||
                          f.cpf.includes(searchTerm);
    const matchesEscola = filterEscola ? f.escolaId === filterEscola : true;
    const matchesFuncao = filterFuncao ? f.funcaoId === filterFuncao : true;
    
    return matchesSearch && matchesEscola && matchesFuncao;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Pessoal Global</h2>
          <p className="text-slate-500">Gestão completa de todos os profissionais da rede.</p>
        </div>
        <div className="flex gap-3">
          {onImport && (
            <button onClick={() => setShowImport(true)} className="px-4 py-3 bg-white border border-slate-200 text-indigo-600 rounded-xl font-black text-xs uppercase hover:bg-slate-50 transition shadow-sm">
                Importar Excel
            </button>
          )}
          <button onClick={aoAdicionar} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition">
            + Novo Funcionário
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
         <div className="flex-1 relative">
            <input 
               type="text" 
               placeholder="Buscar por nome, matrícula ou CPF..." 
               className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 transition"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
            />
            <svg className="absolute left-3 top-3.5 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
         </div>
         <select 
            className="h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-600 outline-none focus:border-indigo-500 transition md:w-48"
            value={filterEscola}
            onChange={e => setFilterEscola(e.target.value)}
         >
            <option value="">Todas as Escolas</option>
            {escolas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
         </select>
         <select 
            className="h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-600 outline-none focus:border-indigo-500 transition md:w-48"
            value={filterFuncao}
            onChange={e => setFilterFuncao(e.target.value)}
         >
            <option value="">Todas as Funções</option>
            {funcoes.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
         </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Profissional</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Função/Setor</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Escola</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFuncionarios.map(f => (
                <tr key={f.id} className="hover:bg-slate-50 transition relative">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{f.nome}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{f.matricula || f.cpf}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-black uppercase inline-block mb-1">
                      {funcoes.find(role => role.id === f.funcaoId)?.nome || 'Sem Função'}
                    </span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      {setores.find(s => s.id === f.setorId)?.nome}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-600">{escolas.find(e => e.id === f.escolaId)?.nome || 'Não Alocado'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${f.status === StatusFuncionario.ATIVO ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 relative">
                        
                        {/* Dropdown de Contato */}
                        <div className="relative">
                            <button 
                                onClick={() => setOpenActionId(openActionId === f.id ? null : f.id)} 
                                className={`p-2 rounded-lg transition border ${openActionId === f.id ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}
                                title="Enviar Mensagem"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            </button>

                            {/* Menu Flutuante */}
                            {openActionId === f.id && (
                                <>
                                    <div className="fixed inset-0 z-10 cursor-default" onClick={() => setOpenActionId(null)}></div>
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-20 p-2 animate-in fade-in zoom-in-95 origin-top-right">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 pb-2 mb-1 border-b border-slate-50">Contatar via:</div>
                                        <button onClick={() => { handleWhatsApp(f.nome); setOpenActionId(null); }} className="flex items-center gap-3 w-full p-2 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-lg text-xs font-bold transition text-left mb-1">
                                            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                            </div>
                                            WhatsApp
                                        </button>
                                        <button onClick={() => { handleEmail(f.nome); setOpenActionId(null); }} className="flex items-center gap-3 w-full p-2 hover:bg-sky-50 text-slate-600 hover:text-sky-700 rounded-lg text-xs font-bold transition text-left">
                                            <div className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                                            </div>
                                            E-mail
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Botão Editar */}
                        <button onClick={() => aoEditar(f)} className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:scale-105 rounded-lg transition" title="Editar Cadastro">
                           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        </button>
                        {/* Botão Excluir */}
                        <button onClick={() => handleDelete(f.id, f.nome)} className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:scale-105 rounded-lg transition" title="Excluir Registro">
                           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredFuncionarios.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium italic">Nenhum funcionário encontrado com estes filtros.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showImport && onImport && (
        <ExcelImportModal 
          escolas={escolas} 
          funcoes={funcoes} 
          setores={setores} 
          onImport={onImport} 
          onClose={() => setShowImport(false)} 
        />
      )}
    </div>
  );
};

export default PessoalView;
