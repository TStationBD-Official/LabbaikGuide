"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BookOpen, ChevronDown, ChevronLeft, ChevronRight, ExternalLink, Flame, Lightbulb, Lock, ShieldCheck, Sparkles, Trash2, Zap } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { usePrefs } from "@/components/providers/preferences-provider";
import { Card } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented";
import { Toggle } from "@/components/ui/toggle";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm";
import { useClock, usePrayerData } from "@/hooks/use-prayer";
import { useStoreHydrated } from "@/hooks/use-hydrated";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { gt } from "@/data/guides/travel";
import { AMAL_ITEMS, SLOTS, type AmalItem, type AmalSlot } from "@/data/amal/items";
import {
  countOf,
  fardStreak,
  goalOf,
  isDone,
  isEnabled,
  isFridayKey,
  itemsFor,
  itemStats,
  kindBreakdown,
  parseKey,
  rangeScores,
  recommend,
  scoreDay,
  shiftKey,
  summarize,
  trackedKeys,
  isSalat,
  isOpen,
  opensAt,
  fajrOf,
  trendPoints,
  type Recommendation,
} from "@/features/amal/logic";
import { useAmalSync } from "@/features/amal/sync";
import { formatHijri, formatTime } from "@/features/prayer/calendar";
import { useAmalStore } from "@/stores/amal-store";
import { cn } from "@/lib/utils";
import { HBars, MonthHeatmap, TrendChart, TrendTable, type TrendPoint } from "./amal-charts";
import { AmalRing, Bar, CheckButton, Confetti, currentSlot, itemText, KIND_STYLE, SLOT_EMOJI, useAmalSettings, useAmalToday, usePct } from "./amal-ui";

type Tab = "today" | "progress" | "settings";
const MAX_BACK = 60; // days you can go back to tick

export function AmalPage() {
  const { t } = useI18n();
  const today = useAmalToday();
  const ready = useStoreHydrated(useAmalStore);
  const [tab, setTab] = useState<Tab>("today");
  const [day, setDay] = useState<string | null>(null);
  useAmalSync();

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("tab");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the address once on mount
    if (q === "progress" || q === "settings") setTab(q);
  }, []);

  const change = (v: Tab) => {
    setTab(v);
    window.history.replaceState(null, "", v === "today" ? "/amal" : `/amal?tab=${v}`);
  };

  if (!today || !ready) return <div className="h-80 animate-pulse rounded-3xl bg-muted" aria-busy />;
  const shown = day && day <= today ? day : today;

  return (
    <div className="space-y-5">
      <SegmentedControl
        label={t("amal.title")}
        value={tab}
        onChange={change}
        options={[
          { value: "today", label: t("amal.tabToday") },
          { value: "progress", label: t("amal.tabProgress") },
          { value: "settings", label: t("amal.tabSettings") },
        ]}
        className="max-w-md"
      />
      {tab === "today" ? (
        <TodayView key="today" day={shown} today={today} onDay={(d) => setDay(d === today ? null : d)} />
      ) : tab === "progress" ? (
        <ProgressView
          today={today}
          onOpenDay={(d) => {
            setDay(d === today ? null : d);
            change("today");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      ) : (
        <SettingsView />
      )}
    </div>
  );
}

// ───────────────────────────── Today ─────────────────────────────

function TodayView({ day, today, onDay }: { day: string; today: string; onDay: (d: string) => void }) {
  const { t, locale, intlLocale, formatNumber } = useI18n();
  const toast = useToast();
  const pct = usePct();
  const s = useAmalSettings();
  const rec = useAmalStore((st) => st.days[day]);
  const days = useAmalStore((st) => st.days);
  const firstDay = useAmalStore((st) => st.firstDay);
  const toggle = useAmalStore((st) => st.toggle);
  const setExcused = useAmalStore((st) => st.setExcused);
  const location = usePrefs((st) => st.location);
  const prayer = usePrayerData(location);
  const isToday = day === today;
  const fri = isFridayKey(day);

  const minute = prayer.now ? Math.floor(prayer.now.getTime() / 60_000) : 0;
  const due = useMemo(() => (minute ? { now: new Date(minute * 60_000), location } : undefined), [minute, location]);
  const score = scoreDay(day, rec, s, undefined, due);
  const items = itemsFor(day, s);
  const streak = useMemo(() => fardStreak(days, s, today), [days, s, today]);
  const kinds = kindBreakdown(days, s, [day], due);
  const slot = isToday ? currentSlot(prayer.now, prayer.days?.today.prayers) : null;
  const now = prayer.now;
  /** "Opens at 3:30 PM" while the deed's time hasn't come today; null when it can be ticked. */
  const opensLabel = (i: AmalItem, k: string = day): string | null => {
    if (!now || isOpen(i, k, now, location)) return null;
    const at = opensAt(i, k, location);
    return at ? t("amal.opensAt", { time: formatTime(at, intlLocale) }) : t("amal.lockedHint");
  };
  // Before Fajr, last night's Witr, Tahajjud and night recitation still belong to yesterday.
  const yesterday = shiftKey(today, -1);
  const yRec = useAmalStore((st) => st.days[yesterday]);
  const lastNight = isToday && now && now.getTime() < fajrOf(today, location).getTime() ? itemsFor(yesterday, s).filter((i) => (i.slot === "isha" || i.slot === "night") && i.kind !== "fard" && !isDone(i, yRec, s)) : [];
  const ymd = { year: +day.slice(0, 4), month: +day.slice(5, 7), day: +day.slice(8, 10) };
  const dateLabel = new Intl.DateTimeFormat(intlLocale, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(parseKey(day));
  const recs = useMemo(() => (isToday ? recommend(days, s, today, firstDay, 2) : []), [isToday, days, s, today, firstDay]);

  // Celebrate once when the day reaches 100 %.
  const [party, setParty] = useState(false);
  const prev = useRef(score.pct);
  useEffect(() => {
    if (prev.current < 1 && score.pct >= 1 && score.totalItems > 0) {
      setParty(true);
      toast(t("amal.celebrate"));
      const id = setTimeout(() => setParty(false), 2600);
      prev.current = score.pct;
      return () => clearTimeout(id);
    }
    prev.current = score.pct;
  }, [score.pct, score.totalItems, toast, t]);

  const timeOf = (slot: AmalSlot) => {
    if (!isToday || !prayer.days) return null;
    const p = prayer.days.today.prayers.find((x) => x.name === (slot === "morning" ? "sunrise" : slot));
    return p ? formatTime(p.adhan, intlLocale) : null;
  };

  return (
    <div className="space-y-5">
      {party ? <Confetti /> : null}

      {/* hero */}
      <section className="hc-amal-hero relative overflow-hidden rounded-3xl p-4 text-white shadow-soft sm:p-5" aria-label={t("amal.title")}>
        <div className="hc-amal-shine pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onDay(shiftKey(day, -1))}
            disabled={day <= shiftKey(today, -MAX_BACK)}
            className="grid size-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20 disabled:opacity-40"
            aria-label={t("amal.prevDay")}
          >
            <ChevronLeft className="size-5 rtl:rotate-180" aria-hidden />
          </button>
          <div className="min-w-0 text-center">
            <p className="truncate font-semibold">{dateLabel}</p>
            <p className="truncate text-xs opacity-80">{formatHijri(ymd, intlLocale)}</p>
          </div>
          <button
            type="button"
            onClick={() => onDay(shiftKey(day, 1))}
            disabled={isToday}
            className="grid size-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20 disabled:opacity-40"
            aria-label={t("amal.nextDay")}
          >
            <ChevronRight className="size-5 rtl:rotate-180" aria-hidden />
          </button>
        </div>

        <div className="relative mt-4 flex items-center gap-4 sm:gap-6">
          <AmalRing pct={score.pct} size={128} stroke={12} onDark label={t("amal.dayScore")}>
            <div>
              <p className="text-3xl font-bold tabular-nums">{pct(score.pct)}</p>
              <p className="text-[11px] opacity-80">{t("amal.itemsDone", { done: formatNumber(score.doneItems), total: formatNumber(score.totalItems) })}</p>
            </div>
          </AmalRing>
          <div className="min-w-0 flex-1 space-y-2.5">
            <div>
              <p className="text-xs opacity-80">{t("amal.fardShort")}</p>
              <div className="mt-1 flex gap-1.5">
                {AMAL_ITEMS.filter((i) => i.kind === "fard").map((i, n) => {
                  const d = isDone(i, rec, s);
                  return (
                    <motion.span
                      key={i.id}
                      initial={false}
                      animate={{ scale: d ? [1, 1.25, 1] : 1 }}
                      transition={{ duration: 0.35, delay: n * 0.03 }}
                      className={cn("grid size-7 place-items-center rounded-full text-[11px] font-bold", d ? "bg-amber-300 text-emerald-950" : "bg-white/15 text-white/70", rec?.excused && "opacity-40")}
                      title={itemText(i, day, locale).title}
                    >
                      {d ? "✓" : formatNumber(n + 1)}
                    </motion.span>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1" title={t("amal.streakHint")}>
                <Flame className="size-3.5 text-amber-300" aria-hidden />
                {t("amal.streakDays", { n: formatNumber(streak.current) })}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 opacity-90">{t("amal.best", { n: formatNumber(streak.best) })}</span>
            </div>
          </div>
        </div>

        {!isToday ? (
          <div className="relative mt-3 flex items-center justify-between gap-2 rounded-xl bg-black/20 px-3 py-2 text-xs">
            <span>{t("amal.pastDay")}</span>
            <button type="button" onClick={() => onDay(today)} className="font-semibold underline">
              {t("amal.backToday")}
            </button>
          </div>
        ) : null}
      </section>

      {/* by type (this day) */}
      {kinds.length ? (
        <Card className="hc-rise grid grid-cols-2 gap-x-4 gap-y-3 p-4 sm:grid-cols-3">
          {kinds.map((k, i) => (
            <div key={k.kind} className="space-y-1">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-medium">{t(`amal.kind_${k.kind}`)}</span>
                <span className="text-muted-foreground tabular-nums">
                  {formatNumber(k.done)}/{formatNumber(k.total)}
                </span>
              </div>
              <Bar value={k.total ? k.done / k.total : 0} barClass={KIND_STYLE[k.kind].bar} delay={i * 0.05} />
            </div>
          ))}
        </Card>
      ) : null}

      {recs.length ? <Recommendations recs={recs} compact /> : null}

      <Card className="p-4">
        <Toggle checked={Boolean(rec?.excused)} onChange={(v) => setExcused(day, v)} label={t("amal.excused")} description={t("amal.excusedNote")} emoji="🌙" compact />
      </Card>

      {lastNight.length ? (
        <section aria-labelledby="last-night" className="hc-rise space-y-2 rounded-3xl bg-primary-soft/40 p-2 ring-1 ring-primary/30">
          <header className="flex items-center gap-3 px-1 pt-1">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-card text-xl shadow-soft" aria-hidden>
              🌌
            </span>
            <div className="min-w-0">
              <h2 id="last-night" className="font-semibold">
                {t("amal.lastNight")}
              </h2>
              <p className="text-xs text-muted-foreground">{t("amal.lastNightNote")}</p>
            </div>
          </header>
          <ul className="space-y-2">
            {lastNight.map((i) => (
              <AmalRow key={`y-${i.id}`} item={i} day={yesterday} excused={false} onToggle={() => toggle(yesterday, i.id)} />
            ))}
          </ul>
        </section>
      ) : null}

      {/* the day, slot by slot */}
      <div className="space-y-5">
        {SLOTS.map((sl) => {
          const list = items.filter((i) => i.slot === sl);
          if (!list.length) return null;
          const done = list.filter((i) => isDone(i, rec, s)).length;
          const isNow = slot === sl;
          const time = timeOf(sl);
          const allLocked = list.every((i) => opensLabel(i) && !isDone(i, rec, s));
          const name = sl === "dhuhr" && fri ? t("amal.slot_jumuah") : t(`amal.slot_${sl}`);
          return (
            <section key={sl} aria-labelledby={`slot-${sl}`} className={cn("hc-rise space-y-2", isNow && "rounded-3xl bg-gold-soft/30 p-2 ring-2 ring-gold/40", allLocked && "opacity-80")}>
              <header className="flex items-center gap-3 px-1">
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-card text-xl shadow-soft" aria-hidden>
                  {SLOT_EMOJI[sl]}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 id={`slot-${sl}`} className="flex items-center gap-2 font-semibold">
                    {name}
                    {isNow ? <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-white">{t("amal.now")}</span> : null}
                    {allLocked ? <Lock className="size-3.5 text-muted-foreground" aria-label={t("amal.lockedHint")} /> : null}
                  </h2>
                  {time ? <p className="text-xs text-muted-foreground tabular-nums">{time}</p> : null}
                </div>
                <div className="w-20 shrink-0 text-end">
                  <p className="text-xs font-semibold tabular-nums">
                    {formatNumber(done)}/{formatNumber(list.length)}
                  </p>
                  <Bar value={done / list.length} className="mt-1 h-1.5" barClass={done === list.length ? "bg-gold" : "bg-primary"} />
                </div>
              </header>
              <ul className="space-y-2">
                {list.map((i) => (
                  <AmalRow key={i.id} item={i} day={day} excused={Boolean(rec?.excused) && isSalat(i)} onToggle={() => toggle(day, i.id)} opensLabel={opensLabel(i)} />
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-gold" aria-hidden />
        {t("amal.privacy")}
      </p>
    </div>
  );
}

function AmalRow({ item, day, excused, onToggle, opensLabel }: { item: AmalItem; day: string; excused: boolean; onToggle: () => void; opensLabel?: string | null }) {
  const { t, locale, formatNumber } = useI18n();
  const reduce = useReducedMotion();
  const s = useAmalSettings();
  const rec = useAmalStore((st) => st.days[day]);
  const [open, setOpen] = useState(false);
  const done = isDone(item, rec, s);
  const auto = Boolean(rec?.auto?.[item.id]);
  const goal = goalOf(item, s);
  const count = countOf(item, rec);
  const { title, sub } = itemText(item, day, locale);
  const where = item.auto ? t(`amal.where_${item.auto.type}`) : "";
  const locked = Boolean(opensLabel) && !done;

  return (
    <motion.li layout={!reduce} className={cn("overflow-hidden rounded-2xl border bg-card shadow-soft transition-colors", done ? "border-primary/40" : locked ? "border-dashed border-border bg-card/60" : "border-border", excused && "opacity-50")}>
      <div className="flex items-start gap-3 p-3">
        <CheckButton done={done} locked={locked} onToggle={onToggle} label={`${title}: ${locked ? opensLabel : done ? t("amal.markUndone") : t("amal.markDone")}`} />
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="min-w-0 flex-1 text-start">
          <span className={cn("block font-medium leading-snug", (done || locked) && "text-muted-foreground")}>{title}</span>
          {sub ? <span className="mt-0.5 block text-xs text-muted-foreground">{sub}</span> : null}
          <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", KIND_STYLE[item.kind].chip, locked && "opacity-60")}>{t(`amal.kind_${item.kind}`)}</span>
            {locked ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                <Lock className="size-3" aria-hidden />
                {opensLabel}
              </span>
            ) : null}
            {item.grade === "weak" ? <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">{t("amal.weak")}</span> : null}
            {auto && done ? (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:text-sky-300">
                <Zap className="size-3" aria-hidden />
                {t("amal.auto")}
              </span>
            ) : null}
          </span>
          {goal > 0 ? (
            <span className="mt-2 flex items-center gap-2">
              <Bar value={count / goal} className="h-1.5 flex-1" barClass={done ? "bg-gold" : "bg-primary"} />
              <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">{t("amal.count", { n: formatNumber(count), goal: formatNumber(goal) })}</span>
            </span>
          ) : null}
        </button>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-label={t("amal.why")} aria-expanded={open} className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted">
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} aria-hidden />
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t border-border bg-muted/30"
          >
            <div className="space-y-2.5 p-3 text-sm">
              <p className="leading-relaxed" dir="auto">
                {gt(item.virtue, locale)}
              </p>
              <ul className="space-y-1 text-xs">
                {item.refs.map((r) => (
                  <li key={r.label} className="flex gap-1.5">
                    <BookOpen className="mt-0.5 size-3.5 shrink-0 text-gold" aria-hidden />
                    {r.url ? (
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-gold hover:underline">
                        {r.label}
                        <ExternalLink className="size-3" aria-hidden />
                      </a>
                    ) : (
                      <span className="font-medium text-gold">{r.label}</span>
                    )}
                  </li>
                ))}
              </ul>
              {item.auto ? (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Zap className="size-3.5 text-sky-500" aria-hidden />
                  {item.auto.type === "count" ? t("amal.countHint") : t("amal.autoNote", { where })}
                </p>
              ) : null}
              {item.href ? (
                <Link href={item.href} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-sm font-semibold text-primary-foreground shadow-soft">
                  {t("amal.doIt")}
                  <ChevronRight className="size-4 rtl:rotate-180" aria-hidden />
                </Link>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.li>
  );
}

// ───────────────────────────── Recommendations ─────────────────────────────

export function Recommendations({ recs, compact }: { recs: Recommendation[]; compact?: boolean }) {
  const { t, locale, formatNumber } = useI18n();
  const pct = usePct();
  const text = (r: Recommendation) => {
    switch (r.type) {
      case "start":
        return { icon: "🌱", body: t("amal.rec_start"), ref: t("amal.consistencyRef") };
      case "fard":
        return { icon: "🕌", body: t("amal.rec_fard", { title: gt(r.item.title, locale), done: formatNumber(r.done), total: formatNumber(r.total) }), ref: r.item.refs.map((x) => x.label).join(" · ") };
      case "improve":
        return {
          icon: "💡",
          body: t("amal.rec_improve", { title: gt(r.item.title, locale), done: formatNumber(r.done), total: formatNumber(r.total), virtue: gt(r.item.virtue, locale) }),
          ref: r.item.refs.map((x) => x.label).join(" · "),
          href: r.item.href,
        };
      case "kahf":
        return { icon: "📖", body: t("amal.rec_kahf"), ref: "al-Hakim; al-Bayhaqi — Sahih al-Jami' 6470", href: "/quran/surah/18" };
      case "consistency":
        return { icon: "🔥", body: t("amal.rec_consistency"), ref: t("amal.consistencyRef") };
      case "great":
        return { icon: "🌟", body: t("amal.rec_great", { pct: pct(r.avg) }), ref: "" };
    }
  };
  return (
    <Card className={cn("hc-rise space-y-3 border-gold/40 bg-gradient-to-br from-gold-soft/50 to-card", compact ? "p-4" : "p-5")}>
      <h2 className="flex items-center gap-2 font-semibold">
        <Lightbulb className="size-4 text-gold" aria-hidden />
        {t("amal.recTitle")}
      </h2>
      <ul className="space-y-3">
        {recs.map((r, i) => {
          const x = text(r);
          return (
            <motion.li key={`${r.type}-${i}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-card text-lg shadow-soft" aria-hidden>
                {x.icon}
              </span>
              <div className="min-w-0 space-y-1">
                <p className="text-sm leading-relaxed" dir="auto">
                  {x.body}
                </p>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                  {x.ref ? <span>{x.ref}</span> : null}
                  {"href" in x && x.href ? (
                    <Link href={x.href} className="font-semibold text-primary">
                      {t("amal.doIt")} →
                    </Link>
                  ) : null}
                </p>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </Card>
  );
}

// ───────────────────────────── Progress ─────────────────────────────

type Range = "week" | "month" | "year";

function ProgressView({ today, onOpenDay }: { today: string; onOpenDay: (d: string) => void }) {
  const { t, intlLocale, formatNumber, locale } = useI18n();
  const pct = usePct();
  const s = useAmalSettings();
  const days = useAmalStore((st) => st.days);
  const firstDay = useAmalStore((st) => st.firstDay);
  const [range, setRange] = useState<Range>("week");
  const location = usePrefs((st) => st.location);
  const { now: clockNow } = useClock(60_000);
  const minute = clockNow ? Math.floor(clockNow.getTime() / 60_000) : 0;
  const due = useMemo(() => (minute ? { now: new Date(minute * 60_000), location } : undefined), [minute, location]);
  const [offset, setOffset] = useState(0); // periods back from now

  const t0 = parseKey(today);
  const period = useMemo(() => {
    if (range === "week") {
      const to = shiftKey(today, -7 * offset);
      return { from: shiftKey(to, -6), to };
    }
    if (range === "month") {
      const d = new Date(Date.UTC(t0.getUTCFullYear(), t0.getUTCMonth() - offset, 1, 12));
      const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 12));
      return { from: d.toISOString().slice(0, 10), to: last.toISOString().slice(0, 10), y: d.getUTCFullYear(), m: d.getUTCMonth() };
    }
    const y = t0.getUTCFullYear() - offset;
    return { from: `${y}-01-01`, to: `${y}-12-31`, y };
  }, [range, offset, today, t0]);

  const scores = useMemo(() => rangeScores(days, s, period.from, period.to, today, firstDay, due), [days, s, period, today, firstDay, due]);
  const sum = summarize(scores);
  // The same-length period just before, for the change arrow.
  const prev = useMemo(() => {
    if (range === "week") return { from: shiftKey(period.from, -7), to: shiftKey(period.to, -7) };
    if (range === "month") {
      const d = parseKey(period.from);
      const a = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, 1, 12));
      const b = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 0, 12));
      return { from: a.toISOString().slice(0, 10), to: b.toISOString().slice(0, 10) };
    }
    const y = +period.from.slice(0, 4) - 1;
    return { from: `${y}-01-01`, to: `${y}-12-31` };
  }, [range, period]);
  const prevSum = useMemo(() => summarize(rangeScores(days, s, prev.from, prev.to, today, firstDay, due)), [days, s, prev, today, firstDay, due]);
  const delta = prevSum.days > 0 && sum.days > 0 ? sum.avg - prevSum.avg : null;
  const streak = useMemo(() => fardStreak(days, s, today), [days, s, today]);
  const keys = trackedKeys(period.from, period.to, today, firstDay);
  const kinds = kindBreakdown(days, s, keys, due);
  const stats = itemStats(days, s, keys, due).filter((x) => x.total >= Math.min(3, keys.length) && x.item.grade !== "weak");
  const missed = [...stats].filter((x) => x.done < x.total).sort((a, b) => a.done / a.total - b.done / b.total || b.item.weight - a.item.weight).slice(0, 4);
  const kept = [...stats].filter((x) => x.done > 0).sort((a, b) => b.done / b.total - a.done / a.total || b.item.weight - a.item.weight).slice(0, 4);
  const recs = useMemo(() => recommend(days, s, today, firstDay, 3), [days, s, today, firstDay]);
  const canBack = firstDay ? period.from > firstDay : false;

  const periodLabel =
    range === "week"
      ? `${new Intl.DateTimeFormat(intlLocale, { day: "numeric", month: "short", timeZone: "UTC" }).format(parseKey(period.from))} – ${new Intl.DateTimeFormat(intlLocale, { day: "numeric", month: "short", timeZone: "UTC" }).format(parseKey(period.to))}`
      : range === "month"
        ? new Intl.DateTimeFormat(intlLocale, { month: "long", year: "numeric", timeZone: "UTC" }).format(parseKey(period.from))
        : new Intl.DateTimeFormat(intlLocale, { year: "numeric", timeZone: "UTC" }).format(parseKey(period.from));

  // The progress graph: one point per day (week, month) or per month (year).
  const trend: TrendPoint[] = useMemo(() => {
    const raw = trendPoints(days, s, period.from, period.to, today, firstDay, range === "year" ? "month" : "day", due);
    const wd = new Intl.DateTimeFormat(intlLocale, { weekday: "short", timeZone: "UTC" });
    const dm = new Intl.DateTimeFormat(intlLocale, { day: "numeric", month: "short", timeZone: "UTC" });
    const mf = new Intl.DateTimeFormat(intlLocale, { month: range === "year" ? "short" : "long", timeZone: "UTC" });
    return raw.map((p) => {
      if (range === "year") return { ...p, label: mf.format(parseKey(`${p.key}-15`)), tip: new Intl.DateTimeFormat(intlLocale, { month: "long", year: "numeric", timeZone: "UTC" }).format(parseKey(`${p.key}-15`)), highlight: today.startsWith(p.key) };
      const d = parseKey(p.key);
      return { ...p, label: range === "week" ? wd.format(d) : formatNumber(d.getUTCDate()), tip: dm.format(d), highlight: p.key === today };
    });
  }, [days, s, period, today, firstDay, range, intlLocale, formatNumber, due]);
  const [table, setTable] = useState(false);
  const monthValues = useMemo(() => {
    const map = new Map<string, number | null>();
    scores.forEach((sc, i) => map.set(shiftKey(period.from, i), sc ? sc.pct : null));
    return map;
  }, [scores, period.from]);

  const tiles = [
    { label: t("amal.avg"), value: pct(sum.avg), icon: "📈" },
    { label: t("amal.fardRate"), value: pct(sum.fardRate), icon: "🕌" },
    { label: t("amal.perfectDays"), value: formatNumber(sum.perfect), icon: "🌟" },
    { label: t("amal.streak"), value: t("amal.streakDays", { n: formatNumber(streak.current) }), sub: t("amal.best", { n: formatNumber(streak.best) }), icon: "🔥" },
  ];

  return (
    <div className="space-y-5">
      <SegmentedControl<Range>
        label={t("amal.tabProgress")}
        value={range}
        onChange={(r) => {
          setRange(r);
          setOffset(0);
        }}
        options={[
          { value: "week", label: t("amal.week") },
          { value: "month", label: t("amal.month") },
          { value: "year", label: t("amal.year") },
        ]}
        className="max-w-sm"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((x, i) => (
          <motion.div key={x.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="h-full space-y-1 p-3.5">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span aria-hidden>{x.icon}</span>
                {x.label}
              </p>
              <p className="text-xl font-bold tabular-nums">{x.value}</p>
              {x.sub ? <p className="text-[11px] text-muted-foreground">{x.sub}</p> : null}
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="space-y-4 p-4">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setOffset((o) => o + 1)}
            disabled={!canBack}
            className="grid size-9 place-items-center rounded-full border border-border disabled:opacity-40"
            aria-label={t("amal.prevDay")}
          >
            <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden />
          </button>
          <p className="text-sm font-semibold">{periodLabel}</p>
          <button
            type="button"
            onClick={() => setOffset((o) => Math.max(0, o - 1))}
            disabled={offset === 0}
            className="grid size-9 place-items-center rounded-full border border-border disabled:opacity-40"
            aria-label={t("amal.nextDay")}
          >
            <ChevronRight className="size-4 rtl:rotate-180" aria-hidden />
          </button>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={`${range}-${offset}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            {sum.days === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">{t("amal.noData")}</p>
            ) : (
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <h2 className="text-sm font-semibold">{t("amal.trendTitle")}</h2>
                      <p className="text-xs text-muted-foreground">{t("amal.avg")}</p>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold tracking-tight tabular-nums" style={{ color: "var(--amal-s1)" }}>
                        <AnimatedNumber value={Math.round(sum.avg * 100)} />%
                      </span>
                      {delta !== null && Math.round(delta * 100) !== 0 ? (
                        <motion.span
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className={cn(
                            "mb-1 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                            delta > 0 ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-rose-500/15 text-rose-700 dark:text-rose-300",
                          )}
                          title={t("amal.vsPrev")}
                        >
                          {delta > 0 ? "▲" : "▼"} {pct(Math.abs(delta))}
                          <span className="sr-only"> {t("amal.vsPrev")}</span>
                        </motion.span>
                      ) : null}
                    </div>
                  </div>
                  <TrendChart
                    points={trend}
                    label={t("amal.trendTitle")}
                    labelEvery={range === "month" ? 5 : range === "year" ? 2 : 1}
                    onPick={range === "year" ? undefined : onOpenDay}
                  />
                </div>
                {range === "month" ? <MonthHeatmap year={period.y!} month={(period as { m: number }).m} values={monthValues} today={today} onPick={onOpenDay} /> : null}
                {table ? <TrendTable points={trend} /> : null}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        {sum.days > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <span>{range !== "year" ? t("amal.tapToOpen") : ""}</span>
            <button type="button" onClick={() => setTable((x) => !x)} className="font-semibold text-primary">
              {table ? t("amal.hideTable") : t("amal.showTable")}
            </button>
          </div>
        ) : null}
      </Card>

      <Recommendations recs={recs} />

      {kinds.length ? (
        <Card className="space-y-3 p-4">
          <h2 className="font-semibold">{t("amal.byKind")}</h2>
          <HBars rows={kinds.map((k) => ({ key: k.kind, label: t(`amal.kind_${k.kind}`), value: k.total ? k.done / k.total : 0, barClass: KIND_STYLE[k.kind].bar, chip: KIND_STYLE[k.kind].bar }))} />
        </Card>
      ) : null}

      {kept.length || missed.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {kept.length ? (
            <Card className="space-y-3 p-4">
              <h2 className="flex items-center gap-2 font-semibold">
                <Sparkles className="size-4 text-gold" aria-hidden />
                {t("amal.mostKept")}
              </h2>
              <HBars rows={kept.map((x) => ({ key: x.item.id, label: gt(x.item.title, locale), value: x.done / x.total, note: t("amal.daysOf", { done: formatNumber(x.done), total: formatNumber(x.total) }), barClass: "bg-gold" }))} />
            </Card>
          ) : null}
          {missed.length ? (
            <Card className="space-y-3 p-4">
              <h2 className="flex items-center gap-2 font-semibold">
                <Lightbulb className="size-4 text-primary" aria-hidden />
                {t("amal.mostMissed")}
              </h2>
              <HBars rows={missed.map((x) => ({ key: x.item.id, label: gt(x.item.title, locale), value: x.done / x.total, note: t("amal.daysOf", { done: formatNumber(x.done), total: formatNumber(x.total) }), barClass: "bg-primary/70" }))} />
            </Card>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

// ───────────────────────────── Settings ─────────────────────────────

function SettingsView() {
  const { t, locale, formatNumber } = useI18n();
  const toast = useToast();
  const confirm = useConfirm();
  const s = useAmalSettings();
  const setEnabled = useAmalStore((st) => st.setEnabled);
  const setGoal = useAmalStore((st) => st.setGoal);
  const clearAll = useAmalStore((st) => st.clearAll);

  return (
    <div className="space-y-5">
      <p className="rounded-2xl border border-border bg-card/70 p-3 text-sm text-muted-foreground">{t("amal.settingsNote")}</p>
      {SLOTS.map((sl) => {
        const list = AMAL_ITEMS.filter((i) => i.slot === sl);
        return (
          <Card key={sl} className="p-4">
            <h2 className="mb-1 flex items-center gap-2 font-semibold">
              <span aria-hidden>{SLOT_EMOJI[sl]}</span>
              {t(`amal.slot_${sl}`)}
            </h2>
            <ul className="divide-y divide-border">
              {list.map((i) => {
                const on = isEnabled(i, s);
                const note = [i.friday ? t("amal.slot_jumuah") : "", i.grade === "weak" ? t("amal.weak") : "", i.optional ? t("amal.optionalNote") : ""].filter(Boolean).join(" · ");
                return (
                  <li key={i.id} className="py-1">
                    {i.kind === "fard" ? (
                      <div className="flex items-center justify-between gap-4 py-2.5">
                        <span className="text-sm font-medium">{gt(i.title, locale)}</span>
                        <Lock className="size-4 text-muted-foreground" aria-label={t("amal.kind_fard")} />
                      </div>
                    ) : (
                      <Toggle checked={on} onChange={(v) => setEnabled(i.id, v)} label={gt(i.title, locale)} description={note || undefined} compact />
                    )}
                    {i.goal && on ? (
                      <label className="mb-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                        {t("amal.goal")}
                        <input
                          type="number"
                          inputMode="numeric"
                          min={1}
                          max={10000}
                          defaultValue={goalOf(i, s)}
                          onBlur={(e) => {
                            const n = Number(e.target.value);
                            if (Number.isFinite(n) && n >= 1) setGoal(i.id, n);
                            else e.target.value = String(goalOf(i, s));
                          }}
                          className="h-9 w-24 rounded-lg border border-border bg-card px-2 text-end text-sm tabular-nums text-foreground"
                          aria-label={`${gt(i.title, locale)} — ${t("amal.goal")} (${formatNumber(goalOf(i, s))})`}
                        />
                      </label>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </Card>
        );
      })}
      <button
        type="button"
        onClick={async () => {
          if (await confirm({ title: t("amal.resetConfirm"), message: t("amal.resetMessage"), emoji: "🗑️", tone: "danger", confirmLabel: t("amal.resetAll") })) {
            clearAll();
            toast(t("amal.resetDone"));
          }
        }}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-danger/40 px-4 text-sm font-semibold text-danger"
      >
        <Trash2 className="size-4" aria-hidden />
        {t("amal.resetAll")}
      </button>
      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-gold" aria-hidden />
        {t("amal.privacy")}
      </p>
    </div>
  );
}
