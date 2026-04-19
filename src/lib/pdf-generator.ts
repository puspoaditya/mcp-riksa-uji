'use client'

import { Alat } from '@/types'
import { LOGO_BASE64 } from './logoBase64'

// ─── Generate PDF dari data alat menggunakan jsPDF ───────────────────────
export async function generatePDF(alat: Alat): Promise<void> {
  const { default: jsPDF } = await import('jspdf')

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  
  // Basic geometry mirroring the official template
  const marginL = 38
  const marginL2 = 98

  // ── Header (Kop Surat) ──
  // Original extracted dimensions: 495x139 pixels 
  // Based on target PDF bounding box: Width = 49.4 mm, Height = 13.8 mm, X = 39 mm, Y = 12.7 mm
  const logoW = 49.4
  const logoH = 13.8
  const logoX = 39.5
  const logoY = 12.7
  doc.addImage(LOGO_BASE64, 'PNG', logoX, logoY, logoW, logoH)

  // ── Title Section ──
  doc.setTextColor(0, 0, 0)
  doc.setFont('times', 'bold')
  doc.setFontSize(14.6)
  doc.text('BERITA ACARA RIKSA UJI', pageW / 2 + 10, 26.6, { align: 'center' })

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(9)
  doc.text('Minute of Inspection Test', pageW / 2 + 10, 31.5, { align: 'center' })

  // Category
  doc.setFont('times', 'bold')
  doc.setFontSize(10)
  doc.text((alat.jenis || 'PESAWAT TENAGA & PRODUKSI').toUpperCase(), pageW / 2 + 10, 36.6, { align: 'center' })
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.text(`No. ${alat.no_laporan || `BA-${alat.id.substring(0, 6).toUpperCase()}`}`, pageW / 2 + 10, 41.4, { align: 'center' })

  // ── Checkboxes Section ──
  const checkY1 = 48.2
  const checkY2 = 52.1
  const drawCheck = (label: string, x: number, y: number, checked: boolean) => {
    doc.setLineWidth(0.2)
    doc.setDrawColor(0, 0, 0)
    doc.rect(x, y - 3, 3, 3)
    if (checked) {
      doc.setLineWidth(0.5)
      doc.line(x + 0.5, y - 1.5, x + 1.2, y - 0.2)
      doc.line(x + 1.2, y - 0.2, x + 2.8, y - 3.2)
    }
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(label, x + 4.5, y)
  }

  // Inferred states
  const isPertama = alat.jenis_pemeriksaan === 'PEMERIKSAAN PERTAMA'
  const isUlang = alat.jenis_pemeriksaan === 'PEMERIKSAAN ULANG'
  const isBerkala = alat.jenis_pemeriksaan === 'PEMERIKSAAN BERKALA' || (!isPertama && !isUlang)

  drawCheck('Pemeriksaan pertama', 65, checkY1, isPertama)
  drawCheck('Pemeriksaan ulang', 110, checkY1, isUlang)
  drawCheck('Pemeriksaan berkala', 150, checkY1, isBerkala)

  drawCheck('Pelaksanaan', 65, checkY2, true)
  drawCheck('Ditunda', 110, checkY2, false)
  drawCheck('Dibatalkan', 150, checkY2, false)

  // ── Opening Sentence ──
  doc.setFont('helvetica', 'normal')
  const dateObj = alat.tanggal_inspeksi ? new Date(alat.tanggal_inspeksi) : new Date()
  const weekdays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const day = weekdays[dateObj.getDay()]
  const dateNum = dateObj.getDate()
  const month = months[dateObj.getMonth()]
  const year = dateObj.getFullYear()

  let currY = 59.5
  doc.text(`Pada hari ini, ${day} Tanggal ${dateNum} Bulan ${month} Tahun ${year} Telah dilakukan pekerjaan riksa uji :`, marginL, currY)

  // ── Object Data Definitions (Colon Aligned) ──
  currY += 7
  const addField = (labelId: string, labelEn: string, value: string) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(labelId, marginL, currY)
    doc.text(':', marginL2 - 3, currY)
    doc.text(value.toUpperCase(), marginL2, currY, { maxWidth: pageW - marginL2 - 15 })
    
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    doc.text(labelEn, marginL, currY + 4)
    currY += 10 // increase space due to English subtext
  }

  addField('OBJEK PERIKSA', 'Inspection object', alat.nama)
  addField('NAMA PERUSAHAAN', 'Name of Company', alat.metadata?.nama_perusahaan ? String(alat.metadata.nama_perusahaan) : '-')
  addField('ALAMAT PERUSAHAAN', 'Address of Company', alat.alamat_perusahaan || '-')
  addField('PABRIK PEMBUAT / TAHUN', 'Manufacture / Year', `${alat.metadata?.pabrik_pembuat ? String(alat.metadata.pabrik_pembuat) : '-'} / ${alat.tahun}`)
  
  // Capacity string logic
  let capStr = ''
  if (alat.kapasitas && alat.kapasitas.length > 0) {
    capStr = ` / Kapasitas Angkat : ${alat.kapasitas}`
  }
  addField('MODEL / NOMOR SERI / KAPASITAS', 'Type / Serial Number / Capacity', 
    `MODEL : ${alat.merk_type || '-'} / NO SERI : ${alat.no_seri || '-'}${capStr}`
  )
  addField('LOKASI PEMERIKSAAN', 'Location of Inspection', alat.lokasi || '-')

  // ── Lingkup Pekerjaan ──
  currY += 3
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Lingkup Pekerjaan', marginL, currY)
  currY += 5

  const scopes = Object.entries(alat.metadata || {})
    .filter(([k, v]) => typeof v === 'boolean' && k !== 'nama_perusahaan' && k !== 'pabrik_pembuat')
    .map(([k, v]) => ({ label: String(k).replace(/_/g, ' '), checked: v as boolean }))

  const colA = marginL + 16
  const colB = marginL + 85
  
  for (let i = 0; i < scopes.length; i += 2) {
    if (scopes[i]) {
      drawCheck(scopes[i].label, colA, currY, scopes[i].checked)
    }
    if (scopes[i+1]) {
      drawCheck(scopes[i+1].label, colB, currY, scopes[i+1].checked)
    }
    currY += 4.5
  }

  // ── Hasil Pemeriksaan dan Pengujian ──
  currY += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('Hasil Pemeriksaan dan Pengujian:', marginL, currY)

  doc.setFont('helvetica', 'italic')
  const hasilText = alat.hasil_pemeriksaan && alat.hasil_pemeriksaan !== 'MEMENUHI SYARAT K3' 
    ? alat.hasil_pemeriksaan 
    : `Dari hasil pemeriksaan dan pengujian mesin ${alat.nama} dalam kondisi baik dan normal, memenuhi persyaratan Keselamatan dan Kesehatan Kerja.`
    
  // We use slightly smaller text for fitting
  doc.setFontSize(8)
  const textLines = doc.splitTextToSize(hasilText, pageW - marginL - 20)
  doc.text(textLines, marginL, currY + 5)
  currY += (textLines.length * 4) + 12

  // ── Catatan ──
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  
  // Use metadata.catatan if available, otherwise fallback to pemeriksaan_pengujian
  const catatanText = (alat.metadata?.catatan) 
    ? String(alat.metadata.catatan)
    : (alat.pemeriksaan_pengujian && alat.pemeriksaan_pengujian !== 'DILAKSANAKAN') 
      ? alat.pemeriksaan_pengujian 
      : '-'
      
  // Format catatan string, using splitTextToSize to allow it to wrap properly
  if (catatanText !== '-') {
     const catatanTitle = 'Catatan / Note :'
     doc.text(catatanTitle, marginL, currY)
     const noteLines = doc.splitTextToSize(catatanText, pageW - marginL - 30)
     doc.text(noteLines, marginL + 25, currY)
     currY += noteLines.length * 4
  } else {
     doc.text('Catatan / Note :   -', marginL, currY)
     currY += 4
  }

  // Space before signature block
  currY += 15
  if (currY > pageH - 55) {
     doc.addPage()
     currY = 30
  }

  // ── Signatures ──
  const sigCol1 = marginL + 16
  const sigCol2 = marginL + 85

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Diperiksa oleh', sigCol1, currY)
  doc.text('Disaksikan oleh', sigCol2, currY)

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.text('Inspection by', sigCol1 + 2, currY + 4)
  doc.text('Witness by', sigCol2 + 2, currY + 4)

  const sigNameY = currY + 22
  doc.setFont('helvetica', 'bold')
  const inspector = alat.diperiksa_oleh || '..................................................'
  const witness = alat.disaksikan_oleh || '..................................................'
  
  doc.text(`( ${inspector} )`, sigCol1 - 5, sigNameY)
  doc.text(`( ${witness} )`, sigCol2 - 5, sigNameY)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('Name & Signature', sigCol1 + 3, sigNameY + 4)
  doc.text('Name & Signature', sigCol2 + 3, sigNameY + 4)

  // ── Cap Perusahaan ──
  if (alat.pakai_cap) {
    doc.setDrawColor(30, 30, 150)
    doc.setLineWidth(0.8)
    // Placed slightly underneath the inspector role
    doc.rect(sigCol1 - 8, currY + 6, 26, 18) 
    doc.setFontSize(6)
    doc.setTextColor(30, 30, 150)
    doc.text('CAP PERUSAHAAN', sigCol1 + 5, currY + 15, { align: 'center', angle: 15 })
  }

  // ── Footer Fixed at Bottom ──
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  const fn1 = 'Hasil pemeriksaan dan pengujian ini adalah sesuai dengan kenyataan yang ada pada saat dilakukannya pemeriksaan dan pengujian terhadap peralatan tersebut, tanpa dipengaruhi oleh pihak manapun juga.'
  const fnLines = doc.splitTextToSize(fn1, pageW - marginL - 25)
  // Adjusted explicitly to matched coordinate values
  doc.text(fnLines, marginL, 245)

  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'bold')
  doc.text('Berita acara dari perusahaan penguji dapat digunakan sebagai bukti untuk konsumen', pageW / 2 + 10, 255, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.text('This minute from tester Company serve the purpose of the evidence for Costumer', pageW / 2 + 10, 258.5, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.text('OFFICE : JL. RAYA RAWA MULYA NO. 69 MUSTIKA JAYA - KOTA BEKASI 17158', pageW / 2 + 10, 264, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.text('Phone : 021 - 8252 487 / 8260 8514, E-mail : multi_cipta@yahoo.com', pageW / 2 + 10, 268.5, { align: 'center' })

  // ── Save ──
  doc.save(`BA-${alat.nama.replace(/\s+/g, '-')}-${alat.no_seri}.pdf`)
}
