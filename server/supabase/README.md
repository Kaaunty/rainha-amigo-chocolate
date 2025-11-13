# Setup Supabase - Amigo Chocolate Rainha das Sete

Este guia explica como configurar o backend no Supabase.

## 📋 Pré-requisitos

1. Conta no Supabase (https://supabase.com)
2. Projeto criado no Supabase
3. CLI do Supabase instalado (opcional, para Edge Functions)

## 🗄️ Passo 1: Criar o Banco de Dados

1. Acesse o SQL Editor no dashboard do Supabase
2. Execute o arquivo `schema.sql` completo
3. Execute o arquivo `rls_policies.sql` para configurar as políticas de segurança

## 🔐 Passo 2: Configurar Admin

Execute no SQL Editor para criar um admin inicial:

```sql
-- Gerar hash da senha (substitua 'sua_senha_aqui' pela senha desejada)
-- Use um gerador de hash bcrypt online ou a função do Supabase
INSERT INTO admin (password_hash)
VALUES ('$2b$10$hash_aqui'); -- Substitua pelo hash bcrypt da sua senha
```

**Gerar hash bcrypt:**

- Use: https://bcrypt-generator.com/
- Ou use Node.js: `const bcrypt = require('bcrypt'); bcrypt.hashSync('sua_senha', 10)`

## 🚀 Passo 3: Configurar Edge Functions

### Instalar Supabase CLI

```bash
npm install -g supabase
```

### Login no Supabase

```bash
supabase login
```

### Linkar ao projeto

```bash
supabase link --project-ref seu-project-ref
```

### Deploy das Edge Functions

```bash
# Deploy de cada função
supabase functions deploy register-participant
supabase functions deploy get-participant
supabase functions deploy draw-status
supabase functions deploy admin-login
supabase functions deploy admin-participants
supabase functions deploy admin-export
supabase functions deploy admin-reset
supabase functions deploy admin-config
```

### Configurar Variáveis de Ambiente

Para cada Edge Function, configure as variáveis:

```bash
supabase secrets set FRONTEND_URL=https://seu-dominio.com
```

As seguintes variáveis já estão disponíveis automaticamente:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 🔗 Passo 4: Configurar URLs no Frontend

No arquivo `.env` do frontend:

```env
VITE_API_URL=https://seu-project-ref.supabase.co/functions/v1
```

## 📝 Estrutura de Endpoints

Após o deploy, os endpoints estarão disponíveis em:

- `POST /register-participant` - Cadastrar participante
- `GET /get-participant?token=xxx` - Buscar participante por token
- `GET /draw-status` - Status do sorteio
- `POST /admin-login` - Login admin
- `GET /admin-participants` - Listar participantes (admin)
- `GET /admin-export` - Exportar CSV (admin)
- `POST /admin-reset` - Reiniciar sorteio (admin)
- `PUT /admin-config` - Atualizar configuração (admin)

## 🔧 Alternativa: Usar REST API do Supabase

Se preferir não usar Edge Functions, você pode usar a REST API diretamente do Supabase. Nesse caso, precisará criar um middleware/backend adicional para:

1. Autenticação admin
2. Validações de negócio
3. Lógica de sorteio

## 📚 Documentação

- [Supabase Docs](https://supabase.com/docs)
- [Edge Functions](https://supabase.com/docs/guides/functions)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## ⚠️ Notas Importantes

1. **Segurança**: As Edge Functions usam `SUPABASE_SERVICE_ROLE_KEY` para operações admin. Mantenha isso seguro!
2. **CORS**: As Edge Functions já incluem headers CORS configurados
3. **Sorteio Automático**: O sorteio é executado automaticamente quando um novo participante é cadastrado e o número mínimo é atingido
4. **Tokens**: Cada participante recebe um token único gerado pela função `generate_unique_token()`
