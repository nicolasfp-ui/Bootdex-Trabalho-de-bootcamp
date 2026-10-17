-- Executar uma vez no SQL Editor de um projeto Supabase dedicado ao trabalho.
create table if not exists public.favoritos (
    id uuid primary key default gen_random_uuid(),
    pokemon_id integer not null unique check (pokemon_id > 0),
    nome text not null check (char_length(nome) between 1 and 100),
    criado_em timestamptz not null default now()
);

alter table public.favoritos enable row level security;
grant usage on schema public to anon;
revoke all on public.favoritos from anon;
grant select, insert, delete on public.favoritos to anon;

drop policy if exists favoritos_leitura on public.favoritos;
create policy favoritos_leitura on public.favoritos for select to anon using (true);
drop policy if exists favoritos_criacao on public.favoritos;
create policy favoritos_criacao on public.favoritos for insert to anon with check (true);
drop policy if exists favoritos_exclusao on public.favoritos;
create policy favoritos_exclusao on public.favoritos for delete to anon using (true);

-- Demonstração acadêmica: lista pública compartilhada, inclusive exclusão por visitantes.
-- Não armazenar dados pessoais. Uso privado exige Auth + user_id + RLS por usuário.
