"use client";

import React from "react";
import { Search, X, Eye, Plus } from "lucide-react";
import Modal from "@/components/Modal";
import BalitaIcon from "@/components/BalitaIcon";
import LansiaIcon from "@/components/LansiaIcon";
import { AktivitasKunjunganData } from "@/lib/api";


export interface DashboardActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  aktivitasTab: "balita" | "lansia" | "belum_balita" | "belum_lansia";
  setAktivitasTab: (tab: "balita" | "lansia" | "belum_balita" | "belum_lansia") => void;
  aktivitasData: AktivitasKunjunganData | null;
  aktivitasSearch: string;
  setAktivitasSearch: (val: string) => void;
  onNavigate: (menu: string, patientId?: string) => void;
  onQuickInputForPatient: (patient: {
    id: string;
    nama: string;
    tipe: "Balita" | "Lansia";
    detailInfo: string;
  }) => void;
  formatTanggalIndonesia: (dateStr: string) => string;
}

export default function DashboardActivityModal({
  isOpen,
  onClose,
  aktivitasTab,
  setAktivitasTab,
  aktivitasData,
  aktivitasSearch,
  setAktivitasSearch,
  onNavigate,
  onQuickInputForPatient,
  formatTanggalIndonesia,
}: DashboardActivityModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Aktivitas Kunjungan Posyandu"
    >
      <div className="space-y-4 max-w-xl">
        {/* Header Stats Selector Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setAktivitasTab("balita")}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              aktivitasTab === "balita"
                ? "bg-sky-50 border-sky-300 ring-2 ring-sky-400/20"
                : "bg-gray-50/60 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-1 text-sky-700 font-bold text-[11px] mb-0.5 truncate">
              <BalitaIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Balita Selesai</span>
            </div>
            <div className="text-base font-black text-saas-dark">
              {aktivitasData?.balitaSelesaiCount ?? 0}{" "}
              <span className="text-[10px] font-normal text-saas-muted">Anak</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setAktivitasTab("lansia")}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              aktivitasTab === "lansia"
                ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/20"
                : "bg-gray-50/60 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-1 text-emerald-700 font-bold text-[11px] mb-0.5 truncate">
              <LansiaIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Lansia Selesai</span>
            </div>
            <div className="text-base font-black text-saas-dark">
              {aktivitasData?.lansiaSelesaiCount ?? 0}{" "}
              <span className="text-[10px] font-normal text-saas-muted">Lansia</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setAktivitasTab("belum_balita")}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              aktivitasTab === "belum_balita"
                ? "bg-amber-50 border-amber-300 ring-2 ring-amber-400/20"
                : "bg-gray-50/60 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-1 text-amber-700 font-bold text-[11px] mb-0.5 truncate">
              <BalitaIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Balita Belum</span>
            </div>
            <div className="text-base font-black text-saas-dark">
              {(aktivitasData?.belumMengisiList ?? []).filter((i) => i.tipe === "Balita").length}{" "}
              <span className="text-[10px] font-normal text-saas-muted">Anak</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setAktivitasTab("belum_lansia")}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              aktivitasTab === "belum_lansia"
                ? "bg-orange-50 border-orange-300 ring-2 ring-orange-400/20"
                : "bg-gray-50/60 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-1 text-orange-700 font-bold text-[11px] mb-0.5 truncate">
              <LansiaIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Lansia Belum</span>
            </div>
            <div className="text-base font-black text-saas-dark">
              {(aktivitasData?.belumMengisiList ?? []).filter((i) => i.tipe === "Lansia").length}{" "}
              <span className="text-[10px] font-normal text-saas-muted">Lansia</span>
            </div>
          </button>
        </div>

        {/* Search filter in modal */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama pasien atau keterangan..."
            value={aktivitasSearch}
            onChange={(e) => setAktivitasSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-saas-primary text-gray-900"
          />
          {aktivitasSearch && (
            <button
              type="button"
              onClick={() => setAktivitasSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* List display */}
        <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
          {aktivitasTab === "balita" && (
            <>
              {(aktivitasData?.balitaSelesaiList ?? [])
                .filter(
                  (item) =>
                    item.nama.toLowerCase().includes(aktivitasSearch.toLowerCase()) ||
                    item.detailInfo.toLowerCase().includes(aktivitasSearch.toLowerCase())
                )
                .map((item) => {
                  const isFemale = item.jenisKelamin === "P" || item.jenisKelamin === "Perempuan";
                  return (
                    <div
                      key={item.id}
                      className="p-3 bg-white border border-gray-150 rounded-xl shadow-xs flex items-center justify-between hover:border-sky-200 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onNavigate("Balita", item.id);
                          }}
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                            isFemale ? "bg-pink-50 border-pink-100" : "bg-blue-50 border-blue-100"
                          }`}
                          title="Lihat Profil Balita"
                        >
                          <BalitaIcon className="w-5 h-5" gender={item.jenisKelamin} />
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onNavigate("Balita", item.id);
                              }}
                              className="font-bold text-xs text-saas-dark hover:text-saas-primary hover:underline text-left cursor-pointer"
                            >
                              {item.nama}
                            </button>
                            <span className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-semibold">
                              Balita
                            </span>
                          </div>
                          <p className="text-[11px] text-saas-muted">{item.detailInfo}</p>
                          {item.detailPemeriksaan && (
                            <p className="text-[11px] font-semibold text-sky-700 mt-0.5">
                              {item.detailPemeriksaan}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right hidden sm:block">
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-md inline-block mb-1">
                            Selesai Periksa
                          </span>
                          {item.tanggalPeriksa && (
                            <p className="text-[10px] text-saas-muted">
                              {formatTanggalIndonesia(item.tanggalPeriksa)}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onNavigate("Balita", item.id);
                          }}
                          className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          title="Buka profil lengkap balita"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Profil</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              {(aktivitasData?.balitaSelesaiList ?? []).filter(
                (item) =>
                  item.nama.toLowerCase().includes(aktivitasSearch.toLowerCase()) ||
                  item.detailInfo.toLowerCase().includes(aktivitasSearch.toLowerCase())
              ).length === 0 && (
                <div className="py-8 text-center text-xs text-saas-muted bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  Tidak ada balita selesai periksa ditemukan.
                </div>
              )}
            </>
          )}

          {aktivitasTab === "lansia" && (
            <>
              {(aktivitasData?.lansiaSelesaiList ?? [])
                .filter(
                  (item) =>
                    item.nama.toLowerCase().includes(aktivitasSearch.toLowerCase()) ||
                    item.detailInfo.toLowerCase().includes(aktivitasSearch.toLowerCase())
                )
                .map((item) => {
                  const isFemale = item.jenisKelamin === "P" || item.jenisKelamin === "Perempuan";
                  return (
                    <div
                      key={item.id}
                      className="p-3 bg-white border border-gray-150 rounded-xl shadow-xs flex items-center justify-between hover:border-emerald-200 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onNavigate("Lansia", item.id);
                          }}
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                            isFemale ? "bg-pink-50 border-pink-100" : "bg-blue-50 border-blue-100"
                          }`}
                          title="Lihat Profil Lansia"
                        >
                          <LansiaIcon className="w-5 h-5" gender={item.jenisKelamin} />
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onNavigate("Lansia", item.id);
                              }}
                              className="font-bold text-xs text-saas-dark hover:text-saas-primary hover:underline text-left cursor-pointer"
                            >
                              {item.nama}
                            </button>
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                              Lansia
                            </span>
                          </div>
                          <p className="text-[11px] text-saas-muted">{item.detailInfo}</p>
                          {item.detailPemeriksaan && (
                            <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                              {item.detailPemeriksaan}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right hidden sm:block">
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-md inline-block mb-1">
                            Selesai Periksa
                          </span>
                          {item.tanggalPeriksa && (
                            <p className="text-[10px] text-saas-muted">
                              {formatTanggalIndonesia(item.tanggalPeriksa)}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onNavigate("Lansia", item.id);
                          }}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          title="Buka profil lengkap lansia"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Profil</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              {(aktivitasData?.lansiaSelesaiList ?? []).filter(
                (item) =>
                  item.nama.toLowerCase().includes(aktivitasSearch.toLowerCase()) ||
                  item.detailInfo.toLowerCase().includes(aktivitasSearch.toLowerCase())
              ).length === 0 && (
                <div className="py-8 text-center text-xs text-saas-muted bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  Tidak ada lansia selesai periksa ditemukan.
                </div>
              )}
            </>
          )}

          {(aktivitasTab === "belum_balita" || aktivitasTab === "belum_lansia") && (
            <>
              {(aktivitasData?.belumMengisiList ?? [])
                .filter(
                  (item) =>
                    item.tipe === (aktivitasTab === "belum_balita" ? "Balita" : "Lansia")
                )
                .filter(
                  (item) =>
                    item.nama.toLowerCase().includes(aktivitasSearch.toLowerCase()) ||
                    item.detailInfo.toLowerCase().includes(aktivitasSearch.toLowerCase())
                )
                .map((item) => {
                  const isFemale = item.jenisKelamin === "P" || item.jenisKelamin === "Perempuan";
                  return (
                    <div
                      key={item.id}
                      className="p-3 bg-white border border-amber-150 rounded-xl shadow-xs flex items-center justify-between hover:border-amber-300 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onNavigate(item.tipe, item.id);
                          }}
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                            isFemale ? "bg-pink-50 border-pink-100" : "bg-blue-50 border-blue-100"
                          }`}
                          title={`Lihat Profil ${item.tipe}`}
                        >
                          {item.tipe === "Balita" ? (
                            <BalitaIcon className="w-5 h-5" gender={item.jenisKelamin} />
                          ) : (
                            <LansiaIcon className="w-5 h-5" gender={item.jenisKelamin} />
                          )}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onNavigate(item.tipe, item.id);
                              }}
                              className="font-bold text-xs text-saas-dark hover:text-saas-primary hover:underline text-left cursor-pointer"
                            >
                              {item.nama}
                            </button>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                item.tipe === "Balita"
                                  ? "bg-sky-100 text-sky-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {item.tipe}
                            </span>
                          </div>
                          <p className="text-[11px] text-saas-muted">{item.detailInfo}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onNavigate(item.tipe, item.id);
                          }}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-saas-dark font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          title="Buka profil lengkap"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Profil</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onQuickInputForPatient({
                              id: item.id,
                              nama: item.nama,
                              tipe: item.tipe,
                              detailInfo: item.detailInfo,
                            });
                          }}
                          className="px-2.5 py-1 bg-saas-primary hover:bg-teal-600 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Input Data</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              {(aktivitasData?.belumMengisiList ?? [])
                .filter(
                  (item) =>
                    item.tipe === (aktivitasTab === "belum_balita" ? "Balita" : "Lansia")
                )
                .filter(
                  (item) =>
                    item.nama.toLowerCase().includes(aktivitasSearch.toLowerCase()) ||
                    item.detailInfo.toLowerCase().includes(aktivitasSearch.toLowerCase())
                ).length === 0 && (
                <div className="py-8 text-center text-xs text-emerald-600 bg-emerald-50/50 rounded-xl border border-dashed border-emerald-200 font-semibold">
                  🎉 Luar biasa! Semua {aktivitasTab === "belum_balita" ? "balita" : "lansia"} telah mengisi data pemeriksaan.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
