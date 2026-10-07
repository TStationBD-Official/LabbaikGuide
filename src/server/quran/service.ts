import "server-only";
import { z } from "zod";
import { APP_CONFIG } from "@/config/app";
import type { Locale } from "@/lib/preferences";
import {
  MODE_UPSTREAM,
  TAJWEED_RULES,
  type TajweedRule,
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
  /** Override page size (whole-surah offline download uses the upstream maximum). */
  perPage?: number;
  /** Include King Fahd Complex page-font glyphs (word-level codes + page numbers). */
  qcf?: "v1" | "v2";
  /** Include tajweed-marked Uthmani text (parsed into safe segments). */
  tajweed?: boolean;
};

export async function getVerses(q: VersesQuery): Promise<VersesResponse> {
  const wordFields = [
    ...(q.words ? ["text_uthmani", "text_indopak"] : []),
    ...(q.qcf ? [`code_${q.qcf}`, `${q.qcf}_page`] : []),
  ];
  const raw = await quranFetch(`verses/${MODE_UPSTREAM[q.mode]}/${q.id}`, {
    language: q.lang,
    words: q.words || Boolean(q.qcf),
    word_fields: wordFields.length ? wordFields.join(",") : undefined,
    translations: q.translationId,
    // Arabic text comes straight from the API in each script — never converted between scripts.
    fields: `text_uthmani,text_indopak,text_qpc_hafs${q.tajweed ? ",text_uthmani_tajweed" : ""}`,
    audio: q.audio ? APP_CONFIG.quran.defaultRecitationId : undefined,
    per_page: q.perPage ?? APP_CONFIG.quran.versesPerPage,
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
      textQpcHafs: v.text_qpc_hafs ?? null,
      qcf: q.qcf ? qcfGlyphs(v.words ?? [], q.qcf) : null,
      tajweed: q.tajweed && v.text_uthmani_tajweed ? parseTajweed(v.text_uthmani_tajweed) : null,
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

/**
 * Turns the API's tajweed markup into [text, rule] segments. Only the known
 * `<tajweed class=…>` and `<span class=end>` tags are accepted; anything else
 * (or an unknown rule) rejects the whole verse, which then shows plain text.
 * The ayah-number span is dropped (the card shows the number).
 */
export function parseTajweed(markup: string): [string, TajweedRule | null][] | null {
  const out: [string, TajweedRule | null][] = [];
  const re = /<tajweed class=([a-z_]+)>([^<]*)<\/tajweed>|<span class=end>[^<]*<\/span>|([^<]+)|(<)/g;
  for (const m of markup.matchAll(re)) {
    if (m[4]) return null; // unexpected tag
    if (m[1] !== undefined) {
      if (!(TAJWEED_RULES as readonly string[]).includes(m[1])) return null;
      if (m[2]) out.push([m[2], m[1] as TajweedRule]);
    } else if (m[3] !== undefined) out.push([m[3], null]);
  }
  while (out.length && out[out.length - 1][1] === null && !out[out.length - 1][0].trim()) out.pop();
  if (out.length && out[out.length - 1][1] === null) out[out.length - 1][0] = out[out.length - 1][0].trimEnd();
  return out.length ? out : null;
}

/**
 * Word glyphs for the QCF page fonts. Every word (and the ayah-end marker) must
 * carry its own code and page; if any is missing the verse falls back to Unicode
 * text rather than drawing a glyph with the wrong page font.
 */
export function qcfGlyphs(
  words: { code_v1?: string | null; code_v2?: string | null; v1_page?: number | null; v2_page?: number | null }[],
  v: "v1" | "v2",
): { v: "v1" | "v2"; glyphs: { p: number; c: string }[] } | null {
  const glyphs: { p: number; c: string }[] = [];
  for (const w of words) {
    const c = v === "v1" ? w.code_v1 : w.code_v2;
    const p = v === "v1" ? w.v1_page : w.v2_page;
    if (!c || !p || p < 1 || p > 604) return null;
    glyphs.push({ p, c });
  }
  return glyphs.length ? { v, glyphs } : null;
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

/** Upstream maximum page size for verses/tafsir listings. */
const UPSTREAM_MAX_PER_PAGE = 50;

/**
 * Every verse of a surah in one response (Arabic in both scripts + one
 * translation) — used by the "download for offline" feature. No word-by-word
 * data or audio, to keep the download small.
 */
export async function getSurahFull(chapter: number, lang: Locale, translationId?: number): Promise<QuranVerse[]> {
  const out: QuranVerse[] = [];
  for (let page = 1; page <= 10; page++) {
    const r = await getVerses({ mode: "surah", id: chapter, page, lang, translationId, words: false, audio: false, perPage: UPSTREAM_MAX_PER_PAGE });
    out.push(...r.verses);
    if (!r.pagination.next) break;
  }
  return out;
}

const UpTafsirChapter = z.object({
  tafsirs: z.array(
    z
      .object({
        verse_key: z.string().regex(/^\d{1,3}:\d{1,3}$/).optional(),
        verse_id: z.number().optional(),
        text: z.string().nullable().optional(),
      })
      .passthrough(),
  ),
  pagination: z.object({ next_page: z.number().nullable().optional() }).partial().optional(),
});

/** Whole-surah tafsir as verseKey → sanitized HTML (offline download). */
export async function getTafsirChapter(tafsirId: number, chapter: number): Promise<{ resourceId: number; entries: Record<string, string> }> {
  const entries: Record<string, string> = {};
  for (let page = 1; page <= 20; page++) {
    const data = parse(
      UpTafsirChapter,
      await quranFetch(`tafsirs/${tafsirId}/by_chapter/${chapter}`, { per_page: UPSTREAM_MAX_PER_PAGE, page }),
    );
    for (const t of data.tafsirs) {
      if (!t.verse_key) continue; // cannot place it reliably → skip rather than guess
      const html = sanitizeRich(t.text ?? "");
      if (html) entries[t.verse_key] = html;
    }
    if (!data.pagination?.next_page) break;
  }
  return { resourceId: tafsirId, entries };
}
