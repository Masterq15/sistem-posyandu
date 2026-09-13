"use client";

import React from "react";
import {
  Search,
  FileSpreadsheet,
  LineChart as LineChartIcon,
  Calendar,
  Activity,
  RotateCcw,
  X,
  Filter,
  Users,
} from "lucide-react";
import BalitaIcon from "@/components/BalitaIcon";
import LansiaIcon from "@/components/LansiaIcon";
import { PeriodePelayanan } from "@/lib/api";

export interface RiwayatFilterBarProps {
  viewMode: "tabel" | "grafik";
  setViewMode: (mode: "tabel" | "grafik") => void;
  query: string;
  setQuery: (val: string) => void;
  typeFilter: "semua" | "Balita" | "Lansia";
  setTypeFilter: (val: "semua" | "Balita" | "Lansia") => void;
  selectedBulan: number | "semua";
  setSelectedBulan: (val: number | "semua") => void;
  selectedTahun: number | "semua";
  setSelectedTahun: (val: number | "semua") => void;
  statusFilter: "semua" | "success" | "warning";
  setStatusFilter: (val: "semua" | "success" | "warning") => void;
  monthNames: string[];
  yearOptions: number[];
  activePeriode?: PeriodePelayanan | null;
  handleSetCurrentPeriod: () => void;
  handleResetFilters: () => void;
  isFilterActive: boolean;
}

export default function RiwayatFilterBar({
  viewMode,
  setViewMode,
  query,
  setQuery,
  typeFilter,
  setTypeFilter,
  selectedBulan,
  setSelectedBulan,
  selectedTahun,
  setSelectedTahun,
  statusFilter,
  setStatusFilter,
  monthNames,
  yearOptions,
  activePeriode,
  handleSetCurrentPeriod,
  handleResetFilters,
  isFilterActive,
}: RiwayatFilterBarProps) {
  return (
    <>
      {/* Header & Mode Switch */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-saas-dark tracking-tight">
            Riwayat Pemeriksaan Bulanan
          </h2>
          <p className="text-xs sm:text-sm text-saas-muted mt-0.5">
            Data terpadu perkembangan kesehatan Balita &amp; Lansia beserta statistik grafik bulanan.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          {/* Switch Mode Tabel / Grafik */}
          <div className="bg-gray-100 p-1 rounded-xl flex gap-1 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setViewMode("tabel")}
              className={`flex-1 sm:flex-none justify-center px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                viewMode === "tabel"
                  ? "bg-white text-saas-dark shadow-sm"
                  : "text-saas-muted hover:text-saas-dark"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" /> Tabel Riwayat
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grafik")}
              className={`flex-1 sm:flex-none justify-center px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                viewMode === "grafik"
                  ? "bg-white text-saas-dark shadow-sm"
                  : "text-saas-muted hover:text-saas-dark"
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5 shrink-0" /> Grafik Trend
            </button>
          </div>
        </div>
      </div>

      {/* Filters Card - Clean & Intuitive Layout */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100/80 shadow-soft-card space-y-3.5">
        {/* Row 1: Search Utama + Kategori Segmented Control */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Input dengan Clear Button */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-saas-muted w-4 h-4" />
            <input
              type="text"
              placeholder="Cari nama warga, parameter, atau petugas..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-gray-50/90 hover:bg-gray-50 focus:bg-white border border-gray-200/80 focus:border-saas-primary rounded-xl text-sm text-saas-dark placeholder-saas-muted focus:outline-none focus:ring-2 focus:ring-saas-primary/10 transition-all font-medium"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-saas-muted hover:text-saas-dark rounded-md transition-colors cursor-pointer"
                title="Hapus kata pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Segmented Control Kategori */}
          <div className="inline-flex bg-gray-100/90 p-1 rounded-xl gap-1 shrink-0 self-start sm:self-auto">
            {(["semua", "Balita", "Lansia"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  typeFilter === t
                    ? "bg-white text-saas-dark shadow-sm"
                    : "text-saas-muted hover:text-saas-dark"
                }`}
              >
                {t === "Balita" ? (
                  <BalitaIcon className="w-3.5 h-3.5" />
                ) : t === "Lansia" ? (
                  <LansiaIcon className="w-3.5 h-3.5" />
                ) : (
                  <Users className="w-3.5 h-3.5" />
                )}
                {t === "semua" ? "Semua Kategori" : t}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Filter Refinement (Periode + Kondisi + Reset Filter) */}
        <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Periode Selector (Bulan & Tahun) */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200/80 rounded-xl px-2.5 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-saas-muted shrink-0" />
              <span className="font-semibold text-saas-muted mr-0.5">Periode:</span>
              <select
                value={selectedBulan}
                onChange={(e) =>
                  setSelectedBulan(
                    e.target.value === "semua" ? "semua" : Number(e.target.value)
                  )
                }
                className="bg-transparent font-bold text-saas-dark focus:outline-none cursor-pointer"
              >
                <option value="semua">Semua Bulan</option>
                {monthNames.map((m, idx) => (
                  <option key={m} value={idx + 1}>
                    {m}
                  </option>
                ))}
              </select>
              <span className="text-gray-300">/</span>
              <select
                value={selectedTahun}
                onChange={(e) =>
                  setSelectedTahun(
                    e.target.value === "semua" ? "semua" : Number(e.target.value)
                  )
                }
                className="bg-transparent font-bold text-saas-dark focus:outline-none cursor-pointer"
              >
                <option value="semua">Semua Tahun</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Tombol Cepat: Periode Ini */}
            {activePeriode && (
              <button
                type="button"
                onClick={handleSetCurrentPeriod}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${
                  selectedBulan === activePeriode.bulan && selectedTahun === activePeriode.tahun
                    ? "bg-saas-primary/10 text-saas-primary border-saas-primary/30"
                    : "bg-white text-saas-muted border-gray-200/80 hover:bg-gray-50 hover:text-saas-dark"
                }`}
                title="Tampilkan data periode posyandu aktif saat ini"
              >
                Periode Ini ({monthNames[activePeriode.bulan - 1].slice(0, 3)}{" "}
                {activePeriode.tahun})
              </button>
            )}

            {/* Filter Kondisi Hasil */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200/80 rounded-xl px-2.5 py-1.5">
              <Activity className="w-3.5 h-3.5 text-saas-muted shrink-0" />
              <span className="font-semibold text-saas-muted mr-0.5">Kondisi:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-transparent font-bold text-saas-dark focus:outline-none cursor-pointer"
              >
                <option value="semua">Semua Kondisi</option>
                <option value="success">🟢 Normal / Sehat</option>
                <option value="warning">🟡 Perlu Perhatian / Rawan</option>
              </select>
            </div>
          </div>

          {/* Reset Filter Button */}
          {isFilterActive && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 border border-rose-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
              title="Kembalikan semua filter ke pengaturan awal"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filter
            </button>
          )}
        </div>

        {/* Row 3: Active Filter Chips */}
        {isFilterActive && (
          <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-saas-muted font-medium text-[11px] flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter aktif:
            </span>
            {query.trim() && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-saas-dark text-[11px] font-semibold">
                Kata: &ldquo;{query}&rdquo;
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {typeFilter !== "semua" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200/50 text-[11px] font-semibold">
                Kategori: {typeFilter}
                <button
                  type="button"
                  onClick={() => setTypeFilter("semua")}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {(selectedBulan !== "semua" || selectedTahun !== "semua") && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/50 text-[11px] font-semibold">
                Periode:{" "}
                {selectedBulan !== "semua" ? monthNames[Number(selectedBulan) - 1] : ""}{" "}
                {selectedTahun !== "semua" ? selectedTahun : "Semua Tahun"}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBulan("semua");
                    setSelectedTahun("semua");
                  }}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {statusFilter !== "semua" && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                  statusFilter === "success"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                Kondisi:{" "}
                {statusFilter === "success" ? "Normal / Sehat" : "Perlu Perhatian / Rawan"}
                <button
                  type="button"
                  onClick={() => setStatusFilter("semua")}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );
}
