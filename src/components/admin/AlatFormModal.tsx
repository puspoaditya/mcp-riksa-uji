'use client'

import { useState, useEffect } from 'react'
import { Alat, AlatInsert, JenisAlat } from '@/types'

const JENIS_OPTIONS: JenisAlat[] = [
  'Bejana Tekan & Tangki Timbun',
  'Pesawat Uap',
  'Pesawat Angkat & Pesawat Angkut',
  'Pesawat Tenaga & Produksi',
  'Instalasi Proteksi Kebakaran',
  'Instalasi Penyalur Petir',
  'Instalasi Listrik',
  'Elevator & Eskalator',
]

const LINGKUP_OPTIONS: Record<string, string[]> = {
  'Bejana Tekan & Tangki Timbun': [
    'Pemeriksaan Dokumen', 'Pemeriksaan Visual', 'Pemeriksaan Dimensi', 
    'Pengujian Tidak Merusak (NDT)', 'Analisa Kekuatan Konstruksi', 
    'Pengujian Air Penuh (Full Water Test)', 'Pengujian Kebocoran (Leak Test)', 
    'Pengujian Safety Valve & Alat-Alat Safety'
  ],
  'Pesawat Uap': [
    'Pemeriksaan Dokumen', 'Pemeriksaan Visual', 'Pengujian Tidak Merusak (NDT)', 
    'Pemeriksaan Bahan (bila diperlukan)', 'Analisa Kekuatan Konstruksi', 
    'Pengujian Tekanan (Hydrostatic Test)', 'Pengujian Tekanan (Steam Test)', 
    'Pengujian Safety Valve & Alat-Alat Safety'
  ],
  'Pesawat Angkat & Pesawat Angkut': [
    'Pemeriksaan Dokumen', 'Pemeriksaan Visual', 'Pemeriksaan Wire Rope / Chain / Hydraulic', 
    'Pengujian NDT (Bila Diperlukan)', 'Pengujian Fungsi / Mekanik', 'Pengujian Beban', 
    'Pengujian Alat-Alat Safety', 'Pengujian Jalan (Running Test)'
  ],
  'Pesawat Tenaga & Produksi': [
    'Pemeriksaan Dokumen', 'Pemeriksaan Visual', 'Pengukuran Kebisingan', 
    'Pengukuran Penerangan (Lux)', 'Pengukuran Getaran (Vibrasi)', 
    'Indikator Tekanan Oli / Pelumasan', 'Pengukuran Grounding', 
    'Pengujian alat-alat kontrol & Safety', 'Pengujian Jalan (Running Test)', 
    'System Pendinginan'
  ],
  'Instalasi Proteksi Kebakaran': [
    'Pemeriksaan Dokumen', 'Pemeriksaan Visual', 'Pengujian System Alarm', 
    'Pengukuran / Pengujian Tekanan Pada Nozzle Hydrant', 'Pengujian System Pompa Hydrant', 
    'Test Foult / Uji detector & Sprinkler'
  ],
  'Instalasi Penyalur Petir': [
    'Pemeriksaan Dokumen (Gambar Lay-out & Single line diagram)', 
    'Pemeriksaan Visual', 'Pengukuran tahanan pentanahan'
  ],
  'Instalasi Listrik': [
    'Pemeriksaan Dokumen (Gambar Lay-out & Single line diagram)', 
    'Pemeriksaan Visual', 'Pengukuran tahanan pentanahan', 
    'Pemeriksaan kondisi panel dengan infrared thermograph'
  ],
  'Elevator & Eskalator': [
    'Pemeriksaan Dokumen', 'Pemeriksaan Visual', 'Bobot Imbang, Rel Pemandu, Peredam', 
    'Pengujian ARD', 'Switch Fire', 'Pengujian Governor, Switch Tension', 
    'Pengukuran Wire Rope', 'Pengujian mekanik pengaman Lift Elevator', 
    'Pengujian Beban & Jarak Runway Counterweight', 'Pengujian Final Switch, Safety Door, Emergency', 
    'Pemeriksaan Instalasi Listrik & Penerangan', 'Pemeriksaan Alat Komunikasi Lift Elevator', 
    'Fungsi Peredaman & Kecepatan Lift'
  ],
}

const DEFAULT_CATATAN: Record<string, string> = {
  'Bejana Tekan & Tangki Timbun': 'Pemeriksaan dan Pengujian dilakukan sesuai dengan Permenaker No. 37 Tahun 2016.',
  'Pesawat Uap': 'Pemeriksaan dan Pengujian dilakukan sesuai dengan UU Uap Tahun 1930 dan Permenaker No. 37 Tahun 2016.',
  'Pesawat Angkat & Pesawat Angkut': 'Pemeriksaan dan Pengujian dilakukan sesuai dengan Permenaker No. 08 Tahun 2020.',
  'Pesawat Tenaga & Produksi': 'Pemeriksaan dan Pengujian dilakukan sesuai dengan Permenaker No. 38 Tahun 2016.',
  'Instalasi Proteksi Kebakaran': 'Pemeriksaan dan Pengujian dilakukan sesuai dengan Permenaker No. 04 Tahun 1980 & Permenaker No. 02 Tahun 1983.',
  'Instalasi Penyalur Petir': 'Pemeriksaan dan Pengujian dilakukan sesuai dengan Permenaker No. 31 Tahun 2015.',
  'Instalasi Listrik': 'Pemeriksaan dan Pengujian dilakukan sesuai dengan Permenaker No. 33 Tahun 2015 & Permenaker No. 12 Tahun 2015.',
  'Elevator & Eskalator': 'Pemeriksaan dan Pengujian dilakukan sesuai dengan Permenaker No. 06 Tahun 2017.',
}

type FieldConfig = {
  key: keyof AlatInsert | `metadata.${string}`
  label: string
  type: 'text' | 'number'
  placeholder?: string
  required?: boolean
  className?: string
}

const FORM_FIELDS: Record<string, FieldConfig[]> = {
  'Bejana Tekan & Tangki Timbun': [
    { key: 'merk_type', label: 'Pabrik Pembuat', type: 'text', required: true, placeholder: 'cth: Demag' },
    { key: 'no_seri', label: 'Nomor Seri', type: 'text', required: true, placeholder: 'cth: 92304513' },
    { key: 'tahun', label: 'Tahun Pembuatan', type: 'number', placeholder: '2024' },
    { key: 'kapasitas', label: 'Kapasitas / Tekanan Kerja', type: 'text', placeholder: 'cth: 2000 Kg / 10 Bar' },
  ],
  'Pesawat Uap': [
    { key: 'merk_type', label: 'Pabrik Pembuat', type: 'text', required: true, placeholder: 'cth: Miura' },
    { key: 'no_seri', label: 'Nomor Seri', type: 'text', required: true, placeholder: 'cth: 92304513' },
    { key: 'tahun', label: 'Tahun Pembuatan', type: 'number', placeholder: '2024' },
    { key: 'kapasitas', label: 'Kapasitas / Tekanan Kerja', type: 'text', placeholder: 'cth: 10 Ton/Jam / 10 Bar' },
  ],
  'Pesawat Angkat & Pesawat Angkut': [
    { key: 'merk_type', label: 'Pabrik Pembuat', type: 'text', required: true, placeholder: 'cth: Demag' },
    { key: 'tahun', label: 'Tahun Pembuatan', type: 'number', placeholder: '2024' },
    { key: 'metadata.model', label: 'Model', type: 'text', placeholder: 'cth: Overhead Crane' },
    { key: 'no_seri', label: 'Nomor Seri', type: 'text', required: true, placeholder: 'cth: 92304513' },
    { key: 'kapasitas', label: 'Kapasitas', type: 'text', placeholder: 'cth: 5 Ton' },
  ],
  'Pesawat Tenaga & Produksi': [
    { key: 'merk_type', label: 'Pabrik Pembuat', type: 'text', required: true, placeholder: 'cth: Caterpillar' },
    { key: 'tahun', label: 'Tahun Pembuatan', type: 'number', placeholder: '2024' },
    { key: 'metadata.model', label: 'Model', type: 'text', placeholder: 'cth: Genset' },
    { key: 'no_seri', label: 'Nomor Seri', type: 'text', required: true, placeholder: 'cth: 92304513' },
    { key: 'kapasitas', label: 'Kapasitas', type: 'text', placeholder: 'cth: 1000 kVA' },
  ],
  'Instalasi Proteksi Kebakaran': [
    { key: 'merk_type', label: 'Pabrik Pembuat', type: 'text', required: true, placeholder: 'cth: Notifier' },
    { key: 'tahun', label: 'Tahun Pembuatan', type: 'number', placeholder: '2024' },
    { key: 'metadata.model', label: 'Model', type: 'text', placeholder: 'cth: Fire Alarm' },
    { key: 'no_seri', label: 'Nomor Seri', type: 'text', required: true, placeholder: 'cth: 92304513' },
    { key: 'kapasitas', label: 'Kapasitas', type: 'text', placeholder: 'cth: 10 Zone' },
  ],
  'Elevator & Eskalator': [
    { key: 'merk_type', label: 'Pabrik Pembuat', type: 'text', required: true, placeholder: 'cth: Schindler' },
    { key: 'tahun', label: 'Tahun Pembuatan', type: 'number', placeholder: '2024' },
    { key: 'metadata.model', label: 'Model', type: 'text', placeholder: 'cth: Passenger Lift' },
    { key: 'no_seri', label: 'Nomor Seri', type: 'text', required: true, placeholder: 'cth: 92304513' },
    { key: 'kapasitas', label: 'Kapasitas', type: 'text', placeholder: 'cth: 15 Orang / 1000 Kg' },
  ],
  'Instalasi Penyalur Petir': [
    { key: 'metadata.pemasang', label: 'Pemasang / Instalatir', type: 'text', placeholder: 'cth: PT Jaya' },
    { key: 'merk_type', label: 'Merk / Model Penerima', type: 'text', required: true, placeholder: 'cth: Kurn' },
    { key: 'no_seri', label: 'Jenis Penerima', type: 'text', required: true, placeholder: 'cth: Elektrostatis' },
    { key: 'metadata.pabrik_pembuat', label: 'Pabrik Pembuat', type: 'text', placeholder: 'cth: PT Kurn' },
  ],
  'Instalasi Listrik': [
    { key: 'merk_type', label: 'Pemasang / Instalatir', type: 'text', required: true, placeholder: 'cth: PT Jaya Listrik' },
    { key: 'no_seri', label: 'Sumber Listrik', type: 'text', required: true, placeholder: 'cth: PLN' },
    { key: 'kapasitas', label: 'Daya Terpasang : Penerangan', type: 'text', placeholder: 'cth: 10 kVA' },
    { key: 'metadata.daya_tenaga', label: 'Daya Terpasang : Tenaga', type: 'text', placeholder: 'cth: 50 kVA' },
    { key: 'metadata.daya_cadangan', label: 'Daya Cadangan (Genset)', type: 'text', placeholder: 'cth: 100 kVA' },
  ]
}

const EMPTY: AlatInsert = {
  nama: '', jenis: 'Bejana Tekan & Tangki Timbun', status: 'AKTIF',
  tanggal_inspeksi: '', tanggal_expire: '',
  merk_type: '', no_seri: '',
  tahun: new Date().getFullYear(),
  kapasitas: '', lokasi: '',
  no_laporan: '',
  jenis_pemeriksaan: 'PEMERIKSAAN BERKALA',
  pemeriksaan_pengujian: 'DILAKSANAKAN',
  alamat_perusahaan: '',
  hasil_pemeriksaan: 'MEMENUHI SYARAT K3',
  diperiksa_oleh: '',
  disaksikan_oleh: '',
  pakai_cap: false,
  metadata: {},
}

export default function AlatFormModal({
  initialData,
  saving,
  onSave,
  onClose,
  fixedJenis,
  inlineForm,
}: {
  initialData: Alat | null
  saving: boolean
  onSave: (data: AlatInsert, file?: File) => void
  onClose: () => void
  fixedJenis?: JenisAlat
  inlineForm?: boolean
}) {
  const [form, setForm] = useState<AlatInsert>({
    ...EMPTY,
    jenis: fixedJenis || EMPTY.jenis,
    metadata: {
      ...EMPTY.metadata,
      catatan: DEFAULT_CATATAN[fixedJenis || EMPTY.jenis] || ''
    }
  })
  const [file, setFile] = useState<File | undefined>()
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setForm({
        nama: initialData.nama,
        jenis: initialData.jenis,
        status: initialData.status,
        tanggal_inspeksi: initialData.tanggal_inspeksi,
        tanggal_expire: initialData.tanggal_expire,
        merk_type: initialData.merk_type,
        no_seri: initialData.no_seri,
        tahun: initialData.tahun,
        kapasitas: initialData.kapasitas || '',
        lokasi: initialData.lokasi,
        no_laporan: initialData.no_laporan || '',
        jenis_pemeriksaan: initialData.jenis_pemeriksaan || 'PEMERIKSAAN BERKALA',
        pemeriksaan_pengujian: initialData.pemeriksaan_pengujian || 'DILAKSANAKAN',
        alamat_perusahaan: initialData.alamat_perusahaan || '',
        hasil_pemeriksaan: initialData.hasil_pemeriksaan || 'MEMENUHI SYARAT K3',
        diperiksa_oleh: initialData.diperiksa_oleh || '',
        disaksikan_oleh: initialData.disaksikan_oleh || '',
        pakai_cap: initialData.pakai_cap || false,
        metadata: initialData.metadata || {},
      })
    } else {
      setForm({ ...EMPTY, jenis: fixedJenis || EMPTY.jenis })
    }
  }, [initialData])

  function set(key: keyof AlatInsert, val: any) {
    if (key === 'pakai_cap') {
      setForm(prev => ({ ...prev, [key]: val === 'true' || val === true }))
    } else if (key === 'jenis') {
      // When category changes, update default note if it hasn't been manually edited or is empty
      setForm(prev => {
        const currentCatatan = prev.metadata?.catatan || ''
        const isDefault = Object.values(DEFAULT_CATATAN).includes(currentCatatan) || !currentCatatan
        return { 
          ...prev, 
          [key]: val,
          metadata: {
            ...prev.metadata,
            catatan: isDefault ? (DEFAULT_CATATAN[val] || '') : currentCatatan
          }
        }
      })
    } else {
      setForm(prev => ({ ...prev, [key]: val }))
    }
    setErrors(prev => ({ ...prev, [key]: '' }))
  }

  function setMeta(key: string, val: string) {
    setForm(prev => ({
      ...prev,
      metadata: { ...(prev.metadata || {}), [key]: val }
    }))
    setErrors(prev => ({ ...prev, [`metadata.${key}`]: '' }))
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.nama.trim()) e.nama = 'Objek Riksa Uji wajib diisi'
    if (!form.metadata?.nama_perusahaan?.trim()) e['metadata.nama_perusahaan'] = 'Nama Perusahaan wajib diisi'
    if (!form.tanggal_inspeksi) e.tanggal_inspeksi = 'Tanggal Riksa Uji wajib diisi'
    if (!form.lokasi.trim()) e.lokasi = 'Lokasi Pemeriksaan wajib diisi'
    
    // Dynamic fields validation
    const fields = FORM_FIELDS[form.jenis] || FORM_FIELDS['Bejana Tekan & Tangki Timbun']
    fields.forEach(f => {
      if (f.required) {
        if (f.key.startsWith('metadata.')) {
           const metaKey = f.key.replace('metadata.', '')
           if (!form.metadata?.[metaKey]?.trim()) e[f.key] = `${f.label} wajib diisi`
        } else {
           if (!String(form[f.key as keyof AlatInsert] || '').trim()) e[f.key] = `${f.label} wajib diisi`
        }
      }
    })

    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    // Calculate expiration date automatically
    const inspectionDate = new Date(form.tanggal_inspeksi)
    let finalForm = { ...form }

    if (!isNaN(inspectionDate.getTime())) {
      let yearsToAdd = 1
      const jenis = form.jenis
      const isPertama = form.jenis_pemeriksaan === 'PEMERIKSAAN PERTAMA'

      // Rules:
      // 2 Years: PUBT (Bejana Tekan/Pesawat Uap), PAA BARU (Pertama), Penyalur Petir
      // 1 Year: Others (PAA Berkala, PTP, Listrik, Elevator Eskalator)
      if (
        jenis === 'Bejana Tekan & Tangki Timbun' || 
        jenis === 'Pesawat Uap' || 
        jenis === 'Instalasi Penyalur Petir' ||
        (jenis === 'Pesawat Angkat & Pesawat Angkut' && isPertama)
      ) {
        yearsToAdd = 2
      } else {
        yearsToAdd = 1
      }

      const expireDate = new Date(inspectionDate)
      expireDate.setFullYear(inspectionDate.getFullYear() + yearsToAdd)
      finalForm.tanggal_expire = expireDate.toISOString().split('T')[0]
    }
    
    onSave(finalForm, file)
  }

  if (inlineForm) {
    return (
      <div className="bg-white rounded-2xl w-full max-w-4xl mx-auto shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{initialData ? 'Edit Berita Acara' : 'Buat Berita Acara'}</h2>
        </div>
        {renderForm()}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-xl my-8 shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{initialData ? 'Edit Berita Acara' : 'Buat Berita Acara'}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none transition-colors">×</button>
        </div>
        {renderForm()}
      </div>
    </div>
  )

  function renderForm() {
    return (
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">

            {/* Nomor Laporan */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nomor Laporan</label>
              <input className="input-field" value={form.no_laporan} onChange={e => set('no_laporan', e.target.value)} placeholder="cth: 001/BA-MCP/IV/2026" />
            </div>

            {/* Jenis Pemeriksaan */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Jenis Pemeriksaan</label>
              <select className="input-field" value={form.jenis_pemeriksaan} onChange={e => set('jenis_pemeriksaan', e.target.value)}>
                <option value="PEMERIKSAAN PERTAMA">PEMERIKSAAN PERTAMA</option>
                <option value="PEMERIKSAAN ULANG">PEMERIKSAAN ULANG</option>
                <option value="PEMERIKSAAN BERKALA">PEMERIKSAAN BERKALA</option>
              </select>
            </div>

            {/* Pemeriksaan & Pengujian */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Pemeriksaan & Pengujian</label>
              <select className="input-field" value={form.pemeriksaan_pengujian} onChange={e => set('pemeriksaan_pengujian', e.target.value)}>
                <option value="DILAKSANAKAN">DILAKSANAKAN</option>
                <option value="DITUNDA">DITUNDA</option>
                <option value="DIBATALKAN">DIBATALKAN</option>
              </select>
            </div>

            {/* Jenis Berita Acara */}
            {!fixedJenis && (
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Kategori Riksa Uji *</label>
                <select className="input-field" value={form.jenis} onChange={e => set('jenis', e.target.value)}>
                  {JENIS_OPTIONS.map(j => <option key={j}>{j}</option>)}
                </select>
              </div>
            )}

            {/* Tgl Riksa Uji */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tanggal Riksa Uji *</label>
              <input type="date" className={`input-field ${errors.tanggal_inspeksi ? 'border-red-400' : ''}`} value={form.tanggal_inspeksi} onChange={e => set('tanggal_inspeksi', e.target.value)} />
              {errors.tanggal_inspeksi && <p className="text-red-500 text-xs mt-1">{errors.tanggal_inspeksi}</p>}
            </div>



            {/* Objek Riksa Uji (Nama) */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Objek Riksa Uji *</label>
              <input className={`input-field ${errors.nama ? 'border-red-400' : ''}`} value={form.nama} onChange={e => set('nama', e.target.value)} placeholder="cth: Hoist Crane" />
              {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama}</p>}
            </div>

            {/* Nama Perusahaan */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nama Perusahaan *</label>
              <input className={`input-field ${errors['metadata.nama_perusahaan'] ? 'border-red-400' : ''}`} value={form.metadata?.nama_perusahaan || ''} onChange={e => setMeta('nama_perusahaan', e.target.value)} placeholder="cth: PT Maju Bersama" />
              {errors['metadata.nama_perusahaan'] && <p className="text-red-500 text-xs mt-1">{errors['metadata.nama_perusahaan']}</p>}
            </div>

            {/* Alamat Perusahaan */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Alamat Perusahaan</label>
              <textarea className="input-field min-h-[80px] py-3" value={form.alamat_perusahaan} onChange={e => set('alamat_perusahaan', e.target.value)} placeholder="cth: Jl. Raya Bekasi No. 123" />
            </div>

            {/* Dynamic Category Fields */}
            {(FORM_FIELDS[form.jenis] || FORM_FIELDS['Bejana Tekan & Tangki Timbun']).map(f => {
              const isMeta = f.key.startsWith('metadata.')
              const value = isMeta 
                ? (form.metadata?.[f.key.replace('metadata.', '')] || '') 
                : (form[f.key as keyof AlatInsert] || '')
              
              return (
                <div className="col-span-2 sm:col-span-1" key={f.key}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    {f.label} {f.required && '*'}
                  </label>
                  <input 
                    type={f.type}
                    className={`input-field ${errors[f.key] ? 'border-red-400' : ''}`} 
                    value={value as string | number} 
                    onChange={e => {
                      if (isMeta) {
                        setMeta(f.key.replace('metadata.', ''), e.target.value)
                      } else {
                        set(f.key as keyof AlatInsert, f.type === 'number' ? parseInt(e.target.value) || new Date().getFullYear() : e.target.value)
                      }
                    }} 
                    placeholder={f.placeholder} 
                  />
                  {errors[f.key] && <p className="text-red-500 text-xs mt-1">{errors[f.key]}</p>}
                </div>
              )
            })}

            {/* Lokasi */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Lokasi Pemeriksaan *</label>
              <input className={`input-field ${errors.lokasi ? 'border-red-400' : ''}`} value={form.lokasi} onChange={e => set('lokasi', e.target.value)} placeholder="cth: Area Warehouse" />
              {errors.lokasi && <p className="text-red-500 text-xs mt-1">{errors.lokasi}</p>}
            </div>

            {/* SECTION: LINGKUP PEKERJAAN (METADATA) */}
            {LINGKUP_OPTIONS[form.jenis] && (
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Lingkup Pekerjaan</label>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {LINGKUP_OPTIONS[form.jenis].map(opt => (
                    <div key={opt} className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id={`lingkup-${opt}`}
                        className="w-4 h-4 rounded border-gray-300 text-brand-red focus:ring-brand-red"
                        checked={!!form.metadata?.[opt]}
                        onChange={e => {
                          const newMeta = { ...form.metadata, [opt]: e.target.checked }
                          setForm(prev => ({ ...prev, metadata: newMeta }))
                        }}
                      />
                      <label htmlFor={`lingkup-${opt}`} className="text-xs text-gray-600 cursor-pointer">{opt}</label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hasil Pemeriksaan / Pengujian */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Hasil Pemeriksaan / Pengujian</label>
              <textarea className="input-field min-h-[80px] py-3" value={form.hasil_pemeriksaan} onChange={e => set('hasil_pemeriksaan', e.target.value)} placeholder="cth: MEMENUHI SYARAT K3" />
            </div>

            {/* Catatan / Note */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Catatan / Note</label>
              <textarea 
                className="input-field min-h-[80px] py-3" 
                value={form.metadata?.catatan || ''} 
                onChange={e => setMeta('catatan', e.target.value)} 
                placeholder="Tambahkan catatan atau rekomendasi di sini..." 
              />
            </div>

            {/* Diperiksa Oleh */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Diperiksa Oleh,</label>
              <input className="input-field" value={form.diperiksa_oleh} onChange={e => set('diperiksa_oleh', e.target.value)} placeholder="Nama Pengawas" />
            </div>

            {/* Disaksikan Oleh */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Disaksikan Oleh,</label>
              <input className="input-field" value={form.disaksikan_oleh} onChange={e => set('disaksikan_oleh', e.target.value)} placeholder="Perwakilan Perusahaan" />
            </div>

            {/* Cap Perusahaan */}
            <div className="col-span-2 flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <input 
                type="checkbox" 
                id="pakai_cap" 
                className="w-4 h-4 rounded border-gray-300 text-brand-red focus:ring-brand-red" 
                checked={form.pakai_cap}
                onChange={e => set('pakai_cap', e.target.checked ? 'true' : 'false')} 
              />
              <label htmlFor="pakai_cap" className="text-sm font-medium text-gray-700 cursor-pointer">Apakah ingin pakai cap perusahaan?</label>
            </div>



            {/* Upload PDF */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Upload Berita Acara PDF <span className="text-gray-400 font-normal normal-case">(opsional)</span>
              </label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-brand-red transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  id="pdf-upload"
                  onChange={e => setFile(e.target.files?.[0])}
                />
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  <p className="text-2xl mb-1">📄</p>
                  <p className="text-sm text-gray-500">
                    {file ? file.name : 'Klik untuk upload file PDF'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Maks. 10MB</p>
                </label>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
            {!inlineForm && (
              <button type="button" onClick={onClose} className="btn-secondary">Batal</button>
            )}
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Menyimpan...' : initialData ? 'Simpan Perubahan' : 'Buat Berita Acara'}
            </button>
          </div>
        </form>
    )
  }
}
