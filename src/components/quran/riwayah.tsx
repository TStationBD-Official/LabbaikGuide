"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { BookOpenText, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { ErrorState, SkeletonList } from "@/components/ui/states";
import { RIWAYAH_FONT, RIWAYAT, type RiwayahId } from "@/config/riwayat";
import { useStoreHydrated } from "@/hooks/use-hydrated";
import { useQuranStore } from "@/stores/quran-store";
import { cn } from "@/lib/utils";

const IndexSchema = z.object({
  source: z.string(),
  surahs: z.array(z.object({ ar: z.string(), en: z.string() })).length(114),
  riwayat: z.record(z.string(), z.object({ total: z.number(), counts: z.array(z.number()).length(114), basmala: z.string() })),
});
const SurahSchema = z.object({
  s: z.number().int().min(1).max(114),
  name: z.string(),
  nameEn: z.string(),
  ayahs: z.array(z.tuple([z.number().int(), z.string().min(1), z.number().int(), z.number().int()])),
});
type SurahData = z.infer<typeof SurahSchema>;

async function getJson<T>(url: string, schema: z.ZodType<T>, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return schema.parse(await res.json());
}

const useRiwayatIndex = () =>
  useQuery({
    queryKey: ["riwayat", "index"],
    queryFn: ({ signal }) => getJson("/data/riwayat/index.json", IndexSchema, signal),
    staleTime: Infinity,
  });

const useRiwayahSurah = (r: RiwayahId, s: number) =>
  useQuery({
    queryKey: ["riwayat", r, s],
    queryFn: ({ signal }) => getJson(`/data/riwayat/${r}/${s}.json`, SurahSchema, signal),
    staleTime: Infinity,
  });

const fontOf = (r: RiwayahId) => `"${RIWAYAH_FONT[r].family}"`;

/** List of the readings with a sample of each. */
export function RiwayahIndex() {
  const { t, formatNumber } = useI18n();
  const index = useRiwayatIndex();
  return (
    <div className="space-y-5">
      <p className="flex items-start gap-2 rounded-2xl border border-border bg-card/70 p-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
        {t("riwayah.hafsNote")}
      </p>
      {index.isError ? <ErrorState error={index.error} onRetry={() => index.refetch()} /> : null}
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {RIWAYAT.map((r) => {
          const meta = index.data?.riwayat[r];
          return (
            <li key={r}>
              <Link
                href={`/quran/riwayah/${r}/1`}
                className="group flex h-full flex-col rounded-2xl border border-border bg-card p-4 shadow-soft transition-colors hover:border-gold"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{t(`riwayah.name_${r}`)}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{t(`riwayah.where_${r}`)}</p>
                  </div>
                  {meta ? (
                    <span className="shrink-0 rounded-full bg-gold-soft px-2.5 py-0.5 text-xs font-medium text-gold">
                      {t("riwayah.verses", { n: formatNumber(meta.total) })}
                    </span>
                  ) : null}
                </div>
                <p
                  lang="ar"
                  dir="rtl"
                  aria-hidden
                  className="mt-3 min-h-12 text-center text-[1.6rem] leading-[3rem] text-primary"
                  style={{ fontFamily: fontOf(r) }}
                >
                  {meta?.basmala ?? ""}
                </p>
                <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-primary">
                  {t("riwayah.open")}
                  <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" aria-hidden />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-muted-foreground">{t("riwayah.source")}</p>
    </div>
  );
}

/** Group consecutive ayahs by Mushaf page. */
function byPage(ayahs: SurahData["ayahs"]) {
  const out: { page: number; ayahs: SurahData["ayahs"] }[] = [];
  for (const a of ayahs) {
    const last = out[out.length - 1];
    if (last && last.page === a[2]) last.ayahs.push(a);
    else out.push({ page: a[2], ayahs: [a] });
  }
  return out;
}

/** One surah in a reading: Arabic only, Mushaf-style, page by page. */
export function RiwayahReader({ r, s }: { r: RiwayahId; s: number }) {
  const { t, formatNumber, locale } = useI18n();
  const router = useRouter();
  const arabicNames = locale === "ar" || locale === "ur";
  const index = useRiwayatIndex();
  const surah = useRiwayahSurah(r, s);
  const hydrated = useStoreHydrated(useQuranStore);
  const size = useQuranStore((q) => q.size);
  const spacing = useQuranStore((q) => q.spacing);
  const meta = index.data?.riwayat[r];

  const options = useMemo(
    () =>
      Array.from({ length: 114 }, (_, i) => ({
        value: i + 1,
        label: `${formatNumber(i + 1)}. ${(arabicNames ? index.data?.surahs[i].ar : index.data?.surahs[i].en) ?? ""}`,
        // Bidi-isolated so Arabic and Latin names never reorder the line.
        description: [index.data ? `\u2068${arabicNames ? index.data.surahs[i].en : index.data.surahs[i].ar}\u2069` : null, meta ? t("riwayah.verses", { n: formatNumber(meta.counts[i]) }) : null].filter(Boolean).join(" · "),
      })),
    [meta, index.data, t, formatNumber, arabicNames],
  );

  const pages = useMemo(() => (surah.data ? byPage(surah.data.ayahs) : []), [surah.data]);
  // The basmala heads every surah except At-Tawbah; where it is itself verse 1 (Kufi/Makki count) it is not repeated.
  const firstIsBasmala = surah.data?.ayahs[0]?.[1].startsWith("بِس") ?? false;
  const showBasmala = s !== 9 && !firstIsBasmala && Boolean(meta?.basmala);

  return (
    <div className="space-y-5" data-quran-size={hydrated ? size : undefined} data-quran-spacing={hydrated ? spacing : undefined}>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/quran/riwayah" className="text-sm text-muted-foreground hover:text-foreground">
            {t("riwayah.title")}
          </Link>
          <h1 className="text-2xl font-bold sm:text-3xl">{t(`riwayah.name_${r}`)}</h1>
          {surah.data ? (
            <p className="mt-1 text-sm text-muted-foreground">
              <span lang="ar" className="text-lg text-gold" style={{ fontFamily: fontOf(r) }}>
                {surah.data.name}
              </span>
              {" · "}
              {surah.data.nameEn} · {t("riwayah.verses", { n: formatNumber(surah.data.ayahs.length) })}
            </p>
          ) : null}
        </div>
        <Select<number>
          className="w-full sm:w-72"
          label={t("riwayah.surahLabel")}
          value={s}
          onChange={(v) => router.push(`/quran/riwayah/${r}/${v}`)}
          options={options}
          searchable
        />
      </header>

      <p className="flex items-start gap-2 rounded-2xl border border-warning/40 bg-gold-soft/40 p-3 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
        {t("riwayah.textOnly")}
      </p>

      {surah.isPending ? (
        <SkeletonList rows={4} />
      ) : surah.isError ? (
        <ErrorState error={surah.error} onRetry={() => surah.refetch()} />
      ) : (
        <div className="mx-auto max-w-4xl space-y-4">
          {showBasmala ? (
            <p lang="ar" dir="rtl" className="text-center text-gold" style={{ fontFamily: fontOf(r), fontSize: "var(--quran-size)", lineHeight: 2.4 }}>
              {meta!.basmala}
            </p>
          ) : null}
          {pages.map((pg) => (
            <Card key={`${pg.page}-${pg.ayahs[0][0]}`} className="relative bg-[var(--quran-bg)] px-4 pb-5 pt-7 sm:px-8">
              <span className="absolute start-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/50 bg-card px-3 py-0.5 text-xs text-gold rtl:translate-x-1/2">
                {t("riwayah.page", { n: formatNumber(pg.page) })}
              </span>
              <p
                lang="ar"
                dir="rtl"
                className="text-justify text-foreground [text-align-last:center]"
                style={{ fontFamily: fontOf(r), fontSize: "var(--quran-size)", lineHeight: "var(--quran-leading)" }}
              >
                {pg.ayahs.map((a) => (
                  <span key={a[0]} id={`r-${a[0]}`}>
                    {a[1]}{" "}
                  </span>
                ))}
              </p>
            </Card>
          ))}
        </div>
      )}

      <nav className="flex items-center justify-between gap-3" aria-label={t("riwayah.surahLabel")}>
        {s > 1 ? (
          <Link href={`/quran/riwayah/${r}/${s - 1}`} className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-border bg-card px-4 text-sm font-medium hover:bg-muted">
            <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden />
            {t("riwayah.prev")}
          </Link>
        ) : (
          <span />
        )}
        {s < 114 ? (
          <Link href={`/quran/riwayah/${r}/${s + 1}`} className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-border bg-card px-4 text-sm font-medium hover:bg-muted">
            {t("riwayah.next")}
            <ChevronRight className="size-4 rtl:rotate-180" aria-hidden />
          </Link>
        ) : null}
      </nav>
      <p className={cn("flex items-center gap-2 text-xs text-muted-foreground")}>
        <BookOpenText className="size-4 text-gold" aria-hidden />
        {t("riwayah.source")}
      </p>
    </div>
  );
}
