import { supabase } from '@/lib/supabase';

// ========================================
// TYPES
// ========================================

export interface Cliente {
  id: string;
  empresa_id: string;
  tipo: 'pf' | 'pj';
  documento: string;
  nome: string;
  nome_fantasia?: string;
  email?: string;
  telefone?: string;
  celular?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  limite_credito: number;
  saldo_devedor: number;
  dias_atraso: number;
  total_compras: number;
  ultima_compra?: string;
  ticket_medio: number;
  observacoes?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClienteInput {
  tipo?: 'pf' | 'pj';
  documento: string;
  nome: string;
  nome_fantasia?: string;
  email?: string;
  telefone?: string;
  celular?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  limite_credito?: number;
  observacoes?: string;
}

// ========================================
// SERVICE FUNCTIONS
// ========================================

export const clientesService = {
  // Listar clientes
  async list(options?: {
    search?: string;
    ativo?: boolean;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('clientes')
      .select('*', { count: 'exact' })
      .order('nome');

    if (options?.search) {
      query = query.or(`nome.ilike.%${options.search}%,documento.ilike.%${options.search}%,email.ilike.%${options.search}%`);
    }

    if (options?.ativo !== undefined) {
      query = query.eq('ativo', options.ativo);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data as Cliente[], count };
  },

  // Buscar cliente por ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Cliente;
  },

  // Buscar por documento (CPF/CNPJ)
  async getByDocument(documento: string) {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('documento', documento)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Cliente | null;
  },

  // Criar cliente
  async create(input: ClienteInput) {
    const { data, error } = await supabase
      .from('clientes')
      .insert(input as never)
      .select()
      .single();

    if (error) throw error;
    return data as Cliente;
  },

  // Atualizar cliente
  async update(id: string, input: Partial<ClienteInput>) {
    const { data, error } = await supabase
      .from('clientes')
      .update({ ...input, updated_at: new Date().toISOString() } as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Cliente;
  },

  // Excluir cliente (soft delete)
  async delete(id: string) {
    const { error } = await supabase
      .from('clientes')
      .update({ ativo: false } as never)
      .eq('id', id);

    if (error) throw error;
  },

  // Atualizar saldo devedor
  async updateSaldoDevedor(id: string, valor: number, operacao: 'adicionar' | 'subtrair') {
    const { data: cliente, error: fetchError } = await supabase
      .from('clientes')
      .select('saldo_devedor')
      .eq('id', id)
      .single() as { data: { saldo_devedor: number } | null; error: Error | null };

    if (fetchError) throw fetchError;

    const novoSaldo = operacao === 'adicionar' 
      ? cliente!.saldo_devedor + valor 
      : cliente!.saldo_devedor - valor;

    const { error } = await supabase
      .from('clientes')
      .update({ 
        saldo_devedor: Math.max(0, novoSaldo),
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', id);

    if (error) throw error;
  },

  // Registrar compra
  async registrarCompra(id: string, valor: number) {
    const { data: cliente, error: fetchError } = await supabase
      .from('clientes')
      .select('total_compras, ticket_medio')
      .eq('id', id)
      .single() as { data: { total_compras: number; ticket_medio: number } | null; error: Error | null };

    if (fetchError) throw fetchError;

    const totalComprasAntigo = cliente!.total_compras || 0;
    const novoTotal = totalComprasAntigo + valor;
    
    // Simplificação: ticket médio seria (total / qtd vendas), aqui só atualizamos
    const { error } = await supabase
      .from('clientes')
      .update({
        total_compras: novoTotal,
        ultima_compra: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', id);

    if (error) throw error;
  },

  // Clientes com saldo devedor
  async getDevedores() {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .gt('saldo_devedor', 0)
      .eq('ativo', true)
      .order('saldo_devedor', { ascending: false });

    if (error) throw error;
    return data as Cliente[];
  },

  // Top clientes por compras
  async getTopClientes(limit: number = 10) {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('ativo', true)
      .order('total_compras', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Cliente[];
  },
};
