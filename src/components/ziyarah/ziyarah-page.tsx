"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useUrlSubView } from "@/hooks/use-url-subview";
import { ArrowLeft, BookOpen, Bus, Car, Crosshair, ExternalLink, Footprints, Info, MapPin, Navigation } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { usePrefs } from "@/components/providers/preferences-provider";
import { SegmentedControl } from "@/components/ui/segmented";
import { Button } from "@/components/ui/button";
import { geolocationGranted, useLiveLocation } from "@/hooks/use-geolocation";
import { useWalkingRoute } from "@/hooks/use-walking-route";
import { ZiyarahOverviewMap, ZiyarahTripMap, type TripMode } from "@/components/ziyarah/ziyarah-map";
import { LOCATIONS } from "@/config/locations";
import { distanceM, walkingMinutes, type Fix } from "@/features/places/geo";
import { gt } from "@/data/guides/travel";
import { BUS, ETIQUETTE, estimateTrip, PLACES, TAXI, ZIYARAH_CHECKED, type ZPlace, type ZRef, type ZRegion } from "@/data/guides/ziyarah";
import { cn } from "@/lib/utils";

const PLACE_PARAM = "place";

function useFmt() {
  const { intlLocale, formatNumber } = useI18n();
  return useMemo(
    () => ({
      km: (km: number) =>
        km < 1
          ? new Intl.NumberFormat(intlLocale, { style: "unit", unit: "meter", unitDisplay: "short" }).format(Math.max(50, Math.round((km * 1000) / 50) * 50))
          : new Intl.NumberFormat(intlLocale, { style: "unit", unit: "kilometer", unitDisplay: "short", maximumFractionDigits: km < 10 ? 1 : 0 }).format(km),
      n: formatNumber,
      date: (iso: string) => new Intl.DateTimeFormat(intlLocale, { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso)),
    }),
    [intlLocale, formatNumber],
  );
}

/** Photo with a soft shimmer while loading and a slow zoom ("Ken Burns") when shown large. */
function Photo({ place, big }: { place: ZPlace; big?: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const { locale } = useI18n();
  if (!place.image || failed) {
    return (
      <div className={cn("hc-z-art grid place-items-center", big ? "aspect-[16/9]" : "aspect-[16/10]")} aria-hidden>
        <span className={cn(big ? "text-6xl" : "text-4xl")}>{place.emoji}</span>
      </div>
    );
  }
  return (
    <div className={cn("relative overflow-hidden bg-muted", big ? "aspect-[16/9]" : "aspect-[16/10]")}>
      {!loaded ? <div className="hc-shimmer absolute inset-0" aria-hidden /> : null}
      {/* eslint-disable-next-line @next/next/no-img-element -- remote Wikimedia photo with its own credit line */}
      <img
        src={place.image.src}
        alt={gt(place.name, locale)}
        loading={big ? "eager" : "lazy"}
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={cn("h-full w-full object-cover transition-opacity duration-700", loaded ? "opacity-100" : "opacity-0", big && "hc-kenburns")}
      />
    </div>
  );
}

function Refs({ refs }: { refs: ZRef[] }) {
  const { locale } = useI18n();
  if (!refs.length) return null;
  return (
    <ul className="space-y-1 text-xs">
      {refs.map((r) => (
        <li key={r.label} className="flex gap-1.5">
          <BookOpen className="mt-0.5 size-3.5 shrink-0 text-gold" aria-hidden />
          <span>
            <span className="font-semibold text-gold">{r.label}</span>
            {r.detail ? <span className="text-muted-foreground" dir="auto"> — {gt(r.detail, locale)}</span> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Short name for the map: Arabic uses the Arabic name; others the short label or full name. */
const pinLabel = (p: ZPlace, locale: string) => (locale === "ar" ? p.arabic.split(" · ")[0] : gt(p.pin ?? p.name, locale));

const REGION_OF: Record<"makkah" | "madinah", ZRegion> = { makkah: "makkah", madinah: "madinah" };

const LOCATION_POINT = {
  makkah: { lat: LOCATIONS.makkah.latitude, lon: LOCATIONS.makkah.longitude },
  madinah: { lat: LOCATIONS.madinah.latitude, lon: LOCATIONS.madinah.longitude },
};

export function ZiyarahPage() {
  const { t, locale } = useI18n();
  const fmt = useFmt();
  const pref = usePrefs((s) => s.location);
  const [region, setRegion] = useState<ZRegion>(REGION_OF[pref]);
  const listUrl = useCallback(() => `/ziyarah?region=${region}`, [region]);
  const [openId, open] = useUrlSubView(PLACE_PARAM, listUrl, (id) => PLACES.some((p) => p.id === id));
  const live = useLiveLocation();
  const fix = live.fix;

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const id = q.get(PLACE_PARAM);
    const r = q.get("region") as ZRegion | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the address once on mount
    if (r && ["makkah", "madinah", "other"].includes(r)) setRegion(r);
    else if (id) {
      const p = PLACES.find((x) => x.id === id);
      if (p) setRegion(p.region);
    }
    // Distances from the user when location is already allowed (never prompts on its own).
    void geolocationGranted().then((ok) => ok && live.start());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once
  }, []);

  const opened = PLACES.find((p) => p.id === openId) ?? null;

  /**
   * Where distances are measured from: the user, or else a Haram — Masjid an-Nabawi for Madinah places,
   * Masjid al-Haram for Makkah places, and for places elsewhere the nearer of the two (or the selected city in the list).
   */
  const base: "makkah" | "madinah" = (() => {
    const r = opened?.region ?? region;
    if (r === "makkah" || r === "madinah") return r;
    if (opened) return distanceM(LOCATION_POINT.madinah, opened) < distanceM(LOCATION_POINT.makkah, opened) ? "madinah" : "makkah";
    return pref === "madinah" ? "madinah" : "makkah";
  })();
  const origin = useMemo(() => {
    if (fix) return { lat: fix.lat, lon: fix.lon, you: true };
    return { ...LOCATION_POINT[base], you: false };
  }, [fix, base]);
  const originLabel = origin.you ? t("ziyarah.fromYou") : t(base === "madinah" ? "ziyarah.fromNabawi" : "ziyarah.fromHaram");

  const list = useMemo(
    () =>
      PLACES.filter((p) => p.region === region)
        .map((p) => ({ p, km: distanceM(origin, p) / 1000 }))
        .sort((a, b) => a.km - b.km),
    [region, origin],
  );

  if (opened) return <PlaceDetail key={opened.id} place={opened} origin={origin} originLabel={originLabel} live={live} onBack={() => open(null)} />;

  return (
    <div className="space-y-5">
      {/* animated hero */}
      <div className="hc-z-hero relative overflow-hidden rounded-3xl p-5 text-white shadow-soft">
        <div className="relative z-10 space-y-1.5">
          <p className="text-sm opacity-90">{t("ziyarah.heroKicker")}</p>
          <p className="text-xl font-semibold leading-snug">{t("ziyarah.heroTitle")}</p>
          <p className="text-sm opacity-90">{t("ziyarah.heroSub")}</p>
        </div>
        <span className="hc-z-float absolute -bottom-3 end-3 text-6xl opacity-90" aria-hidden>
          {region === "madinah" ? "🕌" : region === "makkah" ? "🕋" : "🏔️"}
        </span>
        <span className="hc-z-orb absolute -end-10 -top-10 size-40 rounded-full bg-white/10" aria-hidden />
      </div>

      <SegmentedControl<ZRegion>
        label={t("ziyarah.title")}
        value={region}
        onChange={(r) => {
          setRegion(r);
          window.history.replaceState(null, "", `/ziyarah?region=${r}`);
        }}
        options={[
          { value: "makkah", label: `🕋 ${t("location.makkah")}` },
          { value: "madinah", label: `🕌 ${t("location.madinah")}` },
          { value: "other", label: `🏔️ ${t("ziyarah.beyond")}` },
        ]}
      />

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <MapPin className="size-3.5" aria-hidden />
        <span>{t("ziyarah.distancesFrom", { from: originLabel })}</span>
        {!fix ? (
          <button type="button" onClick={() => live.start()} className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 font-medium text-primary">
            <Crosshair className="size-3.5" aria-hidden />
            {live.status === "requesting" ? t("haramMap.locating") : t("ziyarah.useMyLocation")}
          </button>
        ) : null}
      </div>

      <ZiyarahOverviewMap
        items={list.map(({ p }, i) => ({ id: p.id, lat: p.lat, lon: p.lon, num: i + 1, label: pinLabel(p, locale) }))}
        user={fix}
        center={LOCATION_POINT[base]}
        onOpen={open}
        onLocate={() => live.start()}
      />

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {list.map(({ p, km }, i) => {
          const est = estimateTrip(km);
          return (
            <li key={p.id} className="hc-rise" style={{ animationDelay: `${Math.min(i, 8) * 70}ms` }}>
              <button
                type="button"
                onClick={() => open(p.id)}
                className="group block w-full overflow-hidden rounded-2xl border border-border bg-card text-start shadow-soft transition-transform duration-300 hover:-translate-y-0.5 hover:border-gold"
              >
                <div className="relative">
                  <Photo place={p} />
                  <span className="absolute start-2.5 top-2.5 grid size-9 place-items-center rounded-full bg-[#b8891f] text-sm font-bold text-white ring-2 ring-white shadow-soft" aria-hidden>
                    {fmt.n(i + 1)}
                  </span>
                  <span className="absolute bottom-2.5 end-2.5 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    {fmt.km(km)}
                  </span>
                </div>
                <div className="space-y-1.5 p-3.5">
                  <p className="font-semibold leading-snug" dir="auto">
                    <span aria-hidden>{p.emoji} </span>
                    {gt(p.name, locale)}
                  </p>
                  <p lang="ar" dir="rtl" className="font-arabic text-sm text-primary">
                    {p.arabic}
                  </p>
                  <p className="text-sm text-muted-foreground" dir="auto">
                    {p.area ? `${gt(p.area, locale)} · ` : ""}
                    {gt(p.short, locale)}
                  </p>
                  <p className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-xs text-muted-foreground">
                    {est.walkMin !== null ? (
                      <span className="inline-flex items-center gap-1">
                        <Footprints className="size-3.5" aria-hidden />≈ {t("walk.minutes", { n: fmt.n(est.walkMin) })}
                      </span>
                    ) : null}
                    <span className="inline-flex items-center gap-1">
                      <Car className="size-3.5" aria-hidden />≈ {t("walk.minutes", { n: fmt.n(est.driveMin) })}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      💵 {t("ziyarah.sar", { a: fmt.n(est.taxi[0]), b: fmt.n(est.taxi[1]) })}
                    </span>
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <section className="space-y-2 rounded-2xl border border-gold/40 bg-gold-soft/30 p-4" aria-labelledby="z-etiquette">
        <h2 id="z-etiquette" className="flex items-center gap-2 font-semibold">
          <Info className="size-4 text-gold" aria-hidden />
          {t("ziyarah.etiquette")}
        </h2>
        {ETIQUETTE.map((e, i) => (
          <div key={i} className="space-y-1.5">
            <p className="text-sm leading-relaxed" dir="auto">
              {gt(e.text, locale)}
            </p>
            <Refs refs={e.refs} />
          </div>
        ))}
      </section>

      <p className="text-xs text-muted-foreground">{t("ziyarah.costNote", { date: fmt.date(ZIYARAH_CHECKED) })}</p>
    </div>
  );
}

function PlaceDetail({
  place,
  origin,
  originLabel,
  live,
  onBack,
}: {
  place: ZPlace;
  origin: { lat: number; lon: number; you: boolean };
  originLabel: string;
  live: ReturnType<typeof useLiveLocation>;
  onBack: () => void;
}) {
  const { t, locale } = useI18n();
  const fmt = useFmt();
  const km = distanceM(origin, place) / 1000;
  const canWalk = km <= 30;
  const [modePick, setMode] = useState<TripMode>(km <= 3 ? "walk" : "drive");
  const mode: TripMode = canWalk ? modePick : "drive";
  const [tracking, setTracking] = useState(false);

  // Road route from the user (live) or, with location off, from the Haram.
  const fromKey = origin.you ? null : `${origin.lat},${origin.lon}`;
  const haramFix: Fix | null = useMemo(() => (fromKey ? { lat: origin.lat, lon: origin.lon, accuracy: 0, time: 0 } : null), [fromKey]); // eslint-disable-line react-hooks/exhaustive-deps -- keyed by fromKey
  const from = origin.you ? live.fix : haramFix;
  const to = useMemo(() => ({ lat: place.lat, lon: place.lon }), [place.lat, place.lon]);
  const route = useWalkingRoute(from, to, km <= 590, mode);
  const r = route.route;

  const est = estimateTrip(km, mode === "drive" && r ? { km: r.distance / 1000, min: r.duration / 60 } : null);
  const walkMin = mode === "walk" && r ? walkingMinutes(r.distance) : est.walkMin;
  const city = place.region === "madinah" ? "madinah" : place.region === "makkah" ? "makkah" : null;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}&travelmode=${mode === "walk" ? "walking" : "driving"}`;

  return (
    <article className="space-y-5">
      <button type="button" onClick={onBack} className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-primary">
        <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
        {t("ziyarah.allPlaces")}
      </button>

      <div className="hc-rise overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <div className="relative">
          <Photo place={place} big />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4 pt-16 text-white">
            <h2 className="text-xl font-semibold leading-snug" dir="auto">
              {place.emoji} {gt(place.name, locale)}
            </h2>
            <p lang="ar" dir="rtl" className="font-arabic text-base opacity-90">
              {place.arabic}
            </p>
          </div>
        </div>
        {place.image ? (
          <p className="px-4 py-1.5 text-[10px] text-muted-foreground">
            📷{" "}
            <a href={place.image.page} target="_blank" rel="noopener noreferrer" className="underline">
              {place.image.author}
            </a>{" "}
            · {place.image.license} · Wikimedia Commons
          </p>
        ) : null}
      </div>

      <ZiyarahTripMap
        place={to}
        label={gt(place.name, locale)}
        originLabel={originLabel}
        origin={origin}
        user={live.fix}
        live={live}
        route={route}
        mode={mode}
        onMode={setMode}
        canWalk={canWalk}
        tracking={tracking}
        onTracking={setTracking}
        fmtKm={fmt.km}
      />

      {/* distance & getting there */}
      <section className="hc-rise space-y-3 rounded-2xl border border-border bg-card p-4" style={{ animationDelay: "80ms" }} aria-labelledby="z-trip">
        <div className="flex items-baseline justify-between gap-2">
          <h3 id="z-trip" className="font-semibold">
            {t("ziyarah.gettingThere")}
          </h3>
          <p className="text-xs text-muted-foreground">{originLabel}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-muted/60 px-2 py-2">
            <p className="text-[11px] text-muted-foreground">{t("ziyarah.distance")}</p>
            <p className="font-semibold">{fmt.km(r ? r.distance / 1000 : km)}</p>
          </div>
          <div className="rounded-xl bg-muted/60 px-2 py-2">
            <p className="text-[11px] text-muted-foreground">{t("ziyarah.byCar")}</p>
            <p className="font-semibold">≈ {t("walk.minutes", { n: fmt.n(est.driveMin) })}</p>
          </div>
          <div className="rounded-xl bg-muted/60 px-2 py-2">
            <p className="text-[11px] text-muted-foreground">{t("ziyarah.taxi")}</p>
            <p className="font-semibold">{t("ziyarah.sar", { a: fmt.n(est.taxi[0]), b: fmt.n(est.taxi[1]) })}</p>
          </div>
        </div>
        <ul className="space-y-2 text-sm">
          {walkMin !== null ? (
            <li className="flex gap-2">
              <Footprints className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <span>{t("ziyarah.walkLine", { min: fmt.n(walkMin) })}</span>
            </li>
          ) : null}
          {city ? (
            <li className="flex gap-2">
              <Bus className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <span>
                {t(city === "makkah" ? "ziyarah.busMakkah" : "ziyarah.busMadinah", { fare: fmt.n(BUS[city].fare) })}{" "}
                <a href={BUS[city].source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">
                  {t("ziyarah.source")}
                </a>
              </span>
            </li>
          ) : null}
          <li className="flex gap-2">
            <Car className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <span>
              {t("ziyarah.taxiLine", { km: fmt.km(est.roadKm), a: fmt.n(est.taxi[0]), b: fmt.n(est.taxi[1]) })}{" "}
              <a href={TAXI.source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">
                {t("ziyarah.source")}
              </a>
            </span>
          </li>
          {place.transport ? (
            <li className="flex gap-2">
              <Info className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
              <span dir="auto">{gt(place.transport, locale)}</span>
            </li>
          ) : null}
        </ul>
        <div className="flex flex-wrap gap-2">
          <a href={directions} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft">
            <Navigation className="size-4" aria-hidden />
            {t("ziyarah.directions")}
          </a>
          {!origin.you ? (
            <Button variant="outline" onClick={() => live.start()}>
              <Crosshair className="size-4" aria-hidden />
              {t("ziyarah.useMyLocation")}
            </Button>
          ) : null}
        </div>
        <p className="text-[11px] text-muted-foreground">{t("ziyarah.estimateNote")}</p>
      </section>

      <section className="hc-rise space-y-2" style={{ animationDelay: "140ms" }} aria-labelledby="z-about">
        <h3 id="z-about" className="font-semibold">
          {t("ziyarah.about")}
        </h3>
        <p className="leading-relaxed" dir="auto">
          {gt(place.about, locale)}
        </p>
        <Refs refs={place.refs} />
      </section>

      <section className="hc-rise space-y-2 rounded-2xl bg-muted/50 p-4" style={{ animationDelay: "200ms" }} aria-labelledby="z-visit">
        <h3 id="z-visit" className="font-semibold">
          {t("ziyarah.visit")}
        </h3>
        <p className="text-sm leading-relaxed" dir="auto">
          {gt(place.visit, locale)}
        </p>
      </section>

      <section className="space-y-1.5 text-xs" aria-labelledby="z-more">
        <h3 id="z-more" className="font-medium text-muted-foreground">
          {t("ziyarah.more")}
        </h3>
        <ul className="space-y-1">
          {place.more.map((m) => (
            <li key={m.url}>
              <a href={m.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                {m.label}
                <ExternalLink className="size-3" aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
