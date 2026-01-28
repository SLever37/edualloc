import { supabase } from './base';
import { isSupabaseConfigured } from './supabase';
import { Setor, Funcao } from '../types';

const getLocal = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
const setLocal = (key: string, data: any[]) => localStorage.setItem(key, JSON.stringify(data));

export const catalogService = {
  // --- SETORES ---
  async getSetores(donoId: string): Promise<Setor[]> {
    const localSetores = getLocal(`edualloc_setores_${donoId}`);
    
    if (!isSupabaseConfigured()) {
        return localSetores;
    }

    try {
      const { data, error } = await supabase
        .from('setores')
        .select('*')
        .eq('dono_id', donoId)
        .order('nome');
      
      const dbData = (error || !data) ? [] : data;
      
      const combined = [...dbData];
      localSetores.forEach((l: Setor) => {
          if (!combined.find(c => c.id === l.id)) combined.push(l);
      });
      
      return combined;
    } catch (e) {
      return localSetores;
    }
  },

  async createSetor(nome: string, donoId: string): Promise<Setor> {
    const tempId = crypto.randomUUID();
    const newObj = { id: tempId, nome, dono_id: donoId };

    // 1. Salva Localmente
    const current = getLocal(`edualloc_setores_${donoId}`);
    current.push(newObj);
    setLocal(`edualloc_setores_${donoId}`, current);

    // 2. Tenta Banco (se configurado)
    if (isSupabaseConfigured()) {
        try {
            await supabase.from('setores').insert([newObj]);
        } catch (e) {}
    }

    return newObj as Setor;
  },

  async updateSetor(id: string, nome: string, donoId: string) {
    const current = getLocal(`edualloc_setores_${donoId}`);
    const index = current.findIndex((i: Setor) => i.id === id);
    if (index >= 0) {
        current[index].nome = nome;
        setLocal(`edualloc_setores_${donoId}`, current);
    }

    if (isSupabaseConfigured()) {
        try {
            await supabase.from('setores').update({ nome }).eq('id', id);
        } catch (e) {}
    }
  },

  async deleteSetor(id: string, donoId: string) {
    const current = getLocal(`edualloc_setores_${donoId}`);
    const filtered = current.filter((i: Setor) => i.id !== id);
    setLocal(`edualloc_setores_${donoId}`, filtered);

    if (isSupabaseConfigured()) {
        try {
            await supabase.from('setores').delete().eq('id', id);
        } catch (error) {}
    }
  },

  // --- FUNÇÕES ---
  async getFuncoes(donoId: string): Promise<Funcao[]> {
    const localFuncoes = getLocal(`edualloc_funcoes_${donoId}`);
    
    if (!isSupabaseConfigured()) return localFuncoes;

    try {
      const { data, error } = await supabase
        .from('funcoes')
        .select('*')
        .eq('dono_id', donoId)
        .order('nome');
        
      const dbData = (error || !data) ? [] : data;
      
      const combined = [...dbData];
      localFuncoes.forEach((l: Funcao) => {
          if (!combined.find(c => c.id === l.id)) combined.push(l);
      });

      return combined;
    } catch (e) {
      return localFuncoes;
    }
  },

  async createFuncao(nome: string, donoId: string): Promise<Funcao> {
    const tempId = crypto.randomUUID();
    const newObj = { id: tempId, nome, dono_id: donoId };

    const current = getLocal(`edualloc_funcoes_${donoId}`);
    current.push(newObj);
    setLocal(`edualloc_funcoes_${donoId}`, current);

    if (isSupabaseConfigured()) {
        try {
            await supabase.from('funcoes').insert([newObj]);
        } catch (error) {}
    }
    
    return newObj as Funcao;
  },

  async updateFuncao(id: string, nome: string, donoId: string) {
    const current = getLocal(`edualloc_funcoes_${donoId}`);
    const index = current.findIndex((i: Funcao) => i.id === id);
    if (index >= 0) {
        current[index].nome = nome;
        setLocal(`edualloc_funcoes_${donoId}`, current);
    }

    if (isSupabaseConfigured()) {
        try {
            await supabase.from('funcoes').update({ nome }).eq('id', id);
        } catch (e) {}
    }
  },

  async deleteFuncao(id: string, donoId: string) {
    const current = getLocal(`edualloc_funcoes_${donoId}`);
    const filtered = current.filter((i: Funcao) => i.id !== id);
    setLocal(`edualloc_funcoes_${donoId}`, filtered);

    if (isSupabaseConfigured()) {
        try {
            await supabase.from('funcoes').delete().eq('id', id);
        } catch (error) {}
    }
  }
};