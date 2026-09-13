"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import Modal from "@/components/Modal";
import { Lansia } from "../types";

export interface LansiaModalsProps {
  // Edit Lansia Modal
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
  editNama: string;
  setEditNama: (v: string) => void;
  editNik: string;
  setEditNik: (v: string) => void;
  editNoHp: string;
  setEditNoHp: (v: string) => void;
  editBpjs: string;
  setEditBpjs: (v: string) => void;
  editTglLahir: string;
  setEditTglLahir: (v: string) => void;
  editJk: "L" | "P";
  setEditJk: (v: "L" | "P") => void;
  editRtRw: string;
  setEditRtRw: (v: string) => void;
  editKemandirian: "A" | "B" | "C";
  setEditKemandirian: (v: "A" | "B" | "C") => void;
  editHt: boolean;
  setEditHt: (v: boolean) => void;
  editDm: boolean;
  setEditDm: (v: boolean) => void;
  editAlamat: string;
  setEditAlamat: (v: string) => void;
  editError: string;
  isSaving: boolean;
  onEditLansiaSubmit: (e: React.FormEvent) => void;

  // Delete Lansia Modal
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (open: boolean) => void;
  activeLansia: Lansia | null;
  onDeleteLansia: () => void;

  // Edit Exam Modal
  isEditExamModalOpen: boolean;
  setIsEditExamModalOpen: (open: boolean) => void;
  editExamError: string;
  editExamDate: string;
  setEditExamDate: (v: string) => void;
  editExamBB: string;
  setEditExamBB: (v: string) => void;
  editExamTB: string;
  setEditExamTB: (v: string) => void;
  editExamSistol: string;
  setEditExamSistol: (v: string) => void;
  editExamDiastol: string;
  setEditExamDiastol: (v: string) => void;
  editExamGds: string;
  setEditExamGds: (v: string) => void;
  editExamLp: string;
  setEditExamLp: (v: string) => void;
  editExamCholesterol: string;
  setEditExamCholesterol: (v: string) => void;
  editExamUricAcid: string;
  setEditExamUricAcid: (v: string) => void;
  editExamKeluhan: string;
  setEditExamKeluhan: (v: string) => void;
  editExamTindakan: string;
  setEditExamTindakan: (v: string) => void;
  onEditExamSubmit: (e: React.FormEvent) => void;

  // Delete Exam Modal
  isDeleteExamModalOpen: boolean;
  setIsDeleteExamModalOpen: (open: boolean) => void;
  onDeleteExamSubmit: () => void;
}

export default function LansiaModals({
  isEditModalOpen,
  setIsEditModalOpen,
  editNama,
  setEditNama,
  editNik,
  setEditNik,
  editNoHp,
  setEditNoHp,
  editBpjs,
  setEditBpjs,
  editTglLahir,
  setEditTglLahir,
  editJk,
  setEditJk,
  editRtRw,
  setEditRtRw,
  editKemandirian,
  setEditKemandirian,
  editHt,
  setEditHt,
  editDm,
  setEditDm,
  editAlamat,
  setEditAlamat,
  editError,
  isSaving,
  onEditLansiaSubmit,
  isDeleteModalOpen,
  setIsDeleteModalOpen,
  activeLansia,
  onDeleteLansia,
  isEditExamModalOpen,
  setIsEditExamModalOpen,
  editExamError,
  editExamDate,
  setEditExamDate,
  editExamBB,
  setEditExamBB,
  editExamTB,
  setEditExamTB,
  editExamSistol,
  setEditExamSistol,
  editExamDiastol,
  setEditExamDiastol,
  editExamGds,
  setEditExamGds,
  editExamLp,
  setEditExamLp,
  editExamCholesterol,
  setEditExamCholesterol,
  editExamUricAcid,
  setEditExamUricAcid,
  editExamKeluhan,
  setEditExamKeluhan,
  editExamTindakan,
  setEditExamTindakan,
  onEditExamSubmit,
  isDeleteExamModalOpen,
  setIsDeleteExamModalOpen,
  onDeleteExamSubmit,
}: LansiaModalsProps) {
  return (
    <>
      {/* MODAL EDIT LANSIA */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profil Lansia"
      >
        <form onSubmit={onEditLansiaSubmit} className="space-y-4">
          {editError && (
            <div className="p-3 bg-red-50 text-trend-dangerText border border-red-100 rounded-lg text-xs font-bold">
              {editError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-saas-dark">Nama Lengkap Lansia</label>
            <input
              type="text"
              required
              value={editNama}
              onChange={(e) => setEditNama(e.target.value)}
              className="w-full p-2.5 border border-hairline rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-saas-dark">NIK (16 digit)</label>
              <input
                type="text"
                required
                maxLength={16}
                value={editNik}
                onChange={(e) => setEditNik(e.target.value)}
                className="w-full p-2.5 border border-hairline rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-saas-dark">No. HP / WA (Opsional)</label>
              <input
                type="text"
                value={editNoHp}
                onChange={(e) => setEditNoHp(e.target.value)}
                placeholder="081234567890"
                className="w-full p-2.5 border border-hairline rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-saas-dark">No. BPJS (Opsional)</label>
              <input
                type="text"
                value={editBpjs}
                onChange={(e) => setEditBpjs(e.target.value)}
                className="w-full p-2.5 border border-hairline rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
              />
            </div>
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
                    name="editJkLansia"
                    checked={editJk === "L"}
                    onChange={() => setEditJk("L")}
                  />
                  Laki-laki
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-saas-dark cursor-pointer">
                  <input
                    type="radio"
                    name="editJkLansia"
                    checked={editJk === "P"}
                    onChange={() => setEditJk("P")}
                  />
                  Perempuan
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-saas-dark">RT / RW</label>
              <input
                type="text"
                required
                value={editRtRw}
                onChange={(e) => setEditRtRw(e.target.value)}
                className="w-full p-2.5 border border-hairline rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-saas-dark">Tingkat Kemandirian</label>
              <select
                value={editKemandirian}
                onChange={(e) => setEditKemandirian(e.target.value as any)}
                className="w-full p-2.5 border border-hairline rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
              >
                <option value="A">Kategori A (Mandiri)</option>
                <option value="B">Kategori B (Bantuan Sebagian)</option>
                <option value="C">Kategori C (Ketergantungan Total)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-saas-dark">Riwayat Penyakit</label>
            <div className="flex gap-6 pt-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-saas-dark cursor-pointer">
                <input
                  type="checkbox"
                  checked={editHt}
                  onChange={(e) => setEditHt(e.target.checked)}
                />
                Hipertensi (HT)
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-saas-dark cursor-pointer">
                <input
                  type="checkbox"
                  checked={editDm}
                  onChange={(e) => setEditDm(e.target.checked)}
                />
                Diabetes Mellitus (DM)
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-saas-dark">Alamat / Dusun</label>
            <input
              type="text"
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
              className="px-4 py-2 border border-hairline rounded-pill text-xs font-semibold text-saas-dark hover:bg-surface-soft cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-saas-primary text-white rounded-pill text-xs font-semibold hover:bg-saas-primary-active disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL KONFIRMASI HAPUS LANSIA */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Profil Lansia"
      >
        <div className="space-y-4">
          <p className="text-sm text-saas-dark font-medium">
            Apakah Anda yakin ingin menghapus data profil lansia <span className="font-bold text-trend-dangerText">{activeLansia?.nama}</span>?
          </p>
          <p className="text-xs text-saas-muted">
            Seluruh riwayat pemeriksaan medis lansia ini juga akan dihapus secara permanen dari sistem.
          </p>
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-hairline rounded-pill text-xs font-semibold text-saas-dark hover:bg-surface-soft cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onDeleteLansia}
              disabled={isSaving}
              className="px-4 py-2 bg-trend-dangerText text-white rounded-pill text-xs font-semibold hover:bg-red-700 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? "Menghapus..." : "Ya, Hapus Permanen"}
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL EDIT PEMERIKSAAN LANSIA */}
      <Modal
        isOpen={isEditExamModalOpen}
        onClose={() => setIsEditExamModalOpen(false)}
        title="Edit Riwayat Pemeriksaan Lansia"
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
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                onChange={(e) => setEditExamDate(e.target.value)}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-saas-muted">Berat Badan (kg)</label>
              <input
                type="number"
                step="0.1"
                required
                value={editExamBB}
                onChange={(e) => setEditExamBB(e.target.value)}
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
                onChange={(e) => setEditExamTB(e.target.value)}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-saas-muted">Tekanan Darah (Sistol)</label>
              <input
                type="number"
                required
                placeholder="mmHg"
                value={editExamSistol}
                onChange={(e) => setEditExamSistol(e.target.value)}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-saas-muted">Tekanan Darah (Diastol)</label>
              <input
                type="number"
                required
                placeholder="mmHg"
                value={editExamDiastol}
                onChange={(e) => setEditExamDiastol(e.target.value)}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-saas-muted">GDS (mg/dL)</label>
              <input
                type="number"
                step="0.1"
                required
                value={editExamGds}
                onChange={(e) => setEditExamGds(e.target.value)}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-saas-muted">Lingkar Perut (cm)</label>
              <input
                type="number"
                step="0.1"
                required
                value={editExamLp}
                onChange={(e) => setEditExamLp(e.target.value)}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-saas-muted">Kolesterol Total (opsional)</label>
              <input
                type="number"
                step="0.1"
                placeholder="mg/dL"
                value={editExamCholesterol}
                onChange={(e) => setEditExamCholesterol(e.target.value)}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-saas-muted">Asam Urat (opsional)</label>
              <input
                type="number"
                step="0.1"
                placeholder="mg/dL"
                value={editExamUricAcid}
                onChange={(e) => setEditExamUricAcid(e.target.value)}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-saas-muted">Keluhan Utama</label>
              <textarea
                rows={2}
                placeholder="Contoh: Pusing, keluhan sendi..."
                value={editExamKeluhan}
                onChange={(e) => setEditExamKeluhan(e.target.value)}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-saas-muted">Tindakan / Intervensi</label>
              <textarea
                rows={2}
                placeholder="Contoh: Edukasi pola makan, rujukan..."
                value={editExamTindakan}
                onChange={(e) => setEditExamTindakan(e.target.value)}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsEditExamModalOpen(false)}
              className="px-4 py-2 border border-hairline rounded-pill text-xs font-semibold text-saas-dark hover:bg-surface-soft cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-saas-primary text-white rounded-pill text-xs font-semibold hover:bg-saas-primary-active disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL KONFIRMASI HAPUS PEMERIKSAAN LANSIA */}
      <Modal
        isOpen={isDeleteExamModalOpen}
        onClose={() => setIsDeleteExamModalOpen(false)}
        title="Hapus Data Pemeriksaan"
      >
        <div className="space-y-4">
          <p className="text-sm text-saas-dark font-medium">
            Apakah Anda yakin ingin menghapus catatan pemeriksaan kesehatan lansia ini?
          </p>
          <p className="text-xs text-saas-muted">
            Tindakan ini tidak dapat dibatalkan dan catatan pemeriksaan akan terhapus dari riwayat lansia.
          </p>
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsDeleteExamModalOpen(false)}
              className="px-4 py-2 border border-hairline rounded-pill text-xs font-semibold text-saas-dark hover:bg-surface-soft cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onDeleteExamSubmit}
              disabled={isSaving}
              className="px-4 py-2 bg-trend-dangerText text-white rounded-pill text-xs font-semibold hover:bg-red-700 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? "Menghapus..." : "Ya, Hapus Record"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
