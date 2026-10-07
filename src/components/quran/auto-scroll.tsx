"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Pause, Play, Plus, X } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { AUTO_SCROLL_SPEEDS, useQuranStore } from "@/stores/quran-store";
import { cn } from "@/lib/utils";

export type AutoScrollMode = "off" | "running" | "paused";

/**
 * Continuous reading scroll at the chosen speed. Scrolling or touching the page
 * yourself pauses it (the control bar stays, so you can resume); it also pauses
 * at the end of the loaded verses.
 */
export function useAutoScroll(mode: AutoScrollMode, onPause: () => void) {
  const speed = useQuranStore((s) => s.scrollSpeed);
  const pxPerSecond = AUTO_SCROLL_SPEEDS[speed - 1] ?? AUTO_SCROLL_SPEEDS[3];
  const speedRef = useRef(pxPerSecond);
  useEffect(() => {
    speedRef.current = pxPerSecond; // change speed without restarting the loop
  }, [pxPerSecond]);

  useEffect(() => {
    if (mode !== "running") return;
    let raf = 0;
    let last = performance.now();
    let carry = 0;
    const tick = (now: number) => {
      carry += (Math.min(100, now - last) / 1000) * speedRef.current;
      last = now;
      if (carry >= 1) {
        window.scrollBy(0, Math.floor(carry));
        carry -= Math.floor(carry);
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) return onPause();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const fromControl = (e: Event) => (e.target as Element | null)?.closest?.("[data-autoscroll-control]");
    const interrupt = (e: Event) => {
      if (!fromControl(e)) onPause();
    };
    const onKey = (e: KeyboardEvent) => {
      if (fromControl(e) || ["+", "=", "-", "_"].includes(e.key)) return;
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(e.key)) onPause();
    };
    window.addEventListener("wheel", interrupt, { passive: true });
    window.addEventListener("touchstart", interrupt, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", interrupt);
      window.removeEventListener("touchstart", interrupt);
      window.removeEventListener("keydown", onKey);
    };
  }, [mode, onPause]);
}

/** − speed + stepper, shared by the floating bar and reader settings. */
export function ScrollSpeedStepper({ compact }: { compact?: boolean }) {
  const { t, formatNumber } = useI18n();
  const speed = useQuranStore((s) => s.scrollSpeed);
  const setSpeed = useQuranStore((s) => s.setScrollSpeed);
  const max = AUTO_SCROLL_SPEEDS.length;
  const btn = cn(
    "grid shrink-0 place-items-center rounded-full border border-border bg-card transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-40 disabled:hover:border-border disabled:hover:text-current",
    compact ? "size-9" : "size-10",
  );
  return (
    <div className="flex items-center gap-2" role="group" aria-label={t("quran.scrollSpeed")}>
      <button type="button" className={btn} onClick={() => setSpeed(speed - 1)} disabled={speed <= 1} aria-label={t("quran.slower")} title={t("quran.slower")}>
        <Minus className="size-4" aria-hidden />
      </button>
      <div className={cn("flex flex-col items-center", compact ? "w-16" : "w-24")} aria-live="polite">
        <span className="text-xs font-semibold tabular-nums">{t("quran.speedN", { n: formatNumber(speed) })}</span>
        <span className="mt-1 flex gap-0.5" aria-hidden>
          {Array.from({ length: max }, (_, i) => (
            <span
              key={i}
              className={cn("w-1 rounded-full transition-all duration-200", i < speed ? "bg-primary" : "bg-border")}
              style={{ height: 4 + i * 0.9 }}
            />
          ))}
        </span>
      </div>
      <button type="button" className={btn} onClick={() => setSpeed(speed + 1)} disabled={speed >= max} aria-label={t("quran.faster")} title={t("quran.faster")}>
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}

/** Floating control while auto-scroll is on: pause/resume, speed, stop. */
export function AutoScrollBar({ mode, onToggle, onStop }: { mode: AutoScrollMode; onToggle: () => void; onStop: () => void }) {
  const { t } = useI18n();
  const setSpeed = useQuranStore((s) => s.setScrollSpeed);

  // Keyboard: + / − change speed while the bar is shown.
  useEffect(() => {
    if (mode === "off") return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      const s = useQuranStore.getState().scrollSpeed;
      if (e.key === "+" || e.key === "=") setSpeed(s + 1);
      else if (e.key === "-" || e.key === "_") setSpeed(s - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, setSpeed]);

  return (
    <AnimatePresence>
      {mode !== "off" ? (
        <motion.div
          data-autoscroll-control
          role="toolbar"
          aria-label={t("quran.autoScroll")}
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
          className="glass fixed inset-x-0 bottom-[calc(4.6rem+env(safe-area-inset-bottom))] z-40 mx-auto flex w-max max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-full border border-border/70 px-2 py-1.5 shadow-[0_12px_40px_-12px_rgb(0_0_0/0.35)] md:bottom-6"
        >
          <button
            type="button"
            onClick={onToggle}
            aria-label={mode === "running" ? t("quran.pause") : t("quran.autoScrollResume")}
            title={mode === "running" ? t("quran.pause") : t("quran.autoScrollResume")}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft transition-transform active:scale-95"
          >
            {mode === "running" ? <Pause className="size-4" aria-hidden /> : <Play className="size-4 translate-x-px rtl:-translate-x-px" aria-hidden />}
          </button>
          <ScrollSpeedStepper compact />
          <button
            type="button"
            onClick={onStop}
            aria-label={t("quran.autoScrollStop")}
            title={t("quran.autoScrollStop")}
            className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
