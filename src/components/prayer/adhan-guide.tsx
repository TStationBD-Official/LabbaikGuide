"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, ChevronLeft, ChevronRight, RotateCcw, Volume2, X } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button, IconButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented";
import { ADHAN_LINES, AFTER_ADHAN, SHAHADA_RESPONSE, type AdhanDua } from "@/data/adhan/adhan-adhkar";
import { findAdhanWindow } from "@/features/prayer/adhan-window";
import { splitDuration, type PrayerName } from "@/features/prayer/times";
import type { usePrayerData } from "@/hooks/use-prayer";
import { cn, vibrate } from "@/lib/utils";
import { useZikrStore } from "@/stores/zikr-store";
import { lt } from "@/types/content";
import { prayerLabelKey } from "./prayer-widgets";

type Tab = "answer" | "dua";

function DuaBlock({ d }: { d: AdhanDua }) {
  const { t, contentLocale } = useI18n();
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-4">
      <p className="text-sm font-semibold text-primary">{lt(d.title, contentLocale)}</p>
      <p lang="ar" dir="rtl" className="font-arabic mt-2 text-[clamp(1.35rem,5.5vw,1.9rem)] leading-[2] text-foreground">
        {d.arabic}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{lt(d.translit, contentLocale)}</p>
      <p dir="auto" className="mt-1 text-sm text-foreground/85">“{lt(d.meaning, contentLocale)}”</p>
      {d.note ? <p className="mt-2 rounded-lg bg-gold-soft/60 px-3 py-2 text-xs text-foreground/85">{lt(d.note, contentLocale)}</p> : null}
      <p className="mt-2 text-[11px] text-muted-foreground">{t("adhan.source", { ref: d.ref })}</p>
    </div>
  );
}

/** Step-by-step reply to the adhan + the dua after it. */
export function AdhanGuide({ prayer, initialTab = "answer" }: { prayer: PrayerName | null; initialTab?: Tab }) {
  const { t, contentLocale, formatNumber } = useI18n();
  const reduce = useReducedMotion();
  const haptics = useZikrStore((s) => s.haptics);
  const [tab, setTab] = useState<Tab>(initialTab);
  const [step, setStep] = useState(0);
  const lines = ADHAN_LINES.filter((l) => !l.fajrOnly || prayer === "fajr" || prayer === null);
  const done = step >= lines.length;

  useEffect(() => {
    queueMicrotask(() => setTab(initialTab));
  }, [initialTab]);

  const go = (d: 1 | -1) => {
    if (haptics) vibrate(d === 1 && step + 1 >= lines.length ? [120, 60, 120] : 15);
    setStep((s) => Math.max(0, Math.min(lines.length, s + d)));
  };

  return (
    <div className="space-y-4">
      <SegmentedControl
        label={t("adhan.sectionTitle")}
        value={tab}
        onChange={setTab}
        options={[
          { value: "answer", label: t("adhan.tabAnswer") },
          { value: "dua", label: t("adhan.tabDua") },
        ]}
      />

      {tab === "answer" ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{t("adhan.answerHint")}</p>
          <ol className="space-y-2">
            {lines.map((l, i) => {
              const current = i === step;
              const past = i < step;
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => setStep(i)}
                    aria-current={current ? "step" : undefined}
                    className={cn(
                      "w-full rounded-2xl border p-3 text-start transition-colors",
                      current ? "border-gold bg-gold-soft/40 ring-2 ring-gold/30" : "border-border bg-card/60",
                      past && "opacity-60",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Volume2 className="size-3.5" aria-hidden />
                        {t("adhan.muezzin")} {t("adhan.times", { n: formatNumber(l.times) })}
                      </span>
                      {l.fajrOnly ? <span className="rounded-full bg-muted px-2 py-0.5">{t("adhan.fajrOnly")}</span> : null}
                      {past ? <Check className="size-4 text-primary" aria-hidden /> : null}
                    </div>
                    <p lang="ar" dir="rtl" className="font-arabic mt-1 text-[clamp(1.2rem,5vw,1.6rem)] leading-[1.9]">
                      {l.arabic}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {lt(l.translit, contentLocale)} — {lt(l.meaning, contentLocale)}
                    </p>
                    <div className={cn("mt-2 rounded-xl px-3 py-2", l.reply ? "bg-primary text-primary-foreground" : "bg-primary-soft text-primary")}>
                      <p className="text-[11px] font-semibold opacity-90">{t("adhan.you")}</p>
                      {l.reply ? (
                        <>
                          <p lang="ar" dir="rtl" className="font-arabic text-[clamp(1.15rem,4.8vw,1.5rem)] leading-[1.9]">
                            {l.reply.arabic}
                          </p>
                          <p className="text-xs opacity-90">
                            {lt(l.reply.translit, contentLocale)} — {lt(l.reply.meaning, contentLocale)}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm font-medium">{t("adhan.same")}</p>
                      )}
                    </div>
                  </button>
                  {l.id === "shahada-2" ? (
                    <details className="mt-2 rounded-2xl border border-dashed border-border px-3 py-2">
                      <summary className="cursor-pointer text-sm font-medium text-primary">{lt(SHAHADA_RESPONSE.title, contentLocale)}</summary>
                      <div className="mt-2">
                        <DuaBlock d={SHAHADA_RESPONSE} />
                      </div>
                    </details>
                  ) : null}
                </li>
              );
            })}
          </ol>

          <AnimatePresence>
            {done ? (
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-primary-soft p-3 text-primary"
                aria-live="polite"
              >
                <span className="text-sm font-semibold">{t("adhan.doneAnswer")}</span>
                <Button size="sm" onClick={() => setTab("dua")}>
                  {t("adhan.goDua")}
                </Button>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="sticky bottom-20 z-10 grid grid-cols-[1fr_2fr_auto] gap-2 rounded-2xl bg-background/85 p-1 backdrop-blur lg:bottom-4">
            <Button variant="outline" onClick={() => go(-1)} disabled={step === 0}>
              <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden />
              <span className="max-xs:sr-only">{t("adhan.prev")}</span>
            </Button>
            <Button onClick={() => go(1)} disabled={done}>
              {t("adhan.next")}
              <ChevronRight className="size-4 rtl:rotate-180" aria-hidden />
            </Button>
            <IconButton label={t("adhan.restart")} onClick={() => setStep(0)}>
              <RotateCcw className="size-4" aria-hidden />
            </IconButton>
          </div>
          <p className="text-[11px] text-muted-foreground">{t("adhan.source", { ref: t("adhan.answerRef") })}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {AFTER_ADHAN.map((d) => (
            <DuaBlock key={d.id} d={d} />
          ))}
          <p className="rounded-xl bg-muted px-3 py-2 text-sm">
            {t("adhan.betweenNote")} <span className="text-[11px] text-muted-foreground">({t("adhan.betweenRef")})</span>
          </p>
        </div>
      )}
    </div>
  );
}

const dismissKey = (prayer: string, day: string) => `hc-adhan-dismissed:${day}:${prayer}`;
const readDismissed = (k: string) => {
  try {
    return localStorage.getItem(k) === "1";
  } catch {
    return false;
  }
};

/** Home: shown automatically from 5 min before each adhan until 10 min after. */
export function AdhanWindowCard({ data, testButton = false }: { data: ReturnType<typeof usePrayerData>; testButton?: boolean }) {
  const { t, formatNumber } = useI18n();
  const { now, days, info } = data;
  const [dismissed, setDismissed] = useState<string | null>(null);
  // ── TEST-ONLY (remove after testing): simulated adhan time ──────────────
  const [simAdhan, setSimAdhan] = useState<number | null>(null);
  const sim = (offsetMs: number) => setSimAdhan(Date.now() + offsetMs);
  const simWin =
    simAdhan !== null && now && info
      ? (() => {
          const tt = now.getTime();
          const len = info.next.name === "fajr" ? 5 * 60_000 : 4 * 60_000;
          return {
            prayer: info.next.name,
            adhan: new Date(simAdhan),
            phase: (tt < simAdhan ? "before" : tt < simAdhan + len ? "during" : "after") as "before" | "during" | "after",
            msToAdhan: simAdhan - tt,
          };
        })()
      : null;
  // ────────────────────────────────────────────────────────────────────────
  const realWin = now && days ? findAdhanWindow(now, [days.today, days.tomorrow]) : null;
  const win = simWin ?? realWin;
  const dayKey = win ? win.adhan.toISOString().slice(0, 10) : "";
  const key = win ? dismissKey(win.prayer, dayKey) : "";
  if (!win || (!simWin && (dismissed === key || readDismissed(key)))) {
    // TEST-ONLY button (remove after testing)
    return testButton && now && info ? (
      <button
        type="button"
        onClick={() => sim(60_000)}
        className="w-full rounded-2xl border-2 border-dashed border-gold/70 bg-gold-soft/30 px-4 py-3 text-sm font-semibold text-gold"
      >
        🧪 টেস্ট: আযানের কার্ড দেখান
      </button>
    ) : null;
  }

  const isFriday = days!.today.isFriday;
  const prayerName = t(prayerLabelKey(win.prayer, isFriday));
  const { m, s } = splitDuration(Math.max(0, win.msToAdhan));
  const pad = (n: number) => formatNumber(n).padStart(2, formatNumber(0));

  return (
    <Card className="overflow-hidden border-gold/60 p-0 ring-2 ring-gold/25">
      {simWin ? (
        // TEST-ONLY controls (remove after testing)
        <div className="flex flex-wrap items-center gap-1.5 border-b border-dashed border-gold/60 bg-gold-soft/30 px-3 py-2 text-xs">
          <span className="font-semibold text-gold">🧪 টেস্ট মোড:</span>
          <Button size="sm" variant="outline" onClick={() => sim(60_000)}>
            আযানের ১ মিনিট আগে
          </Button>
          <Button size="sm" variant="outline" onClick={() => sim(0)}>
            আযান শুরু
          </Button>
          <Button size="sm" variant="outline" onClick={() => sim(-5 * 60_000)}>
            আযানের পর
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSimAdhan(null)}>
            টেস্ট বন্ধ
          </Button>
        </div>
      ) : null}
      <div className="flex items-center gap-3 bg-gold-soft/60 px-4 py-3">
        <span className="relative flex size-3 shrink-0" aria-hidden>
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold opacity-60" />
          <span className="relative inline-flex size-3 rounded-full bg-gold" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">
            {win.phase === "before" ? t("adhan.titleBefore", { prayer: prayerName }) : t("adhan.titleDuring", { prayer: prayerName })}
          </p>
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {win.phase === "before" ? (
              <span dir="ltr" className="tabular-nums">
                {t("adhan.inTime", { time: `${pad(m)}:${pad(s)}` })}
              </span>
            ) : (
              t("adhan.now")
            )}
          </p>
        </div>
        <IconButton
          size="sm"
          label={t("adhan.dismiss")}
          onClick={() => {
            if (simWin) return setSimAdhan(null); // TEST-ONLY
            try {
              localStorage.setItem(key, "1");
            } catch {
              /* private mode — dismiss for this session only */
            }
            setDismissed(key);
          }}
        >
          <X className="size-4" aria-hidden />
        </IconButton>
      </div>
      <div className="p-4">
        <AdhanGuide key={`${win.prayer}-${dayKey}${simWin ? "-sim" : ""}`} prayer={win.prayer} initialTab={win.phase === "after" ? "dua" : "answer"} />
      </div>
    </Card>
  );
}
