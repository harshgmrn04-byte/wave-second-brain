-- Apply once to the Supabase development project as postgres, using
-- scripts/setup_dev_db.py. The role password is generated outside this file.
create role wave_api login noinherit;

create schema wave;
revoke all on schema wave from public;
grant usage on schema wave to wave_api;

create table wave.resources (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid not null,
    kind text not null default 'note' check (kind = 'note'),
    body text not null check (char_length(body) <= 10000 and char_length(btrim(body)) > 0),
    created_at timestamptz not null default now()
);

create index resources_owner_created_idx on wave.resources (owner_id, created_at desc, id);

revoke all on wave.resources from public;
grant select on wave.resources to wave_api;
grant insert (owner_id, body) on wave.resources to wave_api;
grant delete on wave.resources to wave_api;

alter table wave.resources enable row level security;
alter table wave.resources force row level security;

-- FastAPI sets this value only after the Auth server verifies the bearer token.
-- SET LOCAL confines it to the current transaction, including pooled connections.
create policy resources_owner_select on wave.resources
    for select to wave_api
    using (owner_id = nullif(current_setting('wave.user_id', true), '')::uuid);

create policy resources_owner_insert on wave.resources
    for insert to wave_api
    with check (owner_id = nullif(current_setting('wave.user_id', true), '')::uuid);

create policy resources_owner_delete on wave.resources
    for delete to wave_api
    using (owner_id = nullif(current_setting('wave.user_id', true), '')::uuid);
