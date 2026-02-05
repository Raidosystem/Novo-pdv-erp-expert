import { supabase } from '@/lib/supabase';

// ========================================
// TYPES
// ========================================

export interface CaixaSessao {
  id: string;
  empresa_id: string;
  numero: number;
  operador_id: string;
  operador?: {
    id: string;
    nome: string;
  };
  status: 'aberto' | 'fechado';
  valor_abertura: number;
  valor_fechamento?: number;
  valor_esperado?: number;
  diferenca?: number;
  total_vendas: number;
  total_cancelamentos: number;
  total_devolucoes: number;
  total_sangrias: number;
  total_suprimentos: number;
  quantidade_vendas: number;
  total_dinheiro: number;
  total_pix: number;
  total_credito: number;
  total_debito: number;
  total_outros: number;
  observacao_abertura?: string;
  observacao_fechamento?: string;
  abertura_em: string;
  fechamento_em?: string;
}

export interface CaixaMovimento {
  id: string;
  empresa_id: string;
  caixa_sessao_id: string;
  tipo: 'venda' | 'sangria' | 'suprimento' | 'cancelamento' | 'devolucao';
  valor: number;
  forma_pagamento_id?: string;
  forma_pagamento?: {
    id: string;
    nome: string;
    tipo: string;
  };
  documento_tipo?: string;
  documento_id?: string;
  observacao?: string;
  usuario_id?: string;
  created_at: string;
}

export interface AbrirCaixaInput {
  valor_abertura: number;
  observacao_abertura?: string;
}

export interface FecharCaixaInput {
  valor_fechamento: number;
  observacao_fechamento?: string;
}

export interface MovimentoInput {
  tipo: 'sangria' | 'suprimento';
  valor: number;
  observacao?: string;
}

// ========================================
// SERVICE FUNCTIONS
// ========================================

export const caixaService = {
  // Verificar se há caixa aberto para o operador
  async getCaixaAberto(operadorId?: string) {
    let query = supabase
      .from('caixa_sessoes')
      .select(`
        *,
        operador:usuarios(id, nome)
      `)
      .eq('status', 'aberto');

    if (operadorId) {
      query = query.eq('operador_id', operadorId);
    }

    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data as CaixaSessao | null;
  },

  // Abrir caixa
  async abrir(input: AbrirCaixaInput) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Verificar se já tem caixa aberto
    const caixaAberto = await this.getCaixaAberto(user.id);
    if (caixaAberto) {
      throw new Error('Já existe um caixa aberto para este operador');
    }

    const { data, error } = await supabase
      .from('caixa_sessoes')
      .insert({
        operador_id: user.id,
        valor_abertura: input.valor_abertura,
        observacao_abertura: input.observacao_abertura,
        status: 'aberto',
      } as never)
      .select()
      .single();

    if (error) throw error;
    return data as CaixaSessao;
  },

  // Fechar caixa
  async fechar(sessaoId: string, input: FecharCaixaInput) {
    // Buscar sessão atual
    const { data: sessao, error: fetchError } = await supabase
      .from('caixa_sessoes')
      .select('*')
      .eq('id', sessaoId)
      .single() as { data: { valor_abertura: number; total_dinheiro: number; total_sangrias: number; total_suprimentos: number } | null; error: Error | null };

    if (fetchError) throw fetchError;

    // Calcular valor esperado
    const valorEsperado = 
      sessao!.valor_abertura +
      sessao!.total_dinheiro -
      sessao!.total_sangrias +
      sessao!.total_suprimentos;

    const diferenca = input.valor_fechamento - valorEsperado;

    const { data, error } = await supabase
      .from('caixa_sessoes')
      .update({
        status: 'fechado',
        valor_fechamento: input.valor_fechamento,
        valor_esperado: valorEsperado,
        diferenca,
        observacao_fechamento: input.observacao_fechamento,
        fechamento_em: new Date().toISOString(),
      } as never)
      .eq('id', sessaoId)
      .select()
      .single();

    if (error) throw error;
    return data as CaixaSessao;
  },

  // Registrar sangria
  async sangria(sessaoId: string, input: MovimentoInput) {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('caixa_movimentos')
      .insert({
        caixa_sessao_id: sessaoId,
        tipo: 'sangria',
        valor: input.valor,
        observacao: input.observacao,
        usuario_id: user?.id,
      } as never)
      .select()
      .single();

    if (error) throw error;
    return data as CaixaMovimento;
  },

  // Registrar suprimento
  async suprimento(sessaoId: string, input: MovimentoInput) {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('caixa_movimentos')
      .insert({
        caixa_sessao_id: sessaoId,
        tipo: 'suprimento',
        valor: input.valor,
        observacao: input.observacao,
        usuario_id: user?.id,
      } as never)
      .select()
      .single();

    if (error) throw error;
    return data as CaixaMovimento;
  },

  // Listar movimentos da sessão
  async getMovimentos(sessaoId: string) {
    const { data, error } = await supabase
      .from('caixa_movimentos')
      .select(`
        *,
        forma_pagamento:formas_pagamento(id, nome, tipo)
      `)
      .eq('caixa_sessao_id', sessaoId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as CaixaMovimento[];
  },

  // Histórico de sessões
  async getHistorico(options?: {
    operador_id?: string;
    data_inicio?: string;
    data_fim?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('caixa_sessoes')
      .select(`
        *,
        operador:usuarios(id, nome)
      `, { count: 'exact' })
      .eq('status', 'fechado')
      .order('fechamento_em', { ascending: false });

    if (options?.operador_id) {
      query = query.eq('operador_id', options.operador_id);
    }

    if (options?.data_inicio) {
      query = query.gte('abertura_em', options.data_inicio);
    }

    if (options?.data_fim) {
      query = query.lte('abertura_em', options.data_fim);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data as CaixaSessao[], count };
  },

  // Resumo do dia
  async getResumoDia(data?: string) {
    const hoje = data || new Date().toISOString().split('T')[0];

    const { data: sessoes, error } = await supabase
      .from('caixa_sessoes')
      .select('*')
      .gte('abertura_em', `${hoje}T00:00:00`)
      .lte('abertura_em', `${hoje}T23:59:59`);

    if (error) throw error;

    const resumo = {
      total_vendas: 0,
      total_dinheiro: 0,
      total_pix: 0,
      total_credito: 0,
      total_debito: 0,
      total_sangrias: 0,
      total_suprimentos: 0,
      quantidade_vendas: 0,
      sessoes: sessoes?.length || 0,
    };

    sessoes?.forEach((s: CaixaSessao) => {
      resumo.total_vendas += s.total_vendas || 0;
      resumo.total_dinheiro += s.total_dinheiro || 0;
      resumo.total_pix += s.total_pix || 0;
      resumo.total_credito += s.total_credito || 0;
      resumo.total_debito += s.total_debito || 0;
      resumo.total_sangrias += s.total_sangrias || 0;
      resumo.total_suprimentos += s.total_suprimentos || 0;
      resumo.quantidade_vendas += s.quantidade_vendas || 0;
    });

    return resumo;
  },
};
