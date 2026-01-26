
import React, { useState } from 'react';
import { Escola, Funcionario, Funcao } from '../types';

interface EscolasViewProps {
  escolas: Escola[];
  funcionarios: Funcionario[];
  funcoes?: Funcao[]; // Opcional para garantir compatibilidade se não for passado
  aoEditar: (e: Escola) => void;
  aoAdicionar: () => void;
  aoVisualizar: (id: string) => void;
  aoRemover: (id: string) => void;
}

const EscolasView: React.FC<EscolasViewProps> = ({ escolas, funcionarios, funcoes = [], aoEditar, aoAdicionar, aoVisualizar, aoRemover }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = (id: string, nome: string) => {
     const confirm = window.confirm(`ATENÇÃO: Deseja apagar a escola ${nome}?\n\nIsto só será possível se não houver funcionários nela.`);
     if (confirm) aoRemover(id);
  };

  // Helper para agrupar funcionários por função
  const getResumoLotacao = (escolaId: string) => {
      const staff = funcionarios.filter(f => f.escolaId === escolaId);
      const resumo: Record<string, number> = {};
      
      staff.forEach(s => {
          // Tenta pegar o nome da função pelo ID, ou usa um genérico
          const nomeFuncao = funcoes.find(f => f.id === s.funcaoId)?.nome || 'Sem Função';
          resumo[nomeFuncao] = (resumo[nomeFuncao] || 0) + 1;
      });

      // Transforma em array ordenado por quantidade
      return Object.entries(resumo)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3); // Pega o top 3
  };

  const filteredEscolas = escolas.filter(e => 
    e.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.endereco.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Gestão de Unidades</h2>
          <p className="text-slate-500 font-medium">Administre as escolas e visualize o quadro de lotação.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <input 
                type="text" 
                placeholder="Buscar escola..." 
                className="w-full h-12 pl-10 pr-4 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 transition shadow-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
             />
             <svg className="absolute left-3 top-3 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <button onClick={aoAdicionar} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition shrink-0">
            + Nova Escola
          </button>
        </div>
      </div>

      {filteredEscolas.length === 0 && (
          <div className="text-center py-10">
              <p className="text-slate-400 font-bold">Nenhuma escola encontrada.</p>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredEscolas.map(escola => {
          const totalEmp = funcionarios.filter(f => f.escolaId === escola.id).length;
          const topFuncoes = getResumoLotacao(escola.id);

          return (
            <div key={escola.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group hover:border-indigo-500 transition-all relative flex flex-col h-full">
              
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition">
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </div>
                <div className="flex gap-1">
                    <button onClick={() => aoEditar(escola)} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Configurar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    </button>
                    <button onClick={() => handleDelete(escola.id, escola.nome)} className="p-2 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition" title="Excluir Escola">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                </div>
              </div>
              
              <div className="mb-4">
                  <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight mb-1">{escola.nome}</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase truncate" title={escola.endereco}>
                      {escola.endereco || 'Endereço não cadastrado'}
                  </p>
              </div>

              {/* Quadro de Lotação Mini */}
              <div className="flex-1 bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-200 pb-1">
                      Quadro de Lotação
                  </p>
                  {topFuncoes.length > 0 ? (
                      <ul className="space-y-1">
                          {topFuncoes.map(([cargo, qtd]) => (
                              <li key={cargo} className="flex justify-between items-center text-xs">
                                  <span className="text-slate-600 font-bold truncate pr-2 max-w-[150px]">{cargo}</span>
                                  <span className="bg-white px-1.5 py-0.5 rounded text-indigo-600 font-black text-[10px] border border-indigo-100">{qtd}</span>
                              </li>
                          ))}
                          {totalEmp > 3 && (
                             <li className="text-[10px] text-slate-400 italic text-center pt-1">+ outras funções</li>
                          )}
                      </ul>
                  ) : (
                      <p className="text-[10px] text-slate-400 italic text-center py-2">Sem lotação ativa</p>
                  )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center mt-auto">
                 <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-black">Total Alocado</span>
                    <span className="text-2xl font-black text-slate-800 leading-none">{totalEmp}</span>
                 </div>
                 <button onClick={() => aoVisualizar(escola.id)} className="px-4 py-2 bg-slate-900 text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition shadow-lg shadow-slate-200">
                    Acessar Portal
                 </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EscolasView;
