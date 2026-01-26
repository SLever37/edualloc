
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
  DEFINITIVA = 'Definitiva',
  PROVISORIA = 'Provisória',
  SUBSTITUICAO = 'Substituição',
  COMPLEMENTACAO = 'Complementação'
}

export enum Turno {
  MANHA = 'Manhã',
  TARDE = 'Tarde',
  NOITE = 'Noite',
  INTEGRAL = 'Integral',
  ALTERNADO = 'Alternado'
}

export enum OcorrenciaFrequencia {
  PRESENCA = 'Presença',
  FALTA_INJUSTIFICADA = 'Falta Injustificada',
  ATESTADO = 'Atestado Médico',
  ABONO = 'Abono',
  SUSPENSAO = 'Suspensão'
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
  validade?: string; // Data ISO
}

export interface HistoricoLotacao {
  id: string;
  funcionarioId: string;
  escolaAnteriorId?: string;
  escolaNovaId?: string;
  escolaAnteriorNome?: string; // Auxiliar para display
  escolaNovaNome?: string;     // Auxiliar para display
  dataMovimentacao: string;
  motivo?: string;
  usuarioResponsavel?: string;
}

export interface Funcionario {
  id: string;
  nome: string;
  cpf: string;
  matricula: string;
  funcaoId: string;
  setorId: string;
  status: StatusFuncionario;
  escolaId: string;
  
  // Novos Campos de RH
  tipoLotacao: TipoLotacao;
  turno: Turno;
  cargaHorariaSemanal: number;
  
  possuiDobra: boolean;
  presencaConfirmada: boolean; // Mantido para compatibilidade visual rápida
  ultimaOcorrencia?: OcorrenciaFrequencia;
  
  donoId?: string;
  fotoUrl?: string; 
  documentos?: Documento[];
  historico?: HistoricoLotacao[]; // Populado sob demanda
}

export interface Escola {
  id: string;
  nome: string;
  endereco: string;
  codigoGestor: string;
  codigoAcesso: string;
  donoId?: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: Perfil;
  escolaId?: string;
  donoId: string;
}
