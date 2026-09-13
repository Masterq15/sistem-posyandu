export interface PemeriksaanLansia {
  id: string;
  tanggalPeriksa: string;
  beratBadan: number; // kg
  tinggiBadan: number; // cm
  tekananDarahSistol: number; // mmHg
  tekananDarahDiastol: number; // mmHg
  gulaDarahSewaktu: number; // mg/dL
  lingkarPerut: number; // cm
  kolesterol?: number;
  asamUrat?: number;
  keluhan?: string;
  tindakan?: string;
}

export interface Lansia {
  id: string;
  nama: string;
  nik: string;
  noHp?: string;
  noBpjs?: string;
  tanggalLahir: string;
  jenisKelamin: "L" | "P";
  rtRw: string;
  alamat: string;
  riwayatHt: boolean; // Hipertensi
  riwayatDm: boolean; // Diabetes
  tingkatKemandirian: "A" | "B" | "C"; // A: Mandiri, B: Bantuan Sebagian, C: Tergantung Total
  gangguanMentalEmosional?: string;
  usiaTahun?: number;
  kelompokUmur?: string;
  pemeriksaan: PemeriksaanLansia[];
}
