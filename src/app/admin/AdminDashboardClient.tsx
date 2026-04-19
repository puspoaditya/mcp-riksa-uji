'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Alat, AlatInsert, Profile, PerusahaanAccess } from '@/types'
import { getStatusColor, STATUS_CLASS, ROW_LEFT_BORDER, computeStats, JENIS_SHORT, getStatusFromExpiry } from '@/lib/utils'
import { generatePDF } from '@/lib/pdf-generator'
import AlatFormModal from '@/components/admin/AlatFormModal'
import PdfViewerModal from '@/components/admin/PdfViewerModal'

type Filter =
  | 'all'
  | 'EXPIRED'
  | 'AKTIF'
  | 'Bejana Tekan & Tangki Timbun'
  | 'Pesawat Uap'
  | 'Pesawat Angkat & Pesawat Angkut'
  | 'Pesawat Tenaga & Produksi'
  | 'Instalasi Proteksi Kebakaran'
  | 'Instalasi Penyalur Petir'
  | 'Instalasi Listrik'
  | 'Elevator & Eskalator'

export default function AdminDashboardClient({
  initialData,
  profiles: initialProfiles,
  accessCodes: initialAccessCodes,
  userEmail,
}: {
  initialData: Alat[]
  profiles: Profile[]
  accessCodes: PerusahaanAccess[]
  userEmail: string
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'data' | 'users' | 'access'>('data')
  const [data, setData] = useState<Alat[]>(initialData)
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles)
  const [accessCodes, setAccessCodes] = useState<PerusahaanAccess[]>(initialAccessCodes)

  // Alat filters
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState<Alat | null>(null)
  const [pdfAlat, setPdfAlat] = useState<Alat | null>(null)
  const [saving, setSaving] = useState(false)

  // User management form
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [newUserName, setNewUserName] = useState('')
  const [creatingUser, setCreatingUser] = useState(false)

  // Access code management form
  const [newCompanyName, setNewCompanyName] = useState('')
  const [newAccessCode, setNewAccessCode] = useState('')
  const [savingAccess, setSavingAccess] = useState(false)

  const supabase = createClient()
  const stats = computeStats(data)

  // ── Filter logic ────────────────────────────────────────────────────────
  const filteredAlat = data.filter(r => {
    const matchSearch = search === '' ||
      r.nama.toLowerCase().includes(search.toLowerCase()) ||
      r.merk_type.toLowerCase().includes(search.toLowerCase()) ||
      r.no_seri.toLowerCase().includes(search.toLowerCase()) ||
      r.lokasi.toLowerCase().includes(search.toLowerCase())

    if (!matchSearch) return false
    if (filter === 'all') return true
    if (filter === 'EXPIRED') return r.status === 'EXPIRED'
    if (filter === 'AKTIF') return r.status !== 'EXPIRED'
    return r.jenis === filter
  })

  // ── Handlers ───────────────────────────────────────────────────────────
  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    setCreatingUser(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newUserEmail, password: newUserPassword, nama: newUserName })
      })
      const result = await res.json()
      if (result.error) alert('Error: ' + result.error)
      else {
        alert('User Petugas berhasil dibuat!')
        const { data: updated } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
        if (updated) setProfiles(updated as Profile[])
        setNewUserEmail(''); setNewUserPassword(''); setNewUserName('')
      }
    } catch (err: any) { alert(err.message) }
    finally { setCreatingUser(false) }
  }

  async function handleSave(formData: AlatInsert, file?: File) {
    setSaving(true)
    let pdf_url: string | undefined
    if (file) {
      const ext = file.name.split('.').pop()
      const { data: up, error: e } = await supabase.storage.from('berita-acara-pdf').upload(`${Date.now()}-${formData.no_seri}.${ext}`, file)
      if (up) pdf_url = up.path
    }
    const finalData = { ...formData, ...(pdf_url ? { pdf_url } : {}) }
    if (editData) {
      const { data: u, error: e } = await supabase.from('alat').update(finalData).eq('id', editData.id).select().single()
      if (u) setData(prev => prev.map(x => x.id === editData.id ? u : x))
    } else {
      const { data: i, error: e } = await supabase.from('alat').insert(finalData).select().single()
      if (i) setData(prev => [i, ...prev])
    }
    setSaving(false); setShowForm(false); setEditData(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus data ini?')) return
    const { error } = await supabase.from('alat').delete().eq('id', id)
    if (!error) setData(prev => prev.filter(r => r.id !== id))
  }

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Semua' },
    { key: 'EXPIRED', label: 'Kedaluwarsa' },
    { key: 'AKTIF', label: 'Aktif' },
    { key: 'Pesawat Angkat & Pesawat Angkut', label: 'PAA' },
    { key: 'Bejana Tekan & Tangki Timbun', label: 'PUBT' },
    { key: 'Pesawat Tenaga & Produksi', label: 'PTP' },
    { key: 'Pesawat Uap', label: 'UAP' },
    { key: 'Instalasi Proteksi Kebakaran', label: 'FIRE' },
    { key: 'Instalasi Penyalur Petir', label: 'PETIR' },
    { key: 'Instalasi Listrik', label: 'LISTRIK' },
    { key: 'Elevator & Eskalator', label: 'LIFT' },
  ]

  // ── Inline styles ──────────────────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; }

    .adm-root { min-height: 100vh; background: #f4f6f9; font-family: 'Inter', sans-serif; }

    /* Navbar */
    .adm-nav {
      background: #1c2333;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 28px;
      position: sticky;
      top: 0;
      z-index: 50;
      box-shadow: 0 1px 0 rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.2);
    }
    .adm-nav-logo {
      width: 30px; height: 30px;
      background: linear-gradient(135deg, #e53e3e, #c53030);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 800; font-size: 10px;
      letter-spacing: 0.03em;
      box-shadow: 0 2px 8px rgba(229,62,62,0.4);
    }

    /* Tabs */
    .adm-tab-btn {
      padding: 6px 18px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.18s ease;
      letter-spacing: 0.01em;
    }
    .adm-tab-btn-active { background: #1c2333; color: #fff; }
    .adm-tab-btn-inactive { background: #fff; color: #6b7280; border: 1px solid #e5e7eb; }
    .adm-tab-btn-inactive:hover { background: #f9fafb; color: #374151; }

    /* Stat cards */
    .adm-stat-card {
      background: white;
      border-radius: 12px;
      padding: 18px 22px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
      border: 1px solid #e9ecf0;
      transition: box-shadow 0.2s;
    }
    .adm-stat-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }

    /* Filter buttons */
    .adm-filter-btn {
      padding: 5px 14px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      white-space: nowrap;
    }
    .adm-filter-active { background: #1c2333; color: white; border: 1.5px solid #1c2333; }
    .adm-filter-inactive { background: white; color: #6b7280; border: 1.5px solid #e5e7eb; }
    .adm-filter-inactive:hover { background: #f9fafb; border-color: #d1d5db; color: #374151; }

    /* Search input */
    .adm-search {
      padding: 7px 12px;
      border-radius: 8px;
      border: 1.5px solid #e5e7eb;
      font-size: 12px;
      width: 200px;
      outline: none;
      background: white;
      color: #374151;
      font-family: 'Inter', sans-serif;
      transition: border-color 0.15s;
    }
    .adm-search:focus { border-color: #93c5fd; }

    /* Table */
    .adm-table-wrap {
      background: white;
      border-radius: 12px;
      border: 1px solid #e9ecf0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      overflow: hidden;
    }
    .adm-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    .adm-thead tr {
      background: #f8fafc;
      border-bottom: 1.5px solid #e9ecf0;
    }
    .adm-th {
      padding: 11px 12px;
      text-align: left;
      font-size: 10.5px;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .adm-th:first-child { padding-left: 16px; }
    .adm-th:last-child { text-align: center; }

    .adm-tr {
      border-bottom: 1px solid #f1f5f9;
      transition: background 0.12s;
    }
    .adm-tr:hover { background: #fafbfd; }
    .adm-tr:last-child { border-bottom: none; }

    .adm-td { padding: 9px 12px; vertical-align: middle; }
    .adm-td:first-child { padding-left: 16px; }

    /* Jenis badge */
    .adm-badge-jenis {
      background: #eff6ff;
      color: #3b82f6;
      border: 1px solid #bfdbfe;
      border-radius: 5px;
      padding: 2px 8px;
      font-size: 10px;
      font-weight: 700;
      font-style: italic;
      white-space: nowrap;
    }

    /* Status badge */
    .adm-status {
      border-radius: 5px;
      padding: 3px 10px;
      font-size: 10px;
      font-weight: 700;
      display: inline-block;
      min-width: 68px;
      text-align: center;
      white-space: nowrap;
    }
    .adm-status-expired { background: #fef2f2; color: #dc2626; }
    .adm-status-critical { background: #fff7ed; color: #ea580c; }
    .adm-status-warning { background: #fefce8; color: #ca8a04; }
    .adm-status-soon { background: #eff6ff; color: #2563eb; }
    .adm-status-ok { background: #f0fdf4; color: #16a34a; }

    /* Action buttons */
    .adm-btn-pdf {
      background: #f0fdf4; color: #16a34a;
      border: 1px solid #bbf7d0;
      border-radius: 5px; padding: 4px 10px;
      font-size: 10px; font-weight: 700;
      cursor: pointer; transition: all 0.15s;
      white-space: nowrap;
    }
    .adm-btn-pdf:hover { background: #dcfce7; }

    .adm-btn-edit {
      background: #eff6ff; color: #2563eb;
      border: 1px solid #bfdbfe;
      border-radius: 5px; padding: 4px 10px;
      font-size: 10px; font-weight: 700;
      cursor: pointer; transition: all 0.15s;
      white-space: nowrap;
    }
    .adm-btn-edit:hover { background: #dbeafe; }

    .adm-btn-del {
      background: #fef2f2; color: #dc2626;
      border: 1px solid #fecaca;
      border-radius: 5px; padding: 4px 8px;
      font-size: 11px; font-weight: 700;
      cursor: pointer; transition: all 0.15s;
      line-height: 1;
    }
    .adm-btn-del:hover { background: #fee2e2; }

    .adm-btn-primary {
      background: #1c2333; color: white;
      border: none; border-radius: 8px;
      padding: 8px 18px;
      font-size: 12px; font-weight: 700;
      cursor: pointer; white-space: nowrap;
      transition: all 0.18s;
      font-family: 'Inter', sans-serif;
      letter-spacing: 0.02em;
    }
    .adm-btn-primary:hover { background: #2d3748; box-shadow: 0 4px 12px rgba(28,35,51,0.25); }

    /* Form inputs */
    .adm-input {
      width: 100%; padding: 9px 12px;
      border-radius: 8px; border: 1.5px solid #e5e7eb;
      font-size: 13px; outline: none;
      font-family: 'Inter', sans-serif;
      color: #374151;
      transition: border-color 0.15s;
      box-sizing: border-box;
    }
    .adm-input:focus { border-color: #93c5fd; }

    .adm-label {
      font-size: 10px; font-weight: 700;
      color: #94a3b8; text-transform: uppercase;
      letter-spacing: 0.07em; display: block;
      margin-bottom: 5px;
    }

    /* Row border indicator */
    .adm-row-expired { border-left: 3px solid #ef4444; }
    .adm-row-warning { border-left: 3px solid #f97316; }
    .adm-row-soon30 { border-left: 3px solid #eab308; }
    .adm-row-soon90 { border-left: 3px solid #3b82f6; }
    .adm-row-ok { border-left: 3px solid #22c55e; }

    /* Panel */
    .adm-panel {
      background: white;
      border-radius: 12px;
      border: 1px solid #e9ecf0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      overflow: hidden;
    }
    .adm-panel-body { padding: 20px; }
    .adm-panel-header {
      padding: 14px 20px;
      border-bottom: 1px solid #f1f5f9;
      display: flex; justify-content: space-between; align-items: center;
    }

    .adm-count-badge {
      font-size: 10px; font-weight: 700;
      background: #f1f5f9; color: #64748b;
      padding: 3px 10px; border-radius: 20px;
    }
  `

  return (
    <div className="adm-root">
      <style>{css}</style>

      {/* ── Navbar ──────────────────────────────────────────────── */}
      <nav className="adm-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="adm-nav-logo">MC</div>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '13px', lineHeight: 1.2 }}>PT Multi Cipta Prima</div>
            <div style={{ color: '#64748b', fontSize: '10px' }}>Dashboard Riksa Uji</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>Admin</span>
          <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8', fontSize: '11px', fontWeight: 600, padding: '5px 14px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '20px 28px' }}>

        {/* ── Tab Navigation ───────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
          {(['data', 'access', 'users'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`adm-tab-btn ${activeTab === tab ? 'adm-tab-btn-active' : 'adm-tab-btn-inactive'}`}
            >
              {tab === 'data' ? 'Data Berita Acara' : tab === 'access' ? 'Akses Customer' : 'Akses Petugas'}
            </button>
          ))}
        </div>

        {activeTab === 'data' ? (
          <>
            {/* ── Stat Cards ──────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
              {[
                { label: 'TOTAL ALAT', value: stats.total, sub: 'Terdaftar di sistem', dot: null, valColor: '#1c2333' },
                { label: 'KEDALUWARSA', value: stats.expired, sub: 'Perlu segera diperpanjang', dot: '#ef4444', valColor: '#ef4444' },
                { label: 'AKAN HABIS', value: stats.segera_expired, sub: 'Dalam 3 bulan ke depan', dot: '#f97316', valColor: '#f97316' },
                { label: 'AKTIF', value: stats.aktif, sub: 'Sertifikat masih berlaku', dot: '#22c55e', valColor: '#22c55e' },
              ].map(s => (
                <div key={s.label} className="adm-stat-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    {s.dot && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: s.dot, display: 'inline-block' }} />}
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{s.label}</span>
                  </div>
                  <div style={{ fontSize: '30px', fontWeight: 800, color: s.valColor, lineHeight: 1, marginBottom: '4px' }}>{s.value}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* ── Toolbar: Filters + Search + Tambah ──────────── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {FILTERS.map(f => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`adm-filter-btn ${filter === f.key ? 'adm-filter-active' : 'adm-filter-inactive'}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  className="adm-search"
                  placeholder="Cari alat, seri, lokasi..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <button
                  className="adm-btn-primary"
                  onClick={() => { setEditData(null); setShowForm(true) }}
                >
                  + Tambah Alat
                </button>
              </div>
            </div>

            {/* ── Data Table ──────────────────────────────────── */}
            <div className="adm-table-wrap">
              <div style={{ overflowX: 'auto' }}>
                <table className="adm-table">
                  <thead className="adm-thead">
                    <tr>
                      {['NO', 'NAMA ALAT', 'JENIS', 'STATUS', 'TGL INSPEKSI', 'TGL EXPIRE', 'MERK / TYPE', 'NO SERI', 'TAHUN', 'KAPASITAS', 'LOKASI', 'AKSI'].map(h => (
                        <th key={h} className="adm-th">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAlat.length === 0 ? (
                      <tr>
                        <td colSpan={12} style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: '13px' }}>
                          Tidak ada data ditemukan
                        </td>
                      </tr>
                    ) : filteredAlat.map((r, i) => {
                      const dynamicStatus = getStatusFromExpiry(r.tanggal_expire)
                      const isExpired = dynamicStatus === 'EXPIRED'
                      const days = parseInt(dynamicStatus)
                      const isCritical = isExpired || (!isNaN(days) && days <= 14)
                      const isWarning = !isExpired && !isNaN(days) && days > 14 && days <= 30
                      const isSoon30 = !isExpired && !isNaN(days) && days > 30 && days <= 90
                      const isOk = !isExpired && (isNaN(days) || days > 90)

                      let statusClass = 'adm-status adm-status-ok'
                      if (isExpired) statusClass = 'adm-status adm-status-expired'
                      else if (isCritical) statusClass = 'adm-status adm-status-critical'
                      else if (isWarning) statusClass = 'adm-status adm-status-warning'
                      else if (isSoon30) statusClass = 'adm-status adm-status-soon'

                      const rowClass = `adm-tr ${isExpired ? 'adm-row-expired' : isCritical ? 'adm-row-warning' : isWarning ? 'adm-row-soon30' : isSoon30 ? 'adm-row-soon90' : 'adm-row-ok'}`

                      return (
                        <tr key={r.id} className={rowClass}>
                          <td className="adm-td" style={{ color: '#94a3b8', fontWeight: 600, fontSize: '11px' }}>{i + 1}</td>
                          <td className="adm-td" style={{ fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', fontSize: '12px', textTransform: 'uppercase' }}>{r.nama}</td>
                          <td className="adm-td">
                            <span className="adm-badge-jenis">{JENIS_SHORT[r.jenis] || 'PAA'}</span>
                          </td>
                          <td className="adm-td">
                            <span className={statusClass}>{dynamicStatus}</span>
                          </td>
                          <td className="adm-td" style={{ color: '#475569', fontWeight: 500, whiteSpace: 'nowrap', fontSize: '12px' }}>{r.tanggal_inspeksi}</td>
                          <td className="adm-td" style={{ color: '#475569', fontWeight: 500, whiteSpace: 'nowrap', fontSize: '12px' }}>{r.tanggal_expire}</td>
                          <td className="adm-td" style={{ color: '#334155', fontWeight: 500, whiteSpace: 'nowrap', fontSize: '12px' }}>{r.merk_type}</td>
                          <td className="adm-td" style={{ color: '#475569', fontFamily: 'monospace', whiteSpace: 'nowrap', fontSize: '11px', background: 'none' }}>{r.no_seri}</td>
                          <td className="adm-td" style={{ color: '#64748b', whiteSpace: 'nowrap', fontSize: '12px' }}>{r.tahun}</td>
                          <td className="adm-td" style={{ color: '#64748b', whiteSpace: 'nowrap', fontSize: '12px' }}>{r.kapasitas || '—'}</td>
                          <td className="adm-td" style={{ color: '#64748b', whiteSpace: 'nowrap', fontSize: '11px' }}>{r.lokasi}</td>
                          <td className="adm-td">
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                              <button className="adm-btn-pdf" onClick={() => setPdfAlat(r)}>📄 PDF</button>
                              <button className="adm-btn-edit" onClick={() => { setEditData(r); setShowForm(true) }}>✏️ Edit</button>
                              <button className="adm-btn-del" onClick={() => handleDelete(r.id)}>🗑</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer count */}
              {filteredAlat.length > 0 && (
                <div style={{ padding: '10px 16px', borderTop: '1px solid #f1f5f9', background: '#fafbfc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    Menampilkan <strong style={{ color: '#475569' }}>{filteredAlat.length}</strong> dari <strong style={{ color: '#475569' }}>{data.length}</strong> data
                  </span>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '10px', fontWeight: 600 }}>
                    <span style={{ color: '#ef4444' }}>● {stats.expired} Expired</span>
                    <span style={{ color: '#f97316' }}>● {stats.segera_expired} Akan Habis</span>
                    <span style={{ color: '#22c55e' }}>● {stats.aktif} Aktif</span>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : activeTab === 'access' ? (
          /* ── Access Codes Tab ─────────────────────────────── */
          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px' }}>
            <div className="adm-panel">
              <div className="adm-panel-header">
                <h3 style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b' }}>🔑 Kelola Kode Akses</h3>
              </div>
              <div className="adm-panel-body">
                <form onSubmit={async (e) => {
                  e.preventDefault()
                  if (!newCompanyName || !newAccessCode) return
                  setSavingAccess(true)
                  const { data: updated, error } = await supabase.from('perusahaan_access').upsert({
                    nama_perusahaan: newCompanyName,
                    kode_akses: newAccessCode
                  }, { onConflict: 'nama_perusahaan' }).select().single()

                  if (error) alert(error.message)
                  else {
                    setAccessCodes(prev => {
                      const exists = prev.find(p => p.nama_perusahaan === updated.nama_perusahaan)
                      if (exists) return prev.map(p => p.nama_perusahaan === updated.nama_perusahaan ? updated : p)
                      return [updated, ...prev]
                    })
                    setNewCompanyName('')
                    setNewAccessCode('')
                    alert('Kode akses berhasil disimpan!')
                  }
                  setSavingAccess(false)
                }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label className="adm-label">Nama Perusahaan</label>
                    <input className="adm-input" value={newCompanyName} onChange={e => setNewCompanyName(e.target.value)} placeholder="cth: PT Maju Bersama" required />
                  </div>
                  <div>
                    <label className="adm-label">Kode Akses</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input className="adm-input" style={{ fontFamily: 'monospace' }} value={newAccessCode} onChange={e => setNewAccessCode(e.target.value)} placeholder="Kode akses" required />
                      <button type="button" onClick={() => setNewAccessCode(Math.random().toString(36).substring(2, 8).toUpperCase())}
                        style={{ padding: '9px 12px', background: '#f1f5f9', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', color: '#475569', fontFamily: 'inherit' }}>
                        RANDOM
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={savingAccess} className="adm-btn-primary" style={{ width: '100%', padding: '10px' }}>
                    {savingAccess ? 'Menyimpan...' : 'Simpan Kode Akses'}
                  </button>
                </form>
              </div>
            </div>
            <div className="adm-panel">
              <div className="adm-panel-header">
                <h3 style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b' }}>Daftar Kode Akses</h3>
                <span className="adm-count-badge">{accessCodes.length} Total</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="adm-table">
                  <thead className="adm-thead">
                    <tr>
                      <th className="adm-th">Nama Perusahaan</th>
                      <th className="adm-th">Kode Akses</th>
                      <th className="adm-th" style={{ textAlign: 'right', paddingRight: '20px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accessCodes.map(p => (
                      <tr key={p.id} className="adm-tr">
                        <td className="adm-td" style={{ fontWeight: 600, color: '#1e293b' }}>{p.nama_perusahaan}</td>
                        <td className="adm-td" style={{ color: '#3b82f6', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.1em' }}>{p.kode_akses}</td>
                        <td className="adm-td" style={{ textAlign: 'right', paddingRight: '20px' }}>
                          <button onClick={async () => {
                            if (!confirm('Hapus kode akses ini?')) return
                            const { error } = await supabase.from('perusahaan_access').delete().eq('id', p.id)
                            if (!error) setAccessCodes(prev => prev.filter(x => x.id !== p.id))
                          }} className="adm-btn-del">Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* ── Users Tab ────────────────────────────────────── */
          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px' }}>
            <div className="adm-panel">
              <div className="adm-panel-header">
                <h3 style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b' }}>👤 Daftarkan Petugas Baru</h3>
              </div>
              <div className="adm-panel-body">
                <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label className="adm-label">Nama Lengkap</label>
                    <input className="adm-input" value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="cth: Budi Santoso" required />
                  </div>
                  <div>
                    <label className="adm-label">Email</label>
                    <input className="adm-input" type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} placeholder="petugas@mcp.co.id" required />
                  </div>
                  <div>
                    <label className="adm-label">Password Awal</label>
                    <input className="adm-input" type="password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} placeholder="••••••••" required />
                  </div>
                  <button type="submit" disabled={creatingUser} className="adm-btn-primary" style={{ width: '100%', padding: '10px' }}>
                    {creatingUser ? 'Memproses...' : 'Buat Akun Petugas'}
                  </button>
                </form>
              </div>
            </div>
            <div className="adm-panel">
              <div className="adm-panel-header">
                <h3 style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b' }}>Daftar Petugas</h3>
                <span className="adm-count-badge">{profiles.length} Total</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="adm-table">
                  <thead className="adm-thead">
                    <tr>
                      <th className="adm-th">Nama Petugas</th>
                      <th className="adm-th">Email</th>
                      <th className="adm-th">Role</th>
                      <th className="adm-th" style={{ textAlign: 'right', paddingRight: '20px' }}>Terdaftar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map(p => (
                      <tr key={p.id} className="adm-tr">
                        <td className="adm-td" style={{ fontWeight: 700, color: '#1e293b' }}>{p.nama}</td>
                        <td className="adm-td" style={{ color: '#64748b', fontSize: '12px' }}>{p.email}</td>
                        <td className="adm-td">
                          <span style={{
                            fontSize: '9px', fontWeight: 800,
                            padding: '2px 8px', borderRadius: '4px',
                            background: p.role === 'ADMIN' ? '#f5f3ff' : '#eff6ff',
                            color: p.role === 'ADMIN' ? '#7c3aed' : '#2563eb'
                          }}>{p.role}</span>
                        </td>
                        <td className="adm-td" style={{ textAlign: 'right', paddingRight: '20px', color: '#94a3b8', fontSize: '12px' }}>
                          {new Date(p.created_at).toLocaleDateString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <AlatFormModal initialData={editData} saving={saving} onSave={handleSave} onClose={() => { setShowForm(false); setEditData(null) }} />
      )}
      {pdfAlat && (
        <PdfViewerModal alat={pdfAlat} onClose={() => setPdfAlat(null)} />
      )}
    </div>
  )
}
