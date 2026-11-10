-- TAF Market order foundation.
-- Orders are created as pending_payment. This migration does NOT process or confirm payments.
-- Apply after 202611100001_marketplace.sql and 202611100002_affiliate_codes.sql.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'pending_payment'
    check (status in ('pending_payment','paid','processing','shipped','completed','cancelled','refunded')),
  currency text not null check (currency in ('XOF','EUR','USD')),
  total numeric(14,2) not null check (total > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  seller_id uuid not null references public.profiles(id) on delete restrict,
  product_name text not null,
  unit_price numeric(12,2) not null check (unit_price > 0),
  currency text not null check (currency in ('XOF','EUR','USD')),
  quantity integer not null check (quantity between 1 and 20),
  created_at timestamptz not null default now()
);

create index if not exists orders_buyer_created_idx
  on public.orders (buyer_id, created_at desc);
create index if not exists order_items_order_idx
  on public.order_items (order_id);
create index if not exists order_items_seller_created_idx
  on public.order_items (seller_id, created_at desc);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Buyers can read their own orders" on public.orders;
create policy "Buyers can read their own orders"
  on public.orders for select to authenticated
  using (buyer_id = auth.uid());

drop policy if exists "Buyers and sellers can read relevant order items" on public.order_items;
create policy "Buyers and sellers can read relevant order items"
  on public.order_items for select to authenticated
  using (
    seller_id = auth.uid()
    or exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.buyer_id = auth.uid()
    )
  );

-- All order writes happen through the trusted function below, never direct table writes.
revoke all on public.orders from anon, authenticated;
revoke all on public.order_items from anon, authenticated;
grant select on public.orders, public.order_items to authenticated;

create or replace function public.create_order_from_cart(p_items jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_buyer uuid := auth.uid();
  item jsonb;
  product_row record;
  new_order_id uuid;
  selected_currency text;
  order_total numeric(14,2) := 0;
  item_count integer := 0;
  requested_product_id uuid;
  requested_quantity integer;
begin
  if current_buyer is null then
    raise exception 'Authentication required';
  end if;

  if jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) < 1
     or jsonb_array_length(p_items) > 30 then
    raise exception 'Cart must contain between 1 and 30 items';
  end if;

  -- Validate every requested line against the live product record.
  for item in select value from jsonb_array_elements(p_items)
  loop
    if not (item ? 'product_id') or not (item ? 'quantity') then
      raise exception 'Each item needs product_id and quantity';
    end if;

    requested_product_id := (item ->> 'product_id')::uuid;
    requested_quantity := (item ->> 'quantity')::integer;

    if requested_quantity < 1 or requested_quantity > 20 then
      raise exception 'Quantity must be between 1 and 20';
    end if;

    select p.id, p.owner_id, p.name, p.price, p.currency, p.is_active
      into product_row
      from public.products p
      where p.id = requested_product_id
      for share;

    if not found or product_row.is_active is not true then
      raise exception 'A product is unavailable';
    end if;
    if product_row.owner_id = current_buyer then
      raise exception 'You cannot order your own product';
    end if;

    if selected_currency is null then
      selected_currency := product_row.currency;
    elsif selected_currency <> product_row.currency then
      raise exception 'Create separate orders for each currency';
    end if;

    order_total := order_total + (product_row.price * requested_quantity);
    item_count := item_count + 1;
  end loop;

  if item_count = 0 or order_total <= 0 then
    raise exception 'Cart is empty';
  end if;

  insert into public.orders (buyer_id, status, currency, total)
  values (current_buyer, 'pending_payment', selected_currency, order_total)
  returning id into new_order_id;

  for item in select value from jsonb_array_elements(p_items)
  loop
    requested_product_id := (item ->> 'product_id')::uuid;
    requested_quantity := (item ->> 'quantity')::integer;

    select p.id, p.owner_id, p.name, p.price, p.currency, p.is_active
      into product_row
      from public.products p
      where p.id = requested_product_id
      for share;

    if not found or product_row.is_active is not true
       or product_row.currency <> selected_currency
       or product_row.owner_id = current_buyer then
      raise exception 'Cart changed; please review it and try again';
    end if;

    insert into public.order_items
      (order_id, product_id, seller_id, product_name, unit_price, currency, quantity)
    values
      (new_order_id, product_row.id, product_row.owner_id, product_row.name,
       product_row.price, product_row.currency, requested_quantity);
  end loop;

  return new_order_id;
end;
$$;

revoke all on function public.create_order_from_cart(jsonb) from public;
grant execute on function public.create_order_from_cart(jsonb) to authenticated;
