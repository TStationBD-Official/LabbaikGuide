"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus, RotateCcw, Undo2 } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/ui/progress";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { useToast } from "@/components/ui/toast";
import { lt, type Zikr } from "@/types/content";
import { useZikrStore } from "@/stores/zikr-store";
import { vibrate } from "@/lib/utils";

/** Taps closer together than this are treated as one (prevents double counting). */
const TAP_GUARD_MS = 90;

type Ripple = { id: number; x: number; y: number };

export function ZikrCounter({ zikr }: { zikr: Zikr }) {
  const { t, contentLocale, formatNumber } = useI18n();
  const toast = useToast();
  const reduce = useReducedMotion();
  const count = useZikrStore((s) => s.counts[zikr.id] ?? 0);
  const target = useZikrStore((s) => s.targets[zikr.id] ?? zikr.target);
  const increment = useZikrStore((s) => s.increment);
  const reset = useZikrStore((s) => s.reset);
  const undoLast = useZikrStore((s) => s.undoLast);
  const lastTap = useRef(0);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [pulse, setPulse] = useState(0);
  const reached = count >= target;
  const reachedRef = useRef(reached);

  const tap = useCallback(
    (x?: number, y?: number) => {
      const now = performance.now();
      if (now - lastTap.current < TAP_GUARD_MS) return;
      lastTap.current = now;
      increment(zikr.id);
      setPulse((p) => p + 1);
      vibrate(8);
      if (!reduce && x !== undefined && y !== undefined) {
        const id = now;
        setRipples((r) => [...r.slice(-4), { id, x, y }]);
        setTimeout(() => setRipples((r) => r.filter((p) => p.id !== id)), 650);
      }
    },
    [increment, zikr.id, reduce],
  );

  // Celebrate exactly once when the target is first reached.
  useEffect(() => {
    if (reached && !reachedRef.current) {
      vibrate([20, 60, 20]);
      toast(t("zikr.completed"));
    }
    reachedRef.current = reached;
  }, [reached, toast, t]);

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
        undoLast(zikr.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tap, undoLast, zikr.id]);

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
                  ✦ {t("zikr.completed")}
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
      <p className="mt-3 text-center text-xs text-muted-foreground">{t("zikr.tapToCount")}</p>
      <p className="hidden text-center text-xs text-muted-foreground lg:block">{t("zikr.keyboardHint")}</p>

      <div className="mt-5 flex w-full max-w-sm items-center justify-center gap-3">
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={() => undoLast(zikr.id)}
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
            if (count > 0 && window.confirm(t("zikr.resetConfirm"))) reset(zikr.id);
          }}
          aria-label={t("common.reset")}
        >
          <RotateCcw className="size-5" aria-hidden />
          <span className="max-xs:sr-only">{t("common.reset")}</span>
        </Button>
      </div>
    </section>
  );
}
