-- ============================================================
-- Migration: Tambah kolom untuk detail Berita Acara
-- ============================================================

-- 1. Drop check constraint lama agar bisa update data
ALTER TABLE public.alat DROP CONSTRAINT IF EXISTS alat_jenis_check;

-- 2. Tambah kolom baru untuk Berita Acara
ALTER TABLE public.alat 
  ADD COLUMN IF NOT EXISTS user_email          TEXT,
  ADD COLUMN IF NOT EXISTS no_laporan          TEXT,
  ADD COLUMN IF NOT EXISTS jenis_pemeriksaan   TEXT,
  ADD COLUMN IF NOT EXISTS pemeriksaan_pengujian TEXT,
  ADD COLUMN IF NOT EXISTS alamat_perusahaan   TEXT,
  ADD COLUMN IF NOT EXISTS hasil_pemeriksaan   TEXT,
  ADD COLUMN IF NOT EXISTS diperiksa_oleh      TEXT,
  ADD COLUMN IF NOT EXISTS disaksikan_oleh     TEXT,
  ADD COLUMN IF NOT EXISTS pakai_cap           BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS metadata            JSONB DEFAULT '{}'::jsonb;

-- 3. Update data lama ke kategori baru agar tidak melanggar constraint baru
UPDATE public.alat SET jenis = 'Pesawat Angkat & Pesawat Angkut' WHERE jenis = 'PAA';
UPDATE public.alat SET jenis = 'Bejana Tekan & Tangki Timbun' WHERE jenis = 'PUBT';
UPDATE public.alat SET jenis = 'Pesawat Tenaga & Produksi' WHERE jenis = 'PTP';
UPDATE public.alat SET jenis = 'Instalasi Listrik' WHERE jenis = 'Listrik';
UPDATE public.alat SET jenis = 'Lainnya' WHERE jenis NOT IN (
  'Bejana Tekan & Tangki Timbun',
  'Pesawat Uap',
  'Pesawat Angkat & Pesawat Angkut',
  'Pesawat Tenaga & Produksi',
  'Instalasi Proteksi Kebakaran',
  'Instalasi Penyalur Petir',
  'Instalasi Listrik',
  'Elevator & Eskalator',
  'Lainnya'
);

-- 4. Pasang check constraint baru
ALTER TABLE public.alat ADD CONSTRAINT alat_jenis_check CHECK (jenis IN (
  'Bejana Tekan & Tangki Timbun',
  'Pesawat Uap',
  'Pesawat Angkat & Pesawat Angkut',
  'Pesawat Tenaga & Produksi',
  'Instalasi Proteksi Kebakaran',
  'Instalasi Penyalur Petir',
  'Instalasi Listrik',
  'Elevator & Eskalator',
  'Lainnya'
));
