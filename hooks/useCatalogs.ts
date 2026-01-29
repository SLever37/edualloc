
import { useState, useCallback } from 'react';
import { Setor, Funcao } from '../types.ts';
import { catalogService } from '../services/catalogService.ts';

export const useCatalogs = (donoId?: string) => {
  const [setores, setSetores] = useState<Setor[]>([]);
  const [funcoes, setFuncoes] = useState<Funcao[]>([]);

  const carregarCatalogos = useCallback(async () => {
    if (!donoId) return;
    try {
      const [s, f] = await Promise.all([
        catalogService.getSetores(donoId),
        catalogService.getFuncoes(donoId)
      ]);
      setSetores(s);
      setFuncoes(f);
    } catch (e) {
      console.error("Erro ao carregar catálogos", e);
    }
  }, [donoId]);

  const adicionarSetor = async (nome: string) => {
    if (!donoId) {
        alert("Erro de Sessão: ID da organização não encontrado. Tente recarregar a página.");
        return;
    }
    try {
      const novo = await catalogService.createSetor(nome, donoId);
      setSetores(prev => [...prev, novo]);
    } catch (e: any) {
      console.error(e);
      alert("Erro ao criar setor: " + e.message);
    }
  };

  const editarSetor = async (id: string, nome: string) => {
    if (!donoId) return;
    try {
        await catalogService.updateSetor(id, nome);
        setSetores(prev => prev.map(s => s.id === id ? { ...s, nome } : s));
    } catch (e: any) {
        alert("Erro ao editar setor: " + e.message);
    }
  };

  const removerSetor = async (id: string) => {
    if (!donoId) return;
    try {
      await catalogService.deleteSetor(id);
      setSetores(prev => prev.filter(s => s.id !== id));
    } catch (e: any) {
      alert("Não foi possível remover. Verifique sua conexão.");
    }
  };

  const adicionarFuncao = async (nome: string) => {
    if (!donoId) {
        alert("Erro de Sessão: ID da organização não encontrado.");
        return;
    }
    try {
      const nova = await catalogService.createFuncao(nome, donoId);
      setFuncoes(prev => [...prev, nova]);
    } catch (e: any) {
      console.error(e);
      alert("Erro ao criar função: " + e.message);
    }
  };

  const editarFuncao = async (id: string, nome: string) => {
    if (!donoId) return;
    try {
        await catalogService.updateFuncao(id, nome);
        setFuncoes(prev => prev.map(f => f.id === id ? { ...f, nome } : f));
    } catch (e: any) {
        alert("Erro ao editar função: " + e.message);
    }
  };

  const removerFuncao = async (id: string) => {
    if (!donoId) return;
    try {
      await catalogService.deleteFuncao(id);
      setFuncoes(prev => prev.filter(f => f.id !== id));
    } catch (e: any) {
      alert("Não foi possível remover. Verifique sua conexão.");
    }
  };

  return {
    setores,
    funcoes,
    carregarCatalogos,
    adicionarSetor,
    editarSetor,
    removerSetor,
    adicionarFuncao,
    editarFuncao,
    removerFuncao
  };
};
