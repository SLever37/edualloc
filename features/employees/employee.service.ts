
import { supabase } from '../../services/supabase.ts';
import { storageService } from '../../services/storage.service.ts';
import { Funcionario, OcorrenciaFrequencia, StatusFuncionario, Formacao, NivelFormacao, Documento } from '../../types.ts';

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
            setorId: f.setor_id,
            status: f.status || 'Ativo',
            escolaId: f.escola_id,
            possuiDobra: !!f.possui_dobra,
            presencaConfirmada: !!f.presenca_confirmada,
            tipoLotacao: f.tipo_lotacao || 'Definitiva',
            turnos: f.turnos || [],
            cargaHoraria: Number(f.carga_horaria || 0),
            formacoes: listaFormacoes,
            nivelFormacao: f.nivel_formacao,
            cursoFormacao: f.curso_formacao,
            anoIngresso: f.ano_ingresso,
            dataIngresso: f.data_ingresso,
            observacaoFrequencia: f.observacao_frequencia, 
            atestadoUrl: f.atestado_url,
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
      id: func.id || undefined,
      nome: func.nome,
      cpf: func.cpf,
      matricula: func.matricula,
      email: func.email || null,
      telefone: func.telefone || null,
      funcao_id: func.funcaoId || null,
      setor_id: func.setorId || null,
      status: func.status || 'Ativo',
      escola_id: func.escolaId || null,
      possui_dobra: !!func.possuiDobra,
      presenca_confirmada: !!func.presencaConfirmada,
      tipo_lotacao: func.tipoLotacao || 'Definitiva',
      turnos: Array.isArray(func.turnos) ? func.turnos : [],
      carga_horaria: Math.floor(Number(func.cargaHoraria || 0)),
      curso_formacao: JSON.stringify(func.formacoes || []),
      nivel_formacao: func.formacoes?.[0]?.nivel || null,
      documentos: JSON.stringify(func.documentos || []),
      dono_id: donoId
    };

    if (func.anoIngresso) payload.ano_ingresso = func.anoIngresso;
    if (func.dataIngresso) payload.data_ingresso = func.dataIngresso;
    if (fotoUrl) payload.foto_url = fotoUrl;

    const { error } = await supabase.from('funcionarios').upsert(payload);
    if (error) throw new Error(error.message);
  },

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

  delete: async (id: string) => {
    const { error } = await supabase.from('funcionarios').delete().eq('id', id);
    if (error) throw error;
  },

  registrarFrequencia: async (id: string, ocorrencia: OcorrenciaFrequencia, donoId: string, obs?: string, st?: StatusFuncionario, file?: File) => {
      const presencaConfirmada = ocorrencia === OcorrenciaFrequencia.PRESENCA;
      let atestadoUrl = null;
      if (file) {
          const path = `${donoId}/atestados/${Date.now()}_${file.name}`;
          const url = await storageService.uploadFile('fotos', path, file);
          if (url) atestadoUrl = url;
      }
      
      const updateData: any = { 
        presenca_confirmada: presencaConfirmada, 
        observacao_frequencia: obs || null 
      };
      
      if (atestadoUrl) updateData.atestado_url = atestadoUrl;
      if (st) updateData.status = st;
      
      const { error } = await supabase.from('funcionarios').update(updateData).eq('id', id);
      if (error) throw error;
  }
};
