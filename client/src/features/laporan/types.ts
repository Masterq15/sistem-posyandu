export interface BalitaPerluPerhatian {
  id: string;
  pasienId?: string;
  nama: string;
  usia: string;
  masalah: string[];
  tanggal: string;
  petugas: string;
  saran: string;
}

export interface RekapanBalita {
  periode: string;
  totalPemeriksaan: number;
  totalAnak: number;
  totalTerdaftar: number;
  cakupanPersen: number;
  tidakHadir: number;
  perluTindakLanjut: number;
  kasusStunting: number;
  kasusWasting: number;
  statusBbU: { normal: number; kurang: number; sangatKurang: number; lebih: number };
  statusTbU: { normal: number; pendek: number; sangatPendek: number; tinggi: number };
  statusBbTb: { normal: number; kurang: number; sangatKurang: number; lebih: number };
  vitaminA: number;
  imunisasiLengkap: number;
  obatCacing: number;
  asiEksklusif: number;
  totalBayiAsiEligible: number;
  distribusiUsia: {
    u0_6: number;
    u7_12: number;
    u13_24: number;
    u25_60: number;
  };
  balitaPerluPerhatianList: BalitaPerluPerhatian[];
}

export interface LansiaPerluPerhatian {
  id: string;
  pasienId?: string;
  nama: string;
  nik?: string;
  usia: string;
  jenisKelamin: string;
  temuan: string[];
  keluhan: string;
  tanggal: string;
  petugas: string;
  saran: string;
}

export interface RekapanLansia {
  periode: string;
  totalPemeriksaan: number;
  totalOrang: number;
  totalTerdaftar: number;
  cakupanPersen: number;
  tidakHadir: number;
  perluFollowUp: number;
  kasusHipertensi: number;
  kasusDiabetes: number;
  kasusMetabolik: number;
  riwayat: {
    hipertensi: number;
    diabetes: number;
    keduanya: number;
    tanpaRiwayat: number;
  };
  statusTd: {
    normal: number;
    prehipertensi: number;
    hipertensi1: number;
    hipertensi2: number;
  };
  statusImt: {
    kurang: number;
    normal: number;
    berlebih: number;
    obesitas: number;
  };
  statusLingkarPerut: {
    normal: number;
    berisiko: number;
  };
  statusGds: {
    dalamTarget: number;
    perluPantau: number;
    tinggi: number;
  };
  statusKolesterol: {
    normal: number;
    tinggi: number;
    diperiksa: number;
  };
  statusAsamUrat: {
    normal: number;
    tinggi: number;
    diperiksa: number;
  };
  rataRataBb: number;
  rataRataTb: number;
  rataRataSistol: number;
  rataRataDiastol: number;
  rataRataGds: number;
  rataRataKolesterol: number;
  rataRataAsamUrat: number;
  rataRataLingkarPerut: number;
  keluhanList: Array<{ nama: string; count: number; persen: number }>;
  tindakanList: Array<{ nama: string; count: number; persen: number }>;
  totalMendapatTindakan: number;
  lansiaPerluPerhatianList: LansiaPerluPerhatian[];
}

export function extractPemberianLain(statusImunisasi?: string | null): string {
  if (!statusImunisasi || !statusImunisasi.trim()) return "-";

  if (/Pemberian:/i.test(statusImunisasi)) {
    const matches = [...statusImunisasi.matchAll(/Pemberian:\s*([^|]+)/gi)];
    if (matches.length > 0) {
      const items = new Set<string>();
      for (const m of matches) {
        m[1].split(",").forEach((s: string) => {
          const trimmed = s.trim();
          if (trimmed) items.add(trimmed);
        });
      }
      return items.size > 0 ? Array.from(items).join(", ") : "-";
    }
  }

  const clean = statusImunisasi
    .replace(/\|\s*Pemberian:\s*/gi, "")
    .replace(/^Pemberian:\s*/gi, "")
    .replace(/^\|\s*/, "")
    .replace(/\s*\|$/, "")
    .trim();

  return clean || "-";
}
