"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ExternalLink, Play, RefreshCw, ShieldCheck, Signal, Wifi } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { usePrefs } from "@/components/providers/preferences-provider";
import { SegmentedControl } from "@/components/ui/segmented";
import { gt } from "@/data/guides/travel";
import { channelLiveUrl, LIVE_CHANNELS, type LiveChannel } from "@/data/live";
import { cn } from "@/lib/utils";
import { useLiveStreams, type LiveInfo } from "./use-live";

type Ch = LiveChannel["id"];

/** Pulsing red "LIVE" pill. */
export function LiveBadge({ small }: { small?: boolean }) {
  const { t } = useI18n();
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full bg-red-600 font-bold tracking-wide text-white shadow", small ? "px-1.5 py-0.5 text-[9px]" : "px-2.5 py-1 text-[11px]")}>
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-white/80" />
        <span className="relative inline-flex size-1.5 rounded-full bg-white" />
      </span>
      {t("live.badge")}
    </span>
  );
}

export const thumbOf = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault_live.jpg`;

/** YouTube's live thumbnail, or the painted Haram poster when there's none (or it fails to load). */
export function LiveThumb({ id, place, emojiClass = "text-3xl" }: { id: string | null | undefined; place: Ch; emojiClass?: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  if (!id || failed === id)
    return (
      <span className={cn("hc-live-art grid h-full w-full place-items-center", emojiClass)} aria-hidden>
        {place === "makkah" ? "🕋" : "🕌"}
      </span>
    );
  return (
    // eslint-disable-next-line @next/next/no-img-element -- YouTube's own live thumbnail
    <img
      src={thumbOf(id)}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(id)}
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  );
}

export function Player({
  channel,
  info,
  loading,
  autoStart,
  compact,
}: {
  channel: LiveChannel;
  info: LiveInfo["channels"][number] | undefined;
  loading: boolean;
  /** Start playing (muted) once the player is on screen. */
  autoStart?: boolean;
  compact?: boolean;
}) {
  const { t, locale } = useI18n();
  const reduce = useReducedMotion();
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const [playing, setPlaying] = useState<"video" | "channel" | null>(null);
  const [thumbOk, setThumbOk] = useState(true);
  const id = info?.videoId ?? null;
  // Seen on screen at least once (auto-start waits for this, so nothing streams off-screen).
  const box = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!autoStart || seen || !box.current) return;
    const io = new IntersectionObserver((es) => es.some((e) => e.isIntersecting) && setSeen(true), { threshold: 0.4 });
    io.observe(box.current);
    return () => io.disconnect();
  }, [autoStart, seen]);

  // A different channel or stream → back to the poster (nothing plays until tapped).
  const key = `${channel.id}:${id ?? "-"}`;
  const [shownKey, setShownKey] = useState(key);
  if (shownKey !== key) {
    setShownKey(key);
    setPlaying(null);
    setThumbOk(true);
  }

  // Muted by default (browsers only auto-play muted video); the player's own speaker button unmutes.
  const mode = playing ?? (autoStart && seen && !loading ? (id ? "video" : "channel") : null);
  const src =
    mode === "video" && id
      ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1&origin=${encodeURIComponent(origin)}`
      : mode === "channel"
        ? `https://www.youtube.com/embed/live_stream?channel=${channel.channelId}&autoplay=1&mute=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(origin)}`
        : null;
  // Belt and braces for browsers that ignore autoplay=1 in iframes: once the player has loaded,
  // tell it (through the documented postMessage API) to mute and play.
  const kick = (frame: HTMLIFrameElement) => {
    const send = (func: string) => frame.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: [] }), "*");
    for (const ms of [300, 1200, 3000]) {
      setTimeout(() => {
        send("mute");
        send("playVideo");
      }, ms);
    }
  };

  return (
    <div ref={box} className={cn("relative aspect-video overflow-hidden bg-black shadow-soft ring-1 ring-border", compact ? "rounded-2xl" : "rounded-3xl")}>
      <AnimatePresence mode="wait">
        {src ? (
          <motion.iframe
            key={src}
            onLoad={(e) => kick(e.currentTarget)}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            src={src}
            title={`${gt(channel.place, locale)} — ${t("live.badge")}`}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <motion.button
            key="poster"
            type="button"
            onClick={() => setPlaying(id ? "video" : "channel")}
            disabled={loading}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="group absolute inset-0 block text-start text-white"
            aria-label={`${t("live.tapToPlay")}: ${gt(channel.place, locale)}`}
          >
            {id && thumbOk ? (
              // eslint-disable-next-line @next/next/no-img-element -- YouTube's own live thumbnail
              <img src={thumbOf(id)} alt="" onError={() => setThumbOk(false)} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
            ) : (
              <div className="hc-live-art absolute inset-0 grid place-items-center text-7xl" aria-hidden>
                {channel.id === "makkah" ? "🕋" : "🕌"}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />
            <div className="absolute start-3 top-3 flex items-center gap-2">
              {id ? <LiveBadge /> : null}
              <span className="rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium backdrop-blur">{gt(channel.channel, locale)}</span>
            </div>
            <span className="absolute inset-0 grid place-items-center" aria-hidden>
              <span className="relative grid size-16 place-items-center rounded-full bg-white/95 text-red-600 shadow-xl transition-transform group-hover:scale-110 sm:size-20">
                {!reduce ? <span className="absolute inset-0 animate-ping rounded-full bg-white/40" /> : null}
                {loading ? <RefreshCw className="size-7 animate-spin" /> : <Play className="relative size-8 translate-x-0.5 fill-current sm:size-9" />}
              </span>
            </span>
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="text-lg font-semibold leading-snug">{gt(channel.place, locale)}</p>
              <p className="line-clamp-1 text-xs opacity-85" dir="auto">
                {loading ? t("live.checking") : (info?.title ?? t("live.tapToPlay"))}
              </p>
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export function LivePage() {
  const { t, locale } = useI18n();
  // Follows the app's Makkah/Madinah choice (the tab at the top); choosing here changes it too.
  const ch = usePrefs((s) => s.location);
  const setPrefs = usePrefs((s) => s.set);
  const q = useLiveStreams();

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("ch");
    if ((p === "makkah" || p === "madinah") && p !== ch) setPrefs({ location: p });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- read the address once on mount
  }, []);
  const pick = (c: Ch) => {
    setPrefs({ location: c });
    window.history.replaceState(window.history.state, "", `/live?ch=${c}`);
  };

  const channel = LIVE_CHANNELS.find((c) => c.id === ch)!;
  const info = q.data?.channels.find((c) => c.id === ch);
  const other = LIVE_CHANNELS.find((c) => c.id !== ch)!;
  const otherInfo = q.data?.channels.find((c) => c.id === other.id);
  // Couldn't confirm a live stream (lookup failed, or YouTube showed none).
  const unconfirmed = !q.isLoading && (!info || !info.videoId);

  return (
    <div className="space-y-5">
      <SegmentedControl<Ch>
        label={t("live.title")}
        value={ch}
        onChange={pick}
        options={[
          { value: "makkah", label: `🕋 ${t("location.makkah")}` },
          { value: "madinah", label: `🕌 ${t("location.madinah")}` },
        ]}
        className="max-w-md"
      />

      <motion.div key={ch} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Player channel={channel} info={info} loading={q.isLoading} autoStart />
      </motion.div>

      {unconfirmed ? (
        <p className="rounded-2xl border border-gold/40 bg-gold-soft/40 p-3 text-sm" role="status">
          {t("live.unavailable")} <span className="text-muted-foreground">{t("live.channelFallback")}</span>
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <a
          href={channelLiveUrl(channel)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white shadow-soft hover:bg-red-700"
        >
          <ExternalLink className="size-4" aria-hidden />
          {t("live.openYoutube")}
        </a>
        <button
          type="button"
          onClick={() => q.refetch()}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium"
          disabled={q.isFetching}
        >
          <RefreshCw className={cn("size-4", q.isFetching && "animate-spin")} aria-hidden />
          {t("live.refresh")}
        </button>
      </div>

      {/* the other Haram */}
      <button
        type="button"
        onClick={() => pick(other.id)}
        className="group flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-border bg-card p-2 text-start shadow-soft transition-colors hover:border-gold"
      >
        <span className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-xl bg-black sm:w-40">
          <LiveThumb id={otherInfo?.videoId} place={other.id} />
          {otherInfo?.videoId ? (
            <span className="absolute start-1.5 top-1.5">
              <LiveBadge small />
            </span>
          ) : null}
        </span>
        <span className="min-w-0">
          <span className="block text-xs text-muted-foreground">{t("live.alsoLive")}</span>
          <span className="block font-semibold leading-snug">{gt(other.place, locale)}</span>
          <span className="block truncate text-xs text-muted-foreground">{gt(other.channel, locale)}</span>
        </span>
      </button>

      <ul className="space-y-2 text-xs text-muted-foreground">
        <li className="flex gap-2">
          <Signal className="mt-0.5 size-3.5 shrink-0 text-gold" aria-hidden />
          {t("live.source")}
        </li>
        <li className="flex gap-2">
          <Wifi className="mt-0.5 size-3.5 shrink-0 text-gold" aria-hidden />
          {t("live.dataNote")}
        </li>
        <li className="flex gap-2">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-gold" aria-hidden />
          {t("live.privacy")}
        </li>
      </ul>
    </div>
  );
}
