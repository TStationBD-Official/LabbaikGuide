"use client";

import { create } from "zustand";
import { useAmalStore } from "@/stores/amal-store";
import { persist } from "zustand/middleware";
import type { Locale } from "@/lib/preferences";
import type { ReadingMode } from "@/types/quran";
import { idbJSONStorage } from "@/services/storage/idb-storage";

export type QuranSize = "sm" | "md" | "lg" | "xl";
export type QuranSpacing = "compact" | "normal" | "relaxed";

export type LastRead = {
  mode: ReadingMode;
  id: number;
  verseKey: string;
  chapterId: number;
  ayah: number;
  page: number;
  juz: number;
  at: number;
};

/** A saved ayah (favourite). */
export type Bookmark = { verseKey: string; chapterId: number; ayah: number; createdAt: number };
/** A reading bookmark: a place to continue reading from later. */
export type ReadingMark = { verseKey: string; chapterId: number; ayah: number; page: number; juz: number; createdAt: number };
/** One reading session (one surah / juz / page), newest first. */
export type HistoryEntry = LastRead;

export const HISTORY_SIZE = 10;
const MAX_MARKS = 50;

type ReaderLayers = {
  showArabic: boolean;
  showTranslation: boolean;
  showTafsir: boolean;
  wordByWord: boolean;
  audio: boolean;
  /** Bengali pronunciation (উচ্চারণ) under the Arabic. */
  bnUccharon: boolean;
  /** Colour-coded Tajweed (King Fahd Complex Tajweed Mushaf V4). */
  tajweed: boolean;
  /** IndoPak readers chose to see Tajweed colours in the Madinah script (no IndoPak tajweed text exists). */
  tajweedMadinah: boolean;
  setTajweedMadinah: (v: boolean) => void;
};

/** Auto-scroll speeds (px per second) for levels 1–10. */
export const AUTO_SCROLL_SPEEDS = [10, 16, 22, 28, 36, 46, 58, 72, 90, 112] as const;

type QuranState = ReaderLayers & {
  size: QuranSize;
  /** Auto-scroll speed level, 1 (slowest) – 10. */
  scrollSpeed: number;
  setScrollSpeed: (n: number) => void;
  spacing: QuranSpacing;
  /** Selected translation/tafsir resource per UI language (null = first available). */
  translationByLang: Partial<Record<Locale, number>>;
  tafsirByLang: Partial<Record<Locale, number>>;
  lastRead: LastRead | null;
  bookmarks: Bookmark[];
  readingMarks: ReadingMark[];
  history: HistoryEntry[];
  toggleReadingMark: (m: Omit<ReadingMark, "createdAt">) => void;
  removeReadingMark: (verseKey: string) => void;
  removeHistory: (at: number) => void;
  clearHistory: () => void;
  setLayer: (k: keyof ReaderLayers, v: boolean) => void;
  setSize: (s: QuranSize) => void;
  setSpacing: (s: QuranSpacing) => void;
  setTranslation: (lang: Locale, id: number) => void;
  setTafsir: (lang: Locale, id: number) => void;
  setLastRead: (r: LastRead) => void;
  toggleBookmark: (b: Omit<Bookmark, "createdAt">) => void;
};

export const useQuranStore = create<QuranState>()(
  persist(
    (set) => ({
      showArabic: true,
      showTranslation: true,
      showTafsir: false,
      wordByWord: false,
      bnUccharon: false,
      tajweed: false,
      tajweedMadinah: false,
      setTajweedMadinah: (tajweedMadinah) => set({ tajweedMadinah }),
      audio: false,
      size: "md",
      spacing: "normal",
      scrollSpeed: 4,
      setScrollSpeed: (n) => set({ scrollSpeed: Math.min(AUTO_SCROLL_SPEEDS.length, Math.max(1, Math.round(n))) }),
      translationByLang: {},
      tafsirByLang: {},
      lastRead: null,
      bookmarks: [],
      readingMarks: [],
      history: [],
      toggleReadingMark: (m) =>
        set((s) =>
          s.readingMarks.some((x) => x.verseKey === m.verseKey)
            ? { readingMarks: s.readingMarks.filter((x) => x.verseKey !== m.verseKey) }
            : { readingMarks: [{ ...m, createdAt: Date.now() }, ...s.readingMarks].slice(0, MAX_MARKS) },
        ),
      removeReadingMark: (verseKey) => set((s) => ({ readingMarks: s.readingMarks.filter((x) => x.verseKey !== verseKey) })),
      removeHistory: (at) => set((s) => ({ history: s.history.filter((h) => h.at !== at) })),
      clearHistory: () => set({ history: [] }),
      setLayer: (k, v) =>
        set((s) => {
          // At least one of Arabic / translation must remain visible.
          if (!v && k === "showArabic" && !s.showTranslation) return s;
          if (!v && k === "showTranslation" && !s.showArabic) return s;
          return { [k]: v } as Partial<QuranState>;
        }),
      setSize: (size) => set({ size }),
      setSpacing: (spacing) => set({ spacing }),
      setTranslation: (lang, id) => set((s) => ({ translationByLang: { ...s.translationByLang, [lang]: id } })),
      setTafsir: (lang, id) => set((s) => ({ tafsirByLang: { ...s.tafsirByLang, [lang]: id } })),
      // Also keeps the last 10 reading sessions: reading on in the same surah/juz/page
      // updates its entry and moves it to the top instead of adding a new one.
      setLastRead: (lastRead) =>
        set((s) => {
          // Daily deeds: verses read today, and surahs read to the end (al-Kahf, al-Mulk…).
          try {
            useAmalStore.getState().noteQuran(lastRead, s.lastRead?.verseKey ?? null);
          } catch {
            /* tracker unavailable — reading still works */
          }
          const rest = s.history.filter((h) => !(h.mode === lastRead.mode && h.id === lastRead.id));
          return { lastRead, history: [lastRead, ...rest].slice(0, HISTORY_SIZE) };
        }),
      toggleBookmark: (b) =>
        set((s) =>
          s.bookmarks.some((x) => x.verseKey === b.verseKey)
            ? { bookmarks: s.bookmarks.filter((x) => x.verseKey !== b.verseKey) }
            : { bookmarks: [{ ...b, createdAt: Date.now() }, ...s.bookmarks].slice(0, 500) },
        ),
    }),
    { name: "hc-quran", storage: idbJSONStorage, version: 1 },
  ),
);
