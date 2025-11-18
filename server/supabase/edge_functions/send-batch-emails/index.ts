import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "supabase";
import axios from "axios";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailData {
  participantId: string;
  participantName: string;
  participantEmail: string;
  matchedName: string;
  token: string;
}

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
    const emailApiUrl = "https://api.erp.rainhadassete.com/api/Email/enviar";

    console.log("📧 Enviando emails em lote via API externa:", emailApiUrl);

    const results: any[] = [];
    const errors: any[] = [];

    // Enviar email para cada participante
    for (const participant of participants) {
      try {
        // Buscar informações do participante sorteado
        const { data: matchedParticipant } = await supabaseClient
          .from("participants")
          .select("name, preferred_chocolate, dislikes")
          .eq("id", participant.matched_with)
          .single();

        const matchedName = matchedParticipant?.name || "Participante";
        const matchedPreferredChocolate = matchedParticipant?.preferred_chocolate || null;
        const matchedDislikes = matchedParticipant?.dislikes || null;

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
    
    ${(matchedPreferredChocolate || matchedDislikes) ? `
    <div style="background: #FFF8DC; padding: 20px; border: 1px solid #FFD700; margin: 20px 0; border-radius: 8px;">
      ${matchedPreferredChocolate ? `
      <div style="margin-bottom: 15px;">
        <p style="margin: 0 0 5px 0; color: #8B4513; font-size: 14px; font-weight: bold;">
          🍫 Chocolate Preferido:
        </p>
        <p style="margin: 0; color: #333; font-size: 16px; line-height: 1.6;">
          ${matchedPreferredChocolate}
        </p>
      </div>
      ` : ''}
      ${matchedDislikes ? `
      <div>
        <p style="margin: 0 0 5px 0; color: #8B4513; font-size: 14px; font-weight: bold;">
          🚫 Não Gosta De:
        </p>
        <p style="margin: 0; color: #333; font-size: 16px; line-height: 1.6;">
          ${matchedDislikes}
        </p>
      </div>
      ` : ''}
    </div>
    ` : ''}
    
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

        const emailPayload = {
          destinatario: participant.email,
          assunto: "🎁 Amigo Chocolate - Seu sorteio está pronto!",
          body: emailHtml,
          isHtml: true,
          cc: [],
          bcc: [],
        };

        const emailResponse = await axios.post(emailApiUrl, emailPayload, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = emailResponse.data;
        results.push({
          participantId: participant.id,
          participantName: participant.name,
          email: participant.email,
          success: true,
          emailId: result.id || result.emailId || "N/A",
        });
      } catch (error) {
        let errorMessage = "Erro desconhecido";
        if (axios.isAxiosError(error)) {
          errorMessage =
            error.response?.data?.message ||
            error.message ||
            `Erro HTTP ${error.response?.status}: ${error.response?.statusText}`;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        errors.push({
          participantId: participant.id,
          participantName: participant.name,
          email: participant.email,
          error: errorMessage,
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
