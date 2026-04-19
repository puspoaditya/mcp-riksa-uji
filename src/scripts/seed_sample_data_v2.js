const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const { addDays, subDays, format, differenceInDays } = require('date-fns');

// Use environment variables or fallback to defaults found in .env.local.example
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gsozkonfxmdlcqhpuzlw.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdzb3prb25meG1kbGNxaHB1emx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQwMTQ1NSwiZXhwIjoyMDkxOTc3NDU1fQ.8Ow9F-F_iZA3ZMHBBHSXb7DoOtXQR7XnU7QhPMAi14I';

const supabase = createClient(supabaseUrl, supabaseKey);

const categories = [
  {
    name: 'Bejana Tekan & Tangki Timbun',
    items: ['Air Receiver Tank', 'Tangki Solar', 'Filter Water Tank', 'LPG Storage Tank'],
    scope: 'Pemeriksaan Dokumen, Pemeriksaan Visual, Pemeriksaan Dimensi, Pengujian Tidak Merusak (NDT), Analisa Kekuatan Konstruksi, Pengujian Air Penuh (Full Water Test), Pengujian Kebocoran (Leak Test), Pengujian Safety Valve & Alat-Alat Safety'
  },
  {
    name: 'Pesawat Uap',
    items: ['Boiler Pipa Api', 'Boiler Pipa Air', 'Steam Header', 'Autoclave'],
    scope: 'Pemeriksaan Dokumen, Pemeriksaan Visual, Pengujian Tidak Merusak (NDT), Pemeriksaan Bahan (bila diperlukan), Analisa Kekuatan Konstruksi, Pengujian Tekanan (Hydrostatic Test), Pengujian Tekanan (Steam Test), Pengujian Safety Valve & Alat-Alat Safety'
  },
  {
    name: 'Pesawat Angkat & Pesawat Angkut',
    items: ['Forklift Diesel', 'Mobile Crane', 'Overhead Crane', 'Passenger Hoist'],
    scope: 'Pemeriksaan Dokumen, Pemeriksaan Visual, Pemeriksaan Wire Rope / Chain / Hydraulic, Pengujian NDT (Bila Diperlukan), Pengujian Fungsi / Mekanik, Pengujian Beban, Pengujian Alat-Alat Safety, Pengujian Jalan (Running Test)'
  },
  {
    name: 'Pesawat Tenaga & Produksi',
    items: ['Genset Diesel', 'Mesin Bubut', 'Compressor', 'Mesin Milling'],
    scope: 'Pemeriksaan Dokumen, Pemeriksaan Visual, Pengukuran Kebisingan, Pengukuran Penerangan (Lux), Pengukuran Getaran (Vibrasi), Indikator Tekanan Oli / Pelumasan, Pengukuran Grounding, Pengujian alat-alat kontrol & Safety, Pengujian Jalan (Running Test), System Pendinginan'
  },
  {
    name: 'Instalasi Proteksi Kebakaran',
    items: ['Sistem Hydrant', 'Sistem Sprinkler', 'Fire Alarm System', 'APAR'],
    scope: 'Pemeriksaan Dokumen, Pemeriksaan Visual, Pengujian System Alarm, Pengukuran / Pengujian Tekanan Pada Nozzle Hydrant, Pengujian System Pompa Hydrant, Test Foult / Uji detector & Sprinkler'
  },
  {
    name: 'Instalasi Penyalur Petir',
    items: ['Penyalur Petir Konvensional', 'Penyalur Petir Elektrostatik', 'Earthing System'],
    scope: 'Pemeriksaan Dokumen (Gambar Lay-out & Single line diagram), Pemeriksaan Visual, Pengukuran tahanan pentanahan'
  },
  {
    name: 'Instalasi Listrik',
    items: ['Panel MDP', 'Trafo Step Down', 'Instalasi Listrik Pabrik', 'Kabel Power Tegangan Menengah'],
    scope: 'Pemeriksaan Dokumen (Gambar Lay-out & Single line diagram), Pemeriksaan Visual, Pengukuran tahanan pentanahan, Pemeriksaan kondisi panel dengan infrared thermograph'
  },
  {
    name: 'Elevator & Eskalator',
    items: ['Passenger Lift', 'Service Lift', 'Escalator', 'Travelator'],
    scope: 'Pemeriksaan Dokumen, Pemeriksaan Visual, Bobot Imbang, Rel Pemandu, Peredam, Pengujian ARD, Switch Fire, Pengujian Governor, Switch Tension, Pengukuran Wire Rope, Pengujian mekanik pengaman Lift Elevator, Pengujian Beban & Jarak Runway Counterweight, Pengujian Final Switch, Safety Door, Emergency, Pemeriksaan Instalasi Listrik & Penerangan, Pemeriksaan Alat Komunikasi Lift Elevator, Fungsi Peredaman & Kecepatan Lift'
  }
];

const companies = [
  { name: 'PT Indonesia Power', code: 'IP123', address: 'Jl. Gatot Subroto No. 18, Jakarta Selatan' },
  { name: 'PT Pertamina (Persero)', code: 'PERTA', address: 'Jl. Medan Merdeka Timur No. 1A, Jakarta Pusat' },
  { name: 'PT Unilever Indonesia', code: 'ULIVE', address: 'BSD City, Tangerang, Banten' },
  { name: 'PT Astra Honda Motor', code: 'AHM24', address: 'Kawasan Industri MM2100, Cikarang' },
  { name: 'PT Telkom Indonesia', code: 'TELKO', address: 'Jl. Japati No. 1, Bandung, Jawa Barat' }
];

const inspectors = ['Budi Santoso, S.T.', 'Andri Wijaya, S.T.', 'Siti Aminah, A.Md.', 'Dedi Kurniawan'];
const witnesses = ['Iwan Setiawan', 'Agus Prayitno', 'Rina Marlina', 'Hendra Kusuma'];

async function seed() {
  console.log('--- SEEDING STARTED ---');

  // 1. Get Petugas user
  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('role', 'PETUGAS')
    .limit(1);

  if (pErr || !profiles || profiles.length === 0) {
    console.error('No PETUGAS user found. Please ensure a user with PETUGAS role exists.');
    return;
  }
  const petugas = profiles[0];
  console.log(`Using Petugas: ${petugas.email}`);

  // 2. Seed Perusahaan Access
  console.log('Seeding Perusahaan Access...');
  for (const comp of companies) {
    const { error: cErr } = await supabase
      .from('perusahaan_access')
      .upsert({ 
        nama_perusahaan: comp.name, 
        kode_akses: comp.code 
      }, { onConflict: 'nama_perusahaan' });
    
    if (cErr) console.error(`Error Upserting ${comp.name}:`, cErr.message);
  }

  // 3. Clear old sample data (optional, but keep it for clean state)
  // console.log('Cleaning old data...');
  // await supabase.from('alat').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // 4. Generate Records
  const today = new Date();
  const sampleData = [];
  
  // Create 40 records (5 for each of the 8 categories)
  for (let catIdx = 0; catIdx < categories.length; catIdx++) {
    const category = categories[catIdx];
    
    for (let i = 0; i < 5; i++) {
      const comp = companies[i % companies.length];
      const itemName = category.items[i % category.items.length];
      
      // Distribute statuses: 1 Expired, 1 Warning, 3 Active
      let expireDate;
      if (i === 0) {
        expireDate = subDays(today, 15 + (catIdx * 2)); // Expired recently
      } else if (i === 1) {
        expireDate = addDays(today, 10 + (catIdx * 3)); // Expiring soon
      } else {
        expireDate = addDays(today, 180 + (i * 30)); // Active long term
      }

      const inspectionDate = subDays(expireDate, 365);
      const diff = differenceInDays(expireDate, today);
      
      let statusStr = '';
      if (diff < 0) {
        statusStr = 'EXPIRED';
      } else if (diff <= 30) {
        statusStr = `${diff} Hari`;
      } else {
        statusStr = `${Math.floor(diff / 30)} Bulan`;
      }

      const record = {
        nama: `${itemName} Unit ${catIdx + 1}${i + 1}`,
        jenis: category.name,
        status: statusStr,
        tanggal_inspeksi: format(inspectionDate, 'yyyy-MM-dd'),
        tanggal_expire: format(expireDate, 'yyyy-MM-dd'),
        merk_type: `Merk-${String.fromCharCode(65 + catIdx)}-${100 + i}`,
        no_seri: `SN-${2024000 + (catIdx * 10) + i}`,
        tahun: 2015 + (i * 2),
        kapasitas: catIdx === 0 ? '2000 Liter' : (catIdx === 2 ? '5 Ton' : (catIdx === 3 ? '1000 kVA' : 'Standard')),
        lokasi: `Area ${['Produksi', 'Utilitas', 'Gudang', 'Lantai 1', 'Outdoor'][i % 5]}`,
        user_id: petugas.id,
        user_email: petugas.email,
        no_laporan: `BA/MCP/${['BT', 'PU', 'PAA', 'PTP', 'PK', 'PP', 'IL', 'EE'][catIdx]}/${2024}/${100 + (catIdx * 5) + i}`,
        jenis_pemeriksaan: i % 2 === 0 ? 'Berkala' : 'Pertama',
        pemeriksaan_pengujian: category.scope,
        alamat_perusahaan: comp.address,
        hasil_pemeriksaan: 'MEMENUHI SYARAT K3',
        diperiksa_oleh: inspectors[i % inspectors.length],
        disaksikan_oleh: witnesses[i % witnesses.length],
        pakai_cap: true,
        metadata: {
          nama_perusahaan: comp.name,
          catatan: [
            'Pemeriksaan dan Pengujian dilakukan sesuai dengan Permenaker No. 37 Tahun 2016.',
            'Pemeriksaan dan Pengujian dilakukan sesuai dengan UU Uap Tahun 1930 dan Permenaker No. 37 Tahun 2016.',
            'Pemeriksaan dan Pengujian dilakukan sesuai dengan Permenaker No. 08 Tahun 2020.',
            'Pemeriksaan dan Pengujian dilakukan sesuai dengan Permenaker No. 38 Tahun 2016.',
            'Pemeriksaan dan Pengujian dilakukan sesuai dengan Permenaker No. 04 Tahun 1980 & Permenaker No. 02 Tahun 1983.',
            'Pemeriksaan dan Pengujian dilakukan sesuai dengan Permenaker No. 31 Tahun 2015.',
            'Pemeriksaan dan Pengujian dilakukan sesuai dengan Permenaker No. 33 Tahun 2015 & Permenaker No. 12 Tahun 2015.',
            'Pemeriksaan dan Pengujian dilakukan sesuai dengan Permenaker No. 06 Tahun 2017.',
          ][catIdx]
        }
      };
      
      sampleData.push(record);
    }
  }

  console.log(`Inserting ${sampleData.length} records...`);
  const { data, error } = await supabase
    .from('alat')
    .insert(sampleData)
    .select();

  if (error) {
    console.error('Error inserting data:', error);
  } else {
    console.log(`Successfully inserted ${data?.length || 0} records!`);
    console.log('Sample companies and codes for testing search:');
    companies.forEach(c => console.log(`- ${c.name}: ${c.code}`));
  }
}

seed();
