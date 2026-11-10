-- TAF Market affiliate code foundation.
-- This creates personal codes only; order attribution and commissions require trusted server-side payment webhooks.

create table if not exists public.affiliate_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  code text not null unique,
  created_at timestamptz not null default now()
);

alter table public.affiliate_codes enable row level security;
drop policy if exists "Users can read their own affiliate code" on public.affiliate_codes;
create policy "Users can read their own affiliate code"
  on public.affiliate_codes for select to authenticated
  using (auth.uid() = user_id);

revoke all on public.affiliate_codes from anon, authenticated;
grant select on public.affiliate_codes to authenticated;

create or replace function public.get_or_create_my_affiliate_code()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  generated_code text;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  generated_code := 'TAF' || upper(substr(replace(current_user_id::text, '-', ''), 1, 10));

  insert into public.affiliate_codes (user_id, code)
  values (current_user_id, generated_code)
  on conflict (user_id) do nothing;

  select code into generated_code
  from public.affiliate_codes
  where user_id = current_user_id;

  return generated_code;
end;
$$;

revoke all on function public.get_or_create_my_affiliate_code() from public;
grant execute on function public.get_or_create_my_affiliate_code() to authenticated;
