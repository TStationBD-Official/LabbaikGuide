"use client";

import { AnimatePresence, motion } from "motion/react";
import type { PrayerDay } from "@/features/prayer/times";
import type { LocationId } from "@/config/locations";

export type SkyPhase = "tahajjud" | "night" | "dawn" | "sunrise" | "morning" | "noon" | "afternoon" | "sunset" | "dusk";

const MIN = 60_000;

/** Time of day at the selected city, from that day's real prayer and sun times. */
export function skyPhase(day: PrayerDay, now: Date, inLastThird: boolean): SkyPhase {
  const at = (n: PrayerDay["prayers"][number]["name"]) => day.prayers.find((p) => p.name === n)?.adhan.getTime() ?? NaN;
  const t = now.getTime();
  const fajr = at("fajr"), sunrise = at("sunrise"), dhuhr = at("dhuhr"), asr = at("asr"), maghrib = at("maghrib"), isha = at("isha");
  if (t < fajr) return inLastThird ? "tahajjud" : "night";
  if (t < sunrise) return "dawn";
  if (t < sunrise + 40 * MIN) return "sunrise";
  if (t < dhuhr - 45 * MIN) return "morning";
  if (t < asr) return "noon";
  if (t < maghrib - 35 * MIN) return "afternoon";
  if (t < maghrib + 10 * MIN) return "sunset";
  if (t < isha + 30 * MIN) return "dusk";
  return inLastThird ? "tahajjud" : "night";
}

/** Position inside the card's top area: a gentle arc through the free space between the text and the ring. */
type Body = { kind: "sun" | "moon"; x: string; top?: number; bottom?: number; size: number; glow: string };
type Scene = { sky: string; body?: Body; stars: number; horizon?: string; skyline: number };

/** Every scene stays deep enough for white text and the gold ring. */
const SCENES: Record<SkyPhase, Scene> = {
  tahajjud: {
    sky: "linear-gradient(180deg,#060a1d 0%,#11163a 55%,#1f1c46 100%)",
    body: { kind: "moon", x: "55%", top: 14, size: 24, glow: "#fde68a" },
    stars: 34,
    skyline: 0.55,
  },
  night: {
    sky: "linear-gradient(180deg,#06142a 0%,#0b2342 55%,#0f3049 100%)",
    body: { kind: "moon", x: "55%", top: 16, size: 22, glow: "#fef3c7" },
    stars: 22,
    skyline: 0.5,
  },
  dawn: {
    sky: "linear-gradient(180deg,#0c1838 0%,#2e3566 50%,#7a4a6e 85%,#a8606a 100%)",
    stars: 8,
    horizon: "radial-gradient(70% 45% at 50% 100%,rgb(255 170 130/.45),transparent 70%)",
    skyline: 0.5,
  },
  sunrise: {
    sky: "linear-gradient(180deg,#22386a 0%,#7a4f72 45%,#c0614f 80%,#d9844c 100%)",
    body: { kind: "sun", x: "54%", bottom: -10, size: 46, glow: "#ffd28a" },
    stars: 0,
    horizon: "radial-gradient(80% 50% at 54% 100%,rgb(255 200 120/.55),transparent 70%)",
    skyline: 0.45,
  },
  morning: {
    sky: "linear-gradient(180deg,#0a4a74 0%,#16658f 55%,#2b7ea3 100%)",
    body: { kind: "sun", x: "47%", top: 18, size: 28, glow: "#fff1b8" },
    stars: 0,
    skyline: 0.35,
  },
  noon: {
    sky: "linear-gradient(180deg,#07507a 0%,#0b6a96 55%,#1781a8 100%)",
    body: { kind: "sun", x: "53%", top: -6, size: 36, glow: "#fffbe0" },
    stars: 0,
    skyline: 0.35,
  },
  afternoon: {
    sky: "linear-gradient(180deg,#5a3a10 0%,#87561a 50%,#a0681f 100%)",
    body: { kind: "sun", x: "60%", top: 18, size: 28, glow: "#ffd98a" },
    stars: 0,
    skyline: 0.4,
  },
  sunset: {
    sky: "linear-gradient(180deg,#2a1a46 0%,#7c2f4c 45%,#b9473d 80%,#d4693a 100%)",
    body: { kind: "sun", x: "56%", bottom: -12, size: 48, glow: "#ffb070" },
    stars: 0,
    horizon: "radial-gradient(85% 55% at 56% 100%,rgb(255 140 80/.55),transparent 70%)",
    skyline: 0.5,
  },
  dusk: {
    sky: "linear-gradient(180deg,#121a40 0%,#3a2a5c 55%,#6e3a5a 100%)",
    body: { kind: "moon", x: "56%", top: 18, size: 20, glow: "#fef3c7" },
    stars: 10,
    horizon: "radial-gradient(80% 40% at 70% 100%,rgb(230 120 110/.35),transparent 70%)",
    skyline: 0.5,
  },
};

/** Fixed pseudo-random star field (same on server and client). */
const STARS = Array.from({ length: 34 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 97.13 + n * 13.7) + 1) / 2) % 1;
  return { x: `${(r(1) * 100).toFixed(1)}%`, y: `${(r(2) * 62).toFixed(1)}%`, s: r(3) > 0.82 ? 2.4 : r(3) > 0.45 ? 1.6 : 1.1, d: (r(4) * 4).toFixed(2) };
});

function CelestialBody({ body }: { body: Body }) {
  const glow = `0 0 ${body.size * 0.6}px ${body.size * 0.25}px ${body.glow}66, 0 0 ${body.size * 1.6}px ${body.size * 0.8}px ${body.glow}26`;
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute -z-10 -translate-x-1/2 rtl:translate-x-1/2"
      style={{ insetInlineStart: body.x, top: body.top, bottom: body.bottom, width: body.size, height: body.size }}
    >
      {body.kind === "sun" ? (
        <span className="block size-full rounded-full" style={{ background: `radial-gradient(circle at 40% 38%,#fffdf2,${body.glow} 70%)`, boxShadow: glow }} />
      ) : (
        // Crescent: a lit disc with a sky-coloured disc offset over it.
        <span className="relative block size-full rounded-full" style={{ background: `radial-gradient(circle at 35% 35%,#fffbe8,${body.glow})`, boxShadow: glow, WebkitMaskImage: "radial-gradient(circle at 72% 38%,transparent 47%,#000 48.5%)", maskImage: "radial-gradient(circle at 72% 38%,transparent 47%,#000 48.5%)" }} />
      )}
    </span>
  );
}

/** Simple skyline at the bottom: the Haram with the clock tower (Makkah) or the green-domed Prophet's Mosque (Madinah). */
export function Skyline({ location, opacity }: { location: LocationId; opacity: number }) {
  return (
    <svg aria-hidden viewBox="0 0 400 70" preserveAspectRatio="xMidYMax slice" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-16 w-full sm:h-20" style={{ opacity }}>
      <g fill="#000">
        {location === "makkah" ? (
          <>
            {/* clock tower */}
            <path d="M296 70V30h4v-6h3v-8h2l2-10 2 10h2v8h3v6h4v40Z" />
            <circle cx="307" cy="36" r="5" fill="#fde68a" opacity=".55" />
            <path d="M278 70V44h10v26Zm38 0V46h12v24Z" />
            {/* minarets */}
            {[58, 92, 150, 196, 236, 356].map((x) => (
              <path key={x} d={`M${x} 70V30l2-4 2 4v40Z M${x + 1} 26l1-6 1 6Z`} />
            ))}
            {/* mosque body + arches */}
            <path d="M0 70V58h70v-6h120v6h80v12Zm330 0V60h70v10Z" />
          </>
        ) : (
          <>
            {/* green dome + mosque */}
            <path d="M120 70V54h160v16Z" />
            <path d="M176 54a24 22 0 0 1 48 0Z" fill="#0d5c3a" opacity=".9" />
            <path d="M199 32l1-8 1 8Z" />
            <path d="M228 54a14 12 0 0 1 28 0Zm-112 0a14 12 0 0 1 28 0Z" />
            {/* minarets */}
            {[96, 140, 262, 306].map((x) => (
              <path key={x} d={`M${x} 70V24l2.5-5 2.5 5v46Z M${x + 1.5} 19l1-7 1 7Z`} />
            ))}
            <path d="M0 70V62h120v8Zm280 0V62h120v8Z" />
          </>
        )}
      </g>
    </svg>
  );
}

/** Sun or moon for the card's top area (rendered with the skyline, behind the text). */
export function SkyBody({ phase }: { phase: SkyPhase }) {
  const b = SCENES[phase].body;
  return b ? <CelestialBody key={phase} body={b} /> : null;
}

export const skylineOpacity = (phase: SkyPhase) => SCENES[phase].skyline;

/** Animated sky behind the next-prayer card; fades between scenes as the day moves on. */
export function SkyBackdrop({ phase }: { phase: SkyPhase }) {
  const s = SCENES[phase];
  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={phase}
        aria-hidden
        data-sky={phase}
        className="pointer-events-none absolute inset-0 -z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2 }}
        style={{ background: s.sky }}
      >
        {s.horizon ? <div className="absolute inset-0" style={{ background: s.horizon }} /> : null}
        {STARS.slice(0, s.stars).map((st, i) => (
          <span
            key={i}
            className="hc-twinkle absolute rounded-full bg-white"
            style={{ left: st.x, top: st.y, width: st.s, height: st.s, animationDelay: `${st.d}s`, opacity: 0.8 }}
          />
        ))}
        {/* Keeps the text side readable on the brighter skies. */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(0_0_0/.28),rgb(0_0_0/.08)_60%,transparent)]" />
      </motion.div>
    </AnimatePresence>
  );
}
