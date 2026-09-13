"use client";

import React from "react";
import {
  ArrowLeft,
  Calendar,
  Phone,
  ClipboardList,
  ShieldCheck,
  BrainCircuit,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Plus,
  TrendingUp,
} from "lucide-react";
import LansiaIcon from "@/components/LansiaIcon";
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
import { formatTanggalIndonesia } from "@/lib/dateUtils";
import { hitungIMT } from "@/lib/zScoreCalculator";
import { calculateAgeInYears } from "@/features/pelayanan/types";
import { Lansia, PemeriksaanLansia } from "../types";

export interface LansiaDetailViewProps {
  activeLansia: Lansia;
  onBack: () => void;
  backLabel?: string;
  onEditProfile: (lansia: Lansia) => void;
  onDeleteProfile: () => void;
  currentPeriodExam?: PemeriksaanLansia | null;
  examDate: string;
  setExamDate: (d: string) => void;
  examBB: string;
  setExamBB: (v: string) => void;
  examTB: string;
  setExamTB: (v: string) => void;
  examSistol: string;
  setExamSistol: (v: string) => void;
  examDiastol: string;
  setExamDiastol: (v: string) => void;
  examGds: string;
  setExamGds: (v: string) => void;
  examLp: string;
  setExamLp: (v: string) => void;
  examCholesterol: string;
  setExamCholesterol: (v: string) => void;
  examUricAcid: string;
  setExamUricAcid: (v: string) => void;
  examKeluhan: string;
  setExamKeluhan: (v: string) => void;
  examTindakan: string;
  setExamTindakan: (v: string) => void;
  examError: string;
  examWarning: string;
  handleExamInputCheck: (sistolVal: string, gdsVal: string) => void;
  handleAddExamSubmit: (e: React.FormEvent) => void;
  openEditExamModal: (exam: PemeriksaanLansia) => void;
  openDeleteExamModal: (examId: string) => void;
}

export default function LansiaDetailView({
  activeLansia,
  onBack,
  backLabel,
  onEditProfile,
  onDeleteProfile,
  currentPeriodExam,
  examDate,
  setExamDate,
  examBB,
  setExamBB,
  examTB,
  setExamTB,
  examSistol,
  setExamSistol,
  examDiastol,
  setExamDiastol,
  examGds,
  setExamGds,
  examLp,
  setExamLp,
  examCholesterol,
  setExamCholesterol,
  examUricAcid,
  setExamUricAcid,
  examKeluhan,
  setExamKeluhan,
  examTindakan,
  setExamTindakan,
  examError,
  examWarning,
  handleExamInputCheck,
  handleAddExamSubmit,
  openEditExamModal,
  openDeleteExamModal,
}: LansiaDetailViewProps) {
  return (
    <div className="space-y-8 min-w-0 max-w-full">
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-saas-muted hover:text-saas-dark transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> {backLabel || "Kembali ke Daftar Lansia"}
      </button>

      {/* Profile & Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profil Lansia Card */}
        <div className="bg-white rounded-card shadow-soft-card border border-hairline p-6 flex flex-col justify-between h-fit space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <LansiaIcon className="w-6 h-6" gender={activeLansia.jenisKelamin} />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onEditProfile(activeLansia)}
                  className="px-3 py-1.5 border border-hairline text-saas-dark rounded-pill text-xs font-semibold hover:bg-surface-soft transition-all cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={onDeleteProfile}
                  className="px-3 py-1.5 border border-red-200 text-trend-dangerText rounded-pill text-xs font-semibold hover:bg-red-50 transition-all cursor-pointer"
                >
                  Hapus
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-saas-dark tracking-tight">{activeLansia.nama}</h3>
            <p className="text-xs text-saas-muted font-mono mt-1">NIK: {activeLansia.nik}</p>
            {activeLansia.noBpjs && (
              <p className="text-xs text-saas-muted font-mono mt-0.5">BPJS: {activeLansia.noBpjs}</p>
            )}
            {activeLansia.noHp && (
              <div className="mt-2">
                <a
                  href={`https://wa.me/${activeLansia.noHp.replace(/\D/g, "").startsWith("0") ? "62" + activeLansia.noHp.replace(/\D/g, "").slice(1) : activeLansia.noHp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg text-xs transition-colors border border-emerald-200"
                >
                  <Phone className="w-3.5 h-3.5" /> WA: {activeLansia.noHp}
                </a>
              </div>
            )}
          </div>

          {/* Detail Items */}
          <div className="space-y-4 border-t border-gray-50 pt-4 text-sm font-semibold">
            <div className="flex items-start gap-3">
              <Calendar className="w-4.5 h-4.5 text-saas-muted mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-saas-muted">Tanggal Lahir &amp; Usia</p>
                <p className="text-saas-dark text-xs mt-0.5">
                  {formatTanggalIndonesia(activeLansia.tanggalLahir)} ({calculateAgeInYears(activeLansia.tanggalLahir)} Tahun)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4.5 h-4.5 text-saas-muted mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-saas-muted">No. HP / WhatsApp</p>
                {activeLansia.noHp ? (
                  <a
                    href={`https://wa.me/${activeLansia.noHp.replace(/\D/g, "").startsWith("0") ? "62" + activeLansia.noHp.replace(/\D/g, "").slice(1) : activeLansia.noHp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:text-emerald-800 text-xs mt-0.5 font-bold inline-flex items-center gap-1 hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {activeLansia.noHp} (Hubungi WA)
                  </a>
                ) : (
                  <p className="text-saas-dark text-xs mt-0.5 text-saas-muted font-medium">Belum ada nomor HP</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ClipboardList className="w-4.5 h-4.5 text-saas-muted mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-saas-muted">Status Kemandirian</p>
                <p className="text-saas-dark text-xs mt-0.5">
                  Kategori {activeLansia.tingkatKemandirian} — {
                    activeLansia.tingkatKemandirian === "A" ? "Mandiri Sepenuhnya" :
                    activeLansia.tingkatKemandirian === "B" ? "Bantuan Sebagian" : "Ketergantungan Total"
                  }
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="w-4.5 h-4.5 text-saas-muted mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-saas-muted">Riwayat Penyakit</p>
                <p className="text-saas-dark text-xs mt-0.5">
                  HT: {activeLansia.riwayatHt ? "Ada (Hipertensi)" : "Tidak ada"} | DM: {activeLansia.riwayatDm ? "Ada (Diabetes)" : "Tidak ada"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <BrainCircuit className="w-4.5 h-4.5 text-saas-muted mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-saas-muted">Skrining Mental Emosional</p>
                <p className="text-saas-dark text-xs mt-0.5 leading-snug font-medium italic">
                  "{activeLansia.gangguanMentalEmosional || "Tidak ada catatan khusus"}"
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4.5 h-4.5 text-saas-muted mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-saas-muted">Alamat Rumah</p>
                <p className="text-saas-dark text-xs mt-0.5 leading-snug">
                  {activeLansia.rtRw}, {activeLansia.alamat}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Input Pemeriksaan Baru */}
        <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-base text-saas-dark">Input Pemeriksaan Bulanan Lansia</h3>
              <p className="text-xs text-saas-muted mt-0.5">Masukkan data pengukuran fisik dan skrining gula darah.</p>
            </div>
            {currentPeriodExam ? (
              <span className="self-start sm:self-auto text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Sudah Diisi Periode Ini
              </span>
            ) : (
              <span className="self-start sm:self-auto text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Belum Diisi Periode Ini
              </span>
            )}
          </div>

          <form onSubmit={handleAddExamSubmit} className="space-y-4">
            {examError && (
              <div className="p-3 bg-red-50 text-trend-dangerText border border-red-100 rounded-lg text-xs font-bold flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {examError}
              </div>
            )}
            {examWarning && (
              <div className="p-3 bg-yellow-50 text-yellow-700 border border-yellow-100 rounded-lg text-xs font-semibold flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {examWarning}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Tanggal */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-saas-muted">Tanggal Periksa</label>
                <input
                  type="date"
                  value={examDate}
                  onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50 cursor-pointer"
                />
              </div>

              {/* Berat Badan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-saas-muted">Berat Badan (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="Contoh: 60"
                  value={examBB}
                  onKeyDown={(e) => { if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault(); }}
                  onChange={(e) => setExamBB(e.target.value.replace(/-/g, ""))}
                  className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                />
              </div>

              {/* Tinggi Badan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-saas-muted">Tinggi Badan (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="Contoh: 160"
                  value={examTB}
                  onKeyDown={(e) => { if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault(); }}
                  onChange={(e) => setExamTB(e.target.value.replace(/-/g, ""))}
                  className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                />
              </div>

              {/* IMT - Calculated Live */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-teal-600">IMT (Otomatis)</label>
                <input
                  type="text"
                  disabled
                  value={
                    parseFloat(examBB) > 0 && parseFloat(examTB) > 0
                      ? hitungIMT(parseFloat(examBB), parseFloat(examTB))
                      : "-"
                  }
                  className="w-full p-2.5 bg-teal-50/50 border border-teal-150 rounded-input text-xs font-bold text-teal-700 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 border-t border-gray-50 pt-4">
              {/* TD Sistol */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-saas-muted">Sistol (mmHg)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="TD atas, cth: 130"
                  value={examSistol}
                  onKeyDown={(e) => { if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault(); }}
                  onChange={(e) => {
                    const val = e.target.value.replace(/-/g, "");
                    setExamSistol(val);
                    handleExamInputCheck(val, examGds);
                  }}
                  className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                />
              </div>

              {/* TD Diastol */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-saas-muted">Diastol (mmHg)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="TD bawah, cth: 85"
                  value={examDiastol}
                  onKeyDown={(e) => { if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault(); }}
                  onChange={(e) => setExamDiastol(e.target.value.replace(/-/g, ""))}
                  className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                />
              </div>

              {/* Gula Darah Sewaktu */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-saas-muted">GDS (mg/dL)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Contoh: 120"
                  value={examGds}
                  onKeyDown={(e) => { if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault(); }}
                  onChange={(e) => {
                    const val = e.target.value.replace(/-/g, "");
                    setExamGds(val);
                    handleExamInputCheck(examSistol, val);
                  }}
                  className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                />
              </div>

              {/* Lingkar Perut */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-saas-muted">Lingkar Perut (cm)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Contoh: 90"
                  value={examLp}
                  onKeyDown={(e) => { if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault(); }}
                  onChange={(e) => setExamLp(e.target.value.replace(/-/g, ""))}
                  className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-50 pt-4">
              {/* Kolesterol */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-saas-muted">Kolesterol (mg/dL - opsional)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="cth: 180"
                  value={examCholesterol}
                  onKeyDown={(e) => { if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault(); }}
                  onChange={(e) => setExamCholesterol(e.target.value.replace(/-/g, ""))}
                  className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                />
              </div>

              {/* Asam Urat */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-saas-muted">Asam Urat (mg/dL - opsional)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="cth: 6.2"
                  value={examUricAcid}
                  onKeyDown={(e) => { if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault(); }}
                  onChange={(e) => setExamUricAcid(e.target.value.replace(/-/g, ""))}
                  className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-50 pt-4">
              {/* Keluhan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-saas-muted">Keluhan / Riwayat Penyakit Saat Ini</label>
                <textarea
                  placeholder="Tulis keluhan atau sakit yang dirasakan lansia saat ini..."
                  rows={2}
                  value={examKeluhan}
                  onChange={(e) => setExamKeluhan(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50 resize-none font-medium"
                />
              </div>

              {/* Tindakan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-saas-muted">Tindakan / Rujukan / Pemberian Obat</label>
                <textarea
                  placeholder="Tulis tindakan medis, rujukan puskesmas, atau obat/kapsul yang diberikan..."
                  rows={2}
                  value={examTindakan}
                  onChange={(e) => setExamTindakan(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50 resize-none font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-saas-primary hover:bg-teal-600 text-white text-xs font-bold rounded-input shadow-md shadow-teal-500/10 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> {currentPeriodExam ? "Perbarui Hasil Periksa" : "Simpan Hasil Periksa"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* GRAFIK MONITORING KESEHATAN LANSIA (LINE CHART) */}
      <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-saas-dark flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Grafik Monitoring Kesehatan Lansia (Tensi &amp; Gula Darah)
            </h3>
            <p className="text-xs text-saas-muted mt-0.5">
              Grafik tren tekanan darah (Sistol/Diastol mmHg), gula darah sewaktu (mg/dL), dan berat badan (kg).
            </p>
          </div>
          <span className="text-xs font-bold text-saas-muted bg-gray-50 px-2.5 py-1 rounded-full border border-gray-150">
            {activeLansia.pemeriksaan.length} Data Periksa
          </span>
        </div>

        <div className="h-64 w-full pt-2">
          {activeLansia.pemeriksaan.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[...activeLansia.pemeriksaan]
                  .sort((a, b) => new Date(a.tanggalPeriksa).getTime() - new Date(b.tanggalPeriksa).getTime())
                  .map((p) => ({
                    tanggal: formatTanggalIndonesia(p.tanggalPeriksa),
                    "TD Sistol (mmHg)": p.tekananDarahSistol || null,
                    "TD Diastol (mmHg)": p.tekananDarahDiastol || null,
                    "Gula Darah (mg/dL)": p.gulaDarahSewaktu || null,
                    "Berat Badan (kg)": p.beratBadan,
                  }))}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="tanggal" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFF",
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                    fontSize: "12px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="TD Sistol (mmHg)"
                  stroke="#EF4444"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="TD Diastol (mmHg)"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Gula Darah (mg/dL)"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Berat Badan (kg)"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-saas-muted font-medium bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              Belum ada riwayat pemeriksaan lansia untuk menampilkan grafik.
            </div>
          )}
        </div>
      </div>

      {/* Tabel Riwayat Pemeriksaan Lansia */}
      <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 overflow-hidden min-w-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-base text-saas-dark">Riwayat Pemeriksaan Bulanan</h3>
            <p className="text-xs text-saas-muted mt-0.5">Daftar rekaman kesehatan lansia dari bulan ke bulan.</p>
          </div>
        </div>

        <div className="overflow-x-auto min-w-0">
          <table className="w-full text-left border-collapse min-w-[880px]">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold text-saas-muted uppercase tracking-wider">
                <th className="pb-3">Tanggal Periksa</th>
                <th className="pb-3">Berat (kg)</th>
                <th className="pb-3">Tinggi (cm)</th>
                <th className="pb-3">IMT</th>
                <th className="pb-3">Tekanan Darah</th>
                <th className="pb-3">GDS</th>
                <th className="pb-3">Kolesterol</th>
                <th className="pb-3">Asam Urat</th>
                <th className="pb-3">Lingkar Perut</th>
                <th className="pb-3">Keluhan</th>
                <th className="pb-3">Tindakan</th>
                <th className="pb-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {activeLansia.pemeriksaan.length > 0 ? (
                activeLansia.pemeriksaan.map((exam) => (
                  <tr key={exam.id} className="border-b border-gray-50 last:border-b-0 text-xs text-saas-dark">
                    <td className="py-4 font-bold">{formatTanggalIndonesia(exam.tanggalPeriksa)}</td>
                    <td className="py-4 font-bold">{exam.beratBadan} kg</td>
                    <td className="py-4 font-bold">{exam.tinggiBadan} cm</td>
                    <td className="py-4 font-bold text-teal-600">
                      {exam.beratBadan && exam.tinggiBadan ? hitungIMT(Number(exam.beratBadan), Number(exam.tinggiBadan)) || "-" : "-"}
                    </td>
                    <td className="py-4 font-bold">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] ${
                          exam.tekananDarahSistol >= 140
                            ? "bg-trend-dangerBg text-trend-dangerText"
                            : "bg-trend-successBg text-trend-successText"
                        }`}
                      >
                        {exam.tekananDarahSistol}/{exam.tekananDarahDiastol} mmHg
                      </span>
                    </td>
                    <td className="py-4 font-bold">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] ${
                          Number(exam.gulaDarahSewaktu) >= 200
                            ? "bg-trend-dangerBg text-trend-dangerText"
                            : "bg-trend-successBg text-trend-successText"
                        }`}
                      >
                        {exam.gulaDarahSewaktu} mg/dL
                      </span>
                    </td>
                    <td className="py-4 font-semibold text-saas-dark">
                      {exam.kolesterol ? `${exam.kolesterol} mg/dL` : "-"}
                    </td>
                    <td className="py-4 font-semibold text-saas-dark">
                      {exam.asamUrat ? `${exam.asamUrat} mg/dL` : "-"}
                    </td>
                    <td className="py-4 font-semibold text-saas-muted">{exam.lingkarPerut} cm</td>
                    <td className="py-4 max-w-xs font-semibold text-saas-muted leading-tight truncate">
                      {exam.keluhan || "-"}
                    </td>
                    <td className="py-4 max-w-xs font-semibold text-saas-muted leading-tight truncate">
                      {exam.tindakan || "-"}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditExamModal(exam)}
                          className="px-2 py-1 text-xs font-bold text-saas-primary hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteExamModal(exam.id)}
                          className="px-2 py-1 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-xs text-saas-muted font-medium">
                    Belum ada riwayat pemeriksaan lansia. Silakan input form di atas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
