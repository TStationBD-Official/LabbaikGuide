"use client";

import { Monitor, Moon, Sun, BookOpen, ScrollText, Contrast } from "lucide-react";
import { LOCATIONS, LOCATION_IDS } from "@/config/locations";
import { LOCALE_NAMES } from "@/i18n";
import {
  ARABIC_FONTS,
  BANGLA_FONTS,
  FONT_SCALES,
  LOCALES,
  THEMES,
  type ArabicFont,
  type BanglaFont,
  type Theme,
} from "@/lib/preferences";
import { useI18n } from "@/components/providers/i18n-provider";
import { usePrefs } from "@/components/providers/preferences-provider";
import { SegmentedControl } from "@/components/ui/segmented";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

/** Global Makkah / Madinah switch. */
export function LocationSwitcher({ className, size = "md" }: { className?: string; size?: "sm" | "md" }) {
  const { t } = useI18n();
  const location = usePrefs((s) => s.location);
  const set = usePrefs((s) => s.set);
  return (
    <SegmentedControl
      className={className}
      size={size}
      label={t("location.switch")}
      value={location}
      onChange={(v) => set({ location: v })}
      options={LOCATION_IDS.map((id) => ({
        value: id,
        label: `${LOCATIONS[id].icon} ${t(LOCATIONS[id].nameKey)}`,
      }))}
    />
  );
}

const THEME_ICONS: Record<Theme, React.ReactNode> = {
  system: <Monitor className="size-4" aria-hidden />,
  light: <Sun className="size-4" aria-hidden />,
  dark: <Moon className="size-4" aria-hidden />,
  sepia: <ScrollText className="size-4" aria-hidden />,
  mushaf: <BookOpen className="size-4" aria-hidden />,
  contrast: <Contrast className="size-4" aria-hidden />,
};

/** Theme picker as swatch buttons. */
export function ThemeSelector() {
  const { t } = useI18n();
  const theme = usePrefs((s) => s.theme);
  const set = usePrefs((s) => s.set);
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">{t("theme.label")}</legend>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {THEMES.map((th) => (
          <button
            key={th}
            type="button"
            aria-pressed={theme === th}
            onClick={() => set({ theme: th })}
            className={cn(
              "flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-xs font-medium transition-colors",
              theme === th ? "border-primary bg-primary-soft text-primary" : "border-border bg-card hover:bg-muted",
            )}
          >
            {THEME_ICONS[th]}
            {t(`theme.${th}`)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function LanguageSelector({ compact }: { compact?: boolean }) {
  const { t, locale, setLocale } = useI18n();
  return (
    <SegmentedControl
      size={compact ? "sm" : "md"}
      label={t("language.label")}
      value={locale}
      onChange={(v) => void setLocale(v)}
      options={LOCALES.map((l) => ({ value: l, label: LOCALE_NAMES[l] }))}
    />
  );
}

export function FontSelectors() {
  const { t, formatNumber } = useI18n();
  const banglaFont = usePrefs((s) => s.banglaFont);
  const arabicFont = usePrefs((s) => s.arabicFont);
  const fontScale = usePrefs((s) => s.fontScale);
  const set = usePrefs((s) => s.set);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Select<BanglaFont>
        label={t("settings.banglaFont")}
        value={banglaFont}
        onChange={(v) => set({ banglaFont: v })}
        options={(Object.keys(BANGLA_FONTS) as BanglaFont[]).map((k) => ({
          value: k,
          label: BANGLA_FONTS[k].replace(/'/g, ""),
        }))}
      />
      <Select<ArabicFont>
        label={t("settings.arabicFont")}
        value={arabicFont}
        onChange={(v) => set({ arabicFont: v })}
        options={(Object.keys(ARABIC_FONTS) as ArabicFont[]).map((k) => ({ value: k, label: ARABIC_FONTS[k].label }))}
      />
      <Select<number>
        className="sm:col-span-2"
        label={t("settings.fontSize")}
        value={fontScale}
        onChange={(v) => set({ fontScale: v })}
        options={FONT_SCALES.map((n) => ({ value: n, label: `${formatNumber(n)}%` }))}
      />
    </div>
  );
}
