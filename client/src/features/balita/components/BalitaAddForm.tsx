"use client";

import React from "react";
import { ArrowLeft, AlertCircle, Plus } from "lucide-react";

export interface BalitaAddFormProps {
  onBack: () => void;
  formNama: string;
  setFormNama: (v: string) => void;
  formNik: string;
  setFormNik: (v: string) => void;
  formNoHp: string;
  setFormNoHp: (v: string) => void;
  formTglLahir: string;
  setFormTglLahir: (v: string) => void;
  formJk: "L" | "P";
  setFormJk: (v: "L" | "P") => void;
  formNamaIbu: string;
  setFormNamaIbu: (v: string) => void;
  formAlamat: string;
  setFormAlamat: (v: string) => void;
  formError: string;
  onSubmit: (e: React.FormEvent) => void;
}

export default function BalitaAddForm({
  onBack,
  formNama,
  setFormNama,
  formNik,
  setFormNik,
  formNoHp,
  setFormNoHp,
  formTglLahir,
  setFormTglLahir,
  formJk,
  setFormJk,
  formNamaIbu,
  setFormNamaIbu,
  formAlamat,
  setFormAlamat,
  formError,
  onSubmit,
}: BalitaAddFormProps) {
  return (
    <div className="space-y-6 max-w-xl mx-auto bg-white p-6 rounded-card shadow-soft-card border border-gray-100/70">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-saas-muted hover:text-saas-dark transition-colors mb-4 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Batal & Kembali
      </button>

      <div>
        <h3 className="font-bold text-lg text-saas-dark">Daftarkan Balita Baru</h3>
        <p className="text-xs text-saas-muted mt-0.5">
          Masukkan data identitas anak yang akan didaftarkan di Posyandu.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 pt-4">
        {formError && (
          <div className="p-3 bg-red-50 text-trend-dangerText border border-red-100 rounded-lg text-xs font-bold flex gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
          </div>
        )}

        {/* Nama */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-saas-muted">Nama Lengkap Anak</label>
          <input
            type="text"
            placeholder="Contoh: Muhammad Rafif"
            value={formNama}
            onChange={(e) => setFormNama(e.target.value)}
            className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
          />
        </div>

        {/* NIK */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-saas-muted">
            Nomor Induk Kependudukan (NIK - 16 digit, opsional)
          </label>
          <input
            type="text"
            maxLength={16}
            placeholder="Contoh: 330102xxxxxxxxxx"
            value={formNik}
            onChange={(e) => setFormNik(e.target.value)}
            className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
          />
        </div>

        {/* No. HP / WA */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-saas-muted">
            No. WhatsApp / HP Orang Tua (Opsional)
          </label>
          <input
            type="text"
            placeholder="Contoh: 081234567890"
            value={formNoHp}
            onChange={(e) => setFormNoHp(e.target.value)}
            className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Tanggal Lahir */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-saas-muted">Tanggal Lahir</label>
            <input
              type="date"
              value={formTglLahir}
              onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
              onChange={(e) => setFormTglLahir(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50 cursor-pointer"
            />
          </div>

          {/* Jenis Kelamin */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-saas-muted">Jenis Kelamin</label>
            <div className="flex gap-4 pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-saas-dark cursor-pointer select-none">
                <input
                  type="radio"
                  name="jk"
                  checked={formJk === "L"}
                  onChange={() => setFormJk("L")}
                  className="w-4 h-4 text-saas-primary focus:ring-saas-primary/30"
                />
                Laki-laki
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-saas-dark cursor-pointer select-none">
                <input
                  type="radio"
                  name="jk"
                  checked={formJk === "P"}
                  onChange={() => setFormJk("P")}
                  className="w-4 h-4 text-saas-primary focus:ring-saas-primary/30"
                />
                Perempuan
              </label>
            </div>
          </div>
        </div>

        {/* Nama Ibu */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-saas-muted">Nama Lengkap Ibu Kandung</label>
          <input
            type="text"
            placeholder="Contoh: Ibu Siti"
            value={formNamaIbu}
            onChange={(e) => setFormNamaIbu(e.target.value)}
            className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
          />
        </div>

        {/* Alamat */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-saas-muted">Alamat Rumah (RT/RW/Desa)</label>
          <textarea
            rows={2}
            placeholder="Contoh: RT 01 / RW 02, Desa Karanggayam"
            value={formAlamat}
            onChange={(e) => setFormAlamat(e.target.value)}
            className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 bg-saas-primary hover:bg-teal-600 text-white text-xs font-bold rounded-input shadow-md shadow-teal-500/10 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Daftarkan Anak
          </button>
        </div>
      </form>
    </div>
  );
}
