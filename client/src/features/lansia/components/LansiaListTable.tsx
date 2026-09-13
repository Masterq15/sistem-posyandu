"use client";

import React from "react";
import { Plus, Search, Phone, ChevronRight } from "lucide-react";
import Pagination from "@/components/Pagination";
import { TableSkeleton } from "@/components/Skeleton";
import { Lansia } from "../types";
import { calculateAgeInYears } from "@/features/pelayanan/types";

export interface LansiaListTableProps {
  lansias: Lansia[];
  filteredLansias: Lansia[];
  isLoading: boolean;
  query: string;
  setQuery: (q: string) => void;
  diseaseFilter: "semua" | "sehat" | "ht" | "dm";
  setDiseaseFilter: (f: "semua" | "sehat" | "ht" | "dm") => void;
  ageFilter: "semua" | "45-59" | "60-69" | "70+";
  setAgeFilter: (f: "semua" | "45-59" | "60-69" | "70+") => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  limit: number;
  setLimit: (l: number) => void;
  onAddNew: () => void;
  onSelectDetail: (id: string) => void;
}

export default function LansiaListTable({
  lansias,
  filteredLansias,
  isLoading,
  query,
  setQuery,
  diseaseFilter,
  setDiseaseFilter,
  ageFilter,
  setAgeFilter,
  currentPage,
  setCurrentPage,
  limit,
  setLimit,
  onAddNew,
  onSelectDetail,
}: LansiaListTableProps) {
  const totalItems = filteredLansias.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const paginatedLansias = filteredLansias.slice((currentPage - 1) * limit, currentPage * limit);

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-saas-dark tracking-tight">Data Lansia</h2>
          <p className="text-sm text-saas-muted mt-0.5">Kelola data kesehatan berkala lansia posyandu.</p>
        </div>
        <button
          type="button"
          onClick={onAddNew}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-saas-primary hover:bg-teal-600 text-white text-xs font-bold rounded-input shadow-md shadow-teal-500/10 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Tambah Lansia Baru
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-card border border-gray-100/50 shadow-soft-card min-w-0">
        <div className="relative w-full sm:w-80 min-w-0">
          <input
            type="text"
            placeholder="Cari nama, NIK, No. HP, atau BPJS..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-gray-50/70 border border-gray-100 rounded-input text-sm text-saas-dark placeholder-saas-muted/70 focus:outline-none focus:border-saas-primary/50 focus:bg-white transition-all font-medium"
          />
          <Search className="absolute left-3.5 top-2.5 text-saas-muted/80 w-4 h-4" />
        </div>

        {/* Filters Group (Dropdowns) */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
          {/* Health Status Filter Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-bold text-saas-muted whitespace-nowrap">Riwayat:</span>
            <select
              value={diseaseFilter}
              onChange={(e) => {
                setDiseaseFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 text-saas-dark hover:bg-gray-100/70 transition-colors focus:outline-none focus:border-saas-primary cursor-pointer"
              title="Filter Riwayat Kesehatan"
            >
              <option value="semua">Semua Status</option>
              <option value="sehat">Sehat</option>
              <option value="ht">Hipertensi (HT)</option>
              <option value="dm">Diabetes (DM)</option>
            </select>
          </div>

          {/* Age Filter Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-bold text-saas-muted whitespace-nowrap">Kelompok Umur:</span>
            <select
              value={ageFilter}
              onChange={(e) => {
                setAgeFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 text-saas-dark hover:bg-gray-100/70 transition-colors focus:outline-none focus:border-saas-primary cursor-pointer"
              title="Filter Kelompok Umur"
            >
              <option value="semua">Semua Umur</option>
              <option value="45-59">45-59 Tahun (Pra-Lansia)</option>
              <option value="60-69">60-69 Tahun (Lansia)</option>
              <option value="70+">≥70 Tahun (Lansia Risiko)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      {isLoading ? (
        <TableSkeleton rows={6} columns={7} />
      ) : (
        <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 overflow-hidden min-w-0">
          <div className="overflow-x-auto min-w-0">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-saas-muted uppercase tracking-wider">
                  <th className="pb-3">Nama Lansia</th>
                  <th className="pb-3">No. HP / WA</th>
                  <th className="pb-3">Usia (Tahun)</th>
                  <th className="pb-3">RT/RW</th>
                  <th className="pb-3">Riwayat Penyakit</th>
                  <th className="pb-3">Kemandirian</th>
                  <th className="pb-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLansias.length > 0 ? (
                  paginatedLansias.map((item) => {
                    const ageYears = calculateAgeInYears(item.tanggalLahir);
                    const cleanPhone = item.noHp ? item.noHp.replace(/\D/g, "") : "";
                    const waNumber = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;
                    return (
                      <tr key={item.id} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/40 transition-colors text-sm">
                        <td className="py-4">
                          <button
                            type="button"
                            onClick={() => onSelectDetail(item.id)}
                            className="font-bold text-saas-dark hover:text-saas-primary hover:underline text-left transition-colors cursor-pointer"
                            title={`Lihat Profil ${item.nama}`}
                          >
                            {item.nama}
                          </button>
                          <p className="text-[11px] text-saas-muted font-medium mt-0.5">NIK: {item.nik}</p>
                        </td>
                        <td className="py-4">
                          {item.noHp ? (
                            <a
                              href={`https://wa.me/${waNumber}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg text-xs transition-colors border border-emerald-200/60"
                              title="Hubungi via WhatsApp"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              {item.noHp}
                            </a>
                          ) : (
                            <span className="text-xs text-saas-muted font-medium">-</span>
                          )}
                        </td>
                        <td className="py-4 font-bold text-saas-dark">{isNaN(ageYears) ? 0 : ageYears} Tahun</td>
                        <td className="py-4 text-saas-muted font-semibold">{item.rtRw}</td>
                        <td className="py-4">
                          <div className="flex gap-1.5">
                            {item.riwayatHt && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-trend-dangerText">HT</span>
                            )}
                            {item.riwayatDm && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-600">DM</span>
                            )}
                            {!item.riwayatHt && !item.riwayatDm && (
                              <span className="text-xs text-saas-muted font-semibold">-</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              item.tingkatKemandirian === "A"
                                ? "bg-trend-successBg text-trend-successText"
                                : item.tingkatKemandirian === "B"
                                ? "bg-yellow-50 text-yellow-600"
                                : "bg-trend-dangerBg text-trend-dangerText"
                            }`}
                          >
                            Kategori {item.tingkatKemandirian}
                          </span>
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
                      Tidak ada data lansia yang cocok.
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
            onPageSizeChange={(newLimit) => {
              setLimit(newLimit);
              setCurrentPage(1);
            }}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </div>
      )}
    </div>
  );
}
