/**
 * Production PostgreSQL / Supabase Migration Schema
 * Designed for CITY OF FADES (1202 Leeds Road, Bradford BD3 8LJ)
 * Supabase Project ID: qawfzbofsdgyyqsjqqzu
 */

export const SUPABASE_SQL_MIGRATION = `
-- ====================================================================
-- CITY OF FADES - PostgreSQL Schema for Supabase Backend
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/qawfzbofsdgyyqsjqqzu/sql
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Appointments Table (Main Booking Storage)
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_reference TEXT UNIQUE NOT NULL,
  service_id TEXT,
  service_snapshot JSONB NOT NULL,
  staff_id TEXT,
  staff_name_snapshot TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  total_price NUMERIC(6, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  status TEXT NOT NULL DEFAULT 'confirmed',
  notes TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for lookup and scheduling
CREATE INDEX IF NOT EXISTS idx_appointments_date_staff 
ON public.appointments (appointment_date, staff_id, status);

CREATE INDEX IF NOT EXISTS idx_appointments_reference 
ON public.appointments (booking_reference);

-- 2. Services Table (Optional persistent sync)
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'fades',
  description TEXT,
  price NUMERIC(6, 2) NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 30,
  buffer_minutes INT NOT NULL DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  requires_owner_confirmation BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Business Hours Table (Optional persistent sync)
CREATE TABLE IF NOT EXISTS public.business_hours (
  day_of_week INT PRIMARY KEY,
  day_name TEXT NOT NULL,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  open_time TEXT NOT NULL DEFAULT '10:00',
  close_time TEXT NOT NULL DEFAULT '19:30',
  is_tentative_unconfirmed BOOLEAN NOT NULL DEFAULT true
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;

-- 5. Access Policies
-- Allow anyone (public anon) to insert bookings
DROP POLICY IF EXISTS "Allow public booking insert" ON public.appointments;
CREATE POLICY "Allow public booking insert" ON public.appointments
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read appointments for calendar conflict checking and admin dashboard
DROP POLICY IF EXISTS "Allow appointment select" ON public.appointments;
CREATE POLICY "Allow appointment select" ON public.appointments
  FOR SELECT USING (true);

-- Allow updates for cancellation or status updates
DROP POLICY IF EXISTS "Allow appointment update" ON public.appointments;
CREATE POLICY "Allow appointment update" ON public.appointments
  FOR UPDATE USING (true);

-- Services and Hours public read
DROP POLICY IF EXISTS "Allow public services select" ON public.services;
CREATE POLICY "Allow public services select" ON public.services
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public hours select" ON public.business_hours;
CREATE POLICY "Allow public hours select" ON public.business_hours
  FOR SELECT USING (true);

-- Initial seed appointments if empty
INSERT INTO public.appointments (
  booking_reference, 
  service_id, 
  service_snapshot, 
  staff_id, 
  staff_name_snapshot, 
  customer_name, 
  customer_email, 
  customer_phone, 
  appointment_date, 
  start_time, 
  end_time, 
  total_price, 
  status, 
  notes
) VALUES 
(
  'COF-10294',
  'srv-1',
  '{"title": "Skin / Taper Fade", "category": "fades", "price": 18.00, "duration_minutes": 35}',
  'stf-1',
  'Tariq',
  'Adam Rashid',
  'adam.rashid@example.co.uk',
  '07700 900123',
  CURRENT_DATE,
  '14:00',
  '14:35',
  18.00,
  'confirmed',
  'Low taper on temples please.'
),
(
  'COF-84920',
  'srv-3',
  '{"title": "The Full Works: Fade & Beard Sculpt", "category": "combos", "price": 26.00, "duration_minutes": 50}',
  'stf-2',
  'Hamza',
  'Zack Ahmed',
  'zack.a@example.com',
  '07700 900456',
  CURRENT_DATE,
  '16:00',
  '16:50',
  26.00,
  'confirmed',
  'Hot towel with beard oil'
)
ON CONFLICT (booking_reference) DO NOTHING;
`;
