"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  LineChart as LineChartIcon,
  Calendar,
  User,
  HeartPulse,
  Activity,
  AlertTriangle,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
} from "lucide-react";
import BalitaIcon from "@/components/BalitaIcon";
import LansiaIcon from "@/components/LansiaIcon";
import { PublicPemeriksaanItem } from "@/lib/api";
import { extractPemberianLain } from "@/features/laporan/types";
import { GenderMale, GenderFemale } from "@phosphor-icons/react";
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

export interface ParticipantHistoryItem extends PublicPemeriksaanItem {
  tanggal: string;
  bb: number;
  tb: number;
  sistol?: number;
  diastol?: number;
  gds?: number;
}

export interface PuskesmasParticipantModalProps {
  selectedItem: PublicPemeriksaanItem | null;
  onClose: () => void;
  participantHistory: ParticipantHistoryItem[];
  prevRecord: ParticipantHistoryItem | null;
  bbDiff: number;
  tbDiff: number;
}

export default function PuskesmasParticipantModal({
  selectedItem,
  onClose,
  participantHistory,
  prevRecord,
  bbDiff,
  tbDiff,
}: PuskesmasParticipantModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!selectedItem) return;

    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = origOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedItem, onClose]);

  if (!mounted || !selectedItem) return null;

  const isBalita = selectedItem.kategori === "Balita";

  // Helper formatting usia
  let usiaLabel = selectedItem.usiaInfo || "-";
  if (selectedItem.tanggalLahir && !selectedItem.usiaInfo) {
    const lahir = new Date(selectedItem.tanggalLahir);
    const periksa = new Date(selectedItem.tanggalPeriksa);
    if (isBalita) {
      const bln = Math.max(
        0,
        (periksa.getFullYear() - lahir.getFullYear()) * 12 +
          (periksa.getMonth() - lahir.getMonth())
      );
      usiaLabel = `${bln} Bulan`;
    } else {
      const thn = Math.floor(
        (periksa.getTime() - lahir.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      );
      usiaLabel = `${thn} Tahun`;
    }
  }

  // Pemberian lain / vitamin / asi
  const pemberianLainStr = extractPemberianLain(selectedItem.statusImunisasi);

  const isMale = selectedItem.jenisKelamin === "L" || selectedItem.jenisKelamin === "Laki-laki";

  const modalElement = (
    <div
      onClick={onClose}
      style={{ margin: 0 }}
      className="posyandu-participant-modal-backdrop fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] !m-0 !mt-0 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ margin: 0 }}
        className="posyandu-participant-modal-dialog bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col border border-gray-200 !m-0 !mt-0"
      >
        {/* 1. MODAL HEADER */}
        <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center p-2 shrink-0 border shadow-xs ${
                isMale
                  ? "bg-blue-50 border-blue-200 text-blue-600"
                  : "bg-pink-50 border-pink-200 text-pink-600"
              }`}
            >
              {isBalita ? (
                <BalitaIcon className="w-8 h-8" gender={selectedItem.jenisKelamin} />
              ) : (
                <LansiaIcon className="w-8 h-8" gender={selectedItem.jenisKelamin} />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">
                  {selectedItem.namaWarga}
                </h3>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                    isBalita
                      ? "bg-teal-50 text-teal-800 border-teal-200"
                      : "bg-indigo-50 text-indigo-800 border-indigo-200"
                  }`}
                >
                  {selectedItem.kategori}
                </span>

                {/* Badge Gender: Jelas, Kontras & Berikon */}
                {isMale ? (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1 shadow-2xs">
                    <GenderMale className="w-3.5 h-3.5 text-blue-600" weight="bold" />
                    Laki-laki
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200 inline-flex items-center gap-1 shadow-2xs">
                    <GenderFemale className="w-3.5 h-3.5 text-pink-600" weight="bold" />
                    Perempuan
                  </span>
                )}

                {selectedItem.isPerluRujukan && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Perlu Perhatian
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-gray-700">{selectedItem.posyanduNama}</span>
                <span>•</span>
                <span>{selectedItem.wilayah || selectedItem.desa}</span>
                {selectedItem.rtRw && (
                  <>
                    <span>•</span>
                    <span>RT/RW {selectedItem.rtRw}</span>
                  </>
                )}
                <span>•</span>
                <span className="flex items-center gap-1 text-gray-600">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  {selectedItem.tanggalPeriksa}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. MODAL SCROLLABLE BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* A. KARTU RINGKASAN PROFIL & DEMOGRAFI */}
          <div className="bg-gray-50/60 border border-gray-200/80 rounded-xl p-4">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-500" /> Informasi Pasien
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-gray-500 block text-[11px]">Usia saat Periksa</span>
                <span className="font-bold text-gray-900">{usiaLabel}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Tanggal Lahir</span>
                <span className="font-bold text-gray-900 font-mono">
                  {selectedItem.tanggalLahir || "-"}
                </span>
              </div>
              {isBalita ? (
                <div>
                  <span className="text-gray-500 block text-[11px]">Nama Ibu</span>
                  <span className="font-bold text-gray-900">{selectedItem.namaIbu || "-"}</span>
                </div>
              ) : (
                <div>
                  <span className="text-gray-500 block text-[11px]">Riwayat Penyakit</span>
                  <span className="font-bold text-gray-900">
                    {selectedItem.riwayatHt && selectedItem.riwayatDm
                      ? "HT & DM"
                      : selectedItem.riwayatHt
                      ? "Hipertensi"
                      : selectedItem.riwayatDm
                      ? "Diabetes"
                      : "Tidak Ada"}
                  </span>
                </div>
              )}
              <div>
                <span className="text-gray-500 block text-[11px]">Status Ringkasan</span>
                <span
                  className={`font-bold inline-block mt-0.5 ${
                    selectedItem.isPerluRujukan
                      ? "text-rose-600"
                      : "text-emerald-700"
                  }`}
                >
                  {selectedItem.statusRingkasan || "Normal"}
                </span>
              </div>
            </div>
          </div>

          {/* B. PARAMETER ANTROPOMETRI & FISIK TERKINI */}
          <div>
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-600" /> Hasil Antropometri &amp; Pemeriksaan Fisik
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Berat Badan */}
              <div className="p-3 bg-white rounded-xl border border-gray-200/80 shadow-2xs">
                <span className="text-[11px] font-semibold text-gray-500 block">Berat Badan</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-extrabold text-gray-900">{selectedItem.beratBadan}</span>
                  <span className="text-xs text-gray-500 font-semibold">kg</span>
                </div>
                {prevRecord && typeof bbDiff === "number" && !isNaN(bbDiff) && bbDiff !== 0 ? (
                  <span
                    className={`text-[10px] font-bold flex items-center gap-0.5 mt-1 ${
                      bbDiff > 0 ? "text-teal-600" : "text-amber-600"
                    }`}
                  >
                    {bbDiff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {bbDiff > 0 ? `+${bbDiff}` : `${bbDiff}`} kg vs lalu
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-400 mt-1 block">Tercatat stabil</span>
                )}
              </div>

              {/* Tinggi / Panjang Badan */}
              <div className="p-3 bg-white rounded-xl border border-gray-200/80 shadow-2xs">
                <span className="text-[11px] font-semibold text-gray-500 block">
                  {isBalita ? "Panjang / Tinggi" : "Tinggi Badan"}
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-extrabold text-gray-900">{selectedItem.tinggiBadan}</span>
                  <span className="text-xs text-gray-500 font-semibold">cm</span>
                </div>
                {prevRecord && typeof tbDiff === "number" && !isNaN(tbDiff) && tbDiff !== 0 ? (
                  <span
                    className={`text-[10px] font-bold flex items-center gap-0.5 mt-1 ${
                      tbDiff > 0 ? "text-teal-600" : "text-amber-600"
                    }`}
                  >
                    {tbDiff > 0 ? <TrendingUp className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                    {tbDiff > 0 ? `+${tbDiff}` : `${tbDiff}`} cm vs lalu
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-400 mt-1 block">Tercatat stabil</span>
                )}
              </div>

              {/* Balita: Status BB/U & TB/U */}
              {isBalita ? (
                <>
                  <div className="p-3 bg-white rounded-xl border border-gray-200/80 shadow-2xs">
                    <span className="text-[11px] font-semibold text-gray-500 block">BB/U (Berat / Usia)</span>
                    <span
                      className={`text-sm font-bold mt-1 inline-block px-2 py-0.5 rounded-md ${
                        selectedItem.statusBbU === "Normal" || selectedItem.statusBbU === "N"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {selectedItem.statusBbU || "Normal"}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-gray-200/80 shadow-2xs">
                    <span className="text-[11px] font-semibold text-gray-500 block">TB/U (Tinggi / Usia)</span>
                    <span
                      className={`text-sm font-bold mt-1 inline-block px-2 py-0.5 rounded-md ${
                        selectedItem.statusTbU === "Normal" || selectedItem.statusTbU === "N"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {selectedItem.statusTbU || "Normal"}
                    </span>
                  </div>
                </>
              ) : (
                /* Lansia: Tekanan Darah & GDS */
                <>
                  <div className="p-3 bg-white rounded-xl border border-gray-200/80 shadow-2xs">
                    <span className="text-[11px] font-semibold text-gray-500 block">Tekanan Darah (TD)</span>
                    <span className="text-sm font-bold text-gray-900 mt-1 block">
                      {selectedItem.tekananDarah ||
                        (selectedItem.sistol ? `${selectedItem.sistol}/${selectedItem.diastol}` : "-")}{" "}
                      <span className="text-[10px] text-gray-500 font-normal">mmHg</span>
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-gray-200/80 shadow-2xs">
                    <span className="text-[11px] font-semibold text-gray-500 block">Gula Darah (GDS)</span>
                    <span className="text-sm font-bold text-gray-900 mt-1 block">
                      {selectedItem.gds ? `${selectedItem.gds} mg/dL` : "-"}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Parameter Tambahan Sesuai Kategori */}
            {isBalita ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/70">
                  <span className="text-[11px] font-medium text-slate-500 block">BB/TB (Status Gizi)</span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                    {selectedItem.statusBbTb || "Normal"}
                  </span>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/70">
                  <span className="text-[11px] font-medium text-slate-500 block">Lingkar Kepala (LK)</span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                    {selectedItem.lingkarKepala ? `${selectedItem.lingkarKepala} cm` : "-"}
                  </span>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/70">
                  <span className="text-[11px] font-medium text-slate-500 block">Lingkar Lengan (LiLA)</span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                    {selectedItem.lingkarLengan ? `${selectedItem.lingkarLengan} cm` : "-"}
                  </span>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/70">
                  <span className="text-[11px] font-medium text-slate-500 block">ASI Eksklusif</span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                    {selectedItem.asiEksklusif ? "Ya (ASI SKS)" : "Tidak / -"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/70">
                  <span className="text-[11px] font-medium text-slate-500 block">Kolesterol</span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                    {selectedItem.kolesterol ? `${selectedItem.kolesterol} mg/dL` : "-"}
                  </span>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/70">
                  <span className="text-[11px] font-medium text-slate-500 block">Asam Urat</span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                    {selectedItem.asamUrat ? `${selectedItem.asamUrat} mg/dL` : "-"}
                  </span>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/70">
                  <span className="text-[11px] font-medium text-slate-500 block">Lingkar Perut</span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                    {selectedItem.lingkarPerut ? `${selectedItem.lingkarPerut} cm` : "-"}
                  </span>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/70">
                  <span className="text-[11px] font-medium text-slate-500 block">Indeks Massa Tubuh (IMT)</span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                    {selectedItem.imt || "-"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* C. INTERVENSI & SUPLEMEN (KHUSUS BALITA) */}
          {isBalita && (
            <div className="bg-white border border-gray-200/80 rounded-xl p-4">
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Suplementasi &amp; Imunisasi
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      selectedItem.vitaminA ? "bg-teal-100 text-teal-700" : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {selectedItem.vitaminA ? "✓" : "–"}
                  </div>
                  <span className="font-semibold text-gray-700">Vitamin A</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      selectedItem.obatCacing ? "bg-teal-100 text-teal-700" : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {selectedItem.obatCacing ? "✓" : "–"}
                  </div>
                  <span className="font-semibold text-gray-700">Obat Cacing</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      selectedItem.vitB1 ? "bg-teal-100 text-teal-700" : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {selectedItem.vitB1 ? "✓" : "–"}
                  </div>
                  <span className="font-semibold text-gray-700">Vitamin B1</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      selectedItem.vitB6 ? "bg-teal-100 text-teal-700" : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {selectedItem.vitB6 ? "✓" : "–"}
                  </div>
                  <span className="font-semibold text-gray-700">Vitamin B6</span>
                </div>
              </div>
              {pemberianLainStr !== "-" && (
                <div className="mt-2.5 pt-2.5 border-t border-gray-100 text-xs text-gray-700 flex items-center gap-2">
                  <span className="font-semibold text-gray-500">Pemberian Lain / Imunisasi:</span>
                  <span className="font-bold text-gray-900">{pemberianLainStr}</span>
                </div>
              )}
            </div>
          )}

          {/* D. GRAFIK TREN RIWAYAT (JIKA ADA > 1 PEMERIKSAAN) */}
          {participantHistory.length > 1 ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <LineChartIcon className="w-4 h-4 text-teal-600" />
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Grafik Tren Riwayat Pertumbuhan &amp; Perkembangan
                  </h4>
                </div>
                <span className="text-[11px] font-semibold text-gray-500">
                  {participantHistory.length} Kali Pemeriksaan Tercatat
                </span>
              </div>
              <div className="h-52 w-full bg-gray-50/60 p-2.5 rounded-xl border border-gray-200/80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={participantHistory} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="tanggal" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line
                      type="monotone"
                      dataKey="bb"
                      name="Berat Badan (kg)"
                      stroke="#0D9488"
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: "#0D9488" }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="tb"
                      name="Tinggi Badan (cm)"
                      stroke="#6366F1"
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: "#6366F1" }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/60 text-center text-xs text-gray-500">
              Riwayat sebelumnya belum terekam dalam sistem. Grafik tren akan otomatis ditampilkan setelah ada minimal 2 kali kunjungan pemeriksaan.
            </div>
          )}

          {/* E. KELUHAN, TINDAKAN MEDIS & CATATAN PETUGAS */}
          <div className="p-4 bg-teal-50/40 border border-teal-150 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-teal-100">
              <span className="text-gray-600 font-medium flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-teal-700" /> Petugas Pemeriksa:
              </span>
              <span className="font-bold text-teal-900">{selectedItem.petugas || "Kader Posyandu"}</span>
            </div>

            {selectedItem.keluhan && (
              <div className="text-xs text-gray-700 pt-1">
                <span className="font-bold text-gray-900 block mb-0.5">Keluhan Pasien:</span>
                <p className="bg-white/80 p-2.5 rounded-lg border border-teal-100 text-gray-800">
                  {selectedItem.keluhan}
                </p>
              </div>
            )}

            {(selectedItem.tindakan || selectedItem.tindakanCatatan) && (
              <div className="text-xs text-gray-700 pt-1">
                <span className="font-bold text-gray-900 block mb-0.5">Tindakan / Edukasi / Konseling:</span>
                <p className="bg-white/80 p-2.5 rounded-lg border border-teal-100 text-gray-800">
                  {selectedItem.tindakan || selectedItem.tindakanCatatan}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 3. MODAL FOOTER */}
        <div className="px-5 sm:px-6 py-3 border-t border-gray-100 bg-gray-50/70 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalElement, document.body);
}
