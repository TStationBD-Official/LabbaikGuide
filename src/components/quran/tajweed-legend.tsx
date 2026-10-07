"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Palette } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { useTone } from "@/hooks/use-is-dark";
import { cn } from "@/lib/utils";
import { useQuranStore } from "@/stores/quran-store";

/**
 * Rule colours exactly as drawn by the KFGQPC Tajweed V4 fonts in each palette
 * (light / dark / sepia), in the order used by Quran.com's Tajweed bar.
 */
const RULES = [
  { key: "edgham", light: "#a5a5a5", dark: "#999999", sepia: "#ababab" },
  { key: "mad2", light: "#ce9e00", dark: "#ffc1e0", sepia: "#c09725" },
  { key: "mad246", light: "#ff7b00", dark: "#ff8e3b", sepia: "#e67b00" },
  { key: "mad45", light: "#f40000", dark: "#ff5e8e", sepia: "#ff0000" },
  { key: "mad6", light: "#b50000", dark: "#e30000", sepia: "#b7001c" },
  { key: "ekhfa", light: "#09b000", dark: "#26b55d", sepia: "#09b000" },
  { key: "qalqala", light: "#2fadff", dark: "#00deff", sepia: "#00b4e0" },
  { key: "tafkhim", light: "#3f48e6", dark: "#3c84d5", sepia: "#134fe1" },
] as const;

export function TajweedLegend({ mode, indopak }: { mode: "off" | "glyph" | "text" | "unavailable"; indopak: boolean }) {
  const { t } = useI18n();
  const tone = useTone();
  const [open, setOpen] = useState(true);
  const setMadinah = useQuranStore((s) => s.setTajweedMadinah);
  // The tajweed-marked Unicode text marks no tafkhim; only list what is coloured.
  const rules = mode === "text" ? RULES.filter((r) => r.key !== "tafkhim") : RULES;
  return (
    <section className="mb-4 overflow-hidden rounded-2xl border border-border bg-card/80">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-4 py-3 text-start text-sm font-semibold"
      >
        <Palette className="size-4 text-gold" aria-hidden />
        <span className="flex-1">{t("tajweed.title")}</span>
        <span className="sr-only">{open ? t("tajweed.hide") : t("tajweed.show")}</span>
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {mode === "unavailable" ? (
              <div className="space-y-3 border-t border-border/70 px-4 py-3 text-sm">
                <p>{t("tajweed.indopakNone")}</p>
                <button
                  type="button"
                  onClick={() => setMadinah(true)}
                  className="inline-flex min-h-10 items-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground"
                >
                  {t("tajweed.useMadinah")}
                </button>
              </div>
            ) : (
            <ul className="grid grid-cols-1 gap-x-4 gap-y-2 border-t border-border/70 px-4 py-3 sm:grid-cols-2">
              {rules.map((r) => (
                <li key={r.key} className="flex items-center gap-2.5 text-sm">
                  <span aria-hidden className="size-3.5 shrink-0 rounded-full ring-2 ring-black/5" style={{ background: r[tone] }} />
                  {t(`tajweed.rule.${r.key}`)}
                </li>
              ))}
            </ul>
            )}
            <div className="space-y-1.5 border-t border-border/70 px-4 py-2.5 text-xs text-muted-foreground">
              {mode === "glyph" && indopak ? (
                <p>
                  {t("tajweed.madinahNote")}{" "}
                  <button type="button" onClick={() => setMadinah(false)} className="font-medium text-primary underline-offset-2 hover:underline">
                    {t("tajweed.backToMine")}
                  </button>
                </p>
              ) : null}
              <p>{mode === "text" ? t("tajweed.sourceText") : t("tajweed.source")}</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
