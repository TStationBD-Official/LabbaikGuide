"use client";

import { useId } from "react";

/**
 * A shaded dromedary (one hump, as in Arabia) with jointed legs.
 * Walk cycle is a pace — both legs on the same side move together, as camels do:
 * the near-side pair and the far-side pair swing in opposite phase, knees fold on
 * the forward swing, the body rises and dips and the head nods.
 * `light` (0–1) dims and desaturates it for dusk and night.
 */
export function Camel3D({ width = 46, light = 1, delay = 0, saddle = false }: { width?: number; light?: number; delay?: number; saddle?: boolean }) {
  const id = useId().replace(/:/g, "");
  const g = (n: string) => `url(#${id}-${n})`;
  const leg = (x: number, y: number, far: boolean) => (
    <g transform={`translate(${x} ${y})`}>
      <g className={far ? "hc-thigh-b" : "hc-thigh-a"}>
        <path d="M-3.4 0h6.8l-1.4 16h-4Z" fill={far ? g("far") : g("leg")} />
        <circle cx="0" cy="16" r="2.3" fill={far ? "#6a4224" : "#9a6a3c"} />
        <g transform="translate(0 16)">
          <g className={far ? "hc-shin-b" : "hc-shin-a"}>
            <path d="M-1.9 0h3.8l-.6 15h-2.6Z" fill={far ? g("far") : g("leg")} />
            {/* broad padded foot */}
            <path d="M-3.4 14.5h7c1 0 1.6 1.6.6 2.2H-3.8c-1-.6-.6-2.2.4-2.2Z" fill={far ? "#4e311b" : "#6e4728"} />
          </g>
        </g>
      </g>
    </g>
  );
  return (
    <svg
      aria-hidden
      width={width}
      height={width * 0.75}
      viewBox="0 0 120 90"
      className="block overflow-visible"
      style={{ filter: light < 1 ? `brightness(${0.35 + light * 0.65}) saturate(${0.5 + light * 0.5})` : undefined, ["--d" as string]: `${delay}s` }}
    >
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2b57a" />
          <stop offset=".45" stopColor="#c48d52" />
          <stop offset="1" stopColor="#8c5a2e" />
        </linearGradient>
        <radialGradient id={`${id}-hump`} cx=".45" cy=".25" r=".6">
          <stop offset="0" stopColor="#f6d6a3" stopOpacity=".85" />
          <stop offset="1" stopColor="#f6d6a3" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-neck`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d7a76c" />
          <stop offset="1" stopColor="#a87140" />
        </linearGradient>
        <linearGradient id={`${id}-leg`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#b98450" />
          <stop offset=".5" stopColor="#d2a067" />
          <stop offset="1" stopColor="#9d6c3d" />
        </linearGradient>
        <linearGradient id={`${id}-far`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7d5230" />
          <stop offset="1" stopColor="#6a4426" />
        </linearGradient>
        <radialGradient id={`${id}-shadow`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#000" stopOpacity=".35" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="58" cy="88" rx="40" ry="3.2" fill={g("shadow")} />

      {/* far-side legs (behind the body, darker) */}
      {leg(36, 52, true)}
      {leg(74, 50, true)}

      <g className="hc-camel-bob">
        {/* tail */}
        <path d="M24 42c-4 4-5 10-4 15" stroke="#8c5a2e" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M19.6 56.5l-1.6 4 3.6-1.2Z" fill="#5a3a20" />

        {/* body with the single hump */}
        <path
          d="M22 45c-1-9 6-15 15-17 3-9 9-15 17-15 9 0 14 7 16 15 7 1 12 5 13 11 1 7-2 13-8 15-6 2-13 2-20 2H33c-6 0-11-4-11-11Z"
          fill={g("body")}
        />
        <path d="M37 28c3-9 9-15 17-15 9 0 14 7 16 15-9-3-24-3-33 0Z" fill={g("hump")} />
        {/* belly shading */}
        <path d="M30 54c10 3 30 3 46 0-3 3-8 3.5-13 3.5H38c-4 0-6-1-8-3.5Z" fill="#000" opacity=".14" />

        {saddle ? (
          <g>
            {/* saddle blanket with gold trim and tassels */}
            <path d="M40 27c6-3 22-3 28 0l2 14c-10 3-22 3-32 0Z" fill="#9b1c24" />
            <path d="M40 27c6-3 22-3 28 0l.5 3c-7-2.4-22-2.4-29 0Z" fill="#c9a24c" />
            <path d="M38 41c10 3 22 3 32 0" stroke="#c9a24c" strokeWidth="1.4" fill="none" />
            {[42, 48, 54, 60, 66].map((x) => (
              <path key={x} d={`M${x} 42.4v3.2`} stroke="#e0bc63" strokeWidth="1.2" strokeLinecap="round" />
            ))}
            <path d="M47 33h14M47 36h14" stroke="#e7c873" strokeWidth=".8" opacity=".8" />
          </g>
        ) : null}

        {/* neck (down-forward, then up) and head */}
        <g className="hc-camel-nod">
          <path d="M76 35c9 3 13 12 19 13 5 1 7-6 8-16" stroke={g("neck")} strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d="M77 39c8 4 12 11 18 12" stroke="#000" strokeOpacity=".12" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M98 27c2-5 8-7 14-5l6 3c2 1.2 2 4-.2 4.8l-5.6 1.6c-4 1.1-10 1.2-13.6-.6-1.6-.8-1.6-2.4-.6-3.8Z" fill={g("neck")} />
          <path d="M101 22.5l1.2-4 2.4 3.4Z" fill="#8c5a2e" />
          <circle cx="107.5" cy="25.3" r="1.1" fill="#2a1a0e" />
          <path d="M118 28.5c-1.4.4-3 .4-4.4 0" stroke="#5a3a20" strokeWidth=".8" fill="none" strokeLinecap="round" />
          {saddle ? <path d="M109 30c-6 6-12 9-18 10" stroke="#3a2412" strokeWidth=".7" fill="none" /> : null}
        </g>
      </g>

      {/* near-side legs (in front, lit) */}
      {leg(32, 52, false)}
      {leg(70, 50, false)}
    </svg>
  );
}
