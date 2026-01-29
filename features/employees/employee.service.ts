
import { supabase } from '../../services/supabase.ts';
import { storageService } from '../../services/storage.service.ts';
import { Funcionario, OcorrenciaFrequencia, StatusFuncionario, Formacao, NivelFormacao, Documento, TipoLotacao } from '../../types.ts';

export const employeeService = {
  getAll: async (donoId: string): Promise<Funcionario[]> => {
    let query = supabase.from('funcionarios').select('*');
    if (donoId !== 'SUPER') {
      query = query.eq('dono_id', donoId);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Erro ao carregar funcionários:", error.message);
      return [];
    }

    return (data || []).map((f: any) => {
        let listaFormacoes: Formacao[] = [];
        try {
            const parsed = JSON.parse(f.curso_formacao);
            listaFormacoes = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            if (f.curso_formacao) {
                listaFormacoes = [{ 
                    nivel: (f.nivel_formacao as NivelFormacao) || NivelFormacao.GRADUACAO, 
                    curso: f.curso_formacao 
                }];
            }
        }

        let docs: Documento[] = [];
        try {
            docs = typeof f.documentos === 'string' ? JSON.parse(f.documentos) : (f.documentos || []);
        } catch (e) { docs = []; }

        return {
            id: f.id,
            nome: f.nome,
            cpf: f.cpf,
            matricula: f.matricula,
            email: f.email,
            telefone: f.telefone,
            funcaoId: f.funcao_id,
            /* Fixed: Property mapping changed from setor_id to setorId to match Funcionario interface */
            setorId: f.setor_id,
            status: f.status || StatusFuncionario.ATIVO,
            escolaId: f.escola_id,
            possuiDobra: !!f.possui_dobra,
            presencaConfirmada: !!f.presenca_confirmada,
            tipoLotacao: f.tipo_lotacao || TipoLotacao.EFETIVO,
            turnos: f.turnos || [],
            cargaHoraria: Number(f.carga_horaria || 0),
            formacoes: listaFormacoes,
            dataIngresso: f.data_ingresso,
            dataUltimaFrequencia: f.data_ultima_frequencia,
            donoId: f.dono_id,
            fotoUrl: f.foto_url,
            documentos: docs
        };
    });
  },

  save: async (func: Partial<Funcionario>, donoId: string, fotoFile?: File) => {
    if (!donoId) throw new Error("Sessão inválida.");

    let fotoUrl = func.fotoUrl;
    if (fotoFile) {
      const path = `${donoId}/fotos/${Date.now()}_${fotoFile.name}`;
      const url = await storageService.uploadFile('fotos', path, fotoFile);
      if (url) fotoUrl = url;
    }

    const payload: any = {
      nome: func.nome,
      cpf: func.cpf,
      matricula: func.matricula,
      email: func.email || null,
      telefone: func.telefone || null,
      funcao_id: func.funcaoId || null,
      setor_id: func.setorId || null,
      status: func.status || StatusFuncionario.ATIVO,
      escola_id: func.escolaId || null,
      possui_dobra: !!func.possuiDobra,
      tipo_lotacao: func.tipoLotacao || TipoLotacao.EFETIVO,
      turnos: Array.isArray(func.turnos) ? func.turnos : [],
      carga_horaria: Math.floor(Number(func.cargaHoraria || 0)),
      curso_formacao: JSON.stringify(func.formacoes || []),
      dono_id: donoId
    };

    if (fotoUrl) payload.foto_url = fotoUrl;

    const { error } = await supabase.from('funcionarios').upsert({
        ...payload,
        id: func.id || undefined
    });
    
    if (error) throw new Error(error.message);
  },

  /* Added missing uploadDoc method used in useEmployeeForm.ts */
  uploadDoc: async (donoId: string, file: File): Promise<Documento | null> => {
    const path = `${donoId}/documentos/${Date.now()}_${file.name}`;
    const url = await storageService.uploadFile('fotos', path, file);
    if (!url) return null;
    return {
      id: crypto.randomUUID(),
      nome: file.name,
      url: url,
      tipo: file.type
    };
  },

  registrarFrequencia: async (id: string, ocorrencia: OcorrenciaFrequencia, donoId: string, obs?: string, st?: StatusFuncionario, file?: File) => {
    const dataHoje = new Date().toISOString().split('T')[0];
    
    // 1. Criar registro na frequencia_diaria (Histórico)
    const { data: freqData, error: freqError } = await supabase.from('frequencia_diaria').upsert({
        funcionario_id: id,
        escola_id: (await supabase.from('funcionarios').select('escola_id').eq('id', id).single()).data?.escola_id,
        data: dataHoje,
        status: ocorrencia,
        observacao: obs || null,
        dono_id: donoId
    }).select().single();

    if (freqError) throw freqError;

    // 2. Se houver arquivo (atestado), salvar na tabela atestados
    if (file) {
      const path = `${donoId}/atestados/${Date.now()}_${file.name}`;
      const url = await storageService.uploadFile('fotos', path, file);
      if (url) {
          await supabase.from('atestados').insert({
              funcionario_id: id,
              escola_id: freqData.escola_id,
              frequencia_id: freqData.id,
              arquivo_path: url,
              arquivo_nome: file.name,
              mime_type: file.type,
              dono_id: donoId,
              data_inicio: dataHoje
          });
      }
    }

    // 3. Atualizar o funcionário (Estado Atual)
    const updateFunc: any = {
        presenca_confirmada: ocorrencia === OcorrenciaFrequencia.PRESENCA,
        data_ultima_frequencia: dataHoje
    };

    if (ocorrencia === OcorrenciaFrequencia.ATESTADO) {
        updateFunc.status = StatusFuncionario.LICENCA_MEDICA;
    } else if (st) {
        updateFunc.status = st;
    }

    await supabase.from('funcionarios').update(updateFunc).eq('id', id);
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('funcionarios').delete().eq('id', id);
    if (error) throw error;
  }
};
