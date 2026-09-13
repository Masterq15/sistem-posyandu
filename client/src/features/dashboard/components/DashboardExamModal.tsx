"use client";

import React from "react";
import { Search, AlertCircle } from "lucide-react";
import Modal from "@/components/Modal";
import BalitaIcon from "@/components/BalitaIcon";
import LansiaIcon from "@/components/LansiaIcon";
import { Pasien } from "../types";


export interface DashboardExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPasien: Pasien | null;
  setSelectedPasien: React.Dispatch<React.SetStateAction<Pasien | null>>;
  modalSearch: string;
  setModalSearch: (val: string) => void;
  filteredPasiens: Pasien[];
  handleQuickExamSubmit: (e: React.FormEvent) => void;
  modalError: string;
  setModalError: (val: string) => void;
  modalWarning: string;
  setModalWarning: (val: string) => void;
  examDate: string;
  setExamDate: (val: string) => void;
  examBB: string;
  setExamBB: (val: string) => void;
  examTB: string;
  setExamTB: (val: string) => void;
  examLK: string;
  setExamLK: (val: string) => void;
  examLiLA: string;
  setExamLiLA: (val: string) => void;
  examImunisasi: string;
  setExamImunisasi: (val: string) => void;
  examVitA: boolean;
  setExamVitA: (val: boolean) => void;
  examAsi: boolean;
  setExamAsi: (val: boolean) => void;
  examCacing: boolean;
  setExamCacing: (val: boolean) => void;
  examBBU: string;
  examTBU: string;
  examBBTB: string;
  examSistol: string;
  setExamSistol: (val: string) => void;
  examDiastol: string;
  setExamDiastol: (val: string) => void;
  examGds: string;
  setExamGds: (val: string) => void;
  examLp: string;
  setExamLp: (val: string) => void;
  examCholesterol: string;
  setExamCholesterol: (val: string) => void;
  examUricAcid: string;
  setExamUricAcid: (val: string) => void;
  examKeluhan: string;
  setExamKeluhan: (val: string) => void;
  examTindakan: string;
  setExamTindakan: (val: string) => void;
  checkWarnings: (bb: string, sistol: string) => void;
  hitungIMT: (bb: number, tb: number) => number | string;
}

export default function DashboardExamModal({
  isOpen,
  onClose,
  selectedPasien,
  setSelectedPasien,
  modalSearch,
  setModalSearch,
  filteredPasiens,
  handleQuickExamSubmit,
  modalError,
  setModalError,
  modalWarning,
  setModalWarning,
  examDate,
  setExamDate,
  examBB,
  setExamBB,
  examTB,
  setExamTB,
  examLK,
  setExamLK,
  examLiLA,
  setExamLiLA,
  examImunisasi,
  setExamImunisasi,
  examVitA,
  setExamVitA,
  examAsi,
  setExamAsi,
  examCacing,
  setExamCacing,
  examBBU,
  examTBU,
  examBBTB,
  examSistol,
  setExamSistol,
  examDiastol,
  setExamDiastol,
  examGds,
  setExamGds,
  examLp,
  setExamLp,
  examCholesterol,
  setExamCholesterol,
  examUricAcid,
  setExamUricAcid,
  examKeluhan,
  setExamKeluhan,
  examTindakan,
  setExamTindakan,
  checkWarnings,
  hitungIMT,
}: DashboardExamModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Catat Pemeriksaan Cepat"
      description="Input rekam medis bulanan langsung tanpa membuka detail profil."
      type="modal"
    >
      {!selectedPasien ? (
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Ketik nama balita atau lansia..."
              value={modalSearch}
              onChange={(e) => setModalSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50 text-gray-900"
            />
            <Search className="absolute left-3.5 top-3 text-saas-muted w-4 h-4" />
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {filteredPasiens.length > 0 ? (
              filteredPasiens.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPasien(p)}
                  className="w-full text-left p-3 border border-gray-100 hover:border-saas-primary/30 hover:bg-gray-50/50 rounded-xl flex items-center justify-between text-xs transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        p.tipe === "Balita"
                          ? "bg-teal-50 text-saas-primary"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      {p.tipe === "Balita" ? (
                        <BalitaIcon className="w-4 h-4" gender={p.jenisKelamin} />
                      ) : (
                        <LansiaIcon className="w-4 h-4" gender={p.jenisKelamin} />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-saas-dark group-hover:text-saas-primary transition-colors">
                        {p.nama}
                      </p>
                      <p className="text-[10px] text-saas-muted font-semibold mt-0.5">
                        {p.detailInfo}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-saas-muted group-hover:text-saas-primary transition-colors">
                    Pilih &amp; Lanjut &rarr;
                  </span>
                </button>
              ))
            ) : (
              <p className="text-center text-xs text-saas-muted py-6 font-semibold">
                Nama warga tidak ditemukan.
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Step 2: Show Form based on Patient Type */
        <form onSubmit={handleQuickExamSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-red-50 text-trend-dangerText border border-red-100 rounded-lg text-xs font-bold flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {modalError}
            </div>
          )}
          {modalWarning && (
            <div className="p-3 bg-yellow-50 text-yellow-700 border border-yellow-100 rounded-lg text-xs font-semibold flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {modalWarning}
            </div>
          )}

          {/* Selected patient preview box */}
          <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-saas-dark">Mencatat data untuk:</span>
              <span
                className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                  selectedPasien.tipe === "Balita"
                    ? "bg-teal-50 text-saas-primary"
                    : "bg-red-50 text-red-500"
                }`}
              >
                {selectedPasien.nama} ({selectedPasien.tipe})
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedPasien(null);
                setModalWarning("");
                setModalError("");
              }}
              className="text-xs text-saas-primary font-bold hover:underline cursor-pointer"
            >
              Ganti
            </button>
          </div>

          <div
            className={`grid grid-cols-1 ${
              selectedPasien.tipe === "Lansia" ? "sm:grid-cols-4" : "sm:grid-cols-3"
            } gap-4 border-t border-gray-50 pt-3`}
          >
            {/* Tanggal */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-saas-muted uppercase">
                Tanggal Periksa
              </label>
              <input
                type="date"
                value={examDate}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full p-2 bg-gray-50 border border-gray-150 rounded-lg text-xs font-semibold focus:outline-none focus:border-saas-primary/50 cursor-pointer text-gray-900"
              />
            </div>

            {/* BB */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-saas-muted uppercase">
                Berat Badan (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="Cth: 8.5"
                value={examBB}
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault();
                }}
                onChange={(e) => {
                  const val = e.target.value.replace(/-/g, "");
                  setExamBB(val);
                  checkWarnings(val, examSistol);
                }}
                className="w-full p-2 bg-gray-50 border border-gray-150 rounded-lg text-xs font-semibold focus:outline-none focus:border-saas-primary/50 text-gray-900"
              />
            </div>

            {/* TB */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-saas-muted uppercase">
                Tinggi Badan (cm)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="Cth: 72"
                value={examTB}
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault();
                }}
                onChange={(e) => setExamTB(e.target.value.replace(/-/g, ""))}
                className="w-full p-2 bg-gray-50 border border-gray-150 rounded-lg text-xs font-semibold focus:outline-none focus:border-saas-primary/50 text-gray-900"
              />
            </div>

            {/* IMT - Calculated Live */}
            {selectedPasien.tipe === "Lansia" && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-teal-600 uppercase">
                  IMT (Otomatis)
                </label>
                <input
                  type="text"
                  disabled
                  value={
                    parseFloat(examBB) > 0 && parseFloat(examTB) > 0
                      ? hitungIMT(parseFloat(examBB), parseFloat(examTB))
                      : "-"
                  }
                  className="w-full p-2 bg-teal-50/50 border border-teal-150 rounded-lg text-xs font-bold text-teal-700 cursor-not-allowed"
                />
              </div>
            )}
          </div>

          {/* Balita Specific Inputs */}
          {selectedPasien.tipe === "Balita" && (
            <div className="space-y-4 border-t border-gray-50 pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Lingkar Kepala */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-saas-muted uppercase">
                    Lingkar Kepala (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Opsional, cth: 44"
                    value={examLK}
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault();
                    }}
                    onChange={(e) => setExamLK(e.target.value.replace(/-/g, ""))}
                    className="w-full p-2 bg-gray-50 border border-gray-150 rounded-lg text-xs font-semibold focus:outline-none focus:border-saas-primary/50 text-gray-900"
                  />
                </div>

                {/* Lingkar Lengan (LiLA) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-saas-muted uppercase">
                    Lingkar Lengan (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Cth: 12.5"
                    value={examLiLA}
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault();
                    }}
                    onChange={(e) => setExamLiLA(e.target.value.replace(/-/g, ""))}
                    className="w-full p-2 bg-gray-50 border border-gray-150 rounded-lg text-xs font-semibold focus:outline-none focus:border-saas-primary/50 text-gray-900"
                  />
                </div>

                {/* Status Imunisasi */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-saas-muted uppercase">
                    Imunisasi
                  </label>
                  <input
                    type="text"
                    placeholder="Cth: BCG, Polio 1"
                    value={examImunisasi}
                    onChange={(e) => setExamImunisasi(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-150 rounded-lg text-xs font-semibold focus:outline-none focus:border-saas-primary/50 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="flex items-center pt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={examVitA}
                      onChange={(e) => setExamVitA(e.target.checked)}
                      className="w-4.5 h-4.5 text-saas-primary focus:ring-saas-primary/30"
                    />
                    <span className="text-xs font-bold text-saas-dark">Pemberian Vitamin A</span>
                  </label>
                </div>

                <div className="flex items-center pt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={examAsi}
                      onChange={(e) => setExamAsi(e.target.checked)}
                      className="w-4.5 h-4.5 text-saas-primary focus:ring-saas-primary/30"
                    />
                    <span className="text-xs font-bold text-saas-dark">ASI Eksklusif</span>
                  </label>
                </div>

                <div className="flex items-center pt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={examCacing}
                      onChange={(e) => setExamCacing(e.target.checked)}
                      className="w-4.5 h-4.5 text-saas-primary focus:ring-saas-primary/30"
                    />
                    <span className="text-xs font-bold text-saas-dark">Obat Cacing</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                {/* WHO Statuses (Calculated) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-saas-muted uppercase">
                    Status BB/U (Otomatis)
                  </label>
                  <select
                    value={examBBU}
                    disabled
                    className="w-full p-2 bg-gray-150 border border-gray-150 rounded-lg text-xs font-bold text-saas-dark focus:outline-none cursor-not-allowed"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Kurang">Kurang</option>
                    <option value="Sangat Kurang">Sangat Kurang</option>
                    <option value="Lebih">Lebih</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-saas-muted uppercase">
                    Status TB/U (Otomatis)
                  </label>
                  <select
                    value={examTBU}
                    disabled
                    className="w-full p-2 bg-gray-150 border border-gray-150 rounded-lg text-xs font-bold text-saas-dark focus:outline-none cursor-not-allowed"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Pendek">Pendek</option>
                    <option value="Sangat Pendek">Sangat Pendek</option>
                    <option value="Tinggi">Tinggi</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-saas-muted uppercase">
                    Status BB/TB (Otomatis)
                  </label>
                  <select
                    value={examBBTB}
                    disabled
                    className="w-full p-2 bg-gray-150 border border-gray-150 rounded-lg text-xs font-bold text-saas-dark focus:outline-none cursor-not-allowed"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Kurus">Kurus</option>
                    <option value="Sangat Kurus">Sangat Kurus</option>
                    <option value="Gemuk">Gemuk</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Lansia Specific Inputs */}
          {selectedPasien.tipe === "Lansia" && (
            <div className="space-y-4 border-t border-gray-50 pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {/* Sistol */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-saas-muted uppercase">
                    Sistol (mmHg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="TD atas, cth: 130"
                    value={examSistol}
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault();
                    }}
                    onChange={(e) => {
                      const val = e.target.value.replace(/-/g, "");
                      setExamSistol(val);
                      checkWarnings(examBB, val);
                    }}
                    className="w-full p-2 bg-gray-50 border border-gray-150 rounded-lg text-xs font-semibold focus:outline-none focus:border-saas-primary/50 text-gray-900"
                  />
                </div>

                {/* Diastol */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-saas-muted uppercase">
                    Diastol (mmHg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="TD bawah, cth: 85"
                    value={examDiastol}
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault();
                    }}
                    onChange={(e) => setExamDiastol(e.target.value.replace(/-/g, ""))}
                    className="w-full p-2 bg-gray-50 border border-gray-150 rounded-lg text-xs font-semibold focus:outline-none focus:border-saas-primary/50 text-gray-900"
                  />
                </div>

                {/* GDS */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-saas-muted uppercase">
                    GDS (mg/dL)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Cth: 120"
                    value={examGds}
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault();
                    }}
                    onChange={(e) => setExamGds(e.target.value.replace(/-/g, ""))}
                    className="w-full p-2 bg-gray-50 border border-gray-150 rounded-lg text-xs font-semibold focus:outline-none focus:border-saas-primary/50 text-gray-900"
                  />
                </div>

                {/* Lingkar Perut */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-saas-muted uppercase">
                    Lingkar Perut (cm)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Cth: 90"
                    value={examLp}
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault();
                    }}
                    onChange={(e) => setExamLp(e.target.value.replace(/-/g, ""))}
                    className="w-full p-2 bg-gray-50 border border-gray-150 rounded-lg text-xs font-semibold focus:outline-none focus:border-saas-primary/50 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Kolesterol */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-saas-muted uppercase">
                    Kolesterol (mg/dL)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="cth: 180"
                    value={examCholesterol}
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault();
                    }}
                    onChange={(e) => setExamCholesterol(e.target.value.replace(/-/g, ""))}
                    className="w-full p-2 bg-gray-50 border border-gray-150 rounded-lg text-xs font-semibold focus:outline-none focus:border-saas-primary/50 text-gray-900"
                  />
                </div>

                {/* Asam Urat */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-saas-muted uppercase">
                    Asam Urat (mg/dL)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="cth: 6.2"
                    value={examUricAcid}
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault();
                    }}
                    onChange={(e) => setExamUricAcid(e.target.value.replace(/-/g, ""))}
                    className="w-full p-2 bg-gray-50 border border-gray-150 rounded-lg text-xs font-semibold focus:outline-none focus:border-saas-primary/50 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Keluhan */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-saas-muted uppercase">
                    Keluhan Saat Ini
                  </label>
                  <textarea
                    placeholder="Tulis keluhan atau sakit yang dirasakan..."
                    rows={2}
                    value={examKeluhan}
                    onChange={(e) => setExamKeluhan(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-150 rounded-lg text-xs font-semibold focus:outline-none focus:border-saas-primary/50 resize-none text-gray-900"
                  />
                </div>

                {/* Tindakan */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-saas-muted uppercase">
                    Tindakan / Rujukan
                  </label>
                  <textarea
                    placeholder="Tulis rujukan, obat, atau tindakan..."
                    rows={2}
                    value={examTindakan}
                    onChange={(e) => setExamTindakan(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-150 rounded-lg text-xs font-semibold focus:outline-none focus:border-saas-primary/50 resize-none text-gray-900"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-gray-50 gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedPasien(null);
                setModalError("");
                setModalWarning("");
              }}
              className="px-4 py-2 border border-gray-200 text-saas-dark text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Kembali
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-saas-primary hover:bg-teal-600 text-white text-xs font-bold rounded-lg shadow-md shadow-teal-500/10 transition-colors cursor-pointer"
            >
              Simpan Hasil Pemeriksaan
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
