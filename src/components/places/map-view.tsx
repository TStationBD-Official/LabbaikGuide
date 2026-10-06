"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { GeoJSONSource, Map as MlMap, Marker, StyleSpecification } from "maplibre-gl";
import { circleRing, tilesForArea, type Fix, type LatLon } from "@/features/places/geo";

type MapLib = typeof import("maplibre-gl");

/** OpenFreeMap: free OpenStreetMap vector tiles, no API key, no usage limits. */
const STYLE_URL = { light: "https://tiles.openfreemap.org/styles/liberty", dark: "https://tiles.openfreemap.org/styles/dark" };

/** Fallback if OpenFreeMap is unreachable: standard OpenStreetMap raster tiles. */
const OSM_RASTER: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      maxzoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

export type MapViewHandle = {
  /** Show both the user and the target. */
  fitBoth: () => void;
  centerOn: (p: LatLon, zoom?: number) => void;
};

export type MapViewProps = {
  target: (LatLon & { label: string }) | null;
  user: Fix | null;
  heading: number | null;
  follow: boolean;
  onFollowChange: (follow: boolean) => void;
  /** When set, the target marker is draggable and a tap moves it. */
  pick?: { value: LatLon; onChange: (p: LatLon) => void } | null;
  initialCenter: LatLon;
  dark: boolean;
  labels: { map: string; you: string; offline: string; loading: string };
  className?: string;
};

function hotelPinEl(label: string) {
  const el = document.createElement("div");
  el.className = "hc-pin";
  el.setAttribute("role", "img");
  el.setAttribute("aria-label", label);
  el.innerHTML = `
    <svg viewBox="0 0 40 52" width="40" height="52" aria-hidden="true">
      <defs><filter id="hcs" x="-30%" y="-20%" width="160%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity=".35"/></filter></defs>
      <path filter="url(#hcs)" d="M20 2C10.6 2 3 9.5 3 18.8 3 31.4 20 50 20 50s17-18.6 17-31.2C37 9.5 29.4 2 20 2z" fill="var(--primary)" stroke="#fff" stroke-width="2.5"/>
      <g transform="translate(10.5 9.5)" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 18V4.5A1.5 1.5 0 0 1 3.5 3h12A1.5 1.5 0 0 1 17 4.5V18"/><path d="M0.5 18h18"/><path d="M7.5 18v-3.5h4V18"/><path d="M6 7h.01M9.5 7h.01M13 7h.01M6 10.5h.01M9.5 10.5h.01M13 10.5h.01"/>
      </g>
    </svg>`;
  return el;
}

function userDotEl(label: string) {
  const el = document.createElement("div");
  el.className = "hc-user";
  el.setAttribute("role", "img");
  el.setAttribute("aria-label", label);
  el.innerHTML = `<span class="hc-user-cone" hidden></span><span class="hc-user-pulse"></span><span class="hc-user-dot"></span>`;
  return el;
}

const EMPTY: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };

export const MapView = forwardRef<MapViewHandle, MapViewProps>(function MapView(props, ref) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MlMap | null>(null);
  const lib = useRef<MapLib | null>(null);
  const targetMarker = useRef<Marker | null>(null);
  const userMarker = useRef<Marker | null>(null);
  const anim = useRef<number | null>(null);
  const shown = useRef<LatLon | null>(null);
  const latest = useRef(props);
  latest.current = props;
  const [state, setState] = useState<"loading" | "ready" | "offline">("loading");
  const [styleTick, setStyleTick] = useState(0);
  const styleKey = useRef<"light" | "dark" | "raster">(props.dark ? "dark" : "light");

  // ── create map once ───────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    let fellBack = false;
    let giveUp: ReturnType<typeof setTimeout> | undefined;
    (async () => {
      // CSP-friendly build: the worker is a same-origin file, not a blob.
      const mod = (await import("maplibre-gl/dist/maplibre-gl-csp.js")) as unknown as MapLib & { default?: MapLib };
      const ml = (mod.default ?? mod) as MapLib;
      if (cancelled || !container.current) return;
      ml.setWorkerUrl("/vendor/maplibre-gl-csp-worker.js");
      lib.current = ml;
      const p = latest.current;
      const start = p.pick?.value ?? p.target ?? p.user ?? p.initialCenter;
      const m = new ml.Map({
        container: container.current,
        style: p.dark ? STYLE_URL.dark : STYLE_URL.light,
        center: [start.lon, start.lat],
        zoom: p.target || p.pick ? 16 : 15,
        maxZoom: 19,
        attributionControl: { compact: true },
        cooperativeGestures: false,
        dragRotate: true,
        pitchWithRotate: false,
        fadeDuration: 150,
      });
      map.current = m;
      m.addControl(new ml.NavigationControl({ showCompass: true, visualizePitch: false }), "top-right");
      m.addControl(new ml.ScaleControl({ unit: "metric", maxWidth: 90 }), "bottom-left");

      const onStyle = () => {
        if (!m.getSource("hc-acc")) {
          m.addSource("hc-acc", { type: "geojson", data: EMPTY });
          m.addLayer({ id: "hc-acc-fill", type: "fill", source: "hc-acc", paint: { "fill-color": "#2f7cf6", "fill-opacity": 0.14 } });
          m.addLayer({ id: "hc-acc-line", type: "line", source: "hc-acc", paint: { "line-color": "#2f7cf6", "line-opacity": 0.45, "line-width": 1 } });
        }
        if (!m.getSource("hc-route")) {
          m.addSource("hc-route", { type: "geojson", data: EMPTY });
          m.addLayer({
            id: "hc-route",
            type: "line",
            source: "hc-route",
            layout: { "line-cap": "round" },
            paint: { "line-color": "#c9a227", "line-width": 3.5, "line-dasharray": [0.6, 1.8], "line-opacity": 0.95 },
          });
        }
        setState("ready");
        setStyleTick((x) => x + 1);
      };
      m.on("style.load", onStyle);
      // Nothing at all after a while (offline with no cached map): say so instead of spinning forever.
      giveUp = setTimeout(() => {
        if (!m.isStyleLoaded()) setState("offline");
      }, 12_000);
      m.on("error", (e) => {
        const msg = String((e as { error?: Error }).error?.message ?? "");
        // Style itself failed (vector service down / blocked): switch to OSM raster once.
        if (!fellBack && !m.isStyleLoaded() && /style|Failed to fetch|NetworkError|AJAXError|Load failed/i.test(msg)) {
          fellBack = true;
          styleKey.current = "raster";
          if (!navigator.onLine) setState("offline");
          else m.setStyle(OSM_RASTER);
        }
      });
      m.on("dragstart", (e) => {
        if ((e as { originalEvent?: Event }).originalEvent) latest.current.onFollowChange(false);
      });
      m.on("click", (e) => latest.current.pick?.onChange({ lat: e.lngLat.lat, lon: e.lngLat.lng }));
    })().catch(() => setState("offline"));
    return () => {
      cancelled = true;
      clearTimeout(giveUp);
      if (anim.current) cancelAnimationFrame(anim.current);
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Theme switch → swap vector style (custom layers are re-added on style.load).
  useEffect(() => {
    const m = map.current;
    if (!m || state !== "ready" || styleKey.current === "raster") return;
    const want = props.dark ? "dark" : "light";
    if (styleKey.current !== want) {
      styleKey.current = want;
      m.setStyle(STYLE_URL[want]);
    }
  }, [props.dark, state]);

  // ── target marker (or pick marker) ────────────────────────────────────────
  useEffect(() => {
    const m = map.current;
    const ml = lib.current;
    if (!m || !ml || state !== "ready") return;
    const pos = props.pick?.value ?? props.target;
    if (!pos) {
      targetMarker.current?.remove();
      targetMarker.current = null;
      return;
    }
    if (!targetMarker.current) {
      targetMarker.current = new ml.Marker({ element: hotelPinEl(props.target?.label ?? ""), anchor: "bottom" }).setLngLat([pos.lon, pos.lat]).addTo(m);
    }
    const mk = targetMarker.current;
    mk.setLngLat([pos.lon, pos.lat]);
    mk.getElement().setAttribute("aria-label", props.target?.label ?? "");
    mk.setDraggable(Boolean(props.pick));
    mk.getElement().classList.toggle("hc-pin-pick", Boolean(props.pick));
    const onDragEnd = () => {
      const ll = mk.getLngLat();
      latest.current.pick?.onChange({ lat: ll.lat, lon: ll.lng });
    };
    mk.on("dragend", onDragEnd);
    return () => {
      mk.off("dragend", onDragEnd);
    };
  }, [props.pick, props.target, state, styleTick]);

  // ── user marker, accuracy halo, line to target ────────────────────────────
  useEffect(() => {
    const m = map.current;
    const ml = lib.current;
    if (!m || !ml || state !== "ready") return;
    const u = props.user;
    const acc = m.getSource("hc-acc") as GeoJSONSource | undefined;
    const route = m.getSource("hc-route") as GeoJSONSource | undefined;
    if (!u) {
      userMarker.current?.remove();
      userMarker.current = null;
      shown.current = null;
      acc?.setData(EMPTY);
      route?.setData(EMPTY);
      return;
    }
    if (!userMarker.current) {
      userMarker.current = new ml.Marker({ element: userDotEl(latest.current.labels.you), rotationAlignment: "map", pitchAlignment: "map" })
        .setLngLat([u.lon, u.lat])
        .addTo(m);
      shown.current = { lat: u.lat, lon: u.lon };
    }
    // Smoothly animate the dot to the new fix (no jumpy marker).
    const from = shown.current ?? { lat: u.lat, lon: u.lon };
    const to = { lat: u.lat, lon: u.lon };
    const t0 = performance.now();
    const dur = 650;
    if (anim.current) cancelAnimationFrame(anim.current);
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / dur);
      const e = 1 - (1 - k) ** 3;
      const cur = { lat: from.lat + (to.lat - from.lat) * e, lon: from.lon + (to.lon - from.lon) * e };
      shown.current = cur;
      userMarker.current?.setLngLat([cur.lon, cur.lat]);
      acc?.setData({ type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [circleRing(cur, u.accuracy)] } });
      const tgt = latest.current.pick?.value ?? latest.current.target;
      route?.setData(
        tgt
          ? { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[cur.lon, cur.lat], [tgt.lon, tgt.lat]] } }
          : EMPTY,
      );
      if (k < 1) anim.current = requestAnimationFrame(step);
    };
    anim.current = requestAnimationFrame(step);
    userMarker.current.getElement().classList.toggle("hc-user-stale", Date.now() - u.time > 30_000);
    if (props.follow) m.easeTo({ center: [u.lon, u.lat], duration: 650, zoom: Math.max(m.getZoom(), 16) });
  }, [props.user, props.follow, state, styleTick]);

  // Heading cone on the user dot.
  useEffect(() => {
    const mk = userMarker.current;
    if (!mk) return;
    const cone = mk.getElement().querySelector<HTMLElement>(".hc-user-cone");
    if (!cone) return;
    const h = props.heading;
    cone.hidden = h === null;
    if (h !== null) mk.setRotation(h);
  }, [props.heading, props.user]);

  // Prefetch the vector tiles around the target for offline use (small area, zoom 12–16).
  useEffect(() => {
    const m = map.current;
    const t = props.target;
    if (!m || !t || state !== "ready" || !navigator.serviceWorker?.controller) return;
    const src = m.getSource("openmaptiles") as { tiles?: string[] } | undefined;
    const template = src?.tiles?.[0];
    if (!template) return;
    const pts: LatLon[] = [t, props.initialCenter];
    const urls = tilesForArea(pts, 900, 12, 16, 350).map(({ z, x, y }) =>
      template.replace("{z}", String(z)).replace("{x}", String(x)).replace("{y}", String(y)),
    );
    navigator.serviceWorker.controller.postMessage({ type: "cache-tiles", urls });
  }, [props.target, props.initialCenter, state, styleTick]);

  useImperativeHandle(ref, () => ({
    fitBoth: () => {
      const m = map.current;
      const ml = lib.current;
      if (!m || !ml) return;
      const p = latest.current;
      const pts = [p.user, p.pick?.value ?? p.target].filter(Boolean) as LatLon[];
      if (pts.length === 1) m.easeTo({ center: [pts[0].lon, pts[0].lat], zoom: 17, duration: 600 });
      else if (pts.length === 2) {
        const b = new ml.LngLatBounds([pts[0].lon, pts[0].lat], [pts[0].lon, pts[0].lat]).extend([pts[1].lon, pts[1].lat]);
        m.fitBounds(b, { padding: { top: 70, bottom: 50, left: 50, right: 60 }, maxZoom: 18, duration: 700 });
      }
    },
    centerOn: (p, zoom) => map.current?.easeTo({ center: [p.lon, p.lat], zoom: zoom ?? Math.max(map.current.getZoom(), 16), duration: 600 }),
  }));

  return (
    <div className={props.className} style={{ position: "relative" }}>
      {/* Inline position: maplibre's CSS sets .maplibregl-map { position: relative }, which would collapse a class-based inset. */}
      <div ref={container} style={{ position: "absolute", inset: 0 }} role="application" aria-label={props.labels.map} />
      {state !== "ready" ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-muted/60 p-4 text-center text-sm text-muted-foreground">
          {state === "offline" ? props.labels.offline : props.labels.loading}
        </div>
      ) : null}
    </div>
  );
});
