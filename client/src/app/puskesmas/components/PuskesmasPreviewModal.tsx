"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FileText,
  X,
  CheckCircle2,
  Printer,
  Download,
  Loader2,
} from "lucide-react";
import { PublicPemeriksaanItem } from "@/lib/api";
import { RekapanBalita, RekapanLansia, extractPemberianLain } from "@/features/laporan/types";

export interface PuskesmasPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: "Balita" | "Lansia";
  periodeText: string;
  selectedPosyanduName: string;
  rekapanBalita: RekapanBalita;
  rekapanLansia: RekapanLansia;
  filteredBalitaLogs: PublicPemeriksaanItem[];
  filteredLansiaLogs: PublicPemeriksaanItem[];
  exportingExcel: boolean;
  onExportExcel: () => void;
  onPrintPdf: () => void;
}

export default function PuskesmasPreviewModal({
  isOpen,
  onClose,
  activeTab,
  periodeText,
  selectedPosyanduName,
  rekapanBalita,
  rekapanLansia,
  filteredBalitaLogs,
  filteredLansiaLogs,
  exportingExcel,
  onExportExcel,
  onPrintPdf,
}: PuskesmasPreviewModalProps) {
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{ margin: 0 }}
      className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] !m-0 !mt-0 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-5 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-6xl h-[92vh] rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden relative"
      >
        {/* Modal Header */}
        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50/90">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                Pratinjau Laporan Register Puskesmas
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                  {activeTab}
                </span>
              </h3>
              <p className="text-[11px] text-gray-500">
                Periode: <span className="font-semibold text-gray-700">{periodeText}</span> • Format Standar Register A4 Landscape
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              title="Tutup pratinjau (Esc / klik di luar)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Lembar Dokumen Resmi Standar Pemerintah */}
        <div className="flex-1 bg-gray-100 p-3 sm:p-6 overflow-y-auto">
          <div
            id="printable-report-document"
            className="bg-white mx-auto shadow-md border border-gray-200 rounded-lg p-6 sm:p-8 max-w-5xl space-y-6 text-gray-900 font-sans"
          >
            {/* KOP RESMI LAPORAN REGISTER PUSKESMAS */}
            <div className="text-center space-y-1 border-b-2 border-teal-700 pb-3">
              <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
                PEMERINTAH KABUPATEN KEBUMEN • DINAS KESEHATAN
              </p>
              <h2 className="text-lg font-black tracking-tight text-gray-900 uppercase">
                UPTD PUSKESMAS WILAYAH KERJA KECAMATAN
              </h2>
              <h3 className="text-sm font-extrabold text-teal-800 tracking-wide uppercase">
                REGISTER REKAPITULASI CATATAN PEMERIKSAAN {activeTab.toUpperCase()}
              </h3>
              <p className="text-xs font-semibold text-gray-600">
                Periode: {periodeText} • Posyandu: {selectedPosyanduName}
              </p>
            </div>

            {/* Ringkasan Statistik Singkat Register */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs">
              <div>
                <span className="text-gray-500 font-semibold block text-[10px] uppercase">Total Pemeriksaan</span>
                <strong className="text-base text-gray-900">
                  {activeTab === "Balita" ? rekapanBalita.totalPemeriksaan : rekapanLansia.totalPemeriksaan}
                </strong>
              </div>
              <div>
                <span className="text-gray-500 font-semibold block text-[10px] uppercase">
                  Total Peserta ({activeTab})
                </span>
                <strong className="text-base text-gray-900">
                  {activeTab === "Balita" ? `${rekapanBalita.totalAnak} Anak` : `${rekapanLansia.totalOrang} Orang`}
                </strong>
              </div>
              {activeTab === "Balita" ? (
                <>
                  <div>
                    <span className="text-gray-500 font-semibold block text-[10px] uppercase">Gizi Normal</span>
                    <strong className="text-base text-emerald-700">{rekapanBalita.statusBbTb.normal}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 font-semibold block text-[10px] uppercase">Stunting / Kurang</span>
                    <strong className="text-base text-red-700">
                      {rekapanBalita.statusTbU.pendek + rekapanBalita.statusTbU.sangatPendek + rekapanBalita.statusBbTb.sangatKurang}
                    </strong>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-gray-500 font-semibold block text-[10px] uppercase">Tekanan Darah Normal</span>
                    <strong className="text-base text-emerald-700">
                      {rekapanLansia.statusTd.normal}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-500 font-semibold block text-[10px] uppercase">Hipertensi / GDS &ge;200</span>
                    <strong className="text-base text-red-700">
                      {rekapanLansia.kasusHipertensi} HT / {rekapanLansia.kasusDiabetes} DM
                    </strong>
                  </div>
                </>
              )}
            </div>

            {/* Tabel Dokumen Resmi */}
            <div className="overflow-x-auto border border-gray-300 rounded">
              {activeTab === "Balita" ? (
                <table className="w-full text-[10px] border-collapse">
                  <thead className="bg-gray-100 border-b border-gray-300 font-bold text-gray-800">
                    <tr>
                      <th className="border border-gray-300 px-1.5 py-1 text-center w-8">No</th>
                      <th className="border border-gray-300 px-2 py-1 text-left">Nama Balita</th>
                      <th className="border border-gray-300 px-2 py-1 text-left">Posyandu</th>
                      <th className="border border-gray-300 px-1.5 py-1 text-center">Tgl Periksa</th>
                      <th className="border border-gray-300 px-1.5 py-1 text-center">Tgl Lahir</th>
                      <th className="border border-gray-300 px-2 py-1 text-left">Nama Ibu</th>
                      <th className="border border-gray-300 px-1 py-1 text-center w-6">JK</th>
                      <th className="border border-gray-300 px-1 py-1 text-center">Usia</th>
                      <th className="border border-gray-300 px-1.5 py-1 text-right">BB</th>
                      <th className="border border-gray-300 px-1.5 py-1 text-right">TB</th>
                      <th className="border border-gray-300 px-1.5 py-1 text-center">BB/U</th>
                      <th className="border border-gray-300 px-1.5 py-1 text-center">TB/U</th>
                      <th className="border border-gray-300 px-1.5 py-1 text-center">BB/TB</th>
                      <th className="border border-gray-300 px-1 py-1 text-center">ASI</th>
                      <th className="border border-gray-300 px-1 py-1 text-center">Vit A</th>
                      <th className="border border-gray-300 px-1 py-1 text-center">Cacing</th>
                      <th className="border border-gray-300 px-2 py-1 text-left">Pemberian Lain</th>
                      <th className="border border-gray-300 px-2 py-1 text-left">Petugas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBalitaLogs.length === 0 ? (
                      <tr>
                        <td colSpan={18} className="py-6 text-center text-gray-500 font-medium">
                          Tidak ada data untuk dicetak pada periode ini.
                        </td>
                      </tr>
                    ) : (
                      filteredBalitaLogs.map((log, idx) => (
                        <tr key={log.id} className="border-b border-gray-200">
                          <td className="border border-gray-300 px-1.5 py-1 text-center">{idx + 1}</td>
                          <td className="border border-gray-300 px-2 py-1 font-bold text-gray-900">{log.namaWarga}</td>
                          <td className="border border-gray-300 px-2 py-1">{log.posyanduNama}</td>
                          <td className="border border-gray-300 px-1.5 py-1 text-center">{log.tanggalPeriksa}</td>
                          <td className="border border-gray-300 px-1.5 py-1 text-center">{log.tanggalLahir || "-"}</td>
                          <td className="border border-gray-300 px-2 py-1">{log.namaIbu || "-"}</td>
                          <td className="border border-gray-300 px-1 py-1 text-center">{log.jenisKelamin}</td>
                          <td className="border border-gray-300 px-1 py-1 text-center">{log.usiaInfo}</td>
                          <td className="border border-gray-300 px-1.5 py-1 text-right font-semibold">{log.beratBadan}</td>
                          <td className="border border-gray-300 px-1.5 py-1 text-right font-semibold">{log.tinggiBadan}</td>
                          <td className="border border-gray-300 px-1.5 py-1 text-center">{log.statusBbU || "-"}</td>
                          <td className="border border-gray-300 px-1.5 py-1 text-center">{log.statusTbU || "-"}</td>
                          <td className="border border-gray-300 px-1.5 py-1 text-center">{log.statusRingkasan || log.statusBbTb || "-"}</td>
                          <td className="border border-gray-300 px-1 py-1 text-center">{log.asiEksklusif ? "Ya" : "Tdk"}</td>
                          <td className="border border-gray-300 px-1 py-1 text-center">{log.vitaminA ? "Ya" : "Tdk"}</td>
                          <td className="border border-gray-300 px-1 py-1 text-center">{log.obatCacing ? "Ya" : "Tdk"}</td>
                          <td className="border border-gray-300 px-2 py-1">{extractPemberianLain(log.statusImunisasi)}</td>
                          <td className="border border-gray-300 px-2 py-1">{log.petugas || "Kader"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-[10px] border-collapse">
                  <thead className="bg-gray-100 border-b border-gray-300 font-bold text-gray-800">
                    <tr>
                      <th className="border border-gray-300 px-1.5 py-1 text-center w-8">No</th>
                      <th className="border border-gray-300 px-2 py-1 text-left">Nama Lansia</th>
                      <th className="border border-gray-300 px-2 py-1 text-left">Posyandu</th>
                      <th className="border border-gray-300 px-1.5 py-1 text-center">Tgl Periksa</th>
                      <th className="border border-gray-300 px-1 py-1 text-center w-6">JK</th>
                      <th className="border border-gray-300 px-1 py-1 text-center">Usia</th>
                      <th className="border border-gray-300 px-1 py-1 text-center">HT</th>
                      <th className="border border-gray-300 px-1 py-1 text-center">DM</th>
                      <th className="border border-gray-300 px-1.5 py-1 text-center">TD (mmHg)</th>
                      <th className="border border-gray-300 px-1.5 py-1 text-center">GDS</th>
                      <th className="border border-gray-300 px-1.5 py-1 text-center">Kolesterol</th>
                      <th className="border border-gray-300 px-1.5 py-1 text-center">Asam Urat</th>
                      <th className="border border-gray-300 px-1.5 py-1 text-left">Keluhan</th>
                      <th className="border border-gray-300 px-2 py-1 text-left">Tindakan Medis</th>
                      <th className="border border-gray-300 px-2 py-1 text-left">Status</th>
                      <th className="border border-gray-300 px-2 py-1 text-left">Petugas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLansiaLogs.length === 0 ? (
                      <tr>
                        <td colSpan={16} className="py-6 text-center text-gray-500 font-medium">
                          Tidak ada data untuk dicetak pada periode ini.
                        </td>
                      </tr>
                    ) : (
                      filteredLansiaLogs.map((log, idx) => (
                        <tr key={log.id} className="border-b border-gray-200">
                          <td className="border border-gray-300 px-1.5 py-1 text-center">{idx + 1}</td>
                          <td className="border border-gray-300 px-2 py-1 font-bold text-gray-900">{log.namaWarga}</td>
                          <td className="border border-gray-300 px-2 py-1">{log.posyanduNama}</td>
                          <td className="border border-gray-300 px-1.5 py-1 text-center">{log.tanggalPeriksa}</td>
                          <td className="border border-gray-300 px-1 py-1 text-center">{log.jenisKelamin}</td>
                          <td className="border border-gray-300 px-1 py-1 text-center">{log.usiaInfo || "-"}</td>
                          <td className="border border-gray-300 px-1 py-1 text-center">{log.riwayatHt ? "Ya" : "Tdk"}</td>
                          <td className="border border-gray-300 px-1 py-1 text-center">{log.riwayatDm ? "Ya" : "Tdk"}</td>
                          <td className="border border-gray-300 px-1.5 py-1 text-center font-semibold">
                            {log.tekananDarah || (log.sistol ? `${log.sistol}/${log.diastol}` : "-")}
                          </td>
                          <td className="border border-gray-300 px-1.5 py-1 text-center font-semibold">{log.gds || "-"}</td>
                          <td className="border border-gray-300 px-1.5 py-1 text-center">{log.kolesterol || "-"}</td>
                          <td className="border border-gray-300 px-1.5 py-1 text-center">{log.asamUrat || "-"}</td>
                          <td className="border border-gray-300 px-2 py-1">{log.keluhan || "-"}</td>
                          <td className="border border-gray-300 px-2 py-1">{log.tindakan || log.tindakanCatatan || "-"}</td>
                          <td className="border border-gray-300 px-2 py-1">{log.statusRingkasan || "-"}</td>
                          <td className="border border-gray-300 px-2 py-1">{log.petugas || "Kader"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Lembar Tanda Tangan / Pengesahan Resmi */}
            <div className="pt-6 grid grid-cols-2 gap-8 text-xs">
              <div className="text-center space-y-14">
                <p className="font-semibold text-gray-700">Mengetahui,<br />Kepala UPTD Puskesmas</p>
                <div>
                  <p className="font-bold underline text-gray-900">( .................................................. )</p>
                  <p className="text-[11px] text-gray-500">NIP. ..................................................</p>
                </div>
              </div>
              <div className="text-center space-y-14">
                <p className="font-semibold text-gray-700">
                  Kebumen, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}<br />
                  Koordinator Program Promkes / Bidan Desa
                </p>
                <div>
                  <p className="font-bold underline text-gray-900">( .................................................. )</p>
                  <p className="text-[11px] text-gray-500">Petugas Puskesmas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer / Action Buttons */}
        <div className="px-5 py-3 border-t border-gray-200 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-gray-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Dokumen register siap dicetak atau disimpan format PDF</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            >
              Tutup
            </button>

            <button
              type="button"
              onClick={onPrintPdf}
              className="px-3.5 py-2 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Cetak langsung menggunakan printer atau Simpan sebagai PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak (Print)</span>
            </button>

            <button
              type="button"
              onClick={onExportExcel}
              disabled={exportingExcel}
              className="px-3.5 py-2 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
              title="Unduh laporan dalam format spreadsheet Excel"
            >
              {exportingExcel ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>Unduh Excel</span>
            </button>

            <button
              type="button"
              onClick={onPrintPdf}
              className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Buka dialog cetak untuk Simpan sebagai PDF Landscape"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
