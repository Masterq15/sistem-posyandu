"use client";

import React from "react";
import { TrendingUp, Eye, ChevronRight } from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";
import { TrenGiziItem, AktivitasKunjunganData } from "@/lib/api";

export interface DashboardChartsProps {
  trenPeriod: "bulanan" | "tahunan";
  setTrenPeriod: (p: "bulanan" | "tahunan") => void;
  trenViewMode: "status" | "zscore";
  setTrenViewMode: (m: "status" | "zscore") => void;
  isTrenGiziLoading: boolean;
  trenGiziData: TrenGiziItem[];
  isAktivitasLoading: boolean;
  aktivitasData: AktivitasKunjunganData | null;
  onOpenDetailAktivitas: (tab?: "balita" | "lansia" | "belum_balita" | "belum_lansia") => void;
}

export default function DashboardCharts({
  trenPeriod,
  setTrenPeriod,
  trenViewMode,
  setTrenViewMode,
  isTrenGiziLoading,
  trenGiziData,
  isAktivitasLoading,
  aktivitasData,
  onOpenDetailAktivitas,
}: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Tren Status Gizi Balita (Recharts & WHO Z-Score) */}
      <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="font-bold text-base text-saas-dark flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-saas-primary" />
              Tren Status Gizi & Z-Score Balita
            </h3>
            <p className="text-xs text-saas-muted mt-0.5">
              Agregasi data historis {trenPeriod === "bulanan" ? "bulanan" : "tahunan"} & kurva presisi Z-score WHO
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Toggle Mode Display */}
            <div className="flex items-center gap-1 bg-gray-100/80 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setTrenViewMode("status")}
                className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  trenViewMode === "status"
                    ? "bg-white text-saas-dark shadow-sm"
                    : "text-saas-muted hover:text-saas-dark"
                }`}
              >
                Status Gizi
              </button>
              <button
                type="button"
                onClick={() => setTrenViewMode("zscore")}
                className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  trenViewMode === "zscore"
                    ? "bg-white text-saas-dark shadow-sm"
                    : "text-saas-muted hover:text-saas-dark"
                }`}
              >
                Kurva Z-Score WHO
              </button>
            </div>

            {/* Toggle Period */}
            <div className="flex items-center gap-1 bg-gray-100/80 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setTrenPeriod("bulanan")}
                className={`text-xs px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                  trenPeriod === "bulanan"
                    ? "bg-saas-primary text-white shadow-sm"
                    : "text-saas-muted hover:text-saas-dark"
                }`}
              >
                Bulanan
              </button>
              <button
                type="button"
                onClick={() => setTrenPeriod("tahunan")}
                className={`text-xs px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                  trenPeriod === "tahunan"
                    ? "bg-saas-primary text-white shadow-sm"
                    : "text-saas-muted hover:text-saas-dark"
                }`}
              >
                Tahunan
              </button>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          {isTrenGiziLoading ? (
            <div className="h-full flex items-center justify-center text-sm text-saas-muted">
              Memuat data grafik tren gizi...
            </div>
          ) : trenGiziData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-saas-muted">
              Belum ada data pemeriksaan balita untuk periode ini.
            </div>
          ) : trenViewMode === "status" ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trenGiziData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)", fontSize: "12px" }}
                  formatter={(value: any, name: any) => [
                    value,
                    name === "normal"
                      ? "Gizi Normal (BB/U)"
                      : name === "kurang"
                      ? "Gizi Kurang (BB/U)"
                      : name === "sangatKurang"
                      ? "Gizi Buruk/SK (BB/U)"
                      : name === "stunting"
                      ? "Stunting (TB/U)"
                      : String(name || ""),
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Bar dataKey="normal" name="Gizi Normal" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="kurang" name="Gizi Kurang" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sangatKurang" name="Gizi Buruk" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="stunting" name="Stunting (TB/U)" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trenGiziData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis domain={[-4, 4]} tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)", fontSize: "12px" }}
                  formatter={(val: any, name: any) => [
                    `${val} SD`,
                    name === "avgZScoreBBU"
                      ? "Rata-rata Z-Score BB/U"
                      : name === "avgZScoreTBU"
                      ? "Rata-rata Z-Score TB/U"
                      : String(name || ""),
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <ReferenceLine y={0} label={{ value: "Median WHO (0 SD)", fill: "#10b981", fontSize: 10 }} stroke="#10b981" strokeDasharray="4 4" />
                <ReferenceLine y={-2} label={{ value: "Batas Stunting/K (-2 SD)", fill: "#ef4444", fontSize: 10 }} stroke="#ef4444" strokeDasharray="4 4" />
                <ReferenceLine y={2} label={{ value: "Batas Lebih (+2 SD)", fill: "#f59e0b", fontSize: 10 }} stroke="#f59e0b" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="avgZScoreBBU" name="Rata-rata Z-Score BB/U" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="avgZScoreTBU" name="Rata-rata Z-Score TB/U" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Aktivitas Kunjungan (Donut Chart) */}
      <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-base text-saas-dark">Aktivitas Kunjungan</h3>
            <p className="text-xs text-saas-muted mt-0.5">Tingkat partisipasi kader &amp; posyandu</p>
          </div>
          <button
            type="button"
            onClick={() => onOpenDetailAktivitas()}
            className="p-1.5 hover:bg-gray-100 text-saas-muted hover:text-saas-dark rounded-lg transition-colors cursor-pointer"
            title="Lihat Detail Aktivitas"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {isAktivitasLoading ? (
          <div className="py-12 text-center text-xs text-saas-muted">Memuat data aktivitas...</div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#F3F4F6"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#14B8A6"
                  strokeWidth="10"
                  strokeDasharray="251.2"
                  strokeDashoffset={
                    251.2 - (251.2 * (isNaN(Number(aktivitasData?.persentaseSelesai)) ? 0 : Number(aktivitasData?.persentaseSelesai || 0))) / 100
                  }
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center text-center">
                <span className="text-2xl font-black text-saas-dark leading-none">
                  {isNaN(Number(aktivitasData?.persentaseSelesai)) ? 0 : Number(aktivitasData?.persentaseSelesai || 0)}%
                </span>
                <span className="text-[10px] text-saas-muted font-bold uppercase tracking-wider mt-1">Selesai</span>
              </div>
            </div>

            <div className="w-full space-y-2 mt-6">
              {[
                {
                  key: "balita" as const,
                  label: "Balita Selesai Periksa",
                  count: `${aktivitasData?.balitaSelesaiCount ?? 0} Anak`,
                  color: "bg-sky-500",
                },
                {
                  key: "lansia" as const,
                  label: "Lansia Selesai Periksa",
                  count: `${aktivitasData?.lansiaSelesaiCount ?? 0} Lansia`,
                  color: "bg-emerald-500",
                },
                {
                  key: "belum_balita" as const,
                  label: "Balita Belum Periksa",
                  count: `${(aktivitasData?.belumMengisiList ?? []).filter(i => i.tipe === 'Balita').length} Anak`,
                  color: "bg-amber-400",
                },
                {
                  key: "belum_lansia" as const,
                  label: "Lansia Belum Periksa",
                  count: `${(aktivitasData?.belumMengisiList ?? []).filter(i => i.tipe === 'Lansia').length} Lansia`,
                  color: "bg-orange-400",
                },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onOpenDetailAktivitas(item.key)}
                  className="w-full flex items-center justify-between text-xs border-b border-gray-50 pb-2.5 pt-1.5 hover:bg-gray-50/80 px-2 rounded-lg transition-colors group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
                    <span className="text-saas-muted group-hover:text-saas-dark font-semibold transition-colors">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-saas-dark">{item.count}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-saas-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
