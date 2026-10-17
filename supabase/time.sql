-- BootDex: execute no SQL Editor do mesmo projeto dos favoritos.
-- Não altera nem apaga a tabela favoritos.
create table if not exists public.time_pokemon (
    id uuid primary key default gen_random_uuid(),
    posicao integer not null unique check (posicao between 1 and 6),
    pokemon_id integer not null check (pokemon_id > 0),
    nome text not null check (char_length(nome) between 1 and 100),
    criado_em timestamptz not null default now()
);

-- Remove a restrição da primeira versão, permitindo Pokémon repetidos.
alter table public.time_pokemon drop constraint if exists time_pokemon_pokemon_id_key;

alter table public.time_pokemon enable row level security;
grant usage on schema public to anon;
revoke all on public.time_pokemon from anon;
grant select, insert, delete on public.time_pokemon to anon;

drop policy if exists time_leitura on public.time_pokemon;
create policy time_leitura on public.time_pokemon for select to anon using (true);
drop policy if exists time_criacao on public.time_pokemon;
create policy time_criacao on public.time_pokemon for insert to anon with check (true);
drop policy if exists time_exclusao on public.time_pokemon;
create policy time_exclusao on public.time_pokemon for delete to anon using (true);

-- Seis posições únicas, entre 1 e 6, limitam o time no próprio banco.
-- Demonstração acadêmica: time público compartilhado, sem login.
