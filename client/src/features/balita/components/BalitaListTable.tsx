"use client";

import React from "react";
import { Plus, Search, Phone, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
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
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  limit: number;
  setLimit: (limit: number) => void;
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
  currentPage,
  setCurrentPage,
  limit,
  setLimit,
  onAddNew,
  onSelectDetail,
}: BalitaListTableProps) {
  const totalItems = filteredBalitas.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const paginatedBalitas = filteredBalitas.slice((currentPage - 1) * limit, currentPage * limit);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-card border border-gray-100/50 shadow-soft-card min-w-0">
        <div className="relative w-full sm:w-80 min-w-0">
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

        {/* Filter Usia Dropdown */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
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
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
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
                              {latestExam.statusBBU}
                            </span>
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
