'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import PageHelmet from "../../components/PageHelmet";
import { lansiaApi, PeriodePelayanan } from "../../lib/api";
import { SearchIndex } from "../../lib/searchIndex";
import { clientDataCache } from "../../lib/dataCache";
import { formatTanggalInput } from "../../lib/dateUtils";
import { getExamDraft, saveExamDraft, clearExamDraft } from "../../lib/draftStorage";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import { calculateAgeInYears } from "../pelayanan/types";
import { Lansia, PemeriksaanLansia } from "./types";
import LansiaListTable from "./components/LansiaListTable";
import LansiaDetailView from "./components/LansiaDetailView";
import LansiaAddForm from "./components/LansiaAddForm";
import LansiaModals from "./components/LansiaModals";

export type { Lansia, PemeriksaanLansia };

interface LansiaModuleProps {
  posyanduId: string;
  activePeriode?: PeriodePelayanan | null;
  searchQuery?: string;
  selectedId?: string;
  onBack?: () => void;
  backLabel?: string;
}

export default function LansiaModule({ posyanduId, activePeriode, searchQuery = "", selectedId, onBack, backLabel }: LansiaModuleProps) {
  const { user } = useAuth();
  const initialCacheKey = `lansias_${posyanduId}_p1_lim10`;
  const [lansias, setLansias] = useState<Lansia[]>(() => {
    if (typeof window !== "undefined" && posyanduId) {
      const cached = clientDataCache.get<Lansia[]>(initialCacheKey);
      if (cached && cached.length > 0) return cached;
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window !== "undefined" && posyanduId) {
      const cached = clientDataCache.get<Lansia[]>(initialCacheKey);
      if (cached && cached.length > 0) return false;
    }
    return true;
  });
  const [isFetching, setIsFetching] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [view, setView] = useState<"list" | "detail" | "add">("list");
  const [selectedLansiaId, setSelectedLansiaId] = useState<string | null>(selectedId || null);

  // In-Memory Search Index for instant O(1) query lookups by token/prefix
  const lansiaIndexRef = useRef<SearchIndex<Lansia>>(
    new SearchIndex<Lansia>((l) => [
      l.nama,
      l.nik,
      l.noHp,
      l.noBpjs,
      l.rtRw,
      l.alamat,
      l.jenisKelamin === "L" ? "laki-laki l" : "perempuan p",
      l.riwayatHt ? "hipertensi ht darah tinggi" : "",
      l.riwayatDm ? "diabetes melitus dm gula" : "",
    ])
  );
  const lansiasPoolRef = useRef<Map<string, Lansia>>(new Map());

  // Keep in-memory search index updated with all discovered items
  useEffect(() => {
    lansias.forEach((l) => {
      lansiasPoolRef.current.set(l.id, l);
    });
    lansiaIndexRef.current.setSource(Array.from(lansiasPoolRef.current.values()));
  }, [lansias]);

  // Search, Filter & Pagination State
  const [query, setQuery] = useState(searchQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    if (searchQuery !== undefined) {
      setQuery(searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (selectedId) {
      setSelectedLansiaId(selectedId);
      setView("detail");
      if (posyanduId) {
        lansiaApi.getById(posyanduId, selectedId).then((res) => {
          if (res.success && res.data) {
            const l = res.data;
            const mappedSingle: Lansia = {
              ...l,
              tanggalLahir: typeof l.tanggalLahir === "string" ? l.tanggalLahir.split("T")[0] : new Date(l.tanggalLahir).toISOString().split("T")[0],
              pemeriksaan: (l.pemeriksaans ?? []).map((p: any) => ({
                ...p,
                tanggalPeriksa: typeof p.tanggalPeriksa === "string" ? p.tanggalPeriksa.split("T")[0] : new Date(p.tanggalPeriksa).toISOString().split("T")[0],
              })),
            };
            setLansias((prev) => {
              const idx = prev.findIndex((item) => item.id === l.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = mappedSingle;
                return next;
              }
              return [mappedSingle, ...prev];
            });
          }
        }).catch((err) => console.error("Gagal mengambil detail lansia:", err));
      }
    } else {
      setSelectedLansiaId(null);
      setView("list");
    }
  }, [selectedId, posyanduId]);
  const [ageFilter, setAgeFilter] = useState<"semua" | "45-59" | "60-69" | "70+">("semua");
  const [diseaseFilter, setDiseaseFilter] = useState<"semua" | "sehat" | "ht" | "dm">("semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Edit & Delete Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editNama, setEditNama] = useState("");
  const [editNik, setEditNik] = useState("");
  const [editNoHp, setEditNoHp] = useState("");
  const [editBpjs, setEditBpjs] = useState("");
  const [editTglLahir, setEditTglLahir] = useState("");
  const [editJk, setEditJk] = useState<"L" | "P">("L");
  const [editRtRw, setEditRtRw] = useState("");
  const [editAlamat, setEditAlamat] = useState("");
  const [editHt, setEditHt] = useState(false);
  const [editDm, setEditDm] = useState(false);
  const [editKemandirian, setEditKemandirian] = useState<"A" | "B" | "C">("A");
  const [editMental, setEditMental] = useState("");
  const [editError, setEditError] = useState("");

  // Edit & Delete Examination State
  const [isEditExamModalOpen, setIsEditExamModalOpen] = useState(false);
  const [isDeleteExamModalOpen, setIsDeleteExamModalOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [deletingExamId, setDeletingExamId] = useState<string | null>(null);

  const [editExamDate, setEditExamDate] = useState("");
  const [editExamBB, setEditExamBB] = useState("");
  const [editExamTB, setEditExamTB] = useState("");
  const [editExamSistol, setEditExamSistol] = useState("");
  const [editExamDiastol, setEditExamDiastol] = useState("");
  const [editExamGds, setEditExamGds] = useState("");
  const [editExamLp, setEditExamLp] = useState("");
  const [editExamCholesterol, setEditExamCholesterol] = useState("");
  const [editExamUricAcid, setEditExamUricAcid] = useState("");
  const [editExamKeluhan, setEditExamKeluhan] = useState("");
  const [editExamTindakan, setEditExamTindakan] = useState("");
  const [editExamError, setEditExamError] = useState("");

  // Fetch lansia from API
  const fetchLansias = useCallback(() => {
    const kelompokUmurParam =
      ageFilter === "45-59" ? "45-59 tahun (Pra-lansia)" :
      ageFilter === "60-69" ? "60-69 tahun" :
      ageFilter === "70+" ? "≥70 tahun" : undefined;

    const htParam = diseaseFilter === "ht" ? "true" : diseaseFilter === "sehat" ? "false" : undefined;
    const dmParam = diseaseFilter === "dm" ? "true" : diseaseFilter === "sehat" ? "false" : undefined;

    const pageCacheKey = `lansias_${posyanduId}_p${currentPage}_q${debouncedQuery || ""}_a${ageFilter}_d${diseaseFilter}_lim${limit}`;
    const cachedPage = clientDataCache.get<{ data: Lansia[]; total: number; totalPages: number }>(pageCacheKey);

    if (cachedPage) {
      setLansias(cachedPage.data);
      setTotalItems(cachedPage.total);
      setTotalPages(cachedPage.totalPages);
      setIsLoading(false);
      return;
    }

    // Only show full skeleton on initial cold load when there is no data to show
    if (lansias.length === 0) {
      setIsLoading(true);
    } else {
      setIsFetching(true);
    }
    setApiError(null);

    lansiaApi
      .getAll(posyanduId, {
        search: debouncedQuery || undefined,
        kelompokUmur: kelompokUmurParam,
        ht: htParam,
        dm: dmParam,
        page: currentPage,
        limit: limit,
      })
      .then((res) => {
        if (res.success) {
          const mapped: Lansia[] = res.data.map((l) => ({
            ...l,
            tanggalLahir: typeof l.tanggalLahir === "string" ? l.tanggalLahir : new Date(l.tanggalLahir).toISOString().split("T")[0],
            pemeriksaan: (l.pemeriksaans ?? []).map((p) => ({
              ...p,
              tanggalPeriksa: typeof p.tanggalPeriksa === "string" ? p.tanggalPeriksa : new Date(p.tanggalPeriksa).toISOString().split("T")[0],
            })),
          }));
          setLansias(mapped);
          const total = res.meta ? res.meta.total : mapped.length;
          const totPages = res.meta ? res.meta.totalPages : 1;
          setTotalItems(total);
          setTotalPages(totPages);

          clientDataCache.set(pageCacheKey, { data: mapped, total, totalPages: totPages });
          if (currentPage === 1 && !debouncedQuery && ageFilter === "semua" && diseaseFilter === "semua" && limit === 10) {
            clientDataCache.set(initialCacheKey, mapped);
          }
        }
      })
      .catch((err) => setApiError(err.message))
      .finally(() => {
        setIsLoading(false);
        setIsFetching(false);
      });
  }, [posyanduId, debouncedQuery, ageFilter, diseaseFilter, currentPage, limit, lansias.length, initialCacheKey]);

  useEffect(() => {
    fetchLansias();
  }, [fetchLansias]);

  // Filter List Lansia (Search by Index + Client-side age & disease filters)
  const filteredLansias = useMemo(() => {
    const source = query && query.trim()
      ? lansiaIndexRef.current.search(query)
      : lansias;

    return source.filter((l) => {
      const ageYears = l.usiaTahun ?? calculateAgeInYears(l.tanggalLahir);
      let matchesAge = true;
      if (ageFilter === "45-59") matchesAge = ageYears >= 45 && ageYears <= 59;
      else if (ageFilter === "60-69") matchesAge = ageYears >= 60 && ageYears <= 69;
      else if (ageFilter === "70+") matchesAge = ageYears >= 70;
      let matchesDisease = true;
      if (diseaseFilter === "ht") matchesDisease = Boolean(l.riwayatHt);
      else if (diseaseFilter === "dm") matchesDisease = Boolean(l.riwayatDm);
      else if (diseaseFilter === "sehat") matchesDisease = !l.riwayatHt && !l.riwayatDm;
      return matchesAge && matchesDisease;
    });
  }, [query, lansias, ageFilter, diseaseFilter]);

  // Form State Tambah Lansia
  const [formNama, setFormNama] = useState("");
  const [formNik, setFormNik] = useState("");
  const [formNoHp, setFormNoHp] = useState("");
  const [formBpjs, setFormBpjs] = useState("");
  const [formTglLahir, setFormTglLahir] = useState("1960-01-01");
  const [formJk, setFormJk] = useState<"L" | "P">("L");
  const [formRtRw, setFormRtRw] = useState("");
  const [formAlamat, setFormAlamat] = useState("Desa Karanggayam");
  const [formHt, setFormHt] = useState(false);
  const [formDm, setFormDm] = useState(false);
  const [formKemandirian, setFormKemandirian] = useState<"A" | "B" | "C">("A");
  const [formMental, setFormMental] = useState("");
  const [formError, setFormError] = useState("");

  // Form State Tambah Pemeriksaan
  const initialDate = activePeriode?.tanggal 
    ? new Date(activePeriode.tanggal).toISOString().slice(0, 10) 
    : new Date().toISOString().slice(0, 10);
  const [examDate, setExamDate] = useState(initialDate);

  useEffect(() => {
    if (activePeriode?.tanggal) {
      setExamDate(new Date(activePeriode.tanggal).toISOString().slice(0, 10));
    }
  }, [activePeriode]);

  const [examBB, setExamBB] = useState("");
  const [examTB, setExamTB] = useState("");
  const [examSistol, setExamSistol] = useState("");
  const [examDiastol, setExamDiastol] = useState("");
  const [examGds, setExamGds] = useState("");
  const [examLp, setExamLp] = useState("");
  const [examCholesterol, setExamCholesterol] = useState("");
  const [examUricAcid, setExamUricAcid] = useState("");
  const [examKeluhan, setExamKeluhan] = useState("");
  const [examTindakan, setExamTindakan] = useState("");
  const [examWarning, setExamWarning] = useState("");
  const [examError, setExamError] = useState("");
  const activeLansia = lansias.find((l) => l.id === selectedLansiaId);

  const targetMonth = activePeriode ? activePeriode.bulan : (new Date().getMonth() + 1);
  const targetYear = activePeriode ? activePeriode.tahun : new Date().getFullYear();

  const currentPeriodExam = (activeLansia?.pemeriksaan || []).find((exam: any) => {
    const d = new Date(exam.tanggalPeriksa);
    return (d.getMonth() + 1) === targetMonth && d.getFullYear() === targetYear;
  });

  const loadedLansiaIdRef = useRef<string | null>(null);

  // Auto-save form draft for selected lansia ke shared storage
  useEffect(() => {
    if (!selectedLansiaId) return;
    // Mencegah data lansia sebelumnya menimpa lansia yang baru dipilih
    if (loadedLansiaIdRef.current !== selectedLansiaId) return;

    saveExamDraft(posyanduId, selectedLansiaId, {
      examDate,
      examBB,
      examTB,
      examSistol,
      examDiastol,
      examGds,
      examLp,
      examCholesterol,
      examUricAcid,
      examKeluhan,
      examTindakan,
    });
  }, [
    posyanduId,
    selectedLansiaId,
    examDate,
    examBB,
    examTB,
    examSistol,
    examDiastol,
    examGds,
    examLp,
    examCholesterol,
    examUricAcid,
    examKeluhan,
    examTindakan,
  ]);

  // Populate Edit Lansia
  const openEditModal = (l: Lansia) => {
    setEditNama(l.nama);
    setEditNik(l.nik);
    setEditNoHp(l.noHp || "");
    setEditBpjs(l.noBpjs || "");
    setEditTglLahir(formatTanggalInput(l.tanggalLahir));
    setEditJk(l.jenisKelamin);
    setEditRtRw(l.rtRw);
    setEditAlamat(l.alamat);
    setEditHt(l.riwayatHt);
    setEditDm(l.riwayatDm);
    setEditKemandirian(l.tingkatKemandirian);
    setEditMental(l.gangguanMentalEmosional || "");
    setEditError("");
    setIsEditModalOpen(true);
  };

  // Handle Edit Submit
  const handleEditLansiaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");
    if (!selectedLansiaId) return;

    if (!editNama.trim() || !editNik.trim() || !editRtRw.trim() || !editAlamat.trim()) {
      setEditError("Mohon isi nama lengkap, NIK, RT/RW, dan alamat.");
      return;
    }

    setIsSaving(true);
    try {
      await lansiaApi.update(posyanduId, selectedLansiaId, {
        nama: editNama,
        nik: editNik,
        noHp: editNoHp || undefined,
        noBpjs: editBpjs || undefined,
        tanggalLahir: editTglLahir,
        jenisKelamin: editJk,
        rtRw: editRtRw,
        alamat: editAlamat,
        riwayatHt: editHt,
        riwayatDm: editDm,
        tingkatKemandirian: editKemandirian,
        gangguanMentalEmosional: editMental || undefined,
      });
      clientDataCache.invalidate("lansias_" + posyanduId);
      fetchLansias();
      setIsEditModalOpen(false);
      toast.success("Profil lansia berhasil diperbarui!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengedit data lansia.";
      setEditError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete Lansia
  const handleDeleteLansia = async () => {
    if (!selectedLansiaId) return;
    setIsSaving(true);
    try {
      await lansiaApi.delete(posyanduId, selectedLansiaId);
      clientDataCache.invalidate("lansias_" + posyanduId);
      fetchLansias();
      setIsDeleteModalOpen(false);
      setSelectedLansiaId(null);
      setView("list");
      toast.success("Data lansia berhasil dihapus!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus data lansia.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Open Edit Exam Modal
  const openEditExamModal = (exam: PemeriksaanLansia) => {
    setEditingExamId(exam.id);
    setEditExamDate(formatTanggalInput(exam.tanggalPeriksa));
    setEditExamBB(String(exam.beratBadan));
    setEditExamTB(String(exam.tinggiBadan));
    setEditExamSistol(String(exam.tekananDarahSistol));
    setEditExamDiastol(String(exam.tekananDarahDiastol));
    setEditExamGds(String(exam.gulaDarahSewaktu));
    setEditExamLp(String(exam.lingkarPerut));
    setEditExamCholesterol(exam.kolesterol ? String(exam.kolesterol) : "");
    setEditExamUricAcid(exam.asamUrat ? String(exam.asamUrat) : "");
    setEditExamKeluhan(exam.keluhan || "");
    setEditExamTindakan(exam.tindakan || "");
    setEditExamError("");
    setIsEditExamModalOpen(true);
  };

  // Open Delete Exam Modal
  const openDeleteExamModal = (examId: string) => {
    setDeletingExamId(examId);
    setIsDeleteExamModalOpen(true);
  };

  // Handle Edit Exam Submit
  const handleEditExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditExamError("");

    const bb = parseFloat(editExamBB);
    const tb = parseFloat(editExamTB);
    const sistol = parseInt(editExamSistol);
    const diastol = parseInt(editExamDiastol);
    const gds = parseFloat(editExamGds);
    const lp = parseFloat(editExamLp);
    const kol = editExamCholesterol ? parseFloat(editExamCholesterol) : undefined;
    const urat = editExamUricAcid ? parseFloat(editExamUricAcid) : undefined;

    if (isNaN(bb) || bb <= 0 || isNaN(tb) || tb <= 0 || isNaN(sistol) || isNaN(diastol) || isNaN(gds) || isNaN(lp)) {
      setEditExamError("Mohon isi semua data pemeriksaan dengan angka positif yang valid.");
      return;
    }

    if (!activeLansia || !editingExamId) return;

    setIsSaving(true);
    try {
      await lansiaApi.updatePemeriksaan(posyanduId, activeLansia.id, editingExamId, {
        tanggalPeriksa: editExamDate,
        beratBadan: bb,
        tinggiBadan: tb,
        tekananDarahSistol: sistol,
        tekananDarahDiastol: diastol,
        gulaDarahSewaktu: gds,
        lingkarPerut: lp,
        kolesterol: kol,
        asamUrat: urat,
        keluhan: editExamKeluhan || undefined,
        tindakan: editExamTindakan || undefined,
      } as any);

      const res = await lansiaApi.getById(posyanduId, activeLansia.id);
      if (res.success) {
        const updated: Lansia = {
          ...res.data,
          tanggalLahir: formatTanggalInput(res.data.tanggalLahir),
          pemeriksaan: (res.data.pemeriksaans ?? []).map((p) => ({
            ...p,
            tanggalPeriksa: formatTanggalInput(p.tanggalPeriksa),
          })),
        };
        setLansias((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      }
      setIsEditExamModalOpen(false);
      toast.success("Riwayat pemeriksaan lansia berhasil diperbarui!");
    } catch {
      setLansias((prev) =>
        prev.map((l) => {
          if (l.id !== activeLansia.id) return l;
          return {
            ...l,
            pemeriksaan: l.pemeriksaan.map((p) => {
              if (p.id !== editingExamId) return p;
              return {
                ...p,
                tanggalPeriksa: editExamDate,
                beratBadan: bb,
                tinggiBadan: tb,
                tekananDarahSistol: sistol,
                tekananDarahDiastol: diastol,
                gulaDarahSewaktu: gds,
                lingkarPerut: lp,
                kolesterol: kol,
                asamUrat: urat,
                keluhan: editExamKeluhan,
                tindakan: editExamTindakan,
              };
            }),
          };
        })
      );
      setIsEditExamModalOpen(false);
      toast.success("Riwayat pemeriksaan lansia berhasil diperbarui!");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete Exam Submit
  const handleDeleteExamSubmit = async () => {
    if (!activeLansia || !deletingExamId) return;
    setIsSaving(true);
    try {
      await lansiaApi.deletePemeriksaan(posyanduId, activeLansia.id, deletingExamId);
      const res = await lansiaApi.getById(posyanduId, activeLansia.id);
      if (res.success) {
        const updated: Lansia = {
          ...res.data,
          tanggalLahir: formatTanggalInput(res.data.tanggalLahir),
          pemeriksaan: (res.data.pemeriksaans ?? []).map((p) => ({
            ...p,
            tanggalPeriksa: formatTanggalInput(p.tanggalPeriksa),
          })),
        };
        setLansias((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      }
      setIsDeleteExamModalOpen(false);
      toast.success("Riwayat pemeriksaan lansia berhasil dihapus!");
    } catch {
      setLansias((prev) =>
        prev.map((l) => {
          if (l.id !== activeLansia.id) return l;
          return {
            ...l,
            pemeriksaan: l.pemeriksaan.filter((p) => p.id !== deletingExamId),
          };
        })
      );
      setIsDeleteExamModalOpen(false);
      toast.success("Riwayat pemeriksaan lansia berhasil dihapus!");
    } finally {
      setIsSaving(false);
    }
  };

  // Handler Submit Tambah Lansia (via API)
  const handleAddLansiaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formNama.trim() || !formNik.trim() || !formRtRw.trim() || !formAlamat.trim()) {
      setFormError("Mohon isi nama lengkap, NIK, RT/RW, dan alamat.");
      return;
    }

    if (formNik.length !== 16) {
      setFormError("NIK harus tepat 16 digit angka.");
      return;
    }

    setIsSaving(true);
    try {
      await lansiaApi.create(posyanduId, {
        nama: formNama,
        nik: formNik,
        noHp: formNoHp || undefined,
        noBpjs: formBpjs || undefined,
        tanggalLahir: formTglLahir,
        jenisKelamin: formJk,
        rtRw: formRtRw,
        alamat: formAlamat,
        riwayatHt: formHt,
        riwayatDm: formDm,
        tingkatKemandirian: formKemandirian,
        gangguanMentalEmosional: formMental || undefined,
      });
      clientDataCache.invalidate("lansias_" + posyanduId);
      fetchLansias();
      setFormNama("");
      setFormNik("");
      setFormNoHp("");
      setFormBpjs("");
      setFormTglLahir("1960-01-01");
      setFormJk("L");
      setFormRtRw("");
      setFormAlamat("Desa Karanggayam");
      setFormHt(false);
      setFormDm(false);
      setFormKemandirian("A");
      setFormMental("");
      setView("list");
      toast.success("Data lansia baru berhasil ditambahkan!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan data.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Check input values warning
  const handleExamInputCheck = (sistolVal: string, gdsVal: string) => {
    setExamWarning("");
    const sistol = parseInt(sistolVal);
    const gds = parseInt(gdsVal);

    if (sistol > 200) {
      setExamWarning("Tekanan darah sistol di atas 200 mmHg sangat tinggi. Mohon cek kembali inputan atau rujuk lansia ke puskesmas.");
    } else if (gds > 300) {
      setExamWarning("Kadar Gula Darah (GDS) di atas 300 mg/dL sangat tinggi. Mohon cek kembali inputan Ibu.");
    }
  };

  // Handler Submit Tambah Pemeriksaan (via API)
  const handleAddExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setExamError("");

    const bb = parseFloat(examBB);
    const tb = parseFloat(examTB);
    const sistol = parseInt(examSistol);
    const diastol = parseInt(examDiastol);
    const gds = parseFloat(examGds);
    const lp = parseFloat(examLp);
    const kol = examCholesterol ? parseFloat(examCholesterol) : undefined;
    const urat = examUricAcid ? parseFloat(examUricAcid) : undefined;

    if (isNaN(bb) || bb <= 0 || isNaN(tb) || tb <= 0 || isNaN(sistol) || isNaN(diastol) || isNaN(gds) || isNaN(lp)) {
      setExamError("Mohon isi semua data pemeriksaan dengan angka positif yang valid.");
      return;
    }

    if (!activeLansia) return;

    setIsSaving(true);
    try {
      await lansiaApi.createPemeriksaan(posyanduId, activeLansia.id, {
        tanggalPeriksa: examDate,
        beratBadan: bb,
        tinggiBadan: tb,
        tekananDarahSistol: sistol,
        tekananDarahDiastol: diastol,
        gulaDarahSewaktu: gds,
        lingkarPerut: lp,
        kolesterol: kol,
        asamUrat: urat,
        keluhan: examKeluhan || undefined,
        tindakan: examTindakan || undefined,
        petugas: user?.nama || "Kader Posyandu",
      } as any);
      // Refresh lansia detail
      const res = await lansiaApi.getById(posyanduId, activeLansia.id);
      if (res.success) {
        const updated: Lansia = {
          ...res.data,
          tanggalLahir: new Date(res.data.tanggalLahir).toISOString().split("T")[0],
          pemeriksaan: (res.data.pemeriksaans ?? []).map((p) => ({
            ...p,
            tanggalPeriksa: new Date(p.tanggalPeriksa).toISOString().split("T")[0],
          })),
        };
        setLansias((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      }
      clearExamDraft(posyanduId, activeLansia.id);
      setExamWarning("");
      toast.success(currentPeriodExam ? "Hasil pemeriksaan lansia bulan ini berhasil diperbarui!" : "Hasil pemeriksaan lansia berhasil disimpan!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan pemeriksaan.";
      setExamError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Pre-fill form pemeriksaan jika lansia sudah memiliki data pemeriksaan pada periode ini atau draft tersimpan
  useEffect(() => {
    if (!activeLansia) {
      loadedLansiaIdRef.current = null;
      setExamBB(""); setExamTB(""); setExamSistol(""); setExamDiastol("");
      setExamGds(""); setExamLp(""); setExamCholesterol(""); setExamUricAcid("");
      setExamKeluhan(""); setExamTindakan(""); setExamWarning("");
      return;
    }

    // 1. Prioritaskan data resmi dari database jika lansia sudah diperiksa pada periode ini
    if (currentPeriodExam) {
      clearExamDraft(posyanduId, activeLansia.id);
      if (currentPeriodExam.tanggalPeriksa) {
        setExamDate(formatTanggalInput(currentPeriodExam.tanggalPeriksa));
      }
      setExamBB(currentPeriodExam.beratBadan ? String(currentPeriodExam.beratBadan) : "");
      setExamTB(currentPeriodExam.tinggiBadan ? String(currentPeriodExam.tinggiBadan) : "");
      setExamSistol(currentPeriodExam.tekananDarahSistol ? String(currentPeriodExam.tekananDarahSistol) : "");
      setExamDiastol(currentPeriodExam.tekananDarahDiastol ? String(currentPeriodExam.tekananDarahDiastol) : "");
      setExamGds(currentPeriodExam.gulaDarahSewaktu ? String(currentPeriodExam.gulaDarahSewaktu) : "");
      setExamLp(currentPeriodExam.lingkarPerut ? String(currentPeriodExam.lingkarPerut) : "");
      setExamCholesterol(currentPeriodExam.kolesterol ? String(currentPeriodExam.kolesterol) : "");
      setExamUricAcid(currentPeriodExam.asamUrat ? String(currentPeriodExam.asamUrat) : "");
      setExamKeluhan(currentPeriodExam.keluhan || "");
      setExamTindakan(currentPeriodExam.tindakan || "");
      loadedLansiaIdRef.current = activeLansia.id;
      return;
    }

    // 2. Jika belum diperiksa, cek draft tersimpan khusus lansia ini
    const draft = getExamDraft(posyanduId, activeLansia.id);
    const draftDate = draft?.examDate ? new Date(draft.examDate) : null;
    const isDraftForCurrentPeriod = draftDate
      ? (draftDate.getMonth() + 1) === targetMonth && draftDate.getFullYear() === targetYear
      : true;

    const hasDraftContent = Boolean(
      isDraftForCurrentPeriod &&
      draft && (
        draft.examBB ||
        draft.examTB ||
        draft.examSistol ||
        draft.examDiastol ||
        draft.examGds ||
        draft.examLp ||
        draft.examCholesterol ||
        draft.examUricAcid ||
        draft.examKeluhan ||
        draft.examTindakan
      )
    );

    if (hasDraftContent && draft) {
      if (draft.examDate) setExamDate(draft.examDate);
      setExamBB(draft.examBB ?? "");
      setExamTB(draft.examTB ?? "");
      setExamSistol(draft.examSistol ?? "");
      setExamDiastol(draft.examDiastol ?? "");
      setExamGds(draft.examGds ?? "");
      setExamLp(draft.examLp ?? "");
      setExamCholesterol(draft.examCholesterol ?? "");
      setExamUricAcid(draft.examUricAcid ?? "");
      setExamKeluhan(draft.examKeluhan ?? "");
      setExamTindakan(draft.examTindakan ?? "");
      loadedLansiaIdRef.current = activeLansia.id;
      return;
    }

    // 3. Periode baru belum ada data periksa -> form KOSONG
    const defaultDate = activePeriode?.tanggal 
      ? new Date(activePeriode.tanggal).toISOString().slice(0, 10) 
      : new Date().toISOString().slice(0, 10);
    setExamDate(defaultDate);
    setExamBB(""); setExamTB(""); setExamSistol(""); setExamDiastol("");
    setExamGds(""); setExamLp(""); setExamCholesterol(""); setExamUricAcid("");
    setExamKeluhan(""); setExamTindakan(""); setExamWarning("");
    loadedLansiaIdRef.current = activeLansia.id;
  }, [activeLansia, activePeriode, currentPeriodExam, posyanduId, targetMonth, targetYear]);

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      <PageHelmet
        title={activeLansia ? `Lansia: ${activeLansia.nama}` : "Manajemen Data Lansia"}
        description="Pengelolaan data lansia, riwayat penyakit Hipertensi/Diabetes, dan tingkat kemandirian."
      />
      {/* 1. VIEW: LIST LANSIA */}
      {view === "list" && (
        <LansiaListTable
          lansias={lansias}
          filteredLansias={filteredLansias}
          isLoading={isLoading}
          query={query}
          setQuery={setQuery}
          diseaseFilter={diseaseFilter}
          setDiseaseFilter={setDiseaseFilter}
          ageFilter={ageFilter}
          setAgeFilter={setAgeFilter}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          limit={limit}
          setLimit={setLimit}
          onAddNew={() => setView("add")}
          onSelectDetail={(id) => {
            setSelectedLansiaId(id);
            setView("detail");
          }}
        />
      )}

      {/* 2. VIEW: DETAIL LANSIA & RIWAYAT PEMERIKSAAN */}
      {view === "detail" && activeLansia && (
        <LansiaDetailView
          activeLansia={activeLansia}
          onBack={() => {
            setView("list");
            setSelectedLansiaId(null);
            if (onBack) onBack();
          }}
          backLabel={backLabel}
          onEditProfile={openEditModal}
          onDeleteProfile={() => setIsDeleteModalOpen(true)}
          currentPeriodExam={currentPeriodExam}
          examDate={examDate}
          setExamDate={setExamDate}
          examBB={examBB}
          setExamBB={setExamBB}
          examTB={examTB}
          setExamTB={setExamTB}
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
          examError={examError}
          examWarning={examWarning}
          handleExamInputCheck={handleExamInputCheck}
          handleAddExamSubmit={handleAddExamSubmit}
          openEditExamModal={openEditExamModal}
          openDeleteExamModal={openDeleteExamModal}
        />
      )}

      {/* 3. VIEW: ADD LANSIA */}
      {view === "add" && (
        <LansiaAddForm
          onBack={() => setView("list")}
          formNama={formNama}
          setFormNama={setFormNama}
          formNik={formNik}
          setFormNik={setFormNik}
          formNoHp={formNoHp}
          setFormNoHp={setFormNoHp}
          formBpjs={formBpjs}
          setFormBpjs={setFormBpjs}
          formTglLahir={formTglLahir}
          setFormTglLahir={setFormTglLahir}
          formJk={formJk}
          setFormJk={setFormJk}
          formRtRw={formRtRw}
          setFormRtRw={setFormRtRw}
          formKemandirian={formKemandirian}
          setFormKemandirian={setFormKemandirian}
          formHt={formHt}
          setFormHt={setFormHt}
          formDm={formDm}
          setFormDm={setFormDm}
          formMental={formMental}
          setFormMental={setFormMental}
          formAlamat={formAlamat}
          setFormAlamat={setFormAlamat}
          formError={formError}
          onSubmit={handleAddLansiaSubmit}
        />
      )}

      {/* MODALS */}
      <LansiaModals
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        editNama={editNama}
        setEditNama={setEditNama}
        editNik={editNik}
        setEditNik={setEditNik}
        editNoHp={editNoHp}
        setEditNoHp={setEditNoHp}
        editBpjs={editBpjs}
        setEditBpjs={setEditBpjs}
        editTglLahir={editTglLahir}
        setEditTglLahir={setEditTglLahir}
        editJk={editJk}
        setEditJk={setEditJk}
        editRtRw={editRtRw}
        setEditRtRw={setEditRtRw}
        editKemandirian={editKemandirian}
        setEditKemandirian={setEditKemandirian}
        editHt={editHt}
        setEditHt={setEditHt}
        editDm={editDm}
        setEditDm={setEditDm}
        editAlamat={editAlamat}
        setEditAlamat={setEditAlamat}
        editError={editError}
        isSaving={isSaving}
        onEditLansiaSubmit={handleEditLansiaSubmit}
        isDeleteModalOpen={isDeleteModalOpen}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
        activeLansia={activeLansia || null}
        onDeleteLansia={handleDeleteLansia}
        isEditExamModalOpen={isEditExamModalOpen}
        setIsEditExamModalOpen={setIsEditExamModalOpen}
        editExamError={editExamError}
        editExamDate={editExamDate}
        setEditExamDate={setEditExamDate}
        editExamBB={editExamBB}
        setEditExamBB={setEditExamBB}
        editExamTB={editExamTB}
        setEditExamTB={setEditExamTB}
        editExamSistol={editExamSistol}
        setEditExamSistol={setEditExamSistol}
        editExamDiastol={editExamDiastol}
        setEditExamDiastol={setEditExamDiastol}
        editExamGds={editExamGds}
        setEditExamGds={setEditExamGds}
        editExamLp={editExamLp}
        setEditExamLp={setEditExamLp}
        editExamCholesterol={editExamCholesterol}
        setEditExamCholesterol={setEditExamCholesterol}
        editExamUricAcid={editExamUricAcid}
        setEditExamUricAcid={setEditExamUricAcid}
        editExamKeluhan={editExamKeluhan}
        setEditExamKeluhan={setEditExamKeluhan}
        editExamTindakan={editExamTindakan}
        setEditExamTindakan={setEditExamTindakan}
        onEditExamSubmit={handleEditExamSubmit}
        isDeleteExamModalOpen={isDeleteExamModalOpen}
        setIsDeleteExamModalOpen={setIsDeleteExamModalOpen}
        onDeleteExamSubmit={handleDeleteExamSubmit}
      />
    </div>
  );
}
