import { supabase } from '@/lib/supabase';

// ========================================
// TYPES
// ========================================

export interface ContaFinanceira {
  id: string;
  empresa_id: string;
  tipo: 'pagar' | 'receber';
  status: 'pendente' | 'pago' | 'vencido' | 'cancelado';
  descricao: string;
  valor: number;
  valor_pago?: number;
  data_emissao: string;
  data_vencimento: string;
  data_pagamento?: string;
  categoria_id?: string;
  categoria?: {
    id: string;
    nome: string;
  };
  centro_custo_id?: string;
  centro_custo?: {
    id: string;
    nome: string;
    codigo: string;
  };
  fornecedor_id?: string;
  fornecedor?: {
    id: string;
    nome: string;
  };
  cliente_id?: string;
  cliente?: {
    id: string;
    nome: string;
  };
  forma_pagamento_id?: string;
  forma_pagamento?: {
    id: string;
    nome: string;
  };
  conta_bancaria_id?: string;
  conta_bancaria?: {
    id: string;
    nome: string;
    banco: string;
  };
  documento?: string;
  numero_parcela?: number;
  total_parcelas?: number;
  observacao?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateConta {
  tipo: 'pagar' | 'receber';
  descricao: string;
  valor: number;
  data_emissao?: string;
  data_vencimento: string;
  categoria_id?: string;
  centro_custo_id?: string;
  fornecedor_id?: string;
  cliente_id?: string;
  forma_pagamento_id?: string;
  conta_bancaria_id?: string;
  documento?: string;
  observacao?: string;
  parcelar?: boolean;
  numero_parcelas?: number;
}

export interface PagarContaInput {
  valor_pago: number;
  data_pagamento?: string;
  conta_bancaria_id?: string;
  observacao?: string;
}

export interface ContaFilters {
  tipo?: 'pagar' | 'receber';
  status?: 'pendente' | 'pago' | 'vencido' | 'cancelado';
  categoria_id?: string;
  centro_custo_id?: string;
  fornecedor_id?: string;
  cliente_id?: string;
  data_inicio?: string;
  data_fim?: string;
  busca?: string;
}

export interface CentroCusto {
  id: string;
  empresa_id: string;
  codigo: string;
  nome: string;
  tipo: 'receita' | 'despesa' | 'ambos';
  ativo: boolean;
  pai_id?: string;
  created_at: string;
}

export interface CategoriaFinanceira {
  id: string;
  empresa_id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  ativo: boolean;
  created_at: string;
}

export interface ContaBancaria {
  id: string;
  empresa_id: string;
  nome: string;
  banco: string;
  agencia: string;
  conta: string;
  tipo: 'corrente' | 'poupanca' | 'caixa';
  saldo_inicial: number;
  saldo_atual: number;
  ativo: boolean;
  created_at: string;
}

export interface TransacaoBancaria {
  id: string;
  empresa_id: string;
  conta_bancaria_id: string;
  tipo: 'entrada' | 'saida';
  valor: number;
  descricao: string;
  data_transacao: string;
  conta_financeira_id?: string;
  conciliado: boolean;
  extrato_id?: string;
  created_at: string;
}

// ========================================
// CONTAS A PAGAR/RECEBER
// ========================================

export const contasService = {
  // Listar contas com filtros
  async getContas(
    filters?: ContaFilters,
    page = 1,
    limit = 20
  ) {
    let query = supabase
      .from('contas_financeiras')
      .select(`
        *,
        categoria:categorias_financeiras(id, nome),
        centro_custo:centros_custo(id, nome, codigo),
        fornecedor:fornecedores(id, nome),
        cliente:clientes(id, nome),
        forma_pagamento:formas_pagamento(id, nome),
        conta_bancaria:contas_bancarias(id, nome, banco)
      `, { count: 'exact' });

    if (filters?.tipo) {
      query = query.eq('tipo', filters.tipo);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.categoria_id) {
      query = query.eq('categoria_id', filters.categoria_id);
    }

    if (filters?.centro_custo_id) {
      query = query.eq('centro_custo_id', filters.centro_custo_id);
    }

    if (filters?.fornecedor_id) {
      query = query.eq('fornecedor_id', filters.fornecedor_id);
    }

    if (filters?.cliente_id) {
      query = query.eq('cliente_id', filters.cliente_id);
    }

    if (filters?.data_inicio) {
      query = query.gte('data_vencimento', filters.data_inicio);
    }

    if (filters?.data_fim) {
      query = query.lte('data_vencimento', filters.data_fim);
    }

    if (filters?.busca) {
      query = query.ilike('descricao', `%${filters.busca}%`);
    }

    const offset = (page - 1) * limit;
    query = query
      .order('data_vencimento', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: data as ContaFinanceira[],
      total: count || 0,
      page,
      limit,
      pages: Math.ceil((count || 0) / limit),
    };
  },

  // Buscar conta por ID
  async getContaById(id: string) {
    const { data, error } = await supabase
      .from('contas_financeiras')
      .select(`
        *,
        categoria:categorias_financeiras(id, nome),
        centro_custo:centros_custo(id, nome, codigo),
        fornecedor:fornecedores(id, nome),
        cliente:clientes(id, nome),
        forma_pagamento:formas_pagamento(id, nome),
        conta_bancaria:contas_bancarias(id, nome, banco)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as ContaFinanceira;
  },

  // Criar conta (com opção de parcelamento)
  async createConta(input: CreateConta) {
    if (input.parcelar && input.numero_parcelas && input.numero_parcelas > 1) {
      // Criar múltiplas parcelas
      const valorParcela = input.valor / input.numero_parcelas;
      const contas: any[] = [];

      for (let i = 0; i < input.numero_parcelas; i++) {
        const dataVencimento = new Date(input.data_vencimento);
        dataVencimento.setMonth(dataVencimento.getMonth() + i);

        contas.push({
          tipo: input.tipo,
          descricao: `${input.descricao} (${i + 1}/${input.numero_parcelas})`,
          valor: valorParcela,
          data_emissao: input.data_emissao || new Date().toISOString(),
          data_vencimento: dataVencimento.toISOString(),
          categoria_id: input.categoria_id,
          centro_custo_id: input.centro_custo_id,
          fornecedor_id: input.fornecedor_id,
          cliente_id: input.cliente_id,
          forma_pagamento_id: input.forma_pagamento_id,
          conta_bancaria_id: input.conta_bancaria_id,
          documento: input.documento,
          observacao: input.observacao,
          numero_parcela: i + 1,
          total_parcelas: input.numero_parcelas,
          status: 'pendente',
        });
      }

      const { data, error } = await supabase
        .from('contas_financeiras')
        .insert(contas as never)
        .select();

      if (error) throw error;
      return data as ContaFinanceira[];
    } else {
      // Criar conta única
      const { data, error } = await supabase
        .from('contas_financeiras')
        .insert({
          tipo: input.tipo,
          descricao: input.descricao,
          valor: input.valor,
          data_emissao: input.data_emissao || new Date().toISOString(),
          data_vencimento: input.data_vencimento,
          categoria_id: input.categoria_id,
          centro_custo_id: input.centro_custo_id,
          fornecedor_id: input.fornecedor_id,
          cliente_id: input.cliente_id,
          forma_pagamento_id: input.forma_pagamento_id,
          conta_bancaria_id: input.conta_bancaria_id,
          documento: input.documento,
          observacao: input.observacao,
          status: 'pendente',
        } as never)
        .select()
        .single();

      if (error) throw error;
      return data as ContaFinanceira;
    }
  },

  // Pagar/Receber conta
  async pagarConta(id: string, input: PagarContaInput) {
    const { data, error } = await supabase
      .from('contas_financeiras')
      .update({
        status: 'pago',
        valor_pago: input.valor_pago,
        data_pagamento: input.data_pagamento || new Date().toISOString(),
        conta_bancaria_id: input.conta_bancaria_id,
        observacao: input.observacao,
      } as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ContaFinanceira;
  },

  // Cancelar conta
  async cancelarConta(id: string) {
    const { data, error } = await supabase
      .from('contas_financeiras')
      .update({ status: 'cancelado' } as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ContaFinanceira;
  },

  // Excluir conta
  async deleteConta(id: string) {
    const { error } = await supabase
      .from('contas_financeiras')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // Resumo financeiro
  async getResumo(periodo?: { inicio: string; fim: string }) {
    const hoje = new Date().toISOString().split('T')[0];
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const fimMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString();

    const dataInicio = periodo?.inicio || inicioMes;
    const dataFim = periodo?.fim || fimMes;

    // Buscar todas as contas do período
    const { data: contas, error } = await supabase
      .from('contas_financeiras')
      .select('*')
      .gte('data_vencimento', dataInicio)
      .lte('data_vencimento', dataFim);

    if (error) throw error;

    const resumo = {
      a_pagar: {
        total: 0,
        pendente: 0,
        pago: 0,
        vencido: 0,
      },
      a_receber: {
        total: 0,
        pendente: 0,
        pago: 0,
        vencido: 0,
      },
      saldo: 0,
    };

    contas?.forEach((conta: ContaFinanceira) => {
      if (conta.tipo === 'pagar') {
        resumo.a_pagar.total += conta.valor;
        if (conta.status === 'pendente') resumo.a_pagar.pendente += conta.valor;
        if (conta.status === 'pago') resumo.a_pagar.pago += conta.valor_pago || conta.valor;
        if (conta.status === 'vencido' || 
            (conta.status === 'pendente' && conta.data_vencimento < hoje)) {
          resumo.a_pagar.vencido += conta.valor;
        }
      } else {
        resumo.a_receber.total += conta.valor;
        if (conta.status === 'pendente') resumo.a_receber.pendente += conta.valor;
        if (conta.status === 'pago') resumo.a_receber.pago += conta.valor_pago || conta.valor;
        if (conta.status === 'vencido' || 
            (conta.status === 'pendente' && conta.data_vencimento < hoje)) {
          resumo.a_receber.vencido += conta.valor;
        }
      }
    });

    resumo.saldo = resumo.a_receber.pago - resumo.a_pagar.pago;

    return resumo;
  },

  // Contas vencidas
  async getContasVencidas(tipo?: 'pagar' | 'receber') {
    const hoje = new Date().toISOString().split('T')[0];

    let query = supabase
      .from('contas_financeiras')
      .select(`
        *,
        fornecedor:fornecedores(id, nome),
        cliente:clientes(id, nome)
      `)
      .eq('status', 'pendente')
      .lt('data_vencimento', hoje)
      .order('data_vencimento', { ascending: true });

    if (tipo) {
      query = query.eq('tipo', tipo);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as ContaFinanceira[];
  },

  // Contas a vencer (próximos X dias)
  async getContasAVencer(dias = 7, tipo?: 'pagar' | 'receber') {
    const hoje = new Date();
    const futuro = new Date();
    futuro.setDate(futuro.getDate() + dias);

    let query = supabase
      .from('contas_financeiras')
      .select(`
        *,
        fornecedor:fornecedores(id, nome),
        cliente:clientes(id, nome)
      `)
      .eq('status', 'pendente')
      .gte('data_vencimento', hoje.toISOString())
      .lte('data_vencimento', futuro.toISOString())
      .order('data_vencimento', { ascending: true });

    if (tipo) {
      query = query.eq('tipo', tipo);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as ContaFinanceira[];
  },
};

// ========================================
// CENTROS DE CUSTO
// ========================================

export const centrosCustoService = {
  async getCentrosCusto() {
    const { data, error } = await supabase
      .from('centros_custo')
      .select('*')
      .eq('ativo', true)
      .order('codigo');

    if (error) throw error;
    return data as CentroCusto[];
  },

  async createCentroCusto(input: Omit<CentroCusto, 'id' | 'empresa_id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('centros_custo')
      .insert(input as never)
      .select()
      .single();

    if (error) throw error;
    return data as CentroCusto;
  },

  async updateCentroCusto(id: string, input: Partial<CentroCusto>) {
    const { data, error } = await supabase
      .from('centros_custo')
      .update(input as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as CentroCusto;
  },

  async deleteCentroCusto(id: string) {
    const { error } = await supabase
      .from('centros_custo')
      .update({ ativo: false } as never)
      .eq('id', id);

    if (error) throw error;
    return true;
  },
};

// ========================================
// CATEGORIAS FINANCEIRAS
// ========================================

export const categoriasService = {
  async getCategorias(tipo?: 'receita' | 'despesa') {
    let query = supabase
      .from('categorias_financeiras')
      .select('*')
      .eq('ativo', true)
      .order('nome');

    if (tipo) {
      query = query.eq('tipo', tipo);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as CategoriaFinanceira[];
  },

  async createCategoria(input: { nome: string; tipo: 'receita' | 'despesa' }) {
    const { data, error } = await supabase
      .from('categorias_financeiras')
      .insert(input as never)
      .select()
      .single();

    if (error) throw error;
    return data as CategoriaFinanceira;
  },
};

// ========================================
// CONTAS BANCÁRIAS
// ========================================

export const contasBancariasService = {
  async getContasBancarias() {
    const { data, error } = await supabase
      .from('contas_bancarias')
      .select('*')
      .eq('ativo', true)
      .order('nome');

    if (error) throw error;
    return data as ContaBancaria[];
  },

  async getContaById(id: string) {
    const { data, error } = await supabase
      .from('contas_bancarias')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as ContaBancaria;
  },

  async createContaBancaria(input: Omit<ContaBancaria, 'id' | 'empresa_id' | 'saldo_atual' | 'created_at'>) {
    const { data, error } = await supabase
      .from('contas_bancarias')
      .insert({
        ...input,
        saldo_atual: input.saldo_inicial,
      } as never)
      .select()
      .single();

    if (error) throw error;
    return data as ContaBancaria;
  },

  async updateContaBancaria(id: string, input: Partial<ContaBancaria>) {
    const { data, error } = await supabase
      .from('contas_bancarias')
      .update(input as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ContaBancaria;
  },

  // Transações da conta
  async getTransacoes(contaId: string, filters?: {
    data_inicio?: string;
    data_fim?: string;
    conciliado?: boolean;
  }) {
    let query = supabase
      .from('transacoes_bancarias')
      .select('*')
      .eq('conta_bancaria_id', contaId)
      .order('data_transacao', { ascending: false });

    if (filters?.data_inicio) {
      query = query.gte('data_transacao', filters.data_inicio);
    }

    if (filters?.data_fim) {
      query = query.lte('data_transacao', filters.data_fim);
    }

    if (filters?.conciliado !== undefined) {
      query = query.eq('conciliado', filters.conciliado);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as TransacaoBancaria[];
  },

  // Conciliar transação
  async conciliarTransacao(transacaoId: string, contaFinanceiraId?: string) {
    const { data, error } = await supabase
      .from('transacoes_bancarias')
      .update({
        conciliado: true,
        conta_financeira_id: contaFinanceiraId,
      } as never)
      .eq('id', transacaoId)
      .select()
      .single();

    if (error) throw error;
    return data as TransacaoBancaria;
  },
};

// ========================================
// DRE (Demonstrativo de Resultado)
// ========================================

export const dreService = {
  async getDRE(periodo: { inicio: string; fim: string }) {
    // Buscar todas as contas pagas no período
    const { data: contas, error } = await supabase
      .from('contas_financeiras')
      .select(`
        *,
        categoria:categorias_financeiras(id, nome, tipo)
      `)
      .eq('status', 'pago')
      .gte('data_pagamento', periodo.inicio)
      .lte('data_pagamento', periodo.fim);

    if (error) throw error;

    // Agrupar por categoria
    const receitas: Record<string, { categoria: string; valor: number }> = {};
    const despesas: Record<string, { categoria: string; valor: number }> = {};
    let totalReceitas = 0;
    let totalDespesas = 0;

    contas?.forEach((conta: any) => {
      const valor = conta.valor_pago || conta.valor;
      const categoriaKey = conta.categoria?.id || 'sem-categoria';
      const categoriaNome = conta.categoria?.nome || 'Sem Categoria';

      if (conta.tipo === 'receber') {
        if (!receitas[categoriaKey]) {
          receitas[categoriaKey] = { categoria: categoriaNome, valor: 0 };
        }
        receitas[categoriaKey].valor += valor;
        totalReceitas += valor;
      } else {
        if (!despesas[categoriaKey]) {
          despesas[categoriaKey] = { categoria: categoriaNome, valor: 0 };
        }
        despesas[categoriaKey].valor += valor;
        totalDespesas += valor;
      }
    });

    return {
      receitas: Object.values(receitas),
      despesas: Object.values(despesas),
      totalReceitas,
      totalDespesas,
      lucroLiquido: totalReceitas - totalDespesas,
      margem: totalReceitas > 0 ? ((totalReceitas - totalDespesas) / totalReceitas) * 100 : 0,
    };
  },

  // Fluxo de caixa projetado
  async getFluxoCaixa(meses = 3) {
    const hoje = new Date();
    const resultado: Array<{
      mes: string;
      receitas: number;
      despesas: number;
      saldo: number;
    }> = [];

    for (let i = 0; i < meses; i++) {
      const inicio = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
      const fim = new Date(hoje.getFullYear(), hoje.getMonth() + i + 1, 0);

      const { data: contas, error } = await supabase
        .from('contas_financeiras')
        .select('tipo, valor, status')
        .in('status', ['pendente', 'pago'])
        .gte('data_vencimento', inicio.toISOString())
        .lte('data_vencimento', fim.toISOString());

      if (error) throw error;

      let receitas = 0;
      let despesas = 0;

      contas?.forEach((conta: { tipo: string; valor: number }) => {
        if (conta.tipo === 'receber') {
          receitas += conta.valor;
        } else {
          despesas += conta.valor;
        }
      });

      resultado.push({
        mes: inicio.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        receitas,
        despesas,
        saldo: receitas - despesas,
      });
    }

    return resultado;
  },
};
