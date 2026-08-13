-- ============================================================
-- SmartCRM — Supabase initial migration
-- Run this once in: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- User data table (leads, invoices, services stored as JSONB)
create table if not exists public.user_data (
  user_id  uuid primary key references auth.users on delete cascade,
  leads    jsonb not null default '[]',
  invoices jsonb not null default '[]',
  services jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

-- Row-Level Security: every user sees only their own row
alter table public.user_data enable row level security;

create policy "owner_all" on public.user_data
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-bump updated_at on every update
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger trg_user_data_updated
  before update on public.user_data
  for each row execute procedure public.touch_updated_at();

-- Profiles table (display name + role)
create table if not exists public.profiles (
  user_id  uuid primary key references auth.users on delete cascade,
  name     text,
  role     text not null default 'agent' check (role in ('admin','agent','viewer')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "owner_read_write" on public.profiles
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-create profile + empty user_data row on every new signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (user_id, name)
    values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email));
  insert into public.user_data (user_id)
    values (new.id)
    on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
