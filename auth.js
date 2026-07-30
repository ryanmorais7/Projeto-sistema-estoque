// Autenticação real (Supabase Auth) + contexto de loja multi-tenant.
// SQL relacionado: sql/003_multi_tenant_fundacao.sql, sql/004_retrofit_loja_id.sql
//
// Modelo de convite (Fase A6): não existe tabela de convites separada. O convite é
// enviado pela Edge Function supabase/functions/invite-member (usa admin.inviteUserByEmail
// com a service_role key, nunca exposta no navegador), passando { loja_id, papel } como
// metadata do usuário convidado. No primeiro login dessa pessoa, aceitarConviteSeExistir()
// lê esse metadata e cria a linha em membros_loja — a policy de RLS em
// sql/003_multi_tenant_fundacao.sql é o que garante que só é possível aceitar o convite
// que realmente foi endereçado a ela (loja_id/papel batendo com o metadata do JWT).

// ============================================
// ESTADO DE SESSÃO / LOJA
// ============================================

let usuarioAtual = null;
let membroAtual = null;
let lojaAtual = null;

// ============================================
// AUTENTICAÇÃO
// ============================================

async function cadastrarUsuario(email, senha) {
  return supabaseClient.auth.signUp({ email, password: senha });
}

async function entrarComSenha(email, senha) {
  return supabaseClient.auth.signInWithPassword({ email, password: senha });
}

async function sair() {
  await supabaseClient.auth.signOut();
  usuarioAtual = null;
  membroAtual = null;
  lojaAtual = null;
}

async function obterSessaoAtual() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  return session;
}

// ============================================
// CONTEXTO DE LOJA (onboarding / convite)
// ============================================

async function buscarMembroDoUsuario(usuarioId) {
  const { data, error } = await supabaseClient
    .from('membros_loja')
    .select('*')
    .eq('usuario_id', usuarioId)
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return data;
}

async function aceitarConviteSeExistir(usuario) {
  const metadata = usuario.user_metadata || {};
  if (!metadata.loja_id || !metadata.papel) return null;

  const { data, error } = await supabaseClient.rpc('aceitar_convite');
  if (error || !data) return null;
  return data;
}

async function criarLojaEVincularDono(nome, tipoNegocio, usuario) {
  const { data: loja, error } = await supabaseClient.rpc('criar_loja', {
    p_nome: nome,
    p_tipo_negocio: tipoNegocio,
    p_email: usuario.email,
  });

  if (error) return { error };

  const membro = await buscarMembroDoUsuario(usuario.id);
  return { loja, membro };
}

async function buscarLoja(lojaId) {
  const { data, error } = await supabaseClient.from('lojas').select('*').eq('id', lojaId).single();
  if (error) return null;
  return data;
}

// ============================================
// EQUIPE
// ============================================

async function buscarMembrosDaLoja(lojaId) {
  const { data, error } = await supabaseClient
    .from('membros_loja')
    .select('*')
    .eq('loja_id', lojaId)
    .order('created_at', { ascending: true });

  if (error) return [];
  return data;
}

async function removerMembro(membroId) {
  const { error } = await supabaseClient.from('membros_loja').delete().eq('id', membroId);
  return !error;
}

async function buscarConvitesPendentes(lojaId) {
  const { data, error } = await supabaseClient
    .from('convites_pendentes')
    .select('*')
    .eq('loja_id', lojaId)
    .order('created_at', { ascending: true });

  if (error) return [];
  return data;
}

async function cancelarConvite(conviteId) {
  const { data, error } = await supabaseClient.rpc('cancelar_convite', { p_convite_id: conviteId });
  return !error && data === true;
}

async function convidarMembro(email, papel, lojaId) {
  const sessao = await obterSessaoAtual();
  if (!sessao) return { error: 'Sessão expirada, faça login novamente.' };

  const resposta = await fetch(`${SUPABASE_URL}/functions/v1/invite-member`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessao.access_token}`,
    },
    body: JSON.stringify({ email, papel, loja_id: lojaId }),
  });

  const resultado = await resposta.json().catch(() => ({}));
  if (!resposta.ok) return { error: resultado.error || 'Erro ao enviar convite.' };
  return { success: true };
}
