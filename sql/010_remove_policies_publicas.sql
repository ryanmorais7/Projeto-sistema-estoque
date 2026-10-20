-- Remove policies de acesso público que sobraram de antes do multi-tenant.
-- Rodar no SQL Editor do Supabase (projeto vkoqsjfykybrtwhhrpiz).
--
-- O 002_unidades_produto.sql criou "Permitir leitura/escrita pública de unidades_produto"
-- (using true, sem "to authenticated"). Os scripts seguintes criaram as policies por loja,
-- mas nunca apagaram essas. Como policies permissivas são somadas (OR), qualquer pessoa só
-- com a anon key conseguia ler, alterar e apagar unidades de qualquer loja.
--
-- Todas as policies legítimas do sistema são "to authenticated", então aqui apagamos
-- qualquer policy dessas tabelas que valha para os papéis public ou anon.

do $$
declare
  p record;
begin
  for p in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('products', 'unidades_produto', 'movimentacoes_estoque',
                        'lojas', 'membros_loja', 'convites_pendentes')
      and (roles && array['public', 'anon']::name[])
  loop
    execute format('drop policy %I on %I.%I', p.policyname, p.schemaname, p.tablename);
    raise notice 'Removida: %.%', p.tablename, p.policyname;
  end loop;
end $$;

-- Lojas: todo usuário logado via o nome de TODAS as lojas. -----------------------
-- A policy do 006 libera "loja sem membros" com um "not exists" em membros_loja, mas essa
-- subconsulta passa pela RLS de membros_loja, que só mostra a loja do próprio usuário.
-- Resultado: toda loja alheia parecia vazia e ficava visível. Essa exceção existia só pro
-- INSERT direto do onboarding, que o 007 trocou pela função criar_loja (SECURITY DEFINER),
-- então ela pode sair.

drop policy if exists "membros veem a propria loja" on public.lojas;

create policy "membros veem a propria loja"
  on public.lojas for select
  to authenticated
  using (id in (select public.minhas_lojas()));

-- Zera a loja "Rudson Capas" (apaga os dados de teste: 1 produto e 1 venda) ---------
-- Mantém a loja e o vínculo de dono; só limpa o estoque e o histórico.

delete from public.movimentacoes_estoque where loja_id = '8300787c-1ab3-494e-a6fd-efdda6163e9e';
delete from public.unidades_produto      where loja_id = '8300787c-1ab3-494e-a6fd-efdda6163e9e';
delete from public.products              where loja_id = '8300787c-1ab3-494e-a6fd-efdda6163e9e';

-- Conferência: deve listar só policies com roles = {authenticated}
select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
