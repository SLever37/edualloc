
import React, { useState } from 'react';
import { Escola, Turno } from '../types.ts';

interface SchoolModalProps {
  school?: Escola;
  onSave: (data: Partial<Escola>) => void;
  onClose: () => void;
}

const SchoolModal: React.FC<SchoolModalProps> = ({ school, onSave, onClose }) => {
  const gerarCredenciais = () => ({
    codigoGestor: `ESC-${Math.floor(Math.random() * 8999) + 1000}`,
    codigoAcesso: Math.random().toString(36).slice(-6).toUpperCase()
  });

  const [formData, setFormData] = useState<Partial<Escola>>(() => {
    if (school) return school;
    return {
      inep: '',
      nome: '',
      endereco: '',
      turnosFuncionamento: [Turno.MANHA, Turno.TARDE],
      ...gerarCredenciais()
    };
  });

  const [saving, setSaving] = useState(false);

  const regenerarAcessos = () => {
    setFormData(prev => ({ ...prev, ...gerarCredenciais() }));
  };

  const toggleTurno = (turno: Turno) => {
    setFormData(prev => {
        const atuais = prev.turnosFuncionamento || [];
        if (atuais.includes(turno)) {
            return { ...prev, turnosFuncionamento: atuais.filter(t => t !== turno) };
        } else {
            return { ...prev, turnosFuncionamento: [...atuais, turno] };
        }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
        await onSave(formData);
    } finally {
        setSaving(false);
    }
  };

  const inputClass = "w-full h-12 px-4 bg-slate-50 hover:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-slate-800 font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm";
  const labelClass = "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1";
  const readOnlyClass = "w-full h-14 px-4 bg-slate-100 border-2 border-slate-200 text-slate-500 rounded-2xl outline-none font-black text-center tracking-wider cursor-not-allowed";

  return (
    <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center p-0 md:p-4 z-[100] backdrop-blur-sm">
      <div className="bg-white md:rounded-3xl w-full max-w-lg flex flex-col h-full md:h-auto md:max-h-[90vh] shadow-2xl animate-modal overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="p-6 md:p-8 bg-emerald-600 text-white flex justify-between items-center shrink-0">
            <div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight">{school?.id ? 'Editar Unidade' : 'Nova Unidade Escolar'}</h2>
              <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mt-1">Gestão de Rede</p>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          <div className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1 min-h-0">
            <div className="pb-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className={labelClass}>INEP (8 dígitos)</label>
                    <input required type="text" maxLength={8} pattern="[0-9]{8}" placeholder="12345678" className={inputClass} value={formData.inep} onChange={e => setFormData({ ...formData, inep: e.target.value.replace(/\D/g, '') })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Nome da Escola</label>
                    <input required type="text" placeholder="Ex: E.M. Machado de Assis" className={inputClass} value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} />
                  </div>
                </div>
                <div className="mt-6">
                <label className={labelClass}>Endereço Completo</label>
                <input required type="text" placeholder="Rua, Número, Bairro" className={inputClass} value={formData.endereco} onChange={e => setFormData({ ...formData, endereco: e.target.value })} />
                </div>
                <div className="mt-6">
                    <label className={labelClass}>Turnos de Funcionamento</label>
                    <div className="grid grid-cols-3 gap-3">
                        {[Turno.MANHA, Turno.TARDE, Turno.NOITE].map((turno) => {
                            const ativo = formData.turnosFuncionamento?.includes(turno);
                            return (
                                <button key={turno} type="button" onClick={() => toggleTurno(turno)} className={`p-3 rounded-xl border-2 font-black text-[10px] uppercase transition ${ativo ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-400 hover:border-emerald-200'}`}>
                                    {turno} {ativo && '✓'}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">Credenciais</h3>
                        <button type="button" onClick={regenerarAcessos} className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 uppercase flex items-center gap-1 bg-white px-2 py-1 rounded border border-indigo-100 shadow-sm">Gerar Novas</button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className={labelClass}>Código Gestor</label>
                          <input readOnly type="text" className={readOnlyClass} value={formData.codigoGestor} />
                      </div>
                      <div>
                          <label className={labelClass}>Senha Acesso</label>
                          <input readOnly type="text" className={readOnlyClass} value={formData.codigoAcesso} />
                      </div>
                    </div>
                </div>
            </div>
          </div>
          <div className="p-6 bg-slate-50 border-t flex justify-end gap-4 shrink-0 safe-area-bottom">
            <button type="button" onClick={onClose} className="px-6 py-3 text-slate-500 font-black uppercase text-xs hover:bg-slate-200 rounded-xl transition">Cancelar</button>
            <button type="submit" disabled={saving} className="px-8 py-3 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 text-xs uppercase tracking-wide disabled:opacity-50">{saving ? 'Gravando...' : 'Salvar Unidade'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SchoolModal;
