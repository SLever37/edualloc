
import React, { useState } from 'react';
import { Funcionario, Escola, StatusFuncionario, OcorrenciaFrequencia, Turno } from '../types';

interface SchoolPortalProps {
  school: Escola;
  employees: (Funcionario & { roleLabel?: string, sectorLabel?: string })[];
  onToggleAttendance: (employeeId: string, status: OcorrenciaFrequencia, obs?: string, newStatusGeral?: StatusFuncionario, file?: File) => void;
  isAdminView?: boolean;
  onEditEmployee?: (emp: Funcionario) => void;
  onUpdateSchoolNotes?: (notes: string) => void;
}

const SchoolPortal: React.FC<SchoolPortalProps> = ({ school, employees, onToggleAttendance, isAdminView, onEditEmployee, onUpdateSchoolNotes }) => {
  const [modalFalta, setModalFalta] = useState<Funcionario | null>(null);
  const [obsFalta, setObsFalta] = useState('');
  const [editNotes, setEditNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState(school.notasUnidade || '');

  // Estatísticas da Unidade
  // Fix: explicitly ensuring employees is an array to handle potential inference issues
  const employeesArray = Array.isArray(employees) ? employees : [];
  const totalEfetivo = employeesArray.length;
  const presentes = employeesArray.filter(e => e.presencaConfirmada && e.status === StatusFuncionario.ATIVO).length;
  const afastados = employeesArray.filter(e => e.status !== StatusFuncionario.ATIVO).length;
  const ausentesHoje = employeesArray.filter(e => !e.presencaConfirmada && e.status === StatusFuncionario.ATIVO).length;

  const handleToggle = (emp: Funcionario) => {
    if (emp.presencaConfirmada) {
      setModalFalta(emp);
      setObsFalta('');
    } else {
      onToggleAttendance(emp.id, OcorrenciaFrequencia.PRESENCA);
    }
  };

  const confirmarFalta = () => {
    if (modalFalta) {
      onToggleAttendance(modalFalta.id, OcorrenciaFrequencia.FALTA_INJUSTIFICADA, obsFalta);
      setModalFalta(null);
    }
  };

  const saveNotes = () => {
    onUpdateSchoolNotes?.(tempNotes);
    setEditNotes(false);
  };

  const groupedBySector = employeesArray.reduce((acc, emp) => {
    const sectorName = emp.sectorLabel || 'Diversos';
    if (!acc[sectorName]) acc[sectorName] = [];
    acc[sectorName].push(emp);
    return acc;
  }, {} as Record<string, typeof employees>);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Informativo */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 md:p-8 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">{school.nome}</h2>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Código INEP: {school.inep}</p>
              </div>
            </div>
            <p className="text-slate-400 text-xs font-bold flex items-center gap-2 mt-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              {school.endereco}
            </p>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {/* Fix: added defensive check for turnosFuncionamento array */}
            {(school.turnosFuncionamento || []).map(t => (
              <span key={t} className="px-3 py-1.5 bg-white/10 text-white border border-white/20 rounded-xl text-[10px] font-black uppercase whitespace-nowrap">{t}</span>
            ))}
          </div>
        </div>

        {/* Dashboard de Saúde da Unidade */}
        <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-slate-100">
          <div className="p-6 border-r border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Efetivo Total</p>
            <p className="text-2xl font-black text-slate-900">{totalEfetivo}</p>
          </div>
          <div className="p-6 border-r border-slate-100">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Presentes Hoje</p>
            <p className="text-2xl font-black text-emerald-600">{presentes}</p>
          </div>
          <div className="p-6 border-r border-slate-100">
            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Ausências/Faltas</p>
            <p className="text-2xl font-black text-rose-600">{ausentesHoje}</p>
          </div>
          <div className="p-6">
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Licenças/Afast.</p>
            <p className="text-2xl font-black text-amber-600">{afastados}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Lista de Profissionais (2/3) */}
        <div className="xl:col-span-2 space-y-6">
          {Object.entries(groupedBySector).map(([sector, members]) => (
            <div key={sector} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-5 bg-slate-50 border-b flex justify-between items-center">
                <h3 className="font-black text-slate-800 uppercase tracking-tight text-xs flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
                  {sector}
                </h3>
                {/* Fix: added length access on confirmed array type */}
                <span className="text-[10px] font-bold text-slate-400 uppercase bg-white px-2 py-1 rounded-lg border">{(members as any[] || []).length} Profissionais</span>
              </div>
              <div className="divide-y divide-slate-100">
                {/* Fix: added map access on confirmed array type */}
                {(members as any[] || []).map(emp => (
                  <div key={emp.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50 transition-colors">
                    <div className="flex gap-4 items-center min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200">
                        {emp.fotoUrl ? <img src={emp.fotoUrl} className="w-full h-full object-cover" /> : <svg className="text-slate-300" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate leading-tight">{emp.nome}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{emp.roleLabel}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{emp.cargaHoraria}H - {(emp.turnos || []).join('/')}</span>
                        </div>
                        {emp.observacaoFrequencia && (
                          <div className="mt-2 text-[10px] bg-amber-50 text-amber-700 px-2 py-1 rounded-lg border border-amber-100 inline-flex items-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                            Nota: {emp.observacaoFrequencia}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <div className="flex flex-col items-end mr-2">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${emp.status === StatusFuncionario.ATIVO ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                          {emp.status}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleToggle(emp)}
                        disabled={emp.status !== StatusFuncionario.ATIVO}
                        className={`h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 flex-1 md:flex-none ${emp.presencaConfirmada ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'} disabled:opacity-30`}
                      >
                        {emp.presencaConfirmada ? 'Presente' : 'Informar Falta'}
                      </button>
                      <button onClick={() => onEditEmployee?.(emp)} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Mural de Comunicação com RH (1/3) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm sticky top-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Mural do Gestor (Recados ao RH)
              </h3>
              {!editNotes ? (
                <button onClick={() => setEditNotes(true)} className="text-[10px] font-black text-indigo-600 uppercase hover:underline">Editar</button>
              ) : (
                <button onClick={saveNotes} className="text-[10px] font-black text-emerald-600 uppercase hover:underline">Salvar</button>
              )}
            </div>
            
            {editNotes ? (
              <textarea 
                className="w-full h-40 p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-indigo-500 transition-all resize-none"
                placeholder="Ex: Ar condicionado da sala 02 quebrado. Necessitamos de substituição para a Prof. Maria..."
                value={tempNotes}
                onChange={e => setTempNotes(e.target.value)}
              />
            ) : (
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 min-h-[100px]">
                {school.notasUnidade ? (
                  <p className="text-sm text-indigo-900 font-medium leading-relaxed whitespace-pre-wrap">{school.notasUnidade}</p>
                ) : (
                  <p className="text-xs text-indigo-400 italic font-medium">Nenhum aviso para o RH no momento. Utilize este espaço para reportar demandas urgentes da unidade.</p>
                )}
              </div>
            )}
            
            <div className="mt-6 pt-6 border-t border-slate-100">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Contatos Rápidos do RH</h4>
               <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-800 uppercase">Setor de Lotação</p>
                      <p className="text-xs font-bold text-slate-500">(21) 99999-0000</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-800 uppercase">Suporte Técnico</p>
                      <p className="text-xs font-bold text-slate-500">ajuda@edualloc.app</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Justificativa de Falta */}
      {modalFalta && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-modal">
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Informar Ausência</h3>
            <p className="text-slate-500 text-sm font-medium mb-6">Deseja registrar que <span className="text-indigo-600 font-bold">{modalFalta.nome}</span> não está presente hoje?</p>
            
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Observação / Justificativa (Opcional)</label>
            <textarea 
              className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-rose-500 transition-all font-medium text-sm mb-6"
              placeholder="Ex: Informou que passaria em consulta médica antes do turno..."
              value={obsFalta}
              onChange={e => setObsFalta(e.target.value)}
            />

            <div className="flex gap-3">
              <button onClick={() => setModalFalta(null)} className="flex-1 py-3 font-black uppercase text-[10px] text-slate-500 hover:bg-slate-100 rounded-xl transition">Cancelar</button>
              <button onClick={confirmarFalta} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-black uppercase text-[10px] shadow-lg shadow-rose-200 hover:bg-rose-700 transition">Confirmar Falta</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolPortal;
