-- Fase A - Fundação multi-tenant
-- Rodar este script no SQL Editor do Supabase ANTES do 004_retrofit_loja_id.sql.
--
-- Cria as tabelas lojas e membros_loja, e a policy de RLS que resolve o problema de
-- "bootstrap": como permitir que o primeiro usuário vire dono de uma loja recém-criada,
-- sem abrir brecha para qualquer usuário se auto-inserir como membro de uma loja alheia.
--
-- Estratégia de convite (Fase A6): não existe tabela de convites separada. O convite é
-- feito via Supabase Auth admin.inviteUserByEmail (chamado pela Edge Function
-- supabase/functions/invite-member), passando { loja_id, papel } como metadata do usuário
-- convidado. Quando essa pessoa loga pela primeira vez, o app lê esses metadados do JWT
-- (auth.jwt() -> 'user_metadata') e insere a linha em membros_loja — a policy de INSERT
-- abaixo permite exatamente esse caso (loja_id/papel batendo com o metadata do convite).

create table if not exists public.lojas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo_negocio text not null default 'revenda' check (tipo_negocio in ('revenda', 'assistencia_tecnica', 'ambos')),
  plano text not null default 'trial' check (plano in ('trial', 'basico', 'pro')),
  trial_expira_em timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.membros_loja (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  loja_id uuid not null references public.lojas(id) on delete cascade,
  papel text not null check (papel in ('dono', 'vendedor', 'tecnico', 'financeiro')),
  -- Denormalizado de propósito: auth.users não é consultável via PostgREST pelo client,
  -- então guardamos o e-mail aqui só para exibir a lista "Minha equipe" sem RPC extra.
  email text not null,
  created_at timestamptz not null default now(),
  unique (usuario_id, loja_id)
);

create index if not exists idx_membros_loja_usuario on public.membros_loja (usuario_id);
create index if not exists idx_membros_loja_loja on public.membros_loja (loja_id);

alter table public.lojas enable row level security;
alter table public.membros_loja enable row level security;

-- LOJAS -----------------------------------------------------------------

create policy "membros veem a propria loja"
  on public.lojas for select
  to authenticated
  using (
    id in (select loja_id from public.membros_loja where usuario_id = auth.uid())
  );

create policy "qualquer usuario autenticado pode criar uma loja (onboarding)"
  on public.lojas for insert
  to authenticated
  with check (true);

create policy "dono atualiza a propria loja"
  on public.lojas for update
  to authenticated
  using (
    id in (select loja_id from public.membros_loja where usuario_id = auth.uid() and papel = 'dono')
  );

-- MEMBROS_LOJA ------------------------------------------------------------

create policy "membros veem colegas da propria loja"
  on public.membros_loja for select
  to authenticated
  using (
    loja_id in (select loja_id from public.membros_loja where usuario_id = auth.uid())
  );

create policy "bootstrap de dono ou aceite de convite"
  on public.membros_loja for insert
  to authenticated
  with check (
    usuario_id = auth.uid()
    and (
      -- Caso 1: primeiro membro de uma loja recém-criada vira dono automaticamente.
      (
        papel = 'dono'
        and not exists (select 1 from public.membros_loja m2 where m2.loja_id = membros_loja.loja_id)
      )
      or
      -- Caso 2: aceitando um convite — loja_id e papel batem com o metadata gravado
      -- pela Edge Function no momento do convite (admin.inviteUserByEmail).
      (
        loja_id = nullif(auth.jwt() -> 'user_metadata' ->> 'loja_id', '')::uuid
        and papel = (auth.jwt() -> 'user_metadata' ->> 'papel')
      )
    )
  );

create policy "dono remove membros da propria loja"
  on public.membros_loja for delete
  to authenticated
  using (
    loja_id in (select loja_id from public.membros_loja where usuario_id = auth.uid() and papel = 'dono')
  );
