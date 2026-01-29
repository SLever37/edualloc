
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Funcionario, StatusFuncionario, Escola, Funcao, Setor, TipoLotacao, Turno, HistoricoLotacao, NivelFormacao, Formacao } from '../types.ts';
import { supabase } from '../services/supabase.ts';

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
    anoIngresso: new Date().getFullYear(),
    dataIngresso: '', 
    ...employee
  });

  // Garantia de que formacoes é um array (previne erro de iteração se o objeto employee for parcial ou legado)
  useEffect(() => {
    if (!Array.isArray(formData.formacoes)) {
        setFormData(prev => ({ ...prev, formacoes: [] }));
    }
  }, [formData.formacoes]);

  const [fotoFile, setFotoFile] = useState<File | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(employee?.fotoUrl);
  const [historico, setHistorico] = useState<HistoricoLotacao[]>([]);
  const [loadingHist, setLoadingHist] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tempoServico = useMemo(() => {
    if (!formData.dataIngresso) return null;
    const inicio = new Date(formData.dataIngresso);
    const hoje = new Date();
    
    let anos = hoje.getFullYear() - inicio.getFullYear();
    let meses = hoje.getMonth() - inicio.getMonth();
    
    if (meses < 0) {
        anos--;
        meses += 12;
    }

    if (anos < 0) return "Data futura inválida";
    
    const textoAnos = anos === 1 ? '1 ano' : `${anos} anos`;
    const textoMeses = meses === 1 ? '1 mês' : `${meses} meses`;
    
    if (anos === 0) return textoMeses;
    if (meses === 0) return textoAnos;
    return `${textoAnos} e ${textoMeses}`;
  }, [formData.dataIngresso]);

  useEffect(() => {
    if (activeTab === 'historico' && employee?.id) {
        const fetchHist = async () => {
            setLoadingHist(true);
            const { data } = await supabase
                .from('historico_lotacao')
                .select(`*, escola_anterior:escolas!escola_anterior_id(nome), escola_nova:escolas!escola_nova_id(nome)`)
                .eq('funcionario_id', employee.id)
                .order('data_movimentacao', { ascending: false });
            
            if (data) {
                setHistorico(data.map((h: any) => ({
                    ...h,
                    escolaAnteriorNome: h.escola_anterior?.nome,
                    escolaNovaNome: h.escola_nova?.nome,
                    dataMovimentacao: h.data_movimentacao
                })));
            }
            setLoadingHist(false);
        };
        fetchHist();
    }
  }, [activeTab, employee?.id]);

  const toggleTurno = (turno: Turno) => {
    setFormData(prev => {
      const atuais = prev.turnos || [];
      return {
        ...prev,
        turnos: atuais.includes(turno) ? atuais.filter(t => t !== turno) : [...atuais, turno]
      };
    });
  };

  const addFormacao = () => {
    setFormData(prev => ({
      ...prev,
      formacoes: [...(prev.formacoes || []), { nivel: NivelFormacao.GRADUACAO, curso: '' }]
    }));
  };

  const updateFormacao = (idx: number, field: keyof Formacao, value: string) => {
    setFormData(prev => {
      const novas = [...(prev.formacoes || [])];
      (novas[idx] as any)[field] = value;
      return { ...prev, formacoes: novas };
    });
  };

  const removeFormacao = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      formacoes: prev.formacoes?.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dataIngresso) {
        alert("A Data de Ingresso é obrigatória para o cálculo de tempo de serviço.");
        setActiveTab('academico');
        return;
    }
    setIsSaving(true);
    try {
        await onSave(formData, fotoFile);
    } catch (err) {
    } finally {
        setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const inputClass = "w-full h-12 px-4 bg-slate-50 hover:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-slate-800 font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm";
  const labelClass = "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1";

  return (
    <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center p-0 md:p-4 z-[100] backdrop-blur-sm">
      <div className="bg-white md:rounded-3xl w-full max-w-3xl flex flex-col h-full md:h-auto md:max-h-[90vh] shadow-2xl animate-modal overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="p-6 md:p-8 bg-indigo-600 text-white shrink-0">
             <div className="flex justify-between items-start">
                <h2 className="text-xl md:text-2xl font-black tracking-tight">{employee?.id ? 'Editar Lotação' : 'Novo Vínculo/Lotação'}</h2>
                <button type="button" onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
             </div>
             <div className="flex gap-6 mt-6 overflow-x-auto pb-1 no-scrollbar">
                <button type="button" onClick={() => setActiveTab('dados')} className={`text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition whitespace-nowrap ${activeTab === 'dados' ? 'border-white text-white' : 'border-transparent text-indigo-300 hover:text-white'}`}>Dados</button>
                <button type="button" onClick={() => setActiveTab('academico')} className={`text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition whitespace-nowrap ${activeTab === 'academico' ? 'border-white text-white' : 'border-transparent text-indigo-300 hover:text-white'}`}>Formações & Tempo</button>
                <button type="button" onClick={() => setActiveTab('lotacao')} className={`text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition whitespace-nowrap ${activeTab === 'lotacao' ? 'border-white text-white' : 'border-transparent text-indigo-300 hover:text-white'}`}>Lotação</button>
                <button type="button" onClick={() => setActiveTab('midia')} className={`text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition whitespace-nowrap ${activeTab === 'midia' ? 'border-white text-white' : 'border-transparent text-indigo-300 hover:text-white'}`}>Documentos</button>
                {employee?.id && <button type="button" onClick={() => setActiveTab('historico')} className={`text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition whitespace-nowrap ${activeTab === 'historico' ? 'border-white text-white' : 'border-transparent text-indigo-300 hover:text-white'}`}>Histórico</button>}
             </div>
          </div>
          
          <div className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1 min-h-0 bg-white">
            <div className="pb-10">
              {activeTab === 'dados' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="md:col-span-2"><label className={labelClass}>Nome Completo</label><input required type="text" className={inputClass} value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} /></div>
                    <div><label className={labelClass}>CPF</label><input required type="text" placeholder="000.000.000-00" className={inputClass} value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: e.target.value })} /></div>
                    <div><label className={labelClass}>Matrícula</label><input required type="text" className={inputClass} value={formData.matricula} onChange={e => setFormData({ ...formData, matricula: e.target.value })} /></div>
                    <div><label className={labelClass}>Função</label><select className={inputClass} value={formData.funcaoId} onChange={e => setFormData({ ...formData, funcaoId: e.target.value })}>{roles.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}</select></div>
                    <div><label className={labelClass}>E-mail</label><input type="email" className={inputClass} value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                    <div><label className={labelClass}>Telefone / WhatsApp</label><input type="text" placeholder="(00) 00000-0000" className={inputClass} value={formData.telefone || ''} onChange={e => setFormData({ ...formData, telefone: e.target.value })} /></div>
                  </div>
              )}

              {activeTab === 'academico' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                     <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="w-full md:w-auto">
                            <label className="block text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Data de Ingresso (Matrícula)</label>
                            <input 
                                required
                                type="date" 
                                className="w-full h-12 px-4 bg-white border border-indigo-200 rounded-xl font-bold text-indigo-900 outline-none focus:ring-4 focus:ring-indigo-500/10" 
                                value={formData.dataIngresso} 
                                onChange={e => setFormData({ ...formData, dataIngresso: e.target.value, anoIngresso: new Date(e.target.value).getFullYear() })} 
                            />
                        </div>
                        <div className="text-center md:text-right">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Tempo de Serviço</p>
                            <p className="text-2xl font-black text-indigo-600 leading-tight">{tempoServico || "--"}</p>
                        </div>
                     </div>

                     <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Formações & Habilidades</h3>
                            <button type="button" onClick={addFormacao} className="text-[10px] font-black text-indigo-600 uppercase">+ Adicionar</button>
                        </div>
                        
                        <div className="space-y-3">
                           {Array.isArray(formData.formacoes) && formData.formacoes.map((f, i) => (
                             <div key={i} className="flex gap-2 items-end bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <div className="flex-1">
                                   <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Nível</label>
                                   <select className="w-full h-9 px-2 bg-white border border-slate-200 rounded-lg text-xs font-bold" value={f.nivel} onChange={e => updateFormacao(i, 'nivel', e.target.value)}>
                                      {Object.values(NivelFormacao).map(n => <option key={n} value={n}>{n}</option>)}
                                   </select>
                                </div>
                                <div className="flex-[2]">
                                   <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Curso / Habilidade</label>
                                   <input className="w-full h-9 px-2 bg-white border border-slate-200 rounded-lg text-xs font-bold" value={f.curso} onChange={e => updateFormacao(i, 'curso', e.target.value)} placeholder="Ex: Letras, Gestão Escolar..." />
                                </div>
                                <button type="button" onClick={() => removeFormacao(i)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
                             </div>
                           ))}
                           {(!formData.formacoes || formData.formacoes.length === 0) && <p className="text-center py-4 text-slate-400 text-[10px] font-bold italic">Nenhuma formação cadastrada.</p>}
                        </div>
                     </div>
                  </div>
              )}

              {activeTab === 'lotacao' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                        <label className="block text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Unidade Escolar</label>
                        <select className="w-full h-14 px-4 bg-white border-2 border-indigo-200 text-indigo-900 rounded-xl font-black outline-none" value={formData.escolaId} onChange={e => setFormData({ ...formData, escolaId: e.target.value })}>
                            {schools.map(s => <option key={s.id} value={s.id}>{s.nome} (INEP: {s.inep})</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className={labelClass}>Setor de Atuação</label><select className={inputClass} value={formData.setorId} onChange={e => setFormData({ ...formData, setorId: e.target.value })}>{sectors.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}</select></div>
                        <div><label className={labelClass}>Tipo de Lotação</label><select className={inputClass} value={formData.tipoLotacao} onChange={e => setFormData({ ...formData, tipoLotacao: e.target.value as TipoLotacao })}>{Object.values(TipoLotacao).map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                        <div className="md:col-span-2">
                            <label className={labelClass}>Turnos Alocados</label>
                            <div className="flex gap-3">
                                {[Turno.MANHA, Turno.TARDE, Turno.NOITE].map(t => (
                                    <button key={t} type="button" onClick={() => toggleTurno(t)} className={`flex-1 p-3 rounded-xl border-2 font-black text-[10px] uppercase transition ${formData.turnos?.includes(t) ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>{t}</button>
                                ))}
                            </div>
                        </div>
                        <div><label className={labelClass}>Carga Horária Semanal (Horas)</label><input type="number" className={inputClass} value={formData.cargaHoraria} onChange={e => setFormData({ ...formData, cargaHoraria: Number(e.target.value) })} /></div>
                        <div><label className={labelClass}>Status da Lotação</label><select className={inputClass} value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as StatusFuncionario })}>{Object.values(StatusFuncionario).map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                    </div>
                  </div>
              )}

              {activeTab === 'midia' && (
                  <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in slide-in-from-bottom-2">
                      <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                          <div className={`w-40 h-40 rounded-full border-4 border-indigo-100 overflow-hidden shadow-xl ${!previewUrl ? 'bg-indigo-50 flex items-center justify-center' : ''}`}>
                              {previewUrl ? <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" /> : <svg className="text-indigo-300" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>}
                          </div>
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                      </div>
                  </div>
              )}

              {activeTab === 'historico' && (
                  <div className="space-y-6 animate-in fade-in pl-2">
                      {loadingHist ? <div className="text-center py-10 text-slate-400 text-xs font-bold animate-pulse">Carregando...</div> : historico.length === 0 ? <div className="text-center py-10 text-slate-400 text-xs italic">Sem movimentações.</div> : (
                          <div className="relative border-l-2 border-indigo-100 ml-4 space-y-8 pb-4">
                              {historico.map((h, idx) => (
                                  <div key={h.id} className="relative pl-8">
                                      <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${idx === 0 ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}></div>
                                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                          <span className="text-[10px] font-black text-indigo-500 uppercase block mb-1">{new Date(h.dataMovimentacao).toLocaleDateString('pt-BR')}</span>
                                          <p className="text-sm font-bold text-slate-800">{h.escolaNovaNome ? `Para: ${h.escolaNovaNome}` : 'Mudança'}</p>
                                          <p className="text-xs text-slate-500 mt-1">Origem: {h.escolaAnteriorNome || 'Não informado'}</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              )}
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t flex justify-end gap-4 shrink-0 safe-area-bottom">
            <button type="button" onClick={onClose} className="px-6 py-3 text-slate-500 font-black uppercase text-[10px] hover:bg-slate-200 rounded-xl transition">Cancelar</button>
            <button 
                type="submit" 
                disabled={isSaving}
                className="px-8 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition shadow-lg text-[10px] uppercase tracking-wide disabled:opacity-50"
            >
                {isSaving ? 'Salvando...' : 'Salvar Cadastro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;
