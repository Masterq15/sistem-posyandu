"use client";

import React from "react";
import { X, TrendingUp, TrendingDown, Minus, LineChart as LineChartIcon } from "lucide-react";
import BalitaIcon from "@/components/BalitaIcon";
import LansiaIcon from "@/components/LansiaIcon";
import { PublicPemeriksaanItem } from "@/lib/api";
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

export interface ParticipantHistoryItem extends PublicPemeriksaanItem {
  tanggal: string;
  bb: number;
  tb: number;
  sistol?: number;
  diastol?: number;
  gds?: number;
}

export interface PuskesmasParticipantModalProps {
  selectedItem: PublicPemeriksaanItem | null;
  onClose: () => void;
  participantHistory: ParticipantHistoryItem[];
  prevRecord: ParticipantHistoryItem | null;
  bbDiff: number;
  tbDiff: number;
}

export default function PuskesmasParticipantModal({
  selectedItem,
  onClose,
  participantHistory,
  prevRecord,
  bbDiff,
  tbDiff,
}: PuskesmasParticipantModalProps) {
  if (!selectedItem) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                selectedItem.kategori === "Balita" ? "bg-teal-600 shadow-teal-500/20" : "bg-indigo-600 shadow-indigo-500/20"
              } shadow-md`}
            >
              {selectedItem.kategori === "Balita" ? (
                <BalitaIcon className="w-5 h-5" />
              ) : (
                <LansiaIcon className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">{selectedItem.namaWarga}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {selectedItem.kategori}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {selectedItem.posyanduNama} • {selectedItem.wilayah}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Measurements Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Hasil Pemeriksaan Terkini ({selectedItem.tanggalPeriksa})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-medium text-slate-500 block">Berat Badan</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-lg font-bold text-slate-900">{selectedItem.beratBadan}</span>
                  <span className="text-xs text-slate-500">kg</span>
                </div>
                {prevRecord && typeof bbDiff === "number" && !isNaN(bbDiff) && bbDiff !== 0 && (
                  <span
                    className={`text-[10px] font-bold flex items-center gap-0.5 mt-1 ${
                      bbDiff > 0 ? "text-teal-600" : "text-amber-600"
                    }`}
                  >
                    {bbDiff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {bbDiff > 0 ? `+${bbDiff}` : `${bbDiff}`} kg vs lalu
                  </span>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-medium text-slate-500 block">Tinggi / Panjang</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-lg font-bold text-slate-900">{selectedItem.tinggiBadan}</span>
                  <span className="text-xs text-slate-500">cm</span>
                </div>
                {prevRecord && typeof tbDiff === "number" && !isNaN(tbDiff) && tbDiff !== 0 && (
                  <span
                    className={`text-[10px] font-bold flex items-center gap-0.5 mt-1 ${
                      tbDiff > 0 ? "text-teal-600" : "text-amber-600"
                    }`}
                  >
                    {tbDiff > 0 ? <TrendingUp className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                    {tbDiff > 0 ? `+${tbDiff}` : `${tbDiff}`} cm vs lalu
                  </span>
                )}
              </div>

              {selectedItem.kategori === "Balita" ? (
                <>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-medium text-slate-500 block">Status BB/U</span>
                    <span className="text-sm font-bold text-slate-900 mt-1 block">
                      {selectedItem.statusBbU || "Normal"}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-medium text-slate-500 block">Status TB/U</span>
                    <span className="text-sm font-bold text-slate-900 mt-1 block">
                      {selectedItem.statusTbU || "Normal"}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-medium text-slate-500 block">Tekanan Darah</span>
                    <span className="text-sm font-bold text-slate-900 mt-1 block">
                      {selectedItem.tekananDarah || (selectedItem.sistol ? `${selectedItem.sistol}/${selectedItem.diastol}` : "-")}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-medium text-slate-500 block">GDS</span>
                    <span className="text-sm font-bold text-slate-900 mt-1 block">
                      {selectedItem.gds ? `${selectedItem.gds} mg/dL` : "-"}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Trend Chart (Jika memiliki riwayat > 1 pemeriksaan) */}
          {participantHistory.length > 1 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <LineChartIcon className="w-4 h-4 text-teal-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Grafik Tren Riwayat Pertumbuhan &amp; Pemeriksaan
                </h4>
              </div>
              <div className="h-48 w-full bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={participantHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="tanggal" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line
                      type="monotone"
                      dataKey="bb"
                      name="BB (kg)"
                      stroke="#0D9488"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="tb"
                      name="TB (cm)"
                      stroke="#6366F1"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Petugas & Catatan */}
          <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Petugas Pemeriksa:</span>
              <span className="font-bold text-teal-800">{selectedItem.petugas || "Kader Posyandu"}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Status Kesehatan Ringkas:</span>
              <span className="font-bold text-slate-900">{selectedItem.statusRingkasan || "Normal"}</span>
            </div>
            {(selectedItem.keluhan || selectedItem.tindakan || selectedItem.tindakanCatatan) && (
              <div className="pt-2 border-t border-teal-100 text-xs text-slate-700">
                <span className="font-bold block text-slate-800 mb-0.5">Keluhan / Tindakan:</span>
                <p>{selectedItem.tindakan || selectedItem.tindakanCatatan || selectedItem.keluhan}</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
