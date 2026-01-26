
import { useState, useEffect, useCallback } from 'react';
import { Funcionario, Escola, Perfil, OcorrenciaFrequencia } from '../types';
import { employeeService } from '../services/employeeService';
import { schoolService } from '../services/schoolService';
import { useCatalogs } from './useCatalogs';

// Facade Hook: Mantém compatibilidade com a View, mas usa Arquitetura Limpa por baixo
export const useAppData = (
  usuarioId: string | undefined,
  donoId: string | undefined,
  perfil: Perfil | undefined
) => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);

  // Composição: Usa o hook de catálogos
  const { 
    setores, funcoes, carregarCatalogos, 
    adicionarSetor, editarSetor, removerSetor, 
    adicionarFuncao, editarFuncao, removerFuncao 
  } = useCatalogs(donoId);

  // Carregamento Centralizado
  const recarregarDados = useCallback(async () => {
    if (!donoId) return;

    try {
      carregarCatalogos();

      const [fData, eData] = await Promise.all([
        employeeService.getAll(donoId),
        schoolService.getAll(donoId)
      ]);

      // Mappers
      setFuncionarios(fData.map((f: any) => ({
        ...f,
        funcaoId: f.funcao_id,
        setorId: f.setor_id,
        escolaId: f.escola_id,
        possuiDobra: f.possui_dobra,
        presencaConfirmada: f.presenca_confirmada,
        // Novos campos (com fallback para compatibilidade com dados antigos)
        tipoLotacao: f.tipo_lotacao || 'Definitiva',
        turno: f.turno || 'Manhã',
        cargaHorariaSemanal: f.carga_horaria || 40,
        donoId: f.dono_id,
        fotoUrl: f.foto_url
      })));

      setEscolas(eData.map((e: any) => ({
        ...e,
        codigoGestor: e.codigo_gestor,
        codigoAcesso: e.codigo_acesso,
        donoId: e.dono_id
      })));

    } catch (e) {
      console.error("Erro no carregamento de dados:", e);
    }
  }, [donoId, carregarCatalogos]);

  useEffect(() => {
    recarregarDados();
  }, [recarregarDados]);

  // Actions Wrappers
  const salvarFuncionario = async (dados: Partial<Funcionario>, foto?: File) => {
    if (!donoId) {
        alert("Sessão inválida. Tente recarregar a página.");
        return;
    }
    await employeeService.save(dados, donoId, foto);
    await recarregarDados();
  };

  const removerFuncionario = async (id: string) => {
    if (!donoId) return;
    await employeeService.delete(id);
    await recarregarDados();
  };

  const salvarEscola = async (dados: Partial<Escola>) => {
    if (!donoId) return;
    await schoolService.upsert(dados, donoId);
    await recarregarDados();
  };

  const removerEscola = async (id: string) => {
    if (!donoId) return;
    await schoolService.delete(id);
    await recarregarDados();
  };

  const alternarPresenca = async (id: string, ocorrencia: OcorrenciaFrequencia) => {
    if (!donoId) return;
    await employeeService.registrarFrequencia(id, ocorrencia, donoId);
    await recarregarDados();
  };

  const importarEmLote = async (listaFuncionarios: Partial<Funcionario>[]) => {
    if (!donoId) return;
    // Processamento sequencial para garantir integridade e uploads se necessário
    // Em produção ideal, isso seria um endpoint bulk no backend
    for (const func of listaFuncionarios) {
      await employeeService.save(func, donoId);
    }
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
    // Catálogos
    adicionarSetor,
    editarSetor,
    removerSetor,
    adicionarFuncao,
    editarFuncao,
    removerFuncao
  };
};
