-- Fase B - Livro-caixa de estoque (vendas, entradas e ajustes num só ledger)
-- Rodar depois de 003 a 007.
--
-- Hoje "vender" só decrementa products.quantity (client-side, sem histórico). Este script
-- cria uma tabela única de movimentações — tipo='venda' preenche preço/total, 'entrada' e
-- 'ajuste' (Etapa 4, futura) só preenchem quantidade/motivo — em vez de uma tabela vendas
-- separada, pra não duplicar schema quando o log de entrada/ajuste manual for implementado.
--
-- A venda em si passa a acontecer dentro de uma função SECURITY DEFINER (mesmo padrão de
-- criar_loja/aceitar_convite em 007), que faz o "select ... for update" + decremento de
-- quantity + insert da movimentação como uma unidade atômica — hoje sellProduct() no client
-- faz um select seguido de um update em duas chamadas separadas, o que é uma condição de
-- corrida real se duas pessoas venderem o último item ao mesmo tempo.

create table if not exists public.movimentacoes_estoque (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references public.lojas(id),
  produto_id bigint not null references public.products(id),
  tipo text not null check (tipo in ('venda', 'entrada', 'ajuste')),
  -- Marca/modelo/cor/tipo no momento da movimentação: sobrevive a edição ou exclusão
  -- futura do produto, então o histórico nunca fica com um registro "órfão" sem nome.
  produto_snapshot jsonb not null,
  -- Positivo em 'entrada', negativo em 'venda'/'ajuste' de baixa.
  quantidade integer not null,
  preco_unitario numeric,
  total numeric,
  motivo text,
  responsavel_id uuid references auth.users(id),
  responsavel_email text,
  created_at timestamptz not null default now()
);

create index if not exists idx_movimentacoes_loja_data on public.movimentacoes_estoque (loja_id, created_at desc);
create index if not exists idx_movimentacoes_produto on public.movimentacoes_estoque (produto_id);

alter table public.movimentacoes_estoque enable row level security;

-- Segue o padrão de 006 (funções minhas_lojas()/sou_dono_da_loja() em vez de subconsulta
-- crua em membros_loja, que já causou recursão infinita numa rodada anterior).

create policy "membros veem movimentacoes da propria loja"
  on public.movimentacoes_estoque for select
  to authenticated
  using (loja_id in (select public.minhas_lojas()));

-- Necessária pra Etapa 4 (lançamento manual de entrada/ajuste direto do client).
-- A venda em si não depende desta policy: passa pela função registrar_venda abaixo, que
-- roda SECURITY DEFINER e já bypassa RLS como owner da tabela (mesmo comportamento de
-- criar_loja/aceitar_convite em 007).
create policy "membros inserem movimentacoes na propria loja"
  on public.movimentacoes_estoque for insert
  to authenticated
  with check (loja_id in (select public.minhas_lojas()));

-- Livro-caixa é imutável por design: sem policy de UPDATE. Só o dono pode apagar
-- (correção de erro grosseiro), nunca editar um registro já lançado.
create policy "dono exclui movimentacoes da propria loja"
  on public.movimentacoes_estoque for delete
  to authenticated
  using (public.sou_dono_da_loja(loja_id));

-- REGISTRAR VENDA (RPC) ------------------------------------------------------------

create or replace function public.registrar_venda(p_produto_id bigint, p_quantidade integer)
returns public.movimentacoes_estoque
language plpgsql
security definer
set search_path = public
as $$
declare
  v_produto public.products;
  v_email text;
  v_mov public.movimentacoes_estoque;
begin
  if p_quantidade is null or p_quantidade <= 0 then
    raise exception 'Quantidade inválida.';
  end if;

  -- "for update" trava a linha até o fim da transação: evita duas vendas simultâneas
  -- do mesmo produto decrementarem a partir do mesmo saldo (corrida hoje existente).
  select * into v_produto from public.products where id = p_produto_id for update;

  if not found then
    raise exception 'Produto não encontrado.';
  end if;

  if v_produto.loja_id not in (select public.minhas_lojas()) then
    raise exception 'Sem permissão para vender este produto.';
  end if;

  if v_produto.quantity < p_quantidade then
    raise exception 'Quantidade maior que o estoque disponível.';
  end if;

  select email into v_email
  from public.membros_loja
  where usuario_id = auth.uid() and loja_id = v_produto.loja_id
  limit 1;

  update public.products
  set quantity = quantity - p_quantidade
  where id = p_produto_id;

  insert into public.movimentacoes_estoque (
    loja_id, produto_id, tipo, produto_snapshot, quantidade,
    preco_unitario, total, responsavel_id, responsavel_email
  )
  values (
    v_produto.loja_id,
    v_produto.id,
    'venda',
    jsonb_build_object(
      'type', v_produto.type,
      'brand', v_produto.brand,
      'model', v_produto.model,
      'color', v_produto.color
    ),
    -p_quantidade,
    v_produto.price,
    v_produto.price * p_quantidade,
    auth.uid(),
    v_email
  )
  returning * into v_mov;

  return v_mov;
end;
$$;

grant execute on function public.registrar_venda(bigint, integer) to authenticated;
