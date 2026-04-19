-- ============================================================
-- Migration: Add User Roles and Profiles
-- ============================================================

-- 1. Create Profile table to store role information
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('ADMIN', 'PETUGAS')),
  nama        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profile Policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profiles" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Add user_id to public.alat
ALTER TABLE public.alat ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 3. Trigger to create profile on user signup (for manual/admin creation)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, nama)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'role', 'PETUGAS'),
    COALESCE(new.raw_user_meta_data->>'nama', new.email)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Set existing users as ADMIN
-- Note: This requires the admin to have logged in at least once or existed in auth.users
-- We will handle existing tool users by updating profiles if they exist or will be created.

-- 5. Update RLS for public.alat
DROP POLICY IF EXISTS "admin_all" ON public.alat;

-- Admin: full access
CREATE POLICY "admin_all" ON public.alat
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

-- Petugas: read/write their own data
CREATE POLICY "petugas_manage_own" ON public.alat
  FOR ALL TO authenticated
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'PETUGAS'
    )
  )
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'PETUGAS'
    )
  );

-- Ensure public read still works for portal
-- (Already exists in 001_init.sql as "public_read")

-- 6. Storage updates: Petugas also needs to upload PDF
DROP POLICY IF EXISTS "admin_upload_pdf" ON storage.objects;
DROP POLICY IF EXISTS "admin_delete_pdf" ON storage.objects;

CREATE POLICY "auth_upload_pdf" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'berita-acara-pdf'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "auth_delete_pdf" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'berita-acara-pdf'
    AND auth.role() = 'authenticated'
  );
