-- Gestão 3.0 — custo das vendas só para o dono
-- ⚠ Rodar SÓ DEPOIS que o site novo (Gestão 3.0 / CASEON) estiver publicado.
--   O site antigo lê o histórico com "select *" e quebraria com este script.
--
-- Hoje a policy de movimentacoes_estoque deixa qualquer membro da loja ler as linhas,
-- inclusive a coluna custo_unitario (custo histórico de cada venda). Esconder na tela
-- não basta: dava para ler pela API. Este script tira do papel "authenticated" o direito
-- de ler essa coluna. O dono continua vendo custo e lucro pela função vendas_periodo
-- (sql/014), que só entrega o custo para quem é dono da loja.
-- Não apaga nem altera nenhum dado.

do $$
declare
  v_colunas text;
begin
  select string_agg(quote_ident(column_name), ', ' order by ordinal_position)
  into v_colunas
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'movimentacoes_estoque'
    and column_name <> 'custo_unitario';

  execute 'revoke select on public.movimentacoes_estoque from anon, authenticated';
  execute format('grant select (%s) on public.movimentacoes_estoque to authenticated', v_colunas);
end;
$$;

-- Se no futuro entrar uma coluna nova em movimentacoes_estoque, rode este script de
-- novo para liberá-la (custo_unitario continua de fora).

-- ROLLBACK: grant select on public.movimentacoes_estoque to authenticated;
