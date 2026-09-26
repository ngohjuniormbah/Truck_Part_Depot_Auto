-- =========================================================================
-- TRUCK PARTS DEPOT AUTO — SUPABASE / POSTGRES DATABASE SCHEMA
-- =========================================================================
-- Run this in your Supabase SQL Editor (or Vercel Postgres query runner)
-- to create all required tables, security policies, and indexes.
-- =========================================================================

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT,
  year_range TEXT,
  engine TEXT,
  category TEXT NOT NULL,
  oem_number TEXT,
  sku TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  core_deposit NUMERIC(10, 2) DEFAULT 0,
  in_stock BOOLEAN DEFAULT true,
  stock_count INTEGER DEFAULT 1,
  description TEXT,
  specs JSONB DEFAULT '{}'::jsonb,
  image TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  featured BOOLEAN DEFAULT false,
  warranty TEXT DEFAULT '12-Month / Unlimited-Mile Commercial',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Backwards compatibility: add image arrays if tables were previously created
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- 2. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  company_name TEXT,
  shipping_address JSONB DEFAULT '{}'::jsonb,
  shipping_method TEXT DEFAULT 'standard',
  items JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10, 2) DEFAULT 0,
  core_deposit_total NUMERIC(10, 2) DEFAULT 0,
  shipping_fee NUMERIC(10, 2) DEFAULT 0,
  tax NUMERIC(10, 2) DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_method TEXT,
  payment_account_info TEXT,
  payment_status TEXT DEFAULT 'Pending Verification',
  order_status TEXT DEFAULT 'Pending',
  tracking_number TEXT,
  notes TEXT
);

-- 3. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  author TEXT NOT NULL,
  avatar TEXT,
  company TEXT,
  truck_model TEXT,
  rating INTEGER DEFAULT 5,
  date TEXT,
  comment TEXT,
  part_purchased TEXT,
  verified_purchase BOOLEAN DEFAULT true,
  review_image TEXT,
  link TEXT,
  link_text TEXT
);

-- 4. GALLERY TABLE
CREATE TABLE IF NOT EXISTS public.gallery (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  title TEXT NOT NULL,
  truck_brand TEXT,
  truck_model TEXT,
  year TEXT,
  image_url TEXT NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  caption TEXT,
  installed_parts JSONB DEFAULT '[]'::jsonb
);

ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- =========================================================================
-- 5. WEB PUSH SUBSCRIPTIONS
-- =========================================================================
-- Stores browser push subscriptions created from the admin dashboard.
-- RLS is enabled and there are no public policies; Supabase Edge Functions
-- use the service-role key to read/write this table.
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL UNIQUE,
  subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_created_at
  ON public.push_subscriptions(created_at DESC);

-- =========================================================================
-- INDEXES FOR FAST QUERYING
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_created_at ON public.gallery(created_at DESC);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
-- Enables seamless client operation for catalog browsing, order placing,
-- review submission, and admin management.

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- Products Policies
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all product modifications" ON public.products;
CREATE POLICY "Allow all product modifications" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- Orders Policies
DROP POLICY IF EXISTS "Public can view orders" ON public.orders;
CREATE POLICY "Public can view orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow order insertion and management" ON public.orders;
CREATE POLICY "Allow order insertion and management" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- Reviews Policies
DROP POLICY IF EXISTS "Public can view reviews" ON public.reviews;
CREATE POLICY "Public can view reviews" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all review modifications" ON public.reviews;
CREATE POLICY "Allow all review modifications" ON public.reviews FOR ALL USING (true) WITH CHECK (true);

-- Gallery Policies
DROP POLICY IF EXISTS "Public can view gallery" ON public.gallery;
CREATE POLICY "Public can view gallery" ON public.gallery FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all gallery modifications" ON public.gallery;
CREATE POLICY "Allow all gallery modifications" ON public.gallery FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime INSERT events for orders. This is useful as a secondary
-- live channel while the admin page is open.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;
