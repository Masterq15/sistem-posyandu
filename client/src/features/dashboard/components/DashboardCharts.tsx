"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { TrendingUp, Eye, ChevronRight, ChevronLeft, ArrowLeftRight } from "lucide-react";
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const checkScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  // Hitung domain maksimum untuk Sumbu Y Status Gizi
  const maxStatusValue = useMemo(() => {
    if (!trenGiziData || trenGiziData.length === 0) return 10;
    let max = 0;
    trenGiziData.forEach((d) => {
      const val = Math.max(
        Number(d.normal) || 0,
        Number(d.kurang) || 0,
        Number(d.sangatKurang) || 0,
        Number(d.stunting) || 0
      );
      if (val > max) max = val;
    });
    if (max <= 5) return 6;
    if (max <= 10) return 12;
    return Math.ceil((max * 1.15) / 5) * 5;
  }, [trenGiziData]);

  // Hitung lebar dinamis jika data banyak (misal > 7 bulan)
  const isScrollable = trenGiziData.length > 7;
  const dynamicChartWidth = isScrollable
    ? Math.max(700, trenGiziData.length * 68)
    : "100%";

  // Otomatis scroll ke kanan (bulan terbaru) saat data berubah
  useEffect(() => {
    if (scrollContainerRef.current && isScrollable) {
      const timer = setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
          checkScroll();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [trenGiziData, isScrollable, checkScroll]);

  // Tombol geser manual
  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const offset = 260;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -offset : offset,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 250);
    }
  };

  // Mouse Drag to Scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current || !isScrollable) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftState(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftState - walk;
    checkScroll();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Tren Status Gizi Balita (Recharts & WHO Z-Score) */}
      <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 lg:col-span-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
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

        {/* Keterangan Status Gizi / Z-Score (DIAM SAJA - Fixed di luar scroll area) */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-gray-50/90 border border-gray-100 rounded-xl mb-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
            {trenViewMode === "status" ? (
              <>
                <div className="flex items-center gap-1.5 font-medium text-gray-700">
                  <span className="w-3 h-3 rounded-xs bg-emerald-500 shrink-0"></span>
                  <span>Gizi Normal</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-gray-700">
                  <span className="w-3 h-3 rounded-xs bg-amber-500 shrink-0"></span>
                  <span>Gizi Kurang</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-gray-700">
                  <span className="w-3 h-3 rounded-xs bg-red-500 shrink-0"></span>
                  <span>Gizi Buruk</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-purple-900">
                  <span className="w-3.5 h-1 bg-purple-500 rounded-full shrink-0"></span>
                  <span>Stunting (TB/U)</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5 font-medium text-gray-700">
                  <span className="w-3.5 h-1 bg-sky-600 rounded-full shrink-0"></span>
                  <span>Rerata Z-Score BB/U</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-gray-700">
                  <span className="w-3.5 h-1 bg-emerald-500 rounded-full shrink-0"></span>
                  <span>Rerata Z-Score TB/U</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-500 border-l border-gray-200 pl-2.5">
                  <span className="w-2.5 border-b border-dashed border-emerald-500"></span>
                  <span>Median (0)</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-500">
                  <span className="w-2.5 border-b border-dashed border-red-500"></span>
                  <span>Stunting (-2)</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-500">
                  <span className="w-2.5 border-b border-dashed border-amber-500"></span>
                  <span>Lebih (+2)</span>
                </div>
              </>
            )}
          </div>

          {/* Navigasi Scroll Tombol jika scrollable */}
          {isScrollable && (
            <div className="flex items-center gap-1 shrink-0 ml-auto">
              <span className="text-[10px] text-gray-400 mr-1 hidden sm:inline">Geser:</span>
              <button
                type="button"
                onClick={() => handleScroll("left")}
                disabled={!canScrollLeft}
                className="p-1 rounded-md border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs transition-colors cursor-pointer"
                title="Geser grafik ke kiri"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll("right")}
                disabled={!canScrollRight}
                className="p-1 rounded-md border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs transition-colors cursor-pointer"
                title="Geser grafik ke kanan"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Container Utama: Sumbu Y Tetap Diam (Kiri) + Grafik Bisa Digeser (Kanan) */}
        {isTrenGiziLoading ? (
          <div className="h-72 flex items-center justify-center text-sm text-saas-muted bg-gray-50/40 rounded-xl border border-gray-100">
            Memuat data grafik tren gizi...
          </div>
        ) : trenGiziData.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-sm text-saas-muted bg-gray-50/40 rounded-xl border border-gray-100">
            Belum ada data pemeriksaan balita untuk periode ini.
          </div>
        ) : (
          <div className="relative flex items-stretch border border-gray-100 rounded-xl bg-gray-50/30 overflow-hidden">
            {/* SUMBU Y (DIAM SAJA / FIXED DI KIRI) */}
            <div className="shrink-0 z-10 bg-white/95 backdrop-blur-xs border-r border-gray-200/80 pr-0.5 flex flex-col select-none shadow-[2px_0_6px_-2px_rgba(0,0,0,0.06)]">
              <div style={{ width: 44, height: 284 }}>
                {trenViewMode === "status" ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={trenGiziData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                      <YAxis
                        domain={[0, maxStatusValue]}
                        tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
                        allowDecimals={false}
                        width={38}
                      />
                      {/* Dummy XAxis agar tinggi plot area sama persis dengan chart utama */}
                      <XAxis dataKey="label" tick={false} axisLine={false} tickLine={false} height={24} />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trenGiziData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                      <YAxis
                        domain={[-4, 4]}
                        ticks={[-4, -2, 0, 2, 4]}
                        tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
                        width={38}
                      />
                      <XAxis dataKey="label" tick={false} axisLine={false} tickLine={false} height={24} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* AREA GRAFIK & SUMBU X (BISA DIGESER / SCROLLABLE HORIZONTAL) */}
            <div
              ref={scrollContainerRef}
              onScroll={checkScroll}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseLeaveOrUp}
              onMouseLeave={handleMouseLeaveOrUp}
              onMouseMove={handleMouseMove}
              className={`flex-1 min-w-0 overflow-x-auto overflow-y-hidden select-none transition-all ${
                isScrollable ? "cursor-grab active:cursor-grabbing" : ""
              }`}
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#cbd5e1 transparent",
              }}
            >
              <div
                style={{
                  width: typeof dynamicChartWidth === "number" ? `${dynamicChartWidth}px` : dynamicChartWidth,
                  height: "284px",
                  minWidth: isScrollable ? "650px" : "100%",
                }}
              >
                {trenViewMode === "status" ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={trenGiziData} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} interval={0} height={24} />
                      <YAxis domain={[0, maxStatusValue]} hide />
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
                      <Bar dataKey="normal" name="Gizi Normal" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="kurang" name="Gizi Kurang" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="sangatKurang" name="Gizi Buruk" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      <Line type="monotone" dataKey="stunting" name="Stunting (TB/U)" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trenGiziData} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} interval={0} height={24} />
                      <YAxis domain={[-4, 4]} hide />
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
                      <ReferenceLine y={0} label={{ value: "Median (0 SD)", fill: "#10b981", fontSize: 10 }} stroke="#10b981" strokeDasharray="4 4" />
                      <ReferenceLine y={-2} label={{ value: "Stunting/K (-2 SD)", fill: "#ef4444", fontSize: 10 }} stroke="#ef4444" strokeDasharray="4 4" />
                      <ReferenceLine y={2} label={{ value: "Lebih (+2 SD)", fill: "#f59e0b", fontSize: 10 }} stroke="#f59e0b" strokeDasharray="4 4" />
                      <Line type="monotone" dataKey="avgZScoreBBU" name="Rata-rata Z-Score BB/U" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="avgZScoreTBU" name="Rata-rata Z-Score TB/U" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Catatan bantuan geser di bawah jika data panjang */}
        {isScrollable && (
          <p className="text-[11px] text-saas-muted mt-2 text-right">
            💡 <em>Tip: Klik & geser grafik atau gunakan tombol panah untuk menjelajah data historis.</em>
          </p>
        )}
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
