"use client";

import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize?: number;
  limit?: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onLimitChange?: (limit: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  pageSize,
  limit,
  totalItems,
  onPageChange,
  onPageSizeChange,
  onLimitChange,
  pageSizeOptions,
  className = "",
}: PaginationProps) {
  if (!totalItems || totalItems <= 0) return null;

  const effectivePageSize = pageSize || limit || 10;
  const safeCurrentPage = Math.max(1, isNaN(currentPage) ? 1 : currentPage);
  const calculatedTotalPages = Math.ceil(totalItems / effectivePageSize);
  const validTotalPages = Math.max(1, isNaN(totalPages) ? calculatedTotalPages : totalPages || calculatedTotalPages);

  const rawStart = (safeCurrentPage - 1) * effectivePageSize + 1;
  const startItem = isNaN(rawStart) ? 1 : Math.min(rawStart, totalItems);

  const rawEnd = safeCurrentPage * effectivePageSize;
  const endItem = isNaN(rawEnd) ? totalItems : Math.min(rawEnd, totalItems);

  const handleSizeChange = onPageSizeChange || onLimitChange;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-2 ${className}`}>
      <div className="text-xs font-medium text-gray-600 order-2 sm:order-1 flex items-center gap-2">
        <span>
          Menampilkan <span className="font-semibold text-gray-900">{startItem}</span> -{" "}
          <span className="font-semibold text-gray-900">{endItem}</span> dari{" "}
          <span className="font-bold text-gray-900">{totalItems}</span> data
        </span>

        {handleSizeChange && pageSizeOptions && pageSizeOptions.length > 0 && (
          <select
            value={effectivePageSize}
            onChange={(e) => handleSizeChange(Number(e.target.value))}
            className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-gray-700 font-semibold focus:outline-none focus:border-teal-500 cursor-pointer"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} / hal
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        <button
          type="button"
          disabled={safeCurrentPage <= 1}
          onClick={() => onPageChange(Math.max(1, safeCurrentPage - 1))}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
        >
          Sebelumnya
        </button>
        <span className="px-3 py-1.5 text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 rounded-lg">
          Hal {safeCurrentPage} / {validTotalPages}
        </span>
        <button
          type="button"
          disabled={safeCurrentPage >= validTotalPages}
          onClick={() => onPageChange(safeCurrentPage + 1)}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
        >
          Berikutnya
        </button>
      </div>
    </div>
  );
}
