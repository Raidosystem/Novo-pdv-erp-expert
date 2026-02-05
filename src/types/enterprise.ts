// ============================================
// MULTI-TENANT ENTERPRISE TYPES
// ============================================

// ---- EMPRESA / MULTI-TENANT ----
export interface Empresa {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  regime: 'simples' | 'presumido' | 'real';
  endereco: Endereco;
  telefone: string;
  email: string;
  logo?: string;
  configuracoes: EmpresaConfig;
  status: 'ativa' | 'suspensa' | 'cancelada';
  createdAt: Date;
  updatedAt: Date;
}

export interface EmpresaConfig {
  permitirEstoqueNegativo: boolean;
  metodoValorizacao: 'custo_medio' | 'peps' | 'ueps';
  casasDecimais: number;
  moeda: string;
  timezone: string;
  nfce: NFCeConfig;
  impressao: ImpressaoConfig;
}

export interface NFCeConfig {
  ambiente: 'producao' | 'homologacao';
  serie: number;
  ultimoNumero: number;
  certificado?: string;
  csc?: string;
  idCsc?: string;
}

export interface ImpressaoConfig {
  tipo: 'termica80' | 'termica58' | 'a4';
  modelo?: string;
  porta?: string;
  imprimirAoFinalizar: boolean;
}

export interface Endereco {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  ibge?: string;
}

// ---- USUÁRIOS E PERMISSÕES (RBAC) ----
export interface Usuario {
  id: string;
  empresaId: string;
  email: string;
  nome: string;
  avatar?: string;
  perfilId: string;
  perfil?: Perfil;
  pin?: string; // PIN para operações rápidas no PDV
  ativo: boolean;
  ultimoAcesso?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Perfil {
  id: string;
  empresaId: string;
  nome: string;
  descricao?: string;
  permissoes: Permissao[];
  sistema: boolean; // Perfis padrão do sistema
  createdAt: Date;
}

export interface Permissao {
  modulo: string;
  acoes: ('visualizar' | 'criar' | 'editar' | 'excluir' | 'aprovar')[];
}

// Permissões padrão por módulo
export const MODULOS_PERMISSOES = {
  dashboard: ['visualizar'],
  pdv: ['visualizar', 'criar', 'editar', 'excluir', 'aprovar'],
  caixa: ['visualizar', 'criar', 'editar', 'aprovar'],
  produtos: ['visualizar', 'criar', 'editar', 'excluir'],
  estoque: ['visualizar', 'criar', 'editar', 'aprovar'],
  clientes: ['visualizar', 'criar', 'editar', 'excluir'],
  financeiro: ['visualizar', 'criar', 'editar', 'excluir', 'aprovar'],
  relatorios: ['visualizar'],
  os: ['visualizar', 'criar', 'editar', 'excluir'],
  integracoes: ['visualizar', 'editar'],
  configuracoes: ['visualizar', 'editar'],
  usuarios: ['visualizar', 'criar', 'editar', 'excluir'],
  auditoria: ['visualizar'],
} as const;

// ---- AUDITORIA ----
export interface AuditLog {
  id: string;
  empresaId: string;
  usuarioId: string;
  usuarioNome: string;
  acao: 'criar' | 'editar' | 'excluir' | 'aprovar' | 'login' | 'logout' | 'exportar' | 'cancelar';
  modulo: string;
  entidade: string;
  entidadeId: string;
  dadosAnteriores?: Record<string, unknown>;
  dadosNovos?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

// ---- PRODUTOS ----
export interface Produto {
  id: string;
  empresaId: string;
  codigo: string;
  codigoBarras?: string;
  nome: string;
  descricao?: string;
  categoriaId: string;
  categoria?: Categoria;
  unidade: string;
  
  // Preços
  precoCusto: number;
  precoVenda: number;
  margemLucro: number;
  
  // Estoque
  estoqueAtual: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
  localizacao?: string;
  
  // Fiscal
  ncm?: string;
  cest?: string;
  origem: string;
  cstIcms?: string;
  aliqIcms?: number;
  cstPis?: string;
  aliqPis?: number;
  cstCofins?: string;
  aliqCofins?: number;
  
  // Controle
  ativo: boolean;
  imagem?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Categoria {
  id: string;
  empresaId: string;
  nome: string;
  descricao?: string;
  cor?: string;
  icone?: string;
  ordem: number;
  ativo: boolean;
}

// ---- ESTOQUE ----
export interface MovimentoEstoque {
  id: string;
  empresaId: string;
  produtoId: string;
  produto?: Produto;
  tipo: 'entrada' | 'saida' | 'ajuste' | 'transferencia';
  origem: 'compra' | 'venda' | 'devolucao' | 'inventario' | 'manual' | 'producao';
  quantidade: number;
  quantidadeAnterior: number;
  quantidadePosterior: number;
  custoUnitario: number;
  custoMedioAnterior: number;
  custoMedioPosterior: number;
  documentoTipo?: 'venda' | 'compra' | 'inventario' | 'ajuste';
  documentoId?: string;
  observacao?: string;
  usuarioId: string;
  createdAt: Date;
}

export interface Inventario {
  id: string;
  empresaId: string;
  numero: number;
  descricao?: string;
  status: 'rascunho' | 'em_contagem' | 'finalizado' | 'cancelado';
  dataInicio: Date;
  dataFim?: Date;
  itens: InventarioItem[];
  totalDivergencias: number;
  valorDivergencia: number;
  usuarioId: string;
  createdAt: Date;
}

export interface InventarioItem {
  id: string;
  inventarioId: string;
  produtoId: string;
  produto?: Produto;
  estoqueContabil: number;
  estoqueContado?: number;
  divergencia: number;
  custoUnitario: number;
  valorDivergencia: number;
  observacao?: string;
  contadoPor?: string;
  contadoEm?: Date;
}

// ---- CLIENTES ----
export interface Cliente {
  id: string;
  empresaId: string;
  tipo: 'pf' | 'pj';
  documento: string; // CPF ou CNPJ
  nome: string;
  nomeFantasia?: string;
  email?: string;
  telefone?: string;
  celular?: string;
  endereco?: Endereco;
  
  // Crédito
  limiteCredito: number;
  saldoDevedor: number;
  diasAtraso: number;
  
  // Estatísticas
  totalCompras: number;
  ultimaCompra?: Date;
  ticketMedio: number;
  
  observacoes?: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ---- VENDAS ----
export interface Venda {
  id: string;
  empresaId: string;
  numero: number;
  serie: number;
  
  clienteId?: string;
  cliente?: Cliente;
  vendedorId: string;
  vendedor?: Usuario;
  
  itens: VendaItem[];
  pagamentos: VendaPagamento[];
  
  subtotal: number;
  descontoPercentual: number;
  descontoValor: number;
  acrescimo: number;
  total: number;
  troco: number;
  
  status: 'rascunho' | 'finalizada' | 'cancelada' | 'devolvida';
  motivoCancelamento?: string;
  vendaOriginalId?: string; // Para devoluções
  
  // Fiscal
  nfceNumero?: number;
  nfceChave?: string;
  nfceStatus?: 'pendente' | 'autorizada' | 'rejeitada' | 'cancelada';
  nfceXml?: string;
  
  // Caixa
  caixaSessaoId: string;
  
  observacao?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VendaItem {
  id: string;
  vendaId: string;
  produtoId: string;
  produto?: Produto;
  
  quantidade: number;
  precoUnitario: number;
  custoUnitario: number;
  
  descontoPercentual: number;
  descontoValor: number;
  
  subtotal: number;
  total: number;
  
  // Fiscal
  ncm?: string;
  cfop?: string;
  cstIcms?: string;
  aliqIcms?: number;
  valorIcms?: number;
}

export interface VendaPagamento {
  id: string;
  vendaId: string;
  formaPagamentoId: string;
  formaPagamento?: FormaPagamento;
  
  valor: number;
  troco: number;
  
  // Cartão
  bandeira?: string;
  nsu?: string;
  autorizacao?: string;
  parcelas?: number;
  
  // PIX
  txId?: string;
  endToEnd?: string;
  
  status: 'pendente' | 'confirmado' | 'cancelado';
  createdAt: Date;
}

export interface FormaPagamento {
  id: string;
  empresaId: string;
  nome: string;
  tipo: 'dinheiro' | 'pix' | 'credito' | 'debito' | 'boleto' | 'crediario' | 'outros';
  ativo: boolean;
  taxaPercentual: number;
  taxaFixa: number;
  prazoRecebimento: number; // dias
  ordem: number;
}

// ---- CAIXA ----
export interface CaixaSessao {
  id: string;
  empresaId: string;
  numero: number;
  operadorId: string;
  operador?: Usuario;
  
  status: 'aberto' | 'fechado';
  
  valorAbertura: number;
  valorFechamento?: number;
  valorEsperado?: number;
  diferenca?: number;
  
  // Totais
  totalVendas: number;
  totalCancelamentos: number;
  totalDevolucoes: number;
  totalSangrias: number;
  totalSuprimentos: number;
  quantidadeVendas: number;
  
  // Por forma de pagamento
  totalDinheiro: number;
  totalPix: number;
  totalCredito: number;
  totalDebito: number;
  totalOutros: number;
  
  observacaoAbertura?: string;
  observacaoFechamento?: string;
  
  aberturaEm: Date;
  fechamentoEm?: Date;
}

export interface CaixaMovimento {
  id: string;
  empresaId: string;
  caixaSessaoId: string;
  
  tipo: 'venda' | 'sangria' | 'suprimento' | 'cancelamento' | 'devolucao';
  
  valor: number;
  formaPagamentoId?: string;
  
  documentoTipo?: 'venda' | 'sangria' | 'suprimento';
  documentoId?: string;
  
  observacao?: string;
  usuarioId: string;
  
  createdAt: Date;
}

// ---- FINANCEIRO ----
export interface Conta {
  id: string;
  empresaId: string;
  tipo: 'pagar' | 'receber';
  
  descricao: string;
  categoriaId: string;
  categoria?: CategoriaFinanceira;
  centroCustoId?: string;
  centroCusto?: CentroCusto;
  
  pessoaId?: string;
  pessoaTipo?: 'cliente' | 'fornecedor';
  pessoaNome?: string;
  
  documentoTipo?: 'venda' | 'compra' | 'despesa' | 'receita';
  documentoId?: string;
  documentoNumero?: string;
  
  valorOriginal: number;
  valorPago: number;
  valorRestante: number;
  
  dataEmissao: Date;
  dataVencimento: Date;
  dataPagamento?: Date;
  
  formaPagamentoId?: string;
  
  status: 'pendente' | 'pago' | 'parcial' | 'vencido' | 'cancelado';
  
  recorrente: boolean;
  recorrenciaConfig?: RecorrenciaConfig;
  
  observacao?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecorrenciaConfig {
  frequencia: 'diaria' | 'semanal' | 'mensal' | 'anual';
  intervalo: number;
  diaVencimento?: number;
  dataFim?: Date;
  quantidadeParcelas?: number;
}

export interface CategoriaFinanceira {
  id: string;
  empresaId: string;
  tipo: 'receita' | 'despesa';
  nome: string;
  cor?: string;
  pai?: string;
  ordem: number;
  ativo: boolean;
}

export interface CentroCusto {
  id: string;
  empresaId: string;
  codigo: string;
  nome: string;
  ativo: boolean;
}

export interface Conciliacao {
  id: string;
  empresaId: string;
  contaBancariaId: string;
  
  dataInicio: Date;
  dataFim: Date;
  
  saldoInicial: number;
  saldoFinal: number;
  saldoConciliado: number;
  diferenca: number;
  
  status: 'em_andamento' | 'finalizada';
  
  itens: ConciliacaoItem[];
  
  usuarioId: string;
  createdAt: Date;
  finalizadoEm?: Date;
}

export interface ConciliacaoItem {
  id: string;
  conciliacaoId: string;
  contaId: string;
  conciliado: boolean;
  observacao?: string;
}

// ---- RELATÓRIOS ----
export interface DRE {
  periodo: {
    inicio: Date;
    fim: Date;
  };
  receitas: {
    vendas: number;
    servicos: number;
    outras: number;
    total: number;
  };
  deducoes: {
    impostos: number;
    devolucoes: number;
    descontos: number;
    total: number;
  };
  receitaLiquida: number;
  custos: {
    cmv: number; // Custo Mercadoria Vendida
    servicos: number;
    total: number;
  };
  lucroBruto: number;
  despesas: {
    administrativas: number;
    comerciais: number;
    financeiras: number;
    outras: number;
    total: number;
  };
  lucroOperacional: number;
  resultadoLiquido: number;
  margemBruta: number;
  margemLiquida: number;
}

export interface FluxoCaixa {
  periodo: {
    inicio: Date;
    fim: Date;
  };
  saldoInicial: number;
  entradas: {
    vendas: number;
    recebimentos: number;
    outras: number;
    total: number;
  };
  saidas: {
    fornecedores: number;
    despesas: number;
    salarios: number;
    impostos: number;
    outras: number;
    total: number;
  };
  saldoFinal: number;
  projecao: FluxoCaixaDia[];
}

export interface FluxoCaixaDia {
  data: Date;
  saldoInicial: number;
  entradas: number;
  saidas: number;
  saldoFinal: number;
}

// ---- INTEGRAÇÕES ----
export interface WebhookLog {
  id: string;
  empresaId: string;
  provider: string;
  evento: string;
  payload: Record<string, unknown>;
  status: 'recebido' | 'processando' | 'sucesso' | 'erro' | 'ignorado';
  tentativas: number;
  erro?: string;
  processadoEm?: Date;
  createdAt: Date;
}

export interface IntegracaoConfig {
  id: string;
  empresaId: string;
  provider: string;
  tipo: 'pagamento' | 'fiscal' | 'delivery' | 'marketplace' | 'contabilidade';
  credenciais: Record<string, string>;
  configuracoes: Record<string, unknown>;
  ativo: boolean;
  ultimaSync?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ---- JOBS/FILAS ----
export interface Job {
  id: string;
  empresaId: string;
  tipo: string;
  payload: Record<string, unknown>;
  prioridade: number;
  status: 'pendente' | 'processando' | 'sucesso' | 'erro' | 'cancelado';
  tentativas: number;
  maxTentativas: number;
  erro?: string;
  resultados?: Record<string, unknown>;
  agendadoPara?: Date;
  iniciadoEm?: Date;
  finalizadoEm?: Date;
  createdAt: Date;
}
