
import { useState, useEffect, useCallback } from 'react';
import { Funcionario, Escola, Perfil, OcorrenciaFrequencia, StatusFuncionario, RhContact } from '../types.ts';
import { employeeService } from '../services/employeeService.ts';
import { schoolService } from '../services/schoolService.ts';
import { rhContactService } from '../services/rhContactService.ts';
import { useCatalogs } from './useCatalogs.ts';

export const useAppData = (
  usuarioId: string | undefined,
  donoId: string | undefined,
  perfil: Perfil | undefined
) => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [contatosRhGlobais, setContatosRhGlobais] = useState<RhContact[]>([]);

  const { 
    setores, funcoes, carregarCatalogos, 
    adicionarSetor, editarSetor, removerSetor, 
    adicionarFuncao, editarFuncao, removerFuncao 
  } = useCatalogs(donoId);

  const carregarContatosGlobais = useCallback(async () => {
    if (!donoId) return;
    try {
      const data = await rhContactService.getAll(donoId);
      if (data && data.length > 0) {
        setContatosRhGlobais(data);
      } else {
        // Fallback apenas se banco retornar vazio
        setContatosRhGlobais([
          { label: 'Suporte RH Central', value: 'rh@municipio.gov.br', type: 'email' },
          { label: 'Plantão Lotação', value: '(00) 0000-0000', type: 'phone' }
        ]);
      }
    } catch (e) {
      console.error("Erro ao carregar contatos de RH:", e);
    }
  }, [donoId]);

  const recarregarDados = useCallback(async () => {
    if (!donoId) return;

    try {
      carregarCatalogos();
      carregarContatosGlobais();

      const [fData, eData] = await Promise.all([
        employeeService.getAll(donoId),
        schoolService.getAll(donoId)
      ]);

      setFuncionarios(fData);
      setEscolas(eData);

    } catch (e) {
      console.error("Erro crítico no carregamento de dados:", e);
    }
  }, [donoId, carregarCatalogos, carregarContatosGlobais]);

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

  const salvarContatosGlobais = async (novosContatos: RhContact[]) => {
    if (!donoId) return;
    try {
      await rhContactService.sync(donoId, novosContatos);
      setContatosRhGlobais(novosContatos);
    } catch (e: any) {
      console.error("Erro ao sincronizar contatos de RH:", e);
      alert("Erro ao salvar contatos globais no servidor.");
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
    contatosRhGlobais,
    salvarFuncionario,
    removerFuncionario,
    salvarEscola,
    removerEscola,
    salvarContatosGlobais,
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
