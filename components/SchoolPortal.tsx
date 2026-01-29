
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
  
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [modalOcorrencia, setModalOcorrencia] = useState<{ emp: Funcionario, type: 'FALTA' | 'OBS' | 'LICENCA' } | null>(null);
  const [obsText, setObsText] = useState('');
  const [modalAtestado, setModalAtestado] = useState<Funcionario | null>(null);
  const [diasAtestado, setDiasAtestado] = useState<number>(1);
  const [fotoAtestado, setFotoAtestado] = useState<File | null>(null);
  
  type EmployeeWithLabels = Funcionario & { roleLabel?: string; sectorLabel?: string };
  const groupedBySector = schoolEmployees.reduce((acc, emp) => {
    const sectorName = emp.sectorLabel || 'Diversos';
    if (!acc[sectorName]) acc[sectorName] = [];
    acc[sectorName].push(emp);
    return acc;
  }, {} as Record<string, EmployeeWithLabels[]>);

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

  const handleManagerToggle = (emp: Funcionario) => {
    const novoStatus = emp.presencaConfirmada ? OcorrenciaFrequencia.FALTA_INJUSTIFICADA : OcorrenciaFrequencia.PRESENCA;
    onToggleAttendance(emp.id, novoStatus);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 md:gap-8">
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-800 tracking-tighter">{school.nome}</h2>
                 <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">INEP: {school.inep}</span>
              </div>
              <p className="text-slate-400 font-bold uppercase text-xs flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                {school.endereco}
              </p>
           </div>
           <div className="flex gap-2">
              {school.turnosFuncionamento.map(t => (
                 <span key={t} className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase border border-emerald-100">{t}</span>
              ))}
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 md:gap-10">
        {(Object.entries(groupedBySector) as [string, EmployeeWithLabels[]][]).map(([sector, members]) => (
          <div key={sector} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
               <h3 className="font-black text-slate-800 uppercase tracking-tight text-base flex items-center gap-3">
                  <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
                  {sector}
               </h3>
               <span className="text-[10px] font-bold text-slate-400 uppercase">{members.length} Profissionais</span>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
               <table className="w-full text-left whitespace-nowrap">
                  <thead className="text-[10px] uppercase font-black bg-slate-50/50 text-slate-400 border-b">
                    <tr>
                      <th className="px-6 py-4">Profissional</th>
                      <th className="px-6 py-4">Vínculo / Carga</th>
                      <th className="px-6 py-4 text-center">Status Lotação</th>
                      <th className="px-6 py-4 text-center">Controle</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {members.map(emp => (
                      <tr key={emp.id} className="hover:bg-slate-50 transition group">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">{emp.nome}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">MATR: {emp.matricula}</p>
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-[10px] font-black text-indigo-700 uppercase block mb-0.5">{emp.roleLabel}</span>
                           <div className="flex gap-1 flex-wrap">
                              {emp.turnos.map(t => <span key={t} className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1 rounded">{t}</span>)}
                              <span className="text-[9px] font-black text-indigo-400 ml-1">({emp.cargaHoraria}h)</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${emp.status === StatusFuncionario.ATIVO ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                             {emp.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <div className="flex items-center justify-center gap-2">
                               <button 
                                 onClick={() => handleManagerToggle(emp)}
                                 disabled={emp.status !== StatusFuncionario.ATIVO}
                                 className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wide border transition-all ${emp.presencaConfirmada ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white border-slate-200 text-slate-400'}`}
                               >
                                 {emp.presencaConfirmada ? 'Presente' : 'Ausente'}
                               </button>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex justify-end gap-2">
                                <button onClick={() => handleWhatsApp(emp)} className="p-2 bg-white border border-slate-200 text-emerald-600 rounded-lg hover:bg-emerald-50 transition">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                </button>
                                {isAdminView && (
                                    <button onClick={() => onEditEmployee?.(emp)} className="p-2 bg-white border border-slate-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
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
