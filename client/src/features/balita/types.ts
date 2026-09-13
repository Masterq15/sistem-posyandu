export interface PemeriksaanBalita {
  id: string;
  tanggalPeriksa: string;
  usiaBulan: number;
  beratBadan: number; // kg
  tinggiBadan: number; // cm
  lingkarKepala?: number; // cm
  lingkarLengan?: number; // cm
  statusBBU: "Sangat Kurang" | "Kurang" | "Normal" | "Lebih";
  statusTBU: "Sangat Pendek" | "Pendek" | "Normal" | "Tinggi";
  statusBBTB: "Sangat Kurus" | "Kurus" | "Normal" | "Gemuk";
  statusKms?: string;
  vitaminA: boolean;
  asiEksklusif?: boolean;
  obatCacing?: boolean;
  vitB1?: boolean;
  vitB6?: boolean;
  statusImunisasi?: string;
}

export interface Balita {
  id: string;
  nama: string;
  nik?: string;
  noHp?: string;
  tanggalLahir: string;
  jenisKelamin: "L" | "P";
  namaIbu: string;
  alamat: string;
  pemeriksaan: PemeriksaanBalita[];
}
