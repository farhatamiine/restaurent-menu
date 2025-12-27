-- Add order_index to menu_items
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Optional: RPC to bulk update for performance (Postgres function)
CREATE OR REPLACE FUNCTION upsert_categories_order(payload jsonb)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  item jsonb;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(payload)
  LOOP
    UPDATE public.categories
    SET order_index = (item->>'order_index')::int
    WHERE id = (item->>'id')::uuid;
  END LOOP;
END;
$$;
