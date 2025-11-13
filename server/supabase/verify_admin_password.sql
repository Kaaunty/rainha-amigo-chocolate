-- ============================================
-- Função para verificar senha do admin
-- ============================================

CREATE OR REPLACE FUNCTION verify_admin_password(password_input TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  -- Buscar hash armazenado
  SELECT password_hash INTO stored_hash
  FROM admin
  LIMIT 1;
  
  -- Se não encontrou admin, retorna false
  IF stored_hash IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Comparar senha usando crypt (PostgreSQL)
  -- Nota: Você precisa ter a extensão pgcrypto habilitada
  RETURN crypt(password_input, stored_hash) = stored_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Alternativa usando bcrypt (se você estiver usando bcrypt no Supabase)
-- Você precisará instalar a extensão pgcrypto primeiro:
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Para criar um admin com senha hashada:
-- INSERT INTO admin (password_hash) 
-- VALUES (crypt('sua_senha', gen_salt('bf', 10)));

