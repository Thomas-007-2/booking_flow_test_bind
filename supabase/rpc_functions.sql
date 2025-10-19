-- Ensure timezone-aware ranges, correct bigint types for SUMs, clamp non-negative, and PostgREST visibility

-- Function 1: Get Available Stock for a list of variants
CREATE OR REPLACE FUNCTION public.get_available_stock(
    variant_ids UUID[],
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ
)
RETURNS TABLE (
    variant_id UUID,
    total_stock INT,
    booked_count BIGINT,
    available_stock BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
    RETURN QUERY
    WITH booked_counts AS (
        SELECT
            bi.variant_id AS v_id,
            COALESCE(SUM(bi.quantity)::bigint, 0::bigint) AS total_booked
        FROM booking_items bi
        JOIN bookings b ON bi.booking_id = b.id
        WHERE bi.variant_id = ANY(variant_ids)
          AND b.rental_period && tstzrange(start_time, end_time)
        GROUP BY bi.variant_id
    )
    SELECT
        pv.id AS variant_id,
        pv.stock_quantity AS total_stock,
        COALESCE(bc.total_booked, 0::bigint) AS booked_count,
        GREATEST(pv.stock_quantity::bigint - COALESCE(bc.total_booked, 0::bigint), 0)::bigint AS available_stock
    FROM product_variants pv
    LEFT JOIN booked_counts bc ON pv.id = bc.v_id
    WHERE pv.id = ANY(variant_ids);
END;
$$;

-- Function 2: Get Location Availability Summary
CREATE OR REPLACE FUNCTION public.get_location_availability_summary(
    p_merchant_id UUID,
    p_location_id UUID,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_category_id UUID DEFAULT NULL,
    p_size_filter TEXT DEFAULT NULL
)
RETURNS TABLE(
    product_id UUID, 
    product_title TEXT, 
    total_available BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
    RETURN QUERY
    WITH booked_counts AS (
        SELECT
            bi.variant_id,
            COALESCE(SUM(bi.quantity)::bigint, 0::bigint) AS booked_quantity
        FROM booking_items bi
        JOIN bookings b ON bi.booking_id = b.id
        WHERE
            b.merchant_id = p_merchant_id
            AND b.location_id = p_location_id
            AND b.rental_period && tstzrange(p_start_time, p_end_time)
        GROUP BY bi.variant_id
    ),
    variant_availability AS (
        SELECT
            pv.id AS variant_id,
            pv.product_id,
            GREATEST(pv.stock_quantity::bigint - COALESCE(bc.booked_quantity, 0::bigint), 0)::bigint AS available_count
        FROM product_variants pv
        JOIN products p ON pv.product_id = p.id
        LEFT JOIN booked_counts bc ON pv.id = bc.variant_id
        WHERE
            pv.location_id = p_location_id
            AND p.merchant_id = p_merchant_id
            AND (p_category_id IS NULL OR p.category_id = p_category_id)
            AND (p_size_filter IS NULL OR pv.size = p_size_filter)
    )
    SELECT
        va.product_id,
        p.title AS product_title,
        SUM(va.available_count)::bigint AS total_available
    FROM variant_availability va
    JOIN products p ON va.product_id = p.id
    GROUP BY va.product_id, p.title
    HAVING SUM(va.available_count)::bigint > 0::bigint;
END;
$$;

-- Function 3: Effective price resolution (per product/duration, optional location override)
CREATE OR REPLACE FUNCTION public.get_effective_price(
    p_product_id UUID,
    p_duration_id TEXT,
    p_location_id UUID DEFAULT NULL
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_price INT;
  v_daily INT;
BEGIN
  -- 1) Try location-specific override
  IF p_location_id IS NOT NULL THEN
    SELECT price_cents INTO v_price
    FROM product_duration_prices
    WHERE product_id = p_product_id
      AND duration_id = p_duration_id
      AND location_id = p_location_id
    LIMIT 1;
    IF v_price IS NOT NULL THEN
      RETURN v_price;
    END IF;
  END IF;

  -- 2) Try generic product/duration price
  SELECT price_cents INTO v_price
  FROM product_duration_prices
  WHERE product_id = p_product_id
    AND duration_id = p_duration_id
    AND location_id IS NULL
  LIMIT 1;

  IF v_price IS NOT NULL THEN
    RETURN v_price;
  END IF;

  -- 3) Fallback to derived from daily_price
  SELECT daily_price INTO v_daily FROM products WHERE id = p_product_id;
  IF v_daily IS NULL THEN
    RETURN 0;
  END IF;

  RETURN CASE p_duration_id
    WHEN '4h' THEN ROUND(v_daily * 0.6)
    WHEN '6h' THEN ROUND(v_daily * 0.75)
    WHEN '1d' THEN v_daily
    WHEN '2d' THEN ROUND(v_daily * 2 * 0.95)
    WHEN '3d' THEN ROUND(v_daily * 3 * 0.92)
    WHEN '4d' THEN ROUND(v_daily * 4 * 0.90)
    WHEN '5d' THEN ROUND(v_daily * 5 * 0.88)
    WHEN '6d' THEN ROUND(v_daily * 6 * 0.86)
    WHEN '1w' THEN ROUND(v_daily * 7 * 0.80)
    WHEN '8d' THEN ROUND(v_daily * 8 * 0.80)
    WHEN '9d' THEN ROUND(v_daily * 9 * 0.80)
    WHEN '10d' THEN ROUND(v_daily * 10 * 0.80)
    WHEN '2w' THEN ROUND(v_daily * 14 * 0.75)
    ELSE v_daily
  END;
END;
$$;

-- Function 4: Create Booking (Transactional) with server-side price resolution
CREATE OR REPLACE FUNCTION public.create_booking(
    p_merchant_id UUID,
    p_location_id UUID,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_duration_id TEXT,
    p_first_name TEXT,
    p_last_name TEXT,
    p_email TEXT,
    p_phone TEXT,
    p_notes TEXT,
    p_currency CHAR(3),
    p_total_amount INT,
    p_total_tax INT,
    p_subtotal INT,
    p_total_discount INT,
    p_language CHAR(2),
    p_channel TEXT,
    p_items JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
    v_booking_id UUID;
    v_item RECORD;
    v_stock_quantity BIGINT;
    v_booked_count BIGINT;
    v_variant_product UUID;
    v_unit_price INT;
BEGIN
    -- Check for stock availability before creating the booking
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(variant_id UUID, quantity INT)
    LOOP
        SELECT stock_quantity::bigint INTO v_stock_quantity
        FROM product_variants
        WHERE id = v_item.variant_id;

        SELECT COALESCE(SUM(bi.quantity)::bigint, 0::bigint) INTO v_booked_count
        FROM booking_items bi
        JOIN bookings b ON bi.booking_id = b.id
        WHERE bi.variant_id = v_item.variant_id
          AND b.rental_period && tstzrange(p_start_time, p_end_time);

        IF (v_stock_quantity - v_booked_count) < v_item.quantity::bigint THEN
            RAISE EXCEPTION 'Insufficient stock for variant %', v_item.variant_id;
        END IF;
    END LOOP;

    -- Create the booking
    INSERT INTO bookings (
        merchant_id, location_id, rental_period, first_name, last_name, email, phone, notes,
        currency, total_amount, total_tax, subtotal, total_discount, language, channel, paid
    ) VALUES (
        p_merchant_id, p_location_id, tstzrange(p_start_time, p_end_time), p_first_name, p_last_name, p_email, p_phone, p_notes,
        p_currency, p_total_amount, p_total_tax, p_subtotal, p_total_discount, p_language, p_channel, true
    ) RETURNING id INTO v_booking_id;

    -- Create the booking items with server-side unit price
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
        variant_id UUID, 
        quantity INT, 
        product_name TEXT
    )
    LOOP
        SELECT pv.product_id INTO v_variant_product FROM product_variants pv WHERE pv.id = v_item.variant_id;

        v_unit_price := public.get_effective_price(v_variant_product, p_duration_id, p_location_id);

        INSERT INTO booking_items (booking_id, variant_id, product_name, quantity, unit_price, item_price)
        VALUES (v_booking_id, v_item.variant_id, v_item.product_name, v_item.quantity, v_unit_price, v_unit_price * v_item.quantity);
    END LOOP;

    RETURN v_booking_id;
END;
$$;

-- Function 5: Bootstrap all booking data in one call (optional)
CREATE OR REPLACE FUNCTION public.get_bootstrap_data(
  p_merchant_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  result JSONB;
BEGIN
  result := jsonb_build_object(
    'merchant',
      (SELECT to_jsonb(m) - 'created_at' FROM merchants m WHERE m.id = p_merchant_id),
    'locations',
      COALESCE((
        SELECT jsonb_agg(to_jsonb(l) - 'created_at')
        FROM (
          SELECT id, merchant_id, name, address, phone, open_time, close_time, tz
          FROM locations
          WHERE merchant_id = p_merchant_id
        ) l
      ), '[]'::jsonb),
    'durations',
      COALESCE((
        SELECT jsonb_agg(to_jsonb(d) - 'created_at')
        FROM (
          SELECT id, merchant_id, label, hours, days, sort_order
          FROM durations
          WHERE merchant_id = p_merchant_id
          ORDER BY sort_order ASC
        ) d
      ), '[]'::jsonb),
    'categories',
      COALESCE((
        SELECT jsonb_agg(to_jsonb(c) - 'created_at')
        FROM (
          SELECT id, merchant_id, name, is_hidden
          FROM categories
          WHERE merchant_id = p_merchant_id
          ORDER BY name ASC
        ) c
      ), '[]'::jsonb),
    'products',
      COALESCE((
        SELECT jsonb_agg(row_to_json(pw)::jsonb)
        FROM (
          SELECT
            p.id, p.merchant_id, p.category_id, p.title, p.description, p.details, p.image_url, p.daily_price,
            (
              SELECT COALESCE(json_agg(row_to_json(vw)), '[]'::json)
              FROM (
                SELECT pv.id, pv.product_id, pv.location_id, pv.size, pv.stock_quantity
                FROM product_variants pv
                WHERE pv.product_id = p.id
              ) vw
            ) AS product_variants
          FROM products p
          WHERE p.merchant_id = p_merchant_id
        ) pw
      ), '[]'::jsonb),
    'prices',
      COALESCE((
        SELECT jsonb_agg(to_jsonb(x))
        FROM (
          SELECT product_id, duration_id, location_id, price_cents
          FROM product_duration_prices_view
          WHERE merchant_id = p_merchant_id
        ) x
      ), '[]'::jsonb)
  );
  RETURN result;
END;
$$;

-- Grants for PostgREST (anon/authenticated API roles)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_available_stock(UUID[], TIMESTAMPTZ, TIMESTAMPTZ) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_location_availability_summary(UUID, UUID, TIMESTAMPTZ, TIMESTAMPTZ, UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_effective_price(UUID, TEXT, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_booking(UUID, UUID, TIMESTAMPTZ, TIMESTAMPTZ, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, CHAR(3), INT, INT, INT, INT, CHAR(2), TEXT, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_bootstrap_data(UUID) TO anon, authenticated;

-- Ask PostgREST to reload schema cache (safe to ignore if channel not available)
DO $$
BEGIN
  PERFORM pg_notify('pgrst', 'reload schema');
EXCEPTION WHEN OTHERS THEN
  -- ignore
END $$;