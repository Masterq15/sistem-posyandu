"use client";

import React from "react";
import { RotateCcw, Loader2, Eye, Download } from "lucide-react";

export interface LaporanFilterCardProps {
  filterCategory: "Balita" | "Lansia";
  setFilterCategory: (c: "Balita" | "Lansia") => void;
  posyandus?: Array<{ id: string; nama: string; desa: string }>;
  selectedPosyandu?: string;
  setSelectedPosyandu?: (p: string) => void;
  filterMonth: string;
  setFilterMonth: (m: string) => void;
  filterYear: string;
  setFilterYear: (y: string) => void;
  filterFromDate: string;
  setFilterFromDate: (d: string) => void;
  filterToDate: string;
  setFilterToDate: (d: string) => void;
  yearOptions: number[];
  onResetCurrentPeriod: () => void;
  onResetAllPeriods: () => void;
  isLoading: boolean;
  hasData: boolean;
  onOpenPreview: () => void;
  onExportExcel: () => void;
  isExportingExcel: boolean;
  isExportingPdf?: boolean;
}

export default function LaporanFilterCard({
  filterCategory,
  setFilterCategory,
  posyandus,
  selectedPosyandu,
  setSelectedPosyandu,
  filterMonth,
  setFilterMonth,
  filterYear,
  setFilterYear,
  filterFromDate,
  setFilterFromDate,
  filterToDate,
  setFilterToDate,
  yearOptions,
  onResetCurrentPeriod,
  onResetAllPeriods,
  isLoading,
  hasData,
  onOpenPreview,
  onExportExcel,
  isExportingExcel,
  isExportingPdf = false,
}: LaporanFilterCardProps) {
  const hasPosyanduFilter = Array.isArray(posyandus) && posyandus.length > 0 && setSelectedPosyandu;

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
      {/* Baris 1: Pilihan Kategori, Posyandu, Bulan, Tahun, dan Rentang Tanggal */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${hasPosyanduFilter ? "lg:grid-cols-6" : "lg:grid-cols-5"} gap-3.5`}>
        {/* 1. Kategori Laporan */}
        <div>
          <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">
            1. Kategori Peserta
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFilterCategory("Balita")}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                filterCategory === "Balita"
                  ? "bg-teal-600 text-white shadow-sm shadow-teal-600/20"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Balita
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory("Lansia")}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                filterCategory === "Lansia"
                  ? "bg-teal-600 text-white shadow-sm shadow-teal-600/20"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Lansia
            </button>
          </div>
        </div>

        {/* [Opsional] 2. Pilihan Posyandu */}
        {hasPosyanduFilter && (
          <div>
            <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">
              2. Posyandu
            </label>
            <select
              value={selectedPosyandu || "semua"}
              onChange={(e) => setSelectedPosyandu(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            >
              <option value="semua" className="text-gray-900">
                Semua Posyandu ({posyandus.length})
              </option>
              {posyandus.map((p) => (
                <option key={p.id} value={p.id} className="text-gray-900">
                  {p.nama} ({p.desa})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Periode Bulan */}
        <div>
          <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">
            {hasPosyanduFilter ? "3. Bulan" : "2. Bulan"}
          </label>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
          >
            <option value="" className="text-gray-900">Semua Bulan</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={String(i + 1).padStart(2, "0")} className="text-gray-900">
                {new Date(2000, i).toLocaleString("id-ID", { month: "long" })}
              </option>
            ))}
          </select>
        </div>

        {/* Periode Tahun */}
        <div>
          <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">
            {hasPosyanduFilter ? "4. Tahun" : "3. Tahun"}
          </label>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
          >
            <option value="" className="text-gray-900">Semua Tahun</option>
            {yearOptions.map((year) => (
              <option key={year} value={year.toString()} className="text-gray-900">
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Dari Tanggal */}
        <div>
          <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">
            Dari Tanggal (Opsional)
          </label>
          <input
            type="date"
            value={filterFromDate}
            onChange={(e) => setFilterFromDate(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
          />
        </div>

        {/* Sampai Tanggal */}
        <div>
          <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">
            Sampai Tanggal (Opsional)
          </label>
          <input
            type="date"
            value={filterToDate}
            onChange={(e) => setFilterToDate(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
          />
        </div>
      </div>

      {/* Baris 2: Tombol Reset Filter & Tombol Unduh Laporan */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {/* Tombol Reset ke Periode Ini */}
          <button
            type="button"
            onClick={onResetCurrentPeriod}
            className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-lg border border-teal-200/80 transition-colors flex items-center gap-1.5 shadow-xs"
            title="Set filter kembali ke periode ini"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Periode Ini
          </button>

          {/* Tombol Tampilkan Semua Periode */}
          <button
            type="button"
            onClick={onResetAllPeriods}
            className="px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg border border-gray-300 transition-colors flex items-center gap-1.5 shadow-xs"
            title="Tampilkan semua data tanpa filter bulan dan tahun"
          >
            Semua Periode
          </button>

          {isLoading && (
            <span className="text-xs text-teal-600 font-semibold flex items-center gap-1.5 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Memperbarui data...
            </span>
          )}
        </div>

        {/* Tombol Aksi Laporan */}
        <div className="flex items-center gap-2">
          {/* Tombol Pratinjau Dokumen */}
          <button
            type="button"
            onClick={onOpenPreview}
            disabled={isLoading || !hasData}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
            title="Pratinjau dokumen PDF sebelum diunduh atau dicetak"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Pratinjau Laporan</span>
          </button>

          {/* Tombol Unduh PDF */}
          <button
            type="button"
            onClick={onOpenPreview}
            disabled={isExportingPdf || !hasData}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
            title="Pratinjau & Unduh format PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh PDF</span>
          </button>

          {/* Tombol Unduh Excel */}
          <button
            type="button"
            onClick={onExportExcel}
            disabled={isExportingExcel || !hasData}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
            title="Unduh format spreadsheet Excel (.xlsx)"
          >
            {isExportingExcel ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{isExportingExcel ? "Mengunduh Excel..." : "Unduh Excel"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
