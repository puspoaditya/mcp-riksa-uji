# Portal Riksa Uji K3 — PT Multi Cipta Prima

> Sistem manajemen digital Berita Acara Pemeriksaan dan Pengujian K3 (Riksa Uji) yang terintegrasi, mencakup portal publik untuk pelanggan, dashboard khusus petugas lapangan, dan panel administrasi penuh bagi administrator perusahaan.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)

---

## 📋 Gambaran Umum

Aplikasi ini mendigitalisasi alur kerja penerbitan **Berita Acara (BA)** riksa uji untuk PT Multi Cipta Prima. Setiap alat yang diinspeksi tercatat di database dengan masa berlaku yang terpantau secara otomatis. Pelanggan dapat mencari dan mengunduh BA mereka secara mandiri menggunakan kode akses yang diberikan perusahaan, tanpa perlu menghubungi admin secara langsung.

---

## 🗺️ Arsitektur Peran Pengguna

```
┌─────────────────────────────────────────────────────┐
│                   Aplikasi Web                       │
│                                                      │
│  /               → Portal Publik (Tanpa Login)       │
│  /cari           → Pencarian BA Pelanggan            │
│  /login          → Halaman Login                     │
│  /petugas        → Dashboard Petugas (Auth Required) │
│  /admin          → Dashboard Admin (Auth + Role)     │
└─────────────────────────────────────────────────────┘

Alur Otentikasi (Next.js Middleware):
  - Akses /admin  → Wajib login + role ADMIN
  - Akses /petugas → Wajib login (role PETUGAS atau ADMIN)
  - Login jika sudah login → Redirect ke dashboard sesuai role
```

---

## ✨ Fitur Lengkap

### 🌐 Portal Pelanggan (Publik)
- Pilih dari **8 kategori** riksa uji K3 di halaman utama
- Cari Berita Acara berdasarkan **Nama Perusahaan + Kode Akses** yang diberikan PT Multi Cipta Prima
- Tampilkan hasil inspeksi dalam format tabel profesional: nama alat, tanggal inspeksi, status masa berlaku, lokasi
- Unduh atau generate PDF Berita Acara secara langsung dari browser

### 🔧 Dashboard Petugas Lapangan (`/petugas`)
- Antarmuka khusus untuk petugas yang bekerja di lapangan
- Akses data alat sesuai penugasan
- Tampilan tabel responsif dengan dukungan horizontal scroll untuk layar kecil
- Dapat membuat dan mencatat data hasil inspeksi per kategori

### 🛡️ Dashboard Administrasi (`/admin`)
- **Statistik Real-time:** Total alat, EXPIRED, Akan Habis (≤30 hari), Aktif
- **Manajemen Data Lengkap:** Tambah, edit, hapus data alat dengan form modal per kategori
- **Pencarian & Filter:** Cari berdasarkan nama, nomor seri, merk, lokasi, kategori, atau status
- **Manajemen Akses Petugas:** Kelola akun login petugas lapangan
- **Manajemen Akses Pelanggan:** Buat, lihat, dan hapus kode akses per perusahaan pelanggan
- **Generate PDF Otomatis:** Terbit BA sesuai template resmi perusahaan menggunakan `jsPDF`
- **Upload PDF Manual:** Upload dokumen BA yang sudah ada ke Supabase Storage

---

## 🗂️ 8 Kategori Riksa Uji

| # | Kategori | Kode | Keterangan |
|---|----------|------|------------|
| 1 | Bejana Tekan & Tangki Timbun | PUBT | Pressure Vessel |
| 2 | Pesawat Uap | PUBT | Boiler & Steam Equipment |
| 3 | Pesawat Angkat & Pesawat Angkut | PAA | Lifting & Transport Equipment |
| 4 | Pesawat Tenaga & Produksi | PTP | Power & Production Machinery |
| 5 | Instalasi Proteksi Kebakaran | FIRE | Fire Protection System |
| 6 | Instalasi Penyalur Petir | PETIR | Lightning Protection System |
| 7 | Instalasi Listrik | LISTRIK | Electrical Installation |
| 8 | Elevator & Eskalator | LIFT | Elevator & Escalator |

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth + Next.js Middleware |
| Storage (PDF) | Supabase Storage (Private Bucket) |
| PDF Generation | jsPDF |
| Date Handling | date-fns |
| Deployment | Vercel |

---

## 🚀 Panduan Setup Lokal

### Prasyarat
- Node.js ≥ 18
- Akun [Supabase](https://supabase.com)
- Akun [Vercel](https://vercel.com) (untuk deployment)

### 1. Clone Repository
```bash
git clone https://github.com/puspoaditya/mcp-riksa-uji.git
cd mcp-riksa-uji
npm install
```

### 2. Setup Database di Supabase

Jalankan file migrasi berikut secara bertahap di **Supabase Dashboard → SQL Editor**:

```
supabase/migrations/
  001_init.sql                  → Tabel utama alat, RLS, Storage bucket
  002_add_berita_acara_fields.sql → Field tambahan untuk data BA
  003_add_user_roles.sql         → Sistem role (ADMIN / PETUGAS)
  004_add_perusahaan_access.sql  → Tabel kode akses pelanggan
```

### 3. Buat Akun Admin

1. Buka **Supabase Dashboard → Authentication → Users**
2. Klik **"Invite User"** atau **"Add User"**
3. Setelah akun dibuat, atur `user_metadata.role = 'ADMIN'` via SQL:
```sql
UPDATE auth.users
SET raw_user_meta_data = '{"role": "ADMIN"}'
WHERE email = 'email-admin@anda.com';
```

### 4. Konfigurasi Environment Variables

Buat file `.env.local` di root proyek:
```env
# Supabase — ambil dari Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Untuk operasi server-side (tidak boleh diexpose ke client)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> ⚠️ **Penting:** Jangan pernah commit file `.env.local` ke repository. File ini sudah terdaftar di `.gitignore`.

### 5. Jalankan Development Server
```bash
npm run dev
```
Buka: [http://localhost:3000](http://localhost:3000)

---

## 📁 Struktur Proyek

```
mcp-riksa-uji/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Halaman utama (Portal Pelanggan)
│   │   ├── cari/page.tsx               # Pencarian BA dengan kode akses
│   │   ├── login/page.tsx              # Halaman login
│   │   ├── petugas/                    # Dashboard Petugas
│   │   │   ├── page.tsx
│   │   │   ├── [kategori]/             # Halaman input data per kategori
│   │   │   └── data/                   # Tampilan data petugas
│   │   ├── admin/
│   │   │   ├── page.tsx                # Server Component (cek auth)
│   │   │   └── AdminDashboardClient.tsx # UI Admin lengkap
│   │   └── api/                        # API Routes
│   ├── components/
│   │   └── admin/                      # Reusable modal components
│   ├── lib/
│   │   ├── supabase/                   # Supabase client (server & browser)
│   │   ├── pdf-generator.ts            # Logic generate PDF jsPDF
│   │   ├── utils.ts                    # Business logic & konstanta kategori
│   │   └── logoBase64.ts               # Logo perusahaan (embedded)
│   ├── middleware.ts                   # Auth guard & role-based routing
│   └── types/index.ts                  # TypeScript type definitions
└── supabase/
    └── migrations/                     # SQL schema & stored procedures
```

---

## 🔒 Model Keamanan

| Aspek | Implementasi |
|-------|-------------|
| **Route Guard** | Next.js Middleware memvalidasi sesi + role sebelum render |
| **Row Level Security** | RLS PostgreSQL memastikan data hanya bisa diakses sesuai hak |
| **Private Storage** | Bucket PDF tidak publik; hanya bisa diakses via **Signed URL** (max 1 jam) |
| **Kode Akses Pelanggan** | Verifikasi dilakukan via **RPC Function** di sisi database, bukan di client |
| **Service Role Key** | Hanya digunakan di server-side, tidak pernah dikirim ke browser |

---

## ☁️ Deployment ke Vercel

```bash
# Install Vercel CLI (jika belum)
npm install -g vercel

# Deploy
vercel
```

Tambahkan **Environment Variables** berikut di Vercel Dashboard → Project Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## 📄 Lisensi

Proyek ini dibuat untuk kebutuhan internal PT Multi Cipta Prima. Seluruh hak cipta dilindungi.

© 2026 PT Multi Cipta Prima — Kota Bekasi, Jawa Barat
