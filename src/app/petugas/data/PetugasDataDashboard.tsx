'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Alat, AlatInsert } from '@/types'
import { computeStats, JENIS_SHORT, getStatusFromExpiry } from '@/lib/utils'
import { generatePDF } from '@/lib/pdf-generator'
import AlatFormModal from '@/components/admin/AlatFormModal'
import PdfViewerModal from '@/components/admin/PdfViewerModal'

export default function PetugasDataDashboard({
  initialData,
  userEmail,
  userId,
}: {
  initialData: Alat[]
  userEmail: string
  userId: string
}) {
  const router = useRouter()
  const [data, setData] = useState<Alat[]>(initialData)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState<Alat | null>(null)
  const [pdfAlat, setPdfAlat] = useState<Alat | null>(null)
  const [saving, setSaving] = useState(false)

  const supabase = createClient()
  const stats = computeStats(data)

  const filtered = data.filter(r =>
    search === '' ||
    r.nama.toLowerCase().includes(search.toLowerCase()) ||
    r.merk_type.toLowerCase().includes(search.toLowerCase()) ||
    r.no_seri.toLowerCase().includes(search.toLowerCase()) ||
    r.lokasi.toLowerCase().includes(search.toLowerCase())
  )

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

    const finalData = {
      ...formData,
      user_id: userId,
      ...(pdf_url ? { pdf_url } : {})
    }

    if (editData) {
      const { data: updated, error } = await supabase
        .from('alat')
        .update(finalData)
        .eq('id', editData.id)
        .select()
        .single()
      if (!error && updated) {
        setData(prev => prev.map(r => r.id === editData.id ? updated : r))
      }
    }

    setSaving(false)
    setShowForm(false)
    setEditData(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus data berita acara ini?')) return
    const { error } = await supabase.from('alat').delete().eq('id', id)
    if (!error) setData(prev => prev.filter(r => r.id !== id))
  }

  async function handleViewPdf(alat: Alat) {
    if (alat.pdf_url) {
      setPdfAlat(alat)
    } else {
      await generatePDF(alat)
    }
  }

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    .pd-root { min-height: 100vh; background: #f4f6f9; font-family: 'Inter', sans-serif; }

    .pd-nav {
      background: #1c2333; height: 52px; display: flex; align-items: center;
      justify-content: space-between; padding: 0 28px; position: sticky; top: 0; z-index: 50;
      box-shadow: 0 1px 0 rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.2);
    }
    .pd-logo {
      width: 30px; height: 30px; background: linear-gradient(135deg, #e53e3e, #c53030);
      border-radius: 8px; display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 800; font-size: 10px; box-shadow: 0 2px 8px rgba(229,62,62,0.4);
    }
    .pd-nav-btn {
      display: inline-flex; align-items: center; padding: 5px 14px; border-radius: 6px;
      font-size: 11px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif;
      transition: all 0.15s; text-decoration: none;
    }
    .pd-nav-btn-outline {
      background: transparent; color: #94a3b8;
      border: 1px solid rgba(255,255,255,0.15);
    }
    .pd-nav-btn-outline:hover { color: #e2e8f0; background: rgba(255,255,255,0.06); }

    .pd-content { max-width: 1440px; margin: 0 auto; padding: 20px 28px; }

    /* Stat cards */
    .pd-stat-card {
      background: white; border-radius: 12px; padding: 18px 22px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e9ecf0;
      transition: box-shadow 0.2s;
    }
    .pd-stat-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }

    /* Table */
    .pd-table-wrap {
      background: white; border-radius: 12px; border: 1px solid #e9ecf0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06); overflow: hidden;
    }
    .pd-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .pd-thead tr { background: #f8fafc; border-bottom: 1.5px solid #e9ecf0; }
    .pd-th {
      padding: 11px 12px; text-align: left; font-size: 10.5px; font-weight: 700;
      color: #94a3b8; letter-spacing: 0.06em; text-transform: uppercase; white-space: nowrap;
    }
    .pd-th:first-child { padding-left: 16px; }
    .pd-th:last-child { text-align: center; }
    .pd-tr { border-bottom: 1px solid #f1f5f9; transition: background 0.12s; }
    .pd-tr:hover { background: #fafbfd; }
    .pd-tr:last-child { border-bottom: none; }
    .pd-td { padding: 9px 12px; vertical-align: middle; }
    .pd-td:first-child { padding-left: 16px; }

    /* Badges */
    .pd-badge-jenis {
      background: #eff6ff; color: #3b82f6; border: 1px solid #bfdbfe;
      border-radius: 5px; padding: 2px 8px; font-size: 10px; font-weight: 700;
      font-style: italic; white-space: nowrap;
    }
    .pd-status { border-radius: 5px; padding: 3px 10px; font-size: 10px; font-weight: 700; display: inline-block; min-width: 68px; text-align: center; white-space: nowrap; }
    .pd-status-expired { background: #fef2f2; color: #dc2626; }
    .pd-status-critical { background: #fff7ed; color: #ea580c; }
    .pd-status-warning { background: #fefce8; color: #ca8a04; }
    .pd-status-soon { background: #eff6ff; color: #2563eb; }
    .pd-status-ok { background: #f0fdf4; color: #16a34a; }

    /* Row border */
    .pd-row-expired { border-left: 3px solid #ef4444; }
    .pd-row-critical { border-left: 3px solid #f97316; }
    .pd-row-warning { border-left: 3px solid #eab308; }
    .pd-row-soon { border-left: 3px solid #3b82f6; }
    .pd-row-ok { border-left: 3px solid #22c55e; }

    /* Buttons */
    .pd-btn-pdf { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; border-radius: 5px; padding: 4px 10px; font-size: 10px; font-weight: 700; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
    .pd-btn-pdf:hover { background: #dcfce7; }
    .pd-btn-edit { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; border-radius: 5px; padding: 4px 10px; font-size: 10px; font-weight: 700; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
    .pd-btn-edit:hover { background: #dbeafe; }
    .pd-btn-del { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; border-radius: 5px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.15s; line-height: 1; }
    .pd-btn-del:hover { background: #fee2e2; }

    .pd-search {
      padding: 7px 12px; border-radius: 8px; border: 1.5px solid #e5e7eb;
      font-size: 12px; width: 200px; outline: none; background: white; color: #374151;
      font-family: 'Inter', sans-serif; transition: border-color 0.15s;
    }
    .pd-search:focus { border-color: #93c5fd; }
  `

  return (
    <div className="pd-root">
      <style>{css}</style>

      {/* Navbar */}
      <nav className="pd-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="pd-logo">MC</div>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '13px', lineHeight: 1.2 }}>Petugas Lapangan</div>
            <div style={{ color: '#64748b', fontSize: '10px' }}>Semua Data Berita Acara</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link href="/petugas" className="pd-nav-btn pd-nav-btn-outline">← Beranda</Link>
          <button onClick={handleLogout} className="pd-nav-btn pd-nav-btn-outline" style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', cursor: 'pointer' }}>Logout</button>
        </div>
      </nav>

      <div className="pd-content">

        {/* Page Title */}
        <div style={{ marginBottom: '18px' }}>
          <h1 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '3px' }}>Data Berita Acara Saya</h1>
          <p style={{ fontSize: '11px', color: '#94a3b8' }}>Lihat dan kelola semua data berita acara yang telah dibuat</p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' }}>
          {[
            { label: 'TOTAL DATA', value: stats.total, sub: 'Terdaftar', dot: null, valColor: '#1c2333' },
            { label: 'EXPIRED', value: stats.expired, sub: 'Perlu diperpanjang', dot: '#ef4444', valColor: '#ef4444' },
            { label: 'AKTIF', value: stats.aktif, sub: 'Sertifikat berlaku', dot: '#22c55e', valColor: '#22c55e' },
          ].map(s => (
            <div key={s.label} className="pd-stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                {s.dot && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: s.dot, display: 'inline-block' }} />}
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{s.label}</span>
              </div>
              <div style={{ fontSize: '30px', fontWeight: 800, color: s.valColor, lineHeight: 1, marginBottom: '4px' }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
            {filtered.length} data ditemukan
          </div>
          <input
            className="pd-search"
            placeholder="Cari alat, seri, lokasi..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="pd-table-wrap">
          <div style={{ overflowX: 'auto' }}>
            <table className="pd-table">
              <thead className="pd-thead">
                <tr>
                  {['NO', 'NAMA ALAT', 'JENIS', 'STATUS', 'TGL INSPEKSI', 'TGL EXPIRE', 'MERK / TYPE', 'NO SERI', 'TAHUN', 'KAPASITAS', 'LOKASI', 'AKSI'].map(h => (
                    <th key={h} className="pd-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={12} style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: '13px' }}>
                      {search ? 'Tidak ada data yang cocok dengan pencarian' : 'Belum ada data berita acara'}
                    </td>
                  </tr>
                ) : filtered.map((r, i) => {
                  const dynamicStatus = getStatusFromExpiry(r.tanggal_expire)
                  const isExpired = dynamicStatus === 'EXPIRED'
                  const days = parseInt(dynamicStatus)
                  const isCritical = isExpired || (!isNaN(days) && days <= 14)
                  const isWarning = !isExpired && !isNaN(days) && days > 14 && days <= 30
                  const isSoon = !isExpired && !isNaN(days) && days > 30 && days <= 90

                  let statusCls = 'pd-status pd-status-ok'
                  if (isExpired) statusCls = 'pd-status pd-status-expired'
                  else if (isCritical) statusCls = 'pd-status pd-status-critical'
                  else if (isWarning) statusCls = 'pd-status pd-status-warning'
                  else if (isSoon) statusCls = 'pd-status pd-status-soon'

                  const rowCls = `pd-tr ${isExpired ? 'pd-row-expired' : isCritical ? 'pd-row-critical' : isWarning ? 'pd-row-warning' : isSoon ? 'pd-row-soon' : 'pd-row-ok'}`

                  return (
                    <tr key={r.id} className={rowCls}>
                      <td className="pd-td" style={{ color: '#94a3b8', fontWeight: 600, fontSize: '11px' }}>{i + 1}</td>
                      <td className="pd-td" style={{ fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', fontSize: '12px', textTransform: 'uppercase' }}>{r.nama}</td>
                      <td className="pd-td">
                        <span className="pd-badge-jenis">{JENIS_SHORT[r.jenis] || 'PAA'}</span>
                      </td>
                      <td className="pd-td">
                        <span className={statusCls}>{dynamicStatus}</span>
                      </td>
                      <td className="pd-td" style={{ color: '#475569', fontWeight: 500, whiteSpace: 'nowrap', fontSize: '12px' }}>{r.tanggal_inspeksi}</td>
                      <td className="pd-td" style={{ color: '#475569', fontWeight: 500, whiteSpace: 'nowrap', fontSize: '12px' }}>{r.tanggal_expire}</td>
                      <td className="pd-td" style={{ color: '#334155', fontWeight: 500, whiteSpace: 'nowrap', fontSize: '12px' }}>{r.merk_type}</td>
                      <td className="pd-td" style={{ color: '#475569', fontFamily: 'monospace', whiteSpace: 'nowrap', fontSize: '11px' }}>{r.no_seri}</td>
                      <td className="pd-td" style={{ color: '#64748b', whiteSpace: 'nowrap', fontSize: '12px' }}>{r.tahun}</td>
                      <td className="pd-td" style={{ color: '#64748b', whiteSpace: 'nowrap', fontSize: '12px' }}>{r.kapasitas || '—'}</td>
                      <td className="pd-td" style={{ color: '#64748b', whiteSpace: 'nowrap', fontSize: '11px' }}>{r.lokasi}</td>
                      <td className="pd-td">
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button className="pd-btn-pdf" onClick={() => handleViewPdf(r)}>📄 PDF</button>
                          <button className="pd-btn-edit" onClick={() => { setEditData(r); setShowForm(true) }}>✏️ Edit</button>
                          <button className="pd-btn-del" onClick={() => handleDelete(r.id)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {filtered.length > 0 && (
            <div style={{ padding: '10px 16px', borderTop: '1px solid #f1f5f9', background: '#fafbfc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                Menampilkan <strong style={{ color: '#475569' }}>{filtered.length}</strong> dari <strong style={{ color: '#475569' }}>{data.length}</strong> data
              </span>
              <div style={{ display: 'flex', gap: '12px', fontSize: '10px', fontWeight: 600 }}>
                <span style={{ color: '#ef4444' }}>● {stats.expired} Expired</span>
                <span style={{ color: '#f97316' }}>● {stats.segera_expired} Akan Habis</span>
                <span style={{ color: '#22c55e' }}>● {stats.aktif} Aktif</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <AlatFormModal
          initialData={editData}
          saving={saving}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditData(null) }}
        />
      )}
      {pdfAlat && (
        <PdfViewerModal
          alat={pdfAlat}
          onClose={() => setPdfAlat(null)}
        />
      )}
    </div>
  )
}
