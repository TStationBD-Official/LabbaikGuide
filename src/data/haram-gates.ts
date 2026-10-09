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
