-- ============================================
-- Script para criar usuário admin inicial
-- ============================================

-- IMPORTANTE: Substitua 'SUA_SENHA_AQUI' pelo hash bcrypt da senha desejada
-- Você pode gerar o hash em: https://bcrypt-generator.com/
-- Ou usando Node.js: const bcrypt = require('bcrypt'); bcrypt.hashSync('sua_senha', 10)

-- Exemplo de hash para senha "admin123":
-- $2b$10$rOzJqZqZqZqZqZqZqZqZqOeZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq

INSERT INTO admin (password_hash) 
VALUES ('$2b$10$SUA_SENHA_HASH_AQUI')
ON CONFLICT DO NOTHING;

-- Para verificar se foi criado:
-- SELECT * FROM admin;

