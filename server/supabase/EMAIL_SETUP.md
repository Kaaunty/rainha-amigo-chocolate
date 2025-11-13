# 📧 Configuração de Envio de Emails

Este projeto usa **Resend** para envio de emails. O Resend é um serviço moderno e confiável com um plano gratuito generoso (3.000 emails/mês).

## 🚀 Passo a Passo

### 1. Criar conta no Resend

1. Acesse [https://resend.com](https://resend.com)
2. Crie uma conta gratuita
3. Verifique seu email

### 2. Obter API Key

1. Após fazer login, vá em **API Keys** no menu lateral
2. Clique em **Create API Key**
3. Dê um nome (ex: "Amigo Chocolate")
4. Copie a API Key gerada (ela só aparece uma vez!)

### 3. Configurar domínio (Opcional mas Recomendado)

Para usar um domínio próprio no email do remetente:

1. Vá em **Domains** no menu lateral
2. Clique em **Add Domain**
3. Adicione seu domínio (ex: `rainhadasset.com`)
4. Siga as instruções para adicionar os registros DNS
5. Aguarde a verificação (pode levar alguns minutos)

**Nota:** Se não configurar um domínio, você pode usar o domínio de teste do Resend, mas os emails podem ir para spam.

### 4. Configurar variáveis de ambiente no Supabase

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** → **Edge Functions**
4. Role até **Secrets**
5. Adicione as seguintes variáveis:

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@seudominio.com
FRONTEND_URL=https://seudominio.com
```

**Importante:**

- `RESEND_API_KEY`: Cole a API Key que você copiou do Resend
- `RESEND_FROM_EMAIL`: Use o email do remetente (se configurou domínio, use `noreply@seudominio.com`, senão use o email de teste do Resend)
- `FRONTEND_URL`: URL do seu frontend (ex: `https://rainha-amigo-chocolate.vercel.app`)

### 5. Fazer deploy das Edge Functions

No terminal, navegue até a pasta do projeto e execute:

```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# Fazer login no Supabase
supabase login

# Linkar ao projeto
supabase link --project-ref ebwsbboixpyafrritktv

# Fazer deploy das Edge Functions
supabase functions deploy send-email
supabase functions deploy send-batch-emails
```

### 6. Testar o envio

1. Acesse o painel admin
2. Realize um sorteio
3. Clique em **Enviar Emails**
4. Verifique se os emails foram enviados

## 📝 Estrutura dos Emails

Os emails são enviados em HTML com:

- Design responsivo
- Cores temáticas (dourado e marrom)
- Link direto para o resultado do participante
- Lembrete sobre manter o segredo

## 🔧 Troubleshooting

### Emails não estão sendo enviados

1. Verifique se as variáveis de ambiente estão configuradas corretamente
2. Verifique os logs das Edge Functions no Supabase Dashboard
3. Confirme que a API Key do Resend está correta
4. Verifique se o domínio está verificado (se estiver usando domínio próprio)

### Emails vão para spam

1. Configure um domínio próprio no Resend
2. Adicione os registros DNS corretamente
3. Aguarde a verificação completa do domínio
4. Use um email profissional no remetente

### Erro "RESEND_API_KEY não configurada"

- Verifique se a variável de ambiente foi adicionada no Supabase
- Certifique-se de que fez o deploy das Edge Functions após adicionar a variável
- Tente fazer o deploy novamente

## 📚 Recursos

- [Documentação do Resend](https://resend.com/docs)
- [Documentação do Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Guia de DNS do Resend](https://resend.com/docs/dashboard/domains/introduction)

## 💡 Alternativas

Se preferir usar outro serviço de email, você pode modificar as Edge Functions:

- **SendGrid**: Similar ao Resend, também tem plano gratuito
- **Mailgun**: Outra opção popular
- **Amazon SES**: Mais complexo, mas muito barato em escala
- **Nodemailer com SMTP**: Para usar seu próprio servidor SMTP
