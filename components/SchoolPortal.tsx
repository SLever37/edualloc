
import React from 'react';
import { Funcionario, Escola, StatusFuncionario, OcorrenciaFrequencia } from '../types';

interface SchoolPortalProps {
  school: Escola;
  employees: (Funcionario & { roleLabel?: string, sectorLabel?: string })[];
  onToggleAttendance: (employeeId: string, status: OcorrenciaFrequencia) => void;
  isAdminView?: boolean;
  onEditEmployee?: (emp: Funcionario) => void;
}

const SchoolPortal: React.FC<SchoolPortalProps> = ({ school, employees, onToggleAttendance, isAdminView, onEditEmployee }) => {
  const schoolEmployees = employees.filter(e => e.escolaId === school.id);
  const activeCount = schoolEmployees.filter(e => e.status === StatusFuncionario.ATIVO).length;
  const leaveCount = schoolEmployees.length - activeCount;

  type EmployeeWithLabels = Funcionario & { roleLabel?: string; sectorLabel?: string };

  const groupedBySector = schoolEmployees.reduce((acc, emp) => {
    const sectorName = emp.sectorLabel || 'Diversos';
    if (!acc[sectorName]) acc[sectorName] = [];
    acc[sectorName].push(emp);
    return acc;
  }, {} as Record<string, EmployeeWithLabels[]>);

  const managerLink = `${window.location.origin}/?portal=${school.codigoGestor}`;

  const handleAttendanceClick = (emp: Funcionario) => {
    if (emp.status !== StatusFuncionario.ATIVO) return;

    // Lógica de Ciclo: Presença -> Falta Injustificada -> Atestado -> Presença
    let nextStatus: OcorrenciaFrequencia;
    
    if (emp.presencaConfirmada) {
        // Se está presente, o próximo clique marca Falta
        nextStatus = OcorrenciaFrequencia.FALTA_INJUSTIFICADA;
    } else {
        // Se não está confirmado como "Presença", verificamos o estado atual visual (se houvesse)
        // Como o backend atual simplificado booleano (presenca_confirmada) limita, 
        // vamos simular o ciclo visualmente na UI, mas persistir o que for possível.
        // O hook AppData trata 'presencaConfirmada' como booleano por enquanto, 
        // mas vamos passar a Ocorrência completa para preparar o terreno.
        
        // Se já foi marcado como falta (visualmente não persistido no modelo simples, assumimos reset)
        nextStatus = OcorrenciaFrequencia.PRESENCA;
    }

    // Para UX simplificada:
    // Clique 1: Marca Presença (Verde)
    // Clique 2: Marca Falta (Vermelho - simulado removendo presença)
    // Futuro: Implementar Enum completo no banco.
    
    // ATUALMENTE: Toggle simples para MVP rápido solicitado
    const novoStatus = emp.presencaConfirmada ? OcorrenciaFrequencia.FALTA_INJUSTIFICADA : OcorrenciaFrequencia.PRESENCA;
    onToggleAttendance(emp.id, novoStatus);
  };

  const handleContact = (nome: string) => {
      const meio = window.prompt(`Contatar ${nome} via:\n1. WhatsApp\n2. Email`);
      if (meio === '1') {
          const tel = window.prompt("Número (com DDD):", "55");
          if (tel) window.open(`https://wa.me/${tel}?text=Olá ${nome}, mensagem da gestão escolar.`, '_blank');
      } else if (meio === '2') {
          window.open(`mailto:?subject=Gestão Escolar - ${nome}`, '_blank');
      }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-50 z-0"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
           <div>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">Unidade Escolar Ativa</span>
              <h2 className="text-4xl font-black text-slate-800 tracking-tighter">{school.nome}</h2>
              <p className="text-slate-400 font-bold mt-2 uppercase text-xs flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                {school.endereco}
              </p>
           </div>
           <div className="flex gap-4">
              <div className="bg-emerald-50 px-8 py-4 rounded-3xl border border-emerald-100 text-center">
                 <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-1">Efetivo Ativo</p>
                 <p className="text-4xl font-black text-emerald-700">{activeCount}</p>
              </div>
              <div className="bg-rose-50 px-8 py-4 rounded-3xl border border-rose-100 text-center">
                 <p className="text-[10px] text-rose-600 font-black uppercase tracking-widest mb-1">Em Licença</p>
                 <p className="text-4xl font-black text-rose-700">{leaveCount}</p>
              </div>
           </div>
        </div>
        
        {isAdminView && (
          <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col sm:row items-center justify-between gap-6 relative z-10">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Acesso do Gestor</p>
                   <p className="text-xs font-bold text-slate-500 max-w-[300px] leading-tight">
                     Envie este link para o Gestor. Ele precisará do Código: <span className="text-indigo-600">{school.codigoGestor}</span> e Senha: <span className="text-indigo-600">{school.codigoAcesso}</span>
                   </p>
                </div>
             </div>
             <button 
               onClick={() => { navigator.clipboard.writeText(managerLink); alert("Link do gestor copiado!"); }} 
               className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition shadow-lg shadow-slate-200"
             >
               Copiar Link de Login
             </button>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 gap-10">
        {(Object.entries(groupedBySector) as [string, EmployeeWithLabels[]][]).map(([sector, members]) => (
          <div key={sector} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
               <h3 className="font-black text-slate-800 uppercase tracking-tight text-lg flex items-center gap-3">
                  <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
                  {sector}
               </h3>
               <span className="text-xs font-bold text-slate-400 uppercase">{members.length} Profissionais</span>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="text-[10px] uppercase font-black bg-slate-50/50 text-slate-400 border-b">
                    <tr>
                      <th className="px-6 py-4">Profissional</th>
                      <th className="px-6 py-4">Vínculo / Carga</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-center">Frequência Hoje</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {members.map(emp => (
                      <tr key={emp.id} className="hover:bg-slate-50 transition group">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">{emp.nome}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">MATR: {emp.matricula}</p>
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
                        <td className="px-6 py-4 text-center">
                           <button 
                             onClick={() => handleAttendanceClick(emp)}
                             disabled={emp.status !== StatusFuncionario.ATIVO}
                             className={`px-4 py-2 rounded-xl w-32 flex items-center gap-2 justify-center transition-all mx-auto text-[10px] font-black uppercase tracking-wide border select-none active:scale-95 ${
                               emp.presencaConfirmada 
                               ? 'bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-200' 
                               : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 hover:border-slate-300'
                             } ${emp.status !== StatusFuncionario.ATIVO ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                           >
                             {emp.presencaConfirmada ? (
                                <>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                    Presente
                                </>
                             ) : (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                                    Ausente
                                </>
                             )}
                           </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex justify-end gap-2">
                                <button onClick={() => handleContact(emp.nome)} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition" title="Enviar Mensagem">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                                </button>
                                {isAdminView && (
                                    <button 
                                        onClick={() => onEditEmployee?.(emp)} 
                                        className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                                        title="Editar Funcionário"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
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
    </div>
  );
};

export default SchoolPortal;
