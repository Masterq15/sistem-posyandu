"use client";

import React from "react";
import { Helmet } from "react-helmet-async";

export interface PageHelmetProps {
  title: string;
  description?: string;
  keywords?: string;
  ogType?: string;
}

export default function PageHelmet({
  title,
  description = "Digitalisasi Pencatatan Tumbuh Kembang Anak & Pelayanan Lansia Mandiri — SIPANDU (Sistem Informasi Pelayanan dan Data Posyandu)",
  keywords = "posyandu, kesehatan balita, lansia, stunting, z-score, imunisasi, posyandu digital, sipandu",
  ogType = "website",
}: PageHelmetProps) {
  const fullTitle = title ? `${title} | SIPANDU` : "SIPANDU - Sistem Informasi Pelayanan dan Data Posyandu";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}
