-- Fase A - Retrofit multi-tenant nas tabelas de dados existentes (products, unidades_produto)
-- Rodar DEPOIS do 003_multi_tenant_fundacao.sql.
--
-- Os 3 produtos que já existiam antes do multi-tenant não têm loja_id. Este script cria
-- uma loja "Loja Principal" e migra esses produtos (e suas unidades) para ela, antes de
-- tornar loja_id obrigatório. Depois de rodar, veja o passo manual no final do arquivo
-- para virar dono dessa loja com a sua conta.

-- 1. Loja padrão para os dados legados -----------------------------------

insert into public.lojas (nome, tipo_negocio, plano)
select 'Loja Principal', 'revenda', 'trial'
where not exists (select 1 from public.lojas where nome = 'Loja Principal');

-- 2. Adiciona loja_id nas tabelas de dados --------------------------------

alter table public.products add column if not exists loja_id uuid references public.lojas(id);
alter table public.unidades_produto add column if not exists loja_id uuid references public.lojas(id);

-- 3. Migra os registros legados para a Loja Principal ---------------------

update public.products
set loja_id = (select id from public.lojas where nome = 'Loja Principal')
where loja_id is null;

update public.unidades_produto up
set loja_id = p.loja_id
from public.products p
where up.produto_id = p.id
  and up.loja_id is null;

-- 4. loja_id passa a ser obrigatório ---------------------------------------

alter table public.products alter column loja_id set not null;
alter table public.unidades_produto alter column loja_id set not null;

-- 5. Habilita RLS ------------------------------------------------------------

alter table public.products enable row level security;
alter table public.unidades_produto enable row level security;

-- PRODUCTS ------------------------------------------------------------------

create policy "membros veem produtos da propria loja"
  on public.products for select
  to authenticated
  using (loja_id in (select loja_id from public.membros_loja where usuario_id = auth.uid()));

create policy "membros inserem produtos na propria loja"
  on public.products for insert
  to authenticated
  with check (loja_id in (select loja_id from public.membros_loja where usuario_id = auth.uid()));

create policy "membros atualizam produtos da propria loja"
  on public.products for update
  to authenticated
  using (loja_id in (select loja_id from public.membros_loja where usuario_id = auth.uid()))
  with check (loja_id in (select loja_id from public.membros_loja where usuario_id = auth.uid()));

create policy "membros excluem produtos da propria loja"
  on public.products for delete
  to authenticated
  using (loja_id in (select loja_id from public.membros_loja where usuario_id = auth.uid()));

-- UNIDADES_PRODUTO ------------------------------------------------------------

create policy "membros veem unidades da propria loja"
  on public.unidades_produto for select
  to authenticated
  using (loja_id in (select loja_id from public.membros_loja where usuario_id = auth.uid()));

create policy "membros inserem unidades na propria loja"
  on public.unidades_produto for insert
  to authenticated
  with check (loja_id in (select loja_id from public.membros_loja where usuario_id = auth.uid()));

create policy "membros atualizam unidades da propria loja"
  on public.unidades_produto for update
  to authenticated
  using (loja_id in (select loja_id from public.membros_loja where usuario_id = auth.uid()))
  with check (loja_id in (select loja_id from public.membros_loja where usuario_id = auth.uid()));

create policy "membros excluem unidades da propria loja"
  on public.unidades_produto for delete
  to authenticated
  using (loja_id in (select loja_id from public.membros_loja where usuario_id = auth.uid()));

-- 6. PASSO MANUAL — rode só uma vez, depois de criar sua conta de verdade -----
--
-- O Vault agora exige login real (Supabase Auth). Crie sua conta pela tela de
-- cadastro do app primeiro. Depois, pegue o seu user id em
-- Authentication > Users no painel do Supabase e rode (trocando os valores):
--
-- insert into public.membros_loja (usuario_id, loja_id, papel, email)
-- select 'SEU-USER-ID-AQUI', id, 'dono', 'seu-email@exemplo.com'
-- from public.lojas where nome = 'Loja Principal';
