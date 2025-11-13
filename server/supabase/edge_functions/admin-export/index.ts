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

    // Buscar todos os participantes
    const { data: participants, error } = await supabaseClient
      .from('participants')
      .select(`
        name,
        email,
        token,
        created_at,
        matched:participants!participants_matched_with_fkey(name)
      `)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    // Gerar CSV
    const csvHeader = 'Nome,Email,Token,Data Cadastro,Amigo Chocolate\n';
    const csvRows = participants.map((p: any) => {
      const date = new Date(p.created_at).toLocaleDateString('pt-BR');
      const matchedName = p.matched?.name || '';
      return `"${p.name}","${p.email}","${p.token}","${date}","${matchedName}"`;
    }).join('\n');

    const csv = csvHeader + csvRows;

    return new Response(csv, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="participantes-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: error.message || 'Erro ao exportar CSV' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

