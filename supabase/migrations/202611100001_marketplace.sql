-- TAF Market initial marketplace schema
-- Apply this file in Supabase SQL Editor after checking existing tables.
-- Profiles may already exist from the earlier setup; this migration extends it safely.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade
);
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists role text not null default 'buyer'
  check (role in ('buyer','seller','affiliate','admin'));
alter table public.profiles add column if not exists created_at timestamptz not null default now();

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 100),
  description text not null default '',
  price numeric(12,2) not null check (price > 0),
  currency text not null default 'XOF' check (currency in ('XOF','EUR','USD')),
  category text not null default 'Autre',
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_active_created_idx on public.products (is_active, created_at desc);
create index if not exists products_owner_idx on public.products (owner_id);

alter table public.profiles enable row level security;
alter table public.products enable row level security;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);

-- Clients may edit a display name, but cannot assign themselves seller/admin roles.
revoke insert, update on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;

drop policy if exists "Active products are public" on public.products;
create policy "Active products are public" on public.products
  for select using (is_active = true or auth.uid() = owner_id);
drop policy if exists "Authenticated users can create products" on public.products;
create policy "Authenticated users can create products" on public.products
  for insert to authenticated with check (auth.uid() = owner_id);
drop policy if exists "Owners can update products" on public.products;
create policy "Owners can update products" on public.products
  for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists "Owners can delete products" on public.products;
create policy "Owners can delete products" on public.products
  for delete to authenticated using (auth.uid() = owner_id);

-- Create a profile automatically when a new account is registered.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), 'buyer')
  on conflict (id) do update
    set full_name = excluded.full_name;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
