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

-- Index on email for fast lookups during login/registration
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

-- Indexes for shelf filtering
CREATE INDEX IF NOT EXISTS idx_products_user ON public.products (user_id);
CREATE INDEX IF NOT EXISTS idx_products_routine ON public.products (user_id, routine_time);

-- -------------------------------------------------------------------------
-- 3. Table: check_ins
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL, -- Format: YYYY-MM-DD
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
-- 4. Initial Demo Seed Data (Optional)
-- -------------------------------------------------------------------------
-- Demo User: demo@glow.vn / password123 (bcrypt hash)
INSERT INTO public.users (
  id,
  name,
  email,
  password_hash,
  skin_profile
) VALUES (
  '507f1f77-bcf8-6cd7-9943-9011a0000001',
  'Tô Huyền Châu',
  'demo@glow.vn',
  '$2a$10$wT282n0F9y9V0J2F4wN8x.0L7Yp8S7Yh0m4R7J8C6z1M7Y5H9O5m2', -- bcrypt hash of 'password123'
  '{
    "skinType": "combination",
    "concerns": ["oiliness", "pore", "dark_spots"],
    "goals": ["hydration", "glow", "barrier"],
    "sensitivityLevel": "low",
    "isOnboarded": true
  }'::jsonb
) ON CONFLICT (email) DO NOTHING;

-- Seed initial products for the demo user
INSERT INTO public.products (
  id,
  user_id,
  name,
  brand,
  category,
  routine_time,
  step_order,
  opened_date,
  pao_months,
  active_ingredients,
  notes
) VALUES
  (
    '607f1f77-bcf8-6cd7-9943-9011a0000001',
    '507f1f77-bcf8-6cd7-9943-9011a0000001',
    'Sữa Rửa Mặt Dịu Nhẹ CeraVe Foaming Cleanser',
    'CeraVe',
    'cleanser',
    'both',
    1,
    NOW() - INTERVAL '30 days',
    12,
    ARRAY['Ceramide', 'Niacinamide', 'Hyaluronic Acid'],
    'Làm sạch dịu nhẹ buổi sáng và tối'
  ),
  (
    '607f1f77-bcf8-6cd7-9943-9011a0000002',
    '507f1f77-bcf8-6cd7-9943-9011a0000002',
    'Nước Hoa Hồng Cấp Ẩm Klairs Supple Preparation',
    'Dear Klairs',
    'toner',
    'both',
    2,
    NOW() - INTERVAL '25 days',
    12,
    ARRAY['Centella Asiatica', 'Hyaluronic Acid', 'Lipidure'],
    'Cân bằng pH và làm mềm da'
  ),
  (
    '607f1f77-bcf8-6cd7-9943-9011a0000003',
    '507f1f77-bcf8-6cd7-9943-9011a0000003',
    'Serum Cấp Nước The Ordinary Hyaluronic Acid 2% + B5',
    'The Ordinary',
    'serum',
    'both',
    3,
    NOW() - INTERVAL '20 days',
    12,
    ARRAY['Hyaluronic Acid', 'Panthenol (B5)'],
    'Cấp nước tầng sâu cho da căng mọng'
  ),
  (
    '607f1f77-bcf8-6cd7-9943-9011a0000004',
    '507f1f77-bcf8-6cd7-9943-9011a0000004',
    'Kem Dưỡng Phục Hồi La Roche-Posay Cicaplast Baume B5+',
    'La Roche-Posay',
    'moisturizer',
    'night',
    4,
    NOW() - INTERVAL '15 days',
    6,
    ARRAY['Panthenol (B5)', 'Madecassoside', 'Zinc Gluconate'],
    'Dưỡng ẩm chuyên sâu ban đêm, làm dịu da nhạy cảm'
  ),
  (
    '607f1f77-bcf8-6cd7-9943-9011a0000005',
    '507f1f77-bcf8-6cd7-9943-9011a0000005',
    'Kem Chống Nắng Anessa Perfect UV Sunscreen Skincare Milk SPF50+ PA++++',
    'Anessa',
    'sunscreen',
    'day',
    5,
    NOW() - INTERVAL '10 days',
    12,
    ARRAY['Zinc Oxide', 'Titanium Dioxide', 'Chiết xuất trà xanh'],
    'Bảo vệ da tối đa trước tia cực tím và ô nhiễm môi trường'
  )
ON CONFLICT (id) DO NOTHING;
