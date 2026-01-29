
import { supabase, uploadFile } from './base';
import { Escola, RhContact } from '../types';

const getLocal = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
const setLocal = (key: string, data: any[]) => localStorage.setItem(key, JSON.stringify(data));

export const schoolService = {
  getAll: async (donoId: string) => {
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
            turnosFuncionamento: e.turnos_functionamento || [],
            codigoGestor: e.codigo_gestor,
            codigoAcesso: e.codigo_acesso,
            donoId: e.dono_id,
            notasUnidade: e.notas_unidade,
            logoUrl: e.logo_url,
            contatosRh: e.contatos_rh || []
        }));
    } catch (e) {
        console.error("Erro ao buscar escolas:", e);
        return getLocal(`edualloc_escolas_${donoId}`);
    }
  },
  
  upsert: async (escola: Partial<Escola>, donoId: string, logoFile?: File) => {
    let logoUrl = escola.logoUrl;
    if (logoFile) {
        const path = `${donoId}/escolas/${escola.id || 'new'}_logo_${Date.now()}`;
        const url = await uploadFile('fotos', path, logoFile);
        if (url) logoUrl = url;
    }

    const id = escola.id || crypto.randomUUID();
    const payload: any = {
        id,
        dono_id: donoId
    };

    if (escola.inep) payload.inep = escola.inep;
    if (escola.nome) payload.nome = escola.nome;
    if (escola.endereco) payload.endereco = escola.endereco;
    if (escola.turnosFuncionamento) payload.turnos_funcionamento = escola.turnosFuncionamento;
    if (escola.codigoGestor) payload.codigo_gestor = escola.codigoGestor;
    if (escola.codigoAcesso) payload.codigo_acesso = escola.codigoAcesso;
    if (escola.notasUnidade !== undefined) payload.notas_unidade = escola.notasUnidade;
    if (logoUrl) payload.logo_url = logoUrl;
    if (escola.contatosRh) payload.contatos_rh = escola.contatosRh;

    const { error } = await supabase.from('escolas').upsert(payload);

    if (error) {
        throw new Error(error.message);
    }

    const current = getLocal(`edualloc_escolas_${donoId}`);
    const index = current.findIndex((x: any) => x.id === id);
    const localPayload = { ...escola, id, donoId, logoUrl };
    if (index >= 0) current[index] = { ...current[index], ...localPayload }; else current.push(localPayload);
    setLocal(`edualloc_escolas_${donoId}`, current);
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('escolas').delete().eq('id', id);
    if (error) throw error;
  }
};
