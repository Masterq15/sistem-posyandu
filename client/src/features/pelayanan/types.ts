export interface Pasien {
  id: string;
  nama: string;
  tipe: "Balita" | "Lansia";
  subInfo: string; // Age or RT/RW
  detail1: string; // Mother's name for child, BPJS for senior
  detail2: string; // Address
  tanggalLahir?: string;
  jenisKelamin?: "L" | "P";
  isCheckedInCurrentPeriod?: boolean;
  currentPeriodExam?: any;
}

export interface SessionLog {
  id: string;
  pasienId?: string;
  nama: string;
  tipe: "Balita" | "Lansia";
  waktu: string;
  summary: string;
  parameter?: string;
  status: string;
  statusType?: "success" | "warning" | "info";
  petugas?: string;
}

// Helper Hitung Usia (Bulan)
export function calculateAgeInMonths(birthDateStr: string, refDateStr: string | Date = "2026-07-28"): number {
  if (!birthDateStr) return 0;
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return 0;
  const ref = refDateStr instanceof Date ? refDateStr : new Date(refDateStr || "2026-07-28");
  if (isNaN(ref.getTime())) return 0;
  let months = (ref.getFullYear() - birth.getFullYear()) * 12;
  months -= birth.getMonth();
  months += ref.getMonth();
  return isNaN(months) || months <= 0 ? 0 : months;
}

// Helper Hitung Umur (Tahun)
export function calculateAgeInYears(birthDateStr: string, refDateStr: string | Date = "2026-07-28"): number {
  if (!birthDateStr) return 0;
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return 0;
  const ref = refDateStr instanceof Date ? refDateStr : new Date(refDateStr || "2026-07-28");
  if (isNaN(ref.getTime())) return 0;
  let age = ref.getFullYear() - birth.getFullYear();
  const m = ref.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < birth.getDate())) {
    age--;
  }
  return isNaN(age) || age <= 0 ? 0 : age;
}

export function getStatusBadgeStyle(type: "BBU" | "TBU" | "BBTB", status: string): string {
  const s = (status || "").toLowerCase();

  if (type === "BBU") {
    if (s.includes("sangat kurang")) return "bg-red-100 text-red-800 border-red-300 font-extrabold";
    if (s.includes("kurang")) return "bg-orange-100 text-orange-800 border-orange-300 font-bold";
    if (s.includes("lebih")) return "bg-amber-50 text-amber-800 border-amber-200 font-bold";
    return "bg-emerald-50 text-emerald-800 border-emerald-200 font-bold";
  }

  if (type === "TBU") {
    if (s.includes("sangat pendek")) return "bg-red-100 text-red-800 border-red-300 font-extrabold";
    if (s.includes("pendek")) return "bg-orange-100 text-orange-800 border-orange-300 font-bold";
    if (s.includes("tinggi")) return "bg-teal-50 text-teal-800 border-teal-200 font-bold";
    return "bg-emerald-50 text-emerald-800 border-emerald-200 font-bold";
  }

  if (type === "BBTB") {
    if (s.includes("sangat kurus")) return "bg-red-100 text-red-800 border-red-300 font-extrabold";
    if (s.includes("kurus")) return "bg-orange-100 text-orange-800 border-orange-300 font-bold";
    if (s.includes("gemuk")) return "bg-amber-50 text-amber-800 border-amber-200 font-bold";
    return "bg-emerald-50 text-emerald-800 border-emerald-200 font-bold";
  }

  return "bg-gray-100 text-gray-800 border-gray-200";
}
