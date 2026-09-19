"use client";

import React from "react";
import { Plus, Search, Phone, CheckCircle2, AlertCircle, AlertTriangle, ChevronRight } from "lucide-react";
import Pagination from "@/components/Pagination";
import { TableSkeleton } from "@/components/Skeleton";
import { Balita } from "../types";
import { calculateAgeInMonths } from "@/features/pelayanan/types";

export interface BalitaListTableProps {
  balitas: Balita[];
  filteredBalitas: Balita[];
  isLoading: boolean;
  query: string;
  setQuery: (q: string) => void;
  ageFilter: "semua" | "0-6" | "7-12" | "13-24" | "25-60";
  setAgeFilter: (filter: "semua" | "0-6" | "7-12" | "13-24" | "25-60") => void;
  tindakLanjutFilter: "semua" | "perlu_tindak_lanjut" | "normal" | "belum_periksa";
  setTindakLanjutFilter: (filter: "semua" | "perlu_tindak_lanjut" | "normal" | "belum_periksa") => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  limit: number;
  setLimit: (limit: number) => void;
  totalItems?: number;
  totalPages?: number;
  onAddNew: () => void;
  onSelectDetail: (id: string) => void;
}

export default function BalitaListTable({
  balitas,
  filteredBalitas,
  isLoading,
  query,
  setQuery,
  ageFilter,
  setAgeFilter,
  tindakLanjutFilter,
  setTindakLanjutFilter,
  currentPage,
  setCurrentPage,
  limit,
  setLimit,
  totalItems: serverTotalItems,
  totalPages: serverTotalPages,
  onAddNew,
  onSelectDetail,
}: BalitaListTableProps) {
  const isClientSearchActive = Boolean(query && query.trim());
  const totalItems = isClientSearchActive
    ? filteredBalitas.length
    : (serverTotalItems ?? filteredBalitas.length);
  const totalPages = isClientSearchActive
    ? Math.max(1, Math.ceil(filteredBalitas.length / limit))
    : (serverTotalPages ?? Math.max(1, Math.ceil(totalItems / limit)));

  // Data dari server sudah di-paginate jika bukan client in-memory search
  const paginatedBalitas = isClientSearchActive
    ? filteredBalitas.slice((currentPage - 1) * limit, currentPage * limit)
    : filteredBalitas;

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-saas-dark tracking-tight">Data Balita</h2>
          <p className="text-sm text-saas-muted mt-0.5">Kelola identitas dan riwayat tumbuh kembang anak.</p>
        </div>
        <button
          type="button"
          onClick={onAddNew}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-saas-primary hover:bg-teal-600 text-white text-xs font-bold rounded-input shadow-md shadow-teal-500/10 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Tambah Balita Baru
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-card border border-gray-100/50 shadow-soft-card min-w-0">
        <div className="relative w-full lg:w-80 min-w-0">
          <input
            type="text"
            placeholder="Cari nama, NIK, atau nama ibu..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-gray-50/70 border border-gray-100 rounded-input text-sm text-saas-dark placeholder-saas-muted/70 focus:outline-none focus:border-saas-primary/50 focus:bg-white transition-all font-medium"
          />
          <Search className="absolute left-3.5 top-2.5 text-saas-muted/80 w-4 h-4" />
        </div>

        {/* Filter Dropdowns Container */}
        <div className="flex flex-wrap items-center gap-3 shrink-0 self-start lg:self-auto">
          {/* Filter Status / Tindak Lanjut */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-saas-muted whitespace-nowrap">Status:</span>
            <select
              value={tindakLanjutFilter}
              onChange={(e) => {
                setTindakLanjutFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className={`text-xs font-bold border rounded-lg px-3 py-2 transition-colors focus:outline-none cursor-pointer ${
                tindakLanjutFilter === "perlu_tindak_lanjut"
                  ? "bg-amber-50 border-amber-300 text-amber-900 focus:border-amber-500 font-extrabold shadow-sm"
                  : tindakLanjutFilter === "normal"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-900 focus:border-emerald-500"
                  : "bg-gray-50 border-gray-200 text-saas-dark hover:bg-gray-100/70 focus:border-saas-primary"
              }`}
              title="Filter Status Gizi / Perlu Tindak Lanjut"
            >
              <option value="semua">Semua Status</option>
              <option value="perlu_tindak_lanjut">⚠️ Perlu Tindak Lanjut</option>
              <option value="normal">✅ Gizi Normal</option>
              <option value="belum_periksa">Belum Diperiksa</option>
            </select>
          </div>

          {/* Filter Usia Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-saas-muted whitespace-nowrap">Filter Usia:</span>
            <select
              value={ageFilter}
              onChange={(e) => {
                setAgeFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-saas-dark hover:bg-gray-100/70 transition-colors focus:outline-none focus:border-saas-primary cursor-pointer"
              title="Filter Kelompok Usia Balita"
            >
              <option value="semua">Semua Usia</option>
              <option value="0-6">0-6 Bulan</option>
              <option value="7-12">7-12 Bulan</option>
              <option value="13-24">13-24 Bulan</option>
              <option value="25-60">25-60 Bulan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Info Banner when Filter 'Perlu Tindak Lanjut' is active */}
      {tindakLanjutFilter === "perlu_tindak_lanjut" && (
        <div className="flex items-center justify-between p-3.5 bg-amber-50/90 border border-amber-200/80 rounded-xl text-xs text-amber-900 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Menampilkan balita yang terdeteksi <strong>berisiko stunting, gizi kurang/buruk (wasting), atau BB kurang</strong> pada pemeriksaan terakhir yang memerlukan intervensi/tindak lanjut segera.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setTindakLanjutFilter("semua");
              setCurrentPage(1);
            }}
            className="text-amber-800 hover:text-amber-950 underline font-bold whitespace-nowrap ml-3 cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* Table Container */}
      {isLoading ? (
        <TableSkeleton rows={6} columns={6} />
      ) : (
        <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-saas-muted uppercase tracking-wider">
                  <th className="pb-3">Nama Lengkap</th>
                  <th className="pb-3">No. HP Orang Tua / WA</th>
                  <th className="pb-3">Usia (Bulan)</th>
                  <th className="pb-3">Jenis Kelamin</th>
                  <th className="pb-3">Nama Ibu</th>
                  <th className="pb-3">Status Gizi (BB/U)</th>
                  <th className="pb-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBalitas.length > 0 ? (
                  paginatedBalitas.map((item) => {
                    const ageMonths = calculateAgeInMonths(item.tanggalLahir);
                    const latestExam = item.pemeriksaan[0];
                    const cleanPhone = item.noHp ? item.noHp.replace(/\D/g, "") : "";
                    const waNumber = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/40 transition-colors text-sm"
                      >
                        <td className="py-4">
                          <button
                            type="button"
                            onClick={() => onSelectDetail(item.id)}
                            className="font-bold text-saas-dark hover:text-saas-primary hover:underline text-left transition-colors cursor-pointer"
                            title={`Lihat Profil ${item.nama}`}
                          >
                            {item.nama}
                          </button>
                          <p className="text-[11px] text-saas-muted font-medium mt-0.5">
                            NIK: {item.nik || "-"}
                          </p>
                        </td>
                        <td className="py-4">
                          {item.noHp ? (
                            <a
                              href={`https://wa.me/${waNumber}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg text-xs transition-colors border border-emerald-200/60"
                              title="Hubungi Orang Tua via WhatsApp"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              {item.noHp}
                            </a>
                          ) : (
                            <span className="text-xs text-saas-muted font-medium">-</span>
                          )}
                        </td>
                        <td className="py-4 font-bold text-saas-dark">{isNaN(ageMonths) ? 0 : ageMonths} Bulan</td>
                        <td className="py-4 font-semibold text-saas-muted">
                          {item.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}
                        </td>
                        <td className="py-4 text-saas-muted font-semibold">{item.namaIbu}</td>
                        <td className="py-4">
                          {latestExam ? (
                            <div className="flex flex-col gap-1 items-start">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                                  latestExam.statusBBU === "Normal"
                                    ? "bg-trend-successBg text-trend-successText"
                                    : latestExam.statusBBU === "Kurang" ||
                                      latestExam.statusBBU === "Sangat Kurang"
                                    ? "bg-trend-dangerBg text-trend-dangerText"
                                    : "bg-blue-50 text-saas-primary"
                                }`}
                              >
                                {latestExam.statusBBU === "Normal" ? (
                                  <CheckCircle2 className="w-3 h-3" />
                                ) : (
                                  <AlertCircle className="w-3 h-3" />
                                )}
                                BB/U: {latestExam.statusBBU}
                              </span>

                              {/* Indikator Tambahan jika TB/U (Stunting) atau BB/TB (Wasting) bermasalah */}
                              {(String(latestExam.statusTBU || "").toLowerCase().includes("pendek") ||
                                latestExam.statusTBU === "SP" ||
                                latestExam.statusTBU === "P") && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200/60 inline-flex items-center gap-1">
                                  <AlertTriangle className="w-2.5 h-2.5 text-amber-700" />
                                  TB/U: {latestExam.statusTBU}
                                </span>
                              )}

                              {(String(latestExam.statusBBTB || "").toLowerCase().includes("kurang") ||
                                String(latestExam.statusBBTB || "").toLowerCase().includes("buruk") ||
                                String(latestExam.statusBBTB || "").toLowerCase().includes("kurus") ||
                                latestExam.statusBBTB === "SK" ||
                                latestExam.statusBBTB === "K") && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-200/60 inline-flex items-center gap-1">
                                  <AlertCircle className="w-2.5 h-2.5 text-rose-700" />
                                  BB/TB: {latestExam.statusBBTB}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-saas-muted italic">Belum periksa</span>
                          )}
                        </td>
                        <td className="py-4 text-right">
                          <button
                            type="button"
                            onClick={() => onSelectDetail(item.id)}
                            className="px-3 py-1.5 bg-gray-50 hover:bg-saas-primary/10 hover:text-saas-primary border border-gray-100 rounded-input text-xs font-bold text-saas-dark transition-all inline-flex items-center gap-1 cursor-pointer"
                          >
                            Detail Data <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs text-saas-muted font-medium">
                      Tidak ada data balita yang cocok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Universal Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={limit}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setLimit(size);
              setCurrentPage(1);
            }}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </div>
      )}
    </div>
  );
}
