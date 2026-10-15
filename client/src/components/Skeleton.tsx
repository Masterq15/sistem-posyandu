import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
}

export function Skeleton({
  className = "",
  variant = "rounded",
  width,
  height,
  style,
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-gray-200/80 dark:bg-gray-700/50";
  
  let variantClasses = "";
  switch (variant) {
    case "circular":
      variantClasses = "rounded-full";
      break;
    case "rectangular":
      variantClasses = "rounded-none";
      break;
    case "text":
      variantClasses = "rounded h-4 w-full";
      break;
    case "rounded":
    default:
      variantClasses = "rounded-xl";
      break;
  }

  const computedStyle: React.CSSProperties = {
    width: width !== undefined ? width : undefined,
    height: height !== undefined ? height : undefined,
    ...style,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses} ${className}`}
      style={computedStyle}
    />
  );
}

// ── Card Skeleton Component (General Statistic / Metric KPI Card) ──
export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-white rounded-card p-6 border border-hairline/60 shadow-soft-card flex flex-col justify-between h-44 relative overflow-hidden ${className}`}>
      {/* Background Pulse Accent */}
      <div className="flex items-center justify-between w-full">
        <Skeleton variant="rounded" className="h-4 w-28" />
        <Skeleton variant="circular" className="w-9 h-9" />
      </div>

      <div className="space-y-2 my-auto">
        <Skeleton variant="rounded" className="h-8 w-24" />
        <Skeleton variant="rounded" className="h-3 w-32" />
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-gray-100/80">
        <Skeleton variant="rounded" className="h-5 w-16 rounded-md" />
        <Skeleton variant="rounded" className="h-3 w-28" />
      </div>
    </div>
  );
}

// ── Dashboard Grid Skeleton ──
export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-hairline pb-6">
        <div className="space-y-2">
          <Skeleton variant="rounded" className="h-4 w-32 rounded-md" />
          <Skeleton variant="rounded" className="h-8 w-64" />
          <Skeleton variant="rounded" className="h-4 w-80" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton variant="rounded" className="h-10 w-36 rounded-lg" />
          <Skeleton variant="rounded" className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      {/* KPI 4 Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Action / Chart Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-card p-6 border border-hairline/60 shadow-soft-card space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton variant="rounded" className="h-5 w-48" />
              <Skeleton variant="rounded" className="h-3.5 w-64" />
            </div>
            <Skeleton variant="rounded" className="h-9 w-28 rounded-xl" />
          </div>
          {/* Chart placeholder */}
          <div className="h-64 bg-gray-50/50 rounded-2xl p-4 flex items-end justify-between gap-3 border border-dashed border-gray-200/80">
            {[40, 65, 30, 85, 55, 90, 70, 45, 60, 75, 50, 80].map((h, i) => (
              <div key={i} className="w-full flex flex-col items-center gap-2 h-full justify-end">
                <Skeleton variant="rounded" className="w-full rounded-t-lg" style={{ height: `${h}%` }} />
                <Skeleton variant="rounded" className="h-3 w-6" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-card p-6 border border-hairline/60 shadow-soft-card space-y-5">
          <Skeleton variant="rounded" className="h-5 w-40" />
          <Skeleton variant="rounded" className="h-3.5 w-52" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 bg-gray-50/80 rounded-xl flex items-center gap-3 border border-gray-100">
                <Skeleton variant="circular" className="w-10 h-10 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton variant="rounded" className="h-3.5 w-28" />
                  <Skeleton variant="rounded" className="h-2.5 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <TableSkeleton rows={5} columns={5} />
    </div>
  );
}

// ── Table Skeleton Component (Used in Balita, Lansia, Riwayat, Dashboard) ──
export function TableSkeleton({
  rows = 5,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="bg-white rounded-card border border-hairline/60 p-6 shadow-soft-card space-y-4">
      {/* Table Top Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100">
        <div className="space-y-1">
          <Skeleton variant="rounded" className="h-5 w-44" />
          <Skeleton variant="rounded" className="h-3.5 w-60" />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Skeleton variant="rounded" className="h-10 w-full sm:w-64 rounded-input" />
          <Skeleton variant="rounded" className="h-10 w-24 rounded-lg" />
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="pb-3 px-4">
                  <Skeleton variant="rounded" className="h-3.5 w-24" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="py-4 px-4">
                    {colIndex === 0 ? (
                      <div className="flex items-center gap-3">
                        <Skeleton variant="circular" className="w-9 h-9 shrink-0" />
                        <div className="space-y-1.5">
                          <Skeleton variant="rounded" className="h-3.5 w-32" />
                          <Skeleton variant="rounded" className="h-2.5 w-20" />
                        </div>
                      </div>
                    ) : colIndex === columns - 1 ? (
                      <div className="flex justify-end gap-2">
                        <Skeleton variant="rounded" className="h-8 w-20 rounded-lg" />
                      </div>
                    ) : (
                      <Skeleton
                        variant="rounded"
                        className={`h-3.5 ${colIndex % 2 === 0 ? "w-24" : "w-16"}`}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Profile / Detail View Skeleton ──
export function DetailViewSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <Skeleton variant="rounded" className="h-9 w-28 rounded-lg" />
        <Skeleton variant="rounded" className="h-9 w-32 rounded-lg" />
      </div>

      {/* Main Info Card */}
      <div className="bg-white rounded-card p-6 border border-hairline/60 shadow-soft-card flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton variant="circular" className="w-16 h-16 shrink-0" />
          <div className="space-y-2">
            <Skeleton variant="rounded" className="h-6 w-48" />
            <Skeleton variant="rounded" className="h-4 w-64" />
            <div className="flex gap-2 pt-1">
              <Skeleton variant="rounded" className="h-5 w-20 rounded-md" />
              <Skeleton variant="rounded" className="h-5 w-24 rounded-md" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Skeleton variant="rounded" className="h-10 w-32 rounded-lg" />
          <Skeleton variant="rounded" className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      {/* Tabs & Content */}
      <div className="space-y-4">
        <div className="flex gap-2 border-b border-gray-100 pb-2">
          <Skeleton variant="rounded" className="h-8 w-28 rounded-lg" />
          <Skeleton variant="rounded" className="h-8 w-28 rounded-lg" />
          <Skeleton variant="rounded" className="h-8 w-28 rounded-lg" />
        </div>
        <TableSkeleton rows={4} columns={6} />
      </div>
    </div>
  );
}

// ── Pelayanan (Pencatatan Pelayanan Balita & Lansia) Skeleton ──
export function PelayananSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Switch Tab Skeleton */}
      <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton variant="rounded" className="h-4 w-28 rounded-full" />
          <Skeleton variant="rounded" className="h-7 w-72" />
          <Skeleton variant="rounded" className="h-3.5 w-96 max-w-full" />
        </div>
        <div className="flex items-center flex-wrap gap-3">
          <Skeleton variant="rounded" className="h-10 w-48 rounded-xl" />
          <Skeleton variant="rounded" className="h-10 w-36 rounded-input" />
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Patient List */}
        <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 flex flex-col h-[600px] space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Skeleton variant="rounded" className="h-4 w-24" />
              <Skeleton variant="rounded" className="h-4 w-16 rounded-full" />
            </div>
            <Skeleton variant="rounded" className="h-3 w-52" />
          </div>

          <Skeleton variant="rounded" className="h-10 w-full rounded-input" />

          <div className="space-y-2.5 pt-2 flex-1 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-3 border border-gray-100 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton variant="rounded" className="w-8 h-8 rounded-lg shrink-0" />
                  <div className="space-y-1.5">
                    <Skeleton variant="rounded" className="h-3.5 w-28" />
                    <Skeleton variant="rounded" className="h-2.5 w-20" />
                  </div>
                </div>
                <Skeleton variant="rounded" className="w-4 h-4 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Form Area */}
        <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 lg:col-span-2 h-[600px] flex flex-col justify-between">
          <div className="space-y-4">
            {/* Selected Patient Banner Skeleton */}
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton variant="rounded" className="h-3 w-24" />
                <Skeleton variant="rounded" className="h-3 w-16" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton variant="rounded" className="w-8 h-8 rounded-lg shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton variant="rounded" className="h-4 w-44" />
                  <Skeleton variant="rounded" className="h-3 w-64 max-w-full" />
                </div>
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <Skeleton variant="rounded" className="h-3 w-24" />
                <Skeleton variant="rounded" className="h-10 w-full rounded-input" />
              </div>
              <div className="space-y-1.5">
                <Skeleton variant="rounded" className="h-3 w-28" />
                <Skeleton variant="rounded" className="h-10 w-full rounded-input" />
              </div>
              <div className="space-y-1.5">
                <Skeleton variant="rounded" className="h-3 w-28" />
                <Skeleton variant="rounded" className="h-10 w-full rounded-input" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
              <div className="space-y-1.5">
                <Skeleton variant="rounded" className="h-3 w-28" />
                <Skeleton variant="rounded" className="h-10 w-full rounded-input" />
              </div>
              <div className="space-y-1.5">
                <Skeleton variant="rounded" className="h-3 w-28" />
                <Skeleton variant="rounded" className="h-10 w-full rounded-input" />
              </div>
              <div className="space-y-1.5">
                <Skeleton variant="rounded" className="h-3 w-20" />
                <Skeleton variant="rounded" className="h-10 w-full rounded-input" />
              </div>
              <div className="space-y-1.5">
                <Skeleton variant="rounded" className="h-3 w-20" />
                <Skeleton variant="rounded" className="h-10 w-full rounded-input" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <Skeleton variant="rounded" className="h-3 w-28" />
                <Skeleton variant="rounded" className="h-10 w-full rounded-input" />
              </div>
              <div className="space-y-1.5">
                <Skeleton variant="rounded" className="h-3 w-28" />
                <Skeleton variant="rounded" className="h-10 w-full rounded-input" />
              </div>
              <div className="space-y-1.5">
                <Skeleton variant="rounded" className="h-3 w-28" />
                <Skeleton variant="rounded" className="h-10 w-full rounded-input" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-50">
            <Skeleton variant="rounded" className="h-10 w-44 rounded-input" />
          </div>
        </div>
      </div>

      {/* Bottom Session Log Skeleton */}
      <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
          <div className="space-y-1.5">
            <Skeleton variant="rounded" className="h-5 w-56" />
            <Skeleton variant="rounded" className="h-3.5 w-72" />
          </div>
          <Skeleton variant="rounded" className="h-8 w-48 rounded-lg" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
              <Skeleton variant="rounded" className="h-4 w-32" />
              <Skeleton variant="rounded" className="h-4 w-16 rounded-md" />
              <Skeleton variant="rounded" className="h-4 w-48" />
              <Skeleton variant="rounded" className="h-5 w-24 rounded-full" />
              <Skeleton variant="rounded" className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Puskesmas Portal Table Skeleton ──
export function PuskesmasTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto border border-slate-200 rounded animate-in fade-in duration-200">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
            <th className="p-3 w-12"><Skeleton variant="rounded" className="h-3.5 w-6" /></th>
            <th className="p-3 w-28"><Skeleton variant="rounded" className="h-3.5 w-20" /></th>
            <th className="p-3 w-44"><Skeleton variant="rounded" className="h-3.5 w-32" /></th>
            <th className="p-3 w-40"><Skeleton variant="rounded" className="h-3.5 w-28" /></th>
            <th className="p-3 w-28"><Skeleton variant="rounded" className="h-3.5 w-20" /></th>
            <th className="p-3"><Skeleton variant="rounded" className="h-3.5 w-48" /></th>
            <th className="p-3 w-36"><Skeleton variant="rounded" className="h-3.5 w-24" /></th>
            <th className="p-3 text-right w-20"><Skeleton variant="rounded" className="h-3.5 w-12 ml-auto" /></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-xs">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="hover:bg-slate-50/50">
              <td className="p-3"><Skeleton variant="rounded" className="h-3.5 w-5" /></td>
              <td className="p-3"><Skeleton variant="rounded" className="h-3.5 w-24" /></td>
              <td className="p-3">
                <div className="space-y-1">
                  <Skeleton variant="rounded" className="h-3.5 w-28" />
                  <Skeleton variant="rounded" className="h-2.5 w-16" />
                </div>
              </td>
              <td className="p-3"><Skeleton variant="rounded" className="h-4 w-32 font-bold" /></td>
              <td className="p-3"><Skeleton variant="rounded" className="h-5 w-16 rounded-full" /></td>
              <td className="p-3"><Skeleton variant="rounded" className="h-3.5 w-56" /></td>
              <td className="p-3"><Skeleton variant="rounded" className="h-6 w-24 rounded-full" /></td>
              <td className="p-3 text-right"><Skeleton variant="rounded" className="h-6 w-14 rounded ml-auto" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Puskesmas Full Page Skeleton ──
export function PuskesmasSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto px-4 py-8">
      {/* Top Banner */}
      <div className="bg-white rounded-lg p-5 border border-slate-200 space-y-3">
        <Skeleton variant="rounded" className="h-4 w-64" />
        <Skeleton variant="rounded" className="h-7 w-96 max-w-full" />
        <Skeleton variant="rounded" className="h-4 w-full max-w-2xl" />
      </div>

      {/* 4 Cards Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-4 rounded-lg border border-slate-200 space-y-2">
            <Skeleton variant="rounded" className="h-3 w-24" />
            <div className="flex items-center justify-between">
              <Skeleton variant="rounded" className="h-8 w-16" />
              <Skeleton variant="circular" className="w-6 h-6" />
            </div>
            <Skeleton variant="rounded" className="h-2.5 w-32" />
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <Skeleton variant="rounded" className="h-9 w-full rounded-md" />
          <Skeleton variant="rounded" className="h-9 w-full rounded-md" />
          <Skeleton variant="rounded" className="h-9 w-full rounded-md" />
          <Skeleton variant="rounded" className="h-9 w-full rounded-md" />
        </div>
      </div>

      {/* Table */}
      <PuskesmasTableSkeleton rows={8} />
    </div>
  );
}

// ── Riwayat Table Skeleton ──
export function RiwayatTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto animate-in fade-in duration-200">
      <table className="w-full min-w-[700px] text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 text-xs font-bold text-saas-muted uppercase tracking-wider">
            <th className="pb-3 px-3 w-32"><Skeleton variant="rounded" className="h-3.5 w-24" /></th>
            <th className="pb-3 px-3 w-48"><Skeleton variant="rounded" className="h-3.5 w-32" /></th>
            <th className="pb-3 px-3 w-28"><Skeleton variant="rounded" className="h-3.5 w-16" /></th>
            <th className="pb-3 px-3"><Skeleton variant="rounded" className="h-3.5 w-48" /></th>
            <th className="pb-3 px-3 w-36"><Skeleton variant="rounded" className="h-3.5 w-28" /></th>
            <th className="pb-3 px-3 w-32"><Skeleton variant="rounded" className="h-3.5 w-20" /></th>
            <th className="pb-3 px-3 text-right w-20"><Skeleton variant="rounded" className="h-3.5 w-10 ml-auto" /></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 text-sm">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="hover:bg-gray-50/40">
              <td className="py-4 px-3"><Skeleton variant="rounded" className="h-3.5 w-28" /></td>
              <td className="py-4 px-3"><Skeleton variant="rounded" className="h-4 w-36 font-bold" /></td>
              <td className="py-4 px-3"><Skeleton variant="rounded" className="h-5 w-18 rounded-md" /></td>
              <td className="py-4 px-3"><Skeleton variant="rounded" className="h-3.5 w-56" /></td>
              <td className="py-4 px-3"><Skeleton variant="rounded" className="h-6 w-28 rounded-md" /></td>
              <td className="py-4 px-3"><Skeleton variant="rounded" className="h-3.5 w-24" /></td>
              <td className="py-4 px-3 text-right"><Skeleton variant="rounded" className="h-8 w-8 rounded-lg ml-auto" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Manajemen Akun Table Skeleton ──
export function AkunTableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto animate-in fade-in duration-200">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 text-xs font-bold text-saas-muted uppercase tracking-wider">
            <th className="pb-3 w-56"><Skeleton variant="rounded" className="h-3.5 w-20" /></th>
            <th className="pb-3 text-center w-32"><Skeleton variant="rounded" className="h-3.5 w-16 mx-auto" /></th>
            <th className="pb-3 text-center w-28"><Skeleton variant="rounded" className="h-3.5 w-14 mx-auto" /></th>
            <th className="pb-3 text-right w-24"><Skeleton variant="rounded" className="h-3.5 w-12 ml-auto" /></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 text-sm">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="hover:bg-gray-50/20">
              <td className="py-4">
                <div className="space-y-1.5">
                  <Skeleton variant="rounded" className="h-4 w-36 font-bold" />
                  <Skeleton variant="rounded" className="h-3 w-48" />
                </div>
              </td>
              <td className="py-4 text-center">
                <Skeleton variant="rounded" className="h-6 w-20 rounded-full mx-auto" />
              </td>
              <td className="py-4 text-center">
                <Skeleton variant="rounded" className="h-6 w-16 rounded-full mx-auto" />
              </td>
              <td className="py-4 text-right">
                <Skeleton variant="rounded" className="h-8 w-8 rounded-lg ml-auto" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Laporan Rekapan Skeleton ──
export function LaporanSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="bg-white rounded-card shadow-soft-card border border-hairline/60 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton variant="rounded" className="h-4 w-32 rounded-md" />
          <Skeleton variant="rounded" className="h-7 w-72" />
          <Skeleton variant="rounded" className="h-3.5 w-96 max-w-full" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton variant="rounded" className="h-10 w-28 rounded-input" />
          <Skeleton variant="rounded" className="h-10 w-28 rounded-input" />
          <Skeleton variant="rounded" className="h-10 w-36 rounded-input" />
        </div>
      </div>

      {/* Rekapan KPI Cards */}
      <div className="space-y-4">
        <Skeleton variant="rounded" className="h-6 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>

      {/* Table Skeleton */}
      <TableSkeleton rows={5} columns={7} />
    </div>
  );
}


