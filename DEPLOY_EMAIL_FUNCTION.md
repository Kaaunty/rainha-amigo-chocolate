# 🚀 Deploy da Edge Function send-email

## Passo a Passo Completo

### 1. Instalar Supabase CLI

Se ainda não tiver instalado:

```bash
npm install -g supabase
```

Ou usando Homebrew (Mac):

```bash
brew install supabase/tap/supabase
```

### 2. Verificar Instalação

```bash
supabase --version
```

### 3. Fazer Login no Supabase

```bash
supabase login
```

Isso abrirá o navegador para autenticação. Faça login com sua conta do Supabase.

### 4. Linkar ao Projeto

```bash
supabase link --project-ref ebwsbboixpyafrritktv
```

Quando solicitado, escolha:

- **Database password:** (deixe em branco se não configurou, ou use a senha do banco)
- **Git branch:** (pressione Enter para usar o padrão)

### 5. Verificar Estrutura

Certifique-se de que o arquivo existe:

```
server/supabase/edge_functions/send-email/index.ts
```

### 6. Fazer Deploy da Função

```bash
supabase functions deploy send-email
```

**Importante:** Execute este comando na **raiz do projeto** (onde está o arquivo `package.json`).

### 7. Verificar Deploy

Após o deploy, você deve ver uma mensagem de sucesso. Verifique no Dashboard:

1. Acesse: https://supabase.com/dashboard/project/ebwsbboixpyafrritktv/edge-functions
2. Procure por `send-email` na lista
3. Deve aparecer como "Active"

### 8. Configurar Secrets (Variáveis de Ambiente)

No Dashboard do Supabase:

1. Vá em: **Settings** → **Edge Functions**
2. Role até **Secrets**
3. Clique em **Add new secret**
4. Adicione:

   **Secret 1:**

   - Name: `RESEND_API_KEY`
   - Value: (sua API Key do Resend - começa com `re_`)

   **Secret 2:**

   - Name: `RESEND_FROM_EMAIL`
   - Value: (ex: `noreply@seudominio.com` ou use o email de teste do Resend)

   **Secret 3 (Opcional):**

   - Name: `FRONTEND_URL`
   - Value: (ex: `http://localhost:3001` ou URL do seu frontend)

### 9. Testar a Função

Após configurar tudo, teste novamente no painel admin.

## 🔍 Troubleshooting

### Erro: "Project not found"

```bash
# Verifique se está linkado corretamente
supabase projects list

# Se não aparecer, faça login novamente
supabase login
```

### Erro: "Function not found"

Certifique-se de que está executando na raiz do projeto e que o arquivo existe em:

```
server/supabase/edge_functions/send-email/index.ts
```

### Erro: "Permission denied"

Verifique se você tem permissões no projeto Supabase. Você precisa ser:

- Owner do projeto, ou
- Colaborador com permissões de deploy

### Verificar Logs

Se o deploy funcionar mas a função não executar:

1. Dashboard → Edge Functions → send-email
2. Aba **Logs**
3. Tente enviar um email de teste
4. Veja os logs em tempo real

## 📝 Comandos Úteis

```bash
# Listar todas as funções deployadas
supabase functions list

# Ver logs de uma função específica
supabase functions logs send-email

# Deletar uma função (se necessário)
supabase functions delete send-email

# Ver detalhes de uma função
supabase functions get send-email
```

## ✅ Checklist Final

- [ ] Supabase CLI instalado
- [ ] Login realizado (`supabase login`)
- [ ] Projeto linkado (`supabase link`)
- [ ] Função deployada (`supabase functions deploy send-email`)
- [ ] Secrets configuradas no Dashboard
- [ ] `.env` configurado com `VITE_API_URL`
- [ ] Servidor de desenvolvimento reiniciado
- [ ] Teste realizado no painel admin

## 🆘 Ainda não funciona?

1. Verifique os logs da função no Dashboard
2. Teste a função diretamente via curl (veja TROUBLESHOOTING_EMAIL.md)
3. Verifique se o projeto Supabase está ativo (não pausado)
4. Confirme que a URL no `.env` está correta
