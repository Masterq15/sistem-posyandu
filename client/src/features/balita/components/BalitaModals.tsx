"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import Modal from "@/components/Modal";
import { calculateAgeInMonths, getStatusBadgeStyle } from "@/features/pelayanan/types";
import { Balita } from "../types";

export interface BalitaModalsProps {
  // Edit Balita Modal
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
  editNama: string;
  setEditNama: (v: string) => void;
  editNik: string;
  setEditNik: (v: string) => void;
  editNoHp: string;
  setEditNoHp: (v: string) => void;
  editTglLahir: string;
  setEditTglLahir: (v: string) => void;
  editJk: "L" | "P";
  setEditJk: (v: "L" | "P") => void;
  editNamaIbu: string;
  setEditNamaIbu: (v: string) => void;
  editAlamat: string;
  setEditAlamat: (v: string) => void;
  editError: string;
  isSaving: boolean;
  onEditBalitaSubmit: (e: React.FormEvent) => void;

  // Delete Balita Modal
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (open: boolean) => void;
  activeBalita: Balita | null;
  onDeleteBalita: () => void;

  // Edit Exam Modal
  isEditExamModalOpen: boolean;
  setIsEditExamModalOpen: (open: boolean) => void;
  editExamError: string;
  editExamDate: string;
  setEditExamDate: (v: string) => void;
  editExamBB: string;
  editExamTB: string;
  editExamLK: string;
  setEditExamLK: (v: string) => void;
  editExamLiLA: string;
  setEditExamLiLA: (v: string) => void;
  editExamBBU: string;
  editExamTBU: string;
  editExamBBTB: string;
  editExamVitA: boolean;
  setEditExamVitA: (v: boolean) => void;
  editExamAsi: boolean;
  setEditExamAsi: (v: boolean) => void;
  editExamCacing: boolean;
  setEditExamCacing: (v: boolean) => void;
  editExamImunisasi: string;
  setEditExamImunisasi: (v: string) => void;
  onEditExamMeasurementsChange: (bb: string, tb: string, date: string) => void;
  onEditExamSubmit: (e: React.FormEvent) => void;

  // Delete Exam Modal
  isDeleteExamModalOpen: boolean;
  setIsDeleteExamModalOpen: (open: boolean) => void;
  onDeleteExamSubmit: () => void;
}

export default function BalitaModals({
  isEditModalOpen,
  setIsEditModalOpen,
  editNama,
  setEditNama,
  editNik,
  setEditNik,
  editNoHp,
  setEditNoHp,
  editTglLahir,
  setEditTglLahir,
  editJk,
  setEditJk,
  editNamaIbu,
  setEditNamaIbu,
  editAlamat,
  setEditAlamat,
  editError,
  isSaving,
  onEditBalitaSubmit,

  isDeleteModalOpen,
  setIsDeleteModalOpen,
  activeBalita,
  onDeleteBalita,

  isEditExamModalOpen,
  setIsEditExamModalOpen,
  editExamError,
  editExamDate,
  setEditExamDate,
  editExamBB,
  editExamTB,
  editExamLK,
  setEditExamLK,
  editExamLiLA,
  setEditExamLiLA,
  editExamBBU,
  editExamTBU,
  editExamBBTB,
  editExamVitA,
  setEditExamVitA,
  editExamAsi,
  setEditExamAsi,
  editExamCacing,
  setEditExamCacing,
  editExamImunisasi,
  setEditExamImunisasi,
  onEditExamMeasurementsChange,
  onEditExamSubmit,

  isDeleteExamModalOpen,
  setIsDeleteExamModalOpen,
  onDeleteExamSubmit,
}: BalitaModalsProps) {
  return (
    <>
      {/* MODAL EDIT BALITA */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profil Balita"
      >
        <form onSubmit={onEditBalitaSubmit} className="space-y-4">
          {editError && (
            <div className="p-3 bg-red-50 text-trend-dangerText border border-red-100 rounded-lg text-xs font-bold">
              {editError}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-saas-dark">Nama Lengkap Anak</label>
            <input
              type="text"
              required
              value={editNama}
              onChange={(e) => setEditNama(e.target.value)}
              className="w-full p-2.5 border border-hairline rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-saas-dark">NIK (16 digit, opsional)</label>
            <input
              type="text"
              maxLength={16}
              value={editNik}
              onChange={(e) => setEditNik(e.target.value)}
              className="w-full p-2.5 border border-hairline rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-saas-dark">
              No. WhatsApp / HP Orang Tua (opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: 081234567890"
              value={editNoHp}
              onChange={(e) => setEditNoHp(e.target.value)}
              className="w-full p-2.5 border border-hairline rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-saas-dark">Tanggal Lahir</label>
              <input
                type="date"
                required
                value={editTglLahir}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                onChange={(e) => setEditTglLahir(e.target.value)}
                className="w-full p-2.5 border border-hairline rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary cursor-pointer"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-saas-dark">Jenis Kelamin</label>
              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-saas-dark cursor-pointer">
                  <input
                    type="radio"
                    name="editJk"
                    checked={editJk === "L"}
                    onChange={() => setEditJk("L")}
                  />
                  Laki-laki
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-saas-dark cursor-pointer">
                  <input
                    type="radio"
                    name="editJk"
                    checked={editJk === "P"}
                    onChange={() => setEditJk("P")}
                  />
                  Perempuan
                </label>
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-saas-dark">Nama Ibu Kandung</label>
            <input
              type="text"
              required
              value={editNamaIbu}
              onChange={(e) => setEditNamaIbu(e.target.value)}
              className="w-full p-2.5 border border-hairline rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-saas-dark">Alamat Rumah</label>
            <textarea
              rows={2}
              required
              value={editAlamat}
              onChange={(e) => setEditAlamat(e.target.value)}
              className="w-full p-2.5 border border-hairline rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 border border-hairline rounded-full text-xs font-semibold text-saas-dark hover:bg-gray-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-saas-primary text-white rounded-full text-xs font-semibold hover:bg-teal-700 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL KONFIRMASI HAPUS BALITA */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Profil Balita"
      >
        <div className="space-y-4">
          <p className="text-sm text-saas-dark font-medium">
            Apakah Anda yakin ingin menghapus data profil balita{" "}
            <span className="font-bold text-trend-dangerText">{activeBalita?.nama}</span>?
          </p>
          <p className="text-xs text-saas-muted">
            Seluruh riwayat pemeriksaan anak ini juga akan dihapus secara permanen dari sistem.
          </p>
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-hairline rounded-full text-xs font-semibold text-saas-dark hover:bg-gray-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onDeleteBalita}
              disabled={isSaving}
              className="px-4 py-2 bg-trend-dangerText text-white rounded-full text-xs font-semibold hover:bg-red-700 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? "Menghapus..." : "Ya, Hapus Permanen"}
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL EDIT PEMERIKSAAN BALITA */}
      <Modal
        isOpen={isEditExamModalOpen}
        onClose={() => setIsEditExamModalOpen(false)}
        title="Edit Riwayat Pemeriksaan Balita"
      >
        <form onSubmit={onEditExamSubmit} className="space-y-4">
          {editExamError && (
            <div className="p-3 bg-red-50 text-trend-dangerText border border-red-100 rounded-lg text-xs font-bold flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {editExamError}
            </div>
          )}

          {/* Tanggal Periksa */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-saas-dark">Tanggal Periksa</label>
            <input
              type="date"
              required
              value={editExamDate}
              onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
              onChange={(e) => {
                setEditExamDate(e.target.value);
                onEditExamMeasurementsChange(editExamBB, editExamTB, e.target.value);
              }}
              className="w-full p-2.5 bg-gray-50 border border-gray-250 rounded-input text-xs font-semibold text-saas-dark focus:outline-none focus:border-saas-primary/50 cursor-pointer"
            />
          </div>

          {/* Umur & Jenis Kelamin (Otomatis) */}
          {activeBalita && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-teal-50/70 rounded-xl border border-teal-150">
              <div>
                <span className="text-[11px] font-bold text-teal-800 block">Umur:</span>
                <span className="text-xs font-extrabold text-teal-950">
                  {calculateAgeInMonths(
                    activeBalita.tanggalLahir,
                    editExamDate ? new Date(editExamDate) : new Date()
                  )}{" "}
                  Bulan
                </span>
                <span className="text-[10px] text-teal-600 ml-1 font-semibold">(otomatis)</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-teal-800 block">Jenis Kelamin:</span>
                <span className="text-xs font-extrabold text-teal-950">
                  {activeBalita.jenisKelamin === "L" ? "Laki-laki (L)" : "Perempuan (P)"}
                </span>
                <span className="text-[10px] text-teal-600 ml-1 font-semibold">(otomatis)</span>
              </div>
            </div>
          )}

          {/* Layout BB, TB & Status Gizi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/80 p-3.5 rounded-xl border border-gray-200">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-saas-dark">BB (Berat Badan - kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  placeholder="Contoh: 9.5"
                  value={editExamBB}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault();
                  }}
                  onChange={(e) => {
                    const val = e.target.value.replace(/-/g, "");
                    onEditExamMeasurementsChange(val, editExamTB, editExamDate);
                  }}
                  className="w-full p-2.5 bg-white border border-gray-250 rounded-input text-xs font-semibold text-saas-dark focus:outline-none focus:border-saas-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-saas-dark">TB (Tinggi Badan - cm)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  placeholder="Contoh: 74.2"
                  value={editExamTB}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault();
                  }}
                  onChange={(e) => {
                    const val = e.target.value.replace(/-/g, "");
                    onEditExamMeasurementsChange(editExamBB, val, editExamDate);
                  }}
                  className="w-full p-2.5 bg-white border border-gray-250 rounded-input text-xs font-semibold text-saas-dark focus:outline-none focus:border-saas-primary/50"
                />
              </div>
            </div>

            {/* Status Gizi Box */}
            <div className="bg-white p-3 rounded-lg border border-teal-200 shadow-2xs flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between border-b border-teal-100 pb-1.5">
                <h4 className="text-xs font-extrabold text-teal-900 uppercase tracking-wider">
                  Status Gizi
                </h4>
                <span className="text-[10px] text-teal-600 font-semibold">(otomatis)</span>
              </div>
              {!editExamBB || !editExamTB || parseFloat(editExamBB) <= 0 || parseFloat(editExamTB) <= 0 ? (
                <div className="flex flex-col items-center justify-center py-4 text-center space-y-1">
                  <p className="text-xs text-gray-400 font-semibold">Menunggu pengukuran</p>
                  <p className="text-[10px] text-gray-400">Isi BB dan TB untuk menghitung status gizi</p>
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-saas-muted">BB/U:</span>
                    <span
                      className={`px-2.5 py-1 rounded border text-[11px] ${getStatusBadgeStyle(
                        "BBU",
                        editExamBBU
                      )}`}
                    >
                      {editExamBBU}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-saas-muted">TB/U:</span>
                    <span
                      className={`px-2.5 py-1 rounded border text-[11px] ${getStatusBadgeStyle(
                        "TBU",
                        editExamTBU
                      )}`}
                    >
                      {editExamTBU}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-saas-muted">BB/TB:</span>
                    <span
                      className={`px-2.5 py-1 rounded border text-[11px] ${getStatusBadgeStyle(
                        "BBTB",
                        editExamBBTB
                      )}`}
                    >
                      {editExamBBTB}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lingkar Kepala & Lingkar Lengan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-saas-dark">Lingkar Kepala (LK - cm)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="Contoh: 45"
                value={editExamLK}
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault();
                }}
                onChange={(e) => setEditExamLK(e.target.value.replace(/-/g, ""))}
                className="w-full p-2.5 bg-gray-50 border border-gray-250 rounded-input text-xs font-semibold text-saas-dark focus:outline-none focus:border-saas-primary/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-saas-dark">Lingkar Lengan (LiLA - cm)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="Contoh: 12.5"
                value={editExamLiLA}
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault();
                }}
                onChange={(e) => setEditExamLiLA(e.target.value.replace(/-/g, ""))}
                className="w-full p-2.5 bg-gray-50 border border-gray-250 rounded-input text-xs font-semibold text-saas-dark focus:outline-none focus:border-saas-primary/50"
              />
            </div>
          </div>

          {/* ASI Eksklusif */}
          <div className="space-y-1.5 pt-2 border-t border-gray-100">
            <label className="text-xs font-bold text-saas-dark block">ASI Eksklusif:</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="edit-exam-asi"
                  checked={editExamAsi === true}
                  onChange={() => setEditExamAsi(true)}
                  className="w-4 h-4 text-saas-primary focus:ring-saas-primary/30"
                />
                <span className="text-xs font-bold text-saas-dark">Masih</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="edit-exam-asi"
                  checked={editExamAsi === false}
                  onChange={() => setEditExamAsi(false)}
                  className="w-4 h-4 text-saas-primary focus:ring-saas-primary/30"
                />
                <span className="text-xs font-bold text-saas-dark">Tidak</span>
              </label>
            </div>
          </div>

          {/* Vitamin & Pemberian Lain */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <label className="text-xs font-bold text-saas-dark block">Vitamin & Pemberian Lain:</label>
            <div className="flex flex-wrap items-center gap-2.5">
              <label className="flex items-center gap-2 cursor-pointer select-none bg-gray-50 px-3 py-2 rounded-md border border-gray-250 text-xs font-bold text-saas-dark hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={editExamVitA}
                  onChange={(e) => setEditExamVitA(e.target.checked)}
                  className="w-4 h-4 text-saas-primary rounded focus:ring-saas-primary/30"
                />
                <span className="text-saas-dark font-bold">Vitamin A</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none bg-gray-50 px-3 py-2 rounded-md border border-gray-250 text-xs font-bold text-saas-dark hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={editExamCacing}
                  onChange={(e) => setEditExamCacing(e.target.checked)}
                  className="w-4 h-4 text-saas-primary rounded focus:ring-saas-primary/30"
                />
                <span className="text-saas-dark font-bold">Obat Cacing</span>
              </label>
            </div>

            {/* Imunisasi / Catatan Pemberian Lain */}
            <div className="space-y-1.5 pt-1.5">
              <label className="text-xs font-bold text-saas-dark block">Imunisasi / Catatan Pemberian:</label>
              <input
                type="text"
                placeholder="Contoh: Polio 3, Campak, Zinc, Taburia..."
                value={editExamImunisasi}
                onChange={(e) => setEditExamImunisasi(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-250 rounded-input text-xs font-semibold text-saas-dark placeholder:text-gray-400 focus:outline-none focus:border-saas-primary/50"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsEditExamModalOpen(false)}
              className="px-4 py-2 border border-hairline rounded-full text-xs font-semibold text-saas-dark hover:bg-gray-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-saas-primary text-white rounded-full text-xs font-semibold hover:bg-teal-700 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL KONFIRMASI HAPUS PEMERIKSAAN BALITA */}
      <Modal
        isOpen={isDeleteExamModalOpen}
        onClose={() => setIsDeleteExamModalOpen(false)}
        title="Hapus Data Pemeriksaan"
      >
        <div className="space-y-4">
          <p className="text-sm text-saas-dark font-medium">
            Apakah Anda yakin ingin menghapus data catatan pemeriksaan bulanan balita ini?
          </p>
          <p className="text-xs text-saas-muted">
            Tindakan ini tidak dapat dibatalkan dan catatan pemeriksaan akan terhapus dari riwayat balita.
          </p>
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsDeleteExamModalOpen(false)}
              className="px-4 py-2 border border-hairline rounded-full text-xs font-semibold text-saas-dark hover:bg-gray-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onDeleteExamSubmit}
              disabled={isSaving}
              className="px-4 py-2 bg-trend-dangerText text-white rounded-full text-xs font-semibold hover:bg-red-700 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? "Menghapus..." : "Ya, Hapus Record"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
