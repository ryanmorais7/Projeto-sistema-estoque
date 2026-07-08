-- Bloco 2 - Estrutura de dados para IMEI e grade de conservação
-- Rodar este script no SQL Editor do Supabase (projeto vkoqsjfykybrtwhhrpiz).
-- Pré-requisito: tabela public.products já existe (id bigint/int, gerado pelo banco).

create table if not exists public.unidades_produto (
  id uuid primary key default gen_random_uuid(),
  produto_id bigint not null references public.products(id) on delete cascade,
  imei text unique,
  imei2 text,
  grade text check (grade in ('novo', 'seminovo_a', 'seminovo_b', 'seminovo_c', 'usado')),
  saude_bateria integer check (saude_bateria between 0 and 100),
  status_anatel text not null default 'nao_consultado' check (status_anatel in ('nao_consultado', 'regular', 'impedido')),
  data_consulta_anatel timestamptz,
  origem text check (origem in ('compra_fornecedor', 'troca_cliente', 'conserto_terceiro')),
  nota_fiscal_fornecedor text,
  garantia_fornecedor_ate date,
  status_venda text not null default 'disponivel' check (status_venda in ('disponivel', 'vendido', 'em_reparo', 'reservado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_unidades_produto_produto_id on public.unidades_produto (produto_id);

-- RLS: ajuste as políticas abaixo para espelhar o que já está configurado
-- na tabela public.products neste projeto (o app acessa o banco com a anon key
-- direto do navegador, então a segurança real vem destas políticas).
alter table public.unidades_produto enable row level security;

create policy "Permitir leitura pública de unidades_produto"
  on public.unidades_produto for select
  using (true);

create policy "Permitir escrita pública de unidades_produto"
  on public.unidades_produto for all
  using (true)
  with check (true);
