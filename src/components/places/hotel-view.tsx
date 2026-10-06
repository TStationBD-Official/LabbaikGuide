"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Copy,
  Crosshair,
  ExternalLink,
  Hotel,
  Link2,
  LocateFixed,
  MapPin,
  MapPinned,
  Maximize2,
  Navigation,
  Pencil,
  Phone,
  Plus,
  Share2,
  ShieldCheck,
  Square,
  Trash2,
  Users,
} from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { usePrefs } from "@/components/providers/preferences-provider";
import { Button } from "@/components/ui/button";
import { Card, SectionHeader } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented";
import { Toggle } from "@/components/ui/toggle";
import { UnavailableNotice } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { LOCATIONS } from "@/config/locations";
import {
  arrivalRadius,
  bearingDeg,
  directionsLinks,
  distanceM,
  parseCoordinates,
  pointAhead,
  remainingPath,
  walkingMinutes,
  type Fix,
  type LatLon,
} from "@/features/places/geo";
import { useCompass } from "@/hooks/use-compass";
import { captureLocation, geolocationGranted, useLiveLocation, type CaptureProgress, type GeoStatus } from "@/hooks/use-geolocation";
import { useStoreHydrated } from "@/hooks/use-hydrated";
import { useWakeLock } from "@/hooks/use-wake-lock";
import { useWalkingRoute } from "@/hooks/use-walking-route";
import { cn, copyText, shareOrCopy, vibrate } from "@/lib/utils";
import { usePlacesStore, type Place, type PlaceKind } from "@/stores/places-store";
import type { MapViewHandle } from "./map-view";

const MapView = dynamic(() => import("./map-view").then((m) => m.MapView), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted" />,
});

const KIND_ICON: Record<PlaceKind, typeof Hotel> = { hotel: Hotel, meeting: Users, other: MapPin };

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

/** Re-render every second (for "last update Ns ago"). */
function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

function useFormatters() {
  const { intlLocale, formatNumber } = useI18n();
  return useMemo(() => {
    const unit = (n: number, u: "meter" | "kilometer", digits = 0) =>
      new Intl.NumberFormat(intlLocale, { style: "unit", unit: u, unitDisplay: "short", maximumFractionDigits: digits }).format(n);
    const dist = (m: number) => (m < 1000 ? unit(Math.round(m / 5) * 5 || Math.round(m), "meter") : unit(m / 1000, "kilometer", m < 10_000 ? 2 : 1));
    const date = (t: number) => new Intl.DateTimeFormat(intlLocale, { dateStyle: "medium", timeStyle: "short" }).format(t);
    return { dist, date, n: (x: number) => formatNumber(Math.round(x)) };
  }, [intlLocale, formatNumber]);
}

const statusMessageKey: Partial<Record<GeoStatus, "hotel.gpsDenied" | "hotel.gpsUnavailable" | "hotel.gpsInsecure" | "hotel.gpsUnsupported">> = {
  denied: "hotel.gpsDenied",
  unavailable: "hotel.gpsUnavailable",
  insecure: "hotel.gpsInsecure",
  unsupported: "hotel.gpsUnsupported",
};

type Draft = {
  id: string | null;
  kind: PlaceKind;
  name: string;
  room: string;
  phone: string;
  note: string;
  pos: (LatLon & { accuracy: number | null; source: Place["source"] }) | null;
};

const emptyDraft = (kind: PlaceKind = "hotel"): Draft => ({ id: null, kind, name: "", room: "", phone: "", note: "", pos: null });

export function HotelView() {
  const { t } = useI18n();
  const hydrated = useStoreHydrated(usePlacesStore);
  const places = usePlacesStore((s) => s.places);
  const activeId = usePlacesStore((s) => s.activeId);
  const { add, update, remove, setActive } = usePlacesStore.getState();
  const active = places.find((p) => p.id === activeId) ?? places[0] ?? null;
  const location = usePrefs((s) => s.location);
  const dark = useDarkScheme();
  const toast = useToast();
  const fmt = useFormatters();

  const live = useLiveLocation();
  const compass = useCompass();
  const wake = useWakeLock();
  const mapRef = useRef<MapViewHandle>(null);
  const [follow, setFollow] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [picking, setPicking] = useState(false);
  const [capture, setCapture] = useState<CaptureProgress | null>(null);
  const [captureError, setCaptureError] = useState<GeoStatus | null>(null);
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState(false);
  const captureAbort = useRef<AbortController | null>(null);
  const walk = useWalkingRoute(live.fix, active && !draft ? active : null, Boolean(active) && !draft);
  const routePath = walk.route ? (walk.progress ? remainingPath(walk.route.coordinates, walk.progress) : walk.route.coordinates) : null;

  // Resume tracking automatically if the user already allowed location before.
  useEffect(() => {
    let alive = true;
    geolocationGranted().then((ok) => {
      if (alive && ok) live.start();
    });
    return () => {
      alive = false;
      captureAbort.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  const haram = { lat: LOCATIONS[location].latitude, lon: LOCATIONS[location].longitude };

  // ── create / edit flows ──────────────────────────────────────────────────
  const startCreate = (kind: PlaceKind = places.length ? "meeting" : "hotel") => {
    setDraft(emptyDraft(kind));
    setPicking(false);
    setCaptureError(null);
    setLinkError(false);
    setLink("");
  };

  const startEdit = (p: Place) =>
    setDraft({
      id: p.id,
      kind: p.kind,
      name: p.name,
      room: p.room ?? "",
      phone: p.phone ?? "",
      note: p.note ?? "",
      pos: { lat: p.lat, lon: p.lon, accuracy: p.accuracy, source: p.source },
    });

  const runCapture = async () => {
    setCaptureError(null);
    setCapture({ fixes: 0, best: null, elapsedMs: 0 });
    captureAbort.current?.abort();
    const ctrl = new AbortController();
    captureAbort.current = ctrl;
    try {
      const pos = await captureLocation(setCapture, { signal: ctrl.signal, seed: live.fix });
      vibrate(30);
      setDraft((d) => ({ ...(d ?? emptyDraft()), pos: { ...pos, source: "gps" } }));
      setPicking(false);
      live.start();
    } catch (e) {
      const m = (e as Error).message;
      if (m !== "aborted") setCaptureError((["denied", "insecure", "unsupported"].includes(m) ? m : "unavailable") as GeoStatus);
    } finally {
      setCapture(null);
    }
  };

  const startPick = () => {
    const base = draft?.pos ?? (live.fix ? { lat: live.fix.lat, lon: live.fix.lon } : active ?? haram);
    setDraft((d) => ({ ...(d ?? emptyDraft()), pos: { lat: base.lat, lon: base.lon, accuracy: null, source: "map" } }));
    setPicking(true);
    revealMap();
  };

  /** On phones the controls sit below the map: bring the map into view when it needs a tap. */
  const mapCard = useRef<HTMLDivElement>(null);
  const revealMap = () =>
    requestAnimationFrame(() => mapCard.current?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" }));

  const useLink = () => {
    const p = parseCoordinates(link);
    if (!p) return setLinkError(true);
    setLinkError(false);
    setDraft((d) => ({ ...(d ?? emptyDraft()), pos: { ...p, accuracy: null, source: "link" } }));
    setPicking(true);
    mapRef.current?.centerOn(p, 17);
    revealMap();
  };

  const saveDraft = () => {
    if (!draft?.pos) return;
    const name = draft.name.trim() || t(draft.kind === "hotel" ? "hotel.defaultName" : `hotel.kind.${draft.kind}`);
    const data = {
      kind: draft.kind,
      name,
      lat: draft.pos.lat,
      lon: draft.pos.lon,
      accuracy: draft.pos.accuracy,
      source: draft.pos.source,
      room: draft.room,
      phone: draft.phone,
      note: draft.note,
    };
    if (draft.id) update(draft.id, data);
    else add(data);
    setDraft(null);
    setPicking(false);
    vibrate([20, 40, 20]);
  };

  const target = draft?.pos ?? active;
  const targetLabel = draft ? draft.name || t(`hotel.kind.${draft.kind}`) : (active?.name ?? "");

  if (!hydrated) return <div className="h-[60vh] animate-pulse rounded-2xl bg-muted" />;

  const showEditor = draft !== null || places.length === 0;
  const d = draft ?? emptyDraft();

  return (
    <div className="space-y-5">
      {/* Saved places switcher */}
      {places.length > 0 && !draft ? (
        <div className="-mx-1 flex min-w-0 gap-2 overflow-x-auto px-1 pb-1 [contain:inline-size]">
          {places.map((p) => {
            const Icon = KIND_ICON[p.kind];
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={p.id === active?.id}
                onClick={() => setActive(p.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium whitespace-nowrap",
                  p.id === active?.id ? "border-primary bg-primary-soft text-primary" : "border-border bg-card hover:bg-muted",
                )}
              >
                <Icon className="size-4" aria-hidden />
                {p.name}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => startCreate()}
            className="flex shrink-0 items-center gap-1 rounded-full border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
          >
            <Plus className="size-4" aria-hidden />
            {t("hotel.addPlace")}
          </button>
        </div>
      ) : null}

      {/* Map */}
      <Card className="scroll-mt-28 overflow-hidden p-0" ref={mapCard}>
        <div className="relative">
          <MapView
            ref={mapRef}
            className="h-[52vh] min-h-[300px] w-full sm:h-[460px]"
            target={target ? { lat: target.lat, lon: target.lon, label: targetLabel } : null}
            user={live.fix}
            heading={compass.state === "active" ? compass.heading : (live.fix?.speed ?? 0) > 1 ? (live.fix?.heading ?? null) : null}
            follow={follow}
            onFollowChange={setFollow}
            route={draft ? null : routePath}
            pick={picking && draft?.pos ? { value: draft.pos, onChange: (p) => setDraft((x) => (x ? { ...x, pos: { ...p, accuracy: null, source: "map" } } : x)) } : null}
            initialCenter={haram}
            dark={dark}
            labels={{ map: t("hotel.mapLabel"), you: t("hotel.you"), offline: t("hotel.offlineMap"), loading: t("hotel.mapLoading") }}
          />
          <div className="absolute right-2.5 bottom-9 z-10 flex flex-col gap-2">
            <MapButton
              label={t("hotel.recenter")}
              active={follow}
              onClick={() => {
                if (!live.fix) return live.start();
                setFollow(true);
                mapRef.current?.centerOn(live.fix, 17);
              }}
            >
              <LocateFixed className="size-5" />
            </MapButton>
            <MapButton label={t("hotel.fitBoth")} onClick={() => mapRef.current?.fitBoth()}>
              <Maximize2 className="size-5" />
            </MapButton>
          </div>
          {picking ? (
            <p className="absolute top-2 right-14 left-2 z-10 rounded-xl bg-card/95 px-3 py-2 text-center text-xs font-medium shadow-soft sm:right-auto sm:max-w-sm">
              {t("hotel.dragHint")}
            </p>
          ) : null}
        </div>
      </Card>

      {showEditor ? (
        <Editor
          draft={d}
          setDraft={(fn) => setDraft((x) => fn(x ?? emptyDraft()))}
          firstTime={places.length === 0 && !draft}
          capture={capture}
          captureError={captureError}
          onCapture={runCapture}
          onCancelCapture={() => captureAbort.current?.abort()}
          onPick={startPick}
          picking={picking}
          link={link}
          setLink={setLink}
          linkError={linkError}
          onUseLink={useLink}
          onSave={saveDraft}
          onCancel={places.length ? () => (setDraft(null), setPicking(false)) : null}
          fmtN={fmt.n}
        />
      ) : active ? (
        <>
          <Navigator place={active} live={live} walk={walk} compass={compass} wake={wake} onFollow={() => setFollow(true)} />
          <PlaceDetails
            place={active}
            from={live.fix}
            onEdit={() => startEdit(active)}
            onMove={() => {
              startEdit(active);
              setPicking(true);
              revealMap();
            }}
            onRecapture={() => {
              startEdit(active);
              setTimeout(runCapture, 0);
            }}
            onDelete={() => {
              if (confirm(t("hotel.deleteConfirm"))) remove(active.id);
            }}
            onToast={toast}
          />
        </>
      ) : null}

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        {t("hotel.privacy")}
      </p>
    </div>
  );
}

function MapButton({ label, active, onClick, children }: { label: string; active?: boolean; onClick: () => void; children: React.ReactNode }) {
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

// ──────────────────────────────────────────────────────────────────────────
// Live navigator: arrow, distance, ETA, signal quality.
// ──────────────────────────────────────────────────────────────────────────
function Navigator({
  place,
  live,
  walk,
  compass,
  wake,
  onFollow,
}: {
  place: Place;
  live: ReturnType<typeof useLiveLocation>;
  walk: ReturnType<typeof useWalkingRoute>;
  compass: ReturnType<typeof useCompass>;
  wake: ReturnType<typeof useWakeLock>;
  onFollow: () => void;
}) {
  const { t, formatNumber } = useI18n();
  const fmt = useFormatters();
  const now = useNow();
  const fix = live.fix;
  const straight = fix ? distanceM(fix, place) : null;
  const arrived = fix && straight !== null ? straight <= arrivalRadius(fix.accuracy) : false;
  const { route, progress } = walk;
  // Walking distance along roads: gap to the route + remaining route + route end → door.
  const routeDist =
    route && progress
      ? progress.offRouteM + progress.remainingM + distanceM({ lon: route.coordinates[route.coordinates.length - 1][0], lat: route.coordinates[route.coordinates.length - 1][1] }, place)
      : null;
  const dist = routeDist ?? straight;
  const onRoute = Boolean(progress && fix && progress.offRouteM <= Math.max(35, fix.accuracy * 1.2));
  // Arrow follows the road: aim ~30 m ahead on the route; off-route, aim back at the route; else straight.
  const aim =
    route && progress && fix && straight !== null && straight > 40
      ? onRoute
        ? pointAhead(route.coordinates, progress, 30)
        : progress.snapped
      : place;
  const bearing = fix ? bearingDeg(fix, aim) : null;
  const ageS = fix ? Math.max(0, Math.round((now - fix.time) / 1000)) : 0;
  const stale = fix && ageS > 30;
  const weak = fix && fix.accuracy > 50;
  const heading = compass.state === "active" ? compass.heading : null;
  const rotation = bearing === null ? 0 : heading !== null ? bearing - heading : bearing;
  const arrivedOnce = useRef(false);

  useEffect(() => {
    if (arrived && !arrivedOnce.current) {
      arrivedOnce.current = true;
      vibrate([60, 60, 120]);
    } else if (!arrived && dist !== null && fix && dist > arrivalRadius(fix.accuracy) + 30) arrivedOnce.current = false;
  }, [arrived, dist, fix]);
  const routeMsg =
    walk.status === "loading"
      ? t("hotel.routeLoading")
      : walk.status === "rerouting"
        ? t("hotel.rerouting")
        : walk.status === "offline"
          ? t("hotel.routeOffline")
          : walk.status === "unavailable" && !route
            ? t("hotel.routeUnavailable")
            : null;

  const tracking = live.status === "tracking" || live.status === "requesting";
  const errKey = statusMessageKey[live.status];

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-4">
        {/* Arrow dial */}
        <div className="relative grid size-28 shrink-0 place-items-center rounded-full border border-border bg-primary-soft/60 sm:size-32">
          <span aria-hidden className="absolute inset-0 transition-transform duration-300" style={{ transform: `rotate(${heading !== null ? -heading : 0}deg)` }}>
            <span className="absolute start-1/2 top-1 -translate-x-1/2 text-[10px] font-semibold text-danger rtl:translate-x-1/2">N</span>
          </span>
          {arrived ? (
            <Check className="size-12 text-primary" aria-hidden />
          ) : (
            <Navigation
              aria-hidden
              className={cn("size-14 fill-current text-primary transition-transform duration-300 ease-out", bearing === null && "opacity-30")}
              style={{ transform: `rotate(${rotation - 45}deg)` }}
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{t("hotel.navigatingTo")}</p>
          <p className="truncate font-semibold">{place.name}</p>
          {dist !== null ? (
            <>
              <p className="mt-1 text-3xl font-semibold tabular-nums text-gold [font-feature-settings:'tnum','lnum']" dir="ltr" style={{ textAlign: "start" }}>
                {fmt.dist(dist)}
              </p>
              {!arrived && dist < 30_000 ? (
                <p className="text-sm text-muted-foreground">
                  {t("hotel.walk", { min: formatNumber(walkingMinutes(dist)) })}
                  {routeDist !== null ? ` · ${t("hotel.viaRoads")}` : ""}
                </p>
              ) : null}
            </>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">{tracking ? t("hotel.locating") : "—"}</p>
          )}
        </div>
      </div>

      <div aria-live="polite" className="mt-3 space-y-2">
        {arrived ? <p className="rounded-xl bg-primary-soft px-3 py-2 text-sm font-medium text-primary">{t("hotel.arrived")}</p> : null}
        {dist !== null && dist > 30_000 ? <UnavailableNotice message={t("hotel.farAway", { km: formatNumber(Math.round(dist / 1000)) })} /> : null}
        {weak ? <UnavailableNotice message={t("hotel.weakSignal", { m: fmt.n(fix!.accuracy) })} /> : null}
        {stale ? <p className="text-xs font-medium text-warning">{t("hotel.stale", { s: formatNumber(ageS) })}</p> : null}
        {errKey ? <UnavailableNotice message={t(errKey)} /> : null}
      </div>

      {routeMsg && !arrived ? <p className="mt-2 text-xs font-medium text-primary">{routeMsg}</p> : null}
      {fix && !weak ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {t("hotel.accuracy", { m: fmt.n(fix.accuracy) })} ·{" "}
          {routeDist !== null && straight !== null ? t("hotel.straightIs", { d: fmt.dist(straight) }) : t("hotel.straightLine")}
        </p>
      ) : null}
      {route ? (
        <p className="mt-1 text-[11px] text-muted-foreground">
          {t("hotel.routeSource")}{" "}
          <a href={route.source.url} target="_blank" rel="noopener noreferrer" className="underline">
            {route.source.name}
          </a>{" "}
          ·{" "}
          <a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noopener noreferrer" className="underline">
            {t("hotel.fixMap")}
          </a>
        </p>
      ) : null}

      {bearing !== null && compass.state === "unavailable" ? (
        <p className="mt-2 text-xs text-muted-foreground">{t("hotel.noCompass", { deg: formatNumber(Math.round(bearing)) })}</p>
      ) : null}
      {compass.state === "active" ? <p className="mt-2 text-xs text-muted-foreground">{t("hotel.arrowHint")} {t("hotel.calibrate")}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {tracking ? (
          <Button variant="outline" onClick={live.stop}>
            <Square className="size-4" aria-hidden />
            {t("hotel.stopTracking")}
          </Button>
        ) : (
          <Button
            onClick={() => {
              live.start();
              onFollow();
            }}
          >
            <Crosshair className="size-4" aria-hidden />
            {t("hotel.startTracking")}
          </Button>
        )}
        {compass.state !== "active" ? (
          <Button variant="outline" onClick={compass.start}>
            <Navigation className="size-4" aria-hidden />
            {t("hotel.compassOn")}
          </Button>
        ) : null}
      </div>
      {wake.supported ? (
        <Toggle className="mt-2" compact checked={wake.active} onChange={(v) => (v ? wake.enable() : wake.disable())} label={t("hotel.keepAwake")} />
      ) : null}
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{t("hotel.background")}</p>
    </Card>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Details + actions for the active place.
// ──────────────────────────────────────────────────────────────────────────
function PlaceDetails({
  place,
  from,
  onEdit,
  onMove,
  onRecapture,
  onDelete,
  onToast,
}: {
  place: Place;
  from: Fix | null;
  onEdit: () => void;
  onMove: () => void;
  onRecapture: () => void;
  onDelete: () => void;
  onToast: (m: string) => void;
}) {
  const { t, formatNumber } = useI18n();
  const fmt = useFormatters();
  const links = directionsLinks(place, from);
  const coords = `${place.lat.toFixed(6)}, ${place.lon.toFixed(6)}`;
  const Icon = KIND_ICON[place.kind];
  const via =
    place.source === "gps" && place.accuracy !== null
      ? t("hotel.savedVia.gps", { m: formatNumber(Math.round(place.accuracy)) })
      : t(`hotel.savedVia.${place.source === "link" ? "link" : "map"}`);

  return (
    <section>
      <SectionHeader title={<span className="flex items-center gap-2"><Icon className="size-4 text-gold" aria-hidden />{place.name}</span>} />
      <Card className="space-y-4 p-4">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">{t("hotel.kindLabel")}</dt>
            <dd>{t(`hotel.kind.${place.kind}`)}</dd>
          </div>
          {place.room ? (
            <div>
              <dt className="text-xs text-muted-foreground">{t("hotel.room")}</dt>
              <dd dir="auto">{place.room}</dd>
            </div>
          ) : null}
          {place.phone ? (
            <div>
              <dt className="text-xs text-muted-foreground">{t("hotel.phone")}</dt>
              <dd>
                <a href={`tel:${place.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1 font-medium text-primary" dir="ltr">
                  <Phone className="size-3.5" aria-hidden />
                  {place.phone}
                </a>
              </dd>
            </div>
          ) : null}
          {place.note ? (
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted-foreground">{t("hotel.note")}</dt>
              <dd dir="auto" className="whitespace-pre-line">{place.note}</dd>
            </div>
          ) : null}
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground">{t("hotel.savedAt", { date: fmt.date(place.updatedAt) })}</dt>
            <dd className="text-xs text-muted-foreground">
              <span dir="ltr" className="font-mono">{coords}</span> · {via}
            </dd>
          </div>
        </dl>

        <div>
          <p className="mb-2 text-sm font-medium">{t("hotel.directions")}</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {(["google", "apple", "osm"] as const).map((k) => (
              <a
                key={k}
                href={links[k]}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card/60 px-3 text-sm font-medium hover:bg-muted"
              >
                <ExternalLink className="size-4" aria-hidden />
                {t(`hotel.${k}`)}
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const r = await shareOrCopy({
                title: place.name,
                text: [t("hotel.shareText", { name: place.name }), place.room ? t("hotel.roomShort", { room: place.room }) : "", place.note ?? "", coords]
                  .filter(Boolean)
                  .join("\n"),
                url: `https://www.google.com/maps/search/?api=1&query=${place.lat.toFixed(6)},${place.lon.toFixed(6)}`,
              });
              if (r === "copied") onToast(t("hotel.copied"));
            }}
          >
            <Share2 className="size-4" aria-hidden />
            {t("hotel.share")}
          </Button>
          <Button variant="outline" size="sm" onClick={async () => (await copyText(coords)) && onToast(t("hotel.copied"))}>
            <Copy className="size-4" aria-hidden />
            {t("hotel.copy")}
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="size-4" aria-hidden />
            {t("hotel.edit")}
          </Button>
          <Button variant="outline" size="sm" onClick={onMove}>
            <MapPinned className="size-4" aria-hidden />
            {t("hotel.moveOnMap")}
          </Button>
          <Button variant="outline" size="sm" onClick={onRecapture}>
            <Crosshair className="size-4" aria-hidden />
            {t("hotel.relocate")}
          </Button>
          <Button variant="ghost" size="sm" className="text-danger" onClick={onDelete}>
            <Trash2 className="size-4" aria-hidden />
            {t("hotel.delete")}
          </Button>
        </div>
      </Card>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Create / edit form.
// ──────────────────────────────────────────────────────────────────────────
function Editor({
  draft,
  setDraft,
  firstTime,
  capture,
  captureError,
  onCapture,
  onCancelCapture,
  onPick,
  picking,
  link,
  setLink,
  linkError,
  onUseLink,
  onSave,
  onCancel,
  fmtN,
}: {
  draft: Draft;
  setDraft: (fn: (d: Draft) => Draft) => void;
  firstTime: boolean;
  capture: CaptureProgress | null;
  captureError: GeoStatus | null;
  onCapture: () => void;
  onCancelCapture: () => void;
  onPick: () => void;
  picking: boolean;
  link: string;
  setLink: (s: string) => void;
  linkError: boolean;
  onUseLink: () => void;
  onSave: () => void;
  onCancel: (() => void) | null;
  fmtN: (n: number) => string;
}) {
  const { t, formatNumber } = useI18n();
  const errKey = captureError ? statusMessageKey[captureError] : undefined;
  const input = "h-11 w-full rounded-xl border border-border bg-card px-3 text-base";

  return (
    <Card className="space-y-4 p-4 sm:p-5">
      {firstTime ? (
        <div>
          <p className="font-semibold">{t("hotel.emptyTitle")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("hotel.emptyBody")}</p>
        </div>
      ) : null}

      {/* 1. Where */}
      <div className="space-y-2">
        {capture ? (
          <div className="rounded-xl border border-primary/40 bg-primary-soft p-3" aria-live="polite">
            <p className="flex items-center gap-2 text-sm font-medium text-primary">
              <span className="size-2.5 animate-ping rounded-full bg-primary" aria-hidden />
              {t("hotel.capturing")}
            </p>
            {capture.best !== null ? (
              <p className="mt-1 text-xs text-muted-foreground">{t("hotel.captureProgress", { n: formatNumber(capture.fixes), m: fmtN(capture.best) })}</p>
            ) : null}
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${Math.min(100, (capture.elapsedMs / 15_000) * 100)}%` }} />
            </div>
            <Button variant="ghost" size="sm" className="mt-2" onClick={onCancelCapture}>
              {t("hotel.cancel")}
            </Button>
          </div>
        ) : (
          <>
            <Button size="lg" className="w-full" onClick={onCapture}>
              <Crosshair className="size-5" aria-hidden />
              {t("hotel.saveGps")}
            </Button>
            <p className="text-xs text-muted-foreground">{t("hotel.saveGpsHint")}</p>
            {errKey ? <UnavailableNotice message={t(errKey)} /> : null}
            <Button variant="outline" className="w-full" onClick={onPick} aria-pressed={picking}>
              <MapPinned className="size-4" aria-hidden />
              {t("hotel.pickOnMap")}
            </Button>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground" htmlFor="hc-link">
                {t("hotel.pasteLink")}
              </label>
              <div className="flex gap-2">
                <input
                  id="hc-link"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder={t("hotel.pastePlaceholder")}
                  inputMode="url"
                  autoComplete="off"
                  dir="ltr"
                  className={cn(input, "min-w-0 flex-1 text-sm")}
                />
                <Button variant="outline" onClick={onUseLink} disabled={!link.trim()}>
                  <Link2 className="size-4" aria-hidden />
                  {t("hotel.useLink")}
                </Button>
              </div>
              {linkError ? <p className="mt-1 text-xs text-danger">{t("hotel.invalidLink")}</p> : null}
            </div>
          </>
        )}
        {draft.pos ? (
          <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
            <Check className="size-4" aria-hidden />
            <span dir="ltr" className="font-mono">
              {draft.pos.lat.toFixed(6)}, {draft.pos.lon.toFixed(6)}
            </span>
            {draft.pos.accuracy !== null ? <span>· ±{fmtN(draft.pos.accuracy)}</span> : null}
          </p>
        ) : null}
      </div>

      {/* 2. Details */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <SegmentedControl
            label={t("hotel.kindLabel")}
            value={draft.kind}
            onChange={(kind) => setDraft((d) => ({ ...d, kind }))}
            options={(["hotel", "meeting", "other"] as const).map((k) => ({ value: k, label: t(`hotel.kind.${k}`) }))}
            size="sm"
          />
        </div>
        <Field label={t("hotel.name")} className="sm:col-span-2">
          <input
            className={input}
            value={draft.name}
            maxLength={80}
            placeholder={t("hotel.namePlaceholder")}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            dir="auto"
          />
        </Field>
        <Field label={t("hotel.room")}>
          <input className={input} value={draft.room} maxLength={30} onChange={(e) => setDraft((d) => ({ ...d, room: e.target.value }))} dir="auto" />
        </Field>
        <Field label={t("hotel.phone")}>
          <input
            className={input}
            value={draft.phone}
            maxLength={30}
            type="tel"
            inputMode="tel"
            dir="ltr"
            onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
          />
        </Field>
        <Field label={t("hotel.note")} className="sm:col-span-2">
          <textarea
            className={cn(input, "h-20 py-2")}
            value={draft.note}
            maxLength={300}
            placeholder={t("hotel.notePlaceholder")}
            onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
            dir="auto"
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={onSave} disabled={!draft.pos || Boolean(capture)}>
          <Check className="size-4" aria-hidden />
          {t("hotel.save")}
        </Button>
        {onCancel ? (
          <Button variant="ghost" onClick={onCancel}>
            {t("hotel.cancel")}
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
