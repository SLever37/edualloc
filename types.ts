
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
  PRESENCA = 'Presença',
  FALTA_INJUSTIFICADA = 'Falta Injustificada',
  ATESTADO = 'Atestado Médico',
  ABONO = 'Abono',
  SUSPENSAO = 'Suspensão'
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

export interface HistoricoLotacao {
  id: string;
  funcionarioId: string;
  escolaAnteriorId?: string;
  escolaNovaId?: string;
  escolaAnteriorNome?: string; 
  escolaNovaNome?: string;     
  dataMovimentacao: string;
  motivo?: string;
  usuarioResponsavel?: string;
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
  
  formacoes: Formacao[]; // Substituindo campos únicos por lista
  nivelFormacao?: NivelFormacao; // Mantido para compatibilidade legado se necessário
  cursoFormacao?: string;       // Mantido para compatibilidade legado se necessário
  
  anoIngresso?: number;
  dataIngresso?: string;
  
  possuiDobra: boolean; 
  presencaConfirmada: boolean;
  ultimaOcorrencia?: OcorrenciaFrequencia;
  observacaoFrequencia?: string;
  atestadoUrl?: string;
  
  donoId: string; 
  fotoUrl?: string; 
  documentos?: Documento[];
  historico?: HistoricoLotacao[];
}

export interface RhContact {
  id?: string;
  label: string;
  value: string;
  type: 'phone' | 'email';
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
