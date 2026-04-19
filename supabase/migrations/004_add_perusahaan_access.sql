-- ============================================================
-- Migration: Add Perusahaan Access for Customer Search
-- ============================================================

-- 1. Create Perusahaan Access table
CREATE TABLE IF NOT EXISTS public.perusahaan_access (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_perusahaan   TEXT NOT NULL UNIQUE,
  kode_akses        TEXT NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS on perusahaan_access
ALTER TABLE public.perusahaan_access ENABLE ROW LEVEL SECURITY;

-- Only Admins can manage this table
CREATE POLICY "admin_manage_access" ON public.perusahaan_access
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

-- 3. Search RPC function
-- This function allows public access to search 'alat' table ONLY IF kode_akses matches.
CREATE OR REPLACE FUNCTION public.search_alat_by_customer(
  p_nama_perusahaan TEXT,
  p_kode_akses      TEXT,
  p_tgl_inspeksi    DATE
)
RETURNS SETOF public.alat
LANGUAGE plpgsql
SECURITY DEFINER -- Use SECURITY DEFINER to bypass RLS for public search
SET search_path = public
AS $$
BEGIN
  -- Check if access code matches for the given company
  IF EXISTS (
    SELECT 1 FROM public.perusahaan_access
    WHERE LOWER(nama_perusahaan) = LOWER(p_nama_perusahaan)
      AND kode_akses = p_kode_akses
  ) THEN
    -- Return matching alat records
    RETURN QUERY
    SELECT * FROM public.alat
    WHERE LOWER(metadata->>'nama_perusahaan') = LOWER(p_nama_perusahaan)
      AND tanggal_inspeksi = p_tgl_inspeksi;
  END IF;
  
  RETURN;
END;
$$;
