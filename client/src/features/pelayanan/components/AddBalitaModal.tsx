"use client";

import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import Modal from "@/components/Modal";
import { balitaApi } from "@/lib/api";
import toast from "react-hot-toast";

export interface AddBalitaModalProps {
  isOpen: boolean;
  onClose: () => void;
  posyanduId: string;
  onSuccess: (newBalita: any) => void;
}

export default function AddBalitaModal({
  isOpen,
  onClose,
  posyanduId,
  onSuccess,
}: AddBalitaModalProps) {
  const [bNama, setBNama] = useState("");
  const [bNik, setBNik] = useState("");
  const [bTglLahir, setBTglLahir] = useState("2025-01-01");
  const [bJk, setBJk] = useState<"L" | "P">("L");
  const [bNamaIbu, setBNamaIbu] = useState("");
  const [bAlamat, setBAlamat] = useState("RT 01 / RW 02, Karanggayam");
  const [bError, setBError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setBNama("");
    setBNik("");
    setBTglLahir("2025-01-01");
    setBJk("L");
    setBNamaIbu("");
    setBAlamat("RT 01 / RW 02, Karanggayam");
    setBError("");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bNama || !bTglLahir || !bNamaIbu) {
      setBError("Nama anak, tanggal lahir, dan nama ibu wajib diisi!");
      return;
    }

    try {
      setIsSubmitting(true);
      setBError("");
      const res = await balitaApi.create(posyanduId, {
        nama: bNama,
        nik: bNik || undefined,
        tanggalLahir: bTglLahir,
        jenisKelamin: bJk,
        namaIbu: bNamaIbu,
        alamat: bAlamat,
      });

      if (res.data) {
        toast.success(`Balita ${bNama} berhasil didaftarkan!`);
        onSuccess(res.data);
        resetForm();
        onClose();
      }
    } catch (err: any) {
      setBError(err.message || "Gagal mendaftarkan balita.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setBError("");
      }}
      title="Daftarkan Balita Baru"
      description="Daftarkan identitas balita baru ke register sebelum mencatat data pemeriksaan bulanan."
      type="drawer"
    >
      <form onSubmit={handleRegister} className="space-y-4 pt-2 flex flex-col justify-between h-full">
        <div className="space-y-4">
          {bError && (
            <div className="p-3 bg-red-50 text-trend-dangerText border border-red-100 rounded-lg text-xs font-bold flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {bError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-saas-muted">Nama Lengkap Anak</label>
            <input
              type="text"
              placeholder="Contoh: Rafif Athar"
              value={bNama}
              onChange={(e) => setBNama(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-saas-muted">NIK (16 Digit - Opsional)</label>
            <input
              type="text"
              maxLength={16}
              placeholder="330102xxxxxxxxxx"
              value={bNik}
              onChange={(e) => setBNik(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-saas-muted">Tanggal Lahir</label>
              <input
                type="date"
                value={bTglLahir}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                onChange={(e) => setBTglLahir(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-saas-muted">Jenis Kelamin</label>
              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-saas-dark cursor-pointer select-none">
                  <input
                    type="radio"
                    name="b-jk-drawer"
                    checked={bJk === "L"}
                    onChange={() => setBJk("L")}
                    className="w-4 h-4 text-saas-primary focus:ring-saas-primary/30"
                  />
                  Laki-laki
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-saas-dark cursor-pointer select-none">
                  <input
                    type="radio"
                    name="b-jk-drawer"
                    checked={bJk === "P"}
                    onChange={() => setBJk("P")}
                    className="w-4 h-4 text-saas-primary focus:ring-saas-primary/30"
                  />
                  Perempuan
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-saas-muted">Nama Lengkap Ibu Kandung</label>
            <input
              type="text"
              placeholder="Contoh: Ibu Ranti"
              value={bNamaIbu}
              onChange={(e) => setBNamaIbu(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-saas-muted">Alamat Rumah (Jalan / RT / RW)</label>
            <input
              type="text"
              value={bAlamat}
              onChange={(e) => setBAlamat(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-6 border-t border-gray-100 mt-8 shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              setBError("");
            }}
            className="flex-1 py-3 border border-gray-200 text-saas-dark text-xs font-bold rounded-input hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3 bg-saas-primary hover:bg-teal-600 text-white text-xs font-bold rounded-input shadow-md shadow-teal-500/10 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Mendaftarkan..." : "Daftarkan & Pilih"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
