"use client";

import { useId, useMemo, useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useI18n } from "@/components/providers/i18n-provider";
import { gt } from "@/data/guides/travel";
import { JUMUAH_SUB, JUMUAH_TITLE, type AmalItem, type AmalKind, type AmalSlot } from "@/data/amal/items";
import { amalDayKey, isFridayKey, type AmalSettings } from "@/features/amal/logic";
import type { PrayerSlot } from "@/features/prayer/times";
import { useAmalStore } from "@/stores/amal-store";
import { cn } from "@/lib/utils";

// ── today's key (Riyadh), re-checked every 30 s and when the app comes back ──
function subscribe(cb: () => void) {
  const id = setInterval(cb, 30_000);
  document.addEventListener("visibilitychange", cb);
  return () => {
    clearInterval(id);
    document.removeEventListener("visibilitychange", cb);
  };
}
/** Today's Haramain date key ("" while rendering on the server). */
export function useAmalToday(): string {
  return useSyncExternalStore(subscribe, () => amalDayKey(), () => "");
}

export function useAmalSettings(): AmalSettings {
  const enabled = useAmalStore((s) => s.enabled);
  const goals = useAmalStore((s) => s.goals);
  return useMemo(() => ({ enabled, goals }), [enabled, goals]);
}

export function usePct() {
  const { intlLocale } = useI18n();
  return useMemo(() => {
    const f = new Intl.NumberFormat(intlLocale, { style: "percent", maximumFractionDigits: 0 });
    return (x: number) => f.format(Math.max(0, Math.min(1, x)));
  }, [intlLocale]);
}

/** Title/sub of an item for a given day (Friday: Dhuhr becomes Jumu'ah). */
export function itemText(i: AmalItem, dayKey: string, locale: string) {
  const fri = dayKey ? isFridayKey(dayKey) : false;
  if (fri && i.id === "dhuhr-fard") return { title: gt(JUMUAH_TITLE, locale), sub: gt(JUMUAH_SUB, locale) };
  return { title: gt(i.title, locale), sub: i.sub ? gt(i.sub, locale) : "" };
}

export const SLOT_EMOJI: Record<AmalSlot, string> = { fajr: "🌅", morning: "☀️", dhuhr: "🕛", asr: "🌤️", maghrib: "🌇", isha: "🌙", night: "✨", day: "📿" };

/** Which part of the day it is now: the last adhan (or sunrise) that has passed; before Fajr it's the night. */
export function currentSlot(now: Date | null, prayers: PrayerSlot[] | undefined): AmalSlot | null {
  if (!now || !prayers?.length) return null;
  const passed = prayers.filter((p) => p.adhan.getTime() <= now.getTime());
  const last = passed[passed.length - 1];
  if (!last) return "night";
  return last.name === "sunrise" ? "morning" : (last.name as AmalSlot);
}

export const KIND_STYLE: Record<AmalKind, { chip: string; bar: string }> = {
  fard: { chip: "bg-primary text-primary-foreground", bar: "bg-primary" },
  sunnah: { chip: "bg-primary-soft text-primary", bar: "bg-emerald-500" },
  nafl: { chip: "bg-sky-500/15 text-sky-700 dark:text-sky-300", bar: "bg-sky-500" },
  adhkar: { chip: "bg-gold-soft text-gold", bar: "bg-gold" },
  dua: { chip: "bg-violet-500/15 text-violet-700 dark:text-violet-300", bar: "bg-violet-500" },
  quran: { chip: "bg-teal-500/15 text-teal-700 dark:text-teal-300", bar: "bg-teal-500" },
};

/** The animated completion ring: gradient stroke, soft glow, number in the middle. */
export function AmalRing({
  pct,
  size = 120,
  stroke = 11,
  onDark,
  children,
  label,
}: {
  pct: number;
  size?: number;
  stroke?: number;
  onDark?: boolean;
  children?: React.ReactNode;
  label: string;
}) {
  const reduce = useReducedMotion();
  const id = useId().replace(/:/g, "");
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, pct));
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(p * 100)}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={onDark ? "#fde68a" : "var(--primary)"} />
            <stop offset="100%" stopColor={onDark ? "#ffffff" : "var(--gold)"} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className={onDark ? "stroke-white/20" : "stroke-muted"} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke={`url(#g${id})`}
          strokeDasharray={c}
          initial={reduce ? false : { strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - p) }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 60, damping: 18 }}
          style={p >= 1 ? { filter: `drop-shadow(0 0 6px ${onDark ? "rgba(255,255,255,.7)" : "var(--gold)"})` } : undefined}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

/** Round check button: the tick draws itself and a ring bursts out when done. */
export function CheckButton({ done, onToggle, label, size = 36, locked }: { done: boolean; onToggle: () => void; label: string; size?: number; locked?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-label={label}
      aria-disabled={locked || undefined}
      disabled={locked && !done}
      onClick={onToggle}
      className="relative grid shrink-0 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed"
      style={{ width: size, height: size }}
    >
      <motion.span
        className={cn("absolute inset-0 rounded-full border-2", done ? "border-primary bg-primary" : locked ? "border-dashed border-border bg-muted/60" : "border-border bg-card")}
        animate={reduce ? undefined : { scale: done ? [1, 0.82, 1.08, 1] : 1 }}
        transition={{ duration: 0.4 }}
      />
      {done && !reduce ? (
        <motion.span
          key="burst"
          className="pointer-events-none absolute inset-0 rounded-full border-2 border-primary"
          initial={{ scale: 1, opacity: 0.7 }}
          animate={{ scale: 1.9, opacity: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        />
      ) : null}
      {locked && !done ? (
        <svg viewBox="0 0 24 24" className="relative size-[42%] text-muted-foreground" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      ) : null}
      <svg viewBox="0 0 24 24" className={cn("relative size-[55%]", locked && !done && "hidden")} fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <motion.path
          d="M5 12.5l4.5 4.5L19 7.5"
          className="text-primary-foreground"
          initial={false}
          animate={{ pathLength: done ? 1 : 0, opacity: done ? 1 : 0 }}
          transition={reduce ? { duration: 0 } : { duration: 0.35, ease: "easeOut", delay: done ? 0.08 : 0 }}
        />
      </svg>
    </button>
  );
}

/** Thin animated bar. */
export function Bar({ value, className, barClass, delay = 0 }: { value: number; className?: string; barClass?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-muted", className)} aria-hidden>
      <motion.div
        className={cn("h-full rounded-full", barClass ?? "bg-primary")}
        initial={reduce ? false : { width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 90, damping: 20, delay }}
      />
    </div>
  );
}

/** A short burst of confetti (CSS), shown when the day reaches 100 %. */
export function Confetti() {
  const pieces = Array.from({ length: 28 }, (_, i) => i);
  const colors = ["#b8891f", "#0f5c45", "#f59e0b", "#10b981", "#38bdf8", "#f472b6"];
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden>
      {pieces.map((i) => (
        <span
          key={i}
          className="hc-confetti absolute top-[-12px] block h-3 w-1.5 rounded-sm"
          style={{
            insetInlineStart: `${(i * 37) % 100}%`,
            background: colors[i % colors.length],
            animationDelay: `${(i % 7) * 70}ms`,
            animationDuration: `${1600 + ((i * 53) % 900)}ms`,
            ["--hc-x" as string]: `${((i * 29) % 60) - 30}px`,
            ["--hc-r" as string]: `${((i * 71) % 720) - 360}deg`,
          }}
        />
      ))}
    </div>
  );
}

