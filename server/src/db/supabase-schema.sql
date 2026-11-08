-- =========================================================================
-- Glow & Go — Supabase Database Migration Schema
-- Skincare Routine, Day/Night Shelf, Check-ins, and Gamification Data
-- =========================================================================

-- Enable UUID extension (enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------------------
-- 1. Table: users
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  skin_profile JSONB DEFAULT '{
    "skinType": "normal",
    "concerns": [],
    "goals": [],
    "sensitivityLevel": "medium",
    "isOnboarded": false
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (lower(email));

-- -------------------------------------------------------------------------
-- 2. Table: products
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT DEFAULT '',
  category TEXT NOT NULL CHECK (
    category IN ('cleanser', 'toner', 'serum', 'moisturizer', 'sunscreen', 'treatment', 'mask')
  ),
  routine_time TEXT NOT NULL DEFAULT 'both' CHECK (
    routine_time IN ('day', 'night', 'both')
  ),
  step_order INT NOT NULL DEFAULT 99,
  opened_date TIMESTAMPTZ,
  pao_months INT DEFAULT 12,
  active_ingredients TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_user ON public.products (user_id);
CREATE INDEX IF NOT EXISTS idx_products_routine ON public.products (user_id, routine_time);

-- -------------------------------------------------------------------------
-- 3. Table: check_ins
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  routine_type TEXT NOT NULL DEFAULT 'day' CHECK (
    routine_type IN ('day', 'night', 'both')
  ),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feelings TEXT[] DEFAULT ARRAY[]::TEXT[],
  completed_steps_count INT DEFAULT 0,
  notes TEXT DEFAULT '',
  environmental_context JSONB DEFAULT '{
    "city": "TP. Hồ Chí Minh",
    "temperature": null,
    "humidity": null,
    "uvIndex": null,
    "aqi": null
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_check_in_user_date_type UNIQUE (user_id, date, routine_type)
);

CREATE INDEX IF NOT EXISTS idx_checkins_user_date ON public.check_ins (user_id, date DESC);

-- -------------------------------------------------------------------------
-- 4. Row-Level Security (RLS) Policies & Permissions
-- -------------------------------------------------------------------------
-- Bật RLS và cấp quyền truy cập toàn diện cho anon & authenticated
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for users" ON public.users;
CREATE POLICY "Allow all for users" ON public.users FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for products" ON public.products;
CREATE POLICY "Allow all for products" ON public.products FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for check_ins" ON public.check_ins;
CREATE POLICY "Allow all for check_ins" ON public.check_ins FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

GRANT ALL ON TABLE public.users TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.products TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.check_ins TO anon, authenticated, service_role;

-- Cập nhật tức thì bộ nhớ đệm (schema cache) của Supabase
NOTIFY pgrst, 'reload schema';
