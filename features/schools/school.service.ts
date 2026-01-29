
import { supabase } from '../../services/supabase.ts';
import { storageService } from '../../services/storage.service.ts';
import { Escola } from '../../types.ts';

export const schoolService = {
  getAll: async (donoId: string): Promise<Escola[]> => {
    try {
        let query = supabase.from('escolas').select('*');
        if (donoId !== 'SUPER') query = query.eq('dono_id', donoId);
        
        const { data, error } = await query;
        if (error) throw error;

        return (data || []).map((e: any) => ({
            id: e.id,
            inep: e.inep,
            nome: e.nome,
            endereco: e.endereco,
            turnosFuncionamento: e.turnos_funcionamento || [],
            codigoGestor: e.codigo_gestor,
            codigoAcesso: e.codigo_acesso,
            donoId: e.dono_id,
            notasUnidade: e.notas_unidade || '',
            logoUrl: e.logo_url
        }));
    } catch (e) {
        console.error("Erro ao buscar escolas:", e);
        return [];
    }
  },
  
  upsert: async (escola: Partial<Escola>, donoId: string, logoFile?: File) => {
    let logoUrl = escola.logoUrl;
    if (logoFile) {
        const path = `${donoId}/escolas/${escola.id || 'new'}_logo_${Date.now()}`;
        const url = await storageService.uploadFile('fotos', path, logoFile);
        if (url) logoUrl = url;
    }

    const id = escola.id || crypto.randomUUID();
    const isNew = !escola.id;
    
    const payload: any = {};
    if (escola.nome) payload.nome = escola.nome;
    if (escola.inep) payload.inep = escola.inep;
    if (escola.endereco) payload.endereco = escola.endereco;
    if (escola.turnosFuncionamento) payload.turnos_funcionamento = escola.turnosFuncionamento;
    if (escola.codigoGestor) payload.codigo_gestor = escola.codigoGestor;
    if (escola.codigoAcesso) payload.codigo_acesso = escola.codigoAcesso;
    if (escola.notasUnidade !== undefined) payload.notas_unidade = escola.notasUnidade;
    if (logoUrl) payload.logo_url = logoUrl;

    if (isNew) {
        payload.id = id;
        payload.dono_id = donoId;
        const { error } = await supabase.from('escolas').insert(payload);
        if (error) throw error;
    } else {
        const { error } = await supabase.from('escolas').update(payload).eq('id', id);
        if (error) throw error;
    }
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('escolas').delete().eq('id', id);
    if (error) throw error;
  }
};
