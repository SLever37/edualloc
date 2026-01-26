
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

        const localData = getLocal(`edualloc_escolas_${donoId}`);
        const combined = [...(data || [])];
        
        localData.forEach((localItem: any) => {
            if (!combined.find(dbItem => dbItem.id === localItem.id)) {
                combined.push(localItem);
            }
        });
        
        return combined;
    } catch (e) {
        console.warn("Supabase indisponível. Carregando escolas locais.");
        return getLocal(`edualloc_escolas_${donoId}`);
    }
  },
  
  upsert: async (escola: Partial<Escola>, donoId: string) => {
    const id = escola.id || crypto.randomUUID();
    
    const payload = {
        id,
        nome: escola.nome,
        endereco: escola.endereco,
        codigo_gestor: escola.codigoGestor,
        codigo_acesso: escola.codigoAcesso,
        dono_id: donoId
    };
    
    try {
        const { error } = await supabase.from('escolas').upsert(payload);
        if (error) throw error;
    } catch (e) {
        console.warn("Salvando escola localmente (Fallback)");
        const current = getLocal(`edualloc_escolas_${donoId}`);
        const index = current.findIndex((x: any) => x.id === id);
        
        if (index >= 0) {
            current[index] = payload;
        } else {
            current.push(payload);
        }
        setLocal(`edualloc_escolas_${donoId}`, current);
    }
  },

  delete: async (id: string) => {
    try {
        const { error } = await supabase.from('escolas').delete().eq('id', id);
        if (error) throw error;
    } catch (e) {
        console.warn("Tentando remover escola localmente");
    }
    
    Object.keys(localStorage).forEach(key => {
        if(key.startsWith('edualloc_escolas_')) {
            const list = JSON.parse(localStorage.getItem(key) || '[]');
            const newList = list.filter((x: any) => x.id !== id);
            if (list.length !== newList.length) {
                localStorage.setItem(key, JSON.stringify(newList));
            }
        }
    });
  }
};
