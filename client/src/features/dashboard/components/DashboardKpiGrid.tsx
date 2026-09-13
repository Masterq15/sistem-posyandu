"use client";

import React from "react";
import { ArrowUpRight, AlertCircle, AlertTriangle } from "lucide-react";
import { DashboardSummary } from "@/lib/api";

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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      {/* Card 1: Toska / Mint (Total Balita) */}
      <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-card p-3.5 sm:p-6 relative overflow-hidden flex flex-col justify-between h-36 sm:h-44 shadow-soft-card group text-white">
        <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
        <button 
          type="button"
          onClick={() => onNavigate("Balita")}
          className="absolute top-3 right-3 sm:top-5 sm:right-5 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/30 transition-colors z-10 cursor-pointer"
        >
          <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        </button>
        
        <div>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-white/80 font-medium">Total Balita</span>
          <h3 className="text-2xl sm:text-3xl font-mono font-medium mt-0.5 sm:mt-1">
            {isSummaryLoading ? "…" : `${summary?.totalBalita ?? 0}`}
          </h3>
          <span className="text-[11px] sm:text-xs text-white/70 font-sans block">Anak Terdaftar</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-medium text-white/90 z-10">
          <span className="px-2 py-0.5 rounded-pill bg-white/20 text-white text-[9px] sm:text-[10px] font-mono">LIVE</span>
          <span className="hidden sm:inline">Update Hari Ini</span>
        </div>
      </div>

      {/* Card 2: Royal Blue / Indigo (Total Lansia) */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-card p-3.5 sm:p-6 relative overflow-hidden flex flex-col justify-between h-36 sm:h-44 shadow-soft-card group text-white">
        <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
        <button 
          type="button"
          onClick={() => onNavigate("Lansia")}
          className="absolute top-3 right-3 sm:top-5 sm:right-5 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/30 transition-colors z-10 cursor-pointer"
        >
          <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        </button>

        <div>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-white/80 font-medium">Total Lansia</span>
          <h3 className="text-2xl sm:text-3xl font-mono font-medium mt-0.5 sm:mt-1">
            {isSummaryLoading ? "…" : `${summary?.totalLansia ?? 0}`}
          </h3>
          <span className="text-[11px] sm:text-xs text-white/70 font-sans block">Jiwa Terdaftar</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-medium text-white/90 z-10">
          <span className="px-2 py-0.5 rounded-pill bg-white/20 text-white text-[9px] sm:text-[10px] font-mono">TERPANTAU</span>
          <span className="hidden sm:inline">Pemeriksaan Rutin</span>
        </div>
      </div>

      {/* Card 3: Rose / Crimson (Balita Perlu Tindak Lanjut) */}
      <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-card p-3.5 sm:p-6 relative overflow-hidden flex flex-col justify-between h-36 sm:h-44 shadow-soft-card group text-white">
        <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
        <button 
          type="button"
          onClick={() => onNavigate("Balita")}
          title="Lihat Data Balita"
          className="absolute top-3 right-3 sm:top-5 sm:right-5 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/30 transition-colors z-10 cursor-pointer"
        >
          <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        </button>

        <div>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-white/80 font-medium">Perlu Tindak Lanjut</span>
          <h3 className="text-2xl sm:text-3xl font-mono font-medium mt-0.5 sm:mt-1">
            {isRiwayatLoading ? "…" : `${perluTindakLanjutBalita} Anak`}
          </h3>
          <span className="text-[11px] sm:text-xs text-white/70 font-sans block truncate">Prioritas Pantauan Kader</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-medium text-white/90 z-10">
          <span className="px-2 py-0.5 rounded-pill bg-white/20 text-white text-[9px] sm:text-[10px] font-mono">
            {perluTindakLanjutBalita > 0 ? "PRIORITAS" : "AMAN"}
          </span>
          <span className="hidden sm:inline">
            {perluTindakLanjutBalita > 0 ? "Pantauan Balita" : "Kondisi Terkendali"}
          </span>
        </div>
      </div>

      {/* Card 4: Slate Dark (Lansia Perlu Follow-Up) */}
      <div className="bg-gradient-to-br from-slate-900 to-surface-dark rounded-card p-3.5 sm:p-6 relative overflow-hidden flex flex-col justify-between h-36 sm:h-44 shadow-elevated group text-white border border-white/10">
        <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-amber-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
        <button 
          type="button"
          onClick={() => onNavigate("Lansia")}
          title="Lihat Data Lansia"
          className="absolute top-3 right-3 sm:top-5 sm:right-5 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors z-10 cursor-pointer"
        >
          <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
        </button>

        <div>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-saas-muted-soft font-medium">Perlu Follow-Up</span>
          <h3 className="text-2xl sm:text-3xl font-mono font-medium mt-0.5 sm:mt-1 text-white">
            {isRiwayatLoading ? "…" : `${perluFollowUpLansia} Lansia`}
          </h3>
          <span className="text-[11px] sm:text-xs text-saas-muted-soft font-sans block truncate">Temuan Berisiko Klinis</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-medium text-amber-300 z-10">
          <span className="px-2 py-0.5 rounded-pill bg-amber-500/20 text-amber-300 text-[9px] sm:text-[10px] font-mono font-semibold">
            {perluFollowUpLansia > 0 ? "FOLLOW-UP" : "STABIL"}
          </span>
          <span className="hidden sm:inline text-saas-muted-soft">
            {perluFollowUpLansia > 0 ? "Temuan Klinis" : "Kondisi Terpantau"}
          </span>
        </div>
      </div>
    </div>
  );
}
