
import { supabase } from './base';
import { Escola } from '../types';

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
            turnosFuncionamento: e.turnos_funcionamento || [],
            codigoGestor: e.codigo_gestor,
            codigoAcesso: e.codigo_acesso,
            donoId: e.dono_id
        }));
    } catch (e) {
        console.error("Erro ao buscar escolas:", e);
        return getLocal(`edualloc_escolas_${donoId}`);
    }
  },
  
  upsert: async (escola: Partial<Escola>, donoId: string) => {
    // 1. Validação de INEP (Frontend Guard)
    const inepRegex = /^[0-9]{8}$/;
    if (!escola.inep || !inepRegex.test(escola.inep)) {
        throw new Error("INEP deve ter exatamente 8 dígitos numéricos.");
    }

    const id = escola.id || crypto.randomUUID();
    const payload = {
        id,
        inep: escola.inep,
        nome: escola.nome,
        endereco: escola.endereco,
        turnos_funcionamento: escola.turnosFuncionamento || [], // text[]
        codigo_gestor: escola.codigoGestor,
        codigo_acesso: escola.codigoAcesso,
        dono_id: donoId
    };

    const { error } = await supabase.from('escolas').upsert(payload);

    if (error) {
        // 2. Tratamento de erros de banco (Postgres Codes)
        if (error.code === '23505') throw new Error(`O INEP ${escola.inep} já está cadastrado nesta rede.`);
        if (error.code === '23502') throw new Error("Campos obrigatórios ausentes (INEP/Dono).");
        if (error.message.includes('escolas_inep_formato_ck')) throw new Error("Formato de INEP inválido no banco.");
        throw new Error(error.message);
    }

    // Cache Local para Resiliência
    const current = getLocal(`edualloc_escolas_${donoId}`);
    const index = current.findIndex((x: any) => x.id === id);
    const localPayload = { ...escola, id, donoId };
    if (index >= 0) current[index] = localPayload; else current.push(localPayload);
    setLocal(`edualloc_escolas_${donoId}`, current);
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('escolas').delete().eq('id', id);
    if (error) throw error;
    
    Object.keys(localStorage).forEach(key => {
        if(key.startsWith('edualloc_escolas_')) {
            const list = JSON.parse(localStorage.getItem(key) || '[]');
            const newList = list.filter((x: any) => x.id !== id);
            localStorage.setItem(key, JSON.stringify(newList));
        }
    });
  }
};
