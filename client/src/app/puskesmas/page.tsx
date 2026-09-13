"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { Building2, ChevronRight } from "lucide-react";
import PageHelmet from "@/components/PageHelmet";
import { publicPuskesmasApi, PublicPemeriksaanItem, PublicPosyanduInfo, ItemRiwayat } from "@/lib/api";
import { SearchIndex } from "@/lib/searchIndex";
import LaporanFilterCard from "@/features/laporan/components/LaporanFilterCard";
import BalitaLaporanView from "@/features/laporan/components/BalitaLaporanView";
import LansiaLaporanView from "@/features/laporan/components/LansiaLaporanView";
import PuskesmasParticipantModal, { ParticipantHistoryItem } from "./components/PuskesmasParticipantModal";
import PuskesmasPreviewModal from "./components/PuskesmasPreviewModal";
import {
  calculateRekapanBalita,
  calculateRekapanLansia,
  formatPeriodeText,
} from "@/features/laporan/utils/laporanCalculators";
import { extractPemberianLain } from "@/features/laporan/types";

function toItemRiwayat(item: PublicPemeriksaanItem): ItemRiwayat {
  let usiaBulan: number | undefined = undefined;
  if (item.usiaInfo) {
    const match = item.usiaInfo.match(/(\d+)\s*(?:bln|bulan)/i);
    if (match) usiaBulan = parseInt(match[1], 10);
  }

  let sistol = item.sistol;
  let diastol = item.diastol;
  if ((!sistol || !diastol) && item.tekananDarah && item.tekananDarah.includes("/")) {
    const parts = item.tekananDarah.split("/");
    sistol = sistol || parseInt(parts[0], 10) || undefined;
    diastol = diastol || parseInt(parts[1], 10) || undefined;
  }

  return {
    id: item.id,
    pasienId: item.nik || item.namaWarga,
    nama: item.namaWarga,
    tipe: item.kategori,
    tanggal: item.tanggalPeriksa,
    petugas: item.posyanduNama,
    parameter: `${item.beratBadan} kg / ${item.tinggiBadan} cm`,
    status: item.statusRingkasan,
    statusType: item.isPerluRujukan ? "warning" : "success",
    nik: item.nik,
    namaIbu: item.namaIbu,
    usiaBulan,
    jenisKelamin: item.jenisKelamin,
    beratBadan: item.beratBadan,
    tinggiBadan: item.tinggiBadan,
    lingkarKepala: item.lingkarKepala,
    lingkarLengan: item.lingkarLengan,
    statusBbU: item.statusBbU,
    statusTbU: item.statusTbU,
    statusBbTb: item.statusBbTb,
    vitaminA: item.vitaminA,
    asiEksklusif: item.asiEksklusif,
    obatCacing: item.obatCacing,
    vitB1: item.vitB1,
    vitB6: item.vitB6,
    statusImunisasi: item.statusImunisasi,
    tekananDarahSistol: sistol,
    tekananDarahDiastol: diastol,
    gulaDarahSewaktu: item.gds,
    kolesterol: item.kolesterol,
    asamUrat: item.asamUrat,
    lingkarPerut: item.lingkarPerut,
    riwayatHt: item.riwayatHt,
    riwayatDm: item.riwayatDm,
    keluhan: item.keluhan,
    tindakan: item.tindakan,
    ...(item.usiaInfo ? { usiaInfo: item.usiaInfo } : {}),
  } as ItemRiwayat;
}

export default function PuskesmasPublicPage() {
  const now = new Date();
  const currentMonthStr = String(now.getMonth() + 1).padStart(2, "0");
  const currentYearStr = String(now.getFullYear());

  const [data, setData] = useState<PublicPemeriksaanItem[]>([]);
  const [posyandus, setPosyandus] = useState<PublicPosyanduInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [exportingExcel, setExportingExcel] = useState<boolean>(false);

  // Active Tab: "Balita" | "Lansia"
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

  // Print & PDF Preview Modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  // Search Indexes
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

  // Client-side filtering
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

  // Update Search Indexes
  useEffect(() => {
    balitaIndexRef.current.setSource(filteredData.filter((l) => l.kategori === "Balita"));
    lansiaIndexRef.current.setSource(filteredData.filter((l) => l.kategori === "Lansia"));
  }, [filteredData]);

  // Filtered raw items
  const filteredBalitaRaw = useMemo(() => {
    if (!searchBalita.trim()) {
      return filteredData.filter((l) => l.kategori === "Balita");
    }
    return balitaIndexRef.current.search(searchBalita);
  }, [filteredData, searchBalita]);

  const filteredLansiaRaw = useMemo(() => {
    if (!searchLansia.trim()) {
      return filteredData.filter((l) => l.kategori === "Lansia");
    }
    return lansiaIndexRef.current.search(searchLansia);
  }, [filteredData, searchLansia]);

  // Converted to ItemRiwayat for reporting components
  const filteredBalitaLogs = useMemo(() => {
    return filteredBalitaRaw.map(toItemRiwayat);
  }, [filteredBalitaRaw]);

  const filteredLansiaLogs = useMemo(() => {
    return filteredLansiaRaw.map(toItemRiwayat);
  }, [filteredLansiaRaw]);

  // Participant specific history & trend for detail modal
  const participantHistory: ParticipantHistoryItem[] = useMemo(() => {
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
  const currentBB = Number(selectedItem?.beratBadan);
  const prevBB = Number(prevRecord?.beratBadan ?? (prevRecord as any)?.bb);
  const rawBbDiff = prevRecord && selectedItem && !isNaN(currentBB) && !isNaN(prevBB) ? currentBB - prevBB : 0;
  const bbDiff = isNaN(rawBbDiff) ? 0 : Number(rawBbDiff.toFixed(2));

  const currentTB = Number(selectedItem?.tinggiBadan);
  const prevTB = Number(prevRecord?.tinggiBadan ?? (prevRecord as any)?.tb);
  const rawTbDiff = prevRecord && selectedItem && !isNaN(currentTB) && !isNaN(prevTB) ? currentTB - prevTB : 0;
  const tbDiff = isNaN(rawTbDiff) ? 0 : Number(rawTbDiff.toFixed(1));

  // Periode text representation
  const periodeText = useMemo(() => {
    return formatPeriodeText(filterMonth, filterYear);
  }, [filterMonth, filterYear]);

  // Rekapan Balita & Lansia Calculations
  const rekapanBalita = useMemo(() => {
    const balitaLogs = filteredData.filter((l) => l.kategori === "Balita").map(toItemRiwayat);
    const totalAnak = new Set(balitaLogs.map((l) => l.pasienId || l.nama)).size;
    return calculateRekapanBalita(balitaLogs, totalAnak, periodeText);
  }, [filteredData, periodeText]);

  const rekapanLansia = useMemo(() => {
    const lansiaLogs = filteredData.filter((l) => l.kategori === "Lansia").map(toItemRiwayat);
    const totalLansia = new Set(lansiaLogs.map((l) => l.pasienId || l.nama)).size;
    return calculateRekapanLansia(lansiaLogs, totalLansia, periodeText);
  }, [filteredData, periodeText]);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const selectedPosyanduName =
    selectedPosyandu === "semua"
      ? "Semua Posyandu"
      : posyandus.find((p) => p.id === selectedPosyandu)?.nama || selectedPosyandu;

  // Export to Standard Spreadsheet (Excel / CSV dengan UTF-8 BOM)
  const handleExportExcel = () => {
    try {
      setExportingExcel(true);
      const activeRaw = activeTab === "Balita" ? filteredBalitaRaw : filteredLansiaRaw;
      if (activeRaw.length === 0) {
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

      const rows = activeRaw.map((item, idx) =>
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

  const handleOpenPreview = () => {
    setIsPreviewOpen(true);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleSelectLog = (log: ItemRiwayat) => {
    const raw = data.find((d) => d.id === log.id);
    if (raw) {
      setSelectedItem(raw);
    }
  };

  const handleResetCurrentPeriod = () => {
    setFilterMonth(currentMonthStr);
    setFilterYear(currentYearStr);
    setStartDate("");
    setEndDate("");
    setPageBalita(1);
    setPageLansia(1);
  };

  const handleResetAllPeriods = () => {
    setFilterMonth("");
    setFilterYear("");
    setStartDate("");
    setEndDate("");
    setPageBalita(1);
    setPageLansia(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-6 print:p-0 print:bg-white">
      <PageHelmet
        title={`Laporan Rekapan ${activeTab} — UPTD Puskesmas`}
        description={`Laporan rekapitulasi data pemeriksaan ${activeTab} seluruh posyandu wilayah kerja Puskesmas.`}
      />

      {/* Header Halaman */}
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

      {/* Filter Card */}
      <div className="print:hidden">
        <LaporanFilterCard
          filterCategory={activeTab}
          setFilterCategory={(cat) => {
            setActiveTab(cat);
            setPageBalita(1);
            setPageLansia(1);
          }}
          posyandus={posyandus}
          selectedPosyandu={selectedPosyandu}
          setSelectedPosyandu={(p) => {
            setSelectedPosyandu(p);
            setPageBalita(1);
            setPageLansia(1);
          }}
          filterMonth={filterMonth}
          setFilterMonth={(m) => {
            setFilterMonth(m);
            setPageBalita(1);
            setPageLansia(1);
          }}
          filterYear={filterYear}
          setFilterYear={(y) => {
            setFilterYear(y);
            setPageBalita(1);
            setPageLansia(1);
          }}
          filterFromDate={startDate}
          setFilterFromDate={(d) => {
            setStartDate(d);
            setPageBalita(1);
            setPageLansia(1);
          }}
          filterToDate={endDate}
          setFilterToDate={(d) => {
            setEndDate(d);
            setPageBalita(1);
            setPageLansia(1);
          }}
          yearOptions={yearOptions}
          onResetCurrentPeriod={handleResetCurrentPeriod}
          onResetAllPeriods={handleResetAllPeriods}
          isLoading={isLoading}
          hasData={activeTab === "Balita" ? filteredBalitaRaw.length > 0 : filteredLansiaRaw.length > 0}
          onOpenPreview={handleOpenPreview}
          onExportExcel={handleExportExcel}
          isExportingExcel={exportingExcel}
        />
      </div>

      {/* Main Report View */}
      {activeTab === "Balita" ? (
        <BalitaLaporanView
          rekapanBalita={rekapanBalita}
          filteredBalitaLogs={filteredBalitaLogs}
          pageBalita={pageBalita}
          setPageBalita={setPageBalita}
          pageSizeBalita={pageSizeBalita}
          setPageSizeBalita={setPageSizeBalita}
          searchBalita={searchBalita}
          setSearchBalita={setSearchBalita}
          onSelectLog={handleSelectLog}
        />
      ) : (
        <LansiaLaporanView
          rekapanLansia={rekapanLansia}
          filteredLansiaLogs={filteredLansiaLogs}
          pageLansia={pageLansia}
          setPageLansia={setPageLansia}
          pageSizeLansia={pageSizeLansia}
          setPageSizeLansia={setPageSizeLansia}
          searchLansia={searchLansia}
          setSearchLansia={setSearchLansia}
          onSelectLog={handleSelectLog}
        />
      )}

      {/* Participant Detail Modal with Growth Trend Chart */}
      <PuskesmasParticipantModal
        selectedItem={selectedItem}
        onClose={() => setSelectedItem(null)}
        participantHistory={participantHistory}
        prevRecord={prevRecord}
        bbDiff={bbDiff}
        tbDiff={tbDiff}
      />

      {/* Modal Pratinjau Dokumen Laporan Resmi */}
      <PuskesmasPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        activeTab={activeTab}
        periodeText={periodeText}
        selectedPosyanduName={selectedPosyanduName}
        rekapanBalita={rekapanBalita}
        rekapanLansia={rekapanLansia}
        filteredBalitaLogs={filteredBalitaRaw}
        filteredLansiaLogs={filteredLansiaRaw}
        exportingExcel={exportingExcel}
        onExportExcel={handleExportExcel}
        onPrintPdf={handlePrintPdf}
      />
    </div>
  );
}
