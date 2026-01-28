import { supabase } from './base';
import { Setor, Funcao } from '../types';

const getLocal = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
const setLocal = (key: string, data: any[]) => localStorage.setItem(key, JSON.stringify(data));

export const catalogService = {
  async getSetores(donoId: string): Promise<Setor[]> {
    const { data, error } = await supabase
      .from('setores')
      .select('*')
      .eq('dono_id', donoId)
      .order('nome');
    
    if (error) {
        console.warn("Usando backup local para setores");
        return getLocal(`edualloc_setores_${donoId}`);
    }
    
    setLocal(`edualloc_setores_${donoId}`, data || []);
    return data || [];
  },

  async createSetor(nome: string, donoId: string): Promise<Setor> {
    const newObj = { nome, dono_id: donoId };
    const { data, error } = await supabase.from('setores').insert([newObj]).select().single();
    
    if (error) {
        alert("Erro ao criar setor no banco: " + error.message);
        throw error;
    }
    return data as Setor;
  },

  async updateSetor(id: string, nome: string) {
    const { error } = await supabase.from('setores').update({ nome }).eq('id', id);
    if (error) throw error;
  },

  async deleteSetor(id: string) {
    const { error } = await supabase.from('setores').delete().eq('id', id);
    if (error) throw error;
  },

  async getFuncoes(donoId: string): Promise<Funcao[]> {
    const { data, error } = await supabase
      .from('funcoes')
      .select('*')
      .eq('dono_id', donoId)
      .order('nome');
        
    if (error) {
        console.warn("Usando backup local para funções");
        return getLocal(`edualloc_funcoes_${donoId}`);
    }

    setLocal(`edualloc_funcoes_${donoId}`, data || []);
    return data || [];
  },

  async createFuncao(nome: string, donoId: string): Promise<Funcao> {
    const newObj = { nome, dono_id: donoId };
    const { data, error } = await supabase.from('funcoes').insert([newObj]).select().single();
    
    if (error) {
        alert("Erro ao criar função no banco: " + error.message);
        throw error;
    }
    return data as Funcao;
  },

  async updateFuncao(id: string, nome: string) {
    const { error } = await supabase.from('funcoes').update({ nome }).eq('id', id);
    if (error) throw error;
  },

  async deleteFuncao(id: string) {
    const { error } = await supabase.from('funcoes').delete().eq('id', id);
    if (error) throw error;
  }
};