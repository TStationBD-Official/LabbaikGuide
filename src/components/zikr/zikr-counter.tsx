"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronRight, Plus, RotateCcw, Undo2 } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/ui/progress";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Toggle } from "@/components/ui/toggle";
import { useToast } from "@/components/ui/toast";
import { lt, type Zikr } from "@/types/content";
import { useZikrStore } from "@/stores/zikr-store";
import { canVibrate, cn, vibrate, type VibrateResult } from "@/lib/utils";

/** Taps closer together than this are treated as one (prevents double counting). */
const TAP_GUARD_MS = 90;
/** Pause on a completed zikr before moving on (taps are ignored meanwhile, so none spill over). */
const ADVANCE_DELAY_MS = 1400;
/** Per-tap tick: long enough that budget phone motors actually move (very short pulses are often ignored). */
const TAP_PULSE = 25;
/** Distinct, strong "done" buzz: long–pause–long. */
const DONE_PATTERN = [300, 120, 300];
const ALL_DONE_PATTERN = [400, 150, 400, 150, 700];

type Ripple = { id: number; x: number; y: number };

export function ZikrCounter({ zikr, next }: { zikr: Zikr; next: Zikr | null }) {
  const { t, contentLocale, formatNumber } = useI18n();
  const toast = useToast();
  const reduce = useReducedMotion();
  const count = useZikrStore((s) => s.counts[zikr.id] ?? 0);
  const target = useZikrStore((s) => s.targets[zikr.id] ?? zikr.target);
  const increment = useZikrStore((s) => s.increment);
  const reset = useZikrStore((s) => s.reset);
  const undoLast = useZikrStore((s) => s.undoLast);
  const setActive = useZikrStore((s) => s.setActive);
  const autoAdvance = useZikrStore((s) => s.autoAdvance);
  const setAutoAdvance = useZikrStore((s) => s.setAutoAdvance);
  const haptics = useZikrStore((s) => s.haptics);
  const setHaptics = useZikrStore((s) => s.setHaptics);
  const [vibeTest, setVibeTest] = useState<VibrateResult | null>(null);
  const buzz = useCallback((p: number | number[]) => (haptics ? vibrate(p) : null), [haptics]);
  const [advancing, setAdvancing] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelAdvance = useCallback(() => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
    setAdvancing(false);
  }, []);
  const lastTap = useRef(0);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [pulse, setPulse] = useState(0);
  const reached = count >= target;
  const reachedRef = useRef(reached);

  const tap = useCallback(
    (x?: number, y?: number) => {
      const now = performance.now();
      if (advanceTimer.current) return; // moving on to the next zikr — don't count into a finished one
      if (now - lastTap.current < TAP_GUARD_MS) return;
      lastTap.current = now;
      increment(zikr.id);
      setPulse((p) => p + 1);
      buzz(TAP_PULSE);
      if (!reduce && x !== undefined && y !== undefined) {
        const id = now;
        setRipples((r) => [...r.slice(-4), { id, x, y }]);
        setTimeout(() => setRipples((r) => r.filter((p) => p.id !== id)), 650);
      }
    },
    [increment, zikr.id, reduce, buzz],
  );

  // Exactly once when the target is first reached: strong vibration, then move on to the next unfinished zikr.
  useEffect(() => {
    if (reached && !reachedRef.current) {
      const nx = next;
      if (autoAdvance && nx) {
        buzz(DONE_PATTERN);
        queueMicrotask(() => setAdvancing(true));
        advanceTimer.current = setTimeout(() => {
          advanceTimer.current = null;
          setActive(nx.id);
        }, ADVANCE_DELAY_MS);
      } else {
        buzz(nx ? DONE_PATTERN : ALL_DONE_PATTERN);
        toast(nx ? t("zikr.completed") : t("zikr.allDone"));
      }
    }
    reachedRef.current = reached;
  }, [reached, toast, t, autoAdvance, setActive, contentLocale, next, buzz]);

  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);

  // Keyboard: Space/Enter count, Backspace undo — only when not typing in a field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el?.closest("input, textarea, select, button, a, [role='switch'], dialog[open]")) return;
      if (e.repeat) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        tap();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        cancelAdvance();
        undoLast(zikr.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tap, undoLast, zikr.id, cancelAdvance]);

  return (
    <section aria-labelledby="zikr-active-name" className="flex flex-col items-center">
      <h2 id="zikr-active-name" className="text-center text-lg font-semibold">
        {lt(zikr.name, contentLocale)}
      </h2>
      {zikr.arabic ? (
        <p lang="ar" dir="rtl" className="font-arabic mt-1 text-center text-3xl leading-[1.9] text-primary sm:text-4xl">
          {zikr.arabic}
        </p>
      ) : null}
      {lt(zikr.pronunciation, contentLocale) ? (
        <p className="mt-1 text-center text-sm text-muted-foreground">{lt(zikr.pronunciation, contentLocale)}</p>
      ) : null}
      {lt(zikr.meaning, contentLocale) ? (
        <p dir="auto" className="mt-0.5 max-w-md text-center text-sm text-foreground/80">“{lt(zikr.meaning, contentLocale)}”</p>
      ) : null}

      <button
        type="button"
        aria-label={`${t("zikr.increment")} — ${t("zikr.progress", { count, target })}`}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          const rect = e.currentTarget.getBoundingClientRect();
          tap(e.clientX - rect.left, e.clientY - rect.top);
        }}
        onClick={(e) => {
          // Assistive tech activates with a synthetic click (detail === 0) and no pointer event.
          if (e.detail === 0) tap();
        }}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            if (!e.repeat) tap();
          }
        }}
        className="relative mt-6 touch-manipulation select-none overflow-hidden rounded-full outline-offset-4"
        style={{ WebkitTouchCallout: "none" }}
      >
        <motion.div
          key={pulse}
          initial={reduce || pulse === 0 ? false : { scale: 0.965 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 22 }}
        >
          <CircularProgress value={Math.min(count, target)} max={target} size={272} stroke={12} className="mx-auto">
            <AnimatedNumber value={count} className="text-6xl font-bold text-foreground sm:text-7xl" />
            <span className="mt-1 text-base text-muted-foreground">/ {formatNumber(target)}</span>
            <AnimatePresence>
              {reached ? (
                <motion.span
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-2 rounded-full bg-gold-soft px-3 py-1 text-xs font-medium text-gold"
                >
                  ✦ {advancing && next ? t("zikr.nextUp", { name: lt(next.name, contentLocale) }) : t("zikr.completed")}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </CircularProgress>
        </motion.div>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            aria-hidden
            className="pointer-events-none absolute size-24 rounded-full border-2 border-gold/60"
            style={{ left: r.x - 48, top: r.y - 48 }}
            initial={{ scale: 0.2, opacity: 0.8 }}
            animate={{ scale: 2.4, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </button>
      {advancing ? (
        <div className="mt-3 w-full max-w-sm" aria-live="polite">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-gold"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: ADVANCE_DELAY_MS / 1000, ease: "linear" }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 text-sm">
            <span className="min-w-0 truncate text-muted-foreground">{next ? t("zikr.movingTo", { name: lt(next.name, contentLocale) }) : null}</span>
            <Button variant="ghost" size="sm" className="shrink-0 whitespace-nowrap" onClick={cancelAdvance}>
              {t("zikr.stayHere")}
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-center text-xs text-muted-foreground">{t("zikr.tapToCount")}</p>
      )}
      <p className="hidden text-center text-xs text-muted-foreground lg:block">{t("zikr.keyboardHint")}</p>

      <div className="mt-5 flex w-full max-w-sm items-center justify-center gap-3">
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={() => {
            cancelAdvance();
            undoLast(zikr.id);
          }}
          aria-label={t("common.undo")}
        >
          <Undo2 className="size-5" aria-hidden />
          <span className="max-xs:sr-only">{t("common.undo")}</span>
        </Button>
        <Button size="lg" className="flex-[1.4]" onClick={() => tap()} aria-label={t("zikr.increment")}>
          <Plus className="size-6" aria-hidden />
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={() => {
            if (count > 0 && window.confirm(t("zikr.resetConfirm"))) {
              cancelAdvance();
              reset(zikr.id);
            }
          }}
          aria-label={t("common.reset")}
        >
          <RotateCcw className="size-5" aria-hidden />
          <span className="max-xs:sr-only">{t("common.reset")}</span>
        </Button>
      </div>

      <div className="mt-5 w-full max-w-sm border-t border-border/70 pt-3">
        <Toggle compact checked={autoAdvance} onChange={setAutoAdvance} label={t("zikr.autoAdvance")} description={t("zikr.autoAdvanceHint")} />
        <Toggle compact checked={haptics} onChange={setHaptics} label={t("zikr.haptics")} />
        <div className="flex flex-wrap items-center gap-2 py-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Called directly from the tap, so the browser treats it as user-initiated.
              setVibeTest(vibrate([300, 120, 300]));
            }}
          >
            {t("zikr.testVibration")}
          </Button>
        </div>
        {vibeTest || !canVibrate() ? (
          <p className={cn("text-xs", vibeTest === "ok" ? "text-muted-foreground" : "text-warning")} aria-live="polite">
            {vibeTest === "ok" ? t("zikr.vibeOk") : vibeTest === "blocked" ? t("zikr.vibeBlocked") : t("zikr.vibeUnsupported")}
          </p>
        ) : null}
        {autoAdvance && next ? (
          <button
            type="button"
            onClick={() => setActive(next.id)}
            className="mt-1 flex w-full items-center justify-between gap-2 rounded-xl px-1 py-1.5 text-start text-xs text-muted-foreground hover:text-foreground"
          >
            <span className="min-w-0 truncate">{t("zikr.nextUp", { name: lt(next.name, contentLocale) })}</span>
            <ChevronRight className="size-4 shrink-0 rtl:rotate-180" aria-hidden />
          </button>
        ) : null}
      </div>
    </section>
  );
}
