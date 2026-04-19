'use client'

import { useState } from 'react'
import { Alat } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { generatePDF } from '@/lib/pdf-generator'
import { getStatusColor, STATUS_CLASS } from '@/lib/utils'

export default function PdfViewerModal({ alat, onClose }: { alat: Alat; onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const sc = getStatusColor(alat.status)

  async function handleOpenStorage() {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase.storage
      .from('berita-acara-pdf')
      .createSignedUrl(alat.pdf_url!, 3600)
    setLoading(false)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  async function handleGenerate() {
    setLoading(true)
    await generatePDF(alat)
    setLoading(false)
  }

  const rows = [
    ['Nama Alat', alat.nama],
    ['Jenis / Kategori', alat.jenis],
    ['Merk / Type', alat.merk_type],
    ['Nomor Seri', alat.no_seri],
    ['Tahun Pembuatan', String(alat.tahun)],
    ['Kapasitas', alat.kapasitas || '-'],
    ['Lokasi', alat.lokasi],
    ['Tanggal Inspeksi', alat.tanggal_inspeksi],
    ['Berlaku s.d.', alat.tanggal_expire],
  ]

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg my-8 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900">Berita Acara</h2>
            <p className="text-xs text-gray-400 mt-0.5">Preview dokumen riksa uji</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        {/* Document Preview */}
        <div className="bg-gray-50 p-5 mx-5 my-4 rounded-xl border border-gray-100">
          {/* Doc Header */}
          <div className="bg-brand-dark text-white rounded-lg px-4 py-3 mb-4 text-center">
            <p className="font-bold text-sm">PT MULTI CIPTA PRIMA</p>
            <p className="text-white/60 text-xs mt-0.5">Jasa Riksa Uji & Inspeksi K3 — Kota Bekasi</p>
          </div>
          <p className="text-center font-bold text-gray-800 text-sm mb-1">BERITA ACARA</p>
          <p className="text-center text-gray-500 text-xs mb-4">PEMERIKSAAN DAN PENGUJIAN</p>

          {/* Data rows */}
          <div className="space-y-2 mb-4">
            {rows.map(([label, val]) => (
              <div key={label} className="flex justify-between text-xs py-1.5 border-b border-gray-100 last:border-0">
                <span className="text-gray-400 font-medium">{label}</span>
                <span className="text-gray-800 font-medium text-right ml-4 max-w-[55%]">{val}</span>
              </div>
            ))}
            <div className="flex justify-between text-xs py-1.5">
              <span className="text-gray-400 font-medium">Status</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_CLASS[sc]}`}>
                {alat.status === 'EXPIRED' ? 'KEDALUWARSA' : `BERLAKU — Sisa ${alat.status}`}
              </span>
            </div>
          </div>

          {/* Signature placeholder */}
          <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-6">Perwakilan Customer</p>
              <div className="border-t border-gray-300 pt-1">
                <p className="text-xs text-gray-400">(......................)</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-6">PT Multi Cipta Prima</p>
              <div className="border-t border-gray-300 pt-1">
                <p className="text-xs text-gray-400">(......................)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-2">
          {alat.pdf_url ? (
            <button onClick={handleOpenStorage} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? 'Memuat...' : '📂 Buka PDF dari Storage'}
            </button>
          ) : null}
          <button onClick={handleGenerate} disabled={loading} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm">
            {loading ? 'Generating...' : '⬇ Generate & Download PDF'}
          </button>
          <button onClick={onClose} className="btn-secondary px-4">Tutup</button>
        </div>
      </div>
    </div>
  )
}
