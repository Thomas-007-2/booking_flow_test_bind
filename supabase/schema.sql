-- Idempotent schema: safe to run multiple times
-- Ensure UUID generator is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Merchants Table (base structure)
CREATE TABLE IF NOT EXISTS public.merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  headline TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add merchant configuration columns idempotently
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS cancel_hours INT DEFAULT 24 NOT NULL;
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS cancel_refund_percent INT DEFAULT 100 NOT NULL;
ALTER TABLE public.merchants ADD CONSTRAINT percentage_check CHECK (cancel_refund_percent >= 0 AND cancel_refund_percent <= 100);
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS terms_url TEXT;
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS notes_checkout BOOLEAN DEFAULT true NOT NULL;


-- 2. Locations Table
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  tz TEXT DEFAULT 'Europe/Vienna',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Durations Table
CREATE TABLE IF NOT EXISTS public.durations (
  id TEXT PRIMARY KEY, -- e.g., '4h', '1d', '2w'
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  hours INT,
  days INT,
  sort_order INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  details TEXT[],
  image_url TEXT,
  daily_price INT NOT NULL, -- in cents
  recommended_addons UUID[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Product Variants Table
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
  size TEXT NOT NULL, -- e.g., 'S', 'M', 'L', or 'std' for non-sized items
  stock_quantity INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure one variant per (product, location, size)
CREATE UNIQUE INDEX IF NOT EXISTS product_variants_unique
  ON public.product_variants (product_id, location_id, size);

-- 7. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
  rental_period TSTZRANGE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  notes TEXT,
  currency CHAR(3),
  total_amount INT,
  total_tax INT,
  subtotal INT,
  total_discount INT,
  language CHAR(2),
  channel TEXT,
  paid BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT rental_period_no_empty CHECK (not isempty(rental_period))
);

-- 8. Booking Items Table
CREATE TABLE IF NOT EXISTS public.booking_items (
  id BIGSERIAL PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE RESTRICT,
  product_name TEXT,
  quantity INT NOT NULL,
  unit_price INT,
  item_price INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Product Duration Prices (per-product, per-duration, optional per-location)
CREATE TABLE IF NOT EXISTS public.product_duration_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  duration_id TEXT NOT NULL REFERENCES public.durations(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
  price_cents INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enforce single price per (product, duration, [location or global])
CREATE UNIQUE INDEX IF NOT EXISTS product_duration_prices_unique
  ON public.product_duration_prices (product_id, duration_id, COALESCE(location_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- Read-friendly view including product title and merchant_id (replacable)
CREATE OR REPLACE VIEW public.product_duration_prices_view AS
SELECT
  pdp.id,
  pdp.product_id,
  p.title AS product_title,
  p.merchant_id,
  pdp.duration_id,
  pdp.location_id,
  pdp.price_cents,
  pdp.created_at
FROM public.product_duration_prices pdp
JOIN public.products p ON p.id = pdp.product_id;

-- Enable RLS for all tables (safe to repeat)
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.durations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_duration_prices ENABLE ROW LEVEL SECURITY;

-- Policies: create only if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='merchants' AND policyname='Allow public read access to merchants') THEN
    CREATE POLICY "Allow public read access to merchants" ON public.merchants FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='locations' AND policyname='Allow public read access to locations') THEN
    CREATE POLICY "Allow public read access to locations" ON public.locations FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='durations' AND policyname='Allow public read access to durations') THEN
    CREATE POLICY "Allow public read access to durations" ON public.durations FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='categories' AND policyname='Allow public read access to categories') THEN
    CREATE POLICY "Allow public read access to categories" ON public.categories FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='products' AND policyname='Allow public read access to products') THEN
    CREATE POLICY "Allow public read access to products" ON public.products FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='product_variants' AND policyname='Allow public read access to product_variants') THEN
    CREATE POLICY "Allow public read access to product_variants" ON public.product_variants FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='product_duration_prices' AND policyname='Allow public read access to product_duration_prices') THEN
    CREATE POLICY "Allow public read access to product_duration_prices" ON public.product_duration_prices FOR SELECT USING (true);
  END IF;
END $$;

-- Bookings and booking_items should remain private unless specific access is granted.

-- Grants for the view (idempotent)
GRANT SELECT ON public.product_duration_prices_view TO anon, authenticated;