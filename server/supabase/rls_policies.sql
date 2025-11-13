-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
-- RLS desabilitado - acesso livre às tabelas

-- Desabilitar RLS nas tabelas
ALTER TABLE participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE config DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes (se houver)
DROP POLICY IF EXISTS "Anyone can insert participants" ON participants;
DROP POLICY IF EXISTS "Anyone can read participant by token" ON participants;
DROP POLICY IF EXISTS "Admin can read all participants" ON participants;
DROP POLICY IF EXISTS "Admin can update participants" ON participants;
DROP POLICY IF EXISTS "Anyone can read config" ON config;
DROP POLICY IF EXISTS "Admin can insert config" ON config;
DROP POLICY IF EXISTS "Admin can update config" ON config;
DROP POLICY IF EXISTS "Admin can read admin table" ON admin;

