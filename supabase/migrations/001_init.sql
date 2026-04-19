-- ============================================================
-- Migration: Buat tabel utama aplikasi Riksa Uji
-- Jalankan di: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Tabel utama alat riksa uji
CREATE TABLE IF NOT EXISTS public.alat (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama               TEXT NOT NULL,
  jenis              TEXT NOT NULL CHECK (jenis IN ('PAA','PUBT','PTP','Listrik','Lainnya')),
  status             TEXT NOT NULL DEFAULT 'AKTIF',
  tanggal_inspeksi   DATE NOT NULL,
  tanggal_expire     DATE NOT NULL,
  merk_type          TEXT NOT NULL,
  no_seri            TEXT NOT NULL,
  tahun              INTEGER,
  kapasitas          TEXT,
  lokasi             TEXT NOT NULL,
  customer_id        TEXT,
  pdf_url            TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Index untuk performa pencarian customer
CREATE INDEX IF NOT EXISTS idx_alat_merk_seri
  ON public.alat (LOWER(merk_type), LOWER(no_seri));

CREATE INDEX IF NOT EXISTS idx_alat_jenis
  ON public.alat (jenis);

CREATE INDEX IF NOT EXISTS idx_alat_status
  ON public.alat (status);

-- 3. Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER alat_updated_at
  BEFORE UPDATE ON public.alat
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. Row Level Security
ALTER TABLE public.alat ENABLE ROW LEVEL SECURITY;

-- Customer: hanya bisa READ (tidak perlu login)
CREATE POLICY "public_read" ON public.alat
  FOR SELECT USING (true);

-- Admin: full access (butuh authenticated + role admin)
CREATE POLICY "admin_all" ON public.alat
  FOR ALL USING (
    auth.role() = 'authenticated'
  );

-- 5. Storage bucket untuk PDF
INSERT INTO storage.buckets (id, name, public)
VALUES ('berita-acara-pdf', 'berita-acara-pdf', false)
ON CONFLICT DO NOTHING;

-- Policy storage: admin bisa upload, semua bisa download dengan signed URL
CREATE POLICY "admin_upload_pdf" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'berita-acara-pdf'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "admin_delete_pdf" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'berita-acara-pdf'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "signed_url_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'berita-acara-pdf');

-- 6. Sample data (opsional — hapus jika tidak perlu)
INSERT INTO public.alat (nama, jenis, status, tanggal_inspeksi, tanggal_expire, merk_type, no_seri, tahun, kapasitas, lokasi) VALUES
  ('Vacuum Lifter',              'PAA',  'AKTIF',   '2026-04-22', '2026-04-29', 'Swedia',                  'V00013908',      2018, '60 Kg',     'Area Pilot Plant'),
  ('Hoist Crane',                'PAA',  'AKTIF',   '2025-06-01', '2026-06-01', 'Demag',                   '92304513',       2012, '2000 Kg',   'Station 3'),
  ('Hoist Crane',                'PAA',  'AKTIF',   '2025-06-01', '2026-06-01', 'Demag',                   '92304514',       2012, '2000 Kg',   'Station 4'),
  ('Hoist Crane',                'PAA',  'AKTIF',   '2025-06-01', '2026-06-01', 'Demag',                   '92304515',       2012, '2000 Kg',   'Station 1'),
  ('Hand Pallet',                'PAA',  'AKTIF',   '2025-05-14', '2026-05-14', 'Jungheinrich / EJE 120',  'FNS23317',       2016, '2000 Kg',   'Warehouse'),
  ('Lift Elevator',              'PAA',  'AKTIF',   '2025-05-14', '2026-05-14', 'HAISUNG',                 'P090134',        2012, '1.500 Kg',  'Gedung Produksi'),
  ('Manual Hand Pallet Mover',   'PAA',  'EXPIRED', '2024-04-25', '2025-04-25', 'Jungheinrich/Germany',    '14984521/2200kg',2017, NULL,        'Area TPS Limbah B3'),
  ('Manual Hand Pallet Mover',   'PAA',  'EXPIRED', '2024-04-25', '2025-04-25', 'Jungheinrich/Germany',    '14964784N/2200kg',2017, NULL,       'Area Warehouse'),
  ('Bejana Tekan Air Receiver',  'PUBT', 'AKTIF',   '2025-04-25', '2026-04-25', 'Silinder Vertical',       '1000 L/B',       2019, NULL,        'Area Pabrik'),
  ('Genset',                     'PTP',  'AKTIF',   '2025-05-15', '2026-05-15', 'Cummins India Limited',   'A12K287202',     2012, NULL,        'Ruang Genset'),
  ('Air Compressor Tank',        'PUBT', 'AKTIF',   '2025-06-05', '2026-06-05', 'Silinder Horizontal',     '0398/NW 50 Y',   2014, NULL,        'Area MSD Pilot Plant');
