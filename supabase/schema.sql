-- ============================================
-- FASTPOS ERP - SCHEMA SUPABASE COMPLETO
-- Multi-tenant com RLS
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- FUNÇÕES BÁSICAS PARA RLS (SEM DEPENDÊNCIAS)
-- ============================================

-- Retorna o empresa_id do JWT
CREATE OR REPLACE FUNCTION jwt_empresa_id() 
RETURNS uuid AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'empresa_id')::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Retorna o user_id do JWT
CREATE OR REPLACE FUNCTION jwt_user_id() 
RETURNS uuid AS $$
  SELECT COALESCE(
    auth.uid(),
    '00000000-0000-0000-0000-000000000000'::uuid
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- EMPRESAS
-- ============================================

CREATE TABLE empresas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  razao_social varchar(200) NOT NULL,
  nome_fantasia varchar(200) NOT NULL,
  cnpj varchar(18) UNIQUE NOT NULL,
  inscricao_estadual varchar(20),
  inscricao_municipal varchar(20),
  regime varchar(20) DEFAULT 'simples' CHECK (regime IN ('simples', 'presumido', 'real')),
  
  -- Endereço
  logradouro varchar(200),
  numero varchar(20),
  complemento varchar(100),
  bairro varchar(100),
  cidade varchar(100),
  uf char(2),
  cep varchar(10),
  ibge varchar(10),
  
  telefone varchar(20),
  email varchar(200),
  logo text,
  
  -- Configurações JSON
  configuracoes jsonb DEFAULT '{
    "permitirEstoqueNegativo": false,
    "metodoValorizacao": "custo_medio",
    "casasDecimais": 2,
    "moeda": "BRL",
    "timezone": "America/Sao_Paulo"
  }'::jsonb,
  
  status varchar(20) DEFAULT 'ativa' CHECK (status IN ('ativa', 'suspensa', 'cancelada')),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- PERFIS E USUÁRIOS (RBAC)
-- ============================================

CREATE TABLE perfis (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome varchar(100) NOT NULL,
  descricao text,
  permissoes jsonb DEFAULT '[]'::jsonb,
  sistema boolean DEFAULT false, -- Perfis padrão não podem ser excluídos
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(empresa_id, nome)
);

CREATE TABLE usuarios (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  email varchar(200) NOT NULL,
  nome varchar(200) NOT NULL,
  avatar text,
  perfil_id uuid NOT NULL REFERENCES perfis(id),
  pin varchar(10), -- PIN para PDV
  ativo boolean DEFAULT true,
  ultimo_acesso timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(empresa_id, email)
);

-- ============================================
-- FUNÇÕES RLS COM DEPENDÊNCIAS (APÓS TABELAS)
-- ============================================

-- Verifica se usuário é admin da empresa
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM usuarios u
    JOIN perfis p ON u.perfil_id = p.id
    WHERE u.id = jwt_user_id()
    AND u.empresa_id = jwt_empresa_id()
    AND p.nome = 'Administrador'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Verifica se usuário tem permissão específica
CREATE OR REPLACE FUNCTION has_permission(p_modulo text, p_acao text) 
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM usuarios u
    JOIN perfis p ON u.perfil_id = p.id
    WHERE u.id = jwt_user_id()
    AND u.empresa_id = jwt_empresa_id()
    AND (
      p.nome = 'Administrador'
      OR EXISTS (
        SELECT 1 FROM jsonb_array_elements(p.permissoes) perm
        WHERE perm->>'modulo' = p_modulo
        AND perm->'acoes' ? p_acao
      )
    )
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- AUDITORIA
-- ============================================

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  usuario_id uuid REFERENCES usuarios(id),
  usuario_nome varchar(200),
  
  acao varchar(50) NOT NULL CHECK (acao IN ('criar', 'editar', 'excluir', 'aprovar', 'login', 'logout', 'exportar', 'cancelar')),
  modulo varchar(100) NOT NULL,
  entidade varchar(100) NOT NULL,
  entidade_id uuid,
  
  dados_anteriores jsonb,
  dados_novos jsonb,
  
  ip inet,
  user_agent text,
  
  created_at timestamptz DEFAULT now()
);

-- Índices para auditoria
CREATE INDEX idx_audit_empresa_data ON audit_logs(empresa_id, created_at DESC);
CREATE INDEX idx_audit_entidade ON audit_logs(empresa_id, entidade, entidade_id);
CREATE INDEX idx_audit_usuario ON audit_logs(empresa_id, usuario_id);

-- ============================================
-- CATEGORIAS DE PRODUTOS
-- ============================================

CREATE TABLE categorias_produto (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome varchar(100) NOT NULL,
  descricao text,
  cor varchar(7),
  icone varchar(50),
  ordem int DEFAULT 0,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(empresa_id, nome)
);

-- ============================================
-- PRODUTOS
-- ============================================

CREATE TABLE produtos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  codigo varchar(50) NOT NULL,
  codigo_barras varchar(50),
  nome varchar(200) NOT NULL,
  descricao text,
  categoria_id uuid REFERENCES categorias_produto(id),
  unidade varchar(10) DEFAULT 'UN',
  
  -- Preços
  preco_custo decimal(15,4) DEFAULT 0,
  preco_venda decimal(15,4) NOT NULL,
  margem_lucro decimal(5,2) GENERATED ALWAYS AS (
    CASE WHEN preco_custo > 0 THEN ((preco_venda - preco_custo) / preco_custo * 100)
    ELSE 0 END
  ) STORED,
  
  -- Estoque
  estoque_atual decimal(15,4) DEFAULT 0,
  estoque_minimo decimal(15,4) DEFAULT 0,
  estoque_maximo decimal(15,4) DEFAULT 0,
  custo_medio decimal(15,4) DEFAULT 0,
  localizacao varchar(50),
  
  -- Fiscal
  ncm varchar(10),
  cest varchar(10),
  origem char(1) DEFAULT '0',
  cst_icms varchar(3),
  aliq_icms decimal(5,2),
  cst_pis varchar(3),
  aliq_pis decimal(5,2),
  cst_cofins varchar(3),
  aliq_cofins decimal(5,2),
  
  -- Controle
  ativo boolean DEFAULT true,
  imagem text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(empresa_id, codigo)
);

-- Índices
CREATE INDEX idx_produtos_empresa ON produtos(empresa_id, ativo);
CREATE INDEX idx_produtos_barcode ON produtos(empresa_id, codigo_barras);
CREATE INDEX idx_produtos_categoria ON produtos(empresa_id, categoria_id);
CREATE INDEX idx_produtos_nome ON produtos(empresa_id, nome);

-- ============================================
-- MOVIMENTAÇÕES DE ESTOQUE
-- ============================================

CREATE TABLE movimentos_estoque (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  produto_id uuid NOT NULL REFERENCES produtos(id),
  
  tipo varchar(20) NOT NULL CHECK (tipo IN ('entrada', 'saida', 'ajuste', 'transferencia')),
  origem varchar(20) NOT NULL CHECK (origem IN ('compra', 'venda', 'devolucao', 'inventario', 'manual', 'producao')),
  
  quantidade decimal(15,4) NOT NULL,
  quantidade_anterior decimal(15,4) NOT NULL,
  quantidade_posterior decimal(15,4) NOT NULL,
  
  custo_unitario decimal(15,4) DEFAULT 0,
  custo_medio_anterior decimal(15,4) DEFAULT 0,
  custo_medio_posterior decimal(15,4) DEFAULT 0,
  
  documento_tipo varchar(50),
  documento_id uuid,
  
  observacao text,
  usuario_id uuid REFERENCES usuarios(id),
  
  created_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX idx_mov_estoque_empresa ON movimentos_estoque(empresa_id, created_at DESC);
CREATE INDEX idx_mov_estoque_produto ON movimentos_estoque(empresa_id, produto_id);
CREATE INDEX idx_mov_estoque_documento ON movimentos_estoque(empresa_id, documento_tipo, documento_id);

-- ============================================
-- INVENTÁRIOS
-- ============================================

CREATE TABLE inventarios (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  numero serial,
  descricao text,
  status varchar(20) DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'em_contagem', 'finalizado', 'cancelado')),
  
  data_inicio timestamptz DEFAULT now(),
  data_fim timestamptz,
  
  total_divergencias int DEFAULT 0,
  valor_divergencia decimal(15,2) DEFAULT 0,
  
  usuario_id uuid REFERENCES usuarios(id),
  
  created_at timestamptz DEFAULT now()
);

CREATE TABLE inventario_itens (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventario_id uuid NOT NULL REFERENCES inventarios(id) ON DELETE CASCADE,
  produto_id uuid NOT NULL REFERENCES produtos(id),
  
  estoque_contabil decimal(15,4) NOT NULL,
  estoque_contado decimal(15,4),
  divergencia decimal(15,4) GENERATED ALWAYS AS (COALESCE(estoque_contado, 0) - estoque_contabil) STORED,
  
  custo_unitario decimal(15,4) DEFAULT 0,
  valor_divergencia decimal(15,2) GENERATED ALWAYS AS (
    (COALESCE(estoque_contado, 0) - estoque_contabil) * custo_unitario
  ) STORED,
  
  observacao text,
  contado_por uuid REFERENCES usuarios(id),
  contado_em timestamptz,
  
  UNIQUE(inventario_id, produto_id)
);

-- ============================================
-- CLIENTES
-- ============================================

CREATE TABLE clientes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  tipo char(2) DEFAULT 'pf' CHECK (tipo IN ('pf', 'pj')),
  documento varchar(18) NOT NULL,
  nome varchar(200) NOT NULL,
  nome_fantasia varchar(200),
  
  email varchar(200),
  telefone varchar(20),
  celular varchar(20),
  
  -- Endereço
  logradouro varchar(200),
  numero varchar(20),
  complemento varchar(100),
  bairro varchar(100),
  cidade varchar(100),
  uf char(2),
  cep varchar(10),
  
  -- Crédito
  limite_credito decimal(15,2) DEFAULT 0,
  saldo_devedor decimal(15,2) DEFAULT 0,
  dias_atraso int DEFAULT 0,
  
  -- Estatísticas
  total_compras decimal(15,2) DEFAULT 0,
  ultima_compra timestamptz,
  ticket_medio decimal(15,2) DEFAULT 0,
  
  observacoes text,
  ativo boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(empresa_id, documento)
);

CREATE INDEX idx_clientes_empresa ON clientes(empresa_id, ativo);
CREATE INDEX idx_clientes_documento ON clientes(empresa_id, documento);
CREATE INDEX idx_clientes_nome ON clientes(empresa_id, nome);

-- ============================================
-- FORMAS DE PAGAMENTO
-- ============================================

CREATE TABLE formas_pagamento (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  nome varchar(100) NOT NULL,
  tipo varchar(20) NOT NULL CHECK (tipo IN ('dinheiro', 'pix', 'credito', 'debito', 'boleto', 'crediario', 'outros')),
  
  taxa_percentual decimal(5,2) DEFAULT 0,
  taxa_fixa decimal(15,2) DEFAULT 0,
  prazo_recebimento int DEFAULT 0, -- dias
  
  ativo boolean DEFAULT true,
  ordem int DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(empresa_id, nome)
);

-- ============================================
-- CAIXA - SESSÕES
-- ============================================

CREATE TABLE caixa_sessoes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  numero serial,
  operador_id uuid NOT NULL REFERENCES usuarios(id),
  
  status varchar(20) DEFAULT 'aberto' CHECK (status IN ('aberto', 'fechado')),
  
  valor_abertura decimal(15,2) NOT NULL DEFAULT 0,
  valor_fechamento decimal(15,2),
  valor_esperado decimal(15,2),
  diferenca decimal(15,2),
  
  -- Totais
  total_vendas decimal(15,2) DEFAULT 0,
  total_cancelamentos decimal(15,2) DEFAULT 0,
  total_devolucoes decimal(15,2) DEFAULT 0,
  total_sangrias decimal(15,2) DEFAULT 0,
  total_suprimentos decimal(15,2) DEFAULT 0,
  quantidade_vendas int DEFAULT 0,
  
  -- Por forma de pagamento
  total_dinheiro decimal(15,2) DEFAULT 0,
  total_pix decimal(15,2) DEFAULT 0,
  total_credito decimal(15,2) DEFAULT 0,
  total_debito decimal(15,2) DEFAULT 0,
  total_outros decimal(15,2) DEFAULT 0,
  
  observacao_abertura text,
  observacao_fechamento text,
  
  abertura_em timestamptz DEFAULT now(),
  fechamento_em timestamptz
);

CREATE INDEX idx_caixa_sessoes_empresa ON caixa_sessoes(empresa_id, abertura_em DESC);
CREATE INDEX idx_caixa_sessoes_operador ON caixa_sessoes(empresa_id, operador_id);
CREATE INDEX idx_caixa_sessoes_status ON caixa_sessoes(empresa_id, status);

-- ============================================
-- CAIXA - MOVIMENTOS
-- ============================================

CREATE TABLE caixa_movimentos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  caixa_sessao_id uuid NOT NULL REFERENCES caixa_sessoes(id),
  
  tipo varchar(20) NOT NULL CHECK (tipo IN ('venda', 'sangria', 'suprimento', 'cancelamento', 'devolucao')),
  
  valor decimal(15,2) NOT NULL,
  forma_pagamento_id uuid REFERENCES formas_pagamento(id),
  
  documento_tipo varchar(50),
  documento_id uuid,
  
  observacao text,
  usuario_id uuid REFERENCES usuarios(id),
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_caixa_mov_sessao ON caixa_movimentos(caixa_sessao_id);

-- ============================================
-- VENDAS
-- ============================================

CREATE TABLE vendas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  numero serial,
  serie int DEFAULT 1,
  
  cliente_id uuid REFERENCES clientes(id),
  vendedor_id uuid NOT NULL REFERENCES usuarios(id),
  caixa_sessao_id uuid NOT NULL REFERENCES caixa_sessoes(id),
  
  subtotal decimal(15,2) NOT NULL DEFAULT 0,
  desconto_percentual decimal(5,2) DEFAULT 0,
  desconto_valor decimal(15,2) DEFAULT 0,
  acrescimo decimal(15,2) DEFAULT 0,
  total decimal(15,2) NOT NULL DEFAULT 0,
  troco decimal(15,2) DEFAULT 0,
  
  status varchar(20) DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'finalizada', 'cancelada', 'devolvida')),
  motivo_cancelamento text,
  venda_original_id uuid REFERENCES vendas(id), -- Para devoluções
  
  -- Fiscal
  nfce_numero int,
  nfce_chave varchar(44),
  nfce_status varchar(20) CHECK (nfce_status IN ('pendente', 'autorizada', 'rejeitada', 'cancelada')),
  nfce_xml text,
  
  observacao text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_vendas_empresa ON vendas(empresa_id, created_at DESC);
CREATE INDEX idx_vendas_cliente ON vendas(empresa_id, cliente_id);
CREATE INDEX idx_vendas_vendedor ON vendas(empresa_id, vendedor_id);
CREATE INDEX idx_vendas_caixa ON vendas(caixa_sessao_id);
CREATE INDEX idx_vendas_status ON vendas(empresa_id, status);
CREATE INDEX idx_vendas_data ON vendas(empresa_id, created_at);

-- ============================================
-- VENDA - ITENS
-- ============================================

CREATE TABLE venda_itens (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  venda_id uuid NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
  produto_id uuid NOT NULL REFERENCES produtos(id),
  
  quantidade decimal(15,4) NOT NULL,
  preco_unitario decimal(15,4) NOT NULL,
  custo_unitario decimal(15,4) DEFAULT 0,
  
  desconto_percentual decimal(5,2) DEFAULT 0,
  desconto_valor decimal(15,2) DEFAULT 0,
  
  subtotal decimal(15,2) GENERATED ALWAYS AS (quantidade * preco_unitario) STORED,
  total decimal(15,2) GENERATED ALWAYS AS (quantidade * preco_unitario - desconto_valor) STORED,
  
  -- Fiscal
  ncm varchar(10),
  cfop varchar(5),
  cst_icms varchar(3),
  aliq_icms decimal(5,2),
  valor_icms decimal(15,2)
);

CREATE INDEX idx_venda_itens_venda ON venda_itens(venda_id);
CREATE INDEX idx_venda_itens_produto ON venda_itens(produto_id);

-- ============================================
-- VENDA - PAGAMENTOS
-- ============================================

CREATE TABLE venda_pagamentos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  venda_id uuid NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
  forma_pagamento_id uuid NOT NULL REFERENCES formas_pagamento(id),
  
  valor decimal(15,2) NOT NULL,
  troco decimal(15,2) DEFAULT 0,
  
  -- Cartão
  bandeira varchar(50),
  nsu varchar(50),
  autorizacao varchar(50),
  parcelas int DEFAULT 1,
  
  -- PIX
  tx_id varchar(100),
  end_to_end varchar(100),
  
  status varchar(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'cancelado')),
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_venda_pagamentos_venda ON venda_pagamentos(venda_id);

-- ============================================
-- FINANCEIRO - CATEGORIAS
-- ============================================

CREATE TABLE categorias_financeiras (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  tipo varchar(20) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  nome varchar(100) NOT NULL,
  cor varchar(7),
  pai_id uuid REFERENCES categorias_financeiras(id),
  ordem int DEFAULT 0,
  ativo boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(empresa_id, tipo, nome)
);

-- ============================================
-- FINANCEIRO - CENTROS DE CUSTO
-- ============================================

CREATE TABLE centros_custo (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  codigo varchar(20) NOT NULL,
  nome varchar(100) NOT NULL,
  ativo boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(empresa_id, codigo)
);

-- ============================================
-- FINANCEIRO - CONTAS A PAGAR/RECEBER
-- ============================================

CREATE TABLE contas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  tipo varchar(20) NOT NULL CHECK (tipo IN ('pagar', 'receber')),
  
  descricao varchar(200) NOT NULL,
  categoria_id uuid REFERENCES categorias_financeiras(id),
  centro_custo_id uuid REFERENCES centros_custo(id),
  
  pessoa_id uuid,
  pessoa_tipo varchar(20) CHECK (pessoa_tipo IN ('cliente', 'fornecedor')),
  pessoa_nome varchar(200),
  
  documento_tipo varchar(50),
  documento_id uuid,
  documento_numero varchar(50),
  
  valor_original decimal(15,2) NOT NULL,
  valor_pago decimal(15,2) DEFAULT 0,
  valor_restante decimal(15,2) GENERATED ALWAYS AS (valor_original - valor_pago) STORED,
  
  data_emissao date NOT NULL DEFAULT CURRENT_DATE,
  data_vencimento date NOT NULL,
  data_pagamento date,
  
  forma_pagamento_id uuid REFERENCES formas_pagamento(id),
  
  status varchar(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'parcial', 'vencido', 'cancelado')),
  
  recorrente boolean DEFAULT false,
  recorrencia_config jsonb,
  
  observacao text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_contas_empresa ON contas(empresa_id, tipo, status);
CREATE INDEX idx_contas_vencimento ON contas(empresa_id, data_vencimento);
CREATE INDEX idx_contas_pessoa ON contas(empresa_id, pessoa_id);

-- ============================================
-- INTEGRAÇÕES - WEBHOOKS
-- ============================================

CREATE TABLE webhook_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  
  provider varchar(50) NOT NULL,
  evento varchar(100) NOT NULL,
  payload jsonb NOT NULL,
  
  status varchar(20) DEFAULT 'recebido' CHECK (status IN ('recebido', 'processando', 'sucesso', 'erro', 'ignorado')),
  tentativas int DEFAULT 0,
  erro text,
  
  processado_em timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_webhook_empresa ON webhook_logs(empresa_id, created_at DESC);
CREATE INDEX idx_webhook_status ON webhook_logs(status, created_at);

-- ============================================
-- INTEGRAÇÕES - CONFIGURAÇÕES
-- ============================================

CREATE TABLE integracoes_config (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  provider varchar(50) NOT NULL,
  tipo varchar(50) NOT NULL CHECK (tipo IN ('pagamento', 'fiscal', 'delivery', 'marketplace', 'contabilidade')),
  
  credenciais jsonb DEFAULT '{}'::jsonb, -- Criptografado na aplicação
  configuracoes jsonb DEFAULT '{}'::jsonb,
  
  ativo boolean DEFAULT false,
  ultima_sync timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(empresa_id, provider)
);

-- ============================================
-- JOBS/FILAS
-- ============================================

CREATE TABLE jobs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  
  tipo varchar(100) NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  
  prioridade int DEFAULT 0,
  status varchar(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'processando', 'sucesso', 'erro', 'cancelado')),
  
  tentativas int DEFAULT 0,
  max_tentativas int DEFAULT 3,
  erro text,
  resultados jsonb,
  
  agendado_para timestamptz,
  iniciado_em timestamptz,
  finalizado_em timestamptz,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_jobs_status ON jobs(status, prioridade DESC, created_at);
CREATE INDEX idx_jobs_agendado ON jobs(agendado_para) WHERE status = 'pendente';

-- ============================================
-- RLS POLICIES
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_produto ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentos_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE formas_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE caixa_sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE caixa_movimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE venda_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE venda_pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE centros_custo ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integracoes_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Policies para empresas (somente membros)
CREATE POLICY "empresas_select" ON empresas FOR SELECT
  USING (id = jwt_empresa_id());

CREATE POLICY "empresas_update" ON empresas FOR UPDATE
  USING (id = jwt_empresa_id() AND is_admin());

-- Policies genéricas para tabelas com empresa_id
-- Exemplo para produtos (aplicar padrão similar para outras tabelas)

CREATE POLICY "produtos_select" ON produtos FOR SELECT
  USING (empresa_id = jwt_empresa_id());

CREATE POLICY "produtos_insert" ON produtos FOR INSERT
  WITH CHECK (empresa_id = jwt_empresa_id() AND has_permission('produtos', 'criar'));

CREATE POLICY "produtos_update" ON produtos FOR UPDATE
  USING (empresa_id = jwt_empresa_id() AND has_permission('produtos', 'editar'));

CREATE POLICY "produtos_delete" ON produtos FOR DELETE
  USING (empresa_id = jwt_empresa_id() AND has_permission('produtos', 'excluir'));

-- Policies para perfis
CREATE POLICY "perfis_select" ON perfis FOR SELECT
  USING (empresa_id = jwt_empresa_id());

CREATE POLICY "perfis_all" ON perfis FOR ALL
  USING (empresa_id = jwt_empresa_id() AND is_admin());

-- Policies para usuários
CREATE POLICY "usuarios_select" ON usuarios FOR SELECT
  USING (empresa_id = jwt_empresa_id());

CREATE POLICY "usuarios_all" ON usuarios FOR ALL
  USING (empresa_id = jwt_empresa_id() AND is_admin());

-- Policies para vendas
CREATE POLICY "vendas_select" ON vendas FOR SELECT
  USING (empresa_id = jwt_empresa_id());

CREATE POLICY "vendas_insert" ON vendas FOR INSERT
  WITH CHECK (empresa_id = jwt_empresa_id() AND has_permission('pdv', 'criar'));

CREATE POLICY "vendas_update" ON vendas FOR UPDATE
  USING (empresa_id = jwt_empresa_id() AND has_permission('pdv', 'editar'));

-- Policies para caixa
CREATE POLICY "caixa_sessoes_select" ON caixa_sessoes FOR SELECT
  USING (empresa_id = jwt_empresa_id());

CREATE POLICY "caixa_sessoes_insert" ON caixa_sessoes FOR INSERT
  WITH CHECK (empresa_id = jwt_empresa_id() AND has_permission('caixa', 'criar'));

CREATE POLICY "caixa_sessoes_update" ON caixa_sessoes FOR UPDATE
  USING (empresa_id = jwt_empresa_id() AND has_permission('caixa', 'editar'));

-- Policies para financeiro
CREATE POLICY "contas_select" ON contas FOR SELECT
  USING (empresa_id = jwt_empresa_id());

CREATE POLICY "contas_all" ON contas FOR ALL
  USING (empresa_id = jwt_empresa_id() AND has_permission('financeiro', 'criar'));

-- Policies para auditoria (somente leitura para admins)
CREATE POLICY "audit_select" ON audit_logs FOR SELECT
  USING (empresa_id = jwt_empresa_id() AND has_permission('auditoria', 'visualizar'));

CREATE POLICY "audit_insert" ON audit_logs FOR INSERT
  WITH CHECK (empresa_id = jwt_empresa_id());

-- ============================================
-- TRIGGERS DE AUDITORIA
-- ============================================

CREATE OR REPLACE FUNCTION log_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (empresa_id, usuario_id, acao, modulo, entidade, entidade_id, dados_novos)
    VALUES (
      NEW.empresa_id,
      jwt_user_id(),
      'criar',
      TG_ARGV[0],
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (empresa_id, usuario_id, acao, modulo, entidade, entidade_id, dados_anteriores, dados_novos)
    VALUES (
      NEW.empresa_id,
      jwt_user_id(),
      'editar',
      TG_ARGV[0],
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (empresa_id, usuario_id, acao, modulo, entidade, entidade_id, dados_anteriores)
    VALUES (
      OLD.empresa_id,
      jwt_user_id(),
      'excluir',
      TG_ARGV[0],
      TG_TABLE_NAME,
      OLD.id,
      to_jsonb(OLD)
    );
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger em tabelas críticas
CREATE TRIGGER audit_produtos
  AFTER INSERT OR UPDATE OR DELETE ON produtos
  FOR EACH ROW EXECUTE FUNCTION log_changes('produtos');

CREATE TRIGGER audit_vendas
  AFTER INSERT OR UPDATE OR DELETE ON vendas
  FOR EACH ROW EXECUTE FUNCTION log_changes('pdv');

CREATE TRIGGER audit_caixa_sessoes
  AFTER INSERT OR UPDATE OR DELETE ON caixa_sessoes
  FOR EACH ROW EXECUTE FUNCTION log_changes('caixa');

CREATE TRIGGER audit_contas
  AFTER INSERT OR UPDATE OR DELETE ON contas
  FOR EACH ROW EXECUTE FUNCTION log_changes('financeiro');

CREATE TRIGGER audit_clientes
  AFTER INSERT OR UPDATE OR DELETE ON clientes
  FOR EACH ROW EXECUTE FUNCTION log_changes('clientes');

-- ============================================
-- TRIGGER PARA ATUALIZAR ESTOQUE
-- ============================================

CREATE OR REPLACE FUNCTION atualizar_estoque()
RETURNS TRIGGER AS $$
DECLARE
  v_qtd_anterior decimal(15,4);
  v_custo_anterior decimal(15,4);
  v_custo_novo decimal(15,4);
  v_qtd_nova decimal(15,4);
BEGIN
  -- Buscar valores atuais
  SELECT estoque_atual, custo_medio INTO v_qtd_anterior, v_custo_anterior
  FROM produtos WHERE id = NEW.produto_id;
  
  -- Calcular nova quantidade
  IF NEW.tipo = 'entrada' THEN
    v_qtd_nova := v_qtd_anterior + NEW.quantidade;
    -- Custo médio ponderado
    IF v_qtd_nova > 0 THEN
      v_custo_novo := ((v_qtd_anterior * v_custo_anterior) + (NEW.quantidade * NEW.custo_unitario)) / v_qtd_nova;
    ELSE
      v_custo_novo := NEW.custo_unitario;
    END IF;
  ELSIF NEW.tipo = 'saida' THEN
    v_qtd_nova := v_qtd_anterior - NEW.quantidade;
    v_custo_novo := v_custo_anterior; -- Custo médio não muda na saída
  ELSE -- ajuste
    v_qtd_nova := NEW.quantidade_posterior;
    v_custo_novo := COALESCE(NEW.custo_unitario, v_custo_anterior);
  END IF;
  
  -- Atualizar produto
  UPDATE produtos
  SET estoque_atual = v_qtd_nova,
      custo_medio = v_custo_novo,
      updated_at = now()
  WHERE id = NEW.produto_id;
  
  -- Preencher valores do movimento
  NEW.quantidade_anterior := v_qtd_anterior;
  NEW.quantidade_posterior := v_qtd_nova;
  NEW.custo_medio_anterior := v_custo_anterior;
  NEW.custo_medio_posterior := v_custo_novo;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_atualizar_estoque
  BEFORE INSERT ON movimentos_estoque
  FOR EACH ROW EXECUTE FUNCTION atualizar_estoque();

-- ============================================
-- TRIGGER PARA ATUALIZAR TOTAIS DO CAIXA
-- ============================================

CREATE OR REPLACE FUNCTION atualizar_totais_caixa()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE caixa_sessoes
  SET
    total_vendas = COALESCE((
      SELECT SUM(valor) FROM caixa_movimentos 
      WHERE caixa_sessao_id = NEW.caixa_sessao_id AND tipo = 'venda'
    ), 0),
    total_sangrias = COALESCE((
      SELECT SUM(valor) FROM caixa_movimentos 
      WHERE caixa_sessao_id = NEW.caixa_sessao_id AND tipo = 'sangria'
    ), 0),
    total_suprimentos = COALESCE((
      SELECT SUM(valor) FROM caixa_movimentos 
      WHERE caixa_sessao_id = NEW.caixa_sessao_id AND tipo = 'suprimento'
    ), 0),
    total_cancelamentos = COALESCE((
      SELECT SUM(valor) FROM caixa_movimentos 
      WHERE caixa_sessao_id = NEW.caixa_sessao_id AND tipo = 'cancelamento'
    ), 0),
    total_devolucoes = COALESCE((
      SELECT SUM(valor) FROM caixa_movimentos 
      WHERE caixa_sessao_id = NEW.caixa_sessao_id AND tipo = 'devolucao'
    ), 0),
    quantidade_vendas = (
      SELECT COUNT(*) FROM caixa_movimentos 
      WHERE caixa_sessao_id = NEW.caixa_sessao_id AND tipo = 'venda'
    )
  WHERE id = NEW.caixa_sessao_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_atualizar_totais_caixa
  AFTER INSERT OR UPDATE OR DELETE ON caixa_movimentos
  FOR EACH ROW EXECUTE FUNCTION atualizar_totais_caixa();

-- ============================================
-- SEEDS INICIAIS
-- ============================================

-- Função para criar empresa com dados iniciais
CREATE OR REPLACE FUNCTION criar_empresa_demo()
RETURNS void AS $$
DECLARE
  v_empresa_id uuid;
  v_perfil_admin_id uuid;
  v_perfil_caixa_id uuid;
  v_perfil_vendedor_id uuid;
BEGIN
  -- Criar empresa demo
  INSERT INTO empresas (razao_social, nome_fantasia, cnpj, email, telefone)
  VALUES ('FastPOS Demo LTDA', 'FastPOS Demo', '00.000.000/0001-00', 'demo@fastpos.com', '(11) 99999-9999')
  RETURNING id INTO v_empresa_id;
  
  -- Criar perfis
  INSERT INTO perfis (empresa_id, nome, descricao, sistema, permissoes)
  VALUES (v_empresa_id, 'Administrador', 'Acesso total ao sistema', true, 
    '[{"modulo": "dashboard", "acoes": ["visualizar"]},
      {"modulo": "pdv", "acoes": ["visualizar", "criar", "editar", "excluir", "aprovar"]},
      {"modulo": "caixa", "acoes": ["visualizar", "criar", "editar", "aprovar"]},
      {"modulo": "produtos", "acoes": ["visualizar", "criar", "editar", "excluir"]},
      {"modulo": "estoque", "acoes": ["visualizar", "criar", "editar", "aprovar"]},
      {"modulo": "clientes", "acoes": ["visualizar", "criar", "editar", "excluir"]},
      {"modulo": "financeiro", "acoes": ["visualizar", "criar", "editar", "excluir", "aprovar"]},
      {"modulo": "relatorios", "acoes": ["visualizar"]},
      {"modulo": "configuracoes", "acoes": ["visualizar", "editar"]},
      {"modulo": "usuarios", "acoes": ["visualizar", "criar", "editar", "excluir"]},
      {"modulo": "auditoria", "acoes": ["visualizar"]}]'::jsonb)
  RETURNING id INTO v_perfil_admin_id;
  
  INSERT INTO perfis (empresa_id, nome, descricao, sistema, permissoes)
  VALUES (v_empresa_id, 'Operador de Caixa', 'Acesso ao PDV e Caixa', true,
    '[{"modulo": "dashboard", "acoes": ["visualizar"]},
      {"modulo": "pdv", "acoes": ["visualizar", "criar"]},
      {"modulo": "caixa", "acoes": ["visualizar", "criar"]},
      {"modulo": "produtos", "acoes": ["visualizar"]},
      {"modulo": "clientes", "acoes": ["visualizar", "criar"]}]'::jsonb)
  RETURNING id INTO v_perfil_caixa_id;
  
  INSERT INTO perfis (empresa_id, nome, descricao, sistema, permissoes)
  VALUES (v_empresa_id, 'Vendedor', 'Acesso ao PDV', true,
    '[{"modulo": "dashboard", "acoes": ["visualizar"]},
      {"modulo": "pdv", "acoes": ["visualizar", "criar"]},
      {"modulo": "produtos", "acoes": ["visualizar"]},
      {"modulo": "clientes", "acoes": ["visualizar", "criar"]}]'::jsonb)
  RETURNING id INTO v_perfil_vendedor_id;
  
  -- Criar categorias
  INSERT INTO categorias_produto (empresa_id, nome, cor, ordem) VALUES
    (v_empresa_id, 'Bebidas', '#3B82F6', 1),
    (v_empresa_id, 'Alimentos', '#22C55E', 2),
    (v_empresa_id, 'Limpeza', '#8B5CF6', 3),
    (v_empresa_id, 'Higiene', '#EC4899', 4),
    (v_empresa_id, 'Outros', '#6B7280', 99);
  
  -- Criar formas de pagamento
  INSERT INTO formas_pagamento (empresa_id, nome, tipo, ordem) VALUES
    (v_empresa_id, 'Dinheiro', 'dinheiro', 1),
    (v_empresa_id, 'PIX', 'pix', 2),
    (v_empresa_id, 'Cartão de Crédito', 'credito', 3),
    (v_empresa_id, 'Cartão de Débito', 'debito', 4);
  
  -- Criar categorias financeiras
  INSERT INTO categorias_financeiras (empresa_id, tipo, nome, cor, ordem) VALUES
    (v_empresa_id, 'receita', 'Vendas', '#22C55E', 1),
    (v_empresa_id, 'receita', 'Serviços', '#3B82F6', 2),
    (v_empresa_id, 'receita', 'Outras Receitas', '#6B7280', 99),
    (v_empresa_id, 'despesa', 'Fornecedores', '#EF4444', 1),
    (v_empresa_id, 'despesa', 'Pessoal', '#F59E0B', 2),
    (v_empresa_id, 'despesa', 'Aluguel', '#8B5CF6', 3),
    (v_empresa_id, 'despesa', 'Utilidades', '#EC4899', 4),
    (v_empresa_id, 'despesa', 'Impostos', '#6366F1', 5),
    (v_empresa_id, 'despesa', 'Outras Despesas', '#6B7280', 99);
END;
$$ LANGUAGE plpgsql;

-- Executar seed (comentar em produção)
-- SELECT criar_empresa_demo();
