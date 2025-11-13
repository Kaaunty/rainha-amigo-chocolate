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
    const { name, email } = await req.json();

    if (!name || !email) {
      return new Response(
        JSON.stringify({ message: "Nome e e-mail são obrigatórios" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validação básica de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ message: "E-mail inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Gerar token único
    const { data: tokenData, error: tokenError } = await supabaseClient.rpc(
      "generate_unique_token"
    );

    if (tokenError) {
      throw tokenError;
    }

    const token = tokenData;

    // Inserir participante
    const { data: participant, error } = await supabaseClient
      .from("participants")
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        token: token,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        // Unique violation
        return new Response(
          JSON.stringify({ message: "Este e-mail já está cadastrado" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      throw error;
    }

    // Verificar se pode realizar sorteio e executar se necessário
    const { data: status, error: statusError } = await supabaseClient.rpc("get_draw_status");

    if (statusError) {
      console.error("Erro ao verificar status do sorteio:", statusError);
    }

    if (status?.canDraw && !status?.isDrawn) {
      // Executar sorteio automaticamente
      const { data: drawResult, error: drawError } = await supabaseClient.rpc("perform_draw");
      
      if (drawError) {
        console.error("Erro ao executar sorteio:", drawError);
        // Não falha o cadastro se o sorteio falhar, apenas loga o erro
      } else if (drawResult && !drawResult.success) {
        console.warn("Sorteio não executado:", drawResult.message);
      }
    }

    // Construir link
    const frontendUrl = Deno.env.get("FRONTEND_URL") || "http://localhost:3000";
    const link = `${frontendUrl}/participante/${token}`;

    return new Response(
      JSON.stringify({
        participant: {
          id: participant.id,
          name: participant.name,
          email: participant.email,
          token: participant.token,
          createdAt: participant.created_at,
          matchedWith: participant.matched_with,
        },
        link: link,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: error.message || "Erro ao cadastrar participante",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
