import { useState, useEffect, useCallback } from 'react';
import { 
  produtosService, 
  clientesService, 
  vendasService, 
  caixaService, 
  contasService,
  contasBancariasService,
  centrosCustoService,
  categoriasService,
  dreService,
  estoqueService,
  inventarioService,
  authService,
  usuariosService,
  cargosService,
  auditService,
} from '@/services';
import type {
  Produto,
  Cliente,
  Venda,
  VendaFilters,
  CaixaSessao,
  ContaFinanceira,
  ContaFilters,
  MovimentoEstoque,
  MovimentoFilters,
  Usuario,
  AuditLog,
} from '@/services';

// ========================================
// PRODUTOS HOOKS
// ========================================

interface ProdutoFilters {
  search?: string;
  categoria_id?: string;
  ativo?: boolean;
}

export function useProdutos(filters?: ProdutoFilters, page = 1, limit = 20) {
  const [data, setData] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [pages, setPages] = useState(0);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const offset = (currentPage - 1) * limit;
      const result = await produtosService.list({ ...filters, limit, offset });
      setData(result.data);
      setTotal(result.count || 0);
      setPages(Math.ceil((result.count || 0) / limit));
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    data,
    loading,
    error,
    total,
    page: currentPage,
    pages,
    setPage: setCurrentPage,
    refetch: fetch,
  };
}

export function useProduto(id: string | null) {
  const [data, setData] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const result = await produtosService.getById(id);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useProdutosBaixoEstoque() {
  const [data, setData] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await produtosService.getLowStock();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// ========================================
// CLIENTES HOOKS
// ========================================

interface ClienteFilters {
  search?: string;
  ativo?: boolean;
}

export function useClientes(filters?: ClienteFilters, page = 1, limit = 20) {
  const [data, setData] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [pages, setPages] = useState(0);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const offset = (currentPage - 1) * limit;
      const result = await clientesService.list({ ...filters, limit, offset });
      setData(result.data);
      setTotal(result.count || 0);
      setPages(Math.ceil((result.count || 0) / limit));
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    data,
    loading,
    error,
    total,
    page: currentPage,
    pages,
    setPage: setCurrentPage,
    refetch: fetch,
  };
}

export function useCliente(id: string | null) {
  const [data, setData] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const result = await clientesService.getById(id);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useTopClientes(limit = 10) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await clientesService.getTopClientes(limit);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// ========================================
// VENDAS HOOKS
// ========================================

export function useVendas(filters?: VendaFilters, page = 1, limit = 20) {
  const [data, setData] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [pages, setPages] = useState(0);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await vendasService.getVendas(filters, currentPage, limit);
      setData(result.data);
      setTotal(result.total);
      setPages(result.pages);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    data,
    loading,
    error,
    total,
    page: currentPage,
    pages,
    setPage: setCurrentPage,
    refetch: fetch,
  };
}

export function useVenda(id: string | null) {
  const [data, setData] = useState<Venda | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const result = await vendasService.getVendaById(id);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useVendasDia(data?: string) {
  const [resumo, setResumo] = useState<{ quantidade: number; total: number; ticket_medio: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await vendasService.getVendasDia(data);
      setResumo(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data: resumo, loading, error, refetch: fetch };
}

export function useProdutosMaisVendidos(periodo?: { inicio: string; fim: string }, limit = 10) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await vendasService.getProdutosMaisVendidos(periodo, limit);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [periodo, limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useFormasPagamento() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await vendasService.getFormasPagamento();
      setData(result || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// ========================================
// CAIXA HOOKS
// ========================================

export function useCaixaAberto(operadorId?: string) {
  const [data, setData] = useState<CaixaSessao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await caixaService.getCaixaAberto(operadorId);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [operadorId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useCaixaHistorico(options?: {
  operador_id?: string;
  data_inicio?: string;
  data_fim?: string;
  limit?: number;
}) {
  const [data, setData] = useState<CaixaSessao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await caixaService.getHistorico(options);
      setData(result.data);
      setTotal(result.count || 0);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, total, refetch: fetch };
}

export function useCaixaResumoDia(data?: string) {
  const [resumo, setResumo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await caixaService.getResumoDia(data);
      setResumo(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data: resumo, loading, error, refetch: fetch };
}

// ========================================
// FINANCEIRO HOOKS
// ========================================

export function useContas(filters?: ContaFilters, page = 1, limit = 20) {
  const [data, setData] = useState<ContaFinanceira[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [pages, setPages] = useState(0);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await contasService.getContas(filters, currentPage, limit);
      setData(result.data);
      setTotal(result.total);
      setPages(result.pages);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    data,
    loading,
    error,
    total,
    page: currentPage,
    pages,
    setPage: setCurrentPage,
    refetch: fetch,
  };
}

export function useContasVencidas(tipo?: 'pagar' | 'receber') {
  const [data, setData] = useState<ContaFinanceira[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await contasService.getContasVencidas(tipo);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [tipo]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useContasAVencer(dias = 7, tipo?: 'pagar' | 'receber') {
  const [data, setData] = useState<ContaFinanceira[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await contasService.getContasAVencer(dias, tipo);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [dias, tipo]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useResumoFinanceiro(periodo?: { inicio: string; fim: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await contasService.getResumo(periodo);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [periodo]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useContasBancarias() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await contasBancariasService.getContasBancarias();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useCentrosCusto() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await centrosCustoService.getCentrosCusto();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useCategorias(tipo?: 'receita' | 'despesa') {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await categoriasService.getCategorias(tipo);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [tipo]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useDRE(periodo: { inicio: string; fim: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await dreService.getDRE(periodo);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [periodo]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useFluxoCaixa(meses = 3) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await dreService.getFluxoCaixa(meses);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [meses]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// ========================================
// ESTOQUE HOOKS
// ========================================

export function useMovimentosEstoque(filters?: MovimentoFilters, page = 1, limit = 50) {
  const [data, setData] = useState<MovimentoEstoque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [pages, setPages] = useState(0);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await estoqueService.getMovimentos(filters, currentPage, limit);
      setData(result.data);
      setTotal(result.total);
      setPages(result.pages);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    data,
    loading,
    error,
    total,
    page: currentPage,
    pages,
    setPage: setCurrentPage,
    refetch: fetch,
  };
}

export function useValorEstoque() {
  const [data, setData] = useState<{ valorTotal: number; quantidadeItens: number; produtosComEstoque: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await estoqueService.getValorEstoque();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useCurvaABC() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await estoqueService.getCurvaABC();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useInventarios(limit = 10) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await inventarioService.getInventarios(limit);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// ========================================
// AUTH / USUARIOS HOOKS
// ========================================

export function useCurrentUser() {
  const [data, setData] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await authService.getCurrentUser();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useUsuarios(incluirInativos = false) {
  const [data, setData] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await usuariosService.getUsuarios(incluirInativos);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [incluirInativos]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useCargos() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await cargosService.getCargos();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useAuditLogs(filters?: {
  usuario_id?: string;
  modulo?: string;
  acao?: string;
  data_inicio?: string;
  data_fim?: string;
  limite?: number;
}) {
  const [data, setData] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await auditService.getLogs(filters);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// ========================================
// MUTATION HOOKS
// ========================================

export function useMutation<TInput, TResult>(
  mutationFn: (input: TInput) => Promise<TResult>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TResult | null>(null);

  const mutate = useCallback(async (input: TInput) => {
    try {
      setLoading(true);
      setError(null);
      const result = await mutationFn(input);
      setData(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mutationFn]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { mutate, loading, error, data, reset };
}

// Mutation hooks pré-configurados
export const useProdutoMutations = () => ({
  create: useMutation(produtosService.create),
  update: useMutation(({ id, data }: { id: string; data: any }) => 
    produtosService.update(id, data)),
  delete: useMutation(produtosService.delete),
});

export const useClienteMutations = () => ({
  create: useMutation(clientesService.create),
  update: useMutation(({ id, data }: { id: string; data: any }) => 
    clientesService.update(id, data)),
  delete: useMutation(clientesService.delete),
});

export const useVendaMutations = () => ({
  create: useMutation(vendasService.createVenda),
  finalizar: useMutation(({ id, pagamentos }: { id: string; pagamentos: any[] }) => 
    vendasService.finalizarVenda(id, pagamentos)),
  cancelar: useMutation(({ id, motivo }: { id: string; motivo?: string }) => 
    vendasService.cancelarVenda(id, motivo)),
});

export const useCaixaMutations = () => ({
  abrir: useMutation(caixaService.abrir),
  fechar: useMutation(({ id, data }: { id: string; data: any }) => 
    caixaService.fechar(id, data)),
  sangria: useMutation(({ id, data }: { id: string; data: any }) => 
    caixaService.sangria(id, data)),
  suprimento: useMutation(({ id, data }: { id: string; data: any }) => 
    caixaService.suprimento(id, data)),
});

export const useContaMutations = () => ({
  create: useMutation(contasService.createConta),
  pagar: useMutation(({ id, data }: { id: string; data: any }) => 
    contasService.pagarConta(id, data)),
  cancelar: useMutation(contasService.cancelarConta),
  delete: useMutation(contasService.deleteConta),
});

export const useEstoqueMutations = () => ({
  registrarMovimento: useMutation(estoqueService.registrarMovimento),
});

export const useInventarioMutations = () => ({
  iniciar: useMutation(inventarioService.iniciar),
  registrarContagem: useMutation(({ id, produtoId, quantidade }: { id: string; produtoId: string; quantidade: number }) => 
    inventarioService.registrarContagem(id, produtoId, quantidade)),
  finalizar: useMutation(({ id, aplicar }: { id: string; aplicar?: boolean }) => 
    inventarioService.finalizar(id, aplicar)),
  cancelar: useMutation(inventarioService.cancelar),
});
