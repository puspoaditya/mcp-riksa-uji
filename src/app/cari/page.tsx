'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Alat } from '@/types'
import { generatePDF } from '@/lib/pdf-generator'
import { JENIS_SHORT, getStatusFromExpiry } from '@/lib/utils'

function SearchContent() {
  const searchParams = useSearchParams()
  const kategori = searchParams.get('kategori') || ''

  const [perusahaan, setPerusahaan] = useState('')
  const [tglInspeksi, setTglInspeksi] = useState('')
  const [kodeAkses, setKodeAkses] = useState('')
  const [results, setResults] = useState<Alat[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!perusahaan.trim() || !tglInspeksi || !kodeAkses.trim()) {
      setError('Semua kolom pencarian wajib diisi')
      return
    }
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { data, error: dbErr } = await supabase.rpc('search_alat_by_customer', {
      p_nama_perusahaan: perusahaan.trim(),
      p_kode_akses: kodeAkses.trim(),
      p_tgl_inspeksi: tglInspeksi
    })
    setLoading(false)
    if (dbErr) {
      console.error(dbErr)
      setError('Terjadi kesalahan atau data tidak ditemukan. Pastikan data yang dimasukkan benar.')
      return
    }
    setResults(data || [])
  }

  async function handleViewPdf(alat: Alat) {
    if (alat.pdf_url) {
      const supabase = createClient()
      const { data } = await supabase.storage
        .from('berita-acara-pdf')
        .createSignedUrl(alat.pdf_url, 3600)
      if (data?.signedUrl) window.open(data.signedUrl, '_blank')
    } else {
      await generatePDF(alat)
    }
  }

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    .cb-root { min-height: 100vh; background: #f4f6f9; font-family: 'Inter', sans-serif; display: flex; flex-direction: column; }
    .cb-nav {
      background: #1c2333; height: 52px; display: flex; align-items: center;
      justify-content: space-between; padding: 0 28px; position: sticky; top: 0; z-index: 50;
      box-shadow: 0 1px 0 rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.2);
    }
    .cb-logo {
      width: 30px; height: 30px; background: linear-gradient(135deg, #e53e3e, #c53030);
      border-radius: 8px; display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 800; font-size: 10px; box-shadow: 0 2px 8px rgba(229,62,62,0.4);
    }
    .cb-back {
      display: inline-flex; align-items: center; gap: 5px; padding: 6px 14px;
      background: rgba(255,255,255,0.08); color: #94a3b8; border: 1px solid rgba(255,255,255,0.12);
      border-radius: 8px; font-size: 12px; font-weight: 600; text-decoration: none;
      font-family: 'Inter', sans-serif; transition: all 0.15s;
    }
    .cb-back:hover { background: rgba(255,255,255,0.14); color: #e2e8f0; }
    .cb-page-header {
      background: white; border-bottom: 1px solid #e9ecf0; padding: 13px 28px;
    }
    .cb-page-header-inner {
      max-width: 600px; margin: 0 auto; display: flex; align-items: center; gap: 12px;
    }
    .cb-back2 {
      display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px;
      background: white; color: #475569; border: 1.5px solid #e5e7eb; border-radius: 8px;
      font-size: 12px; font-weight: 600; text-decoration: none; font-family: 'Inter', sans-serif;
      transition: all 0.15s; white-space: nowrap;
    }
    .cb-back2:hover { background: #f8fafc; border-color: #d1d5db; }
    .cb-main { flex: 1; padding: 28px; }
    .cb-wrap { max-width: 600px; margin: 0 auto; }
    .cb-card {
      background: white; border-radius: 14px; border: 1px solid #e9ecf0;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06); overflow: hidden;
    }
    .cb-label {
      font-size: 10px; font-weight: 700; color: #94a3b8;
      text-transform: uppercase; letter-spacing: 0.07em; display: block; margin-bottom: 5px;
    }
    .cb-input {
      width: 100%; padding: 10px 13px; border-radius: 9px;
      border: 1.5px solid #e5e7eb; font-size: 13px; outline: none;
      font-family: 'Inter', sans-serif; color: #374151;
      transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box; background: white;
    }
    .cb-input:focus { border-color: #93c5fd; box-shadow: 0 0 0 3px rgba(147,197,253,0.15); }
    .cb-btn-primary {
      width: 100%; padding: 11px; background: #1c2333; color: white; border: none;
      border-radius: 9px; font-size: 13px; font-weight: 700; cursor: pointer;
      font-family: 'Inter', sans-serif; transition: all 0.18s; letter-spacing: 0.02em;
    }
    .cb-btn-primary:hover:not(:disabled) { background: #2d3748; box-shadow: 0 4px 12px rgba(28,35,51,0.25); }
    .cb-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .cb-info {
      background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 9px;
      padding: 12px 14px; display: flex; gap: 8px; font-size: 12px; color: #0369a1; margin-bottom: 20px;
    }
    .cb-error {
      background: #fef2f2; border: 1px solid #fecaca; border-radius: 9px;
      padding: 10px 14px; font-size: 12px; color: #dc2626; font-weight: 500;
    }
    .cb-btn-pdf {
      display: inline-flex; align-items: center; gap: 7px; padding: 8px 16px;
      background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; border-radius: 8px;
      font-size: 12px; font-weight: 700; cursor: pointer; font-family: 'Inter', sans-serif;
      transition: all 0.15s;
    }
    .cb-btn-pdf:hover { background: #dbeafe; }
    .cb-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .cb-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 20px; margin-bottom: 16px; }
    .cb-dlabel { font-size: 9.5px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 3px; }
    .cb-dval { font-size: 13px; font-weight: 600; color: #1e293b; }
    .cb-badge-expired { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; border-radius: 20px; padding: 3px 12px; font-size: 11px; font-weight: 700; white-space: nowrap; }
    .cb-badge-warning { background: #fff7ed; color: #ea580c; border: 1px solid #fed7aa; border-radius: 20px; padding: 3px 12px; font-size: 11px; font-weight: 700; white-space: nowrap; }
    .cb-badge-ok { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; border-radius: 20px; padding: 3px 12px; font-size: 11px; font-weight: 700; white-space: nowrap; }

    /* Table Styles */
    .cb-table-wrap {
      background: white; border-radius: 12px; border: 1px solid #e9ecf0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06); overflow: hidden;
    }
    .cb-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .cb-thead tr { background: #f8fafc; border-bottom: 1.5px solid #e9ecf0; }
    .cb-th {
      padding: 11px 12px; text-align: left; font-size: 10.5px; font-weight: 700;
      color: #94a3b8; letter-spacing: 0.06em; text-transform: uppercase; white-space: nowrap;
    }
    .cb-th:first-child { padding-left: 16px; }
    .cb-th:last-child { text-align: center; }
    .cb-tr { border-bottom: 1px solid #f1f5f9; transition: background 0.12s; }
    .cb-tr:hover { background: #fafbfd; }
    .cb-tr:last-child { border-bottom: none; }
    .cb-td { padding: 9px 12px; vertical-align: middle; }
    .cb-td:first-child { padding-left: 16px; }

    .cb-badge-jenis {
      background: #eff6ff; color: #3b82f6; border: 1px solid #bfdbfe;
      border-radius: 5px; padding: 2px 8px; font-size: 10px; font-weight: 700;
      font-style: italic; white-space: nowrap;
    }

    .cb-status { border-radius: 5px; padding: 3px 10px; font-size: 10px; font-weight: 700; display: inline-block; min-width: 68px; text-align: center; white-space: nowrap; }
    .cb-status-expired { background: #fef2f2; color: #dc2626; }
    .cb-status-critical { background: #fff7ed; color: #ea580c; }
    .cb-status-warning { background: #fefce8; color: #ca8a04; }
    .cb-status-soon { background: #eff6ff; color: #2563eb; }
    .cb-status-ok { background: #f0fdf4; color: #16a34a; }

    .cb-row-expired { border-left: 3px solid #ef4444; }
    .cb-row-critical { border-left: 3px solid #f97316; }
    .cb-row-warning { border-left: 3px solid #eab308; }
    .cb-row-soon { border-left: 3px solid #3b82f6; }
    .cb-row-ok { border-left: 3px solid #22c55e; }

    .cb-btn-pdf-small {
      background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0;
      border-radius: 5px; padding: 4px 10px; font-size: 10px; font-weight: 700;
      cursor: pointer; transition: all 0.15s; white-space: nowrap;
    }
    .cb-btn-pdf-small:hover { background: #dcfce7; }
  `

  return (
    <div className="cb-root">
      <style>{css}</style>

      {/* Navbar */}
      <nav className="cb-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="cb-logo">MC</div>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '13px', lineHeight: 1.2 }}>PT Multi Cipta Prima</div>
            <div style={{ color: '#64748b', fontSize: '10px' }}>Portal Customer</div>
          </div>
        </div>
        <Link href="/" className="cb-back">← Beranda</Link>
      </nav>

      {/* Page Header */}
      <div className="cb-page-header">
        <div className="cb-page-header-inner">
          <Link href="/" className="cb-back2">‹ Kembali</Link>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>{kategori || 'Berita Acara'}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '1px' }}>Masukkan data riksa uji untuk mencari berita acara</div>
          </div>
        </div>
      </div>

      <main className="cb-main">
        <div className="cb-wrap" style={results && results.length > 0 ? { maxWidth: '1200px' } : {}}>

          {/* Search Card - Keep it narrow and centered */}
          <div style={{ maxWidth: '600px', margin: '0 auto 20px auto' }}>
            <div className="cb-card" style={{ padding: '24px', marginBottom: '20px' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>🔍 Cari Berita Acara</div>

            <div className="cb-info">
              <span>ℹ️</span>
              <span>Masukkan <strong>Nama Perusahaan</strong>, <strong>Tanggal Inspeksi</strong>, dan <strong>Kode Akses</strong> untuk menarik data Berita Acara</span>
            </div>

            <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="cb-label">Nama Perusahaan</label>
                <input className="cb-input" placeholder="cth: PT Maju Bersama" value={perusahaan} onChange={e => setPerusahaan(e.target.value)} />
              </div>
              <div className="cb-grid2">
                <div>
                  <label className="cb-label">Tanggal Inspeksi</label>
                  <input type="date" className="cb-input" value={tglInspeksi} onChange={e => setTglInspeksi(e.target.value)} />
                </div>
                <div>
                  <label className="cb-label">Kode Akses</label>
                  <input className="cb-input" style={{ fontFamily: 'monospace', letterSpacing: '0.08em' }} placeholder="Masukkan kode akses" value={kodeAkses} onChange={e => setKodeAkses(e.target.value)} />
                </div>
              </div>
              {error && <div className="cb-error">⚠️ {error}</div>}
              <button type="submit" className="cb-btn-primary" disabled={loading}>
                {loading ? '⏳ Mencari data...' : 'Tampilkan Berita Acara'}
              </button>
            </form>
          </div>
        </div>

          {/* Results */}
          {results !== null && (
            results.length === 0 ? (
              <div className="cb-card" style={{ padding: '48px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
                <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '14px', marginBottom: '6px' }}>Data tidak ditemukan</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Periksa kembali nama perusahaan, tanggal inspeksi, dan kode akses</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, paddingLeft: '2px' }}>
                  Ditemukan <strong style={{ color: '#1e293b' }}>{results.length}</strong> Berita Acara Riksa Uji:
                </div>

                <div className="cb-table-wrap">
                  <div style={{ overflowX: 'auto' }}>
                    <table className="cb-table">
                      <thead className="cb-thead">
                        <tr>
                          {['NO', 'NAMA ALAT', 'JENIS', 'STATUS', 'TGL INSPEKSI', 'TGL EXPIRE', 'MERK / TYPE', 'NO SERI', 'TAHUN', 'KAPASITAS', 'LOKASI', 'AKSI'].map(h => (
                            <th key={h} className="cb-th">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((r, i) => {
                          const dynamicStatus = getStatusFromExpiry(r.tanggal_expire)
                          const isExpired = dynamicStatus === 'EXPIRED'
                          const days = parseInt(dynamicStatus)
                          const isCritical = isExpired || (!isNaN(days) && days <= 14)
                          const isWarning = !isExpired && !isNaN(days) && days > 14 && days <= 30
                          const isSoon = !isExpired && !isNaN(days) && days > 40 && days <= 90

                          let statusCls = 'cb-status cb-status-ok'
                          if (isExpired) statusCls = 'cb-status cb-status-expired'
                          else if (isCritical) statusCls = 'cb-status cb-status-critical'
                          else if (isWarning) statusCls = 'cb-status cb-status-warning'
                          else if (isSoon) statusCls = 'cb-status cb-status-soon'

                          const rowCls = `cb-tr ${isExpired ? 'cb-row-expired' : isCritical ? 'cb-row-critical' : isWarning ? 'cb-row-warning' : isSoon ? 'cb-row-soon' : 'cb-row-ok'}`

                          return (
                            <tr key={r.id} className={rowCls}>
                              <td className="cb-td" style={{ color: '#94a3b8', fontWeight: 600, fontSize: '11px' }}>{i + 1}</td>
                              <td className="cb-td" style={{ fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', fontSize: '12px', textTransform: 'uppercase' }}>{r.nama}</td>
                              <td className="cb-td">
                                <span className="cb-badge-jenis">{JENIS_SHORT[r.jenis] || 'PAA'}</span>
                              </td>
                              <td className="cb-td">
                                <span className={statusCls}>{dynamicStatus}</span>
                              </td>
                              <td className="cb-td" style={{ color: '#475569', fontWeight: 500, whiteSpace: 'nowrap', fontSize: '12px' }}>{r.tanggal_inspeksi}</td>
                              <td className="cb-td" style={{ color: '#475569', fontWeight: 500, whiteSpace: 'nowrap', fontSize: '12px' }}>{r.tanggal_expire}</td>
                              <td className="cb-td" style={{ color: '#334155', fontWeight: 500, whiteSpace: 'nowrap', fontSize: '12px' }}>{r.merk_type}</td>
                              <td className="cb-td" style={{ color: '#475569', fontFamily: 'monospace', whiteSpace: 'nowrap', fontSize: '11px' }}>{r.no_seri}</td>
                              <td className="cb-td" style={{ color: '#64748b', whiteSpace: 'nowrap', fontSize: '12px' }}>{r.tahun}</td>
                              <td className="cb-td" style={{ color: '#64748b', whiteSpace: 'nowrap', fontSize: '12px' }}>{r.kapasitas || '—'}</td>
                              <td className="cb-td" style={{ color: '#64748b', whiteSpace: 'nowrap', fontSize: '11px' }}>{r.lokasi}</td>
                              <td className="cb-td">
                                <button className="cb-btn-pdf-small" onClick={() => handleViewPdf(r)}>📄 Download PDF</button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  )
}

export default function CariPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f6f9', fontFamily: 'Inter, sans-serif', color: '#94a3b8' }}>
        Memuat...
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
