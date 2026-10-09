"use client";

import { motion, useReducedMotion } from "motion/react";
import { useI18n } from "@/components/providers/i18n-provider";
import { parseKey } from "@/features/amal/logic";
import { cn } from "@/lib/utils";
import { usePct } from "./amal-ui";

export type BarDatum = { key: string; label: string; sub?: string; value: number | null; highlight?: boolean };

/** Vertical bars (0–100 %) that grow in; tap a bar to open that day/month. Empty periods show a dashed stub. */
export function BarChart({ data, label, onPick, height = 168 }: { data: BarDatum[]; label: string; onPick?: (key: string) => void; height?: number }) {
  const reduce = useReducedMotion();
  const pct = usePct();
  return (
    <figure className="space-y-2" aria-label={label}>
      <div className="relative" style={{ height }}>
        {/* guide lines at 100 % and 50 % of the bar area (below the value labels) */}
        <div className="pointer-events-none absolute inset-x-0 top-4 bottom-0" aria-hidden>
          <div className="absolute inset-x-0 top-0 border-t border-dashed border-border" />
          <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-border/70" />
        </div>
        <ol className="absolute inset-0 flex gap-1.5 sm:gap-2.5">
          {data.map((d, i) => {
            const v = d.value;
            const full = v !== null && v >= 0.999;
            return (
              <li key={d.key} className="min-w-0 flex-1">
                <button
                  type="button"
                  disabled={!onPick || v === null}
                  onClick={() => onPick?.(d.key)}
                  className="group relative block h-full w-full disabled:cursor-default"
                  aria-label={`${d.label}${d.sub ? ` ${d.sub}` : ""}: ${v === null ? "—" : pct(v)}`}
                >
                  <span className="absolute inset-x-0 top-4 bottom-0">
                    {v === null ? (
                      <span className="absolute inset-x-0 bottom-0 mx-auto block h-1.5 w-full max-w-9 rounded-full border border-dashed border-border" />
                    ) : (
                      <motion.span
                        className={cn(
                          "absolute inset-x-0 bottom-0 mx-auto block w-full max-w-9 rounded-t-lg rounded-b-sm transition-[filter] group-hover:brightness-110",
                          full ? "bg-gradient-to-t from-gold to-amber-300" : "bg-gradient-to-t from-primary to-emerald-400",
                          d.highlight && "ring-2 ring-gold ring-offset-2 ring-offset-card",
                        )}
                        initial={reduce ? false : { height: 0 }}
                        animate={{ height: `${Math.max(2, v * 100)}%` }}
                        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 110, damping: 18, delay: i * 0.035 }}
                      >
                        <span className={cn("absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold tabular-nums", full ? "text-gold" : "text-muted-foreground")}>{pct(v)}</span>
                      </motion.span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      <ol className="flex gap-1.5 sm:gap-2.5" aria-hidden>
        {data.map((d) => (
          <li key={d.key} className={cn("min-w-0 flex-1 text-center text-[10px] leading-tight", d.highlight ? "font-bold text-foreground" : "text-muted-foreground")}>
            <span className="block truncate">{d.label}</span>
            {d.sub ? <span className="block tabular-nums">{d.sub}</span> : null}
          </li>
        ))}
      </ol>
    </figure>
  );
}

/** Colour for a completion level (empty → primary → gold at 100 %). */
export function heatColor(v: number | null): string | undefined {
  if (v === null) return undefined;
  if (v >= 0.999) return "var(--gold)";
  if (v <= 0) return "color-mix(in oklab, var(--muted-foreground) 14%, var(--card))";
  return `color-mix(in oklab, var(--primary) ${Math.round(18 + v * 82)}%, var(--card))`;
}

/** Month calendar: one square per day, coloured by completion; tap to open the day. */
export function MonthHeatmap({ year, month, values, today, onPick }: { year: number; month: number; values: Map<string, number | null>; today: string; onPick: (key: string) => void }) {
  const { intlLocale, formatNumber, t } = useI18n();
  const reduce = useReducedMotion();
  const pct = usePct();
  const first = new Date(Date.UTC(year, month, 1, 12));
  const daysIn = new Date(Date.UTC(year, month + 1, 0, 12)).getUTCDate();
  // Weeks start on Saturday, as on the Saudi (Haramain) calendar.
  const lead = (first.getUTCDay() + 1) % 7; // Sat = 0
  const wd = new Intl.DateTimeFormat(intlLocale, { weekday: "narrow", timeZone: "UTC" });
  const heads = Array.from({ length: 7 }, (_, i) => wd.format(new Date(Date.UTC(2026, 0, 3 + i, 12)))); // 3 Jan 2026 is a Saturday
  const cells: (string | null)[] = [...Array.from({ length: lead }, () => null), ...Array.from({ length: daysIn }, (_, i) => `${year}-${String(month + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`)];
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] text-muted-foreground" aria-hidden>
        {heads.map((h, i) => (
          <span key={i}>{h}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5" role="grid">
        {cells.map((k, i) => {
          if (!k) return <span key={`e${i}`} aria-hidden />;
          const v = values.get(k) ?? null;
          const day = parseKey(k).getUTCDate();
          const isToday = k === today;
          return (
            <motion.button
              key={k}
              type="button"
              disabled={v === null}
              onClick={() => onPick(k)}
              initial={reduce ? false : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={reduce ? { duration: 0 } : { delay: Math.min(i, 40) * 0.012, type: "spring", stiffness: 260, damping: 20 }}
              className={cn(
                "relative grid aspect-square place-items-center rounded-lg text-xs font-semibold tabular-nums transition-transform hover:scale-105 disabled:hover:scale-100",
                v === null ? "border border-dashed border-border text-muted-foreground/60" : v >= 0.55 ? "text-white" : "text-foreground",
                isToday && "ring-2 ring-gold ring-offset-1 ring-offset-card",
              )}
              style={{ background: heatColor(v) }}
              aria-label={`${formatNumber(day)}: ${v === null ? "—" : pct(v)}`}
            >
              {formatNumber(day)}
            </motion.button>
          );
        })}
      </div>
      <div className="flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground" aria-hidden>
        {t("amal.less")}
        {[0, 0.3, 0.6, 0.85, 1].map((v) => (
          <span key={v} className="size-3 rounded-sm" style={{ background: heatColor(v) }} />
        ))}
        {t("amal.more")}
      </div>
    </div>
  );
}

/** Horizontal labelled bars (by type / item). */
export function HBars({ rows }: { rows: { key: string; label: string; value: number; note?: string; barClass?: string; chip?: string }[] }) {
  const reduce = useReducedMotion();
  const pct = usePct();
  return (
    <ul className="space-y-2.5">
      {rows.map((r, i) => (
        <li key={r.key} className="space-y-1">
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              {r.chip ? <span className={cn("size-2.5 shrink-0 rounded-full", r.chip)} aria-hidden /> : null}
              <span className="truncate">{r.label}</span>
            </span>
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
              {r.note ? `${r.note} · ` : ""}
              <span className="font-semibold text-foreground">{pct(r.value)}</span>
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <motion.div
              className={cn("h-full rounded-full", r.barClass ?? "bg-primary")}
              initial={reduce ? false : { width: 0 }}
              animate={{ width: `${Math.max(0, Math.min(1, r.value)) * 100}%` }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 80, damping: 20, delay: i * 0.05 }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
