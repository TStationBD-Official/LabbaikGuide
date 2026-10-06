import "server-only";
import { z } from "zod";

/**
 * Upstream (Quran.com / Quran Foundation v4) response shapes. Deliberately
 * lenient on extra fields; strict on the fields we render.
 */
export const UpChapter = z.object({
  id: z.number(),
  revelation_place: z.string(),
  bismillah_pre: z.boolean(),
  name_simple: z.string(),
  name_arabic: z.string(),
  verses_count: z.number(),
  pages: z.array(z.number()).min(2),
  translated_name: z.object({ name: z.string() }).partial().optional(),
});
export const UpChapters = z.object({ chapters: z.array(UpChapter) });

const UpWord = z.object({
  position: z.number(),
  char_type_name: z.string().optional(),
  text_uthmani: z.string().optional().nullable(),
  text_indopak: z.string().optional().nullable(),
  text: z.string().optional().nullable(),
  translation: z.object({ text: z.string().nullable().optional() }).optional().nullable(),
  transliteration: z.object({ text: z.string().nullable().optional() }).optional().nullable(),
});

export const UpVerse = z.object({
  id: z.number(),
  verse_number: z.number(),
  verse_key: z.string(),
  juz_number: z.number(),
  hizb_number: z.number(),
  page_number: z.number(),
  text_uthmani: z.string().optional().nullable(),
  text_indopak: z.string().optional().nullable(),
  translations: z.array(z.object({ resource_id: z.number(), text: z.string() })).optional(),
  words: z.array(UpWord).optional(),
  audio: z.object({ url: z.string().nullable().optional() }).optional().nullable(),
});

export const UpVerses = z.object({
  verses: z.array(UpVerse),
  pagination: z.object({
    current_page: z.number(),
    next_page: z.number().nullable(),
    total_pages: z.number(),
    total_records: z.number(),
  }),
});

const UpResource = z.object({
  id: z.number(),
  name: z.string(),
  author_name: z.string().nullable().optional(),
  language_name: z.string(),
  translated_name: z.object({ name: z.string() }).partial().optional().nullable(),
});
export const UpTranslations = z.object({ translations: z.array(UpResource) });
export const UpTafsirs = z.object({ tafsirs: z.array(UpResource) });

export const UpTafsir = z.object({
  tafsir: z.object({
    resource_id: z.number().optional(),
    resource_name: z.string().optional(),
    text: z.string().nullable().optional(),
    translated_name: z.object({ name: z.string() }).partial().optional().nullable(),
  }),
});

export const UpSearch = z.object({
  search: z.object({
    query: z.string(),
    total_results: z.number(),
    results: z.array(
      z.object({
        verse_key: z.string(),
        text: z.string(),
        translations: z.array(z.object({ text: z.string() })).optional(),
      }),
    ),
  }),
});
