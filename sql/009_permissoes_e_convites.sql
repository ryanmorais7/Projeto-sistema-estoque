-- Fase C - Permissões reais por papel (Dono / Vendedor) + convites pendentes
-- Rodar depois de 003 a 008.
--
-- Duas partes:
-- 1) Simplifica membros_loja.papel pra só 'dono'/'vendedor' (os únicos papéis usados de
--    verdade hoje) e aperta a RLS de products/unidades_produto/movimentacoes_estoque pra
--    que só o dono possa criar/editar/excluir — vendedor continua enxergando tudo (select)
--    e vendendo (a venda passa pela função registrar_venda, que já é SECURITY DEFINER e
--    portanto ignora essas policies de escrita, então o vendedor não é bloqueado ao vender).
-- 2) Cria a tabela convites_pendentes, porque hoje um convite só vira linha em membros_loja
--    quando a pessoa convidada aceita (primeiro login) — antes disso não existe nenhum
--    registro em lugar nenhum, então não tinha como mostrar "convite pendente" na tela.

-- 1. PAPEL: normaliza dados legados e aperta o check -----------------------------

update public.membros_loja set papel = 'vendedor' where papel in ('tecnico', 'financeiro');

alter table public.membros_loja drop constraint if exists membros_loja_papel_check;
alter table public.membros_loja add constraint membros_loja_papel_check check (papel in ('dono', 'vendedor'));

-- 2. RLS de escrita em products/unidades_produto restrita ao dono -----------------

drop policy if exists "membros inserem produtos na propria loja" on public.products;
drop policy if exists "membros atualizam produtos da propria loja" on public.products;
drop policy if exists "membros excluem produtos da propria loja" on public.products;

create policy "dono insere produtos na propria loja"
  on public.products for insert to authenticated
  with check (public.sou_dono_da_loja(loja_id));

create policy "dono atualiza produtos da propria loja"
  on public.products for update to authenticated
  using (public.sou_dono_da_loja(loja_id))
  with check (public.sou_dono_da_loja(loja_id));

create policy "dono exclui produtos da propria loja"
  on public.products for delete to authenticated
  using (public.sou_dono_da_loja(loja_id));

-- SELECT continua liberado pra todo membro (vendedor precisa ver o estoque pra vender).

drop policy if exists "membros inserem unidades na propria loja" on public.unidades_produto;
drop policy if exists "membros atualizam unidades da propria loja" on public.unidades_produto;
drop policy if exists "membros excluem unidades da propria loja" on public.unidades_produto;

create policy "dono insere unidades na propria loja"
  on public.unidades_produto for insert to authenticated
  with check (public.sou_dono_da_loja(loja_id));

create policy "dono atualiza unidades da propria loja"
  on public.unidades_produto for update to authenticated
  using (public.sou_dono_da_loja(loja_id))
  with check (public.sou_dono_da_loja(loja_id));

create policy "dono exclui unidades da propria loja"
  on public.unidades_produto for delete to authenticated
  using (public.sou_dono_da_loja(loja_id));

-- movimentacoes_estoque: a policy de insert só importa pro lançamento manual futuro de
-- entrada/ajuste (Etapa 4) — a venda em si passa pela RPC registrar_venda, que já ignora
-- RLS por ser SECURITY DEFINER, então o vendedor continua vendendo normalmente.
drop policy if exists "membros inserem movimentacoes na propria loja" on public.movimentacoes_estoque;

create policy "dono insere movimentacoes manuais na propria loja"
  on public.movimentacoes_estoque for insert to authenticated
  with check (public.sou_dono_da_loja(loja_id));

-- 3. CONVITES PENDENTES ---------------------------------------------------------

create table if not exists public.convites_pendentes (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references public.lojas(id) on delete cascade,
  email text not null,
  papel text not null check (papel in ('dono', 'vendedor')),
  convidado_por uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (loja_id, email)
);

alter table public.convites_pendentes enable row level security;

create policy "membros veem convites pendentes da propria loja"
  on public.convites_pendentes for select
  to authenticated
  using (loja_id in (select public.minhas_lojas()));

-- Sem policy de insert/delete client-facing: a criação acontece na Edge Function
-- invite-member (service_role, ignora RLS) e a remoção via cancelar_convite() abaixo
-- (SECURITY DEFINER, valida que quem chama é dono).

create or replace function public.cancelar_convite(p_convite_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_loja_id uuid;
begin
  select loja_id into v_loja_id from public.convites_pendentes where id = p_convite_id;

  if v_loja_id is null then
    return false;
  end if;

  if not public.sou_dono_da_loja(v_loja_id) then
    raise exception 'Apenas o dono da loja pode cancelar convites.';
  end if;

  delete from public.convites_pendentes where id = p_convite_id;
  return true;
end;
$$;

grant execute on function public.cancelar_convite(uuid) to authenticated;

-- 4. aceitar_convite() passa a apagar o convite pendente correspondente ----------

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

  delete from public.convites_pendentes where loja_id = v_loja_id and email = v_email;

  return v_membro;
end;
$$;
