import "server-only";
import { APP_CONFIG } from "@/config/app";
import type { Locale } from "@/lib/preferences";
import {
  MODE_UPSTREAM,
  type Chapter,
  type QuranResource,
  type QuranSearchResponse,
  type QuranTafsir,
  type QuranVerse,
  type ReadingMode,
  type VersesResponse,
} from "@/types/quran";
import { sanitizeInline, sanitizeRich, stripTags } from "../sanitize";
import { UpstreamError, quranFetch } from "./upstream";
import { UpChapters, UpSearch, UpTafsir, UpTafsirs, UpTranslations, UpVerses } from "./schemas";

const LANGUAGE_NAME: Record<Locale, string> = {
  bn: "bengali",
  en: "english",
  ar: "arabic",
  ur: "urdu",
};

function parse<T>(schema: { safeParse: (v: unknown) => { success: true; data: T } | { success: false } }, raw: unknown): T {
  const r = schema.safeParse(raw);
  if (!r.success) throw new UpstreamError(502, "Unexpected upstream response shape");
  return r.data;
}

export async function getChapters(lang: Locale): Promise<Chapter[]> {
  const data = parse(UpChapters, await quranFetch("chapters", { language: lang }));
  return data.chapters.map((c) => ({
    id: c.id,
    nameSimple: c.name_simple,
    nameArabic: c.name_arabic,
    translatedName: c.translated_name?.name ?? c.name_simple,
    versesCount: c.verses_count,
    revelationPlace: c.revelation_place === "madinah" ? "madinah" : "makkah",
    bismillahPre: c.bismillah_pre,
    pages: [c.pages[0], c.pages[1]] as [number, number],
  }));
}

export type VersesQuery = {
  mode: ReadingMode;
  id: number;
  page: number;
  lang: Locale;
  translationId?: number;
  words: boolean;
  audio: boolean;
};

export async function getVerses(q: VersesQuery): Promise<VersesResponse> {
  const raw = await quranFetch(`verses/${MODE_UPSTREAM[q.mode]}/${q.id}`, {
    language: q.lang,
    words: q.words,
    word_fields: q.words ? "text_uthmani,text_indopak" : undefined,
    translations: q.translationId,
    // Arabic text comes straight from the API — IndoPak is never converted from Uthmani.
    fields: "text_uthmani,text_indopak",
    audio: q.audio ? APP_CONFIG.quran.defaultRecitationId : undefined,
    per_page: APP_CONFIG.quran.versesPerPage,
    page: q.page,
  });
  const data = parse(UpVerses, raw);

  const verses: QuranVerse[] = data.verses.map((v) => {
    const translation = v.translations?.find((t) => !q.translationId || t.resource_id === q.translationId);
    const audioPath = v.audio?.url ?? null;
    return {
      key: v.verse_key,
      number: v.verse_number,
      chapterId: Number(v.verse_key.split(":")[0]),
      juz: v.juz_number,
      hizb: v.hizb_number,
      page: v.page_number,
      textUthmani: v.text_uthmani ?? null,
      textIndopak: v.text_indopak ?? null,
      translationHtml: translation ? sanitizeInline(translation.text) : null,
      words: q.words
        ? (v.words ?? [])
            .filter((w) => w.char_type_name !== "end")
            .map((w) => ({
              position: w.position,
              text: w.text_uthmani ?? w.text_indopak ?? w.text ?? "",
              translation: w.translation?.text ?? null,
              transliteration: w.transliteration?.text ?? null,
            }))
        : null,
      audioUrl: audioPath
        ? audioPath.startsWith("http")
          ? audioPath.replace(/^\/\//, "https://")
          : new URL(audioPath.replace(/^\//, ""), APP_CONFIG.quran.audioBaseUrl).toString()
        : null,
    };
  });

  return {
    verses,
    pagination: {
      current: data.pagination.current_page,
      next: data.pagination.next_page,
      totalPages: data.pagination.total_pages,
      totalRecords: data.pagination.total_records,
    },
  };
}

export async function getResources(
  type: "translations" | "tafsirs",
  lang: Locale,
): Promise<{ resources: QuranResource[]; matchedLanguage: boolean }> {
  const raw = await quranFetch(`resources/${type}`, { language: lang });
  const list =
    type === "translations" ? parse(UpTranslations, raw).translations : parse(UpTafsirs, raw).tafsirs;
  const all: QuranResource[] = list.map((r) => ({
    id: r.id,
    name: r.translated_name?.name ?? r.name,
    authorName: r.author_name ?? null,
    languageName: r.language_name,
  }));
  const wanted = LANGUAGE_NAME[lang];
  const matched = all.filter((r) => r.languageName.toLowerCase() === wanted);
  return matched.length ? { resources: matched, matchedLanguage: true } : { resources: all, matchedLanguage: false };
}

export async function getTafsir(tafsirId: number, verseKey: string): Promise<QuranTafsir> {
  const data = parse(UpTafsir, await quranFetch(`tafsirs/${tafsirId}/by_ayah/${verseKey}`, {}));
  return {
    verseKey,
    resourceId: data.tafsir.resource_id ?? tafsirId,
    resourceName: data.tafsir.translated_name?.name ?? data.tafsir.resource_name ?? "",
    html: sanitizeRich(data.tafsir.text ?? ""),
  };
}

export async function searchQuran(query: string, lang: Locale, translationId?: number): Promise<QuranSearchResponse> {
  const data = parse(
    UpSearch,
    await quranFetch(
      "search",
      { q: query, size: 20, page: 1, language: lang, translations: translationId },
      { revalidate: 60 * 60 },
    ),
  );
  return {
    query: data.search.query,
    totalResults: data.search.total_results,
    results: data.search.results.map((r) => ({
      verseKey: r.verse_key,
      text: stripTags(r.text),
      translationHtml: r.translations?.[0] ? sanitizeInline(r.translations[0].text) : null,
    })),
  };
}
