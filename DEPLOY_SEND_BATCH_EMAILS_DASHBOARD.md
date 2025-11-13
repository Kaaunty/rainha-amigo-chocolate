# 🖥️ Deploy send-batch-emails via Dashboard

Guia para criar a função `send-batch-emails` pelo Dashboard do Supabase.

## 📋 Passo a Passo

### 1. Criar Nova Função

1. Acesse: https://supabase.com/dashboard/project/ebwsbboixpyafrritktv/edge-functions
2. Clique em **"Create a new function"**
3. Nome: `send-batch-emails`
4. Template: "Blank"
5. Clique em **"Create function"**

### 2. Cole o Código Completo

Delete todo o conteúdo do editor e cole este código:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Buscar todos os participantes com match
    const { data: participants, error: fetchError } = await supabaseClient
      .from("participants")
      .select("id, name, email, token, matched_with")
      .not("matched_with", "is", null);

    if (fetchError) {
      throw fetchError;
    }

    if (!participants || participants.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Nenhum participante com match encontrado",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const frontendUrl = Deno.env.get("FRONTEND_URL") || "http://localhost:3001";
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    let fromEmail =
      Deno.env.get("RESEND_FROM_EMAIL") || "webmaster@rainhadassete.com.br";

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "RESEND_API_KEY não configurada",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Limpar espaços e validar formato
    fromEmail = fromEmail.trim();

    // Validar e formatar o email do remetente
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

    const results: any[] = [];
    const errors: any[] = [];

    // Enviar email para cada participante
    for (const participant of participants) {
      try {
        // Buscar o nome do participante sorteado
        const { data: matchedParticipant } = await supabaseClient
          .from("participants")
          .select("name")
          .eq("id", participant.matched_with)
          .single();

        const matchedName = matchedParticipant?.name || "Participante";

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Amigo Chocolate - Seu sorteio está pronto!</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: #fff; margin: 0; font-size: 28px;">🎁 Amigo Chocolate</h1>
  </div>
  
  <div style="background: #fff; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #8B4513; margin-top: 0;">Olá, ${participant.name}!</h2>
    
    <p>O sorteio do Amigo Chocolate foi realizado! 🎉</p>
    
    <div style="background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%); padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
      <p style="margin: 0; color: #fff; font-size: 18px; font-weight: bold;">
        Seu amigo chocolate é:<br>
        <span style="font-size: 24px;">${matchedName}</span>
      </p>
    </div>
    
    <div style="background: #FFF8DC; padding: 15px; border-left: 4px solid #FFD700; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #8B4513;">
        🔒 <strong>Lembre-se:</strong> Mantenha o segredo! Não conte para ninguém quem você tirou.
      </p>
    </div>
    
    <p>Acesse seu link único para ver o resultado a qualquer momento:</p>
    <div style="text-align: center; margin: 20px 0;">
      <a href="${frontendUrl}/participante/${participant.token}" 
         style="display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%); color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
        Ver Meu Resultado
      </a>
    </div>
    
    <p style="margin-top: 30px; color: #666; font-size: 14px;">
      Feliz Páscoa! 🐰🍫<br>
      <strong>Rainha das Sete</strong>
    </p>
  </div>
</body>
</html>
        `.trim();

        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: formattedFrom,
            to: [participant.email],
            subject: "🎁 Amigo Chocolate - Seu sorteio está pronto!",
            html: emailHtml,
          }),
        });

        if (!resendResponse.ok) {
          const errorData = await resendResponse.json();
          throw new Error(
            errorData.message || "Erro ao enviar email via Resend"
          );
        }

        const result = await resendResponse.json();
        results.push({
          participantId: participant.id,
          participantName: participant.name,
          email: participant.email,
          success: true,
          emailId: result.id,
        });
      } catch (error) {
        errors.push({
          participantId: participant.id,
          participantName: participant.name,
          email: participant.email,
          error: error instanceof Error ? error.message : "Erro desconhecido",
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Emails enviados: ${results.length} sucesso, ${errors.length} erros`,
        results,
        errors,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erro ao processar envio em lote:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message:
          error instanceof Error ? error.message : "Erro ao enviar emails",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
```

### 3. Deploy

1. Clique em **"Deploy"** ou **"Save"**
2. Aguarde o deploy
3. Verifique se o status está "Active"

### 4. Configurar Secrets (se ainda não fez)

As mesmas secrets da função `send-email`:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `FRONTEND_URL` (opcional)
