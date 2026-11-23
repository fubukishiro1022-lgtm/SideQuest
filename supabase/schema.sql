-- SideQuest cloud storage. Run this once in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.club_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,60}$'),
  name text not null,
  public_enabled boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.club_data (
  club_id uuid primary key references public.club_accounts(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.public_queues (
  club_id uuid primary key references public.club_accounts(id) on delete cascade,
  slug text not null unique,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.club_accounts enable row level security;
alter table public.club_data enable row level security;
alter table public.public_queues enable row level security;

drop policy if exists "owners read own club" on public.club_accounts;
create policy "owners read own club" on public.club_accounts for select to authenticated using (owner_id = auth.uid());
drop policy if exists "owners create own club" on public.club_accounts;
create policy "owners create own club" on public.club_accounts for insert to authenticated with check (owner_id = auth.uid());
drop policy if exists "owners update own club" on public.club_accounts;
create policy "owners update own club" on public.club_accounts for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists "owners delete own club" on public.club_accounts;
create policy "owners delete own club" on public.club_accounts for delete to authenticated using (owner_id = auth.uid());

drop policy if exists "owners read club data" on public.club_data;
create policy "owners read club data" on public.club_data for select to authenticated using (exists (select 1 from public.club_accounts c where c.id = club_id and c.owner_id = auth.uid()));
drop policy if exists "owners insert club data" on public.club_data;
create policy "owners insert club data" on public.club_data for insert to authenticated with check (exists (select 1 from public.club_accounts c where c.id = club_id and c.owner_id = auth.uid()));
drop policy if exists "owners update club data" on public.club_data;
create policy "owners update club data" on public.club_data for update to authenticated using (exists (select 1 from public.club_accounts c where c.id = club_id and c.owner_id = auth.uid())) with check (exists (select 1 from public.club_accounts c where c.id = club_id and c.owner_id = auth.uid()));

drop policy if exists "public can read shared queue" on public.public_queues;
-- Rows in public_queues exist only after the organizer shares the player link.
-- Do not query club_accounts here: its RLS intentionally hides that table from anon.
create policy "public can read shared queue" on public.public_queues for select to anon, authenticated using (true);
drop policy if exists "owners publish queue" on public.public_queues;
create policy "owners publish queue" on public.public_queues for insert to authenticated with check (exists (select 1 from public.club_accounts c where c.id = club_id and c.owner_id = auth.uid() and c.public_enabled and c.slug = public_queues.slug));
drop policy if exists "owners update queue" on public.public_queues;
create policy "owners update queue" on public.public_queues for update to authenticated using (exists (select 1 from public.club_accounts c where c.id = club_id and c.owner_id = auth.uid())) with check (exists (select 1 from public.club_accounts c where c.id = club_id and c.owner_id = auth.uid() and c.slug = public_queues.slug));

grant select, insert, update, delete on public.club_accounts to authenticated;
grant select, insert, update on public.club_data to authenticated;
grant select on public.public_queues to anon, authenticated;
grant insert, update on public.public_queues to authenticated;

-- API roles need only the CRUD rights above; they do not need table-level maintenance privileges.
revoke truncate, references, trigger, maintain on table public.club_accounts, public.club_data, public.public_queues from anon, authenticated;

do $$ begin
  alter publication supabase_realtime add table public.public_queues;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table public.club_data;
exception when duplicate_object then null;
end $$;
