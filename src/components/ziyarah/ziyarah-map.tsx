"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Car, Footprints, LocateFixed, Maximize2, Radio, Square } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { usePrefs } from "@/components/providers/preferences-provider";
import { useMapStyleNames } from "@/components/places/map-style-names";
import type { MapPoi, MapViewHandle } from "@/components/places/map-view";
import { arrivalRadius, distanceM, remainingPath, walkingMinutes, type Fix, type LatLon } from "@/features/places/geo";
import type { useLiveLocation } from "@/hooks/use-geolocation";
import type { useWalkingRoute } from "@/hooks/use-walking-route";
import { withTraffic } from "@/data/guides/ziyarah";
import { cn } from "@/lib/utils";

const MapView = dynamic(() => import("@/components/places/map-view").then((m) => m.MapView), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted" />,
});

/** Follows the active colour scheme (theme preference + system setting). */
function useDarkScheme() {
  const theme = usePrefs((s) => s.theme);
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const read = () => setDark(getComputedStyle(document.documentElement).colorScheme.includes("dark"));
    read();
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
  }, [theme]);
  return dark;
}

function useMapLabels() {
  const { t } = useI18n();
  const styleNames = useMapStyleNames();
  return { map: t("hotel.mapLabel"), you: t("hotel.you"), offline: t("hotel.offlineMap"), loading: t("hotel.mapLoading"), slow: t("hotel.mapSlow"), styles: t("mapStyle.title"), styleNames };
}

function MapButton({ label, active, onClick, children }: { label: string; active?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "grid size-11 place-items-center rounded-full border border-border shadow-soft transition-colors",
        active ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

const headingOf = (f: Fix | null) => ((f?.speed ?? 0) > 1 ? (f?.heading ?? null) : null);

/** All places of a region as numbered points (numbers match the list), with the user's live dot. */
export function ZiyarahOverviewMap({
  items,
  user,
  center,
  onOpen,
  onLocate,
}: {
  items: { id: string; lat: number; lon: number; num: number; label: string }[];
  user: Fix | null;
  center: LatLon;
  onOpen: (id: string) => void;
  onLocate: () => void;
}) {
  const { t, formatNumber } = useI18n();
  const dark = useDarkScheme();
  const labels = useMapLabels();
  const ref = useRef<MapViewHandle>(null);
  const [follow, setFollow] = useState(false);
  const pois: MapPoi[] = useMemo(() => items.map((i) => ({ id: i.id, lat: i.lat, lon: i.lon, kind: "site", num: i.num, numText: formatNumber(i.num), label: i.label })), [items, formatNumber]);
  const fitTo = useMemo(() => items.map((i) => ({ lat: i.lat, lon: i.lon })), [items]);

  return (
    <section className="hc-rise overflow-hidden rounded-2xl border border-border bg-card shadow-soft" aria-labelledby="z-map">
      <div className="space-y-0.5 px-4 pt-3 pb-2">
        <h2 id="z-map" className="font-semibold">
          {t("ziyarah.mapTitle")}
        </h2>
        <p className="text-xs text-muted-foreground">{t("ziyarah.mapHint")}</p>
      </div>
      <div className="relative">
        <MapView
          ref={ref}
          className="h-72 w-full sm:h-96"
          target={null}
          user={user}
          heading={headingOf(user)}
          follow={follow}
          onFollowChange={setFollow}
          initialCenter={center}
          dark={dark}
          labels={labels}
          pois={pois}
          onPoiClick={onOpen}
          fitTo={fitTo}
          prefetch={false}
        />
        <div className="absolute right-2.5 bottom-7 z-10 flex flex-col gap-2">
          <MapButton
            label={t("hotel.recenter")}
            active={follow}
            onClick={() => {
              if (!user) return onLocate();
              setFollow(true);
              ref.current?.centerOn(user, 15);
            }}
          >
            <LocateFixed className="size-5" />
          </MapButton>
          <MapButton label={t("hotel.fitBoth")} onClick={() => ref.current?.fitPoints(fitTo, 15)}>
            <Maximize2 className="size-5" />
          </MapButton>
        </div>
      </div>
    </section>
  );
}

export type TripMode = "walk" | "drive";

/**
 * One place on the map with the road route (on foot or by car) from the user — or from the Haram when
 * location is off — and live tracking: the dot follows the phone, the route shrinks as you go,
 * with remaining distance, time and arrival.
 */
export function ZiyarahTripMap({
  place,
  label,
  originLabel,
  origin,
  user,
  live,
  route,
  mode,
  onMode,
  canWalk,
  tracking,
  onTracking,
  fmtKm,
}: {
  place: LatLon;
  label: string;
  originLabel: string;
  origin: LatLon & { you: boolean };
  user: Fix | null;
  live: ReturnType<typeof useLiveLocation>;
  route: ReturnType<typeof useWalkingRoute>;
  mode: TripMode;
  onMode: (m: TripMode) => void;
  canWalk: boolean;
  tracking: boolean;
  onTracking: (on: boolean) => void;
  fmtKm: (km: number) => string;
}) {
  const { t, formatNumber, intlLocale } = useI18n();
  const dark = useDarkScheme();
  const labels = useMapLabels();
  const ref = useRef<MapViewHandle>(null);
  const [follow, setFollow] = useState(false);
  const r = route.route;
  const prog = tracking && user ? route.progress : null;
  const path = r ? (prog ? remainingPath(r.coordinates, prog) : r.coordinates) : null;
  const far = distanceM(origin, place) > 20_000;

  // Live numbers: along the road when we have it, else the straight line.
  const straightLeft = user ? distanceM(user, place) : null;
  const leftM = prog && r ? prog.remainingM + Math.min(prog.offRouteM, 200) : straightLeft;
  const leftMin =
    leftM === null
      ? null
      : mode === "walk"
        ? walkingMinutes(leftM)
        : r && r.distance > 0
          ? withTraffic(leftM / 1000, (r.duration * (leftM / r.distance)) / 60)
          : Math.max(1, Math.round((leftM / 1000 / 40) * 60));
  const arrived = user && straightLeft !== null && straightLeft <= Math.max(50, arrivalRadius(user.accuracy));
  const arriveAt = leftMin !== null && user ? new Intl.DateTimeFormat(intlLocale, { hour: "numeric", minute: "2-digit" }).format(new Date(user.time + leftMin * 60_000)) : null;

  const start = () => {
    live.start();
    onTracking(true);
    setFollow(true);
    if (user) ref.current?.centerOn(user, mode === "drive" ? 15 : 17);
  };
  const stop = () => {
    onTracking(false);
    setFollow(false);
    ref.current?.fitBoth();
  };

  // First fix after pressing start: jump to the user.
  const hadUser = useRef(Boolean(user));
  useEffect(() => {
    if (user && !hadUser.current && tracking) ref.current?.centerOn(user, mode === "drive" ? 15 : 17);
    hadUser.current = Boolean(user);
  }, [user, tracking, mode]);

  const fitTo = useMemo(() => [place, { lat: origin.lat, lon: origin.lon }], [place, origin.lat, origin.lon]);

  return (
    <section className="hc-rise space-y-3 overflow-hidden rounded-2xl border border-border bg-card shadow-soft" style={{ animationDelay: "60ms" }} aria-label={t("ziyarah.liveTitle")}>
      <div className="relative">
        <MapView
          ref={ref}
          className="h-[46vh] min-h-[280px] w-full sm:h-[420px]"
          target={{ ...place, label }}
          targetIcon="flag"
          user={user}
          heading={headingOf(user)}
          follow={follow}
          onFollowChange={setFollow}
          route={path}
          altRoutes={tracking ? undefined : route.routes.flatMap((x, i) => (i === route.choice ? [] : [{ index: i, coords: x.coordinates }]))}
          onAltRouteClick={route.choose}
          initialCenter={place}
          dark={dark}
          labels={labels}
          fitTo={tracking ? undefined : fitTo}
          prefetch={!far}
        />
        <div className="absolute right-2.5 bottom-7 z-10 flex flex-col gap-2">
          <MapButton
            label={t("hotel.recenter")}
            active={follow}
            onClick={() => {
              if (!user) return start();
              setFollow(true);
              ref.current?.centerOn(user, mode === "drive" ? 15 : 17);
            }}
          >
            <LocateFixed className="size-5" />
          </MapButton>
          <MapButton label={t("hotel.fitBoth")} onClick={() => ref.current?.fitPoints([place, user ?? origin], 17)}>
            <Maximize2 className="size-5" />
          </MapButton>
        </div>
        {tracking && user ? (
          <p className="absolute top-2.5 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold whitespace-nowrap text-primary-foreground shadow-soft">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-white/80" />
              <span className="relative inline-flex size-2 rounded-full bg-white" />
            </span>
            {t("ziyarah.liveOn")}
          </p>
        ) : null}
      </div>

      <div className="space-y-3 px-4 pb-4">
        {/* walk / drive */}
        <div role="radiogroup" aria-label={t("ziyarah.gettingThere")} className="grid grid-cols-2 gap-2">
          {(["walk", "drive"] as const).map((m) => {
            const on = mode === m;
            const disabled = m === "walk" && !canWalk;
            const Icon = m === "walk" ? Footprints : Car;
            return (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={on}
                disabled={disabled}
                onClick={() => onMode(m)}
                className={cn(
                  "flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-medium transition-colors disabled:opacity-50",
                  on ? "border-primary bg-primary-soft text-primary" : "border-border bg-card text-muted-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden />
                {m === "walk" ? t("ziyarah.modeWalk") : t("ziyarah.modeDrive")}
                {disabled ? <span className="text-[10px]">· {t("ziyarah.tooFarWalk")}</span> : null}
              </button>
            );
          })}
        </div>

        {/* road route summary (or why there is none) */}
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {route.status === "loading" ? t("ziyarah.routeLoading") : null}
          {(route.status === "unavailable" || route.status === "offline") && !r ? t("ziyarah.routeUnavailable") : null}
          {r ? (
            <>
              <span className="font-medium text-foreground">{t("ziyarah.routeFrom", { from: originLabel })}</span>
              {": "}
              {t("ziyarah.byRoad", { km: fmtKm(r.distance / 1000) })} ·{" "}
              {t("ziyarah.roadTime", {
                min: formatNumber(mode === "walk" ? walkingMinutes(r.distance) : withTraffic(r.distance / 1000, r.duration / 60)),
              })}
            </>
          ) : null}
        </p>

        {route.routes.length > 1 && !tracking ? (
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={mode === "walk" ? t("walk.paths") : t("ziyarah.drivePaths")}>
            {route.routes.map((x, i) => {
              const on = i === route.choice;
              const min = mode === "walk" ? walkingMinutes(x.distance) : withTraffic(x.distance / 1000, x.duration / 60);
              return (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => route.choose(i)}
                  className={cn(
                    "inline-flex min-h-10 items-center gap-2 rounded-full border px-3 text-xs font-medium",
                    on ? "border-primary bg-primary-soft text-primary" : "border-border bg-card text-muted-foreground",
                  )}
                >
                  <span className={cn("grid size-6 place-items-center rounded-full text-[11px] font-bold", on ? "bg-[#2f7cf6] text-white" : "bg-muted")}>{String.fromCharCode(65 + i)}</span>
                  {fmtKm(x.distance / 1000)} · {t("walk.minutes", { n: formatNumber(min) })}
                </button>
              );
            })}
          </div>
        ) : null}

        {/* live tracking */}
        {tracking ? (
          <div className="space-y-2 rounded-2xl border border-primary/30 bg-primary-soft/40 p-3">
            {arrived ? (
              <p className="text-center font-semibold text-primary">✅ {t("hotel.arrived")}</p>
            ) : user && leftM !== null && leftMin !== null ? (
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[11px] text-muted-foreground">{t("ziyarah.remaining")}</p>
                  <p className="text-lg font-semibold tabular-nums">{fmtKm(leftM / 1000)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">{t("ziyarah.timeLeft")}</p>
                  <p className="text-lg font-semibold tabular-nums">{t("walk.minutes", { n: formatNumber(leftMin) })}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">{t("ziyarah.liveTitle")}</p>
                  <p className="text-sm font-semibold tabular-nums">{arriveAt ? t("ziyarah.arriveAt", { time: arriveAt }) : "—"}</p>
                </div>
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                {live.status === "denied" ? t("haramMap.denied") : live.status === "unavailable" ? t("haramMap.unavailable") : t("haramMap.locating")}
              </p>
            )}
            {user ? <p className="text-center text-[11px] text-muted-foreground">{t("hotel.accuracy", { m: formatNumber(Math.round(user.accuracy)) })}</p> : null}
            <button
              type="button"
              onClick={stop}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-semibold"
            >
              <Square className="size-4" aria-hidden />
              {t("ziyarah.liveStop")}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={start}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft"
          >
            <Radio className="size-4" aria-hidden />
            {t("ziyarah.liveStart")}
          </button>
        )}

        <p className="text-[11px] text-muted-foreground">
          {t("ziyarah.liveNote")}
          {r ? (
            <>
              {" "}
              <a href={r.source.url} target="_blank" rel="noopener noreferrer" className="underline">
                {t("ziyarah.routeSource", { name: r.source.name })}
              </a>
            </>
          ) : null}
        </p>
      </div>
    </section>
  );
}
