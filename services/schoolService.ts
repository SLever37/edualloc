
import { supabase, uploadFile } from './base.ts';
import { Escola, RhContact } from '../types.ts';

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
        dono_id: donoId,
        nome: escola.nome,
        inep: escola.inep,
        endereco: escola.endereco,
        turnos_funcionamento: escola.turnosFuncionamento,
        codigo_gestor: escola.codigoGestor,
        codigo_acesso: escola.codigoAcesso,
        notas_unidade: escola.notasUnidade,
        logo_url: logoUrl,
        contatos_rh: escola.contatosRh
    };

    const { error } = await supabase.from('escolas').upsert(payload);
    if (error) throw new Error(error.message);

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
