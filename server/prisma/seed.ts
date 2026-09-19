import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { hitungStatusBbU, hitungStatusTbU, hitungStatusBbTb } from '../src/shared/utils/zScoreCalculator';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Memulai seeding akun dummy demo posyandu...');

  // 1. Bersihkan jika demo sudah ada sebelumnya
  const existingKader = await prisma.kader.findFirst({
    where: {
      OR: [
        { email: 'demo@gmail.com' },
        { username: 'demo' },
      ],
    },
    include: { posyandu: true },
  });

  if (existingKader) {
    console.log(`Menghapus posyandu dan akun demo lama (${existingKader.email})...`);
    await prisma.posyandu.delete({
      where: { id: existingKader.posyanduId },
    });
  }

  // 2. Buat Posyandu Demo
  const posyandu = await prisma.posyandu.create({
    data: {
      nama: 'Posyandu Melati Indah (Demo)',
      desa: 'Sukamaju',
      kecamatan: 'Cikarang Pusat',
      alamat: 'Jl. Melati Raya No. 12 RT 03/05',
    },
  });
  console.log(`✅ Posyandu dibuat: ${posyandu.nama} (${posyandu.id})`);

  // 3. Buat Akun Owner (demo)
  const hashedPassword = await bcrypt.hash('password123', 12);
  const kaderOwner = await prisma.kader.create({
    data: {
      id: uuidv4(),
      nama: 'Kader Demo SIPANDU',
      username: 'demo',
      email: 'demo@gmail.com',
      password: hashedPassword,
      posyanduId: posyandu.id,
      role: 'OWNER',
      isActive: true,
    },
  });
  console.log(`✅ Akun Owner dibuat: ${kaderOwner.nama} (${kaderOwner.email}) / username: demo`);

  // 4. Buat Periode Pelayanan dari Jan 2025 s/d September 2026
  const periodesData = [
    { bulan: 1, tahun: 2025, nama: 'Periode Pelayanan Januari 2025' },
    { bulan: 2, tahun: 2025, nama: 'Periode Pelayanan Februari 2025' },
    { bulan: 3, tahun: 2025, nama: 'Periode Pelayanan Maret 2025' },
    { bulan: 4, tahun: 2025, nama: 'Periode Pelayanan April 2025' },
    { bulan: 5, tahun: 2025, nama: 'Periode Pelayanan Mei 2025' },
    { bulan: 6, tahun: 2025, nama: 'Periode Pelayanan Juni 2025' },
    { bulan: 7, tahun: 2025, nama: 'Periode Pelayanan Juli 2025' },
    { bulan: 8, tahun: 2025, nama: 'Periode Pelayanan Agustus 2025' },
    { bulan: 9, tahun: 2025, nama: 'Periode Pelayanan September 2025' },
    { bulan: 10, tahun: 2025, nama: 'Periode Pelayanan Oktober 2025' },
    { bulan: 11, tahun: 2025, nama: 'Periode Pelayanan November 2025' },
    { bulan: 12, tahun: 2025, nama: 'Periode Pelayanan Desember 2025' },
    { bulan: 1, tahun: 2026, nama: 'Periode Pelayanan Januari 2026' },
    { bulan: 2, tahun: 2026, nama: 'Periode Pelayanan Februari 2026' },
    { bulan: 3, tahun: 2026, nama: 'Periode Pelayanan Maret 2026' },
    { bulan: 4, tahun: 2026, nama: 'Periode Pelayanan April 2026' },
    { bulan: 5, tahun: 2026, nama: 'Periode Pelayanan Mei 2026' },
    { bulan: 6, tahun: 2026, nama: 'Periode Pelayanan Juni 2026' },
    { bulan: 7, tahun: 2026, nama: 'Periode Pelayanan Juli 2026' },
    { bulan: 8, tahun: 2026, nama: 'Periode Pelayanan Agustus 2026' },
    { bulan: 9, tahun: 2026, nama: 'Periode Pelayanan September 2026' },
  ];

  for (const p of periodesData) {
    await prisma.periodePelayanan.create({
      data: {
        posyanduId: posyandu.id,
        nama: p.nama,
        bulan: p.bulan,
        tahun: p.tahun,
        tanggal: new Date(Date.UTC(p.tahun, p.bulan - 1, 10)),
        status: (p.tahun === 2026 && p.bulan === 9) ? 'AKTIF' : 'SELESAI',
        catatan: `Layanan rutin posyandu ${p.nama}`,
      },
    });
  }
  console.log(`✅ ${periodesData.length} Periode Pelayanan berhasil dibuat (Januari 2025 - September 2026).`);

  // 5. Data 25 Balita
  const balitasRaw = [
    { nama: 'Ahmad Rayyan Al-Fatih', jk: 'L' as const, tglLahir: '2024-03-12', ibu: 'Siti Nurhaliza', nik: '3216011203240001' },
    { nama: 'Anindita Keisha Zahra', jk: 'P' as const, tglLahir: '2024-01-20', ibu: 'Ratna Dewi', nik: '3216012001240002' },
    { nama: 'Bilal Arkananta Putra', jk: 'L' as const, tglLahir: '2023-11-05', ibu: 'Indah Permata', nik: '3216010511230003' },
    { nama: 'Callista Putri Andini', jk: 'P' as const, tglLahir: '2024-05-18', ibu: 'Dewi Sartika', nik: '3216011805240004' },
    { nama: 'Daffa Ibnu Hafidz', jk: 'L' as const, tglLahir: '2023-08-14', ibu: 'Nurul Hidayah', nik: '3216011408230005' },
    { nama: 'Elvira Salma Nabila', jk: 'P' as const, tglLahir: '2024-02-28', ibu: 'Rina Kusuma', nik: '3216012802240006' },
    { nama: 'Fathir Alvaro Pratama', jk: 'L' as const, tglLahir: '2023-10-10', ibu: 'Maya Anggraini', nik: '3216011010230007' },
    { nama: 'Ghaida Nur Azizah', jk: 'P' as const, tglLahir: '2024-04-03', ibu: 'Kartika Sari', nik: '3216010304240008' },
    { nama: 'Hafizh Rafa Danendra', jk: 'L' as const, tglLahir: '2023-07-22', ibu: 'Dian Fitriani', nik: '3216012207230009' },
    { nama: 'Inara Syakila Azzahra', jk: 'P' as const, tglLahir: '2024-06-15', ibu: 'Wulan Guritno', nik: '3216011506240010' },
    { nama: 'Jevon Keenan Alfarizqi', jk: 'L' as const, tglLahir: '2023-09-09', ibu: 'Ayu Lestari', nik: '3216010909230011' },
    { nama: 'Kanaya Ayudia Inara', jk: 'P' as const, tglLahir: '2024-03-25', ibu: 'Mega Utami', nik: '3216012503240012' },
    { nama: 'Kenzo Althafandra', jk: 'L' as const, tglLahir: '2023-12-01', ibu: 'Nadia Safitri', nik: '3216010112230013' },
    { nama: 'Laila Husna Shakila', jk: 'P' as const, tglLahir: '2024-05-02', ibu: 'Tri Wahyuni', nik: '3216010205240014' },
    { nama: 'Malik Ibrahim Al-Ghifari', jk: 'L' as const, tglLahir: '2023-06-17', ibu: 'Sri Handayani', nik: '3216011706230015' },
    { nama: 'Nadhira Citra Kirana', jk: 'P' as const, tglLahir: '2024-01-11', ibu: 'Eka Pratiwi', nik: '3216011101240016' },
    { nama: 'Omar Zhafran Athariz', jk: 'L' as const, tglLahir: '2023-05-08', ibu: 'Rini Astuti', nik: '3216010805230017' },
    { nama: 'Putri Alesha Maharani', jk: 'P' as const, tglLahir: '2024-04-29', ibu: 'Lilis Suryani', nik: '3216012904240018' },
    { nama: 'Qaid Rayan Hamizan', jk: 'L' as const, tglLahir: '2023-10-27', ibu: 'Fitri Handayani', nik: '3216012710230019' },
    { nama: 'Raisa Dania Khadijah', jk: 'P' as const, tglLahir: '2024-02-14', ibu: 'Yuli Hastuti', nik: '3216011402240020' },
    { nama: 'Sultan Al-Fayyadh', jk: 'L' as const, tglLahir: '2023-08-30', ibu: 'Heni Kurnia', nik: '3216013008230021' },
    { nama: 'Talia Sabrina Azzahra', jk: 'P' as const, tglLahir: '2024-06-01', ibu: 'Desi Ratnasari', nik: '3216010106240022' },
    { nama: 'Umar Farouq Al-Basith', jk: 'L' as const, tglLahir: '2023-04-19', ibu: 'Eni Susilowati', nik: '3216011904230023' },
    { nama: 'Valerie Queensha Putri', jk: 'P' as const, tglLahir: '2024-03-08', ibu: 'Tanti Rahayu', nik: '3216010803240024' },
    { nama: 'Zayn Akhtar Maulana', jk: 'L' as const, tglLahir: '2023-11-23', ibu: 'Novita Sari', nik: '3216012311230025' },
  ];

  console.log('👶 Membuat 25 data balita dan riwayat pemeriksaan...');
  for (let idx = 0; idx < balitasRaw.length; idx++) {
    const b = balitasRaw[idx];
    const lahirDate = new Date(b.tglLahir);
    const rt = String((idx % 5) + 1).padStart(3, '0');
    const rw = '005';

    const balita = await prisma.balita.create({
      data: {
        posyanduId: posyandu.id,
        nama: b.nama,
        nik: b.nik,
        namaIbu: b.ibu,
        tanggalLahir: lahirDate,
        jenisKelamin: b.jk,
        alamat: `RT ${rt}/RW ${rw}, Dusun Sukamaju`,
        noHp: `0812${Math.floor(10000000 + Math.random() * 90000000)}`,
      },
    });

    // Buat pemeriksaan bulanan dari lahir (atau Jan 2025) sampai Jan 2026
    for (const p of periodesData) {
      const periksaDate = new Date(Date.UTC(p.tahun, p.bulan - 1, 12));
      if (periksaDate < lahirDate) continue; // Balita belum lahir

      // Hitung usia dalam bulan saat tanggal periksa
      const diffMonths = (periksaDate.getFullYear() - lahirDate.getFullYear()) * 12 + (periksaDate.getMonth() - lahirDate.getMonth());
      const usiaBulan = Math.max(0, diffMonths);

      // Variasi parameter pertumbuhan realistis standar KMS / WHO
      let bbBase = b.jk === 'L' ? 3.3 : 3.2;
      let tbBase = 50;
      if (usiaBulan <= 12) {
        bbBase += usiaBulan * 0.55;
        tbBase += usiaBulan * 2.1;
      } else if (usiaBulan <= 24) {
        bbBase += 12 * 0.55 + (usiaBulan - 12) * 0.22;
        tbBase += 12 * 2.1 + (usiaBulan - 12) * 1.0;
      } else {
        bbBase += 12 * 0.55 + 12 * 0.22 + (usiaBulan - 24) * 0.18;
        tbBase += 12 * 2.1 + 12 * 1.0 + (usiaBulan - 24) * 0.65;
      }

      // Berikan variasi gizi untuk beberapa anak (misal 2 anak agak kurus, 2 gemuk)
      let bbMod = 0;
      if (idx % 7 === 0) bbMod = -1.2; // Agak kurang
      else if (idx % 9 === 0) bbMod = 1.3; // Agak gemuk
      const beratBadan = Math.max(2.5, Number((bbBase + bbMod + (Math.sin(usiaBulan) * 0.15)).toFixed(2)));

      const tinggiBadan = Math.max(48, Number((tbBase + (Math.cos(usiaBulan) * 0.3)).toFixed(2)));
      const lingkarKepala = Number((34 + Math.min(16, usiaBulan * 0.5)).toFixed(1));
      const lingkarLengan = Number((11 + Math.min(5, usiaBulan * 0.2)).toFixed(1));

      const statusBbU = hitungStatusBbU(beratBadan, usiaBulan, b.jk);
      const statusTbU = hitungStatusTbU(tinggiBadan, usiaBulan, b.jk);
      const statusBbTb = hitungStatusBbTb(beratBadan, tinggiBadan, b.jk);

      const isBulanVitA = p.bulan === 2 || p.bulan === 8;
      const isBulanCacing = p.bulan === 2 || p.bulan === 8;

      await prisma.pemeriksaanBalita.create({
        data: {
          balitaId: balita.id,
          tanggalPeriksa: periksaDate,
          usiaBulan,
          beratBadan,
          tinggiBadan,
          lingkarKepala,
          lingkarLengan,
          statusBbU,
          statusTbU,
          statusBbTb,
          vitaminA: isBulanVitA && usiaBulan >= 6,
          asiEksklusif: usiaBulan <= 6,
          obatCacing: isBulanCacing && usiaBulan >= 12,
          vitB1: false,
          vitB6: false,
          statusImunisasi: usiaBulan >= 12 ? 'Lengkap' : 'Sesuai Usia',
          petugas: 'Kader Demo SIPANDU',
        },
      });
    }
  }
  console.log('✅ 25 Balita beserta riwayat pemeriksaan bulanan berhasil dibuat.');

  // 6. Data 25 Lansia
  const lansiasRaw = [
    { nama: 'H. Abdul Somad', jk: 'L' as const, tglLahir: '1952-05-14', ht: true, dm: false, nik: '3216011405520001' },
    { nama: 'Hj. Aminah Syarif', jk: 'P' as const, tglLahir: '1955-08-20', ht: false, dm: true, nik: '3216012008550002' },
    { nama: 'Bambang Soeprapto', jk: 'L' as const, tglLahir: '1950-11-10', ht: true, dm: true, nik: '3216011011500003' },
    { nama: 'Dra. Endang Sulastri', jk: 'P' as const, tglLahir: '1958-03-25', ht: false, dm: false, nik: '3216012503580004' },
    { nama: 'Djoko Santoso', jk: 'L' as const, tglLahir: '1953-07-08', ht: true, dm: false, nik: '3216010807530005' },
    { nama: 'Farida Hanum', jk: 'P' as const, tglLahir: '1961-09-17', ht: false, dm: false, nik: '3216011709610006' },
    { nama: 'Gunawan Wibisono', jk: 'L' as const, tglLahir: '1954-01-30', ht: true, dm: true, nik: '3216013001540007' },
    { nama: 'Halimah Tusadiah', jk: 'P' as const, tglLahir: '1957-12-05', ht: true, dm: false, nik: '3216010512570008' },
    { nama: 'Ilyas Pratama', jk: 'L' as const, tglLahir: '1949-04-16', ht: true, dm: false, nik: '3216011604490009' },
    { nama: 'Jamilah Siregar', jk: 'P' as const, tglLahir: '1960-06-22', ht: false, dm: true, nik: '3216012206600010' },
    { nama: 'Kasim Wijaya', jk: 'L' as const, tglLahir: '1951-10-18', ht: true, dm: false, nik: '3216011810510011' },
    { nama: 'Laksmi Purwanti', jk: 'P' as const, tglLahir: '1962-02-14', ht: false, dm: false, nik: '3216011402620012' },
    { nama: 'Mansyur Hidayat', jk: 'L' as const, tglLahir: '1956-08-03', ht: true, dm: true, nik: '3216010308560013' },
    { nama: 'Nurlela Tanjung', jk: 'P' as const, tglLahir: '1959-11-28', ht: false, dm: false, nik: '3216012811590014' },
    { nama: 'Oentoeng Soebroto', jk: 'L' as const, tglLahir: '1948-03-15', ht: true, dm: false, nik: '3216011503480015' },
    { nama: 'Pudjiastuti Wardani', jk: 'P' as const, tglLahir: '1963-05-19', ht: false, dm: true, nik: '3216011905630016' },
    { nama: 'Rahmat Kartolo', jk: 'L' as const, tglLahir: '1953-12-09', ht: true, dm: false, nik: '3216010912530017' },
    { nama: 'Salmah Al-Habsyi', jk: 'P' as const, tglLahir: '1958-07-27', ht: false, dm: false, nik: '3216012707580018' },
    { nama: 'Taufiqurrahman', jk: 'L' as const, tglLahir: '1950-09-02', ht: true, dm: true, nik: '3216010209500019' },
    { nama: 'Umi Kalsum', jk: 'P' as const, tglLahir: '1961-04-12', ht: true, dm: false, nik: '3216011204610020' },
    { nama: 'Vicky Prasetyo Seno', jk: 'L' as const, tglLahir: '1955-06-20', ht: false, dm: false, nik: '3216012006550021' },
    { nama: 'Wartini Sastro', jk: 'P' as const, tglLahir: '1952-01-07', ht: true, dm: true, nik: '3216010701520022' },
    { nama: 'Yahya Sudrajat', jk: 'L' as const, tglLahir: '1947-10-11', ht: true, dm: false, nik: '3216011110470023' },
    { nama: 'Zulaikha Bahar', jk: 'P' as const, tglLahir: '1964-08-16', ht: false, dm: false, nik: '3216011608640024' },
    { nama: 'Zainal Abidin', jk: 'L' as const, tglLahir: '1954-03-04', ht: true, dm: false, nik: '3216010403540025' },
  ];

  console.log('👴 Membuat 25 data lansia dan riwayat pemeriksaan...');
  for (let idx = 0; idx < lansiasRaw.length; idx++) {
    const l = lansiasRaw[idx];
    const rt = String((idx % 5) + 1).padStart(3, '0');
    const rw = '005';

    const lansia = await prisma.lansia.create({
      data: {
        posyanduId: posyandu.id,
        nama: l.nama,
        nik: l.nik,
        noBpjs: `000${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        noHp: `0813${Math.floor(10000000 + Math.random() * 90000000)}`,
        rtRw: `${rt}/${rw}`,
        tanggalLahir: new Date(l.tglLahir),
        jenisKelamin: l.jk,
        alamat: `Jl. Melati No. ${idx + 1}, RT ${rt}/RW ${rw}`,
        riwayatHt: l.ht,
        riwayatDm: l.dm,
        tingkatKemandirian: idx % 10 === 0 ? 'B' : 'A',
      },
    });

    // Buat pemeriksaan bulanan Jan 2025 s/d Jan 2026
    for (const p of periodesData) {
      const periksaDate = new Date(Date.UTC(p.tahun, p.bulan - 1, 15));

      // Variasi tensi darah sesuai riwayat HT
      let sistol = l.ht ? 140 + Math.floor(Math.random() * 25) : 115 + Math.floor(Math.random() * 15);
      let diastol = l.ht ? 90 + Math.floor(Math.random() * 12) : 75 + Math.floor(Math.random() * 10);

      // Gula darah sesuai DM
      let gds = l.dm ? 160 + Math.floor(Math.random() * 60) : 100 + Math.floor(Math.random() * 30);

      // Berat badan & tinggi badan lansia
      const bbLansia = l.jk === 'L' ? 58 + (idx % 6) : 50 + (idx % 5);
      const tbLansia = l.jk === 'L' ? 162 : 152;
      const lingkarPerut = l.jk === 'L' ? 82 + (idx % 8) : 78 + (idx % 8);
      const kolesterol = 170 + Math.floor(Math.random() * 45);
      const asamUrat = Number((5.0 + Math.random() * 2.5).toFixed(1));

      await prisma.pemeriksaanLansia.create({
        data: {
          lansiaId: lansia.id,
          tanggalPeriksa: periksaDate,
          beratBadan: bbLansia,
          tinggiBadan: tbLansia,
          tekananDarahSistol: sistol,
          tekananDarahDiastol: diastol,
          gulaDarahSewaktu: gds,
          lingkarPerut,
          kolesterol,
          asamUrat,
          keluhan: l.ht ? 'Kadang pusing di tengkuk' : (l.dm ? 'Sering merasa haus' : 'Tidak ada keluhan'),
          tindakan: l.ht || l.dm ? 'Edukasi diet rendah garam/gula & anjuran kontrol rutin Puskesmas' : 'Pertahankan pola hidup sehat',
          petugas: 'Kader Demo SIPANDU',
        },
      });
    }
  }
  console.log('✅ 25 Lansia beserta riwayat pemeriksaan bulanan berhasil dibuat.');

  console.log('🎉 Selesai! Data demo siap digunakan.');
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
