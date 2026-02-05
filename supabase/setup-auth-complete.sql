-- ============================================
-- FASTPOS ERP - SETUP COMPLETO DE AUTENTICAÇÃO
-- Execute este script no Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Cole e Execute
-- ============================================

-- 1. Criar extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Criar tabela empresas (se não existir)
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

-- 3. Criar tabela perfis
CREATE TABLE IF NOT EXISTS perfis (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  nome varchar(100) NOT NULL,
  descricao text,
  permissoes jsonb DEFAULT '["*"]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 4. Criar tabela usuarios
CREATE TABLE IF NOT EXISTS usuarios (
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

-- 5. Inserir empresa demo
INSERT INTO empresas (razao_social, nome_fantasia, cnpj, email, telefone)
VALUES ('FastPOS Demonstração LTDA', 'FastPOS Demo', '00.000.000/0001-00', 'demo@fastpos.com', '(11) 99999-9999')
ON CONFLICT (cnpj) DO NOTHING;

-- 6. Inserir perfil administrador
INSERT INTO perfis (empresa_id, nome, descricao, permissoes)
SELECT id, 'Administrador', 'Acesso completo ao sistema', '["*"]'::jsonb
FROM empresas WHERE cnpj = '00.000.000/0001-00'
ON CONFLICT DO NOTHING;

-- 7. Habilitar RLS
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;

-- 8. Políticas RLS (permitir tudo durante desenvolvimento)
DROP POLICY IF EXISTS "allow_all_empresas" ON empresas;
DROP POLICY IF EXISTS "allow_all_usuarios" ON usuarios;
DROP POLICY IF EXISTS "allow_all_perfis" ON perfis;

CREATE POLICY "allow_all_empresas" ON empresas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_usuarios" ON usuarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_perfis" ON perfis FOR ALL USING (true) WITH CHECK (true);

-- 9. Função para criar usuário automaticamente no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_empresa_id uuid;
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
  
  -- Criar registro de usuário
  INSERT INTO usuarios (id, email, nome, empresa_id, ativo)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'nome', 
      NEW.raw_user_meta_data->>'name', 
      split_part(NEW.email, '@', 1)
    ),
    default_empresa_id,
    true
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 10. Remover trigger antigo e criar novo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 11. Verificar se tudo foi criado
DO $$
BEGIN
  RAISE NOTICE '✅ Setup completo!';
  RAISE NOTICE '📊 Empresas: %', (SELECT count(*) FROM empresas);
  RAISE NOTICE '👤 Perfis: %', (SELECT count(*) FROM perfis);
  RAISE NOTICE '🔐 Trigger criado: on_auth_user_created';
END $$;

-- ============================================
-- PRONTO! Agora você pode criar usuários
-- Acesse: http://localhost:5175/login
-- ============================================
