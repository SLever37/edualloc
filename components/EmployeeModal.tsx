
import React from 'react';
import { Funcionario, StatusFuncionario, Escola, Funcao, Setor, TipoLotacao, Turno, NivelFormacao } from '../types.ts';
import { useEmployeeForm } from '../features/employees/useEmployeeForm.ts';

interface EmployeeModalProps {
  employee?: Partial<Funcionario>;
  schools: Escola[];
  roles: Funcao[];
  sectors: Setor[];
  onSave: (data: Partial<Funcionario>, foto?: File) => void;
  onClose: () => void;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({ employee, schools, roles, sectors, onSave, onClose }) => {
  const {
    activeTab, setActiveTab,
    formData, setFormData,
    previewUrl, isUploadingDoc,
    historico, loadingHist, isSaving,
    fileInputRef, docInputRef,
    tempoServico,
    toggleTurno, handleFileUpload, handleDocUpload,
    addFormacao, updateFormacao, removeFormacao,
    removeDoc, handleSubmit
  } = useEmployeeForm(employee, schools, roles, sectors, onSave);

  const inputClass = "w-full h-12 px-4 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-slate-800 font-bold outline-none transition-all";
  const labelClass = "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1";

  const renderTabContent = () => {
      switch (activeTab) {
          case 'dados':
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="md:col-span-2"><label className={labelClass}>Nome Completo</label><input required type="text" className={inputClass} value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} /></div>
                    <div><label className={labelClass}>CPF</label><input required type="text" className={inputClass} value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: e.target.value })} /></div>
                    <div><label className={labelClass}>Matrícula</label><input required type="text" className={inputClass} value={formData.matricula} onChange={e => setFormData({ ...formData, matricula: e.target.value })} /></div>
                    <div><label className={labelClass}>Função</label><select className={inputClass} value={formData.funcaoId} onChange={e => setFormData({ ...formData, funcaoId: e.target.value })}>{roles.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}</select></div>
                    <div><label className={labelClass}>Telefone / WhatsApp</label><input type="text" className={inputClass} value={formData.telefone || ''} onChange={e => setFormData({ ...formData, telefone: e.target.value })} /></div>
                </div>
            );
          case 'academico':
            return (
                <div className="space-y-6 animate-in fade-in">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Qualificações e Formação</h3>
                        <button type="button" onClick={addFormacao} className="text-[10px] font-black text-indigo-600 uppercase">+ Adicionar Formação</button>
                    </div>
                    {formData.formacoes?.map((f, i) => (
                        <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row gap-4 relative group">
                            <div className="flex-1">
                                <label className={labelClass}>Nível</label>
                                <select className={inputClass} value={f.nivel} onChange={e => updateFormacao(i, 'nivel', e.target.value as any)}>
                                    {Object.values(NivelFormacao).map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                            <div className="flex-[2]">
                                <label className={labelClass}>Curso / Especialização</label>
                                <input type="text" className={inputClass} value={f.curso} onChange={e => updateFormacao(i, 'curso', e.target.value)} placeholder="Ex: Pedagogia, Letras..." />
                            </div>
                            <button type="button" onClick={() => removeFormacao(i)} className="p-2 text-rose-400 md:self-end hover:bg-rose-50 rounded-lg"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                        </div>
                    ))}
                    {(!formData.formacoes || formData.formacoes.length === 0) && <p className="text-center text-slate-400 text-xs py-8 border-2 border-dashed border-slate-100 rounded-2xl">Nenhuma formação registrada.</p>}
                </div>
            );
          case 'lotacao':
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                    <div className="md:col-span-2">
                        <label className={labelClass}>Unidade Escolar de Lotação</label>
                        <select className={inputClass} value={formData.escolaId} onChange={e => setFormData({ ...formData, escolaId: e.target.value })}>
                            {schools.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Tipo de Lotação</label>
                        <select className={inputClass} value={formData.tipoLotacao} onChange={e => setFormData({ ...formData, tipoLotacao: e.target.value as any })}>
                            {Object.values(TipoLotacao).map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Status Geral</label>
                        <select className={inputClass} value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })}>
                            {Object.values(StatusFuncionario).map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Data de Ingresso na Rede</label>
                        <input type="date" className={inputClass} value={formData.dataIngresso} onChange={e => setFormData({ ...formData, dataIngresso: e.target.value })} />
                        {tempoServico && <p className="text-[10px] text-indigo-600 font-bold mt-2 uppercase">Tempo: {tempoServico}</p>}
                    </div>
                    <div>
                        <label className={labelClass}>Carga Horária Semanal (h)</label>
                        <input type="number" className={inputClass} value={formData.cargaHoraria} onChange={e => setFormData({ ...formData, cargaHoraria: Number(e.target.value) })} />
                    </div>
                    <div className="md:col-span-2">
                        <label className={labelClass}>Turnos de Atuação</label>
                        <div className="grid grid-cols-3 gap-3">
                            {Object.values(Turno).map(t => (
                                <button key={t} type="button" onClick={() => toggleTurno(t)} className={`p-3 rounded-xl border-2 font-black text-[10px] uppercase transition ${formData.turnos?.includes(t) ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white text-slate-400'}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-3 md:col-span-2 bg-amber-50 p-4 rounded-2xl border border-amber-100">
                        <input type="checkbox" className="w-5 h-5 accent-amber-600" checked={formData.possuiDobra} onChange={e => setFormData({ ...formData, possuiDobra: e.target.checked })} />
                        <label className="text-xs font-black text-amber-900 uppercase">Possui Dobra / Carga Extra de Horário</label>
                    </div>
                </div>
            );
          case 'midia':
            return (
                <div className="space-y-8 animate-in fade-in">
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start border-b pb-8">
                        <div className="relative group shrink-0">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-slate-100 border-4 border-slate-50 overflow-hidden shadow-inner flex items-center justify-center">
                                {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <svg className="text-slate-300" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                            </div>
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-3 rounded-2xl shadow-lg hover:bg-indigo-700 transition">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-lg font-black text-slate-800">Identificação Visual</h3>
                            <p className="text-sm text-slate-500 font-medium">Foto oficial para identificação no quadro de lotação e portal da unidade escolar.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Pasta de Documentos</h3>
                            <button type="button" onClick={() => docInputRef.current?.click()} className="text-[10px] font-black text-indigo-600 uppercase border-b-2 border-indigo-600 pb-0.5">+ Anexar Documento</button>
                            <input type="file" ref={docInputRef} className="hidden" onChange={handleDocUpload} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {formData.documentos?.map((doc) => (
                                <div key={doc.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group">
                                    <div className="flex items-center gap-3 truncate">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
                                        <div className="truncate"><p className="text-xs font-bold text-slate-700 truncate">{doc.nome}</p><p className="text-[9px] text-slate-400 uppercase font-black">Arquivo Digital</p></div>
                                    </div>
                                    <div className="flex gap-1">
                                        <a href={doc.url} target="_blank" className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>
                                        <button type="button" onClick={() => removeDoc(doc.id)} className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                                    </div>
                                </div>
                            ))}
                            {isUploadingDoc && <div className="p-4 bg-indigo-50 rounded-2xl border-2 border-dashed border-indigo-200 animate-pulse text-indigo-400 text-[10px] font-black uppercase text-center">Processando...</div>}
                        </div>
                    </div>
                </div>
            );
          case 'historico':
            return (
                <div className="space-y-4 animate-in fade-in">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Registro de Movimentações</h3>
                    {loadingHist ? <div className="py-10 text-center animate-pulse text-slate-400 text-xs font-bold uppercase">Buscando histórico...</div> : (
                        <div className="space-y-3">
                            {historico.map((h, i) => (
                                <div key={i} className="p-4 bg-slate-50 rounded-2xl border-l-4 border-indigo-500">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-black text-indigo-600 bg-white px-2 py-0.5 rounded border border-indigo-100">{new Date(h.dataMovimentacao).toLocaleDateString()}</span>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase">Ref: {h.id.split('-')[0]}</span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-700 leading-snug">
                                        Movimentado de <span className="text-indigo-600">{h.escolaAnteriorNome || 'Entrada na Rede'}</span> para <span className="text-indigo-600">{h.escolaNovaNome}</span>.
                                    </p>
                                    {h.motivo && <p className="mt-2 text-[10px] italic text-slate-500">Motivo: {h.motivo}</p>}
                                </div>
                            ))}
                            {historico.length === 0 && <p className="text-center py-10 text-slate-400 text-xs italic">Nenhuma movimentação anterior registrada.</p>}
                        </div>
                    )}
                </div>
            );
          default: return null;
      }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center p-0 md:p-4 z-[100] backdrop-blur-md">
      <div className="bg-white md:rounded-[2.5rem] w-full max-w-3xl flex flex-col h-full md:h-auto md:max-h-[92vh] shadow-2xl animate-modal overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="p-6 md:p-8 bg-indigo-600 text-white shrink-0">
             <div className="flex justify-between items-start">
                <h2 className="text-xl md:text-2xl font-black tracking-tighter">{employee?.id ? 'Ficha do Servidor' : 'Nova Lotação'}</h2>
                <button type="button" onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
             </div>
             <div className="flex gap-4 md:gap-8 mt-6 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: 'dados', label: 'Dados' },
                  { id: 'academico', label: 'Formação' },
                  { id: 'lotacao', label: 'Lotação' },
                  { id: 'midia', label: 'Documentos' },
                  { id: 'historico', label: 'Histórico' }
                ].map((tab) => (
                  <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id as any)} className={`text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition whitespace-nowrap ${activeTab === tab.id ? 'border-white text-white' : 'border-transparent text-indigo-300'}`}>
                    {tab.label}
                  </button>
                ))}
             </div>
          </div>
          
          <div className="p-6 md:p-10 space-y-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
              {renderTabContent()}
          </div>

          <div className="p-6 md:p-8 bg-slate-50 border-t flex justify-end gap-4 shrink-0 safe-area-bottom">
            <button type="button" onClick={onClose} className="px-6 py-3 text-slate-500 font-black uppercase text-[10px]">Cancelar</button>
            <button type="submit" disabled={isSaving} className="px-10 py-3 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition disabled:opacity-50 text-[10px] uppercase">
                {isSaving ? 'Gravando...' : 'Confirmar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;
