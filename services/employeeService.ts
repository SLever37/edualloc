import { supabase, uploadFile } from './base';
import { isSupabaseConfigured } from './supabase';
import { Funcionario, OcorrenciaFrequencia, StatusFuncionario } from '../types';

// Helpers para persistência local (Fallback)
const getLocal = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
const setLocal = (key: string, data: any[]) => localStorage.setItem(key, JSON.stringify(data));

// Helper para converter imagem em Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const employeeService = {
  getAll: async (donoId: string) => {
    // Se estiver offline/demo, vai direto para o LocalStorage
    if (!isSupabaseConfigured()) {
        return getLocal(`edualloc_funcionarios_${donoId}`);
    }

    try {
      let query = supabase.from('funcionarios').select('*');
      if (donoId !== 'SUPER') {
        query = query.eq('dono_id', donoId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const mappedData = (data || []).map((f: any) => ({
          ...f,
          funcaoId: f.funcao_id,
          setorId: f.setor_id,
          escolaId: f.escola_id,
          possuiDobra: f.possui_dobra,
          presencaConfirmada: f.presenca_confirmada,
          tipoLotacao: f.tipo_lotacao || 'Definitiva',
          turno: f.turno || 'Manhã',
          cargaHorariaSemanal: f.carga_horaria || 20,
          nivelFormacao: f.nivel_formacao,
          cursoFormacao: f.curso_formacao,
          anoIngresso: f.ano_ingresso,
          observacaoFrequencia: f.observacao_frequencia, 
          atestadoUrl: f.atestado_url,
          donoId: f.dono_id,
          fotoUrl: f.foto_url
      }));

      // Mescla dados
      const localData = getLocal(`edualloc_funcionarios_${donoId}`);
      const combined = [...mappedData];
      
      localData.forEach((localItem: any) => {
        if (!combined.find(dbItem => dbItem.id === localItem.id)) {
          combined.push(localItem);
        }
      });

      return combined;
    } catch (e) {
      console.warn("Supabase indisponível. Carregando dados locais.");
      return getLocal(`edualloc_funcionarios_${donoId}`);
    }
  },

  save: async (func: Partial<Funcionario>, donoId: string, fotoFile?: File) => {
    let fotoUrl = func.fotoUrl;

    // Tratamento de Foto (Upload ou Base64)
    if (fotoFile) {
      if (isSupabaseConfigured()) {
          try {
            const path = `${donoId}/${Date.now()}_${fotoFile.name}`;
            const url = await uploadFile('fotos', path, fotoFile);
            if (url) fotoUrl = url;
          } catch (e) {
             // Se falhar upload, tenta base64
             if (fotoFile.size < 2 * 1024 * 1024) fotoUrl = await fileToBase64(fotoFile);
          }
      } else {
          // Modo Offline: Base64 direto
          if (fotoFile.size < 2 * 1024 * 1024) fotoUrl = await fileToBase64(fotoFile);
      }
    }

    const id = func.id || crypto.randomUUID();
    const escolaIdSanitizado = (func.escolaId && func.escolaId.trim() !== '') ? func.escolaId : null;

    const payload = {
      id,
      nome: func.nome || '',
      cpf: func.cpf || '',
      matricula: func.matricula || '',
      email: func.email || null,
      telefone: func.telefone || null,
      funcao_id: func.funcaoId || null,
      setor_id: func.setorId || null,
      status: func.status,
      escola_id: escolaIdSanitizado,
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

    // Se estiver configurado, tenta salvar no banco
    if (isSupabaseConfigured()) {
        try {
            if (func.id) {
                // Lógica de Histórico
                try {
                    const { data: current } = await supabase.from('funcionarios').select('escola_id').eq('id', func.id).maybeSingle();
                    if (current && current.escola_id !== escolaIdSanitizado) {
                        await supabase.from('historico_lotacao').insert([{
                        funcionario_id: func.id,
                        escola_anterior_id: current.escola_id,
                        escola_nova_id: escolaIdSanitizado,
                        dono_id: donoId,
                        motivo: 'Movimentação via Gerenciador RH'
                        }]); 
                    }
                } catch (h) {}
            }
            const { error } = await supabase.from('funcionarios').upsert(payload);
            if (error) throw error;
            return; // Sucesso, não precisa salvar local
        } catch (e) {
            console.error("Erro banco, salvando local.");
        }
    }

    // Salva Localmente (Fallback ou Modo Offline)
    const current = getLocal(`edualloc_funcionarios_${donoId}`);
    const index = current.findIndex((x: any) => x.id === id);
    const localPayload = { ...func, id, donoId, fotoUrl };
    
    if (index >= 0) {
        current[index] = localPayload;
    } else {
        current.push(localPayload);
    }
    setLocal(`edualloc_funcionarios_${donoId}`, current);
  },

  delete: async (id: string) => {
    if (isSupabaseConfigured()) {
        try {
            await supabase.from('funcionarios').delete().eq('id', id);
        } catch (e) {}
    }
    
    Object.keys(localStorage).forEach(key => {
        if(key.startsWith('edualloc_funcionarios_')) {
            const list = JSON.parse(localStorage.getItem(key) || '[]');
            const newList = list.filter((x: any) => x.id !== id);
            localStorage.setItem(key, JSON.stringify(newList));
        }
    });
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
          // Tenta upload se configurado, senão ignora ou implementaria base64
          if (isSupabaseConfigured()) {
             try {
                const path = `${donoId}/atestados/${Date.now()}_${arquivoAtestado.name}`;
                const url = await uploadFile('fotos', path, arquivoAtestado);
                if (url) atestadoUrl = url;
             } catch (e) {}
          }
      }
      
      const updateData: any = { 
          presenca_confirmada: presencaConfirmada,
          observacao_frequencia: observacao || null
      };
      if (atestadoUrl) updateData.atestado_url = atestadoUrl;
      if (statusGeral) updateData.status = statusGeral;

      if (isSupabaseConfigured()) {
          try {
              const { error } = await supabase.from('funcionarios').update(updateData).eq('id', id);
              if (!error) return;
          } catch (e) {}
      }

      // Fallback Local
      const current = getLocal(`edualloc_funcionarios_${donoId}`);
      const index = current.findIndex((x: any) => x.id === id);
      if (index >= 0) {
          current[index] = { ...current[index], ...updateData };
          setLocal(`edualloc_funcionarios_${donoId}`, current);
      }
  }
};