"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn, clamp } from "@/lib/utils";

export function Progress({
  value,
  max = 100,
  label,
  className,
}: {
  value: number;
  max?: number;
  label: string;
  className?: string;
}) {
  const pct = max > 0 ? clamp((value / max) * 100, 0, 100) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
    >
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-primary to-gold rtl:bg-gradient-to-l"
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ type: "spring", stiffness: 160, damping: 26 }}
      />
    </div>
  );
}

/** SVG ring progress. Decorative ring; pass `label` to expose value. */
export function CircularProgress({
  value,
  max,
  size = 240,
  stroke = 10,
  className,
  children,
  label,
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  className?: string;
  children?: React.ReactNode;
  label?: string;
}) {
  const reduce = useReducedMotion();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? clamp(value / max, 0, 1) : 0;
  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size, maxWidth: "100%" }}
      {...(label
        ? { role: "progressbar", "aria-label": label, "aria-valuemin": 0, "aria-valuemax": max, "aria-valuenow": value }
        : {})}
    >
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 size-full -rotate-90" aria-hidden>
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--gold)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
        {/* subtle tick marks around the ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r - stroke - 6}
          fill="none"
          stroke="var(--gold)"
          strokeOpacity={0.25}
          strokeWidth={1}
          strokeDasharray="2 10"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 22 }}
        />
      </svg>
      <div className="relative z-10 flex flex-col items-center text-center">{children}</div>
    </div>
  );
}
