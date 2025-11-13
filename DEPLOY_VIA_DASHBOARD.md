# 🖥️ Deploy via Dashboard do Supabase

Sim! É possível criar e fazer deploy da Edge Function diretamente pelo Dashboard do Supabase, sem usar a CLI.

## 📋 Método 1: Criar e Editar pelo Dashboard

### Passo 1: Acessar Edge Functions

1. Acesse: https://supabase.com/dashboard/project/ebwsbboixpyafrritktv/edge-functions
2. Clique em **"Create a new function"** ou **"New Function"**

### Passo 2: Criar a Função

1. **Nome da função:** `send-email`
2. **Template:** Escolha "Blank" ou "Hello World"
3. Clique em **"Create function"**

### Passo 3: Copiar o Código

1. Após criar, você verá um editor de código
2. **Delete todo o conteúdo** do editor
3. **Cole o código completo** abaixo:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  participantName: string;
  matchedName: string;
  token: string;
  frontendUrl: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verificar autorização (opcional, mas recomendado)
    const authHeader = req.headers.get("Authorization");
    const apikeyHeader = req.headers.get("apikey");

    // Se não tiver nenhum header de autorização, ainda permite (função pública)
    // mas loga um aviso
    if (!authHeader && !apikeyHeader) {
      console.warn("Aviso: Requisição sem header de autorização");
    }

    const {
      to,
      subject,
      html,
      participantName,
      matchedName,
      token,
      frontendUrl,
    } = (await req.json()) as EmailRequest;

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ message: "to, subject e html são obrigatórios" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Obter API key do Resend das variáveis de ambiente
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.error("RESEND_API_KEY não configurada");
      return new Response(
        JSON.stringify({
          success: false,
          message: "Configuração de email não encontrada",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Obter email do remetente (ou usar padrão)
    let fromEmail =
      Deno.env.get("RESEND_FROM_EMAIL") || "webmaster@rainhadassete.com.br";

    // Limpar espaços e validar formato
    fromEmail = fromEmail.trim();

    // Validar e formatar o email do remetente
    // O Resend aceita: "email@example.com" ou "Name <email@example.com>"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Se já estiver no formato "Name <email>", extrair apenas o email
    const nameEmailMatch = fromEmail.match(/^(.+?)\s*<([^>]+)>$/);
    if (nameEmailMatch) {
      fromEmail = nameEmailMatch[2].trim();
    }

    // Validar se é um email válido
    if (!emailRegex.test(fromEmail)) {
      console.error("Email do remetente inválido:", fromEmail);
      fromEmail = "webmaster@rainhadassete.com.br"; // Email padrão
    }

    // Formatar como "Name <email@example.com>"
    const fromName = Deno.env.get("RESEND_FROM_NAME") || "Rainha das Sete";
    const formattedFrom = `${fromName} <${fromEmail}>`;

    console.log("📧 Email do remetente formatado:", formattedFrom);

    // Enviar email via Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: formattedFrom,
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json();
      console.error("Erro ao enviar email via Resend:", errorData);
      throw new Error(errorData.message || "Erro ao enviar email via Resend");
    }

    const result = await resendResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email enviado com sucesso",
        emailId: result.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erro ao processar envio de email:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message:
          error instanceof Error ? error.message : "Erro ao enviar email",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
```

### Passo 4: Salvar e Deploy

1. Clique em **"Deploy"** ou **"Save"** (geralmente no canto superior direito)
2. Aguarde alguns segundos para o deploy
3. Você verá uma mensagem de sucesso

### Passo 5: Configurar Secrets

1. Na mesma página da função, vá em **"Settings"** ou **"Secrets"**
2. Ou acesse: Settings → Edge Functions → Secrets
3. Adicione as seguintes variáveis:

   **Secret 1:**

   - Name: `RESEND_API_KEY`
   - Value: (sua API Key do Resend - começa com `re_`)

   **Secret 2:**

   - Name: `RESEND_FROM_EMAIL`
   - Value: (ex: `noreply@seudominio.com`)

   **Secret 3 (Opcional):**

   - Name: `FRONTEND_URL`
   - Value: (ex: `http://localhost:3001`)

## 📋 Método 2: Upload Manual (se disponível)

Alguns projetos do Supabase permitem upload de arquivos:

1. Vá em Edge Functions → `send-email`
2. Procure por opção **"Upload"** ou **"Import"**
3. Se disponível, faça upload do arquivo `index.ts`

## ✅ Verificar se Funcionou

1. **Status da função:**

   - Deve aparecer como **"Active"** ou **"Deployed"**
   - Status deve estar verde

2. **Testar diretamente:**

   - Na página da função, há uma aba **"Invoke"** ou **"Test"**
   - Você pode testar a função diretamente pelo Dashboard

3. **Verificar logs:**
   - Aba **"Logs"** na página da função
   - Deve mostrar logs em tempo real

## 🔍 Se a Função Já Existe

Se a função `send-email` já existe mas não está funcionando:

1. Acesse: Edge Functions → `send-email`
2. Clique em **"Edit"** ou no editor de código
3. Cole o código completo acima
4. Clique em **"Deploy"** ou **"Save"**
5. Aguarde o deploy

## 🆘 Troubleshooting

### Não consigo criar função pelo Dashboard

- Verifique se você tem permissões de Owner ou Admin no projeto
- Alguns projetos podem ter limitações - use a CLI como alternativa

### Erro ao salvar

- Verifique se o código está completo
- Certifique-se de que não há erros de sintaxe
- Tente salvar em partes menores

### Função não aparece na lista

- Recarregue a página
- Verifique se está no projeto correto
- Verifique o filtro de busca

## 📝 Próximos Passos Após Deploy

1. ✅ Função deployada
2. ✅ Secrets configuradas
3. ⏳ Verificar `.env` do frontend:
   ```env
   VITE_API_URL=https://ebwsbboixpyafrritktv.supabase.co/functions/v1
   ```
4. ⏳ Reiniciar servidor de desenvolvimento
5. ⏳ Testar no painel admin

## 💡 Dica

O Dashboard é mais fácil para edições rápidas e testes. Use a CLI quando precisar:

- Deploy de múltiplas funções
- Automação/scripts
- Versionamento mais controlado
