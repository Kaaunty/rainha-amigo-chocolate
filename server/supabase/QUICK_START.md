# 🚀 Guia Rápido - Setup Supabase

## 1. Criar Projeto no Supabase

1. Acesse https://supabase.com
2. Crie uma conta (se não tiver)
3. Crie um novo projeto
4. Anote o **Project URL** e **API Keys**

## 2. Executar SQL no Supabase

1. No dashboard do Supabase, vá em **SQL Editor**
2. Execute o conteúdo de `schema.sql` (cria tabelas e funções)
3. Execute o conteúdo de `rls_policies.sql` (configura segurança)

## 3. Criar Admin

Execute no SQL Editor:

```sql
-- Gere o hash da senha em: https://bcrypt-generator.com/
-- Exemplo para senha "admin123":
INSERT INTO admin (password_hash)
VALUES ('$2b$10$rOzJqZqZqZqZqZqZqZqZqOeZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq');
```

## 4. Configurar Edge Functions

### Instalar CLI:

```bash
npm install -g supabase
```

### Login:

```bash
supabase login
```

### Linkar projeto:

```bash
supabase link --project-ref ebwsbboixpyafrritktv
```

### Deploy das funções:

```bash
cd server/supabase/edge_functions

supabase functions deploy register-participant
supabase functions deploy get-participant
supabase functions deploy draw-status
supabase functions deploy admin-login
supabase functions deploy admin-participants
supabase functions deploy admin-export
supabase functions deploy admin-reset
supabase functions deploy admin-config
```

## 5. Configurar Frontend

✅ **Já configurado!** O arquivo `.env` já está com a URL correta:

```env
VITE_API_URL=https://ebwsbboixpyafrritktv.supabase.co/functions/v1
```

## 6. Testar

1. Acesse o frontend
2. Cadastre um participante
3. Verifique se aparece no Supabase (tabela `participants`)
4. Faça login como admin
5. Teste as funcionalidades admin

## 📝 URLs dos Endpoints

Após o deploy, os endpoints estarão em:

- `https://ebwsbboixpyafrritktv.supabase.co/functions/v1/register-participant`
- `https://ebwsbboixpyafrritktv.supabase.co/functions/v1/get-participant`
- `https://ebwsbboixpyafrritktv.supabase.co/functions/v1/draw-status`
- `https://ebwsbboixpyafrritktv.supabase.co/functions/v1/admin-login`
- `https://ebwsbboixpyafrritktv.supabase.co/functions/v1/admin-participants`
- `https://ebwsbboixpyafrritktv.supabase.co/functions/v1/admin-export`
- `https://ebwsbboixpyafrritktv.supabase.co/functions/v1/admin-reset`
- `https://ebwsbboixpyafrritktv.supabase.co/functions/v1/admin-config`

## ⚠️ Importante

- Mantenha o `SUPABASE_SERVICE_ROLE_KEY` seguro (não commite no git)
- O sorteio é executado automaticamente quando o número mínimo é atingido
- Cada participante recebe um token único para acessar seu resultado
