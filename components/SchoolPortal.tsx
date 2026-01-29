
import React, { useState, useRef, useMemo } from 'react';
import { Funcionario, Escola, StatusFuncionario, OcorrenciaFrequencia, RhContact, Perfil } from '../types.ts';

interface SchoolPortalProps {
  school: Escola;
  employees: (Funcionario & { roleLabel?: string, sectorLabel?: string })[];
  onToggleAttendance: (employeeId: string, status: OcorrenciaFrequencia, obs?: string, newStatusGeral?: StatusFuncionario, file?: File, dataInicio?: string, dataFim?: string) => void;
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
  const [tabAtiva, setTabAtiva] = useState<'diario' | 'lista' | 'relatorio'>('diario');
  const [obsFreq, setObsFreq] = useState('');
  const [dataInicioAt, setDataInicioAt] = useState(new Date().toISOString().split('T')[0]);
  const [dataFimAt, setDataFimAt] = useState(new Date().toISOString().split('T')[0]);
  const [sabadosLetivos, setSabadosLetivos] = useState<string[]>([]);
  const [mesRelatorio, setMesRelatorio] = useState(new Date().getMonth());
  const [anoRelatorio, setAnoRelatorio] = useState(new Date().getFullYear());
  
  const atestadoInputRef = useRef<HTMLInputElement>(null);
  const dataHojeISO = new Date().toISOString().split('T')[0];

  // Cálculo de dias do atestado
  const diasAtestado = useMemo(() => {
    const start = new Date(dataInicioAt);
    const end = new Date(dataFimAt);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24)) + 1;
  }, [dataInicioAt, dataFimAt]);

  const handleConfirmarAtestado = () => {
    if (!modalAtestado) return;
    
    // Regra: Gestor só registra até 5 dias
    if (!isAdminView && diasAtestado > 5) {
        alert("Atenção: Atestados superiores a 5 dias devem ser encaminhados ao RH para perícia médica oficial.");
        return;
    }

    onToggleAttendance(
        modalAtestado.id, 
        OcorrenciaFrequencia.ATESTADO, 
        obsFreq || `Atestado de ${diasAtestado} dias`, 
        StatusFuncionario.LICENCA_MEDICA, 
        atestadoFile || undefined,
        dataInicioAt,
        dataFimAt
    );
    setModalAtestado(null);
    setAtestadoFile(null);
    setObsFreq('');
  };

  const daysOfReport = useMemo(() => {
    const days = [];
    // O relatório vai do dia 25 do mês anterior ao dia 24 do mês atual
    const startDate = new Date(anoRelatorio, mesRelatorio - 1, 25);
    const endDate = new Date(anoRelatorio, mesRelatorio, 24);
    
    let current = new Date(startDate);
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [mesRelatorio, anoRelatorio]);

  const toggleSabadoLetivo = (dateStr: string) => {
    setSabadosLetivos(prev => 
        prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20">
      <style>{`
        @media print {
            body * { visibility: hidden; background: white !important; }
            .print-area, .print-area * { visibility: visible; }
            .print-area { position: absolute; left: 0; top: 0; width: 100%; }
            .no-print { display: none !important; }
        }
      `}</style>

      {/* Header Unidade */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden no-print">
        <div className="p-8 md:p-10 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 backdrop-blur-md rounded-[2rem] border-2 border-white/20 flex items-center justify-center overflow-hidden shadow-2xl">
               {school.logoUrl ? <img src={school.logoUrl} className="w-full h-full object-cover" /> : <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
            </div>
            <div className="text-center md:text-left flex-1">
                <h2 className="text-3xl font-black tracking-tight mb-2">{school.nome}</h2>
                <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest">INEP: {school.inep} • Unidade: {school.codigoGestor}</p>
                <p className="mt-4 text-slate-400 text-sm font-medium">{school.endereco}</p>
            </div>
        </div>
      </div>

      {/* Navegação Portal */}
      <div className="flex flex-wrap gap-4 p-1 bg-slate-200/50 rounded-2xl w-fit no-print">
        <button onClick={() => setTabAtiva('diario')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${tabAtiva === 'diario' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}>Diário de Hoje</button>
        <button onClick={() => setTabAtiva('lista')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${tabAtiva === 'lista' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}>Quadro de Servidores</button>
        <button onClick={() => setTabAtiva('relatorio')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${tabAtiva === 'relatorio' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}>Folha Mensal (25-25)</button>
      </div>

      {tabAtiva === 'diario' && (
        <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm no-print">
            <div className="p-8 bg-indigo-50/50 border-b flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-black text-indigo-900">Diário do Gestor</h3>
                    <p className="text-xs font-bold text-indigo-600 uppercase mt-1">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
                <div className="px-4 py-2 bg-white rounded-xl border border-indigo-100 text-[10px] font-black text-indigo-600 uppercase">
                    {employees.filter(e => e.dataUltimaFrequencia === dataHojeISO).length} / {employees.length} Servidores Registrados
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
      )}

      {tabAtiva === 'relatorio' && (
        <div className="space-y-6 no-print">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
                <div>
                    <h3 className="text-xl font-black text-slate-800">Folha Mensal de Frequência</h3>
                    <p className="text-xs font-bold text-indigo-600 uppercase">Período Administrativo: 25/{mesRelatorio === 0 ? 12 : mesRelatorio} a 24/{mesRelatorio + 1}</p>
                </div>
                <div className="flex items-center gap-3">
                    <select className="h-10 px-4 bg-slate-100 rounded-xl text-[10px] font-black uppercase outline-none" value={mesRelatorio} onChange={e => setMesRelatorio(Number(e.target.value))}>
                        {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                    <button onClick={handlePrint} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg shadow-slate-200">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                        Imprimir Folha
                    </button>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 overflow-x-auto shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Ajuste de Calendário (Clique nos sábados para torná-los letivos)</p>
                <div className="flex gap-2 flex-wrap">
                    {daysOfReport.map(day => {
                        const dateStr = day.toISOString().split('T')[0];
                        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                        const isSaturday = day.getDay() === 6;
                        if (!isSaturday) return null;
                        return (
                            <button key={dateStr} onClick={() => toggleSabadoLetivo(dateStr)} className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase border-2 transition ${sabadosLetivos.includes(dateStr) ? 'bg-amber-500 border-amber-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                                Sáb {day.getDate()}/{day.getMonth()+1}
                            </button>
                        );
                    })}
                </div>
            </div>
            
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden print-area">
                <div className="border-b-4 border-slate-900 pb-6 mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 uppercase">Folha de Frequência Mensal</h1>
                        <p className="text-sm font-bold text-slate-500 uppercase">Unidade: {school.nome} • INEP: {school.inep}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Referência</p>
                        <p className="text-xl font-black text-indigo-600 uppercase">{['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'][mesRelatorio]} / {anoRelatorio}</p>
                    </div>
                </div>

                <table className="w-full border-collapse text-[9px]">
                    <thead>
                        <tr>
                            <th className="border-2 border-slate-300 p-2 text-left bg-slate-50 w-48">Servidor / Matrícula</th>
                            {daysOfReport.map(day => (
                                <th key={day.toISOString()} className={`border-2 border-slate-300 p-1 text-center min-w-[20px] ${(day.getDay() === 0 || day.getDay() === 6) ? 'bg-slate-100' : ''}`}>
                                    {day.getDate()}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(emp => (
                            <tr key={emp.id}>
                                <td className="border-2 border-slate-300 p-2 font-bold leading-tight">
                                    {emp.nome} <br/>
                                    <span className="text-[8px] text-slate-400 font-black uppercase">{emp.matricula}</span>
                                </td>
                                {daysOfReport.map(day => {
                                    const dateStr = day.toISOString().split('T')[0];
                                    const isSunday = day.getDay() === 0;
                                    const isSaturday = day.getDay() === 6;
                                    const isLetivo = sabadosLetivos.includes(dateStr);
                                    
                                    let content = "";
                                    let cellStyle = "";

                                    if (isSunday || (isSaturday && !isLetivo)) {
                                        content = "FR";
                                        cellStyle = "bg-slate-50 text-slate-400 font-black";
                                    }

                                    return (
                                        <td key={dateStr} className={`border-2 border-slate-300 text-center ${cellStyle}`}>
                                            {content}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <div className="mt-20 grid grid-cols-2 gap-20">
                    <div className="border-t-2 border-slate-900 pt-4 text-center">
                        <p className="font-black uppercase text-xs">Assinatura do Gestor</p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase">Responsável pela Unidade {school.codigoGestor}</p>
                    </div>
                    <div className="border-t-2 border-slate-900 pt-4 text-center">
                        <p className="font-black uppercase text-xs">Carimbo da Unidade</p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase">EduAlloc RH Central</p>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Modal Atestado */}
      {modalAtestado && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 no-print">
              <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-modal">
                  <h3 className="text-xl font-black text-slate-900 mb-2">Lançar Atestado Médico</h3>
                  <p className="text-sm text-slate-500 mb-6">Servidor: <span className="text-slate-900 font-black">{modalAtestado.nome}</span></p>
                  
                  <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Início</label>
                            <input type="date" className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" value={dataInicioAt} onChange={e => setDataInicioAt(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Término</label>
                            <input type="date" className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" value={dataFimAt} onChange={e => setDataFimAt(e.target.value)} />
                        </div>
                      </div>

                      <div className={`p-4 rounded-xl text-center border-2 transition ${diasAtestado > 5 && !isAdminView ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-indigo-50 border-indigo-200 text-indigo-600'}`}>
                          <p className="text-xs font-black uppercase">Duração: {diasAtestado} dias</p>
                          {diasAtestado > 5 && !isAdminView && (
                              <p className="text-[9px] font-bold mt-1 opacity-80 uppercase leading-tight">Limite Gestor Excedido (Máx 5 dias). Envie ao RH.</p>
                          )}
                      </div>

                      <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center group hover:border-indigo-400 transition cursor-pointer" onClick={() => atestadoInputRef.current?.click()}>
                          <input type="file" ref={atestadoInputRef} className="hidden" accept="image/*,.pdf" onChange={e => setAtestadoFile(e.target.files?.[0] || null)} />
                          {atestadoFile ? <p className="text-indigo-600 font-black text-xs">{atestadoFile.name}</p> : <p className="text-slate-400 font-black text-[10px] uppercase">Anexar Documento Digital</p>}
                      </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                      <button onClick={() => {setModalAtestado(null); setAtestadoFile(null);}} className="flex-1 py-4 font-black text-[10px] text-slate-400 uppercase">Cancelar</button>
                      <button onClick={handleConfirmarAtestado} disabled={!atestadoFile || (diasAtestado > 5 && !isAdminView)} className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-indigo-100 disabled:opacity-50">Gravar Licença</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default SchoolPortal;
