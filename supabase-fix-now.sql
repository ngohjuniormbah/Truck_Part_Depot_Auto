-- Truck Parts Depot Auto: production database repair
-- Run this ONCE in Supabase Dashboard -> SQL Editor.
-- It is safe to re-run.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key,
  name text not null,
  brand text not null default 'Ford',
  model text,
  year_range text,
  engine text,
  category text not null default 'Other',
  oem_number text,
  sku text,
  price numeric(10,2) not null default 0,
  core_deposit numeric(10,2) default 0,
  in_stock boolean default true,
  stock_count integer default 1,
  description text,
  specs jsonb default '{}'::jsonb,
  image text,
  images jsonb default '[]'::jsonb,
  featured boolean default false,
  warranty text default '12-Month / Unlimited-Mile Commercial',
  created_at timestamptz default now()
);

alter table public.products add column if not exists model text;
alter table public.products add column if not exists year_range text;
alter table public.products add column if not exists engine text;
alter table public.products add column if not exists category text;
alter table public.products add column if not exists oem_number text;
alter table public.products add column if not exists sku text;
alter table public.products add column if not exists price numeric(10,2) default 0;
alter table public.products add column if not exists core_deposit numeric(10,2) default 0;
alter table public.products add column if not exists in_stock boolean default true;
alter table public.products add column if not exists stock_count integer default 1;
alter table public.products add column if not exists description text;
alter table public.products add column if not exists specs jsonb default '{}'::jsonb;
alter table public.products add column if not exists image text;
alter table public.products add column if not exists images jsonb default '[]'::jsonb;
alter table public.products add column if not exists featured boolean default false;
alter table public.products add column if not exists warranty text default '12-Month / Unlimited-Mile Commercial';
alter table public.products add column if not exists created_at timestamptz default now();

create table if not exists public.gallery (
  id text primary key,
  created_at timestamptz default now(),
  title text not null,
  truck_brand text,
  truck_model text,
  year text,
  image_url text not null,
  images jsonb default '[]'::jsonb,
  caption text,
  installed_parts jsonb default '[]'::jsonb
);

alter table public.gallery add column if not exists created_at timestamptz default now();
alter table public.gallery add column if not exists truck_brand text;
alter table public.gallery add column if not exists truck_model text;
alter table public.gallery add column if not exists year text;
alter table public.gallery add column if not exists image_url text;
alter table public.gallery add column if not exists images jsonb default '[]'::jsonb;
alter table public.gallery add column if not exists caption text;
alter table public.gallery add column if not exists installed_parts jsonb default '[]'::jsonb;

create table if not exists public.reviews (
  id text primary key,
  created_at timestamptz default now(),
  author text not null,
  avatar text,
  company text,
  truck_model text,
  rating integer default 5,
  date text,
  comment text,
  part_purchased text,
  verified_purchase boolean default true,
  review_image text,
  link text,
  link_text text
);

create table if not exists public.orders (
  id text primary key,
  created_at timestamptz default now(),
  customer_name text not null,
  customer_email text,
  customer_phone text,
  company_name text,
  shipping_address jsonb default '{}'::jsonb,
  shipping_method text default 'standard',
  items jsonb default '[]'::jsonb,
  subtotal numeric(10,2) default 0,
  core_deposit_total numeric(10,2) default 0,
  shipping_fee numeric(10,2) default 0,
  tax numeric(10,2) default 0,
  total numeric(10,2) not null default 0,
  payment_method text,
  payment_account_info text,
  payment_status text default 'Pending Verification',
  order_status text default 'Pending',
  tracking_number text,
  notes text
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  subscription jsonb not null,
  created_at timestamptz default now()
);

-- Ensure the browser client can perform the CRUD operations used by the admin UI.
alter table public.products enable row level security;
alter table public.gallery enable row level security;
alter table public.reviews enable row level security;
alter table public.orders enable row level security;

-- Remove conflicting older policies.
do $$
begin
  execute 'drop policy if exists "Public can view products" on public.products';
  execute 'drop policy if exists "Allow all product modifications" on public.products';
  execute 'drop policy if exists "Public can view gallery" on public.gallery';
  execute 'drop policy if exists "Allow all gallery modifications" on public.gallery';
  execute 'drop policy if exists "Public can view reviews" on public.reviews';
  execute 'drop policy if exists "Allow all review modifications" on public.reviews';
  execute 'drop policy if exists "Public can view orders" on public.orders';
  execute 'drop policy if exists "Allow order insertion and management" on public.orders';
end $$;

create policy "Public can view products" on public.products for select using (true);
create policy "Allow all product modifications" on public.products for all using (true) with check (true);
create policy "Public can view gallery" on public.gallery for select using (true);
create policy "Allow all gallery modifications" on public.gallery for all using (true) with check (true);
create policy "Public can view reviews" on public.reviews for select using (true);
create policy "Allow all review modifications" on public.reviews for all using (true) with check (true);
create policy "Public can view orders" on public.orders for select using (true);
create policy "Allow order insertion and management" on public.orders for all using (true) with check (true);

-- Supabase normally grants these already; explicitly grant them so older projects work too.
grant select, insert, update, delete on public.products to anon, authenticated;
grant select, insert, update, delete on public.gallery to anon, authenticated;
grant select, insert, update, delete on public.reviews to anon, authenticated;
grant select, insert, update, delete on public.orders to anon, authenticated;

grant usage, select on all sequences in schema public to anon, authenticated;

create index if not exists idx_products_brand on public.products(brand);
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_gallery_created_at on public.gallery(created_at desc);
create index if not exists idx_reviews_created_at on public.reviews(created_at desc);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_push_subscriptions_created_at on public.push_subscriptions(created_at desc);

-- Realtime order events.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
exception when undefined_object then null;
end $$;
