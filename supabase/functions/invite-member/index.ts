// Edge Function: invite-member
//
// Convida um novo membro para a loja do usuário que chama esta função, por e-mail,
// usando supabase.auth.admin.inviteUserByEmail — API que exige a service_role key e por
// isso NUNCA pode ser chamada diretamente do navegador.
//
// Autorização: esta função roda com a service_role key (que ignora RLS), então ela mesma
// precisa checar se quem está chamando é de fato o "dono" da loja informada antes de
// convidar alguém — sem essa checagem, qualquer usuário autenticado poderia se passar por
// dono de qualquer loja.
//
// Deploy (rodar localmente, nunca aqui no chat — exige seu token pessoal do Supabase):
//   npx supabase login
//   npx supabase link --project-ref vkoqsjfykybrtwhhrpiz
//   npx supabase functions deploy invite-member
//
// SUPABASE_URL, SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY são injetadas
// automaticamente pela plataforma em toda Edge Function — não é preciso configurar nada.

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') || '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Client "como o chamador": usa o JWT de quem fez a requisição, sujeito a RLS normal.
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await callerClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Não autenticado.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { email, papel, loja_id } = await req.json();
    if (!email || !papel || !loja_id) {
      return new Response(JSON.stringify({ error: 'email, papel e loja_id são obrigatórios.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!['dono', 'vendedor'].includes(papel)) {
      return new Response(JSON.stringify({ error: 'Papel inválido.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Confirma que quem chamou é dono da loja informada (RLS do próprio caller garante
    // que essa consulta só enxerga a linha dele mesmo).
    const { data: membro } = await callerClient
      .from('membros_loja')
      .select('papel')
      .eq('loja_id', loja_id)
      .eq('usuario_id', user.id)
      .eq('papel', 'dono')
      .maybeSingle();

    if (!membro) {
      return new Response(JSON.stringify({ error: 'Apenas o dono da loja pode convidar membros.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Só a partir daqui usamos a service_role key, para a ação privilegiada de convite.
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { error } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: { loja_id, papel },
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Registra (ou atualiza, se for reenvio) o convite pendente — é o que permite a tela
    // de Equipe mostrar "convite pendente" antes da pessoa aceitar.
    await adminClient
      .from('convites_pendentes')
      .upsert(
        { loja_id, email, papel, convidado_por: user.id, created_at: new Date().toISOString() },
        { onConflict: 'loja_id,email' }
      );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
