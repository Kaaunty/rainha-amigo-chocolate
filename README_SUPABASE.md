# 🚀 Setup com Cliente Supabase

O projeto agora usa o cliente Supabase diretamente no frontend, sem necessidade de Edge Functions.

## 📦 Instalação

```bash
npm install
```

## ⚙️ Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://ebwsbboixpyafrritktv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVid3NiYm9peHB5YWZycml0a3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNTYzOTgsImV4cCI6MjA3ODYzMjM5OH0.8y819EAMBPQju2cqhq6Gh6tvFlRbZ0zEqMJAkEL9flo
```

## 🗄️ Setup do Banco de Dados

1. Acesse o SQL Editor no dashboard do Supabase
2. Execute os seguintes arquivos SQL na ordem:

### 1. Habilitar extensão pgcrypto

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### 2. Executar schema.sql

Execute todo o conteúdo de `server/supabase/schema.sql`

### 3. Executar rls_policies.sql

Execute todo o conteúdo de `server/supabase/rls_policies.sql`

### 4. Criar usuário admin

Execute `server/supabase/setup_admin_crypt.sql` e substitua `'sua_senha_aqui'` pela senha desejada:

```sql
INSERT INTO admin (password_hash)
VALUES (crypt('sua_senha_aqui', gen_salt('bf', 10)));
```

## 🎯 Funcionalidades

O cliente Supabase está configurado para:

- ✅ Cadastrar participantes diretamente
- ✅ Buscar participantes por token
- ✅ Verificar status do sorteio
- ✅ Executar sorteio automaticamente quando número mínimo é atingido
- ✅ Login admin com verificação de senha
- ✅ Listar todos os participantes (admin)
- ✅ Exportar CSV (admin)
- ✅ Reiniciar sorteio (admin)
- ✅ Atualizar configurações (admin)

## 🔒 Segurança

- As políticas RLS (Row Level Security) estão configuradas
- A autenticação admin usa função RPC segura no banco
- Tokens são gerados de forma única e segura

## 📝 Notas

- Não é necessário fazer deploy de Edge Functions
- Tudo funciona diretamente do frontend usando o cliente Supabase
- As funções RPC são executadas no banco de dados
