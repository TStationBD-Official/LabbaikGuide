"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useI18n } from "@/components/providers/i18n-provider";
import { useMounted } from "@/hooks/use-hydrated";
import { useOnline } from "@/hooks/use-online";
import { cn } from "@/lib/utils";

/** A new site every 7 seconds, counted from the moment the previous one was requested. */
export const ROTATE_MS = 7000;

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

  // Exactly 7 s per site. Time spent off screen / in a background tab is not counted,
  // so the timer resumes where it stopped.
  const advanceRef = useRef(advance);
  useEffect(() => {
    advanceRef.current = advance;
  }, [advance]);
  const timing = useRef({ key: -1, elapsed: 0 });
  const currentKey = current?.key ?? -1;
  useEffect(() => {
    if (timing.current.key !== currentKey) timing.current = { key: currentKey, elapsed: 0 };
    if (!active || currentKey < 0 || deck.length < 2) return;
    const start = performance.now();
    const id = setTimeout(() => advanceRef.current(), Math.max(0, ROTATE_MS - timing.current.elapsed));
    return () => {
      clearTimeout(id);
      if (timing.current.key === currentKey) timing.current.elapsed += performance.now() - start;
    };
  }, [active, currentKey, deck.length]);

  if (!enabled || !current) return null;

  return (
    <aside aria-label={t("ads.label")} className={cn("mx-auto w-full max-w-3xl", className)}>
      <div ref={box} className="relative h-[50px] overflow-hidden rounded-lg border border-border bg-card shadow-soft sm:h-[60px]">
        {!frames.some((f) => f.loaded) ? <div aria-hidden className="skeleton absolute inset-0" /> : null}
        {frames.map((f, i) => (
          <iframe
            key={f.key}
            src={f.ad.url}
            title={`${t("ads.frameTitle")}: ${hostOf(f.ad.url)}`}
            // Scripts and links work inside the frame, but it can never take over or redirect this app.
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            allow="autoplay 'none'; fullscreen 'none'"
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
        {/* Light dim so bright sites sit calmly in the app; the site stays clearly visible and clickable. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-black/100" />
        <span className="pointer-events-none absolute start-1.5 top-1.5 z-10 rounded-full bg-black/55 px-1.5 py-px text-[9px] font-medium text-white backdrop-blur-sm">
          {t("ads.label")}
        </span>
      </div>
    </aside>
  );
}
