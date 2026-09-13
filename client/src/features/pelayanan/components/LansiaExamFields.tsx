"use client";

import React from "react";

export interface LansiaExamFieldsProps {
  examBB: string;
  setExamBB: (v: string) => void;
  examTB: string;
  setExamTB: (v: string) => void;
  examSistol: string;
  setExamSistol: (v: string) => void;
  examDiastol: string;
  setExamDiastol: (v: string) => void;
  examGds: string;
  setExamGds: (v: string) => void;
  examLp: string;
  setExamLp: (v: string) => void;
  examCholesterol: string;
  setExamCholesterol: (v: string) => void;
  examUricAcid: string;
  setExamUricAcid: (v: string) => void;
  examKeluhan: string;
  setExamKeluhan: (v: string) => void;
  examTindakan: string;
  setExamTindakan: (v: string) => void;
  checkWarnings: (bb: string, sistol: string, gds: string) => void;
}

export default function LansiaExamFields({
  examBB,
  setExamBB,
  examTB,
  setExamTB,
  examSistol,
  setExamSistol,
  examDiastol,
  setExamDiastol,
  examGds,
  setExamGds,
  examLp,
  setExamLp,
  examCholesterol,
  setExamCholesterol,
  examUricAcid,
  setExamUricAcid,
  examKeluhan,
  setExamKeluhan,
  examTindakan,
  setExamTindakan,
  checkWarnings,
}: LansiaExamFieldsProps) {
  return (
    <div className="space-y-4 pt-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-saas-muted">Berat Badan (kg)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            placeholder="Contoh: 60.5"
            value={examBB}
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault();
            }}
            onChange={(e) => {
              const val = e.target.value.replace(/-/g, "");
              setExamBB(val);
              checkWarnings(val, examSistol, examGds);
            }}
            className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-saas-muted">Tinggi Badan (cm)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            placeholder="Contoh: 165.0"
            value={examTB}
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault();
            }}
            onChange={(e) => setExamTB(e.target.value.replace(/-/g, ""))}
            className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-saas-muted">Sistol (mmHg)</label>
          <input
            type="number"
            min="0"
            placeholder="cth: 120"
            value={examSistol}
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault();
            }}
            onChange={(e) => {
              const val = e.target.value.replace(/-/g, "");
              setExamSistol(val);
              checkWarnings(examBB, val, examGds);
            }}
            className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-saas-muted">Diastol (mmHg)</label>
          <input
            type="number"
            min="0"
            placeholder="cth: 80"
            value={examDiastol}
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault();
            }}
            onChange={(e) => setExamDiastol(e.target.value.replace(/-/g, ""))}
            className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-saas-muted">GDS (mg/dL)</label>
          <input
            type="number"
            min="0"
            placeholder="cth: 120"
            value={examGds}
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault();
            }}
            onChange={(e) => {
              const val = e.target.value.replace(/-/g, "");
              setExamGds(val);
              checkWarnings(examBB, examSistol, val);
            }}
            className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-saas-muted">Lingkar Perut (cm)</label>
          <input
            type="number"
            min="0"
            placeholder="cth: 90"
            value={examLp}
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault();
            }}
            onChange={(e) => setExamLp(e.target.value.replace(/-/g, ""))}
            className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-saas-muted">Kolesterol (mg/dL)</label>
          <input
            type="number"
            min="0"
            placeholder="cth: 180"
            value={examCholesterol}
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault();
            }}
            onChange={(e) => setExamCholesterol(e.target.value.replace(/-/g, ""))}
            className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-saas-muted">Asam Urat (mg/dL)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            placeholder="cth: 6.2"
            value={examUricAcid}
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault();
            }}
            onChange={(e) => setExamUricAcid(e.target.value.replace(/-/g, ""))}
            className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-saas-muted">Keluhan Saat Ini</label>
          <textarea
            placeholder="Tulis keluhan lansia saat ini..."
            rows={2}
            value={examKeluhan}
            onChange={(e) => setExamKeluhan(e.target.value)}
            className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50 resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-saas-muted">Tindakan / Rujukan</label>
          <textarea
            placeholder="Tulis tindakan medis atau rujukan..."
            rows={2}
            value={examTindakan}
            onChange={(e) => setExamTindakan(e.target.value)}
            className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50 resize-none"
          />
        </div>
      </div>
    </div>
  );
}
