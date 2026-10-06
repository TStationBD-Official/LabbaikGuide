import "server-only";
import { z } from "zod";
import { LOCALES } from "@/lib/preferences";
import { MODE_LIMITS, READING_MODES } from "@/types/quran";

const lang = z.enum(LOCALES).default("bn");
const bool = z.enum(["true", "false"]).default("false").transform((v) => v === "true");
const optionalId = z.coerce.number().int().positive().max(100000).optional();

export const ChaptersQuery = z.object({ lang });

export const VersesQuery = z
  .object({
    mode: z.enum(READING_MODES),
    id: z.coerce.number().int().positive(),
    page: z.coerce.number().int().positive().max(1000).default(1),
    lang,
    translation: optionalId,
    words: bool,
    audio: bool,
  })
  .refine((q) => q.id <= MODE_LIMITS[q.mode], { message: "id out of range" });

export const ResourcesQuery = z.object({ type: z.enum(["translations", "tafsirs"]), lang });

export const TafsirQuery = z.object({
  id: z.coerce.number().int().positive().max(100000),
  key: z.string().regex(/^(?:[1-9]\d?|10\d|11[0-4]):[1-9]\d{0,2}$/),
});

export const SearchQuery = z.object({
  q: z.string().trim().min(2).max(100),
  lang,
  translation: optionalId,
});

const chapter = z.coerce.number().int().min(1).max(114);
export const SurahFullQuery = z.object({ id: chapter, lang, translation: optionalId });
export const TafsirChapterQuery = z.object({ id: z.coerce.number().int().positive().max(100000), chapter });
