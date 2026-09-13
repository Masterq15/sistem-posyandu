"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import Modal from "@/components/Modal";
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-saas-muted">Tanggal Periksa</label>
              <input
                type="date"
                required
                value={editExamDate}
                onChange={(e) => setEditExamDate(e.target.value)}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-saas-muted">Berat Badan (kg)</label>
              <input
                type="number"
                step="0.1"
                required
                value={editExamBB}
                onChange={(e) =>
                  onEditExamMeasurementsChange(e.target.value, editExamTB, editExamDate)
                }
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-saas-muted">Tinggi Badan (cm)</label>
              <input
                type="number"
                step="0.1"
                required
                value={editExamTB}
                onChange={(e) =>
                  onEditExamMeasurementsChange(editExamBB, e.target.value, editExamDate)
                }
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-saas-muted">Lingkar Kepala (cm)</label>
              <input
                type="number"
                step="0.1"
                value={editExamLK}
                onChange={(e) => setEditExamLK(e.target.value)}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-saas-muted">Lingkar Lengan LiLA (cm)</label>
              <input
                type="number"
                step="0.1"
                value={editExamLiLA}
                onChange={(e) => setEditExamLiLA(e.target.value)}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
              />
            </div>
          </div>

          {/* Status Gizi Auto Z-Score */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-2">
            <p className="text-[11px] font-bold text-saas-muted uppercase tracking-wider">
              Status Gizi (Otomatis)
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-saas-muted block text-[10px]">BB/U:</span>
                <span className="font-bold text-saas-dark">{editExamBBU}</span>
              </div>
              <div>
                <span className="text-saas-muted block text-[10px]">TB/U:</span>
                <span className="font-bold text-saas-dark">{editExamTBU}</span>
              </div>
              <div>
                <span className="text-saas-muted block text-[10px]">BB/TB:</span>
                <span className="font-bold text-saas-dark">{editExamBBTB}</span>
              </div>
            </div>
          </div>

          {/* Intervensi Tambahan */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <label className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-150 rounded text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={editExamVitA}
                onChange={(e) => setEditExamVitA(e.target.checked)}
                className="w-4 h-4 text-saas-primary rounded"
              />
              Vitamin A
            </label>
            <label className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-150 rounded text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={editExamAsi}
                onChange={(e) => setEditExamAsi(e.target.checked)}
                className="w-4 h-4 text-saas-primary rounded"
              />
              ASI Eksklusif
            </label>
            <label className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-150 rounded text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={editExamCacing}
                onChange={(e) => setEditExamCacing(e.target.checked)}
                className="w-4 h-4 text-saas-primary rounded"
              />
              Obat Cacing
            </label>
            <div>
              <input
                type="text"
                placeholder="Imunisasi..."
                value={editExamImunisasi}
                onChange={(e) => setEditExamImunisasi(e.target.value)}
                className="w-full p-2 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
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
