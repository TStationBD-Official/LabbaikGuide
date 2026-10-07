"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { SegmentedControl } from "@/components/ui/segmented";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { Toggle } from "@/components/ui/toggle";
import { UnavailableNotice } from "@/components/ui/states";
import { ArabicFontSelect } from "./arabic-font-select";
import { ScrollSpeedStepper } from "./auto-scroll";
import type { QuranResource } from "@/types/quran";
import { useQuranStore, type QuranSize, type QuranSpacing } from "@/stores/quran-store";

const label = (r: QuranResource) => (r.authorName && !r.name.includes(r.authorName) ? `${r.name} — ${r.authorName}` : r.name);

export function ReaderSettings({
  open,
  onClose,
  translations,
  tafsirs,
  tafsirLanguageMatched,
  translationId,
  tafsirId,
  autoScroll,
  onAutoScroll,
}: {
  open: boolean;
  onClose: () => void;
  translations: QuranResource[];
  tafsirs: QuranResource[];
  tafsirLanguageMatched: boolean;
  translationId: number | null;
  tafsirId: number | null;
  autoScroll: boolean;
  onAutoScroll: (v: boolean) => void;
}) {
  const { t, locale } = useI18n();
  const q = useQuranStore();

  return (
    <Sheet open={open} onClose={onClose} title={t("quran.readerSettings")}>
      <div className="space-y-5">
        <ArabicFontSelect />
        <div>
          <p className="mb-2 text-sm font-medium">{t("quran.fontSize")}</p>
          <SegmentedControl<QuranSize>
            label={t("quran.fontSize")}
            value={q.size}
            onChange={q.setSize}
            options={[
              { value: "sm", label: t("quran.sizeSm") },
              { value: "md", label: t("quran.sizeMd") },
              { value: "lg", label: t("quran.sizeLg") },
              { value: "xl", label: t("quran.sizeXl") },
            ]}
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">{t("quran.lineSpacing")}</p>
          <SegmentedControl<QuranSpacing>
            label={t("quran.lineSpacing")}
            value={q.spacing}
            onChange={q.setSpacing}
            options={[
              { value: "compact", label: t("quran.compact") },
              { value: "normal", label: t("quran.normal") },
              { value: "relaxed", label: t("quran.relaxed") },
            ]}
          />
        </div>
        {translations.length > 0 && translationId !== null ? (
          <Select<number>
            label={t("quran.selectTranslation")}
            value={translationId}
            onChange={(id) => q.setTranslation(locale, id)}
            options={translations.map((r) => ({ value: r.id, label: label(r) }))}
          />
        ) : null}
        {tafsirs.length > 0 && tafsirId !== null ? (
          <div className="space-y-2">
            <Select<number>
              label={t("quran.selectTafsir")}
              value={tafsirId}
              onChange={(id) => q.setTafsir(locale, id)}
              options={tafsirs.map((r) => ({ value: r.id, label: `${label(r)} (${r.languageName})` }))}
            />
            {!tafsirLanguageMatched ? <UnavailableNotice message={t("quran.noTafsirForLanguage")} /> : null}
          </div>
        ) : null}
        <div className="space-y-3">
          <Toggle label={t("quran.autoScroll")} checked={autoScroll} onChange={onAutoScroll} />
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">{t("quran.scrollSpeed")}</span>
            <ScrollSpeedStepper />
          </div>
        </div>
      </div>
    </Sheet>
  );
}
