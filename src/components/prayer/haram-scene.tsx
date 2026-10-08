"use client";

import { useId } from "react";
import type { LocationId } from "@/config/locations";
import { mixColor, sceneColors, type Sky } from "./sky-backdrop";

/** Pigeon flock: depth (size/opacity), height band, speed and start offset. */
const BIRDS = [
  { top: 16, size: 24, dur: 20, delay: -3, bob: 3.1, op: 0.9 },
  { top: 28, size: 18, dur: 25, delay: -11, bob: 2.6, op: 0.8 },
  { top: 10, size: 15, dur: 29, delay: -19, bob: 3.6, op: 0.7 },
  { top: 38, size: 21, dur: 22, delay: -15, bob: 2.9, op: 0.85 },
  { top: 22, size: 13, dur: 32, delay: -26, bob: 3.3, op: 0.65 },
];
const BIRDS_BY_WAQT: Record<Sky["waqt"], number> = { tahajjud: 0, isha: 0, fajr: 2, duha: 5, dhuhr: 4, asr: 5, maghrib: 3 };
const NIGHT: Sky["waqt"][] = ["tahajjud", "isha", "maghrib", "fajr"];

function Bird({ b, color }: { b: (typeof BIRDS)[number]; color: string }) {
  return (
    // Outer track crosses the card; inner element bobs; the wings flap.
    <span className="hc-fly-x pointer-events-none absolute inset-x-0" style={{ top: `${b.top}%`, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}>
      <span className="hc-fly-y absolute start-[42%] block" style={{ animationDuration: `${b.bob}s`, opacity: b.op }}>
        <svg width={b.size} height={b.size * 0.6} viewBox="0 0 20 12" className="block overflow-visible">
          <g className="hc-flap" style={{ animationDuration: `${0.42 + b.size / 60}s` }}>
            <path d="M0 4 Q5 -1 10 6 Q15 -1 20 4 Q15 2 10 8.5 Q5 2 0 4Z" fill={color} />
          </g>
        </svg>
      </span>
    </span>
  );
}

function Camel({ color, scale = 1, lead = false }: { color: string; scale?: number; lead?: boolean }) {
  return (
    <svg width={34 * scale} height={26 * scale} viewBox="0 0 34 26" className="block overflow-visible" aria-hidden>
      <g fill={color} className="hc-bob">
        {/* body, hump, neck and head */}
        <path d="M5 13c0-4 3-7 7-8 2-3 6-3 8 0 2 1 3 3 4 5l2-4c1-2 3-3 5-2l1 1-1 1h-2l-2 6c-1 2-3 3-5 3H8c-2 0-3-1-3-2Z" />
        <path d="M4 12c-1 1-2 3-1 5" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
        {lead ? <path d="M30 6l3 4" stroke={color} strokeWidth=".6" /> : null}
      </g>
      {/* legs: pairs swing in opposite phase */}
      <g fill={color}>
        <rect className="hc-step-a" x="8" y="15" width="1.6" height="10" rx=".8" />
        <rect className="hc-step-b" x="10.5" y="15" width="1.6" height="10" rx=".8" />
        <rect className="hc-step-b" x="20" y="15" width="1.6" height="10" rx=".8" />
        <rect className="hc-step-a" x="22.5" y="15" width="1.6" height="10" rx=".8" />
      </g>
    </svg>
  );
}

function Palm({ color, flip }: { color: string; flip?: boolean }) {
  return (
    <svg width="30" height="46" viewBox="0 0 30 46" className="block overflow-visible" style={flip ? { transform: "scaleX(-1)" } : undefined} aria-hidden>
      <path d="M15 46c-1-10 0-22 1-30" stroke={color} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <g className="hc-sway" fill={color}>
        <path d="M16 15c-5-6-11-6-15-3 5-1 9 0 15 3Z" />
        <path d="M16 15c4-7 10-8 14-5-5 0-9 1-14 5Z" />
        <path d="M16 15c-3-7-1-12 3-15-1 5-1 9-3 15Z" />
        <path d="M16 15c-6-2-11 1-13 6 4-4 8-5 13-6Z" />
        <path d="M16 15c6-1 10 3 11 8-3-4-7-6-11-8Z" />
        <circle cx="16" cy="16.5" r="1.6" fill="#7a3b12" />
      </g>
    </svg>
  );
}

/** The Haram with the Kaaba and clock tower (Makkah) or the Prophet's Mosque with its Green Dome and umbrellas (Madinah). */
function City({ location, color, night, id }: { location: LocationId; color: string; night: boolean; id: string }) {
  const lights = night ? "#ffd98a" : "transparent";
  return (
    <svg aria-hidden viewBox="0 0 400 100" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-0 h-full w-full">
      <defs>
        <radialGradient id={`${id}-glow`} cx="50%" cy="100%" r="60%">
          <stop offset="0" stopColor="#ffd98a" stopOpacity={night ? 0.32 : 0} />
          <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-dome`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3fa36f" />
          <stop offset="1" stopColor="#14583a" />
        </linearGradient>
      </defs>
      {/* the Haram is lit all night */}
      <rect x="0" y="30" width="400" height="70" fill={`url(#${id}-glow)`} />
      {location === "makkah" ? (
        <g>
          <g fill={color}>
            {/* clock tower */}
            <path d="M288 84V34h6v-8h4v-9h3l2-9 2 9h3v9h4v8h6v50Z" />
            <path d="M302 8V2h1v6Z" />
            <path d="M270 84V50h14v34Zm46 0V52h16v32Z" />
            {/* minarets with balconies */}
            {[62, 104, 146, 234, 352].map((x) => (
              <g key={x}>
                <path d={`M${x} 84V40l2.5-6 2.5 6v44Z`} />
                <rect x={x - 1} y="52" width="7" height="2" />
                <path d={`M${x + 2} 34l.5-6 .5 6Z`} />
              </g>
            ))}
            {/* arcades of the Haram */}
            <path d="M0 84V66h120v-4h140v4h20v18Zm330 0V68h70v16Z" />
          </g>
          {/* arches */}
          <g fill={lights} opacity={night ? 0.55 : 0}>
            {Array.from({ length: 16 }, (_, i) => (
              <path key={i} d={`M${8 + i * 16} 80v-6a3 3 0 0 1 6 0v6Z`} />
            ))}
          </g>
          {/* clock face */}
          <circle cx="303" cy="22" r="4.5" fill="#fde68a" opacity={night ? 0.95 : 0.6} />
          {/* white marble mataf and the Kaaba */}
          <ellipse cx="190" cy="86" rx="70" ry="7" fill="#efe9dc" opacity={night ? 0.5 : 0.35} />
          <g>
            <path d="M178 86V66l12-3 12 3v20Z" fill="#0b0b0b" />
            <path d="M178 66l12-3 12 3-12 2Z" fill="#1d1d1d" />
            <path d="M178 70.5l12 2 12-2v2.4l-12 2-12-2Z" fill="#d6b25e" />
            <path d="M192.5 86v-9h4v9Z" fill="#c9a24c" />
          </g>
        </g>
      ) : (
        <g>
          <g fill={color}>
            {/* minarets */}
            {[70, 128, 270, 330].map((x) => (
              <g key={x}>
                <path d={`M${x} 84V30l3-6 3 6v54Z`} />
                <rect x={x - 1.5} y="46" width="9" height="2.2" />
                <rect x={x - 1} y="62" width="8" height="2" />
                <path d={`M${x + 2.5} 24l.5-7 .5 7Z`} />
              </g>
            ))}
            <path d="M0 84V68h400v16Z" />
            {/* silver dome */}
            <path d="M232 68a10 9 0 0 1 20 0Z" />
          </g>
          {/* the Green Dome */}
          <path d="M180 68a20 19 0 0 1 40 0Z" fill={`url(#${id}-dome)`} />
          <path d="M199.4 49l.6-9 .6 9Z" fill="#d6b25e" />
          <circle cx="200" cy="39" r="1.6" fill="#d6b25e" />
          {/* courtyard umbrellas: open by day, folded at night */}
          <g fill="#efe9dc" opacity={night ? 0.55 : 0.85}>
            {[22, 44, 66, 96, 118, 150, 250, 284, 306, 340, 362, 384].map((x) => (
              <g key={x} className="hc-umbrella" style={{ transformOrigin: `${x}px 72px`, transform: night ? "scaleX(.18)" : "scaleX(1)" }}>
                <path d={`M${x - 10} 74Q${x} 66 ${x + 10} 74Q${x} 71 ${x - 10} 74Z`} />
                <rect x={x - 0.5} y="72" width="1" height="12" />
              </g>
            ))}
          </g>
          <g fill={lights} opacity={night ? 0.5 : 0}>
            {Array.from({ length: 22 }, (_, i) => (
              <rect key={i} x={6 + i * 18} y="76" width="4" height="4" rx="1" />
            ))}
          </g>
        </g>
      )}
    </svg>
  );
}

/** Animated Haramain scene for the bottom of the next-prayer card. */
export function HaramScene({ location, sky }: { location: LocationId; sky: Sky }) {
  const id = useId().replace(/:/g, "");
  const c = sceneColors(sky);
  const night = NIGHT.includes(sky.waqt) && !(sky.waqt === "fajr" && sky.f > 0.6) && !(sky.waqt === "maghrib" && sky.f < 0.25);
  const birds = BIRDS.slice(0, BIRDS_BY_WAQT[sky.waqt]);
  const birdColor = mixColor(c.city, "#000000", 0.2);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* birds over the whole card */}
      {birds.map((b, i) => (
        <Bird key={i} b={b} color={birdColor} />
      ))}
      {/* shooting star on dark nights */}
      {sky.waqt === "tahajjud" || sky.waqt === "isha" ? <span className="hc-shoot absolute start-[18%] top-[14%] block h-px w-16 rounded-full" /> : null}

      <div className="absolute inset-x-0 bottom-0 h-28 sm:h-32">
        <City location={location} color={c.city} night={night} id={id} />
        {/* dunes in front (stretched so their crest is always at the same height) */}
        <svg viewBox="0 0 400 40" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-9 w-full sm:h-10">
          <path d="M0 22C60 8 110 10 170 18s120 12 170 2 50-6 60-6V40H0Z" fill={c.sandFar} />
          <path d="M0 30c50-10 100-12 150-6s110 14 160 6 70-8 90-6V40H0Z" fill={c.sand} />
        </svg>
        {location === "madinah" ? (
          <>
            <span className="absolute bottom-3 start-[2%] block">
              <Palm color={c.palm} />
            </span>
            <span className="absolute bottom-2 end-[3%] block">
              <Palm color={c.palm} flip />
            </span>
          </>
        ) : null}
        {/* camel caravan walking across the dunes */}
        <span className="hc-caravan absolute inset-x-0 bottom-[12px] block h-8">
          <span className="absolute bottom-0 start-[38%] flex items-end gap-2">
            <Camel color={c.camel} scale={0.95} />
            <Camel color={c.camel} scale={1.05} />
            <Camel color={c.camel} scale={1.15} lead />
          </span>
        </span>
      </div>
    </div>
  );
}
