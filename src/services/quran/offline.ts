"use client";

import { createStore, del, get, set, type UseStore } from "idb-keyval";
import { create } from "zustand";
import { APP_CONFIG } from "@/config/app";
import type { Locale } from "@/lib/preferences";
import { apiGet, ApiError } from "@/services/api-client";
import {
  ChaptersResponseSchema,
  SurahFullSchema,
  TafsirChapterSchema,
  type Chapter,
  type QuranSearchResponse,
  type QuranTafsir,
  type QuranVerse,
  type ReadingMode,
  type VersesResponse,
} from "@/types/quran";

/**
 * Offline Quran: the whole Quran (Arabic in both scripts + one translation,
 * optionally one tafsir) downloaded into IndexedDB on demand. The reader,
 * tafsir and search fall back to it whenever the network is unavailable.
 * Translation/tafsir are only served when they match the user's current
 * selection, so one language's text can never appear under another.
 */
export const TOTAL_SURAHS = 114;

export type OfflineMeta = {
  lang: Locale;
  translationId: number | null;
  translationName: string | null;
  tafsirId: number | null;
  tafsirName: string | null;
  surahs: number[];
  tafsirSurahs: number[];
  updatedAt: number;
};

let store: UseStore | null = null;
const db = () => {
  if (typeof indexedDB === "undefined") return null;
  store ??= createStore("hc-quran-offline", "kv");
  return store;
};

async function idbGet<T>(key: string): Promise<T | undefined> {
  const s = db();
  return s ? get<T>(key, s).catch(() => undefined) : undefined;
}
async function idbSet(key: string, value: unknown) {
  const s = db();
  if (s) await set(key, value, s);
}

export const getOfflineMeta = () => idbGet<OfflineMeta>("meta");

// ───────────────────────── lookups used by the query fallbacks ─────────────────────────

let allVersesCache: { stamp: number; verses: QuranVerse[] } | null = null;

async function loadSurah(chapter: number): Promise<QuranVerse[] | undefined> {
  return idbGet<QuranVerse[]>(`v:${chapter}`);
}

async function loadAll(meta: OfflineMeta): Promise<QuranVerse[]> {
  if (allVersesCache?.stamp === meta.updatedAt) return allVersesCache.verses;
  const parts = await Promise.all([...meta.surahs].sort((a, b) => a - b).map((c) => loadSurah(c)));
  const verses = parts.flatMap((p) => p ?? []);
  allVersesCache = { stamp: meta.updatedAt, verses };
  return verses;
}

const MODE_FIELD: Record<Exclude<ReadingMode, "surah">, keyof QuranVerse> = { juz: "juz", page: "page", hizb: "hizb" };

/** Same shape as the API so the reader cannot tell the difference. */
export async function offlineVerses(p: {
  mode: ReadingMode;
  id: number;
  page: number;
  lang: Locale;
  translationId: number | null;
}): Promise<VersesResponse | null> {
  const meta = await getOfflineMeta();
  if (!meta) return null;
  let list: QuranVerse[] | undefined;
  if (p.mode === "surah") {
    if (!meta.surahs.includes(p.id)) return null;
    list = await loadSurah(p.id);
  } else {
    const field = MODE_FIELD[p.mode];
    list = (await loadAll(meta)).filter((v) => v[field] === p.id);
  }
  if (!list?.length) return null;

  const translationMatches = p.translationId !== null && meta.lang === p.lang && meta.translationId === p.translationId;
  const per = APP_CONFIG.quran.versesPerPage;
  const totalPages = Math.max(1, Math.ceil(list.length / per));
  const page = Math.min(Math.max(1, p.page), totalPages);
  const verses = list.slice((page - 1) * per, page * per).map((v) => ({
    ...v,
    translationHtml: translationMatches ? v.translationHtml : null,
    words: null,
    audioUrl: null, // audio is not stored offline
  }));
  return {
    verses,
    pagination: { current: page, next: page < totalPages ? page + 1 : null, totalPages, totalRecords: list.length },
  };
}

export async function offlineTafsir(tafsirId: number, verseKey: string): Promise<QuranTafsir | null> {
  const meta = await getOfflineMeta();
  if (!meta || meta.tafsirId !== tafsirId) return null;
  const [chapter, ayah] = verseKey.split(":").map(Number);
  if (!meta.tafsirSurahs.includes(chapter)) return null;
  const entries = await idbGet<Record<string, string>>(`t:${chapter}`);
  if (!entries) return null;
  // Some tafsirs comment on a group of ayahs under the first key of the group.
  let html = entries[verseKey];
  for (let a = ayah - 1; !html && a >= 1; a--) html = entries[`${chapter}:${a}`];
  return { verseKey, resourceId: tafsirId, resourceName: meta.tafsirName ?? "", html: html ?? "" };
}

export async function offlineChapters(): Promise<Chapter[] | null> {
  const meta = await getOfflineMeta();
  if (!meta) return null;
  return (await idbGet<Chapter[]>(`chapters:${meta.lang}`)) ?? null;
}

export async function offlineResources(type: "translations" | "tafsirs", lang: Locale) {
  const meta = await getOfflineMeta();
  if (!meta || meta.lang !== lang) return null;
  const id = type === "translations" ? meta.translationId : meta.tafsirId;
  const name = type === "translations" ? meta.translationName : meta.tafsirName;
  if (id === null) return null;
  return { resources: [{ id, name: name ?? String(id), authorName: null, languageName: "" }], matchedLanguage: true };
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/<[^>]*>/g, " ")
    .replace(/[ً-ٰٟۖ-ۭـ̀-ͯ]/g, "")
    .replace(/[ٱأإآ]/g, "ا")
    .replace(/\s+/g, " ");

/** Simple offline search over the downloaded Arabic text and translation. */
export async function offlineSearch(query: string, lang: Locale, translationId: number | null): Promise<QuranSearchResponse | null> {
  const meta = await getOfflineMeta();
  if (!meta) return null;
  const terms = normalize(query).trim().split(" ").filter(Boolean);
  if (!terms.length) return { query, totalResults: 0, results: [] };
  const withTr = meta.lang === lang && meta.translationId === translationId;
  const hits = (await loadAll(meta)).filter((v) => {
    const hay = normalize(`${v.textUthmani ?? ""} ${v.textIndopak ?? ""} ${withTr ? v.translationHtml ?? "" : ""}`);
    return terms.every((t) => hay.includes(t));
  });
  return {
    query,
    totalResults: hits.length,
    results: hits.slice(0, 50).map((v) => ({
      verseKey: v.key,
      text: v.textUthmani ?? v.textIndopak ?? "",
      translationHtml: withTr ? v.translationHtml : null,
    })),
  };
}

/** True when a request failed because there is no usable network. */
export const isOfflineError = (e: unknown) =>
  (typeof navigator !== "undefined" && !navigator.onLine) ||
  (e instanceof ApiError && ["network", "timeout", "server", "rateLimited"].includes(e.kind));

// ───────────────────────── download manager ─────────────────────────

type DownloadState = {
  status: "idle" | "running" | "done" | "error" | "cancelled";
  done: number;
  total: number;
  phase: "text" | "tafsir" | "pages";
  error: string | null;
  meta: OfflineMeta | null;
  refresh: () => Promise<void>;
};

export const useOfflineQuran = create<DownloadState>()((setState) => ({
  status: "idle",
  done: 0,
  total: TOTAL_SURAHS,
  phase: "text",
  error: null,
  meta: null,
  refresh: async () => setState({ meta: (await getOfflineMeta()) ?? null }),
}));

let controller: AbortController | null = null;

/** Retries transient failures; on 429 waits as long as the server asks. */
async function withRetry<T>(fn: () => Promise<T>, signal: AbortSignal): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 8; attempt++) {
    if (signal.aborted) throw new DOMException("aborted", "AbortError");
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (e instanceof ApiError && !e.retryable) throw e;
      const wait =
        e instanceof ApiError && e.kind === "rateLimited"
          ? Math.min((e.retryAfter ?? 2) * 1000 + 250, 15000)
          : Math.min(1000 * 2 ** attempt, 15000);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw lastError;
}

/** Keeps the download under the API's rate limit (~2 requests/second sustained). */
const PACE_MS = 450;

async function pool<T>(items: T[], limit: number, worker: (item: T) => Promise<void>, signal?: AbortSignal) {
  const queue = [...items];
  await Promise.all(
    Array.from({ length: Math.min(limit, queue.length) }, async () => {
      while (queue.length) {
        if (signal?.aborted) throw new DOMException("aborted", "AbortError");
        const started = Date.now();
        await worker(queue.shift()!);
        const wait = PACE_MS * limit - (Date.now() - started);
        if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      }
    }),
  );
}

/** Ask the service worker to cache the reader pages so they open offline. */
function precacheReaderPages() {
  const urls = [
    ...Array.from({ length: TOTAL_SURAHS }, (_, i) => `/quran/surah/${i + 1}`),
    ...Array.from({ length: 30 }, (_, i) => `/quran/juz/${i + 1}`),
  ];
  navigator.serviceWorker?.controller?.postMessage({ type: "precache-pages", urls });
}

export async function downloadQuran(opts: {
  lang: Locale;
  translationId: number | null;
  translationName: string | null;
  tafsirId: number | null;
  tafsirName: string | null;
}) {
  if (useOfflineQuran.getState().status === "running") return;
  controller = new AbortController();
  const { signal } = controller;
  const q = (o: Record<string, string | number | null>) =>
    new URLSearchParams(Object.entries(o).filter(([, v]) => v !== null) as [string, string][]).toString();

  // Resume if the same language/translation was partially downloaded; otherwise start fresh.
  const prev = await getOfflineMeta();
  const sameText = prev && prev.lang === opts.lang && prev.translationId === opts.translationId;
  const sameTafsir = prev && prev.tafsirId === opts.tafsirId;
  const meta: OfflineMeta = {
    ...opts,
    surahs: sameText ? prev.surahs : [],
    tafsirSurahs: sameTafsir && sameText ? prev.tafsirSurahs : [],
    updatedAt: Date.now(),
  };
  const all = Array.from({ length: TOTAL_SURAHS }, (_, i) => i + 1);
  const total = TOTAL_SURAHS * (opts.tafsirId ? 2 : 1);
  let done = meta.surahs.length + meta.tafsirSurahs.length;
  useOfflineQuran.setState({ status: "running", done, total, phase: "text", error: null });

  const save = async () => {
    meta.updatedAt = Date.now();
    await idbSet("meta", meta);
    useOfflineQuran.setState({ done, meta: { ...meta } });
  };

  try {
    const chapters = await withRetry(() => apiGet(`/api/quran/chapters?${q({ lang: opts.lang })}`, ChaptersResponseSchema, { signal }), signal);
    await idbSet(`chapters:${opts.lang}`, chapters.chapters);
    await save();

    await pool(all.filter((c) => !meta.surahs.includes(c)), 3, async (c) => {
      const r = await withRetry(
        () => apiGet(`/api/quran/surah?${q({ id: c, lang: opts.lang, translation: opts.translationId })}`, SurahFullSchema, { signal, timeoutMs: 45000 }),
        signal,
      );
      await idbSet(`v:${c}`, r.verses);
      meta.surahs.push(c);
      done++;
      await save();
    }, signal);

    if (opts.tafsirId) {
      useOfflineQuran.setState({ phase: "tafsir" });
      await pool(all.filter((c) => !meta.tafsirSurahs.includes(c)), 2, async (c) => {
        const r = await withRetry(
          () => apiGet(`/api/quran/tafsir-surah?${q({ id: opts.tafsirId, chapter: c })}`, TafsirChapterSchema, { signal, timeoutMs: 60000 }),
          signal,
        );
        await idbSet(`t:${c}`, r.entries);
        meta.tafsirSurahs.push(c);
        done++;
        await save();
      }, signal);
    }

    useOfflineQuran.setState({ phase: "pages" });
    precacheReaderPages();
    useOfflineQuran.setState({ status: "done" });
  } catch (e) {
    if (signal.aborted) useOfflineQuran.setState({ status: "cancelled" });
    else useOfflineQuran.setState({ status: "error", error: e instanceof Error ? e.message : String(e) });
  } finally {
    controller = null;
  }
}

export function cancelDownload() {
  controller?.abort();
}

export async function deleteOfflineQuran() {
  cancelDownload();
  const s = db();
  if (s) {
    const meta = await getOfflineMeta();
    await Promise.all([
      ...Array.from({ length: TOTAL_SURAHS }, (_, i) => del(`v:${i + 1}`, s)),
      ...Array.from({ length: TOTAL_SURAHS }, (_, i) => del(`t:${i + 1}`, s)),
      meta ? del(`chapters:${meta.lang}`, s) : Promise.resolve(),
      del("meta", s),
    ]);
  }
  allVersesCache = null;
  useOfflineQuran.setState({ status: "idle", done: 0, meta: null });
}
