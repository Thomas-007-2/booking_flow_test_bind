-- Idempotent seed script: safe to run multiple times
-- Run schema.sql before this script.

-- 1) Merchant
INSERT INTO merchants (id, name, headline, logo_url, cancel_hours, cancel_refund_percent, terms_url, notes_checkout)
VALUES
  ('2a88cdae-d15a-4829-9ef1-cf3d3e3a7a2a', 'Bike-King Rentals', 'Premium bike rentals in the heart of the Alps.', 'https://images.unsplash.com/photo-1576435728678-68d0fbf94482?w=100&h=100&fit=crop&q=80', 24, 100, 'https://www.example.com/terms', true)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    headline = EXCLUDED.headline,
    logo_url = EXCLUDED.logo_url,
    cancel_hours = EXCLUDED.cancel_hours,
    cancel_refund_percent = EXCLUDED.cancel_refund_percent,
    terms_url = EXCLUDED.terms_url,
    notes_checkout = EXCLUDED.notes_checkout;

-- 2) Locations
INSERT INTO locations (id, merchant_id, name, address, phone, open_time, close_time, tz)
VALUES
  ('f9a8b8e0-5b4f-4b8f-8b4b-2b0b2b0b2b0b', '2a88cdae-d15a-4829-9ef1-cf3d3e3a7a2a', 'Villach City Center', 'Hauptplatz 1, 9500 Villach', '+43 4242 12345', '08:00:00', '20:00:00', 'Europe/Vienna'),
  ('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', '2a88cdae-d15a-4829-9ef1-cf3d3e3a7a2a', 'Lake Faak Shore', 'Seeufer-Landesstraße, 9583 Faak am See', '+43 4254 67890', '08:00:00', '20:00:00', 'Europe/Vienna')
ON CONFLICT (id) DO UPDATE
SET merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    address = EXCLUDED.address,
    phone = EXCLUDED.phone,
    open_time = EXCLUDED.open_time,
    close_time = EXCLUDED.close_time,
    tz = EXCLUDED.tz;

-- 3) Durations
INSERT INTO durations (id, merchant_id, label, hours, days, sort_order)
VALUES
  ('4h', '2a88cdae-d15a-4829-9ef1-cf3d3e3a7a2a', '4 hours', 4, NULL, 10),
  ('6h', '2a88cdae-d15a-4829-9ef1-cf3d3e3a7a2a', '6 hours', 6, NULL, 20),
  ('1d', '2a88cdae-d15a-4829-9ef1-cf3d3e3a7a2a', '1 day', NULL, 1, 30),
  ('2d', '2a88cdae-d15a-4829-9ef1-cf3d3e3a7a2a', '2 days', NULL, 2, 40),
  ('3d', '2a88cdae-d15a-4829-9ef1-cf3d3e3a7a2a', '3 days', NULL, 3, 50),
  ('1w', '2a88cdae-d15a-4829-9ef1-cf3d3e3a7a2a', '1 week', NULL, 7, 60),
  ('2w', '2a88cdae-d15a-4829-9ef1-cf3d3e3a7a2a', '2 weeks', NULL, 14, 70)
ON CONFLICT (id) DO UPDATE
SET merchant_id = EXCLUDED.merchant_id,
    label = EXCLUDED.label,
    hours = EXCLUDED.hours,
    days = EXCLUDED.days,
    sort_order = EXCLUDED.sort_order;

-- 4) Categories
INSERT INTO categories (id, merchant_id, name, is_hidden)
VALUES
  ('1e3a8f6e-4b7c-4b5a-9a1e-3d9f8c7b6a5e', '2a88cdae-d15a-4829-9ef1-cf3d3e3a7a2a', 'Standard Bikes', false),
  ('2f4b9c7d-5a8b-4c6d-8b2f-4e0a9d8c7b6f', '2a88cdae-d15a-4829-9ef1-cf3d3e3a7a2a', 'Mountain Bikes', false),
  ('3a5c0d8e-6b9c-4d7e-9c3a-5f1b0e9d8c7a', '2a88cdae-d15a-4829-9ef1-cf3d3e3a7a2a', 'E-Bikes', false),
  ('4b6d1e9f-7c0d-4e8f-8d4b-6a2c1f0e9d8b', '2a88cdae-d15a-4829-9ef1-cf3d3e3a7a2a', 'Add-ons', true)
ON CONFLICT (id) DO UPDATE
SET merchant_id = EXCLUDED.merchant_id,
    name = EXCLUDED.name,
    is_hidden = EXCLUDED.is_hidden;

-- 5) Products
INSERT INTO products (id, merchant_id, category_id, title, description, details, image_url, daily_price, recommended_addons)
VALUES
  ('5c7e2f0a-8d1e-4f9a-9e5b-7b3d2a1f0e9c', '2a88cdae-d15a-4829-9ef1-cf3d3e3a7a2a', '1e3a8f6e-4b7c-4b5a-9a1e-3d9f8c7b6a5e', 'City Cruiser', 'A comfortable bike for city exploration.', ARRAY['7-speed gear', 'Comfort saddle', 'Luggage rack'], 'https://images.unsplash.com/photo-1559348349-36dfc68151d8?w=800&h=600&fit=crop&q=80', 2500, ARRAY['8f0b5c3d-1a4b-4c2d-8b8e-0e6a5d4c3b2f', '9a1c6d4e-2b5c-4d3e-9c9f-1f7b6e5d4c3a']::UUID[]),
  ('6d8f3a1b-9e2f-4a0b-8f6c-8c4e3b2a1f0d', '2a88cdae-d15a-4829-9ef1-cf3d3e3a7a2a', '2f4b9c7d-5a8b-4c6d-8b2f-4e0a9d8c7b6f', 'Trail Blazer MTB', 'A sturdy mountain bike for off-road adventures.', ARRAY['Front suspension', '29-inch wheels', 'Hydraulic brakes'], 'https://images.unsplash.com/photo-1570429213458-07b615d53385?w=800&h=600&fit=crop&q=80', 4000, ARRAY['8f0b5c3d-1a4b-4c2d-8b8e-0e6a5d4c3b2f']::UUID[]),
  ('7e9a4b2c-0f3a-4b1c-9a7d-9d5f4c3b2a1e', '2a88cdae-d15a-4829-9ef1-cf3d3e3a7a2a', '3a5c0d8e-6b9c-4d7e-9c3a-5f1b0e9d8c7a', 'Electric Sprinter', 'An e-bike to conquer hills with ease.', ARRAY['500W motor', '80km range', 'LCD display'], 'https://images.unsplash.com/photo-1587183233478-05db11585c00?w=800&h=600&fit=crop&q=80', 6000, ARRAY['8f0b5c3d-1a4b-4c2d-8b8e-0e6a5d4c3b2f', '9a1c6d4e-2b5c-4d3e-9c9f-1f7b6e5d4c3a']::UUID[]),
  ('8f0b5c3d-1a4b-4c2d-8b8e-0e6a5d4c3b2f', '2a88cdae-d15a-4829-9ef1-cf3d3e3a7a2a', '4b6d1e9f-7c0d-4e8f-8d4b-6a2c1f0e9d8b', 'Rental Insurance', 'Peace of mind for your rental.', ARRAY['Covers theft and damage'], 'https://images.unsplash.com/photo-1580820267682-426da823b514?w=800&h=600&fit=crop&q=80', 500, NULL),
  ('9a1c6d4e-2b5c-4d3e-9c9f-1f7b6e5d4c3a', '2a88cdae-d15a-4829-9ef1-cf3d3e3a7a2a', '4b6d1e9f-7c0d-4e8f-8d4b-6a2c1f0e9d8b', 'Handlebar Bag', 'Carry your essentials with ease.', ARRAY['5L capacity', 'Waterproof'], 'https://images.unsplash.com/photo-1566150905458-1bf1bc112f2d?w=800&h=600&fit=crop&q=80', 300, NULL)
ON CONFLICT (id) DO UPDATE
SET merchant_id = EXCLUDED.merchant_id,
    category_id = EXCLUDED.category_id,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    details = EXCLUDED.details,
    image_url = EXCLUDED.image_url,
    daily_price = EXCLUDED.daily_price,
    recommended_addons = EXCLUDED.recommended_addons;

-- 6) Product Variants (stock per location/size) with upsert on (product, location, size)
INSERT INTO product_variants (product_id, location_id, size, stock_quantity)
VALUES
  -- City Cruiser
  ('5c7e2f0a-8d1e-4f9a-9e5b-7b3d2a1f0e9c', 'f9a8b8e0-5b4f-4b8f-8b4b-2b0b2b0b2b0b', 'S', 5),
  ('5c7e2f0a-8d1e-4f9a-9e5b-7b3d2a1f0e9c', 'f9a8b8e0-5b4f-4b8f-8b4b-2b0b2b0b2b0b', 'M', 8),
  ('5c7e2f0a-8d1e-4f9a-9e5b-7b3d2a1f0e9c', 'f9a8b8e0-5b4f-4b8f-8b4b-2b0b2b0b2b0b', 'L', 4),
  ('5c7e2f0a-8d1e-4f9a-9e5b-7b3d2a1f0e9c', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'S', 3),
  ('5c7e2f0a-8d1e-4f9a-9e5b-7b3d2a1f0e9c', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'M', 6),
  ('5c7e2f0a-8d1e-4f9a-9e5b-7b3d2a1f0e9c', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'L', 3),

  -- Trail Blazer MTB
  ('6d8f3a1b-9e2f-4a0b-8f6c-8c4e3b2a1f0d', 'f9a8b8e0-5b4f-4b8f-8b4b-2b0b2b0b2b0b', 'S', 2),
  ('6d8f3a1b-9e2f-4a0b-8f6c-8c4e3b2a1f0d', 'f9a8b8e0-5b4f-4b8f-8b4b-2b0b2b0b2b0b', 'M', 4),
  ('6d8f3a1b-9e2f-4a0b-8f6c-8c4e3b2a1f0d', 'f9a8b8e0-5b4f-4b8f-8b4b-2b0b2b0b2b0b', 'L', 3),
  ('6d8f3a1b-9e2f-4a0b-8f6c-8c4e3b2a1f0d', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'S', 4),
  ('6d8f3a1b-9e2f-4a0b-8f6c-8c4e3b2a1f0d', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'M', 7),
  ('6d8f3a1b-9e2f-4a0b-8f6c-8c4e3b2a1f0d', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'L', 5),

  -- Electric Sprinter
  ('7e9a4b2c-0f3a-4b1c-9a7d-9d5f4c3b2a1e', 'f9a8b8e0-5b4f-4b8f-8b4b-2b0b2b0b2b0b', 'S', 3),
  ('7e9a4b2c-0f3a-4b1c-9a7d-9d5f4c3b2a1e', 'f9a8b8e0-5b4f-4b8f-8b4b-2b0b2b0b2b0b', 'M', 5),
  ('7e9a4b2c-0f3a-4b1c-9a7d-9d5f4c3b2a1e', 'f9a8b8e0-5b4f-4b8f-8b4b-2b0b2b0b2b0b', 'L', 2),
  ('7e9a4b2c-0f3a-4b1c-9a7d-9d5f4c3b2a1e', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'S', 2),
  ('7e9a4b2c-0f3a-4b1c-9a7d-9d5f4c3b2a1e', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'M', 4),
  ('7e9a4b2c-0f3a-4b1c-9a7d-9d5f4c3b2a1e', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'L', 2),

  -- Add-ons (std)
  ('8f0b5c3d-1a4b-4c2d-8b8e-0e6a5d4c3b2f', 'f9a8b8e0-5b4f-4b8f-8b4b-2b0b2b0b2b0b', 'std', 100),
  ('8f0b5c3d-1a4b-4c2d-8b8e-0e6a5d4c3b2f', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'std', 100),
  ('9a1c6d4e-2b5c-4d3e-9c9f-1f7b6e5d4c3a', 'f9a8b8e0-5b4f-4b8f-8b4b-2b0b2b0b2b0b', 'std', 20),
  ('9a1c6d4e-2b5c-4d3e-9c9f-1f7b6e5d4c3a', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'std', 20)
ON CONFLICT (product_id, location_id, size) DO UPDATE
SET stock_quantity = EXCLUDED.stock_quantity;

-- 7) Per-Duration Prices (idempotent upsert using DO NOTHING + UPDATE to handle NULL location_id)
WITH prices (product_id, duration_id, location_id, price_cents) AS (
  VALUES
    -- City Cruiser (daily 2500)
    ('5c7e2f0a-8d1e-4f9a-9e5b-7b3d2a1f0e9c'::uuid, '4h'::text, NULL::uuid, 1500::int),
    ('5c7e2f0a-8d1e-4f9a-9e5b-7b3d2a1f0e9c'::uuid, '1d'::text, NULL::uuid, 2500::int),
    ('5c7e2f0a-8d1e-4f9a-9e5b-7b3d2a1f0e9c'::uuid, '3d'::text, NULL::uuid, 6900::int),
    ('5c7e2f0a-8d1e-4f9a-9e5b-7b3d2a1f0e9c'::uuid, '1w'::text, NULL::uuid, 14000::int),

    -- Trail Blazer MTB (daily 4000)
    ('6d8f3a1b-9e2f-4a0b-8f6c-8c4e3b2a1f0d'::uuid, '4h'::text, NULL::uuid, 2400::int),
    ('6d8f3a1b-9e2f-4a0b-8f6c-8c4e3b2a1f0d'::uuid, '1d'::text, NULL::uuid, 4000::int),
    ('6d8f3a1b-9e2f-4a0b-8f6c-8c4e3b2a1f0d'::uuid, '3d'::text, NULL::uuid, 11000::int),
    ('6d8f3a1b-9e2f-4a0b-8f6c-8c4e3b2a1f0d'::uuid, '1w'::text, NULL::uuid, 22000::int),

    -- Electric Sprinter (daily 6000)
    ('7e9a4b2c-0f3a-4b1c-9a7d-9d5f4c3b2a1e'::uuid, '4h'::text, NULL::uuid, 3600::int),
    ('7e9a4b2c-0f3a-4b1c-9a7d-9d5f4c3b2a1e'::uuid, '1d'::text, NULL::uuid, 6000::int),
    ('7e9a4b2c-0f3a-4b1c-9a7d-9d5f4c3b2a1e'::uuid, '3d'::text, NULL::uuid, 16500::int),
    ('7e9a4b2c-0f3a-4b1c-9a7d-9d5f4c3b2a1e'::uuid, '1w'::text, NULL::uuid, 31500::int),

    -- Location-specific override: Electric Sprinter at Lake Faak
    ('7e9a4b2c-0f3a-4b1c-9a7d-9d5f4c3b2a1e'::uuid, '1d'::text, 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d'::uuid, 6500::int)
)
INSERT INTO product_duration_prices (product_id, duration_id, location_id, price_cents)
SELECT product_id, duration_id, location_id, price_cents FROM prices
ON CONFLICT DO NOTHING;

-- Reflect updated values on re-run (handles NULL location_id correctly)
UPDATE product_duration_prices p
SET price_cents = v.price_cents
FROM (
  VALUES
    -- City Cruiser (daily 2500)
    ('5c7e2f0a-8d1e-4f9a-9e5b-7b3d2a1f0e9c'::uuid, '4h'::text, NULL::uuid, 1500::int),
    ('5c7e2f0a-8d1e-4f9a-9e5b-7b3d2a1f0e9c'::uuid, '1d'::text, NULL::uuid, 2500::int),
    ('5c7e2f0a-8d1e-4f9a-9e5b-7b3d2a1f0e9c'::uuid, '3d'::text, NULL::uuid, 6900::int),
    ('5c7e2f0a-8d1e-4f9a-9e5b-7b3d2a1f0e9c'::uuid, '1w'::text, NULL::uuid, 14000::int),

    -- Trail Blazer MTB (daily 4000)
    ('6d8f3a1b-9e2f-4a0b-8f6c-8c4e3b2a1f0d'::uuid, '4h'::text, NULL::uuid, 2400::int),
    ('6d8f3a1b-9e2f-4a0b-8f6c-8c4e3b2a1f0d'::uuid, '1d'::text, NULL::uuid, 4000::int),
    ('6d8f3a1b-9e2f-4a0b-8f6c-8c4e3b2a1f0d'::uuid, '3d'::text, NULL::uuid, 11000::int),
    ('6d8f3a1b-9e2f-4a0b-8f6c-8c4e3b2a1f0d'::uuid, '1w'::text, NULL::uuid, 22000::int),

    -- Electric Sprinter (daily 6000)
    ('7e9a4b2c-0f3a-4b1c-9a7d-9d5f4c3b2a1e'::uuid, '4h'::text, NULL::uuid, 3600::int),
    ('7e9a4b2c-0f3a-4b1c-9a7d-9d5f4c3b2a1e'::uuid, '1d'::text, NULL::uuid, 6000::int),
    ('7e9a4b2c-0f3a-4b1c-9a7d-9d5f4c3b2a1e'::uuid, '3d'::text, NULL::uuid, 16500::int),
    ('7e9a4b2c-0f3a-4b1c-9a7d-9d5f4c3b2a1e'::uuid, '1w'::text, NULL::uuid, 31500::int),

    -- Location-specific override: Electric Sprinter at Lake Faak
    ('7e9a4b2c-0f3a-4b1c-9a7d-9d5f4c3b2a1e'::uuid, '1d'::text, 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d'::uuid, 6500::int)
) AS v(product_id, duration_id, location_id, price_cents)
WHERE p.product_id = v.product_id
  AND p.duration_id = v.duration_id
  AND ((p.location_id IS NULL AND v.location_id IS NULL) OR p.location_id = v.location_id);