"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Accessibility, Crosshair, DoorOpen, ExternalLink, Footprints, Info, Navigation, Route, Search, Trash2, X } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { usePrefs } from "@/components/providers/preferences-provider";
import { Badge, Card, SectionHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented";
import { SkeletonList, UnavailableNotice } from "@/components/ui/states";
import { MapView, type MapPoi, type MapViewHandle } from "@/components/places/map-view";
import { useLiveLocation } from "@/hooks/use-geolocation";
import { useCompass } from "@/hooks/use-compass";
import { useIsDark } from "@/hooks/use-is-dark";
import { useWalkingRoute } from "@/hooks/use-walking-route";
import { LOCATIONS, type LocationId } from "@/config/locations";
import { bearingDeg, distanceM, remainingPath, walkingMinutes, type LatLon } from "@/features/places/geo";
import { apiGet } from "@/services/api-client";
import { cn } from "@/lib/utils";
import type { TKey } from "@/i18n";

const PoiSchema = z.object({
  id: z.string(),
  kind: z.enum(["gate", "toilets", "water", "zamzam", "medical", "landmark"]),
  lat: z.number(),
  lon: z.number(),
  name: z.string().optional(),
  nameEn: z.string().optional(),
  nameAr: z.string().optional(),
  num: z.number().optional(),
  role: z.enum(["main", "entrance", "exit", "emergency", "service"]).optional(),
  restricted: z.boolean().optional(),
  wheelchair: z.enum(["yes", "no", "limited"]).optional(),
  gender: z.enum(["male", "female"]).optional(),
  landmark: z.enum(["kaaba", "maqam", "blackstone", "safa", "marwah", "zamzam", "rawdah", "greenDome", "baqi", "mosque"]).optional(),
  onMosque: z.boolean().optional(),
});
const DataSchema = z.object({ location: z.enum(["makkah", "madinah"]), pois: z.array(PoiSchema), source: z.string(), fetchedAt: z.string() });
type Poi = z.infer<typeof PoiSchema>;
type Layer = "gate" | "toilets" | "water" | "medical" | "landmark";

const LAYERS: { key: Layer; label: TKey; dot: string }[] = [
  { key: "gate", label: "haramMap.kGate", dot: "#b8891f" },
  { key: "landmark", label: "haramMap.kLandmark", dot: "#0f5c45" },
  { key: "toilets", label: "haramMap.kToilets", dot: "#2f7cf6" },
  { key: "water", label: "haramMap.kWater", dot: "#0ea5a4" },
  { key: "medical", label: "haramMap.kMedical", dot: "#dc2626" },
];
const layerOf = (p: Poi): Layer => (p.kind === "zamzam" ? "water" : p.kind);

/** Rules shown per city, each with its source. */
const RULES: Record<LocationId, { key: TKey; extra?: TKey[]; src: { label: string; url: string }[] }[]> = {
  makkah: [
    { key: "haramMap.mk_mataf", src: [{ label: "The Islamic Information, 1 Jul 2024", url: "https://theislamicinformation.com/news/only-pilgrims-wearing-ihram-can-enter-into-mataaf/" }] },
    { key: "haramMap.mk_mataf_only", src: [{ label: "Saudi Press Agency, 25 May 2025", url: "https://www.spa.gov.sa/en/N2325213" }] },
    { key: "haramMap.mk_gates", src: [{ label: "Saudi Press Agency, 25 May 2025", url: "https://www.spa.gov.sa/en/N2325213" }] },
  ],
  madinah: [
    {
      key: "haramMap.md_rawdah",
      extra: ["haramMap.md_rawdah_men", "haramMap.md_rawdah_women", "haramMap.md_rawdah_asof"],
      src: [{ label: "ProPakistani, 25 May 2026", url: "https://propakistani.pk/2026/05/25/saudi-arabia-announces-new-visiting-schedule-for-masjid-e-nabawi/" }],
    },
    { key: "haramMap.md_baqi", src: [{ label: "Visit Madinah (official)", url: "https://visitmadinahsa.com/sa-en/destinations/Baqi'-Al-Gharqad-" }] },
  ],
};

function usePoiText() {
  const { t, locale, formatNumber } = useI18n();
  return useMemo(() => {
    const name = (p: Poi) => (locale === "ar" || locale === "ur" ? (p.nameAr ?? p.name) : (p.nameEn ?? p.name)) ?? undefined;
    const title = (p: Poi): string => {
      if (p.kind === "landmark" && p.landmark) return t(`haramMap.l_${p.landmark}`);
      if (p.kind === "gate") {
        const n = name(p);
        const num = p.num !== undefined ? t("haramMap.gate", { n: formatNumber(p.num) }) : null;
        return [num, n && !(num && n.match(/^\D*\d+\D*$/)) ? n : null].filter(Boolean).join(" · ") || t("haramMap.gateNoNum");
      }
      return name(p) ?? t(p.kind === "landmark" ? "haramMap.kLandmark" : `haramMap.${p.kind}`);
    };
    const kindLabel = (p: Poi) => (p.kind === "gate" ? t(`haramMap.${p.role ?? "entrance"}`) : p.kind === "landmark" ? t("haramMap.kLandmark") : t(`haramMap.${p.kind}`));
    return { title, kindLabel, name };
  }, [t, locale, formatNumber]);
}

function useFmt() {
  const { intlLocale } = useI18n();
  return useMemo(() => {
    const unit = (n: number, u: "meter" | "kilometer", d = 0) => new Intl.NumberFormat(intlLocale, { style: "unit", unit: u, unitDisplay: "short", maximumFractionDigits: d }).format(n);
    return (m: number) => (m < 1000 ? unit(Math.max(5, Math.round(m / 5) * 5), "meter") : unit(m / 1000, "kilometer", 2));
  }, [intlLocale]);
}

/** Arrow pointing to the target, relative to where the phone faces (or to North without a compass). */
function DirectionArrow({ bearing, heading }: { bearing: number; heading: number | null }) {
  const rot = heading === null ? bearing : bearing - heading;
  return (
    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
      <Navigation className="size-6 transition-transform duration-300" style={{ transform: `rotate(${rot - 45}deg)` }} aria-hidden />
    </span>
  );
}

export function HaramMapPage() {
  const { t, formatNumber } = useI18n();
  const prefLoc = usePrefs((s) => s.location);
  const [loc, setLoc] = useState<LocationId>(prefLoc);
  const center = LOCATIONS[loc];
  const dark = useIsDark();
  const text = usePoiText();
  const fmt = useFmt();

  const data = useQuery({
    queryKey: ["haram-map", loc],
    queryFn: ({ signal }) => apiGet(`/api/haram-map?loc=${loc}`, DataSchema, { signal, timeoutMs: 45_000 }),
    staleTime: 6 * 3_600_000,
    retry: 1,
  });

  const [layers, setLayers] = useState<Record<Layer, boolean>>({ gate: true, landmark: true, toilets: false, water: false, medical: false });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [routeOn, setRouteOn] = useState(false);
  const [follow, setFollow] = useState(false);
  const [query, setQuery] = useState("");
  const [sortNear, setSortNear] = useState(true);
  const mapRef = useRef<MapViewHandle>(null);

  const live = useLiveLocation();
  const compass = useCompass();
  const fix = live.fix;

  // Path walked while this page is open (kept on the device, in memory only).
  const [trail, setTrail] = useState<[number, number][]>([]);
  const [walked, setWalked] = useState(0);
  useEffect(() => {
    if (!fix || fix.accuracy > 35) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- append each accepted GPS fix to the trail
    setTrail((tr) => {
      const last = tr[tr.length - 1];
      if (last) {
        const d = distanceM({ lat: last[1], lon: last[0] }, fix);
        if (d < 4) return tr;
        setWalked((w) => w + d);
      }
      return [...tr.slice(-1999), [fix.lon, fix.lat]];
    });
  }, [fix]);

  const pois = useMemo(() => (data.data?.location === loc ? data.data.pois : []), [data.data, loc]);
  const shown = useMemo(() => pois.filter((p) => layers[layerOf(p)]), [pois, layers]);
  const selected = pois.find((p) => p.id === selectedId) ?? null;
  const mapPois: MapPoi[] = useMemo(
    () => shown.map((p) => ({ id: p.id, lat: p.lat, lon: p.lon, kind: p.kind === "zamzam" ? "water" : p.kind, num: p.num, muted: Boolean(p.restricted) })),
    [shown],
  );

  const walk = useWalkingRoute(fix, routeOn && selected ? selected : null, routeOn && Boolean(selected));
  const routePath = walk.route ? (walk.progress ? remainingPath(walk.route.coordinates, walk.progress) : walk.route.coordinates) : null;

  const gates = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = pois.filter((p) => p.kind === "gate").filter((p) => !q || [text.title(p), p.name, p.nameEn, p.nameAr, String(p.num ?? "")].some((s) => s?.toLowerCase().includes(q)));
    return list
      .map((p) => ({ p, d: fix ? distanceM(fix, p) : null }))
      .sort((a, b) => (sortNear && a.d !== null && b.d !== null ? a.d - b.d : (a.p.num ?? 9999) - (b.p.num ?? 9999)));
  }, [pois, query, fix, sortNear, text]);

  const select = (id: string) => {
    setSelectedId(id);
    setRouteOn(false);
    setFollow(false);
    const p = pois.find((x) => x.id === id);
    if (p) mapRef.current?.centerOn(p, 17.5);
  };

  const switchLoc = (l: LocationId) => {
    setLoc(l);
    setSelectedId(null);
    setRouteOn(false);
    setFollow(false);
    mapRef.current?.centerOn({ lat: LOCATIONS[l].latitude, lon: LOCATIONS[l].longitude }, 16);
  };

  const locate = () => {
    if (live.status !== "tracking") live.start();
    if (compass.state === "off") void compass.start();
    setFollow(true);
  };

  const distTo = (p: LatLon) => (fix ? distanceM(fix, p) : null);
  const selDist = selected ? distTo(selected) : null;

  return (
    <div className="space-y-5">
      <SegmentedControl<LocationId>
        label={t("haramMap.title")}
        value={loc}
        onChange={switchLoc}
        options={[
          { value: "makkah", label: `🕋 ${t("location.makkah")}` },
          { value: "madinah", label: `🕌 ${t("location.madinah")}` },
        ]}
      />

      {/* layer chips */}
      <div role="group" aria-label={t("haramMap.layers")} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {LAYERS.map((l) => {
          const on = layers[l.key];
          return (
            <button
              key={l.key}
              type="button"
              aria-pressed={on}
              onClick={() => setLayers((s) => ({ ...s, [l.key]: !s[l.key] }))}
              className={cn(
                "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors",
                on ? "border-primary bg-primary-soft text-primary" : "border-border bg-card text-muted-foreground",
              )}
            >
              <span className="size-2.5 rounded-full ring-2 ring-white/80" style={{ background: l.dot, opacity: on ? 1 : 0.45 }} aria-hidden />
              {t(l.label)}
            </button>
          );
        })}
      </div>

      <Card className="overflow-hidden p-0">
        <div className="relative">
          <MapView
            ref={mapRef}
            key={loc}
            className="h-[58vh] min-h-[320px] w-full lg:h-[34rem]"
            initialCenter={{ lat: center.latitude, lon: center.longitude }}
            target={selected ? { lat: selected.lat, lon: selected.lon, label: text.title(selected) } : null}
            targetIcon="flag"
            user={fix}
            heading={compass.heading ?? fix?.heading ?? null}
            follow={follow}
            onFollowChange={setFollow}
            route={routeOn ? routePath : null}
            pois={mapPois}
            selectedPoi={selectedId}
            onPoiClick={select}
            trail={trail}
            dark={dark}
            labels={{ map: t("haramMap.title"), you: t("hotel.you"), offline: t("hotel.offlineMap"), loading: t("hotel.mapLoading") }}
          />
          {/* floating controls */}
          <div className="pointer-events-none absolute inset-x-3 bottom-9 flex items-end justify-between gap-2">
            <div className="pointer-events-auto flex flex-col gap-2">
              {trail.length > 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setTrail(fix ? [[fix.lon, fix.lat]] : []);
                    setWalked(0);
                  }}
                  className="inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-full bg-card/95 px-3 text-xs font-medium shadow-soft ring-1 ring-border backdrop-blur"
                >
                  <Trash2 className="size-4" aria-hidden />
                  {t("haramMap.trailClear")}
                </button>
              ) : null}
            </div>
            <button
              type="button"
              onClick={locate}
              aria-pressed={follow}
              className={cn(
                "pointer-events-auto inline-flex min-h-12 items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-semibold shadow-lg ring-1 transition-colors",
                follow ? "bg-primary text-primary-foreground ring-primary" : "bg-card/95 text-foreground ring-border backdrop-blur",
              )}
            >
              <Crosshair className="size-5" aria-hidden />
              {follow && fix ? t("haramMap.following") : live.status === "tracking" ? t("haramMap.follow") : t("haramMap.locate")}
            </button>
          </div>
        </div>

        {/* live status */}
        {live.status !== "idle" ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
            {live.status === "requesting" ? <span>{t("haramMap.locating")}</span> : null}
            {live.status === "denied" ? <span className="text-danger">{t("haramMap.denied")}</span> : null}
            {live.status === "unavailable" ? <span>{t("haramMap.unavailable")}</span> : null}
            {fix ? (
              <>
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-[#2f7cf6]" aria-hidden />
                  {t("haramMap.accuracy", { m: formatNumber(Math.round(fix.accuracy)) })}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Footprints className="size-3.5" aria-hidden />
                  {t("haramMap.walked", { d: fmt(walked) })}
                </span>
              </>
            ) : null}
            <span className="ms-auto">{t("haramMap.privacy")}</span>
          </div>
        ) : null}
      </Card>

      {/* selected place */}
      {selected ? (
        <Card className="space-y-3">
          <div className="flex items-start gap-3">
            {selDist !== null ? <DirectionArrow bearing={bearingDeg(fix!, selected)} heading={compass.heading ?? fix?.heading ?? null} /> : null}
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold leading-snug">{text.title(selected)}</h2>
              {selected.kind === "gate" && text.name(selected) && text.name(selected) !== text.title(selected) ? (
                <p className="text-sm text-muted-foreground" dir="auto">
                  {selected.nameAr && selected.nameAr !== text.name(selected) ? selected.nameAr : null}
                </p>
              ) : null}
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <Badge tone={selected.restricted ? "danger" : "primary"}>{text.kindLabel(selected)}</Badge>
                {selected.restricted && selected.role !== "emergency" && selected.role !== "service" ? <Badge tone="danger">{t("haramMap.restricted")}</Badge> : null}
                {selected.wheelchair === "yes" || selected.wheelchair === "limited" ? (
                  <Badge>
                    <Accessibility className="me-1 inline size-3.5" aria-hidden />
                    {t("haramMap.wheelchair")}
                  </Badge>
                ) : null}
                {selected.gender ? <Badge>{t(selected.gender === "female" ? "haramMap.women" : "haramMap.men")}</Badge> : null}
              </div>
              {selDist !== null ? (
                <p className="mt-2 text-sm">{t("haramMap.distance", { d: fmt(selDist), min: formatNumber(Math.max(1, Math.round(walkingMinutes(selDist)))) })}</p>
              ) : null}
            </div>
            <button type="button" onClick={() => setSelectedId(null)} className="grid size-10 place-items-center rounded-full hover:bg-muted" aria-label={t("haramMap.close")}>
              <X className="size-5" aria-hidden />
            </button>
          </div>
          {!selected.restricted ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={routeOn ? "outline" : "primary"}
                onClick={() => {
                  if (!fix) locate();
                  setRouteOn((r) => !r);
                }}
              >
                <Route className="size-4" aria-hidden />
                {routeOn ? t("haramMap.routeHide") : t("haramMap.route")}
              </Button>
              {routeOn ? <p className="text-xs text-muted-foreground">{t("haramMap.routeNote")}</p> : null}
            </div>
          ) : null}
        </Card>
      ) : null}

      {data.isPending ? <SkeletonList rows={3} /> : null}
      {data.isError ? (
        <div className="space-y-2">
          <UnavailableNotice message={t("haramMap.unavailableData")} />
          <Button size="sm" variant="outline" onClick={() => data.refetch()}>
            {t("haramMap.retry")}
          </Button>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        {/* gate list */}
        {data.data ? (
          <section>
            <SectionHeader
              title={`${t("haramMap.listGates")} (${formatNumber(gates.length)})`}
              action={
                fix ? (
                  <SegmentedControl<"near" | "num">
                    size="sm"
                    label={t("haramMap.listGates")}
                    value={sortNear ? "near" : "num"}
                    onChange={(v) => setSortNear(v === "near")}
                    options={[
                      { value: "near", label: t("haramMap.nearest") },
                      { value: "num", label: t("haramMap.byNumber") },
                    ]}
                  />
                ) : undefined
              }
            />
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("haramMap.searchGates")}
                aria-label={t("haramMap.searchGates")}
                className="h-11 w-full rounded-xl border border-border bg-background ps-9 pe-3 text-sm"
              />
            </div>
            {gates.length ? (
              <ul className="max-h-[28rem] divide-y divide-border overflow-y-auto rounded-2xl border border-border bg-card">
                {gates.map(({ p, d }) => (
                  <li key={p.id}>
                    <button type="button" onClick={() => select(p.id)} className={cn("flex min-h-14 w-full items-center gap-3 px-4 py-2 text-start hover:bg-muted", p.id === selectedId && "bg-primary-soft")}>
                      <span
                        className={cn("grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white", p.restricted ? "bg-[#8a8f98]" : "bg-[#b8891f]")}
                        aria-hidden
                      >
                        {p.num !== undefined ? formatNumber(p.num) : <DoorOpen className="size-4" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{text.title(p)}</span>
                        <span className="block text-xs text-muted-foreground">
                          {text.kindLabel(p)}
                          {p.wheelchair === "yes" ? " · ♿" : ""}
                        </span>
                      </span>
                      {d !== null ? <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{fmt(d)}</span> : null}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{t("haramMap.noGates")}</p>
            )}
          </section>
        ) : null}

        {/* rules */}
        <section className="space-y-3">
          <SectionHeader title={t("haramMap.rulesTitle")} />
          <ul className="space-y-3">
            {RULES[loc].map((r) => (
              <li key={r.key} className="rounded-2xl border border-border bg-card p-4 text-sm leading-relaxed">
                <p>{t(r.key)}</p>
                {r.extra?.map((k) => (
                  <p key={k} className="mt-1.5 text-muted-foreground">
                    {t(k)}
                  </p>
                ))}
                <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                  <span className="text-gold">{t("haramMap.sources")}:</span>
                  {r.src.map((s) => (
                    <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                      {s.label}
                      <ExternalLink className="size-3" aria-hidden />
                    </a>
                  ))}
                </p>
              </li>
            ))}
          </ul>
          <p className="flex items-start gap-2 rounded-2xl bg-gold-soft/50 p-3 text-xs leading-relaxed">
            <Info className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
            <span>
              {t("haramMap.dataNote")}{" "}
              <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                © OpenStreetMap
              </a>
            </span>
          </p>
        </section>
      </div>
    </div>
  );
}
