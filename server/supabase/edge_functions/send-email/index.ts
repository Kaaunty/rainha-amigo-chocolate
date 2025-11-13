import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "supabase";
import axios from "axios";

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

    // Enviar email via API externa
    const emailApiUrl = "https://api.erp.rainhadassete.com/api/Email/enviar";

    const emailPayload = {
      destinatario: to,
      assunto: subject,
      body: html,
      isHtml: true,
      cc: [],
      bcc: [],
    };

    console.log("📧 Enviando email via API externa:", emailApiUrl);
    console.log("📧 Destinatário:", to);

    const emailResponse = await axios.post(emailApiUrl, emailPayload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = emailResponse.data;

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email enviado com sucesso",
        emailId: result.id || result.emailId || "N/A",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erro ao processar envio de email:", error);

    let errorMessage = "Erro ao enviar email";
    if (axios.isAxiosError(error)) {
      errorMessage =
        error.response?.data?.message ||
        error.message ||
        `Erro HTTP ${error.response?.status}: ${error.response?.statusText}`;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
