"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  riwayatApi,
  ItemRiwayat,
  PeriodePelayanan,
  periodeApi,
  balitaApi,
  lansiaApi,
} from "@/lib/api";
import { clientDataCache } from "@/lib/dataCache";
import { SearchIndex } from "@/lib/searchIndex";
import PageHelmet from "@/components/PageHelmet";
import { LaporanSkeleton } from "@/components/Skeleton";
import PdfPreviewModal from "@/components/PdfPreviewModal";
import { RekapanBalita, RekapanLansia } from "./types";
import {
  formatPeriodeText,
  filterLogsByDateRange,
  calculateRekapanBalita,
  calculateRekapanLansia,
} from "./utils/laporanCalculators";
import LaporanFilterCard from "./components/LaporanFilterCard";
import BalitaLaporanView from "./components/BalitaLaporanView";
import LansiaLaporanView from "./components/LansiaLaporanView";

interface LaporanModuleProps {
  posyanduId: string;
  activePeriode?: PeriodePelayanan | null;
  onNavigate?: (module: string, itemId?: string) => void;
}

export default function LaporanModule({
  posyanduId,
  activePeriode,
  onNavigate,
}: LaporanModuleProps) {
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
      periodeApi
        .getActive(posyanduId)
        .then((res) => {
          if (res.success && res.data?.bulan && res.data?.tahun) {
            setFilterMonth(String(res.data.bulan).padStart(2, "0"));
            setFilterYear(String(res.data.tahun));
          }
        })
        .catch(() => {});
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
  const [isFetchingData, setIsFetchingData] = useState(false);

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

    setIsFetchingData(true);
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
      setIsFetchingData(false);
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

  const periodeText = formatPeriodeText(filterMonth, filterYear);

  useEffect(() => {
    if (posyanduId) {
      fetchRiwayat();
    }
  }, [posyanduId, filterMonth, filterYear]);

  // Hitung rekapan balita & lansia secara reaktif
  useEffect(() => {
    const activeLogs = filterLogsByDateRange(logs, filterFromDate, filterToDate);
    const balitaLogs = activeLogs.filter((l) => l.tipe === "Balita");
    const lansiaLogs = activeLogs.filter((l) => l.tipe === "Lansia");

    setRekapanBalita(calculateRekapanBalita(balitaLogs, totalBalitaTerdaftar, periodeText));
    setRekapanLansia(calculateRekapanLansia(lansiaLogs, totalLansiaTerdaftar, periodeText));

    setPageBalita(1);
    setPageLansia(1);
  }, [logs, filterFromDate, filterToDate, totalBalitaTerdaftar, totalLansiaTerdaftar, periodeText]);

  // Filter data Balita berdasarkan search & tanggal
  const filteredBalitaLogs = useMemo(() => {
    const source = searchBalita.trim()
      ? balitaIndexRef.current.search(searchBalita)
      : logs.filter((l) => l.tipe === "Balita");

    return filterLogsByDateRange(source, filterFromDate, filterToDate);
  }, [logs, searchBalita, filterFromDate, filterToDate]);

  // Filter data Lansia berdasarkan search & tanggal
  const filteredLansiaLogs = useMemo(() => {
    const source = searchLansia.trim()
      ? lansiaIndexRef.current.search(searchLansia)
      : logs.filter((l) => l.tipe === "Lansia");

    return filterLogsByDateRange(source, filterFromDate, filterToDate);
  }, [logs, searchLansia, filterFromDate, filterToDate]);

  const currentYear = new Date().getFullYear();
  const baseYear = activePeriode?.tahun ? Math.max(currentYear, activePeriode.tahun) : currentYear;
  const yearOptions = Array.from({ length: 6 }, (_, i) => baseYear - i);

  const hasData =
    filterCategory === "Balita" ? filteredBalitaLogs.length > 0 : filteredLansiaLogs.length > 0;

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

  const filterKey = `${filterCategory}_${filterMonth}_${filterYear}_${filterFromDate}_${filterToDate}_${logs.length}`;

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
          Laporan rekapitulasi data pemeriksaan Balita &amp; Lansia berdasarkan periode waktu dan kegiatan posyandu.
        </p>
      </div>

      {/* Filter Controls & Export Box */}
      <LaporanFilterCard
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        filterMonth={filterMonth}
        setFilterMonth={setFilterMonth}
        filterYear={filterYear}
        setFilterYear={setFilterYear}
        filterFromDate={filterFromDate}
        setFilterFromDate={setFilterFromDate}
        filterToDate={filterToDate}
        setFilterToDate={setFilterToDate}
        yearOptions={yearOptions}
        onResetCurrentPeriod={() => {
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
        onResetAllPeriods={() => {
          setFilterMonth("");
          setFilterYear("");
          setFilterFromDate("");
          setFilterToDate("");
          setSearchBalita("");
          setSearchLansia("");
        }}
        isLoading={rekapanLoading || isFetchingData}
        hasData={hasData}
        onOpenPreview={handleOpenPreview}
        onExportExcel={handleExportExcel}
        isExportingExcel={exportingExcel}
        isExportingPdf={exportingPdf}
      />

      {/* Tampilan Rekapan Balita */}
      {filterCategory === "Balita" && (
        <BalitaLaporanView
          rekapanBalita={rekapanBalita}
          filteredBalitaLogs={filteredBalitaLogs}
          pageBalita={pageBalita}
          setPageBalita={setPageBalita}
          pageSizeBalita={pageSizeBalita}
          setPageSizeBalita={setPageSizeBalita}
          searchBalita={searchBalita}
          setSearchBalita={setSearchBalita}
          onNavigate={onNavigate}
          triggerKey={filterKey}
          isUpdating={isFetchingData}
        />
      )}

      {/* Tampilan Rekapan Lansia */}
      {filterCategory === "Lansia" && (
        <LansiaLaporanView
          rekapanLansia={rekapanLansia}
          filteredLansiaLogs={filteredLansiaLogs}
          pageLansia={pageLansia}
          setPageLansia={setPageLansia}
          pageSizeLansia={pageSizeLansia}
          setPageSizeLansia={setPageSizeLansia}
          searchLansia={searchLansia}
          setSearchLansia={setSearchLansia}
          onNavigate={onNavigate}
          triggerKey={filterKey}
          isUpdating={isFetchingData}
        />
      )}

      {/* Modal Pratinjau Dokumen Laporan */}
      <PdfPreviewModal
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        pdfUrl={previewPdfUrl}
        isLoading={previewLoading}
        error={previewError}
        category={filterCategory}
        periodeText={periodeText}
        onRetry={handleOpenPreview}
        onDownloadPdf={handleDownloadFromPreview}
        onDownloadExcel={handleExportExcel}
        isExportingExcel={exportingExcel}
      />
    </div>
  );
}
