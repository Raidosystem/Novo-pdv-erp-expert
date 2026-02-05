import { supabase } from '@/lib/supabase';

// ========================================
// TYPES
// ========================================

export interface Produto {
  id: string;
  empresa_id: string;
  codigo: string;
  codigo_barras?: string;
  nome: string;
  descricao?: string;
  categoria_id?: string;
  categoria?: CategoriaProduto;
  unidade: string;
  preco_custo: number;
  preco_venda: number;
  margem_lucro: number;
  estoque_atual: number;
  estoque_minimo: number;
  estoque_maximo: number;
  custo_medio: number;
  localizacao?: string;
  ncm?: string;
  cest?: string;
  ativo: boolean;
  imagem?: string;
  created_at: string;
  updated_at: string;
}

export interface CategoriaProduto {
  id: string;
  empresa_id: string;
  nome: string;
  descricao?: string;
  cor?: string;
  icone?: string;
  ordem: number;
  ativo: boolean;
}

export interface ProdutoInput {
  codigo: string;
  codigo_barras?: string;
  nome: string;
  descricao?: string;
  categoria_id?: string;
  unidade?: string;
  preco_custo?: number;
  preco_venda: number;
  estoque_minimo?: number;
  estoque_maximo?: number;
  localizacao?: string;
  ncm?: string;
  ativo?: boolean;
  imagem?: string;
}

// ========================================
// SERVICE FUNCTIONS
// ========================================

export const produtosService = {
  // Listar produtos
  async list(options?: {
    search?: string;
    categoria_id?: string;
    ativo?: boolean;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('produtos')
      .select(`
        *,
        categoria:categorias_produto(id, nome, cor)
      `)
      .order('nome');

    if (options?.search) {
      query = query.or(`nome.ilike.%${options.search}%,codigo.ilike.%${options.search}%,codigo_barras.ilike.%${options.search}%`);
    }

    if (options?.categoria_id) {
      query = query.eq('categoria_id', options.categoria_id);
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
    return { data: data as Produto[], count };
  },

  // Buscar produto por ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('produtos')
      .select(`
        *,
        categoria:categorias_produto(id, nome, cor)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Produto;
  },

  // Buscar por código de barras
  async getByBarcode(barcode: string) {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('codigo_barras', barcode)
      .eq('ativo', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Produto | null;
  },

  // Criar produto
  async create(input: ProdutoInput) {
    const { data, error } = await supabase
      .from('produtos')
      .insert(input as never)
      .select()
      .single();

    if (error) throw error;
    return data as Produto;
  },

  // Atualizar produto
  async update(id: string, input: Partial<ProdutoInput>) {
    const { data, error } = await supabase
      .from('produtos')
      .update({ ...input, updated_at: new Date().toISOString() } as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Produto;
  },

  // Excluir produto (soft delete)
  async delete(id: string) {
    const { error } = await supabase
      .from('produtos')
      .update({ ativo: false } as never)
      .eq('id', id);

    if (error) throw error;
  },

  // Atualizar estoque
  async updateStock(id: string, quantidade: number, tipo: 'entrada' | 'saida' | 'ajuste', origem: string) {
    // Buscar produto atual
    const { data: produto, error: prodError } = await supabase
      .from('produtos')
      .select('estoque_atual, custo_medio')
      .eq('id', id)
      .single() as { data: { estoque_atual: number; custo_medio: number } | null; error: Error | null };

    if (prodError) throw prodError;
    if (!produto) throw new Error('Produto não encontrado');

    // Criar movimento de estoque
    const { error: movError } = await supabase
      .from('movimentos_estoque')
      .insert({
        produto_id: id,
        tipo,
        origem,
        quantidade,
        quantidade_anterior: produto.estoque_atual,
        quantidade_posterior: tipo === 'saida' 
          ? produto.estoque_atual - quantidade 
          : produto.estoque_atual + quantidade,
        custo_unitario: produto.custo_medio,
      } as never);

    if (movError) throw movError;
  },

  // Produtos com estoque baixo
  async getLowStock() {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('ativo', true)
      .filter('estoque_atual', 'lte', supabase.rpc('estoque_minimo_col'))
      .order('estoque_atual');

    // Alternativa: usar raw SQL via RPC se o filtro acima não funcionar
    if (error) {
      const { data: dataRaw, error: errorRaw } = await supabase
        .rpc('get_produtos_estoque_baixo');
      if (errorRaw) throw errorRaw;
      return dataRaw as Produto[];
    }

    return data as Produto[];
  },
};

// ========================================
// CATEGORIAS SERVICE
// ========================================

export const categoriasService = {
  async list() {
    const { data, error } = await supabase
      .from('categorias_produto')
      .select('*')
      .eq('ativo', true)
      .order('ordem');

    if (error) throw error;
    return data as CategoriaProduto[];
  },

  async create(input: { nome: string; descricao?: string; cor?: string }) {
    const { data, error } = await supabase
      .from('categorias_produto')
      .insert(input as never)
      .select()
      .single();

    if (error) throw error;
    return data as CategoriaProduto;
  },

  async update(id: string, input: Partial<CategoriaProduto>) {
    const { data, error } = await supabase
      .from('categorias_produto')
      .update(input as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as CategoriaProduto;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('categorias_produto')
      .update({ ativo: false } as never)
      .eq('id', id);

    if (error) throw error;
  },
};
