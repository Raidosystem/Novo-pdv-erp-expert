export { useKeyboard } from './useKeyboard';
export { useCart } from './useCart';

// ========================================
// SUPABASE DATA HOOKS
// ========================================

export {
  // Produtos
  useProdutos,
  useProduto,
  useProdutosBaixoEstoque,
  useProdutoMutations,
  
  // Clientes
  useClientes,
  useCliente,
  useTopClientes,
  useClienteMutations,
  
  // Vendas
  useVendas,
  useVenda,
  useVendasDia,
  useProdutosMaisVendidos,
  useFormasPagamento,
  useVendaMutations,
  
  // Caixa
  useCaixaAberto,
  useCaixaHistorico,
  useCaixaResumoDia,
  useCaixaMutations,
  
  // Financeiro
  useContas,
  useContasVencidas,
  useContasAVencer,
  useResumoFinanceiro,
  useContasBancarias,
  useCentrosCusto,
  useCategorias,
  useDRE,
  useFluxoCaixa,
  useContaMutations,
  
  // Estoque
  useMovimentosEstoque,
  useValorEstoque,
  useCurvaABC,
  useInventarios,
  useEstoqueMutations,
  useInventarioMutations,
  
  // Auth/Usuarios
  useCurrentUser,
  useUsuarios,
  useCargos,
  useAuditLogs,
  
  // Generic
  useMutation,
} from './useSupabase';
