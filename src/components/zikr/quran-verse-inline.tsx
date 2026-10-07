"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { usePrefs } from "@/components/providers/preferences-provider";
import { verseText } from "@/components/quran/ayah-card";
import { APP_CONFIG } from "@/config/app";
import { ARABIC_FONTS } from "@/lib/preferences";
import { useBnUccharon } from "@/services/quran/bn-uccharon";
import { useResources, useVerses } from "@/services/quran/queries";
import { useQuranStore } from "@/stores/quran-store";

/**
 * Official KFGQPC Uthmanic Hafs text of verses shown in adhkar, used whenever
 * the live Quran text is not available (e.g. offline). Copied verbatim from the
 * King Fahd Complex data (hafsData_v18) and drawn with its own font.
 */
const KFGQPC_HAFS: Record<string, string> = {
  "2:255":
    "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلۡحَيُّ ٱلۡقَيُّومُۚ لَا تَأۡخُذُهُۥ سِنَةٞ وَلَا نَوۡمٞۚ لَّهُۥ مَا فِي ٱلسَّمَٰوَٰتِ وَمَا فِي ٱلۡأَرۡضِۗ مَن ذَا ٱلَّذِي يَشۡفَعُ عِندَهُۥٓ إِلَّا بِإِذۡنِهِۦۚ يَعۡلَمُ مَا بَيۡنَ أَيۡدِيهِمۡ وَمَا خَلۡفَهُمۡۖ وَلَا يُحِيطُونَ بِشَيۡءٖ مِّنۡ عِلۡمِهِۦٓ إِلَّا بِمَا شَآءَۚ وَسِعَ كُرۡسِيُّهُ ٱلسَّمَٰوَٰتِ وَٱلۡأَرۡضَۖ وَلَا يَـُٔودُهُۥ حِفۡظُهُمَاۚ وَهُوَ ٱلۡعَلِيُّ ٱلۡعَظِيمُ ٢٥٥",
};

/** A Quran verse in full inside a zikr step: Arabic, Bangla pronunciation and translation. */
export function QuranVerseInline({ verseKey, link }: { verseKey: string; link?: string }) {
  const { t, locale } = useI18n();
  const [surah, ayah] = verseKey.split(":").map(Number);
  const arabicFont = usePrefs((s) => s.arabicFont);
  const translationByLang = useQuranStore((s) => s.translationByLang);
  const translations = useResources("translations", locale);
  const translationId = translationByLang[locale] ?? translations.data?.resources[0]?.id ?? null;

  const verses = useVerses({
    mode: "surah",
    id: surah,
    lang: locale,
    translationId,
    words: false,
    audio: false,
    startPage: Math.ceil(ayah / APP_CONFIG.quran.versesPerPage),
    enabled: translations.isFetched,
  });
  const verse = verses.data?.pages.flatMap((p) => p.verses).find((v) => v.key === verseKey) ?? null;
  const uccharon = useBnUccharon([surah], locale === "bn");
  const bn = uccharon?.get(verseKey) ?? null;

  const script = ARABIC_FONTS[arabicFont].script;
  const live = verse ? verseText(verse, script) : null;
  const translatorName = translations.data?.resources.find((r) => r.id === translationId)?.name;

  return (
    <div className="mt-2 w-full max-w-2xl space-y-3 rounded-2xl border border-border/70 bg-[var(--quran-bg)] p-4 text-center">
      {live ? (
        <p lang="ar" dir="rtl" className="font-quran text-center text-primary" style={{ fontSize: "clamp(1.35rem,5.2vw,1.9rem)" }}>
          {live}
        </p>
      ) : KFGQPC_HAFS[verseKey] ? (
        <p lang="ar" dir="rtl" className="text-center text-primary" style={{ fontFamily: '"Quran Hafs"', fontSize: "clamp(1.35rem,5.2vw,1.9rem)", lineHeight: 2.3 }}>
          {KFGQPC_HAFS[verseKey]}
        </p>
      ) : null}
      {bn ? <p lang="bn" className="text-[0.98rem] leading-7 text-foreground/85">{bn}</p> : null}
      {verse?.translationHtml ? (
        <div className="border-t border-border/70 pt-3">
          <p
            dir="auto"
            className="text-[0.95rem] leading-7 text-foreground/80"
            // Sanitized on the server (inline formatting + footnote <sup> only).
            dangerouslySetInnerHTML={{ __html: verse.translationHtml }}
          />
          {translatorName ? <p className="mt-1 text-[11px] text-muted-foreground">{t("quran.translationBy", { name: translatorName })}</p> : null}
        </div>
      ) : null}
      {link ? (
        <Link href={link} className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
          <BookOpen className="size-3.5" aria-hidden />
          {t("zikrPlan.readInQuran")}
        </Link>
      ) : null}
    </div>
  );
}
