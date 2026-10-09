"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { History, Loader2, Search, X } from "lucide-react";
import { z } from "zod";
import { useI18n } from "@/components/providers/i18n-provider";
import { parseCoordinates, distanceM, type LatLon } from "@/features/places/geo";
import type { LocationId } from "@/config/locations";
import { cn } from "@/lib/utils";

export type SearchKind = "hotel" | "mosque" | "street" | "food" | "shop" | "transport" | "health" | "place" | "gate" | "landmark" | "coords";
export type SearchHit = { id: string; name: string; detail: string; lat: number; lon: number; kind: SearchKind };

const HitSchema = z.object({
  id: z.string(),
  name: z.string(),
  detail: z.string(),
  lat: z.number(),
  lon: z.number(),
  kind: z.enum(["hotel", "mosque", "street", "food", "shop", "transport", "health", "place"]),
});
const ResSchema = z.object({ results: z.array(HitSchema) });

const ICON: Record<SearchKind, string> = {
  hotel: "🏨",
  mosque: "🕌",
  street: "🛣️",
  food: "🍽️",
  shop: "🛍️",
  transport: "🚆",
  health: "🏥",
  place: "📍",
  gate: "🚪",
  landmark: "🕋",
  coords: "📌",
};

const RECENT_KEY = "hc_place_recent_v1";
const fold = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[ً-ْٰ̀-ͯ]/g, "");

function loadRecent(loc: LocationId): SearchHit[] {
  try {
    const all = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "{}") as Record<string, SearchHit[]>;
    return z.array(HitSchema.extend({ kind: z.string() })).catch([]).parse(all[loc] ?? []) as SearchHit[];
  } catch {
    return [];
  }
}
function saveRecent(loc: LocationId, hit: SearchHit) {
  try {
    const all = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "{}") as Record<string, SearchHit[]>;
    all[loc] = [hit, ...(all[loc] ?? []).filter((h) => h.id !== hit.id)].slice(0, 6);
    localStorage.setItem(RECENT_KEY, JSON.stringify(all));
  } catch {
    /* storage unavailable */
  }
}

/**
 * Search box that works like a map app's: type a hotel, street or place and pick it from the list.
 * Places on this map (gates, landmarks) come first; then OpenStreetMap results for the city.
 * Pasted coordinates or a Google Maps link also work.
 */
export function PlaceSearch({
  loc,
  near,
  local = [],
  onPick,
  placeholder,
  autoFocus,
  className,
}: {
  loc: LocationId;
  near?: LatLon | null;
  local?: SearchHit[];
  onPick: (hit: SearchHit) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}) {
  const { t, locale, formatNumber } = useI18n();
  const id = useId();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [res, setRes] = useState<{ key: string; hits: SearchHit[] } | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<SearchHit[]>([]);
  const box = useRef<HTMLDivElement>(null);
  const nearKey = near ? `${near.lat.toFixed(2)},${near.lon.toFixed(2)}` : "";

  const query = q.trim();
  const coords = useMemo(() => parseCoordinates(query), [query]);

  // OpenStreetMap results, debounced; older requests are cancelled.
  const wantRemote = query.length >= 2 && !coords;
  const key = `${loc}|${locale}|${query}`;
  useEffect(() => {
    if (!wantRemote) return;
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({ q: query, loc, lang: locale });
      if (nearKey) params.set("near", nearKey);
      fetch(`/api/places/search?${params}`, { signal: ctrl.signal })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then((d) => setRes({ key, hits: ResSchema.parse(d).results }))
        .catch(() => {
          if (!ctrl.signal.aborted) setFailed(key);
        });
    }, 350);
    return () => {
      window.clearTimeout(timer);
      ctrl.abort();
    };
  }, [wantRemote, key, query, loc, locale, nearKey]);
  const remote = useMemo(() => (wantRemote && res?.key === key ? res.hits : []), [wantRemote, res, key]);
  const status: "idle" | "loading" | "error" = !wantRemote ? "idle" : failed === key ? "error" : res?.key === key ? "idle" : "loading";

  const localHits = useMemo(() => {
    if (query.length < 1) return [];
    const f = fold(query);
    return local.filter((h) => fold(`${h.name} ${h.detail}`).includes(f)).slice(0, 5);
  }, [local, query]);

  const items: SearchHit[] = useMemo(() => {
    if (coords) return [{ id: `c${coords.lat},${coords.lon}`, name: `${coords.lat.toFixed(6)}, ${coords.lon.toFixed(6)}`, detail: t("placeSearch.coords"), lat: coords.lat, lon: coords.lon, kind: "coords" }];
    if (!query) return recent;
    return [...localHits, ...remote];
  }, [coords, query, recent, localHits, remote, t]);

  // Close when tapping elsewhere.
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  const pick = (h: SearchHit) => {
    if (h.kind !== "coords") saveRecent(loc, h);
    setQ("");
    setOpen(false);
    onPick(h);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(items.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter" && open && items[active]) {
      e.preventDefault();
      pick(items[active]);
    } else if (e.key === "Escape") setOpen(false);
  };

  const showList = open && (items.length > 0 || (query.length >= 2 && status !== "loading"));
  const dist = (h: SearchHit) => (near ? distanceM(near, h) : null);
  const fmtD = (m: number) =>
    m < 1000 ? `${formatNumber(Math.round(m / 10) * 10)} ${t("placeSearch.m")}` : `${formatNumber(Math.round(m / 100) / 10)} ${t("placeSearch.km")}`;

  return (
    <div ref={box} className={cn("relative", className)}>
      <div className="flex h-12 items-center gap-2 rounded-full border border-border bg-card px-4 shadow-soft focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
        <input
          role="combobox"
          aria-expanded={showList}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={showList && items[active] ? `${id}-${active}` : undefined}
          aria-label={placeholder ?? t("placeSearch.placeholder")}
          placeholder={placeholder ?? t("placeSearch.placeholder")}
          value={q}
          autoFocus={autoFocus}
          autoComplete="off"
          enterKeyHint="search"
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => {
            setRecent(loadRecent(loc));
            setOpen(true);
          }}
          onKeyDown={onKey}
          className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
        />
        {status === "loading" ? <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" aria-hidden /> : null}
        {q ? (
          <button type="button" onClick={() => setQ("")} className="grid size-8 shrink-0 place-items-center rounded-full hover:bg-muted" aria-label={t("placeSearch.clear")}>
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>

      {showList ? (
        <div className="absolute inset-x-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
          {!query && items.length ? (
            <p className="flex items-center gap-1.5 px-4 pt-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <History className="size-3.5" aria-hidden />
              {t("placeSearch.recent")}
            </p>
          ) : null}
          <ul id={`${id}-list`} role="listbox" className="max-h-[50vh] overflow-y-auto py-1">
            {items.map((h, i) => {
              const d = dist(h);
              return (
                <li
                  key={`${h.id}-${i}`}
                  id={`${id}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onPointerEnter={() => setActive(i)}
                  onClick={() => pick(h)}
                  className={cn("flex cursor-pointer items-center gap-3 px-4 py-2.5", i === active && "bg-muted")}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-base" aria-hidden>
                    {ICON[h.kind]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium" dir="auto">
                      {h.name}
                    </span>
                    {h.detail ? (
                      <span className="block truncate text-xs text-muted-foreground" dir="auto">
                        {h.detail}
                      </span>
                    ) : null}
                  </span>
                  {d !== null ? <span className="shrink-0 text-xs text-muted-foreground">{fmtD(d)}</span> : null}
                </li>
              );
            })}
          </ul>
          {query.length >= 2 && !coords ? (
            <p className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
              {status === "error" ? t("placeSearch.unavailable") : !items.length ? t("placeSearch.none") : t("placeSearch.source")}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
