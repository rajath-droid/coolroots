-- Run this SQL in your Supabase Dashboard -> SQL Editor
-- Project ID: yktzorxnislqvpeqpmer

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_id text unique not null,
  user_id text,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  delivery_address text not null,
  city text not null,
  state text not null,
  pin_code text not null,
  notes text,
  items jsonb not null,
  subtotal numeric not null,
  shipping numeric not null default 0,
  discount numeric not null default 0,
  promo_code text,
  total numeric not null,
  payment_method text not null,
  payment_note text,
  shipping_details jsonb,
  status text not null default 'Order Placed',
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_created_at on public.orders (created_at desc);
create index if not exists idx_orders_customer_email on public.orders (customer_email);

alter table public.orders enable row level security;

-- Allow storefront checkout submissions (view all orders safely in Supabase Table Editor)
drop policy if exists "Allow storefront order reads" on public.orders;
drop policy if exists "Allow storefront order inserts" on public.orders;
create policy "Allow storefront order inserts"
  on public.orders
  for insert
  to anon, authenticated
  with check (
    char_length(trim(customer_name)) > 0
    and char_length(trim(customer_email)) > 0
    and char_length(trim(order_id)) > 0
    and total >= 0
  );

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  inquiry_id text unique not null,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  submitted_at timestamptz not null default now()
);

alter table public.contact_inquiries enable row level security;

drop policy if exists "Allow storefront inquiry inserts" on public.contact_inquiries;
create policy "Allow storefront inquiry inserts"
  on public.contact_inquiries
  for insert
  to anon, authenticated
  with check (
    char_length(trim(name)) > 0
    and char_length(trim(email)) > 0
    and char_length(trim(message)) > 0
  );
