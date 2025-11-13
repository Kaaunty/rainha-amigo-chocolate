-- ============================================
-- Script para criar usuário admin com crypt
-- Requer extensão pgcrypto
-- ============================================

-- Habilitar extensão pgcrypto (se ainda não estiver habilitada)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Criar admin com senha hashada usando crypt
-- Substitua 'sua_senha_aqui' pela senha desejada
INSERT INTO admin (password_hash) 
VALUES (crypt('sua_senha_aqui', gen_salt('bf', 10)))
ON CONFLICT DO NOTHING;

-- Para verificar se foi criado:
-- SELECT * FROM admin;

-- Para testar a função:
-- SELECT verify_admin_password('sua_senha_aqui'); -- deve retornar true
-- SELECT verify_admin_password('senha_errada'); -- deve retornar false

