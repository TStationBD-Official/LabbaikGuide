"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ChevronRight, Flame } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Card } from "@/components/ui/card";
import { prayerLabelKey } from "@/components/prayer/prayer-widgets";
import { useStoreHydrated } from "@/hooks/use-hydrated";
import type { usePrayerData } from "@/hooks/use-prayer";
import { AMAL_BY_ID, PRAYERS, SLOTS } from "@/data/amal/items";
import { fardStreak, isDone, isFridayKey, isSalat, itemsFor, scoreDay } from "@/features/amal/logic";
import { useAmalSync } from "@/features/amal/sync";
import { useAmalStore } from "@/stores/amal-store";
import { cn } from "@/lib/utils";
import { AmalRing, CheckButton, currentSlot, itemText, useAmalSettings, useAmalToday, usePct } from "./amal-ui";

/** Home overview: today's score ring, the five fard prayers (tap to tick), the next deed and the streak. */
export function AmalHomeCard({ data }: { data: ReturnType<typeof usePrayerData> }) {
  const { t, locale, formatNumber } = useI18n();
  const pct = usePct();
  const today = useAmalToday();
  const ready = useStoreHydrated(useAmalStore);
  const s = useAmalSettings();
  const rec = useAmalStore((st) => st.days[today]);
  const days = useAmalStore((st) => st.days);
  const toggle = useAmalStore((st) => st.toggle);
  useAmalSync();

  if (!today || !ready) return <div className="h-44 animate-pulse rounded-3xl bg-muted" aria-hidden />;
  const score = scoreDay(today, rec, s);
  const streak = fardStreak(days, s, today).current;
  const fri = isFridayKey(today);

  // Next deed: the first unfinished one from the current part of the day onwards.
  const cur = currentSlot(data.now, data.days?.today.prayers);
  const from = cur ? SLOTS.indexOf(cur) : 0;
  const pending = itemsFor(today, s).filter((i) => !isDone(i, rec, s) && !(rec?.excused && isSalat(i)));
  const next =
    pending.find((i) => i.slot !== "day" && SLOTS.indexOf(i.slot) >= from && SLOTS.indexOf(i.slot) < SLOTS.indexOf("day")) ?? pending.find((i) => i.slot === "day") ?? pending[0] ?? null;
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
              return (
                <button
                  key={p}
                  type="button"
                  role="checkbox"
                  aria-checked={d}
                  aria-label={name}
                  onClick={() => toggle(today, item.id)}
                  className="flex flex-col items-center gap-1"
                >
                  <motion.span
                    initial={false}
                    animate={{ scale: d ? [1, 1.22, 1] : 1 }}
                    transition={{ duration: 0.35 }}
                    className={cn(
                      "grid size-8 place-items-center rounded-full border-2 text-xs font-bold transition-colors",
                      d ? "border-primary bg-primary text-primary-foreground" : cur === p ? "border-gold bg-gold-soft text-gold" : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    {d ? "✓" : formatNumber(n + 1)}
                  </motion.span>
                  <span className={cn("max-w-full truncate text-[10px]", cur === p ? "font-semibold text-gold" : "text-muted-foreground")}>{name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="relative flex items-center gap-3 border-t border-border bg-muted/30 px-4 py-2.5">
        {allDone ? (
          <p className="flex-1 text-sm font-medium text-primary">✨ {t("amal.allDone")}</p>
        ) : next ? (
          <>
            <CheckButton done={false} onToggle={() => toggle(today, next.id)} label={`${itemText(next, today, locale).title}: ${t("amal.markDone")}`} size={28} />
            <p className="min-w-0 flex-1 truncate text-sm">
              <span className="text-muted-foreground">{t("amal.nextDue")}: </span>
              <span className="font-medium">{itemText(next, today, locale).title}</span>
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
