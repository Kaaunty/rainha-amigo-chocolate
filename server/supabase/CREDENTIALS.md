# 🔐 Credenciais do Supabase

## Informações do Projeto

- **Project URL**: https://ebwsbboixpyafrritktv.supabase.co
- **Project Ref**: ebwsbboixpyafrritktv
- **Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVid3NiYm9peHB5YWZycml0a3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNTYzOTgsImV4cCI6MjA3ODYzMjM5OH0.8y819EAMBPQju2cqhq6Gh6tvFlRbZ0zEqMJAkEL9flo

## Configuração do Frontend

No arquivo `.env` do frontend:

```env
VITE_API_URL=https://ebwsbboixpyafrritktv.supabase.co/functions/v1
```

## Próximos Passos

1. ✅ Credenciais configuradas
2. ⏳ Executar SQLs no Supabase (schema.sql, rls_policies.sql)
3. ⏳ Criar usuário admin (setup_admin.sql)
4. ⏳ Fazer deploy das Edge Functions
5. ⏳ Testar endpoints

## URLs dos Endpoints

Após o deploy das Edge Functions, os endpoints estarão em:

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
- O arquivo `.env` já está configurado com a URL base
- Você precisará do Service Role Key para fazer deploy das Edge Functions
