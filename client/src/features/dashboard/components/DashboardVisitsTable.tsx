"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DistribusiKehadiran } from "@/lib/api";
import { Kunjungan } from "../types";

export interface DashboardVisitsTableProps {
  onNavigate: (menu: string, patientId?: string) => void;
  activeTab: "Semua" | "Balita" | "Lansia";
  setActiveTab: (tab: "Semua" | "Balita" | "Lansia") => void;
  paginatedKunjungan: Kunjungan[];
  filteredKunjungan: Kunjungan[];
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage: number;
  totalPages: number;
  isDistribusiLoading: boolean;
  distribusiKehadiran: DistribusiKehadiran[];
  distribusiTab?: "Semua" | "Balita" | "Lansia";
  setDistribusiTab?: (tab: "Semua" | "Balita" | "Lansia") => void;
  onOpenDetailDistribusi?: () => void;
}

export default function DashboardVisitsTable({
  onNavigate,
  activeTab,
  setActiveTab,
  paginatedKunjungan,
  filteredKunjungan,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  totalPages,
  isDistribusiLoading,
  distribusiKehadiran,
  distribusiTab,
  setDistribusiTab,
  onOpenDetailDistribusi,
}: DashboardVisitsTableProps) {
  const [localDistribusiTab, setLocalDistribusiTab] = useState<"Semua" | "Balita" | "Lansia">("Semua");
  const currentTab = distribusiTab ?? localDistribusiTab;
  const setTab = setDistribusiTab ?? setLocalDistribusiTab;

  const filteredDistribusi = useMemo(() => {
    return (distribusiKehadiran || [])
      .map((row) => {
        if (currentTab === "Balita") {
          const bTotal = row.balita?.total ?? 0;
          const bHadir = row.balita?.hadir ?? 0;
          const bPersen = bTotal > 0 ? Math.round((bHadir / bTotal) * 100) : 0;
          return {
            rtRw: row.rtRw,
            total: bTotal,
            hadir: bHadir,
            persentase: bPersen,
            label: "Balita Hadir",
          };
        }
        if (currentTab === "Lansia") {
          const lTotal = row.lansia?.total ?? 0;
          const lHadir = row.lansia?.hadir ?? 0;
          const lPersen = lTotal > 0 ? Math.round((lHadir / lTotal) * 100) : 0;
          return {
            rtRw: row.rtRw,
            total: lTotal,
            hadir: lHadir,
            persentase: lPersen,
            label: "Lansia Hadir",
          };
        }
        return {
          rtRw: row.rtRw,
          total: row.total,
          hadir: row.hadir,
          persentase: isNaN(Number(row.persentase)) ? 0 : Number(row.persentase),
          label: "Warga Hadir",
        };
      })
      .sort((a, b) => {
        if (a.total > 0 && b.total === 0) return -1;
        if (a.total === 0 && b.total > 0) return 1;
        return b.persentase - a.persentase;
      });
  }, [distribusiKehadiran, currentTab]);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Kunjungan Terakhir Table */}
      <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 lg:col-span-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
          <div>
            <h3 className="font-bold text-base text-saas-dark flex items-center gap-2">
              Riwayat Antrean &amp; Kunjungan Terkini
            </h3>
            <p className="text-xs text-saas-muted mt-0.5">Umpan aktivitas pemeriksaan pelayanan posyandu terbaru</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate("Riwayat")}
              className="text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100/70 border border-teal-200/60 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 shrink-0 cursor-pointer"
              title="Buka Halaman Riwayat Lengkap"
            >
              Lihat Semua di Riwayat &rarr;
            </button>

            <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-1 border border-gray-100/50">
              {(["Semua", "Balita", "Lansia"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs px-3.5 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                    activeTab === tab 
                      ? "bg-white text-saas-primary shadow-sm" 
                      : "text-saas-muted hover:text-saas-dark"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold text-saas-muted uppercase tracking-wider">
                <th className="px-4 pb-3 text-left whitespace-nowrap">Nama</th>
                <th className="px-4 pb-3 text-left whitespace-nowrap">Kategori</th>
                <th className="px-4 pb-3 text-left whitespace-nowrap">Keterangan</th>
                <th className="px-4 pb-3 text-right whitespace-nowrap">Jam &amp; Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {paginatedKunjungan.length > 0 ? (
                paginatedKunjungan.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/40 transition-colors text-sm">
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          const realId = item.id.replace(/^(b-|l-)/, '');
                          onNavigate(item.tipe === "Balita" ? "Balita" : "Lansia", realId);
                        }}
                        className="font-bold text-saas-dark hover:text-saas-primary hover:underline transition-colors text-left cursor-pointer"
                        title={`Lihat Profil ${item.nama}`}
                      >
                        {item.nama}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-saas-muted font-medium whitespace-nowrap">{item.tipe}</td>
                    <td className="px-4 py-3.5 text-saas-muted font-medium whitespace-nowrap">{item.detail}</td>
                    <td className="px-4 py-3.5 text-right text-saas-muted font-semibold whitespace-nowrap">{item.waktu}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-saas-muted font-medium">
                    Tidak menemukan data kunjungan yang cocok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredKunjungan.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 mt-4 text-xs">
            <p className="text-saas-muted font-semibold">
              Menampilkan{" "}
              <span className="text-saas-dark font-bold">
                {Math.min((currentPage - 1) * itemsPerPage + 1, filteredKunjungan.length)}
              </span>{" "}
              -{" "}
              <span className="text-saas-dark font-bold">
                {Math.min(currentPage * itemsPerPage, filteredKunjungan.length)}
              </span>{" "}
              dari <span className="text-saas-dark font-bold">{filteredKunjungan.length}</span> data
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 text-saas-dark hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentPage === page
                      ? "bg-saas-primary text-white shadow-sm"
                      : "text-saas-muted hover:text-saas-dark hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 text-saas-dark hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Halaman Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Distribusi RT/RW */}
      <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h3 className="font-bold text-base text-saas-dark">Distribusi Kehadiran RT/RW</h3>
              <p className="text-xs text-saas-muted mt-0.5">Tingkat kehadiran per wilayah</p>
            </div>

            <div className="shrink-0 self-start sm:self-auto flex items-center gap-1.5">
              <select
                value={currentTab}
                onChange={(e) => setTab(e.target.value as "Semua" | "Balita" | "Lansia")}
                className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-saas-dark hover:bg-gray-100/70 transition-colors focus:outline-none focus:border-saas-primary cursor-pointer"
                title="Filter Kategori Kehadiran"
              >
                <option value="Semua">Semua</option>
                <option value="Balita">Balita</option>
                <option value="Lansia">Lansia</option>
              </select>
            </div>
          </div>

          <div className="space-y-5">
            {isDistribusiLoading ? (
              <div className="flex items-center justify-center py-8 text-xs text-saas-muted">
                Memuat data distribusi kehadiran...
              </div>
            ) : filteredDistribusi.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-xs text-saas-muted">
                Belum ada data kehadiran tersedia.
              </div>
            ) : (
              filteredDistribusi.slice(0, 6).map((row, i) => {
                const persentase = isNaN(Number(row.persentase)) ? 0 : Number(row.persentase);
                let color = "bg-saas-primary";
                if (row.total === 0) color = "bg-gray-300";
                else if (persentase < 30) color = "bg-red-400";
                else if (persentase < 50) color = "bg-yellow-400";
                else if (persentase < 70) color = "bg-indigo-500";
                else if (persentase < 85) color = "bg-green-500";

                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-saas-dark font-bold">{row.rtRw}</span>
                      <span className="text-saas-dark font-bold">{persentase}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200/40">
                        <div
                          style={{ width: `${persentase}%` }}
                          className={`h-full rounded-full ${color}`}
                        ></div>
                      </div>
                      <span className="text-[10px] text-saas-dark font-semibold whitespace-nowrap">
                        {row.hadir}/{row.total} {row.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {onOpenDetailDistribusi && (
          <div className="pt-4 mt-4 border-t border-gray-100 flex justify-end">
            <button
              type="button"
              onClick={onOpenDetailDistribusi}
              className="text-xs font-bold text-saas-primary hover:underline cursor-pointer"
            >
              Lihat Detail ({filteredDistribusi.length} RT/RW) →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
