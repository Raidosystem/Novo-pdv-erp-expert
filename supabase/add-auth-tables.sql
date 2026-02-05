-- ============================================
-- FASTPOS ERP - ADICIONAR TABELAS DE AUTENTICAÇÃO
-- Execute APÓS o quick-setup.sql
-- ============================================

-- 1. Tabela Perfis (para RBAC)
CREATE TABLE IF NOT EXISTS perfis (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  nome varchar(100) NOT NULL,
  descricao text,
  permissoes jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 2. Tabela Usuários (vinculada ao auth.users do Supabase)
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

-- 3. Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS
DROP POLICY IF EXISTS "Permitir leitura usuarios" ON usuarios;
DROP POLICY IF EXISTS "Usuarios ver proprio" ON usuarios;
DROP POLICY IF EXISTS "Permitir insert usuarios" ON usuarios;
DROP POLICY IF EXISTS "Permitir update usuarios" ON usuarios;
DROP POLICY IF EXISTS "Permitir leitura perfis" ON perfis;

CREATE POLICY "Permitir leitura perfis" ON perfis FOR SELECT USING (true);
CREATE POLICY "Usuarios ver proprio" ON usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Permitir leitura usuarios" ON usuarios FOR SELECT USING (true);
CREATE POLICY "Permitir insert usuarios" ON usuarios FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir update usuarios" ON usuarios FOR UPDATE USING (auth.uid() = id);

-- 5. Função para criar usuário automaticamente
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

-- 6. Trigger para novos usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Inserir perfil padrão
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
-- TABELAS DE AUTH CRIADAS!
-- Agora você pode cadastrar usuários
-- ============================================
