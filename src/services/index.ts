// ========================================
// SERVICES INDEX - PDV ERP EXPERT
// ========================================

// Produtos
export * from './produtos.service';

// Clientes
export * from './clientes.service';

// Vendas
export { vendasService } from './vendas.service';
export type { 
  Venda, 
  VendaItem, 
  VendaPagamento, 
  CreateVenda, 
  CreateVendaItem, 
  CreateVendaPagamento,
  VendaFilters 
} from './vendas.service';

// Caixa
export { caixaService } from './caixa.service';
export type { 
  CaixaSessao, 
  CaixaMovimento, 
  AbrirCaixaInput, 
  FecharCaixaInput, 
  MovimentoInput 
} from './caixa.service';

// Financeiro
export { 
  contasService, 
  centrosCustoService, 
  categoriasService, 
  contasBancariasService, 
  dreService 
} from './financeiro.service';
export type { 
  ContaFinanceira, 
  CreateConta, 
  PagarContaInput, 
  ContaFilters,
  CentroCusto,
  CategoriaFinanceira,
  ContaBancaria,
  TransacaoBancaria
} from './financeiro.service';

// Estoque
export { estoqueService, inventarioService } from './estoque.service';
export type { 
  MovimentoEstoque, 
  CreateMovimento, 
  MovimentoFilters,
  Inventario,
  InventarioItem
} from './estoque.service';

// Auth / Usuários / Cargos / Audit
export { 
  authService, 
  usuariosService, 
  cargosService, 
  auditService,
  MODULOS,
  ACOES
} from './auth.service';
export type { 
  Usuario, 
  Cargo, 
  Permissao, 
  CreateUsuario, 
  UpdateUsuario,
  LoginInput,
  AuditLog
} from './auth.service';
