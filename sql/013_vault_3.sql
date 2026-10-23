-- Vault 3.0 — cadastro em lote com linha/tipo, listas editáveis, carrinho e meta mensal
-- Rodar depois do 012. Script ADITIVO: não apaga nem reescreve dados existentes.
-- Faça um backup antes (Supabase → Database → Backups, ou exporte as tabelas em CSV).
--
-- 1. products.variacao: linha da capinha (Premium, Básica...) ou tipo da película (3D...).
-- 2. catalogo_opcoes: listas que o dono edita sem mexer no código (linhas, tipos,
--    marcas e modelos adicionados à mão).
-- 3. salvar_lista_catalogo: troca a lista de linhas/tipos numa transação só.
-- 4. cadastrar_lote: cadastra/soma vários produtos de uma vez, tudo ou nada.
-- 5. registrar_venda_carrinho: vende vários itens numa venda só, tudo ou nada.
-- 6. lojas.meta_mensal.

-- 1. PRODUCTS.VARIACAO ------------------------------------------------------------
-- Nulo nos produtos antigos e nos acessórios. Texto livre (não FK) para que renomear
-- ou apagar uma opção da lista nunca quebre um produto já cadastrado.

alter table public.products add column if not exists variacao text;

-- Mesma regra de comparação usada na tela: ignora maiúsculas e espaços repetidos.
create or replace function public.normalizar_nome(p_texto text)
returns text
language sql
immutable
as $$
  select lower(regexp_replace(trim(coalesce(p_texto, '')), '\s+', ' ', 'g'));
$$;

-- 2. CATALOGO_OPCOES -----------------------------------------------------------------
-- grupo = 'linha_capinha' | 'tipo_pelicula': se a loja tiver linhas salvas, elas
--   substituem a lista padrão do sistema (na ordem de "ordem").
-- grupo = 'marca' | 'modelo': marcas e modelos que o dono digitou e mandou guardar.
--   Somam-se às sugestões padrão. Modelo guarda a marca e a família (ex.: Linha A).

create table if not exists public.catalogo_opcoes (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references public.lojas(id) on delete cascade,
  grupo text not null check (grupo in ('linha_capinha', 'tipo_pelicula', 'marca', 'modelo')),
  nome text not null check (length(trim(nome)) between 1 and 60),
  marca text,
  familia text,
  ordem integer not null default 0,
  created_at timestamptz not null default now()
);

create unique index if not exists uq_catalogo_opcoes_nome
  on public.catalogo_opcoes (loja_id, grupo, public.normalizar_nome(marca), public.normalizar_nome(nome));

create index if not exists idx_catalogo_opcoes_loja on public.catalogo_opcoes (loja_id, grupo, ordem);

alter table public.catalogo_opcoes enable row level security;

drop policy if exists "membros veem catalogo da propria loja" on public.catalogo_opcoes;
drop policy if exists "dono insere catalogo da propria loja" on public.catalogo_opcoes;
drop policy if exists "dono atualiza catalogo da propria loja" on public.catalogo_opcoes;
drop policy if exists "dono exclui catalogo da propria loja" on public.catalogo_opcoes;

create policy "membros veem catalogo da propria loja"
  on public.catalogo_opcoes for select to authenticated
  using (loja_id in (select public.minhas_lojas()));

create policy "dono insere catalogo da propria loja"
  on public.catalogo_opcoes for insert to authenticated
  with check (public.sou_dono_da_loja(loja_id));

create policy "dono atualiza catalogo da propria loja"
  on public.catalogo_opcoes for update to authenticated
  using (public.sou_dono_da_loja(loja_id))
  with check (public.sou_dono_da_loja(loja_id));

create policy "dono exclui catalogo da propria loja"
  on public.catalogo_opcoes for delete to authenticated
  using (public.sou_dono_da_loja(loja_id));

-- 3. SALVAR_LISTA_CATALOGO -----------------------------------------------------------
-- Substitui a lista inteira de linhas (ou tipos) e, se pedido, renomeia a variação nos
-- produtos que usavam o nome antigo. Roda como o próprio usuário (RLS vale).
-- p_renomear: [{"de": "Premium", "para": "Premium Plus"}, ...]

create or replace function public.salvar_lista_catalogo(
  p_loja_id uuid,
  p_grupo text,
  p_nomes text[],
  p_renomear jsonb default '[]'::jsonb
)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_tipo text;
  v_troca jsonb;
  v_total integer;
begin
  if not public.sou_dono_da_loja(p_loja_id) then
    raise exception 'Só o dono pode editar as listas do cadastro.';
  end if;

  if p_grupo = 'linha_capinha' then v_tipo := 'capinhas';
  elsif p_grupo = 'tipo_pelicula' then v_tipo := 'peliculas';
  else raise exception 'Lista inválida.';
  end if;

  if coalesce(array_length(p_nomes, 1), 0) = 0 then
    raise exception 'A lista precisa ter pelo menos uma opção.';
  end if;

  if coalesce(array_length(p_nomes, 1), 0) > 30 then
    raise exception 'A lista pode ter no máximo 30 opções.';
  end if;

  if (select count(distinct public.normalizar_nome(n)) from unnest(p_nomes) n)
     <> array_length(p_nomes, 1) then
    raise exception 'Tem uma opção repetida na lista.';
  end if;

  if exists (select 1 from unnest(p_nomes) n where length(trim(coalesce(n, ''))) = 0) then
    raise exception 'Tem uma opção sem nome na lista.';
  end if;

  delete from public.catalogo_opcoes where loja_id = p_loja_id and grupo = p_grupo;

  insert into public.catalogo_opcoes (loja_id, grupo, nome, ordem)
  select p_loja_id, p_grupo, regexp_replace(trim(n), '\s+', ' ', 'g'), ord::integer
  from unnest(p_nomes) with ordinality as t(n, ord);

  for v_troca in select * from jsonb_array_elements(coalesce(p_renomear, '[]'::jsonb)) loop
    if length(trim(coalesce(v_troca->>'para', ''))) > 0 then
      update public.products
      set variacao = regexp_replace(trim(v_troca->>'para'), '\s+', ' ', 'g')
      where loja_id = p_loja_id
        and type = v_tipo
        and public.normalizar_nome(variacao) = public.normalizar_nome(v_troca->>'de');
    end if;
  end loop;

  select count(*) into v_total from public.catalogo_opcoes where loja_id = p_loja_id and grupo = p_grupo;
  return v_total;
end;
$$;

grant execute on function public.salvar_lista_catalogo(uuid, text, text[], jsonb) to authenticated;

-- 4. CADASTRAR_LOTE --------------------------------------------------------------------
-- Cada item: { acao: 'criar' | 'somar', produto_id (só em somar), type, brand, model,
--   variacao, price, custo, quantity, estoque_minimo, notes }
-- · criar: recusa se já existir produto ativo igual (tipo + marca + modelo + variação).
-- · somar: soma a quantidade, aplica o preço novo e, se veio, o estoque mínimo e o custo.
--   Observações do produto existente não são tocadas.
-- Qualquer erro desfaz o lote inteiro: nunca fica um cadastro pela metade.
-- Roda como o próprio usuário: as policies de dono de products/produtos_custos valem.

create or replace function public.cadastrar_lote(p_loja_id uuid, p_itens jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_item jsonb;
  v_id bigint;
  v_nome text;
  v_qtd integer;
  v_min integer;
  v_preco numeric;
  v_custo numeric;
  v_criados bigint[] := '{}';
  v_somados bigint[] := '{}';
begin
  if not public.sou_dono_da_loja(p_loja_id) then
    raise exception 'Só o dono pode cadastrar produtos.';
  end if;

  if jsonb_typeof(p_itens) is distinct from 'array' or jsonb_array_length(p_itens) = 0 then
    raise exception 'Nenhum produto no lote.';
  end if;

  if jsonb_array_length(p_itens) > 300 then
    raise exception 'Cadastre no máximo 300 produtos por vez.';
  end if;

  -- Dois cadastros ao mesmo tempo na mesma loja esperam um pelo outro, então a
  -- checagem de duplicado abaixo não deixa passar o mesmo produto duas vezes.
  perform pg_advisory_xact_lock(hashtext('vault-cadastro:' || p_loja_id::text));

  for v_item in select * from jsonb_array_elements(p_itens) loop
    v_nome := trim(concat_ws(' ', nullif(trim(v_item->>'brand'), ''), nullif(trim(v_item->>'model'), '')));
    v_qtd := coalesce(nullif(v_item->>'quantity', '')::integer, 0);
    v_min := nullif(v_item->>'estoque_minimo', '')::integer;
    v_preco := nullif(v_item->>'price', '')::numeric;
    v_custo := nullif(v_item->>'custo', '')::numeric;

    if length(trim(coalesce(v_item->>'model', ''))) = 0 then
      raise exception 'Tem um produto sem modelo no lote.';
    end if;
    if coalesce(v_item->>'type', '') not in ('capinhas', 'peliculas', 'acessorios') then
      raise exception 'Categoria inválida em "%".', v_nome;
    end if;
    if v_qtd < 0 then
      raise exception 'Quantidade negativa em "%".', v_nome;
    end if;
    if v_preco is null or v_preco <= 0 then
      raise exception 'Preço de venda inválido em "%".', v_nome;
    end if;
    if v_custo is not null and v_custo < 0 then
      raise exception 'Preço de custo negativo em "%".', v_nome;
    end if;
    if v_min is not null and v_min < 0 then
      raise exception 'Estoque mínimo negativo em "%".', v_nome;
    end if;

    if v_item->>'acao' = 'somar' then
      update public.products
      set quantity = quantity + v_qtd,
          price = v_preco,
          estoque_minimo = coalesce(v_min, estoque_minimo)
      where id = nullif(v_item->>'produto_id', '')::bigint
        and loja_id = p_loja_id
        and arquivado_em is null
      returning id into v_id;

      if v_id is null then
        raise exception '"%" não está mais no estoque. Atualize a página e tente de novo.', v_nome;
      end if;
      v_somados := v_somados || v_id;
    else
      if exists (
        select 1 from public.products
        where loja_id = p_loja_id
          and arquivado_em is null
          and type = v_item->>'type'
          and public.normalizar_nome(brand) = public.normalizar_nome(v_item->>'brand')
          and public.normalizar_nome(model) = public.normalizar_nome(v_item->>'model')
          and public.normalizar_nome(variacao) = public.normalizar_nome(v_item->>'variacao')
      ) then
        raise exception 'Já existe "%" no estoque. Atualize a página e escolha somar ou ignorar.', v_nome;
      end if;

      insert into public.products (
        type, brand, model, variacao, color, manufacture, price, quantity, notes, estoque_minimo, loja_id
      )
      values (
        v_item->>'type',
        regexp_replace(trim(coalesce(v_item->>'brand', '')), '\s+', ' ', 'g'),
        regexp_replace(trim(v_item->>'model'), '\s+', ' ', 'g'),
        nullif(regexp_replace(trim(coalesce(v_item->>'variacao', '')), '\s+', ' ', 'g'), ''),
        '',
        '',
        v_preco,
        v_qtd,
        coalesce(v_item->>'notes', ''),
        v_min,
        p_loja_id
      )
      returning id into v_id;
      v_criados := v_criados || v_id;
    end if;

    if v_custo is not null then
      insert into public.produtos_custos (produto_id, loja_id, custo_unitario, updated_at, updated_by)
      values (v_id, p_loja_id, v_custo, now(), auth.uid())
      on conflict (produto_id) do update
        set custo_unitario = excluded.custo_unitario,
            updated_at = excluded.updated_at,
            updated_by = excluded.updated_by;
    end if;

    v_id := null;
  end loop;

  return jsonb_build_object('criados', to_jsonb(v_criados), 'somados', to_jsonb(v_somados));
end;
$$;

grant execute on function public.cadastrar_lote(uuid, jsonb) to authenticated;

-- 5. REGISTRAR_VENDA_CARRINHO ------------------------------------------------------------
-- Vários itens numa venda só. Todos os lançamentos no livro-caixa recebem o mesmo
-- venda_id, que vem da tela e serve de chave contra clique duplo: repetir a chamada com
-- o mesmo venda_id devolve a venda já gravada, sem vender de novo.
-- Trava os produtos em ordem de id (duas vendas simultâneas não se bloqueiam em cruz).
-- Mesmas regras do registrar_venda_v2: loja do usuário, produto ativo, estoque suficiente,
-- preço de cadastro e custo do momento gravado. Qualquer erro desfaz a venda inteira.
-- p_itens: [{ "produto_id": 12, "quantidade": 2 }, ...]

create or replace function public.registrar_venda_carrinho(p_itens jsonb, p_venda_id uuid)
returns setof public.movimentacoes_estoque
language plpgsql
security definer
set search_path = public
as $$
declare
  v_linha record;
  v_produto public.products;
  v_loja uuid := null;
  v_email text := null;
  v_custo numeric;
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

  perform pg_advisory_xact_lock(hashtext('vault-venda:' || p_venda_id::text));

  if exists (select 1 from public.movimentacoes_estoque where venda_id = p_venda_id) then
    return query
      select * from public.movimentacoes_estoque
      where venda_id = p_venda_id and loja_id in (select public.minhas_lojas())
      order by created_at, id;
    return;
  end if;

  if exists (
    select 1 from jsonb_array_elements(p_itens) e
    where coalesce(nullif(e->>'quantidade', '')::integer, 0) <= 0
       or nullif(e->>'produto_id', '') is null
  ) then
    raise exception 'Quantidade inválida no carrinho.';
  end if;

  for v_linha in
    select (e->>'produto_id')::bigint as produto_id, sum((e->>'quantidade')::integer)::integer as quantidade
    from jsonb_array_elements(p_itens) e
    group by 1
    order by 1
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
      select email into v_email
      from public.membros_loja
      where usuario_id = auth.uid() and loja_id = v_loja
      limit 1;
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

    select custo_unitario into v_custo from public.produtos_custos where produto_id = v_produto.id;

    update public.products set quantity = quantity - v_linha.quantidade where id = v_produto.id;

    insert into public.movimentacoes_estoque (
      loja_id, produto_id, tipo, produto_snapshot, quantidade,
      preco_unitario, total, custo_unitario, venda_id, responsavel_id, responsavel_email
    )
    values (
      v_produto.loja_id,
      v_produto.id,
      'venda',
      jsonb_strip_nulls(jsonb_build_object(
        'type', v_produto.type,
        'brand', v_produto.brand,
        'model', v_produto.model,
        'variacao', v_produto.variacao,
        'color', nullif(v_produto.color, '')
      )),
      -v_linha.quantidade,
      v_produto.price,
      v_produto.price * v_linha.quantidade,
      v_custo,
      p_venda_id,
      auth.uid(),
      v_email
    )
    returning * into v_mov;

    v_custo := null;
    return next v_mov;
  end loop;
end;
$$;

grant execute on function public.registrar_venda_carrinho(jsonb, uuid) to authenticated;

-- 6. META MENSAL -------------------------------------------------------------------------
-- Meta de faturamento do mês. Nulo = sem meta. O dono grava pela policy
-- "dono atualiza a propria loja" (sql/003).

alter table public.lojas add column if not exists meta_mensal numeric(12, 2);
alter table public.lojas drop constraint if exists lojas_meta_mensal_check;
alter table public.lojas add constraint lojas_meta_mensal_check check (meta_mensal is null or meta_mensal > 0);

-- ROLLBACK (só se precisar desfazer; não apaga produtos nem vendas) ----------------------
-- alter table public.lojas drop constraint if exists lojas_meta_mensal_check;
-- alter table public.lojas drop column if exists meta_mensal;
-- drop function if exists public.registrar_venda_carrinho(jsonb, uuid);
-- drop function if exists public.cadastrar_lote(uuid, jsonb);
-- drop function if exists public.salvar_lista_catalogo(uuid, text, text[], jsonb);
-- drop table if exists public.catalogo_opcoes;
-- alter table public.products drop column if exists variacao;   -- apaga as linhas/tipos salvos
-- drop function if exists public.normalizar_nome(text);
