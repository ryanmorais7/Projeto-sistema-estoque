-- Fase A - Correção definitiva: recursão infinita nas policies de membros_loja
-- Rodar depois de 003, 004 e 005.
--
-- Causa raiz: a policy de SELECT (e a de DELETE) em membros_loja checava
-- "loja_id in (select loja_id from membros_loja where usuario_id = auth.uid())" —
-- uma subconsulta na PRÓPRIA tabela. Para resolver essa subconsulta, o Postgres precisa
-- aplicar a mesma policy de SELECT de novo, que por sua vez precisa da subconsulta de novo,
-- e assim por diante — recursão infinita. O 005 já tinha corrigido esse padrão na policy de
-- INSERT (usando a função loja_tem_membros), mas SELECT e DELETE continuavam com o problema,
-- e como praticamente toda consulta do app esbarra na policy de SELECT, o erro aparecia em
-- quase tudo.
--
-- A correção: uma função SECURITY DEFINER quebra o ciclo, porque ela roda com o privilégio
-- do dono da função (que ignora RLS por padrão), então a consulta interna dela não reaciona
-- a própria policy.

create or replace function public.minhas_lojas()
returns setof uuid
language sql
security definer
stable
set search_path = public
as $$
  select loja_id from public.membros_loja where usuario_id = auth.uid();
$$;

create or replace function public.sou_dono_da_loja(p_loja_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.membros_loja
    where loja_id = p_loja_id and usuario_id = auth.uid() and papel = 'dono'
  );
$$;

-- MEMBROS_LOJA ----------------------------------------------------------------

drop policy if exists "membros veem colegas da propria loja" on public.membros_loja;

create policy "membros veem colegas da propria loja"
  on public.membros_loja for select
  to authenticated
  using (loja_id in (select public.minhas_lojas()));

drop policy if exists "dono remove membros da propria loja" on public.membros_loja;

create policy "dono remove membros da propria loja"
  on public.membros_loja for delete
  to authenticated
  using (public.sou_dono_da_loja(loja_id));

-- LOJAS -------------------------------------------------------------------------
-- Mesma troca aqui, por consistência (não causava recursão, já que lojas != membros_loja,
-- mas evita depender de subconsultas cruas espalhadas pelo banco).

drop policy if exists "membros veem a propria loja" on public.lojas;

create policy "membros veem a propria loja"
  on public.lojas for select
  to authenticated
  using (
    id in (select public.minhas_lojas())
    or not exists (select 1 from public.membros_loja where loja_id = lojas.id)
  );

drop policy if exists "dono atualiza a propria loja" on public.lojas;

create policy "dono atualiza a propria loja"
  on public.lojas for update
  to authenticated
  using (public.sou_dono_da_loja(id));

-- PRODUCTS / UNIDADES_PRODUTO ------------------------------------------------------
-- Idem: troca a subconsulta crua pela função, mesmo efeito, mais robusto.

drop policy if exists "membros veem produtos da propria loja" on public.products;
drop policy if exists "membros inserem produtos na propria loja" on public.products;
drop policy if exists "membros atualizam produtos da propria loja" on public.products;
drop policy if exists "membros excluem produtos da propria loja" on public.products;

create policy "membros veem produtos da propria loja"
  on public.products for select to authenticated
  using (loja_id in (select public.minhas_lojas()));

create policy "membros inserem produtos na propria loja"
  on public.products for insert to authenticated
  with check (loja_id in (select public.minhas_lojas()));

create policy "membros atualizam produtos da propria loja"
  on public.products for update to authenticated
  using (loja_id in (select public.minhas_lojas()))
  with check (loja_id in (select public.minhas_lojas()));

create policy "membros excluem produtos da propria loja"
  on public.products for delete to authenticated
  using (loja_id in (select public.minhas_lojas()));

drop policy if exists "membros veem unidades da propria loja" on public.unidades_produto;
drop policy if exists "membros inserem unidades na propria loja" on public.unidades_produto;
drop policy if exists "membros atualizam unidades da propria loja" on public.unidades_produto;
drop policy if exists "membros excluem unidades da propria loja" on public.unidades_produto;

create policy "membros veem unidades da propria loja"
  on public.unidades_produto for select to authenticated
  using (loja_id in (select public.minhas_lojas()));

create policy "membros inserem unidades na propria loja"
  on public.unidades_produto for insert to authenticated
  with check (loja_id in (select public.minhas_lojas()));

create policy "membros atualizam unidades da propria loja"
  on public.unidades_produto for update to authenticated
  using (loja_id in (select public.minhas_lojas()))
  with check (loja_id in (select public.minhas_lojas()));

create policy "membros excluem unidades da propria loja"
  on public.unidades_produto for delete to authenticated
  using (loja_id in (select public.minhas_lojas()));
