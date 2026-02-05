import { supabase } from '@/lib/supabase';

// ========================================
// TYPES
// ========================================

export interface MovimentoEstoque {
  id: string;
  empresa_id: string;
  produto_id: string;
  produto?: {
    id: string;
    nome: string;
    codigo: string;
  };
  tipo: 'entrada' | 'saida' | 'ajuste' | 'transferencia';
  quantidade: number;
  quantidade_anterior: number;
  quantidade_atual: number;
  custo_unitario?: number;
  motivo: string;
  documento_tipo?: string;
  documento_id?: string;
  usuario_id?: string;
  usuario?: {
    id: string;
    nome: string;
  };
  observacao?: string;
  created_at: string;
}

export interface CreateMovimento {
  produto_id: string;
  tipo: 'entrada' | 'saida' | 'ajuste';
  quantidade: number;
  custo_unitario?: number;
  motivo: string;
  documento_tipo?: string;
  documento_id?: string;
  observacao?: string;
}

export interface MovimentoFilters {
  produto_id?: string;
  tipo?: 'entrada' | 'saida' | 'ajuste' | 'transferencia';
  data_inicio?: string;
  data_fim?: string;
  motivo?: string;
}

export interface InventarioItem {
  produto_id: string;
  produto: {
    id: string;
    nome: string;
    codigo: string;
    categoria?: string;
    unidade: string;
  };
  estoque_sistema: number;
  estoque_contado?: number;
  diferenca?: number;
  custo_unitario: number;
  valor_total: number;
}

export interface Inventario {
  id: string;
  empresa_id: string;
  data: string;
  status: 'em_andamento' | 'finalizado' | 'cancelado';
  usuario_id: string;
  usuario?: {
    id: string;
    nome: string;
  };
  itens?: InventarioItem[];
  total_itens: number;
  total_valor: number;
  observacao?: string;
  created_at: string;
  finalizado_em?: string;
}

// ========================================
// MOVIMENTAÇÕES DE ESTOQUE
// ========================================

export const estoqueService = {
  // Registrar movimento
  async registrarMovimento(input: CreateMovimento) {
    const { data: { user } } = await supabase.auth.getUser();

    // Buscar quantidade atual do produto
    const { data: produto, error: prodError } = await supabase
      .from('produtos')
      .select('estoque_atual')
      .eq('id', input.produto_id)
      .single() as { data: { estoque_atual: number } | null; error: Error | null };

    if (prodError) throw prodError;
    if (!produto) throw new Error('Produto não encontrado');

    const quantidadeAnterior = produto.estoque_atual || 0;
    let quantidadeAtual = quantidadeAnterior;

    // Calcular nova quantidade
    switch (input.tipo) {
      case 'entrada':
        quantidadeAtual = quantidadeAnterior + input.quantidade;
        break;
      case 'saida':
        quantidadeAtual = quantidadeAnterior - input.quantidade;
        if (quantidadeAtual < 0) {
          throw new Error('Estoque insuficiente');
        }
        break;
      case 'ajuste':
        quantidadeAtual = input.quantidade; // Quantidade absoluta
        break;
    }

    // Registrar movimento
    const { data: movimento, error } = await supabase
      .from('movimentos_estoque')
      .insert({
        produto_id: input.produto_id,
        tipo: input.tipo,
        quantidade: input.quantidade,
        quantidade_anterior: quantidadeAnterior,
        quantidade_atual: quantidadeAtual,
        custo_unitario: input.custo_unitario,
        motivo: input.motivo,
        documento_tipo: input.documento_tipo,
        documento_id: input.documento_id,
        observacao: input.observacao,
        usuario_id: user?.id,
      } as never)
      .select()
      .single();

    if (error) throw error;

    // Atualizar estoque do produto
    const { error: updateError } = await supabase
      .from('produtos')
      .update({ estoque_atual: quantidadeAtual } as never)
      .eq('id', input.produto_id);

    if (updateError) throw updateError;

    return movimento as MovimentoEstoque;
  },

  // Listar movimentos
  async getMovimentos(
    filters?: MovimentoFilters,
    page = 1,
    limit = 50
  ) {
    let query = supabase
      .from('movimentos_estoque')
      .select(`
        *,
        produto:produtos(id, nome, codigo),
        usuario:usuarios(id, nome)
      `, { count: 'exact' });

    if (filters?.produto_id) {
      query = query.eq('produto_id', filters.produto_id);
    }

    if (filters?.tipo) {
      query = query.eq('tipo', filters.tipo);
    }

    if (filters?.motivo) {
      query = query.ilike('motivo', `%${filters.motivo}%`);
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
      data: data as MovimentoEstoque[],
      total: count || 0,
      page,
      limit,
      pages: Math.ceil((count || 0) / limit),
    };
  },

  // Histórico de um produto
  async getHistoricoProduto(produtoId: string, limit = 20) {
    const { data, error } = await supabase
      .from('movimentos_estoque')
      .select(`
        *,
        usuario:usuarios(id, nome)
      `)
      .eq('produto_id', produtoId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as MovimentoEstoque[];
  },

  // Produtos com estoque baixo
  async getProdutosEstoqueBaixo() {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .lte('estoque_atual', supabase.rpc('get_estoque_minimo'))
      .eq('ativo', true)
      .order('estoque_atual', { ascending: true });

    // Fallback se a função RPC não existir
    if (error) {
      const { data: produtos, error: err2 } = await supabase
        .from('produtos')
        .select('*')
        .eq('ativo', true)
        .order('estoque_atual', { ascending: true });

      if (err2) throw err2;
      
      // Filtrar produtos onde estoque_atual <= estoque_minimo
      return (produtos || []).filter((p: any) => 
        p.estoque_atual <= (p.estoque_minimo || 0)
      );
    }

    return data;
  },

  // Produtos sem movimentação
  async getProdutosSemMovimentacao(dias = 30) {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - dias);

    // Buscar produtos que não tiveram movimentação no período
    const { data: movimentados, error: movError } = await supabase
      .from('movimentos_estoque')
      .select('produto_id')
      .gte('created_at', dataLimite.toISOString());

    if (movError) throw movError;

    const idsMovimentados = [...new Set(movimentados?.map((m: any) => m.produto_id) || [])];

    let query = supabase
      .from('produtos')
      .select('*')
      .eq('ativo', true);

    if (idsMovimentados.length > 0) {
      query = query.not('id', 'in', `(${idsMovimentados.join(',')})`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Valor total do estoque
  async getValorEstoque() {
    const { data, error } = await supabase
      .from('produtos')
      .select('estoque_atual, preco_custo')
      .eq('ativo', true)
      .gt('estoque_atual', 0);

    if (error) throw error;

    const valorTotal = (data || []).reduce((acc: number, p: any) => {
      return acc + ((p.estoque_atual || 0) * (p.preco_custo || 0));
    }, 0);

    const quantidadeItens = (data || []).reduce((acc: number, p: any) => {
      return acc + (p.estoque_atual || 0);
    }, 0);

    return {
      valorTotal,
      quantidadeItens,
      produtosComEstoque: data?.length || 0,
    };
  },

  // Curva ABC
  async getCurvaABC() {
    // Buscar vendas dos últimos 90 dias
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - 90);

    const { data: itensVendidos, error } = await supabase
      .from('venda_itens')
      .select(`
        produto_id,
        quantidade,
        total,
        venda:vendas!inner(status, created_at)
      `)
      .eq('venda.status', 'finalizada')
      .gte('venda.created_at', dataInicio.toISOString());

    if (error) throw error;

    // Agrupar por produto
    const agrupado: Record<string, { produto_id: string; quantidade: number; valor: number }> = {};
    
    (itensVendidos || []).forEach((item: any) => {
      if (!agrupado[item.produto_id]) {
        agrupado[item.produto_id] = {
          produto_id: item.produto_id,
          quantidade: 0,
          valor: 0,
        };
      }
      agrupado[item.produto_id].quantidade += item.quantidade;
      agrupado[item.produto_id].valor += item.total;
    });

    // Ordenar por valor
    const ordenado = Object.values(agrupado)
      .sort((a, b) => b.valor - a.valor);

    // Calcular percentuais acumulados
    const valorTotal = ordenado.reduce((acc, item) => acc + item.valor, 0);
    let acumulado = 0;

    return ordenado.map((item, index) => {
      acumulado += item.valor;
      const percentualAcumulado = (acumulado / valorTotal) * 100;
      
      let curva: 'A' | 'B' | 'C';
      if (percentualAcumulado <= 80) {
        curva = 'A';
      } else if (percentualAcumulado <= 95) {
        curva = 'B';
      } else {
        curva = 'C';
      }

      return {
        ...item,
        percentual: (item.valor / valorTotal) * 100,
        percentualAcumulado,
        curva,
        posicao: index + 1,
      };
    });
  },
};

// ========================================
// INVENTÁRIO
// ========================================

export const inventarioService = {
  // Iniciar inventário
  async iniciar(observacao?: string) {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('inventarios')
      .insert({
        data: new Date().toISOString(),
        status: 'em_andamento',
        usuario_id: user?.id,
        observacao,
        total_itens: 0,
        total_valor: 0,
      } as never)
      .select()
      .single();

    if (error) throw error;
    return data as Inventario;
  },

  // Registrar contagem
  async registrarContagem(
    inventarioId: string, 
    produtoId: string, 
    quantidadeContada: number
  ) {
    const { data: produto, error: prodError } = await supabase
      .from('produtos')
      .select('id, nome, codigo, estoque_atual, preco_custo')
      .eq('id', produtoId)
      .single() as { data: { id: string; nome: string; codigo: string; estoque_atual: number; preco_custo: number } | null; error: Error | null };

    if (prodError) throw prodError;
    if (!produto) throw new Error('Produto não encontrado');

    const diferenca = quantidadeContada - (produto.estoque_atual || 0);

    const { data, error } = await supabase
      .from('inventario_itens')
      .upsert({
        inventario_id: inventarioId,
        produto_id: produtoId,
        estoque_sistema: produto!.estoque_atual || 0,
        estoque_contado: quantidadeContada,
        diferenca,
        custo_unitario: produto!.preco_custo || 0,
        valor_diferenca: diferenca * (produto!.preco_custo || 0),
      } as never)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Finalizar inventário (aplicar ajustes)
  async finalizar(inventarioId: string, aplicarAjustes = true) {
    // Buscar itens do inventário
    const { data: itens, error: itensError } = await supabase
      .from('inventario_itens')
      .select('*')
      .eq('inventario_id', inventarioId) as { data: Array<{ produto_id: string; diferenca: number; estoque_contado: number; custo_unitario: number }> | null; error: Error | null };

    if (itensError) throw itensError;

    if (aplicarAjustes) {
      // Aplicar ajustes nos produtos
      for (const item of itens || []) {
        if (item.diferenca !== 0) {
          await estoqueService.registrarMovimento({
            produto_id: item.produto_id,
            tipo: 'ajuste',
            quantidade: item.estoque_contado,
            motivo: `Ajuste de inventário #${inventarioId}`,
            documento_tipo: 'inventario',
            documento_id: inventarioId,
          });
        }
      }
    }

    // Calcular totais
    const totalItens = itens?.length || 0;
    const totalValor = itens?.reduce((acc: number, item: any) => 
      acc + (item.estoque_contado * item.custo_unitario), 0) || 0;

    // Atualizar inventário
    const { data, error } = await supabase
      .from('inventarios')
      .update({
        status: 'finalizado',
        finalizado_em: new Date().toISOString(),
        total_itens: totalItens,
        total_valor: totalValor,
      } as never)
      .eq('id', inventarioId)
      .select()
      .single();

    if (error) throw error;
    return data as Inventario;
  },

  // Cancelar inventário
  async cancelar(inventarioId: string) {
    const { data, error } = await supabase
      .from('inventarios')
      .update({ status: 'cancelado' } as never)
      .eq('id', inventarioId)
      .select()
      .single();

    if (error) throw error;
    return data as Inventario;
  },

  // Listar inventários
  async getInventarios(limit = 10) {
    const { data, error } = await supabase
      .from('inventarios')
      .select(`
        *,
        usuario:usuarios(id, nome)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Inventario[];
  },

  // Buscar inventário com itens
  async getInventarioById(id: string) {
    const { data, error } = await supabase
      .from('inventarios')
      .select(`
        *,
        usuario:usuarios(id, nome),
        itens:inventario_itens(
          *,
          produto:produtos(id, nome, codigo, unidade)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Inventario;
  },
};
