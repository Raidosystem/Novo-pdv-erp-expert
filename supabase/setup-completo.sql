-- ============================================
-- FASTPOS ERP - SETUP COMPLETO ÚNICO
-- Execute SOMENTE este arquivo no Supabase
-- Dashboard > SQL Editor > New Query > Cole e Execute
-- ============================================

-- IMPORTANTE: Este script substitui todos os outros:
-- - quick-setup.sql
-- - add-auth-tables.sql  
-- - setup-auth-complete.sql
-- - schema.sql
-- Use APENAS este arquivo!

-- ============================================
-- 1. EXTENSÕES
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 2. LIMPAR OBJETOS ANTIGOS (se existirem)
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS log_changes() CASCADE;

-- Dropar todas as tabelas para garantir estrutura correta
DROP TABLE IF EXISTS venda_pagamentos CASCADE;
DROP TABLE IF EXISTS venda_itens CASCADE;
DROP TABLE IF EXISTS vendas CASCADE;
DROP TABLE IF EXISTS caixa_sessoes CASCADE;
DROP TABLE IF EXISTS contas_financeiras CASCADE;
DROP TABLE IF EXISTS centros_custo CASCADE;
DROP TABLE IF EXISTS categorias_financeiras CASCADE;
DROP TABLE IF EXISTS contas_bancarias CASCADE;
DROP TABLE IF EXISTS formas_pagamento CASCADE;
DROP TABLE IF EXISTS fornecedores CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS produtos CASCADE;
DROP TABLE IF EXISTS categorias_produto CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS perfis CASCADE;
DROP TABLE IF EXISTS empresas CASCADE;

-- ============================================
-- 3. TABELA EMPRESAS
-- ============================================
CREATE TABLE empresas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  razao_social varchar(200) NOT NULL,
  nome_fantasia varchar(200) NOT NULL,
  cnpj varchar(18) UNIQUE NOT NULL,
  inscricao_estadual varchar(20),
  inscricao_municipal varchar(20),
  regime varchar(20) DEFAULT 'simples',
  
  -- Endereço
  logradouro varchar(200),
  numero varchar(20),
  complemento varchar(100),
  bairro varchar(100),
  cidade varchar(100),
  uf char(2),
  cep varchar(10),
  
  telefone varchar(20),
  email varchar(200),
  logo text,
  
  status varchar(20) DEFAULT 'ativa',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- 4. TABELA PERFIS
-- ============================================
CREATE TABLE perfis (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  nome varchar(100) NOT NULL,
  descricao text,
  permissoes jsonb DEFAULT '["*"]'::jsonb,
  sistema boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 5. TABELA USUARIOS
-- ============================================
CREATE TABLE usuarios (
  id uuid PRIMARY KEY,
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  email varchar(200) NOT NULL,
  nome varchar(200) NOT NULL,
  avatar text,
  perfil_id uuid REFERENCES perfis(id),
  pin varchar(10),
  ativo boolean DEFAULT true,
  ultimo_acesso timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- 6. TABELA CATEGORIAS_PRODUTO
-- ============================================
CREATE TABLE categorias_produto (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  nome varchar(100) NOT NULL,
  descricao text,
  cor varchar(7),
  icone varchar(50),
  ordem int DEFAULT 0,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 7. TABELA PRODUTOS
-- ============================================
CREATE TABLE produtos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  
  codigo varchar(50) NOT NULL,
  codigo_barras varchar(50),
  nome varchar(200) NOT NULL,
  descricao text,
  categoria_id uuid REFERENCES categorias_produto(id),
  unidade varchar(10) DEFAULT 'UN',
  
  preco_custo decimal(15,4) DEFAULT 0,
  preco_venda decimal(15,4) NOT NULL,
  
  estoque_atual decimal(15,4) DEFAULT 0,
  estoque_minimo decimal(15,4) DEFAULT 0,
  estoque_maximo decimal(15,4) DEFAULT 0,
  custo_medio decimal(15,4) DEFAULT 0,
  
  ativo boolean DEFAULT true,
  imagem text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- 8. TABELA CLIENTES
-- ============================================
CREATE TABLE clientes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  
  tipo char(2) DEFAULT 'pf',
  documento varchar(18) NOT NULL,
  nome varchar(200) NOT NULL,
  nome_fantasia varchar(200),
  
  email varchar(200),
  telefone varchar(20),
  celular varchar(20),
  
  logradouro varchar(200),
  numero varchar(20),
  complemento varchar(100),
  bairro varchar(100),
  cidade varchar(100),
  uf char(2),
  cep varchar(10),
  
  limite_credito decimal(15,2) DEFAULT 0,
  saldo_devedor decimal(15,2) DEFAULT 0,
  dias_atraso int DEFAULT 0,
  total_compras decimal(15,2) DEFAULT 0,
  ticket_medio decimal(15,2) DEFAULT 0,
  ultima_compra timestamptz,
  
  observacoes text,
  ativo boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- 9. TABELA FORNECEDORES
-- ============================================
CREATE TABLE fornecedores (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  
  tipo char(2) DEFAULT 'pj',
  documento varchar(18) NOT NULL,
  nome varchar(200) NOT NULL,
  nome_fantasia varchar(200),
  
  email varchar(200),
  telefone varchar(20),
  celular varchar(20),
  contato varchar(100),
  
  logradouro varchar(200),
  numero varchar(20),
  complemento varchar(100),
  bairro varchar(100),
  cidade varchar(100),
  uf char(2),
  cep varchar(10),
  
  banco varchar(100),
  agencia varchar(20),
  conta varchar(30),
  pix varchar(100),
  
  observacoes text,
  ativo boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- 10. TABELA FORMAS_PAGAMENTO
-- ============================================
CREATE TABLE formas_pagamento (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  
  nome varchar(100) NOT NULL,
  tipo varchar(20) NOT NULL DEFAULT 'outros',
  
  taxa_percentual decimal(5,2) DEFAULT 0,
  taxa_fixa decimal(15,2) DEFAULT 0,
  prazo_recebimento int DEFAULT 0,
  
  ativo boolean DEFAULT true,
  ordem int DEFAULT 0,
  
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 11. TABELA CONTAS_BANCARIAS
-- ============================================
CREATE TABLE contas_bancarias (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  
  nome varchar(100) NOT NULL,
  tipo varchar(20) DEFAULT 'corrente',
  
  banco varchar(100),
  agencia varchar(20),
  numero_conta varchar(30),
  digito varchar(5),
  
  saldo_inicial decimal(15,2) DEFAULT 0,
  saldo_atual decimal(15,2) DEFAULT 0,
  
  cor varchar(7),
  ativo boolean DEFAULT true,
  principal boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- 12. TABELA CATEGORIAS_FINANCEIRAS
-- ============================================
CREATE TABLE categorias_financeiras (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  
  tipo varchar(20) NOT NULL,
  nome varchar(100) NOT NULL,
  cor varchar(7),
  pai_id uuid REFERENCES categorias_financeiras(id),
  ordem int DEFAULT 0,
  ativo boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 13. TABELA CENTROS_CUSTO
-- ============================================
CREATE TABLE centros_custo (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  
  codigo varchar(20) NOT NULL,
  nome varchar(100) NOT NULL,
  ativo boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 14. TABELA CONTAS_FINANCEIRAS
-- ============================================
CREATE TABLE contas_financeiras (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  
  tipo varchar(20) NOT NULL,
  
  descricao varchar(200) NOT NULL,
  categoria_id uuid REFERENCES categorias_financeiras(id),
  centro_custo_id uuid REFERENCES centros_custo(id),
  
  cliente_id uuid REFERENCES clientes(id),
  fornecedor_id uuid REFERENCES fornecedores(id),
  
  documento_tipo varchar(50),
  documento_id uuid,
  documento_numero varchar(50),
  
  valor_original decimal(15,2) NOT NULL,
  valor_pago decimal(15,2) DEFAULT 0,
  
  data_emissao date NOT NULL DEFAULT CURRENT_DATE,
  data_vencimento date NOT NULL,
  data_pagamento date,
  
  forma_pagamento_id uuid REFERENCES formas_pagamento(id),
  conta_bancaria_id uuid REFERENCES contas_bancarias(id),
  
  status varchar(20) DEFAULT 'pendente',
  
  recorrente boolean DEFAULT false,
  recorrencia_config jsonb,
  
  observacao text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- 15. TABELA CAIXA_SESSOES
-- ============================================
CREATE TABLE caixa_sessoes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  
  numero serial,
  operador_id uuid REFERENCES usuarios(id),
  
  status varchar(20) DEFAULT 'aberto',
  
  valor_abertura decimal(15,2) NOT NULL DEFAULT 0,
  valor_fechamento decimal(15,2),
  valor_esperado decimal(15,2),
  diferenca decimal(15,2),
  
  total_vendas decimal(15,2) DEFAULT 0,
  total_cancelamentos decimal(15,2) DEFAULT 0,
  total_devolucoes decimal(15,2) DEFAULT 0,
  total_sangrias decimal(15,2) DEFAULT 0,
  total_suprimentos decimal(15,2) DEFAULT 0,
  quantidade_vendas int DEFAULT 0,
  
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

-- ============================================
-- 16. TABELA VENDAS
-- ============================================
CREATE TABLE vendas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  
  numero serial,
  serie int DEFAULT 1,
  
  cliente_id uuid REFERENCES clientes(id),
  vendedor_id uuid REFERENCES usuarios(id),
  caixa_sessao_id uuid REFERENCES caixa_sessoes(id),
  
  subtotal decimal(15,2) NOT NULL DEFAULT 0,
  desconto_percentual decimal(5,2) DEFAULT 0,
  desconto_valor decimal(15,2) DEFAULT 0,
  acrescimo decimal(15,2) DEFAULT 0,
  total decimal(15,2) NOT NULL DEFAULT 0,
  troco decimal(15,2) DEFAULT 0,
  
  status varchar(20) DEFAULT 'rascunho',
  motivo_cancelamento text,
  
  observacao text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  finalizada_em timestamptz,
  cancelada_em timestamptz
);

-- ============================================
-- 17. TABELA VENDA_ITENS
-- ============================================
CREATE TABLE venda_itens (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  venda_id uuid REFERENCES vendas(id) ON DELETE CASCADE,
  produto_id uuid REFERENCES produtos(id),
  
  quantidade decimal(15,4) NOT NULL,
  preco_unitario decimal(15,4) NOT NULL,
  custo_unitario decimal(15,4) DEFAULT 0,
  
  desconto_percentual decimal(5,2) DEFAULT 0,
  desconto_valor decimal(15,2) DEFAULT 0
);

-- ============================================
-- 18. TABELA VENDA_PAGAMENTOS
-- ============================================
CREATE TABLE venda_pagamentos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  venda_id uuid REFERENCES vendas(id) ON DELETE CASCADE,
  forma_pagamento_id uuid REFERENCES formas_pagamento(id),
  
  valor decimal(15,2) NOT NULL,
  troco decimal(15,2) DEFAULT 0,
  
  bandeira varchar(50),
  nsu varchar(50),
  autorizacao varchar(50),
  parcelas int DEFAULT 1,
  
  status varchar(20) DEFAULT 'pendente',
  
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 19. HABILITAR RLS EM TODAS AS TABELAS
-- ============================================
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_produto ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE formas_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_bancarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE centros_custo ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE caixa_sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE venda_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE venda_pagamentos ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 20. POLÍTICAS RLS PERMISSIVAS (DESENVOLVIMENTO)
-- ============================================

-- Remover políticas antigas
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Políticas permissivas para todas as tabelas
CREATE POLICY "allow_all" ON empresas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON perfis FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON usuarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON categorias_produto FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON produtos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON fornecedores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON formas_pagamento FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON contas_bancarias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON categorias_financeiras FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON centros_custo FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON contas_financeiras FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON caixa_sessoes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON vendas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON venda_itens FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON venda_pagamentos FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 21. FUNÇÃO PARA CRIAR USUÁRIO AUTOMATICAMENTE
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_empresa_id uuid;
  default_perfil_id uuid;
BEGIN
  -- Buscar empresa demo
  SELECT id INTO default_empresa_id 
  FROM empresas 
  WHERE cnpj = '00.000.000/0001-00' 
  LIMIT 1;
  
  -- Se não encontrar empresa, criar uma
  IF default_empresa_id IS NULL THEN
    INSERT INTO empresas (razao_social, nome_fantasia, cnpj, email)
    VALUES ('FastPOS Demo', 'FastPOS Demo', '00.000.000/0001-00', 'demo@fastpos.com')
    RETURNING id INTO default_empresa_id;
  END IF;
  
  -- Buscar perfil Administrador
  SELECT id INTO default_perfil_id
  FROM perfis
  WHERE empresa_id = default_empresa_id AND nome = 'Administrador'
  LIMIT 1;
  
  -- Criar registro de usuário
  INSERT INTO usuarios (id, email, nome, empresa_id, perfil_id, ativo)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'nome', 
      NEW.raw_user_meta_data->>'name', 
      split_part(NEW.email, '@', 1)
    ),
    default_empresa_id,
    default_perfil_id,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    ultimo_acesso = now();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- ============================================
-- 22. TRIGGER PARA NOVOS USUÁRIOS
-- ============================================
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 23. DADOS INICIAIS
-- ============================================

-- Empresa demo
INSERT INTO empresas (razao_social, nome_fantasia, cnpj, email, telefone)
VALUES ('FastPOS Demonstração LTDA', 'FastPOS Demo', '00.000.000/0001-00', 'demo@fastpos.com', '(11) 99999-9999')
ON CONFLICT (cnpj) DO NOTHING;

-- Perfil Administrador
INSERT INTO perfis (empresa_id, nome, descricao, permissoes, sistema)
SELECT id, 'Administrador', 'Acesso completo ao sistema', '["*"]'::jsonb, true
FROM empresas WHERE cnpj = '00.000.000/0001-00'
ON CONFLICT DO NOTHING;

-- Categorias de produto
INSERT INTO categorias_produto (empresa_id, nome, cor, ordem)
SELECT e.id, c.nome, c.cor, c.ordem
FROM empresas e, (VALUES 
  ('Bebidas', '#3B82F6', 1),
  ('Alimentos', '#22C55E', 2),
  ('Limpeza', '#8B5CF6', 3),
  ('Higiene', '#EC4899', 4),
  ('Outros', '#6B7280', 99)
) AS c(nome, cor, ordem)
WHERE e.cnpj = '00.000.000/0001-00'
ON CONFLICT DO NOTHING;

-- Formas de pagamento
INSERT INTO formas_pagamento (empresa_id, nome, tipo, ordem)
SELECT e.id, f.nome, f.tipo, f.ordem
FROM empresas e, (VALUES 
  ('Dinheiro', 'dinheiro', 1),
  ('PIX', 'pix', 2),
  ('Cartão de Crédito', 'credito', 3),
  ('Cartão de Débito', 'debito', 4)
) AS f(nome, tipo, ordem)
WHERE e.cnpj = '00.000.000/0001-00'
ON CONFLICT DO NOTHING;

-- Categorias financeiras
INSERT INTO categorias_financeiras (empresa_id, tipo, nome, cor, ordem)
SELECT e.id, c.tipo, c.nome, c.cor, c.ordem
FROM empresas e, (VALUES 
  ('receita', 'Vendas', '#22C55E', 1),
  ('receita', 'Serviços', '#3B82F6', 2),
  ('receita', 'Outras Receitas', '#6B7280', 99),
  ('despesa', 'Fornecedores', '#EF4444', 1),
  ('despesa', 'Pessoal', '#F59E0B', 2),
  ('despesa', 'Aluguel', '#8B5CF6', 3),
  ('despesa', 'Utilidades', '#EC4899', 4),
  ('despesa', 'Impostos', '#6366F1', 5),
  ('despesa', 'Outras Despesas', '#6B7280', 99)
) AS c(tipo, nome, cor, ordem)
WHERE e.cnpj = '00.000.000/0001-00'
ON CONFLICT DO NOTHING;

-- Centros de custo
INSERT INTO centros_custo (empresa_id, codigo, nome)
SELECT e.id, c.codigo, c.nome
FROM empresas e, (VALUES 
  ('001', 'Administrativo'),
  ('002', 'Comercial'),
  ('003', 'Operacional'),
  ('004', 'Financeiro')
) AS c(codigo, nome)
WHERE e.cnpj = '00.000.000/0001-00'
ON CONFLICT DO NOTHING;

-- Contas bancárias
INSERT INTO contas_bancarias (empresa_id, nome, tipo, banco, saldo_inicial, saldo_atual, cor, principal)
SELECT e.id, c.nome, c.tipo, c.banco, c.saldo, c.saldo, c.cor, c.principal
FROM empresas e, (VALUES 
  ('Caixa Loja', 'caixa', NULL, 1000.00, '#22C55E', true),
  ('Conta Corrente', 'corrente', 'Banco do Brasil', 5000.00, '#3B82F6', false),
  ('Conta Poupança', 'poupanca', 'Caixa Econômica', 10000.00, '#8B5CF6', false)
) AS c(nome, tipo, banco, saldo, cor, principal)
WHERE e.cnpj = '00.000.000/0001-00'
ON CONFLICT DO NOTHING;

-- Produtos demo
INSERT INTO produtos (empresa_id, codigo, nome, preco_venda, preco_custo, estoque_atual, estoque_minimo, categoria_id)
SELECT 
  e.id,
  p.codigo,
  p.nome,
  p.preco_venda,
  p.preco_custo,
  p.estoque,
  10,
  (SELECT id FROM categorias_produto WHERE empresa_id = e.id AND nome = p.categoria LIMIT 1)
FROM empresas e, (VALUES 
  ('001', 'Coca-Cola 350ml', 5.50, 3.20, 50, 'Bebidas'),
  ('002', 'Guaraná Antarctica 350ml', 4.50, 2.80, 45, 'Bebidas'),
  ('003', 'Água Mineral 500ml', 3.00, 1.20, 100, 'Bebidas'),
  ('004', 'Salgado Coxinha', 8.00, 4.00, 20, 'Alimentos'),
  ('005', 'Pão de Queijo', 4.00, 2.00, 30, 'Alimentos'),
  ('006', 'Café Expresso', 6.00, 2.50, 999, 'Alimentos'),
  ('007', 'Suco Natural Laranja', 12.00, 6.00, 25, 'Bebidas'),
  ('008', 'Chocolate Barra', 7.50, 4.50, 40, 'Alimentos'),
  ('009', 'Sabonete Dove', 4.50, 2.80, 60, 'Higiene'),
  ('010', 'Detergente 500ml', 3.99, 2.50, 35, 'Limpeza')
) AS p(codigo, nome, preco_venda, preco_custo, estoque, categoria)
WHERE e.cnpj = '00.000.000/0001-00'
ON CONFLICT DO NOTHING;

-- Clientes demo
INSERT INTO clientes (empresa_id, documento, nome, email, telefone, cidade, uf, limite_credito)
SELECT e.id, c.documento, c.nome, c.email, c.telefone, 'São Paulo', 'SP', c.limite
FROM empresas e, (VALUES 
  ('123.456.789-00', 'João Silva', 'joao@email.com', '(11) 99999-1111', 1000.00),
  ('234.567.890-11', 'Maria Santos', 'maria@email.com', '(11) 99999-2222', 2000.00),
  ('345.678.901-22', 'Pedro Costa', 'pedro@email.com', '(11) 99999-3333', 1500.00)
) AS c(documento, nome, email, telefone, limite)
WHERE e.cnpj = '00.000.000/0001-00'
ON CONFLICT DO NOTHING;

-- Fornecedores demo
INSERT INTO fornecedores (empresa_id, documento, nome, nome_fantasia, email, telefone, cidade, uf)
SELECT e.id, f.documento, f.nome, f.fantasia, f.email, f.telefone, 'São Paulo', 'SP'
FROM empresas e, (VALUES 
  ('12.345.678/0001-90', 'Distribuidora ABC LTDA', 'Dist. ABC', 'contato@distabc.com', '(11) 3333-4444'),
  ('98.765.432/0001-10', 'Atacado XYZ S/A', 'Atacado XYZ', 'vendas@atacadoxyz.com', '(11) 5555-6666')
) AS f(documento, nome, fantasia, email, telefone)
WHERE e.cnpj = '00.000.000/0001-00'
ON CONFLICT DO NOTHING;

-- ============================================
-- ✅ SETUP COMPLETO!
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ FASTPOS ERP - SETUP COMPLETO!';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Empresas: %', (SELECT count(*) FROM empresas);
  RAISE NOTICE '👤 Perfis: %', (SELECT count(*) FROM perfis);
  RAISE NOTICE '📦 Produtos: %', (SELECT count(*) FROM produtos);
  RAISE NOTICE '👥 Clientes: %', (SELECT count(*) FROM clientes);
  RAISE NOTICE '🏢 Fornecedores: %', (SELECT count(*) FROM fornecedores);
  RAISE NOTICE '💳 Formas Pagamento: %', (SELECT count(*) FROM formas_pagamento);
  RAISE NOTICE '🏦 Contas Bancárias: %', (SELECT count(*) FROM contas_bancarias);
  RAISE NOTICE '📂 Categorias Financeiras: %', (SELECT count(*) FROM categorias_financeiras);
  RAISE NOTICE '🏷️ Centros de Custo: %', (SELECT count(*) FROM centros_custo);
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Trigger criado: on_auth_user_created';
  RAISE NOTICE '';
  RAISE NOTICE 'Agora você pode criar usuários em:';
  RAISE NOTICE 'https://novo-pdv-erp-expert.vercel.app/login';
  RAISE NOTICE '============================================';
END $$;
