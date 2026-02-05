-- ============================================
-- FASTPOS ERP - SCRIPT DE INICIALIZAÇÃO RÁPIDA
-- Execute este script primeiro no Supabase SQL Editor
-- ============================================

-- 1. Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Remover função de auditoria se existir (cascade remove triggers automaticamente)
DROP FUNCTION IF EXISTS log_changes() CASCADE;

-- 3. Tabela Empresas (Tenant Principal)
CREATE TABLE IF NOT EXISTS empresas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  razao_social varchar(200) NOT NULL,
  nome_fantasia varchar(200) NOT NULL,
  cnpj varchar(18) UNIQUE NOT NULL,
  inscricao_estadual varchar(20),
  telefone varchar(20),
  email varchar(200),
  status varchar(20) DEFAULT 'ativa',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3.1 Tabela Perfis (para RBAC)
CREATE TABLE IF NOT EXISTS perfis (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  nome varchar(100) NOT NULL,
  descricao text,
  permissoes jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 3.2 Tabela Usuários (vinculada ao auth.users do Supabase)
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY, -- Este ID vem do auth.users
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

-- 4. Tabela Produtos
CREATE TABLE IF NOT EXISTS produtos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  codigo varchar(50) NOT NULL,
  codigo_barras varchar(50),
  nome varchar(200) NOT NULL,
  descricao text,
  preco_custo decimal(15,4) DEFAULT 0,
  preco_venda decimal(15,4) NOT NULL,
  estoque_atual decimal(15,4) DEFAULT 0,
  estoque_minimo decimal(15,4) DEFAULT 0,
  ativo boolean DEFAULT true,
  imagem text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Tabela Clientes
CREATE TABLE IF NOT EXISTS clientes (
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
  bairro varchar(100),
  cidade varchar(100),
  uf char(2),
  cep varchar(10),
  limite_credito decimal(15,2) DEFAULT 0,
  saldo_devedor decimal(15,2) DEFAULT 0,
  dias_atraso int DEFAULT 0,
  total_compras decimal(15,2) DEFAULT 0,
  ticket_medio decimal(15,2) DEFAULT 0,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Tabela Vendas
CREATE TABLE IF NOT EXISTS vendas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  numero serial,
  cliente_id uuid REFERENCES clientes(id),
  vendedor_id uuid,
  caixa_id uuid,
  status varchar(20) DEFAULT 'rascunho',
  subtotal decimal(15,2) DEFAULT 0,
  desconto decimal(15,2) DEFAULT 0,
  acrescimo decimal(15,2) DEFAULT 0,
  total decimal(15,2) DEFAULT 0,
  observacao text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  finalizada_em timestamptz,
  cancelada_em timestamptz,
  motivo_cancelamento text
);

-- 6. Tabela Contas Financeiras
CREATE TABLE IF NOT EXISTS contas_financeiras (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  tipo varchar(10) NOT NULL CHECK (tipo IN ('pagar', 'receber')),
  descricao varchar(200) NOT NULL,
  valor decimal(15,2) NOT NULL,
  data_vencimento date NOT NULL,
  data_pagamento date,
  status varchar(20) DEFAULT 'pendente',
  observacao text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 7. Tabela Caixa (Sessões)
CREATE TABLE IF NOT EXISTS caixa_sessoes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  usuario_id uuid,
  status varchar(20) DEFAULT 'aberto',
  saldo_abertura decimal(15,2) NOT NULL,
  saldo_fechamento decimal(15,2),
  total_vendas decimal(15,2) DEFAULT 0,
  total_sangrias decimal(15,2) DEFAULT 0,
  total_suprimentos decimal(15,2) DEFAULT 0,
  aberto_em timestamptz DEFAULT now(),
  fechado_em timestamptz,
  observacao_abertura text,
  observacao_fechamento text
);

-- 8. Inserir empresa de demonstração
INSERT INTO empresas (razao_social, nome_fantasia, cnpj, email, telefone)
VALUES ('FastPOS Demonstração LTDA', 'FastPOS Demo', '00.000.000/0001-00', 'demo@fastpos.com', '(11) 99999-9999')
ON CONFLICT (cnpj) DO NOTHING;

-- 9. Inserir produtos de demonstração
WITH empresa AS (SELECT id FROM empresas WHERE cnpj = '00.000.000/0001-00')
INSERT INTO produtos (empresa_id, codigo, nome, preco_venda, estoque_atual, estoque_minimo)
SELECT 
  empresa.id,
  codigo,
  nome,
  preco,
  estoque,
  10
FROM empresa,
(VALUES 
  ('001', 'Coca-Cola 350ml', 5.50, 50),
  ('002', 'Guaraná Antarctica 350ml', 4.50, 45),
  ('003', 'Água Mineral 500ml', 3.00, 100),
  ('004', 'Salgado Coxinha', 8.00, 20),
  ('005', 'Pão de Queijo', 4.00, 30),
  ('006', 'Café Expresso', 6.00, 999),
  ('007', 'Suco Natural Laranja', 12.00, 25),
  ('008', 'Chocolate Barra', 7.50, 40),
  ('009', 'Biscoito Recheado', 5.00, 60),
  ('010', 'Energético 250ml', 12.00, 35)
) AS dados(codigo, nome, preco, estoque)
ON CONFLICT DO NOTHING;

-- 10. Inserir clientes de demonstração
WITH empresa AS (SELECT id FROM empresas WHERE cnpj = '00.000.000/0001-00')
INSERT INTO clientes (empresa_id, documento, nome, email, telefone, limite_credito)
SELECT 
  empresa.id,
  documento,
  nome,
  email,
  telefone,
  limite
FROM empresa,
(VALUES 
  ('123.456.789-00', 'João Silva', 'joao@email.com', '(11) 99999-1111', 1000.00),
  ('234.567.890-11', 'Maria Santos', 'maria@email.com', '(11) 99999-2222', 2000.00),
  ('345.678.901-22', 'Pedro Costa', 'pedro@email.com', '(11) 99999-3333', 1500.00),
  ('456.789.012-33', 'Ana Oliveira', 'ana@email.com', '(11) 99999-4444', 3000.00),
  ('567.890.123-44', 'Carlos Pereira', 'carlos@email.com', '(11) 99999-5555', 500.00)
) AS dados(documento, nome, email, telefone, limite)
ON CONFLICT DO NOTHING;

-- 11. Habilitar RLS (Row Level Security)
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE caixa_sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;

-- 12. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Permitir leitura pública empresas" ON empresas;
DROP POLICY IF EXISTS "Permitir leitura pública produtos" ON produtos;
DROP POLICY IF EXISTS "Permitir leitura pública clientes" ON clientes;
DROP POLICY IF EXISTS "Permitir leitura pública vendas" ON vendas;
DROP POLICY IF EXISTS "Permitir leitura pública contas" ON contas_financeiras;
DROP POLICY IF EXISTS "Permitir leitura pública caixa" ON caixa_sessoes;
DROP POLICY IF EXISTS "Permitir leitura usuarios" ON usuarios;
DROP POLICY IF EXISTS "Permitir leitura perfis" ON perfis;
DROP POLICY IF EXISTS "Permitir insert produtos" ON produtos;
DROP POLICY IF EXISTS "Permitir update produtos" ON produtos;
DROP POLICY IF EXISTS "Permitir delete produtos" ON produtos;
DROP POLICY IF EXISTS "Permitir insert clientes" ON clientes;
DROP POLICY IF EXISTS "Permitir update clientes" ON clientes;
DROP POLICY IF EXISTS "Permitir delete clientes" ON clientes;
DROP POLICY IF EXISTS "Permitir insert vendas" ON vendas;
DROP POLICY IF EXISTS "Permitir update vendas" ON vendas;
DROP POLICY IF EXISTS "Permitir insert contas" ON contas_financeiras;
DROP POLICY IF EXISTS "Permitir update contas" ON contas_financeiras;
DROP POLICY IF EXISTS "Permitir insert caixa" ON caixa_sessoes;
DROP POLICY IF EXISTS "Permitir update caixa" ON caixa_sessoes;
DROP POLICY IF EXISTS "Permitir insert usuarios" ON usuarios;
DROP POLICY IF EXISTS "Permitir update usuarios" ON usuarios;
DROP POLICY IF EXISTS "Usuarios ver proprio" ON usuarios;

-- 13. Políticas RLS permissivas para desenvolvimento (permitir acesso anônimo para leitura)
CREATE POLICY "Permitir leitura pública empresas" ON empresas FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública produtos" ON produtos FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública clientes" ON clientes FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública vendas" ON vendas FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública contas" ON contas_financeiras FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública caixa" ON caixa_sessoes FOR SELECT USING (true);
CREATE POLICY "Permitir leitura perfis" ON perfis FOR SELECT USING (true);

-- Usuários podem ver seu próprio registro
CREATE POLICY "Usuarios ver proprio" ON usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Permitir leitura usuarios" ON usuarios FOR SELECT USING (true);

-- 14. Políticas para inserção/atualização (durante desenvolvimento)
CREATE POLICY "Permitir insert produtos" ON produtos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir update produtos" ON produtos FOR UPDATE USING (true);
CREATE POLICY "Permitir delete produtos" ON produtos FOR DELETE USING (true);

CREATE POLICY "Permitir insert clientes" ON clientes FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir update clientes" ON clientes FOR UPDATE USING (true);
CREATE POLICY "Permitir delete clientes" ON clientes FOR DELETE USING (true);

CREATE POLICY "Permitir insert vendas" ON vendas FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir update vendas" ON vendas FOR UPDATE USING (true);

CREATE POLICY "Permitir insert contas" ON contas_financeiras FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir update contas" ON contas_financeiras FOR UPDATE USING (true);

CREATE POLICY "Permitir insert caixa" ON caixa_sessoes FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir update caixa" ON caixa_sessoes FOR UPDATE USING (true);

CREATE POLICY "Permitir insert usuarios" ON usuarios FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir update usuarios" ON usuarios FOR UPDATE USING (auth.uid() = id);

-- 15. Função e Trigger para criar registro de usuário automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_empresa_id uuid;
BEGIN
  -- Buscar empresa demo
  SELECT id INTO default_empresa_id FROM empresas WHERE cnpj = '00.000.000/0001-00' LIMIT 1;
  
  -- Criar registro de usuário
  INSERT INTO public.usuarios (id, email, nome, empresa_id, ativo)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    default_empresa_id,
    true
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar trigger para novos usuários
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 16. Inserir perfil padrão de administrador
WITH empresa AS (SELECT id FROM empresas WHERE cnpj = '00.000.000/0001-00')
INSERT INTO perfis (empresa_id, nome, descricao, permissoes)
SELECT 
  empresa.id,
  'Administrador',
  'Acesso completo ao sistema',
  '["*"]'::jsonb
FROM empresa
ON CONFLICT DO NOTHING;

-- ============================================
-- SCRIPT EXECUTADO COM SUCESSO!
-- Agora você pode:
-- 1. Acessar http://localhost:5173/login
-- 2. Criar uma conta
-- 3. O usuário será vinculado à empresa demo automaticamente
-- ============================================
