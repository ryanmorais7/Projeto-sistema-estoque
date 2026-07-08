-- Fase A - Correções de RLS descobertas ao testar o onboarding
-- Rodar depois de 003_multi_tenant_fundacao.sql e 004_retrofit_loja_id.sql.

-- BUG 1: "Erro ao criar a loja" ---------------------------------------------
-- INSERT ... RETURNING é filtrado pela policy de SELECT. No momento em que a loja é
-- criada, o usuário ainda não é membro dela (isso só acontece no passo seguinte), então
-- a policy antiga escondia a linha recém-criada do próprio criador, e o app recebia
-- "0 rows" como se tivesse falhado. Corrigido permitindo enxergar também uma loja que
-- ainda não tem nenhum membro (janela transitória entre criar a loja e virar dono dela).

drop policy if exists "membros veem a propria loja" on public.lojas;

create policy "membros veem a propria loja"
  on public.lojas for select
  to authenticated
  using (
    id in (select loja_id from public.membros_loja where usuario_id = auth.uid())
    or not exists (select 1 from public.membros_loja where loja_id = lojas.id)
  );

-- BUG 2: brecha de segurança no "bootstrap de dono" --------------------------
-- A policy de INSERT em membros_loja verificava "not exists (select ... from
-- membros_loja where loja_id = X)" para decidir se o usuário pode virar dono. Só que essa
-- subconsulta também é filtrada pela RLS: para qualquer usuário que ainda não é membro de
-- NENHUMA loja, a policy de SELECT esconde TODAS as linhas de membros_loja dele — inclusive
-- as de lojas alheias — fazendo a checagem sempre "mentir" que a loja está vazia. Ou seja,
-- qualquer usuário novo poderia se inserir como dono de uma loja que já tem donos.
--
-- Corrige criando uma função SECURITY DEFINER (roda com privilégio de dono da função,
-- ignorando RLS só para esta checagem pontual) que responde com a verdade sobre a loja.

create or replace function public.loja_tem_membros(p_loja_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from public.membros_loja where loja_id = p_loja_id);
$$;

drop policy if exists "bootstrap de dono ou aceite de convite" on public.membros_loja;

create policy "bootstrap de dono ou aceite de convite"
  on public.membros_loja for insert
  to authenticated
  with check (
    usuario_id = auth.uid()
    and (
      (papel = 'dono' and not public.loja_tem_membros(membros_loja.loja_id))
      or
      (
        loja_id = nullif(auth.jwt() -> 'user_metadata' ->> 'loja_id', '')::uuid
        and papel = (auth.jwt() -> 'user_metadata' ->> 'papel')
      )
    )
  );
