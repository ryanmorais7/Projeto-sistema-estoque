-- Gestão 3.0 — vendas com desconto, forma de pagamento, cancelamento e devolução
-- Rodar depois do 013. Script ADITIVO: não apaga nem altera vendas já registradas.
-- Faça um backup antes (Supabase → Database → Backups, ou exporte as tabelas em CSV).
--
-- 1. vendas: cabeçalho de cada venda (número, subtotal, desconto, total, pagamento,
--    status). As vendas feitas pelo carrinho desde o 013 ganham uma linha aqui.
-- 2. vendas_pagamentos: uma linha por forma de pagamento (já pronto para pagamento misto).
-- 3. movimentacoes_estoque.subtotal e .desconto: desconto rateado por item. A coluna
--    total passa a ser o valor efetivamente recebido pelo item (já com desconto).
-- 4. membros_loja.desconto_maximo_pct: limite de desconto por funcionário (nulo = sem limite).
-- 5. registrar_venda_caixa: venda com desconto e pagamento, calculada no servidor.
-- 6. cancelar_venda e devolver_itens: estoque volta e o financeiro é corrigido com
--    lançamentos novos (nada é apagado do histórico). Só o dono.
-- 7. vendas_periodo: lançamentos de um período para relatórios; o custo só vai para o dono.
--
-- Regras de dinheiro: tudo é calculado em centavos inteiros dentro das funções.
-- O lucro de cada venda usa o custo gravado no momento da venda (custo_unitario), nunca
-- o custo atual do cadastro.

-- 1. VENDAS ------------------------------------------------------------------------------

create table if not exists public.vendas (
  id uuid primary key,
  loja_id uuid not null references public.lojas(id),
  numero integer not null,
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  desconto numeric(12, 2) not null default 0 check (desconto >= 0),
  desconto_tipo text check (desconto_tipo in ('valor', 'percentual')),
  desconto_informado numeric(12, 2),
  total numeric(12, 2) not null check (total >= 0),
  forma_pagamento text check (forma_pagamento in ('pix', 'dinheiro', 'debito', 'credito', 'misto')),
  valor_recebido numeric(12, 2),
  troco numeric(12, 2),
  status text not null default 'concluida' check (status in ('concluida', 'cancelada', 'devolvida', 'devolucao_parcial')),
  valor_devolvido numeric(12, 2) not null default 0,
  responsavel_id uuid references auth.users(id),
  responsavel_email text,
  created_at timestamptz not null default now(),
  cancelada_em timestamptz,
  cancelada_por uuid references auth.users(id),
  motivo_cancelamento text,
  origem text not null default 'caixa' check (origem in ('caixa', 'importada')),
  constraint vendas_desconto_ate_subtotal check (desconto <= subtotal)
);

create unique index if not exists uq_vendas_loja_numero on public.vendas (loja_id, numero);
create index if not exists idx_vendas_loja_data on public.vendas (loja_id, created_at desc);

alter table public.vendas enable row level security;
drop policy if exists "membros veem vendas da propria loja" on public.vendas;
create policy "membros veem vendas da propria loja"
  on public.vendas for select to authenticated
  using (loja_id in (select public.minhas_lojas()));
-- Sem policy de insert/update/delete: vendas só mudam pelas funções abaixo.

-- 2. VENDAS_PAGAMENTOS -------------------------------------------------------------------
-- Nunca guarda dado de cartão: só a forma e o valor.

create table if not exists public.vendas_pagamentos (
  id uuid primary key default gen_random_uuid(),
  venda_id uuid not null references public.vendas(id),
  loja_id uuid not null references public.lojas(id),
  forma text not null check (forma in ('pix', 'dinheiro', 'debito', 'credito')),
  valor numeric(12, 2) not null check (valor >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_vendas_pagamentos_venda on public.vendas_pagamentos (venda_id);

alter table public.vendas_pagamentos enable row level security;
drop policy if exists "membros veem pagamentos da propria loja" on public.vendas_pagamentos;
create policy "membros veem pagamentos da propria loja"
  on public.vendas_pagamentos for select to authenticated
  using (loja_id in (select public.minhas_lojas()));

-- 3. MOVIMENTACOES: desconto por item ---------------------------------------------------
-- subtotal = preço de cadastro × quantidade; desconto = parte do desconto da venda;
-- total = subtotal − desconto (o que entrou de fato). Em devolução/estorno os três
-- ficam negativos. Vendas antigas ficam com subtotal/desconto nulos (= sem desconto).

alter table public.movimentacoes_estoque add column if not exists subtotal numeric(12, 2);
alter table public.movimentacoes_estoque add column if not exists desconto numeric(12, 2);

-- 4. LIMITE DE DESCONTO POR FUNCIONÁRIO -----------------------------------------------------

alter table public.membros_loja add column if not exists desconto_maximo_pct numeric(5, 2);
alter table public.membros_loja drop constraint if exists membros_loja_desconto_maximo_check;
alter table public.membros_loja add constraint membros_loja_desconto_maximo_check
  check (desconto_maximo_pct is null or (desconto_maximo_pct >= 0 and desconto_maximo_pct <= 100));

-- Vendas do carrinho feitas desde o 013 (têm venda_id) ganham cabeçalho e número.
-- Vendas mais antigas (sem venda_id) continuam valendo nos relatórios, só sem número.
insert into public.vendas (id, loja_id, numero, subtotal, desconto, total, status, responsavel_id, responsavel_email, created_at, origem)
select
  m.venda_id,
  m.loja_id,
  row_number() over (partition by m.loja_id order by min(m.created_at), m.venda_id)
    + coalesce((select max(v.numero) from public.vendas v where v.loja_id = m.loja_id), 0),
  sum(m.total),
  0,
  sum(m.total),
  'concluida',
  (array_agg(m.responsavel_id order by m.created_at))[1],
  (array_agg(m.responsavel_email order by m.created_at))[1],
  min(m.created_at),
  'importada'
from public.movimentacoes_estoque m
where m.tipo = 'venda'
  and m.venda_id is not null
  and not exists (select 1 from public.vendas v where v.id = m.venda_id)
group by m.venda_id, m.loja_id;

-- 5. REGISTRAR_VENDA_CAIXA ----------------------------------------------------------------
-- p_itens: [{ "produto_id": 12, "quantidade": 2 }]
-- p_desconto_tipo: 'valor' (R$) | 'percentual' (%) | null. O desconto é recalculado aqui,
--   então mudar valores no navegador não passa dos limites.
-- O desconto é rateado entre os itens na proporção do valor de cada um; os centavos que
-- sobram do arredondamento vão para os itens com maior resto (empate: menor produto_id),
-- e a soma do rateio fecha exatamente com o desconto da venda.
-- Mesmo p_venda_id de novo = devolve a venda já gravada (proteção contra clique duplo).

create or replace function public.registrar_venda_caixa(
  p_itens jsonb,
  p_venda_id uuid,
  p_desconto_tipo text default null,
  p_desconto_valor numeric default 0,
  p_forma_pagamento text default null,
  p_valor_recebido numeric default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_linha record;
  v_produto public.products;
  v_loja uuid := null;
  v_email text := null;
  v_venda public.vendas;
  v_ids bigint[] := '{}';
  v_qtds integer[] := '{}';
  v_precos_c bigint[] := '{}';
  v_custos numeric[] := '{}';
  v_produtos public.products[] := '{}';
  v_itens_c bigint[] := '{}';
  v_rateio bigint[] := '{}';
  v_restos bigint[] := '{}';
  v_subtotal_c bigint := 0;
  v_desconto_c bigint := 0;
  v_total_c bigint;
  v_sobra bigint;
  v_limite numeric;
  v_numero integer;
  v_recebido_c bigint := null;
  v_i integer;
  v_k integer;
  v_melhor integer;
  v_movs jsonb := '[]'::jsonb;
  v_mov public.movimentacoes_estoque;
begin
  if p_venda_id is null then
    raise exception 'Venda sem identificação.';
  end if;
  if jsonb_typeof(p_itens) is distinct from 'array' or jsonb_array_length(p_itens) = 0 then
    raise exception 'O carrinho está vazio.';
  end if;
  if jsonb_array_length(p_itens) > 100 then
    raise exception 'Uma venda pode ter no máximo 100 itens.';
  end if;
  if p_forma_pagamento is not null and p_forma_pagamento not in ('pix', 'dinheiro', 'debito', 'credito') then
    raise exception 'Forma de pagamento inválida.';
  end if;

  perform pg_advisory_xact_lock(hashtext('vault-venda:' || p_venda_id::text));

  -- Clique duplo / nova tentativa: devolve o que já foi gravado.
  select * into v_venda from public.vendas where id = p_venda_id;
  if found then
    if v_venda.loja_id not in (select public.minhas_lojas()) then
      raise exception 'Sem permissão.';
    end if;
    return jsonb_build_object(
      'venda', to_jsonb(v_venda),
      'itens', coalesce((select jsonb_agg(to_jsonb(m) order by m.produto_id) from public.movimentacoes_estoque m where m.venda_id = p_venda_id and m.tipo = 'venda'), '[]'::jsonb)
    );
  end if;

  if exists (
    select 1 from jsonb_array_elements(p_itens) e
    where coalesce(nullif(e->>'quantidade', '')::integer, 0) <= 0 or nullif(e->>'produto_id', '') is null
  ) then
    raise exception 'Quantidade inválida no carrinho.';
  end if;

  -- Trava e confere cada produto (em ordem de id, para duas vendas não se travarem em cruz).
  for v_linha in
    select (e->>'produto_id')::bigint as produto_id, sum((e->>'quantidade')::integer)::integer as quantidade
    from jsonb_array_elements(p_itens) e
    group by 1 order by 1
  loop
    select * into v_produto from public.products where id = v_linha.produto_id for update;
    if not found then
      raise exception 'Produto não encontrado.';
    end if;
    if v_produto.loja_id not in (select public.minhas_lojas()) then
      raise exception 'Sem permissão para vender este produto.';
    end if;
    if v_loja is null then
      v_loja := v_produto.loja_id;
    elsif v_loja <> v_produto.loja_id then
      raise exception 'Todos os itens precisam ser da mesma loja.';
    end if;
    if v_produto.arquivado_em is not null then
      raise exception '"%" está arquivado e não pode ser vendido.', trim(concat_ws(' ', v_produto.brand, v_produto.model));
    end if;
    if v_produto.quantity < v_linha.quantidade then
      raise exception 'Estoque insuficiente de "%": tem %, pediu %.',
        trim(concat_ws(' ', v_produto.brand, v_produto.model)), v_produto.quantity, v_linha.quantidade;
    end if;

    v_ids := v_ids || v_produto.id;
    v_qtds := v_qtds || v_linha.quantidade;
    v_precos_c := v_precos_c || round(v_produto.price * 100)::bigint;
    v_custos := v_custos || (select c.custo_unitario from public.produtos_custos c where c.produto_id = v_produto.id);
    v_produtos := v_produtos || v_produto;
    v_itens_c := v_itens_c || (round(v_produto.price * 100)::bigint * v_linha.quantidade);
    v_subtotal_c := v_subtotal_c + round(v_produto.price * 100)::bigint * v_linha.quantidade;
  end loop;

  -- Desconto
  if p_desconto_tipo is not null and coalesce(p_desconto_valor, 0) <> 0 then
    if p_desconto_valor < 0 then
      raise exception 'O desconto não pode ser negativo.';
    end if;
    if p_desconto_tipo = 'valor' then
      v_desconto_c := round(p_desconto_valor * 100)::bigint;
      if v_desconto_c > v_subtotal_c then
        raise exception 'O desconto não pode passar do subtotal.';
      end if;
    elsif p_desconto_tipo = 'percentual' then
      if p_desconto_valor > 100 then
        raise exception 'O desconto não pode passar de 100%%.';
      end if;
      v_desconto_c := round(v_subtotal_c * p_desconto_valor / 100)::bigint;
    else
      raise exception 'Tipo de desconto inválido.';
    end if;
  elsif p_desconto_tipo is not null and p_desconto_tipo not in ('valor', 'percentual') then
    raise exception 'Tipo de desconto inválido.';
  end if;

  -- Limite por funcionário (o dono não tem limite).
  if v_desconto_c > 0 and not public.sou_dono_da_loja(v_loja) then
    select desconto_maximo_pct into v_limite
    from public.membros_loja where usuario_id = auth.uid() and loja_id = v_loja limit 1;
    if v_limite is not null and v_desconto_c > round(v_subtotal_c * v_limite / 100) then
      raise exception '%', format('Desconto acima do seu limite (%s%%). Peça ao dono da loja.', rtrim(rtrim(v_limite::text, '0'), '.'));
    end if;
  end if;

  v_total_c := v_subtotal_c - v_desconto_c;

  if p_forma_pagamento = 'dinheiro' and p_valor_recebido is not null then
    v_recebido_c := round(p_valor_recebido * 100)::bigint;
    if v_recebido_c < v_total_c then
      raise exception 'O valor recebido é menor que o total da venda.';
    end if;
  end if;

  -- Rateio do desconto
  v_sobra := v_desconto_c;
  for v_i in 1 .. array_length(v_ids, 1) loop
    if v_subtotal_c = 0 then
      v_rateio := v_rateio || 0::bigint;
      v_restos := v_restos || 0::bigint;
    else
      v_rateio := v_rateio || ((v_desconto_c * v_itens_c[v_i]) / v_subtotal_c);
      v_restos := v_restos || ((v_desconto_c * v_itens_c[v_i]) % v_subtotal_c);
    end if;
    v_sobra := v_sobra - v_rateio[v_i];
  end loop;
  for v_k in 1 .. v_sobra loop
    v_melhor := null;
    for v_i in 1 .. array_length(v_ids, 1) loop
      if v_restos[v_i] >= 0 and (v_melhor is null or v_restos[v_i] > v_restos[v_melhor]) then
        v_melhor := v_i;
      end if;
    end loop;
    v_rateio[v_melhor] := v_rateio[v_melhor] + 1;
    v_restos[v_melhor] := -1; -- cada item recebe no máximo 1 centavo extra
  end loop;

  select email into v_email from public.membros_loja where usuario_id = auth.uid() and loja_id = v_loja limit 1;

  perform pg_advisory_xact_lock(hashtext('vault-numero-venda:' || v_loja::text));
  select coalesce(max(numero), 0) + 1 into v_numero from public.vendas where loja_id = v_loja;

  insert into public.vendas (
    id, loja_id, numero, subtotal, desconto, desconto_tipo, desconto_informado, total,
    forma_pagamento, valor_recebido, troco, responsavel_id, responsavel_email
  ) values (
    p_venda_id, v_loja, v_numero, v_subtotal_c / 100.0, v_desconto_c / 100.0,
    case when v_desconto_c > 0 then p_desconto_tipo end,
    case when v_desconto_c > 0 then p_desconto_valor end,
    v_total_c / 100.0, p_forma_pagamento,
    case when v_recebido_c is not null then v_recebido_c / 100.0 end,
    case when v_recebido_c is not null then (v_recebido_c - v_total_c) / 100.0 end,
    auth.uid(), v_email
  ) returning * into v_venda;

  if p_forma_pagamento is not null then
    insert into public.vendas_pagamentos (venda_id, loja_id, forma, valor)
    values (p_venda_id, v_loja, p_forma_pagamento, v_total_c / 100.0);
  end if;

  for v_i in 1 .. array_length(v_ids, 1) loop
    update public.products set quantity = quantity - v_qtds[v_i] where id = v_ids[v_i];

    insert into public.movimentacoes_estoque (
      loja_id, produto_id, tipo, produto_snapshot, quantidade, preco_unitario,
      subtotal, desconto, total, custo_unitario, venda_id, responsavel_id, responsavel_email
    ) values (
      v_loja, v_ids[v_i], 'venda',
      jsonb_strip_nulls(jsonb_build_object(
        'type', (v_produtos[v_i]).type,
        'brand', (v_produtos[v_i]).brand,
        'model', (v_produtos[v_i]).model,
        'variacao', (v_produtos[v_i]).variacao,
        'color', nullif((v_produtos[v_i]).color, '')
      )),
      -v_qtds[v_i],
      v_precos_c[v_i] / 100.0,
      v_itens_c[v_i] / 100.0,
      v_rateio[v_i] / 100.0,
      (v_itens_c[v_i] - v_rateio[v_i]) / 100.0,
      v_custos[v_i],
      p_venda_id,
      auth.uid(),
      v_email
    ) returning * into v_mov;
    v_movs := v_movs || to_jsonb(v_mov);
  end loop;

  return jsonb_build_object('venda', to_jsonb(v_venda), 'itens', v_movs);
end;
$$;

grant execute on function public.registrar_venda_caixa(jsonb, uuid, text, numeric, text, numeric) to authenticated;

-- O carrinho do 013 (versão anterior do site, ainda aberta em algum navegador) passa a
-- gravar pelo caminho novo: a venda ganha cabeçalho e número, sem desconto.
create or replace function public.registrar_venda_carrinho(p_itens jsonb, p_venda_id uuid)
returns setof public.movimentacoes_estoque
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.registrar_venda_caixa(p_itens, p_venda_id, null, 0, null, null);
  return query
    select * from public.movimentacoes_estoque
    where venda_id = p_venda_id and tipo = 'venda'
    order by produto_id;
end;
$$;

grant execute on function public.registrar_venda_carrinho(jsonb, uuid) to authenticated;

-- 6. CANCELAMENTO E DEVOLUÇÃO ---------------------------------------------------------------
-- Nada é apagado: cada correção é um lançamento novo no livro-caixa, com valores
-- negativos e o custo histórico do item, na data em que aconteceu.
--   · devolucao: itens que voltaram (parcial ou total);
--   · estorno: cancelamento da venda (o que ainda não tinha sido devolvido).

-- Quanto de cada produto da venda ainda não voltou, e quanto falta estornar em dinheiro.
create or replace function public.venda_saldo_itens(p_venda_id uuid)
returns table (produto_id bigint, vendido integer, restante integer, total_restante numeric, desconto_restante numeric, subtotal_restante numeric, custo_unitario numeric, preco_unitario numeric, produto_snapshot jsonb)
language sql
stable
security definer
set search_path = public
as $$
  select
    v.produto_id,
    (-v.quantidade)::integer as vendido,
    ((-v.quantidade) - coalesce(sum(r.quantidade), 0))::integer as restante,
    v.total + coalesce(sum(r.total), 0) as total_restante,
    coalesce(v.desconto, 0) + coalesce(sum(r.desconto), 0) as desconto_restante,
    coalesce(v.subtotal, v.total) + coalesce(sum(r.subtotal), 0) as subtotal_restante,
    v.custo_unitario,
    v.preco_unitario,
    v.produto_snapshot
  from public.movimentacoes_estoque v
  left join public.movimentacoes_estoque r
    on r.venda_id = v.venda_id and r.produto_id = v.produto_id and r.tipo in ('devolucao', 'estorno')
  where v.venda_id = p_venda_id and v.tipo = 'venda'
  group by v.id;
$$;

revoke execute on function public.venda_saldo_itens(uuid) from public, anon, authenticated;

create or replace function public.devolver_itens(p_venda_id uuid, p_itens jsonb, p_motivo text default null)
returns public.vendas
language plpgsql
security definer
set search_path = public
as $$
declare
  v_venda public.vendas;
  v_item jsonb;
  v_saldo record;
  v_qtd integer;
  v_valor numeric;
  v_desc numeric;
  v_sub numeric;
  v_devolvido numeric := 0;
  v_email text;
begin
  select * into v_venda from public.vendas where id = p_venda_id for update;
  if not found then
    raise exception 'Venda não encontrada.';
  end if;
  if not public.sou_dono_da_loja(v_venda.loja_id) then
    raise exception 'Só o dono pode registrar devoluções.';
  end if;
  if v_venda.status = 'cancelada' then
    raise exception 'Esta venda já foi cancelada.';
  end if;
  if jsonb_typeof(p_itens) is distinct from 'array' or jsonb_array_length(p_itens) = 0 then
    raise exception 'Escolha pelo menos um item para devolver.';
  end if;

  select email into v_email from public.membros_loja where usuario_id = auth.uid() and loja_id = v_venda.loja_id limit 1;

  for v_item in select * from jsonb_array_elements(p_itens) loop
    v_qtd := coalesce(nullif(v_item->>'quantidade', '')::integer, 0);
    if v_qtd <= 0 then
      continue;
    end if;

    select * into v_saldo from public.venda_saldo_itens(p_venda_id) s where s.produto_id = (v_item->>'produto_id')::bigint;
    if not found then
      raise exception 'Este produto não faz parte da venda.';
    end if;
    if v_qtd > v_saldo.restante then
      raise exception 'Só restam % unidade(s) de "%" para devolver.', v_saldo.restante, trim(concat_ws(' ', v_saldo.produto_snapshot->>'brand', v_saldo.produto_snapshot->>'model'));
    end if;

    -- Devolvendo tudo o que resta: usa o saldo exato (os centavos fecham).
    if v_qtd = v_saldo.restante then
      v_valor := v_saldo.total_restante;
      v_desc := v_saldo.desconto_restante;
      v_sub := v_saldo.subtotal_restante;
    else
      v_valor := round(v_saldo.total_restante * v_qtd / v_saldo.restante, 2);
      v_desc := round(v_saldo.desconto_restante * v_qtd / v_saldo.restante, 2);
      v_sub := round(v_saldo.subtotal_restante * v_qtd / v_saldo.restante, 2);
    end if;

    update public.products set quantity = quantity + v_qtd where id = v_saldo.produto_id;

    insert into public.movimentacoes_estoque (
      loja_id, produto_id, tipo, produto_snapshot, quantidade, preco_unitario,
      subtotal, desconto, total, custo_unitario, venda_id, motivo, responsavel_id, responsavel_email
    ) values (
      v_venda.loja_id, v_saldo.produto_id, 'devolucao', v_saldo.produto_snapshot, v_qtd, v_saldo.preco_unitario,
      -v_sub, -v_desc, -v_valor, v_saldo.custo_unitario, p_venda_id, nullif(trim(coalesce(p_motivo, '')), ''), auth.uid(), v_email
    );
    v_devolvido := v_devolvido + v_valor;
  end loop;

  if v_devolvido = 0 and not exists (select 1 from jsonb_array_elements(p_itens) e where coalesce(nullif(e->>'quantidade', '')::integer, 0) > 0) then
    raise exception 'Escolha pelo menos um item para devolver.';
  end if;

  update public.vendas
  set valor_devolvido = valor_devolvido + v_devolvido,
      status = case when (select coalesce(sum(s.restante), 0) from public.venda_saldo_itens(p_venda_id) s) = 0 then 'devolvida' else 'devolucao_parcial' end
  where id = p_venda_id
  returning * into v_venda;

  return v_venda;
end;
$$;

grant execute on function public.devolver_itens(uuid, jsonb, text) to authenticated;

create or replace function public.cancelar_venda(p_venda_id uuid, p_motivo text default null)
returns public.vendas
language plpgsql
security definer
set search_path = public
as $$
declare
  v_venda public.vendas;
  v_saldo record;
  v_email text;
  v_estornado numeric := 0;
begin
  select * into v_venda from public.vendas where id = p_venda_id for update;
  if not found then
    raise exception 'Venda não encontrada.';
  end if;
  if not public.sou_dono_da_loja(v_venda.loja_id) then
    raise exception 'Só o dono pode cancelar vendas.';
  end if;
  if v_venda.status = 'cancelada' then
    raise exception 'Esta venda já foi cancelada.';
  end if;

  select email into v_email from public.membros_loja where usuario_id = auth.uid() and loja_id = v_venda.loja_id limit 1;

  for v_saldo in select * from public.venda_saldo_itens(p_venda_id) s where s.restante > 0 loop
    update public.products set quantity = quantity + v_saldo.restante where id = v_saldo.produto_id;

    insert into public.movimentacoes_estoque (
      loja_id, produto_id, tipo, produto_snapshot, quantidade, preco_unitario,
      subtotal, desconto, total, custo_unitario, venda_id, motivo, responsavel_id, responsavel_email
    ) values (
      v_venda.loja_id, v_saldo.produto_id, 'estorno', v_saldo.produto_snapshot, v_saldo.restante, v_saldo.preco_unitario,
      -v_saldo.subtotal_restante, -v_saldo.desconto_restante, -v_saldo.total_restante, v_saldo.custo_unitario,
      p_venda_id, nullif(trim(coalesce(p_motivo, '')), ''), auth.uid(), v_email
    );
    v_estornado := v_estornado + v_saldo.total_restante;
  end loop;

  update public.vendas
  set status = 'cancelada',
      cancelada_em = now(),
      cancelada_por = auth.uid(),
      motivo_cancelamento = nullif(trim(coalesce(p_motivo, '')), ''),
      valor_devolvido = valor_devolvido + v_estornado
  where id = p_venda_id
  returning * into v_venda;

  return v_venda;
end;
$$;

grant execute on function public.cancelar_venda(uuid, text) to authenticated;

-- 7. VENDAS_PERIODO (relatórios) -------------------------------------------------------------
-- Lançamentos de venda, devolução e estorno entre p_inicio (inclusive) e p_fim
-- (exclusive), com os dados da venda. custo_unitario só vem para o dono; para os
-- demais membros vem nulo.

create or replace function public.vendas_periodo(p_loja_id uuid, p_inicio timestamptz, p_fim timestamptz)
returns table (
  id uuid, tipo text, produto_id bigint, produto_snapshot jsonb, quantidade integer,
  preco_unitario numeric, subtotal numeric, desconto numeric, total numeric, custo_unitario numeric,
  venda_id uuid, responsavel_email text, created_at timestamptz, motivo text,
  venda_numero integer, venda_status text, forma_pagamento text, venda_created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_dono boolean;
begin
  if p_loja_id not in (select public.minhas_lojas()) then
    raise exception 'Sem permissão.';
  end if;
  v_dono := public.sou_dono_da_loja(p_loja_id);

  return query
    select m.id, m.tipo, m.produto_id, m.produto_snapshot, m.quantidade,
           m.preco_unitario, coalesce(m.subtotal, m.total), coalesce(m.desconto, 0), m.total,
           case when v_dono then m.custo_unitario end,
           m.venda_id, m.responsavel_email, m.created_at, m.motivo,
           v.numero, v.status, v.forma_pagamento, v.created_at
    from public.movimentacoes_estoque m
    left join public.vendas v on v.id = m.venda_id
    where m.loja_id = p_loja_id
      and m.tipo in ('venda', 'devolucao', 'estorno')
      and m.created_at >= p_inicio
      and (p_fim is null or m.created_at < p_fim)
    order by m.created_at, m.id
    limit 20000;
end;
$$;

grant execute on function public.vendas_periodo(uuid, timestamptz, timestamptz) to authenticated;

-- ROLLBACK (só se precisar desfazer; não apaga produtos nem lançamentos antigos) ------------
-- drop function if exists public.vendas_periodo(uuid, timestamptz, timestamptz);
-- drop function if exists public.cancelar_venda(uuid, text);
-- drop function if exists public.devolver_itens(uuid, jsonb, text);
-- drop function if exists public.venda_saldo_itens(uuid);
-- (registrar_venda_carrinho: rodar de novo a seção 5 do sql/013_vault_3.sql)
-- drop function if exists public.registrar_venda_caixa(jsonb, uuid, text, numeric, text, numeric);
-- alter table public.membros_loja drop column if exists desconto_maximo_pct;
-- alter table public.movimentacoes_estoque drop column if exists desconto;
-- alter table public.movimentacoes_estoque drop column if exists subtotal;
-- drop table if exists public.vendas_pagamentos;
-- drop table if exists public.vendas;   -- apaga números, descontos e formas de pagamento
