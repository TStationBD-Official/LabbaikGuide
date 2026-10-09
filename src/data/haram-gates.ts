import type { LocationId } from "@/config/locations";

/**
 * Gates whose position was checked by hand (on site or against imagery).
 * These override OpenStreetMap: an OSM gate with the same number is dropped and this one is shown.
 * Only add a gate here with a real, checked coordinate — never an estimate.
 */
export type VerifiedGate = {
  num: number;
  lat: number;
  lon: number;
  nameEn?: string;
  nameAr?: string;
  role?: "main" | "entrance" | "exit" | "emergency" | "service";
  /** How the position was checked, e.g. "on-site pin by app owner". */
  source: string;
  /** YYYY-MM-DD */
  checked: string;
};

export const VERIFIED_GATES: Record<LocationId, VerifiedGate[]> = {
  makkah: [],
  madinah: [],
};

/**
 * Corrections to OpenStreetMap gate numbers, checked against the General Authority for the Care of the
 * Two Holy Mosques. Its list of the five main gates (Sabq, 28 Apr 2025): King Abdulaziz 1, Al-Fath 45,
 * Umrah 62, King Fahd 79, King Abdullah 100.
 */
export type GateCorrection = { osmId: string; num: number; source: string };
export const GATE_CORRECTIONS: Record<LocationId, GateCorrection[]> = {
  makkah: [
    { osmId: "n4318154227", num: 45, source: "Al-Fath Gate is No. 45 (General Authority for the Two Holy Mosques, 2025); OSM had 30" },
    { osmId: "n4318154228", num: 62, source: "Umrah Gate is No. 62 (General Authority for the Two Holy Mosques, 2025); OSM had 40" },
  ],
  madinah: [],
};

/**
 * OSM gate numbers in these ranges follow a different, unofficial sequence (they contradict the official
 * numbers above), so they are shown without a number rather than with a wrong one.
 */
export const UNRELIABLE_REFS: Record<LocationId, { from: number; to: number }[]> = {
  makkah: [{ from: 26, to: 44 }],
  madinah: [],
};
