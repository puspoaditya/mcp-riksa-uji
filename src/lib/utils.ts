import { differenceInDays, parseISO, isAfter } from 'date-fns'
import { Alat } from '@/types'

export function getStatusFromExpiry(tanggal_expire: string): string {
  const today = new Date()
  const exp = parseISO(tanggal_expire)
  if (!isAfter(exp, today)) return 'EXPIRED'
  const diff = differenceInDays(exp, today)
  if (diff <= 30) return `${diff} Hari`
  const months = Math.floor(diff / 30)
  return `${months} Bulan`
}

export const JENIS_SHORT: Record<string, string> = {
  'Bejana Tekan & Tangki Timbun': 'PUBT',
  'Pesawat Uap': 'PUBT',
  'Pesawat Angkat & Pesawat Angkut': 'PAA',
  'Pesawat Tenaga & Produksi': 'PTP',
  'Instalasi Proteksi Kebakaran': 'FIRE',
  'Instalasi Penyalur Petir': 'PETIR',
  'Instalasi Listrik': 'LISTRIK',
  'Elevator & Eskalator': 'LIFT',
}

export function getStatusColor(status: string) {
  if (status === 'EXPIRED') return 'expired'
  const n = parseInt(status)
  if (!isNaN(n) && n <= 30) return 'warning'
  return 'active'
}

export type StatusColor = 'expired' | 'warning' | 'active'

export const STATUS_CLASS: Record<StatusColor, string> = {
  expired: 'bg-red-100 text-red-800 border border-red-200',
  warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  active:  'bg-green-100 text-green-800 border border-green-200',
}

export const ROW_LEFT_BORDER: Record<StatusColor, string> = {
  expired: 'border-l-4 border-l-red-500',
  warning: 'border-l-4 border-l-yellow-500',
  active:  'border-l-4 border-l-green-500',
}

export function computeStats(data: Alat[]) {
  return {
    total: data.length,
    expired: data.filter(r => r.status === 'EXPIRED').length,
    segera_expired: data.filter(r => {
      const n = parseInt(r.status)
      return !isNaN(n) && n <= 30
    }).length,
    aktif: data.filter(r => {
      if (r.status === 'EXPIRED') return false
      const n = parseInt(r.status)
      return isNaN(n) || n > 30
    }).length,
  }
}

export const KATEGORI_LIST = [
  { label: 'Bejana Tekan & Tangki Timbun',       icon: '🛢️', jenis: ['Bejana Tekan & Tangki Timbun'], sub: 'PUBT — Pressure Vessel' },
  { label: 'Pesawat Uap',                        icon: '♨️', jenis: ['Pesawat Uap'],                  sub: 'Boiler & Steam Equipment' },
  { label: 'Pesawat Angkat & Pesawat Angkut',    icon: '🏗️', jenis: ['Pesawat Angkat & Pesawat Angkut'], sub: 'PAA — Lifting & Transport' },
  { label: 'Pesawat Tenaga & Produksi',          icon: '⚙️', jenis: ['Pesawat Tenaga & Produksi'],    sub: 'PTP — Power & Production' },
  { label: 'Instalasi Proteksi Kebakaran',       icon: '🔥', jenis: ['Instalasi Proteksi Kebakaran'], sub: 'Fire Protection System' },
  { label: 'Instalasi Penyalur Petir',           icon: '⚡', jenis: ['Instalasi Penyalur Petir'],     sub: 'Lightning Protection' },
  { label: 'Instalasi Listrik',                  icon: '🔌', jenis: ['Instalasi Listrik'],            sub: 'Electrical Installation' },
  { label: 'Elevator & Eskalator',               icon: '🛗', jenis: ['Elevator & Eskalator'],         sub: 'Elevator & Escalator' },
]
