
export enum Perfil {
  ADMINISTRADOR = 'ADMINISTRADOR',
  RH_COMPLETO = 'RH_COMPLETO',
  GESTOR_ESCOLAR = 'GESTOR_ESCOLAR',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export enum StatusFuncionario {
  ATIVO = 'Ativo',
  INATIVO = 'Inativo',
  LICENCA_MEDICA = 'Licença Médica',
  LICENCA_ESPECIAL = 'Licença Especial',
  LICENCA_MATERNIDADE = 'Licença Maternidade',
  LICENCA_PARTICULAR = 'Licença Interesse Particular',
  FERIAS = 'Férias',
  READAPTADO = 'Readaptado'
}

export enum TipoLotacao {
  EFETIVO = 'Efetivo (a)',
  CONTRATADO = 'Contratado (a)',
  READAPTADO = 'Readaptado (a)'
}

export enum Turno {
  MANHA = 'Matutino',
  TARDE = 'Vespertino',
  NOITE = 'Noturno',
  INTEGRAL = 'Integral'
}

export enum NivelFormacao {
  MEDIO = 'Ensino Médio',
  GRADUACAO = 'Graduação',
  POS_GRADUACAO = 'Pós-Graduação',
  MESTRADO = 'Mestrado',
  DOUTORADO = 'Doutorado',
  POS_DOUTORADO = 'Pós-Doutorado'
}

export enum OcorrenciaFrequencia {
  PRESENCA = 'PRESENTE',
  FALTA_INJUSTIFICADA = 'FALTA',
  ATESTADO = 'ATESTADO'
}

export interface Formacao {
  nivel: NivelFormacao;
  curso: string;
}

export interface Funcao {
  id: string;
  nome: string;
  donoId?: string;
}

export interface Setor {
  id: string;
  nome: string;
  donoId?: string;
}

export interface Documento {
  id: string;
  nome: string;
  url: string;
  tipo: string;
  validade?: string; 
}

export interface HistoricoFrequencia {
  id: string;
  funcionarioId: string;
  data: string;
  status: OcorrenciaFrequencia;
  observacao?: string;
  atestadoUrl?: string;
}

/* Added missing HistoricoLotacao interface */
export interface HistoricoLotacao {
  id: string;
  funcionario_id: string;
  escola_anterior_id?: string;
  escola_nova_id: string;
  data_movimentacao: string;
  // Added dataMovimentacao as it is mapped from data_movimentacao in useEmployeeForm for UI usage
  dataMovimentacao: string;
  motivo?: string;
  escolaAnteriorNome?: string;
  escolaNovaNome: string;
}

/* Added missing RhContact interface */
export interface RhContact {
  id?: string;
  label: string;
  value: string;
  type: 'email' | 'phone';
}

export interface Funcionario {
  id: string;
  nome: string;
  cpf: string;
  matricula: string; 
  email?: string;
  telefone?: string;
  funcaoId: string;
  setorId: string;
  status: StatusFuncionario;
  escolaId: string;
  tipoLotacao: TipoLotacao;
  turnos: Turno[]; 
  cargaHoraria: number; 
  formacoes: Formacao[];
  anoIngresso?: number;
  dataIngresso?: string;
  possuiDobra: boolean; 
  presencaConfirmada: boolean;
  dataUltimaFrequencia?: string;
  donoId: string; 
  fotoUrl?: string; 
  documentos?: Documento[];
}

export interface Escola {
  id: string;
  inep: string; 
  nome: string;
  endereco: string;
  turnosFuncionamento: Turno[]; 
  codigoGestor: string;
  codigoAcesso: string;
  donoId: string;
  notasUnidade?: string;
  logoUrl?: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: Perfil;
  escolaId?: string;
  donoId: string;
}
