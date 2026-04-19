const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const { addDays, subDays, format } = require('date-fns');

// Use values from .env.local.example if .env.local missing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gsozkonfxmdlcqhpuzlw.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdzb3prb25meG1kbGNxaHB1emx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQwMTQ1NSwiZXhwIjoyMDkxOTc3NDU1fQ.8Ow9F-F_iZA3ZMHBBHSXb7DoOtXQR7XnU7QhPMAi14I';

const supabase = createClient(supabaseUrl, supabaseKey);

const categories = [
  'Bejana Tekan & Tangki Timbun',
  'Pesawat Uap',
  'Pesawat Angkat & Pesawat Angkut',
  'Pesawat Tenaga & Produksi',
  'Instalasi Proteksi Kebakaran',
  'Instalasi Penyalur Petir',
  'Instalasi Listrik',
  'Elevator & Eskalator'
];

const perusahaanList = [
  'PT Maju Bersama',
  'PT Sejahtera Abadi',
  'CV Surya Kencana',
  'PT Bakrie Brothers',
  'PT Indofood CBP',
  'PT Astra International'
];

async function seed() {
  console.log('Fetching Petugas user...');
  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('role', 'PETUGAS')
    .limit(1);

  if (pErr || !profiles || profiles.length === 0) {
    console.error('No PETUGAS user found in profiles table. Please make sure at least one user has the PETUGAS role.');
    return;
  }

  const petugas = profiles[0];
  console.log(`Found Petugas: ${petugas.email} (${petugas.id})`);

  const today = new Date();
  const sampleData = [];

  // Generate 15 sample records
  for (let i = 0; i < 15; i++) {
    const category = categories[i % categories.length];
    const perusahaan = perusahaanList[i % perusahaanList.length];
    
    // Distribute statuses: 5 expired, 5 warning, 5 active
    let expireDate;
    if (i < 5) {
      // Expired: 10-50 days ago
      expireDate = subDays(today, 10 + i * 8);
    } else if (i < 10) {
      // Warning: 5-25 days from now
      expireDate = addDays(today, 5 + (i - 5) * 4);
    } else {
      // Active: 60-360 days from now
      expireDate = addDays(today, 60 + (i - 10) * 60);
    }

    const inspectionDate = subDays(expireDate, 365); // Assume 1 year validity

    const record = {
      nama: `${category} Unit #${i + 1}`,
      jenis: category,
      status: i < 5 ? 'EXPIRED' : (i < 10 ? `${differenceInDays(expireDate, today)} Hari` : `${Math.floor(differenceInDays(expireDate, today)/30)} Bulan`),
      tanggal_inspeksi: format(inspectionDate, 'yyyy-MM-dd'),
      tanggal_expire: format(expireDate, 'yyyy-MM-dd'),
      merk_type: `Merk-${String.fromCharCode(65 + (i % 26))}${i * 10}`,
      no_seri: `SN-${2024000 + i}`,
      tahun: 2018 + (i % 6),
      kapasitas: `${(i + 1) * 100} Kg`,
      lokasi: `Area ${['Produksi', 'Gudang', 'Workshop', 'Outdoor'][i % 4]}`,
      user_id: petugas.id,
      metadata: {
        nama_perusahaan: perusahaan,
        no_laporan: `BA-R-2024-${100 + i}`
      }
    };

    sampleData.push(record);
  }

  console.log('Inserting sample data...');
  const { data, error } = await supabase
    .from('alat')
    .insert(sampleData)
    .select();

  if (error) {
    console.error('Error inserting data:', error);
  } else {
    console.log(`Successfully inserted ${data.length} records!`);
  }
}

// Helper to calculate diff days for status string
function differenceInDays(d1, d2) {
  return Math.ceil((d1 - d2) / (1000 * 60 * 60 * 24));
}

seed();
