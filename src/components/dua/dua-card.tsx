"use client";

import { Copy, Heart, Share2 } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { IconButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { useFavoritesStore } from "@/stores/favorites-store";
import { lt, type Dua } from "@/types/content";
import { copyText, shareOrCopy, cn } from "@/lib/utils";

export function DuaCard({
  dua,
  compact,
  anchor,
  className,
}: {
  dua: Dua;
  compact?: boolean;
  /** Give the card an id so /duas#id links can target it. */
  anchor?: boolean;
  className?: string;
}) {
  const { t, contentLocale } = useI18n();
  const toast = useToast();
  const fav = useFavoritesStore((s) => s.duas.includes(dua.id));
  const toggle = useFavoritesStore((s) => s.toggleDua);
  const title = lt(dua.title, contentLocale);
  const refs = dua.references.map((r) => r.label + (r.detail ? ` (${r.detail})` : "")).join(" · ");
  const body = () =>
    [dua.arabic, lt(dua.pronunciation, contentLocale), lt(dua.meaning, contentLocale), `${t("dua.reference")}: ${refs}`].join("\n\n");

  return (
    <Card id={anchor ? dua.id : undefined} className={cn("scroll-mt-36 p-4 sm:p-5", className)}>
      <div className="flex items-start justify-between gap-2">
        <h3 dir="auto" className="font-semibold leading-snug">{title}</h3>
        <div className="-me-2 -mt-1 flex shrink-0">
          <IconButton size="sm" label={fav ? t("common.unfavorite") : t("common.favorite")} pressed={fav} onClick={() => toggle(dua.id)}>
            <Heart className={cn("size-4", fav && "fill-danger text-danger")} aria-hidden />
          </IconButton>
          <IconButton
            size="sm"
            label={t("common.copy")}
            onClick={async () => toast((await copyText(body())) ? t("common.copied") : t("errors.generic"))}
          >
            <Copy className="size-4" aria-hidden />
          </IconButton>
          <IconButton
            size="sm"
            label={t("common.share")}
            onClick={async () => {
              const r = await shareOrCopy({ title, text: body() });
              if (r === "copied") toast(t("common.copied"));
            }}
          >
            <Share2 className="size-4" aria-hidden />
          </IconButton>
        </div>
      </div>
      <p lang="ar" dir="rtl" className={cn("font-dua mt-3 text-right leading-[2.1] text-primary", compact ? "text-xl" : "text-2xl")}>
        {dua.arabic}
      </p>
      <p dir="auto" className="mt-3 text-sm italic text-muted-foreground">{lt(dua.pronunciation, contentLocale)}</p>
      <p dir="auto" className="mt-2 text-[0.95rem] leading-relaxed">{lt(dua.meaning, contentLocale)}</p>
      {dua.note ? (
        <p dir="auto" className="mt-3 rounded-lg bg-accent px-3 py-2 text-sm text-accent-foreground">{lt(dua.note, contentLocale)}</p>
      ) : null}
      <p className="mt-3 text-xs text-muted-foreground">
        <span className="font-medium text-gold">{t("dua.reference")}:</span> {refs}
      </p>
    </Card>
  );
}
