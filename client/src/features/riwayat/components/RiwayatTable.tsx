"use client";

import React from "react";
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Eye,
  Edit2,
  Trash2,
} from "lucide-react";
import ActionMenu from "@/components/ActionMenu";
import BalitaIcon from "@/components/BalitaIcon";
import LansiaIcon from "@/components/LansiaIcon";
import { RiwayatTableSkeleton } from "@/components/Skeleton";
import { ItemRiwayat } from "@/lib/api";
import { SearchIndex } from "@/lib/searchIndex";

export interface RiwayatTableProps {
  loading: boolean;
  logs: ItemRiwayat[];
  query: string;
  riwayatIndexRef: React.MutableRefObject<SearchIndex<ItemRiwayat>>;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage: number;
  setItemsPerPage: (n: number) => void;
  formatTanggalIndonesia: (dateStr: string) => string;
  onNavigate?: (module: string, itemId?: string) => void;
  openDetailModal: (log: ItemRiwayat) => void;
  openEditModal: (log: ItemRiwayat) => void;
  openDeleteModal: (log: ItemRiwayat) => void;
}

export default function RiwayatTable({
  loading,
  logs,
  query,
  riwayatIndexRef,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  setItemsPerPage,
  formatTanggalIndonesia,
  onNavigate,
  openDetailModal,
  openEditModal,
  openDeleteModal,
}: RiwayatTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-4 sm:p-6 overflow-hidden">
        <RiwayatTableSkeleton rows={7} />
      </div>
    );
  }

  const filteredLogs = query.trim()
    ? riwayatIndexRef.current.search(query)
    : logs;

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-4 sm:p-6 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-bold text-saas-muted uppercase tracking-wider">
              <th className="pb-3 px-3 whitespace-nowrap">Tanggal Periksa</th>
              <th className="pb-3 px-3 whitespace-nowrap">Nama Lengkap</th>
              <th className="pb-3 px-3 whitespace-nowrap">Kategori</th>
              <th className="pb-3 px-3 whitespace-nowrap">Parameter Fisik &amp; Medis</th>
              <th className="pb-3 px-3 whitespace-nowrap">Kondisi Hasil</th>
              <th className="pb-3 px-3 whitespace-nowrap">Petugas</th>
              <th className="pb-3 px-3 text-right whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.length > 0 ? (
              paginatedLogs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/40 transition-colors text-sm"
                >
                  <td className="py-4 px-3 font-bold text-saas-dark whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-saas-muted shrink-0" />
                      {formatTanggalIndonesia(log.tanggal)}
                    </div>
                  </td>
                  <td className="py-4 px-3 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigate && log.pasienId) {
                          onNavigate(log.tipe, log.pasienId);
                        } else {
                          openDetailModal(log);
                        }
                      }}
                      className="font-extrabold text-saas-dark hover:text-saas-primary text-left transition-colors cursor-pointer hover:underline"
                      title={`Lihat Profil ${log.nama}`}
                    >
                      {log.nama}
                    </button>
                  </td>
                  <td className="py-4 px-3 font-semibold text-saas-muted whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {log.tipe === "Balita" ? (
                        <BalitaIcon className="w-3.5 h-3.5 text-saas-primary shrink-0" />
                      ) : (
                        <LansiaIcon className="w-3.5 h-3.5 shrink-0" />
                      )}
                      {log.tipe}
                    </div>
                  </td>
                  <td className="py-4 px-3 text-xs font-semibold text-saas-dark/95 leading-normal max-w-xs truncate whitespace-nowrap">
                    {log.parameter}
                  </td>
                  <td className="py-4 px-3 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                        log.statusType === "success"
                          ? "bg-trend-successBg text-trend-successText"
                          : log.statusType === "warning"
                          ? "bg-trend-dangerBg text-trend-dangerText"
                          : "bg-blue-50 text-saas-primary"
                      }`}
                    >
                      {log.statusType === "success" && (
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                      )}
                      {log.statusType === "warning" && (
                        <AlertCircle className="w-3 h-3 shrink-0" />
                      )}
                      {log.statusType === "info" && (
                        <Clock className="w-3 h-3 shrink-0" />
                      )}
                      {log.status}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-xs text-saas-muted font-bold whitespace-nowrap">
                    {log.petugas}
                  </td>
                  <td className="py-4 px-3 text-right whitespace-nowrap">
                    <ActionMenu
                      items={[
                        ...(onNavigate && log.pasienId
                          ? [
                              {
                                label: `Lihat Profil ${log.tipe}`,
                                icon: <User className="w-4 h-4" />,
                                onClick: () => onNavigate(log.tipe, log.pasienId),
                              },
                            ]
                          : []),
                        {
                          label: "Grafik & Detail",
                          icon: <Eye className="w-4 h-4" />,
                          onClick: () => openDetailModal(log),
                        },
                        {
                          label: "Edit Record",
                          icon: <Edit2 className="w-4 h-4" />,
                          onClick: () => openEditModal(log),
                        },
                        {
                          label: "Hapus Record",
                          icon: <Trash2 className="w-4 h-4" />,
                          variant: "danger",
                          onClick: () => openDeleteModal(log),
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-xs text-saas-muted font-medium whitespace-nowrap"
                >
                  Tidak ada catatan riwayat pemeriksaan yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {filteredLogs.length > 0 && (
          <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-saas-muted font-medium">
            <div className="flex items-center gap-2">
              <span>Tampilkan</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-md font-bold text-saas-dark focus:outline-none focus:border-saas-primary cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>data per halaman</span>
              <span className="ml-2 font-medium">
                (Menampilkan{" "}
                {filteredLogs.length === 0
                  ? 0
                  : (currentPage - 1) * itemsPerPage + 1}{" "}
                - {Math.min(currentPage * itemsPerPage, filteredLogs.length)} dari{" "}
                {filteredLogs.length} data)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-md border border-gray-200 font-bold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Sebelumnya
              </button>
              <span className="px-3 py-1.5 font-bold text-saas-dark">
                Halaman {currentPage} dari {totalPages || 1}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 rounded-md border border-gray-200 font-bold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
