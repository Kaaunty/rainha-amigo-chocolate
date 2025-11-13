# 📧 Formato Correto do Email no Resend

## ⚠️ Erro Comum: "Invalid `from` field"

Se você está recebendo este erro, o problema está no formato do email configurado em `RESEND_FROM_EMAIL`.

## ✅ Formato Correto

O Resend aceita dois formatos:

### Formato 1: Apenas Email (Recomendado)
```
onboarding@resend.dev
```
ou
```
noreply@seudominio.com
```

### Formato 2: Nome + Email
```
Rainha das Sete <onboarding@resend.dev>
```

## 🔧 Como Configurar Corretamente

### No Dashboard do Supabase (Secrets):

**Opção 1 - Email Simples (Recomendado):**
```
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=Rainha das Sete
```

**Opção 2 - Email com Nome:**
```
RESEND_FROM_EMAIL=Rainha das Sete <onboarding@resend.dev>
```

## 📝 Emails de Teste do Resend

Se você ainda não configurou um domínio próprio, use um destes emails de teste:

- `onboarding@resend.dev` ✅
- `delivered@resend.dev` ✅

**Importante:** Estes emails funcionam apenas para testes e podem ter limitações.

## 🚀 Para Produção

1. Configure um domínio no Resend
2. Use um email do seu domínio:
   ```
   RESEND_FROM_EMAIL=noreply@seudominio.com
   ```

## ❌ Erros Comuns

### Erro 1: Email com espaços extras
```
❌ RESEND_FROM_EMAIL= noreply@exemplo.com
✅ RESEND_FROM_EMAIL=noreply@exemplo.com
```

### Erro 2: Email inválido
```
❌ RESEND_FROM_EMAIL=noreply
✅ RESEND_FROM_EMAIL=noreply@exemplo.com
```

### Erro 3: Formato incorreto com nome
```
❌ RESEND_FROM_EMAIL=Rainha das Sete noreply@exemplo.com
✅ RESEND_FROM_EMAIL=Rainha das Sete <noreply@exemplo.com>
✅ RESEND_FROM_EMAIL=noreply@exemplo.com (e usar RESEND_FROM_NAME separado)
```

## 🔍 Verificar Configuração

Após configurar, teste enviando um email de teste pelo painel admin. Se ainda der erro:

1. Verifique os logs da Edge Function no Dashboard
2. Confirme que o email está no formato correto
3. Se usar domínio próprio, verifique se está verificado no Resend

