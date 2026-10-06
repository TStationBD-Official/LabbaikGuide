"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowDown,
  ArrowUp,
  Bell,
  BellOff,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Moon,
  Pencil,
  Plus,
  RotateCcw,
  SkipBack,
  SkipForward,
  Sun,
  Sunrise,
  Sunset,
  Trash2,
  Undo2,
} from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { usePrefs } from "@/components/providers/preferences-provider";
import { usePlanText } from "@/components/layout/notifier";
import { Button, IconButton } from "@/components/ui/button";
import { Badge, Card, SectionHeader } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/progress";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { SegmentedControl } from "@/components/ui/segmented";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { Toggle } from "@/components/ui/toggle";
import { useToast } from "@/components/ui/toast";
import { SkeletonList, UnavailableNotice } from "@/components/ui/states";
import { SALAH_FOR_PLANS, ZIKR_CATALOG, type PlanItem } from "@/data/zikr/after-salah";
import { formatTime, ymdInZone, ymdKey } from "@/features/prayer/calendar";
import { calculatePrayerDay } from "@/features/prayer/times";
import { makkahTime } from "@/features/zikr/reminders";
import { useStoreHydrated } from "@/hooks/use-hydrated";
import { cn, vibrate } from "@/lib/utils";
import { pushSupported } from "@/services/push-client";
import { useNotificationStore } from "@/stores/notification-store";
import { progressKey, usePlanStore, type PlanTrigger, type SalahName, type ZikrPlan } from "@/stores/zikr-plan-store";
import { useZikrStore } from "@/stores/zikr-store";
import { lt, type Zikr } from "@/types/content";
import { TapCircle } from "./tap-circle";

const SALAH_ICON: Record<SalahName, typeof Sun> = { fajr: Sunrise, dhuhr: Sun, asr: Sun, maghrib: Sunset, isha: Moon };
const TAP_GUARD_MS = 90;
const STEP_PAUSE_MS = 900;
const TAP_PULSE = 25;
const STEP_DONE = [300, 120, 300];
const PLAN_DONE = [400, 150, 400, 150, 700];

function useToday() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  const ymd = ymdInZone(now);
  return { now, ymd, day: ymdKey(ymd) };
}

function useCatalog() {
  const custom = useZikrStore((s) => s.custom);
  return useMemo(() => new Map<string, Zikr>([...ZIKR_CATALOG, ...custom].map((z) => [z.id, z])), [custom]);
}

// ───────────────────────────────────────────────────────────────────────────
// Entry: list of plans, or the runner when a plan is open (?plan=…).
// ───────────────────────────────────────────────────────────────────────────
export function ZikrPlans({ initialPlan }: { initialPlan: string | null }) {
  const hydrated = useStoreHydrated(usePlanStore);
  const plans = usePlanStore((s) => s.plans);
  const [open, setOpen] = useState<string | null>(initialPlan);
  const [editing, setEditing] = useState<ZikrPlan | "new" | null>(null);

  const openPlan = useCallback((id: string | null) => {
    setOpen(id);
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("plan", id);
    else url.searchParams.delete("plan");
    window.history.replaceState(window.history.state, "", url.pathname + url.search);
    // In the side-by-side layout the list stays put; elsewhere bring the runner into view.
    if (!window.matchMedia("(min-width: 80rem)").matches) window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (!hydrated) return <SkeletonList rows={5} />;
  const plan = open ? plans.find((p) => p.id === open) : null;

  return (
    <>
      {plan ? (
        // Wide screens: list–detail, like a tablet/desktop master–detail layout.
        <div className="xl:grid xl:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] xl:items-start xl:gap-6">
          <div className="hidden xl:block">
            <PlanList onOpen={openPlan} onEdit={setEditing} activeId={plan.id} narrow />
          </div>
          <div>
            <PlanRunner plan={plan} onClose={() => openPlan(null)} onEdit={() => setEditing(plan)} />
          </div>
        </div>
      ) : (
        <PlanList onOpen={openPlan} onEdit={setEditing} />
      )}
      {editing ? (
        <PlanEditor
          key={editing === "new" ? "new" : editing.id}
          plan={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onDeleted={() => {
            setEditing(null);
            openPlan(null);
          }}
        />
      ) : null}
    </>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// List
// ───────────────────────────────────────────────────────────────────────────
function PlanList({
  onOpen,
  onEdit,
  activeId,
  narrow,
}: {
  onOpen: (id: string) => void;
  onEdit: (p: ZikrPlan | "new") => void;
  /** Plan open beside the list (wide screens). */
  activeId?: string;
  /** Single column even on wide screens. */
  narrow?: boolean;
}) {
  const { t, intlLocale } = useI18n();
  const location = usePrefs((s) => s.location);
  const plans = usePlanStore((s) => s.plans);
  const progress = usePlanStore((s) => s.progress);
  const setRemind = usePlanStore((s) => s.setRemind);
  const text = usePlanText();
  const { now, ymd, day } = useToday();
  const prayerDay = useMemo(() => calculatePrayerDay(location, ymd), [location, ymd]);

  const builtIn = SALAH_FOR_PLANS.map((s) => plans.find((p) => p.id === `salah-${s}`)).filter((p): p is ZikrPlan => Boolean(p));
  const custom = plans.filter((p) => !p.builtIn);

  const adhanOf = (s: SalahName) => prayerDay.prayers.find((p) => p.name === s)!.adhan;
  // The most recent prayer whose adhkar are still pending → "Do now".
  const doNowId = [...builtIn]
    .reverse()
    .find((p) => {
      const s = (p.trigger as Extract<PlanTrigger, { type: "salah" }>).salah[0];
      return adhanOf(s).getTime() <= now.getTime() && !progress[progressKey(p.id, day)]?.done;
    })?.id;

  const row = (p: ZikrPlan, icon: React.ReactNode, sub: string) => {
    const pr = progress[progressKey(p.id, day)];
    const status = pr?.done ? "done" : pr && (pr.step > 0 || pr.count > 0) ? "progress" : null;
    const isNow = p.id === doNowId;
    const selected = p.id === activeId;
    return (
      <li key={p.id}>
        <div
          className={cn(
            "flex h-full items-center gap-3 rounded-2xl border bg-card p-3 transition-colors",
            selected ? "border-primary bg-primary-soft/60 ring-2 ring-primary/20" : isNow ? "border-gold ring-2 ring-gold/25" : "border-border",
            pr?.done && "opacity-80",
          )}
        >
          <button type="button" onClick={() => onOpen(p.id)} aria-current={selected ? "true" : undefined} className="flex min-w-0 flex-1 items-center gap-3 text-start">
            <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", pr?.done ? "bg-primary text-primary-foreground" : "bg-primary-soft text-primary")}>
              {pr?.done ? <Check className="size-5" aria-hidden /> : icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="truncate font-semibold">{text.planName(p)}</span>
                {status === "done" ? <Badge tone="primary">{t("zikrPlan.statusDone")}</Badge> : null}
                {status === "progress" ? (
                  <Badge tone="gold">{t("zikrPlan.statusInProgress", { step: pr!.step + 1, total: p.items.length })}</Badge>
                ) : null}
                {isNow && !status ? <Badge tone="gold">{t("zikrPlan.doNow")}</Badge> : null}
              </span>
              <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{sub}</span>
            </span>
            <ChevronRight className="size-5 shrink-0 text-muted-foreground rtl:rotate-180" aria-hidden />
          </button>
          <IconButton
            size="sm"
            label={`${t("zikrPlan.remind")}: ${text.planName(p)}`}
            aria-pressed={p.remind}
            onClick={() => setRemind(p.id, !p.remind)}
          >
            {p.remind ? <Bell className="size-4 text-gold" aria-hidden /> : <BellOff className="size-4 text-muted-foreground" aria-hidden />}
          </IconButton>
        </div>
      </li>
    );
  };

  const subFor = (p: ZikrPlan) => {
    const parts = [t("zikrPlan.items", { n: p.items.length })];
    if (p.trigger.type === "salah") {
      if (p.builtIn) {
        const a = adhanOf(p.trigger.salah[0]);
        parts.unshift(t("zikrPlan.adhanAt", { time: formatTime(a, intlLocale) }));
        if (p.remind) parts.push(t("zikrPlan.remindAt", { time: formatTime(new Date(a.getTime() + p.trigger.offsetMin * 60_000), intlLocale) }));
      } else parts.unshift(p.trigger.salah.map((s) => t(`prayer.${s}`)).join(", "));
    } else parts.unshift(t("zikrPlan.atTime", { time: formatTime(new Date(makkahTime(ymd, p.trigger.time)), intlLocale) }));
    return parts.join(" · ");
  };

  return (
    <div className="space-y-6">
      {narrow ? null : <ReminderStatus />}
      <section>
        <SectionHeader title={t("zikrPlan.todayTitle")} />
        <p className="-mt-1 mb-3 text-sm text-muted-foreground">{t("zikrPlan.todayHint")}</p>
        <ul className={cn("grid grid-cols-1 gap-2", !narrow && "lg:grid-cols-2")}>
          {builtIn.map((p) => {
            const s = (p.trigger as Extract<PlanTrigger, { type: "salah" }>).salah[0];
            const Icon = SALAH_ICON[s];
            return row(p, <Icon className="size-5" aria-hidden />, subFor(p));
          })}
        </ul>
        <p className="mt-2 text-[11px] text-muted-foreground">{t("zikrPlan.sunnahNote")}</p>
      </section>

      <section>
        <SectionHeader
          title={t("zikrPlan.customTitle")}
          action={
            <Button size="sm" onClick={() => onEdit("new")}>
              <Plus className="size-4" aria-hidden />
              {t("zikrPlan.newPlan")}
            </Button>
          }
        />
        {custom.length ? (
          <ul className={cn("grid grid-cols-1 gap-2", !narrow && "lg:grid-cols-2")}>{custom.map((p) => row(p, <Bell className="size-5" aria-hidden />, subFor(p)))}</ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">{t("zikrPlan.customEmpty")}</p>
        )}
      </section>
    </div>
  );
}

/** Explains whether reminders will arrive, and offers to turn them on. */
function ReminderStatus() {
  const { t } = useI18n();
  const mode = useNotificationStore((s) => s.mode);
  const setMode = useNotificationStore((s) => s.setMode);
  const pushState = useNotificationStore((s) => s.pushState);
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">("default");
  useEffect(() => {
    queueMicrotask(() => setPerm(typeof Notification === "undefined" ? "unsupported" : Notification.permission));
  }, [mode]);

  const on = (mode === "all" || mode === "zikr") && perm === "granted";
  if (perm === "unsupported") return <UnavailableNotice message={t("zikrPlan.pushUnsupported")} />;
  if (perm === "denied") return <UnavailableNotice message={t("zikrPlan.pushDenied")} />;
  if (!on) {
    return (
      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold-soft text-gold">
          <Bell className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{t("zikrPlan.enableTitle")}</p>
          <p className="text-sm text-muted-foreground">{t("zikrPlan.enableBody")}</p>
        </div>
        <Button
          onClick={async () => {
            const r = await Notification.requestPermission();
            setPerm(r);
            if (r === "granted") setMode(mode === "prayer" || mode === "all" ? "all" : "zikr");
          }}
        >
          {t("zikrPlan.enable")}
        </Button>
      </Card>
    );
  }
  const msg =
    pushState === "active"
      ? t("zikrPlan.pushActive")
      : !pushSupported()
        ? t("zikrPlan.pushUnsupported")
        : t("zikrPlan.pushInApp");
  return (
    <p className={cn("flex items-start gap-2 rounded-xl px-3 py-2 text-sm", pushState === "active" ? "bg-primary-soft text-primary" : "bg-gold-soft/60 text-foreground")}>
      <Bell className="mt-0.5 size-4 shrink-0" aria-hidden />
      {msg}
    </p>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Runner: step-by-step counting with vibration and auto-advance.
// ───────────────────────────────────────────────────────────────────────────
function PlanRunner({ plan, onClose, onEdit }: { plan: ZikrPlan; onClose: () => void; onEdit: () => void }) {
  const { t, contentLocale, formatNumber } = useI18n();
  const toast = useToast();
  const reduce = useReducedMotion();
  const catalog = useCatalog();
  const text = usePlanText();
  const { day } = useToday();
  const pr = usePlanStore((s) => s.progress[progressKey(plan.id, day)]) ?? { step: 0, count: 0, done: false, updated: 0 };
  const { tap, skip, back, restart, undoTap } = usePlanStore.getState();
  const haptics = useZikrStore((s) => s.haptics);
  const recordTap = useZikrStore((s) => s.recordTap);
  const [pausing, setPausing] = useState(false);
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTap = useRef(0);
  const [pulse, setPulse] = useState(0);
  const [burst, setBurst] = useState(0);

  const buzz = useCallback((p: number | number[]) => (haptics ? vibrate(p) : null), [haptics]);
  useEffect(() => () => {
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
  }, []);

  const item: PlanItem | undefined = plan.items[Math.min(pr.step, plan.items.length - 1)];
  const z = item ? catalog.get(item.zikrId) : undefined;
  const nextItem = plan.items[pr.step + 1];
  const nextZ = nextItem ? catalog.get(nextItem.zikrId) : undefined;
  const name = text.planName(plan);

  const onTap = () => {
    if (pauseTimer.current || pr.done) return;
    const nowT = performance.now();
    if (nowT - lastTap.current < TAP_GUARD_MS) return;
    lastTap.current = nowT;
    const r = tap(plan.id, day);
    if (r === "ignored") return;
    recordTap();
    setPulse((x) => x + 1);
    if (r === "counted") buzz(TAP_PULSE);
    else if (r === "step-done") {
      buzz(STEP_DONE);
      setBurst((b) => b + 1);
      setPausing(true);
      pauseTimer.current = setTimeout(() => {
        pauseTimer.current = null;
        setPausing(false);
        skip(plan.id, day);
      }, STEP_PAUSE_MS);
    } else if (r === "plan-done") {
      buzz(PLAN_DONE);
      setBurst((b) => b + 1);
      toast(t("zikrPlan.planDoneToast", { name }));
    }
  };
  const cancelPause = () => {
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    pauseTimer.current = null;
    setPausing(false);
  };

  // Keyboard: Space/Enter count, Backspace undo.
  const onTapRef = useRef(onTap);
  useEffect(() => {
    onTapRef.current = onTap;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el?.closest("input, textarea, select, button, a, [role='switch'], dialog[open]") || e.repeat) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        onTapRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Card className="glass px-4 py-5 sm:px-8">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden />
          {t("zikrPlan.backToList")}
        </Button>
        <IconButton size="sm" label={t("zikrPlan.editPlan")} onClick={onEdit}>
          <Pencil className="size-4" aria-hidden />
        </IconButton>
      </div>

      <h2 className="mt-2 text-center text-lg font-semibold">{name}</h2>
      {/* Step progress */}
      <ol className="mx-auto mt-3 flex max-w-md gap-1" aria-label={t("zikrPlan.step", { step: pr.step + 1, total: plan.items.length })}>
        {plan.items.map((_, i) => (
          <li
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              pr.done || i < pr.step ? "bg-primary" : i === pr.step ? "bg-gold" : "bg-muted",
            )}
          />
        ))}
      </ol>
      <p className="mt-1.5 text-center text-xs text-muted-foreground">
        {t("zikrPlan.step", { step: formatNumber(Math.min(pr.step + 1, plan.items.length)), total: formatNumber(plan.items.length) })}
      </p>

      {pr.done ? (
        <div className="flex flex-col items-center py-8 text-center" aria-live="polite">
          <span className="grid size-20 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft">
            <Check className="size-10" aria-hidden />
          </span>
          <p className="mt-4 text-2xl font-bold">{t("zikrPlan.completedTitle")}</p>
          <p className="mt-1 text-muted-foreground">{t("zikrPlan.completedBody", { name })}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button variant="outline" onClick={() => restart(plan.id, day)}>
              <RotateCcw className="size-4" aria-hidden />
              {t("zikrPlan.restart")}
            </Button>
            <Button onClick={onClose}>{t("zikrPlan.backToList")}</Button>
          </div>
        </div>
      ) : item && z ? (
        <section aria-live="polite" className="flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={pr.step}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="mt-4 flex w-full flex-col items-center text-center"
            >
              <p className="text-base font-semibold">{lt(z.name, contentLocale)}</p>
              {z.arabic ? (
                <p lang="ar" dir="rtl" className="font-dua mt-1 max-w-xl text-[clamp(1.5rem,6vw,2.25rem)] text-primary">
                  {z.arabic}
                </p>
              ) : null}
              {lt(z.pronunciation, contentLocale) ? <p className="mt-1 max-w-xl text-sm text-muted-foreground">{lt(z.pronunciation, contentLocale)}</p> : null}
              {lt(z.meaning, contentLocale) ? <p dir="auto" className="mt-0.5 max-w-xl text-sm text-foreground/80">“{lt(z.meaning, contentLocale)}”</p> : null}
              {z.link ? (
                <Link href={z.link} className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-primary hover:bg-muted">
                  <BookOpen className="size-4" aria-hidden />
                  {t("zikrPlan.readInQuran")}
                </Link>
              ) : null}
              {item.ref ?? z.references?.[0]?.label ? (
                <p className="mt-2 text-[11px] text-muted-foreground">{t("zikrPlan.source", { ref: item.ref ?? z.references![0].label })}</p>
              ) : null}
            </motion.div>
          </AnimatePresence>

          <TapCircle className="mt-5" label={`${lt(z.name, contentLocale)} — ${pr.count}/${item.count}`} onTap={onTap} pulse={pulse} burst={burst}>
            <CircularProgress value={Math.min(pr.count, item.count)} max={item.count} size={232} stroke={11} className="mx-auto">
              <AnimatedNumber value={pr.count} className="text-6xl font-bold text-foreground" />
              <span className="mt-1 text-base text-muted-foreground">/ {formatNumber(item.count)}</span>
              <AnimatePresence>
                {pausing && nextZ ? (
                  <motion.span
                    initial={{ opacity: 0, y: 6, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 max-w-[11rem] truncate rounded-full bg-gold-soft px-3 py-1 text-xs font-medium text-gold"
                  >
                    {t("zikrPlan.next", { name: lt(nextZ.name, contentLocale) })}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </CircularProgress>
          </TapCircle>
          <p className="mt-3 text-center text-xs text-muted-foreground">{t("zikrPlan.tapHint")}</p>

          <div className="mt-4 grid w-full max-w-sm grid-cols-3 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                cancelPause();
                back(plan.id, day);
              }}
              disabled={pr.step === 0 && pr.count === 0}
            >
              <SkipBack className="size-4 rtl:rotate-180" aria-hidden />
              <span className="max-xs:sr-only">{t("zikrPlan.back")}</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                cancelPause();
                if (pr.count > 0) {
                  undoTap(plan.id, day);
                  recordTap(-1);
                }
              }}
              disabled={pr.count === 0}
            >
              <Undo2 className="size-4" aria-hidden />
              <span className="max-xs:sr-only">{t("zikrPlan.undo")}</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                cancelPause();
                skip(plan.id, day);
              }}
            >
              <span className="max-xs:sr-only">{t("zikrPlan.skip")}</span>
              <SkipForward className="size-4 rtl:rotate-180" aria-hidden />
            </Button>
          </div>
        </section>
      ) : null}
    </Card>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Editor
// ───────────────────────────────────────────────────────────────────────────
function PlanEditor({ plan, onClose, onDeleted }: { plan: ZikrPlan | null; onClose: () => void; onDeleted: () => void }) {
  const { t, contentLocale } = useI18n();
  const catalog = useCatalog();
  const text = usePlanText();
  const { savePlan, deletePlan, resetBuiltIn } = usePlanStore.getState();
  const builtIn = Boolean(plan?.builtIn);
  const [name, setName] = useState(plan?.name ?? "");
  const [kind, setKind] = useState<PlanTrigger["type"]>(plan?.trigger.type ?? "salah");
  const [salah, setSalah] = useState<SalahName[]>(plan?.trigger.type === "salah" ? plan.trigger.salah : ["fajr"]);
  const [offset, setOffset] = useState(String(plan?.trigger.type === "salah" ? plan.trigger.offsetMin : 30));
  const [time, setTime] = useState(plan?.trigger.type === "time" ? plan.trigger.time : "21:00");
  const [items, setItems] = useState<PlanItem[]>(plan?.items.map((i) => ({ ...i })) ?? [{ zikrId: "astaghfirullah", count: 100 }]);
  const [remind, setRemind] = useState(plan?.remind ?? true);
  const [error, setError] = useState<string | null>(null);

  const options = [...catalog.values()].map((z) => ({ value: z.id, label: lt(z.name, contentLocale) }));
  const input = "h-11 w-full rounded-xl border border-border bg-card px-3 text-base";

  const save = () => {
    if (!items.length) return setError(t("zikrPlan.errEmpty"));
    if (kind === "salah" && !salah.length) return setError(t("zikrPlan.errSalah"));
    if (kind === "time" && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return setError(t("zikrPlan.errTime"));
    savePlan({
      id: plan?.id,
      name,
      trigger: kind === "salah" ? { type: "salah", salah, offsetMin: Number(offset) || 0 } : { type: "time", time },
      items,
      remind,
    });
    onClose();
  };

  const move = (i: number, d: -1 | 1) =>
    setItems((list) => {
      const j = i + d;
      if (j < 0 || j >= list.length) return list;
      const copy = [...list];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  return (
    <Sheet open onClose={onClose} title={plan ? `${t("zikrPlan.editPlan")}: ${text.planName(plan)}` : t("zikrPlan.newPlan")}>
      <div className="space-y-4">
        {!builtIn ? (
          <label className="block">
            <span className="mb-1 block text-sm font-medium">{t("zikrPlan.name")}</span>
            <input className={input} value={name} maxLength={60} placeholder={t("zikrPlan.untitled")} onChange={(e) => setName(e.target.value)} dir="auto" />
          </label>
        ) : null}

        {!builtIn ? (
          <SegmentedControl
            label={t("zikrPlan.trigger")}
            value={kind}
            onChange={setKind}
            options={[
              { value: "salah", label: t("zikrPlan.triggerSalah") },
              { value: "time", label: t("zikrPlan.triggerTime") },
            ]}
            size="sm"
          />
        ) : null}

        {kind === "salah" ? (
          <>
            {!builtIn ? (
              <fieldset>
                <legend className="mb-1.5 text-sm font-medium">{t("zikrPlan.salahPick")}</legend>
                <div className="flex flex-wrap gap-2">
                  {SALAH_FOR_PLANS.map((s) => {
                    const on = salah.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setSalah((x) => (on ? x.filter((y) => y !== s) : SALAH_FOR_PLANS.filter((y) => y === s || x.includes(y))))}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm font-medium",
                          on ? "border-primary bg-primary-soft text-primary" : "border-border bg-card hover:bg-muted",
                        )}
                      >
                        {t(`prayer.${s}`)}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ) : null}
            <label className="block">
              <span className="mb-1 block text-sm font-medium">{t("zikrPlan.offset")}</span>
              <span className="flex items-center gap-2">
                <input className={cn(input, "w-28")} type="number" inputMode="numeric" min={0} max={180} value={offset} onChange={(e) => setOffset(e.target.value)} />
                <span className="text-sm text-muted-foreground">{t("zikrPlan.minutes")}</span>
              </span>
            </label>
          </>
        ) : (
          <label className="block">
            <span className="mb-1 block text-sm font-medium">{t("zikrPlan.time")}</span>
            <input className={cn(input, "w-40")} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            <span className="mt-1 block text-xs text-muted-foreground">{t("zikrPlan.timeHint")}</span>
          </label>
        )}

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium">{t("zikrPlan.items", { n: items.length })}</legend>
          <ul className="space-y-2">
            {items.map((it, i) => (
              <li key={i} className="rounded-xl border border-border p-2">
                <div className="flex items-end gap-2">
                  <Select
                    className="min-w-0 flex-1"
                    hideLabel
                    label={t("zikrPlan.addItem")}
                    value={it.zikrId}
                    onChange={(v) => setItems((l) => l.map((x, k) => (k === i ? { zikrId: String(v), count: x.count } : x)))}
                    options={options}
                  />
                  <label className="w-20 shrink-0">
                    <span className="sr-only">{t("zikrPlan.count")}</span>
                    <input
                      className={cn(input, "px-2 text-center")}
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={10000}
                      value={it.count}
                      onChange={(e) => setItems((l) => l.map((x, k) => (k === i ? { ...x, count: Math.max(1, Number(e.target.value) || 1) } : x)))}
                    />
                  </label>
                </div>
                <div className="mt-1 flex justify-end gap-0.5">
                  <IconButton size="sm" label={t("zikrPlan.moveUp")} disabled={i === 0} onClick={() => move(i, -1)}>
                    <ArrowUp className="size-4" aria-hidden />
                  </IconButton>
                  <IconButton size="sm" label={t("zikrPlan.moveDown")} disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                    <ArrowDown className="size-4" aria-hidden />
                  </IconButton>
                  <IconButton size="sm" label={t("zikrPlan.remove")} onClick={() => setItems((l) => l.filter((_, k) => k !== i))}>
                    <Trash2 className="size-4 text-danger" aria-hidden />
                  </IconButton>
                </div>
              </li>
            ))}
          </ul>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => setItems((l) => [...l, { zikrId: "subhanallah", count: 33 }])}>
            <Plus className="size-4" aria-hidden />
            {t("zikrPlan.addItem")}
          </Button>
        </fieldset>

        <Toggle checked={remind} onChange={setRemind} label={t("zikrPlan.remind")} />
        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <div className="flex flex-wrap gap-2 pt-1">
          <Button onClick={save}>
            <Check className="size-4" aria-hidden />
            {t("zikrPlan.save")}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {t("zikrPlan.cancel")}
          </Button>
          {plan && builtIn ? (
            <Button
              variant="ghost"
              className="ms-auto"
              onClick={() => {
                resetBuiltIn(plan.id);
                onClose();
              }}
            >
              <RotateCcw className="size-4" aria-hidden />
              {t("zikrPlan.resetDefault")}
            </Button>
          ) : null}
          {plan && !builtIn ? (
            <Button
              variant="ghost"
              className="ms-auto text-danger"
              onClick={() => {
                if (confirm(t("zikrPlan.deleteConfirm"))) {
                  deletePlan(plan.id);
                  onDeleted();
                }
              }}
            >
              <Trash2 className="size-4" aria-hidden />
              {t("zikrPlan.delete")}
            </Button>
          ) : null}
        </div>
      </div>
    </Sheet>
  );
}
