"use client";

import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import Modal from "@/components/Modal";
import { lansiaApi } from "@/lib/api";
import toast from "react-hot-toast";

export interface AddLansiaModalProps {
  isOpen: boolean;
  onClose: () => void;
  posyanduId: string;
  onSuccess: (newLansia: any) => void;
}

export default function AddLansiaModal({
  isOpen,
  onClose,
  posyanduId,
  onSuccess,
}: AddLansiaModalProps) {
  const [lNama, setLNama] = useState("");
  const [lNik, setLNik] = useState("");
  const [lBpjs, setLBpjs] = useState("");
  const [lTglLahir, setLTglLahir] = useState("1960-01-01");
  const [lJk, setLJk] = useState<"L" | "P">("L");
  const [lRtRw, setLRtRw] = useState("");
  const [lAlamat, setLAlamat] = useState("Desa Karanggayam");
  const [lHt, setLHt] = useState(false);
  const [lDm, setLDm] = useState(false);
  const [lKemandirian, setLKemandirian] = useState<"A" | "B" | "C">("A");
  const [lMental, setLMental] = useState("");
  const [lError, setLError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setLNama("");
    setLNik("");
    setLBpjs("");
    setLTglLahir("1960-01-01");
    setLJk("L");
    setLRtRw("");
    setLAlamat("Desa Karanggayam");
    setLHt(false);
    setLDm(false);
    setLKemandirian("A");
    setLMental("");
    setLError("");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lNama || !lNik || !lTglLahir) {
      setLError("Nama lansia, NIK 16 digit, dan tanggal lahir wajib diisi!");
      return;
    }

    if (lNik.length !== 16) {
      setLError("NIK harus tepat 16 digit angka!");
      return;
    }

    try {
      setIsSubmitting(true);
      setLError("");
      const res = await lansiaApi.create(posyanduId, {
        nama: lNama,
        nik: lNik,
        noBpjs: lBpjs || undefined,
        tanggalLahir: lTglLahir,
        jenisKelamin: lJk,
        alamat: lAlamat,
        rtRw: lRtRw || "01/01",
        tingkatKemandirian: lKemandirian,
        riwayatHt: lHt,
        riwayatDm: lDm,
        gangguanMentalEmosional: lMental || undefined,
      });

      if (res.data) {
        toast.success(`Lansia ${lNama} berhasil didaftarkan!`);
        onSuccess(res.data);
        resetForm();
        onClose();
      }
    } catch (err: any) {
      setLError(err.message || "Gagal mendaftarkan lansia.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setLError("");
      }}
      title="Daftarkan Lansia Baru"
      description="Daftarkan identitas lansia baru sebelum melakukan skrining kesehatan berkala."
      type="drawer"
    >
      <form onSubmit={handleRegister} className="space-y-4 pt-2 flex flex-col justify-between h-full">
        <div className="space-y-4">
          {lError && (
            <div className="p-3 bg-red-50 text-trend-dangerText border border-red-100 rounded-lg text-xs font-bold flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {lError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-saas-muted">Nama Lengkap Lansia</label>
            <input
              type="text"
              placeholder="Contoh: Mbah Joyo"
              value={lNama}
              onChange={(e) => setLNama(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-saas-muted">NIK (16 digit wajib)</label>
              <input
                type="text"
                maxLength={16}
                placeholder="NIK sesuai KTP"
                value={lNik}
                onChange={(e) => setLNik(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-saas-muted">No BPJS (Opsional)</label>
              <input
                type="text"
                placeholder="Nomor kartu BPJS"
                value={lBpjs}
                onChange={(e) => setLBpjs(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-saas-muted">Tanggal Lahir</label>
              <input
                type="date"
                value={lTglLahir}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                onChange={(e) => setLTglLahir(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-saas-muted">Jenis Kelamin</label>
              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-saas-dark cursor-pointer select-none">
                  <input
                    type="radio"
                    name="l-jk-drawer"
                    checked={lJk === "L"}
                    onChange={() => setLJk("L")}
                    className="w-4 h-4 text-saas-primary focus:ring-saas-primary/30"
                  />
                  Laki-laki
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-saas-dark cursor-pointer select-none">
                  <input
                    type="radio"
                    name="l-jk-drawer"
                    checked={lJk === "P"}
                    onChange={() => setLJk("P")}
                    className="w-4 h-4 text-saas-primary focus:ring-saas-primary/30"
                  />
                  Perempuan
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-gray-50 pt-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-saas-muted">RT / RW</label>
              <input
                type="text"
                placeholder="Cth: RT 02 / RW 02"
                value={lRtRw}
                onChange={(e) => setLRtRw(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-saas-muted">Status Kemandirian</label>
              <select
                value={lKemandirian}
                onChange={(e) => setLKemandirian(e.target.value as any)}
                className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
              >
                <option value="A">Kategori A (Mandiri)</option>
                <option value="B">Kategori B (Bantuan Sebagian)</option>
                <option value="C">Kategori C (Tergantung Total)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-saas-muted">Penyakit Bawaan (HT / DM)</label>
            <div className="flex gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={lHt}
                  onChange={(e) => setLHt(e.target.checked)}
                  className="w-4.5 h-4.5 text-saas-primary focus:ring-saas-primary/30"
                />
                <span className="text-xs font-bold text-saas-dark">Hipertensi</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={lDm}
                  onChange={(e) => setLDm(e.target.checked)}
                  className="w-4.5 h-4.5 text-saas-primary focus:ring-saas-primary/30"
                />
                <span className="text-xs font-bold text-saas-dark">Diabetes</span>
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-saas-muted">Catatan Skrining Mental (Opsional)</label>
            <input
              type="text"
              placeholder="Cth: Cenderung pikun"
              value={lMental}
              onChange={(e) => setLMental(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-saas-muted">Alamat Wilayah / Dusun</label>
            <input
              type="text"
              value={lAlamat}
              onChange={(e) => setLAlamat(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-6 border-t border-gray-100 mt-8 shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              setLError("");
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
