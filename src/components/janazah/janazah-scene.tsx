"use client";

import { useId } from "react";
import type { Deceased, Pose } from "@/data/guides/janazah";

/*
 * Animated, shaded illustration of a funeral prayer, seen from behind the rows.
 *
 * Out of respect, and following the scholars' caution about images of living beings:
 *  - every figure is drawn from behind, without any face or facial features;
 *  - the deceased is never shown — only a bier with a covered, shrouded form;
 *  - clothing is modest (thobe, ghutra / kufi) and there is no music or sound.
 */

type ArmAngles = { s: number; e: number; fore: number };
// Shoulder & elbow rotation (deg) for the right arm; the left arm is mirrored.
const ARMS: Record<Pose, ArmAngles> = {
  stand: { s: -7, e: 4, fore: 1 },
  raise: { s: -40, e: -153, fore: 1 },
  // Hands folded on the chest are in front of the body — hidden from behind, only the bent elbows show.
  fold: { s: -16, e: 100, fore: 0 },
  salamR: { s: -16, e: 100, fore: 0 },
  salamL: { s: -16, e: 100, fore: 0 },
};

const T = "transform 650ms cubic-bezier(.45,.05,.3,1), opacity 400ms ease";

type Look = { head: "ghutra" | "shemagh" | "kufi"; skin: string; bisht?: boolean };

function Arm({ pose, side, look, gid }: { pose: Pose; side: 1 | -1; look: Look; gid: string }) {
  const a = ARMS[pose];
  const sleeve = look.bisht ? `url(#${gid}-bisht)` : `url(#${gid}-cloth)`;
  return (
    <g transform={`translate(${14 * side} -68) scale(${side} 1)`}>
      <g style={{ transform: `rotate(${a.s}deg)`, transition: T }}>
        <rect x="-4.6" y="-2" width="9.2" height="26" rx="4.6" fill={sleeve} />
        <g transform="translate(0 22)">
          <g style={{ transform: `rotate(${a.e}deg)`, opacity: a.fore, transition: T }}>
            <rect x="-4" y="-1" width="8" height="20" rx="4" fill={sleeve} />
            <rect x="-3" y="17" width="6" height="8.5" rx="3" fill={look.skin} />
            <path d="M-2.4 19.5h4.8" stroke="#000" strokeOpacity=".12" strokeWidth=".8" />
          </g>
        </g>
      </g>
    </g>
  );
}

function Head({ pose, look, gid }: { pose: Pose; look: Look; gid: string }) {
  const turn = pose === "salamR" ? 1 : pose === "salamL" ? -1 : 0;
  return (
    <g style={{ transform: `translateX(${turn * 1.6}px)`, transition: T }}>
      {/* neck */}
      <rect x="-4" y="-79" width="8" height="10" rx="3" fill={look.skin} />
      {/* back of the head (no face is ever drawn) */}
      <circle cx="0" cy="-86" r="9.6" fill={look.head === "kufi" ? "#2a1f17" : look.skin} />
      {/* the cheek line that shows when the head turns for salam — still no features */}
      <path d="M7.6 -91c2.6 3 2.6 8.5-.4 11.5" stroke={look.skin} strokeWidth="3.2" fill="none" strokeLinecap="round" style={{ opacity: turn === 1 ? 1 : 0, transition: T }} />
      <path d="M-7.6 -91c-2.6 3-2.6 8.5.4 11.5" stroke={look.skin} strokeWidth="3.2" fill="none" strokeLinecap="round" style={{ opacity: turn === -1 ? 1 : 0, transition: T }} />
      {look.head === "kufi" ? (
        <path d="M-9.6 -88a9.6 9.6 0 0 1 19.2 0c0 1.2-.6 1.8-1.6 1.8H-8c-1 0-1.6-.6-1.6-1.8Z" fill={`url(#${gid}-kufi)`} />
      ) : (
        <>
          {/* ghutra / shemagh draped over the head and down the back */}
          <path
            d="M-10.6 -88c0-7 4.8-10.6 10.6-10.6S10.6 -95 10.6 -88c0 6 1.8 12 4.6 19.5L0 -64.5l-15.2-4C-12.4 -76-10.6 -82-10.6 -88Z"
            fill={look.head === "shemagh" ? `url(#${gid}-shemagh)` : `url(#${gid}-ghutra)`}
          />
          <path d="M0 -97v31" stroke="#000" strokeOpacity=".08" strokeWidth="1.2" />
          <path d="M-6 -95c-1 8 -3 16 -7 25M6 -95c1 8 3 16 7 25" stroke="#000" strokeOpacity=".07" strokeWidth="1" fill="none" />
          {/* agal (black cord) */}
          <ellipse cx="0" cy="-92.5" rx="9.4" ry="2.6" fill="none" stroke="#1d1d1f" strokeWidth="1.9" />
        </>
      )}
      {/* soft top light on the head */}
      <ellipse cx="-3" cy="-93" rx="5" ry="3" fill="#fff" opacity=".18" />
    </g>
  );
}

export function Figure({ x, y, scale, pose, look, you, gid }: { x: number; y: number; scale: number; pose: Pose; look: Look; you?: boolean; gid: string }) {
  return (
    <g style={{ transform: `translate(${x}px, ${y}px) scale(${scale})`, transition: "transform 900ms cubic-bezier(.45,.05,.3,1)" }}>
      <ellipse cx="0" cy="1" rx="21" ry="4.2" fill={`url(#${gid}-shadow)`} />
      {you ? <ellipse cx="0" cy="1" rx="24" ry="5.4" fill="none" stroke="#d6a84a" strokeWidth="1.6" strokeDasharray="3 2.4" /> : null}
      {/* thobe */}
      <path d="M-15 -70c-3 0-5 2.6-5.4 6L-19.6 -2c0 1.6 1 2.4 2.6 2.4h34c1.6 0 2.6-.8 2.6-2.4L20.4 -64c-.4-3.4-2.4-6-5.4-6Z" fill={`url(#${gid}-cloth)`} />
      <path d="M-6 -60c-.6 18-1 38-1.6 57M7 -58c.4 18 .8 36 1.4 55" stroke="#000" strokeOpacity=".07" strokeWidth="1.4" fill="none" />
      {look.bisht ? (
        <>
          {/* imam's bisht (cloak) with gold trim */}
          <path d="M-17 -70c-4 0-6 3-6.4 7L-23 -4c0 1.6 1 2.6 2.6 2.6h40.8c1.6 0 2.6-1 2.6-2.6L23.4 -63c-.4-4-2.4-7-6.4-7Z" fill={`url(#${gid}-bisht)`} />
          <path d="M-17 -70h34" stroke="#c9a14a" strokeWidth="1.6" />
        </>
      ) : null}
      <Arm pose={pose} side={-1} look={look} gid={gid} />
      <Arm pose={pose} side={1} look={look} gid={gid} />
      <Head pose={pose} look={look} gid={gid} />
    </g>
  );
}

const SKINS = ["#c99a74", "#8d5b3c", "#e0b48f", "#6e4630", "#b98463", "#d8a881"];
const HEADS: Look["head"][] = ["kufi", "shemagh", "ghutra", "kufi", "ghutra", "shemagh", "kufi"];
const look = (i: number): Look => ({ head: HEADS[i % HEADS.length], skin: SKINS[i % SKINS.length] });

/** Where the imam stands along the bier: level with the head of a man, the middle of a woman. */
const BIER = { man: { x0: 112, x1: 252 }, woman: { x0: 112, x1: 252 }, child: { x0: 172, x1: 246 } } as const;
const imamXFor = (d: Deceased) => (d === "woman" ? (BIER.woman.x0 + BIER.woman.x1) / 2 + 4 : BIER[d].x1 - 14);

export function JanazahScene({
  imamPose,
  followerPose,
  deceased,
  saying,
  label,
  youLabel,
}: {
  imamPose: Pose;
  followerPose: Pose;
  deceased: Deceased;
  saying: string | null;
  label: string;
  youLabel: string;
}) {
  const gid = useId().replace(/:/g, "");
  const u = (n: string) => `url(#${gid}-${n})`;
  const bier = BIER[deceased];
  const ix = imamXFor(deceased);
  const row1 = [-112, -44, 44, 112];
  const row2 = [-156, -78, 0, 78, 156];

  return (
    <svg viewBox="0 0 360 214" role="img" aria-label={label} className="block h-auto w-full select-none">
      <defs>
        <linearGradient id={`${gid}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#efe6d6" />
          <stop offset="1" stopColor="#d9ccb5" />
        </linearGradient>
        <linearGradient id={`${gid}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ece4d4" />
          <stop offset="1" stopColor="#f8f4ec" />
        </linearGradient>
        <linearGradient id={`${gid}-arch`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a88a5c" />
          <stop offset="1" stopColor="#c6ab7e" />
        </linearGradient>
        <linearGradient id={`${gid}-cloth`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".55" stopColor="#eef0f2" />
          <stop offset="1" stopColor="#c3c9d1" />
        </linearGradient>
        <linearGradient id={`${gid}-bisht`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9a7048" />
          <stop offset=".5" stopColor="#7a5534" />
          <stop offset="1" stopColor="#523621" />
        </linearGradient>
        <linearGradient id={`${gid}-ghutra`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d7dbe0" />
        </linearGradient>
        <pattern id={`${gid}-check`} width="3" height="3" patternUnits="userSpaceOnUse">
          <rect width="3" height="3" fill="#f4f1ee" />
          <path d="M0 0h1.5v1.5H0zM1.5 1.5H3V3H1.5z" fill="#b3222e" />
        </pattern>
        <linearGradient id={`${gid}-shade`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".15" />
          <stop offset="1" stopColor="#000" stopOpacity=".28" />
        </linearGradient>
        <pattern id={`${gid}-shemagh`} width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill={`url(#${gid}-check)`} />
        </pattern>
        <radialGradient id={`${gid}-kufi`} cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#cfd5dc" />
        </radialGradient>
        <radialGradient id={`${gid}-shadow`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#3b2a14" stopOpacity=".38" />
          <stop offset="1" stopColor="#3b2a14" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${gid}-shroud`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".6" stopColor="#eceff1" />
          <stop offset="1" stopColor="#c4cad0" />
        </linearGradient>
        <linearGradient id={`${gid}-wood`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a5a33" />
          <stop offset="1" stopColor="#5b3a20" />
        </linearGradient>
        <radialGradient id={`${gid}-light`} cx=".5" cy="0" r=".9">
          <stop offset="0" stopColor="#fff6dc" stopOpacity=".7" />
          <stop offset="1" stopColor="#fff6dc" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* back wall with arches and columns of the masjid */}
      <rect width="360" height="80" fill={u("wall")} />
      <g transform="translate(0 -12)">
        {Array.from({ length: 7 }, (_, i) => {
          const cx = 6 + i * 58;
          return (
            <g key={i}>
              <path d={`M${cx - 22} 92V46a22 22 0 0 1 44 0V92Z`} fill="#fbf7ef" opacity=".85" />
              <path d={`M${cx - 22} 92V46a22 22 0 0 1 44 0V92`} fill="none" stroke={u("arch")} strokeWidth="3" />
              <path d={`M${cx - 15} 92V50a15 15 0 0 1 30 0V92`} fill="none" stroke="#c8b08a" strokeWidth="1" opacity=".7" />
              <rect x={cx + 23} y="30" width="12" height="62" fill={u("arch")} opacity=".9" />
              <rect x={cx + 21} y="28" width="16" height="5" rx="1" fill="#9a7c50" />
            </g>
          );
        })}
      </g>
      <rect width="360" height="8" fill="#b99a68" opacity=".55" />

      {/* floor with the saff lines of the carpet */}
      <rect y="80" width="360" height="134" fill={u("floor")} />
      {[86, 102, 128, 166, 212].map((y, i) => (
        <rect key={y} x="0" y={y} width="360" height={1 + i * 0.7} fill="#2f6f5e" opacity=".2" />
      ))}
      <rect width="360" height="214" fill={u("light")} />

      {/* the bier: a wooden frame with the shrouded, covered deceased — no body is depicted */}
      <g transform="translate(0 -14)">
        <ellipse cx={(bier.x0 + bier.x1) / 2} cy="113" rx={(bier.x1 - bier.x0) / 2 + 10} ry="5" fill={u("shadow")} />
        <rect x={bier.x0 + 4} y="104" width="3" height="9" fill="#4a2f19" />
        <rect x={bier.x1 - 7} y="104" width="3" height="9" fill="#4a2f19" />
        <path d={`M${bier.x0 - 4} 100h${bier.x1 - bier.x0 + 8}l-3 5H${bier.x0 - 1}Z`} fill={u("wood")} />
        <path d={`M${bier.x0 - 1} 105h${bier.x1 - bier.x0 + 2}`} stroke="#3c2614" strokeWidth=".8" />
        <path d={`M${bier.x0 + 2} 100c0-7 6-11 14-11h${bier.x1 - bier.x0 - 34}c8 0 16 3 16 11Z`} fill={u("shroud")} />
        <path d={`M${bier.x0 + 2} 100c0-7 6-11 14-11h${bier.x1 - bier.x0 - 34}c8 0 16 3 16 11Z`} fill={u("shade")} opacity=".35" />
        <path d={`M${bier.x0 + 12} 91.5h${bier.x1 - bier.x0 - 30}`} stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity=".9" />
        {/* the three ties of the shroud */}
        {[0.12, 0.5, 0.88].map((f) => {
          const tx = bier.x0 + 6 + (bier.x1 - bier.x0 - 12) * f;
          return <path key={f} d={`M${tx} 89.6v10.4`} stroke="#b9c0c7" strokeWidth="1.6" />;
        })}
      </g>

      {/* imam */}
      <Figure gid={gid} x={ix} y={128} scale={0.57} pose={imamPose} look={{ head: "ghutra", skin: "#b98463", bisht: true }} />

      {/* direction of the salam */}
      {imamPose === "salamR" || imamPose === "salamL" ? (
        <g style={{ transform: `translate(${ix}px, 80px) scale(${imamPose === "salamR" ? 1 : -1}, 1)` }}>
          <path className="hc-say" d="M9 -2c6-3 11-2 15 2" stroke="#0f5132" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path className="hc-say" d="M25.5 -3.5l-.6 6-5.4-2.6Z" fill="#0f5132" />
        </g>
      ) : null}

      {/* what the imam says aloud */}
      {saying ? (
        <g style={{ transform: `translate(${ix}px, 62px)`, transition: "transform 900ms" }}>
          <g className="hc-say">
            <rect x="-36" y="-14" width="72" height="20" rx="10" fill="#0f5132" opacity=".92" />
            <path d="M-4 6l4 5 4-5Z" fill="#0f5132" opacity=".92" />
            <text x="0" y="0.5" textAnchor="middle" fontSize="10.5" fill="#fff" fontFamily="var(--font-arabic-ui), serif" direction="rtl">
              {saying}
            </text>
          </g>
        </g>
      ) : null}

      {/* first row behind the imam — the highlighted one is "you" */}
      {row1.map((dx, i) => (
        <Figure key={`a${i}`} gid={gid} x={ix + dx} y={184} scale={0.66} pose={followerPose} look={look(i)} you={i === 2} />
      ))}
      <g style={{ transform: `translate(${ix + row1[2]}px, 108px)`, transition: "transform 900ms cubic-bezier(.45,.05,.3,1)" }}>
        <rect x="-15" y="-9" width="30" height="13" rx="6.5" fill="#d6a84a" />
        <text x="0" y="0.6" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#1d1606">
          {youLabel}
        </text>
        <path d="M-3 4l3 3.5 3-3.5Z" fill="#d6a84a" />
      </g>
      {/* second row, closest to the viewer */}
      {row2.map((dx, i) => (
        <Figure key={`b${i}`} gid={gid} x={ix + dx} y={244} scale={0.86} pose={followerPose} look={look(i + 3)} />
      ))}

      {/* depth haze at the bottom */}
      <rect y="196" width="360" height="18" fill="#000" opacity=".05" />
    </svg>
  );
}
