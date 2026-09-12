import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PublicPemeriksaanFilter {
  posyanduId?: string;
  kategori?: 'Balita' | 'Lansia' | 'Semua';
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface PublicPemeriksaanItem {
  id: string;
  kategori: 'Balita' | 'Lansia';
  tanggalPeriksa: string;
  namaWarga: string;
  jenisKelamin: 'L' | 'P';
  usiaInfo: string;
  posyanduId: string;
  posyanduNama: string;
  desa: string;
  wilayah: string;
  // Measurements
  beratBadan: number;
  tinggiBadan: number;
  // Balita specific
  lingkarKepala?: number;
  lingkarLengan?: number;
  nik?: string;
  namaIbu?: string;
  statusBbU?: string;
  statusTbU?: string;
  statusBbTb?: string;
  vitaminA?: boolean;
  asiEksklusif?: boolean;
  obatCacing?: boolean;
  vitB1?: boolean;
  vitB6?: boolean;
  statusImunisasi?: string;
  // Lansia specific
  tekananDarah?: string;
  sistol?: number;
  diastol?: number;
  gds?: number;
  kolesterol?: number;
  asamUrat?: number;
  lingkarPerut?: number;
  riwayatHt?: boolean;
  riwayatDm?: boolean;
  rtRw?: string;
  imt?: string;
  keluhan?: string;
  tindakan?: string;
  // General status & notes
  statusRingkasan: string;
  isPerluRujukan: boolean;
  tindakanCatatan?: string;
  petugas?: string;
  tanggalLahir?: string;
}

export const getPublicPosyanduList = async () => {
  const posyandus = await prisma.posyandu.findMany({
    select: {
      id: true,
      nama: true,
      desa: true,
      kecamatan: true,
    },
    orderBy: { nama: 'asc' },
  });
  return posyandus;
};

export const getPublicPemeriksaanData = async (filter: PublicPemeriksaanFilter) => {
  const { posyanduId, kategori = 'Semua', status, search, startDate, endDate } = filter;

  const dateFilter: any = {};
  if (startDate) {
    dateFilter.gte = new Date(startDate);
  }
  if (endDate) {
    dateFilter.lte = new Date(endDate);
  }

  const hasDateFilter = startDate || endDate;

  let balitaItems: PublicPemeriksaanItem[] = [];
  let lansiaItems: PublicPemeriksaanItem[] = [];

  // 1. Fetch Balita Examinations if kategori is 'Semua' or 'Balita'
  if (kategori === 'Semua' || kategori === 'Balita') {
    const whereBalita: any = {};
    if (posyanduId && posyanduId !== 'semua') {
      whereBalita.balita = { posyanduId };
    }
    if (hasDateFilter) {
      whereBalita.tanggalPeriksa = dateFilter;
    }
    if (search) {
      whereBalita.balita = {
        ...(whereBalita.balita || {}),
        nama: { contains: search, mode: 'insensitive' },
      };
    }

    const records = await prisma.pemeriksaanBalita.findMany({
      where: whereBalita,
      include: {
        balita: {
          select: {
            id: true,
            nama: true,
            jenisKelamin: true,
            tanggalLahir: true,
            nik: true,
            namaIbu: true,
            posyandu: {
              select: { id: true, nama: true, desa: true },
            },
          },
        },
      },
      orderBy: { tanggalPeriksa: 'desc' },
      take: 500,
    });

    balitaItems = records.map((r: any) => {
      const isPerluRujukan =
        r.statusBbU === 'SK' ||
        r.statusTbU === 'SP' ||
        r.statusBbTb === 'SK' ||
        r.statusBbTb === 'G';

      let statusBbUText = r.statusBbU === 'SK' ? 'Sangat Kurang' : r.statusBbU === 'K' ? 'Kurang' : r.statusBbU === 'L' ? 'Lebih' : 'Normal';
      let statusTbUText = r.statusTbU === 'SP' ? 'Sangat Pendek (Stunting)' : r.statusTbU === 'P' ? 'Pendek' : r.statusTbU === 'T' ? 'Tinggi' : 'Normal';

      let statusRingkasan = 'Normal';
      if (r.statusTbU === 'SP') statusRingkasan = 'Stunting (Sangat Pendek)';
      else if (r.statusTbU === 'P') statusRingkasan = 'Pendek';
      else if (r.statusBbU === 'SK') statusRingkasan = 'Gizi Sangat Kurang';
      else if (r.statusBbU === 'K') statusRingkasan = 'Gizi Kurang';
      else if (r.statusBbTb === 'G') statusRingkasan = 'Obesitas/Gemuk';

      return {
        id: `balita-exam-${r.id}`,
        kategori: 'Balita',
        tanggalPeriksa: r.tanggalPeriksa.toISOString().split('T')[0],
        namaWarga: r.balita.nama,
        jenisKelamin: r.balita.jenisKelamin as 'L' | 'P',
        tanggalLahir: r.balita.tanggalLahir ? r.balita.tanggalLahir.toISOString().split('T')[0] : undefined,
        nik: r.balita.nik ? `${r.balita.nik.slice(0, 6)}******${r.balita.nik.slice(-4)}` : undefined,
        namaIbu: r.balita.namaIbu || undefined,
        usiaInfo: `${r.usiaBulan} Bulan`,
        posyanduId: r.balita.posyandu.id,
        posyanduNama: r.balita.posyandu.nama,
        desa: r.balita.posyandu.desa,
        wilayah: `Desa ${r.balita.posyandu.desa}`,
        beratBadan: Number(r.beratBadan),
        tinggiBadan: Number(r.tinggiBadan),
        lingkarKepala: r.lingkarKepala ? Number(r.lingkarKepala) : undefined,
        lingkarLengan: r.lingkarLengan ? Number(r.lingkarLengan) : undefined,
        statusBbU: statusBbUText,
        statusTbU: statusTbUText,
        statusBbTb: r.statusBbTb,
        vitaminA: r.vitaminA,
        asiEksklusif: r.asiEksklusif,
        obatCacing: r.obatCacing,
        vitB1: r.vitB1,
        vitB6: r.vitB6,
        statusImunisasi: r.statusImunisasi || undefined,
        petugas: r.petugas || 'Kader Posyandu',
        statusRingkasan,
        isPerluRujukan,
      };
    });
  }

  // 2. Fetch Lansia Examinations if kategori is 'Semua' or 'Lansia'
  if (kategori === 'Semua' || kategori === 'Lansia') {
    const whereLansia: any = {};
    if (posyanduId && posyanduId !== 'semua') {
      whereLansia.lansia = { posyanduId };
    }
    if (hasDateFilter) {
      whereLansia.tanggalPeriksa = dateFilter;
    }
    if (search) {
      whereLansia.lansia = {
        ...(whereLansia.lansia || {}),
        nama: { contains: search, mode: 'insensitive' },
      };
    }

    const records = await prisma.pemeriksaanLansia.findMany({
      where: whereLansia,
      include: {
        lansia: {
          select: {
            id: true,
            nama: true,
            jenisKelamin: true,
            tanggalLahir: true,
            nik: true,
            rtRw: true,
            riwayatHt: true,
            riwayatDm: true,
            posyandu: {
              select: { id: true, nama: true, desa: true },
            },
          },
        },
      },
      orderBy: { tanggalPeriksa: 'desc' },
      take: 500,
    });

    lansiaItems = records.map((r: any) => {
      const sis = r.tekananDarahSistol;
      const dia = r.tekananDarahDiastol;
      const gds = Number(r.gulaDarahSewaktu);

      const isPerluRujukan = sis >= 140 || gds >= 200 || (r.kolesterol ? Number(r.kolesterol) >= 200 : false);

      let statusRingkasan = 'Normal';
      if (sis >= 180) statusRingkasan = 'Hipertensi Berat (Sistol >180)';
      else if (sis >= 140) statusRingkasan = 'Hipertensi Ringan-Sedang';
      else if (gds >= 200) statusRingkasan = 'Diabetes (GDS >200)';
      else if (gds >= 140) statusRingkasan = 'Pre-Diabetes';

      let usiaStr = 'Lansia';
      if (r.lansia.tanggalLahir) {
        const lahir = new Date(r.lansia.tanggalLahir);
        const periksa = new Date(r.tanggalPeriksa);
        const th = Math.floor((periksa.getTime() - lahir.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        usiaStr = `${th} Tahun`;
      }

      return {
        id: `lansia-exam-${r.id}`,
        kategori: 'Lansia',
        tanggalPeriksa: r.tanggalPeriksa.toISOString().split('T')[0],
        namaWarga: r.lansia.nama,
        jenisKelamin: r.lansia.jenisKelamin as 'L' | 'P',
        tanggalLahir: r.lansia.tanggalLahir ? r.lansia.tanggalLahir.toISOString().split('T')[0] : undefined,
        nik: r.lansia.nik ? `${r.lansia.nik.slice(0, 6)}******${r.lansia.nik.slice(-4)}` : undefined,
        usiaInfo: usiaStr,
        posyanduId: r.lansia.posyandu.id,
        posyanduNama: r.lansia.posyandu.nama,
        desa: r.lansia.posyandu.desa,
        wilayah: `${r.lansia.rtRw || ''}, Desa ${r.lansia.posyandu.desa}`.replace(/^,\s*/, ''),
        rtRw: r.lansia.rtRw || undefined,
        riwayatHt: r.lansia.riwayatHt,
        riwayatDm: r.lansia.riwayatDm,
        beratBadan: Number(r.beratBadan),
        tinggiBadan: Number(r.tinggiBadan),
        tekananDarah: `${sis}/${dia} mmHg`,
        sistol: sis,
        diastol: dia,
        gds,
        kolesterol: r.kolesterol ? Number(r.kolesterol) : undefined,
        asamUrat: r.asamUrat ? Number(r.asamUrat) : undefined,
        lingkarPerut: r.lingkarPerut ? Number(r.lingkarPerut) : undefined,
        keluhan: r.keluhan || undefined,
        tindakan: r.tindakan || undefined,
        petugas: r.petugas || 'Kader Posyandu',
        statusRingkasan,
        isPerluRujukan,
        tindakanCatatan: r.tindakan || r.keluhan || undefined,
      };
    });
  }

  // Combine and sort by date descending
  let combined = [...balitaItems, ...lansiaItems].sort((a, b) => 
    new Date(b.tanggalPeriksa).getTime() - new Date(a.tanggalPeriksa).getTime()
  );

  // Filter by status keyword if provided
  if (status && status !== 'semua') {
    const sLower = status.toLowerCase();
    combined = combined.filter((item) => {
      if (sLower === 'rujukan' || sLower === 'rawan') return item.isPerluRujukan;
      if (sLower === 'normal') return item.statusRingkasan.toLowerCase().includes('normal');
      if (sLower === 'stunting') return item.statusRingkasan.toLowerCase().includes('stunting');
      if (sLower === 'hipertensi') return item.statusRingkasan.toLowerCase().includes('hipertensi');
      if (sLower === 'diabetes') return item.statusRingkasan.toLowerCase().includes('diabetes');
      return item.statusRingkasan.toLowerCase().includes(sLower);
    });
  }

  return combined;
};
