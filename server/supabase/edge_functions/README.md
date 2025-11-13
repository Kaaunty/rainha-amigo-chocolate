# Edge Functions do Supabase

## ⚠️ Nota sobre Erros do TypeScript

Os erros do TypeScript relacionados ao Deno são **esperados** e **normais** no ambiente de desenvolvimento local.

As Edge Functions do Supabase rodam em **Deno**, não em Node.js, então o TypeScript no seu editor pode mostrar erros como:

- `Cannot find module 'https://deno.land/std@...'`
- `Cannot find name 'Deno'`

**Isso não é um problema!** As funções funcionarão perfeitamente quando deployadas no Supabase, pois o ambiente de runtime do Supabase suporta Deno nativamente.

## Como fazer deploy

```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# Fazer login
supabase login

# Linkar ao projeto
supabase link --project-ref ebwsbboixpyafrritktv

# Deploy de uma função específica
supabase functions deploy send-email
supabase functions deploy send-batch-emails

# Ou deploy de todas as funções
supabase functions deploy
```

## Configuração de variáveis de ambiente

Configure as variáveis no Dashboard do Supabase:

- Settings → Edge Functions → Secrets

Variáveis necessárias:

- `RESEND_API_KEY` - API Key do Resend
- `RESEND_FROM_EMAIL` - Email do remetente
- `FRONTEND_URL` - URL do frontend
- `SUPABASE_URL` - URL do projeto (já configurada)
- `SUPABASE_SERVICE_ROLE_KEY` - Service Role Key (já configurada)
