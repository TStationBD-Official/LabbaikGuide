"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useI18n } from "@/components/providers/i18n-provider";
import { parseKey } from "@/features/amal/logic";
import { cn } from "@/lib/utils";
import { usePct } from "./amal-ui";

export type BarDatum = {
  key: string;
  label: string;
  sub?: string;
  value: number | null;
  highlight?: boolean;
};

/** Vertical bars (0–100 %) that grow in; tap a bar to open that day/month. Empty periods show a dashed stub. */
export function BarChart({
  data,
  label,
  onPick,
  height = 168,
}: {
  data: BarDatum[];
  label: string;
  onPick?: (key: string) => void;
  height?: number;
}) {
  const reduce = useReducedMotion();
  const pct = usePct();
  return (
    <figure className="space-y-2" aria-label={label}>
      <div className="relative" style={{ height }}>
        {/* guide lines at 100 % and 50 % of the bar area (below the value labels) */}
        <div
          className="pointer-events-none absolute inset-x-0 top-4 bottom-0"
          aria-hidden
        >
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
                          full
                            ? "bg-gradient-to-t from-gold to-amber-300"
                            : "bg-gradient-to-t from-primary to-emerald-400",
                          d.highlight &&
                            "ring-2 ring-gold ring-offset-2 ring-offset-card",
                        )}
                        initial={reduce ? false : { height: 0 }}
                        animate={{ height: `${Math.max(2, v * 100)}%` }}
                        transition={
                          reduce
                            ? { duration: 0 }
                            : {
                                type: "spring",
                                stiffness: 110,
                                damping: 18,
                                delay: i * 0.035,
                              }
                        }
                      >
                        <span
                          className={cn(
                            "absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold tabular-nums",
                            full ? "text-gold" : "text-muted-foreground",
                          )}
                        >
                          {pct(v)}
                        </span>
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
          <li
            key={d.key}
            className={cn(
              "min-w-0 flex-1 text-center text-[10px] leading-tight",
              d.highlight
                ? "font-bold text-foreground"
                : "text-muted-foreground",
            )}
          >
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
  if (v <= 0)
    return "color-mix(in oklab, var(--muted-foreground) 14%, var(--card))";
  return `color-mix(in oklab, var(--primary) ${Math.round(18 + v * 82)}%, var(--card))`;
}

/** Month calendar: one square per day, coloured by completion; tap to open the day. */
export function MonthHeatmap({
  year,
  month,
  values,
  today,
  onPick,
}: {
  year: number;
  month: number;
  values: Map<string, number | null>;
  today: string;
  onPick: (key: string) => void;
}) {
  const { intlLocale, formatNumber, t } = useI18n();
  const reduce = useReducedMotion();
  const pct = usePct();
  const first = new Date(Date.UTC(year, month, 1, 12));
  const daysIn = new Date(Date.UTC(year, month + 1, 0, 12)).getUTCDate();
  // Weeks start on Saturday, as on the Saudi (Haramain) calendar.
  const lead = (first.getUTCDay() + 1) % 7; // Sat = 0
  const wd = new Intl.DateTimeFormat(intlLocale, {
    weekday: "narrow",
    timeZone: "UTC",
  });
  const heads = Array.from({ length: 7 }, (_, i) =>
    wd.format(new Date(Date.UTC(2026, 0, 3 + i, 12))),
  ); // 3 Jan 2026 is a Saturday
  const cells: (string | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from(
      { length: daysIn },
      (_, i) =>
        `${year}-${String(month + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`,
    ),
  ];
  return (
    <div className="space-y-2">
      <div
        className="grid grid-cols-7 gap-1.5 text-center text-[11px] text-muted-foreground"
        aria-hidden
      >
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
              transition={
                reduce
                  ? { duration: 0 }
                  : {
                      delay: Math.min(i, 40) * 0.012,
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                    }
              }
              className={cn(
                "relative grid aspect-square place-items-center rounded-lg text-xs font-semibold tabular-nums transition-transform hover:scale-105 disabled:hover:scale-100",
                v === null
                  ? "border border-dashed border-border text-muted-foreground/60"
                  : v >= 0.55
                    ? "text-white"
                    : "text-foreground",
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
      <div
        className="flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground"
        aria-hidden
      >
        {t("amal.less")}
        {[0, 0.3, 0.6, 0.85, 1].map((v) => (
          <span
            key={v}
            className="size-3 rounded-sm"
            style={{ background: heatColor(v) }}
          />
        ))}
        {t("amal.more")}
      </div>
    </div>
  );
}

/** Horizontal labelled bars (by type / item). */
export function HBars({
  rows,
}: {
  rows: {
    key: string;
    label: string;
    value: number;
    note?: string;
    barClass?: string;
    chip?: string;
  }[];
}) {
  const reduce = useReducedMotion();
  const pct = usePct();
  return (
    <ul className="space-y-2.5">
      {rows.map((r, i) => (
        <li key={r.key} className="space-y-1">
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              {r.chip ? (
                <span
                  className={cn("size-2.5 shrink-0 rounded-full", r.chip)}
                  aria-hidden
                />
              ) : null}
              <span className="truncate">{r.label}</span>
            </span>
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
              {r.note ? `${r.note} · ` : ""}
              <span className="font-semibold text-foreground">
                {pct(r.value)}
              </span>
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <motion.div
              className={cn("h-full rounded-full", r.barClass ?? "bg-primary")}
              initial={reduce ? false : { width: 0 }}
              animate={{ width: `${Math.max(0, Math.min(1, r.value)) * 100}%` }}
              transition={
                reduce
                  ? { duration: 0 }
                  : {
                      type: "spring",
                      stiffness: 80,
                      damping: 20,
                      delay: i * 0.05,
                    }
              }
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export type TrendPoint = {
  key: string;
  label: string;
  all: number | null;
  fard: number | null;
  highlight?: boolean;
  /** Longer label for the tooltip/table. */ tip?: string;
};

const TOP = 6;
const BOTTOM = 96;
const Y = (v: number) =>
  TOP + (1 - Math.max(0, Math.min(1, v))) * (BOTTOM - TOP); // inside the 0–100 box

type Pt = [number, number];

/** Unbroken runs of non-null values (a gap in tracking breaks the line). */
function runs(
  points: TrendPoint[],
  pick: (p: TrendPoint) => number | null,
  xs: number[],
): Pt[][] {
  const out: Pt[][] = [];
  let cur: Pt[] = [];
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

const f = (n: number) => n.toFixed(2);

/**
 * Smooth monotone curve (Fritsch–Carlson, like d3's curveMonotoneX): it passes through every value
 * and never overshoots above 100 % or below 0 %, so the smoothing can't misstate the data.
 */
function curve(pts: Pt[]): string {
  const n = pts.length;
  if (n === 0) return "";
  if (n === 1) return `M${f(pts[0][0])} ${f(pts[0][1])}`;
  if (n === 2)
    return `M${f(pts[0][0])} ${f(pts[0][1])} L${f(pts[1][0])} ${f(pts[1][1])}`;
  const dx: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(pts[i + 1][0] - pts[i][0]);
    m.push((pts[i + 1][1] - pts[i][1]) / (dx[i] || 1));
  }
  const t: number[] = [m[0]];
  for (let i = 1; i < n - 1; i++)
    t.push(m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2);
  t.push(m[n - 2]);
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) {
      t[i] = 0;
      t[i + 1] = 0;
      continue;
    }
    const a = t[i] / m[i];
    const b = t[i + 1] / m[i];
    const s = a * a + b * b;
    if (s > 9) {
      const k = 3 / Math.sqrt(s);
      t[i] = k * a * m[i];
      t[i + 1] = k * b * m[i];
    }
  }
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += ` C${f(pts[i][0] + h)} ${f(pts[i][1] + t[i] * h)} ${f(pts[i + 1][0] - h)} ${f(pts[i + 1][1] - t[i + 1] * h)} ${f(pts[i + 1][0])} ${f(pts[i + 1][1])}`;
  }
  return d;
}
const flat = (pts: Pt[]): Pt[] => pts.map(([x]) => [x, BOTTOM]);
const area = (pts: Pt[]) =>
  pts.length > 1
    ? `${curve(pts)} L${f(pts[pts.length - 1][0])} 100 L${f(pts[0][0])} 100 Z`
    : "";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Animated progress graph.
 * - "All deeds": smooth line with a soft glow and gradient area; "Fard prayers": dashed line (legend +
 *   dash = identity is never colour-only).
 * - On load the curves rise from the baseline while the lines draw; switching period morphs them.
 * - Hover/tap: crosshair with beads on both lines and a spring-following tooltip; tap the same point
 *   again to open it (`onPick`). The latest point pulses.
 */
export function TrendChart({
  points,
  label,
  height = 200,
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
  const pad = compact ? 3 : 4;
  const xs = points.map((_, i) =>
    n === 1 ? 50 : pad + (i / (n - 1)) * (100 - 2 * pad),
  );
  const all = runs(points, (p) => p.all, xs);
  const fard = runs(points, (p) => p.fard, xs);
  // Same shape of data (count + gaps) → morph; otherwise draw afresh.
  const shape = `${n}|${all.map((r) => r.length).join(",")}|${fard.map((r) => r.length).join(",")}`;
  const lastIdx = (() => {
    for (let i = n - 1; i >= 0; i--) if (points[i].all !== null) return i;
    return -1;
  })();
  const showDots = n <= 14;
  const h = hover !== null ? points[hover] : null;
  const dur = reduce ? 0 : 1.1;

  const indexAt = (clientX: number, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    const xPct = ((clientX - r.left) / r.width) * 100;
    let best = 0;
    xs.forEach((x, i) => {
      if (Math.abs(x - xPct) < Math.abs(xs[best] - xPct)) best = i;
    });
    return best;
  };
  // x labels: every `labelEvery`, always the last one, dropping the one before it if they would collide.
  const shownLabels = (() => {
    const set = new Set<number>();
    for (let i = 0; i < n; i += labelEvery) set.add(i);
    if (n > 0 && !set.has(n - 1)) {
      const prevShown = Math.floor((n - 1) / labelEvery) * labelEvery;
      if (n - 1 - prevShown <= labelEvery / 2) set.delete(prevShown);
      set.add(n - 1);
    }
    return set;
  })();
  const enter = (i: number) =>
    reduce ? 0 : 0.25 + (i / Math.max(1, n - 1)) * 0.7;

  return (
    <figure className="space-y-2" aria-label={label}>
      {!compact ? (
        <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <svg width="20" height="8" aria-hidden>
              <line
                x1="1"
                y1="4"
                x2="19"
                y2="4"
                stroke="var(--amal-s1)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            {t("amal.seriesAll")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <svg width="20" height="8" aria-hidden>
              <line
                x1="1"
                y1="4"
                x2="19"
                y2="4"
                stroke="var(--amal-s2)"
                strokeWidth="2.5"
                strokeDasharray="4 3"
                strokeLinecap="round"
              />
            </svg>
            {t("amal.seriesFard")}
          </span>
        </figcaption>
      ) : null}
      <div className={cn("relative", !compact && "ms-9")} style={{ height }}>
        {/* y grid (recessive): 0 / 50 / 100 %, fading in */}
        {[0, 0.5, 1].map((v, i) => (
          <motion.div
            key={v}
            initial={reduce ? false : { opacity: 0, scaleX: 0.6 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.5, delay: reduce ? 0 : i * 0.06 }}
            className={cn(
              "pointer-events-none absolute inset-x-0 origin-left border-t",
              v === 0 ? "border-border" : "border-dashed border-border/60",
            )}
            style={{ top: `${Y(v)}%` }}
            aria-hidden
          >
            {!compact ? (
              <span className="absolute -top-2 -start-9 w-8 text-end text-[10px] text-muted-foreground tabular-nums">
                {pct(v)}
              </span>
            ) : null}
          </motion.div>
        ))}

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full overflow-visible"
          aria-hidden
        >
          <defs>
            <linearGradient id={`area${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--amal-s1)" stopOpacity="0.38" />
              <stop
                offset="70%"
                stopColor="var(--amal-s1)"
                stopOpacity="0.08"
              />
              <stop offset="100%" stopColor="var(--amal-s1)" stopOpacity="0" />
            </linearGradient>
            {/* left-to-right wipe that "draws" the lines (re-runs only when the data's shape changes) */}
            <clipPath id={`wipe${uid}`}>
              <motion.rect
                key={shape}
                x="-5"
                y="-10"
                height="120"
                initial={reduce ? false : { width: 0 }}
                animate={{ width: 110 }}
                transition={{ duration: dur * 1.15, ease: EASE }}
              />
            </clipPath>
          </defs>

          {/* area: rises from the baseline, morphs between periods */}
          {all.map((r, i) =>
            r.length > 1 ? (
              <motion.path
                key={`a${shape}${i}`}
                fill={`url(#area${uid})`}
                initial={reduce ? false : { d: area(flat(r)), opacity: 0 }}
                animate={{ d: area(r), opacity: 1 }}
                transition={{
                  d: { duration: dur, ease: EASE },
                  opacity: { duration: 0.4 },
                }}
              />
            ) : null,
          )}

          {/* fard: dashed, drawn by the wipe */}
          <g clipPath={`url(#wipe${uid})`}>
            {fard.map((r, i) =>
              r.length > 1 ? (
                <motion.path
                  key={`f${shape}${i}`}
                  fill="none"
                  stroke="var(--amal-s2)"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  initial={reduce ? false : { d: curve(flat(r)) }}
                  animate={{ d: curve(r) }}
                  transition={{ duration: dur, ease: EASE }}
                />
              ) : null,
            )}
          </g>

          {/* all deeds: glow + line, drawn by the wipe while rising */}
          <g clipPath={`url(#wipe${uid})`}>
            {all.map((r, i) =>
              r.length > 1 ? (
                <g key={`l${shape}${i}`}>
                  <motion.path
                    fill="none"
                    stroke="var(--amal-s1)"
                    strokeOpacity={0.25}
                    strokeWidth={8}
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    style={{ filter: "blur(4px)" }}
                    initial={reduce ? false : { d: curve(flat(r)) }}
                    animate={{ d: curve(r) }}
                    transition={{ duration: dur, ease: EASE }}
                  />
                  <motion.path
                    fill="none"
                    stroke="var(--amal-s1)"
                    strokeWidth={2.75}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    initial={reduce ? false : { d: curve(flat(r)) }}
                    animate={{ d: curve(r) }}
                    transition={{ duration: dur, ease: EASE }}
                  />
                </g>
              ) : null,
            )}
          </g>
        </svg>

        {/* crosshair */}
        <AnimatePresence>
          {h ? (
            <motion.div
              key="xh"
              className="pointer-events-none absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-muted-foreground/50 to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, left: `${xs[hover!]}%` }}
              exit={{ opacity: 0 }}
              transition={{
                left: { type: "spring", stiffness: 500, damping: 40 },
                opacity: { duration: 0.15 },
              }}
              aria-hidden
            />
          ) : null}
        </AnimatePresence>

        {/* markers: rise with the curve, ≥8 px with a surface ring */}
        {points.map((p, i) => {
          const show = showDots || i === lastIdx;
          const isHover = i === hover;
          return (
            <span key={p.key} aria-hidden>
              {(show || isHover) && p.fard !== null ? (
                <motion.span
                  className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-card"
                  style={{ left: `${xs[i]}%`, background: "var(--amal-s2)" }}
                  initial={reduce ? false : { top: `${BOTTOM}%`, scale: 0 }}
                  animate={{ top: `${Y(p.fard)}%`, scale: isHover ? 1.5 : 1 }}
                  transition={{
                    top: { duration: dur, ease: EASE },
                    scale: {
                      type: "spring",
                      stiffness: 400,
                      damping: 18,
                      delay: isHover ? 0 : enter(i),
                    },
                  }}
                />
              ) : null}
              {(show || isHover) && p.all !== null ? (
                <motion.span
                  className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-card"
                  style={{ left: `${xs[i]}%`, background: "var(--amal-s1)" }}
                  initial={reduce ? false : { top: `${BOTTOM}%`, scale: 0 }}
                  animate={{
                    top: `${Y(p.all)}%`,
                    scale: isHover ? 1.6 : p.highlight ? 1.25 : 1,
                  }}
                  transition={{
                    top: { duration: dur, ease: EASE },
                    scale: {
                      type: "spring",
                      stiffness: 400,
                      damping: 18,
                      delay: isHover ? 0 : enter(i),
                    },
                  }}
                >
                  {i === lastIdx && !reduce ? (
                    <span
                      className="absolute inset-0 animate-ping rounded-full"
                      style={{ background: "var(--amal-s1)", opacity: 0.45 }}
                    />
                  ) : null}
                </motion.span>
              ) : null}
            </span>
          );
        })}

        {/* direct label on the latest value */}
        {lastIdx >= 0 && hover === null && points[lastIdx].all !== null ? (
          <motion.span
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduce ? 0 : dur * 0.9, duration: 0.3 }}
            className="pointer-events-none absolute rounded-full px-1.5 py-0.5 text-[10px] font-bold whitespace-nowrap text-white tabular-nums shadow-soft"
            style={{
              left: `${xs[lastIdx]}%`,
              top: `${Y(points[lastIdx].all!)}%`,
              translate: `${xs[lastIdx] > 82 ? "-100%" : "-50%"} -190%`,
              background: "var(--amal-s1)",
            }}
          >
            {pct(points[lastIdx].all!)}
          </motion.span>
        ) : null}

        {/* hit area */}
        <div
          className="absolute inset-0 cursor-crosshair touch-pan-y"
          onPointerMove={(e) => setHover(indexAt(e.clientX, e.currentTarget))}
          onPointerLeave={(e) => e.pointerType === "mouse" && setHover(null)}
          onClick={(e) => {
            const i = indexAt(e.clientX, e.currentTarget);
            if (i === hover && onPick && points[i].all !== null)
              onPick(points[i].key);
            else setHover(i);
          }}
        />

        {/* tooltip, following the crosshair */}
        <AnimatePresence>
          {h ? (
            <motion.div
              key="tip"
              className="pointer-events-none absolute top-0 z-10 min-w-32 rounded-2xl border border-border bg-card/95 px-3 py-2 text-xs shadow-lg backdrop-blur"
              initial={{ opacity: 0, scale: 0.92, y: 4 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                left: `${xs[hover!]}%`,
                x: xs[hover!] > 58 ? "-108%" : "8%",
              }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                left: { type: "spring", stiffness: 420, damping: 36 },
                x: { type: "spring", stiffness: 420, damping: 36 },
                default: { duration: 0.15 },
              }}
              role="status"
            >
              <p className="mb-1 font-semibold">{h.tip ?? h.label}</p>
              {h.all === null ? (
                <p className="text-muted-foreground">—</p>
              ) : (
                <div className="space-y-0.5">
                  <p className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <span
                        className="h-0.5 w-3 rounded-full"
                        style={{ background: "var(--amal-s1)" }}
                      />
                      {t("amal.seriesAll")}
                    </span>
                    <span className="font-bold tabular-nums">{pct(h.all)}</span>
                  </p>
                  {h.fard !== null ? (
                    <p className="flex items-center justify-between gap-4">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <span
                          className="w-3 border-t-2 border-dashed"
                          style={{ borderColor: "var(--amal-s2)" }}
                        />
                        {t("amal.seriesFard")}
                      </span>
                      <span className="font-bold tabular-nums">
                        {pct(h.fard)}
                      </span>
                    </p>
                  ) : null}
                </div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      <ol
        className={cn(
          "relative h-4 text-[10px] text-muted-foreground",
          !compact && "ms-9",
        )}
        aria-hidden
      >
        {points.map((p, i) =>
          shownLabels.has(i) ? (
            <li
              key={p.key}
              className={cn(
                "absolute -translate-x-1/2 whitespace-nowrap transition-colors",
                p.highlight && "font-bold text-foreground",
                i === hover && "text-foreground",
              )}
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
            <th className="px-3 py-2 text-start font-medium">
              {t("amal.colPeriod")}
            </th>
            <th className="px-3 py-2 text-end font-medium">
              {t("amal.seriesAll")}
            </th>
            <th className="px-3 py-2 text-end font-medium">
              {t("amal.seriesFard")}
            </th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.key} className="border-t border-border">
              <td className="px-3 py-1.5">{p.tip ?? p.label}</td>
              <td className="px-3 py-1.5 text-end tabular-nums">
                {p.all === null ? "—" : pct(p.all)}
              </td>
              <td className="px-3 py-1.5 text-end tabular-nums">
                {p.fard === null ? "—" : pct(p.fard)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
