
import { Escola, Funcionario, StatusFuncionario, TipoLotacao, Turno } from './types';

export const ESCOLAS_INICIAIS: Escola[] = [
  { id: '1', nome: 'E.M. Machado de Assis', endereco: 'Rua das Flores, 123', codigoGestor: 'MA-9921', codigoAcesso: '1234', turnosAtivos: [Turno.MANHA, Turno.TARDE] },
  { id: '2', nome: 'CIEP 201 - Monteiro Lobato', endereco: 'Av. Brasil, 500', codigoGestor: 'ML-1044', codigoAcesso: '1234', turnosAtivos: [Turno.MANHA, Turno.TARDE, Turno.NOITE] },
  { id: '3', nome: 'E.M. Clarice Lispector', endereco: 'Praça da Paz, 10', codigoGestor: 'CL-7723', codigoAcesso: '1234', turnosAtivos: [Turno.MANHA, Turno.TARDE] }
];

export const FUNCIONARIOS_INICIAIS: Funcionario[] = [
  {
    id: 'f1',
    nome: 'José da Silva',
    cpf: '123.456.789-00',
    matricula: '10001-1',
    funcaoId: 'f1',
    setorId: 's1',
    status: StatusFuncionario.ATIVO,
    escolaId: '1',
    possuiDobra: true,
    presencaConfirmada: true,
    tipoLotacao: TipoLotacao.DEFINITIVA,
    turno: Turno.MANHA,
    cargaHorariaSemanal: 40
  }
];
