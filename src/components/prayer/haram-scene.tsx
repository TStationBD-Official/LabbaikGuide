"use client";

import { useId, type CSSProperties, type ReactNode } from "react";
import type { LocationId } from "@/config/locations";
import { mixColor, sceneColors, type Sky } from "./sky-backdrop";
import { Camel3D, SleepingCamel } from "./camel";

/** Pigeon flock: depth (size/opacity), height band, speed and start offset. */
const BIRDS = [
  { top: 16, size: 24, dur: 20, delay: -3, bob: 3.1, op: 0.9 },
  { top: 28, size: 18, dur: 25, delay: -11, bob: 2.6, op: 0.8 },
  { top: 10, size: 15, dur: 29, delay: -19, bob: 3.6, op: 0.7 },
  { top: 38, size: 21, dur: 22, delay: -15, bob: 2.9, op: 0.85 },
  { top: 22, size: 13, dur: 32, delay: -26, bob: 3.3, op: 0.65 },
];
const BIRDS_BY_WAQT: Record<Sky["waqt"], number> = { tahajjud: 0, isha: 0, fajr: 2, duha: 5, dhuhr: 4, asr: 5, maghrib: 3 };

/** Dark enough that the city is lit and the camels rest. */
export function isNight(sky: Sky) {
  return sky.waqt === "isha" || sky.waqt === "tahajjud" || (sky.waqt === "maghrib" && sky.f > 0.45) || (sky.waqt === "fajr" && sky.f < 0.5);
}

/** Parallax layer: moves with the card tilt by `depth` px (set via --px/--py on the card). */
function Layer({ depth, className, children, style }: { depth: number; className?: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      className={className}
      style={{ ...style, transform: `translate3d(calc(var(--px, 0) * ${depth}px), calc(var(--py, 0) * ${depth * 0.5}px), 0)` }}
    >
      {children}
    </div>
  );
}

function Bird({ b, color }: { b: (typeof BIRDS)[number]; color: string }) {
  return (
    <span className="hc-fly-x pointer-events-none absolute inset-x-0" style={{ top: `${b.top}%`, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}>
      <span className="hc-fly-y absolute start-[42%] block" style={{ animationDuration: `${b.bob}s`, opacity: b.op }}>
        <svg width={b.size} height={b.size * 0.6} viewBox="0 0 20 12" className="block overflow-visible">
          <g className="hc-flap" style={{ animationDuration: `${0.42 + b.size / 60}s` }}>
            <path d="M0 4 Q5 -1 10 6 Q15 -1 20 4 Q15 2 10 8.5 Q5 2 0 4Z" fill={color} />
            <path d="M8.6 5.6 Q10 4 11.4 5.6 Q10 7.6 8.6 5.6Z" fill="#000" opacity=".25" />
          </g>
        </svg>
      </span>
    </span>
  );
}

function Palm({ color, flip }: { color: string; flip?: boolean }) {
  return (
    <svg width="30" height="46" viewBox="0 0 30 46" className="block overflow-visible" style={flip ? { transform: "scaleX(-1)" } : undefined} aria-hidden>
      <defs>
        <linearGradient id="hc-trunk" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".18" />
          <stop offset="1" stopColor="#000" stopOpacity=".3" />
        </linearGradient>
      </defs>
      <path d="M15 46c-1-10 0-22 1-30" stroke={color} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M15 46c-1-10 0-22 1-30" stroke="url(#hc-trunk)" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <g className="hc-sway" fill={color}>
        <path d="M16 15c-5-6-11-6-15-3 5-1 9 0 15 3Z" />
        <path d="M16 15c4-7 10-8 14-5-5 0-9 1-14 5Z" />
        <path d="M16 15c-3-7-1-12 3-15-1 5-1 9-3 15Z" />
        <path d="M16 15c-6-2-11 1-13 6 4-4 8-5 13-6Z" />
        <path d="M16 15c6-1 10 3 11 8-3-4-7-6-11-8Z" />
        <path d="M16 15c4-7 10-8 14-5-5 0-9 1-14 5Z" fill="#fff" opacity=".12" />
        <circle cx="16" cy="16.5" r="1.6" fill="#7a3b12" />
      </g>
    </svg>
  );
}

/** The Haram (Kaaba, clock tower) or the Prophet's Mosque (Green Dome, umbrellas), shaded for depth. */
function City({ location, color, night, id }: { location: LocationId; color: string; night: boolean; id: string }) {
  const lights = night ? "#ffd98a" : "transparent";
  const cyl = `url(#${id}-cyl)`;
  return (
    <svg aria-hidden viewBox="0 0 400 100" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-0 h-full w-full">
      <defs>
        <radialGradient id={`${id}-glow`} cx="50%" cy="100%" r="60%">
          <stop offset="0" stopColor="#ffd98a" stopOpacity={night ? 0.32 : 0} />
          <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
        </radialGradient>
        {/* rounded shading for minarets: lit from the left */}
        <linearGradient id={`${id}-cyl`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".22" />
          <stop offset=".45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".35" />
        </linearGradient>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".12" />
          <stop offset="1" stopColor="#000" stopOpacity=".25" />
        </linearGradient>
        <radialGradient id={`${id}-dome`} cx=".38" cy=".3" r=".75">
          <stop offset="0" stopColor="#7fd3a2" />
          <stop offset=".45" stopColor="#2f9461" />
          <stop offset="1" stopColor="#0f4a30" />
        </radialGradient>
        <radialGradient id={`${id}-sdome`} cx=".38" cy=".3" r=".75">
          <stop offset="0" stopColor="#d9dde3" />
          <stop offset="1" stopColor="#6b7480" />
        </radialGradient>
        <linearGradient id={`${id}-umb`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#cfc6b4" />
        </linearGradient>
      </defs>
      <rect x="0" y="30" width="400" height="70" fill={`url(#${id}-glow)`} />
      {location === "makkah" ? (
        <g>
          {/* clock tower: lit front, shaded right side */}
          <g fill={color}>
            <path d="M288 84V34h6v-8h4v-9h3l2-9 2 9h3v9h4v8h6v50Z" />
            <path d="M302 8V2h1v6Z" />
            <path d="M270 84V50h14v34Zm46 0V52h16v32Z" />
          </g>
          <path d="M310 84V34h8v50Zm-4-58h4v8h-4Zm-1-9h3v9h-3Zm22 67V52h5v32Zm-34 0V50h4v34Z" fill="#000" opacity=".3" />
          <path d="M288 84V34h3v50Z" fill="#fff" opacity=".1" />
          {/* minarets: rounded */}
          {[62, 104, 146, 234, 352].map((x) => (
            <g key={x}>
              <path d={`M${x} 84V40l2.5-6 2.5 6v44Z`} fill={color} />
              <path d={`M${x} 84V40l2.5-6 2.5 6v44Z`} fill={cyl} />
              <rect x={x - 1} y="52" width="7" height="2" fill={color} />
              <path d={`M${x + 2} 34l.5-6 .5 6Z`} fill={color} />
            </g>
          ))}
          {/* arcades */}
          <path d="M0 84V66h120v-4h140v4h20v18Zm330 0V68h70v16Z" fill={color} />
          <path d="M0 84V66h120v-4h140v4h20v18Zm330 0V68h70v16Z" fill={`url(#${id}-wall)`} />
          <g fill={lights} opacity={night ? 0.55 : 0}>
            {Array.from({ length: 16 }, (_, i) => (
              <path key={i} d={`M${8 + i * 16} 80v-6a3 3 0 0 1 6 0v6Z`} />
            ))}
          </g>
          <circle cx="303" cy="22" r="4.5" fill="#fde68a" opacity={night ? 0.95 : 0.6} />
          {/* white marble mataf */}
          <ellipse cx="190" cy="86" rx="70" ry="7" fill="#efe9dc" opacity={night ? 0.5 : 0.35} />
          <ellipse cx="186" cy="85" rx="40" ry="3.5" fill="#fff" opacity={night ? 0.25 : 0.2} />
          {/* the Kaaba in perspective: front, right side and roof; the gold band wraps the corner */}
          <g>
            <path d="M176 66h22v20h-22Z" fill="#161616" />
            <path d="M198 66l9-4v20l-9 4Z" fill="#050505" />
            <path d="M176 66l9-4h22l-9 4Z" fill="#2c2c2c" />
            <path d="M176 70.6h22v2.6h-22Z" fill="#d6b25e" />
            <path d="M198 70.6l9-4v2.6l-9 4Z" fill="#9c7e3a" />
            <path d="M176 70.6h22v.7h-22Z" fill="#f3d98c" opacity=".7" />
            <path d="M190.5 86v-9.5h4v9.5Z" fill="#c9a24c" />
            <path d="M190.5 76.5h4v1h-4Z" fill="#f3d98c" />
            {/* Hijr Ismail (the low curved wall) */}
            <path d="M198.5 85.5c6 0 12-1.5 13-4" stroke="#e8e2d4" strokeWidth="1.2" fill="none" opacity=".7" />
          </g>
        </g>
      ) : (
        <g>
          {[70, 128, 270, 330].map((x) => (
            <g key={x}>
              <path d={`M${x} 84V30l3-6 3 6v54Z`} fill={color} />
              <path d={`M${x} 84V30l3-6 3 6v54Z`} fill={cyl} />
              <rect x={x - 1.5} y="46" width="9" height="2.2" fill={color} />
              <rect x={x - 1} y="62" width="8" height="2" fill={color} />
              <path d={`M${x + 2.5} 24l.5-7 .5 7Z`} fill={color} />
            </g>
          ))}
          <path d="M0 84V68h400v16Z" fill={color} />
          <path d="M0 84V68h400v16Z" fill={`url(#${id}-wall)`} />
          {/* silver dome */}
          <path d="M232 68a10 9 0 0 1 20 0Z" fill={`url(#${id}-sdome)`} opacity=".85" />
          {/* the Green Dome, lit like a sphere */}
          <path d="M180 68a20 19 0 0 1 40 0Z" fill={`url(#${id}-dome)`} />
          <path d="M184 64c2-8 8-12 14-13-4 3-7 8-8 13Z" fill="#fff" opacity=".18" />
          <path d="M199.4 49l.6-9 .6 9Z" fill="#d6b25e" />
          <circle cx="200" cy="39" r="1.6" fill="#f3d98c" />
          {/* courtyard umbrellas: open by day, folded at night */}
          <g opacity={night ? 0.6 : 0.95}>
            {[22, 44, 66, 96, 118, 150, 250, 284, 306, 340, 362, 384].map((x) => (
              <g key={x} className="hc-umbrella" style={{ transformOrigin: `${x}px 72px`, transform: night ? "scaleX(.18)" : "scaleX(1)" }}>
                <path d={`M${x - 10} 74Q${x} 66 ${x + 10} 74Q${x} 71 ${x - 10} 74Z`} fill={`url(#${id}-umb)`} />
                <path d={`M${x} 68.6Q${x + 5} 70 ${x + 10} 74Q${x + 4} 72 ${x} 72Z`} fill="#000" opacity=".12" />
                <rect x={x - 0.5} y="72" width="1" height="12" fill="#efe9dc" />
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

/** Animated Haramain scene for the bottom of the next-prayer card, in parallax layers. */
export function HaramScene({ location, sky }: { location: LocationId; sky: Sky }) {
  const id = useId().replace(/:/g, "");
  const c = sceneColors(sky);
  const night = isNight(sky);
  const birds = BIRDS.slice(0, BIRDS_BY_WAQT[sky.waqt]);
  const birdColor = mixColor(c.city, "#000000", 0.2);
  const sandLight = mixColor(c.sand, "#ffffff", 0.25);
  const farLight = mixColor(c.sandFar, "#ffffff", 0.2);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <Layer depth={4} className="absolute inset-0">
        {birds.map((b, i) => (
          <Bird key={i} b={b} color={birdColor} />
        ))}
        {sky.waqt === "tahajjud" || sky.waqt === "isha" ? <span className="hc-shoot absolute start-[18%] top-[14%] block h-px w-16 rounded-full" /> : null}
      </Layer>

      <div className="absolute inset-x-0 bottom-0 h-28 sm:h-32">
        <Layer depth={5} className="absolute -inset-x-3 inset-y-0">
          <City location={location} color={c.city} night={night} id={id} />
        </Layer>
        <Layer depth={9} className="absolute -inset-x-4 bottom-0 h-9 sm:h-10">
          <svg viewBox="0 0 400 40" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <defs>
              <linearGradient id={`${id}-far`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={farLight} />
                <stop offset="1" stopColor={c.sandFar} />
              </linearGradient>
              <linearGradient id={`${id}-near`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={sandLight} />
                <stop offset=".5" stopColor={c.sand} />
                <stop offset="1" stopColor={mixColor(c.sand, "#000000", 0.25)} />
              </linearGradient>
            </defs>
            <path d="M0 22C60 8 110 10 170 18s120 12 170 2 50-6 60-6V40H0Z" fill={`url(#${id}-far)`} />
            <path d="M0 22C60 8 110 10 170 18s120 12 170 2 50-6 60-6" stroke="#fff" strokeOpacity=".22" strokeWidth=".8" fill="none" />
            <path d="M0 30c50-10 100-12 150-6s110 14 160 6 70-8 90-6V40H0Z" fill={`url(#${id}-near)`} />
            <path d="M0 30c50-10 100-12 150-6s110 14 160 6 70-8 90-6" stroke="#fff" strokeOpacity=".28" strokeWidth=".8" fill="none" />
          </svg>
        </Layer>
        {location === "madinah" ? (
          <Layer depth={11} className="absolute inset-0">
            <span className="absolute bottom-3 start-[2%] block">
              <Palm color={c.palm} />
            </span>
            <span className="absolute bottom-2 end-[3%] block">
              <Palm color={c.palm} flip />
            </span>
          </Layer>
        ) : null}
        <Layer depth={13} className="absolute inset-0">
          {night ? (
            // Resting for the night: kneeling side by side, asleep.
            <span className="absolute bottom-[5px] start-[3%] flex items-end">
              <SleepingCamel width={50} light={c.light} delay={-1.3} />
              <SleepingCamel width={56} light={c.light} delay={-2.6} zzz />
              <SleepingCamel width={60} light={c.light} delay={0} saddle />
            </span>
          ) : (
            <span className="hc-caravan absolute inset-x-0 bottom-[8px] block h-11">
              <span className="absolute bottom-0 start-[36%] flex items-end gap-1">
                <Camel3D width={44} light={c.light} delay={-0.5} />
                <Camel3D width={50} light={c.light} delay={-1.1} />
                <Camel3D width={56} light={c.light} delay={0} saddle />
              </span>
            </span>
          )}
        </Layer>
      </div>
    </div>
  );
}
