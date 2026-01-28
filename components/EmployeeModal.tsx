import React, { useState, useRef, useEffect } from 'react';
import { Funcionario, StatusFuncionario, Escola, Funcao, Setor, TipoLotacao, Turno, HistoricoLotacao, NivelFormacao } from '../types';
import { supabase } from '../services/supabase';

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
    turno: Turno.MANHA,
    cargaHorariaSemanal: 20, // Padrão menor para evitar conflito inicial
    nivelFormacao: NivelFormacao.GRADUACAO,
    cursoFormacao: '',
    anoIngresso: new Date().getFullYear(),
    ...employee
  });

  const [fotoFile, setFotoFile] = useState<File | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(employee?.fotoUrl);
  const [historico, setHistorico] = useState<HistoricoLotacao[]>([]);
  const [loadingHist, setLoadingHist] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar Histórico ao abrir a aba
  useEffect(() => {
    if (activeTab === 'historico' && employee?.id) {
        const fetchHist = async () => {
            setLoadingHist(true);
            const { data } = await supabase
                .from('historico_lotacao')
                .select(`
                    *,
                    escola_anterior:escolas!escola_anterior_id(nome),
                    escola_nova:escolas!escola_nova_id(nome)
                `)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, fotoFile);
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
          {/* Header */}
          <div className="p-6 md:p-8 bg-indigo-600 text-white shrink-0 flex justify-between items-start">
             <div className="w-full">
                <h2 className="text-xl md:text-2xl font-black tracking-tight">{employee?.id ? 'Editar Vínculo' : 'Novo Vínculo/Matrícula'}</h2>
                <div className="flex gap-6 mt-6 overflow-x-auto pb-1 no-scrollbar">
                    <button type="button" onClick={() => setActiveTab('dados')} className={`text-xs font-black uppercase tracking-widest pb-2 border-b-2 transition whitespace-nowrap ${activeTab === 'dados' ? 'border-white text-white' : 'border-transparent text-indigo-300 hover:text-white'}`}>Dados Pessoais</button>
                    <button type="button" onClick={() => setActiveTab('academico')} className={`text-xs font-black uppercase tracking-widest pb-2 border-b-2 transition whitespace-nowrap ${activeTab === 'academico' ? 'border-white text-white' : 'border-transparent text-indigo-300 hover:text-white'}`}>Formação</button>
                    <button type="button" onClick={() => setActiveTab('lotacao')} className={`text-xs font-black uppercase tracking-widest pb-2 border-b-2 transition whitespace-nowrap ${activeTab === 'lotacao' ? 'border-white text-white' : 'border-transparent text-indigo-300 hover:text-white'}`}>Lotação & Carga</button>
                    <button type="button" onClick={() => setActiveTab('midia')} className={`text-xs font-black uppercase tracking-widest pb-2 border-b-2 transition whitespace-nowrap ${activeTab === 'midia' ? 'border-white text-white' : 'border-transparent text-indigo-300 hover:text-white'}`}>Docs & Mídia</button>
                    {employee?.id && (
                        <button type="button" onClick={() => setActiveTab('historico')} className={`text-xs font-black uppercase tracking-widest pb-2 border-b-2 transition whitespace-nowrap ${activeTab === 'historico' ? 'border-white text-white' : 'border-transparent text-indigo-300 hover:text-white'}`}>Histórico</button>
                    )}
                </div>
             </div>
             <button type="button" onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition ml-4"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
          </div>
          
          {/* Corpo */}
          <div className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1 min-h-0 bg-white">
            <div className="pb-10">
              
              {/* ABA DADOS */}
              {activeTab === 'dados' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="md:col-span-2">
                        <label className={labelClass}>Nome Civil Completo</label>
                        <input required type="text" className={inputClass} value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} />
                    </div>
                    <div>
                        <label className={labelClass}>CPF</label>
                        <input required type="text" placeholder="000.000.000-00" className={inputClass} value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: e.target.value })} />
                    </div>
                    <div>
                        <label className={labelClass}>Matrícula (Vínculo Único)</label>
                        <input required type="text" className={inputClass} value={formData.matricula} onChange={e => setFormData({ ...formData, matricula: e.target.value })} />
                        <p className="text-[9px] text-slate-400 mt-1">Para duplo vínculo, crie um novo cadastro com outra matrícula.</p>
                    </div>
                    <div>
                        <label className={labelClass}>E-mail Pessoal</label>
                        <input type="email" placeholder="nome@exemplo.com" className={inputClass} value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div>
                        <label className={labelClass}>WhatsApp / Celular</label>
                        <input type="text" placeholder="(00) 00000-0000" className={inputClass} value={formData.telefone || ''} onChange={e => setFormData({ ...formData, telefone: e.target.value })} />
                    </div>
                    <div>
                        <label className={labelClass}>Cargo / Função</label>
                        <select className={inputClass} value={formData.funcaoId} onChange={e => setFormData({ ...formData, funcaoId: e.target.value })}>
                            {roles.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
                        </select>
                    </div>
                  </div>
              )}

              {/* ABA ACADÊMICO (NOVA) */}
              {activeTab === 'academico' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
                     <div className="md:col-span-2 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl mb-2">
                        <p className="text-xs text-indigo-700 font-bold">Registro de qualificação vinculado a esta matrícula ({formData.matricula}).</p>
                     </div>

                     <div>
                        <label className={labelClass}>Nível de Formação</label>
                        <select className={inputClass} value={formData.nivelFormacao} onChange={e => setFormData({ ...formData, nivelFormacao: e.target.value as NivelFormacao })}>
                            {Object.values(NivelFormacao).map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                     </div>
                     
                     <div>
                        <label className={labelClass}>Curso / Área</label>
                        <input type="text" placeholder="Ex: Pedagogia, Matemática..." className={inputClass} value={formData.cursoFormacao || ''} onChange={e => setFormData({ ...formData, cursoFormacao: e.target.value })} />
                     </div>

                     <div>
                        <label className={labelClass}>Ano de Ingresso</label>
                        <input type="number" className={inputClass} value={formData.anoIngresso} onChange={e => setFormData({ ...formData, anoIngresso: Number(e.target.value) })} />
                     </div>

                     <div>
                        <label className={labelClass}>Tempo de Serviço (Calculado)</label>
                        <div className="h-12 flex items-center px-4 bg-slate-100 rounded-xl text-slate-500 font-bold border border-slate-200">
                            {formData.anoIngresso ? `${new Date().getFullYear() - (formData.anoIngresso || 0)} anos` : '-'}
                        </div>
                     </div>
                  </div>
              )}

              {/* ABA LOTAÇÃO */}
              {activeTab === 'lotacao' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 mb-4">
                        <label className="block text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Unidade Escolar de Lotação</label>
                        <select className="w-full h-14 px-4 bg-white border-2 border-indigo-200 text-indigo-900 rounded-xl font-black outline-none focus:border-indigo-500 transition" value={formData.escolaId} onChange={e => setFormData({ ...formData, escolaId: e.target.value })}>
                            {schools.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                        </select>
                        <p className="text-[10px] text-indigo-400 mt-2 font-bold flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                            Mover o funcionário gera registro automático no histórico.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClass}>Setor de Atuação</label>
                            <select className={inputClass} value={formData.setorId} onChange={e => setFormData({ ...formData, setorId: e.target.value })}>
                                {sectors.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Tipo de Vínculo</label>
                            <select className={inputClass} value={formData.tipoLotacao} onChange={e => setFormData({ ...formData, tipoLotacao: e.target.value as TipoLotacao })}>
                                {Object.values(TipoLotacao).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Turno de Trabalho</label>
                            <select className={inputClass} value={formData.turno} onChange={e => setFormData({ ...formData, turno: e.target.value as Turno })}>
                                {Object.values(Turno).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Carga Horária Semanal</label>
                            <select className={inputClass} value={formData.cargaHorariaSemanal} onChange={e => setFormData({ ...formData, cargaHorariaSemanal: Number(e.target.value) })}>
                                <option value={20}>20 Horas</option>
                                <option value={25}>25 Horas</option>
                                <option value={40}>40 Horas</option>
                                <option value={60}>60 Horas (Dobra/Extra)</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Status Atual</label>
                            <select className={inputClass} value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as StatusFuncionario })}>
                                {Object.values(StatusFuncionario).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                  </div>
              )}

              {/* ABA MÍDIA */}
              {activeTab === 'midia' && (
                  <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in slide-in-from-bottom-2">
                      <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                          <div className={`w-40 h-40 rounded-full border-4 border-indigo-100 overflow-hidden shadow-xl ${!previewUrl ? 'bg-indigo-50 flex items-center justify-center' : ''}`}>
                              {previewUrl ? (
                                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                              ) : (
                                  <svg className="text-indigo-300" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                              )}
                          </div>
                          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-sm">
                              <span className="text-white text-xs font-bold uppercase">Alterar Foto</span>
                          </div>
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                      </div>
                  </div>
              )}

              {/* ABA HISTÓRICO (TIMELINE) */}
              {activeTab === 'historico' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 pl-2">
                      {loadingHist ? (
                          <div className="text-center py-10 text-slate-400 text-xs font-bold animate-pulse">Carregando linha do tempo...</div>
                      ) : historico.length === 0 ? (
                          <div className="text-center py-10 text-slate-400 text-xs font-medium italic">Nenhuma movimentação registrada.</div>
                      ) : (
                          <div className="relative border-l-2 border-indigo-100 ml-4 space-y-8 pb-4">
                              {historico.map((h, idx) => (
                                  <div key={h.id} className="relative pl-8">
                                      <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${idx === 0 ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}></div>
                                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 transition">
                                          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1 block">
                                              {new Date(h.dataMovimentacao).toLocaleDateString('pt-BR')}
                                          </span>
                                          <p className="text-sm font-bold text-slate-800">
                                              {h.escolaNovaNome ? `Movido para: ${h.escolaNovaNome}` : 'Movimentação Administrativa'}
                                          </p>
                                          <p className="text-xs text-slate-500 mt-1">
                                              Origem: {h.escolaAnteriorNome || 'Não informado'}
                                          </p>
                                          {h.motivo && (
                                              <div className="mt-2 text-[10px] bg-white p-2 rounded border border-slate-200 text-slate-600 italic">
                                                  "{h.motivo}"
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              )}

            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-slate-50 border-t flex justify-end gap-4 shrink-0 safe-area-bottom">
            <button type="button" onClick={onClose} className="px-6 py-3 text-slate-500 font-black uppercase text-xs hover:bg-slate-200 rounded-xl transition">Cancelar</button>
            <button type="submit" className="px-8 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 text-xs uppercase tracking-wide">
                {employee?.id ? 'Atualizar Dossiê' : 'Cadastrar Vínculo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;