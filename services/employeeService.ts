import { supabase, uploadFile } from './base';
import { Funcionario, OcorrenciaFrequencia, StatusFuncionario } from '../types';

export const employeeService = {
  getAll: async (donoId: string) => {
    let query = supabase.from('funcionarios').select('*');
    if (donoId !== 'SUPER') {
      query = query.eq('dono_id', donoId);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Erro ao carregar funcionários do banco:", error.message);
      if (error.code === '42P01') {
          console.warn("A tabela 'funcionarios' não existe no banco de dados.");
      }
      return JSON.parse(localStorage.getItem(`edualloc_cache_emp_${donoId}`) || '[]');
    }

    const mapped = (data || []).map((f: any) => ({
        id: f.id,
        nome: f.nome,
        cpf: f.cpf,
        matricula: f.matricula,
        email: f.email,
        telefone: f.telefone,
        funcaoId: f.funcao_id,
        setorId: f.setor_id,
        status: f.status,
        escolaId: f.escola_id,
        possuiDobra: !!f.possui_dobra,
        presencaConfirmada: !!f.presenca_confirmada,
        tipoLotacao: f.tipo_lotacao || 'Definitiva',
        turno: f.turno || 'Manhã',
        cargaHorariaSemanal: f.carga_horaria || 0,
        nivelFormacao: f.nivel_formacao,
        cursoFormacao: f.curso_formacao,
        anoIngresso: f.ano_ingresso,
        observacaoFrequencia: f.observacao_frequencia, 
        atestadoUrl: f.atestado_url,
        donoId: f.dono_id,
        fotoUrl: f.foto_url
    }));

    localStorage.setItem(`edualloc_cache_emp_${donoId}`, JSON.stringify(mapped));
    return mapped;
  },

  save: async (func: Partial<Funcionario>, donoId: string, fotoFile?: File) => {
    let fotoUrl = func.fotoUrl;

    if (fotoFile) {
      try {
        const path = `${donoId}/fotos/${Date.now()}_${fotoFile.name}`;
        const url = await uploadFile('fotos', path, fotoFile);
        if (url) fotoUrl = url;
      } catch (e) {
        console.warn("Upload de foto falhou. Verifique se o bucket 'fotos' é público.");
      }
    }

    const payload = {
      id: func.id || undefined,
      nome: func.nome,
      cpf: func.cpf,
      matricula: func.matricula,
      email: func.email || null,
      telefone: func.telefone || null,
      funcao_id: func.funcaoId || null,
      setor_id: func.setorId || null,
      status: func.status,
      escola_id: func.escolaId || null,
      possui_dobra: !!func.possuiDobra,
      presenca_confirmada: !!func.presencaConfirmada,
      tipo_lotacao: func.tipoLotacao,
      turno: func.turno,
      carga_horaria: func.cargaHorariaSemanal || 0,
      nivel_formacao: func.nivelFormacao,
      curso_formacao: func.cursoFormacao,
      ano_ingresso: func.anoIngresso,
      foto_url: fotoUrl || null,
      dono_id: donoId
    };

    // Histórico opcional - Se falhar (tabela ausente), o salvamento do funcionário continua
    if (func.id && func.escolaId) {
      try {
          const { data: oldData } = await supabase.from('funcionarios').select('escola_id').eq('id', func.id).maybeSingle();
          if (oldData && oldData.escola_id !== func.escolaId) {
            await supabase.from('historico_lotacao').insert({
              funcionario_id: func.id,
              escola_anterior_id: oldData.escola_id,
              escola_nova_id: func.escolaId,
              motivo: 'Movimentação via Sistema'
            });
          }
      } catch (hErr) {
          console.warn("Não foi possível registrar o histórico de movimentação.");
      }
    }

    const { error } = await supabase.from('funcionarios').upsert(payload);
    if (error) {
        if (error.code === '42P01') throw new Error("A tabela 'funcionarios' não foi criada. Rode o script SQL no Supabase.");
        throw new Error(error.message);
    }
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('funcionarios').delete().eq('id', id);
    if (error) throw error;
  },

  registrarFrequencia: async (
      id: string, 
      ocorrencia: OcorrenciaFrequencia, 
      donoId: string, 
      observacao?: string,
      statusGeral?: StatusFuncionario,
      arquivoAtestado?: File
  ) => {
      const presencaConfirmada = ocorrencia === OcorrenciaFrequencia.PRESENCA;
      let atestadoUrl = null;

      if (arquivoAtestado) {
          try {
            const path = `${donoId}/atestados/${Date.now()}_${arquivoAtestado.name}`;
            const url = await uploadFile('fotos', path, arquivoAtestado);
            if (url) atestadoUrl = url;
          } catch (e) {}
      }
      
      const updateData: any = { 
          presenca_confirmada: presencaConfirmada,
          observacao_frequencia: observacao || null
      };
      if (atestadoUrl) updateData.atestado_url = atestadoUrl;
      if (statusGeral) updateData.status = statusGeral;

      const { error } = await supabase.from('funcionarios').update(updateData).eq('id', id);
      if (error) throw error;
  }
};