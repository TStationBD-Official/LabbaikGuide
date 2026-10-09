"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Check, ChevronRight, Moon, Sun, Sunrise, Sunset } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Card } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/progress";
import { usePlanText } from "@/components/layout/notifier";
import { useStoreHydrated } from "@/hooks/use-hydrated";
import type { usePrayerData } from "@/hooks/use-prayer";
import { ZIKR_CATALOG } from "@/data/zikr/after-salah";
import { formatTime, ymdInZone, ymdKey } from "@/features/prayer/calendar";
import { progressKey, usePlanStore, type SalahName } from "@/stores/zikr-plan-store";
import { useZikrStore } from "@/stores/zikr-store";
import { lt } from "@/types/content";
import { cn } from "@/lib/utils";

const SALAH: SalahName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
const ICON = { fajr: Sunrise, dhuhr: Sun, asr: Sun, maghrib: Sunset, isha: Moon } as const;

/**
 * Home, right under the prayer card: from a prayer's adhan until the next one (Fajr: until sunrise),
 * the after-salah zikr plan for that prayer with its progress — one tap opens the step-by-step counter.
 */
export function AfterSalahHomeCard({ data }: { data: ReturnType<typeof usePrayerData> }) {
  const { t, contentLocale, intlLocale, formatNumber } = useI18n();
  const reduce = useReducedMotion();
  const text = usePlanText();
  const ready = useStoreHydrated(usePlanStore);
  const plans = usePlanStore((s) => s.plans);
  const progress = usePlanStore((s) => s.progress);
  const custom = useZikrStore((s) => s.custom);

  const now = data.now;
  const prayers = data.days?.today.prayers;
  if (!ready || !now || !prayers) return null;

  // The prayer whose time it is now (its adhan has passed and the next one hasn't come).
  const t0 = now.getTime();
  const current = [...prayers]
    .filter((p) => SALAH.includes(p.name as SalahName))
    .reverse()
    .find((p) => p.adhan.getTime() <= t0);
  if (!current) return null;
  const name = current.name as SalahName;
  const end =
    name === "fajr" ? prayers.find((p) => p.name === "sunrise")?.adhan : prayers.find((p) => p.adhan.getTime() > current.adhan.getTime() && SALAH.includes(p.name as SalahName))?.adhan;
  if (end && t0 >= end.getTime()) return null;

  const plan = plans.find((p) => p.id === `salah-${name}`);
  if (!plan || !plan.items.length) return null;
  const day = ymdKey(ymdInZone(now));
  const pr = progress[progressKey(plan.id, day)];
  const total = plan.items.reduce((a, i) => a + i.count, 0);
  const doneCount = pr ? (pr.done ? total : plan.items.slice(0, pr.step).reduce((a, i) => a + i.count, 0) + pr.count) : 0;
  const done = Boolean(pr?.done);
  const step = Math.min(pr?.step ?? 0, plan.items.length - 1);
  const catalog = new Map([...ZIKR_CATALOG, ...custom].map((z) => [z.id, z]));
  const z = catalog.get(plan.items[step].zikrId);
  const Icon = ICON[name];

  return (
    <motion.div initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Link href={`/zikr?plan=${plan.id}`} className="group block">
        <Card className={cn("relative overflow-hidden p-4 transition-colors", done ? "border-primary/40" : "border-gold/50 ring-2 ring-gold/20 hover:border-gold")}>
          <div className="pointer-events-none absolute -end-12 -top-12 size-36 rounded-full bg-gold-soft/70 blur-2xl" aria-hidden />
          <div className="relative flex items-center gap-4">
            <CircularProgress value={doneCount} max={total} size={72} stroke={7} label={text.planName(plan)}>
              {done ? (
                <Check className="size-7 text-primary" aria-hidden />
              ) : (
                <span className="text-sm font-bold tabular-nums">
                  {formatNumber(doneCount)}
                  <span className="text-[10px] font-normal text-muted-foreground">/{formatNumber(total)}</span>
                </span>
              )}
            </CircularProgress>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className="size-3.5 text-gold" aria-hidden />
                {t("zikrPlan.adhanAt", { time: formatTime(current.adhan, intlLocale) })}
                {current.iqamah ? ` · ${t("home.iqamahAt", { time: formatTime(current.iqamah, intlLocale) })}` : ""}
              </p>
              <p className="font-semibold leading-snug">{text.planName(plan)}</p>
              <p className="truncate text-sm text-muted-foreground">
                {done
                  ? t("zikrPlan.planDoneToast", { name: text.planName(plan) })
                  : pr
                    ? `${t("zikrPlan.step", { step: formatNumber(step + 1), total: formatNumber(plan.items.length) })} · ${z ? lt(z.name, contentLocale) : ""}`
                    : text.summary(plan)}
              </p>
            </div>
            <span
              className={cn(
                "flex shrink-0 items-center gap-0.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5",
                done ? "text-primary" : "bg-primary text-primary-foreground shadow-soft",
              )}
            >
              {done ? t("zikrPlan.statusDone") : pr ? t("home.continueZikr") : t("home.startZikr")}
              {!done ? <ChevronRight className="size-4 rtl:rotate-180" aria-hidden /> : null}
            </span>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
