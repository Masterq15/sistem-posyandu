"use client";

import React from "react";
import { ItemRiwayat } from "@/lib/api";
import { RekapanLansia } from "../types";
import Pagination from "@/components/Pagination";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Droplet,
  Activity,
  Scale,
  ShieldCheck,
  AlertCircle,
  Search,
} from "lucide-react";

import AnimatedNumber from "./AnimatedNumber";

interface LansiaLaporanViewProps {
  rekapanLansia: RekapanLansia | null;
  filteredLansiaLogs: ItemRiwayat[];
  pageLansia: number;
  setPageLansia: React.Dispatch<React.SetStateAction<number>>;
  pageSizeLansia: number;
  setPageSizeLansia: (size: number) => void;
  searchLansia: string;
  setSearchLansia: (search: string) => void;
  onNavigate?: (module: string, itemId?: string) => void;
  onSelectLog?: (log: ItemRiwayat) => void;
  triggerKey?: string | number;
  isUpdating?: boolean;
}

export default function LansiaLaporanView({
  rekapanLansia,
  filteredLansiaLogs,
  pageLansia,
  setPageLansia,
  pageSizeLansia,
  setPageSizeLansia,
  searchLansia,
  setSearchLansia,
  onNavigate,
  onSelectLog,
  triggerKey,
  isUpdating,
}: LansiaLaporanViewProps) {
  const totalPages = Math.max(1, Math.ceil(filteredLansiaLogs.length / pageSizeLansia));

  return (
    <div className={`bg-white rounded-xl border border-gray-200/80 p-5 shadow-2xs space-y-5 transition-all duration-300 ${
      isUpdating ? "opacity-75" : "opacity-100"
    }`}>
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
            <span className="font-bold text-gray-700">
              <AnimatedNumber value={rekapanLansia?.totalTerdaftar || 0} triggerKey={triggerKey} /> Terdaftar
            </span>
            <span>•</span>
            <span className="font-bold text-teal-700">
              <AnimatedNumber value={rekapanLansia?.totalOrang || 0} triggerKey={triggerKey} /> Diperiksa
            </span>
            <span>•</span>
            <span>
              Cakupan <strong className="text-gray-900"><AnimatedNumber value={rekapanLansia?.cakupanPersen ?? 0} decimals={1} suffix="%" triggerKey={triggerKey} /></strong>
            </span>
            <span>•</span>
            <span className="text-amber-700 font-semibold">
              <AnimatedNumber value={rekapanLansia?.tidakHadir || 0} triggerKey={triggerKey} /> Tidak Hadir
            </span>
          </p>
        </div>
        <div className="text-xs font-semibold text-saas-muted bg-gray-50 border border-gray-200/80 px-3 py-1.5 rounded-lg w-fit">
          Total Data: <strong className="text-saas-dark font-extrabold"><AnimatedNumber value={filteredLansiaLogs.length} triggerKey={triggerKey} /></strong> Pemeriksaan (<AnimatedNumber value={rekapanLansia?.totalOrang || 0} triggerKey={triggerKey} /> Lansia)
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
                <AnimatedNumber value={rekapanLansia?.totalOrang || 0} triggerKey={triggerKey} /> <span className="text-xs font-normal text-saas-muted">Lansia</span>
              </div>
              <span className="mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200/60 inline-block">
                <AnimatedNumber value={rekapanLansia?.totalPemeriksaan || 0} triggerKey={triggerKey} /> Kunjungan
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
                <AnimatedNumber value={rekapanLansia?.cakupanPersen ?? 0} decimals={1} suffix="%" triggerKey={triggerKey} />
              </div>
              <span className="mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60 inline-block">
                <AnimatedNumber value={rekapanLansia?.totalOrang || 0} triggerKey={triggerKey} /> dari {rekapanLansia?.totalTerdaftar || 0} Terdaftar
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
                <AnimatedNumber value={rekapanLansia?.perluFollowUp || 0} triggerKey={triggerKey} /> <span className="text-xs font-normal text-saas-muted">Lansia</span>
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
                <AnimatedNumber value={rekapanLansia?.kasusHipertensi || 0} triggerKey={triggerKey} /> <span className="text-xs font-normal text-saas-muted">Kasus</span>
              </div>
              <span className="mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60 inline-block">
                <AnimatedNumber
                  value={rekapanLansia && rekapanLansia.totalPemeriksaan > 0 ? (rekapanLansia.kasusHipertensi / rekapanLansia.totalPemeriksaan) * 100 : 0}
                  decimals={1}
                  suffix="%"
                  triggerKey={triggerKey}
                /> Derajat 1 &amp; 2
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
                <AnimatedNumber value={rekapanLansia?.kasusDiabetes || 0} triggerKey={triggerKey} /> <span className="text-xs font-normal text-saas-muted">Kasus</span>
              </div>
              <span className="mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200/60 inline-block">
                <AnimatedNumber
                  value={rekapanLansia && rekapanLansia.totalPemeriksaan > 0 ? (rekapanLansia.kasusDiabetes / rekapanLansia.totalPemeriksaan) * 100 : 0}
                  decimals={1}
                  suffix="%"
                  triggerKey={triggerKey}
                /> GDS ≥ 200 mg/dL
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tier 2 - Status Klinis & Skrining Vital */}
      <div className="space-y-3 pt-2 border-t border-gray-100">
        <h4 className="text-xs font-bold text-saas-muted uppercase tracking-wider">
          Tier 2 — Status Klinis &amp; Skrining Pemeriksaan Vital
        </h4>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Kolom 1: Status Tekanan Darah */}
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

          {/* Kolom 3: Skrining Laboratorium */}
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

      {/* Tier 3 - Keluhan Terbanyak & Tindakan Medis */}
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
                <AnimatedNumber value={rekapanLansia?.totalMendapatTindakan || 0} triggerKey={triggerKey} /> Ditindaklanjuti
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

      {/* Tier 4 - ⚠️ Lansia Perlu Follow-up */}
      <div className="space-y-3 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Tier 4 — Lansia Perlu Follow-Up &amp; Perhatian Khusus
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800">
                <AnimatedNumber value={rekapanLansia?.lansiaPerluPerhatianList?.length || 0} triggerKey={triggerKey} /> Kasus
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
                        {onSelectLog ? (
                          <button
                            type="button"
                            onClick={() => {
                              const found = filteredLansiaLogs.find((l) => l.id === item.id || l.pasienId === item.pasienId);
                              if (found) onSelectLog(found);
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                          >
                            Lihat Detail
                          </button>
                        ) : onNavigate && item.pasienId ? (
                          <button
                            type="button"
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
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white text-gray-900"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
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
                          {onSelectLog ? (
                            <button
                              type="button"
                              onClick={() => onSelectLog(log)}
                              className="text-gray-900 font-bold hover:text-teal-600 hover:underline text-left transition-colors cursor-pointer"
                              title={`Lihat Detail ${log.nama}`}
                            >
                              {log.nama || "-"}
                            </button>
                          ) : onNavigate && log.pasienId ? (
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
        <Pagination
          currentPage={pageLansia}
          totalPages={totalPages}
          pageSize={pageSizeLansia}
          totalItems={filteredLansiaLogs.length}
          onPageChange={setPageLansia}
        />
      </div>
    </div>
  );
}
