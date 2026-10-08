"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { ChevronRight, ExternalLink } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { useMounted } from "@/hooks/use-hydrated";
import { useOnline } from "@/hooks/use-online";
import { cn } from "@/lib/utils";

/** Each site stays on screen this long once it has loaded. */
export const ROTATE_MS = 7000;
/** A site that has not loaded by then is skipped. */
export const LOAD_TIMEOUT_MS = 10000;

const AdsSchema = z.object({ links: z.array(z.object({ id: z.string(), url: z.string().url() })) });
type Ad = z.infer<typeof AdsSchema>["links"][number];

/** Random order (Fisher–Yates); `avoidFirst` keeps a reshuffled deck from repeating the site just shown. */
export function shuffle<T extends { url: string }>(items: T[], avoidFirst?: string): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  if (avoidFirst && a.length > 1 && a[0].url === avoidFirst) [a[0], a[1]] = [a[1], a[0]];
  return a;
}

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

type Frame = { key: number; ad: Ad; loaded: boolean };

let frameSeq = 0;
const nextKey = () => ++frameSeq;

/**
 * Sponsored websites shown in a framed "web view". The first one loads with
 * the page, then a new random site every 7 seconds; the order is shuffled on
 * every page load and every site is shown once before any repeats. Rotation
 * pauses while the banner is off screen or the tab is hidden, so it does not
 * use data in the background. Nothing is shown offline, on Data Saver, or
 * when no link can be framed.
 */
export function AdBanner({ className }: { className?: string }) {
  const { t } = useI18n();
  const mounted = useMounted();
  const online = useOnline();
  const saveData = mounted && Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
  const enabled = mounted && online && !saveData;

  const ads = useQuery({
    queryKey: ["ads"],
    queryFn: async ({ signal }) => {
      const res = await fetch("/api/ads", { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return AdsSchema.parse(await res.json()).links;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Shuffled deck, rebuilt whenever a new list arrives.
  const [src, setSrc] = useState<Ad[] | undefined>(undefined);
  const [deck, setDeck] = useState<Ad[]>([]);
  const [pos, setPos] = useState(0);
  const [frames, setFrames] = useState<Frame[]>([]);
  if (ads.data && ads.data !== src) {
    const d = shuffle(ads.data);
    setSrc(ads.data);
    setDeck(d);
    setPos(0);
    setFrames(d.length ? [{ key: nextKey(), ad: d[0], loaded: false }] : []);
  }

  const current = frames[frames.length - 1];
  const hasBox = frames.length > 0;

  const advance = useCallback(() => {
    if (deck.length < 2) return;
    let nextDeck = deck;
    let nextPos = pos + 1;
    if (nextPos >= deck.length) {
      nextDeck = shuffle(deck, deck[pos]?.url);
      nextPos = 0;
      setDeck(nextDeck);
    }
    setPos(nextPos);
    const ad = nextDeck[nextPos];
    // Keep the loaded site visible underneath until the new one has loaded.
    setFrames((f) => [...f.filter((x) => x.loaded).slice(-1), { key: nextKey(), ad, loaded: false }]);
  }, [deck, pos]);

  // Only rotate while the banner is on screen and the tab is visible.
  const box = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  useEffect(() => {
    const el = box.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [hasBox]);
  useEffect(() => {
    const on = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);
  const active = inView && pageVisible;

  useEffect(() => {
    if (!active || !current || deck.length < 2) return;
    const id = setTimeout(advance, current.loaded ? ROTATE_MS : LOAD_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, [active, current, deck.length, advance]);

  if (!enabled || !current) return null;

  return (
    <aside aria-label={t("ads.label")} className={cn("mx-auto w-full max-w-3xl", className)}>
      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-full border border-border bg-card px-2 py-0.5 font-medium uppercase tracking-wide">{t("ads.label")}</span>
        <span className="min-w-0 flex-1 truncate" dir="ltr">
          {hostOf(current.ad.url)}
        </span>
        {deck.length > 1 ? (
          <button
            type="button"
            onClick={advance}
            className="inline-flex min-h-9 items-center gap-0.5 rounded-lg px-2 hover:bg-muted hover:text-foreground"
          >
            {t("ads.next")}
            <ChevronRight className="size-3.5 rtl:rotate-180" aria-hidden />
          </button>
        ) : null}
        <a
          href={current.ad.url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 hover:bg-muted hover:text-foreground"
        >
          <ExternalLink className="size-3.5" aria-hidden />
          <span className="sr-only sm:not-sr-only">{t("ads.open")}</span>
        </a>
      </div>
      <div ref={box} className="relative h-60 overflow-hidden rounded-2xl border border-border bg-card shadow-soft sm:h-72">
        {!frames.some((f) => f.loaded) ? <div aria-hidden className="skeleton absolute inset-0" /> : null}
        {frames.map((f, i) => (
          <iframe
            key={f.key}
            src={f.ad.url}
            title={`${t("ads.frameTitle")}: ${hostOf(f.ad.url)}`}
            // Scripts and links work inside the frame, but it can never take over or redirect this app.
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            allow=""
            referrerPolicy="strict-origin-when-cross-origin"
            loading="eager"
            tabIndex={i === frames.length - 1 ? 0 : -1}
            aria-hidden={i !== frames.length - 1}
            onLoad={() =>
              setFrames((all) => {
                const at = all.findIndex((x) => x.key === f.key);
                if (at < 0) return all;
                // Once the newest site has loaded, drop the older one underneath.
                return at === all.length - 1 ? [{ ...f, loaded: true }] : all.map((x) => (x.key === f.key ? { ...x, loaded: true } : x));
              })
            }
            className={cn(
              "absolute inset-0 size-full border-0 bg-white transition-opacity duration-500",
              f.loaded ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
        {deck.length > 1 && current.loaded ? (
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-black/10">
            <div
              key={current.key}
              className="h-full origin-left bg-gold rtl:origin-right"
              style={{ animation: `ad-progress ${ROTATE_MS}ms linear forwards`, animationPlayState: active ? "running" : "paused" }}
            />
          </div>
        ) : null}
      </div>
    </aside>
  );
}
