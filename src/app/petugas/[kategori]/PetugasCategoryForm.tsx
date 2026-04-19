'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AlatInsert, JenisAlat } from '@/types'
import AlatFormModal from '@/components/admin/AlatFormModal'

export default function PetugasCategoryForm({
  userId,
  kategori
}: {
  userId: string
  kategori: string
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  async function handleSave(formData: AlatInsert, file?: File) {
    setSaving(true)
    let pdf_url: string | undefined

    if (file) {
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${formData.no_seri}.${ext}`
      const { data: uploaded, error: upErr } = await supabase.storage
        .from('berita-acara-pdf')
        .upload(path, file, { upsert: true })
      if (!upErr && uploaded) pdf_url = uploaded.path
    }

    // Force user_id and jenis for safety
    const finalData = { 
      ...formData, 
      user_id: userId, 
      jenis: kategori as any,
      ...(pdf_url ? { pdf_url } : {}) 
    }

    await supabase.from('alat').insert(finalData)

    setSaving(false)
    router.push('/petugas/data') // Redirect to data list
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Topnav */}
      <nav className="bg-brand-dark px-6 flex items-center justify-between h-16 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link href="/petugas" className="w-9 h-9 bg-brand-red rounded-full flex items-center justify-center text-white font-bold text-sm hover:scale-105 transition-transform">MC</Link>
          <div>
            <p className="text-white font-bold text-sm">Petugas Lapangan</p>
            <p className="text-white/40 text-[10px] uppercase tracking-wider">{kategori}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/petugas/data" className="text-white hover:text-brand-red text-xs transition-colors font-medium underline underline-offset-4">
            Lihat Data Saya
          </Link>
          <Link href="/petugas" className="text-white/70 hover:text-white text-xs border border-white/20 rounded-lg px-3 py-1.5 transition-all ml-2">
            ← Beranda
          </Link>
          <button onClick={handleLogout} className="text-white/70 hover:text-white text-xs border border-white/20 rounded-lg px-3 py-1.5 transition-all">
            Logout
          </button>
        </div>
      </nav>

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-6 pb-20">
        <div className="mb-6 max-w-4xl mx-auto">
            <h1 className="text-xl font-bold text-gray-900">Buat Berita Acara: {kategori}</h1>
            <p className="text-sm text-gray-500">Silakan isi form di bawah ini untuk membuat berita acara baru.</p>
        </div>

        <AlatFormModal
          initialData={null}
          saving={saving}
          onSave={handleSave}
          onClose={() => router.push('/petugas')} // cancel goes back home
          fixedJenis={kategori as JenisAlat}
          inlineForm={true}
        />
      </div>
    </div>
  )
}
