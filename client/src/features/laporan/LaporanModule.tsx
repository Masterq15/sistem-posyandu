"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { riwayatApi, ItemRiwayat, PeriodePelayanan, periodeApi, balitaApi, lansiaApi } from "@/lib/api";
import { SearchIndex } from "@/lib/searchIndex";
import { clientDataCache } from "@/lib/dataCache";
import {
  Download,
  Loader2,
  RotateCcw,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Activity,
  ShieldCheck,
  Sparkles,
  HeartHandshake,
  Heart,
  Droplet,
  Scale,
  Eye,
  X,
  Printer,
  Users,
  AlertCircle
} from "lucide-react";
import PageHelmet from "@/components/PageHelmet";
import BalitaIcon from "@/components/BalitaIcon";
import LansiaIcon from "@/components/LansiaIcon";
import { LaporanSkeleton } from "@/components/Skeleton";

interface LaporanModuleProps {
  posyanduId: string;
  activePeriode?: PeriodePelayanan | null;
  onNavigate?: (module: string, itemId?: string) => void;
}

interface RekapanBalita {
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
  balitaPerluPerhatianList: Array<{
    id: string;
    pasienId?: string;
    nama: string;
    usia: string;
    masalah: string[];
    tanggal: string;
    petugas: string;
    saran: string;
  }>;
}

interface LansiaPerluPerhatian {
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

interface RekapanLansia {
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

function extractPemberianLain(statusImunisasi?: string | null): string {
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

export default function LaporanModule({ posyanduId, activePeriode, onNavigate }: LaporanModuleProps) {
  const now = new Date();
  const defaultMonth = activePeriode?.bulan
    ? String(activePeriode.bulan).padStart(2, "0")
    : String(now.getMonth() + 1).padStart(2, "0");
  const defaultYear = activePeriode?.tahun
    ? String(activePeriode.tahun)
    : String(now.getFullYear());

  const initialCacheKey = `laporan_logs_${posyanduId}_${defaultMonth}_${defaultYear}`;
  const [logs, setLogs] = useState<ItemRiwayat[]>(() => {
    if (typeof window !== "undefined" && posyanduId) {
      const cached = clientDataCache.get<ItemRiwayat[]>(initialCacheKey);
      if (cached && cached.length > 0) return cached;
    }
    return [];
  });
  const [filterMonth, setFilterMonth] = useState<string>(defaultMonth);
  const [filterYear, setFilterYear] = useState<string>(defaultYear);
  const [filterCategory, setFilterCategory] = useState<"Balita" | "Lansia">("Balita");
  const [filterFromDate, setFilterFromDate] = useState<string>("");
  const [filterToDate, setFilterToDate] = useState<string>("");

  // In-Memory Search Index for instant, zero-latency search by token/prefix
  const balitaIndexRef = useRef<SearchIndex<ItemRiwayat>>(
    new SearchIndex<ItemRiwayat>((l) => [
      l.nama,
      l.nik,
      l.petugas,
      l.parameter,
      l.statusBbU,
      l.statusTbU,
      l.statusBbTb,
      l.statusImunisasi,
    ])
  );

  const lansiaIndexRef = useRef<SearchIndex<ItemRiwayat>>(
    new SearchIndex<ItemRiwayat>((l) => [
      l.nama,
      l.nik,
      l.petugas,
      l.parameter,
      l.keluhan,
      l.tindakan,
      l.status,
    ])
  );

  // Sync index whenever logs are loaded or changed
  useEffect(() => {
    balitaIndexRef.current.setSource(logs.filter((l) => l.tipe === "Balita"));
    lansiaIndexRef.current.setSource(logs.filter((l) => l.tipe === "Lansia"));
  }, [logs]);

  // Sync saat activePeriode berubah atau jika belum ada prop aktif
  useEffect(() => {
    if (activePeriode?.bulan && activePeriode?.tahun) {
      setFilterMonth(String(activePeriode.bulan).padStart(2, "0"));
      setFilterYear(String(activePeriode.tahun));
    } else if (posyanduId && !activePeriode) {
      periodeApi.getActive(posyanduId).then((res) => {
        if (res.success && res.data?.bulan && res.data?.tahun) {
          setFilterMonth(String(res.data.bulan).padStart(2, "0"));
          setFilterYear(String(res.data.tahun));
        }
      }).catch(() => {});
    }
  }, [posyanduId, activePeriode]);

  // Total terdaftar balita & lansia untuk menghitung cakupan (%)
  const [totalBalitaTerdaftar, setTotalBalitaTerdaftar] = useState<number>(0);
  const [totalLansiaTerdaftar, setTotalLansiaTerdaftar] = useState<number>(0);

  useEffect(() => {
    if (!posyanduId) return;
    balitaApi
      .getAll(posyanduId, { limit: 1000 })
      .then((res) => {
        if (res.success && res.data) {
          setTotalBalitaTerdaftar(res.data.length);
        }
      })
      .catch(() => {});

    lansiaApi
      .getAll(posyanduId, { limit: 1000 })
      .then((res) => {
        if (res.success && res.data) {
          setTotalLansiaTerdaftar(res.data.length);
        }
      })
      .catch(() => {});
  }, [posyanduId]);

  const [rekapanBalita, setRekapanBalita] = useState<RekapanBalita | null>(null);
  const [rekapanLansia, setRekapanLansia] = useState<RekapanLansia | null>(null);
  const [rekapanLoading, setRekapanLoading] = useState(() => {
    if (typeof window !== "undefined" && posyanduId) {
      const cached = clientDataCache.get<ItemRiwayat[]>(initialCacheKey);
      if (cached && cached.length > 0) return false;
    }
    return false;
  });
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [searchBalita, setSearchBalita] = useState<string>("");
  const [searchLansia, setSearchLansia] = useState<string>("");
  const [pageSizeBalita, setPageSizeBalita] = useState<number>(10);
  const [pageBalita, setPageBalita] = useState<number>(1);
  const [pageSizeLansia, setPageSizeLansia] = useState<number>(10);
  const [pageLansia, setPageLansia] = useState<number>(1);

  // State Pratinjau Laporan (PDF Modal Preview)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [previewPdfBlob, setPreviewPdfBlob] = useState<Blob | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isPreviewOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          handleClosePreview();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isPreviewOpen]);

  const fetchRiwayat = async () => {
    if (!posyanduId) return;
    const cacheKey = `laporan_logs_${posyanduId}_${filterMonth}_${filterYear}`;
    const cached = clientDataCache.get<ItemRiwayat[]>(cacheKey);

    if (cached && cached.length > 0) {
      setLogs(cached);
      setRekapanLoading(false);
    } else if (logs.length === 0) {
      setRekapanLoading(true);
    }

    try {
      const res = await riwayatApi.getAll(posyanduId, {
        tipe: "semua",
        bulan: filterMonth || undefined,
        tahun: filterYear || undefined,
      });
      if (res.success && res.data) {
        setLogs(res.data);
        clientDataCache.set(cacheKey, res.data);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error("Gagal mengambil data riwayat:", err);
      if (!cached) setLogs([]);
    } finally {
      setRekapanLoading(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      setExportingPdf(true);
      const activeSearch = filterCategory === "Balita" ? searchBalita : searchLansia;
      await riwayatApi.downloadPdf(posyanduId, {
        tipe: filterCategory,
        bulan: filterMonth || undefined,
        tahun: filterYear || undefined,
        search: activeSearch || undefined,
      });
    } catch (err) {
      console.error("Gagal export PDF:", err);
      alert("Gagal mengunduh PDF. Silakan coba lagi.");
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExportingExcel(true);
      const activeSearch = filterCategory === "Balita" ? searchBalita : searchLansia;
      await riwayatApi.downloadExcel(posyanduId, {
        tipe: filterCategory,
        bulan: filterMonth || undefined,
        tahun: filterYear || undefined,
        search: activeSearch || undefined,
      });
    } catch (err) {
      console.error("Gagal export Excel:", err);
      alert("Gagal mengunduh Excel. Silakan coba lagi.");
    } finally {
      setExportingExcel(false);
    }
  };

  const handleOpenPreview = async () => {
    setIsPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewError(null);

    if (previewPdfUrl) {
      window.URL.revokeObjectURL(previewPdfUrl);
      setPreviewPdfUrl(null);
    }
    setPreviewPdfBlob(null);

    try {
      const activeSearch = filterCategory === "Balita" ? searchBalita : searchLansia;
      const { url, blob } = await riwayatApi.getPdfBlobUrl(posyanduId, {
        tipe: filterCategory,
        bulan: filterMonth || undefined,
        tahun: filterYear || undefined,
        search: activeSearch || undefined,
      });
      setPreviewPdfUrl(url);
      setPreviewPdfBlob(blob);
    } catch (err: any) {
      console.error("Gagal memuat pratinjau PDF:", err);
      setPreviewError(err.message || "Gagal memuat pratinjau dokumen. Silakan coba lagi.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    if (previewPdfUrl) {
      window.URL.revokeObjectURL(previewPdfUrl);
      setPreviewPdfUrl(null);
    }
    setPreviewPdfBlob(null);
    setPreviewError(null);
  };

  const handleDownloadFromPreview = () => {
    if (previewPdfBlob) {
      const filename = `Laporan_${filterCategory}_Posyandu_${new Date().toISOString().slice(0, 10)}.pdf`;
      riwayatApi.downloadPdfBlob(previewPdfBlob, filename);
    } else {
      handleExportPdf();
    }
  };

  const handlePrintPdf = () => {
    if (previewPdfUrl) {
      const iframe = document.getElementById("preview-pdf-frame") as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } else {
        window.open(previewPdfUrl, "_blank");
      }
    }
  };

  const calculateRekapan = () => {
    let activeLogs = logs;
    if (filterFromDate) {
      activeLogs = activeLogs.filter((l) => l.tanggal >= filterFromDate);
    }
    if (filterToDate) {
      activeLogs = activeLogs.filter((l) => l.tanggal <= filterToDate);
    }

    const balitaLogs = activeLogs.filter((l) => l.tipe === "Balita");
    const lansiaLogs = activeLogs.filter((l) => l.tipe === "Lansia");

    const periodeText = filterMonth
      ? `${new Date(2000, parseInt(filterMonth) - 1).toLocaleString("id-ID", { month: "long" })} ${filterYear || new Date().getFullYear()}`
      : filterYear
      ? `Tahun ${filterYear}`
      : "Semua Periode";

    if (balitaLogs.length > 0) {
      const uniqueAnakCount = new Set(balitaLogs.map((l) => l.pasienId || l.nama)).size;
      const terdaftarCount = Math.max(totalBalitaTerdaftar, uniqueAnakCount);
      const cakupanPersen = terdaftarCount > 0 ? Number(((uniqueAnakCount / terdaftarCount) * 100).toFixed(1)) : 100;
      const tidakHadirCount = Math.max(0, terdaftarCount - uniqueAnakCount);

      // Usia & ASI calculation
      let u0_6 = 0;
      let u7_12 = 0;
      let u13_24 = 0;
      let u25_60 = 0;
      let bayiAsiCount = 0;
      let asiEksklusifCount = 0;

      const attentionList: RekapanBalita["balitaPerluPerhatianList"] = [];

      balitaLogs.forEach((l) => {
        let usiaBln = -1;
        if (l.tanggalLahir) {
          const lahir = new Date(l.tanggalLahir);
          const periksa = l.tanggal ? new Date(l.tanggal) : new Date();
          usiaBln = Math.max(
            0,
            (periksa.getFullYear() - lahir.getFullYear()) * 12 +
              (periksa.getMonth() - lahir.getMonth())
          );
        }

        if (usiaBln >= 0) {
          if (usiaBln <= 6) {
            u0_6++;
            bayiAsiCount++;
            if (l.asiEksklusif) asiEksklusifCount++;
          } else if (usiaBln <= 12) {
            u7_12++;
          } else if (usiaBln <= 24) {
            u13_24++;
          } else {
            u25_60++;
          }
        } else {
          if (l.asiEksklusif) asiEksklusifCount++;
        }

        // Cek indikator risiko / tindak lanjut
        const masalah: string[] = [];
        let saran = "Pemantauan rutin posyandu";

        if (l.statusTbU === "SP") {
          masalah.push("Sangat Pendek (Severe Stunting)");
          saran = "Rujukan Puskesmas & PMT Pemulihan Tinggi Protein";
        } else if (l.statusTbU === "P") {
          masalah.push("Pendek (Stunting)");
          saran = "Intervensi PMT Pemulihan & Konseling Sanitasi/Gizi";
        }

        if (l.statusBbTb === "SK") {
          masalah.push("Gizi Buruk (Severe Wasting)");
          saran = "Rujukan Segera ke Puskesmas / Rawat Inap";
        } else if (l.statusBbTb === "K") {
          masalah.push("Gizi Kurang (Wasting)");
          if (saran === "Pemantauan rutin posyandu") saran = "PMT Pemulihan 90 Hari & Edukasi MP-ASI";
        } else if (l.statusBbTb === "G" || l.statusBbTb === "L") {
          masalah.push("Berisiko Gizi Lebih / Gemuk");
          if (saran === "Pemantauan rutin posyandu") saran = "Konseling Pola Makan Sehat & Aktivitas Fisik";
        }

        if (l.statusBbU === "SK") {
          masalah.push("BB Sangat Kurang");
        } else if (l.statusBbU === "K") {
          masalah.push("BB Kurang");
        }

        if (masalah.length > 0) {
          const usiaDisplay = usiaBln >= 0 ? `${usiaBln} bln` : "-";
          attentionList.push({
            id: l.id,
            pasienId: l.pasienId,
            nama: l.nama || "Balita",
            usia: usiaDisplay,
            masalah,
            tanggal: l.tanggal || "-",
            petugas: l.petugas || "Kader",
            saran,
          });
        }
      });

      const stuntingCount = balitaLogs.filter((l) => l.statusTbU === "P" || l.statusTbU === "SP").length;
      const wastingCount = balitaLogs.filter((l) => l.statusBbTb === "K" || l.statusBbTb === "SK").length;

      const rekapanB: RekapanBalita = {
        periode: periodeText,
        totalPemeriksaan: balitaLogs.length,
        totalAnak: uniqueAnakCount,
        totalTerdaftar: terdaftarCount,
        cakupanPersen,
        tidakHadir: tidakHadirCount,
        perluTindakLanjut: attentionList.length,
        kasusStunting: stuntingCount,
        kasusWasting: wastingCount,
        statusBbU: {
          normal: balitaLogs.filter((l) => l.statusBbU === "N").length,
          kurang: balitaLogs.filter((l) => l.statusBbU === "K").length,
          sangatKurang: balitaLogs.filter((l) => l.statusBbU === "SK").length,
          lebih: balitaLogs.filter((l) => l.statusBbU === "L").length,
        },
        statusTbU: {
          normal: balitaLogs.filter((l) => l.statusTbU === "N").length,
          pendek: balitaLogs.filter((l) => l.statusTbU === "P").length,
          sangatPendek: balitaLogs.filter((l) => l.statusTbU === "SP").length,
          tinggi: balitaLogs.filter((l) => l.statusTbU === "T").length,
        },
        statusBbTb: {
          normal: balitaLogs.filter((l) => l.statusBbTb === "N").length,
          kurang: balitaLogs.filter((l) => l.statusBbTb === "K").length,
          sangatKurang: balitaLogs.filter((l) => l.statusBbTb === "SK").length,
          lebih: balitaLogs.filter((l) => l.statusBbTb === "L" || l.statusBbTb === "G").length,
        },
        vitaminA: balitaLogs.filter((l) => l.vitaminA).length,
        imunisasiLengkap: balitaLogs.filter((l) => l.statusImunisasi && l.statusImunisasi !== "").length,
        obatCacing: balitaLogs.filter((l) => l.obatCacing).length,
        asiEksklusif: asiEksklusifCount,
        totalBayiAsiEligible: bayiAsiCount,
        distribusiUsia: {
          u0_6,
          u7_12,
          u13_24,
          u25_60,
        },
        balitaPerluPerhatianList: attentionList,
      };
      setRekapanBalita(rekapanB);
    } else {
      setRekapanBalita({
        periode: periodeText,
        totalPemeriksaan: 0,
        totalAnak: 0,
        totalTerdaftar: totalBalitaTerdaftar,
        cakupanPersen: 0,
        tidakHadir: totalBalitaTerdaftar,
        perluTindakLanjut: 0,
        kasusStunting: 0,
        kasusWasting: 0,
        statusBbU: { normal: 0, kurang: 0, sangatKurang: 0, lebih: 0 },
        statusTbU: { normal: 0, pendek: 0, sangatPendek: 0, tinggi: 0 },
        statusBbTb: { normal: 0, kurang: 0, sangatKurang: 0, lebih: 0 },
        vitaminA: 0,
        imunisasiLengkap: 0,
        obatCacing: 0,
        asiEksklusif: 0,
        totalBayiAsiEligible: 0,
        distribusiUsia: { u0_6: 0, u7_12: 0, u13_24: 0, u25_60: 0 },
        balitaPerluPerhatianList: [],
      });
    }

    if (lansiaLogs.length > 0) {
      const totalPemeriksaan = lansiaLogs.length;
      const totalOrang = new Set(lansiaLogs.map((l) => l.pasienId || l.nik || l.nama)).size;
      const totalTerdaftar = totalLansiaTerdaftar > 0 ? totalLansiaTerdaftar : totalOrang;
      const cakupanPersen = totalTerdaftar > 0
        ? Number(((totalOrang / totalTerdaftar) * 100).toFixed(1))
        : 100;
      const tidakHadir = Math.max(0, totalTerdaftar - totalOrang);

      // Riwayat Penyakit Kronis
      let riwayatHtCount = 0;
      let riwayatDmCount = 0;
      let riwayatKeduanyaCount = 0;
      let tanpaRiwayatCount = 0;

      // Status Tekanan Darah (JNC / Kemenkes)
      const statusTd = { normal: 0, prehipertensi: 0, hipertensi1: 0, hipertensi2: 0 };
      let sumSistol = 0;
      let countSistol = 0;
      let sumDiastol = 0;
      let countDiastol = 0;

      // Status IMT & Lingkar Perut
      const statusImt = { kurang: 0, normal: 0, berlebih: 0, obesitas: 0 };
      const statusLingkarPerut = { normal: 0, berisiko: 0 };
      let sumBb = 0;
      let countBb = 0;
      let sumTb = 0;
      let countTb = 0;
      let sumLp = 0;
      let countLp = 0;

      // Status Lab (GDS, Kolesterol, Asam Urat)
      const statusGds = { dalamTarget: 0, perluPantau: 0, tinggi: 0 };
      let sumGds = 0;
      let countGds = 0;

      const statusKolesterol = { normal: 0, tinggi: 0, diperiksa: 0 };
      let sumKol = 0;

      const statusAsamUrat = { normal: 0, tinggi: 0, diperiksa: 0 };
      let sumAu = 0;

      // Keluhan & Tindakan
      const keluhanCounts: Record<string, number> = {};
      const tindakanCounts: Record<string, number> = {};
      let totalMendapatTindakan = 0;

      const attentionMap = new Map<string, LansiaPerluPerhatian>();

      lansiaLogs.forEach((log) => {
        // Riwayat HT & DM
        const hasHt = log.riwayatHt === true;
        const hasDm = log.riwayatDm === true;
        if (hasHt && hasDm) riwayatKeduanyaCount++;
        else if (hasHt) riwayatHtCount++;
        else if (hasDm) riwayatDmCount++;
        else tanpaRiwayatCount++;

        // Tekanan Darah
        const sistol = log.tekananDarahSistol || 0;
        const diastol = log.tekananDarahDiastol || 0;
        if (sistol > 0 || diastol > 0) {
          if (sistol > 0) { sumSistol += sistol; countSistol++; }
          if (diastol > 0) { sumDiastol += diastol; countDiastol++; }

          if (sistol >= 160 || diastol >= 100) statusTd.hipertensi2++;
          else if (sistol >= 140 || diastol >= 90) statusTd.hipertensi1++;
          else if (sistol >= 120 || diastol >= 80) statusTd.prehipertensi++;
          else statusTd.normal++;
        }

        // IMT
        const bb = log.beratBadan || 0;
        const tb = log.tinggiBadan || 0;
        if (bb > 0) { sumBb += bb; countBb++; }
        if (tb > 0) { sumTb += tb; countTb++; }
        if (bb > 0 && tb > 0) {
          const imt = bb / ((tb / 100) ** 2);
          if (imt < 18.5) statusImt.kurang++;
          else if (imt < 23.0) statusImt.normal++;
          else if (imt < 25.0) statusImt.berlebih++;
          else statusImt.obesitas++;
        }

        // Lingkar Perut
        const lp = log.lingkarPerut || 0;
        const jk = log.jenisKelamin?.toUpperCase() || "L";
        if (lp > 0) {
          sumLp += lp;
          countLp++;
          const limit = jk === "P" ? 80 : 90;
          if (lp > limit) statusLingkarPerut.berisiko++;
          else statusLingkarPerut.normal++;
        }

        // GDS
        const gds = log.gulaDarahSewaktu || 0;
        if (gds > 0) {
          sumGds += gds;
          countGds++;
          if (gds < 140) statusGds.dalamTarget++;
          else if (gds < 200) statusGds.perluPantau++;
          else statusGds.tinggi++;
        }

        // Kolesterol
        if (log.kolesterol !== undefined && log.kolesterol !== null && Number(log.kolesterol) > 0) {
          const kol = Number(log.kolesterol);
          statusKolesterol.diperiksa++;
          sumKol += kol;
          if (kol >= 200) statusKolesterol.tinggi++;
          else statusKolesterol.normal++;
        }

        // Asam Urat
        if (log.asamUrat !== undefined && log.asamUrat !== null && Number(log.asamUrat) > 0) {
          const au = Number(log.asamUrat);
          statusAsamUrat.diperiksa++;
          sumAu += au;
          const limitAu = jk === "P" ? 6.0 : 7.0;
          if (au > limitAu) statusAsamUrat.tinggi++;
          else statusAsamUrat.normal++;
        }

        // Keluhan parsing
        const rawKeluhan = (log.keluhan || "").trim().toLowerCase();
        if (rawKeluhan && rawKeluhan !== "-" && rawKeluhan !== "tidak ada") {
          let cat = "Keluhan Lainnya";
          if (/pegal|sendi|linu|rematik|nyeri lutut|encok/.test(rawKeluhan)) cat = "Pegal / Nyeri Sendi";
          else if (/pusing|sakit kepala|migrain|kleyengan/.test(rawKeluhan)) cat = "Pusing / Sakit Kepala";
          else if (/lelah|lemas|capek|letih/.test(rawKeluhan)) cat = "Mudah Lelah / Lemas";
          else if (/pinggang|punggung/.test(rawKeluhan)) cat = "Nyeri Punggung / Pinggang";
          else if (/batuk|sesak|pilek|napas|flu/.test(rawKeluhan)) cat = "Batuk / Gangguan Napas";
          else if (/mata|kabur/.test(rawKeluhan)) cat = "Penglihatan Kabur";
          keluhanCounts[cat] = (keluhanCounts[cat] || 0) + 1;
        }

        // Tindakan parsing
        const rawTindakan = (log.tindakan || "").trim().toLowerCase();
        if (rawTindakan && rawTindakan !== "-" && rawTindakan !== "tidak ada") {
          totalMendapatTindakan++;
          let catT = "Edukasi & Pemantauan";
          if (/konseling|gizi|makan|diet|nutrisi/.test(rawTindakan)) catT = "Konseling Pola Makan & Gizi";
          else if (/pantau|monitoring|kontrol|rutin/.test(rawTindakan)) catT = "Monitoring / Pemantauan Rutin";
          else if (/rujuk|puskesmas|faskes|rs/.test(rawTindakan)) catT = "Rujukan Puskesmas / Faskes";
          else if (/obat|vitamin|terapi|farmasi/.test(rawTindakan)) catT = "Pemberian Vitamin / Terapi";
          else if (/senam|olahraga|aktivitas/.test(rawTindakan)) catT = "Edukasi Aktivitas Fisik";
          tindakanCounts[catT] = (tindakanCounts[catT] || 0) + 1;
        }

        // Deteksi Lansia Perlu Perhatian / Follow-up
        const temuan: string[] = [];
        const isHt2 = sistol >= 160 || diastol >= 100;
        const isHt1 = (sistol >= 140 || diastol >= 90) && !isHt2;
        const isGdsTinggi = gds >= 200;
        const isGdsWaspada = gds >= 140 && gds < 200;
        const kol = Number(log.kolesterol || 0);
        const isKolTinggi = kol >= 200;
        const au = Number(log.asamUrat || 0);
        const isAuTinggi = au > (jk === "P" ? 6.0 : 7.0);
        const isObesitasSentral = lp > (jk === "P" ? 80 : 90);

        if (isHt2) temuan.push(`TD: ${sistol}/${diastol} (HT Derajat 2)`);
        else if (isHt1) temuan.push(`TD: ${sistol}/${diastol} (HT Derajat 1)`);

        if (isGdsTinggi) temuan.push(`GDS: ${gds} mg/dL (Tinggi)`);
        else if (isGdsWaspada) temuan.push(`GDS: ${gds} mg/dL (Perlu Pantau)`);

        if (isKolTinggi) temuan.push(`Kolesterol: ${kol} mg/dL`);
        if (isAuTinggi) temuan.push(`Asam Urat: ${au} mg/dL`);
        if (isObesitasSentral) temuan.push(`Obesitas Sentral (${lp} cm)`);

        let usiaTahun = "-";
        if (log.tanggalLahir) {
          const lahir = new Date(log.tanggalLahir);
          const sekarang = new Date();
          usiaTahun = Math.floor((sekarang.getTime() - lahir.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) + " Thn";
        }

        if (temuan.length > 0) {
          const key = log.pasienId || log.nik || log.nama;
          let saran = "Konseling Pola Hidup & Monitoring Berkala";
          if (isHt2 || isGdsTinggi) {
            saran = "Segera Rujuk Puskesmas untuk Evaluasi Dokter";
          } else if (isKolTinggi || isAuTinggi) {
            saran = "Pemeriksaan Lab Lanjutan & Diet Rendah Lemak/Purin";
          } else if (isHt1) {
            saran = "Kontrol Tekanan Darah Rutin & Kurangi Asupan Garam";
          } else if (isObesitasSentral) {
            saran = "Konseling Pengaturan Pola Makan & Aktivitas Fisik Ringan";
          }

          attentionMap.set(key, {
            id: log.id,
            pasienId: log.pasienId,
            nama: log.nama,
            nik: log.nik,
            usia: usiaTahun,
            jenisKelamin: jk === "P" ? "Perempuan" : "Laki-laki",
            temuan,
            keluhan: log.keluhan || "-",
            tanggal: log.tanggal,
            petugas: log.petugas || "Kader",
            saran,
          });
        }
      });

      const keluhanList = Object.entries(keluhanCounts)
        .map(([nama, count]) => ({
          nama,
          count,
          persen: Number(((count / totalPemeriksaan) * 100).toFixed(1)),
        }))
        .sort((a, b) => b.count - a.count);

      const tindakanList = Object.entries(tindakanCounts)
        .map(([nama, count]) => ({
          nama,
          count,
          persen: Number(((count / totalPemeriksaan) * 100).toFixed(1)),
        }))
        .sort((a, b) => b.count - a.count);

      const totalHipertensi = statusTd.hipertensi1 + statusTd.hipertensi2;
      const totalDiabetes = statusGds.tinggi;
      const totalMetabolik = attentionMap.size;

      const rekapanL: RekapanLansia = {
        periode: periodeText,
        totalPemeriksaan,
        totalOrang,
        totalTerdaftar,
        cakupanPersen,
        tidakHadir,
        perluFollowUp: attentionMap.size,
        kasusHipertensi: totalHipertensi,
        kasusDiabetes: totalDiabetes,
        kasusMetabolik: totalMetabolik,
        riwayat: {
          hipertensi: riwayatHtCount + riwayatKeduanyaCount,
          diabetes: riwayatDmCount + riwayatKeduanyaCount,
          keduanya: riwayatKeduanyaCount,
          tanpaRiwayat: tanpaRiwayatCount,
        },
        statusTd,
        statusImt,
        statusLingkarPerut,
        statusGds,
        statusKolesterol,
        statusAsamUrat,
        rataRataBb: countBb > 0 ? Number((sumBb / countBb).toFixed(1)) : 0,
        rataRataTb: countTb > 0 ? Number((sumTb / countTb).toFixed(1)) : 0,
        rataRataSistol: countSistol > 0 ? Math.round(sumSistol / countSistol) : 0,
        rataRataDiastol: countDiastol > 0 ? Math.round(sumDiastol / countDiastol) : 0,
        rataRataGds: countGds > 0 ? Math.round(sumGds / countGds) : 0,
        rataRataKolesterol: statusKolesterol.diperiksa > 0 ? Math.round(sumKol / statusKolesterol.diperiksa) : 0,
        rataRataAsamUrat: statusAsamUrat.diperiksa > 0 ? Number((sumAu / statusAsamUrat.diperiksa).toFixed(1)) : 0,
        rataRataLingkarPerut: countLp > 0 ? Number((sumLp / countLp).toFixed(1)) : 0,
        keluhanList,
        tindakanList,
        totalMendapatTindakan,
        lansiaPerluPerhatianList: Array.from(attentionMap.values()),
      };
      setRekapanLansia(rekapanL);
    } else {
      setRekapanLansia({
        periode: periodeText,
        totalPemeriksaan: 0,
        totalOrang: 0,
        totalTerdaftar: totalLansiaTerdaftar,
        cakupanPersen: 0,
        tidakHadir: totalLansiaTerdaftar,
        perluFollowUp: 0,
        kasusHipertensi: 0,
        kasusDiabetes: 0,
        kasusMetabolik: 0,
        riwayat: { hipertensi: 0, diabetes: 0, keduanya: 0, tanpaRiwayat: 0 },
        statusTd: { normal: 0, prehipertensi: 0, hipertensi1: 0, hipertensi2: 0 },
        statusImt: { kurang: 0, normal: 0, berlebih: 0, obesitas: 0 },
        statusLingkarPerut: { normal: 0, berisiko: 0 },
        statusGds: { dalamTarget: 0, perluPantau: 0, tinggi: 0 },
        statusKolesterol: { normal: 0, tinggi: 0, diperiksa: 0 },
        statusAsamUrat: { normal: 0, tinggi: 0, diperiksa: 0 },
        rataRataBb: 0,
        rataRataTb: 0,
        rataRataSistol: 0,
        rataRataDiastol: 0,
        rataRataGds: 0,
        rataRataKolesterol: 0,
        rataRataAsamUrat: 0,
        rataRataLingkarPerut: 0,
        keluhanList: [],
        tindakanList: [],
        totalMendapatTindakan: 0,
        lansiaPerluPerhatianList: [],
      });
    }
  };

  useEffect(() => {
    if (posyanduId) {
      fetchRiwayat();
    }
  }, [posyanduId, filterMonth, filterYear]);

  useEffect(() => {
    calculateRekapan();
    setPageBalita(1);
    setPageLansia(1);
  }, [logs, filterCategory, filterFromDate, filterToDate, totalBalitaTerdaftar, totalLansiaTerdaftar]);

  // Filter data Balita berdasarkan search (via in-memory SearchIndex) & tanggal
  const filteredBalitaLogs = useMemo(() => {
    const source = searchBalita.trim()
      ? balitaIndexRef.current.search(searchBalita)
      : logs.filter((l) => l.tipe === "Balita");

    return source.filter((l) => {
      if (filterFromDate && l.tanggal < filterFromDate) return false;
      if (filterToDate && l.tanggal > filterToDate) return false;
      return true;
    });
  }, [logs, searchBalita, filterFromDate, filterToDate]);

  // Filter data Lansia berdasarkan search (via in-memory SearchIndex) & tanggal
  const filteredLansiaLogs = useMemo(() => {
    const source = searchLansia.trim()
      ? lansiaIndexRef.current.search(searchLansia)
      : logs.filter((l) => l.tipe === "Lansia");

    return source.filter((l) => {
      if (filterFromDate && l.tanggal < filterFromDate) return false;
      if (filterToDate && l.tanggal > filterToDate) return false;
      return true;
    });
  }, [logs, searchLansia, filterFromDate, filterToDate]);

  const currentYear = new Date().getFullYear();
  const baseYear = activePeriode?.tahun ? Math.max(currentYear, activePeriode.tahun) : currentYear;
  const yearOptions = Array.from({ length: 6 }, (_, i) => baseYear - i);

  const periodeText = filterMonth
    ? `${new Date(2000, parseInt(filterMonth) - 1).toLocaleString("id-ID", { month: "long" })} ${filterYear || new Date().getFullYear()}`
    : filterYear
    ? `Tahun ${filterYear}`
    : "Semua Periode";

  if (rekapanLoading && logs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-6">
        <PageHelmet
          title="Laporan Rekapan"
          description="Laporan rekapitulasi pemeriksaan bulanan untuk Balita dan Lansia dengan filter periode."
        />
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Laporan Rekapan</h2>
          <p className="text-sm text-gray-600 mt-1">
            Laporan rekapitulasi data pemeriksaan Balita &amp; Lansia berdasarkan periode waktu dan kegiatan posyandu.
          </p>
        </div>
        <LaporanSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-6">
      <PageHelmet
        title="Laporan Rekapan"
        description="Laporan rekapitulasi pemeriksaan bulanan untuk Balita dan Lansia dengan filter periode."
      />

      {/* Header Halaman */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Laporan Rekapan</h2>
        <p className="text-sm text-gray-600 mt-1">
          Laporan rekapitulasi data pemeriksaan Balita & Lansia berdasarkan periode waktu dan kegiatan posyandu.
        </p>
      </div>

      {/* Filter Controls & Export Box */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-5">
        {/* Baris 1: Pilihan Kategori dan Periode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 1. Kategori Laporan */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
              1. Kategori Peserta
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFilterCategory("Balita")}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                  filterCategory === "Balita"
                    ? "bg-teal-600 text-white shadow-sm shadow-teal-600/20"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Balita
              </button>
              <button
                type="button"
                onClick={() => setFilterCategory("Lansia")}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                  filterCategory === "Lansia"
                    ? "bg-teal-600 text-white shadow-sm shadow-teal-600/20"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Lansia
              </button>
            </div>
          </div>

          {/* 2. Periode Bulan */}
          <div>
            <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">
              2. Bulan
            </label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            >
              <option value="" className="text-gray-900">Semua Bulan</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={String(i + 1).padStart(2, "0")} className="text-gray-900">
                  {new Date(2000, i).toLocaleString("id-ID", { month: "long" })}
                </option>
              ))}
            </select>
          </div>

          {/* Periode Tahun */}
          <div>
            <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">
              3. Tahun
            </label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            >
              <option value="" className="text-gray-900">Semua Tahun</option>
              {yearOptions.map((year) => (
                <option key={year} value={year.toString()} className="text-gray-900">
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Dari Tanggal */}
          <div>
            <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">
              Dari Tanggal (Opsional)
            </label>
            <input
              type="date"
              value={filterFromDate}
              onChange={(e) => setFilterFromDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            />
          </div>

          {/* Sampai Tanggal */}
          <div>
            <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">
              Sampai Tanggal (Opsional)
            </label>
            <input
              type="date"
              value={filterToDate}
              onChange={(e) => setFilterToDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            />
          </div>
        </div>

        {/* Baris 2: Tombol Reset Filter & Tombol Unduh Laporan */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {/* Tombol Reset ke Periode Ini */}
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const curM = activePeriode?.bulan
                  ? String(activePeriode.bulan).padStart(2, "0")
                  : String(now.getMonth() + 1).padStart(2, "0");
                const curY = activePeriode?.tahun
                  ? String(activePeriode.tahun)
                  : String(now.getFullYear());
                setFilterMonth(curM);
                setFilterYear(curY);
                setFilterFromDate("");
                setFilterToDate("");
                setSearchBalita("");
                setSearchLansia("");
              }}
              className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-lg border border-teal-200/80 transition-colors flex items-center gap-1.5 shadow-xs"
              title="Set filter kembali ke periode ini"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Periode Ini
            </button>

            {/* Tombol Tampilkan Semua Periode */}
            <button
              type="button"
              onClick={() => {
                setFilterMonth("");
                setFilterYear("");
                setFilterFromDate("");
                setFilterToDate("");
                setSearchBalita("");
                setSearchLansia("");
              }}
              className="px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg border border-gray-300 transition-colors flex items-center gap-1.5 shadow-xs"
              title="Tampilkan semua data tanpa filter bulan dan tahun"
            >
              Semua Periode
            </button>

            {rekapanLoading && (
              <span className="text-xs text-teal-600 font-semibold flex items-center gap-1.5 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Memperbarui data...
              </span>
            )}
          </div>

          {/* Tombol Aksi Laporan */}
          <div className="flex items-center gap-2">
            {/* Tombol Pratinjau Dokumen */}
            <button
              type="button"
              onClick={handleOpenPreview}
              disabled={rekapanLoading || (filterCategory === "Balita" ? filteredBalitaLogs.length === 0 : filteredLansiaLogs.length === 0)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
              title="Pratinjau dokumen PDF sebelum diunduh atau dicetak"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Pratinjau Laporan</span>
            </button>

            {/* Tombol Unduh PDF (Buka Pratinjau Terlebih Dahulu) */}
            <button
              type="button"
              onClick={handleOpenPreview}
              disabled={exportingPdf || (filterCategory === "Balita" ? filteredBalitaLogs.length === 0 : filteredLansiaLogs.length === 0)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
              title="Pratinjau & Unduh format PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh PDF</span>
            </button>

            {/* Tombol Unduh Excel */}
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={exportingExcel || (filterCategory === "Balita" ? filteredBalitaLogs.length === 0 : filteredLansiaLogs.length === 0)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
              title="Unduh format spreadsheet Excel (.xlsx)"
            >
              {exportingExcel ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{exportingExcel ? "Mengunduh Excel..." : "Unduh Excel"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ringkasan Rekapan Balita */}
      {filterCategory === "Balita" && (
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-2xs space-y-5">
          {/* Header & Cakupan Keseluruhan */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-saas-dark tracking-tight">Ringkasan Rekapan Balita</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/60">
                  {rekapanBalita?.periode || "Semua Periode"}
                </span>
              </div>
              <p className="text-xs text-saas-muted mt-1 font-medium flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-gray-700">{rekapanBalita?.totalTerdaftar || 0} Terdaftar</span>
                <span>•</span>
                <span className="font-bold text-teal-700">{rekapanBalita?.totalAnak || 0} Diperiksa</span>
                <span>•</span>
                <span>Cakupan <strong className="text-gray-900">{rekapanBalita?.cakupanPersen || 0}%</strong></span>
                <span>•</span>
                <span className="text-amber-700 font-semibold">{rekapanBalita?.tidakHadir || 0} Tidak Hadir</span>
              </p>
            </div>
            <div className="text-xs font-semibold text-saas-muted bg-gray-50 border border-gray-200/80 px-3 py-1.5 rounded-lg w-fit">
              Total Data: <strong className="text-saas-dark font-extrabold">{filteredBalitaLogs.length}</strong> Pemeriksaan ({rekapanBalita?.totalAnak || 0} Anak)
            </div>
          </div>

          {/* Tier 1 - KPI Utama (5 Card KPI Grid) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-saas-muted uppercase tracking-wider">Tier 1 — Indikator Kunci &amp; Kasus Prioritas</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Total Diperiksa */}
              <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs hover:border-teal-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-saas-muted uppercase tracking-wider">Total Diperiksa</span>
                  <div className="w-7 h-7 rounded-md bg-teal-50 text-saas-primary flex items-center justify-center shrink-0 border border-teal-100">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-extrabold text-saas-dark tracking-tight">
                    {rekapanBalita?.totalAnak || 0} <span className="text-sm font-semibold text-gray-500">Anak</span>
                  </div>
                  <span className="mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200/60 inline-block">
                    {rekapanBalita?.totalPemeriksaan || 0} Kali Pemeriksaan
                  </span>
                </div>
              </div>

              {/* Cakupan Pemeriksaan */}
              <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs hover:border-emerald-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-saas-muted uppercase tracking-wider">Cakupan Periksa</span>
                  <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-extrabold text-saas-dark tracking-tight">
                    {rekapanBalita?.cakupanPersen || 0}%
                  </div>
                  <span className="mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60 inline-block">
                    {rekapanBalita?.totalAnak || 0} dari {rekapanBalita?.totalTerdaftar || 0} Terdaftar
                  </span>
                </div>
              </div>

              {/* Balita Perlu Tindak Lanjut */}
              <div className="bg-white border border-rose-200/90 rounded-xl p-4 shadow-2xs hover:border-rose-300 transition-all flex flex-col justify-between bg-rose-50/10">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Perlu Tindak Lanjut</span>
                  <div className="w-7 h-7 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-extrabold text-rose-700 tracking-tight">
                    {rekapanBalita?.perluTindakLanjut || 0} <span className="text-sm font-semibold text-rose-600">Anak</span>
                  </div>
                  <span className={`mt-1 px-2 py-0.5 rounded text-[10px] font-bold border inline-block ${
                    (rekapanBalita?.perluTindakLanjut || 0) > 0
                      ? "bg-rose-50 text-rose-800 border-rose-200/70"
                      : "bg-emerald-50 text-emerald-800 border-emerald-200/70"
                  }`}>
                    {(rekapanBalita?.perluTindakLanjut || 0) > 0 ? "Prioritas Pantauan Kader" : "Kondisi Terkendali"}
                  </span>
                </div>
              </div>

              {/* Kasus Stunting (TB/U) */}
              <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs hover:border-purple-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-saas-muted uppercase tracking-wider">Kasus Stunting (TB/U)</span>
                  <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                    <BalitaIcon className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-extrabold text-saas-dark tracking-tight">
                    {rekapanBalita?.kasusStunting || 0} <span className="text-sm font-semibold text-gray-500">Anak</span>
                  </div>
                  <span className="mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200/60 inline-block">
                    {rekapanBalita && rekapanBalita.totalPemeriksaan > 0
                      ? ((rekapanBalita.kasusStunting / rekapanBalita.totalPemeriksaan) * 100).toFixed(1)
                      : "0"}% Pendek &amp; S. Pendek
                  </span>
                </div>
              </div>

              {/* Kasus Wasting (BB/TB) */}
              <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs hover:border-amber-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-saas-muted uppercase tracking-wider">Kasus Wasting (BB/TB)</span>
                  <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                    <Activity className="w-4 h-4 text-amber-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-extrabold text-saas-dark tracking-tight">
                    {rekapanBalita?.kasusWasting || 0} <span className="text-sm font-semibold text-gray-500">Anak</span>
                  </div>
                  <span className="mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60 inline-block">
                    {rekapanBalita && rekapanBalita.totalPemeriksaan > 0
                      ? ((rekapanBalita.kasusWasting / rekapanBalita.totalPemeriksaan) * 100).toFixed(1)
                      : "0"}% Kurus &amp; Gizi Buruk
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tier 2 - Status Gizi & Antropometri (3 Pilar Standar Kemenkes / WHO) */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-saas-muted uppercase tracking-wider">Tier 2 — Status Gizi &amp; Antropometri (Standar Kemenkes / WHO)</h4>
                <p className="text-[11px] text-gray-500">Evaluasi terpilah 3 pilar antropometri balita untuk diagnosis yang akurat</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Kolom 1: BB/U (Berat Badan menurut Umur) */}
              <div className="bg-gray-50/50 border border-gray-200/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                  <div>
                    <span className="text-xs font-extrabold text-gray-900 tracking-tight">BB/U (Berat menurut Umur)</span>
                    <p className="text-[10px] text-gray-500">Indikator Berat Badan / Underweight</p>
                  </div>
                  <Scale className="w-4 h-4 text-saas-primary" />
                </div>
                <div className="space-y-2 text-xs">
                  {/* Normal */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Normal
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{rekapanBalita?.statusBbU.normal || 0}</span>
                      <span className="text-[10px] text-gray-500 ml-1.5">
                        ({rekapanBalita && rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.statusBbU.normal / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  {/* Kurang */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Kurang (Underweight)
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-amber-700">{rekapanBalita?.statusBbU.kurang || 0}</span>
                      <span className="text-[10px] text-gray-500 ml-1.5">
                        ({rekapanBalita && rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.statusBbU.kurang / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  {/* Sangat Kurang */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Sangat Kurang (Severely)
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-red-700">{rekapanBalita?.statusBbU.sangatKurang || 0}</span>
                      <span className="text-[10px] text-gray-500 ml-1.5">
                        ({rekapanBalita && rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.statusBbU.sangatKurang / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  {/* Risiko BB Lebih */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Risiko BB Lebih
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-blue-700">{rekapanBalita?.statusBbU.lebih || 0}</span>
                      <span className="text-[10px] text-gray-500 ml-1.5">
                        ({rekapanBalita && rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.statusBbU.lebih / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom 2: TB/U (Tinggi menurut Umur) */}
              <div className="bg-gray-50/50 border border-gray-200/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                  <div>
                    <span className="text-xs font-extrabold text-gray-900 tracking-tight">TB/U (Tinggi menurut Umur)</span>
                    <p className="text-[10px] text-gray-500">Indikator Stunting Kronis</p>
                  </div>
                  <BalitaIcon className="w-4 h-4 text-purple-600" />
                </div>
                <div className="space-y-2 text-xs">
                  {/* Normal */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Normal
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{rekapanBalita?.statusTbU.normal || 0}</span>
                      <span className="text-[10px] text-gray-500 ml-1.5">
                        ({rekapanBalita && rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.statusTbU.normal / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  {/* Pendek (Stunted) */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Pendek (Stunted)
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-amber-700">{rekapanBalita?.statusTbU.pendek || 0}</span>
                      <span className="text-[10px] text-gray-500 ml-1.5">
                        ({rekapanBalita && rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.statusTbU.pendek / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  {/* Sangat Pendek (Severely Stunted) */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Sangat Pendek (Severely)
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-red-700">{rekapanBalita?.statusTbU.sangatPendek || 0}</span>
                      <span className="text-[10px] text-gray-500 ml-1.5">
                        ({rekapanBalita && rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.statusTbU.sangatPendek / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  {/* Tinggi */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                      Tinggi
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-teal-700">{rekapanBalita?.statusTbU.tinggi || 0}</span>
                      <span className="text-[10px] text-gray-500 ml-1.5">
                        ({rekapanBalita && rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.statusTbU.tinggi / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom 3: BB/TB (Berat menurut Tinggi) */}
              <div className="bg-gray-50/50 border border-gray-200/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                  <div>
                    <span className="text-xs font-extrabold text-gray-900 tracking-tight">BB/TB (Berat menurut Tinggi)</span>
                    <p className="text-[10px] text-gray-500">Indikator Wasting / Gizi Akut</p>
                  </div>
                  <Activity className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="space-y-2 text-xs">
                  {/* Gizi Baik / Normal */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Gizi Baik (Normal)
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{rekapanBalita?.statusBbTb.normal || 0}</span>
                      <span className="text-[10px] text-gray-500 ml-1.5">
                        ({rekapanBalita && rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.statusBbTb.normal / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  {/* Gizi Kurang (Kurus) */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Gizi Kurang (Wasted)
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-amber-700">{rekapanBalita?.statusBbTb.kurang || 0}</span>
                      <span className="text-[10px] text-gray-500 ml-1.5">
                        ({rekapanBalita && rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.statusBbTb.kurang / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  {/* Gizi Buruk (Severely Wasted) */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Gizi Buruk (Severe Wasted)
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-red-700">{rekapanBalita?.statusBbTb.sangatKurang || 0}</span>
                      <span className="text-[10px] text-gray-500 ml-1.5">
                        ({rekapanBalita && rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.statusBbTb.sangatKurang / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  {/* Berisiko Gizi Lebih / Gemuk */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Gizi Lebih / Gemuk
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-blue-700">{rekapanBalita?.statusBbTb.lebih || 0}</span>
                      <span className="text-[10px] text-gray-500 ml-1.5">
                        ({rekapanBalita && rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.statusBbTb.lebih / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tier 3 - 2-Kolom Grid: Pelayanan Kesehatan & Distribusi Usia */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            {/* Pelayanan Kesehatan */}
            <div className="bg-white border border-gray-200/80 rounded-xl p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div>
                  <h4 className="text-xs font-bold text-saas-dark uppercase tracking-wider">Tier 3 — Cakupan Pelayanan Kesehatan</h4>
                  <p className="text-[11px] text-gray-500">Persentase balita yang menerima intervensi kesehatan</p>
                </div>
                <ShieldCheck className="w-4 h-4 text-saas-primary" />
              </div>

              <div className="space-y-3 text-xs">
                {/* Imunisasi */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-700">Imunisasi Lengkap</span>
                    <span className="font-bold text-gray-900">
                      {rekapanBalita?.imunisasiLengkap || 0} / {rekapanBalita?.totalPemeriksaan || 0}{" "}
                      <span className="text-gray-500 font-normal">
                        ({rekapanBalita && rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.imunisasiLengkap / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${rekapanBalita && rekapanBalita.totalPemeriksaan > 0 ? Math.min(100, (rekapanBalita.imunisasiLengkap / rekapanBalita.totalPemeriksaan) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Vitamin A */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-700">Vitamin A</span>
                    <span className="font-bold text-gray-900">
                      {rekapanBalita?.vitaminA || 0} / {rekapanBalita?.totalPemeriksaan || 0}{" "}
                      <span className="text-gray-500 font-normal">
                        ({rekapanBalita && rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.vitaminA / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-rose-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${rekapanBalita && rekapanBalita.totalPemeriksaan > 0 ? Math.min(100, (rekapanBalita.vitaminA / rekapanBalita.totalPemeriksaan) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Obat Cacing */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-700">Obat Cacing</span>
                    <span className="font-bold text-gray-900">
                      {rekapanBalita?.obatCacing || 0} / {rekapanBalita?.totalPemeriksaan || 0}{" "}
                      <span className="text-gray-500 font-normal">
                        ({rekapanBalita && rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.obatCacing / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${rekapanBalita && rekapanBalita.totalPemeriksaan > 0 ? Math.min(100, (rekapanBalita.obatCacing / rekapanBalita.totalPemeriksaan) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* ASI Eksklusif */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-gray-700">ASI Eksklusif (Usia 0–6 Bln)</span>
                      <span className="text-[10px] text-gray-400" title="Dihitung proporsional terhadap bayi usia 0-6 bulan">*</span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {rekapanBalita?.asiEksklusif || 0} / {rekapanBalita?.totalBayiAsiEligible || 0}{" "}
                      <span className="text-gray-500 font-normal">
                        ({rekapanBalita && rekapanBalita.totalBayiAsiEligible > 0 ? ((rekapanBalita.asiEksklusif / rekapanBalita.totalBayiAsiEligible) * 100).toFixed(1) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${rekapanBalita && rekapanBalita.totalBayiAsiEligible > 0 ? Math.min(100, (rekapanBalita.asiEksklusif / rekapanBalita.totalBayiAsiEligible) * 100) : 0}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 italic">
                    * Proporsional terhadap {rekapanBalita?.totalBayiAsiEligible || 0} bayi kelompok usia 0–6 bulan
                  </p>
                </div>
              </div>
            </div>

            {/* Distribusi Kelompok Usia */}
            <div className="bg-white border border-gray-200/80 rounded-xl p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div>
                  <h4 className="text-xs font-bold text-saas-dark uppercase tracking-wider">Distribusi Kelompok Usia</h4>
                  <p className="text-[11px] text-gray-500">Segmentasi usia balita yang hadir dalam posyandu</p>
                </div>
                <Users className="w-4 h-4 text-saas-primary" />
              </div>

              <div className="space-y-3 text-xs">
                {/* 0–6 Bulan */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-700">0–6 Bulan (Bayi)</span>
                    <span className="font-bold text-gray-900">
                      {rekapanBalita?.distribusiUsia.u0_6 || 0} Anak{" "}
                      <span className="text-gray-500 font-normal">
                        ({rekapanBalita && rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.distribusiUsia.u0_6 / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${rekapanBalita && rekapanBalita.totalPemeriksaan > 0 ? Math.min(100, (rekapanBalita.distribusiUsia.u0_6 / rekapanBalita.totalPemeriksaan) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 7–12 Bulan */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-700">7–12 Bulan (Baduta Awal)</span>
                    <span className="font-bold text-gray-900">
                      {rekapanBalita?.distribusiUsia.u7_12 || 0} Anak{" "}
                      <span className="text-gray-500 font-normal">
                        ({rekapanBalita && rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.distribusiUsia.u7_12 / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${rekapanBalita && rekapanBalita.totalPemeriksaan > 0 ? Math.min(100, (rekapanBalita.distribusiUsia.u7_12 / rekapanBalita.totalPemeriksaan) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 13–24 Bulan */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-700">13–24 Bulan (Baduta)</span>
                    <span className="font-bold text-gray-900">
                      {rekapanBalita?.distribusiUsia.u13_24 || 0} Anak{" "}
                      <span className="text-gray-500 font-normal">
                        ({rekapanBalita && rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.distribusiUsia.u13_24 / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${rekapanBalita && rekapanBalita.totalPemeriksaan > 0 ? Math.min(100, (rekapanBalita.distribusiUsia.u13_24 / rekapanBalita.totalPemeriksaan) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 25–60 Bulan */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-700">25–60 Bulan (Prasekolah)</span>
                    <span className="font-bold text-gray-900">
                      {rekapanBalita?.distribusiUsia.u25_60 || 0} Anak{" "}
                      <span className="text-gray-500 font-normal">
                        ({rekapanBalita && rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.distribusiUsia.u25_60 / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${rekapanBalita && rekapanBalita.totalPemeriksaan > 0 ? Math.min(100, (rekapanBalita.distribusiUsia.u25_60 / rekapanBalita.totalPemeriksaan) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tier 4 - ⚠️ Balita Perlu Tindak Lanjut (Daftar Aksi Prioritas Kader) */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    Tier 4 — Balita Perlu Tindak Lanjut &amp; Perhatian Khusus
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800">
                    {rekapanBalita?.balitaPerluPerhatianList?.length || 0} Kasus
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Balita yang terindikasi masalah antropometri (stunting, wasting, underweight, atau risiko obesitas) untuk segera ditindaklanjuti kader / bidan
                </p>
              </div>
            </div>

            {rekapanBalita?.balitaPerluPerhatianList && rekapanBalita.balitaPerluPerhatianList.length > 0 ? (
              <div className="border border-rose-200/80 rounded-xl overflow-hidden bg-rose-50/20 shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-rose-100/50 text-rose-950 font-bold border-b border-rose-200/70">
                        <th className="px-3.5 py-2.5">Nama Balita</th>
                        <th className="px-3.5 py-2.5">Usia</th>
                        <th className="px-3.5 py-2.5">Indikasi Masalah Gizi</th>
                        <th className="px-3.5 py-2.5">Tanggal Periksa</th>
                        <th className="px-3.5 py-2.5">Rekomendasi Tindak Lanjut</th>
                        <th className="px-3.5 py-2.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-100/70 bg-white">
                      {rekapanBalita.balitaPerluPerhatianList.map((item) => (
                        <tr key={item.id} className="hover:bg-rose-50/40 transition-colors">
                          <td className="px-3.5 py-2.5 font-bold text-gray-900">
                            {item.nama}
                          </td>
                          <td className="px-3.5 py-2.5 text-gray-600">
                            {item.usia}
                          </td>
                          <td className="px-3.5 py-2.5">
                            <div className="flex flex-wrap gap-1">
                              {item.masalah.map((m, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200"
                                >
                                  {m}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-3.5 py-2.5 text-gray-600">
                            {item.tanggal}
                          </td>
                          <td className="px-3.5 py-2.5 text-gray-700 font-medium">
                            {item.saran}
                          </td>
                          <td className="px-3.5 py-2.5 text-right">
                            {onNavigate && item.pasienId ? (
                              <button
                                onClick={() => onNavigate("balita", item.pasienId)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                              >
                                Buka Profil
                              </button>
                            ) : (
                              <span className="text-[11px] text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-900">Kondisi Baik: Tidak Ditemukan Kasus Masalah Pertumbuhan</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Semua balita yang diperiksa pada periode ini memiliki status gizi normal dan tidak terdeteksi indikasi stunting atau wasting.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Detail Data Pemeriksaan Table */}
          <div className="pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h4 className="text-base font-bold text-gray-900">
                Detail Data Pemeriksaan Balita
              </h4>
                <div className="text-xs text-gray-600 flex items-center gap-1.5">
                  <span>Tampilkan</span>
                  <select
                    value={pageSizeBalita}
                    onChange={(e) => {
                      setPageSizeBalita(Number(e.target.value));
                      setPageBalita(1);
                    }}
                    className="px-2 py-1 border border-gray-300 rounded-lg text-xs font-semibold text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                  >
                    <option value={10} className="text-gray-900">10</option>
                    <option value={25} className="text-gray-900">25</option>
                    <option value={50} className="text-gray-900">50</option>
                    <option value={100} className="text-gray-900">100</option>
                  </select>
                  <span>data</span>
                </div>
                <div className="relative w-48 sm:w-60">
                  <input
                    type="text"
                    placeholder="Cari nama balita..."
                    value={searchBalita}
                    onChange={(e) => {
                      setSearchBalita(e.target.value);
                      setPageBalita(1);
                    }}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                  <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">No</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Nama Balita</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Tanggal Lahir</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">NIK</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Nama Ibu</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">JK</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Usia</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">BB (kg)</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">TB (cm)</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">BB/U</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">TB/U</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">BB/TB</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">LK (cm)</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">LiLA (cm)</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Pemberian Lain</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">B1</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">B6</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">ASI SKS</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Vitamin A</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Obat Cacing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredBalitaLogs.length === 0 ? (
                    <tr>
                      <td colSpan={20} className="py-8 text-center text-xs text-gray-500 font-medium">
                        Tidak ada catatan pemeriksaan Balita yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredBalitaLogs
                      .slice((pageBalita - 1) * pageSizeBalita, pageBalita * pageSizeBalita)
                      .map((log, idx) => {
                        let usiaStr = "-";
                        if (log.tanggalLahir) {
                          const lahir = new Date(log.tanggalLahir);
                          const periksa = log.tanggal ? new Date(log.tanggal) : new Date();
                          const totalBulan = Math.max(
                            0,
                            (periksa.getFullYear() - lahir.getFullYear()) * 12 +
                              (periksa.getMonth() - lahir.getMonth())
                          );
                          usiaStr = `${totalBulan} bln`;
                        }

                        return (
                          <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-2.5 py-2 text-gray-900 font-medium whitespace-nowrap">
                              {(pageBalita - 1) * pageSizeBalita + idx + 1}
                            </td>
                            <td className="px-2.5 py-2 text-gray-900 font-bold whitespace-nowrap">
                              {onNavigate && log.pasienId ? (
                                <button
                                  type="button"
                                  onClick={() => onNavigate("Balita", log.pasienId)}
                                  className="text-gray-900 font-bold hover:text-teal-600 hover:underline text-left transition-colors cursor-pointer"
                                  title={`Lihat Profil ${log.nama}`}
                                >
                                  {log.nama || "-"}
                                </button>
                              ) : (
                                <span>{log.nama || "-"}</span>
                              )}
                            </td>
                            <td className="px-2.5 py-2 text-gray-600 whitespace-nowrap">{log.tanggalLahir || "-"}</td>
                            <td className="px-2.5 py-2 text-gray-600 whitespace-nowrap">{log.nik || "-"}</td>
                            <td className="px-2.5 py-2 text-gray-600 whitespace-nowrap">{log.namaIbu || "-"}</td>
                            <td className="px-2.5 py-2 text-gray-600 font-semibold whitespace-nowrap">{log.jenisKelamin || "-"}</td>
                            <td className="px-2.5 py-2 text-gray-600 whitespace-nowrap">{usiaStr}</td>
                            <td className="px-2.5 py-2 text-gray-900 font-bold whitespace-nowrap">{log.beratBadan ?? "-"}</td>
                            <td className="px-2.5 py-2 text-gray-900 font-bold whitespace-nowrap">{log.tinggiBadan ?? "-"}</td>
                            <td className="px-2.5 py-2 text-gray-700 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                log.statusBbU === "N" ? "bg-emerald-100 text-emerald-800" :
                                log.statusBbU === "K" ? "bg-amber-100 text-amber-800" :
                                log.statusBbU === "SK" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                              }`}>
                                {log.statusBbU === "N" ? "Normal" :
                                 log.statusBbU === "K" ? "Kurang" :
                                 log.statusBbU === "SK" ? "Sangat Kurang" :
                                 log.statusBbU === "L" ? "Lebih" : log.statusBbU || "-"}
                              </span>
                            </td>
                            <td className="px-2.5 py-2 text-gray-700 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                log.statusTbU === "N" ? "bg-emerald-100 text-emerald-800" :
                                log.statusTbU === "P" ? "bg-purple-100 text-purple-800" :
                                log.statusTbU === "SP" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                              }`}>
                                {log.statusTbU === "N" ? "Normal" :
                                 log.statusTbU === "P" ? "Pendek" :
                                 log.statusTbU === "SP" ? "Sangat Pendek" : log.statusTbU || "-"}
                              </span>
                            </td>
                            <td className="px-2.5 py-2 text-gray-700 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                log.statusBbTb === "N" ? "bg-emerald-100 text-emerald-800" :
                                log.statusBbTb === "K" ? "bg-amber-100 text-amber-800" :
                                log.statusBbTb === "SK" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                              }`}>
                                {log.statusBbTb === "N" ? "Gizi Baik" :
                                 log.statusBbTb === "K" ? "Gizi Kurang" :
                                 log.statusBbTb === "SK" ? "Gizi Buruk" :
                                 log.statusBbTb === "G" ? "Gizi Lebih" : log.statusBbTb || "-"}
                              </span>
                            </td>
                            <td className="px-2.5 py-2 text-gray-600 whitespace-nowrap">{log.lingkarKepala ?? "-"}</td>
                            <td className="px-2.5 py-2 text-gray-600 whitespace-nowrap">{log.lingkarLengan ?? "-"}</td>
                            <td className="px-2.5 py-2 text-gray-900 font-medium whitespace-nowrap">{extractPemberianLain(log.statusImunisasi)}</td>
                            <td className="px-2.5 py-2 text-gray-600 whitespace-nowrap">{log.vitB1 ? "Ya" : "Tdk"}</td>
                            <td className="px-2.5 py-2 text-gray-600 whitespace-nowrap">{log.vitB6 ? "Ya" : "Tdk"}</td>
                            <td className="px-2.5 py-2 text-gray-600 whitespace-nowrap">{log.asiEksklusif ? "Ya" : "Tdk"}</td>
                            <td className="px-2.5 py-2 text-gray-600 whitespace-nowrap">{log.vitaminA ? "Ya" : "Tdk"}</td>
                            <td className="px-2.5 py-2 text-gray-600 whitespace-nowrap">{log.obatCacing ? "Ya" : "Tdk"}</td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredBalitaLogs.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-xs text-gray-600">
                  Menampilkan {(pageBalita - 1) * pageSizeBalita + 1} - {Math.min(pageBalita * pageSizeBalita, filteredBalitaLogs.length)} dari {filteredBalitaLogs.length} data
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={pageBalita <= 1}
                    onClick={() => setPageBalita((prev) => Math.max(1, prev - 1))}
                    className="px-2.5 py-1 text-xs font-semibold rounded border border-gray-300 hover:bg-gray-50 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Sebelumnya
                  </button>
                  <span className="px-3 py-1 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 rounded">
                    Hal {pageBalita} / {Math.max(1, Math.ceil(filteredBalitaLogs.length / pageSizeBalita))}
                  </span>
                  <button
                    type="button"
                    disabled={pageBalita >= Math.ceil(filteredBalitaLogs.length / pageSizeBalita)}
                    onClick={() => setPageBalita((prev) => prev + 1)}
                    className="px-2.5 py-1 text-xs font-semibold rounded border border-gray-300 hover:bg-gray-50 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}
        </div>
      )}

      {/* Ringkasan Rekapan Lansia */}
      {filterCategory === "Lansia" && (
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-2xs space-y-5">
          {/* Header & Cakupan Keseluruhan */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-saas-dark tracking-tight">Ringkasan Rekapan Lansia</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/60">
                  {rekapanLansia?.periode || "Semua Periode"}
                </span>
              </div>
              <p className="text-xs text-saas-muted mt-1 font-medium flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-gray-700">{rekapanLansia?.totalTerdaftar || 0} Terdaftar</span>
                <span>•</span>
                <span className="font-bold text-teal-700">{rekapanLansia?.totalOrang || 0} Diperiksa</span>
                <span>•</span>
                <span>Cakupan <strong className="text-gray-900">{rekapanLansia?.cakupanPersen ?? 0}%</strong></span>
                <span>•</span>
                <span className="text-amber-700 font-semibold">{rekapanLansia?.tidakHadir || 0} Tidak Hadir</span>
              </p>
            </div>
            <div className="text-xs font-semibold text-saas-muted bg-gray-50 border border-gray-200/80 px-3 py-1.5 rounded-lg w-fit">
              Total Data: <strong className="text-saas-dark font-extrabold">{filteredLansiaLogs.length}</strong> Pemeriksaan ({rekapanLansia?.totalOrang || 0} Lansia)
            </div>
          </div>

          {/* Tier 1 - KPI Utama Lansia (5 Card KPI Grid) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-saas-muted uppercase tracking-wider">Tier 1 — Indikator Prioritas Kesehatan Lansia</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Total Lansia Diperiksa */}
              <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs hover:border-teal-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-saas-muted uppercase tracking-wider">Total Diperiksa</span>
                  <div className="w-7 h-7 rounded-md bg-teal-50 text-saas-primary flex items-center justify-center shrink-0 border border-teal-100">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-extrabold text-saas-dark tracking-tight">
                    {rekapanLansia?.totalOrang || 0} <span className="text-xs font-normal text-saas-muted">Lansia</span>
                  </div>
                  <span className="mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200/60 inline-block">
                    {rekapanLansia?.totalPemeriksaan || 0} Kunjungan
                  </span>
                </div>
              </div>

              {/* Cakupan Pemeriksaan */}
              <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs hover:border-emerald-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-saas-muted uppercase tracking-wider">Cakupan Kehadiran</span>
                  <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-extrabold text-emerald-700 tracking-tight">
                    {rekapanLansia?.cakupanPersen ?? 0}%
                  </div>
                  <span className="mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60 inline-block">
                    Target Wilayah Tercapai
                  </span>
                </div>
              </div>

              {/* Perlu Follow-up */}
              <div className={`bg-white border rounded-xl p-4 shadow-2xs transition-all flex flex-col justify-between ${
                (rekapanLansia?.perluFollowUp || 0) > 0 ? "border-rose-300 bg-rose-50/10" : "border-gray-200/80 hover:border-rose-300"
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-saas-muted uppercase tracking-wider">Perlu Follow-Up</span>
                  <div className="w-7 h-7 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className={`text-2xl font-extrabold tracking-tight ${
                    (rekapanLansia?.perluFollowUp || 0) > 0 ? "text-rose-600" : "text-saas-dark"
                  }`}>
                    {rekapanLansia?.perluFollowUp || 0} <span className="text-xs font-normal text-saas-muted">Lansia</span>
                  </div>
                  <span className={`mt-1 px-2 py-0.5 rounded text-[10px] font-bold inline-block border ${
                    (rekapanLansia?.perluFollowUp || 0) > 0
                      ? "bg-rose-50 text-rose-800 border-rose-200/60"
                      : "bg-gray-50 text-gray-700 border-gray-200"
                  }`}>
                    Temuan Berisiko Klinis
                  </span>
                </div>
              </div>

              {/* Kasus Hipertensi */}
              <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs hover:border-amber-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-saas-muted uppercase tracking-wider">Kasus Hipertensi</span>
                  <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                    <Heart className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-extrabold text-amber-700 tracking-tight">
                    {rekapanLansia?.kasusHipertensi || 0} <span className="text-xs font-normal text-saas-muted">Kasus</span>
                  </div>
                  <span className="mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60 inline-block">
                    {rekapanLansia && rekapanLansia.totalPemeriksaan > 0
                      ? ((rekapanLansia.kasusHipertensi / rekapanLansia.totalPemeriksaan) * 100).toFixed(1)
                      : "0"}% Derajat 1 &amp; 2
                  </span>
                </div>
              </div>

              {/* Kasus Diabetes / GDS Tinggi */}
              <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs hover:border-purple-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-saas-muted uppercase tracking-wider">GDS Tinggi / DM</span>
                  <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                    <Droplet className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-extrabold text-purple-700 tracking-tight">
                    {rekapanLansia?.kasusDiabetes || 0} <span className="text-xs font-normal text-saas-muted">Kasus</span>
                  </div>
                  <span className="mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200/60 inline-block">
                    {rekapanLansia && rekapanLansia.totalPemeriksaan > 0
                      ? ((rekapanLansia.kasusDiabetes / rekapanLansia.totalPemeriksaan) * 100).toFixed(1)
                      : "0"}% GDS ≥ 200 mg/dL
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tier 2 - Status Klinis & Skrining Vital (3 Kolom Standar Lansia) */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <h4 className="text-xs font-bold text-saas-muted uppercase tracking-wider">
              Tier 2 — Status Klinis &amp; Skrining Pemeriksaan Vital
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Kolom 1: Status Tekanan Darah (JNC / Kemenkes) */}
              <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-rose-50 text-rose-600 flex items-center justify-center">
                      <Heart className="w-3.5 h-3.5" />
                    </div>
                    <h5 className="text-xs font-bold text-gray-900">Tekanan Darah (TD)</h5>
                  </div>
                  <span className="text-[11px] font-medium text-gray-500">
                    Rata-rata: <strong className="text-gray-900 font-bold">{rekapanLansia?.rataRataSistol || 0}/{rekapanLansia?.rataRataDiastol || 0}</strong> mmHg
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {/* Normal */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-600">Normal (&lt;120/&lt;80)</span>
                      <span className="font-bold text-emerald-700">
                        {rekapanLansia?.statusTd.normal || 0}{" "}
                        <span className="text-[10px] font-normal text-gray-500">
                          ({rekapanLansia && rekapanLansia.totalPemeriksaan > 0 ? ((rekapanLansia.statusTd.normal / rekapanLansia.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${rekapanLansia && rekapanLansia.totalPemeriksaan > 0 ? Math.min(100, (rekapanLansia.statusTd.normal / rekapanLansia.totalPemeriksaan) * 100) : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Prehipertensi */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-600">Prehipertensi (120-139 / 80-89)</span>
                      <span className="font-bold text-amber-700">
                        {rekapanLansia?.statusTd.prehipertensi || 0}{" "}
                        <span className="text-[10px] font-normal text-gray-500">
                          ({rekapanLansia && rekapanLansia.totalPemeriksaan > 0 ? ((rekapanLansia.statusTd.prehipertensi / rekapanLansia.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${rekapanLansia && rekapanLansia.totalPemeriksaan > 0 ? Math.min(100, (rekapanLansia.statusTd.prehipertensi / rekapanLansia.totalPemeriksaan) * 100) : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Hipertensi Derajat 1 */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-600">Hipertensi Tk 1 (140-159 / 90-99)</span>
                      <span className="font-bold text-orange-700">
                        {rekapanLansia?.statusTd.hipertensi1 || 0}{" "}
                        <span className="text-[10px] font-normal text-gray-500">
                          ({rekapanLansia && rekapanLansia.totalPemeriksaan > 0 ? ((rekapanLansia.statusTd.hipertensi1 / rekapanLansia.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${rekapanLansia && rekapanLansia.totalPemeriksaan > 0 ? Math.min(100, (rekapanLansia.statusTd.hipertensi1 / rekapanLansia.totalPemeriksaan) * 100) : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Hipertensi Derajat 2 */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-600">Hipertensi Tk 2 (≥160 / ≥100)</span>
                      <span className="font-bold text-rose-700">
                        {rekapanLansia?.statusTd.hipertensi2 || 0}{" "}
                        <span className="text-[10px] font-normal text-gray-500">
                          ({rekapanLansia && rekapanLansia.totalPemeriksaan > 0 ? ((rekapanLansia.statusTd.hipertensi2 / rekapanLansia.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-rose-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${rekapanLansia && rekapanLansia.totalPemeriksaan > 0 ? Math.min(100, (rekapanLansia.statusTd.hipertensi2 / rekapanLansia.totalPemeriksaan) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Sub: Riwayat Penyakit Kronis */}
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Riwayat Penyakit Terdata</span>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <div className="bg-gray-50 rounded-lg p-1.5 border border-gray-100">
                      <span className="text-gray-500 block text-[10px]">Hipertensi</span>
                      <span className="font-extrabold text-gray-900">{rekapanLansia?.riwayat.hipertensi || 0} Lansia</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-1.5 border border-gray-100">
                      <span className="text-gray-500 block text-[10px]">Diabetes</span>
                      <span className="font-extrabold text-gray-900">{rekapanLansia?.riwayat.diabetes || 0} Lansia</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom 2: Status Berat Badan (IMT) & Lingkar Perut */}
              <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Scale className="w-3.5 h-3.5" />
                    </div>
                    <h5 className="text-xs font-bold text-gray-900">IMT &amp; Lingkar Perut</h5>
                  </div>
                  <span className="text-[11px] font-medium text-gray-500">
                    Rata BB: <strong className="text-gray-900 font-bold">{rekapanLansia?.rataRataBb || 0}</strong> kg
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {/* IMT Kurang */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-600">Kurang (&lt;18.5)</span>
                      <span className="font-bold text-blue-700">
                        {rekapanLansia?.statusImt.kurang || 0}{" "}
                        <span className="text-[10px] font-normal text-gray-500">
                          ({rekapanLansia && rekapanLansia.totalPemeriksaan > 0 ? ((rekapanLansia.statusImt.kurang / rekapanLansia.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${rekapanLansia && rekapanLansia.totalPemeriksaan > 0 ? Math.min(100, (rekapanLansia.statusImt.kurang / rekapanLansia.totalPemeriksaan) * 100) : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* IMT Normal */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-600">Normal (18.5-22.9)</span>
                      <span className="font-bold text-emerald-700">
                        {rekapanLansia?.statusImt.normal || 0}{" "}
                        <span className="text-[10px] font-normal text-gray-500">
                          ({rekapanLansia && rekapanLansia.totalPemeriksaan > 0 ? ((rekapanLansia.statusImt.normal / rekapanLansia.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${rekapanLansia && rekapanLansia.totalPemeriksaan > 0 ? Math.min(100, (rekapanLansia.statusImt.normal / rekapanLansia.totalPemeriksaan) * 100) : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* IMT Berlebih */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-600">Berlebih (23.0-24.9)</span>
                      <span className="font-bold text-amber-700">
                        {rekapanLansia?.statusImt.berlebih || 0}{" "}
                        <span className="text-[10px] font-normal text-gray-500">
                          ({rekapanLansia && rekapanLansia.totalPemeriksaan > 0 ? ((rekapanLansia.statusImt.berlebih / rekapanLansia.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${rekapanLansia && rekapanLansia.totalPemeriksaan > 0 ? Math.min(100, (rekapanLansia.statusImt.berlebih / rekapanLansia.totalPemeriksaan) * 100) : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Obesitas */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-600">Obesitas (≥25.0)</span>
                      <span className="font-bold text-rose-700">
                        {rekapanLansia?.statusImt.obesitas || 0}{" "}
                        <span className="text-[10px] font-normal text-gray-500">
                          ({rekapanLansia && rekapanLansia.totalPemeriksaan > 0 ? ((rekapanLansia.statusImt.obesitas / rekapanLansia.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-rose-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${rekapanLansia && rekapanLansia.totalPemeriksaan > 0 ? Math.min(100, (rekapanLansia.statusImt.obesitas / rekapanLansia.totalPemeriksaan) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Sub: Lingkar Perut */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Lingkar Perut (LP)</span>
                    <span className="text-[10px] text-gray-500 font-semibold">Rata: {rekapanLansia?.rataRataLingkarPerut || 0} cm</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <div className="bg-emerald-50/60 rounded-lg p-1.5 border border-emerald-100">
                      <span className="text-emerald-700 block text-[10px]">Normal (L≤90, P≤80)</span>
                      <span className="font-extrabold text-emerald-900">{rekapanLansia?.statusLingkarPerut.normal || 0} Lansia</span>
                    </div>
                    <div className="bg-rose-50/60 rounded-lg p-1.5 border border-rose-100">
                      <span className="text-rose-700 block text-[10px]">Risiko Sentral</span>
                      <span className="font-extrabold text-rose-900">{rekapanLansia?.statusLingkarPerut.berisiko || 0} Lansia</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom 3: Skrining Laboratorium (GDS, Kolesterol, Asam Urat) */}
              <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <h5 className="text-xs font-bold text-gray-900">Skrining Laboratorium</h5>
                  </div>
                  <span className="text-[11px] font-medium text-gray-500">
                    GDS Rata-rata: <strong className="text-gray-900 font-bold">{rekapanLansia?.rataRataGds || 0}</strong> mg/dL
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {/* GDS Target */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-600">GDS Target (&lt;140 mg/dL)</span>
                      <span className="font-bold text-emerald-700">
                        {rekapanLansia?.statusGds.dalamTarget || 0}{" "}
                        <span className="text-[10px] font-normal text-gray-500">
                          ({rekapanLansia && rekapanLansia.totalPemeriksaan > 0 ? ((rekapanLansia.statusGds.dalamTarget / rekapanLansia.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${rekapanLansia && rekapanLansia.totalPemeriksaan > 0 ? Math.min(100, (rekapanLansia.statusGds.dalamTarget / rekapanLansia.totalPemeriksaan) * 100) : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* GDS Pemantauan */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-600">GDS Pantau (140-199 mg/dL)</span>
                      <span className="font-bold text-amber-700">
                        {rekapanLansia?.statusGds.perluPantau || 0}{" "}
                        <span className="text-[10px] font-normal text-gray-500">
                          ({rekapanLansia && rekapanLansia.totalPemeriksaan > 0 ? ((rekapanLansia.statusGds.perluPantau / rekapanLansia.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${rekapanLansia && rekapanLansia.totalPemeriksaan > 0 ? Math.min(100, (rekapanLansia.statusGds.perluPantau / rekapanLansia.totalPemeriksaan) * 100) : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* GDS Tinggi */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-600">GDS Tinggi (≥200 mg/dL)</span>
                      <span className="font-bold text-rose-700">
                        {rekapanLansia?.statusGds.tinggi || 0}{" "}
                        <span className="text-[10px] font-normal text-gray-500">
                          ({rekapanLansia && rekapanLansia.totalPemeriksaan > 0 ? ((rekapanLansia.statusGds.tinggi / rekapanLansia.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-rose-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${rekapanLansia && rekapanLansia.totalPemeriksaan > 0 ? Math.min(100, (rekapanLansia.statusGds.tinggi / rekapanLansia.totalPemeriksaan) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Sub: Kolesterol & Asam Urat */}
                <div className="pt-2 border-t border-gray-100 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-600 font-medium">Kolesterol Total</span>
                    <span className="font-bold text-gray-900">
                      Rata: {rekapanLansia?.rataRataKolesterol || 0} mg/dL{" "}
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        (rekapanLansia?.statusKolesterol.tinggi || 0) > 0 ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {rekapanLansia?.statusKolesterol.tinggi || 0} Tinggi
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-600 font-medium">Asam Urat</span>
                    <span className="font-bold text-gray-900">
                      Rata: {rekapanLansia?.rataRataAsamUrat || 0} mg/dL{" "}
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        (rekapanLansia?.statusAsamUrat.tinggi || 0) > 0 ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {rekapanLansia?.statusAsamUrat.tinggi || 0} Tinggi
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tier 3 - 2-Kolom Grid (Keluhan Terbanyak & Tindakan Medis) */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <h4 className="text-xs font-bold text-saas-muted uppercase tracking-wider">
              Tier 3 — Analisis Keluhan &amp; Tindakan Intervensi
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Keluhan Terbanyak */}
              <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-amber-50 text-amber-600 flex items-center justify-center">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </div>
                    <h5 className="text-xs font-bold text-gray-900">Keluhan Terbanyak Dilaporkan</h5>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-500">
                    {rekapanLansia?.keluhanList?.reduce((acc, k) => acc + k.count, 0) || 0} Keluhan Masuk
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {rekapanLansia?.keluhanList && rekapanLansia.keluhanList.length > 0 ? (
                    rekapanLansia.keluhanList.map((item, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-gray-700">{item.nama}</span>
                          <span className="font-bold text-gray-900">
                            {item.count} Lansia{" "}
                            <span className="text-gray-500 font-normal">({item.persen}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, item.persen)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-gray-400 font-medium">
                      Tidak ada keluhan yang dilaporkan pada periode ini.
                    </div>
                  )}
                </div>
              </div>

              {/* Tindakan Medis & Edukasi */}
              <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-teal-50 text-teal-600 flex items-center justify-center">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <h5 className="text-xs font-bold text-gray-900">Tindakan Medis &amp; Edukasi</h5>
                  </div>
                  <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    {rekapanLansia?.totalMendapatTindakan || 0} Ditindaklanjuti
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {rekapanLansia?.tindakanList && rekapanLansia.tindakanList.length > 0 ? (
                    rekapanLansia.tindakanList.map((item, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-gray-700">{item.nama}</span>
                          <span className="font-bold text-gray-900">
                            {item.count} Tindakan{" "}
                            <span className="text-gray-500 font-normal">({item.persen}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, item.persen)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-gray-400 font-medium">
                      Belum ada intervensi medis atau edukasi yang dicatat.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tier 4 - ⚠️ Lansia Perlu Follow-up (Daftar Aksi Prioritas Kader) */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    Tier 4 — Lansia Perlu Follow-Up &amp; Perhatian Khusus
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800">
                    {rekapanLansia?.lansiaPerluPerhatianList?.length || 0} Kasus
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Lansia dengan temuan klinis berisiko (hipertensi, hiperglikemia, hiperkolesterol, asam urat tinggi, obesitas) untuk diprioritaskan pemantauannya
                </p>
              </div>
            </div>

            {rekapanLansia?.lansiaPerluPerhatianList && rekapanLansia.lansiaPerluPerhatianList.length > 0 ? (
              <div className="border border-rose-200/80 rounded-xl overflow-hidden bg-rose-50/20 shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-rose-100/50 text-rose-950 font-bold border-b border-rose-200/70">
                        <th className="px-3.5 py-2.5">Nama Lansia</th>
                        <th className="px-3.5 py-2.5">Usia &amp; JK</th>
                        <th className="px-3.5 py-2.5">Temuan Medis Berisiko</th>
                        <th className="px-3.5 py-2.5">Keluhan</th>
                        <th className="px-3.5 py-2.5">Rekomendasi Tindak Lanjut</th>
                        <th className="px-3.5 py-2.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-100/70 bg-white">
                      {rekapanLansia.lansiaPerluPerhatianList.map((item) => (
                        <tr key={item.id} className="hover:bg-rose-50/40 transition-colors">
                          <td className="px-3.5 py-2.5 font-bold text-gray-900 whitespace-nowrap">
                            {item.nama}
                          </td>
                          <td className="px-3.5 py-2.5 text-gray-600 whitespace-nowrap">
                            {item.usia} ({item.jenisKelamin})
                          </td>
                          <td className="px-3.5 py-2.5">
                            <div className="flex flex-wrap gap-1">
                              {item.temuan.map((t, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 whitespace-nowrap"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-3.5 py-2.5 text-gray-700">
                            {item.keluhan || "-"}
                          </td>
                          <td className="px-3.5 py-2.5 text-gray-700 font-medium">
                            {item.saran}
                          </td>
                          <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                            {onNavigate && item.pasienId ? (
                              <button
                                onClick={() => onNavigate("Lansia", item.pasienId)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                              >
                                Buka Profil
                              </button>
                            ) : (
                              <span className="text-[11px] text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-900">Kondisi Baik: Semua Lansia dalam Batas Terkendali</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Tidak ditemukan lansia dengan tekanan darah stage 2, kadar gula darah tinggi (≥200 mg/dL), atau risiko metabolik berat pada periode ini.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Detail Data Pemeriksaan Lansia Table */}
          <div className="pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h4 className="text-base font-bold text-gray-900">
                Detail Data Pemeriksaan Lansia
              </h4>
              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-600 flex items-center gap-1.5">
                  <span>Tampilkan</span>
                  <select
                    value={pageSizeLansia}
                    onChange={(e) => {
                      setPageSizeLansia(Number(e.target.value));
                      setPageLansia(1);
                    }}
                    className="px-2 py-1 border border-gray-300 rounded-lg text-xs font-semibold text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                  >
                    <option value={10} className="text-gray-900">10</option>
                    <option value={25} className="text-gray-900">25</option>
                    <option value={50} className="text-gray-900">50</option>
                    <option value={100} className="text-gray-900">100</option>
                  </select>
                  <span>data</span>
                </div>
                <div className="relative w-48 sm:w-60">
                  <input
                    type="text"
                    placeholder="Cari nama lansia..."
                    value={searchLansia}
                    onChange={(e) => {
                      setSearchLansia(e.target.value);
                      setPageLansia(1);
                    }}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                  <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">No</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Nama Lansia</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Tanggal Lahir</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">NIK</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">JK</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Usia</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Riw HT</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Riw DM</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Tekanan Darah (TD)</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">GDS (mg/dL)</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Kolesterol</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Asam Urat</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">L.Perut</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Keluhan</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Tindakan Medis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredLansiaLogs.length === 0 ? (
                    <tr>
                      <td colSpan={15} className="py-8 text-center text-xs text-gray-500 font-medium">
                        Tidak ada catatan pemeriksaan Lansia yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredLansiaLogs
                      .slice((pageLansia - 1) * pageSizeLansia, pageLansia * pageSizeLansia)
                      .map((log, idx) => {
                        const sistol = log.tekananDarahSistol || 0;
                        const diastol = log.tekananDarahDiastol || 0;
                        const gds = log.gulaDarahSewaktu || 0;

                        let usiaTahun = "-";
                        if (log.tanggalLahir) {
                          const lahir = new Date(log.tanggalLahir);
                          const sekarang = new Date();
                          usiaTahun = Math.floor(
                            (sekarang.getTime() - lahir.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
                          ).toString();
                        }

                        return (
                          <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-3 py-2.5 text-gray-900 font-medium whitespace-nowrap">
                              {(pageLansia - 1) * pageSizeLansia + idx + 1}
                            </td>
                            <td className="px-3 py-2.5 text-gray-900 font-bold whitespace-nowrap">
                              {onNavigate && log.pasienId ? (
                                <button
                                  type="button"
                                  onClick={() => onNavigate("Lansia", log.pasienId)}
                                  className="text-gray-900 font-bold hover:text-teal-600 hover:underline text-left transition-colors cursor-pointer"
                                  title={`Lihat Profil ${log.nama}`}
                                >
                                  {log.nama || "-"}
                                </button>
                              ) : (
                                <span>{log.nama || "-"}</span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{log.tanggalLahir || "-"}</td>
                            <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{log.nik || "-"}</td>
                            <td className="px-3 py-2.5 text-gray-600 font-semibold whitespace-nowrap">{log.jenisKelamin || "-"}</td>
                            <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{usiaTahun !== "-" ? `${usiaTahun} th` : "-"}</td>
                            <td className="px-3 py-2.5 text-gray-600 font-semibold whitespace-nowrap">{(log as any).riwayatHt ? "Ya" : "Tdk"}</td>
                            <td className="px-3 py-2.5 text-gray-600 font-semibold whitespace-nowrap">{(log as any).riwayatDm ? "Ya" : "Tdk"}</td>
                            <td className="px-3 py-2.5 text-gray-900 font-bold whitespace-nowrap">
                              {sistol && diastol ? `${sistol}/${diastol} mmHg` : "-"}
                            </td>
                            <td className="px-3 py-2.5 text-gray-900 font-bold whitespace-nowrap">{gds ? `${gds} mg/dL` : "-"}</td>
                            <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{log.kolesterol ? `${log.kolesterol} mg/dL` : "-"}</td>
                            <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{log.asamUrat ? `${log.asamUrat} mg/dL` : "-"}</td>
                            <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{log.lingkarPerut ? `${log.lingkarPerut} cm` : "-"}</td>
                            <td className="px-3 py-2.5 text-gray-700 max-w-[160px] truncate" title={log.keluhan || "-"}>
                              {log.keluhan || "-"}
                            </td>
                            <td className="px-3 py-2.5 text-gray-700 max-w-[180px] truncate" title={log.tindakan || "-"}>
                              {log.tindakan || "-"}
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredLansiaLogs.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-xs text-gray-600">
                  Menampilkan {(pageLansia - 1) * pageSizeLansia + 1} - {Math.min(pageLansia * pageSizeLansia, filteredLansiaLogs.length)} dari {filteredLansiaLogs.length} data
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={pageLansia <= 1}
                    onClick={() => setPageLansia((prev) => Math.max(1, prev - 1))}
                    className="px-2.5 py-1 text-xs font-semibold rounded border border-gray-300 hover:bg-gray-50 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Sebelumnya
                  </button>
                  <span className="px-3 py-1 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 rounded">
                    Hal {pageLansia} / {Math.max(1, Math.ceil(filteredLansiaLogs.length / pageSizeLansia))}
                  </span>
                  <button
                    type="button"
                    disabled={pageLansia >= Math.ceil(filteredLansiaLogs.length / pageSizeLansia)}
                    onClick={() => setPageLansia((prev) => prev + 1)}
                    className="px-2.5 py-1 text-xs font-semibold rounded border border-gray-300 hover:bg-gray-50 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL PRATINJAU DOKUMEN LAPORAN */}
      {mounted && isPreviewOpen && createPortal(
        <div
          onClick={handleClosePreview}
          style={{ margin: 0 }}
          className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] !m-0 !mt-0 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-5 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-6xl h-[92vh] rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden relative"
          >
            {/* Modal Header */}
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50/90">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    Pratinjau Laporan Register Posyandu
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      {filterCategory}
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Periode: <span className="font-semibold text-gray-700">{periodeText}</span> • Format A4 Landscape Register Resmi
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClosePreview}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Tutup pratinjau (Esc / klik di luar)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body / Viewer */}
            <div className="flex-1 bg-gray-100 p-2 sm:p-3 overflow-hidden relative">
              {previewLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                  <p className="text-sm font-semibold text-gray-700">Mempersiapkan pratinjau dokumen PDF...</p>
                  <p className="text-xs text-gray-500 max-w-sm">Menyusun register format landscape resmi Posyandu...</p>
                </div>
              ) : previewError ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <AlertTriangle className="w-10 h-10 text-amber-500" />
                  <p className="text-sm font-bold text-gray-900">Gagal Memuat Pratinjau</p>
                  <p className="text-xs text-gray-600 max-w-md">{previewError}</p>
                  <button
                    type="button"
                    onClick={handleOpenPreview}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-all"
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : previewPdfUrl ? (
                <iframe
                  id="preview-pdf-frame"
                  src={`${previewPdfUrl}#toolbar=1&navpanes=0`}
                  title="Pratinjau PDF Laporan"
                  className="w-full h-full rounded-xl border border-gray-300 shadow-sm bg-white"
                />
              ) : null}
            </div>

            {/* Modal Footer / Actions */}
            <div className="px-5 py-3 border-t border-gray-200 bg-white flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-gray-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Dokumen siap dicetak atau diunduh</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClosePreview}
                  className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Tutup
                </button>

                <button
                  type="button"
                  onClick={handlePrintPdf}
                  disabled={!previewPdfUrl || previewLoading}
                  className="px-3.5 py-2 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  title="Cetak langsung melalui browser"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportExcel}
                  disabled={exportingExcel}
                  className="px-3.5 py-2 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  title="Unduh laporan dalam format Excel"
                >
                  {exportingExcel ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  <span>Unduh Excel</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadFromPreview}
                  disabled={!previewPdfUrl || previewLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  title="Simpan dokumen PDF ke perangkat"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
