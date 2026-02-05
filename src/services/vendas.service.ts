import { supabase } from '@/lib/supabase';

// ========================================
// TYPES
// ========================================

export interface Venda {
  id: string;
  empresa_id: string;
  numero: number;
  cliente_id?: string;
  cliente?: {
    id: string;
    nome: string;
    documento?: string;
  };
  vendedor_id?: string;
  vendedor?: {
    id: string;
    nome: string;
  };
  caixa_sessao_id?: string;
  status: 'pendente' | 'finalizada' | 'cancelada';
  subtotal: number;
  desconto_percentual: number;
  desconto_valor: number;
  total: number;
  observacao?: string;
  created_at: string;
  updated_at: string;
  finalizada_em?: string;
  cancelada_em?: string;
  itens?: VendaItem[];
  pagamentos?: VendaPagamento[];
}

export interface VendaItem {
  id: string;
  venda_id: string;
  produto_id: string;
  produto?: {
    id: string;
    nome: string;
    codigo: string;
  };
  quantidade: number;
  preco_unitario: number;
  desconto_percentual: number;
  desconto_valor: number;
  total: number;
}

export interface VendaPagamento {
  id: string;
  venda_id: string;
  forma_pagamento_id: string;
  forma_pagamento?: {
    id: string;
    nome: string;
    tipo: string;
  };
  valor: number;
  parcelas?: number;
  troco?: number;
}

export interface CreateVendaItem {
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  desconto_percentual?: number;
  desconto_valor?: number;
}

export interface CreateVendaPagamento {
  forma_pagamento_id: string;
  valor: number;
  parcelas?: number;
  troco?: number;
}

export interface CreateVenda {
  cliente_id?: string;
  vendedor_id?: string;
  caixa_sessao_id?: string;
  desconto_percentual?: number;
  desconto_valor?: number;
  observacao?: string;
  itens: CreateVendaItem[];
  pagamentos?: CreateVendaPagamento[];
}

export interface VendaFilters {
  status?: 'pendente' | 'finalizada' | 'cancelada';
  cliente_id?: string;
  vendedor_id?: string;
  data_inicio?: string;
  data_fim?: string;
  busca?: string;
}

// ========================================
// SERVICE FUNCTIONS
// ========================================

export const vendasService = {
  // Listar vendas com filtros
  async getVendas(
    filters?: VendaFilters,
    page = 1,
    limit = 20
  ) {
    let query = supabase
      .from('vendas')
      .select(`
        *,
        cliente:clientes(id, nome, documento),
        vendedor:usuarios(id, nome)
      `, { count: 'exact' });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.cliente_id) {
      query = query.eq('cliente_id', filters.cliente_id);
    }

    if (filters?.vendedor_id) {
      query = query.eq('vendedor_id', filters.vendedor_id);
    }

    if (filters?.data_inicio) {
      query = query.gte('created_at', filters.data_inicio);
    }

    if (filters?.data_fim) {
      query = query.lte('created_at', filters.data_fim);
    }

    const offset = (page - 1) * limit;
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: data as Venda[],
      total: count || 0,
      page,
      limit,
      pages: Math.ceil((count || 0) / limit),
    };
  },

  // Buscar venda por ID com itens e pagamentos
  async getVendaById(id: string) {
    const { data, error } = await supabase
      .from('vendas')
      .select(`
        *,
        cliente:clientes(id, nome, documento, telefone),
        vendedor:usuarios(id, nome),
        itens:venda_itens(
          *,
          produto:produtos(id, nome, codigo)
        ),
        pagamentos:venda_pagamentos(
          *,
          forma_pagamento:formas_pagamento(id, nome, tipo)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Venda;
  },

  // Criar nova venda (modo PDV)
  async createVenda(input: CreateVenda) {
    const { data: { user } } = await supabase.auth.getUser();

    // Calcular totais dos itens
    const itensCalculados = input.itens.map(item => {
      const desconto = (item.desconto_valor || 0) + 
        (item.preco_unitario * item.quantidade * (item.desconto_percentual || 0) / 100);
      const total = (item.preco_unitario * item.quantidade) - desconto;
      return { ...item, total };
    });

    const subtotal = itensCalculados.reduce((acc, item) => acc + (item.preco_unitario * item.quantidade), 0);
    const descontoItens = itensCalculados.reduce((acc, item) => 
      acc + ((item.desconto_valor || 0) + (item.preco_unitario * item.quantidade * (item.desconto_percentual || 0) / 100)), 0);
    
    const descontoGeral = (input.desconto_valor || 0) + 
      (subtotal * (input.desconto_percentual || 0) / 100);
    
    const total = subtotal - descontoItens - descontoGeral;

    // Criar venda
    const { data: venda, error: vendaError } = await supabase
      .from('vendas')
      .insert({
        cliente_id: input.cliente_id,
        vendedor_id: input.vendedor_id || user?.id,
        caixa_sessao_id: input.caixa_sessao_id,
        subtotal,
        desconto_percentual: input.desconto_percentual || 0,
        desconto_valor: descontoGeral,
        total,
        observacao: input.observacao,
        status: 'pendente',
      } as never)
      .select()
      .single() as { data: { id: string } | null; error: Error | null };

    if (vendaError) throw vendaError;
    if (!venda) throw new Error('Erro ao criar venda');

    // Inserir itens
    const itensToInsert = itensCalculados.map(item => ({
      venda_id: venda.id,
      produto_id: item.produto_id,
      quantidade: item.quantidade,
      preco_unitario: item.preco_unitario,
      desconto_percentual: item.desconto_percentual || 0,
      desconto_valor: item.desconto_valor || 0,
      total: item.total,
    }));

    const { error: itensError } = await supabase
      .from('venda_itens')
      .insert(itensToInsert as never);

    if (itensError) throw itensError;

    return await this.getVendaById(venda.id);
  },

  // Finalizar venda (adicionar pagamentos)
  async finalizarVenda(vendaId: string, pagamentos: CreateVendaPagamento[]) {
    // Inserir pagamentos
    const pagamentosToInsert = pagamentos.map(p => ({
      venda_id: vendaId,
      forma_pagamento_id: p.forma_pagamento_id,
      valor: p.valor,
      parcelas: p.parcelas,
      troco: p.troco,
    }));

    const { error: pagError } = await supabase
      .from('venda_pagamentos')
      .insert(pagamentosToInsert as never);

    if (pagError) throw pagError;

    // Atualizar status da venda
    const { error: vendaError } = await supabase
      .from('vendas')
      .update({
        status: 'finalizada',
        finalizada_em: new Date().toISOString(),
      } as never)
      .eq('id', vendaId);

    if (vendaError) throw vendaError;

    return await this.getVendaById(vendaId);
  },

  // Cancelar venda
  async cancelarVenda(vendaId: string, motivo?: string) {
    const { data, error } = await supabase
      .from('vendas')
      .update({
        status: 'cancelada',
        cancelada_em: new Date().toISOString(),
        observacao: motivo,
      } as never)
      .eq('id', vendaId)
      .select()
      .single();

    if (error) throw error;
    return data as Venda;
  },

  // Vendas do dia
  async getVendasDia(data?: string) {
    const hoje = data || new Date().toISOString().split('T')[0];

    const { data: vendas, error } = await supabase
      .from('vendas')
      .select('*')
      .eq('status', 'finalizada')
      .gte('created_at', `${hoje}T00:00:00`)
      .lte('created_at', `${hoje}T23:59:59`);

    if (error) throw error;

    return {
      quantidade: vendas?.length || 0,
      total: vendas?.reduce((acc: number, v: Venda) => acc + v.total, 0) || 0,
      ticket_medio: vendas?.length ? 
        (vendas.reduce((acc: number, v: Venda) => acc + v.total, 0) / vendas.length) : 0,
    };
  },

  // Produtos mais vendidos
  async getProdutosMaisVendidos(periodo?: { inicio: string; fim: string }, limit = 10) {
    let query = supabase
      .from('venda_itens')
      .select(`
        produto_id,
        quantidade,
        total,
        venda:vendas!inner(status, created_at),
        produto:produtos(id, nome, codigo)
      `)
      .eq('venda.status', 'finalizada');

    if (periodo) {
      query = query
        .gte('venda.created_at', periodo.inicio)
        .lte('venda.created_at', periodo.fim);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Agrupar por produto
    const agrupado = (data || []).reduce((acc: Record<string, any>, item: any) => {
      const key = item.produto_id;
      if (!acc[key]) {
        acc[key] = {
          produto: item.produto,
          quantidade_total: 0,
          valor_total: 0,
        };
      }
      acc[key].quantidade_total += item.quantidade;
      acc[key].valor_total += item.total;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(agrupado)
      .sort((a: any, b: any) => b.quantidade_total - a.quantidade_total)
      .slice(0, limit);
  },

  // Formas de pagamento disponíveis
  async getFormasPagamento() {
    const { data, error } = await supabase
      .from('formas_pagamento')
      .select('*')
      .eq('ativo', true)
      .order('nome');

    if (error) throw error;
    return data;
  },
};
