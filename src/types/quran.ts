import { z } from "zod";

/**
 * Normalized internal Quran models. Our API routes return exactly these shapes,
 * and the browser validates them again with the same schemas.
 */
export const ChapterSchema = z.object({
  id: z.number().int().min(1).max(114),
  nameSimple: z.string(),
  nameArabic: z.string(),
  translatedName: z.string(),
  versesCount: z.number().int().positive(),
  revelationPlace: z.enum(["makkah", "madinah"]),
  bismillahPre: z.boolean(),
  pages: z.tuple([z.number(), z.number()]),
});
export type Chapter = z.infer<typeof ChapterSchema>;
export const ChaptersResponseSchema = z.object({ chapters: z.array(ChapterSchema) });

export const WordSchema = z.object({
  position: z.number(),
  text: z.string(),
  translation: z.string().nullable(),
  transliteration: z.string().nullable(),
});
export type QuranWord = z.infer<typeof WordSchema>;

export const VerseSchema = z.object({
  key: z.string().regex(/^\d{1,3}:\d{1,3}$/),
  number: z.number().int().positive(),
  chapterId: z.number().int().min(1).max(114),
  juz: z.number().int(),
  hizb: z.number().int(),
  page: z.number().int(),
  textUthmani: z.string().nullable(),
  textIndopak: z.string().nullable(),
  /** Sanitized HTML (footnote markers only). */
  translationHtml: z.string().nullable(),
  words: z.array(WordSchema).nullable(),
  audioUrl: z.string().url().nullable(),
});
export type QuranVerse = z.infer<typeof VerseSchema>;

export const PaginationSchema = z.object({
  current: z.number().int(),
  next: z.number().int().nullable(),
  totalPages: z.number().int(),
  totalRecords: z.number().int(),
});

export const VersesResponseSchema = z.object({
  verses: z.array(VerseSchema),
  pagination: PaginationSchema,
});
export type VersesResponse = z.infer<typeof VersesResponseSchema>;

export const ResourceSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  authorName: z.string().nullable(),
  languageName: z.string(),
});
export type QuranResource = z.infer<typeof ResourceSchema>;
export const ResourcesResponseSchema = z.object({
  resources: z.array(ResourceSchema),
  /** false when the source has nothing in the requested language and all are returned. */
  matchedLanguage: z.boolean(),
});

export const TafsirSchema = z.object({
  verseKey: z.string(),
  resourceId: z.number().int(),
  resourceName: z.string(),
  html: z.string(),
});
export type QuranTafsir = z.infer<typeof TafsirSchema>;

export const SearchResultSchema = z.object({
  verseKey: z.string(),
  text: z.string(),
  translationHtml: z.string().nullable(),
});
export const SearchResponseSchema = z.object({
  query: z.string(),
  totalResults: z.number().int(),
  results: z.array(SearchResultSchema),
});
export type QuranSearchResponse = z.infer<typeof SearchResponseSchema>;

export const READING_MODES = ["surah", "juz", "page", "hizb"] as const;
export type ReadingMode = (typeof READING_MODES)[number];
export const MODE_LIMITS: Record<ReadingMode, number> = { surah: 114, juz: 30, page: 604, hizb: 60 };

/** Upstream path segment for each reading mode. */
export const MODE_UPSTREAM: Record<ReadingMode, string> = {
  surah: "by_chapter",
  juz: "by_juz",
  page: "by_page",
  hizb: "by_hizb",
};

export const SurahFullSchema = z.object({ chapter: z.number().int(), verses: z.array(VerseSchema) });
export const TafsirChapterSchema = z.object({ resourceId: z.number().int(), entries: z.record(z.string(), z.string()) });
