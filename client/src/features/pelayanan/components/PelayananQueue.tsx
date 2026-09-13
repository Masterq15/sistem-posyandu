"use client";

import React from "react";
import { Search, ChevronRight } from "lucide-react";
import BalitaIcon from "@/components/BalitaIcon";
import LansiaIcon from "@/components/LansiaIcon";
import { Pasien } from "../types";

export interface PelayananQueueProps {
  activeTab: "Balita" | "Lansia";
  pasiens: Pasien[];
  filteredPasiens: Pasien[];
  selectedPasien: Pasien | null;
  onSelectPasien: (pasien: Pasien) => void;
  statusFilter: "semua" | "selesai" | "belum";
  setStatusFilter: (status: "semua" | "selesai" | "belum") => void;
  query: string;
  setQuery: (q: string) => void;
  onAddNew: () => void;
}

export default function PelayananQueue({
  activeTab,
  pasiens,
  filteredPasiens,
  selectedPasien,
  onSelectPasien,
  statusFilter,
  setStatusFilter,
  query,
  setQuery,
  onAddNew,
}: PelayananQueueProps) {
  const currentTabPasiens = pasiens.filter((p) => p.tipe === activeTab);
  const selesaiCount = currentTabPasiens.filter((p) => p.isCheckedInCurrentPeriod).length;
  const belumCount = currentTabPasiens.filter((p) => !p.isCheckedInCurrentPeriod).length;

  return (
    <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 flex flex-col h-[600px] space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-saas-dark">
            {activeTab === "Balita" ? "Pilih Balita" : "Pilih Lansia"}
          </h3>
          <span className="text-[10px] font-bold text-saas-muted bg-gray-100 px-2 py-0.5 rounded-full">
            {filteredPasiens.length} Orang
          </span>
        </div>

        {/* Tab Status Periksa */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setStatusFilter("semua")}
            className={`flex-1 py-1 text-center rounded-md transition-all cursor-pointer ${
              statusFilter === "semua"
                ? "bg-white text-saas-dark shadow-sm"
                : "text-saas-muted hover:text-saas-dark"
            }`}
          >
            Semua ({currentTabPasiens.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("selesai")}
            className={`flex-1 py-1 text-center rounded-md transition-all cursor-pointer ${
              statusFilter === "selesai"
                ? "bg-white text-teal-700 shadow-sm"
                : "text-saas-muted hover:text-saas-dark"
            }`}
          >
            Selesai ({selesaiCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("belum")}
            className={`flex-1 py-1 text-center rounded-md transition-all cursor-pointer ${
              statusFilter === "belum"
                ? "bg-white text-amber-700 shadow-sm"
                : "text-saas-muted hover:text-saas-dark"
            }`}
          >
            Belum ({belumCount})
          </button>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder={activeTab === "Balita" ? "Cari nama balita..." : "Cari nama lansia..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50 focus:bg-white transition-all"
        />
        <Search className="absolute left-3.5 top-2.5 text-saas-muted/80 w-4 h-4" />
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-2">
        {filteredPasiens.length > 0 ? (
          filteredPasiens.map((p) => {
            const isSelected = selectedPasien?.id === p.id;
            const isFemale = p.jenisKelamin === "P" || (p.jenisKelamin as string) === "Perempuan";
            return (
              <button
                key={p.id}
                onClick={() => onSelectPasien(p)}
                className={`w-full text-left p-3 border rounded-xl flex items-center justify-between text-xs transition-all group cursor-pointer ${
                  isSelected
                    ? activeTab === "Balita"
                      ? "border-saas-primary bg-saas-primary/5 shadow-sm shadow-teal-500/5"
                      : "border-indigo-500 bg-indigo-50/40 shadow-sm shadow-indigo-500/5"
                    : "border-gray-100 hover:border-saas-primary/30 hover:bg-gray-50/50"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                      isSelected
                        ? isFemale
                          ? "bg-pink-200/80 border-pink-300"
                          : "bg-blue-200/80 border-blue-300"
                        : isFemale
                        ? "bg-pink-50 border-pink-100"
                        : "bg-blue-50 border-blue-100"
                    }`}
                  >
                    {p.tipe === "Balita" ? (
                      <BalitaIcon className="w-4 h-4" gender={p.jenisKelamin} />
                    ) : (
                      <LansiaIcon className="w-4 h-4" gender={p.jenisKelamin} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p
                        className={`font-bold truncate transition-colors ${
                          isSelected
                            ? p.tipe === "Balita"
                              ? "text-teal-900"
                              : "text-indigo-950"
                            : "text-saas-dark group-hover:text-saas-primary"
                        }`}
                      >
                        {p.nama}
                      </p>
                      {p.isCheckedInCurrentPeriod ? (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-teal-100 text-teal-700 border border-teal-200 shrink-0">
                          Selesai
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-amber-50 text-amber-600 border border-amber-200/60 shrink-0">
                          Belum
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-[10px] font-semibold mt-0.5 ${
                        isSelected
                          ? p.tipe === "Balita"
                            ? "text-teal-700"
                            : "text-indigo-800"
                          : "text-saas-muted"
                      }`}
                    >
                      {p.subInfo}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    isSelected
                      ? p.tipe === "Balita"
                        ? "text-teal-700 translate-x-1"
                        : "text-indigo-700 translate-x-1"
                      : "text-saas-muted group-hover:translate-x-1"
                  }`}
                />
              </button>
            );
          })
        ) : (
          <div className="text-center py-12 px-4 space-y-2">
            <p className="text-xs text-saas-muted font-medium">
              {activeTab === "Balita" ? "Data balita tidak ditemukan." : "Data lansia tidak ditemukan."}
            </p>
            <button
              type="button"
              onClick={onAddNew}
              className="text-[11px] font-bold text-saas-primary hover:underline cursor-pointer"
            >
              {activeTab === "Balita" ? "+ Daftarkan Balita Baru" : "+ Daftarkan Lansia Baru"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
