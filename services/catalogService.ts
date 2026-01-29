
import { supabase } from './base.ts';
import { Setor, Funcao } from '../types.ts';

const getLocal = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
const setLocal = (key: string, data: any[]) => localStorage.setItem(key, JSON.stringify(data));

export const catalogService = {
  async getSetores(donoId: string): Promise<Setor[]> {
    const { data, error } = await supabase
      .from('setores')
      .select('*')
      .eq('dono_id', donoId)
      .order('nome');
    
    if (error) return getLocal(`edualloc_setores_${donoId}`);
    
    setLocal(`edualloc_setores_${donoId}`, data || []);
    return data || [];
  },

  async createSetor(nome: string, donoId: string): Promise<Setor> {
    const { data, error } = await supabase.from('setores').insert([{ nome, dono_id: donoId }]).select().single();
    if (error) throw error;
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
        
    if (error) return getLocal(`edualloc_funcoes_${donoId}`);

    setLocal(`edualloc_funcoes_${donoId}`, data || []);
    return data || [];
  },

  async createFuncao(nome: string, donoId: string): Promise<Funcao> {
    const { data, error } = await supabase.from('funcoes').insert([{ nome, dono_id: donoId }]).select().single();
    if (error) throw error;
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
