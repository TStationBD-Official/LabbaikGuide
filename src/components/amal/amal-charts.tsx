"use client";

import { useId, useState } from "react";
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

export type TrendPoint = { key: string; label: string; all: number | null; fard: number | null; highlight?: boolean; /** Longer label for the tooltip/table. */ tip?: string };

const Y = (v: number) => 4 + (1 - Math.max(0, Math.min(1, v))) * 92; // 4–96 in the 0–100 box

/** Unbroken runs of non-null values, as SVG coordinates. */
function runs(points: TrendPoint[], pick: (p: TrendPoint) => number | null, xs: number[]) {
  const out: [number, number][][] = [];
  let cur: [number, number][] = [];
  points.forEach((p, i) => {
    const v = pick(p);
    if (v === null) {
      if (cur.length) out.push(cur);
      cur = [];
    } else cur.push([xs[i], Y(v)]);
  });
  if (cur.length) out.push(cur);
  return out;
}
const linePath = (r: [number, number][]) => r.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");

/**
 * Animated progress graph: "all deeds" as a line with a soft area, "fard prayers" as a dashed line
 * (two series → legend + dashed secondary encoding). Draws in from left to right; hover/tap shows a
 * crosshair and tooltip; tapping a point a second time opens it (`onPick`).
 */
export function TrendChart({
  points,
  label,
  height = 190,
  compact,
  labelEvery = 1,
  onPick,
}: {
  points: TrendPoint[];
  label: string;
  height?: number;
  compact?: boolean;
  labelEvery?: number;
  onPick?: (key: string) => void;
}) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const pct = usePct();
  const uid = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);
  const n = points.length;
  const xs = points.map((_, i) => (n === 1 ? 50 : 2 + (i / (n - 1)) * 96));
  const all = runs(points, (p) => p.all, xs);
  const fard = runs(points, (p) => p.fard, xs);
  const animKey = points.map((p) => `${p.key}:${p.all?.toFixed(3)}:${p.fard?.toFixed(3)}`).join("|");
  const lastIdx = (() => {
    for (let i = n - 1; i >= 0; i--) if (points[i].all !== null) return i;
    return -1;
  })();
  const showDots = n <= 14;
  const h = hover !== null ? points[hover] : null;

  const indexAt = (clientX: number, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    const xPct = ((clientX - r.left) / r.width) * 100;
    let best = 0;
    xs.forEach((x, i) => {
      if (Math.abs(x - xPct) < Math.abs(xs[best] - xPct)) best = i;
    });
    return best;
  };

  return (
    <figure className="space-y-2" aria-label={label}>
      {!compact ? (
        <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <svg width="18" height="6" aria-hidden>
              <line x1="0" y1="3" x2="18" y2="3" stroke="var(--amal-s1)" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            {t("amal.seriesAll")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <svg width="18" height="6" aria-hidden>
              <line x1="0" y1="3" x2="18" y2="3" stroke="var(--amal-s2)" strokeWidth="2.5" strokeDasharray="4 3" strokeLinecap="round" />
            </svg>
            {t("amal.seriesFard")}
          </span>
        </figcaption>
      ) : null}
      <div className={cn("relative", !compact && "ms-8")} style={{ height }}>
        {/* y grid: recessive, 0 / 50 / 100 % */}
        {[0, 0.5, 1].map((v) => (
          <div key={v} className="pointer-events-none absolute inset-x-0 border-t border-dashed border-border/70" style={{ top: `${Y(v)}%` }} aria-hidden>
            {!compact ? <span className="absolute -top-2 -start-8 w-7 text-end text-[10px] text-muted-foreground tabular-nums">{pct(v)}</span> : null}
          </div>
        ))}
        <svg key={animKey} viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          <defs>
            <linearGradient id={`a${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--amal-s1)" stopOpacity="0.32" />
              <stop offset="100%" stopColor="var(--amal-s1)" stopOpacity="0" />
            </linearGradient>
            <clipPath id={`c${uid}`}>
              <motion.rect x="0" y="-5" height="110" initial={reduce ? false : { width: 0 }} animate={{ width: 104 }} transition={{ duration: reduce ? 0 : 1.1, ease: [0.3, 0.7, 0.2, 1] }} />
            </clipPath>
          </defs>
          <g clipPath={`url(#c${uid})`}>
            {all.map((r, i) =>
              r.length > 1 ? <path key={`a${i}`} d={`${linePath(r)} L${r[r.length - 1][0]} 100 L${r[0][0]} 100 Z`} fill={`url(#a${uid})`} /> : null,
            )}
            {fard.map((r, i) =>
              r.length > 1 ? (
                <path key={`f${i}`} d={linePath(r)} fill="none" stroke="var(--amal-s2)" strokeWidth={2} strokeDasharray="5 4" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
              ) : null,
            )}
            {all.map((r, i) =>
              r.length > 1 ? <path key={`l${i}`} d={linePath(r)} fill="none" stroke="var(--amal-s1)" strokeWidth={2.5} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" /> : null,
            )}
          </g>
          {h ? <line x1={xs[hover!]} x2={xs[hover!]} y1="0" y2="100" stroke="currentColor" className="text-muted-foreground/60" strokeWidth={1} vectorEffect="non-scaling-stroke" /> : null}
        </svg>
        {/* markers (HTML, so they stay round): ≥8 px with a surface ring */}
        {points.map((p, i) => {
          const show = showDots || i === lastIdx || i === hover;
          return (
            <span key={p.key} aria-hidden>
              {show && p.fard !== null ? (
                <motion.span
                  initial={reduce ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: reduce ? 0 : 0.5 + (i / Math.max(1, n)) * 0.6 }}
                  className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-card"
                  style={{ left: `${xs[i]}%`, top: `${Y(p.fard)}%`, background: "var(--amal-s2)" }}
                />
              ) : null}
              {show && p.all !== null ? (
                <motion.span
                  initial={reduce ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: reduce ? 0 : 0.5 + (i / Math.max(1, n)) * 0.6 }}
                  className={cn("absolute -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-card", i === hover || p.highlight ? "size-3" : "size-2.5")}
                  style={{ left: `${xs[i]}%`, top: `${Y(p.all)}%`, background: "var(--amal-s1)" }}
                />
              ) : null}
            </span>
          );
        })}
        {/* direct label on the latest value */}
        {lastIdx >= 0 && hover === null && points[lastIdx].all !== null ? (
          <motion.span
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduce ? 0 : 1 }}
            className="pointer-events-none absolute rounded-md bg-card/90 px-1 text-[10px] font-semibold whitespace-nowrap text-foreground tabular-nums shadow-soft"
            style={{ left: `${xs[lastIdx]}%`, top: `${Y(points[lastIdx].all!)}%`, translate: `${xs[lastIdx] > 80 ? "-100%" : "-50%"} -160%` }}
          >
            {pct(points[lastIdx].all!)}
          </motion.span>
        ) : null}
        {/* hit area + tooltip */}
        <div
          className="absolute inset-0 cursor-crosshair touch-pan-y"
          onPointerMove={(e) => setHover(indexAt(e.clientX, e.currentTarget))}
          onPointerLeave={(e) => e.pointerType === "mouse" && setHover(null)}
          onClick={(e) => {
            const i = indexAt(e.clientX, e.currentTarget);
            if (i === hover && onPick && points[i].all !== null) onPick(points[i].key);
            else setHover(i);
          }}
        />
        {h ? (
          <div
            className="pointer-events-none absolute top-0 z-10 min-w-28 rounded-xl border border-border bg-card px-2.5 py-2 text-xs shadow-lg"
            style={{ left: `${xs[hover!]}%`, translate: xs[hover!] > 60 ? "calc(-100% - 8px) 0" : "8px 0" }}
            role="status"
          >
            <p className="font-semibold">{h.tip ?? h.label}</p>
            {h.all === null ? (
              <p className="text-muted-foreground">—</p>
            ) : (
              <>
                <p className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1">
                    <span className="size-2 rounded-full" style={{ background: "var(--amal-s1)" }} />
                    {t("amal.seriesAll")}
                  </span>
                  <span className="font-semibold tabular-nums">{pct(h.all)}</span>
                </p>
                {h.fard !== null ? (
                  <p className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1">
                      <span className="size-2 rounded-full" style={{ background: "var(--amal-s2)" }} />
                      {t("amal.seriesFard")}
                    </span>
                    <span className="font-semibold tabular-nums">{pct(h.fard)}</span>
                  </p>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </div>
      <ol className={cn("relative h-4 text-[10px] text-muted-foreground", !compact && "ms-8")} aria-hidden>
        {points.map((p, i) =>
          i % labelEvery === 0 || i === n - 1 ? (
            <li
              key={p.key}
              className={cn("absolute -translate-x-1/2 whitespace-nowrap", p.highlight && "font-bold text-foreground")}
              style={{ left: `${xs[i]}%` }}
            >
              {p.label}
            </li>
          ) : null,
        )}
      </ol>
    </figure>
  );
}

/** Same data as a table (accessibility / exact numbers). */
export function TrendTable({ points }: { points: TrendPoint[] }) {
  const { t } = useI18n();
  const pct = usePct();
  return (
    <div className="max-h-72 overflow-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-muted text-xs text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-start font-medium">{t("amal.colPeriod")}</th>
            <th className="px-3 py-2 text-end font-medium">{t("amal.seriesAll")}</th>
            <th className="px-3 py-2 text-end font-medium">{t("amal.seriesFard")}</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.key} className="border-t border-border">
              <td className="px-3 py-1.5">{p.tip ?? p.label}</td>
              <td className="px-3 py-1.5 text-end tabular-nums">{p.all === null ? "—" : pct(p.all)}</td>
              <td className="px-3 py-1.5 text-end tabular-nums">{p.fard === null ? "—" : pct(p.fard)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
