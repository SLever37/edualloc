
import { supabase } from './supabase';
import { Funcionario, Escola, Setor, Funcao } from '../types';

/**
 * API Service Layer - EduAlloc
 * Responsibility: Handle raw DB interactions and Error boundaries.
 */

// Generic fetcher to handle errors consistently
async function fetchData<T>(table: string, donoId?: string): Promise<T[]> {
  let query = supabase.from(table).select('*');
  
  // Apply Tenancy Filter if not Super Admin and donoId exists
  if (donoId && donoId !== 'SUPER') {
    query = query.eq('dono_id', donoId);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error(`Error fetching ${table}:`, error);
    // Fallback for empty tables or connection issues
    return [];
  }
  return data as T[];
}

export const api = {
  // Catalogs
  getSetores: (donoId?: string) => fetchData<any>('setores', donoId),
  getFuncoes: (donoId?: string) => fetchData<any>('funcoes', donoId),
  
  createSetor: async (nome: string, donoId: string) => {
    const { data, error } = await supabase.from('setores').insert([{ nome, dono_id: donoId }]).select().single();
    if (error) throw error;
    return data;
  },
  
  deleteSetor: async (id: string) => {
    const { error } = await supabase.from('setores').delete().eq('id', id);
    if (error) throw error;
  },

  createFuncao: async (nome: string, donoId: string) => {
    const { data, error } = await supabase.from('funcoes').insert([{ nome, dono_id: donoId }]).select().single();
    if (error) throw error;
    return data;
  },

  deleteFuncao: async (id: string) => {
    const { error } = await supabase.from('funcoes').delete().eq('id', id);
    if (error) throw error;
  },

  // Schools
  getEscolas: (donoId?: string) => fetchData<any>('escolas', donoId),
  
  upsertEscola: async (escola: Partial<Escola>, donoId: string) => {
    const payload = {
        nome: escola.nome,
        endereco: escola.endereco,
        codigo_gestor: escola.codigoGestor,
        codigo_acesso: escola.codigoAcesso,
        dono_id: donoId
    };
    
    // If updating
    if (escola.id) {
        const { error } = await supabase.from('escolas').update(payload).eq('id', escola.id);
        if (error) throw error;
    } else {
        const { error } = await supabase.from('escolas').insert([payload]);
        if (error) throw error;
    }
  },

  deleteEscola: async (id: string) => {
    const { error } = await supabase.from('escolas').delete().eq('id', id);
    if (error) throw error;
  },

  // Employees
  getFuncionarios: (donoId?: string) => fetchData<any>('funcionarios', donoId),

  upsertFuncionario: async (func: Partial<Funcionario>, donoId: string) => {
    const payload = {
      nome: func.nome,
      cpf: func.cpf,
      matricula: func.matricula,
      funcao_id: func.funcaoId,
      setor_id: func.setorId,
      status: func.status,
      escola_id: func.escolaId,
      possui_dobra: func.possuiDobra,
      presenca_confirmada: func.presencaConfirmada,
      dono_id: donoId
    };

    if (func.id) {
       const { error } = await supabase.from('funcionarios').update(payload).eq('id', func.id);
       if (error) throw error;
    } else {
       const { error } = await supabase.from('funcionarios').insert([payload]);
       if (error) throw error;
    }
  },

  deleteFuncionario: async (id: string) => {
    const { error } = await supabase.from('funcionarios').delete().eq('id', id);
    if (error) throw error;
  },

  togglePresenca: async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('funcionarios').update({ presenca_confirmada: !currentStatus }).eq('id', id);
    if (error) throw error;
  }
};
