"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { usePrefs } from "@/components/providers/preferences-provider";
import { Button, IconButton } from "@/components/ui/button";
import { ErrorState, SkeletonList } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { useStoreHydrated } from "@/hooks/use-hydrated";
import { ARABIC_FONTS, type ArabicFont } from "@/lib/preferences";
import { qcfVariantFor, useQcfFonts } from "@/hooks/use-qcf-fonts";
import { useIsDark } from "@/hooks/use-is-dark";
import { useChapters, useResources, useVerses } from "@/services/quran/queries";
import { useQuranStore } from "@/stores/quran-store";
import { MODE_LIMITS, type QuranVerse, type ReadingMode } from "@/types/quran";
import { APP_CONFIG } from "@/config/app";
import { AyahCard } from "./ayah-card";
import { LayerToggles } from "./layer-toggles";
import { ReaderSettings } from "./reader-settings";
import { AutoScrollBar, useAutoScroll, type AutoScrollMode } from "./auto-scroll";

/** Basmala heading in the encoding of each script family (KFGQPC Hafs / Uthmani / IndoPak). */
const BASMALA = {
  madinah: "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ",
  uthmani: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
  indopak: "بِسۡمِ اللهِ الرَّحۡمٰنِ الرَّحِيۡمِ",
} as const;

const MODE_LABEL = { surah: "quran.surah", juz: "quran.juz", page: "quran.page", hizb: "quran.hizb" } as const;

/** Single shared <audio> element; plays ayah by ayah, continuing to the next loaded ayah. */
function useAyahAudio(verses: QuranVerse[], onError: () => void) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const versesRef = useRef(verses);
  useEffect(() => {
    versesRef.current = verses;
  }, [verses]);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    setPlayingKey(null);
  }, []);

  // Ref indirection lets the `onended` handler chain to the next ayah.
  const startRef = useRef<(v: QuranVerse) => void>(() => undefined);
  const start = useCallback(
    (v: QuranVerse) => {
      if (!v.audioUrl) return stop();
      audioRef.current ??= new Audio();
      const a = audioRef.current;
      a.src = v.audioUrl;
      a.onended = () => {
        const list = versesRef.current;
        const next = list[list.findIndex((x) => x.key === v.key) + 1];
        if (!next) return stop();
        document.getElementById(`ayah-${next.key.replace(":", "-")}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
        startRef.current(next);
      };
      setPlayingKey(v.key);
      a.play().catch(() => {
        stop();
        onError();
      });
    },
    [stop, onError],
  );

  useEffect(() => {
    startRef.current = start;
  }, [start]);

  const play = useCallback((v: QuranVerse) => (playingKey === v.key ? stop() : start(v)), [playingKey, start, stop]);

  useEffect(() => () => audioRef.current?.pause(), []);
  return { playingKey, play, stop };
}

export function QuranReader({ mode, id, initialAyah }: { mode: ReadingMode; id: number; initialAyah?: number }) {
  const { t, locale, formatNumber } = useI18n();
  const toast = useToast();
  const arabicFont = usePrefs((s) => s.arabicFont);
  const scriptDef = ARABIC_FONTS[arabicFont] as (typeof ARABIC_FONTS)[ArabicFont] & { qcf?: "v1" | "v2" | "v4" };
  const scriptField = scriptDef.script;
  const qcfVersion = scriptDef.qcf ?? null;
  const hydrated = useStoreHydrated(useQuranStore);
  const q = useQuranStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [autoScroll, setAutoScroll] = useState<AutoScrollMode>("off");

  const chapters = useChapters(locale);
  const translations = useResources("translations", locale);
  const tafsirs = useResources("tafsirs", locale);

  const translationId = q.translationByLang[locale] ?? translations.data?.resources[0]?.id ?? null;
  const tafsirId = q.tafsirByLang[locale] ?? tafsirs.data?.resources[0]?.id ?? null;

  // Wait for the translation list so we never fetch verses twice (with and without translation).
  const ready = hydrated && (!q.showTranslation || translations.isFetched);
  const startPage = mode === "surah" && initialAyah ? Math.ceil(initialAyah / APP_CONFIG.quran.versesPerPage) : 1;

  const verses = useVerses({
    mode,
    id,
    lang: locale,
    translationId: q.showTranslation ? translationId : null,
    words: q.wordByWord,
    audio: q.audio,
    // Tajweed V4 fonts draw the V2 glyph codes.
    qcf: qcfVersion ? (qcfVersion === "v1" ? "v1" : "v2") : null,
    startPage,
    enabled: ready,
  });

  const allVerses = useMemo(() => verses.data?.pages.flatMap((p) => p.verses) ?? [], [verses.data]);
  const dark = useIsDark();
  const qcfVariant = qcfVersion ? qcfVariantFor(qcfVersion) : null;
  const qcfPages = useMemo(() => allVerses.flatMap((v) => v.qcf?.glyphs.map((g) => g.p) ?? []), [allVerses]);
  const qcfReady = useQcfFonts(qcfVariant, qcfPages);
  const qcf = useMemo(() => (qcfVariant ? { variant: qcfVariant, ready: qcfReady, dark } : null), [qcfVariant, qcfReady, dark]);
  const audio = useAyahAudio(allVerses, () => toast(t("quran.audioError"), "error"));
  const pauseAutoScroll = useCallback(() => setAutoScroll((m) => (m === "running" ? "paused" : m)), []);
  useAutoScroll(autoScroll, pauseAutoScroll);

  const chapterName = useCallback(
    (cid: number) => chapters.data?.find((c) => c.id === cid)?.nameSimple ?? `${t("quran.surah")} ${formatNumber(cid)}`,
    [chapters.data, t, formatNumber],
  );

  // Scroll to a requested ayah once it is rendered.
  const scrolledTo = useRef<string | null>(null);
  const targetKey = mode === "surah" && initialAyah ? `${id}:${initialAyah}` : null;
  useEffect(() => {
    if (!targetKey || scrolledTo.current === targetKey) return;
    const el = document.getElementById(`ayah-${targetKey.replace(":", "-")}`);
    if (el) {
      el.scrollIntoView({ block: "start" });
      scrolledTo.current = targetKey;
    }
  }, [targetKey, allVerses.length]);

  // Track last-read: the top-most ayah visible in the viewport.
  const setLastRead = q.setLastRead;
  useEffect(() => {
    if (!allVerses.length || typeof IntersectionObserver === "undefined") return;
    const byKey = new Map(allVerses.map((v) => [v.key, v]));
    let timer: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const key = visible[0]?.target.getAttribute("data-verse-key");
        const v = key ? byKey.get(key) : undefined;
        if (!v) return;
        clearTimeout(timer);
        timer = setTimeout(
          () => setLastRead({ mode, id, verseKey: v.key, chapterId: v.chapterId, ayah: v.number, page: v.page, juz: v.juz, at: Date.now() }),
          800,
        );
      },
      { rootMargin: "-25% 0px -60% 0px" },
    );
    document.querySelectorAll("[data-verse-key]").forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, [allVerses, mode, id, setLastRead]);

  // Infinite loading: fetch the next page when the sentinel approaches.
  const sentinel = useRef<HTMLDivElement>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = verses;
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasNextPage || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((e) => {
      if (e[0]?.isIntersecting && !isFetchingNextPage) void fetchNextPage();
    }, { rootMargin: "800px" });
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const bookmarks = useMemo(() => new Set(q.bookmarks.map((b) => b.verseKey)), [q.bookmarks]);
  const toggleBookmark = q.toggleBookmark;
  const onToggleBookmark = useCallback(
    (v: QuranVerse) => toggleBookmark({ verseKey: v.key, chapterId: v.chapterId, ayah: v.number }),
    [toggleBookmark],
  );

  const chapter = mode === "surah" ? chapters.data?.find((c) => c.id === id) : undefined;
  const title =
    mode === "surah"
      ? chapter
        ? `${formatNumber(chapter.id)}. ${chapter.nameSimple}`
        : `${t("quran.surah")} ${formatNumber(id)}`
      : `${t(MODE_LABEL[mode])} ${formatNumber(id)}`;

  const prev = id > 1 ? id - 1 : null;
  const next = id < MODE_LIMITS[mode] ? id + 1 : null;
  const showBismillah = mode === "surah" && chapter?.bismillahPre && startPage === 1 && !verses.hasPreviousPage;

  return (
    <div data-quran-size={q.size} data-quran-spacing={q.spacing}>
      <header className="mb-4">
        <nav className="mb-2 text-sm text-muted-foreground">
          <Link href="/quran" className="hover:text-foreground">
            {t("quran.title")}
          </Link>
        </nav>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
            {chapter ? (
              <p className="mt-1 text-sm text-muted-foreground">
                <span lang="ar" className="font-arabic text-lg text-gold">
                  {chapter.nameArabic}
                </span>
                {" · "}
                {chapter.translatedName} · {t("quran.verses", { n: chapter.versesCount })} ·{" "}
                {chapter.revelationPlace === "makkah" ? t("quran.meccan") : t("quran.medinan")}
              </p>
            ) : null}
          </div>
          <IconButton label={t("quran.readerSettings")} variant="outline" onClick={() => setSettingsOpen(true)}>
            <SlidersHorizontal className="size-5" aria-hidden />
          </IconButton>
        </div>
      </header>

      <div className="glass sticky top-[calc(max(0.6rem,env(safe-area-inset-top))+3.45rem)] z-30 -mx-4 mb-4 border-y border-border/60 px-4 py-2 sm:-mx-6 sm:px-6 md:top-[4.5rem] md:mx-0 md:rounded-2xl md:border">
        <LayerToggles />
      </div>

      {q.showTranslation && translationId !== null && translations.data ? (
        <p className="mb-3 text-xs text-muted-foreground">
          {t("quran.translationBy", {
            name: translations.data.resources.find((r) => r.id === translationId)?.name ?? "",
          })}
        </p>
      ) : null}

      {verses.hasPreviousPage ? (
        <div className="mb-4 flex justify-center">
          <Button variant="outline" size="sm" onClick={() => verses.fetchPreviousPage()} disabled={verses.isFetchingPreviousPage}>
            {t("quran.loadMore")}
          </Button>
        </div>
      ) : null}

      {showBismillah && q.showArabic ? (
        <p lang="ar" dir="rtl" className="font-quran mb-4 text-center text-gold">
          {BASMALA[scriptDef.group]}
        </p>
      ) : null}

      {!ready || verses.isPending ? (
        <SkeletonList rows={4} />
      ) : verses.isError && !allVerses.length ? (
        <ErrorState error={verses.error} onRetry={() => verses.refetch()} />
      ) : (
        <div className="mx-auto max-w-4xl space-y-4">
          {allVerses.map((v) => (
            <AyahCard
              key={v.key}
              verse={v}
              chapterName={chapterName(v.chapterId)}
              scriptField={scriptField}
              qcf={qcf}
              showArabic={q.showArabic}
              showTranslation={q.showTranslation}
              showTafsir={q.showTafsir}
              wordByWord={q.wordByWord}
              audioEnabled={q.audio}
              tafsirId={tafsirId}
              bookmarked={bookmarks.has(v.key)}
              playing={audio.playingKey === v.key}
              highlighted={v.key === targetKey}
              onToggleBookmark={onToggleBookmark}
              onPlay={audio.play}
            />
          ))}
          <div ref={sentinel} aria-hidden />
          {verses.isFetchingNextPage ? <SkeletonList rows={2} /> : null}
          {verses.isError && allVerses.length ? (
            <ErrorState error={verses.error} onRetry={() => verses.fetchNextPage()} />
          ) : null}
          {!verses.hasNextPage ? <p className="py-4 text-center text-sm text-muted-foreground">۞ {t("quran.end")} ۞</p> : null}
        </div>
      )}

      <nav className="mt-6 flex items-center justify-between gap-3" aria-label={t("quran.title")}>
        {prev ? (
          <Link href={`/quran/${mode}/${prev}`} className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-border bg-card px-4 text-sm font-medium hover:bg-muted">
            <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden />
            {t("quran.prevSection")}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/quran/${mode}/${next}`} className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-border bg-card px-4 text-sm font-medium hover:bg-muted">
            {t("quran.nextSection")}
            <ChevronRight className="size-4 rtl:rotate-180" aria-hidden />
          </Link>
        ) : null}
      </nav>

      <ReaderSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        translations={translations.data?.resources ?? []}
        tafsirs={tafsirs.data?.resources ?? []}
        tafsirLanguageMatched={tafsirs.data?.matchedLanguage ?? true}
        translationId={translationId}
        tafsirId={tafsirId}
        autoScroll={autoScroll !== "off"}
        onAutoScroll={(v) => {
          setAutoScroll(v ? "running" : "off");
          if (v) setSettingsOpen(false);
        }}
      />
      <AutoScrollBar
        mode={autoScroll}
        onToggle={() => setAutoScroll((m) => (m === "running" ? "paused" : "running"))}
        onStop={() => setAutoScroll("off")}
      />
    </div>
  );
}
