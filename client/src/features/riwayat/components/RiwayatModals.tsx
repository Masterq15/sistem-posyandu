"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import Modal from "@/components/Modal";
import { ItemRiwayat } from "@/lib/api";

export interface RiwayatModalsProps {
  isEditModalOpen: boolean;
  setIsEditModalOpen: (val: boolean) => void;
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (val: boolean) => void;
  selectedLog: ItemRiwayat | null;
  handleEditSubmit: (e: React.FormEvent) => void;
  handleDeleteSubmit: () => void;
  formError: string;
  saving: boolean;

  // Balita fields
  bDate: string;
  setBDate: (v: string) => void;
  bBB: string;
  setBBB: (v: string) => void;
  bTB: string;
  setBTB: (v: string) => void;
  bLK: string;
  setBLK: (v: string) => void;
  bLiLA: string;
  setBLiLA: (v: string) => void;
  bVitA: boolean;
  setBVitA: (v: boolean) => void;
  bAsi: boolean;
  setBAsi: (v: boolean) => void;
  bCacing: boolean;
  setBCacing: (v: boolean) => void;
  bImunisasi: string;
  setBImunisasi: (v: string) => void;
  bPetugas: string;
  setBPetugas: (v: string) => void;

  // Lansia fields
  lDate: string;
  setLDate: (v: string) => void;
  lBB: string;
  setLBB: (v: string) => void;
  lTB: string;
  setLTB: (v: string) => void;
  lSistol: string;
  setLSistol: (v: string) => void;
  lDiastol: string;
  setLDiastol: (v: string) => void;
  lGds: string;
  setLGds: (v: string) => void;
  lLp: string;
  setLLp: (v: string) => void;
  lKol: string;
  setLKol: (v: string) => void;
  lUrat: string;
  setLUrat: (v: string) => void;
  lKeluhan: string;
  setLKeluhan: (v: string) => void;
  lTindakan: string;
  setLTindakan: (v: string) => void;
}

export default function RiwayatModals({
  isEditModalOpen,
  setIsEditModalOpen,
  isDeleteModalOpen,
  setIsDeleteModalOpen,
  selectedLog,
  handleEditSubmit,
  handleDeleteSubmit,
  formError,
  saving,
  bDate,
  setBDate,
  bBB,
  setBBB,
  bTB,
  setBTB,
  bLK,
  setBLK,
  bLiLA,
  setBLiLA,
  bVitA,
  setBVitA,
  bAsi,
  setBAsi,
  bCacing,
  setBCacing,
  bImunisasi,
  setBImunisasi,
  bPetugas,
  setBPetugas,
  lDate,
  setLDate,
  lBB,
  setLBB,
  lTB,
  setLTB,
  lSistol,
  setLSistol,
  lDiastol,
  setLDiastol,
  lGds,
  setLGds,
  lLp,
  setLLp,
  lKol,
  setLKol,
  lUrat,
  setLUrat,
  lKeluhan,
  setLKeluhan,
  lTindakan,
  setLTindakan,
}: RiwayatModalsProps) {
  return (
    <>
      {/* MODAL EDIT PEMERIKSAAN (BALITA / LANSIA) */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Riwayat Periksa - ${selectedLog?.nama || ""}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 text-trend-dangerText border border-red-100 rounded-lg text-xs font-bold flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
            </div>
          )}

          {selectedLog?.tipe === "Balita" ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-saas-muted">Tanggal Periksa</label>
                  <input
                    type="date"
                    required
                    value={bDate}
                    onChange={(e) => setBDate(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary text-gray-900 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-saas-muted">Berat Badan (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={bBB}
                    onChange={(e) => setBBB(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-saas-muted">Tinggi Badan (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={bTB}
                    onChange={(e) => setBTB(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-saas-muted">Lingkar Kepala (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={bLK}
                    onChange={(e) => setBLK(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-saas-muted">LiLA (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={bLiLA}
                    onChange={(e) => setBLiLA(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <label className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-150 rounded text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bVitA}
                    onChange={(e) => setBVitA(e.target.checked)}
                    className="w-4 h-4 text-saas-primary rounded"
                  />
                  <span className="text-gray-900">Vitamin A</span>
                </label>
                <label className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-150 rounded text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bAsi}
                    onChange={(e) => setBAsi(e.target.checked)}
                    className="w-4 h-4 text-saas-primary rounded"
                  />
                  <span className="text-gray-900">ASI Eksklusif</span>
                </label>
                <label className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-150 rounded text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bCacing}
                    onChange={(e) => setBCacing(e.target.checked)}
                    className="w-4 h-4 text-saas-primary rounded"
                  />
                  <span className="text-gray-900">Obat Cacing</span>
                </label>
                <div>
                  <input
                    type="text"
                    placeholder="Pemberian Lain / Imunisasi..."
                    value={bImunisasi}
                    onChange={(e) => setBImunisasi(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-saas-muted">
                  Nama Petugas / Kader Pemeriksa
                </label>
                <input
                  type="text"
                  placeholder="Nama Petugas..."
                  value={bPetugas}
                  onChange={(e) => setBPetugas(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary mt-1 text-gray-900"
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-saas-muted">Tanggal Periksa</label>
                  <input
                    type="date"
                    required
                    value={lDate}
                    onChange={(e) => setLDate(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary text-gray-900 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-saas-muted">Berat Badan (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={lBB}
                    onChange={(e) => setLBB(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-saas-muted">Tinggi Badan (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={lTB}
                    onChange={(e) => setLTB(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-saas-muted">Sistol (mmHg)</label>
                  <input
                    type="number"
                    required
                    value={lSistol}
                    onChange={(e) => setLSistol(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-saas-muted">Diastol (mmHg)</label>
                  <input
                    type="number"
                    required
                    value={lDiastol}
                    onChange={(e) => setLDiastol(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-saas-muted">GDS (mg/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={lGds}
                    onChange={(e) => setLGds(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary text-gray-900"
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
                    value={lLp}
                    onChange={(e) => setLLp(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-saas-muted">Kolesterol (mg/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={lKol}
                    onChange={(e) => setLKol(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-saas-muted">Asam Urat (mg/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={lUrat}
                    onChange={(e) => setLUrat(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-saas-muted">Keluhan</label>
                  <textarea
                    rows={2}
                    value={lKeluhan}
                    onChange={(e) => setLKeluhan(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-saas-muted">Tindakan</label>
                  <textarea
                    rows={2}
                    value={lTindakan}
                    onChange={(e) => setLTindakan(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary text-gray-900"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 border border-hairline rounded-pill text-xs font-semibold text-saas-dark hover:bg-surface-soft cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-saas-primary text-white rounded-pill text-xs font-semibold hover:bg-saas-primary-active disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL KONFIRMASI HAPUS PEMERIKSAAN */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Record Riwayat Periksa"
      >
        <div className="space-y-4">
          <p className="text-sm text-saas-dark font-medium">
            Apakah Anda yakin ingin menghapus catatan riwayat pemeriksaan untuk{" "}
            <span className="font-bold text-trend-dangerText">{selectedLog?.nama}</span>?
          </p>
          <p className="text-xs text-saas-muted">
            Catatan pemeriksaan ini akan terhapus secara permanen dari sistem Posyandu.
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
              onClick={handleDeleteSubmit}
              disabled={saving}
              className="px-4 py-2 bg-trend-dangerText text-white rounded-pill text-xs font-semibold hover:bg-red-700 disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Menghapus..." : "Ya, Hapus Record"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
