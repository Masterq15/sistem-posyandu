"use client";

import React from "react";
import { Plus } from "lucide-react";

export interface LansiaAddFormProps {
  onBack: () => void;
  formNama: string;
  setFormNama: (v: string) => void;
  formNik: string;
  setFormNik: (v: string) => void;
  formNoHp: string;
  setFormNoHp: (v: string) => void;
  formBpjs: string;
  setFormBpjs: (v: string) => void;
  formTglLahir: string;
  setFormTglLahir: (v: string) => void;
  formJk: "L" | "P";
  setFormJk: (v: "L" | "P") => void;
  formRtRw: string;
  setFormRtRw: (v: string) => void;
  formKemandirian: "A" | "B" | "C";
  setFormKemandirian: (v: "A" | "B" | "C") => void;
  formHt: boolean;
  setFormHt: (v: boolean) => void;
  formDm: boolean;
  setFormDm: (v: boolean) => void;
  formMental: string;
  setFormMental: (v: string) => void;
  formAlamat: string;
  setFormAlamat: (v: string) => void;
  formError: string;
  onSubmit: (e: React.FormEvent) => void;
}

export default function LansiaAddForm({
  onBack,
  formNama,
  setFormNama,
  formNik,
  setFormNik,
  formNoHp,
  setFormNoHp,
  formBpjs,
  setFormBpjs,
  formTglLahir,
  setFormTglLahir,
  formJk,
  setFormJk,
  formRtRw,
  setFormRtRw,
  formKemandirian,
  setFormKemandirian,
  formHt,
  setFormHt,
  formDm,
  setFormDm,
  formMental,
  setFormMental,
  formAlamat,
  setFormAlamat,
  formError,
  onSubmit,
}: LansiaAddFormProps) {
  return (
    <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 sm:p-8 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-saas-dark tracking-tight">Formulir Pendaftaran Lansia Baru</h2>
          <p className="text-xs text-saas-muted mt-0.5">Isi data profil dan kondisi kesehatan lansia secara lengkap.</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-bold text-saas-muted hover:text-saas-dark transition-colors cursor-pointer"
        >
          Batal &amp; Kembali
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {formError && (
          <div className="p-3 bg-red-50 text-trend-dangerText border border-red-100 rounded-lg text-xs font-bold">
            {formError}
          </div>
        )}

        {/* Nama Lengkap */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-saas-muted">Nama Lengkap Lansia *</label>
          <input
            type="text"
            placeholder="Contoh: Mbah Joyo"
            value={formNama}
            onChange={(e) => setFormNama(e.target.value)}
            className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
          />
        </div>

        {/* NIK, No. HP, No BPJS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-saas-muted">NIK (16 digit angka) *</label>
            <input
              type="text"
              maxLength={16}
              placeholder="330102xxxxxxxxxx"
              value={formNik}
              onChange={(e) => setFormNik(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-saas-muted">No. WhatsApp / HP (Opsional)</label>
            <input
              type="text"
              placeholder="Contoh: 081234567890"
              value={formNoHp}
              onChange={(e) => setFormNoHp(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-saas-muted">No. BPJS (Opsional)</label>
            <input
              type="text"
              placeholder="000123456789"
              value={formBpjs}
              onChange={(e) => setFormBpjs(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
            />
          </div>
        </div>

        {/* Tgl Lahir, JK & RT/RW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-saas-muted">Tanggal Lahir *</label>
            <input
              type="date"
              value={formTglLahir}
              onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
              onChange={(e) => setFormTglLahir(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-saas-muted">Jenis Kelamin *</label>
            <div className="flex gap-4 pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-saas-dark cursor-pointer select-none">
                <input
                  type="radio"
                  name="formJkLansia"
                  checked={formJk === "L"}
                  onChange={() => setFormJk("L")}
                />
                Laki-laki
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-saas-dark cursor-pointer select-none">
                <input
                  type="radio"
                  name="formJkLansia"
                  checked={formJk === "P"}
                  onChange={() => setFormJk("P")}
                />
                Perempuan
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-saas-muted">RT / RW *</label>
            <input
              type="text"
              placeholder="RT 02 / RW 02"
              value={formRtRw}
              onChange={(e) => setFormRtRw(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
            />
          </div>
        </div>

        {/* Status Kemandirian */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-saas-muted">Tingkat Kemandirian (Kategori ADL)</label>
          <select
            value={formKemandirian}
            onChange={(e) => setFormKemandirian(e.target.value as any)}
            className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
          >
            <option value="A">Kategori A (Mandiri Sepenuhnya)</option>
            <option value="B">Kategori B (Bantuan Sebagian)</option>
            <option value="C">Kategori C (Ketergantungan Total)</option>
          </select>
        </div>

        {/* Riwayat Penyakit */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-saas-muted">Riwayat Diagnosa Penyakit (HT / DM)</label>
          <div className="flex gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formHt}
                onChange={(e) => setFormHt(e.target.checked)}
                className="w-4.5 h-4.5 text-saas-primary border-gray-250 rounded focus:ring-saas-primary/30"
              />
              <span className="text-xs font-bold text-saas-dark">Hipertensi (Tekanan Darah Tinggi)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formDm}
                onChange={(e) => setFormDm(e.target.checked)}
                className="w-4.5 h-4.5 text-saas-primary border-gray-250 rounded focus:ring-saas-primary/30"
              />
              <span className="text-xs font-bold text-saas-dark">Diabetes Melitus (Gula Darah)</span>
            </label>
          </div>
        </div>

        {/* Catatan Mental Emosional */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-saas-muted">Catatan Skrining Mental Emosional (Opsional)</label>
          <input
            type="text"
            placeholder="Misal: Cenderung pikun, sering cemas, dll."
            value={formMental}
            onChange={(e) => setFormMental(e.target.value)}
            className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
          />
        </div>

        {/* Alamat */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-saas-muted">Alamat Wilayah / Dusun</label>
          <input
            type="text"
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
            <Plus className="w-3.5 h-3.5" /> Daftarkan Lansia
          </button>
        </div>
      </form>
    </div>
  );
}
