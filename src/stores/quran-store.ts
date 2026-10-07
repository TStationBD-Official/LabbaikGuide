"use client";

import { create } from "zustand";
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

export type Bookmark = { verseKey: string; chapterId: number; ayah: number; createdAt: number };

type ReaderLayers = {
  showArabic: boolean;
  showTranslation: boolean;
  showTafsir: boolean;
  wordByWord: boolean;
  audio: boolean;
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
      audio: false,
      size: "md",
      spacing: "normal",
      scrollSpeed: 4,
      setScrollSpeed: (n) => set({ scrollSpeed: Math.min(AUTO_SCROLL_SPEEDS.length, Math.max(1, Math.round(n))) }),
      translationByLang: {},
      tafsirByLang: {},
      lastRead: null,
      bookmarks: [],
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
      setLastRead: (lastRead) => set({ lastRead }),
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
