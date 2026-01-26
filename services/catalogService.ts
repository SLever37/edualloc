
import { supabase } from './supabase';
import { Setor, Funcao } from '../types';

// Helpers para armazenamento local
const getLocal = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
const setLocal = (key: string, data: any[]) => localStorage.setItem(key, JSON.stringify(data));

export const catalogService = {
  // --- SETORES ---
  async getSetores(donoId: string): Promise<Setor[]> {
    try {
      // Tenta buscar do banco
      const { data, error } = await supabase
        .from('setores')
        .select('*')
        .eq('dono_id', donoId)
        .order('nome');
      
      // Se der erro no banco (mesmo RLS), não lança exceção, usa array vazio do banco e foca no local
      const dbData = (error || !data) ? [] : data;
      
      // Busca local
      const localSetores = getLocal(`edualloc_setores_${donoId}`);
      
      // Unifica (prioridade para o banco, mas adiciona locais que não subiram ainda)
      const combined = [...dbData];
      localSetores.forEach((l: Setor) => {
          if (!combined.find(c => c.id === l.id)) combined.push(l);
      });
      
      return combined;
    } catch (e) {
      // Fallback total
      return getLocal(`edualloc_setores_${donoId}`);
    }
  },

  async createSetor(nome: string, donoId: string): Promise<Setor> {
    const tempId = crypto.randomUUID();
    const newObj = { id: tempId, nome, dono_id: donoId };

    // 1. Salva Localmente PRIMEIRO (Garantia de UI responsiva)
    const current = getLocal(`edualloc_setores_${donoId}`);
    current.push(newObj);
    setLocal(`edualloc_setores_${donoId}`, current);

    // 2. Tenta sincronizar com o Banco (Background)
    try {
        const { error } = await supabase.from('setores').insert([newObj]);
        if (error) {
            console.error("ERRO CRÍTICO AO SALVAR SETOR NO BANCO:", error);
            console.warn("Verifique se você rodou o script db_setup.sql no Supabase.");
        } else {
            console.log("Setor salvo com sucesso no Supabase!");
        }
    } catch (e) {
        console.warn("Setor salvo offline (Erro de conexão).");
    }

    return newObj as Setor;
  },

  async updateSetor(id: string, nome: string, donoId: string) {
    // 1. Atualiza Local
    const current = getLocal(`edualloc_setores_${donoId}`);
    const index = current.findIndex((i: Setor) => i.id === id);
    if (index >= 0) {
        current[index].nome = nome;
        setLocal(`edualloc_setores_${donoId}`, current);
    }

    // 2. Tenta Atualizar Banco
    try {
        const { error } = await supabase.from('setores').update({ nome }).eq('id', id);
        if (error) console.error("Erro update DB:", error);
    } catch (e) {
        console.warn("Erro update DB:", e);
    }
  },

  async deleteSetor(id: string, donoId: string) {
    // 1. Remove Local
    const current = getLocal(`edualloc_setores_${donoId}`);
    const filtered = current.filter((i: Setor) => i.id !== id);
    setLocal(`edualloc_setores_${donoId}`, filtered);

    // 2. Tenta remover do Banco
    try {
      await supabase.from('setores').delete().eq('id', id);
    } catch (error) {
       console.warn("Erro ao remover do banco (pode já ter sido removido ou RLS):", error);
    }
  },

  // --- FUNÇÕES ---
  async getFuncoes(donoId: string): Promise<Funcao[]> {
    try {
      const { data, error } = await supabase
        .from('funcoes')
        .select('*')
        .eq('dono_id', donoId)
        .order('nome');
        
      const dbData = (error || !data) ? [] : data;
      const localFuncoes = getLocal(`edualloc_funcoes_${donoId}`);
      
      const combined = [...dbData];
      localFuncoes.forEach((l: Funcao) => {
          if (!combined.find(c => c.id === l.id)) combined.push(l);
      });

      return combined;
    } catch (e) {
      return getLocal(`edualloc_funcoes_${donoId}`);
    }
  },

  async createFuncao(nome: string, donoId: string): Promise<Funcao> {
    const tempId = crypto.randomUUID();
    const newObj = { id: tempId, nome, dono_id: donoId };

    // 1. Salva Localmente PRIMEIRO
    const current = getLocal(`edualloc_funcoes_${donoId}`);
    current.push(newObj);
    setLocal(`edualloc_funcoes_${donoId}`, current);

    // 2. Tenta Banco
    try {
        const { error } = await supabase.from('funcoes').insert([newObj]);
        if (error) {
            console.error("ERRO CRÍTICO AO SALVAR FUNÇÃO NO BANCO:", error);
        } else {
            console.log("Função salva com sucesso no Supabase!");
        }
    } catch (error) {
        console.warn("Função salva offline.");
    }
    
    return newObj as Funcao;
  },

  async updateFuncao(id: string, nome: string, donoId: string) {
    // 1. Atualiza Local
    const current = getLocal(`edualloc_funcoes_${donoId}`);
    const index = current.findIndex((i: Funcao) => i.id === id);
    if (index >= 0) {
        current[index].nome = nome;
        setLocal(`edualloc_funcoes_${donoId}`, current);
    }

    // 2. Tenta Atualizar Banco
    try {
        await supabase.from('funcoes').update({ nome }).eq('id', id);
    } catch (e) {
        console.warn("Erro update DB:", e);
    }
  },

  async deleteFuncao(id: string, donoId: string) {
    // 1. Remove Local
    const current = getLocal(`edualloc_funcoes_${donoId}`);
    const filtered = current.filter((i: Funcao) => i.id !== id);
    setLocal(`edualloc_funcoes_${donoId}`, filtered);

    // 2. Tenta Banco
    try {
      await supabase.from('funcoes').delete().eq('id', id);
    } catch (error) {
       console.warn("Erro delete DB:", error);
    }
  }
};
