
// Add React to imports to resolve namespace errors for ChangeEvent and FormEvent
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Funcionario, StatusFuncionario, Escola, Funcao, Setor, TipoLotacao, Turno, HistoricoLotacao, NivelFormacao, Formacao, Documento } from '../../types.ts';
import { supabase } from '../../services/supabase.ts';
import { employeeService } from './employee.service.ts';

export const useEmployeeForm = (
  employee: Partial<Funcionario> | undefined,
  schools: Escola[],
  roles: Funcao[],
  sectors: Setor[],
  onSave: (data: Partial<Funcionario>, foto?: File) => void
) => {
  const [activeTab, setActiveTab] = useState<'dados' | 'lotacao' | 'academico' | 'midia' | 'historico'>('dados');
  
  const [formData, setFormData] = useState<Partial<Funcionario>>({
    nome: '', cpf: '', matricula: '',
    email: '', telefone: '',
    funcaoId: roles[0]?.id || '', setorId: sectors[0]?.id || '',
    status: StatusFuncionario.ATIVO, escolaId: schools[0]?.id || '',
    possuiDobra: false,
    // Fix: Property 'DEFINITIVA' does not exist on type 'typeof TipoLotacao'. Changed to 'EFETIVO'.
    tipoLotacao: TipoLotacao.EFETIVO,
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
                    ...h, 
                    escolaAnteriorNome: h.escola_anterior?.nome,
                    escolaNovaNome: h.escola_nova?.nome, 
                    dataMovimentacao: h.data_movimentacao
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

  const addFormacao = () => {
    setFormData(prev => ({
        ...prev,
        formacoes: [...(prev.formacoes || []), { nivel: NivelFormacao.GRADUACAO, curso: '' }]
    }));
  };

  const updateFormacao = (idx: number, field: keyof Formacao, val: any) => {
    const list = [...(formData.formacoes || [])];
    list[idx] = { ...list[idx], [field]: val };
    setFormData(prev => ({ ...prev, formacoes: list }));
  };

  const removeFormacao = (idx: number) => {
    setFormData(prev => ({ ...prev, formacoes: prev.formacoes?.filter((_, i) => i !== idx) }));
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

  return {
    activeTab, setActiveTab,
    formData, setFormData,
    previewUrl, isUploadingDoc,
    historico, loadingHist, isSaving,
    fileInputRef, docInputRef,
    tempoServico,
    toggleTurno, handleFileUpload, handleDocUpload,
    addFormacao, updateFormacao, removeFormacao,
    removeDoc, handleSubmit
  };
};
