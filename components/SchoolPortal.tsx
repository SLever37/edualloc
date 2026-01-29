
import React, { useState, useRef } from 'react';
import { Funcionario, Escola, StatusFuncionario, OcorrenciaFrequencia, RhContact } from '../types.ts';

interface SchoolPortalProps {
  school: Escola;
  employees: (Funcionario & { roleLabel?: string, sectorLabel?: string })[];
  onToggleAttendance: (employeeId: string, status: OcorrenciaFrequencia, obs?: string, newStatusGeral?: StatusFuncionario, file?: File) => void;
  isAdminView?: boolean;
  onEditEmployee?: (emp: Funcionario) => void;
  onUpdateSchoolNotes?: (notes: string) => void;
  onUpdateLogo?: (file: File) => void;
  rhContacts?: RhContact[]; 
}

const SchoolPortal: React.FC<SchoolPortalProps> = ({ 
  school, employees, onToggleAttendance, isAdminView, onEditEmployee, 
  onUpdateSchoolNotes, onUpdateLogo, rhContacts = []
}) => {
  const [modalAtestado, setModalAtestado] = useState<Funcionario | null>(null);
  const [atestadoFile, setAtestadoFile] = useState<File | null>(null);
  const [tabAtiva, setTabAtiva] = useState<'lista' | 'diario'>('diario');
  const [obsFreq, setObsFreq] = useState('');
  
  const atestadoInputRef = useRef<HTMLInputElement>(null);
  const dataHojeISO = new Date().toISOString().split('T')[0];

  const handleConfirmarAtestado = () => {
    if (!modalAtestado) return;
    onToggleAttendance(modalAtestado.id, OcorrenciaFrequencia.ATESTADO, obsFreq || "Atestado anexado pelo gestor", StatusFuncionario.LICENCA_MEDICA, atestadoFile || undefined);
    setModalAtestado(null);
    setAtestadoFile(null);
    setObsFreq('');
  };

  const groupedBySector = employees.reduce((acc, emp) => {
    const sectorName = emp.sectorLabel || 'Diversos';
    if (!acc[sectorName]) acc[sectorName] = [];
    acc[sectorName].push(emp);
    return acc;
  }, {} as Record<string, typeof employees>);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Unidade */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 md:p-10 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 backdrop-blur-md rounded-[2rem] border-2 border-white/20 flex items-center justify-center overflow-hidden shadow-2xl">
               {school.logoUrl ? <img src={school.logoUrl} className="w-full h-full object-cover" /> : <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
            </div>
            <div className="text-center md:text-left flex-1">
                <h2 className="text-3xl font-black tracking-tight mb-2">{school.nome}</h2>
                <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest">INEP: {school.inep} • Gestor: {school.codigoGestor}</p>
                <p className="mt-4 text-slate-400 text-sm font-medium">{school.endereco}</p>
            </div>
        </div>
      </div>

      {/* Navegação Portal */}
      <div className="flex gap-4 p-1 bg-slate-200/50 rounded-2xl w-fit">
        <button onClick={() => setTabAtiva('diario')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${tabAtiva === 'diario' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}>Diário de Hoje</button>
        <button onClick={() => setTabAtiva('lista')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${tabAtiva === 'lista' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}>Quadro Geral</button>
      </div>

      {tabAtiva === 'diario' ? (
        <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-8 bg-indigo-50/50 border-b flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-black text-indigo-900">Diário de Frequência</h3>
                    <p className="text-xs font-bold text-indigo-600 uppercase mt-1">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
                <div className="px-4 py-2 bg-white rounded-xl border border-indigo-100 text-[10px] font-black text-indigo-600 uppercase">
                    Status: {employees.filter(e => e.dataUltimaFrequencia === dataHojeISO).length} / {employees.length} Registrados
                </div>
            </div>
            <div className="divide-y divide-slate-100">
                {employees.map(emp => {
                    const registradoHoje = emp.dataUltimaFrequencia === dataHojeISO;
                    return (
                        <div key={emp.id} className="p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:bg-slate-50 transition group">
                            <div className="flex items-center gap-4 flex-1">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 ${registradoHoje ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-300'}`}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                </div>
                                <div>
                                    <p className="font-black text-slate-800 text-sm">{emp.nome}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{emp.roleLabel} • {emp.tipoLotacao}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {!registradoHoje ? (
                                    <>
                                        <button onClick={() => onToggleAttendance(emp.id, OcorrenciaFrequencia.PRESENCA)} className="px-6 py-3 bg-white border-2 border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:border-emerald-500 hover:text-emerald-600 transition">Presente</button>
                                        <button onClick={() => setModalAtestado(emp)} className="px-6 py-3 bg-white border-2 border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:border-rose-500 hover:text-rose-600 transition">Atestado</button>
                                        <button onClick={() => onToggleAttendance(emp.id, OcorrenciaFrequencia.FALTA_INJUSTIFICADA)} className="px-6 py-3 bg-white border-2 border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:border-slate-800 hover:text-slate-800 transition">Falta</button>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-emerald-200">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                        Registrado
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Object.entries(groupedBySector).map(([sector, members]) => (
                <div key={sector} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                        {sector}
                    </h3>
                    <div className="space-y-4">
                        {members.map(emp => (
                            <div key={emp.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                                <div className="min-w-0">
                                    <p className="font-black text-slate-800 text-xs truncate">{emp.nome}</p>
                                    <p className="text-[9px] font-bold text-indigo-500 uppercase">{emp.roleLabel}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${emp.status === StatusFuncionario.ATIVO ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>{emp.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* Modal Atestado */}
      {modalAtestado && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
              <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-modal">
                  <h3 className="text-xl font-black text-slate-900 mb-2">Lançar Atestado Médico</h3>
                  <p className="text-sm text-slate-500 mb-6">Servidor: <span className="text-slate-900 font-black">{modalAtestado.nome}</span></p>
                  
                  <div className="space-y-4">
                      <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center group hover:border-indigo-400 transition cursor-pointer" onClick={() => atestadoInputRef.current?.click()}>
                          <input type="file" ref={atestadoInputRef} className="hidden" accept="image/*,.pdf" onChange={e => setAtestadoFile(e.target.files?.[0] || null)} />
                          {atestadoFile ? <p className="text-indigo-600 font-black text-xs">{atestadoFile.name}</p> : <p className="text-slate-400 font-black text-[10px] uppercase">Anexar Arquivo ou Foto</p>}
                      </div>
                      <textarea className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-indigo-500" placeholder="Observações (opcional)..." value={obsFreq} onChange={e => setObsFreq(e.target.value)} />
                  </div>

                  <div className="flex gap-4 mt-8">
                      <button onClick={() => {setModalAtestado(null); setAtestadoFile(null);}} className="flex-1 py-4 font-black text-[10px] text-slate-400 uppercase">Cancelar</button>
                      <button onClick={handleConfirmarAtestado} disabled={!atestadoFile} className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-indigo-100 disabled:opacity-50">Gravar Atestado</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default SchoolPortal;
