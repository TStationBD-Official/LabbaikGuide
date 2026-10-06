"use client";

import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { APP_CONFIG } from "@/config/app";
import type { Locale } from "@/lib/preferences";
import { apiGet } from "@/services/api-client";
import {
  ChaptersResponseSchema,
  ResourcesResponseSchema,
  SearchResponseSchema,
  TafsirSchema,
  VersesResponseSchema,
  type ReadingMode,
} from "@/types/quran";

const { quranStaleMs: staleTime, quranGcMs: gcTime } = APP_CONFIG.cache;

/**
 * Query keys always include every dimension that changes the content
 * (language, translation id, tafsir id, word mode…) so cached Bangla text can
 * never appear under another language.
 */
export const quranKeys = {
  chapters: (lang: Locale) => ["quran", "chapters", lang] as const,
  verses: (p: { mode: ReadingMode; id: number; lang: Locale; translationId: number | null; words: boolean; audio: boolean }) =>
    ["quran", "verses", p.mode, p.id, p.lang, p.translationId ?? "none", p.words, p.audio] as const,
  resources: (type: "translations" | "tafsirs", lang: Locale) => ["quran", "resources", type, lang] as const,
  tafsir: (id: number, key: string) => ["quran", "tafsir", id, key] as const,
  search: (q: string, lang: Locale, translationId: number | null) =>
    ["quran-search", q, lang, translationId ?? "none"] as const,
};

const qs = (o: Record<string, string | number | boolean | null | undefined>) =>
  new URLSearchParams(
    Object.entries(o)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => [k, String(v)]),
  ).toString();

export function useChapters(lang: Locale) {
  return useQuery({
    queryKey: quranKeys.chapters(lang),
    queryFn: ({ signal }) => apiGet(`/api/quran/chapters?${qs({ lang })}`, ChaptersResponseSchema, { signal }),
    select: (d) => d.chapters,
    staleTime,
    gcTime,
  });
}

export function useResources(type: "translations" | "tafsirs", lang: Locale) {
  return useQuery({
    queryKey: quranKeys.resources(type, lang),
    queryFn: ({ signal }) => apiGet(`/api/quran/resources?${qs({ type, lang })}`, ResourcesResponseSchema, { signal }),
    staleTime: 1000 * 60 * 60 * 24,
    gcTime,
  });
}

export function useVerses(p: {
  mode: ReadingMode;
  id: number;
  lang: Locale;
  translationId: number | null;
  words: boolean;
  audio: boolean;
  startPage?: number;
  enabled?: boolean;
}) {
  return useInfiniteQuery({
    queryKey: quranKeys.verses(p),
    initialPageParam: p.startPage ?? 1,
    queryFn: ({ pageParam, signal }) =>
      apiGet(
        `/api/quran/verses?${qs({
          mode: p.mode,
          id: p.id,
          page: pageParam,
          lang: p.lang,
          translation: p.translationId,
          words: p.words,
          audio: p.audio,
        })}`,
        VersesResponseSchema,
        { signal },
      ),
    getNextPageParam: (last) => last.pagination.next ?? undefined,
    getPreviousPageParam: (first) => (first.pagination.current > 1 ? first.pagination.current - 1 : undefined),
    placeholderData: keepPreviousData,
    enabled: p.enabled ?? true,
    staleTime,
    gcTime,
  });
}

export function useTafsir(tafsirId: number | null, verseKey: string, enabled: boolean) {
  return useQuery({
    queryKey: quranKeys.tafsir(tafsirId ?? 0, verseKey),
    queryFn: ({ signal }) =>
      apiGet(`/api/quran/tafsir?${qs({ id: tafsirId, key: verseKey })}`, TafsirSchema, { signal }),
    enabled: enabled && tafsirId !== null,
    staleTime,
    gcTime,
  });
}

export function useQuranSearch(q: string, lang: Locale, translationId: number | null) {
  const trimmed = q.trim();
  return useQuery({
    queryKey: quranKeys.search(trimmed, lang, translationId),
    queryFn: ({ signal }) =>
      apiGet(
        `/api/quran/search?${qs({ q: trimmed, lang, translation: translationId })}`,
        SearchResponseSchema,
        { signal },
      ),
    enabled: trimmed.length >= 2,
    staleTime: 1000 * 60 * 10,
  });
}
