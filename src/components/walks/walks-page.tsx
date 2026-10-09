"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, ChevronRight, Circle, Footprints, Navigation, Pause, Pencil, Save, Trash2, X } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { usePrefs } from "@/components/providers/preferences-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented";
import { useConfirm } from "@/components/ui/confirm";
import { MapView, type MapViewHandle } from "@/components/places/map-view";
import { useMapStyleNames } from "@/components/places/map-style-names";
import { geolocationGranted, useLiveLocation } from "@/hooks/use-geolocation";
import { useCompass } from "@/hooks/use-compass";
import { useIsDark } from "@/hooks/use-is-dark";
import { useStoreHydrated } from "@/hooks/use-hydrated";
import { LOCATIONS } from "@/config/locations";
import { bearingDeg, distanceM, pointAhead, remainingPath, routeProgress, walkingMinutes } from "@/features/places/geo";
import { addFix, elapsedMs, EMPTY_TRACK, loadTrack, startTrack, stepsFor, stopTrack, TRACK_KEY } from "@/features/places/track";
import { useWalksStore, type SavedWalk } from "@/stores/walks-store";
import { cn } from "@/lib/utils";

/** 3:07 or 1:02:45 */
function clock(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const mm = String(Math.floor((s % 3600) / 60)).padStart(h ? 2 : 1, "0");
  const ss = String(s % 60).padStart(2, "0");
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

function useFmt() {
  const { intlLocale, formatNumber } = useI18n();
  return useMemo(() => {
    const unit = (n: number, u: "meter" | "kilometer", d = 0) => new Intl.NumberFormat(intlLocale, { style: "unit", unit: u, unitDisplay: "short", maximumFractionDigits: d }).format(n);
    return {
      dist: (m: number) => (m < 1000 ? unit(Math.max(0, Math.round(m / 5) * 5), "meter") : unit(m / 1000, "kilometer", 2)),
      date: (ms: number) => new Intl.DateTimeFormat(intlLocale, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(ms),
      n: formatNumber,
      /** 3:07 in the reader's digits. */
      clock: (ms: number) => clock(ms).replace(/\d/g, (d) => formatNumber(Number(d))),
    };
  }, [intlLocale, formatNumber]);
}

function Stat({ label, value, live }: { label: string; value: string; live?: boolean }) {
  return (
    <div className="px-2 py-2.5 text-center">
      <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        {live ? <span className="size-2 animate-pulse rounded-full bg-danger" aria-hidden /> : null}
        {label}
      </p>
      <p className="font-semibold tabular-nums">{value}</p>
    </div>
  );
}

const ID_PARAM = "id";

export function WalksPage() {
  const { t } = useI18n();
  const fmt = useFmt();
  const confirm = useConfirm();
  const location = usePrefs((s) => s.location);
  const dark = useIsDark();
  const styleNames = useMapStyleNames();
  const hydrated = useStoreHydrated(useWalksStore);
  const walks = useWalksStore((s) => s.walks);
  const current = useWalksStore((s) => s.current);
  const { setCurrent, saveCurrent } = useWalksStore.getState();
  const live = useLiveLocation();
  const compass = useCompass();
  const fix = live.fix;
  const mapRef = useRef<MapViewHandle>(null);
  const [follow, setFollow] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const [openId, setOpenId] = useState<string | null>(null);
  const [naming, setNaming] = useState<string | null>(null);
  const opened = walks.find((w) => w.id === openId) ?? null;

  // Open a walk from the address (/walks?id=…), and keep the address in sync so refresh/back work.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get(ID_PARAM);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the address once on mount
    if (id) setOpenId(id);
  }, []);
  const open = (id: string | null) => {
    setOpenId(id);
    window.history.replaceState(null, "", id ? `/walks?${ID_PARAM}=${id}` : "/walks");
    window.scrollTo({ top: 0 });
  };

  // A walk recorded on the Haram Map before this page existed moves here once.
  const migrated = useRef(false);
  useEffect(() => {
    if (!hydrated || migrated.current) return;
    migrated.current = true;
    try {
      const old = loadTrack(localStorage.getItem(TRACK_KEY));
      if (old.points.length > 1 && useWalksStore.getState().current.points.length === 0) setCurrent(() => old);
      localStorage.removeItem(TRACK_KEY);
    } catch {
      /* storage unavailable */
    }
    // Recording or following a walk before the refresh: carry on if location access is already allowed.
    if (useWalksStore.getState().current.on || new URLSearchParams(window.location.search).get(ID_PARAM)) {
      void geolocationGranted().then((ok) => ok && live.start());
    }
  }, [hydrated, setCurrent, live]);

  // Each accepted GPS fix becomes a waypoint while recording.
  useEffect(() => {
    if (fix) setCurrent((c) => addFix(c, fix));
  }, [fix, setCurrent]);
  useEffect(() => {
    if (!current.on) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [current.on]);

  const startLocation = () => {
    if (live.status !== "tracking") live.start();
    if (compass.state === "off") void compass.start();
    setFollow(true);
  };

  const trail = useMemo(() => current.points.map((p) => [p[0], p[1]] as [number, number]), [current.points]);
  const center = LOCATIONS[location];
  const labels = {
    map: t("walks.title"),
    you: t("hotel.you"),
    offline: t("hotel.offlineMap"),
    loading: t("hotel.mapLoading"),
    slow: t("hotel.mapSlow"),
    styles: t("mapStyle.title"),
    styleNames,
  };

  if (opened) {
    return <OpenedWalk walk={opened} onBack={() => open(null)} live={live} compass={compass} startLocation={startLocation} labels={labels} dark={dark} />;
  }

  const defaultName = t("walks.defaultName", { n: fmt.n(walks.length + 1), date: fmt.date(current.points[0]?.[2] ?? now) });
  const recording = current.on || current.points.length > 1;

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden p-0">
        <div className="relative">
          <MapView
            ref={mapRef}
            className="h-[48vh] min-h-[300px] w-full"
            initialCenter={fix ?? { lat: center.latitude, lon: center.longitude }}
            user={fix}
            heading={compass.heading ?? fix?.heading ?? null}
            follow={follow}
            onFollowChange={setFollow}
            trail={trail}
            target={null}
            dark={dark}
            labels={labels}
          />
          <div className="pointer-events-none absolute inset-x-3 bottom-6 flex justify-center">
            <button
              type="button"
              onClick={() => {
                if (current.on) setCurrent((c) => stopTrack(c, Date.now()));
                else {
                  startLocation();
                  setNow(Date.now());
                  setCurrent((c) => startTrack(c, Date.now()));
                }
              }}
              aria-pressed={current.on}
              className={cn(
                "pointer-events-auto inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-sm font-semibold shadow-lg ring-1 transition-colors",
                current.on ? "bg-danger text-white ring-danger" : "bg-card/95 text-foreground ring-border backdrop-blur",
              )}
            >
              {current.on ? <Pause className="size-4" aria-hidden /> : <Circle className="size-4 fill-danger text-danger" aria-hidden />}
              {current.on ? t("haramMap.trackStop") : current.points.length ? t("haramMap.trackResume") : t("walks.start")}
            </button>
          </div>
        </div>

        {recording ? (
          <>
            <div className="grid grid-cols-3 divide-x divide-border border-t border-border rtl:divide-x-reverse" aria-live="polite">
              <Stat label={current.on ? t("haramMap.trackRecording") : t("haramMap.trackPaused")} value={fmt.clock(elapsedMs(current, now))} live={current.on} />
              <Stat label={t("haramMap.trackDistance")} value={fmt.dist(current.walked)} />
              <Stat label={t("haramMap.trackSteps")} value={`≈ ${fmt.n(stepsFor(current.walked))}`} />
            </div>
            {naming !== null ? (
              <form
                className="space-y-2 border-t border-border p-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const id = saveCurrent(naming.trim() || defaultName, location, Date.now());
                  setNaming(null);
                  if (id) open(id);
                }}
              >
                <label className="block text-sm font-medium" htmlFor="walk-name">
                  {t("walks.nameLabel")}
                </label>
                <input
                  id="walk-name"
                  autoFocus
                  value={naming}
                  maxLength={60}
                  placeholder={defaultName}
                  onChange={(e) => setNaming(e.target.value)}
                  dir="auto"
                  className="h-11 w-full rounded-xl border border-border bg-card px-3 text-base"
                />
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    <Check className="size-4" aria-hidden />
                    {t("walks.save")}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setNaming(null)}>
                    {t("hotel.cancel")}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex gap-2 border-t border-border p-3">
                <Button
                  className="flex-1"
                  disabled={current.points.length < 2}
                  onClick={() => {
                    setCurrent((c) => stopTrack(c, Date.now()));
                    setNaming("");
                  }}
                >
                  <Save className="size-4" aria-hidden />
                  {t("walks.saveWalk")}
                </Button>
                <Button
                  variant="ghost"
                  onClick={async () => {
                    if (await confirm({ title: t("haramMap.trackClearTitle"), message: t("haramMap.trackClearMsg"), emoji: "👣", tone: "danger", confirmLabel: t("walks.discard") }))
                      setCurrent(() => EMPTY_TRACK);
                  }}
                >
                  <Trash2 className="size-4" aria-hidden />
                  {t("walks.discard")}
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="border-t border-border px-4 py-3 text-sm text-muted-foreground">{t("walks.intro")}</p>
        )}
      </Card>

      <section className="space-y-3" aria-labelledby="walks-saved">
        <h2 id="walks-saved" className="text-lg font-semibold">
          {t("walks.saved")} {walks.length ? <span className="text-muted-foreground">({fmt.n(walks.length)})</span> : null}
        </h2>
        {hydrated && !walks.length ? <p className="text-sm text-muted-foreground">{t("walks.none")}</p> : null}
        <ul className="space-y-2">
          {walks.map((w) => (
            <li key={w.id}>
              <button type="button" onClick={() => open(w.id)} className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3.5 text-start transition-colors hover:border-gold">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-xl" aria-hidden>
                  👣
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold" dir="auto">
                    {w.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {LOCATIONS[w.loc].icon} {fmt.date(w.createdAt)} · {fmt.dist(w.walked)} · {fmt.clock(w.activeMs)} · ≈ {t("walk.steps", { n: fmt.n(stepsFor(w.walked)) })}
                  </span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground rtl:rotate-180" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      </section>
      <p className="text-xs text-muted-foreground">{t("walks.privacy")}</p>
    </div>
  );
}

function OpenedWalk({
  walk,
  onBack,
  live,
  compass,
  startLocation,
  labels,
  dark,
}: {
  walk: SavedWalk;
  onBack: () => void;
  live: ReturnType<typeof useLiveLocation>;
  compass: ReturnType<typeof useCompass>;
  startLocation: () => void;
  labels: Parameters<typeof MapView>[0]["labels"];
  dark: boolean;
}) {
  const { t } = useI18n();
  const fmt = useFmt();
  const confirm = useConfirm();
  const { update, remove } = useWalksStore.getState();
  const [goTo, setGoTo] = useState<"start" | "end">("start");
  const [follow, setFollow] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(walk.name);
  const [note, setNote] = useState(walk.note ?? "");
  const fix = live.fix;

  const path = useMemo(() => walk.points.map((p) => [p[0], p[1]] as [number, number]), [walk.points]);
  // Follow the path towards the chosen end: reverse it to go back to the start.
  const directed = useMemo(() => (goTo === "end" ? path : [...path].reverse()), [path, goTo]);
  const targetPt = directed[directed.length - 1];
  const target = { lat: targetPt[1], lon: targetPt[0], label: goTo === "start" ? t("walks.startPoint") : t("walks.endPoint") };
  const prog = fix ? routeProgress(directed, fix) : null;
  const offPath = prog ? prog.offRouteM : null;
  const onPath = Boolean(prog && fix && prog.offRouteM <= Math.max(30, fix.accuracy * 1.2));
  const remaining = prog ? prog.offRouteM + prog.remainingM : null;
  const aim = prog && fix ? (onPath ? pointAhead(directed, prog, 25) : prog.snapped) : null;
  const bearing = fix && aim ? bearingDeg(fix, aim) : null;
  const heading = compass.heading ?? fix?.heading ?? null;
  const arrived = fix && distanceM(fix, target) <= Math.max(20, fix.accuracy);

  const mapRef = useRef<MapViewHandle>(null);

  return (
    <div className="space-y-4">
      <button type="button" onClick={onBack} className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-primary">
        <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
        {t("walks.allWalks")}
      </button>

      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold leading-snug" dir="auto">
            {walk.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {LOCATIONS[walk.loc].icon} {fmt.date(walk.createdAt)} · {fmt.dist(walk.walked)} · {fmt.clock(walk.activeMs)} · ≈ {t("walk.steps", { n: fmt.n(stepsFor(walk.walked)) })} ·{" "}
            {t("walks.points", { n: fmt.n(walk.points.length) })}
          </p>
          {walk.note && !editing ? (
            <p className="mt-1 text-sm" dir="auto">
              {walk.note}
            </p>
          ) : null}
        </div>
        <Button size="sm" variant="outline" onClick={() => setEditing((e) => !e)} aria-pressed={editing}>
          <Pencil className="size-4" aria-hidden />
          {t("walks.edit")}
        </Button>
      </div>

      {editing ? (
        <Card className="space-y-3">
          <label className="block space-y-1">
            <span className="text-sm font-medium">{t("walks.nameLabel")}</span>
            <input value={name} maxLength={60} onChange={(e) => setName(e.target.value)} dir="auto" className="h-11 w-full rounded-xl border border-border bg-card px-3 text-base" />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">{t("walks.noteLabel")}</span>
            <textarea value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} dir="auto" placeholder={t("walks.notePlaceholder")} className="h-20 w-full rounded-xl border border-border bg-card px-3 py-2 text-base" />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                update(walk.id, { name, note });
                setEditing(false);
              }}
            >
              <Check className="size-4" aria-hidden />
              {t("walks.save")}
            </Button>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              <X className="size-4" aria-hidden />
              {t("hotel.cancel")}
            </Button>
            <Button
              variant="ghost"
              className="ms-auto text-danger"
              onClick={async () => {
                if (await confirm({ title: t("walks.deleteTitle"), message: t("walks.deleteMsg", { name: walk.name }), emoji: "🗑️", tone: "danger", confirmLabel: t("walks.delete") })) {
                  remove(walk.id);
                  onBack();
                }
              }}
            >
              <Trash2 className="size-4" aria-hidden />
              {t("walks.delete")}
            </Button>
          </div>
        </Card>
      ) : null}

      <SegmentedControl<"start" | "end">
        label={t("walks.goTo")}
        value={goTo}
        onChange={setGoTo}
        options={[
          { value: "start", label: `🟢 ${t("walks.backToStart")}` },
          { value: "end", label: `🏁 ${t("walks.toEnd")}` },
        ]}
      />

      <Card className="overflow-hidden p-0">
        <MapView
          ref={mapRef}
          key={walk.id}
          className="h-[40vh] min-h-[260px] w-full"
          initialCenter={{ lat: path[0][1], lon: path[0][0] }}
          user={fix}
          heading={heading}
          follow={follow}
          onFollowChange={setFollow}
          trail={path}
          route={prog ? remainingPath(directed, prog) : directed}
          target={target}
          targetIcon="flag"
          dark={dark}
          labels={labels}
        />
        <div className="flex items-center gap-4 border-t border-border p-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
            {arrived ? (
              <Check className="size-7" aria-hidden />
            ) : (
              <Navigation
                className={cn("size-7 transition-transform duration-300", bearing === null && "opacity-30")}
                style={{ transform: `rotate(${(bearing === null ? 0 : heading !== null ? bearing - heading : bearing) - 45}deg)` }}
                aria-hidden
              />
            )}
          </span>
          <div className="min-w-0 flex-1" aria-live="polite">
            {arrived ? (
              <p className="font-semibold text-primary">{t("walks.arrived")}</p>
            ) : remaining !== null ? (
              <>
                <p className="text-2xl font-semibold tabular-nums text-gold">{fmt.dist(remaining)}</p>
                <p className="text-sm text-muted-foreground">
                  ≈ {t("walk.minutes", { n: fmt.n(walkingMinutes(remaining)) })} · ≈ {t("walk.steps", { n: fmt.n(stepsFor(remaining)) })}
                </p>
                {offPath !== null && !onPath ? <p className="text-xs text-warning">{t("walks.offPath", { d: fmt.dist(offPath) })}</p> : null}
              </>
            ) : (
              <Button size="sm" onClick={() => (startLocation(), setFollow(true))}>
                <Footprints className="size-4" aria-hidden />
                {t("walks.followPath")}
              </Button>
            )}
          </div>
          {fix ? (
            <Button size="sm" variant={follow ? "primary" : "outline"} onClick={() => setFollow(true)}>
              {t("haramMap.follow")}
            </Button>
          ) : null}
        </div>
      </Card>
      <p className="text-xs text-muted-foreground">{t("walks.followNote")}</p>
    </div>
  );
}
