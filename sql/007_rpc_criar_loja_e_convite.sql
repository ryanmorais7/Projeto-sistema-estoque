-- Fase A - Troca de estratégia: bootstrap de loja e aceite de convite via RPC
-- Rodar depois de 003, 004, 005 e 006.
--
-- Depois de duas rodadas de bugs de RLS na policy de INSERT de membros_loja (recursão,
-- depois "new row violates row-level security policy"), a causa provável é a própria
-- natureza frágil de checar "sou o primeiro membro?" dentro de uma policy que depende de
-- consultar a mesma tabela que está sendo escrita. Em vez de continuar ajustando a policy,
-- este script move a criação de loja e o aceite de convite para dentro de funções
-- SECURITY DEFINER (rodam com privilégio elevado, ignoram RLS de propósito, mas cada uma
-- valida exatamente o que pode fazer antes de agir) — é o padrão recomendado pelo próprio
-- Supabase para esse tipo de "bootstrap".
--
-- Depois disso, o INSERT direto do cliente em lojas/membros_loja deixa de ser permitido:
-- toda criação passa pelas funções abaixo, chamadas via supabase.rpc(...).

create or replace function public.criar_loja(p_nome text, p_tipo_negocio text, p_email text)
returns public.lojas
language plpgsql
security definer
set search_path = public
as $$
declare
  v_loja public.lojas;
begin
  insert into public.lojas (nome, tipo_negocio, plano)
  values (p_nome, p_tipo_negocio, 'trial')
  returning * into v_loja;

  insert into public.membros_loja (usuario_id, loja_id, papel, email)
  values (auth.uid(), v_loja.id, 'dono', p_email);

  return v_loja;
end;
$$;

grant execute on function public.criar_loja(text, text, text) to authenticated;

create or replace function public.aceitar_convite()
returns public.membros_loja
language plpgsql
security definer
set search_path = public
as $$
declare
  v_loja_id uuid;
  v_papel text;
  v_email text;
  v_membro public.membros_loja;
begin
  -- Lê o convite dos metadados do próprio usuário autenticado (gravados pela Edge Function
  -- invite-member via admin.inviteUserByEmail) — nunca de parâmetros vindos do cliente,
  -- senão qualquer um poderia se auto-nomear dono/técnico/etc. de qualquer loja.
  select (raw_user_meta_data ->> 'loja_id')::uuid, raw_user_meta_data ->> 'papel', email
  into v_loja_id, v_papel, v_email
  from auth.users
  where id = auth.uid();

  if v_loja_id is null or v_papel is null then
    return null;
  end if;

  insert into public.membros_loja (usuario_id, loja_id, papel, email)
  values (auth.uid(), v_loja_id, v_papel, v_email)
  returning * into v_membro;

  return v_membro;
end;
$$;

grant execute on function public.aceitar_convite() to authenticated;

-- INSERT direto do cliente não é mais necessário nem permitido nessas duas tabelas.
drop policy if exists "qualquer usuario autenticado pode criar uma loja (onboarding)" on public.lojas;
drop policy if exists "bootstrap de dono ou aceite de convite" on public.membros_loja;

-- Função da tentativa anterior, não é mais usada.
drop function if exists public.loja_tem_membros(uuid);
