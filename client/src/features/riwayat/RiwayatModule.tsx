'use client';

import { useState, useEffect, useRef } from "react";
import { formatTanggalIndonesia, formatTanggalInput } from "../../lib/dateUtils";
import { riwayatApi, ItemRiwayat, balitaApi, lansiaApi, PeriodePelayanan } from "@/lib/api";
import { SearchIndex } from "../../lib/searchIndex";
import { clientDataCache } from "../../lib/dataCache";
import {
  hitungStatusBbU,
  hitungStatusTbU,
  hitungStatusBbTb,
  convertStatusBbUToCode,
  convertStatusTbUToCode,
  convertStatusBbTbToCode,
} from "../../lib/zScoreCalculator";
import PageHelmet from "@/components/PageHelmet";
import RiwayatFilterBar from "./components/RiwayatFilterBar";
import RiwayatTrendChart from "./components/RiwayatTrendChart";
import RiwayatTable from "./components/RiwayatTable";
import RiwayatDetailModal from "./components/RiwayatDetailModal";
import RiwayatModals from "./components/RiwayatModals";


interface RiwayatModuleProps {
  posyanduId: string;
  activePeriode?: PeriodePelayanan | null;
  onNavigate?: (module: string, itemId?: string) => void;
}

export default function RiwayatModule({ posyanduId, activePeriode, onNavigate }: RiwayatModuleProps) {
  const initialCacheKey = `riwayat_logs_${posyanduId}_semua_semua_${activePeriode ? activePeriode.bulan : "semua"}_${activePeriode ? activePeriode.tahun : "semua"}`;
  const [logs, setLogs] = useState<ItemRiwayat[]>(() => {
    if (typeof window !== "undefined" && posyanduId) {
      const cached = clientDataCache.get<ItemRiwayat[]>(initialCacheKey);
      if (cached && cached.length > 0) return cached;
    }
    return [];
  });
  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined" && posyanduId) {
      const cached = clientDataCache.get<ItemRiwayat[]>(initialCacheKey);
      if (cached && cached.length > 0) return false;
    }
    return true;
  });
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"semua" | "Balita" | "Lansia">("semua");
  const [statusFilter, setStatusFilter] = useState<"semua" | "success" | "warning">("semua");
  const [selectedBulan, setSelectedBulan] = useState<number | "semua">(
    activePeriode ? activePeriode.bulan : "semua"
  );
  const [selectedTahun, setSelectedTahun] = useState<number | "semua">(
    activePeriode ? activePeriode.tahun : "semua"
  );

  // In-Memory Search Index for instant O(1) query lookups
  const riwayatIndexRef = useRef<SearchIndex<ItemRiwayat>>(
    new SearchIndex<ItemRiwayat>((log) => [
      log.nama,
      log.nik,
      log.parameter,
      log.status,
      log.petugas,
      log.keluhan,
      log.tindakan,
      log.tipe,
    ])
  );

  useEffect(() => {
    riwayatIndexRef.current.setSource(logs);
  }, [logs]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, typeFilter, statusFilter, selectedBulan, selectedTahun]);

  // Tab mode: "tabel" vs "grafik"
  const [viewMode, setViewMode] = useState<"tabel" | "grafik">("tabel");

  // Modal Detail & Grafik Perkembangan Peserta State
  const [selectedDetailLog, setSelectedDetailLog] = useState<ItemRiwayat | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Modal Edit & Delete State
  const [selectedLog, setSelectedLog] = useState<ItemRiwayat | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Form Fields - Balita
  const [bDate, setBDate] = useState("");
  const [bBB, setBBB] = useState("");
  const [bTB, setBTB] = useState("");
  const [bLK, setBLK] = useState("");
  const [bLiLA, setBLiLA] = useState("");
  const [bBBU, setBBBU] = useState<any>("Normal");
  const [bTBU, setBTBU] = useState<any>("Normal");
  const [bBBTB, setBBBTB] = useState<any>("Normal");
  const [bKms, setBKms] = useState("N (Naik)");
  const [bVitA, setBVitA] = useState(false);
  const [bAsi, setBAsi] = useState(false);
  const [bCacing, setBCacing] = useState(false);
  const [bImunisasi, setBImunisasi] = useState("");
  const [bPetugas, setBPetugas] = useState("");

  // Form Fields - Lansia
  const [lDate, setLDate] = useState("");
  const [lBB, setLBB] = useState("");
  const [lTB, setLTB] = useState("");
  const [lSistol, setLSistol] = useState("");
  const [lDiastol, setLDiastol] = useState("");
  const [lGds, setLGds] = useState("");
  const [lLp, setLLp] = useState("");
  const [lKol, setLKol] = useState("");
  const [lUrat, setLUrat] = useState("");
  const [lKeluhan, setLKeluhan] = useState("");
  const [lTindakan, setLTindakan] = useState("");
  const [lPetugas, setLPetugas] = useState("");

  // Open Detail & Grafik Perkembangan Modal
  const openDetailModal = (log: ItemRiwayat) => {
    setSelectedDetailLog(log);
    setIsDetailModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (log: ItemRiwayat) => {
    setSelectedLog(log);
    setFormError("");
    if (log.tipe === "Balita") {
      setBDate(formatTanggalInput(log.tanggal));
      setBBB(log.beratBadan ? String(log.beratBadan) : "");
      setBTB(log.tinggiBadan ? String(log.tinggiBadan) : "");
      setBLK(log.lingkarKepala ? String(log.lingkarKepala) : "");
      setBLiLA(log.lingkarLengan ? String(log.lingkarLengan) : "");
      setBBBU((log.statusBbU as any) || "Normal");
      setBTBU((log.statusTbU as any) || "Normal");
      setBBBTB((log.statusBbTb as any) || "Normal");
      setBKms(log.statusKms || "N (Naik)");
      setBVitA(Boolean(log.vitaminA));
      setBAsi(Boolean(log.asiEksklusif));
      setBCacing(Boolean(log.obatCacing));
      setBImunisasi(log.statusImunisasi || "");
      setBPetugas(log.petugas || "");
    } else {
      setLDate(formatTanggalInput(log.tanggal));
      setLBB(log.beratBadan ? String(log.beratBadan) : "");
      setLTB(log.tinggiBadan ? String(log.tinggiBadan) : "");
      setLSistol(log.tekananDarahSistol ? String(log.tekananDarahSistol) : "");
      setLDiastol(log.tekananDarahDiastol ? String(log.tekananDarahDiastol) : "");
      setLGds(log.gulaDarahSewaktu ? String(log.gulaDarahSewaktu) : "");
      setLLp(log.lingkarPerut ? String(log.lingkarPerut) : "");
      setLKol(log.kolesterol ? String(log.kolesterol) : "");
      setLUrat(log.asamUrat ? String(log.asamUrat) : "");
      setLKeluhan(log.keluhan || "");
      setLTindakan(log.tindakan || "");
      setLPetugas(log.petugas || "");
    }
    setIsEditModalOpen(true);
  };

  // Open Delete Modal
  const openDeleteModal = (log: ItemRiwayat) => {
    setSelectedLog(log);
    setIsDeleteModalOpen(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLog) return;
    setFormError("");
    setSaving(true);
    try {
      if (selectedLog.tipe === "Balita") {
        const bb = parseFloat(bBB);
        const tb = parseFloat(bTB);
        if (isNaN(bb) || bb <= 0 || isNaN(tb) || tb <= 0) {
          setFormError("Berat Badan dan Tinggi Badan harus diisi angka positif yang valid.");
          setSaving(false);
          return;
        }
        const pasienId = selectedLog.pasienId || selectedLog.id;
        await balitaApi.updatePemeriksaan(posyanduId, pasienId, selectedLog.id, {
          tanggalPeriksa: bDate,
          beratBadan: bb,
          tinggiBadan: tb,
          lingkarKepala: bLK ? parseFloat(bLK) : undefined,
          lingkarLengan: bLiLA ? parseFloat(bLiLA) : undefined,
          statusBbU: convertStatusBbUToCode(bBBU),
          statusTbU: convertStatusTbUToCode(bTBU),
          statusBbTb: convertStatusBbTbToCode(bBBTB),
          statusKms: bKms,
          vitaminA: bVitA,
          asiEksklusif: bAsi,
          obatCacing: bCacing,
          statusImunisasi: bImunisasi || undefined,
          petugas: bPetugas || undefined,
        } as any);
      } else {
        const bb = parseFloat(lBB);
        const tb = parseFloat(lTB);
        const sistol = parseInt(lSistol);
        const diastol = parseInt(lDiastol);
        const gds = parseFloat(lGds);
        const lp = parseFloat(lLp);
        if (isNaN(bb) || bb <= 0 || isNaN(tb) || tb <= 0 || isNaN(sistol) || isNaN(diastol) || isNaN(gds) || isNaN(lp)) {
          setFormError("Mohon isi semua data pemeriksaan lansia dengan angka positif yang valid.");
          setSaving(false);
          return;
        }
        const pasienId = selectedLog.pasienId || selectedLog.id;
        await lansiaApi.updatePemeriksaan(posyanduId, pasienId, selectedLog.id, {
          tanggalPeriksa: lDate,
          beratBadan: bb,
          tinggiBadan: tb,
          tekananDarahSistol: sistol,
          tekananDarahDiastol: diastol,
          gulaDarahSewaktu: gds,
          lingkarPerut: lp,
          kolesterol: lKol ? parseFloat(lKol) : undefined,
          asamUrat: lUrat ? parseFloat(lUrat) : undefined,
          keluhan: lKeluhan || undefined,
          tindakan: lTindakan || undefined,
          petugas: lPetugas || undefined,
        } as any);
      }
      fetchRiwayat();
      window.dispatchEvent(new Event("pemeriksaanSaved"));
      setIsEditModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Gagal mengedit data pemeriksaan.");
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete Submit
  const handleDeleteSubmit = async () => {
    if (!selectedLog) return;
    setSaving(true);
    try {
      const pasienId = selectedLog.pasienId || selectedLog.id;
      if (selectedLog.tipe === "Balita") {
        await balitaApi.deletePemeriksaan(posyanduId, pasienId, selectedLog.id);
      } else {
        await lansiaApi.deletePemeriksaan(posyanduId, pasienId, selectedLog.id);
      }
      fetchRiwayat();
      window.dispatchEvent(new Event("pemeriksaanSaved"));
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Gagal menghapus riwayat periksa.");
    } finally {
      setSaving(false);
    }
  };

  // Load data riwayat dari backend API
  const fetchRiwayat = async () => {
    const currentKey = `riwayat_logs_${posyanduId}_${typeFilter}_${statusFilter}_${selectedBulan}_${selectedTahun}`;
    const cached = clientDataCache.get<ItemRiwayat[]>(currentKey);

    if (cached && cached.length > 0) {
      setLogs(cached);
      setLoading(false);
    } else if (logs.length === 0) {
      setLoading(true);
    }

    try {
      const res = await riwayatApi.getAll(posyanduId, {
        tipe: typeFilter,
        search: query || undefined,
        status: statusFilter,
        bulan: selectedBulan === "semua" ? undefined : String(selectedBulan),
        tahun: selectedTahun === "semua" ? undefined : String(selectedTahun),
      });
      if (res.success) {
        setLogs(res.data);
        clientDataCache.set(currentKey, res.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data riwayat:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayat();
  }, [posyanduId, typeFilter, statusFilter, selectedBulan, selectedTahun]);

  // Debounced search submit
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRiwayat();
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  // Listen for pemeriksaanSaved event from Balita/Lansia modules
  useEffect(() => {
    const handlePemeriksaanSaved = () => {
      fetchRiwayat();
    };
    window.addEventListener("pemeriksaanSaved", handlePemeriksaanSaved);
    return () => window.removeEventListener("pemeriksaanSaved", handlePemeriksaanSaved);
  }, []);

  // Olah data untuk Grafik Trend Pertumbuhan / Pemeriksaan (Agregasi Tanggal Global)
  const chartData = (() => {
    const dateMap: Record<string, { tanggal: string; balita: number; lansia: number; warning: number }> = {};

    logs.forEach((log) => {
      if (!dateMap[log.tanggal]) {
        dateMap[log.tanggal] = { tanggal: log.tanggal, balita: 0, lansia: 0, warning: 0 };
      }
      if (log.tipe === "Balita") dateMap[log.tanggal].balita += 1;
      if (log.tipe === "Lansia") dateMap[log.tanggal].lansia += 1;
      if (log.statusType === "warning") dateMap[log.tanggal].warning += 1;
    });

    return Object.values(dateMap).sort(
      (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
    );
  })();

  // Olah data untuk Grafik Individual Peserta (Detail Modal)
  const participantHistory = selectedDetailLog
    ? logs
        .filter((l) =>
          selectedDetailLog.pasienId
            ? l.pasienId === selectedDetailLog.pasienId
            : l.nama === selectedDetailLog.nama
        )
        .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())
    : [];

  const latestRecord = participantHistory.length > 0 ? participantHistory[participantHistory.length - 1] : null;
  const prevRecord = participantHistory.length > 1 ? participantHistory[participantHistory.length - 2] : null;

  // Trend Kenaikan / Penurunan BB & TB
  const rawBbLatest = Number(latestRecord?.beratBadan);
  const bbLatest = isNaN(rawBbLatest) ? 0 : rawBbLatest;
  const rawBbPrev = Number(prevRecord?.beratBadan);
  const bbPrev = isNaN(rawBbPrev) ? 0 : rawBbPrev;
  const rawBbDiff = prevRecord && latestRecord ? bbLatest - bbPrev : 0;
  const bbDiff = isNaN(rawBbDiff) ? 0 : Number(rawBbDiff.toFixed(2));

  const rawTbLatest = Number(latestRecord?.tinggiBadan);
  const tbLatest = isNaN(rawTbLatest) ? 0 : rawTbLatest;
  const rawTbPrev = Number(prevRecord?.tinggiBadan);
  const tbPrev = isNaN(rawTbPrev) ? 0 : rawTbPrev;
  const rawTbDiff = prevRecord && latestRecord ? tbLatest - tbPrev : 0;
  const tbDiff = isNaN(rawTbDiff) ? 0 : Number(rawTbDiff.toFixed(2));

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

  const isFilterActive =
    query.trim() !== "" ||
    typeFilter !== "semua" ||
    statusFilter !== "semua" ||
    selectedBulan !== "semua" ||
    selectedTahun !== "semua";

  const handleResetFilters = () => {
    setQuery("");
    setTypeFilter("semua");
    setStatusFilter("semua");
    setSelectedBulan("semua");
    setSelectedTahun("semua");
  };

  const handleSetCurrentPeriod = () => {
    if (activePeriode) {
      setSelectedBulan(activePeriode.bulan);
      setSelectedTahun(activePeriode.tahun);
    } else {
      const now = new Date();
      setSelectedBulan(now.getMonth() + 1);
      setSelectedTahun(now.getFullYear());
    }
  };

  return (
    <div className="space-y-6">
      <PageHelmet
        title="Riwayat & Laporan"
        description="Laporan riwayat pemeriksaan bulanan terpadu dengan fitur cetak Excel dan PDF."
      />
      {/* 1. Header & Filters */}
      <RiwayatFilterBar
        viewMode={viewMode}
        setViewMode={setViewMode}
        query={query}
        setQuery={setQuery}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        selectedBulan={selectedBulan}
        setSelectedBulan={setSelectedBulan}
        selectedTahun={selectedTahun}
        setSelectedTahun={setSelectedTahun}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        monthNames={monthNames}
        yearOptions={yearOptions}
        activePeriode={activePeriode}
        handleSetCurrentPeriod={handleSetCurrentPeriod}
        handleResetFilters={handleResetFilters}
        isFilterActive={isFilterActive}
      />

      {/* 2. Global Trend Chart View */}
      {viewMode === "grafik" && <RiwayatTrendChart chartData={chartData} />}

      {/* 3. History Table View */}
      {viewMode === "tabel" && (
        <RiwayatTable
          loading={loading}
          logs={logs}
          query={query}
          riwayatIndexRef={riwayatIndexRef}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          formatTanggalIndonesia={formatTanggalIndonesia}
          onNavigate={onNavigate}
          openDetailModal={openDetailModal}
          openEditModal={openEditModal}
          openDeleteModal={openDeleteModal}
        />
      )}

      {/* 4. Patient Growth Trend & Exam Detail Modal */}
      <RiwayatDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        selectedDetailLog={selectedDetailLog}
        participantHistory={participantHistory}
        latestRecord={latestRecord}
        prevRecord={prevRecord}
        bbLatest={bbLatest}
        bbDiff={bbDiff}
        tbLatest={tbLatest}
        tbDiff={tbDiff}
        onNavigate={onNavigate}
      />

      {/* 5. Edit & Delete Action Modals */}
      <RiwayatModals
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        isDeleteModalOpen={isDeleteModalOpen}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
        selectedLog={selectedLog}
        handleEditSubmit={handleEditSubmit}
        handleDeleteSubmit={handleDeleteSubmit}
        formError={formError}
        saving={saving}
        bDate={bDate}
        setBDate={setBDate}
        bBB={bBB}
        setBBB={setBBB}
        bTB={bTB}
        setBTB={setBTB}
        bLK={bLK}
        setBLK={setBLK}
        bLiLA={bLiLA}
        setBLiLA={setBLiLA}
        bVitA={bVitA}
        setBVitA={setBVitA}
        bAsi={bAsi}
        setBAsi={setBAsi}
        bCacing={bCacing}
        setBCacing={setBCacing}
        bImunisasi={bImunisasi}
        setBImunisasi={setBImunisasi}
        bPetugas={bPetugas}
        setBPetugas={setBPetugas}
        lDate={lDate}
        setLDate={setLDate}
        lBB={lBB}
        setLBB={setLBB}
        lTB={lTB}
        setLTB={setLTB}
        lSistol={lSistol}
        setLSistol={setLSistol}
        lDiastol={lDiastol}
        setLDiastol={setLDiastol}
        lGds={lGds}
        setLGds={setLGds}
        lLp={lLp}
        setLLp={setLLp}
        lKol={lKol}
        setLKol={setLKol}
        lUrat={lUrat}
        setLUrat={setLUrat}
        lKeluhan={lKeluhan}
        setLKeluhan={setLKeluhan}
        lTindakan={lTindakan}
        setLTindakan={setLTindakan}
      />

    </div>
  );
}
