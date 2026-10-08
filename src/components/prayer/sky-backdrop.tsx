"use client";

import { AnimatePresence, motion } from "motion/react";
import type { PrayerDay } from "@/features/prayer/times";
import type { LocationId } from "@/config/locations";

/** The prayer-time window we are in (Duha = from sunrise until Dhuhr; Tahajjud = last third of the night). */
export type Waqt = "tahajjud" | "fajr" | "duha" | "dhuhr" | "asr" | "maghrib" | "isha";
export type Sky = { waqt: Waqt; f: number };

/**
 * Which waqt it is at the selected city and how far through it (0 → 1),
 * straight from that day's prayer times — the sky follows the prayer times.
 */
export function skyAt(day: PrayerDay, now: Date, lastThird: Date | null): Sky {
  const at = (n: PrayerDay["prayers"][number]["name"]) => day.prayers.find((p) => p.name === n)?.adhan.getTime() ?? NaN;
  const t = now.getTime();
  const fajr = at("fajr"), sunrise = at("sunrise"), dhuhr = at("dhuhr"), asr = at("asr"), maghrib = at("maghrib"), isha = at("isha");
  const lt = lastThird?.getTime() ?? NaN;
  const span = (waqt: Waqt, a: number, b: number): Sky => ({ waqt, f: b > a ? Math.min(1, Math.max(0, (t - a) / (b - a))) : 0 });
  if (t < fajr) {
    // After midnight: Isha until the last third, then Tahajjud until Fajr.
    if (Number.isFinite(lt) && t >= lt) return span("tahajjud", lt, fajr);
    return span("isha", isha - 86_400_000, Number.isFinite(lt) ? lt : fajr);
  }
  if (t < sunrise) return span("fajr", fajr, sunrise);
  if (t < dhuhr) return span("duha", sunrise, dhuhr);
  if (t < asr) return span("dhuhr", dhuhr, asr);
  if (t < maghrib) return span("asr", asr, maghrib);
  if (t < isha) return span("maghrib", maghrib, isha);
  // Isha until tonight's last third (tomorrow's date for the night calc); before it is known, assume ~3 h.
  const end = Number.isFinite(lt) && lt > t ? lt : isha + 6 * 3_600_000;
  return span("isha", isha, end);
}

type Stops = [string, string, string];
type Body = { kind: "sun" | "moon"; x: [number, number]; top: [number, number]; size: number; glow: string };
type Scene = {
  /** Sky colours (top, middle, bottom) at the start and the end of the waqt; blended in between. */
  from: Stops;
  to: Stops;
  stars: [number, number];
  /** Warm light on the horizon, strength at start/end of the waqt. */
  glow?: { color: string; at: number; strength: [number, number] };
  body?: Body;
  skyline: number;
};

/** All colours stay deep enough for white text and the gold ring. */
const SCENES: Record<Waqt, Scene> = {
  // Last third of the night: darkest, most stars, crescent.
  tahajjud: {
    from: ["#05091b", "#0f1436", "#1b1a42"],
    to: ["#081030", "#18204c", "#2a2752"],
    stars: [34, 30],
    body: { kind: "moon", x: [55, 58], top: [12, 16], size: 24, glow: "#fde68a" },
    skyline: 0.55,
  },
  // True dawn → sunrise: stars fade, the horizon slowly brightens.
  fajr: {
    from: ["#0b1736", "#252e5e", "#4f3f6c"],
    to: ["#22426f", "#7b5577", "#c9805f"],
    stars: [14, 0],
    glow: { color: "255 175 125", at: 50, strength: [0.15, 0.6] },
    skyline: 0.5,
  },
  // Sunrise → Dhuhr: warm early light turning into clear blue, the sun climbs.
  duha: {
    from: ["#28497a", "#4f6c90", "#b07a58"],
    to: ["#0a4a74", "#16658f", "#2b7ea3"],
    stars: [0, 0],
    glow: { color: "255 200 130", at: 46, strength: [0.45, 0] },
    body: { kind: "sun", x: [44, 50], top: [34, 6], size: 30, glow: "#fff1b8" },
    skyline: 0.38,
  },
  // Dhuhr → Asr: sun past its highest point, deep clear sky.
  dhuhr: {
    from: ["#07507a", "#0b6a96", "#1781a8"],
    to: ["#0d5476", "#2a6f8a", "#5a8a95"],
    stars: [0, 0],
    body: { kind: "sun", x: [52, 57], top: [-6, 6], size: 36, glow: "#fffbe0" },
    skyline: 0.35,
  },
  // Asr → Maghrib: golden light, deepening to orange as sunset nears.
  asr: {
    from: ["#185070", "#4f6a72", "#8f7a48"],
    to: ["#3a2350", "#9a3c46", "#d06a3a"],
    stars: [0, 0],
    glow: { color: "255 150 80", at: 60, strength: [0, 0.55] },
    body: { kind: "sun", x: [58, 62], top: [12, 60], size: 32, glow: "#ffcf7a" },
    skyline: 0.45,
  },
  // Maghrib → Isha: the sun has set; red afterglow fades, first stars appear.
  maghrib: {
    from: ["#2c1b48", "#7a2f4e", "#c0553f"],
    to: ["#141a44", "#2c2a58", "#4a3158"],
    stars: [0, 12],
    glow: { color: "255 120 80", at: 58, strength: [0.6, 0.05] },
    skyline: 0.55,
  },
  // Isha → last third: night deepens, crescent and stars.
  isha: {
    from: ["#141a44", "#2a2a58", "#433058"],
    to: ["#06142a", "#0b2342", "#0f3049"],
    stars: [14, 26],
    body: { kind: "moon", x: [56, 55], top: [20, 14], size: 22, glow: "#fef3c7" },
    skyline: 0.5,
  },
};

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, f: number) => {
  const [x, y] = [hex(a), hex(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * f)).join(" ")})`;
};
const lerp = ([a, b]: [number, number], f: number) => a + (b - a) * f;

/** Fixed pseudo-random star field (same on server and client). */
const STARS = Array.from({ length: 34 }, (_, i) => {
  const r = (n: number) => (Math.sin(i * 97.13 + n * 13.7) + 1) / 2;
  return { x: `${(r(1) * 100).toFixed(1)}%`, y: `${(r(2) * 62).toFixed(1)}%`, s: r(3) > 0.82 ? 2.4 : r(3) > 0.45 ? 1.6 : 1.1, d: (r(4) * 4).toFixed(2) };
});

/** Sky behind the next-prayer card: cross-fades between waqts, blends gradually within one. */
export function SkyBackdrop({ sky }: { sky: Sky }) {
  const s = SCENES[sky.waqt];
  const f = sky.f;
  const background = `linear-gradient(180deg,${mix(s.from[0], s.to[0], f)} 0%,${mix(s.from[1], s.to[1], f)} 55%,${mix(s.from[2], s.to[2], f)} 100%)`;
  const stars = Math.round(lerp(s.stars, f));
  const glow = s.glow ? lerp(s.glow.strength, f) : 0;
  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={sky.waqt}
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2 }}
        style={{ background }}
      >
        {s.glow && glow > 0.01 ? (
          <div className="absolute inset-0" style={{ background: `radial-gradient(80% 50% at ${s.glow.at}% 100%,rgb(${s.glow.color}/${glow.toFixed(2)}),transparent 70%)` }} />
        ) : null}
        {STARS.slice(0, stars).map((st, i) => (
          <span key={i} className="hc-twinkle absolute rounded-full bg-white" style={{ left: st.x, top: st.y, width: st.s, height: st.s, animationDelay: `${st.d}s` }} />
        ))}
        {/* Keeps the text side readable on the brighter skies. */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(0_0_0/.3),rgb(0_0_0/.08)_60%,transparent)]" />
      </motion.div>
    </AnimatePresence>
  );
}

/** Sun or crescent in the card's top area, moving through its waqt (behind the text, in front of the sky). */
export function SkyBody({ sky }: { sky: Sky }) {
  const b = SCENES[sky.waqt].body;
  if (!b) return null;
  const x = lerp(b.x, sky.f);
  const top = lerp(b.top, sky.f);
  const shadow = `0 0 ${b.size * 0.6}px ${b.size * 0.25}px ${b.glow}66, 0 0 ${b.size * 1.6}px ${b.size * 0.8}px ${b.glow}26`;
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute -z-10 -translate-x-1/2 transition-[inset-inline-start,top] duration-1000 rtl:translate-x-1/2"
      style={{ insetInlineStart: `${x}%`, top, width: b.size, height: b.size }}
    >
      {b.kind === "sun" ? (
        <span className="block size-full rounded-full" style={{ background: `radial-gradient(circle at 40% 38%,#fffdf2,${b.glow} 70%)`, boxShadow: shadow }} />
      ) : (
        // Crescent: a lit disc with an offset disc masked out.
        <span
          className="block size-full rounded-full"
          style={{
            background: `radial-gradient(circle at 35% 35%,#fffbe8,${b.glow})`,
            boxShadow: shadow,
            WebkitMaskImage: "radial-gradient(circle at 72% 38%,transparent 47%,#000 48.5%)",
            maskImage: "radial-gradient(circle at 72% 38%,transparent 47%,#000 48.5%)",
          }}
        />
      )}
    </span>
  );
}

export const skylineOpacity = (sky: Sky) => SCENES[sky.waqt].skyline;

/** Simple skyline: the Haram with the clock tower (Makkah) or the green-domed Prophet's Mosque (Madinah). */
export function Skyline({ location, opacity }: { location: LocationId; opacity: number }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 70"
      preserveAspectRatio="xMidYMax slice"
      className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-16 w-full sm:h-20"
      style={{ opacity }}
    >
      <g fill="#000">
        {location === "makkah" ? (
          <>
            <path d="M296 70V30h4v-6h3v-8h2l2-10 2 10h2v8h3v6h4v40Z" />
            <circle cx="307" cy="36" r="5" fill="#fde68a" opacity=".55" />
            <path d="M278 70V44h10v26Zm38 0V46h12v24Z" />
            {[58, 92, 150, 196, 236, 356].map((x) => (
              <path key={x} d={`M${x} 70V30l2-4 2 4v40Z M${x + 1} 26l1-6 1 6Z`} />
            ))}
            <path d="M0 70V58h70v-6h120v6h80v12Zm330 0V60h70v10Z" />
          </>
        ) : (
          <>
            <path d="M120 70V54h160v16Z" />
            <path d="M176 54a24 22 0 0 1 48 0Z" fill="#0d5c3a" opacity=".9" />
            <path d="M199 32l1-8 1 8Z" />
            <path d="M228 54a14 12 0 0 1 28 0Zm-112 0a14 12 0 0 1 28 0Z" />
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
