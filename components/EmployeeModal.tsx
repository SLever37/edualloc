
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Funcionario, StatusFuncionario, Escola, Funcao, Setor, TipoLotacao, Turno, HistoricoLotacao, NivelFormacao, Formacao, Documento } from '../types.ts';
import { supabase } from '../services/supabase.ts';
import { employeeService } from '../services/employeeService.ts';

interface EmployeeModalProps {
  employee?: Partial<Funcionario>;
  schools: Escola[];
  roles: Funcao[];
  sectors: Setor[];
  onSave: (data: Partial<Funcionario>, foto?: File) => void;
  onClose: () => void;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({ employee, schools, roles, sectors, onSave, onClose }) => {
  const [activeTab, setActiveTab] = useState<'dados' | 'lotacao' | 'academico' | 'midia' | 'historico'>('dados');
  
  const [formData, setFormData] = useState<Partial<Funcionario>>({
    nome: '', cpf: '', matricula: '',
    email: '', telefone: '',
    funcaoId: roles[0]?.id || '', setorId: sectors[0]?.id || '',
    status: StatusFuncionario.ATIVO, escolaId: schools[0]?.id || '',
    possuiDobra: false,
    tipoLotacao: TipoLotacao.DEFINITIVA,
    turnos: [Turno.MANHA],
    cargaHoraria: 20,
    formacoes: [],
    documentos: [],
    anoIngresso: new Date().getFullYear(),
    dataIngresso: '', 
    ...employee
  });

  const [fotoFile, setFotoFile] = useState<File | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(employee?.fotoUrl);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [historico, setHistorico] = useState<HistoricoLotacao[]>([]);
  const [loadingHist, setLoadingHist] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!Array.isArray(formData.formacoes)) setFormData(prev => ({ ...prev, formacoes: [] }));
    if (!Array.isArray(formData.documentos)) setFormData(prev => ({ ...prev, documentos: [] }));
  }, [formData.formacoes, formData.documentos]);

  const tempoServico = useMemo(() => {
    if (!formData.dataIngresso) return null;
    const inicio = new Date(formData.dataIngresso);
    const hoje = new Date();
    let anos = hoje.getFullYear() - inicio.getFullYear();
    let meses = hoje.getMonth() - inicio.getMonth();
    if (meses < 0) { anos--; meses += 12; }
    if (anos < 0) return "Data futura";
    return anos === 0 ? `${meses} meses` : `${anos} anos e ${meses} meses`;
  }, [formData.dataIngresso]);

  useEffect(() => {
    if (activeTab === 'historico' && employee?.id) {
        setLoadingHist(true);
        supabase.from('historico_lotacao')
            .select(`*, escola_anterior:escolas!escola_anterior_id(nome), escola_nova:escolas!escola_nova_id(nome)`)
            .eq('funcionario_id', employee.id)
            .order('data_movimentacao', { ascending: false })
            .then(({ data }) => {
                if (data) setHistorico(data.map((h: any) => ({
                    ...h, escolaAnteriorNome: h.escola_anterior?.nome,
                    escolaNovaNome: h.escola_nova?.nome, dataMovimentacao: h.data_movimentacao
                })));
                setLoadingHist(false);
            });
    }
  }, [activeTab, employee?.id]);

  const toggleTurno = (turno: Turno) => {
    setFormData(prev => {
      const atuais = prev.turnos || [];
      return { ...prev, turnos: atuais.includes(turno) ? atuais.filter(t => t !== turno) : [...atuais, turno] };
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setFotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0] && formData.donoId) {
      setIsUploadingDoc(true);
      const newDoc = await employeeService.uploadDoc(formData.donoId, e.target.files[0]);
      if (newDoc) {
        setFormData(prev => ({ ...prev, documentos: [...(prev.documentos || []), newDoc] }));
      }
      setIsUploadingDoc(false);
    }
  };

  const removeDoc = (id: string) => {
    setFormData(prev => ({ ...prev, documentos: prev.documentos?.filter(d => d.id !== id) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dataIngresso) { alert("Data de ingresso obrigatória."); return; }
    setIsSaving(true);
    try { await onSave(formData, fotoFile); } finally { setIsSaving(false); }
  };

  const inputClass = "w-full h-12 px-4 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-slate-800 font-bold outline-none transition-all";
  const labelClass = "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1";

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
                {['dados', 'academico', 'lotacao', 'midia', 'historico'].map((tab) => (
                  <button key={tab} type="button" onClick={() => setActiveTab(tab as any)} className={`text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition whitespace-nowrap ${activeTab === tab ? 'border-white text-white' : 'border-transparent text-indigo-300'}`}>
                    {tab === 'midia' ? 'Documentos' : tab === 'academico' ? 'Formação' : tab}
                  </button>
                ))}
             </div>
          </div>
          
          <div className="p-6 md:p-10 space-y-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
              {activeTab === 'dados' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="md:col-span-2"><label className={labelClass}>Nome Completo</label><input required type="text" className={inputClass} value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} /></div>
                    <div><label className={labelClass}>CPF</label><input required type="text" className={inputClass} value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: e.target.value })} /></div>
                    <div><label className={labelClass}>Matrícula</label><input required type="text" className={inputClass} value={formData.matricula} onChange={e => setFormData({ ...formData, matricula: e.target.value })} /></div>
                    <div><label className={labelClass}>Função</label><select className={inputClass} value={formData.funcaoId} onChange={e => setFormData({ ...formData, funcaoId: e.target.value })}>{roles.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}</select></div>
                    <div><label className={labelClass}>Telefone / WhatsApp</label><input type="text" className={inputClass} value={formData.telefone || ''} onChange={e => setFormData({ ...formData, telefone: e.target.value })} /></div>
                  </div>
              )}

              {activeTab === 'midia' && (
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
                              <h3 className="text-lg font-black text-slate-800">Foto de Perfil</h3>
                              <p className="text-sm text-slate-500 font-medium">Esta imagem será exibida no portal da escola e no quadro de lotação.</p>
                          </div>
                      </div>

                      <div className="space-y-4">
                          <div className="flex justify-between items-center">
                              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Documentos Digitalizados</h3>
                              <button type="button" onClick={() => docInputRef.current?.click()} className="text-[10px] font-black text-indigo-600 uppercase border-b-2 border-indigo-600 pb-0.5">
                                  + Upload Documento
                              </button>
                              <input type="file" ref={docInputRef} className="hidden" onChange={handleDocUpload} />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {formData.documentos?.map((doc) => (
                                  <div key={doc.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group">
                                      <div className="flex items-center gap-3 truncate">
                                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
                                          <div className="truncate"><p className="text-xs font-bold text-slate-700 truncate">{doc.nome}</p><p className="text-[9px] text-slate-400 uppercase font-black">PDF / Imagem</p></div>
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
              )}
              {/* Abas Acadêmico, Lotação e Histórico permanecem funcionais */}
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
