"use client";

import React from "react";
import { Edit2, Trash2, User } from "lucide-react";
import ActionMenu from "@/components/ActionMenu";
import { SessionLog } from "../types";

export interface SessionLogsTableProps {
  sessionLogs: SessionLog[];
  activeTab: "Balita" | "Lansia";
  sessionPage: number;
  setSessionPage: React.Dispatch<React.SetStateAction<number>>;
  sessionLimit: number;
  setSessionLimit: (limit: number) => void;
  onEditLog: (log: SessionLog) => void;
  onDeleteLog: (log: SessionLog) => void;
  onNavigate?: (menu: string, patientId?: string) => void;
}

export default function SessionLogsTable({
  sessionLogs,
  activeTab,
  sessionPage,
  setSessionPage,
  sessionLimit,
  setSessionLimit,
  onEditLog,
  onDeleteLog,
  onNavigate,
}: SessionLogsTableProps) {
  const filteredSessionLogs = sessionLogs.filter((log) => log.tipe === activeTab);
  const totalSessionPages = Math.ceil(filteredSessionLogs.length / sessionLimit) || 1;
  const paginatedSessionLogs = filteredSessionLogs.slice(
    (sessionPage - 1) * sessionLimit,
    sessionPage * sessionLimit
  );

  return (
    <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-sm text-saas-dark">
              Catatan Pemeriksaan Periode Ini ({activeTab})
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
              {filteredSessionLogs.length} Pemeriksaan
            </span>
          </div>
          <p className="text-xs text-saas-muted mt-0.5">
            Daftar {activeTab.toLowerCase()} yang sudah selesai dimasukkan datanya dalam sesi pelayanan periode ini.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        {filteredSessionLogs.length > 0 ? (
          <>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-saas-muted uppercase tracking-wider">
                  <th className="pb-3">Nama</th>
                  <th className="pb-3">Kategori</th>
                  <th className="pb-3">Hasil Pengukuran</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Jam Input</th>
                  <th className="pb-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSessionLogs.map((log, idx) => (
                  <tr
                    key={log.id}
                    className="border-b border-gray-50 last:border-b-0 text-xs text-saas-dark hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-3.5 font-bold">{log.nama}</td>
                    <td className="py-3.5 text-saas-muted font-semibold">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          log.tipe === "Balita"
                            ? "bg-teal-50 text-saas-primary"
                            : "bg-indigo-50 text-indigo-600"
                        }`}
                      >
                        {log.tipe}
                      </span>
                    </td>
                    <td className="py-3.5 text-saas-muted font-semibold">{log.summary}</td>
                    <td className="py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold ${
                          log.status.includes("Normal")
                            ? "bg-trend-successBg text-trend-successText"
                            : "bg-trend-dangerBg text-trend-dangerText"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3.5 font-bold text-saas-muted">{log.waktu}</td>
                    <td className="py-3.5 text-right whitespace-nowrap">
                      <ActionMenu
                        alignDirection={idx < 2 ? "bottom" : "top"}
                        items={[
                          {
                            label: "Edit Record",
                            icon: <Edit2 className="w-4 h-4 text-amber-600" />,
                            onClick: () => onEditLog(log),
                          },
                          ...(onNavigate && log.pasienId
                            ? [
                                {
                                  label: `Profil ${log.tipe}`,
                                  icon: <User className="w-4 h-4 text-teal-600" />,
                                  onClick: () => onNavigate(log.tipe, log.pasienId),
                                },
                              ]
                            : []),
                          ...(log.pasienId
                            ? [
                                {
                                  label: "Hapus Record",
                                  icon: <Trash2 className="w-4 h-4 text-red-600" />,
                                  variant: "danger" as const,
                                  onClick: () => onDeleteLog(log),
                                },
                              ]
                            : []),
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-saas-muted font-medium">
              <div className="flex items-center gap-2">
                <span>Tampilkan</span>
                <select
                  value={sessionLimit}
                  onChange={(e) => {
                    setSessionLimit(Number(e.target.value));
                    setSessionPage(1);
                  }}
                  className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-md font-bold text-saas-dark focus:outline-none focus:border-saas-primary"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>data per halaman</span>
                <span className="ml-2 font-medium">
                  (Menampilkan{" "}
                  {filteredSessionLogs.length === 0 ? 0 : (sessionPage - 1) * sessionLimit + 1} -{" "}
                  {Math.min(sessionPage * sessionLimit, filteredSessionLogs.length)} dari{" "}
                  {filteredSessionLogs.length} data)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSessionPage((p) => Math.max(p - 1, 1))}
                  disabled={sessionPage === 1}
                  className="px-3 py-1.5 rounded-md border border-gray-200 font-bold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  Sebelumnya
                </button>
                <span className="px-3 py-1.5 font-bold text-saas-dark">
                  Halaman {sessionPage} dari {totalSessionPages || 1}
                </span>
                <button
                  type="button"
                  onClick={() => setSessionPage((p) => Math.min(p + 1, totalSessionPages))}
                  disabled={sessionPage >= totalSessionPages}
                  className="px-3 py-1.5 rounded-md border border-gray-200 font-bold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </>
        ) : (
          <p className="text-center text-xs text-saas-muted py-8 font-medium">
            Belum ada pemeriksaan yang dicatat dalam sesi periode ini.
          </p>
        )}
      </div>
    </div>
  );
}
