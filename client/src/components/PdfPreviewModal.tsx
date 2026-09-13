"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { FileText, X, Loader2, AlertTriangle, CheckCircle2, Printer, Download } from "lucide-react";

export interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  isLoading: boolean;
  error: string | null;
  category: "Balita" | "Lansia" | string;
  periodeText: string;
  onRetry: () => void;
  onDownloadPdf: () => void;
  onDownloadExcel?: () => void;
  isExportingExcel?: boolean;
}

export default function PdfPreviewModal({
  isOpen,
  onClose,
  pdfUrl,
  isLoading,
  error,
  category,
  periodeText,
  onRetry,
  onDownloadPdf,
  onDownloadExcel,
  isExportingExcel = false,
}: PdfPreviewModalProps) {
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

  const handlePrint = () => {
    if (pdfUrl) {
      const iframe = document.getElementById("preview-pdf-frame") as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } else {
        window.open(pdfUrl, "_blank");
      }
    }
  };

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
                Pratinjau Laporan Register Posyandu
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                  {category}
                </span>
              </h3>
              <p className="text-[11px] text-gray-500">
                Periode: <span className="font-semibold text-gray-700">{periodeText}</span> • Format A4 Landscape Register Resmi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Tutup pratinjau (Esc / klik di luar)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Viewer */}
        <div className="flex-1 bg-gray-100 p-2 sm:p-3 overflow-hidden relative">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              <p className="text-sm font-semibold text-gray-700">Mempersiapkan pratinjau dokumen PDF...</p>
              <p className="text-xs text-gray-500 max-w-sm">Menyusun register format landscape resmi Posyandu...</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <AlertTriangle className="w-10 h-10 text-amber-500" />
              <p className="text-sm font-bold text-gray-900">Gagal Memuat Pratinjau</p>
              <p className="text-xs text-gray-600 max-w-md">{error}</p>
              <button
                type="button"
                onClick={onRetry}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-all"
              >
                Coba Lagi
              </button>
            </div>
          ) : pdfUrl ? (
            <iframe
              id="preview-pdf-frame"
              src={`${pdfUrl}#toolbar=1&navpanes=0`}
              title="Pratinjau PDF Laporan"
              className="w-full h-full rounded-xl border border-gray-300 shadow-sm bg-white"
            />
          ) : null}
        </div>

        {/* Modal Footer / Actions */}
        <div className="px-5 py-3 border-t border-gray-200 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-gray-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Dokumen siap dicetak atau diunduh</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Tutup
            </button>

            <button
              type="button"
              onClick={handlePrint}
              disabled={!pdfUrl || isLoading}
              className="px-3.5 py-2 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              title="Cetak langsung melalui browser"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>

            {onDownloadExcel && (
              <button
                type="button"
                onClick={onDownloadExcel}
                disabled={isExportingExcel}
                className="px-3.5 py-2 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                title="Unduh laporan dalam format Excel"
              >
                {isExportingExcel ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>Unduh Excel</span>
              </button>
            )}

            <button
              type="button"
              onClick={onDownloadPdf}
              disabled={!pdfUrl || isLoading}
              className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              title="Simpan dokumen PDF ke perangkat"
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
