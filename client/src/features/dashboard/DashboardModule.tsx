"use client";

import { useState, useEffect, useMemo } from "react";
import {
  dashboardApi,
  DashboardSummary,
  DistribusiKehadiran,
  balitaApi,
  lansiaApi,
  TrenGiziItem,
  AktivitasKunjunganData,
  ItemAktivitasKunjungan,
  periodeApi,
  PeriodePelayanan,
  riwayatApi,
  ItemRiwayat,
} from "../../lib/api";
import { formatTanggalIndonesia } from "../../lib/dateUtils";
import Modal from "../../components/Modal";
import PageHelmet from "../../components/PageHelmet";
import { CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { hitungStatusBbU, hitungStatusTbU, hitungStatusBbTb, hitungIMT } from "../../lib/zScoreCalculator";
import { useAuth } from "../../contexts/AuthContext";
import { Kunjungan, Pasien } from "./types";
import DashboardKpiGrid from "./components/DashboardKpiGrid";
import DashboardCharts from "./components/DashboardCharts";
import DashboardVisitsTable from "./components/DashboardVisitsTable";
import DashboardExamModal from "./components/DashboardExamModal";
import DashboardActivityModal from "./components/DashboardActivityModal";


interface DashboardModuleProps {
  searchQuery: string;
  onNavigate: (menu: string, patientId?: string) => void;
  posyanduId: string;
  activePeriode?: PeriodePelayanan | null;
}

import { DashboardSkeleton } from "../../components/Skeleton";
import { clientDataCache } from "../../lib/dataCache";


export default function DashboardModule({ searchQuery, onNavigate, posyanduId, activePeriode }: DashboardModuleProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"Semua" | "Balita" | "Lansia">("Semua");

  // ── API state ──────────────────────────────────────────────
  const [summary, setSummary] = useState<DashboardSummary | null>(() => {
    if (typeof window !== "undefined" && posyanduId) {
      const cached = clientDataCache.get<DashboardSummary>(`dash_summary_${posyanduId}`);
      if (cached) return cached;
    }
    return null;
  });
  const [isSummaryLoading, setIsSummaryLoading] = useState(() => {
    if (typeof window !== "undefined" && posyanduId) {
      const cached = clientDataCache.get<DashboardSummary>(`dash_summary_${posyanduId}`);
      if (cached) return false;
    }
    return true;
  });
  const [dbPasiens, setDbPasiens] = useState<Pasien[]>([]);
  const [distribusiKehadiran, setDistribusiKehadiran] = useState<DistribusiKehadiran[]>([]);
  const [isDistribusiLoading, setIsDistribusiLoading] = useState(false);

  // ── Aktivitas Kunjungan State ─────────────────────────────
  const [aktivitasData, setAktivitasData] = useState<AktivitasKunjunganData | null>(null);
  const [isAktivitasLoading, setIsAktivitasLoading] = useState(false);
  const [aktivitasTab, setAktivitasTab] = useState<"balita" | "lansia" | "belum_balita" | "belum_lansia">("balita");
  const [aktivitasSearch, setAktivitasSearch] = useState("");

  const fetchAktivitas = () => {
    setIsAktivitasLoading(true);
    dashboardApi
      .getAktivitasKunjungan(posyanduId)
      .then((res) => {
        if (res.success && res.data) {
          setAktivitasData(res.data);
        }
      })
      .catch(console.error)
      .finally(() => setIsAktivitasLoading(false));
  };

  useEffect(() => {
    fetchAktivitas();
  }, [posyanduId, activePeriode]);

  // ── Action Menu & Detail Modals ──
  const [showDetailAktivitas, setShowDetailAktivitas] = useState(false);
  const [showDetailDistribusi, setShowDetailDistribusi] = useState(false);
  const [distribusiTab, setDistribusiTab] = useState<"Semua" | "Balita" | "Lansia">("Semua");

  const modalDistribusiList = useMemo(() => {
    return (distribusiKehadiran || [])
      .map((row) => {
        if (distribusiTab === "Balita") {
          const bTotal = row.balita?.total ?? 0;
          const bHadir = row.balita?.hadir ?? 0;
          const bPersen = bTotal > 0 ? Math.round((bHadir / bTotal) * 100) : 0;
          return {
            rtRw: row.rtRw,
            total: bTotal,
            hadir: bHadir,
            persentase: bPersen,
            label: "Balita",
          };
        }
        if (distribusiTab === "Lansia") {
          const lTotal = row.lansia?.total ?? 0;
          const lHadir = row.lansia?.hadir ?? 0;
          const lPersen = lTotal > 0 ? Math.round((lHadir / lTotal) * 100) : 0;
          return {
            rtRw: row.rtRw,
            total: lTotal,
            hadir: lHadir,
            persentase: lPersen,
            label: "Lansia",
          };
        }
        return {
          rtRw: row.rtRw,
          total: row.total,
          hadir: row.hadir,
          persentase: isNaN(Number(row.persentase)) ? 0 : Number(row.persentase),
          label: "Warga",
        };
      })
      .sort((a, b) => {
        if (a.total > 0 && b.total === 0) return -1;
        if (a.total === 0 && b.total > 0) return 1;
        return b.persentase - a.persentase;
      });
  }, [distribusiKehadiran, distribusiTab]);

  const handleDetailAktivitas = (tab?: "balita" | "lansia" | "belum_balita" | "belum_lansia") => {
    if (tab) setAktivitasTab(tab);
    setShowDetailAktivitas(true);
  };
  const handleExportAktivitas = () => {
    window.print();
  };


  const handleDetailDistribusi = () => setShowDetailDistribusi(true);
  const handleExportDistribusi = () => {
    window.print();
  };

  // ── Tren Gizi & Z-Score State ──
  const [trenPeriod, setTrenPeriod] = useState<"bulanan" | "tahunan">("bulanan");
  const [trenViewMode, setTrenViewMode] = useState<"status" | "zscore">("status");
  const [trenGiziData, setTrenGiziData] = useState<TrenGiziItem[]>([]);
  const [isTrenGiziLoading, setIsTrenGiziLoading] = useState(false);

  useEffect(() => {
    setIsTrenGiziLoading(true);
    dashboardApi
      .getTrenGizi(posyanduId, trenPeriod)
      .then((res) => {
        if (res.success && res.data) {
          setTrenGiziData(res.data);
        }
      })
      .catch(console.error)
      .finally(() => setIsTrenGiziLoading(false));
  }, [posyanduId, trenPeriod]);

  const fetchSummary = () => {
    const dashCacheKey = `dash_summary_${posyanduId}`;
    const cached = clientDataCache.get<DashboardSummary>(dashCacheKey);
    if (cached) {
      setSummary(cached);
      setIsSummaryLoading(false);
    } else if (!summary) {
      setIsSummaryLoading(true);
    }

    dashboardApi
      .getSummary(posyanduId)
      .then((res) => {
        if (res.success) {
          setSummary(res.data);
          clientDataCache.set(dashCacheKey, res.data);
        }
      })
      .catch(console.error)
      .finally(() => setIsSummaryLoading(false));
  };

  useEffect(() => {
    fetchSummary();
  }, [posyanduId, activePeriode]);

  useEffect(() => {
    const targetMonth = activePeriode ? activePeriode.bulan : (new Date().getMonth() + 1);
    const targetYear = activePeriode ? activePeriode.tahun : new Date().getFullYear();

    Promise.all([
      balitaApi.getAll(posyanduId),
      lansiaApi.getAll(posyanduId)
    ])
      .then(([balitaRes, lansiaRes]) => {
        const balitas: Pasien[] = (balitaRes.data || []).map((b) => {
          const currentExam = (b.pemeriksaans || []).find((exam) => {
            const d = new Date(exam.tanggalPeriksa);
            return (d.getMonth() + 1) === targetMonth && d.getFullYear() === targetYear;
          });

          return {
            id: b.id,
            nama: b.nama,
            tipe: "Balita",
            detailInfo: `Usia ${b.usiaBulan || calculateAgeInMonths(b.tanggalLahir)} Bulan, Ibu: ${b.namaIbu}`,
            tanggalLahir: b.tanggalLahir,
            jenisKelamin: b.jenisKelamin,
            currentPeriodExam: currentExam,
          };
        });

        const lansias: Pasien[] = (lansiaRes.data || []).map((l) => {
          const currentExam = (l.pemeriksaans || []).find((exam) => {
            const d = new Date(exam.tanggalPeriksa);
            return (d.getMonth() + 1) === targetMonth && d.getFullYear() === targetYear;
          });

          return {
            id: l.id,
            nama: l.nama,
            tipe: "Lansia",
            detailInfo: `RT/RW ${l.rtRw || "-"}`,
            tanggalLahir: l.tanggalLahir,
            jenisKelamin: l.jenisKelamin,
            currentPeriodExam: currentExam,
          };
        });

        setDbPasiens([...balitas, ...lansias]);
      })
      .catch(console.error);
  }, [posyanduId, activePeriode]);

  // Fetch Distribusi Kehadiran RT/RW (Poin 20)
  useEffect(() => {
    setIsDistribusiLoading(true);
    dashboardApi
      .getDistribusiKehadiran(posyanduId)
      .then((res) => {
        if (res.success && res.data) {
          setDistribusiKehadiran(res.data);
        }
      })
      .catch(console.error)
      .finally(() => setIsDistribusiLoading(false));
  }, [posyanduId]);

  // ── Riwayat Pelayanan Periode Aktif (untuk KPI Perlu Tindak Lanjut & Follow-Up) ──
  const [riwayatLogs, setRiwayatLogs] = useState<ItemRiwayat[]>(() => {
    if (typeof window !== "undefined" && posyanduId) {
      const targetM = activePeriode ? String(activePeriode.bulan).padStart(2, "0") : String(new Date().getMonth() + 1).padStart(2, "0");
      const targetY = activePeriode ? String(activePeriode.tahun) : String(new Date().getFullYear());
      const cacheKey = `laporan_logs_${posyanduId}_${targetM}_${targetY}`;
      const cached = clientDataCache.get<ItemRiwayat[]>(cacheKey);
      if (cached) return cached;
    }
    return [];
  });
  const [isRiwayatLoading, setIsRiwayatLoading] = useState<boolean>(() => {
    if (typeof window !== "undefined" && posyanduId) {
      const targetM = activePeriode ? String(activePeriode.bulan).padStart(2, "0") : String(new Date().getMonth() + 1).padStart(2, "0");
      const targetY = activePeriode ? String(activePeriode.tahun) : String(new Date().getFullYear());
      const cacheKey = `laporan_logs_${posyanduId}_${targetM}_${targetY}`;
      const cached = clientDataCache.get<ItemRiwayat[]>(cacheKey);
      if (cached && cached.length > 0) return false;
    }
    return true;
  });

  useEffect(() => {
    if (!posyanduId) return;
    const targetM = activePeriode ? String(activePeriode.bulan).padStart(2, "0") : String(new Date().getMonth() + 1).padStart(2, "0");
    const targetY = activePeriode ? String(activePeriode.tahun) : String(new Date().getFullYear());
    const cacheKey = `laporan_logs_${posyanduId}_${targetM}_${targetY}`;
    const cached = clientDataCache.get<ItemRiwayat[]>(cacheKey);

    if (cached) {
      setRiwayatLogs(cached);
      setIsRiwayatLoading(false);
    } else {
      setIsRiwayatLoading(true);
    }

    riwayatApi
      .getAll(posyanduId, { tipe: "semua", bulan: targetM, tahun: targetY })
      .then((res) => {
        if (res.success && res.data) {
          setRiwayatLogs(res.data);
          clientDataCache.set(cacheKey, res.data);
        }
      })
      .catch(console.error)
      .finally(() => setIsRiwayatLoading(false));
  }, [posyanduId, activePeriode]);

  const { perluTindakLanjutBalita, perluFollowUpLansia } = useMemo(() => {
    const balitaLogs = riwayatLogs.filter((l) => l.tipe === "Balita");
    const lansiaLogs = riwayatLogs.filter((l) => l.tipe === "Lansia");

    // Balita: Indikator masalah / perlu tindak lanjut (SP/P, SK/K, G/L)
    const balitaAttentionMap = new Set<string>();
    balitaLogs.forEach((l) => {
      const hasMasalah =
        l.statusTbU === "SP" ||
        l.statusTbU === "P" ||
        l.statusBbTb === "SK" ||
        l.statusBbTb === "K" ||
        l.statusBbTb === "G" ||
        l.statusBbTb === "L" ||
        l.statusBbU === "SK" ||
        l.statusBbU === "K";

      if (hasMasalah) {
        balitaAttentionMap.add(l.pasienId || l.nama);
      }
    });

    // Lansia: Indikator temuan klinis / follow-up
    const lansiaAttentionMap = new Set<string>();
    lansiaLogs.forEach((log) => {
      const sistol = Number(log.tekananDarahSistol || 0);
      const diastol = Number(log.tekananDarahDiastol || 0);
      const gds = Number(log.gulaDarahSewaktu || 0);
      const kol = Number(log.kolesterol || 0);
      const au = Number(log.asamUrat || 0);
      const lp = Number(log.lingkarPerut || 0);
      const jk = (log.jenisKelamin || "").toUpperCase().startsWith("P") ? "P" : "L";

      const isHt = sistol >= 140 || diastol >= 90;
      const isGds = gds >= 140;
      const isKolTinggi = kol >= 200;
      const isAuTinggi = au > (jk === "P" ? 6.0 : 7.0);
      const isObesitasSentral = lp > (jk === "P" ? 80 : 90);

      if (isHt || isGds || isKolTinggi || isAuTinggi || isObesitasSentral) {
        lansiaAttentionMap.add(log.pasienId || log.nik || log.nama);
      }
    });

    return {
      perluTindakLanjutBalita: balitaAttentionMap.size,
      perluFollowUpLansia: lansiaAttentionMap.size,
    };
  }, [riwayatLogs]);

  const targetMonth = activePeriode ? activePeriode.bulan : (new Date().getUTCMonth() + 1);
  const targetYear = activePeriode ? activePeriode.tahun : new Date().getUTCFullYear();

  const isMatchingPeriod = (tanggalStr?: string) => {
    if (!tanggalStr) return true;
    const d = new Date(tanggalStr);
    return (d.getUTCMonth() + 1) === targetMonth && d.getUTCFullYear() === targetYear;
  };

  const formatJamDanTanggal = (tanggalStr?: string, createdAtStr?: string) => {
    const raw = createdAtStr || tanggalStr;
    if (!raw) return "-";
    const d = new Date(raw);
    if (isNaN(d.getTime())) return "-";
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const jamStr = `${hours}:${minutes} WIB`;
    const tglStr = formatTanggalIndonesia(tanggalStr || raw);
    return `${jamStr} • ${tglStr}`;
  };

  const filteredBalitaTerbaru = (summary?.pemeriksaanTerbaru.balita ?? []).filter((p) => isMatchingPeriod(p.tanggalPeriksa));
  const filteredLansiaTerbaru = (summary?.pemeriksaanTerbaru.lansia ?? []).filter((p) => isMatchingPeriod(p.tanggalPeriksa));

  // Build kunjungan list from API data (recent pemeriksaan matching active period)
  const apiKunjungans: Kunjungan[] = [
    ...filteredBalitaTerbaru.map((p, i) => ({
      id: `b-${p.id ?? i}`,
      nama: p.balita.nama,
      tipe: "Balita" as const,
      detail: p.statusBbU ? `BB/U: ${p.statusBbU}` : "-",
      status: "Selesai Periksa",
      statusType: "success" as const,
      waktu: formatJamDanTanggal(p.tanggalPeriksa, p.createdAt),
    })),
    ...filteredLansiaTerbaru.map((p, i) => ({
      id: `l-${p.id ?? i}`,
      nama: p.lansia.nama,
      tipe: "Lansia" as const,
      detail: `${p.tekananDarahSistol}/${p.tekananDarahDiastol} mmHg`,
      status: "Selesai Periksa",
      statusType: "success" as const,
      waktu: formatJamDanTanggal(p.tanggalPeriksa, p.createdAt),
    })),
  ];

  // Real-time additions from quick-exam modal go here
  const [localKunjungans, setLocalKunjungans] = useState<Kunjungan[]>([]);
  const kunjungans = [...localKunjungans, ...apiKunjungans];

  // Popover State 3-Dots Menu
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Modal State
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [modalSearch, setModalSearch] = useState("");
  const [selectedPasien, setSelectedPasien] = useState<Pasien | null>(null);

  // Form Fields - Common
  const [examDate, setExamDate] = useState("2026-07-28");
  const [examBB, setExamBB] = useState("");
  const [examTB, setExamTB] = useState("");

  // Form Fields - Balita
  const [examLK, setExamLK] = useState("");
  const [examBBU, setExamBBU] = useState("Normal");
  const [examTBU, setExamTBU] = useState("Normal");
  const [examBBTB, setExamBBTB] = useState("Normal");
  const [examVitA, setExamVitA] = useState(false);
  const [examLiLA, setExamLiLA] = useState("");
  const [examKms, setExamKms] = useState("N");
  const [examAsi, setExamAsi] = useState(false);
  const [examCacing, setExamCacing] = useState(false);
  const [examImunisasi, setExamImunisasi] = useState("");

  // Form Fields - Lansia
  const [examSistol, setExamSistol] = useState("");
  const [examDiastol, setExamDiastol] = useState("");
  const [examGds, setExamGds] = useState("");
  const [examLp, setExamLp] = useState("");
  const [examCholesterol, setExamCholesterol] = useState("");
  const [examUricAcid, setExamUricAcid] = useState("");
  const [examKeluhan, setExamKeluhan] = useState("");
  const [examTindakan, setExamTindakan] = useState("");

  // Pre-fill form modal jika pasien sudah memiliki data di periode ini
  useEffect(() => {
    if (!selectedPasien) {
      setExamBB("");
      setExamTB("");
      setExamLK("");
      setExamLiLA("");
      setExamVitA(false);
      setExamAsi(false);
      setExamCacing(false);
      setExamImunisasi("");
      setExamSistol("");
      setExamDiastol("");
      setExamGds("");
      setExamLp("");
      setExamCholesterol("");
      setExamUricAcid("");
      setExamKeluhan("");
      setExamTindakan("");
      return;
    }

    const exam = selectedPasien.currentPeriodExam;
    if (exam) {
      if (exam.tanggalPeriksa) {
        setExamDate(new Date(exam.tanggalPeriksa).toISOString().slice(0, 10));
      }
      setExamBB(exam.beratBadan ? String(exam.beratBadan) : "");
      setExamTB(exam.tinggiBadan ? String(exam.tinggiBadan) : "");

      if (selectedPasien.tipe === "Balita") {
        setExamLK(exam.lingkarKepala ? String(exam.lingkarKepala) : "");
        setExamLiLA(exam.lingkarLengan ? String(exam.lingkarLengan) : "");
        setExamKms(exam.statusKms || "N");
        setExamVitA(Boolean(exam.vitaminA));
        setExamAsi(Boolean(exam.asiEksklusif));
        setExamCacing(Boolean(exam.obatCacing));
        setExamImunisasi(exam.statusImunisasi || "");
      } else {
        setExamSistol(exam.tekananDarahSistol ? String(exam.tekananDarahSistol) : "");
        setExamDiastol(exam.tekananDarahDiastol ? String(exam.tekananDarahDiastol) : "");
        setExamGds(exam.gulaDarahSewaktu ? String(exam.gulaDarahSewaktu) : "");
        setExamLp(exam.lingkarPerut ? String(exam.lingkarPerut) : "");
        setExamCholesterol(exam.kolesterol ? String(exam.kolesterol) : "");
        setExamUricAcid(exam.asamUrat ? String(exam.asamUrat) : "");
        setExamKeluhan(exam.keluhan || "");
        setExamTindakan(exam.tindakan || "");
      }
    } else {
      setExamBB("");
      setExamTB("");
      setExamLK("");
      setExamLiLA("");
      setExamVitA(false);
      setExamAsi(false);
      setExamCacing(false);
      setExamImunisasi("");
      setExamSistol("");
      setExamDiastol("");
      setExamGds("");
      setExamLp("");
      setExamCholesterol("");
      setExamUricAcid("");
      setExamKeluhan("");
      setExamTindakan("");
    }
  }, [selectedPasien]);

  // Helper Hitung Usia (Bulan)
  const calculateAgeInMonths = (birthDateStr: string, refDate: Date = new Date()): number => {
    const birth = new Date(birthDateStr);
    let months = (refDate.getFullYear() - birth.getFullYear()) * 12;
    months -= birth.getMonth();
    months += refDate.getMonth();
    return months <= 0 ? 0 : months;
  };

  useEffect(() => {
    if (!selectedPasien || selectedPasien.tipe !== "Balita" || !selectedPasien.tanggalLahir) return;
    const bb = parseFloat(examBB);
    const tb = parseFloat(examTB);
    const usia = calculateAgeInMonths(selectedPasien.tanggalLahir, new Date(examDate));
    const jk = selectedPasien.jenisKelamin || "L";
    if (!isNaN(bb) && bb > 0) {
      setExamBBU(hitungStatusBbU(bb, usia, jk as "L" | "P"));
    }
    if (!isNaN(tb) && tb > 0) {
      setExamTBU(hitungStatusTbU(tb, usia, jk as "L" | "P"));
    }
    if (!isNaN(bb) && bb > 0 && !isNaN(tb) && tb > 0) {
      setExamBBTB(hitungStatusBbTb(bb, tb, jk as "L" | "P"));
    }
  }, [examBB, examTB, examDate, selectedPasien]);

  // Warning & Success State
  const [modalError, setModalError] = useState("");
  const [modalWarning, setModalWarning] = useState("");

  // Filter Kunjungan
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  const filteredKunjungan = kunjungans.filter((k) => {
    const matchesSearch = k.nama.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "Semua" || k.tipe === activeTab;
    return matchesSearch && matchesTab;
  });

  const totalPages = Math.ceil(filteredKunjungan.length / itemsPerPage) || 1;
  const paginatedKunjungan = filteredKunjungan.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset pagination to page 1 when filter tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Filter Pasien in Modal
  const filteredPasiens = dbPasiens.filter((p) =>
    p.nama.toLowerCase().includes(modalSearch.toLowerCase())
  );

  // Warning Check
  const checkWarnings = (bbVal: string, sistolVal: string) => {
    setModalWarning("");
    if (!selectedPasien) return;

    const bb = parseFloat(bbVal);
    const sistol = parseInt(sistolVal);

    if (selectedPasien.tipe === "Balita" && bb > 25) {
      setModalWarning("Apakah Berat Badan (>25 kg) sudah sesuai untuk balita ini? Cek kembali.");
    } else if (selectedPasien.tipe === "Lansia" && sistol > 200) {
      setModalWarning("Tekanan darah sistol >200 mmHg sangat tinggi. Mohon rujuk lansia ke puskesmas.");
    }
  };

  // Submit Quick Exam
  const handleQuickExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");

    if (!selectedPasien) return;

    const bb = parseFloat(examBB);
    const tb = parseFloat(examTB);

    if (isNaN(bb) || bb <= 0 || isNaN(tb) || tb <= 0) {
      setModalError("Berat Badan dan Tinggi Badan wajib diisi angka positif.");
      return;
    }

    try {
      if (selectedPasien.tipe === "Balita") {
        const age = calculateAgeInMonths(selectedPasien.tanggalLahir || examDate, new Date(examDate));
        const data = {
          tanggalPeriksa: examDate,
          usiaBulan: age,
          beratBadan: bb,
          tinggiBadan: tb,
          lingkarKepala: examLK ? parseFloat(examLK) : undefined,
          lingkarLengan: examLiLA ? parseFloat(examLiLA) : undefined,
          statusBbU: examBBU,
          statusTbU: examTBU,
          statusBbTb: examBBTB,
          statusKms: examKms,
          vitaminA: examVitA,
          asiEksklusif: examAsi,
          obatCacing: examCacing,
          statusImunisasi: examImunisasi || undefined,
          petugas: user?.nama || "Kader Posyandu",
        };
        await balitaApi.createPemeriksaan(posyanduId, selectedPasien.id, data);
      } else {
        const sis = parseInt(examSistol);
        const dia = parseInt(examDiastol);
        const gds = parseInt(examGds);
        const lp = parseInt(examLp);

        if (isNaN(sis) || isNaN(dia) || isNaN(gds) || isNaN(lp)) {
          setModalError("Kolom tekanan darah, GDS, dan lingkar perut wajib diisi.");
          return;
        }

        const data = {
          tanggalPeriksa: examDate,
          beratBadan: bb,
          tinggiBadan: tb,
          tekananDarahSistol: sis,
          tekananDarahDiastol: dia,
          gulaDarahSewaktu: gds,
          lingkarPerut: lp,
          kolesterol: examCholesterol ? parseInt(examCholesterol) : undefined,
          asamUrat: examUricAcid ? parseFloat(examUricAcid) : undefined,
          keluhan: examKeluhan || undefined,
          tindakan: examTindakan || undefined,
          petugas: user?.nama || "Kader Posyandu",
        };
        await lansiaApi.createPemeriksaan(posyanduId, selectedPasien.id, data);
      }

      toast.success(`Pemeriksaan untuk ${selectedPasien.nama} berhasil dicatat.`);
      fetchSummary();
      fetchAktivitas();

      // Close & Reset
      setIsOpenModal(false);
      setSelectedPasien(null);
      setModalSearch("");
      setExamBB("");
      setExamTB("");
      setExamLK("");
      setExamSistol("");
      setExamDiastol("");
      setExamGds("");
      setExamLp("");
      setExamLiLA("");
      setExamCholesterol("");
      setExamUricAcid("");
      setExamKeluhan("");
      setExamTindakan("");
      setExamKms("N");
      setExamAsi(false);
      setExamCacing(false);
      setExamImunisasi("");
      setModalWarning("");
    } catch (err: any) {
      const msg = err.message || "Gagal menyimpan pemeriksaan.";
      setModalError(msg);
      toast.error(msg);
    }
  };

  if (isSummaryLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      <PageHelmet
        title="Dashboard Overview"
        description="Ringkasan statistik data balita, lansia, dan grafik status gizi Posyandu."
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-hairline pb-4 sm:pb-6">
        <div>
          <span className="inline-block px-2.5 py-0.5 bg-teal-50 text-saas-primary rounded-pill text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase mb-1">
            Ringkasan Real-Time
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold sm:font-normal text-saas-dark tracking-tight">Dashboard Overview</h2>
          <p className="text-xs sm:text-sm text-saas-muted mt-0.5 sm:mt-1 font-normal">
            Pantau pertumbuhan anak dan kondisi kesehatan lansia secara terpusat.
          </p>
        </div>
      </div>

      {/* 1. 4 Summary KPI Cards Grid */}
      <DashboardKpiGrid
        onNavigate={onNavigate}
        isSummaryLoading={isSummaryLoading}
        isRiwayatLoading={isRiwayatLoading}
        summary={summary}
        perluTindakLanjutBalita={perluTindakLanjutBalita}
        perluFollowUpLansia={perluFollowUpLansia}
      />


      {/* 2. Main Charts */}
      <DashboardCharts
        trenPeriod={trenPeriod}
        setTrenPeriod={setTrenPeriod}
        trenViewMode={trenViewMode}
        setTrenViewMode={setTrenViewMode}
        isTrenGiziLoading={isTrenGiziLoading}
        trenGiziData={trenGiziData}
        isAktivitasLoading={isAktivitasLoading}
        aktivitasData={aktivitasData}
        onOpenDetailAktivitas={handleDetailAktivitas}
      />


      {/* 3. Table & RT/RW Distribution */}
      <DashboardVisitsTable
        onNavigate={onNavigate}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        paginatedKunjungan={paginatedKunjungan}
        filteredKunjungan={filteredKunjungan}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalPages={totalPages}
        isDistribusiLoading={isDistribusiLoading}
        distribusiKehadiran={distribusiKehadiran}
        distribusiTab={distribusiTab}
        setDistribusiTab={setDistribusiTab}
        onOpenDetailDistribusi={() => setShowDetailDistribusi(true)}
      />

      {/* 4. Quick Examination Input Modal */}
      <DashboardExamModal
        isOpen={isOpenModal}
        onClose={() => {
          setIsOpenModal(false);
          setSelectedPasien(null);
          setModalSearch("");
        }}
        selectedPasien={selectedPasien}
        setSelectedPasien={setSelectedPasien}
        modalSearch={modalSearch}
        setModalSearch={setModalSearch}
        filteredPasiens={filteredPasiens}
        handleQuickExamSubmit={handleQuickExamSubmit}
        modalError={modalError}
        setModalError={setModalError}
        modalWarning={modalWarning}
        setModalWarning={setModalWarning}
        examDate={examDate}
        setExamDate={setExamDate}
        examBB={examBB}
        setExamBB={setExamBB}
        examTB={examTB}
        setExamTB={setExamTB}
        examLK={examLK}
        setExamLK={setExamLK}
        examLiLA={examLiLA}
        setExamLiLA={setExamLiLA}
        examImunisasi={examImunisasi}
        setExamImunisasi={setExamImunisasi}
        examVitA={examVitA}
        setExamVitA={setExamVitA}
        examAsi={examAsi}
        setExamAsi={setExamAsi}
        examCacing={examCacing}
        setExamCacing={setExamCacing}
        examBBU={examBBU}
        examTBU={examTBU}
        examBBTB={examBBTB}
        examSistol={examSistol}
        setExamSistol={setExamSistol}
        examDiastol={examDiastol}
        setExamDiastol={setExamDiastol}
        examGds={examGds}
        setExamGds={setExamGds}
        examLp={examLp}
        setExamLp={setExamLp}
        examCholesterol={examCholesterol}
        setExamCholesterol={setExamCholesterol}
        examUricAcid={examUricAcid}
        setExamUricAcid={setExamUricAcid}
        examKeluhan={examKeluhan}
        setExamKeluhan={setExamKeluhan}
        examTindakan={examTindakan}
        setExamTindakan={setExamTindakan}
        checkWarnings={checkWarnings}
        hitungIMT={hitungIMT}
      />

      {/* 5. Detail Aktivitas Modal */}
      <DashboardActivityModal
        isOpen={showDetailAktivitas}
        onClose={() => setShowDetailAktivitas(false)}
        aktivitasTab={aktivitasTab}
        setAktivitasTab={setAktivitasTab}
        aktivitasData={aktivitasData}
        aktivitasSearch={aktivitasSearch}
        setAktivitasSearch={setAktivitasSearch}
        onNavigate={onNavigate}
        onQuickInputForPatient={(p) => {
          const targetPasien = dbPasiens.find((dbP) => dbP.id === p.id) || {
            id: p.id,
            nama: p.nama,
            tipe: p.tipe,
            detailInfo: p.detailInfo,
          };
          setSelectedPasien(targetPasien);
          setShowDetailAktivitas(false);
          setIsOpenModal(true);
        }}
        formatTanggalIndonesia={formatTanggalIndonesia}
      />


      {/* Modal Detail Distribusi Kehadiran */}
      <Modal
        isOpen={showDetailDistribusi}
        onClose={() => setShowDetailDistribusi(false)}
        title="Detail Distribusi Kehadiran per RT/RW"
      >
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-gray-100">
          <span className="text-xs font-bold text-saas-dark">Filter Kategori:</span>
          <select
            value={distribusiTab}
            onChange={(e) => setDistribusiTab(e.target.value as "Semua" | "Balita" | "Lansia")}
            className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-saas-dark hover:bg-gray-100/70 transition-colors focus:outline-none focus:border-saas-primary cursor-pointer"
          >
            <option value="Semua">Semua (Gabungan)</option>
            <option value="Balita">Balita</option>
            <option value="Lansia">Lansia</option>
          </select>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {modalDistribusiList.length > 0 ? (
            modalDistribusiList.map((item, i) => {
              const persentase = isNaN(Number(item.persentase)) ? 0 : Number(item.persentase);
              return (
                <div key={i} className="border border-gray-200 rounded-lg p-3 text-xs">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-bold text-saas-dark">{item.rtRw}</span>
                    <span className="bg-saas-primary/10 text-saas-primary px-2.5 py-0.5 rounded-full text-xs font-bold">
                      {persentase}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                    <div
                      style={{ width: `${persentase}%` }}
                      className="h-full bg-saas-primary rounded-full"
                    ></div>
                  </div>
                  <div className="text-[11px] text-saas-dark text-right font-semibold">
                    {item.hadir} dari {item.total} {item.label} Hadir
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-saas-muted text-center py-4">Belum ada data distribusi kehadiran.</p>
          )}
        </div>
      </Modal>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-saas-dark text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
