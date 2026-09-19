"use client";

import * as XLSX from "xlsx";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { ChevronRight, Globe } from "lucide-react";
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

  // Export to Excel (.xlsx) menggunakan SheetJS
  const handleExportExcel = () => {
    try {
      setExportingExcel(true);
      const activeRaw = activeTab === "Balita" ? filteredBalitaRaw : filteredLansiaRaw;
      if (activeRaw.length === 0) {
        alert("Tidak ada data untuk diekspor.");
        return;
      }

      // ── Build rows ──────────────────────────────────────────
      const rows =
        activeTab === "Balita"
          ? activeRaw.map((item, idx) => ({
              No: idx + 1,
              "Nama Balita": item.namaWarga || "",
              Posyandu: item.posyanduNama || "",
              Wilayah: item.wilayah || "",
              "Tanggal Periksa": item.tanggalPeriksa || "",
              "Tanggal Lahir": item.tanggalLahir || "",
              NIK: item.nik || "-",
              "Nama Ibu": item.namaIbu || "-",
              "Jenis Kelamin": item.jenisKelamin === "L" ? "Laki-laki" : "Perempuan",
              "Usia (Bulan)": item.usiaInfo || "",
              "BB (kg)": item.beratBadan ?? "",
              "TB (cm)": item.tinggiBadan ?? "",
              "LK (cm)": item.lingkarKepala ?? "",
              "LiLA (cm)": item.lingkarLengan ?? "",
              "Status BB/U": item.statusBbU || "-",
              "Status TB/U": item.statusTbU || "-",
              "Status BB/TB": item.statusBbTb || "-",
              "Pemberian Lain": extractPemberianLain(item.statusImunisasi),
              "Vit B1": item.vitB1 ? "Ya" : "Tidak",
              "Vit B6": item.vitB6 ? "Ya" : "Tidak",
              "ASI Eksklusif": item.asiEksklusif ? "Ya" : "Tidak",
              "Vitamin A": item.vitaminA ? "Ya" : "Tidak",
              "Obat Cacing": item.obatCacing ? "Ya" : "Tidak",
              Petugas: item.petugas || "Kader Posyandu",
            }))
          : activeRaw.map((item, idx) => ({
              No: idx + 1,
              "Nama Lansia": item.namaWarga || "",
              Posyandu: item.posyanduNama || "",
              Wilayah: item.wilayah || "",
              "Tanggal Periksa": item.tanggalPeriksa || "",
              "Tanggal Lahir": item.tanggalLahir || "",
              NIK: item.nik || "-",
              "Jenis Kelamin": item.jenisKelamin === "L" ? "Laki-laki" : "Perempuan",
              Usia: item.usiaInfo || "-",
              "Riw. HT": item.riwayatHt ? "Ya" : "Tidak",
              "Riw. DM": item.riwayatDm ? "Ya" : "Tidak",
              "BB (kg)": item.beratBadan ?? "",
              "TB (cm)": item.tinggiBadan ?? "",
              "Tekanan Darah": item.tekananDarah || (item.sistol ? `${item.sistol}/${item.diastol}` : "-"),
              "GDS (mg/dL)": item.gds ?? "",
              "Kolesterol (mg/dL)": item.kolesterol ?? "",
              "Asam Urat (mg/dL)": item.asamUrat ?? "",
              "Lingkar Perut (cm)": item.lingkarPerut ?? "",
              Keluhan: item.keluhan || "-",
              "Tindakan Medis": item.tindakan || item.tindakanCatatan || "-",
              "Status Ringkasan": item.statusRingkasan || "-",
              Petugas: item.petugas || "Kader Posyandu",
            }));

      // ── Build worksheet ──────────────────────────────────────
      const ws = XLSX.utils.json_to_sheet(rows);

      // Auto-width: hitung lebar kolom berdasarkan konten
      const colKeys = Object.keys(rows[0] || {});
      const colWidths = colKeys.map((key) => {
        const maxLen = Math.max(
          key.length,
          ...rows.map((r) => String((r as any)[key] ?? "").length)
        );
        return { wch: Math.min(maxLen + 2, 40) };
      });
      ws["!cols"] = colWidths;

      // Bold header row
      const headerRange = XLSX.utils.decode_range(ws["!ref"] || "A1");
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddr = XLSX.utils.encode_cell({ r: 0, c: col });
        if (ws[cellAddr]) {
          ws[cellAddr].s = { font: { bold: true } };
        }
      }

      // ── Build workbook & download ────────────────────────────
      const wb = XLSX.utils.book_new();
      const sheetName = activeTab === "Balita" ? "Data Balita" : "Data Lansia";
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      const fileName = `Laporan_${activeTab}_${periodeText.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error("Gagal export Excel:", err);
      alert("Gagal mengunduh file Excel.");
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
        title={`Laporan Rekapitulasi ${activeTab} — SIPANDU`}
        description={`Portal publik rekapitulasi data pemeriksaan kesehatan ${activeTab} seluruh Posyandu terintegrasi SIPANDU.`}
      />

      {/* Header Halaman */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-2xs">
        <div className="flex items-start gap-4">
          {/* Logo SIPANDU & Universitas */}
          <div className="flex items-center gap-2 shrink-0 mt-0.5">
            <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200/90 shadow-2xs flex items-center justify-center p-2">
              <img src="/logo.svg" alt="Logo SIPANDU" className="w-8 h-8 object-contain" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200/90 shadow-2xs flex items-center justify-center p-1.5">
              <img src="/logoupb.webp" alt="Logo Universitas" className="w-9 h-9 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 border border-teal-200/80 text-teal-800">
                <Globe className="w-3.5 h-3.5 text-teal-600" /> Portal Publik
              </span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              SIPANDU — Laporan Rekapitulasi Pelayanan Posyandu
            </h2>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              Sistem Informasi Pelayanan dan Data Posyandu — Portal publik rekapitulasi dan pemantauan data pemeriksaan kesehatan Balita &amp; Lansia seluruh Posyandu secara terbuka dan transparan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 sm:self-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow"
          >
            <span>Aplikasi Posyandu</span>
            <ChevronRight className="w-4 h-4" />
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
