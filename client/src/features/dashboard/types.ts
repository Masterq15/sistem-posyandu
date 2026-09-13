export interface Kunjungan {
  id: string;
  nama: string;
  tipe: "Balita" | "Lansia";
  detail: string;
  status: string;
  statusType: "success" | "warning" | "info";
  waktu: string;
}

export interface Pasien {
  id: string;
  nama: string;
  tipe: "Balita" | "Lansia";
  detailInfo: string; // "12 Bulan" or "RT 02"
  tanggalLahir?: string;
  jenisKelamin?: "L" | "P";
  currentPeriodExam?: any;
}
