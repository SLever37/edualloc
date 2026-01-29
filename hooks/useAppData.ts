
import { useState, useEffect, useCallback } from 'react';
import { Funcionario, Escola, Perfil, OcorrenciaFrequencia, StatusFuncionario } from '../types';
import { employeeService } from '../services/employeeService';
import { schoolService } from '../services/schoolService';
import { useCatalogs } from './useCatalogs';

export const useAppData = (
  usuarioId: string | undefined,
  donoId: string | undefined,
  perfil: Perfil | undefined
) => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);

  const { 
    setores, funcoes, carregarCatalogos, 
    adicionarSetor, editarSetor, removerSetor, 
    adicionarFuncao, editarFuncao, removerFuncao 
  } = useCatalogs(donoId);

  const recarregarDados = useCallback(async () => {
    if (!donoId) return;

    try {
      carregarCatalogos();

      const [fData, eData] = await Promise.all([
        employeeService.getAll(donoId),
        schoolService.getAll(donoId)
      ]);

      setFuncionarios(fData);
      setEscolas(eData);

    } catch (e) {
      console.error("Erro crítico no carregamento de dados:", e);
    }
  }, [donoId, carregarCatalogos]);

  useEffect(() => {
    recarregarDados();
  }, [recarregarDados]);

  const salvarFuncionario = async (dados: Partial<Funcionario>, foto?: File) => {
    if (!donoId) return;
    try {
        await employeeService.save(dados, donoId, foto);
        await recarregarDados();
    } catch (e: any) {
        alert(e.message);
        throw e;
    }
  };

  const removerFuncionario = async (id: string) => {
    if (!donoId) return;
    try {
        await employeeService.delete(id);
        await recarregarDados();
    } catch (e: any) {
        alert("Erro ao remover: " + e.message);
    }
  };

  // Fix: Updated salvarEscola to accept an optional logo file as a second argument, 
  // resolving parameter count mismatch in components calling this hook.
  const salvarEscola = async (dados: Partial<Escola>, logo?: File) => {
    if (!donoId) return;
    try {
        await schoolService.upsert(dados, donoId, logo);
        await recarregarDados();
    } catch (e: any) {
        alert(e.message);
        throw e;
    }
  };

  const removerEscola = async (id: string) => {
    if (!donoId) return;
    try {
        await schoolService.delete(id);
        await recarregarDados();
    } catch (e: any) {
        alert("Erro ao remover unidade: " + e.message);
    }
  };

  const alternarPresenca = async (id: string, ocorrencia: OcorrenciaFrequencia, observacao?: string, statusGeral?: StatusFuncionario, arquivo?: File) => {
    if (!donoId) return;
    try {
        await employeeService.registrarFrequencia(id, ocorrencia, donoId, observacao, statusGeral, arquivo);
        await recarregarDados();
    } catch (e: any) {
        alert("Erro ao registrar frequência: " + e.message);
    }
  };

  const importarEmLote = async (listaFuncionarios: Partial<Funcionario>[]) => {
    if (!donoId) return;
    let erros = 0;
    for (const func of listaFuncionarios) {
      try {
        await employeeService.save(func, donoId);
      } catch (e) {
        erros++;
      }
    }
    if (erros > 0) alert(`${erros} registros falharam na importação.`);
    await recarregarDados();
  };

  return {
    funcionarios,
    escolas,
    setores,
    funcoes,
    salvarFuncionario,
    removerFuncionario,
    salvarEscola,
    removerEscola,
    alternarPresenca,
    importarEmLote,
    adicionarSetor,
    editarSetor,
    removerSetor,
    adicionarFuncao,
    editarFuncao,
    removerFuncao
  };
};
