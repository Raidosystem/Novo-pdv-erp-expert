// ============================================
// SERVICES - CAMADA DE ACESSO A DADOS
// Usando tipos flexíveis para compatibilidade
// ============================================

import { supabase } from './supabase';

// ============================================
// PRODUTOS
// ============================================

export const produtosService = {
  async listar(filtros?: {
    busca?: string;
    categoriaId?: string;
    ativo?: boolean;
    pagina?: number;
    limite?: number;
  }) {
    let query = supabase
      .from('produtos')
      .select('*, categoria:categorias_produto(id, nome, cor)', { count: 'exact' });

    if (filtros?.busca) {
      query = query.or(`nome.ilike.%${filtros.busca}%,codigo.ilike.%${filtros.busca}%,codigo_barras.ilike.%${filtros.busca}%`);
    }
    if (filtros?.categoriaId) {
      query = query.eq('categoria_id', filtros.categoriaId);
    }
    if (filtros?.ativo !== undefined) {
      query = query.eq('ativo', filtros.ativo);
    }

    const pagina = filtros?.pagina || 1;
    const limite = filtros?.limite || 50;
    const offset = (pagina - 1) * limite;

    query = query.range(offset, offset + limite - 1).order('nome');

    return query;
  },

  async buscarPorCodigo(codigo: string) {
    return supabase
      .from('produtos')
      .select('*, categoria:categorias_produto(id, nome)')
      .or(`codigo.eq.${codigo},codigo_barras.eq.${codigo}`)
      .eq('ativo', true)
      .single();
  },

  async criar(produto: Record<string, unknown>) {
    return supabase.from('produtos').insert(produto as never).select().single();
  },

  async atualizar(id: string, produto: Record<string, unknown>) {
    return supabase
      .from('produtos')
      .update({ ...produto, updated_at: new Date().toISOString() } as never)
      .eq('id', id)
      .select()
      .single();
  },

  async excluir(id: string) {
    return supabase.from('produtos').update({ ativo: false } as never).eq('id', id);
  },
};

// ============================================
// CLIENTES
// ============================================

export const clientesService = {
  async listar(filtros?: {
    busca?: string;
    ativo?: boolean;
    pagina?: number;
    limite?: number;
  }) {
    let query = supabase
      .from('clientes')
      .select('*', { count: 'exact' });

    if (filtros?.busca) {
      query = query.or(`nome.ilike.%${filtros.busca}%,documento.ilike.%${filtros.busca}%,telefone.ilike.%${filtros.busca}%`);
    }
    if (filtros?.ativo !== undefined) {
      query = query.eq('ativo', filtros.ativo);
    }

    const pagina = filtros?.pagina || 1;
    const limite = filtros?.limite || 50;
    const offset = (pagina - 1) * limite;

    query = query.range(offset, offset + limite - 1).order('nome');

    return query;
  },

  async buscarPorDocumento(documento: string) {
    return supabase
      .from('clientes')
      .select('*')
      .eq('documento', documento)
      .single();
  },

  async criar(cliente: Record<string, unknown>) {
    return supabase.from('clientes').insert(cliente as never).select().single();
  },

  async atualizar(id: string, cliente: Record<string, unknown>) {
    return supabase
      .from('clientes')
      .update({ ...cliente, updated_at: new Date().toISOString() } as never)
      .eq('id', id)
      .select()
      .single();
  },

  async atualizarEstatisticas(clienteId: string, valorCompra: number) {
    const { data: cliente } = await supabase
      .from('clientes')
      .select('total_compras, ultima_compra')
      .eq('id', clienteId)
      .single() as { data: { total_compras: number; ultima_compra: string } | null };

    if (cliente) {
      const totalCompras = (cliente.total_compras || 0) + valorCompra;
      
      await supabase
        .from('clientes')
        .update({
          total_compras: totalCompras,
          ultima_compra: new Date().toISOString(),
          ticket_medio: totalCompras,
        } as never)
        .eq('id', clienteId);
    }
  },
};

// ============================================
// CAIXA
// ============================================

export const caixaService = {
  async sessaoAtual() {
    const result = await supabase
      .from('caixa_sessoes')
      .select('*, operador:usuarios(id, nome)')
      .eq('status', 'aberto')
      .order('abertura_em', { ascending: false })
      .limit(1)
      .single();
    
    return result as { data: CaixaSessao | null; error: Error | null };
  },

  async abrirCaixa(valorAbertura: number, observacao?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const insertData = {
      empresa_id: user?.user_metadata?.empresa_id || '',
      operador_id: user?.id || '',
      valor_abertura: valorAbertura,
      observacao_abertura: observacao || null,
      status: 'aberto',
      total_vendas: 0,
      total_cancelamentos: 0,
      total_devolucoes: 0,
      total_sangrias: 0,
      total_suprimentos: 0,
      quantidade_vendas: 0,
      total_dinheiro: 0,
      total_pix: 0,
      total_credito: 0,
      total_debito: 0,
      total_outros: 0,
      abertura_em: new Date().toISOString(),
    };

    return supabase
      .from('caixa_sessoes')
      .insert(insertData as never)
      .select()
      .single();
  },

  async fecharCaixa(sessaoId: string, valorFechamento: number, observacao?: string) {
    const { data: sessao } = await supabase
      .from('caixa_sessoes')
      .select('*')
      .eq('id', sessaoId)
      .single() as { data: CaixaSessao | null };

    if (!sessao) throw new Error('Sessão não encontrada');

    const valorEsperado =
      sessao.valor_abertura +
      sessao.total_vendas +
      sessao.total_suprimentos -
      sessao.total_sangrias -
      sessao.total_cancelamentos -
      sessao.total_devolucoes;

    const diferenca = valorFechamento - valorEsperado;

    const updateData = {
      status: 'fechado',
      valor_fechamento: valorFechamento,
      valor_esperado: valorEsperado,
      diferenca,
      observacao_fechamento: observacao || null,
      fechamento_em: new Date().toISOString(),
    };

    return supabase
      .from('caixa_sessoes')
      .update(updateData as never)
      .eq('id', sessaoId)
      .select()
      .single();
  },

  async registrarSangria(sessaoId: string, valor: number, observacao?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const insertData = {
      empresa_id: user?.user_metadata?.empresa_id || '',
      caixa_sessao_id: sessaoId,
      tipo: 'sangria',
      valor: -Math.abs(valor),
      observacao: observacao || null,
      usuario_id: user?.id || null,
      forma_pagamento_id: null,
      documento_tipo: null,
      documento_id: null,
    };

    return supabase
      .from('caixa_movimentos')
      .insert(insertData as never)
      .select()
      .single();
  },

  async registrarSuprimento(sessaoId: string, valor: number, observacao?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const insertData = {
      empresa_id: user?.user_metadata?.empresa_id || '',
      caixa_sessao_id: sessaoId,
      tipo: 'suprimento',
      valor: Math.abs(valor),
      observacao: observacao || null,
      usuario_id: user?.id || null,
      forma_pagamento_id: null,
      documento_tipo: null,
      documento_id: null,
    };

    return supabase
      .from('caixa_movimentos')
      .insert(insertData as never)
      .select()
      .single();
  },

  async movimentos(sessaoId: string) {
    return supabase
      .from('caixa_movimentos')
      .select('*, forma_pagamento:formas_pagamento(id, nome)')
      .eq('caixa_sessao_id', sessaoId)
      .order('created_at', { ascending: false });
  },
};

// Types auxiliares
interface CaixaSessao {
  id: string;
  valor_abertura: number;
  total_vendas: number;
  total_suprimentos: number;
  total_sangrias: number;
  total_cancelamentos: number;
  total_devolucoes: number;
  [key: string]: unknown;
}

interface VendaItem {
  produto_id: string;
  quantidade: number;
  custo_unitario: number;
  [key: string]: unknown;
}

interface VendaData {
  id: string;
  numero: number;
  status: string;
  total: number;
  caixa_sessao_id: string;
  itens: VendaItem[];
  [key: string]: unknown;
}

// ============================================
// VENDAS
// ============================================

export const vendasService = {
  async criar(venda: {
    clienteId?: string;
    itens: Array<{
      produtoId: string;
      quantidade: number;
      precoUnitario: number;
      custoUnitario: number;
      descontoPercentual?: number;
      descontoValor?: number;
    }>;
    pagamentos: Array<{
      formaPagamentoId: string;
      valor: number;
      troco?: number;
      bandeira?: string;
      nsu?: string;
      autorizacao?: string;
      parcelas?: number;
      txId?: string;
    }>;
    descontoPercentual?: number;
    descontoValor?: number;
    observacao?: string;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: sessao } = await caixaService.sessaoAtual();

    if (!sessao) throw new Error('Nenhum caixa aberto');

    const subtotal = venda.itens.reduce(
      (acc, item) => acc + item.quantidade * item.precoUnitario,
      0
    );
    const descontoTotal = venda.descontoValor || (subtotal * (venda.descontoPercentual || 0)) / 100;
    const total = subtotal - descontoTotal;
    const totalPago = venda.pagamentos.reduce((acc, p) => acc + p.valor, 0);
    const troco = totalPago - total;

    const vendaInsert = {
      empresa_id: user?.user_metadata?.empresa_id || '',
      cliente_id: venda.clienteId || null,
      vendedor_id: user?.id || '',
      caixa_sessao_id: sessao.id,
      serie: 1,
      subtotal,
      desconto_percentual: venda.descontoPercentual || 0,
      desconto_valor: descontoTotal,
      acrescimo: 0,
      total,
      troco,
      status: 'finalizada',
      observacao: venda.observacao || null,
      motivo_cancelamento: null,
      venda_original_id: null,
      nfce_numero: null,
      nfce_chave: null,
      nfce_status: null,
      nfce_xml: null,
    };

    const { data: vendaCriada, error: vendaError } = await supabase
      .from('vendas')
      .insert(vendaInsert as never)
      .select()
      .single() as { data: { id: string } | null; error: Error | null };

    if (vendaError) throw vendaError;
    if (!vendaCriada) throw new Error('Erro ao criar venda');

    const itensParaInserir = venda.itens.map((item) => ({
      venda_id: vendaCriada.id,
      produto_id: item.produtoId,
      quantidade: item.quantidade,
      preco_unitario: item.precoUnitario,
      custo_unitario: item.custoUnitario,
      desconto_percentual: item.descontoPercentual || 0,
      desconto_valor: item.descontoValor || 0,
      ncm: null,
      cfop: null,
      cst_icms: null,
      aliq_icms: null,
      valor_icms: null,
    }));

    await supabase.from('venda_itens').insert(itensParaInserir as never);

    const pagamentosParaInserir = venda.pagamentos.map((p) => ({
      venda_id: vendaCriada.id,
      forma_pagamento_id: p.formaPagamentoId,
      valor: p.valor,
      troco: p.troco || 0,
      bandeira: p.bandeira || null,
      nsu: p.nsu || null,
      autorizacao: p.autorizacao || null,
      parcelas: p.parcelas || 1,
      tx_id: p.txId || null,
      end_to_end: null,
      status: 'confirmado',
    }));

    await supabase.from('venda_pagamentos').insert(pagamentosParaInserir as never);

    for (const item of venda.itens) {
      await estoqueService.registrarMovimento({
        produtoId: item.produtoId,
        tipo: 'saida',
        origem: 'venda',
        quantidade: item.quantidade,
        custoUnitario: item.custoUnitario,
        documentoTipo: 'venda',
        documentoId: vendaCriada.id,
      });
    }

    for (const p of venda.pagamentos) {
      const movimentoInsert = {
        empresa_id: user?.user_metadata?.empresa_id || '',
        caixa_sessao_id: sessao.id,
        tipo: 'venda',
        valor: p.valor - (p.troco || 0),
        forma_pagamento_id: p.formaPagamentoId,
        documento_tipo: 'venda',
        documento_id: vendaCriada.id,
        usuario_id: user?.id || null,
        observacao: null,
      };
      await supabase.from('caixa_movimentos').insert(movimentoInsert as never);
    }

    if (venda.clienteId) {
      await clientesService.atualizarEstatisticas(venda.clienteId, total);
    }

    return vendaCriada;
  },

  async cancelar(vendaId: string, motivo: string) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: venda } = await supabase
      .from('vendas')
      .select('*, itens:venda_itens(*)')
      .eq('id', vendaId)
      .single() as { data: VendaData | null };

    if (!venda) throw new Error('Venda não encontrada');
    if (venda.status !== 'finalizada') throw new Error('Venda não pode ser cancelada');

    for (const item of venda.itens) {
      await estoqueService.registrarMovimento({
        produtoId: item.produto_id,
        tipo: 'entrada',
        origem: 'devolucao',
        quantidade: item.quantidade,
        custoUnitario: item.custo_unitario,
        documentoTipo: 'venda',
        documentoId: vendaId,
        observacao: `Cancelamento da venda ${venda.numero}`,
      });
    }

    const cancelamentoInsert = {
      empresa_id: user?.user_metadata?.empresa_id || '',
      caixa_sessao_id: venda.caixa_sessao_id,
      tipo: 'cancelamento',
      valor: -venda.total,
      documento_tipo: 'venda',
      documento_id: vendaId,
      observacao: motivo,
      usuario_id: user?.id || null,
      forma_pagamento_id: null,
    };
    await supabase.from('caixa_movimentos').insert(cancelamentoInsert as never);

    return supabase
      .from('vendas')
      .update({ status: 'cancelada', motivo_cancelamento: motivo } as never)
      .eq('id', vendaId)
      .select()
      .single();
  },

  async listar(filtros?: {
    dataInicio?: Date;
    dataFim?: Date;
    status?: string;
    clienteId?: string;
    vendedorId?: string;
    pagina?: number;
    limite?: number;
  }) {
    let query = supabase
      .from('vendas')
      .select('*, cliente:clientes(id, nome), vendedor:usuarios(id, nome), pagamentos:venda_pagamentos(*, forma_pagamento:formas_pagamento(id, nome))', { count: 'exact' });

    if (filtros?.dataInicio) {
      query = query.gte('created_at', filtros.dataInicio.toISOString());
    }
    if (filtros?.dataFim) {
      query = query.lte('created_at', filtros.dataFim.toISOString());
    }
    if (filtros?.status) {
      query = query.eq('status', filtros.status);
    }
    if (filtros?.clienteId) {
      query = query.eq('cliente_id', filtros.clienteId);
    }
    if (filtros?.vendedorId) {
      query = query.eq('vendedor_id', filtros.vendedorId);
    }

    const pagina = filtros?.pagina || 1;
    const limite = filtros?.limite || 50;
    const offset = (pagina - 1) * limite;

    query = query.range(offset, offset + limite - 1).order('created_at', { ascending: false });

    return query;
  },
};

// ============================================
// ESTOQUE
// ============================================

export const estoqueService = {
  async registrarMovimento(movimento: {
    produtoId: string;
    tipo: 'entrada' | 'saida' | 'ajuste';
    origem: 'compra' | 'venda' | 'devolucao' | 'inventario' | 'manual';
    quantidade: number;
    custoUnitario?: number;
    documentoTipo?: string;
    documentoId?: string;
    observacao?: string;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const insertData = {
      empresa_id: user?.user_metadata?.empresa_id || '',
      produto_id: movimento.produtoId,
      tipo: movimento.tipo,
      origem: movimento.origem,
      quantidade: movimento.quantidade,
      custo_unitario: movimento.custoUnitario || 0,
      documento_tipo: movimento.documentoTipo || null,
      documento_id: movimento.documentoId || null,
      observacao: movimento.observacao || null,
      usuario_id: user?.id || null,
    };

    return supabase
      .from('movimentos_estoque')
      .insert(insertData as never)
      .select()
      .single();
  },

  async movimentosProduto(produtoId: string, limite = 50) {
    return supabase
      .from('movimentos_estoque')
      .select('*, usuario:usuarios(id, nome)')
      .eq('produto_id', produtoId)
      .order('created_at', { ascending: false })
      .limit(limite);
  },

  async produtosAbaixoMinimo() {
    return supabase
      .from('produtos')
      .select('*')
      .filter('estoque_atual', 'lt', 'estoque_minimo')
      .eq('ativo', true)
      .order('estoque_atual');
  },

  async ajustarEstoque(produtoId: string, novaQuantidade: number, motivo: string) {
    const { data: produto } = await supabase
      .from('produtos')
      .select('estoque_atual, custo_medio')
      .eq('id', produtoId)
      .single() as { data: { estoque_atual: number; custo_medio: number } | null };

    if (!produto) throw new Error('Produto não encontrado');

    const diferenca = novaQuantidade - produto.estoque_atual;

    return this.registrarMovimento({
      produtoId,
      tipo: 'ajuste',
      origem: 'manual',
      quantidade: Math.abs(diferenca),
      custoUnitario: produto.custo_medio,
      observacao: motivo,
    });
  },
};

// ============================================
// FINANCEIRO
// ============================================

export const financeiroService = {
  async criarConta(conta: Record<string, unknown>) {
    return supabase.from('contas').insert(conta as never).select().single();
  },

  async baixarConta(contaId: string, valorPago: number, dataPagamento: Date) {
    const { data: conta } = await supabase
      .from('contas')
      .select('*')
      .eq('id', contaId)
      .single() as { data: { valor_pago: number; valor_original: number } | null };

    if (!conta) throw new Error('Conta não encontrada');

    const novoValorPago = (conta.valor_pago || 0) + valorPago;
    const novoStatus = novoValorPago >= conta.valor_original ? 'pago' : 'parcial';

    return supabase
      .from('contas')
      .update({
        valor_pago: novoValorPago,
        status: novoStatus,
        data_pagamento: dataPagamento.toISOString(),
      } as never)
      .eq('id', contaId)
      .select()
      .single();
  },

  async listarContas(filtros?: {
    tipo?: 'pagar' | 'receber';
    status?: string;
    dataInicio?: Date;
    dataFim?: Date;
    categoriaId?: string;
    pagina?: number;
    limite?: number;
  }) {
    let query = supabase
      .from('contas')
      .select('*, categoria:categorias_financeiras(id, nome, cor)', { count: 'exact' });

    if (filtros?.tipo) {
      query = query.eq('tipo', filtros.tipo);
    }
    if (filtros?.status) {
      query = query.eq('status', filtros.status);
    }
    if (filtros?.dataInicio) {
      query = query.gte('data_vencimento', filtros.dataInicio.toISOString());
    }
    if (filtros?.dataFim) {
      query = query.lte('data_vencimento', filtros.dataFim.toISOString());
    }
    if (filtros?.categoriaId) {
      query = query.eq('categoria_id', filtros.categoriaId);
    }

    const pagina = filtros?.pagina || 1;
    const limite = filtros?.limite || 50;
    const offset = (pagina - 1) * limite;

    query = query.range(offset, offset + limite - 1).order('data_vencimento');

    return query;
  },

  async resumoFinanceiro(mes: Date) {
    const inicioMes = new Date(mes.getFullYear(), mes.getMonth(), 1);
    const fimMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0);

    const { data: contas } = await supabase
      .from('contas')
      .select('tipo, status, valor_original, valor_pago')
      .gte('data_vencimento', inicioMes.toISOString())
      .lte('data_vencimento', fimMes.toISOString()) as { data: Array<{ tipo: string; status: string; valor_original: number; valor_pago: number }> | null };

    const resumo = {
      receber: { total: 0, pago: 0, pendente: 0, vencido: 0 },
      pagar: { total: 0, pago: 0, pendente: 0, vencido: 0 },
    };

    contas?.forEach((conta) => {
      const tipo = conta.tipo as 'pagar' | 'receber';
      resumo[tipo].total += conta.valor_original;
      resumo[tipo].pago += conta.valor_pago || 0;
      
      if (conta.status === 'pendente') {
        resumo[tipo].pendente += conta.valor_original - (conta.valor_pago || 0);
      } else if (conta.status === 'vencido') {
        resumo[tipo].vencido += conta.valor_original - (conta.valor_pago || 0);
      }
    });

    return resumo;
  },

  async dre(dataInicio: Date, dataFim: Date) {
    const { data: vendas } = await supabase
      .from('vendas')
      .select('total, subtotal, desconto_valor')
      .eq('status', 'finalizada')
      .gte('created_at', dataInicio.toISOString())
      .lte('created_at', dataFim.toISOString()) as { data: Array<{ total: number; subtotal: number; desconto_valor: number }> | null };

    const { data: despesas } = await supabase
      .from('contas')
      .select('valor_pago, categoria:categorias_financeiras(nome)')
      .eq('tipo', 'pagar')
      .eq('status', 'pago')
      .gte('data_pagamento', dataInicio.toISOString())
      .lte('data_pagamento', dataFim.toISOString()) as { data: Array<{ valor_pago: number }> | null };

    const receitaVendas = vendas?.reduce((acc, v) => acc + v.total, 0) || 0;
    const descontos = vendas?.reduce((acc, v) => acc + v.desconto_valor, 0) || 0;
    const totalDespesas = despesas?.reduce((acc, d) => acc + (d.valor_pago || 0), 0) || 0;

    return {
      receitas: {
        vendas: receitaVendas + descontos,
        descontos: -descontos,
        liquida: receitaVendas,
      },
      despesas: { total: totalDespesas },
      resultado: receitaVendas - totalDespesas,
      margem: receitaVendas > 0 ? ((receitaVendas - totalDespesas) / receitaVendas) * 100 : 0,
    };
  },
};

// ============================================
// AUDITORIA
// ============================================

export const auditoriaService = {
  async listar(filtros?: {
    modulo?: string;
    acao?: string;
    usuarioId?: string;
    dataInicio?: Date;
    dataFim?: Date;
    entidade?: string;
    entidadeId?: string;
    pagina?: number;
    limite?: number;
  }) {
    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' });

    if (filtros?.modulo) query = query.eq('modulo', filtros.modulo);
    if (filtros?.acao) query = query.eq('acao', filtros.acao);
    if (filtros?.usuarioId) query = query.eq('usuario_id', filtros.usuarioId);
    if (filtros?.entidade) query = query.eq('entidade', filtros.entidade);
    if (filtros?.entidadeId) query = query.eq('entidade_id', filtros.entidadeId);
    if (filtros?.dataInicio) {
      query = query.gte('created_at', filtros.dataInicio.toISOString());
    }
    if (filtros?.dataFim) {
      query = query.lte('created_at', filtros.dataFim.toISOString());
    }

    const pagina = filtros?.pagina || 1;
    const limite = filtros?.limite || 50;
    const offset = (pagina - 1) * limite;

    query = query.range(offset, offset + limite - 1).order('created_at', { ascending: false });

    return query;
  },

  async historicoEntidade(entidade: string, entidadeId: string) {
    return supabase
      .from('audit_logs')
      .select('*')
      .eq('entidade', entidade)
      .eq('entidade_id', entidadeId)
      .order('created_at', { ascending: false });
  },
};

// ============================================
// RELATÓRIOS
// ============================================

export const relatoriosService = {
  async vendasPorPeriodo(dataInicio: Date, dataFim: Date) {
    return supabase
      .from('vendas')
      .select(`
        created_at,
        total,
        status,
        vendedor:usuarios(id, nome),
        pagamentos:venda_pagamentos(
          valor,
          forma_pagamento:formas_pagamento(id, nome, tipo)
        )
      `)
      .eq('status', 'finalizada')
      .gte('created_at', dataInicio.toISOString())
      .lte('created_at', dataFim.toISOString())
      .order('created_at');
  },

  async vendasPorFormaPagamento(dataInicio: Date, dataFim: Date) {
    const { data: vendas } = await this.vendasPorPeriodo(dataInicio, dataFim) as { data: Array<{ pagamentos: Array<{ forma_pagamento: { nome: string } | null; valor: number }> }> | null };

    const porFormaPagamento: Record<string, { nome: string; total: number; quantidade: number }> = {};

    vendas?.forEach((venda) => {
      venda.pagamentos?.forEach((p) => {
        const nome = p.forma_pagamento?.nome || 'Outros';
        if (!porFormaPagamento[nome]) {
          porFormaPagamento[nome] = { nome, total: 0, quantidade: 0 };
        }
        porFormaPagamento[nome].total += p.valor;
        porFormaPagamento[nome].quantidade += 1;
      });
    });

    return Object.values(porFormaPagamento);
  },

  async vendasPorVendedor(dataInicio: Date, dataFim: Date) {
    const { data: vendas } = await this.vendasPorPeriodo(dataInicio, dataFim) as { data: Array<{ vendedor: { id: string; nome: string } | null; total: number }> | null };

    const porVendedor: Record<string, { nome: string; total: number; quantidade: number }> = {};

    vendas?.forEach((venda) => {
      const vendedor = venda.vendedor;
      const nome = vendedor?.nome || 'Não identificado';
      const id = vendedor?.id || 'unknown';
      
      if (!porVendedor[id]) {
        porVendedor[id] = { nome, total: 0, quantidade: 0 };
      }
      porVendedor[id].total += venda.total;
      porVendedor[id].quantidade += 1;
    });

    return Object.values(porVendedor);
  },

  async produtosMaisVendidos(dataInicio: Date, dataFim: Date, limite = 10) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (supabase.rpc as any)('produtos_mais_vendidos', {
      p_data_inicio: dataInicio.toISOString(),
      p_data_fim: dataFim.toISOString(),
      p_limite: limite,
    });
  },

  async fechamentoCaixa(sessaoId: string) {
    const { data: sessao } = await supabase
      .from('caixa_sessoes')
      .select('*, operador:usuarios(id, nome)')
      .eq('id', sessaoId)
      .single();

    const { data: movimentos } = await supabase
      .from('caixa_movimentos')
      .select('*, forma_pagamento:formas_pagamento(id, nome, tipo)')
      .eq('caixa_sessao_id', sessaoId)
      .order('created_at');

    const { data: vendas } = await supabase
      .from('vendas')
      .select('id, numero, total, status, created_at')
      .eq('caixa_sessao_id', sessaoId)
      .order('created_at');

    return { sessao, movimentos, vendas };
  },
};
