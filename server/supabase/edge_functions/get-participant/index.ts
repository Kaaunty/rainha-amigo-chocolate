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
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response(
        JSON.stringify({ message: 'Token não fornecido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Buscar participante pelo token
    const { data: participant, error } = await supabaseClient
      .from('participants')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !participant) {
      return new Response(
        JSON.stringify({ message: 'Participante não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let matchedParticipant = null;

    // Se tem matched_with, buscar o participante correspondente
    if (participant.matched_with) {
      const { data: matched } = await supabaseClient
        .from('participants')
        .select('id, name, email, token, created_at')
        .eq('id', participant.matched_with)
        .single();

      if (matched) {
        matchedParticipant = {
          id: matched.id,
          name: matched.name,
          email: matched.email,
          token: matched.token,
          createdAt: matched.created_at,
          matchedWith: participant.id,
          matchedWithName: participant.name,
        };
      }
    }

    return new Response(
      JSON.stringify({
        participant: {
          id: participant.id,
          name: participant.name,
          email: participant.email,
          token: participant.token,
          createdAt: participant.created_at,
          matchedWith: participant.matched_with,
          matchedWithName: matchedParticipant?.name || null,
        },
        matchedParticipant: matchedParticipant,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: error.message || 'Erro ao buscar participante' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

