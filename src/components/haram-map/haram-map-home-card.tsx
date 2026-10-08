"use client";

import Link from "next/link";
import { ChevronRight, MapPinned } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { usePrefs } from "@/components/providers/preferences-provider";
import { Card } from "@/components/ui/card";
import { LOCATIONS } from "@/config/locations";

/** Home shortcut to the Haram Map of the city selected at the top (Makkah → Masjid al-Haram, Madinah → Masjid an-Nabawi). */
export function HaramMapHomeCard() {
  const { t } = useI18n();
  const location = usePrefs((s) => s.location);
  const loc = LOCATIONS[location];
  return (
    <Link href={`/haram-map?loc=${location}`} className="block">
      <Card className="flex items-center gap-3 p-4 transition-colors hover:border-gold">
        <span className="relative grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
          <MapPinned className="size-5" aria-hidden />
          <span className="absolute -bottom-1 -end-1 text-base leading-none" aria-hidden>
            {loc.icon}
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{t("haramMap.title")}</p>
          <p className="truncate font-semibold">{t(loc.mosqueKey)}</p>
          <p className="truncate text-sm text-muted-foreground">{t("haramMap.homeSub")}</p>
        </div>
        <span className="flex shrink-0 items-center gap-0.5 text-sm font-medium text-primary">
          {t("haramMap.open")}
          <ChevronRight className="size-4 rtl:rotate-180" aria-hidden />
        </span>
      </Card>
    </Link>
  );
}
