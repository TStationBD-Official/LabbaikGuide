"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, Hotel, Navigation } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Card } from "@/components/ui/card";
import { bearingDeg, distanceM, walkingMinutes, type LatLon } from "@/features/places/geo";
import { geolocationGranted } from "@/hooks/use-geolocation";
import { useStoreHydrated } from "@/hooks/use-hydrated";
import { useActivePlace, usePlacesStore } from "@/stores/places-store";

/**
 * Home shortcut back to the saved hotel. Shows distance only if location
 * permission was already granted (never prompts from the home page).
 */
export function HotelHomeCard() {
  const { t, intlLocale, formatNumber } = useI18n();
  const hydrated = useStoreHydrated(usePlacesStore);
  const place = useActivePlace();
  const [me, setMe] = useState<LatLon | null>(null);

  useEffect(() => {
    if (!place) return;
    let alive = true;
    let timer: ReturnType<typeof setInterval> | undefined;
    const read = () =>
      navigator.geolocation?.getCurrentPosition(
        (p) => alive && setMe({ lat: p.coords.latitude, lon: p.coords.longitude }),
        () => undefined,
        { enableHighAccuracy: true, maximumAge: 30_000, timeout: 15_000 },
      );
    geolocationGranted().then((ok) => {
      if (!ok || !alive) return;
      read();
      timer = setInterval(read, 60_000);
    });
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [place]);

  if (!hydrated) return null;

  if (!place) {
    return (
      <Link href="/hotel" className="block">
        <Card className="flex items-center gap-3 p-4 transition-colors hover:border-gold">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
            <Hotel className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{t("hotel.title")}</p>
            <p className="text-sm text-muted-foreground">{t("hotel.homeEmpty")}</p>
          </div>
          <span className="shrink-0 text-sm font-medium text-primary">{t("hotel.homeSetup")}</span>
        </Card>
      </Link>
    );
  }

  const dist = me ? distanceM(me, place) : null;
  const unit = (n: number, u: "meter" | "kilometer", d = 0) =>
    new Intl.NumberFormat(intlLocale, { style: "unit", unit: u, unitDisplay: "short", maximumFractionDigits: d }).format(n);
  const distText = dist === null ? null : dist < 1000 ? unit(Math.round(dist / 5) * 5, "meter") : unit(dist / 1000, "kilometer", 1);

  return (
    <Link href="/hotel" className="block">
      <Card className="flex items-center gap-3 p-4 transition-colors hover:border-gold">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
          {me ? (
            <Navigation className="size-5 fill-current" style={{ transform: `rotate(${bearingDeg(me, place) - 45}deg)` }} aria-hidden />
          ) : (
            <Hotel className="size-5" aria-hidden />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{t("hotel.homeTitle")}</p>
          <p className="truncate font-semibold">{place.name}</p>
          {distText ? (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-gold" dir="ltr">{distText}</span>
              {dist! < 30_000 ? ` · ${t("hotel.walk", { min: formatNumber(walkingMinutes(dist!)) })}` : ""}
            </p>
          ) : null}
        </div>
        <span className="flex shrink-0 items-center gap-0.5 text-sm font-medium text-primary">
          {t("hotel.homeNavigate")}
          <ChevronRight className="size-4 rtl:rotate-180" aria-hidden />
        </span>
      </Card>
    </Link>
  );
}
