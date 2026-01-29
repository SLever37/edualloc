
import { Escola, Funcionario, StatusFuncionario, TipoLotacao, Turno } from './types';

export const ESCOLAS_INICIAIS: Escola[] = [
  // Fix: changed 'turnosAtivos' to 'turnosFuncionamento' and added missing 'inep' and 'donoId' properties
  { id: '1', inep: '12345678', nome: 'E.M. Machado de Assis', endereco: 'Rua das Flores, 123', codigoGestor: 'MA-9921', codigoAcesso: '1234', turnosFuncionamento: [Turno.MANHA, Turno.TARDE], donoId: 'dono1' },
  { id: '2', inep: '23456789', nome: 'CIEP 201 - Monteiro Lobato', endereco: 'Av. Brasil, 500', codigoGestor: 'ML-1044', codigoAcesso: '1234', turnosFuncionamento: [Turno.MANHA, Turno.TARDE, Turno.NOITE], donoId: 'dono1' },
  { id: '3', inep: '34567890', nome: 'E.M. Clarice Lispector', endereco: 'Praça da Paz, 10', codigoGestor: 'CL-7723', codigoAcesso: '1234', turnosFuncionamento: [Turno.MANHA, Turno.TARDE], donoId: 'dono1' }
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
    // Fix: changed 'turno' to 'turnos' (array), 'cargaHorariaSemanal' to 'cargaHoraria', and added 'donoId'
    turnos: [Turno.MANHA],
    cargaHoraria: 40,
    donoId: 'dono1'
  }
];
