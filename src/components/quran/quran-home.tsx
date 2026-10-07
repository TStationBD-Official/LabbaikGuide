"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BookOpen, ChevronRight, Library, Search } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Card, GlassCard } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented";
import { ErrorState, SkeletonList } from "@/components/ui/states";
import { useStoreHydrated } from "@/hooks/use-hydrated";
import { useChapters } from "@/services/quran/queries";
import { useQuranStore } from "@/stores/quran-store";
import type { Chapter } from "@/types/quran";
import { OfflineQuranBanner } from "@/components/settings/offline-section";
import { ReadingBookmarks, ReadingHistory, SavedAyat } from "./my-quran";

type Tab = "surahs" | "juz" | "saved" | "bookmarks" | "history";
const TABS: Tab[] = ["surahs", "juz", "saved", "bookmarks", "history"];

export function ContinueReadingCard({ compact }: { compact?: boolean }) {
  const { t, locale, formatNumber } = useI18n();
  const hydrated = useStoreHydrated(useQuranStore);
  const lastRead = useQuranStore((s) => s.lastRead);
  const chapters = useChapters(locale);
  if (!hydrated) return null;

  if (!lastRead) {
    return (
      <Link href="/quran/surah/1" className="block">
        <GlassCard className="flex items-center gap-4 p-4 transition-colors hover:border-gold">
          <BookOpen className="size-8 shrink-0 text-gold" aria-hidden />
          <span className="font-semibold">{t("home.startQuran")}</span>
        </GlassCard>
      </Link>
    );
  }
  const ch = chapters.data?.find((c) => c.id === lastRead.chapterId);
  const href = `/quran/surah/${lastRead.chapterId}?ayah=${lastRead.ayah}`;
  return (
    <GlassCard className="relative overflow-hidden p-5">
      <div aria-hidden className="absolute -end-6 -top-6 size-28 rounded-full bg-gold/10" />
      <p className="text-sm text-muted-foreground">{t("quran.lastRead")}</p>
      <p className="mt-1 text-xl font-semibold">
        {t("quran.surah")} {ch?.nameSimple ?? formatNumber(lastRead.chapterId)}
      </p>
      <p className="text-sm text-muted-foreground">
        {t("quran.ayahN", { n: lastRead.ayah })}
        {compact ? null : ` · ${t("quran.juz")} ${formatNumber(lastRead.juz)} · ${t("quran.page")} ${formatNumber(lastRead.page)}`}
      </p>
      <Link
        href={href}
        className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-soft"
      >
        <BookOpen className="size-4" aria-hidden />
        {t("quran.continueReading")}
      </Link>
    </GlassCard>
  );
}

function SurahRow({ c }: { c: Chapter }) {
  const { t, formatNumber } = useI18n();
  return (
    <li>
      <Link
        href={`/quran/surah/${c.id}`}
        className="flex min-h-16 items-center gap-3 rounded-xl border border-transparent px-3 py-2 transition-colors hover:border-border hover:bg-card"
      >
        <span className="grid size-10 shrink-0 rotate-45 place-items-center rounded-lg border border-gold/50 text-sm font-semibold">
          <span className="-rotate-45">{formatNumber(c.id)}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{c.nameSimple}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {c.translatedName} · {t("quran.verses", { n: c.versesCount })}
          </span>
        </span>
        <span lang="ar" className="font-arabic shrink-0 text-xl text-primary">
          {c.nameArabic}
        </span>
      </Link>
    </li>
  );
}

export function QuranHome() {
  const { t, locale, formatNumber } = useI18n();
  // The tab is kept in the URL (?tab=saved) so links and the back button land on it.
  const params = useSearchParams();
  const initial = params.get("tab");
  const [tab, setTabState] = useState<Tab>(TABS.includes(initial as Tab) ? (initial as Tab) : "surahs");
  const setTab = (v: Tab) => {
    setTabState(v);
    const url = new URL(window.location.href);
    if (v === "surahs") url.searchParams.delete("tab");
    else url.searchParams.set("tab", v);
    window.history.replaceState(window.history.state, "", url.pathname + url.search);
  };
  const [filter, setFilter] = useState("");
  const chapters = useChapters(locale);

  const filtered = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f || !chapters.data) return chapters.data ?? [];
    return chapters.data.filter(
      (c) =>
        c.nameSimple.toLowerCase().includes(f) ||
        c.translatedName.toLowerCase().includes(f) ||
        c.nameArabic.includes(filter.trim()) ||
        String(c.id) === f,
    );
  }, [chapters.data, filter]);

  return (
    <div className="space-y-5">
      <ContinueReadingCard />
      <OfflineQuranBanner />
      <Link
        href="/quran/riwayah"
        className="group flex items-center gap-3 rounded-2xl border border-border bg-card/80 p-3.5 shadow-soft transition-colors hover:border-gold"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gold-soft text-gold">
          <Library className="size-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-medium">{t("riwayah.title")}</span>
          <span className="block truncate text-xs text-muted-foreground">{t("riwayah.entry")}</span>
        </span>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:rotate-180" aria-hidden />
      </Link>

      <Link
        href="/search?cat=quran"
        className="flex min-h-12 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm text-muted-foreground hover:bg-muted"
      >
        <Search className="size-4" aria-hidden />
        {t("quran.searchPlaceholder")}
      </Link>

      <SegmentedControl<Tab>
        label={t("quran.title")}
        value={tab}
        onChange={setTab}
        options={[
          { value: "surahs", label: t("quran.surahs") },
          { value: "juz", label: t("quran.juz") },
          { value: "saved", label: t("quran.saved") },
          { value: "bookmarks", label: t("quran.bookmarks") },
          { value: "history", label: t("quran.history") },
        ]}
      />

      {tab === "surahs" ? (
        <Card className="p-2 sm:p-3">
          <div className="p-2">
            <label htmlFor="surah-filter" className="sr-only">
              {t("quran.filterSurahs")}
            </label>
            <input
              id="surah-filter"
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={t("quran.filterSurahs")}
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
            />
          </div>
          {chapters.isPending ? (
            <SkeletonList rows={6} className="p-2" />
          ) : chapters.isError ? (
            <ErrorState error={chapters.error} onRetry={() => chapters.refetch()} />
          ) : filtered.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">{t("common.noResults")}</p>
          ) : (
            <ul className="grid grid-cols-1 gap-1 md:grid-cols-2 2xl:grid-cols-3">
              {filtered.map((c) => (
                <SurahRow key={c.id} c={c} />
              ))}
            </ul>
          )}
        </Card>
      ) : null}

      {tab === "juz" ? (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
            <li key={j}>
              <Link
                href={`/quran/juz/${j}`}
                className="flex min-h-16 flex-col items-center justify-center rounded-xl border border-border bg-card text-sm hover:border-gold"
              >
                <span className="text-xs text-muted-foreground">{t("quran.juz")}</span>
                <span className="text-lg font-semibold">{formatNumber(j)}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {tab === "saved" ? <SavedAyat /> : null}
      {tab === "bookmarks" ? <ReadingBookmarks /> : null}
      {tab === "history" ? <ReadingHistory /> : null}
    </div>
  );
}
