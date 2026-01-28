
import React, { useState } from 'react';
import { Funcionario, Escola, StatusFuncionario, OcorrenciaFrequencia, Turno } from '../types';

interface SchoolPortalProps {
  school: Escola;
  employees: (Funcionario & { roleLabel?: string, sectorLabel?: string })[];
  onToggleAttendance: (employeeId: string, status: OcorrenciaFrequencia, obs?: string, newStatusGeral?: StatusFuncionario, file?: File) => void;
  isAdminView?: boolean;
  onEditEmployee?: (emp: Funcionario) => void;
}

const SchoolPortal: React.FC<SchoolPortalProps> = ({ school, employees, onToggleAttendance, isAdminView, onEditEmployee }) => {
  const schoolEmployees = employees.filter(e => e.escolaId === school.id);
  const activeCount = schoolEmployees.filter(e => e.status === StatusFuncionario.ATIVO).length;

  // Estados para menus e modais
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  
  // Modal Ocorrência Genérico (Admin)
  const [modalOcorrencia, setModalOcorrencia] = useState<{ emp: Funcionario, type: 'FALTA' | 'OBS' | 'LICENCA' } | null>(null);
  const [obsText, setObsText] = useState('');

  // Modal Atestado (Gestor)
  const [modalAtestado, setModalAtestado] = useState<Funcionario | null>(null);
  const [diasAtestado, setDiasAtestado] = useState<number>(1);
  const [fotoAtestado, setFotoAtestado] = useState<File | null>(null);
  
  // Agrupamento
  type EmployeeWithLabels = Funcionario & { roleLabel?: string; sectorLabel?: string };
  const groupedBySector = schoolEmployees.reduce((acc, emp) => {
    const sectorName = emp.sectorLabel || 'Diversos';
    if (!acc[sectorName]) acc[sectorName] = [];
    acc[sectorName].push(emp);
    return acc;
  }, {} as Record<string, EmployeeWithLabels[]>);

  const managerLink = `${window.location.origin}/?portal=${school.codigoGestor}`;

  // FUNÇÕES DE AÇÃO

  const handleWhatsApp = (f: Funcionario) => {
    let tel = f.telefone;
    if (!tel) {
        const input = window.prompt(`WhatsApp para ${f.nome}\n\nDigite o número (com DDD):`, "55");
        if (input) tel = input;
    }
    if (tel) {
        const cleanTel = tel.replace(/\D/g, '');
        window.open(`https://wa.me/${cleanTel}?text=Olá ${f.nome}, mensagem da Escola ${school.nome}.`, '_blank');
    }
  };

  const handleEmail = (f: Funcionario) => {
    const recipient = f.email ? f.email : "";
    window.open(`mailto:${recipient}?subject=Gestão Escolar - ${f.nome}&body=Prezado(a) ${f.nome},`, '_blank');
  };

  // Lógica do GESTOR (Confirmação Direta)
  const handleManagerToggle = (emp: Funcionario) => {
    // Se está presente, remover presença. Se não está, marcar presença.
    const novoStatus = emp.presencaConfirmada ? OcorrenciaFrequencia.FALTA_INJUSTIFICADA : OcorrenciaFrequencia.PRESENCA;
    onToggleAttendance(emp.id, novoStatus);
  };

  const handleConfirmAll = () => {
    if(window.confirm("Confirmar presença de TODOS os funcionários ativos nesta unidade?")) {
        const ativos = schoolEmployees.filter(e => e.status === StatusFuncionario.ATIVO && !e.presencaConfirmada);
        ativos.forEach(emp => {
            onToggleAttendance(emp.id, OcorrenciaFrequencia.PRESENCA);
        });
    }
  };

  const submitAtestadoGestor = () => {
      if (!modalAtestado) return;
      
      // Regra de Negócio: Gestor só pode até 5 dias
      if (!isAdminView && diasAtestado > 5) {
          alert("Limite excedido! Atestados acima de 5 dias devem ser encaminhados diretamente ao RH Central.");
          return;
      }

      if (!fotoAtestado && !isAdminView) {
          alert("É obrigatório anexar a foto do atestado.");
          return;
      }

      const obsFinal = `Atestado de ${diasAtestado} dia(s). Lançado pelo ${isAdminView ? 'RH' : 'Gestor'}.`;
      
      onToggleAttendance(
          modalAtestado.id, 
          OcorrenciaFrequencia.ATESTADO, 
          obsFinal, 
          undefined, // Não muda status geral, apenas marca o dia como atestado
          fotoAtestado || undefined
      );

      setModalAtestado(null);
      setDiasAtestado(1);
      setFotoAtestado(null);
  };

  // Lógica do OPERADOR/ADMIN (Ocorrências)
  const submitOcorrencia = () => {
      if (!modalOcorrencia) return;
      const { emp, type } = modalOcorrencia;

      if (type === 'FALTA') {
          // Marca falta e adiciona obs
          onToggleAttendance(emp.id, OcorrenciaFrequencia.FALTA_INJUSTIFICADA, obsText || 'Falta registrada pelo RH');
      } else if (type === 'LICENCA') {
          // Muda status geral e adiciona obs
          onToggleAttendance(emp.id, OcorrenciaFrequencia.ABONO, obsText || 'Licença registrada pelo RH', StatusFuncionario.LICENCA_MEDICA);
      } else {
          // Apenas obs (mantém status atual de presença, só anota)
          const statusAtual = emp.presencaConfirmada ? OcorrenciaFrequencia.PRESENCA : OcorrenciaFrequencia.FALTA_INJUSTIFICADA;
          onToggleAttendance(emp.id, statusAtual, obsText);
      }
      setModalOcorrencia(null);
      setObsText('');
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header com Status do Gestor */}
      <header className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-50 z-0"></div>
        
        {/* Barra de Status */}
        <div className="flex justify-between items-center mb-6 relative z-10">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest inline-block">
                Portal da Unidade
            </span>
            {isAdminView ? (
                <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wide">Gestor Online</span>
                </div>
            ) : (
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                    Conectado como Gestor
                </div>
            )}
        </div>

        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 md:gap-8">
           <div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-800 tracking-tighter break-words">{school.nome}</h2>
              <p className="text-slate-400 font-bold mt-2 uppercase text-xs flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <span className="truncate max-w-[200px] md:max-w-none">{school.endereco}</span>
              </p>
           </div>
           
           {/* Painel de Ação em Massa (Apenas Gestor) */}
           {!isAdminView && (
               <button 
                  onClick={handleConfirmAll}
                  className="w-full md:w-auto bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-wide shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition flex items-center justify-center gap-3 active:scale-95"
               >
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                   Confirmar Todos (Manhã)
               </button>
           )}

           {isAdminView && (
              <div className="flex gap-4 w-full md:w-auto">
                  <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-center flex-1 md:flex-none">
                     <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Turno Atual</p>
                     <p className="text-sm font-black text-indigo-600">07:00 - 11:15</p>
                  </div>
              </div>
           )}
        </div>
        
        {/* Link para Gestor (Apenas Admin vê) */}
        {isAdminView && (
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center gap-4 relative z-10 bg-slate-50/50 p-4 rounded-xl">
             <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
             </div>
             <div className="flex-1 w-full text-center md:text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acesso Rápido do Gestor</p>
                <div className="flex flex-col md:flex-row items-center gap-2 text-xs font-bold text-slate-600 justify-center md:justify-start">
                    <span>Cód: <span className="text-indigo-600 font-black bg-indigo-50 px-1 rounded">{school.codigoGestor}</span></span> 
                    <span>Senha: <span className="text-indigo-600 font-black bg-indigo-50 px-1 rounded">{school.codigoAcesso}</span></span>
                </div>
             </div>
             <button onClick={() => navigator.clipboard.writeText(managerLink)} className="text-xs font-black text-indigo-600 uppercase hover:underline shrink-0">Copiar Link</button>
          </div>
        )}

        {/* Mensagem para Gestor (Apenas Admin) */}
        {isAdminView && (
            <div className="mt-4 flex gap-2">
                <input type="text" placeholder="Recado para o Gestor..." className="flex-1 bg-white border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none focus:border-indigo-500 min-w-0" />
                <button className="px-4 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase hover:bg-slate-700 shrink-0">Enviar</button>
            </div>
        )}
      </header>

      <div className="grid grid-cols-1 gap-6 md:gap-10">
        {(Object.entries(groupedBySector) as [string, EmployeeWithLabels[]][]).map(([sector, members]) => (
          <div key={sector} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
               <h3 className="font-black text-slate-800 uppercase tracking-tight text-base md:text-lg flex items-center gap-3">
                  <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
                  {sector}
               </h3>
               <span className="text-xs font-bold text-slate-400 uppercase">{members.length} Profissionais</span>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
               <table className="w-full text-left whitespace-nowrap">
                  <thead className="text-[10px] uppercase font-black bg-slate-50/50 text-slate-400 border-b">
                    <tr>
                      <th className="px-6 py-4">Profissional</th>
                      <th className="px-6 py-4">Vínculo / Carga</th>
                      <th className="px-6 py-4 text-center">Status RH</th>
                      <th className="px-6 py-4 text-center">
                          {isAdminView ? 'Confirmação do Gestor' : 'Controle de Frequência'}
                      </th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {members.map(emp => (
                      <tr key={emp.id} className="hover:bg-slate-50 transition group">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">{emp.nome}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">MATR: {emp.matricula}</p>
                          {emp.observacaoFrequencia && (
                              <div className="mt-1 bg-amber-50 border border-amber-100 p-1.5 rounded text-[10px] text-amber-800 font-medium inline-block max-w-[200px] whitespace-normal">
                                  Obs: {emp.observacaoFrequencia}
                              </div>
                          )}
                          {emp.atestadoUrl && (
                              <a href={emp.atestadoUrl} target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-1 text-[9px] text-indigo-500 font-black uppercase hover:underline">
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                                  Ver Atestado
                              </a>
                          )}
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-xs font-black text-indigo-700 uppercase block mb-0.5">{emp.roleLabel}</span>
                           <p className="text-[10px] font-bold text-slate-400 uppercase">{emp.tipoLotacao} • {emp.turno}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${emp.status === StatusFuncionario.ATIVO ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                             {emp.status}
                           </span>
                        </td>
                        
                        {/* COLUNA DE FREQUÊNCIA: Lógica Diferente para Admin/Gestor */}
                        <td className="px-6 py-4 text-center">
                           {isAdminView ? (
                               // VISÃO ADMIN: Read-Only do que o Gestor fez
                               <div className="flex flex-col items-center gap-1">
                                   {emp.presencaConfirmada ? (
                                       <span className="flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase">
                                           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                           Confirmado
                                       </span>
                                   ) : (
                                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide bg-slate-100 px-3 py-1 rounded-full">
                                           Pendente / Ausente
                                       </span>
                                   )}
                                   {emp.status === StatusFuncionario.ATIVO && !emp.presencaConfirmada && (
                                       <button 
                                          onClick={() => setModalOcorrencia({ emp, type: 'OBS' })}
                                          className="text-[9px] text-indigo-500 font-bold hover:underline mt-1"
                                       >
                                           + Add Observação
                                       </button>
                                   )}
                               </div>
                           ) : (
                               // VISÃO GESTOR: Toggle Ativo + Botão Atestado
                               <div className="flex items-center justify-center gap-2">
                                   <button 
                                     onClick={() => handleManagerToggle(emp)}
                                     disabled={emp.status !== StatusFuncionario.ATIVO}
                                     className={`px-3 py-2 rounded-xl flex items-center gap-2 justify-center transition-all text-[10px] font-black uppercase tracking-wide border select-none active:scale-95 ${
                                       emp.presencaConfirmada 
                                       ? 'bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-200' 
                                       : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:border-slate-300'
                                     } ${emp.status !== StatusFuncionario.ATIVO ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                   >
                                     {emp.presencaConfirmada ? 'Presente' : 'Ausente'}
                                   </button>
                                   
                                   {/* Botão Atestado (Gestor) */}
                                   <button 
                                     onClick={() => setModalAtestado(emp)}
                                     disabled={emp.status !== StatusFuncionario.ATIVO || emp.presencaConfirmada}
                                     className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                     title="Lançar Atestado (Max 5 dias)"
                                   >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-4"/><path d="M8 14h8"/></svg>
                                   </button>
                               </div>
                           )}
                        </td>

                        <td className="px-6 py-4 text-right">
                           <div className="flex justify-end gap-2 relative">
                                {/* Botões de Contato */}
                                <div className="relative">
                                    <button 
                                        onClick={() => setOpenActionId(openActionId === emp.id ? null : emp.id)} 
                                        className={`p-2 rounded-lg transition border ${openActionId === emp.id ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}
                                        title="Contatar"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                    </button>
                                    {openActionId === emp.id && (
                                        <>
                                            <div className="fixed inset-0 z-10 cursor-default" onClick={() => setOpenActionId(null)}></div>
                                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-20 p-2 animate-in fade-in zoom-in-95 origin-top-right">
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 pb-2 mb-1 border-b border-slate-50">Contatar via:</div>
                                                <button onClick={() => { handleWhatsApp(emp); setOpenActionId(null); }} className="flex items-center gap-3 w-full p-2 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-lg text-xs font-bold transition text-left mb-1">
                                                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                                    </div>
                                                    WhatsApp
                                                </button>
                                                <button onClick={() => { handleEmail(emp); setOpenActionId(null); }} className="flex items-center gap-3 w-full p-2 hover:bg-sky-50 text-slate-600 hover:text-sky-700 rounded-lg text-xs font-bold transition text-left">
                                                    <div className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                                                    </div>
                                                    E-mail
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Menu de Ocorrências (Apenas Admin/Operador) */}
                                {isAdminView && (
                                    <button 
                                        onClick={() => setModalOcorrencia({ emp, type: 'FALTA' })} 
                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-100"
                                        title="Gerenciar Ocorrência (Falta/Licença)"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><line x1="10" y1="10" x2="14" y2="14"/><line x1="14" y1="10" x2="10" y2="14"/></svg>
                                    </button>
                                )}
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Atestado (Gestor) */}
      {modalAtestado && (
          <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-50 p-4 animate-in fade-in backdrop-blur-sm">
              <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl">
                  <h3 className="text-xl font-black text-slate-800 mb-2">Lançar Atestado</h3>
                  <p className="text-sm text-slate-500 mb-6 font-medium">Funcionário: <span className="text-slate-900 font-bold">{modalAtestado.nome}</span></p>

                  <div className="space-y-4 mb-6">
                      <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Duração (Dias)</label>
                          <input 
                              type="number" 
                              min="1" 
                              max={isAdminView ? 90 : 5}
                              className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black text-slate-800 outline-none focus:border-indigo-500"
                              value={diasAtestado}
                              onChange={e => setDiasAtestado(Number(e.target.value))}
                          />
                          {!isAdminView && (
                              <p className="text-[10px] text-amber-600 font-bold mt-1">Máximo permitido para Gestor: 5 dias.</p>
                          )}
                      </div>

                      <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Foto do Atestado</label>
                          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition">
                              <input type="file" className="hidden" accept="image/*" onChange={e => setFotoAtestado(e.target.files?.[0] || null)} />
                              {fotoAtestado ? (
                                  <span className="text-xs font-bold text-emerald-600 truncate max-w-[200px]">{fotoAtestado.name}</span>
                              ) : (
                                  <>
                                      <svg className="w-6 h-6 text-slate-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                      <span className="text-[10px] text-slate-400 uppercase font-bold">Clique para enviar</span>
                                  </>
                              )}
                          </label>
                      </div>
                  </div>

                  <div className="flex gap-3">
                      <button onClick={() => { setModalAtestado(null); setDiasAtestado(1); setFotoAtestado(null); }} className="flex-1 py-3 text-slate-500 font-bold text-xs uppercase hover:bg-slate-100 rounded-xl transition">Cancelar</button>
                      <button onClick={submitAtestadoGestor} className="flex-1 py-3 bg-indigo-600 text-white font-black text-xs uppercase rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
                          Confirmar
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Modal de Ocorrência Genérico (Operador/Admin) */}
      {modalOcorrencia && (
          <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-50 p-4 animate-in fade-in backdrop-blur-sm">
              <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl">
                  <h3 className="text-xl font-black text-slate-800 mb-2">Registrar Ocorrência</h3>
                  <p className="text-sm text-slate-500 mb-6 font-medium">Funcionário: <span className="text-slate-900 font-bold">{modalOcorrencia.emp.nome}</span></p>

                  <div className="space-y-3 mb-6">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Registro</label>
                      <div className="grid grid-cols-2 gap-3">
                          <button 
                              onClick={() => setModalOcorrencia({ ...modalOcorrencia, type: 'FALTA' })}
                              className={`p-3 rounded-xl text-xs font-black uppercase border transition ${modalOcorrencia.type === 'FALTA' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'border-slate-200 text-slate-400 hover:border-rose-200'}`}
                          >
                              Falta / Atestado
                          </button>
                          <button 
                              onClick={() => setModalOcorrencia({ ...modalOcorrencia, type: 'LICENCA' })}
                              className={`p-3 rounded-xl text-xs font-black uppercase border transition ${modalOcorrencia.type === 'LICENCA' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'border-slate-200 text-slate-400 hover:border-amber-200'}`}
                          >
                              Licença Médica
                          </button>
                      </div>
                  </div>

                  <div className="mb-6">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Observação para o Gestor</label>
                      <textarea 
                          autoFocus
                          className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 resize-none"
                          placeholder="Descreva o motivo da falta, atestado ou observação..."
                          value={obsText}
                          onChange={e => setObsText(e.target.value)}
                      ></textarea>
                  </div>

                  <div className="flex gap-3">
                      <button onClick={() => { setModalOcorrencia(null); setObsText(''); }} className="flex-1 py-3 text-slate-500 font-bold text-xs uppercase hover:bg-slate-100 rounded-xl transition">Cancelar</button>
                      <button onClick={submitOcorrencia} className="flex-1 py-3 bg-indigo-600 text-white font-black text-xs uppercase rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
                          Salvar Registro
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default SchoolPortal;
