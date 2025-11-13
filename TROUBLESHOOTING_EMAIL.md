# 🔧 Troubleshooting - Erro "Failed to fetch"

Se você está recebendo o erro "Failed to fetch" ao testar o envio de email, siga estes passos:

## ✅ Checklist de Verificação

### 1. Verificar se a Edge Function está deployada

A Edge Function `send-email` precisa estar deployada no Supabase. Execute:

```bash
# No terminal, na raiz do projeto
supabase functions deploy send-email
```

**Verificar se está deployada:**

- Acesse: https://supabase.com/dashboard/project/ebwsbboixpyafrritktv/edge-functions
- Procure por `send-email` na lista
- Se não estiver lá, faça o deploy

### 2. Verificar a URL da API

No arquivo `.env` na raiz do projeto, verifique se está configurado:

```env
VITE_API_URL=https://ebwsbboixpyafrritktv.supabase.co/functions/v1
```

**Importante:**

- A URL deve terminar com `/functions/v1`
- Não deve ter barra no final
- Reinicie o servidor de desenvolvimento após alterar o `.env`

### 3. Verificar variáveis de ambiente no Supabase

A Edge Function precisa das seguintes variáveis configuradas:

1. Acesse: https://supabase.com/dashboard/project/ebwsbboixpyafrritktv/settings/functions
2. Role até "Secrets"
3. Verifique se estão configuradas:
   - `RESEND_API_KEY` - Sua API Key do Resend
   - `RESEND_FROM_EMAIL` - Email do remetente (ex: noreply@seudominio.com)
   - `FRONTEND_URL` - URL do seu frontend (opcional)

### 4. Verificar logs da Edge Function

1. Acesse: https://supabase.com/dashboard/project/ebwsbboixpyafrritktv/edge-functions
2. Clique em `send-email`
3. Vá na aba "Logs"
4. Tente enviar um email de teste novamente
5. Veja se há erros nos logs

### 5. Testar a Edge Function diretamente

Você pode testar a Edge Function diretamente usando curl ou Postman:

```bash
curl -X POST https://ebwsbboixpyafrritktv.supabase.co/functions/v1/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "seu.email@exemplo.com",
    "subject": "Teste",
    "html": "<h1>Teste</h1>",
    "participantName": "Teste",
    "matchedName": "Teste",
    "token": "test",
    "frontendUrl": "http://localhost:3001"
  }'
```

Se funcionar via curl mas não via frontend, o problema é de CORS ou configuração do frontend.

## 🐛 Erros Comuns

### Erro: "RESEND_API_KEY não configurada"

- **Causa:** A variável de ambiente não está configurada no Supabase
- **Solução:** Configure `RESEND_API_KEY` nas Secrets da Edge Function

### Erro: "Failed to fetch" ou "Network Error"

- **Causa 1:** Edge Function não está deployada
- **Solução:** Execute `supabase functions deploy send-email`

- **Causa 2:** URL incorreta
- **Solução:** Verifique `VITE_API_URL` no `.env`

- **Causa 3:** Problema de CORS
- **Solução:** Verifique se os headers CORS estão corretos na Edge Function

### Erro: "404 Not Found"

- **Causa:** A Edge Function não existe ou o nome está errado
- **Solução:** Verifique o nome da função e faça o deploy novamente

### Erro: "500 Internal Server Error"

- **Causa:** Erro dentro da Edge Function
- **Solução:** Verifique os logs da Edge Function no Supabase Dashboard

## 📝 Passo a Passo Completo

1. **Instalar Supabase CLI** (se ainda não tiver):

   ```bash
   npm install -g supabase
   ```

2. **Fazer login no Supabase**:

   ```bash
   supabase login
   ```

3. **Linkar ao projeto**:

   ```bash
   supabase link --project-ref ebwsbboixpyafrritktv
   ```

4. **Deploy da Edge Function**:

   ```bash
   supabase functions deploy send-email
   ```

5. **Configurar Secrets** (no Dashboard do Supabase):

   - Settings → Edge Functions → Secrets
   - Adicionar `RESEND_API_KEY`
   - Adicionar `RESEND_FROM_EMAIL`

6. **Verificar `.env` do frontend**:

   ```env
   VITE_API_URL=https://ebwsbboixpyafrritktv.supabase.co/functions/v1
   ```

7. **Reiniciar servidor de desenvolvimento**:

   ```bash
   npm run dev
   ```

8. **Testar novamente** no painel admin

## 🔍 Debug no Console do Navegador

Abra o Console do navegador (F12) e verifique:

- Mensagens de erro detalhadas
- A URL que está sendo chamada
- O status da resposta HTTP

Os logs agora incluem mais informações para ajudar no diagnóstico.

## 💡 Dica

Se ainda não funcionar, verifique:

- Se o Supabase CLI está atualizado: `supabase --version`
- Se você tem permissões no projeto Supabase
- Se o projeto está ativo (não pausado)
- Se há limites de rate limit atingidos
