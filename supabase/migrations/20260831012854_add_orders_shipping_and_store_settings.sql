create table public.store_settings (
  id boolean primary key default true check (id),
  contact_email text not null default '',
  whatsapp text not null default '',
  instagram text not null default '',
  facebook text not null default '',
  tiktok text not null default '',
  shipping_mode text not null default 'coordinate' check (shipping_mode in ('coordinate', 'flat_rate', 'shipit')),
  flat_shipping_rate integer not null default 0 check (flat_shipping_rate >= 0),
  free_shipping_threshold integer check (free_shipping_threshold is null or free_shipping_threshold >= 0),
  pickup_enabled boolean not null default false,
  pickup_instructions text not null default '',
  shipping_notice text not null default 'Despachos a todo Chile',
  updated_at timestamptz not null default now()
);

insert into public.store_settings (id) values (true);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity unique,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address text not null,
  shipping_commune text not null,
  shipping_region text not null,
  customer_notes text not null default '',
  shipping_method text not null,
  shipping_cost integer not null default 0 check (shipping_cost >= 0),
  subtotal integer not null check (subtotal > 0),
  total integer not null check (total >= subtotal),
  status text not null default 'pending_payment' check (status in ('pending_payment','paid','payment_failed','cancelled','preparing','shipped','delivered')),
  payment_status text not null default 'pending' check (payment_status in ('pending','approved','rejected','cancelled','refunded')),
  fulfillment_status text not null default 'unfulfilled' check (fulfillment_status in ('unfulfilled','preparing','shipped','delivered','cancelled')),
  mp_preference_id text,
  mp_payment_id text unique,
  tracking_code text,
  tracking_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_slug text not null,
  product_name text not null,
  unit_price integer not null check (unit_price > 0),
  quantity integer not null check (quantity > 0)
);

create index orders_created_at_idx on public.orders(created_at desc);
create index orders_status_idx on public.orders(status, created_at desc);
create index order_items_order_id_idx on public.order_items(order_id);

create trigger store_settings_set_updated_at before update on public.store_settings
for each row execute function public.set_updated_at();
create trigger orders_set_updated_at before update on public.orders
for each row execute function public.set_updated_at();

alter table public.store_settings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Public can read store settings" on public.store_settings for select to anon, authenticated using (true);
create policy "Admins can update store settings" on public.store_settings for update to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
create policy "Admins can read orders" on public.orders for select to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
create policy "Admins can update orders" on public.orders for update to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
create policy "Admins can read order items" on public.order_items for select to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

create or replace function public.confirm_order_payment(p_order_id uuid, p_payment_id text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare current_status text;
begin
  select payment_status into current_status from public.orders where id = p_order_id for update;
  if current_status is null then raise exception 'Order not found'; end if;
  if current_status = 'approved' then return false; end if;
  if exists (
    select 1 from public.order_items oi join public.products p on p.id = oi.product_id
    where oi.order_id = p_order_id and p.stock < oi.quantity
  ) then raise exception 'Insufficient stock'; end if;
  update public.products p set stock = p.stock - oi.quantity
  from public.order_items oi where oi.order_id = p_order_id and oi.product_id = p.id;
  update public.orders set payment_status = 'approved', status = 'paid', mp_payment_id = p_payment_id
  where id = p_order_id;
  return true;
end;
$$;
revoke all on function public.confirm_order_payment(uuid, text) from public, anon, authenticated;
grant execute on function public.confirm_order_payment(uuid, text) to service_role;
