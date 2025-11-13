import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ message: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar todos os participantes com seus matches
    const { data: participants, error } = await supabaseClient
      .from('participants')
      .select(`
        id,
        name,
        email,
        token,
        created_at,
        matched_with,
        matched:participants!participants_matched_with_fkey(
          id,
          name,
          email
        )
      `)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    // Formatar resposta
    const formatted = participants.map((p: any) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      token: p.token,
      createdAt: p.created_at,
      matchedWith: p.matched_with,
      matchedWithName: p.matched?.name || null,
    }));

    return new Response(
      JSON.stringify(formatted),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: error.message || 'Erro ao buscar participantes' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

