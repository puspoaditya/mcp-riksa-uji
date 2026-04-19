export type JenisAlat = 
  | 'Bejana Tekan & Tangki Timbun'
  | 'Pesawat Uap'
  | 'Pesawat Angkat & Pesawat Angkut'
  | 'Pesawat Tenaga & Produksi'
  | 'Instalasi Proteksi Kebakaran'
  | 'Instalasi Penyalur Petir'
  | 'Instalasi Listrik'
  | 'Elevator & Eskalator'
  | 'Lainnya'

export type StatusAlat = 'AKTIF' | 'EXPIRED' | 'SEGERA_EXPIRED'

export interface Alat {
  id: string
  nama: string
  jenis: JenisAlat
  status: string          // e.g. "EXPIRED", "1 Bulan", "29 Hari"
  tanggal_inspeksi: string
  tanggal_expire: string
  merk_type: string
  no_seri: string
  tahun: number
  kapasitas: string | null
  lokasi: string
  customer_id: string | null
  pdf_url: string | null
  // New fields for Berita Acara
  no_laporan?: string
  jenis_pemeriksaan?: string
  pemeriksaan_pengujian?: string
  alamat_perusahaan?: string
  hasil_pemeriksaan?: string
  diperiksa_oleh?: string
  disaksikan_oleh?: string
  pakai_cap?: boolean
  user_email?: string
  metadata?: Record<string, any>
  user_id?: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  role: 'ADMIN' | 'PETUGAS'
  nama: string | null
  created_at: string
  updated_at: string
}

export interface AlatInsert {
  nama: string
  jenis: JenisAlat
  status: string
  tanggal_inspeksi: string
  tanggal_expire: string
  merk_type: string
  no_seri: string
  tahun: number
  kapasitas?: string
  lokasi: string
  customer_id?: string
  pdf_url?: string
  // New fields
  no_laporan?: string
  jenis_pemeriksaan?: string
  pemeriksaan_pengujian?: string
  alamat_perusahaan?: string
  hasil_pemeriksaan?: string
  diperiksa_oleh?: string
  disaksikan_oleh?: string
  pakai_cap?: boolean
  user_email?: string
  metadata?: Record<string, any>
}

export interface SearchParams {
  nama_perusahaan: string
  tanggal_inspeksi: string
  kode_akses: string
}

export interface PerusahaanAccess {
  id: string
  nama_perusahaan: string
  kode_akses: string
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  email: string
  role: 'ADMIN' | 'PETUGAS'
}

export interface DashboardStats {
  total: number
  expired: number
  segera_expired: number
  aktif: number
}

export type KategoriBeritaAcara =
  | 'Bejana Tekan & Tangki Timbun'
  | 'Pesawat Uap'
  | 'Pesawat Angkat & Pesawat Angkut'
  | 'Pesawat Tenaga & Produksi'
  | 'Instalasi Proteksi Kebakaran'
  | 'Instalasi Penyalur Petir'
  | 'Instalasi Listrik'
  | 'Elevator & Eskalator'

export const KATEGORI_TO_JENIS: Record<KategoriBeritaAcara, JenisAlat[]> = {
  'Bejana Tekan & Tangki Timbun': ['Bejana Tekan & Tangki Timbun'],
  'Pesawat Uap': ['Pesawat Uap'],
  'Pesawat Angkat & Pesawat Angkut': ['Pesawat Angkat & Pesawat Angkut'],
  'Pesawat Tenaga & Produksi': ['Pesawat Tenaga & Produksi'],
  'Instalasi Proteksi Kebakaran': ['Instalasi Proteksi Kebakaran'],
  'Instalasi Penyalur Petir': ['Instalasi Penyalur Petir'],
  'Instalasi Listrik': ['Instalasi Listrik'],
  'Elevator & Eskalator': ['Elevator & Eskalator'],
}
