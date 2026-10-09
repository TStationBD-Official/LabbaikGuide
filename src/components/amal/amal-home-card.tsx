"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ChevronRight, Flame, Lock } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Card } from "@/components/ui/card";
import { prayerLabelKey } from "@/components/prayer/prayer-widgets";
import { useStoreHydrated } from "@/hooks/use-hydrated";
import type { usePrayerData } from "@/hooks/use-prayer";
import { AMAL_BY_ID, PRAYERS, SLOTS } from "@/data/amal/items";
import { fardStreak, isDone, isFridayKey, isOpen, isSalat, itemsFor, opensAt, parseKey, scoreDay, shiftKey, trendPoints } from "@/features/amal/logic";
import { formatTime } from "@/features/prayer/calendar";
import { usePrefs } from "@/components/providers/preferences-provider";
import { TrendChart, type TrendPoint } from "./amal-charts";
import { useAmalSync } from "@/features/amal/sync";
import { useAmalStore } from "@/stores/amal-store";
import { cn } from "@/lib/utils";
import { AmalRing, CheckButton, currentSlot, itemText, useAmalSettings, useAmalToday, usePct } from "./amal-ui";

/** Home overview: today's score ring, the five fard prayers (tap to tick), the next deed and the streak. */
export function AmalHomeCard({ data }: { data: ReturnType<typeof usePrayerData> }) {
  const { t, locale, formatNumber, intlLocale } = useI18n();
  const location = usePrefs((st) => st.location);
  const firstDay = useAmalStore((st) => st.firstDay);
  const [range, setRange] = useState<"week" | "month" | "year">("week");
  const pct = usePct();
  const today = useAmalToday();
  const ready = useStoreHydrated(useAmalStore);
  const s = useAmalSettings();
  const rec = useAmalStore((st) => st.days[today]);
  const days = useAmalStore((st) => st.days);
  const toggle = useAmalStore((st) => st.toggle);
  useAmalSync();
  // Today counts only deeds whose time has come (re-evaluated each minute).
  const minute = data.now ? Math.floor(data.now.getTime() / 60_000) : 0;
  const due = useMemo(() => (minute ? { now: new Date(minute * 60_000), location } : undefined), [minute, location]);
  const trend: TrendPoint[] = useMemo(() => {
    if (!today) return [];
    const from = range === "week" ? shiftKey(today, -6) : range === "month" ? shiftKey(today, -29) : `${shiftKey(today, -335).slice(0, 7)}-01`;
    const raw = trendPoints(days, s, from, today, today, firstDay, range === "year" ? "month" : "day", due);
    const wd = new Intl.DateTimeFormat(intlLocale, { weekday: "narrow", timeZone: "UTC" });
    const dm = new Intl.DateTimeFormat(intlLocale, { day: "numeric", month: "short", timeZone: "UTC" });
    const mf = new Intl.DateTimeFormat(intlLocale, { month: "narrow", timeZone: "UTC" });
    const mfl = new Intl.DateTimeFormat(intlLocale, { month: "long", year: "numeric", timeZone: "UTC" });
    return raw.map((p) =>
      range === "year"
        ? { ...p, label: mf.format(parseKey(`${p.key}-15`)), highlight: today.startsWith(p.key), tip: mfl.format(parseKey(`${p.key}-15`)) }
        : { ...p, label: range === "week" ? wd.format(parseKey(p.key)) : formatNumber(parseKey(p.key).getUTCDate()), highlight: p.key === today, tip: dm.format(parseKey(p.key)) },
    );
  }, [days, s, firstDay, today, range, intlLocale, formatNumber, due]);
  const hasTrend = trend.some((p) => p.all !== null);

  if (!today || !ready) return <div className="h-44 animate-pulse rounded-3xl bg-muted" aria-hidden />;
  const score = scoreDay(today, rec, s, undefined, due);
  const streak = fardStreak(days, s, today).current;
  const fri = isFridayKey(today);

  // Next deed: the first unfinished one from the current part of the day onwards.
  const cur = currentSlot(data.now, data.days?.today.prayers);
  const from = cur ? SLOTS.indexOf(cur) : 0;
  const pending = itemsFor(today, s).filter((i) => !isDone(i, rec, s) && !(rec?.excused && isSalat(i)));
  const now = data.now;
  const open = (i: (typeof pending)[number]) => !now || isOpen(i, today, now, location);
  const nextOpen = pending.filter(open);
  const ordered = (list: typeof pending) =>
    list.find((i) => i.slot !== "day" && SLOTS.indexOf(i.slot) >= from && SLOTS.indexOf(i.slot) < SLOTS.indexOf("day")) ?? list.find((i) => i.slot === "day") ?? list[0] ?? null;
  const next = ordered(nextOpen) ?? ordered(pending);
  const nextLocked = next ? !open(next) : false;
  const nextAt = next && nextLocked ? opensAt(next, today, location) : null;
  const allDone = score.totalItems > 0 && score.doneItems === score.totalItems;

  return (
    <Card className="relative overflow-hidden p-0">
      <div className="pointer-events-none absolute -end-16 -top-16 size-44 rounded-full bg-gold-soft/60 blur-2xl" aria-hidden />
      <div className="relative flex items-center gap-4 p-4">
        <Link href="/amal" aria-label={t("amal.title")} className="shrink-0">
          <AmalRing pct={score.pct} size={96} stroke={10} label={t("amal.dayScore")}>
            <div>
              <p className="text-xl font-bold tabular-nums">{pct(score.pct)}</p>
              <p className="text-[10px] text-muted-foreground">{t("amal.deeds")}</p>
            </div>
          </AmalRing>
        </Link>
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold">{t("amal.homeTitle")}</p>
              <p className="text-sm text-muted-foreground">{t("amal.homeSub", { done: formatNumber(score.doneItems), total: formatNumber(score.totalItems) })}</p>
            </div>
            <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold", streak > 0 ? "bg-amber-500/15 text-amber-700 dark:text-amber-300" : "bg-muted text-muted-foreground")} title={t("amal.streakHint")}>
              <Flame className="size-3.5" aria-hidden />
              {formatNumber(streak)}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1.5" role="group" aria-label={t("amal.fardShort")}>
            {PRAYERS.map((p, n) => {
              const item = AMAL_BY_ID.get(`${p}-fard`)!;
              const d = isDone(item, rec, s);
              const name = t(prayerLabelKey(p, fri));
              const locked = !d && !open(item);
              const at = locked ? opensAt(item, today, location) : null;
              return (
                <button
                  key={p}
                  type="button"
                  role="checkbox"
                  aria-checked={d}
                  aria-label={locked && at ? `${name} — ${t("amal.opensAt", { time: formatTime(at, intlLocale) })}` : name}
                  disabled={locked}
                  title={locked && at ? t("amal.opensAt", { time: formatTime(at, intlLocale) }) : undefined}
                  onClick={() => toggle(today, item.id)}
                  className="flex flex-col items-center gap-1 disabled:cursor-not-allowed"
                >
                  <motion.span
                    initial={false}
                    animate={{ scale: d ? [1, 1.22, 1] : 1 }}
                    transition={{ duration: 0.35 }}
                    className={cn(
                      "grid size-8 place-items-center rounded-full border-2 text-xs font-bold transition-colors",
                      d
                        ? "border-primary bg-primary text-primary-foreground"
                        : locked
                          ? "border-dashed border-border bg-muted/60 text-muted-foreground/70"
                          : cur === p
                            ? "border-gold bg-gold-soft text-gold"
                            : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    {d ? "✓" : locked ? <Lock className="size-3.5" aria-hidden /> : formatNumber(n + 1)}
                  </motion.span>
                  <span className={cn("max-w-full truncate text-[10px]", cur === p ? "font-semibold text-gold" : "text-muted-foreground")}>{name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {hasTrend ? (
        <div className="relative space-y-2 border-t border-border px-4 pt-3 pb-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-muted-foreground">{t("amal.homeGraph")}</p>
            <div role="radiogroup" aria-label={t("amal.homeGraph")} className="flex gap-1 rounded-full bg-muted p-0.5">
              {(["week", "month", "year"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={range === r}
                  onClick={() => setRange(r)}
                  className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors", range === r ? "bg-card text-foreground shadow-soft" : "text-muted-foreground")}
                >
                  {t(`amal.${r}`)}
                </button>
              ))}
            </div>
          </div>
          <TrendChart points={trend} label={t("amal.trendTitle")} height={92} compact labelEvery={range === "month" ? 7 : range === "year" ? 2 : 1} />
          <p className="flex items-center gap-3 text-[10px] text-muted-foreground" aria-hidden>
            <span className="inline-flex items-center gap-1">
              <span className="h-0.5 w-3 rounded-full" style={{ background: "var(--amal-s1)" }} />
              {t("amal.seriesAll")}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-0.5 w-3 rounded-full border-t-2 border-dashed" style={{ borderColor: "var(--amal-s2)" }} />
              {t("amal.seriesFard")}
            </span>
          </p>
        </div>
      ) : null}
      <div className="relative flex items-center gap-3 border-t border-border bg-muted/30 px-4 py-2.5">
        {allDone ? (
          <p className="flex-1 text-sm font-medium text-primary">✨ {t("amal.allDone")}</p>
        ) : next ? (
          <>
            <CheckButton
              done={false}
              locked={nextLocked}
              onToggle={() => toggle(today, next.id)}
              label={`${itemText(next, today, locale).title}: ${nextLocked && nextAt ? t("amal.opensAt", { time: formatTime(nextAt, intlLocale) }) : t("amal.markDone")}`}
              size={28}
            />
            <p className="min-w-0 flex-1 truncate text-sm">
              <span className="text-muted-foreground">{t("amal.nextDue")}: </span>
              <span className="font-medium">{itemText(next, today, locale).title}</span>
              {nextLocked && nextAt ? <span className="text-muted-foreground"> · {formatTime(nextAt, intlLocale)}</span> : null}
            </p>
          </>
        ) : (
          <span className="flex-1" />
        )}
        <Link href="/amal" className="flex shrink-0 items-center gap-0.5 text-sm font-medium text-primary">
          {t("amal.open")}
          <ChevronRight className="size-4 rtl:rotate-180" aria-hidden />
        </Link>
      </div>
    </Card>
  );
}
