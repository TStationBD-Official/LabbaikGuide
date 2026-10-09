"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { usePrefs } from "@/components/providers/preferences-provider";
import { Card } from "@/components/ui/card";
import { LOCATIONS } from "@/config/locations";
import { PLACES } from "@/data/guides/ziyarah";

/** Home entry to the historical places of the city selected at the top (Makkah or Madinah). */
export function ZiyarahHomeCard() {
  const { t, formatNumber } = useI18n();
  const location = usePrefs((s) => s.location);
  const places = PLACES.filter((p) => p.region === location);
  const thumbs = places.filter((p) => p.image).slice(0, 3);
  return (
    <Link href={`/ziyarah?region=${location}`} className="block">
      <Card className="flex items-center gap-3 p-4 transition-colors hover:border-gold">
        <span className="relative grid size-11 shrink-0 place-items-center rounded-xl bg-gold-soft text-xl" aria-hidden>
          🏛️
          <span className="absolute -bottom-1 -end-1 text-base leading-none">{LOCATIONS[location].icon}</span>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">
            {t("ziyarah.homeTitle")} · {t("ziyarah.count", { n: formatNumber(places.length) })}
          </p>
          <p className="truncate font-semibold">{t(LOCATIONS[location].nameKey)}</p>
          <p className="truncate text-sm text-muted-foreground">{t(location === "madinah" ? "ziyarah.homeSubMadinah" : "ziyarah.homeSubMakkah")}</p>
        </div>
        <span className="hidden shrink-0 -space-x-2 sm:flex rtl:space-x-reverse" aria-hidden>
          {thumbs.map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- tiny remote thumbnails
            <img
              key={p.id}
              src={p.image!.src}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              className="hc-rise size-9 rounded-full border-2 border-card object-cover"
              style={{ animationDelay: `${i * 90}ms` }}
            />
          ))}
        </span>
        <span className="flex shrink-0 items-center gap-0.5 text-sm font-medium text-primary">
          {t("ziyarah.open")}
          <ChevronRight className="size-4 rtl:rotate-180" aria-hidden />
        </span>
      </Card>
    </Link>
  );
}
