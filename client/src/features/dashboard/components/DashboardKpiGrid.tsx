"use client";

import React from "react";
import { ArrowRight, AlertCircle, AlertTriangle, CheckCircle2, Users } from "lucide-react";
import { DashboardSummary } from "@/lib/api";
import BalitaIcon from "@/components/BalitaIcon";
import LansiaIcon from "@/components/LansiaIcon";

export interface DashboardKpiGridProps {
  onNavigate: (menu: string, patientId?: string) => void;
  summary: DashboardSummary | null;
  isSummaryLoading: boolean;
  isRiwayatLoading: boolean;
  perluTindakLanjutBalita: number;
  perluFollowUpLansia: number;
}

export default function DashboardKpiGrid({
  onNavigate,
  summary,
  isSummaryLoading,
  isRiwayatLoading,
  perluTindakLanjutBalita,
  perluFollowUpLansia,
}: DashboardKpiGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Balita Terdaftar */}
      <div
        onClick={() => onNavigate("Balita")}
        className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-36 sm:h-40 transition-all hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer group"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Total Balita Terdaftar
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
              {isSummaryLoading ? "…" : `${summary?.totalBalita ?? 0}`}
            </h3>
            <span className="text-xs text-slate-600 dark:text-slate-400 block mt-0.5">
              Sasaran pemantauan gizi rutin
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 border border-teal-100 dark:border-teal-900">
            <BalitaIcon className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-teal-700 dark:text-teal-400 group-hover:text-teal-800 transition-colors">
          <span>Kelola data balita</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Card 2: Total Lansia Terdaftar */}
      <div
        onClick={() => onNavigate("Lansia")}
        className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-36 sm:h-40 transition-all hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer group"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Total Lansia Terdaftar
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
              {isSummaryLoading ? "…" : `${summary?.totalLansia ?? 0}`}
            </h3>
            <span className="text-xs text-slate-600 dark:text-slate-400 block mt-0.5">
              Sasaran skrining PTM berkala
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900">
            <LansiaIcon className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-blue-700 dark:text-blue-400 group-hover:text-blue-800 transition-colors">
          <span>Kelola data lansia</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Card 3: Balita Perlu Perhatian / Tindak Lanjut */}
      <div
        onClick={() => onNavigate("Balita")}
        className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-36 sm:h-40 transition-all hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer group"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Balita Perlu Perhatian
              </span>
              {perluTindakLanjutBalita > 0 ? (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300">
                  Prioritas
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                  Normal
                </span>
              )}
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
              {isRiwayatLoading ? "…" : `${perluTindakLanjutBalita} Anak`}
            </h3>
            <span className="text-xs text-slate-600 dark:text-slate-400 block mt-0.5 truncate max-w-[200px]">
              {perluTindakLanjutBalita > 0 ? "Gizi kurang, 2T, atau stunting" : "Semua status pertumbuhan baik"}
            </span>
          </div>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
              perluTindakLanjutBalita > 0
                ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900"
                : "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900"
            }`}
          >
            {perluTindakLanjutBalita > 0 ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
          <span>{perluTindakLanjutBalita > 0 ? "Buka daftar balita berisiko" : "Lihat pemantauan balita"}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Card 4: Lansia Berisiko PTM */}
      <div
        onClick={() => onNavigate("Lansia")}
        className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-36 sm:h-40 transition-all hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer group"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Lansia Berisiko PTM
              </span>
              {perluFollowUpLansia > 0 ? (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                  Follow-Up
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                  Terkontrol
                </span>
              )}
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
              {isRiwayatLoading ? "…" : `${perluFollowUpLansia} Jiwa`}
            </h3>
            <span className="text-xs text-slate-600 dark:text-slate-400 block mt-0.5 truncate max-w-[200px]">
              {perluFollowUpLansia > 0 ? "Hipertensi tk. 2 atau GDS tinggi" : "Kondisi tanda vital stabil"}
            </span>
          </div>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
              perluFollowUpLansia > 0
                ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900"
                : "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900"
            }`}
          >
            {perluFollowUpLansia > 0 ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
          <span>{perluFollowUpLansia > 0 ? "Buka temuan klinis lansia" : "Lihat skrining lansia"}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
}
