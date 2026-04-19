# PT Multi Cipta Prima — Sistem Riksa Uji K3

Aplikasi web fullstack untuk manajemen Berita Acara Pemeriksaan dan Pengujian K3.

**Tech Stack:** Next.js 14 · TypeScript · Tailwind CSS · Supabase (Auth + DB + Storage) · jsPDF · Vercel

---

## Fitur

### Halaman Customer (Publik)
- Pilih kategori berita acara (PAA, PUBT, PTP, Listrik, Kebakaran)
- Cari alat berdasarkan Merk/Type + Nomor Seri
- Lihat status & detail riksa uji
- Generate/Download PDF berita acara

### Halaman Admin (Login Required)
- Dashboard statistik (total, expired, akan habis, aktif)
- Tabel lengkap dengan filter & search
- Tambah, edit, hapus data alat
- Upload PDF dari komputer → tersimpan di Supabase Storage
- Generate PDF otomatis dari data
- Preview PDF sebelum download

---

## Setup & Instalasi

### 1. Clone & Install
```bash
git clone <repo-url>
cd mcp-riksa-uji
npm install
```

### 2. Setup Supabase

**a. Buat database tables:**
- Buka Supabase Dashboard → SQL Editor
- Copy & paste isi file `supabase/migrations/001_init.sql`
- Klik Run

**b. Buat admin user:**
- Supabase Dashboard → Authentication → Users
- Klik "Add User"
- Masukkan email & password admin

**c. Ambil credentials:**
- Supabase Dashboard → Project Settings → API
- Copy: Project URL, anon/public key, service_role key

### 3. Konfigurasi Environment
```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx...
```

### 4. Jalankan Development Server
```bash
npm run dev
```
Buka: http://localhost:3000

---

## Deploy ke Vercel

### Cara Termudah (Recommended)
```bash
npm install -g vercel
vercel
```
Ikuti prompt, lalu set environment variables di Vercel Dashboard.

### Via GitHub
1. Push kode ke GitHub repository
2. Buka https://vercel.com → Import Project
3. Pilih repository
4. Tambahkan Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Deploy!

---

## Struktur Project

```
src/
├── app/
│   ├── page.tsx              # Halaman customer (home)
│   ├── cari/page.tsx         # Halaman pencarian customer
│   ├── login/page.tsx        # Halaman login admin
│   └── admin/
│       ├── page.tsx          # Admin dashboard (server component)
│       └── AdminDashboardClient.tsx  # Admin UI (client component)
├── components/
│   └── admin/
│       ├── AlatFormModal.tsx # Form tambah/edit alat
│       └── PdfViewerModal.tsx # Modal viewer PDF
├── lib/
│   ├── supabase.ts           # Supabase client utilities
│   ├── utils.ts              # Helper functions & constants
│   └── pdf-generator.ts     # Generate PDF dengan jsPDF
└── types/
    └── index.ts              # TypeScript interfaces
supabase/
└── migrations/
    └── 001_init.sql          # SQL untuk setup database
```

---

## Supabase Storage

Bucket `berita-acara-pdf` digunakan untuk menyimpan file PDF yang di-upload admin.
- Admin bisa upload saat tambah/edit data alat
- Customer bisa download via signed URL (berlaku 1 jam)
- File tidak bisa diakses langsung tanpa signed URL (aman)

---

## Tips Penggunaan

- **Status otomatis**: Status `EXPIRED` dan `X Hari/Bulan` sebaiknya diupdate manual atau buat cron job yang memanggil fungsi `getStatusFromExpiry()` dari `lib/utils.ts`
- **Backup data**: Supabase menyediakan daily backup otomatis (tergantung plan)
- **Custom domain**: Bisa diset di Vercel Dashboard → Project Settings → Domains
