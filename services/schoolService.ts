import { supabase } from './base';
import { isSupabaseConfigured } from './supabase';
import { Escola } from '../types';

const getLocal = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
const setLocal = (key: string, data: any[]) => localStorage.setItem(key, JSON.stringify(data));

export const schoolService = {
  getAll: async (donoId: string) => {
    if (!isSupabaseConfigured()) {
        return getLocal(`edualloc_escolas_${donoId}`);
    }

    try {
        let query = supabase.from('escolas').select('*');
        if (donoId !== 'SUPER') query = query.eq('dono_id', donoId);
        
        const { data, error } = await query;
        if (error) throw error;

        const combined = (data || []).map((e: any) => ({
            ...e,
            turnosAtivos: e.turnos_ativos || [],
            codigoGestor: e.codigo_gestor,
            codigoAcesso: e.codigo_acesso,
            donoId: e.dono_id
        }));
        
        // Merge Local (Fallback)
        const localData = getLocal(`edualloc_escolas_${donoId}`);
        localData.forEach((localItem: any) => {
            if (!combined.find((dbItem: any) => dbItem.id === localItem.id)) {
                combined.push(localItem);
            }
        });
        
        return combined;
    } catch (e) {
        return getLocal(`edualloc_escolas_${donoId}`);
    }
  },
  
  upsert: async (escola: Partial<Escola>, donoId: string) => {
    const id = escola.id || crypto.randomUUID();
    
    if (isSupabaseConfigured()) {
        const payload = {
            id,
            nome: escola.nome,
            endereco: escola.endereco,
            turnos_ativos: escola.turnosAtivos,
            codigo_gestor: escola.codigoGestor,
            codigo_acesso: escola.codigoAcesso,
            dono_id: donoId
        };
        try {
            const { error } = await supabase.from('escolas').upsert(payload);
            if (!error) return; // Sucesso
        } catch (e) {}
    }

    // Salva Localmente
    const current = getLocal(`edualloc_escolas_${donoId}`);
    const index = current.findIndex((x: any) => x.id === id);
    const localPayload = { ...escola, id, donoId };
    
    if (index >= 0) {
        current[index] = localPayload;
    } else {
        current.push(localPayload);
    }
    setLocal(`edualloc_escolas_${donoId}`, current);
  },

  delete: async (id: string) => {
    if (isSupabaseConfigured()) {
        try {
            await supabase.from('escolas').delete().eq('id', id);
        } catch (e) {}
    }
    
    Object.keys(localStorage).forEach(key => {
        if(key.startsWith('edualloc_escolas_')) {
            const list = JSON.parse(localStorage.getItem(key) || '[]');
            const newList = list.filter((x: any) => x.id !== id);
            localStorage.setItem(key, JSON.stringify(newList));
        }
    });
  }
};