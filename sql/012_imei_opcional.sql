-- Vault 2.0 — IMEI deixa de ser usado nas telas
-- Rodar depois do 011. Não apaga nada: a tabela unidades_produto e os IMEIs já
-- cadastrados continuam no banco, só não são mais exigidos.
--
-- registrar_venda_v2 passa a aceitar venda sem escolher IMEI. Se a lista de IMEIs vier
-- preenchida (versão anterior do site, ainda aberta em algum navegador), continua
-- validando e marcando as unidades como antes.

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

  -- IMEI agora é opcional: só valida e marca se a lista vier preenchida.
  v_qtd_unidades := coalesce(array_length(p_unidade_ids, 1), 0);

  if v_qtd_unidades > 0 then
    if v_qtd_unidades <> p_quantidade then
      raise exception 'Escolha % IMEI(s) para esta venda.', p_quantidade;
    end if;

    if (select count(distinct u) from unnest(p_unidade_ids) u) <> v_qtd_unidades then
      raise exception 'O mesmo IMEI foi escolhido mais de uma vez.';
    end if;

    perform 1 from public.unidades_produto where id = any(p_unidade_ids) for update;

    if (
      select count(*) from public.unidades_produto
      where id = any(p_unidade_ids)
        and produto_id = p_produto_id
        and status_venda = 'disponivel'
    ) <> v_qtd_unidades then
      raise exception 'Algum IMEI escolhido não está disponível para venda.';
    end if;

    update public.unidades_produto
    set status_venda = 'vendido', updated_at = now()
    where id = any(p_unidade_ids);

    select jsonb_agg(imei order by imei) into v_imeis
    from public.unidades_produto
    where id = any(p_unidade_ids);
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
      'color', nullif(v_produto.color, ''),
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

-- ROLLBACK: rodar de novo a seção 4 do sql/011_fundacao_comercial.sql.
