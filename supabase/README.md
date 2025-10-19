Bike Rental Booking - Supabase setup

Run order (in Supabase SQL Editor or psql):
1) schema.sql
2) rpc_functions.sql
3) seed.sql

Notes:
- All scripts are idempotent; it’s safe to re-run them.
- schema.sql ensures pgcrypto is enabled and creates tables, indexes, RLS, and a price view.
- rpc_functions.sql creates RPCs, sets SECURITY DEFINER, and grants EXECUTE to anon/authenticated. It also triggers a PostgREST schema reload.
- seed.sql uses upserts and conflict-safe patterns. It will update values on re-run.

Important IDs:
- Merchant: 2a88cdae-d15a-4829-9ef1-cf3d3e3a7a2a
- Locations:
  - Villach City Center: f9a8b8e0-5b4f-4b8f-8b4b-2b0b2b0b2b0b
  - Lake Faak Shore: a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d

Quick checks:
- SELECT * FROM merchants WHERE id = '2a88cdae-d15a-4829-9ef1-cf3d3e3a7a2a';
- SELECT * FROM product_duration_prices_view LIMIT 5;

Test RPCs:
-- Availability summary for a day window
SELECT * FROM public.get_location_availability_summary(
  '2a88cdae-d15a-4829-9ef1-cf3d3e3a7a2a',
  'f9a8b8e0-5b4f-4b8f-8b4b-2b0b2b0b2b0b',
  NOW(),
  NOW() + INTERVAL '1 day',
  NULL,
  NULL
);

-- Variant stock for a time range
SELECT * FROM public.get_available_stock(
  ARRAY[
    'put-some-variant-uuid-here'::uuid
  ],
  NOW(),
  NOW() + INTERVAL '6 hours'
);

Frontend:
- Start the app and open with ?merchant=2a88cdae-d15a-4829-9ef1-cf3d3e3a7a2a
- Example: http://localhost:5173/?merchant=2a88cdae-d15a-4829-9ef1-cf3d3e3a7a2a