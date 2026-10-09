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

/** A point drawn as a map layer (gate number in a circle, facility dot…). */
export type MapPoi = { id: string; lat: number; lon: number; kind: string; num?: number; muted?: boolean };

/** Dot colour per kind. */
const POI_COLORS: [string, string][] = [
  ["gate", "#b8891f"],
  ["toilets", "#2f7cf6"],
  ["water", "#0ea5a4"],
  ["zamzam", "#0d9488"],
  ["medical", "#dc2626"],
  ["landmark", "#0f5c45"],
];

export type MapViewProps = {
  target: (LatLon & { label: string }) | null;
  user: Fix | null;
  heading: number | null;
  follow: boolean;
  onFollowChange: (follow: boolean) => void;
  /** When set, the target marker is draggable and a tap moves it. */
  pick?: { value: LatLon; onChange: (p: LatLon) => void } | null;
  /** Remaining walking route along roads ([lon, lat]); null → straight dashed guide. */
  route?: [number, number][] | null;
  /** Other walking paths to the same place, drawn grey; tap → onAltRouteClick(index). */
  altRoutes?: { index: number; coords: [number, number][] }[];
  onAltRouteClick?: (index: number) => void;
  initialCenter: LatLon;
  dark: boolean;
  labels: { map: string; you: string; offline: string; loading: string };
  className?: string;
  /** Extra points (gates, facilities, landmarks); tap → onPoiClick. */
  pois?: MapPoi[];
  selectedPoi?: string | null;
  onPoiClick?: (id: string) => void;
  /** Where the user has walked ([lon, lat]). */
  trail?: [number, number][];
  /** Target marker style: the hotel pin, or a flag for a chosen gate/place. */
  targetIcon?: "hotel" | "flag";
};

function hotelPinEl(label: string) {
  const el = document.createElement("div");
  el.className = "hc-pin";
  el.setAttribute("role", "img");
  el.setAttribute("aria-label", label);
  // Animations go on the inner span: maplibre positions the marker element itself with `transform`.
  el.innerHTML = `<span class="hc-pin-inner">
    <svg viewBox="0 0 40 52" width="40" height="52" aria-hidden="true">
      <defs><filter id="hcs" x="-30%" y="-20%" width="160%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity=".35"/></filter></defs>
      <path filter="url(#hcs)" d="M20 2C10.6 2 3 9.5 3 18.8 3 31.4 20 50 20 50s17-18.6 17-31.2C37 9.5 29.4 2 20 2z" fill="var(--primary)" stroke="#fff" stroke-width="2.5"/>
      <g transform="translate(10.5 9.5)" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 18V4.5A1.5 1.5 0 0 1 3.5 3h12A1.5 1.5 0 0 1 17 4.5V18"/><path d="M0.5 18h18"/><path d="M7.5 18v-3.5h4V18"/><path d="M6 7h.01M9.5 7h.01M13 7h.01M6 10.5h.01M9.5 10.5h.01M13 10.5h.01"/>
      </g>
    </svg></span>`;
  return el;
}

function flagPinEl(label: string) {
  const el = document.createElement("div");
  el.className = "hc-pin";
  el.setAttribute("role", "img");
  el.setAttribute("aria-label", label);
  el.innerHTML = `<span class="hc-pin-inner">
    <svg viewBox="0 0 40 52" width="36" height="47" aria-hidden="true">
      <path d="M20 2C10.6 2 3 9.5 3 18.8 3 31.4 20 50 20 50s17-18.6 17-31.2C37 9.5 29.4 2 20 2z" fill="#b8891f" stroke="#fff" stroke-width="2.5"/>
      <path d="M15 28V10m0 1h11l-3 4 3 4H15" fill="#fff" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>
    </svg></span>`;
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

  /** Dashed guide lines; reads the latest props so it can run inside animation frames. */
  const drawGuide = () => {
    const m = map.current;
    const src = m?.getSource("hc-guide") as GeoJSONSource | undefined;
    if (!src) return;
    const p = latest.current;
    const me = shown.current;
    const tgt = p.pick?.value ?? p.target;
    const r = p.pick ? null : p.route;
    const lines: [number, number][][] = [];
    if (me && tgt) {
      if (r && r.length > 1) {
        lines.push([[me.lon, me.lat], r[0]]);
        lines.push([r[r.length - 1], [tgt.lon, tgt.lat]]);
      } else lines.push([[me.lon, me.lat], [tgt.lon, tgt.lat]]);
    }
    src.setData({ type: "Feature", properties: {}, geometry: { type: "MultiLineString", coordinates: lines } });
  };
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
        if (!m.getSource("hc-trail")) {
          // Where the user walked: soft dotted line under everything else.
          m.addSource("hc-trail", { type: "geojson", data: EMPTY });
          m.addLayer({
            id: "hc-trail",
            type: "line",
            source: "hc-trail",
            layout: { "line-cap": "round", "line-join": "round" },
            filter: ["==", ["geometry-type"], "LineString"],
            paint: { "line-color": "#7c3aed", "line-width": 4, "line-opacity": 0.8 },
          });
          // Each recorded waypoint as a small dot; the start as a larger green one.
          m.addLayer({
            id: "hc-trail-pts",
            type: "circle",
            source: "hc-trail",
            filter: ["all", ["==", ["geometry-type"], "Point"], ["!=", ["get", "start"], true]],
            paint: {
              "circle-radius": ["interpolate", ["linear"], ["zoom"], 15, 1.6, 18, 3.6],
              "circle-color": "#ffffff",
              "circle-stroke-color": "#7c3aed",
              "circle-stroke-width": ["interpolate", ["linear"], ["zoom"], 15, 1, 18, 2],
            },
          });
          m.addLayer({
            id: "hc-trail-start",
            type: "circle",
            source: "hc-trail",
            filter: ["==", ["get", "start"], true],
            paint: { "circle-radius": 7, "circle-color": "#16a34a", "circle-stroke-color": "#ffffff", "circle-stroke-width": 2.5 },
          });
        }
        if (!m.getSource("hc-alt")) {
          // Alternative paths: grey, under the chosen route; tap one to choose it.
          m.addSource("hc-alt", { type: "geojson", data: EMPTY });
          m.addLayer({
            id: "hc-alt-casing",
            type: "line",
            source: "hc-alt",
            layout: { "line-cap": "round", "line-join": "round" },
            paint: { "line-color": "#ffffff", "line-width": 8, "line-opacity": 0.85 },
          });
          m.addLayer({
            id: "hc-alt",
            type: "line",
            source: "hc-alt",
            layout: { "line-cap": "round", "line-join": "round" },
            paint: { "line-color": "#8a94a6", "line-width": 4.5, "line-opacity": 0.9 },
          });
          m.addLayer({
            id: "hc-alt-label",
            type: "symbol",
            source: "hc-alt",
            layout: {
              "symbol-placement": "line-center",
              "text-field": ["get", "label"],
              "text-size": 12,
              "text-font": ["Noto Sans Bold"],
              "text-allow-overlap": true,
            },
            paint: { "text-color": "#4b5563", "text-halo-color": "#ffffff", "text-halo-width": 2 },
          });
          // A wide invisible line makes the grey paths easy to tap.
          m.addLayer({ id: "hc-alt-hit", type: "line", source: "hc-alt", paint: { "line-color": "#000000", "line-width": 22, "line-opacity": 0 } });
          m.on("click", "hc-alt-hit", (e) => {
            const i = e.features?.[0]?.properties?.i;
            if (typeof i === "number") latest.current.onAltRouteClick?.(i);
          });
          m.on("mouseenter", "hc-alt-hit", () => (m.getCanvas().style.cursor = "pointer"));
          m.on("mouseleave", "hc-alt-hit", () => (m.getCanvas().style.cursor = ""));
        }
        if (!m.getSource("hc-route")) {
          // Real walking route: white casing + solid line, drawn under the markers.
          m.addSource("hc-route", { type: "geojson", data: EMPTY });
          m.addLayer({
            id: "hc-route-casing",
            type: "line",
            source: "hc-route",
            layout: { "line-cap": "round", "line-join": "round" },
            paint: { "line-color": "#ffffff", "line-width": 9, "line-opacity": 0.9 },
          });
          m.addLayer({
            id: "hc-route",
            type: "line",
            source: "hc-route",
            layout: { "line-cap": "round", "line-join": "round" },
            paint: { "line-color": "#2f7cf6", "line-width": 5.5 },
          });
        }
        if (!m.getSource("hc-guide")) {
          // Dashed guide: straight line when no route, or the short gaps route↔you / route↔destination.
          m.addSource("hc-guide", { type: "geojson", data: EMPTY });
          m.addLayer({
            id: "hc-guide",
            type: "line",
            source: "hc-guide",
            layout: { "line-cap": "round" },
            paint: { "line-color": "#c9a227", "line-width": 3, "line-dasharray": [0.6, 1.8], "line-opacity": 0.95 },
          });
        }
        if (!m.getSource("hc-pois")) {
          m.addSource("hc-pois", { type: "geojson", data: EMPTY });
          const color: unknown[] = ["match", ["get", "kind"]];
          POI_COLORS.forEach(([k, c]) => color.push(k, c));
          color.push("#64748b");
          m.addLayer({
            id: "hc-pois",
            type: "circle",
            source: "hc-pois",
            paint: {
              // Zoom must be the outermost expression; size per kind/selection inside each stop.
              "circle-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                14,
                ["case", ["get", "sel"], 9, ["==", ["get", "kind"], "gate"], 5, 3.5],
                17,
                ["case", ["get", "sel"], 14, ["==", ["get", "kind"], "gate"], 11, 7],
              ],
              "circle-color": ["case", ["get", "muted"], "#8a8f98", color as never],
              "circle-stroke-color": "#ffffff",
              "circle-stroke-width": ["case", ["get", "sel"], 3, 1.5],
              "circle-opacity": 0.95,
            },
          });
          // Gate numbers (only when the style provides fonts).
          if (m.getStyle().glyphs) {
            m.addLayer({
              id: "hc-poi-num",
              type: "symbol",
              source: "hc-pois",
              minzoom: 15.5,
              filter: ["has", "num"],
              layout: { "text-field": ["to-string", ["get", "num"]], "text-size": 10, "text-allow-overlap": true, "text-font": ["Noto Sans Bold"] },
              paint: { "text-color": "#ffffff" },
            });
          }
          m.on("click", "hc-pois", (e) => {
            const id = e.features?.[0]?.properties?.id;
            if (typeof id === "string") latest.current.onPoiClick?.(id);
          });
          m.on("mouseenter", "hc-pois", () => (m.getCanvas().style.cursor = "pointer"));
          m.on("mouseleave", "hc-pois", () => (m.getCanvas().style.cursor = ""));
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
      targetMarker.current = new ml.Marker({ element: (props.targetIcon === "flag" ? flagPinEl : hotelPinEl)(props.target?.label ?? ""), anchor: "bottom" }).setLngLat([pos.lon, pos.lat]).addTo(m);
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
  }, [props.pick, props.target, props.targetIcon, state, styleTick]);

  // ── user marker, accuracy halo, line to target ────────────────────────────
  useEffect(() => {
    const m = map.current;
    const ml = lib.current;
    if (!m || !ml || state !== "ready") return;
    const u = props.user;
    const acc = m.getSource("hc-acc") as GeoJSONSource | undefined;
    if (!u) {
      userMarker.current?.remove();
      userMarker.current = null;
      shown.current = null;
      acc?.setData(EMPTY);
      drawGuide();
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
      drawGuide();
      if (k < 1) anim.current = requestAnimationFrame(step);
    };
    anim.current = requestAnimationFrame(step);
    userMarker.current.getElement().classList.toggle("hc-user-stale", Date.now() - u.time > 30_000);
    if (props.follow) m.easeTo({ center: [u.lon, u.lat], duration: 650, zoom: Math.max(m.getZoom(), 16) });
  }, [props.user, props.follow, state, styleTick]);

  // Real route line (only while not placing a pin).
  useEffect(() => {
    const m = map.current;
    if (!m || state !== "ready") return;
    const src = m.getSource("hc-route") as GeoJSONSource | undefined;
    const r = props.pick ? null : props.route;
    src?.setData(r && r.length > 1 ? { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: r } } : EMPTY);
    drawGuide();
  }, [props.route, props.pick, props.target, state, styleTick]);

  // Alternative paths, labelled with their letter in the route list (A = best).
  useEffect(() => {
    const m = map.current;
    if (!m || state !== "ready") return;
    const src = m.getSource("hc-alt") as GeoJSONSource | undefined;
    const alts = props.pick ? [] : (props.altRoutes ?? []);
    src?.setData({
      type: "FeatureCollection",
      features: alts.flatMap((a) =>
        a.coords.length > 1
          ? [{ type: "Feature" as const, properties: { i: a.index, label: String.fromCharCode(65 + a.index) }, geometry: { type: "LineString" as const, coordinates: a.coords } }]
          : [],
      ),
    });
  }, [props.altRoutes, props.pick, state, styleTick]);

  // Points of interest.
  useEffect(() => {
    const m = map.current;
    if (!m || state !== "ready") return;
    const src = m.getSource("hc-pois") as GeoJSONSource | undefined;
    src?.setData({
      type: "FeatureCollection",
      features: (props.pois ?? []).map((p) => ({
        type: "Feature",
        properties: { id: p.id, kind: p.kind, muted: Boolean(p.muted), sel: p.id === props.selectedPoi, ...(p.num !== undefined ? { num: p.num } : {}) },
        geometry: { type: "Point", coordinates: [p.lon, p.lat] },
      })),
    });
  }, [props.pois, props.selectedPoi, state, styleTick]);

  // Walked trail.
  useEffect(() => {
    const m = map.current;
    if (!m || state !== "ready") return;
    const src = m.getSource("hc-trail") as GeoJSONSource | undefined;
    const t = props.trail;
    if (!t || !t.length) return void src?.setData(EMPTY);
    src?.setData({
      type: "FeatureCollection",
      features: [
        ...(t.length > 1 ? [{ type: "Feature" as const, properties: {}, geometry: { type: "LineString" as const, coordinates: t } }] : []),
        ...t.map((c, i) => ({ type: "Feature" as const, properties: { start: i === 0 }, geometry: { type: "Point" as const, coordinates: c } })),
      ],
    });
  }, [props.trail, state, styleTick]);

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
