// ============================================
// DATABASE TYPES - GERADO A PARTIR DO SCHEMA
// ============================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      empresas: {
        Row: {
          id: string;
          razao_social: string;
          nome_fantasia: string;
          cnpj: string;
          inscricao_estadual: string | null;
          inscricao_municipal: string | null;
          regime: 'simples' | 'presumido' | 'real';
          logradouro: string | null;
          numero: string | null;
          complemento: string | null;
          bairro: string | null;
          cidade: string | null;
          uf: string | null;
          cep: string | null;
          ibge: string | null;
          telefone: string | null;
          email: string | null;
          logo: string | null;
          configuracoes: Json;
          status: 'ativa' | 'suspensa' | 'cancelada';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['empresas']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['empresas']['Insert']>;
      };
      perfis: {
        Row: {
          id: string;
          empresa_id: string;
          nome: string;
          descricao: string | null;
          permissoes: Json;
          sistema: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['perfis']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['perfis']['Insert']>;
      };
      usuarios: {
        Row: {
          id: string;
          empresa_id: string;
          email: string;
          nome: string;
          avatar: string | null;
          perfil_id: string;
          pin: string | null;
          ativo: boolean;
          ultimo_acesso: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['usuarios']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['usuarios']['Insert']>;
      };
      audit_logs: {
        Row: {
          id: string;
          empresa_id: string;
          usuario_id: string | null;
          usuario_nome: string | null;
          acao: 'criar' | 'editar' | 'excluir' | 'aprovar' | 'login' | 'logout' | 'exportar' | 'cancelar';
          modulo: string;
          entidade: string;
          entidade_id: string | null;
          dados_anteriores: Json | null;
          dados_novos: Json | null;
          ip: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>;
      };
      categorias_produto: {
        Row: {
          id: string;
          empresa_id: string;
          nome: string;
          descricao: string | null;
          cor: string | null;
          icone: string | null;
          ordem: number;
          ativo: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['categorias_produto']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['categorias_produto']['Insert']>;
      };
      produtos: {
        Row: {
          id: string;
          empresa_id: string;
          codigo: string;
          codigo_barras: string | null;
          nome: string;
          descricao: string | null;
          categoria_id: string | null;
          unidade: string;
          preco_custo: number;
          preco_venda: number;
          margem_lucro: number;
          estoque_atual: number;
          estoque_minimo: number;
          estoque_maximo: number;
          custo_medio: number;
          localizacao: string | null;
          ncm: string | null;
          cest: string | null;
          origem: string;
          cst_icms: string | null;
          aliq_icms: number | null;
          cst_pis: string | null;
          aliq_pis: number | null;
          cst_cofins: string | null;
          aliq_cofins: number | null;
          ativo: boolean;
          imagem: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['produtos']['Row'], 'id' | 'created_at' | 'updated_at' | 'margem_lucro'>;
        Update: Partial<Database['public']['Tables']['produtos']['Insert']>;
      };
      movimentos_estoque: {
        Row: {
          id: string;
          empresa_id: string;
          produto_id: string;
          tipo: 'entrada' | 'saida' | 'ajuste' | 'transferencia';
          origem: 'compra' | 'venda' | 'devolucao' | 'inventario' | 'manual' | 'producao';
          quantidade: number;
          quantidade_anterior: number;
          quantidade_posterior: number;
          custo_unitario: number;
          custo_medio_anterior: number;
          custo_medio_posterior: number;
          documento_tipo: string | null;
          documento_id: string | null;
          observacao: string | null;
          usuario_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['movimentos_estoque']['Row'], 'id' | 'created_at' | 'quantidade_anterior' | 'quantidade_posterior' | 'custo_medio_anterior' | 'custo_medio_posterior'>;
        Update: Partial<Database['public']['Tables']['movimentos_estoque']['Insert']>;
      };
      inventarios: {
        Row: {
          id: string;
          empresa_id: string;
          numero: number;
          descricao: string | null;
          status: 'rascunho' | 'em_contagem' | 'finalizado' | 'cancelado';
          data_inicio: string;
          data_fim: string | null;
          total_divergencias: number;
          valor_divergencia: number;
          usuario_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['inventarios']['Row'], 'id' | 'created_at' | 'numero'>;
        Update: Partial<Database['public']['Tables']['inventarios']['Insert']>;
      };
      inventario_itens: {
        Row: {
          id: string;
          inventario_id: string;
          produto_id: string;
          estoque_contabil: number;
          estoque_contado: number | null;
          divergencia: number;
          custo_unitario: number;
          valor_divergencia: number;
          observacao: string | null;
          contado_por: string | null;
          contado_em: string | null;
        };
        Insert: Omit<Database['public']['Tables']['inventario_itens']['Row'], 'id' | 'divergencia' | 'valor_divergencia'>;
        Update: Partial<Database['public']['Tables']['inventario_itens']['Insert']>;
      };
      clientes: {
        Row: {
          id: string;
          empresa_id: string;
          tipo: 'pf' | 'pj';
          documento: string;
          nome: string;
          nome_fantasia: string | null;
          email: string | null;
          telefone: string | null;
          celular: string | null;
          logradouro: string | null;
          numero: string | null;
          complemento: string | null;
          bairro: string | null;
          cidade: string | null;
          uf: string | null;
          cep: string | null;
          limite_credito: number;
          saldo_devedor: number;
          dias_atraso: number;
          total_compras: number;
          ultima_compra: string | null;
          ticket_medio: number;
          observacoes: string | null;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['clientes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['clientes']['Insert']>;
      };
      formas_pagamento: {
        Row: {
          id: string;
          empresa_id: string;
          nome: string;
          tipo: 'dinheiro' | 'pix' | 'credito' | 'debito' | 'boleto' | 'crediario' | 'outros';
          taxa_percentual: number;
          taxa_fixa: number;
          prazo_recebimento: number;
          ativo: boolean;
          ordem: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['formas_pagamento']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['formas_pagamento']['Insert']>;
      };
      caixa_sessoes: {
        Row: {
          id: string;
          empresa_id: string;
          numero: number;
          operador_id: string;
          status: 'aberto' | 'fechado';
          valor_abertura: number;
          valor_fechamento: number | null;
          valor_esperado: number | null;
          diferenca: number | null;
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
          observacao_abertura: string | null;
          observacao_fechamento: string | null;
          abertura_em: string;
          fechamento_em: string | null;
        };
        Insert: Omit<Database['public']['Tables']['caixa_sessoes']['Row'], 'id' | 'numero'>;
        Update: Partial<Database['public']['Tables']['caixa_sessoes']['Insert']>;
      };
      caixa_movimentos: {
        Row: {
          id: string;
          empresa_id: string;
          caixa_sessao_id: string;
          tipo: 'venda' | 'sangria' | 'suprimento' | 'cancelamento' | 'devolucao';
          valor: number;
          forma_pagamento_id: string | null;
          documento_tipo: string | null;
          documento_id: string | null;
          observacao: string | null;
          usuario_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['caixa_movimentos']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['caixa_movimentos']['Insert']>;
      };
      vendas: {
        Row: {
          id: string;
          empresa_id: string;
          numero: number;
          serie: number;
          cliente_id: string | null;
          vendedor_id: string;
          caixa_sessao_id: string;
          subtotal: number;
          desconto_percentual: number;
          desconto_valor: number;
          acrescimo: number;
          total: number;
          troco: number;
          status: 'rascunho' | 'finalizada' | 'cancelada' | 'devolvida';
          motivo_cancelamento: string | null;
          venda_original_id: string | null;
          nfce_numero: number | null;
          nfce_chave: string | null;
          nfce_status: 'pendente' | 'autorizada' | 'rejeitada' | 'cancelada' | null;
          nfce_xml: string | null;
          observacao: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['vendas']['Row'], 'id' | 'created_at' | 'updated_at' | 'numero'>;
        Update: Partial<Database['public']['Tables']['vendas']['Insert']>;
      };
      venda_itens: {
        Row: {
          id: string;
          venda_id: string;
          produto_id: string;
          quantidade: number;
          preco_unitario: number;
          custo_unitario: number;
          desconto_percentual: number;
          desconto_valor: number;
          subtotal: number;
          total: number;
          ncm: string | null;
          cfop: string | null;
          cst_icms: string | null;
          aliq_icms: number | null;
          valor_icms: number | null;
        };
        Insert: Omit<Database['public']['Tables']['venda_itens']['Row'], 'id' | 'subtotal' | 'total'>;
        Update: Partial<Database['public']['Tables']['venda_itens']['Insert']>;
      };
      venda_pagamentos: {
        Row: {
          id: string;
          venda_id: string;
          forma_pagamento_id: string;
          valor: number;
          troco: number;
          bandeira: string | null;
          nsu: string | null;
          autorizacao: string | null;
          parcelas: number;
          tx_id: string | null;
          end_to_end: string | null;
          status: 'pendente' | 'confirmado' | 'cancelado';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['venda_pagamentos']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['venda_pagamentos']['Insert']>;
      };
      categorias_financeiras: {
        Row: {
          id: string;
          empresa_id: string;
          tipo: 'receita' | 'despesa';
          nome: string;
          cor: string | null;
          pai_id: string | null;
          ordem: number;
          ativo: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['categorias_financeiras']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['categorias_financeiras']['Insert']>;
      };
      centros_custo: {
        Row: {
          id: string;
          empresa_id: string;
          codigo: string;
          nome: string;
          ativo: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['centros_custo']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['centros_custo']['Insert']>;
      };
      contas: {
        Row: {
          id: string;
          empresa_id: string;
          tipo: 'pagar' | 'receber';
          descricao: string;
          categoria_id: string | null;
          centro_custo_id: string | null;
          pessoa_id: string | null;
          pessoa_tipo: 'cliente' | 'fornecedor' | null;
          pessoa_nome: string | null;
          documento_tipo: string | null;
          documento_id: string | null;
          documento_numero: string | null;
          valor_original: number;
          valor_pago: number;
          valor_restante: number;
          data_emissao: string;
          data_vencimento: string;
          data_pagamento: string | null;
          forma_pagamento_id: string | null;
          status: 'pendente' | 'pago' | 'parcial' | 'vencido' | 'cancelado';
          recorrente: boolean;
          recorrencia_config: Json | null;
          observacao: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['contas']['Row'], 'id' | 'created_at' | 'updated_at' | 'valor_restante'>;
        Update: Partial<Database['public']['Tables']['contas']['Insert']>;
      };
      webhook_logs: {
        Row: {
          id: string;
          empresa_id: string | null;
          provider: string;
          evento: string;
          payload: Json;
          status: 'recebido' | 'processando' | 'sucesso' | 'erro' | 'ignorado';
          tentativas: number;
          erro: string | null;
          processado_em: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['webhook_logs']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['webhook_logs']['Insert']>;
      };
      integracoes_config: {
        Row: {
          id: string;
          empresa_id: string;
          provider: string;
          tipo: 'pagamento' | 'fiscal' | 'delivery' | 'marketplace' | 'contabilidade';
          credenciais: Json;
          configuracoes: Json;
          ativo: boolean;
          ultima_sync: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['integracoes_config']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['integracoes_config']['Insert']>;
      };
      jobs: {
        Row: {
          id: string;
          empresa_id: string | null;
          tipo: string;
          payload: Json;
          prioridade: number;
          status: 'pendente' | 'processando' | 'sucesso' | 'erro' | 'cancelado';
          tentativas: number;
          max_tentativas: number;
          erro: string | null;
          resultados: Json | null;
          agendado_para: string | null;
          iniciado_em: string | null;
          finalizado_em: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['jobs']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['jobs']['Insert']>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      jwt_empresa_id: {
        Args: Record<string, never>;
        Returns: string;
      };
      jwt_user_id: {
        Args: Record<string, never>;
        Returns: string;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      has_permission: {
        Args: { p_modulo: string; p_acao: string };
        Returns: boolean;
      };
      criar_empresa_demo: {
        Args: Record<string, never>;
        Returns: void;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Tipos auxiliares para facilitar o uso
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Atalhos de tipos comuns
export type Empresa = Tables<'empresas'>;
export type Perfil = Tables<'perfis'>;
export type Usuario = Tables<'usuarios'>;
export type AuditLog = Tables<'audit_logs'>;
export type CategoriaProduto = Tables<'categorias_produto'>;
export type Produto = Tables<'produtos'>;
export type MovimentoEstoque = Tables<'movimentos_estoque'>;
export type Inventario = Tables<'inventarios'>;
export type InventarioItem = Tables<'inventario_itens'>;
export type Cliente = Tables<'clientes'>;
export type FormaPagamento = Tables<'formas_pagamento'>;
export type CaixaSessao = Tables<'caixa_sessoes'>;
export type CaixaMovimento = Tables<'caixa_movimentos'>;
export type Venda = Tables<'vendas'>;
export type VendaItem = Tables<'venda_itens'>;
export type VendaPagamento = Tables<'venda_pagamentos'>;
export type CategoriaFinanceira = Tables<'categorias_financeiras'>;
export type CentroCusto = Tables<'centros_custo'>;
export type Conta = Tables<'contas'>;
export type WebhookLog = Tables<'webhook_logs'>;
export type IntegracaoConfig = Tables<'integracoes_config'>;
export type Job = Tables<'jobs'>;
