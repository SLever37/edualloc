
import { useState, useEffect, useCallback } from 'react';
import { Funcionario, Escola, Perfil, OcorrenciaFrequencia, StatusFuncionario, RhContact } from '../types.ts';
import { employeeService } from '../features/employees/employee.service.ts';
import { schoolService } from '../features/schools/school.service.ts';
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

  const recarregarDados = useCallback(async () => {
    if (!donoId) return;

    try {
      carregarCatalogos();
      
      const [fData, eData, rhData] = await Promise.all([
        employeeService.getAll(donoId),
        schoolService.getAll(donoId),
        rhContactService.getAll(donoId)
      ]);

      setFuncionarios(fData);
      setEscolas(eData);
      setContatosRhGlobais(rhData.length > 0 ? rhData : [
          { label: 'Suporte RH Central', value: 'rh@municipio.gov.br', type: 'email' },
          { label: 'Plantão Lotação', value: '(00) 0000-0000', type: 'phone' }
      ]);

    } catch (e) {
      console.error("Erro no carregamento de dados:", e);
    }
  }, [donoId, carregarCatalogos]);

  useEffect(() => {
    recarregarDados();
  }, [recarregarDados]);

  const salvarFuncionario = async (dados: Partial<Funcionario>, foto?: File) => {
    if (!donoId) return;
    await employeeService.save(dados, donoId, foto);
    await recarregarDados();
  };

  const removerFuncionario = async (id: string) => {
    await employeeService.delete(id);
    await recarregarDados();
  };

  const salvarEscola = async (dados: Partial<Escola>, logo?: File) => {
    if (!donoId) return;
    await schoolService.upsert(dados, donoId, logo);
    await recarregarDados();
  };

  const removerEscola = async (id: string) => {
    await schoolService.delete(id);
    await recarregarDados();
  };

  const salvarContatosGlobais = async (novosContatos: RhContact[]) => {
    if (!donoId) return;
    await rhContactService.sync(donoId, novosContatos);
    setContatosRhGlobais(novosContatos);
  };

  const alternarPresenca = async (id: string, ocorrencia: OcorrenciaFrequencia, observacao?: string, statusGeral?: StatusFuncionario, arquivo?: File) => {
    if (!donoId) return;
    await employeeService.registrarFrequencia(id, ocorrencia, donoId, observacao, statusGeral, arquivo);
    await recarregarDados();
  };

  const importarEmLote = async (listaFuncionarios: Partial<Funcionario>[]) => {
    if (!donoId) return;
    for (const func of listaFuncionarios) {
      try { await employeeService.save(func, donoId); } catch (e) { console.error(e); }
    }
    await recarregarDados();
  };

  return {
    funcionarios, escolas, setores, funcoes, contatosRhGlobais,
    salvarFuncionario, removerFuncionario, salvarEscola, removerEscola, salvarContatosGlobais, alternarPresenca, importarEmLote,
    adicionarSetor, editarSetor, removerSetor, adicionarFuncao, editarFuncao, removerFuncao
  };
};
