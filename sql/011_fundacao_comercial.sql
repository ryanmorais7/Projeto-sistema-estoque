-- Vault 2.0 · Etapa 1 — Fundação comercial
-- Rodar depois do 010. Script ADITIVO: não apaga nem altera nenhum dado existente,
-- e a versão atual do site continua funcionando depois dele.
--
-- 1. products ganha created_at, estoque_minimo e arquivado_em.
-- 2. produtos_custos: custo unitário separado, que só o dono enxerga.
-- 3. movimentacoes_estoque ganha venda_id, custo_unitario e novos tipos.
-- 4. registrar_venda_v2: venda que baixa o IMEI quando o produto é aparelho.
-- 5. marcar_unidade_vendida: acerta aparelhos vendidos antes desta correção.

-- 1. PRODUCTS --------------------------------------------------------------------

-- Produtos antigos ficam com created_at nulo ("data de entrada desconhecida"), em vez
-- de receberem a data de hoje — senão o relatório de "produtos parados" erraria.
alter table public.products add column if not exists created_at timestamptz;
alter table public.products alter column created_at set default now();

-- Nulo = usa o limite padrão da loja (5 unidades).
alter table public.products add column if not exists estoque_minimo integer;
alter table public.products drop constraint if exists products_estoque_minimo_check;
alter table public.products add constraint products_estoque_minimo_check check (estoque_minimo is null or estoque_minimo >= 0);

-- Produto com histórico de venda não pode ser excluído (o livro-caixa aponta pra ele),
-- então ele é arquivado: some das listas, mas o histórico continua íntegro.
alter table public.products add column if not exists arquivado_em timestamptz;

-- 2. PRODUTOS_CUSTOS -------------------------------------------------------------
-- A RLS do Supabase filtra linhas, não colunas. Se o custo ficasse em products, todo
-- vendedor conseguiria lê-lo pela API mesmo com a tela escondendo. Por isso ele fica
-- numa tabela própria, com acesso só do dono.
-- custo_unitario nulo = "custo não informado" (nunca é tratado como zero).

create table if not exists public.produtos_custos (
  produto_id bigint primary key references public.products(id) on delete cascade,
  loja_id uuid not null references public.lojas(id),
  custo_unitario numeric(12, 2) check (custo_unitario is null or custo_unitario >= 0),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create index if not exists idx_produtos_custos_loja on public.produtos_custos (loja_id);

alter table public.produtos_custos enable row level security;

drop policy if exists "dono ve custos da propria loja" on public.produtos_custos;
drop policy if exists "dono insere custos da propria loja" on public.produtos_custos;
drop policy if exists "dono atualiza custos da propria loja" on public.produtos_custos;
drop policy if exists "dono exclui custos da propria loja" on public.produtos_custos;

create policy "dono ve custos da propria loja"
  on public.produtos_custos for select to authenticated
  using (public.sou_dono_da_loja(loja_id));

create policy "dono insere custos da propria loja"
  on public.produtos_custos for insert to authenticated
  with check (
    public.sou_dono_da_loja(loja_id)
    and exists (select 1 from public.products p where p.id = produto_id and p.loja_id = produtos_custos.loja_id)
  );

create policy "dono atualiza custos da propria loja"
  on public.produtos_custos for update to authenticated
  using (public.sou_dono_da_loja(loja_id))
  with check (
    public.sou_dono_da_loja(loja_id)
    and exists (select 1 from public.products p where p.id = produto_id and p.loja_id = produtos_custos.loja_id)
  );

create policy "dono exclui custos da propria loja"
  on public.produtos_custos for delete to authenticated
  using (public.sou_dono_da_loja(loja_id));

-- 3. MOVIMENTACOES_ESTOQUE --------------------------------------------------------

-- Vai apontar pra tabela vendas na Etapa 2 (a FK entra junto com a tabela).
alter table public.movimentacoes_estoque add column if not exists venda_id uuid;
-- Custo do item no momento da movimentação: o lucro histórico não muda se o custo mudar.
alter table public.movimentacoes_estoque add column if not exists custo_unitario numeric(12, 2);

create index if not exists idx_movimentacoes_venda on public.movimentacoes_estoque (venda_id) where venda_id is not null;

alter table public.movimentacoes_estoque drop constraint if exists movimentacoes_estoque_tipo_check;
alter table public.movimentacoes_estoque add constraint movimentacoes_estoque_tipo_check
  check (tipo in ('venda', 'entrada', 'ajuste', 'devolucao', 'perda', 'estorno'));

-- 4. REGISTRAR_VENDA_V2 -----------------------------------------------------------
-- Igual ao registrar_venda (008), mais:
--   · aparelho com IMEI cadastrado exige escolher quais unidades saíram, e marca cada
--     uma como 'vendido' (antes a quantidade baixava, mas o IMEI ficava 'disponivel');
--   · grava o custo do momento (se existir) e os IMEIs vendidos no snapshot.
-- O registrar_venda antigo continua existindo para a versão atual do site.

create or replace function public.registrar_venda_v2(
  p_produto_id bigint,
  p_quantidade integer,
  p_unidade_ids uuid[] default null
)
returns public.movimentacoes_estoque
language plpgsql
security definer
set search_path = public
as $$
declare
  v_produto public.products;
  v_email text;
  v_custo numeric;
  v_disponiveis integer;
  v_imeis jsonb := null;
  v_qtd_unidades integer;
  v_mov public.movimentacoes_estoque;
begin
  if p_quantidade is null or p_quantidade <= 0 then
    raise exception 'Quantidade inválida.';
  end if;

  select * into v_produto from public.products where id = p_produto_id for update;

  if not found then
    raise exception 'Produto não encontrado.';
  end if;

  if v_produto.loja_id not in (select public.minhas_lojas()) then
    raise exception 'Sem permissão para vender este produto.';
  end if;

  if v_produto.arquivado_em is not null then
    raise exception 'Produto arquivado não pode ser vendido.';
  end if;

  if v_produto.quantity < p_quantidade then
    raise exception 'Quantidade maior que o estoque disponível.';
  end if;

  -- Aparelho com IMEI: precisa dizer exatamente quais unidades saíram.
  if v_produto.type = 'aparelhos' then
    select count(*) into v_disponiveis
    from public.unidades_produto
    where produto_id = p_produto_id and status_venda = 'disponivel';

    if v_disponiveis > 0 then
      v_qtd_unidades := coalesce(array_length(p_unidade_ids, 1), 0);

      if v_qtd_unidades <> p_quantidade then
        raise exception 'Escolha % IMEI(s) para esta venda.', p_quantidade;
      end if;

      if (select count(distinct u) from unnest(p_unidade_ids) u) <> v_qtd_unidades then
        raise exception 'O mesmo IMEI foi escolhido mais de uma vez.';
      end if;

      -- Trava as unidades e confere que todas são deste produto e estão disponíveis.
      perform 1 from public.unidades_produto
      where id = any(p_unidade_ids)
      for update;

      if (
        select count(*) from public.unidades_produto
        where id = any(p_unidade_ids)
          and produto_id = p_produto_id
          and status_venda = 'disponivel'
      ) <> v_qtd_unidades then
        raise exception 'Algum IMEI escolhido não está disponível para venda.';
      end if;

      if exists (
        select 1 from public.unidades_produto
        where id = any(p_unidade_ids) and status_anatel = 'impedido'
      ) then
        raise exception 'IMEI impedido na Anatel: não negociar.';
      end if;

      update public.unidades_produto
      set status_venda = 'vendido', updated_at = now()
      where id = any(p_unidade_ids);

      select jsonb_agg(imei order by imei) into v_imeis
      from public.unidades_produto
      where id = any(p_unidade_ids);
    end if;
  end if;

  select email into v_email
  from public.membros_loja
  where usuario_id = auth.uid() and loja_id = v_produto.loja_id
  limit 1;

  select custo_unitario into v_custo
  from public.produtos_custos
  where produto_id = p_produto_id;

  update public.products
  set quantity = quantity - p_quantidade
  where id = p_produto_id;

  insert into public.movimentacoes_estoque (
    loja_id, produto_id, tipo, produto_snapshot, quantidade,
    preco_unitario, total, custo_unitario, responsavel_id, responsavel_email
  )
  values (
    v_produto.loja_id,
    v_produto.id,
    'venda',
    jsonb_strip_nulls(jsonb_build_object(
      'type', v_produto.type,
      'brand', v_produto.brand,
      'model', v_produto.model,
      'color', v_produto.color,
      'imeis', v_imeis
    )),
    -p_quantidade,
    v_produto.price,
    v_produto.price * p_quantidade,
    v_custo,
    auth.uid(),
    v_email
  )
  returning * into v_mov;

  return v_mov;
end;
$$;

grant execute on function public.registrar_venda_v2(bigint, integer, uuid[]) to authenticated;

-- 5. ACERTO DE APARELHOS VENDIDOS ANTES DA CORREÇÃO ---------------------------------
-- Vendas antigas de aparelho baixaram a quantidade mas deixaram o IMEI 'disponivel'.
-- O dono escolhe na tela qual IMEI saiu e esta função marca só ele, sem mexer no
-- estoque (a quantidade já foi baixada lá atrás). Só funciona enquanto houver mais
-- IMEIs disponíveis do que unidades em estoque, então não dá pra usar para "sumir"
-- com um aparelho que está de fato na loja.

create or replace function public.marcar_unidade_vendida(p_unidade_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_unidade public.unidades_produto;
  v_quantidade integer;
  v_disponiveis integer;
begin
  select * into v_unidade from public.unidades_produto where id = p_unidade_id for update;

  if not found then
    raise exception 'Unidade não encontrada.';
  end if;

  if not public.sou_dono_da_loja(v_unidade.loja_id) then
    raise exception 'Só o dono pode acertar unidades.';
  end if;

  if v_unidade.status_venda <> 'disponivel' then
    return false;
  end if;

  select quantity into v_quantidade from public.products where id = v_unidade.produto_id for update;

  select count(*) into v_disponiveis
  from public.unidades_produto
  where produto_id = v_unidade.produto_id and status_venda = 'disponivel';

  if v_disponiveis <= v_quantidade then
    raise exception 'Os IMEIs já batem com o estoque. Para vender, use a tela de vendas.';
  end if;

  update public.unidades_produto
  set status_venda = 'vendido', updated_at = now()
  where id = p_unidade_id;

  return true;
end;
$$;

grant execute on function public.marcar_unidade_vendida(uuid) to authenticated;

-- ROLLBACK (só se precisar desfazer; não apaga dados de produtos nem de vendas) ------
-- drop function if exists public.marcar_unidade_vendida(uuid);
-- drop function if exists public.registrar_venda_v2(bigint, integer, uuid[]);
-- alter table public.movimentacoes_estoque drop constraint if exists movimentacoes_estoque_tipo_check;
-- alter table public.movimentacoes_estoque add constraint movimentacoes_estoque_tipo_check check (tipo in ('venda', 'entrada', 'ajuste'));
-- alter table public.movimentacoes_estoque drop column if exists custo_unitario;
-- alter table public.movimentacoes_estoque drop column if exists venda_id;
-- drop table if exists public.produtos_custos;
-- alter table public.products drop column if exists arquivado_em;
-- alter table public.products drop column if exists estoque_minimo;
-- alter table public.products drop column if exists created_at;
