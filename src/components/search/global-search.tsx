"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Badge, Card, SectionHeader } from "@/components/ui/card";
import { ErrorState, Skeleton } from "@/components/ui/states";
import { searchLocal } from "@/features/search/local-index";
import { useDebounce } from "@/hooks/use-misc";
import { useQuranSearch, useResources } from "@/services/quran/queries";
import { useQuranStore } from "@/stores/quran-store";
import type { TKey } from "@/i18n";

const CAT_TONE = { quran: "primary", dua: "gold", umrah: "neutral", hajj: "neutral", zikr: "warning" } as const;

export function GlobalSearch() {
  const { t, locale, contentLocale } = useI18n();
  const params = useSearchParams();
  const pathname = usePathname();
  const [q, setQ] = useState(params.get("q") ?? "");
  const debounced = useDebounce(q, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => inputRef.current?.focus(), []);
  // Keep the query in the URL so results are shareable and survive reloads.
  // Uses the History API directly: no server round-trip, so it also works offline.
  useEffect(() => {
    const next = `${pathname}${debounced.trim() ? `?q=${encodeURIComponent(debounced.trim())}` : ""}`;
    if (next !== `${window.location.pathname}${window.location.search}`) window.history.replaceState(window.history.state, "", next);
  }, [debounced, pathname]);

  const local = useMemo(() => searchLocal(debounced, contentLocale), [debounced, contentLocale]);
  const translations = useResources("translations", locale);
  const selected = useQuranStore((s) => s.translationByLang[locale]);
  const translationId = selected ?? translations.data?.resources[0]?.id ?? null;
  const quran = useQuranSearch(debounced, locale, translationId);
  const active = debounced.trim().length >= 2;

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <label htmlFor="global-search" className="sr-only">
          {t("search.placeholder")}
        </label>
        <input
          ref={inputRef}
          id="global-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("search.placeholder")}
          autoComplete="off"
          className="h-14 w-full rounded-2xl border border-border bg-card ps-12 pe-4 text-base shadow-soft"
        />
      </div>

      {!active ? (
        <p className="text-sm text-muted-foreground">{q.trim().length === 1 ? t("quran.searchMinChars") : t("search.hint")}</p>
      ) : (
        <>
          <section aria-live="polite">
            {local.length ? (
              <ul className="space-y-2">
                {local.map((h) => (
                  <li key={`${h.category}-${h.id}`}>
                    <Link href={h.href} className="block rounded-xl border border-border bg-card p-4 hover:border-gold">
                      <div className="flex items-center gap-2">
                        <Badge tone={CAT_TONE[h.category]}>{t(`search.cat.${h.category}` as TKey)}</Badge>
                        <span className="font-medium">{h.title}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground" dir="auto">
                        {h.snippet}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          <section>
            <SectionHeader title={t("search.cat.quran")} />
            {quran.isPending ? (
              <div className="space-y-2">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            ) : quran.isError ? (
              <ErrorState error={quran.error} onRetry={() => quran.refetch()} />
            ) : quran.data.results.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("common.noResults")}</p>
            ) : (
              <ul className="space-y-2">
                {quran.data.results.map((r) => {
                  const [s, a] = r.verseKey.split(":");
                  return (
                    <li key={r.verseKey}>
                      <Link href={`/quran/surah/${s}?ayah=${a}`} className="block rounded-xl border border-border bg-card p-4 hover:border-gold">
                        <div className="flex items-center gap-2">
                          <Badge tone="primary">{t("search.cat.quran")}</Badge>
                          <span className="text-sm font-medium">{r.verseKey}</span>
                        </div>
                        <p lang="ar" dir="rtl" className="font-arabic mt-2 text-right text-xl leading-loose">
                          {r.text}
                        </p>
                        {r.translationHtml ? (
                          <Card className="mt-2 border-0 bg-transparent p-0 text-sm shadow-none">
                            {/* Server-sanitized; may contain <em> highlight markup only. */}
                            <span dir="auto" dangerouslySetInnerHTML={{ __html: r.translationHtml }} />
                          </Card>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
          {!local.length && quran.data?.results.length === 0 ? <p className="text-center text-sm text-muted-foreground">{t("common.noResults")}</p> : null}
        </>
      )}
    </div>
  );
}
