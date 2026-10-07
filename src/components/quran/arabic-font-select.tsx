"use client";

import { useMemo } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { usePrefs } from "@/components/providers/preferences-provider";
import { Select } from "@/components/ui/select";
import { useIsDark } from "@/hooks/use-is-dark";
import { qcfFamily, qcfPalette, useQcfFonts, type QcfVariant } from "@/hooks/use-qcf-fonts";
import { ARABIC_FONTS, ARABIC_FONT_GROUPS, type ArabicFont, type QcfVersion, type QuranTextSource } from "@/lib/preferences";

/**
 * Al-Fatihah 1:1 in each encoding, exactly as published:
 * KFGQPC Hafs and Uthmani/IndoPak from the Quran.com API; QCF glyph codes of Mushaf page 1.
 */
const SAMPLE: Record<QuranTextSource, string> = {
  text_qpc_hafs: "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ ١",
  text_uthmani: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
  text_indopak: "بِسۡمِ اللهِ الرَّحۡمٰنِ الرَّحِيۡمِ",
  code_v1: "ﭑ ﭒ ﭓ ﭔ ﭕ",
  code_v2: "ﱁ ﱂ ﱃ ﱄ ﱅ",
};

function Preview({ font, dark }: { font: ArabicFont; dark: boolean }) {
  const def = ARABIC_FONTS[font] as (typeof ARABIC_FONTS)[ArabicFont] & { qcf?: QcfVersion };
  const variant: QcfVariant | null = def.qcf ?? null;
  const ready = useQcfFonts(variant, variant ? [1] : []);
  const family = variant ? (ready(1) ? qcfFamily(variant, 1) : null) : def.family.replace(/'/g, "");
  return (
    <span
      lang="ar"
      dir="rtl"
      aria-hidden
      className="block min-h-[2.4rem] truncate text-right text-[1.45rem] leading-[2.4rem] text-foreground transition-opacity"
      style={{ fontFamily: family ? `"${family}"` : undefined, opacity: family ? 1 : 0.25, fontPalette: variant ? qcfPalette(variant, 1, dark) : undefined }}
    >
      {family ? SAMPLE[def.script] : SAMPLE.text_qpc_hafs}
    </span>
  );
}

/** The Quran script picker, grouped by Mushaf tradition, with a live sample of each. */
export function ArabicFontSelect({ className }: { className?: string }) {
  const { t } = useI18n();
  const value = usePrefs((s) => s.arabicFont);
  const set = usePrefs((s) => s.set);
  const dark = useIsDark();
  const options = useMemo(
    () =>
      ARABIC_FONT_GROUPS.flatMap((g) =>
        (Object.keys(ARABIC_FONTS) as ArabicFont[])
          .filter((k) => ARABIC_FONTS[k].group === g)
          .map((k) => ({
            value: k,
            label: ARABIC_FONTS[k].label,
            description: t(`quranFonts.desc.${k}`),
            group: t(`quranFonts.group.${g}`),
            preview: <Preview font={k} dark={dark} />,
          })),
      ),
    [t, dark],
  );
  return (
    <Select<ArabicFont>
      className={className}
      label={t("settings.arabicFont")}
      value={value}
      onChange={(v) => set({ arabicFont: v })}
      options={options}
      searchable
      searchPlaceholder={t("quranFonts.search")}
      minListWidthRem={22}
    />
  );
}
