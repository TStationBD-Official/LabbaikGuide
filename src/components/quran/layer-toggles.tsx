"use client";

import { Check } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { useQuranStore } from "@/stores/quran-store";
import { APP_CONFIG } from "@/config/app";
import { cn } from "@/lib/utils";
import type { TKey } from "@/i18n";

type LayerKey = "showArabic" | "bnUccharon" | "showTranslation" | "showTafsir" | "wordByWord" | "audio";

const LAYERS: { key: LayerKey; label: TKey; feature?: keyof typeof APP_CONFIG.features }[] = [
  { key: "showArabic", label: "quran.arabic" },
  { key: "bnUccharon", label: "quran.bnUccharon" },
  { key: "showTranslation", label: "quran.translation" },
  { key: "showTafsir", label: "quran.tafsir" },
  { key: "wordByWord", label: "quran.wordByWord", feature: "wordByWord" },
  { key: "audio", label: "quran.audio", feature: "audio" },
];

/** Independent ON/OFF chips for each reading layer: [✓ Arabic] [✓ বাংলা অনুবাদ] [তাফসির] … */
export function LayerToggles() {
  const { t } = useI18n();
  const state = useQuranStore();
  return (
    <div role="group" aria-label={t("quran.display")} className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
      {LAYERS.filter((l) => !l.feature || APP_CONFIG.features[l.feature]).map((l) => {
        const on = state[l.key];
        return (
          <button
            key={l.key}
            type="button"
            role="switch"
            aria-checked={on}
            onClick={() => state.setLayer(l.key, !on)}
            className={cn(
              "flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors",
              on ? "border-primary bg-primary-soft text-primary" : "border-border bg-card text-muted-foreground",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "grid size-4 place-items-center rounded-full border",
                on ? "border-primary bg-primary text-primary-foreground" : "border-border",
              )}
            >
              {on ? <Check className="size-3" strokeWidth={3} /> : null}
            </span>
            {t(l.label)}
          </button>
        );
      })}
    </div>
  );
}
