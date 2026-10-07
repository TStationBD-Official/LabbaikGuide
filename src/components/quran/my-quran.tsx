"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { BookmarkCheck, ChevronRight, Heart, History, Trash2, X } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { EmptyState, SkeletonList } from "@/components/ui/states";
import { useStoreHydrated } from "@/hooks/use-hydrated";
import { useChapters } from "@/services/quran/queries";
import { HISTORY_SIZE, useQuranStore } from "@/stores/quran-store";
import type { Chapter } from "@/types/quran";

function useNames() {
  const { locale, t, formatNumber } = useI18n();
  const chapters = useChapters(locale);
  return (id: number) => {
    const c: Chapter | undefined = chapters.data?.find((x) => x.id === id);
    return { name: c?.nameSimple ?? `${t("quran.surah")} ${formatNumber(id)}`, arabic: c?.nameArabic ?? null };
  };
}

function useWhen() {
  const { intlLocale } = useI18n();
  return (ms: number) => new Intl.DateTimeFormat(intlLocale, { dateStyle: "medium", timeStyle: "short" }).format(ms);
}

/** One row: what it is (surah · ayah), a detail line, open link, remove button. */
function Row({
  href,
  icon,
  title,
  arabic,
  detail,
  onRemove,
  removeLabel,
  openLabel,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  arabic: string | null;
  detail: string;
  onRemove: () => void;
  removeLabel: string;
  openLabel: string;
}) {
  return (
    <li className="flex items-center gap-2 rounded-2xl border border-border bg-card p-2 ps-3 transition-colors hover:border-gold">
      <Link href={href} className="flex min-w-0 flex-1 items-center gap-3 py-1">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-2">
            <span className="truncate font-medium">{title}</span>
            {arabic ? (
              <span lang="ar" className="font-arabic shrink-0 text-base text-gold">
                {arabic}
              </span>
            ) : null}
          </span>
          <span className="block truncate text-xs text-muted-foreground">{detail}</span>
        </span>
        <span className="hidden shrink-0 items-center gap-0.5 text-sm font-medium text-primary sm:inline-flex">
          {openLabel}
          <ChevronRight className="size-4 rtl:rotate-180" aria-hidden />
        </span>
      </Link>
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel}
        title={removeLabel}
        className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <X className="size-4" aria-hidden />
      </button>
    </li>
  );
}

const ayahHref = (chapterId: number, ayah: number) => `/quran/surah/${chapterId}?ayah=${ayah}`;

/** Saved ayat (♡). */
export function SavedAyat() {
  const { t } = useI18n();
  const hydrated = useStoreHydrated(useQuranStore);
  const saved = useQuranStore((s) => s.bookmarks);
  const toggle = useQuranStore((s) => s.toggleBookmark);
  const names = useNames();
  const when = useWhen();
  if (!hydrated) return <SkeletonList rows={2} />;
  if (!saved.length) return <EmptyState message={t("quran.noSaved")} icon={<Heart className="size-8 text-muted-foreground" aria-hidden />} />;
  return (
    <ul className="grid grid-cols-1 gap-2 lg:grid-cols-2">
      {saved.map((b) => {
        const n = names(b.chapterId);
        return (
          <Row
            key={b.verseKey}
            href={ayahHref(b.chapterId, b.ayah)}
            icon={<Heart className="size-5 fill-rose-500 text-rose-500" aria-hidden />}
            title={`${n.name} · ${t("quran.ayahN", { n: b.ayah })}`}
            arabic={n.arabic}
            detail={t("quran.savedOn", { date: when(b.createdAt) })}
            onRemove={() => toggle({ verseKey: b.verseKey, chapterId: b.chapterId, ayah: b.ayah })}
            removeLabel={t("quran.unsaveAyah")}
            openLabel={t("quran.continue")}
          />
        );
      })}
    </ul>
  );
}

/** Reading bookmarks: places to continue from. */
export function ReadingBookmarks() {
  const { t, formatNumber } = useI18n();
  const hydrated = useStoreHydrated(useQuranStore);
  const marks = useQuranStore((s) => s.readingMarks);
  const remove = useQuranStore((s) => s.removeReadingMark);
  const names = useNames();
  const when = useWhen();
  if (!hydrated) return <SkeletonList rows={2} />;
  if (!marks.length) return <EmptyState message={t("quran.noMarks")} icon={<BookmarkCheck className="size-8 text-muted-foreground" aria-hidden />} />;
  return (
    <ul className="grid grid-cols-1 gap-2 lg:grid-cols-2">
      {marks.map((m) => {
        const n = names(m.chapterId);
        return (
          <Row
            key={m.verseKey}
            href={ayahHref(m.chapterId, m.ayah)}
            icon={<BookmarkCheck className="size-5" aria-hidden />}
            title={`${n.name} · ${t("quran.ayahN", { n: m.ayah })}`}
            arabic={n.arabic}
            detail={`${t("quran.juz")} ${formatNumber(m.juz)} · ${t("quran.page")} ${formatNumber(m.page)} · ${when(m.createdAt)}`}
            onRemove={() => remove(m.verseKey)}
            removeLabel={t("quran.unmark")}
            openLabel={t("quran.continue")}
          />
        );
      })}
    </ul>
  );
}

const MODE_KEY = { surah: "quran.surah", juz: "quran.juz", page: "quran.page", hizb: "quran.hizb" } as const;

/** The last 10 reading sessions. */
export function ReadingHistory() {
  const { t, formatNumber } = useI18n();
  const hydrated = useStoreHydrated(useQuranStore);
  const history = useQuranStore((s) => s.history);
  const lastRead = useQuranStore((s) => s.lastRead);
  const removeOne = useQuranStore((s) => s.removeHistory);
  const clear = useQuranStore((s) => s.clearHistory);
  const names = useNames();
  const when = useWhen();
  if (!hydrated) return <SkeletonList rows={3} />;
  // Readers from before history existed still see their last reading.
  const list = history.length ? history : lastRead ? [lastRead] : [];
  if (!list.length) return <EmptyState message={t("quran.noHistory")} icon={<History className="size-8 text-muted-foreground" aria-hidden />} />;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{t("quran.historyHint")}</p>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(t("common.confirm"))) clear();
          }}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Trash2 className="size-4" aria-hidden />
          {t("quran.clearHistory")}
        </button>
      </div>
      <ol className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        {list.slice(0, HISTORY_SIZE).map((h) => {
          const n = names(h.chapterId);
          const context = h.mode === "surah" ? null : t("quran.readingIn", { what: `${t(MODE_KEY[h.mode])} ${formatNumber(h.id)}` });
          return (
            <Row
              key={`${h.mode}-${h.id}-${h.at}`}
              href={ayahHref(h.chapterId, h.ayah)}
              icon={<History className="size-5" aria-hidden />}
              title={`${n.name} · ${t("quran.ayahN", { n: h.ayah })}`}
              arabic={n.arabic}
              detail={[context, when(h.at)].filter(Boolean).join(" · ")}
              onRemove={() => removeOne(h.at)}
              removeLabel={t("quran.remove")}
              openLabel={t("quran.continue")}
            />
          );
        })}
      </ol>
    </div>
  );
}
