"use client";

import React from "react";
import { TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export interface RiwayatTrendChartProps {
  chartData: Array<{
    tanggal: string;
    balita: number;
    lansia: number;
    warning: number;
  }>;
}

export default function RiwayatTrendChart({ chartData }: RiwayatTrendChartProps) {
  return (
    <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-saas-dark flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-saas-primary" /> Trend Jumlah Pemeriksaan &amp; Temuan Risiko
          </h3>
          <p className="text-xs text-saas-muted mt-0.5">
            Grafik pergerakan jumlah kunjungan Balita, Lansia, serta temuan gizi/penyakit rawan dari waktu ke waktu.
          </p>
        </div>
      </div>

      <div className="h-80 w-full pt-4">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="tanggal" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFF",
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                  fontSize: "12px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="balita"
                name="Pemeriksaan Balita"
                stroke="#0D9488"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="lansia"
                name="Pemeriksaan Lansia"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="warning"
                name="Kasus Rawan / Rujukan"
                stroke="#EF4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-saas-muted">
            Belum ada data grafik untuk ditampilkan.
          </div>
        )}
      </div>
    </div>
  );
}
