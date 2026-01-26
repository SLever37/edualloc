
import { supabase, uploadFile } from './base';
import { Funcionario, OcorrenciaFrequencia } from '../types';

// Helpers para persistência local (Fallback)
const getLocal = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
const setLocal = (key: string, data: any[]) => localStorage.setItem(key, JSON.stringify(data));

// Helper para converter imagem em Base64 (Fallback visual)
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
    try {
      let query = supabase.from('funcionarios').select('*');
      if (donoId !== 'SUPER') {
        query = query.eq('dono_id', donoId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Mescla dados do banco com dados locais (fallback)
      const localData = getLocal(`edualloc_funcionarios_${donoId}`);
      const combined = [...(data || [])];
      
      // Adiciona itens locais que não estão no banco (pelo ID)
      localData.forEach((localItem: any) => {
        if (!combined.find(dbItem => dbItem.id === localItem.id)) {
          combined.push(localItem);
        }
      });

      return combined;
    } catch (e) {
      console.warn("Supabase indisponível/Offline. Carregando dados locais.");
      return getLocal(`edualloc_funcionarios_${donoId}`);
    }
  },

  save: async (func: Partial<Funcionario>, donoId: string, fotoFile?: File) => {
    let fotoUrl = func.fotoUrl;

    // Tenta upload de foto 
    if (fotoFile) {
      try {
        const path = `${donoId}/${Date.now()}_${fotoFile.name}`;
        const url = await uploadFile('fotos', path, fotoFile);
        if (url) fotoUrl = url;
      } catch (e) {
        console.warn("Upload de foto falhou. Usando modo offline (Base64).");
        try {
            // Limite de segurança para Base64 (evitar travar o navegador/banco com strings gigantes)
            if (fotoFile.size < 2 * 1024 * 1024) { // Max 2MB
                fotoUrl = await fileToBase64(fotoFile);
            } else {
                alert("Aviso: Foto muito grande para modo offline. Tente uma imagem menor que 2MB.");
            }
        } catch (b64Error) {
            console.warn("Erro ao gerar preview local:", b64Error);
        }
      }
    }

    const id = func.id || crypto.randomUUID();

    // Sanitização: UUIDs não podem ser string vazia ou undefined. Devem ser null se vazios.
    const escolaIdSanitizado = (func.escolaId && func.escolaId.trim() !== '') ? func.escolaId : null;
    const funcaoIdSanitizado = (func.funcaoId && func.funcaoId.trim() !== '') ? func.funcaoId : null;
    const setorIdSanitizado = (func.setorId && func.setorId.trim() !== '') ? func.setorId : null;

    const payload = {
      id,
      nome: func.nome || '',
      cpf: func.cpf || '',
      matricula: func.matricula || '',
      funcao_id: funcaoIdSanitizado,
      setor_id: setorIdSanitizado,
      status: func.status,
      escola_id: escolaIdSanitizado,
      possui_dobra: !!func.possuiDobra,
      presenca_confirmada: !!func.presencaConfirmada,
      tipo_lotacao: func.tipoLotacao,
      turno: func.turno,
      carga_horaria: func.cargaHorariaSemanal || 0,
      foto_url: fotoUrl || null,
      dono_id: donoId
    };

    try {
      // REGISTRO DE HISTÓRICO DE LOTAÇÃO
      if (func.id) {
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
         } catch (histError) {
             console.warn("Erro no histórico (ignorado):", histError);
         }
      }

      // SALVAMENTO PRINCIPAL
      const { error } = await supabase.from('funcionarios').upsert(payload);
      
      if (error) {
        throw error;
      }

    } catch (e: any) {
      console.error("ERRO AO SALVAR NO SUPABASE:", e);
      
      // ALERTA VISUAL PARA O USUÁRIO
      alert(`Atenção: O sistema salvou apenas localmente!\n\nMotivo do erro no Banco: ${e.message || 'Erro de conexão/permissão'}. \n\nVerifique se o Patch SQL foi rodado.`);

      // Fallback: Local Storage
      console.warn("Salvando funcionário localmente (Modo Offline/Restrito)");
      const current = getLocal(`edualloc_funcionarios_${donoId}`);
      const index = current.findIndex((x: any) => x.id === id);
      
      if (index >= 0) {
        current[index] = payload;
      } else {
        current.push(payload);
      }
      setLocal(`edualloc_funcionarios_${donoId}`, current);
    }
  },

  delete: async (id: string) => {
    try {
      const { error } = await supabase.from('funcionarios').delete().eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.warn("Erro ao remover do banco, removendo localmente.");
    }
    
    // Remove do localStorage de qualquer tenant
    Object.keys(localStorage).forEach(key => {
        if(key.startsWith('edualloc_funcionarios_')) {
            const list = JSON.parse(localStorage.getItem(key) || '[]');
            const newList = list.filter((x: any) => x.id !== id);
            if (list.length !== newList.length) {
                localStorage.setItem(key, JSON.stringify(newList));
            }
        }
    });
  },

  registrarFrequencia: async (id: string, ocorrencia: OcorrenciaFrequencia, donoId: string) => {
      const presencaConfirmada = ocorrencia === OcorrenciaFrequencia.PRESENCA;
      try {
          const { error } = await supabase.from('funcionarios').update({ presenca_confirmada: presencaConfirmada }).eq('id', id);
          if(error) throw error;
      } catch (e) {
          const current = getLocal(`edualloc_funcionarios_${donoId}`);
          const index = current.findIndex((x: any) => x.id === id);
          if (index >= 0) {
              current[index].presenca_confirmada = presencaConfirmada;
              setLocal(`edualloc_funcionarios_${donoId}`, current);
          }
      }
  }
};
