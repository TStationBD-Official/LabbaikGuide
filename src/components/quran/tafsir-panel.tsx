"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { useTafsir } from "@/services/quran/queries";
import { ErrorState, Skeleton } from "@/components/ui/states";
import { cn } from "@/lib/utils";

/**
 * Collapsible Tafsir card. Fetched lazily when the ayah scrolls into view.
 * Long tafsir is clipped with "আরও পড়ুন" so the page never becomes overwhelming.
 */
export function TafsirPanel({
  tafsirId,
  verseKey,
  active,
}: {
  tafsirId: number | null;
  verseKey: string;
  active: boolean;
}) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const bodyId = useId();
  const q = useTafsir(tafsirId, verseKey, active);

  if (!active || tafsirId === null) return null;
  if (q.isPending) return <Skeleton className="mt-3 h-24 w-full" />;
  if (q.isError) return <ErrorState className="mt-3 p-4" error={q.error} onRetry={() => q.refetch()} />;

  const { html, resourceName } = q.data;
  const isLong = html.length > 900;

  return (
    <section className="mt-4 rounded-xl border border-border bg-background/60 p-4" aria-label={t("quran.tafsir")}>
      <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
        <span aria-hidden className="h-3 w-0.5 rounded bg-gold" />
        {t("quran.tafsir")}
      </h4>
      {html ? (
        <div className="relative">
          <div
            id={bodyId}
            className={cn("prose-tafsir text-[0.95rem] leading-relaxed text-foreground/90", !expanded && isLong && "max-h-48 overflow-hidden")}
            // Sanitized on the server: only formatting tags, no attributes.
            dangerouslySetInnerHTML={{ __html: html }}
          />
          {!expanded && isLong ? (
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-background to-transparent" />
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t("quran.tafsirEmpty")}</p>
      )}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        {isLong ? (
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={bodyId}
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-sm font-medium text-primary hover:bg-muted"
          >
            {expanded ? t("common.showLess") : t("common.readMore")}
            <ChevronDown aria-hidden className={cn("size-4 transition-transform", expanded && "rotate-180")} />
          </button>
        ) : (
          <span />
        )}
        {resourceName ? (
          <p className="text-xs text-muted-foreground">
            {t("common.source")}: {resourceName}
          </p>
        ) : null}
      </div>
    </section>
  );
}
