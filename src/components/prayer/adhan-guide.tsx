"use client";

import { useEffect, useRef, useState } from "react";
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
      <p lang="ar" dir="rtl" className="font-dua mt-2 text-[clamp(1.35rem,5.5vw,1.9rem)] text-foreground">
        {d.arabic}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{lt(d.translit, contentLocale)}</p>
      <p dir="auto" className="mt-1 text-sm text-foreground/85">“{lt(d.meaning, contentLocale)}”</p>
      {d.note ? <p className="mt-2 rounded-lg bg-gold-soft/60 px-3 py-2 text-xs text-foreground/85">{lt(d.note, contentLocale)}</p> : null}
      <p className="mt-2 text-[11px] text-muted-foreground">{t("adhan.source", { ref: d.ref })}</p>
    </div>
  );
}

type Saved = { step: number; tab: Tab };
const PROGRESS_PREFIX = "hc-adhan-progress:";

function loadProgress(key: string): Saved | null {
  try {
    const raw = localStorage.getItem(PROGRESS_PREFIX + key);
    if (!raw) return null;
    const v = JSON.parse(raw) as Saved;
    return Number.isInteger(v.step) && (v.tab === "answer" || v.tab === "dua") ? v : null;
  } catch {
    return null;
  }
}

function saveProgress(key: string, v: Saved) {
  try {
    localStorage.setItem(PROGRESS_PREFIX + key, JSON.stringify(v));
    // Drop entries from earlier days (keys look like "YYYY-MM-DD:prayer").
    const today = key.slice(0, 10);
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k?.startsWith(PROGRESS_PREFIX) && /^\d{4}-\d{2}-\d{2}/.test(k.slice(PROGRESS_PREFIX.length)) && k.slice(PROGRESS_PREFIX.length, PROGRESS_PREFIX.length + 10) < today)
        localStorage.removeItem(k);
    }
  } catch {
    /* storage unavailable (private mode) — progress just isn't kept */
  }
}

/** Step-by-step reply to the adhan + the dua after it. `storageKey` keeps the place across reloads. */
export function AdhanGuide({ prayer, initialTab = "answer", storageKey }: { prayer: PrayerName | null; initialTab?: Tab; storageKey?: string }) {
  const { t, contentLocale, formatNumber } = useI18n();
  const reduce = useReducedMotion();
  const haptics = useZikrStore((s) => s.haptics);
  const [tab, setTab] = useState<Tab>(initialTab);
  const [step, setStep] = useState(0);
  const lines = ADHAN_LINES.filter((l) => !l.fajrOnly || prayer === "fajr" || prayer === null);
  const done = step >= lines.length;
  const listRef = useRef<HTMLOListElement>(null);
  const moved = useRef(false);

  // Keep the current line in view while stepping (not on first render).
  useEffect(() => {
    if (!moved.current) return;
    const el = listRef.current?.querySelector<HTMLElement>('[aria-current="step"]');
    el?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
  }, [step]);

  // Restore the saved place once; afterwards follow phase changes (e.g. switch to dua after the adhan).
  const restored = useRef(false);
  const lastInitial = useRef(initialTab);
  useEffect(() => {
    if (!restored.current) {
      restored.current = true;
      const saved = storageKey ? loadProgress(storageKey) : null;
      if (saved) {
        queueMicrotask(() => {
          setStep(Math.min(saved.step, lines.length));
          setTab(saved.tab);
        });
      }
      return;
    }
    if (lastInitial.current !== initialTab) {
      lastInitial.current = initialTab;
      queueMicrotask(() => setTab(initialTab));
    }
  }, [initialTab, storageKey, lines.length]);

  useEffect(() => {
    if (storageKey && restored.current) saveProgress(storageKey, { step, tab });
  }, [storageKey, step, tab]);

  const go = (d: 1 | -1) => {
    moved.current = true;
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
          <ol ref={listRef} className="space-y-2">
            {lines.map((l, i) => {
              const current = i === step;
              const past = i < step;
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    // Tap the highlighted line to move on; tap any other line to jump there.
                    onClick={() => (current ? go(1) : ((moved.current = true), setStep(i)))}
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
                    <p lang="ar" dir="rtl" className="font-dua mt-1 text-[clamp(1.2rem,5vw,1.6rem)]">
                      {l.arabic}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {lt(l.translit, contentLocale)} — {lt(l.meaning, contentLocale)}
                    </p>
                    <div className={cn("mt-2 rounded-xl px-3 py-2", l.reply ? "bg-primary text-primary-foreground" : "bg-primary-soft text-primary")}>
                      <p className="text-[11px] font-semibold opacity-90">{t("adhan.you")}</p>
                      {l.reply ? (
                        <>
                          <p lang="ar" dir="rtl" className="font-dua text-[clamp(1.15rem,4.8vw,1.5rem)]">
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

          <div className="grid grid-cols-[1fr_2fr_auto] gap-2 pt-1">
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
export function AdhanWindowCard({ data }: { data: ReturnType<typeof usePrayerData> }) {
  const { t, formatNumber } = useI18n();
  const { now, days } = data;
  const [dismissed, setDismissed] = useState<string | null>(null);
  const win = now && days ? findAdhanWindow(now, [days.today, days.tomorrow]) : null;
  const dayKey = win ? win.adhan.toISOString().slice(0, 10) : "";
  const key = win ? dismissKey(win.prayer, dayKey) : "";
  if (!win || dismissed === key || readDismissed(key)) return null;

  const isFriday = days!.today.isFriday;
  const prayerName = t(prayerLabelKey(win.prayer, isFriday));
  const { m, s } = splitDuration(Math.max(0, win.msToAdhan));
  const pad = (n: number) => formatNumber(n).padStart(2, formatNumber(0));

  return (
    <Card className="overflow-hidden border-gold/60 p-0 ring-2 ring-gold/25">
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
        <AdhanGuide
          key={`${win.prayer}-${dayKey}`}
          prayer={win.prayer}
          storageKey={`${dayKey}:${win.prayer}`}
          initialTab={win.phase === "after" ? "dua" : "answer"}
        />
      </div>
    </Card>
  );
}
