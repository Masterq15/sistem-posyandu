"use client";

import React, { useEffect, useState, useRef } from "react";

export interface AnimatedNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  triggerKey?: string | number;
}

export default function AnimatedNumber({
  value,
  duration = 650,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
  triggerKey,
}: AnimatedNumberProps) {
  const safeValue = typeof value === "number" && !isNaN(value) ? value : 0;
  const [displayValue, setDisplayValue] = useState<number>(safeValue);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef<number>(safeValue);
  const prevKeyRef = useRef<string | number | undefined>(triggerKey);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const isNewFilter = triggerKey !== undefined && prevKeyRef.current !== triggerKey;
    prevKeyRef.current = triggerKey;

    // Saat berpindah filter, mulai animasi dari 0 atau nilai lama untuk memberi efek visual aktif
    const startVal = isNewFilter ? 0 : prevValueRef.current;
    const targetVal = safeValue;

    setIsAnimating(true);
    startTimeRef.current = null;

    // Easing cubic ease-out: cepat di awal, melambat lembut di akhir
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = time - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      const current = startVal + (targetVal - startVal) * eased;
      setDisplayValue(current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetVal);
        prevValueRef.current = targetVal;
        setIsAnimating(false);
      }
    };

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [safeValue, duration, triggerKey]);

  const formatted =
    decimals > 0
      ? displayValue.toFixed(decimals)
      : Math.round(displayValue).toLocaleString("id-ID");

  return (
    <span
      className={`inline-block tabular-nums transition-all duration-200 ${
        isAnimating ? "scale-[1.03] opacity-90" : ""
      } ${className}`}
    >
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
