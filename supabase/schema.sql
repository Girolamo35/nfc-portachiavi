create extension if not exists pgcrypto;

create table if not exists clienti (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text,
  telefono text,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists portachiavi (
  id uuid primary key default gen_random_uuid(),
  codice text not null unique,
  cliente_id uuid references clienti(id) on delete set null,
  nome text,
  link_attuale text not null default 'https://example.com',
  attivo boolean not null default true,
  scansioni integer not null default 0,
  ultima_scansione timestamptz,
  created_at timestamptz not null default now()
);

alter table clienti enable row level security;
alter table portachiavi enable row level security;

create or replace function incrementa_scansioni(portachiave_id uuid)
returns void as $$
begin
  update portachiavi
  set scansioni = scansioni + 1
  where id = portachiave_id;
end;
$$ language plpgsql security definer;
