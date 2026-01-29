
import React, { useState, useRef } from 'react';
import { Funcionario, Escola, StatusFuncionario, OcorrenciaFrequencia, RhContact } from '../types';

interface SchoolPortalProps {
  school: Escola;
  employees: (Funcionario & { roleLabel?: string, sectorLabel?: string })[];
  onToggleAttendance: (employeeId: string, status: OcorrenciaFrequencia, obs?: string, newStatusGeral?: StatusFuncionario, file?: File) => void;
  isAdminView?: boolean;
  onEditEmployee?: (emp: Funcionario) => void;
  onUpdateSchoolNotes?: (notes: string) => void;
  onUpdateLogo?: (file: File) => void;
  onUpdateRhContacts?: (contacts: RhContact[]) => void;
}

const SchoolPortal: React.FC<SchoolPortalProps> = ({ 
  school, employees, onToggleAttendance, isAdminView, onEditEmployee, 
  onUpdateSchoolNotes, onUpdateLogo, onUpdateRhContacts 
}) => {
  const [modalFalta, setModalFalta] = useState<Funcionario | null>(null);
  const [obsFalta, setObsFalta] = useState('');
  const [editNotes, setEditNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState(school.notasUnidade || '');
  const [isEditingContacts, setIsEditingContacts] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const employeesArray = Array.isArray(employees) ? employees : [];
  const presentes = employeesArray.filter(e => e.presencaConfirmada && e.status === StatusFuncionario.ATIVO).length;
  const ausentesHoje = employeesArray.filter(e => !e.presencaConfirmada && e.status === StatusFuncionario.ATIVO).length;

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onUpdateLogo?.(e.target.files[0]);
    }
  };

  const handleRhContactChange = (idx: number, field: keyof RhContact, value: string) => {
    const newContacts = [...(school.contatosRh || [])];
    if (newContacts[idx]) {
        (newContacts[idx] as any)[field] = value;
        onUpdateRhContacts?.(newContacts);
    }
  };

  const addRhContact = () => {
    const newContacts = [...(school.contatosRh || []), { label: 'Novo Contato', value: '', type: 'phone' as const }];
    onUpdateRhContacts?.(newContacts);
  };

  const removeRhContact = (idx: number) => {
    const newContacts = (school.contatosRh || []).filter((_, i) => i !== idx);
    onUpdateRhContacts?.(newContacts);
  };

  const groupedBySector = employeesArray.reduce((acc, emp) => {
    const sectorName = emp.sectorLabel || 'Diversos';
    if (!acc[sectorName]) acc[sectorName] = [];
    acc[sectorName].push(emp);
    return acc;
  }, {} as Record<string, typeof employees>);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header com Logo e Identidade */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 md:p-10 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white flex flex-col md:flex-row items-center gap-8">
          
          <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 backdrop-blur-md rounded-[2rem] border-2 border-white/20 flex items-center justify-center overflow-hidden shadow-2xl transition group-hover:scale-105">
               {school.logoUrl ? (
                 <img src={school.logoUrl} className="w-full h-full object-cover" alt="Logo" />
               ) : (
                 <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
               )}
            </div>
            <div className="absolute inset-0 bg-indigo-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition rounded-[2rem]">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} />
          </div>

          <div className="text-center md:text-left flex-1">
            <h2 className="text-3xl font-black tracking-tight leading-none mb-2">{school.nome}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-bold text-slate-400">
               <span className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 uppercase tracking-widest text-[10px]">INEP: {school.inep}</span>
               <span className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 uppercase tracking-widest text-[10px]">Gestor: {school.codigoGestor}</span>
            </div>
            <p className="mt-4 text-slate-400 text-sm font-medium flex items-center justify-center md:justify-start gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              {school.endereco}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-slate-100 divide-x divide-slate-100">
          <div className="p-6 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Efetivo</p>
            <p className="text-2xl font-black text-slate-900">{employeesArray.length}</p>
          </div>
          <div className="p-6 text-center">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Presentes</p>
            <p className="text-2xl font-black text-emerald-600">{presentes}</p>
          </div>
          <div className="p-6 text-center">
            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Ausentes</p>
            <p className="text-2xl font-black text-rose-600">{ausentesHoje}</p>
          </div>
          <div className="p-6 text-center">
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Turnos</p>
            <div className="flex gap-1 justify-center mt-1">
               {(school.turnosFuncionamento || []).map(t => <span key={t} className="w-2 h-2 rounded-full bg-indigo-500" title={t}></span>)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          {Object.entries(groupedBySector).map(([sector, members]) => (
            <div key={sector} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm animate-in slide-in-from-bottom-4">
              <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
                <h3 className="font-black text-slate-800 uppercase tracking-tighter text-sm flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                  {sector}
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {(members as any[]).map(emp => (
                  <div key={emp.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50/80 transition-all">
                    <div className="flex gap-5 items-center min-w-0">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {emp.fotoUrl ? <img src={emp.fotoUrl} className="w-full h-full object-cover" /> : <svg className="text-indigo-200" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-900 truncate leading-tight">{emp.nome}</p>
                        <p className="text-[10px] font-black text-indigo-500 uppercase mt-1 tracking-widest">{emp.roleLabel || 'Servidor'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <button 
                        onClick={() => emp.presencaConfirmada ? setModalFalta(emp) : onToggleAttendance(emp.id, OcorrenciaFrequencia.PRESENCA)}
                        disabled={emp.status !== StatusFuncionario.ATIVO}
                        className={`h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 flex-1 md:flex-none ${emp.presencaConfirmada ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
                      >
                        {emp.presencaConfirmada ? 'Confirmado' : 'Falta'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm sticky top-8">
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
                Mural de Avisos RH
            </h3>
            
            <textarea 
              readOnly={!editNotes}
              className={`w-full h-40 p-5 rounded-2xl text-sm font-medium outline-none transition-all resize-none ${editNotes ? 'bg-slate-50 border-2 border-indigo-500 shadow-inner' : 'bg-indigo-50/50 border-transparent border-2 text-indigo-900 cursor-default'}`}
              placeholder="Digite um aviso para o RH..."
              value={tempNotes}
              onChange={e => setTempNotes(e.target.value)}
            />
            <button 
                onClick={() => { if(editNotes) onUpdateSchoolNotes?.(tempNotes); setEditNotes(!editNotes); }}
                className="w-full mt-3 py-3 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase hover:bg-slate-200 transition"
            >
                {editNotes ? 'Salvar Aviso' : 'Editar Aviso'}
            </button>
            
            <div className="mt-8 pt-8 border-t border-slate-100">
               <div className="flex justify-between items-center mb-6">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contatos Rápidos RH</h4>
                   <button onClick={() => setIsEditingContacts(!isEditingContacts)} className="text-[10px] font-bold text-indigo-600">{isEditingContacts ? 'Finalizar' : 'Editar'}</button>
               </div>
               
               <div className="space-y-4">
                  {(school.contatosRh || []).map((c, idx) => (
                      <div key={idx} className="group relative p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.type === 'email' ? 'bg-sky-100 text-sky-600' : 'bg-emerald-100 text-emerald-600'}`}>
                           {c.type === 'email' ? (
                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                           ) : (
                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                           )}
                        </div>
                        <div className="flex-1 min-w-0">
                           {isEditingContacts ? (
                               <input 
                                 className="w-full text-xs font-black bg-white border border-slate-200 rounded px-2 py-1"
                                 value={c.label}
                                 onChange={e => handleRhContactChange(idx, 'label', e.target.value)}
                               />
                           ) : (
                               <p className="text-[10px] font-black text-slate-800 uppercase truncate">{c.label}</p>
                           )}
                           {isEditingContacts ? (
                               <input 
                                 className="w-full text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded px-2 py-1 mt-1"
                                 value={c.value}
                                 onChange={e => handleRhContactChange(idx, 'value', e.target.value)}
                               />
                           ) : (
                               <p className="text-xs font-bold text-slate-500 truncate">{c.value}</p>
                           )}
                        </div>
                        {isEditingContacts && (
                            <button onClick={() => removeRhContact(idx)} className="text-rose-400 hover:text-rose-600"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button>
                        )}
                      </div>
                  ))}
                  {isEditingContacts && (
                      <button onClick={addRhContact} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 uppercase hover:border-indigo-400 hover:text-indigo-500 transition">+ Adicionar Contato</button>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>

      {modalFalta && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-modal">
            <h3 className="text-xl font-black text-slate-900 mb-6">Informar Ausência</h3>
            <textarea 
              className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-rose-500 transition-all font-medium text-sm mb-6"
              placeholder="Justificativa (opcional)..."
              value={obsFalta}
              onChange={e => setObsFalta(e.target.value)}
            />
            <div className="flex gap-4">
              <button onClick={() => setModalFalta(null)} className="flex-1 py-4 font-black text-[10px] text-slate-500 uppercase">Voltar</button>
              <button onClick={() => { onToggleAttendance(modalFalta.id, OcorrenciaFrequencia.FALTA_INJUSTIFICADA, obsFalta); setModalFalta(null); }} className="flex-1 py-4 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-rose-200">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolPortal;
