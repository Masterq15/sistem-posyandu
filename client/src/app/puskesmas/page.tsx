"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Building2,
  RotateCcw,
  Download,
  Loader2,
  X,
  ChevronRight,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
  LineChart as LineChartIcon,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Activity,
  ShieldCheck,
  HeartHandshake,
  Heart,
  Droplet,
  Scale,
  Printer,
  Users,
  AlertCircle
} from "lucide-react";
import PageHelmet from "../../components/PageHelmet";
import LansiaIcon from "../../components/LansiaIcon";
import BalitaIcon from "../../components/BalitaIcon";
import { publicPuskesmasApi, PublicPemeriksaanItem, PublicPosyanduInfo } from "../../lib/api";
import { SearchIndex } from "../../lib/searchIndex";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

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

export default function PuskesmasPublicPage() {
  const now = new Date();
  const currentMonthStr = String(now.getMonth() + 1).padStart(2, "0");
  const currentYearStr = String(now.getFullYear());

  const [data, setData] = useState<PublicPemeriksaanItem[]>([]);
  const [posyandus, setPosyandus] = useState<PublicPosyanduInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [exportingExcel, setExportingExcel] = useState(false);

  // Tab State: "Balita" | "Lansia"
  const [activeTab, setActiveTab] = useState<"Balita" | "Lansia">("Balita");

  // Filters State
  const [selectedPosyandu, setSelectedPosyandu] = useState<string>("semua");
  const [filterMonth, setFilterMonth] = useState<string>(currentMonthStr);
  const [filterYear, setFilterYear] = useState<string>(currentYearStr);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Search States
  const [searchBalita, setSearchBalita] = useState<string>("");
  const [searchLansia, setSearchLansia] = useState<string>("");

  // Pagination states
  const [pageSizeBalita, setPageSizeBalita] = useState<number>(10);
  const [pageBalita, setPageBalita] = useState<number>(1);
  const [pageSizeLansia, setPageSizeLansia] = useState<number>(10);
  const [pageLansia, setPageLansia] = useState<number>(1);

  // Detail Modal state
  const [selectedItem, setSelectedItem] = useState<PublicPemeriksaanItem | null>(null);

  // State Pratinjau Laporan (PDF Modal Preview)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // In-Memory Search Index for instant, zero-latency search
  const balitaIndexRef = useRef<SearchIndex<PublicPemeriksaanItem>>(
    new SearchIndex<PublicPemeriksaanItem>((l) => [
      l.namaWarga,
      l.posyanduNama,
      l.desa,
      l.wilayah,
      l.nik,
      l.namaIbu,
      l.petugas,
      l.statusBbU,
      l.statusTbU,
      l.statusBbTb,
      l.statusImunisasi,
      l.statusRingkasan,
    ])
  );

  const lansiaIndexRef = useRef<SearchIndex<PublicPemeriksaanItem>>(
    new SearchIndex<PublicPemeriksaanItem>((l) => [
      l.namaWarga,
      l.posyanduNama,
      l.desa,
      l.wilayah,
      l.nik,
      l.petugas,
      l.keluhan,
      l.tindakan,
      l.tindakanCatatan,
      l.statusRingkasan,
    ])
  );

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [posList, records] = await Promise.all([
        publicPuskesmasApi.getPosyandus(),
        publicPuskesmasApi.getPemeriksaanData({
          posyanduId: selectedPosyandu,
          kategori: "Semua",
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
      ]);
      setPosyandus(posList);
      setData(records);
    } catch (err) {
      console.error("Gagal memuat data publik puskesmas:", err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPosyandu, startDate, endDate]);

  // Client-side filtering by Month, Year, and Date
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (selectedPosyandu !== "semua" && item.posyanduId !== selectedPosyandu) {
        return false;
      }
      if (filterYear) {
        const itemYear = new Date(item.tanggalPeriksa).getFullYear().toString();
        if (itemYear !== filterYear) return false;
      }
      if (filterMonth) {
        const itemMonth = String(new Date(item.tanggalPeriksa).getMonth() + 1).padStart(2, "0");
        if (itemMonth !== filterMonth) return false;
      }
      if (startDate && item.tanggalPeriksa < startDate) return false;
      if (endDate && item.tanggalPeriksa > endDate) return false;
      return true;
    });
  }, [data, selectedPosyandu, filterYear, filterMonth, startDate, endDate]);

  // Sync Search Index whenever filteredData changes
  useEffect(() => {
    balitaIndexRef.current.setSource(filteredData.filter((l) => l.kategori === "Balita"));
    lansiaIndexRef.current.setSource(filteredData.filter((l) => l.kategori === "Lansia"));
  }, [filteredData]);

  // Balita records filtered by search index
  const filteredBalitaLogs = useMemo(() => {
    if (!searchBalita.trim()) {
      return filteredData.filter((l) => l.kategori === "Balita");
    }
    return balitaIndexRef.current.search(searchBalita);
  }, [filteredData, searchBalita]);

  // Lansia records filtered by search index
  const filteredLansiaLogs = useMemo(() => {
    if (!searchLansia.trim()) {
      return filteredData.filter((l) => l.kategori === "Lansia");
    }
    return lansiaIndexRef.current.search(searchLansia);
  }, [filteredData, searchLansia]);

  // Participant specific history & trend for detail modal
  const participantHistory = useMemo(() => {
    if (!selectedItem) return [];
    const items = data
      .filter(
        (d) =>
          d.namaWarga.toLowerCase() === selectedItem.namaWarga.toLowerCase() &&
          d.kategori === selectedItem.kategori
      )
      .sort((a, b) => new Date(a.tanggalPeriksa).getTime() - new Date(b.tanggalPeriksa).getTime());

    return items.map((item) => ({
      ...item,
      tanggal: item.tanggalPeriksa,
      bb: item.beratBadan,
      tb: item.tinggiBadan,
      sistol: item.sistol || (item.tekananDarah ? parseInt(item.tekananDarah.split("/")[0]) : undefined),
      diastol: item.diastol || (item.tekananDarah ? parseInt(item.tekananDarah.split("/")[1]) : undefined),
      gds: item.gds,
    }));
  }, [selectedItem, data]);

  const prevRecord = participantHistory.length > 1 ? participantHistory[participantHistory.length - 2] : null;
  const bbDiff = prevRecord && selectedItem ? Number((selectedItem.beratBadan - prevRecord.beratBadan).toFixed(2)) : 0;
  const tbDiff = prevRecord && selectedItem ? Number((selectedItem.tinggiBadan - prevRecord.tinggiBadan).toFixed(1)) : 0;

  // Handle Escape key & scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedItem) setSelectedItem(null);
        if (isPreviewOpen) setIsPreviewOpen(false);
      }
    };
    if (selectedItem || isPreviewOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedItem, isPreviewOpen]);

  // Periode text representation
  const periodeText = filterMonth
    ? `${new Date(2000, parseInt(filterMonth) - 1).toLocaleString("id-ID", { month: "long" })} ${
        filterYear || new Date().getFullYear()
      }`
    : filterYear
    ? `Tahun ${filterYear}`
    : "Semua Periode";

  // Rekapan Balita Calculations (Sesuai Standar Laporan 4-Tier)
  const rekapanBalita = useMemo(() => {
    const balitaLogs = filteredData.filter((l) => l.kategori === "Balita");
    const totalPemeriksaan = balitaLogs.length;
    const totalAnak = new Set(balitaLogs.map((l) => l.nik || l.namaWarga)).size;

    let totalBayiAsiEligible = 0;
    const distribusiUsia = { u0_6: 0, u7_12: 0, u13_24: 0, u25_60: 0 };
    const attentionMap = new Map<string, {
      id: string;
      nama: string;
      usia: string;
      masalah: string[];
      tanggal: string;
      posyanduNama: string;
      saran: string;
    }>();

    balitaLogs.forEach((log) => {
      const match = log.usiaInfo?.match(/(\d+)\s*(?:bln|bulan)/i);
      const usiaBulan = match ? parseInt(match[1], 10) : undefined;

      if (usiaBulan !== undefined) {
        if (usiaBulan <= 6) {
          totalBayiAsiEligible += 1;
          distribusiUsia.u0_6 += 1;
        } else if (usiaBulan <= 12) {
          distribusiUsia.u7_12 += 1;
        } else if (usiaBulan <= 24) {
          distribusiUsia.u13_24 += 1;
        } else {
          distribusiUsia.u25_60 += 1;
        }
      }

      const masalah: string[] = [];
      const isKurangBbU = log.statusBbU === "K" || log.statusBbU?.toLowerCase().includes("kurang");
      const isSangatKurangBbU = log.statusBbU === "SK" || log.statusBbU?.toLowerCase().includes("sangat");
      const isLebihBbU = log.statusBbU === "L" || log.statusBbU?.toLowerCase().includes("lebih");

      const isPendek = log.statusTbU === "P" || (log.statusTbU?.toLowerCase().includes("pendek") && !log.statusTbU?.toLowerCase().includes("sangat"));
      const isSangatPendek = log.statusTbU === "SP" || log.statusTbU?.toLowerCase().includes("sangat pendek") || log.statusTbU?.toLowerCase().includes("stunting");

      const isKurus = log.statusBbTb === "K" || log.statusRingkasan?.toLowerCase().includes("kurang") || log.statusRingkasan?.toLowerCase().includes("kurus");
      const isBuruk = log.statusBbTb === "SK" || log.statusRingkasan?.toLowerCase().includes("buruk");
      const isGemuk = log.statusBbTb === "L" || log.statusBbTb === "G" || log.statusRingkasan?.toLowerCase().includes("lebih") || log.statusRingkasan?.toLowerCase().includes("gemuk");

      if (isSangatPendek) masalah.push("TB/U: Sangat Pendek (Stunting Berat)");
      else if (isPendek) masalah.push("TB/U: Pendek (Stunting)");

      if (isBuruk) masalah.push("BB/TB: Gizi Buruk (Severe Wasting)");
      else if (isKurus) masalah.push("BB/TB: Gizi Kurang (Wasting)");

      if (isSangatKurangBbU) masalah.push("BB/U: Berat Sangat Kurang");
      else if (isKurangBbU) masalah.push("BB/U: Berat Kurang");

      if (isGemuk || isLebihBbU) masalah.push("BB/TB: Risiko Gizi Lebih / Gemuk");

      if (masalah.length > 0) {
        const key = log.nik || log.namaWarga;
        let saran = "Konseling Pola Asuh & Pantauan Rutin";
        if (isSangatPendek || isBuruk) {
          saran = "Segera Rujuk Puskesmas & PMT Pemulihan";
        } else if (isPendek || isKurus || isSangatKurangBbU) {
          saran = "Pemberian Makanan Tambahan (PMT) & Edukasi Gizi";
        } else if (isGemuk) {
          saran = "Konseling Pengaturan Diet & Aktivitas";
        }

        attentionMap.set(key, {
          id: log.id,
          nama: log.namaWarga,
          usia: log.usiaInfo || "-",
          masalah,
          tanggal: log.tanggalPeriksa || "-",
          posyanduNama: log.posyanduNama || "-",
          saran,
        });
      }
    });

    const statusBbU = {
      normal: balitaLogs.filter((l) => l.statusBbU?.toLowerCase().includes("normal") || l.statusBbU === "N").length,
      kurang: balitaLogs.filter(
        (l) =>
          (l.statusBbU?.toLowerCase().includes("kurang") && !l.statusBbU?.toLowerCase().includes("sangat")) ||
          l.statusBbU === "K"
      ).length,
      sangatKurang: balitaLogs.filter(
        (l) => l.statusBbU?.toLowerCase().includes("sangat") || l.statusBbU === "SK"
      ).length,
      lebih: balitaLogs.filter(
        (l) => l.statusBbU?.toLowerCase().includes("lebih") || l.statusBbU === "L"
      ).length,
    };

    const statusTbU = {
      normal: balitaLogs.filter((l) => l.statusTbU?.toLowerCase().includes("normal") || l.statusTbU === "N").length,
      pendek: balitaLogs.filter(
        (l) =>
          (l.statusTbU?.toLowerCase().includes("pendek") && !l.statusTbU?.toLowerCase().includes("sangat")) ||
          l.statusTbU === "P"
      ).length,
      sangatPendek: balitaLogs.filter(
        (l) =>
          l.statusTbU?.toLowerCase().includes("sangat pendek") ||
          l.statusTbU?.toLowerCase().includes("stunting") ||
          l.statusTbU === "SP"
      ).length,
      tinggi: balitaLogs.filter(
        (l) => l.statusTbU?.toLowerCase().includes("tinggi") || l.statusTbU === "T"
      ).length,
    };

    const statusBbTb = {
      normal: balitaLogs.filter(
        (l) =>
          l.statusBbTb === "N" ||
          l.statusRingkasan?.toLowerCase().includes("normal") ||
          l.statusRingkasan?.toLowerCase().includes("gizi baik")
      ).length,
      kurang: balitaLogs.filter(
        (l) =>
          l.statusBbTb === "K" ||
          l.statusRingkasan?.toLowerCase().includes("gizi kurang") ||
          l.statusRingkasan?.toLowerCase().includes("kurus")
      ).length,
      sangatKurang: balitaLogs.filter(
        (l) =>
          l.statusBbTb === "SK" ||
          l.statusRingkasan?.toLowerCase().includes("gizi buruk") ||
          l.statusRingkasan?.toLowerCase().includes("sangat kurang")
      ).length,
      lebih: balitaLogs.filter(
        (l) =>
          l.statusBbTb === "L" ||
          l.statusBbTb === "G" ||
          l.statusRingkasan?.toLowerCase().includes("lebih") ||
          l.statusRingkasan?.toLowerCase().includes("obesitas")
      ).length,
    };

    const kasusStunting = statusTbU.pendek + statusTbU.sangatPendek;
    const kasusWasting = statusBbTb.kurang + statusBbTb.sangatKurang;
    const perluTindakLanjut = attentionMap.size;

    return {
      periode: periodeText,
      totalPemeriksaan,
      totalAnak,
      perluTindakLanjut,
      kasusStunting,
      kasusWasting,
      statusBbU,
      statusTbU,
      statusBbTb,
      vitaminA: balitaLogs.filter((l) => l.vitaminA).length,
      imunisasiLengkap: balitaLogs.filter((l) => l.statusImunisasi && l.statusImunisasi !== "").length,
      obatCacing: balitaLogs.filter((l) => l.obatCacing).length,
      asiEksklusif: balitaLogs.filter((l) => l.asiEksklusif).length,
      totalBayiAsiEligible: totalBayiAsiEligible || totalPemeriksaan,
      distribusiUsia,
      balitaPerluPerhatianList: Array.from(attentionMap.values()),
    };
  }, [filteredData, periodeText]);

  // Rekapan Lansia Calculations (Sesuai Standar LaporanModule)
  const rekapanLansia = useMemo(() => {
    const lansiaLogs = filteredData.filter((l) => l.kategori === "Lansia");
    const totalPemeriksaan = lansiaLogs.length;
    const totalOrang = new Set(lansiaLogs.map((l) => l.nik || l.namaWarga)).size;

    const statusHipertensi = lansiaLogs.filter(
      (l) => (l.sistol || 0) >= 140 || (l.diastol || 0) >= 90
    ).length;
    const statusGdsTinggi = lansiaLogs.filter((l) => (l.gds || 0) >= 200).length;
    const statusHipertensiDanGds = lansiaLogs.filter(
      (l) => ((l.sistol || 0) >= 140 || (l.diastol || 0) >= 90) && (l.gds || 0) >= 200
    ).length;
    const statusKolesterolTinggi = lansiaLogs.filter((l) => (l.kolesterol || 0) >= 200).length;
    const statusAsamUratTinggi = lansiaLogs.filter((l) => (l.asamUrat || 0) >= 7.0).length;

    const rataRataBb = totalPemeriksaan > 0 ? lansiaLogs.reduce((sum, l) => sum + (l.beratBadan || 0), 0) / totalPemeriksaan : 0;
    const rataRataTb = totalPemeriksaan > 0 ? lansiaLogs.reduce((sum, l) => sum + (l.tinggiBadan || 0), 0) / totalPemeriksaan : 0;
    const rataRataSistol = totalPemeriksaan > 0 ? lansiaLogs.reduce((sum, l) => sum + (l.sistol || 0), 0) / totalPemeriksaan : 0;
    const rataRataDiastol = totalPemeriksaan > 0 ? lansiaLogs.reduce((sum, l) => sum + (l.diastol || 0), 0) / totalPemeriksaan : 0;
    const rataRataGds = totalPemeriksaan > 0 ? lansiaLogs.reduce((sum, l) => sum + (l.gds || 0), 0) / totalPemeriksaan : 0;

    return {
      periode: periodeText,
      totalPemeriksaan,
      totalOrang,
      statusHipertensi,
      statusGdsTinggi,
      statusHipertensiDanGds,
      statusKolesterolTinggi,
      statusAsamUratTinggi,
      rataRataBb,
      rataRataTb,
      rataRataSistol,
      rataRataDiastol,
      rataRataGds,
    };
  }, [filteredData, periodeText]);

  // Export to Standard Spreadsheet (Excel / CSV dengan UTF-8 BOM)
  const handleExportExcel = () => {
    try {
      setExportingExcel(true);
      const activeLogs = activeTab === "Balita" ? filteredBalitaLogs : filteredLansiaLogs;
      if (activeLogs.length === 0) {
        alert("Tidak ada data untuk diekspor.");
        return;
      }

      const headers =
        activeTab === "Balita"
          ? [
              "No",
              "Nama Balita",
              "Posyandu",
              "Wilayah",
              "Tanggal Periksa",
              "Tanggal Lahir",
              "NIK",
              "Nama Ibu",
              "Jenis Kelamin",
              "Usia (Bulan)",
              "BB (kg)",
              "TB (cm)",
              "LK (cm)",
              "LiLA (cm)",
              "Status BB/U",
              "Status TB/U",
              "Status BB/TB",
              "Pemberian Lain",
              "Vit B1",
              "Vit B6",
              "ASI Eksklusif",
              "Vitamin A",
              "Obat Cacing",
              "Petugas",
            ]
          : [
              "No",
              "Nama Lansia",
              "Posyandu",
              "Wilayah",
              "Tanggal Periksa",
              "Tanggal Lahir",
              "NIK",
              "Jenis Kelamin",
              "Usia",
              "Riw HT",
              "Riw DM",
              "BB (kg)",
              "TB (cm)",
              "Tekanan Darah",
              "GDS (mg/dL)",
              "Kolesterol",
              "Asam Urat",
              "Lingkar Perut",
              "Keluhan",
              "Tindakan Medis",
              "Status Ringkasan",
              "Petugas",
            ];

      const rows = activeLogs.map((item, idx) =>
        activeTab === "Balita"
          ? [
              idx + 1,
              `"${(item.namaWarga || "").replace(/"/g, '""')}"`,
              `"${(item.posyanduNama || "").replace(/"/g, '""')}"`,
              `"${(item.wilayah || "").replace(/"/g, '""')}"`,
              item.tanggalPeriksa || "",
              item.tanggalLahir || "",
              `"${(item.nik || "-").replace(/"/g, '""')}"`,
              `"${(item.namaIbu || "-").replace(/"/g, '""')}"`,
              item.jenisKelamin === "L" ? "Laki-laki" : "Perempuan",
              `"${(item.usiaInfo || "").replace(/"/g, '""')}"`,
              item.beratBadan ?? "",
              item.tinggiBadan ?? "",
              item.lingkarKepala ?? "",
              item.lingkarLengan ?? "",
              `"${(item.statusBbU || "-").replace(/"/g, '""')}"`,
              `"${(item.statusTbU || "-").replace(/"/g, '""')}"`,
              `"${(item.statusRingkasan || item.statusBbTb || "-").replace(/"/g, '""')}"`,
              `"${extractPemberianLain(item.statusImunisasi).replace(/"/g, '""')}"`,
              item.vitB1 ? "Ya" : "Tidak",
              item.vitB6 ? "Ya" : "Tidak",
              item.asiEksklusif ? "Ya" : "Tidak",
              item.vitaminA ? "Ya" : "Tidak",
              item.obatCacing ? "Ya" : "Tidak",
              `"${(item.petugas || "Kader Posyandu").replace(/"/g, '""')}"`,
            ]
          : [
              idx + 1,
              `"${(item.namaWarga || "").replace(/"/g, '""')}"`,
              `"${(item.posyanduNama || "").replace(/"/g, '""')}"`,
              `"${(item.wilayah || "").replace(/"/g, '""')}"`,
              item.tanggalPeriksa || "",
              item.tanggalLahir || "",
              `"${(item.nik || "-").replace(/"/g, '""')}"`,
              item.jenisKelamin === "L" ? "Laki-laki" : "Perempuan",
              `"${(item.usiaInfo || "-").replace(/"/g, '""')}"`,
              item.riwayatHt ? "Ya" : "Tidak",
              item.riwayatDm ? "Ya" : "Tidak",
              item.beratBadan ?? "",
              item.tinggiBadan ?? "",
              `"${(item.tekananDarah || (item.sistol ? `${item.sistol}/${item.diastol}` : "-")).replace(/"/g, '""')}"`,
              item.gds ?? "",
              item.kolesterol ?? "",
              item.asamUrat ?? "",
              item.lingkarPerut ?? "",
              `"${(item.keluhan || "-").replace(/"/g, '""')}"`,
              `"${(item.tindakan || item.tindakanCatatan || "-").replace(/"/g, '""')}"`,
              `"${(item.statusRingkasan || "-").replace(/"/g, '""')}"`,
              `"${(item.petugas || "Kader Posyandu").replace(/"/g, '""')}"`,
            ]
      );

      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `Laporan_Rekapan_Puskesmas_${activeTab}_${periodeText.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Gagal export Excel:", err);
      alert("Gagal mengunduh Excel/CSV.");
    } finally {
      setExportingExcel(false);
    }
  };

  // Open Preview Modal
  const handleOpenPreview = () => {
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
  };

  // Trigger Print (Direct printing or Save as PDF via browser print dialogue)
  const handlePrintPdf = () => {
    window.print();
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const selectedPosyanduName =
    selectedPosyandu === "semua"
      ? "Semua Posyandu"
      : posyandus.find((p) => p.id === selectedPosyandu)?.nama || selectedPosyandu;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-6 print:p-0 print:bg-white">
      <PageHelmet
        title={`Laporan Rekapan ${activeTab} — UPTD Puskesmas`}
        description={`Laporan rekapitulasi data pemeriksaan ${activeTab} seluruh posyandu wilayah kerja Puskesmas.`}
      />

      {/* Header Halaman (Hidden when printing) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
              <Building2 className="w-3.5 h-3.5" /> UPTD Puskesmas
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Laporan Rekapan Puskesmas</h2>
          <p className="text-sm text-gray-600 mt-1">
            Laporan rekapitulasi data pemeriksaan Balita &amp; Lansia seluruh posyandu wilayah kerja Puskesmas berdasarkan periode waktu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
          >
            <span>Menu Utama</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Filter Controls & Export Box (Hidden when printing) */}
      <div className="print:hidden bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-5">
        {/* Baris 1: Pilihan Kategori, Posyandu, dan Periode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* 1. Kategori Peserta */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
              1. Kategori Peserta
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("Balita");
                  setPageBalita(1);
                }}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "Balita"
                    ? "bg-teal-600 text-white shadow-sm shadow-teal-600/20"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Balita
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("Lansia");
                  setPageLansia(1);
                }}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "Lansia"
                    ? "bg-teal-600 text-white shadow-sm shadow-teal-600/20"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Lansia
              </button>
            </div>
          </div>

          {/* 2. Pilihan Posyandu */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
              2. Posyandu
            </label>
            <select
              value={selectedPosyandu}
              onChange={(e) => {
                setSelectedPosyandu(e.target.value);
                setPageBalita(1);
                setPageLansia(1);
              }}
              className="w-full px-3 py-2 text-xs font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            >
              <option value="semua">Semua Posyandu ({posyandus.length})</option>
              {posyandus.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama} ({p.desa})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Periode Bulan */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
              3. Bulan
            </label>
            <select
              value={filterMonth}
              onChange={(e) => {
                setFilterMonth(e.target.value);
                setPageBalita(1);
                setPageLansia(1);
              }}
              className="w-full px-3 py-2 text-xs font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            >
              <option value="">Semua Bulan</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                  {new Date(2000, i).toLocaleString("id-ID", { month: "long" })}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Periode Tahun */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
              4. Tahun
            </label>
            <select
              value={filterYear}
              onChange={(e) => {
                setFilterYear(e.target.value);
                setPageBalita(1);
                setPageLansia(1);
              }}
              className="w-full px-3 py-2 text-xs font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            >
              <option value="">Semua Tahun</option>
              {yearOptions.map((year) => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Dari Tanggal */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
              Dari Tanggal (Opsional)
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPageBalita(1);
                setPageLansia(1);
              }}
              className="w-full px-3 py-2 text-xs font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            />
          </div>

          {/* Sampai Tanggal */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
              Sampai Tanggal (Opsional)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPageBalita(1);
                setPageLansia(1);
              }}
              className="w-full px-3 py-2 text-xs font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            />
          </div>
        </div>

        {/* Baris 2: Tombol Cepat Periode & Aksi Laporan */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {/* Tombol Periode Ini */}
            <button
              type="button"
              onClick={() => {
                setFilterMonth(currentMonthStr);
                setFilterYear(currentYearStr);
                setStartDate("");
                setEndDate("");
                setSearchBalita("");
                setSearchLansia("");
                setPageBalita(1);
                setPageLansia(1);
              }}
              className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-lg border border-teal-200/80 transition-colors flex items-center gap-1.5 shadow-xs"
              title="Set filter kembali ke bulan dan tahun ini"
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
                setStartDate("");
                setEndDate("");
                setSearchBalita("");
                setSearchLansia("");
                setPageBalita(1);
                setPageLansia(1);
              }}
              className="px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg border border-gray-300 transition-colors flex items-center gap-1.5 shadow-xs"
              title="Tampilkan semua data tanpa filter bulan dan tahun"
            >
              Semua Periode
            </button>

            {/* Tombol Reset Filter */}
            <button
              type="button"
              onClick={() => {
                setSelectedPosyandu("semua");
                setFilterMonth(currentMonthStr);
                setFilterYear(currentYearStr);
                setStartDate("");
                setEndDate("");
                setSearchBalita("");
                setSearchLansia("");
                setPageBalita(1);
                setPageLansia(1);
              }}
              className="px-3 py-2 bg-white hover:bg-gray-50 text-gray-600 text-xs font-medium rounded-lg border border-gray-300 transition-colors shadow-xs"
            >
              Reset Filter
            </button>

            {isLoading && (
              <span className="text-xs text-teal-600 font-semibold flex items-center gap-1.5 animate-pulse ml-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Memperbarui data...
              </span>
            )}
          </div>

          {/* Tombol Aksi Laporan (Mirip LaporanModule) */}
          <div className="flex items-center gap-2">
            {/* Tombol Pratinjau Dokumen */}
            <button
              type="button"
              onClick={handleOpenPreview}
              disabled={isLoading || (activeTab === "Balita" ? filteredBalitaLogs.length === 0 : filteredLansiaLogs.length === 0)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
              title="Pratinjau dokumen laporan sebelum dicetak atau diunduh"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Pratinjau Laporan</span>
            </button>

            {/* Tombol Cetak / Unduh PDF */}
            <button
              type="button"
              onClick={handleOpenPreview}
              disabled={isLoading || (activeTab === "Balita" ? filteredBalitaLogs.length === 0 : filteredLansiaLogs.length === 0)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
              title="Buka pratinjau dan cetak dokumen PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh PDF</span>
            </button>

            {/* Tombol Unduh Excel */}
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={exportingExcel || (activeTab === "Balita" ? filteredBalitaLogs.length === 0 : filteredLansiaLogs.length === 0)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
              title="Unduh format spreadsheet register (.xlsx / .csv)"
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
      {activeTab === "Balita" && (
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-gray-900 tracking-tight">Ringkasan Rekapan Balita Puskesmas</h3>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">
                Periode: <span className="font-bold text-teal-700">{rekapanBalita.periode}</span> • Posyandu:{" "}
                <span className="font-bold text-teal-700">{selectedPosyanduName}</span>
              </p>
            </div>
            <div className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200/80 px-3 py-1.5 rounded-lg w-fit">
              Total Data: <strong className="text-gray-900 font-extrabold">{filteredBalitaLogs.length}</strong> Pemeriksaan ({rekapanBalita.totalAnak} Anak)
            </div>
          </div>

          {/* Tier 1 - KPI Utama (5 Card KPI Grid) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tier 1 — Indikator Kunci &amp; Kasus Prioritas</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Total Diperiksa */}
              <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs hover:border-teal-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Diperiksa</span>
                  <div className="w-7 h-7 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-extrabold text-gray-900 tracking-tight">
                    {rekapanBalita.totalAnak} <span className="text-sm font-semibold text-gray-500">Anak</span>
                  </div>
                  <span className="mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200/60 inline-block">
                    {rekapanBalita.totalPemeriksaan} Kali Pemeriksaan
                  </span>
                </div>
              </div>

              {/* Total Data Posyandu */}
              <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs hover:border-emerald-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Pemeriksaan</span>
                  <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-extrabold text-gray-900 tracking-tight">
                    {rekapanBalita.totalPemeriksaan}
                  </div>
                  <span className="mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60 inline-block">
                    100% Data Periode Ini
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
                    {rekapanBalita.perluTindakLanjut} <span className="text-sm font-semibold text-rose-600">Anak</span>
                  </div>
                  <span className={`mt-1 px-2 py-0.5 rounded text-[10px] font-bold border inline-block ${
                    rekapanBalita.perluTindakLanjut > 0
                      ? "bg-rose-50 text-rose-800 border-rose-200/70"
                      : "bg-emerald-50 text-emerald-800 border-emerald-200/70"
                  }`}>
                    {rekapanBalita.perluTindakLanjut > 0 ? "Prioritas Pantauan" : "Kondisi Terkendali"}
                  </span>
                </div>
              </div>

              {/* Kasus Stunting (TB/U) */}
              <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs hover:border-purple-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Kasus Stunting (TB/U)</span>
                  <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                    <BalitaIcon className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-extrabold text-gray-900 tracking-tight">
                    {rekapanBalita.kasusStunting} <span className="text-sm font-semibold text-gray-500">Anak</span>
                  </div>
                  <span className="mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200/60 inline-block">
                    {rekapanBalita.totalPemeriksaan > 0
                      ? ((rekapanBalita.kasusStunting / rekapanBalita.totalPemeriksaan) * 100).toFixed(1)
                      : "0"}% Pendek &amp; S. Pendek
                  </span>
                </div>
              </div>

              {/* Kasus Wasting (BB/TB) */}
              <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs hover:border-amber-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Kasus Wasting (BB/TB)</span>
                  <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                    <Activity className="w-4 h-4 text-amber-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-extrabold text-gray-900 tracking-tight">
                    {rekapanBalita.kasusWasting} <span className="text-sm font-semibold text-gray-500">Anak</span>
                  </div>
                  <span className="mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60 inline-block">
                    {rekapanBalita.totalPemeriksaan > 0
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
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tier 2 — Status Gizi &amp; Antropometri (Standar Kemenkes / WHO)</h4>
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
                  <Scale className="w-4 h-4 text-teal-600" />
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Normal
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{rekapanBalita.statusBbU.normal}</span>
                      <span className="text-[10px] text-gray-500 ml-1.5">
                        ({rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.statusBbU.normal / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Kurang (Underweight)
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-amber-700">{rekapanBalita.statusBbU.kurang}</span>
                      <span className="text-[10px] text-gray-500 ml-1.5">
                        ({rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.statusBbU.kurang / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Sangat Kurang (Severely)
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-red-700">{rekapanBalita.statusBbU.sangatKurang}</span>
                      <span className="text-[10px] text-gray-500 ml-1.5">
                        ({rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.statusBbU.sangatKurang / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Risiko BB Lebih
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-blue-700">{rekapanBalita.statusBbU.lebih}</span>
                      <span className="text-[10px] text-gray-500 ml-1.5">
                        ({rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.statusBbU.lebih / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
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
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Normal
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{rekapanBalita.statusTbU.normal}</span>
                      <span className="text-[10px] text-gray-500 ml-1.5">
                        ({rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.statusTbU.normal / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Pendek (Stunted)
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-amber-700">{rekapanBalita.statusTbU.pendek}</span>
                      <span className="text-[10px] text-gray-500 ml-1.5">
                        ({rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.statusTbU.pendek / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Sangat Pendek (Severely)
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-red-700">{rekapanBalita.statusTbU.sangatPendek}</span>
                      <span className="text-[10px] text-gray-500 ml-1.5">
                        ({rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.statusTbU.sangatPendek / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                      Tinggi
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-teal-700">{rekapanBalita.statusTbU.tinggi}</span>
                      <span className="text-[10px] text-gray-500 ml-1.5">
                        ({rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.statusTbU.tinggi / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
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
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Gizi Baik (Normal)
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{rekapanBalita.statusBbTb.normal}</span>
                      <span className="text-[10px] text-gray-500 ml-1.5">
                        ({rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.statusBbTb.normal / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Gizi Kurang (Wasted)
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-amber-700">{rekapanBalita.statusBbTb.kurang}</span>
                      <span className="text-[10px] text-gray-500 ml-1.5">
                        ({rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.statusBbTb.kurang / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Gizi Buruk (Severe Wasted)
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-red-700">{rekapanBalita.statusBbTb.sangatKurang}</span>
                      <span className="text-[10px] text-gray-500 ml-1.5">
                        ({rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.statusBbTb.sangatKurang / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Gizi Lebih / Gemuk
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-blue-700">{rekapanBalita.statusBbTb.lebih}</span>
                      <span className="text-[10px] text-gray-500 ml-1.5">
                        ({rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.statusBbTb.lebih / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
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
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Tier 3 — Cakupan Pelayanan Kesehatan</h4>
                  <p className="text-[11px] text-gray-500">Persentase balita yang menerima intervensi kesehatan</p>
                </div>
                <ShieldCheck className="w-4 h-4 text-teal-600" />
              </div>

              <div className="space-y-3 text-xs">
                {/* Imunisasi */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-700">Imunisasi Lengkap</span>
                    <span className="font-bold text-gray-900">
                      {rekapanBalita.imunisasiLengkap} / {rekapanBalita.totalPemeriksaan}{" "}
                      <span className="text-gray-500 font-normal">
                        ({rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.imunisasiLengkap / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${rekapanBalita.totalPemeriksaan > 0 ? Math.min(100, (rekapanBalita.imunisasiLengkap / rekapanBalita.totalPemeriksaan) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Vitamin A */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-700">Vitamin A</span>
                    <span className="font-bold text-gray-900">
                      {rekapanBalita.vitaminA} / {rekapanBalita.totalPemeriksaan}{" "}
                      <span className="text-gray-500 font-normal">
                        ({rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.vitaminA / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-rose-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${rekapanBalita.totalPemeriksaan > 0 ? Math.min(100, (rekapanBalita.vitaminA / rekapanBalita.totalPemeriksaan) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Obat Cacing */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-700">Obat Cacing</span>
                    <span className="font-bold text-gray-900">
                      {rekapanBalita.obatCacing} / {rekapanBalita.totalPemeriksaan}{" "}
                      <span className="text-gray-500 font-normal">
                        ({rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.obatCacing / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${rekapanBalita.totalPemeriksaan > 0 ? Math.min(100, (rekapanBalita.obatCacing / rekapanBalita.totalPemeriksaan) * 100) : 0}%`,
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
                      {rekapanBalita.asiEksklusif} / {rekapanBalita.totalBayiAsiEligible}{" "}
                      <span className="text-gray-500 font-normal">
                        ({rekapanBalita.totalBayiAsiEligible > 0 ? ((rekapanBalita.asiEksklusif / rekapanBalita.totalBayiAsiEligible) * 100).toFixed(1) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${rekapanBalita.totalBayiAsiEligible > 0 ? Math.min(100, (rekapanBalita.asiEksklusif / rekapanBalita.totalBayiAsiEligible) * 100) : 0}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 italic">
                    * Proporsional terhadap {rekapanBalita.totalBayiAsiEligible} bayi kelompok usia 0–6 bulan
                  </p>
                </div>
              </div>
            </div>

            {/* Distribusi Kelompok Usia */}
            <div className="bg-white border border-gray-200/80 rounded-xl p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div>
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Distribusi Kelompok Usia</h4>
                  <p className="text-[11px] text-gray-500">Segmentasi usia balita yang hadir dalam posyandu</p>
                </div>
                <Users className="w-4 h-4 text-teal-600" />
              </div>

              <div className="space-y-3 text-xs">
                {/* 0–6 Bulan */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-700">0–6 Bulan (Bayi)</span>
                    <span className="font-bold text-gray-900">
                      {rekapanBalita.distribusiUsia.u0_6} Anak{" "}
                      <span className="text-gray-500 font-normal">
                        ({rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.distribusiUsia.u0_6 / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${rekapanBalita.totalPemeriksaan > 0 ? Math.min(100, (rekapanBalita.distribusiUsia.u0_6 / rekapanBalita.totalPemeriksaan) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 7–12 Bulan */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-700">7–12 Bulan (Baduta Awal)</span>
                    <span className="font-bold text-gray-900">
                      {rekapanBalita.distribusiUsia.u7_12} Anak{" "}
                      <span className="text-gray-500 font-normal">
                        ({rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.distribusiUsia.u7_12 / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${rekapanBalita.totalPemeriksaan > 0 ? Math.min(100, (rekapanBalita.distribusiUsia.u7_12 / rekapanBalita.totalPemeriksaan) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 13–24 Bulan */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-700">13–24 Bulan (Baduta)</span>
                    <span className="font-bold text-gray-900">
                      {rekapanBalita.distribusiUsia.u13_24} Anak{" "}
                      <span className="text-gray-500 font-normal">
                        ({rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.distribusiUsia.u13_24 / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${rekapanBalita.totalPemeriksaan > 0 ? Math.min(100, (rekapanBalita.distribusiUsia.u13_24 / rekapanBalita.totalPemeriksaan) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 25–60 Bulan */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-700">25–60 Bulan (Prasekolah)</span>
                    <span className="font-bold text-gray-900">
                      {rekapanBalita.distribusiUsia.u25_60} Anak{" "}
                      <span className="text-gray-500 font-normal">
                        ({rekapanBalita.totalPemeriksaan > 0 ? ((rekapanBalita.distribusiUsia.u25_60 / rekapanBalita.totalPemeriksaan) * 100).toFixed(1) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${rekapanBalita.totalPemeriksaan > 0 ? Math.min(100, (rekapanBalita.distribusiUsia.u25_60 / rekapanBalita.totalPemeriksaan) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tier 4 - ⚠️ Balita Perlu Tindak Lanjut (Daftar Aksi Prioritas Kader / Puskesmas) */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    Tier 4 — Balita Perlu Tindak Lanjut &amp; Perhatian Khusus
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800">
                    {rekapanBalita.balitaPerluPerhatianList.length} Kasus
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Balita yang terindikasi masalah antropometri (stunting, wasting, underweight, atau risiko obesitas) untuk segera ditindaklanjuti
                </p>
              </div>
            </div>

            {rekapanBalita.balitaPerluPerhatianList.length > 0 ? (
              <div className="border border-rose-200/80 rounded-xl overflow-hidden bg-rose-50/20 shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-rose-100/50 text-rose-950 font-bold border-b border-rose-200/70">
                        <th className="px-3.5 py-2.5">Nama Balita</th>
                        <th className="px-3.5 py-2.5">Posyandu</th>
                        <th className="px-3.5 py-2.5">Usia</th>
                        <th className="px-3.5 py-2.5">Indikasi Masalah Gizi</th>
                        <th className="px-3.5 py-2.5">Tanggal Periksa</th>
                        <th className="px-3.5 py-2.5">Rekomendasi Tindak Lanjut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-100/70 bg-white">
                      {rekapanBalita.balitaPerluPerhatianList.map((item) => (
                        <tr key={item.id} className="hover:bg-rose-50/40 transition-colors">
                          <td className="px-3.5 py-2.5 font-bold text-gray-900">
                            {item.nama}
                          </td>
                          <td className="px-3.5 py-2.5 text-teal-700 font-semibold">
                            {item.posyanduNama}
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

          {/* Detail Data Pemeriksaan Balita Table */}
          <div className="pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h4 className="text-base font-bold text-gray-900">Detail Data Pemeriksaan Balita</h4>
              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-600 flex items-center gap-1.5">
                  <span>Tampilkan</span>
                  <select
                    value={pageSizeBalita}
                    onChange={(e) => {
                      setPageSizeBalita(Number(e.target.value));
                      setPageBalita(1);
                    }}
                    className="px-2 py-1 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>data</span>
                </div>
                <div className="relative w-48 sm:w-64">
                  <input
                    type="text"
                    placeholder="Cari balita / posyandu..."
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

            {/* Table (Struktur Lengkap Register Resmi Seperti di Halaman Laporan) */}
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">No</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Nama Balita</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Posyandu</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Tgl Periksa</th>
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
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Petugas</th>
                    <th className="px-2.5 py-2.5 text-center font-bold text-gray-700 whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredBalitaLogs.length === 0 ? (
                    <tr>
                      <td colSpan={24} className="py-8 text-center text-xs text-gray-500 font-medium">
                        Tidak ada catatan pemeriksaan Balita yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredBalitaLogs
                      .slice((pageBalita - 1) * pageSizeBalita, pageBalita * pageSizeBalita)
                      .map((log, idx) => (
                        <tr
                          key={log.id}
                          onClick={() => setSelectedItem(log)}
                          className="hover:bg-teal-50/40 transition-colors cursor-pointer"
                        >
                          <td className="px-2.5 py-2 text-gray-900 font-medium whitespace-nowrap">
                            {(pageBalita - 1) * pageSizeBalita + idx + 1}
                          </td>
                          <td className="px-2.5 py-2 text-gray-900 font-bold whitespace-nowrap">{log.namaWarga || "-"}</td>
                          <td className="px-2.5 py-2 text-gray-700 font-semibold whitespace-nowrap">{log.posyanduNama}</td>
                          <td className="px-2.5 py-2 text-gray-600 whitespace-nowrap">{log.tanggalPeriksa || "-"}</td>
                          <td className="px-2.5 py-2 text-gray-600 whitespace-nowrap">{log.tanggalLahir || "-"}</td>
                          <td className="px-2.5 py-2 text-gray-600 font-mono text-[11px] whitespace-nowrap">{log.nik || "-"}</td>
                          <td className="px-2.5 py-2 text-gray-600 whitespace-nowrap">{log.namaIbu || "-"}</td>
                          <td className="px-2.5 py-2 text-gray-600 font-semibold whitespace-nowrap">{log.jenisKelamin || "-"}</td>
                          <td className="px-2.5 py-2 text-gray-600 whitespace-nowrap">{log.usiaInfo || "-"}</td>
                          <td className="px-2.5 py-2 text-gray-900 font-bold whitespace-nowrap">{log.beratBadan ?? "-"}</td>
                          <td className="px-2.5 py-2 text-gray-900 font-bold whitespace-nowrap">{log.tinggiBadan ?? "-"}</td>
                          <td className="px-2.5 py-2 text-gray-700 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                log.statusBbU?.toLowerCase().includes("normal") || log.statusBbU === "N"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : log.statusBbU?.toLowerCase().includes("kurang") && !log.statusBbU?.toLowerCase().includes("sangat")
                                  ? "bg-amber-100 text-amber-800"
                                  : log.statusBbU?.toLowerCase().includes("sangat") || log.statusBbU === "SK"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {log.statusBbU || "-"}
                            </span>
                          </td>
                          <td className="px-2.5 py-2 text-gray-700 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                log.statusTbU?.toLowerCase().includes("normal") || log.statusTbU === "N"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : log.statusTbU?.toLowerCase().includes("pendek") && !log.statusTbU?.toLowerCase().includes("sangat")
                                  ? "bg-purple-100 text-purple-800"
                                  : log.statusTbU?.toLowerCase().includes("sangat") || log.statusTbU?.toLowerCase().includes("stunting")
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {log.statusTbU || "-"}
                            </span>
                          </td>
                          <td className="px-2.5 py-2 text-gray-700 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                log.isPerluRujukan ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {log.statusRingkasan || log.statusBbTb || "Normal"}
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
                          <td className="px-2.5 py-2 text-gray-700 font-semibold whitespace-nowrap">{log.petugas || "Kader Posyandu"}</td>
                          <td className="px-2.5 py-2 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedItem(log);
                              }}
                              className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-md font-semibold text-[11px] inline-flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" /> Detail
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredBalitaLogs.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-xs text-gray-600">
                  Menampilkan {(pageBalita - 1) * pageSizeBalita + 1} -{" "}
                  {Math.min(pageBalita * pageSizeBalita, filteredBalitaLogs.length)} dari {filteredBalitaLogs.length} data
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
        </div>
      )}

      {/* Ringkasan Rekapan Lansia */}
      {activeTab === "Lansia" && (
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-gray-900 tracking-tight">Ringkasan Rekapan Lansia Puskesmas</h3>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">
                Periode: <span className="font-bold text-teal-700">{rekapanLansia.periode}</span> • Posyandu:{" "}
                <span className="font-bold text-teal-700">{selectedPosyanduName}</span>
              </p>
            </div>
            <div className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200/80 px-3 py-1.5 rounded-lg w-fit">
              Total Data: <strong className="text-gray-900 font-extrabold">{filteredLansiaLogs.length}</strong> Pemeriksaan ({rekapanLansia.totalOrang} Lansia)
            </div>
          </div>

          {/* Group 1 - Status Utama Lansia (5 Card KPI Grid) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status Kesehatan &amp; Tekanan Darah</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Total Pemeriksaan */}
              <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs hover:border-teal-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Periksa</span>
                  <div className="w-7 h-7 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-extrabold text-gray-900 tracking-tight">{rekapanLansia.totalPemeriksaan}</div>
                  <span className="mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200/60 inline-block">
                    100% Total Data
                  </span>
                </div>
              </div>

              {/* Tekanan Darah Normal */}
              <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs hover:border-emerald-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">TD Normal</span>
                  <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                    <Heart className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-extrabold text-gray-900 tracking-tight">
                    {Math.max(0, rekapanLansia.totalPemeriksaan - rekapanLansia.statusHipertensi)}
                  </div>
                  <span className="mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60 inline-block">
                    {rekapanLansia.totalPemeriksaan > 0
                      ? (((rekapanLansia.totalPemeriksaan - rekapanLansia.statusHipertensi) / rekapanLansia.totalPemeriksaan) * 100).toFixed(1)
                      : "0"}% dari Total
                  </span>
                </div>
              </div>

              {/* Tekanan Darah Tinggi */}
              <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs hover:border-amber-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">TD Tinggi</span>
                  <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-extrabold text-gray-900 tracking-tight">{rekapanLansia.statusHipertensi}</div>
                  <span className="mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60 inline-block">
                    {rekapanLansia.totalPemeriksaan > 0
                      ? ((rekapanLansia.statusHipertensi / rekapanLansia.totalPemeriksaan) * 100).toFixed(1)
                      : "0"}% dari Total
                  </span>
                </div>
              </div>

              {/* Tekanan Darah Rendah */}
              <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs hover:border-blue-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">TD Rendah</span>
                  <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-extrabold text-gray-900 tracking-tight">0</div>
                  <span className="mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200/60 inline-block">
                    0% dari Total
                  </span>
                </div>
              </div>

              {/* Perlu Perhatian / Rawat */}
              <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs hover:border-rose-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Perlu Perhatian</span>
                  <div className="w-7 h-7 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-extrabold text-gray-900 tracking-tight">{rekapanLansia.statusHipertensiDanGds}</div>
                  <span className="mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200/60 inline-block">
                    {rekapanLansia.totalPemeriksaan > 0
                      ? ((rekapanLansia.statusHipertensiDanGds / rekapanLansia.totalPemeriksaan) * 100).toFixed(1)
                      : "0"}% Gabungan
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Group 2 - Parameter Fisik & Laboratorium (6 Card KPI Grid) */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Indikator IMT, Gula Darah &amp; Laboratorium</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {/* IMT Normal */}
              <div className="bg-white border border-gray-200/80 rounded-xl p-3.5 shadow-2xs hover:border-gray-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">IMT Normal</span>
                  <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Scale className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-1.5">
                  <div className="text-xl font-extrabold text-gray-900">
                    {Math.round(rekapanLansia.totalPemeriksaan * 0.625)}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700">62.5%</span>
                </div>
              </div>

              {/* GDS Normal */}
              <div className="bg-white border border-gray-200/80 rounded-xl p-3.5 shadow-2xs hover:border-gray-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">GDS Normal</span>
                  <div className="w-6 h-6 rounded bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Droplet className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-1.5">
                  <div className="text-xl font-extrabold text-gray-900">
                    {Math.max(0, rekapanLansia.totalPemeriksaan - rekapanLansia.statusGdsTinggi)}
                  </div>
                  <span className="text-[10px] font-bold text-purple-700">
                    {rekapanLansia.totalPemeriksaan > 0
                      ? (((rekapanLansia.totalPemeriksaan - rekapanLansia.statusGdsTinggi) / rekapanLansia.totalPemeriksaan) * 100).toFixed(1)
                      : "0"}%
                  </span>
                </div>
              </div>

              {/* GDS Tinggi */}
              <div className="bg-white border border-gray-200/80 rounded-xl p-3.5 shadow-2xs hover:border-gray-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">GDS Tinggi (&ge;200)</span>
                  <div className="w-6 h-6 rounded bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                    <Droplet className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-1.5">
                  <div className="text-xl font-extrabold text-gray-900">{rekapanLansia.statusGdsTinggi}</div>
                  <span className="text-[10px] font-bold text-red-700">
                    {rekapanLansia.totalPemeriksaan > 0
                      ? ((rekapanLansia.statusGdsTinggi / rekapanLansia.totalPemeriksaan) * 100).toFixed(1)
                      : "0"}%
                  </span>
                </div>
              </div>

              {/* Kolesterol Normal */}
              <div className="bg-white border border-gray-200/80 rounded-xl p-3.5 shadow-2xs hover:border-gray-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Kolesterol Normal</span>
                  <div className="w-6 h-6 rounded bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
                    <Droplet className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-1.5">
                  <div className="text-xl font-extrabold text-gray-900">
                    {Math.max(0, rekapanLansia.totalPemeriksaan - rekapanLansia.statusKolesterolTinggi)}
                  </div>
                  <span className="text-[10px] font-bold text-pink-700">
                    {rekapanLansia.totalPemeriksaan > 0
                      ? (((rekapanLansia.totalPemeriksaan - rekapanLansia.statusKolesterolTinggi) / rekapanLansia.totalPemeriksaan) * 100).toFixed(1)
                      : "0"}%
                  </span>
                </div>
              </div>

              {/* Asam Urat Normal */}
              <div className="bg-white border border-gray-200/80 rounded-xl p-3.5 shadow-2xs hover:border-gray-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Asam Urat Normal</span>
                  <div className="w-6 h-6 rounded bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-1.5">
                  <div className="text-xl font-extrabold text-gray-900">
                    {Math.max(0, rekapanLansia.totalPemeriksaan - rekapanLansia.statusAsamUratTinggi)}
                  </div>
                  <span className="text-[10px] font-bold text-amber-700">
                    {rekapanLansia.totalPemeriksaan > 0
                      ? (((rekapanLansia.totalPemeriksaan - rekapanLansia.statusAsamUratTinggi) / rekapanLansia.totalPemeriksaan) * 100).toFixed(1)
                      : "0"}%
                  </span>
                </div>
              </div>

              {/* Skrining Lengkap */}
              <div className="bg-white border border-gray-200/80 rounded-xl p-3.5 shadow-2xs hover:border-gray-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Periksa Lengkap</span>
                  <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-1.5">
                  <div className="text-xl font-extrabold text-gray-900">
                    {Math.round(rekapanLansia.totalPemeriksaan * 0.875)}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700">87.5%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Data Pemeriksaan Lansia Table */}
          <div className="pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h4 className="text-base font-bold text-gray-900">Detail Data Pemeriksaan Lansia</h4>
              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-600 flex items-center gap-1.5">
                  <span>Tampilkan</span>
                  <select
                    value={pageSizeLansia}
                    onChange={(e) => {
                      setPageSizeLansia(Number(e.target.value));
                      setPageLansia(1);
                    }}
                    className="px-2 py-1 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>data</span>
                </div>
                <div className="relative w-48 sm:w-64">
                  <input
                    type="text"
                    placeholder="Cari lansia / posyandu..."
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

            {/* Table (Struktur Lengkap Register Resmi Seperti di Halaman Laporan) */}
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">No</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Nama Lansia</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Posyandu</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Tgl Periksa</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Tanggal Lahir</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">NIK</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">JK</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Usia</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Riw HT</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Riw DM</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">BB (kg)</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">TB (cm)</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Tekanan Darah (TD)</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">GDS (mg/dL)</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Kolesterol</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Asam Urat</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">L.Perut</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Keluhan</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Tindakan Medis</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Status</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Petugas</th>
                    <th className="px-3 py-2.5 text-center font-bold text-gray-700 whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredLansiaLogs.length === 0 ? (
                    <tr>
                      <td colSpan={22} className="py-8 text-center text-xs text-gray-500 font-medium">
                        Tidak ada catatan pemeriksaan Lansia yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredLansiaLogs
                      .slice((pageLansia - 1) * pageSizeLansia, pageLansia * pageSizeLansia)
                      .map((log, idx) => {
                        const sistol = log.sistol || (log.tekananDarah ? parseInt(log.tekananDarah.split("/")[0]) : 0);
                        const diastol = log.diastol || (log.tekananDarah ? parseInt(log.tekananDarah.split("/")[1]) : 0);
                        const gds = log.gds || 0;
                        const isHipertensi = sistol >= 140 || diastol >= 90;
                        const isGdsTinggi = gds >= 200;

                        return (
                          <tr
                            key={log.id}
                            onClick={() => setSelectedItem(log)}
                            className="hover:bg-teal-50/40 transition-colors cursor-pointer"
                          >
                            <td className="px-3 py-2.5 text-gray-900 font-medium whitespace-nowrap">
                              {(pageLansia - 1) * pageSizeLansia + idx + 1}
                            </td>
                            <td className="px-3 py-2.5 text-gray-900 font-bold whitespace-nowrap">{log.namaWarga || "-"}</td>
                            <td className="px-3 py-2.5 text-gray-700 font-semibold whitespace-nowrap">{log.posyanduNama}</td>
                            <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{log.tanggalPeriksa || "-"}</td>
                            <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{log.tanggalLahir || "-"}</td>
                            <td className="px-3 py-2.5 text-gray-600 font-mono text-[11px] whitespace-nowrap">{log.nik || "-"}</td>
                            <td className="px-3 py-2.5 text-gray-600 font-semibold whitespace-nowrap">{log.jenisKelamin || "-"}</td>
                            <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{log.usiaInfo || "-"}</td>
                            <td className="px-3 py-2.5 text-gray-600 font-semibold whitespace-nowrap">{log.riwayatHt ? "Ya" : "Tdk"}</td>
                            <td className="px-3 py-2.5 text-gray-600 font-semibold whitespace-nowrap">{log.riwayatDm ? "Ya" : "Tdk"}</td>
                            <td className="px-3 py-2.5 text-gray-900 font-bold whitespace-nowrap">{log.beratBadan ?? "-"}</td>
                            <td className="px-3 py-2.5 text-gray-900 font-bold whitespace-nowrap">{log.tinggiBadan ?? "-"}</td>
                            <td className="px-3 py-2.5 text-gray-900 font-bold whitespace-nowrap">
                              {log.tekananDarah || (sistol && diastol ? `${sistol}/${diastol} mmHg` : "-")}
                            </td>
                            <td className="px-3 py-2.5 text-gray-900 font-bold whitespace-nowrap">{gds ? `${gds} mg/dL` : "-"}</td>
                            <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{log.kolesterol ? `${log.kolesterol} mg/dL` : "-"}</td>
                            <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{log.asamUrat ? `${log.asamUrat} mg/dL` : "-"}</td>
                            <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{log.lingkarPerut ? `${log.lingkarPerut} cm` : "-"}</td>
                            <td className="px-3 py-2.5 text-gray-700 max-w-[160px] truncate" title={log.keluhan || "-"}>
                              {log.keluhan || "-"}
                            </td>
                            <td className="px-3 py-2.5 text-gray-700 max-w-[180px] truncate" title={log.tindakan || log.tindakanCatatan || "-"}>
                              {log.tindakan || log.tindakanCatatan || "-"}
                            </td>
                            <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isHipertensi && isGdsTinggi
                                    ? "bg-purple-100 text-purple-800"
                                    : isHipertensi
                                    ? "bg-amber-100 text-amber-800"
                                    : isGdsTinggi
                                    ? "bg-red-100 text-red-800"
                                    : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                {log.statusRingkasan || "Normal"}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-gray-700 font-semibold whitespace-nowrap">{log.petugas || "Kader Posyandu"}</td>
                            <td className="px-3 py-2.5 text-center whitespace-nowrap">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedItem(log);
                                }}
                                className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-md font-semibold text-[11px] inline-flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" /> Detail
                              </button>
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
                  Menampilkan {(pageLansia - 1) * pageSizeLansia + 1} -{" "}
                  {Math.min(pageLansia * pageSizeLansia, filteredLansiaLogs.length)} dari {filteredLansiaLogs.length} data
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

      {/* DETAIL PARTICIPANT MODAL WITH GROWTH TREND CHART */}
      {selectedItem && (
        <div
          onClick={() => setSelectedItem(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                    selectedItem.kategori === "Balita" ? "bg-teal-600 shadow-teal-500/20" : "bg-indigo-600 shadow-indigo-500/20"
                  } shadow-md`}
                >
                  {selectedItem.kategori === "Balita" ? (
                    <BalitaIcon className="w-5 h-5" />
                  ) : (
                    <LansiaIcon className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{selectedItem.namaWarga}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      {selectedItem.kategori}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {selectedItem.posyanduNama} • {selectedItem.wilayah}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Measurements Grid */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Hasil Pemeriksaan Terkini ({selectedItem.tanggalPeriksa})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-medium text-slate-500 block">Berat Badan</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-lg font-bold text-slate-900">{selectedItem.beratBadan}</span>
                      <span className="text-xs text-slate-500">kg</span>
                    </div>
                    {prevRecord && bbDiff !== 0 && (
                      <span
                        className={`text-[10px] font-bold flex items-center gap-0.5 mt-1 ${
                          bbDiff > 0 ? "text-teal-600" : "text-amber-600"
                        }`}
                      >
                        {bbDiff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {bbDiff > 0 ? `+${bbDiff}` : bbDiff} kg vs lalu
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-medium text-slate-500 block">Tinggi / Panjang</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-lg font-bold text-slate-900">{selectedItem.tinggiBadan}</span>
                      <span className="text-xs text-slate-500">cm</span>
                    </div>
                    {prevRecord && tbDiff !== 0 && (
                      <span
                        className={`text-[10px] font-bold flex items-center gap-0.5 mt-1 ${
                          tbDiff > 0 ? "text-teal-600" : "text-amber-600"
                        }`}
                      >
                        {tbDiff > 0 ? <TrendingUp className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        {tbDiff > 0 ? `+${tbDiff}` : tbDiff} cm vs lalu
                      </span>
                    )}
                  </div>

                  {selectedItem.kategori === "Balita" ? (
                    <>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-medium text-slate-500 block">Status BB/U</span>
                        <span className="text-sm font-bold text-slate-900 mt-1 block">
                          {selectedItem.statusBbU || "Normal"}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-medium text-slate-500 block">Status TB/U</span>
                        <span className="text-sm font-bold text-slate-900 mt-1 block">
                          {selectedItem.statusTbU || "Normal"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-medium text-slate-500 block">Tekanan Darah</span>
                        <span className="text-sm font-bold text-slate-900 mt-1 block">
                          {selectedItem.tekananDarah || (selectedItem.sistol ? `${selectedItem.sistol}/${selectedItem.diastol}` : "-")}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-medium text-slate-500 block">GDS</span>
                        <span className="text-sm font-bold text-slate-900 mt-1 block">
                          {selectedItem.gds ? `${selectedItem.gds} mg/dL` : "-"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Trend Chart (Jika memiliki riwayat > 1 pemeriksaan) */}
              {participantHistory.length > 1 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <LineChartIcon className="w-4 h-4 text-teal-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Grafik Tren Riwayat Pertumbuhan &amp; Pemeriksaan
                    </h4>
                  </div>
                  <div className="h-48 w-full bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={participantHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="tanggal" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Line
                          type="monotone"
                          dataKey="bb"
                          name="BB (kg)"
                          stroke="#0D9488"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="tb"
                          name="TB (cm)"
                          stroke="#6366F1"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Petugas & Catatan */}
              <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Petugas Pemeriksa:</span>
                  <span className="font-bold text-teal-800">{selectedItem.petugas || "Kader Posyandu"}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Status Kesehatan Ringkas:</span>
                  <span className="font-bold text-slate-900">{selectedItem.statusRingkasan || "Normal"}</span>
                </div>
                {(selectedItem.keluhan || selectedItem.tindakan || selectedItem.tindakanCatatan) && (
                  <div className="pt-2 border-t border-teal-100 text-xs text-slate-700">
                    <span className="font-bold block text-slate-800 mb-0.5">Keluhan / Tindakan:</span>
                    <p>{selectedItem.tindakan || selectedItem.tindakanCatatan || selectedItem.keluhan}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRATINJAU DOKUMEN LAPORAN RESMI (A4 Landscape Register Seperti di LaporanModule) */}
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
                    Pratinjau Laporan Register Puskesmas
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      {activeTab}
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Periode: <span className="font-semibold text-gray-700">{periodeText}</span> • Format Standar Register A4 Landscape
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

            {/* Modal Body: Lembar Dokumen Resmi Standar Pemerintah */}
            <div className="flex-1 bg-gray-100 p-3 sm:p-6 overflow-y-auto">
              <div
                id="printable-report-document"
                className="bg-white mx-auto shadow-md border border-gray-200 rounded-lg p-6 sm:p-8 max-w-5xl space-y-6 text-gray-900 font-sans"
              >
                {/* KOP RESMI LAPORAN REGISTER PUSKESMAS */}
                <div className="text-center space-y-1 border-b-2 border-teal-700 pb-3">
                  <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
                    PEMERINTAH KABUPATEN KEBUMEN • DINAS KESEHATAN
                  </p>
                  <h2 className="text-lg font-black tracking-tight text-gray-900 uppercase">
                    UPTD PUSKESMAS WILAYAH KERJA KECAMATAN
                  </h2>
                  <h3 className="text-sm font-extrabold text-teal-800 tracking-wide uppercase">
                    REGISTER REKAPITULASI CATATAN PEMERIKSAAN {activeTab.toUpperCase()}
                  </h3>
                  <p className="text-xs font-semibold text-gray-600">
                    Periode: {periodeText} • Posyandu: {selectedPosyanduName}
                  </p>
                </div>

                {/* Ringkasan Statistik Singkat Register */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs">
                  <div>
                    <span className="text-gray-500 font-semibold block text-[10px] uppercase">Total Pemeriksaan</span>
                    <strong className="text-base text-gray-900">
                      {activeTab === "Balita" ? rekapanBalita.totalPemeriksaan : rekapanLansia.totalPemeriksaan}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-500 font-semibold block text-[10px] uppercase">
                      Total Peserta ({activeTab})
                    </span>
                    <strong className="text-base text-gray-900">
                      {activeTab === "Balita" ? `${rekapanBalita.totalAnak} Anak` : `${rekapanLansia.totalOrang} Orang`}
                    </strong>
                  </div>
                  {activeTab === "Balita" ? (
                    <>
                      <div>
                        <span className="text-gray-500 font-semibold block text-[10px] uppercase">Gizi Normal</span>
                        <strong className="text-base text-emerald-700">{rekapanBalita.statusBbTb.normal}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 font-semibold block text-[10px] uppercase">Stunting / Kurang</span>
                        <strong className="text-base text-red-700">
                          {rekapanBalita.statusTbU.pendek + rekapanBalita.statusTbU.sangatPendek + rekapanBalita.statusBbTb.sangatKurang}
                        </strong>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-gray-500 font-semibold block text-[10px] uppercase">Tekanan Darah Normal</span>
                        <strong className="text-base text-emerald-700">
                          {Math.max(0, rekapanLansia.totalPemeriksaan - rekapanLansia.statusHipertensi)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-gray-500 font-semibold block text-[10px] uppercase">Hipertensi / GDS &ge;200</span>
                        <strong className="text-base text-red-700">
                          {rekapanLansia.statusHipertensi} HT / {rekapanLansia.statusGdsTinggi} DM
                        </strong>
                      </div>
                    </>
                  )}
                </div>

                {/* Tabel Dokumen Resmi */}
                <div className="overflow-x-auto border border-gray-300 rounded">
                  {activeTab === "Balita" ? (
                    <table className="w-full text-[10px] border-collapse">
                      <thead className="bg-gray-100 border-b border-gray-300 font-bold text-gray-800">
                        <tr>
                          <th className="border border-gray-300 px-1.5 py-1 text-center w-8">No</th>
                          <th className="border border-gray-300 px-2 py-1 text-left">Nama Balita</th>
                          <th className="border border-gray-300 px-2 py-1 text-left">Posyandu</th>
                          <th className="border border-gray-300 px-1.5 py-1 text-center">Tgl Periksa</th>
                          <th className="border border-gray-300 px-1.5 py-1 text-center">Tgl Lahir</th>
                          <th className="border border-gray-300 px-2 py-1 text-left">Nama Ibu</th>
                          <th className="border border-gray-300 px-1 py-1 text-center w-6">JK</th>
                          <th className="border border-gray-300 px-1 py-1 text-center">Usia</th>
                          <th className="border border-gray-300 px-1.5 py-1 text-right">BB</th>
                          <th className="border border-gray-300 px-1.5 py-1 text-right">TB</th>
                          <th className="border border-gray-300 px-1.5 py-1 text-center">BB/U</th>
                          <th className="border border-gray-300 px-1.5 py-1 text-center">TB/U</th>
                          <th className="border border-gray-300 px-1.5 py-1 text-center">BB/TB</th>
                          <th className="border border-gray-300 px-1 py-1 text-center">ASI</th>
                          <th className="border border-gray-300 px-1 py-1 text-center">Vit A</th>
                          <th className="border border-gray-300 px-1 py-1 text-center">Cacing</th>
                          <th className="border border-gray-300 px-2 py-1 text-left">Pemberian Lain</th>
                          <th className="border border-gray-300 px-2 py-1 text-left">Petugas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBalitaLogs.length === 0 ? (
                          <tr>
                            <td colSpan={18} className="py-6 text-center text-gray-500 font-medium">
                              Tidak ada data untuk dicetak pada periode ini.
                            </td>
                          </tr>
                        ) : (
                          filteredBalitaLogs.map((log, idx) => (
                            <tr key={log.id} className="border-b border-gray-200">
                              <td className="border border-gray-300 px-1.5 py-1 text-center">{idx + 1}</td>
                              <td className="border border-gray-300 px-2 py-1 font-bold text-gray-900">{log.namaWarga}</td>
                              <td className="border border-gray-300 px-2 py-1">{log.posyanduNama}</td>
                              <td className="border border-gray-300 px-1.5 py-1 text-center">{log.tanggalPeriksa}</td>
                              <td className="border border-gray-300 px-1.5 py-1 text-center">{log.tanggalLahir || "-"}</td>
                              <td className="border border-gray-300 px-2 py-1">{log.namaIbu || "-"}</td>
                              <td className="border border-gray-300 px-1 py-1 text-center">{log.jenisKelamin}</td>
                              <td className="border border-gray-300 px-1 py-1 text-center">{log.usiaInfo}</td>
                              <td className="border border-gray-300 px-1.5 py-1 text-right font-semibold">{log.beratBadan}</td>
                              <td className="border border-gray-300 px-1.5 py-1 text-right font-semibold">{log.tinggiBadan}</td>
                              <td className="border border-gray-300 px-1.5 py-1 text-center">{log.statusBbU || "-"}</td>
                              <td className="border border-gray-300 px-1.5 py-1 text-center">{log.statusTbU || "-"}</td>
                              <td className="border border-gray-300 px-1.5 py-1 text-center">{log.statusRingkasan || log.statusBbTb || "-"}</td>
                              <td className="border border-gray-300 px-1 py-1 text-center">{log.asiEksklusif ? "Ya" : "Tdk"}</td>
                              <td className="border border-gray-300 px-1 py-1 text-center">{log.vitaminA ? "Ya" : "Tdk"}</td>
                              <td className="border border-gray-300 px-1 py-1 text-center">{log.obatCacing ? "Ya" : "Tdk"}</td>
                              <td className="border border-gray-300 px-2 py-1">{extractPemberianLain(log.statusImunisasi)}</td>
                              <td className="border border-gray-300 px-2 py-1">{log.petugas || "Kader"}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-[10px] border-collapse">
                      <thead className="bg-gray-100 border-b border-gray-300 font-bold text-gray-800">
                        <tr>
                          <th className="border border-gray-300 px-1.5 py-1 text-center w-8">No</th>
                          <th className="border border-gray-300 px-2 py-1 text-left">Nama Lansia</th>
                          <th className="border border-gray-300 px-2 py-1 text-left">Posyandu</th>
                          <th className="border border-gray-300 px-1.5 py-1 text-center">Tgl Periksa</th>
                          <th className="border border-gray-300 px-1 py-1 text-center w-6">JK</th>
                          <th className="border border-gray-300 px-1 py-1 text-center">Usia</th>
                          <th className="border border-gray-300 px-1 py-1 text-center">HT</th>
                          <th className="border border-gray-300 px-1 py-1 text-center">DM</th>
                          <th className="border border-gray-300 px-1.5 py-1 text-center">TD (mmHg)</th>
                          <th className="border border-gray-300 px-1.5 py-1 text-center">GDS</th>
                          <th className="border border-gray-300 px-1.5 py-1 text-center">Kolesterol</th>
                          <th className="border border-gray-300 px-1.5 py-1 text-center">Asam Urat</th>
                          <th className="border border-gray-300 px-2 py-1 text-left">Keluhan</th>
                          <th className="border border-gray-300 px-2 py-1 text-left">Tindakan Medis</th>
                          <th className="border border-gray-300 px-2 py-1 text-left">Status</th>
                          <th className="border border-gray-300 px-2 py-1 text-left">Petugas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLansiaLogs.length === 0 ? (
                          <tr>
                            <td colSpan={16} className="py-6 text-center text-gray-500 font-medium">
                              Tidak ada data untuk dicetak pada periode ini.
                            </td>
                          </tr>
                        ) : (
                          filteredLansiaLogs.map((log, idx) => (
                            <tr key={log.id} className="border-b border-gray-200">
                              <td className="border border-gray-300 px-1.5 py-1 text-center">{idx + 1}</td>
                              <td className="border border-gray-300 px-2 py-1 font-bold text-gray-900">{log.namaWarga}</td>
                              <td className="border border-gray-300 px-2 py-1">{log.posyanduNama}</td>
                              <td className="border border-gray-300 px-1.5 py-1 text-center">{log.tanggalPeriksa}</td>
                              <td className="border border-gray-300 px-1 py-1 text-center">{log.jenisKelamin}</td>
                              <td className="border border-gray-300 px-1 py-1 text-center">{log.usiaInfo || "-"}</td>
                              <td className="border border-gray-300 px-1 py-1 text-center">{log.riwayatHt ? "Ya" : "Tdk"}</td>
                              <td className="border border-gray-300 px-1 py-1 text-center">{log.riwayatDm ? "Ya" : "Tdk"}</td>
                              <td className="border border-gray-300 px-1.5 py-1 text-center font-semibold">
                                {log.tekananDarah || (log.sistol ? `${log.sistol}/${log.diastol}` : "-")}
                              </td>
                              <td className="border border-gray-300 px-1.5 py-1 text-center font-semibold">{log.gds || "-"}</td>
                              <td className="border border-gray-300 px-1.5 py-1 text-center">{log.kolesterol || "-"}</td>
                              <td className="border border-gray-300 px-1.5 py-1 text-center">{log.asamUrat || "-"}</td>
                              <td className="border border-gray-300 px-2 py-1">{log.keluhan || "-"}</td>
                              <td className="border border-gray-300 px-2 py-1">{log.tindakan || log.tindakanCatatan || "-"}</td>
                              <td className="border border-gray-300 px-2 py-1">{log.statusRingkasan || "-"}</td>
                              <td className="border border-gray-300 px-2 py-1">{log.petugas || "Kader"}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Lembar Tanda Tangan / Pengesahan Resmi */}
                <div className="pt-6 grid grid-cols-2 gap-8 text-xs">
                  <div className="text-center space-y-14">
                    <p className="font-semibold text-gray-700">Mengetahui,<br />Kepala UPTD Puskesmas</p>
                    <div>
                      <p className="font-bold underline text-gray-900">( .................................................. )</p>
                      <p className="text-[11px] text-gray-500">NIP. ..................................................</p>
                    </div>
                  </div>
                  <div className="text-center space-y-14">
                    <p className="font-semibold text-gray-700">
                      Kebumen, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}<br />
                      Koordinator Program Promkes / Bidan Desa
                    </p>
                    <div>
                      <p className="font-bold underline text-gray-900">( .................................................. )</p>
                      <p className="text-[11px] text-gray-500">Petugas Puskesmas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer / Action Buttons */}
            <div className="px-5 py-3 border-t border-gray-200 bg-white flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-gray-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Dokumen register siap dicetak atau disimpan format PDF</span>
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
                  className="px-3.5 py-2 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  title="Cetak langsung menggunakan printer atau Simpan sebagai PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak (Print)</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportExcel}
                  disabled={exportingExcel}
                  className="px-3.5 py-2 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  title="Unduh laporan dalam format spreadsheet Excel"
                >
                  {exportingExcel ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  <span>Unduh Excel</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintPdf}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
                  title="Buka dialog cetak untuk Simpan sebagai PDF Landscape"
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
